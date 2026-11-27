#!/usr/bin/env node
/**
 * 动态 Q 版精灵构建脚本（32-bit RGBA 透明无限循环 APNG，默认 512x512）
 * 支持两种输入源：
 *  1. 多帧动画文件（.gif / 多帧 .png）
 *  2. 2x2 网格动作精灵表（.png / .jpg / .webp）
 *
 * 用法：
 *   node scripts/build-animated-sprites.mjs --input raw.png --output assets/sprites/hydrogen-thinking.png [--mode auto|gif|2x2] [--duration 210]
 *   node scripts/build-animated-sprites.mjs --raw-dir <dir> [--out-dir assets/sprites] [--sync-aliases]
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, 'assets', 'sprites');

const ALIAS_MAP = {
  'neko-queen.png': 'neon-thinking.png',
  'gemini-working.png': 'hydrogen-editing.png',
  'gemini-sleep.png': 'hydrogen-idle.png',
  'claude-working.png': 'claude-thinking.png',
  'gpt-working.png': 'gpt-thinking.png',
};

const PY_BUILD_APNG = String.raw`
import os, sys, json, math, struct
from collections import deque
from PIL import Image, ImageSequence

cfg = json.loads(sys.argv[1])
input_path = cfg["input"]
output_path = cfg["output"]
mode = cfg.get("mode", "auto")
default_duration = int(cfg.get("duration", 210))
target_size = int(cfg.get("size", 512))
margin_trim_ratio = float(cfg.get("trim", 0.025))

def is_white_bg(r, g, b, a):
    if a <= 12:
        return True
    mx = max(r, g, b)
    mn = min(r, g, b)
    return r >= 224 and g >= 224 and b >= 224 and (mx - mn) <= 32

def cutout_rgba_frame(im):
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False]*w for _ in range(h)]
    bg_mask = [[False]*w for _ in range(h)]
    q = deque()

    def try_push(x, y):
        if 0 <= x < w and 0 <= y < h and not visited[y][x]:
            visited[y][x] = True
            r, g, b, a = px[x, y]
            if is_white_bg(r, g, b, a):
                bg_mask[y][x] = True
                q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)):
            try_push(nx, ny)

    for y in range(h):
        for x in range(w):
            if bg_mask[y][x]:
                px[x, y] = (0, 0, 0, 0)

    # 1px 柔和去白边抗锯齿羽化
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
                if lum >= 206 and sat <= 42:
                    soften = max(0.0, min(1.0, (245.0 - lum) / 48.0)) * (1.0 - min(0.55, nbg * 0.08))
                    new_a = int(round(a * soften))
                    if new_a < 18:
                        px[x, y] = (0, 0, 0, 0)
                    else:
                        px[x, y] = (max(0, int(r*0.9)), max(0, int(g*0.9)), max(0, int(b*0.9)), new_a)

    # 清理极小孤立白灰边缘噪点（alpha > 24 计算紧致主体包围盒）
    alpha_band = im.getchannel("A").point(lambda a: 255 if a > 24 else 0)
    bbox = alpha_band.getbbox()
    if not bbox:
        bbox = im.getbbox()
    if not bbox:
        return im, (0, 0, w, h)
    return im.crop(bbox), bbox

src = Image.open(input_path)
n_frames = getattr(src, "n_frames", 1)
raw_frames = []
durations = []

if mode == "gif" or (mode == "auto" and n_frames > 1):
    for frame in ImageSequence.Iterator(src):
        dur = frame.info.get("duration", default_duration)
        if not dur or dur < 60:
            dur = default_duration
        durations.append(int(max(80, min(380, dur))))
        raw_frames.append(frame.convert("RGBA"))
else:
    # 2x2 精灵图切分：左上 -> 右上 -> 左下 -> 右下
    base = src.convert("RGBA")
    bw, bh = base.size
    half_w, half_h = bw // 2, bh // 2
    mx = int(half_w * margin_trim_ratio)
    my = int(half_h * margin_trim_ratio)
    cells = [
        (mx, my, half_w - mx, half_h - my),
        (half_w + mx, my, bw - mx, half_h - my),
        (mx, half_h + my, half_w - mx, bh - my),
        (half_w + mx, half_h + my, bw - mx, bh - my),
    ]
    for box in cells:
        raw_frames.append(base.crop(box))
        durations.append(default_duration)

if len(raw_frames) < 2:
    raise RuntimeError(f"输入仅解析出 {len(raw_frames)} 帧，无法生成动态 APNG: {input_path}")

cropped_frames = []
for rf in raw_frames:
    cf, _ = cutout_rgba_frame(rf)
    cropped_frames.append(cf)

max_cw = max(f.width for f in cropped_frames)
max_ch = max(f.height for f in cropped_frames)
pad = max(4, int(round(target_size * 0.025)))
usable_w = target_size - pad * 2   # 左右安全边距
usable_h = target_size - pad * 2   # 上下安全边距
scale = min(usable_w / float(max_cw), usable_h / float(max_ch))

out_frames = []
opaque_ratios = []
corners_ok = True

for cf in cropped_frames:
    nw = max(1, int(round(cf.width * scale)))
    nh = max(1, int(round(cf.height * scale)))
    resized = cf.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    px_x = (target_size - nw) // 2
    px_y = target_size - pad - nh   # 贴底对齐，避免高低跳跃
    canvas.paste(resized, (px_x, px_y), resized)
    cpx = canvas.load()
    corners = [cpx[0,0][3], cpx[target_size-1,0][3], cpx[0,target_size-1][3], cpx[target_size-1,target_size-1][3]]
    if any(c != 0 for c in corners):
        corners_ok = False
    opaque = sum(1 for y in range(target_size) for x in range(target_size) if cpx[x, y][3] > 20)
    opaque_ratios.append(round(opaque / float(target_size * target_size), 4))
    out_frames.append(canvas)

os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
out_frames[0].save(
    output_path,
    format="PNG",
    save_all=True,
    append_images=out_frames[1:],
    duration=durations,
    loop=0,
    disposal=2,
    compress_level=9,
)

# 回读验证 acTL chunk 与尺寸
with open(output_path, "rb") as fp:
    raw_bytes = fp.read()
has_actl = b"acTL" in raw_bytes
actl_frames = None
if has_actl:
    idx = raw_bytes.index(b"acTL")
    actl_frames = struct.unpack(">II", raw_bytes[idx+4:idx+12])[0]

print(json.dumps({
    "input": input_path,
    "output": output_path,
    "frameCount": len(out_frames),
    "actlFrames": actl_frames,
    "hasAcTL": has_actl,
    "durations": durations,
    "cornersAllTransparent": corners_ok,
    "opaqueRatios": opaque_ratios,
    "byteSize": len(raw_bytes),
}, ensure_ascii=False))
`;

export function buildSingleAnimatedSprite({ input, output, mode = 'auto', duration = 210, trim = 0.025, size = 512 }) {
  const payload = JSON.stringify({ input, output, mode, duration, trim, size: Number(size) || 512 });
  const res = spawnSync('python', ['-c', PY_BUILD_APNG, payload], {
    encoding: 'utf8',
    timeout: 60_000,
  });
  if (res.status !== 0) {
    throw new Error(`APNG 构建失败 (${path.basename(input)}): ${res.stderr || res.stdout}`);
  }
  const info = JSON.parse(res.stdout.trim());
  if (!info.hasAcTL || (info.actlFrames ?? 0) < 2) {
    throw new Error(`输出缺少有效 acTL 动画块: ${output}`);
  }
  if (!info.cornersAllTransparent) {
    throw new Error(`输出角落未保持全透明: ${output}`);
  }
  return info;
}

export function syncAliasSprites(outDir = DEFAULT_OUT_DIR) {
  const copied = [];
  for (const [alias, srcName] of Object.entries(ALIAS_MAP)) {
    const srcPath = path.join(outDir, srcName);
    const dstPath = path.join(outDir, alias);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, dstPath);
      copied.push(`${alias} <- ${srcName}`);
    }
  }
  return copied;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    if (!k.startsWith('--')) continue;
    const key = k.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args['out-dir'] || DEFAULT_OUT_DIR);
  const mode = args.mode || 'auto';
  const duration = Number(args.duration || 210);
  const trim = args.trim !== undefined ? Number(args.trim) : 0.025;
  const size = Number(args.size || 512);

  if (args.input && args.output) {
    const info = buildSingleAnimatedSprite({
      input: path.resolve(args.input),
      output: path.resolve(args.output),
      mode,
      duration,
      trim,
      size,
    });
    console.log(JSON.stringify(info, null, 2));
  } else if (args['raw-dir']) {
    const rawDir = path.resolve(args['raw-dir']);
    const files = fs.readdirSync(rawDir).filter((f) => /\.(gif|png|jpg|jpeg|webp)$/i.test(f)).sort();
    // 同名同时存在 .gif 和 .png 时优先取 .gif
    const chosen = new Map();
    for (const f of files) {
      const stem = f.replace(/\.[^.]+$/, '');
      const ext = path.extname(f).toLowerCase();
      if (!chosen.has(stem) || ext === '.gif') {
        chosen.set(stem, f);
      }
    }
    const results = [];
    for (const [stem, fname] of chosen.entries()) {
      const inPath = path.join(rawDir, fname);
      const outPath = path.join(outDir, `${stem}.png`);
      const info = buildSingleAnimatedSprite({ input: inPath, output: outPath, mode, duration, trim, size });
      results.push(info);
      console.log(`[build-apng] ${stem}.png <- ${fname} (${info.actlFrames} frames, ${Math.round(info.byteSize / 1024)} KB)`);
    }
    if (args['sync-aliases']) {
      const aliases = syncAliasSprites(outDir);
      console.log(`[build-apng] Synced aliases: ${aliases.join(', ')}`);
    }
  } else if (args['sync-aliases']) {
    const aliases = syncAliasSprites(outDir);
    console.log(`[build-apng] Synced aliases: ${aliases.join(', ')}`);
  } else {
    console.error('Usage: build-animated-sprites.mjs --input <file> --output <file> | --raw-dir <dir> [--sync-aliases]');
    process.exit(1);
  }
}
