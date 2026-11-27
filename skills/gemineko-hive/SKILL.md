---
name: gemineko-hive
description: >-
  Turn Google Antigravity's native Swarm hive board into "Gemineko Hive"
  (基米窝) with dual mode (non-destructive native Swarm skin patcher + standalone
  read-only sidecar pane), AI Girls Universe & colorful Hachimi role packs,
  Chibi/Pixel art styles, interactive poke/headpat easter eggs, GIF sprite sync,
  and a built-in demo hive. Use whenever the user asks to open Gemineko Hive,
  theme/skin the native Swarm board, restore original Swarm bees, or preview
  the swarm UI with cats/AI girls.
---

# Gemineko Hive · 基米窝

把 Google Antigravity 原生 Swarm 蜂巢面板变成一窝可爱的哈基米 / AI 娘宇宙。

## 快捷入口

- **直接打开独立《基米窝》侧边栏**（支持空状态一键 Demo、实时监听官方 Swarm、顶部一键给原生 Swarm 换肤）：
  `[Gemineko Hive · 基米窝](sidecar://gemineko-hive/hive_board/)`
- **管理插件开关**：
  `[Gemineko Hive · 基米窝](customization://gemineko-hive)`

## 常用命令行操作（位于插件根目录）

```bash
# 查看当前原生 Swarm 面板换肤状态
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" status

# 套用（或 Antigravity 升级后重新恢复）《基米窝》皮肤到原生 Swarm
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" apply

# 无损还原官方原版小蜜蜂样式
node "<PLUGIN_ROOT>/bin/gemineko-hive.mjs" restore
```

> 提示：执行 `apply` 或 `restore` 后，如果官方原生 Swarm 侧边栏正好已经打开且旧进程仍在运行，关闭重开一次 Swarm 侧边栏（或重启）即可看到新皮肤生效。
