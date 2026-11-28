/**
 * @file Gemineko Hive v0.8.3 极薄 app.asar 主进程引导钩子引擎（免 19222 端口 + 0ms 防白屏）。
 * 核心安全与共存准则：
 * 1. 仅使用独立标记块 (__GEMINEKO_HOST_LOADER_START__ / __GEMINEKO_HOST_LOADER_END__) 增量注入 dist/main.js；
 * 2. 不修改 dist/preload.js（避开沙箱/上下文隔离限制），所有业务逻辑、主题、彩蛋与汉化词典留在 Sidecar 热引擎；
 * 3. 始终从当前 app.asar 增量读取并写回，绝对保留第三方补丁（如 chinese-toolkit、agy-meme）；已有 app.asar.bak 绝不覆写；
 * 4. 写入前通过 vm.Script 严格语法校验；宿主运行锁定时绝不强杀自身进程，优雅返回独立终端一键命令。
 */

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function resolveRawFs() {
  if (process.versions?.electron) {
    try {
      const req = createRequire(import.meta.url);
      const origFs = req('original-fs');
      if (origFs && typeof origFs.openSync === 'function') {
        return origFs;
      }
    } catch {}
  }
  return fs;
}

const rawFs = resolveRawFs();

export const HOST_ASAR_MARK_START = "'__GEMINEKO_HOST_LOADER_START__';";
export const HOST_ASAR_MARK_END = "'__GEMINEKO_HOST_LOADER_END__';";
export const HOST_ASAR_VERSION = '0.8.3';

/**
 * 剥离文本中成对出现的标记块及其紧邻前导换行与空白。
 * @param {string} text
 * @param {string} startMark
 * @param {string} endMark
 * @returns {string}
 */
export function stripAsarMarkedBlock(text, startMark, endMark) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:\\r?\\n)?[ \\t]*${esc(startMark)}[\\s\\S]*?${esc(endMark)}[ \\t]*`, 'g');
  return String(text || '').replace(re, '');
}

/**
 * 标准 Electron ASAR 轻量级无依赖读写与增量修补器。
 */
export class AsarArchive {
  static align4(n) {
    return (n + 3) & ~3;
  }

  static readHeader(asarPath) {
    const fd = rawFs.openSync(asarPath, 'r');
    try {
      const sizeBuf = Buffer.alloc(8);
      rawFs.readSync(fd, sizeBuf, 0, 8, 0);
      const headerSize = sizeBuf.readUInt32LE(4);
      const headerBuf = Buffer.alloc(headerSize);
      rawFs.readSync(fd, headerBuf, 0, headerSize, 8);
      const jsonLen = headerBuf.readUInt32LE(4);
      const jsonStr = headerBuf.subarray(8, 8 + jsonLen).toString('utf8');
      const header = JSON.parse(jsonStr);
      const baseOffset = 8 + headerSize;
      return { header, baseOffset, headerSize, jsonLen };
    } finally {
      rawFs.closeSync(fd);
    }
  }

  static createHeaderBuffer(headerJson) {
    const jsonBuf = Buffer.from(headerJson, 'utf8');
    const jsonLen = jsonBuf.length;
    const alignedJsonLen = this.align4(jsonLen);
    const headerPayloadSize = 4 + alignedJsonLen;
    const headerBuf = Buffer.alloc(4 + headerPayloadSize);
    headerBuf.writeUInt32LE(headerPayloadSize, 0);
    headerBuf.writeUInt32LE(jsonLen, 4);
    jsonBuf.copy(headerBuf, 8);

    const sizeBuf = Buffer.alloc(8);
    sizeBuf.writeUInt32LE(4, 0);
    sizeBuf.writeUInt32LE(headerBuf.length, 4);
    return Buffer.concat([sizeBuf, headerBuf]);
  }

  static readFile(sourceAsar, relPath) {
    const { header, baseOffset } = this.readHeader(sourceAsar);
    const parts = String(relPath || '').replace(/\\/g, '/').split('/').filter(Boolean);
    let cur = header.files;
    for (const p of parts) {
      if (!cur || !cur[p]) return null;
      cur = cur[p].files ? cur[p].files : cur[p];
    }
    if (cur.unpacked) {
      const unpackedPath = path.join(`${sourceAsar}.unpacked`, ...parts);
      return rawFs.existsSync(unpackedPath) ? rawFs.readFileSync(unpackedPath) : null;
    }
    if (cur.offset === undefined || cur.size === undefined) return null;
    const fd = rawFs.openSync(sourceAsar, 'r');
    try {
      const buf = Buffer.alloc(cur.size);
      rawFs.readSync(fd, buf, 0, cur.size, baseOffset + parseInt(cur.offset, 10));
      return buf;
    } finally {
      rawFs.closeSync(fd);
    }
  }

  static patchArchive(sourceAsar, targetAsar, filePatches) {
    const { header, baseOffset } = this.readHeader(sourceAsar);
    const srcFd = rawFs.openSync(sourceAsar, 'r');
    let destFd = null;
    try {
      const fileEntries = [];
      const walk = (dir, prefix) => {
        for (const [name, entry] of Object.entries(dir || {})) {
          const fp = prefix ? `${prefix}/${name}` : name;
          if (entry.files) walk(entry.files, fp);
          else fileEntries.push({ path: fp, entry });
        }
      };
      walk(header.files, '');

      const existing = new Set(fileEntries.map((f) => f.path));
      const packed = fileEntries.filter((f) => !f.entry.unpacked && f.entry.offset !== undefined);
      packed.sort((a, b) => parseInt(a.entry.offset, 10) - parseInt(b.entry.offset, 10));

      for (const item of packed) {
        item.oldOffset = parseInt(item.entry.offset, 10);
        item.oldSize = item.entry.size;
        const patch = filePatches[item.path];
        if (patch !== undefined && patch !== null) {
          const patchBuf = Buffer.isBuffer(patch) ? patch : Buffer.from(patch, 'utf8');
          item.patchBuffer = patchBuf;
          item.entry.size = patchBuf.length;
        }
      }

      for (const [rawPath, patch] of Object.entries(filePatches)) {
        const cleanPath = String(rawPath).replace(/\\/g, '/').replace(/^\/+/, '');
        if (!cleanPath || existing.has(cleanPath) || patch === undefined || patch === null) continue;
        const parts = cleanPath.split('/');
        let dir = header.files;
        for (let i = 0; i < parts.length - 1; i++) {
          const seg = parts[i];
          if (!dir[seg] || !dir[seg].files) dir[seg] = { files: {} };
          dir = dir[seg].files;
        }
        const fileName = parts[parts.length - 1];
        const patchBuf = Buffer.isBuffer(patch) ? patch : Buffer.from(patch, 'utf8');
        const newEntry = { size: patchBuf.length, offset: '0' };
        dir[fileName] = newEntry;
        existing.add(cleanPath);
        packed.push({ path: cleanPath, entry: newEntry, oldOffset: 0, oldSize: 0, patchBuffer: patchBuf });
      }

      let curOffset = 0n;
      for (const item of packed) {
        item.entry.offset = curOffset.toString();
        curOffset += BigInt(item.entry.size);
      }

      const newHeaderBuf = this.createHeaderBuffer(JSON.stringify(header));
      destFd = rawFs.openSync(targetAsar, 'w');
      rawFs.writeSync(destFd, newHeaderBuf, 0, newHeaderBuf.length, 0);

      let writePos = newHeaderBuf.length;
      const copyChunk = 256 * 1024;
      const copyBuf = Buffer.alloc(copyChunk);
      for (const item of packed) {
        if (item.patchBuffer) {
          rawFs.writeSync(destFd, item.patchBuffer, 0, item.patchBuffer.length, writePos);
          writePos += item.patchBuffer.length;
        } else {
          let remaining = item.oldSize;
          let readPos = baseOffset + item.oldOffset;
          while (remaining > 0) {
            const toRead = Math.min(remaining, copyChunk);
            rawFs.readSync(srcFd, copyBuf, 0, toRead, readPos);
            rawFs.writeSync(destFd, copyBuf, 0, toRead, writePos);
            readPos += toRead;
            writePos += toRead;
            remaining -= toRead;
          }
        }
      }
    } finally {
      if (destFd !== null) try { rawFs.closeSync(destFd); } catch {}
      try { rawFs.closeSync(srcFd); } catch {}
    }
  }
}

/**
 * 返回默认 Sidecar 运行时端点名片路径。
 * @returns {string}
 */
export function getDefaultRuntimeEndpointPath() {
  return path.join(os.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive', 'runtime-endpoint.json');
}

/**
 * 解析 Antigravity 安装目录与 resources/app.asar 路径。
 * @param {object} [opts]
 */
export function resolveAntigravityResources(opts = {}) {
  const candidates = [];
  if (opts.resourcesDir) candidates.push(path.resolve(opts.resourcesDir));
  if (opts.installDir) {
    const idir = path.resolve(opts.installDir);
    candidates.push(path.join(idir, 'resources'));
    candidates.push(path.join(idir, 'Contents', 'Resources'));
    candidates.push(idir);
  }

  const home = os.homedir();
  const localApp = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
  const progFiles = process.env.ProgramFiles || 'C:\\Program Files';
  if (process.platform === 'win32') {
    candidates.push(
      path.join(localApp, 'Programs', 'antigravity', 'resources'),
      path.join(localApp, 'Programs', 'Antigravity', 'resources'),
      path.join(progFiles, 'Antigravity', 'resources'),
    );
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Antigravity.app/Contents/Resources',
      path.join(home, 'Applications', 'Antigravity.app', 'Contents', 'Resources'),
    );
  } else {
    candidates.push(
      '/usr/share/antigravity/resources',
      '/opt/Antigravity/resources',
      path.join(home, '.local', 'share', 'antigravity', 'resources'),
    );
  }

  let resourcesDir = '';
  for (const dir of candidates) {
    if (!dir) continue;
    if (rawFs.existsSync(path.join(dir, 'app.asar'))) {
      resourcesDir = dir;
      break;
    }
  }
  const asarPath = resourcesDir ? path.join(resourcesDir, 'app.asar') : '';
  const bakPath = resourcesDir ? path.join(resourcesDir, 'app.asar.bak') : '';
  return { resourcesDir, asarPath, bakPath };
}

/**
 * 生成写入 dist/main.js 末尾的极薄主进程引导脚本。
 * 全程运行在 Electron 主进程中，直连 127.0.0.1 Sidecar 并向 Hub webContents 注入主世界脚本。
 */
export function buildMainHostLoaderBlock() {
  const fn = function __geminekoInstallMainHostLoader() {
    if (globalThis.__GEMINEKO_MAIN_LOADER_INSTALLED__) return;
    globalThis.__GEMINEKO_MAIN_LOADER_INSTALLED__ = true;

    const electron = require('electron');
    const fsMod = require('fs');
    const httpMod = require('http');
    const osMod = require('os');
    const pathMod = require('path');

    const { app, webContents } = electron || {};
    if (!app || !webContents) return;

    const sidecarDataDir = pathMod.join(osMod.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive');
    const endpointFile = pathMod.join(sidecarDataDir, 'runtime-endpoint.json');
    const configFiles = [
      pathMod.join(sidecarDataDir, 'hive_board', 'data', 'theme-config.json'),
      pathMod.join(sidecarDataDir, 'theme-config.json'),
    ];
    const RETRY_DELAYS = [400, 900, 1500, 2500, 3500, 5000, 5000, 6000, 8000, 10000, 10000, 10000];

    const tracked = new Set();
    const retryTimers = new Map();
    const retryCounts = new Map();
    let dirWatcher = null;
    let watchDebounce = null;
    let lastObservedEndpointSig = '';

    const readJsonSafe = (fp) => {
      try {
        if (!fsMod.existsSync(fp)) return null;
        return JSON.parse(fsMod.readFileSync(fp, 'utf8'));
      } catch {
        return null;
      }
    };

    const readValidEndpoint = () => {
      const ep = readJsonSafe(endpointFile);
      if (!ep || typeof ep !== 'object') return null;
      const origin = String(ep.origin || '').trim().replace(/\/+$/, '');
      const m = /^http:\/\/127\.0\.0\.1:(\d{1,5})$/.exec(origin);
      if (!m) return null;
      const port = Number(m[1]);
      if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
      const token = String(ep.token || '').trim();
      const updatedAt = Number(ep.updatedAt || 0) || 0;
      return { origin, port, token, updatedAt, sig: `${origin}|${updatedAt}` };
    };

    const readThemeEarlyBg = () => {
      for (const cf of configFiles) {
        const cfg = readJsonSafe(cf);
        if (!cfg || typeof cfg !== 'object') continue;
        if (cfg.enabled === false) return '';
        if (cfg.preset === 'starry-nest') return '#0B0E1C';
        if (cfg.preset === 'carbon-obsidian') return '#090B12';
        return '';
      }
      return '';
    };

    const isTargetHubWebContents = (wc, endpointOrigin) => {
      if (!wc || wc.isDestroyed?.()) return false;
      const wcType = typeof wc.getType === 'function' ? wc.getType() : '';
      if (wcType === 'webview' || wcType === 'devtools' || wcType === 'backgroundPage') return false;
      const urlStr = String(typeof wc.getURL === 'function' ? wc.getURL() : '');
      if (!/^https?:\/\/(127\.0\.0\.1|localhost):\d+(\/|$)/i.test(urlStr)) return false;
      if (endpointOrigin && (urlStr === endpointOrigin || urlStr.startsWith(`${endpointOrigin}/`))) return false;
      return true;
    };

    const applyEarlySurfaceCss = (wc) => {
      if (!wc || wc.isDestroyed?.()) return;
      const urlStr = String(typeof wc.getURL === 'function' ? wc.getURL() : '');
      if (!/^https:\/\/(127\.0\.0\.1|localhost):\d+(\/|$)/i.test(urlStr)) return;
      const bg = readThemeEarlyBg();
      if (!bg || typeof wc.insertCSS !== 'function') return;
      wc.insertCSS(`html,body{background-color:${bg} !important;}`).catch(() => {});
    };

    const fetchBootstrapScript = (ep) =>
      new Promise((resolve) => {
        const reqPath = `/api/host-bootstrap.js?token=${encodeURIComponent(ep.token || '')}`;
        const req = httpMod.request(
          {
            hostname: '127.0.0.1',
            port: ep.port,
            path: reqPath,
            method: 'GET',
            timeout: 2000,
          },
          (res) => {
            if (res.statusCode !== 200) {
              res.resume();
              resolve('');
              return;
            }
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          },
        );
        req.on('timeout', () => {
          try { req.destroy(); } catch {}
          resolve('');
        });
        req.on('error', () => resolve(''));
        req.end();
      });

    const clearRetry = (wc) => {
      const t = retryTimers.get(wc);
      if (t) clearTimeout(t);
      retryTimers.delete(wc);
    };

    const ensureEndpointWatcher = () => {
      if (dirWatcher || !fsMod.existsSync(sidecarDataDir)) return;
      try {
        dirWatcher = fsMod.watch(sidecarDataDir, (_evt, fname) => {
          if (fname && String(fname) !== 'runtime-endpoint.json') return;
          if (watchDebounce) clearTimeout(watchDebounce);
          watchDebounce = setTimeout(() => {
            watchDebounce = null;
            const ep = readValidEndpoint();
            if (!ep || ep.sig === lastObservedEndpointSig) return;
            lastObservedEndpointSig = ep.sig;
            for (const wc of tracked) {
              if (!wc || wc.isDestroyed?.()) {
                tracked.delete(wc);
                continue;
              }
              void tryInject(wc, true);
            }
          }, 350);
          watchDebounce.unref?.();
        });
        dirWatcher.unref?.();
      } catch {
        dirWatcher = null;
      }
    };

    const scheduleRetry = (wc) => {
      if (!wc || wc.isDestroyed?.() || retryTimers.has(wc)) return;
      const attempt = retryCounts.get(wc) || 0;
      if (attempt >= RETRY_DELAYS.length) return;
      retryCounts.set(wc, attempt + 1);
      const timer = setTimeout(() => {
        retryTimers.delete(wc);
        void tryInject(wc, false);
      }, RETRY_DELAYS[attempt]);
      timer.unref?.();
      retryTimers.set(wc, timer);
    };

    const tryInject = async (wc, forceRefresh = false) => {
      ensureEndpointWatcher();
      const ep = readValidEndpoint();
      if (!ep) {
        scheduleRetry(wc);
        return false;
      }
      if (!isTargetHubWebContents(wc, ep.origin)) return false;
      lastObservedEndpointSig = ep.sig;
      applyEarlySurfaceCss(wc);

      try {
        const probeExpr = `(() => {
          if (window.__GEMINEKO_SIDECAR_MODE__) return 'sidecar';
          if (window.__GEMINEKO_CDP_OVERLAY_V7__ && window.__GEMINEKO_HOST_SERVER__ === ${JSON.stringify(ep.origin)}) return 'same';
          return 'need';
        })()`;
        const probe = await wc.executeJavaScript(probeExpr, false);
        if (probe === 'sidecar') return false;
        if (probe === 'same' && !forceRefresh) {
          clearRetry(wc);
          retryCounts.delete(wc);
          return true;
        }
        const script = await fetchBootstrapScript(ep);
        if (!script) {
          scheduleRetry(wc);
          return false;
        }
        await wc.executeJavaScript(script, false);
        clearRetry(wc);
        retryCounts.delete(wc);
        return true;
      } catch {
        scheduleRetry(wc);
        return false;
      }
    };

    const attachWebContents = (wc) => {
      if (!wc || wc.isDestroyed?.() || tracked.has(wc)) return;
      const wcType = typeof wc.getType === 'function' ? wc.getType() : '';
      if (wcType === 'webview' || wcType === 'devtools' || wcType === 'backgroundPage') return;
      tracked.add(wc);

      wc.on('did-start-loading', () => {
        applyEarlySurfaceCss(wc);
      });
      wc.on('dom-ready', () => {
        retryCounts.delete(wc);
        void tryInject(wc, false);
      });
      wc.on('did-finish-load', () => {
        void tryInject(wc, false);
      });
      wc.once('destroyed', () => {
        clearRetry(wc);
        retryCounts.delete(wc);
        tracked.delete(wc);
      });
    };

    app.on('web-contents-created', (_event, wc) => {
      attachWebContents(wc);
    });
    try {
      for (const wc of webContents.getAllWebContents() || []) {
        attachWebContents(wc);
        void tryInject(wc, false);
      }
    } catch {}
    ensureEndpointWatcher();
  };

  return [
    '',
    HOST_ASAR_MARK_START,
    '(() => {',
    '  try {',
    `    (${fn.toString()})();`,
    '  } catch (e) {}',
    '})();',
    HOST_ASAR_MARK_END,
    '',
  ].join('\n');
}

function isAntigravityProcessRunning() {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync('tasklist', ['/FI', 'IMAGENAME eq Antigravity.exe', '/NH'], { encoding: 'utf8', timeout: 5000 });
      return /Antigravity\.exe/i.test(out);
    }
    const out = execFileSync('pgrep', ['-f', 'Antigravity'], { encoding: 'utf8', timeout: 5000 });
    return Boolean(out.trim());
  } catch {
    return false;
  }
}

function isRunningInsideAntigravityTree() {
  try {
    const terms = [process.env.TERM_PROGRAM, process.env.VSCODE_GIT_ASKPASS_NODE, process.execPath].join(' ');
    return /antigravity/i.test(terms) || Boolean(process.env.ANTIGRAVITY_CLI_ALIAS);
  } catch {
    return false;
  }
}

function buildCliCommandHint(action) {
  const cliScript = path.join(REPO_ROOT, 'bin', 'gemineko-hive.mjs');
  return `node "${cliScript}" host-asar ${action}`;
}

/**
 * 只读检查原生 app.asar 当前极薄主进程引导补丁状态与第三方补丁共存信息。
 * @param {object} [opts]
 */
export function getHostAsarStatus(opts = {}) {
  const { resourcesDir, asarPath, bakPath } = resolveAntigravityResources(opts);
  const cliApplyCmd = buildCliCommandHint('apply');
  const cliRestoreCmd = buildCliCommandHint('restore');
  if (!resourcesDir || !rawFs.existsSync(asarPath)) {
    return {
      ok: true,
      found: false,
      resourcesDir: '',
      asarPath: '',
      bakExists: false,
      patched: false,
      version: '',
      hasLocalization: false,
      hasMemeRenderer: false,
      lockedByRunningApp: false,
      cliApplyCmd,
      cliRestoreCmd,
    };
  }
  let patched = false;
  let hasLocalization = false;
  let hasMemeRenderer = false;
  try {
    const mainBuf = AsarArchive.readFile(asarPath, 'dist/main.js');
    const mainText = mainBuf ? mainBuf.toString('utf8') : '';
    patched = mainText.includes(HOST_ASAR_MARK_START) && mainText.includes(HOST_ASAR_MARK_END);
    const asarBuf = rawFs.readFileSync(asarPath);
    hasLocalization = asarBuf.includes('__ANTIGRAVITY_CHINESE_LOCALIZATION_START__');
    hasMemeRenderer = asarBuf.includes('__ANTIGRAVITY_MEME_RENDERER_START__');
  } catch {}
  return {
    ok: true,
    found: true,
    resourcesDir,
    asarPath,
    bakExists: rawFs.existsSync(bakPath),
    patched,
    version: patched ? HOST_ASAR_VERSION : '',
    hasLocalization,
    hasMemeRenderer,
    lockedByRunningApp: opts.skipProcessCheck ? false : isAntigravityProcessRunning(),
    cliApplyCmd,
    cliRestoreCmd,
  };
}

function commitPatchedAsar(sourceAsar, targetAsar, filePatches, allowKillRunning) {
  const tmpAsar = `${targetAsar}.gkh.tmp.${process.pid}`;
  try {
    AsarArchive.patchArchive(sourceAsar, tmpAsar, filePatches);
    try {
      if (rawFs.existsSync(targetAsar)) rawFs.unlinkSync(targetAsar);
      rawFs.renameSync(tmpAsar, targetAsar);
      return { written: true };
    } catch (err) {
      if (err?.code === 'EBUSY' || err?.code === 'EPERM' || !allowKillRunning) {
        try { if (rawFs.existsSync(tmpAsar)) rawFs.unlinkSync(tmpAsar); } catch {}
        return { written: false, locked: true, error: err?.message || String(err) };
      }
      rawFs.copyFileSync(tmpAsar, targetAsar);
      try { rawFs.unlinkSync(tmpAsar); } catch {}
      return { written: true };
    }
  } finally {
    try { if (rawFs.existsSync(tmpAsar)) rawFs.unlinkSync(tmpAsar); } catch {}
  }
}

/**
 * 增量写入或升级 app.asar 极薄主进程引导钩子（绝不覆盖汉化/表情包补丁与既有 .bak）。
 * @param {object} [opts]
 */
export function applyHostAsarPatch(opts = {}) {
  const { resourcesDir, asarPath, bakPath } = resolveAntigravityResources(opts);
  const cliApplyCmd = buildCliCommandHint('apply');
  if (!resourcesDir || !rawFs.existsSync(asarPath)) {
    throw new Error('未检测到 Antigravity 客户端 app.asar 目录，仅可使用 CDP 兼容模式');
  }
  const allowKillRunning = Boolean(opts.allowKillRunning);
  const checkHostRunning = !opts.resourcesDir && !opts.skipProcessCheck;
  const hostRunning = checkHostRunning && isAntigravityProcessRunning();
  if (!allowKillRunning && hostRunning) {
    return {
      ok: false,
      locked: true,
      needsExternalRestart: true,
      cliApplyCmd,
      message: 'Antigravity 正在运行中并占用 app.asar；请关闭客户端后在独立终端运行一键引导命令',
      status: getHostAsarStatus(opts),
    };
  }

  let closedForPatch = false;
  if (allowKillRunning && hostRunning) {
    if (!opts.forceSelf && isRunningInsideAntigravityTree()) {
      return {
        ok: false,
        locked: true,
        needsExternalRestart: true,
        cliApplyCmd,
        message: '检测到当前命令运行在 Antigravity 内置终端中；为防止中断会话，请关闭 Antigravity 后在系统终端运行该命令',
        status: getHostAsarStatus(opts),
      };
    }
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/F', '/IM', 'Antigravity.exe'], { stdio: 'ignore', timeout: 8000 });
      closedForPatch = true;
    }
  }

  if (!rawFs.existsSync(bakPath)) {
    rawFs.copyFileSync(asarPath, bakPath);
  }

  const mainBuf = AsarArchive.readFile(asarPath, 'dist/main.js');
  if (!mainBuf) {
    throw new Error('app.asar 中未找到 dist/main.js，已安全中止');
  }
  const rawMain = mainBuf.toString('utf8');
  const cleaned = stripAsarMarkedBlock(rawMain, HOST_ASAR_MARK_START, HOST_ASAR_MARK_END).trimEnd();
  const nextMain = `${cleaned}\n${buildMainHostLoaderBlock()}`;
  new vm.Script(nextMain);

  const writeRes = commitPatchedAsar(asarPath, asarPath, { 'dist/main.js': nextMain }, allowKillRunning);
  if (!writeRes.written) {
    return {
      ok: false,
      locked: true,
      needsExternalRestart: true,
      cliApplyCmd,
      message: 'app.asar 当前被系统锁定，请关闭 Antigravity 后在独立终端执行一键引导命令',
      status: getHostAsarStatus(opts),
    };
  }

  if (closedForPatch && !opts.noRestart && process.platform === 'win32') {
    const exePath = path.join(path.dirname(resourcesDir), 'Antigravity.exe');
    if (rawFs.existsSync(exePath)) {
      spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
    }
  }

  return {
    ok: true,
    action: 'applied',
    restarted: closedForPatch && !opts.noRestart,
    status: getHostAsarStatus(opts),
  };
}

/**
 * 无损剥离 app.asar 中的极薄主进程引导钩子（完整保留汉化、表情包与既有 .bak）。
 * @param {object} [opts]
 */
export function restoreHostAsarPatch(opts = {}) {
  const { resourcesDir, asarPath } = resolveAntigravityResources(opts);
  const cliRestoreCmd = buildCliCommandHint('restore');
  if (!resourcesDir || !rawFs.existsSync(asarPath)) {
    throw new Error('未检测到 Antigravity 客户端 app.asar 目录');
  }
  const allowKillRunning = Boolean(opts.allowKillRunning);
  const checkHostRunning = !opts.resourcesDir && !opts.skipProcessCheck;
  const hostRunning = checkHostRunning && isAntigravityProcessRunning();
  if (!allowKillRunning && hostRunning) {
    return {
      ok: false,
      locked: true,
      needsExternalRestart: true,
      cliRestoreCmd,
      message: 'Antigravity 正在运行中并占用 app.asar；请关闭客户端后在独立终端运行无损移除命令',
      status: getHostAsarStatus(opts),
    };
  }

  let closedForPatch = false;
  if (allowKillRunning && hostRunning) {
    if (!opts.forceSelf && isRunningInsideAntigravityTree()) {
      return {
        ok: false,
        locked: true,
        needsExternalRestart: true,
        cliRestoreCmd,
        message: '请在关闭 Antigravity 后于系统独立终端运行移除命令',
        status: getHostAsarStatus(opts),
      };
    }
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/F', '/IM', 'Antigravity.exe'], { stdio: 'ignore', timeout: 8000 });
      closedForPatch = true;
    }
  }

  const mainBuf = AsarArchive.readFile(asarPath, 'dist/main.js');
  if (!mainBuf) {
    throw new Error('app.asar 中未找到 dist/main.js');
  }
  const rawMain = mainBuf.toString('utf8');
  const nextMain = stripAsarMarkedBlock(rawMain, HOST_ASAR_MARK_START, HOST_ASAR_MARK_END);
  if (nextMain === rawMain) {
    return {
      ok: true,
      action: 'noop',
      status: getHostAsarStatus(opts),
    };
  }
  new vm.Script(nextMain);

  const writeRes = commitPatchedAsar(asarPath, asarPath, { 'dist/main.js': nextMain }, allowKillRunning);
  if (!writeRes.written) {
    return {
      ok: false,
      locked: true,
      needsExternalRestart: true,
      cliRestoreCmd,
      message: 'app.asar 当前被系统锁定，请关闭 Antigravity 后在独立终端执行移除命令',
      status: getHostAsarStatus(opts),
    };
  }

  if (closedForPatch && !opts.noRestart && process.platform === 'win32') {
    const exePath = path.join(path.dirname(resourcesDir), 'Antigravity.exe');
    if (rawFs.existsSync(exePath)) {
      spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
    }
  }

  return {
    ok: true,
    action: 'restored',
    restarted: closedForPatch && !opts.noRestart,
    status: getHostAsarStatus(opts),
  };
}
