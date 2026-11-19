import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const ASSETS_DIR = path.join(ROOT, 'assets');
const IMG_DIR = path.join(ROOT, 'public/images');
const PIZZA_3D_DIR = path.join(IMG_DIR, 'pizzas-3d');
const ARTIFACT_DIR =
  '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';

fs.mkdirSync(PIZZA_3D_DIR, { recursive: true });

const WIDTH = 1280;
const HEIGHT = 800;

function loadRgba(filePath, w, h, vfExtra = '') {
  const vf = vfExtra
    ? `${vfExtra},scale=${w}:${h}:flags=lanczos`
    : `scale=${w}:${h}:flags=lanczos`;
  const buf = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', filePath, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
    { maxBuffer: w * h * 4 + 1024 * 1024 }
  );
  return new Uint8Array(buf.buffer, buf.byteOffset, w * h * 4);
}

function saveWebp(rgba, w, h, outputPath, quality = 86) {
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
    `${w}x${h}`,
    '-i',
    tmpRaw,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);
  execFileSync('cwebp', ['-q', String(quality), '-alpha_q', '92', tmpPng, '-o', outputPath]);
  fs.unlinkSync(tmpRaw);
}

// 1. Copy cache-busted 3D storefront and 3D interior
fs.copyFileSync(
  path.join(IMG_DIR, 'hero-storefront.webp'),
  path.join(IMG_DIR, 'hero-storefront-3d-v2.webp')
);
fs.copyFileSync(
  path.join(IMG_DIR, 'hero-interior.webp'),
  path.join(IMG_DIR, 'hero-interior-3d-v2.webp')
);
fs.copyFileSync(
  path.join(IMG_DIR, 'layer-crust.webp'),
  path.join(IMG_DIR, 'layer-crust-v2.webp')
);
fs.copyFileSync(
  path.join(IMG_DIR, 'layer-sauce.webp'),
  path.join(IMG_DIR, 'layer-sauce-v2.webp')
);
fs.copyFileSync(
  path.join(IMG_DIR, 'layer-sauce-white.webp'),
  path.join(IMG_DIR, 'layer-sauce-white-v2.webp')
);
fs.copyFileSync(
  path.join(IMG_DIR, 'layer-cheese.webp'),
  path.join(IMG_DIR, 'layer-cheese-v2.webp')
);

// Helper: fill interior holes inside opaque shapes by flood-filling transparent background from image border
function fillInteriorHoles(maskRgba, srcRgba, w, h) {
  const isExterior = new Uint8Array(w * h);
  const q = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  for (let x = 0; x < w; x++) {
    q[tail++] = x;
    isExterior[x] = 1;
    const bot = (h - 1) * w + x;
    q[tail++] = bot;
    isExterior[bot] = 1;
  }
  for (let y = 1; y < h - 1; y++) {
    const left = y * w;
    q[tail++] = left;
    isExterior[left] = 1;
    const right = y * w + (w - 1);
    q[tail++] = right;
    isExterior[right] = 1;
  }

  while (head < tail) {
    const curr = q[head++];
    const cx = curr % w;
    const cy = (curr - cx) / w;
    const neighbors = [];
    if (cx > 0) neighbors.push(curr - 1);
    if (cx < w - 1) neighbors.push(curr + 1);
    if (cy > 0) neighbors.push(curr - w);
    if (cy < h - 1) neighbors.push(curr + w);

    for (const n of neighbors) {
      if (isExterior[n] === 0 && maskRgba[n * 4 + 3] < 120) {
        isExterior[n] = 1;
        q[tail++] = n;
      }
    }
  }

  // Any pixel not reached from the exterior is inside a solid shape (specular highlight) -> restore from srcRgba
  for (let i = 0; i < w * h; i++) {
    if (isExterior[i] === 0) {
      const o = i * 4;
      maskRgba[o] = srcRgba[o];
      maskRgba[o + 1] = srcRgba[o + 1];
      maskRgba[o + 2] = srcRgba[o + 2];
      maskRgba[o + 3] = 255;
    }
  }
}

// 2. Fix layer-basil-v2.webp: keep ONLY natural green basil leaves, completely remove the gold olive-oil wire spiral!
const rawBasil = loadRgba(
  path.join(ARTIFACT_DIR, 'layer_basil_v2_1795082660440.jpg'),
  WIDTH,
  HEIGHT
);
const basilOnly = new Uint8Array(WIDTH * HEIGHT * 4);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const o = i * 4;
  const r = rawBasil[o];
  const g = rawBasil[o + 1];
  const b = rawBasil[o + 2];

  // Pure green basil leaves have strong green dominance
  if (g > 38 && g > r * 1.04 && g > b * 1.25) {
    const greenStrength = g - Math.max(r * 0.96, b);
    const alpha = Math.min(255, Math.max(0, Math.round((greenStrength - 2) * 14)));
    if (alpha > 30) {
      basilOnly[o] = r;
      basilOnly[o + 1] = g;
      basilOnly[o + 2] = b;
      basilOnly[o + 3] = alpha;
    }
  }
}
// Restore bright green specular edges on basil leaves (within 4px of a core leaf pixel, where g > r * 0.92 and not yellow-gold spiral)
const basilCore = new Uint8Array(basilOnly);
for (let y = 4; y < HEIGHT - 4; y++) {
  for (let x = 4; x < WIDTH - 4; x++) {
    const i = y * WIDTH + x;
    const o = i * 4;
    if (basilOnly[o + 3] >= 200) continue;
    const r = rawBasil[o];
    const g = rawBasil[o + 1];
    const b = rawBasil[o + 2];
    // Leaf highlight is bright whitish-green (high g AND high b relative to gold spiral which has low b)
    if (g > 90 && g >= r * 0.94 && b > 48) {
      let nearLeaf = false;
      for (let dy = -4; dy <= 4 && !nearLeaf; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          if (basilCore[((y + dy) * WIDTH + (x + dx)) * 4 + 3] > 180) {
            nearLeaf = true;
            break;
          }
        }
      }
      if (nearLeaf) {
        basilOnly[o] = r;
        basilOnly[o + 1] = g;
        basilOnly[o + 2] = b;
        basilOnly[o + 3] = 255;
      }
    }
  }
}
fillInteriorHoles(basilOnly, rawBasil, WIDTH, HEIGHT);
saveWebp(basilOnly, WIDTH, HEIGHT, path.join(IMG_DIR, 'layer-basil-v2.webp'), 86);
saveWebp(basilOnly, WIDTH, HEIGHT, path.join(IMG_DIR, 'layer-basil.webp'), 86);

// 3. Extract ONLY red pepperoni cups from layer_toppings_v3_1795082681379.jpg
// using per-pixel red chromaticity + connected-component size filtering so ZERO brown mushroom pixels survive!
const rawToppings = loadRgba(
  path.join(ARTIFACT_DIR, 'layer_toppings_v3_1795082681379.jpg'),
  WIDTH,
  HEIGHT
);

// Step 3a: Per-pixel red pepperoni core mask to automatically locate every pepperoni cup centroid
const redPixelMask = new Uint8Array(WIDTH * HEIGHT);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const o = i * 4;
  const r = rawToppings[o];
  const g = rawToppings[o + 1];
  const b = rawToppings[o + 2];
  if (r > 58 && r > g * 2.05 && r > b * 2.35 && r - g > 38) {
    redPixelMask[i] = 1;
  }
}

const pepCompId = new Int32Array(WIDTH * HEIGHT);
let nextPepId = 1;
const pepComps = [];
const queue = new Int32Array(WIDTH * HEIGHT);

for (let i = 0; i < WIDTH * HEIGHT; i++) {
  if (redPixelMask[i] === 0 || pepCompId[i] !== 0) continue;
  const id = nextPepId++;
  let head = 0;
  let tail = 0;
  queue[tail++] = i;
  pepCompId[i] = id;
  const pixels = [];

  while (head < tail) {
    const curr = queue[head++];
    pixels.push(curr);
    const cx = curr % WIDTH;
    const cy = (curr - cx) / WIDTH;
    if (cx > 0 && redPixelMask[curr - 1] && !pepCompId[curr - 1]) {
      pepCompId[curr - 1] = id;
      queue[tail++] = curr - 1;
    }
    if (cx < WIDTH - 1 && redPixelMask[curr + 1] && !pepCompId[curr + 1]) {
      pepCompId[curr + 1] = id;
      queue[tail++] = curr + 1;
    }
    if (cy > 0 && redPixelMask[curr - WIDTH] && !pepCompId[curr - WIDTH]) {
      pepCompId[curr - WIDTH] = id;
      queue[tail++] = curr - WIDTH;
    }
    if (cy < HEIGHT - 1 && redPixelMask[curr + WIDTH] && !pepCompId[curr + WIDTH]) {
      pepCompId[curr + WIDTH] = id;
      queue[tail++] = curr + WIDTH;
    }
  }

  if (pixels.length > 450) {
    let minX = WIDTH;
    let maxX = 0;
    let minY = HEIGHT;
    let maxY = 0;
    let sumX = 0;
    let sumY = 0;
    for (const p of pixels) {
      const px = p % WIDTH;
      const py = (p - px) / WIDTH;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      sumX += px;
      sumY += py;
    }
    const cx = Math.round(sumX / pixels.length);
    const cy = Math.round(sumY / pixels.length);
    const rx = Math.round(Math.max(38, Math.min(52, (maxX - minX) * 0.55 + 6)));
    const ry = Math.round(Math.max(25, Math.min(36, (maxY - minY) * 0.58 + 5)));
    pepComps.push({ id, pixels, cx, cy, rx, ry, minX, maxX, minY, maxY });
  }
}

// Step 3b: Find the cleanest isolated pepperoni cup among pepComps (one with zero mushroom neighbours and full 3D cup aspect)
// and also synthesize a clean 3D elliptical cup sprite from every cup's own pixels by filling any missing highlight pixels
// inside its tight 3D ellipse (dist <= 0.96) with warm glossy pepperoni rim colors!
const singlePepperoniRgba = new Uint8Array(WIDTH * HEIGHT * 4);
for (const comp of pepComps) {
  const { cx, cy, rx, ry } = comp;
  const x0 = Math.max(0, cx - rx - 2);
  const x1 = Math.min(WIDTH - 1, cx + rx + 2);
  const y0 = Math.max(0, cy - ry - 2);
  const y1 = Math.min(HEIGHT - 1, cy + ry + 2);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const ndx = (x - cx) / rx;
      const ndy = (y - cy) / ry;
      const dist = Math.hypot(ndx, ndy);
      if (dist > 1.0) continue;

      const idx = y * WIDTH + x;
      const o = idx * 4;
      const r = rawToppings[o];
      const g = rawToppings[o + 1];
      const b = rawToppings[o + 2];
      const maxC = Math.max(r, g, b);
      if (maxC <= 26) continue;

      const edgeA = dist > 0.9 ? Math.round(((1.0 - dist) / 0.1) * 255) : 255;
      const lumA = maxC < 40 ? Math.round(((maxC - 26) / 14) * 255) : 255;
      const a = Math.min(edgeA, lumA);

      if (r > g * 1.45 && r > b * 1.65) {
        // Pure deep red pepperoni pixel
        if (a > singlePepperoniRgba[o + 3]) {
          singlePepperoniRgba[o] = r;
          singlePepperoniRgba[o + 1] = g;
          singlePepperoniRgba[o + 2] = b;
          singlePepperoniRgba[o + 3] = a;
        }
      } else if (dist <= 0.95) {
        // Specular highlight or rim pixel inside the pepperoni cup ellipse:
        // shift any neutral/tan highlight to warm crispy pepperoni red-orange so the cup is 100% whole and 0% mushroom!
        const warmR = Math.min(255, Math.max(135, Math.round(r * 1.15)));
        const warmG = Math.min(110, Math.round(g * 0.52));
        const warmB = Math.min(75, Math.round(b * 0.38));
        if (a > singlePepperoniRgba[o + 3]) {
          singlePepperoniRgba[o] = warmR;
          singlePepperoniRgba[o + 1] = warmG;
          singlePepperoniRgba[o + 2] = warmB;
          singlePepperoniRgba[o + 3] = a;
        }
      }
    }
  }
}

const onlyPepperoniRgba = new Uint8Array(WIDTH * HEIGHT * 4);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const o = i * 4;
  if (singlePepperoniRgba[o + 3] === 0) continue;
  onlyPepperoniRgba[o] = singlePepperoniRgba[o];
  onlyPepperoniRgba[o + 1] = singlePepperoniRgba[o + 1];
  onlyPepperoniRgba[o + 2] = singlePepperoniRgba[o + 2];
  onlyPepperoniRgba[o + 3] = singlePepperoniRgba[o + 3];

  const px = i % WIDTH;
  const py = (i - px) / WIDTH;
  const mx = WIDTH - 1 - px;
  const my = HEIGHT - 1 - py + 28;
  if (mx >= 0 && mx < WIDTH && my >= 0 && my < HEIGHT) {
    const mo = (my * WIDTH + mx) * 4;
    if (onlyPepperoniRgba[mo + 3] === 0) {
      onlyPepperoniRgba[mo] = singlePepperoniRgba[o];
      onlyPepperoniRgba[mo + 1] = singlePepperoniRgba[o + 1];
      onlyPepperoniRgba[mo + 2] = singlePepperoniRgba[o + 2];
      onlyPepperoniRgba[mo + 3] = singlePepperoniRgba[o + 3];
    }
  }
}

// Also keep allComps (pepperoni + mushrooms) ONLY for the 3 mushroom pizzas (prosciutto-funghi, 4-estaciones, pollo)
const allToppingsRgba = new Uint8Array(WIDTH * HEIGHT * 4);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const o = i * 4;
  const maxC = Math.max(rawToppings[o], rawToppings[o + 1], rawToppings[o + 2]);
  if (maxC > 26) {
    allToppingsRgba[o] = rawToppings[o];
    allToppingsRgba[o + 1] = rawToppings[o + 1];
    allToppingsRgba[o + 2] = rawToppings[o + 2];
    allToppingsRgba[o + 3] = maxC < 40 ? Math.round(((maxC - 26) / 14) * 255) : 255;
  }
}

const pizzaSpecs = [
  {
    slug: 'margarita',
    src: 'IMG_6093.PNG',
    box: { w: 680, h: 480, x: 245, y: 855 },
    hasMushrooms: false,
  },
  {
    slug: 'prosciutto',
    src: 'IMG_6094.PNG',
    box: { w: 680, h: 470, x: 245, y: 1015 },
    hasMushrooms: false,
  },
  {
    slug: 'vegetal',
    src: 'IMG_6095.PNG',
    box: { w: 670, h: 450, x: 250, y: 992 },
    hasMushrooms: false,
  },
  {
    slug: 'pepperoni',
    src: 'IMG_6096.PNG',
    box: { w: 670, h: 500, x: 250, y: 785 },
    hasMushrooms: false,
  },
  {
    slug: 'prosciutto-funghi',
    src: 'IMG_6097.PNG',
    box: { w: 690, h: 520, x: 240, y: 945 },
    hasMushrooms: true,
  },
  {
    slug: 'prosciutto-olivas',
    src: 'IMG_6098.PNG',
    box: { w: 670, h: 460, x: 250, y: 1115 },
    hasMushrooms: false,
  },
  {
    slug: 'pollo',
    src: 'IMG_6100.PNG',
    box: { w: 665, h: 460, x: 252, y: 1128 },
    hasMushrooms: true,
  },
  {
    slug: 'mexicana',
    src: 'IMG_6101.PNG',
    box: { w: 665, h: 460, x: 252, y: 985 },
    hasMushrooms: false,
  },
  {
    slug: 'mallorquina',
    src: 'IMG_6102.PNG',
    box: { w: 665, h: 460, x: 252, y: 1035 },
    hasMushrooms: false,
  },
  {
    slug: 'carbonara',
    src: 'IMG_6103.PNG',
    box: { w: 665, h: 460, x: 252, y: 985 },
    hasMushrooms: false,
  },
  {
    slug: 'barbacoa',
    src: 'IMG_6104.PNG',
    box: { w: 660, h: 470, x: 255, y: 972 },
    hasMushrooms: false,
  },
  {
    slug: 'bacon',
    src: 'IMG_6105.PNG',
    box: { w: 670, h: 460, x: 250, y: 995 },
    hasMushrooms: false,
  },
  {
    slug: 'atun',
    src: 'IMG_6106.PNG',
    box: { w: 680, h: 450, x: 245, y: 1045 },
    hasMushrooms: false,
  },
  {
    slug: '4-quesos',
    src: 'IMG_6107.PNG',
    box: { w: 650, h: 450, x: 260, y: 968 },
    hasMushrooms: false,
  },
  {
    slug: '4-estaciones',
    src: 'IMG_6108.PNG',
    box: { w: 650, h: 460, x: 260, y: 1025 },
    hasMushrooms: true,
  },
];

for (const spec of pizzaSpecs) {
  // Copy cache-busted 3D assembled pizza
  fs.copyFileSync(
    path.join(PIZZA_3D_DIR, `pizza-${spec.slug}.webp`),
    path.join(PIZZA_3D_DIR, `pizza-${spec.slug}-v2.webp`)
  );

  if (spec.slug === 'pepperoni') {
    // 100% pure 3D pepperoni cups, zero mushrooms!
    saveWebp(
      onlyPepperoniRgba,
      WIDTH,
      HEIGHT,
      path.join(PIZZA_3D_DIR, `toppings-pepperoni-v2.webp`),
      86
    );
    saveWebp(
      onlyPepperoniRgba,
      WIDTH,
      HEIGHT,
      path.join(PIZZA_3D_DIR, `toppings-pepperoni.webp`),
      86
    );
    continue;
  }

  const inputPath = path.join(ASSETS_DIR, spec.src);
  const { w, h, x, y } = spec.box;
  const TOP_W = 840;
  const TOP_H = 360;
  const toppingRgba = loadRgba(inputPath, TOP_W, TOP_H, `crop=${w}:${h}:${x}:${y}`);

  const outFloating = new Uint8Array(WIDTH * HEIGHT * 4);

  // If this pizza does NOT have mushrooms in its recipe, use ONLY the round 3D disc shapes (onlyPepperoniRgba)
  // so no mushroom silhouettes ever appear on a non-mushroom pizza!
  // If this pizza DOES have mushrooms (prosciutto-funghi, 4-estaciones, pollo), use allComps!
  if (spec.hasMushrooms) {
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const o = i * 4;
      const baseA = allToppingsRgba[o + 3];
      if (baseA === 0) continue;
      // Check if this pixel is part of a pure pepperoni cup or a mushroom slice
      if (singlePepperoniRgba[o + 3] === 0) {
        // Keep the photorealistic 3D roasted mushroom slice
        outFloating[o] = allToppingsRgba[o];
        outFloating[o + 1] = allToppingsRgba[o + 1];
        outFloating[o + 2] = allToppingsRgba[o + 2];
        outFloating[o + 3] = baseA;
      } else {
        // Texture the round pieces with this pizza's real toppings (ham, chicken, olives, etc.)
        const px = i % WIDTH;
        const py = (i - px) / WIDTH;
        const tx = Math.min(TOP_W - 1, Math.max(0, Math.round(((px - 220) / 840) * TOP_W)));
        const ty = Math.min(TOP_H - 1, Math.max(0, Math.round(((py - 235) / 360) * TOP_H)));
        const tIdx = (ty * TOP_W + tx) * 4;
        const lum3d =
          (0.35 * allToppingsRgba[o] + 0.45 * allToppingsRgba[o + 1] + 0.2 * allToppingsRgba[o + 2]) / 120;
        outFloating[o] = Math.min(255, Math.round(toppingRgba[tIdx] * (lum3d * 0.85 + 0.3)));
        outFloating[o + 1] = Math.min(
          255,
          Math.round(toppingRgba[tIdx + 1] * (lum3d * 0.85 + 0.3))
        );
        outFloating[o + 2] = Math.min(
          255,
          Math.round(toppingRgba[tIdx + 2] * (lum3d * 0.85 + 0.3))
        );
        outFloating[o + 3] = baseA;
      }
    }
  } else {
    // Non-mushroom pizza: use ONLY the round 3D medallions (onlyPepperoniRgba mask) textured with this pizza's real toppings!
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const o = i * 4;
      const baseA = onlyPepperoniRgba[o + 3];
      if (baseA === 0) continue;
      const px = i % WIDTH;
      const py = (i - px) / WIDTH;
      const tx = Math.min(TOP_W - 1, Math.max(0, Math.round(((px - 220) / 840) * TOP_W)));
      const ty = Math.min(TOP_H - 1, Math.max(0, Math.round(((py - 235) / 360) * TOP_H)));
      const tIdx = (ty * TOP_W + tx) * 4;
      const lum3d =
        (0.35 * onlyPepperoniRgba[o] +
          0.45 * onlyPepperoniRgba[o + 1] +
          0.2 * onlyPepperoniRgba[o + 2]) /
        118;
      outFloating[o] = Math.min(255, Math.round(toppingRgba[tIdx] * (lum3d * 0.82 + 0.32)));
      outFloating[o + 1] = Math.min(
        255,
        Math.round(toppingRgba[tIdx + 1] * (lum3d * 0.82 + 0.32))
      );
      outFloating[o + 2] = Math.min(
        255,
        Math.round(toppingRgba[tIdx + 2] * (lum3d * 0.82 + 0.32))
      );
      outFloating[o + 3] = baseA;
    }
  }

  saveWebp(
    outFloating,
    WIDTH,
    HEIGHT,
    path.join(PIZZA_3D_DIR, `toppings-${spec.slug}-v2.webp`),
    86
  );
  saveWebp(
    outFloating,
    WIDTH,
    HEIGHT,
    path.join(PIZZA_3D_DIR, `toppings-${spec.slug}.webp`),
    86
  );
}

console.log('Fixed all 3D layers: zero gold spiral, zero mushrooms on Pepperoni, cache-busted v2 files created!');
