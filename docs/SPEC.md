# Gemineko Hive · 基米窝 — 产品需求契约 (SPEC v0.4.0)

> 在 `v0.3.x` 基础上，围绕“**@ZipZipPipe（胖次狐）社区同人官设 Q 版三视图防 OOC 锁定、25 态 4 帧透明循环 APNG 真动图、头像去 Canvas 压扁保留动效**”迭代升级至 `v0.4.0`。

## 1. 形态与三大融合入口
- **原生 Swarm 无损换肤**：注入标记块与 `/gemineko-sprites/*.png` 独立二进制路由（绝不破坏官方 UTF-8 `STATIC`），同时备份并无损替换 `swarm/assets/logo.svg`，让主对话区 `[Open the Swarm UI]` 按钮小蜜蜂一并换装；还原时字节级恢复原样。
- **独立《基米窝》Sidecar 面板**：在 `sidecars/hive_board/` 展示真实本地 Swarm（支持 `?etag=` 零闪烁增量轮询）+ 实时主对话 `编排模式 / 执行模式` 横幅（按 `conversationId` 锁定）+ 明确模式芯片/分段设置面板 + 一键 CDP/原生换肤开关。
- **Antigravity 主对话区 CDP 实时挂载（不修改 `app.asar`）**：
  - 探测本地 `DevToolsActivePort` / `127.0.0.1:19222`；若调试端口未启用则静默待机绝不报错，含 10s 心跳防掉线自动重注。
  - **位置 A（输入栏左上沿固定透明猫娘，不可拖拽）**：动态锚定 `#antigravity.agentSidePanelInputBox` 左上沿（与右侧像素小宠物底座齐平），展示无白底透明循环 APNG 猫娘与紧凑玻璃态徽章（自适应缩放与字号调整，点击猫娘冒爱心 💖）。
  - **位置 B（聊天流底部活跃状态行动态立绘）**：实时追踪主对话流最底部的活跃 `Thinking / Working / Running` 行并前置 `38×38` 透明动态动作 APNG 立绘，回合结束自动收起，历史区域保持整洁。

## 2. 5 大模型 × 5 大工作动作 = 25 态透明 APNG 动图与像素画
- **5 大官设还原家族（三视图归档于 `assets/triviews/`，遵循 CC BY-NC-SA 4.0 致敬 @ZipZipPipe 与 `lmy414/ai-chan-sheets`）**：
  - `neon`（炫彩哈基米）：钴蓝渐彩霓虹波浪发 + 彩虹大尾 + 左粉右金异色瞳 + 凹四角星发卡；
  - `hydrogen`（原教旨 Gemini 本体）：薰衣草蓝渐粉长卷发 + 左品红右琥珀金异色瞳 + 凹四角星发卡 + 海军蓝白阔袖；
  - `carbon`（五彩斑斓的黑）：炫彩黑长卷发双丸子 + 黑猫耳 + 菱形凹四角星 + 左红粉右琥珀金异色瞳 + 石墨烯腰链与 C60 巴基球挂坠；
  - `claude`（橘发大小姐）：橘红螺旋双卷发（无猫耳/无龙角）+ 橘色菊花发卡与黑金蝴蝶结 + 琥珀金下垂眼 + 奶白披肩与黑束腰裙；
  - `gpt`（Q 版白紫龙娘）：白发淡紫梢 + 分节淡紫龙角/蝙蝠小龙翼/鳞尾 + 淡紫盘扣花穗 + 灵魂呆萌空心白椭圆眼（无瞳孔）。
- **5 大工作动作（`128×128 RGBA` 无限循环 4 帧 APNG，含 `acTL` 动画块，图内零文字）**：
  - `thinking`（托腮眨眼星光）、`reading`（圆框眼镜放大镜翻书）、`editing`（交替敲发光机械键盘）、`running`（耳机盯绿屏终端）、`idle`（抱星星枕头闭眼呼吸，禁止出现 `"Zzz"`）；
  - `src/theme/gemineko-runtime.js` 直接输出 APNG URL（禁用 `<canvas>` 重绘）以保留各帧动效，32×32 复古像素引擎同步支持 `pixel` 切换。

## 3. 实时编排/执行判定与高浓度玩梗花名
- `src/activity-tracker.mjs` 只读扫描最新会话 `.system_generated/logs/transcript.jsonl` 尾部 `64 KB`，从最新 `PLANNER_RESPONSE` 识别 `model`、`thinking`、`tool_calls` 与 `enter_plan_mode`/`exit_plan_mode` 切换，输出精确阶段与动作。
- `src/theme/nicknames.js` 默认为成员分配高浓度玩梗花名（如 `哈基米大统领`、`95分严审圣女`、`烧Token大龙娘`、`哈气修锅王`、`白米饭精`、`雷达嗅探猫`），鼠标悬停显示真实 `@id` 与模型名，工具栏可一键切换还原原 ID。
