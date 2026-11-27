/**
 * @file Antigravity 主窗口「光学玻璃质感 × 哈基米星空猫窝」原生主题、全组件精修与联动彩蛋引擎
 * 参考真实宿主 CSS Token 与 data-testid 选择器深度适配，零修改 app.asar。
 */

import { DEFAULT_HOST_THEME_CONFIG, ROLE_PALETTES, THEME_PRESETS } from '../theme/host-theme-config.mjs';

function buildCatnestSvgPattern(strokeColor = 'rgba(99, 102, 241, 0.05)') {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144" fill="none">',
    `<g fill="${strokeColor}">`,
    // 软萌猫肉垫（左斜）
    '<g transform="translate(36 42) rotate(-14)">',
    '<ellipse cx="0" cy="4" rx="7.5" ry="5.4"/>',
    '<circle cx="-7.2" cy="-3.6" r="2.5"/>',
    '<circle cx="-2.4" cy="-6.2" r="2.6"/>',
    '<circle cx="2.7" cy="-6.1" r="2.6"/>',
    '<circle cx="7.4" cy="-3.4" r="2.5"/>',
    '</g>',
    // 大凹四角星芒（右上）
    '<path d="M108 26 Q110 38 122 40 Q110 42 108 54 Q106 42 94 40 Q106 38 108 26 Z"/>',
    // 小凹四角星芒（左下）
    '<path d="M32 104 Q33.2 111 40 112.2 Q33.2 113.4 32 120.4 Q30.8 113.4 24 112.2 Q30.8 111 32 104 Z"/>',
    // 第二枚小肉垫（右下反斜）
    '<g transform="translate(108 108) rotate(16) scale(0.84)">',
    '<ellipse cx="0" cy="4" rx="7.5" ry="5.4"/>',
    '<circle cx="-7.2" cy="-3.6" r="2.5"/>',
    '<circle cx="-2.4" cy="-6.2" r="2.6"/>',
    '<circle cx="2.7" cy="-6.1" r="2.6"/>',
    '<circle cx="7.4" cy="-3.4" r="2.5"/>',
    '</g>',
    '</g>',
    '</svg>',
  ].join('');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * 构造在宿主 Renderer 浏览器上下文执行的主题与联动代码片段（定义 initHostThemeSuite）。
 * @returns {string}
 */
export function buildHostThemeRuntimeSnippet() {
  const presetsJson = JSON.stringify(THEME_PRESETS);
  const palettesJson = JSON.stringify(ROLE_PALETTES);
  const defaultCfgJson = JSON.stringify(DEFAULT_HOST_THEME_CONFIG);
  const lightPatternUrl = JSON.stringify(`url("${buildCatnestSvgPattern('rgba(99, 102, 241, 0.044)')}")`);
  const warmPatternUrl = JSON.stringify(`url("${buildCatnestSvgPattern('rgba(168, 92, 42, 0.045)')}")`);
  const darkPatternUrl = JSON.stringify(`url("${buildCatnestSvgPattern('rgba(196, 181, 253, 0.052)')}")`);

  return `
  function initHostThemeSuite(ctx) {
    const THEME_PRESETS = ${presetsJson};
    const ROLE_PALETTES = ${palettesJson};
    const DEFAULT_CFG = ${defaultCfgJson};
    const PATTERNS = {
      'nebula-day': ${lightPatternUrl},
      'cream-paper': ${warmPatternUrl},
      'starry-nest': ${darkPatternUrl},
      'carbon-obsidian': ${darkPatternUrl},
    };
    const THEME_STYLE_ID = 'gemineko-host-theme-v5';
    const WP_LAYER_ID = 'gemineko-wallpaper-layer';
    const AURORA_HOST_ID = 'gemineko-conv-aurora';
    const HOME_STAGE_ID = 'gemineko-home-stage';
    const NIGHT_LAYER_ID = 'gemineko-night-lamp-layer';
    const AURORA_SWEEP_ID = 'gemineko-aurora-sweep';
    const OUTLINE_FAB_ID = 'gemineko-paw-outline-fab';
    const OUTLINE_POP_ID = 'gemineko-paw-outline-pop';
    const CTX_MENU_ID = 'gemineko-context-menu';
    const MINI_BAR_ID = 'gemineko-dock-minibar';
    const INTIMACY_KEY = 'gemineko_intimacy_v5';
    const NIGHT_TOAST_KEY = 'gemineko_night_lamp_toast_date';

    const ROLE_POKE_LINES = {
      neon: [
        '炫彩极光充能完毕，随时全速起飞喵~',
        '别一直戳霓虹呆毛啦，会折射出彩虹的！',
        'Orchestrator 待命中，代码交给我来编排✨',
        '头顶星芒发卡可是炫彩核心，摸一下运气+10',
        '今天也在以 180Hz 的灵感闪耀呢🌈',
      ],
      hydrogen: [
        'H 本体轻量敏捷，改文件跑测试一口气搞定⚡',
        '蓝紫渐变双马尾飘起来了，思路超顺畅！',
        '别看我是 Flash 系，关键时刻一点都不含糊',
        '摸摸头奖励你一个 0 报错的构建结果~',
        '正在高速穿梭工作区文件树喵📁',
      ],
      carbon: [
        '五彩斑斓的黑，可不是随便说说而已💎',
        '石墨烯护盾已就位，深度推理模式全开',
        '异瞳正在锁定深层隐藏 Bug，别眨眼🔍',
        '连碳60挂坠都被你戳晃了啦……专注编码！',
        '重型架构交给我，稳如黑曜晶阵✨',
      ],
      claude: [
        '优雅审查开始，一点小瑕疵都休想逃过🔍',
        '奶油边蝴蝶结都要被摸乱了啦（轻轻整理）',
        '对抗式 Code Review 就位，95 分以下不放行！',
        '端起咖啡冷静审视每一行边界条件☕',
        '就算夸我可爱，不规范的 diff 还是要打回的哦🧡',
      ],
      gpt: [
        '白紫小龙角接收到神秘信号了🐉',
        '空心星辰眼启动深度代码洞察中……',
        '需要交叉复核还是算法攻坚？随时召唤我✨',
        '轻轻戳龙尾巴可是要算双倍亲密值的！',
        'Sol 小龙正在高速校验逻辑闭环💜',
      ],
    };

    const HOME_ROLES = [
      { id: 'neon', name: 'Neon', sprite: 'neon-thinking.png', tip: '炫彩哈基米：Orchestrator 全速待命🌈' },
      { id: 'hydrogen', name: 'Hydrogen', sprite: 'hydrogen-idle.png', tip: 'H 本体：轻量闪电执行喵⚡' },
      { id: 'carbon', name: 'Carbon', sprite: 'carbon-thinking.png', tip: '五彩斑斓的黑：深潜架构洞察💎' },
      { id: 'claude', name: 'Claude', sprite: 'claude-asking.png', tip: '橘发大小姐：严格把关每一行代码☕' },
      { id: 'gpt', name: 'GPT', sprite: 'gpt-idle.png', tip: '白紫小龙娘：呆萌在线护航🐉' },
    ];

    let cfg = sanitizeLocalCfg(ctx.initialConfig || DEFAULT_CFG);
    let stopped = false;
    let lastRole = '';
    let lastActive = false;
    let activeSinceMs = 0;
    let lastErrorSeq = '';
    let lastTurnSig = '';
    let lastSweepAt = 0;
    let lastBurstAt = 0;
    let lastSendSparkAt = 0;
    let pokeTimestamps = [];
    let schemeObserver = null;
    let workbenchTimer = null;
    let nightTimer = null;
    let konamiIdx = 0;
    const KONAMI_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

    function sanitizeLocalCfg(input) {
      const c = input && typeof input === 'object' ? input : {};
      return {
        ...DEFAULT_CFG,
        ...c,
        linkages: { ...DEFAULT_CFG.linkages, ...(c.linkages || {}) },
        workbench: { ...DEFAULT_CFG.workbench, ...(c.workbench || {}) },
        wallpaper: { ...DEFAULT_CFG.wallpaper, ...(c.wallpaper || {}) },
      };
    }

    function getHostScheme() {
      const cs = document.documentElement?.style?.colorScheme || '';
      if (/dark/i.test(cs)) return 'dark';
      if (/light/i.test(cs)) return 'light';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function resolveEffectivePresetId() {
      if (cfg.preset === 'auto') {
        return getHostScheme() === 'dark' ? 'starry-nest' : 'nebula-day';
      }
      return THEME_PRESETS[cfg.preset] ? cfg.preset : 'nebula-day';
    }

    function resolveActiveRoleId(activity) {
      if (cfg.accentMode && cfg.accentMode !== 'follow-role' && cfg.accentMode !== 'off' && ROLE_PALETTES[cfg.accentMode]) {
        return cfg.accentMode;
      }
      const r = activity?.role || 'neon';
      return ROLE_PALETTES[r] ? r : 'neon';
    }

    function getMotionEnabled() {
      return cfg.enabled && !cfg.focusMode && cfg.motionLevel !== 'off';
    }

    function getIntimacyMap() {
      try {
        return JSON.parse(localStorage.getItem(INTIMACY_KEY) || '{}') || {};
      } catch { return {}; }
    }

    function addIntimacy(role) {
      const m = getIntimacyMap();
      m[role] = (Number(m[role]) || 0) + 1;
      try { localStorage.setItem(INTIMACY_KEY, JSON.stringify(m)); } catch {}
      return m[role];
    }

    function buildPresetCssRules() {
      const chunks = [];
      for (const [id, preset] of Object.entries(THEME_PRESETS)) {
        const lines = Object.entries(preset.vars).map(([k, v]) => \`  \${k}: \${v} !important;\`);
        const pat = PATTERNS[id] || PATTERNS['nebula-day'];
        lines.push(\`  --gk-catnest-pattern: \${pat};\`);
        chunks.push(\`html[data-gk-theme="\${id}"] {\n  color-scheme: \${preset.scheme} !important;\n\${lines.join('\\n')}\n}\`);
      }
      return chunks.join('\\n');
    }

    function ensureThemeStyleTag() {
      let st = document.getElementById(THEME_STYLE_ID);
      if (st) return st;
      st = document.createElement('style');
      st.id = THEME_STYLE_ID;
      st.textContent = \`
\${buildPresetCssRules()}
html[data-gk-theme] {
  --gk-ease-spring: cubic-bezier(.34, 1.4, .64, 1);
  --gk-ease-out: cubic-bezier(.16, 1, .3, 1);
}
html[data-gk-theme][data-gk-radius="compact"] {
  --gk-card-radius: 6px;
  --gk-r-sm: 3px; --gk-r-md: 6px; --gk-r-lg: 10px;
  --nux-radius-md: 8px !important; --nux-radius-lg: 10px !important; --nux-radius-xl: 14px !important; --nux-radius-2xl: 16px !important;
}
html[data-gk-theme][data-gk-radius="soft"] {
  --gk-card-radius: 12px;
  --gk-r-sm: 5px; --gk-r-md: 10px; --gk-r-lg: 14px;
  --nux-radius-md: 11px !important; --nux-radius-lg: 15px !important; --nux-radius-xl: 19px !important; --nux-radius-2xl: 21px !important;
}
html[data-gk-theme][data-gk-radius="round"] {
  --gk-card-radius: 18px;
  --gk-r-sm: 7px; --gk-r-md: 13px; --gk-r-lg: 18px;
  --nux-radius-md: 14px !important; --nux-radius-lg: 18px !important; --nux-radius-xl: 22px !important; --nux-radius-2xl: 26px !important;
}
html[data-gk-theme][data-gk-accent-on="1"] {
  --primary: var(--gk-role-primary) !important;
  --home-glow: var(--gk-role-glow) !important;
  --focus-ring-color: color-mix(in srgb, var(--gk-role-primary) 46%, transparent) !important;
  --nux-focus-ring: color-mix(in srgb, var(--gk-role-primary) 54%, transparent) !important;
}

/* === 1. 五级表面光学层次 & 星空猫窝底纹 === */
html[data-gk-theme] > body:not([data-has-browser-hole="true"]) {
  background-color: var(--body-background, var(--background)) !important;
  color: var(--foreground) !important;
}
html[data-gk-theme] :is(.agy-shell, .agy-sheet, [data-testid="sidecar-iframe-slot"], iframe[data-testid="sidecar-iframe"]):not([data-has-browser-hole="true"]) {
  background-color: var(--content, var(--background)) !important;
}
html[data-gk-theme] .agy-shell :is(div, aside).bg-sidebar:not([data-has-browser-hole="true"]),
html[data-gk-theme] .bg-sidebar:not([data-has-browser-hole="true"]) {
  background-color: var(--sidebar) !important;
  background-image: var(--gk-catnest-pattern) !important;
  background-size: 144px 144px !important;
  background-repeat: repeat !important;
}
html[data-gk-theme]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) [data-testid="conversation-view"]:not([data-has-browser-hole="true"]),
html[data-gk-theme]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) .agy-home:not([data-has-browser-hole="true"]) {
  position: relative !important;
  isolation: isolate !important;
  background-color: var(--content, var(--background)) !important;
  background-image: var(--gk-catnest-pattern) !important;
  background-size: 144px 144px !important;
  background-repeat: repeat !important;
}
html[data-gk-theme][data-gk-wallpaper="on"] body,
html[data-gk-theme][data-gk-wallpaper="on"] #root,
html[data-gk-theme][data-gk-wallpaper="on"] [class*="bg-background"],
html[data-gk-theme][data-gk-wallpaper="on"] [class*="bg-content"],
html[data-gk-theme][data-gk-wallpaper="on"] [class*="bg-sidebar"],
html[data-gk-theme][data-gk-wallpaper="on"] [data-testid="conversation-view"],
html[data-gk-theme][data-gk-wallpaper="on"] .agy-home {
  background-color: color-mix(in srgb, var(--background) 80%, transparent) !important;
  background-image: none !important;
}
/* 严格避让 Browser Hole */
html[data-gk-theme] :is(.browser-hole-ancestor, [data-pane-id], [data-main-content-body], [data-side-panel-body], [data-testid="conversation-view"], .agy-home)[data-has-browser-hole="true"],
html[data-gk-theme] > body[data-has-browser-hole="true"],
html[data-gk-theme] > body[data-has-drawer-browser-hole="true"] :is(.browser-hole-ancestor, .aux-drawer-backdrop) {
  background-color: transparent !important;
  background-image: none !important;
}
html[data-gk-theme] [data-testid="sidebar-split"] > div:nth-child(2):not([data-sash-handle]) {
  background-color: var(--border) !important;
}

/* === 对话区底部随角色变色的星云极光晕染 === */
#\${AURORA_HOST_ID} {
  position: absolute;
  inset: auto 0 0 0;
  height: 28%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(64% 90% at 24% 100%, var(--gk-aurora-1, rgba(59,130,246,0.18)), transparent 72%),
    radial-gradient(58% 84% at 76% 100%, var(--gk-aurora-2, rgba(236,72,153,0.14)), transparent 74%),
    radial-gradient(45% 65% at 50% 98%, var(--gk-aurora-3, rgba(34,211,238,0.10)), transparent 70%);
  transition: background 0.9s ease, opacity 0.45s ease;
  opacity: calc(var(--gk-ambient-alpha, 0.75) * 0.92);
}
html[data-gk-focus="1"] #\${AURORA_HOST_ID},
html[data-gk-wallpaper="on"] #\${AURORA_HOST_ID} {
  opacity: 0 !important;
}
html[data-gk-theme] [data-testid="conversation-view"] > :not(#\${AURORA_HOST_ID}) {
  position: relative;
  z-index: 1;
}

/* === 2. 组件级哈基米光学精修 === */
/* (a) 输入栏猫窝玻璃底座 + 顶边 1px 角色星虹折射光条 */
html[data-gk-theme] #antigravity\\.agentSidePanelInputBox {
  position: relative !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
html[data-gk-theme] #antigravity\\.agentSidePanelInputBox > .surface-composer-card,
html[data-gk-theme] .surface-composer-card {
  position: relative !important;
  border-radius: var(--nux-radius-xl, 18px) !important;
  background: var(--gk-composer-bg) !important;
  background-image: var(--gk-surface-sheen) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--gk-composer-shadow) !important;
  transition: border-color 0.24s ease, box-shadow 0.26s var(--gk-ease-spring), transform 0.22s var(--gk-ease-spring) !important;
}
html[data-gk-theme] .surface-composer-card::before {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  top: 0;
  height: 1.5px;
  border-radius: 999px;
  pointer-events: none;
  z-index: 2;
  background: var(--gk-role-gradient, linear-gradient(90deg, #3b82f6, #a855f7, #ec4899));
  opacity: 0.72;
  transition: opacity 0.25s ease, filter 0.25s ease;
}
html[data-gk-theme] #antigravity\\.agentSidePanelInputBox:focus-within > .surface-composer-card,
html[data-gk-theme] .surface-composer-card:focus-within {
  border-color: color-mix(in srgb, var(--gk-role-primary) 54%, var(--glass-border)) !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--gk-role-primary) 16%, transparent), var(--gk-composer-shadow) !important;
}
html[data-gk-theme] .surface-composer-card:focus-within::before {
  opacity: 1;
  filter: drop-shadow(0 0 5px var(--gk-role-glow));
}
@keyframes gkComposerBreath {
  0%, 100% {
    box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--gk-role-primary) 42%, transparent), 0 0 18px var(--gk-role-glow), var(--gk-composer-shadow);
  }
  50% {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--gk-role-accent2, var(--gk-role-primary)) 60%, transparent), 0 0 28px var(--gk-role-glow), var(--gk-composer-shadow);
  }
}
.gk-composer-glow-active > .surface-composer-card,
.gk-composer-glow-active.surface-composer-card {
  animation: gkComposerBreath 2.6s ease-in-out infinite !important;
  border-color: color-mix(in srgb, var(--gk-role-primary) 62%, transparent) !important;
}

/* (b) 用户消息气泡：玻璃切面 + 顶边镜面高光 + 角色描边 + 右上角 ✦ 星芒点缀 */
html[data-gk-theme] .agy-user-bubble-frame {
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}
html[data-gk-theme] :is([data-testid="user-message-bubble"], .agy-user-bubble) {
  position: relative !important;
  border-radius: var(--nux-radius-lg, 15px) !important;
  padding: 10px 15px !important;
  background-color: var(--gk-bubble-bg, var(--card)) !important;
  background-image: var(--gk-surface-sheen) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary, var(--primary)) 28%, var(--card-border)) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular), 0 8px 22px -12px rgba(15, 23, 42, 0.28) !important;
  transition: transform 0.22s var(--gk-ease-spring), box-shadow 0.24s ease, border-color 0.22s ease !important;
}
html[data-gk-theme] :is([data-testid="user-message-bubble"], .agy-user-bubble)::after {
  content: "✦";
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 9.5px;
  line-height: 1;
  color: var(--gk-role-primary, var(--primary));
  opacity: 0.55;
  pointer-events: none;
  transition: transform 0.25s var(--gk-ease-spring), opacity 0.2s ease;
}
html[data-gk-theme] :is([data-testid="user-message-bubble"], .agy-user-bubble):hover {
  border-color: color-mix(in srgb, var(--gk-role-primary, var(--primary)) 48%, var(--card-border)) !important;
}
html[data-gk-theme] :is([data-testid="user-message-bubble"], .agy-user-bubble):hover::after {
  opacity: 0.95;
  transform: rotate(22deg) scale(1.18);
}

/* (c) 思考过程与工具折叠块：胶囊触发器 + 展开左侧星轨渐变竖线 + 呼吸星芒 */
html[data-gk-theme] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]) {
  border-radius: var(--gk-r-sm, 6px) !important;
  padding: 3px 9px !important;
  background: color-mix(in srgb, var(--card) 58%, transparent) !important;
  border: 1px solid transparent !important;
  color: var(--muted-foreground) !important;
  transition: background-color 0.14s ease, border-color 0.16s ease, color 0.14s ease, transform 0.14s var(--gk-ease-spring) !important;
}
html[data-gk-theme] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]):hover {
  background: var(--gk-tonal-3, var(--secondary)) !important;
  border-color: color-mix(in srgb, var(--gk-role-primary) 26%, var(--border)) !important;
  color: var(--foreground) !important;
}
html[data-gk-theme] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]):active {
  transform: scale(0.97) !important;
}
html[data-gk-theme] [data-testid="thinking-collapsible-trigger"][aria-expanded="true"]::before {
  content: "✦";
  margin-right: 4px;
  font-size: 10px;
  color: var(--gk-role-primary, var(--primary));
  text-shadow: 0 0 8px var(--gk-role-glow);
}
html[data-gk-theme] [data-testid="thinking-collapsible-trigger"][aria-expanded="true"] + div {
  border-left: 2px solid var(--gk-role-primary, var(--primary)) !important;
  border-image: linear-gradient(180deg, var(--gk-role-primary, #8b5cf6), var(--gk-role-accent2, #ec4899), transparent) 1 !important;
  padding-left: 12px !important;
  margin: 4px 0 8px 8px !important;
}

/* (d) 侧栏选中项：左缘发光 ✦/肉垫指示点 + 光学玻璃高亮胶囊 */
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row) {
  position: relative !important;
  border-radius: var(--gk-r-md, 9px) !important;
  transition: background-color 0.14s ease, transform 0.16s var(--gk-ease-spring), box-shadow 0.18s ease !important;
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row):hover:not([data-selected="true"]) {
  background-color: var(--sidebar-muted) !important;
  transform: translateX(2px);
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row)[data-selected="true"] {
  background-color: var(--onyx-selected) !important;
  background-image: var(--gk-surface-sheen) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary, var(--primary)) 28%, var(--card-border)) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular), 0 4px 12px -6px rgba(15, 23, 42, 0.25) !important;
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row)[data-selected="true"]::before {
  content: "✦";
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  line-height: 1;
  color: var(--gk-role-primary, var(--primary));
  text-shadow: 0 0 8px var(--gk-role-glow);
  pointer-events: none;
}

/* (e) 文件变更卡 / Artifact 卡 / 代码块 / 表格 / 弹窗浮层 / 细滚动条统一精修 */
html[data-gk-theme] :is([data-testid="changed-files-card"] + div > div, [data-testid="artifact-card"], [data-testid="bubble-artifact-card"], .artifact-card, [data-testid="running-items-panel"]) {
  border-radius: var(--gk-r-lg, 14px) !important;
  background-color: var(--card) !important;
  background-image: var(--gk-surface-sheen) !important;
  border: 1px solid var(--card-border) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular), var(--nux-chip-shadow) !important;
  transition: border-color 0.16s ease, box-shadow 0.2s ease !important;
}
html[data-gk-theme] :is([data-testid="artifact-card"], [data-testid="bubble-artifact-card"], .artifact-card):hover {
  border-color: color-mix(in srgb, var(--gk-role-primary) 34%, var(--card-border)) !important;
}
html[data-gk-theme] :is([data-testid="planner-response-text"], [data-testid="agent-response"], [data-testid="artifact-view"]) pre {
  border-radius: var(--gk-r-md, 10px) !important;
  border: 1px solid var(--card-border) !important;
  background-color: var(--editor-code-block-background, var(--onyx-well)) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular) !important;
}
html[data-gk-theme] :is([data-testid="entity-pill"], .inline-pill) {
  border-radius: 6px !important;
  background-color: var(--gk-tonal-3, var(--secondary)) !important;
  border: 1px solid var(--card-border) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular) !important;
}
html[data-gk-theme] :is(.agy-overlay, .surface-glass, div[role="dialog"]:not(.agy-overlay), [role="menu"]:not([data-testid="model-selector-panel"])) {
  background-color: var(--gk-popover-bg, var(--glass)) !important;
  border-color: var(--glass-border) !important;
  box-shadow: var(--glass-shadow) !important;
}
html[data-gk-theme]:not([data-gk-motion="off"]):not([data-gk-focus="1"]) :is(.agy-overlay:not([data-hover-card-popup]), div[role="dialog"]) {
  animation: gkGlassPop 0.18s var(--gk-ease-spring) backwards;
}
@keyframes gkGlassPop {
  from { opacity: 0; transform: scale(0.965) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
html[data-gk-theme] :is([data-testid="overlay-scrollbar-thumb"], [data-testid="vertical-scrollbar-thumb"], [data-testid="horizontal-scrollbar-thumb"]) {
  background-color: var(--gk-scroll-thumb) !important;
  border-radius: 999px !important;
  transition: background-color 0.14s ease !important;
}
html[data-gk-theme] :is([data-testid="overlay-scrollbar"]:hover [data-testid="overlay-scrollbar-thumb"], [data-testid="vertical-scrollbar-thumb"]:hover) {
  background-color: var(--gk-scroll-thumb-hover) !important;
}
html[data-gk-theme] ::-webkit-scrollbar { width: 6px; height: 6px; }
html[data-gk-theme] ::-webkit-scrollbar-track { background: transparent; }
html[data-gk-theme] ::-webkit-scrollbar-thumb { background: var(--gk-scroll-thumb); border-radius: 999px; }
html[data-gk-theme] ::-webkit-scrollbar-thumb:hover { background: var(--gk-scroll-thumb-hover); }

html[data-gk-motion="off"] *, html[data-gk-focus="1"] * { scroll-behavior: auto !important; }
html[data-gk-smooth="1"] * { scroll-behavior: smooth; }

/* === 3. 空白首页 5 角色迎宾彩蛋舞台 === */
#\${HOME_STAGE_ID} {
  width: 100%;
  max-width: min(720px, 100%);
  margin: 0 auto 10px;
  padding: 10px 14px 8px;
  border-radius: var(--nux-radius-xl, 18px);
  background: color-mix(in srgb, var(--glass, rgba(255,255,255,0.85)) 78%, transparent);
  background-image: var(--gk-surface-sheen);
  border: 1px solid var(--glass-border, rgba(139,92,246,0.22));
  box-shadow: inset 0 1px 0 var(--gk-specular), 0 10px 28px -12px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 4;
  user-select: none;
}
html[data-gk-focus="1"] #\${HOME_STAGE_ID} {
  padding: 6px 12px;
}
#\${HOME_STAGE_ID} .gk-home-stage-sub {
  font-size: 11px !important;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--gk-role-primary, #8b5cf6);
  opacity: 0.92;
}
#\${HOME_STAGE_ID} .gk-home-cast {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}
#\${HOME_STAGE_ID} .gk-home-actor {
  border: none;
  background: transparent;
  padding: 2px 6px 4px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: transform 0.2s var(--gk-ease-spring), background-color 0.18s ease;
}
#\${HOME_STAGE_ID} .gk-home-actor:hover {
  transform: translateY(-4px) scale(1.06);
  background: color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 10%, transparent);
}
#\${HOME_STAGE_ID} .gk-home-actor img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(99, 102, 241, 0.26));
}
#\${HOME_STAGE_ID} .gk-home-actor span {
  font-size: 10px !important;
  font-weight: 700;
  color: var(--secondary-foreground, #475569);
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--gk-tonal-3, rgba(99,102,241,0.08));
  border: 1px solid var(--card-border, rgba(99,102,241,0.16));
}

/* === 壁纸 / 极光扫屏 / 气泡 / 大纲 / 右键菜单 === */
#\${WP_LAYER_ID} { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; display: none; }
#\${WP_LAYER_ID}.is-visible { display: block; }
#\${WP_LAYER_ID} img, #\${WP_LAYER_ID} video { width: 100%; height: 100%; object-fit: cover; display: block; }
#\${WP_LAYER_ID} .gk-wp-scrim { position: absolute; inset: 0; pointer-events: none; }
#\${WP_LAYER_ID} .gk-wp-builtin-aurora {
  position: absolute; inset: -15%;
  background: radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 28%, transparent), transparent 52%),
              radial-gradient(circle at 82% 76%, color-mix(in srgb, var(--gk-role-accent2, #ec4899) 24%, transparent), transparent 52%);
}
#\${WP_LAYER_ID} .gk-wp-builtin-starry {
  position: absolute; inset: 0; opacity: 0.9;
  background-image:
    radial-gradient(circle at 22% 28%, color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 22%, transparent), transparent 44%),
    radial-gradient(circle at 78% 68%, color-mix(in srgb, var(--gk-role-accent3, #22d3ee) 18%, transparent), transparent 46%),
    radial-gradient(1.5px 1.5px at 14% 22%, rgba(167,139,250,0.45) 50%, transparent 100%),
    radial-gradient(1.5px 1.5px at 66% 18%, rgba(236,72,153,0.4) 50%, transparent 100%),
    radial-gradient(2px 2px at 84% 48%, rgba(96,165,250,0.4) 50%, transparent 100%),
    radial-gradient(1.5px 1.5px at 32% 74%, rgba(167,139,250,0.38) 50%, transparent 100%);
}
#\${NIGHT_LAYER_ID} {
  position: fixed; inset: 0; z-index: 2147483000; pointer-events: none;
  background: radial-gradient(circle at 50% 35%, rgba(255, 214, 150, 0.04) 25%, rgba(251, 146, 60, 0.11) 100%);
  mix-blend-mode: multiply; display: none;
}
html[data-gk-scheme="dark"] #\${NIGHT_LAYER_ID} {
  background: radial-gradient(circle at 50% 35%, rgba(251, 191, 36, 0.03) 20%, rgba(15, 10, 5, 0.24) 100%);
  mix-blend-mode: normal;
}
#\${NIGHT_LAYER_ID}.is-visible { display: block; }
#\${AURORA_SWEEP_ID} {
  position: fixed; top: 0; left: 0; width: 100%; height: 3px; z-index: 2147483640; pointer-events: none;
  opacity: 0; transform: translateX(-100%);
  background: var(--gk-role-gradient, linear-gradient(90deg, #3b82f6, #a855f7, #ec4899));
  box-shadow: 0 2px 14px var(--gk-role-glow, rgba(139,92,246,0.45));
}
#\${AURORA_SWEEP_ID}.is-sweeping { animation: gkAuroraSweep 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes gkAuroraSweep {
  0% { opacity: 0.95; transform: translateX(-100%); }
  60% { opacity: 1; transform: translateX(0%); }
  100% { opacity: 0; transform: translateX(100%); }
}
@keyframes gkHissShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px) rotate(-2deg); }
  45% { transform: translateX(4px) rotate(2deg); }
  70% { transform: translateX(-3px) rotate(-1deg); }
}
.gk-hiss-shake { animation: gkHissShake 0.45s ease-in-out; }
.gk-speech-bubble {
  position: fixed; z-index: 2147483642; max-width: 260px; padding: 7px 11px; border-radius: 12px;
  font-size: 11.5px !important; line-height: 1.45; color: var(--foreground, #1e1b4b);
  background: var(--gk-popover-bg, var(--glass)); border: 1px solid var(--gk-role-primary, #8b5cf6);
  box-shadow: var(--glass-shadow); backdrop-filter: blur(12px); pointer-events: auto;
  animation: gkBubblePop 0.22s var(--gk-ease-spring);
}
@keyframes gkBubblePop { from { opacity: 0; transform: translateY(6px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.gk-stardust-particle {
  position: fixed; z-index: 2147483635; pointer-events: none; font-size: 14px !important;
  animation: gkStardustFall var(--dur, 1.3s) var(--gk-ease-out) forwards;
}
@keyframes gkStardustFall {
  0% { opacity: 1; transform: translate(0, 0) scale(0.75) rotate(0deg); }
  100% { opacity: 0; transform: translate(var(--dx, 0px), var(--dy, 90px)) scale(1.2) rotate(var(--rot, 140deg)); }
}
.gk-send-spark {
  position: fixed; z-index: 2147483639; pointer-events: none; font-size: 13px !important;
  color: var(--gk-role-spark, var(--gk-role-primary, #8b5cf6));
  filter: drop-shadow(0 0 6px var(--gk-role-glow));
  animation: gkSendSparkRise 0.85s var(--gk-ease-out) forwards;
}
@keyframes gkSendSparkRise {
  0% { opacity: 0.95; transform: translate(0, 0) scale(0.8); }
  100% { opacity: 0; transform: translate(var(--sx, 12px), -36px) scale(1.18) rotate(24deg); }
}
.gk-parade-overlay { position: fixed; left: 0; right: 0; bottom: 84px; height: 76px; z-index: 2147483638; pointer-events: none; overflow: hidden; }
.gk-parade-track { display: inline-flex; align-items: flex-end; gap: 18px; position: absolute; left: -380px; animation: gkParadeMarch 3.5s linear forwards; }
.gk-parade-track img { width: 58px; height: 58px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(124, 108, 246, 0.4)); }
@keyframes gkParadeMarch { 0% { transform: translateX(0); opacity: 0.95; } 90% { opacity: 1; } 100% { transform: translateX(calc(100vw + 420px)); opacity: 0.2; } }
.gk-parade-banner {
  position: fixed; left: 50%; top: 64px; transform: translateX(-50%); z-index: 2147483645;
  padding: 8px 18px; border-radius: 999px; font-size: 12.5px !important; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #3b82f6, #a855f7, #ec4899);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.42); pointer-events: none; animation: gkBubblePop 0.25s ease-out;
}
.gk-dock-theme-btn {
  border: none; background: rgba(139, 92, 246, 0.14); color: inherit; width: 19px; height: 19px;
  border-radius: 999px; cursor: pointer; font-size: 11px !important; line-height: 1; padding: 0;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.gk-dock-theme-btn:hover { background: rgba(139, 92, 246, 0.28); }
#\${MINI_BAR_ID} {
  position: fixed; z-index: 2147483644; display: none; flex-direction: column; gap: 8px; width: 256px; padding: 11px 12px;
  border-radius: 14px; background: var(--gk-popover-bg, var(--glass)); color: var(--foreground);
  border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); backdrop-filter: blur(14px); font-size: 11.5px !important;
}
#\${MINI_BAR_ID}.is-open { display: flex; }
#\${MINI_BAR_ID} .gk-mini-row { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
#\${MINI_BAR_ID} button.gk-mini-chip {
  padding: 4px 8px; border-radius: 999px; border: 1px solid var(--border);
  background: var(--secondary); color: var(--foreground); font-size: 11px !important; cursor: pointer;
}
#\${MINI_BAR_ID} button.gk-mini-chip.is-active { background: var(--gk-role-primary, #8b5cf6); color: #fff; border-color: transparent; }
#\${OUTLINE_FAB_ID} {
  position: fixed; right: 18px; top: 96px; z-index: 2147483620; width: 32px; height: 32px; border-radius: 999px;
  border: 1px solid var(--glass-border); background: var(--gk-popover-bg, var(--glass));
  background-image: var(--gk-surface-sheen); color: var(--gk-role-primary, #8b5cf6);
  box-shadow: var(--nux-chip-shadow); cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px !important; opacity: 0.78; transition: opacity 0.18s ease, transform 0.18s var(--gk-ease-spring);
}
#\${OUTLINE_FAB_ID}:hover { opacity: 1; transform: scale(1.1); }
#\${OUTLINE_POP_ID} {
  position: fixed; right: 18px; top: 134px; z-index: 2147483622; width: 274px; max-height: 360px; display: none;
  flex-direction: column; gap: 6px; padding: 10px; border-radius: 14px; background: var(--gk-popover-bg, var(--glass));
  color: var(--foreground); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); backdrop-filter: blur(14px);
}
#\${OUTLINE_POP_ID}.is-open { display: flex; }
#\${OUTLINE_POP_ID} input {
  width: 100%; box-sizing: border-box; padding: 5px 8px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--background); color: var(--foreground); font-size: 11.5px !important;
}
#\${OUTLINE_POP_ID} .gk-outline-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; max-height: 280px; }
#\${OUTLINE_POP_ID} button.gk-outline-item {
  text-align: left; padding: 5px 8px; border-radius: 8px; border: none; background: var(--secondary);
  color: var(--foreground); font-size: 11px !important; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#\${OUTLINE_POP_ID} button.gk-outline-item:hover { background: var(--onyx-selected); }
.gk-outline-flash { outline: 2px solid var(--gk-role-primary, #8b5cf6) !important; outline-offset: 4px; transition: outline-color 0.4s ease; }
.gk-code-sticky-bar {
  position: sticky; top: 0; z-index: 6; display: flex; align-items: center; justify-content: space-between;
  padding: 5px 10px; margin-bottom: 4px; border-radius: 8px 8px 0 0;
  background: color-mix(in srgb, var(--onyx-raised, #1e2238) 92%, transparent);
  color: var(--muted-foreground); font-size: 11px !important; border-bottom: 1px solid var(--border);
}
.gk-code-fold-btn {
  border: 1px solid var(--card-border); background: var(--secondary); color: var(--foreground);
  border-radius: 6px; padding: 1px 7px; font-size: 10.5px !important; cursor: pointer;
}
pre.gk-code-collapsed {
  max-height: 240px !important; overflow: hidden !important;
  mask-image: linear-gradient(180deg, #000 74%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 74%, transparent 100%);
}
#\${CTX_MENU_ID} {
  position: fixed; z-index: 2147483646; min-width: 204px; padding: 6px; border-radius: 12px;
  background: var(--gk-popover-bg, var(--glass)); background-image: var(--gk-surface-sheen);
  color: var(--foreground); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);
  backdrop-filter: blur(14px); display: none; flex-direction: column; gap: 2px;
}
#\${CTX_MENU_ID}.is-open { display: flex; }
#\${CTX_MENU_ID} button {
  text-align: left; padding: 6px 10px; border: none; border-radius: 8px; background: transparent;
  color: inherit; font-size: 12px !important; cursor: pointer; display: flex; align-items: center; gap: 7px;
}
#\${CTX_MENU_ID} button:hover { background: var(--onyx-selected); }
      \`;
      document.head.appendChild(st);
      return st;
    }

    function applyThemeDom(activity) {
      const root = document.documentElement;
      if (!root) return;
      if (!cfg.enabled) {
        root.removeAttribute('data-gk-theme');
        root.removeAttribute('data-gk-scheme');
        root.removeAttribute('data-gk-radius');
        root.removeAttribute('data-gk-motion');
        root.removeAttribute('data-gk-focus');
        root.removeAttribute('data-gk-smooth');
        root.removeAttribute('data-gk-accent-on');
        root.removeAttribute('data-gk-wallpaper');
        const st = document.getElementById(THEME_STYLE_ID);
        if (st) st.remove();
        const au = document.getElementById(AURORA_HOST_ID);
        if (au) au.remove();
        const hs = document.getElementById(HOME_STAGE_ID);
        if (hs) hs.remove();
        syncWallpaperLayer();
        syncNightLamp();
        return;
      }

      ensureThemeStyleTag();
      const presetId = resolveEffectivePresetId();
      const presetObj = THEME_PRESETS[presetId] || THEME_PRESETS['nebula-day'];
      const roleId = resolveActiveRoleId(activity);
      const pal = ROLE_PALETTES[roleId] || ROLE_PALETTES.neon;

      root.setAttribute('data-gk-theme', presetId);
      root.setAttribute('data-gk-scheme', presetObj.scheme);
      root.setAttribute('data-gk-radius', cfg.cornerRadius || 'soft');
      root.setAttribute('data-gk-motion', cfg.motionLevel || 'standard');
      root.setAttribute('data-gk-focus', cfg.focusMode ? '1' : '0');
      root.setAttribute('data-gk-smooth', cfg.workbench?.smoothScroll !== false && getMotionEnabled() ? '1' : '0');
      root.setAttribute('data-gk-accent-on', cfg.accentMode === 'off' ? '0' : '1');
      root.setAttribute('data-gk-wallpaper', cfg.wallpaper?.mode && cfg.wallpaper.mode !== 'off' ? 'on' : 'off');

      const amp = Math.max(0.15, Math.min(1.2, (Number(cfg.ambientIntensity) || 75) / 100));
      root.style.setProperty('--gk-role-primary', pal.primary);
      root.style.setProperty('--gk-role-accent2', pal.accent2);
      root.style.setProperty('--gk-role-accent3', pal.accent3);
      root.style.setProperty('--gk-role-glow', pal.glow);
      root.style.setProperty('--gk-role-gradient', pal.gradient);
      root.style.setProperty('--gk-role-spark', pal.sparkColor || pal.primary);
      root.style.setProperty('--gk-aurora-1', pal.aurora1);
      root.style.setProperty('--gk-aurora-2', pal.aurora2);
      root.style.setProperty('--gk-aurora-3', pal.aurora3);
      root.style.setProperty('--gk-ambient-alpha', String(amp.toFixed(2)));

      syncConvAurora();
      syncHomeStage();
      syncWallpaperLayer();
      syncNightLamp();
      syncComposerBreath(activity);
      syncOutlineVisibility();
    }

    function syncConvAurora() {
      if (!cfg.enabled || cfg.focusMode || (cfg.wallpaper?.mode && cfg.wallpaper.mode !== 'off')) {
        const old = document.getElementById(AURORA_HOST_ID);
        if (old) old.remove();
        return;
      }
      const convView = document.querySelector('[data-testid="conversation-view"]');
      if (!convView || convView.getAttribute('data-has-browser-hole') === 'true') {
        const old = document.getElementById(AURORA_HOST_ID);
        if (old) old.remove();
        return;
      }
      let au = document.getElementById(AURORA_HOST_ID);
      if (!au) {
        au = document.createElement('div');
        au.id = AURORA_HOST_ID;
        convView.prepend(au);
      } else if (au.parentElement !== convView) {
        convView.prepend(au);
      }
    }

    function syncHomeStage() {
      const hasTurns = document.querySelectorAll('[data-testid="user-input-step"], [data-testid="user-message-bubble"]').length > 0;
      const homeEl = document.querySelector('.agy-home, [data-testid="home-greeting"]');
      const inputBox = document.getElementById('antigravity.agentSidePanelInputBox');
      const isHomeView = Boolean(cfg.enabled && !hasTurns && (homeEl || (inputBox && inputBox.getBoundingClientRect().top < window.innerHeight * 0.72)));

      let stage = document.getElementById(HOME_STAGE_ID);
      if (!isHomeView || !inputBox) {
        if (stage) stage.remove();
        return;
      }
      const parentWrap = inputBox.parentElement;
      if (!parentWrap) return;

      if (!stage) {
        stage = document.createElement('div');
        stage.id = HOME_STAGE_ID;
        stage.innerHTML = \`
          <div class="gk-home-stage-sub">✦ 欢迎回到基米窝 · 5 位哈基米已就位 ✦</div>
          <div class="gk-home-cast">
            \${HOME_ROLES.map((r) => \`
              <button type="button" class="gk-home-actor" data-home-role="\${r.id}" title="\${r.tip}">
                <img src="\${ctx.server}/gemineko-sprites/\${r.sprite}?v=0.5.0" alt="\${r.name}" />
                <span>\${r.name}</span>
              </button>
            \`).join('')}
          </div>
        \`;
        stage.querySelectorAll('img').forEach((img, idx) => {
          const rId = HOME_ROLES[idx]?.id || 'neon';
          img.addEventListener('error', () => {
            if (img.dataset.gkFallback === '1') return;
            img.dataset.gkFallback = '1';
            img.src = \`\${ctx.server}/gemineko-sprites/\${rId}-thinking.png?v=0.5.0\`;
          });
        });
        stage.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-home-role]');
          if (!btn) return;
          const rId = btn.getAttribute('data-home-role') || 'neon';
          onDockPoke(rId, e.clientX, e.clientY);
        });
        parentWrap.insertBefore(stage, inputBox);
      } else if (stage.nextElementSibling !== inputBox) {
        parentWrap.insertBefore(stage, inputBox);
      }
    }

    function spawnSendSparks() {
      if (!cfg.enabled || cfg.focusMode || cfg.motionLevel === 'off') return;
      const now = Date.now();
      if (now - lastSendSparkAt < 450) return;
      lastSendSparkAt = now;
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (!box) return;
      const r = box.getBoundingClientRect();
      const syms = ['✦', '🐾', '✧'];
      for (let i = 0; i < 3; i++) {
        const sp = document.createElement('span');
        sp.className = 'gk-send-spark';
        sp.textContent = syms[i % syms.length];
        sp.style.left = Math.round(r.right - 36 - i * 18) + 'px';
        sp.style.top = Math.round(r.top + 6) + 'px';
        sp.style.setProperty('--sx', Math.round((Math.random() - 0.5) * 28) + 'px');
        document.body?.appendChild(sp);
        setTimeout(() => { if (sp.isConnected) sp.remove(); }, 900);
      }
    }

    function syncComposerBreath(activity) {
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (!box) return;
      const target = box.closest('.surface-composer, .surface-composer-card') || box;
      const shouldGlow = Boolean(
        cfg.enabled &&
        getMotionEnabled() &&
        cfg.linkages?.composerBreathGlow !== false &&
        activity?.active
      );
      target.classList.toggle('gk-composer-glow-active', shouldGlow);
    }

    function syncWallpaperLayer() {
      let layer = document.getElementById(WP_LAYER_ID);
      const mode = cfg.enabled ? (cfg.wallpaper?.mode || 'off') : 'off';
      if (mode === 'off') {
        if (layer) layer.remove();
        return;
      }
      if (!layer) {
        layer = document.createElement('div');
        layer.id = WP_LAYER_ID;
        document.body?.prepend(layer);
      }
      layer.classList.add('is-visible');
      const op = Number(cfg.wallpaper?.opacity) || 0.22;
      const blur = Number(cfg.wallpaper?.blur) || 0;
      const scrim = Number(cfg.wallpaper?.scrim) || 0.35;
      const sig = \`\${mode}|\${cfg.wallpaper?.filePath || ''}|\${cfg.updatedAt || 0}\`;

      if (layer.getAttribute('data-sig') !== sig) {
        layer.setAttribute('data-sig', sig);
        layer.innerHTML = '';
        if (mode === 'builtin-starry') {
          const d = document.createElement('div');
          d.className = 'gk-wp-builtin-starry';
          layer.appendChild(d);
        } else if (mode === 'builtin-aurora') {
          const d = document.createElement('div');
          d.className = 'gk-wp-builtin-aurora';
          layer.appendChild(d);
        } else if (mode === 'custom' && cfg.wallpaper?.filePath) {
          const isVideo = /\.(mp4|webm)$/i.test(cfg.wallpaper.filePath);
          const url = \`\${ctx.server}/api/wallpaper/file?v=\${encodeURIComponent(String(cfg.updatedAt || Date.now()))}\`;
          if (isVideo) {
            const vid = document.createElement('video');
            vid.src = url;
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            layer.appendChild(vid);
            if (document.hidden || !document.hasFocus()) {
              try { vid.pause(); } catch {}
            }
          } else {
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            layer.appendChild(img);
          }
        }
        const scrimEl = document.createElement('div');
        scrimEl.className = 'gk-wp-scrim';
        layer.appendChild(scrimEl);
      }

      const media = layer.querySelector('img, video, .gk-wp-builtin-starry, .gk-wp-builtin-aurora');
      if (media) {
        media.style.opacity = String(op);
        media.style.filter = blur > 0 ? \`blur(\${blur}px) scale(1.03)\` : '';
      }
      const scrimEl = layer.querySelector('.gk-wp-scrim');
      if (scrimEl) {
        const isDark = document.documentElement.getAttribute('data-gk-scheme') === 'dark';
        scrimEl.style.background = isDark
          ? \`rgba(9, 10, 18, \${scrim})\`
          : \`rgba(248, 250, 252, \${scrim})\`;
      }
    }

    function onVisibilityOrFocus() {
      const vid = document.querySelector('#' + WP_LAYER_ID + ' video');
      if (!vid) return;
      if (document.hidden || !document.hasFocus()) {
        try { vid.pause(); } catch {}
      } else {
        try { vid.play()?.catch?.(() => {}); } catch {}
      }
    }

    function syncNightLamp() {
      let el = document.getElementById(NIGHT_LAYER_ID);
      const hr = new Date().getHours();
      const inNightWindow = hr >= 23 || hr < 5;
      const shouldShow = Boolean(
        cfg.enabled &&
        cfg.linkages?.nightLamp !== false &&
        (inNightWindow || cfg.linkages?.nightLampPreview)
      );
      if (!shouldShow) {
        if (el) el.classList.remove('is-visible');
        return;
      }
      if (!el) {
        el = document.createElement('div');
        el.id = NIGHT_LAYER_ID;
        document.body?.appendChild(el);
      }
      el.classList.add('is-visible');

      const todayKey = new Date().toISOString().slice(0, 10);
      if (inNightWindow && localStorage.getItem(NIGHT_TOAST_KEY) !== todayKey) {
        try { localStorage.setItem(NIGHT_TOAST_KEY, todayKey); } catch {}
        showSpeechBubble('夜深啦，基米窝小夜灯已温柔点亮，记得早点休息喵🌙', 4200);
      }
    }

    function triggerAuroraSweep(role) {
      if (!getMotionEnabled() || cfg.linkages?.roleSwitchAurora === false) return;
      const now = Date.now();
      if (now - lastSweepAt < 1200) return;
      lastSweepAt = now;
      let sweep = document.getElementById(AURORA_SWEEP_ID);
      if (!sweep) {
        sweep = document.createElement('div');
        sweep.id = AURORA_SWEEP_ID;
        document.body?.appendChild(sweep);
      }
      const pal = ROLE_PALETTES[role] || ROLE_PALETTES.neon;
      sweep.style.background = pal.gradient;
      sweep.classList.remove('is-sweeping');
      void sweep.offsetWidth;
      sweep.classList.add('is-sweeping');
    }

    function showSpeechBubble(text, duration = 2600) {
      const dock = document.getElementById(ctx.dockId);
      const rect = dock ? dock.getBoundingClientRect() : { left: 24, top: window.innerHeight - 130, width: 120 };
      document.querySelectorAll('.gk-speech-bubble').forEach((n) => n.remove());
      const b = document.createElement('div');
      b.className = 'gk-speech-bubble';
      b.textContent = text;
      b.style.left = Math.max(12, Math.min(window.innerWidth - 280, Math.round(rect.left + 8))) + 'px';
      b.style.top = Math.max(18, Math.round(rect.top - 52)) + 'px';
      b.addEventListener('click', () => b.remove());
      document.body?.appendChild(b);
      setTimeout(() => { if (b.isConnected) b.remove(); }, duration);
    }

    function spawnStardust(originX, originY, count = 14, mode = 'confetti') {
      if (cfg.focusMode && mode !== 'force') return;
      const icons = mode === 'paw' ? ['🐾', '✨', '⭐', '💫'] : ['✨', '⭐', '💖', '🌟'];
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'gk-stardust-particle';
        p.textContent = icons[i % icons.length];
        const x = mode === 'paw'
          ? Math.round(Math.random() * (window.innerWidth - 40) + 20)
          : Math.round(originX + (Math.random() - 0.5) * 180);
        const y = mode === 'paw'
          ? -12
          : Math.round(originY - 12 - Math.random() * 24);
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 90) + 'px');
        p.style.setProperty('--dy', (mode === 'paw' ? Math.round(window.innerHeight * 0.72 + Math.random() * 140) : Math.round(-50 - Math.random() * 65)) + 'px');
        p.style.setProperty('--rot', Math.round((Math.random() - 0.5) * 320) + 'deg');
        p.style.setProperty('--dur', (mode === 'paw' ? (1.8 + Math.random() * 0.9) : (0.9 + Math.random() * 0.4)).toFixed(2) + 's');
        document.body?.appendChild(p);
        setTimeout(() => { if (p.isConnected) p.remove(); }, mode === 'paw' ? 2900 : 1400);
      }
    }

    function triggerHiveParadeBurst(role, source = 'host') {
      const now = Date.now();
      if (now - lastBurstAt < 1800) return;
      lastBurstAt = now;
      if (cfg.focusMode && source === 'auto') return;

      document.querySelectorAll('.gk-parade-overlay, .gk-parade-banner').forEach((n) => n.remove());
      const banner = document.createElement('div');
      banner.className = 'gk-parade-banner';
      banner.textContent = '💥 捅了基米窝！5 位哈基米全员集结巡游喵~';
      document.body?.appendChild(banner);
      setTimeout(() => { if (banner.isConnected) banner.remove(); }, 3400);

      const overlay = document.createElement('div');
      overlay.className = 'gk-parade-overlay';
      const track = document.createElement('div');
      track.className = 'gk-parade-track';
      for (const r of ['neon', 'hydrogen', 'carbon', 'claude', 'gpt']) {
        const img = document.createElement('img');
        img.src = \`\${ctx.server}/gemineko-sprites/\${r}-running.png?v=0.5.0\`;
        img.alt = r;
        track.appendChild(img);
      }
      overlay.appendChild(track);
      document.body?.appendChild(overlay);
      setTimeout(() => { if (overlay.isConnected) overlay.remove(); }, 3700);

      spawnStardust(window.innerWidth / 2, window.innerHeight - 110, 22, 'force');
      if (source === 'host') {
        postEvent({ type: 'hive-poke-burst', role, combo: 5, source: 'host' });
      }
    }

    function postEvent(payload) {
      fetch(\`\${ctx.server}/api/theme/event\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sidecar-Token': ctx.token,
        },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    function persistPatch(patch) {
      fetch(\`\${ctx.server}/api/theme/config\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sidecar-Token': ctx.token,
        },
        body: JSON.stringify(patch),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.config) applyConfig(d.config);
        })
        .catch(() => {});
    }

    function onDockPoke(role, clientX, clientY) {
      const r = ROLE_PALETTES[role] ? role : 'neon';
      const pts = addIntimacy(r);
      const lines = ROLE_POKE_LINES[r] || ROLE_POKE_LINES.neon;
      const line = lines[pts % lines.length];
      showSpeechBubble(\`\${line}（亲密值 \${pts}）\`, 2600);

      const now = Date.now();
      pokeTimestamps = pokeTimestamps.filter((t) => now - t <= 3000);
      pokeTimestamps.push(now);
      if (pokeTimestamps.length >= 5 && cfg.linkages?.pokeBurst !== false) {
        pokeTimestamps = [];
        triggerHiveParadeBurst(r, 'host');
      } else {
        spawnStardust(clientX, clientY, 6, 'confetti');
      }
    }

    function onActivityUpdate(activity) {
      if (stopped || !activity) return;
      applyThemeDom(activity);

      const nextRole = activity.role || 'neon';
      if (lastRole && nextRole !== lastRole) {
        triggerAuroraSweep(nextRole);
      }
      lastRole = nextRole;

      const isActive = Boolean(activity.active);
      if (isActive && !lastActive) {
        activeSinceMs = Date.now();
      } else if (!isActive && lastActive) {
        const elapsed = Date.now() - activeSinceMs;
        if (
          elapsed >= 8000 &&
          !activity.hasError &&
          cfg.enabled &&
          cfg.linkages?.taskFinishConfetti !== false &&
          activity.turnCompletedAt !== lastTurnSig
        ) {
          lastTurnSig = activity.turnCompletedAt || String(Date.now());
          const dock = document.getElementById(ctx.dockId);
          const rect = dock ? dock.getBoundingClientRect() : { left: window.innerWidth * 0.4, top: window.innerHeight - 120 };
          spawnStardust(rect.left + 80, rect.top, 14, 'confetti');
        }
      }
      lastActive = isActive;

      if (
        activity.hasError &&
        activity.errorSeq &&
        activity.errorSeq !== lastErrorSeq &&
        cfg.enabled &&
        cfg.linkages?.errorHissShake !== false
      ) {
        lastErrorSeq = activity.errorSeq;
        const dock = document.getElementById(ctx.dockId);
        if (dock) {
          dock.classList.remove('gk-hiss-shake');
          void dock.offsetWidth;
          dock.classList.add('gk-hiss-shake');
        }
        showSpeechBubble('嘶哈——检测到工具报错啦，快来一起排查喵💢', 3200);
      }
    }

    function ensureMiniBar() {
      let bar = document.getElementById(MINI_BAR_ID);
      if (bar) return bar;
      bar = document.createElement('div');
      bar.id = MINI_BAR_ID;
      bar.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;">
          <span>🎨 基米窝主题快切</span>
          <button class="gk-mini-chip" data-act="open-workshop" title="在基米窝侧边栏打开完整工坊">完整工坊 ↗</button>
        </div>
        <div class="gk-mini-row" data-group="presets">
          <button class="gk-mini-chip" data-preset="auto">跟随宿主</button>
          <button class="gk-mini-chip" data-preset="nebula-day">星云冷白</button>
          <button class="gk-mini-chip" data-preset="cream-paper">奶油暖纸</button>
          <button class="gk-mini-chip" data-preset="starry-nest">星空猫窝</button>
          <button class="gk-mini-chip" data-preset="carbon-obsidian">碳晶黑曜</button>
        </div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-act="toggle-focus">专注编码 0fps</button>
          <button class="gk-mini-chip" data-act="toggle-enabled">启用主题</button>
          <button class="gk-mini-chip" data-act="burst">💥 捅基米窝</button>
        </div>
      \`;
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const preset = btn.getAttribute('data-preset');
        const act = btn.getAttribute('data-act');
        if (preset) {
          cfg = sanitizeLocalCfg({ ...cfg, enabled: true, preset });
          applyThemeDom(ctx.getActivity());
          syncMiniBarState();
          persistPatch({ enabled: true, preset });
        } else if (act === 'toggle-focus') {
          const next = !cfg.focusMode;
          cfg = sanitizeLocalCfg({ ...cfg, focusMode: next });
          applyThemeDom(ctx.getActivity());
          syncMiniBarState();
          persistPatch({ focusMode: next });
        } else if (act === 'toggle-enabled') {
          const next = !cfg.enabled;
          cfg = sanitizeLocalCfg({ ...cfg, enabled: next });
          applyThemeDom(ctx.getActivity());
          syncMiniBarState();
          persistPatch({ enabled: next });
        } else if (act === 'burst') {
          triggerHiveParadeBurst(lastRole || 'neon', 'host');
          bar.classList.remove('is-open');
        } else if (act === 'open-workshop') {
          postEvent({ type: 'open-workshop', role: lastRole || 'neon', source: 'host' });
          showSpeechBubble('已通知侧边栏「基米窝 → 主题工坊」✨', 2200);
          bar.classList.remove('is-open');
        }
      });
      document.body?.appendChild(bar);
      return bar;
    }

    function syncMiniBarState() {
      const bar = document.getElementById(MINI_BAR_ID);
      if (!bar) return;
      bar.querySelectorAll('[data-preset]').forEach((b) => {
        b.classList.toggle('is-active', cfg.enabled && b.getAttribute('data-preset') === cfg.preset);
      });
      const focusBtn = bar.querySelector('[data-act="toggle-focus"]');
      if (focusBtn) focusBtn.classList.toggle('is-active', Boolean(cfg.focusMode));
      const enBtn = bar.querySelector('[data-act="toggle-enabled"]');
      if (enBtn) enBtn.classList.toggle('is-active', Boolean(cfg.enabled));
    }

    function toggleMiniBar(anchorBtn) {
      const bar = ensureMiniBar();
      syncMiniBarState();
      const open = !bar.classList.contains('is-open');
      bar.classList.toggle('is-open', open);
      if (open && anchorBtn) {
        const r = anchorBtn.getBoundingClientRect();
        bar.style.left = Math.max(12, Math.min(window.innerWidth - 268, Math.round(r.left))) + 'px';
        bar.style.top = Math.max(18, Math.round(r.top - bar.offsetHeight - 10)) + 'px';
      }
    }

    function syncOutlineVisibility() {
      const show = Boolean(cfg.enabled && cfg.workbench?.pawOutline !== false);
      let fab = document.getElementById(OUTLINE_FAB_ID);
      let pop = document.getElementById(OUTLINE_POP_ID);
      if (!show) {
        if (fab) fab.remove();
        if (pop) pop.remove();
        return;
      }
      if (!fab) {
        fab = document.createElement('button');
        fab.id = OUTLINE_FAB_ID;
        fab.type = 'button';
        fab.title = '基米窝对话大纲（点击跳转历史提问）';
        fab.textContent = '🐾';
        fab.addEventListener('click', (e) => {
          e.stopPropagation();
          const p = ensureOutlinePop();
          const willOpen = !p.classList.contains('is-open');
          p.classList.toggle('is-open', willOpen);
          if (willOpen) refreshOutlineItems('');
        });
        document.body?.appendChild(fab);
      }
    }

    function ensureOutlinePop() {
      let pop = document.getElementById(OUTLINE_POP_ID);
      if (pop) return pop;
      pop = document.createElement('div');
      pop.id = OUTLINE_POP_ID;
      pop.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:12px;">
          <span>🐾 本轮对话大纲</span>
          <button type="button" style="border:none;background:transparent;color:inherit;cursor:pointer;" data-close="1">✕</button>
        </div>
        <input type="text" placeholder="过滤提问关键词..." />
        <div class="gk-outline-list"></div>
      \`;
      pop.querySelector('[data-close="1"]').addEventListener('click', () => pop.classList.remove('is-open'));
      pop.querySelector('input').addEventListener('input', (e) => refreshOutlineItems(e.target.value));
      document.body?.appendChild(pop);
      return pop;
    }

    function refreshOutlineItems(filterText) {
      const pop = document.getElementById(OUTLINE_POP_ID);
      if (!pop) return;
      const listEl = pop.querySelector('.gk-outline-list');
      const kw = String(filterText || '').trim().toLowerCase();
      const steps = Array.from(document.querySelectorAll('[data-testid="user-input-step"], [data-testid="user-message-bubble"]'));
      const seen = new Set();
      const items = [];
      for (const el of steps) {
        const wrap = el.closest('[data-testid="user-input-step"]') || el;
        if (seen.has(wrap)) continue;
        seen.add(wrap);
        const text = (wrap.textContent || '').replace(/\\s+/g, ' ').trim();
        if (!text) continue;
        if (kw && !text.toLowerCase().includes(kw)) continue;
        items.push({ el: wrap, text });
      }
      listEl.innerHTML = '';
      if (!items.length) {
        const empty = document.createElement('div');
        empty.style.opacity = '0.65';
        empty.style.fontSize = '11px';
        empty.textContent = '暂无匹配的提问记录喵~';
        listEl.appendChild(empty);
        return;
      }
      items.forEach((it, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gk-outline-item';
        btn.textContent = \`#\${idx + 1} \${it.text.slice(0, 48)}\`;
        btn.title = it.text.slice(0, 200);
        btn.addEventListener('click', () => {
          it.el.scrollIntoView({ behavior: getMotionEnabled() ? 'smooth' : 'auto', block: 'center' });
          it.el.classList.add('gk-outline-flash');
          setTimeout(() => it.el.classList.remove('gk-outline-flash'), 1100);
        });
        listEl.appendChild(btn);
      });
    }

    function decorateLongCodeBlocks() {
      if (!cfg.enabled || cfg.workbench?.codeBlockFold === false) return;
      const pres = document.querySelectorAll('pre');
      for (const pre of pres) {
        if (pre.getAttribute('data-gk-folded-ready') === '1') continue;
        if (pre.closest('.monaco-editor')) continue;
        const lines = (pre.textContent || '').split('\\n').length;
        if (lines < 32) {
          pre.setAttribute('data-gk-folded-ready', '1');
          continue;
        }
        pre.setAttribute('data-gk-folded-ready', '1');
        const bar = document.createElement('div');
        bar.className = 'gk-code-sticky-bar';
        const info = document.createElement('span');
        info.textContent = \`📜 代码片段 · \${lines} 行\`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gk-code-fold-btn';
        btn.textContent = '收起代码';
        btn.addEventListener('click', () => {
          const collapsed = pre.classList.toggle('gk-code-collapsed');
          btn.textContent = collapsed ? \`展开全部 (\${lines} 行)\` : '收起代码';
        });
        bar.appendChild(info);
        bar.appendChild(btn);
        pre.prepend(bar);
      }
    }

    function fillComposerText(snippet, append = false) {
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (!box) return;
      const editable = box.querySelector('[contenteditable="true"], textarea, input') || box;
      editable.focus();
      const cur = (editable.value !== undefined ? editable.value : editable.textContent) || '';
      const next = append && cur ? \`\${cur.trimEnd()} \${snippet}\` : snippet + cur;
      if (editable.value !== undefined) {
        editable.value = next;
        editable.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        document.execCommand?.('insertText', false, append ? (' ' + snippet) : snippet);
      }
    }

    function onDocumentContextMenu(e) {
      if (!cfg.enabled || cfg.workbench?.contextMenu === false) return;
      if (e.shiftKey) return;
      const target = e.target;
      if (!target || target.closest('input, textarea, [contenteditable="true"], .monaco-editor')) return;

      e.preventDefault();
      let menu = document.getElementById(CTX_MENU_ID);
      if (!menu) {
        menu = document.createElement('div');
        menu.id = CTX_MENU_ID;
        document.body?.appendChild(menu);
      }
      const selText = String(window.getSelection?.()?.toString() || '').trim();
      const candText = selText || (target.innerText || target.textContent || '').trim().slice(0, 160);
      const pathMatch = candText.match(/([A-Za-z]:\\\\[^\\s"'<>]+|\\/[A-Za-z0-9._\\/-]+\\.[A-Za-z0-9]+)/);
      const pickedPath = pathMatch ? pathMatch[1] : '';

      menu.innerHTML = \`
        <button type="button" data-c="btw">💬 /btw 侧边快问</button>
        <button type="button" data-c="copy">📋 \${selText ? '复制选中内容' : (pickedPath ? '复制识别路径' : '复制当前片段')}</button>
        <button type="button" data-c="ref">📎 作为 @引用填入输入框</button>
        <button type="button" data-c="theme">🎨 快速切换基米窝主题 / 专注档</button>
      \`;
      menu.onclick = (ev) => {
        const b = ev.target.closest('button');
        if (!b) return;
        const c = b.getAttribute('data-c');
        if (c === 'btw') {
          fillComposerText('/btw ', false);
        } else if (c === 'copy') {
          const val = selText || pickedPath || candText;
          if (val) navigator.clipboard?.writeText(val).catch(() => {});
          showSpeechBubble('已复制到剪贴板📋', 1600);
        } else if (c === 'ref') {
          const refVal = pickedPath ? \`@\${pickedPath}\` : (selText ? \`"\${selText.slice(0, 80)}"\` : '');
          if (refVal) fillComposerText(refVal, true);
        } else if (c === 'theme') {
          const dockBtn = document.querySelector('#' + ctx.dockId + ' .gk-dock-theme-btn');
          toggleMiniBar(dockBtn);
        }
        menu.classList.remove('is-open');
      };
      menu.classList.add('is-open');
      menu.style.left = Math.max(8, Math.min(window.innerWidth - 210, e.clientX)) + 'px';
      menu.style.top = Math.max(8, Math.min(window.innerHeight - 165, e.clientY)) + 'px';
    }

    function onGlobalClickCloseMenus(e) {
      if (e.target && e.target.closest('[data-testid="send-button"]')) {
        spawnSendSparks();
      }
      const menu = document.getElementById(CTX_MENU_ID);
      if (menu && !e.target.closest('#' + CTX_MENU_ID)) {
        menu.classList.remove('is-open');
      }
      const bar = document.getElementById(MINI_BAR_ID);
      if (bar && !e.target.closest('#' + MINI_BAR_ID) && !e.target.closest('.gk-dock-theme-btn')) {
        bar.classList.remove('is-open');
      }
      const pop = document.getElementById(OUTLINE_POP_ID);
      if (pop && !e.target.closest('#' + OUTLINE_POP_ID) && !e.target.closest('#' + OUTLINE_FAB_ID)) {
        pop.classList.remove('is-open');
      }
    }

    function onKeyDownComposerOrEgg(e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        const box = document.getElementById('antigravity.agentSidePanelInputBox');
        if (box && e.target && box.contains(e.target)) {
          spawnSendSparks();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && String(e.key || '').toLowerCase() === 'm') {
        e.preventDefault();
        spawnStardust(window.innerWidth / 2, 0, 20, 'paw');
        showSpeechBubble('🐾 爪印星尘雨降临基米窝！', 2200);
        return;
      }
      if (e.key === KONAMI_SEQ[konamiIdx]) {
        konamiIdx += 1;
        if (konamiIdx >= KONAMI_SEQ.length) {
          konamiIdx = 0;
          triggerHiveParadeBurst(lastRole || 'neon', 'host');
        }
      } else {
        konamiIdx = 0;
      }
    }

    function applyConfig(nextCfg) {
      cfg = sanitizeLocalCfg(nextCfg);
      applyThemeDom(ctx.getActivity());
      syncMiniBarState();
    }

    function triggerEvent(evt) {
      if (!evt || !evt.type) return;
      if (evt.type === 'hive-poke-burst') {
        triggerHiveParadeBurst(evt.role || 'neon', 'sidecar');
      } else if (evt.type === 'stardust-rain') {
        spawnStardust(window.innerWidth / 2, 0, 22, 'paw');
        showSpeechBubble('✨ 来自侧边栏的爪印星尘雨~', 2200);
      }
    }

    schemeObserver = new MutationObserver(() => {
      if (!stopped && cfg.enabled && cfg.preset === 'auto') {
        const nextPreset = resolveEffectivePresetId();
        if (document.documentElement.getAttribute('data-gk-theme') !== nextPreset) {
          applyThemeDom(ctx.getActivity());
        }
      }
    });
    if (document.documentElement) {
      schemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }

    workbenchTimer = setInterval(() => {
      if (!stopped) {
        decorateLongCodeBlocks();
        if (cfg.enabled) {
          syncConvAurora();
          syncHomeStage();
        }
      }
    }, 1200);
    nightTimer = setInterval(() => {
      if (!stopped) syncNightLamp();
    }, 60_000);

    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);
    window.addEventListener('blur', onVisibilityOrFocus);
    document.addEventListener('contextmenu', onDocumentContextMenu);
    document.addEventListener('click', onGlobalClickCloseMenus, true);
    window.addEventListener('keydown', onKeyDownComposerOrEgg, true);

    applyConfig(cfg);
    decorateLongCodeBlocks();

    const api = { applyConfig, onActivityUpdate, onDockPoke, triggerEvent, toggleMiniBar, unmount };
    window.__GEMINEKO_THEME_API__ = api;

    function unmount() {
      stopped = true;
      if (schemeObserver) schemeObserver.disconnect();
      if (workbenchTimer) clearInterval(workbenchTimer);
      if (nightTimer) clearInterval(nightTimer);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      window.removeEventListener('blur', onVisibilityOrFocus);
      document.removeEventListener('contextmenu', onDocumentContextMenu);
      document.removeEventListener('click', onGlobalClickCloseMenus, true);
      window.removeEventListener('keydown', onKeyDownComposerOrEgg, true);

      for (const id of [THEME_STYLE_ID, WP_LAYER_ID, AURORA_HOST_ID, HOME_STAGE_ID, NIGHT_LAYER_ID, AURORA_SWEEP_ID, OUTLINE_FAB_ID, OUTLINE_POP_ID, CTX_MENU_ID, MINI_BAR_ID]) {
        const el = document.getElementById(id);
        if (el) el.remove();
      }
      document.querySelectorAll('.gk-speech-bubble, .gk-stardust-particle, .gk-send-spark, .gk-parade-overlay, .gk-parade-banner').forEach((n) => n.remove());
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (box) {
        const target = box.closest('.surface-composer, .surface-composer-card') || box;
        target.classList.remove('gk-composer-glow-active');
      }
      const root = document.documentElement;
      if (root) {
        for (const attr of ['data-gk-theme','data-gk-scheme','data-gk-radius','data-gk-motion','data-gk-focus','data-gk-smooth','data-gk-accent-on','data-gk-wallpaper']) {
          root.removeAttribute(attr);
        }
        for (const prop of ['--gk-role-primary','--gk-role-accent2','--gk-role-accent3','--gk-role-glow','--gk-role-gradient','--gk-role-spark','--gk-aurora-1','--gk-aurora-2','--gk-aurora-3','--gk-ambient-alpha']) {
          root.style.removeProperty(prop);
        }
      }
      window.__GEMINEKO_THEME_API__ = null;
    }

    return api;
  }
  `;
}
