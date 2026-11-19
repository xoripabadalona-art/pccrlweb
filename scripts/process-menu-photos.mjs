import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const ASSETS_DIR = path.join(ROOT, 'assets');
const MENU_OUT_DIR = path.join(ROOT, 'public/images/menu');
const PIZZA_3D_DIR = path.join(ROOT, 'public/images/pizzas-3d');
const ARTIFACT_DIR =
  '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';

fs.mkdirSync(MENU_OUT_DIR, { recursive: true });
fs.mkdirSync(PIZZA_3D_DIR, { recursive: true });

// 1. Update hero-storefront.webp with the new 3D La Piccerella storefront render
const newStorefrontJpg = path.join(ARTIFACT_DIR, 'hero_storefront_3d_1795085577293.jpg');
if (fs.existsSync(newStorefrontJpg)) {
  const tmpDesktop = '/tmp/hero-storefront-3d.png';
  execFileSync('ffmpeg', [
    '-y',
    '-i',
    newStorefrontJpg,
    '-vf',
    'scale=1920:1080:flags=lanczos',
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpDesktop,
  ]);
  execFileSync('cwebp', [
    '-q',
    '75',
    tmpDesktop,
    '-o',
    path.join(ROOT, 'public/images/hero-storefront.webp'),
  ]);

  const tmpMobile = '/tmp/hero-storefront-3d-mobile.png';
  execFileSync('ffmpeg', [
    '-y',
    '-i',
    newStorefrontJpg,
    '-vf',
    'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpMobile,
  ]);
  execFileSync('cwebp', [
    '-q',
    '75',
    tmpMobile,
    '-o',
    path.join(ROOT, 'public/images/hero-storefront-mobile.webp'),
  ]);
}

// 2. Exact bounding boxes for each of the 15 pizzas in assets/ (1170x2532)
// menuCrop: clean rectangular photo of the pizza on its wooden board (no poster text!)
// pizzaBox: tight bounding box of the pizza crust itself (w, h, x, y) for 3D floating elliptical mask
const pizzaSpecs = [
  {
    slug: 'margarita',
    src: 'IMG_6093.PNG',
    menuCrop: 'crop=760:560:205:835',
    pizzaBox: { w: 700, h: 500, x: 235, y: 845 },
  },
  {
    slug: 'prosciutto',
    src: 'IMG_6094.PNG',
    menuCrop: 'crop=760:525:205:1005',
    pizzaBox: { w: 700, h: 485, x: 235, y: 1010 },
  },
  {
    slug: 'vegetal',
    src: 'IMG_6095.PNG',
    menuCrop: 'crop=720:475:225:982',
    pizzaBox: { w: 690, h: 465, x: 240, y: 985 },
  },
  {
    slug: 'pepperoni',
    src: 'IMG_6096.PNG',
    menuCrop: 'crop=760:575:205:760',
    pizzaBox: { w: 685, h: 520, x: 242, y: 775 },
  },
  {
    slug: 'prosciutto-funghi',
    src: 'IMG_6097.PNG',
    menuCrop: 'crop=760:585:205:925',
    pizzaBox: { w: 710, h: 540, x: 230, y: 935 },
  },
  {
    slug: 'prosciutto-olivas',
    src: 'IMG_6098.PNG',
    menuCrop: 'crop=750:520:210:1100',
    pizzaBox: { w: 685, h: 475, x: 242, y: 1108 },
  },
  {
    slug: 'pollo',
    src: 'IMG_6100.PNG',
    menuCrop: 'crop=750:515:210:1115',
    pizzaBox: { w: 680, h: 475, x: 245, y: 1122 },
  },
  {
    slug: 'mexicana',
    src: 'IMG_6101.PNG',
    menuCrop: 'crop=750:515:210:970',
    pizzaBox: { w: 680, h: 475, x: 245, y: 978 },
  },
  {
    slug: 'mallorquina',
    src: 'IMG_6102.PNG',
    menuCrop: 'crop=750:520:210:1020',
    pizzaBox: { w: 680, h: 475, x: 245, y: 1028 },
  },
  {
    slug: 'carbonara',
    src: 'IMG_6103.PNG',
    menuCrop: 'crop=750:515:210:970',
    pizzaBox: { w: 680, h: 475, x: 245, y: 978 },
  },
  {
    slug: 'barbacoa',
    src: 'IMG_6104.PNG',
    menuCrop: 'crop=750:535:210:955',
    pizzaBox: { w: 675, h: 485, x: 248, y: 965 },
  },
  {
    slug: 'bacon',
    src: 'IMG_6105.PNG',
    menuCrop: 'crop=750:520:210:980',
    pizzaBox: { w: 685, h: 475, x: 242, y: 988 },
  },
  {
    slug: 'atun',
    src: 'IMG_6106.PNG',
    menuCrop: 'crop=760:510:205:1032',
    pizzaBox: { w: 700, h: 465, x: 235, y: 1038 },
  },
  {
    slug: '4-quesos',
    src: 'IMG_6107.PNG',
    menuCrop: 'crop=730:515:220:955',
    pizzaBox: { w: 665, h: 465, x: 252, y: 962 },
  },
  {
    slug: '4-estaciones',
    src: 'IMG_6108.PNG',
    menuCrop: 'crop=730:520:220:1010',
    pizzaBox: { w: 665, h: 475, x: 252, y: 1018 },
  },
];

for (const spec of pizzaSpecs) {
  const inputPath = path.join(ASSETS_DIR, spec.src);

  // A) 2D Menu photo (clean crop on wooden board)
  const menuTmp = `/tmp/menu-${spec.slug}.png`;
  const menuOut = path.join(MENU_OUT_DIR, `pizza-${spec.slug}.webp`);
  execFileSync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-vf',
    `${spec.menuCrop},scale=760:540:flags=lanczos`,
    '-frames:v',
    '1',
    '-update',
    '1',
    menuTmp,
  ]);
  execFileSync('cwebp', ['-q', '84', menuTmp, '-o', menuOut]);

  // B) 3D Floating perspective pizza disc (feathered elliptical alpha mask on 900x660 canvas)
  const { w, h, x, y } = spec.pizzaBox;
  const p3dTmp = `/tmp/p3d-${spec.slug}.png`;
  const p3dOut = path.join(PIZZA_3D_DIR, `pizza-${spec.slug}.webp`);

  // Crop to the pizza crust, scale to 840x600, apply soft feathered elliptical alpha mask
  // so only the baked pizza disc floats with a smooth 3D rim
  const ellipseMaskFilter = [
    `crop=${w}:${h}:${x}:${y}`,
    'scale=840:600:flags=lanczos',
    'format=rgba',
    "geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip((1-hypot((X-420)/406,(Y-300)/286))*22,0,1)'",
  ].join(',');

  execFileSync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-vf',
    ellipseMaskFilter,
    '-frames:v',
    '1',
    '-update',
    '1',
    p3dTmp,
  ]);
  execFileSync('cwebp', ['-q', '86', '-alpha_q', '92', p3dTmp, '-o', p3dOut]);
}

// 3. Action shots from the pizzeria kitchen
const actionCrops = [
  {
    src: 'IMG_6117.PNG',
    dest: 'action-slicing-pizza.webp',
    crop: 'crop=1170:980:0:680,scale=840:704:flags=lanczos',
  },
  {
    src: 'IMG_6115.PNG',
    dest: 'action-box-stamp.webp',
    crop: 'crop=1170:940:0:880,scale=840:675:flags=lanczos',
  },
];

for (const act of actionCrops) {
  const inputPath = path.join(ASSETS_DIR, act.src);
  const tmpPng = `/tmp/${act.dest}.png`;
  const outputPath = path.join(MENU_OUT_DIR, act.dest);
  execFileSync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-vf',
    act.crop,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);
  execFileSync('cwebp', ['-q', '84', tmpPng, '-o', outputPath]);
}

console.log('Processed all 15 clean 2D menu photos and 15 3D floating pizza discs.');
