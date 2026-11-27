# Changelog

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
