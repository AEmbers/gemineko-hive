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
import { buildHostI18nRuntimeSnippet } from './host-i18n-runtime.mjs';
import { buildHostThemeRuntimeSnippet } from './host-theme-runtime.mjs';

const DEFAULT_DEBUG_PORT = 19222;
const POLL_INTERVAL_MS = 3200;
const HEARTBEAT_INTERVAL_MS = 10_000;

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
 * @param {{ sideToken?: string, themeConfig?: any }} [options]
 * @returns {string}
 */
export function buildCdpOverlayScript(serverBaseUrl, logoDataUri = '', options = {}) {
  const baseJson = JSON.stringify(serverBaseUrl.replace(/\/+$/, ''));
  const logoJson = JSON.stringify(logoDataUri || '');
  const tokenJson = JSON.stringify(String(options?.sideToken || ''));
  const themeCfgJson = JSON.stringify(options?.themeConfig || null);
  const themeSnippet = buildHostThemeRuntimeSnippet();
  const i18nSnippet = buildHostI18nRuntimeSnippet();
  return `(() => {
  const SERVER = ${baseJson};
  const LOGO_URI = ${logoJson};
  const SIDE_TOKEN = ${tokenJson};
  const INITIAL_THEME_CONFIG = ${themeCfgJson};
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
  let syncRaf = null;
  let domObserver = null;
  let anchorResizeObserver = null;
  let currentAnchor = null;
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
        z-index: 99980;
        display: flex;
        align-items: flex-end;
        gap: 6px;
        pointer-events: none;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif !important;
        font-size: 12px !important;
        line-height: 1.25 !important;
        transition: opacity 0.16s ease;
      }
      #\${DOCK_ID}.is-hidden {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      #\${DOCK_ID} .gk-dock-cat {
        position: relative;
        width: 68px;
        height: 68px;
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
        width: 68px;
        height: 68px;
        object-fit: contain;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        display: block;
        filter: drop-shadow(0 4px 10px rgba(124, 108, 246, 0.28));
        transform-origin: center bottom;
        transition: transform 0.2s ease, filter 0.2s ease;
      }
      #\${DOCK_ID} .gk-dock-cat:hover img.gk-dock-sprite {
        transform: scale(1.06) translateY(-2px);
        filter: drop-shadow(0 6px 14px rgba(236, 72, 153, 0.36));
      }
      #\${DOCK_ID} .gk-dock-badge {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 10px;
        padding: 4px 8px 4px 9px;
        border-radius: 14px;
        background: rgba(255, 250, 255, 0.88);
        border: 1px solid rgba(139, 92, 246, 0.34);
        box-shadow: 0 4px 14px rgba(103, 76, 178, 0.14);
        backdrop-filter: blur(10px);
        color: #2f2546;
        max-width: min(210px, calc(100vw - 150px));
        overflow: hidden;
      }
      #\${DOCK_ID}.is-dark .gk-dock-badge {
        background: rgba(28, 23, 52, 0.86);
        border-color: rgba(167, 139, 250, 0.42);
        color: #ede9fe;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.38);
      }
      #\${DOCK_ID}.is-collapsed .gk-dock-badge-body {
        display: none;
      }
      #\${DOCK_ID}.is-collapsed .gk-dock-badge {
        padding: 3px;
        border-radius: 999px;
        margin-bottom: 12px;
      }
      #\${DOCK_ID} .gk-dock-badge-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      #\${DOCK_ID} .gk-top-row {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 10.5px !important;
        font-weight: 700;
        white-space: nowrap;
      }
      #\${DOCK_ID} .gk-phase {
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 10px !important;
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
        color: #7c3aed;
        font-size: 10.5px !important;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #\${DOCK_ID}.is-dark .gk-action {
        color: #c4b5fd;
      }
      #\${DOCK_ID} .gk-sub-row {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 10.5px !important;
        color: #5b4d78;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #\${DOCK_ID}.is-dark .gk-sub-row {
        color: #cbd5e1;
      }
      #\${DOCK_ID} .gk-model {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #\${DOCK_ID} .gk-collapse-btn {
        border: none;
        background: rgba(139, 92, 246, 0.14);
        color: #6d28d9;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 11px !important;
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
        width: 38px;
        height: 38px;
        margin-right: 6px;
        flex-shrink: 0;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        pointer-events: none;
        vertical-align: middle;
      }
      .\${INLINE_CLASS} img.gk-inline-sprite {
        width: 38px;
        height: 38px;
        object-fit: contain;
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
      /* 5 动作专属生命感动画 */
      .gk-act-thinking {
        animation: gkActThink 2.2s ease-in-out infinite;
      }
      .gk-act-reading {
        animation: gkActRead 1.8s ease-in-out infinite;
      }
      .gk-act-editing {
        animation: gkActEdit 0.72s ease-in-out infinite;
      }
      .gk-act-running {
        animation: gkActRun 0.9s ease-in-out infinite;
      }
      .gk-act-asking {
        animation: gkActThink 1.3s ease-in-out infinite;
      }
      .gk-act-idle {
        animation: gkActIdle 3.2s ease-in-out infinite;
      }
      @keyframes gkActThink {
        0%, 100% { transform: translateY(0) rotate(-1deg); }
        50% { transform: translateY(-1.5px) rotate(1.2deg); }
      }
      @keyframes gkActRead {
        0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
        35% { transform: translateY(-1px) rotate(-1deg) scale(1.01); }
        70% { transform: translateY(-0.5px) rotate(1deg) scale(1.01); }
      }
      @keyframes gkActEdit {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-1.5px) scale(1.02, 0.99); }
      }
      @keyframes gkActRun {
        0%, 100% { transform: translateY(0) scale(1); }
        25% { transform: translateY(-1.5px) rotate(-1.2deg) scale(1.015); }
        75% { transform: translateY(-1px) rotate(1.2deg) scale(1.015); }
      }
      @keyframes gkActIdle {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-1px) scale(1.008); }
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
      themeSuite?.onDockPoke?.(latestState.role || 'neon', e.clientX, e.clientY);
    });

    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeSuite?.toggleMiniBar?.(themeBtn);
    });

    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      collapsed = !collapsed;
      dock.classList.toggle('is-collapsed', collapsed);
      collapseBtn.textContent = collapsed ? '›' : '‹';
      try { localStorage.setItem(COLLAPSE_PREF_KEY, collapsed ? '1' : '0'); } catch {}
      scheduleSync();
    });

    document.body.appendChild(dock);
    renderDockState();
    return dock;
  }

  function syncDockPosition() {
    if (stopped) return;
    const dock = ensureDock();
    dock.classList.toggle('is-dark', isHostDarkTheme());

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

    // 空白首页存在 5 角色迎宾舞台时自动隐藏左上沿小猫 Dock，避免相互遮挡
    const homeStage = document.getElementById('gemineko-home-stage');
    if (homeStage && homeStage.isConnected) {
      const hr = homeStage.getBoundingClientRect();
      if (hr.width > 60 && hr.height > 20) {
        dock.classList.add('is-hidden');
        return;
      }
    }

    const r = anchor.getBoundingClientRect();
    if (r.width < 120 || r.top < 80 || r.bottom > window.innerHeight + 40) {
      dock.classList.add('is-hidden');
      return;
    }

    dock.classList.remove('is-hidden');
    const dockHeight = dock.offsetHeight || 68;
    const left = Math.max(8, Math.min(window.innerWidth - 120, Math.round(r.left + 12)));
    // 下摆轻轻坐落在输入栏顶部边框，与右侧系统像素小宠物底座齐平
    const top = Math.max(40, Math.round(r.top - dockHeight + 10));
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

  function bindImgFallback(imgEl, role) {
    if (!imgEl || imgEl.dataset.gkErrBound === '1') return;
    imgEl.dataset.gkErrBound = '1';
    imgEl.addEventListener('error', () => {
      if (imgEl.dataset.gkFallback === '1') return;
      imgEl.dataset.gkFallback = '1';
      const safeRole = /^(neon|hydrogen|carbon|claude|gpt)$/.test(String(role || '')) ? String(role) : 'neon';
      imgEl.src = \`\${SERVER}/gemineko-sprites/\${safeRole}-thinking.png?v=0.5.0\`;
    });
  }

  function getActiveSpriteUrl() {
    const role = latestState.role || 'neon';
    const act = latestState.action || (latestState.active ? 'thinking' : 'idle');
    const spriteName = sanitizeSpriteFile(latestState.spriteFile, role, act);
    return \`\${SERVER}/gemineko-sprites/\${spriteName}?v=0.5.0\`;
  }

  function renderDockState() {
    const dock = document.getElementById(DOCK_ID);
    if (!dock) return;
    const img = dock.querySelector('img.gk-dock-sprite');
    const phaseEl = dock.querySelector('.gk-phase');
    const actionEl = dock.querySelector('.gk-action');
    const modelEl = dock.querySelector('.gk-model');
    const toolEl = dock.querySelector('.gk-tool');

    bindImgFallback(img, latestState.role);
    const nextSrc = getActiveSpriteUrl();
    if (img.getAttribute('data-src') !== nextSrc) {
      img.dataset.gkFallback = '0';
      img.setAttribute('data-src', nextSrc);
      img.src = nextSrc;
    }
    const actCls = actionClassFor(latestState.action);
    const nextImgCls = 'gk-dock-sprite ' + actCls;
    if (img.className !== nextImgCls) img.className = nextImgCls;

    const nextPhaseText = latestState.phaseLabel || '编排模式';
    if (phaseEl.textContent !== nextPhaseText) phaseEl.textContent = nextPhaseText;
    const nextPhaseCls = 'gk-phase ' + (latestState.phase === 'executor' ? 'is-executor' : latestState.phase === 'idle' ? 'is-idle' : '');
    if (phaseEl.className !== nextPhaseCls) phaseEl.className = nextPhaseCls;

    const nextActText = latestState.actionLabel || '思考中';
    if (actionEl.textContent !== nextActText) actionEl.textContent = nextActText;

    const shortModel = String(latestState.model || 'gemini-4-neon').replace(/-preview$/i, '');
    if (modelEl.textContent !== shortModel) modelEl.textContent = shortModel;

    const nextTool = latestState.lastTool ? \`· \${latestState.lastTool}\` : '';
    if (toolEl.textContent !== nextTool) toolEl.textContent = nextTool;
  }

  function syncActiveStatusSprite() {
    if (stopped) return;
    const activePattern = /^(?:Thinking(?:\\s+for\\s+\\d|\\s*\\d|$)|Working(?:\\b|\\s*$)|Running\\b|Planning\\b|Reading\\b|Editing\\b|Analyzing\\b|思考中|猫脑运转|猫脑高速运转|处理中|认真干活|运行中|飞速狂奔|规划中|军师规划|读取中|凑近仔细看|编辑中|爪子狂敲|分析中|深潜洞察)/i;
    const anchor = findComposerAnchor();
    const maxY = anchor ? anchor.getBoundingClientRect().top - 4 : window.innerHeight - 60;
    let bestCandidate = null;
    let bestTop = -Infinity;

    if (document.body) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const txt = (node.nodeValue || '').trim();
        if (!txt || txt.length > 72 || !activePattern.test(txt)) continue;
        const p = node.parentElement;
        if (!p) continue;
        if (p.closest('#' + DOCK_ID) || p.closest('.' + INLINE_CLASS)) continue;
        if (p.closest('code, pre, textarea, [contenteditable="true"], .monaco-editor')) continue;
        // 排除已折叠的历史 Worked for 块内部文本（含中英文与萌系译文）
        const btn = p.closest('button, summary');
        if (btn && /^(?:Worked for|已工作|猫猫打工)\\b/i.test((btn.textContent || '').trim())) continue;

        const r = p.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0 || r.height > 64) continue;
        if (r.bottom < 45 || r.top > maxY) continue;

        // 优先横向 flex 容器作为锚定行
        const row = (p.parentElement && /flex/.test(getComputedStyle(p.parentElement).display) && getComputedStyle(p.parentElement).flexDirection !== 'column')
          ? p.parentElement
          : p;

        if (r.top > bestTop) {
          bestTop = r.top;
          bestCandidate = row;
        }
      }
    }

    // 清除不再活跃的历史挂件
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
    const effectiveAction = latestState.active ? (latestState.action || 'thinking') : 'thinking';
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
  const onUrlCheck = () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
      pollActivity();
    }
    scheduleSync();
  };

  ${i18nSnippet}
  ${themeSnippet}

  const i18nEngine = initHostI18nEngine(INITIAL_THEME_CONFIG);
  const themeSuite = initHostThemeSuite({
    server: SERVER,
    token: SIDE_TOKEN,
    dockId: DOCK_ID,
    getActivity: () => latestState,
    initialConfig: INITIAL_THEME_CONFIG,
    onConfigApplied: (nextCfg) => i18nEngine?.applyConfig?.(nextCfg),
  });
  fetch(\`\${SERVER}/api/theme/config\`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d?.config) themeSuite.applyConfig(d.config); })
    .catch(() => {});

  ensureDock();
  syncDockPosition();
  syncActiveStatusSprite();
  replaceOpenSwarmPillLogo();

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
  pollActivity();

  window.__GEMINEKO_CDP_OVERLAY_V2__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V3__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V5__ = true;
  window.__GEMINEKO_CDP_OVERLAY_V6__ = true;
  window.__GEMINEKO_CDP_UNMOUNT__ = () => {
    stopped = true;
    if (pollTimer) clearTimeout(pollTimer);
    if (syncRaf) cancelAnimationFrame(syncRaf);
    if (domObserver) domObserver.disconnect();
    if (anchorResizeObserver) anchorResizeObserver.disconnect();
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('popstate', onUrlCheck);
    i18nEngine?.unmount?.();
    themeSuite?.unmount?.();
    cleanupLegacyNodes();
    const dock = document.getElementById(DOCK_ID);
    if (dock) dock.remove();
    const st = document.getElementById(STYLE_ID);
    if (st) st.remove();
    window.__GEMINEKO_CDP_OVERLAY_V2__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V3__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V5__ = false;
    window.__GEMINEKO_CDP_OVERLAY_V6__ = false;
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
    const alive = await this.evaluateOnTarget('Boolean(window.__GEMINEKO_CDP_OVERLAY_V6__)', true);
    if (alive === false) {
      const script = buildCdpOverlayScript(this.serverBaseUrl, this.logoDataUri, {
        sideToken: this.sideToken,
        themeConfig: this.getThemeConfig(),
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

      ws.addEventListener('open', () => {
        clearTimeout(timeout);
        this.ws = ws;
        this.connectedUrl = target.webSocketDebuggerUrl;
        this.state = 'attached';
        this.hint = '已固定挂载到主对话输入栏与底部活跃状态行';
        this.lastError = '';
        const script = buildCdpOverlayScript(this.serverBaseUrl, this.logoDataUri, {
          sideToken: this.sideToken,
          themeConfig: this.getThemeConfig(),
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
