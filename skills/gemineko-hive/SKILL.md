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

# Gemineko Hive · 基米窝 (v0.2.0)

把 Google Antigravity 原生 Swarm 与主对话编排/执行进程变成一窝 25 态活体哈基米 / AI 娘宇宙。

## 快捷入口

- **直接打开独立《基米窝》侧边栏**（实时监测主对话编排/执行状态 + 5角色25态 Demo + 一键原生换肤 & CDP 挂件控制）：
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
```

> 提示：
> 1. 主对话区右上角悬浮胶囊通过本地 CDP（`--remote-debugging-port=19222`）自动挂载；未开调试端口时保持静默待机，侧边栏面板仍完全可用。
> 2. 执行 `apply` 或 `restore` 后，如果官方原生 Swarm 侧边栏正好已经打开且旧进程仍在运行，关闭重开一次 Swarm 侧边栏即可看到新皮肤生效。
