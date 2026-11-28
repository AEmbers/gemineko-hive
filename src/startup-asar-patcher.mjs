/**
 * @file Gemineko Hive v0.9.0 可选 0ms 原生 app.asar 无损强化补丁引擎。
 * 核心安全与共存准则：
 * 1. 仅使用独立标记块 (__GEMINEKO_STARTUP_0MS_START__ / __GEMINEKO_STARTUP_0MS_END__) 注入 dist/preload.js；
 * 2. 始终从当前 app.asar 增量读取并写回，绝对保留第三方补丁（如 chinese-toolkit、agy-meme、gemini-neko-hud）；
 * 3. 若已有 app.asar.bak 则绝不覆写；写入前通过 vm.Script 严格语法校验；
 * 4. 仅针对系统默认安装路径探测宿主运行锁；对显式指定 resourcesDir 的离线/沙箱目录绝不触发 taskkill。
 */

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

export const STARTUP_ASAR_MARK_START = "'__GEMINEKO_STARTUP_0MS_START__';";
export const STARTUP_ASAR_MARK_END = "'__GEMINEKO_STARTUP_0MS_END__';";
export const STARTUP_ASAR_VERSION = '0.9.0';

/**
 * 剥离文本中成对出现的标记块及其紧邻前导空白。
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
    const fd = fs.openSync(asarPath, 'r');
    try {
      const sizeBuf = Buffer.alloc(8);
      fs.readSync(fd, sizeBuf, 0, 8, 0);
      const headerSize = sizeBuf.readUInt32LE(4);
      const headerBuf = Buffer.alloc(headerSize);
      fs.readSync(fd, headerBuf, 0, headerSize, 8);
      const jsonLen = headerBuf.readUInt32LE(4);
      const jsonStr = headerBuf.subarray(8, 8 + jsonLen).toString('utf8');
      const header = JSON.parse(jsonStr);
      const baseOffset = 8 + headerSize;
      return { header, baseOffset, headerSize, jsonLen };
    } finally {
      fs.closeSync(fd);
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
      return fs.existsSync(unpackedPath) ? fs.readFileSync(unpackedPath) : null;
    }
    if (cur.offset === undefined || cur.size === undefined) return null;
    const fd = fs.openSync(sourceAsar, 'r');
    try {
      const buf = Buffer.alloc(cur.size);
      fs.readSync(fd, buf, 0, cur.size, baseOffset + parseInt(cur.offset, 10));
      return buf;
    } finally {
      fs.closeSync(fd);
    }
  }

  static patchArchive(sourceAsar, targetAsar, filePatches) {
    const { header, baseOffset } = this.readHeader(sourceAsar);
    const srcFd = fs.openSync(sourceAsar, 'r');
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
      destFd = fs.openSync(targetAsar, 'w');
      fs.writeSync(destFd, newHeaderBuf, 0, newHeaderBuf.length, 0);

      let writePos = newHeaderBuf.length;
      const copyChunk = 256 * 1024;
      const copyBuf = Buffer.alloc(copyChunk);
      for (const item of packed) {
        if (item.patchBuffer) {
          fs.writeSync(destFd, item.patchBuffer, 0, item.patchBuffer.length, writePos);
          writePos += item.patchBuffer.length;
        } else {
          let remaining = item.oldSize;
          let readPos = baseOffset + item.oldOffset;
          while (remaining > 0) {
            const toRead = Math.min(remaining, copyChunk);
            fs.readSync(srcFd, copyBuf, 0, toRead, readPos);
            fs.writeSync(destFd, copyBuf, 0, toRead, writePos);
            readPos += toRead;
            writePos += toRead;
            remaining -= toRead;
          }
        }
      }
    } finally {
      if (destFd !== null) try { fs.closeSync(destFd); } catch {}
      try { fs.closeSync(srcFd); } catch {}
    }
  }
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
    if (fs.existsSync(path.join(dir, 'app.asar'))) {
      resourcesDir = dir;
      break;
    }
  }
  const asarPath = resourcesDir ? path.join(resourcesDir, 'app.asar') : '';
  const bakPath = resourcesDir ? path.join(resourcesDir, 'app.asar.bak') : '';
  return { resourcesDir, asarPath, bakPath };
}

function buildZeroMsSplashBlock() {
  const fn = function __geminekoSetup0msSplash() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const proto = String(window.location?.protocol || '').toLowerCase();
    if (proto === 'plugin:' || proto === 'devtools:') return;

    let enabled = true;
    let focusMode = false;
    let motionOff = false;
    let startupEnabled = true;
    let preset = 'auto';

    try {
      const fsMod = typeof require === 'function' ? require('fs') : null;
      const pathMod = typeof require === 'function' ? require('path') : null;
      const osMod = typeof require === 'function' ? require('os') : null;
      if (fsMod && pathMod && osMod) {
        const cfgFile = pathMod.join(osMod.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive', 'theme-config.json');
        if (fsMod.existsSync(cfgFile)) {
          const parsed = JSON.parse(fsMod.readFileSync(cfgFile, 'utf8'));
          if (parsed && typeof parsed === 'object') {
            if (parsed.enabled === false) enabled = false;
            if (parsed.focusMode === true) focusMode = true;
            if (parsed.motionLevel === 'off') motionOff = true;
            if (parsed.startup && parsed.startup.enabled === false) startupEnabled = false;
            if (typeof parsed.preset === 'string') preset = parsed.preset;
          }
        }
      }
    } catch {}

    if (!enabled || focusMode || motionOff || !startupEnabled) return;

    const SPLASH_ID = 'gemineko-0ms-splash';
    const STYLE_ID = 'gemineko-0ms-splash-style';
    const SESSION_KEY = '__gemineko_startup_played_v1__';
    try {
      if (window.sessionStorage && window.sessionStorage.getItem(SESSION_KEY) === '1') return;
    } catch {}
    if (document.getElementById(SPLASH_ID)) return;

    const prefersDark = Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const isDark = preset === 'starry-nest' || preset === 'carbon-obsidian' || (preset === 'auto' && prefersDark);
    const mountedAt = Date.now();
    let handedOff = false;

    const mountNow = () => {
      if (handedOff || document.getElementById(SPLASH_ID)) return;
      const parent = document.body || document.documentElement;
      if (!parent) return;

      if (!document.getElementById(STYLE_ID) && (document.head || document.documentElement)) {
        const st = document.createElement('style');
        st.id = STYLE_ID;
        st.textContent = [
          `#${SPLASH_ID}{position:fixed;inset:0;z-index:2147482900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;pointer-events:auto;cursor:pointer;user-select:none;opacity:1;transition:opacity 240ms ease;`,
          isDark
            ? 'background:radial-gradient(64% 60% at 50% 44%,#181D36 0%,#0B0E1C 62%,#060812 100%);color:#F8FAFC;}'
            : 'background:radial-gradient(62% 58% at 50% 44%,#FFFFFF 0%,#F4F7FF 62%,#EBF1FF 100%);color:#1E293B;}',
          `#${SPLASH_ID} .gk0-star{width:116px;height:116px;animation:gk0Pulse 1.4s ease-in-out infinite;filter:drop-shadow(0 12px 30px rgba(99,102,241,0.36));}`,
          `#${SPLASH_ID} .gk0-txt{font:700 13px/1.4 "Segoe UI",system-ui,sans-serif;letter-spacing:0.14em;opacity:0.82;}`,
          '@keyframes gk0Pulse{0%,100%{transform:scale(0.94) rotate(0deg);opacity:0.9;}50%{transform:scale(1.06) rotate(4deg);opacity:1;}}',
        ].join('');
        (document.head || document.documentElement).appendChild(st);
      }

      const el = document.createElement('div');
      el.id = SPLASH_ID;
      el.innerHTML = [
        '<svg class="gk0-star" viewBox="0 0 120 120" fill="none">',
        '  <defs><linearGradient id="gk0g" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">',
        '    <stop offset="0%" stop-color="#3B82F6"/><stop offset="50%" stop-color="#EC4899"/><stop offset="100%" stop-color="#22D3EE"/>',
        '  </linearGradient></defs>',
        '  <path d="M60 8C64 38 82 56 112 60C82 64 64 82 60 112C56 82 38 64 8 60C38 56 56 38 60 8Z" fill="url(#gk0g)" fill-opacity="0.22" stroke="url(#gk0g)" stroke-width="2.5"/>',
        '  <path d="M60 28C62.5 46 74 57.5 92 60C74 62.5 62.5 74 60 92C57.5 74 46 62.5 28 60C46 57.5 57.5 46 60 28Z" fill="url(#gk0g)"/>',
        '</svg>',
        '<div class="gk0-txt">ANTIGRAVITY × GEMINEKO HIVE</div>',
      ].join('');
      const closeSplash = () => {
        if (handedOff) return;
        handedOff = true;
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        setTimeout(() => {
          try { el.remove(); } catch {}
          try { document.getElementById(STYLE_ID)?.remove(); } catch {}
        }, 250);
      };
      el.addEventListener('pointerdown', closeSplash);
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSplash();
      }, { once: true });
      parent.appendChild(el);
      setTimeout(closeSplash, 4800);
    };

    window.__GEMINEKO_0MS_SPLASH__ = {
      mountedAt,
      handoff() {
        handedOff = true;
        const el = document.getElementById(SPLASH_ID);
        if (el) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          setTimeout(() => {
            try { el.remove(); } catch {}
            try { document.getElementById(STYLE_ID)?.remove(); } catch {}
          }, 220);
        }
        return { hadSplash: true, elapsedMs: Math.max(0, Date.now() - mountedAt) };
      },
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountNow, { once: true });
    } else {
      mountNow();
    }
  };

  return [
    '',
    STARTUP_ASAR_MARK_START,
    '(() => {',
    '  try {',
    `    (${fn.toString()})();`,
    '  } catch (e) {}',
    '})();',
    STARTUP_ASAR_MARK_END,
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
  return `node "${cliScript}" startup-asar ${action}`;
}

/**
 * 只读检查原生 app.asar 当前 0ms 启动强化补丁状态与第三方补丁共存信息。
 * @param {object} [opts]
 */
export function getStartupAsarStatus(opts = {}) {
  const { resourcesDir, asarPath, bakPath } = resolveAntigravityResources(opts);
  const cliApplyCmd = buildCliCommandHint('apply');
  const cliRestoreCmd = buildCliCommandHint('restore');
  if (!resourcesDir || !fs.existsSync(asarPath)) {
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
    const preloadBuf = AsarArchive.readFile(asarPath, 'dist/preload.js');
    const preloadText = preloadBuf ? preloadBuf.toString('utf8') : '';
    patched = preloadText.includes(STARTUP_ASAR_MARK_START) && preloadText.includes(STARTUP_ASAR_MARK_END);
    const asarBuf = fs.readFileSync(asarPath);
    hasLocalization = asarBuf.includes('__ANTIGRAVITY_CHINESE_LOCALIZATION_START__');
    hasMemeRenderer = asarBuf.includes('__ANTIGRAVITY_MEME_RENDERER_START__');
  } catch {}
  return {
    ok: true,
    found: true,
    resourcesDir,
    asarPath,
    bakExists: fs.existsSync(bakPath),
    patched,
    version: patched ? STARTUP_ASAR_VERSION : '',
    hasLocalization,
    hasMemeRenderer,
    lockedByRunningApp: !opts.resourcesDir && !opts.skipProcessCheck ? isAntigravityProcessRunning() : false,
    cliApplyCmd,
    cliRestoreCmd,
  };
}

function commitPatchedAsar(sourceAsar, targetAsar, filePatches, allowKillRunning) {
  const tmpAsar = `${targetAsar}.gk0ms.tmp.${process.pid}`;
  try {
    AsarArchive.patchArchive(sourceAsar, tmpAsar, filePatches);
    try {
      if (fs.existsSync(targetAsar)) fs.unlinkSync(targetAsar);
      fs.renameSync(tmpAsar, targetAsar);
      return { written: true };
    } catch (err) {
      if (err?.code === 'EBUSY' || err?.code === 'EPERM' || !allowKillRunning) {
        try { if (fs.existsSync(tmpAsar)) fs.unlinkSync(tmpAsar); } catch {}
        return { written: false, locked: true, error: err?.message || String(err) };
      }
      fs.copyFileSync(tmpAsar, targetAsar);
      try { fs.unlinkSync(tmpAsar); } catch {}
      return { written: true };
    }
  } finally {
    try { if (fs.existsSync(tmpAsar)) fs.unlinkSync(tmpAsar); } catch {}
  }
}

/**
 * 增量写入或升级 app.asar 0ms 启动强化补丁（绝不覆盖汉化/表情包补丁与既有 .bak）。
 * @param {object} [opts]
 */
export function applyStartupAsarPatch(opts = {}) {
  const { resourcesDir, asarPath, bakPath } = resolveAntigravityResources(opts);
  const cliApplyCmd = buildCliCommandHint('apply');
  if (!resourcesDir || !fs.existsSync(asarPath)) {
    throw new Error('未检测到 Antigravity 客户端 app.asar 目录，仅可使用 CDP 默认启动动画');
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
      message: 'Antigravity 正在运行中并占用 app.asar；请关闭客户端后在独立终端运行一键补丁命令',
      status: getStartupAsarStatus(opts),
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
        status: getStartupAsarStatus(opts),
      };
    }
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/F', '/IM', 'Antigravity.exe'], { stdio: 'ignore', timeout: 8000 });
      closedForPatch = true;
    }
  }

  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(asarPath, bakPath);
  }

  const preloadBuf = AsarArchive.readFile(asarPath, 'dist/preload.js');
  if (!preloadBuf) {
    throw new Error('app.asar 中未找到 dist/preload.js，已安全中止');
  }
  const rawPreload = preloadBuf.toString('utf8');
  const cleaned = stripAsarMarkedBlock(rawPreload, STARTUP_ASAR_MARK_START, STARTUP_ASAR_MARK_END).trimEnd();
  const nextPreload = `${cleaned}\n${buildZeroMsSplashBlock()}`;
  new vm.Script(nextPreload);

  const writeRes = commitPatchedAsar(asarPath, asarPath, { 'dist/preload.js': nextPreload }, allowKillRunning);
  if (!writeRes.written) {
    return {
      ok: false,
      locked: true,
      needsExternalRestart: true,
      cliApplyCmd,
      message: 'app.asar 当前被系统锁定，请关闭 Antigravity 后在独立终端执行一键补丁命令',
      status: getStartupAsarStatus(opts),
    };
  }

  if (closedForPatch && !opts.noRestart && process.platform === 'win32') {
    const exePath = path.join(path.dirname(resourcesDir), 'Antigravity.exe');
    if (fs.existsSync(exePath)) {
      spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
    }
  }

  return {
    ok: true,
    action: 'applied',
    restarted: closedForPatch && !opts.noRestart,
    status: getStartupAsarStatus(opts),
  };
}

/**
 * 无损剥离 app.asar 中的 0ms 启动强化补丁（完整保留汉化与 agy-meme）。
 * @param {object} [opts]
 */
export function restoreStartupAsarPatch(opts = {}) {
  const { resourcesDir, asarPath } = resolveAntigravityResources(opts);
  const cliRestoreCmd = buildCliCommandHint('restore');
  if (!resourcesDir || !fs.existsSync(asarPath)) {
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
      status: getStartupAsarStatus(opts),
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
        status: getStartupAsarStatus(opts),
      };
    }
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/F', '/IM', 'Antigravity.exe'], { stdio: 'ignore', timeout: 8000 });
      closedForPatch = true;
    }
  }

  const preloadBuf = AsarArchive.readFile(asarPath, 'dist/preload.js');
  if (!preloadBuf) {
    throw new Error('app.asar 中未找到 dist/preload.js');
  }
  const rawPreload = preloadBuf.toString('utf8');
  const nextPreload = stripAsarMarkedBlock(rawPreload, STARTUP_ASAR_MARK_START, STARTUP_ASAR_MARK_END);
  if (nextPreload === rawPreload) {
    return {
      ok: true,
      action: 'noop',
      status: getStartupAsarStatus(opts),
    };
  }
  new vm.Script(nextPreload);

  const writeRes = commitPatchedAsar(asarPath, asarPath, { 'dist/preload.js': nextPreload }, allowKillRunning);
  if (!writeRes.written) {
    return {
      ok: false,
      locked: true,
      needsExternalRestart: true,
      cliRestoreCmd,
      message: 'app.asar 当前被系统锁定，请关闭 Antigravity 后在独立终端执行移除命令',
      status: getStartupAsarStatus(opts),
    };
  }

  if (closedForPatch && !opts.noRestart && process.platform === 'win32') {
    const exePath = path.join(path.dirname(resourcesDir), 'Antigravity.exe');
    if (fs.existsSync(exePath)) {
      spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
    }
  }

  return {
    ok: true,
    action: 'restored',
    restarted: closedForPatch && !opts.noRestart,
    status: getStartupAsarStatus(opts),
  };
}
