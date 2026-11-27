# Gemineko Hive · 基米窝 — 产品需求契约 (SPEC v0.2.0)

> 在 `/grill-me` 对齐的 `v0.1.0` 基础上，围绕“实时区分编排者/执行者模型 + 工具动作具象化 + 主对话区可视化挂载 + 高浓度哈基米玩梗花名”迭代升级至 `v0.2.0`。

## 1. 形态与三大融合入口
- **原生 Swarm 无损换肤**：注入标记块与 `/gemineko-sprites/*.png` 独立二进制路由（绝不破坏官方 UTF-8 `STATIC`），同时备份并无损替换 `swarm/assets/logo.svg`，让主对话区 `[Open the Swarm UI]` 按钮小蜜蜂一并换装；还原时字节级恢复原样。
- **独立《基米窝》Sidecar 面板**：在 `sidecars/hive_board/` 展示真实本地 Swarm + 实时主对话 `编排模式 / 执行模式` 横幅 + 一键 CDP/原生换肤开关。
- **Antigravity 主对话区 CDP 实时挂载（不修改 `app.asar`）**：
  - 探测本地 `DevToolsActivePort` / `127.0.0.1:19222`；若调试端口未启用则静默待机绝不报错。
  - **位置 A（右上角可拖拽实时悬浮胶囊）**：固定于 `top: 52px; right: 18px`（避开右下角上下文猫娘挂件与底部输入框），展示 `52×52` 当前动作立绘、`编排模式 / 执行模式` 徽章、模型名称与工具名称，支持折叠、拖拽记忆坐标与点击摸头冒爱心。
  - **位置 B（对话流工具步骤条头像 + 入口图标兜底）**：为 `Worked for` / `Inspecting` / `Analyzed` / `Ran` 等折叠块前置 `20×20` 模型动作圆角头像。

## 2. 5 大模型 × 5 大工作动作 = 25 态全套立绘与像素画
- **5 大角色家族**：
  - `neon`（Gemini Neon / Pro 编排主力）：蓝紫/薰衣草波浪发+粉紫发尾+星光发卡+异瞳猫娘；
  - `hydrogen`（Gemini Hydrogen / Flash 极速执行）：冰青/天青渐变发+闪电呆毛+白青运动外套+异瞳猫娘；
  - `carbon`（Gemini Carbon / Ultra / Argon 重推理）：暗夜黑紫+流金挑染+黑金菱形星冠+异瞳猫娘；
  - `claude`（Claude Sonnet / Opus 严审）：暖杏橙波浪发+向日葵发卡+米白棕水手服大小姐（无猫耳）；
  - `gpt`（GPT / Codex / Sol）：银白冰玉青发+半透明翡翠玉龙角（无猫耳）+科技领结龙娘。
- **5 大工作动作（及 `asking` 态）**：
  - `thinking`（托腮/点额深思 + 星光灵感）、`reading`（圆框眼镜 + 放大镜查卷轴）、`editing`（发光机械键盘敲码）、`running`（小耳机 + 绿屏终端运行测试）、`idle`（闭眼抱枕打盹，图内绝无任何文字）。
  - 32×32 复古像素引擎同步完整实现 `6 角色 × 6 动作` 道具绘制。

## 3. 实时编排/执行判定与高浓度玩梗花名
- `src/activity-tracker.mjs` 只读扫描最新会话 `.system_generated/logs/transcript.jsonl` 尾部 `64 KB`，从最新 `PLANNER_RESPONSE` 识别 `model`、`thinking`、`tool_calls` 与 `enter_plan_mode`/`exit_plan_mode` 切换，输出精确阶段与动作。
- `src/theme/nicknames.js` 默认为成员分配高浓度玩梗花名（如 `哈基米大统领`、`95分严审圣女`、`烧Token大龙娘`、`哈气修锅王`、`白米饭精`、`雷达嗅探猫`），鼠标悬停显示真实 `@id` 与模型名，工具栏可一键切换还原原 ID。
