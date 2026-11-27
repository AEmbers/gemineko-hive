/**
 * @file Gemineko Hive · 基米窝 全局品牌元信息、分层版权声明与 GitHub 生态单点数据源
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const META_DIR = dirname(fileURLToPath(import.meta.url));
const PKG_PATH = resolve(META_DIR, '..', '..', 'package.json');

function readPackageVersion() {
  try {
    const raw = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
    const ver = String(raw?.version || '').trim();
    return ver || '0.7.0';
  } catch {
    return '0.7.0';
  }
}

export const BRAND_VERSION = readPackageVersion();

export const BRAND_META = Object.freeze({
  engineName: 'Gemineko Hive',
  engineCnName: '基米窝',
  version: BRAND_VERSION,
  author: Object.freeze({
    name: 'AEmbers',
    url: 'https://github.com/AEmbers',
  }),
  repoSlug: 'AEmbers/gemineko-hive',
  repoUrl: 'https://github.com/AEmbers/gemineko-hive',
  releasesUrl: 'https://github.com/AEmbers/gemineko-hive/releases',
  registryRawUrl: 'https://raw.githubusercontent.com/AEmbers/gemineko-hive/main/themes/registry.json',
  submitThemeUrl: 'https://github.com/AEmbers/gemineko-hive/issues/new?template=theme-submission.yml&labels=theme-submission',
  authoringDocUrl: 'https://github.com/AEmbers/gemineko-hive/blob/main/docs/THEME_AUTHORING.md',
  license: Object.freeze({
    code: 'MIT',
    artwork: 'CC BY-NC-SA 4.0',
  }),
  copyrightLine: 'Powered by Gemineko Hive · by AEmbers (Code: MIT · Artwork: CC BY-NC-SA 4.0)',
});
