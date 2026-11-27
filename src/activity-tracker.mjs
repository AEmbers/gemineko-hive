/**
 * @file transcript.jsonl 实时活动与编排/执行状态追踪器
 * 从对话日志尾部解析当前活跃模型、阶段（Planner / Executor / Idle）与最新工具动作。
 */

import { existsSync, openSync, readSync, closeSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** 默认判定为“静默/打盹”的无更新毫秒阈值（45 秒） */
export const DEFAULT_ACTIVE_WINDOW_MS = 45_000;

/** 默认每次读取 transcript.jsonl 尾部的最大字节数（64 KB） */
const TAIL_BYTES = 65_536;

/** 工具动作中文标签映射 */
export const ACTION_LABELS = {
  thinking: '思考中',
  reading: '读代码中',
  editing: '改文件中',
  running: '跑终端中',
  asking: '等你拍板',
  idle: '打盹摸鱼',
};

/** 阶段中文标签映射 */
export const PHASE_LABELS = {
  planner: '编排模式',
  executor: '执行模式',
  idle: '待机中',
};

const READ_TOOLS = new Set([
  'read_file',
  'read_slices',
  'batch_search',
  'list_dir',
  'find_by_name',
  'grep_search',
  'search_web',
  'view_file',
  'view_file_outline',
  'view_code_item',
  'ctx_search',
  'ctx_index',
  'ctx_batch',
  'gemini_search_docs',
  'gemini_get_doc',
  'list_resources',
  'read_resource',
]);

const EDIT_TOOLS = new Set([
  'write_file',
  'edit_file',
  'apply_edits',
  'replace_file_content',
  'multi_replace_file_content',
  'write_to_file',
]);

const RUN_TOOLS = new Set([
  'run_command',
  'run_checks',
  'ctx_execute',
  'command_status',
  'send_command_input',
  'run_workflow',
  'colab_exec',
  'colab_run',
  'colab_job',
]);

const ASK_TOOLS = new Set([
  'ask_question',
  'enter_plan_mode',
  'exit_plan_mode',
]);

/**
 * 规范化模型名称，映射到 5 大核心角色之一。
 * @param {string} modelName
 * @returns {'carbon'|'hydrogen'|'neon'|'claude'|'gpt'}
 */
export function classifyModelRole(modelName = '') {
  const s = String(modelName || '').toLowerCase();
  if (/claude|sonnet|opus|haiku/.test(s)) return 'claude';
  if (/gpt|codex|\bsol\b|\bastra\b|\bo1\b|\bo3\b|\bo4\b/.test(s)) return 'gpt';
  if (/carbon|ultra|argon/.test(s)) return 'carbon';
  if (/hydrogen|flash|lite/.test(s)) return 'hydrogen';
  if (/neon|\bpro\b|gemini/.test(s)) return 'neon';
  return 'neon';
}

/**
 * 归一化工具名称（剥离 MCP 前缀与命名空间）。
 * @param {string} rawToolName
 * @returns {string}
 */
export function normalizeToolName(rawToolName = '') {
  const raw = String(rawToolName || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.startsWith('mcp_agy-dart_fast_')) {
    return raw.slice('mcp_agy-dart_fast_'.length);
  }
  if (raw.startsWith('mcp_agy-dart_context_')) {
    return raw.slice('mcp_agy-dart_context_'.length);
  }
  return raw;
}

/**
 * 根据工具名称、thinking 状态及时间活跃度判定 6 大动作之一。
 * @param {string} toolName
 * @param {boolean} hasThinking
 * @param {boolean} isActive
 * @returns {'thinking'|'reading'|'editing'|'running'|'asking'|'idle'}
 */
export function classifyToolAction(toolName = '', hasThinking = false, isActive = true) {
  if (!isActive) return 'idle';
  const name = normalizeToolName(toolName);
  if (ASK_TOOLS.has(name) || /ask_question|plan_mode/.test(name)) return 'asking';
  if (EDIT_TOOLS.has(name) || /write_file|edit_file|apply_edits|replace_file/.test(name)) return 'editing';
  if (RUN_TOOLS.has(name) || /run_command|run_checks|ctx_execute|colab_run|colab_exec|workflow/.test(name)) return 'running';
  if (READ_TOOLS.has(name) || /read_file|read_slices|search|list_|find_|view_|ctx_/.test(name)) return 'reading';
  if (hasThinking) return 'thinking';
  return 'thinking';
}

/**
 * 高效读取文件最后 maxBytes 字节的 UTF-8 文本。
 * @param {string} filePath
 * @param {number} maxBytes
 * @returns {string}
 */
function readTailUtf8(filePath, maxBytes = TAIL_BYTES) {
  let fd;
  try {
    const st = statSync(filePath);
    if (!st.isFile() || st.size === 0) return '';
    const size = st.size;
    const readLen = Math.min(size, maxBytes);
    const start = Math.max(0, size - readLen);
    const buf = Buffer.allocUnsafe(readLen);
    fd = openSync(filePath, 'r');
    const bytesRead = readSync(fd, buf, 0, readLen, start);
    let text = buf.subarray(0, bytesRead).toString('utf-8');
    if (start > 0) {
      const nl = text.indexOf('\n');
      if (nl !== -1) text = text.slice(nl + 1);
    }
    return text;
  } catch {
    return '';
  } finally {
    if (fd !== undefined) {
      try { closeSync(fd); } catch {}
    }
  }
}

/**
 * 解析 transcript 单条 JSON 行，兼容不同包装结构提取 plannerResponse。
 * @param {any} row
 * @returns {any|null}
 */
function extractPlannerResponse(row) {
  if (!row || typeof row !== 'object') return null;
  if (row.plannerResponse && typeof row.plannerResponse === 'object') return row.plannerResponse;
  if (row.type === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE' || row.planner_response) {
    return row.planner_response || row;
  }
  if (row.model && (row.toolCalls || row.tool_calls || row.thinking !== undefined)) {
    return row;
  }
  return null;
}

/**
 * 解析 transcript 单条 JSON 行中的工具调用列表。
 * @param {any} pr
 * @returns {string[]}
 */
function extractToolNames(pr) {
  const list = Array.isArray(pr?.toolCalls)
    ? pr.toolCalls
    : Array.isArray(pr?.tool_calls)
      ? pr.tool_calls
      : [];
  const names = [];
  for (const tc of list) {
    if (!tc || typeof tc !== 'object') continue;
    const n = tc.name || tc.tool_name || tc.toolName || tc.function?.name || '';
    if (n) names.push(String(n));
  }
  return names;
}

/**
 * 推导当前处于 Planner 还是 Executor 阶段。
 * 优先级：最新模型为 carbon/neon 且最近出现过 enter_plan_mode 且未 exit，或模型明确含 planner；
 * 若出现过 exit_plan_mode 且仍在执行期、或使用 hydrogen 执行模型，则判定 executor。
 * @param {Array<{model:string, tools:string[]}>} recentResponses 从旧到新排列
 * @param {boolean} isActive
 * @returns {'planner'|'executor'|'idle'}
 */
function inferPhase(recentResponses, isActive) {
  if (!isActive || recentResponses.length === 0) return 'idle';
  let planSignal = null;
  for (const item of recentResponses) {
    for (const t of item.tools) {
      const nt = normalizeToolName(t);
      if (nt === 'enter_plan_mode') planSignal = 'planner';
      else if (nt === 'exit_plan_mode') planSignal = 'executor';
    }
  }
  const latest = recentResponses[recentResponses.length - 1];
  const role = classifyModelRole(latest.model);
  if (planSignal === 'planner') return 'planner';
  if (role === 'hydrogen') return 'executor';
  if (planSignal === 'executor') return 'executor';
  if (role === 'neon' || role === 'carbon') return 'planner';
  return 'executor';
}

/**
 * 解析单个会话目录下的 `.system_generated/logs/transcript.jsonl` 实时活动状态。
 * @param {string} convDir
 * @param {number} [nowMs]
 * @param {number} [activeWindowMs]
 * @returns {object|null}
 */
export function readConversationLiveActivity(
  convDir,
  nowMs = Date.now(),
  activeWindowMs = DEFAULT_ACTIVE_WINDOW_MS
) {
  if (!convDir) return null;
  const logPath = join(convDir, '.system_generated', 'logs', 'transcript.jsonl');
  if (!existsSync(logPath)) return null;

  let mtimeMs = 0;
  try {
    mtimeMs = statSync(logPath).mtimeMs;
  } catch {
    return null;
  }

  const tailText = readTailUtf8(logPath, TAIL_BYTES);
  if (!tailText) return null;

  const lines = tailText.split(/\r?\n/).filter(Boolean);
  const parsedResponses = [];
  let latestTimestampMs = mtimeMs;
  let lastErrorSeq = '';
  let lastErrorLineIdx = -1;
  let turnCompletedAtMs = 0;

  /**
   * 判定单条 transcript 记录是否包含工具执行失败/错误信号。
   * @param {any} row
   */
  function detectRowError(row) {
    if (!row || typeof row !== 'object') return false;
    if (row.isError === true || row.is_error === true || row.status === 'ERROR') return true;
    const errObj = row.error || row.toolResponse?.error || row.tool_response?.error || row.runCommand?.error;
    if (errObj) return true;
    const out = String(
      row.runCommand?.commandOutput ||
      row.runCommand?.output ||
      row.toolResponse?.output ||
      row.toolResponse?.content ||
      ''
    );
    if (/Command exited with code [1-9]\d*/i.test(out)) return true;
    if (/Encountered error in tool execution/i.test(out)) return true;
    return false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const tsRawAll = obj.createdAt || obj.created_at || obj.timestamp || obj.metadata?.createdAt;
    const parsedTsAll = tsRawAll ? Date.parse(tsRawAll) : NaN;
    if (Number.isFinite(parsedTsAll)) {
      latestTimestampMs = Math.max(latestTimestampMs, parsedTsAll);
    }
    if (detectRowError(obj)) {
      lastErrorLineIdx = i;
      lastErrorSeq = String(obj.step_index ?? obj.stepIndex ?? parsedTsAll ?? i);
    }
    const pr = extractPlannerResponse(obj);
    if (!pr) continue;
    const tools = extractToolNames(pr);
    const tsRaw = pr.createdAt || pr.created_at || tsRawAll;
    const parsedTs = tsRaw ? Date.parse(tsRaw) : NaN;
    if (Number.isFinite(parsedTs)) {
      latestTimestampMs = Math.max(latestTimestampMs, parsedTs);
    }
    if (tools.length === 0 && (pr.response || pr.text)) {
      turnCompletedAtMs = Number.isFinite(parsedTs) ? parsedTs : mtimeMs;
    }
    parsedResponses.push({
      model: String(pr.model || pr.modelName || pr.model_name || ''),
      thinking: Boolean(pr.thinking && String(pr.thinking).trim().length > 0),
      tools,
      lineIdx: i,
    });
  }

  const recent = parsedResponses.slice(-10);
  const latest = recent[recent.length - 1] || { model: 'gemini-4-neon', thinking: true, tools: [], lineIdx: -1 };
  const updatedAt = Math.max(mtimeMs, latestTimestampMs);
  const ageMs = Math.max(0, nowMs - updatedAt);
  const active = ageMs <= activeWindowMs;
  const lastTool = latest.tools.length ? latest.tools[latest.tools.length - 1] : '';
  const role = classifyModelRole(latest.model);
  const action = classifyToolAction(lastTool, latest.thinking, active);
  const phase = inferPhase(recent, active);
  const conversationId = convDir.replace(/[/\\]+$/, '').split(/[/\\]/).pop() || '';
  const hasError = lastErrorLineIdx >= 0 && lastErrorLineIdx >= Math.max(0, lines.length - 6);

  return {
    conversationId,
    updatedAt: new Date(updatedAt).toISOString(),
    ageMs,
    active,
    phase,
    phaseLabel: PHASE_LABELS[phase] || PHASE_LABELS.idle,
    model: latest.model || 'gemini-4-neon',
    role,
    action,
    actionLabel: ACTION_LABELS[action] || ACTION_LABELS.thinking,
    lastTool,
    hasError,
    errorSeq: hasError ? lastErrorSeq : '',
    turnCompletedAt: turnCompletedAtMs > 0 ? new Date(turnCompletedAtMs).toISOString() : '',
    spriteFile: `${role}-${action}.png`,
  };
}

/**
 * 扫描多个 appDataDir 中的 brain 会话，优先锁定指定 conversationId，否则找出最近更新的活跃会话状态。
 * @param {string[]} appDataDirs
 * @param {number} [nowMs]
 * @param {number} [activeWindowMs]
 * @param {string} [preferredConversationId]
 * @returns {object|null}
 */
export function findActiveConversationActivity(
  appDataDirs = [],
  nowMs = Date.now(),
  activeWindowMs = DEFAULT_ACTIVE_WINDOW_MS,
  preferredConversationId = ''
) {
  const cleanPreferred = String(preferredConversationId || '').trim();
  if (cleanPreferred && /^[0-9a-f-]{8,}$/i.test(cleanPreferred)) {
    for (const appDir of appDataDirs) {
      if (!appDir) continue;
      const directDir = join(appDir, 'brain', cleanPreferred);
      if (existsSync(directDir)) {
        const directInfo = readConversationLiveActivity(directDir, nowMs, activeWindowMs);
        if (directInfo) return directInfo;
      }
    }
  }

  let best = null;
  for (const appDir of appDataDirs) {
    if (!appDir) continue;
    const brainDir = join(appDir, 'brain');
    if (!existsSync(brainDir)) continue;
    let entries;
    try {
      entries = readdirSync(brainDir, { withFileTypes: true });
    } catch {
      continue;
    }
    const candidates = [];
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const convDir = join(brainDir, ent.name);
      const logPath = join(convDir, '.system_generated', 'logs', 'transcript.jsonl');
      if (!existsSync(logPath)) continue;
      try {
        const st = statSync(logPath);
        candidates.push({ convDir, mtimeMs: st.mtimeMs });
      } catch {
        continue;
      }
    }
    candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
    for (const item of candidates.slice(0, 6)) {
      const info = readConversationLiveActivity(item.convDir, nowMs, activeWindowMs);
      if (!info) continue;
      if (!best || Date.parse(info.updatedAt) > Date.parse(best.updatedAt)) {
        best = info;
      }
      break;
    }
  }
  return best;
}

/**
 * 从成员文本（任务摘要 / note）做降级动作推断。
 * @param {any} member
 * @returns {'thinking'|'reading'|'editing'|'running'|'asking'|'idle'}
 */
function inferActionFromMemberText(member) {
  const status = String(member?.status || '').toLowerCase();
  if (status === 'waiting' || status === 'stopped' || status === 'killed') return 'idle';
  const text = `${member?.currentTask || ''} ${member?.note || ''}`.toLowerCase();
  if (/ask_question|等待|确认|请示|clarif/.test(text)) return 'asking';
  if (/npm test|cargo test|run_command|run_checks|构建|测试|运行|shell|exec/.test(text)) return 'running';
  if (/write|edit|apply_edits|修改|编写|重构|修复|补全|fix/.test(text)) return 'editing';
  if (/read|inspect|audit|scout|wiki|search|查阅|侦察|审查|分析/.test(text)) return 'reading';
  return 'thinking';
}

/**
 * 为 Swarm 快照成员数组注入实时 role、action、actionLabel、phase 与 lastTool 字段。
 * @param {any} snapshot
 * @param {string[]} [appDataDirs]
 * @param {number} [nowMs]
 * @returns {any}
 */
export function enrichSwarmMembersWithActivity(snapshot, appDataDirs = [], nowMs = Date.now()) {
  if (!snapshot || !Array.isArray(snapshot.members)) return snapshot;
  const enrichedMembers = snapshot.members.map((member) => {
    const role = member.role === 'coordinator' || member.agent === 'coordinator'
      ? classifyModelRole(member.model || 'gemini-4-neon')
      : classifyModelRole(member.model || member.agent || '');

    let live = null;
    if (member.conversationId) {
      for (const appDir of appDataDirs) {
        const convDir = join(appDir, 'brain', String(member.conversationId));
        if (existsSync(convDir)) {
          live = readConversationLiveActivity(convDir, nowMs);
          if (live) break;
        }
      }
    }

    const action = live?.action || member.action || inferActionFromMemberText(member);
    const phase = live?.phase || (member.agent === 'coordinator' ? 'planner' : action === 'idle' ? 'idle' : 'executor');
    return {
      ...member,
      geminekoRole: role,
      action,
      actionLabel: ACTION_LABELS[action] || ACTION_LABELS.thinking,
      phase,
      phaseLabel: PHASE_LABELS[phase] || PHASE_LABELS.idle,
      lastTool: live?.lastTool || member.lastTool || '',
      spriteFile: `${role}-${action}.png`,
    };
  });

  return {
    ...snapshot,
    members: enrichedMembers,
  };
}
