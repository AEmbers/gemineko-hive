/**
 * @file Antigravity 主窗口 CDP 运行时注入器（不修改 app.asar）
 * 检测 %APPDATA%\Antigravity\DevToolsActivePort 或 127.0.0.1:19222 调试端口，
 * 向主聊天界面挂载右上角实时猫娘悬浮胶囊、步骤条模型小头像与入口图标兜底替换。
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_DEBUG_PORT = 19222;
const POLL_INTERVAL_MS = 4000;

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
  const preferred = pages.find((t) => /antigravity|workbench/i.test(`${t.title || ''} ${t.url || ''}`));
  return preferred || pages[0];
}

/**
 * 构造向主聊天窗口注入的自包含幂等脚本。
 * 注意：此脚本运行在宿主 Electron 渲染进程浏览器上下文中。
 * @param {string} serverBaseUrl 例如 http://127.0.0.1:19876
 * @param {string} logoDataUri
 * @returns {string}
 */
export function buildCdpOverlayScript(serverBaseUrl, logoDataUri = '') {
  const baseJson = JSON.stringify(serverBaseUrl.replace(/\/+$/, ''));
  const logoJson = JSON.stringify(logoDataUri || '');
  return `(() => {
  const SERVER = ${baseJson};
  const LOGO_URI = ${logoJson};
  const OVERLAY_ID = 'gemineko-cdp-live-capsule';
  const STYLE_ID = 'gemineko-cdp-style';
  const STATE_KEY = 'gemineko_cdp_pos_v2';

  if (typeof window.__GEMINEKO_CDP_UNMOUNT__ === 'function') {
    try { window.__GEMINEKO_CDP_UNMOUNT__(); } catch {}
  }

  let stopped = false;
  let pollTimer = null;
  let observer = null;
  let latestState = {
    role: 'neon',
    action: 'idle',
    actionLabel: '打盹摸鱼',
    phase: 'idle',
    phaseLabel: '待机中',
    model: 'gemini-4-neon',
    lastTool: '',
    spriteFile: 'neon-idle.png'
  };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = \`
      #\${OVERLAY_ID} {
        position: fixed;
        top: 52px;
        right: 18px;
        z-index: 99990;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 12px 7px 8px;
        border-radius: 18px;
        background: rgba(255, 250, 255, 0.92);
        border: 1.5px solid rgba(155, 114, 242, 0.45);
        box-shadow: 0 8px 24px rgba(103, 76, 178, 0.18);
        backdrop-filter: blur(10px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
        color: #2f2546;
        cursor: grab;
        user-select: none;
        transition: transform 0.16s ease, box-shadow 0.16s ease;
      }
      #\${OVERLAY_ID}:hover {
        box-shadow: 0 10px 28px rgba(103, 76, 178, 0.28);
      }
      #\${OVERLAY_ID}.is-collapsed {
        padding: 4px;
        border-radius: 999px;
      }
      #\${OVERLAY_ID}.is-collapsed .gk-meta,
      #\${OVERLAY_ID}.is-collapsed .gk-collapse-btn {
        display: none;
      }
      #\${OVERLAY_ID} .gk-avatar-wrap {
        position: relative;
        width: 52px;
        height: 52px;
        border-radius: 14px;
        overflow: hidden;
        background: #fff;
        border: 1px solid rgba(155, 114, 242, 0.28);
        flex-shrink: 0;
        cursor: pointer;
      }
      #\${OVERLAY_ID} .gk-avatar-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      #\${OVERLAY_ID} .gk-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 128px;
        max-width: 185px;
      }
      #\${OVERLAY_ID} .gk-top-row {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
      }
      #\${OVERLAY_ID} .gk-phase {
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 10px;
        color: #fff;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
      }
      #\${OVERLAY_ID} .gk-phase.is-executor {
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
      }
      #\${OVERLAY_ID} .gk-phase.is-idle {
        background: #94a3b8;
      }
      #\${OVERLAY_ID} .gk-action {
        color: #7c3aed;
        font-size: 11px;
        white-space: nowrap;
      }
      #\${OVERLAY_ID} .gk-model {
        font-size: 11.5px;
        font-weight: 600;
        color: #312548;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #\${OVERLAY_ID} .gk-tool {
        font-size: 10px;
        color: #6b5f87;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #\${OVERLAY_ID} .gk-collapse-btn {
        border: none;
        background: rgba(139, 92, 246, 0.12);
        color: #6d28d9;
        width: 20px;
        height: 20px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
      }
      .gk-heart-pop {
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        font-size: 16px;
        animation: gkFloatUp 0.85s ease-out forwards;
      }
      @keyframes gkFloatUp {
        0% { opacity: 1; transform: translateY(0) scale(0.9); }
        100% { opacity: 0; transform: translateY(-28px) scale(1.25); }
      }
      .gk-step-avatar {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        object-fit: cover;
        margin-right: 6px;
        vertical-align: middle;
        border: 1px solid rgba(139, 92, 246, 0.35);
        background: #fff;
        flex-shrink: 0;
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

  function createCapsule() {
    ensureStyle();
    let box = document.getElementById(OVERLAY_ID);
    if (box) return box;

    box = document.createElement('div');
    box.id = OVERLAY_ID;

    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      if (saved && typeof saved.top === 'number' && typeof saved.left === 'number') {
        box.style.top = Math.max(8, Math.min(window.innerHeight - 72, saved.top)) + 'px';
        box.style.left = Math.max(8, Math.min(window.innerWidth - 72, saved.left)) + 'px';
        box.style.right = 'auto';
      }
      if (saved && saved.collapsed) box.classList.add('is-collapsed');
    } catch {}

    box.innerHTML = \`
      <div class="gk-avatar-wrap" title="点击摸头 / 折叠时点此展开">
        <img class="gk-sprite-img" alt="gemineko" />
      </div>
      <div class="gk-meta">
        <div class="gk-top-row">
          <span class="gk-phase">编排模式</span>
          <span class="gk-action">思考中</span>
        </div>
        <div class="gk-model">gemini-4-neon</div>
        <div class="gk-tool">准备就绪</div>
      </div>
      <button class="gk-collapse-btn" title="折叠/展开挂件">–</button>
    \`;

    const avatarWrap = box.querySelector('.gk-avatar-wrap');
    const collapseBtn = box.querySelector('.gk-collapse-btn');

    avatarWrap.addEventListener('click', (e) => {
      if (box.classList.contains('is-collapsed')) {
        box.classList.remove('is-collapsed');
        savePos(box);
        return;
      }
      spawnHeart(e.clientX - 8, e.clientY - 12);
    });

    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      box.classList.toggle('is-collapsed');
      savePos(box);
    });

    let dragging = false;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;
    box.addEventListener('mousedown', (e) => {
      if (e.target === collapseBtn) return;
      dragging = true;
      const rect = box.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      box.style.cursor = 'grabbing';
    });
    const onMove = (e) => {
      if (!dragging) return;
      const nx = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, origLeft + (e.clientX - startX)));
      const ny = Math.max(8, Math.min(window.innerHeight - box.offsetHeight - 8, origTop + (e.clientY - startY)));
      box.style.left = nx + 'px';
      box.style.top = ny + 'px';
      box.style.right = 'auto';
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      box.style.cursor = 'grab';
      savePos(box);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    box.__gkCleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    document.body.appendChild(box);
    renderCapsule();
    return box;
  }

  function savePos(box) {
    try {
      const rect = box.getBoundingClientRect();
      localStorage.setItem(STATE_KEY, JSON.stringify({
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        collapsed: box.classList.contains('is-collapsed')
      }));
    } catch {}
  }

  function renderCapsule() {
    const box = document.getElementById(OVERLAY_ID);
    if (!box) return;
    const img = box.querySelector('.gk-sprite-img');
    const phaseEl = box.querySelector('.gk-phase');
    const actionEl = box.querySelector('.gk-action');
    const modelEl = box.querySelector('.gk-model');
    const toolEl = box.querySelector('.gk-tool');

    const spriteName = latestState.spriteFile || \`\${latestState.role}-\${latestState.action}.png\`;
    const nextSrc = \`\${SERVER}/gemineko-sprites/\${spriteName}\`;
    if (img.getAttribute('data-src') !== nextSrc) {
      img.setAttribute('data-src', nextSrc);
      img.src = nextSrc;
    }
    phaseEl.textContent = latestState.phaseLabel || '编排模式';
    phaseEl.className = 'gk-phase ' + (latestState.phase === 'executor' ? 'is-executor' : latestState.phase === 'idle' ? 'is-idle' : '');
    actionEl.textContent = latestState.actionLabel || '思考中';
    modelEl.textContent = latestState.model || 'gemini-4-neon';
    toolEl.textContent = latestState.lastTool ? \`工具: \${latestState.lastTool}\` : (latestState.active ? '思维流运转中' : '等待新指令');
  }

  function decorateChatStream() {
    const stepCandidates = document.querySelectorAll('button, summary, [role="button"], div');
    for (const el of stepCandidates) {
      if (el.getAttribute('data-gemineko-step') === '1') continue;
      if (el.children.length > 4) continue;
      const text = (el.textContent || '').trim();
      if (!text || text.length > 96) continue;
      if (/^(Worked for |Inspecting |Analyzed |Ran |Read |Edited |Created |Searching )/i.test(text)) {
        const avatar = document.createElement('img');
        avatar.className = 'gk-step-avatar';
        const lower = text.toLowerCase();
        const act = /analyz|read|inspect|search/.test(lower)
          ? 'reading'
          : /edit|creat|writ|modif/.test(lower)
            ? 'editing'
            : /ran |exec|test|command/.test(lower)
              ? 'running'
              : (latestState.action || 'thinking');
        const role = latestState.role || 'neon';
        avatar.src = \`\${SERVER}/gemineko-sprites/\${role}-\${act}.png\`;
        el.setAttribute('data-gemineko-step', '1');
        el.prepend(avatar);
      }
    }

    if (LOGO_URI) {
      const links = document.querySelectorAll('a, button');
      for (const node of links) {
        if (node.getAttribute('data-gemineko-pill') === '1') continue;
        if (!/Open the Swarm UI/i.test(node.textContent || '')) continue;
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
  }

  async function pollActivity() {
    if (stopped) return;
    try {
      const res = await fetch(\`\${SERVER}/api/live-activity\`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.activity) {
          latestState = { ...latestState, ...data.activity };
          renderCapsule();
        }
      }
    } catch {}
    decorateChatStream();
    if (!stopped) {
      pollTimer = setTimeout(pollActivity, ${POLL_INTERVAL_MS});
    }
  }

  createCapsule();
  decorateChatStream();
  observer = new MutationObserver(() => {
    if (!stopped) decorateChatStream();
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
  pollActivity();

  window.__GEMINEKO_CDP_OVERLAY_V2__ = true;
  window.__GEMINEKO_CDP_UNMOUNT__ = () => {
    stopped = true;
    if (pollTimer) clearTimeout(pollTimer);
    if (observer) observer.disconnect();
    const box = document.getElementById(OVERLAY_ID);
    if (box) {
      if (typeof box.__gkCleanup === 'function') box.__gkCleanup();
      box.remove();
    }
    const st = document.getElementById(STYLE_ID);
    if (st) st.remove();
    window.__GEMINEKO_CDP_OVERLAY_V2__ = false;
  };
})();`;
}

/**
 * Antigravity 主窗口 CDP 挂载管理器。
 */
export class CdpHostInjector {
  /**
   * @param {{ serverBaseUrl: string, logoDataUri?: string, debugPort?: number }} options
   */
  constructor(options) {
    this.serverBaseUrl = options.serverBaseUrl;
    this.logoDataUri = options.logoDataUri || '';
    this.debugPort = Number(options.debugPort) || DEFAULT_DEBUG_PORT;
    this.enabled = true;
    this.state = 'idle';
    this.hint = '';
    this.lastError = '';
    this.connectedUrl = '';
    this.ws = null;
    this.retryTimer = null;
    this.msgId = 1;
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
      this.hint = '已在开关中暂停主对话区猫娘悬浮挂载';
      return this.getStatus();
    }
    await this.tryAttach();
    return this.getStatus();
  }

  /**
   * 启动并调度轻量重连探测。
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
  }

  /**
   * 停止探测并断开连接。
   */
  stop() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    this.closeWs();
    this.state = 'stopped';
  }

  closeWs() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connectedUrl = '';
  }

  /**
   * 向已连接的 CDP 会话下发脚本求值。
   * @param {string} expression
   */
  async evaluateOnTarget(expression) {
    if (!this.ws || this.ws.readyState !== 1) return false;
    const id = this.msgId++;
    this.ws.send(JSON.stringify({
      id,
      method: 'Runtime.evaluate',
      params: { expression, awaitPromise: false },
    }));
    return true;
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
      this.hint = `未检测到本地 Antigravity CDP 调试端口（尝试端口 ${candidatePort}）。以 --remote-debugging-port=${DEFAULT_DEBUG_PORT} 启动 Antigravity 后即可自动在主对话区显示实时猫娘悬浮胶囊`;
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

      ws.addEventListener('open', () => {
        clearTimeout(timeout);
        this.ws = ws;
        this.connectedUrl = target.webSocketDebuggerUrl;
        this.state = 'attached';
        this.hint = '已成功挂载到主对话窗口';
        this.lastError = '';
        const script = buildCdpOverlayScript(this.serverBaseUrl, this.logoDataUri);
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
