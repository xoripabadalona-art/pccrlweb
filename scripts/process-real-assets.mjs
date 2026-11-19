import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const UPLOAD_DIR =
  '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4/.user_uploaded';
const ROOT = '/Volumes/Imac HD/la piccerella website';
const BRAND_DIR = path.join(ROOT, 'public/brand');
const REAL_DIR = path.join(ROOT, 'public/images/real');

fs.mkdirSync(BRAND_DIR, { recursive: true });
fs.mkdirSync(REAL_DIR, { recursive: true });

// 1. Extract the real circular logo from the printed CARTA top-left corner
// and apply a circular alpha mask so outside the circle is transparent.
const cartaSrc = path.join(UPLOAD_DIR, 'media_1795081348157_d8f74900.jpg');
const logoPngPath = path.join(BRAND_DIR, 'logo.png');

execFileSync('ffmpeg', [
  '-y',
  '-i',
  cartaSrc,
  '-vf',
  "crop=140:140:111:61,scale=280:280:flags=lanczos,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-140,Y-140),136),255,0)'",
  '-frames:v',
  '1',
  '-update',
  '1',
  logoPngPath,
]);

// Wrap the exact real PNG logo inside public/brand/logo.svg (no redrawing or approximation)
const logoBase64 = fs.readFileSync(logoPngPath).toString('base64');
const logoSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280" role="img" aria-label="La Piccerella - Pizzería Artesanal">
  <defs>
    <clipPath id="logoCircle">
      <circle cx="140" cy="140" r="136" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,${logoBase64}" width="280" height="280" clip-path="url(#logoCircle)" />
</svg>
`;
fs.writeFileSync(path.join(BRAND_DIR, 'logo.svg'), logoSvgContent, 'utf8');

// 2. Process the 5 real client photos into public/images/real/ as optimized WebP
const realAssets = [
  {
    src: 'media_1795081338436_b9656805.jpg',
    dest: 'storefront-close.webp',
    vf: 'scale=960:-2:flags=lanczos',
  },
  {
    src: 'media_1795081348157_d8f74900.jpg',
    dest: 'carta-printed.webp',
    vf: 'scale=960:-2:flags=lanczos',
  },
  {
    src: 'media_1795081357450_bcef5c46.jpg',
    dest: 'interior-day.webp',
    vf: 'scale=960:-2:flags=lanczos',
  },
  {
    // Crop out Instagram top bar and bottom comments/icons to leave clean real Pepperoni pizza photo
    src: 'media_1795081676026_96ba4ca5.jpg',
    dest: 'pizza-pepperoni-box.webp',
    vf: 'crop=473:425:0:230,scale=800:718:flags=lanczos',
  },
  {
    // Crop out Instagram top bar and bottom comments to leave clean photo of founder Gustavo
    src: 'media_1795081676055_3c4d0781.jpg',
    dest: 'founder-gustavo.webp',
    vf: 'crop=473:570:0:145,scale=760:916:flags=lanczos',
  },
];

for (const asset of realAssets) {
  const inputPath = path.join(UPLOAD_DIR, asset.src);
  const tmpPng = path.join('/tmp', `${asset.dest}.png`);
  const outputPath = path.join(REAL_DIR, asset.dest);
  execFileSync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-vf',
    asset.vf,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);
  execFileSync('cwebp', ['-q', '82', tmpPng, '-o', outputPath]);
}

console.log('Processed real brand logo and 5 real client photos successfully.');
