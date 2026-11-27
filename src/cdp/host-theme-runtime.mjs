/**
 * @file Antigravity 主窗口「5 角色二次元视觉母题 × 光学玻璃质感 × 哈基米星空猫窝」全量皮肤与联动彩蛋引擎
 * 参考真实宿主 CSS Token 与 data-testid 选择器深度适配全界面，零修改 app.asar。
 */

import { DEFAULT_HOST_THEME_CONFIG, ROLE_PALETTES, THEME_PRESETS } from '../theme/host-theme-config.mjs';

function pawGroupSvg(x, y, rot, scale = 1) {
  return [
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">`,
    '<ellipse cx="0" cy="4.2" rx="7.8" ry="5.6"/>',
    '<circle cx="-7.4" cy="-3.6" r="2.6"/>',
    '<circle cx="-2.4" cy="-6.4" r="2.7"/>',
    '<circle cx="2.7" cy="-6.3" r="2.7"/>',
    '<circle cx="7.5" cy="-3.4" r="2.6"/>',
    '</g>',
  ].join('');
}

function star4Path(cx, cy, outerR, innerR = outerR * 0.22) {
  return `M${cx} ${cy - outerR} Q${cx + innerR} ${cy - innerR} ${cx + outerR} ${cy} Q${cx + innerR} ${cy + innerR} ${cx} ${cy + outerR} Q${cx - innerR} ${cy + innerR} ${cx - outerR} ${cy} Q${cx - innerR} ${cy - innerR} ${cx} ${cy - outerR} Z`;
}

/**
 * 为 5 位社区角色构建独有的二次元几何+猫窝平铺 SVG 底纹。
 * @param {'neon'|'hydrogen'|'carbon'|'claude'|'gpt'} roleId
 * @param {string} ink
 * @param {string} accent
 * @param {string} accent2
 */
function buildRoleMotifPattern(roleId, ink, accent, accent2) {
  const shapes = [];
  if (roleId === 'neon') {
    // 炫彩虹光双飘带 + 双色凹四角星芒 + 肉垫
    shapes.push(`<path d="M-12 36 Q36 8 84 36 T180 36" stroke="${accent}" stroke-width="2.2" fill="none"/>`);
    shapes.push(`<path d="M-12 114 Q36 142 84 114 T180 114" stroke="${accent2}" stroke-width="1.8" fill="none"/>`);
    shapes.push(`<g fill="${ink}">${pawGroupSvg(36, 44, -14, 0.96)}${pawGroupSvg(118, 122, 16, 0.88)}</g>`);
    shapes.push(`<path d="${star4Path(112, 38, 15, 3.2)}" fill="${accent}"/>`);
    shapes.push(`<path d="${star4Path(34, 118, 10, 2.2)}" fill="${accent2}"/>`);
  } else if (roleId === 'hydrogen') {
    // 薰衣草粉金星云环 + 星辰碎芒 + 软萌肉垫
    shapes.push(`<circle cx="80" cy="80" r="46" stroke="${ink}" stroke-width="1.4" stroke-dasharray="6 8" fill="none"/>`);
    shapes.push(`<circle cx="30" cy="24" r="3" fill="${accent}"/><circle cx="130" cy="126" r="2.6" fill="${accent2}"/>`);
    shapes.push(`<g fill="${ink}">${pawGroupSvg(40, 44, -12, 0.92)}${pawGroupSvg(120, 118, 15, 0.85)}</g>`);
    shapes.push(`<path d="${star4Path(116, 40, 14, 3)}" fill="${accent}"/>`);
    shapes.push(`<path d="${star4Path(34, 122, 11, 2.4)}" fill="${accent2}"/>`);
  } else if (roleId === 'carbon') {
    // 石墨烯正六边形晶格 + 五彩黑棱形晶钻 + 四角星
    shapes.push(`<polygon points="80,18 118,40 118,84 80,106 42,84 42,40" stroke="${ink}" stroke-width="1.8" fill="none"/>`);
    shapes.push(`<polygon points="80,32 104,46 104,78 80,92 56,78 56,46" stroke="${accent}" stroke-width="1.1" fill="none"/>`);
    shapes.push(`<polygon points="24,114 34,126 24,138 14,126" fill="${accent2}"/>`);
    shapes.push(`<path d="${star4Path(128, 118, 12, 2.6)}" fill="${accent}"/>`);
    shapes.push(`<g fill="${ink}">${pawGroupSvg(80, 62, -8, 0.88)}</g>`);
  } else if (roleId === 'claude') {
    // 暖奶油四叶菊瓣 + 菱格蕾丝圆点 + 肉垫
    shapes.push(`<circle cx="24" cy="24" r="2.2" fill="${accent}"/><circle cx="136" cy="24" r="2.2" fill="${accent}"/><circle cx="24" cy="136" r="2.2" fill="${accent}"/><circle cx="136" cy="136" r="2.2" fill="${accent}"/>`);
    shapes.push(`<path d="M112 24 C119 24 119 37 112 37 C105 37 105 24 112 24 M112 37 C119 37 119 50 112 50 C105 50 105 37 112 37 M99 37 C99 30 112 30 112 37 C112 44 99 44 99 37 M112 37 C112 30 125 30 125 37 C125 44 112 44 112 37" stroke="${accent}" stroke-width="1.4" fill="none"/>`);
    shapes.push(`<g fill="${ink}">${pawGroupSvg(42, 46, -15, 0.94)}${pawGroupSvg(114, 118, 16, 0.86)}</g>`);
    shapes.push(`<path d="${star4Path(38, 116, 10, 2.2)}" fill="${accent2}"/>`);
  } else {
    // gpt: 白紫弧形龙鳞纹 + 空心菱星
    shapes.push(`<path d="M0 44 Q40 80 80 44 Q120 80 160 44" stroke="${ink}" stroke-width="1.6" fill="none"/>`);
    shapes.push(`<path d="M0 118 Q40 154 80 118 Q120 154 160 118" stroke="${accent}" stroke-width="1.5" fill="none"/>`);
    shapes.push(`<polygon points="118,22 128,36 118,50 108,36" stroke="${accent2}" stroke-width="1.6" fill="none"/>`);
    shapes.push(`<g fill="${ink}">${pawGroupSvg(40, 44, -10, 0.90)}${pawGroupSvg(118, 116, 14, 0.85)}</g>`);
    shapes.push(`<path d="${star4Path(36, 112, 11, 2.4)}" fill="${accent}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">${shapes.join('')}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function buildRolePatternMap() {
  const out = {};
  for (const [id, pal] of Object.entries(ROLE_PALETTES)) {
    out[id] = {
      vividLight: buildRoleMotifPattern(id, pal.patternInkLight, pal.primary + '2e', pal.accent2 + '2a'),
      vividDark: buildRoleMotifPattern(id, pal.patternInkDark, pal.primary + '38', pal.accent2 + '33'),
      balancedLight: buildRoleMotifPattern(id, pal.primary + '14', pal.primary + '16', pal.accent2 + '14'),
      balancedDark: buildRoleMotifPattern(id, pal.accent2 + '18', pal.primary + '1d', pal.accent2 + '18'),
    };
  }
  return out;
}

/** 生成 5 位角色专属大型 SVG 矢量旋转纹章源码 */
function buildRoleCrestSvgMap() {
  const out = {};
  for (const [id, pal] of Object.entries(ROLE_PALETTES)) {
    let inner = '';
    if (id === 'carbon') {
      inner = [
        `<polygon points="130,22 223,76 223,184 130,238 37,184 37,76" stroke="${pal.primary}" stroke-width="2" fill="none" opacity="0.72"/>`,
        `<polygon points="130,38 209,84 209,176 130,222 51,176 51,84" stroke="${pal.accent2}" stroke-width="1.3" stroke-dasharray="6 6" fill="none" opacity="0.68"/>`,
      ].join('');
    } else if (id === 'claude') {
      inner = [
        `<circle cx="130" cy="130" r="102" stroke="${pal.primary}" stroke-width="1.8" stroke-dasharray="10 6" fill="none" opacity="0.7"/>`,
        `<circle cx="130" cy="130" r="88" stroke="${pal.accent2}" stroke-width="1.4" stroke-dasharray="3 9" fill="none" opacity="0.72"/>`,
      ].join('');
    } else if (id === 'gpt') {
      inner = [
        `<circle cx="130" cy="130" r="100" stroke="${pal.primary}" stroke-width="2" stroke-dasharray="18 8 4 8" fill="none" opacity="0.74"/>`,
        `<polygon points="130,16 244,130 130,244 16,130" stroke="${pal.accent2}" stroke-width="1.4" fill="none" opacity="0.6"/>`,
      ].join('');
    } else {
      inner = [
        `<circle cx="130" cy="130" r="102" stroke="${pal.primary}" stroke-width="2" stroke-dasharray="22 8 6 8" fill="none" opacity="0.74"/>`,
        `<circle cx="130" cy="130" r="86" stroke="${pal.accent2}" stroke-width="1.4" stroke-dasharray="4 10" fill="none" opacity="0.66"/>`,
      ].join('');
    }
    const stars = [
      `<path d="${star4Path(130, 14, 10, 2.3)}" fill="${pal.primary}"/>`,
      `<path d="${star4Path(246, 130, 10, 2.3)}" fill="${pal.accent2}"/>`,
      `<path d="${star4Path(130, 246, 10, 2.3)}" fill="${pal.accent3}"/>`,
      `<path d="${star4Path(14, 130, 10, 2.3)}" fill="${pal.primary}"/>`,
    ].join('');
    out[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" fill="none">${inner}${stars}</svg>`;
  }
  return out;
}

/** 生成 5 位角色专属 18×18 高对比旋转状态星徽 SVG data URI */
function buildRoleSpinnerSvgMap() {
  const out = {};
  for (const [id, pal] of Object.entries(ROLE_PALETTES)) {
    let body = '';
    if (id === 'neon') {
      body = [
        `<circle cx="10" cy="10" r="8" stroke="${pal.primary}" stroke-width="1.4" stroke-dasharray="6 3" opacity="0.85"/>`,
        `<path d="${star4Path(10, 10, 7.2, 2.0)}" fill="${pal.accent2}" stroke="#ffffff" stroke-width="0.65"/>`,
        `<circle cx="10" cy="10" r="2.1" fill="${pal.accent3}"/>`,
      ].join('');
    } else if (id === 'hydrogen') {
      body = [
        `<circle cx="10" cy="10" r="7.8" stroke="${pal.primary}" stroke-width="1.35" stroke-dasharray="10 4" opacity="0.85"/>`,
        `<path d="${star4Path(10, 10, 6.8, 1.9)}" fill="${pal.primary}" stroke="#ffffff" stroke-width="0.6"/>`,
        `<path d="${star4Path(15.5, 4.5, 2.8, 0.8)}" fill="${pal.accent3}"/>`,
      ].join('');
    } else if (id === 'carbon') {
      body = [
        `<polygon points="10,1.8 17.1,5.9 17.1,14.1 10,18.2 2.9,14.1 2.9,5.9" stroke="${pal.primary}" stroke-width="1.5" fill="${pal.primary}" fill-opacity="0.16"/>`,
        `<polygon points="10,4.8 14.5,10 10,15.2 5.5,10" fill="${pal.accent2}" stroke="${pal.accent3}" stroke-width="0.7"/>`,
      ].join('');
    } else if (id === 'claude') {
      body = [
        `<path d="M10 2.5 C12.2 2.5 12.2 7.8 10 7.8 C7.8 7.8 7.8 2.5 10 2.5 M10 12.2 C12.2 12.2 12.2 17.5 10 17.5 C7.8 17.5 7.8 12.2 10 12.2 M2.5 10 C2.5 7.8 7.8 7.8 7.8 10 C7.8 12.2 2.5 12.2 2.5 10 M12.2 10 C12.2 7.8 17.5 7.8 17.5 10 C17.5 12.2 12.2 12.2 12.2 10" fill="${pal.primary}" stroke="#ffffff" stroke-width="0.55"/>`,
        `<circle cx="10" cy="10" r="2.3" fill="${pal.accent2}"/>`,
      ].join('');
    } else {
      body = [
        `<circle cx="10" cy="10" r="7.8" stroke="${pal.primary}" stroke-width="1.35" stroke-dasharray="4 3" opacity="0.88"/>`,
        `<polygon points="10,2.6 17.4,10 10,17.4 2.6,10" stroke="${pal.accent2}" stroke-width="1.25" fill="${pal.primary}" fill-opacity="0.22"/>`,
        `<circle cx="10" cy="10" r="2.3" fill="${pal.accent3}"/>`,
      ].join('');
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">${body}</svg>`;
    out[id] = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }
  return out;
}

/** 生成 5 位角色配色 Q 弹发光小猫肉垫 SVG data URI */
function buildPawSpinnerSvgMap() {
  const out = {};
  for (const [id, pal] of Object.entries(ROLE_PALETTES)) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">',
      `<ellipse cx="10" cy="13.2" rx="4.8" ry="3.6" fill="${pal.primary}" stroke="#ffffff" stroke-width="0.7"/>`,
      `<circle cx="5.0" cy="7.9" r="1.75" fill="${pal.accent2}"/>`,
      `<circle cx="8.4" cy="5.7" r="1.85" fill="${pal.primary}"/>`,
      `<circle cx="11.7" cy="5.7" r="1.85" fill="${pal.accent2}"/>`,
      `<circle cx="15.0" cy="7.9" r="1.75" fill="${pal.accent3}"/>`,
      '</svg>',
    ].join('');
    out[id] = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }
  return out;
}

/** 左上角《基米窝》纯白发光猫爪×星芒矢量徽标（叠加在流动炫彩宝石底座之上） */
function buildTopBrandPawUri() {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">',
    '<path d="M12 12.2c-2.6 0-4.6 1.75-4.6 3.9 0 1.45 1.15 2.45 2.7 2.45.78 0 1.38-.22 1.9-.22s1.12.22 1.9.22c1.55 0 2.7-1 2.7-2.45 0-2.15-2-3.9-4.6-3.9Z" fill="#ffffff"/>',
    '<circle cx="6.7" cy="10.8" r="1.45" fill="#ffffff"/>',
    '<circle cx="9.9" cy="8.5" r="1.55" fill="#ffffff"/>',
    '<circle cx="14.1" cy="8.5" r="1.55" fill="#ffffff"/>',
    '<circle cx="17.3" cy="10.8" r="1.45" fill="#ffffff"/>',
    '<path d="M19.2 2.4L19.85 4.35L21.8 5L19.85 5.65L19.2 7.6L18.55 5.65L16.6 5L18.55 4.35Z" fill="#FFFBEB"/>',
    '</svg>',
  ].join('');
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/** 空白首页正中央 64×64 炫彩猫耳×星芒肉垫水晶徽标 */
function buildHomeBrandCatUri() {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">',
    '<defs>',
    '<linearGradient id="gkhg" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">',
    '<stop offset="0%" stop-color="#38BDF8"/>',
    '<stop offset="36%" stop-color="#8B5CF6"/>',
    '<stop offset="72%" stop-color="#EC4899"/>',
    '<stop offset="100%" stop-color="#F59E0B"/>',
    '</linearGradient>',
    '<linearGradient id="gkhc" x1="16" y1="22" x2="48" y2="52" gradientUnits="userSpaceOnUse">',
    '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96"/>',
    '<stop offset="100%" stop-color="#E0E7FF" stop-opacity="0.88"/>',
    '</linearGradient>',
    '</defs>',
    '<path d="M14 27L17.5 11.5C18.1 9.1 20.9 8.4 22.6 10.1L29.5 17.2C31.1 16.9 32.9 16.9 34.5 17.2L41.4 10.1C43.1 8.4 45.9 9.1 46.5 11.5L50 27C52.6 31.2 53.6 36.2 51.8 41.2C49.2 48.3 41.4 53 32 53C22.6 53 14.8 48.3 12.2 41.2C10.4 36.2 11.4 31.2 14 27Z" fill="url(#gkhg)" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>',
    '<path d="M20.2 21.5L21.5 14.5L26.2 19.3" fill="#FDF2F8" fill-opacity="0.72"/>',
    '<path d="M43.8 21.5L42.5 14.5L37.8 19.3" fill="#E0F2FE" fill-opacity="0.72"/>',
    '<ellipse cx="32" cy="39.2" rx="7.6" ry="5.6" fill="url(#gkhc)"/>',
    '<circle cx="22.6" cy="32.2" r="2.3" fill="#FFFFFF"/>',
    '<circle cx="28.6" cy="29.0" r="2.45" fill="#FFFFFF"/>',
    '<circle cx="35.4" cy="29.0" r="2.45" fill="#FFFFFF"/>',
    '<circle cx="41.4" cy="32.2" r="2.3" fill="#FFFFFF"/>',
    '<path d="M51 8.5L52.2 12.1L55.8 13.3L52.2 14.5L51 18.1L49.8 14.5L46.2 13.3L49.8 12.1Z" fill="#F59E0B"/>',
    '</svg>',
  ].join('');
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/**
 * 构造在宿主 Renderer 浏览器上下文执行的主题、全组件重绘与联动彩蛋代码片段（定义 initHostThemeSuite）。
 * @returns {string}
 */
export function buildHostThemeRuntimeSnippet() {
  const presetsJson = JSON.stringify(THEME_PRESETS);
  const palettesJson = JSON.stringify(ROLE_PALETTES);
  const defaultCfgJson = JSON.stringify(DEFAULT_HOST_THEME_CONFIG);
  const rolePatternsJson = JSON.stringify(buildRolePatternMap());
  const roleCrestsJson = JSON.stringify(buildRoleCrestSvgMap());
  const roleSpinnersJson = JSON.stringify(buildRoleSpinnerSvgMap());
  const pawSpinnersJson = JSON.stringify(buildPawSpinnerSvgMap());
  const topBrandPawJson = JSON.stringify(buildTopBrandPawUri());
  const homeBrandCatJson = JSON.stringify(buildHomeBrandCatUri());

  return `
  function initHostThemeSuite(ctx) {
    const THEME_PRESETS = ${presetsJson};
    const ROLE_PALETTES = ${palettesJson};
    const DEFAULT_CFG = ${defaultCfgJson};
    const ROLE_PATTERNS = ${rolePatternsJson};
    const ROLE_CREST_SVGS = ${roleCrestsJson};
    const ROLE_SPINNERS = ${roleSpinnersJson};
    const PAW_SPINNERS = ${pawSpinnersJson};
    const TOP_BRAND_PAW_URI = ${topBrandPawJson};
    const HOME_BRAND_CAT_URI = ${homeBrandCatJson};
    const THEME_STYLE_ID = 'gemineko-host-theme-v5';
    const WP_LAYER_ID = 'gemineko-wallpaper-layer';
    const AURORA_HOST_ID = 'gemineko-conv-aurora';
    const WATERMARK_ID = 'gemineko-corner-watermark';
    const HOME_STAGE_ID = 'gemineko-home-stage';
    const HOME_EMBLEM_ID = 'gemineko-home-emblem';
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
    const RIM_TARGETS_SEL = '.surface-composer-card, div:has(> [data-testid="overview-panel"]), [data-testid="new-conversation-button"], [data-testid="user-message-bubble"], .agy-user-bubble, [data-testid="conversation-row-sidebar"][data-selected="true"]';
    const litRimEls = new Set();
    let rimRafId = 0;
    let lastPtrX = -9999;
    let lastPtrY = -9999;

    function sanitizeLocalCfg(input) {
      const c = input && typeof input === 'object' ? input : {};
      return {
        ...DEFAULT_CFG,
        ...c,
        watermark: { ...DEFAULT_CFG.watermark, ...(c.watermark || {}) },
        i18n: { ...DEFAULT_CFG.i18n, ...(c.i18n || {}) },
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
  --focus-ring-color: color-mix(in srgb, var(--gk-role-primary) 50%, transparent) !important;
  --nux-focus-ring: color-mix(in srgb, var(--gk-role-primary) 56%, transparent) !important;
}

/* === 1. 全局表面与角色母题底纹（修复内层 bg-sidebar 覆盖、保留 Browser Hole 透明） === */
html[data-gk-theme] > body:not([data-has-browser-hole="true"]) {
  background-color: var(--body-background, var(--background)) !important;
  color: var(--foreground) !important;
}
html[data-gk-theme] :is(.agy-shell, .agy-sheet, [data-testid="sidecar-iframe-slot"], iframe[data-testid="sidecar-iframe"]):not([data-has-browser-hole="true"]) {
  background-color: var(--content, var(--background)) !important;
}
html[data-gk-theme] :is(.bg-sidebar, aside.bg-sidebar, div.bg-sidebar, [class*="bg-sidebar"]):not([data-has-browser-hole="true"]) {
  background-color: color-mix(in srgb, var(--sidebar) 90%, var(--gk-role-primary, #8b5cf6) 10%) !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]):not([data-gk-intensity="optical-neko"]):not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) :is(aside.bg-sidebar, div.h-full.bg-sidebar):not([data-has-browser-hole="true"]) {
  background-image: var(--gk-catnest-pattern), linear-gradient(180deg, var(--gk-role-tint, rgba(99,102,241,0.08)) 0%, transparent 45%, var(--gk-role-tint, rgba(99,102,241,0.06)) 100%) !important;
  background-size: 160px 160px, 100% 100% !important;
  background-repeat: repeat, no-repeat !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) :is(aside.bg-sidebar, div.h-full.bg-sidebar):not([data-has-browser-hole="true"]) {
  background-image:
    radial-gradient(110% 34% at 15% 0%, color-mix(in srgb, var(--gk-role-primary) 13%, transparent), transparent 72%),
    radial-gradient(120% 38% at 50% 100%, color-mix(in srgb, var(--gk-role-accent2) 11%, transparent), transparent 75%) !important;
  background-repeat: no-repeat !important;
}
html[data-gk-theme] .bg-sidebar :is([class*="bg-sidebar"], [data-testid="section-header"]) {
  background-image: none !important;
}
html[data-gk-theme][data-gk-intensity="vivid"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) [data-testid="conversation-view"]:not([data-has-browser-hole="true"]),
html[data-gk-theme][data-gk-intensity="vivid"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) .agy-home:not([data-has-browser-hole="true"]) {
  position: relative !important;
  isolation: isolate !important;
  background-color: var(--content, var(--background)) !important;
  background-image: var(--gk-catnest-pattern) !important;
  background-size: 160px 160px !important;
  background-repeat: repeat !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) [data-testid="conversation-view"]:not([data-has-browser-hole="true"]),
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) .agy-home:not([data-has-browser-hole="true"]) {
  position: relative !important;
  isolation: isolate !important;
  background-color: var(--content, var(--background)) !important;
  background-image: none !important;
}
/* 光学高定：柔和星绒主按钮与通透光影层次 */
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="new-conversation-button"] {
  background: linear-gradient(135deg, color-mix(in srgb, var(--gk-role-primary) 88%, #ffffff 12%), color-mix(in srgb, var(--gk-role-accent2) 82%, var(--gk-role-primary) 18%)) !important;
  box-shadow: 0 10px 26px -10px var(--gk-role-glow), inset 0 1px 0 rgba(255,255,255,0.58) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] :is(div:has(> [data-testid="overview-panel"]), [data-testid="overview-panel-host-sibling"]) {
  background: color-mix(in srgb, var(--glass) 88%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 26%, var(--glass-border)) !important;
  box-shadow: 0 22px 54px -18px rgba(15, 23, 42, 0.22), 0 8px 24px -12px var(--gk-role-glow), inset 0 1px 0 var(--gk-specular) !important;
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
  background: linear-gradient(180deg, var(--gk-role-primary), var(--gk-role-accent2), transparent) !important;
  opacity: 0.35;
}

/* === 2. 顶部菜单栏 & 工具栏 === */
html[data-gk-theme] [data-testid="title-menu-bar"] {
  position: relative !important;
  background: linear-gradient(90deg, color-mix(in srgb, var(--sidebar) 88%, var(--gk-role-primary) 12%), color-mix(in srgb, var(--sidebar) 92%, var(--gk-role-accent2) 8%)) !important;
  border-bottom: 1px solid color-mix(in srgb, var(--gk-role-primary) 24%, var(--border)) !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="title-menu-bar"]::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2.5px;
  pointer-events: none;
  background: var(--gk-role-gradient);
  opacity: 0.92;
}
html[data-gk-theme] [data-testid="title-menu-bar-item"] {
  border-radius: 7px !important;
  transition: background-color 0.14s ease, color 0.14s ease, transform 0.14s var(--gk-ease-spring) !important;
}
html[data-gk-theme] [data-testid="title-menu-bar-item"]:hover {
  background: color-mix(in srgb, var(--gk-role-primary) 15%, var(--card)) !important;
  color: var(--gk-role-primary) !important;
}
html[data-gk-theme] [data-testid="pane-titlebar-toolbar"] {
  background: color-mix(in srgb, var(--content) 82%, var(--gk-role-primary) 6%) !important;
  border-bottom: 1px solid color-mix(in srgb, var(--gk-role-primary) 18%, var(--border)) !important;
}

/* === 3. 左侧边栏按钮、项目头与选中项 === */
html[data-gk-theme] [data-testid="new-conversation-button"] {
  background: var(--gk-role-gradient) !important;
  color: #ffffff !important;
  border: 1px solid color-mix(in srgb, #ffffff 36%, transparent) !important;
  border-radius: var(--gk-r-md, 10px) !important;
  font-weight: 700 !important;
  box-shadow: 0 6px 16px -6px var(--gk-role-glow), inset 0 1px 0 rgba(255,255,255,0.45) !important;
  transition: transform 0.18s var(--gk-ease-spring), box-shadow 0.2s ease, filter 0.18s ease !important;
}
html[data-gk-theme] [data-testid="new-conversation-button"]:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
  box-shadow: 0 10px 22px -6px var(--gk-role-glow), inset 0 1px 0 rgba(255,255,255,0.6) !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="new-conversation-button"]::before {
  content: "✦";
  margin-right: 5px;
  font-size: 11px;
  filter: drop-shadow(0 0 4px rgba(255,255,255,0.85));
}
html[data-gk-theme] [data-testid="project-header"] {
  position: relative !important;
  border-radius: var(--gk-r-md, 8px) !important;
  background: color-mix(in srgb, var(--card) 56%, var(--gk-role-tint, transparent)) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 20%, transparent) !important;
  padding-left: 10px !important;
}
html[data-gk-theme] [data-testid="project-header"]::before {
  content: "";
  position: absolute;
  left: 3px;
  top: 22%;
  bottom: 22%;
  width: 3px;
  border-radius: 999px;
  background: var(--gk-role-gradient);
}
html[data-gk-theme] :is([data-testid="automations-button"], [data-testid="settings-button"]) {
  border-radius: var(--gk-r-md, 9px) !important;
  transition: background-color 0.16s ease, border-color 0.16s ease !important;
}
html[data-gk-theme] :is([data-testid="automations-button"], [data-testid="settings-button"]):hover {
  background: color-mix(in srgb, var(--gk-role-primary) 13%, var(--card)) !important;
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row) {
  position: relative !important;
  border-radius: var(--gk-r-md, 9px) !important;
  transition: background-color 0.14s ease, transform 0.16s var(--gk-ease-spring), box-shadow 0.18s ease !important;
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row):hover:not([data-selected="true"]) {
  background-color: color-mix(in srgb, var(--gk-role-primary) 11%, var(--card)) !important;
  transform: translateX(2px);
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row)[data-selected="true"] {
  background-color: var(--onyx-selected) !important;
  background-image: linear-gradient(115deg, color-mix(in srgb, var(--gk-role-primary) 15%, transparent), color-mix(in srgb, var(--gk-role-accent2) 9%, transparent) 60%, transparent), var(--gk-surface-sheen) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary, var(--primary)) 46%, var(--card-border)) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular), 0 6px 16px -8px var(--gk-role-glow) !important;
}
html[data-gk-theme] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row)[data-selected="true"]::before {
  content: "✦";
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  line-height: 1;
  color: var(--gk-role-primary, var(--primary));
  text-shadow: 0 0 8px var(--gk-role-glow);
  pointer-events: none;
}

/* === 3.5 运行旋转指示器（[data-testid="status-loading-spinner"] 四点旋转）与思考扫光主题化 === */
html[data-gk-theme]:not([data-gk-spinner="native"]) [data-testid="conversation-row-sidebar"]:has([data-testid="status-loading-spinner"]) {
  background: linear-gradient(95deg, color-mix(in srgb, var(--gk-role-primary) 13%, var(--card)), color-mix(in srgb, var(--gk-role-accent2) 7%, transparent)) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 34%, transparent) !important;
  box-shadow: 0 4px 14px -8px var(--gk-role-glow) !important;
}
html[data-gk-theme]:not([data-gk-spinner="native"]) [data-testid="status-loading-spinner"] {
  position: relative !important;
  opacity: 1 !important;
  overflow: visible !important;
}
html[data-gk-theme]:is([data-gk-spinner="role-motif"], [data-gk-spinner="paw-bounce"]) [data-testid="status-loading-spinner"] > [data-agent-state-dot] {
  opacity: 0 !important;
}
@keyframes gkSpinnerOrbit {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.92); }
  50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.08); }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(0.92); }
}
@keyframes gkSpinnerPawBounce {
  0%, 100% { transform: translate(-50%, -50%) rotate(-10deg) scale(0.92); }
  50% { transform: translate(-50%, -54%) rotate(10deg) scale(1.10); }
}
html[data-gk-theme]:is([data-gk-spinner="role-motif"], [data-gk-spinner="paw-bounce"]) [data-testid="status-loading-spinner"]::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 17px;
  height: 17px;
  pointer-events: none;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 5px var(--gk-role-glow));
}
html[data-gk-theme][data-gk-spinner="role-motif"] [data-testid="status-loading-spinner"]::before {
  background-image: var(--gk-spinner-role-svg);
  animation: gkSpinnerOrbit 2.4s linear infinite;
}
html[data-gk-theme][data-gk-spinner="paw-bounce"] [data-testid="status-loading-spinner"]::before {
  background-image: var(--gk-spinner-paw-svg);
  animation: gkSpinnerPawBounce 1.15s ease-in-out infinite;
}
html[data-gk-theme][data-gk-spinner="prism-dots"] [data-testid="status-loading-spinner"] {
  filter: drop-shadow(0 0 5px var(--gk-role-glow));
}
html[data-gk-theme][data-gk-spinner="prism-dots"] [data-testid="status-loading-spinner"] > [data-agent-state-dot]:nth-child(1) {
  background-color: var(--gk-role-primary) !important;
}
html[data-gk-theme][data-gk-spinner="prism-dots"] [data-testid="status-loading-spinner"] > [data-agent-state-dot]:nth-child(2) {
  background-color: var(--gk-role-accent2) !important;
}
html[data-gk-theme][data-gk-spinner="prism-dots"] [data-testid="status-loading-spinner"] > [data-agent-state-dot]:nth-child(3) {
  background-color: var(--gk-role-accent3) !important;
}
html[data-gk-theme][data-gk-spinner="prism-dots"] [data-testid="status-loading-spinner"] > [data-agent-state-dot]:nth-child(4) {
  background-color: color-mix(in srgb, var(--gk-role-primary) 55%, #ffffff) !important;
}
html[data-gk-theme]:is([data-gk-focus="1"], [data-gk-motion="off"]) [data-testid="status-loading-spinner"]::before {
  animation: none !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]):not([data-gk-focus="1"]) .animate-shimmer-text .shimmer-text-content {
  color: color-mix(in srgb, var(--foreground) 72%, var(--gk-role-primary) 28%) !important;
}

/* === 4. 截图 2 红圈：悬浮 Overview 卡片全量二次元猫窝重绘 === */
html[data-gk-theme] :is(div:has(> [data-testid="overview-panel"]), [data-testid="overview-panel-host-sibling"]) {
  position: relative !important;
  background: color-mix(in srgb, var(--glass) 92%, var(--gk-role-primary) 8%) !important;
  background-image: var(--gk-surface-sheen) !important;
  backdrop-filter: blur(18px) saturate(145%) !important;
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 42%, var(--glass-border)) !important;
  border-radius: var(--nux-radius-xl, 18px) !important;
  box-shadow: 0 18px 44px -14px var(--gk-role-glow), var(--glass-shadow), inset 0 1px 0 var(--gk-specular) !important;
  overflow: visible !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) div:has(> [data-testid="overview-panel"])::before {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  top: 0;
  height: 2.5px;
  border-radius: 999px;
  pointer-events: none;
  z-index: 3;
  background: var(--gk-role-gradient);
  box-shadow: 0 0 10px var(--gk-role-glow);
}
/* Vivid 与 Optical-Neko 档下 Overview 顶部双猫耳尖装饰（跟随角色主渐变着色） */
html[data-gk-theme]:is([data-gk-intensity="vivid"], [data-gk-intensity="optical-neko"]):not([data-gk-focus="1"]) div:has(> [data-testid="overview-panel"])::after {
  content: "";
  position: absolute;
  top: -11px;
  left: 18px;
  right: 18px;
  height: 12px;
  pointer-events: none;
  z-index: 2;
  background: var(--gk-role-gradient);
  filter: drop-shadow(0 -2px 6px var(--gk-role-glow));
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: left bottom, right bottom;
  -webkit-mask-size: 26px 12px, 26px 12px;
  -webkit-mask-image:
    url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 12'%3E%3Cpath d='M1 12 L8.5 1.2 Q10.5 -0.4 13.5 2.2 L25 12 Z' fill='black'/%3E%3C/svg%3E"),
    url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 12'%3E%3Cpath d='M25 12 L17.5 1.2 Q15.5 -0.4 12.5 2.2 L1 12 Z' fill='black'/%3E%3C/svg%3E");
}
html[data-gk-theme] [data-testid="overview-panel"] {
  background: transparent !important;
  color: var(--foreground) !important;
}
html[data-gk-theme] [data-testid="overview-panel"] > div:first-child {
  border-bottom: 1px solid color-mix(in srgb, var(--gk-role-primary) 22%, var(--border)) !important;
  background: linear-gradient(90deg, color-mix(in srgb, var(--gk-role-primary) 10%, transparent), color-mix(in srgb, var(--gk-role-accent2) 8%, transparent)) !important;
  border-radius: var(--nux-radius-xl, 18px) var(--nux-radius-xl, 18px) 0 0 !important;
}
html[data-gk-theme] [data-testid="overview-panel"] .divide-y > * + * {
  border-top-color: color-mix(in srgb, var(--gk-role-primary) 16%, var(--border)) !important;
}
html[data-gk-theme] [data-testid="overview-panel"] :is([data-testid^="overview-panel-row-"], [data-testid="side-question-row"], [data-testid="artifact-row"], [data-testid="subagent-node"]) {
  position: relative !important;
  border-radius: 10px !important;
  transition: background-color 0.16s ease, transform 0.16s var(--gk-ease-spring), box-shadow 0.18s ease !important;
}
html[data-gk-theme] [data-testid="overview-panel"] :is([data-testid^="overview-panel-row-"], [data-testid="side-question-row"], [data-testid="artifact-row"], [data-testid="subagent-node"]):hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--gk-role-primary) 15%, transparent), color-mix(in srgb, var(--gk-role-accent2) 9%, transparent)) !important;
  transform: translateX(2px);
  box-shadow: inset 3px 0 0 var(--gk-role-primary) !important;
}
html[data-gk-theme] [data-testid="overview-panel"] svg {
  color: var(--gk-role-primary) !important;
}
html[data-gk-theme] [data-testid="overview-panel"] span[class*="rounded"] {
  background: color-mix(in srgb, var(--gk-role-primary) 16%, var(--secondary)) !important;
  color: var(--gk-role-primary) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 28%, transparent) !important;
  font-weight: 700 !important;
}

/* === 5. 对话区底部角色极光 + 角落透明角色立绘纹章水印 === */
#\${AURORA_HOST_ID} {
  position: absolute;
  inset: auto 0 0 0;
  height: 34%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(66% 92% at 20% 100%, var(--gk-aurora-1, rgba(59,130,246,0.26)), transparent 72%),
    radial-gradient(60% 88% at 78% 100%, var(--gk-aurora-2, rgba(236,72,153,0.20)), transparent 74%),
    radial-gradient(48% 68% at 50% 98%, var(--gk-aurora-3, rgba(34,211,238,0.14)), transparent 70%);
  transition: background 0.9s ease, opacity 0.45s ease;
  opacity: calc(var(--gk-ambient-alpha, 0.85) * 0.96);
}
html[data-gk-focus="1"] #\${AURORA_HOST_ID},
html[data-gk-wallpaper="on"] #\${AURORA_HOST_ID},
html[data-gk-intensity="minimal"] #\${AURORA_HOST_ID} {
  opacity: 0 !important;
}
html[data-gk-theme] [data-testid="conversation-view"] > :not(#\${AURORA_HOST_ID}):not(#\${WATERMARK_ID}) {
  position: relative;
  z-index: 1;
}

#\${WATERMARK_ID} {
  position: absolute;
  right: 18px;
  bottom: 112px;
  width: 240px;
  height: 240px;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: var(--gk-watermark-opacity, 0.14);
  transition: opacity 0.4s ease, transform 0.5s var(--gk-ease-out);
}
html[data-gk-theme][data-gk-intensity="optical-neko"] #\${WATERMARK_ID} {
  opacity: calc(var(--gk-watermark-opacity, 0.12) * 0.86);
  width: 176px;
  height: 176px;
  right: 22px;
  bottom: 118px;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] #\${WATERMARK_ID} .gk-wm-crest {
  display: none !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] #\${WATERMARK_ID} img.gk-wm-sprite {
  width: 146px;
  height: 146px;
  mask-image: linear-gradient(180deg, #000 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent 100%);
}
html[data-gk-theme][data-gk-intensity="optical-neko"] #\${WATERMARK_ID} .gk-wm-tag {
  background: transparent;
  border-color: color-mix(in srgb, var(--gk-role-primary) 22%, transparent);
  opacity: 0.72;
}
html[data-gk-focus="1"] #\${WATERMARK_ID},
html[data-gk-intensity="minimal"] #\${WATERMARK_ID} {
  display: none !important;
}
#\${WATERMARK_ID} .gk-wm-crest {
  position: absolute;
  inset: 0;
  width: 240px;
  height: 240px;
  opacity: 0.92;
  animation: gkWmSpin 44s linear infinite;
}
html[data-gk-motion="off"] #\${WATERMARK_ID} .gk-wm-crest {
  animation: none !important;
}
@keyframes gkWmSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
#\${WATERMARK_ID} img.gk-wm-sprite {
  position: relative;
  width: 152px;
  height: 152px;
  object-fit: contain;
  background: transparent !important;
  filter: drop-shadow(0 8px 20px var(--gk-role-glow, rgba(139,92,246,0.35)));
}
#\${WATERMARK_ID} .gk-wm-tag {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 9.5px !important;
  font-weight: 800;
  letter-spacing: 0.16em;
  white-space: nowrap;
  color: var(--gk-role-primary, #8b5cf6);
  background: color-mix(in srgb, var(--card) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 35%, transparent);
}

/* === 6. 组件级二次元精修：输入栏、气泡、AI富文本、代码块、弹窗 === */
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
  background: color-mix(in srgb, var(--gk-composer-bg) 94%, var(--gk-role-primary) 6%) !important;
  background-image: var(--gk-surface-sheen) !important;
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 34%, var(--glass-border)) !important;
  box-shadow: 0 14px 36px -12px var(--gk-role-glow), var(--gk-composer-shadow) !important;
  transition: border-color 0.24s ease, box-shadow 0.26s var(--gk-ease-spring), transform 0.22s var(--gk-ease-spring) !important;
}
html[data-gk-theme] .surface-composer-card::before {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  top: 0;
  height: 2.5px;
  border-radius: 999px;
  pointer-events: none;
  z-index: 2;
  background: var(--gk-role-gradient, linear-gradient(90deg, #3b82f6, #a855f7, #ec4899));
  opacity: 0.88;
  transition: opacity 0.25s ease, filter 0.25s ease;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) .surface-composer-card::after {
  content: "✦";
  position: absolute;
  top: 7px;
  right: 12px;
  font-size: 11px;
  line-height: 1;
  color: var(--gk-role-primary);
  opacity: 0.72;
  pointer-events: none;
  filter: drop-shadow(0 0 6px var(--gk-role-glow));
}
html[data-gk-theme] #antigravity\\.agentSidePanelInputBox:focus-within > .surface-composer-card,
html[data-gk-theme] .surface-composer-card:focus-within {
  border-color: color-mix(in srgb, var(--gk-role-primary) 64%, var(--glass-border)) !important;
  box-shadow: 0 0 0 2.5px color-mix(in srgb, var(--gk-role-primary) 20%, transparent), var(--gk-composer-shadow) !important;
}
html[data-gk-theme] :is([data-testid="model-selector-trigger"], [data-testid="permissions-selector-trigger"]) {
  border-radius: 999px !important;
  background: color-mix(in srgb, var(--gk-role-primary) 11%, var(--secondary)) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 26%, var(--border)) !important;
}
html[data-gk-theme] [data-testid="send-button"]:not(:disabled) {
  background: var(--gk-role-gradient) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px var(--gk-role-glow) !important;
}
@keyframes gkComposerBreath {
  0%, 100% {
    box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--gk-role-primary) 46%, transparent), 0 0 20px var(--gk-role-glow), var(--gk-composer-shadow);
  }
  50% {
    box-shadow: 0 0 0 2.5px color-mix(in srgb, var(--gk-role-accent2, var(--gk-role-primary)) 65%, transparent), 0 0 32px var(--gk-role-glow), var(--gk-composer-shadow);
  }
}
.gk-composer-glow-active > .surface-composer-card,
.gk-composer-glow-active.surface-composer-card {
  animation: gkComposerBreath 2.6s ease-in-out infinite !important;
  border-color: color-mix(in srgb, var(--gk-role-primary) 68%, transparent) !important;
}

/* 用户消息气泡 */
html[data-gk-theme] .agy-user-bubble-frame {
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}
html[data-gk-theme] :is([data-testid="user-message-bubble"], .agy-user-bubble) {
  position: relative !important;
  border-radius: var(--nux-radius-lg, 15px) !important;
  padding: 11px 16px !important;
  background-color: color-mix(in srgb, var(--gk-bubble-bg, var(--card)) 88%, var(--gk-role-primary) 12%) !important;
  background-image: linear-gradient(125deg, color-mix(in srgb, var(--gk-role-primary) 14%, transparent), color-mix(in srgb, var(--gk-role-accent2) 9%, transparent) 60%, transparent), var(--gk-surface-sheen) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary, var(--primary)) 40%, var(--card-border)) !important;
  box-shadow: inset 3px 0 0 var(--gk-role-primary), inset 0 1px 0 var(--gk-specular), 0 10px 24px -12px var(--gk-role-glow) !important;
  transition: transform 0.22s var(--gk-ease-spring), box-shadow 0.24s ease, border-color 0.22s ease !important;
}
html[data-gk-theme] :is([data-testid="user-message-bubble"], .agy-user-bubble)::after {
  content: "✦✧";
  position: absolute;
  top: 5px;
  right: 9px;
  font-size: 9.5px;
  line-height: 1;
  color: var(--gk-role-primary, var(--primary));
  opacity: 0.72;
  pointer-events: none;
  filter: drop-shadow(0 0 5px var(--gk-role-glow));
}

/* AI 回答区域内引用块、表格、行内代码与思考折叠 */
html[data-gk-theme] :is([data-testid="planner-response-text"], [data-testid="agent-response"]) blockquote {
  border-left: 3px solid var(--gk-role-primary) !important;
  background: color-mix(in srgb, var(--gk-role-primary) 8%, var(--card)) !important;
  border-radius: 0 10px 10px 0 !important;
  padding: 8px 12px !important;
}
html[data-gk-theme] :is([data-testid="planner-response-text"], [data-testid="agent-response"]) :not(pre) > code {
  background: color-mix(in srgb, var(--gk-role-primary) 12%, var(--secondary)) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 24%, transparent) !important;
  border-radius: 6px !important;
  padding: 1px 5px !important;
}
html[data-gk-theme] :is([data-testid="planner-response-text"], [data-testid="agent-response"]) table {
  border-radius: 10px !important;
  overflow: hidden !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 24%, var(--border)) !important;
}
html[data-gk-theme] :is([data-testid="planner-response-text"], [data-testid="agent-response"]) th {
  background: color-mix(in srgb, var(--gk-role-primary) 14%, var(--secondary)) !important;
}
html[data-gk-theme] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]) {
  border-radius: var(--gk-r-sm, 7px) !important;
  padding: 3px 10px !important;
  background: color-mix(in srgb, var(--card) 72%, var(--gk-role-primary) 8%) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 20%, transparent) !important;
  color: var(--foreground) !important;
  transition: background-color 0.14s ease, border-color 0.16s ease, transform 0.14s var(--gk-ease-spring) !important;
}
html[data-gk-theme] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]):hover {
  background: color-mix(in srgb, var(--gk-role-primary) 16%, var(--secondary)) !important;
  border-color: color-mix(in srgb, var(--gk-role-primary) 40%, var(--border)) !important;
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

/* 文件变更卡 / Artifact 卡 / 代码块 / 弹窗 / 细滚动条 */
html[data-gk-theme] :is([data-testid="changed-files-card"], [data-testid="changed-files-card"] + div > div, [data-testid="artifact-card"], [data-testid="bubble-artifact-card"], .artifact-card, [data-testid="running-items-panel"]) {
  border-radius: var(--gk-r-lg, 14px) !important;
  background-color: color-mix(in srgb, var(--card) 92%, var(--gk-role-primary) 8%) !important;
  background-image: var(--gk-surface-sheen) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 26%, var(--card-border)) !important;
  box-shadow: inset 0 1px 0 var(--gk-specular), var(--nux-chip-shadow) !important;
}
html[data-gk-theme] :is([data-testid="planner-response-text"], [data-testid="agent-response"], [data-testid="artifact-view"]) pre {
  position: relative !important;
  border-radius: var(--gk-r-md, 10px) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 24%, var(--card-border)) !important;
  background-color: var(--editor-code-block-background, var(--onyx-well)) !important;
  box-shadow: inset 0 2px 0 color-mix(in srgb, var(--gk-role-primary) 35%, transparent), inset 0 1px 0 var(--gk-specular) !important;
}
html[data-gk-theme] :is([data-testid="entity-pill"], .inline-pill, [data-testid="step-plan-chip"]) {
  border-radius: 8px !important;
  background-color: color-mix(in srgb, var(--gk-tonal-3, var(--secondary)) 88%, var(--gk-role-primary) 12%) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 26%, var(--card-border)) !important;
}
html[data-gk-theme] :is(.agy-overlay, .surface-glass, div[role="dialog"]:not(.agy-overlay), [role="menu"]) {
  background-color: var(--gk-popover-bg, var(--glass)) !important;
  backdrop-filter: blur(16px) saturate(140%) !important;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 34%, var(--glass-border)) !important;
  box-shadow: 0 16px 40px -12px var(--gk-role-glow), var(--glass-shadow) !important;
}
html[data-gk-theme] :is([data-testid="overlay-scrollbar-thumb"], [data-testid="vertical-scrollbar-thumb"], [data-testid="horizontal-scrollbar-thumb"]) {
  background-color: var(--gk-scroll-thumb) !important;
  border-radius: 999px !important;
}
html[data-gk-theme] ::-webkit-scrollbar { width: 6px; height: 6px; }
html[data-gk-theme] ::-webkit-scrollbar-track { background: transparent; }
html[data-gk-theme] ::-webkit-scrollbar-thumb { background: var(--gk-scroll-thumb); border-radius: 999px; }
html[data-gk-theme] ::-webkit-scrollbar-thumb:hover { background: var(--gk-scroll-thumb-hover); }
html[data-gk-motion="off"] *, html[data-gk-focus="1"] * { scroll-behavior: auto !important; }
html[data-gk-smooth="1"] * { scroll-behavior: smooth; }

/* === 7. 空白首页 5 角色迎宾彩蛋舞台 === */
#\${HOME_STAGE_ID} {
  position: relative;
  width: 100%;
  max-width: min(720px, 100%);
  margin: 0 auto 14px;
  padding: 12px 16px 10px;
  border-radius: var(--nux-radius-xl, 18px);
  background: color-mix(in srgb, var(--glass, rgba(255,255,255,0.88)) 86%, var(--gk-role-primary) 14%);
  background-image: var(--gk-surface-sheen);
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 36%, var(--glass-border));
  box-shadow: inset 0 1px 0 var(--gk-specular), 0 14px 34px -12px var(--gk-role-glow);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  z-index: 4;
  user-select: none;
}
#\${HOME_STAGE_ID} .gk-home-stage-head {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#\${HOME_STAGE_ID} .gk-home-theme-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 28%, transparent);
  background: color-mix(in srgb, var(--gk-role-primary) 11%, var(--card));
  color: var(--gk-role-primary, #8b5cf6);
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 10.5px !important;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s var(--gk-ease-spring), background-color 0.16s ease;
}
#\${HOME_STAGE_ID} .gk-home-theme-btn:hover {
  transform: translateY(-50%) scale(1.04);
  background: color-mix(in srgb, var(--gk-role-primary) 20%, var(--card));
}
#\${HOME_STAGE_ID}::before {
  content: "";
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  height: 2.5px;
  border-radius: 999px;
  background: var(--gk-role-gradient);
}
#\${HOME_STAGE_ID} .gk-home-stage-sub {
  font-size: 11.5px !important;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--gk-role-primary, #8b5cf6);
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
  background: color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 14%, transparent);
}
#\${HOME_STAGE_ID} .gk-home-actor img {
  width: 54px;
  height: 54px;
  object-fit: contain;
  filter: drop-shadow(0 5px 12px var(--gk-role-glow));
}
#\${HOME_STAGE_ID} .gk-home-actor span {
  font-size: 10px !important;
  font-weight: 700;
  color: var(--foreground);
  padding: 1px 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gk-role-primary) 12%, var(--secondary));
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 26%, transparent);
}

/* === 7.5 提问模式 (ask_question) 主题舞台：上问题 / 左下抱臂仰头思考+ABCD?轮盘气泡 / 右下选项 === */
html[data-gk-theme] [data-gk-ask-stage="1"] {
  position: relative !important;
  border-radius: var(--nux-radius-xl, 18px) !important;
  background: color-mix(in srgb, var(--glass, rgba(255,255,255,0.92)) 90%, var(--gk-role-primary) 6%) !important;
  background-image: var(--gk-surface-sheen) !important;
  backdrop-filter: blur(18px) saturate(145%) !important;
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 38%, var(--glass-border)) !important;
  box-shadow: 0 18px 46px -14px var(--gk-role-glow), inset 0 1px 0 var(--gk-specular) !important;
  padding-top: 6px !important;
}
html[data-gk-theme] [data-gk-ask-stage="1"]::before {
  content: "";
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  height: 2.5px;
  border-radius: 999px;
  background: var(--gk-role-gradient);
  pointer-events: none;
}
.gk-ask-split-row {
  display: flex !important;
  align-items: flex-end !important;
  gap: 14px !important;
  width: 100% !important;
  margin-top: 6px !important;
}
.gk-ask-mascot-col {
  width: 136px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 4px 2px 2px;
  user-select: none;
}
.gk-ask-thought-bubble {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--gk-popover-bg, var(--card)) 94%, var(--gk-role-primary) 6%);
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 42%, transparent);
  box-shadow: 0 8px 20px -8px var(--gk-role-glow), inset 0 1px 0 rgba(255,255,255,0.85);
}
.gk-ask-thought-bubble::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: inherit;
  border-right: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 42%, transparent);
  border-bottom: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 42%, transparent);
}
.gk-ask-opt-letter {
  display: inline-flex;
  align-items: baseline;
  font-size: 13px !important;
  font-weight: 800;
  color: var(--muted-foreground, #64748b);
  opacity: 0.26;
  transform: scale(0.92);
  transition: opacity 0.22s ease, transform 0.22s var(--gk-ease-spring), color 0.22s ease, text-shadow 0.22s ease;
}
.gk-ask-opt-letter .gk-ask-q {
  font-style: normal;
  font-size: 12px !important;
  margin-left: 0.5px;
  display: none;
}
.gk-ask-opt-letter.is-lit {
  opacity: 1 !important;
  transform: scale(1.22);
  color: var(--gk-role-primary, #8b5cf6) !important;
  text-shadow: 0 0 10px var(--gk-role-glow);
}
.gk-ask-opt-letter.is-lit .gk-ask-q {
  display: inline;
  color: var(--gk-role-accent2, var(--gk-role-primary));
}
img.gk-ask-ponder-img {
  width: 96px !important;
  height: 96px !important;
  object-fit: contain !important;
  background: transparent !important;
  display: block;
  filter: drop-shadow(0 6px 14px var(--gk-role-glow));
}
.gk-ask-options-col {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}

/* === 8. 壁纸 / 极光 / 发光彩色 SVG 爪印星尘雨 / 气泡 / 大纲 / 右键菜单 === */
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
    radial-gradient(circle at 22% 28%, color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 24%, transparent), transparent 44%),
    radial-gradient(circle at 78% 68%, color-mix(in srgb, var(--gk-role-accent3, #22d3ee) 20%, transparent), transparent 46%),
    radial-gradient(1.5px 1.5px at 14% 22%, rgba(167,139,250,0.48) 50%, transparent 100%),
    radial-gradient(1.5px 1.5px at 66% 18%, rgba(236,72,153,0.44) 50%, transparent 100%);
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
  position: fixed; top: 0; left: 0; width: 100%; height: 3.5px; z-index: 2147483640; pointer-events: none;
  opacity: 0; transform: translateX(-100%);
  background: var(--gk-role-gradient, linear-gradient(90deg, #3b82f6, #a855f7, #ec4899));
  box-shadow: 0 2px 16px var(--gk-role-glow, rgba(139,92,246,0.55));
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
  position: fixed; z-index: 2147483642; max-width: 268px; padding: 8px 12px; border-radius: 14px;
  font-size: 12px !important; line-height: 1.45; color: var(--foreground, #1e1b4b);
  background: var(--gk-popover-bg, var(--glass)); border: 1.5px solid var(--gk-role-primary, #8b5cf6);
  box-shadow: 0 12px 28px -8px var(--gk-role-glow), var(--glass-shadow); backdrop-filter: blur(12px); pointer-events: auto;
  animation: gkBubblePop 0.22s var(--gk-ease-spring);
}
@keyframes gkBubblePop { from { opacity: 0; transform: translateY(6px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.gk-stardust-particle {
  position: fixed;
  z-index: 2147483635;
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: gkStardustFall var(--dur, 3.2s) cubic-bezier(0.22, 0.72, 0.36, 1) forwards;
}
@keyframes gkStardustFall {
  0% { opacity: 0; transform: translate(0, 0) scale(0.55) rotate(0deg); }
  14% { opacity: 0.98; }
  80% { opacity: 0.90; }
  100% { opacity: 0; transform: translate(var(--dx, 0px), var(--dy, 420px)) scale(1.18) rotate(var(--rot, 160deg)); }
}
.gk-send-spark {
  position: fixed;
  z-index: 2147483639;
  pointer-events: none;
  display: inline-flex;
  filter: drop-shadow(0 0 8px var(--gk-role-glow));
  animation: gkSendSparkRise 0.95s var(--gk-ease-out) forwards;
}
@keyframes gkSendSparkRise {
  0% { opacity: 1; transform: translate(0, 0) scale(0.75); }
  100% { opacity: 0; transform: translate(var(--sx, 14px), -44px) scale(1.22) rotate(28deg); }
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
  border: none; background: rgba(139, 92, 246, 0.16); color: inherit; width: 19px; height: 19px;
  border-radius: 999px; cursor: pointer; font-size: 11px !important; line-height: 1; padding: 0;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.gk-dock-theme-btn:hover { background: rgba(139, 92, 246, 0.30); }
#\${MINI_BAR_ID} {
  position: fixed; z-index: 2147483644; display: none; flex-direction: column; gap: 7px; width: 292px; padding: 11px 12px;
  border-radius: 15px; background: var(--gk-popover-bg, var(--glass)); color: var(--foreground);
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 34%, var(--glass-border));
  box-shadow: 0 16px 40px -12px var(--gk-role-glow), var(--glass-shadow); backdrop-filter: blur(16px); font-size: 11.5px !important;
}
#\${MINI_BAR_ID}.is-open { display: flex; }
#\${MINI_BAR_ID} .gk-mini-label { font-size: 10.5px !important; opacity: 0.72; font-weight: 700; }
#\${MINI_BAR_ID} .gk-mini-row { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
#\${MINI_BAR_ID} button.gk-mini-chip {
  padding: 3.5px 8px; border-radius: 999px; border: 1px solid var(--border);
  background: var(--secondary); color: var(--foreground); font-size: 10.5px !important; cursor: pointer;
}
#\${MINI_BAR_ID} button.gk-mini-chip.is-active { background: var(--gk-role-primary, #8b5cf6); color: #fff; border-color: transparent; }
#\${OUTLINE_FAB_ID} {
  position: fixed; right: 18px; top: 96px; z-index: 2147483620; width: 32px; height: 32px; border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 34%, var(--glass-border)); background: var(--gk-popover-bg, var(--glass));
  background-image: var(--gk-surface-sheen); color: var(--gk-role-primary, #8b5cf6);
  box-shadow: var(--nux-chip-shadow); cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px !important; opacity: 0.82; transition: opacity 0.18s ease, transform 0.18s var(--gk-ease-spring);
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
  position: fixed; z-index: 2147483646; min-width: 214px; padding: 6px; border-radius: 13px;
  background: var(--gk-popover-bg, var(--glass)); background-image: var(--gk-surface-sheen);
  color: var(--foreground); border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 32%, var(--glass-border));
  box-shadow: var(--glass-shadow); backdrop-filter: blur(14px); display: none; flex-direction: column; gap: 2px;
}
#\${CTX_MENU_ID}.is-open { display: flex; }
#\${CTX_MENU_ID} button {
  text-align: left; padding: 6px 10px; border: none; border-radius: 8px; background: transparent;
  color: inherit; font-size: 12px !important; cursor: pointer; display: flex; align-items: center; gap: 7px;
}
#\${CTX_MENU_ID} button:hover { background: var(--onyx-selected); }

/* === 9. optical-neko 光学高定模式：纯白焦点对比 × 流动炫彩光效 × 横切黑带根治 × Brand Logo 主题化 === */
@keyframes gkPrismHairlineFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 260% 50%; }
}
@keyframes gkPrismVerticalFlow {
  0% { background-position: 50% 0%; }
  100% { background-position: 50% 240%; }
}
@keyframes gkHomeRingSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes gkHomeLogoFloat {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-4px) scale(1.03); }
}
@keyframes gkAuroraFlowDriftA {
  0%, 100% { transform: translate3d(-4%, 2%, 0) scale(0.96, 1.0); filter: blur(36px) saturate(145%) hue-rotate(-8deg); }
  50% { transform: translate3d(5%, -3%, 0) scale(1.06, 1.08); filter: blur(38px) saturate(155%) hue-rotate(14deg); }
}
@keyframes gkAuroraFlowDriftB {
  0%, 100% { transform: translate3d(4%, 1%, 0) scale(1.04, 0.96); opacity: 0.78; }
  50% { transform: translate3d(-5%, -2%, 0) scale(0.95, 1.08); opacity: 1; }
}

/* 全局：彻底根治深/浅色下底部极光的横向硬切边（去 48px 实色假遮罩、加滚动双向淡出与极光顶部羽化） */
html[data-gk-theme]:not([data-gk-intensity="minimal"]):not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) [data-testid="conversation-view"] div.absolute.bottom-0.z-10.pointer-events-none:empty {
  background: transparent !important;
  background-image: none !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]):not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) [data-testid="autoscroll-viewport"] {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0px, #000 28px, #000 calc(100% - 26px), transparent 100%) !important;
  mask-image: linear-gradient(to bottom, transparent 0px, #000 28px, #000 calc(100% - 26px), transparent 100%) !important;
}
html[data-gk-theme] [id="antigravity.agentSidePanelInputBox"] {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
html[data-gk-theme] #\${AURORA_HOST_ID} {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.24) 22%, #000 52%, #000 100%) !important;
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.24) 22%, #000 52%, #000 100%) !important;
}

/* 焦点 1：左上角 Antigravity 小 A 全量替换为《基米窝》发光炫彩猫爪星芒宝石徽章 */
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="app-icon-new-conversation-button"] {
  position: relative !important;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  padding: 0 !important;
  margin: 0 6px 0 8px !important;
  border-radius: 9px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: visible !important;
  transition: transform 0.22s var(--gk-ease-spring), filter 0.2s ease !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="app-icon-new-conversation-button"] > svg {
  display: none !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="app-icon-new-conversation-button"]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9px;
  background: linear-gradient(135deg, #0EA5E9 0%, #6366F1 32%, #A855F7 56%, #EC4899 78%, #F59E0B 100%);
  background-size: 220% 220%;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 4px 14px -2px rgba(139, 92, 246, 0.45), 0 0 10px rgba(14, 165, 233, 0.28);
  animation: gkPrismHairlineFlow 7s linear infinite;
  pointer-events: none;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="app-icon-new-conversation-button"]::after {
  content: "";
  position: relative;
  width: 19px;
  height: 19px;
  background-image: \${TOP_BRAND_PAW_URI};
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 1px 3px rgba(15, 23, 42, 0.32));
  pointer-events: none;
  z-index: 1;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="app-icon-new-conversation-button"]:hover {
  transform: scale(1.08) rotate(-4deg) !important;
}

/* 焦点 3：空白首页中央大 A 全量替换为真实 HTML 节点 #gemineko-home-emblem（炫彩背光晕 + 旋转棱镜环 + 悬浮猫耳水晶徽标 + 流动渐变问候） */
html[data-gk-theme]:not([data-gk-intensity="minimal"]) .agy-home .home-greeting-mark,
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="home-greeting"] .home-greeting-mark {
  display: none !important;
}
#\${HOME_EMBLEM_ID} {
  position: relative !important;
  width: 92px !important;
  height: 92px !important;
  min-width: 92px !important;
  min-height: 92px !important;
  margin: 0 auto 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  user-select: none !important;
  overflow: visible !important;
  flex-shrink: 0 !important;
}
#\${HOME_EMBLEM_ID} .gk-he-halo {
  position: absolute;
  inset: -26px;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(22px);
  opacity: 0.65;
  background:
    radial-gradient(circle at 30% 35%, rgba(56, 189, 248, 0.55) 0%, transparent 58%),
    radial-gradient(circle at 72% 40%, rgba(139, 92, 246, 0.52) 0%, transparent 58%),
    radial-gradient(circle at 52% 75%, rgba(236, 72, 153, 0.45) 0%, rgba(245, 158, 11, 0.24) 42%, transparent 72%);
  animation: gkAuroraFlowDriftA 7.2s ease-in-out infinite;
}
#\${HOME_EMBLEM_ID} .gk-he-ring {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  pointer-events: none;
  background: conic-gradient(from 0deg, #38BDF8, #6366F1, #A855F7, #EC4899, #F59E0B, #22D3EE, #38BDF8);
  -webkit-mask-image: radial-gradient(circle, transparent 58%, #000 61%, #000 69%, transparent 72%);
  mask-image: radial-gradient(circle, transparent 58%, #000 61%, #000 69%, transparent 72%);
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.42));
  animation: gkHomeRingSpin 10s linear infinite;
}
#\${HOME_EMBLEM_ID} .gk-he-cat {
  position: relative;
  z-index: 1;
  width: 66px;
  height: 66px;
  pointer-events: none;
  background-image: \${HOME_BRAND_CAT_URI};
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 8px 20px rgba(139, 92, 246, 0.36)) drop-shadow(0 2px 6px rgba(14, 165, 233, 0.25));
  transition: transform 0.2s var(--gk-ease-spring);
  animation: gkHomeLogoFloat 4.2s ease-in-out infinite;
}
#\${HOME_EMBLEM_ID}:hover .gk-he-cat {
  transform: scale(1.08);
}
html[data-gk-theme] .agy-home > :not(#\${AURORA_HOST_ID}):not(#\${WATERMARK_ID}) {
  position: relative;
  z-index: 1;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) .agy-home [data-testid="home-greeting"] :is(.home-greeting-title, h1) {
  background: linear-gradient(110deg, #1E1B4B 0%, #4F46E5 26%, #9333EA 50%, #DB2777 74%, #0284C7 100%) !important;
  background-size: 240% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  animation: gkPrismHairlineFlow 9s linear infinite;
}
html[data-gk-theme][data-gk-scheme="dark"]:not([data-gk-intensity="minimal"]) .agy-home [data-testid="home-greeting"] :is(.home-greeting-title, h1) {
  background: linear-gradient(110deg, #F8FAFC 0%, #7DD3FC 26%, #C4B5FD 52%, #F9A8D4 76%, #FDE68A 100%) !important;
  background-size: 240% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
}

html[data-gk-theme][data-gk-intensity="optical-neko"] {
  --gk-optical-prism-flow: linear-gradient(
    90deg,
    #38BDF8 0%,
    #6366F1 18%,
    #A855F7 36%,
    #EC4899 54%,
    #F59E0B 72%,
    #22D3EE 88%,
    #38BDF8 100%
  );
  --gk-optical-hairline: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--gk-role-primary) 14%, transparent) 12%,
    color-mix(in srgb, var(--gk-role-primary) 68%, #ffffff) 34%,
    rgba(255, 255, 255, 0.96) 50%,
    color-mix(in srgb, var(--gk-role-accent2) 66%, #ffffff) 66%,
    color-mix(in srgb, var(--gk-role-accent3) 18%, transparent) 88%,
    transparent 100%
  );
  --gk-optical-rim-grad: radial-gradient(
    300px circle at var(--gk-rx, -999px) var(--gk-ry, -999px),
    color-mix(in srgb, var(--gk-optical-rim-core) calc(var(--gk-rim-alpha, 0) * 100%), transparent) 0%,
    color-mix(in srgb, var(--gk-role-primary) calc(var(--gk-rim-alpha, 0) * 92%), transparent) 16%,
    color-mix(in srgb, var(--gk-role-accent2) calc(var(--gk-rim-alpha, 0) * 78%), transparent) 38%,
    color-mix(in srgb, var(--gk-role-accent3) calc(var(--gk-rim-alpha, 0) * 48%), transparent) 62%,
    color-mix(in srgb, var(--gk-role-primary) calc(var(--gk-rim-alpha, 0) * 14%), transparent) 84%,
    transparent 100%
  );
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] {
  --background: #FFFFFF !important;
  --content: #FFFFFF !important;
  --body-background: #FFFFFF !important;
  --shell: #FFFFFF !important;
  --sidebar: #F4F6FA !important;
  --shell-canvas: #F4F6FA !important;
  --card: #FFFFFF !important;
  --gk-optical-canvas: #FFFFFF;
  --gk-optical-sidebar: #F4F6FA;
  --gk-optical-titlebar: #F6F8FB;
  --gk-optical-card-fill: #FFFFFF;
  --gk-optical-glass-fill: rgba(255, 255, 255, 0.92);
  --gk-optical-sheen: linear-gradient(178deg, rgba(255, 255, 255, 1) 0%, rgba(252, 253, 255, 0.88) 46%, rgba(246, 249, 255, 0.72) 100%);
  --gk-optical-border-top: rgba(255, 255, 255, 0.98);
  --gk-optical-border-base: rgba(15, 23, 42, 0.08);
  --gk-optical-shadow-card: inset 0 1px 0 #FFFFFF, 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 26px -12px rgba(15, 23, 42, 0.09);
  --gk-optical-shadow-float: inset 0 1px 0 #FFFFFF, 0 2px 6px rgba(15, 23, 42, 0.05), 0 22px 52px -18px rgba(30, 58, 138, 0.14);
  --gk-optical-rim-core: rgba(255, 255, 255, 0.98);
  --gk-optical-specular-spot: rgba(255, 255, 255, 0.72);
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] {
  --gk-optical-canvas: #0D0F14;
  --gk-optical-sidebar: #090B0F;
  --gk-optical-titlebar: #0B0D12;
  --gk-optical-card-fill: rgba(20, 23, 32, 0.93);
  --gk-optical-glass-fill: rgba(18, 21, 30, 0.88);
  --gk-optical-sheen: linear-gradient(172deg, rgba(255, 255, 255, 0.068) 0%, rgba(168, 196, 255, 0.022) 34%, rgba(8, 10, 16, 0.22) 100%);
  --gk-optical-border-top: rgba(255, 255, 255, 0.15);
  --gk-optical-border-base: rgba(218, 228, 255, 0.08);
  --gk-optical-shadow-card: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.36), 0 18px 42px -14px rgba(0, 0, 0, 0.56);
  --gk-optical-shadow-float: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 4px 12px rgba(0, 0, 0, 0.42), 0 28px 64px -18px rgba(0, 0, 0, 0.68);
  --gk-optical-rim-core: rgba(255, 255, 255, 0.94);
  --gk-optical-specular-spot: rgba(232, 242, 255, 0.11);
}

/* 中性高通透表面层次（浅色回归纯白×冷银白，严格排除 Browser Hole） */
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-wallpaper="on"]) > body:not([data-has-browser-hole="true"]),
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) :is(.agy-shell, .agy-sheet, [data-testid="sidecar-iframe-slot"], iframe[data-testid="sidecar-iframe"], [data-testid="conversation-view"], .agy-home):not([data-has-browser-hole="true"]),
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-focus="1"]:not([data-gk-wallpaper="on"]) :is(.agy-shell, .agy-sheet, [data-testid="sidecar-iframe-slot"], iframe[data-testid="sidecar-iframe"], [data-testid="conversation-view"], .agy-home):not([data-has-browser-hole="true"]) {
  background-color: var(--gk-optical-canvas) !important;
  background-image: none !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-wallpaper="on"]) :is(.bg-sidebar, aside.bg-sidebar, div.bg-sidebar, [class*="bg-sidebar"]):not([data-has-browser-hole="true"]) {
  background-color: var(--gk-optical-sidebar) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"]:not([data-gk-wallpaper="on"]) :is(aside.bg-sidebar, div.h-full.bg-sidebar):not([data-has-browser-hole="true"]) {
  background-image: none !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"]:not([data-gk-focus="1"]):not([data-gk-wallpaper="on"]) :is(aside.bg-sidebar, div.h-full.bg-sidebar):not([data-has-browser-hole="true"]) {
  background-image:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--gk-role-primary) 7%, transparent) 0%,
      color-mix(in srgb, var(--gk-role-primary) 3.5%, transparent) 24%,
      color-mix(in srgb, var(--gk-role-primary) 1%, transparent) 52%,
      transparent 78%
    ),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--gk-role-accent2) 6.5%, transparent) 0%,
      color-mix(in srgb, var(--gk-role-accent2) 3%, transparent) 26%,
      color-mix(in srgb, var(--gk-role-accent3) 0.8%, transparent) 56%,
      transparent 82%
    ) !important;
  background-repeat: no-repeat !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="title-menu-bar"] {
  background: var(--gk-optical-titlebar) !important;
  border-bottom: 1px solid var(--gk-optical-border-base) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="pane-titlebar-toolbar"] {
  background: color-mix(in srgb, var(--gk-optical-canvas) 94%, transparent) !important;
  border-bottom: 1px solid var(--gk-optical-border-base) !important;
}

/* 顶栏收敛避免分散注意力，焦点光丝集中到输入框与悬浮卡并持续流动 */
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] [data-testid="title-menu-bar"]::before {
  opacity: 0 !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] [data-testid="title-menu-bar"]::before {
  height: 1px !important;
  background: var(--gk-optical-hairline) !important;
  opacity: 0.95 !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] .surface-composer-card::before,
html[data-gk-theme][data-gk-intensity="optical-neko"] div:has(> [data-testid="overview-panel"])::before {
  left: 8% !important;
  right: 8% !important;
  height: 1.5px !important;
  background: var(--gk-optical-prism-flow) !important;
  background-size: 260% 100% !important;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%) !important;
  mask-image: linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%) !important;
  box-shadow: 0 0 12px color-mix(in srgb, var(--gk-role-primary) 34%, transparent) !important;
  opacity: 0.95 !important;
  animation: gkPrismHairlineFlow 5.5s linear infinite;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-active="1"] .surface-composer-card::before,
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-active="1"] div:has(> [data-testid="overview-panel"])::before {
  animation-duration: 2.4s !important;
  box-shadow: 0 0 16px color-mix(in srgb, var(--gk-role-accent2) 48%, transparent) !important;
}

/* 「开启新喵聊」水晶玻璃按钮 */
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="new-conversation-button"] {
  color: var(--foreground) !important;
  border: 1px solid transparent !important;
  background-color: transparent !important;
  background-image:
    var(--gk-optical-sheen),
    linear-gradient(var(--gk-optical-card-fill), var(--gk-optical-card-fill)),
    var(--gk-optical-rim-grad),
    linear-gradient(180deg, var(--gk-optical-border-top) 0%, var(--gk-optical-border-base) 42%, var(--gk-optical-border-base) 100%) !important;
  background-origin: padding-box, padding-box, border-box, border-box !important;
  background-clip: padding-box, padding-box, border-box, border-box !important;
  box-shadow: var(--gk-optical-shadow-card), 0 6px 18px -10px color-mix(in srgb, var(--gk-role-primary) 24%, transparent) !important;
  filter: none !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="new-conversation-button"]:hover {
  transform: translateY(-1px) !important;
  color: var(--gk-role-primary) !important;
  filter: none !important;
  box-shadow: var(--gk-optical-shadow-float), 0 10px 24px -10px var(--gk-role-glow) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="new-conversation-button"]::before {
  color: var(--gk-role-primary) !important;
  filter: drop-shadow(0 0 6px var(--gk-role-glow)) !important;
}

/* 悬浮 Overview 卡片：清透长过渡玻璃 + 鼠标跟随棱镜色散边框 + 琉璃半透猫耳尖 */
html[data-gk-theme][data-gk-intensity="optical-neko"] :is(div:has(> [data-testid="overview-panel"]), [data-testid="overview-panel-host-sibling"]) {
  border: 1px solid transparent !important;
  background-color: transparent !important;
  background-image:
    var(--gk-optical-sheen),
    linear-gradient(var(--gk-optical-glass-fill), var(--gk-optical-glass-fill)),
    var(--gk-optical-rim-grad),
    linear-gradient(180deg, var(--gk-optical-border-top) 0%, var(--gk-optical-border-base) 42%, var(--gk-optical-border-base) 100%) !important;
  background-origin: padding-box, padding-box, border-box, border-box !important;
  background-clip: padding-box, padding-box, border-box, border-box !important;
  backdrop-filter: blur(22px) saturate(145%) !important;
  box-shadow: var(--gk-optical-shadow-float) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="overview-panel"] > div:first-child {
  border-bottom: 1px solid var(--gk-optical-border-base) !important;
  background: linear-gradient(180deg, color-mix(in srgb, var(--gk-role-primary) 5%, transparent) 0%, transparent 100%) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"]:not([data-gk-focus="1"]) div:has(> [data-testid="overview-panel"])::after {
  opacity: 0.72 !important;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.94) 0%,
    color-mix(in srgb, var(--gk-role-primary) 76%, #ffffff) 45%,
    color-mix(in srgb, var(--gk-role-accent2) 60%, transparent) 100%
  ) !important;
  filter: drop-shadow(0 -2px 8px color-mix(in srgb, var(--gk-role-primary) 38%, transparent)) !important;
}

/* 输入框玻璃底座 + 鼠标跟随 300px 棱镜色散边框 */
html[data-gk-theme][data-gk-intensity="optical-neko"] [id="antigravity.agentSidePanelInputBox"] > .surface-composer-card,
html[data-gk-theme][data-gk-intensity="optical-neko"] .surface-composer-card {
  border: 1px solid transparent !important;
  background-color: transparent !important;
  background-image:
    var(--gk-optical-sheen),
    linear-gradient(var(--gk-optical-card-fill), var(--gk-optical-card-fill)),
    var(--gk-optical-rim-grad),
    linear-gradient(180deg, var(--gk-optical-border-top) 0%, var(--gk-optical-border-base) 42%, var(--gk-optical-border-base) 100%) !important;
  background-origin: padding-box, padding-box, border-box, border-box !important;
  background-clip: padding-box, padding-box, border-box, border-box !important;
  backdrop-filter: blur(20px) saturate(140%) !important;
  box-shadow: var(--gk-optical-shadow-float) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [id="antigravity.agentSidePanelInputBox"]:focus-within > .surface-composer-card,
html[data-gk-theme][data-gk-intensity="optical-neko"] .surface-composer-card:focus-within {
  border-color: transparent !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--gk-role-primary) 32%, transparent),
    0 0 0 4px color-mix(in srgb, var(--gk-role-primary) 10%, transparent),
    var(--gk-optical-shadow-float) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="model-selector-trigger"], [data-testid="permissions-selector-trigger"]) {
  background: color-mix(in srgb, var(--gk-optical-card-fill) 86%, var(--gk-role-primary) 4%) !important;
  border: 1px solid var(--gk-optical-border-base) !important;
  box-shadow: inset 0 1px 0 var(--gk-optical-border-top) !important;
}

/* 用户消息气泡 & 侧栏选中项（焦点 2：纯白侧栏选中卡配左侧 3px 垂直流动炫彩棱镜光针） */
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="user-message-bubble"], .agy-user-bubble) {
  border: 1px solid transparent !important;
  background-color: transparent !important;
  background-image:
    linear-gradient(120deg, color-mix(in srgb, var(--gk-role-primary) 5%, transparent) 0%, color-mix(in srgb, var(--gk-role-accent2) 2.5%, transparent) 42%, transparent 82%),
    linear-gradient(var(--gk-optical-card-fill), var(--gk-optical-card-fill)),
    var(--gk-optical-rim-grad),
    linear-gradient(180deg, var(--gk-optical-border-top) 0%, var(--gk-optical-border-base) 42%, var(--gk-optical-border-base) 100%) !important;
  background-origin: padding-box, padding-box, border-box, border-box !important;
  background-clip: padding-box, padding-box, border-box, border-box !important;
  box-shadow: var(--gk-optical-shadow-card) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="user-message-bubble"], .agy-user-bubble)::after {
  opacity: 0.48 !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row)[data-selected="true"] {
  border: 1px solid transparent !important;
  background-color: transparent !important;
  background-image:
    linear-gradient(120deg, color-mix(in srgb, var(--gk-role-primary) 6%, transparent) 0%, color-mix(in srgb, var(--gk-role-accent2) 3%, transparent) 44%, transparent 84%),
    linear-gradient(var(--gk-optical-card-fill), var(--gk-optical-card-fill)),
    var(--gk-optical-rim-grad),
    linear-gradient(180deg, var(--gk-optical-border-top) 0%, var(--gk-optical-border-base) 42%, var(--gk-optical-border-base) 100%) !important;
  background-origin: padding-box, padding-box, border-box, border-box !important;
  background-clip: padding-box, padding-box, border-box, border-box !important;
  box-shadow: var(--gk-optical-shadow-card) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row)[data-selected="true"]::after {
  content: "";
  position: absolute;
  left: 2px;
  top: 18%;
  bottom: 18%;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #38BDF8 0%, #6366F1 26%, #A855F7 52%, #EC4899 76%, #F59E0B 92%, #38BDF8 100%);
  background-size: 100% 240%;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.45);
  animation: gkPrismVerticalFlow 4.6s linear infinite;
  pointer-events: none;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="conversation-row-sidebar"], .agy-sidebar-row):hover:not([data-selected="true"]) {
  background-color: color-mix(in srgb, var(--gk-role-primary) 5%, var(--gk-optical-card-fill)) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="project-header"] {
  background: transparent !important;
  border-color: transparent !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] [data-testid="project-header"]::before {
  width: 2px !important;
  opacity: 0.72 !important;
  background: linear-gradient(180deg, transparent 0%, var(--gk-role-primary) 50%, transparent 100%) !important;
}

/* 底部地平线极光：深色保留高分暗夜极光（已靠顶部 mask 消除硬线），浅色重构为纯白下的高色差流动炫彩极光浪 */
@keyframes gkAuroraHorizonBreath {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.92; }
  50% { transform: translate3d(0, -1.5%, 0) scale(1.03); opacity: 1; }
}
html[data-gk-theme][data-gk-intensity="optical-neko"] #\${AURORA_HOST_ID} {
  height: 46% !important;
  overflow: hidden !important;
  opacity: calc(var(--gk-ambient-alpha, 0.85) * 0.98);
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] #\${AURORA_HOST_ID} {
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--gk-role-primary) 20%, transparent) 0%,
    color-mix(in srgb, var(--gk-role-accent2) 13%, transparent) 15%,
    color-mix(in srgb, var(--gk-role-accent3) 7%, transparent) 34%,
    color-mix(in srgb, var(--gk-role-primary) 2.5%, transparent) 56%,
    color-mix(in srgb, var(--gk-role-accent2) 0.7%, transparent) 78%,
    transparent 100%
  ) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] #\${AURORA_HOST_ID}::before {
  content: "";
  position: absolute;
  inset: 10% -12% -20% -12%;
  pointer-events: none;
  filter: blur(42px) saturate(125%);
  background:
    radial-gradient(
      52% 84% at 22% 96%,
      color-mix(in srgb, var(--gk-role-primary) 34%, transparent) 0%,
      color-mix(in srgb, var(--gk-role-primary) 20%, transparent) 24%,
      color-mix(in srgb, var(--gk-role-primary) 8%, transparent) 52%,
      color-mix(in srgb, var(--gk-role-primary) 2%, transparent) 78%,
      transparent 100%
    ),
    radial-gradient(
      50% 82% at 78% 96%,
      color-mix(in srgb, var(--gk-role-accent2) 28%, transparent) 0%,
      color-mix(in srgb, var(--gk-role-accent2) 16%, transparent) 24%,
      color-mix(in srgb, var(--gk-role-accent2) 6%, transparent) 52%,
      color-mix(in srgb, var(--gk-role-accent2) 1.5%, transparent) 78%,
      transparent 100%
    ),
    radial-gradient(
      46% 70% at 50% 94%,
      color-mix(in srgb, var(--gk-role-accent3) 22%, transparent) 0%,
      color-mix(in srgb, var(--gk-role-accent3) 11%, transparent) 28%,
      color-mix(in srgb, var(--gk-role-accent3) 3.5%, transparent) 58%,
      transparent 100%
    );
  animation: gkAuroraHorizonBreath 9s ease-in-out infinite;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] #\${AURORA_HOST_ID}::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 42%;
  pointer-events: none;
  background: radial-gradient(
    56% 52% at 50% 100%,
    var(--gk-optical-specular-spot) 0%,
    color-mix(in srgb, var(--gk-role-primary) 20%, transparent) 24%,
    color-mix(in srgb, var(--gk-role-accent2) 11%, transparent) 52%,
    color-mix(in srgb, var(--gk-role-accent3) 3%, transparent) 78%,
    transparent 100%
  );
}

/* 焦点 4（浅色纯白专用）：收拢至底部 38%，彻底无灰脏，以高色差流动双浪极光衬托纯白画布 */
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] #\${AURORA_HOST_ID} {
  height: 38% !important;
  background: transparent !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] #\${AURORA_HOST_ID}::before {
  content: "";
  position: absolute;
  inset: 10% -12% -14% -12%;
  pointer-events: none;
  filter: blur(36px) saturate(145%);
  background:
    radial-gradient(
      44% 82% at 18% 96%,
      rgba(14, 165, 233, 0.48) 0%,
      rgba(56, 189, 248, 0.28) 28%,
      rgba(14, 165, 233, 0.09) 56%,
      transparent 82%
    ),
    radial-gradient(
      46% 84% at 82% 96%,
      rgba(236, 72, 153, 0.44) 0%,
      rgba(244, 114, 182, 0.25) 28%,
      rgba(236, 72, 153, 0.08) 56%,
      transparent 82%
    ),
    radial-gradient(
      42% 76% at 54% 92%,
      rgba(139, 92, 246, 0.40) 0%,
      rgba(168, 85, 247, 0.21) 32%,
      rgba(139, 92, 246, 0.06) 60%,
      transparent 84%
    );
  animation: gkAuroraFlowDriftA 7.2s ease-in-out infinite;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] #\${AURORA_HOST_ID}::after {
  content: "";
  position: absolute;
  inset: auto -8% -8% -8%;
  height: 58%;
  pointer-events: none;
  filter: blur(26px) saturate(135%);
  background:
    radial-gradient(
      38% 68% at 64% 96%,
      rgba(245, 158, 11, 0.34) 0%,
      rgba(251, 191, 36, 0.18) 32%,
      transparent 76%
    ),
    radial-gradient(
      42% 64% at 38% 96%,
      rgba(34, 211, 238, 0.34) 0%,
      rgba(56, 189, 248, 0.16) 36%,
      transparent 78%
    ),
    radial-gradient(
      52% 48% at 50% 100%,
      rgba(255, 255, 255, 0.78) 0%,
      rgba(255, 255, 255, 0.25) 45%,
      transparent 82%
    );
  animation: gkAuroraFlowDriftB 5.8s ease-in-out infinite;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"][data-gk-active="1"] #\${AURORA_HOST_ID}::before {
  animation-duration: 3.6s !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"][data-gk-active="1"] #\${AURORA_HOST_ID}::after {
  animation-duration: 3.0s !important;
}

/* 专注模式 & 静态动效统一关闭全量流光动画 */
html[data-gk-theme]:is([data-gk-focus="1"], [data-gk-motion="off"]) :is(
  #\${AURORA_HOST_ID}::before,
  #\${AURORA_HOST_ID}::after,
  .surface-composer-card::before,
  div:has(> [data-testid="overview-panel"])::before,
  [data-testid="app-icon-new-conversation-button"]::before,
  [data-testid="conversation-row-sidebar"][data-selected="true"]::after,
  #\${HOME_EMBLEM_ID} .gk-he-halo,
  #\${HOME_EMBLEM_ID} .gk-he-ring,
  #\${HOME_EMBLEM_ID} .gk-he-cat,
  .agy-home [data-testid="home-greeting"] :is(.home-greeting-title, h1)
) {
  animation: none !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"]:is([data-gk-focus="1"], [data-gk-wallpaper="on"]) #\${AURORA_HOST_ID} {
  opacity: 0 !important;
}
      \`;
      document.head.appendChild(st);
      return st;
    }

    function resolvePatternUrl(roleId, scheme, intensity) {
      if (intensity !== 'vivid' || cfg.focusMode) return 'none';
      const patPack = ROLE_PATTERNS[roleId] || ROLE_PATTERNS.neon;
      return scheme === 'dark' ? patPack.vividDark : patPack.vividLight;
    }

    function applyThemeDom(activity) {
      const root = document.documentElement;
      if (!root) return;
      if (!cfg.enabled) {
        for (const attr of ['data-gk-theme','data-gk-scheme','data-gk-role','data-gk-intensity','data-gk-spinner','data-gk-radius','data-gk-motion','data-gk-focus','data-gk-active','data-gk-smooth','data-gk-accent-on','data-gk-wallpaper']) {
          root.removeAttribute(attr);
        }
        for (const id of [THEME_STYLE_ID, AURORA_HOST_ID, HOME_STAGE_ID, HOME_EMBLEM_ID, WATERMARK_ID]) {
          const n = document.getElementById(id);
          if (n) n.remove();
        }
        syncWallpaperLayer();
        syncNightLamp();
        return;
      }

      ensureThemeStyleTag();
      const presetId = resolveEffectivePresetId();
      const presetObj = THEME_PRESETS[presetId] || THEME_PRESETS['nebula-day'];
      const roleId = resolveActiveRoleId(activity);
      const pal = ROLE_PALETTES[roleId] || ROLE_PALETTES.neon;
      const rawInt = cfg.themeIntensity || 'optical-neko';
      const intensity = rawInt === 'balanced' ? 'optical-neko' : rawInt;
      const spinnerStyle = cfg.spinnerStyle || 'role-motif';

      root.setAttribute('data-gk-theme', presetId);
      root.setAttribute('data-gk-scheme', presetObj.scheme);
      root.setAttribute('data-gk-role', roleId);
      root.setAttribute('data-gk-intensity', intensity);
      root.setAttribute('data-gk-spinner', spinnerStyle);
      root.setAttribute('data-gk-radius', cfg.cornerRadius || 'soft');
      root.setAttribute('data-gk-motion', cfg.motionLevel || 'standard');
      root.setAttribute('data-gk-focus', cfg.focusMode ? '1' : '0');
      root.setAttribute('data-gk-active', activity?.active ? '1' : '0');
      root.setAttribute('data-gk-smooth', cfg.workbench?.smoothScroll !== false && getMotionEnabled() ? '1' : '0');
      root.setAttribute('data-gk-accent-on', cfg.accentMode === 'off' ? '0' : '1');
      root.setAttribute('data-gk-wallpaper', cfg.wallpaper?.mode && cfg.wallpaper.mode !== 'off' ? 'on' : 'off');

      const amp = Math.max(0.2, Math.min(1.25, (Number(cfg.ambientIntensity) || 85) / 100));
      root.style.setProperty('--gk-role-primary', pal.primary);
      root.style.setProperty('--gk-role-accent2', pal.accent2);
      root.style.setProperty('--gk-role-accent3', pal.accent3);
      root.style.setProperty('--gk-role-glow', pal.glow);
      root.style.setProperty('--gk-role-gradient', pal.gradient);
      root.style.setProperty('--gk-role-spark', pal.sparkColor || pal.primary);
      root.style.setProperty('--gk-role-tint', presetObj.scheme === 'dark' ? (pal.tintDark || 'rgba(99,102,241,0.16)') : (pal.tintLight || 'rgba(99,102,241,0.09)'));
      root.style.setProperty('--gk-catnest-pattern', resolvePatternUrl(roleId, presetObj.scheme, intensity));
      root.style.setProperty('--gk-spinner-role-svg', ROLE_SPINNERS[roleId] || ROLE_SPINNERS.neon);
      root.style.setProperty('--gk-spinner-paw-svg', PAW_SPINNERS[roleId] || PAW_SPINNERS.neon);
      root.style.setProperty('--gk-aurora-1', pal.aurora1);
      root.style.setProperty('--gk-aurora-2', pal.aurora2);
      root.style.setProperty('--gk-aurora-3', pal.aurora3);
      root.style.setProperty('--gk-ambient-alpha', String(amp.toFixed(2)));
      root.style.setProperty('--gk-watermark-opacity', String(cfg.watermark?.opacity ?? 0.14));

      syncConvAurora();
      syncCornerWatermark(activity, roleId);
      syncHomeBrandEmblem();
      syncHomeStage();
      syncAskQuestionStage(roleId);
      syncWallpaperLayer();
      syncNightLamp();
      syncComposerBreath(activity);
      syncOutlineVisibility();
    }

    function syncHomeBrandEmblem() {
      const intensity = cfg.themeIntensity === 'balanced' ? 'optical-neko' : (cfg.themeIntensity || 'optical-neko');
      if (!cfg.enabled || intensity === 'minimal') {
        const old = document.getElementById(HOME_EMBLEM_ID);
        if (old) old.remove();
        return;
      }
      const markEl = document.querySelector('.agy-home .home-greeting-mark, [data-testid="home-greeting"] .home-greeting-mark, [data-testid="home-greeting"] svg');
      const greetingEl = markEl?.closest?.('[data-testid="home-greeting"]')
        || document.querySelector('.agy-home [data-testid="home-greeting"], [data-testid="home-greeting"]')
        || document.querySelector('.agy-home .home-greeting-title, .agy-home h1')?.parentElement;
      if (!greetingEl && !markEl) {
        const old = document.getElementById(HOME_EMBLEM_ID);
        if (old) old.remove();
        return;
      }
      const host = markEl?.parentElement || greetingEl;
      if (!host) return;

      let emblem = document.getElementById(HOME_EMBLEM_ID);
      if (!emblem) {
        emblem = document.createElement('div');
        emblem.id = HOME_EMBLEM_ID;
        emblem.title = '点击摸摸基米窝旋转星环徽标 ✨';
        emblem.innerHTML = '<span class="gk-he-halo"></span><span class="gk-he-ring"></span><span class="gk-he-cat"></span>';
        emblem.addEventListener('click', (e) => {
          e.stopPropagation();
          onDockPoke(resolveActiveRoleId(ctx.getActivity()), e.clientX, e.clientY);
        });
      }
      if (markEl && markEl.parentElement === host) {
        if (emblem.nextElementSibling !== markEl) host.insertBefore(emblem, markEl);
      } else if (emblem.parentElement !== host || host.firstElementChild !== emblem) {
        host.prepend(emblem);
      }
    }

    function syncConvAurora() {
      if (!cfg.enabled || cfg.focusMode || cfg.themeIntensity === 'minimal' || (cfg.wallpaper?.mode && cfg.wallpaper.mode !== 'off')) {
        const old = document.getElementById(AURORA_HOST_ID);
        if (old) old.remove();
        return;
      }
      const hostView = document.querySelector('[data-testid="conversation-view"]:not([data-has-browser-hole="true"])')
        || document.querySelector('.agy-home:not([data-has-browser-hole="true"])');
      if (!hostView || hostView.getAttribute('data-has-browser-hole') === 'true') {
        const old = document.getElementById(AURORA_HOST_ID);
        if (old) old.remove();
        return;
      }
      let au = document.getElementById(AURORA_HOST_ID);
      if (!au) {
        au = document.createElement('div');
        au.id = AURORA_HOST_ID;
        hostView.prepend(au);
      } else if (au.parentElement !== hostView) {
        hostView.prepend(au);
      }
    }

    function syncCornerWatermark(activity, activeRoleId) {
      const wmCfg = cfg.watermark || {};
      const shouldShow = Boolean(
        cfg.enabled &&
        !cfg.focusMode &&
        cfg.themeIntensity !== 'minimal' &&
        wmCfg.enabled !== false
      );
      if (!shouldShow) {
        const old = document.getElementById(WATERMARK_ID);
        if (old) old.remove();
        return;
      }
      const host = document.querySelector('[data-testid="conversation-view"]:not([data-has-browser-hole="true"])')
        || document.querySelector('.agy-home:not([data-has-browser-hole="true"])');
      if (!host) {
        const old = document.getElementById(WATERMARK_ID);
        if (old) old.remove();
        return;
      }

      const wmRole = (wmCfg.role && wmCfg.role !== 'follow-role' && ROLE_PALETTES[wmCfg.role])
        ? wmCfg.role
        : (activeRoleId || resolveActiveRoleId(activity));
      const pal = ROLE_PALETTES[wmRole] || ROLE_PALETTES.neon;
      const isCustom = wmCfg.role === 'custom' && wmCfg.customFilePath;
      const actName = activity?.active && /^(thinking|reading|editing|running|asking|idle)$/i.test(String(activity.action || ''))
        ? String(activity.action).toLowerCase()
        : 'thinking';
      const spriteUrl = isCustom
        ? \`\${ctx.server}/api/watermark/file?v=\${encodeURIComponent(String(cfg.updatedAt || 1))}\`
        : \`\${ctx.server}/gemineko-sprites/\${wmRole}-\${actName}.png?v=0.5.1\`;
      const fallbackUrl = \`\${ctx.server}/gemineko-sprites/\${wmRole}-thinking.png?v=0.5.1\`;

      let wm = document.getElementById(WATERMARK_ID);
      if (!wm) {
        wm = document.createElement('div');
        wm.id = WATERMARK_ID;
        wm.innerHTML = '<div class="gk-wm-crest"></div><img class="gk-wm-sprite" alt="" /><div class="gk-wm-tag"></div>';
        host.prepend(wm);
      } else if (wm.parentElement !== host) {
        host.prepend(wm);
      }

      const crest = wm.querySelector('.gk-wm-crest');
      if (crest && crest.getAttribute('data-role') !== wmRole) {
        crest.setAttribute('data-role', wmRole);
        crest.innerHTML = ROLE_CREST_SVGS[wmRole] || ROLE_CREST_SVGS.neon;
      }
      const img = wm.querySelector('img.gk-wm-sprite');
      if (img) {
        if (img.dataset.gkErrBound !== '1') {
          img.dataset.gkErrBound = '1';
          img.addEventListener('error', () => {
            if (img.dataset.gkFb === '1') return;
            img.dataset.gkFb = '1';
            img.src = img.dataset.gkFallbackSrc || \`\${ctx.server}/gemineko-sprites/neon-thinking.png?v=0.5.1\`;
          });
        }
        img.dataset.gkFallbackSrc = fallbackUrl;
        if (img.getAttribute('data-src') !== spriteUrl) {
          img.dataset.gkFb = '0';
          img.setAttribute('data-src', spriteUrl);
          img.src = spriteUrl;
        }
      }
      const tag = wm.querySelector('.gk-wm-tag');
      if (tag) {
        const nextTitle = pal.crestTitle || \`\${wmRole.toUpperCase()} · GEMINEKO\`;
        if (tag.textContent !== nextTitle) tag.textContent = nextTitle;
      }
    }

    let askStageRef = null;
    let askRouletteTimer = null;
    let askHoveredIdx = -1;
    let askLitIdx = 0;

    function clearAskStage() {
      if (askRouletteTimer) {
        clearInterval(askRouletteTimer);
        askRouletteTimer = null;
      }
      if (askStageRef && askStageRef.isConnected) {
        askStageRef.removeAttribute('data-gk-ask-stage');
        const col = askStageRef.querySelector('.gk-ask-mascot-col');
        if (col) col.remove();
        askStageRef.querySelectorAll('.gk-ask-split-row').forEach((row) => {
          row.classList.remove('gk-ask-split-row');
        });
        askStageRef.querySelectorAll('.gk-ask-options-col').forEach((oc) => {
          oc.classList.remove('gk-ask-options-col');
        });
      }
      askStageRef = null;
      askHoveredIdx = -1;
    }

    function findActiveAskQuestionPanel() {
      const explicit = document.querySelector('[data-testid*="ask-question"]:not([data-testid*="readonly"]), [data-testid="question-panel"]');
      if (explicit && explicit.offsetHeight > 40) return explicit;
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      const scope = document.querySelector('[data-testid="conversation-view"]') || document.body;
      if (!scope) return null;
      const candGroups = scope.querySelectorAll('[role="radiogroup"], [data-testid*="question"]');
      for (const g of candGroups) {
        if (g.closest('[data-testid*="readonly"], #gemineko-home-stage, #gemineko-cdp-composer-dock')) continue;
        const r = g.getBoundingClientRect();
        if (r.width < 180 || r.height < 48) continue;
        if (box && r.top > box.getBoundingClientRect().bottom) continue;
        const btns = g.querySelectorAll('button, [role="radio"], [role="option"]');
        if (btns.length >= 2) {
          return g.closest('form, section, [class*="card"], [class*="border"]') || g.parentElement || g;
        }
      }
      return null;
    }

    function updateAskBubbleLit(bubble, count) {
      if (!bubble) return;
      const idx = askHoveredIdx >= 0 && askHoveredIdx < count ? askHoveredIdx : (askLitIdx % Math.max(1, count));
      bubble.querySelectorAll('.gk-ask-opt-letter').forEach((el, i) => {
        el.classList.toggle('is-lit', i === idx);
      });
    }

    function syncAskQuestionStage(roleId) {
      if (!cfg.enabled || cfg.askStageEnabled === false) {
        clearAskStage();
        return;
      }
      const panel = findActiveAskQuestionPanel();
      if (!panel) {
        clearAskStage();
        return;
      }

      const activeRole = ROLE_PALETTES[roleId] ? roleId : 'neon';
      const optList = panel.querySelector('[role="radiogroup"]')
        || [...panel.children].find((ch) => ch.querySelectorAll('button, [role="radio"], [role="option"]').length >= 2);
      if (!optList || !optList.parentElement) return;

      const optItems = [...optList.querySelectorAll('button, [role="radio"], [role="option"]')]
        .filter((b) => !/^(?:submit|skip|cancel|提交|跳过|取消)$/i.test((b.textContent || '').trim()))
        .slice(0, 6);
      const optCount = Math.max(2, Math.min(6, optItems.length || 4));
      const splitParent = optList.parentElement;

      if (askStageRef !== panel) {
        clearAskStage();
        askStageRef = panel;
        panel.setAttribute('data-gk-ask-stage', '1');
        splitParent.classList.add('gk-ask-split-row');
        optList.classList.add('gk-ask-options-col');

        const mascotCol = document.createElement('div');
        mascotCol.className = 'gk-ask-mascot-col';
        const letters = 'ABCDEF'.slice(0, optCount).split('');
        mascotCol.innerHTML = \`
          <div class="gk-ask-thought-bubble">
            \${letters.map((ch, i) => \`<span class="gk-ask-opt-letter \${i === 0 ? 'is-lit' : ''}" data-idx="\${i}">\${ch}<em class="gk-ask-q">?</em></span>\`).join('')}
          </div>
          <img class="gk-ask-ponder-img" alt="pondering" />
        \`;
        splitParent.insertBefore(mascotCol, optList);

        optItems.forEach((btn, idx) => {
          if (btn.dataset.gkAskHover === '1') return;
          btn.dataset.gkAskHover = '1';
          btn.addEventListener('mouseenter', () => {
            askHoveredIdx = idx;
            updateAskBubbleLit(mascotCol.querySelector('.gk-ask-thought-bubble'), optCount);
          });
          btn.addEventListener('mouseleave', () => {
            askHoveredIdx = -1;
            updateAskBubbleLit(mascotCol.querySelector('.gk-ask-thought-bubble'), optCount);
          });
        });

        askRouletteTimer = setInterval(() => {
          if (!askStageRef || !askStageRef.isConnected) {
            clearAskStage();
            return;
          }
          if (askHoveredIdx < 0 && getMotionEnabled()) {
            askLitIdx = (askLitIdx + 1) % optCount;
            updateAskBubbleLit(askStageRef.querySelector('.gk-ask-thought-bubble'), optCount);
          }
        }, 950);
      }

      const img = panel.querySelector('img.gk-ask-ponder-img');
      if (img) {
        const ponderUrl = \`\${ctx.server}/gemineko-sprites/\${activeRole}-ponder.png?v=0.6.0\`;
        const askingUrl = \`\${ctx.server}/gemineko-sprites/\${activeRole}-asking.png?v=0.6.0\`;
        if (img.dataset.gkErrBound !== '1') {
          img.dataset.gkErrBound = '1';
          img.addEventListener('error', () => {
            if (img.dataset.gkFb === '2') return;
            if (img.dataset.gkFb === '1') {
              img.dataset.gkFb = '2';
              img.src = \`\${ctx.server}/gemineko-sprites/\${activeRole}-thinking.png?v=0.6.0\`;
            } else {
              img.dataset.gkFb = '1';
              img.src = askingUrl;
            }
          });
        }
        if (img.getAttribute('data-src') !== ponderUrl) {
          img.dataset.gkFb = '0';
          img.setAttribute('data-src', ponderUrl);
          img.src = ponderUrl;
        }
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
          <div class="gk-home-stage-head">
            <div class="gk-home-stage-sub">✦ 欢迎回到基米窝 · 5 位哈基米已就位 ✦</div>
            <button type="button" class="gk-home-theme-btn" title="基米窝主题与汉化快切">🎨 主题/汉化</button>
          </div>
          <div class="gk-home-cast">
            \${HOME_ROLES.map((r) => \`
              <button type="button" class="gk-home-actor" data-home-role="\${r.id}" title="\${r.tip}">
                <img src="\${ctx.server}/gemineko-sprites/\${r.sprite}?v=0.5.1" alt="\${r.name}" />
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
            img.src = \`\${ctx.server}/gemineko-sprites/\${rId}-thinking.png?v=0.5.1\`;
          });
        });
        stage.addEventListener('click', (e) => {
          const themeBtn = e.target.closest('.gk-home-theme-btn');
          if (themeBtn) {
            e.stopPropagation();
            toggleMiniBar(themeBtn);
            return;
          }
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

    function makeGlowingSvgParticle(kind, sizePx, color, glowColor) {
      const wrap = document.createElement('span');
      let svg = '';
      if (kind === 'paw') {
        svg = \`<svg width="\${sizePx}" height="\${sizePx}" viewBox="0 0 36 36" fill="none"><g fill="\${color}"><ellipse cx="18" cy="23" rx="9" ry="6.5"/><circle cx="9.2" cy="14" r="3"/><circle cx="15" cy="10.5" r="3.2"/><circle cx="21" cy="10.5" r="3.2"/><circle cx="26.8" cy="14" r="3"/></g></svg>\`;
      } else if (kind === 'prism') {
        svg = \`<svg width="\${sizePx}" height="\${sizePx}" viewBox="0 0 32 32" fill="none"><polygon points="16,3 28,16 16,29 4,16" fill="\${color}" fill-opacity="0.88" stroke="#ffffff" stroke-width="1.2"/></svg>\`;
      } else {
        svg = \`<svg width="\${sizePx}" height="\${sizePx}" viewBox="0 0 32 32" fill="none"><path d="M16 2 Q18.8 13.2 30 16 Q18.8 18.8 16 30 Q13.2 18.8 2 16 Q13.2 13.2 16 2 Z" fill="\${color}"/></svg>\`;
      }
      wrap.innerHTML = svg;
      wrap.style.filter = \`drop-shadow(0 0 8px \${glowColor}) drop-shadow(0 2px 6px rgba(15,23,42,0.28))\`;
      return wrap;
    }

    function spawnSendSparks() {
      if (!cfg.enabled || cfg.focusMode || cfg.motionLevel === 'off') return;
      const now = Date.now();
      if (now - lastSendSparkAt < 420) return;
      lastSendSparkAt = now;
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (!box) return;
      const r = box.getBoundingClientRect();
      const pal = ROLE_PALETTES[resolveActiveRoleId(ctx.getActivity())] || ROLE_PALETTES.neon;
      const kinds = ['star', 'paw', 'prism', 'paw'];
      const colors = [pal.primary, pal.accent2, pal.accent3, pal.primary];
      for (let i = 0; i < 4; i++) {
        const sp = makeGlowingSvgParticle(kinds[i], 20 + (i % 2) * 4, colors[i], pal.glow);
        sp.className = 'gk-send-spark';
        sp.style.left = Math.round(r.right - 40 - i * 20) + 'px';
        sp.style.top = Math.round(r.top + 4) + 'px';
        sp.style.setProperty('--sx', Math.round((Math.random() - 0.5) * 34) + 'px');
        document.body?.appendChild(sp);
        setTimeout(() => { if (sp.isConnected) sp.remove(); }, 1000);
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
      if (document.hidden) clearAllOpticalRims();
      const vid = document.querySelector('#' + WP_LAYER_ID + ' video');
      if (!vid) return;
      if (document.hidden || !document.hasFocus()) {
        try { vid.pause(); } catch {}
      } else {
        try { vid.play()?.catch?.(() => {}); } catch {}
      }
    }

    function isOpticalRimActive() {
      if (stopped || !cfg.enabled || cfg.focusMode || cfg.motionLevel === 'off') return false;
      if (typeof document !== 'undefined' && document.hidden) return false;
      const curInt = cfg.themeIntensity === 'balanced' ? 'optical-neko' : (cfg.themeIntensity || 'optical-neko');
      return curInt === 'optical-neko';
    }

    function clearRimProps(el) {
      if (!el?.style) return;
      el.style.removeProperty('--gk-rx');
      el.style.removeProperty('--gk-ry');
      el.style.removeProperty('--gk-rim-alpha');
    }

    function clearAllOpticalRims() {
      if (rimRafId) {
        cancelAnimationFrame(rimRafId);
        rimRafId = 0;
      }
      for (const el of litRimEls) clearRimProps(el);
      litRimEls.clear();
    }

    function flushOpticalRimFrame() {
      rimRafId = 0;
      if (!isOpticalRimActive()) {
        clearAllOpticalRims();
        return;
      }
      const px = lastPtrX;
      const py = lastPtrY;
      const vh = window.innerHeight || 900;
      const vw = window.innerWidth || 1440;
      const maxDist = 220;
      const nextLit = new Set();
      const targets = document.querySelectorAll(RIM_TARGETS_SEL);
      for (const el of targets) {
        if (!el || !el.isConnected) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
        const dx = px < r.left ? r.left - px : (px > r.right ? px - r.right : 0);
        const dy = py < r.top ? r.top - py : (py > r.bottom ? py - r.bottom : 0);
        const dist = Math.hypot(dx, dy);
        if (dist <= maxDist) {
          const alpha = Math.pow(Math.max(0, 1 - dist / maxDist), 0.72);
          el.style.setProperty('--gk-rx', (px - r.left).toFixed(1) + 'px');
          el.style.setProperty('--gk-ry', (py - r.top).toFixed(1) + 'px');
          el.style.setProperty('--gk-rim-alpha', alpha.toFixed(3));
          nextLit.add(el);
        }
      }
      for (const prevEl of litRimEls) {
        if (!nextLit.has(prevEl)) clearRimProps(prevEl);
      }
      litRimEls.clear();
      for (const el of nextLit) litRimEls.add(el);
    }

    function onRimPointerMove(e) {
      if (!e || !Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      if (!rimRafId && isOpticalRimActive()) {
        rimRafId = requestAnimationFrame(flushOpticalRimFrame);
      }
    }

    function onRimPointerLeave() {
      lastPtrX = -9999;
      lastPtrY = -9999;
      clearAllOpticalRims();
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

    /** 释放高可见度彩色发光 SVG 爪印/星芒/晶棱星尘雨 */
    function spawnStardust(originX, originY, count = 32, mode = 'confetti') {
      if (cfg.focusMode && mode !== 'force') return;
      const pal = ROLE_PALETTES[resolveActiveRoleId(ctx.getActivity())] || ROLE_PALETTES.neon;
      const colors = [pal.primary, pal.accent2, pal.accent3, '#a855f7', '#ec4899'];
      const kinds = mode === 'paw' ? ['paw', 'paw', 'star', 'prism'] : ['star', 'paw', 'prism'];
      const actualCount = mode === 'paw' ? Math.max(32, count) : Math.max(16, count);
      for (let i = 0; i < actualCount; i++) {
        const sizePx = mode === 'paw' ? Math.round(24 + Math.random() * 14) : Math.round(20 + Math.random() * 10);
        const col = colors[i % colors.length];
        const p = makeGlowingSvgParticle(kinds[i % kinds.length], sizePx, col, pal.glow);
        p.className = 'gk-stardust-particle';
        const x = mode === 'paw'
          ? Math.round(Math.random() * (window.innerWidth - 48) + 24)
          : Math.round(originX + (Math.random() - 0.5) * 200);
        const y = mode === 'paw'
          ? Math.round(-28 - Math.random() * 60)
          : Math.round(originY - 14 - Math.random() * 26);
        const durSec = mode === 'paw' ? (2.8 + Math.random() * 1.5) : (1.1 + Math.random() * 0.5);
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 140) + 'px');
        p.style.setProperty('--dy', (mode === 'paw' ? Math.round(window.innerHeight * 0.85 + Math.random() * 160) : Math.round(-65 - Math.random() * 80)) + 'px');
        p.style.setProperty('--rot', Math.round((Math.random() - 0.5) * 340) + 'deg');
        p.style.setProperty('--dur', durSec.toFixed(2) + 's');
        document.body?.appendChild(p);
        setTimeout(() => { if (p.isConnected) p.remove(); }, Math.round(durSec * 1000) + 150);
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
        img.src = \`\${ctx.server}/gemineko-sprites/\${r}-running.png?v=0.5.1\`;
        img.alt = r;
        track.appendChild(img);
      }
      overlay.appendChild(track);
      document.body?.appendChild(overlay);
      setTimeout(() => { if (overlay.isConnected) overlay.remove(); }, 3700);

      spawnStardust(window.innerWidth / 2, window.innerHeight - 110, 26, 'force');
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
        spawnStardust(clientX, clientY, 12, 'confetti');
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
          spawnStardust(rect.left + 80, rect.top, 20, 'confetti');
          if (cfg.memes?.enabled !== false && cfg.memes?.autoFinishSticker !== false) {
            ctx.onLongTaskFinished?.(nextRole);
          }
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
          <span>🎨 基米窝主题与汉化快切</span>
          <button class="gk-mini-chip" data-act="open-workshop" title="在基米窝侧边栏打开完整工坊">完整工坊 ↗</button>
        </div>
        <div class="gk-mini-label">基底配色：</div>
        <div class="gk-mini-row" data-group="presets">
          <button class="gk-mini-chip" data-preset="auto">跟随宿主</button>
          <button class="gk-mini-chip" data-preset="nebula-day">星云冷白</button>
          <button class="gk-mini-chip" data-preset="cream-paper">奶油暖纸</button>
          <button class="gk-mini-chip" data-preset="starry-nest">星空猫窝</button>
          <button class="gk-mini-chip" data-preset="carbon-obsidian">碳晶黑曜</button>
        </div>
        <div class="gk-mini-label">视觉模式：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-intensity="optical-neko">光学高定</button>
          <button class="gk-mini-chip" data-intensity="vivid">浓郁二次元</button>
          <button class="gk-mini-chip" data-intensity="minimal">极简专注</button>
        </div>
        <div class="gk-mini-label">运行加载动效：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-spinner="role-motif">角色星徽</button>
          <button class="gk-mini-chip" data-spinner="paw-bounce">弹跳肉垫</button>
          <button class="gk-mini-chip" data-spinner="prism-dots">炫彩四点</button>
          <button class="gk-mini-chip" data-spinner="native">原生灰点</button>
        </div>
        <div class="gk-mini-label">反重力宿主汉化：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-i18n="auto">跟随系统</button>
          <button class="gk-mini-chip" data-i18n="neko-zh">哈基米萌系</button>
          <button class="gk-mini-chip" data-i18n="zh">标准中文</button>
          <button class="gk-mini-chip" data-i18n="off">English</button>
        </div>
        <div class="gk-mini-row" style="margin-top:2px;">
          <button class="gk-mini-chip" data-act="meme-picker">😸 表情库</button>
          <button class="gk-mini-chip" data-act="toggle-focus">专注 0fps</button>
          <button class="gk-mini-chip" data-act="rain">🐾 爪印雨</button>
          <button class="gk-mini-chip" data-act="burst">💥 捅基米窝</button>
          <button class="gk-mini-chip" data-act="toggle-enabled">总开关</button>
        </div>
      \`;
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const preset = btn.getAttribute('data-preset');
        const intensity = btn.getAttribute('data-intensity');
        const spinner = btn.getAttribute('data-spinner');
        const i18nMode = btn.getAttribute('data-i18n');
        const act = btn.getAttribute('data-act');
        if (preset) {
          applyConfig({ ...cfg, enabled: true, preset });
          persistPatch({ enabled: true, preset });
        } else if (intensity) {
          applyConfig({ ...cfg, enabled: true, themeIntensity: intensity });
          persistPatch({ enabled: true, themeIntensity: intensity });
        } else if (spinner) {
          applyConfig({ ...cfg, enabled: true, spinnerStyle: spinner });
          persistPatch({ enabled: true, spinnerStyle: spinner });
        } else if (i18nMode) {
          const nextI18n = { ...(cfg.i18n || {}), mode: i18nMode };
          applyConfig({ ...cfg, i18n: nextI18n });
          persistPatch({ i18n: nextI18n });
        } else if (act === 'toggle-focus') {
          const next = !cfg.focusMode;
          applyConfig({ ...cfg, focusMode: next });
          persistPatch({ focusMode: next });
        } else if (act === 'toggle-enabled') {
          const next = !cfg.enabled;
          applyConfig({ ...cfg, enabled: next });
          persistPatch({ enabled: next });
        } else if (act === 'rain') {
          spawnStardust(window.innerWidth / 2, 0, 34, 'paw');
          bar.classList.remove('is-open');
        } else if (act === 'burst') {
          triggerHiveParadeBurst(lastRole || 'neon', 'host');
          bar.classList.remove('is-open');
        } else if (act === 'meme-picker') {
          bar.classList.remove('is-open');
          ctx.openMemePicker?.(bar);
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
      bar.querySelectorAll('[data-intensity]').forEach((b) => {
        const curInt = cfg.themeIntensity === 'balanced' ? 'optical-neko' : (cfg.themeIntensity || 'optical-neko');
        b.classList.toggle('is-active', cfg.enabled && b.getAttribute('data-intensity') === curInt);
      });
      bar.querySelectorAll('[data-spinner]').forEach((b) => {
        b.classList.toggle('is-active', cfg.enabled && b.getAttribute('data-spinner') === (cfg.spinnerStyle || 'role-motif'));
      });
      bar.querySelectorAll('[data-i18n]').forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-i18n') === (cfg.i18n?.mode || 'auto'));
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
        bar.style.left = Math.max(12, Math.min(window.innerWidth - 304, Math.round(r.left))) + 'px';
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
        <button type="button" data-c="theme">🎨 切换基米窝皮肤 / 浓度 / 汉化</button>
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
      menu.style.left = Math.max(8, Math.min(window.innerWidth - 220, e.clientX)) + 'px';
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && String(e.key || '').toLowerCase() === 'p') {
        e.preventDefault();
        spawnStardust(window.innerWidth / 2, 0, 34, 'paw');
        showSpeechBubble('🐾 炫彩爪印星尘雨降临基米窝！', 2200);
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
      if (!isOpticalRimActive()) clearAllOpticalRims();
      const act = ctx.getActivity();
      applyThemeDom(act);
      syncMiniBarState();
      ctx.onConfigApplied?.(cfg);
    }

    function triggerEvent(evt) {
      if (!evt || !evt.type) return;
      if (evt.type === 'hive-poke-burst') {
        triggerHiveParadeBurst(evt.role || 'neon', 'sidecar');
      } else if (evt.type === 'stardust-rain') {
        spawnStardust(window.innerWidth / 2, 0, 36, 'paw');
        showSpeechBubble('✨ 来自基米窝的炫彩爪印星尘雨~', 2200);
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
          syncCornerWatermark(ctx.getActivity(), resolveActiveRoleId(ctx.getActivity()));
          syncHomeBrandEmblem();
          syncHomeStage();
          syncAskQuestionStage(resolveActiveRoleId(ctx.getActivity()));
        }
      }
    }, 1200);
    nightTimer = setInterval(() => {
      if (!stopped) syncNightLamp();
    }, 60_000);

    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);
    window.addEventListener('blur', onVisibilityOrFocus);
    document.addEventListener('pointermove', onRimPointerMove, { passive: true });
    document.documentElement?.addEventListener('pointerleave', onRimPointerLeave, { passive: true });
    document.addEventListener('contextmenu', onDocumentContextMenu);
    document.addEventListener('click', onGlobalClickCloseMenus, true);
    window.addEventListener('keydown', onKeyDownComposerOrEgg, true);

    applyConfig(cfg);
    decorateLongCodeBlocks();

    const api = { applyConfig, onActivityUpdate, onDockPoke, triggerEvent, toggleMiniBar, syncAskQuestionStage, unmount };
    window.__GEMINEKO_THEME_API__ = api;

    function unmount() {
      stopped = true;
      clearAskStage();
      clearAllOpticalRims();
      if (schemeObserver) schemeObserver.disconnect();
      if (workbenchTimer) clearInterval(workbenchTimer);
      if (nightTimer) clearInterval(nightTimer);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      window.removeEventListener('blur', onVisibilityOrFocus);
      document.removeEventListener('pointermove', onRimPointerMove);
      document.documentElement?.removeEventListener('pointerleave', onRimPointerLeave);
      document.removeEventListener('contextmenu', onDocumentContextMenu);
      document.removeEventListener('click', onGlobalClickCloseMenus, true);
      window.removeEventListener('keydown', onKeyDownComposerOrEgg, true);

      for (const id of [THEME_STYLE_ID, WP_LAYER_ID, AURORA_HOST_ID, WATERMARK_ID, HOME_STAGE_ID, HOME_EMBLEM_ID, NIGHT_LAYER_ID, AURORA_SWEEP_ID, OUTLINE_FAB_ID, OUTLINE_POP_ID, CTX_MENU_ID, MINI_BAR_ID]) {
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
        for (const attr of ['data-gk-theme','data-gk-scheme','data-gk-role','data-gk-intensity','data-gk-spinner','data-gk-radius','data-gk-motion','data-gk-focus','data-gk-active','data-gk-smooth','data-gk-accent-on','data-gk-wallpaper']) {
          root.removeAttribute(attr);
        }
        for (const prop of ['--gk-role-primary','--gk-role-accent2','--gk-role-accent3','--gk-role-glow','--gk-role-gradient','--gk-role-spark','--gk-role-tint','--gk-catnest-pattern','--gk-spinner-role-svg','--gk-spinner-paw-svg','--gk-aurora-1','--gk-aurora-2','--gk-aurora-3','--gk-ambient-alpha','--gk-watermark-opacity']) {
          root.style.removeProperty(prop);
        }
      }
      window.__GEMINEKO_THEME_API__ = null;
    }

    return api;
  }
  `;
}
