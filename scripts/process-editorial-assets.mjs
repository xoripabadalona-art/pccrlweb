import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ARTIFACT_DIR = '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';
const ROOT = '/Volumes/Imac HD/la piccerella website';
const OUT_DIR = path.join(ROOT, 'public/images/menu');

fs.mkdirSync(OUT_DIR, { recursive: true });

const items = [
  {
    src: path.join(ARTIFACT_DIR, 'empanada_carne_1795098013451.jpg'),
    dest: path.join(OUT_DIR, 'empanada-carne.png'),
    whiteThreshold: 160,
    maxDiff: 18,
  },
  {
    src: path.join(ARTIFACT_DIR, 'empanada_jamon_queso_1795098024368.jpg'),
    dest: path.join(OUT_DIR, 'empanada-jamon-queso.png'),
    whiteThreshold: 160,
    maxDiff: 18,
  },
  {
    src: path.join(ARTIFACT_DIR, 'empanada_pollo_1795098068921.jpg'),
    dest: path.join(OUT_DIR, 'empanada-pollo.png'),
    whiteThreshold: 160,
    maxDiff: 18,
  },
  {
    src: path.join(ARTIFACT_DIR, 'empanada_cuatro_quesos_1795098046880.jpg'),
    dest: path.join(OUT_DIR, 'empanada-cuatro-quesos.png'),
    whiteThreshold: 160,
    maxDiff: 18,
  },
  {
    src: path.join(ARTIFACT_DIR, 'empanada_queso_cebolla_1795098078298.jpg'),
    dest: path.join(OUT_DIR, 'empanada-queso-cebolla.png'),
    whiteThreshold: 160,
    maxDiff: 18,
  },
  {
    src: path.join(ARTIFACT_DIR, 'cerveza_estrella_tirador_1795098087923.jpg'),
    dest: path.join(OUT_DIR, 'cerveza-estrella-tirador.png'),
    whiteThreshold: 215,
    maxDiff: 12,
  },
  {
    src: path.join(ARTIFACT_DIR, 'cerveza_1906_tirador_1795098097628.jpg'),
    dest: path.join(OUT_DIR, 'cerveza-1906-tirador.png'),
    whiteThreshold: 215,
    maxDiff: 12,
  },
  {
    src: path.join(ARTIFACT_DIR, 'cerveza_estrella_sin_alcohol_1795098108637.jpg'),
    dest: path.join(OUT_DIR, 'cerveza-estrella-sin-alcohol.png'),
    whiteThreshold: 200,
    maxDiff: 15,
  },
];

function whiteToTransparentPng(inputPath, outputPath, whiteThreshold = 215, maxDiff = 12) {
  const SIZE = 600;
  const dims = execFileSync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=p=0',
    inputPath,
  ])
    .toString()
    .trim()
    .split(',')
    .map(Number);

  const origW = dims[0];
  const origH = dims[1];
  const scale = Math.min(SIZE / origW, SIZE / origH);
  const w = Math.max(1, Math.round(origW * scale));
  const h = Math.max(1, Math.round(origH * scale));

  const buf = execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      inputPath,
      '-vf',
      `scale=${w}:${h}:flags=lanczos`,
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-',
    ],
    { maxBuffer: 10 * 1024 * 1024 }
  );
  const rgba = new Uint8Array(buf.buffer, buf.byteOffset, w * h * 4);

  // Flood-fill background from corners and outer borders
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);
  const q = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const isWhiteBg = (idx) => {
    const o = idx * 4;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const diff = maxC - minC;
    // For pure white studio background or neutral grey shadow on studio floor
    if (minC >= 240) return true;
    if (minC >= whiteThreshold && diff <= maxDiff) return true;
    // Studio contact shadow is neutral grey (very low saturation)
    if (minC >= 120 && diff <= 14) return true;
    return false;
  };

  const seed = (idx) => {
    if (!visited[idx] && isWhiteBg(idx)) {
      visited[idx] = 1;
      isBg[idx] = 1;
      q[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 1; y < h - 1; y++) {
    seed(y * w);
    seed(y * w + (w - 1));
  }

  while (head < tail) {
    const curr = q[head++];
    const cx = curr % w;
    const cy = (curr - cx) / w;
    if (cx > 0) seed(curr - 1);
    if (cx < w - 1) seed(curr + 1);
    if (cy > 0) seed(curr - w);
    if (cy < h - 1) seed(curr + w);
  }

  // Set background to 100% transparent
  for (let i = 0; i < w * h; i++) {
    if (isBg[i]) rgba[i * 4 + 3] = 0;
  }

  // Soft anti-aliasing on transition edge
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (isBg[idx]) continue;
      if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - w] || isBg[idx + w]) {
        const o = idx * 4;
        const minC = Math.min(rgba[o], rgba[o + 1], rgba[o + 2]);
        const diff = Math.max(rgba[o], rgba[o + 1], rgba[o + 2]) - minC;
        if (minC > whiteThreshold - 20 && diff <= maxDiff + 4) {
          rgba[o + 3] = Math.max(0, Math.min(255, Math.round(((255 - minC) / 35) * 255)));
        }
      }
    }
  }

  // Find bounding box of foreground
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cw = Math.max(1, maxX - minX + 1);
  const ch = Math.max(1, maxY - minY + 1);
  const canvas = new Uint8Array(SIZE * SIZE * 4);
  const padScale = Math.min((SIZE * 0.88) / cw, (SIZE * 0.88) / ch);
  const dw = Math.round(cw * padScale);
  const dh = Math.round(ch * padScale);
  const ox = Math.floor((SIZE - dw) / 2);
  const oy = Math.floor((SIZE - dh) / 2);

  for (let dy = 0; dy < dh; dy++) {
    const sy = Math.min(maxY, minY + Math.floor(dy / padScale));
    for (let dx = 0; dx < dw; dx++) {
      const sx = Math.min(maxX, minX + Math.floor(dx / padScale));
      const sOff = (sy * w + sx) * 4;
      const dOff = ((oy + dy) * SIZE + (ox + dx)) * 4;
      canvas[dOff] = rgba[sOff];
      canvas[dOff + 1] = rgba[sOff + 1];
      canvas[dOff + 2] = rgba[sOff + 2];
      canvas[dOff + 3] = rgba[sOff + 3];
    }
  }

  const tmpRaw = `${outputPath}.raw`;
  fs.writeFileSync(tmpRaw, canvas);
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${SIZE}x${SIZE}`,
    '-i',
    tmpRaw,
    '-frames:v',
    '1',
    '-update',
    '1',
    outputPath,
  ]);
  fs.unlinkSync(tmpRaw);
}

for (const item of items) {
  if (!fs.existsSync(item.src)) {
    console.error('Source does not exist:', item.src);
    continue;
  }
  whiteToTransparentPng(item.src, item.dest, item.whiteThreshold, item.maxDiff);
  console.log(`Processed: ${path.basename(item.dest)}`);
}
