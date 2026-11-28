# 需求验收契约：Gemineko Hive 反重力启动动画（双模 0ms 强化）

## 1. 产品目标
为 Google Antigravity 桌面端提供兼顾**开箱即用**与**极限 0ms 零白屏**的「星钻 × 五哈基米」剧场级反重力启动动画，在每次冷启时提供约 2.6 秒的二次元主机级开机仪式感，并与当前主题预设与角色强调色实时联动。

## 2. 核心设计决策（已与用户对齐）
- **双模合一**：
  1. 默认启用 **CDP 宿主渲染层**（零改动 `app.asar`，随 Sidecar 挂载即生效，官方升级零失效）；
  2. 可选一键启用 **原生 `app.asar` 0ms 强化补丁**（独立标记块注入 `dist/preload.js`，不覆写已有 `app.asar.bak`，与 `chinese-toolkit` / `agy-meme` 安全共存，支持无损剥离）。
- **唯一剧场级主片头（不做视频导入）**：反重力星尘升腾 + 1024px 3D 棱镜星钻绽放 + 5 位真实哈基米 APNG 立绘沿星轨亮起环绕 + `ANTIGRAVITY × GEMINEKO HIVE` 炫彩字标。
- **节奏与交互礼仪**：总时长 ~2.6s（60fps），同会话冷启仅自动播 1 次；任意点击 / `Esc` / `Space` / `Enter` 在 220ms 内瞬时淡出跳过；遵守 `cfg.enabled`、`cfg.focusMode`、`cfg.motionLevel !== 'off'` 与 `cfg.startup.enabled`；主窗口快切栏与精细工坊均支持「重播预览」。
- **声音仪式感**：
  - `assets/audio/startup-chime.mp3`：纯净星晶反重力开机音效；
  - `assets/audio/startup-welcome.mp3`：固定招牌猫娘开机语音「欢迎回窝，反重力星钻已就绪喵~」；
  - 支持在工坊单独开关音效与语音，且受全局 `easterEggs.soundEnabled` 约束。
- **智能双轨无缝收尾**：
  - 落在首页且 `#gemineko-home-emblem .gk-he-stage` 可见时，片头星钻精准缩放飞行融合落位到首页大星钻 Logo；
  - 落在历史对话页时，星钻化作反重力棱镜光浪向上浮散退场。

## 3. 拟新建 / 扩展模块
- 新增：`src/cdp/host-startup-runtime.mjs`、`src/startup-asar-patcher.mjs`、`assets/audio/startup-chime.mp3`、`assets/audio/startup-welcome.mp3`
- 扩展：`src/theme/host-theme-config.mjs`、`src/cdp/host-injector.mjs`、`src/cdp/host-theme-runtime.mjs`、`src/sidecar/server.mjs`、`src/theme/theme-workshop.js`、`bin/gemineko-hive.mjs`、`tests/gemineko-hive.test.mjs`
