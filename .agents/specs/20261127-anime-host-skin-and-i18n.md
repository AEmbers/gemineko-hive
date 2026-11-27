# 需求验收契约：Gemineko Hive v0.5.1 全量二次元宿主皮肤 + 内置可选汉化

## 1. 核心目标与开箱默认值
- **视觉浓度**：默认 `themeIntensity: 'vivid'`（浓郁二次元），支持工坊/快切一键切换 `vivid`（浓郁二次元）/ `balanced`（均衡日常）/ `minimal`（极简专注）。
- **内置全量可选汉化**：默认 `i18n: { mode: 'auto', autoChineseStyle: 'neko-zh' }`（检测到系统/浏览器 `navigator.language` 以 `zh` 开头自动开启哈基米萌系中文 `neko-zh`，海外英文环境自动保持 `off` 零开销）；工坊与快切支持 4 档随切（`auto` / `neko-zh` / `zh` / `off`）。
- **角落二次元立绘水印**：默认 `watermark: { enabled: true, role: 'follow-role', opacity: 0.14, customFilePath: '' }`，复用透明底角色动态 APNG 叠加对应角色专属大型 SVG 矢量纹章（零白底方框），支持指定角色或导入本地透明 PNG/WebP/GIF/AVIF。

## 2. 5 位角色专属视觉母题与全界面无死角重绘
- **5 位角色视觉母题**：
  - `neon`（Neon · 炫彩哈基米）：炫彩虹光丝带 + 凹四角星芒 + `NEON · GEMINEKO`；
  - `hydrogen`（Hydrogen · Gemini 本体）：薰衣草粉金星雾 + 四角星 + `HYDROGEN · GEMINI`；
  - `carbon`（Carbon · 五彩斑斓的黑）：正六边形石墨烯蜂窝晶格 + 棱彩晶钻 + `CARBON · GRAPHENE`；
  - `claude`（Claude · 橘发大小姐）：暖奶油蕾丝点阵 + 四叶菊花 + `CLAUDE · MAID`；
  - `gpt`（GPT · 白紫小龙娘）：白紫弧形星辰龙鳞 + 空心菱星 + `GPT · SOL DRAGON`。
- **全区域覆盖**：
  - 顶部菜单栏 `[data-testid="title-menu-bar"]` 与工具条 `[data-testid="pane-titlebar-toolbar"]`（2.5px 角色虹光顶边 + 玻璃胶囊）；
  - 左侧边栏（修复内层 `.bg-sidebar` 被盖色问题，全覆盖角色母题底纹、渐变新建对话主按钮、项目头光条与选中对话高亮胶囊）；
  - 悬浮 `Overview` 卡片（`[data-testid="overview-panel"]` 及其外层包装容器：毛玻璃底色、猫耳尖顶边装饰、虹光顶条、悬停发光条与计数角标）；
  - 对话流气泡、AI 回复内引用/表格/行内代码/代码块折叠吸顶、文件变更卡、输入栏指挥台、弹窗浮层与滚动条；
  - 严格保留 `[data-has-browser-hole="true"]` 完全透明。

## 3. 发光 SVG 爪印雨 & 汉化防误伤约束
- **发光 SVG 爪印雨**：每次释放 ≥ 24 颗 `24px~38px` 彩色内联 SVG 猫肉垫、凹四角星芒与虹彩晶棱（带外发光，亮暗主题均清晰可见）。
- **汉化零误伤与无损还原**：使用 `WeakMap` 保存原始英文节点文本与属性；黑名单排除聊天正文、`pre`、`code`、`.monaco-editor`、`textarea`、`[contenteditable="true"]`、基米窝自建浮层，且保留 `Antigravity` 官方品牌名不翻译；切回 `off` 完整还原英文并断开 `MutationObserver`。
- **体积极限与打包隔离**：宿主汉化引擎与主题运行时保留在 `src/cdp/` 通过 CDP 注入，`dist/gemineko-hive.js` 严格保持 `< 420_000` 字节。
