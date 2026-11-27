/**
 * 原生 Swarm 面板（builtin/plugins/swarm/sidecars/swarm_board）无损换肤补丁引擎。
 * 只在 index.html 和 main.mjs 中插入带标记块的单行挂载点，绝不修改官方 app.js / hive.js / gif.js / styles.css。
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

/**
 * 定位内置原生 swarm_board 目录与本插件打包生成的 dist/gemineko-hive.js。
 * @param {object} [opts]
 * @returns {{ swarmBoardDir: string, bundlePath: string }}
 */
export function resolveSwarmPaths(opts = {}) {
  const homeDir = os.homedir();
  const swarmBoardDir = opts.swarmDir
    ? path.resolve(opts.swarmDir)
    : path.join(homeDir, '.gemini', 'antigravity', 'builtin', 'plugins', 'swarm', 'sidecars', 'swarm_board');
  const bundlePath = opts.bundlePath
    ? path.resolve(opts.bundlePath)
    : path.join(REPO_ROOT, 'dist', 'gemineko-hive.js');
  return { swarmBoardDir, bundlePath };
}

/**
 * 剥离文本中成对出现的标记块及其紧邻空行/空格。
 * @param {string} text
 * @param {string} startMark
 * @param {string} endMark
 * @returns {string}
 */
function stripMarkedBlock(text, startMark, endMark) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:\\r?\\n[ \\t]*)?${esc(startMark)}[\\s\\S]*?${esc(endMark)}[ \\t]*`, 'g');
  return String(text || '').replace(re, '');
}

/**
 * 原子写入文件内容，保持稳定性。
 * @param {string} filePath
 * @param {string} content
 */
function writeAtomic(filePath, content) {
  const tmp = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

/**
 * 计算文件 SHA-256 摘要，文件不存在时返回空串。
 * @param {string} filePath
 * @returns {string}
 */
function sha256OrEmpty(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * 查询官方原生 Swarm 面板当前的《基米窝》换肤状态。
 * @param {object} [opts]
 */
export function getNativePatchStatus(opts = {}) {
  const { swarmBoardDir, bundlePath } = resolveSwarmPaths(opts);
  const indexPath = path.join(swarmBoardDir, 'index.html');
  const mainPath = path.join(swarmBoardDir, 'main.mjs');
  const targetBundlePath = path.join(swarmBoardDir, 'gemineko-hive.js');

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
      reason: 'not-found',
    };
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const mainJs = fs.readFileSync(mainPath, 'utf8');
  const htmlPatched = html.includes(HTML_MARK_START) && html.includes(HTML_MARK_END);
  const mainPatched = mainJs.includes(JS_MARK_START) && mainJs.includes(JS_MARK_END);
  const targetExists = fs.existsSync(targetBundlePath);

  const srcSha = sha256OrEmpty(bundlePath);
  const dstSha = sha256OrEmpty(targetBundlePath);
  const patched = htmlPatched && mainPatched && targetExists;
  const upToDate = Boolean(patched && srcSha && dstSha && srcSha === dstSha);

  return {
    ok: true,
    swarmBoardDir,
    swarmExists: true,
    bundleBuilt,
    htmlPatched,
    mainPatched,
    targetExists,
    patched,
    upToDate,
    bundleSha256: dstSha || '',
  };
}

/**
 * 为原生 Swarm 面板无损套用（或升级覆盖恢复）《基米窝》皮肤。
 * @param {object} [opts]
 */
export function applyNativePatch(opts = {}) {
  const { swarmBoardDir, bundlePath } = resolveSwarmPaths(opts);
  const indexPath = path.join(swarmBoardDir, 'index.html');
  const mainPath = path.join(swarmBoardDir, 'main.mjs');
  const targetBundlePath = path.join(swarmBoardDir, 'gemineko-hive.js');

  if (!fs.existsSync(indexPath) || !fs.existsSync(mainPath)) {
    throw new Error(`未检测到官方原生 Swarm 目录或关键文件: ${swarmBoardDir}`);
  }
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`未找到已构建的皮肤脚本，请先运行 npm run build: ${bundlePath}`);
  }

  // 1. 注入 index.html（幂等剥离旧块后插入在 </body> 前）
  const rawHtml = fs.readFileSync(indexPath, 'utf8');
  const htmlEol = rawHtml.includes('\r\n') ? '\r\n' : '\n';
  const cleanHtml = stripMarkedBlock(rawHtml, HTML_MARK_START, HTML_MARK_END);
  const bodyCloseIdx = cleanHtml.lastIndexOf('</body>');
  if (bodyCloseIdx === -1) {
    throw new Error('原生 index.html 中未找到 </body> 挂载点，已安全中止');
  }
  const htmlSnippet = `${HTML_MARK_START}<script src="/gemineko-hive.js"></script>${HTML_MARK_END}`;
  const nextHtml = cleanHtml.slice(0, bodyCloseIdx) + htmlSnippet + cleanHtml.slice(bodyCloseIdx);

  // 2. 注入 main.mjs（幂等剥离旧块后插入在 const STATIC = { 后）
  const rawMain = fs.readFileSync(mainPath, 'utf8');
  const mainEol = rawMain.includes('\r\n') ? '\r\n' : '\n';
  const cleanMain = stripMarkedBlock(rawMain, JS_MARK_START, JS_MARK_END);
  const staticMatch = cleanMain.match(/const\s+STATIC\s*=\s*\{/);
  if (!staticMatch || staticMatch.index === undefined) {
    throw new Error('原生 main.mjs 中未找到 const STATIC = { 挂载点，已安全中止');
  }
  const insertAt = staticMatch.index + staticMatch[0].length;
  const jsSnippet = `${mainEol}  ${JS_MARK_START}'/gemineko-hive.js': ['gemineko-hive.js', 'application/javascript'],${JS_MARK_END}`;
  const nextMain = cleanMain.slice(0, insertAt) + jsSnippet + cleanMain.slice(insertAt);

  // 先在临时文件进行 node --check 语法校验，避免污染原生脚本
  const syntaxTmp = path.join(os.tmpdir(), `gemineko-hive-check-${process.pid}.mjs`);
  try {
    fs.writeFileSync(syntaxTmp, nextMain, 'utf8');
    execFileSync(process.execPath, ['--check', syntaxTmp], { stdio: 'pipe', timeout: 10000 });
  } finally {
    fs.rmSync(syntaxTmp, { force: true });
  }

  fs.copyFileSync(bundlePath, targetBundlePath);
  writeAtomic(indexPath, nextHtml);
  writeAtomic(mainPath, nextMain);

  return {
    ...getNativePatchStatus(opts),
    action: 'applied',
  };
}

/**
 * 将原生 Swarm 面板无损还原回官方原版小蜜蜂样式。
 * @param {object} [opts]
 */
export function restoreNativePatch(opts = {}) {
  const { swarmBoardDir } = resolveSwarmPaths(opts);
  const indexPath = path.join(swarmBoardDir, 'index.html');
  const mainPath = path.join(swarmBoardDir, 'main.mjs');
  const targetBundlePath = path.join(swarmBoardDir, 'gemineko-hive.js');

  if (!fs.existsSync(indexPath) || !fs.existsSync(mainPath)) {
    throw new Error(`未检测到官方原生 Swarm 目录或关键文件: ${swarmBoardDir}`);
  }

  const rawHtml = fs.readFileSync(indexPath, 'utf8');
  const nextHtml = stripMarkedBlock(rawHtml, HTML_MARK_START, HTML_MARK_END);
  if (nextHtml !== rawHtml) {
    writeAtomic(indexPath, nextHtml);
  }

  const rawMain = fs.readFileSync(mainPath, 'utf8');
  const nextMain = stripMarkedBlock(rawMain, JS_MARK_START, JS_MARK_END);
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

  if (fs.existsSync(targetBundlePath)) {
    fs.rmSync(targetBundlePath, { force: true });
  }

  return {
    ...getNativePatchStatus(opts),
    action: 'restored',
  };
}
