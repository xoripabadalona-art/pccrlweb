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

function saveWebp(rgba, w, h, outputPath, quality = 85) {
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

// 1. Clean 3D Basil & Olive Oil layer (key out dark background everywhere, keep all green leaf & gold oil pixels 100% solid)
const rawBasil = loadRgba(
  path.join(ARTIFACT_DIR, 'layer_basil_v2_1795082660440.jpg'),
  WIDTH,
  HEIGHT
);
const cleanBasil = new Uint8Array(rawBasil);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const o = i * 4;
  const r = cleanBasil[o];
  const g = cleanBasil[o + 1];
  const b = cleanBasil[o + 2];
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC - minC;
  // Background is near-neutral dark gray/black (maxC < 40 and low saturation)
  if (maxC < 32 || (maxC < 52 && sat < 14)) {
    cleanBasil[o + 3] = 0;
  } else {
    cleanBasil[o + 3] = Math.min(255, Math.round((maxC - 24) * 9));
  }
}
saveWebp(cleanBasil, WIDTH, HEIGHT, path.join(IMG_DIR, 'layer-basil.webp'), 86);

// 2. Clean 3D Toppings template (28 razor-sharp 3D floating pieces on transparent background)
const rawToppings = loadRgba(
  path.join(ARTIFACT_DIR, 'layer_toppings_v3_1795082681379.jpg'),
  WIDTH,
  HEIGHT
);
const cleanToppings = new Uint8Array(rawToppings);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  const o = i * 4;
  const r = cleanToppings[o];
  const g = cleanToppings[o + 1];
  const b = cleanToppings[o + 2];
  const maxC = Math.max(r, g, b);
  if (maxC <= 22) {
    cleanToppings[o + 3] = 0;
  } else if (maxC < 36) {
    cleanToppings[o + 3] = Math.round(((maxC - 22) / 14) * 255);
  } else {
    cleanToppings[o + 3] = 255;
  }
}
saveWebp(cleanToppings, WIDTH, HEIGHT, path.join(IMG_DIR, 'layer-toppings.webp'), 86);

const pizzaSpecs = [
  { slug: 'margarita', src: 'IMG_6093.PNG', box: { w: 680, h: 480, x: 245, y: 855 } },
  { slug: 'prosciutto', src: 'IMG_6094.PNG', box: { w: 680, h: 470, x: 245, y: 1015 } },
  { slug: 'vegetal', src: 'IMG_6095.PNG', box: { w: 670, h: 450, x: 250, y: 992 } },
  { slug: 'pepperoni', src: 'IMG_6096.PNG', box: { w: 670, h: 500, x: 250, y: 785 } },
  { slug: 'prosciutto-funghi', src: 'IMG_6097.PNG', box: { w: 690, h: 520, x: 240, y: 945 } },
  { slug: 'prosciutto-olivas', src: 'IMG_6098.PNG', box: { w: 670, h: 460, x: 250, y: 1115 } },
  { slug: 'pollo', src: 'IMG_6100.PNG', box: { w: 665, h: 460, x: 252, y: 1128 } },
  { slug: 'mexicana', src: 'IMG_6101.PNG', box: { w: 665, h: 460, x: 252, y: 985 } },
  { slug: 'mallorquina', src: 'IMG_6102.PNG', box: { w: 665, h: 460, x: 252, y: 1035 } },
  { slug: 'carbonara', src: 'IMG_6103.PNG', box: { w: 665, h: 460, x: 252, y: 985 } },
  { slug: 'barbacoa', src: 'IMG_6104.PNG', box: { w: 660, h: 470, x: 255, y: 972 } },
  { slug: 'bacon', src: 'IMG_6105.PNG', box: { w: 670, h: 460, x: 250, y: 995 } },
  { slug: 'atun', src: 'IMG_6106.PNG', box: { w: 680, h: 450, x: 245, y: 1045 } },
  { slug: '4-quesos', src: 'IMG_6107.PNG', box: { w: 650, h: 450, x: 260, y: 968 } },
  { slug: '4-estaciones', src: 'IMG_6108.PNG', box: { w: 650, h: 460, x: 260, y: 1025 } },
];

// For each pizza, map its real topping texture onto the 28 razor-sharp 3D floating pieces of cleanToppings
// while preserving the 3D specular highlights, 3D rim shading, and 3D shadows!
for (const spec of pizzaSpecs) {
  const inputPath = path.join(ASSETS_DIR, spec.src);
  const { w, h, x, y } = spec.box;

  // Load real pizza toppings scaled to match the 3D topping cluster bounding box (840x360 centered at 640,415)
  const TOP_W = 840;
  const TOP_H = 360;
  const toppingRgba = loadRgba(inputPath, TOP_W, TOP_H, `crop=${w}:${h}:${x}:${y}`);

  const outFloating = new Uint8Array(WIDTH * HEIGHT * 4);

  for (let py = 200; py < 620; py++) {
    for (let px = 210; px < 1070; px++) {
      const idx = (py * WIDTH + px) * 4;
      const baseA = cleanToppings[idx + 3];
      if (baseA === 0) continue;

      const br = cleanToppings[idx];
      const bg = cleanToppings[idx + 1];
      const bb = cleanToppings[idx + 2];

      if (spec.slug === 'pepperoni' || spec.slug === 'prosciutto-funghi') {
        // Keep original photorealistic 3D pepperoni & mushroom pieces directly
        outFloating[idx] = br;
        outFloating[idx + 1] = bg;
        outFloating[idx + 2] = bb;
        outFloating[idx + 3] = baseA;
      } else {
        // Sample the real pizza topping color at this 3D position and apply the 3D lighting/normal shading of the 3D piece
        const tx = Math.min(TOP_W - 1, Math.max(0, Math.round(((px - 220) / 840) * TOP_W)));
        const ty = Math.min(TOP_H - 1, Math.max(0, Math.round(((py - 235) / 360) * TOP_H)));
        const tIdx = (ty * TOP_W + tx) * 4;

        const lum3d = (0.35 * br + 0.45 * bg + 0.2 * bb) / 128; // 3D shading factor (0..2)
        const specHighlight = Math.max(0, Math.min(65, (Math.min(br, bg, bb) - 95) * 0.9));

        outFloating[idx] = Math.min(
          255,
          Math.round(toppingRgba[tIdx] * Math.min(1.35, lum3d * 0.95 + 0.25) + specHighlight)
        );
        outFloating[idx + 1] = Math.min(
          255,
          Math.round(toppingRgba[tIdx + 1] * Math.min(1.35, lum3d * 0.95 + 0.25) + specHighlight)
        );
        outFloating[idx + 2] = Math.min(
          255,
          Math.round(toppingRgba[tIdx + 2] * Math.min(1.35, lum3d * 0.95 + 0.25) + specHighlight)
        );
        outFloating[idx + 3] = baseA;
      }
    }
  }

  saveWebp(
    outFloating,
    WIDTH,
    HEIGHT,
    path.join(PIZZA_3D_DIR, `toppings-${spec.slug}.webp`),
    86
  );
}

console.log('Rebuilt razor-sharp 3D floating topping layers and 3D basil layer!');
