import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const PIZZA_3D_DIR = path.join(ROOT, 'public/images/pizzas-3d');
const ARTIFACT_DIR = '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';

fs.mkdirSync(PIZZA_3D_DIR, { recursive: true });

const WIDTH = 1280;
const HEIGHT = 800;

function keyoutBlackRgba(inputPath) {
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

  // Flood-fill background black starting from all 4 borders
  const visited = new Uint8Array(WIDTH * HEIGHT);
  const isBg = new Uint8Array(WIDTH * HEIGHT);
  const q = new Int32Array(WIDTH * HEIGHT);
  let head = 0;
  let tail = 0;

  const isBlackBg = (idx) => {
    const o = idx * 4;
    const a = rgba[o + 3];
    if (a < 20) return true;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    const maxC = Math.max(r, g, b);
    // Background is pure digital black #000000 from the generator
    return maxC <= 9;
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

  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    if (isBg[i]) rgba[i * 4 + 3] = 0;
  }

  // Soft anti-aliasing
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      const idx = y * WIDTH + x;
      if (isBg[idx]) continue;
      if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - WIDTH] || isBg[idx + WIDTH]) {
        const o = idx * 4;
        const maxC = Math.max(rgba[o], rgba[o + 1], rgba[o + 2]);
        if (maxC <= 32) {
          rgba[o + 3] = Math.max(0, Math.min(255, Math.round(((maxC - 6) / 26) * 255)));
        }
      }
    }
  }

  return rgba;
}

function saveRgbaToWebp(rgba, outputPath, quality = 88) {
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

// 1. Process the 4 direct 3D pizzeta renders from the image-generator
const rawMap = {
  margarita: path.join(ARTIFACT_DIR, 'pizzeta_margarita_1795100421185.jpg'),
  pepperoni: path.join(ARTIFACT_DIR, 'pizzeta_pepperoni_1795100430473.jpg'),
  'prosciutto-funghi': path.join(ARTIFACT_DIR, 'pizzeta_prosciutto_funghi_1795100439992.jpg'),
  prosciutto: path.join(ARTIFACT_DIR, 'pizzeta_prosciutto_1795100449106.jpg'),
};

const processed = {};
for (const [slug, src] of Object.entries(rawMap)) {
  const rgba = keyoutBlackRgba(src);
  processed[slug] = rgba;
  const outPath = path.join(PIZZA_3D_DIR, `pizzeta-${slug}-v2.webp`);
  saveRgbaToWebp(rgba, outPath);
  console.log(`[OK] Saved pizzeta-${slug}-v2.webp`);
}

// 2. Synthesize pizzeta-barbacoa and pizzeta-mexicana using the 3D puffy crust base + client real toppings
function loadToppingRgba(filePath, w, h, vf = '') {
  const vfArg = vf ? `${vf},scale=${w}:${h}:flags=lanczos` : `scale=${w}:${h}:flags=lanczos`;
  const buf = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', filePath, '-vf', vfArg, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
    { maxBuffer: w * h * 4 + 2 * 1024 * 1024 }
  );
  return new Uint8Array(buf.buffer, buf.byteOffset, w * h * 4);
}

// Center well of the 3D pizzeta in 1280x800:
// Ellipse center: (640, 420), rx = 240, ry = 150
function createToppedPizzeta(baseRgba, toppingCrop, slug) {
  const out = new Uint8Array(baseRgba);
  const CX = 620;
  const CY = 425;
  const RX = 270;
  const RY = 185;

  const TOP_W = 550;
  const TOP_H = 370;
  const topBuf = loadToppingRgba(toppingCrop.file, TOP_W, TOP_H, toppingCrop.vf);

  // First pass: replace any green basil leaf pixels with warm mozzarella/sauce color
  for (let y = 300; y < 500; y++) {
    for (let x = 450; x < 780; x++) {
      const idx = (y * WIDTH + x) * 4;
      if (out[idx + 3] === 0) continue;
      const r = out[idx];
      const g = out[idx + 1];
      const b = out[idx + 2];
      // Basil is distinctively green: g > r + 8 or (g > 100 && r < 120 && b < 80)
      if (g > r + 6 || (g > 90 && r < 130 && b < 80)) {
        out[idx] = 195;
        out[idx + 1] = 65;
        out[idx + 2] = 30;
      }
    }
  }

  for (let y = CY - RY; y <= CY + RY; y++) {
    for (let x = CX - RX; x <= CX + RX; x++) {
      const dx = (x - CX) / RX;
      const dy = (y - CY) / RY;
      const distSq = dx * dx + dy * dy;
      if (distSq > 1.0) continue;

      // Soft feathering at edge of the well (0.75 .. 1.0)
      const blend = distSq <= 0.70 ? 1.0 : Math.max(0, 1.0 - (distSq - 0.70) / 0.30);

      const tx = Math.min(TOP_W - 1, Math.max(0, Math.round(((dx + 1.0) / 2.0) * TOP_W)));
      const ty = Math.min(TOP_H - 1, Math.max(0, Math.round(((dy + 1.0) / 2.0) * TOP_H)));
      const tIdx = (ty * TOP_W + tx) * 4;
      const bIdx = (y * WIDTH + x) * 4;

      if (out[bIdx + 3] === 0) continue;

      // Preserve base 3D lighting factor
      const baseLum = (0.299 * out[bIdx] + 0.587 * out[bIdx + 1] + 0.114 * out[bIdx + 2]) / 128;
      const lightFactor = Math.min(1.25, Math.max(0.65, baseLum * 0.8 + 0.25));

      const tr = Math.min(255, Math.round(topBuf[tIdx] * lightFactor));
      const tg = Math.min(255, Math.round(topBuf[tIdx + 1] * lightFactor));
      const tb = Math.min(255, Math.round(topBuf[tIdx + 2] * lightFactor));

      out[bIdx] = Math.round(tr * blend + out[bIdx] * (1 - blend));
      out[bIdx + 1] = Math.round(tg * blend + out[bIdx + 1] * (1 - blend));
      out[bIdx + 2] = Math.round(tb * blend + out[bIdx + 2] * (1 - blend));
    }
  }

  const outPath = path.join(PIZZA_3D_DIR, `pizzeta-${slug}-v2.webp`);
  saveRgbaToWebp(out, outPath);
  console.log(`[OK] Saved composite pizzeta-${slug}-v2.webp`);
}

// Pizzeta Barbacoa from real client topping photo IMG_6104.PNG
createToppedPizzeta(
  processed['margarita'],
  { file: path.join(ROOT, 'assets/IMG_6104.PNG'), vf: 'crop=620:440:275:990' },
  'barbacoa'
);

// Pizzeta Mexicana from real client topping photo IMG_6101.PNG
createToppedPizzeta(
  processed['margarita'],
  { file: path.join(ROOT, 'assets/IMG_6101.PNG'), vf: 'crop=620:440:275:1000' },
  'mexicana'
);
