/**
 * @file Gemineko Hive 开放主题包引擎与社区主题商店管理器（零外部依赖）
 * 负责第三方 .gemineko-theme.json 主题包的安全消毒校验、GitHub Raw 远程拉取、
 * 本地原子化安装/卸载、社区商店目录合并以及当前配置的一键打包导出。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_META } from '../meta/brand.mjs';
import { ALLOWED_PRESETS, ALLOWED_THEME_INTENSITIES, ROLE_PALETTES, THEME_PRESETS } from './host-theme-config.mjs';

const STORE_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_BUNDLED_REGISTRY_PATH = resolve(STORE_DIR, '..', '..', 'themes', 'registry.json');
const PACK_ID_RE = /^[a-z0-9][a-z0-9-]{1,47}$/;
const OFFICIAL_BUILTIN_IDS = new Set(['official-gemineko', 'official-carbon-obsidian']);
const TOKEN_KEY_RE = /^--[a-zA-Z0-9-]{1,48}$/;
const SAFE_COLOR_RE = /^(?:#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.\s,%\/]+\)|hsla?\(\s*[\d.\s,%deg\/]+\))$/;
const ALLOWED_SCHEMES = new Set(['light', 'dark', 'auto']);
const ALLOWED_REMOTE_HOSTS = new Set([
  'raw.githubusercontent.com',
  'gist.githubusercontent.com',
  'github.com',
]);
const MAX_CUSTOM_CSS_LEN = 12_288;
const MAX_REMOTE_JSON_BYTES = 256 * 1024;
const REGISTRY_CACHE_TTL_MS = 6 * 3600 * 1000;

function sanitizeHttpsUrl(rawUrl) {
  const s = String(rawUrl || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return '';
    if (u.username || u.password) return '';
    return u.toString();
  } catch {
    return '';
  }
}

function isSafeTokenOrCssValue(val) {
  if (typeof val !== 'string') return false;
  const s = val.trim();
  if (!s || s.length > 360) return false;
  if (/[;{}]/.test(s)) return false;
  if (/(?:<\/style|javascript:|expression\s*\(|@import|behavior\s*:|-moz-binding|data-has-browser-hole)/i.test(s)) {
    return false;
  }
  const urlMatches = s.match(/url\s*\([^)]*\)/gi) || [];
  for (const m of urlMatches) {
    if (!/^url\s*\(\s*['"]?https:\/\//i.test(m)) return false;
  }
  return true;
}

/**
 * 对第三方主题包 customCss 执行严格 XSS / 注入消毒，剥离危险规则与宿主挖孔破坏。
 * @param {string} rawCss
 * @returns {{ css: string, warnings: string[] }}
 */
export function sanitizeCustomCss(rawCss) {
  const warnings = [];
  if (typeof rawCss !== 'string' || !rawCss.trim()) {
    return { css: '', warnings };
  }
  let css = rawCss.replace(/\0/g, '');
  if (css.length > MAX_CUSTOM_CSS_LEN) {
    css = css.slice(0, MAX_CUSTOM_CSS_LEN);
    warnings.push(`customCss 超过 ${MAX_CUSTOM_CSS_LEN} 字符限制，已安全截断`);
  }

  const rules = [
    { re: /@import\b[^;\n]*;?/gi, msg: '已拦截并移除 @import 规则', rep: '' },
    { re: /<\/style[^>]*>/gi, msg: '已拦截并移除 </style> 闭合标签', rep: '' },
    { re: /javascript\s*:/gi, msg: '已拦截 javascript: 伪协议', rep: 'blocked:' },
    { re: /expression\s*\([^)]*\)/gi, msg: '已拦截 IE expression() 动态脚本', rep: 'none' },
    { re: /(?:-moz-binding|behavior)\s*:[^;}\n]*;?/gi, msg: '已拦截行为绑定规则', rep: '' },
    { re: /\[[^\]]*data-has-browser-hole[^\]]*\][^{}]*\{[^}]*\}/gi, msg: '已拦截触及 browser-hole 透明窗格的选择器', rep: '' },
    { re: /data-has-browser-hole/gi, msg: '已移除敏感属性名 data-has-browser-hole', rep: 'data-gk-ignored' },
  ];

  for (const rule of rules) {
    if (rule.re.test(css)) {
      css = css.replace(rule.re, rule.rep);
      warnings.push(rule.msg);
    }
  }

  // 仅放行 https:// 的外部 url(...)，阻断 data:/http:/file:/相对路径注入
  let strippedUrl = false;
  css = css.replace(/url\s*\(([^)]*)\)/gi, (full, inner) => {
    const cleaned = String(inner || '').trim().replace(/^['"]|['"]$/g, '');
    if (/^https:\/\//i.test(cleaned)) {
      return `url("${cleaned.replace(/"/g, '')}")`;
    }
    strippedUrl = true;
    return 'none';
  });
  if (strippedUrl) {
    warnings.push('已拦截非 HTTPS 的 url() 资源引用');
  }

  return { css: css.trim(), warnings };
}

/**
 * 校验并清洗第三方主题包 JSON（Schema v1）。
 * @param {any} rawPack
 * @param {{ allowOfficial?: boolean }} [options]
 * @returns {{ ok: boolean, pack?: any, warnings?: string[], error?: string }}
 */
export function sanitizeThemePack(rawPack, options = {}) {
  const { allowOfficial = false } = options;
  if (!rawPack || typeof rawPack !== 'object' || Array.isArray(rawPack)) {
    return { ok: false, error: '主题包必须是合法 JSON 对象' };
  }

  const schemaVer = rawPack.schemaVersion === undefined ? 1 : Number(rawPack.schemaVersion);
  if (schemaVer !== 1) {
    return { ok: false, error: `不支持的 schemaVersion: ${rawPack.schemaVersion}（当前支持 1）` };
  }

  const id = String(rawPack.id || '').trim().toLowerCase();
  if (!PACK_ID_RE.test(id)) {
    return { ok: false, error: '主题 ID 须为 2~48 位小写字母、数字或连字符（如 kyoto-sakura-glass）' };
  }
  if (!allowOfficial && OFFICIAL_BUILTIN_IDS.has(id)) {
    return { ok: false, error: `${id} 为官方保留主题 ID，请更换自定义 ID` };
  }

  const name = String(rawPack.name || '').replace(/[\r\n\t]/g, ' ').trim().slice(0, 64);
  if (!name) {
    return { ok: false, error: '主题包缺少有效的 name 名称' };
  }

  const warnings = [];
  const scheme = ALLOWED_SCHEMES.has(rawPack.scheme) ? rawPack.scheme : 'auto';
  const rawIntensity = rawPack.themeIntensity === 'balanced' ? 'optical-neko' : rawPack.themeIntensity;
  const themeIntensity = ALLOWED_THEME_INTENSITIES.has(rawIntensity) ? rawIntensity : 'optical-neko';
  const basePreset = ALLOWED_PRESETS.has(rawPack.basePreset)
    ? rawPack.basePreset
    : (scheme === 'dark' ? 'carbon-obsidian' : scheme === 'light' ? 'nebula-day' : 'auto');

  let authorName = BRAND_META.author.name;
  let authorUrl = '';
  if (typeof rawPack.author === 'string') {
    authorName = rawPack.author.trim().slice(0, 48) || 'Community';
  } else if (rawPack.author && typeof rawPack.author === 'object') {
    authorName = String(rawPack.author.name || '').trim().slice(0, 48) || 'Community';
    if (rawPack.author.url) {
      authorUrl = sanitizeHttpsUrl(rawPack.author.url);
      if (!authorUrl) warnings.push('author.url 非有效 HTTPS 链接，已忽略');
    }
  }

  const tags = Array.isArray(rawPack.tags)
    ? rawPack.tags.map((t) => String(t || '').trim().slice(0, 20)).filter(Boolean).slice(0, 6)
    : [];

  const swatches = Array.isArray(rawPack.swatches)
    ? rawPack.swatches.map((c) => String(c || '').trim()).filter((c) => SAFE_COLOR_RE.test(c)).slice(0, 6)
    : [];

  const tokens = {};
  if (rawPack.tokens && typeof rawPack.tokens === 'object' && !Array.isArray(rawPack.tokens)) {
    for (const [k, v] of Object.entries(rawPack.tokens)) {
      if (!TOKEN_KEY_RE.test(k)) {
        warnings.push(`已跳过非法 CSS 变量名: ${k}`);
        continue;
      }
      if (!isSafeTokenOrCssValue(String(v ?? ''))) {
        warnings.push(`已拦截不安全的变量值: ${k}`);
        continue;
      }
      tokens[k] = String(v).trim();
    }
  }

  const aurora = Array.isArray(rawPack.aurora)
    ? rawPack.aurora.map((c) => String(c || '').trim()).filter((c) => isSafeTokenOrCssValue(c)).slice(0, 3)
    : [];

  const rawAcc = rawPack.accent && typeof rawPack.accent === 'object' ? rawPack.accent : {};
  const accent = {};
  for (const key of ['primary', 'accent2', 'accent3', 'glow', 'gradient']) {
    if (typeof rawAcc[key] === 'string' && rawAcc[key].trim()) {
      if (isSafeTokenOrCssValue(rawAcc[key])) {
        accent[key] = rawAcc[key].trim();
      } else {
        warnings.push(`已拦截不安全的 accent.${key} 值`);
      }
    }
  }

  const cssRes = sanitizeCustomCss(rawPack.customCss || '');
  if (cssRes.warnings.length > 0) {
    warnings.push(...cssRes.warnings);
  }

  const homepage = rawPack.homepage ? sanitizeHttpsUrl(rawPack.homepage) : '';
  if (rawPack.homepage && !homepage) {
    warnings.push('homepage 非有效 HTTPS 链接，已忽略');
  }

  const pack = {
    schemaVersion: 1,
    id,
    name,
    version: String(rawPack.version || '1.0.0').trim().slice(0, 24) || '1.0.0',
    scheme,
    ...(allowOfficial && rawPack.builtin ? { builtin: true } : {}),
    ...(allowOfficial && rawPack.official ? { official: true } : {}),
    author: {
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    },
    license: String(rawPack.license || 'MIT').trim().slice(0, 32) || 'MIT',
    description: String(rawPack.description || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 240),
    tags,
    swatches: swatches.length > 0
      ? swatches
      : [accent.primary || '#8B5CF6', accent.accent2 || '#EC4899', accent.accent3 || '#38BDF8', scheme === 'dark' ? '#0F101A' : '#FFFFFF'],
    basePreset,
    themeIntensity,
    tokens,
    aurora,
    accent,
    customCss: cssRes.css,
    watermarkText: String(rawPack.watermarkText || '').replace(/[\r\n\t]/g, ' ').trim().slice(0, 48),
    ...(homepage ? { homepage } : {}),
  };

  return { ok: true, pack, warnings };
}

/**
 * 严格校验并规范化远端主题包 URL，仅放行 GitHub / Gist HTTPS，防内网 SSRF。
 * @param {string} rawUrl
 * @returns {{ ok: boolean, url?: string, error?: string }}
 */
export function normalizeRemoteThemeUrl(rawUrl) {
  const input = String(rawUrl || '').trim();
  if (!input) {
    return { ok: false, error: '请输入主题包 GitHub Raw JSON URL' };
  }
  let u;
  try {
    u = new URL(input);
  } catch {
    return { ok: false, error: 'URL 格式无效' };
  }
  if (u.protocol !== 'https:') {
    return { ok: false, error: '安全限制：仅允许 HTTPS 协议的主题链接' };
  }
  if (u.username || u.password || (u.port && u.port !== '443')) {
    return { ok: false, error: '安全限制：禁止携带认证信息或非标准端口' };
  }
  const host = u.hostname.toLowerCase();
  if (!ALLOWED_REMOTE_HOSTS.has(host)) {
    return { ok: false, error: `安全限制：仅允许 raw.githubusercontent.com、gist.githubusercontent.com 或 github.com，拒绝 ${host}` };
  }
  if (host === 'github.com') {
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 5 && parts[2] === 'blob') {
      const [owner, repo, , branch, ...rest] = parts;
      return {
        ok: true,
        url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rest.join('/')}`,
      };
    }
    return { ok: false, error: 'github.com 链接须指向具体的 /blob/<branch>/<file>.json 文件' };
  }
  return { ok: true, url: u.toString() };
}

/**
 * 解析已安装社区主题包本地持久化目录。
 * @param {string} [customDir]
 * @returns {string}
 */
export function resolveThemePacksDir(customDir) {
  if (customDir) return path.resolve(customDir);
  const envData = process.env.ANTIGRAVITY_EXECUTABLE_DATA_DIR;
  if (envData) {
    return path.join(path.resolve(envData), 'installed-themes');
  }
  return path.join(os.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive', 'installed-themes');
}

/**
 * 创建社区主题商店 & 主题包管理器。
 * @param {{ packsDir?: string, registryPath?: string, fetchImpl?: Function, disableNetwork?: boolean }} [options]
 */
export function createThemePackManager(options = {}) {
  const packsDir = resolveThemePacksDir(options.packsDir);
  const registryPath = options.registryPath ? path.resolve(options.registryPath) : DEFAULT_BUNDLED_REGISTRY_PATH;
  const fetchFn = options.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  const disableNetwork = Boolean(options.disableNetwork);

  let remoteRegistryCache = {
    fetchedAt: 0,
    themes: null,
    source: 'bundled',
  };

  function loadBundledRegistry() {
    if (!existsSync(registryPath)) {
      return [];
    }
    try {
      const raw = JSON.parse(readFileSync(registryPath, 'utf8'));
      const list = Array.isArray(raw?.themes) ? raw.themes : [];
      const out = [];
      for (const item of list) {
        const res = sanitizeThemePack(item, { allowOfficial: true });
        if (res.ok) out.push(res.pack);
      }
      return out;
    } catch {
      return [];
    }
  }

  function listInstalled() {
    if (!existsSync(packsDir)) return [];
    const out = [];
    for (const fileName of readdirSync(packsDir)) {
      if (!fileName.endsWith('.json')) continue;
      const fullPath = path.join(packsDir, fileName);
      try {
        const raw = JSON.parse(readFileSync(fullPath, 'utf8'));
        const res = sanitizeThemePack(raw, { allowOfficial: false });
        if (res.ok) {
          out.push({ ...res.pack, installed: true, source: 'local' });
        }
      } catch {
        continue;
      }
    }
    return out;
  }

  async function getCommunityRegistry({ forceRefresh = false } = {}) {
    const bundled = loadBundledRegistry();
    const now = Date.now();
    let remoteThemes = null;
    let source = 'bundled';

    if (!disableNetwork && fetchFn) {
      const cacheFresh = !forceRefresh && remoteRegistryCache.themes && (now - remoteRegistryCache.fetchedAt < REGISTRY_CACHE_TTL_MS);
      if (cacheFresh) {
        remoteThemes = remoteRegistryCache.themes;
        source = 'github-cache';
      } else {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        try {
          const resp = await fetchFn(BRAND_META.registryRawUrl, {
            signal: ctrl.signal,
            headers: {
              Accept: 'application/json',
              'User-Agent': `gemineko-hive/${BRAND_META.version}`,
            },
          });
          if (resp.ok) {
            const text = await resp.text();
            if (Buffer.byteLength(text, 'utf8') <= MAX_REMOTE_JSON_BYTES * 2) {
              const parsed = JSON.parse(text);
              const rawList = Array.isArray(parsed?.themes) ? parsed.themes : [];
              const validated = [];
              for (const item of rawList) {
                const res = sanitizeThemePack(item, { allowOfficial: true });
                if (res.ok) validated.push(res.pack);
              }
              if (validated.length > 0) {
                remoteThemes = validated;
                source = 'github-live';
                remoteRegistryCache = { fetchedAt: now, themes: validated, source };
              }
            }
          }
        } catch {
          if (remoteRegistryCache.themes) {
            remoteThemes = remoteRegistryCache.themes;
            source = 'github-stale-cache';
          }
        } finally {
          clearTimeout(timer);
        }
      }
    }

    const baseList = remoteThemes || bundled;
    const installedList = listInstalled();
    const installedMap = new Map(installedList.map((p) => [p.id, p]));
    const mergedMap = new Map();

    for (const item of baseList) {
      const isOfficial = OFFICIAL_BUILTIN_IDS.has(item.id);
      const installedLocal = installedMap.get(item.id);
      mergedMap.set(item.id, {
        ...(installedLocal || item),
        official: Boolean(item.official || isOfficial),
        builtin: Boolean(item.builtin || isOfficial),
        installed: Boolean(isOfficial || installedLocal),
        inRegistry: true,
        source: isOfficial ? 'official' : (installedLocal ? 'installed' : source),
      });
    }

    for (const localItem of installedList) {
      if (!mergedMap.has(localItem.id)) {
        mergedMap.set(localItem.id, {
          ...localItem,
          official: false,
          builtin: false,
          installed: true,
          inRegistry: false,
          source: 'local',
        });
      }
    }

    return {
      ok: true,
      source,
      registry: [...mergedMap.values()],
      installed: installedList,
    };
  }

  function getPackById(packId) {
    const id = String(packId || '').trim().toLowerCase();
    if (!id) return null;
    if (!OFFICIAL_BUILTIN_IDS.has(id) && PACK_ID_RE.test(id)) {
      const localPath = path.join(packsDir, `${id}.json`);
      if (existsSync(localPath)) {
        try {
          const parsed = JSON.parse(readFileSync(localPath, 'utf8'));
          const res = sanitizeThemePack(parsed, { allowOfficial: false });
          if (res.ok) return { ...res.pack, installed: true };
        } catch {
          /* ignore */
        }
      }
    }
    const cachedList = remoteRegistryCache.themes || [];
    const fromCache = cachedList.find((t) => t.id === id);
    if (fromCache) return fromCache;
    return loadBundledRegistry().find((t) => t.id === id) || null;
  }

  function installPack(rawPack) {
    const res = sanitizeThemePack(rawPack, { allowOfficial: false });
    if (!res.ok) return res;
    mkdirSync(packsDir, { recursive: true });
    const targetPath = path.join(packsDir, `${res.pack.id}.json`);
    const tmpPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmpPath, JSON.stringify(res.pack, null, 2), 'utf8');
    renameSync(tmpPath, targetPath);
    return {
      ok: true,
      pack: { ...res.pack, installed: true, source: 'local' },
      warnings: res.warnings || [],
    };
  }

  async function installFromUrl(rawUrl) {
    const norm = normalizeRemoteThemeUrl(rawUrl);
    if (!norm.ok) return norm;
    if (disableNetwork || !fetchFn) {
      return { ok: false, error: '当前处于离线模式或 fetch 不可用，无法拉取远程主题包' };
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const resp = await fetchFn(norm.url, {
        signal: ctrl.signal,
        headers: {
          Accept: 'application/json, text/plain',
          'User-Agent': `gemineko-hive/${BRAND_META.version}`,
        },
      });
      if (!resp.ok) {
        return { ok: false, error: `拉取主题失败（HTTP ${resp.status}）` };
      }
      const text = await resp.text();
      if (Buffer.byteLength(text, 'utf8') > MAX_REMOTE_JSON_BYTES) {
        return { ok: false, error: '安全限制：远程主题 JSON 体积超过 256 KB 上限' };
      }
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { ok: false, error: '远程文件内容不是合法 JSON' };
      }
      const installed = installPack(parsed);
      if (!installed.ok) return installed;
      return { ...installed, fetchedUrl: norm.url };
    } catch (err) {
      return { ok: false, error: `拉取远程主题异常: ${err?.message || err}` };
    } finally {
      clearTimeout(timer);
    }
  }

  function uninstallPack(packId) {
    const id = String(packId || '').trim().toLowerCase();
    if (!PACK_ID_RE.test(id)) {
      return { ok: false, error: '非法的主题 ID' };
    }
    if (OFFICIAL_BUILTIN_IDS.has(id)) {
      return { ok: false, error: '官方内置主题不允许卸载' };
    }
    const targetPath = path.join(packsDir, `${id}.json`);
    if (!existsSync(targetPath)) {
      return { ok: false, error: `本地未安装主题 ${id}` };
    }
    rmSync(targetPath, { force: true });
    return { ok: true, id };
  }

  function exportThemePack(currentConfig, meta = {}) {
    const cfg = currentConfig && typeof currentConfig === 'object' ? currentConfig : {};
    const rawId = String(meta.id || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    const id = PACK_ID_RE.test(rawId) && !OFFICIAL_BUILTIN_IDS.has(rawId) ? rawId : `my-gemineko-theme-${Date.now().toString(36).slice(-4)}`;
    const activeRole = ROLE_PALETTES[cfg.accentMode] || ROLE_PALETTES.neon;
    const presetObj = THEME_PRESETS[cfg.preset] || THEME_PRESETS['nebula-day'];
    const scheme = cfg.preset === 'auto' ? 'auto' : (presetObj?.scheme || 'light');

    const candidate = {
      schemaVersion: 1,
      id,
      name: String(meta.name || `${activeRole.label.split('·')[0].trim()} 定制主题`).trim().slice(0, 64),
      version: String(meta.version || '1.0.0').trim().slice(0, 24) || '1.0.0',
      scheme: ALLOWED_SCHEMES.has(meta.scheme) ? meta.scheme : scheme,
      author: {
        name: String(meta.authorName || BRAND_META.author.name).trim().slice(0, 48) || 'Community',
        ...(meta.authorUrl ? { url: meta.authorUrl } : {}),
      },
      license: String(meta.license || 'MIT').trim().slice(0, 32) || 'MIT',
      description: String(meta.description || '基于 Gemineko Hive 主题引擎创作与导出的开源主题包。').trim().slice(0, 240),
      tags: Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : ['社区创作', scheme === 'dark' ? '深色' : '浅色'],
      swatches: presetObj?.swatches || [activeRole.primary, activeRole.accent2, activeRole.accent3, '#FFFFFF'],
      basePreset: ALLOWED_PRESETS.has(cfg.preset) ? cfg.preset : 'auto',
      themeIntensity: ALLOWED_THEME_INTENSITIES.has(cfg.themeIntensity) ? cfg.themeIntensity : 'optical-neko',
      tokens: cfg.activeThemePack?.tokens || {},
      aurora: [activeRole.aurora1, activeRole.aurora2, activeRole.aurora3],
      accent: {
        primary: activeRole.primary,
        accent2: activeRole.accent2,
        accent3: activeRole.accent3,
        glow: activeRole.glow,
        gradient: activeRole.gradient,
      },
      customCss: typeof meta.customCss === 'string' ? meta.customCss : (cfg.activeThemePack?.customCss || ''),
      watermarkText: String(meta.watermarkText || `${id} · Powered by Gemineko Hive`).slice(0, 48),
      homepage: BRAND_META.repoUrl,
    };

    const res = sanitizeThemePack(candidate, { allowOfficial: false });
    if (!res.ok) return res;

    const exportedPack = {
      ...res.pack,
      engine: BRAND_META.engineName,
      engineVersion: BRAND_META.version,
      engineUrl: BRAND_META.repoUrl,
      copyright: BRAND_META.copyrightLine,
    };
    return {
      ok: true,
      pack: exportedPack,
      filename: `${exportedPack.id}.gemineko-theme.json`,
      submitUrl: BRAND_META.submitThemeUrl,
      warnings: res.warnings || [],
    };
  }

  return {
    packsDir,
    registryPath,
    loadBundledRegistry,
    getCommunityRegistry,
    listInstalled,
    getPackById,
    installPack,
    installFromUrl,
    uninstallPack,
    exportThemePack,
  };
}
