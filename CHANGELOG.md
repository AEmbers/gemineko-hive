# Changelog

## [0.7.8] - 2026-11-27

### Fixed
- **修复主对话区活跃工具/思考折叠行处于收起态时不显示行内小猫立绘的 Bug**：
  - [host-injector.mjs](src/cdp/host-injector.mjs) 中 `isInsideChecklistOrCard()` 放行活跃的 `[data-testid="tool-group-collapsible"]` 与 `[data-testid="thinking-collapsible-trigger"]` 触发按钮（继续保留对步骤清单 `ol/ul/li`、变更文件卡、产物卡及历史 `worked-for-collapsible` 折叠条的隔离）；
  - `syncActiveStatusSprite()` 优先锚定收起态的 `tool-group-collapsible` / `thinking-collapsible-trigger` 按钮行，微调行内立绘至 `30px` 高度与按钮齐平，并补充 `Editing` / `Reading` / `Searching` / `Writing` 及对应中文进行时文本兜底。

## [0.7.7] - 2026-11-27

### Changed & Fixed
- **彻底消除小猫 Dock 立绘、状态气泡与侧栏头像发糊，开放三项尺寸可调滑条与左右停靠**：
  - **消除立绘与气泡发糊**：默认将主窗口小猫放大至 `88×88px`、侧栏与消息板头像放大至 `64×64px`、状态气泡文字默认缩放 `115%`，移除叠在 4 帧 APNG 之上的 CSS 小数位 `scale/rotate` 亚像素抖动动画，提升气泡背景不透明度与字体清晰度（`text-rendering: geometricPrecision`），并在 [server.mjs](src/sidecar/server.mjs) 的 APNG 缩放流程引入 Premultiplied Alpha Lanczos + 轻度 RGB 锐化（缓存升级 `-v2` 后缀）；
  - **支持立绘 / 气泡 / 侧栏头像尺寸自由调节**：[host-theme-config.mjs](src/theme/host-theme-config.mjs) 新增 `dock` 配置对象（`side`、`catSize`、`badgeScale`、`sidecarAvatarSize`），在侧栏「精细工坊」（[theme-workshop.js](src/theme/theme-workshop.js)）及主窗口 🎨 快切浮层（[host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs)）提供 0 延迟实时预览滑条；
  - **防压进输入框 + 开放输入框左右停靠切换**：[host-injector.mjs](src/cdp/host-injector.mjs) 新增 `ResizeObserver` 监听 Dock 尺寸变化，将 Dock 严格锚定在输入框正上方 `2px` 处（无论如何放大均向上生长、绝不压入输入区），新增 **`⬅ 输入框左侧` / `输入框右侧 ➡`** 停靠切换（右侧模式自动 `row-reverse` 镜像布局），同步修正快切浮层、摸头吐槽气泡、表情库弹窗与收工贴纸（[host-meme-runtime.mjs](src/cdp/host-meme-runtime.mjs)）的左右视口防溢出定位。

## [0.7.6] - 2026-11-27

### Changed & Fixed
- **立绘 `384×384` / `512×512` / `1024×1024` 三档清晰度自由切换（`512px` 母版 + Sidecar 按需无损缩放缓存）**：
  - 将全部 35 张角色×动作动态 APNG 立绘（+ 5 张别名）由 `621~1024px` 原画无损升级导出至 **`512×512`** 仓库母版（[build-animated-sprites.mjs](scripts/build-animated-sprites.mjs) 默认 `size=512`，完整吃满原画单帧细节），同时兼容首页 `1024×1024` 双星钻；
  - [host-theme-config.mjs](src/theme/host-theme-config.mjs) 新增 `spriteQuality` 配置项（`'384' | '512' | '1024'`，默认 `'512'`）；[server.mjs](src/sidecar/server.mjs) 的 `/gemineko-sprites/*.png?q=` 支持按需通过 Pillow LANCZOS 生成并原子缓存 `384` / `1024` 多帧 APNG 至 `~/.gemini/gemineko-hive/sprite-cache/`（并发单飞去重 + 二次命中 `<1ms`，异常优雅回退 `512` 母版）；
  - 在「精细工坊」（[theme-workshop.js](src/theme/theme-workshop.js)）与主窗口小猫 Dock 快切浮层（[host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs)）提供 **`轻量 384px` / `超清 512px` / `极致 1024px`** 三档一键切换，联动 [gemineko-runtime.js](src/theme/gemineko-runtime.js) 与 [host-injector.mjs](src/cdp/host-injector.mjs) 即时刷新 `?q=<tier>&v=0.7.6`（附 `localStorage` 兜底兼容未重启的旧 Sidecar 进程）。

## [0.7.5] - 2026-11-27

### Fixed
- **重构猫爪大纲按钮为对话区右缘可拖拽磁吸书签（根治与右侧面板顶栏控件重叠）**：
  - 将 `#gemineko-paw-outline-fab` 从固定在全屏右上角 `top: 96px; right: 18px` 改为使用 `ResizeObserver` 实时追踪 `[data-testid="conversation-view"]` 右边界的贴边纤细书签耳签（`24×42px`，悬停/展开平滑向左伸出至 `32px`）；
  - 默认停靠在对话区右侧中腰（`48%` 高度），支持上下拖拽并持久化至 `localStorage`，彻底避开顶部工具栏与右侧 `Files Changed` / Sidecar 面板，无对话视口时自动隐藏，弹窗同步智能向左侧就近展开。
- **彻底修复行内动态立绘在 `update_steps` 步骤卡片与底部状态行之间来回闪现**：
  - [host-injector.mjs](src/cdp/host-injector.mjs) 的 `syncActiveStatusSprite()` 新增 `isInsideChecklistOrCard()` 排除清单列表、工具/产物折叠卡及带边框的多行任务卡片，同时拦截跨 `90px` 以上的瞬态向上回跳，将小猫立绘稳稳锁在最底部真实活跃状态行旁。
- **彻底打通插件内全量动态字号缩放（侧边栏 + 商店/工坊 + 主窗口浮层 + 旧 Sidecar 兼容）**：
  - **补全 `gemineko-theme.css` 剩余固定像素规则**：消除 `.gn-bar` 的 `clamp(..., 13.5px)` 上限，为 `.gn-brand`、`.gn-live-sub`、`.gn-seg`、`.gn-phase-badge`、`.gn-action-chip`、`.gn-store-tag`、`.gn-store-footer`、`.gn-update-banner`、`.gn-setting-label` 及 `.graph .node-label` 等全部组件接入 `var(--gn-font-scale)` 矢量缩放，并在 `A- / A+` 中间加入实时字号读数徽标 `.gn-font-val`；
  - **增加 `localStorage` 韧性兜底（`gemineko_typography_v1` / `gemineko_host_typography_v1`）**：兼容尚未重启的旧版 Sidecar 后台进程（回包未带 `typography` 字段），避免点按 `A+` 或拖动滑条后被服务端回包或 4 秒轮询回弹到默认字号；
  - **主窗口全量插件浮层联动缩放**：为 [host-injector.mjs](src/cdp/host-injector.mjs)、[host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs) 与 [host-meme-runtime.mjs](src/cdp/host-meme-runtime.mjs) 内的 Dock 徽标、快切浮层、猫爪大纲、代码块吸顶栏、右键菜单、对话气泡与表情选择器全面接入 `var(--gk-host-font-scale)`。
- **修复戳一戳对话气泡固定左下角的定位 Bug**：
  - [host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs) 升级 `showSpeechBubble` 与 `onDockPoke`，支持优先锚定被点击角色按钮或鼠标点击坐标，在角色头顶正上方弹出带 `--gk-tail-x` 指向小尾巴且随角色主题变色（`--gk-bubble-accent`）的气泡，靠近窗口顶部时自动向下翻转并防出屏裁切。
- **调优猫娘表情积极触发节奏与客户端自动收工贴纸**：
  - [rules/AGENTS.md](rules/AGENTS.md) 将日常问答、接梗与任务收工（含 Plan-Execute 收尾）调整为默认主动调用 `send_meme` 配 1 张贴切贴纸，中途执行期仍保持专注不刷屏；
  - 将 [host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs) 的自动撒花与收工贴纸触发阈值从 `8s` 降至 `4s`，并优化 [host-meme-runtime.mjs](src/cdp/host-meme-runtime.mjs) 中 Dock 隐藏时的浮层锚点回退与 `5.5s` 展示时长。
- **修复蜂窝立绘模糊锯齿并联动字号缩放全端立绘与图标**：
  - 解除原生 `styles.css` / `hive.css` 注入的 `image-rendering: pixelated` 锯齿采样，为 [gemineko-theme.css](src/theme/gemineko-theme.css) 中所有 25 态 Q 版立绘与图标（`.gn-sprite-img`、`.gn-live-avatar`、`.gn-brand-dot`、`.msg-av.bee img.gn-msg-avatar`、`.graph .node-bee` 等）恢复平滑重采样 `image-rendering: auto !important`（像素画风 `.is-pixel` 保留像素风）；
  - 将消息板头像由 `24×24`（`32×28` 非正方框）扩大至 `46px × var(--gn-font-scale)`（默认约 `50×50px`，悬停放大 `1.22×`），成员/总览/关系图 `.beebox`、顶栏徽标与实时头像同步跟随 `--gn-font-scale` 缩放；
  - 将 [host-injector.mjs](src/cdp/host-injector.mjs)、[host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs) 与 [host-meme-runtime.mjs](src/cdp/host-meme-runtime.mjs) 中的 Dock 猫娘、行内小猫、首页角色、猫爪大纲球与表情缩略图全部联动 `var(--gk-host-font-scale)` 缩放。

### Changed & Upgraded
- **品牌视觉终极升级（「钻石级四芒光学棱镜沉睡 Neon 哈基米」原生 `1024×1024` 无损直出 × `208×208` 中心透空防冲白流光）**：
  - **首页大 Logo（`assets/sprites/home-star-gem-light.png` / `home-star-gem-dark.png`）**：保持原画原生 **`1024×1024` RGBA 满分辨率** 零压缩精抠（去黑边色溢，深色版外轮廓叠 `10px` 冰蓝→极光紫辉光），并改为由 Sidecar `/gemineko-sprites/*.png` 本地 HTTP 直接加载（彻底消除巨型 Base64 对 CDP 注入脚本的体积膨胀）；
  - **插件图标（`assets/logo.png`）**：同款钻石棱镜沉睡猫娘置入深邃星夜靛紫微光玻璃底，保持高对比度与多尺寸辨识；
  - **四层不糊脸流光引擎 & 炫彩标题加固（[src/cdp/host-theme-runtime.mjs](src/cdp/host-theme-runtime.mjs)）**：首页 `#gemineko-home-emblem` 升格为 `208×208px` Hero 级悬浮舞台，浅色采用 `mix-blend-mode: overlay` 配合中心镂空径向遮罩（仅在棱镜外圈切面流转极光，100% 透出清晰哈基米五官）；同时为欢迎问候标题自动注入 `data-gk-home-title="1"` 并全节点恢复流动炫彩棱镜渐变字效，左上角 `28px` 发光纯白猫爪按钮保持不变。

## [0.7.4] - 2026-11-27

### Fixed
- **彻底修复 `auto` 模式下《基米窝》侧边栏自锁深色的 Bug**：
  - 移除 `syncSidecarHostTheme()` 中误写宿主 `data-theme` 属性的逻辑，改为只读侦测宿主原生 `data-theme` 与 `--background` 亮度并仅写入插件自有 `data-gn-scheme` / `data-gn-preset`；
  - 增加 `document.documentElement[data-theme]` 监听并在 `html[data-gn-scheme="light"]` 补充覆盖 `--sw-hover` / `--sw-press` / `--sw-fill` / `--sw-field` / `--sw-success` / `--sw-warning`，确保即便先切过纯黑深色再切回 `auto` 或浅色基底，侧边栏也能立即恢复纯粹浅白。
- **修复 `exit_plan_mode` / `enter_plan_mode` 误显「等你拍板」的 Bug**：
  - 将 `src/activity-tracker.mjs` 的 `ASK_TOOLS` 收窄为仅包含 `ask_question`，避免内部规划阶段切换被归类为 `'asking'`（「等你拍板」），统一归入 `'thinking'`（「思考中」）。

## [0.7.3] - 2026-11-27

### Added & Refined
- **全端动态字体大小调节（双滑条 + 4 档护眼快切 + 顶栏 `A- / A+`）**：
  - [host-theme-config.mjs](src/theme/host-theme-config.mjs) 新增持久化配置项 `typography`（`sidecarFontSize`: 侧栏与插件字号 `11~22px`，默认提升至更易读的 `14px`；`hostFontScale`: Antigravity 主窗口全局字号缩放 `85%~135%`，默认 `100%`）；
  - **基米窝侧边栏 & Swarm 面板**：新增 `--gn-font-scale` 矢量缩放与 Swarm `--text-*` 变量实时联动，并在顶栏提供 **`A-` / `A+`** 一键微调按钮；
  - **精细工坊 & 主窗口浮层**：在「精细工坊」新增 **紧凑 (12px) / 标准 (14px) / 护眼 (16px) / 大字 (18px)** 一键预设及双滑条实时拖拽预览，主窗口小猫 Dock 快切浮层同步新增 4 档字号按钮；
  - 顺带在 `host-injector.mjs` 行内立绘追踪中排除左侧栏会话行内的 spinner，进一步防止误挂。

## [0.7.2] - 2026-11-27

### Fixed & Upgraded
- **彻底修复对话流内活跃小猫立绘「丢立绘 & 误挂到历史工具条」**：
  - `syncActiveStatusSprite()` 改为优先追踪主窗口原生 `[data-testid="status-loading-spinner"]` / `[class*="animate-shimmer"]` 实时信号（完美覆盖 `update_focus` 等动态焦点文案，避免找不到固定英文词时丢立绘）；
  - 空闲时立刻清场，兜底文本扫描彻底移除易误中已完成文件记录的 `爪子狂敲` / `编辑中` 等过去式短语并拦截含 `[+-]\d+ [+-]\d+` 的行，将行内立绘精修为 `34×34px`。
- **实现《基米窝》侧边栏明暗主题与强调色实时跟随主窗口（<50ms）**：
  - 侧边栏运行时新增 `syncSidecarHostTheme()`：在初始化、每 4 秒同步及商店/工坊操作回调中读取最新主题配置，同步写入 `data-gn-scheme` / `data-gn-preset` / `data-theme` 并直接覆写 Swarm 原生 `--sw-bg` / `--sw-card` / `--sw-fg` 等变量（支持 `nebula-day` 纯白、`cream-paper` 暖米纸、`starry-nest` 深邃星云与 `carbon-obsidian` 纯黑曜石），解决浅色模式下侧边栏依然漆黑的割裂感。
- **按高定光学玻璃美学重做「🏪 主题商店 × 🎨 精细工坊」视觉与控件**：
  - 重构全套明暗语义变量表与镜面流光卡片，彻底清除深色下白底白字；
  - 「主题商店」新增每套主题的 **54px 实时迷你 UI 缩略预览窗（`.gn-store-preview`）**，并将第三方导入与打包导出收纳为可折叠抽屉；
  - 「精细工坊」所有开关升级为现代 iOS/macOS 滑动开关（`.gn-switch`），基底预设按钮配备双色缩略色卡，统一定制滑动条与下拉控件样式。

## [0.7.1] - 2026-11-27

### Fixed
- **彻底修复「星空猫窝」与「碳晶黑曜」切回后仍泛绿且缺乏区分度问题**：
  - 修复在「主题商店」体验《翡翠矩阵》（`cyber-emerald-matrix`）后再点击「星空猫窝」「碳晶黑曜」等基底预设时未重置 `activeThemePackId`、导致社区绿包持续覆盖 5 角色原色的隐患；
  - 恢复 `optical-neko` 下三套基底的标志性色阶：`starry-nest` 采用 `#101225` / `#0A0C1A` 深邃蓝紫星云，**`carbon-obsidian` 全面回归 `#07080B` / `#040406` 极致纯黑曜石与冷银镜面高光**，`cream-paper` 保持 `#FCF8F0` 暖米纸；
  - 在「🏪 主题商店」首屏补充 **`official-carbon-obsidian`（碳晶黑曜 · 纯黑高定官方深色）** 直选卡片（不硬写单色，保留 5 角色炫彩极光流转）。
- **修复深色模式下侧边栏「精细工坊」局部文字白底白字看不清的问题**：为 `.gn-workshop-drawer`、`.gn-ws-card` 与 `.gn-ws-sub` 显式指定高对比深靛字色。

## [0.7.0] - 2026-11-27

### Added & Upgraded
- **从单一皮肤插件正式升级为开放式「Gemineko Hive 主题引擎 × 社区主题商店」**：
  - 新增单点品牌元数据 [src/meta/brand.mjs](src/meta/brand.mjs) 与双层版权声明（源码保持 `MIT`，[LICENSE](LICENSE) 追加原创美术/立绘/3D 星钻 `CC BY-NC-SA 4.0` 非商用署名协议）；
  - 新增社区主题包引擎 [src/theme/theme-store.mjs](src/theme/theme-store.mjs) 与商店索引 [themes/registry.json](themes/registry.json)（内置官方旗舰 `official-gemineko` 与《京都樱吹雪》《翡翠矩阵》《暖金琥珀》三款完整可玩社区示例包）；
  - 支持从 GitHub Raw / Gist 链接（自动改写 `github.com/.../blob/...`、严格 HTTPS 与防 SSRF 校验）或本地 `.gemineko-theme.json` 安装、激活与卸载第三方主题包；内置严格 `customCss` 与 CSS 变量消毒（剥离 `@import`、`javascript:`、`expression(`、`</style>` 与 `data-has-browser-hole`）；
  - 侧边栏升级为双 Tab **「🏪 主题商店 × 🎨 精细工坊」**，支持一键将当前配置导出打包为 `.gemineko-theme.json` 并直达 GitHub 投稿模板（[.github/ISSUE_TEMPLATE/theme-submission.yml](.github/ISSUE_TEMPLATE/theme-submission.yml) 与 [docs/THEME_AUTHORING.md](docs/THEME_AUTHORING.md)）。
- **GitHub 生态增长闭环与版权署名露出**：
  - 新增 [src/sidecar/github-pulse.mjs](src/sidecar/github-pulse.mjs) 与 `/api/github/status`、`/api/store/*`、`/api/open-external` 路由：6 小时缓存静默检测 GitHub 最新版本与实时 Star 数，发现新版时在侧边栏顶部展示带更新页与一键更新命令复制的渐变动效横幅，并常驻 `⭐ Star` 胶囊按钮调起系统浏览器直达仓库；
  - 首页底部与商店页脚温和署名 `Powered by Gemineko Hive · by AEmbers` 及当前社区主题原作者署名，不侵扰代码与对话内容流。

## [0.6.6] - 2026-11-27

### Fixed
- **重构 `ask_question` 提问舞台为无损 CSS Grid「上题目 / 左下哈基米 / 右下选项」并同步真实编号气泡**：
  - 针对宿主 React `Fragment` 将 `<style>`、选项组（`role="radiogroup"` / 多选列表）与底部 `Other / Skip / 提交` 行同级平铺在 `flex-col` 容器内的真实结构，在不改变 React 节点父子关系（零卸载崩溃风险）的前提下，将 `.gk-ask-split-row` 升级为 `display: grid; grid-template-columns: 108px minmax(0, 1fr)` 并配合 `--gk-ask-rows` 跨行对齐，彻底修复旧版 `flex-col` 覆盖导致哈基米居中偏右独占整行的问题；
  - 重写 `findActiveAskQuestionPanel()` 与 `syncAskQuestionStage()`：精准识别 `label[data-testid="ask-question-option"]`、`[data-testid="ask-question-writein"]` 与 `[data-testid="ask-question-header-text"]`，按选项真实快捷徽章（如 `1? 2? 3? 4?` 或 `A? B?`）渲染思考气泡，支持悬停/聚焦实时高亮及多题切换（`optList` 重建）自动重挂载。

## [0.6.5] - 2026-11-27

### Changed & Restored
- **左上角小图标无损还原为「流动炫彩圆角宝石方框 × 发光纯白猫爪星芒」**：
  - 恢复 `v0.6.2` 备受好评的 `[data-testid="app-icon-new-conversation-button"]` 造型（`28×28px` 圆角炫彩宝石底座 + `19×19px` 发光纯白猫爪与右上星芒）；
- **空白首页正中央主 Logo 升级为「电影级 4 层视差裸眼 3D 晶透猫耳星钻」**：
  - 预渲染浅/深双色高透 3D 立体晶透猫耳星钻素材，经外部四向泛洪抠图生成 `256×256` RGBA 透明贴图（`assets/sprites/home-star-gem-light.png`、`home-star-gem-dark.png`），并内联至主题运行时按 `data-gk-scheme="light" / "dark"` 无缝切换；
  - 构建 `#gemineko-home-emblem` 真实 3D 透视舞台（`116×116px`、`perspective: 680px`、`preserve-3d`），由底部霓虹彩虹焦散投影层（`translateZ(-22px)`）、核心 3D 晶透猫耳星钻本体（`translateZ(0px)`）、随轮廓裁剪的前景高光追踪扫光层（`translateZ(14px)`）与最前景悬浮伴生碎星（`translateZ(28px)`）组成，实现常态 `gkGem3DFloat` 裸眼 3D 微摆及鼠标 380px 内实时 3D 倾角、反方向焦散位移与棱镜高光追踪效果。

## [0.6.4] - 2026-11-27

### Changed
- **首页主视觉与左上角 Brand Logo 升级为「立体多切面炫彩猫耳星钻（✦）」**：
  - 移除旧版“正圆圈包猫爪”与“方底盒白猫爪”样式，以 Gemini 凹弧四角星钻 `✦` 为主骨重构 `buildHomeBrandCatUri`（120×120 珠宝级 8 切面冰青→蓝→紫→樱粉→香槟金折射切面 + 晶透猫耳尖 + 斜向轻盈星轨 + 伴生碎星）与 `buildTopBrandPawUri`（24×24 精简星钻）；
  - `#gemineko-home-emblem` 升级为 `96×96`，加入随星钻轮廓精准裁剪的斜向镜面扫光（`gkGemSheenSweep`）、错相闪烁伴生碎星（`gkStarTwinkle`）及点击瞬间绽放撒星微粒彩蛋（`is-sparkling`）。

## [0.6.3] - 2026-11-27

### Fixed & Refined
- **去除 `optical-neko` 下思考折叠条/文件变更卡的突兀紫框（保留行内字块与胶囊角色高亮）**：
  - 将 `[data-testid="thinking-collapsible-trigger"]`、`[data-testid="worked-for-collapsible"]`、`[data-testid="tool-group-collapsible"]` 与 `[data-testid="changed-files-card"]` 在 `optical-neko` 模式下收敛为极净透明或中性玻璃边框（保留行内 `code` / 实体胶囊随角色配色的柔美高亮，保留 `vivid` 浓郁模式原样）；
- **提升浅色 `optical-neko` 下右下角水印猫娘清晰度**：
  - 浅色模式下 `#gemineko-corner-watermark` 透明度提升至 `clamp(0.32, var(--gk-watermark-opacity) * 2.8, 0.52)`，配合 `saturate(1.22) contrast(1.06)` 与白底玻璃名牌，深色模式保持不变；
- **消除小猫 Dock 与最后一条消息操作按钮拥挤**：
  - `[data-testid="autoscroll-viewport"] > div:last-child` 增加 `padding-bottom: 72px`，同时将左下小猫 Dock 立绘精炼至 `58×58` 贴肩坐姿；
- **全量补齐 Settings 多标签页与对话流折叠工具条汉化（`src/cdp/host-i18n-runtime.mjs`）**：
  - 覆盖 `Models & Usage`（模型与配额/订阅方案/AI 额度/`Orchestrator Settings`/配额重置时间 `天/小时/分钟` 换算）、`Appearance`、`Notifications`、`Browser`、`Application`、`Shortcuts` 全部设置内页，并补齐 `Explored` / `Explored files` / `Ran commands` 等工具条译文（严格保留 `Ctrl`/`Shift`/`Alt`/`Enter`/`Antigravity`/`Gemini`/`Claude`/`GPT` 原文）。

## [0.6.2] - 2026-11-27

### Fixed & Changed
- **彻底根治深/浅色对话区底部极光横向硬切边**：
  - 透明化滚动区底端原生 `48px` 实色遮罩条（`[data-testid="conversation-view"] div.absolute.bottom-0.z-10.pointer-events-none:empty`），改为 `[data-testid="autoscroll-viewport"]` 上下双向透明渐隐 `mask-image` 透出下方连续极光；
  - 为 `#gemineko-conv-aurora` 增加顶部平滑羽化遮罩，并使用 `[id="antigravity.agentSidePanelInputBox"]` 稳定透明化输入框外层黑底壳，物理级消除横切黑带；
- **浅色 `optical-neko` 纯白焦点对比与流动炫彩重构（深色主题保持高分暗夜质感）**：
  - 浅色模式下画布全面回归纯粹雪白 `#FFFFFF`（同步覆写 `--background` / `--content` / `--card`）、侧栏回归清爽冷银白 `#F4F6FA`，大面积纯白留白衬托各区域单一高色差炫彩流动光学焦点；
  - 底部极光收拢至 `38%` 化作双层异步漂移高透炫彩极光浪（`gkAuroraFlowDriftA` / `gkAuroraFlowDriftB`，运行态 `data-gk-active="1"` 自动提速），输入框/Overview 顶部采用 `1.5px` 流动棱镜光丝（`gkPrismHairlineFlow`），侧栏选中项左侧配 `3px` 垂直流动棱镜光针（`gkPrismVerticalFlow`）；
- **两处官方 Brand Logo 全量替换 + 首页问候补全**：
  - 左上角 `[data-testid="app-icon-new-conversation-button"]` 替换为《基米窝》发光炫彩猫爪星芒宝石徽章；
  - 空白首页中央改用真实 HTML 实体徽标节点 `#gemineko-home-emblem`（解决 `<svg>` 不支持 CSS 伪元素导致隐藏原图腾后留白问题），渲染 `92×92` 背光呼吸晕 + 旋转炫彩棱镜环 + `66×66` 悬浮猫耳水晶徽标，并同步打通首页 `.agy-home` 底部流动极光浪；`host-i18n-runtime.mjs` 补齐 `Hey <name>, what should we build today?` 等首页问候句式并赋予流动渐变标题；
- **修复侧边栏戳一戳气泡被左侧边界裁切**：
  - `src/theme/gemineko-runtime.js` `spawnBubbleAt` 改为挂载后按 `offsetWidth` / `offsetHeight` 与视口宽高比精准夹紧，`.gn-float-bubble` 支持安全换行不越界。

## [0.6.1] - 2026-11-27

### Changed
- **重铸 `optical-neko`（光学高定哈基米）真·长过渡光学引擎**：
  - 彻底清除 `optical-neko` 模式下的侧栏粉紫染色、2.5px 实心彩虹顶条、硬紫边与荧光粉紫实心「开启新喵聊」按钮，回归 5 级冷白（`#F5F8FC`/`#EAF0F8`）与深曜（`#0D0F14`/`#090B0F`）通透中性玻璃分层；
  - 将顶栏/输入栏/Overview 顶条升级为 `1px` **7 阶两端渐隐至 0% 的超长棱镜折射光丝（`--gk-optical-hairline`）**，将「开启新喵聊」重绘为支持 `background-clip: padding-box, border-box` 的通透水晶玻璃按钮；
  - 将对话区底部 `#gemineko-conv-aurora` 极光拉高至 `46%`，叠加 **6 阶大气散射长过渡 + 42px 柔焦双核极光幕（`gkAuroraHorizonBreath`）+ 底部白核折射辉光**，形成无硬边的液态地平线雾晕；
  - 新增纯 GPU 零 DOM 侵入的 **鼠标跟随 300px 6 阶角色棱镜色散光边**（`onRimPointerMove` 单 rAF 节流 + `220px` 距离平滑衰减 `--gk-rx`/`--gk-ry`/`--gk-rim-alpha`），鼠标经过输入框、Overview 卡、新喵聊按钮、用户气泡与侧栏选中项时泛起细腻的角色色散高光；
  - `vivid`（浓郁二次元）与 `minimal`（极简专注）模式保持原样不变。

## [0.6.0] - 2026-11-27

### Added & Changed
- **新版三视觉模式（新默认 `optical-neko` 光学高定哈基米）**：
  - `src/theme/host-theme-config.mjs` 将视觉模式重构为 `optical-neko`（新默认 · 光学高定哈基米）/ `vivid`（浓郁二次元）/ `minimal`（极简专注），旧值 `balanced` 平滑映射至 `optical-neko`；
  - `src/cdp/host-theme-runtime.mjs` 的 `optical-neko` 模式借鉴 Obsidian Prism 的大留白与高透光影，移除满屏平铺花纹，以通透毛玻璃、大半径柔散阴影、1px 镜面顶边高光、边缘角色极光雾晕及极简柔焦无环透明立绘呈现“看起来极简却满是哈基米灵魂”的视觉体验。
- **提问模式 (`ask_question`) 抱臂仰头思考舞台 + 5 枚全新 `*-ponder.png` 动态 APNG**：
  - 生成并构建 `assets/sprites/{neon,hydrogen,carbon,claude,gpt}-ponder.png`（128×128 RGBA 4 帧无限循环透明 APNG，「双手抱在胸前、微微仰头思考」姿态）；
  - 活跃 `ask_question` 面板自动隐藏原左下 Dock 避免遮挡，并渲染为「上方问题 / 左下抱臂仰头立绘 + 头顶 `A? B? C? D?` 轮盘高亮气泡（仅 1 项点亮、悬停右侧选项实时锁亮对应字母） / 右下选项」。
- **表情插件全链路集成（免改 ASAR + 闲聊/收工节奏发贴纸）**：
  - `src/sidecar/server.mjs` 新增 `/api/memes/list` 与 `/api/memes/file/*`（安全复用本机 `~/.gemini/meme-packs/gemini-neko` 贴纸库并防目录穿越）；
  - 新建 `src/cdp/host-meme-runtime.mjs`：免改 ASAR 原地将聊天 `[表情: ...]` 渲染为高清透明贴纸，支持长任务收工汇报自动弹贴纸气泡（工作中禁弹）与分类表情拾取面板；同步将爪印雨快捷键调整为 `Ctrl+Shift+P` 彻底避开 `Ctrl+Shift+M` 冲突；
  - 更新 `rules/AGENTS.md` 明确“一问一答闲聊与最终收工汇报发 1 张表情，工作中途不发”。

## [0.5.1] - 2026-11-27

### Added & Changed
- **5 角色二次元视觉母题全量宿主皮肤（浓郁二次元开箱即用 + 3 档浓度随切）**：
  - `src/theme/host-theme-config.mjs` 新增 `themeIntensity`（默认 `vivid` 浓郁二次元，可选 `balanced` 均衡日常 / `minimal` 极简专注）、5 角色母题定义（`NEON · GEMINEKO` 虹光星芒飘带、`HYDROGEN · GEMINI` 薰衣草粉金星雾、`CARBON · GRAPHENE` 石墨烯六边形晶格与五彩黑、`CLAUDE · MAID` 暖奶油菊花蕾丝、`GPT · SOL DRAGON` 白紫星辰龙鳞）以及 `watermark` 角落立绘水印配置（`validateWatermarkImagePath` 严格图片白名单）。
  - `src/cdp/host-theme-runtime.mjs` 全界面重绘覆盖顶部菜单栏（`[data-testid="title-menu-bar"]` / `[data-testid="pane-titlebar-toolbar"]`）、修复内层 `.bg-sidebar` 盖色、重绘渐变 `new-conversation-button` / `project-header`、重点美化的悬浮 **`Overview` 卡片（`[data-testid="overview-panel"]` 及其外层容器带随角色变色双猫耳尖 + 虹光顶条 + 计数星徽胶囊）**、对话流引用块/表格/行内代码/气泡、输入栏与弹窗。
  - 新增 `#gemineko-corner-watermark` 角落透明底动态 APNG + 旋转角色专属 260×260 SVG 矢量纹章水印，支持 `follow-role` / 指定 5 角色 / `/api/watermark/file` 本地透明 PNG/WebP 导入；升级「爪印星尘雨」为 32~36 颗 `24px~38px` 彩色外发光内联 SVG 肉垫/星芒/晶棱雨；
  - 将宿主四点旋转运行指示器 `[data-testid="status-loading-spinner"]` 及 `.animate-shimmer-text` 纳入主题体系（支持 `role-motif` 5 角色专属旋转星徽、`paw-bounce` 弹跳发光猫肉垫、`prism-dots` 炫彩四色旋转点阵及 `native` 原版切换，并高亮侧栏运行中对话行）。
- **交互细节与全内页汉化补全（v0.5.1-fix）**：
  - `src/cdp/host-injector.mjs` 与 `src/cdp/host-theme-runtime.mjs`：空白首页显示 `#gemineko-home-stage`（5 角色迎宾舞台）时自动隐藏左上沿小猫 Dock，消除相互遮挡；迎宾舞台内置「🎨 主题/汉化」直达快切钮，切入对话页自动恢复 Dock；
  - `src/cdp/host-i18n-runtime.mjs`：放行对话流内系统折行卡（`Worked for` / `steps` / `files changed` / `Review`）同时保持 `planner-response-text` / `user-message-bubble` / `pre` / `code` 正文保护；补充首页问候、工作区栏、Settings 设置弹窗全内页中英对照词典及小写 `just now`；
  - `src/cdp/host-injector.mjs`：输入栏 Dock 胶囊将截断的冗长模型 ID 改为简短元素名/X基米（`氢基米`/`碳基米`/`氖基米` 等，英文模式对应显示 `Hydrogen`/`Carbon`/`Neon`，悬停显示完整模型 ID）。
  - 默认 `i18n.mode: 'auto'`：中文系统自动开启哈基米萌系中文（`neko-zh`），海外英文环境默认零开销完全关闭（`off`）；支持 `auto` / `neko-zh` / `zh`（标准专业中文）/ `off`（原版英文）4 档秒级无损切换。
  - 使用 `WeakMap` 记录首次修改前原始文本与属性，严格排除聊天正文、`pre`、`code`、`.monaco-editor`、输入编辑框及 `Antigravity` 品牌字样；切回 `off` 完整还原并断开 `MutationObserver`。
- **服务端与工坊联动**：
  - `src/sidecar/server.mjs` 新增 `/api/watermark/pick` 与 `/api/watermark/file`；`src/theme/theme-workshop.js` 与宿主快切浮层均补齐「视觉浓度」「角落立绘水印」「内置全量汉化 4 档」控制，且完整宿主皮肤与汉化逻辑保留在 `src/cdp/` 不膨胀主包体（`dist/gemineko-hive.js` 仍 `< 420 KB`）。

## [0.5.0] - 2026-11-27

### Added
- **《基米窝》原生 Antigravity 宿主主题工坊（光学玻璃质感 × 哈基米星空猫窝深度融合版）**：
  - 升级 `src/theme/host-theme-config.mjs` 为 5 级光学玻璃表面体系（覆盖 `--background`/`--sidebar`/`--content`/`--card`/`--glass-highlight`/`--glass-shadow`/`--onyx-*`/`--nux-radius-*` 等宿主变量，显著拉开侧栏/画布/浮卡纵深与角色极光三色晕染）；
  - 升级 `src/cdp/host-theme-runtime.mjs`：在侧栏与主画布叠加 3%~5% SVG 肉垫爪印（🐾）+ 四角星芒（✦）猫窝暗纹与底部随角色丝滑变色的星云极光晕染（`#gemineko-conv-aurora`）；对 `.surface-composer-card`、`[data-testid="user-message-bubble"]`、`[data-testid="thinking-collapsible-trigger"]`、`[data-testid="conversation-row-sidebar"]`、文件变更卡、Artifact 卡、弹窗菜单及细滚动条进行组件级光学精修（含顶边星虹折射光条、发送 `✦/🐾` 微粒、侧栏发光 `✦`、展开星轨渐变竖线与弹簧微动效）；并在新对话空白页加入 `#gemineko-home-stage` 5 角色 Q 版 APNG 迎宾彩蛋舞台（严格避让 Browser Hole 与专注编码 0fps 降噪）；
  - 新增 **5 角色原生联动与全窗口彩蛋**：切模型极光扫屏、工具报错（`activity-tracker.mjs` `hasError`）触发「哈气」微抖+气泡、长任务完成柔光星尘礼花、摸头累计亲密值与专属吐槽台词、3 秒连击 5 次触发 **「捅了基米窝！」全员 5 只 APNG 巡游**并与侧边栏双向同步、深夜（23:00–05:00）猫窝小夜灯与温柔提醒、`Ctrl+Shift+M` / Konami 触发「爪印星尘雨」；
  - 新增 **工作台高频效率增强**：悬浮猫爪对话大纲（支持搜索过滤、一键滚动跳转高亮）、超长代码块（`>= 32` 行）吸顶顶栏+折叠/展开、非输入区毛玻璃右键快捷菜单（`/btw` 快问、复制路径、`@引用` 填入、主题快切；`Shift+右键` 与输入区直接放行原生）；
  - 在 `hive_board` 侧边栏新增 `src/theme/theme-workshop.js`「🎨 主题工坊」控制台及输入框 Dock `🎨` 迷你快切按钮，调整后通过 `/api/theme/config` 推送宿主 `< 50ms` 热刷新。

### Fixed
- **补齐 `asking`（「等你拍板」）5 角色动态 APNG 与全链路 404 防护**：
  - 基于锁定三视图补齐 `neon/hydrogen/carbon/claude/gpt-asking.png`（4 帧透明循环 APNG）；
  - `src/activity-tracker.mjs` 新增并统一使用 `resolveSpriteFile(role, action)`，后端 `server.mjs` `/gemineko-sprites/` 与前端 `host-injector.mjs` / `gemineko-runtime.js` 均加入白名单校验与 `onerror` 回退至 `<role>-thinking.png`，彻底杜绝 `404` 裂图。
- **修复无 Swarm 普通对话下侧边栏卡在 `Looking for this conversation's swarm…` 骨架屏**：
  - `src/sidecar/server.mjs` 在无自有 Swarm 时回退历史快照仍保持请求的 `conversationId` 对齐并标记 `isFallbackSwarm`；
  - `src/theme/gemineko-runtime.js` 与 `theme-workshop.js` 将侧边栏工具栏和主题工坊挂载到常驻顶部容器 `#gemineko-sidecar-shell`，并加入骨架屏防卡死守护逻辑（空对话 1.2s 内切入空态/演示体验）。

## [0.4.1] - 2026-11-27

### Changed
- **关系猫窝图谱六边形无损升级为可爱猫耳软垫猫窝**：
  - `src/theme/gemineko-runtime.js` 新增 `parseHexPathGeometry`、`buildCatNestPath`、`buildCatNestDecoSvg` 与 `transformHiveCellsToCatNests()`，同帧将 `svg.hv-svg` 内的平顶六边形单元格（`.hv-cell` / `.hv-prog` / `.hv-selring`）变形为圆润双猫耳猫窝，协调喵主窝自带额头蝴蝶结，普通任务窝带底缘小猫爪与柔粉软垫缝线，并在「仅换头像」模式下支持 100% 字节级无损还原；同步补齐图谱底部 `.hv-key` 三语图例汉化；
  - `src/theme/gemineko-theme.css` 为猫耳软垫猫窝定制奶油粉紫/暖金配色、粉嫩内耳、虚线缝线与樱花粉选中环；
  - `tests/gemineko-hive.test.mjs` 新增猫窝几何解析、安全包络路径及装饰生成单测。

## [0.4.0] - 2026-11-27

### Changed & Added
- **5 大模型社区同人官设 100% 纠偏重构与 25 态真·动态 APNG 升级**：
  - 归档 5 套锁定 2.2 头身 Q 版三视图至 `assets/triviews/`（`q-neon.png`、`q-hydrogen.png`、`q-carbon.png`、`q-claude.png`、`q-gpt.jpg`），致敬原作者 **@ZipZipPipe（胖次狐）《大AI和小AI们》** 与 **`lmy414/ai-chan-sheets`**；
  - 新增 `scripts/build-animated-sprites.mjs`，将 25 枚原生 4 帧循环动画逐帧去白底抗锯齿羽化并统一全局底中对齐，全部输出为 `128×128 32-bit RGBA` 无限循环 **APNG**（`.png` 含 `acTL` 动画块，覆盖 25 核心动作 + 5 兼容别名），并彻底清理了无文字（零 `"Zzz"`）要求；
  - `src/theme/gemineko-runtime.js` 移除会压扁 APNG 动画的 `<canvas>` 重绘路径，`getSpriteSrcForGifOrMsg()` 在 Q 版模式下直接返回 `?v=0.4.0` 原生透明 APNG；
  - `src/cdp/host-injector.mjs` 柔化 `.gk-act-*` 外层 CSS 位移/旋转幅度并更新 `?v=0.4.0`，突出原生逐帧微表情与手势动画；
  - `tests/gemineko-hive.test.mjs` 新增 25 枚精灵图 `acTL` 动画块与帧数（`>= 2`）自动化断言。

## [0.3.1] - 2026-11-27

### Fixed
- **根治独立《基米窝》侧边栏每 1.5 秒闪烁一次的问题**：
  - `src/sidecar/server.mjs` 在 `/api/swarm` 正式实现官方 `app.js` 约定的 `?etag=` 一致性协议（数据未变时返回 `{ unchanged: true, etag }`，彻底停止每 1.5s 重建 35 节点 SVG 图谱）；
  - `src/theme/gemineko-runtime.js` 为 Demo 模式同步补充 `etag` 返回 `unchanged: true`，并对 `svg#graph` / `#replay-label` 的重建采用 `queueMicrotask` 同帧切换（真实消息推送时也消除 80ms 英文回闪）。

## [0.3.0] - 2026-11-27

### Added & Improved
- **全套 30 张精灵真正 Alpha 透明抠图**：新增 `scripts/cutout-sprites.mjs`，通过四边 BFS 泛洪与抗锯齿羽化去除白色/浅色背景（保留眼白与白衣高光），彻底告别“贴了一张带白边小方块图”的视觉割裂感。
- **主对话区双位置动态立绘（`src/cdp/host-injector.mjs` 重构）**：
  - **位置 A（输入栏左上沿固定锚定）**：锚定于 `#antigravity.agentSidePanelInputBox` 左上方（不可拖拽，自适应窗口缩放与字号调大，自动适配深浅色模式）；
  - **位置 B（聊天流底部活跃行动态联动）**：仅在当前对话最底部正在运行的 `Thinking for ...` / `Working` / `Running` 行旁挂载无框透明动态动作立绘，回合结束自动收起，不再堆积历史；
  - 集成 10 秒 CDP 心跳保活，宿主调大字体或页面刷新后自动重新挂载。
- **按 `conversationId` 精准锁定，杜绝后台串台**：`/api/live-activity` 新增 `conversationId` 参数，主窗口与侧边栏均只追踪当前正在查看的对话模型与工具动作。
- **侧边栏明确模式芯片 + 分段开关设置面板**：顶栏直接以 `属性: 当前值` 只读芯片展示现状（例如 `语言: 萌系中文`、`皮肤: 星空猫窝`），展开设置面板提供带 `✓` 激活高亮的分段开关，点击即所选。
- **真正像“猫窝”的视觉设计（零六边形）**：移除所有六边形蜂巢意象，改为星空云雾渐变 + 猫爪印（🐾）与四角星芒（✦）平铺底纹 + 圆润猫窝软垫卡片。
- **关系图 100% 哈基米花名与全量汉化**：从 `svg.graph g.node > title` 解析完整 `rawId`，彻底修复截断节点（如 `audit-a...`）漏改花名与误配立绘问题，并动态对称扩宽节点胶囊完整展示花名；补全 Graph、Board、Overview、Raw、GIF 弹窗全量中文/萌系中文三语覆盖。

## [0.2.1] - 2026-11-27

### Fixed
- **彻底根治侧边栏加载卡死转圈**：重构 `src/theme/gemineko-runtime.js` 中 `MutationObserver` 为 `80ms` 防抖调度 + `disconnect()` 互斥重入保护 + 文本与属性值相等校验，消除微任务死循环锁死 UI 线程的 Bug。
- **补齐独立面板 `/preload.js`**：`src/sidecar/server.mjs` 在独立 Sidecar 模式下返回完整 `sidecar_sdk/preload.js`（及可用 polyfill），修复独立《基米窝》侧边栏缺少 `window.sidecar` 导致的卡载问题。
- **修复主对话步骤条头像竖排重叠**：`src/cdp/host-injector.mjs` 清理历史 `.gk-step-avatar` 误插元素，改为仅针对紧凑 `Worked for` 按钮插入唯一 `18×18` 行内圆角头像，不再撑坏聊天排版。

## [0.2.0] - 2026-11-27

### Added
- **5 模型 × 5 动作全员 25 张 Q 版立绘 & 32×32 像素手搓版**：
  - 在 `assets/sprites/` 新增并集成 `neon`、`hydrogen`、`carbon`、`claude`、`gpt` 五大角色各 5 种工作姿态（`thinking` / `reading` / `editing` / `running` / `idle`），每张立绘统一无文字纯洁白底 `128×128 PNG`，紫色 `neon`、冰青 `hydrogen`、暗夜流金 `carbon`、橙发大小姐 `claude`、银发翡翠双龙角 `gpt` 一眼精准辨识；
  - `src/theme/pixel-sprites.js` 同步扩展至 `6 角色 × 6 动作` 像素绘制，自带放大镜、卷轴、键盘、终端与星光细节。
- **实时 `transcript.jsonl` 编排/执行阶段与动作追踪器（`src/activity-tracker.mjs`）**：
  - 高效扫描当前活跃会话 `.system_generated/logs/transcript.jsonl` 尾部 `64 KB`，自动区分 `编排模式（Planner）`、`执行模式（Executor）` 与 `待机中（Idle）`，并将具体工具调用归类为思考/读代码/改文件/跑终端/等待确认/打盹。
- **Antigravity 主对话区 CDP 实时挂载（`src/cdp/host-injector.mjs`，免改 `app.asar`）**：
  - 在检测到本地调试端口（`DevToolsActivePort` 或 `127.0.0.1:19222`）时，自动向主对话右上角注入可拖拽实时悬浮胶囊（支持折叠、记忆坐标与点击摸头冒爱心），并为聊天气泡内的折叠工具步骤条前置 `20×20` 当前模型动作头像；无调试端口时保持静默待机绝不报错。
- **高浓度哈基米玩梗花名引擎（`src/theme/nicknames.js`）**：
  - 默认显示「哈基米大统领」「95分严审圣女」「烧Token大龙娘」「哈气修锅王」「白米饭精」「雷达嗅探猫」等梗名（悬停保留真实 `@id` 提示），工具栏可一键切回原 `@ID`。
- **无损替换官方 Swarm 入口小蜜蜂图标 & 轻量化主包**：
  - `src/native-patcher.mjs` 新增独立 PNG 路由注入与 `swarm/assets/logo.svg` 无损备份替换（`restore` 时字节级还原）；
  - `scripts/build-bundle.mjs` 改为精灵图按需路由加载，主包体积大幅瘦身，加载更轻快。
- 新增极简 `rules/AGENTS.md`，并更新 Demo 快照与完整单测套件 `tests/gemineko-hive.test.mjs`。

## [0.1.0] - 2026-11-27

### Added
- 初始开源版本发布：**Gemineko Hive · 基米窝**（MIT License）。
- **双模式架构**：支持对 Antigravity 原生 Swarm 面板一键无损换肤（`src/native-patcher.mjs` + `bin/gemineko-hive.mjs`），同时自带独立只读伴生 Sidecar 面板（`sidecars/hive_board/`）并在顶部提供一键开关原生皮肤胶囊。
- **双角色映射 & 双美术包**：
  - 支持「AI 娘宇宙」（Gemini 皇冠猫娘 / Claude 橙发大小姐 / GPT 银发小龙娘 / Gemini 劳模猫娘）与「全员彩色哈基米」一键切换；
  - 内置 128×128 高清 Q 版立绘与纯 Canvas 32×32 高精像素精灵两套美术包，覆盖工作、等待、需确认、打盹休眠等实时状态与 `Zzz` 动态悬浮。
- **轻盈「星空猫窝」主题与整活互动**：
  - 自适应深/浅色主题并支持一键切回「仅换头像」模式；
  - 内置「捅一捅基米窝」全体炸毛冒泡彩蛋、单独摸头冒泡、萌系中文/正常中文/英文三套实时文案、默认静音的 Web Audio 合成萌系音效，以及原生 **Export GIF** 导出同步；
  - 无 Swarm 空状态内置「一键体验模拟基米窝（Demo）」5 只 AI 娘演示数据。
- 完成自动化构建脚本 `scripts/build-bundle.mjs` 与完整单元测试 `tests/gemineko-hive.test.mjs`。
