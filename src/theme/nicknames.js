/**
 * @file 哈基米高浓度玩梗花名引擎（支持原生 @id 与花名无缝切换，扩充池大幅降低重复编号）
 */

const ROLE_NAME_POOLS = {
  coordinator: ['哈基米大统领', '基米窝总管', '猫耳大军师', '星穹统帅喵'],
  reviewer: [
    '95分严审圣女',
    '挑刺大祭司',
    '铁面打回喵',
    '红笔判官喵',
    '严谨红茶猫',
    '毒舌质检官',
    '代码安检喵',
    '缺陷零容忍',
    '终审守门猫',
    '红牌巡检官',
  ],
  scout: [
    '雷达嗅探猫',
    '图谱巡逻官',
    '摸底侦察喵',
    '线索追踪猫',
    '顺藤摸瓜喵',
    '猫耳哨兵官',
    '暗影探路猫',
    '全仓扫雷喵',
    '情报收集猫',
    '足迹嗅探官',
  ],
  wiki: [
    '史官整理猫',
    '文档织布喵',
    '错题本书记',
    '卷宗归档喵',
    '记忆编织猫',
    '索引抄录官',
  ],
  gpt: [
    '烧Token大龙娘',
    '天价翡翠龙',
    '白毛算力龙',
    '深思龙裔姬',
    '氪金演算龙',
    '翡翠智囊龙',
  ],
  claude: [
    '95分严审圣女',
    '严谨红茶猫',
    '红笔质检官',
    '挑刺大小姐',
    '茶会审稿喵',
    '零容错学姐',
  ],
  carbon: [
    '重炮推理大猫',
    '暗夜星冠猫',
    '深度思考王',
    '黑金夜巡喵',
    '渊博星瞳猫',
    '紫金算力王',
  ],
  hydrogen: [
    '光速敲码猫',
    '白米饭精',
    '哈气修锅王',
    '芥末奶巡逻官',
    '罐头搬运喵',
    '闪电跑腿喵',
    '键盘侠喵',
    '熬夜肝帝猫',
    '甜酷修Bug喵',
    '冰青冲锋猫',
    '猫条补给员',
    '并发流水喵',
    '热修急先锋',
    '代码缝合喵',
  ],
  neon: [
    '星辰编排猫娘',
    '异瞳大管家',
    '熬夜画饼喵',
    '双瞳星使猫',
    '霓虹调度官',
    '猫窝大导演',
    '架构领航喵',
    '紫星指挥猫',
  ],
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
  if (/review|audit|verifier|strict|check/.test(id) || /claude|sonnet|opus|haiku/.test(model)) return 'reviewer';
  if (/gpt|codex|\bsol\b|\bastra\b|\bo1\b|\bo3\b|\bo4\b/.test(id) || /gpt|codex|\bsol\b|\bastra\b|\bo1\b|\bo3\b/.test(model)) return 'gpt';
  if (/scout|explore|search|spy/.test(id)) return 'scout';
  if (/wiki|doc|note/.test(id)) return 'wiki';
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
    const startIdx = stableHash(rawId) % pool.length;
    let found = null;
    for (let i = 1; i < pool.length; i += 1) {
      const candidate = pool[(startIdx + i) % pool.length];
      if (!usedNames.has(candidate)) {
        found = candidate;
        break;
      }
    }
    if (found) {
      picked = found;
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
