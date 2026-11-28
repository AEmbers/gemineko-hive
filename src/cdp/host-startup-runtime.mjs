/**
 * @file Gemineko Hive v0.9.0 剧场级 60fps「星钻 × 五哈基米」反重力启动动画引擎。
 * 特性：
 * 1. 零外部依赖注入主窗口 DOM，支持 Canvas 2D 反重力星尘光丝 + 1024px 棱镜星钻 + 5 角色真动态 APNG 星轨；
 * 2. 自动接力 0ms app.asar 预热幕布 (#gemineko-0ms-splash)，消除双段闪烁；
 * 3. 智能双轨无缝收尾：首页飞入融合到 #gemineko-home-emblem，对话页化作反重力棱镜光浪向上浮散；
 * 4. 严格遵守 cfg.enabled / cfg.focusMode / cfg.motionLevel / cfg.startup / easterEggs.soundEnabled。
 */

import { ROLE_PALETTES } from '../theme/host-theme-config.mjs';

/**
 * 构建主窗口 CDP 可直接执行的启动动画引擎片段（定义 initHostStartupEngine）。
 * @returns {string}
 */
export function buildHostStartupRuntimeSnippet() {
  const palettesJson = JSON.stringify(
    Object.fromEntries(
      Object.entries(ROLE_PALETTES).map(([k, v]) => [
        k,
        {
          primary: v.primary,
          accent2: v.accent2,
          accent3: v.accent3,
          sparkColor: v.sparkColor,
          glow: v.glow,
        },
      ]),
    ),
  );

  return `
  function initHostStartupEngine(ctx) {
    const STAGE_ID = 'gemineko-startup-stage';
    const STYLE_ID = 'gemineko-startup-style';
    const SESSION_KEY = '__gemineko_startup_played_v1__';
    const ZERO_MS_ID = 'gemineko-0ms-splash';
    const STARTUP_PALETTES = ${palettesJson};

    const ROSTER = [
      { id: 'neon', label: 'Neon', file: 'neon-thinking.png', x: -214, y: 14, rot: -6 },
      { id: 'hydrogen', label: 'Hydrogen', file: 'hydrogen-idle.png', x: -110, y: 42, rot: -3 },
      { id: 'carbon', label: 'Carbon', file: 'carbon-thinking.png', x: 0, y: 54, rot: 0 },
      { id: 'claude', label: 'Claude', file: 'claude-thinking.png', x: 110, y: 42, rot: 3 },
      { id: 'gpt', label: 'GPT', file: 'gpt-idle.png', x: 214, y: 14, rot: 6 },
    ];

    let cfg = ctx?.initialConfig || {};
    let activeRun = null;
    let unmounted = false;

    function isDarkScheme() {
      const attr = document.documentElement?.getAttribute('data-gk-scheme');
      if (attr === 'dark') return true;
      if (attr === 'light') return false;
      const cs = document.documentElement?.style?.colorScheme || '';
      if (/dark/i.test(cs)) return true;
      if (/light/i.test(cs)) return false;
      return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function resolveSpriteQ() {
      const q = String(cfg?.spriteQuality || '1024');
      return q === '384' || q === '512' || q === '1024' ? q : '1024';
    }

    function resolvePalette() {
      const accent = cfg?.accentMode;
      const roleKey = accent && STARTUP_PALETTES[accent] ? accent : 'neon';
      return STARTUP_PALETTES[roleKey] || STARTUP_PALETTES.neon;
    }

    function shouldAutoPlay() {
      if (unmounted) return false;
      if (cfg?.enabled === false) return false;
      if (cfg?.focusMode === true) return false;
      if (cfg?.motionLevel === 'off') return false;
      if (cfg?.startup?.enabled === false) return false;
      try {
        if (sessionStorage.getItem(SESSION_KEY) === '1') return false;
      } catch {}
      return true;
    }

    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const st = document.createElement('style');
      st.id = STYLE_ID;
      st.textContent = \`
#\${STAGE_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  pointer-events: auto;
  opacity: 0;
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
  --gk-st-c1: #3B82F6;
  --gk-st-c2: #EC4899;
  --gk-st-c3: #22D3EE;
}
#\${STAGE_ID}.is-visible {
  opacity: 1;
}
#\${STAGE_ID} .gk-st-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(62% 58% at 50% 42%, rgba(255, 255, 255, 0.96), rgba(244, 247, 255, 0.93) 56%, rgba(235, 241, 255, 0.96) 100%),
    linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(236, 72, 153, 0.12), rgba(34, 211, 238, 0.14));
  backdrop-filter: blur(18px) saturate(135%);
  transition: opacity 480ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
#\${STAGE_ID}.is-dark .gk-st-backdrop {
  background:
    radial-gradient(64% 60% at 50% 42%, rgba(24, 29, 54, 0.94), rgba(11, 14, 28, 0.97) 58%, rgba(6, 8, 18, 0.99) 100%),
    linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(168, 85, 247, 0.16), rgba(34, 211, 238, 0.14));
}
#\${STAGE_ID} .gk-st-aurora {
  position: absolute;
  inset: -18%;
  pointer-events: none;
  background:
    radial-gradient(circle at 38% 36%, var(--gk-st-c1), transparent 46%),
    radial-gradient(circle at 64% 40%, var(--gk-st-c2), transparent 44%),
    radial-gradient(circle at 50% 66%, var(--gk-st-c3), transparent 48%);
  opacity: 0.18;
  filter: blur(54px);
  transform: scale(0.92);
  transition: opacity 420ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
}
#\${STAGE_ID}.is-dark .gk-st-aurora {
  opacity: 0.28;
}
#\${STAGE_ID}.is-bloom .gk-st-aurora {
  transform: scale(1.06);
}
#\${STAGE_ID} .gk-st-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: opacity 380ms ease;
}
#\${STAGE_ID} .gk-st-center {
  position: relative;
  width: min(680px, 94vw);
  height: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
#\${STAGE_ID} .gk-st-gem-wrap {
  position: relative;
  width: 184px;
  height: 184px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate3d(0, 12px, 0) scale(0.24) rotate(-14deg);
  opacity: 0;
  will-change: transform, opacity;
  transition:
    transform 680ms cubic-bezier(0.18, 1.12, 0.32, 1),
    opacity 360ms ease;
}
#\${STAGE_ID}.is-bloom .gk-st-gem-wrap {
  transform: translate3d(0, -34px, 0) scale(1) rotate(0deg);
  opacity: 1;
}
#\${STAGE_ID} .gk-st-ring {
  position: absolute;
  inset: -18px;
  border-radius: 50%;
  border: 1.5px solid rgba(99, 102, 241, 0.38);
  box-shadow: 0 0 28px rgba(59, 130, 246, 0.32), inset 0 0 18px rgba(236, 72, 153, 0.22);
  opacity: 0;
  transform: scale(0.55);
  transition: transform 950ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms ease;
}
#\${STAGE_ID}.is-bloom .gk-st-ring-a {
  opacity: 0.72;
  transform: scale(1.22);
}
#\${STAGE_ID}.is-bloom .gk-st-ring-b {
  opacity: 0.45;
  transform: scale(1.56);
  transition-delay: 110ms;
}
#\${STAGE_ID} .gk-st-flare {
  position: absolute;
  width: 340px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--gk-st-c3), #ffffff, var(--gk-st-c2), transparent);
  opacity: 0;
  transform: scaleX(0.15);
  filter: blur(0.6px);
  transition: transform 720ms cubic-bezier(0.22, 1, 0.36, 1) 140ms, opacity 420ms ease 140ms;
}
#\${STAGE_ID}.is-bloom .gk-st-flare {
  opacity: 0.92;
  transform: scaleX(1.08);
}
#\${STAGE_ID} .gk-st-gem-img {
  position: relative;
  width: 168px;
  height: 168px;
  object-fit: contain;
  filter: drop-shadow(0 16px 38px rgba(59, 130, 246, 0.42)) drop-shadow(0 0 22px rgba(236, 72, 153, 0.36));
  animation: gkStartupFloat 2.8s ease-in-out infinite;
}
#\${STAGE_ID} .gk-st-roster {
  position: relative;
  width: 540px;
  max-width: 92vw;
  height: 118px;
  margin-top: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 320ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
#\${STAGE_ID} .gk-st-cat {
  position: absolute;
  left: 50%;
  top: 12px;
  width: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  opacity: 0;
  transform: translate3d(calc(-50% + var(--cat-x, 0px)), calc(var(--cat-y, 0px) + 34px), 0) scale(0.55) rotate(var(--cat-rot, 0deg));
  transition:
    transform 560ms cubic-bezier(0.2, 1.18, 0.34, 1),
    opacity 320ms ease;
}
#\${STAGE_ID}.is-roster .gk-st-cat {
  opacity: 1;
  transform: translate3d(calc(-50% + var(--cat-x, 0px)), var(--cat-y, 0px), 0) scale(1) rotate(0deg);
}
#\${STAGE_ID} .gk-st-cat-halo {
  position: absolute;
  top: 12px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--cat-color, #3B82F6);
  opacity: 0.24;
  filter: blur(12px);
}
#\${STAGE_ID} .gk-st-cat img {
  position: relative;
  width: 72px;
  height: 72px;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(15, 23, 42, 0.26));
}
#\${STAGE_ID} .gk-st-cat-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 1px 7px;
  border-radius: 999px;
  color: #1E293B;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(99, 102, 241, 0.24);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}
#\${STAGE_ID}.is-dark .gk-st-cat-name {
  color: #F8FAFC;
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(165, 180, 252, 0.28);
}
#\${STAGE_ID} .gk-st-titles {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translate3d(0, 18px, 0);
  transition: opacity 420ms ease, transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}
#\${STAGE_ID}.is-titles .gk-st-titles {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
#\${STAGE_ID} .gk-st-brand {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: clamp(19px, 2.5vw, 25px);
  font-weight: 800;
  letter-spacing: 0.14em;
  background: linear-gradient(105deg, var(--gk-st-c1), var(--gk-st-c2), var(--gk-st-c3), var(--gk-st-c1));
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gkStartupShimmer 2.4s linear infinite;
}
#\${STAGE_ID} .gk-st-sub {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(30, 41, 59, 0.84);
}
#\${STAGE_ID}.is-dark .gk-st-sub {
  color: rgba(226, 232, 240, 0.88);
}
#\${STAGE_ID} .gk-st-skip-hint {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  padding: 4px 12px;
  border-radius: 999px;
  color: rgba(51, 65, 85, 0.72);
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(8px);
  transition: opacity 240ms ease;
}
#\${STAGE_ID}.is-dark .gk-st-skip-hint {
  color: rgba(203, 213, 225, 0.78);
  background: rgba(15, 23, 42, 0.52);
  border-color: rgba(148, 163, 184, 0.22);
}
#\${STAGE_ID}.is-docking .gk-st-backdrop,
#\${STAGE_ID}.is-docking .gk-st-aurora,
#\${STAGE_ID}.is-docking .gk-st-canvas,
#\${STAGE_ID}.is-docking .gk-st-roster,
#\${STAGE_ID}.is-docking .gk-st-titles,
#\${STAGE_ID}.is-docking .gk-st-skip-hint {
  opacity: 0 !important;
}
#\${STAGE_ID}.is-docking .gk-st-roster {
  transform: translate3d(0, -18px, 0) scale(1.06);
}
#\${STAGE_ID}.is-wave-out .gk-st-backdrop {
  opacity: 0;
  transform: translate3d(0, -28px, 0) scale(1.04);
}
#\${STAGE_ID}.is-wave-out .gk-st-center,
#\${STAGE_ID}.is-wave-out .gk-st-canvas,
#\${STAGE_ID}.is-wave-out .gk-st-aurora,
#\${STAGE_ID}.is-wave-out .gk-st-skip-hint {
  opacity: 0;
  transform: translate3d(0, -44px, 0) scale(1.03);
  transition: opacity 420ms ease, transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}
#\${STAGE_ID} .gk-st-wave-band {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -140px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, var(--gk-st-c1), var(--gk-st-c2), var(--gk-st-c3), transparent);
  opacity: 0;
  filter: blur(28px);
  pointer-events: none;
}
#\${STAGE_ID}.is-wave-out .gk-st-wave-band {
  opacity: 0.42;
  transform: translate3d(0, -110vh, 0) scaleY(1.4);
  transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease;
}
#\${STAGE_ID}.is-skipped {
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity 220ms ease !important;
}
@keyframes gkStartupFloat {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -5px, 0); }
}
@keyframes gkStartupShimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 220% 50%; }
}
\`;
      document.head?.appendChild(st);
    }

    function playSynthStartupChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        const ac = new AudioCtx();
        const now = ac.currentTime;
        const notes = [587.33, 739.99, 880.0, 1108.73, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.085);
          gain.gain.setValueAtTime(0.0001, now + idx * 0.085);
          gain.gain.exponentialRampToValueAtTime(0.055, now + idx * 0.085 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.085 + 1.1);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(now + idx * 0.085);
          osc.stop(now + idx * 0.085 + 1.15);
        });
        return ac;
      } catch {
        return null;
      }
    }

    function handoffZeroMsSplash() {
      try {
        const api = window.__GEMINEKO_0MS_SPLASH__;
        if (api && typeof api.handoff === 'function') {
          const info = api.handoff();
          if (info && Number.isFinite(info.elapsedMs)) return info;
        }
        const el = document.getElementById(ZERO_MS_ID);
        if (el) {
          el.style.transition = 'opacity 220ms ease';
          el.style.opacity = '0';
          setTimeout(() => { try { el.remove(); } catch {} }, 240);
          return { hadSplash: true, elapsedMs: 260 };
        }
      } catch {}
      return { hadSplash: false, elapsedMs: 0 };
    }

    function fadeOutAudio(audio, ms = 180) {
      if (!audio) return;
      try {
        const startVol = Number(audio.volume || 0.85);
        const startAt = performance.now();
        const step = () => {
          const p = Math.min(1, (performance.now() - startAt) / Math.max(40, ms));
          try {
            audio.volume = Math.max(0, startVol * (1 - p));
          } catch {}
          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            try { audio.pause(); audio.src = ''; } catch {}
          }
        };
        requestAnimationFrame(step);
      } catch {
        try { audio.pause(); } catch {}
      }
    }

    function startParticleCanvas(canvas, palette, dark, isClosingRef) {
      if (!canvas) return () => {};
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return () => {};
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = window.innerWidth || 1280;
      let h = window.innerHeight || 720;

      const resize = () => {
        w = window.innerWidth || 1280;
        h = window.innerHeight || 720;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);

      const colors = [palette.primary, palette.accent2, palette.accent3, dark ? '#E0E7FF' : '#818CF8'];
      const particles = Array.from({ length: 68 }, (_, i) => ({
        x: Math.random() * w,
        y: h * (0.2 + Math.random() * 0.9),
        vy: -(0.75 + Math.random() * 1.9),
        vx: (Math.random() - 0.5) * 0.45,
        r: 1.2 + Math.random() * 2.5,
        star: i % 6 === 0,
        phase: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
        alpha: 0.35 + Math.random() * 0.55,
      }));

      let rafId = 0;
      const startTs = performance.now();
      const tick = (now) => {
        const dt = (now - startTs) * 0.001;
        ctx2d.clearRect(0, 0, w, h);
        const cx = w * 0.5;
        const cy = h * 0.44;
        const boost = isClosingRef.current ? 2.4 : 1.0;

        ctx2d.save();
        ctx2d.lineWidth = 1.25;
        for (let s = 0; s < 5; s++) {
          const baseAng = (s / 5) * Math.PI * 2 + dt * 0.72;
          const rad = 74 + Math.sin(dt * 2.2 + s) * 16 + (dt < 0.7 ? (0.7 - dt) * 110 : 0);
          ctx2d.beginPath();
          ctx2d.strokeStyle = colors[s % colors.length];
          ctx2d.globalAlpha = dark ? 0.24 : 0.19;
          ctx2d.arc(cx, cy, rad, baseAng, baseAng + 0.85);
          ctx2d.stroke();
        }
        ctx2d.restore();

        for (const p of particles) {
          p.y += p.vy * boost;
          p.x += p.vx + Math.sin(dt * 2.0 + p.phase) * 0.25;
          if (p.y < -20) {
            p.y = h + 14;
            p.x = Math.random() * w;
          }
          const twinkle = 0.65 + 0.35 * Math.sin(dt * 4.5 + p.phase);
          ctx2d.save();
          ctx2d.globalAlpha = p.alpha * twinkle;
          ctx2d.fillStyle = p.color;
          if (p.star) {
            const sr = p.r * 2.1;
            ctx2d.translate(p.x, p.y);
            ctx2d.beginPath();
            ctx2d.moveTo(0, -sr);
            ctx2d.quadraticCurveTo(0, 0, sr, 0);
            ctx2d.quadraticCurveTo(0, 0, 0, sr);
            ctx2d.quadraticCurveTo(0, 0, -sr, 0);
            ctx2d.quadraticCurveTo(0, 0, 0, -sr);
            ctx2d.fill();
          } else {
            ctx2d.beginPath();
            ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx2d.fill();
          }
          ctx2d.restore();
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
      };
    }

    function stopActiveRun(immediate = false) {
      if (!activeRun) return;
      const run = activeRun;
      activeRun = null;
      run.stopped = true;
      for (const tid of run.timers) clearTimeout(tid);
      run.timers.length = 0;
      run.stopCanvas?.();
      window.removeEventListener('keydown', run.onKeyDown, true);
      if (run.hiddenHomeEl) {
        try { run.hiddenHomeEl.style.visibility = ''; } catch {}
        run.hiddenHomeEl = null;
      }
      if (immediate) {
        try { run.chimeAudio?.pause(); } catch {}
        try { run.voiceAudio?.pause(); } catch {}
        try { run.synthCtx?.close?.(); } catch {}
        try { run.stage?.remove(); } catch {}
      } else {
        fadeOutAudio(run.chimeAudio, 180);
        fadeOutAudio(run.voiceAudio, 180);
        if (run.stage) {
          run.stage.classList.add('is-skipped');
          setTimeout(() => { try { run.stage.remove(); } catch {} }, 240);
        }
      }
    }

    function play(opts = {}) {
      if (unmounted) return false;
      const manual = Boolean(opts?.manual);
      if (!manual && !shouldAutoPlay()) return false;

      if (activeRun) {
        stopActiveRun(true);
      }

      if (!manual) {
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
      }

      ensureStyle();
      const dark = isDarkScheme();
      const palette = resolvePalette();
      const spriteQ = resolveSpriteQ();
      const isEnglish = cfg?.i18n?.mode === 'off';
      const zeroInfo = handoffZeroMsSplash();

      const stage = document.createElement('div');
      stage.id = STAGE_ID;
      if (dark) stage.classList.add('is-dark');
      stage.style.setProperty('--gk-st-c1', palette.primary);
      stage.style.setProperty('--gk-st-c2', palette.accent2);
      stage.style.setProperty('--gk-st-c3', palette.accent3);

      const gemFile = dark ? 'home-star-gem-dark.png' : 'home-star-gem-light.png';
      const gemSrc = \`\${ctx.server}/gemineko-sprites/\${gemFile}?q=1024\`;
      const rosterHtml = ROSTER.map((m, idx) => {
        const pal = STARTUP_PALETTES[m.id] || palette;
        const spr = \`\${ctx.server}/gemineko-sprites/\${m.file}?q=\${spriteQ}\`;
        return \`
          <div class="gk-st-cat" style="--cat-x:\${m.x}px;--cat-y:\${m.y}px;--cat-rot:\${m.rot}deg;--cat-color:\${pal.primary};transition-delay:\${idx * 75}ms;">
            <span class="gk-st-cat-halo"></span>
            <img src="\${spr}" alt="\${m.label}" decoding="async" />
            <span class="gk-st-cat-name">\${m.label}</span>
          </div>
        \`;
      }).join('');

      const subText = isEnglish
        ? 'Welcome Home · Antigravity Prism Core Online ✦'
        : '欢迎回窝 · 反重力星钻已就绪喵 ✦';
      const skipText = isEnglish ? 'Click anywhere or press Esc to skip' : '点击任意位置或按 Esc 跳过';

      stage.innerHTML = \`
        <div class="gk-st-backdrop"></div>
        <div class="gk-st-aurora"></div>
        <canvas class="gk-st-canvas"></canvas>
        <div class="gk-st-wave-band"></div>
        <div class="gk-st-center">
          <div class="gk-st-gem-wrap">
            <span class="gk-st-ring gk-st-ring-a"></span>
            <span class="gk-st-ring gk-st-ring-b"></span>
            <span class="gk-st-flare"></span>
            <img class="gk-st-gem-img" src="\${gemSrc}" alt="Gemineko Star Gem" decoding="async" />
          </div>
          <div class="gk-st-roster">\${rosterHtml}</div>
          <div class="gk-st-titles">
            <div class="gk-st-brand">ANTIGRAVITY × GEMINEKO HIVE</div>
            <div class="gk-st-sub">\${subText}</div>
          </div>
        </div>
        <div class="gk-st-skip-hint">\${skipText}</div>
      \`;

      (document.body || document.documentElement)?.appendChild(stage);

      const isClosingRef = { current: false };
      const canvas = stage.querySelector('.gk-st-canvas');
      const stopCanvas = startParticleCanvas(canvas, palette, dark, isClosingRef);
      const timers = [];
      const addTimer = (fn, ms) => {
        const id = setTimeout(() => {
          if (!run.stopped) fn();
        }, ms);
        timers.push(id);
        return id;
      };

      const run = {
        stage,
        timers,
        stopCanvas,
        stopped: false,
        chimeAudio: null,
        voiceAudio: null,
        synthCtx: null,
        hiddenHomeEl: null,
        onKeyDown: (e) => {
          if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            stopActiveRun(false);
          }
        },
      };
      activeRun = run;

      stage.addEventListener('pointerdown', () => {
        stopActiveRun(false);
      });
      window.addEventListener('keydown', run.onKeyDown, true);

      const headOffset = zeroInfo.hadSplash ? 160 : 0;
      const tBloom = Math.max(20, 40 - Math.min(20, headOffset * 0.1));
      const tRoster = Math.max(360, 560 - headOffset);
      const tTitles = Math.max(520, 740 - headOffset);
      const tDock = Math.max(1580, 1880 - headOffset);
      const tCleanup = tDock + 740;

      requestAnimationFrame(() => {
        if (run.stopped) return;
        stage.classList.add('is-visible');
      });

      addTimer(() => stage.classList.add('is-bloom'), tBloom);
      addTimer(() => stage.classList.add('is-roster'), tRoster);
      addTimer(() => stage.classList.add('is-titles'), tTitles);

      const masterSound = cfg?.easterEggs?.soundEnabled !== false;
      const playChime = masterSound && cfg?.startup?.soundEnabled !== false;
      const playVoice = masterSound && cfg?.startup?.voiceEnabled !== false;

      if (playChime && ctx?.server) {
        addTimer(() => {
          try {
            const a = new Audio(\`\${ctx.server}/gemineko-audio/startup-chime.mp3\`);
            a.volume = 0.72;
            run.chimeAudio = a;
            a.play().catch(() => {
              run.synthCtx = playSynthStartupChime();
            });
          } catch {
            run.synthCtx = playSynthStartupChime();
          }
        }, 35);
      }

      if (playVoice && ctx?.server) {
        addTimer(() => {
          try {
            const v = new Audio(\`\${ctx.server}/gemineko-audio/startup-welcome.mp3\`);
            v.volume = 0.9;
            run.voiceAudio = v;
            v.play().catch(() => {});
          } catch {}
        }, Math.max(460, tTitles - 40));
      }

      addTimer(() => {
        isClosingRef.current = true;
        const gemWrap = stage.querySelector('.gk-st-gem-wrap');
        const targetEmblem = document.getElementById('gemineko-home-emblem');
        const targetStage = targetEmblem?.querySelector('.gk-he-stage') || targetEmblem;
        const targetRect = targetStage && typeof targetStage.getBoundingClientRect === 'function'
          ? targetStage.getBoundingClientRect()
          : null;
        const isHomeTargetVisible = Boolean(
          targetRect &&
          targetRect.width > 36 &&
          targetRect.height > 36 &&
          targetRect.top >= -40 &&
          targetRect.bottom <= (window.innerHeight || 1000) + 40
        );

        if (isHomeTargetVisible && gemWrap && targetEmblem) {
          const srcRect = gemWrap.getBoundingClientRect();
          const srcCx = srcRect.left + srcRect.width / 2;
          const srcCy = srcRect.top + srcRect.height / 2;
          const dstCx = targetRect.left + targetRect.width / 2;
          const dstCy = targetRect.top + targetRect.height / 2;
          const dx = Math.round(dstCx - srcCx);
          const dy = Math.round(dstCy - srcCy);
          const scale = Number((targetRect.width / Math.max(80, srcRect.width)).toFixed(3));

          run.hiddenHomeEl = targetEmblem;
          targetEmblem.style.visibility = 'hidden';
          stage.classList.add('is-docking');

          gemWrap.style.transition = 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease 460ms';
          gemWrap.style.transform = \`translate3d(\${dx}px, calc(-34px + \${dy}px), 0) scale(\${scale})\`;
          gemWrap.style.opacity = '0.96';

          addTimer(() => {
            if (run.hiddenHomeEl) {
              run.hiddenHomeEl.style.visibility = '';
              run.hiddenHomeEl = null;
            }
            targetEmblem.classList.add('is-sparkling');
            ctx.spawnStardust?.(dstCx, dstCy, 22, 'spark');
            setTimeout(() => { try { targetEmblem.classList.remove('is-sparkling'); } catch {} }, 640);
          }, 560);
        } else {
          stage.classList.add('is-wave-out');
        }
      }, tDock);

      addTimer(() => {
        if (activeRun !== run) return;
        activeRun = null;
        run.stopped = true;
        run.stopCanvas?.();
        window.removeEventListener('keydown', run.onKeyDown, true);
        if (run.hiddenHomeEl) {
          try { run.hiddenHomeEl.style.visibility = ''; } catch {}
          run.hiddenHomeEl = null;
        }
        try { stage.remove(); } catch {}
      }, tCleanup);

      return true;
    }

    function applyConfig(nextCfg) {
      if (nextCfg && typeof nextCfg === 'object') {
        cfg = nextCfg;
      }
    }

    function replay(opts = {}) {
      return play({ ...opts, manual: true });
    }

    function maybeAutoPlay() {
      return play({ manual: false });
    }

    function unmount() {
      unmounted = true;
      stopActiveRun(true);
      const st = document.getElementById(STYLE_ID);
      if (st) st.remove();
      try {
        if (window.__GEMINEKO_REPLAY_STARTUP__) delete window.__GEMINEKO_REPLAY_STARTUP__;
      } catch {}
    }

    window.__GEMINEKO_REPLAY_STARTUP__ = replay;

    return {
      applyConfig,
      maybeAutoPlay,
      replay,
      unmount,
    };
  }
  `;
}
