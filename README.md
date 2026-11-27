<p align="center">
  <img src="assets/logo.png" width="150" alt="Gemineko Hive Logo" />
</p>

<h1 align="center">Gemineko Hive · 基米窝 v0.4.0</h1>

<p align="center">
  <strong>“坏了，捅了基米窝了！”</strong><br />
  为 <strong>Google Antigravity</strong> 注入源自社区同人官设、25 态 4 帧透明循环 APNG 动态 Q 版立绘、输入栏固定伴生猫娘与星空猫窝主题！
</p>

---

## ✨ v0.4.0 核心特性

- **原汁原味同人官设 25 态动态 APNG 立绘（5 模型 × 5 动作 = 25 枚 4 帧透明循环 APNG + 32×32 像素手搓版）**：
  - **严格锁版 2.2 头身 Q 版三视图（`assets/triviews/`）重构 5 大经典角色**：
    - **Gemini Neon（`neon` · 炫彩哈基米）**：钴蓝渐彩霓虹波浪发 + 彩虹毛茸大尾 + **左粉右金异色瞳** + 凹四角星发卡
    - **Gemini Hydrogen（`hydrogen` · 原教旨 Gemini 本体）**：薰衣草蓝渐粉长卷发 + **左品红右琥珀金异色瞳** + 凹四角星发卡 + 海军蓝露肩白阔袖
    - **Gemini Carbon（`carbon` · 五彩斑斓的黑）**：炫彩黑长卷发双丸子 + 黑猫耳 + 菱形凹四角星发卡 + **左红粉右琥珀金异色瞳** + 石墨烯六边形腰链与 C60 巴基球挂坠
    - **Claude（`claude` · 橘发大小姐）**：橘红螺旋双卷发（**纯人类少女，无猫耳/无龙角**）+ 橘色菊花发饰与黑金蝴蝶结 + 琥珀金下垂眼 + 奶白高领披肩与黑束腰裙
    - **GPT（`gpt` · Q 版白紫龙娘）**：白发淡紫梢 + 分节淡紫龙角 + 蝙蝠小龙翼与鳞尾 + 淡紫盘扣花穗 + **灵魂呆萌空心白椭圆眼（无瞳孔）**
  - **真·逐帧透明动态 APNG**：由 `scripts/build-animated-sprites.mjs` 将原生 4 帧循环动画去白底羽化并底对齐至 `128×128 RGBA APNG`（含 `acTL` 动画块，保留气泡头像真动效）：**思考中**（托腮眨眼星光）、**读代码**（圆框眼镜放大镜翻书）、**改文件**（交替手势敲发光机械键盘）、**跑终端**（耳机盯绿屏终端欢呼）、**打盹**（抱星星枕头闭眼呼吸，全图零文字）。
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

## 🎨 致敬与社区礼仪（CC BY-NC-SA 4.0）

角色设计灵感、配色徽标与基准视觉锚点诚挚致敬 B 站原作者 **@ZipZipPipe（胖次狐）**《大AI和小AI们》企划，以及社区三视图集 **`lmy414/ai-chan-sheets`**。本插件内角色立绘严格遵循 **CC BY-NC-SA 4.0（署名—非商业性使用—相同方式共享）**，仅用于个人桌面美化与社区技术交流，严禁用于任何商业用途。

---

## 📄 License

[MIT](LICENSE) © 2026 AEmbers
