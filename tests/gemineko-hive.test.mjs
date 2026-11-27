import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildGeminekoBundle } from '../scripts/build-bundle.mjs';
import { applyNativePatch, getNativePatchStatus, restoreNativePatch } from '../src/native-patcher.mjs';
import { createHiveSidecarServer } from '../src/sidecar/server.mjs';

function createFakeSwarmSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gemineko-hive-test-'));
  const swarmDir = path.join(root, 'swarm_board');
  fs.mkdirSync(swarmDir, { recursive: true });

  const origIndex = [
    '<!DOCTYPE html>',
    '<html><head><title>Swarm</title></head>',
    '<body><div id="board"></div><script src="/app.js"></script></body>',
    '</html>',
  ].join('\n');

  const origMain = [
    "import { readFileSync } from 'node:fs';",
    'const STATIC = {',
    "  '/styles.css': ['styles.css', 'text/css'],",
    "  '/app.js': ['app.js', 'application/javascript'],",
    '};',
    'console.log(STATIC);',
  ].join('\n');

  fs.writeFileSync(path.join(swarmDir, 'index.html'), origIndex, 'utf8');
  fs.writeFileSync(path.join(swarmDir, 'main.mjs'), origMain, 'utf8');

  const appDataDir = path.join(root, 'antigravity');
  const convId = '11111111-2222-3333-4444-555555555555';
  const convSwarmDir = path.join(appDataDir, 'brain', convId, '.system_generated', 'swarm');
  fs.mkdirSync(convSwarmDir, { recursive: true });
  fs.writeFileSync(
    path.join(convSwarmDir, 'members.json'),
    JSON.stringify({
      title: 'Test Swarm',
      members: {
        coordinator: { role: 'coordinator', model: 'gemini-4-neon-high', status: 'working' },
        'claude-rev': { role: 'worker', model: 'claude-sonnet-5-5-high', status: 'working' },
      },
    }),
  );
  fs.writeFileSync(
    path.join(convSwarmDir, 'board.jsonl'),
    `${JSON.stringify({ seq: 1, agent: 'coordinator', mentions: ['claude-rev'], text: '请严审' })}\n`,
  );

  return { root, swarmDir, origIndex, origMain, appDataDir, convId };
}

test('buildGeminekoBundle 生成合法自包含脚本并内联全部角色资产', () => {
  const res = buildGeminekoBundle();
  assert.ok(fs.existsSync(res.outPath));
  assert.ok(res.bytes > 100_000);
  const content = fs.readFileSync(res.outPath, 'utf8');
  assert.match(content, /GEMINEKO_ASSETS/);
  assert.match(content, /drawPixelSprite/);
  assert.match(content, /buildDemoSwarmSnapshot/);
});

test('原生 Swarm 补丁器支持 幂等 apply -> status -> 逐字节 restore', () => {
  const { outPath: bundlePath } = buildGeminekoBundle();
  const sb = createFakeSwarmSandbox();
  try {
    let st = getNativePatchStatus({ swarmDir: sb.swarmDir, bundlePath });
    assert.equal(st.swarmExists, true);
    assert.equal(st.patched, false);

    // 首次 apply
    st = applyNativePatch({ swarmDir: sb.swarmDir, bundlePath });
    assert.equal(st.patched, true);
    assert.equal(st.upToDate, true);
    assert.ok(fs.existsSync(path.join(sb.swarmDir, 'gemineko-hive.js')));

    // 幂等重复 apply 不应重复插块
    applyNativePatch({ swarmDir: sb.swarmDir, bundlePath });
    const htmlAfter = fs.readFileSync(path.join(sb.swarmDir, 'index.html'), 'utf8');
    assert.equal((htmlAfter.match(/GEMINEKO_HIVE_START/g) || []).length, 1);

    // restore 逐字节恢复官方原貌
    st = restoreNativePatch({ swarmDir: sb.swarmDir });
    assert.equal(st.patched, false);
    assert.equal(fs.existsSync(path.join(sb.swarmDir, 'gemineko-hive.js')), false);
    assert.equal(fs.readFileSync(path.join(sb.swarmDir, 'index.html'), 'utf8'), sb.origIndex);
    assert.equal(fs.readFileSync(path.join(sb.swarmDir, 'main.mjs'), 'utf8'), sb.origMain);
  } finally {
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});

test('独立 Sidecar 服务端全路由与原生换肤 API 测试', async () => {
  const { outPath: bundlePath } = buildGeminekoBundle();
  const sb = createFakeSwarmSandbox();
  const srv = await createHiveSidecarServer({
    port: 0,
    bundlePath,
    swarmDir: sb.swarmDir,
    appDataDirs: [sb.appDataDir],
    sideToken: 'test-hive-secret',
  });
  try {
    const hz = await srv.inject({ url: '/healthz' });
    assert.equal(hz.statusCode, 200);
    assert.equal(hz.json().plugin, 'gemineko-hive');

    const htmlRes = await srv.inject({ url: '/' });
    assert.equal(htmlRes.statusCode, 200);
    assert.match(htmlRes.text, /__GEMINEKO_SIDECAR_MODE__/);
    assert.match(htmlRes.text, /\/gemineko-hive\.js/);

    const jsRes = await srv.inject({ url: '/gemineko-hive.js' });
    assert.equal(jsRes.statusCode, 200);
    assert.match(jsRes.text, /bootGeminekoHive/);

    const swRes = await srv.inject({ url: `/api/swarm?conversationId=${sb.convId}` });
    assert.equal(swRes.statusCode, 200);
    const sw = swRes.json();
    assert.equal(sw.members.length, 2);
    assert.equal(sw.messages.length, 1);

    // 未带 token 时禁止写原生换肤接口
    const unauth = await srv.inject({ method: 'POST', url: '/api/native-patch/apply' });
    assert.equal(unauth.statusCode, 403);

    // 带 token 一键换肤 -> 查询状态 -> 还原
    const applied = await srv.inject({
      method: 'POST',
      url: '/api/native-patch/apply',
      headers: { 'x-sidecar-token': 'test-hive-secret' },
    });
    assert.equal(applied.statusCode, 200);
    assert.equal(applied.json().patched, true);

    const restored = await srv.inject({
      method: 'POST',
      url: '/api/native-patch/restore',
      headers: { 'x-sidecar-token': 'test-hive-secret' },
    });
    assert.equal(restored.statusCode, 200);
    assert.equal(restored.json().patched, false);
  } finally {
    await srv.close();
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});
