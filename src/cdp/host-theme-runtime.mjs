/**
 * @file Antigravity 主窗口「5 角色二次元视觉母题 × 光学玻璃质感 × 哈基米星空猫窝」全量皮肤与联动彩蛋引擎
 * 参考真实宿主 CSS Token 与 data-testid 选择器深度适配全界面，零修改 app.asar。
 */

import { BRAND_META } from '../meta/brand.mjs';
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

/** 凹弧四角光学棱镜轮廓 Mask URI（用于将流光与扫描高光严格限定在棱镜外轮廓内，零 CORS 且不外溢矩形边） */
function buildHomeGemMaskUri() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 3 Q57 43 97 50 Q57 57 50 97 Q43 57 3 50 Q43 43 50 3 Z" fill="#000"/></svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/** 空白首页正中央 120×120 珠宝级 8 切面立体炫彩哈基米猫耳星钻（✦）SVG data URI */
function buildHomeBrandCatUri() {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">',
    '<defs>',
    '<linearGradient id="gkorb" x1="14" y1="86" x2="106" y2="34" gradientUnits="userSpaceOnUse">',
    '<stop offset="0%" stop-color="#38BDF8" stop-opacity="0"/>',
    '<stop offset="28%" stop-color="#38BDF8" stop-opacity="0.68"/>',
    '<stop offset="56%" stop-color="#A855F7" stop-opacity="0.72"/>',
    '<stop offset="82%" stop-color="#EC4899" stop-opacity="0.58"/>',
    '<stop offset="100%" stop-color="#FBBF24" stop-opacity="0"/>',
    '</linearGradient>',
    '<linearGradient id="gkel" x1="25" y1="16" x2="50" y2="46" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E0F2FE"/><stop offset="55%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>',
    '<linearGradient id="gker" x1="95" y1="16" x2="70" y2="46" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FCE7F3"/><stop offset="52%" stop-color="#A855F7"/><stop offset="100%" stop-color="#EC4899"/></linearGradient>',
    '<linearGradient id="gkf1" x1="12" y1="60" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#BAE6FD"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>',
    '<linearGradient id="gkf2" x1="60" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E0F2FE"/><stop offset="65%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#0EA5E9"/></linearGradient>',
    '<linearGradient id="gkf3" x1="60" y1="12" x2="76" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#93C5FD"/><stop offset="55%" stop-color="#6366F1"/><stop offset="100%" stop-color="#4F46E5"/></linearGradient>',
    '<linearGradient id="gkf4" x1="60" y1="60" x2="108" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#7C3AED"/><stop offset="55%" stop-color="#A855F7"/><stop offset="100%" stop-color="#DDD6FE"/></linearGradient>',
    '<linearGradient id="gkf5" x1="12" y1="60" x2="60" y2="76" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="55%" stop-color="#D946EF"/><stop offset="100%" stop-color="#EC4899"/></linearGradient>',
    '<linearGradient id="gkf6" x1="44" y1="60" x2="60" y2="108" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#EC4899"/><stop offset="60%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FCE7F3"/></linearGradient>',
    '<linearGradient id="gkf7" x1="60" y1="60" x2="108" y2="76" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E11D48"/><stop offset="58%" stop-color="#F43F5E"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>',
    '<linearGradient id="gkf8" x1="60" y1="60" x2="76" y2="108" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F59E0B"/><stop offset="55%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#FEF3C7"/></linearGradient>',
    '</defs>',
    '<path d="M18 76C14 55 34 33 64 26C91 20 109 30 105 49" stroke="url(#gkorb)" stroke-width="2.2" stroke-linecap="round"/>',
    '<path d="M36 47Q24 30 27 17Q39 19 51 31Z" fill="url(#gkel)" fill-opacity="0.86" stroke="#FFFFFF" stroke-width="1.35" stroke-linejoin="round"/>',
    '<path d="M37 42Q30 30 32 22Q39 24 46 31Z" fill="#FFFFFF" fill-opacity="0.46"/>',
    '<path d="M84 47Q96 30 93 17Q81 19 69 31Z" fill="url(#gker)" fill-opacity="0.86" stroke="#FFFFFF" stroke-width="1.35" stroke-linejoin="round"/>',
    '<path d="M83 42Q90 30 88 22Q81 24 74 31Z" fill="#FFFFFF" fill-opacity="0.46"/>',
    '<path d="M12 60Q32 56 44 44L60 60Z" fill="url(#gkf1)"/>',
    '<path d="M44 44Q56 32 60 12L60 60Z" fill="url(#gkf2)"/>',
    '<path d="M60 12Q64 32 76 44L60 60Z" fill="url(#gkf3)"/>',
    '<path d="M76 44Q88 56 108 60L60 60Z" fill="url(#gkf4)"/>',
    '<path d="M12 60Q32 64 44 76L60 60Z" fill="url(#gkf5)"/>',
    '<path d="M44 76Q56 88 60 108L60 60Z" fill="url(#gkf6)"/>',
    '<path d="M108 60Q88 64 76 76L60 60Z" fill="url(#gkf7)"/>',
    '<path d="M76 76Q64 88 60 108L60 60Z" fill="url(#gkf8)"/>',
    '<path d="M60 12V108M12 60H108" stroke="#FFFFFF" stroke-opacity="0.58" stroke-width="1.15"/>',
    '<path d="M44 44L76 76M76 44L44 76" stroke="#FFFFFF" stroke-opacity="0.34" stroke-width="0.9"/>',
    '<path d="M60 12Q68 52 108 60Q68 68 60 108Q52 68 12 60Q52 52 60 12Z" stroke="#FFFFFF" stroke-opacity="0.92" stroke-width="1.25" stroke-linejoin="round"/>',
    '<polygon points="60,51 69,60 60,69 51,60" fill="#FFFFFF" fill-opacity="0.82"/>',
    '<path d="M97 19L98.7 23.8L103.5 25.5L98.7 27.2L97 32L95.3 27.2L90.5 25.5L95.3 23.8Z" fill="#FBBF24"/>',
    '<path d="M23 88L24.3 91.7L28 93L24.3 94.3L23 98L21.7 94.3L18 93L21.7 91.7Z" fill="#38BDF8"/>',
    '<circle cx="24" cy="34" r="1.8" fill="#FFFFFF" fill-opacity="0.9"/>',
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
  const homeGemMaskJson = JSON.stringify(buildHomeGemMaskUri());
  const brandMetaJson = JSON.stringify(BRAND_META);

  return `
  function initHostThemeSuite(ctx) {
    const THEME_PRESETS = ${presetsJson};
    const ROLE_PALETTES = ${palettesJson};
    const DEFAULT_CFG = ${defaultCfgJson};
    const BRAND = ${brandMetaJson};
    const ROLE_PATTERNS = ${rolePatternsJson};
    const ROLE_CREST_SVGS = ${roleCrestsJson};
    const ROLE_SPINNERS = ${roleSpinnersJson};
    const PAW_SPINNERS = ${pawSpinnersJson};
    const TOP_BRAND_PAW_URI = ${topBrandPawJson};
    const HOME_GEM_MASK_URI = ${homeGemMaskJson};
    const homeGemVer = encodeURIComponent((BRAND && BRAND.version) || '0.7.5') + '-1024';
    const HOME_GEM_LIGHT_URI = 'url("' + ctx.server + '/gemineko-sprites/home-star-gem-light.png?v=' + homeGemVer + '")';
    const HOME_GEM_DARK_URI = 'url("' + ctx.server + '/gemineko-sprites/home-star-gem-dark.png?v=' + homeGemVer + '")';
    const THEME_STYLE_ID = 'gemineko-host-theme-v5';
    const COMMUNITY_PACK_STYLE_ID = 'gemineko-community-pack-style';
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
    const OUTLINE_RATIO_KEY = 'gemineko_outline_y_ratio_v1';
    let outlineRo = null;
    let outlineTrackedConv = null;
    let outlineDragging = false;
    let outlineDragMoved = false;
    let outlineRaf = 0;

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

    const HOST_TYPO_KEY = 'gemineko_host_typography_v1';
    function readHostLocalTypo() {
      try {
        const raw = localStorage.getItem(HOST_TYPO_KEY);
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
    function writeHostLocalTypo(typo) {
      if (!typo || typeof typo !== 'object') return;
      try {
        localStorage.setItem(HOST_TYPO_KEY, JSON.stringify({
          sidecarFontSize: Math.max(11, Math.min(22, Math.round(Number(typo.sidecarFontSize) || 14))),
          hostFontScale: Math.max(85, Math.min(135, Math.round(Number(typo.hostFontScale) || 100))),
        }));
      } catch {}
    }

    const HOST_SPRITE_Q_KEY = 'gemineko_host_sprite_q_v1';
    function normSpriteQ(val) {
      const s = String(val || '');
      return s === '384' || s === '512' || s === '1024' ? s : '';
    }
    function readHostSpriteQ() {
      try { return normSpriteQ(localStorage.getItem(HOST_SPRITE_Q_KEY)); } catch { return ''; }
    }
    function writeHostSpriteQ(q) {
      const clean = normSpriteQ(q);
      if (!clean) return;
      try { localStorage.setItem(HOST_SPRITE_Q_KEY, clean); } catch {}
    }
    function getSpriteQuality() {
      return normSpriteQ(cfg?.spriteQuality) || readHostSpriteQ() || '1024';
    }

    const HOST_DOCK_KEY = 'gemineko_host_dock_v1';
    function normDockCfg(raw, base) {
      const d = raw && typeof raw === 'object' ? raw : {};
      const b = base && typeof base === 'object' ? base : { side: 'left', catSize: 100, badgeScale: 120, sidecarAvatarSize: 64 };
      const clampInt = (v, min, max, fb) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return fb;
        return Math.min(max, Math.max(min, Math.round(n)));
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
    function readHostDockCfg() {
      try {
        const raw = localStorage.getItem(HOST_DOCK_KEY);
        if (!raw) return null;
        return normDockCfg(JSON.parse(raw));
      } catch {
        return null;
      }
    }
    function writeHostDockCfg(d) {
      if (!d || typeof d !== 'object') return null;
      const clean = normDockCfg(d, readHostDockCfg() || DEFAULT_CFG.dock);
      try { localStorage.setItem(HOST_DOCK_KEY, JSON.stringify(clean)); } catch {}
      return clean;
    }
    function getDockConfig() {
      return normDockCfg(cfg?.dock, readHostDockCfg() || DEFAULT_CFG.dock);
    }

    function sanitizeLocalCfg(input) {
      const c = input && typeof input === 'object' ? input : {};
      const localTypo = !c.typography ? readHostLocalTypo() : null;
      const localDock = readHostDockCfg();
      const cleanQ = normSpriteQ(c.spriteQuality) || readHostSpriteQ() || '1024';
      return {
        ...DEFAULT_CFG,
        ...c,
        watermark: { ...DEFAULT_CFG.watermark, ...(c.watermark || {}) },
        i18n: { ...DEFAULT_CFG.i18n, ...(c.i18n || {}) },
        linkages: { ...DEFAULT_CFG.linkages, ...(c.linkages || {}) },
        workbench: { ...DEFAULT_CFG.workbench, ...(c.workbench || {}) },
        wallpaper: { ...DEFAULT_CFG.wallpaper, ...(c.wallpaper || {}) },
        typography: { ...(DEFAULT_CFG.typography || { sidecarFontSize: 14, hostFontScale: 100 }), ...(c.typography || localTypo || {}) },
        dock: normDockCfg(c.dock, localDock || DEFAULT_CFG.dock),
        easterEggs: {
          soundEnabled: typeof c.easterEggs?.soundEnabled === 'boolean' ? c.easterEggs.soundEnabled : true,
          unlocked: Array.isArray(c.easterEggs?.unlocked) ? c.easterEggs.unlocked : [],
        },
        startup: {
          enabled: typeof c.startup?.enabled === 'boolean' ? c.startup.enabled : true,
          soundEnabled: typeof c.startup?.soundEnabled === 'boolean' ? c.startup.soundEnabled : true,
          voiceEnabled: typeof c.startup?.voiceEnabled === 'boolean' ? c.startup.voiceEnabled : true,
        },
        spriteQuality: cleanQ,
      };
    }

    let lastReportedScheme = '';
    function getHostScheme() {
      const cs = document.documentElement?.style?.colorScheme || '';
      if (/dark/i.test(cs)) return 'dark';
      if (/light/i.test(cs)) return 'light';
      if (document.documentElement?.classList?.contains('dark')) return 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function reportHostScheme(scheme) {
      const clean = scheme === 'dark' ? 'dark' : (scheme === 'light' ? 'light' : '');
      if (!clean || clean === lastReportedScheme || !ctx.server || !ctx.token) return;
      lastReportedScheme = clean;
      fetch(\`\${ctx.server}/api/theme/host-scheme\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sidecar-Token': ctx.token,
        },
        body: JSON.stringify({ scheme: clean }),
      }).catch(() => {});
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
  font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important;
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
  font-size: calc(11.5px * var(--gk-host-font-scale, 1)) !important;
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
  width: calc(58px * var(--gk-host-font-scale, 1));
  height: calc(58px * var(--gk-host-font-scale, 1));
  object-fit: contain;
  image-rendering: auto;
  filter: drop-shadow(0 5px 12px var(--gk-role-glow));
}
#\${HOME_STAGE_ID} .gk-home-actor span {
  font-size: calc(10px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 700;
  color: var(--foreground);
  padding: 1px 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gk-role-primary) 12%, var(--secondary));
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 26%, transparent);
}
#\${HOME_STAGE_ID} .gk-home-brand-foot {
  margin-top: 7px;
  padding-top: 5px;
  border-top: 1px dashed color-mix(in srgb, var(--gk-role-primary) 18%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important;
  color: var(--muted-foreground);
  opacity: 0.86;
}
#\${HOME_STAGE_ID} .gk-home-brand-foot a {
  color: var(--gk-role-primary, #8b5cf6);
  font-weight: 700;
  text-decoration: none;
}
#\${HOME_STAGE_ID} .gk-home-brand-foot a:hover {
  text-decoration: underline;
}

/* === 7.5 提问模式 (ask_question) 主题舞台：上问题 / 左下抱臂仰头思考+真实编号气泡 / 右下选项+Other+提交 === */
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
  display: grid !important;
  grid-template-columns: 108px minmax(0, 1fr) !important;
  grid-auto-rows: min-content !important;
  column-gap: 12px !important;
  row-gap: 6px !important;
  align-items: end !important;
  width: 100% !important;
  margin-top: 6px !important;
}
.gk-ask-split-row > style {
  display: none !important;
}
.gk-ask-split-row > .gk-ask-header-span {
  grid-column: 1 / -1 !important;
  grid-row: 1 !important;
}
.gk-ask-split-row > .gk-ask-mascot-col {
  grid-column: 1 !important;
  grid-row: var(--gk-ask-row-start, 1) / span var(--gk-ask-rows, 2) !important;
  align-self: end !important;
  justify-self: center !important;
}
.gk-ask-split-row > :not(.gk-ask-mascot-col):not(.gk-ask-header-span):not(style) {
  grid-column: 2 !important;
  min-width: 0 !important;
  width: auto !important;
}
.gk-ask-mascot-col {
  width: 108px !important;
  flex-shrink: 0;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 4px;
  padding: 2px 0;
  user-select: none;
}
.gk-ask-thought-bubble {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  max-width: 106px;
  gap: 4px;
  row-gap: 2px;
  padding: 4px 8px;
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
  font-size: calc(13px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 800;
  color: var(--muted-foreground, #64748b);
  opacity: 0.26;
  transform: scale(0.92);
  transition: opacity 0.22s ease, transform 0.22s var(--gk-ease-spring), color 0.22s ease, text-shadow 0.22s ease;
}
.gk-ask-opt-letter .gk-ask-q {
  font-style: normal;
  font-size: calc(12px * var(--gk-host-font-scale, 1)) !important;
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
  width: 88px !important;
  height: 88px !important;
  object-fit: contain !important;
  background: transparent !important;
  display: block;
  filter: drop-shadow(0 6px 14px var(--gk-role-glow));
}
.gk-ask-options-col {
  min-width: 0 !important;
  width: auto !important;
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
  position: fixed; z-index: 2147483642; max-width: min(calc(300px * max(var(--gk-host-font-scale, 1), var(--gk-dock-badge-scale, 1.15))), calc(100vw - 24px)); padding: calc(8px * var(--gk-dock-badge-scale, 1.15)) calc(12px * var(--gk-dock-badge-scale, 1.15)); border-radius: 14px;
  font-size: calc(12px * max(var(--gk-host-font-scale, 1), var(--gk-dock-badge-scale, 1.15))) !important; line-height: 1.45; color: var(--foreground, #1e1b4b); font-weight: 500;
  background: var(--gk-popover-bg, var(--glass)); border: 1.5px solid var(--gk-bubble-accent, var(--gk-role-primary, #8b5cf6));
  box-shadow: 0 12px 28px -8px var(--gk-role-glow), var(--glass-shadow); pointer-events: auto;
  text-rendering: geometricPrecision;
  animation: gkBubblePop 0.22s var(--gk-ease-spring);
}
.gk-speech-bubble::after {
  content: ""; position: absolute; left: var(--gk-tail-x, 28px); bottom: -6px; width: 9px; height: 9px;
  transform: translateX(-50%) rotate(45deg); background: var(--gk-popover-bg, var(--glass));
  border-right: 1.5px solid var(--gk-bubble-accent, var(--gk-role-primary, #8b5cf6));
  border-bottom: 1.5px solid var(--gk-bubble-accent, var(--gk-role-primary, #8b5cf6));
}
.gk-speech-bubble.is-below::after {
  bottom: auto; top: -6px; border-right: none; border-bottom: none;
  border-left: 1.5px solid var(--gk-bubble-accent, var(--gk-role-primary, #8b5cf6));
  border-top: 1.5px solid var(--gk-bubble-accent, var(--gk-role-primary, #8b5cf6));
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
  padding: 8px 18px; border-radius: 999px; font-size: calc(12.5px * var(--gk-host-font-scale, 1)) !important; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #3b82f6, #a855f7, #ec4899);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.42); pointer-events: none; animation: gkBubblePop 0.25s ease-out;
}
.gk-dock-theme-btn {
  border: none; background: rgba(139, 92, 246, 0.16); color: inherit; width: calc(21px * var(--gk-dock-badge-scale, 1.15)); height: calc(21px * var(--gk-dock-badge-scale, 1.15));
  border-radius: 999px; cursor: pointer; font-size: calc(12px * var(--gk-dock-badge-scale, 1.15)) !important; line-height: 1; padding: 0;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.gk-dock-theme-btn:hover { background: rgba(139, 92, 246, 0.30); }
#\${MINI_BAR_ID} {
  position: fixed; z-index: 2147483644; display: none; flex-direction: column; gap: 7px; width: min(calc(308px * var(--gk-host-font-scale, 1)), calc(100vw - 24px)); padding: 11px 12px;
  border-radius: 15px; background: var(--gk-popover-bg, var(--glass)); color: var(--foreground);
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary) 34%, var(--glass-border));
  box-shadow: 0 16px 40px -12px var(--gk-role-glow), var(--glass-shadow); backdrop-filter: blur(16px); font-size: calc(11.5px * var(--gk-host-font-scale, 1)) !important;
  max-height: calc(100vh - 36px); overflow-y: auto;
}
#\${MINI_BAR_ID}.is-open { display: flex; }
#\${MINI_BAR_ID} .gk-mini-label { font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important; opacity: 0.72; font-weight: 700; }
#\${MINI_BAR_ID} .gk-mini-row { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
#\${MINI_BAR_ID} .gk-mini-range-row { display: flex; align-items: center; gap: 8px; font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important; }
#\${MINI_BAR_ID} .gk-mini-range-row span { flex: 0 0 auto; min-width: 96px; opacity: 0.88; }
#\${MINI_BAR_ID} .gk-mini-range-row input[type="range"] { flex: 1 1 auto; accent-color: var(--gk-role-primary, #8b5cf6); cursor: pointer; min-width: 80px; }
#\${MINI_BAR_ID} button.gk-mini-chip {
  padding: 3.5px 8px; border-radius: 999px; border: 1px solid var(--border);
  background: var(--secondary); color: var(--foreground); font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important; cursor: pointer;
}
#\${MINI_BAR_ID} button.gk-mini-chip.is-active { background: var(--gk-role-primary, #8b5cf6); color: #fff; border-color: transparent; }
#\${OUTLINE_FAB_ID} {
  position: fixed; right: 0; top: 48%; z-index: 2147483620;
  width: calc(24px * var(--gk-host-font-scale, 1)); height: calc(42px * var(--gk-host-font-scale, 1));
  border-radius: 12px 0 0 12px; padding: 0 2px 0 4px;
  border: 1px solid color-mix(in srgb, var(--gk-role-primary) 34%, var(--glass-border)); border-right: none;
  background: var(--gk-popover-bg, var(--glass)); background-image: var(--gk-surface-sheen);
  color: var(--gk-role-primary, #8b5cf6); box-shadow: var(--nux-chip-shadow);
  backdrop-filter: blur(10px); cursor: pointer; user-select: none; touch-action: none;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: calc(13px * var(--gk-host-font-scale, 1)) !important; opacity: 0.46;
  transition: width 0.2s var(--gk-ease-spring), opacity 0.2s ease, background-color 0.2s ease;
}
#\${OUTLINE_FAB_ID}:is(:hover, .is-open) {
  width: calc(32px * var(--gk-host-font-scale, 1)); opacity: 0.98;
}
#\${OUTLINE_FAB_ID}.is-dragging {
  width: calc(32px * var(--gk-host-font-scale, 1)); opacity: 1; cursor: ns-resize; transition: none;
}
#\${OUTLINE_POP_ID} {
  position: fixed; left: 16px; top: 134px; right: auto; z-index: 2147483622;
  width: min(calc(280px * var(--gk-host-font-scale, 1)), calc(100vw - 48px)); max-height: 360px; display: none;
  flex-direction: column; gap: 6px; padding: 10px; border-radius: 14px; background: var(--gk-popover-bg, var(--glass));
  color: var(--foreground); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); backdrop-filter: blur(14px);
}
#\${OUTLINE_POP_ID}.is-open { display: flex; }
#\${OUTLINE_POP_ID} input {
  width: 100%; box-sizing: border-box; padding: 5px 8px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--background); color: var(--foreground); font-size: calc(11.5px * var(--gk-host-font-scale, 1)) !important;
}
#\${OUTLINE_POP_ID} .gk-outline-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; max-height: 280px; }
#\${OUTLINE_POP_ID} button.gk-outline-item {
  text-align: left; padding: 5px 8px; border-radius: 8px; border: none; background: var(--secondary);
  color: var(--foreground); font-size: calc(11px * var(--gk-host-font-scale, 1)) !important; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#\${OUTLINE_POP_ID} button.gk-outline-item:hover { background: var(--onyx-selected); }
.gk-outline-flash { outline: 2px solid var(--gk-role-primary, #8b5cf6) !important; outline-offset: 4px; transition: outline-color 0.4s ease; }
.gk-code-sticky-bar {
  position: sticky; top: 0; z-index: 6; display: flex; align-items: center; justify-content: space-between;
  padding: 5px 10px; margin-bottom: 4px; border-radius: 8px 8px 0 0;
  background: color-mix(in srgb, var(--onyx-raised, #1e2238) 92%, transparent);
  color: var(--muted-foreground); font-size: calc(11px * var(--gk-host-font-scale, 1)) !important; border-bottom: 1px solid var(--border);
}
.gk-code-fold-btn {
  border: 1px solid var(--card-border); background: var(--secondary); color: var(--foreground);
  border-radius: 6px; padding: 1px 7px; font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important; cursor: pointer;
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
  color: inherit; font-size: calc(12px * var(--gk-host-font-scale, 1)) !important; cursor: pointer; display: flex; align-items: center; gap: 7px;
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
@keyframes gkGem3DFloat {
  0%, 100% { transform: translate3d(0px, 0px, 0px); }
  50% { transform: translate3d(0px, -5px, 4px); }
}
@keyframes gkGemIridescence {
  0%, 100% {
    filter: drop-shadow(0 12px 22px rgba(56, 189, 248, 0.24)) drop-shadow(0 4px 12px rgba(139, 92, 246, 0.16)) saturate(1.02);
  }
  50% {
    filter: drop-shadow(0 15px 28px rgba(168, 85, 247, 0.30)) drop-shadow(0 6px 14px rgba(236, 72, 153, 0.22)) saturate(1.12);
  }
}
@keyframes gkGemIridescenceDark {
  0%, 100% {
    filter: drop-shadow(0 14px 28px rgba(56, 189, 248, 0.36)) drop-shadow(0 0 18px rgba(139, 92, 246, 0.30)) saturate(1.04);
  }
  50% {
    filter: drop-shadow(0 18px 34px rgba(168, 85, 247, 0.44)) drop-shadow(0 0 24px rgba(236, 72, 153, 0.36)) saturate(1.16);
  }
}
@keyframes gkPrismHaloOrbit {
  0% { transform: rotate(0deg) scale(0.96); }
  50% { transform: rotate(180deg) scale(1.06); }
  100% { transform: rotate(360deg) scale(0.96); }
}
@keyframes gkPrismFacetFlow {
  0%, 100% { background-position: 0% 50%; opacity: 0.48; }
  50% { background-position: 100% 50%; opacity: 0.84; }
}
@keyframes gkGemSheenSweep {
  0%, 48% { transform: translateX(-155%) rotate(24deg); opacity: 0; }
  66% { opacity: 0.92; }
  86%, 100% { transform: translateX(165%) rotate(24deg); opacity: 0; }
}
@keyframes gkStarTwinkle {
  0%, 100% { opacity: 0.45; transform: translateZ(28px) scale(0.84) rotate(0deg); }
  50% { opacity: 1; transform: translateZ(28px) scale(1.16) rotate(16deg); }
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

/* 焦点 1：左上角 Antigravity 小 A 全量还原为《基米窝》发光炫彩猫爪星芒宝石徽章 */
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
  background: transparent !important;
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

/* 焦点 3：空白首页主视觉高定重构（严格中轴居中 × 208×208 原生 1024px 超清钻石棱镜哈基米 × 中心透空防冲白四层流光） */
html[data-gk-theme]:not([data-gk-intensity="minimal"]) .agy-home .home-greeting-mark,
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-testid="home-greeting"] .home-greeting-mark {
  display: none !important;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) :is(.agy-home [data-testid="home-greeting"], [data-testid="home-greeting"], [data-gk-home-greeting-host="1"]) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
  gap: 2px !important;
}
#\${HOME_EMBLEM_ID} {
  position: relative !important;
  width: 208px !important;
  height: 208px !important;
  min-width: 208px !important;
  min-height: 208px !important;
  margin: 0 auto 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  user-select: none !important;
  overflow: visible !important;
  flex-shrink: 0 !important;
  perspective: 820px !important;
  perspective-origin: 50% 50% !important;
}
#\${HOME_EMBLEM_ID} .gk-he-halo {
  position: absolute;
  inset: 14px;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(30px);
  opacity: 0.22;
  background: conic-gradient(from 0deg, #38BDF8, #6366F1, #A855F7, #EC4899, #FBBF24, #38BDF8);
  animation: gkPrismHaloOrbit 16s linear infinite;
  transition: opacity 0.26s ease;
}
html[data-gk-scheme="dark"] #\${HOME_EMBLEM_ID} .gk-he-halo {
  opacity: 0.44;
}
#\${HOME_EMBLEM_ID}:hover .gk-he-halo {
  opacity: 0.36;
}
html[data-gk-scheme="dark"] #\${HOME_EMBLEM_ID}:hover .gk-he-halo {
  opacity: 0.58;
}
#\${HOME_EMBLEM_ID} .gk-he-stage {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  will-change: transform;
  animation: gkGem3DFloat 6.2s ease-in-out infinite;
  transition: transform 0.28s var(--gk-ease-spring);
}
#\${HOME_EMBLEM_ID} .gk-he-stage.is-tilting {
  animation: none !important;
  transform: rotateX(var(--gk-gem-rx, 0deg)) rotateY(var(--gk-gem-ry, 0deg)) translateZ(6px) !important;
  transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1) !important;
}
#\${HOME_EMBLEM_ID}:hover .gk-he-stage {
  transform: rotateX(var(--gk-gem-rx, 0deg)) rotateY(var(--gk-gem-ry, 0deg)) scale(1.035) translateZ(6px) !important;
}
#\${HOME_EMBLEM_ID}.is-sparkling .gk-he-stage {
  animation: none !important;
  transform: rotateX(var(--gk-gem-rx, 0deg)) rotateY(var(--gk-gem-ry, 0deg)) scale(1.07) translateZ(10px) !important;
}
#\${HOME_EMBLEM_ID} .gk-he-caustic {
  position: absolute;
  inset: 158px 30px -8px;
  border-radius: 999px;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.22) 0%, rgba(168, 85, 247, 0.14) 55%, transparent 82%);
  filter: blur(14px);
  opacity: 0.54;
  transform: translate3d(var(--gk-gem-cx, 0px), var(--gk-gem-cy, 0px), -18px);
  transition: transform 0.18s ease-out, opacity 0.24s ease;
}
html[data-gk-scheme="dark"] #\${HOME_EMBLEM_ID} .gk-he-caustic {
  background: radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.52) 0%, rgba(56, 189, 248, 0.32) 58%, transparent 84%);
  opacity: 0.80;
}
#\${HOME_EMBLEM_ID} .gk-he-gem {
  position: relative;
  z-index: 1;
  width: 208px;
  height: 208px;
  border-radius: 0;
  display: block;
  pointer-events: none;
  transform: translateZ(0px);
  background-image: \${HOME_GEM_LIGHT_URI};
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  image-rendering: -webkit-optimize-contrast;
  border: none;
  box-shadow: none;
  filter: drop-shadow(0 14px 26px rgba(56, 189, 248, 0.22)) drop-shadow(0 5px 14px rgba(139, 92, 246, 0.14));
  animation: gkGemIridescence 7.5s ease-in-out infinite;
  transition: filter 0.24s ease;
}
html[data-gk-scheme="dark"] #\${HOME_EMBLEM_ID} .gk-he-gem {
  background-image: \${HOME_GEM_DARK_URI};
  border: none;
  box-shadow: none;
  filter: drop-shadow(0 16px 32px rgba(56, 189, 248, 0.36)) drop-shadow(0 0 20px rgba(139, 92, 246, 0.30));
  animation: gkGemIridescenceDark 7.5s ease-in-out infinite;
}
#\${HOME_EMBLEM_ID}.is-sparkling .gk-he-gem {
  filter: brightness(1.08) saturate(1.14) drop-shadow(0 0 18px rgba(56, 189, 248, 0.54)) drop-shadow(0 8px 26px rgba(236, 72, 153, 0.40)) !important;
  box-shadow: none !important;
}
#\${HOME_EMBLEM_ID} .gk-he-sheen {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 0;
  pointer-events: none;
  transform: translateZ(8px);
  background: radial-gradient(circle 66px at var(--gk-gem-gx, 32%) var(--gk-gem-gy, 22%), rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 48%, transparent 74%);
  -webkit-mask-image: \${HOME_GEM_MASK_URI};
  mask-image: \${HOME_GEM_MASK_URI};
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  mix-blend-mode: overlay;
  overflow: hidden;
}
html[data-gk-scheme="dark"] #\${HOME_EMBLEM_ID} .gk-he-sheen {
  background: radial-gradient(circle 66px at var(--gk-gem-gx, 32%) var(--gk-gem-gy, 22%), rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 48%, transparent 74%);
  mix-blend-mode: screen;
}
#\${HOME_EMBLEM_ID} .gk-he-sheen::before {
  content: "";
  position: absolute;
  inset: -42%;
  background: linear-gradient(122deg, transparent 38%, rgba(56, 189, 248, 0.24) 45%, rgba(255, 255, 255, 0.44) 50%, rgba(236, 72, 153, 0.22) 55%, transparent 62%);
  animation: gkGemSheenSweep 5.4s ease-in-out infinite;
}
html[data-gk-scheme="dark"] #\${HOME_EMBLEM_ID} .gk-he-sheen::before {
  background: linear-gradient(122deg, transparent 36%, rgba(56, 189, 248, 0.34) 44%, rgba(255, 255, 255, 0.68) 50%, rgba(236, 72, 153, 0.32) 56%, transparent 64%);
}
#\${HOME_EMBLEM_ID} .gk-he-sheen::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(132deg, rgba(56, 189, 248, 0) 0%, rgba(56, 189, 248, 0.28) 24%, rgba(168, 85, 247, 0.32) 48%, rgba(244, 114, 182, 0.28) 68%, rgba(251, 191, 36, 0.22) 84%, rgba(56, 189, 248, 0) 100%);
  background-size: 260% 260%;
  -webkit-mask-image: radial-gradient(circle, transparent 42%, #000 78%);
  mask-image: radial-gradient(circle, transparent 42%, #000 78%);
  animation: gkPrismFacetFlow 7.2s ease-in-out infinite;
}
#\${HOME_EMBLEM_ID} .gk-he-spark {
  position: absolute;
  pointer-events: none;
  z-index: 3;
  line-height: 1;
  user-select: none;
}
#\${HOME_EMBLEM_ID} .gk-he-spark-a {
  top: 16px;
  right: 16px;
  font-size: 14px;
  color: #38BDF8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.75), 0 0 14px rgba(168, 85, 247, 0.45);
  animation: gkStarTwinkle 3.2s ease-in-out infinite;
}
#\${HOME_EMBLEM_ID} .gk-he-spark-b {
  bottom: 22px;
  left: 16px;
  font-size: 12px;
  color: #EC4899;
  text-shadow: 0 0 8px rgba(236, 72, 153, 0.72), 0 0 14px rgba(251, 191, 36, 0.42);
  animation: gkStarTwinkle 3.8s ease-in-out 1.4s infinite;
}
html[data-gk-theme] .agy-home > :not(#\${AURORA_HOST_ID}):not(#\${WATERMARK_ID}) {
  position: relative;
  z-index: 1;
}
html[data-gk-theme]:not([data-gk-intensity="minimal"]) .agy-home [data-testid="home-greeting"] :is(.home-greeting-title, h1, h2),
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-gk-home-greeting-host="1"] :is(.home-greeting-title, h1, h2),
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-gk-home-title="1"],
html[data-gk-theme]:not([data-gk-intensity="minimal"]) [data-gk-home-title="1"] span {
  background: linear-gradient(110deg, #1E1B4B 0%, #4F46E5 22%, #9333EA 46%, #DB2777 68%, #0284C7 88%, #1E1B4B 100%) !important;
  background-size: 240% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  font-weight: 600 !important;
  letter-spacing: -0.024em !important;
  line-height: 1.32 !important;
  text-align: center !important;
  animation: gkPrismHairlineFlow 9s linear infinite !important;
}
html[data-gk-theme][data-gk-scheme="dark"]:not([data-gk-intensity="minimal"]) .agy-home [data-testid="home-greeting"] :is(.home-greeting-title, h1, h2),
html[data-gk-theme][data-gk-scheme="dark"]:not([data-gk-intensity="minimal"]) [data-gk-home-greeting-host="1"] :is(.home-greeting-title, h1, h2),
html[data-gk-theme][data-gk-scheme="dark"]:not([data-gk-intensity="minimal"]) [data-gk-home-title="1"],
html[data-gk-theme][data-gk-scheme="dark"]:not([data-gk-intensity="minimal"]) [data-gk-home-title="1"] span {
  background: linear-gradient(110deg, #F8FAFC 0%, #7DD3FC 22%, #C4B5FD 46%, #F9A8D4 68%, #FDE68A 88%, #F8FAFC 100%) !important;
  background-size: 240% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  font-weight: 600 !important;
  letter-spacing: -0.024em !important;
  line-height: 1.32 !important;
  text-align: center !important;
  animation: gkPrismHairlineFlow 9s linear infinite !important;
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
html[data-gk-theme="cream-paper"][data-gk-intensity="optical-neko"][data-gk-scheme="light"] {
  --background: #FCF8F0 !important;
  --content: #FCF8F0 !important;
  --body-background: #FCF8F0 !important;
  --shell: #FCF8F0 !important;
  --sidebar: #F4EDE1 !important;
  --shell-canvas: #F4EDE1 !important;
  --card: #FFFDF8 !important;
  --gk-optical-canvas: #FCF8F0;
  --gk-optical-sidebar: #F4EDE1;
  --gk-optical-titlebar: #F7F1E6;
  --gk-optical-card-fill: #FFFDF8;
  --gk-optical-glass-fill: rgba(255, 253, 248, 0.92);
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] {
  --gk-optical-canvas: #101225;
  --gk-optical-sidebar: #0A0C1A;
  --gk-optical-titlebar: #0D0F20;
  --gk-optical-card-fill: rgba(24, 27, 48, 0.92);
  --gk-optical-glass-fill: rgba(20, 23, 42, 0.88);
  --gk-optical-sheen: linear-gradient(172deg, rgba(255, 255, 255, 0.068) 0%, rgba(168, 196, 255, 0.026) 34%, rgba(10, 12, 26, 0.24) 100%);
  --gk-optical-border-top: rgba(255, 255, 255, 0.15);
  --gk-optical-border-base: rgba(218, 228, 255, 0.09);
  --gk-optical-shadow-card: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.36), 0 18px 42px -14px rgba(0, 0, 0, 0.56);
  --gk-optical-shadow-float: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 4px 12px rgba(0, 0, 0, 0.42), 0 28px 64px -18px rgba(0, 0, 0, 0.68);
  --gk-optical-rim-core: rgba(255, 255, 255, 0.94);
  --gk-optical-specular-spot: rgba(232, 242, 255, 0.11);
}
html[data-gk-theme="carbon-obsidian"][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] {
  --background: #07080B !important;
  --content: #07080B !important;
  --body-background: #07080B !important;
  --shell: #07080B !important;
  --sidebar: #040406 !important;
  --shell-canvas: #040406 !important;
  --card: #0E1016 !important;
  --gk-optical-canvas: #07080B;
  --gk-optical-sidebar: #040406;
  --gk-optical-titlebar: #060709;
  --gk-optical-card-fill: rgba(14, 16, 22, 0.96);
  --gk-optical-glass-fill: rgba(12, 14, 19, 0.92);
  --gk-optical-sheen: linear-gradient(172deg, rgba(255, 255, 255, 0.075) 0%, rgba(226, 232, 240, 0.018) 32%, rgba(4, 4, 6, 0.36) 100%);
  --gk-optical-border-top: rgba(226, 232, 240, 0.18);
  --gk-optical-border-base: rgba(203, 213, 225, 0.09);
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

/* 全局动态字号缩放（默认 100% 时零侵入；调整后协同放大侧栏与对话区） */
html[data-gk-theme][data-gk-font-scaled="1"] {
  font-size: calc(16px * var(--gk-host-font-scale, 1)) !important;
}
html[data-gk-theme][data-gk-font-scaled="1"] :is(aside.bg-sidebar, [data-testid="conversation-row-sidebar"]) {
  font-size: calc(13.5px * var(--gk-host-font-scale, 1)) !important;
  line-height: 1.45 !important;
}
html[data-gk-theme][data-gk-font-scaled="1"] [data-testid="conversation-row-sidebar"] span.truncate {
  font-size: inherit !important;
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
  #\${HOME_EMBLEM_ID} .gk-he-stage,
  #\${HOME_EMBLEM_ID} .gk-he-gem,
  #\${HOME_EMBLEM_ID} .gk-he-sheen::before,
  #\${HOME_EMBLEM_ID} .gk-he-sheen::after,
  #\${HOME_EMBLEM_ID} .gk-he-spark,
  .agy-home [data-testid="home-greeting"] :is(.home-greeting-title, h1, h2),
  [data-gk-home-greeting-host="1"] :is(.home-greeting-title, h1, h2),
  [data-gk-home-title="1"],
  [data-gk-home-title="1"] span
) {
  animation: none !important;
}

/* v0.6.3：1. 去 optical-neko 思考条/文件卡/行内代码突兀紫框；2. 提浅色右下水印清晰度；3. 滚动底端留白防 Dock 挤占操作按钮 */
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]) {
  background: transparent !important;
  border: 1px solid transparent !important;
  padding: 3px 6px !important;
  box-shadow: none !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]):hover {
  background: rgba(15, 23, 42, 0.04) !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="dark"] :is([data-testid="worked-for-collapsible"], [data-testid="thinking-collapsible-trigger"], [data-testid="tool-group-collapsible"]):hover {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"] :is([data-testid="changed-files-card"], [data-testid="changed-files-card"] + div > div, [data-testid="artifact-card"], [data-testid="bubble-artifact-card"], .artifact-card, [data-testid="running-items-panel"]) {
  background-color: var(--gk-optical-card-fill) !important;
  background-image: var(--gk-optical-sheen) !important;
  border: 1px solid var(--gk-optical-border-base) !important;
  box-shadow: var(--gk-optical-shadow-card) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] #\${WATERMARK_ID} {
  opacity: clamp(0.32, calc(var(--gk-watermark-opacity, 0.14) * 2.8), 0.52) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] #\${WATERMARK_ID} img.gk-wm-sprite {
  filter: saturate(1.22) contrast(1.06) drop-shadow(0 6px 18px color-mix(in srgb, var(--gk-role-primary) 26%, transparent)) !important;
}
html[data-gk-theme][data-gk-intensity="optical-neko"][data-gk-scheme="light"] #\${WATERMARK_ID} .gk-wm-tag {
  background: rgba(255, 255, 255, 0.78) !important;
  border-color: color-mix(in srgb, var(--gk-role-primary) 28%, transparent) !important;
  opacity: 0.92 !important;
}
html[data-gk-theme] [data-testid="autoscroll-viewport"] > div:last-child {
  padding-bottom: 72px !important;
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

    function syncCommunityPackLayer(root) {
      const pack = cfg.enabled && cfg.activeThemePack && typeof cfg.activeThemePack === 'object' ? cfg.activeThemePack : null;
      const existingStyle = document.getElementById(COMMUNITY_PACK_STYLE_ID);
      if (!pack || !pack.id || pack.id === 'official-gemineko') {
        if (root) root.removeAttribute('data-gk-pack');
        if (existingStyle) existingStyle.remove();
        return;
      }

      if (root) {
        root.setAttribute('data-gk-pack', pack.id);
        const acc = pack.accent && typeof pack.accent === 'object' ? pack.accent : {};
        if (acc.primary) root.style.setProperty('--gk-role-primary', acc.primary);
        if (acc.accent2) root.style.setProperty('--gk-role-accent2', acc.accent2);
        if (acc.accent3) root.style.setProperty('--gk-role-accent3', acc.accent3);
        if (acc.glow) root.style.setProperty('--gk-role-glow', acc.glow);
        if (acc.gradient) root.style.setProperty('--gk-role-gradient', acc.gradient);
        if (Array.isArray(pack.aurora)) {
          if (pack.aurora[0]) root.style.setProperty('--gk-aurora-1', pack.aurora[0]);
          if (pack.aurora[1]) root.style.setProperty('--gk-aurora-2', pack.aurora[1]);
          if (pack.aurora[2]) root.style.setProperty('--gk-aurora-3', pack.aurora[2]);
        }
      }

      const tokenEntries = pack.tokens && typeof pack.tokens === 'object'
        ? Object.entries(pack.tokens)
            .filter(([k, v]) => /^--[a-zA-Z0-9-]{1,48}$/.test(k) && typeof v === 'string' && !/[;{}]/.test(v))
            .map(([k, v]) => \`\${k}: \${v};\`)
            .join(' ')
        : '';
      const safeCssText = [
        tokenEntries ? \`html[data-gk-theme][data-gk-pack="\${pack.id}"] { \${tokenEntries} }\` : '',
        typeof pack.customCss === 'string' ? pack.customCss : '',
      ].filter(Boolean).join('\\n');

      if (!safeCssText) {
        if (existingStyle) existingStyle.remove();
        return;
      }
      let packSt = existingStyle;
      if (!packSt) {
        packSt = document.createElement('style');
        packSt.id = COMMUNITY_PACK_STYLE_ID;
        document.head.appendChild(packSt);
      }
      if (packSt.textContent !== safeCssText) {
        packSt.textContent = safeCssText;
      }
    }

    function applyThemeDom(activity) {
      const root = document.documentElement;
      if (!root) return;
      if (!cfg.enabled) {
        for (const attr of ['data-gk-theme','data-gk-scheme','data-gk-role','data-gk-intensity','data-gk-spinner','data-gk-radius','data-gk-motion','data-gk-focus','data-gk-active','data-gk-smooth','data-gk-accent-on','data-gk-wallpaper','data-gk-pack','data-gk-font-scaled']) {
          root.removeAttribute(attr);
        }
        root.style.removeProperty('--gk-host-font-scale');
        root.style.removeProperty('--gk-dock-cat-size');
        root.style.removeProperty('--gk-dock-badge-scale');
        for (const id of [THEME_STYLE_ID, COMMUNITY_PACK_STYLE_ID, AURORA_HOST_ID, HOME_STAGE_ID, HOME_EMBLEM_ID, WATERMARK_ID]) {
          const n = document.getElementById(id);
          if (n) n.remove();
        }
        syncWallpaperLayer();
        syncNightLamp();
        return;
      }

      ensureThemeStyleTag();
      reportHostScheme(getHostScheme());
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
      const hostScale = Math.max(85, Math.min(135, Math.round(Number(cfg.typography?.hostFontScale) || 100)));
      if (hostScale !== 100) {
        root.setAttribute('data-gk-font-scaled', '1');
        root.style.setProperty('--gk-host-font-scale', (hostScale / 100).toFixed(3));
      } else {
        root.removeAttribute('data-gk-font-scaled');
        root.style.removeProperty('--gk-host-font-scale');
      }
      const dockCfg = getDockConfig();
      root.style.setProperty('--gk-dock-cat-size', \`\${dockCfg.catSize}px\`);
      root.style.setProperty('--gk-dock-badge-scale', (dockCfg.badgeScale / 100).toFixed(3));

      syncCommunityPackLayer(root);
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
      const host = greetingEl || markEl?.parentElement;
      if (!host) return;
      host.setAttribute('data-gk-home-greeting-host', '1');
      const titleEl = host.querySelector('.home-greeting-title, h1, h2, h3, p')
        || Array.from(host.children).find((el) => el.id !== HOME_EMBLEM_ID && el.tagName !== 'SVG' && (el.textContent || '').trim().length > 0);
      if (titleEl && titleEl.getAttribute('data-gk-home-title') !== '1') {
        titleEl.setAttribute('data-gk-home-title', '1');
      }

      let emblem = document.getElementById(HOME_EMBLEM_ID);
      if (!emblem) {
        emblem = document.createElement('div');
        emblem.id = HOME_EMBLEM_ID;
        emblem.title = 'Gemineko Hive · 基米窝';
        emblem.innerHTML = '<span class="gk-he-halo"></span><div class="gk-he-stage"><span class="gk-he-caustic"></span><span class="gk-he-gem"></span><span class="gk-he-sheen"></span><span class="gk-he-spark gk-he-spark-a">✦</span><span class="gk-he-spark gk-he-spark-b">✦</span></div>';
        emblem.addEventListener('click', (e) => {
          e.stopPropagation();
          emblem.classList.remove('is-sparkling');
          void emblem.offsetWidth;
          emblem.classList.add('is-sparkling');
          setTimeout(() => emblem.classList.remove('is-sparkling'), 520);
          if (window.__GEMINEKO_EGG_API__?.onHomeEmblemTap?.({ x: e.clientX, y: e.clientY, el: emblem })) {
            return;
          }
          spawnStardust(e.clientX, e.clientY, 18, 'confetti');
          onDockPoke(resolveActiveRoleId(ctx.getActivity()), e.clientX, e.clientY, emblem);
        });
      }
      if (emblem.parentElement !== host || host.firstElementChild !== emblem) {
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
      const spriteQ = getSpriteQuality();
      const spriteUrl = isCustom
        ? \`\${ctx.server}/api/watermark/file?v=\${encodeURIComponent(String(cfg.updatedAt || 1))}\`
        : \`\${ctx.server}/gemineko-sprites/\${wmRole}-\${actName}.png?q=\${spriteQ}&v=0.7.10\`;
      const fallbackUrl = \`\${ctx.server}/gemineko-sprites/\${wmRole}-thinking.png?q=\${spriteQ}&v=0.7.10\`;

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
      const maodieActive = wm.classList.contains('gk-egg-maodie-active');
      const img = wm.querySelector('img.gk-wm-sprite');
      if (img) {
        if (img.dataset.gkErrBound !== '1') {
          img.dataset.gkErrBound = '1';
          img.addEventListener('error', () => {
            if (img.dataset.gkFb === '1') return;
            img.dataset.gkFb = '1';
            img.src = img.dataset.gkFallbackSrc || \`\${ctx.server}/gemineko-sprites/neon-thinking.png?q=\${getSpriteQuality()}&v=0.8.1\`;
          });
        }
        img.dataset.gkFallbackSrc = fallbackUrl;
        if (!maodieActive && img.getAttribute('data-src') !== spriteUrl) {
          img.dataset.gkFb = '0';
          img.setAttribute('data-src', spriteUrl);
          img.src = spriteUrl;
        }
      }
      const tag = wm.querySelector('.gk-wm-tag');
      if (tag && !maodieActive) {
        const nextTitle = pal.crestTitle || \`\${wmRole.toUpperCase()} · GEMINEKO\`;
        if (tag.textContent !== nextTitle) tag.textContent = nextTitle;
      }
    }

    let askStageRef = null;
    let askOptListRef = null;
    let askLabelsSig = '';
    let askRouletteTimer = null;
    let askHoveredIdx = -1;
    let askLitIdx = 0;
    let askOptCount = 2;

    function clearAskStage() {
      if (askRouletteTimer) {
        clearInterval(askRouletteTimer);
        askRouletteTimer = null;
      }
      if (askStageRef && askStageRef.isConnected) {
        askStageRef.removeAttribute('data-gk-ask-stage');
        askStageRef.querySelectorAll('.gk-ask-mascot-col').forEach((col) => col.remove());
        askStageRef.querySelectorAll('.gk-ask-split-row').forEach((row) => {
          row.classList.remove('gk-ask-split-row');
          row.style.removeProperty('--gk-ask-rows');
          row.style.removeProperty('--gk-ask-row-start');
        });
        askStageRef.querySelectorAll('.gk-ask-options-col').forEach((oc) => {
          oc.classList.remove('gk-ask-options-col');
        });
        askStageRef.querySelectorAll('.gk-ask-header-span').forEach((hs) => {
          hs.classList.remove('gk-ask-header-span');
        });
      }
      askStageRef = null;
      askOptListRef = null;
      askLabelsSig = '';
      askHoveredIdx = -1;
    }

    function findActiveAskQuestionPanel() {
      const scope = document.querySelector('[data-testid="conversation-view"]') || document.body;
      if (!scope) return null;
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      const boxBottom = box ? box.getBoundingClientRect().bottom : Infinity;

      const optSeeds = [...scope.querySelectorAll('[data-testid="ask-question-option"], [data-testid="ask-question-writein"]')];
      for (const seed of optSeeds) {
        if (seed.closest('[data-testid*="readonly"], #gemineko-home-stage, #gemineko-cdp-composer-dock')) continue;
        const r = seed.getBoundingClientRect();
        if (r.width < 80 || r.height < 14 || r.top > boxBottom) continue;
        let cur = seed.parentElement;
        let fallbackCard = null;
        while (cur && cur !== scope && cur !== document.body && cur !== document.documentElement) {
          if (box && cur.contains(box)) break;
          if (cur.matches?.('[data-testid="conversation-view"], [data-testid="autoscroll-viewport"]')) break;
          const hasHeader = Boolean(cur.querySelector('[data-testid="ask-question-header-text"]'));
          const cls = typeof cur.className === 'string' ? cur.className : '';
          if (hasHeader && /(?:border|rounded|shadow|card|bg-)/.test(cls)) {
            return cur;
          }
          if (hasHeader && !fallbackCard) fallbackCard = cur;
          cur = cur.parentElement;
        }
        if (fallbackCard) return fallbackCard;
      }

      const explicit = document.querySelector('[data-testid="question-panel"]:not([data-testid*="readonly"])');
      if (explicit && explicit.offsetHeight > 40) return explicit;

      const candGroups = scope.querySelectorAll('[role="radiogroup"]');
      for (const g of candGroups) {
        if (g.closest('[data-testid*="readonly"], #gemineko-home-stage, #gemineko-cdp-composer-dock')) continue;
        const r = g.getBoundingClientRect();
        if (r.width < 180 || r.height < 48) continue;
        if (box && r.top > boxBottom) continue;
        const btns = g.querySelectorAll('label[data-testid="ask-question-option"], button, [role="radio"], [role="option"]');
        if (btns.length >= 2) {
          return g.closest('form, section, [class*="card"], [class*="border"]') || g.parentElement || g;
        }
      }
      return null;
    }

    function updateAskBubbleLit(bubble, count) {
      if (!bubble) return;
      const total = Math.max(1, count || askOptCount);
      const idx = askHoveredIdx >= 0 && askHoveredIdx < total ? askHoveredIdx : (askLitIdx % total);
      bubble.querySelectorAll('.gk-ask-opt-letter').forEach((el, i) => {
        el.classList.toggle('is-lit', i === idx);
      });
    }

    function resolveAskOptionList(panel) {
      const rg = panel.querySelector('[role="radiogroup"]');
      if (rg) return rg;
      const firstOpt = panel.querySelector('label[data-testid="ask-question-option"]');
      if (firstOpt) {
        const allCount = panel.querySelectorAll('label[data-testid="ask-question-option"]').length;
        let cur = firstOpt.parentElement;
        while (cur && cur !== panel) {
          if (cur.querySelectorAll('label[data-testid="ask-question-option"]').length >= allCount) {
            return cur;
          }
          cur = cur.parentElement;
        }
      }
      return [...panel.children].find((ch) => ch.querySelectorAll('button, [role="radio"], [role="option"]').length >= 2) || null;
    }

    function renderAskBubbleLetters(bubble, labels) {
      if (!bubble) return;
      bubble.textContent = '';
      labels.forEach((label, i) => {
        const span = document.createElement('span');
        span.className = 'gk-ask-opt-letter' + (i === 0 ? ' is-lit' : '');
        span.setAttribute('data-idx', String(i));
        span.appendChild(document.createTextNode(label));
        const q = document.createElement('em');
        q.className = 'gk-ask-q';
        q.textContent = '?';
        span.appendChild(q);
        bubble.appendChild(span);
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
      const optList = resolveAskOptionList(panel);
      if (!optList || !optList.parentElement) return;
      const splitParent = optList.parentElement;

      let optItems = [...splitParent.querySelectorAll('label[data-testid="ask-question-option"]')];
      const writeInLabel = splitParent.querySelector('[data-testid="ask-question-writein"]')?.closest('label');
      if (writeInLabel && !optItems.includes(writeInLabel)) {
        optItems.push(writeInLabel);
      }
      if (optItems.length === 0) {
        optItems = [...optList.querySelectorAll('button, [role="radio"], [role="option"]')]
          .filter((b) => !/^(?:submit|skip|cancel|continue|提交|继续|跳过|取消)$/i.test((b.textContent || '').trim()));
      }
      optItems = optItems.slice(0, 6);

      const rawLabels = optItems.map((el, i) => {
        const badge = el.querySelector('[data-testid="ask-question-shortcut-badge"], [data-testid="ask-question-writein-shortcut-badge"]');
        const txt = (badge?.textContent || '').trim();
        return txt || 'ABCDEF'[i] || String(i + 1);
      });
      const optLabels = rawLabels.length >= 2 ? rawLabels : ['A', 'B'];
      askOptCount = optLabels.length;
      const labelsSig = optLabels.join('|');

      let headerRowSpan = false;
      for (const ch of [...splitParent.children]) {
        if (ch.classList?.contains('gk-ask-mascot-col')) continue;
        if (ch.querySelector?.('[data-testid="ask-question-header-text"]')) {
          ch.classList.add('gk-ask-header-span');
          headerRowSpan = true;
        } else {
          ch.classList?.remove('gk-ask-header-span');
        }
      }
      const rightCols = [...splitParent.children].filter((ch) => (
        ch.tagName !== 'STYLE' &&
        !ch.classList?.contains('gk-ask-mascot-col') &&
        !ch.classList?.contains('gk-ask-header-span')
      ));
      splitParent.style.setProperty('--gk-ask-row-start', headerRowSpan ? '2' : '1');
      splitParent.style.setProperty('--gk-ask-rows', String(Math.max(1, rightCols.length)));

      const existingMascot = splitParent.querySelector(':scope > .gk-ask-mascot-col');
      const needsRemount = (
        askStageRef !== panel ||
        askOptListRef !== optList ||
        askLabelsSig !== labelsSig ||
        !existingMascot
      );

      if (needsRemount) {
        if (askStageRef && askStageRef !== panel) {
          clearAskStage();
        }
        askStageRef = panel;
        askOptListRef = optList;
        askLabelsSig = labelsSig;
        askHoveredIdx = -1;
        askLitIdx = 0;

        panel.setAttribute('data-gk-ask-stage', '1');
        splitParent.classList.add('gk-ask-split-row');
        optList.classList.add('gk-ask-options-col');

        let mascotCol = existingMascot;
        if (!mascotCol) {
          mascotCol = document.createElement('div');
          mascotCol.className = 'gk-ask-mascot-col';
          mascotCol.innerHTML = '<div class="gk-ask-thought-bubble"></div><img class="gk-ask-ponder-img" alt="pondering" />';
          splitParent.insertBefore(mascotCol, optList);
        }
        const bubble = mascotCol.querySelector('.gk-ask-thought-bubble');
        renderAskBubbleLetters(bubble, optLabels);
        updateAskBubbleLit(bubble, askOptCount);

        optItems.forEach((btn, idx) => {
          btn.dataset.gkAskIdx = String(idx);
          if (btn.dataset.gkAskHover === '1') return;
          btn.dataset.gkAskHover = '1';
          btn.addEventListener('mouseenter', () => {
            askHoveredIdx = Number(btn.dataset.gkAskIdx ?? -1);
            updateAskBubbleLit(askStageRef?.querySelector('.gk-ask-thought-bubble'), askOptCount);
          });
          btn.addEventListener('mouseleave', () => {
            askHoveredIdx = -1;
            updateAskBubbleLit(askStageRef?.querySelector('.gk-ask-thought-bubble'), askOptCount);
          });
          btn.addEventListener('focusin', () => {
            const nextIdx = Number(btn.dataset.gkAskIdx ?? -1);
            if (nextIdx >= 0) {
              askLitIdx = nextIdx;
              updateAskBubbleLit(askStageRef?.querySelector('.gk-ask-thought-bubble'), askOptCount);
            }
          });
        });

        if (!askRouletteTimer) {
          askRouletteTimer = setInterval(() => {
            if (!askStageRef || !askStageRef.isConnected) {
              clearAskStage();
              return;
            }
            if (askHoveredIdx < 0 && getMotionEnabled()) {
              askLitIdx = (askLitIdx + 1) % Math.max(1, askOptCount);
              updateAskBubbleLit(askStageRef.querySelector('.gk-ask-thought-bubble'), askOptCount);
            }
          }, 950);
        }
      }

      const img = panel.querySelector('img.gk-ask-ponder-img');
      if (img) {
        const spriteQ = getSpriteQuality();
        const ponderUrl = \`\${ctx.server}/gemineko-sprites/\${activeRole}-ponder.png?q=\${spriteQ}&v=0.7.10\`;
        const askingUrl = \`\${ctx.server}/gemineko-sprites/\${activeRole}-asking.png?q=\${spriteQ}&v=0.7.10\`;
        if (img.dataset.gkErrBound !== '1') {
          img.dataset.gkErrBound = '1';
          img.addEventListener('error', () => {
            if (img.dataset.gkFb === '2') return;
            if (img.dataset.gkFb === '1') {
              img.dataset.gkFb = '2';
              img.src = \`\${ctx.server}/gemineko-sprites/\${activeRole}-thinking.png?q=\${getSpriteQuality()}&v=0.7.10\`;
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
                <img src="\${ctx.server}/gemineko-sprites/\${r.sprite}?q=\${getSpriteQuality()}&v=0.7.10" alt="\${r.name}" />
                <span>\${r.name}</span>
              </button>
            \`).join('')}
          </div>
          <div class="gk-home-brand-foot"></div>
        \`;
        stage.querySelectorAll('img').forEach((img, idx) => {
          const rId = HOME_ROLES[idx]?.id || 'neon';
          img.addEventListener('error', () => {
            if (img.dataset.gkFallback === '1') return;
            img.dataset.gkFallback = '1';
            img.src = \`\${ctx.server}/gemineko-sprites/\${rId}-thinking.png?q=\${getSpriteQuality()}&v=0.7.10\`;
          });
        });
        stage.addEventListener('click', (e) => {
          if (e.target.closest('.gk-home-brand-foot a')) return;
          const themeBtn = e.target.closest('.gk-home-theme-btn');
          if (themeBtn) {
            e.stopPropagation();
            toggleMiniBar(themeBtn);
            return;
          }
          const btn = e.target.closest('[data-home-role]');
          if (!btn) return;
          const rId = btn.getAttribute('data-home-role') || 'neon';
          const actors = [...stage.querySelectorAll('.gk-home-actor')];
          const idx = Math.max(0, actors.indexOf(btn));
          if (window.__GEMINEKO_EGG_API__?.onHomeStageActorClick) {
            window.__GEMINEKO_EGG_API__.onHomeStageActorClick(rId, idx, e.clientX, e.clientY, btn);
            return;
          }
          onDockPoke(rId, e.clientX, e.clientY, btn);
        });
        parentWrap.insertBefore(stage, inputBox);
      } else if (stage.nextElementSibling !== inputBox) {
        parentWrap.insertBefore(stage, inputBox);
      }
      const homeQ = getSpriteQuality();
      stage.querySelectorAll('.gk-home-actor').forEach((btn, idx) => {
        const r = HOME_ROLES[idx];
        const im = btn.querySelector('img');
        if (r && im) {
          const nextUrl = \`\${ctx.server}/gemineko-sprites/\${r.sprite}?q=\${homeQ}&v=0.7.10\`;
          if (im.getAttribute('data-qsrc') !== nextUrl) {
            im.setAttribute('data-qsrc', nextUrl);
            if (!im.src.includes(\`q=\${homeQ}&\`)) im.src = nextUrl;
          }
        }
      });

      const foot = stage.querySelector('.gk-home-brand-foot');
      if (foot) {
        const activePack = cfg.activeThemePack && cfg.activeThemePack.id !== 'official-gemineko' ? cfg.activeThemePack : null;
        foot.textContent = '';
        const txtSpan = document.createElement('span');
        txtSpan.textContent = activePack
          ? \`✦ Powered by \${BRAND.engineName} · by \${BRAND.author.name} · 当前主题：\${activePack.name} (\${activePack.author?.name || 'Community'})\`
          : \`✦ Powered by \${BRAND.engineName} · by \${BRAND.author.name}\`;
        const link = document.createElement('a');
        link.href = BRAND.repoUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = '⭐ GitHub';
        foot.appendChild(txtSpan);
        foot.appendChild(link);
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

    function clearHomeGemTilt() {
      const stage = document.querySelector('#' + HOME_EMBLEM_ID + ' .gk-he-stage');
      if (!stage) return;
      stage.classList.remove('is-tilting');
      for (const prop of ['--gk-gem-rx', '--gk-gem-ry', '--gk-gem-cx', '--gk-gem-cy', '--gk-gem-gx', '--gk-gem-gy']) {
        stage.style.removeProperty(prop);
      }
    }

    function clearAllOpticalRims() {
      if (rimRafId) {
        cancelAnimationFrame(rimRafId);
        rimRafId = 0;
      }
      for (const el of litRimEls) clearRimProps(el);
      litRimEls.clear();
      clearHomeGemTilt();
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

      // 首页中央 3D 晶透星钻鼠标视差（旋转晶体角度 + 焦散反向位移 + 镜面高光追踪）
      const emblem = document.getElementById(HOME_EMBLEM_ID);
      const stage = emblem?.querySelector('.gk-he-stage');
      if (emblem && stage && getMotionEnabled()) {
        const er = emblem.getBoundingClientRect();
        const cx = er.left + er.width / 2;
        const cy = er.top + er.height / 2;
        const gDist = Math.hypot(px - cx, py - cy);
        if (er.width > 16 && gDist <= 320) {
          const nx = Math.max(-1, Math.min(1, (px - cx) / 220));
          const ny = Math.max(-1, Math.min(1, (py - cy) / 220));
          stage.style.setProperty('--gk-gem-rx', (-ny * 8).toFixed(2) + 'deg');
          stage.style.setProperty('--gk-gem-ry', (nx * 10).toFixed(2) + 'deg');
          stage.style.setProperty('--gk-gem-cx', (-nx * 8).toFixed(1) + 'px');
          stage.style.setProperty('--gk-gem-cy', (-ny * 6).toFixed(1) + 'px');
          stage.style.setProperty('--gk-gem-gx', (50 + nx * 30).toFixed(1) + '%');
          stage.style.setProperty('--gk-gem-gy', (50 + ny * 30).toFixed(1) + '%');
          stage.classList.add('is-tilting');
        } else {
          clearHomeGemTilt();
        }
      } else if (stage) {
        clearHomeGemTilt();
      }
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

    function showSpeechBubble(text, duration = 2600, anchor = null) {
      document.querySelectorAll('.gk-speech-bubble').forEach((n) => n.remove());
      const el = anchor && typeof anchor.getBoundingClientRect === 'function' ? anchor : anchor?.el;
      const roleKey = anchor && typeof anchor === 'object' && anchor.role ? anchor.role : '';
      let anchorX = null;
      let anchorTop = null;
      let anchorBottom = null;

      if (el && typeof el.getBoundingClientRect === 'function') {
        const er = el.getBoundingClientRect();
        if (er.width > 0 || er.height > 0) {
          anchorX = er.left + er.width / 2;
          anchorTop = er.top;
          anchorBottom = er.bottom;
        }
      }
      if (anchorX === null && anchor && typeof anchor.x === 'number' && typeof anchor.y === 'number' && (anchor.x > 0 || anchor.y > 0)) {
        anchorX = anchor.x;
        anchorTop = anchor.y - 16;
        anchorBottom = anchor.y + 16;
      }
      if (anchorX === null) {
        const dock = document.getElementById(ctx.dockId);
        const dr = dock && !dock.classList.contains('is-hidden') ? dock.getBoundingClientRect() : null;
        if (dr && dr.width > 0) {
          anchorX = dr.left + Math.min(dr.width / 2, 110);
          anchorTop = dr.top;
          anchorBottom = dr.bottom;
        } else {
          anchorX = window.innerWidth / 2;
          anchorTop = window.innerHeight - 120;
          anchorBottom = anchorTop + 32;
        }
      }

      const b = document.createElement('div');
      b.className = 'gk-speech-bubble';
      b.textContent = text;
      if (roleKey && ROLE_PALETTES[roleKey]) {
        b.style.setProperty('--gk-bubble-accent', ROLE_PALETTES[roleKey].primary);
      }
      b.style.visibility = 'hidden';
      b.style.left = '0px';
      b.style.top = '0px';
      b.addEventListener('click', () => b.remove());
      document.body?.appendChild(b);

      const bw = b.offsetWidth || 200;
      const bh = b.offsetHeight || 42;
      const left = Math.max(12, Math.min(window.innerWidth - bw - 12, Math.round(anchorX - bw / 2)));
      let top = Math.round(anchorTop - bh - 12);
      if (top < 14) {
        top = Math.min(window.innerHeight - bh - 14, Math.round(anchorBottom + 12));
        b.classList.add('is-below');
      }
      const tailX = Math.max(16, Math.min(bw - 16, Math.round(anchorX - left)));
      b.style.left = left + 'px';
      b.style.top = top + 'px';
      b.style.setProperty('--gk-tail-x', tailX + 'px');
      b.style.visibility = '';
      setTimeout(() => { if (b.isConnected) b.remove(); }, duration);
    }

    /** 释放高可见度彩色发光 SVG 爪印/星芒/晶棱星尘雨 */
    function spawnStardust(originX, originY, count = 32, mode = 'confetti', roleOverride = '') {
      if (cfg.focusMode && mode !== 'force') return;
      const pal = ROLE_PALETTES[roleOverride] || ROLE_PALETTES[resolveActiveRoleId(ctx.getActivity())] || ROLE_PALETTES.neon;
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
        img.src = \`\${ctx.server}/gemineko-sprites/\${r}-running.png?q=\${getSpriteQuality()}&v=0.7.10\`;
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
      if (patch?.typography && typeof patch.typography === 'object') {
        writeHostLocalTypo(patch.typography);
      }
      if (patch?.dock && typeof patch.dock === 'object') {
        writeHostDockCfg(patch.dock);
      }
      if (patch?.spriteQuality) {
        writeHostSpriteQ(patch.spriteQuality);
      }
      const optimisticTypo = patch?.typography || readHostLocalTypo();
      const optimisticDock = patch?.dock ? writeHostDockCfg(patch.dock) : readHostDockCfg();
      const optimisticQ = normSpriteQ(patch?.spriteQuality) || readHostSpriteQ();
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
          if (d?.config) {
            let nextCfg = d.config.typography || !optimisticTypo
              ? d.config
              : { ...d.config, typography: optimisticTypo };
            if (!nextCfg.dock && optimisticDock) {
              nextCfg = { ...nextCfg, dock: optimisticDock };
            }
            if (!normSpriteQ(nextCfg.spriteQuality) && optimisticQ) {
              nextCfg = { ...nextCfg, spriteQuality: optimisticQ };
            }
            applyConfig(nextCfg);
          }
        })
        .catch(() => {});
    }

    function onDockPoke(role, clientX, clientY, anchorEl = null) {
      const r = ROLE_PALETTES[role] ? role : 'neon';
      const pts = addIntimacy(r);
      const lines = ROLE_POKE_LINES[r] || ROLE_POKE_LINES.neon;
      const line = lines[pts % lines.length];
      showSpeechBubble(\`\${line}（亲密值 \${pts}）\`, 2600, { el: anchorEl, x: clientX, y: clientY, role: r });

      const now = Date.now();
      pokeTimestamps = pokeTimestamps.filter((t) => now - t <= 3000);
      pokeTimestamps.push(now);
      if (pokeTimestamps.length >= 5 && cfg.linkages?.pokeBurst !== false) {
        pokeTimestamps = [];
        triggerHiveParadeBurst(r, 'host');
      } else {
        spawnStardust(clientX, clientY, 12, 'confetti', r);
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
          elapsed >= 4000 &&
          !activity.hasError &&
          cfg.enabled &&
          cfg.linkages?.taskFinishConfetti !== false &&
          activity.turnCompletedAt !== lastTurnSig
        ) {
          lastTurnSig = activity.turnCompletedAt || String(Date.now());
          const dock = document.getElementById(ctx.dockId);
          const dr = dock && !dock.classList.contains('is-hidden') ? dock.getBoundingClientRect() : null;
          const rect = dr && dr.width > 0 ? dr : { left: window.innerWidth * 0.4, top: window.innerHeight - 120 };
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
          <span data-egg-rave-title="1" style="cursor:pointer;" title="连点三次试试？🎧">🎨 基米窝主题与汉化快切</span>
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
        <div class="gk-mini-label">字体大小：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-font-preset="compact">紧凑 12</button>
          <button class="gk-mini-chip" data-font-preset="normal">标准 14</button>
          <button class="gk-mini-chip" data-font-preset="comfort">护眼 16</button>
          <button class="gk-mini-chip" data-font-preset="large">大字 18</button>
        </div>
        <div class="gk-mini-label">立绘清晰度：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-sprite-q="384">轻量 384</button>
          <button class="gk-mini-chip" data-sprite-q="512">超清 512</button>
          <button class="gk-mini-chip" data-sprite-q="1024">极致 1024</button>
        </div>
        <div class="gk-mini-label">小猫停靠与大小：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-dock-side="left">⬅ 输入框左侧</button>
          <button class="gk-mini-chip" data-dock-side="right">输入框右侧 ➡</button>
        </div>
        <label class="gk-mini-range-row">
          <span>小猫立绘 <strong data-dock-val="catSize">100px</strong></span>
          <input type="range" min="52" max="140" step="4" value="100" data-dock-range="catSize" />
        </label>
        <label class="gk-mini-range-row">
          <span>状态气泡 <strong data-dock-val="badgeScale">120%</strong></span>
          <input type="range" min="85" max="150" step="5" value="120" data-dock-range="badgeScale" />
        </label>
        <div class="gk-mini-label">反重力宿主汉化：</div>
        <div class="gk-mini-row">
          <button class="gk-mini-chip" data-i18n="auto">跟随系统</button>
          <button class="gk-mini-chip" data-i18n="neko-zh">哈基米萌系</button>
          <button class="gk-mini-chip" data-i18n="zh">标准中文</button>
          <button class="gk-mini-chip" data-i18n="off">English</button>
        </div>
        <div class="gk-mini-row" style="margin-top:2px;">
          <button class="gk-mini-chip" data-act="replay-startup">✨ 重播片头</button>
          <button class="gk-mini-chip" data-act="meme-picker">😸 表情库</button>
          <button class="gk-mini-chip" data-act="toggle-focus">专注 0fps</button>
          <button class="gk-mini-chip" data-act="toggle-egg-sound">🔊 彩蛋音</button>
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
        const fontPreset = btn.getAttribute('data-font-preset');
        const spriteQ = btn.getAttribute('data-sprite-q');
        const dockSide = btn.getAttribute('data-dock-side');
        const i18nMode = btn.getAttribute('data-i18n');
        const act = btn.getAttribute('data-act');
        if (preset) {
          applyConfig({ ...cfg, enabled: true, preset, activeThemePackId: 'official-gemineko', activeThemePack: null });
          persistPatch({ enabled: true, preset, activeThemePackId: 'official-gemineko' });
        } else if (intensity) {
          applyConfig({ ...cfg, enabled: true, themeIntensity: intensity });
          persistPatch({ enabled: true, themeIntensity: intensity });
        } else if (spinner) {
          applyConfig({ ...cfg, enabled: true, spinnerStyle: spinner });
          persistPatch({ enabled: true, spinnerStyle: spinner });
        } else if (fontPreset) {
          const map = { compact: { sidecarFontSize: 12, hostFontScale: 95 }, normal: { sidecarFontSize: 14, hostFontScale: 100 }, comfort: { sidecarFontSize: 16, hostFontScale: 110 }, large: { sidecarFontSize: 18, hostFontScale: 120 } };
          const typography = map[fontPreset] || map.normal;
          applyConfig({ ...cfg, enabled: true, typography });
          persistPatch({ enabled: true, typography });
        } else if (spriteQ) {
          writeHostSpriteQ(spriteQ);
          applyConfig({ ...cfg, enabled: true, spriteQuality: spriteQ });
          persistPatch({ enabled: true, spriteQuality: spriteQ });
        } else if (dockSide) {
          const nextDock = writeHostDockCfg({ ...getDockConfig(), side: dockSide });
          applyConfig({ ...cfg, enabled: true, dock: nextDock });
          persistPatch({ dock: nextDock });
          const dockAnchor = document.querySelector('#' + ctx.dockId + ' .gk-dock-theme-btn');
          requestAnimationFrame(() => positionMiniBar(dockAnchor || btn));
        } else if (i18nMode) {
          const nextI18n = { ...(cfg.i18n || {}), mode: i18nMode };
          applyConfig({ ...cfg, i18n: nextI18n });
          persistPatch({ i18n: nextI18n });
        } else if (act === 'toggle-focus') {
          const next = !cfg.focusMode;
          applyConfig({ ...cfg, focusMode: next });
          persistPatch({ focusMode: next });
        } else if (act === 'toggle-egg-sound') {
          const nextSound = cfg.easterEggs?.soundEnabled === false;
          const nextEggs = { ...(cfg.easterEggs || {}), soundEnabled: nextSound };
          applyConfig({ ...cfg, easterEggs: nextEggs });
          persistPatch({ easterEggs: nextEggs });
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
        } else if (act === 'replay-startup') {
          bar.classList.remove('is-open');
          ctx.replayStartup?.();
        } else if (act === 'meme-picker') {
          bar.classList.remove('is-open');
          ctx.openMemePicker?.(bar);
        } else if (act === 'open-workshop') {
          postEvent({ type: 'open-workshop', role: lastRole || 'neon', source: 'host' });
          showSpeechBubble('已通知侧边栏「基米窝 → 主题工坊」✨', 2200);
          bar.classList.remove('is-open');
        }
      });
      bar.addEventListener('input', (e) => {
        const rangeKey = e.target?.getAttribute?.('data-dock-range');
        if (!rangeKey) return;
        const val = Number(e.target.value);
        const nextDock = writeHostDockCfg({ ...getDockConfig(), [rangeKey]: val });
        if (!nextDock) return;
        applyConfig({ ...cfg, enabled: true, dock: nextDock });
        const dockAnchor = document.querySelector('#' + ctx.dockId + ' .gk-dock-theme-btn');
        requestAnimationFrame(() => positionMiniBar(dockAnchor));
      });
      bar.addEventListener('change', (e) => {
        const rangeKey = e.target?.getAttribute?.('data-dock-range');
        if (!rangeKey) return;
        const val = Number(e.target.value);
        const nextDock = writeHostDockCfg({ ...getDockConfig(), [rangeKey]: val });
        if (!nextDock) return;
        persistPatch({ dock: nextDock });
      });
      document.body?.appendChild(bar);
      return bar;
    }

    function positionMiniBar(anchorBtn) {
      const bar = document.getElementById(MINI_BAR_ID);
      if (!bar || !bar.classList.contains('is-open')) return;
      const barW = bar.offsetWidth || 308;
      const barH = bar.offsetHeight || 360;
      const r = anchorBtn && typeof anchorBtn.getBoundingClientRect === 'function'
        ? anchorBtn.getBoundingClientRect()
        : { left: 16, right: 320, top: window.innerHeight - 100 };
      const preferRight = getDockConfig().side === 'right' || r.left + barW > window.innerWidth - 12;
      const rawLeft = preferRight ? Math.round(r.right - barW) : Math.round(r.left);
      const left = Math.max(12, Math.min(Math.max(12, window.innerWidth - barW - 12), rawLeft));
      const top = Math.max(16, Math.round(r.top - barH - 10));
      bar.style.left = left + 'px';
      bar.style.top = top + 'px';
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
      const curScale = Math.round(Number(cfg.typography?.hostFontScale) || 100);
      const curPresetKey = curScale <= 96 ? 'compact' : (curScale >= 118 ? 'large' : (curScale >= 107 ? 'comfort' : 'normal'));
      bar.querySelectorAll('[data-font-preset]').forEach((b) => {
        b.classList.toggle('is-active', cfg.enabled && b.getAttribute('data-font-preset') === curPresetKey);
      });
      const curQ = getSpriteQuality();
      bar.querySelectorAll('[data-sprite-q]').forEach((b) => {
        b.classList.toggle('is-active', cfg.enabled && b.getAttribute('data-sprite-q') === curQ);
      });
      const dockCfg = getDockConfig();
      bar.querySelectorAll('[data-dock-side]').forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-dock-side') === dockCfg.side);
      });
      const catRange = bar.querySelector('[data-dock-range="catSize"]');
      const catVal = bar.querySelector('[data-dock-val="catSize"]');
      if (catRange && Number(catRange.value) !== dockCfg.catSize) catRange.value = String(dockCfg.catSize);
      if (catVal) catVal.textContent = \`\${dockCfg.catSize}px\`;
      const badgeRange = bar.querySelector('[data-dock-range="badgeScale"]');
      const badgeVal = bar.querySelector('[data-dock-val="badgeScale"]');
      if (badgeRange && Number(badgeRange.value) !== dockCfg.badgeScale) badgeRange.value = String(dockCfg.badgeScale);
      if (badgeVal) badgeVal.textContent = \`\${dockCfg.badgeScale}%\`;
      bar.querySelectorAll('[data-i18n]').forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-i18n') === (cfg.i18n?.mode || 'auto'));
      });
      const focusBtn = bar.querySelector('[data-act="toggle-focus"]');
      if (focusBtn) focusBtn.classList.toggle('is-active', Boolean(cfg.focusMode));
      const soundBtn = bar.querySelector('[data-act="toggle-egg-sound"]');
      if (soundBtn) {
        const sOn = cfg.easterEggs?.soundEnabled !== false;
        soundBtn.textContent = sOn ? '🔊 彩蛋音' : '🔇 已静音';
        soundBtn.classList.toggle('is-active', sOn);
      }
      const enBtn = bar.querySelector('[data-act="toggle-enabled"]');
      if (enBtn) enBtn.classList.toggle('is-active', Boolean(cfg.enabled));
    }

    function toggleMiniBar(anchorBtn) {
      const bar = ensureMiniBar();
      syncMiniBarState();
      const open = !bar.classList.contains('is-open');
      bar.classList.toggle('is-open', open);
      if (open) {
        positionMiniBar(anchorBtn);
      }
    }

    function readOutlineRatio() {
      try {
        const raw = Number(localStorage.getItem(OUTLINE_RATIO_KEY));
        if (Number.isFinite(raw)) return Math.max(0.18, Math.min(0.78, raw));
      } catch {}
      return 0.48;
    }

    function saveOutlineRatio(ratio) {
      const clamped = Math.max(0.18, Math.min(0.78, Number(ratio) || 0.48));
      try { localStorage.setItem(OUTLINE_RATIO_KEY, clamped.toFixed(3)); } catch {}
      return clamped;
    }

    function positionOutlineElements(overrideRatio) {
      const fab = document.getElementById(OUTLINE_FAB_ID);
      const pop = document.getElementById(OUTLINE_POP_ID);
      if (!fab) return;
      const conv = document.querySelector('[data-testid="conversation-view"]:not([data-has-browser-hole="true"])')
        || document.querySelector('[data-testid="conversation-view"]');
      const rect = conv ? conv.getBoundingClientRect() : null;
      if (!conv || !rect || rect.width < 180 || rect.height < 200) {
        fab.style.display = 'none';
        fab.classList.remove('is-open');
        if (pop) pop.classList.remove('is-open');
        return;
      }
      fab.style.display = 'inline-flex';
      const ratio = typeof overrideRatio === 'number' ? Math.max(0.18, Math.min(0.78, overrideRatio)) : readOutlineRatio();
      const fabRight = Math.max(0, Math.round(window.innerWidth - rect.right));
      const minTop = Math.round(rect.top + 56);
      const maxTop = Math.max(minTop, Math.round(rect.bottom - 96));
      const fabTop = Math.max(minTop, Math.min(maxTop, Math.round(rect.top + rect.height * ratio)));
      fab.style.right = fabRight + 'px';
      fab.style.top = fabTop + 'px';

      if (pop && pop.classList.contains('is-open')) {
        const fr = fab.getBoundingClientRect();
        const pw = pop.offsetWidth || 280;
        const ph = pop.offsetHeight || 260;
        const popLeft = Math.max(12, Math.min(window.innerWidth - pw - 12, Math.round(fr.left - pw - 8)));
        const popTop = Math.max(56, Math.min(window.innerHeight - ph - 16, Math.round(fr.top - 12)));
        pop.style.left = popLeft + 'px';
        pop.style.top = popTop + 'px';
      }
    }

    function scheduleOutlinePosition() {
      if (outlineRaf) return;
      outlineRaf = requestAnimationFrame(() => {
        outlineRaf = 0;
        if (!stopped) positionOutlineElements();
      });
    }

    function onOutlineWinResize() {
      scheduleOutlinePosition();
    }

    function ensureOutlineObservers() {
      const conv = document.querySelector('[data-testid="conversation-view"]');
      if (typeof ResizeObserver === 'function') {
        if (!outlineRo) {
          outlineRo = new ResizeObserver(() => scheduleOutlinePosition());
          if (document.body) outlineRo.observe(document.body);
        }
        if (conv && conv !== outlineTrackedConv) {
          if (outlineTrackedConv) {
            try { outlineRo.unobserve(outlineTrackedConv); } catch {}
          }
          outlineTrackedConv = conv;
          outlineRo.observe(conv);
        }
      }
      if (!window.__gkOutlineResizeBound) {
        window.__gkOutlineResizeBound = true;
        window.addEventListener('resize', onOutlineWinResize, { passive: true });
      }
    }

    function syncOutlineVisibility() {
      const show = Boolean(cfg.enabled && !cfg.focusMode && cfg.workbench?.pawOutline !== false);
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
        fab.title = '基米窝对话大纲（点击跳转历史提问 · 可上下拖拽位置）';
        fab.textContent = '🐾';
        let startY = 0;
        let convTop = 0;
        let convH = 1;
        let curRatio = readOutlineRatio();
        fab.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          const conv = document.querySelector('[data-testid="conversation-view"]');
          const rect = conv ? conv.getBoundingClientRect() : null;
          if (!rect || rect.height < 200) return;
          outlineDragging = true;
          outlineDragMoved = false;
          startY = e.clientY;
          convTop = rect.top;
          convH = rect.height;
          curRatio = readOutlineRatio();
          try { fab.setPointerCapture(e.pointerId); } catch {}
        });
        fab.addEventListener('pointermove', (e) => {
          if (!outlineDragging) return;
          if (!outlineDragMoved && Math.abs(e.clientY - startY) <= 5) return;
          outlineDragMoved = true;
          fab.classList.add('is-dragging');
          curRatio = Math.max(0.18, Math.min(0.78, (e.clientY - convTop - 21) / Math.max(200, convH)));
          positionOutlineElements(curRatio);
          window.__GEMINEKO_EGG_API__?.onOutlineDragY?.(e.clientY);
        });
        const finishDrag = (e) => {
          if (!outlineDragging) return;
          outlineDragging = false;
          fab.classList.remove('is-dragging');
          if (outlineDragMoved) {
            saveOutlineRatio(curRatio);
            positionOutlineElements(curRatio);
            setTimeout(() => { outlineDragMoved = false; }, 60);
          }
          try { if (e && fab.hasPointerCapture(e.pointerId)) fab.releasePointerCapture(e.pointerId); } catch {}
        };
        fab.addEventListener('pointerup', finishDrag);
        fab.addEventListener('pointercancel', finishDrag);
        fab.addEventListener('click', (e) => {
          e.stopPropagation();
          if (outlineDragMoved) return;
          const p = ensureOutlinePop();
          const willOpen = !p.classList.contains('is-open');
          p.classList.toggle('is-open', willOpen);
          fab.classList.toggle('is-open', willOpen);
          if (willOpen) refreshOutlineItems('');
          positionOutlineElements();
        });
        document.body?.appendChild(fab);
      }
      ensureOutlineObservers();
      positionOutlineElements();
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
      pop.querySelector('[data-close="1"]').addEventListener('click', () => {
        pop.classList.remove('is-open');
        document.getElementById(OUTLINE_FAB_ID)?.classList.remove('is-open');
      });
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

      if (e.altKey) {
        e.preventDefault();
        window.__GEMINEKO_EGG_API__?.triggerById?.('ctx-dingdong-box', { x: e.clientX, y: e.clientY });
        return;
      }
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
        <button type="button" data-c="egg-box" style="opacity:0.72;border-top:1px dashed rgba(148,163,184,0.22);margin-top:2px;padding-top:6px;">🥚 ???（叮咚鸡盲盒）</button>
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
        } else if (c === 'egg-box') {
          window.__GEMINEKO_EGG_API__?.triggerById?.('ctx-dingdong-box', { x: ev.clientX, y: ev.clientY });
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
        document.getElementById(OUTLINE_FAB_ID)?.classList.remove('is-open');
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
      if (nextCfg?.typography && typeof nextCfg.typography === 'object') {
        writeHostLocalTypo(nextCfg.typography);
      }
      if (nextCfg?.dock && typeof nextCfg.dock === 'object') {
        writeHostDockCfg(nextCfg.dock);
      }
      if (nextCfg?.spriteQuality) {
        writeHostSpriteQ(nextCfg.spriteQuality);
      }
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
      } else if (evt.type === 'replay-egg' && evt.eggId) {
        window.__GEMINEKO_EGG_API__?.triggerById?.(evt.eggId);
      } else if (evt.type === 'supreme-maodie-parade') {
        window.__GEMINEKO_EGG_API__?.triggerSupremeParade?.('sidecar');
      }
    }

    schemeObserver = new MutationObserver(() => {
      if (stopped) return;
      reportHostScheme(getHostScheme());
      if (cfg.enabled && cfg.preset === 'auto') {
        const nextPreset = resolveEffectivePresetId();
        if (document.documentElement.getAttribute('data-gk-theme') !== nextPreset) {
          applyThemeDom(ctx.getActivity());
        }
      }
    });
    if (document.documentElement) {
      schemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    const schemeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const onSchemeMediaChange = () => {
      if (stopped) return;
      reportHostScheme(getHostScheme());
      if (cfg.enabled && cfg.preset === 'auto') {
        applyThemeDom(ctx.getActivity());
      }
    };
    schemeMedia?.addEventListener?.('change', onSchemeMediaChange);

    workbenchTimer = setInterval(() => {
      if (!stopped) {
        decorateLongCodeBlocks();
        if (cfg.enabled) {
          syncConvAurora();
          syncCornerWatermark(ctx.getActivity(), resolveActiveRoleId(ctx.getActivity()));
          syncHomeBrandEmblem();
          syncHomeStage();
          syncAskQuestionStage(resolveActiveRoleId(ctx.getActivity()));
          syncOutlineVisibility();
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

    const api = {
      applyConfig,
      onActivityUpdate,
      onDockPoke,
      triggerEvent,
      toggleMiniBar,
      syncAskQuestionStage,
      getSpriteQuality,
      getDockConfig,
      showSpeechBubble,
      spawnStardust,
      triggerHiveParadeBurst,
      unmount,
    };
    window.__GEMINEKO_THEME_API__ = api;

    function unmount() {
      stopped = true;
      clearAskStage();
      clearAllOpticalRims();
      if (schemeObserver) schemeObserver.disconnect();
      schemeMedia?.removeEventListener?.('change', onSchemeMediaChange);
      if (outlineRo) { outlineRo.disconnect(); outlineRo = null; }
      outlineTrackedConv = null;
      if (outlineRaf) { cancelAnimationFrame(outlineRaf); outlineRaf = 0; }
      if (window.__gkOutlineResizeBound) {
        window.__gkOutlineResizeBound = false;
        window.removeEventListener('resize', onOutlineWinResize);
      }
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

      for (const id of [THEME_STYLE_ID, COMMUNITY_PACK_STYLE_ID, WP_LAYER_ID, AURORA_HOST_ID, WATERMARK_ID, HOME_STAGE_ID, HOME_EMBLEM_ID, NIGHT_LAYER_ID, AURORA_SWEEP_ID, OUTLINE_FAB_ID, OUTLINE_POP_ID, CTX_MENU_ID, MINI_BAR_ID]) {
        const el = document.getElementById(id);
        if (el) el.remove();
      }
      document.querySelectorAll('[data-gk-home-greeting-host]').forEach((n) => n.removeAttribute('data-gk-home-greeting-host'));
      document.querySelectorAll('.gk-speech-bubble, .gk-stardust-particle, .gk-send-spark, .gk-parade-overlay, .gk-parade-banner').forEach((n) => n.remove());
      const box = document.getElementById('antigravity.agentSidePanelInputBox');
      if (box) {
        const target = box.closest('.surface-composer, .surface-composer-card') || box;
        target.classList.remove('gk-composer-glow-active');
      }
      const root = document.documentElement;
      if (root) {
        for (const attr of ['data-gk-theme','data-gk-scheme','data-gk-role','data-gk-intensity','data-gk-spinner','data-gk-radius','data-gk-motion','data-gk-focus','data-gk-active','data-gk-smooth','data-gk-accent-on','data-gk-wallpaper','data-gk-pack','data-gk-font-scaled']) {
          root.removeAttribute(attr);
        }
        for (const prop of ['--gk-role-primary','--gk-role-accent2','--gk-role-accent3','--gk-role-glow','--gk-role-gradient','--gk-role-spark','--gk-role-tint','--gk-catnest-pattern','--gk-spinner-role-svg','--gk-spinner-paw-svg','--gk-aurora-1','--gk-aurora-2','--gk-aurora-3','--gk-ambient-alpha','--gk-watermark-opacity','--gk-host-font-scale','--gk-dock-cat-size','--gk-dock-badge-scale']) {
          root.style.removeProperty(prop);
        }
      }
      window.__GEMINEKO_THEME_API__ = null;
    }

    return api;
  }
  `;
}
