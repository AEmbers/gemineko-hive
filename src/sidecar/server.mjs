/**
 * Gemineko Hive · 基米窝独立伴生 Sidecar HTTP 服务（零外部依赖）。
 * 1. 只读扫描本地 ~/.gemini/<product>/brain/<conv>/ 提供兼容官方的 /api/swarm（并实时注入 25 态动作）；
 * 2. 提供 /gemineko-sprites/*.png 本地静态精灵图路由（带跨域头，支持主对话 CDP 挂件直接读取）；
 * 3. 提供 /api/live-activity 实时解析主对话区当前是编排模式还是执行模式及具体工具动作；
 * 4. 提供 /api/cdp/{status,toggle} 启停 Antigravity 主窗口 CDP 实时悬浮挂载；
 * 5. 提供 /api/native-patch/{status,apply,restore} 供侧边栏一键换肤与无损还原。
 */

import { execFile } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { enrichSwarmMembersWithActivity, findActiveConversationActivity } from '../activity-tracker.mjs';
import { CdpHostInjector, buildCdpOverlayScript } from '../cdp/host-injector.mjs';
import {
  applyHostAsarPatch,
  getDefaultRuntimeEndpointPath,
  getHostAsarStatus,
  restoreHostAsarPatch,
} from '../host-asar-patcher.mjs';
import { BRAND_META } from '../meta/brand.mjs';
import { applyNativePatch, getNativePatchStatus, resolveSwarmPaths, restoreNativePatch } from '../native-patcher.mjs';
import { applyStartupAsarPatch, getStartupAsarStatus, restoreStartupAsarPatch } from '../startup-asar-patcher.mjs';
import { buildDemoSwarmSnapshot } from '../theme/demo-data.js';
import {
  ALLOWED_EASTER_EGG_IDS,
  ALLOWED_SPRITE_QUALITIES,
  EASTER_EGG_CATALOG,
  PUBLIC_EASTER_EGG_IDS,
  ROLE_PALETTES,
  THEME_PRESETS,
  createThemeConfigStore,
  validateWallpaperFilePath,
  validateWatermarkImagePath,
} from '../theme/host-theme-config.mjs';
import { createThemePackManager } from '../theme/theme-store.mjs';
import { createGithubPulseService } from './github-pulse.mjs';

const execFileAsync = promisify(execFile);
const PY_RESIZE_APNG = String.raw`
import os, sys, json
from PIL import Image, ImageFilter, ImageSequence

src_path, dst_path, size_str = sys.argv[1], sys.argv[2], sys.argv[3]
target = int(size_str)
os.makedirs(os.path.dirname(os.path.abspath(dst_path)), exist_ok=True)
tmp_path = f"{dst_path}.{os.getpid()}.tmp"

def resize_rgba_crisp(img_rgba, sz):
    rgba = img_rgba.convert("RGBA")
    if rgba.size == (sz, sz):
        return rgba
    r, g, b, a = rgba.split()
    rgb_pre = Image.new("RGB", rgba.size, (0, 0, 0))
    rgb_pre.paste(Image.merge("RGB", (r, g, b)), mask=a)
    rgb_scaled = rgb_pre.resize((sz, sz), Image.Resampling.LANCZOS)
    a_scaled = a.resize((sz, sz), Image.Resampling.LANCZOS)
    r_s, g_s, b_s = rgb_scaled.split()
    px_r, px_g, px_b, px_a = r_s.load(), g_s.load(), b_s.load(), a_scaled.load()
    for y in range(sz):
        for x in range(sz):
            av = px_a[x, y]
            if av == 0:
                px_r[x, y] = 0
                px_g[x, y] = 0
                px_b[x, y] = 0
            elif av < 255:
                px_r[x, y] = min(255, (px_r[x, y] * 255 + (av >> 1)) // av)
                px_g[x, y] = min(255, (px_g[x, y] * 255 + (av >> 1)) // av)
                px_b[x, y] = min(255, (px_b[x, y] * 255 + (av >> 1)) // av)
    rgb_unpre = Image.merge("RGB", (r_s, g_s, b_s)).filter(
        ImageFilter.UnsharpMask(radius=0.9, percent=60, threshold=2)
    )
    ru, gu, bu = rgb_unpre.split()
    return Image.merge("RGBA", (ru, gu, bu, a_scaled))

im = Image.open(src_path)
frames = []
durations = []
for f in ImageSequence.Iterator(im):
    frames.append(resize_rgba_crisp(f, target))
    durations.append(int(f.info.get("duration", 210) or 210))

if len(frames) > 1:
    frames[0].save(
        tmp_path,
        format="PNG",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        compress_level=6,
    )
else:
    frames[0].save(tmp_path, format="PNG", compress_level=6)
os.replace(tmp_path, dst_path)
`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const NATIVE_STATIC_TYPES = {
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/hive.css': ['hive.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'application/javascript; charset=utf-8'],
  '/hive.js': ['hive.js', 'application/javascript; charset=utf-8'],
  '/gif.js': ['gif.js', 'application/javascript; charset=utf-8'],
  '/narrator_bootstrap.js': ['narrator_bootstrap.js', 'text/plain; charset=utf-8'],
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sidecar-Token',
};

function safeTokenCompare(a, b) {
  const ba = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * 查找所有可能包含 brain/ 的 appData 目录（优先使用 ANTIGRAVITY_EXECUTABLE_DATA_DIR）。
 * @param {string[]} [overrideAppDataDirs]
 */
function findAppDataDirs(overrideAppDataDirs) {
  if (Array.isArray(overrideAppDataDirs) && overrideAppDataDirs.length) {
    return overrideAppDataDirs.map((d) => path.resolve(d)).filter((d) => fs.existsSync(path.join(d, 'brain')));
  }
  const envData = process.env.ANTIGRAVITY_EXECUTABLE_DATA_DIR;
  if (envData) {
    for (let d = path.resolve(envData); d !== path.dirname(d); d = path.dirname(d)) {
      if (path.basename(d) === 'sidecar_data') {
        const appData = path.dirname(d);
        if (fs.existsSync(path.join(appData, 'brain'))) return [appData];
        break;
      }
    }
  }
  const root = path.join(os.homedir(), '.gemini');
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const candidate = path.join(root, ent.name);
    if (fs.existsSync(path.join(candidate, 'brain'))) out.push(candidate);
  }
  return out;
}

/**
 * 扫描或定位最近活跃的本地 Swarm 目录，并组装只读快照（补充实时动作）。
 * @param {string} requestedConv
 * @param {string[]} [overrideAppDataDirs]
 */
function readReadOnlySwarmSnapshot(requestedConv, overrideAppDataDirs) {
  const dirs = findAppDataDirs(overrideAppDataDirs);
  let chosen = null;
  let matchedDirect = false;

  for (const appData of dirs) {
    const brainDir = path.join(appData, 'brain');
    if (requestedConv && /^[0-9a-f-]{8,}$/i.test(requestedConv)) {
      const direct = path.join(brainDir, requestedConv, '.system_generated', 'swarm');
      if (fs.existsSync(path.join(direct, 'members.json'))) {
        chosen = { conv: requestedConv, swarmDir: direct, mtimeMs: fs.statSync(path.join(direct, 'members.json')).mtimeMs };
        matchedDirect = true;
        break;
      }
    }
    for (const ent of fs.readdirSync(brainDir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const swarmSub = path.join(brainDir, ent.name, '.system_generated', 'swarm');
      const memFile = path.join(swarmSub, 'members.json');
      if (!fs.existsSync(memFile)) continue;
      const boardFile = path.join(swarmSub, 'board.jsonl');
      const mtimeMs = Math.max(
        fs.statSync(memFile).mtimeMs,
        fs.existsSync(boardFile) ? fs.statSync(boardFile).mtimeMs : 0,
      );
      if (!chosen || mtimeMs > chosen.mtimeMs) {
        chosen = { conv: ent.name, swarmDir: swarmSub, mtimeMs };
      }
    }
  }

  if (!chosen) {
    return { conversationId: requestedConv || null, swarm: null, member: null };
  }

  let membersDoc = {};
  try {
    membersDoc = JSON.parse(fs.readFileSync(path.join(chosen.swarmDir, 'members.json'), 'utf8'));
  } catch {
    membersDoc = {};
  }

  const rawMembers = membersDoc.members || {};
  const members = Object.entries(rawMembers).map(([name, m]) => ({
    name,
    role: m?.role || (name === 'coordinator' ? 'coordinator' : 'worker'),
    model: m?.model || '',
    status: m?.killed ? 'retired' : m?.status || 'idle',
    killed: Boolean(m?.killed),
    conversationId: m?.conversation_id || m?.conversationId || '',
    conversation_id: m?.conversation_id || m?.conversationId || '',
    currentTask: m?.currentTask || m?.task || '',
    note: m?.note || '',
    posts: 0,
    local: true,
  }));

  const messages = [];
  const boardPath = path.join(chosen.swarmDir, 'board.jsonl');
  if (fs.existsSync(boardPath)) {
    const lines = fs.readFileSync(boardPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        const agent = msg.agent || msg.from || 'coordinator';
        const mentions = Array.isArray(msg.mentions) ? msg.mentions : Array.isArray(msg.to) ? msg.to.filter((x) => x !== '*') : [];
        const all = Boolean(msg.all || (Array.isArray(msg.to) && msg.to.includes('*')));
        messages.push({
          seq: Number(msg.seq) || messages.length + 1,
          agent,
          mentions,
          all,
          channel: msg.channel || 'main',
          time: msg.time || msg.ts || new Date().toISOString(),
          ts: typeof msg.ts === 'number' ? msg.ts : Date.parse(msg.time || '') || Date.now(),
          text: String(msg.text || ''),
        });
      } catch {
        /* 跳过损坏单行 */
      }
    }
  }

  let view = null;
  const viewPath = path.join(chosen.swarmDir, 'view.json');
  if (fs.existsSync(viewPath)) {
    try {
      view = JSON.parse(fs.readFileSync(viewPath, 'utf8'));
    } catch {
      view = null;
    }
  }

  const snapshot = {
    conversationId: requestedConv || chosen.conv,
    swarm: chosen.conv,
    id: chosen.conv,
    isFallbackSwarm: Boolean(requestedConv && !matchedDirect),
    sourceConversationId: chosen.conv,
    member: 'coordinator',
    title: membersDoc.title || 'Gemineko Hive · 基米窝',
    finished: Boolean(membersDoc.finished),
    head: messages.length,
    members,
    messages,
    edges: [],
    view,
    graphTab: true,
    builtinOverview: true,
    etag: `${chosen.conv}|${Math.floor(chosen.mtimeMs)}|${messages.length}`,
  };

  const enriched = enrichSwarmMembersWithActivity(snapshot, dirs);
  const memberSig = Array.isArray(enriched.members)
    ? enriched.members.map((m) => `${m.name}:${m.status}:${m.action || ''}`).join(',')
    : '';
  enriched.etag = `${chosen.conv}|${Math.floor(chosen.mtimeMs)}|${messages.length}|${memberSig}`;
  return enriched;
}

/**
 * 读取 POST 请求体 JSON。
 */
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

/**
 * 解析并返回真实的 sidecar_sdk/preload.js（提供 window.sidecar API 与主题变量同步）。
 * 若宿主不存在该模块，则提供最小可用 Polyfill，保证独立面板不因缺少 window.sidecar 而卡死。
 */
let cachedPreloadJs = null;
function resolveSidecarPreloadJs() {
  if (cachedPreloadJs) return cachedPreloadJs;
  const sdkPreload = path.join(os.homedir(), '.gemini', 'antigravity', 'lib', 'node_modules', 'sidecar_sdk', 'preload.js');
  if (fs.existsSync(sdkPreload)) {
    try {
      cachedPreloadJs = fs.readFileSync(sdkPreload, 'utf8');
      return cachedPreloadJs;
    } catch {
      /* fallback below */
    }
  }
  cachedPreloadJs = `(() => {
  const params = new URLSearchParams(window.location.search);
  const conversationId = params.get('conversationId') || '';
  const token = params.get('token') || '';
  window.sidecar = {
    conversationId,
    fetch(input, init = {}) {
      const headers = new Headers(init.headers || {});
      if (token && !headers.has('x-sidecar-token')) headers.set('x-sidecar-token', token);
      return window.fetch(input, { ...init, headers });
    },
    async getWorkspaceUris() { return []; },
    onWorkspaceChange() { return () => {}; },
    ui: {
      toggleAuxPane(p) { window.parent?.postMessage({ type: 'toggle-aux-pane', payload: p }, '*'); },
      toggleConversation(c, o) { window.parent?.postMessage({ type: 'toggle-conversation', payload: { conversationId: c, ...o } }, '*'); },
    },
  };
})();`;
  return cachedPreloadJs;
}

/**
 * 如果宿主未部署官方 swarm_board 静态前端，则回退输出轻量化独立页。
 */
function renderStandaloneFallbackHtml(sideToken) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>Gemineko Hive · 基米窝</title>
  <script>window.__GEMINEKO_SIDECAR_MODE__=true;window.__SIDECAR_TOKEN__=${JSON.stringify(sideToken)};</script>
</head>
<body>
  <div id="board" class="board"><header class="header"><div class="header-row"><h1 id="swarm-title" class="swarm-title">Gemineko Hive · 基米窝</h1></div></header></div>
  <section id="empty" class="empty"><div class="empty-card"><h2 id="empty-title" class="empty-title">当前未找到官方 Swarm 前端或活跃协作</h2><p id="empty-body" class="empty-body">点击下方体验按钮预览模拟基米窝，或检查顶部原生换肤状态。</p></div></section>
  <script src="/gemineko-hive.js"></script>
</body>
</html>`;
}

export async function createHiveSidecarServer(options = {}) {
  const bundlePath = options.bundlePath
    ? path.resolve(options.bundlePath)
    : path.join(REPO_ROOT, 'dist', 'gemineko-hive.js');
  const spritesSourceDir = options.spritesSourceDir
    ? path.resolve(options.spritesSourceDir)
    : path.join(REPO_ROOT, 'assets', 'sprites');
  const audioSourceDir = options.audioSourceDir
    ? path.resolve(options.audioSourceDir)
    : path.join(REPO_ROOT, 'assets', 'audio');
  const logoPngPath = options.logoPngPath
    ? path.resolve(options.logoPngPath)
    : path.join(REPO_ROOT, 'assets', 'logo.png');

  const swarmPaths = resolveSwarmPaths({
    swarmDir: options.swarmDir,
    bundlePath,
    spritesSourceDir,
    logoPngPath,
  });

  const generatedToken = options.sideToken || randomBytes(24).toString('hex');
  const hostEnvToken = String(
    process.env.ANTIGRAVITY_SIDECAR_UI_TOKEN ||
      process.env.ANTIGRAVITY_SIDECAR_AUTH_TOKEN ||
      process.env.ANTIGRAVITY_SIDECAR_WEB_TOKEN ||
      '',
  ).trim();
  const validTokens = [generatedToken, hostEnvToken].filter(Boolean);

  const envPort = parseInt(
    process.env.ANTIGRAVITY_SIDECAR_WEB_PORT || process.env.ANTIGRAVITY_SIDECAR_PORT || process.env.PORT || '',
    10,
  );
  const listenPort = options.port !== undefined ? Number(options.port) : Number.isFinite(envPort) ? envPort : 0;

  let logoDataUri = '';
  if (fs.existsSync(logoPngPath)) {
    logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPngPath).toString('base64')}`;
  }

  function sendJson(res, status, data) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  }

  function verifyAuth(req, urlObj = null) {
    const reqTok = typeof req.headers['x-sidecar-token'] === 'string' ? req.headers['x-sidecar-token'].trim() : '';
    const queryTok = urlObj ? String(urlObj.searchParams.get('token') || '').trim() : '';
    const tok = reqTok || queryTok;
    return validTokens.some((tk) => safeTokenCompare(tok, tk));
  }

  let cdpInjector = null;
  let hostOverlayEnabled = true;
  let nativePatchAutoHealed = false;
  if (options.autoHealNativePatch !== false) {
    try {
      const nativeSt = getNativePatchStatus({
        swarmDir: swarmPaths.swarmBoardDir,
        bundlePath: swarmPaths.bundlePath,
        spritesSourceDir: swarmPaths.spritesSourceDir,
        logoPngPath: swarmPaths.logoPngPath,
      });
      if (nativeSt.swarmExists && nativeSt.bundleBuilt && nativeSt.logoBackupExists && !nativeSt.upToDate) {
        applyNativePatch({
          swarmDir: swarmPaths.swarmBoardDir,
          bundlePath: swarmPaths.bundlePath,
          spritesSourceDir: swarmPaths.spritesSourceDir,
          logoPngPath: swarmPaths.logoPngPath,
        });
        nativePatchAutoHealed = true;
      }
    } catch {
      /* 自愈失败不阻断 Sidecar 启动 */
    }
  }

  const sseClients = new Set();
  function broadcastSse(eventName, payload) {
    if (sseClients.size === 0) return;
    const frame = `event: ${eventName}\ndata: ${JSON.stringify(payload ?? {})}\n\n`;
    for (const client of Array.from(sseClients)) {
      if (client.destroyed || client.writableEnded) {
        sseClients.delete(client);
        continue;
      }
      try {
        client.write(frame);
      } catch {
        sseClients.delete(client);
      }
    }
  }
  function broadcastThemeConfig(cfg) {
    broadcastSse('theme-config', cfg);
    if (cdpInjector) {
      cdpInjector.pushThemeConfig(cfg).catch(() => {});
    }
  }
  function broadcastThemeEvent(evt) {
    broadcastSse('theme-event', evt);
    if (cdpInjector) {
      cdpInjector.pushThemeEvent(evt).catch(() => {});
    }
  }
  function buildHostStatusSummary() {
    const base = cdpInjector
      ? cdpInjector.getStatus()
      : { enabled: hostOverlayEnabled, state: hostOverlayEnabled ? 'disabled' : 'disabled-by-user', hint: '当前模式未启用 CDP 注入' };
    const nativeClientCount = sseClients.size;
    const nativeConnected = nativeClientCount > 0;
    const transport = nativeConnected ? 'native-asar' : (base.state === 'attached' ? 'cdp' : 'none');
    return {
      ...base,
      enabled: hostOverlayEnabled,
      state: !hostOverlayEnabled ? 'disabled-by-user' : (nativeConnected ? 'attached' : base.state),
      hint: nativeConnected
        ? '已通过极薄 app.asar 引导钩子直连渲染，无需 19222 调试端口'
        : base.hint,
      nativeClientCount,
      nativeConnected,
      transport,
    };
  }
  const ssePingTimer = setInterval(() => {
    for (const client of Array.from(sseClients)) {
      if (client.destroyed || client.writableEnded) {
        sseClients.delete(client);
        continue;
      }
      try {
        client.write(': ping\n\n');
      } catch {
        sseClients.delete(client);
      }
    }
  }, 25_000);
  ssePingTimer.unref?.();
  const themeStore = createThemeConfigStore(options.themeConfigPath);
  const packManager = createThemePackManager({
    packsDir: options.themePacksDir,
    registryPath: options.themeRegistryPath,
    fetchImpl: options.fetchImpl,
    disableNetwork: options.disableNetwork,
  });
  const githubPulse = createGithubPulseService({
    cachePath: options.githubCachePath,
    currentVersion: BRAND_META.version,
    fetchImpl: options.fetchImpl,
    disableNetwork: options.disableNetwork,
  });
  const themeEvents = { seq: 0, latest: null };
  let reportedHostScheme = '';
  const spriteCacheDir = options.spriteCacheDir
    ? path.resolve(options.spriteCacheDir)
    : path.join(os.homedir(), '.gemini', 'gemineko-hive', 'sprite-cache');
  const spriteResizeJobs = new Map();

  async function resolveTieredSpriteBuffer(absFile, fileName, requestedQ) {
    const q = ALLOWED_SPRITE_QUALITIES.has(String(requestedQ || '')) ? String(requestedQ) : '512';
    if (q === '512' || fileName.startsWith('home-star-gem-')) {
      return { buf: fs.readFileSync(absFile), quality: '512', cache: 'master' };
    }
    let st;
    try {
      st = fs.statSync(absFile);
    } catch {
      return { buf: fs.readFileSync(absFile), quality: '512', cache: 'master' };
    }
    const tierDir = path.join(spriteCacheDir, q);
    const stem = path.parse(fileName).name;
    const cacheFile = path.join(tierDir, `${stem}-${st.size}-${Math.trunc(st.mtimeMs)}-v2.png`);
    if (fs.existsSync(cacheFile)) {
      return { buf: fs.readFileSync(cacheFile), quality: q, cache: 'hit' };
    }
    const jobKey = `${q}:${cacheFile}`;
    let job = spriteResizeJobs.get(jobKey);
    if (!job) {
      job = (async () => {
        try {
          fs.mkdirSync(tierDir, { recursive: true });
          await execFileAsync('python', ['-c', PY_RESIZE_APNG, absFile, cacheFile, q], {
            timeout: 30_000,
          });
          if (fs.existsSync(cacheFile)) {
            return { buf: fs.readFileSync(cacheFile), quality: q, cache: 'miss' };
          }
        } catch {
          /* fallback to master 512 */
        }
        return { buf: fs.readFileSync(absFile), quality: '512', cache: 'fallback' };
      })().finally(() => {
        spriteResizeJobs.delete(jobKey);
      });
      spriteResizeJobs.set(jobKey, job);
    }
    return job;
  }

  function getEnrichedThemeConfig(baseCfg = themeStore.get()) {
    const packId = String(baseCfg?.activeThemePackId || 'official-gemineko');
    const pack = packId && packId !== 'official-gemineko' ? packManager.getPackById(packId) : null;
    if (pack) {
      return { ...baseCfg, activeThemePack: pack };
    }
    return { ...baseCfg, activeThemePackId: 'official-gemineko', activeThemePack: null };
  }

  function openExternalHttpsUrl(rawUrl) {
    let parsed;
    try {
      parsed = new URL(String(rawUrl || '').trim());
    } catch {
      return { ok: false, error: '无效的 URL' };
    }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return { ok: false, error: '仅允许打开安全的 HTTPS 外部链接' };
    }
    const safeUrl = parsed.toString();
    try {
      if (process.platform === 'win32') {
        execFile('cmd.exe', ['/c', 'start', '', safeUrl], { windowsHide: true }, () => {});
      } else if (process.platform === 'darwin') {
        execFile('open', [safeUrl], () => {});
      } else {
        execFile('xdg-open', [safeUrl], () => {});
      }
      return { ok: true, url: safeUrl };
    } catch (err) {
      return { ok: false, error: err?.message || String(err) };
    }
  }

  const MEME_MIME_MAP = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
  };

  /** 定位本机已安装的 Gemini 猫娘贴纸库（支持单测覆盖 memePackDirs） */
  function resolveMemePackRoot() {
    const candidates = Array.isArray(options.memePackDirs) && options.memePackDirs.length
      ? options.memePackDirs.map((d) => path.resolve(d))
      : [
          path.join(os.homedir(), '.gemini', 'meme-packs', 'gemini-neko'),
          path.join(os.homedir(), '.gemini', 'config', 'plugins', 'jiangnanquan--agy-meme', 'packs', 'gemini-neko'),
        ];
    for (const dir of candidates) {
      if (fs.existsSync(path.join(dir, 'memes.json'))) {
        return fs.realpathSync(dir);
      }
    }
    return '';
  }

  function loadMemeCatalog() {
    const packRoot = resolveMemePackRoot();
    if (!packRoot) {
      return { ok: true, available: false, packName: '', count: 0, memes: [] };
    }
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(packRoot, 'memes.json'), 'utf8'));
      const list = Array.isArray(raw?.memes) ? raw.memes : [];
      const memes = list
        .filter((m) => m && typeof m.path === 'string' && typeof m.caption === 'string')
        .map((m) => {
          const cleanRel = String(m.path).replace(/\\/g, '/').replace(/^\/+/, '');
          return {
            caption: String(m.caption).trim(),
            tag: String(m.tag || 'daily').trim(),
            keywords: String(m.keywords || ''),
            scene: String(m.scene || ''),
            relPath: cleanRel,
            url: `${origin}/api/memes/file/${cleanRel.split('/').map(encodeURIComponent).join('/')}`,
          };
        });
      return {
        ok: true,
        available: true,
        packName: String(raw?.manifest?.name || 'Gemini猫娘'),
        count: memes.length,
        memes,
      };
    } catch {
      return { ok: true, available: false, packName: '', count: 0, memes: [] };
    }
  }

  function handleMemeFileStream(relPathRaw, res) {
    const packRoot = resolveMemePackRoot();
    if (!packRoot) {
      res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Meme pack not installed');
      return;
    }
    let decoded = '';
    try {
      decoded = decodeURIComponent(String(relPathRaw || ''));
    } catch {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad meme path encoding');
      return;
    }
    const clean = decoded.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!clean || clean.includes('..') || clean.includes('\0') || /^[a-z]:/i.test(clean)) {
      res.writeHead(403, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden meme path');
      return;
    }
    const target = path.resolve(packRoot, clean);
    if (!target.startsWith(packRoot + path.sep)) {
      res.writeHead(403, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden meme path');
      return;
    }
    if (!fs.existsSync(target)) {
      res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Meme file not found');
      return;
    }
    let realTarget = '';
    try {
      realTarget = fs.realpathSync(target);
    } catch {
      res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Meme file inaccessible');
      return;
    }
    if (!realTarget.startsWith(packRoot + path.sep)) {
      res.writeHead(403, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden symlink escape');
      return;
    }
    const ext = path.extname(realTarget).toLowerCase();
    const mime = MEME_MIME_MAP[ext];
    if (!mime) {
      res.writeHead(403, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Unsupported meme image format');
      return;
    }
    const st = fs.statSync(realTarget);
    res.writeHead(200, {
      ...CORS_HEADERS,
      'Content-Type': mime,
      'Content-Length': st.size,
      'Cache-Control': 'public, max-age=3600',
    });
    fs.createReadStream(realTarget).pipe(res);
  }

  /**
   * 弹出本机系统文件选择对话框挑选壁纸或角色水印图片（仅 Windows 支持，超时保护）。
   */
  function openNativeMediaDialog(title, filter, validator) {
    if (process.platform !== 'win32') {
      return Promise.resolve({ ok: false, canceled: true, error: '当前系统请直接填写本机文件绝对路径' });
    }
    const psScript = [
      'Add-Type -AssemblyName System.Windows.Forms',
      '$d = New-Object System.Windows.Forms.OpenFileDialog',
      `$d.Title = '${title}'`,
      `$d.Filter = '${filter}'`,
      '$r = $d.ShowDialog()',
      "if ($r -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $d.FileName }",
    ].join('; ');
    return new Promise((resolve) => {
      execFile(
        'powershell.exe',
        ['-NoProfile', '-STA', '-Command', psScript],
        { timeout: 60_000, windowsHide: true },
        (err, stdout) => {
          if (err) {
            resolve({ ok: false, canceled: true, error: err.message });
            return;
          }
          const chosen = String(stdout || '').trim();
          if (!chosen) {
            resolve({ ok: true, canceled: true, filePath: '' });
            return;
          }
          const check = validator(chosen);
          resolve(check.ok ? { ok: true, canceled: false, ...check } : { ok: false, canceled: false, error: check.error });
        },
      );
    });
  }

  function handleWatermarkImageStream(res) {
    const cfg = themeStore.get();
    if (!cfg?.watermark?.customFilePath) {
      res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No custom watermark configured');
      return;
    }
    const check = validateWatermarkImagePath(cfg.watermark.customFilePath);
    if (!check.ok) {
      res.writeHead(403, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(check.error || 'Watermark path rejected');
      return;
    }
    res.writeHead(200, {
      ...CORS_HEADERS,
      'Content-Type': check.mime,
      'Content-Length': check.size || 0,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(check.path).pipe(res);
  }

  /**
   * 仅从已校验并保存的 config.wallpaper.filePath 读取媒体流，严格支持 206 Range。
   */
  function handleWallpaperStream(req, res) {
    const cfg = themeStore.get();
    if (!cfg?.wallpaper?.filePath) {
      res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No custom wallpaper configured');
      return;
    }
    const check = validateWallpaperFilePath(cfg.wallpaper.filePath);
    if (!check.ok) {
      res.writeHead(403, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(check.error || 'Wallpaper path rejected');
      return;
    }
    const totalSize = check.size || 0;
    const rangeHeader = String(req.headers.range || '').trim();
    if (rangeHeader && totalSize > 0) {
      const m = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader);
      if (!m) {
        res.writeHead(416, { ...CORS_HEADERS, 'Content-Range': `bytes */${totalSize}` });
        res.end();
        return;
      }
      const start = m[1] ? Number(m[1]) : Math.max(0, totalSize - Number(m[2] || 0));
      const end = m[1] && m[2] ? Math.min(totalSize - 1, Number(m[2])) : totalSize - 1;
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= totalSize) {
        res.writeHead(416, { ...CORS_HEADERS, 'Content-Range': `bytes */${totalSize}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        ...CORS_HEADERS,
        'Content-Type': check.mime,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(check.path, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, {
      ...CORS_HEADERS,
      'Content-Type': check.mime,
      'Content-Length': totalSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(check.path).pipe(res);
  }

  async function dispatch(req, res) {
    const urlObj = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = urlObj.pathname;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (req.method === 'GET' && pathname === '/healthz') {
      sendJson(res, 200, { ok: true, plugin: 'gemineko-hive', version: BRAND_META.version, sidecar: 'hive_board' });
      return;
    }

    if (req.method === 'GET' && pathname === '/preload.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(resolveSidecarPreloadJs());
      return;
    }

    if (req.method === 'GET' && pathname === '/gemineko-hive.js') {
      if (!fs.existsSync(swarmPaths.bundlePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('dist/gemineko-hive.js not built');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(fs.readFileSync(swarmPaths.bundlePath));
      return;
    }

    const AUDIO_MIME_MAP = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
    };

    // 彩蛋语音与物理音效静态路由（仅允许 assets/audio 下安全文件名，禁止路径穿越，不挤占 bundle 体积）
    if (req.method === 'GET' && pathname.startsWith('/gemineko-audio/')) {
      const fileName = pathname.slice('/gemineko-audio/'.length);
      if (!/^[a-z0-9][a-z0-9_-]{0,60}\.(mp3|wav|ogg)$/i.test(fileName)) {
        res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Invalid audio name');
        return;
      }
      const absAudio = path.join(audioSourceDir, fileName);
      if (!fs.existsSync(absAudio)) {
        res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Audio not found');
        return;
      }
      const ext = path.extname(fileName).toLowerCase();
      const buf = fs.readFileSync(absAudio);
      res.writeHead(200, {
        ...CORS_HEADERS,
        'Content-Type': AUDIO_MIME_MAP[ext] || 'application/octet-stream',
        'Content-Length': buf.length,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      res.end(buf);
      return;
    }

    // 精灵 PNG 图片路由（禁止路径穿越；缺失动作精灵自动回退至同角色 thinking 或 neon-thinking，杜绝 404）
    if (req.method === 'GET' && pathname.startsWith('/gemineko-sprites/')) {
      const fileName = pathname.slice('/gemineko-sprites/'.length);
      if (!/^[a-z0-9_-]+\.png$/i.test(fileName)) {
        res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Invalid sprite name');
        return;
      }
      let absFile = path.join(swarmPaths.spritesSourceDir, fileName);
      let isFallback = false;
      if (!fs.existsSync(absFile)) {
        const m = /^(neon|hydrogen|carbon|claude|gpt)-[a-z0-9_-]+\.png$/i.exec(fileName);
        const roleFallback = m ? path.join(swarmPaths.spritesSourceDir, `${m[1].toLowerCase()}-thinking.png`) : '';
        const defaultFallback = path.join(swarmPaths.spritesSourceDir, 'neon-thinking.png');
        if (roleFallback && fs.existsSync(roleFallback)) {
          absFile = roleFallback;
          isFallback = true;
        } else if (fs.existsSync(defaultFallback)) {
          absFile = defaultFallback;
          isFallback = true;
        } else {
          res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Sprite not found');
          return;
        }
      }
      if (fileName.startsWith('egg-')) {
        res.writeHead(200, {
          ...CORS_HEADERS,
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
          'X-Gemineko-Sprite-Quality': '512',
          'X-Gemineko-Sprite-Cache': 'static-egg',
        });
        res.end(fs.readFileSync(absFile));
        return;
      }
      const rawQ = String(urlObj.searchParams.get('q') || themeStore.get()?.spriteQuality || '1024');
      const requestedQ = ALLOWED_SPRITE_QUALITIES.has(rawQ) ? rawQ : '1024';
      const resolved = await resolveTieredSpriteBuffer(absFile, path.basename(absFile), requestedQ);
      res.writeHead(200, {
        ...CORS_HEADERS,
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
        'X-Gemineko-Sprite-Quality': resolved.quality,
        'X-Gemineko-Sprite-Cache': resolved.cache,
        ...(isFallback ? { 'X-Gemineko-Fallback': '1' } : {}),
      });
      res.end(resolved.buf);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/live-activity') {
      const dirs = findAppDataDirs(options.appDataDirs);
      const preferredConvId = String(urlObj.searchParams.get('conversationId') || '').trim();
      const activity = findActiveConversationActivity(dirs, Date.now(), undefined, preferredConvId);
      sendJson(res, 200, {
        ok: true,
        activity: activity || {
          conversationId: preferredConvId || '',
          active: false,
          phase: 'idle',
          phaseLabel: '待机中',
          model: 'gemini-4-neon',
          role: 'neon',
          action: 'idle',
          actionLabel: '打盹摸鱼',
          lastTool: '',
          spriteFile: 'neon-idle.png',
        },
        spriteBaseUrl: `${origin}/gemineko-sprites`,
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/theme/config') {
      const cfg = getEnrichedThemeConfig();
      const unlockedSet = new Set(Array.isArray(cfg?.easterEggs?.unlocked) ? cfg.easterEggs.unlocked : []);
      const visibleCatalog = EASTER_EGG_CATALOG
        .filter((egg) => !egg.secret || unlockedSet.has(egg.id))
        .map((egg) => {
          if (!egg.secret) return egg;
          return {
            id: egg.id,
            scope: egg.scope,
            secret: true,
            widget: egg.widget,
            title: egg.title,
            meme: egg.meme,
            gesture: egg.gesture,
            hint: egg.hint,
          };
        });
      sendJson(res, 200, {
        ok: true,
        config: cfg,
        hostScheme: reportedHostScheme || null,
        presets: THEME_PRESETS,
        rolePalettes: ROLE_PALETTES,
        eggCatalog: visibleCatalog,
        brand: BRAND_META,
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/theme/host-scheme') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const scheme = body?.scheme === 'dark' ? 'dark' : (body?.scheme === 'light' ? 'light' : '');
      if (!scheme) {
        sendJson(res, 400, { ok: false, error: 'Invalid host scheme' });
        return;
      }
      reportedHostScheme = scheme;
      sendJson(res, 200, { ok: true, hostScheme: reportedHostScheme });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/theme/config') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      let warningMsg = '';
      if (body?.wallpaper && typeof body.wallpaper.filePath === 'string' && body.wallpaper.filePath.trim()) {
        const check = validateWallpaperFilePath(body.wallpaper.filePath);
        if (!check.ok) warningMsg = check.error || '壁纸路径无效';
      }
      if (body?.watermark && typeof body.watermark.customFilePath === 'string' && body.watermark.customFilePath.trim()) {
        const wmCheck = validateWatermarkImagePath(body.watermark.customFilePath);
        if (!wmCheck.ok) warningMsg = wmCheck.error || '水印图片路径无效';
      }
      const next = getEnrichedThemeConfig(themeStore.update(body));
      broadcastThemeConfig(next);
      sendJson(res, 200, {
        ok: true,
        config: next,
        ...(warningMsg ? { warning: warningMsg } : {}),
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/theme/reset') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const next = getEnrichedThemeConfig(themeStore.reset());
      broadcastThemeConfig(next);
      sendJson(res, 200, { ok: true, config: next });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/theme/egg/unlock') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const eggId = String(body?.id || '').trim();
      if (!ALLOWED_EASTER_EGG_IDS.has(eggId)) {
        sendJson(res, 400, { ok: false, error: `Invalid easter egg id: ${eggId}` });
        return;
      }
      const curCfg = themeStore.get();
      const curUnlocked = Array.isArray(curCfg?.easterEggs?.unlocked) ? curCfg.easterEggs.unlocked : [];
      const set = new Set(curUnlocked.filter((x) => ALLOWED_EASTER_EGG_IDS.has(x)));
      const newlyUnlocked = !set.has(eggId);
      set.add(eggId);
      const nextUnlocked = Array.from(set);
      const completedAll = Array.from(PUBLIC_EASTER_EGG_IDS).every((id) => set.has(id));
      let next = getEnrichedThemeConfig(curCfg);
      if (newlyUnlocked) {
        next = getEnrichedThemeConfig(
          themeStore.update({
            easterEggs: {
              ...(curCfg?.easterEggs || {}),
              unlocked: nextUnlocked,
            },
          }),
        );
        broadcastThemeConfig(next);
      }
      sendJson(res, 200, {
        ok: true,
        id: eggId,
        newlyUnlocked,
        completedAll,
        unlocked: nextUnlocked,
        total: PUBLIC_EASTER_EGG_IDS.size,
        config: next,
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/theme/egg/reset') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const curCfg = themeStore.get();
      const next = getEnrichedThemeConfig(
        themeStore.update({
          easterEggs: {
            ...(curCfg?.easterEggs || {}),
            unlocked: [],
          },
        }),
      );
      broadcastThemeConfig(next);
      sendJson(res, 200, { ok: true, config: next });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/github/status') {
      const refresh = urlObj.searchParams.get('refresh') === '1';
      const status = await githubPulse.getStatus({ forceRefresh: refresh });
      sendJson(res, 200, status);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/store/registry') {
      const refresh = urlObj.searchParams.get('refresh') === '1';
      const data = await packManager.getCommunityRegistry({ forceRefresh: refresh });
      sendJson(res, 200, {
        ...data,
        officialId: 'official-gemineko',
        activeThemePackId: themeStore.get().activeThemePackId || 'official-gemineko',
        brand: BRAND_META,
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/store/install') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      let installRes;
      if (typeof body?.url === 'string' && body.url.trim()) {
        installRes = await packManager.installFromUrl(body.url);
      } else if (body?.pack && typeof body.pack === 'object') {
        installRes = packManager.installPack(body.pack);
      } else if (typeof body?.packId === 'string' && body.packId.trim()) {
        const found = packManager.getPackById(body.packId);
        installRes = found
          ? (found.id === 'official-gemineko' || found.id === 'official-carbon-obsidian'
              ? { ok: true, pack: found, warnings: [] }
              : packManager.installPack(found))
          : { ok: false, error: `商店目录中未找到主题 ${body.packId}` };
      } else {
        installRes = { ok: false, error: '请提供 url、pack 或 packId' };
      }
      if (!installRes?.ok) {
        sendJson(res, 400, installRes || { ok: false, error: '安装主题失败' });
        return;
      }
      let nextCfg = getEnrichedThemeConfig();
      if (body?.activate === true) {
        const pack = installRes.pack;
        const patch = { enabled: true, activeThemePackId: pack.id };
        if (pack.basePreset) patch.preset = pack.basePreset;
        if (pack.themeIntensity) patch.themeIntensity = pack.themeIntensity;
        nextCfg = getEnrichedThemeConfig(themeStore.update(patch));
        broadcastThemeConfig(nextCfg);
      }
      sendJson(res, 200, { ...installRes, config: nextCfg });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/store/activate') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const packId = String(body?.packId || 'official-gemineko').trim().toLowerCase() || 'official-gemineko';
      let nextPatch = { enabled: true, activeThemePackId: 'official-gemineko' };
      if (packId !== 'official-gemineko') {
        const found = packManager.getPackById(packId);
        if (!found) {
          sendJson(res, 404, { ok: false, error: `未找到主题包 ${packId}` });
          return;
        }
        nextPatch.activeThemePackId = found.id;
        if (body?.syncBasePreset !== false) {
          if (found.basePreset) nextPatch.preset = found.basePreset;
          if (found.themeIntensity) nextPatch.themeIntensity = found.themeIntensity;
        }
      } else if (body?.syncBasePreset !== false) {
        nextPatch.preset = 'auto';
        nextPatch.themeIntensity = 'optical-neko';
      }
      const nextCfg = getEnrichedThemeConfig(themeStore.update(nextPatch));
      broadcastThemeConfig(nextCfg);
      sendJson(res, 200, { ok: true, config: nextCfg });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/store/uninstall') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const resUninstall = packManager.uninstallPack(body?.packId);
      if (!resUninstall.ok) {
        sendJson(res, 400, resUninstall);
        return;
      }
      let nextCfg = getEnrichedThemeConfig();
      if (themeStore.get().activeThemePackId === resUninstall.id) {
        nextCfg = getEnrichedThemeConfig(themeStore.update({ activeThemePackId: 'official-gemineko' }));
        broadcastThemeConfig(nextCfg);
      }
      sendJson(res, 200, { ok: true, id: resUninstall.id, config: nextCfg });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/store/export') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const exported = packManager.exportThemePack(getEnrichedThemeConfig(), body || {});
      sendJson(res, exported.ok ? 200 : 400, exported);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/open-external') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const openRes = openExternalHttpsUrl(body?.url);
      sendJson(res, openRes.ok ? 200 : 400, openRes);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/theme/event') {
      sendJson(res, 200, {
        ok: true,
        seq: themeEvents.seq,
        latest: themeEvents.latest,
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/theme/event') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const evtType = String(body?.type || '').trim();
      if (!evtType) {
        sendJson(res, 400, { ok: false, error: 'Missing event type' });
        return;
      }
      themeEvents.seq += 1;
      themeEvents.latest = {
        seq: themeEvents.seq,
        type: evtType,
        eggId: String(body?.eggId || '').trim(),
        role: String(body?.role || 'neon'),
        combo: Number(body?.combo) || 0,
        source: String(body?.source || 'unknown'),
        ts: Date.now(),
      };
      if (evtType === 'open-workshop' && body?.source === 'host') {
        themeEvents.latest.openWorkshop = true;
      }
      if (body?.source === 'sidecar') {
        broadcastThemeEvent(themeEvents.latest);
      }
      sendJson(res, 200, { ok: true, seq: themeEvents.seq, event: themeEvents.latest });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/wallpaper/pick') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      if (typeof body?.filePath === 'string' && body.filePath.trim()) {
        const check = validateWallpaperFilePath(body.filePath);
        sendJson(res, check.ok ? 200 : 400, check.ok ? { ok: true, ...check } : { ok: false, error: check.error });
        return;
      }
      const picked = await openNativeMediaDialog(
        '选择基米窝宿主壁纸（图片或 MP4/WebM 视频）',
        '媒体文件 (*.png;*.jpg;*.jpeg;*.webp;*.gif;*.avif;*.mp4;*.webm)|*.png;*.jpg;*.jpeg;*.webp;*.gif;*.avif;*.mp4;*.webm',
        validateWallpaperFilePath,
      );
      sendJson(res, 200, picked);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/wallpaper/file') {
      handleWallpaperStream(req, res);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/watermark/pick') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const picked = await openNativeMediaDialog(
        '选择角落透明二次元立绘水印（PNG/WebP/GIF）',
        '透明立绘图片 (*.png;*.webp;*.gif;*.avif;*.jpg)|*.png;*.webp;*.gif;*.avif;*.jpg',
        validateWatermarkImagePath,
      );
      sendJson(res, 200, picked);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/watermark/file') {
      handleWatermarkImageStream(res);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/memes/list') {
      sendJson(res, 200, loadMemeCatalog());
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/memes/file/')) {
      handleMemeFileStream(pathname.slice('/api/memes/file/'.length), res);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/host-bootstrap.js') {
      if (!verifyAuth(req, urlObj)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid sidecar token' });
        return;
      }
      if (!hostOverlayEnabled) {
        res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end('if (window.__GEMINEKO_CDP_UNMOUNT__) { try { window.__GEMINEKO_CDP_UNMOUNT__(); } catch {} }');
        return;
      }
      const script = buildCdpOverlayScript(origin, logoDataUri, {
        sideToken: validTokens[0] || generatedToken,
        themeConfig: getEnrichedThemeConfig(),
        transport: 'native-asar',
      });
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(script);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/host-events') {
      if (!verifyAuth(req, urlObj)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid sidecar token' });
        return;
      }
      res.writeHead(200, {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      sseClients.add(res);
      res.write(`event: hello\ndata: ${JSON.stringify({ ok: true, origin, seq: themeEvents.seq })}\n\n`);
      const cleanupClient = () => sseClients.delete(res);
      req.on('close', cleanupClient);
      res.on('close', cleanupClient);
      res.on('error', cleanupClient);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/host-asar/status') {
      sendJson(res, 200, {
        ...getHostAsarStatus(options.hostAsarOpts),
        nativeClientCount: sseClients.size,
        nativeConnected: sseClients.size > 0,
        nativePatchAutoHealed,
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/host-asar/apply') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      try {
        sendJson(res, 200, applyHostAsarPatch({ ...(options.hostAsarOpts || {}), allowKillRunning: false }));
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/host-asar/restore') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      try {
        sendJson(res, 200, restoreHostAsarPatch({ ...(options.hostAsarOpts || {}), allowKillRunning: false }));
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'GET' && pathname === '/api/cdp/status') {
      sendJson(res, 200, {
        ok: true,
        cdp: buildHostStatusSummary(),
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/cdp/toggle') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      const body = await readJsonBody(req);
      const nextEnabled = typeof body.enabled === 'boolean' ? body.enabled : !hostOverlayEnabled;
      hostOverlayEnabled = nextEnabled;
      if (cdpInjector) {
        await cdpInjector.setEnabled(nextEnabled);
      }
      broadcastSse('host-toggle', { enabled: nextEnabled });
      sendJson(res, 200, { ok: true, cdp: buildHostStatusSummary() });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/startup/replay') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      if (sseClients.size > 0) {
        broadcastSse('startup-replay', { manual: true, ts: Date.now() });
        sendJson(res, 200, { ok: true, replayed: true, transport: 'native-asar' });
        return;
      }
      if (!cdpInjector) {
        sendJson(res, 200, { ok: false, replayed: false, error: '主窗口尚未附着（CDP 与原生引导均未连接）' });
        return;
      }
      try {
        const result = await cdpInjector.replayStartup();
        sendJson(res, 200, result);
      } catch (err) {
        sendJson(res, 500, { ok: false, replayed: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'GET' && pathname === '/api/startup-asar/status') {
      sendJson(res, 200, getStartupAsarStatus(options.startupAsarOpts));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/startup-asar/apply') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      try {
        sendJson(res, 200, applyStartupAsarPatch({ ...(options.startupAsarOpts || {}), allowKillRunning: false }));
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/startup-asar/restore') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      try {
        sendJson(res, 200, restoreStartupAsarPatch({ ...(options.startupAsarOpts || {}), allowKillRunning: false }));
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'GET' && pathname === '/api/native-patch/status') {
      sendJson(res, 200, getNativePatchStatus({ swarmDir: swarmPaths.swarmBoardDir, bundlePath: swarmPaths.bundlePath, spritesSourceDir: swarmPaths.spritesSourceDir, logoPngPath: swarmPaths.logoPngPath }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/native-patch/apply') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      try {
        sendJson(res, 200, applyNativePatch({ swarmDir: swarmPaths.swarmBoardDir, bundlePath: swarmPaths.bundlePath, spritesSourceDir: swarmPaths.spritesSourceDir, logoPngPath: swarmPaths.logoPngPath }));
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/native-patch/restore') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      try {
        sendJson(res, 200, restoreNativePatch({ swarmDir: swarmPaths.swarmBoardDir }));
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
      return;
    }

    if (req.method === 'GET' && pathname === '/api/swarm') {
      if (urlObj.searchParams.get('demo') === '1') {
        sendJson(res, 200, buildDemoSwarmSnapshot());
        return;
      }
      const conv = String(urlObj.searchParams.get('conversationId') || '').trim();
      const reqEtag = String(urlObj.searchParams.get('etag') || '').trim();
      const snap = readReadOnlySwarmSnapshot(conv, options.appDataDirs);
      if (reqEtag && snap.etag && reqEtag === snap.etag) {
        sendJson(res, 200, {
          conversationId: snap.conversationId,
          swarm: snap.swarm,
          member: snap.member,
          unchanged: true,
          etag: snap.etag,
        });
        return;
      }
      sendJson(res, 200, snap);
      return;
    }

    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      const nativeIndex = path.join(swarmPaths.swarmBoardDir, 'index.html');
      const tok = hostEnvToken || generatedToken;
      if (fs.existsSync(nativeIndex)) {
        let html = fs.readFileSync(nativeIndex, 'utf8');
        html = html.replace(/<!-- GEMINEKO_HIVE_START -->[\s\S]*?<!-- GEMINEKO_HIVE_END -->/g, '');
        // 移除 Google Fonts 外部阻塞链接，避免离线或弱网环境下卡住 Sidecar iframe load 事件
        html = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '');
        html = html.replace(/<link[^>]+fonts\.gstatic\.com[^>]*>/gi, '');
        const injectBoot = `<script>window.__GEMINEKO_SIDECAR_MODE__=true;window.__SIDECAR_TOKEN__=${JSON.stringify(tok)};</script><script src="/gemineko-hive.js"></script>`;
        html = html.includes('</body>') ? html.replace('</body>', `${injectBoot}\n</body>`) : html + injectBoot;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(html);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(renderStandaloneFallbackHtml(tok));
      return;
    }

    if (req.method === 'GET' && NATIVE_STATIC_TYPES[pathname]) {
      const [fileName, contentType] = NATIVE_STATIC_TYPES[pathname];
      const filePath = path.join(swarmPaths.swarmBoardDir, fileName);
      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
        res.end(fs.readFileSync(filePath));
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }

  const server = createServer((req, res) => {
    void dispatch(req, res).catch((err) => {
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, error: err?.message || String(err) });
      }
    });
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(listenPort, '127.0.0.1', () => {
      server.off('error', rejectListen);
      resolveListen();
    });
  });

  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : listenPort;
  const origin = `http://127.0.0.1:${actualPort}`;
  const runtimeEndpointPath = options.runtimeEndpointPath
    ? path.resolve(options.runtimeEndpointPath)
    : getDefaultRuntimeEndpointPath();

  const writeRuntimeEndpoint = () => {
    try {
      const dir = path.dirname(runtimeEndpointPath);
      fs.mkdirSync(dir, { recursive: true });
      const tmp = `${runtimeEndpointPath}.tmp.${process.pid}`;
      const payload = {
        origin,
        port: actualPort,
        token: validTokens[0] || generatedToken,
        pid: process.pid,
        version: BRAND_META.version,
        updatedAt: Date.now(),
      };
      fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tmp, runtimeEndpointPath);
    } catch {
      /* 忽略名片写入异常，不影响 Sidecar 主循环 */
    }
  };
  writeRuntimeEndpoint();

  if (options.enableCdp !== false) {
    cdpInjector = new CdpHostInjector({
      serverBaseUrl: origin,
      logoDataUri,
      debugPort: options.cdpPort,
      sideToken: validTokens[0] || generatedToken,
      getThemeConfig: () => getEnrichedThemeConfig(),
    });
    cdpInjector.start();
  }

  const inject = async ({ method = 'GET', url = '/', headers = {}, body = '' } = {}) => {
    const res = await fetch(`${origin}${url}`, {
      method,
      headers,
      ...(method === 'POST' ? { body } : {}),
    });
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      text,
      json() {
        return JSON.parse(text);
      },
    };
  };

  return {
    server,
    port: actualPort,
    origin,
    sideToken: generatedToken,
    runtimeEndpointPath,
    cdpInjector,
    inject,
    close: () => {
      clearInterval(ssePingTimer);
      for (const client of Array.from(sseClients)) {
        try { client.end(); } catch {}
      }
      sseClients.clear();
      try {
        if (fs.existsSync(runtimeEndpointPath)) {
          const cur = JSON.parse(fs.readFileSync(runtimeEndpointPath, 'utf8'));
          if (cur && Number(cur.pid) === process.pid) {
            fs.unlinkSync(runtimeEndpointPath);
          }
        }
      } catch {}
      if (cdpInjector) cdpInjector.stop();
      return new Promise((resolveClose) => {
        server.closeAllConnections?.();
        server.close(() => resolveClose());
      });
    },
  };
}
