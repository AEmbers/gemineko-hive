/**
 * @file Gemineko Hive v0.5.0 原生宿主主题配置中心、调色板注册表与壁纸路径安全校验。
 * 零外部依赖，负责：
 * 1. 4 套耐看基底配色预设 + 5 位哈基米角色动态强调色调色板；
 * 2. 严格白名单配置清洗与默认值合并；
 * 3. 壁纸路径白名单校验（拦截 UNC、设备路径、目录穿越与敏感凭据目录）；
 * 4. 原子化持久化配置存储。
 */

import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const ALLOWED_PRESETS = new Set([
  'auto',
  'nebula-day',
  'cream-paper',
  'starry-nest',
  'carbon-obsidian',
]);

export const ALLOWED_ACCENT_MODES = new Set([
  'follow-role',
  'neon',
  'hydrogen',
  'carbon',
  'claude',
  'gpt',
  'off',
]);

export const ALLOWED_MOTION_LEVELS = new Set(['standard', 'subtle', 'off']);
export const ALLOWED_CORNER_RADIUS = new Set(['compact', 'soft', 'round']);
export const ALLOWED_WALLPAPER_MODES = new Set([
  'off',
  'builtin-starry',
  'builtin-aurora',
  'custom',
]);

export const WALLPAPER_MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/** 严格对应 5 位角色三视图配色的动态强调色与星云极光光带 */
export const ROLE_PALETTES = {
  neon: {
    id: 'neon',
    label: 'Neon · 炫彩哈基米',
    primary: '#3B82F6',
    accent2: '#EC4899',
    accent3: '#22D3EE',
    aurora1: 'rgba(59, 130, 246, 0.20)',
    aurora2: 'rgba(236, 72, 153, 0.16)',
    aurora3: 'rgba(34, 211, 238, 0.14)',
    sparkColor: '#60A5FA',
    glow: 'rgba(59,130,246,0.32)',
    gradient: 'linear-gradient(120deg,#3b82f6,#a855f7,#ec4899,#22d3ee)',
  },
  hydrogen: {
    id: 'hydrogen',
    label: 'Hydrogen · 原教旨 Gemini 本体',
    primary: '#8B5CF6',
    accent2: '#F472B6',
    accent3: '#FBBF24',
    aurora1: 'rgba(139, 92, 246, 0.20)',
    aurora2: 'rgba(244, 114, 182, 0.16)',
    aurora3: 'rgba(251, 191, 36, 0.12)',
    sparkColor: '#A78BFA',
    glow: 'rgba(139,92,246,0.30)',
    gradient: 'linear-gradient(120deg,#60a5fa,#a78bfa,#f472b6,#fbbf24)',
  },
  carbon: {
    id: 'carbon',
    label: 'Carbon · 五彩斑斓的黑',
    primary: '#6366F1',
    accent2: '#F43F5E',
    accent3: '#F59E0B',
    aurora1: 'rgba(99, 102, 241, 0.22)',
    aurora2: 'rgba(244, 63, 94, 0.15)',
    aurora3: 'rgba(245, 158, 11, 0.13)',
    sparkColor: '#818CF8',
    glow: 'rgba(99,102,241,0.32)',
    gradient: 'linear-gradient(120deg,#1e1b4b,#6366f1,#ec4899,#f59e0b)',
  },
  claude: {
    id: 'claude',
    label: 'Claude · 橘发大小姐',
    primary: '#F97316',
    accent2: '#FBBF24',
    accent3: '#FB7185',
    aurora1: 'rgba(249, 115, 22, 0.19)',
    aurora2: 'rgba(251, 191, 36, 0.15)',
    aurora3: 'rgba(251, 113, 133, 0.12)',
    sparkColor: '#FB923C',
    glow: 'rgba(249,115,22,0.30)',
    gradient: 'linear-gradient(120deg,#ea580c,#f97316,#fbbf24,#fde68a)',
  },
  gpt: {
    id: 'gpt',
    label: 'GPT · 白紫小龙娘',
    primary: '#A855F7',
    accent2: '#C4B5FD',
    accent3: '#818CF8',
    aurora1: 'rgba(168, 85, 247, 0.20)',
    aurora2: 'rgba(196, 181, 253, 0.16)',
    aurora3: 'rgba(129, 140, 248, 0.13)',
    sparkColor: '#C084FC',
    glow: 'rgba(168,85,247,0.30)',
    gradient: 'linear-gradient(120deg,#c4b5fd,#a855f7,#818cf8)',
  },
};

/** 4 套 5 级光学玻璃表面主题（拉开侧栏 / 画布 / 卡片 / 浮层层次，绝不与官方纯白撞脸） */
export const THEME_PRESETS = {
  'nebula-day': {
    id: 'nebula-day',
    name: '星云冷白',
    scheme: 'light',
    badge: '冷调星云光学浅色',
    swatches: ['#E2E7F5', '#EFF2FA', '#FFFFFF', '#6366F1'],
    vars: {
      '--background': '#EFF2FA',
      '--body-background': '#EFF2FA',
      '--foreground': '#131628',
      '--sidebar': '#E2E7F5',
      '--sidebar-secondary': 'rgba(79, 70, 229, 0.11)',
      '--sidebar-muted': 'rgba(30, 41, 82, 0.062)',
      '--content': '#EFF2FA',
      '--card': '#FFFFFF',
      '--card-border': 'rgba(79, 70, 229, 0.16)',
      '--card-edge': 'rgba(79, 70, 229, 0.14)',
      '--border': 'rgba(30, 41, 82, 0.12)',
      '--shell': '#EFF2FA',
      '--shell-canvas': '#E2E7F5',
      '--glass': 'rgba(255, 255, 255, 0.94)',
      '--glass-border': 'rgba(99, 102, 241, 0.22)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.98)',
      '--glass-shadow': '0 14px 36px -10px rgba(30, 41, 90, 0.16), 0 2px 8px -2px rgba(79, 70, 229, 0.08)',
      '--nux-chip-shadow': '0 4px 12px -4px rgba(30, 41, 90, 0.14), 0 1px 2px rgba(30, 41, 90, 0.06)',
      '--onyx-frame': '#E2E7F5',
      '--onyx-well': '#E7ECF8',
      '--onyx-raised': '#FFFFFF',
      '--onyx-selected': '#FFFFFF',
      '--onyx-key': '#F5F7FD',
      '--secondary': '#E5EAF7',
      '--secondary-foreground': '#313957',
      '--muted': '#E8EDF9',
      '--muted-foreground': '#56607E',
      '--placeholder': '#737D9C',
      '--primary-foreground': '#FFFFFF',
      '--link': '#4338CA',
      '--home-glow': 'rgba(99, 102, 241, 0.16)',
      '--scrim': 'rgba(19, 22, 40, 0.34)',
      '--editor-selection-background': 'rgba(99, 102, 241, 0.24)',
      '--editor-comment-selection-background': 'rgba(99, 102, 241, 0.15)',
      '--editor-code-block-background': '#E7ECF8',
      '--gk-tonal-0': '#DCE2F2',
      '--gk-tonal-1': '#EFF2FA',
      '--gk-tonal-2': '#FFFFFF',
      '--gk-tonal-3': '#E9EEF9',
      '--gk-tonal-4': '#FFFFFF',
      '--gk-specular': 'rgba(255, 255, 255, 0.96)',
      '--gk-surface-sheen': 'linear-gradient(175deg, rgba(255,255,255,0.96), rgba(235,241,255,0.58))',
      '--gk-composer-bg': 'rgba(255, 255, 255, 0.96)',
      '--gk-composer-shadow': '0 14px 34px -10px rgba(30, 41, 95, 0.16), 0 2px 8px -2px rgba(79, 70, 229, 0.10), inset 0 1px 0 rgba(255,255,255,0.98)',
      '--gk-bubble-bg': 'rgba(232, 238, 252, 0.92)',
      '--gk-popover-bg': 'rgba(252, 253, 255, 0.96)',
      '--gk-pattern-ink': 'rgba(79, 70, 229, 0.048)',
      '--gk-scroll-thumb': 'rgba(79, 70, 229, 0.24)',
      '--gk-scroll-thumb-hover': 'rgba(79, 70, 229, 0.44)',
      '--vscode-editor-background': '#EFF2FA',
      '--vscode-sideBar-background': '#E2E7F5',
      '--vscode-panel-background': '#EFF2FA',
      '--sdk-color-surface': '#FFFFFF',
      '--sdk-color-canvas': '#DCE2F2',
      '--sdk-sidebar-bg': '#E2E7F5',
    },
  },
  'cream-paper': {
    id: 'cream-paper',
    name: '奶油暖纸',
    scheme: 'light',
    badge: '暖奶油光学纸感',
    swatches: ['#E7DFD2', '#F4EFE6', '#FFFDF9', '#EA580C'],
    vars: {
      '--background': '#F4EFE6',
      '--body-background': '#F4EFE6',
      '--foreground': '#231C16',
      '--sidebar': '#E7DFD2',
      '--sidebar-secondary': 'rgba(194, 89, 52, 0.12)',
      '--sidebar-muted': 'rgba(42, 32, 20, 0.062)',
      '--content': '#F4EFE6',
      '--card': '#FFFDF9',
      '--card-border': 'rgba(154, 102, 54, 0.18)',
      '--card-edge': 'rgba(154, 102, 54, 0.15)',
      '--border': 'rgba(42, 32, 20, 0.12)',
      '--shell': '#F4EFE6',
      '--shell-canvas': '#E7DFD2',
      '--glass': 'rgba(255, 253, 249, 0.94)',
      '--glass-border': 'rgba(194, 89, 52, 0.22)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.96)',
      '--glass-shadow': '0 14px 36px -10px rgba(68, 52, 32, 0.15), 0 2px 8px -2px rgba(194, 89, 52, 0.08)',
      '--nux-chip-shadow': '0 4px 12px -4px rgba(68, 52, 32, 0.14), 0 1px 2px rgba(68, 52, 32, 0.06)',
      '--onyx-frame': '#E7DFD2',
      '--onyx-well': '#ECE5D8',
      '--onyx-raised': '#FFFDF9',
      '--onyx-selected': '#FFFDF9',
      '--onyx-key': '#FAF6EE',
      '--secondary': '#ECE5D9',
      '--secondary-foreground': '#45392F',
      '--muted': '#EEE8DD',
      '--muted-foreground': '#6A5D50',
      '--placeholder': '#8A7B6C',
      '--primary-foreground': '#FFFFFF',
      '--link': '#B54D28',
      '--home-glow': 'rgba(234, 88, 12, 0.14)',
      '--scrim': 'rgba(32, 24, 16, 0.34)',
      '--editor-selection-background': 'rgba(217, 119, 6, 0.22)',
      '--editor-comment-selection-background': 'rgba(217, 119, 6, 0.14)',
      '--editor-code-block-background': '#EDE6D9',
      '--gk-tonal-0': '#E3DACB',
      '--gk-tonal-1': '#F4EFE6',
      '--gk-tonal-2': '#FFFDF9',
      '--gk-tonal-3': '#EFE9DD',
      '--gk-tonal-4': '#FFFDF9',
      '--gk-specular': 'rgba(255, 255, 255, 0.96)',
      '--gk-surface-sheen': 'linear-gradient(175deg, rgba(255,255,255,0.96), rgba(248,242,232,0.58))',
      '--gk-composer-bg': 'rgba(255, 253, 249, 0.96)',
      '--gk-composer-shadow': '0 14px 34px -10px rgba(68, 52, 32, 0.16), 0 2px 8px -2px rgba(194, 89, 52, 0.09), inset 0 1px 0 rgba(255,255,255,0.96)',
      '--gk-bubble-bg': 'rgba(239, 231, 218, 0.92)',
      '--gk-popover-bg': 'rgba(254, 252, 247, 0.96)',
      '--gk-pattern-ink': 'rgba(168, 92, 42, 0.048)',
      '--gk-scroll-thumb': 'rgba(168, 92, 42, 0.24)',
      '--gk-scroll-thumb-hover': 'rgba(168, 92, 42, 0.44)',
      '--vscode-editor-background': '#F4EFE6',
      '--vscode-sideBar-background': '#E7DFD2',
      '--vscode-panel-background': '#F4EFE6',
      '--sdk-color-surface': '#FFFDF9',
      '--sdk-color-canvas': '#E3DACB',
      '--sdk-sidebar-bg': '#E7DFD2',
    },
  },
  'starry-nest': {
    id: 'starry-nest',
    name: '星空猫窝',
    scheme: 'dark',
    badge: '午夜星云紫蓝深色',
    swatches: ['#090A14', '#101222', '#181B31', '#8B5CF6'],
    vars: {
      '--background': '#101222',
      '--body-background': '#101222',
      '--foreground': '#F1F5FB',
      '--sidebar': '#090A14',
      '--sidebar-secondary': 'rgba(139, 92, 246, 0.16)',
      '--sidebar-muted': 'rgba(226, 232, 255, 0.055)',
      '--content': '#101222',
      '--card': '#181B31',
      '--card-border': 'rgba(167, 139, 250, 0.22)',
      '--card-edge': 'rgba(167, 139, 250, 0.20)',
      '--border': 'rgba(167, 139, 250, 0.14)',
      '--shell': '#101222',
      '--shell-canvas': '#090A14',
      '--glass': 'rgba(26, 30, 54, 0.92)',
      '--glass-border': 'rgba(167, 139, 250, 0.28)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.11)',
      '--glass-shadow': '0 18px 44px -12px rgba(0, 0, 0, 0.68), 0 2px 10px -2px rgba(0, 0, 0, 0.44)',
      '--nux-chip-shadow': '0 4px 14px -4px rgba(0, 0, 0, 0.56), 0 1px 2px rgba(0, 0, 0, 0.34)',
      '--onyx-frame': '#090A14',
      '--onyx-well': '#131629',
      '--onyx-raised': '#1D213B',
      '--onyx-selected': 'rgba(139, 92, 246, 0.22)',
      '--onyx-key': '#202542',
      '--secondary': '#1C2038',
      '--secondary-foreground': '#CBD5E6',
      '--muted': '#16192C',
      '--muted-foreground': '#94A3C2',
      '--placeholder': '#69779B',
      '--primary-foreground': '#FFFFFF',
      '--link': '#A78BFA',
      '--home-glow': 'rgba(139, 92, 246, 0.24)',
      '--scrim': 'rgba(6, 7, 14, 0.72)',
      '--editor-selection-background': 'rgba(139, 92, 246, 0.34)',
      '--editor-comment-selection-background': 'rgba(139, 92, 246, 0.22)',
      '--editor-code-block-background': '#141729',
      '--gk-tonal-0': '#070810',
      '--gk-tonal-1': '#101222',
      '--gk-tonal-2': '#181B31',
      '--gk-tonal-3': '#1F2440',
      '--gk-tonal-4': '#262B4C',
      '--gk-specular': 'rgba(226, 232, 255, 0.12)',
      '--gk-surface-sheen': 'linear-gradient(172deg, rgba(167,139,250,0.08), rgba(255,255,255,0.02) 40%, rgba(7,8,16,0.22))',
      '--gk-composer-bg': 'rgba(22, 25, 45, 0.92)',
      '--gk-composer-shadow': '0 16px 40px -10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(226,232,255,0.14)',
      '--gk-bubble-bg': 'rgba(30, 34, 62, 0.90)',
      '--gk-popover-bg': 'rgba(24, 27, 49, 0.95)',
      '--gk-pattern-ink': 'rgba(196, 181, 253, 0.052)',
      '--gk-scroll-thumb': 'rgba(167, 139, 250, 0.30)',
      '--gk-scroll-thumb-hover': 'rgba(167, 139, 250, 0.52)',
      '--vscode-editor-background': '#101222',
      '--vscode-sideBar-background': '#090A14',
      '--vscode-panel-background': '#101222',
      '--sdk-color-surface': '#181B31',
      '--sdk-color-canvas': '#070810',
      '--sdk-sidebar-bg': '#090A14',
    },
  },
  'carbon-obsidian': {
    id: 'carbon-obsidian',
    name: '碳晶黑曜',
    scheme: 'dark',
    badge: '高对比黑曜光学深色',
    swatches: ['#06070A', '#0C0E14', '#141822', '#6366F1'],
    vars: {
      '--background': '#0C0E14',
      '--body-background': '#0C0E14',
      '--foreground': '#F4F5F8',
      '--sidebar': '#06070A',
      '--sidebar-secondary': 'rgba(255, 255, 255, 0.09)',
      '--sidebar-muted': 'rgba(255, 255, 255, 0.048)',
      '--content': '#0C0E14',
      '--card': '#141822',
      '--card-border': 'rgba(218, 228, 255, 0.12)',
      '--card-edge': 'rgba(218, 228, 255, 0.10)',
      '--border': 'rgba(218, 228, 255, 0.085)',
      '--shell': '#0C0E14',
      '--shell-canvas': '#06070A',
      '--glass': 'rgba(21, 25, 36, 0.93)',
      '--glass-border': 'rgba(218, 228, 255, 0.16)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.10)',
      '--glass-shadow': '0 18px 44px -12px rgba(0, 0, 0, 0.72), 0 2px 10px -2px rgba(0, 0, 0, 0.48)',
      '--nux-chip-shadow': '0 4px 14px -4px rgba(0, 0, 0, 0.56), 0 1px 2px rgba(0, 0, 0, 0.34)',
      '--onyx-frame': '#06070A',
      '--onyx-well': '#10131C',
      '--onyx-raised': '#1A1F2D',
      '--onyx-selected': 'rgba(99, 102, 241, 0.20)',
      '--onyx-key': '#1E2333',
      '--secondary': '#191D29',
      '--secondary-foreground': '#D4D7E2',
      '--muted': '#131620',
      '--muted-foreground': '#9CA3B5',
      '--placeholder': '#6E7587',
      '--primary-foreground': '#FFFFFF',
      '--link': '#818CF8',
      '--home-glow': 'rgba(99, 102, 241, 0.20)',
      '--scrim': 'rgba(5, 6, 9, 0.76)',
      '--editor-selection-background': 'rgba(99, 102, 241, 0.32)',
      '--editor-comment-selection-background': 'rgba(99, 102, 241, 0.20)',
      '--editor-code-block-background': '#10131C',
      '--gk-tonal-0': '#050608',
      '--gk-tonal-1': '#0C0E14',
      '--gk-tonal-2': '#141822',
      '--gk-tonal-3': '#1B202E',
      '--gk-tonal-4': '#22283A',
      '--gk-specular': 'rgba(255, 255, 255, 0.105)',
      '--gk-surface-sheen': 'linear-gradient(172deg, rgba(255,255,255,0.055), rgba(160,185,245,0.018) 38%, rgba(6,7,10,0.22))',
      '--gk-composer-bg': 'rgba(20, 24, 34, 0.94)',
      '--gk-composer-shadow': '0 16px 40px -10px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255,255,255,0.11)',
      '--gk-bubble-bg': 'rgba(26, 30, 44, 0.92)',
      '--gk-popover-bg': 'rgba(18, 21, 30, 0.95)',
      '--gk-pattern-ink': 'rgba(218, 228, 255, 0.044)',
      '--gk-scroll-thumb': 'rgba(218, 228, 255, 0.24)',
      '--gk-scroll-thumb-hover': 'rgba(218, 228, 255, 0.44)',
      '--vscode-editor-background': '#0C0E14',
      '--vscode-sideBar-background': '#06070A',
      '--vscode-panel-background': '#0C0E14',
      '--sdk-color-surface': '#141822',
      '--sdk-color-canvas': '#050608',
      '--sdk-sidebar-bg': '#06070A',
    },
  },
};

export const DEFAULT_HOST_THEME_CONFIG = {
  enabled: true,
  preset: 'auto',
  accentMode: 'follow-role',
  focusMode: false,
  motionLevel: 'standard',
  cornerRadius: 'soft',
  ambientIntensity: 75,
  linkages: {
    roleSwitchAurora: true,
    composerBreathGlow: true,
    errorHissShake: true,
    taskFinishConfetti: true,
    pokeBurst: true,
    nightLamp: true,
    nightLampPreview: false,
  },
  workbench: {
    pawOutline: true,
    codeBlockFold: true,
    contextMenu: true,
    smoothScroll: true,
  },
  wallpaper: {
    mode: 'off',
    filePath: '',
    opacity: 0.22,
    blur: 4,
    scrim: 0.35,
  },
  updatedAt: 0,
};

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function asBool(val, fallback) {
  return typeof val === 'boolean' ? val : fallback;
}

/**
 * 校验本地壁纸文件路径：
 * - 拒绝 UNC（\\server\share）、设备前缀（\\?\、\\.\）、相对路径及 .. 遍历；
 * - 拦截敏感凭据目录（.ssh / .aws / .gnupg / .gemini/antigravity）；
 * - 仅允许白名单图片/视频扩展名且必须是真实存在的普通文件。
 * @param {string} rawPath
 * @returns {{ ok: boolean, path: string, ext?: string, mime?: string, isVideo?: boolean, size?: number, error?: string }}
 */
export function validateWallpaperFilePath(rawPath) {
  const trimmed = String(rawPath || '').trim().replace(/^["']+|["']+$/g, '');
  if (!trimmed) {
    return { ok: false, path: '', error: '壁纸路径为空' };
  }
  if (trimmed.startsWith('\\\\') || trimmed.startsWith('//')) {
    return { ok: false, path: '', error: '安全限制：拒绝 UNC 网络路径或设备路径' };
  }
  if (/[\0<>|?*]/.test(trimmed)) {
    return { ok: false, path: '', error: '路径包含非法字符' };
  }
  if (!path.isAbsolute(trimmed)) {
    return { ok: false, path: '', error: '壁纸必须使用本机绝对路径' };
  }
  const normalized = path.normalize(trimmed);
  const segs = normalized.split(/[\\/]+/).filter(Boolean).map((s) => s.toLowerCase());
  if (segs.includes('..')) {
    return { ok: false, path: '', error: '安全限制：禁止目录穿越路径' };
  }

  const ext = path.extname(normalized).toLowerCase();
  const mime = WALLPAPER_MIME_MAP[ext];
  if (!mime) {
    return { ok: false, path: '', error: `不支持的媒体格式: ${ext || '无扩展名'}` };
  }

  let real = normalized;
  try {
    if (!existsSync(normalized)) {
      return { ok: false, path: '', error: '指定的壁纸文件不存在' };
    }
    real = realpathSync(normalized);
  } catch (err) {
    return { ok: false, path: '', error: err?.message || '无法访问壁纸文件' };
  }

  const realLow = real.toLowerCase().replace(/\\/g, '/');
  const blockedPatterns = [
    '/.ssh/',
    '/.aws/',
    '/.gnupg/',
    '/.gemini/antigravity/',
    '/appdata/roaming/antigravity/',
    '/windows/system32/',
  ];
  if (blockedPatterns.some((pat) => realLow.includes(pat))) {
    return { ok: false, path: '', error: '安全限制：禁止读取受保护系统或凭据目录' };
  }

  try {
    const st = statSync(real);
    if (!st.isFile()) {
      return { ok: false, path: '', error: '目标路径不是普通文件' };
    }
    return {
      ok: true,
      path: real,
      ext,
      mime,
      isVideo: mime.startsWith('video/'),
      size: st.size,
    };
  } catch (err) {
    return { ok: false, path: '', error: err?.message || '读取壁纸文件元信息失败' };
  }
}

/**
 * 清洗并合并宿主主题配置，严格校验全部枚举、布尔与数值范围。
 * @param {any} raw
 * @param {any} [base]
 * @returns {typeof DEFAULT_HOST_THEME_CONFIG}
 */
export function sanitizeHostThemeConfig(raw, base = DEFAULT_HOST_THEME_CONFIG) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const b = base && typeof base === 'object' ? base : DEFAULT_HOST_THEME_CONFIG;

  const preset = ALLOWED_PRESETS.has(src.preset) ? src.preset : (ALLOWED_PRESETS.has(b.preset) ? b.preset : 'auto');
  const accentMode = ALLOWED_ACCENT_MODES.has(src.accentMode)
    ? src.accentMode
    : (ALLOWED_ACCENT_MODES.has(b.accentMode) ? b.accentMode : 'follow-role');
  const motionLevel = ALLOWED_MOTION_LEVELS.has(src.motionLevel)
    ? src.motionLevel
    : (ALLOWED_MOTION_LEVELS.has(b.motionLevel) ? b.motionLevel : 'standard');
  const cornerRadius = ALLOWED_CORNER_RADIUS.has(src.cornerRadius)
    ? src.cornerRadius
    : (ALLOWED_CORNER_RADIUS.has(b.cornerRadius) ? b.cornerRadius : 'soft');

  const srcLink = src.linkages && typeof src.linkages === 'object' ? src.linkages : {};
  const bLink = b.linkages || DEFAULT_HOST_THEME_CONFIG.linkages;

  const srcWb = src.workbench && typeof src.workbench === 'object' ? src.workbench : {};
  const bWb = b.workbench || DEFAULT_HOST_THEME_CONFIG.workbench;

  const srcWp = src.wallpaper && typeof src.wallpaper === 'object' ? src.wallpaper : {};
  const bWp = b.wallpaper || DEFAULT_HOST_THEME_CONFIG.wallpaper;

  let wpMode = ALLOWED_WALLPAPER_MODES.has(srcWp.mode)
    ? srcWp.mode
    : (ALLOWED_WALLPAPER_MODES.has(bWp.mode) ? bWp.mode : 'off');
  let wpPath = typeof srcWp.filePath === 'string'
    ? srcWp.filePath.trim()
    : (typeof bWp.filePath === 'string' ? bWp.filePath.trim() : '');

  if (wpPath) {
    const check = validateWallpaperFilePath(wpPath);
    wpPath = check.ok ? check.path : '';
  }
  if (wpMode === 'custom' && !wpPath) {
    wpMode = 'off';
  }

  return {
    enabled: asBool(src.enabled, asBool(b.enabled, true)),
    preset,
    accentMode,
    focusMode: asBool(src.focusMode, asBool(b.focusMode, false)),
    motionLevel,
    cornerRadius,
    ambientIntensity: Math.round(clampNumber(src.ambientIntensity, 0, 100, b.ambientIntensity ?? 75)),
    linkages: {
      roleSwitchAurora: asBool(srcLink.roleSwitchAurora, asBool(bLink.roleSwitchAurora, true)),
      composerBreathGlow: asBool(srcLink.composerBreathGlow, asBool(bLink.composerBreathGlow, true)),
      errorHissShake: asBool(srcLink.errorHissShake, asBool(bLink.errorHissShake, true)),
      taskFinishConfetti: asBool(srcLink.taskFinishConfetti, asBool(bLink.taskFinishConfetti, true)),
      pokeBurst: asBool(srcLink.pokeBurst, asBool(bLink.pokeBurst, true)),
      nightLamp: asBool(srcLink.nightLamp, asBool(bLink.nightLamp, true)),
      nightLampPreview: asBool(srcLink.nightLampPreview, asBool(bLink.nightLampPreview, false)),
    },
    workbench: {
      pawOutline: asBool(srcWb.pawOutline, asBool(bWb.pawOutline, true)),
      codeBlockFold: asBool(srcWb.codeBlockFold, asBool(bWb.codeBlockFold, true)),
      contextMenu: asBool(srcWb.contextMenu, asBool(bWb.contextMenu, true)),
      smoothScroll: asBool(srcWb.smoothScroll, asBool(bWb.smoothScroll, true)),
    },
    wallpaper: {
      mode: wpMode,
      filePath: wpPath,
      opacity: Number(clampNumber(srcWp.opacity, 0.05, 0.65, bWp.opacity ?? 0.22).toFixed(2)),
      blur: Math.round(clampNumber(srcWp.blur, 0, 24, bWp.blur ?? 4)),
      scrim: Number(clampNumber(srcWp.scrim, 0, 0.85, bWp.scrim ?? 0.35).toFixed(2)),
    },
    updatedAt: Number.isFinite(Number(src.updatedAt)) ? Number(src.updatedAt) : Date.now(),
  };
}

/**
 * 解析持久化主题配置文件路径。
 * @returns {string}
 */
export function resolveThemeConfigPath() {
  const envData = process.env.ANTIGRAVITY_EXECUTABLE_DATA_DIR;
  if (envData) {
    return path.join(path.resolve(envData), 'theme-config.json');
  }
  return path.join(os.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive', 'theme-config.json');
}

/**
 * 创建原子化持久化配置存储。
 * @param {string} [customPath]
 */
export function createThemeConfigStore(customPath) {
  const filePath = customPath ? path.resolve(customPath) : resolveThemeConfigPath();

  function load() {
    if (!existsSync(filePath)) {
      return sanitizeHostThemeConfig(DEFAULT_HOST_THEME_CONFIG);
    }
    try {
      const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
      return sanitizeHostThemeConfig(parsed, DEFAULT_HOST_THEME_CONFIG);
    } catch {
      return sanitizeHostThemeConfig(DEFAULT_HOST_THEME_CONFIG);
    }
  }

  let current = load();

  function save(nextConfig) {
    const dir = path.dirname(filePath);
    mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, JSON.stringify(nextConfig, null, 2), 'utf8');
    renameSync(tmp, filePath);
    current = nextConfig;
    return current;
  }

  return {
    filePath,
    get() {
      return current;
    },
    update(patch) {
      const merged = sanitizeHostThemeConfig({ ...patch, updatedAt: Date.now() }, current);
      return save(merged);
    },
    reset() {
      return save(sanitizeHostThemeConfig({ ...DEFAULT_HOST_THEME_CONFIG, updatedAt: Date.now() }));
    },
  };
}
