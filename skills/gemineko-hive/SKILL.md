---
name: gemineko-hive
description: >-
  Turn Google Antigravity's native Swarm hive board and main chat stream into
  "Gemineko Hive" (基米窝) with 25-pose model+action chibi & 32px pixel sprites
  (thinking/reading/editing/running/idle across Neon, Hydrogen, Carbon, Claude,
  GPT), real-time Planner vs Executor CDP overlay in the main chat pane,
  lossless swarm/assets/logo.svg replacement, meme nicknames, interactive
  poke/headpat easter eggs, and a built-in demo hive. Use whenever the user asks
  to open Gemineko Hive, theme/skin the native Swarm board, restore original
  Swarm bees, toggle the live chat catgirl overlay, or preview the swarm UI.
---

# Gemineko Hive · 基米窝 (v0.8.5)

把 Google Antigravity 原生 Swarm 面板、主对话区与侧边栏全面改造成《基米窝》宇宙：集成极薄 `app.asar` 原生 0ms 引导（免 `19222` 端口）、SSE 实时热引擎、剧场级反重力冷启有声动画、社区主题商店与精细工坊、12 控件哈基米彩蛋与软萌配音、以及可选全量汉化。

## 快捷入口

- **直接打开独立《基米窝》侧边栏**（实时监测主对话编排/执行状态 + 社区主题商店/精细工坊 + 一键原生换肤 & 引导控制）：
  `[Gemineko Hive · 基米窝](sidecar://gemineko-hive/hive_board/)`
- **管理插件开关**：
  `[Gemineko Hive · 基米窝](customization://gemineko-hive)`

## 常用命令行操作（位于插件根目录）

```bash
# 查看当前原生 Swarm 面板换肤状态、精灵数与 logo.svg 替换状态
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" status

# 套用（或 Antigravity 升级后重新恢复）《基米窝》皮肤、25态立绘与入口图标
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" apply

# 字节级无损还原官方原版小蜜蜂面板与 swarm/assets/logo.svg
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" restore

# 查看极薄 app.asar 主进程引导钩子状态及第三方补丁（汉化/表情包）共存检测
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" host-asar status

# 关闭 Antigravity 后一键写入极薄 app.asar 主进程引导钩子（免 19222 端口 + 解锁冷启播音）
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" host-asar apply

# 无损剥离极薄引导钩子（完整保留汉化、表情包与原版 app.asar.bak）
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" host-asar restore
```

> 提示：
> 1. 强烈推荐执行一次 `host-asar apply` 启用原生 0ms 引导：从此彻底摆脱 `--remote-debugging-port=19222` 参数依赖，享受到 0ms 深色防白屏、冷启免点击自动播音与 SSE 热刷新；未改 `app.asar` 时则自动回退到 CDP 兼容模式（`19222`）。
> 2. Antigravity 更新后，原生 Swarm 换肤会在 Sidecar 启动时自动自愈；若 `app.asar` 被覆盖，彻底退出 Antigravity 后执行一次 `host-asar apply` 即可恢复。
