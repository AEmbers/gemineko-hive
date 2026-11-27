/**
 * Gemineko Hive 32×32 高精复古像素精灵绘制器（纯 Canvas，无需外链图）。
 * 支持角色：neko-queen / gemini / claude / gpt 以及「全员彩色哈基米」色相映射。
 */

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function hashStr(s) {
  let h = 7;
  for (const ch of String(s || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

const HACHIMI_HUES = [245, 290, 200, 325, 34, 165, 270, 15, 218, 138];

/**
 * 为指定角色名和色相计算像素调色板。
 */
export function resolvePixelPalette(kind, memberName, roleMode) {
  if (roleMode === 'all-hachimi' || kind === 'gemini' || kind === 'queen') {
    const baseHue =
      roleMode === 'all-hachimi' && memberName !== 'coordinator'
        ? HACHIMI_HUES[hashStr(memberName) % HACHIMI_HUES.length]
        : 245;
    return {
      outline: '#2D2148',
      hair: hslToHex(baseHue, 74, 72),
      hairDark: hslToHex(baseHue + 10, 62, 54),
      hairTip: hslToHex(baseHue + 42, 76, 76),
      earInner: '#F9A8D4',
      skin: '#FFF0EA',
      blush: '#FDA4AF',
      eyeLeft: '#C084FC',
      eyeRight: '#F59E0B',
      collar: '#1E1B4B',
      accent: '#FBBF24',
      isDragon: false,
      isQueen: kind === 'queen',
      hasStarPin: true,
      hasSunflower: false,
    };
  }
  if (kind === 'claude') {
    return {
      outline: '#4A2511',
      hair: '#FB923C',
      hairDark: '#EA580C',
      hairTip: '#FDBA74',
      earInner: '#FEF3C7',
      skin: '#FFF2EB',
      blush: '#FCA5A5',
      eyeLeft: '#B45309',
      eyeRight: '#B45309',
      collar: '#78350F',
      accent: '#FACC15',
      isDragon: false,
      isQueen: false,
      hasStarPin: false,
      hasSunflower: true,
    };
  }
  // GPT 小龙娘
  return {
    outline: '#164E63',
    hair: '#E2E8F0',
    hairDark: '#94A3B8',
    hairTip: '#6EE7B7',
    earInner: '#10B981',
    skin: '#FFF1EC',
    blush: '#FDA4AF',
    eyeLeft: '#10B981',
    eyeRight: '#10B981',
    collar: '#0F172A',
    accent: '#34D399',
    isDragon: true,
    isQueen: false,
    hasStarPin: false,
    hasSunflower: false,
  };
}

/**
 * 在 32×32 Canvas 上绘制像素风 AI 娘精灵。
 * @param {HTMLCanvasElement} canvas
 * @param {{ kind: string, memberName: string, roleMode: string, state: string, frame: number }} opts
 */
export function drawPixelSprite(canvas, opts) {
  const W = 32;
  const H = 32;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);

  const pal = resolvePixelPalette(opts.kind, opts.memberName, opts.roleMode);
  const frame = opts.frame ? 1 : 0;
  const asleep = opts.state === 'parked' || opts.state === 'sleep' || opts.state === 'done';
  const yOff = frame === 1 && !asleep ? -1 : 0;

  const px = (x, y, col) => {
    const yy = y + yOff;
    if (x < 0 || x >= W || yy < 0 || yy >= H) return;
    ctx.fillStyle = col;
    ctx.fillRect(x, yy, 1, 1);
  };
  const rect = (x0, y0, w, h, col) => {
    for (let y = y0; y < y0 + h; y += 1) {
      for (let x = x0; x < x0 + w; x += 1) px(x, y, col);
    }
  };

  // 后发垂坠与轮廓
  rect(6, 12, 20, 14, pal.outline);
  rect(7, 13, 18, 12, pal.hairDark);
  rect(7, 22, 4, 5, pal.hairTip);
  rect(21, 22, 4, 5, pal.hairTip);

  // 猫耳 或 翡翠龙角
  if (pal.isDragon) {
    // 左/右龙角
    for (let dy = 0; dy < 5; dy += 1) {
      px(8 - Math.floor(dy / 2), 8 - dy, pal.outline);
      px(9 - Math.floor(dy / 2), 8 - dy, dy < 3 ? '#10B981' : '#6EE7B7');
      px(23 + Math.floor(dy / 2), 8 - dy, pal.outline);
      px(22 + Math.floor(dy / 2), 8 - dy, dy < 3 ? '#10B981' : '#6EE7B7');
    }
  } else if (!pal.hasSunflower) {
    // 蓝紫猫耳（工作时 frame 1 抖动耳朵）
    const earDrop = asleep ? 1 : 0;
    const earBob = frame === 1 && !asleep ? -1 : 0;
    rect(6, 5 + earDrop + earBob, 5, 5, pal.outline);
    rect(7, 6 + earDrop + earBob, 3, 4, pal.hair);
    rect(8, 7 + earDrop + earBob, 2, 2, pal.earInner);

    rect(21, 5 + earDrop, 5, 5, pal.outline);
    rect(22, 6 + earDrop, 3, 4, pal.hair);
    rect(22, 7 + earDrop, 2, 2, pal.earInner);
  }

  // 头部与头发
  rect(8, 8, 16, 14, pal.outline);
  rect(9, 9, 14, 12, pal.hair);
  // 呆毛
  px(15, 7, pal.hair);
  px(16, 6, pal.hair);
  px(17, 6, pal.hairDark);

  // 领队皇冠
  if (pal.isQueen) {
    rect(12, 5, 8, 3, '#D97706');
    rect(13, 4, 2, 3, '#FDE047');
    rect(15, 3, 2, 4, '#FEF08A');
    rect(17, 4, 2, 3, '#FDE047');
    px(15, 6, '#A855F7');
    px(16, 6, '#F472B6');
  }

  // 脸颊与肤色区域
  rect(10, 14, 12, 8, pal.skin);
  // 刘海遮盖
  rect(9, 10, 14, 4, pal.hair);
  px(11, 14, pal.hair);
  px(15, 14, pal.hair);
  px(16, 14, pal.hair);
  px(20, 14, pal.hair);

  // 标志发饰：右侧四角星 或 Claude 向日葵
  if (pal.hasStarPin) {
    px(22, 11, '#FBBF24');
    px(21, 12, '#A78BFA');
    px(22, 12, '#60A5FA');
    px(23, 12, '#F472B6');
    px(22, 13, '#FBBF24');
  } else if (pal.hasSunflower) {
    rect(20, 7, 4, 4, '#FACC15');
    rect(21, 8, 2, 2, '#78350F');
  }

  // 眼睛与表情
  if (asleep) {
    rect(11, 17, 3, 1, pal.outline);
    rect(18, 17, 3, 1, pal.outline);
  } else {
    // 左眼
    rect(11, 16, 3, 3, pal.outline);
    rect(11, 17, 2, 2, pal.eyeLeft);
    px(11, 16, '#FFFFFF');
    // 右眼
    rect(18, 16, 3, 3, pal.outline);
    rect(18, 17, 2, 2, pal.eyeRight);
    px(18, 16, '#FFFFFF');
  }

  // 腮红与小嘴
  rect(10, 19, 2, 1, pal.blush);
  rect(20, 19, 2, 1, pal.blush);
  if (asleep) {
    rect(15, 20, 2, 1, '#BE185D');
  } else {
    rect(15, 20, 2, 2, '#FB7185');
  }

  // 领口与服饰
  rect(11, 23, 10, 6, pal.outline);
  rect(12, 24, 8, 5, pal.collar);
  rect(15, 24, 2, 2, pal.accent);

  // 挥动的小爪子（工作态 frame 1 抬起）
  px(9, 26 - frame, pal.skin);
  px(10, 26 - frame, pal.skin);
  px(21, 26 - frame, pal.skin);
  px(22, 26 - frame, pal.skin);
}

const pixelImgCache = new Map();

/**
 * 生成（带缓存）像素精灵 PNG Data URI，用于静态头像与 GIF 导出。
 */
export function getPixelSpriteDataUri(opts) {
  const key = `${opts.kind}|${opts.memberName}|${opts.roleMode}|${opts.state}|${opts.frame || 0}`;
  if (pixelImgCache.has(key)) return pixelImgCache.get(key);
  const cv = document.createElement('canvas');
  drawPixelSprite(cv, opts);
  const uri = cv.toDataURL('image/png');
  pixelImgCache.set(key, uri);
  return uri;
}
