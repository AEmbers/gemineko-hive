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
export const ALLOWED_THEME_INTENSITIES = new Set(['vivid', 'balanced', 'minimal']);
export const ALLOWED_WATERMARK_ROLES = new Set([
  'follow-role',
  'neon',
  'hydrogen',
  'carbon',
  'claude',
  'gpt',
  'custom',
]);
export const ALLOWED_I18N_MODES = new Set(['auto', 'neko-zh', 'zh', 'off']);
export const ALLOWED_I18N_AUTO_STYLES = new Set(['neko-zh', 'zh']);
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

/** 严格对应 5 位角色三视图配色的动态强调色、星云极光光带与二次元视觉母题 */
export const ROLE_PALETTES = {
  neon: {
    id: 'neon',
    label: 'Neon · 炫彩哈基米',
    motif: 'prism-star',
    crestTitle: 'NEON · GEMINEKO',
    primary: '#3B82F6',
    accent2: '#EC4899',
    accent3: '#22D3EE',
    aurora1: 'rgba(59, 130, 246, 0.28)',
    aurora2: 'rgba(236, 72, 153, 0.22)',
    aurora3: 'rgba(34, 211, 238, 0.18)',
    tintLight: 'rgba(59, 130, 246, 0.09)',
    tintDark: 'rgba(59, 130, 246, 0.16)',
    patternInkLight: 'rgba(59, 130, 246, 0.145)',
    patternInkDark: 'rgba(96, 165, 250, 0.185)',
    earGlow: 'rgba(236, 72, 153, 0.44)',
    sparkColor: '#60A5FA',
    glow: 'rgba(59,130,246,0.38)',
    gradient: 'linear-gradient(120deg,#3b82f6,#a855f7,#ec4899,#22d3ee)',
  },
  hydrogen: {
    id: 'hydrogen',
    label: 'Hydrogen · 原教旨 Gemini 本体',
    motif: 'lavender-nebula',
    crestTitle: 'HYDROGEN · GEMINI',
    primary: '#8B5CF6',
    accent2: '#F472B6',
    accent3: '#FBBF24',
    aurora1: 'rgba(139, 92, 246, 0.28)',
    aurora2: 'rgba(244, 114, 182, 0.22)',
    aurora3: 'rgba(251, 191, 36, 0.16)',
    tintLight: 'rgba(139, 92, 246, 0.09)',
    tintDark: 'rgba(139, 92, 246, 0.16)',
    patternInkLight: 'rgba(139, 92, 246, 0.145)',
    patternInkDark: 'rgba(196, 181, 253, 0.185)',
    earGlow: 'rgba(244, 114, 182, 0.42)',
    sparkColor: '#A78BFA',
    glow: 'rgba(139,92,246,0.36)',
    gradient: 'linear-gradient(120deg,#60a5fa,#a78bfa,#f472b6,#fbbf24)',
  },
  carbon: {
    id: 'carbon',
    label: 'Carbon · 五彩斑斓的黑',
    motif: 'graphene-hex',
    crestTitle: 'CARBON · GRAPHENE',
    primary: '#6366F1',
    accent2: '#F43F5E',
    accent3: '#F59E0B',
    aurora1: 'rgba(99, 102, 241, 0.30)',
    aurora2: 'rgba(244, 63, 94, 0.21)',
    aurora3: 'rgba(245, 158, 11, 0.17)',
    tintLight: 'rgba(99, 102, 241, 0.095)',
    tintDark: 'rgba(99, 102, 241, 0.18)',
    patternInkLight: 'rgba(79, 70, 229, 0.145)',
    patternInkDark: 'rgba(129, 140, 248, 0.195)',
    earGlow: 'rgba(244, 63, 94, 0.42)',
    sparkColor: '#818CF8',
    glow: 'rgba(99,102,241,0.38)',
    gradient: 'linear-gradient(120deg,#1e1b4b,#6366f1,#ec4899,#f59e0b)',
  },
  claude: {
    id: 'claude',
    label: 'Claude · 橘发大小姐',
    motif: 'cream-lace',
    crestTitle: 'CLAUDE · MAID',
    primary: '#F97316',
    accent2: '#FBBF24',
    accent3: '#FB7185',
    aurora1: 'rgba(249, 115, 22, 0.26)',
    aurora2: 'rgba(251, 191, 36, 0.20)',
    aurora3: 'rgba(251, 113, 133, 0.16)',
    tintLight: 'rgba(249, 115, 22, 0.085)',
    tintDark: 'rgba(249, 115, 22, 0.155)',
    patternInkLight: 'rgba(217, 95, 32, 0.145)',
    patternInkDark: 'rgba(251, 146, 60, 0.18)',
    earGlow: 'rgba(251, 191, 36, 0.42)',
    sparkColor: '#FB923C',
    glow: 'rgba(249,115,22,0.36)',
    gradient: 'linear-gradient(120deg,#ea580c,#f97316,#fbbf24,#fde68a)',
  },
  gpt: {
    id: 'gpt',
    label: 'GPT · 白紫小龙娘',
    motif: 'dragon-scale',
    crestTitle: 'GPT · SOL DRAGON',
    primary: '#A855F7',
    accent2: '#C4B5FD',
    accent3: '#818CF8',
    aurora1: 'rgba(168, 85, 247, 0.27)',
    aurora2: 'rgba(196, 181, 253, 0.21)',
    aurora3: 'rgba(129, 140, 248, 0.17)',
    tintLight: 'rgba(168, 85, 247, 0.09)',
    tintDark: 'rgba(168, 85, 247, 0.16)',
    patternInkLight: 'rgba(147, 51, 234, 0.145)',
    patternInkDark: 'rgba(216, 180, 254, 0.185)',
    earGlow: 'rgba(196, 181, 253, 0.46)',
    sparkColor: '#C084FC',
    glow: 'rgba(168,85,247,0.36)',
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
    swatches: ['#D7E0F6', '#EBF0FC', '#FFFFFF', '#6366F1'],
    vars: {
      '--background': '#EBF0FC',
      '--body-background': '#EBF0FC',
      '--foreground': '#131628',
      '--sidebar': '#D7E0F6',
      '--sidebar-secondary': 'rgba(79, 70, 229, 0.14)',
      '--sidebar-muted': 'rgba(59, 74, 148, 0.085)',
      '--content': '#EBF0FC',
      '--card': '#FCFDFF',
      '--card-border': 'rgba(79, 70, 229, 0.22)',
      '--card-edge': 'rgba(79, 70, 229, 0.18)',
      '--border': 'rgba(49, 64, 130, 0.16)',
      '--shell': '#EBF0FC',
      '--shell-canvas': '#D7E0F6',
      '--glass': 'rgba(248, 250, 255, 0.90)',
      '--glass-border': 'rgba(99, 102, 241, 0.28)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.98)',
      '--glass-shadow': '0 16px 38px -10px rgba(30, 41, 95, 0.20), 0 3px 10px -2px rgba(79, 70, 229, 0.12)',
      '--nux-chip-shadow': '0 4px 14px -4px rgba(30, 41, 90, 0.16), 0 1px 2px rgba(30, 41, 90, 0.08)',
      '--onyx-frame': '#D7E0F6',
      '--onyx-well': '#DFE7F9',
      '--onyx-raised': '#FFFFFF',
      '--onyx-selected': '#F7F9FF',
      '--onyx-key': '#F2F5FE',
      '--secondary': '#DFE6F8',
      '--secondary-foreground': '#2D3656',
      '--muted': '#E4EAF9',
      '--muted-foreground': '#4D587B',
      '--placeholder': '#6A7599',
      '--primary-foreground': '#FFFFFF',
      '--link': '#4338CA',
      '--home-glow': 'rgba(99, 102, 241, 0.22)',
      '--scrim': 'rgba(19, 22, 40, 0.34)',
      '--editor-selection-background': 'rgba(99, 102, 241, 0.26)',
      '--editor-comment-selection-background': 'rgba(99, 102, 241, 0.16)',
      '--editor-code-block-background': '#E2E9FA',
      '--gk-tonal-0': '#CFD9F2',
      '--gk-tonal-1': '#EBF0FC',
      '--gk-tonal-2': '#FCFDFF',
      '--gk-tonal-3': '#E2E9FA',
      '--gk-tonal-4': '#FFFFFF',
      '--gk-specular': 'rgba(255, 255, 255, 0.98)',
      '--gk-surface-sheen': 'linear-gradient(175deg, rgba(255,255,255,0.96), rgba(226,234,255,0.68))',
      '--gk-composer-bg': 'rgba(250, 252, 255, 0.93)',
      '--gk-composer-shadow': '0 16px 36px -10px rgba(30, 41, 95, 0.19), 0 3px 10px -2px rgba(79, 70, 229, 0.12), inset 0 1px 0 rgba(255,255,255,0.98)',
      '--gk-bubble-bg': 'rgba(222, 232, 255, 0.92)',
      '--gk-popover-bg': 'rgba(247, 249, 255, 0.93)',
      '--gk-pattern-ink': 'rgba(79, 70, 229, 0.145)',
      '--gk-scroll-thumb': 'rgba(79, 70, 229, 0.28)',
      '--gk-scroll-thumb-hover': 'rgba(79, 70, 229, 0.50)',
      '--vscode-editor-background': '#EBF0FC',
      '--vscode-sideBar-background': '#D7E0F6',
      '--vscode-panel-background': '#EBF0FC',
      '--sdk-color-surface': '#FCFDFF',
      '--sdk-color-canvas': '#CFD9F2',
      '--sdk-sidebar-bg': '#D7E0F6',
    },
  },
  'cream-paper': {
    id: 'cream-paper',
    name: '奶油暖纸',
    scheme: 'light',
    badge: '暖奶油光学纸感',
    swatches: ['#E2D6C3', '#F5EDE1', '#FFFDF8', '#EA580C'],
    vars: {
      '--background': '#F5EDE1',
      '--body-background': '#F5EDE1',
      '--foreground': '#231C16',
      '--sidebar': '#E2D6C3',
      '--sidebar-secondary': 'rgba(217, 95, 32, 0.14)',
      '--sidebar-muted': 'rgba(138, 75, 28, 0.08)',
      '--content': '#F5EDE1',
      '--card': '#FFFDF8',
      '--card-border': 'rgba(180, 108, 52, 0.24)',
      '--card-edge': 'rgba(180, 108, 52, 0.19)',
      '--border': 'rgba(68, 46, 26, 0.15)',
      '--shell': '#F5EDE1',
      '--shell-canvas': '#E2D6C3',
      '--glass': 'rgba(255, 251, 244, 0.91)',
      '--glass-border': 'rgba(217, 95, 32, 0.28)',
      '--glass-highlight': 'rgba(255, 255, 255, 0.98)',
      '--glass-shadow': '0 16px 38px -10px rgba(68, 52, 32, 0.18), 0 3px 10px -2px rgba(194, 89, 52, 0.10)',
      '--nux-chip-shadow': '0 4px 12px -4px rgba(68, 52, 32, 0.16), 0 1px 2px rgba(68, 52, 32, 0.07)',
      '--onyx-frame': '#E2D6C3',
      '--onyx-well': '#EAE0D0',
      '--onyx-raised': '#FFFDF8',
      '--onyx-selected': '#FFF9F0',
      '--onyx-key': '#FAF4E8',
      '--secondary': '#EAE0CF',
      '--secondary-foreground': '#45362A',
      '--muted': '#EFE6D7',
      '--muted-foreground': '#6A5848',
      '--placeholder': '#8A7665',
      '--primary-foreground': '#FFFFFF',
      '--link': '#B54D28',
      '--home-glow': 'rgba(234, 88, 12, 0.18)',
      '--scrim': 'rgba(32, 24, 16, 0.34)',
      '--editor-selection-background': 'rgba(217, 119, 6, 0.24)',
      '--editor-comment-selection-background': 'rgba(217, 119, 6, 0.15)',
      '--editor-code-block-background': '#ECE3D3',
      '--gk-tonal-0': '#DACCB7',
      '--gk-tonal-1': '#F5EDE1',
      '--gk-tonal-2': '#FFFDF8',
      '--gk-tonal-3': '#EFE6D7',
      '--gk-tonal-4': '#FFFDF8',
      '--gk-specular': 'rgba(255, 255, 255, 0.96)',
      '--gk-surface-sheen': 'linear-gradient(175deg, rgba(255,255,255,0.96), rgba(249,238,222,0.68))',
      '--gk-composer-bg': 'rgba(255, 252, 246, 0.94)',
      '--gk-composer-shadow': '0 16px 36px -10px rgba(68, 52, 32, 0.18), 0 3px 10px -2px rgba(194, 89, 52, 0.11), inset 0 1px 0 rgba(255,255,255,0.96)',
      '--gk-bubble-bg': 'rgba(242, 230, 212, 0.93)',
      '--gk-popover-bg': 'rgba(254, 249, 241, 0.94)',
      '--gk-pattern-ink': 'rgba(186, 92, 36, 0.145)',
      '--gk-scroll-thumb': 'rgba(186, 92, 36, 0.28)',
      '--gk-scroll-thumb-hover': 'rgba(186, 92, 36, 0.48)',
      '--vscode-editor-background': '#F5EDE1',
      '--vscode-sideBar-background': '#E2D6C3',
      '--vscode-panel-background': '#F5EDE1',
      '--sdk-color-surface': '#FFFDF8',
      '--sdk-color-canvas': '#DACCB7',
      '--sdk-sidebar-bg': '#E2D6C3',
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
  themeIntensity: 'vivid',
  focusMode: false,
  motionLevel: 'standard',
  cornerRadius: 'soft',
  ambientIntensity: 85,
  watermark: {
    enabled: true,
    role: 'follow-role',
    opacity: 0.14,
    customFilePath: '',
  },
  i18n: {
    mode: 'auto',
    autoChineseStyle: 'neko-zh',
  },
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
 * 校验本地自定义角色水印图片路径（仅放行静态/动图，拒绝视频、UNC 及目录穿越）。
 * @param {string} rawPath
 */
export function validateWatermarkImagePath(rawPath) {
  const check = validateWallpaperFilePath(rawPath);
  if (!check.ok) return check;
  if (check.isVideo) {
    return { ok: false, path: '', error: '角落水印仅支持透明/静态图片格式（PNG/WebP/GIF/AVIF/JPG）' };
  }
  return check;
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
  const themeIntensity = ALLOWED_THEME_INTENSITIES.has(src.themeIntensity)
    ? src.themeIntensity
    : (ALLOWED_THEME_INTENSITIES.has(b.themeIntensity) ? b.themeIntensity : 'vivid');
  const motionLevel = ALLOWED_MOTION_LEVELS.has(src.motionLevel)
    ? src.motionLevel
    : (ALLOWED_MOTION_LEVELS.has(b.motionLevel) ? b.motionLevel : 'standard');
  const cornerRadius = ALLOWED_CORNER_RADIUS.has(src.cornerRadius)
    ? src.cornerRadius
    : (ALLOWED_CORNER_RADIUS.has(b.cornerRadius) ? b.cornerRadius : 'soft');

  const srcWm = src.watermark && typeof src.watermark === 'object' ? src.watermark : {};
  const bWm = b.watermark || DEFAULT_HOST_THEME_CONFIG.watermark;
  let wmRole = ALLOWED_WATERMARK_ROLES.has(srcWm.role)
    ? srcWm.role
    : (ALLOWED_WATERMARK_ROLES.has(bWm.role) ? bWm.role : 'follow-role');
  let wmCustomPath = typeof srcWm.customFilePath === 'string'
    ? srcWm.customFilePath.trim()
    : (typeof bWm.customFilePath === 'string' ? bWm.customFilePath.trim() : '');
  if (wmCustomPath) {
    const wmCheck = validateWatermarkImagePath(wmCustomPath);
    wmCustomPath = wmCheck.ok ? wmCheck.path : '';
  }
  if (wmRole === 'custom' && !wmCustomPath) {
    wmRole = 'follow-role';
  }

  const srcI18n = src.i18n && typeof src.i18n === 'object' ? src.i18n : {};
  const bI18n = b.i18n || DEFAULT_HOST_THEME_CONFIG.i18n;
  const i18nMode = ALLOWED_I18N_MODES.has(srcI18n.mode)
    ? srcI18n.mode
    : (ALLOWED_I18N_MODES.has(bI18n.mode) ? bI18n.mode : 'auto');
  const autoChineseStyle = ALLOWED_I18N_AUTO_STYLES.has(srcI18n.autoChineseStyle)
    ? srcI18n.autoChineseStyle
    : (ALLOWED_I18N_AUTO_STYLES.has(bI18n.autoChineseStyle) ? bI18n.autoChineseStyle : 'neko-zh');

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
    themeIntensity,
    focusMode: asBool(src.focusMode, asBool(b.focusMode, false)),
    motionLevel,
    cornerRadius,
    ambientIntensity: Math.round(clampNumber(src.ambientIntensity, 0, 100, b.ambientIntensity ?? 85)),
    watermark: {
      enabled: asBool(srcWm.enabled, asBool(bWm.enabled, true)),
      role: wmRole,
      opacity: Number(clampNumber(srcWm.opacity, 0.04, 0.38, bWm.opacity ?? 0.14).toFixed(2)),
      customFilePath: wmCustomPath,
    },
    i18n: {
      mode: i18nMode,
      autoChineseStyle,
    },
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
