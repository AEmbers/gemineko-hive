/**
 * @file Gemineko Hive 侧边栏「高定光学主题商店 × 精细主题工坊」前端控制器。
 * 在打包阶段通过 build-bundle.mjs 内联至 dist/gemineko-hive.js。
 */

function escWorkshopHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 初始化侧边栏双 Tab 主题商店/工坊控制器。
 * @param {{ hostApi: Function, sidecarBanner: (text: string) => void, onThemeConfigChange?: (cfg: any) => void }} deps
 */
export function createThemeWorkshopController(deps) {
  const state = {
    open: false,
    tab: 'store',
    config: null,
    presets: {},
    rolePalettes: {},
    eggCatalog: [],
    crystalStory: null,
    brand: null,
    registry: [],
    registrySource: 'bundled',
    github: null,
    startupAsar: null,
    startupCmdHint: '',
    lastEventSeq: 0,
    loading: false,
    warning: '',
    exportedPack: null,
    alchemy: null,
    hostAsar: null,
    hostAsarCmdHint: '',
  };

  const TYPO_STORAGE_KEY = 'gemineko_typography_v1';
  const SPRITE_Q_KEY = 'gemineko_sprite_quality_v1';
  const DOCK_STORAGE_KEY = 'gemineko_dock_prefs_v1';

  function normDockPrefs(val, base) {
    const d = val && typeof val === 'object' ? val : {};
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

  function readLocalDock() {
    try {
      const raw = localStorage.getItem(DOCK_STORAGE_KEY);
      if (!raw) return null;
      return normDockPrefs(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  function writeLocalDock(dock) {
    if (!dock || typeof dock !== 'object') return null;
    const clean = normDockPrefs(dock, readLocalDock());
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

  function readLocalTypo() {
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

  function writeLocalTypo(typo) {
    if (!typo || typeof typo !== 'object') return null;
    const clean = {
      sidecarFontSize: Math.max(11, Math.min(22, Math.round(Number(typo.sidecarFontSize) || 14))),
      hostFontScale: Math.max(85, Math.min(135, Math.round(Number(typo.hostFontScale) || 100))),
    };
    try { localStorage.setItem(TYPO_STORAGE_KEY, JSON.stringify(clean)); } catch {}
    return clean;
  }

  function withLocalTypo(cfg, fallbackTypo, fallbackSpriteQ, fallbackDock) {
    if (!cfg || typeof cfg !== 'object') return cfg;
    const out = { ...cfg };
    if (out.typography && typeof out.typography === 'object') {
      writeLocalTypo(out.typography);
    } else {
      out.typography = fallbackTypo || readLocalTypo() || { sidecarFontSize: 14, hostFontScale: 100 };
    }
    if (out.dock && typeof out.dock === 'object') {
      out.dock = writeLocalDock(out.dock);
    } else {
      out.dock = normDockPrefs(fallbackDock || readLocalDock());
    }
    const cfgQ = normalizeSpriteQ(out.spriteQuality);
    if (cfgQ) {
      writeLocalSpriteQ(cfgQ);
      out.spriteQuality = cfgQ;
    } else {
      out.spriteQuality = normalizeSpriteQ(fallbackSpriteQ) || readLocalSpriteQ() || '1024';
    }
    return out;
  }

  function notifyHostTheme(cfg, hostScheme) {
    if (cfg && typeof deps.onThemeConfigChange === 'function') {
      deps.onThemeConfigChange(cfg, hostScheme);
    }
  }

  function getRoot() {
    let el = document.getElementById('gn-theme-workshop');
    if (el) return el;
    el = document.createElement('section');
    el.id = 'gn-theme-workshop';
    el.className = 'gn-workshop-drawer hidden';
    const sidecarShell = document.getElementById('gemineko-sidecar-shell');
    if (sidecarShell) {
      sidecarShell.appendChild(el);
      return el;
    }
    const hdr = document.querySelector('#board > header.header') || document.body.firstChild;
    if (hdr && hdr.parentElement) {
      hdr.parentElement.insertBefore(el, hdr.nextSibling);
    } else {
      document.body.prepend(el);
    }
    return el;
  }

  function showWorkshopToast(msg, isWarn = false) {
    state.warning = msg || '';
    const el = getRoot().querySelector('.gn-ws-status');
    if (el) {
      el.textContent = msg || '';
      el.classList.toggle('is-warn', Boolean(isWarn));
    }
  }

  async function openExternal(url) {
    const safeUrl = String(url || state.brand?.repoUrl || 'https://github.com/AEmbers/gemineko-hive');
    try {
      const res = await deps.hostApi('/api/open-external', {
        method: 'POST',
        body: JSON.stringify({ url: safeUrl }),
      });
      if (res?.ok) return true;
    } catch {
      /* fallback */
    }
    try { window.open(safeUrl, '_blank', 'noopener,noreferrer'); } catch {}
    return false;
  }

  async function loadConfig(forceRefresh = false) {
    if (state.loading) return;
    state.loading = true;
    try {
      const suffix = forceRefresh ? '?refresh=1' : '';
      const [cfgRes, regRes, ghRes, hostAsarRes, startupAsarRes] = await Promise.all([
        deps.hostApi('/api/theme/config'),
        deps.hostApi(`/api/store/registry${suffix}`),
        deps.hostApi(`/api/github/status${suffix}`),
        deps.hostApi('/api/host-asar/status').catch(() => null),
        deps.hostApi('/api/startup-asar/status').catch(() => null),
      ]);
      if (cfgRes?.ok) {
        state.config = withLocalTypo(cfgRes.config);
        state.presets = cfgRes.presets || {};
        state.rolePalettes = cfgRes.rolePalettes || {};
        if (Array.isArray(cfgRes.eggCatalog)) state.eggCatalog = cfgRes.eggCatalog;
        if (cfgRes.crystalStory) state.crystalStory = cfgRes.crystalStory;
        if (cfgRes.brand) state.brand = cfgRes.brand;
        notifyHostTheme(state.config, cfgRes.hostScheme);
      }
      if (regRes?.ok) {
        state.registry = Array.isArray(regRes.registry) ? regRes.registry : [];
        state.registrySource = regRes.source || 'bundled';
        if (regRes.brand) state.brand = regRes.brand;
      }
      if (ghRes?.ok) {
        state.github = ghRes;
      }
      if (hostAsarRes?.ok) {
        state.hostAsar = hostAsarRes;
      }
      if (startupAsarRes?.ok) {
        state.startupAsar = startupAsarRes;
      }
      render();
    } catch {
      /* ignore */
    } finally {
      state.loading = false;
    }
  }

  async function savePatch(patch) {
    let optimisticTypo = null;
    let optimisticQ = '';
    let optimisticDock = null;
    if (patch?.typography && typeof patch.typography === 'object') {
      optimisticTypo = writeLocalTypo({ ...(state.config?.typography || readLocalTypo() || { sidecarFontSize: 14, hostFontScale: 100 }), ...patch.typography });
      if (state.config && optimisticTypo) {
        state.config = { ...state.config, typography: optimisticTypo };
        notifyHostTheme(state.config);
      }
    }
    if (patch?.dock && typeof patch.dock === 'object') {
      optimisticDock = writeLocalDock({ ...(state.config?.dock || readLocalDock()), ...patch.dock });
      if (state.config && optimisticDock) {
        state.config = { ...state.config, dock: optimisticDock };
        notifyHostTheme(state.config);
      }
    }
    if (patch?.spriteQuality) {
      optimisticQ = writeLocalSpriteQ(patch.spriteQuality);
      if (state.config && optimisticQ) {
        state.config = { ...state.config, spriteQuality: optimisticQ };
        notifyHostTheme(state.config);
        render();
      }
    }
    try {
      const data = await deps.hostApi('/api/theme/config', {
        method: 'POST',
        body: JSON.stringify(patch),
      });
      if (data?.ok && data.config) {
        state.config = withLocalTypo(data.config, optimisticTypo, optimisticQ, optimisticDock);
        notifyHostTheme(state.config);
        render();
        showWorkshopToast(data.warning ? `已保存，壁纸提示：${data.warning}` : '✨ 已即时同步到主窗口与基米窝', Boolean(data.warning));
      }
    } catch (err) {
      showWorkshopToast(`同步失败: ${err?.message || err}`, true);
    }
  }

  async function resetConfig() {
    try { localStorage.removeItem(TYPO_STORAGE_KEY); localStorage.removeItem(SPRITE_Q_KEY); localStorage.removeItem(DOCK_STORAGE_KEY); } catch {}
    try {
      const data = await deps.hostApi('/api/theme/reset', { method: 'POST', body: '{}' });
      if (data?.ok && data.config) {
        state.config = {
          ...data.config,
          typography: data.config.typography || { sidecarFontSize: 14, hostFontScale: 100 },
          dock: normDockPrefs(data.config.dock),
          spriteQuality: normalizeSpriteQ(data.config.spriteQuality) || '512',
        };
        notifyHostTheme(state.config);
        render();
        showWorkshopToast('已恢复默认《基米窝》官方旗舰配置');
      }
    } catch {}
  }

  async function activatePack(packId) {
    try {
      const data = await deps.hostApi('/api/store/activate', {
        method: 'POST',
        body: JSON.stringify({ packId, syncBasePreset: true }),
      });
      if (data?.ok && data.config) {
        state.config = data.config;
        notifyHostTheme(state.config);
        await loadConfig();
        showWorkshopToast(`✨ 已应用主题「${data.config.activeThemePack?.name || '基米窝官方旗舰'}」`);
      } else {
        showWorkshopToast(data?.error || '启用主题失败', true);
      }
    } catch (err) {
      showWorkshopToast(`启用失败: ${err?.message || err}`, true);
    }
  }

  async function installAndActivate(payload) {
    showWorkshopToast('正在校验并安装社区主题包...');
    try {
      const data = await deps.hostApi('/api/store/install', {
        method: 'POST',
        body: JSON.stringify({ ...payload, activate: true }),
      });
      if (data?.ok) {
        state.config = data.config || state.config;
        notifyHostTheme(state.config);
        await loadConfig();
        const warnTxt = data.warnings?.length ? `（已安全清洗 ${data.warnings.length} 项）` : '';
        showWorkshopToast(`🎉 已安装并启用「${data.pack?.name || data.pack?.id}」${warnTxt}`);
      } else {
        showWorkshopToast(data?.error || '安装失败', true);
      }
    } catch (err) {
      showWorkshopToast(`安装失败: ${err?.message || err}`, true);
    }
  }

  async function uninstallPack(packId) {
    try {
      const data = await deps.hostApi('/api/store/uninstall', {
        method: 'POST',
        body: JSON.stringify({ packId }),
      });
      if (data?.ok) {
        state.config = data.config || state.config;
        notifyHostTheme(state.config);
        await loadConfig();
        showWorkshopToast(`已卸载本地主题 ${packId}`);
      } else {
        showWorkshopToast(data?.error || '卸载失败', true);
      }
    } catch (err) {
      showWorkshopToast(`卸载失败: ${err?.message || err}`, true);
    }
  }

  async function exportCurrentPack(meta) {
    try {
      const data = await deps.hostApi('/api/store/export', {
        method: 'POST',
        body: JSON.stringify(meta || {}),
      });
      if (data?.ok && data.pack) {
        state.exportedPack = data;
        const jsonStr = JSON.stringify(data.pack, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = data.filename || `${data.pack.id}.gemineko-theme.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
        try { await navigator.clipboard?.writeText?.(jsonStr); } catch {}
        render();
        showWorkshopToast(`📦 已导出 ${data.filename}（JSON 已同步复制，可直接投稿 GitHub）`);
      } else {
        showWorkshopToast(data?.error || '导出失败', true);
      }
    } catch (err) {
      showWorkshopToast(`导出失败: ${err?.message || err}`, true);
    }
  }

  async function triggerSidecarEgg(type, extra = {}) {
    try {
      await deps.hostApi('/api/theme/event', {
        method: 'POST',
        body: JSON.stringify({ type, role: 'neon', source: 'sidecar', ...extra }),
      });
      deps.sidecarBanner(
        type === 'hive-poke-burst'
          ? '💥 已从基米窝发出全员集结信号，快看主窗口下方 5 只哈基米巡游！'
          : (type === 'replay-egg'
            ? '▶ 已在主对话区召唤该哈基米彩蛋重温 ✨'
            : (type === 'supreme-maodie-parade'
              ? '👑 至尊圆头耄耋星河大阅兵双端开启！'
              : '🐾 爪印星尘雨已在主对话区飘落喵~')),
      );
    } catch {}
  }

  let alchemyTimer = null;
  function clearAlchemyTimer() {
    if (alchemyTimer) {
      clearTimeout(alchemyTimer);
      alchemyTimer = null;
    }
  }
  function triggerAlchemy() {
    if (!state.config || state.config.enabled === false || state.config.focusMode === true) return;
    clearAlchemyTimer();
    const cur = state.config;
    if (!state.alchemy?.snapshot) {
      state.alchemy = {
        snapshot: {
          preset: cur.preset,
          themeIntensity: cur.themeIntensity,
          accentMode: cur.accentMode,
        },
        label: '',
      };
    }
    const presetChoices = ['nebula-day', 'cream-paper', 'starry-nest', 'carbon-obsidian'];
    const intChoices = ['optical-neko', 'vivid'];
    const roleChoices = ['neon', 'hydrogen', 'carbon', 'claude', 'gpt'];
    const pick = (arr, curVal) => {
      const alt = arr.filter((x) => x !== curVal);
      return (alt.length ? alt : arr)[Math.floor(Math.random() * (alt.length ? alt.length : arr.length))];
    };
    const nextPatch = {
      enabled: true,
      activeThemePackId: 'official-gemineko',
      preset: pick(presetChoices, cur.preset),
      themeIntensity: pick(intChoices, cur.themeIntensity),
      accentMode: pick(roleChoices, cur.accentMode),
    };
    state.alchemy.label = `${nextPatch.preset} × ${nextPatch.accentMode}`;
    state.config = { ...cur, ...nextPatch };
    notifyHostTheme(state.config);
    const root = document.getElementById('gn-theme-workshop');
    if (root) {
      root.classList.remove('gn-egg-alchemy-glow');
      void root.offsetWidth;
      root.classList.add('gn-egg-alchemy-glow');
    }
    render();
    deps.onWorkshopEggUnlock?.('workshop-alchemy', '哈基米炼丹盲盒试妆');
    alchemyTimer = setTimeout(() => {
      void revertAlchemy();
    }, 6200);
  }
  async function keepAlchemy() {
    clearAlchemyTimer();
    const cur = state.config;
    state.alchemy = null;
    if (cur) {
      await savePatch({
        enabled: true,
        activeThemePackId: 'official-gemineko',
        preset: cur.preset,
        themeIntensity: cur.themeIntensity,
        accentMode: cur.accentMode,
      });
    }
  }
  function revertAlchemy() {
    clearAlchemyTimer();
    const snap = state.alchemy?.snapshot;
    state.alchemy = null;
    if (snap && state.config) {
      state.config = { ...state.config, ...snap };
      notifyHostTheme(state.config);
    }
    render();
  }
  async function resetEggProgress() {
    try {
      const data = await deps.hostApi('/api/theme/egg/reset', { method: 'POST', body: '{}' });
      if (data?.ok && data.config) {
        state.config = withLocalTypo(data.config);
        notifyHostTheme(state.config);
        render();
        showWorkshopToast('已重置 13 枚彩蛋图鉴，重新探索吧 🥚');
      }
    } catch {}
  }

  async function pickLocalWallpaper() {
    showWorkshopToast('正在打开系统媒体选择器...');
    try {
      const res = await deps.hostApi('/api/wallpaper/pick', { method: 'POST', body: '{}' });
      if (res?.ok && !res.canceled && res.path) {
        await savePatch({ wallpaper: { ...(state.config?.wallpaper || {}), mode: 'custom', filePath: res.path } });
      } else if (res?.error) {
        showWorkshopToast(res.error, true);
      } else {
        showWorkshopToast('已取消选择文件');
      }
    } catch {
      showWorkshopToast('选择失败，请检查文件格式与权限', true);
    }
  }

  async function pickLocalWatermark() {
    showWorkshopToast('正在选择角落透明二次元立绘...');
    try {
      const res = await deps.hostApi('/api/watermark/pick', { method: 'POST', body: '{}' });
      if (res?.ok && !res.canceled && res.path) {
        await savePatch({ watermark: { ...(state.config?.watermark || {}), enabled: true, role: 'custom', customFilePath: res.path } });
      } else if (res?.error) {
        showWorkshopToast(res.error, true);
      } else {
        showWorkshopToast('已取消选择立绘');
      }
    } catch {
      showWorkshopToast('选择失败，请检查图片格式', true);
    }
  }

  function renderPreviewMini(t) {
    const sw = Array.isArray(t.swatches) && t.swatches.length ? t.swatches : ['#FFFFFF', '#6366F1', '#EC4899', '#38BDF8'];
    const isDark = t.scheme === 'dark' || t.basePreset === 'carbon-obsidian' || t.basePreset === 'starry-nest';
    const bgCanvas = escWorkshopHtml(sw[0] || (isDark ? '#0B0D14' : '#FFFFFF'));
    const c1 = escWorkshopHtml(t.accent?.primary || sw[1] || '#6366F1');
    const c2 = escWorkshopHtml(t.accent?.accent2 || sw[2] || '#EC4899');
    const c3 = escWorkshopHtml(t.accent?.accent3 || sw[3] || '#38BDF8');
    const sbBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    const cardBg = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.92)';
    const grad = escWorkshopHtml(t.accent?.gradient || `linear-gradient(90deg, ${c1}, ${c2}, ${c3})`);
    return `
      <div class="gn-store-preview" style="background:${bgCanvas};">
        <div class="gn-pv-aurora" style="background:radial-gradient(circle at 24% 92%, ${c1}55, transparent 58%), radial-gradient(circle at 78% 88%, ${c2}50, transparent 56%), radial-gradient(circle at 52% 100%, ${c3}44, transparent 62%);"></div>
        <div class="gn-pv-sidebar" style="background:${sbBg};">
          <span class="gn-pv-dot" style="background:${grad};"></span>
          <span class="gn-pv-bar" style="background:${c1}55;"></span>
          <span class="gn-pv-bar"></span>
        </div>
        <div class="gn-pv-main">
          <div class="gn-pv-gem" style="color:${c1};">✦</div>
          <div class="gn-pv-composer" style="background:${cardBg};border-top:2px solid ${c1};box-shadow:0 4px 12px ${c2}33;"></div>
        </div>
      </div>
    `;
  }

  function renderSwitchRow(label, attrsHtml, checked) {
    return `
      <label class="gn-switch-row">
        <span>${label}</span>
        <input type="checkbox" class="gn-switch" ${attrsHtml} ${checked ? 'checked' : ''} />
      </label>
    `;
  }

  function renderStoreTabHtml(c) {
    const activePackId = c.activeThemePackId || 'official-gemineko';
    const gh = state.github || {};
    const starTxt = Number.isFinite(Number(gh.stars)) ? `⭐ ${gh.stars} Star` : '⭐ 点 Star 支持';
    const verTxt = gh.hasUpdate
      ? `🚀 发现新版 v${escWorkshopHtml(gh.latestVersion)}（当前 v${escWorkshopHtml(gh.currentVersion)}）`
      : `v${escWorkshopHtml(gh.currentVersion || state.brand?.version || (typeof GEMINEKO_VERSION === 'string' ? GEMINEKO_VERSION : '0.8.4'))} · 源 ${escWorkshopHtml(state.registrySource)}`;

    const cardsHtml = state.registry.map((t) => {
      const isActive = activePackId === t.id;
      const authorName = escWorkshopHtml(t.author?.name || 'Community');
      const authorUrl = t.author?.url ? escWorkshopHtml(t.author.url) : '';
      const badgeCls = t.official ? 'is-official' : (t.inRegistry === false ? 'is-local' : '');
      const badgeLabel = t.official ? '官方' : (t.inRegistry === false ? '本地' : '社区');
      const actBtn = isActive
        ? '<button type="button" class="gn-pill is-primary" disabled>✓ 当前使用中</button>'
        : (t.installed || t.official
            ? `<button type="button" class="gn-pill is-primary" data-ws-activate="${escWorkshopHtml(t.id)}">应用主题</button>`
            : `<button type="button" class="gn-pill is-primary" data-ws-install-id="${escWorkshopHtml(t.id)}">安装启用</button>`);
      const uninstBtn = (!t.official && t.installed)
        ? `<button type="button" class="gn-pill" data-ws-uninstall="${escWorkshopHtml(t.id)}">卸载</button>`
        : '';

      return `
        <article class="gn-store-card ${isActive ? 'is-active' : ''}">
          ${renderPreviewMini(t)}
          <div class="gn-store-body">
            <div class="gn-store-head-row">
              <div class="gn-store-name">${escWorkshopHtml(t.name)}</div>
              <span class="gn-store-tag ${badgeCls}">${badgeLabel}</span>
            </div>
            <div class="gn-store-author">
              by ${authorUrl ? `<a href="#" data-ws-ext="${authorUrl}">${authorName}</a>` : authorName} · ${(t.tags || []).slice(0, 2).map((tag) => escWorkshopHtml(tag)).join(' · ')}
            </div>
            <div class="gn-store-desc">${escWorkshopHtml(t.description || '开放式社区主题包')}</div>
            <div class="gn-store-card-actions">${actBtn}${uninstBtn}</div>
          </div>
        </article>
      `;
    }).join('');

    return `
      <div class="gn-store-hero">
        <div class="gn-store-hero-meta">
          <span class="gn-store-hero-title">💎 社区主题画廊</span>
          <span class="gn-store-hero-sub">${verTxt}</span>
        </div>
        <div class="gn-store-hero-btns">
          <button type="button" class="gn-pill gn-star-pill" data-ws-ext="${escWorkshopHtml(gh.repoUrl || state.brand?.repoUrl || 'https://github.com/AEmbers/gemineko-hive')}">${starTxt}</button>
          <button type="button" class="gn-pill" data-ws-act="refresh-store">🔄 刷新</button>
          <button type="button" class="gn-pill" data-ws-ext="${escWorkshopHtml(state.brand?.submitThemeUrl || 'https://github.com/AEmbers/gemineko-hive/issues/new?template=theme-submission.yml')}">🚀 投稿</button>
        </div>
      </div>

      <div class="gn-store-grid">${cardsHtml || '<div class="gn-ws-sub">暂无主题条目</div>'}</div>

      <div class="gn-store-tools">
        <details class="gn-store-collapse">
          <summary>📥 导入第三方主题包（GitHub Raw / 本地 JSON）</summary>
          <div class="gn-store-collapse-body">
            <div class="gn-ws-row">
              <input type="text" data-ws-import-url="1" placeholder="粘贴 GitHub / Gist Raw JSON 链接 (https://...)" />
              <button type="button" class="gn-pill is-primary" data-ws-act="import-url">拉取安装</button>
            </div>
            <div class="gn-ws-row">
              <label class="gn-pill" style="cursor:pointer;">
                📂 选择本地 .gemineko-theme.json 导入
                <input type="file" accept=".json,application/json" data-ws-import-file="1" style="display:none;" />
              </label>
            </div>
          </div>
        </details>

        <details class="gn-store-collapse">
          <summary>📦 打包当前配色导出 &amp; 投稿到官方商店</summary>
          <div class="gn-store-collapse-body">
            <div class="gn-ws-row">
              <input type="text" data-ws-exp="id" placeholder="主题ID (如 neon-sakura)" value="${escWorkshopHtml(state.exportedPack?.pack?.id || '')}" />
              <input type="text" data-ws-exp="name" placeholder="主题名称" value="${escWorkshopHtml(state.exportedPack?.pack?.name || '')}" />
            </div>
            <div class="gn-ws-row">
              <input type="text" data-ws-exp="authorName" placeholder="作者署名 (GitHub ID)" value="${escWorkshopHtml(state.exportedPack?.pack?.author?.name || '')}" />
              <input type="text" data-ws-exp="description" placeholder="一句话介绍亮点" value="${escWorkshopHtml(state.exportedPack?.pack?.description || '')}" />
            </div>
            <div class="gn-ws-row">
              <button type="button" class="gn-pill is-primary" data-ws-act="export-pack">⬇ 导出并复制 .gemineko-theme.json</button>
              <button type="button" class="gn-pill" data-ws-ext="${escWorkshopHtml(state.brand?.submitThemeUrl || 'https://github.com/AEmbers/gemineko-hive/issues/new?template=theme-submission.yml')}">前往 GitHub 投稿 ↗</button>
            </div>
          </div>
        </details>
      </div>
    `;
  }

  function renderWorkshopTabHtml(c) {
    const presetItems = [
      { id: 'auto', name: '跟随宿主', swatches: ['#FFFFFF', '#0B0D14', '#8B5CF6', '#EC4899'], badge: '自动日夜' },
      ...Object.values(state.presets || {}),
    ];
    const roles = [
      { id: 'follow-role', label: '跟随活跃角色（推荐）' },
      ...Object.values(state.rolePalettes || {}),
      { id: 'off', label: '原生强调色' },
    ];

    return `
      <div class="gn-ws-grid">
        <div class="gn-ws-card">
          <div class="gn-ws-card-title">1. 基底画布、角色母题与视觉浓度</div>
          <div class="gn-ws-presets">
            ${presetItems.map((p) => {
              const sw = p.swatches || ['#fff', '#000', '#8b5cf6', '#ec4899'];
              return `
                <button type="button" class="gn-ws-preset-btn ${c.preset === p.id ? 'is-active' : ''}" data-ws-preset="${p.id}">
                  <div class="gn-preset-thumb" style="background:linear-gradient(135deg, ${sw[0]} 48%, ${sw[1] || sw[0]} 52%);">
                    <span class="gn-preset-dot" style="background:${sw[2] || '#8b5cf6'};"></span>
                    <span class="gn-preset-dot" style="background:${sw[3] || '#ec4899'};"></span>
                  </div>
                  <div class="gn-ws-preset-name">${p.name}</div>
                  <div class="gn-ws-preset-badge">${p.badge || ''}</div>
                </button>
              `;
            }).join('')}
          </div>
          <div class="gn-ws-row" style="margin-top:6px;">
            <span>视觉模式</span>
            <select data-ws-field="themeIntensity">
              <option value="optical-neko" ${(c.themeIntensity === 'optical-neko' || c.themeIntensity === 'balanced' || !c.themeIntensity) ? 'selected' : ''}>光学高定哈基米（推荐 · 高透流光）</option>
              <option value="vivid" ${c.themeIntensity === 'vivid' ? 'selected' : ''}>浓郁二次元（全屏纹样×星环）</option>
              <option value="minimal" ${c.themeIntensity === 'minimal' ? 'selected' : ''}>极简专注（纯净配色）</option>
            </select>
          </div>
          <div class="gn-ws-row">
            <span>角色母题</span>
            <select data-ws-field="accentMode">
              ${roles.map((r) => `<option value="${r.id}" ${c.accentMode === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}
            </select>
          </div>
          <div class="gn-ws-row">
            <span>动效圆角</span>
            <select data-ws-field="motionLevel">
              <option value="standard" ${c.motionLevel === 'standard' ? 'selected' : ''}>标准丝滑</option>
              <option value="subtle" ${c.motionLevel === 'subtle' ? 'selected' : ''}>轻柔微动</option>
              <option value="off" ${c.motionLevel === 'off' ? 'selected' : ''}>完全静态</option>
            </select>
            <select data-ws-field="cornerRadius">
              <option value="compact" ${c.cornerRadius === 'compact' ? 'selected' : ''}>紧凑圆角</option>
              <option value="soft" ${c.cornerRadius === 'soft' ? 'selected' : ''}>柔和圆角</option>
              <option value="round" ${c.cornerRadius === 'round' ? 'selected' : ''}>圆润胶囊</option>
            </select>
          </div>
          <div class="gn-ws-row">
            <span>加载星徽</span>
            <select data-ws-field="spinnerStyle">
              <option value="role-motif" ${(c.spinnerStyle || 'role-motif') === 'role-motif' ? 'selected' : ''}>5角色专属星徽</option>
              <option value="paw-bounce" ${c.spinnerStyle === 'paw-bounce' ? 'selected' : ''}>弹跳发光猫肉垫</option>
              <option value="prism-dots" ${c.spinnerStyle === 'prism-dots' ? 'selected' : ''}>炫彩四色旋转点</option>
              <option value="native" ${c.spinnerStyle === 'native' ? 'selected' : ''}>原版灰点</option>
            </select>
          </div>
          <div class="gn-font-box">
            <div class="gn-font-box-head">🔤 字体大小与阅读舒适度</div>
            <div class="gn-font-presets">
              <button type="button" class="gn-pill ${(c.typography?.sidecarFontSize ?? 14) <= 12 ? 'is-primary' : ''}" data-ws-font-preset="compact">紧凑 (12px)</button>
              <button type="button" class="gn-pill ${(c.typography?.sidecarFontSize ?? 14) >= 13 && (c.typography?.sidecarFontSize ?? 14) <= 14 ? 'is-primary' : ''}" data-ws-font-preset="normal">标准 (14px)</button>
              <button type="button" class="gn-pill ${(c.typography?.sidecarFontSize ?? 14) >= 15 && (c.typography?.sidecarFontSize ?? 14) <= 16 ? 'is-primary' : ''}" data-ws-font-preset="comfort">护眼 (16px)</button>
              <button type="button" class="gn-pill ${(c.typography?.sidecarFontSize ?? 14) >= 17 ? 'is-primary' : ''}" data-ws-font-preset="large">大字 (18px)</button>
            </div>
            <label class="gn-range-label">
              <span>侧栏与插件字号 <strong data-ws-typo-val="sidecarFontSize">${c.typography?.sidecarFontSize ?? 14}px</strong></span>
              <input type="range" min="11" max="22" step="1" value="${c.typography?.sidecarFontSize ?? 14}" data-ws-typo-range="sidecarFontSize" />
            </label>
            <label class="gn-range-label">
              <span>主窗口字号缩放 <strong data-ws-typo-val="hostFontScale">${c.typography?.hostFontScale ?? 100}%</strong></span>
              <input type="range" min="85" max="135" step="5" value="${c.typography?.hostFontScale ?? 100}" data-ws-typo-range="hostFontScale" />
            </label>
            <div class="gn-font-box-head" style="margin-top:4px;">🖼️ 立绘清晰度</div>
            <div class="gn-font-presets">
              <button type="button" class="gn-pill ${(c.spriteQuality || '1024') === '384' ? 'is-primary' : ''}" data-ws-sprite-q="384">轻量 384px</button>
              <button type="button" class="gn-pill ${(c.spriteQuality || '1024') === '512' ? 'is-primary' : ''}" data-ws-sprite-q="512">超清 512px</button>
              <button type="button" class="gn-pill ${(c.spriteQuality || '1024') === '1024' ? 'is-primary' : ''}" data-ws-sprite-q="1024">极致 1024px</button>
            </div>
            <div class="gn-font-box-head" style="margin-top:6px;">🐱 悬浮小猫停靠与大小</div>
            <div class="gn-font-presets">
              <button type="button" class="gn-pill ${(c.dock?.side || 'left') === 'left' ? 'is-primary' : ''}" data-ws-dock-side="left">⬅ 输入框左侧</button>
              <button type="button" class="gn-pill ${c.dock?.side === 'right' ? 'is-primary' : ''}" data-ws-dock-side="right">输入框右侧 ➡</button>
            </div>
            <label class="gn-range-label">
              <span>主窗口小猫大小 <strong data-ws-dock-val="catSize">${c.dock?.catSize ?? 100}px</strong></span>
              <input type="range" min="52" max="140" step="4" value="${c.dock?.catSize ?? 100}" data-ws-dock-range="catSize" />
            </label>
            <label class="gn-range-label">
              <span>状态气泡大小 <strong data-ws-dock-val="badgeScale">${c.dock?.badgeScale ?? 120}%</strong></span>
              <input type="range" min="85" max="150" step="5" value="${c.dock?.badgeScale ?? 120}" data-ws-dock-range="badgeScale" />
            </label>
            <label class="gn-range-label">
              <span>侧栏与消息板头像 <strong data-ws-dock-val="sidecarAvatarSize">${c.dock?.sidecarAvatarSize ?? 64}px</strong></span>
              <input type="range" min="44" max="112" step="4" value="${c.dock?.sidecarAvatarSize ?? 64}" data-ws-dock-range="sidecarAvatarSize" />
            </label>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">2. 角落立绘水印与 5 角色联动彩蛋</div>
          <div class="gn-ws-switches">
            ${renderSwitchRow('角落角色立绘水印', 'data-ws-wm-bool="enabled"', c.watermark?.enabled !== false)}
            ${renderSwitchRow('提问舞台抱臂思考', 'data-ws-bool="askStageEnabled"', c.askStageEnabled !== false)}
            ${renderSwitchRow('免ASAR贴纸内联', 'data-ws-meme="inlineRender"', c.memes?.inlineRender !== false)}
            ${renderSwitchRow('长任务收工贴纸', 'data-ws-meme="autoFinishSticker"', c.memes?.autoFinishSticker !== false)}
            ${renderSwitchRow('切模型极光扫屏', 'data-ws-link="roleSwitchAurora"', Boolean(c.linkages?.roleSwitchAurora))}
            ${renderSwitchRow('思考呼吸流光框', 'data-ws-link="composerBreathGlow"', Boolean(c.linkages?.composerBreathGlow))}
            ${renderSwitchRow('报错「哈气」微抖', 'data-ws-link="errorHissShake"', Boolean(c.linkages?.errorHissShake))}
            ${renderSwitchRow('捅基米窝全员巡游', 'data-ws-link="pokeBurst"', Boolean(c.linkages?.pokeBurst))}
            ${renderSwitchRow('深夜模式小夜灯', 'data-ws-link="nightLamp"', Boolean(c.linkages?.nightLamp))}
            ${renderSwitchRow('彩蛋专属合成音效', 'data-ws-egg-sound="1"', c.easterEggs?.soundEnabled !== false)}
          </div>
          <div class="gn-ws-row" style="margin-top:4px;">
            <span>水印角色</span>
            <select data-ws-wm="role">
              <option value="follow-role" ${(c.watermark?.role || 'follow-role') === 'follow-role' ? 'selected' : ''}>跟随当前模型角色</option>
              <option value="neon" ${c.watermark?.role === 'neon' ? 'selected' : ''}>Neon · 炫彩哈基米</option>
              <option value="hydrogen" ${c.watermark?.role === 'hydrogen' ? 'selected' : ''}>Hydrogen · 本体</option>
              <option value="carbon" ${c.watermark?.role === 'carbon' ? 'selected' : ''}>Carbon · 五彩黑</option>
              <option value="claude" ${c.watermark?.role === 'claude' ? 'selected' : ''}>Claude · 大小姐</option>
              <option value="gpt" ${c.watermark?.role === 'gpt' ? 'selected' : ''}>GPT · 白紫小龙娘</option>
              ${c.watermark?.customFilePath ? `<option value="custom" ${c.watermark?.role === 'custom' ? 'selected' : ''}>自定义透明立绘</option>` : ''}
            </select>
            <button type="button" class="gn-pill" data-ws-act="pick-wm">🖼️ 换立绘</button>
          </div>
          <div class="gn-ws-row">
            <label class="gn-range-label">水印显眼度 ${Math.round((c.watermark?.opacity ?? 0.14) * 100)}% <input type="range" min="4" max="38" value="${Math.round((c.watermark?.opacity ?? 0.14) * 100)}" data-ws-wm-range="opacity" /></label>
          </div>
          <div class="gn-ws-row" style="margin-top:2px;">
            <button type="button" class="gn-pill is-primary" data-ws-egg="hive-poke-burst">💥 捅基米窝巡游</button>
            <button type="button" class="gn-pill" data-ws-egg="stardust-rain">🐾 爪印雨 (Ctrl+Shift+P)</button>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">3. 工作台增强与自定义壁纸</div>
          <div class="gn-ws-switches">
            ${renderSwitchRow('悬浮猫爪大纲', 'data-ws-wb="pawOutline"', Boolean(c.workbench?.pawOutline))}
            ${renderSwitchRow('代码块吸顶折叠', 'data-ws-wb="codeBlockFold"', Boolean(c.workbench?.codeBlockFold))}
            ${renderSwitchRow('毛玻璃右键菜单', 'data-ws-wb="contextMenu"', Boolean(c.workbench?.contextMenu))}
            ${renderSwitchRow('滚底平滑动效', 'data-ws-wb="smoothScroll"', Boolean(c.workbench?.smoothScroll))}
          </div>
          <div class="gn-ws-row" style="margin-top:6px;">
            <span>壁纸模式</span>
            <select data-ws-wp="mode">
              <option value="off" ${c.wallpaper?.mode === 'off' ? 'selected' : ''}>关闭（零占用）</option>
              <option value="builtin-starry" ${c.wallpaper?.mode === 'builtin-starry' ? 'selected' : ''}>内置星轨猫窝</option>
              <option value="builtin-aurora" ${c.wallpaper?.mode === 'builtin-aurora' ? 'selected' : ''}>内置极光雾幕</option>
              <option value="custom" ${c.wallpaper?.mode === 'custom' ? 'selected' : ''}>本机图片 / 视频</option>
            </select>
            <button type="button" class="gn-pill" data-ws-act="pick-wp">📁 选文件</button>
          </div>
          <div class="gn-ws-row">
            <input type="text" data-ws-wp-path="1" placeholder="粘贴本地图片/视频绝对路径..." value="${escWorkshopHtml(c.wallpaper?.filePath || '')}" />
            <button type="button" class="gn-pill" data-ws-act="apply-wp-path">应用</button>
          </div>
          <div class="gn-ws-row">
            <label class="gn-range-label">透明 ${Math.round((c.wallpaper?.opacity ?? 0.22) * 100)}% <input type="range" min="5" max="65" value="${Math.round((c.wallpaper?.opacity ?? 0.22) * 100)}" data-ws-wp-range="opacity" /></label>
            <label class="gn-range-label">模糊 ${c.wallpaper?.blur ?? 4}px <input type="range" min="0" max="24" value="${c.wallpaper?.blur ?? 4}" data-ws-wp-range="blur" /></label>
            <label class="gn-range-label">遮罩 ${Math.round((c.wallpaper?.scrim ?? 0.35) * 100)}% <input type="range" min="0" max="85" value="${Math.round((c.wallpaper?.scrim ?? 0.35) * 100)}" data-ws-wp-range="scrim" /></label>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">4. 内置 Antigravity 全量汉化（面向国际用户可选）</div>
          <div class="gn-ws-row">
            <span>汉化模式</span>
            <select data-ws-i18n="mode">
              <option value="auto" ${(c.i18n?.mode || 'auto') === 'auto' ? 'selected' : ''}>跟随系统（中文自动开 / 海外英文）</option>
              <option value="neko-zh" ${c.i18n?.mode === 'neko-zh' ? 'selected' : ''}>哈基米萌系中文</option>
              <option value="zh" ${c.i18n?.mode === 'zh' ? 'selected' : ''}>标准专业中文</option>
              <option value="off" ${c.i18n?.mode === 'off' ? 'selected' : ''}>关闭 · 保留原版英文</option>
            </select>
          </div>
          <div class="gn-ws-row">
            <span>默认词库</span>
            <select data-ws-i18n="autoChineseStyle">
              <option value="neko-zh" ${(c.i18n?.autoChineseStyle || 'neko-zh') === 'neko-zh' ? 'selected' : ''}>哈基米萌系中文（推荐）</option>
              <option value="zh" ${c.i18n?.autoChineseStyle === 'zh' ? 'selected' : ''}>标准专业中文</option>
            </select>
          </div>
          <div class="gn-ws-sub" style="margin-top:4px;">保留 Antigravity / Gemini 品牌与代码正文原样，切回「关闭」无损还原英文。</div>
        </div>

        ${renderHostAsarCardHtml()}

        ${renderStartupCardHtml(c)}

        ${renderEggDexCardHtml(c)}
      </div>
    `;
  }

  function renderStartupCardHtml(c) {
    const st = c.startup || {};
    const legacyAsar = state.startupAsar;
    const hostAsar = state.hostAsar;
    const modeHint = hostAsar?.nativeConnected || hostAsar?.patched
      ? '✨ 当前已接入上方「原生 0ms 沉浸引导」：支持 0ms 防白屏 + 冷启免点击自动播音 + 重启稳定触发'
      : '💡 推荐启用上方「5. 原生 0ms 沉浸引导」以解锁冷启免点击自动播音与零白屏体验';

    return `
      <div class="gn-ws-card">
        <div class="gn-ws-card-title" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <span>🚀 6. 反重力启动动画（星钻 × 五哈基米）</span>
          <button type="button" class="gn-pill is-primary" data-ws-act="replay-startup">✨ 立即重播预览</button>
        </div>
        <div class="gn-ws-switches">
          ${renderSwitchRow('冷启自动播放启动动画', 'data-ws-startup="enabled"', st.enabled !== false)}
          ${renderSwitchRow('星晶反重力开机音效', 'data-ws-startup="soundEnabled"', st.soundEnabled !== false)}
          ${renderSwitchRow('猫娘招牌开机问候语音', 'data-ws-startup="voiceEnabled"', st.voiceEnabled !== false)}
        </div>
        <div class="gn-ws-sub" style="margin-top:6px;">${escWorkshopHtml(modeHint)}</div>
        ${legacyAsar?.found && legacyAsar.patched ? `
          <div class="gn-ws-row" style="margin-top:6px;flex-wrap:wrap;gap:6px;">
            <button type="button" class="gn-pill" data-ws-act="restore-startup-asar">↺ 移除旧版 preload 0ms 补丁（推荐改用上方 5 号卡原生引导）</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderHostAsarCardHtml() {
    const asar = state.hostAsar;
    let badgeText = '检测中…';
    if (asar) {
      if (!asar.found) {
        badgeText = '仅 CDP 模式（未检测到本地 app.asar）';
      } else if (asar.nativeConnected) {
        badgeText = `⚡ 原生 0ms 已直连（v${escWorkshopHtml(asar.version || '0.8.4')} · 免 19222 端口 + 自动播音）`;
      } else if (asar.patched) {
        badgeText = `✅ 已写入引导钩子 v${escWorkshopHtml(asar.version || '0.8.4')}（重启 Antigravity 生效）`;
      } else {
        badgeText = '⚪ 当前走 19222 CDP 兜底通道（可一键开启原生 0ms 引导）';
      }
    }
    const coexistHint = asar?.found
      ? `共存检测：汉化 ${asar.hasLocalization ? '✅' : '—'} · 表情包 ${asar.hasMemeRenderer ? '✅' : '—'} · 原版备份 ${asar.bakExists ? '✅' : '自动创建'}（含 0ms 防白屏、冷启免手势播音与免 19222 直连；热改色/词典/皮肤零重启）`
      : '未找到本地客户端安装包，插件保持纯 CDP 兼容运行';
    const cmdText = state.hostAsarCmdHint || (asar?.patched ? asar?.cliRestoreCmd : asar?.cliApplyCmd) || '';

    return `
      <div class="gn-ws-card">
        <div class="gn-ws-card-title">⚡ 5. 原生 0ms 沉浸引导（免 19222 端口）</div>
        <div class="gn-ws-sub">当前连接模式：<strong>${badgeText}</strong></div>
        <div class="gn-ws-sub" style="margin-top:4px;">${escWorkshopHtml(coexistHint)}</div>
        ${asar?.found ? `
          <div class="gn-ws-row" style="margin-top:6px;flex-wrap:wrap;gap:6px;">
            <button type="button" class="gn-pill is-primary" data-ws-act="apply-host-asar">⚡ ${asar.patched ? '更新原生引导钩子' : '启用原生 0ms 引导'}</button>
            ${asar.patched ? '<button type="button" class="gn-pill" data-ws-act="restore-host-asar">↺ 无损移除引导钩子</button>' : ''}
            ${cmdText ? '<button type="button" class="gn-pill" data-ws-act="copy-host-asar-cmd">📋 复制终端一键命令</button>' : ''}
          </div>
        ` : ''}
        ${state.hostAsarCmdHint ? `<div class="gn-ws-sub" style="margin-top:4px;word-break:break-all;">关闭 Antigravity 后在终端执行：<code>${escWorkshopHtml(state.hostAsarCmdHint)}</code></div>` : ''}
      </div>
    `;
  }

  function renderEggDexCardHtml(c) {
    const catalog = Array.isArray(state.eggCatalog) ? state.eggCatalog : [];
    const unlockedSet = new Set(Array.isArray(c.easterEggs?.unlocked) ? c.easterEggs.unlocked : []);
    const total = catalog.length || 13;
    const found = catalog.length ? catalog.filter((e) => unlockedSet.has(e.id)).length : unlockedSet.size;
    const pct = Math.min(100, Math.round((found / Math.max(1, total)) * 100));
    const allDone = found >= total && total > 0;

    const storyInfo = state.crystalStory && Array.isArray(state.crystalStory.chapters) ? state.crystalStory : null;
    const nextStoryCh = storyInfo
      ? storyInfo.chapters.find((ch) => Number(ch.chapter) === Number(storyInfo.currentChapter || 1) + 1)
      : null;

    const cardsHtml = catalog.map((egg) => {
      const done = unlockedSet.has(egg.id);
      const isStory = Boolean(egg.isStory);
      const storyBadge = isStory
        ? `<span class="gn-egg-story-badge">📖 跨版本主线 ${escWorkshopHtml(egg.storyChapter || 1)}/${escWorkshopHtml(egg.storyTotalChapters || 5)}</span>`
        : '';
      const replayLabel = isStory ? `▶ 重温第${escWorkshopHtml(egg.storyChapter || 1)}章` : '▶ 重温';
      const hintLine = done
        ? (isStory && nextStoryCh
            ? `${egg.gesture}（${egg.meme}） · 🔮 下版本预告：${nextStoryCh.title}`
            : `${egg.gesture}（${egg.meme}）`)
        : egg.hint;
      return `
        <div class="gn-egg-card ${done ? 'is-unlocked' : ''} ${isStory ? 'is-story-card' : ''}">
          <div class="gn-egg-card-top">
            <span>${done ? (isStory ? '💎' : '✨') : '🔒'} ${escWorkshopHtml(done ? egg.title : (isStory ? '沉睡水晶·未知呼救' : '？？？待发掘'))}</span>
            ${done ? `<button type="button" class="gn-pill" data-ws-replay-egg="${escWorkshopHtml(egg.id)}" data-ws-replay-scope="${escWorkshopHtml(egg.scope)}">${replayLabel}</button>` : ''}
          </div>
          <div class="gn-egg-card-widget">${escWorkshopHtml(egg.widget)} · ${egg.scope === 'sidecar' ? '侧边栏' : '主窗口'} ${storyBadge}</div>
          <div class="gn-egg-card-hint">${escWorkshopHtml(hintLine)}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="gn-ws-card">
        <div class="gn-ws-card-title" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <span>🥚 7. 哈基米彩蛋图鉴（已发现 ${found} / ${total}）</span>
          <div style="display:flex;gap:6px;align-items:center;">
            ${allDone ? `<button type="button" class="gn-pill is-primary" data-ws-act="supreme-parade">👑 召唤至尊圆头耄耋阅兵</button>` : '<span class="gn-ws-sub">集齐 13 枚解锁终极隐藏彩蛋</span>'}
            <button type="button" class="gn-pill" data-ws-act="reset-eggs" title="清空收集记录">↺ 重置图鉴</button>
          </div>
        </div>
        <div class="gn-egg-progress-track"><div class="gn-egg-progress-fill" style="width:${pct}%"></div></div>
        <div class="gn-egg-grid">${cardsHtml || '<div class="gn-ws-sub">图鉴目录加载中…</div>'}</div>
      </div>
    `;
  }

  function render() {
    const root = getRoot();
    root.classList.toggle('hidden', !state.open);
    if (!state.open) return;
    if (!state.config) {
      root.innerHTML = '<div class="gn-ws-card">正在连接 Gemineko Hive 主题引擎...</div>';
      return;
    }
    const c = state.config;
    const copyrightText = escWorkshopHtml(state.brand?.copyrightLine || 'Powered by Gemineko Hive · by AEmbers (Code: MIT · Artwork: CC BY-NC-SA 4.0)');
    const repoUrl = escWorkshopHtml(state.brand?.repoUrl || 'https://github.com/AEmbers/gemineko-hive');

    root.innerHTML = `
      <div class="gn-ws-head">
        <div>
          <div class="gn-ws-title" title="双击试试炼丹炉盲盒试妆 ⚗️">✦ Gemineko Hive · 高定光学主题引擎</div>
          <div class="gn-ws-sub">社区主题热插拔 × 5 角色流光联动 × 一键打包投稿</div>
        </div>
        <div class="gn-ws-actions">
          <div class="gn-ws-tabs">
            <button type="button" class="gn-tab-btn ${state.tab === 'store' ? 'is-active' : ''}" data-ws-tab="store">🏪 主题商店</button>
            <button type="button" class="gn-tab-btn ${state.tab === 'workshop' ? 'is-active' : ''}" data-ws-tab="workshop">🎨 精细工坊</button>
          </div>
          <button type="button" class="gn-pill" data-ws-act="toggle-enabled">${c.enabled ? '✅ 已启用' : '⚪ 已停用'}</button>
          <button type="button" class="gn-pill ${c.focusMode ? 'is-primary' : ''}" data-ws-act="toggle-focus">🧘 专注</button>
          <button type="button" class="gn-pill" data-ws-act="reset" title="恢复默认配置">↺</button>
          <button type="button" class="gn-pill" data-ws-act="close" title="收起抽屉">✕</button>
        </div>
      </div>

      <div class="gn-ws-status ${state.warning ? 'is-warn' : ''}">${escWorkshopHtml(state.warning || '调整或启用主题后实时无损作用于主窗口与基米窝侧栏')}</div>
      ${state.alchemy ? `
        <div class="gn-alchemy-bar">
          <span>⚗️ 哈基米炼丹炉限时盲盒试妆：<strong>${escWorkshopHtml(state.alchemy.label)}</strong>（6 秒未保留将自动还原）</span>
          <div style="display:flex;gap:6px;">
            <button type="button" class="gn-pill is-primary" data-ws-act="keep-alchemy">保留这套</button>
            <button type="button" class="gn-pill" data-ws-act="revert-alchemy">立即还原</button>
          </div>
        </div>
      ` : ''}

      ${state.tab === 'store' ? renderStoreTabHtml(c) : renderWorkshopTabHtml(c)}

      <div class="gn-store-footer">
        <span>${copyrightText}</span>
        <button type="button" class="gn-pill" data-ws-ext="${repoUrl}">⭐ GitHub · AEmbers/gemineko-hive</button>
      </div>
    `;

    root.onclick = (e) => {
      const tabBtn = e.target.closest('[data-ws-tab]');
      if (tabBtn) {
        state.tab = tabBtn.getAttribute('data-ws-tab') || 'store';
        render();
        return;
      }
      const extBtn = e.target.closest('[data-ws-ext]');
      if (extBtn) {
        e.preventDefault();
        void openExternal(extBtn.getAttribute('data-ws-ext'));
        return;
      }
      const actBtn = e.target.closest('[data-ws-act]');
      if (actBtn) {
        const act = actBtn.getAttribute('data-ws-act');
        if (act === 'close') setOpen(false);
        else if (act === 'reset') void resetConfig();
        else if (act === 'refresh-store') {
          showWorkshopToast('正在连接 GitHub 刷新主题目录与最新版本号...');
          void loadConfig(true);
        }
        else if (act === 'toggle-enabled') void savePatch({ enabled: !c.enabled });
        else if (act === 'toggle-focus') void savePatch({ focusMode: !c.focusMode });
        else if (act === 'pick-wp') void pickLocalWallpaper();
        else if (act === 'pick-wm') void pickLocalWatermark();
        else if (act === 'import-url') {
          const inp = root.querySelector('[data-ws-import-url="1"]');
          void installAndActivate({ url: String(inp?.value || '').trim() });
        }
        else if (act === 'export-pack') {
          const getVal = (k) => String(root.querySelector(`[data-ws-exp="${k}"]`)?.value || '').trim();
          void exportCurrentPack({
            id: getVal('id'),
            name: getVal('name'),
            authorName: getVal('authorName'),
            description: getVal('description'),
          });
        }
        else if (act === 'apply-wp-path') {
          const inp = root.querySelector('[data-ws-wp-path="1"]');
          const fp = String(inp?.value || '').trim();
          void savePatch({ wallpaper: { ...(c.wallpaper || {}), mode: fp ? 'custom' : 'off', filePath: fp } });
        }
        else if (act === 'keep-alchemy') void keepAlchemy();
        else if (act === 'revert-alchemy') revertAlchemy();
        else if (act === 'reset-eggs') void resetEggProgress();
        else if (act === 'replay-startup') {
          void deps.hostApi('/api/startup/replay', { method: 'POST', body: '{}' }).then((r) => {
            showWorkshopToast(r?.replayed ? '✨ 已在主窗口播放反重力启动动画！' : '主窗口尚未附着，请确认 Antigravity 已打开', !r?.replayed);
          }).catch(() => showWorkshopToast('重播请求失败', true));
        }
        else if (act === 'apply-startup-asar') {
          showWorkshopToast('正在检测并写入 0ms app.asar 启动强化...');
          void deps.hostApi('/api/startup-asar/apply', { method: 'POST', body: '{}' }).then((r) => {
            if (r?.status) state.startupAsar = r.status;
            if (r?.ok) {
              state.startupCmdHint = '';
              showWorkshopToast('✅ 0ms 启动强化补丁写入成功（重启 Antigravity 生效）');
            } else {
              state.startupCmdHint = r?.cliApplyCmd || state.startupAsar?.cliApplyCmd || '';
              showWorkshopToast(r?.message || '客户端运行中无法热覆盖，请关闭后在独立终端运行下方命令', true);
            }
            render();
          }).catch(() => showWorkshopToast('0ms 补丁写入失败', true));
        }
        else if (act === 'restore-startup-asar') {
          void deps.hostApi('/api/startup-asar/restore', { method: 'POST', body: '{}' }).then((r) => {
            if (r?.status) state.startupAsar = r.status;
            if (r?.ok) {
              state.startupCmdHint = '';
              showWorkshopToast('↺ 已无损剥离 0ms 启动强化补丁（汉化与表情包完整保留）');
            } else {
              state.startupCmdHint = r?.cliRestoreCmd || state.startupAsar?.cliRestoreCmd || '';
              showWorkshopToast(r?.message || '客户端运行中占用文件，请关闭后在独立终端运行移除命令', true);
            }
            render();
          }).catch(() => showWorkshopToast('移除失败', true));
        }
        else if (act === 'copy-startup-cmd') {
          const cmd = state.startupCmdHint || (state.startupAsar?.patched ? state.startupAsar?.cliRestoreCmd : state.startupAsar?.cliApplyCmd) || '';
          if (cmd && navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(cmd).then(() => showWorkshopToast('📋 已复制终端命令，关闭客户端后粘贴执行即可'));
          } else {
            showWorkshopToast(cmd || '暂无命令');
          }
        }
        else if (act === 'apply-host-asar') {
          showWorkshopToast('正在检测并写入极薄 app.asar 主进程引导钩子...');
          void deps.hostApi('/api/host-asar/apply', { method: 'POST', body: '{}' }).then((r) => {
            if (r?.status) state.hostAsar = r.status;
            if (r?.ok) {
              state.hostAsarCmdHint = '';
              showWorkshopToast('✅ 原生 0ms 引导钩子写入成功（重启 Antigravity 后免 19222 端口生效）');
            } else {
              state.hostAsarCmdHint = r?.cliApplyCmd || state.hostAsar?.cliApplyCmd || '';
              showWorkshopToast(r?.message || '客户端运行中占用文件，请完全退出后在独立终端执行下方命令', true);
            }
            render();
          }).catch(() => showWorkshopToast('原生引导写入请求失败', true));
        }
        else if (act === 'restore-host-asar') {
          void deps.hostApi('/api/host-asar/restore', { method: 'POST', body: '{}' }).then((r) => {
            if (r?.status) state.hostAsar = r.status;
            if (r?.ok) {
              state.hostAsarCmdHint = '';
              showWorkshopToast('↺ 已无损剥离原生引导钩子（汉化、表情包与原版备份完整保留）');
            } else {
              state.hostAsarCmdHint = r?.cliRestoreCmd || state.hostAsar?.cliRestoreCmd || '';
              showWorkshopToast(r?.message || '客户端运行中占用文件，请完全退出后在独立终端执行移除命令', true);
            }
            render();
          }).catch(() => showWorkshopToast('移除引导钩子请求失败', true));
        }
        else if (act === 'copy-host-asar-cmd') {
          const cmd = state.hostAsarCmdHint || (state.hostAsar?.patched ? state.hostAsar?.cliRestoreCmd : state.hostAsar?.cliApplyCmd) || '';
          if (cmd && navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(cmd).then(() => showWorkshopToast('📋 已复制终端命令，完全退出 Antigravity 后粘贴执行即可'));
          } else {
            showWorkshopToast(cmd || '暂无命令');
          }
        }
        else if (act === 'supreme-parade') {
          deps.onReplaySidecarEgg?.('supreme');
          void triggerSidecarEgg('supreme-maodie-parade');
        }
        return;
      }
      const actPackBtn = e.target.closest('[data-ws-activate]');
      if (actPackBtn) {
        void activatePack(actPackBtn.getAttribute('data-ws-activate'));
        return;
      }
      const instPackBtn = e.target.closest('[data-ws-install-id]');
      if (instPackBtn) {
        void installAndActivate({ packId: instPackBtn.getAttribute('data-ws-install-id') });
        return;
      }
      const uninstBtn = e.target.closest('[data-ws-uninstall]');
      if (uninstBtn) {
        void uninstallPack(uninstBtn.getAttribute('data-ws-uninstall'));
        return;
      }
      const presetBtn = e.target.closest('[data-ws-preset]');
      if (presetBtn) {
        void savePatch({ enabled: true, preset: presetBtn.getAttribute('data-ws-preset'), activeThemePackId: 'official-gemineko' });
        return;
      }
      const fontPresetBtn = e.target.closest('[data-ws-font-preset]');
      if (fontPresetBtn) {
        const key = fontPresetBtn.getAttribute('data-ws-font-preset');
        const map = { compact: { sidecarFontSize: 12, hostFontScale: 95 }, normal: { sidecarFontSize: 14, hostFontScale: 100 }, comfort: { sidecarFontSize: 16, hostFontScale: 110 }, large: { sidecarFontSize: 18, hostFontScale: 120 } };
        void savePatch({ typography: map[key] || map.normal });
        return;
      }
      const spriteQBtn = e.target.closest('[data-ws-sprite-q]');
      if (spriteQBtn) {
        const q = spriteQBtn.getAttribute('data-ws-sprite-q') || '512';
        writeLocalSpriteQ(q);
        void savePatch({ spriteQuality: q });
        return;
      }
      const dockSideBtn = e.target.closest('[data-ws-dock-side]');
      if (dockSideBtn) {
        const side = dockSideBtn.getAttribute('data-ws-dock-side') === 'right' ? 'right' : 'left';
        const nextDock = writeLocalDock({ ...(c.dock || readLocalDock()), side });
        void savePatch({ dock: nextDock });
        return;
      }
      const eggBtn = e.target.closest('[data-ws-egg]');
      if (eggBtn) {
        void triggerSidecarEgg(eggBtn.getAttribute('data-ws-egg'));
        return;
      }
      const replayBtn = e.target.closest('[data-ws-replay-egg]');
      if (replayBtn) {
        const eggId = replayBtn.getAttribute('data-ws-replay-egg');
        const scope = replayBtn.getAttribute('data-ws-replay-scope');
        if (scope === 'sidecar') {
          deps.onReplaySidecarEgg?.(eggId);
        } else {
          void triggerSidecarEgg('replay-egg', { eggId });
        }
      }
    };

    root.oninput = (e) => {
      const target = e.target;
      const typoKey = target?.getAttribute?.('data-ws-typo-range');
      if (typoKey) {
        const num = Number(target.value);
        const valEl = root.querySelector(`[data-ws-typo-val="${typoKey}"]`);
        if (valEl) valEl.textContent = typoKey === 'hostFontScale' ? `${num}%` : `${num}px`;
        const curTypo = state.config?.typography || readLocalTypo() || { sidecarFontSize: 14, hostFontScale: 100 };
        const nextTypo = writeLocalTypo({ ...curTypo, [typoKey]: num }) || curTypo;
        if (state.config) {
          state.config = { ...state.config, typography: nextTypo };
        }
        if (typoKey === 'sidecarFontSize' && state.config) {
          notifyHostTheme(state.config);
        }
        return;
      }
      const dockKey = target?.getAttribute?.('data-ws-dock-range');
      if (!dockKey) return;
      const num = Number(target.value);
      const valEl = root.querySelector(`[data-ws-dock-val="${dockKey}"]`);
      if (valEl) valEl.textContent = dockKey === 'badgeScale' ? `${num}%` : `${num}px`;
      const curDock = state.config?.dock || readLocalDock();
      const nextDock = writeLocalDock({ ...curDock, [dockKey]: num });
      if (state.config && nextDock) {
        state.config = { ...state.config, dock: nextDock };
        if (dockKey === 'sidecarAvatarSize') {
          notifyHostTheme(state.config);
        }
      }
    };

    root.onchange = (e) => {
      const target = e.target;
      if (!target) return;
      if (target.getAttribute('data-ws-import-file') === '1' && target.files?.[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result || ''));
            void installAndActivate({ pack: parsed });
          } catch {
            showWorkshopToast('导入失败：文件不是合法 JSON', true);
          }
        };
        reader.readAsText(target.files[0], 'utf8');
        return;
      }
      const field = target.getAttribute('data-ws-field');
      if (field) {
        void savePatch({ [field]: target.value });
        return;
      }
      const boolField = target.getAttribute('data-ws-bool');
      if (boolField) {
        void savePatch({ [boolField]: Boolean(target.checked) });
        return;
      }
      if (target.getAttribute('data-ws-egg-sound') === '1') {
        void savePatch({ easterEggs: { ...(c.easterEggs || {}), soundEnabled: Boolean(target.checked) } });
        return;
      }
      const startupKey = target.getAttribute('data-ws-startup');
      if (startupKey) {
        void savePatch({ startup: { ...(c.startup || {}), [startupKey]: Boolean(target.checked) } });
        return;
      }
      const memeKey = target.getAttribute('data-ws-meme');
      if (memeKey) {
        void savePatch({ memes: { ...(c.memes || {}), [memeKey]: Boolean(target.checked) } });
        return;
      }
      const i18nKey = target.getAttribute('data-ws-i18n');
      if (i18nKey) {
        void savePatch({ i18n: { ...(c.i18n || {}), [i18nKey]: target.value } });
        return;
      }
      const wmBool = target.getAttribute('data-ws-wm-bool');
      if (wmBool) {
        void savePatch({ watermark: { ...(c.watermark || {}), [wmBool]: Boolean(target.checked) } });
        return;
      }
      const wmKey = target.getAttribute('data-ws-wm');
      if (wmKey) {
        void savePatch({ watermark: { ...(c.watermark || {}), [wmKey]: target.value } });
        return;
      }
      const wmRange = target.getAttribute('data-ws-wm-range');
      if (wmRange) {
        void savePatch({ watermark: { ...(c.watermark || {}), [wmRange]: Number((Number(target.value) / 100).toFixed(2)) } });
        return;
      }
      const linkKey = target.getAttribute('data-ws-link');
      if (linkKey) {
        void savePatch({ linkages: { ...(c.linkages || {}), [linkKey]: Boolean(target.checked) } });
        return;
      }
      const wbKey = target.getAttribute('data-ws-wb');
      if (wbKey) {
        void savePatch({ workbench: { ...(c.workbench || {}), [wbKey]: Boolean(target.checked) } });
        return;
      }
      const wpKey = target.getAttribute('data-ws-wp');
      if (wpKey) {
        void savePatch({ wallpaper: { ...(c.wallpaper || {}), [wpKey]: target.value } });
        return;
      }
      const rangeKey = target.getAttribute('data-ws-wp-range');
      if (rangeKey) {
        const rawVal = Number(target.value);
        const val = rangeKey === 'blur' ? rawVal : Number((rawVal / 100).toFixed(2));
        void savePatch({ wallpaper: { ...(c.wallpaper || {}), [rangeKey]: val } });
        return;
      }
      const typoKey = target.getAttribute('data-ws-typo-range');
      if (typoKey) {
        void savePatch({ typography: { ...(c.typography || {}), [typoKey]: Number(target.value) } });
        return;
      }
      const dockKey = target.getAttribute('data-ws-dock-range');
      if (dockKey) {
        const nextDock = writeLocalDock({ ...(c.dock || readLocalDock()), [dockKey]: Number(target.value) });
        void savePatch({ dock: nextDock });
      }
    };
  }

  function setOpen(nextOpen) {
    state.open = Boolean(nextOpen);
    const btn = document.getElementById('gn-workshop-toggle-btn');
    if (btn) btn.classList.toggle('is-active', state.open);
    if (state.open && (!state.config || !state.registry.length)) {
      void loadConfig();
    }
    render();
  }

  async function pollEvents() {
    try {
      const data = await deps.hostApi('/api/theme/event');
      if (data?.ok && data.seq > state.lastEventSeq && data.latest) {
        const prev = state.lastEventSeq;
        state.lastEventSeq = data.seq;
        if (prev > 0) {
          const ev = data.latest;
          if (ev.type === 'hive-poke-burst' && ev.source === 'host') {
            deps.sidecarBanner('💥 主对话区捅了基米窝！5 位哈基米全员集结欢呼喵~');
          } else if (ev.type === 'open-workshop' && ev.source === 'host') {
            setOpen(true);
          }
        }
      }
    } catch {}
  }

  function syncExternalTypography(typo) {
    if (!typo || typeof typo !== 'object') return;
    const clean = writeLocalTypo({ ...(state.config?.typography || readLocalTypo() || { sidecarFontSize: 14, hostFontScale: 100 }), ...typo });
    if (state.config && clean) {
      state.config = { ...state.config, typography: clean };
    }
    const root = document.getElementById('gn-theme-workshop');
    if (root && !root.classList.contains('hidden') && clean) {
      const sRange = root.querySelector('[data-ws-typo-range="sidecarFontSize"]');
      const sVal = root.querySelector('[data-ws-typo-val="sidecarFontSize"]');
      if (sRange) sRange.value = String(clean.sidecarFontSize);
      if (sVal) sVal.textContent = `${clean.sidecarFontSize}px`;
      const hRange = root.querySelector('[data-ws-typo-range="hostFontScale"]');
      const hVal = root.querySelector('[data-ws-typo-val="hostFontScale"]');
      if (hRange) hRange.value = String(clean.hostFontScale);
      if (hVal) hVal.textContent = `${clean.hostFontScale}%`;
    }
  }

  function syncExternalConfig(extCfg) {
    if (!extCfg || typeof extCfg !== 'object') return;
    state.config = withLocalTypo(extCfg, state.config?.typography, state.config?.spriteQuality, state.config?.dock);
    if (!state.open) return;
    const root = document.getElementById('gn-theme-workshop');
    if (root && !root.classList.contains('hidden')) {
      const ae = document.activeElement;
      if (ae && root.contains(ae) && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) {
        return;
      }
      render();
    }
  }

  return {
    isOpen: () => state.open,
    setOpen,
    toggle: () => setOpen(!state.open),
    loadConfig,
    pollEvents,
    triggerSidecarEgg,
    triggerAlchemy,
    syncExternalTypography,
    syncExternalConfig,
  };
}
