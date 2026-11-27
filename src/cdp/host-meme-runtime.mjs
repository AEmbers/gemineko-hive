/**
 * @file 基米窝宿主猫娘表情包全链路集成引擎（CDP 宿主侧注入，零修改 app.asar，不占主包体）
 * 1. 复用本机 ~/.gemini/meme-packs/gemini-neko 贴纸库，原地将 [表情: ...] 渲染为高清透明贴纸；
 * 2. 长任务收工汇报时可选弹出 1 张庆祝/收工猫娘贴纸气泡（工作进行中绝不弹窗）；
 * 3. 提供带分类与搜索的快捷表情拾取浮层，支持一键插入到输入框（不抢占 Ctrl+Shift+M）。
 */

const MEME_MARKER_RE = /^\[(?:表情|贴纸|meme)\s*[:：]\s*([^\]\r\n]{1,80})\]$/i;

/**
 * 纯函数：提取单行 `[表情: <caption >]` 标记文本，未命中返回 null。
 * @param {string} rawLine
 * @returns {string|null}
 */
export function parseMemeCaptionFromText(rawLine) {
  if (typeof rawLine !== 'string') return null;
  const trimmed = rawLine.trim();
  if (!trimmed || trimmed.length > 96) return null;
  const m = MEME_MARKER_RE.exec(trimmed);
  return m ? String(m[1] || '').trim() || null : null;
}

/**
 * 构造注入宿主 Renderer 的猫娘表情引擎源码片段（定义 initHostMemeEngine）。
 * @returns {string}
 */
export function buildHostMemeRuntimeSnippet() {
  return `
  function initHostMemeEngine(ctx) {
    const STYLE_ID = 'gemineko-host-meme-style';
    const PICKER_ID = 'gemineko-meme-picker-pop';
    const TOAST_ID = 'gemineko-meme-finish-toast';
    const RENDERED_ATTR = 'data-gk-meme-rendered';
    const INLINE_CARD_CLS = 'gk-inline-meme-card';

    let cfg = ctx.initialConfig && typeof ctx.initialConfig === 'object' ? ctx.initialConfig : {};
    let stopped = false;
    let catalog = [];
    let captionMap = new Map();
    let observer = null;
    let scanTimer = null;
    let activeTag = 'all';

    function isMemeEnabled() {
      return cfg.enabled !== false && cfg.memes?.enabled !== false;
    }

    function isInlineEnabled() {
      return isMemeEnabled() && cfg.memes?.inlineRender !== false;
    }

    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const st = document.createElement('style');
      st.id = STYLE_ID;
      st.textContent = \`
.\${INLINE_CARD_CLS} {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin: 6px 0;
  padding: 6px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--card, rgba(255,255,255,0.88)) 72%, var(--gk-role-primary, #8b5cf6) 8%);
  border: 1px solid color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 24%, var(--glass-border, rgba(139,92,246,0.22)));
  box-shadow: 0 10px 26px -14px var(--gk-role-glow, rgba(139,92,246,0.32)), inset 0 1px 0 var(--gk-specular, rgba(255,255,255,0.85));
  transition: transform 0.2s cubic-bezier(.34,1.4,.64,1);
}
.\${INLINE_CARD_CLS}:hover {
  transform: scale(1.04) translateY(-2px);
}
.\${INLINE_CARD_CLS} img {
  width: 112px !important;
  height: 112px !important;
  object-fit: contain !important;
  display: block !important;
  border-radius: 10px;
  background: transparent !important;
  filter: drop-shadow(0 4px 10px rgba(30, 41, 90, 0.16));
}
.\${INLINE_CARD_CLS} .gk-meme-cap {
  font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important;
  opacity: 0.72;
  padding: 0 4px;
  color: var(--muted-foreground, #64748b);
}
#\${TOAST_ID} {
  position: fixed;
  z-index: 2147483643;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px 7px;
  border-radius: 16px;
  background: var(--gk-popover-bg, var(--glass, rgba(255,255,255,0.94)));
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 44%, transparent);
  box-shadow: 0 16px 36px -12px var(--gk-role-glow, rgba(139,92,246,0.36)), var(--glass-shadow);
  backdrop-filter: blur(14px);
  cursor: pointer;
  animation: gkBubblePop 0.24s cubic-bezier(.34,1.4,.64,1);
}
#\${TOAST_ID} img {
  width: 88px;
  height: 88px;
  object-fit: contain;
  display: block;
}
#\${TOAST_ID} span {
  font-size: calc(11px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 700;
  color: var(--gk-role-primary, #8b5cf6);
}
#\${PICKER_ID} {
  position: fixed;
  z-index: 2147483645;
  width: min(calc(340px * var(--gk-host-font-scale, 1)), calc(100vw - 24px));
  max-height: 390px;
  display: none;
  flex-direction: column;
  gap: 8px;
  padding: 10px 11px;
  border-radius: 16px;
  background: var(--gk-popover-bg, var(--glass, rgba(255,255,255,0.95)));
  color: var(--foreground, #1e293b);
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 34%, var(--glass-border, rgba(139,92,246,0.28)));
  box-shadow: 0 20px 48px -14px var(--gk-role-glow, rgba(139,92,246,0.36)), var(--glass-shadow);
  backdrop-filter: blur(16px);
}
#\${PICKER_ID}.is-open { display: flex; }
#\${PICKER_ID} .gk-mp-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
#\${PICKER_ID} .gk-mp-tab {
  padding: 2.5px 7px; border-radius: 999px; border: 1px solid var(--border);
  background: var(--secondary); color: inherit; font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important; cursor: pointer;
}
#\${PICKER_ID} .gk-mp-tab.is-active { background: var(--gk-role-primary, #8b5cf6); color: #fff; border-color: transparent; }
#\${PICKER_ID} input.gk-mp-search {
  width: 100%; box-sizing: border-box; padding: 5px 8px; border-radius: 9px;
  border: 1px solid var(--border); background: var(--background); color: inherit; font-size: calc(11.5px * var(--gk-host-font-scale, 1)) !important;
}
#\${PICKER_ID} .gk-mp-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px;
  overflow-y: auto; max-height: 256px; padding-right: 2px;
}
#\${PICKER_ID} button.gk-mp-item {
  border: 1px solid transparent; border-radius: 10px; background: color-mix(in srgb, var(--secondary) 68%, transparent);
  padding: 4px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;
  transition: transform 0.16s cubic-bezier(.34,1.4,.64,1), border-color 0.15s ease;
}
#\${PICKER_ID} button.gk-mp-item:hover {
  transform: scale(1.06);
  border-color: var(--gk-role-primary, #8b5cf6);
}
#\${PICKER_ID} button.gk-mp-item img { width: 54px; height: 54px; object-fit: contain; }
#\${PICKER_ID} button.gk-mp-item span { font-size: calc(9.5px * var(--gk-host-font-scale, 1)) !important; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.85; }
      \`;
      document.head.appendChild(st);
    }

    function matchMeme(caption) {
      if (!caption || !catalog.length) return null;
      const clean = String(caption).trim();
      if (captionMap.has(clean)) return captionMap.get(clean);
      const low = clean.toLowerCase();
      for (const m of catalog) {
        if (m.caption.toLowerCase().includes(low) || low.includes(m.caption.toLowerCase())) return m;
      }
      const tokens = low.split(/[\s,，/]+/).filter(Boolean);
      for (const tk of tokens) {
        const hit = catalog.find((m) => (m.keywords + ' ' + m.caption).toLowerCase().includes(tk));
        if (hit) return hit;
      }
      return catalog[0] || null;
    }

    function restoreInlineCards() {
      document.querySelectorAll('[' + RENDERED_ATTR + '="1"]').forEach((el) => {
        const raw = el.getAttribute('data-gk-orig-meme') || '';
        const txt = document.createTextNode(raw);
        el.replaceWith(txt);
      });
    }

    function scanChatMarkers() {
      if (stopped || !isInlineEnabled() || !catalog.length || !document.body) return;
      ensureStyle();
      const containers = document.querySelectorAll('[data-testid="planner-response-text"], [data-testid="agent-response"], [data-testid="user-message-bubble"]');
      for (const box of containers) {
        if (box.closest('#gemineko-cdp-composer-dock, #gemineko-home-stage')) continue;
        const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
        const matches = [];
        let n;
        while ((n = walker.nextNode())) {
          const p = n.parentElement;
          if (!p || p.closest('pre, code, textarea, [contenteditable="true"], .' + INLINE_CARD_CLS)) continue;
          const raw = n.nodeValue || '';
          const trimmed = raw.trim();
          const m = /^\\[(?:表情|贴纸|meme)\\s*[:：]\\s*([^\\]\\r\\n]{1,80})\\]$/i.exec(trimmed);
          if (!m) continue;
          // 跳过已由原生 ASAR 补丁渲染过 img 的节点
          if (p.querySelector('img[data-agy-meme], img[src*="meme"]')) continue;
          matches.push({ node: n, raw, caption: String(m[1] || '').trim() });
        }
        for (const it of matches) {
          const meme = matchMeme(it.caption);
          if (!meme) continue;
          const card = document.createElement('span');
          card.className = INLINE_CARD_CLS;
          card.setAttribute(RENDERED_ATTR, '1');
          card.setAttribute('data-gk-orig-meme', it.raw);
          card.innerHTML = \`<img src="\${meme.url}" alt="\${it.caption.replace(/"/g, '&quot;')}" loading="lazy" /><span class="gk-meme-cap">\${meme.caption}</span>\`;
          it.node.replaceWith(card);
        }
      }
    }

    function refreshCatalog() {
      fetch(\`\${ctx.server}/api/memes/list\`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (stopped || !d?.available || !Array.isArray(d.memes)) return;
          catalog = d.memes;
          captionMap = new Map(catalog.map((m) => [m.caption, m]));
          scanChatMarkers();
          renderPickerGrid('');
        })
        .catch(() => {});
    }

    function triggerFinishSticker() {
      if (stopped || !isMemeEnabled() || cfg.memes?.autoFinishSticker === false || !catalog.length) return;
      // 若最近一条回复里已经含内联贴纸，不重复弹出收工浮层
      const resps = document.querySelectorAll('[data-testid="agent-response"], [data-testid="planner-response-text"]');
      const lastResp = resps.length ? resps[resps.length - 1] : null;
      if (lastResp && lastResp.querySelector('.' + INLINE_CARD_CLS + ', img[src*="meme"]')) return;

      ensureStyle();
      const old = document.getElementById(TOAST_ID);
      if (old) old.remove();
      const pool = catalog.filter((m) => m.tag === 'happy');
      const picked = (pool.length ? pool : catalog)[Math.floor(Math.random() * (pool.length ? pool.length : catalog.length))];
      if (!picked) return;

      const dock = document.getElementById(ctx.dockId);
      const dr = dock && !dock.classList.contains('is-hidden') ? dock.getBoundingClientRect() : null;
      const rect = dr && dr.width > 0
        ? dr
        : { left: Math.max(24, window.innerWidth - 220), top: Math.max(160, window.innerHeight - 96) };
      const toast = document.createElement('div');
      toast.id = TOAST_ID;
      toast.innerHTML = \`<img src="\${picked.url}" alt="" /><span>收工啦 · \${picked.caption}</span>\`;
      toast.style.left = Math.max(12, Math.min(window.innerWidth - 180, Math.round(rect.left + 10))) + 'px';
      toast.style.top = Math.max(20, Math.min(window.innerHeight - 136, Math.round(rect.top - 122))) + 'px';
      toast.addEventListener('click', () => toast.remove());
      document.body?.appendChild(toast);
      setTimeout(() => { if (toast.isConnected) toast.remove(); }, 5500);
    }

    function insertMemeToComposer(caption) {
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (!box) return;
      const editable = box.querySelector('[contenteditable="true"], textarea, input') || box;
      editable.focus();
      const marker = \`\\n[表情: \${caption}]\`;
      if (editable.value !== undefined) {
        editable.value = String(editable.value || '') + marker;
        editable.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        document.execCommand?.('insertText', false, marker);
      }
    }

    function ensurePicker() {
      ensureStyle();
      let pop = document.getElementById(PICKER_ID);
      if (pop) return pop;
      const tabs = [
        ['all', '全部'], ['happy', '开心'], ['shy', '害羞'],
        ['confused', '疑惑'], ['sad', '委屈'], ['angry', '炸毛'], ['daily', '日常'],
      ];
      pop = document.createElement('div');
      pop.id = PICKER_ID;
      pop.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:12px;">
          <span>😸 猫娘表情库（点击填入回复/提问）</span>
          <button type="button" style="border:none;background:transparent;color:inherit;cursor:pointer;" data-mp-close="1">✕</button>
        </div>
        <div class="gk-mp-tabs">
          \${tabs.map(([id, label]) => \`<button type="button" class="gk-mp-tab \${id === 'all' ? 'is-active' : ''}" data-mp-tag="\${id}">\${label}</button>\`).join('')}
        </div>
        <input class="gk-mp-search" type="text" placeholder="搜索表情关键字（如：通过、摸鱼、吃瓜）..." />
        <div class="gk-mp-grid"></div>
      \`;
      pop.querySelector('[data-mp-close="1"]').addEventListener('click', () => pop.classList.remove('is-open'));
      pop.querySelector('.gk-mp-tabs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-mp-tag]');
        if (!b) return;
        activeTag = b.getAttribute('data-mp-tag') || 'all';
        pop.querySelectorAll('.gk-mp-tab').forEach((el) => el.classList.toggle('is-active', el === b));
        renderPickerGrid(pop.querySelector('.gk-mp-search')?.value || '');
      });
      pop.querySelector('.gk-mp-search').addEventListener('input', (e) => renderPickerGrid(e.target.value));
      pop.querySelector('.gk-mp-grid').addEventListener('click', (e) => {
        const b = e.target.closest('[data-mp-cap]');
        if (!b) return;
        insertMemeToComposer(b.getAttribute('data-mp-cap') || '');
        pop.classList.remove('is-open');
      });
      document.body?.appendChild(pop);
      return pop;
    }

    function renderPickerGrid(kwRaw) {
      const pop = document.getElementById(PICKER_ID);
      if (!pop) return;
      const grid = pop.querySelector('.gk-mp-grid');
      if (!grid) return;
      const kw = String(kwRaw || '').trim().toLowerCase();
      const filtered = catalog.filter((m) => {
        if (activeTag !== 'all' && m.tag !== activeTag) return false;
        if (!kw) return true;
        return (m.caption + ' ' + m.keywords).toLowerCase().includes(kw);
      });
      if (!filtered.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.65;padding:18px 0;font-size:11px;">未找到本地猫娘贴纸（请确认已安装 agy-meme 图库）</div>';
        return;
      }
      grid.innerHTML = filtered.slice(0, 48).map((m) => \`
        <button type="button" class="gk-mp-item" data-mp-cap="\${m.caption.replace(/"/g, '&quot;')}" title="\${m.caption}">
          <img src="\${m.url}" alt="" loading="lazy" />
          <span>\${m.caption}</span>
        </button>
      \`).join('');
    }

    function toggleMemePicker(anchorEl) {
      if (!catalog.length) refreshCatalog();
      const pop = ensurePicker();
      renderPickerGrid(pop.querySelector('.gk-mp-search')?.value || '');
      const open = !pop.classList.contains('is-open');
      pop.classList.toggle('is-open', open);
      if (open) {
        const r = anchorEl ? anchorEl.getBoundingClientRect() : { left: 40, top: window.innerHeight - 90 };
        pop.style.left = Math.max(12, Math.min(window.innerWidth - 344, Math.round(r.left))) + 'px';
        pop.style.top = Math.max(18, Math.round(r.top - pop.offsetHeight - 10)) + 'px';
      }
    }

    function ensureObserver() {
      if (observer || !document.body) return;
      observer = new MutationObserver(() => {
        if (stopped || !isInlineEnabled()) return;
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(() => { scanTimer = null; scanChatMarkers(); }, 180);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function onDocClickClosePicker(e) {
      const pop = document.getElementById(PICKER_ID);
      if (pop && pop.classList.contains('is-open') && !e.target.closest('#' + PICKER_ID) && !e.target.closest('[data-act="meme-picker"]') && !e.target.closest('.gk-dock-meme-btn')) {
        pop.classList.remove('is-open');
      }
    }

    function applyConfig(nextCfg) {
      cfg = nextCfg && typeof nextCfg === 'object' ? nextCfg : {};
      if (!isInlineEnabled()) {
        restoreInlineCards();
        if (observer) { observer.disconnect(); observer = null; }
      } else {
        if (!catalog.length) refreshCatalog();
        else scanChatMarkers();
        ensureObserver();
      }
    }

    function getStats() {
      return {
        catalogCount: catalog.length,
        inlineRendered: document.querySelectorAll('[' + RENDERED_ATTR + '="1"]').length,
        enabled: isMemeEnabled(),
        inlineRender: isInlineEnabled(),
        autoFinishSticker: Boolean(cfg.memes?.autoFinishSticker !== false),
      };
    }

    function unmount() {
      stopped = true;
      if (scanTimer) clearTimeout(scanTimer);
      if (observer) { observer.disconnect(); observer = null; }
      document.removeEventListener('click', onDocClickClosePicker, true);
      restoreInlineCards();
      for (const id of [STYLE_ID, PICKER_ID, TOAST_ID]) {
        const el = document.getElementById(id);
        if (el) el.remove();
      }
      window.__GEMINEKO_MEME_API__ = null;
    }

    document.addEventListener('click', onDocClickClosePicker, true);
    refreshCatalog();
    applyConfig(cfg);

    const api = { applyConfig, triggerFinishSticker, toggleMemePicker, scanChatMarkers, getStats, unmount };
    window.__GEMINEKO_MEME_API__ = api;
    return api;
  }
  `;
}
