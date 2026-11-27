/**
 * @file Gemineko Hive v0.5.0 原生宿主主题配置中心、调色板注册表与壁纸路径安全校验。
 * 零外部依赖，负责：
 * 1. 4 套耐看基底配色预设 + 5 位哈基米角色动态强调色调色板；
 * 2. 严格白名单配置清洗与默认值合并；
 * 3. 壁纸路径白名单校验（拦截 UNC、设备路径、目录穿越与敏感凭据目录）；
 * 4. 原子化持久化配置存储。
 */

import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const ALLOWED_PRESETS = new Set([
  'auto',
  'nebula-day',
  'cream-paper',
  'starry-nest',
  'carbon-obsidian',
]);

export const ALLOWED_ACCENT_MODES = new Set([
  'follow-role',
  'neon',
  'hydrogen',
  'carbon',
  'claude',
  'gpt',
  'off',
]);

export const ALLOWED_MOTION_LEVELS = new Set(['standard', 'subtle', 'off']);
export const ALLOWED_CORNER_RADIUS = new Set(['compact', 'soft', 'round']);
export const ALLOWED_WALLPAPER_MODES = new Set([
  'off',
  'builtin-starry',
  'builtin-aurora',
  'custom',
]);

export const WALLPAPER_MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/** 严格对应 5 位角色三视图配色的动态强调色板 */
export const ROLE_PALETTES = {
  neon: {
    id: 'neon',
    label: 'Neon · 炫彩哈基米',
    primary: '#3B82F6',
    accent2: '#EC4899',
    accent3: '#22D3EE',
    glow: 'rgba(59,130,246,0.28)',
    gradient: 'linear-gradient(120deg,#3b82f6,#a855f7,#ec4899,#22d3ee)',
  },
  hydrogen: {
    id: 'hydrogen',
    label: 'Hydrogen · 原教旨 Gemini 本体',
    primary: '#8B5CF6',
    accent2: '#F472B6',
    accent3: '#60A5FA',
    glow: 'rgba(139,92,246,0.26)',
    gradient: 'linear-gradient(120deg,#60a5fa,#a78bfa,#f472b6)',
  },
  carbon: {
    id: 'carbon',
    label: 'Carbon · 五彩斑斓的黑',
    primary: '#6366F1',
    accent2: '#F43F5E',
    accent3: '#F59E0B',
    glow: 'rgba(99,102,241,0.28)',
    gradient: 'linear-gradient(120deg,#1e1b4b,#6366f1,#ec4899,#f59e0b)',
  },
  claude: {
    id: 'claude',
    label: 'Claude · 橘发大小姐',
    primary: '#F97316',
    accent2: '#F59E0B',
    accent3: '#FDBA74',
    glow: 'rgba(249,115,22,0.26)',
    gradient: 'linear-gradient(120deg,#ea580c,#f97316,#fbbf24)',
  },
  gpt: {
    id: 'gpt',
    label: 'GPT · 白紫小龙娘',
    primary: '#A855F7',
    accent2: '#C084FC',
    accent3: '#818CF8',
    glow: 'rgba(168,85,247,0.26)',
    gradient: 'linear-gradient(120deg,#c4b5fd,#a855f7,#818cf8)',
  },
};

/** 4 套耐看基底主题（覆盖 Antigravity 原生 CSS 变量） */
export const THEME_PRESETS = {
  'nebula-day': {
    id: 'nebula-day',
    name: '星云冷白',
    scheme: 'light',
    badge: '冷调星云浅色',
    swatches: ['#F7F8FC', '#EEF1F9', '#3B82F6', '#8B5CF6'],
    vars: {
      '--background': '#F7F8FC',
      '--foreground': '#141726',
      '--sidebar': '#EEF1F9',
      '--sidebar-secondary': 'rgba(20, 23, 38, 0.075)',
      '--sidebar-muted': 'rgba(20, 23, 38, 0.042)',
      '--content': '#F9FAFE',
      '--card': '#FFFFFF',
      '--card-border': 'rgba(99, 102, 241, 0.14)',
      '--border': 'rgba(99, 102, 241, 0.12)',
      '--shell': '#EEF1F9',
      '--glass': 'rgba(255, 255, 255, 0.90)',
      '--glass-border': 'rgba(99, 102, 241, 0.16)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.98)',
      '--onyx-frame': '#F2F4FB',
      '--onyx-well': 'rgba(20, 23, 38, 0.055)',
      '--onyx-raised': '#FFFFFF',
      '--onyx-selected': 'rgba(99, 102, 241, 0.11)',
      '--onyx-key': '#FFFFFF',
      '--secondary': 'rgba(20, 23, 38, 0.06)',
      '--secondary-foreground': '#373D54',
      '--muted': 'rgba(20, 23, 38, 0.04)',
      '--muted-foreground': '#646C89',
      '--placeholder': '#8A92AE',
      '--home-glow': 'rgba(99, 102, 241, 0.14)',
      '--editor-selection-background': 'rgba(99, 102, 241, 0.24)',
      '--editor-comment-selection-background': 'rgba(99, 102, 241, 0.15)',
      '--editor-code-block-background': '#EFF2FA',
    },
  },
  'cream-paper': {
    id: 'cream-paper',
    name: '奶油暖纸',
    scheme: 'light',
    badge: '暖奶油护眼纸感',
    swatches: ['#FAF6F0', '#F2EBE0', '#D97706', '#EA580C'],
    vars: {
      '--background': '#FAF6F0',
      '--foreground': '#231D18',
      '--sidebar': '#F2EBE0',
      '--sidebar-secondary': 'rgba(35, 29, 24, 0.075)',
      '--sidebar-muted': 'rgba(35, 29, 24, 0.042)',
      '--content': '#FCF9F4',
      '--card': '#FFFDF9',
      '--card-border': 'rgba(180, 130, 80, 0.18)',
      '--border': 'rgba(180, 130, 80, 0.14)',
      '--shell': '#F2EBE0',
      '--glass': 'rgba(255, 253, 249, 0.92)',
      '--glass-border': 'rgba(180, 130, 80, 0.20)',
      '--glass-highlight': 'rgba(255, 253, 249, 0.98)',
      '--onyx-frame': '#F5EFE6',
      '--onyx-well': 'rgba(35, 29, 24, 0.055)',
      '--onyx-raised': '#FFFDF9',
      '--onyx-selected': 'rgba(217, 119, 6, 0.12)',
      '--onyx-key': '#FFFDF9',
      '--secondary': 'rgba(35, 29, 24, 0.06)',
      '--secondary-foreground': '#4A3E35',
      '--muted': 'rgba(35, 29, 24, 0.04)',
      '--muted-foreground': '#7A6C60',
      '--placeholder': '#9D8E80',
      '--home-glow': 'rgba(234, 88, 12, 0.12)',
      '--editor-selection-background': 'rgba(217, 119, 6, 0.22)',
      '--editor-comment-selection-background': 'rgba(217, 119, 6, 0.14)',
      '--editor-code-block-background': '#F3ECE1',
    },
  },
  'starry-nest': {
    id: 'starry-nest',
    name: '星空猫窝',
    scheme: 'dark',
    badge: '午夜星云紫蓝深色',
    swatches: ['#0F101A', '#0A0B13', '#8B5CF6', '#EC4899'],
    vars: {
      '--background': '#0F101A',
      '--foreground': '#F1F5F9',
      '--sidebar': '#0A0B13',
      '--sidebar-secondary': 'rgba(241, 245, 249, 0.08)',
      '--sidebar-muted': 'rgba(241, 245, 249, 0.045)',
      '--content': '#131524',
      '--card': '#191C2E',
      '--card-border': 'rgba(167, 139, 250, 0.18)',
      '--border': 'rgba(167, 139, 250, 0.14)',
      '--shell': '#0A0B13',
      '--glass': 'rgba(25, 28, 46, 0.88)',
      '--glass-border': 'rgba(167, 139, 250, 0.24)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.08)',
      '--onyx-frame': '#121422',
      '--onyx-well': 'rgba(0, 0, 0, 0.30)',
      '--onyx-raised': '#1F233A',
      '--onyx-selected': 'rgba(139, 92, 246, 0.22)',
      '--onyx-key': '#1E2238',
      '--secondary': 'rgba(241, 245, 249, 0.075)',
      '--secondary-foreground': '#CBD5E1',
      '--muted': 'rgba(241, 245, 249, 0.045)',
      '--muted-foreground': '#94A3B8',
      '--placeholder': '#64748B',
      '--home-glow': 'rgba(139, 92, 246, 0.22)',
      '--editor-selection-background': 'rgba(139, 92, 246, 0.32)',
      '--editor-comment-selection-background': 'rgba(139, 92, 246, 0.2)',
      '--editor-code-block-background': '#16192B',
    },
  },
  'carbon-obsidian': {
    id: 'carbon-obsidian',
    name: '碳晶黑曜',
    scheme: 'dark',
    badge: '高对比黑曜炭晶深色',
    swatches: ['#0A0B0E', '#07080A', '#6366F1', '#F59E0B'],
    vars: {
      '--background': '#0A0B0E',
      '--foreground': '#F4F4F6',
      '--sidebar': '#07080A',
      '--sidebar-secondary': 'rgba(244, 244, 246, 0.075)',
      '--sidebar-muted': 'rgba(244, 244, 246, 0.04)',
      '--content': '#0E1015',
      '--card': '#151821',
      '--card-border': 'rgba(255, 255, 255, 0.10)',
      '--border': 'rgba(255, 255, 255, 0.085)',
      '--shell': '#07080A',
      '--glass': 'rgba(21, 24, 33, 0.90)',
      '--glass-border': 'rgba(255, 255, 255, 0.13)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.06)',
      '--onyx-frame': '#0D0F14',
      '--onyx-well': 'rgba(0, 0, 0, 0.36)',
      '--onyx-raised': '#1A1D28',
      '--onyx-selected': 'rgba(99, 102, 241, 0.22)',
      '--onyx-key': '#1B1E28',
      '--secondary': 'rgba(244, 244, 246, 0.07)',
      '--secondary-foreground': '#D4D4D8',
      '--muted': 'rgba(244, 244, 246, 0.04)',
      '--muted-foreground': '#A1A1AA',
      '--placeholder': '#71717A',
      '--home-glow': 'rgba(99, 102, 241, 0.18)',
      '--editor-selection-background': 'rgba(99, 102, 241, 0.30)',
      '--editor-comment-selection-background': 'rgba(99, 102, 241, 0.18)',
      '--editor-code-block-background': '#12151E',
    },
  },
};

export const DEFAULT_HOST_THEME_CONFIG = {
  enabled: true,
  preset: 'auto',
  accentMode: 'follow-role',
  focusMode: false,
  motionLevel: 'standard',
  cornerRadius: 'soft',
  ambientIntensity: 75,
  linkages: {
    roleSwitchAurora: true,
    composerBreathGlow: true,
    errorHissShake: true,
    taskFinishConfetti: true,
    pokeBurst: true,
    nightLamp: true,
    nightLampPreview: false,
  },
  workbench: {
    pawOutline: true,
    codeBlockFold: true,
    contextMenu: true,
    smoothScroll: true,
  },
  wallpaper: {
    mode: 'off',
    filePath: '',
    opacity: 0.22,
    blur: 4,
    scrim: 0.35,
  },
  updatedAt: 0,
};

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function asBool(val, fallback) {
  return typeof val === 'boolean' ? val : fallback;
}

/**
 * 校验本地壁纸文件路径：
 * - 拒绝 UNC（\\server\share）、设备前缀（\\?\、\\.\）、相对路径及 .. 遍历；
 * - 拦截敏感凭据目录（.ssh / .aws / .gnupg / .gemini/antigravity）；
 * - 仅允许白名单图片/视频扩展名且必须是真实存在的普通文件。
 * @param {string} rawPath
 * @returns {{ ok: boolean, path: string, ext?: string, mime?: string, isVideo?: boolean, size?: number, error?: string }}
 */
export function validateWallpaperFilePath(rawPath) {
  const trimmed = String(rawPath || '').trim().replace(/^["']+|["']+$/g, '');
  if (!trimmed) {
    return { ok: false, path: '', error: '壁纸路径为空' };
  }
  if (trimmed.startsWith('\\\\') || trimmed.startsWith('//')) {
    return { ok: false, path: '', error: '安全限制：拒绝 UNC 网络路径或设备路径' };
  }
  if (/[\0<>|?*]/.test(trimmed)) {
    return { ok: false, path: '', error: '路径包含非法字符' };
  }
  if (!path.isAbsolute(trimmed)) {
    return { ok: false, path: '', error: '壁纸必须使用本机绝对路径' };
  }
  const normalized = path.normalize(trimmed);
  const segs = normalized.split(/[\\/]+/).filter(Boolean).map((s) => s.toLowerCase());
  if (segs.includes('..')) {
    return { ok: false, path: '', error: '安全限制：禁止目录穿越路径' };
  }

  const ext = path.extname(normalized).toLowerCase();
  const mime = WALLPAPER_MIME_MAP[ext];
  if (!mime) {
    return { ok: false, path: '', error: `不支持的媒体格式: ${ext || '无扩展名'}` };
  }

  let real = normalized;
  try {
    if (!existsSync(normalized)) {
      return { ok: false, path: '', error: '指定的壁纸文件不存在' };
    }
    real = realpathSync(normalized);
  } catch (err) {
    return { ok: false, path: '', error: err?.message || '无法访问壁纸文件' };
  }

  const realLow = real.toLowerCase().replace(/\\/g, '/');
  const blockedPatterns = [
    '/.ssh/',
    '/.aws/',
    '/.gnupg/',
    '/.gemini/antigravity/',
    '/appdata/roaming/antigravity/',
    '/windows/system32/',
  ];
  if (blockedPatterns.some((pat) => realLow.includes(pat))) {
    return { ok: false, path: '', error: '安全限制：禁止读取受保护系统或凭据目录' };
  }

  try {
    const st = statSync(real);
    if (!st.isFile()) {
      return { ok: false, path: '', error: '目标路径不是普通文件' };
    }
    return {
      ok: true,
      path: real,
      ext,
      mime,
      isVideo: mime.startsWith('video/'),
      size: st.size,
    };
  } catch (err) {
    return { ok: false, path: '', error: err?.message || '读取壁纸文件元信息失败' };
  }
}

/**
 * 清洗并合并宿主主题配置，严格校验全部枚举、布尔与数值范围。
 * @param {any} raw
 * @param {any} [base]
 * @returns {typeof DEFAULT_HOST_THEME_CONFIG}
 */
export function sanitizeHostThemeConfig(raw, base = DEFAULT_HOST_THEME_CONFIG) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const b = base && typeof base === 'object' ? base : DEFAULT_HOST_THEME_CONFIG;

  const preset = ALLOWED_PRESETS.has(src.preset) ? src.preset : (ALLOWED_PRESETS.has(b.preset) ? b.preset : 'auto');
  const accentMode = ALLOWED_ACCENT_MODES.has(src.accentMode)
    ? src.accentMode
    : (ALLOWED_ACCENT_MODES.has(b.accentMode) ? b.accentMode : 'follow-role');
  const motionLevel = ALLOWED_MOTION_LEVELS.has(src.motionLevel)
    ? src.motionLevel
    : (ALLOWED_MOTION_LEVELS.has(b.motionLevel) ? b.motionLevel : 'standard');
  const cornerRadius = ALLOWED_CORNER_RADIUS.has(src.cornerRadius)
    ? src.cornerRadius
    : (ALLOWED_CORNER_RADIUS.has(b.cornerRadius) ? b.cornerRadius : 'soft');

  const srcLink = src.linkages && typeof src.linkages === 'object' ? src.linkages : {};
  const bLink = b.linkages || DEFAULT_HOST_THEME_CONFIG.linkages;

  const srcWb = src.workbench && typeof src.workbench === 'object' ? src.workbench : {};
  const bWb = b.workbench || DEFAULT_HOST_THEME_CONFIG.workbench;

  const srcWp = src.wallpaper && typeof src.wallpaper === 'object' ? src.wallpaper : {};
  const bWp = b.wallpaper || DEFAULT_HOST_THEME_CONFIG.wallpaper;

  let wpMode = ALLOWED_WALLPAPER_MODES.has(srcWp.mode)
    ? srcWp.mode
    : (ALLOWED_WALLPAPER_MODES.has(bWp.mode) ? bWp.mode : 'off');
  let wpPath = typeof srcWp.filePath === 'string'
    ? srcWp.filePath.trim()
    : (typeof bWp.filePath === 'string' ? bWp.filePath.trim() : '');

  if (wpPath) {
    const check = validateWallpaperFilePath(wpPath);
    wpPath = check.ok ? check.path : '';
  }
  if (wpMode === 'custom' && !wpPath) {
    wpMode = 'off';
  }

  return {
    enabled: asBool(src.enabled, asBool(b.enabled, true)),
    preset,
    accentMode,
    focusMode: asBool(src.focusMode, asBool(b.focusMode, false)),
    motionLevel,
    cornerRadius,
    ambientIntensity: Math.round(clampNumber(src.ambientIntensity, 0, 100, b.ambientIntensity ?? 75)),
    linkages: {
      roleSwitchAurora: asBool(srcLink.roleSwitchAurora, asBool(bLink.roleSwitchAurora, true)),
      composerBreathGlow: asBool(srcLink.composerBreathGlow, asBool(bLink.composerBreathGlow, true)),
      errorHissShake: asBool(srcLink.errorHissShake, asBool(bLink.errorHissShake, true)),
      taskFinishConfetti: asBool(srcLink.taskFinishConfetti, asBool(bLink.taskFinishConfetti, true)),
      pokeBurst: asBool(srcLink.pokeBurst, asBool(bLink.pokeBurst, true)),
      nightLamp: asBool(srcLink.nightLamp, asBool(bLink.nightLamp, true)),
      nightLampPreview: asBool(srcLink.nightLampPreview, asBool(bLink.nightLampPreview, false)),
    },
    workbench: {
      pawOutline: asBool(srcWb.pawOutline, asBool(bWb.pawOutline, true)),
      codeBlockFold: asBool(srcWb.codeBlockFold, asBool(bWb.codeBlockFold, true)),
      contextMenu: asBool(srcWb.contextMenu, asBool(bWb.contextMenu, true)),
      smoothScroll: asBool(srcWb.smoothScroll, asBool(bWb.smoothScroll, true)),
    },
    wallpaper: {
      mode: wpMode,
      filePath: wpPath,
      opacity: Number(clampNumber(srcWp.opacity, 0.05, 0.65, bWp.opacity ?? 0.22).toFixed(2)),
      blur: Math.round(clampNumber(srcWp.blur, 0, 24, bWp.blur ?? 4)),
      scrim: Number(clampNumber(srcWp.scrim, 0, 0.85, bWp.scrim ?? 0.35).toFixed(2)),
    },
    updatedAt: Number.isFinite(Number(src.updatedAt)) ? Number(src.updatedAt) : Date.now(),
  };
}

/**
 * 解析持久化主题配置文件路径。
 * @returns {string}
 */
export function resolveThemeConfigPath() {
  const envData = process.env.ANTIGRAVITY_EXECUTABLE_DATA_DIR;
  if (envData) {
    return path.join(path.resolve(envData), 'theme-config.json');
  }
  return path.join(os.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive', 'theme-config.json');
}

/**
 * 创建原子化持久化配置存储。
 * @param {string} [customPath]
 */
export function createThemeConfigStore(customPath) {
  const filePath = customPath ? path.resolve(customPath) : resolveThemeConfigPath();

  function load() {
    if (!existsSync(filePath)) {
      return sanitizeHostThemeConfig(DEFAULT_HOST_THEME_CONFIG);
    }
    try {
      const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
      return sanitizeHostThemeConfig(parsed, DEFAULT_HOST_THEME_CONFIG);
    } catch {
      return sanitizeHostThemeConfig(DEFAULT_HOST_THEME_CONFIG);
    }
  }

  let current = load();

  function save(nextConfig) {
    const dir = path.dirname(filePath);
    mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, JSON.stringify(nextConfig, null, 2), 'utf8');
    renameSync(tmp, filePath);
    current = nextConfig;
    return current;
  }

  return {
    filePath,
    get() {
      return current;
    },
    update(patch) {
      const merged = sanitizeHostThemeConfig({ ...patch, updatedAt: Date.now() }, current);
      return save(merged);
    },
    reset() {
      return save(sanitizeHostThemeConfig({ ...DEFAULT_HOST_THEME_CONFIG, updatedAt: Date.now() }));
    },
  };
}
