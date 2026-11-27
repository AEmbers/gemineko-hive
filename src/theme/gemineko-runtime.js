/**
 * Gemineko Hive · 基米窝核心前端运行时（原生 Swarm 与独立 Sidecar 共用）。
 * 依赖同作用域中的 GEMINEKO_ASSETS, GEMINEKO_CSS, drawPixelSprite, getPixelSpriteDataUri, buildDemoSwarmSnapshot。
 */

export function bootGeminekoHive() {
  const PREFS_KEY = 'gemineko_hive_prefs_v1';
  const DEFAULT_PREFS = {
    roleMode: 'ai-girls', // 'ai-girls' | 'all-hachimi'
    artStyle: 'chibi', // 'chibi' | 'pixel'
    themeMode: 'starry-hive', // 'starry-hive' | 'avatar-only'
    locale: 'neko-zh', // 'neko-zh' | 'zh' | 'en'
    sound: false,
    collapsed: false,
  };

  let prefs = { ...DEFAULT_PREFS };
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      prefs = { ...DEFAULT_PREFS, ...saved };
    }
  } catch {
    /* ignore */
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }

  // 注入样式表
  if (!document.getElementById('gemineko-hive-styles')) {
    const st = document.createElement('style');
    st.id = 'gemineko-hive-styles';
    st.textContent = GEMINEKO_CSS;
    document.head.appendChild(st);
  }

  // 成员元信息缓存：name -> { model, role, status }
  const memberInfoMap = new Map();
  let demoActive = false;
  let lastNativeStatus = null;

  function ingestMembersFromSnap(snap) {
    if (!snap || !snap.members) return;
    if (Array.isArray(snap.members)) {
      for (const m of snap.members) {
        if (!m || !m.name) continue;
        memberInfoMap.set(m.name, {
          model: String(m.model || ''),
          role: String(m.role || ''),
          status: String(m.status || ''),
        });
      }
    } else if (typeof snap.members === 'object') {
      for (const [k, m] of Object.entries(snap.members)) {
        if (!m) continue;
        memberInfoMap.set(k, {
          model: String(m.model || ''),
          role: String(m.role || ''),
          status: String(m.status || ''),
        });
      }
    }
  }

  const RING_PALETTE = [
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#F43F5E',
    '#A855F7',
  ];

  function hashMember(s) {
    let h = 13;
    for (const ch of String(s || '')) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    return h;
  }

  function normalizeAgentName(name) {
    const leadName = window.SwarmHive?.leadName || 'coordinator';
    if (name === leadName || name === 'coordinator') return 'coordinator';
    return String(name || 'worker');
  }

  function resolveMemberCharacter(rawName, explicitState) {
    const name = normalizeAgentName(rawName);
    const info = memberInfoMap.get(name);
    const state = explicitState || info?.status || 'working';
    const asleep = state === 'parked' || state === 'landed' || state === 'done';

    let kind = 'gemini';
    if (prefs.roleMode === 'all-hachimi') {
      kind = name === 'coordinator' || info?.role === 'coordinator' ? 'queen' : 'gemini';
    } else {
      const model = (info?.model || '').toLowerCase();
      const lowName = name.toLowerCase();
      if (name === 'coordinator' || info?.role === 'coordinator') {
        kind = 'queen';
      } else if (/claude|sonnet|opus|haiku/.test(model) || /claude/.test(lowName)) {
        kind = 'claude';
      } else if (/gpt|codex|sol|astra|o1|o3/.test(model) || /gpt|codex|sol/.test(lowName)) {
        kind = 'gpt';
      } else {
        kind = 'gemini';
      }
    }

    const ringColor =
      kind === 'queen' ? '#F59E0B' : RING_PALETTE[hashMember(name) % RING_PALETTE.length];

    return { name, kind, state, asleep, ringColor };
  }

  // 离屏裁剪圆角 Chibi Data URI 缓存，确保 GIF 导出与 SVG <image> 渲染丝滑锐利
  const chibiAvatarCache = new Map();
  const chibiRawImgCache = new Map();

  function getChibiKeyUri(kind, asleep) {
    if (kind === 'queen') return GEMINEKO_ASSETS.queen;
    if (kind === 'claude') return GEMINEKO_ASSETS.claudeWorking;
    if (kind === 'gpt') return GEMINEKO_ASSETS.gptWorking;
    return asleep ? GEMINEKO_ASSETS.geminiSleep : GEMINEKO_ASSETS.geminiWorking;
  }

  function warmChibiImg(srcUri, onReady) {
    if (chibiRawImgCache.has(srcUri)) {
      const entry = chibiRawImgCache.get(srcUri);
      if (entry.loaded && onReady) onReady(entry.img);
      return entry.img;
    }
    const img = new Image();
    const rec = { img, loaded: false };
    chibiRawImgCache.set(srcUri, rec);
    img.onload = () => {
      rec.loaded = true;
      chibiAvatarCache.clear();
      if (onReady) onReady(img);
    };
    img.src = srcUri;
    return img;
  }

  // 启动即预热 5 张精灵图片以便随时同步生成圆形 GIF 头像
  for (const uri of [
    GEMINEKO_ASSETS.queen,
    GEMINEKO_ASSETS.geminiWorking,
    GEMINEKO_ASSETS.geminiSleep,
    GEMINEKO_ASSETS.claudeWorking,
    GEMINEKO_ASSETS.gptWorking,
  ]) {
    warmChibiImg(uri);
  }

  function getSpriteSrcForGifOrMsg(rawName, explicitState) {
    const ch = resolveMemberCharacter(rawName, explicitState);
    if (prefs.artStyle === 'pixel') {
      return getPixelSpriteDataUri({
        kind: ch.kind,
        memberName: ch.name,
        roleMode: prefs.roleMode,
        state: ch.state,
        frame: 0,
      });
    }
    const rawUri = getChibiKeyUri(ch.kind, ch.asleep);
    const cacheKey = `${rawUri}|${ch.ringColor}|${ch.kind === 'queen' ? 'q' : 'w'}`;
    if (chibiAvatarCache.has(cacheKey)) {
      return chibiAvatarCache.get(cacheKey);
    }
    const rec = chibiRawImgCache.get(rawUri);
    if (rec && rec.loaded) {
      const sz = 44;
      const cv = document.createElement('canvas');
      cv.width = sz;
      cv.height = sz;
      const ctx = cv.getContext('2d');
      ctx.save();
      ctx.beginPath();
      ctx.arc(sz / 2, sz / 2, sz / 2 - 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(rec.img, 0, 0, sz, sz);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(sz / 2, sz / 2, sz / 2 - 1.5, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = ch.ringColor;
      ctx.stroke();
      const outUri = cv.toDataURL('image/png');
      chibiAvatarCache.set(cacheKey, outUri);
      return outUri;
    }
    return rawUri;
  }

  // Web Audio 轻量喵呜/叮咚合成音效（默认静音，不依赖外部音频文件）
  let audioCtx = null;
  function playMeow(variant = 'pat') {
    if (!prefs.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = variant === 'poke' ? 'triangle' : 'sine';
      if (variant === 'poke') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.22);
      } else {
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.16);
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      /* ignore */
    }
  }

  const POKE_LINES = {
    'neko-zh': [
      '坏了，捅了基米窝了喵！',
      '喵呜！谁戳了本喵的猫耳！',
      '快干活喵！不许摸鱼！',
      '哈基米能量溢出啦～',
      '再戳一口本小姐要写 95 分严格审查了哼！',
      '别晃蜂巢呀，星芒微粒要掉光啦～',
    ],
    zh: [
      '触发蜂巢振动！全体成员加速中',
      '协调者正在重新对齐全部任务！',
      '成员状态全检刷新完成',
      '检测到互动点击，团队士气 +10%',
    ],
    en: [
      'Oops, poked the Gemineko Hive!',
      'Neko squad startled — full speed ahead!',
      'Heads up! Coordinator is checking the nest!',
      'Headpat received! Morale +100%!',
    ],
  };

  function spawnBubbleAt(x, y, text) {
    const el = document.createElement('div');
    el.className = 'gn-float-bubble';
    el.textContent = text;
    el.style.left = `${Math.max(70, Math.min(window.innerWidth - 70, x))}px`;
    el.style.top = `${Math.max(40, Math.min(window.innerHeight - 40, y))}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2350);
  }

  function triggerPokeHive() {
    playMeow('poke');
    document.body.classList.remove('gn-poked');
    void document.body.offsetWidth;
    document.body.classList.add('gn-poked');
    setTimeout(() => document.body.classList.remove('gn-poked'), 1150);

    const pool = POKE_LINES[prefs.locale] || POKE_LINES['neko-zh'];
    const sprites = [...document.querySelectorAll('.gn-sprite-host')];
    const picks = sprites.slice(0, 5);
    if (!picks.length) {
      spawnBubbleAt(window.innerWidth / 2, 120, pool[0]);
      return;
    }
    picks.forEach((node, idx) => {
      const rect = node.getBoundingClientRect();
      const line = pool[(idx + Math.floor(Math.random() * pool.length)) % pool.length];
      setTimeout(() => {
        spawnBubbleAt(rect.left + rect.width / 2, rect.top, line);
      }, idx * 90);
    });
  }

  // 三语文案映射表
  const LOCALE_TEXT = {
    'neko-zh': {
      overview: '猫窝总览',
      feed: '喵呜消息板',
      members: '基米成员',
      graph: '关系猫窝',
      raw: '原始数据',
      live: '实时窝态',
      emptyTitle: '这个对话里还没有搭起基米窝喵',
      exportGif: '导出猫窝 GIF',
      poke: '捅一捅',
      roleAi: 'AI娘宇宙',
      roleHachimi: '全员哈基米',
      artChibi: 'Q版立绘',
      artPixel: '32px像素',
      themeHive: '星空猫窝',
      themeMin: '仅换头像',
      locLabel: '萌系中文',
      demoBtn: '🐾 一键体验模拟基米窝（Demo）',
      exitDemo: '退出 Demo',
    },
    zh: {
      overview: '概览',
      feed: '消息板',
      members: '成员',
      graph: '关系图',
      raw: '原始数据',
      live: '实时',
      emptyTitle: '当前对话暂无 Swarm 协作',
      exportGif: '导出 GIF',
      poke: '互动晃动',
      roleAi: 'AI娘模式',
      roleHachimi: '全员哈基米',
      artChibi: 'Q版立绘',
      artPixel: '像素风',
      themeHive: '星空猫窝',
      themeMin: '仅换头像',
      locLabel: '正常中文',
      demoBtn: '🐾 一键体验模拟基米窝（Demo）',
      exitDemo: '退出 Demo',
    },
    en: {
      overview: 'Overview',
      feed: 'Board',
      members: 'Members',
      graph: 'Graph',
      raw: 'Raw',
      live: 'Live',
      emptyTitle: 'No swarm in this conversation',
      exportGif: 'Export GIF',
      poke: 'Poke Hive',
      roleAi: 'AI Girls',
      roleHachimi: 'All Hachimi',
      artChibi: 'Chibi',
      artPixel: '32px Pixel',
      themeHive: 'Starry Hive',
      themeMin: 'Avatar Only',
      locLabel: 'EN',
      demoBtn: '🐾 Try Demo Gemineko Hive',
      exitDemo: 'Exit Demo',
    },
  };

  function setButtonLeadText(el, nextText) {
    if (!el) return;
    for (const node of el.childNodes) {
      if (node.nodeType === 3 && node.nodeValue.trim()) {
        node.nodeValue = nextText;
        return;
      }
    }
    if (!el.children.length) el.textContent = nextText;
  }

  function applyThemeAndLocale() {
    document.body.setAttribute('data-gemineko-minimal', prefs.themeMode === 'avatar-only' ? '1' : '0');
    const L = LOCALE_TEXT[prefs.locale] || LOCALE_TEXT['neko-zh'];
    setButtonLeadText(document.getElementById('tabbtn-overview'), L.overview);
    setButtonLeadText(document.getElementById('tabbtn-feed'), L.feed);
    setButtonLeadText(document.getElementById('tabbtn-members'), L.members);
    setButtonLeadText(document.getElementById('tabbtn-graph'), L.graph);
    setButtonLeadText(document.getElementById('tabbtn-raw'), L.raw);
    const liveLbl = document.getElementById('live-label');
    if (liveLbl) liveLbl.textContent = L.live;
    const emptyTitle = document.getElementById('empty-title');
    if (emptyTitle) emptyTitle.textContent = L.emptyTitle;
    const gifLbl = document.getElementById('graph-export-gif-label');
    if (gifLbl) gifLbl.textContent = L.exportGif;
  }

  // 把页面上所有 .beebox 与消息头像同步为《基米窝》精灵
  function enhanceDomSprites() {
    const boxes = document.querySelectorAll('.beebox');
    for (const box of boxes) {
      const wrap = box.querySelector('.beewrap');
      const rawName = wrap?.dataset?.bee || 'worker';
      const state = box.dataset.state || wrap?.dataset?.state || 'working';
      const ch = resolveMemberCharacter(rawName, state);
      const renderKey = `${ch.kind}|${ch.name}|${ch.asleep ? 1 : 0}|${prefs.artStyle}|${prefs.roleMode}`;

      if (wrap) wrap.style.display = 'none';
      const gsh = box.querySelector('.gsh');
      if (gsh) gsh.style.display = 'none';

      let host = box.querySelector('.gn-sprite-host');
      if (!host) {
        host = document.createElement('span');
        host.className = 'gn-sprite-host';
        host.title = `点击摸摸 @${ch.name}`;
        host.addEventListener('click', (ev) => {
          ev.stopPropagation();
          playMeow('pat');
          const r = host.getBoundingClientRect();
          const msg =
            ch.kind === 'claude'
              ? '本小姐可不是特意帮你的！'
              : ch.kind === 'gpt'
                ? 'Sol 核心稳定运行中，交给我吧！'
                : '喵呜～摸摸头干劲 +100%！';
          spawnBubbleAt(r.left + r.width / 2, r.top, msg);
        });
        box.appendChild(host);
      }

      if (host.dataset.gnKey !== renderKey) {
        host.dataset.gnKey = renderKey;
        let img = host.querySelector('img.gn-sprite-img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'gn-sprite-img';
          img.alt = ch.name;
          host.appendChild(img);
        }
        img.classList.toggle('is-pixel', prefs.artStyle === 'pixel');
        img.style.setProperty('--gn-ring-color', ch.ringColor);

        if (prefs.artStyle === 'pixel') {
          img.src = getPixelSpriteDataUri({
            kind: ch.kind,
            memberName: ch.name,
            roleMode: prefs.roleMode,
            state: ch.state,
            frame: 0,
          });
        } else {
          img.src = getChibiKeyUri(ch.kind, ch.asleep);
        }

        let zzz = host.querySelector('.gn-zzz');
        if (ch.asleep) {
          if (!zzz) {
            zzz = document.createElement('span');
            zzz.className = 'gn-zzz';
            zzz.textContent = 'Zzz';
            host.appendChild(zzz);
          }
        } else if (zzz) {
          zzz.remove();
        }
      }
    }

    // 同步刷新关系图中的 <image class="node-bee">
    const graphImgs = document.querySelectorAll('svg.graph image.node-bee');
    for (const nodeImg of graphImgs) {
      const g = nodeImg.closest('g');
      const label = g?.querySelector('text')?.textContent?.trim();
      if (!label) continue;
      const newHref = getSpriteSrcForGifOrMsg(label);
      if (nodeImg.getAttribute('href') !== newHref) {
        nodeImg.setAttribute('href', newHref);
      }
    }
  }

  function refreshAllSprites() {
    chibiAvatarCache.clear();
    document.querySelectorAll('.gn-sprite-host').forEach((h) => {
      delete h.dataset.gnKey;
    });
    enhanceDomSprites();
    // 同步更新消息板头像
    document.querySelectorAll('.msg-av.bee img.gn-msg-avatar').forEach((img) => {
      const name = img.dataset.gnAgent;
      if (name) {
        img.src = getSpriteSrcForGifOrMsg(name);
        img.classList.toggle('is-pixel', prefs.artStyle === 'pixel');
      }
    });
  }

  // 构建顶部控制栏 & 独立 Sidecar 原生换肤开关
  async function fetchNativePatchStatus(barUpdateCb) {
    if (!window.__GEMINEKO_SIDECAR_MODE__) return;
    try {
      const resp = await originalFetch('/api/native-patch/status');
      if (resp.ok) {
        lastNativeStatus = await resp.json();
        if (barUpdateCb) barUpdateCb();
      }
    } catch {
      /* ignore */
    }
  }

  function renderToolbar() {
    const boardHeader = document.querySelector('#board .header');
    if (!boardHeader) return;
    let bar = document.getElementById('gemineko-toolbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'gemineko-toolbar';
      bar.className = 'gn-bar';
      boardHeader.insertBefore(bar, boardHeader.firstChild);
    }

    const L = LOCALE_TEXT[prefs.locale] || LOCALE_TEXT['neko-zh'];
    bar.classList.toggle('is-collapsed', Boolean(prefs.collapsed));

    let nativeBtnHtml = '';
    if (window.__GEMINEKO_SIDECAR_MODE__) {
      const st = lastNativeStatus;
      let label = '检测原生 Swarm…';
      let cls = 'gn-pill';
      if (st) {
        if (!st.swarmExists) {
          label = '未检测到原生 Swarm';
        } else if (st.patched && st.upToDate) {
          label = '✅ 原生 Swarm 已换肤（点此还原）';
          cls = 'gn-pill is-native-on';
        } else if (st.patched) {
          label = '✨ 原生皮肤待更新（点此同步）';
        } else {
          label = '🎨 原生 Swarm 换肤：点击启用';
        }
      }
      nativeBtnHtml = `<button type="button" class="${cls}" data-gn-act="native-toggle" title="无损美化或还原 Antigravity 官方原生 Swarm 面板">${label}</button>`;
    }

    const exitDemoHtml = demoActive
      ? `<button type="button" class="gn-pill is-demo" data-gn-act="exit-demo">${L.exitDemo}</button>`
      : '';

    bar.innerHTML = `
      <span class="gn-brand" data-gn-act="collapse" title="展开/收起基米窝工具栏">
        <img class="gn-brand-dot" src="${GEMINEKO_ASSETS.logo}" alt="" />
        <span>基米窝</span>
      </span>
      <div class="gn-controls">
        <button type="button" class="gn-pill" data-gn-act="role">${prefs.roleMode === 'ai-girls' ? `✨ ${L.roleAi}` : `🐱 ${L.roleHachimi}`}</button>
        <button type="button" class="gn-pill" data-gn-act="art">${prefs.artStyle === 'chibi' ? `🎨 ${L.artChibi}` : `👾 ${L.artPixel}`}</button>
        <button type="button" class="gn-pill" data-gn-act="theme">${prefs.themeMode === 'starry-hive' ? `🌌 ${L.themeHive}` : `🫥 ${L.themeMin}`}</button>
        <button type="button" class="gn-pill" data-gn-act="locale">💬 ${L.locLabel}</button>
        <button type="button" class="gn-pill" data-gn-act="sound">${prefs.sound ? '🔊 喵音' : '🔇 静音'}</button>
        <button type="button" class="gn-pill is-poke" data-gn-act="poke">🌿 ${L.poke}</button>
        ${nativeBtnHtml}
        ${exitDemoHtml}
      </div>
      <button type="button" class="gn-pill gn-collapse-btn" data-gn-act="collapse" aria-label="折叠工具栏">${prefs.collapsed ? '展开 ▾' : '收起 ▴'}</button>
    `;

    bar.querySelectorAll('[data-gn-act]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const act = btn.getAttribute('data-gn-act');
        if (act === 'collapse') {
          prefs.collapsed = !prefs.collapsed;
        } else if (act === 'role') {
          prefs.roleMode = prefs.roleMode === 'ai-girls' ? 'all-hachimi' : 'ai-girls';
        } else if (act === 'art') {
          prefs.artStyle = prefs.artStyle === 'chibi' ? 'pixel' : 'chibi';
        } else if (act === 'theme') {
          prefs.themeMode = prefs.themeMode === 'starry-hive' ? 'avatar-only' : 'starry-hive';
        } else if (act === 'locale') {
          const order = ['neko-zh', 'zh', 'en'];
          prefs.locale = order[(order.indexOf(prefs.locale) + 1) % order.length];
        } else if (act === 'sound') {
          prefs.sound = !prefs.sound;
          if (prefs.sound) playMeow('pat');
        } else if (act === 'poke') {
          triggerPokeHive();
          return;
        } else if (act === 'exit-demo') {
          demoActive = false;
          renderToolbar();
          window.location.reload();
          return;
        } else if (act === 'native-toggle') {
          if (!lastNativeStatus?.swarmExists) return;
          const endpoint =
            lastNativeStatus.patched && lastNativeStatus.upToDate
              ? '/api/native-patch/restore'
              : '/api/native-patch/apply';
          try {
            const headers = { 'Content-Type': 'application/json' };
            if (window.__SIDECAR_TOKEN__) headers['x-sidecar-token'] = window.__SIDECAR_TOKEN__;
            const r = await originalFetch(endpoint, { method: 'POST', headers, body: '{}' });
            if (r.ok) {
              lastNativeStatus = await r.json();
              const msg = lastNativeStatus.patched
                ? '原生 Swarm 已换肤！重开原生 Swarm 面板即可生效～'
                : '已无损还原为官方原版 Swarm！';
              spawnBubbleAt(btn.getBoundingClientRect().left + 60, btn.getBoundingClientRect().bottom + 24, msg);
              renderToolbar();
            }
          } catch {
            /* ignore */
          }
          return;
        }
        savePrefs();
        applyThemeAndLocale();
        refreshAllSprites();
        renderToolbar();
      });
    });
  }

  // 在空状态 #empty 中注入「一键体验模拟基米窝（Demo）」按钮（和独立侧边栏原生换肤提示）
  function ensureEmptyStateDemoButton() {
    const emptyCard = document.querySelector('#empty .empty-card');
    if (!emptyCard || emptyCard.querySelector('.gn-empty-demo-wrap')) return;

    const L = LOCALE_TEXT[prefs.locale] || LOCALE_TEXT['neko-zh'];
    const wrap = document.createElement('div');
    wrap.className = 'gn-empty-demo-wrap';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gn-empty-demo-btn';
    btn.textContent = L.demoBtn;
    btn.addEventListener('click', () => {
      demoActive = true;
      playMeow('poke');
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:11px;opacity:.75;margin-top:4px;';
      hint.textContent = '正在召唤 5 只 AI 娘进入基米窝…';
      wrap.appendChild(hint);
      // 触发焦点事件促使 app.js 立即轮询一次（若无则最多等待原生 1.5s 轮询自动切换）
      window.dispatchEvent(new Event('focus'));
    });
    wrap.appendChild(btn);

    if (window.__GEMINEKO_SIDECAR_MODE__) {
      const nativeRow = document.createElement('div');
      nativeRow.id = 'gn-empty-native-row';
      nativeRow.style.marginTop = '6px';
      const nbtn = document.createElement('button');
      nbtn.type = 'button';
      nbtn.className = 'gn-pill';
      nbtn.textContent = lastNativeStatus?.patched
        ? '✅ 原生 Swarm 已换肤（点此还原）'
        : '🎨 给官方原生 Swarm 面板换上《基米窝》皮肤';
      nbtn.addEventListener('click', async () => {
        if (!lastNativeStatus?.swarmExists) return;
        const ep =
          lastNativeStatus.patched && lastNativeStatus.upToDate
            ? '/api/native-patch/restore'
            : '/api/native-patch/apply';
        const headers = { 'Content-Type': 'application/json' };
        if (window.__SIDECAR_TOKEN__) headers['x-sidecar-token'] = window.__SIDECAR_TOKEN__;
        const r = await originalFetch(ep, { method: 'POST', headers, body: '{}' });
        if (r.ok) {
          lastNativeStatus = await r.json();
          nbtn.textContent = lastNativeStatus.patched
            ? '✅ 原生 Swarm 已换肤（点此还原）'
            : '🎨 给官方原生 Swarm 面板换上《基米窝》皮肤';
          renderToolbar();
        }
      });
      nativeRow.appendChild(nbtn);
      wrap.appendChild(nativeRow);
    }

    emptyCard.appendChild(wrap);
  }

  // 劫持 fetch 捕获 /api/swarm 成员底层模型，并支持空状态 Demo 秒切
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function patchedFetch(input, init) {
    const urlStr = typeof input === 'string' ? input : input?.url || '';
    const isSwarmData = /\/api\/swarm(?:$|\?)/.test(urlStr);
    if (isSwarmData && demoActive) {
      const snap = buildDemoSwarmSnapshot();
      ingestMembersFromSnap(snap);
      return new window.Response(JSON.stringify(snap), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const resp = await originalFetch(input, init);
    if (isSwarmData && resp.ok) {
      try {
        const clone = resp.clone();
        const data = await clone.json();
        ingestMembersFromSnap(data);
      } catch {
        /* ignore */
      }
    }
    return resp;
  };

  // 包装 window.SwarmHive
  function installSwarmHiveHooks() {
    if (!window.SwarmHive || window.SwarmHive.__geminekoHooked) return Boolean(window.SwarmHive);
    window.SwarmHive.__geminekoHooked = true;

    const origAvatarHtml = window.SwarmHive.avatarHtml;
    const origBeeSrc = window.SwarmHive.beeSrc;
    const origUpdate = window.SwarmHive.update;
    const origMap = window.SwarmHive.map;

    if (typeof origAvatarHtml === 'function') {
      window.SwarmHive.avatarHtml = function (name) {
        const ch = resolveMemberCharacter(name);
        const src = getSpriteSrcForGifOrMsg(ch.name, ch.state);
        const pxCls = prefs.artStyle === 'pixel' ? ' is-pixel' : '';
        return `<span class="msg-av bee" style="background:transparent" aria-hidden="true"><img class="gn-msg-avatar${pxCls}" data-gn-agent="${ch.name.replace(/"/g, '&quot;')}" src="${src}" alt="" width="24" height="24"></span>`;
      };
    }

    if (typeof origBeeSrc === 'function') {
      window.SwarmHive.beeSrc = function (name) {
        return getSpriteSrcForGifOrMsg(name);
      };
    }

    if (typeof origUpdate === 'function') {
      window.SwarmHive.update = function (snap, el, opts) {
        ingestMembersFromSnap(snap);
        const res = origUpdate.apply(this, arguments);
        queueMicrotask(enhanceDomSprites);
        return res;
      };
    }

    if (typeof origMap === 'function') {
      window.SwarmHive.map = function (snap, el, opts) {
        ingestMembersFromSnap(snap);
        const res = origMap.apply(this, arguments);
        queueMicrotask(enhanceDomSprites);
        return res;
      };
    }
    return true;
  }

  // 启动 DOM 观察与初始渲染
  const start = () => {
    installSwarmHiveHooks();
    applyThemeAndLocale();
    renderToolbar();
    ensureEmptyStateDemoButton();
    enhanceDomSprites();
    fetchNativePatchStatus(() => {
      renderToolbar();
      const nbtn = document.querySelector('#gn-empty-native-row button');
      if (nbtn && lastNativeStatus) {
        nbtn.textContent = lastNativeStatus.patched
          ? '✅ 原生 Swarm 已换肤（点此还原）'
          : '🎨 给官方原生 Swarm 面板换上《基米窝》皮肤';
      }
    });

    const mo = new MutationObserver(() => {
      installSwarmHiveHooks();
      applyThemeAndLocale();
      ensureEmptyStateDemoButton();
      if (!document.getElementById('gemineko-toolbar')) {
        renderToolbar();
      }
      enhanceDomSprites();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
