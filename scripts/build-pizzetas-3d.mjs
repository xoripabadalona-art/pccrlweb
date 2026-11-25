import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const PIZZA_3D_DIR = path.join(ROOT, 'public/images/pizzas-3d');
const ARTIFACT_DIR = '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';

fs.mkdirSync(PIZZA_3D_DIR, { recursive: true });

const WIDTH = 1280;
const HEIGHT = 800;

function keyoutBlackToWebp(inputPath, outputPath, quality = 88) {
  // 1. Get raw RGBA
  const buf = execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      inputPath,
      '-vf',
      `scale=${WIDTH}:${HEIGHT}:flags=lanczos:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black@0`,
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-',
    ],
    { maxBuffer: WIDTH * HEIGHT * 4 + 2 * 1024 * 1024 }
  );
  const rgba = new Uint8Array(buf.buffer, buf.byteOffset, WIDTH * HEIGHT * 4);

  // 2. Flood-fill background black starting from all 4 borders
  const visited = new Uint8Array(WIDTH * HEIGHT);
  const isBg = new Uint8Array(WIDTH * HEIGHT);
  const q = new Int32Array(WIDTH * HEIGHT);
  let head = 0;
  let tail = 0;

  const isBlackBg = (idx) => {
    const o = idx * 4;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    const a = rgba[o + 3];
    if (a < 20) return true;
    const maxC = Math.max(r, g, b);
    return maxC <= 28;
  };

  const seed = (idx) => {
    if (!visited[idx] && isBlackBg(idx)) {
      visited[idx] = 1;
      isBg[idx] = 1;
      q[tail++] = idx;
    }
  };

  for (let x = 0; x < WIDTH; x++) {
    seed(x);
    seed((HEIGHT - 1) * WIDTH + x);
  }
  for (let y = 1; y < HEIGHT - 1; y++) {
    seed(y * WIDTH);
    seed(y * WIDTH + (WIDTH - 1));
  }

  while (head < tail) {
    const curr = q[head++];
    const cx = curr % WIDTH;
    const cy = (curr - cx) / WIDTH;
    if (cx > 0) seed(curr - 1);
    if (cx < WIDTH - 1) seed(curr + 1);
    if (cy > 0) seed(curr - WIDTH);
    if (cy < HEIGHT - 1) seed(curr + WIDTH);
  }

  // Set background to transparent
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    if (isBg[i]) rgba[i * 4 + 3] = 0;
  }

  // Soft anti-aliasing on transition edge
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      const idx = y * WIDTH + x;
      if (isBg[idx]) continue;
      if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - WIDTH] || isBg[idx + WIDTH]) {
        const o = idx * 4;
        const maxC = Math.max(rgba[o], rgba[o + 1], rgba[o + 2]);
        if (maxC <= 50) {
          rgba[o + 3] = Math.max(0, Math.min(255, Math.round(((maxC - 20) / 30) * 255)));
        }
      }
    }
  }

  // Save to WebP
  const tmpRaw = `${outputPath}.raw`;
  const tmpPng = `${outputPath}.png`;
  fs.writeFileSync(tmpRaw, rgba);
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${WIDTH}x${HEIGHT}`,
    '-i',
    tmpRaw,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);
  execFileSync('cwebp', ['-q', String(quality), '-alpha_q', '94', tmpPng, '-o', outputPath]);
  fs.unlinkSync(tmpRaw);
  fs.unlinkSync(tmpPng);
}

export function processPizzetaAssets(map) {
  for (const [slug, srcFilename] of Object.entries(map)) {
    const srcPath = path.isAbsolute(srcFilename)
      ? srcFilename
      : path.join(ARTIFACT_DIR, srcFilename);
    const destPath = path.join(PIZZA_3D_DIR, `pizzeta-${slug}-v2.webp`);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[MISS] Source ${srcPath} not found!`);
      continue;
    }
    keyoutBlackToWebp(srcPath, destPath);
    console.log(`[OK] Generated 3D Pizzeta: pizzeta-${slug}-v2.webp`);
  }
}
