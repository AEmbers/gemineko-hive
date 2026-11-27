# Changelog

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
