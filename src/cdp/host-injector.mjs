/**
 * @file Antigravity 主窗口 CDP 运行时注入器（不修改 app.asar）
 * 检测 %APPDATA%\Antigravity\DevToolsActivePort 或 127.0.0.1:19222 调试端口，
 * 向主聊天界面挂载：
 * 1. 位置 A：输入栏左上沿固定锚定的透明动态猫娘 + 玻璃态模式徽章（不可拖拽，自适应缩放/字体变化）；
 * 2. 位置 B：聊天流最底部活跃状态行（Thinking/Working/Running 等）旁动态透明立绘（结束自动收起）；
 * 3. /api/live-activity?conversationId=... 按当前主窗口对话 ID 精准追踪，不串台。
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildHostEasterEggsRuntimeSnippet } from './host-easter-eggs-runtime.mjs';
import { buildHostI18nRuntimeSnippet } from './host-i18n-runtime.mjs';
import { buildHostMemeRuntimeSnippet } from './host-meme-runtime.mjs';
import { buildHostStartupRuntimeSnippet } from './host-startup-runtime.mjs';
import { buildHostThemeRuntimeSnippet } from './host-theme-runtime.mjs';

const DEFAULT_DEBUG_PORT = 19222;
const POLL_INTERVAL_MS = 1600;
const HEARTBEAT_INTERVAL_MS = 10_000;

/**
 * 将模型原始 ID 映射为简短友好的元素名 / X基米名称（支持中英双语切换）。
 * @param {string} modelStr
 * @param {string} [role]
 * @param {boolean} [isEnglish]
 * @returns {string}
 */
export function formatDockModelDisplay(modelStr, role = 'neon', isEnglish = false) {
  const m = String(modelStr || '').toLowerCase();
  const r = String(role || 'neon').toLowerCase();
  const rules = [
    ['neon', 'Neon', '氖基米'],
    ['hydrogen', 'Hydrogen', '氢基米'],
    ['carbon', 'Carbon', '碳基米'],
    ['argon', 'Argon', '氩基米'],
    ['helium', 'Helium', '氦基米'],
    ['lithium', 'Lithium', '锂基米'],
    ['flash', 'Flash', '闪基米'],
    ['claude', 'Claude', '克劳德'],
    ['gpt', 'GPT', 'GPT小龙'],
    ['sol', 'GPT Sol', 'GPT小龙'],
    ['astra', 'GPT Astra', 'GPT小龙'],
  ];
  for (const [kw, enName, zhName] of rules) {
    if (m.includes(kw)) return isEnglish ? enName : zhName;
  }
  const roleMap = {
    neon: ['Neon', '氖基米'],
    hydrogen: ['Hydrogen', '氢基米'],
    carbon: ['Carbon', '碳基米'],
    claude: ['Claude', '克劳德'],
    gpt: ['GPT', 'GPT小龙'],
  };
  const pair = roleMap[r] || roleMap.neon;
  return isEnglish ? pair[0] : pair[1];
}

/**
 * 将超长工具名（如 MCP 工具全称）精简为适合状态气泡展示的短语义名称。
 * @param {string} rawTool
 * @returns {string}
 */
export function formatDockToolDisplay(rawTool) {
  let s = String(rawTool || '').trim();
  if (!s) return '';
  if (s.startsWith('mcp_')) {
    s = s.slice(4);
    const segs = s.split('_').filter(Boolean);
    if (segs.length >= 3) {
      const tail2 = segs.slice(-2).join('_');
      s = tail2.length <= 16 ? tail2 : segs[segs.length - 1];
    } else if (segs.length === 2 && s.length > 16) {
      s = segs[1];
    }
  } else if (s.includes('--')) {
    const segs = s.split('_').filter(Boolean);
    if (segs.length >= 2) {
      const tail2 = segs.slice(-2).join('_');
      s = tail2.length <= 16 ? tail2 : segs[segs.length - 1];
    }
  }
  if (s.length > 16) {
    return `${s.slice(0, 15)}…`;
  }
  return s;
}

/**
 * 验证 Host 仅允许本地回环地址，杜绝远程连接。
 * @param {string} host
 * @returns {boolean}
 */
function isLoopbackHost(host) {
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}

/**
 * 从环境变量路径中寻找 DevToolsActivePort 端口信息。
 * @returns {{ port: number, path: string }|null}
 */
export function readDevToolsActivePort() {
  const candidates = [];
  if (process.env.APPDATA) {
    candidates.push(join(process.env.APPDATA, 'Antigravity', 'DevToolsActivePort'));
  }
  if (process.env.LOCALAPPDATA) {
    candidates.push(join(process.env.LOCALAPPDATA, 'Antigravity', 'DevToolsActivePort'));
  }
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const raw = readFileSync(file, 'utf-8').trim().split(/\r?\n/);
      const port = Number(raw[0]);
      if (Number.isInteger(port) && port > 0 && port < 65536) {
        return { port, path: String(raw[1] || '').trim() };
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * 探测本地 CDP 调试目标列表。
 * @param {number} port
 * @returns {Promise<Array<any>>}
 */
async function fetchCdpTargets(port) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 1200);
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: ctrl.signal });
    if (!res.ok) return [];
    const list = await res.json();
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 挑选 Antigravity 主对话窗口对应的 CDP page target。
 * @param {Array<any>} targets
 * @returns {any|null}
 */
function pickPrimaryPageTarget(targets) {
  const pages = targets.filter((t) => {
    if (!t || !t.webSocketDebuggerUrl) return false;
    if (t.type !== 'page' && t.type !== 'webview') return false;
    try {
      const u = new URL(t.webSocketDebuggerUrl);
      return isLoopbackHost(u.hostname);
    } catch {
      return false;
    }
  });
  if (pages.length === 0) return null;
  const preferred = pages.find(
    (t) => /\/c\//i.test(t.url || '') || (/antigravity|workbench/i.test(`${t.title || ''} ${t.url || ''}`) && !/^data:/i.test(t.url || '')),
  );
  return preferred || pages[0];
}

/**
 * 构造向主聊天窗口注入的自包含幂等脚本 v0.5.0（含实时看板 + 原生宿主主题与联动彩蛋引擎）。
 * 运行在宿主 Electron 渲染进程浏览器上下文中。
 * @param {string} serverBaseUrl 例如 http://127.0.0.1:19876
 * @param {string} [logoDataUri]
 * @param {{ sideToken?: string, themeConfig?: any, transport?: string }} [options]
 * @returns {string}
 */
export function buildCdpOverlayScript(serverBaseUrl, logoDataUri = '', options = {}) {
  const baseJson = JSON.stringify(serverBaseUrl.replace(/\/+$/, ''));
  const logoJson = JSON.stringify(logoDataUri || '');
  const tokenJson = JSON.stringify(String(options?.sideToken || ''));
  const themeCfgJson = JSON.stringify(options?.themeConfig || null);
  const transportJson = JSON.stringify(String(options?.transport || 'cdp'));
  const themeSnippet = buildHostThemeRuntimeSnippet();
  const i18nSnippet = buildHostI18nRuntimeSnippet();
  const memeSnippet = buildHostMemeRuntimeSnippet();
  const eggsSnippet = buildHostEasterEggsRuntimeSnippet();
  const startupSnippet = buildHostStartupRuntimeSnippet();
  return `(() => {
  const SERVER = ${baseJson};
  const LOGO_URI = ${logoJson};
  const SIDE_TOKEN = ${tokenJson};
  const INITIAL_THEME_CONFIG = ${themeCfgJson};
  const TRANSPORT = ${transportJson};
  const DOCK_ID = 'gemineko-cdp-composer-dock';
  const LEGACY_CAPSULE_ID = 'gemineko-cdp-live-capsule';
  const INLINE_CLASS = 'gk-live-inline-wrap';
  const STYLE_ID = 'gemineko-cdp-style-v3';
  const COLLAPSE_PREF_KEY = 'gemineko_cdp_dock_collapsed_v3';

  if (typeof window.__GEMINEKO_CDP_UNMOUNT__ === 'function') {
    try { window.__GEMINEKO_CDP_UNMOUNT__(); } catch {}
  }

  function cleanupLegacyNodes() {
    const oldCapsule = document.getElementById(LEGACY_CAPSULE_ID);
    if (oldCapsule) oldCapsule.remove();
    const oldStyle = document.getElementById('gemineko-cdp-style');
    if (oldStyle) oldStyle.remove();
    document.querySelectorAll('.gk-step-avatar').forEach((n) => n.remove());
    document.querySelectorAll('[data-gemineko-step]').forEach((el) => el.removeAttribute('data-gemineko-step'));
    document.querySelectorAll('.' + INLINE_CLASS).forEach((n) => n.remove());
  }
  cleanupLegacyNodes();

  let stopped = false;
  let pollTimer = null;
  let routeI18nTimer = null;
  let syncRaf = null;
  let hostEventSource = null;
  let domObserver = null;
  let anchorResizeObserver = null;
  let dockResizeObserver = null;
  let currentAnchor = null;
  let lastDockW = 180;
  let lastDockH = 100;
  let lastPathname = location.pathname;
  let collapsed = false;
  try {
    collapsed = localStorage.getItem(COLLAPSE_PREF_KEY) === '1';
  } catch {}

  let latestState = {
    conversationId: '',
    active: false,
    role: 'neon',
    action: 'idle',
    actionLabel: '打盹摸鱼',
    phase: 'idle',
    phaseLabel: '待机中',
    model: 'gemini-4-neon',
    lastTool: '',
    spriteFile: 'neon-idle.png'
  };

  function getCurrentConversationId() {
    const m = String(window.location.pathname || '').match(/\\/c\\/([0-9a-f-]{8,})/i);
    return m ? m[1] : '';
  }

  function isHostDarkTheme() {
    try {
      const bg = getComputedStyle(document.body).backgroundColor || '';
      const nums = bg.match(/\\d+/g);
      if (nums && nums.length >= 3) {
        const lum = (Number(nums[0]) * 299 + Number(nums[1]) * 587 + Number(nums[2]) * 114) / 1000;
        return lum < 135;
      }
    } catch {}
    return document.documentElement.classList.contains('dark');
  }

  function ensureStyle() {
    const prev = document.getElementById(STYLE_ID);
    if (prev) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = \`
      #\${DOCK_ID} {
        position: fixed;
        z-index: 25;
        display: flex;
        align-items: flex-end;
        gap: calc(7px * var(--gk-dock-badge-scale, 1.15));
        pointer-events: none;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif !important;
        font-size: calc(12px * var(--gk-host-font-scale, 1)) !important;
        line-height: 1.25 !important;
        transition: opacity 0.16s ease;
      }
      #\${DOCK_ID}.is-right {
        flex-direction: row-reverse;
      }
      #\${DOCK_ID}.is-right .gk-dock-badge {
        flex-direction: row-reverse;
      }
      #\${DOCK_ID}.is-hidden {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #\${DOCK_ID}.is-hidden * {
        pointer-events: none !important;
      }
      #\${DOCK_ID} .gk-dock-cat {
        position: relative;
        width: var(--gk-dock-cat-size, 100px);
        height: var(--gk-dock-cat-size, 100px);
        flex-shrink: 0;
        pointer-events: auto;
        cursor: pointer;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      #\${DOCK_ID} img.gk-dock-sprite {
        width: var(--gk-dock-cat-size, 100px);
        height: var(--gk-dock-cat-size, 100px);
        object-fit: contain;
        image-rendering: auto;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        display: block;
        filter: drop-shadow(0 3px 6px rgba(124, 108, 246, 0.24));
        transform-origin: center bottom;
        transition: transform 0.18s ease, filter 0.18s ease;
      }
      #\${DOCK_ID} .gk-dock-cat:hover img.gk-dock-sprite {
        transform: translateY(-2px);
        filter: drop-shadow(0 5px 10px rgba(236, 72, 153, 0.34));
      }
      #\${DOCK_ID} .gk-dock-badge {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: calc(7px * var(--gk-dock-badge-scale, 1.15));
        margin-bottom: 6px;
        padding: calc(5px * var(--gk-dock-badge-scale, 1.15)) calc(9px * var(--gk-dock-badge-scale, 1.15)) calc(5px * var(--gk-dock-badge-scale, 1.15)) calc(10px * var(--gk-dock-badge-scale, 1.15));
        border-radius: calc(14px * var(--gk-dock-badge-scale, 1.15));
        background: rgba(255, 252, 255, 0.96);
        border: 1px solid rgba(139, 92, 246, 0.38);
        box-shadow: 0 4px 14px rgba(103, 76, 178, 0.16);
        color: #261d3d;
        -webkit-font-smoothing: auto;
        text-rendering: geometricPrecision;
        max-width: min(calc(270px * var(--gk-dock-badge-scale, 1.15)), calc(var(--gk-composer-w, 640px) - var(--gk-dock-cat-size, 88px) - 32px), calc(100vw - 120px));
        overflow: hidden;
      }
      #\${DOCK_ID}.is-dark .gk-dock-badge {
        background: rgba(24, 20, 44, 0.94);
        border-color: rgba(167, 139, 250, 0.48);
        color: #f5f3ff;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.42);
      }
      #\${DOCK_ID}.is-collapsed .gk-dock-badge-body {
        display: none;
      }
      #\${DOCK_ID}.is-collapsed .gk-dock-badge {
        padding: calc(3px * var(--gk-dock-badge-scale, 1.15));
        border-radius: 999px;
        margin-bottom: 8px;
      }
      #\${DOCK_ID} .gk-dock-badge-body {
        display: flex;
        flex-direction: column;
        gap: calc(2.5px * var(--gk-dock-badge-scale, 1.15));
        min-width: 0;
      }
      #\${DOCK_ID} .gk-top-row {
        display: flex;
        align-items: center;
        gap: calc(5px * var(--gk-dock-badge-scale, 1.15));
        font-size: calc(11.5px * var(--gk-dock-badge-scale, 1.15)) !important;
        font-weight: 700;
        white-space: nowrap;
      }
      #\${DOCK_ID} .gk-phase {
        padding: calc(1.5px * var(--gk-dock-badge-scale, 1.15)) calc(7px * var(--gk-dock-badge-scale, 1.15));
        border-radius: 999px;
        font-size: calc(10.5px * var(--gk-dock-badge-scale, 1.15)) !important;
        color: #fff;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        flex-shrink: 0;
      }
      #\${DOCK_ID} .gk-phase.is-executor {
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
      }
      #\${DOCK_ID} .gk-phase.is-idle {
        background: #94a3b8;
      }
      #\${DOCK_ID} .gk-action {
        color: #6d28d9;
        font-size: calc(11.5px * var(--gk-dock-badge-scale, 1.15)) !important;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #\${DOCK_ID}.is-dark .gk-action {
        color: #d8b4fe;
      }
      #\${DOCK_ID} .gk-sub-row {
        display: flex;
        align-items: center;
        gap: calc(5px * var(--gk-dock-badge-scale, 1.2));
        font-size: calc(11px * var(--gk-dock-badge-scale, 1.2)) !important;
        color: #4c3e6b;
        white-space: nowrap;
        min-width: 0;
        overflow: hidden;
      }
      #\${DOCK_ID}.is-dark .gk-sub-row {
        color: #e2e8f0;
      }
      #\${DOCK_ID} .gk-model {
        font-weight: 700;
        flex-shrink: 0;
        white-space: nowrap;
      }
      #\${DOCK_ID} .gk-tool {
        min-width: 0;
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.86;
      }
      #\${DOCK_ID} .gk-collapse-btn {
        border: none;
        background: rgba(139, 92, 246, 0.16);
        color: #6d28d9;
        width: calc(21px * var(--gk-dock-badge-scale, 1.15));
        height: calc(21px * var(--gk-dock-badge-scale, 1.15));
        border-radius: 999px;
        cursor: pointer;
        font-size: calc(12px * var(--gk-dock-badge-scale, 1.15)) !important;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #\${DOCK_ID}.is-dark .gk-collapse-btn {
        background: rgba(167, 139, 250, 0.24);
        color: #f5f3ff;
      }
      /* 聊天流最底部活跃行旁动态透明立绘 */
      .\${INLINE_CLASS} {
        position: relative;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        width: calc(30px * var(--gk-host-font-scale, 1));
        height: calc(30px * var(--gk-host-font-scale, 1));
        margin-right: 4px;
        flex-shrink: 0;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        pointer-events: none;
        vertical-align: middle;
      }
      .\${INLINE_CLASS} img.gk-inline-sprite {
        width: calc(30px * var(--gk-host-font-scale, 1));
        height: calc(30px * var(--gk-host-font-scale, 1));
        object-fit: contain;
        image-rendering: auto;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        display: block;
        filter: drop-shadow(0 2px 6px rgba(124, 108, 246, 0.34));
        transform-origin: center bottom;
      }
      .\${INLINE_CLASS} .gk-inline-spark {
        position: absolute;
        top: -2px;
        right: -2px;
        font-size: 10px !important;
        line-height: 1;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        animation: gkSparkPulse 1.4s ease-in-out infinite;
      }
      /* APNG 本身含 4 帧动作动画，去掉叠在立绘上的 CSS 小数位 scale/rotate 重采样避免小图发糊 */
      .gk-act-thinking,
      .gk-act-reading,
      .gk-act-editing,
      .gk-act-running,
      .gk-act-asking,
      .gk-act-idle {
        animation: none !important;
      }
      @keyframes gkSparkPulse {
        0%, 100% { opacity: 0.7; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.16); }
      }
      .gk-heart-pop {
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        font-size: 16px !important;
        animation: gkFloatUp 0.85s ease-out forwards;
      }
      @keyframes gkFloatUp {
        0% { opacity: 1; transform: translateY(0) scale(0.9); }
        100% { opacity: 0; transform: translateY(-28px) scale(1.25); }
      }
    \`;
    document.head.appendChild(style);
  }

  function spawnHeart(x, y) {
    const h = document.createElement('div');
    h.className = 'gk-heart-pop';
    h.textContent = '💖';
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 900);
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 40) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function findComposerAnchor() {
    const byId = document.getElementById('antigravity.agentSidePanelInputBox');
    if (isElementVisible(byId)) return byId;

    const composers = document.querySelectorAll('.surface-composer, .surface-composer-card');
    for (const c of composers) {
      if (isElementVisible(c)) {
        const r = c.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.45 && r.width >= 260) return c;
      }
    }

    const inputs = document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]');
    for (const inp of inputs) {
      if (!isElementVisible(inp)) continue;
      let cur = inp;
      let best = null;
      for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
        const r = cur.getBoundingClientRect();
        if (r.width >= 260 && r.height >= 55 && r.height <= 360 && r.bottom > window.innerHeight - 160) {
          best = cur;
        }
        cur = cur.parentElement;
      }
      if (best) return best;
    }
    return null;
  }

  function ensureDock() {
    ensureStyle();
    let dock = document.getElementById(DOCK_ID);
    if (dock) return dock;

    dock = document.createElement('div');
    dock.id = DOCK_ID;
    if (collapsed) dock.classList.add('is-collapsed');

    dock.innerHTML = \`
      <div class="gk-dock-cat" title="点击摸头 💖（固定在输入栏左上沿）">
        <img class="gk-dock-sprite" alt="gemineko" />
      </div>
      <div class="gk-dock-badge">
        <div class="gk-dock-badge-body">
          <div class="gk-top-row">
            <span class="gk-phase">编排模式</span>
            <span class="gk-action">思考中</span>
          </div>
          <div class="gk-sub-row">
            <span class="gk-model">gemini-4-neon</span>
            <span class="gk-tool"></span>
          </div>
        </div>
        <button type="button" class="gk-dock-theme-btn" title="基米窝主题与彩蛋快切">🎨</button>
        <button type="button" class="gk-collapse-btn" title="展开/收起状态标签">\${collapsed ? '›' : '‹'}</button>
      </div>
    \`;

    const catEl = dock.querySelector('.gk-dock-cat');
    const themeBtn = dock.querySelector('.gk-dock-theme-btn');
    const collapseBtn = dock.querySelector('.gk-collapse-btn');

    catEl.addEventListener('click', (e) => {
      e.stopPropagation();
      spawnHeart(e.clientX - 8, e.clientY - 14);
      themeSuite?.onDockPoke?.(latestState.role || 'neon', e.clientX, e.clientY, catEl);
    });

    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeSuite?.toggleMiniBar?.(themeBtn);
    });

    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      collapsed = !collapsed;
      dock.classList.toggle('is-collapsed', collapsed);
      const isRight = dock.classList.contains('is-right');
      collapseBtn.textContent = isRight ? (collapsed ? '‹' : '›') : (collapsed ? '›' : '‹');
      try { localStorage.setItem(COLLAPSE_PREF_KEY, collapsed ? '1' : '0'); } catch {}
      scheduleSync();
    });

    document.body.appendChild(dock);
    if (typeof ResizeObserver === 'function') {
      if (dockResizeObserver) dockResizeObserver.disconnect();
      dockResizeObserver = new ResizeObserver(() => scheduleSync());
      dockResizeObserver.observe(dock);
    }
    renderDockState();
    return dock;
  }

  function getHostDockConfig() {
    const fromApi = window.__GEMINEKO_THEME_API__?.getDockConfig?.();
    if (fromApi && typeof fromApi === 'object') return fromApi;
    try {
      const raw = localStorage.getItem('gemineko_host_dock_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            side: parsed.side === 'right' ? 'right' : 'left',
            catSize: Math.max(52, Math.min(140, Math.round(Number(parsed.catSize) || 100))),
            badgeScale: Math.max(85, Math.min(150, Math.round(Number(parsed.badgeScale) || 120))),
            sidecarAvatarSize: Math.max(44, Math.min(112, Math.round(Number(parsed.sidecarAvatarSize) || 64))),
          };
        }
      }
    } catch {}
    return { side: 'left', catSize: 100, badgeScale: 120, sidecarAvatarSize: 64 };
  }

  const NATIVE_OVERLAY_SEL = '[role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"], [aria-modal="true"], [data-radix-popper-content-wrapper], [data-floating-ui-portal], [data-state="open"][role]';
  const SELF_OVERLAY_SEL = '#' + DOCK_ID + ', #gemineko-dock-minibar, #gemineko-paw-outline-pop, #gemineko-context-menu, #gemineko-meme-picker, #gemineko-home-stage, #gemineko-corner-watermark';

  function hasBlockingNativeOverlay(dockBox) {
    const els = document.querySelectorAll(NATIVE_OVERLAY_SEL);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!el || !el.isConnected) continue;
      if (el.closest && el.closest(SELF_OVERLAY_SEL)) continue;
      if (el.querySelector && el.querySelector('#' + DOCK_ID)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) continue;
      const role = el.getAttribute('role') || '';
      const isModal = role === 'dialog' || role === 'alertdialog' || el.getAttribute('aria-modal') === 'true';
      if (isModal && r.width > 200 && r.height > 120) return true;
      if (!(r.right < dockBox.left - 6 || r.left > dockBox.right + 6 || r.bottom < dockBox.top - 6 || r.top > dockBox.bottom + 6)) {
        return true;
      }
    }
    return false;
  }

  function syncDockPosition() {
    if (stopped) return;
    const dock = ensureDock();
    const dockCfg = getHostDockConfig();
    const isRight = dockCfg.side === 'right';
    dock.classList.toggle('is-dark', isHostDarkTheme());
    dock.classList.toggle('is-right', isRight);
    const catEl = dock.querySelector('.gk-dock-cat');
    if (catEl) {
      catEl.title = isRight ? '点击摸头 💖（停靠在输入框右上方）' : '点击摸头 💖（停靠在输入框左上方）';
    }
    const collapseBtn = dock.querySelector('.gk-collapse-btn');
    if (collapseBtn) {
      collapseBtn.textContent = isRight ? (collapsed ? '‹' : '›') : (collapsed ? '›' : '‹');
    }

    const anchor = findComposerAnchor();
    if (anchor !== currentAnchor) {
      if (anchorResizeObserver) anchorResizeObserver.disconnect();
      currentAnchor = anchor;
      if (anchor && typeof ResizeObserver === 'function') {
        anchorResizeObserver = new ResizeObserver(() => scheduleSync());
        anchorResizeObserver.observe(anchor);
      }
    }

    if (!anchor) {
      dock.classList.add('is-hidden');
      return;
    }

    // 空白首页迎宾舞台或活跃 ask_question 提问舞台出现时自动隐藏小猫 Dock，消除重叠
    const homeStage = document.getElementById('gemineko-home-stage');
    if (homeStage && homeStage.isConnected) {
      const hr = homeStage.getBoundingClientRect();
      if (hr.width > 60 && hr.height > 20) {
        dock.classList.add('is-hidden');
        return;
      }
    }
    const askStage = document.querySelector('[data-gk-ask-stage="1"]');
    if (askStage && askStage.isConnected && askStage.offsetHeight > 40) {
      dock.classList.add('is-hidden');
      return;
    }

    const r = anchor.getBoundingClientRect();
    if (r.width < 120 || r.top < 80 || r.bottom > window.innerHeight + 40) {
      dock.classList.add('is-hidden');
      return;
    }

    dock.style.setProperty('--gk-composer-w', Math.round(r.width) + 'px');
    const dr = dock.getBoundingClientRect();
    const measuredW = Math.ceil(dr.width || dock.offsetWidth || 0);
    const measuredH = Math.ceil(dr.height || dock.offsetHeight || 0);
    const dockW = measuredW > 20 ? measuredW : lastDockW;
    const dockH = measuredH > 20 ? measuredH : (lastDockH || dockCfg.catSize || 100);
    const rawLeft = isRight ? Math.round(r.right - dockW - 12) : Math.round(r.left + 12);
    const left = Math.max(8, Math.min(Math.max(8, window.innerWidth - dockW - 8), rawLeft));
    // 严格停靠在输入栏顶部 2px 之上，确保小猫与气泡无论放大缩小都不压入输入区
    const top = Math.max(40, Math.round(r.top - dockH - 2));
    const dockBox = { left, top, right: left + dockW, bottom: top + dockH };

    if (hasBlockingNativeOverlay(dockBox)) {
      dock.classList.add('is-hidden');
      return;
    }

    dock.classList.remove('is-hidden');
    if (measuredW > 20 && measuredH > 20) {
      lastDockW = measuredW;
      lastDockH = measuredH;
    }
    if (dock.style.left !== left + 'px') dock.style.left = left + 'px';
    if (dock.style.top !== top + 'px') dock.style.top = top + 'px';
  }

  function actionClassFor(action) {
    if (action === 'editing') return 'gk-act-editing';
    if (action === 'reading') return 'gk-act-reading';
    if (action === 'running') return 'gk-act-running';
    if (action === 'asking') return 'gk-act-asking';
    if (action === 'idle') return 'gk-act-idle';
    return 'gk-act-thinking';
  }

  function actionSparkFor(action) {
    if (action === 'editing') return '⌨️';
    if (action === 'reading') return '🔍';
    if (action === 'running') return '⚡';
    if (action === 'asking') return '❓';
    if (action === 'idle') return '💤';
    return '✨';
  }

  function sanitizeSpriteFile(rawFile, role, action) {
    const safeRole = /^(neon|hydrogen|carbon|claude|gpt)$/.test(String(role || '')) ? String(role) : 'neon';
    const rawAct = String(action || '').toLowerCase();
    const safeAct = /^(thinking|reading|editing|running|asking|idle)$/.test(rawAct)
      ? rawAct
      : (latestState.active ? 'thinking' : 'idle');
    const clean = String(rawFile || '').trim();
    if (/^(neon|hydrogen|carbon|claude|gpt)-(thinking|reading|editing|running|asking|idle)\.png$/i.test(clean)) {
      return clean.toLowerCase();
    }
    return \`\${safeRole}-\${safeAct}.png\`;
  }

  function getHostSpriteQuality() {
    const apiQ = String(window.__GEMINEKO_THEME_API__?.getSpriteQuality?.() || '');
    if (apiQ === '384' || apiQ === '512' || apiQ === '1024') return apiQ;
    try {
      const lsQ = String(localStorage.getItem('gemineko_host_sprite_q_v1') || '');
      if (lsQ === '384' || lsQ === '512' || lsQ === '1024') return lsQ;
    } catch {}
    return '1024';
  }

  function bindImgFallback(imgEl, role) {
    if (!imgEl || imgEl.dataset.gkErrBound === '1') return;
    imgEl.dataset.gkErrBound = '1';
    imgEl.addEventListener('error', () => {
      if (imgEl.dataset.gkFallback === '1') return;
      imgEl.dataset.gkFallback = '1';
      const safeRole = /^(neon|hydrogen|carbon|claude|gpt)$/.test(String(role || '')) ? String(role) : 'neon';
      imgEl.src = \`\${SERVER}/gemineko-sprites/\${safeRole}-thinking.png?q=\${getHostSpriteQuality()}&v=0.8.0\`;
    });
  }

  function getActiveSpriteUrl() {
    const role = latestState.role || 'neon';
    const act = latestState.action || (latestState.active ? 'thinking' : 'idle');
    const spriteName = sanitizeSpriteFile(latestState.spriteFile, role, act);
    return \`\${SERVER}/gemineko-sprites/\${spriteName}?q=\${getHostSpriteQuality()}&v=0.8.0\`;
  }

  const formatDockModelDisplay = ${formatDockModelDisplay.toString()};
  const formatDockToolDisplay = ${formatDockToolDisplay.toString()};

  function renderDockState() {
    const dock = document.getElementById(DOCK_ID);
    if (!dock) return;
    const img = dock.querySelector('img.gk-dock-sprite');
    const phaseEl = dock.querySelector('.gk-phase');
    const actionEl = dock.querySelector('.gk-action');
    const modelEl = dock.querySelector('.gk-model');
    const toolEl = dock.querySelector('.gk-tool');

    bindImgFallback(img, latestState.role);
    const spinoActive = dock.classList.contains('gk-egg-spino-active');
    const nextSrc = getActiveSpriteUrl();
    if (!spinoActive && img.getAttribute('data-src') !== nextSrc) {
      img.dataset.gkFallback = '0';
      img.setAttribute('data-src', nextSrc);
      img.src = nextSrc;
    }
    const actCls = actionClassFor(latestState.action);
    const nextImgCls = 'gk-dock-sprite ' + actCls;
    if (!spinoActive && img.className !== nextImgCls) img.className = nextImgCls;

    const nextPhaseText = latestState.phaseLabel || '编排模式';
    if (!spinoActive && phaseEl.textContent !== nextPhaseText) phaseEl.textContent = nextPhaseText;
    const nextPhaseCls = 'gk-phase ' + (latestState.phase === 'executor' ? 'is-executor' : latestState.phase === 'idle' ? 'is-idle' : '');
    if (phaseEl.className !== nextPhaseCls) phaseEl.className = nextPhaseCls;

    const nextActText = latestState.actionLabel || '思考中';
    if (!spinoActive && actionEl.textContent !== nextActText) actionEl.textContent = nextActText;

    const fullModel = String(latestState.model || 'gemini-4-neon').replace(/-preview$/i, '');
    const isEnglish = window.__GEMINEKO_I18N_API__?.resolveEffectiveStyle?.() === 'off';
    const displayModel = formatDockModelDisplay(fullModel, latestState.role, isEnglish);
    if (modelEl.textContent !== displayModel) modelEl.textContent = displayModel;
    if (modelEl.title !== fullModel) modelEl.title = fullModel;

    const rawTool = String(latestState.lastTool || '').trim();
    const shortTool = formatDockToolDisplay(rawTool);
    const nextTool = shortTool ? \`· \${shortTool}\` : '';
    if (toolEl.textContent !== nextTool) toolEl.textContent = nextTool;
    if (toolEl.title !== rawTool) toolEl.title = rawTool;
  }

  function isInsideChecklistOrCard(el, scope) {
    if (!el) return false;
    if (el.closest('ol, ul, li, [role="list"], [role="listitem"], [data-testid="changed-files-card"], [data-testid="artifact-card"], [data-testid="bubble-artifact-card"]')) {
      return true;
    }
    if (el.closest('[data-testid="tool-group-collapsible"], [data-testid="thinking-collapsible-trigger"]')) {
      return false;
    }
    let cur = el.parentElement;
    for (let depth = 0; cur && cur !== scope && cur !== document.body && depth < 5; depth += 1) {
      try {
        const cs = getComputedStyle(cur);
        const bw = parseFloat(cs.borderTopWidth) || 0;
        const br = parseFloat(cs.borderRadius) || 0;
        if (bw >= 0.5 && cs.borderTopStyle !== 'none' && br >= 6) {
          const cr = cur.getBoundingClientRect();
          if (cr.height > 52) return true;
        }
      } catch {}
      cur = cur.parentElement;
    }
    return false;
  }

  function isHostCurrentlyGenerating() {
    return Boolean(
      latestState.active ||
      document.querySelector('[data-testid="input-cancel-button"], [data-testid="stop-button"]')
    );
  }

  function getLatestTurnMinY(scope) {
    if (!scope) return 45;
    const bubbles = scope.querySelectorAll('[data-testid="user-message-bubble"], .agy-user-bubble');
    for (let i = bubbles.length - 1; i >= 0; i -= 1) {
      const br = bubbles[i].getBoundingClientRect();
      if (br.height > 0 && br.bottom >= 0) {
        return Math.max(45, br.bottom);
      }
    }
    return 45;
  }

  function syncActiveStatusSprite() {
    if (stopped) return;
    const scope = document.querySelector('[data-testid="conversation-view"]') || document.body;
    const anchor = findComposerAnchor();
    const maxY = anchor ? anchor.getBoundingClientRect().top - 4 : window.innerHeight - 60;
    const minActiveY = getLatestTurnMinY(scope);
    const generating = isHostCurrentlyGenerating();
    let bestCandidate = null;
    let bestTop = -Infinity;

    if (scope) {
      // 1. 强信号层：识别宿主原生加载指示器 / 流光文本（含收起态内嵌 shimmer 按钮，排除步骤清单与历史折叠条）
      const liveSignals = scope.querySelectorAll('[data-testid="status-loading-spinner"], [class*="animate-shimmer"]');
      for (const sig of liveSignals) {
        if (!sig || !sig.isConnected) continue;
        if (sig.closest('#' + DOCK_ID) || sig.closest('.' + INLINE_CLASS)) continue;
        if (sig.closest('code, pre, textarea, [contenteditable="true"], .monaco-editor')) continue;
        if (sig.closest('[data-testid="worked-for-collapsible"]')) continue;
        if (sig.closest('aside.bg-sidebar, [data-testid="conversation-row-sidebar"]')) continue;
        if (isInsideChecklistOrCard(sig, scope)) continue;

        const collapsibleBtn = sig.closest('[data-testid="tool-group-collapsible"], [data-testid="thinking-collapsible-trigger"]');
        const hostLine = sig.closest('div, span, p') || sig;
        const p = collapsibleBtn
          ? collapsibleBtn
          : (hostLine.parentElement && /flex/.test(getComputedStyle(hostLine.parentElement).display) && getComputedStyle(hostLine.parentElement).flexDirection !== 'column'
            ? hostLine.parentElement
            : hostLine);
        if (isInsideChecklistOrCard(p, scope)) continue;
        const pText = (p.textContent || '').trim();
        if (/[+-]\\d+\\s+[+-]\\d+/.test(pText)) continue;
        const r = p.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0 || r.height > 64) continue;
        if (r.bottom < 45 || r.top > maxY) continue;
        if (r.top > bestTop) {
          bestTop = r.top;
          bestCandidate = p;
        }
      }

      // 2. 专治收起态层：生成期间直查最新一轮可见区内的活跃折叠按钮（按钮常无 shimmer 且距底栏可能超过 220px）
      if (!bestCandidate && generating) {
        const activeIngPattern = /^(?:Thinking|Working|Running|Planning|Editing|Reading|Searching|Writing|Analyzing|Checking|Building|Testing|Installing|Fetching|Calling|Executing|Updating|Creating|Deleting|Inspecting|Listing|Viewing|思考中|猫脑|处理中|认真干活|运行中|飞速狂奔|规划中|军师规划|分析中|阅读中|修改中|改文件中|查代码中|执行中|构建中|测试中)\\b/i;
        const completedPastPattern = /^(?:Thought|Worked|Edited|Read|Searched|Ran|Checked|Listed|Viewed|Created|Updated|Deleted|Finished|Completed|猫猫打工|已工作|已思考|已修改|已读取)\\b/i;
        const collapsibles = scope.querySelectorAll('[data-testid="tool-group-collapsible"], [data-testid="thinking-collapsible-trigger"]');
        for (const btn of collapsibles) {
          if (!btn || !btn.isConnected) continue;
          if (btn.closest('#' + DOCK_ID) || btn.closest('.' + INLINE_CLASS)) continue;
          if (btn.closest('[data-testid="worked-for-collapsible"]')) continue;
          if (btn.closest('aside.bg-sidebar, [data-testid="conversation-row-sidebar"]')) continue;
          if (btn.closest('ol, ul, li, [role="list"], [role="listitem"]')) continue;

          const r = btn.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0 || r.height > 64) continue;
          if (r.bottom < 45 || r.top < minActiveY - 12 || r.top > maxY) continue;

          const txt = (btn.textContent || '').trim();
          if (!txt || txt.length > 180) continue;
          if (/[+-]\\d+\\s+[+-]\\d+/.test(txt)) continue;

          const isOngoing = activeIngPattern.test(txt) || (!completedPastPattern.test(txt) && /\\b\\d+[sm]\\b/.test(txt));
          if (!isOngoing) continue;

          if (r.top > bestTop) {
            bestTop = r.top;
            bestCandidate = btn;
          }
        }
      }

      // 3. 空闲期绝不滞留；生成期间做纯文本兜底并归并到外层折叠按钮（基于最新一轮 Y 区间，不做 220px 误杀）
      if (!bestCandidate && generating) {
        const activePattern = /^(?:Thinking(?:\\s+for\\s+\\d|\\s*\\d|$)|Working(?:\\b|\\s*$)|Running\\b|Planning\\b|Editing\\b|Reading\\b|Searching\\b|Writing\\b|思考中|猫脑运转|猫脑高速运转|处理中|认真干活|运行中|飞速狂奔|规划中|军师规划|分析中|阅读中|修改中|改文件中)/i;
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const txt = (node.nodeValue || '').trim();
          if (!txt || txt.length > 72 || !activePattern.test(txt)) continue;
          if (/[+-]\\d+\\s+[+-]\\d+/.test(txt)) continue;
          const p = node.parentElement;
          if (!p) continue;
          if (p.closest('#' + DOCK_ID) || p.closest('.' + INLINE_CLASS)) continue;
          if (p.closest('code, pre, textarea, [contenteditable="true"], .monaco-editor')) continue;
          if (p.closest('[data-testid="worked-for-collapsible"]')) continue;
          if (isInsideChecklistOrCard(p, scope)) continue;
          const btn = p.closest('button, summary');
          if (btn && /^(?:Worked for|已工作|猫猫打工)\\b/i.test((btn.textContent || '').trim())) continue;

          const row = btn && btn.matches('[data-testid="tool-group-collapsible"], [data-testid="thinking-collapsible-trigger"]')
            ? btn
            : ((p.parentElement && /flex/.test(getComputedStyle(p.parentElement).display) && getComputedStyle(p.parentElement).flexDirection !== 'column')
              ? p.parentElement
              : p);
          const r = row.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0 || r.height > 64) continue;
          if (r.bottom < 45 || r.top < minActiveY - 12 || r.top > maxY) continue;

          if (r.top > bestTop) {
            bestTop = r.top;
            bestCandidate = row;
          }
        }
      }
    }

    // 防瞬态跳闪：若当前已挂载且仍处于活跃态，阻止因底部重绘瞬间向更上方历史区域大幅跳回（>90px）
    const existingWrap = document.querySelector('.' + INLINE_CLASS);
    if (generating && existingWrap && existingWrap.parentElement?.isConnected && bestCandidate && existingWrap.parentElement !== bestCandidate) {
      const prevTop = existingWrap.parentElement.getBoundingClientRect().top;
      if (bestTop < prevTop - 90) {
        return;
      }
    }

    // 清除不再活跃或非当前命中的历史挂件
    document.querySelectorAll('.' + INLINE_CLASS).forEach((el) => {
      if (!bestCandidate || el.parentElement !== bestCandidate) {
        el.remove();
      }
    });

    if (!bestCandidate) return;

    let wrap = bestCandidate.querySelector('.' + INLINE_CLASS);
    if (!wrap) {
      wrap = document.createElement('span');
      wrap.className = INLINE_CLASS;
      wrap.innerHTML = '<img class="gk-inline-sprite" alt="" /><span class="gk-inline-spark"></span>';
      bestCandidate.prepend(wrap);
    }

    const spriteUrl = getActiveSpriteUrl();
    const effectiveAction = generating ? (latestState.action || 'thinking') : 'thinking';
    const img = wrap.querySelector('img.gk-inline-sprite');
    const spark = wrap.querySelector('.gk-inline-spark');
    bindImgFallback(img, latestState.role);
    if (img && img.getAttribute('data-src') !== spriteUrl) {
      img.dataset.gkFallback = '0';
      img.setAttribute('data-src', spriteUrl);
      img.src = spriteUrl;
    }
    const imgCls = 'gk-inline-sprite ' + actionClassFor(effectiveAction);
    if (img && img.className !== imgCls) img.className = imgCls;
    const sp = actionSparkFor(effectiveAction);
    if (spark && spark.textContent !== sp) spark.textContent = sp;
  }

  function replaceOpenSwarmPillLogo() {
    if (!LOGO_URI) return;
    const links = document.querySelectorAll('a, button');
    for (const node of links) {
      if (node.getAttribute('data-gemineko-pill') === '1') continue;
      if (!/(?:Open the Swarm UI|打开基米窝面板)/i.test(node.textContent || '')) continue;
      const svg = node.querySelector('svg');
      if (svg) {
        const img = document.createElement('img');
        img.src = LOGO_URI;
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.borderRadius = '4px';
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '4px';
        svg.replaceWith(img);
        node.setAttribute('data-gemineko-pill', '1');
      }
    }
  }

  function scheduleSync() {
    if (stopped || syncRaf) return;
    syncRaf = requestAnimationFrame(() => {
      syncRaf = null;
      if (stopped) return;
      syncDockPosition();
      syncActiveStatusSprite();
      replaceOpenSwarmPillLogo();
    });
  }

  async function pollActivity() {
    if (stopped) return;
    try {
      const convId = getCurrentConversationId();
      const qs = convId ? \`?conversationId=\${encodeURIComponent(convId)}\` : '';
      const res = await fetch(\`\${SERVER}/api/live-activity\${qs}\`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.activity) {
          latestState = { ...latestState, ...data.activity };
          renderDockState();
          syncActiveStatusSprite();
          themeSuite?.onActivityUpdate?.(latestState);
        }
      }
    } catch {}
    syncDockPosition();
    if (!stopped) {
      pollTimer = setTimeout(pollActivity, ${POLL_INTERVAL_MS});
    }
  }

  const onViewportChange = () => scheduleSync();
  const onOverlayTrigger = () => requestAnimationFrame(() => scheduleSync());
  const onUrlCheck = () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
      pollActivity();
      i18nEngine?.rescan?.();
      if (routeI18nTimer) clearTimeout(routeI18nTimer);
      routeI18nTimer = setTimeout(() => {
        routeI18nTimer = null;
        if (!stopped) i18nEngine?.rescan?.();
      }, 180);
    }
    scheduleSync();
  };

  ${i18nSnippet}
  ${memeSnippet}
  ${themeSnippet}
  ${eggsSnippet}
  ${startupSnippet}

  const i18nEngine = initHostI18nEngine(INITIAL_THEME_CONFIG);
  const memeEngine = initHostMemeEngine({
    server: SERVER,
    dockId: DOCK_ID,
    initialConfig: INITIAL_THEME_CONFIG,
  });
  let eggEngine = null;
  let startupEngine = null;
  const themeSuite = initHostThemeSuite({
    server: SERVER,
    token: SIDE_TOKEN,
    dockId: DOCK_ID,
    getActivity: () => latestState,
    initialConfig: INITIAL_THEME_CONFIG,
    onConfigApplied: (nextCfg) => {
      i18nEngine?.applyConfig?.(nextCfg);
      memeEngine?.applyConfig?.(nextCfg);
      eggEngine?.applyConfig?.(nextCfg);
      startupEngine?.applyConfig?.(nextCfg);
      renderDockState();
      syncActiveStatusSprite();
      syncDockPosition();
      scheduleSync();
    },
    onLongTaskFinished: () => memeEngine?.triggerFinishSticker?.(),
    openMemePicker: (anchorEl) => memeEngine?.toggleMemePicker?.(anchorEl),
    replayStartup: () => startupEngine?.replay?.({ manual: true }),
  });
  startupEngine = initHostStartupEngine({
    server: SERVER,
    initialConfig: INITIAL_THEME_CONFIG,
    spawnStardust: themeSuite?.spawnStardust,
  });
  eggEngine = initHostEasterEggs({
    server: SERVER,
    token: SIDE_TOKEN,
    dockId: DOCK_ID,
    initialConfig: INITIAL_THEME_CONFIG,
    getActivity: () => latestState,
    showSpeechBubble: themeSuite?.showSpeechBubble,
    spawnStardust: themeSuite?.spawnStardust,
    triggerHiveParadeBurst: themeSuite?.triggerHiveParadeBurst,
  });
  fetch(\`\${SERVER}/api/theme/config\`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d?.config) themeSuite.applyConfig(d.config); })
    .catch(() => {});

  if (typeof window.EventSource === 'function') {
    try {
      const sseUrl = \`\${SERVER}/api/host-events?token=\${encodeURIComponent(SIDE_TOKEN || '')}\`;
      hostEventSource = new window.EventSource(sseUrl);
      hostEventSource.addEventListener('theme-config', (ev) => {
        try {
          const cfg = JSON.parse(String(ev.data || 'null'));
          if (cfg && typeof cfg === 'object') themeSuite.applyConfig(cfg);
        } catch {}
      });
      hostEventSource.addEventListener('theme-event', (ev) => {
        try {
          const evt = JSON.parse(String(ev.data || 'null'));
          if (evt && typeof evt === 'object') themeSuite.triggerEvent(evt);
        } catch {}
      });
      hostEventSource.addEventListener('host-toggle', (ev) => {
        try {
          const data = JSON.parse(String(ev.data || 'null'));
          if (data && data.enabled === false) {
            window.__GEMINEKO_CDP_UNMOUNT__?.();
          }
        } catch {}
      });
    } catch {
      hostEventSource = null;
    }
  }

  ensureDock();
  syncDockPosition();
  syncActiveStatusSprite();
  replaceOpenSwarmPillLogo();
  startupEngine?.maybeAutoPlay?.();

  domObserver = new MutationObserver(() => {
    if (stopped) return;
    onUrlCheck();
  });
  if (document.body) {
    domObserver.observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('popstate', onUrlCheck);
  document.addEventListener('click', onOverlayTrigger, true);
  document.addEventListener('keydown', onOverlayTrigger, true);
  pollActivity();

  window.__GEMINEKO_HOST_TRANSPORT__ = TRANSPORT;
  window.__GEMINEKO_HOST_SERVER__ = SERVER;
  window.__GEMINEKO_CDP_OVERLAY_V2__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V3__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V5__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V6__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V7__ = true;
  window.__GEMINEKO_CDP_UNMOUNT__ = () => {
    stopped = true;
    if (pollTimer) clearTimeout(pollTimer);
    if (routeI18nTimer) { clearTimeout(routeI18nTimer); routeI18nTimer = null; }
    if (syncRaf) cancelAnimationFrame(syncRaf);
    if (hostEventSource) {
      try { hostEventSource.close(); } catch {}
      hostEventSource = null;
    }
    if (domObserver) domObserver.disconnect();
    if (anchorResizeObserver) anchorResizeObserver.disconnect();
    if (dockResizeObserver) dockResizeObserver.disconnect();
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('popstate', onUrlCheck);
    document.removeEventListener('click', onOverlayTrigger, true);
    document.removeEventListener('keydown', onOverlayTrigger, true);
    i18nEngine?.unmount?.();
    memeEngine?.unmount?.();
    eggEngine?.unmount?.();
    startupEngine?.unmount?.();
    themeSuite?.unmount?.();
    cleanupLegacyNodes();
    const dock = document.getElementById(DOCK_ID);
    if (dock) dock.remove();
    const st = document.getElementById(STYLE_ID);
    if (st) st.remove();
    window.__GEMINEKO_HOST_TRANSPORT__ = '';
    window.__GEMINEKO_HOST_SERVER__ = '';
    window.__GEMINEKO_CDP_OVERLAY_V2__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V3__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V5__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V6__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V7__ = false;
  };
})();`;
}

/**
 * Antigravity 主窗口 CDP 挂载管理器。
 */
export class CdpHostInjector {
  /**
   * @param {{ serverBaseUrl: string, logoDataUri?: string, debugPort?: number, sideToken?: string, getThemeConfig?: () => any }} options
   */
  constructor(options) {
    this.serverBaseUrl = options.serverBaseUrl;
    this.logoDataUri = options.logoDataUri || '';
    this.debugPort = Number(options.debugPort) || DEFAULT_DEBUG_PORT;
    this.sideToken = options.sideToken || '';
    this.getThemeConfig = typeof options.getThemeConfig === 'function' ? options.getThemeConfig : () => null;
    this.enabled = true;
    this.state = 'idle';
    this.hint = '';
    this.lastError = '';
    this.connectedUrl = '';
    this.ws = null;
    this.retryTimer = null;
    this.heartbeatTimer = null;
    this.msgId = 1;
    this.pendingRpc = new Map();
  }

  /**
   * 返回当前 CDP 挂载状态摘要。
   */
  getStatus() {
    return {
      enabled: this.enabled,
      state: this.state,
      debugPort: this.debugPort,
      connectedUrl: this.connectedUrl,
      hint: this.hint,
      lastError: this.lastError,
    };
  }

  /**
   * 启停 CDP 挂载，并在关闭时清理已注入的悬浮节点。
   * @param {boolean} enabled
   */
  async setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      await this.evaluateOnTarget('if (window.__GEMINEKO_CDP_UNMOUNT__) window.__GEMINEKO_CDP_UNMOUNT__();');
      this.closeWs();
      this.state = 'disabled-by-user';
      this.hint = '已在开关中暂停主对话区猫娘固定挂载';
      return this.getStatus();
    }
    await this.tryAttach();
    return this.getStatus();
  }

  /**
   * 触发主窗口重播一次剧场级反重力启动动画。
   * @returns {Promise<{ ok: boolean, replayed: boolean }>}
   */
  async replayStartup() {
    if (!this.enabled) return { ok: false, replayed: false };
    if (this.state !== 'attached') {
      await this.tryAttach();
    }
    const resp = await this.evaluateOnTarget(
      'Boolean(typeof window.__GEMINEKO_REPLAY_STARTUP__ === "function" && window.__GEMINEKO_REPLAY_STARTUP__({ manual: true }))',
      true,
    );
    const replayed = Boolean(resp?.result?.value);
    return { ok: replayed, replayed };
  }

  /**
   * 启动重连探测与 10 秒保活心跳。
   */
  start() {
    if (!this.enabled) return;
    this.tryAttach().catch(() => {});
    if (!this.retryTimer) {
      this.retryTimer = setInterval(() => {
        if (this.enabled && this.state !== 'attached') {
          this.tryAttach().catch(() => {});
        }
      }, 15_000);
      this.retryTimer.unref?.();
    }
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(() => {
        if (this.enabled && this.state === 'attached') {
          this.verifyAndReinject().catch(() => {});
        }
      }, HEARTBEAT_INTERVAL_MS);
      this.heartbeatTimer.unref?.();
    }
  }

  /**
   * 停止探测并断开连接。
   */
  stop() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.closeWs();
    this.state = 'stopped';
  }

  closeWs() {
    for (const [, p] of this.pendingRpc) {
      clearTimeout(p.timer);
      p.resolve(null);
    }
    this.pendingRpc.clear();
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connectedUrl = '';
  }

  /**
   * 发送 CDP 命令并等待结果。
   * @param {string} method
   * @param {object} params
   * @returns {Promise<any>}
   */
  sendRpc(method, params) {
    if (!this.ws || this.ws.readyState !== 1) return Promise.resolve(null);
    const id = this.msgId++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pendingRpc.delete(id);
        resolve(null);
      }, 2500);
      this.pendingRpc.set(id, { resolve, timer });
      try {
        this.ws.send(JSON.stringify({ id, method, params }));
      } catch {
        clearTimeout(timer);
        this.pendingRpc.delete(id);
        resolve(null);
      }
    });
  }

  /**
   * 向已连接的 CDP 会话下发脚本求值。
   * @param {string} expression
   * @param {boolean} [waitResult]
   */
  async evaluateOnTarget(expression, waitResult = false) {
    if (!this.ws || this.ws.readyState !== 1) return false;
    if (!waitResult) {
      const id = this.msgId++;
      this.ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression, awaitPromise: false },
      }));
      return true;
    }
    const resp = await this.sendRpc('Runtime.evaluate', {
      expression,
      awaitPromise: false,
      returnByValue: true,
    });
    return resp?.result?.result?.value;
  }

  /**
   * 向宿主即时推送最新主题配置（热刷新 <50ms）。
   * @param {any} config
   */
  async pushThemeConfig(config) {
    const expr = `window.__GEMINEKO_THEME_API__?.applyConfig?.(${JSON.stringify(config)})`;
    return this.evaluateOnTarget(expr, false);
  }

  /**
   * 向宿主即时推送互动彩蛋事件（如从侧边栏触发「捅了基米窝」或「星尘雨」）。
   * @param {any} event
   */
  async pushThemeEvent(event) {
    const expr = `window.__GEMINEKO_THEME_API__?.triggerEvent?.(${JSON.stringify(event)})`;
    return this.evaluateOnTarget(expr, false);
  }

  /**
   * 周期探活：若宿主刷新或重绘导致注入标记丢失，自动重新注入。
   */
  async verifyAndReinject() {
    if (!this.enabled || !this.ws || this.ws.readyState !== 1) return;
    const alive = await this.evaluateOnTarget('Boolean(window.__GEMINEKO_CDP_OVERLAY_V7__)', true);
    if (alive === false) {
      const script = buildCdpOverlayScript(this.serverBaseUrl, this.logoDataUri, {
        sideToken: this.sideToken,
        themeConfig: this.getThemeConfig(),
        transport: 'cdp',
      });
      await this.evaluateOnTarget(script);
    }
  }

  /**
   * 尝试发现 Antigravity 调试端口并注入主对话区挂载脚本。
   */
  async tryAttach() {
    if (!this.enabled) return this.getStatus();

    const activeFile = readDevToolsActivePort();
    const candidatePort = activeFile?.port || this.debugPort;
    const targets = await fetchCdpTargets(candidatePort);
    const target = pickPrimaryPageTarget(targets);

    if (!target) {
      this.state = 'debug-port-disabled';
      this.hint = `未检测到本地 Antigravity CDP 调试端口（尝试端口 ${candidatePort}）。以 --remote-debugging-port=${DEFAULT_DEBUG_PORT} 启动 Antigravity 后即可自动在输入栏上方显示透明动态猫娘`;
      return this.getStatus();
    }

    if (this.ws && this.ws.readyState === 1 && this.connectedUrl === target.webSocketDebuggerUrl) {
      this.state = 'attached';
      return this.getStatus();
    }

    this.closeWs();

    if (typeof WebSocket !== 'function') {
      this.state = 'unsupported-runtime';
      this.lastError = '当前 Node 运行时缺少原生 WebSocket';
      return this.getStatus();
    }

    await new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      const ws = new WebSocket(target.webSocketDebuggerUrl);
      const timeout = setTimeout(() => {
        try { ws.close(); } catch {}
        this.state = 'debug-port-disabled';
        this.lastError = 'CDP WebSocket 连接超时';
        finish();
      }, 2500);

      ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(String(ev.data || ''));
          if (msg && typeof msg.id === 'number' && this.pendingRpc.has(msg.id)) {
            const p = this.pendingRpc.get(msg.id);
            this.pendingRpc.delete(msg.id);
            clearTimeout(p.timer);
            p.resolve(msg);
          }
        } catch {}
      });

      ws.addEventListener('open', async () => {
        clearTimeout(timeout);
        this.ws = ws;
        this.connectedUrl = target.webSocketDebuggerUrl;
        this.state = 'attached';
        this.hint = '已固定挂载到主对话输入栏与底部活跃状态行';
        this.lastError = '';
        try {
          const alreadySameServer = await this.evaluateOnTarget(
            `Boolean(window.__GEMINEKO_CDP_OVERLAY_V7__ && window.__GEMINEKO_HOST_SERVER__ === ${JSON.stringify(this.serverBaseUrl)})`,
            true,
          );
          if (alreadySameServer === true) {
            finish();
            return;
          }
        } catch {}
        const script = buildCdpOverlayScript(this.serverBaseUrl, this.logoDataUri, {
          sideToken: this.sideToken,
          themeConfig: this.getThemeConfig(),
          transport: 'cdp',
        });
        this.evaluateOnTarget(script).catch(() => {});
        finish();
      });

      ws.addEventListener('error', () => {
        clearTimeout(timeout);
        this.state = 'debug-port-disabled';
        this.lastError = 'CDP 连接被拒绝或调试端口未启用';
        finish();
      });

      ws.addEventListener('close', () => {
        if (this.ws === ws) {
          this.ws = null;
          this.connectedUrl = '';
          if (this.state === 'attached') this.state = 'disconnected';
        }
      });
    });

    return this.getStatus();
  }
}
