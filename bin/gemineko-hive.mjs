#!/usr/bin/env node
/**
 * Gemineko Hive · 基米窝 CLI 工具
 * 用法:
 *   node bin/gemineko-hive.mjs status [--json] [--swarm-dir <path>]
 *   node bin/gemineko-hive.mjs apply [--json] [--swarm-dir <path>] [--bundle <path>]
 *   node bin/gemineko-hive.mjs restore [--json] [--swarm-dir <path>]
 */

import { applyNativePatch, getNativePatchStatus, restoreNativePatch } from '../src/native-patcher.mjs';

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          flags[key] = next;
          i += 1;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const cmd = positional[0] || 'status';
  const asJson = Boolean(flags.json);
  const opts = {
    swarmDir: typeof flags['swarm-dir'] === 'string' ? flags['swarm-dir'] : undefined,
    bundlePath: typeof flags.bundle === 'string' ? flags.bundle : undefined,
  };

  let res;
  if (cmd === 'status') {
    res = getNativePatchStatus(opts);
  } else if (cmd === 'apply') {
    res = applyNativePatch(opts);
  } else if (cmd === 'restore') {
    res = restoreNativePatch(opts);
  } else {
    console.log([
      'Gemineko Hive · 基米窝 CLI',
      '',
      '用法:',
      '  node bin/gemineko-hive.mjs status [--json] [--swarm-dir <path>]',
      '  node bin/gemineko-hive.mjs apply [--json] [--swarm-dir <path>] [--bundle <path>]',
      '  node bin/gemineko-hive.mjs restore [--json] [--swarm-dir <path>]',
    ].join('\n'));
    return;
  }

  if (asJson) {
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  if (!res.swarmExists) {
    console.log(`[基米窝] 未检测到原生 Swarm 目录: ${res.swarmBoardDir}`);
    return;
  }
  const stateLabel = res.patched
    ? res.upToDate
      ? '已启用（最新版基米窝皮肤）'
      : '已启用（建议重新 apply 同步最新版）'
    : '未启用（当前为官方原版小蜜蜂）';
  console.log(`[基米窝] 状态: ${stateLabel}`);
  console.log(`[基米窝] 原生目录: ${res.swarmBoardDir}`);
}

try {
  main();
} catch (err) {
  console.error(`[gemineko-hive error] ${err?.message || String(err)}`);
  process.exit(1);
}
