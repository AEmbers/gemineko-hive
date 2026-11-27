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
  Queue: '排队',
  'Send Immediately': '立即发送',
  'Send message': '发送消息',
  'Choose which key sends a message in the chat composer.': '选择在输入框中发送消息的快捷键。',
  'Voice mode': '语音模式',
  'The voice used in Voice mode. Powered by Gemini Live.': '语音模式使用的音色（由 Gemini Live 驱动）。',
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
  'What should we build today?': '今天想带哈基米造点什么喵？✦',
  'What can I help with?': '今天想让猫窝帮你搞定什么喵？',
  'Ready when you are.': '哈基米已蹲好待命，随时开工喵！',
};

/** 动态正则模板定义（以字面串数组存放，便于无损耗注入与直接单测） */
export const HOST_I18N_PATTERN_SPECS = [
  { id: 'welcome-back-full', source: '^Welcome back,\\s*(.+?)\\.\\s*Where should we pick up\\?$', flags: 'i', zh: '欢迎回来，$1，我们从哪里继续？', neko: '欢迎回窝，$1！今天想从哪开工喵？' },
  { id: 'welcome-back-short', source: '^Welcome back,\\s*(.+?)!?$', flags: 'i', zh: '欢迎回来，$1！', neko: '欢迎回窝，$1 喵！' },
  { id: 'hey-build-today', source: '^Hey\\s+(.+?),\\s*what should we build today\\?$', flags: 'i', zh: '你好，$1，今天想构建什么？', neko: '嗨 $1，今天带哈基米一起造点什么喵？✦' },
  { id: 'hey-what-general', source: '^Hey\\s+(.+?),\\s*what(?:\\s+are\\s+we|\\s+can\\s+I|\\s+would\\s+you\\s+like\\s+to)\\s+(.+?)\\?$', flags: 'i', zh: '你好，$1，今天打算做什么？', neko: '嗨 $1，今天想让基米窝帮你搞定什么喵？✦' },
  { id: 'hi-what-general', source: '^Hi\\s+(.+?),\\s*what\\s+(.+?)\\?$', flags: 'i', zh: '你好，$1，今天要做什么？', neko: '喵呜 $1，今天先从哪里开工呀？✦' },
  { id: 'good-to-see-you-next', source: "^Good to see you,\\s*(.+?)\\.\\s*What's next\\?$", flags: 'i', zh: '很高兴见到你，$1，接下来做什么？', neko: '见到你真开心，$1 喵！接下来干点啥？✦' },
  { id: 'good-to-see-you', source: '^Good to see you,\\s*(.+?)[.!?]?$', flags: 'i', zh: '很高兴见到你，$1！', neko: '见到你真开心，$1 喵！✦' },
  { id: 'good-time-greeting', source: '^(?:Good\\s+(?:morning|afternoon|evening)),\\s*(.+?)[.!?]?$', flags: 'i', zh: '你好，$1！', neko: '哈基米向你问好，$1 喵！✦' },
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
  if (!trimmed || trimmed.length > 240) return null;
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

    let origTextMap = new WeakMap();
    let origAttrMap = new WeakMap();
    const trackedNodes = new Set();
    const trackedEls = new Set();
    let cfg = initialCfg && typeof initialCfg === 'object' ? initialCfg : {};
    let observer = null;
    let flushTimer = null;
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

    function translateRaw(rawText, style, elHint) {
      if (style === 'off' || typeof rawText !== 'string' || !rawText) return null;
      const trimmed = rawText.trim();
      if (!trimmed || trimmed.length > 240 || !/[A-Za-z]/.test(trimmed) || /^Antigravity$/i.test(trimmed)) return null;

      const isNeko = style !== 'zh';
      const dict = isNeko ? EXACT_NEKO : EXACT_ZH;
      let hit = null;

      if (Object.prototype.hasOwnProperty.call(dict, trimmed)) {
        hit = dict[trimmed];
      } else {
        for (const p of PATTERNS) {
          if (p.regex.test(trimmed)) {
            hit = trimmed.replace(p.regex, isNeko ? p.neko : p.zh);
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
      const tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'PRE' || tag === 'CODE' || tag === 'TEXTAREA') return true;
      return Boolean(el.closest && el.closest(SKIP_CONTAINER_SEL));
    }

    function processTextNode(node, style) {
      const parent = node.parentElement;
      if (!parent || shouldSkipElement(parent)) return;
      if (!origTextMap.has(node)) {
        origTextMap.set(node, node.nodeValue || '');
      }
      const orig = origTextMap.get(node);
      if (style === 'off') {
        if ((node.nodeValue || '') !== orig) node.nodeValue = orig;
        return;
      }
      const next = translateRaw(orig, style, parent);
      if (next && node.nodeValue !== next) {
        node.nodeValue = next;
        trackedNodes.add(node);
      } else if (!next && node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
    }

    function processElementAttrs(el, style) {
      if (!el || el.nodeType !== 1) return;
      if (el.closest && el.closest('#gemineko-cdp-composer-dock, #gemineko-home-stage, #gemineko-dock-minibar, #gemineko-paw-outline-pop, #gemineko-context-menu, pre, code, .monaco-editor')) {
        return;
      }
      const attrs = ['placeholder', 'data-placeholder', 'title', 'aria-label'];
      let rec = origAttrMap.get(el);
      for (const attr of attrs) {
        const cur = el.getAttribute(attr);
        if (cur == null) continue;
        if (!rec) { rec = {}; origAttrMap.set(el, rec); }
        if (!Object.prototype.hasOwnProperty.call(rec, attr)) {
          rec[attr] = cur;
        }
        const orig = rec[attr];
        if (style === 'off') {
          if (cur !== orig) el.setAttribute(attr, orig);
        } else {
          const next = translateRaw(orig, style, el);
          if (next && cur !== next) {
            el.setAttribute(attr, next);
            trackedEls.add(el);
          } else if (!next && cur !== orig) {
            el.setAttribute(attr, orig);
          }
        }
      }
    }

    function walkSubtree(rootEl, style) {
      if (!rootEl || !document.body) return;
      applying = true;
      try {
        if (rootEl.nodeType === 3) {
          processTextNode(rootEl, style);
          return;
        }
        if (rootEl.nodeType === 1) {
          processElementAttrs(rootEl, style);
          const attrEls = rootEl.querySelectorAll('[placeholder], [data-placeholder], [title], [aria-label]');
          for (const el of attrEls) processElementAttrs(el, style);
        }
        const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          processTextNode(n, style);
        }
      } finally {
        applying = false;
      }
    }

    function restoreAllOriginal() {
      applying = true;
      try {
        for (const node of trackedNodes) {
          if (node && node.isConnected && origTextMap.has(node)) {
            node.nodeValue = origTextMap.get(node);
          }
        }
        for (const el of trackedEls) {
          if (el && el.isConnected && origAttrMap.has(el)) {
            const rec = origAttrMap.get(el);
            for (const [k, v] of Object.entries(rec)) {
              el.setAttribute(k, v);
            }
          }
        }
        trackedNodes.clear();
        trackedEls.clear();
        origTextMap = new WeakMap();
        origAttrMap = new WeakMap();
      } finally {
        applying = false;
      }
    }

    function ensureObserver() {
      if (observer || !document.body) return;
      observer = new MutationObserver(() => {
        if (disposed || applying) return;
        const style = resolveEffectiveStyle();
        if (style === 'off') return;
        if (flushTimer) clearTimeout(flushTimer);
        flushTimer = setTimeout(() => {
          flushTimer = null;
          if (!disposed) walkSubtree(document.body, resolveEffectiveStyle());
        }, 80);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    function stopObserver() {
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
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
      if (document.body) walkSubtree(document.body, style);
      ensureObserver();
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
    const api = { applyConfig, unmount, getStats, resolveEffectiveStyle };
    window.__GEMINEKO_I18N_API__ = api;
    return api;
  }
  `;
}
