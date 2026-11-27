#!/usr/bin/env node
/**
 * Gemineko Hive · 基米窝 Sidecar 启动入口（sidecars/hive_board/main.mjs）。
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHiveSidecarServer } from '../../src/sidecar/server.mjs';

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const srv = await createHiveSidecarServer();
  console.log(`[gemineko-hive/hive_board] listening on ${srv.origin} (pid=${process.pid})`);
  const shutdown = () => {
    srv.close().finally(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
