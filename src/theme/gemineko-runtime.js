/**
 * Gemineko Hive · 基米窝核心前端运行时 v0.4.0（原生 Swarm 与独立 Sidecar 共用）。
 * 依赖同作用域中的 GEMINEKO_ASSETS, GEMINEKO_CSS, resolveMemeNickname, drawPixelSprite, getPixelSpriteDataUri, buildDemoSwarmSnapshot。
 */

/**
 * 解析原生蜂巢图谱的平顶六边形路径，提取中心坐标与外接半径。
 * 对含曲线或非标准正六边形的路径返回 null。
 * @param {string} d
 * @returns {{ cx: number, cy: number, r: number } | null}
 */
export function parseHexPathGeometry(d) {
  if (typeof d !== 'string' || !d.trim() || /[CQTAS]/i.test(d)) return null;
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length !== 12) return null;

  const pts = [];
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < 12; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    pts.push([x, y]);
    sx += x;
    sy += y;
  }

  const cx = sx / 6;
  const cy = sy / 6;
  const rs = pts.map(([px, py]) => Math.hypot(px - cx, py - cy));
  const r = rs.reduce((a, b) => a + b, 0) / 6;
  if (!Number.isFinite(r) || r <= 1) return null;
  if (rs.some((ri) => Math.abs(ri - r) >= 1.5)) return null;
  return { cx, cy, r };
}

/**
 * 构建圆润可爱的猫耳软垫猫窝闭合 SVG Path（严格约束在原六边形安全包络内）。
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @returns {string}
 */
export function buildCatNestPath(cx, cy, r) {
  const px = (nx) => (cx + nx * r).toFixed(1);
  const py = (ny) => (cy + ny * r).toFixed(1);
  const c = (x1, y1, x2, y2, x, y) => `C${px(x1)} ${py(y1)} ${px(x2)} ${py(y2)} ${px(x)} ${py(y)}`;
  return [
    `M${px(0)} ${py(-0.76)}`,
    c(0.09, -0.76, 0.18, -0.77, 0.25, -0.76),
    c(0.34, -0.82, 0.44, -0.93, 0.54, -0.90),
    c(0.65, -0.87, 0.73, -0.71, 0.75, -0.54),
    c(0.90, -0.34, 0.98, -0.10, 0.92, 0.14),
    c(0.84, 0.54, 0.46, 0.84, 0, 0.84),
    c(-0.46, 0.84, -0.84, 0.54, -0.92, 0.14),
    c(-0.98, -0.10, -0.90, -0.34, -0.75, -0.54),
    c(-0.73, -0.71, -0.65, -0.87, -0.54, -0.90),
    c(-0.44, -0.93, -0.34, -0.82, -0.25, -0.76),
    c(-0.18, -0.77, -0.09, -0.76, 0, -0.76),
    'Z',
  ].join(' ');
}

/**
 * 构建猫窝内部细节装饰 SVG 片段（内耳粉垫、虚线缝线、软垫高光、蝴蝶结或小猫爪）。
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {{ isCoord?: boolean }} [opts]
 * @returns {string}
 */
export function buildCatNestDecoSvg(cx, cy, r, opts = {}) {
  if (!Number.isFinite(r) || r < 36) return '';
  const isCoord = Boolean(opts.isCoord);
  const px = (nx) => (cx + nx * r).toFixed(1);
  const py = (ny) => (cy + ny * r).toFixed(1);

  const parts = [];
  // 左右粉嫩圆角内耳
  parts.push(
    `<path class="gn-nest-ear-inner" d="M${px(0.41)} ${py(-0.74)} Q${px(0.51)} ${py(-0.83)} ${px(0.59)} ${py(-0.71)} Q${px(0.65)} ${py(-0.59)} ${px(0.57)} ${py(-0.57)} Q${px(0.45)} ${py(-0.58)} ${px(0.37)} ${py(-0.67)} Q${px(0.35)} ${py(-0.72)} ${px(0.41)} ${py(-0.74)} Z"/>`,
    `<path class="gn-nest-ear-inner" d="M${px(-0.41)} ${py(-0.74)} Q${px(-0.51)} ${py(-0.83)} ${px(-0.59)} ${py(-0.71)} Q${px(-0.65)} ${py(-0.59)} ${px(-0.57)} ${py(-0.57)} Q${px(-0.45)} ${py(-0.58)} ${px(-0.37)} ${py(-0.67)} Q${px(-0.35)} ${py(-0.72)} ${px(-0.41)} ${py(-0.74)} Z"/>`,
  );

  // 内圈虚线毛绒缝线
  if (r >= 44) {
    parts.push(`<path class="gn-nest-stitch" d="${buildCatNestPath(cx, cy, r * 0.905)}"/>`);
  }

  // 底部柔软软垫弧影
  if (r >= 52) {
    parts.push(
      `<path class="gn-nest-cushion" d="M${px(-0.62)} ${py(0.50)} Q${px(0)} ${py(0.76)} ${px(0.62)} ${py(0.50)} Q${px(0)} ${py(0.65)} ${px(-0.62)} ${py(0.50)} Z"/>`,
    );
  }

  // 协调喵主窝专属额头小蝴蝶结
  if (isCoord && r >= 48) {
    parts.push(
      `<path class="gn-nest-bow-wing" d="M${px(-0.02)} ${py(-0.76)} C${px(-0.09)} ${py(-0.83)} ${px(-0.14)} ${py(-0.81)} ${px(-0.13)} ${py(-0.76)} C${px(-0.14)} ${py(-0.71)} ${px(-0.09)} ${py(-0.69)} ${px(-0.02)} ${py(-0.76)} Z"/>`,
      `<path class="gn-nest-bow-wing" d="M${px(0.02)} ${py(-0.76)} C${px(0.09)} ${py(-0.83)} ${px(0.14)} ${py(-0.81)} ${px(0.13)} ${py(-0.76)} C${px(0.14)} ${py(-0.71)} ${px(0.09)} ${py(-0.69)} ${px(0.02)} ${py(-0.76)} Z"/>`,
      `<circle class="gn-nest-bow-knot" cx="${px(0)}" cy="${py(-0.76)}" r="${(0.032 * r).toFixed(1)}"/>`,
    );
  } else if (!isCoord && r >= 60) {
    // 普通任务窝底缘小猫爪印
    parts.push(
      `<g class="gn-nest-paw">`,
      `<ellipse cx="${px(0)}" cy="${py(0.745)}" rx="${(0.048 * r).toFixed(1)}" ry="${(0.034 * r).toFixed(1)}"/>`,
      `<circle cx="${px(-0.045)}" cy="${py(0.695)}" r="${(0.017 * r).toFixed(1)}"/>`,
      `<circle cx="${px(0)}" cy="${py(0.682)}" r="${(0.018 * r).toFixed(1)}"/>`,
      `<circle cx="${px(0.045)}" cy="${py(0.695)}" r="${(0.017 * r).toFixed(1)}"/>`,
      `</g>`,
    );
  }

  return `<g class="gn-nest-deco${isCoord ? ' is-coord' : ''}">${parts.join('')}</g>`;
}

export function bootGeminekoHive() {
  const PREFS_KEY = 'gemineko_hive_prefs_v3';
  const DEFAULT_PREFS = {
    roleMode: 'ai-girls', // 'ai-girls' | 'all-hachimi'
    artStyle: 'chibi', // 'chibi' | 'pixel'
    themeMode: 'starry-hive', // 'starry-hive' | 'avatar-only'
    memeNicknames: true, // 默认开启哈基米高浓度梗名
    locale: 'neko-zh', // 'neko-zh' | 'zh' | 'en'
    sound: false,
    collapsed: false,
    settingsOpen: false,
  };

  let prefs = { ...DEFAULT_PREFS };
  try {
    const saved =
      JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') ||
      JSON.parse(localStorage.getItem('gemineko_hive_prefs_v2') || 'null');
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
  let styleEl = document.getElementById('gemineko-hive-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'gemineko-hive-styles';
    document.head.appendChild(styleEl);
  }
  if (styleEl.textContent !== GEMINEKO_CSS) {
    styleEl.textContent = GEMINEKO_CSS;
  }

  const ACTION_EMOJI = {
    thinking: '💭',
    reading: '🔍',
    editing: '⌨️',
    running: '⚡',
    asking: '❓',
    idle: '💤',
  };

  const ACTION_LABELS = {
    thinking: '思考中',
    reading: '读代码中',
    editing: '改文件中',
    running: '跑终端中',
    asking: '等你拍板',
    idle: '打盹摸鱼',
  };

  // 成员元信息缓存：name -> { model, role, status, geminekoRole, action, actionLabel, phase, lastTool }
  const memberInfoMap = new Map();
  let demoActive = false;
  let lastNativeStatus = null;
  let lastLiveActivity = null;
  let lastCdpStatus = null;
  let lastGithubPulse = null;
  let updateBannerDismissed = false;
  let lastSidecarThemeConfig = null;
  let lastSidecarThemeTs = 0;
  let lastReportedHostScheme = '';
  let lastSidecarThemeSig = '';

  function resolveHostNativeDark(_root, reportedScheme = lastReportedHostScheme) {
    if (reportedScheme === 'dark') return true;
    if (reportedScheme === 'light') return false;
    try {
      return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return false;
    }
  }

  const TYPO_STORAGE_KEY = 'gemineko_typography_v1';
  const SPRITE_Q_KEY = 'gemineko_sprite_quality_v1';
  const DOCK_STORAGE_KEY = 'gemineko_dock_prefs_v1';

  function normDockPrefs(raw, base) {
    const d = raw && typeof raw === 'object' ? raw : {};
    const b = base && typeof base === 'object' ? base : { side: 'left', catSize: 100, badgeScale: 120, sidecarAvatarSize: 64 };
    const clampInt = (v, min, max, fb) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fb;
    };
    const side = d.side === 'right' || d.side === 'left'
      ? d.side
      : (b.side === 'right' ? 'right' : 'left');
    return {
      side,
      catSize: clampInt(d.catSize, 52, 140, b.catSize ?? 100),
      badgeScale: clampInt(d.badgeScale, 85, 150, b.badgeScale ?? 120),
      sidecarAvatarSize: clampInt(d.sidecarAvatarSize, 44, 112, b.sidecarAvatarSize ?? 64),
    };
  }

  function readLocalDockPrefs() {
    try {
      const raw = localStorage.getItem(DOCK_STORAGE_KEY);
      if (!raw) return null;
      return normDockPrefs(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  function writeLocalDockPrefs(dock) {
    if (!dock || typeof dock !== 'object') return null;
    const clean = normDockPrefs(dock, readLocalDockPrefs());
    try { localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(clean)); } catch {}
    return clean;
  }

  function normalizeSpriteQ(val) {
    const s = String(val || '');
    return s === '384' || s === '512' || s === '1024' ? s : '';
  }

  function readLocalSpriteQ() {
    try {
      return normalizeSpriteQ(localStorage.getItem(SPRITE_Q_KEY));
    } catch {
      return '';
    }
  }

  function writeLocalSpriteQ(q) {
    const clean = normalizeSpriteQ(q);
    if (!clean) return '';
    try { localStorage.setItem(SPRITE_Q_KEY, clean); } catch {}
    return clean;
  }

  function getActiveSpriteQuality() {
    return normalizeSpriteQ(lastSidecarThemeConfig?.spriteQuality) || readLocalSpriteQ() || '1024';
  }

  let lastSpriteQuality = getActiveSpriteQuality();

  function readLocalTypography() {
    try {
      const raw = localStorage.getItem(TYPO_STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return null;
      return {
        sidecarFontSize: Math.max(11, Math.min(22, Math.round(Number(obj.sidecarFontSize) || 14))),
        hostFontScale: Math.max(85, Math.min(135, Math.round(Number(obj.hostFontScale) || 100))),
      };
    } catch {
      return null;
    }
  }

  function writeLocalTypography(typo) {
    try {
      if (typo === null) {
        localStorage.removeItem(TYPO_STORAGE_KEY);
        return;
      }
      if (!typo || typeof typo !== 'object') return;
      const clean = {
        sidecarFontSize: Math.max(11, Math.min(22, Math.round(Number(typo.sidecarFontSize) || 14))),
        hostFontScale: Math.max(85, Math.min(135, Math.round(Number(typo.hostFontScale) || 100))),
      };
      localStorage.setItem(TYPO_STORAGE_KEY, JSON.stringify(clean));
    } catch {}
  }

  function mergeTypographyConfig(cfg) {
    if (!cfg || typeof cfg !== 'object') return cfg;
    let out = cfg;
    if (out.typography && typeof out.typography === 'object') {
      writeLocalTypography(out.typography);
    } else {
      const localTypo = readLocalTypography();
      if (localTypo) out = { ...out, typography: localTypo };
    }
    const cfgQ = normalizeSpriteQ(out.spriteQuality);
    if (cfgQ) {
      writeLocalSpriteQ(cfgQ);
    } else {
      const localQ = readLocalSpriteQ();
      if (localQ) out = { ...out, spriteQuality: localQ };
    }
    if (out.dock && typeof out.dock === 'object') {
      out = { ...out, dock: writeLocalDockPrefs(out.dock) };
    } else {
      const localDock = readLocalDockPrefs();
      if (localDock) out = { ...out, dock: localDock };
    }
    return out;
  }

  function computeThemeSyncSig(cfg, hostScheme) {
    if (!cfg || typeof cfg !== 'object') return '';
    return JSON.stringify([
      hostScheme || '',
      Number(cfg.updatedAt || 0),
      Boolean(cfg.enabled),
      cfg.preset || '',
      cfg.activeThemePackId || '',
      cfg.themeIntensity || '',
      cfg.spinnerStyle || '',
      cfg.spriteQuality || '',
      cfg.dock || null,
      cfg.typography || null,
      cfg.easterEggs || null,
    ]);
  }

  function syncSidecarHostTheme(cfg, hostScheme) {
    if (hostScheme === 'light' || hostScheme === 'dark') {
      lastReportedHostScheme = hostScheme;
    }
    const prevQ = lastSpriteQuality;
    if (cfg && typeof cfg === 'object') {
      lastSidecarThemeConfig = mergeTypographyConfig(cfg);
      lastSidecarThemeTs = Number(cfg.updatedAt || 0);
      lastSidecarThemeSig = computeThemeSyncSig(lastSidecarThemeConfig, lastReportedHostScheme);
    }
    const nextQ = getActiveSpriteQuality();
    if (nextQ !== prevQ) {
      lastSpriteQuality = nextQ;
      try { chibiAvatarCache.clear(); chibiRawImgCache.clear(); } catch {}
      try { refreshAllSprites(); } catch {}
      const liveImg = document.querySelector('.gn-live-avatar');
      if (liveImg && typeof resolveLiveSpriteUrl === 'function') {
        const nextUrl = resolveLiveSpriteUrl(lastLiveActivity || {});
        liveImg.dataset.gnFallback = '0';
        liveImg.setAttribute('data-src', nextUrl);
        liveImg.src = nextUrl;
      }
    }
    const cur = lastSidecarThemeConfig;
    const root = document.documentElement;
    if (!root) return;
    if (!cur || cur.enabled === false) {
      root.removeAttribute('data-gn-preset');
      root.removeAttribute('data-gn-scheme');
      root.style.removeProperty('--gn-hive-accent');
      root.style.removeProperty('--gn-hive-accent-2');
      for (const fp of ['--gn-font-scale', '--gn-font-size', '--gn-avatar-size', '--text-2xs', '--text-xs', '--text-sm', '--text-base']) {
        root.style.removeProperty(fp);
      }
      return;
    }

    const pack = cur.activeThemePack && typeof cur.activeThemePack === 'object' ? cur.activeThemePack : null;
    const preset = cur.preset || 'auto';
    const hostDark = resolveHostNativeDark(root, lastReportedHostScheme);

    let scheme = hostDark ? 'dark' : 'light';
    if (pack && (pack.scheme === 'light' || pack.scheme === 'dark')) {
      scheme = pack.scheme;
    } else if (preset === 'nebula-day' || preset === 'cream-paper') {
      scheme = 'light';
    } else if (preset === 'starry-nest' || preset === 'carbon-obsidian') {
      scheme = 'dark';
    }

    const effPreset = preset === 'auto' ? (scheme === 'dark' ? 'starry-nest' : 'nebula-day') : preset;
    setAttrIfChanged(root, 'data-gn-scheme', scheme);
    setAttrIfChanged(root, 'data-gn-preset', effPreset);

    const acc = pack?.accent || {};
    root.style.setProperty('--gn-hive-accent', acc.primary || '#7c6cf6');
    root.style.setProperty('--gn-hive-accent-2', acc.accent2 || '#ec4899');

    const sidecarFontSize = Math.max(11, Math.min(22, Math.round(Number(cur?.typography?.sidecarFontSize) || 14)));
    const fontScale = Number((sidecarFontSize / 13).toFixed(3));
    const avatarSize = Math.max(44, Math.min(112, Math.round(Number(cur?.dock?.sidecarAvatarSize) || 64)));
    root.style.setProperty('--gn-avatar-size', `${avatarSize}px`);
    root.style.setProperty('--gn-font-scale', String(fontScale));
    root.style.setProperty('--gn-font-size', `${sidecarFontSize}px`);
    root.style.setProperty('--text-2xs', `${(11 * fontScale).toFixed(1)}px`);
    root.style.setProperty('--text-xs', `${(12 * fontScale).toFixed(1)}px`);
    root.style.setProperty('--text-sm', `${(13 * fontScale).toFixed(1)}px`);
    root.style.setProperty('--text-base', `${(14 * fontScale).toFixed(1)}px`);
    const fontValEl = document.querySelector('#gemineko-toolbar .gn-font-val');
    if (fontValEl) fontValEl.textContent = `${sidecarFontSize}px`;
    const fontGroupEl = document.querySelector('#gemineko-toolbar .gn-font-step-group');
    if (fontGroupEl) fontGroupEl.setAttribute('title', `当前侧栏字号 ${sidecarFontSize}px`);
  }

  async function openExternalSafe(url) {
    const target = String(url || lastGithubPulse?.repoUrl || 'https://github.com/AEmbers/gemineko-hive');
    if (window.__GEMINEKO_SIDECAR_MODE__) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (window.__SIDECAR_TOKEN__) headers['x-sidecar-token'] = window.__SIDECAR_TOKEN__;
        const r = await originalFetch('/api/open-external', {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: target }),
        });
        if (r.ok) return true;
      } catch {
        /* fallback */
      }
    }
    try { window.open(target, '_blank', 'noopener,noreferrer'); } catch {}
    return false;
  }

  function ingestMembersFromSnap(snap) {
    if (!snap || !snap.members) return;
    if (Array.isArray(snap.members)) {
      for (const m of snap.members) {
        if (!m || !m.name) continue;
        memberInfoMap.set(m.name, {
          model: String(m.model || ''),
          role: String(m.role || ''),
          status: String(m.status || ''),
          geminekoRole: String(m.geminekoRole || ''),
          action: String(m.action || ''),
          actionLabel: String(m.actionLabel || ''),
          phase: String(m.phase || ''),
          lastTool: String(m.lastTool || ''),
        });
      }
    } else if (typeof snap.members === 'object') {
      for (const [k, m] of Object.entries(snap.members)) {
        if (!m) continue;
        memberInfoMap.set(k, {
          model: String(m.model || ''),
          role: String(m.role || ''),
          status: String(m.status || ''),
          geminekoRole: String(m.geminekoRole || ''),
          action: String(m.action || ''),
          actionLabel: String(m.actionLabel || ''),
          phase: String(m.phase || ''),
          lastTool: String(m.lastTool || ''),
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

  function classifyModelKind(modelStr, lowName) {
    const s = `${modelStr} ${lowName}`.toLowerCase();
    if (/claude|sonnet|opus|haiku/.test(s)) return 'claude';
    if (/gpt|codex|\bsol\b|\bastra\b|\bo1\b|\bo3\b|\bo4\b/.test(s)) return 'gpt';
    if (/carbon|ultra|argon/.test(s)) return 'carbon';
    if (/hydrogen|flash|lite/.test(s)) return 'hydrogen';
    return 'neon';
  }

  function normalizeSpriteAction(explicitAction, explicitState, info) {
    const raw = String(explicitAction || info?.action || '').toLowerCase();
    if (raw === 'thinking' || raw === 'reading' || raw === 'editing' || raw === 'running' || raw === 'asking' || raw === 'idle') {
      return raw;
    }
    const st = String(explicitState || info?.status || 'working').toLowerCase();
    if (st === 'parked' || st === 'landed' || st === 'done' || st === 'idle' || st === 'waiting' || st === 'retired') {
      return 'idle';
    }
    return 'thinking';
  }

  /**
   * 从关系图 SVG `<g class="node">` 的 `<title>` 解析完整无截断成员 ID，并自动补全缺失的元信息缓存。
   * 格式如：`audit-acct · worker · gemini-4-hydrogen-high · retired · ...`
   */
  function extractFullNodeIdFromGroup(g) {
    if (!g) return '';
    if (g.dataset && g.dataset.gnNodeId) return g.dataset.gnNodeId;
    const titleText = g.querySelector('title')?.textContent || '';
    const firstLine = titleText.split(/\r?\n/)[0].trim();
    if (firstLine) {
      let fullId = '';
      const dotIdx = firstLine.indexOf(' · ');
      const parenIdx = firstLine.indexOf(' (');
      if (dotIdx > 0) fullId = firstLine.slice(0, dotIdx).trim();
      else if (parenIdx > 0) fullId = firstLine.slice(0, parenIdx).trim();
      else fullId = firstLine;

      fullId = fullId.replace(/^@/, '').trim();
      if (fullId) {
        if (g.dataset) g.dataset.gnNodeId = fullId;
        if (!memberInfoMap.has(fullId) && dotIdx > 0) {
          const parts = firstLine.split(' · ').map((s) => s.trim());
          const role = parts[1] || (fullId === 'coordinator' ? 'coordinator' : 'worker');
          const model = parts[2] || '';
          const status = parts[3] || '';
          memberInfoMap.set(fullId, {
            model,
            role,
            status,
            geminekoRole: classifyModelKind(model, fullId),
            action: '',
            actionLabel: '',
            phase: role === 'coordinator' ? 'planner' : 'executor',
            lastTool: '',
          });
        }
        return fullId;
      }
    }
    const textEl = g.querySelector('text.node-label, text');
    return (textEl?.dataset?.gnRawLabel || textEl?.textContent || '').replace(/^@/, '').trim();
  }

  function resolveMemberCharacter(rawName, explicitState) {
    const name = normalizeAgentName(rawName);
    const info = memberInfoMap.get(name);
    const state = explicitState || info?.status || 'working';
    const isCoordinator = name === 'coordinator' || info?.role === 'coordinator';
    const asleep = state === 'parked' || state === 'landed' || state === 'done' || state === 'idle' || state === 'waiting' || state === 'retired';

    let spriteRole = info?.geminekoRole || classifyModelKind(info?.model || '', name);
    if (prefs.roleMode === 'all-hachimi') {
      const hachimiCats = ['neon', 'hydrogen', 'carbon'];
      spriteRole = isCoordinator ? 'neon' : hachimiCats[hashMember(name) % hachimiCats.length];
    }

    const action = normalizeSpriteAction(info?.action, state, info);
    const pixelKind = isCoordinator && prefs.artStyle === 'pixel' ? 'queen' : spriteRole;
    const ringColor = isCoordinator ? '#F59E0B' : RING_PALETTE[hashMember(name) % RING_PALETTE.length];

    return {
      name,
      isCoordinator,
      kind: spriteRole,
      pixelKind,
      action,
      displayAction: info?.action || action,
      actionLabel: info?.actionLabel || ACTION_LABELS[action] || '思考中',
      state,
      asleep: action === 'idle' || asleep,
      ringColor,
      model: info?.model || '',
    };
  }

  function getSpriteBaseUrl() {
    if (typeof window.__GEMINEKO_SPRITE_BASE__ === 'string' && window.__GEMINEKO_SPRITE_BASE__) {
      return window.__GEMINEKO_SPRITE_BASE__.replace(/\/+$/, '');
    }
    return '/gemineko-sprites';
  }

  function getChibiSpriteUrl(role, action) {
    const r = ['neon', 'hydrogen', 'carbon', 'claude', 'gpt'].includes(role) ? role : 'neon';
    const a = ['thinking', 'reading', 'editing', 'running', 'asking', 'idle'].includes(action) ? action : 'thinking';
    return `${getSpriteBaseUrl()}/${r}-${a}.png?q=${getActiveSpriteQuality()}&v=0.8.0`;
  }

  function resolveLiveSpriteUrl(act) {
    const r = ['neon', 'hydrogen', 'carbon', 'claude', 'gpt'].includes(act?.role) ? act.role : 'neon';
    const a = ['thinking', 'reading', 'editing', 'running', 'asking', 'idle'].includes(act?.action) ? act.action : 'thinking';
    const rawFile = String(act?.spriteFile || '').trim();
    const validFile = /^(neon|hydrogen|carbon|claude|gpt)-(thinking|reading|editing|running|asking|idle)\.png$/i.test(rawFile)
      ? rawFile.toLowerCase()
      : `${r}-${a}.png`;
    return `${getSpriteBaseUrl()}/${validFile}?q=${getActiveSpriteQuality()}&v=0.8.0`;
  }

  function attachSpriteFallback(imgEl, role) {
    if (!imgEl || imgEl.dataset.gnErrBound === '1') return;
    imgEl.dataset.gnErrBound = '1';
    imgEl.addEventListener('error', () => {
      if (imgEl.dataset.gnFallback === '1') return;
      imgEl.dataset.gnFallback = '1';
      const r = ['neon', 'hydrogen', 'carbon', 'claude', 'gpt'].includes(role) ? role : 'neon';
      imgEl.src = `${getSpriteBaseUrl()}/${r}-thinking.png?q=${getActiveSpriteQuality()}&v=0.8.0`;
    });
  }

  // 离屏透明底圆环精灵缓存（仅绘轻盈彩色光环，绝不填充白色底）
  const chibiAvatarCache = new Map();
  const chibiRawImgCache = new Map();

  function warmChibiImg(srcUrl, onReady) {
    if (chibiRawImgCache.has(srcUrl)) {
      const entry = chibiRawImgCache.get(srcUrl);
      if (entry.loaded && onReady) onReady(entry.img);
      return entry.img;
    }
    const img = new Image();
    const rec = { img, loaded: false };
    chibiRawImgCache.set(srcUrl, rec);
    img.onload = () => {
      rec.loaded = true;
      chibiAvatarCache.clear();
      if (onReady) onReady(img);
    };
    img.src = srcUrl;
    return img;
  }

  for (const r of ['neon', 'hydrogen', 'carbon', 'claude', 'gpt']) {
    warmChibiImg(getChibiSpriteUrl(r, r === 'gpt' ? 'idle' : 'thinking'));
  }

  function getSpriteSrcForGifOrMsg(rawName, explicitState) {
    const ch = resolveMemberCharacter(rawName, explicitState);
    if (prefs.artStyle === 'pixel') {
      return getPixelSpriteDataUri({
        kind: ch.pixelKind,
        memberName: ch.name,
        roleMode: prefs.roleMode,
        action: ch.displayAction,
        state: ch.state,
        frame: 0,
      });
    }
    const rawUrl = getChibiSpriteUrl(ch.kind, ch.action);
    warmChibiImg(rawUrl);
    // 直接返回原生透明 4 帧 APNG，避免 canvas.toDataURL 压扁动效
    return rawUrl;
  }

  // Web Audio 轻量喵呜/叮咚/侧栏彩蛋合成音效
  let audioCtx = null;
  function isSidecarEggAllowed() {
    const c = lastSidecarThemeConfig;
    if (c && (c.enabled === false || c.focusMode === true)) return false;
    return true;
  }
  function isSidecarEggSoundOn() {
    if (!prefs.sound || !isSidecarEggAllowed()) return false;
    if (lastSidecarThemeConfig?.easterEggs?.soundEnabled === false) return false;
    return true;
  }
  function playSidecarEggVoice(fileName, fallbackVariant = 'crunch') {
    if (!isSidecarEggSoundOn()) return;
    try {
      const audio = new Audio(`/gemineko-audio/${encodeURIComponent(fileName)}?v=0.8.2`);
      audio.volume = 0.9;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => playMeow(fallbackVariant));
      }
    } catch {
      playMeow(fallbackVariant);
    }
  }
  function playMeow(variant = 'pat') {
    if (!prefs.sound) return;
    if ((variant === 'zoomies' || variant === 'crunch' || variant === 'alchemy') && !isSidecarEggSoundOn()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const playFreq = (type, f0, f1, dur, peak = 0.08, delay = 0) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const t0 = now + delay;
        osc.type = type;
        osc.frequency.setValueAtTime(f0, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      };
      if (variant === 'zoomies') {
        [0, 0.16, 0.34].forEach((d, i) => playFreq('sawtooth', 420 + i * 110, 1180, 0.14, 0.055, d));
      } else if (variant === 'crunch') {
        [0, 0.11, 0.22].forEach((d) => playFreq('square', 780, 260, 0.07, 0.06, d));
        playFreq('triangle', 880, 1174, 0.16, 0.06, 0.32);
      } else if (variant === 'alchemy') {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => playFreq('triangle', f, f * 1.03, 0.18, 0.06, i * 0.07));
      } else if (variant === 'poke') {
        playFreq('triangle', 520, 920, 0.08, 0.08, 0);
        playFreq('triangle', 920, 640, 0.14, 0.07, 0.08);
      } else {
        playFreq('sine', 680, 880, 0.08, 0.08, 0);
        playFreq('sine', 880, 740, 0.09, 0.07, 0.07);
      }
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
      '再戳一口 95 分严审圣女要打回重写了哼！',
      '别晃猫窝呀，小龙娘的算力要掉出来啦～',
    ],
    zh: [
      '触发猫窝振动！全体成员加速中',
      '协调者正在重新对齐全部任务！',
      '成员动作与立绘全检刷新完成',
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
    document.body.appendChild(el);
    const vw = window.innerWidth || 400;
    const vh = window.innerHeight || 600;
    const bw = Math.min(vw - 20, el.offsetWidth || 200);
    const bh = el.offsetHeight || 34;
    const half = Math.ceil(bw / 2);
    const minLeft = Math.min(vw - 10, half + 10);
    const maxLeft = Math.max(minLeft, vw - half - 10);
    const safeLeft = Math.max(minLeft, Math.min(maxLeft, x));
    const safeTop = Math.max(bh + 12, Math.min(vh - 16, y));
    el.style.left = `${safeLeft}px`;
    el.style.top = `${safeTop}px`;
    setTimeout(() => el.remove(), 2350);
  }

  function triggerPokeHive() {
    playMeow('poke');
    document.body.classList.remove('gn-poked');
    void document.body.offsetWidth;
    document.body.classList.add('gn-poked');
    setTimeout(() => document.body.classList.remove('gn-poked'), 1150);
    if (window.__GEMINEKO_SIDECAR_MODE__ && workshop?.triggerSidecarEgg) {
      workshop.triggerSidecarEgg('hive-poke-burst');
    }

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

  async function unlockSidecarEgg(eggId, label) {
    if (!isSidecarEggAllowed() || !window.__GEMINEKO_SIDECAR_MODE__) return;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (window.__SIDECAR_TOKEN__) headers['X-Sidecar-Token'] = window.__SIDECAR_TOKEN__;
      const resp = await originalFetch('/api/theme/egg/unlock', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: eggId }),
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data?.config) {
        syncSidecarHostTheme(data.config);
        workshop?.syncExternalConfig?.(data.config);
      }
      if (data?.newlyUnlocked) {
        const count = Array.isArray(data.unlocked) ? data.unlocked.length : 1;
        spawnBubbleAt(window.innerWidth / 2, 74, `🥚 解锁彩蛋（${count}/${data.total || 13}）：${label}`);
      }
      if (data?.completedAll && data?.newlyUnlocked) {
        setTimeout(() => {
          triggerSidecarSupremeShowcase();
          originalFetch('/api/theme/event', {
            method: 'POST',
            headers,
            body: JSON.stringify({ type: 'supreme-maodie-parade', source: 'sidecar' }),
          }).catch(() => {});
        }, 700);
      }
    } catch {
      /* ignore */
    }
  }

  function triggerSidecarZoomies() {
    if (!isSidecarEggAllowed()) return;
    const avatar = document.querySelector('.gn-live-avatar');
    const banner = avatar?.closest('.gn-live-banner');
    if (avatar && banner) {
      avatar.classList.remove('gn-egg-zoomies-run');
      void avatar.offsetWidth;
      avatar.classList.add('gn-egg-zoomies-run');
      const ghost = document.createElement('img');
      ghost.src = avatar.src;
      ghost.className = 'gn-zoomies-ghost';
      banner.appendChild(ghost);
      setTimeout(() => {
        avatar.classList.remove('gn-egg-zoomies-run');
        if (ghost.isConnected) ghost.remove();
      }, 2650);
      const r = avatar.getBoundingClientRect();
      spawnBubbleAt(r.left + 80, r.top, '喵嗷——！基米窝凌晨三点跑酷模式启动！！💨');
    } else {
      spawnBubbleAt(window.innerWidth / 2, 92, '喵嗷——！基米窝凌晨三点跑酷模式启动！！💨');
    }
    playMeow('zoomies');
    void unlockSidecarEgg('sidecar-zoomies', '凌晨三点·哈基米跑酷');
  }

  function triggerSidecarDriedFish(targetEl) {
    if (!isSidecarEggAllowed()) return;
    const picked = targetEl || document.querySelector('.gn-sprite-host, .gn-msg-avatar');
    const r = picked && picked.getBoundingClientRect ? picked.getBoundingClientRect() : { left: window.innerWidth / 2, top: 180, width: 48, height: 48 };
    const cx = r.left + r.width / 2;
    const cy = r.top;

    const fish = document.createElement('div');
    fish.className = 'gn-egg-fish-drop';
    fish.textContent = '🐟';
    fish.style.left = `${Math.round(cx - 12)}px`;
    fish.style.top = `${Math.round(cy - 8)}px`;
    document.body.appendChild(fish);
    setTimeout(() => { if (fish.isConnected) fish.remove(); }, 1400);

    spawnBubbleAt(cx, cy, '咔嚓！美味烤小鱼干收到喵 ✨');

    const others = [...document.querySelectorAll('.gn-sprite-host, .gn-msg-avatar')].filter((n) => n !== picked);
    const onlookers = others.slice(0, 3);
    const lines = ['盯——分我一口喵！🐟', '居然是绿豆味小鱼干？', '哈基米闻香赶来围观~'];
    onlookers.forEach((node, idx) => {
      const nr = node.getBoundingClientRect();
      if (nr.width > 0 && nr.top >= 0 && nr.bottom <= (window.innerHeight || 900)) {
        setTimeout(() => spawnBubbleAt(nr.left + nr.width / 2, nr.top, lines[idx % lines.length]), 160 + idx * 140);
      }
    });

    playSidecarEggVoice('egg-dried-fish.mp3', 'crunch');
    void unlockSidecarEgg('sidecar-dried-fish', '投喂小鱼干·全窝围观');
  }

  function triggerSidecarSupremeShowcase() {
    document.querySelectorAll('.gn-egg-supreme-banner').forEach((n) => n.remove());
    const el = document.createElement('div');
    el.className = 'gn-egg-supreme-banner';
    el.innerHTML = `<img src="${getSpriteBaseUrl()}/egg-maodie-boss.png?v=0.8.1" alt="至尊圆头耄耋" /><div>👑 13/13 全彩蛋收集完成 · 至尊圆头耄耋降临基米窝！</div>`;
    document.body.appendChild(el);
    setTimeout(() => { if (el.isConnected) el.remove(); }, 4600);
    playMeow('alchemy');
  }

  const LOCALE_TEXT = {
    'neko-zh': {
      overview: '猫窝总览',
      feed: '喵呜消息板',
      members: '基米成员',
      graph: '关系猫窝',
      raw: '原始数据',
      live: '实时窝态',
      emptyTitle: '这个对话里还没有搭起基米窝喵',
      emptyHint: '正在蹲守基米窝启动喵…',
      exportGif: '导出猫窝 GIF',
      poke: '捅一捅',
      settingsBtn: '模式设置',
      roleAi: 'AI娘宇宙',
      roleHachimi: '全员哈基米',
      artChibi: '25态Q版',
      artPixel: '32px像素',
      themeHive: '星空猫窝',
      themeMin: '仅换头像',
      nickOn: '哈基米花名',
      nickOff: '原名 @ID',
      locLabel: '萌系中文',
      demoBtn: '🐾 一键体验模拟基米窝（5角色25态Demo）',
      exitDemo: '退出 Demo',
      // Graph & Replay
      graphHive: '猫窝图谱',
      graphMentions: '传话连线',
      hideInactive: '隐藏摸鱼猫',
      expandAll: '展开 @all',
      paceEven: '匀速回放',
      paceReal: '真实间隔',
      replayLive: '实时追更',
      legendMention: '点名传话（线宽=次数）',
      legendViaAll: '经 @all 广播',
      legendNoMention: '仅发帖未点名',
      legendAllNote: '@all 广播数，开启“展开 @all”可连线',
      hiveLegendDone: '已完成猫窝',
      hiveLegendSent: '刚刚传话',
      hiveLegendWait: '等待回复',
      // Board & Overview & Modal
      searchPlaceholder: '搜索喵讯',
      fromAnyone: '所有发帖喵',
      toAnyone: '所有被点名喵',
      allChannels: '全部频道',
      follow: '跟随最新',
      jumpLatest: '跳到最新',
      openCoord: '打开协调喵对话',
      copyBtn: '复制',
      gifHint: '右键图片即可保存，或在新标签页打开。',
      gifOpenTab: '在新标签页打开',
      postWord: '条喵讯',
      overWord: '跨度',
    },
    zh: {
      overview: '概览',
      feed: '消息板',
      members: '成员',
      graph: '关系图',
      raw: '原始数据',
      live: '实时',
      emptyTitle: '当前对话暂无 Swarm 协作',
      emptyHint: '正在监听当前对话的 Swarm 协作…',
      exportGif: '导出 GIF',
      poke: '互动晃动',
      settingsBtn: '模式设置',
      roleAi: 'AI娘模式',
      roleHachimi: '全员哈基米',
      artChibi: '25态立绘',
      artPixel: '像素风',
      themeHive: '星空猫窝',
      themeMin: '仅换头像',
      nickOn: '玩梗花名',
      nickOff: '原始ID',
      locLabel: '正常中文',
      demoBtn: '🐾 一键体验模拟基米窝（Demo）',
      exitDemo: '退出 Demo',
      graphHive: '分区蜂窝',
      graphMentions: '提及关系',
      hideInactive: '隐藏已停止',
      expandAll: '展开 @all',
      paceEven: '均匀节奏',
      paceReal: '真实时间差',
      replayLive: '实时',
      legendMention: '@提及，线宽 = 次数',
      legendViaAll: '经由 @all 触发',
      legendNoMention: '未点名他人',
      legendAllNote: '@all 广播帖数，勾选展开可连线',
      hiveLegendDone: '已完成任务',
      hiveLegendSent: '刚发送消息',
      hiveLegendWait: '等待响应',
      searchPlaceholder: '搜索消息',
      fromAnyone: '来自任意成员',
      toAnyone: '提及任意成员',
      allChannels: '全部频道',
      follow: '自动跟随',
      jumpLatest: '跳至最新',
      openCoord: '打开协调者对话',
      copyBtn: '复制',
      gifHint: '右键即可保存动图，或在新标签页打开。',
      gifOpenTab: '新标签页打开',
      postWord: '条消息',
      overWord: '跨度',
    },
    en: {
      overview: 'Overview',
      feed: 'Board',
      members: 'Members',
      graph: 'Graph',
      raw: 'Raw',
      live: 'Live',
      emptyTitle: 'No swarm in this conversation',
      emptyHint: 'Watching for a swarm',
      exportGif: 'Export GIF',
      poke: 'Poke Hive',
      settingsBtn: 'Settings',
      roleAi: 'AI Girls',
      roleHachimi: 'All Hachimi',
      artChibi: '25-Pose Chibi',
      artPixel: '32px Pixel',
      themeHive: 'Starry Catnest',
      themeMin: 'Avatar Only',
      nickOn: 'Meme Names',
      nickOff: 'Raw @ID',
      locLabel: 'EN',
      demoBtn: '🐾 Try Demo Gemineko Hive',
      exitDemo: 'Exit Demo',
      graphHive: 'Hive',
      graphMentions: 'Mentions',
      hideInactive: 'Hide inactive',
      expandAll: 'Expand @all',
      paceEven: 'Even pacing',
      paceReal: 'Real-time gaps',
      replayLive: 'Live',
      legendMention: '@mention, width = count',
      legendViaAll: 'via @all',
      legendNoMention: 'posted with no mention',
      legendAllNote: '@all posts, drawn by Expand @all',
      hiveLegendDone: 'Tasks done',
      hiveLegendSent: 'Message just sent',
      hiveLegendWait: 'Waiting on',
      searchPlaceholder: 'Search',
      fromAnyone: 'From anyone',
      toAnyone: 'To anyone',
      allChannels: 'All channels',
      follow: 'Follow',
      jumpLatest: 'Latest',
      openCoord: 'Open coordinator chat',
      copyBtn: 'Copy',
      gifHint: 'Right-click image to save, or open in a new tab.',
      gifOpenTab: 'Open in new tab',
      postWord: 'posts',
      overWord: 'over',
    },
  };

  function setTextIfChanged(el, nextText) {
    if (!el || nextText == null) return;
    if (el.textContent !== nextText) {
      el.textContent = nextText;
    }
  }

  function setAttrIfChanged(el, attr, val) {
    if (!el) return;
    if (el.getAttribute(attr) !== val) {
      el.setAttribute(attr, val);
    }
  }

  /**
   * 仅替换元素里的最后一个（或首个）非空纯文本节点，不动里面的 svg / span。
   */
  function setNodeTextEdge(el, nextText, fromEnd = true) {
    if (!el || nextText == null) return;
    const textNodes = [...el.childNodes].filter((n) => n.nodeType === 3);
    if (textNodes.length > 0) {
      const target = fromEnd ? textNodes[textNodes.length - 1] : textNodes[0];
      if (target.nodeValue !== nextText) {
        target.nodeValue = nextText;
      }
      return;
    }
    if (!el.children.length && el.textContent !== nextText) {
      el.textContent = nextText;
    }
  }

  function setButtonLeadText(el, nextText) {
    setNodeTextEdge(el, nextText, false);
  }

  function formatDurationCn(dur) {
    return String(dur || '')
      .replace(/(\d+)d\b/g, '$1天')
      .replace(/(\d+)h\b/g, '$1小时')
      .replace(/(\d+)m\b/g, '$1分')
      .replace(/(\d+)s\b/g, '$1秒')
      .replace(/\s+/g, '');
  }

  function applyThemeAndLocale() {
    if (lastSidecarThemeConfig) {
      syncSidecarHostTheme();
    }
    const nextMinimal = prefs.themeMode === 'avatar-only' ? '1' : '0';
    setAttrIfChanged(document.body, 'data-gemineko-minimal', nextMinimal);

    const L = LOCALE_TEXT[prefs.locale] || LOCALE_TEXT['neko-zh'];
    setButtonLeadText(document.getElementById('tabbtn-overview'), L.overview);
    setButtonLeadText(document.getElementById('tabbtn-feed'), L.feed);
    setButtonLeadText(document.getElementById('tabbtn-members'), L.members);
    setButtonLeadText(document.getElementById('tabbtn-graph'), L.graph);
    setButtonLeadText(document.getElementById('tabbtn-raw'), L.raw);
    setTextIfChanged(document.getElementById('live-label'), L.live);
    setTextIfChanged(document.getElementById('empty-title'), L.emptyTitle);
    setNodeTextEdge(document.querySelector('#empty .empty-hint'), L.emptyHint, true);
    const loadingEl = document.getElementById('loading');
    if (loadingEl && /Looking for/i.test(loadingEl.textContent || '')) {
      loadingEl.textContent = prefs.locale === 'en' ? 'Scanning for conversation swarm…' : '正在扫描当前对话的基米窝…';
    }

    // Graph 控件 & 选项汉化
    setTextIfChanged(document.getElementById('gview-hive'), L.graphHive);
    setTextIfChanged(document.getElementById('gview-mentions'), L.graphMentions);
    setTextIfChanged(document.getElementById('g-hide-inactive')?.closest('label')?.querySelector('span:last-child'), L.hideInactive);
    setTextIfChanged(document.getElementById('g-all')?.closest('label')?.querySelector('span:last-child'), L.expandAll);
    setNodeTextEdge(document.getElementById('replay-live'), L.replayLive, true);
    setTextIfChanged(document.getElementById('graph-export-gif-label'), L.exportGif);

    const timingSel = document.getElementById('replay-timing');
    if (timingSel) {
      const optEven = timingSel.querySelector('option[value="even"]');
      const optReal = timingSel.querySelector('option[value="real"]');
      setTextIfChanged(optEven, L.paceEven);
      setTextIfChanged(optReal, L.paceReal);
    }

    // Graph 回放数量与跨度标签（保留原数据做动态无损重排）
    const replayLabel = document.getElementById('replay-label');
    if (replayLabel) {
      const curText = (replayLabel.textContent || '').trim();
      const rawSaved = replayLabel.dataset.gnRawReplay || '';
      const looksEnglish = /^\d+\s+posts?(?:\s+over\s+.+)?$|^\d+\s+of\s+\d+/.test(curText);
      if (looksEnglish) {
        replayLabel.dataset.gnRawReplay = curText;
      }
      const base = looksEnglish ? curText : rawSaved;
      if (base) {
        if (prefs.locale === 'en') {
          if (curText !== base) replayLabel.textContent = base;
        } else {
          const mAll = base.match(/^(\d+)\s+posts?(?:\s+over\s+(.+))?$/i);
          const mStep = base.match(/^(\d+)\s+of\s+(\d+)(.*)$/i);
          if (mAll) {
            const durText = mAll[2] ? ` · ${L.overWord} ${formatDurationCn(mAll[2])}` : '';
            const nextTxt = `共 ${mAll[1]} ${L.postWord}${durText}`;
            setTextIfChanged(replayLabel, nextTxt);
          } else if (mStep) {
            const rest = mStep[3] ? mStep[3].replace(/\bat\b/i, '·').trim() : '';
            const nextTxt = `第 ${mStep[1]} / ${mStep[2]} 条${rest ? ' ' + rest : ''}`;
            setTextIfChanged(replayLabel, nextTxt);
          }
        }
      }
    }

    // Graph 底部 4 条图例汉化
    const legendItems = document.querySelectorAll('.graph-legend .legend-item');
    const legendTexts = [L.legendMention, L.legendViaAll, L.legendNoMention, L.legendAllNote];
    legendItems.forEach((item, idx) => {
      if (legendTexts[idx]) {
        setNodeTextEdge(item, legendTexts[idx], true);
      }
    });

    // Board 搜索与筛选栏汉化
    const fSearch = document.getElementById('f-search');
    if (fSearch) setAttrIfChanged(fSearch, 'placeholder', L.searchPlaceholder);
    setTextIfChanged(document.querySelector('#f-agent option[value=""]'), L.fromAnyone);
    setTextIfChanged(document.querySelector('#f-mention option[value=""]'), L.toAnyone);
    setTextIfChanged(document.querySelector('#f-channel option[value=""]'), L.allChannels);
    setTextIfChanged(document.getElementById('f-autoscroll')?.closest('label')?.querySelector('span:last-child'), L.follow);
    setNodeTextEdge(document.getElementById('jump-latest'), L.jumpLatest, true);

    // Overview / Raw / GIF Modal 汉化
    setTextIfChanged(document.getElementById('ov-open-coord'), L.openCoord);
    setTextIfChanged(document.getElementById('raw-copy-label'), L.copyBtn);
    setTextIfChanged(document.querySelector('.gif-modal-hint'), L.gifHint);
    setTextIfChanged(document.getElementById('gif-modal-open'), L.gifOpenTab);

    // 猫窝图谱底部图例三语汉化（保留 <i> 色标）
    for (const keyBar of document.querySelectorAll('.hv-key')) {
      setNodeTextEdge(keyBar.querySelector('i.hv-kd')?.parentElement, L.hiveLegendDone, true);
      setNodeTextEdge(keyBar.querySelector('i.hv-km')?.parentElement, L.hiveLegendSent, true);
      setNodeTextEdge(keyBar.querySelector('i.hv-kw')?.parentElement, L.hiveLegendWait, true);
    }

    transformHiveCellsToCatNests();
  }

  /**
   * 计算紧凑版 SVG 文本视觉宽度（字号 9.8px 下，中文约 9.8px/字，ASCII 约 6px/字）。
   */
  function estimateSvgTextWidth(str) {
    let w = 0;
    for (const ch of String(str || '')) {
      w += ch.charCodeAt(0) > 127 ? 9.8 : 6.0;
    }
    return w;
  }

  /**
   * 更新成员可见名称（含成员卡/消息头 & SVG 关系图 100% 完整花名展示 + 自适应扩宽胶囊），并可一键无损还原原 ID。
   */
  function applyMemeNicknamesToDom() {
    if (typeof resolveMemeNickname !== 'function') return;
    const used = new Set();
    const resolveFor = (rawId) => {
      const clean = String(rawId || '').replace(/^@/, '').trim();
      if (!clean) return null;
      const info = memberInfoMap.get(clean);
      const ch = resolveMemberCharacter(clean);
      return resolveMemeNickname(
        {
          id: clean,
          agent: clean,
          model: info?.model || '',
          role: info?.role || '',
          geminekoRole: ch.kind,
          isCoordinator: ch.isCoordinator,
          actionLabel: ch.actionLabel,
        },
        { enabled: prefs.memeNicknames, usedNames: used },
      );
    };

    // 1. 常规文本标签（消息头 / 成员列表 / 小蜂牌名称）
    const plainNameEls = document.querySelectorAll('.o2-mname, .msg-who, .bee-name');
    for (const el of plainNameEls) {
      if (el.closest('#gemineko-toolbar')) continue;
      if (!el.dataset.gnRawLabel) {
        const txt = (el.textContent || '').trim();
        if (!txt || txt.length > 42) continue;
        el.dataset.gnRawLabel = txt;
      }
      const raw = el.dataset.gnRawLabel;
      const clean = raw.replace(/^@/, '');
      if (!memberInfoMap.has(clean) && !memberInfoMap.has(raw) && clean !== 'coordinator') continue;
      const nick = resolveFor(clean);
      if (!nick) continue;
      const targetText = prefs.memeNicknames ? nick.displayName : raw;
      if (el.textContent !== targetText) el.textContent = targetText;
      if (el.getAttribute('title') !== nick.tooltip) el.setAttribute('title', nick.tooltip);
    }

    // 2. SVG 关系图节点：通过 <g.node > title> 解析完整 ID，绕开截断的 audit-a...，并对称调整胶囊宽度完整展示花名
    const graphNodes = document.querySelectorAll('svg.graph g.node');
    for (const g of graphNodes) {
      const fullId = extractFullNodeIdFromGroup(g);
      const textEl = g.querySelector('text.node-label') || g.querySelector('text');
      const boxRect = g.querySelector('rect.node-box');
      if (!fullId || !textEl) continue;

      if (!textEl.dataset.gnRawLabel) {
        textEl.dataset.gnRawLabel = (textEl.textContent || '').trim();
      }
      if (boxRect && !boxRect.dataset.gnOrigBox) {
        const ox = Number(boxRect.getAttribute('x') || 0);
        const ow = Number(boxRect.getAttribute('width') || 100);
        const olx = Number(textEl.getAttribute('x') || 0);
        const imgEl = g.querySelector('image.node-bee');
        const dotEl = g.querySelector('circle.status-dot');
        const ringEl = g.querySelector('rect.ring');
        boxRect.dataset.gnOrigBox = JSON.stringify({
          x: ox,
          w: ow,
          lx: olx,
          bx: imgEl ? Number(imgEl.getAttribute('x') || 0) : null,
          dx: dotEl ? Number(dotEl.getAttribute('cx') || 0) : null,
          rx: ringEl ? Number(ringEl.getAttribute('x') || 0) : null,
          rw: ringEl ? Number(ringEl.getAttribute('width') || ow + 8) : null,
        });
      }

      const nick = resolveFor(fullId);
      if (!nick) continue;
      const targetLabel = prefs.memeNicknames ? nick.displayName : textEl.dataset.gnRawLabel;
      if (textEl.textContent !== targetLabel) {
        textEl.textContent = targetLabel;
      }

      if (boxRect && boxRect.dataset.gnOrigBox) {
        try {
          const orig = JSON.parse(boxRect.dataset.gnOrigBox);
          const centerX = orig.x + orig.w / 2;
          const hasImg = Boolean(g.querySelector('image.node-bee'));
          const leftPad = hasImg ? 32 : 16;
          const neededW = prefs.memeNicknames
            ? Math.max(orig.w, Math.min(106, Math.ceil(leftPad + estimateSvgTextWidth(targetLabel) + 8)))
            : orig.w;
          const delta = neededW - orig.w;
          const newX = orig.x - delta / 2;

          if (prefs.memeNicknames && targetLabel.length >= 5) {
            textEl.style.fontSize = '9.8px';
          } else {
            textEl.style.fontSize = '';
          }

          boxRect.setAttribute('x', newX.toFixed(1));
          boxRect.setAttribute('width', neededW.toFixed(1));

          const ringEl = g.querySelector('rect.ring');
          if (ringEl && orig.rx !== null) {
            ringEl.setAttribute('x', (orig.rx - delta / 2).toFixed(1));
            ringEl.setAttribute('width', (orig.rw + delta).toFixed(1));
          }
          const imgEl = g.querySelector('image.node-bee');
          if (imgEl && orig.bx !== null) {
            imgEl.setAttribute('x', (orig.bx - delta / 2).toFixed(1));
          }
          const dotEl = g.querySelector('circle.status-dot');
          if (dotEl && orig.dx !== null) {
            dotEl.setAttribute('cx', (orig.dx - delta / 2).toFixed(1));
          }
          textEl.setAttribute('x', (orig.lx - delta / 2).toFixed(1));
        } catch {
          /* ignore */
        }
      }
    }
  }

  function actionAnimClass(action) {
    if (action === 'reading') return 'gn-act-reading';
    if (action === 'editing') return 'gn-act-editing';
    if (action === 'running') return 'gn-act-running';
    return '';
  }

  /**
   * 将原生「猫窝图谱」svg.hv-svg 内的平顶六边形单元格无损变形为可爱猫耳软垫猫窝；
   * 当切换为「仅换头像（avatar-only）」时自动还原为原始六边形路径。
   */
  function transformHiveCellsToCatNests() {
    const svgs = document.querySelectorAll('svg.hv-svg');
    if (!svgs.length) return;
    const minimal = prefs.themeMode === 'avatar-only';
    const SVG_NS = 'http://www.w3.org/2000/svg';

    for (const svg of svgs) {
      const paths = svg.querySelectorAll('path.hv-cell, path.hv-prog, path.hv-selring');
      if (minimal) {
        for (const p of paths) {
          if (p.dataset.gnOrigD) {
            setAttrIfChanged(p, 'd', p.dataset.gnOrigD);
          }
          p.classList.remove('gn-nest-coord', 'gn-nest-coord-prog');
          delete p.dataset.gnCatnestApplied;
        }
        const existingLayer = svg.querySelector('g.gn-catnest-layer');
        if (existingLayer) existingLayer.remove();
        delete svg.dataset.gnDecoSig;
        continue;
      }

      const decoChunks = [];
      const sigParts = [];

      for (const p of paths) {
        let geom = null;
        if (p.dataset.gnGeom) {
          const [gx, gy, gr] = p.dataset.gnGeom.split(',').map(Number);
          if (Number.isFinite(gx) && Number.isFinite(gy) && Number.isFinite(gr)) {
            geom = { cx: gx, cy: gy, r: gr };
          }
        }
        if (!geom) {
          const rawD = p.dataset.gnOrigD || p.getAttribute('d') || '';
          const parsed = parseHexPathGeometry(rawD);
          if (parsed) {
            p.dataset.gnOrigD = rawD;
            p.dataset.gnGeom = `${parsed.cx.toFixed(1)},${parsed.cy.toFixed(1)},${parsed.r.toFixed(1)}`;
            geom = parsed;
          }
        }
        if (!geom) continue;

        const isSelRing = p.classList.contains('hv-selring');
        if (p.dataset.gnCatnestApplied !== '1') {
          const nextD = buildCatNestPath(geom.cx, geom.cy, isSelRing ? geom.r + 1 : geom.r);
          setAttrIfChanged(p, 'd', nextD);
          p.dataset.gnCatnestApplied = '1';
        }

        if (p.classList.contains('hv-cell')) {
          const isCoord = p.getAttribute('data-c') === '-1';
          p.classList.toggle('gn-nest-coord', isCoord);
          const nextEl = p.nextElementSibling;
          if (nextEl && nextEl.classList.contains('hv-prog')) {
            nextEl.classList.toggle('gn-nest-coord-prog', isCoord);
          }
          sigParts.push(`${p.dataset.gnGeom}:${isCoord ? 1 : 0}`);
          const chunk = buildCatNestDecoSvg(geom.cx, geom.cy, geom.r, { isCoord });
          if (chunk) decoChunks.push(chunk);
        }
      }

      const decoSig = sigParts.join('|');
      let layer = svg.querySelector('g.gn-catnest-layer');
      if (!decoChunks.length) {
        if (layer) layer.remove();
        delete svg.dataset.gnDecoSig;
        continue;
      }

      if (!layer || svg.dataset.gnDecoSig !== decoSig) {
        if (!layer) {
          layer = document.createElementNS(SVG_NS, 'g');
          layer.setAttribute('class', 'gn-catnest-layer');
          layer.setAttribute('pointer-events', 'none');
        }
        layer.innerHTML = decoChunks.join('');
        svg.dataset.gnDecoSig = decoSig;
      }

      const anchor = svg.querySelector('.hv-ln, .hv-ah, .hv-bd, text.hv-t, text.hv-n');
      if (anchor) {
        if (layer.parentNode !== svg || layer.nextElementSibling !== anchor) {
          svg.insertBefore(layer, anchor);
        }
      } else if (layer.parentNode !== svg) {
        svg.appendChild(layer);
      }
    }
  }

  // 把页面上所有 .beebox 与关系图/消息头像同步为透明 25 态《基米窝》精灵
  function enhanceDomSprites() {
    const boxes = document.querySelectorAll('.beebox');
    for (const box of boxes) {
      const wrap = box.querySelector('.beewrap');
      const rawName = wrap?.dataset?.bee || 'worker';
      const state = box.dataset.state || wrap?.dataset?.state || 'working';
      const ch = resolveMemberCharacter(rawName, state);
      const renderKey = `${ch.kind}|${ch.action}|${ch.name}|${ch.asleep ? 1 : 0}|${prefs.artStyle}|${prefs.roleMode}`;

      if (wrap) wrap.style.display = 'none';
      const gsh = box.querySelector('.gsh');
      if (gsh) gsh.style.display = 'none';

      let host = box.querySelector('.gn-sprite-host');
      if (!host) {
        host = document.createElement('span');
        host.className = 'gn-sprite-host';
        host.addEventListener('click', (ev) => {
          ev.stopPropagation();
          playMeow('pat');
          const cur = resolveMemberCharacter(rawName, box.dataset.state || wrap?.dataset?.state);
          const r = host.getBoundingClientRect();
          const msg =
            cur.kind === 'claude'
              ? '本小姐可不是特意帮你写的 95 分严格审查！'
              : cur.kind === 'gpt'
                ? '烧Token大龙娘正在后台高速运算中，交给我吧！'
                : cur.action === 'idle'
                  ? '呼喵…刚刚干完活正打盹呢，再摸就醒啦～'
                  : `正在【${cur.actionLabel}】喵～干劲 +100%！`;
          spawnBubbleAt(r.left + r.width / 2, r.top, msg);
        });
        box.appendChild(host);
      }

      const nick =
        typeof resolveMemeNickname === 'function'
          ? resolveMemeNickname(
              {
                id: ch.name,
                agent: ch.name,
                model: ch.model,
                geminekoRole: ch.kind,
                isCoordinator: ch.isCoordinator,
                actionLabel: ch.actionLabel,
              },
              { enabled: prefs.memeNicknames },
            )
          : { displayName: `@${ch.name}`, tooltip: `@${ch.name}` };
      const nextTitle = `${nick.tooltip} · 点击摸摸头`;
      if (host.title !== nextTitle) host.title = nextTitle;

      if (host.dataset.gnKey !== renderKey) {
        host.dataset.gnKey = renderKey;
        let img = host.querySelector('img.gn-sprite-img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'gn-sprite-img';
          img.alt = ch.name;
          img.onerror = () => {
            img.onerror = null;
            img.src = getPixelSpriteDataUri({
              kind: ch.pixelKind,
              memberName: ch.name,
              roleMode: prefs.roleMode,
              action: ch.displayAction,
              state: ch.state,
              frame: 0,
            });
          };
          host.appendChild(img);
        }
        img.className = `gn-sprite-img ${prefs.artStyle === 'pixel' ? 'is-pixel ' : ''}${actionAnimClass(ch.action)}`.trim();
        img.style.setProperty('--gn-ring-color', ch.ringColor);

        if (prefs.artStyle === 'pixel') {
          img.src = getPixelSpriteDataUri({
            kind: ch.pixelKind,
            memberName: ch.name,
            roleMode: prefs.roleMode,
            action: ch.displayAction,
            state: ch.state,
            frame: 0,
          });
        } else {
          img.src = getChibiSpriteUrl(ch.kind, ch.action);
        }

        let crown = host.querySelector('.gn-crown-dot');
        if (ch.isCoordinator) {
          if (!crown) {
            crown = document.createElement('span');
            crown.className = 'gn-crown-dot';
            crown.textContent = '👑';
            host.appendChild(crown);
          }
        } else if (crown) {
          crown.remove();
        }

        let actDot = host.querySelector('.gn-action-dot');
        if (!ch.asleep) {
          if (!actDot) {
            actDot = document.createElement('span');
            actDot.className = 'gn-action-dot';
            host.appendChild(actDot);
          }
          actDot.textContent = ACTION_EMOJI[ch.displayAction] || '✨';
          actDot.title = ch.actionLabel;
        } else if (actDot) {
          actDot.remove();
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

    // 同步刷新关系图中的 <image class="node-bee">（使用 <title> 解析出的完整成员 ID！）
    const graphImgs = document.querySelectorAll('svg.graph image.node-bee');
    for (const nodeImg of graphImgs) {
      const g = nodeImg.closest('g.node') || nodeImg.closest('g');
      const fullLabel = extractFullNodeIdFromGroup(g);
      if (!fullLabel) continue;
      const newHref = getSpriteSrcForGifOrMsg(fullLabel);
      if (nodeImg.getAttribute('href') !== newHref) {
        nodeImg.setAttribute('href', newHref);
      }
    }

    // 同步接管已存在的消息板头像（防止 Swarm app.js 在 hook 就绪前渲染出的原生 22x18 base64 小蜜蜂残留）
    const msgAvs = document.querySelectorAll('.msg-av.bee');
    for (const av of msgAvs) {
      if (av.style.background !== 'transparent') {
        av.style.background = 'transparent';
      }
      let img = av.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = '';
        av.appendChild(img);
      }
      const msgEl = av.closest('.msg');
      const ariaName = String(msgEl?.getAttribute('aria-label') || '').split(',')[0].trim();
      const domFromEl = msgEl?.querySelector('.msg-from, [data-gn-raw-name], [data-member]');
      const domFromName = String(domFromEl?.getAttribute?.('data-gn-raw-name') || domFromEl?.textContent || '').replace(/^@/, '').trim();
      const agentName = img.dataset.gnAgent || ariaName || domFromName || 'worker';
      if (img.dataset.gnAgent !== agentName) {
        img.dataset.gnAgent = agentName;
      }
      if (!img.classList.contains('gn-msg-avatar')) {
        img.classList.add('gn-msg-avatar');
      }
      img.classList.toggle('is-pixel', prefs.artStyle === 'pixel');
      if (img.hasAttribute('width')) img.removeAttribute('width');
      if (img.hasAttribute('height')) img.removeAttribute('height');

      const expectedSrc = getSpriteSrcForGifOrMsg(agentName);
      const curDataSrc = img.getAttribute('data-src') || '';
      const isBase64Fallback = prefs.artStyle !== 'pixel' && String(img.src || '').startsWith('data:image/png;base64,');
      if (curDataSrc !== expectedSrc || isBase64Fallback) {
        img.dataset.gnFallback = '0';
        img.setAttribute('data-src', expectedSrc);
        img.src = expectedSrc;
      }
      attachSpriteFallback(img, resolveMemberCharacter(agentName).kind);
    }

    applyMemeNicknamesToDom();
    transformHiveCellsToCatNests();
  }

  function refreshAllSprites() {
    chibiAvatarCache.clear();
    document.querySelectorAll('.gn-sprite-host').forEach((h) => {
      delete h.dataset.gnKey;
    });
    document.querySelectorAll('.msg-av.bee img').forEach((img) => {
      img.removeAttribute('data-src');
    });
    enhanceDomSprites();
  }

  function getSidecarConversationId() {
    if (window.sidecar && window.sidecar.conversationId) return String(window.sidecar.conversationId);
    try {
      return new URLSearchParams(window.location.search).get('conversationId') || '';
    } catch {
      return '';
    }
  }

  async function fetchSidecarMeta(barUpdateCb) {
    if (!window.__GEMINEKO_SIDECAR_MODE__) return;
    try {
      const convId = getSidecarConversationId();
      const liveUrl = convId ? `/api/live-activity?conversationId=${encodeURIComponent(convId)}` : '/api/live-activity';
      const [nativeResp, liveResp, cdpResp, ghResp, themeResp] = await Promise.all([
        originalFetch('/api/native-patch/status'),
        originalFetch(liveUrl),
        originalFetch('/api/cdp/status'),
        originalFetch('/api/github/status'),
        originalFetch('/api/theme/config', { cache: 'no-store' }),
      ]);
      if (nativeResp.ok) lastNativeStatus = await nativeResp.json();
      if (liveResp.ok) {
        const d = await liveResp.json();
        if (d?.activity) lastLiveActivity = d.activity;
      }
      if (cdpResp.ok) {
        const c = await cdpResp.json();
        if (c?.cdp) lastCdpStatus = c.cdp;
      }
      if (ghResp.ok) {
        const g = await ghResp.json();
        if (g?.ok) lastGithubPulse = g;
      }
      if (themeResp.ok) {
        const th = await themeResp.json();
        if (th?.config) syncSidecarHostTheme(th.config, th.hostScheme);
      }
      if (barUpdateCb) barUpdateCb();
    } catch {
      /* ignore */
    }
  }

  function renderLiveBannerHtml() {
    if (!window.__GEMINEKO_SIDECAR_MODE__) return '';
    const act = lastLiveActivity || {
      role: 'neon',
      action: 'idle',
      phase: 'idle',
      phaseLabel: '待机中',
      actionLabel: '打盹摸鱼',
      model: 'gemini-4-neon',
      lastTool: '',
      spriteFile: 'neon-idle.png',
    };
    const spriteUrl = resolveLiveSpriteUrl(act);
    const phaseCls = act.phase === 'executor' ? 'is-executor' : act.phase === 'idle' ? 'is-idle' : '';

    let cdpText = '主对话挂件: 待机';
    if (lastCdpStatus) {
      if (lastCdpStatus.nativeConnected) cdpText = '⚡ 原生 0ms 已直连';
      else if (lastCdpStatus.state === 'attached') cdpText = '🟢 输入栏猫娘已挂载';
      else if (lastCdpStatus.state === 'disabled-by-user') cdpText = '⚪ 输入栏猫娘已暂停';
      else if (lastCdpStatus.state === 'debug-port-disabled') cdpText = '🟡 需调试端口或启用原生引导';
    }

    return `
      <div class="gn-live-banner">
        <img class="gn-live-avatar" src="${spriteUrl}" alt="" />
        <div class="gn-live-info">
          <div class="gn-live-row">
            <span class="gn-phase-badge ${phaseCls}">${act.phaseLabel || '编排模式'}</span>
            <span class="gn-action-chip">${ACTION_EMOJI[act.action] || '✨'} ${act.actionLabel || '思考中'}</span>
            <strong>${act.model || 'gemini-4-neon'}</strong>
          </div>
          <div class="gn-live-sub">${act.lastTool ? `最新调用: ${act.lastTool}` : '仅追踪当前对话的编排/执行阶段（已隔离后台任务）'}</div>
        </div>
        <button type="button" class="gn-pill" data-gn-act="cdp-toggle" title="${lastCdpStatus?.hint || '启停主对话输入栏与活跃行动态立绘'}">${cdpText}</button>
      </div>
    `;
  }

  function renderSegmentedRow(label, key, options) {
    const btns = options
      .map((opt) => {
        const active = prefs[key] === opt.value;
        return `<button type="button" class="gn-seg-btn ${active ? 'is-active' : ''}" data-gn-set="${key}" data-gn-val="${String(opt.value)}">${active ? '✓ ' : ''}${opt.label}</button>`;
      })
      .join('');
    return `<div class="gn-setting-row"><span class="gn-setting-label">${label}</span><div class="gn-seg-group" role="group" aria-label="${label}">${btns}</div></div>`;
  }

  function ensureSidecarShell() {
    if (!window.__GEMINEKO_SIDECAR_MODE__) return null;
    let shell = document.getElementById('gemineko-sidecar-shell');
    if (!shell && document.body) {
      shell = document.createElement('div');
      shell.id = 'gemineko-sidecar-shell';
      document.body.prepend(shell);
    }
    return shell;
  }

  function renderToolbar() {
    const shell = ensureSidecarShell();
    const boardHeader = document.querySelector('#board .header');
    const mountParent = shell || boardHeader;
    if (!mountParent) return;
    let bar = document.getElementById('gemineko-toolbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'gemineko-toolbar';
      bar.className = 'gn-bar';
      mountParent.insertBefore(bar, mountParent.firstChild);
    } else if (shell && bar.parentElement !== shell) {
      shell.insertBefore(bar, shell.firstChild);
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
          label = '✅ 原生已换肤（点此还原）';
          cls = 'gn-pill is-native-on';
        } else if (st.patched) {
          label = '✨ 原生皮肤待更新（点击同步）';
        } else {
          label = '🎨 原生 Swarm 换肤';
        }
      }
      nativeBtnHtml = `<button type="button" class="${cls}" data-gn-act="native-toggle" title="无损美化或还原官方原生 Swarm 面板及入口图标">${label}</button>`;
    }

    const exitDemoHtml = demoActive
      ? `<button type="button" class="gn-pill is-demo" data-gn-act="exit-demo">${L.exitDemo}</button>`
      : '';

    const roleText = prefs.roleMode === 'ai-girls' ? L.roleAi : L.roleHachimi;
    const artText = prefs.artStyle === 'chibi' ? L.artChibi : L.artPixel;
    const nickText = prefs.memeNicknames ? L.nickOn : L.nickOff;
    const themeText = prefs.themeMode === 'starry-hive' ? L.themeHive : L.themeMin;

    const settingsHtml = prefs.settingsOpen
      ? `<div class="gn-settings-panel">
          ${renderSegmentedRow('角色宇宙', 'roleMode', [
            { value: 'ai-girls', label: L.roleAi },
            { value: 'all-hachimi', label: L.roleHachimi },
          ])}
          ${renderSegmentedRow('立绘画风', 'artStyle', [
            { value: 'chibi', label: L.artChibi },
            { value: 'pixel', label: L.artPixel },
          ])}
          ${renderSegmentedRow('成员花名', 'memeNicknames', [
            { value: true, label: L.nickOn },
            { value: false, label: L.nickOff },
          ])}
          ${renderSegmentedRow('视觉皮肤', 'themeMode', [
            { value: 'starry-hive', label: L.themeHive },
            { value: 'avatar-only', label: L.themeMin },
          ])}
          ${renderSegmentedRow('界面语言', 'locale', [
            { value: 'neko-zh', label: '萌系中文' },
            { value: 'zh', label: '正常中文' },
            { value: 'en', label: 'EN' },
          ])}
          ${renderSegmentedRow('互动音效', 'sound', [
            { value: true, label: '开启喵音' },
            { value: false, label: '静音' },
          ])}
        </div>`
      : '';

    const starCountText = Number.isFinite(Number(lastGithubPulse?.stars))
      ? `⭐ ${lastGithubPulse.stars} Star`
      : '⭐ Star 支持';
    const updateBannerHtml = (window.__GEMINEKO_SIDECAR_MODE__ && lastGithubPulse?.hasUpdate && !updateBannerDismissed)
      ? `<div class="gn-update-banner">
          <span>🚀 发现新版本 <strong>v${lastGithubPulse.latestVersion}</strong>（当前 v${lastGithubPulse.currentVersion}）</span>
          <div class="gn-update-actions">
            <button type="button" class="gn-pill is-primary" data-gn-act="open-releases">查看更新</button>
            <button type="button" class="gn-pill" data-gn-act="copy-update-cmd" title="${lastGithubPulse.updateCommand || ''}">复制更新命令</button>
            <button type="button" class="gn-pill" data-gn-act="dismiss-update">×</button>
          </div>
        </div>`
      : '';

    const displayVer = lastGithubPulse?.currentVersion || (typeof GEMINEKO_VERSION === 'string' ? GEMINEKO_VERSION : '0.8.4');

    bar.innerHTML = `
      <div class="gn-bar-top">
        <span class="gn-brand" data-gn-act="collapse" title="Gemineko Hive 开源主题引擎 · by AEmbers (Code: MIT · Artwork: CC BY-NC-SA 4.0)">
          <img class="gn-brand-dot" src="${GEMINEKO_ASSETS.logo}" alt="" />
          <span>基米窝 v${displayVer}</span>
        </span>
        <div class="gn-top-actions">
          ${window.__GEMINEKO_SIDECAR_MODE__ ? `<button type="button" id="gn-workshop-toggle-btn" class="gn-pill ${workshop?.isOpen?.() ? 'is-active' : ''}" data-gn-act="toggle-workshop" title="打开《Gemineko Hive · 基米窝》社区主题商店与精细工坊">🏪 主题商店</button>
          <span class="gn-font-step-group" title="当前侧栏字号 ${Math.max(11, Math.min(22, Math.round(Number(lastSidecarThemeConfig?.typography?.sidecarFontSize) || 14)))}px">
            <button type="button" class="gn-pill" data-gn-act="font-dec" aria-label="减小字号">A-</button>
            <span class="gn-font-val">${Math.max(11, Math.min(22, Math.round(Number(lastSidecarThemeConfig?.typography?.sidecarFontSize) || 14)))}px</span>
            <button type="button" class="gn-pill" data-gn-act="font-inc" aria-label="增大字号">A+</button>
          </span>` : ''}
          <button type="button" class="gn-pill gn-star-pill" data-gn-act="open-star" title="前往 GitHub 仓库 AEmbers/gemineko-hive 点亮 Star 支持作者">${starCountText}</button>
          <button type="button" class="gn-pill ${prefs.settingsOpen ? 'is-active' : ''}" data-gn-act="toggle-settings" title="展开或收起各项模式明确开关">⚙️ ${L.settingsBtn} ${prefs.settingsOpen ? '▴' : '▾'}</button>
          <button type="button" class="gn-pill is-poke" data-gn-act="poke">🐾 ${L.poke}</button>
          ${nativeBtnHtml}
          ${exitDemoHtml}
          <button type="button" class="gn-pill gn-collapse-btn" data-gn-act="collapse" aria-label="折叠工具栏">${prefs.collapsed ? '展开 ▾' : '收起 ▴'}</button>
        </div>
      </div>
      ${updateBannerHtml}
      <div class="gn-chips-row">
        <button type="button" class="gn-chip" data-gn-act="toggle-settings" title="当前生效角色（点击下方展开开关切换）"><span class="gn-chip-k">角色</span><span class="gn-chip-v">${roleText}</span></button>
        <button type="button" class="gn-chip" data-gn-act="toggle-settings" title="当前生效画风"><span class="gn-chip-k">画风</span><span class="gn-chip-v">${artText}</span></button>
        <button type="button" class="gn-chip" data-gn-act="toggle-settings" title="当前成员名称显示方式"><span class="gn-chip-k">名称</span><span class="gn-chip-v">${nickText}</span></button>
        <button type="button" class="gn-chip" data-gn-act="toggle-settings" title="当前视觉主题模式"><span class="gn-chip-k">皮肤</span><span class="gn-chip-v">${themeText}</span></button>
        <button type="button" class="gn-chip" data-gn-act="toggle-settings" title="当前界面语言"><span class="gn-chip-k">语言</span><span class="gn-chip-v">${L.locLabel}</span></button>
      </div>
      ${settingsHtml}
      ${renderLiveBannerHtml()}
    `;

    const liveAvatarEl = bar.querySelector('.gn-live-avatar');
    if (liveAvatarEl) attachSpriteFallback(liveAvatarEl, lastLiveActivity?.role);

    bar.querySelectorAll('[data-gn-set]').forEach((segBtn) => {
      segBtn.addEventListener('click', () => {
        const k = segBtn.getAttribute('data-gn-set');
        const rawV = segBtn.getAttribute('data-gn-val');
        if (!k) return;
        const val = rawV === 'true' ? true : rawV === 'false' ? false : rawV;
        prefs[k] = val;
        if (k === 'sound' && val) playMeow('pat');
        savePrefs();
        applyThemeAndLocale();
        refreshAllSprites();
        renderToolbar();
      });
    });

    bar.querySelectorAll('[data-gn-act]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const act = btn.getAttribute('data-gn-act');
        if (act === 'collapse') {
          prefs.collapsed = !prefs.collapsed;
        } else if (act === 'toggle-workshop') {
          workshop?.toggle?.();
          return;
        } else if (act === 'open-star') {
          void openExternalSafe(lastGithubPulse?.starUrl || 'https://github.com/AEmbers/gemineko-hive');
          return;
        } else if (act === 'font-dec' || act === 'font-inc') {
          const curTypo = lastSidecarThemeConfig?.typography || readLocalTypography() || { sidecarFontSize: 14, hostFontScale: 100 };
          const curSize = Math.max(11, Math.min(22, Math.round(Number(curTypo.sidecarFontSize) || 14)));
          const nextSize = Math.max(11, Math.min(22, curSize + (act === 'font-inc' ? 1 : -1)));
          const nextTypo = {
            hostFontScale: Math.max(85, Math.min(135, Math.round(Number(curTypo.hostFontScale) || 100))),
            sidecarFontSize: nextSize,
          };
          writeLocalTypography(nextTypo);
          syncSidecarHostTheme({ ...(lastSidecarThemeConfig || { enabled: true }), typography: nextTypo });
          workshop?.syncExternalTypography?.(nextTypo);
          try {
            const headers = { 'Content-Type': 'application/json' };
            if (window.__SIDECAR_TOKEN__) headers['x-sidecar-token'] = window.__SIDECAR_TOKEN__;
            const r = await originalFetch('/api/theme/config', {
              method: 'POST',
              headers,
              body: JSON.stringify({ typography: nextTypo }),
            });
            if (r.ok) {
              const resJson = await r.json();
              if (resJson?.config) {
                const merged = resJson.config.typography ? resJson.config : { ...resJson.config, typography: nextTypo };
                syncSidecarHostTheme(merged);
                workshop?.syncExternalTypography?.(merged.typography);
              }
            }
          } catch {}
          renderToolbar();
          return;
        } else if (act === 'open-releases') {
          void openExternalSafe(lastGithubPulse?.releaseUrl || lastGithubPulse?.releasesUrl || 'https://github.com/AEmbers/gemineko-hive/releases');
          return;
        } else if (act === 'copy-update-cmd') {
          const cmd = lastGithubPulse?.updateCommand || 'git pull && npm run build && .\\scripts\\install-local.ps1';
          navigator.clipboard?.writeText?.(cmd).catch(() => {});
          spawnBubbleAt(btn.getBoundingClientRect().left + 30, btn.getBoundingClientRect().bottom + 20, '📋 已复制更新命令，粘贴到仓库终端执行即可');
          return;
        } else if (act === 'dismiss-update') {
          updateBannerDismissed = true;
          renderToolbar();
          return;
        } else if (act === 'toggle-settings') {
          prefs.settingsOpen = !prefs.settingsOpen;
        } else if (act === 'poke') {
          triggerPokeHive();
          return;
        } else if (act === 'exit-demo') {
          demoActive = false;
          renderToolbar();
          window.location.reload();
          return;
        } else if (act === 'cdp-toggle') {
          try {
            const headers = { 'Content-Type': 'application/json' };
            if (window.__SIDECAR_TOKEN__) headers['x-sidecar-token'] = window.__SIDECAR_TOKEN__;
            const r = await originalFetch('/api/cdp/toggle', {
              method: 'POST',
              headers,
              body: JSON.stringify({ enabled: !lastCdpStatus?.enabled }),
            });
            if (r.ok) {
              const resJson = await r.json();
              lastCdpStatus = resJson.cdp;
              spawnBubbleAt(
                btn.getBoundingClientRect().left + 40,
                btn.getBoundingClientRect().bottom + 24,
                lastCdpStatus?.hint || '已切换主对话动态猫娘状态',
              );
              renderToolbar();
            }
          } catch {
            /* ignore */
          }
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
                ? '原生 Swarm 与入口图标已换装！重开 Swarm 面板即可生效～'
                : '已字节级无损还原为官方原版 Swarm！';
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
      hint.textContent = '正在召唤 5 大模型 × 5 大动作哈基米进入猫窝…';
      wrap.appendChild(hint);
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

  // 劫持 fetch 捕获 /api/swarm 成员底层模型与动作，并支持空状态 Demo 秒切
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function patchedFetch(input, init) {
    const urlStr = typeof input === 'string' ? input : input?.url || '';
    const isSwarmData = /\/api\/swarm(?:$|\?)/.test(urlStr);
    if (isSwarmData && demoActive) {
      const snap = buildDemoSwarmSnapshot();
      ingestMembersFromSnap(snap);
      let reqEtag = '';
      try {
        reqEtag = new URL(urlStr, window.location.origin).searchParams.get('etag') || '';
      } catch {
        /* ignore */
      }
      if (reqEtag && snap.etag && reqEtag === snap.etag) {
        return new window.Response(
          JSON.stringify({
            conversationId: snap.conversationId,
            swarm: snap.swarm,
            member: snap.member,
            unchanged: true,
            etag: snap.etag,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
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
        return `<span class="msg-av bee" style="background:transparent" aria-hidden="true"><img class="gn-msg-avatar${pxCls}" data-gn-agent="${ch.name.replace(/"/g, '&quot;')}" src="${src}" alt="" width="48" height="48"></span>`;
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

  // 主题工坊双向控制台（仅 Sidecar 模式）
  let workshop = null;
  if (window.__GEMINEKO_SIDECAR_MODE__ && typeof createThemeWorkshopController === 'function') {
    workshop = createThemeWorkshopController({
      hostApi: async (url, init = {}) => {
        const headers = new Headers(init.headers || {});
        if (!headers.has('Content-Type') && init.method === 'POST') {
          headers.set('Content-Type', 'application/json');
        }
        if (window.__SIDECAR_TOKEN__ && !headers.has('x-sidecar-token')) {
          headers.set('x-sidecar-token', window.__SIDECAR_TOKEN__);
        }
        const r = await originalFetch(url, { ...init, headers });
        return r.json();
      },
      sidecarBanner: (text) => {
        const anchor = document.querySelector('#gemineko-toolbar .gn-brand') || document.body;
        const rect = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: 80, bottom: 48 };
        spawnBubbleAt(rect.left + 80, rect.bottom + 26, text);
      },
      onThemeConfigChange: (nextCfg, hostScheme) => {
        syncSidecarHostTheme(nextCfg, hostScheme);
      },
      onWorkshopEggUnlock: (eggId, label) => {
        playMeow('alchemy');
        void unlockSidecarEgg(eggId, label);
      },
      onReplaySidecarEgg: (eggId) => {
        if (eggId === 'sidecar-zoomies') triggerSidecarZoomies();
        else if (eggId === 'sidecar-dried-fish') triggerSidecarDriedFish();
        else if (eggId === 'workshop-alchemy') workshop?.triggerAlchemy?.();
        else if (eggId === 'supreme') triggerSidecarSupremeShowcase();
      },
    });
  }

  window.__GEMINEKO_SIDECAR_EGG_REPLAY__ = (eggId) => {
    if (eggId === 'sidecar-zoomies') triggerSidecarZoomies();
    else if (eggId === 'sidecar-dried-fish') triggerSidecarDriedFish();
    else if (eggId === 'workshop-alchemy') workshop?.triggerAlchemy?.();
    else if (eggId === 'supreme') triggerSidecarSupremeShowcase();
  };

  // 启动 DOM 观察、Sidecar 实时活动轮询与初始渲染
  const start = () => {
    document.addEventListener('dblclick', (e) => {
      if (!isSidecarEggAllowed()) return;
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('.gn-live-avatar')) {
        e.stopPropagation();
        triggerSidecarZoomies();
        return;
      }
      const memberAvatar = t.closest('.gn-sprite-host, .gn-msg-avatar, .beebox');
      if (memberAvatar && !t.closest('#gemineko-toolbar')) {
        e.stopPropagation();
        triggerSidecarDriedFish(memberAvatar);
        return;
      }
      if (t.closest('.gn-ws-title')) {
        e.stopPropagation();
        workshop?.triggerAlchemy?.();
      }
    }, true);
    installSwarmHiveHooks();
    applyThemeAndLocale();
    renderToolbar();
    ensureEmptyStateDemoButton();
    enhanceDomSprites();

    if (window.__GEMINEKO_SIDECAR_MODE__) {
      const syncBanner = () => {
        renderToolbar();
        const nbtn = document.querySelector('#gn-empty-native-row button');
        if (nbtn && lastNativeStatus) {
          nbtn.textContent = lastNativeStatus.patched
            ? '✅ 原生 Swarm 已换肤（点此还原）'
            : '🎨 给官方原生 Swarm 面板换上《基米窝》皮肤';
        }
      };
      fetchSidecarMeta(syncBanner);

      // 防止无 Swarm 的普通对话在侧边栏一直停留在 #loading 骨架屏
      const guardLoadingSkeleton = () => {
        const loadingEl = document.getElementById('loading');
        const boardEl = document.getElementById('board');
        const emptyEl = document.getElementById('empty');
        if (!loadingEl || loadingEl.classList.contains('hidden')) return;
        const boardHidden = !boardEl || boardEl.classList.contains('hidden');
        const emptyHidden = !emptyEl || emptyEl.classList.contains('hidden');
        if (!boardHidden || !emptyHidden) return;

        const convId = getSidecarConversationId();
        const probeUrl = convId ? `/api/swarm?conversationId=${encodeURIComponent(convId)}` : '/api/swarm';
        originalFetch(probeUrl)
          .then((r) => (r.ok ? r.json() : null))
          .then((snap) => {
            if (!loadingEl.classList.contains('hidden')) {
              if (snap && snap.swarm) {
                try {
                  window.dispatchEvent(new Event('focus'));
                  document.dispatchEvent(new Event('visibilitychange'));
                } catch {}
                setTimeout(() => {
                  if (!loadingEl.classList.contains('hidden') && boardEl?.classList.contains('hidden')) {
                    loadingEl.classList.add('hidden');
                    boardEl.classList.remove('hidden');
                    renderToolbar();
                  }
                }, 650);
              } else {
                loadingEl.classList.add('hidden');
                if (boardEl) boardEl.classList.add('hidden');
                if (emptyEl) emptyEl.classList.remove('hidden');
                ensureEmptyStateDemoButton();
                renderToolbar();
              }
            }
          })
          .catch(() => {});
      };
      setTimeout(guardLoadingSkeleton, 1200);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) setTimeout(guardLoadingSkeleton, 350);
      });

      setInterval(() => {
        const convId = getSidecarConversationId();
        const liveUrl = convId ? `/api/live-activity?conversationId=${encodeURIComponent(convId)}` : '/api/live-activity';
        originalFetch(liveUrl)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.activity) {
              lastLiveActivity = d.activity;
              const liveImg = document.querySelector('.gn-live-avatar');
              if (liveImg) {
                attachSpriteFallback(liveImg, d.activity.role);
                const nextSrc = resolveLiveSpriteUrl(d.activity);
                if (liveImg.getAttribute('data-src') !== nextSrc) {
                  liveImg.dataset.gnFallback = '0';
                  liveImg.setAttribute('data-src', nextSrc);
                  liveImg.src = nextSrc;
                }
              }
            }
          })
          .catch(() => {});
        workshop?.pollEvents?.();
      }, 4000);

      // 1s 轻量级主题与宿主明暗轮询（实时接收主窗口快切浮层的配色、大小、停靠方向及宿主日夜变更）
      setInterval(() => {
        originalFetch('/api/theme/config', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((th) => {
            if (!th?.config) return;
            const nextSig = computeThemeSyncSig(th.config, th.hostScheme || lastReportedHostScheme);
            if (nextSig !== lastSidecarThemeSig) {
              syncSidecarHostTheme(th.config, th.hostScheme);
              workshop?.syncExternalConfig?.(th.config);
            }
          })
          .catch(() => {});
      }, 1000);
    }

    try {
      const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      mql?.addEventListener?.('change', () => {
        if (lastSidecarThemeConfig) syncSidecarHostTheme();
      });
    } catch {}

    let domSyncTimer = null;
    let domSyncMicro = false;
    const runDomSync = () => {
      domSyncTimer = null;
      domSyncMicro = false;
      mo.disconnect();
      try {
        installSwarmHiveHooks();
        applyThemeAndLocale();
        ensureEmptyStateDemoButton();
        if (!document.getElementById('gemineko-toolbar')) {
          renderToolbar();
        }
        enhanceDomSprites();
      } finally {
        if (document.body) {
          mo.observe(document.body, { childList: true, subtree: true });
        }
      }
    };

    const mo = new MutationObserver((mutations) => {
      const urgent = mutations.some((m) => {
        const t = m.target;
        return (
          t &&
          (t.id === 'graph' ||
            t.id === 'replay-label' ||
            t.classList?.contains('hv-svg') ||
            (typeof t.closest === 'function' && (t.closest('svg#graph') || t.closest('svg.hv-svg'))))
        );
      });
      if (urgent) {
        if (domSyncTimer) {
          clearTimeout(domSyncTimer);
          domSyncTimer = null;
        }
        if (!domSyncMicro) {
          domSyncMicro = true;
          queueMicrotask(runDomSync);
        }
        return;
      }
      if (domSyncTimer || domSyncMicro) return;
      domSyncTimer = setTimeout(runDomSync, 80);
    });
    if (document.body) {
      mo.observe(document.body, { childList: true, subtree: true });
    }
    if (document.documentElement) {
      const rootThemeMo = new MutationObserver(() => {
        if (lastSidecarThemeConfig) syncSidecarHostTheme();
      });
      rootThemeMo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
