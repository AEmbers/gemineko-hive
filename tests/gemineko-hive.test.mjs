import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildGeminekoBundle } from '../scripts/build-bundle.mjs';
import {
  classifyModelRole,
  classifyToolAction,
  enrichSwarmMembersWithActivity,
  findActiveConversationActivity,
  readConversationLiveActivity,
} from '../src/activity-tracker.mjs';
import { applyNativePatch, getNativePatchStatus, restoreNativePatch } from '../src/native-patcher.mjs';
import { buildCdpOverlayScript } from '../src/cdp/host-injector.mjs';
import { createHiveSidecarServer } from '../src/sidecar/server.mjs';
import { resolveMemeNickname } from '../src/theme/nicknames.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function createFakeSwarmSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gemineko-hive-test-'));
  const pluginDir = path.join(root, 'swarm');
  const swarmDir = path.join(pluginDir, 'sidecars', 'swarm_board');
  const assetsDir = path.join(pluginDir, 'assets');
  fs.mkdirSync(swarmDir, { recursive: true });
  fs.mkdirSync(assetsDir, { recursive: true });

  const origIndex = [
    '<!DOCTYPE html>',
    '<html><head><title>Swarm</title></head>',
    '<body><div id="board"></div><script src="/app.js"></script></body>',
    '</html>',
  ].join('\n');

  const origMain = [
    "import { readFileSync } from 'node:fs';",
    "import { join } from 'node:path';",
    'const STATIC = {',
    "  '/styles.css': ['styles.css', 'text/css'],",
    "  '/app.js': ['app.js', 'application/javascript'],",
    '};',
    'const app = { api() {}, run() {} };',
    'app.run();',
  ].join('\n');

  const origLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#f59e0b"/></svg>';

  fs.writeFileSync(path.join(swarmDir, 'index.html'), origIndex, 'utf8');
  fs.writeFileSync(path.join(swarmDir, 'main.mjs'), origMain, 'utf8');
  fs.writeFileSync(path.join(assetsDir, 'logo.svg'), origLogoSvg, 'utf8');

  const appDataDir = path.join(root, 'antigravity');
  const convId = '11111111-2222-3333-4444-555555555555';
  const convDir = path.join(appDataDir, 'brain', convId);
  const convSwarmDir = path.join(convDir, '.system_generated', 'swarm');
  const logsDir = path.join(convDir, '.system_generated', 'logs');
  fs.mkdirSync(convSwarmDir, { recursive: true });
  fs.mkdirSync(logsDir, { recursive: true });

  fs.writeFileSync(
    path.join(convSwarmDir, 'members.json'),
    JSON.stringify({
      title: 'Test Swarm',
      members: {
        coordinator: { role: 'coordinator', model: 'gemini-4-neon-high', status: 'working' },
        'claude-rev': { role: 'worker', model: 'claude-sonnet-5-5-high', status: 'working', currentTask: 'audit code' },
      },
    }),
  );
  fs.writeFileSync(
    path.join(convSwarmDir, 'board.jsonl'),
    `${JSON.stringify({ seq: 1, agent: 'coordinator', mentions: ['claude-rev'], text: '请严审' })}\n`,
  );

  const nowIso = new Date().toISOString();
  const transcriptLines = [
    JSON.stringify({
      step_index: 1,
      plannerResponse: {
        model: 'gemini-4-neon-high',
        thinking: '规划重构路径',
        toolCalls: [{ name: 'enter_plan_mode' }],
        createdAt: nowIso,
      },
    }),
    JSON.stringify({
      step_index: 2,
      plannerResponse: {
        model: 'gemini-4-hydrogen-high',
        thinking: '开始修改代码',
        toolCalls: [{ name: 'exit_plan_mode' }, { name: 'edit_file' }],
        createdAt: nowIso,
      },
    }),
  ].join('\n') + '\n';
  fs.writeFileSync(path.join(logsDir, 'transcript.jsonl'), transcriptLines, 'utf8');

  return { root, swarmDir, origIndex, origMain, origLogoSvg, logoSvgPath: path.join(assetsDir, 'logo.svg'), appDataDir, convDir, convId };
}

test('30 张角色×动作 128x128 PNG 立绘全部就绪且具备 RGBA 透明通道', () => {
  const roles = ['neon', 'hydrogen', 'carbon', 'claude', 'gpt'];
  const actions = ['thinking', 'reading', 'editing', 'running', 'idle'];
  const spritesDir = path.join(REPO_ROOT, 'assets', 'sprites');

  for (const role of roles) {
    for (const action of actions) {
      const filePath = path.join(spritesDir, `${role}-${action}.png`);
      assert.ok(fs.existsSync(filePath), `缺少精灵图: ${role}-${action}.png`);
      const buf = fs.readFileSync(filePath);
      assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${role}-${action}.png 不是合法 PNG`);
      assert.equal(buf.readUInt32BE(16), 128, `${role}-${action}.png 宽度应为 128`);
      assert.equal(buf.readUInt32BE(20), 128, `${role}-${action}.png 高度应为 128`);
      // PNG IHDR byte 25 为 colorType，6 表示带 Alpha 透明通道的 RGBA
      assert.equal(buf[25], 6, `${role}-${action}.png 应为 RGBA(colorType=6) 透明 PNG`);
    }
  }
});

test('buildGeminekoBundle 生成轻量化自包含脚本并包含透明猫窝/花名与全量汉化能力', () => {
  const res = buildGeminekoBundle();
  assert.ok(fs.existsSync(res.outPath));
  assert.ok(res.bytes > 20_000 && res.bytes < 420_000, `意外的主包字节数: ${res.bytes}`);
  const content = fs.readFileSync(res.outPath, 'utf8');
  assert.match(content, /GEMINEKO_ASSETS/);
  assert.match(content, /resolveMemeNickname/);
  assert.match(content, /drawPixelSprite/);
  assert.match(content, /buildDemoSwarmSnapshot/);
  assert.match(content, /mo\.disconnect\(\)/);
  assert.match(content, /gn-settings-panel/);
  assert.match(content, /--gn-catnest-pattern/);
  assert.match(content, /extractFullNodeIdFromGroup/);
  assert.match(content, /传话连线/);
  assert.match(content, /隐藏摸鱼猫/);
});

test('activity-tracker 正确识别 5 大模型、工具动作与编排/执行阶段', () => {
  assert.equal(classifyModelRole('gemini-4-neon-high'), 'neon');
  assert.equal(classifyModelRole('gemini-4-hydrogen-high'), 'hydrogen');
  assert.equal(classifyModelRole('gemini-4-carbon-high'), 'carbon');
  assert.equal(classifyModelRole('claude-sonnet-5-5-high'), 'claude');
  assert.equal(classifyModelRole('gpt-6-2-sol'), 'gpt');

  assert.equal(classifyToolAction('read_slices', false, true), 'reading');
  assert.equal(classifyToolAction('mcp_agy-dart_fast_apply_edits', false, true), 'editing');
  assert.equal(classifyToolAction('run_checks', false, true), 'running');
  assert.equal(classifyToolAction('ask_question', false, true), 'asking');
  assert.equal(classifyToolAction('', true, true), 'thinking');
  assert.equal(classifyToolAction('edit_file', true, false), 'idle');

  const sb = createFakeSwarmSandbox();
  try {
    const info = readConversationLiveActivity(sb.convDir, Date.now());
    assert.ok(info);
    assert.equal(info.role, 'hydrogen');
    assert.equal(info.action, 'editing');
    assert.equal(info.phase, 'executor');
    assert.equal(info.spriteFile, 'hydrogen-editing.png');

    const latest = findActiveConversationActivity([sb.appDataDir], Date.now());
    assert.equal(latest?.conversationId, sb.convId);

    // 制造一个更新时间的后台会话，验证传入 preferredConversationId 时绝不串台
    const otherId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const otherLogs = path.join(sb.appDataDir, 'brain', otherId, '.system_generated', 'logs');
    fs.mkdirSync(otherLogs, { recursive: true });
    fs.writeFileSync(
      path.join(otherLogs, 'transcript.jsonl'),
      `${JSON.stringify({
        plannerResponse: {
          model: 'claude-sonnet-5-5-high',
          thinking: '后台严审',
          toolCalls: [{ name: 'run_checks' }],
          createdAt: new Date(Date.now() + 10_000).toISOString(),
        },
      })}\n`,
    );
    const locked = findActiveConversationActivity([sb.appDataDir], Date.now(), undefined, sb.convId);
    assert.equal(locked?.conversationId, sb.convId);
    assert.equal(locked?.role, 'hydrogen');

    const enriched = enrichSwarmMembersWithActivity(
      {
        members: [
          { agent: 'coordinator', role: 'coordinator', model: 'gemini-4-neon-high', status: 'working' },
          { agent: 'verifier', role: 'worker', model: 'claude-sonnet-5-5-high', status: 'working', currentTask: 'run_checks test' },
        ],
      },
      [sb.appDataDir],
    );
    assert.equal(enriched.members[0].geminekoRole, 'neon');
    assert.equal(enriched.members[1].geminekoRole, 'claude');
    assert.equal(enriched.members[1].action, 'running');
  } finally {
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});

test('resolveMemeNickname 正确生成高浓度梗名与切换原 ID', () => {
  const used = new Set();
  const coord = resolveMemeNickname(
    { id: 'coordinator', isCoordinator: true, model: 'gemini-4-neon-high', actionLabel: '思考中' },
    { enabled: true, usedNames: used },
  );
  assert.ok(['哈基米大统领', '基米窝总管', '猫耳大军师'].includes(coord.displayName));
  assert.match(coord.tooltip, /@coordinator/);

  const gpt = resolveMemeNickname(
    { id: 'coder-gpt', model: 'gpt-6-2-sol', actionLabel: '打盹摸鱼' },
    { enabled: true, usedNames: used },
  );
  assert.ok(['烧Token大龙娘', '天价翡翠龙', '白毛算力龙'].includes(gpt.displayName));

  const raw = resolveMemeNickname({ id: 'coder-gpt', model: 'gpt-6-2-sol' }, { enabled: false });
  assert.equal(raw.displayName, '@coder-gpt');
});

test('原生 Swarm 补丁器支持 25 态精灵路由、无损替换 logo.svg 与逐字节 restore', () => {
  const { outPath: bundlePath } = buildGeminekoBundle();
  const sb = createFakeSwarmSandbox();
  try {
    let st = getNativePatchStatus({ swarmDir: sb.swarmDir, bundlePath });
    assert.equal(st.swarmExists, true);
    assert.equal(st.patched, false);
    assert.equal(st.logoPatched, false);

    st = applyNativePatch({ swarmDir: sb.swarmDir, bundlePath });
    assert.equal(st.patched, true);
    assert.equal(st.upToDate, true);
    assert.equal(st.logoPatched, true);
    assert.ok(st.spriteCount >= 25);
    assert.ok(fs.existsSync(path.join(sb.swarmDir, 'gemineko-hive.js')));
    assert.ok(fs.existsSync(path.join(sb.swarmDir, 'gemineko-sprites', 'gpt-idle.png')));
    assert.match(fs.readFileSync(sb.logoSvgPath, 'utf8'), /GEMINEKO_HIVE_LOGO_V2/);
    assert.match(fs.readFileSync(path.join(sb.swarmDir, 'main.mjs'), 'utf8'), /GEMINEKO_HIVE_ROUTES_START/);

    // 幂等重跑不应产生重复标记块或覆盖原 logo 备份
    applyNativePatch({ swarmDir: sb.swarmDir, bundlePath });
    const htmlAfter = fs.readFileSync(path.join(sb.swarmDir, 'index.html'), 'utf8');
    const mainAfter = fs.readFileSync(path.join(sb.swarmDir, 'main.mjs'), 'utf8');
    assert.equal((htmlAfter.match(/GEMINEKO_HIVE_START/g) || []).length, 1);
    assert.equal((mainAfter.match(/GEMINEKO_HIVE_ROUTES_START/g) || []).length, 1);

    // 逐字节恢复包括 index.html / main.mjs / logo.svg
    st = restoreNativePatch({ swarmDir: sb.swarmDir });
    assert.equal(st.patched, false);
    assert.equal(st.logoPatched, false);
    assert.equal(fs.existsSync(path.join(sb.swarmDir, 'gemineko-hive.js')), false);
    assert.equal(fs.existsSync(path.join(sb.swarmDir, 'gemineko-sprites')), false);
    assert.equal(fs.readFileSync(path.join(sb.swarmDir, 'index.html'), 'utf8'), sb.origIndex);
    assert.equal(fs.readFileSync(path.join(sb.swarmDir, 'main.mjs'), 'utf8'), sb.origMain);
    assert.equal(fs.readFileSync(sb.logoSvgPath, 'utf8'), sb.origLogoSvg);
  } finally {
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});

test('独立 Sidecar 服务端全路由、精灵图、实时活动与 CDP 接口测试', async () => {
  const { outPath: bundlePath } = buildGeminekoBundle();
  const sb = createFakeSwarmSandbox();
  const srv = await createHiveSidecarServer({
    port: 0,
    bundlePath,
    swarmDir: sb.swarmDir,
    appDataDirs: [sb.appDataDir],
    sideToken: 'test-hive-secret',
    enableCdp: false,
  });
  try {
    const hz = await srv.inject({ url: '/healthz' });
    assert.equal(hz.statusCode, 200);
    assert.equal(hz.json().version, '0.3.1');

    const preloadRes = await srv.inject({ url: '/preload.js' });
    assert.equal(preloadRes.statusCode, 200);
    assert.ok(preloadRes.text.length > 200, 'preload.js 不应为空注释');
    assert.match(preloadRes.text, /window\.sidecar/);

    const overlayScript = buildCdpOverlayScript(srv.origin, '');
    assert.match(overlayScript, /gemineko-cdp-composer-dock/);
    assert.match(overlayScript, /antigravity\.agentSidePanelInputBox/);
    assert.match(overlayScript, /gk-live-inline-wrap/);
    assert.match(overlayScript, /getCurrentConversationId/);
    assert.doesNotMatch(overlayScript, /cursor:\s*grabbing/);
    assert.doesNotMatch(overlayScript, /querySelectorAll\(['"]button, summary, \[role="button"\], div['"]\)/);

    const spriteRes = await fetch(`${srv.origin}/gemineko-sprites/neon-thinking.png`);
    assert.equal(spriteRes.status, 200);
    assert.equal(spriteRes.headers.get('content-type'), 'image/png');
    assert.equal(spriteRes.headers.get('access-control-allow-origin'), '*');
    const spriteBuf = Buffer.from(await spriteRes.arrayBuffer());
    assert.equal(spriteBuf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

    const liveRes = await srv.inject({ url: '/api/live-activity' });
    assert.equal(liveRes.statusCode, 200);
    assert.equal(liveRes.json().activity.role, 'hydrogen');
    assert.equal(liveRes.json().activity.action, 'editing');
    assert.equal(liveRes.json().activity.phase, 'executor');

    const cdpRes = await srv.inject({ url: '/api/cdp/status' });
    assert.equal(cdpRes.statusCode, 200);
    assert.equal(cdpRes.json().ok, true);

    const swRes = await srv.inject({ url: `/api/swarm?conversationId=${sb.convId}` });
    assert.equal(swRes.statusCode, 200);
    const sw = swRes.json();
    assert.equal(sw.members.length, 2);
    assert.equal(sw.members[0].geminekoRole, 'neon');
    assert.equal(sw.members[1].geminekoRole, 'claude');

    const swUnchangedRes = await srv.inject({
      url: `/api/swarm?conversationId=${sb.convId}&etag=${encodeURIComponent(sw.etag)}`,
    });
    assert.equal(swUnchangedRes.statusCode, 200);
    assert.equal(swUnchangedRes.json().unchanged, true);
    assert.equal(swUnchangedRes.json().etag, sw.etag);

    const unauth = await srv.inject({ method: 'POST', url: '/api/native-patch/apply' });
    assert.equal(unauth.statusCode, 403);

    const applied = await srv.inject({
      method: 'POST',
      url: '/api/native-patch/apply',
      headers: { 'x-sidecar-token': 'test-hive-secret' },
    });
    assert.equal(applied.statusCode, 200);
    assert.equal(applied.json().patched, true);
    assert.equal(applied.json().logoPatched, true);

    const restored = await srv.inject({
      method: 'POST',
      url: '/api/native-patch/restore',
      headers: { 'x-sidecar-token': 'test-hive-secret' },
    });
    assert.equal(restored.statusCode, 200);
    assert.equal(restored.json().patched, false);
    assert.equal(restored.json().logoPatched, false);
  } finally {
    await srv.close();
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});
