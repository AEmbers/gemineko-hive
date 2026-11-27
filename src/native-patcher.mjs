/**
 * 原生 Swarm 面板（builtin/plugins/swarm/sidecars/swarm_board）无损换肤补丁引擎 v0.4.0。
 * 1. 只在 index.html 和 main.mjs 中插入带标记块的挂载点，绝不修改官方 app.js / hive.js / gif.js / styles.css。
 * 2. 将 assets/sprites/*.png 复制到 swarm_board/gemineko-sprites/，并在 main.mjs 的 app.run() 前注册独立 PNG 二进制路由（严禁放进 UTF-8 STATIC）。
 * 3. 无损备份并替换 builtin/plugins/swarm/assets/logo.svg，使对话流的 [Open the Swarm UI] 入口同步换装，还原时原样恢复。
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const HTML_MARK_START = '<!-- GEMINEKO_HIVE_START -->';
const HTML_MARK_END = '<!-- GEMINEKO_HIVE_END -->';
const JS_MARK_START = '/* GEMINEKO_HIVE_START */';
const JS_MARK_END = '/* GEMINEKO_HIVE_END */';
const ROUTES_MARK_START = '/* GEMINEKO_HIVE_ROUTES_START */';
const ROUTES_MARK_END = '/* GEMINEKO_HIVE_ROUTES_END */';
const LOGO_MARKER = '<!-- GEMINEKO_HIVE_LOGO_V2 -->';

/**
 * 定位内置原生 swarm_board 目录、sprites 源目录、logo.png 以及打包产物。
 * @param {object} [opts]
 */
export function resolveSwarmPaths(opts = {}) {
  const homeDir = os.homedir();
  const swarmBoardDir = opts.swarmDir
    ? path.resolve(opts.swarmDir)
    : path.join(homeDir, '.gemini', 'antigravity', 'builtin', 'plugins', 'swarm', 'sidecars', 'swarm_board');
  const bundlePath = opts.bundlePath
    ? path.resolve(opts.bundlePath)
    : path.join(REPO_ROOT, 'dist', 'gemineko-hive.js');
  const spritesSourceDir = opts.spritesSourceDir
    ? path.resolve(opts.spritesSourceDir)
    : path.join(REPO_ROOT, 'assets', 'sprites');
  const logoPngPath = opts.logoPngPath
    ? path.resolve(opts.logoPngPath)
    : path.join(REPO_ROOT, 'assets', 'logo.png');
  const swarmLogoSvgPath = path.resolve(swarmBoardDir, '..', '..', 'assets', 'logo.svg');
  const swarmLogoBakPath = `${swarmLogoSvgPath}.gemineko.bak`;

  return {
    swarmBoardDir,
    bundlePath,
    spritesSourceDir,
    logoPngPath,
    swarmLogoSvgPath,
    swarmLogoBakPath,
  };
}

/**
 * 剥离文本中成对出现的标记块及其紧邻空行/空格。
 */
function stripMarkedBlock(text, startMark, endMark) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:\\r?\\n[ \\t]*)?${esc(startMark)}[\\s\\S]*?${esc(endMark)}[ \\t]*`, 'g');
  return String(text || '').replace(re, '');
}

/**
 * 原子写入文件内容，保持稳定性。
 */
function writeAtomic(filePath, content) {
  const tmp = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

/**
 * 计算文件 SHA-256 摘要，文件不存在时返回空串。
 */
function sha256OrEmpty(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * 列出 spritesSourceDir 下所有 `.png` 精灵文件名。
 */
function listSourceSprites(spritesSourceDir) {
  if (!fs.existsSync(spritesSourceDir)) return [];
  return fs
    .readdirSync(spritesSourceDir)
    .filter((f) => /\.png$/i.test(f))
    .sort();
}

/**
 * 生成嵌入 Base64 PNG 的 SVG（用于无损替换 swarm/assets/logo.svg）。
 */
function buildReplacementLogoSvg(logoPngPath) {
  const b64 = fs.readFileSync(logoPngPath).toString('base64');
  return [
    LOGO_MARKER,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">',
    `  <image href="data:image/png;base64,${b64}" x="0" y="0" width="256" height="256" preserveAspectRatio="xMidYMid slice"/>`,
    '</svg>',
    '',
  ].join('\n');
}

/**
 * 查询官方原生 Swarm 面板当前的《基米窝》换肤状态。
 * @param {object} [opts]
 */
export function getNativePatchStatus(opts = {}) {
  const paths = resolveSwarmPaths(opts);
  const { swarmBoardDir, bundlePath, spritesSourceDir, swarmLogoSvgPath, swarmLogoBakPath } = paths;
  const indexPath = path.join(swarmBoardDir, 'index.html');
  const mainPath = path.join(swarmBoardDir, 'main.mjs');
  const targetBundlePath = path.join(swarmBoardDir, 'gemineko-hive.js');
  const targetSpritesDir = path.join(swarmBoardDir, 'gemineko-sprites');

  const swarmExists = fs.existsSync(indexPath) && fs.existsSync(mainPath);
  const bundleBuilt = fs.existsSync(bundlePath);

  if (!swarmExists) {
    return {
      ok: true,
      swarmBoardDir,
      swarmExists: false,
      bundleBuilt,
      patched: false,
      upToDate: false,
      logoPatched: false,
      spriteCount: 0,
      reason: 'not-found',
    };
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const mainJs = fs.readFileSync(mainPath, 'utf8');
  const htmlPatched = html.includes(HTML_MARK_START) && html.includes(HTML_MARK_END);
  const mainPatched = mainJs.includes(JS_MARK_START) && mainJs.includes(JS_MARK_END);
  const routesPatched = mainJs.includes(ROUTES_MARK_START) && mainJs.includes(ROUTES_MARK_END);
  const targetExists = fs.existsSync(targetBundlePath);

  const expectedSprites = listSourceSprites(spritesSourceDir);
  const actualSprites = fs.existsSync(targetSpritesDir)
    ? fs.readdirSync(targetSpritesDir).filter((f) => /\.png$/i.test(f))
    : [];
  const spritesReady = expectedSprites.length === 0 || expectedSprites.every((f) => actualSprites.includes(f));

  const logoPatched = fs.existsSync(swarmLogoSvgPath)
    ? fs.readFileSync(swarmLogoSvgPath, 'utf8').includes(LOGO_MARKER)
    : false;
  const logoBackupExists = fs.existsSync(swarmLogoBakPath);

  const srcSha = sha256OrEmpty(bundlePath);
  const dstSha = sha256OrEmpty(targetBundlePath);
  const patched = htmlPatched && mainPatched && routesPatched && targetExists;
  const upToDate = Boolean(patched && spritesReady && srcSha && dstSha && srcSha === dstSha);

  return {
    ok: true,
    swarmBoardDir,
    swarmExists: true,
    bundleBuilt,
    htmlPatched,
    mainPatched,
    routesPatched,
    targetExists,
    spritesReady,
    spriteCount: actualSprites.length,
    logoPatched,
    logoBackupExists,
    patched,
    upToDate,
    bundleSha256: dstSha || '',
  };
}

/**
 * 为原生 Swarm 面板无损套用（或升级覆盖）《基米窝》v0.4.0 皮肤。
 * @param {object} [opts]
 */
export function applyNativePatch(opts = {}) {
  const paths = resolveSwarmPaths(opts);
  const { swarmBoardDir, bundlePath, spritesSourceDir, logoPngPath, swarmLogoSvgPath, swarmLogoBakPath } = paths;
  const indexPath = path.join(swarmBoardDir, 'index.html');
  const mainPath = path.join(swarmBoardDir, 'main.mjs');
  const targetBundlePath = path.join(swarmBoardDir, 'gemineko-hive.js');
  const targetSpritesDir = path.join(swarmBoardDir, 'gemineko-sprites');

  if (!fs.existsSync(indexPath) || !fs.existsSync(mainPath)) {
    throw new Error(`未检测到官方原生 Swarm 目录或关键文件: ${swarmBoardDir}`);
  }
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`未找到已构建的皮肤脚本，请先运行 npm run build: ${bundlePath}`);
  }

  // 1. 注入 index.html（幂等剥离旧块后插入在 </body> 前）
  const rawHtml = fs.readFileSync(indexPath, 'utf8');
  const cleanHtml = stripMarkedBlock(rawHtml, HTML_MARK_START, HTML_MARK_END);
  const bodyCloseIdx = cleanHtml.lastIndexOf('</body>');
  if (bodyCloseIdx === -1) {
    throw new Error('原生 index.html 中未找到 </body> 挂载点，已安全中止');
  }
  const bundleTag = sha256OrEmpty(bundlePath).slice(0, 8) || '030';
  const htmlSnippet = `${HTML_MARK_START}<script src="/gemineko-hive.js?v=${bundleTag}"></script>${HTML_MARK_END}`;
  const nextHtml = cleanHtml.slice(0, bodyCloseIdx) + htmlSnippet + cleanHtml.slice(bodyCloseIdx);

  // 2. 注入 main.mjs：
  //   (a) 在 const STATIC = { 中挂载 /gemineko-hive.js（UTF-8 JS）
  //   (b) 在 app.run(); 前挂载 /gemineko-sprites/*.png 的二进制 PNG 路由（绝不写入 UTF-8 STATIC）
  const rawMain = fs.readFileSync(mainPath, 'utf8');
  const mainEol = rawMain.includes('\r\n') ? '\r\n' : '\n';
  let cleanMain = stripMarkedBlock(rawMain, JS_MARK_START, JS_MARK_END);
  cleanMain = stripMarkedBlock(cleanMain, ROUTES_MARK_START, ROUTES_MARK_END);

  const staticMatch = cleanMain.match(/const\s+STATIC\s*=\s*\{/);
  if (!staticMatch || staticMatch.index === undefined) {
    throw new Error('原生 main.mjs 中未找到 const STATIC = { 挂载点，已安全中止');
  }
  const insertAt = staticMatch.index + staticMatch[0].length;
  const jsSnippet = `${mainEol}  ${JS_MARK_START}'/gemineko-hive.js': ['gemineko-hive.js', 'application/javascript'],${JS_MARK_END}`;
  let nextMain = cleanMain.slice(0, insertAt) + jsSnippet + cleanMain.slice(insertAt);

  const appRunMatch = nextMain.match(/app\.run\s*\(\s*\)\s*;?/);
  if (!appRunMatch || appRunMatch.index === undefined) {
    throw new Error('原生 main.mjs 中未找到 app.run() 挂载点，已安全中止');
  }
  const sprites = listSourceSprites(spritesSourceDir);
  const routeLines = [
    ROUTES_MARK_START,
    `for (const _gkFile of ${JSON.stringify(sprites)}) {`,
    `  app.api('/gemineko-sprites/' + _gkFile, () => new Response(readFileSync(join(__dirname, 'gemineko-sprites', _gkFile)), { contentType: 'image/png', headers: { 'Cache-Control': 'no-cache' } }), 'GET');`,
    `}`,
    ROUTES_MARK_END,
  ].join(mainEol);
  nextMain =
    nextMain.slice(0, appRunMatch.index) +
    routeLines +
    mainEol +
    nextMain.slice(appRunMatch.index);

  // 先在临时文件进行 node --check 语法校验，避免污染原生脚本
  const syntaxTmp = path.join(os.tmpdir(), `gemineko-hive-check-${process.pid}.mjs`);
  try {
    fs.writeFileSync(syntaxTmp, nextMain, 'utf8');
    execFileSync(process.execPath, ['--check', syntaxTmp], { stdio: 'pipe', timeout: 10000 });
  } finally {
    fs.rmSync(syntaxTmp, { force: true });
  }

  // 3. 复制全套 25+ 动作精灵图至 gemineko-sprites/
  fs.mkdirSync(targetSpritesDir, { recursive: true });
  for (const file of sprites) {
    fs.copyFileSync(path.join(spritesSourceDir, file), path.join(targetSpritesDir, file));
  }

  // 4. 复制 bundle 并原子更新 HTML & main.mjs
  fs.copyFileSync(bundlePath, targetBundlePath);
  writeAtomic(indexPath, nextHtml);
  writeAtomic(mainPath, nextMain);

  // 5. 无损备份并替换 swarm/assets/logo.svg（用于主对话区入口图标美化）
  if (fs.existsSync(swarmLogoSvgPath) && fs.existsSync(logoPngPath)) {
    const curLogo = fs.readFileSync(swarmLogoSvgPath, 'utf8');
    if (!curLogo.includes(LOGO_MARKER) && !fs.existsSync(swarmLogoBakPath)) {
      fs.copyFileSync(swarmLogoSvgPath, swarmLogoBakPath);
    }
    writeAtomic(swarmLogoSvgPath, buildReplacementLogoSvg(logoPngPath));
  }

  return {
    ...getNativePatchStatus(opts),
    action: 'applied',
  };
}

/**
 * 将原生 Swarm 面板及 swarm/assets/logo.svg 字节级无损还原回官方原版。
 * @param {object} [opts]
 */
export function restoreNativePatch(opts = {}) {
  const paths = resolveSwarmPaths(opts);
  const { swarmBoardDir, swarmLogoSvgPath, swarmLogoBakPath } = paths;
  const indexPath = path.join(swarmBoardDir, 'index.html');
  const mainPath = path.join(swarmBoardDir, 'main.mjs');
  const targetBundlePath = path.join(swarmBoardDir, 'gemineko-hive.js');
  const targetSpritesDir = path.join(swarmBoardDir, 'gemineko-sprites');

  if (!fs.existsSync(indexPath) || !fs.existsSync(mainPath)) {
    throw new Error(`未检测到官方原生 Swarm 目录或关键文件: ${swarmBoardDir}`);
  }

  const rawHtml = fs.readFileSync(indexPath, 'utf8');
  const nextHtml = stripMarkedBlock(rawHtml, HTML_MARK_START, HTML_MARK_END);
  if (nextHtml !== rawHtml) {
    writeAtomic(indexPath, nextHtml);
  }

  const rawMain = fs.readFileSync(mainPath, 'utf8');
  let nextMain = stripMarkedBlock(rawMain, JS_MARK_START, JS_MARK_END);
  nextMain = stripMarkedBlock(nextMain, ROUTES_MARK_START, ROUTES_MARK_END);
  if (nextMain !== rawMain) {
    const syntaxTmp = path.join(os.tmpdir(), `gemineko-hive-restore-check-${process.pid}.mjs`);
    try {
      fs.writeFileSync(syntaxTmp, nextMain, 'utf8');
      execFileSync(process.execPath, ['--check', syntaxTmp], { stdio: 'pipe', timeout: 10000 });
    } finally {
      fs.rmSync(syntaxTmp, { force: true });
    }
    writeAtomic(mainPath, nextMain);
  }

  fs.rmSync(targetBundlePath, { force: true });
  fs.rmSync(targetSpritesDir, { recursive: true, force: true });

  if (fs.existsSync(swarmLogoBakPath)) {
    fs.copyFileSync(swarmLogoBakPath, swarmLogoSvgPath);
    fs.rmSync(swarmLogoBakPath, { force: true });
  }

  return {
    ...getNativePatchStatus(opts),
    action: 'restored',
  };
}
