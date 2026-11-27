/**
 * @file GitHub 仓库实时 Star 数、版本更新检测与缓存推送服务（零外部依赖）
 * 默认带 6 小时本地 JSON 缓存与 4 秒超时，离线/限流环境下无感回退不报错。
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BRAND_META } from '../meta/brand.mjs';

const DEFAULT_TTL_MS = 6 * 3600 * 1000;

/**
 * 比较两个语义化版本号，返回 1（a > b）、0（a == b）或 -1（a < b）。
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareSemver(a, b) {
  const parse = (v) => String(v || '0.0.0')
    .trim()
    .replace(/^v/i, '')
    .split('-')[0]
    .split('.')
    .map((n) => {
      const parsed = Number.parseInt(n, 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    });
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(3, pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export function resolveGithubCachePath(customPath) {
  if (customPath) return path.resolve(customPath);
  const envData = process.env.ANTIGRAVITY_EXECUTABLE_DATA_DIR;
  if (envData) {
    return path.join(path.resolve(envData), 'github-pulse-cache.json');
  }
  return path.join(os.homedir(), '.gemini', 'antigravity', 'sidecar_data', 'gemineko-hive', 'github-pulse-cache.json');
}

/**
 * 创建 GitHub Star 数与新版本检测服务。
 * @param {{ cachePath?: string, currentVersion?: string, fetchImpl?: Function, disableNetwork?: boolean, ttlMs?: number }} [options]
 */
export function createGithubPulseService(options = {}) {
  const cachePath = resolveGithubCachePath(options.cachePath);
  const currentVersion = String(options.currentVersion || BRAND_META.version).replace(/^v/i, '');
  const fetchFn = options.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  const disableNetwork = Boolean(options.disableNetwork);
  const ttlMs = Number(options.ttlMs) > 0 ? Number(options.ttlMs) : DEFAULT_TTL_MS;

  let memCache = null;

  function readDiskCache() {
    if (!existsSync(cachePath)) return null;
    try {
      const raw = JSON.parse(readFileSync(cachePath, 'utf8'));
      return raw && typeof raw === 'object' ? raw : null;
    } catch {
      return null;
    }
  }

  function writeDiskCache(data) {
    try {
      mkdirSync(path.dirname(cachePath), { recursive: true });
      const tmp = `${cachePath}.tmp-${process.pid}-${Date.now()}`;
      writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
      renameSync(tmp, cachePath);
    } catch {
      /* 忽略缓存写入异常 */
    }
  }

  function buildPayload(raw = {}, source = 'fallback') {
    const latestVersion = String(raw.latestVersion || currentVersion).replace(/^v/i, '') || currentVersion;
    const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;
    return {
      ok: true,
      repoSlug: BRAND_META.repoSlug,
      repoUrl: BRAND_META.repoUrl,
      starUrl: BRAND_META.repoUrl,
      releasesUrl: BRAND_META.releasesUrl,
      submitThemeUrl: BRAND_META.submitThemeUrl,
      author: BRAND_META.author,
      license: BRAND_META.license,
      copyrightLine: BRAND_META.copyrightLine,
      currentVersion,
      latestVersion,
      hasUpdate,
      releaseNotes: String(raw.releaseNotes || ''),
      releaseUrl: String(raw.releaseUrl || BRAND_META.releasesUrl),
      stars: Number.isFinite(Number(raw.stars)) ? Number(raw.stars) : null,
      forks: Number.isFinite(Number(raw.forks)) ? Number(raw.forks) : null,
      checkedAt: Number(raw.checkedAt) || 0,
      source,
      updateCommand: 'git pull && npm run build && .\\scripts\\install-local.ps1',
    };
  }

  async function fetchWithTimeout(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      return await fetchFn(url, {
        signal: ctrl.signal,
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': `gemineko-hive/${currentVersion}`,
        },
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async function getStatus({ forceRefresh = false } = {}) {
    const now = Date.now();
    const cached = memCache || readDiskCache();
    if (!forceRefresh && cached && Number(cached.checkedAt) > 0 && (now - Number(cached.checkedAt) < ttlMs)) {
      memCache = cached;
      return buildPayload(cached, 'cache');
    }

    if (disableNetwork || !fetchFn) {
      return buildPayload(cached || {}, cached ? 'offline-cache' : 'offline-fallback');
    }

    let stars = cached?.stars ?? null;
    let forks = cached?.forks ?? null;
    let latestVersion = cached?.latestVersion || currentVersion;
    let releaseNotes = cached?.releaseNotes || '';
    let releaseUrl = cached?.releaseUrl || BRAND_META.releasesUrl;
    let liveSuccess = false;

    const repoUrl = `https://api.github.com/repos/${BRAND_META.repoSlug}`;
    const releaseApiUrl = `https://api.github.com/repos/${BRAND_META.repoSlug}/releases/latest`;
    const pkgRawUrl = `https://raw.githubusercontent.com/${BRAND_META.repoSlug}/main/package.json`;

    const [repoRes, relRes] = await Promise.allSettled([
      fetchWithTimeout(repoUrl),
      fetchWithTimeout(releaseApiUrl),
    ]);

    if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
      try {
        const repoJson = await repoRes.value.json();
        if (Number.isFinite(Number(repoJson.stargazers_count))) {
          stars = Number(repoJson.stargazers_count);
          liveSuccess = true;
        }
        if (Number.isFinite(Number(repoJson.forks_count))) {
          forks = Number(repoJson.forks_count);
        }
      } catch {
        /* ignore */
      }
    }

    let gotLatest = false;
    if (relRes.status === 'fulfilled' && relRes.value.ok) {
      try {
        const relJson = await relRes.value.json();
        const tag = String(relJson.tag_name || '').trim().replace(/^v/i, '');
        if (tag) {
          latestVersion = tag;
          releaseNotes = String(relJson.body || '').replace(/\s+/g, ' ').trim().slice(0, 240);
          releaseUrl = String(relJson.html_url || BRAND_META.releasesUrl);
          gotLatest = true;
          liveSuccess = true;
        }
      } catch {
        /* ignore */
      }
    }

    if (!gotLatest) {
      try {
        const pkgRes = await fetchWithTimeout(pkgRawUrl);
        if (pkgRes.ok) {
          const pkgJson = await pkgRes.json();
          const pkgVer = String(pkgJson?.version || '').trim().replace(/^v/i, '');
          if (pkgVer) {
            latestVersion = pkgVer;
            releaseUrl = BRAND_META.repoUrl;
            liveSuccess = true;
          }
        }
      } catch {
        /* ignore */
      }
    }

    if (liveSuccess) {
      const nextCache = {
        stars,
        forks,
        latestVersion,
        releaseNotes,
        releaseUrl,
        checkedAt: now,
      };
      memCache = nextCache;
      writeDiskCache(nextCache);
      return buildPayload(nextCache, 'github-live');
    }

    return buildPayload(cached || {}, cached ? 'stale-cache' : 'network-fallback');
  }

  return {
    cachePath,
    getStatus,
  };
}
