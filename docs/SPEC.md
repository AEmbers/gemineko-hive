# Gemineko Hive · 基米窝 — 产品需求与架构契约 (SPEC v0.8.4)

> 在 `v0.4.0` 官设锁定三视图与 25 态透明 APNG 基线上，历经 `v0.5–v0.8.4` 持续演进，形成「**开放主题引擎 × 社区商店 × 极薄 `app.asar` 原生引导 × SSE 热引擎 × 13 控件彩蛋与跨版本水晶物语 × 剧场级启动动画**」完整架构。

## 1. 形态与三大融合入口
- **原生 Swarm 无损换肤与更新自愈**：注入标记块与 `/gemineko-sprites/*.png` 独立二进制路由（绝不破坏官方 UTF-8 `STATIC`），同时备份并无损替换 `swarm/assets/logo.svg`，让主对话区 `[Open the Swarm UI]` 按钮小蜜蜂一并换装；Sidecar 启动时若检测到曾开启换肤（`logoBackupExists`）但被 Antigravity 更新覆盖，自动重新 `apply` 自愈；还原时字节级恢复原样。
- **独立《基米窝》Sidecar 面板（`sidecars/hive_board/`）**：展示真实本地 Swarm（支持 `?etag=` 零闪烁增量轮询）+ 实时主对话 `编排模式 / 执行模式` 横幅 + **社区主题商店 & 精细工坊** + 13 控件彩蛋全收集图鉴 + GitHub Star/版本更新推送。
- **Antigravity 主对话区双通道实时挂载（极薄 `app.asar` 原生 0ms 引导 × CDP 免改包兜底）**：
  - **通道 A（推荐 · `host-asar-patcher.mjs` v0.8.4）**：仅向 `dist/main.js` 增量注入约 `4KB` 极薄主进程引导钩子（不修改 `dist/preload.js`，完全避开 `contextIsolation` 与沙箱限制），早期注入深色预设防白屏 CSS 与 Chromium `autoplay-policy=no-user-gesture-required` 开关，自动读取 `~/.gemini/antigravity/sidecar_data/gemineko-hive/runtime-endpoint.json` 并从 `/api/host-bootstrap.js` 拉取运行时注入主世界，配合 `/api/host-events` SSE 长连接实现 `<50ms` 调色/汉化/彩蛋/启动重播热刷新，彻底摆脱 `--remote-debugging-port=19222` 依赖，完整保留已有 `app.asar.bak` 与 `chinese-toolkit` / `agy-meme` 补丁；
  - **通道 B（免改包兼容 · `CdpHostInjector`）**：自动探测本地 `DevToolsActivePort` / `127.0.0.1:19222`，带同源挂载去重与 `__GEMINEKO_STARTUP_PLAYING__` 防砍断保护，未开调试端口时静默待机绝不报错。
  - **位置 A / 位置 B 锚点**：输入栏左上沿透明动态猫娘 + 玻璃态模式徽章（原生菜单重叠自动避让隐藏）与聊天流底部活跃状态行实时小立绘。

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

## 4. 主题引擎、多端彩蛋矩阵、剧场级启动动画与全量汉化（`v0.5–v0.8.4`）
- **开放主题引擎 & 社区商店（`src/theme/theme-store.mjs`、`host-theme-config.mjs`、`host-theme-runtime.mjs`）**：4 套基底配色 + 5 角色流光 + HTTP `206 Range` 流式本机壁纸/立绘水印 + `themes/registry.json` 社区主题热插拔（HTTPS Raw 消毒防 SSRF）与一键导出投稿。
- **13 控件哈基米彩蛋 & 跨版本水晶物语（`src/cdp/host-easter-eggs-runtime.mjs`）**：主窗口 10 大 + 侧边栏 3 大专属彩蛋、13/13 终极耄耋阅兵、`CRYSTAL_STORY_CHAPTERS` 5 章跨版本主线连载（第 1 章《晶中微语》10 连击碎震呼救）及 `/gemineko-audio/*.mp3` 软萌二创配音体系。
- **剧场级反重力启动动画（`src/cdp/host-startup-runtime.mjs`）**：Canvas 2D 星尘 + 1024px 星钻 + 5 角色环绕 + 开机双音效/语音，配备 `#t=` 过渡与首帧就绪门禁、`>=420ms` 延迟锁定、首帧 `Image()` 预解码及双轨收尾。
- **无损全量汉化（`src/cdp/host-i18n-runtime.mjs`）**：`60ms` 固定窗口节流 + ShadowRoot/属性扫描 + `{ orig, applied }` 复用节点状态机，支持一键切回原版英文与代码正文隔离保护。
