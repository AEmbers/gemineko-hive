# Changelog

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
