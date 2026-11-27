/**
 * @file Antigravity 主窗口内置全量可选汉化引擎（CDP 宿主侧注入，不计入 dist/gemineko-hive.js 主包体）。
 * 设计准则：
 * 1. 保留 `Antigravity`、`Gemini`、`Claude`、`GPT` 等官方品牌与专业缩写原样，不误翻用户消息、Agent 正文与代码编辑器；
 * 2. 支持 4 档策略：`auto`（中文系统自动启用 `neko-zh`，海外英文环境完全关闭 `off` 零开销）、`neko-zh`（哈基米萌系中文）、`zh`（标准专业中文）、`off`（原版英文无损还原）；
 * 3. 使用 WeakMap 记录首次修改前的原始文本/属性，任何模式切换均先按原始英文重算，切回 `off` 完整恢复并断开 MutationObserver。
 */

/** 标准专业中文精确词条（覆盖顶栏、侧栏、Overview 浮卡、对话控制、输入栏、设置与插件弹窗） */
export const HOST_I18N_EXACT_ZH = {
  // 顶栏菜单（保留 Antigravity 原样）
  Workspace: '工作区',
  File: '文件',
  Edit: '编辑',
  Selection: '选择',
  View: '视图',
  Go: '转到',
  Run: '运行',
  Terminal: '终端',
  Help: '帮助',
  Window: '窗口',

  // 左侧栏导航与项目树
  'New Conversation': '新建对话',
  Automations: '自动化',
  Customizations: '自定义设置',
  Projects: '项目列表',
  'No conversations yet': '暂无对话',
  Settings: '设置',
  Search: '搜索',
  'Search conversations': '搜索对话',
  'Add Project': '添加项目',
  'Open Folder': '打开文件夹',
  'Open Workspace': '打开工作区',
  'Opens the New Conversation screen for this project': '打开此项目的新建对话界面',
  'Edits the conversation title': '编辑对话标题',
  'Pin conversation': '置顶对话',
  'Unpin conversation': '取消置顶',
  'Archive conversation': '归档对话',
  'Delete conversation': '删除对话',

  // 悬浮 Overview 总览面板（截图 2 红圈重点区域）
  Overview: '总览',
  Review: '变更审查',
  Files: '文件',
  Plugins: '插件',
  Subagents: '子智能体',
  'Side Questions': '侧边追问',
  'Background Tasks': '后台任务',
  Artifacts: '产物文档',
  Customize: '自定义',
  'Customize Overview': '自定义总览',

  // 对话流与操作控件
  'Load older messages': '加载更早消息',
  'Conversation Log': '对话记录',
  'Agent said': '智能体回复',
  'You said': '你的提问',
  Copy: '复制',
  'Copy code': '复制代码',
  'Copy path': '复制路径',
  Copied: '已复制',
  Retry: '重试',
  Undo: '撤销',
  Redo: '重做',
  Revert: '回退到此步',
  Accept: '接受',
  'Accept all': '全部接受',
  'Accept All': '全部接受',
  Reject: '拒绝',
  'Reject all': '全部拒绝',
  'Reject All': '全部拒绝',
  Approve: '批准',
  Decline: '拒绝',
  Cancel: '取消',
  Stop: '停止',
  Continue: '继续',
  Proceed: '继续执行',
  Submit: '提交',
  'Open in editor': '在编辑器打开',
  'Open in Editor': '在编辑器打开',
  'View diff': '查看差异',
  'View Diff': '查看差异',
  'Review Changes': '审查变更',
  'Show more': '展开更多',
  'Show less': '收起',
  Collapse: '收起',
  Expand: '展开',
  'Expand all': '全部展开',
  'Collapse all': '全部收起',
  Clear: '清空',
  Filter: '筛选',
  Refresh: '刷新',
  Reload: '重新加载',
  Restart: '重启',
  'Just now': '刚刚',
  'just now': '刚刚',

  // 输入栏、模型选择器与权限模式
  'Ask anything, @ to mention, / for actions': '随便问点什么，@ 提及文件，/ 呼出指令',
  'Ask anything...': '随便问点什么…',
  'Type a message...': '输入消息…',
  Orchestrator: '编排模式',
  Planning: '规划模式',
  Plan: '规划',
  Fast: '极速',
  Turbo: '极速涡轮',
  Permissions: '权限',
  'Always allow': '始终允许',
  'Always Allow': '始终允许',
  'Allow once': '仅本次允许',
  'Allow Once': '仅本次允许',
  'Ask every time': '每次询问',
  'Review Policy': '审批策略',
  'Terminal Execution Policy': '终端执行策略',
  Send: '发送',
  Voice: '语音',
  'Attach image': '附加图片',
  'Add context': '添加上下文',

  // 通用状态、设置弹窗与扩展面板
  General: '通用',
  Appearance: '外观',
  Theme: '主题',
  'Color Theme': '配色主题',
  Light: '浅色',
  Dark: '深色',
  System: '跟随系统',
  Account: '账号',
  Accounts: '账号管理',
  Shortcuts: '快捷键',
  'Keyboard Shortcuts': '键盘快捷键',
  Privacy: '隐私',
  Rules: '规则',
  Skills: '技能',
  Workflows: '工作流',
  Hooks: '钩子',
  Extensions: '扩展',
  Marketplace: '插件市场',
  Installed: '已安装',
  Enabled: '已启用',
  Disabled: '已停用',
  Enable: '启用',
  Disable: '停用',
  Install: '安装',
  Uninstall: '卸载',
  Update: '更新',
  Delete: '删除',
  Archive: '归档',
  Pin: '置顶',
  Unpin: '取消置顶',
  Rename: '重命名',
  Close: '关闭',
  Save: '保存',
  Reset: '重置',
  Apply: '应用',
  Confirm: '确认',
  Done: '完成',
  Running: '运行中',
  Waiting: '等待中',
  Completed: '已完成',
  Failed: '失败',
  Paused: '已暂停',
  Stopped: '已停止',
  Pending: '待处理',
  Thinking: '思考中',
  Working: '处理中',
  Reading: '读取中',
  Editing: '编辑中',
  Searching: '搜索中',
  Analyzing: '分析中',
  All: '全部',
  Active: '活跃',
  Recent: '最近',
  'Browser Subagent': '浏览器子智能体',
  'Open the Swarm UI': '打开基米窝面板',

  // 空白首页与工作区上下文条
  'Where should we pick up?': '我们从哪里继续？',
  'This Computer': '本机电脑',
  'This computer': '本机电脑',
  'Local Checkout': '本地检出',
  Remote: '远程主机',
  'New project': '新建项目',
  'Add folder': '添加文件夹',

  // Settings 设置弹窗侧栏与全内页（通用 / 应用 / 通知 / 模型 / 浏览器 / 语音 / 输入框）
  Application: '应用程序',
  Notifications: '通知',
  Models: '模型',
  Browser: '浏览器',
  'Show All': '显示全部',
  'Not in Project': '未归属项目',
  Conversations: '对话列表',
  'Give Feedback': '提交反馈',
  Editor: '编辑器',
  Agent: '智能体',
  Agents: '智能体',
  Keybindings: '键位绑定',
  MCP: 'MCP',
  'MCP Servers': 'MCP 服务器',
  Integrations: '集成扩展',
  Billing: '账单',
  Usage: '用量统计',
  Subscription: '订阅',
  About: '关于',
  Advanced: '高级',
  Experimental: '实验功能',
  Storage: '存储',
  Cache: '缓存',
  Updates: '更新',
  'Configure agent execution, queued message delivery, and permissions.': '配置智能体执行策略、排队消息投递方式及权限控制。',
  'Interface Layout': '界面布局',
  'Knowledge Work': '知识工作',
  'Simplified interface for research, writing, and everyday tasks.': '适合调研、写作与日常办公的精简界面。',
  'Software Engineering': '软件工程',
  'Full interface for coding, developer tools, and managing agents.': '包含代码编写、开发工具与多智能体管理的完整界面。',
  'Configure what the agent can do in local and remote conversations.': '配置智能体在本地与远程对话中可执行的操作权限。',
  'Learn more.': '了解更多。',
  'Learn more': '了解更多',
  'Controls the actions the agent can take.': '控制智能体可以执行的本地操作。',
  'Controls permissions for remote conversations.': '控制远程对话中的权限策略。',
  'Input Box': '输入框',
  'Queued messages': '排队消息',
  'Configure when follow-up messages are sent.': '配置后续追加消息的发送时机。',
  'Keyboard shortcuts': '键盘快捷键',
  'Files Changed': '已变更文件',
  Queue: '排队',
  'Send Immediately': '立即发送',
  'Send message': '发送消息',
  'Choose which key sends a message in the chat composer.': '选择在输入框中发送消息的快捷键。',
  'Voice mode': '语音模式',
  'The voice used in Voice mode. Powered by Gemini Live.': '语音模式使用的音色（由 Gemini Live 驱动）。',
  'The voice used in Voice mode.': '语音模式使用的音色。',
  'Powered by Gemini Live.': '由 Gemini Live 驱动。',
  'Not set': '未设置',
  Change: '更改',
  Microphone: '麦克风',
  'Input device for voice mode and dictation.': '用于语音模式与语音听写的输入设备。',
  'System default': '系统默认',
  Volume: '音量',
  "How loud Antigravity's voice is.": '调节 Antigravity 语音播报的音量大小。',
  'Font Size': '字体大小',
  'Font Family': '字体族',
  'Zoom Level': '缩放比例',
  Language: '语言',
  'Auto-update': '自动更新',
  'Check for updates': '检查更新',
  'Launch at login': '开机自启',
  'Sound effects': '提示音效',
  'Desktop notifications': '桌面通知',
  'Notify when task completes': '任务完成时通知',
  'Notify when input is needed': '需要确认或输入时通知',
  'Default model': '默认模型',
  'Enabled models': '已启用模型',
  'Reasoning effort': '推理强度',
  High: '高',
  Medium: '中',
  Low: '低',
  Default: '默认',
  Custom: '自定义',
  Manage: '管理',
  Configure: '配置',
  Create: '创建',
  'Create new': '新建',
  'New rule': '新建规则',
  'New skill': '新建技能',
  'New workflow': '新建工作流',
  'New automation': '新建自动化',
  Global: '全局',
  Project: '项目',
  'Built-in': '内置',
  Community: '社区',
  'Search plugins...': '搜索插件…',
  'No results found': '未找到匹配结果',
  'Loading...': '加载中…',
  'Copied to clipboard': '已复制到剪贴板',
  'Reveal in File Explorer': '在文件资源管理器中显示',
  'Copy Relative Path': '复制相对路径',
  Stage: '暂存',
  Unstage: '取消暂存',
  Discard: '放弃更改',
  Commit: '提交',
  Push: '推送',
  Pull: '拉取',
  Diff: '差异',
  Changes: '变更',
  'Staged Changes': '已暂存变更',
  Untracked: '未跟踪',
  'No changes': '无变更',
  'All files': '全部文件',
  Modified: '已修改',
  Added: '已新增',
  Deleted: '已删除',
  'Sign in': '登录',
  'Sign out': '退出登录',
  'Log out': '退出登录',
  Profile: '个人资料',
  Quota: '配额',
  Context: '上下文',
  History: '历史记录',
  Export: '导出',
  Import: '导入',
  Backup: '备份',
  Restore: '恢复',
  'What should we build today?': '今天想构建什么？',
  'What can I help with?': '有什么我可以帮你的？',
  'Ready when you are.': '准备就绪，随时可以开始。',

  // 对话流折叠工具条
  Explored: '已探索',
  'Explored files': '已探索文件',
  'Ran command': '已运行命令',
  'Ran commands': '已运行命令',
  'Edited file': '已编辑文件',
  'Edited files': '已编辑文件',
  'Read file': '已读取文件',
  'Read files': '已读取文件',

  // Models & Usage（模型与配额）
  'Models & Usage': '模型与配额',
  'Manage your model quota and credits.': '管理你的模型配额与 AI 额度。',
  'Refresh quota and credits data': '刷新配额与额度数据',
  'No quota information available.': '暂无可用配额信息。',
  Plan: '订阅方案',
  'Your plan:': '当前方案：',
  Upgrade: '升级',
  'Model Credits': '模型额度',
  'Enable AI credit overages': '启用 AI 额度超额抵扣',
  "When toggled on, Antigravity will use your AI credits to fulfill model requests once you're out of model quota. Antigravity will always use your model quota first before using AI credits.": '开启后，当模型配额耗尽时，Antigravity 将使用你的 AI 额度继续响应请求（始终优先消耗模型配额）。',
  'Available AI credits:': '可用 AI 额度：',
  'See Activity': '查看明细',
  'Get More AI Credits': '获取更多 AI 额度',
  'Model Quota': '模型配额',
  'For Antigravity Business consumption options, see': '关于 Antigravity Business 用量选项，请参阅',
  'Orchestrator Settings': '编排器设置',
  'Choose the models Orchestrator uses. A larger, smarter orchestrator model with a faster, cheaper executor gives high quality for fewer tokens.': '选择编排器使用的模型组合：更强的规划模型搭配更快的执行模型，可用更少 Token 获得高质量产出。',
  'Model selection': '模型选择',
  'Default uses server-managed routing and Orchestrator quota. Custom pins specific models for orchestration and execution.': '默认模式由服务端自动路由并使用编排器配额；自定义模式可为规划与执行固定指定模型。',
  'Orchestrator model selection': '编排器模型选择',
  'Orchestrator Model': '规划编排模型',
  'Plans the work, makes design decisions, and reviews the result. Pick a top-tier model. You can also pick one per conversation from the Orchestrator row in the model menu.': '负责规划任务、制定设计决策与复核结果，建议选择旗舰模型（也可在单次对话的模型菜单中按需切换）。',
  'Executor Model': '代码执行模型',
  'Carries out the plan: searches, edits, builds, and tests. Pick a faster, cheaper model.': '负责按计划检索、编辑、构建与验证，建议选择更快更轻量的模型。',
  'Gemini Models': 'Gemini 模型',
  'Claude and GPT models': 'Claude 与 GPT 模型',
  'Weekly Limit Remaining': '每周剩余配额',
  'Five Hour Limit Remaining': '5 小时剩余配额',

  // Appearance（外观）
  Chat: '对话',
  'Chat Layout': '对话布局',
  Accessibility: '无障碍辅助',
  'Conversation steps': '对话步骤详情',
  'Choose how much detail is shown during a conversation.': '选择对话过程中展示的步骤详细程度。',
  Verbose: '详细',
  'Custom context menus': '自定义右键菜单',
  'Replace the default browser right-click menu with quick actions.': '使用快捷操作菜单替代默认浏览器右键菜单。',
  'Screen reader mode': '屏幕阅读器模式',
  'Optimize the interface and terminal output for screen readers.': '针对屏幕阅读器优化界面与终端输出。',
  'Conversation width': '对话区宽度',
  'Configure the maximum width of the conversation panel.': '配置对话面板的最大内容宽度。',
  Narrow: '窄',
  Wide: '宽',
  Fill: '铺满',
  'Terminal placement': '终端位置',
  'Choose where terminal sessions appear.': '选择终端会话显示的面板位置。',
  'Bottom Panel': '底部面板',
  'Side Panel': '侧边面板',
  'Side Panel Preview': '侧边栏预览',
  'Markdown artifact width': 'Markdown 产物宽度',
  'Configure the default width of markdown artifacts.': '配置 Markdown 文档产物的默认显示宽度。',
  'Context and quota indicator': '上下文与配额指示器',
  'Show how full the context window is next to the send button. Click it for a breakdown and to see your model quota.': '在发送按钮旁显示上下文窗口占用率，点击可查看详细构成与模型配额。',

  // Notifications & Sound（通知与音效）
  'Manage your notification preferences.': '管理通知与提示偏好。',
  Sound: '音效',
  'Chime volume': '提示音音量',
  'Set the volume of agent sounds.': '调节智能体提示音音量。',
  'Enable sounds for agent': '开启智能体提示音',
  'Play a sound when your action is needed or the agent finishes.': '在需要你确认或任务完成时播放提示音。',
  'Enable notifications for agent': '开启智能体系统通知',
  'Show system notifications when your action is needed or the agent finishes.': '在需要你确认或任务完成时发送系统桌面通知。',

  // Browser（浏览器）
  'Built-in Browser': '内置浏览器',
  'Open links in': '链接打开方式',
  'Choose where links open by default when clicked.': '选择点击链接时的默认打开位置。',
  'New Tab': '新标签页',
  'External Browser': '外部浏览器',
  'Download location': '下载保存路径',
  'Enable browser agent': '启用浏览器智能体',
  'Browser JavaScript execution policy': '浏览器 JavaScript 执行策略',
  'Controls whether the agent can run custom JavaScript to automate complex browser actions.': '控制智能体是否允许执行自定义 JavaScript 以完成复杂浏览器自动化操作。',
  Disabled: '已禁用',
  'Block all browser JavaScript execution.': '拦截所有浏览器 JavaScript 执行。',
  'Prompt for approval before running browser scripts.': '运行浏览器脚本前均需请求确认。',
  'Allow full browser script execution without prompting.': '允许直接执行浏览器脚本，不再弹窗询问。',

  // Application & Terminal（应用程序与终端）
  App: '应用',
  Workspaces: '工作区',
  Environments: '环境',
  Account: '账号',
  Developer: '开发者',
  Shortcuts: '快捷键',
  'Prevent sleep': '防止系统休眠',
  'Prevent the computer from sleeping while the app is running.': '在应用运行期间阻止电脑自动休眠。',
  'Keep in menu bar': '常驻菜单栏/托盘',
  'Keep the app accessible from the menu bar and running in the background when all windows are closed.': '关闭全部窗口后保持应用在后台运行并可从托盘快速唤起。',
  'Automatic check for updates': '自动检查更新',
  'Automatically prompt you to restart the app when a new update is available. When disabled, you can check for updates manually from the app menu.': '发现新版本时自动提示重启更新；关闭后可在应用菜单手动检查。',
  'Enable Remote Control': '启用远程控制',
  'Manage your conversations from the companion website.': '支持通过配套网页端远程管理你的对话。',
  Nickname: '设备昵称',
  'A nickname for identifying this application in the companion website. Changing this will restart the connection.': '用于在配套网页端识别当前设备的昵称（修改后会重连服务）。',
  'Default workspace VCS': '默认工作区版本控制 (VCS)',
  'Command setup script': '命令前置初始化脚本',
  'A shell setup script run before every command the agent executes.': '智能体每次执行终端命令前都会运行的 Shell 初始化脚本。',
  'Enable terminal sandbox': '启用终端沙箱',
  'Run terminal commands with sandbox restrictions.': '在沙箱隔离限制下运行终端命令。',
  'Terminal command auto execution': '终端命令自动执行策略',
  'Always Proceed': '始终自动放行',
  Auto: '自动',
  'Request Review': '请求审阅确认',
  'Proceed in Sandbox': '沙箱内自动放行',
  'Terminal commands automatically proceed inside the sandbox. A command that needs to leave the sandbox proceeds only if an agent judges it reversible, and otherwise requests review.': '沙箱内的终端命令自动放行；需要突破沙箱的命令仅在智能体判定可逆时继续，否则请求确认。',
  'The agent always asks for confirmation before executing terminal commands (except those in the Allow list).': '智能体在执行终端命令前始终请求确认（白名单内的命令除外）。',
  'Terminal command automatically proceeds if the command runs inside the sandbox. Otherwise, it requests review.': '命令在沙箱内执行时自动放行，否则请求确认。',
  'Interrupt the agent and send immediately.': '打断智能体当前步骤并立即发送。',
  'Queue until after the current turn.': '加入队列，等本轮结束后发送。',
  'Enter to send': '按 Enter 发送',
  "Send messages with the keyboard's Enter key instead of starting a new line.": '按 Enter 键直接发送消息，而非换行。',
  'Include Jetski default customizations': '包含默认内置定制项',
  'Include default customizations, such as default skills.': '包含默认技能等官方内置定制内容。',
  'Telemetry is turned off for your account.': '你的账号已关闭遥测数据上报。',
  'This setting is turned off for your account.': '此设置已在你的账号中关闭。',
  'Provide Feedback': '提供反馈',

  // Keybindings（快捷键动作名，保留 Ctrl/Shift/Alt/Enter/Tab/Esc 按键名不翻译）
  'Open Keyboard Shortcuts': '打开快捷键设置',
  'Toggle Sidebar': '切换侧边栏',
  'Copy Conversation Markdown': '复制对话 Markdown',
  'Archive This Conversation': '归档此对话',
  'Pin This Conversation': '置顶此对话',
  'Unpin This Conversation': '取消置顶此对话',
  'Find in Conversation': '在对话中查找',
  'Jump to Previous Prompt': '跳转到上一条提问',
  'Jump to Next Prompt': '跳转到下一条提问',
  'Mark All as Read': '全部标为已读',
  'Mark This Conversation as Read': '将此对话标为已读',
  'Mark This Conversation as Unread': '将此对话标为未读',
  'Rename This Conversation': '重命名此对话',
  'Move to New Group': '移动到新分组',
  'Remove from Group': '从分组移除',
  'Move Conversation Up': '上移对话',
  'Move Conversation Down': '下移对话',
  'Copy Conversation ID': '复制对话 ID',
  'Copy Trajectory ID': '复制轨迹 ID',
  'Download Diagnostics': '下载诊断日志',
  'Toggle Between Light/Dark Themes': '切换浅色/深色主题',
  'Switch to This Computer': '切换到本机电脑',
  'Previous Side Panel Tab': '上一个侧边栏标签页',
  'Next Side Panel Tab': '下一个侧边栏标签页',
  'Collapse All Folders': '折叠所有文件夹',
  'Expand All Folders': '展开所有文件夹',
  'Select All': '全选',
  'Cancel Generation': '取消生成',
  'Submit Prompt (Alternate to Enter)': '提交提问（Enter 备选快捷键）',
  'Terminal: Add to Chat': '终端：添加到对话',
};

/** 哈基米萌系中文精确覆盖词条（在标准中文基础上做二次元猫窝趣味化） */
export const HOST_I18N_EXACT_NEKO = {
  ...HOST_I18N_EXACT_ZH,
  Workspace: '工作窝',
  View: '喵视角',
  Window: '喵窗',
  'New Conversation': '开启新喵聊',
  Automations: '自动托管喵',
  Customizations: '猫窝装扮',
  Projects: '猫窝项目',
  'No conversations yet': '还没有开聊喵',
  Settings: '猫窝设置',
  Search: '寻宝搜索',
  'Search conversations': '翻找历史喵聊',
  'Add Project': '新添猫窝项目',
  Overview: '猫窝总览',
  Review: '爪印审阅',
  Files: '仓库文件',
  Terminal: '喵令终端',
  Plugins: '猫窝插件',
  Subagents: '蜂巢小猫',
  'Side Questions': '悄悄插嘴',
  'Background Tasks': '后台打工喵',
  Artifacts: '喵爪手稿',
  Customize: '整理面板',
  'Load older messages': '翻看更早猫爪印',
  'Conversation Log': '喵聊记录',
  'Agent said': '哈基米回复',
  'You said': '主人说',
  Accept: '放行喵',
  'Accept all': '全部放行喵',
  'Accept All': '全部放行喵',
  Reject: '打回喵',
  'Reject all': '全部打回喵',
  'Reject All': '全部打回喵',
  Revert: '时光倒流喵',
  'Ask anything, @ to mention, / for actions': '问点啥都行喵~ @ 提及文件，/ 召唤指令 ✦',
  'Ask anything...': '想让哈基米干点啥喵…',
  Orchestrator: '总管编排喵',
  Planning: '军师规划中',
  Fast: '闪电冲刺',
  Turbo: '涡轮飙车喵',
  Permissions: '猫爪权限',
  Running: '飞速狂奔中',
  Waiting: '歪头等指令',
  Completed: '圆满搞定喵',
  Failed: '炸毛报错啦',
  Thinking: '猫脑高速运转',
  Working: '认真干活喵',
  Reading: '凑近仔细看',
  Editing: '爪子狂敲中',
  Analyzing: '深潜洞察中',
  Analyzed: '分析完毕',
  'Just now': '刚才喵',
  'just now': '刚才喵',
  'This Computer': '这台猫窝主机',
  'This computer': '这台猫窝主机',
  'Local Checkout': '本地仓库检出',
  Remote: '远端窝点',
  'Knowledge Work': '轻量知识喵',
  'Software Engineering': '全能工程喵',
  'Send Immediately': '立刻发喵',
  'What should we build today?': '今天带哈基米一起造点什么喵？',
  'What can I help with?': '今天想让猫窝帮你搞定什么喵？',
  'Ready when you are.': '哈基米已蹲好待命，随时开工喵！',
  Explored: '已探路喵',
  'Explored files': '翻看过的文件',
  'Models & Usage': '模型与猫粮配额',
  'Your plan:': '当前猫窝方案：',
  'Weekly Limit Remaining': '本周剩余猫粮',
  'Five Hour Limit Remaining': '5 小时剩余猫粮',
  'Files Changed': '爪印变更文件',
};

/** 动态正则模板定义（以字面串数组存放，便于无损耗注入与直接单测） */
export const HOST_I18N_PATTERN_SPECS = [
  { id: 'orchestrator-model', source: '^Orchestrator\\s+(.+)$', flags: 'i', zh: '编排模式 $1', neko: '总管编排喵 $1' },
  { id: 'welcome-back-full', source: '^Welcome back,\\s*(.+?)\\.\\s*Where should we pick up\\?$', flags: 'i', zh: '欢迎回来，$1，我们从哪里继续？', neko: '欢迎回窝，$1！今天想从哪开工喵？' },
  { id: 'welcome-back-short', source: '^Welcome back,\\s*(.+?)!?$', flags: 'i', zh: '欢迎回来，$1！', neko: '欢迎回窝，$1 喵！' },
  { id: 'hey-build-today', source: '^Hey\\s+(.+?),\\s*what should we build today\\?$', flags: 'i', zh: '你好，$1，今天想构建什么？', neko: '嗨 $1，今天带哈基米一起造点什么喵？' },
  { id: 'hey-what-general', source: '^Hey\\s+(.+?),\\s*what(?:\\s+are\\s+we|\\s+can\\s+I|\\s+would\\s+you\\s+like\\s+to)\\s+(.+?)\\?$', flags: 'i', zh: '你好，$1，今天打算做什么？', neko: '嗨 $1，今天想让基米窝帮你搞定什么喵？' },
  { id: 'hi-what-general', source: '^Hi\\s+(.+?),\\s*what\\s+(.+?)\\?$', flags: 'i', zh: '你好，$1，今天要做什么？', neko: '喵呜 $1，今天先从哪里开工呀？' },
  { id: 'good-to-see-you-next', source: "^Good to see you,\\s*(.+?)\\.\\s*What's next\\?$", flags: 'i', zh: '很高兴见到你，$1，接下来做什么？', neko: '见到你真开心，$1 喵！接下来干点啥？' },
  { id: 'good-to-see-you', source: '^Good to see you,\\s*(.+?)[.!?]?$', flags: 'i', zh: '很高兴见到你，$1！', neko: '见到你真开心，$1 喵！' },
  { id: 'good-time-greeting', source: '^(?:Good\\s+(?:morning|afternoon|evening)),\\s*(.+?)[.!?]?$', flags: 'i', zh: '你好，$1！', neko: '哈基米向你问好，$1 喵！' },
  { id: 'plan-name', source: '^Your plan:\\s*(.+)$', flags: 'i', zh: '当前订阅：$1', neko: '当前猫窝方案：$1' },
  { id: 'upgrade-plan', source: '^You can upgrade to a higher\\s+(.+?)\\s+plan to receive the highest rate limits\\.$', flags: 'i', zh: '可升级至更高档位的 $1 方案以获取最高速率限额。', neko: '升级更高档位 $1 方案即可解锁最高速率限额喵。' },
  { id: 'available-credits', source: '^Available AI credits:\\s*(.+)$', flags: 'i', zh: '可用 AI 额度：$1', neko: '可用 AI 额度：$1' },
  { id: 'quota-refresh-weekly', source: '^You have used some of your weekly limit,\\s*it will fully refresh in\\s+(.+?)\\.?$', flags: 'i', zh: '已消耗部分每周配额，将在 $1 后完全重置。', neko: '本周猫粮已消耗一部分，将在 $1 后满血补齐喵。' },
  { id: 'quota-refresh-5h', source: '^You have used some of your 5-hour limit,\\s*it will fully refresh in\\s+(.+?)\\.?$', flags: 'i', zh: '已消耗部分 5 小时配额，将在 $1 后完全重置。', neko: '5 小时猫粮已消耗一部分，将在 $1 后满血补齐喵。' },
  { id: 'explored-n-files', source: '^Explored\\s+(\\d+)\\s+files?$', flags: 'i', zh: '已探索 $1 个文件', neko: '翻看了 $1 个文件喵' },
  { id: 'read-n-files', source: '^Read\\s+(\\d+)\\s+files?$', flags: 'i', zh: '已读取 $1 个文件', neko: '凑近看了 $1 个文件' },
  { id: 'edited-n-files', source: '^Edited\\s+(\\d+)\\s+files?$', flags: 'i', zh: '已编辑 $1 个文件', neko: '爪子改了 $1 个文件' },
  { id: 'ran-n-commands', source: '^Ran\\s+(\\d+)\\s+commands?$', flags: 'i', zh: '已运行 $1 条命令', neko: '跑了 $1 条命令喵' },
  { id: 'worked-for', source: '^Worked for\\s+(.+)$', flags: 'i', zh: '已工作 $1', neko: '猫猫打工 $1' },
  { id: 'thought-for', source: '^Thought for\\s+(.+)$', flags: 'i', zh: '已思考 $1', neko: '转猫脑 $1' },
  { id: 'thinking-for', source: '^Thinking for\\s+(.+)$', flags: 'i', zh: '思考中 $1', neko: '猫脑运转 $1' },
  { id: 'steps-pair', source: '^(\\d+)\\s*/\\s*(\\d+)\\s*steps?$', flags: 'i', zh: '$1/$2 步', neko: '$1/$2 爪步' },
  { id: 'files-changed', source: '^(\\d+)\\s+files?\\s+changed$', flags: 'i', zh: '$1 个文件已变更', neko: '啃了 $1 个文件' },
  { id: 'tasks-done', source: '^(\\d+)\\s+of\\s+(\\d+)\\s+tasks?\\s+done$', flags: 'i', zh: '已完成 $1/$2 项任务', neko: '搞定 $1/$2 个猫任务' },
  { id: 'show-more-n', source: '^Show\\s+(\\d+)\\s+more$', flags: 'i', zh: '展开其余 $1 项', neko: '再看 $1 条喵' },
  { id: 'ago-sec', source: '^(\\d+)\\s*s\\s+ago$', flags: 'i', zh: '$1 秒前', neko: '$1 秒前喵' },
  { id: 'ago-min', source: '^(\\d+)\\s*m(?:ins?)?\\s+ago$', flags: 'i', zh: '$1 分钟前', neko: '$1 分钟前喵' },
  { id: 'ago-hr', source: '^(\\d+)\\s*h(?:rs?)?\\s+ago$', flags: 'i', zh: '$1 小时前', neko: '$1 小时前喵' },
  { id: 'ago-day', source: '^(\\d+)\\s*d(?:ays?)?\\s+ago$', flags: 'i', zh: '$1 天前', neko: '$1 天前喵' },
];

function formatDurationZh(text) {
  return String(text)
    .replace(/(\d+)\s*days?\s*,\s*/gi, '$1 天 ')
    .replace(/(\d+)\s*hours?\s*,\s*/gi, '$1 小时 ')
    .replace(/\b(\d+)\s*days?\b/gi, '$1 天')
    .replace(/\b(\d+)\s*hours?\b/gi, '$1 小时')
    .replace(/\b(\d+)\s*minutes?\b/gi, '$1 分钟')
    .replace(/\s{2,}/g, ' ');
}

const COMPILED_PATTERNS = HOST_I18N_PATTERN_SPECS.map((sp) => ({
  ...sp,
  regex: new RegExp(sp.source, sp.flags),
}));

/**
 * 纯函数：根据指定风格将宿主 UI 英文文本翻译为目标中文（保留前后空白；未命中返回 null）。
 * @param {string} rawText
 * @param {'zh'|'neko-zh'} [style]
 * @returns {string|null}
 */
export function translateHostText(rawText, style = 'neko-zh') {
  if (typeof rawText !== 'string' || !rawText) return null;
  const trimmed = rawText.trim();
  if (!trimmed || trimmed.length > 260) return null;
  // 品牌名与无英文字母串跳过
  if (!/[A-Za-z]/.test(trimmed) || /^Antigravity$/i.test(trimmed)) return null;

  const isNeko = style !== 'zh';
  const dict = isNeko ? HOST_I18N_EXACT_NEKO : HOST_I18N_EXACT_ZH;
  let translated = null;

  if (Object.prototype.hasOwnProperty.call(dict, trimmed)) {
    translated = dict[trimmed];
  } else {
    for (const pat of COMPILED_PATTERNS) {
      if (pat.regex.test(trimmed)) {
        const tpl = isNeko ? pat.neko : pat.zh;
        translated = trimmed.replace(pat.regex, tpl);
        if (pat.id === 'quota-refresh-weekly' || pat.id === 'quota-refresh-5h') {
          translated = formatDurationZh(translated);
        }
        break;
      }
    }
  }

  if (!translated || translated === trimmed) return null;
  const leading = rawText.match(/^\s*/)?.[0] || '';
  const trailing = rawText.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

/**
 * 构造在 Antigravity 宿主 Renderer 上下文中运行的内置可选汉化引擎源码片段。
 * 暴露 `initHostI18nEngine(initialCfg)`，并自动挂载 `window.__GEMINEKO_I18N_API__`。
 * @returns {string}
 */
export function buildHostI18nRuntimeSnippet() {
  const exactZhJson = JSON.stringify(HOST_I18N_EXACT_ZH);
  const exactNekoJson = JSON.stringify(HOST_I18N_EXACT_NEKO);
  const patternSpecsJson = JSON.stringify(HOST_I18N_PATTERN_SPECS);

  return `
  function initHostI18nEngine(initialCfg) {
    const EXACT_ZH = ${exactZhJson};
    const EXACT_NEKO = ${exactNekoJson};
    const PATTERN_SPECS = ${patternSpecsJson};
    const PATTERNS = PATTERN_SPECS.map((sp) => ({
      id: sp.id,
      regex: new RegExp(sp.source, sp.flags),
      zh: sp.zh,
      neko: sp.neko,
    }));

    const SKIP_CONTAINER_SEL = [
      '[data-testid="planner-response-text"]',
      '[data-testid="user-message-bubble"]',
      '[data-testid="user-message-content"]',
      'pre',
      'code',
      '.monaco-editor',
      'textarea',
      '[contenteditable="true"]',
      'svg',
      'script',
      'style',
      '#gemineko-cdp-composer-dock',
      '#gemineko-home-stage',
      '#gemineko-corner-watermark',
      '#gemineko-dock-minibar',
      '#gemineko-paw-outline-pop',
      '#gemineko-context-menu',
    ].join(',');

    // 属性翻译仍允许覆盖输入框本身的 placeholder / data-placeholder / aria-placeholder，仅排除插件自绘容器与代码区
    const SKIP_ATTR_CONTAINER_SEL = [
      'pre',
      'code',
      '.monaco-editor',
      '#gemineko-cdp-composer-dock',
      '#gemineko-home-stage',
      '#gemineko-corner-watermark',
      '#gemineko-dock-minibar',
      '#gemineko-paw-outline-pop',
      '#gemineko-context-menu',
    ].join(',');

    const ATTR_NAMES = ['placeholder', 'data-placeholder', 'aria-placeholder', 'title', 'aria-label'];
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'PRE', 'CODE', 'TEXTAREA', 'SVG', 'HEAD', 'NOSCRIPT']);

    let nodeStateMap = new WeakMap();
    let attrStateMap = new WeakMap();
    const trackedNodes = new Set();
    const trackedEls = new Set();
    const pendingRoots = new Set();
    let cfg = initialCfg && typeof initialCfg === 'object' ? initialCfg : {};
    let observer = null;
    let flushTimer = null;
    let safetyTimer = null;
    let clickRescanTimer = null;
    let listenersBound = false;
    let applying = false;
    let disposed = false;

    function resolveEffectiveStyle() {
      if (cfg.enabled === false) return 'off';
      const i18n = cfg.i18n && typeof cfg.i18n === 'object' ? cfg.i18n : {};
      const mode = i18n.mode || 'auto';
      if (mode === 'off') return 'off';
      if (mode === 'zh' || mode === 'neko-zh') return mode;
      const navLang = String((navigator && (navigator.language || (navigator.languages && navigator.languages[0]))) || '').toLowerCase();
      if (!navLang.startsWith('zh')) return 'off';
      return i18n.autoChineseStyle === 'zh' ? 'zh' : 'neko-zh';
    }

    function formatDurationZh(text) {
      return String(text)
        .replace(/(\\d+)\\s*days?\\s*,\\s*/gi, '$1 天 ')
        .replace(/(\\d+)\\s*hours?\\s*,\\s*/gi, '$1 小时 ')
        .replace(/\\b(\\d+)\\s*days?\\b/gi, '$1 天')
        .replace(/\\b(\\d+)\\s*hours?\\b/gi, '$1 小时')
        .replace(/\\b(\\d+)\\s*minutes?\\b/gi, '$1 分钟')
        .replace(/\\s{2,}/g, ' ');
    }

    function translateRaw(rawText, style, elHint) {
      if (style === 'off' || typeof rawText !== 'string' || !rawText) return null;
      const trimmed = rawText.trim();
      if (!trimmed || trimmed.length > 260 || !/[A-Za-z]/.test(trimmed) || /^Antigravity$/i.test(trimmed)) return null;

      const isNeko = style !== 'zh';
      const dict = isNeko ? EXACT_NEKO : EXACT_ZH;
      let hit = null;

      if (Object.prototype.hasOwnProperty.call(dict, trimmed)) {
        hit = dict[trimmed];
      } else {
        for (const p of PATTERNS) {
          if (p.regex.test(trimmed)) {
            hit = trimmed.replace(p.regex, isNeko ? p.neko : p.zh);
            if (p.id === 'quota-refresh-weekly' || p.id === 'quota-refresh-5h') {
              hit = formatDurationZh(hit);
            }
            break;
          }
        }
        // 仅在侧栏对话行短时间戳节点内替换裸 "14m"/"2d"
        if (!hit && elHint && elHint.closest && elHint.closest('[data-testid="conversation-row-sidebar"]')) {
          const m = /^(\\d+)\\s*([smhd])$/i.exec(trimmed);
          if (m) {
            const unitMap = { s: '秒前', m: '分钟前', h: '小时前', d: '天前' };
            hit = m[1] + (unitMap[m[2].toLowerCase()] || '');
          }
        }
      }
      if (!hit || hit === trimmed) return null;
      const lead = rawText.match(/^\\s*/)?.[0] || '';
      const trail = rawText.match(/\\s*$/)?.[0] || '';
      return lead + hit + trail;
    }

    function shouldSkipElement(el) {
      if (!el || el.nodeType !== 1) return true;
      if (SKIP_TAGS.has(el.tagName)) return true;
      return Boolean(el.closest && el.closest(SKIP_CONTAINER_SEL));
    }

    function shouldSkipAttrElement(el) {
      if (!el || el.nodeType !== 1) return true;
      const tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'PRE' || tag === 'CODE' || tag === 'SVG') return true;
      return Boolean(el.closest && el.closest(SKIP_ATTR_CONTAINER_SEL));
    }

    function processTextNode(node, style) {
      const parent = node.parentElement;
      if (!parent || shouldSkipElement(parent)) return;
      const cur = node.nodeValue || '';
      let rec = nodeStateMap.get(node);
      if (!rec) {
        rec = { orig: cur, applied: null };
        nodeStateMap.set(node, rec);
      } else if (cur !== rec.applied && cur !== rec.orig) {
        // React 复用同一 Text 节点并写入了新英文内容：刷新原文本基准，绝不回写旧缓存
        rec.orig = cur;
        rec.applied = null;
      }

      if (style === 'off') {
        if (rec.applied !== null && cur === rec.applied) {
          if (cur !== rec.orig) node.nodeValue = rec.orig;
          rec.applied = null;
        }
        return;
      }

      const next = translateRaw(rec.orig, style, parent);
      if (next) {
        if (cur !== next) node.nodeValue = next;
        rec.applied = next;
        trackedNodes.add(node);
      } else if (rec.applied !== null && cur === rec.applied) {
        if (cur !== rec.orig) node.nodeValue = rec.orig;
        rec.applied = null;
      }
    }

    function processElementAttrs(el, style) {
      if (shouldSkipAttrElement(el)) return;
      let stateRec = attrStateMap.get(el);
      for (const attr of ATTR_NAMES) {
        const cur = el.getAttribute(attr);
        if (cur == null) {
          if (stateRec && stateRec[attr]) delete stateRec[attr];
          continue;
        }
        if (!stateRec) {
          stateRec = {};
          attrStateMap.set(el, stateRec);
        }
        let rec = stateRec[attr];
        if (!rec) {
          rec = { orig: cur, applied: null };
          stateRec[attr] = rec;
        } else if (cur !== rec.applied && cur !== rec.orig) {
          // 宿主主动更新了 placeholder/aria-label，同步更新 orig 基准
          rec.orig = cur;
          rec.applied = null;
        }

        if (style === 'off') {
          if (rec.applied !== null && cur === rec.applied) {
            if (cur !== rec.orig) el.setAttribute(attr, rec.orig);
            rec.applied = null;
          }
          continue;
        }

        const next = translateRaw(rec.orig, style, el);
        if (next) {
          if (cur !== next) el.setAttribute(attr, next);
          rec.applied = next;
          trackedEls.add(el);
        } else if (rec.applied !== null && cur === rec.applied) {
          if (cur !== rec.orig) el.setAttribute(attr, rec.orig);
          rec.applied = null;
        }
      }
    }

    function walkSubtree(rootEl, style) {
      const targetRoot = rootEl || document.body || document.documentElement;
      if (!targetRoot) return;
      const wasApplying = applying;
      applying = true;
      try {
        if (targetRoot.nodeType === 3) {
          processTextNode(targetRoot, style);
          return;
        }
        const shadowRoots = [];
        if (targetRoot.nodeType === 1) {
          processElementAttrs(targetRoot, style);
          if (targetRoot.shadowRoot) shadowRoots.push(targetRoot.shadowRoot);
        }
        if (targetRoot.querySelectorAll) {
          const attrEls = targetRoot.querySelectorAll('[placeholder], [data-placeholder], [aria-placeholder], [title], [aria-label]');
          for (const el of attrEls) processElementAttrs(el, style);
        }

        const acceptNode = (node) => {
          if (node.nodeType === 1) {
            if (SKIP_TAGS.has(node.tagName) || (node.matches && node.matches(SKIP_CONTAINER_SEL))) {
              return NodeFilter.FILTER_REJECT;
            }
            if (node.shadowRoot) shadowRoots.push(node.shadowRoot);
            return NodeFilter.FILTER_SKIP;
          }
          return node.nodeType === 3 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        };

        const walker = document.createTreeWalker(
          targetRoot,
          NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
          { acceptNode },
        );
        let n;
        while ((n = walker.nextNode())) {
          processTextNode(n, style);
        }

        for (const sr of shadowRoots) {
          walkSubtree(sr, style);
        }
      } catch {} finally {
        if (!wasApplying) {
          // 吞掉本轮改写产生的自身变更记录，防止空转二次触发 observer
          try { observer?.takeRecords?.(); } catch {}
          applying = false;
        }
      }
    }

    function pruneTrackedRefs() {
      if (trackedNodes.size > 600) {
        for (const n of trackedNodes) {
          if (!n || !n.isConnected) trackedNodes.delete(n);
        }
      }
      if (trackedEls.size > 400) {
        for (const el of trackedEls) {
          if (!el || !el.isConnected) trackedEls.delete(el);
        }
      }
    }

    function restoreAllOriginal() {
      applying = true;
      try {
        for (const node of trackedNodes) {
          if (!node || !node.isConnected) continue;
          const rec = nodeStateMap.get(node);
          if (rec && rec.applied !== null && node.nodeValue === rec.applied) {
            if (node.nodeValue !== rec.orig) node.nodeValue = rec.orig;
            rec.applied = null;
          }
        }
        for (const el of trackedEls) {
          if (!el || !el.isConnected) continue;
          const stateRec = attrStateMap.get(el);
          if (!stateRec) continue;
          for (const [k, rec] of Object.entries(stateRec)) {
            if (!rec || rec.applied === null) continue;
            const cur = el.getAttribute(k);
            if (cur === rec.applied) {
              if (cur !== rec.orig) el.setAttribute(k, rec.orig);
              rec.applied = null;
            }
          }
        }
        trackedNodes.clear();
        trackedEls.clear();
        pendingRoots.clear();
        nodeStateMap = new WeakMap();
        attrStateMap = new WeakMap();
      } catch {} finally {
        try { observer?.takeRecords?.(); } catch {}
        applying = false;
      }
    }

    function flushPending() {
      flushTimer = null;
      if (disposed || applying) return;
      const style = resolveEffectiveStyle();
      if (style === 'off') {
        pendingRoots.clear();
        return;
      }
      const batch = Array.from(pendingRoots);
      pendingRoots.clear();
      if (batch.length === 0) return;

      const rootHost = document.body || document.documentElement;
      if (batch.length > 40) {
        if (rootHost) walkSubtree(rootHost, style);
        return;
      }

      const rootSet = new Set(batch);
      for (const root of batch) {
        if (!root || !root.isConnected) continue;
        // 祖先节点也在本次队列中时直接合并跳过，避免重复子树扫描
        let redundant = false;
        let cur = root.parentNode;
        while (cur) {
          if (rootSet.has(cur)) { redundant = true; break; }
          cur = cur.parentNode;
        }
        if (!redundant) walkSubtree(root, style);
      }
    }

    function enqueueNode(node) {
      if (!node || !node.isConnected) return;
      if (node.nodeType === 3) {
        const p = node.parentElement;
        if (!p || shouldSkipElement(p)) return;
        pendingRoots.add(node);
        return;
      }
      if (node.nodeType === 1) {
        if (SKIP_TAGS.has(node.tagName) && node.tagName !== 'TEXTAREA') return;
        if (shouldSkipAttrElement(node)) return;
        if (shouldSkipElement(node)) {
          // 对跳过容器（如 contenteditable 输入框），仅允许包含待翻属性的元素入队
          const hasAttr = ATTR_NAMES.some((a) => node.hasAttribute && node.hasAttribute(a));
          if (!hasAttr) return;
        }
        pendingRoots.add(node);
      }
    }

    function scheduleFlush() {
      // 固定节流窗口（不 clearTimeout），彻底消灭高频 DOM 更新导致的防抖饥饿
      if (flushTimer || disposed) return;
      flushTimer = setTimeout(flushPending, 60);
    }

    function rescan(targetRoot) {
      if (disposed || applying) return;
      const style = resolveEffectiveStyle();
      if (style === 'off') return;
      const host = targetRoot || document.body || document.documentElement;
      if (host) walkSubtree(host, style);
    }

    function onDocClickRescan() {
      if (disposed || clickRescanTimer) return;
      if (resolveEffectiveStyle() === 'off') return;
      clickRescanTimer = setTimeout(() => {
        clickRescanTimer = null;
        if (!disposed) rescan();
      }, 120);
    }

    function onWinFocusOrVisible() {
      if (disposed) return;
      if (typeof document.hidden === 'boolean' && document.hidden) return;
      rescan();
    }

    function ensureListeners() {
      if (listenersBound) return;
      listenersBound = true;
      document.addEventListener('click', onDocClickRescan, true);
      window.addEventListener('focus', onWinFocusOrVisible);
      document.addEventListener('visibilitychange', onWinFocusOrVisible);
      if (!safetyTimer) {
        safetyTimer = setInterval(() => {
          if (disposed || applying) return;
          if (typeof document.hidden === 'boolean' && document.hidden) return;
          const style = resolveEffectiveStyle();
          if (style === 'off') return;
          const host = document.body || document.documentElement;
          if (host) walkSubtree(host, style);
          pruneTrackedRefs();
        }, 1500);
      }
    }

    function stopListeners() {
      if (clickRescanTimer) { clearTimeout(clickRescanTimer); clickRescanTimer = null; }
      if (safetyTimer) { clearInterval(safetyTimer); safetyTimer = null; }
      if (listenersBound) {
        listenersBound = false;
        document.removeEventListener('click', onDocClickRescan, true);
        window.removeEventListener('focus', onWinFocusOrVisible);
        document.removeEventListener('visibilitychange', onWinFocusOrVisible);
      }
    }

    function ensureObserver() {
      const targetRoot = document.documentElement || document.body;
      if (observer || !targetRoot) return;
      observer = new MutationObserver((records) => {
        if (disposed || applying) return;
        const style = resolveEffectiveStyle();
        if (style === 'off') return;
        if (!records || records.length === 0) {
          enqueueNode(document.body || document.documentElement);
        } else {
          for (let i = 0; i < records.length; i++) {
            const rec = records[i];
            if (rec.type === 'childList') {
              const added = rec.addedNodes;
              for (let j = 0; j < added.length; j++) {
                enqueueNode(added[j]);
              }
            } else if (rec.type === 'characterData' || rec.type === 'attributes') {
              enqueueNode(rec.target);
            }
          }
        }
        if (pendingRoots.size > 0) scheduleFlush();
      });
      observer.observe(targetRoot, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTR_NAMES,
      });
    }

    function stopObserver() {
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      pendingRoots.clear();
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      stopListeners();
    }

    function applyConfig(nextCfg) {
      if (disposed) return;
      cfg = nextCfg && typeof nextCfg === 'object' ? nextCfg : {};
      const style = resolveEffectiveStyle();
      if (style === 'off') {
        stopObserver();
        restoreAllOriginal();
        return;
      }
      const host = document.body || document.documentElement;
      if (host) walkSubtree(host, style);
      ensureObserver();
      ensureListeners();
    }

    function unmount() {
      disposed = true;
      stopObserver();
      restoreAllOriginal();
      if (window.__GEMINEKO_I18N_API__) {
        window.__GEMINEKO_I18N_API__ = null;
      }
    }

    function getStats() {
      let aliveNodes = 0;
      for (const n of trackedNodes) {
        if (n && n.isConnected) aliveNodes += 1;
      }
      let aliveAttrs = 0;
      for (const e of trackedEls) {
        if (e && e.isConnected) aliveAttrs += 1;
      }
      return {
        effectiveStyle: resolveEffectiveStyle(),
        mode: cfg?.i18n?.mode || 'auto',
        autoChineseStyle: cfg?.i18n?.autoChineseStyle || 'neko-zh',
        translatedTextNodes: aliveNodes,
        translatedAttrElements: aliveAttrs,
        observerActive: Boolean(observer),
      };
    }

    applyConfig(cfg);
    const api = { applyConfig, rescan, unmount, getStats, resolveEffectiveStyle };
    window.__GEMINEKO_I18N_API__ = api;
    return api;
  }
  `;
}
