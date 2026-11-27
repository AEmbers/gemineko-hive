/**
 * @file Antigravity 主窗口 10 大自研控件专属「哈基米热梗」彩蛋与 WebAudio 合成音效引擎（CDP 宿主侧注入，不占 dist/gemineko-hive.js 包体）。
 * 1. 每个控件配备独立机制 + 防误触手势，且全收集（13/13）解锁终极「👑 至尊圆头耄耋·哈基米星河大阅兵」；
 * 2. 所有彩蛋自动遵守 cfg.enabled 与 cfg.focusMode（专注 0fps 下全量静默），音效受 cfg.easterEggs.soundEnabled 控制；
 * 3. unmount() 全量回收样式、浮层节点、定时器和事件监听。
 */

import {
  CRYSTAL_STORY_CHAPTERS,
  CRYSTAL_STORY_CURRENT_CHAPTER,
  EASTER_EGG_CATALOG,
} from '../theme/host-theme-config.mjs';

/**
 * 构造注入宿主 Renderer 的彩蛋引擎源码片段（定义 initHostEasterEggs）。
 * @returns {string}
 */
export function buildHostEasterEggsRuntimeSnippet() {
  const catalogJson = JSON.stringify(EASTER_EGG_CATALOG);
  const storyChaptersJson = JSON.stringify(CRYSTAL_STORY_CHAPTERS);
  const currentStoryChapterJson = JSON.stringify(CRYSTAL_STORY_CURRENT_CHAPTER);
  return `
  function initHostEasterEggs(ctx) {
    const STYLE_ID = 'gemineko-host-eggs-style-v1';
    const TOAST_ID = 'gemineko-egg-unlock-toast';
    const OVERLAY_CLASS = 'gk-egg-temp-fx';
    const CATALOG = ${catalogJson};
    const CATALOG_MAP = new Map(CATALOG.map((it) => [it.id, it]));
    const CRYSTAL_CHAPTERS = ${storyChaptersJson};
    const CRYSTAL_CURRENT_CH = Number(${currentStoryChapterJson}) || 1;
    const activeCrystalStory = CRYSTAL_CHAPTERS.find((c) => c.chapter === CRYSTAL_CURRENT_CH) || CRYSTAL_CHAPTERS[0];

    let cfg = ctx.initialConfig && typeof ctx.initialConfig === 'object' ? ctx.initialConfig : {};
    let stopped = false;
    let audioCtx = null;
    const timers = new Set();
    const intervals = new Set();
    const activeAudios = new Set();
    let unlockedSet = new Set(Array.isArray(cfg.easterEggs?.unlocked) ? cfg.easterEggs.unlocked : []);

    // 各控件交互状态记录
    let mamboHits = [];
    let minibarTitleHits = [];
    let crystalTapCount = 0;
    let crystalLastTapAt = 0;
    let crystalRescuing = false;
    const inlineClickState = new WeakMap();
    const outlineFlipHistory = [];
    let spinoTimer = null;
    let maodieTimer = null;

    const FORTUNE_QUOTES = [
      '上上签：今日代码零报错，南北绿豆浆管饱 🫛',
      '大吉签：圆头耄耋护体，Strict Review 一遍通过 👑',
      '中吉签：遇到玄学 Bug 先哈一口气再重构，灵感自来 ⚡',
      '欧皇签：缓存命中率 99%，TypeScript 全绿过关 ✨',
      '摸鱼签：踩奶三下再提交 PR，合并绝无冲突 🐾',
      '战猫签：有人敢乱改核心架构？直接开脊背龙形态吓退他 🦖',
      '曼波签：哈基米曼波！不管报啥错，先喝口水喘口气再修 🎵',
      '液体签：心思如液体猫一样灵活，再刁钻的布局也能塞进去 💧',
      '小鱼干签：今天适合犒劳自己一顿，Swarm 全员为你打工 🐟',
      '星钻签：既见哈基，为何不咪？需求明确清晰不返工 💎',
    ];

    const STAMP_TEXTS = [
      '耄耋已阅 · 零BUG',
      '南北绿豆认证 🫛',
      '哈气退散 · 稳如老狗',
      '哈基米踩奶质检 ✓',
    ];

    function setManagedTimeout(fn, ms) {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!stopped) fn();
      }, ms);
      timers.add(id);
      return id;
    }

    function setManagedInterval(fn, ms) {
      const id = setInterval(() => {
        if (!stopped) fn();
      }, ms);
      intervals.add(id);
      return id;
    }

    function clearManagedInterval(id) {
      if (!id) return;
      clearInterval(id);
      intervals.delete(id);
    }

    function isAllowed() {
      return !stopped && cfg.enabled !== false && cfg.focusMode !== true;
    }

    function isSoundOn() {
      return isAllowed() && cfg.easterEggs?.soundEnabled !== false;
    }

    function ensureStyle() {
      if (document.getElementById(STYLE_ID) || !document.head) return;
      const st = document.createElement('style');
      st.id = STYLE_ID;
      st.textContent = \`
#\${TOAST_ID} {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  border-radius: 999px;
  background: var(--gk-popover-bg, rgba(16, 18, 34, 0.92));
  color: var(--foreground, #f8fafc);
  border: 1.5px solid color-mix(in srgb, var(--gk-role-primary, #8b5cf6) 58%, #fbbf24);
  box-shadow: 0 18px 42px -12px rgba(139, 92, 246, 0.45), 0 0 0 1px rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);
  font-size: calc(12.5px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 700;
  pointer-events: none;
  animation: gkEggToastIn 0.34s cubic-bezier(.34,1.4,.64,1);
}
@keyframes gkEggToastIn {
  0% { opacity: 0; transform: translate(-50%, -18px) scale(0.9); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
/* 1. 脊背龙形态：原地变身 Dock（零叠罗汉） */
#\${ctx.dockId}.gk-egg-spino-active .gk-dock-cat {
  filter: drop-shadow(0 0 18px rgba(236, 72, 153, 0.85)) !important;
  transform: scale(1.12);
  transition: transform 0.25s cubic-bezier(.22,1.5,.4,1), filter 0.25s ease;
}
#\${ctx.dockId}.gk-egg-spino-active .gk-dock-badge {
  border-color: rgba(244, 63, 94, 0.85) !important;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.35), 0 14px 32px -10px rgba(244, 63, 94, 0.55) !important;
  animation: gkSpinoJitter 0.14s infinite alternate !important;
}
#\${ctx.dockId}.gk-egg-spino-active .gk-phase {
  background: linear-gradient(120deg, #be123c, #ef4444, #f97316) !important;
  color: #fff !important;
}
@keyframes gkSpinoJitter {
  0% { transform: translate(-1.5px, 0) rotate(-0.8deg); }
  100% { transform: translate(1.5px, -1.5px) rotate(0.8deg); }
}
.gk-egg-spino-wave {
  position: fixed;
  z-index: 2147483644;
  pointer-events: none;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(90deg, #e11d48, #9333ea);
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.45);
  animation: gkHissWaveOut 0.9s ease-out forwards;
}
@keyframes gkSpinoBurst {
  0% { transform: scale(0.45) translateY(16px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes gkHissWaveOut {
  0% { transform: translate(0, 0) scale(0.75); opacity: 1; }
  100% { transform: translate(var(--wx, 38px), var(--wy, -44px)) scale(1.25); opacity: 0; }
}
/* 2. 首页沉睡水晶哈基米 · 跨版本拯救物语（第1章：晶中微语） */
#gemineko-home-emblem.gk-egg-crystal-nudge .gk-he-stage {
  animation: gkCrystalNudge 0.34s cubic-bezier(.36,.07,.19,.97) !important;
}
#gemineko-home-emblem.gk-egg-crystal-shake .gk-he-stage {
  animation: gkCrystalRattleShake 0.68s cubic-bezier(.36,.07,.19,.97) !important;
  filter: drop-shadow(0 0 22px rgba(96, 165, 250, 0.85)) brightness(1.12);
}
@keyframes gkCrystalNudge {
  0%, 100% { transform: rotate(0deg) scale(1); }
  28% { transform: rotate(-4deg) scale(1.04); }
  65% { transform: rotate(4deg) scale(1.02); }
}
@keyframes gkCrystalRattleShake {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1.02); }
  12% { transform: translate(-6px, -2px) rotate(-6deg) scale(1.06); }
  25% { transform: translate(7px, 2px) rotate(6deg) scale(1.08); }
  38% { transform: translate(-7px, 1px) rotate(-5deg) scale(1.07); }
  52% { transform: translate(6px, -2px) rotate(5deg) scale(1.06); }
  66% { transform: translate(-4px, 1px) rotate(-3deg) scale(1.04); }
  82% { transform: translate(3px, 0) rotate(2deg) scale(1.02); }
}
.gk-egg-crystal-bubble {
  position: fixed;
  z-index: 2147483646;
  pointer-events: none;
  min-width: 196px;
  max-width: min(300px, calc(100vw - 24px));
  padding: 10px 14px 11px;
  border-radius: 16px;
  border: 1.5px solid rgba(167, 139, 250, 0.72);
  background: linear-gradient(145deg, rgba(19, 24, 52, 0.94), rgba(49, 28, 78, 0.92));
  color: #f5f3ff;
  box-shadow: 0 16px 38px rgba(59, 130, 246, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(14px);
  transform: translate(-50%, -100%);
  animation: gkCrystalBubbleIn 0.36s cubic-bezier(.22,1.3,.36,1) forwards;
}
.gk-egg-crystal-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 12px;
  height: 12px;
  background: rgba(39, 27, 68, 0.94);
  border-right: 1.5px solid rgba(167, 139, 250, 0.72);
  border-bottom: 1.5px solid rgba(167, 139, 250, 0.72);
  transform: translateX(-50%) rotate(45deg);
}
.gk-egg-crystal-ch {
  font-size: calc(10px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #93c5fd;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.gk-egg-crystal-line {
  font-size: calc(14px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #fdf4ff;
  text-shadow: 0 0 12px rgba(236, 72, 153, 0.45);
  line-height: 1.45;
}
.gk-egg-crystal-ch-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(4px);
  animation: gkCrystalCharIn 0.28s ease forwards;
}
@keyframes gkCrystalBubbleIn {
  0% { opacity: 0; transform: translate(-50%, calc(-100% + 14px)) scale(0.84); }
  100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
}
@keyframes gkCrystalCharIn {
  to { opacity: 1; transform: translateY(0); }
}
.gk-egg-crystal-spark {
  position: fixed;
  z-index: 2147483645;
  pointer-events: none;
  font-size: 13px;
  color: #bae6fd;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.9);
  animation: gkCrystalSparkFly var(--sdur, 1s) ease-out forwards;
}
@keyframes gkCrystalSparkFly {
  0% { opacity: 1; transform: translate(0, 0) scale(0.7); }
  100% { opacity: 0; transform: translate(var(--sx, 40px), var(--sy, -50px)) scale(1.25); }
}
.gk-egg-bean-banner {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: calc(11.5px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 800;
  color: #ecfdf5;
  background: linear-gradient(90deg, #059669, #10b981, #84cc16);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  white-space: nowrap;
}
.gk-egg-fortune-bean {
  display: flex;
  align-items: center;
  gap: 10px;
}
.gk-egg-fortune-bean img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 10px rgba(16, 185, 129, 0.45));
}
/* 3. 首页舞台曼波舞 */
#gemineko-home-stage .gk-home-actor.gk-egg-note-lit {
  box-shadow: 0 0 0 2px var(--gk-role-primary, #8b5cf6), 0 0 16px rgba(139, 92, 246, 0.45) !important;
  transform: translateY(-4px) scale(1.06);
}
#gemineko-home-stage.gk-egg-mambo-dance .gk-home-actor {
  animation: gkMamboWiggle 0.42s ease-in-out infinite alternate !important;
}
#gemineko-home-stage.gk-egg-mambo-dance .gk-home-actor:nth-child(even) {
  animation-direction: alternate-reverse !important;
}
@keyframes gkMamboWiggle {
  0% { transform: translate(-5px, 0) rotate(-6deg); }
  100% { transform: translate(5px, -6px) rotate(6deg); }
}
/* 4. 圆头耄耋：博古架降临 */
#gemineko-corner-watermark.gk-egg-maodie-active {
  opacity: 0.96 !important;
  transform: scale(1.12) translate(-14px, -16px);
  transition: transform 0.35s cubic-bezier(.34,1.5,.64,1), opacity 0.25s ease;
}
.gk-egg-maodie-card {
  position: fixed;
  right: 26px;
  bottom: 92px;
  z-index: 2147483645;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: gkMaodieAscend 0.35s cubic-bezier(.34,1.4,.64,1);
}
.gk-egg-maodie-card img {
  width: 132px;
  height: 132px;
  object-fit: contain;
  filter: drop-shadow(0 0 22px rgba(245, 158, 11, 0.72));
}
.gk-egg-maodie-halo {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: calc(11.5px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 800;
  color: #451a03;
  background: linear-gradient(90deg, #fde047, #f59e0b, #fbbf24);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.45);
}
@keyframes gkMaodieAscend {
  0% { opacity: 0; transform: translateY(28px) scale(0.65); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
/* 5. 液体猫：悬浮猫爪大纲 */
#gemineko-paw-outline-fab.gk-egg-liquid-stretch {
  animation: gkLiquidCat 1.05s cubic-bezier(.28,1.5,.42,1) !important;
}
@keyframes gkLiquidCat {
  0% { transform: scale(1, 1); }
  22% { transform: scale(0.66, 1.95); }
  46% { transform: scale(1.28, 0.72); }
  70% { transform: scale(0.86, 1.24); }
  100% { transform: scale(1, 1); }
}
.gk-egg-paw-step {
  position: fixed;
  z-index: 2147483644;
  pointer-events: none;
  font-size: 16px;
  filter: drop-shadow(0 0 8px var(--gk-role-primary, #8b5cf6));
  animation: gkPawStepFade 1.5s ease-out forwards;
}
@keyframes gkPawStepFade {
  0% { opacity: 0.95; transform: scale(0.75) translateX(0); }
  100% { opacity: 0; transform: scale(1.1) translateX(-18px); }
}
/* 6. 提问舞台抓阄 */
.gk-ask-ponder-img, .gk-ask-thought-bubble { cursor: pointer; }
.gk-egg-lottery-pick {
  outline: 2.5px solid #f59e0b !important;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.25), 0 10px 26px -8px rgba(245, 158, 11, 0.45) !important;
  transition: box-shadow 0.2s ease;
}
/* 7. 长代码块踩奶质检印章 */
.gk-code-sticky-bar > span { cursor: pointer; }
.gk-egg-code-stamp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  margin-right: 8px;
  padding: 1px 8px;
  border-radius: 6px;
  border: 1.5px solid #ef4444;
  color: #ef4444;
  font-size: calc(10.5px * var(--gk-host-font-scale, 1)) !important;
  font-weight: 800;
  transform: rotate(-3.5deg);
  background: rgba(239, 68, 68, 0.08);
  animation: gkStampSlam 0.3s cubic-bezier(.22,1.6,.4,1);
}
@keyframes gkStampSlam {
  0% { opacity: 0; transform: scale(2.1) rotate(-14deg); }
  100% { opacity: 1; transform: scale(1) rotate(-3.5deg); }
}
/* 8. 快切浮层私人电音霓虹秀 */
#gemineko-dock-minibar.gk-egg-rave-mode {
  border: 2px solid transparent !important;
  background-image: linear-gradient(var(--gk-popover-bg, rgba(16,18,34,0.95)), var(--gk-popover-bg, rgba(16,18,34,0.95))),
    linear-gradient(90deg, #3b82f6, #ec4899, #fbbf24, #10b981, #3b82f6) !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  animation: gkRavePulse 0.45s ease-in-out infinite alternate !important;
}
@keyframes gkRavePulse {
  0% { box-shadow: 0 0 22px rgba(236, 72, 153, 0.45); }
  100% { box-shadow: 0 0 34px rgba(59, 130, 246, 0.65); }
}
.gk-egg-eq-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 20px;
  margin-top: 4px;
}
.gk-egg-eq-bars i {
  display: block;
  width: 6px;
  border-radius: 3px;
  background: linear-gradient(180deg, #22d3ee, #ec4899);
  animation: gkEqDance 0.42s ease-in-out infinite alternate;
}
@keyframes gkEqDance {
  0% { height: 4px; opacity: 0.6; }
  100% { height: 19px; opacity: 1; }
}
/* 9. 叮咚鸡运势签筒浮层 */
.gk-egg-fortune-card {
  position: fixed;
  z-index: 2147483646;
  max-width: min(320px, calc(100vw - 24px));
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--gk-popover-bg, rgba(18, 20, 38, 0.94));
  color: var(--foreground, #f8fafc);
  border: 1.5px solid color-mix(in srgb, #f59e0b 65%, transparent);
  box-shadow: 0 18px 42px -10px rgba(245, 158, 11, 0.42), var(--glass-shadow);
  backdrop-filter: blur(16px);
  cursor: pointer;
  animation: gkFortuneShake 0.48s ease;
}
@keyframes gkFortuneShake {
  0%, 100% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(-5deg) scale(1.03); }
  45% { transform: rotate(5deg) scale(1.04); }
  70% { transform: rotate(-3deg) scale(1.02); }
}
/* 10. 胖宝宝充气膨胀 */
.gk-inline-meme-card {
  cursor: pointer;
  position: relative;
}
.gk-egg-chubby-badge {
  position: fixed;
  z-index: 2147483645;
  pointer-events: none;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(90deg, #f472b6, #fb7185);
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.45);
  animation: gkBubblePop 0.25s ease;
}
/* 终极全收集大阅兵 */
.gk-egg-supreme-stage {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.20), rgba(139, 92, 246, 0.14), transparent 72%);
  animation: gkSupremeFade 4.8s ease forwards;
}
.gk-egg-supreme-trio {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 22px;
}
.gk-egg-supreme-trio img {
  width: 132px;
  height: 132px;
  object-fit: contain;
  filter: drop-shadow(0 10px 28px rgba(245, 158, 11, 0.65));
}
.gk-egg-supreme-trio img.is-king {
  width: 168px;
  height: 168px;
  transform: translateY(-10px);
}
@keyframes gkSupremeFade {
  0% { opacity: 0; }
  10% { opacity: 1; }
  88% { opacity: 1; }
  100% { opacity: 0; }
}
      \`;
      document.head.appendChild(st);
    }

    function playEggSfx(kind, step = 0) {
      if (!isSoundOn()) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
        const now = audioCtx.currentTime;

        const playTone = (freq, endFreq, dur, type = 'sine', gainPeak = 0.08, delay = 0) => {
          const t0 = now + delay;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, t0);
          if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + dur);
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.018);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t0);
          osc.stop(t0 + dur + 0.02);
        };

        if (kind === 'hiss') {
          const dur = 0.38;
          const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.7;
          const src = audioCtx.createBufferSource();
          src.buffer = buf;
          const bp = audioCtx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(1900, now);
          bp.frequency.exponentialRampToValueAtTime(3800, now + dur);
          bp.Q.value = 2.4;
          const g = audioCtx.createGain();
          g.gain.setValueAtTime(0.001, now);
          g.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
          src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
          src.start(now);
          playTone(210, 120, 0.22, 'sawtooth', 0.05, 0.02);
        } else if (kind === 'crystal-tap') {
          const baseF = 1180 + Math.min(9, step) * 95;
          playTone(baseF, baseF * 1.15, 0.14, 'sine', 0.055, 0);
          playTone(baseF * 1.5, baseF * 1.62, 0.18, 'triangle', 0.03, 0.02);
        } else if (kind === 'crystal-rattle') {
          [2140, 2290, 2080].forEach((f, i) => {
            playTone(f, f * 0.96, 0.16, 'sine', 0.075, i * 0.12);
            playTone(f * 1.62, f * 1.58, 0.14, 'triangle', 0.045, i * 0.12 + 0.02);
          });
        } else if (kind === 'crystal-whisper') {
          [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => {
            playTone(f, f * 1.01, 0.36, 'sine', 0.055, i * 0.14);
          });
        } else if (kind === 'mambo-note') {
          const notes = [523.25, 587.33, 659.25, 783.99, 880];
          const f = notes[Math.abs(step) % notes.length];
          playTone(f, f * 1.03, 0.16, 'triangle', 0.08, 0);
        } else if (kind === 'mambo-choir') {
          [523.25, 659.25, 783.99, 880, 783.99, 1046.5, 880, 1046.5].forEach((f, i) => {
            playTone(f, f, 0.14, 'square', 0.045, i * 0.12);
          });
        } else if (kind === 'maodie') {
          playTone(130, 72, 0.55, 'sawtooth', 0.1, 0);
          playTone(260, 140, 0.42, 'triangle', 0.08, 0.04);
        } else if (kind === 'boing') {
          playTone(220, 620, 0.16, 'sine', 0.08, 0);
          playTone(620, 260, 0.22, 'sine', 0.07, 0.14);
        } else if (kind === 'lottery-tick') {
          playTone(920, 760, 0.04, 'square', 0.035, 0);
        } else if (kind === 'lottery-win') {
          playTone(784, 784, 0.12, 'triangle', 0.08, 0);
          playTone(1046.5, 1174.6, 0.26, 'triangle', 0.09, 0.11);
        } else if (kind === 'stamp') {
          playTone(340, 440, 0.07, 'sine', 0.06, 0);
          playTone(380, 480, 0.07, 'sine', 0.06, 0.12);
          playTone(180, 82, 0.16, 'triangle', 0.11, 0.26);
        } else if (kind === 'rave') {
          [440, 554, 659, 880, 659, 880, 987, 1174].forEach((f, i) => {
            playTone(f, f * 0.98, 0.11, 'sawtooth', 0.04, i * 0.11);
          });
        } else if (kind === 'bamboo') {
          [0, 0.11, 0.22].forEach((d, idx) => playTone(620 + idx * 90, 420, 0.06, 'square', 0.05, d));
          playTone(880, 1046, 0.2, 'triangle', 0.07, 0.36);
        } else if (kind === 'inflate') {
          const baseF = 340 + Math.min(4, step) * 95;
          playTone(baseF, baseF * 1.28, 0.13, 'sine', 0.08, 0);
        } else if (kind === 'pop') {
          playTone(980, 240, 0.1, 'sine', 0.12, 0);
          playTone(1320, 1760, 0.16, 'triangle', 0.07, 0.06);
        } else if (kind === 'supreme') {
          [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => {
            playTone(f, f * 1.01, 0.45, 'triangle', 0.07, i * 0.09);
          });
        }
      } catch {
        /* 忽略 autoplay 限制 */
      }
    }

    /** 优先播放 Sidecar 克隆配音/物理音效 MP3，受限或离线时无缝回退至 WebAudio 合成音效 */
    function playEggAudio(fileName, opts = {}) {
      if (!isSoundOn()) return;
      const fallbackSfx = opts?.fallbackSfx || null;
      const fallbackStep = opts?.fallbackStep || 0;
      if (!fileName || !ctx.server) {
        if (fallbackSfx) playEggSfx(fallbackSfx, fallbackStep);
        return;
      }
      try {
        const audio = new Audio(\`\${ctx.server}/gemineko-audio/\${encodeURIComponent(fileName)}?v=0.8.2-weak1\`);
        audio.volume = typeof opts.volume === 'number' ? Math.max(0.05, Math.min(1, opts.volume)) : 0.92;
        activeAudios.add(audio);
        const cleanup = () => {
          activeAudios.delete(audio);
        };
        audio.addEventListener('ended', cleanup, { once: true });
        audio.addEventListener('error', () => {
          cleanup();
          if (fallbackSfx) playEggSfx(fallbackSfx, fallbackStep);
        }, { once: true });
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            cleanup();
            if (fallbackSfx) playEggSfx(fallbackSfx, fallbackStep);
          });
        }
      } catch {
        if (fallbackSfx) playEggSfx(fallbackSfx, fallbackStep);
      }
    }

    function showUnlockToast(text) {
      ensureStyle();
      const old = document.getElementById(TOAST_ID);
      if (old) old.remove();
      const toast = document.createElement('div');
      toast.id = TOAST_ID;
      toast.textContent = text;
      document.body?.appendChild(toast);
      setManagedTimeout(() => { if (toast.isConnected) toast.remove(); }, 3400);
    }

    function unlockEgg(eggId) {
      if (!isAllowed() || !CATALOG_MAP.has(eggId)) return;
      const meta = CATALOG_MAP.get(eggId);
      const localFirst = !unlockedSet.has(eggId);
      unlockedSet.add(eggId);
      if (localFirst) {
        showUnlockToast(\`🥚 发现新彩蛋（\${unlockedSet.size}/\${CATALOG.length}）：\${meta.title}\`);
      }
      fetch(\`\${ctx.server}/api/theme/egg/unlock\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sidecar-Token': ctx.token,
        },
        body: JSON.stringify({ id: eggId }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d || !d.ok) return;
          if (Array.isArray(d.unlocked)) unlockedSet = new Set(d.unlocked);
          if (d.completedAll && d.newlyUnlocked) {
            setManagedTimeout(() => triggerSupremeParade('host'), 900);
          }
        })
        .catch(() => {});
    }

    function spawnFloatingMsg(x, y, text, role = 'neon') {
      ctx.showSpeechBubble?.(text, 2800, { x, y, role });
    }

    function restoreDockSpinosaurus() {
      const dock = document.getElementById(ctx.dockId);
      if (!dock) return;
      dock.classList.remove('gk-egg-spino-active');
      const img = dock.querySelector('img.gk-dock-sprite');
      const phase = dock.querySelector('.gk-phase');
      const action = dock.querySelector('.gk-action');
      if (img && img.dataset.gkOrigSrc) {
        img.setAttribute('data-src', img.dataset.gkOrigDataSrc || img.dataset.gkOrigSrc);
        img.src = img.dataset.gkOrigSrc;
        delete img.dataset.gkOrigSrc;
        delete img.dataset.gkOrigDataSrc;
      }
      if (phase && phase.dataset.gkSavedTxt !== undefined) {
        phase.textContent = phase.dataset.gkSavedTxt;
        delete phase.dataset.gkSavedTxt;
      }
      if (action && action.dataset.gkSavedTxt !== undefined) {
        action.textContent = action.dataset.gkSavedTxt;
        delete action.dataset.gkSavedTxt;
      }
    }

    function restoreWatermarkMaodie() {
      const wm = document.getElementById('gemineko-corner-watermark');
      if (!wm) return;
      wm.classList.remove('gk-egg-maodie-active');
      const img = wm.querySelector('img.gk-wm-sprite');
      const tag = wm.querySelector('.gk-wm-tag');
      if (img && img.dataset.gkOrigWmSrc) {
        img.setAttribute('data-src', img.dataset.gkOrigWmDataSrc || img.dataset.gkOrigWmSrc);
        img.src = img.dataset.gkOrigWmSrc;
        delete img.dataset.gkOrigWmSrc;
        delete img.dataset.gkOrigWmDataSrc;
      }
      if (tag && tag.dataset.gkOrigWmTag !== undefined) {
        tag.textContent = tag.dataset.gkOrigWmTag;
        delete tag.dataset.gkOrigWmTag;
      }
    }

    // ========================================================
    // 10 个主窗口自研控件专属哈基米热梗彩蛋
    // ========================================================

    function runDockSpinosaurus(anchor) {
      ensureStyle();
      const dock = document.getElementById(ctx.dockId);
      const r = dock ? dock.getBoundingClientRect() : { left: 80, top: window.innerHeight - 130, width: 200 };
      const x = anchor?.x || r.left + 52;
      const y = anchor?.y || r.top;

      if (dock) {
        const img = dock.querySelector('img.gk-dock-sprite');
        const phase = dock.querySelector('.gk-phase');
        const action = dock.querySelector('.gk-action');
        if (img && !img.dataset.gkOrigSrc) {
          img.dataset.gkOrigSrc = img.src || '';
          img.dataset.gkOrigDataSrc = img.getAttribute('data-src') || '';
        }
        if (phase && phase.dataset.gkSavedTxt === undefined) phase.dataset.gkSavedTxt = phase.textContent || '';
        if (action && action.dataset.gkSavedTxt === undefined) action.dataset.gkSavedTxt = action.textContent || '';
        dock.classList.add('gk-egg-spino-active');
        if (img) {
          const spinoUrl = \`\${ctx.server}/gemineko-sprites/egg-spinosaurus-hiss.png?v=0.8.1\`;
          img.setAttribute('data-src', spinoUrl);
          img.src = spinoUrl;
        }
        if (phase) phase.textContent = '⚡ 脊背龙形态';
        if (action) action.textContent = '极怒哈气戒备';
        if (spinoTimer) clearTimeout(spinoTimer);
        spinoTimer = setManagedTimeout(() => {
          spinoTimer = null;
          restoreDockSpinosaurus();
        }, 3600);
      }

      document.querySelectorAll('.gk-egg-spino-wave').forEach((n) => n.remove());
      const waveDirs = [
        ['嘶哈——！！', -52, -48],
        ['脊背龙形态！', 44, -64],
        ['哈基米炸毛！！', 84, -30],
      ];
      waveDirs.forEach(([txt, wx, wy], idx) => {
        setManagedTimeout(() => {
          const w = document.createElement('div');
          w.className = 'gk-egg-spino-wave ' + OVERLAY_CLASS;
          w.textContent = txt;
          w.style.left = Math.round(x) + 'px';
          w.style.top = Math.round(y - 18) + 'px';
          w.style.setProperty('--wx', wx + 'px');
          w.style.setProperty('--wy', wy + 'px');
          document.body?.appendChild(w);
          setManagedTimeout(() => { if (w.isConnected) w.remove(); }, 950);
        }, idx * 140);
      });

      playEggAudio('egg-spinosaurus-hiss.mp3', { volume: 0.92, fallbackSfx: 'hiss' });
      unlockEgg('dock-spinosaurus');
    }

    function spawnCrystalSparks(cx, cy, count = 12) {
      const symbols = ['✦', '✧', '❄', '⋆'];
      for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'gk-egg-crystal-spark ' + OVERLAY_CLASS;
        s.textContent = symbols[i % symbols.length];
        const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const dist = 48 + Math.random() * 88;
        s.style.left = Math.round(cx - 6) + 'px';
        s.style.top = Math.round(cy - 6) + 'px';
        s.style.setProperty('--sx', Math.round(Math.cos(ang) * dist) + 'px');
        s.style.setProperty('--sy', Math.round(Math.sin(ang) * dist) + 'px');
        s.style.setProperty('--sdur', (0.75 + Math.random() * 0.5).toFixed(2) + 's');
        document.body?.appendChild(s);
        setManagedTimeout(() => { if (s.isConnected) s.remove(); }, 1350);
      }
    }

    function runEmblemCrystalRescue(anchor = {}) {
      ensureStyle();
      const ch = activeCrystalStory || {
        chapter: 1,
        title: '第 1 章 · 晶中微语',
        bubbleText: '主人，救救我……',
        rattleAudio: 'crystal-rattle.mp3',
        voiceAudio: 'crystal-ch1-help.mp3',
      };
      const emblem = (anchor?.el && anchor.el.isConnected ? anchor.el : null) || document.getElementById('gemineko-home-emblem');
      const er = emblem ? emblem.getBoundingClientRect() : null;
      const cx = Math.max(120, Math.min(window.innerWidth - 120, Math.round(er ? er.left + er.width / 2 : (anchor?.x || window.innerWidth / 2))));
      const cy = Math.max(130, Math.min(window.innerHeight - 120, Math.round(er ? er.top + 14 : (anchor?.y || window.innerHeight * 0.34))));

      crystalRescuing = true;
      document.querySelectorAll('.gk-egg-crystal-bubble').forEach((n) => n.remove());

      // 第一拍：水晶摇晃震颤 + 玻璃/水晶碰撞摇晃音效
      if (emblem) {
        emblem.classList.remove('gk-egg-crystal-nudge', 'gk-egg-crystal-shake');
        void emblem.offsetWidth;
        emblem.classList.add('gk-egg-crystal-shake');
        setManagedTimeout(() => emblem.classList.remove('gk-egg-crystal-shake'), 720);
      }
      spawnCrystalSparks(cx, (er ? er.top + er.height / 2 : cy + 40), 10);
      playEggAudio(ch.rattleAudio || 'crystal-rattle.mp3', { volume: 0.94, fallbackSfx: 'crystal-rattle' });

      // 第二拍（520ms 后，摇晃收尾瞬间）：气泡与逐字台词 + 克隆呼救配音同步出现
      setManagedTimeout(() => {
        if (stopped) return;
        const bubble = document.createElement('div');
        bubble.className = 'gk-egg-crystal-bubble ' + OVERLAY_CLASS;
        bubble.style.left = cx + 'px';
        bubble.style.top = Math.max(76, cy - 8) + 'px';

        const header = document.createElement('div');
        header.className = 'gk-egg-crystal-ch';
        header.innerHTML = \`<span>💎 \${ch.title}</span><span>连载 \${ch.chapter}/\${CRYSTAL_CHAPTERS.length}</span>\`;

        const lineEl = document.createElement('div');
        lineEl.className = 'gk-egg-crystal-line';
        const chars = Array.from(String(ch.bubbleText || '主人，救救我……'));
        chars.forEach((c, idx) => {
          const sp = document.createElement('span');
          sp.className = 'gk-egg-crystal-ch-char';
          sp.textContent = c;
          sp.style.animationDelay = (idx * 240) + 'ms';
          lineEl.appendChild(sp);
        });

        bubble.appendChild(header);
        bubble.appendChild(lineEl);
        document.body?.appendChild(bubble);

        spawnCrystalSparks(cx, cy + 20, 14);
        playEggAudio(ch.voiceAudio || 'crystal-ch1-help.mp3', { volume: 0.96, fallbackSfx: 'crystal-whisper' });
        unlockEgg('emblem-crystal-rescue');

        setManagedTimeout(() => {
          if (bubble.isConnected) bubble.remove();
          crystalRescuing = false;
        }, 6200);
      }, 520);
    }

    function onHomeEmblemTap(anchor = {}) {
      if (!isAllowed()) return false;
      ensureStyle();
      const ch = activeCrystalStory || { requiredClicks: 10 };
      const needed = Number(ch.requiredClicks) || 10;
      const now = Date.now();
      if (now - crystalLastTapAt > 1800) {
        crystalTapCount = 0;
      }
      crystalLastTapAt = now;
      if (crystalRescuing) return true;

      crystalTapCount += 1;
      const emblem = (anchor?.el && anchor.el.isConnected ? anchor.el : null) || document.getElementById('gemineko-home-emblem');
      const er = emblem ? emblem.getBoundingClientRect() : null;
      const cx = anchor?.x || (er ? er.left + er.width / 2 : window.innerWidth / 2);
      const cy = anchor?.y || (er ? er.top + er.height / 2 : window.innerHeight * 0.36);

      if (crystalTapCount < needed) {
        if (emblem) {
          emblem.classList.remove('gk-egg-crystal-nudge');
          void emblem.offsetWidth;
          emblem.classList.add('gk-egg-crystal-nudge');
          setManagedTimeout(() => emblem.classList.remove('gk-egg-crystal-nudge'), 360);
        }
        spawnCrystalSparks(cx, cy, Math.min(8, 2 + Math.floor(crystalTapCount / 2)));
        playEggSfx('crystal-tap', crystalTapCount);
        return true;
      }

      crystalTapCount = 0;
      runEmblemCrystalRescue({ x: cx, y: cy, el: emblem });
      return true;
    }

    function runStageMamboChoir() {
      ensureStyle();
      const stage = document.getElementById('gemineko-home-stage');
      if (stage) {
        stage.classList.remove('gk-egg-mambo-dance');
        void stage.offsetWidth;
        stage.classList.add('gk-egg-mambo-dance');
        setManagedTimeout(() => stage.classList.remove('gk-egg-mambo-dance'), 3300);
      }
      const sr = stage ? stage.getBoundingClientRect() : null;
      const sx = sr ? sr.left + sr.width / 2 : window.innerWidth / 2;
      const sy = sr ? sr.top : window.innerHeight * 0.55;
      spawnFloatingMsg(sx, sy, '🎵 曼波~ 哈基米曼波~ 阿西嘎！（全员合唱模式开启）', 'hydrogen');
      ctx.spawnStardust?.(sx, sy, 22, 'confetti', 'hydrogen');
      playEggAudio('egg-mambo-choir.mp3', { volume: 0.88, fallbackSfx: 'mambo-choir' });
      unlockEgg('stage-mambo-choir');
    }

    function onHomeStageActorClick(roleId, idx, clientX, clientY, btn) {
      if (!isAllowed()) return;
      ensureStyle();
      const syllables = ['哈♪', '基♪', '米♪', '曼♪', '波♪'];
      const note = syllables[Math.abs(idx) % syllables.length];
      playEggSfx('mambo-note', idx);
      if (btn) {
        btn.classList.add('gk-egg-note-lit');
        setManagedTimeout(() => btn.classList.remove('gk-egg-note-lit'), 700);
      }
      spawnFloatingMsg(clientX, clientY, \`\${note} \${String(roleId || 'neon').toUpperCase()} 入列曼波合唱团\`, roleId || 'neon');
      const now = Date.now();
      mamboHits = mamboHits.filter((it) => now - it.ts <= 6000);
      mamboHits.push({ role: roleId, ts: now });
      const distinct = new Set(mamboHits.map((it) => it.role));
      if (distinct.size >= 3) {
        mamboHits = [];
        setManagedTimeout(() => runStageMamboChoir(), 220);
      }
    }

    function runWatermarkMaodie() {
      ensureStyle();
      const wm = document.getElementById('gemineko-corner-watermark');
      document.querySelectorAll('.gk-egg-maodie-card').forEach((n) => n.remove());

      if (wm && wm.isConnected) {
        const img = wm.querySelector('img.gk-wm-sprite');
        const tag = wm.querySelector('.gk-wm-tag');
        if (img && !img.dataset.gkOrigWmSrc) {
          img.dataset.gkOrigWmSrc = img.src || '';
          img.dataset.gkOrigWmDataSrc = img.getAttribute('data-src') || '';
        }
        if (tag && tag.dataset.gkOrigWmTag === undefined) {
          tag.dataset.gkOrigWmTag = tag.textContent || '';
        }
        wm.classList.add('gk-egg-maodie-active');
        if (img) {
          const bossUrl = \`\${ctx.server}/gemineko-sprites/egg-maodie-boss.png?v=0.8.1\`;
          img.setAttribute('data-src', bossUrl);
          img.src = bossUrl;
        }
        if (tag) tag.textContent = '👑 圆头耄耋 · 哈基米护主';
        if (maodieTimer) clearTimeout(maodieTimer);
        maodieTimer = setManagedTimeout(() => {
          maodieTimer = null;
          restoreWatermarkMaodie();
        }, 3400);
        const wr = wm.getBoundingClientRect();
        spawnFloatingMsg(wr.left + wr.width / 2, wr.top, '阁下也是来挑战博古架的？哈气预警！😾', 'claude');
      } else {
        const card = document.createElement('div');
        card.className = 'gk-egg-maodie-card ' + OVERLAY_CLASS;
        card.innerHTML = \`
          <img src="\${ctx.server}/gemineko-sprites/egg-maodie-boss.png?v=0.8.1" alt="圆头耄耋" />
          <div class="gk-egg-maodie-halo">👑 圆头耄耋 · 博古架护主降临</div>
        \`;
        document.body?.appendChild(card);
        setManagedTimeout(() => { if (card.isConnected) card.remove(); }, 3400);
        spawnFloatingMsg(window.innerWidth - 130, window.innerHeight - 235, '阁下也是来挑战博古架的？哈气预警！😾', 'claude');
      }
      playEggAudio('egg-maodie-boss.mp3', { volume: 0.9, fallbackSfx: 'maodie' });
      unlockEgg('watermark-maodie');
    }

    function runOutlineLiquidCat() {
      ensureStyle();
      const fab = document.getElementById('gemineko-paw-outline-fab');
      const fr = fab ? fab.getBoundingClientRect() : { left: window.innerWidth - 52, top: window.innerHeight * 0.48, width: 38 };
      if (fab) {
        fab.classList.remove('gk-egg-liquid-stretch');
        void fab.offsetWidth;
        fab.classList.add('gk-egg-liquid-stretch');
        setManagedTimeout(() => fab.classList.remove('gk-egg-liquid-stretch'), 1100);
      }
      for (let i = 0; i < 6; i++) {
        setManagedTimeout(() => {
          const paw = document.createElement('div');
          paw.className = 'gk-egg-paw-step ' + OVERLAY_CLASS;
          paw.textContent = '🐾';
          paw.style.left = Math.round(fr.left - 18 - i * 8) + 'px';
          paw.style.top = Math.round(fr.top + (i - 2.5) * 24) + 'px';
          document.body?.appendChild(paw);
          setManagedTimeout(() => { if (paw.isConnected) paw.remove(); }, 1550);
        }, i * 70);
      }
      spawnFloatingMsg(fr.left, fr.top, '别拽啦！哈基米已经流成一滩液体猫了喵💧', 'neon');
      playEggAudio('egg-liquid-cat.mp3', { volume: 0.88, fallbackSfx: 'boing' });
      unlockEgg('outline-liquid-cat');
    }

    function runAskClawLottery() {
      ensureStyle();
      const stage = document.querySelector('[data-gk-ask-stage="1"]');
      const bubble = stage?.querySelector('.gk-ask-thought-bubble');
      const optEls = stage
        ? [...stage.querySelectorAll('label[data-testid="ask-question-option"], [data-testid="ask-question-writein"]')].map(
            (el) => el.closest('label') || el,
          )
        : [];

      if (stage && bubble && optEls.length > 0) {
        const letters = optEls.map((el, i) => {
          const b = el.querySelector('[data-testid="ask-question-shortcut-badge"], [data-testid="ask-question-writein-shortcut-badge"]');
          return (b?.textContent || '').trim() || 'ABCDEF'[i] || String(i + 1);
        });
        const finalIdx = Math.floor(Math.random() * letters.length);
        const totalSteps = 10 + (finalIdx % 3);
        let step = 0;
        const iv = setManagedInterval(() => {
          const curIdx = step < totalSteps ? (step % letters.length) : finalIdx;
          bubble.querySelectorAll('.gk-ask-opt-letter').forEach((n, i) => n.classList.toggle('is-lit', i === curIdx));
          optEls.forEach((n, i) => n.classList.toggle('gk-egg-lottery-pick', i === curIdx));
          playEggSfx('lottery-tick');
          step += 1;
          if (step > totalSteps) {
            clearManagedInterval(iv);
            const br = bubble.getBoundingClientRect();
            spawnFloatingMsg(br.left + br.width / 2, br.top, \`🐾 哈基米抓阄就选「\${letters[finalIdx]}」啦！（仅供参考不代点）\`, 'carbon');
            playEggAudio('egg-claw-lottery.mp3', { volume: 0.88, fallbackSfx: 'lottery-win' });
            setManagedTimeout(() => optEls.forEach((n) => n.classList.remove('gk-egg-lottery-pick')), 3500);
          }
        }, 95);
        unlockEgg('ask-claw-lottery');
        return;
      }

      // 离线图鉴回放迷你抓阄卡片
      const demo = document.createElement('div');
      demo.className = 'gk-egg-fortune-card ' + OVERLAY_CLASS;
      demo.style.left = Math.round(window.innerWidth / 2 - 130) + 'px';
      demo.style.top = '110px';
      const opts = ['A', 'B', 'C', 'D'];
      const pick = opts[Math.floor(Math.random() * opts.length)];
      demo.innerHTML = '<div style="font-weight:800;margin-bottom:4px;">🐾 哈基米抓阄模拟盘</div><div class="gk-demo-spin" style="font-size:13px;">正在摇签…</div>';
      document.body?.appendChild(demo);
      let s = 0;
      const iv2 = setManagedInterval(() => {
        const spin = demo.querySelector('.gk-demo-spin');
        if (!spin) { clearManagedInterval(iv2); return; }
        if (s < 8) {
          spin.textContent = '轮盘滚动中：' + opts[s % opts.length] + ' ?';
          playEggSfx('lottery-tick');
          s += 1;
        } else {
          clearManagedInterval(iv2);
          spin.textContent = \`🐾 猫爪拍板锁定：「\${pick}」号选项（绝不代点提交）\`;
          playEggAudio('egg-claw-lottery.mp3', { volume: 0.88, fallbackSfx: 'lottery-win' });
        }
      }, 95);
      demo.addEventListener('click', () => demo.remove());
      setManagedTimeout(() => { if (demo.isConnected) demo.remove(); }, 3400);
      unlockEgg('ask-claw-lottery');
    }

    function runCodeKneadStamp(anchorEl) {
      ensureStyle();
      const targetBar = anchorEl?.closest?.('.gk-code-sticky-bar') || document.querySelector('.gk-code-sticky-bar');
      const stampText = STAMP_TEXTS[Math.floor(Math.random() * STAMP_TEXTS.length)];

      if (targetBar) {
        const br = targetBar.getBoundingClientRect();
        spawnFloatingMsg(br.left + 80, br.top, '🐾 哈基米正在踩奶质检代码…', 'claude');
        targetBar.querySelectorAll('.gk-egg-code-stamp').forEach((s) => s.remove());
        setManagedTimeout(() => {
          if (!targetBar.isConnected) return;
          const badge = document.createElement('span');
          badge.className = 'gk-egg-code-stamp';
          badge.textContent = stampText;
          const foldBtn = targetBar.querySelector('.gk-code-fold-btn');
          if (foldBtn) targetBar.insertBefore(badge, foldBtn);
          else targetBar.appendChild(badge);
        }, 550);
        playEggSfx('stamp');
        unlockEgg('code-knead-stamp');
        return;
      }

      // 回放兜底浮层
      const demo = document.createElement('div');
      demo.className = 'gk-egg-fortune-card ' + OVERLAY_CLASS;
      demo.style.left = Math.round(window.innerWidth / 2 - 140) + 'px';
      demo.style.top = '120px';
      demo.innerHTML = \`<div style="font-weight:800;">🐾 代码踩奶质检台</div><div style="margin-top:6px;" class="gk-egg-code-stamp">\${stampText}</div>\`;
      document.body?.appendChild(demo);
      demo.addEventListener('click', () => demo.remove());
      setManagedTimeout(() => { if (demo.isConnected) demo.remove(); }, 3000);
      playEggSfx('stamp');
      unlockEgg('code-knead-stamp');
    }

    function runMinibarCyberRave() {
      ensureStyle();
      let bar = document.getElementById('gemineko-dock-minibar');
      if (!bar || !bar.classList.contains('is-open')) {
        const anchorBtn = document.querySelector('#' + ctx.dockId + ' .gk-dock-theme-btn');
        window.__GEMINEKO_THEME_API__?.toggleMiniBar?.(anchorBtn);
        bar = document.getElementById('gemineko-dock-minibar');
      }
      if (!bar) return;

      bar.classList.add('gk-egg-rave-mode');
      const titleSpan = bar.querySelector('[data-egg-rave-title="1"]');
      const origTitle = titleSpan?.textContent || '';
      if (titleSpan) titleSpan.textContent = '🎧 哈基米电音工坊 · 阿西嘎！';

      bar.querySelectorAll('.gk-egg-eq-bars').forEach((n) => n.remove());
      const eq = document.createElement('div');
      eq.className = 'gk-egg-eq-bars ' + OVERLAY_CLASS;
      for (let i = 0; i < 12; i++) {
        const b = document.createElement('i');
        b.style.animationDelay = (i * 0.05).toFixed(2) + 's';
        eq.appendChild(b);
      }
      bar.appendChild(eq);

      setManagedTimeout(() => {
        bar.classList.remove('gk-egg-rave-mode');
        if (titleSpan && origTitle) titleSpan.textContent = origTitle;
        if (eq.isConnected) eq.remove();
      }, 3600);

      playEggSfx('rave');
      unlockEgg('minibar-cyber-rave');
    }

    function runCtxDingdongBox(anchor) {
      ensureStyle();
      document.querySelectorAll('.gk-egg-fortune-card').forEach((n) => n.remove());
      const quote = FORTUNE_QUOTES[Math.floor(Math.random() * FORTUNE_QUOTES.length)];
      const card = document.createElement('div');
      card.className = 'gk-egg-fortune-card ' + OVERLAY_CLASS;
      card.innerHTML = \`
        <div class="gk-egg-fortune-bean">
          <img src="\${ctx.server}/gemineko-sprites/egg-greenbean-soy.png?v=0.8.2" alt="南北绿豆浆" />
          <div>
            <div style="font-weight:800;font-size:13px;color:#fbbf24;margin-bottom:4px;">🎋 叮咚鸡 · 哈基米运势盲盒</div>
            <div style="font-size:12px;line-height:1.55;">\${quote}</div>
            <div style="font-size:10px;opacity:0.68;margin-top:5px;">附赠：南北绿豆浆今日份特调 · 点击收起</div>
          </div>
        </div>
      \`;
      const x = Math.max(16, Math.min(window.innerWidth - 340, Math.round(anchor?.x || window.innerWidth * 0.45)));
      const y = Math.max(24, Math.min(window.innerHeight - 140, Math.round(anchor?.y || window.innerHeight * 0.45)));
      card.style.left = x + 'px';
      card.style.top = y + 'px';
      card.addEventListener('click', () => card.remove());
      document.body?.appendChild(card);
      setManagedTimeout(() => { if (card.isConnected) card.remove(); }, 5200);

      playEggSfx('bamboo');
      unlockEgg('ctx-dingdong-box');
    }

    function runChubbyPopOnTarget(targetEl, clientX, clientY) {
      ensureStyle();
      const el = targetEl && targetEl.isConnected ? targetEl : null;
      const rect = el ? el.getBoundingClientRect() : null;
      const cx = clientX || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
      const cy = clientY || (rect ? rect.top + rect.height / 2 : window.innerHeight * 0.5);

      if (!el) {
        // 图鉴回放：临时胖宝宝演示卡片自动 4 连膨胀爆小鱼干
        const demo = document.createElement('div');
        demo.className = 'gk-egg-fortune-card ' + OVERLAY_CLASS;
        demo.style.left = Math.round(window.innerWidth / 2 - 110) + 'px';
        demo.style.top = '120px';
        demo.style.textAlign = 'center';
        demo.innerHTML = '<div style="font-size:36px;" class="gk-chubby-emoji">🐱</div><div style="font-size:12px;font-weight:800;margin-top:4px;">胖宝宝充气蓄力中…</div>';
        document.body?.appendChild(demo);
        [1, 2, 3, 4].forEach((step, idx) => {
          setManagedTimeout(() => {
            if (!demo.isConnected) return;
            const em = demo.querySelector('.gk-chubby-emoji');
            if (step < 4) {
              if (em) em.style.transform = \`scale(\${1 + step * 0.2})\`;
              playEggSfx('inflate', step);
            } else {
              if (em) em.style.transform = 'scale(1)';
              playEggAudio('egg-chubby-pop.mp3', { volume: 0.9, fallbackSfx: 'pop' });
              spawnFishExplosion(window.innerWidth / 2, 160);
              spawnFloatingMsg(window.innerWidth / 2, 120, '💥 啵！胖宝宝充气爆出一地小鱼干啦🐟', 'claude');
              setManagedTimeout(() => demo.remove(), 1100);
            }
          }, idx * 320);
        });
        unlockEgg('meme-chubby-pop');
        return;
      }

      const prev = inlineClickState.get(el) || { count: 0, ts: 0 };
      const now = Date.now();
      const count = now - prev.ts <= 3000 ? prev.count + 1 : 1;
      inlineClickState.set(el, { count, ts: now });

      if (count < 4) {
        const sc = (1 + count * 0.14).toFixed(2);
        el.style.transform = \`scale(\${sc})\`;
        const b = document.createElement('div');
        b.className = 'gk-egg-chubby-badge ' + OVERLAY_CLASS;
        b.textContent = \`胖宝宝 +\${count}\`;
        b.style.left = Math.round(cx - 26) + 'px';
        b.style.top = Math.round(cy - 34) + 'px';
        document.body?.appendChild(b);
        setManagedTimeout(() => { if (b.isConnected) b.remove(); }, 900);
        playEggSfx('inflate', count);
      } else {
        inlineClickState.set(el, { count: 0, ts: 0 });
        el.style.transform = '';
        spawnFishExplosion(cx, cy);
        spawnFloatingMsg(cx, cy, '💥 啵！胖宝宝充气爆出一地小鱼干啦🐟', 'claude');
        playEggAudio('egg-chubby-pop.mp3', { volume: 0.9, fallbackSfx: 'pop' });
        unlockEgg('meme-chubby-pop');
      }
    }

    function spawnFishExplosion(cx, cy) {
      for (let i = 0; i < 14; i++) {
        const f = document.createElement('div');
        f.className = 'gk-egg-paw-step ' + OVERLAY_CLASS;
        f.textContent = i % 2 === 0 ? '🐟' : '✨';
        const ang = (Math.PI * 2 * i) / 14;
        const r = 45 + Math.random() * 65;
        f.style.left = Math.round(cx + Math.cos(ang) * r) + 'px';
        f.style.top = Math.round(cy + Math.sin(ang) * r) + 'px';
        document.body?.appendChild(f);
        setManagedTimeout(() => { if (f.isConnected) f.remove(); }, 1400);
      }
    }

    function triggerSupremeParade(source = 'host') {
      if (!isAllowed() && source === 'auto') return;
      ensureStyle();
      document.querySelectorAll('.gk-egg-supreme-stage').forEach((n) => n.remove());
      const stage = document.createElement('div');
      stage.className = 'gk-egg-supreme-stage ' + OVERLAY_CLASS;
      stage.innerHTML = \`
        <div class="gk-egg-bean-banner" style="background:linear-gradient(90deg,#f59e0b,#ec4899,#8b5cf6);font-size:14px !important;padding:7px 18px;">
          👑 13/13 全彩蛋收集完成 · 至尊圆头耄耋星河大阅兵 👑
        </div>
        <div class="gk-egg-supreme-trio">
          <img src="\${ctx.server}/gemineko-sprites/egg-spinosaurus-hiss.png?v=0.8.1" alt="脊背龙" />
          <img class="is-king" src="\${ctx.server}/gemineko-sprites/egg-maodie-boss.png?v=0.8.1" alt="至尊圆头耄耋" />
          <img src="\${ctx.server}/gemineko-sprites/egg-greenbean-soy.png?v=0.8.1" alt="南北绿豆浆" />
        </div>
      \`;
      document.body?.appendChild(stage);
      setManagedTimeout(() => { if (stage.isConnected) stage.remove(); }, 4800);
      ctx.triggerHiveParadeBurst?.('neon', source === 'sidecar' ? 'sidecar' : 'auto');
      ctx.spawnStardust?.(window.innerWidth / 2, 0, 40, 'paw');
      playEggSfx('supreme');
    }

    function triggerById(eggId, anchor = {}) {
      if (!isAllowed()) return false;
      switch (eggId) {
        case 'dock-spinosaurus': runDockSpinosaurus(anchor); return true;
        case 'emblem-crystal-rescue': runEmblemCrystalRescue(anchor); return true;
        case 'stage-mambo-choir': runStageMamboChoir(); return true;
        case 'watermark-maodie': runWatermarkMaodie(); return true;
        case 'outline-liquid-cat': runOutlineLiquidCat(); return true;
        case 'ask-claw-lottery': runAskClawLottery(); return true;
        case 'code-knead-stamp': runCodeKneadStamp(anchor.el || null); return true;
        case 'minibar-cyber-rave': runMinibarCyberRave(); return true;
        case 'ctx-dingdong-box': runCtxDingdongBox(anchor); return true;
        case 'meme-chubby-pop': runChubbyPopOnTarget(anchor.el || null, anchor.x, anchor.y); return true;
        default: return false;
      }
    }

    // 统一主窗口双击/甩动委托监听
    function onDocDblClick(e) {
      if (!isAllowed()) return;
      const t = e.target;
      if (!t || !t.closest) return;

      // 1. 输入栏小猫双击 → 脊背龙形态
      if (t.closest('#' + ctx.dockId + ' .gk-dock-cat')) {
        e.stopPropagation();
        runDockSpinosaurus({ x: e.clientX, y: e.clientY, el: t });
        return;
      }
      // 3. 首页舞台标题双击 → 曼波大合唱
      if (t.closest('#gemineko-home-stage .gk-home-stage-sub')) {
        e.stopPropagation();
        runStageMamboChoir();
        return;
      }
      // 5. 悬浮猫爪大纲双击 → 液体猫回弹
      if (t.closest('#gemineko-paw-outline-fab')) {
        e.stopPropagation();
        runOutlineLiquidCat();
        return;
      }
      // 7. 代码块吸顶条左侧文字双击 → 踩奶质检盖章
      const stickyLabel = t.closest('.gk-code-sticky-bar > span');
      if (stickyLabel) {
        e.stopPropagation();
        runCodeKneadStamp(stickyLabel);
        return;
      }
      // 4. 右下角角色水印坐标命中双击（watermark 本身 pointer-events: none）
      if (t.closest('input, textarea, button, a, pre, code, .monaco-editor, #gemineko-cdp-composer-dock, #gemineko-dock-minibar')) return;
      const sel = String(window.getSelection?.()?.toString() || '').trim();
      if (sel) return;
      const wm = document.getElementById('gemineko-corner-watermark');
      if (wm) {
        const r = wm.getBoundingClientRect();
        if (r.width > 12 && e.clientX >= r.left - 16 && e.clientX <= r.right + 16 && e.clientY >= r.top - 16 && e.clientY <= r.bottom + 16) {
          runWatermarkMaodie();
        }
      }
    }

    function onDocClick(e) {
      if (!isAllowed()) return;
      const t = e.target;
      if (!t || !t.closest) return;
      // 6. 提问选择舞台沉思猫或思考气泡点击 → 哈基米抓阄
      if (t.closest('.gk-ask-ponder-img, .gk-ask-thought-bubble')) {
        e.stopPropagation();
        runAskClawLottery();
        return;
      }
      // 8. 快切浮层标题 2 秒内 3 连点 → 电音霓虹秀
      if (t.closest('#gemineko-dock-minibar [data-egg-rave-title="1"]')) {
        const now = Date.now();
        minibarTitleHits = minibarTitleHits.filter((ts) => now - ts <= 2000);
        minibarTitleHits.push(now);
        if (minibarTitleHits.length >= 3) {
          minibarTitleHits = [];
          runMinibarCyberRave();
        }
        return;
      }
      // 10. 行内活跃小猫点击 → 胖宝宝充气膨胀
      const inlineWrap = t.closest('.gk-live-inline-wrap');
      if (inlineWrap) {
        runChubbyPopOnTarget(inlineWrap, e.clientX, e.clientY);
      }
    }

    function onOutlineDragY(y) {
      if (!isAllowed()) return;
      const now = Date.now();
      outlineFlipHistory.push({ y, ts: now });
      while (outlineFlipHistory.length > 0 && now - outlineFlipHistory[0].ts > 1200) {
        outlineFlipHistory.shift();
      }
      if (outlineFlipHistory.length < 5) return;
      let flips = 0;
      let lastDir = 0;
      for (let i = 1; i < outlineFlipHistory.length; i++) {
        const dy = outlineFlipHistory[i].y - outlineFlipHistory[i - 1].y;
        if (Math.abs(dy) < 12) continue;
        const dir = dy > 0 ? 1 : -1;
        if (lastDir && dir !== lastDir) flips += 1;
        lastDir = dir;
      }
      if (flips >= 3) {
        outlineFlipHistory.length = 0;
        runOutlineLiquidCat();
      }
    }

    function onInlineMemeClick(card, x, y) {
      if (!isAllowed()) return;
      runChubbyPopOnTarget(card, x, y);
    }

    function applyConfig(nextCfg) {
      cfg = nextCfg && typeof nextCfg === 'object' ? nextCfg : {};
      if (Array.isArray(cfg.easterEggs?.unlocked)) {
        unlockedSet = new Set(cfg.easterEggs.unlocked);
      }
    }

    function unmount() {
      stopped = true;
      crystalRescuing = false;
      for (const a of activeAudios) {
        try { a.pause(); a.src = ''; } catch {}
      }
      activeAudios.clear();
      for (const id of timers) clearTimeout(id);
      timers.clear();
      for (const id of intervals) clearInterval(id);
      intervals.clear();
      document.removeEventListener('dblclick', onDocDblClick, true);
      document.removeEventListener('click', onDocClick, true);
      restoreDockSpinosaurus();
      restoreWatermarkMaodie();
      document.querySelectorAll('.' + OVERLAY_CLASS + ', #' + TOAST_ID + ', .gk-egg-code-stamp').forEach((n) => n.remove());
      document.getElementById('gemineko-dock-minibar')?.classList.remove('gk-egg-rave-mode');
      try { audioCtx?.close?.(); } catch {}
      audioCtx = null;
      window.__GEMINEKO_EGG_API__ = null;
    }

    document.addEventListener('dblclick', onDocDblClick, true);
    document.addEventListener('click', onDocClick, true);

    const api = {
      applyConfig,
      triggerById,
      triggerSupremeParade,
      onHomeEmblemTap,
      onHomeStageActorClick,
      onOutlineDragY,
      onInlineMemeClick,
      isAllowed,
      playSound: playEggSfx,
      unlockEgg,
      unmount,
    };
    window.__GEMINEKO_EGG_API__ = api;
    return api;
  }
  `;
}
