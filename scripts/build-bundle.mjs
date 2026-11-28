#!/usr/bin/env node
/**
 * 构建脚本：将 logo、高浓度花名引擎、像素精灵引擎、Demo 数据、CSS 主题与运行时核心
 * 打包为单个轻量化无外部依赖的前端文件 dist/gemineko-hive.js，供原生 Swarm 换肤与独立 Sidecar 共用。
 * 25 张 128x128 动作立绘通过 /gemineko-sprites/<role>-<action>.png 按需懒加载，保持主包体积精简。
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function fileToDataUri(absPath, mime = 'image/png') {
  if (!fs.existsSync(absPath)) {
    throw new Error(`缺少静态资源文件: ${absPath}`);
  }
  const b64 = fs.readFileSync(absPath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

/**
 * 剥离 ESM export/import 语法，以便内联包裹为单一浏览器 IIFE。
 * @param {string} src
 */
function stripModuleSyntax(src) {
  return src
    .replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"]\s*;?\r?\n?/gm, '')
    .replace(/^\s*export\s+(?=(?:async\s+)?function|const|let|var|class)/gm, '');
}

export function buildGeminekoBundle() {
  let pkgVersion = '0.8.4';
  try {
    const pkgRaw = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    if (pkgRaw?.version) pkgVersion = String(pkgRaw.version).trim();
  } catch {}

  const assets = {
    logo: fileToDataUri(path.join(REPO_ROOT, 'assets', 'logo.png')),
  };

  const themeCss = fs.readFileSync(path.join(REPO_ROOT, 'src', 'theme', 'gemineko-theme.css'), 'utf8');
  const nicknamesSrc = stripModuleSyntax(
    fs.readFileSync(path.join(REPO_ROOT, 'src', 'theme', 'nicknames.js'), 'utf8'),
  );
  const pixelSrc = stripModuleSyntax(
    fs.readFileSync(path.join(REPO_ROOT, 'src', 'theme', 'pixel-sprites.js'), 'utf8'),
  );
  const demoSrc = stripModuleSyntax(
    fs.readFileSync(path.join(REPO_ROOT, 'src', 'theme', 'demo-data.js'), 'utf8'),
  );
  const workshopSrc = stripModuleSyntax(
    fs.readFileSync(path.join(REPO_ROOT, 'src', 'theme', 'theme-workshop.js'), 'utf8'),
  );
  const runtimeSrc = stripModuleSyntax(
    fs.readFileSync(path.join(REPO_ROOT, 'src', 'theme', 'gemineko-runtime.js'), 'utf8'),
  );

  const bundle = [
    `// Built by Gemineko Hive v${pkgVersion} (scripts/build-bundle.mjs) — DO NOT EDIT DIRECTLY.`,
    '(function() {',
    '  "use strict";',
    '  if (typeof window === "undefined" || window.__GEMINEKO_HIVE_LOADED__) return;',
    '  window.__GEMINEKO_HIVE_LOADED__ = true;',
    `  const GEMINEKO_VERSION = ${JSON.stringify(pkgVersion)};`,
    `  const GEMINEKO_ASSETS = ${JSON.stringify(assets)};`,
    `  const GEMINEKO_CSS = ${JSON.stringify(themeCss)};`,
    '',
    '// === nicknames ===',
    nicknamesSrc,
    '',
    '// === pixel-sprites ===',
    pixelSrc,
    '',
    '// === demo-data ===',
    demoSrc,
    '',
    '// === theme-workshop ===',
    workshopSrc,
    '',
    '// === gemineko-runtime ===',
    runtimeSrc,
    '',
    '  if (typeof bootGeminekoHive === "function") {',
    '    bootGeminekoHive();',
    '  }',
    '})();',
    '',
  ].join('\n');

  // 写入前进行 V8 语法验证
  new vm.Script(bundle, { filename: 'dist/gemineko-hive.js' });

  const distDir = path.join(REPO_ROOT, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  const outPath = path.join(distDir, 'gemineko-hive.js');
  fs.writeFileSync(outPath, bundle, 'utf8');
  return { outPath, bytes: Buffer.byteLength(bundle, 'utf8') };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const res = buildGeminekoBundle();
  console.log(`[build-bundle] Built ${res.outPath} (${res.bytes} bytes)`);
}
