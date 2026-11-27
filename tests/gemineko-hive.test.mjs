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
  resolveSpriteFile,
} from '../src/activity-tracker.mjs';
import { applyNativePatch, getNativePatchStatus, restoreNativePatch } from '../src/native-patcher.mjs';
import { translateHostText } from '../src/cdp/host-i18n-runtime.mjs';
import { buildCdpOverlayScript, formatDockModelDisplay } from '../src/cdp/host-injector.mjs';
import { parseMemeCaptionFromText } from '../src/cdp/host-meme-runtime.mjs';
import { BRAND_META } from '../src/meta/brand.mjs';
import { compareSemver, createGithubPulseService } from '../src/sidecar/github-pulse.mjs';
import { createHiveSidecarServer } from '../src/sidecar/server.mjs';
import { resolveMemeNickname } from '../src/theme/nicknames.js';
import {
  createThemePackManager,
  normalizeRemoteThemeUrl,
  sanitizeThemePack,
} from '../src/theme/theme-store.mjs';
import {
  buildCatNestDecoSvg,
  buildCatNestPath,
  parseHexPathGeometry,
} from '../src/theme/gemineko-runtime.js';
import {
  DEFAULT_HOST_THEME_CONFIG,
  ROLE_PALETTES,
  THEME_PRESETS,
  createThemeConfigStore,
  sanitizeHostThemeConfig,
  validateWallpaperFilePath,
  validateWatermarkImagePath,
} from '../src/theme/host-theme-config.mjs';

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

test('35 张角色×动作 512x512 PNG 立绘全部就绪且具备 RGBA 透明通道（含抱臂仰头思考 ponder）', () => {
  const roles = ['neon', 'hydrogen', 'carbon', 'claude', 'gpt'];
  const actions = ['thinking', 'reading', 'editing', 'running', 'asking', 'ponder', 'idle'];
  const spritesDir = path.join(REPO_ROOT, 'assets', 'sprites');

  for (const role of roles) {
    for (const action of actions) {
      const filePath = path.join(spritesDir, `${role}-${action}.png`);
      assert.ok(fs.existsSync(filePath), `缺少精灵图: ${role}-${action}.png`);
      const buf = fs.readFileSync(filePath);
      assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${role}-${action}.png 不是合法 PNG`);
      assert.equal(buf.readUInt32BE(16), 512, `${role}-${action}.png 宽度应为 512`);
      assert.equal(buf.readUInt32BE(20), 512, `${role}-${action}.png 高度应为 512`);
      // PNG IHDR byte 25 为 colorType，6 表示带 Alpha 透明通道的 RGBA
      assert.equal(buf[25], 6, `${role}-${action}.png 应为 RGBA(colorType=6) 透明 PNG`);
      // 校验包含 APNG acTL 动画块且帧数 >= 2
      const actlIdx = buf.indexOf(Buffer.from('acTL'));
      assert.ok(actlIdx > 0, `${role}-${action}.png 应包含 APNG acTL 动画块`);
      const frameCount = buf.readUInt32BE(actlIdx + 4);
      assert.ok(frameCount >= 2, `${role}-${action}.png 动画帧数应 >= 2，实际为 ${frameCount}`);
    }
  }

  for (const gemName of ['home-star-gem-light.png', 'home-star-gem-dark.png']) {
    const gemPath = path.join(spritesDir, gemName);
    assert.ok(fs.existsSync(gemPath), `缺少首页 3D 星钻素材: ${gemName}`);
    const buf = fs.readFileSync(gemPath);
    assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${gemName} 不是合法 PNG`);
    const gemW = buf.readUInt32BE(16);
    const gemH = buf.readUInt32BE(20);
    assert.ok(gemW >= 256 && gemW === gemH, `${gemName} 应为 >=256 的正方形高清 PNG，实际为 ${gemW}x${gemH}`);
    assert.equal(buf[25], 6, `${gemName} 应为 RGBA(colorType=6) 透明 PNG`);
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
  assert.match(content, /transformHiveCellsToCatNests/);
  assert.match(content, /gn-catnest-layer/);
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
  assert.equal(classifyToolAction('exit_plan_mode', false, true), 'thinking');
  assert.equal(classifyToolAction('enter_plan_mode', false, true), 'thinking');
  assert.equal(resolveSpriteFile('neon', 'asking'), 'neon-asking.png');
  assert.equal(resolveSpriteFile('claude', 'nonexistent-action'), 'claude-thinking.png');
  assert.equal(resolveSpriteFile('unknown-role', 'reading'), 'neon-reading.png');
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
  const spriteCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemineko-sprite-cache-'));
  const srv = await createHiveSidecarServer({
    port: 0,
    bundlePath,
    swarmDir: sb.swarmDir,
    appDataDirs: [sb.appDataDir],
    spriteCacheDir,
    sideToken: 'test-hive-secret',
    enableCdp: false,
  });
  try {
    const hz = await srv.inject({ url: '/healthz' });
    assert.equal(hz.statusCode, 200);
    assert.equal(hz.json().version, BRAND_META.version);

    const preloadRes = await srv.inject({ url: '/preload.js' });
    assert.equal(preloadRes.statusCode, 200);
    assert.ok(preloadRes.text.length > 200, 'preload.js 不应为空注释');
    assert.match(preloadRes.text, /window\.sidecar/);

    const overlayScript = buildCdpOverlayScript(srv.origin, '');
    assert.match(overlayScript, /gemineko-cdp-composer-dock/);
    assert.match(overlayScript, /antigravity\.agentSidePanelInputBox/);
    assert.match(overlayScript, /gk-live-inline-wrap/);
    assert.match(overlayScript, /status-loading-spinner/);
    assert.match(overlayScript, /conversation-row-sidebar/);
    assert.doesNotMatch(overlayScript, /activePattern\s*=\s*\/\^\(\?:[^;\n]*爪子狂敲/);
    assert.match(overlayScript, /getCurrentConversationId/);
    assert.doesNotMatch(overlayScript, /cursor:\s*grabbing/);
    assert.doesNotMatch(overlayScript, /querySelectorAll\(['"]button, summary, \[role="button"\], div['"]\)/);

    const spriteRes = await fetch(`${srv.origin}/gemineko-sprites/neon-thinking.png`);
    assert.equal(spriteRes.status, 200);
    assert.equal(spriteRes.headers.get('content-type'), 'image/png');
    assert.equal(spriteRes.headers.get('access-control-allow-origin'), '*');
    const spriteBuf = Buffer.from(await spriteRes.arrayBuffer());
    assert.equal(spriteBuf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(spriteBuf.readUInt32BE(16), 512);

    for (const [tier, expectedSize] of [['384', 384], ['512', 512], ['1024', 1024]]) {
      const tr = await fetch(`${srv.origin}/gemineko-sprites/neon-thinking.png?q=${tier}`);
      assert.equal(tr.status, 200);
      const tb = Buffer.from(await tr.arrayBuffer());
      assert.equal(tb.readUInt32BE(16), expectedSize, `q=${tier} 宽度应为 ${expectedSize}`);
      assert.equal(tb.readUInt32BE(20), expectedSize, `q=${tier} 高度应为 ${expectedSize}`);
      assert.equal(tb[25], 6, `q=${tier} 应保留 RGBA 透明通道`);
      const actl = tb.indexOf(Buffer.from('acTL'));
      assert.ok(actl > 0 && tb.readUInt32BE(actl + 4) >= 2, `q=${tier} 应保留 APNG 多帧动画`);
    }
    const hitRes = await fetch(`${srv.origin}/gemineko-sprites/neon-thinking.png?q=384`);
    assert.equal(hitRes.status, 200);
    assert.equal(hitRes.headers.get('x-gemineko-sprite-cache'), 'hit');
    fs.rmSync(spriteCacheDir, { recursive: true, force: true });

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

test('猫耳软垫猫窝几何解析、安全包络路径与装饰 SVG 生成', () => {
  const hex = (x, y, r, a0) => {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a = ((a0 + 60 * k) * Math.PI) / 180;
      d += `${k ? 'L' : 'M'}${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`;
    }
    return `${d}Z`;
  };

  // 标准平顶六边形与 -120° 进度环六边形均应精准还原
  const gCell = parseHexPathGeometry(hex(200, 180, 108, 0));
  assert.ok(gCell);
  assert.ok(Math.abs(gCell.cx - 200) < 0.2);
  assert.ok(Math.abs(gCell.cy - 180) < 0.2);
  assert.ok(Math.abs(gCell.r - 108) < 0.2);

  const gProg = parseHexPathGeometry(hex(200, 180, 106, -120));
  assert.ok(gProg);
  assert.ok(Math.abs(gProg.cx - 200) < 0.2);
  assert.ok(Math.abs(gProg.cy - 180) < 0.2);
  assert.ok(Math.abs(gProg.r - 106) < 0.2);

  // 含曲线或非法字符串返回 null
  assert.equal(parseHexPathGeometry(''), null);
  assert.equal(parseHexPathGeometry('M0 0 C10 10 20 20 30 30 Z'), null);
  assert.equal(parseHexPathGeometry('M0 0 L10 0 L10 10 Z'), null);

  // 猫耳猫窝路径闭合且全部坐标落在安全包络内（|dx| <= r, dy in [-0.96r, 0.90r]）
  const nestD = buildCatNestPath(200, 200, 108);
  assert.ok(nestD.startsWith('M') && nestD.endsWith('Z'));
  const cCount = (nestD.match(/\bC/g) || []).length;
  assert.equal(cCount, 10);
  const coords = nestD.match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.ok(coords.length >= 20);
  for (let i = 0; i < coords.length; i += 2) {
    const dx = coords[i] - 200;
    const dy = coords[i + 1] - 200;
    assert.ok(Math.abs(dx) <= 108 * 0.99, `X 越界: dx=${dx}`);
    assert.ok(dy >= -108 * 0.95 && dy <= 108 * 0.86, `Y 越界: dy=${dy}`);
  }

  // 装饰层：协调喵主窝含蝴蝶结、普通大窝含猫爪，tiny 尺寸返回空串
  const coordDeco = buildCatNestDecoSvg(200, 200, 108, { isCoord: true });
  assert.match(coordDeco, /gn-nest-ear-inner/);
  assert.match(coordDeco, /gn-nest-stitch/);
  assert.match(coordDeco, /gn-nest-cushion/);
  assert.match(coordDeco, /gn-nest-bow-wing/);
  assert.doesNotMatch(coordDeco, /gn-nest-paw/);

  const taskDeco = buildCatNestDecoSvg(200, 200, 108, { isCoord: false });
  assert.match(taskDeco, /gn-nest-ear-inner/);
  assert.match(taskDeco, /gn-nest-paw/);
  assert.doesNotMatch(taskDeco, /gn-nest-bow-wing/);

  assert.equal(buildCatNestDecoSvg(200, 200, 24, { isCoord: false }), '');
});

test('host-theme-config 预设、角色调色板、壁纸路径安全门禁与原子持久化', () => {
  assert.deepEqual(Object.keys(THEME_PRESETS), [
    'nebula-day',
    'cream-paper',
    'starry-nest',
    'carbon-obsidian',
  ]);
  assert.deepEqual(Object.keys(ROLE_PALETTES), ['neon', 'hydrogen', 'carbon', 'claude', 'gpt']);

  // 验证 4 套主题均具备完整 5 级光学表面 Token，且浅色不撞脸纯白
  for (const preset of Object.values(THEME_PRESETS)) {
    for (const k of ['--background', '--sidebar', '--card', '--glass-shadow', '--glass-highlight', '--onyx-frame', '--gk-tonal-0', '--gk-pattern-ink']) {
      assert.ok(preset.vars[k], `${preset.id} 缺少光学变量 ${k}`);
    }
    assert.notEqual(preset.vars['--sidebar'], preset.vars['--card'], `${preset.id} 侧栏与卡片需拉开明暗对比`);
  }
  assert.notEqual(THEME_PRESETS['nebula-day'].vars['--background'].toUpperCase(), '#FFFFFF');
  for (const pal of Object.values(ROLE_PALETTES)) {
    assert.ok(pal.aurora1 && pal.aurora2 && pal.aurora3, `${pal.id} 缺少角色极光色`);
  }

  // 非法壁纸路径拦截：UNC、相对穿越、不支持格式
  assert.equal(validateWallpaperFilePath('\\\\evil-server\\share\\a.png').ok, false);
  assert.equal(validateWallpaperFilePath('relative/a.png').ok, false);
  assert.equal(validateWallpaperFilePath(path.join(REPO_ROOT, 'package.json')).ok, false);

  const samplePng = path.join(REPO_ROOT, 'assets', 'logo.png');
  const okCheck = validateWallpaperFilePath(samplePng);
  assert.equal(okCheck.ok, true);
  assert.equal(okCheck.mime, 'image/png');
  assert.equal(okCheck.isVideo, false);
  assert.equal(validateWatermarkImagePath(samplePng).ok, true);
  assert.equal(validateWatermarkImagePath('\\\\evil-server\\share\\wm.png').ok, false);

  // 验证 v0.6.0 开箱默认值：光学高定哈基米 + 角色星徽旋转指示器 + 提问抱臂思考舞台 + 猫娘表情全链路
  assert.equal(DEFAULT_HOST_THEME_CONFIG.themeIntensity, 'optical-neko');
  assert.equal(DEFAULT_HOST_THEME_CONFIG.askStageEnabled, true);
  assert.equal(DEFAULT_HOST_THEME_CONFIG.memes.enabled, true);
  assert.equal(DEFAULT_HOST_THEME_CONFIG.memes.inlineRender, true);
  assert.equal(DEFAULT_HOST_THEME_CONFIG.memes.autoFinishSticker, true);
  assert.equal(sanitizeHostThemeConfig({ themeIntensity: 'balanced' }).themeIntensity, 'optical-neko');
  assert.equal(DEFAULT_HOST_THEME_CONFIG.spinnerStyle, 'role-motif');
  assert.equal(DEFAULT_HOST_THEME_CONFIG.watermark.enabled, true);
  assert.equal(DEFAULT_HOST_THEME_CONFIG.watermark.role, 'follow-role');
  assert.equal(DEFAULT_HOST_THEME_CONFIG.i18n.mode, 'auto');
  assert.equal(DEFAULT_HOST_THEME_CONFIG.i18n.autoChineseStyle, 'neko-zh');
  assert.equal(ROLE_PALETTES.carbon.crestTitle, 'CARBON · GRAPHENE');
  assert.equal(ROLE_PALETTES.neon.crestTitle, 'NEON · GEMINEKO');
  assert.equal(sanitizeHostThemeConfig({ spinnerStyle: 'invalid' }).spinnerStyle, 'role-motif');
  assert.equal(sanitizeHostThemeConfig({ spinnerStyle: 'paw-bounce' }).spinnerStyle, 'paw-bounce');
  assert.equal(DEFAULT_HOST_THEME_CONFIG.spriteQuality, '512');
  assert.equal(sanitizeHostThemeConfig({ spriteQuality: '1024' }).spriteQuality, '1024');
  assert.equal(sanitizeHostThemeConfig({ spriteQuality: '999' }).spriteQuality, '512');
  assert.deepEqual(DEFAULT_HOST_THEME_CONFIG.dock, {
    side: 'left',
    catSize: 88,
    badgeScale: 115,
    sidecarAvatarSize: 64,
  });
  assert.deepEqual(
    sanitizeHostThemeConfig({ dock: { side: 'right', catSize: 200, badgeScale: 50, sidecarAvatarSize: 200 } }).dock,
    { side: 'right', catSize: 140, badgeScale: 85, sidecarAvatarSize: 112 },
  );
  assert.equal(sanitizeHostThemeConfig({ dock: { side: 'center' } }).dock.side, 'left');
  assert.equal(parseMemeCaptionFromText('[表情: 测试全绿通过]'), '测试全绿通过');
  assert.equal(parseMemeCaptionFromText('普通文本不含贴纸'), null);
  assert.equal(resolveSpriteFile('hydrogen', 'ponder'), 'hydrogen-ponder.png');

  // 验证内置宿主全量汉化双语模式并保留 Antigravity 品牌词
  assert.equal(translateHostText('Antigravity', 'neko-zh'), null);
  assert.equal(translateHostText('Overview', 'neko-zh'), '猫窝总览');
  assert.equal(translateHostText('Overview', 'zh'), '总览');
  assert.equal(translateHostText('Subagents', 'neko-zh'), '蜂巢小猫');
  assert.equal(translateHostText('Subagents', 'zh'), '子智能体');
  assert.equal(translateHostText('New Conversation', 'zh'), '新建对话');
  assert.equal(translateHostText('Worked for 6m', 'neko-zh'), '猫猫打工 6m');
  assert.equal(translateHostText('5 files changed', 'zh'), '5 个文件已变更');
  assert.equal(translateHostText('Ask anything, @ to mention, / for actions', 'zh'), '随便问点什么，@ 提及文件，/ 呼出指令');
  assert.equal(translateHostText('Welcome back, qilin. Where should we pick up?', 'neko-zh'), '欢迎回窝，qilin！今天想从哪开工喵？');
  assert.equal(translateHostText('Hey qilin, what should we build today?', 'neko-zh'), '嗨 qilin，今天带哈基米一起造点什么喵？');
  assert.equal(translateHostText("Good to see you, qilin. What's next?", 'neko-zh'), '见到你真开心，qilin 喵！接下来干点啥？');
  assert.equal(translateHostText('Interface Layout', 'zh'), '界面布局');
  assert.equal(translateHostText('Configure agent execution, queued message delivery, and permissions.', 'zh'), '配置智能体执行策略、排队消息投递方式及权限控制。');
  assert.equal(translateHostText('Send Immediately', 'zh'), '立即发送');
  assert.equal(translateHostText('This Computer', 'zh'), '本机电脑');
  assert.equal(translateHostText('just now', 'neko-zh'), '刚才喵');
  assert.equal(translateHostText('just now', 'zh'), '刚刚');
  assert.equal(translateHostText('Models & Usage', 'zh'), '模型与配额');
  assert.equal(translateHostText('Available AI credits: 0', 'zh'), '可用 AI 额度：0');
  assert.equal(translateHostText('Your plan: Google AI Ultra', 'zh'), '当前订阅：Google AI Ultra');
  assert.match(translateHostText('You have used some of your weekly limit, it will fully refresh in 5 days, 21 hours.', 'zh') || '', /5 天 21 小时/);
  assert.equal(translateHostText('Explored files', 'neko-zh'), '翻看过的文件');
  assert.equal(formatDockModelDisplay('gemini-4-hydrogen-high', 'hydrogen', false), '氢基米');
  assert.equal(formatDockModelDisplay('gemini-4-hydrogen-high', 'hydrogen', true), 'Hydrogen');
  assert.equal(formatDockModelDisplay('gemini-4-carbon-high', 'carbon', false), '碳基米');
  assert.equal(formatDockModelDisplay('gemini-4-neon-high', 'neon', false), '氖基米');
  assert.equal(formatDockModelDisplay('claude-sonnet-5-5-high', 'claude', false), '克劳德');
  assert.equal(formatDockModelDisplay('gpt-6-2-sol', 'gpt', false), 'GPT小龙');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemineko-theme-cfg-'));
  try {
    const cfgPath = path.join(tmpDir, 'theme-config.json');
    const store = createThemeConfigStore(cfgPath);
    assert.equal(store.get().preset, DEFAULT_HOST_THEME_CONFIG.preset);
    assert.equal(store.get().typography.sidecarFontSize, 14);
    assert.equal(store.get().typography.hostFontScale, 100);

    const updated = store.update({
      preset: 'starry-nest',
      focusMode: true,
      wallpaper: { mode: 'custom', filePath: samplePng, opacity: 0.99, blur: 99 },
      typography: { sidecarFontSize: 99, hostFontScale: 10 },
    });
    assert.equal(updated.preset, 'starry-nest');
    assert.equal(updated.focusMode, true);
    assert.equal(updated.wallpaper.mode, 'custom');
    assert.equal(updated.wallpaper.opacity, 0.65);
    assert.equal(updated.wallpaper.blur, 24);
    assert.equal(updated.typography.sidecarFontSize, 22);
    assert.equal(updated.typography.hostFontScale, 85);

    // 重新实例化验证持久化与非法枚举容错
    const store2 = createThemeConfigStore(cfgPath);
    assert.equal(store2.get().preset, 'starry-nest');
    const cleaned = sanitizeHostThemeConfig({
      preset: 'invalid-preset',
      accentMode: 'bad',
      typography: { sidecarFontSize: 2, hostFontScale: 300 },
    });
    assert.equal(cleaned.preset, 'auto');
    assert.equal(cleaned.accentMode, 'follow-role');
    assert.equal(cleaned.typography.sidecarFontSize, 11);
    assert.equal(cleaned.typography.hostFontScale, 135);

    const resetRes = store2.reset();
    assert.equal(resetRes.preset, 'auto');
    assert.equal(resetRes.focusMode, false);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('activity-tracker 报错信号与 Sidecar v0.5.0 主题/事件/Range壁纸/鉴权闭环', async () => {
  const sb = createFakeSwarmSandbox();
  const sampleWp = path.join(REPO_ROOT, 'assets', 'logo.png');
  const errLine = JSON.stringify({
    step_index: 99,
    runCommand: { commandOutput: 'Command exited with code 1' },
    createdAt: new Date().toISOString(),
  });
  fs.appendFileSync(path.join(sb.convDir, '.system_generated', 'logs', 'transcript.jsonl'), `${errLine}\n`);
  const actWithErr = readConversationLiveActivity(sb.convDir);
  assert.equal(actWithErr.hasError, true);
  assert.equal(actWithErr.errorSeq, '99');

  const srv = await createHiveSidecarServer({
    port: 0,
    enableCdp: false,
    swarmDir: sb.swarmDir,
    appDataDirs: [sb.appDataDir],
    sideToken: 'test-v5-secret',
    themeConfigPath: path.join(sb.root, 'theme-config.json'),
  });
  try {
    const hz = await srv.inject({ url: '/healthz' });
    assert.equal(hz.statusCode, 200);
    assert.equal(hz.json().version, BRAND_META.version);

    const unauthPost = await srv.inject({
      method: 'POST',
      url: '/api/theme/config',
      body: JSON.stringify({ preset: 'cream-paper' }),
    });
    assert.equal(unauthPost.statusCode, 403);

    const noWp = await srv.inject({ url: '/api/wallpaper/file' });
    assert.equal(noWp.statusCode, 404);

    const setRes = await srv.inject({
      method: 'POST',
      url: '/api/theme/config',
      headers: { 'x-sidecar-token': 'test-v5-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preset: 'cream-paper',
        wallpaper: { mode: 'custom', filePath: sampleWp },
      }),
    });
    assert.equal(setRes.statusCode, 200);
    assert.equal(setRes.json().config.preset, 'cream-paper');

    // 验证 HTTP 206 Range 流式壁纸响应
    const wpRange = await srv.inject({
      url: '/api/wallpaper/file',
      headers: { Range: 'bytes=0-15' },
    });
    assert.equal(wpRange.statusCode, 206);
    assert.equal(wpRange.headers['content-type'], 'image/png');
    assert.match(wpRange.headers['content-range'], /^bytes 0-15\//);

    // 验证双向联动事件总线
    const evPost = await srv.inject({
      method: 'POST',
      url: '/api/theme/event',
      headers: { 'x-sidecar-token': 'test-v5-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'hive-poke-burst', role: 'claude', combo: 5, source: 'host' }),
    });
    assert.equal(evPost.statusCode, 200);
    const evGet = await srv.inject({ url: '/api/theme/event' });
    assert.equal(evGet.statusCode, 200);
    assert.equal(evGet.json().latest.type, 'hive-poke-burst');
    assert.equal(evGet.json().latest.role, 'claude');

    // 验证构建包包含主题工坊且宿主脚本包含 v7 光学高定皮肤、提问轮盘舞台、表情集成与内置汉化引擎
    const cdpScript = buildCdpOverlayScript('http://127.0.0.1:19876', '', { sideToken: 'tk' });
    assert.match(cdpScript, /gemineko-host-theme-v5/);
    assert.match(cdpScript, /__GEMINEKO_CDP_OVERLAY_V7__/);
    assert.match(cdpScript, /optical-neko/);
    assert.match(cdpScript, /--gk-optical-hairline/);
    assert.match(cdpScript, /gkAuroraHorizonBreath/);
    assert.match(cdpScript, /gkAuroraFlowDriftA/);
    assert.match(cdpScript, /gkPrismHairlineFlow/);
    assert.match(cdpScript, /app-icon-new-conversation-button/);
    assert.match(cdpScript, /home-greeting-mark/);
    assert.match(cdpScript, /gemineko-home-emblem/);
    assert.match(cdpScript, /gemineko-community-pack-style/);
    assert.match(cdpScript, /data-gk-pack/);
    assert.match(cdpScript, /gk-home-brand-foot/);
    assert.match(cdpScript, /AEmbers\/gemineko-hive/);
    assert.match(cdpScript, /#07080B/);
    assert.match(cdpScript, /#101225/);
    assert.match(cdpScript, /data-gk-font-scaled/);
    assert.match(cdpScript, /--gk-host-font-scale/);
    assert.match(cdpScript, /gk-he-gem/);
    assert.match(cdpScript, /gk-he-caustic/);
    assert.match(cdpScript, /gkGem3DFloat/);
    assert.match(cdpScript, /--gk-gem-ry/);
    assert.match(cdpScript, /home-star-gem-light\.png/);
    assert.match(cdpScript, /home-star-gem-dark\.png/);
    assert.match(cdpScript, /gkGemSheenSweep/);
    assert.match(cdpScript, /gkStarTwinkle/);
    assert.match(cdpScript, /syncHomeBrandEmblem/);
    assert.match(cdpScript, /autoscroll-viewport/);
    assert.match(cdpScript, /--gk-rx/);
    assert.match(cdpScript, /gk-ask-thought-bubble/);
    assert.match(cdpScript, /gk-ask-ponder-img/);
    assert.match(cdpScript, /grid-template-columns:\s*108px minmax\(0,\s*1fr\)/);
    assert.match(cdpScript, /--gk-ask-rows/);
    assert.match(cdpScript, /ask-question-option/);
    assert.match(cdpScript, /ask-question-shortcut-badge/);
    assert.match(cdpScript, /ask-question-header-text/);
    assert.match(cdpScript, /-ponder\.png/);
    assert.match(cdpScript, /initHostMemeEngine/);
    assert.match(cdpScript, /--gk-catnest-pattern/);
    assert.match(cdpScript, /gemineko-conv-aurora/);
    assert.match(cdpScript, /gemineko-corner-watermark/);
    assert.match(cdpScript, /gemineko-home-stage/);
    assert.match(cdpScript, /gk-home-theme-btn/);
    assert.match(cdpScript, /document\.getElementById\('gemineko-home-stage'\)/);
    assert.match(cdpScript, /overview-panel/);
    assert.match(cdpScript, /title-menu-bar/);
    assert.match(cdpScript, /NEON · GEMINEKO/);
    assert.match(cdpScript, /CARBON · GRAPHENE/);
    assert.match(cdpScript, /initHostI18nEngine/);
    assert.match(cdpScript, /thinking-collapsible-trigger/);
    assert.match(cdpScript, /status-loading-spinner/);
    assert.match(cdpScript, /gkSpinnerOrbit/);
    assert.match(cdpScript, /gkSpinnerPawBounce/);
    assert.match(cdpScript, /--gk-spinner-role-svg/);
    assert.match(cdpScript, /animate-shimmer-text/);
    assert.match(cdpScript, /conversation-row-sidebar/);
    assert.match(cdpScript, /user-message-bubble/);
    assert.match(cdpScript, /surface-composer-card/);
    assert.match(cdpScript, /overlay-scrollbar-thumb/);
    assert.match(cdpScript, /捅了基米窝/);

    // 验证 /api/memes/list 与 /api/memes/file/ 安全门禁（拦截目录穿越 ../）
    const memeList = await srv.inject({ url: '/api/memes/list' });
    assert.equal(memeList.statusCode, 200);
    const memeTraversal = await srv.inject({ url: '/api/memes/file/..%2F..%2Fpackage.json' });
    assert.ok([403, 404].includes(memeTraversal.statusCode));

    // 验证自定义角落水印流式安全门禁（未配置返回 404，配置后返回 200 PNG）
    const noWm = await srv.inject({ url: '/api/watermark/file' });
    assert.equal(noWm.statusCode, 404);
    const setWmRes = await srv.inject({
      method: 'POST',
      url: '/api/theme/config',
      headers: { 'x-sidecar-token': 'test-v5-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ watermark: { enabled: true, role: 'custom', customFilePath: sampleWp, opacity: 0.16 } }),
    });
    assert.equal(setWmRes.statusCode, 200);
    assert.equal(setWmRes.json().config.watermark.role, 'custom');
    const wmFileRes = await srv.inject({ url: '/api/watermark/file' });
    assert.equal(wmFileRes.statusCode, 200);
    assert.equal(wmFileRes.headers['content-type'], 'image/png');

    // 验证 Dock 左右停靠与尺寸配置写入及读回闭环
    const setDockRes = await srv.inject({
      method: 'POST',
      url: '/api/theme/config',
      headers: { 'x-sidecar-token': 'test-v5-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ dock: { side: 'right', catSize: 112, badgeScale: 130, sidecarAvatarSize: 72 } }),
    });
    assert.equal(setDockRes.statusCode, 200);
    assert.deepEqual(setDockRes.json().config.dock, {
      side: 'right',
      catSize: 112,
      badgeScale: 130,
      sidecarAvatarSize: 72,
    });
    const getDockRes = await srv.inject({ url: '/api/theme/config' });
    assert.equal(getDockRes.statusCode, 200);
    assert.deepEqual(getDockRes.json().config.dock, {
      side: 'right',
      catSize: 112,
      badgeScale: 130,
      sidecarAvatarSize: 72,
    });

    const bundleRes = buildGeminekoBundle();
    assert.ok(bundleRes.bytes < 420_000, `主包体过大: ${bundleRes.bytes}`);
    const bundleContent = fs.readFileSync(bundleRes.outPath, 'utf8');
    assert.match(bundleContent, /createThemeWorkshopController/);
    assert.match(bundleContent, /主题商店|主题工坊/);
    assert.match(bundleContent, /syncSidecarHostTheme/);
    assert.match(bundleContent, /data-gn-scheme/);
    assert.match(bundleContent, /gn-store-preview/);
    assert.match(bundleContent, /gn-switch/);
    assert.match(bundleContent, /--gn-font-scale/);
    assert.match(bundleContent, /resolveHostNativeDark/);
    assert.doesNotMatch(bundleContent, /setAttrIfChanged\(root,\s*'data-theme',\s*scheme\)/);
    assert.match(bundleContent, /sidecarFontSize/);
    assert.match(bundleContent, /hostFontScale/);
    assert.match(bundleContent, /gemineko_typography_v1/);
    assert.match(bundleContent, /gn-font-val/);
    assert.match(bundleContent, /data-ws-sprite-q/);
    assert.match(bundleContent, /data-ws-dock-side/);
    assert.match(bundleContent, /data-ws-dock-range/);
    assert.match(bundleContent, /--gn-avatar-size/);
    assert.match(cdpScript, /--gk-dock-cat-size/);
    assert.match(cdpScript, /--gk-dock-badge-scale/);
    assert.match(cdpScript, /data-dock-side/);
    assert.match(cdpScript, /data-dock-range/);
    assert.match(cdpScript, /is-right/);
    const hostInjectorTxt = fs.readFileSync(path.join(REPO_ROOT, 'src/cdp/host-injector.mjs'), 'utf8');
    const checklistBlock = hostInjectorTxt.match(/function isInsideChecklistOrCard[\s\S]{0,650}/)?.[0] || '';
    assert.doesNotMatch(checklistBlock.split('return false;')[0], /tool-group-collapsible/, 'isInsideChecklistOrCard 不应一刀切排除活跃工具组折叠按钮');
    assert.match(hostInjectorTxt, /collapsibleBtn\s*=\s*sig\.closest\(['"]\[data-testid="tool-group-collapsible"\],\s*\[data-testid="thinking-collapsible-trigger"\]['"]\)/, 'syncActiveStatusSprite 应优先识别收起态工具/思考折叠触发行');
    assert.match(bundleContent, /\.gn-live-sub[\s\S]{0,160}--gn-font-scale/);
    assert.match(bundleContent, /image-rendering:\s*auto\s*!important/);
    assert.match(bundleContent, /\.msg-av\.bee\s*\{[\s\S]{0,180}--gn-font-scale/);
    for (const relSrc of ['src/cdp/host-injector.mjs', 'src/cdp/host-theme-runtime.mjs', 'src/cdp/host-meme-runtime.mjs']) {
      const srcTxt = fs.readFileSync(path.join(REPO_ROOT, relSrc), 'utf8');
      assert.match(srcTxt, /var\(--gk-host-font-scale,\s*1\)/, `${relSrc} 应接入 --gk-host-font-scale 动态缩放`);
    }
    const themeRuntimeTxt = fs.readFileSync(path.join(REPO_ROOT, 'src/cdp/host-theme-runtime.mjs'), 'utf8');
    assert.match(themeRuntimeTxt, /--gk-tail-x/, '气泡应支持动态指向尾巴 --gk-tail-x');
    assert.match(themeRuntimeTxt, /function onDockPoke\(role,\s*clientX,\s*clientY,\s*anchorEl\s*=\s*null\)/);
    assert.match(themeRuntimeTxt, /elapsed\s*>=\s*4000/, '自动收工贴纸阈值应降至 4000ms');
    const rulesTxt = fs.readFileSync(path.join(REPO_ROOT, 'rules/AGENTS.md'), 'utf8');
    assert.match(rulesTxt, /默认主动/, 'rules/AGENTS.md 应包含积极发表情规范');
    assert.match(bundleContent, /gemineko-sidecar-shell/);
    assert.match(bundleContent, /guardLoadingSkeleton/);
    assert.match(bundleContent, /offsetWidth/);

    // Bug #1 回归验证：缺失动作精灵不返回 404，安全回退 <role>-thinking.png
    const fallbackSprite = await srv.inject({ url: '/gemineko-sprites/gpt-unknown.png' });
    assert.equal(fallbackSprite.statusCode, 200);
    assert.equal(fallbackSprite.headers['content-type'], 'image/png');
    assert.equal(fallbackSprite.headers['x-gemineko-fallback'], '1');

    // Bug #2 回归验证：无 Swarm 的对话回退历史 Swarm 时保留请求 conversationId
    const fallbackConv = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const fbSwarmRes = await srv.inject({ url: `/api/swarm?conversationId=${fallbackConv}` });
    assert.equal(fbSwarmRes.statusCode, 200);
    assert.equal(fbSwarmRes.json().conversationId, fallbackConv);
    assert.equal(fbSwarmRes.json().isFallbackSwarm, true);
    assert.equal(fbSwarmRes.json().swarm, sb.convId);
  } finally {
    await srv.close();
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});

test('开放主题引擎安全门禁：CSS 注入拦截、GitHub Raw URL 规范化与社区商店全闭环', async () => {
  const dirty = sanitizeThemePack({
    schemaVersion: 1,
    id: 'bad-xss-pack',
    name: '恶意注入测试包',
    tokens: {
      '--valid-token': '#ff66aa',
      '--bad;color': 'red',
      '--js-val': 'javascript:alert(1)',
    },
    customCss: [
      '@import url("https://evil.com/x.css");',
      'body { background: url("http://evil.com/bg.png"); color: expression(alert(1)); }',
      '[data-has-browser-hole="true"] { background: #000 !important; }',
      'html[data-gk-pack="bad-xss-pack"] .surface-composer-card { border-radius: 16px; }',
      '</style><script>alert(1)</script>',
    ].join('\n'),
  });

  assert.equal(dirty.ok, true);
  assert.equal(dirty.pack.tokens['--valid-token'], '#ff66aa');
  assert.equal(dirty.pack.tokens['--bad;color'], undefined);
  assert.equal(dirty.pack.tokens['--js-val'], undefined);
  assert.ok(!/@import/i.test(dirty.pack.customCss));
  assert.ok(!/expression\s*\(/i.test(dirty.pack.customCss));
  assert.ok(!/<\/style/i.test(dirty.pack.customCss));
  assert.ok(!/data-has-browser-hole/i.test(dirty.pack.customCss));
  assert.ok((dirty.warnings || []).length >= 4);

  const reserved = sanitizeThemePack({ schemaVersion: 1, id: 'official-gemineko', name: '伪装官方包' });
  assert.equal(reserved.ok, false);

  assert.equal(normalizeRemoteThemeUrl('http://raw.githubusercontent.com/a/b/main/x.json').ok, false);
  assert.equal(normalizeRemoteThemeUrl('https://127.0.0.1/theme.json').ok, false);
  assert.equal(normalizeRemoteThemeUrl('https://evil.com/theme.json').ok, false);
  const blobNorm = normalizeRemoteThemeUrl('https://github.com/AEmbers/gemineko-hive/blob/main/themes/registry.json');
  assert.equal(blobNorm.ok, true);
  assert.equal(blobNorm.url, 'https://raw.githubusercontent.com/AEmbers/gemineko-hive/main/themes/registry.json');

  const tmpPacksDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemineko-packs-'));
  try {
    const mgr = createThemePackManager({ packsDir: tmpPacksDir, disableNetwork: true });
    const reg = await mgr.getCommunityRegistry();
    assert.equal(reg.ok, true);
    assert.ok(reg.registry.some((t) => t.id === 'official-gemineko' && t.official));
    assert.ok(reg.registry.some((t) => t.id === 'official-carbon-obsidian' && t.official));
    assert.ok(reg.registry.some((t) => t.id === 'kyoto-sakura-glass'));

    const inst = mgr.installPack({
      schemaVersion: 1,
      id: 'moonlight-cat',
      name: '月光猫窝',
      author: { name: 'Tester', url: 'https://github.com/AEmbers' },
      accent: { primary: '#38BDF8', accent2: '#A855F7' },
    });
    assert.equal(inst.ok, true);
    assert.equal(mgr.listInstalled().length, 1);

    const exported = mgr.exportThemePack({ preset: 'nebula-day', accentMode: 'neon' }, { id: 'exported-cat', name: '导出测试', authorName: 'AEmbers' });
    assert.equal(exported.ok, true);
    assert.equal(exported.pack.engine, BRAND_META.engineName);
    assert.ok(exported.pack.copyright.includes('AEmbers'));
    assert.ok(exported.submitUrl.includes('theme-submission'));

    assert.equal(mgr.uninstallPack('official-gemineko').ok, false);
    assert.equal(mgr.uninstallPack('moonlight-cat').ok, true);
    assert.equal(mgr.listInstalled().length, 0);
  } finally {
    fs.rmSync(tmpPacksDir, { recursive: true, force: true });
  }
});

test('Sidecar 社区商店接口、GitHub Star 与版本更新推送缓存闭环', async () => {
  assert.equal(compareSemver('0.8.0', '0.7.0'), 1);
  assert.equal(compareSemver('v0.7.0', '0.7.0'), 0);
  assert.equal(compareSemver('0.6.6', '0.7.0'), -1);

  const sb = createFakeSwarmSandbox();
  const cfgPath = path.join(sb.root, 'theme-config.json');
  const packsDir = path.join(sb.root, 'installed-themes');
  const cachePath = path.join(sb.root, 'github-cache.json');
  let fetchCount = 0;
  const mockFetch = async (url) => {
    fetchCount += 1;
    if (String(url).includes('/releases/latest')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ tag_name: 'v0.8.0', body: 'Open Theme Store 0.8.0', html_url: 'https://github.com/AEmbers/gemineko-hive/releases/tag/v0.8.0' }),
      };
    }
    if (String(url).includes('/repos/AEmbers/gemineko-hive')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ stargazers_count: 88, forks_count: 9 }),
      };
    }
    return { ok: false, status: 404, text: async () => '', json: async () => ({}) };
  };

  const srv = await createHiveSidecarServer({
    port: 0,
    appDataDirs: [sb.appDataDir],
    swarmDir: sb.swarmDir,
    bundlePath: path.join(REPO_ROOT, 'dist', 'gemineko-hive.js'),
    spritesSourceDir: path.join(REPO_ROOT, 'assets', 'sprites'),
    logoPngPath: path.join(REPO_ROOT, 'assets', 'logo.png'),
    themeConfigPath: cfgPath,
    themePacksDir: packsDir,
    githubCachePath: cachePath,
    fetchImpl: mockFetch,
    sideToken: 'test-store-secret',
    enableCdp: false,
  });

  try {
    const gh1 = await srv.inject({ url: '/api/github/status' });
    assert.equal(gh1.statusCode, 200);
    assert.equal(gh1.json().stars, 88);
    assert.equal(gh1.json().latestVersion, '0.8.0');
    assert.equal(gh1.json().hasUpdate, true);
    assert.equal(gh1.json().source, 'github-live');
    const callsAfterFirst = fetchCount;

    const gh2 = await srv.inject({ url: '/api/github/status' });
    assert.equal(gh2.statusCode, 200);
    assert.equal(gh2.json().source, 'cache');
    assert.equal(fetchCount, callsAfterFirst);

    const regRes = await srv.inject({ url: '/api/store/registry' });
    assert.equal(regRes.statusCode, 200);
    assert.equal(regRes.json().officialId, 'official-gemineko');
    assert.ok(regRes.json().registry.some((t) => t.id === 'kyoto-sakura-glass'));

    const actRes = await srv.inject({
      method: 'POST',
      url: '/api/store/activate',
      headers: { 'x-sidecar-token': 'test-store-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId: 'kyoto-sakura-glass' }),
    });
    assert.equal(actRes.statusCode, 200);
    assert.equal(actRes.json().config.activeThemePackId, 'kyoto-sakura-glass');
    assert.equal(actRes.json().config.activeThemePack.id, 'kyoto-sakura-glass');

    const savedOnDisk = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    assert.equal(savedOnDisk.activeThemePackId, 'kyoto-sakura-glass');
    assert.equal(savedOnDisk.activeThemePack, undefined);

    const expRes = await srv.inject({
      method: 'POST',
      url: '/api/store/export',
      headers: { 'x-sidecar-token': 'test-store-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'my-test-pack', name: '我的分享包', authorName: 'AEmbers' }),
    });
    assert.equal(expRes.statusCode, 200);
    assert.equal(expRes.json().pack.id, 'my-test-pack');
    assert.equal(expRes.json().filename, 'my-test-pack.gemineko-theme.json');

    const badExt = await srv.inject({
      method: 'POST',
      url: '/api/open-external',
      headers: { 'x-sidecar-token': 'test-store-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'file:///C:/Windows/System32/calc.exe' }),
    });
    assert.equal(badExt.statusCode, 400);

    const offlinePulse = createGithubPulseService({ cachePath: path.join(sb.root, 'missing-cache.json'), disableNetwork: true });
    const offStatus = await offlinePulse.getStatus();
    assert.equal(offStatus.ok, true);
    assert.equal(offStatus.source, 'offline-fallback');
  } finally {
    await srv.close();
    fs.rmSync(sb.root, { recursive: true, force: true });
  }
});
