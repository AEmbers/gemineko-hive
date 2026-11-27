<p align="center">
  <img src="assets/logo.png" width="150" alt="Gemineko Hive Logo" />
</p>

<h1 align="center">Gemineko Hive · 基米窝 v0.3.0</h1>

<p align="center">
  <strong>“坏了，捅了基米窝了！”</strong><br />
  为 <strong>Google Antigravity</strong> 注入全透明抠图 25 态动态立绘、输入栏固定伴生猫娘、活跃行实时联动与星空猫窝主题！
</p>

---

## ✨ v0.3.0 核心特性

- **看立绘就知道谁在干活、在干什么（5 模型 × 5 动作 = 全套 25 张 Q 版立绘 + 32×32 像素手搓版）**：
  - **5 大差异化人设**：
    - **Gemini Neon / Pro（`neon`）**：蓝紫粉渐变异瞳猫娘（星光编排主力）
    - **Gemini Hydrogen / Flash（`hydrogen`）**：冰青闪电呆毛猫娘（白青运动外套，极速执行）
    - **Gemini Carbon / Ultra（`carbon`）**：暗夜流金黑金星冠猫娘（重型推理）
    - **Claude Sonnet / Opus（`claude`）**：暖杏橙向日葵水手服大小姐（95 分严格审查，无猫耳）
    - **GPT / Codex / Sol（`gpt`）**：银白发翡翠双龙角科技龙娘（算法与架构攻坚，无猫耳）
  - **5 大工具动作具象化**：**思考中**（托腮星光）、**读代码**（金边眼镜 + 放大镜看卷轴）、**改文件**（敲发光机械键盘）、**跑终端**（戴耳机盯绿屏终端）、**打盹**（抱枕眯眼休息）——**图内纯洁无字，清晰一眼辨别！**
- **Antigravity 主对话区实时挂载（免改 `app.asar`）**：
  - 实时读取会话 `transcript.jsonl` 尾部日志，精准区分当前是 **编排模式（Planner）** 还是 **执行模式（Executor）**；
  - 通过本地 CDP 自动在**主对话输入栏左上沿固定锚定**透明动态猫娘（不可拖拽、自适应字号与缩放、摸头会冒爱心 💖），并在聊天流最底部正在干活的 `Thinking for ...` / `Working` / `Running` 行旁同步挂载动态动作小立绘（回合结束自动收起）！
  - 注：主对话挂件需要 Antigravity 以 `--remote-debugging-port=19222` 启动（Windows 开始菜单快捷方式默认已带此参数；未开启时插件会自动静默待机，不影响独立面板）。
- **Swarm 全链路无损美化 & 入口小蜜蜂替换**：
  - 支持对官方 `swarm_board` 无损换肤并同步备份替换 `swarm/assets/logo.svg`，连聊天气泡里的 `[Open the Swarm UI]` 按钮也会变成可爱的基米窝图标！随时一键字节级还原官方原版。
- **高浓度哈基米玩梗花名**：
  - 默认把成员昵称变成 **哈基米大统领**、**95分严审圣女**、**烧Token大龙娘**、**哈气修锅王**、**白米饭精**、**雷达嗅探猫** 等梗名（悬停看真实 `@id`），工具栏支持一键切换还原 `@ID`。
- **捅一捅炸毛彩蛋 & 空状态 5 角色 Demo**：
  - 点击顶部 **「捅一捅」** 全窝炸毛吐槽，没有跑 `/swarm` 时也能一键预览 **5 大模型 × 5 大动作** 同框协作 Demo！

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
   - 顶部横幅实时显示当前主对话处于 **编排模式** 还是 **执行模式**，支持一键开关 **主对话区 CDP 悬浮挂件** 与 **原生 Swarm 一键换肤**。
2. **CLI 命令行控制（可选）**：
   ```bash
   node bin/gemineko-hive.mjs status   # 检查原生 Swarm 换肤状态、精灵数与 logo 替换状态
   node bin/gemineko-hive.mjs apply    # 套用/升级后重新应用《基米窝》皮肤与入口图标
   node bin/gemineko-hive.mjs restore  # 字节级无损还原官方原版 Swarm 与小蜜蜂图标
   ```

---

## 🎨 致敬与社区礼仪

角色灵感与视觉锚点致敬 B 站创作者 **@ZipZipPipe**《大AI和小AI们》企划及社区二创生态。仅供个人桌面美化与技术交流分享，请勿用于商业用途。

---

## 📄 License

[MIT](LICENSE) © 2026 AEmbers
