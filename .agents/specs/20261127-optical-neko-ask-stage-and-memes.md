# 需求验收契约：Gemineko Hive v0.6.0（光学高定哈基米 + 提问轮盘舞台 + 表情全链路集成）

## 1. 三种视觉模式重构（默认 `optical-neko`）
- `themeIntensity` 新枚举：`optical-neko`（新默认 · 光学高定哈基米）/ `vivid`（浓郁二次元）/ `minimal`（极简专注）；历史配置 `balanced` 自动平滑映射至 `optical-neko`。
- **`optical-neko` 光学高定模式**：借鉴 Obsidian Prism 的大留白、通透毛玻璃与柔和阴影层次——取消侧栏与主画布满屏平铺 SVG 底纹，改以边缘/底部角色星云极光雾晕、`1px` 白色镜面顶边内高光、角色渐变棱彩微光边框、`Overview` 卡片极简发光双猫耳线条，以及无繁复旋转大圆环的低侵入柔焦角落角色立绘（默认 `opacity: 0.10` + 底部柔焦渐隐）。
- **`vivid` 浓郁二次元**：完整保留 5 角色满屏几何底纹、260px 旋转矢量纹章与高频装饰。
- **`minimal` 极简专注**：纯光学表面明暗层次，零极光、零水印。

## 2. 提问模式 (`ask_question`) 主题化舞台 + 5 角色抱臂仰头思考 APNG
- 基于 `assets/triviews/q-*.png|jpg` 新增 5 枚 `128×128 RGBA` 4 帧无限循环透明 APNG：`assets/sprites/{neon,hydrogen,carbon,claude,gpt}-ponder.png`，统一为「双手抱在身前（抱臂）、微微仰头思考」姿态，无杂字、无背景白底。
- 活跃 `ask_question` 面板自动隐藏原左下小猫 Dock（零遮挡），并布局为：**上方问题** / **左下角色抱臂仰头思考动态立绘 + 头顶 `A? B? C? D?` 轮盘思考气泡（仅当前字母点亮发光并带 `?`，其余暗淡；默认约 950ms 自动轮转，鼠标悬停右侧选项实时锁亮对应字母）** / **右下选项**。

## 3. 表情插件全链路集成
- 复用本机 `~/.gemini/meme-packs/gemini-neko` 贴纸库，Sidecar 新增 `/api/memes/list` 与 `/api/memes/file/*`（`realpathSync` 路径安全隔离）。
- CDP 侧 `host-meme-runtime.mjs` 实现免改 ASAR 的聊天内 `[表情: ...]` 原地高清透明贴纸渲染、快捷表情面板（不抢占 `Ctrl+Shift+M`，爪印雨改绑 `Ctrl+Shift+P`）及长任务收工汇报贴纸气泡（工作进行中严禁弹出）。
- 更新 `rules/AGENTS.md` 规范：闲聊一问一答与最终收工汇报可顺带发 1 张表情，工作中途不发。
