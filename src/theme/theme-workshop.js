/**
 * @file 基米窝侧边栏「主题工坊」前端控制器与双向彩蛋联动模块。
 * 在打包阶段通过 build-bundle.mjs 内联至 dist/gemineko-hive.js。
 */

/**
 * 初始化侧边栏主题工坊面板与双向事件监听。
 * @param {{ hostApi: Function, sidecarBanner: (text: string) => void }} deps
 */
export function createThemeWorkshopController(deps) {
  let state = {
    open: false,
    config: null,
    presets: {},
    rolePalettes: {},
    lastEventSeq: 0,
    loading: false,
    warning: '',
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

  async function loadConfig() {
    if (state.loading) return;
    state.loading = true;
    try {
      const data = await deps.hostApi('/api/theme/config');
      if (data?.ok) {
        state.config = data.config;
        state.presets = data.presets || {};
        state.rolePalettes = data.rolePalettes || {};
        render();
      }
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
        if (data.warning) {
          showWorkshopToast(`已保存，但壁纸提示：${data.warning}`, true);
        } else {
          showWorkshopToast('✨ 已即时同步到 Antigravity 宿主窗口（<50ms）');
        }
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
        showWorkshopToast('已恢复默认「星空猫窝 / 跟随宿主」主题配置');
      }
    } catch {}
  }

  async function triggerSidecarEgg(type) {
    try {
      await deps.hostApi('/api/theme/event', {
        method: 'POST',
        body: JSON.stringify({ type, role: state.config?.accentMode === 'off' ? 'neon' : 'neon', source: 'sidecar' }),
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

  function render() {
    const root = getRoot();
    root.classList.toggle('hidden', !state.open);
    if (!state.open) return;
    if (!state.config) {
      root.innerHTML = '<div class="gn-ws-card">正在读取主题工坊配置...</div>';
      return;
    }
    const c = state.config;
    const presetItems = [
      { id: 'auto', name: '跟随宿主', swatches: ['#E8EEF6', '#0F101A', '#8B5CF6', '#EC4899'], badge: '自动日夜' },
      ...Object.values(state.presets || {}),
    ];
    const roles = [
      { id: 'follow-role', label: '跟随活跃角色（推荐）' },
      ...Object.values(state.rolePalettes || {}),
      { id: 'off', label: '原生强调色' },
    ];

    root.innerHTML = `
      <div class="gn-ws-head">
        <div>
          <div class="gn-ws-title">🎨 基米窝 · 5 角色二次元皮肤与全量汉化工坊</div>
          <div class="gn-ws-sub">角色专属母题纹样 × Overview 浮卡猫耳重绘 × 角落立绘纹章 × 可选 Antigravity 全量汉化</div>
        </div>
        <div class="gn-ws-actions">
          <button type="button" class="gn-pill" data-ws-act="toggle-enabled">${c.enabled ? '✅ 宿主主题已开启' : '⚪ 宿主主题已停用'}</button>
          <button type="button" class="gn-pill ${c.focusMode ? 'is-primary' : ''}" data-ws-act="toggle-focus">🧘 专注编码 ${c.focusMode ? '开 (0fps)' : '关'}</button>
          <button type="button" class="gn-pill" data-ws-act="reset">↺ 恢复默认</button>
          <button type="button" class="gn-pill" data-ws-act="close">收起</button>
        </div>
      </div>

      <div class="gn-ws-status ${state.warning ? 'is-warn' : ''}">${state.warning || '调整任意选项后 50ms 内实时作用于 Antigravity 主窗口'}</div>

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
          <div class="gn-ws-row" style="margin-top:10px;">
            <span>视觉浓度：</span>
            <select data-ws-field="themeIntensity">
              <option value="vivid" ${(c.themeIntensity || 'vivid') === 'vivid' ? 'selected' : ''}>浓郁二次元（猫耳/立绘/纹样全开）</option>
              <option value="balanced" ${c.themeIntensity === 'balanced' ? 'selected' : ''}>均衡日常（清透耐看）</option>
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
            <label><input type="checkbox" data-ws-wm-bool="enabled" ${c.watermark?.enabled !== false ? 'checked' : ''} /> 角落二次元角色立绘 + 旋转矢量纹章</label>
            <label><input type="checkbox" data-ws-link="roleSwitchAurora" ${c.linkages?.roleSwitchAurora ? 'checked' : ''} /> 切模型极光扫屏</label>
            <label><input type="checkbox" data-ws-link="composerBreathGlow" ${c.linkages?.composerBreathGlow ? 'checked' : ''} /> 思考/运行呼吸流光边框</label>
            <label><input type="checkbox" data-ws-link="errorHissShake" ${c.linkages?.errorHissShake ? 'checked' : ''} /> 工具报错「哈气」微抖提醒</label>
            <label><input type="checkbox" data-ws-link="taskFinishConfetti" ${c.linkages?.taskFinishConfetti ? 'checked' : ''} /> 长任务完成星尘礼花</label>
            <label><input type="checkbox" data-ws-link="pokeBurst" ${c.linkages?.pokeBurst ? 'checked' : ''} /> 连击5次「捅了基米窝」全员巡游</label>
            <label><input type="checkbox" data-ws-link="nightLamp" ${c.linkages?.nightLamp ? 'checked' : ''} /> 深夜猫窝小夜灯（23:00-05:00）</label>
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
            <button type="button" class="gn-pill" data-ws-egg="stardust-rain">🐾 炫彩 SVG 爪印雨 (Ctrl+Shift+M)</button>
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
            <input type="text" data-ws-wp-path="1" placeholder="粘贴本地图片/视频绝对路径 (png/webp/mp4/webm)..." value="${String(c.wallpaper?.filePath || '').replace(/"/g, '&quot;')}" />
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
              <option value="auto" ${(c.i18n?.mode || 'auto') === 'auto' ? 'selected' : ''}>跟随系统语言（中文自动开启 / 海外自动保持英文）</option>
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
          <div class="gn-ws-sub" style="margin-top:6px;">保留 Antigravity / Gemini 品牌与代码正文原样，切回「关闭」立即无损还原英文。</div>
        </div>
      </div>
    `;

    root.onclick = (e) => {
      const actBtn = e.target.closest('[data-ws-act]');
      if (actBtn) {
        const act = actBtn.getAttribute('data-ws-act');
        if (act === 'close') setOpen(false);
        else if (act === 'reset') void resetConfig();
        else if (act === 'toggle-enabled') void savePatch({ enabled: !c.enabled });
        else if (act === 'toggle-focus') void savePatch({ focusMode: !c.focusMode });
        else if (act === 'pick-wp') void pickLocalWallpaper();
        else if (act === 'pick-wm') void pickLocalWatermark();
        else if (act === 'apply-wp-path') {
          const inp = root.querySelector('[data-ws-wp-path="1"]');
          const fp = String(inp?.value || '').trim();
          void savePatch({ wallpaper: { ...(c.wallpaper || {}), mode: fp ? 'custom' : 'off', filePath: fp } });
        }
        return;
      }
      const presetBtn = e.target.closest('[data-ws-preset]');
      if (presetBtn) {
        void savePatch({ enabled: true, preset: presetBtn.getAttribute('data-ws-preset') });
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
      const field = target.getAttribute('data-ws-field');
      if (field) {
        void savePatch({ [field]: target.value });
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
    if (state.open && !state.config) {
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
