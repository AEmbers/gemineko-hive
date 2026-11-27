/**
 * @file Gemineko Hive 侧边栏「社区主题商店 × 精细主题工坊」前端控制器。
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
 * @param {{ hostApi: Function, sidecarBanner: (text: string) => void }} deps
 */
export function createThemeWorkshopController(deps) {
  const state = {
    open: false,
    tab: 'store',
    config: null,
    presets: {},
    rolePalettes: {},
    brand: null,
    registry: [],
    registrySource: 'bundled',
    github: null,
    lastEventSeq: 0,
    loading: false,
    warning: '',
    exportedPack: null,
  };

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
      const [cfgRes, regRes, ghRes] = await Promise.all([
        deps.hostApi('/api/theme/config'),
        deps.hostApi(`/api/store/registry${suffix}`),
        deps.hostApi(`/api/github/status${suffix}`),
      ]);
      if (cfgRes?.ok) {
        state.config = cfgRes.config;
        state.presets = cfgRes.presets || {};
        state.rolePalettes = cfgRes.rolePalettes || {};
        if (cfgRes.brand) state.brand = cfgRes.brand;
      }
      if (regRes?.ok) {
        state.registry = Array.isArray(regRes.registry) ? regRes.registry : [];
        state.registrySource = regRes.source || 'bundled';
        if (regRes.brand) state.brand = regRes.brand;
      }
      if (ghRes?.ok) {
        state.github = ghRes;
      }
      render();
    } catch {
      /* ignore */
    } finally {
      state.loading = false;
    }
  }

  async function savePatch(patch) {
    try {
      const data = await deps.hostApi('/api/theme/config', {
        method: 'POST',
        body: JSON.stringify(patch),
      });
      if (data?.ok && data.config) {
        state.config = data.config;
        render();
        showWorkshopToast(data.warning ? `已保存，壁纸提示：${data.warning}` : '✨ 已即时同步到 Antigravity 宿主窗口', Boolean(data.warning));
      }
    } catch (err) {
      showWorkshopToast(`同步失败: ${err?.message || err}`, true);
    }
  }

  async function resetConfig() {
    try {
      const data = await deps.hostApi('/api/theme/reset', { method: 'POST', body: '{}' });
      if (data?.ok && data.config) {
        state.config = data.config;
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
        await loadConfig();
        showWorkshopToast(`✨ 已激活主题「${data.config.activeThemePack?.name || '基米窝官方旗舰'}」`);
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

  async function triggerSidecarEgg(type) {
    try {
      await deps.hostApi('/api/theme/event', {
        method: 'POST',
        body: JSON.stringify({ type, role: 'neon', source: 'sidecar' }),
      });
      deps.sidecarBanner(
        type === 'hive-poke-burst'
          ? '💥 已从基米窝发出全员集结信号，快看主窗口下方 5 只哈基米巡游！'
          : '🐾 爪印星尘雨已在主对话区飘落喵~',
      );
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

  function renderStoreTabHtml(c) {
    const activePackId = c.activeThemePackId || 'official-gemineko';
    const gh = state.github || {};
    const starTxt = Number.isFinite(Number(gh.stars)) ? `⭐ ${gh.stars} Star 支持作者` : '⭐ 前往 GitHub 点 Star';
    const verTxt = gh.hasUpdate
      ? `🚀 发现新版 v${escWorkshopHtml(gh.latestVersion)}（当前 v${escWorkshopHtml(gh.currentVersion)}）`
      : `✅ 已是最新版 v${escWorkshopHtml(gh.currentVersion || state.brand?.version || '0.7.0')}`;

    const cardsHtml = state.registry.map((t) => {
      const isActive = activePackId === t.id;
      const authorName = escWorkshopHtml(t.author?.name || 'Community');
      const authorUrl = t.author?.url ? escWorkshopHtml(t.author.url) : '';
      const swatches = (t.swatches || []).slice(0, 4).map((hex) => `<span style="background:${escWorkshopHtml(hex)}"></span>`).join('');
      const tagsHtml = [
        t.official ? '<span class="gn-store-tag is-official">官方</span>' : (t.inRegistry === false ? '<span class="gn-store-tag is-local">本地包</span>' : '<span class="gn-store-tag">社区</span>'),
        ...(t.tags || []).slice(0, 2).map((tag) => `<span class="gn-store-tag">${escWorkshopHtml(tag)}</span>`),
      ].join('');
      const actBtn = isActive
        ? '<button type="button" class="gn-pill is-primary" disabled>✓ 使用中</button>'
        : (t.installed || t.official
            ? `<button type="button" class="gn-pill is-primary" data-ws-activate="${escWorkshopHtml(t.id)}">应用主题</button>`
            : `<button type="button" class="gn-pill is-primary" data-ws-install-id="${escWorkshopHtml(t.id)}">安装并启用</button>`);
      const uninstBtn = (!t.official && t.installed)
        ? `<button type="button" class="gn-pill" data-ws-uninstall="${escWorkshopHtml(t.id)}">卸载</button>`
        : '';

      return `
        <div class="gn-store-card ${isActive ? 'is-active' : ''}">
          <div class="gn-store-card-top">
            <div class="gn-ws-swatches">${swatches}</div>
            <div class="gn-store-tags">${tagsHtml}</div>
          </div>
          <div class="gn-store-name">${escWorkshopHtml(t.name)}</div>
          <div class="gn-store-author">
            by ${authorUrl ? `<a href="#" data-ws-ext="${authorUrl}">${authorName}</a>` : authorName} · v${escWorkshopHtml(t.version || '1.0.0')}
          </div>
          <div class="gn-store-desc">${escWorkshopHtml(t.description || '开放式社区主题包')}</div>
          <div class="gn-store-card-actions">${actBtn}${uninstBtn}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="gn-store-hero">
        <div>
          <div class="gn-store-hero-title">💎 Gemineko Hive 开放主题引擎 · 社区商店</div>
          <div class="gn-store-hero-sub">${verTxt} · 源: ${escWorkshopHtml(state.registrySource)}</div>
        </div>
        <div class="gn-store-hero-btns">
          <button type="button" class="gn-pill is-primary" data-ws-ext="${escWorkshopHtml(gh.repoUrl || state.brand?.repoUrl || 'https://github.com/AEmbers/gemineko-hive')}">${starTxt}</button>
          <button type="button" class="gn-pill" data-ws-act="refresh-store">🔄 刷新商店/版本</button>
          <button type="button" class="gn-pill" data-ws-ext="${escWorkshopHtml(state.brand?.submitThemeUrl || 'https://github.com/AEmbers/gemineko-hive/issues/new?template=theme-submission.yml')}">🚀 投稿上架我的主题</button>
        </div>
      </div>

      <div class="gn-store-grid">${cardsHtml || '<div class="gn-ws-sub">暂无主题条目</div>'}</div>

      <div class="gn-ws-grid" style="margin-top:8px;">
        <div class="gn-ws-card">
          <div class="gn-ws-card-title">📥 导入第三方主题包（GitHub Raw / 本地 JSON）</div>
          <div class="gn-ws-row">
            <input type="text" data-ws-import-url="1" placeholder="粘贴 GitHub / Gist Raw JSON 链接 (https://...)" />
            <button type="button" class="gn-pill is-primary" data-ws-act="import-url">拉取并安装</button>
          </div>
          <div class="gn-ws-row">
            <label class="gn-pill" style="cursor:pointer;">
              📂 选择本地 .gemineko-theme.json 导入
              <input type="file" accept=".json,application/json" data-ws-import-file="1" style="display:none;" />
            </label>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">📦 打包我的主题 & 投稿给全球用户</div>
          <div class="gn-ws-row">
            <input type="text" data-ws-exp="id" placeholder="主题ID (如 neon-sakura)" value="${escWorkshopHtml(state.exportedPack?.pack?.id || '')}" />
            <input type="text" data-ws-exp="name" placeholder="主题名称" value="${escWorkshopHtml(state.exportedPack?.pack?.name || '')}" />
          </div>
          <div class="gn-ws-row">
            <input type="text" data-ws-exp="authorName" placeholder="作者署名 (如你的 GitHub ID)" value="${escWorkshopHtml(state.exportedPack?.pack?.author?.name || '')}" />
            <input type="text" data-ws-exp="description" placeholder="一句话介绍亮点" value="${escWorkshopHtml(state.exportedPack?.pack?.description || '')}" />
          </div>
          <div class="gn-ws-row">
            <button type="button" class="gn-pill is-primary" data-ws-act="export-pack">⬇ 导出并复制 .gemineko-theme.json</button>
            <button type="button" class="gn-pill" data-ws-ext="${escWorkshopHtml(state.brand?.submitThemeUrl || 'https://github.com/AEmbers/gemineko-hive/issues/new?template=theme-submission.yml')}">前往 GitHub 投稿 ↗</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderWorkshopTabHtml(c) {
    const presetItems = [
      { id: 'auto', name: '跟随宿主', swatches: ['#E8EEF6', '#0F101A', '#8B5CF6', '#EC4899'], badge: '自动日夜' },
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
          <div class="gn-ws-card-title">1. 基底配色、角色母题与视觉浓度</div>
          <div class="gn-ws-presets">
            ${presetItems.map((p) => `
              <button type="button" class="gn-ws-preset-btn ${c.preset === p.id ? 'is-active' : ''}" data-ws-preset="${p.id}">
                <div class="gn-ws-swatches">${(p.swatches || []).slice(0, 4).map((hex) => `<span style="background:${hex}"></span>`).join('')}</div>
                <div class="gn-ws-preset-name">${p.name}</div>
                <div class="gn-ws-preset-badge">${p.badge || ''}</div>
              </button>
            `).join('')}
          </div>
          <div class="gn-ws-row" style="margin-top:8px;">
            <span>视觉模式：</span>
            <select data-ws-field="themeIntensity">
              <option value="optical-neko" ${(c.themeIntensity === 'optical-neko' || c.themeIntensity === 'balanced' || !c.themeIntensity) ? 'selected' : ''}>光学高定哈基米（默认 · 高透光影×无满屏花纹）</option>
              <option value="vivid" ${c.themeIntensity === 'vivid' ? 'selected' : ''}>浓郁二次元（全屏角色纹样×旋转纹章）</option>
              <option value="minimal" ${c.themeIntensity === 'minimal' ? 'selected' : ''}>极简专注（仅保留配色层次）</option>
            </select>
          </div>
          <div class="gn-ws-row">
            <span>动态角色母题：</span>
            <select data-ws-field="accentMode">
              ${roles.map((r) => `<option value="${r.id}" ${c.accentMode === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}
            </select>
          </div>
          <div class="gn-ws-row">
            <span>动效与圆角：</span>
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
            <span>加载动效：</span>
            <select data-ws-field="spinnerStyle">
              <option value="role-motif" ${(c.spinnerStyle || 'role-motif') === 'role-motif' ? 'selected' : ''}>5角色专属星徽</option>
              <option value="paw-bounce" ${c.spinnerStyle === 'paw-bounce' ? 'selected' : ''}>弹跳发光猫肉垫</option>
              <option value="prism-dots" ${c.spinnerStyle === 'prism-dots' ? 'selected' : ''}>炫彩四色旋转点</option>
              <option value="native" ${c.spinnerStyle === 'native' ? 'selected' : ''}>原版灰点</option>
            </select>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">2. 角落立绘水印与 5 角色联动彩蛋</div>
          <div class="gn-ws-checks">
            <label><input type="checkbox" data-ws-wm-bool="enabled" ${c.watermark?.enabled !== false ? 'checked' : ''} /> 角落二次元角色立绘水印</label>
            <label><input type="checkbox" data-ws-bool="askStageEnabled" ${c.askStageEnabled !== false ? 'checked' : ''} /> 提问模式抱臂思考+轮盘舞台</label>
            <label><input type="checkbox" data-ws-meme="inlineRender" ${c.memes?.inlineRender !== false ? 'checked' : ''} /> 聊天[表情]免改ASAR内联贴纸</label>
            <label><input type="checkbox" data-ws-meme="autoFinishSticker" ${c.memes?.autoFinishSticker !== false ? 'checked' : ''} /> 收工弹出猫娘贴纸（工作中禁弹）</label>
            <label><input type="checkbox" data-ws-link="roleSwitchAurora" ${c.linkages?.roleSwitchAurora ? 'checked' : ''} /> 切模型极光扫屏</label>
            <label><input type="checkbox" data-ws-link="composerBreathGlow" ${c.linkages?.composerBreathGlow ? 'checked' : ''} /> 思考/运行呼吸流光边框</label>
            <label><input type="checkbox" data-ws-link="errorHissShake" ${c.linkages?.errorHissShake ? 'checked' : ''} /> 工具报错「哈气」微抖</label>
            <label><input type="checkbox" data-ws-link="pokeBurst" ${c.linkages?.pokeBurst ? 'checked' : ''} /> 连击5次「捅了基米窝」全员巡游</label>
            <label><input type="checkbox" data-ws-link="nightLamp" ${c.linkages?.nightLamp ? 'checked' : ''} /> 深夜小夜灯（23:00-05:00）</label>
          </div>
          <div class="gn-ws-row" style="margin-top:6px;">
            <span>水印形象：</span>
            <select data-ws-wm="role">
              <option value="follow-role" ${(c.watermark?.role || 'follow-role') === 'follow-role' ? 'selected' : ''}>跟随当前模型角色</option>
              <option value="neon" ${c.watermark?.role === 'neon' ? 'selected' : ''}>Neon · 炫彩哈基米</option>
              <option value="hydrogen" ${c.watermark?.role === 'hydrogen' ? 'selected' : ''}>Hydrogen · 本体</option>
              <option value="carbon" ${c.watermark?.role === 'carbon' ? 'selected' : ''}>Carbon · 五彩黑</option>
              <option value="claude" ${c.watermark?.role === 'claude' ? 'selected' : ''}>Claude · 大小姐</option>
              <option value="gpt" ${c.watermark?.role === 'gpt' ? 'selected' : ''}>GPT · 白紫小龙娘</option>
              ${c.watermark?.customFilePath ? `<option value="custom" ${c.watermark?.role === 'custom' ? 'selected' : ''}>自定义透明立绘</option>` : ''}
            </select>
            <button type="button" class="gn-pill" data-ws-act="pick-wm">🖼️ 换透明立绘</button>
          </div>
          <div class="gn-ws-row">
            <label>水印显眼度 ${Math.round((c.watermark?.opacity ?? 0.14) * 100)}% <input type="range" min="4" max="38" value="${Math.round((c.watermark?.opacity ?? 0.14) * 100)}" data-ws-wm-range="opacity" /></label>
          </div>
          <div class="gn-ws-row" style="margin-top:4px;">
            <button type="button" class="gn-pill is-primary" data-ws-egg="hive-poke-burst">💥 立即捅了基米窝</button>
            <button type="button" class="gn-pill" data-ws-egg="stardust-rain">🐾 炫彩 SVG 爪印雨 (Ctrl+Shift+P)</button>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">3. 工作台增强与自定义壁纸</div>
          <div class="gn-ws-checks">
            <label><input type="checkbox" data-ws-wb="pawOutline" ${c.workbench?.pawOutline ? 'checked' : ''} /> 悬浮猫爪对话大纲</label>
            <label><input type="checkbox" data-ws-wb="codeBlockFold" ${c.workbench?.codeBlockFold ? 'checked' : ''} /> 超长代码块吸顶+折叠（≥32行）</label>
            <label><input type="checkbox" data-ws-wb="contextMenu" ${c.workbench?.contextMenu ? 'checked' : ''} /> 毛玻璃右键快捷菜单 (/btw/@引用)</label>
            <label><input type="checkbox" data-ws-wb="smoothScroll" ${c.workbench?.smoothScroll ? 'checked' : ''} /> 滚底平滑动效</label>
          </div>
          <div class="gn-ws-row" style="margin-top:8px;">
            <span>壁纸模式：</span>
            <select data-ws-wp="mode">
              <option value="off" ${c.wallpaper?.mode === 'off' ? 'selected' : ''}>关闭（默认零占用）</option>
              <option value="builtin-starry" ${c.wallpaper?.mode === 'builtin-starry' ? 'selected' : ''}>内置星轨猫窝</option>
              <option value="builtin-aurora" ${c.wallpaper?.mode === 'builtin-aurora' ? 'selected' : ''}>内置极光雾幕</option>
              <option value="custom" ${c.wallpaper?.mode === 'custom' ? 'selected' : ''}>本机图片 / MP4-WebM</option>
            </select>
            <button type="button" class="gn-pill" data-ws-act="pick-wp">📁 选择壁纸</button>
          </div>
          <div class="gn-ws-row">
            <input type="text" data-ws-wp-path="1" placeholder="粘贴本地图片/视频绝对路径..." value="${escWorkshopHtml(c.wallpaper?.filePath || '')}" />
            <button type="button" class="gn-pill" data-ws-act="apply-wp-path">应用</button>
          </div>
          <div class="gn-ws-row">
            <label>透明度 ${Math.round((c.wallpaper?.opacity ?? 0.22) * 100)}% <input type="range" min="5" max="65" value="${Math.round((c.wallpaper?.opacity ?? 0.22) * 100)}" data-ws-wp-range="opacity" /></label>
            <label>模糊 ${c.wallpaper?.blur ?? 4}px <input type="range" min="0" max="24" value="${c.wallpaper?.blur ?? 4}" data-ws-wp-range="blur" /></label>
            <label>遮罩 ${Math.round((c.wallpaper?.scrim ?? 0.35) * 100)}% <input type="range" min="0" max="85" value="${Math.round((c.wallpaper?.scrim ?? 0.35) * 100)}" data-ws-wp-range="scrim" /></label>
          </div>
        </div>

        <div class="gn-ws-card">
          <div class="gn-ws-card-title">4. 内置 Antigravity 全量汉化（面向国际用户可选）</div>
          <div class="gn-ws-row">
            <span>汉化模式：</span>
            <select data-ws-i18n="mode">
              <option value="auto" ${(c.i18n?.mode || 'auto') === 'auto' ? 'selected' : ''}>跟随系统语言（中文自动开启 / 海外自动英文）</option>
              <option value="neko-zh" ${c.i18n?.mode === 'neko-zh' ? 'selected' : ''}>哈基米萌系中文（猫窝风全量汉化）</option>
              <option value="zh" ${c.i18n?.mode === 'zh' ? 'selected' : ''}>标准专业中文（规范准确术语）</option>
              <option value="off" ${c.i18n?.mode === 'off' ? 'selected' : ''}>关闭 · 保留原版英文（零开销）</option>
            </select>
          </div>
          <div class="gn-ws-row">
            <span>自动汉化默认词库：</span>
            <select data-ws-i18n="autoChineseStyle">
              <option value="neko-zh" ${(c.i18n?.autoChineseStyle || 'neko-zh') === 'neko-zh' ? 'selected' : ''}>哈基米萌系中文（推荐）</option>
              <option value="zh" ${c.i18n?.autoChineseStyle === 'zh' ? 'selected' : ''}>标准专业中文</option>
            </select>
          </div>
          <div class="gn-ws-sub" style="margin-top:4px;">保留 Antigravity / Gemini 品牌与代码正文原样，切回「关闭」立即无损还原英文。</div>
        </div>
      </div>
    `;
  }

  function render() {
    const root = getRoot();
    root.classList.toggle('hidden', !state.open);
    if (!state.open) return;
    if (!state.config) {
      root.innerHTML = '<div class="gn-ws-card">正在读取 Gemineko Hive 主题引擎...</div>';
      return;
    }
    const c = state.config;
    const copyrightText = escWorkshopHtml(state.brand?.copyrightLine || 'Powered by Gemineko Hive · by AEmbers (Code: MIT · Artwork: CC BY-NC-SA 4.0)');
    const repoUrl = escWorkshopHtml(state.brand?.repoUrl || 'https://github.com/AEmbers/gemineko-hive');

    root.innerHTML = `
      <div class="gn-ws-head">
        <div>
          <div class="gn-ws-title">🏪 Gemineko Hive · 开放主题商店与创作工坊</div>
          <div class="gn-ws-sub">双层生态：官方旗舰《基米窝》 × 社区主题热插拔 × 一键打包导出投稿</div>
        </div>
        <div class="gn-ws-actions">
          <button type="button" class="gn-pill ${state.tab === 'store' ? 'is-active' : ''}" data-ws-tab="store">🏪 主题商店</button>
          <button type="button" class="gn-pill ${state.tab === 'workshop' ? 'is-active' : ''}" data-ws-tab="workshop">🎨 精细工坊</button>
          <button type="button" class="gn-pill" data-ws-act="toggle-enabled">${c.enabled ? '✅ 已开启' : '⚪ 已停用'}</button>
          <button type="button" class="gn-pill ${c.focusMode ? 'is-primary' : ''}" data-ws-act="toggle-focus">🧘 专注 ${c.focusMode ? '开' : '关'}</button>
          <button type="button" class="gn-pill" data-ws-act="reset">↺ 默认</button>
          <button type="button" class="gn-pill" data-ws-act="close">收起</button>
        </div>
      </div>

      <div class="gn-ws-status ${state.warning ? 'is-warn' : ''}">${escWorkshopHtml(state.warning || '调整或安装任意主题后，实时无损作用于 Antigravity 主窗口')}</div>

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
      const eggBtn = e.target.closest('[data-ws-egg]');
      if (eggBtn) {
        void triggerSidecarEgg(eggBtn.getAttribute('data-ws-egg'));
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

  return {
    isOpen: () => state.open,
    setOpen,
    toggle: () => setOpen(!state.open),
    loadConfig,
    pollEvents,
    triggerSidecarEgg,
  };
}
