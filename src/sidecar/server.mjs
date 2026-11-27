/**
 * Gemineko Hive · 基米窝独立伴生 Sidecar HTTP 服务（零外部依赖）。
 * 1. 只读扫描本地 ~/.gemini/<product>/brain/<conv>/ 提供兼容官方的 /api/swarm（并实时注入 25 态动作）；
 * 2. 提供 /gemineko-sprites/*.png 本地静态精灵图路由（带跨域头，支持主对话 CDP 挂件直接读取）；
 * 3. 提供 /api/live-activity 实时解析主对话区当前是编排模式还是执行模式及具体工具动作；
 * 4. 提供 /api/cdp/{status,toggle} 启停 Antigravity 主窗口 CDP 实时悬浮挂载；
 * 5. 提供 /api/native-patch/{status,apply,restore} 供侧边栏一键换肤与无损还原。
 */

import { randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichSwarmMembersWithActivity, findActiveConversationActivity } from '../activity-tracker.mjs';
import { CdpHostInjector } from '../cdp/host-injector.mjs';
import { applyNativePatch, getNativePatchStatus, resolveSwarmPaths, restoreNativePatch } from '../native-patcher.mjs';
import { buildDemoSwarmSnapshot } from '../theme/demo-data.js';

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

  for (const appData of dirs) {
    const brainDir = path.join(appData, 'brain');
    if (requestedConv && /^[0-9a-f-]{8,}$/i.test(requestedConv)) {
      const direct = path.join(brainDir, requestedConv, '.system_generated', 'swarm');
      if (fs.existsSync(path.join(direct, 'members.json'))) {
        chosen = { conv: requestedConv, swarmDir: direct, mtimeMs: fs.statSync(path.join(direct, 'members.json')).mtimeMs };
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
    conversationId: chosen.conv,
    swarm: chosen.conv,
    id: chosen.conv,
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

  function verifyAuth(req) {
    const reqTok = typeof req.headers['x-sidecar-token'] === 'string' ? req.headers['x-sidecar-token'].trim() : '';
    return validTokens.some((tk) => safeTokenCompare(reqTok, tk));
  }

  let cdpInjector = null;

  async function dispatch(req, res) {
    const urlObj = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = urlObj.pathname;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (req.method === 'GET' && pathname === '/healthz') {
      sendJson(res, 200, { ok: true, plugin: 'gemineko-hive', version: '0.3.1', sidecar: 'hive_board' });
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

    // 精灵 PNG 图片路由（禁止路径穿越）
    if (req.method === 'GET' && pathname.startsWith('/gemineko-sprites/')) {
      const fileName = pathname.slice('/gemineko-sprites/'.length);
      if (!/^[a-z0-9_-]+\.png$/i.test(fileName)) {
        res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Invalid sprite name');
        return;
      }
      const absFile = path.join(swarmPaths.spritesSourceDir, fileName);
      if (!fs.existsSync(absFile)) {
        res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Sprite not found');
        return;
      }
      res.writeHead(200, {
        ...CORS_HEADERS,
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      });
      res.end(fs.readFileSync(absFile));
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

    if (req.method === 'GET' && pathname === '/api/cdp/status') {
      sendJson(res, 200, {
        ok: true,
        cdp: cdpInjector ? cdpInjector.getStatus() : { enabled: false, state: 'disabled', hint: '当前模式未启用 CDP 注入' },
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/cdp/toggle') {
      if (!verifyAuth(req)) {
        sendJson(res, 403, { ok: false, error: 'Missing or invalid X-Sidecar-Token' });
        return;
      }
      if (!cdpInjector) {
        sendJson(res, 200, { ok: true, cdp: { enabled: false, state: 'disabled' } });
        return;
      }
      const body = await readJsonBody(req);
      const nextEnabled = typeof body.enabled === 'boolean' ? body.enabled : !cdpInjector.enabled;
      const status = await cdpInjector.setEnabled(nextEnabled);
      sendJson(res, 200, { ok: true, cdp: status });
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

  if (options.enableCdp !== false) {
    cdpInjector = new CdpHostInjector({
      serverBaseUrl: origin,
      logoDataUri,
      debugPort: options.cdpPort,
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
    cdpInjector,
    inject,
    close: () => {
      if (cdpInjector) cdpInjector.stop();
      return new Promise((resolveClose) => {
        server.close(() => resolveClose());
      });
    },
  };
}
