<p align="center">
  <img src="assets/logo.png" width="150" alt="Gemineko Hive Logo" />
</p>

<h1 align="center">Gemineko Hive · 基米窝</h1>

<p align="center">
  <strong>“坏了，捅了基米窝了！”</strong><br />
  把 <strong>Google Antigravity</strong> 原生 Swarm 蜂巢面板变成一窝萌度爆表的哈基米 / AI 娘宇宙！
</p>

---

## ✨ 核心特性

- **双模式合一（零侵入可逆 + 独立侧边栏）**：
  - **原生 Swarm 一键换肤**：通过极轻标记块把皮肤注入官方 `swarm_board`，不改官方核心逻辑，升级后一键恢复、随时逐字节还原出厂小蜜蜂；
  - **独立《基米窝》Sidecar 面板**：侧边栏随时打开，自带顶部「原生 Swarm 换肤」状态胶囊，点一下即可完成套用/还原。
- **双角色映射可切换**：
  - **AI 娘宇宙（默认）**：按成员角色与底层模型自动变身 —— **领队皇冠 Gemini 猫娘**、**Claude 橙发大小姐**、**GPT 银发翡翠小龙娘**、**Gemini 劳模猫娘**（同模型多 Worker 通过差异化色环区分）；
  - **全员彩色哈基米**：不按模型区分，整窝全是各具发色光环的小哈基米猫娘。
- **双美术包随心换**：
  - **高清 Q 版立绘（Chibi）**：精绘角色立绘 + 工作中 Q 弹发光、等待轻呼吸、休眠打盹飘动态 `Zzz`；
  - **32×32 复古像素风**：纯 Canvas 高精像素 AI 娘精灵，帧动画抖耳挥爪。
- **轻盈「星空猫窝」主题 & 整活彩蛋**：
  - 柔光星空六边形猫窝、星芒连线微粒，支持一键切回「仅换头像」极简模式与 **萌系中文 / 正常中文 / EN** 实时翻译；
  - 点击 **「捅一捅」** 触发全窝集体炸毛 + 吐槽弹幕，支持单独点击猫娘摸头互动、Web Audio 合成轻音效（默认静音）与 **GIF 导出同步猫娘**；
  - 没开 `/swarm` 时也能点击空状态 **「一键体验模拟基米窝（Demo）」** 预览 5 只 AI 娘同框干活！

---

## 📦 安装方式（30 秒上手）

### 方式一：通过 AGY Market（推荐，零命令行）
打开 **AGY Market** 侧边栏 → 点击右上角 **「链接添加」** → 粘贴下方仓库地址安装即可：
```text
https://github.com/AEmbers/gemineko-hive
```

### 方式二：手动克隆部署

**Windows（PowerShell）：**
```powershell
git clone https://github.com/AEmbers/gemineko-hive.git
powershell -ExecutionPolicy Bypass -File .\gemineko-hive\scripts\install-local.ps1
```

**macOS / Linux：**
```bash
git clone https://github.com/AEmbers/gemineko-hive.git ~/.gemini/config/plugins/gemineko-hive
```

---

## 🚀 使用方法

1. **打开《基米窝》侧边栏**：在对话中点开 `[Gemineko Hive · 基米窝](sidecar://gemineko-hive/hive_board/)`；
   - 如果想直接美化官方原生 Swarm，在《基米窝》顶部点一下 **「原生 Swarm 换肤：点击启用」**，然后重开一次官方 Swarm 面板即可（或直接用下面 CLI 命令）。
2. **CLI 命令行控制（可选）**：
   ```bash
   node bin/gemineko-hive.mjs status   # 检查当前原生 Swarm 换肤状态
   node bin/gemineko-hive.mjs apply    # 套用/升级后重新应用《基米窝》皮肤
   node bin/gemineko-hive.mjs restore  # 无损还原官方原版小蜜蜂
   ```

---

## 🎨 致敬与社区礼仪

角色灵感与视觉锚点致敬 B 站创作者 **@ZipZipPipe**《大AI和小AI们》企划及社区二创生态（Gemini 蓝紫异瞳猫娘、Claude 橙发向日葵大小姐、GPT 银发翡翠小龙娘）。仅供个人桌面美化与技术交流分享，请勿用于商业用途。

---

## 📄 License

[MIT](LICENSE) © 2026 AEmbers
