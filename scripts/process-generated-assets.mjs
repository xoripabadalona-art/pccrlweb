import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ARTIFACT_DIR =
  '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';
const IMG_DIR = '/Volumes/Imac HD/la piccerella website/public/images';

fs.mkdirSync(IMG_DIR, { recursive: true });

function convertWithCwebp(inputJpg, outputWebp, vf, quality = 78, alpha = false) {
  const tmpPng = path.join('/tmp', `${path.basename(outputWebp)}.png`);
  execFileSync('ffmpeg', [
    '-y',
    '-i',
    inputJpg,
    '-vf',
    vf,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);
  const args = ['-q', String(quality)];
  if (alpha) {
    args.push('-alpha_q', '85');
  }
  args.push(tmpPng, '-o', outputWebp);
  execFileSync('cwebp', args);
}

// 1. Hero storefront (1920x1080 under 180kB, plus 1080x1920 portrait version)
const storefrontSrc = path.join(ARTIFACT_DIR, 'hero_storefront_1795082525884.jpg');
convertWithCwebp(
  storefrontSrc,
  path.join(IMG_DIR, 'hero-storefront.webp'),
  'scale=1920:1080:flags=lanczos',
  72
);
convertWithCwebp(
  storefrontSrc,
  path.join(IMG_DIR, 'hero-storefront-mobile.webp'),
  'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
  72
);

// 2. Hero interior (1920x1080 + 1080x1920 portrait version)
const interiorSrc = path.join(ARTIFACT_DIR, 'hero_interior_1795082536547.jpg');
convertWithCwebp(
  interiorSrc,
  path.join(IMG_DIR, 'hero-interior.webp'),
  'scale=1920:1080:flags=lanczos',
  75
);
convertWithCwebp(
  interiorSrc,
  path.join(IMG_DIR, 'hero-interior-mobile.webp'),
  'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
  75
);

// 3. Floating hero pizza (1600x1600, preserve dark char spots inside pizza ellipse, key pure black outside)
const pizzaHeroAlpha =
  "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(hypot((X-800)/540,(Y-815)/410),1),255,clip((max(r(X,Y),max(g(X,Y),b(X,Y)))-8)*18,0,255))'";

const pizzaHeroSrc = path.join(ARTIFACT_DIR, 'pizza_hero_1795082551365.jpg');
convertWithCwebp(
  pizzaHeroSrc,
  path.join(IMG_DIR, 'pizza-hero.webp'),
  `scale=1600:1600:flags=lanczos,${pizzaHeroAlpha}`,
  74,
  true
);

// 4. Five exploded pizza layers (1600x1000, transparent background, identical canvas size)
const discLayerAlpha =
  "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(hypot((X-800)/440,(Y-500)/250),1),255,clip((max(r(X,Y),max(g(X,Y),b(X,Y)))-8)*18,0,255))'";
const scatteredLayerAlpha =
  "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip((max(r(X,Y),max(g(X,Y),b(X,Y)))-8)*20,0,255)'";

const layers = [
  { src: 'layer_crust_1795082560564.jpg', dest: 'layer-crust.webp', filter: discLayerAlpha },
  { src: 'layer_sauce_1795082583275.jpg', dest: 'layer-sauce.webp', filter: discLayerAlpha },
  { src: 'layer_cheese_v2_1795082639225.jpg', dest: 'layer-cheese.webp', filter: discLayerAlpha },
  {
    src: 'layer_toppings_v3_1795082681379.jpg',
    dest: 'layer-toppings.webp',
    filter: scatteredLayerAlpha,
  },
  {
    src: 'layer_basil_v2_1795082660440.jpg',
    dest: 'layer-basil.webp',
    filter: scatteredLayerAlpha,
  },
];

for (const layer of layers) {
  convertWithCwebp(
    path.join(ARTIFACT_DIR, layer.src),
    path.join(IMG_DIR, layer.dest),
    `scale=1600:1000:flags=lanczos,${layer.filter}`,
    76,
    true
  );
}

// 5. og-default.jpg (1200x630)
execFileSync('ffmpeg', [
  '-y',
  '-i',
  storefrontSrc,
  '-vf',
  'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630',
  '-q:v',
  '3',
  '-frames:v',
  '1',
  '-update',
  '1',
  path.join(IMG_DIR, 'og-default.jpg'),
]);

console.log('All generated cinematic assets processed into public/images/.');
