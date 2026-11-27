#!/usr/bin/env node
/**
 * 批量精灵透明抠图脚本（32-bit RGBA PNG）
 * 1. 先以“近白/低饱和泛洪”处理纯白底精灵；
 * 2. 若图片外边缘本身是彩色渐变底（例如 v0.1 旧图），则基于顶角参考背景色做外围泛洪去背景；
 * 3. 对相邻过渡边缘像素做柔和抗锯齿羽化，并保留角色轮廓内部的眼白/白衣/高光。
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SPRITES_DIR = path.join(REPO_ROOT, 'assets', 'sprites');

const PY_CUTOUT = `
import os, sys, json, math
from collections import deque
from PIL import Image

sprites_dir = sys.argv[1]

def is_white_bg(r, g, b, a):
    if a <= 10:
        return True
    mx = max(r, g, b)
    mn = min(r, g, b)
    return r >= 224 and g >= 224 and b >= 224 and (mx - mn) <= 30

def color_dist(c1, c2):
    return math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2)

def process_image(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    # 判定是否已做过透明抠图或是否需要按顶角参考色处理彩色渐变底
    top_samples = [px[0, 0], px[w-1, 0], px[w//2, 0]]
    all_opaque = all(s[3] > 200 for s in top_samples)
    white_corners = sum(1 for s in (px[0,0], px[w-1,0], px[0,h-1], px[w-1,h-1]) if is_white_bg(*s))

    visited = [[False]*w for _ in range(h)]
    bg_mask = [[False]*w for _ in range(h)]
    q = deque()

    if all_opaque and white_corners < 2:
        # v0.1 渐变背景图：使用上缘两角+上中点参考色，结合局部邻域颜色平滑梯度泛洪
        refs = [px[2, 2][:3], px[w-3, 2][:3], px[0, 0][:3], px[w-1, 0][:3]]
        ref_avg = (
            sum(r[0] for r in refs)/len(refs),
            sum(r[1] for r in refs)/len(refs),
            sum(r[2] for r in refs)/len(refs),
        )
        def is_grad_bg(x, y):
            r, g, b, a = px[x, y]
            if a <= 10:
                return True
            if min(color_dist((r,g,b), ref) for ref in refs) <= 72:
                return True
            if color_dist((r,g,b), ref_avg) <= 76 and (r+g+b)/3.0 >= 145:
                return True
            return False

        def try_push_g(x, y):
            if 0 <= x < w and 0 <= y < h and not visited[y][x]:
                visited[y][x] = True
                if is_grad_bg(x, y):
                    bg_mask[y][x] = True
                    q.append((x, y))

        for x in range(w):
            try_push_g(x, 0)
            try_push_g(x, h - 1)
        for y in range(h):
            try_push_g(0, y)
            try_push_g(w - 1, y)
        while q:
            cx, cy = q.popleft()
            cr, cg, cb, _ = px[cx, cy]
            for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                    nr, ng, nb, na = px[nx, ny]
                    # 必须颜色接近全局淡色背景且与当前像素梯度连续，防止穿透深色轮廓线
                    if is_grad_bg(nx, ny) and color_dist((nr,ng,nb),(cr,cg,cb)) <= 36:
                        visited[ny][nx] = True
                        bg_mask[ny][nx] = True
                        q.append((nx, ny))
    else:
        def try_push_w(x, y):
            if 0 <= x < w and 0 <= y < h and not visited[y][x]:
                visited[y][x] = True
                r, g, b, a = px[x, y]
                if is_white_bg(r, g, b, a):
                    bg_mask[y][x] = True
                    q.append((x, y))

        for x in range(w):
            try_push_w(x, 0)
            try_push_w(x, h - 1)
        for y in range(h):
            try_push_w(0, y)
            try_push_w(w - 1, y)
        while q:
            cx, cy = q.popleft()
            for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                try_push_w(nx, ny)

    for y in range(h):
        for x in range(w):
            if bg_mask[y][x]:
                px[x, y] = (0, 0, 0, 0)

    # 1px 抗锯齿羽化（仅限与透明区域相邻且未完成羽化的泛白边缘）
    for y in range(h):
        for x in range(w):
            if bg_mask[y][x]:
                continue
            r, g, b, a = px[x, y]
            if a == 0 or a < 245:
                continue
            nbg = 0
            for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1),(x+1,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1)):
                if nx < 0 or nx >= w or ny < 0 or ny >= h or bg_mask[ny][nx]:
                    nbg += 1
            if nbg > 0:
                lum = (r + g + b) / 3.0
                sat = max(r, g, b) - min(r, g, b)
                if lum >= 205 and sat <= 42:
                    soften = max(0.0, min(1.0, (245.0 - lum) / 48.0)) * (1.0 - min(0.55, nbg * 0.08))
                    new_a = int(round(a * soften))
                    if new_a < 18:
                        px[x, y] = (0, 0, 0, 0)
                    else:
                        px[x, y] = (max(0, int(r*0.9)), max(0, int(g*0.9)), max(0, int(b*0.9)), new_a)

    opaque = sum(1 for y in range(h) for x in range(w) if px[x, y][3] > 20)
    corners = [px[0,0][3], px[w-1,0][3], px[0,h-1][3], px[w-1,h-1][3]]
    im.save(path, "PNG")
    return {
        "file": os.path.basename(path),
        "size": [w, h],
        "cornersAlpha": corners,
        "opaqueRatio": round(opaque / float(w * h), 4),
    }

results = []
for name in sorted(os.listdir(sprites_dir)):
    if name.lower().endswith(".png"):
        results.append(process_image(os.path.join(sprites_dir, name)))
print(json.dumps(results, ensure_ascii=False))
`;

export function runCutoutSprites(spritesDir = SPRITES_DIR) {
  const res = spawnSync('python', ['-c', PY_CUTOUT, spritesDir], {
    encoding: 'utf8',
    timeout: 60_000,
  });
  if (res.status !== 0) {
    throw new Error(`精灵透明抠图失败: ${res.stderr || res.stdout}`);
  }
  const rows = JSON.parse(res.stdout.trim());
  for (const r of rows) {
    const transparentCorners = r.cornersAlpha.filter((a) => a === 0).length;
    if (transparentCorners < 2) {
      throw new Error(`透明背景角不足 (<2): ${r.file} (${r.cornersAlpha.join(',')})`);
    }
    if (r.opaqueRatio < 0.14 || r.opaqueRatio > 0.88) {
      throw new Error(`不透明像素占比异常 (${r.opaqueRatio}): ${r.file}`);
    }
  }
  return rows;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const rows = runCutoutSprites();
  console.log(`[cutout-sprites] Processed ${rows.length} PNG sprites cleanly.`);
  for (const r of rows) {
    console.log(`  - ${r.file}: ${r.size[0]}x${r.size[1]}, opaque=${(r.opaqueRatio * 100).toFixed(1)}%, corners=[${r.cornersAlpha.join(',')}]`);
  }
}
