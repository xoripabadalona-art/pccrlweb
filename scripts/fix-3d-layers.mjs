import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ARTIFACT_DIR =
  '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';
const ROOT = '/Volumes/Imac HD/la piccerella website';
const IMG_DIR = path.join(ROOT, 'public/images');

/**
 * Loads an image via ffmpeg into a raw RGBA buffer of (width x height),
 * runs a true BFS flood-fill from all 4 borders so ONLY exterior connected dark background
 * becomes transparent (preserving 100% of interior dark char spots!), applies a 2px feather
 * at the outer boundary, and encodes to WebP with cwebp.
 */
function floodFillRemoveBlackBg({
  inputPath,
  outputPath,
  width,
  height,
  threshold = 26,
  transformPixel = null,
}) {
  const rawBuffer = execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      inputPath,
      '-vf',
      `scale=${width}:${height}:flags=lanczos`,
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-',
    ],
    { maxBuffer: width * height * 4 + 1024 * 1024 }
  );

  const rgba = new Uint8Array(rawBuffer.buffer, rawBuffer.byteOffset, width * height * 4);
  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const isDark = (idx) => {
    const o = idx * 4;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    return Math.max(r, g, b) <= threshold;
  };

  // Seed queue with all border pixels
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const botIdx = (height - 1) * width + x;
    if (isDark(topIdx)) {
      visited[topIdx] = 1;
      queue[tail++] = topIdx;
    }
    if (isDark(botIdx)) {
      visited[botIdx] = 1;
      queue[tail++] = botIdx;
    }
  }
  for (let y = 1; y < height - 1; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isDark(leftIdx)) {
      visited[leftIdx] = 1;
      queue[tail++] = leftIdx;
    }
    if (isDark(rightIdx)) {
      visited[rightIdx] = 1;
      queue[tail++] = rightIdx;
    }
  }

  // BFS flood fill connected exterior background
  while (head < tail) {
    const curr = queue[head++];
    isBg[curr] = 1;
    const cx = curr % width;
    const cy = (curr - cx) / width;

    if (cx > 0) {
      const n = curr - 1;
      if (!visited[n] && isDark(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cx < width - 1) {
      const n = curr + 1;
      if (!visited[n] && isDark(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy > 0) {
      const n = curr - width;
      if (!visited[n] && isDark(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy < height - 1) {
      const n = curr + width;
      if (!visited[n] && isDark(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  // Apply alpha = 0 to exterior background and soft feather on boundary pixels
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    if (transformPixel) {
      const [nr, ng, nb] = transformPixel(rgba[o], rgba[o + 1], rgba[o + 2]);
      rgba[o] = nr;
      rgba[o + 1] = ng;
      rgba[o + 2] = nb;
    }

    if (isBg[i]) {
      rgba[o + 3] = 0;
    } else {
      // Check if adjacent to background for soft anti-aliased edge
      const cx = i % width;
      const cy = (i - cx) / width;
      let bgNeighbors = 0;
      if (cx > 0 && isBg[i - 1]) bgNeighbors++;
      if (cx < width - 1 && isBg[i + 1]) bgNeighbors++;
      if (cy > 0 && isBg[i - width]) bgNeighbors++;
      if (cy < height - 1 && isBg[i + width]) bgNeighbors++;

      if (bgNeighbors > 0) {
        const lum = Math.max(rgba[o], rgba[o + 1], rgba[o + 2]);
        rgba[o + 3] = Math.min(255, Math.max(60, Math.round((lum - threshold) * 7)));
      } else {
        rgba[o + 3] = 255;
      }
    }
  }

  const tmpRaw = `/tmp/${path.basename(outputPath)}.raw`;
  const tmpPng = `/tmp/${path.basename(outputPath)}.png`;
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
    `${width}x${height}`,
    '-i',
    tmpRaw,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);

  execFileSync('cwebp', ['-q', '84', '-alpha_q', '92', tmpPng, '-o', outputPath]);
  fs.unlinkSync(tmpRaw);
}

// 1. Flood-fill clean pizza-hero.webp (1200x1200)
floodFillRemoveBlackBg({
  inputPath: path.join(ARTIFACT_DIR, 'pizza_hero_1795082551365.jpg'),
  outputPath: path.join(IMG_DIR, 'pizza-hero.webp'),
  width: 1200,
  height: 1200,
  threshold: 26,
});

// 2. Flood-fill clean layer-crust.webp (1280x800) - 0 interior char holes!
floodFillRemoveBlackBg({
  inputPath: path.join(ARTIFACT_DIR, 'layer_crust_1795082560564.jpg'),
  outputPath: path.join(IMG_DIR, 'layer-crust.webp'),
  width: 1280,
  height: 800,
  threshold: 24,
});

// 3. Flood-fill clean layer-sauce.webp (Red tomato sauce, 1280x800)
floodFillRemoveBlackBg({
  inputPath: path.join(ARTIFACT_DIR, 'layer_sauce_1795082583275.jpg'),
  outputPath: path.join(IMG_DIR, 'layer-sauce.webp'),
  width: 1280,
  height: 800,
  threshold: 24,
});

// 4. Create layer-sauce-white.webp (Creamy white base for Carbonara, Barbacoa, Pollo!)
floodFillRemoveBlackBg({
  inputPath: path.join(ARTIFACT_DIR, 'layer_sauce_1795082583275.jpg'),
  outputPath: path.join(IMG_DIR, 'layer-sauce-white.webp'),
  width: 1280,
  height: 800,
  threshold: 24,
  transformPixel: (r, g, b) => {
    // Transform glossy red sauce luminance into warm creamy white Bechamel / crema de leche
    const lum = 0.55 * r + 0.3 * g + 0.15 * b;
    const nr = Math.min(255, Math.round(135 + lum * 0.62));
    const ng = Math.min(255, Math.round(125 + lum * 0.58));
    const nb = Math.min(255, Math.round(105 + lum * 0.5));
    return [nr, ng, nb];
  },
});

// 5. Flood-fill clean layer-cheese.webp (1280x800) - 0 interior char holes!
floodFillRemoveBlackBg({
  inputPath: path.join(ARTIFACT_DIR, 'layer_cheese_v2_1795082639225.jpg'),
  outputPath: path.join(IMG_DIR, 'layer-cheese.webp'),
  width: 1280,
  height: 800,
  threshold: 24,
});

console.log('Flood-fill 3D layers generated with zero interior holes!');
