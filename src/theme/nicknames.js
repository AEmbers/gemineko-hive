/**
 * @file 哈基米高浓度玩梗花名引擎（支持原生 @id 与花名无缝切换）
 */

const ROLE_NAME_POOLS = {
  coordinator: ['哈基米大统领', '基米窝总管', '猫耳大军师'],
  reviewer: ['95分严审圣女', '挑刺大祭司', '铁面打回喵'],
  scout: ['雷达嗅探猫', '图谱巡逻官', '摸底侦察喵'],
  wiki: ['史官整理猫', '文档织布喵', '错题本书记'],
  gpt: ['烧Token大龙娘', '天价翡翠龙', '白毛算力龙'],
  claude: ['95分严审圣女', '严谨红茶猫', '红笔质检官'],
  carbon: ['重炮推理大猫', '暗夜星冠猫', '深度思考王'],
  hydrogen: ['光速敲码猫', '白米饭精', '哈气修锅王', '芥末奶巡逻官', '罐头搬运喵', '闪电跑腿喵'],
  neon: ['星辰编排猫娘', '异瞳大管家', '熬夜画饼喵'],
};

/**
 * 计算确定性短哈希，保证同一节点每次渲染得到相同的梗名。
 * @param {string} input
 * @returns {number}
 */
function stableHash(input = '') {
  let h = 2166136261;
  const s = String(input);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/**
 * 推导成员的职责分桶，优先按职责关键词，其次按模型家族。
 * @param {any} member
 * @returns {string}
 */
function detectNicknameBucket(member = {}) {
  const id = String(member.agent || member.id || member.name || '').toLowerCase();
  const roleStr = String(member.role || member.geminekoRole || '').toLowerCase();
  const model = String(member.model || '').toLowerCase();

  if (member.isCoordinator || id === 'coordinator' || roleStr === 'coordinator') return 'coordinator';
  if (/review|audit|verifier|strict/.test(id) || /claude|sonnet|opus|haiku/.test(model)) return 'reviewer';
  if (/gpt|codex|\bsol\b|\bastra\b|\bo1\b|\bo3\b|\bo4\b/.test(id) || /gpt|codex|\bsol\b|\bastra\b|\bo1\b|\bo3\b/.test(model)) return 'gpt';
  if (/scout|explore|search/.test(id)) return 'scout';
  if (/wiki|doc/.test(id)) return 'wiki';
  if (/carbon|ultra|argon/.test(model) || /carbon/.test(roleStr)) return 'carbon';
  if (/neon|\bpro\b/.test(model) || /neon/.test(roleStr)) return 'neon';
  if (/hydrogen|flash|lite/.test(model) || /hydrogen/.test(roleStr)) return 'hydrogen';
  return 'hydrogen';
}

/**
 * 根据 Swarm 成员信息生成“高浓度哈基米梗名”与悬浮提示信息。
 * @param {any} member 成员对象，含 `agent`/`id`/`name`, `model`, `role`, `action`
 * @param {{ enabled?: boolean, usedNames?: Set<string> }} [options]
 * @returns {{ displayName: string, memeName: string, originalTag: string, tooltip: string, bucket: string }}
 */
export function resolveMemeNickname(member = {}, options = {}) {
  const rawId = String(member.agent || member.id || member.name || 'worker').replace(/^@/, '');
  const originalTag = `@${rawId}`;
  const bucket = detectNicknameBucket(member);
  const pool = ROLE_NAME_POOLS[bucket] || ROLE_NAME_POOLS.hydrogen;
  const usedNames = options.usedNames instanceof Set ? options.usedNames : null;

  let picked = pool[stableHash(rawId) % pool.length];
  if (usedNames && usedNames.has(picked)) {
    const unused = pool.find((candidate) => !usedNames.has(candidate));
    if (unused) {
      picked = unused;
    } else {
      const idx = (stableHash(rawId) % 9) + 1;
      picked = `${picked}#${idx}`;
    }
  }
  if (usedNames) usedNames.add(picked);

  const enabled = options.enabled !== false;
  const modelText = member.model ? ` · ${member.model}` : '';
  const actionText = member.actionLabel ? ` [${member.actionLabel}]` : '';

  return {
    displayName: enabled ? picked : originalTag,
    memeName: picked,
    originalTag,
    tooltip: `${picked} (${originalTag}${modelText})${actionText}`,
    bucket,
  };
}
