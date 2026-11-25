import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const OUT_DIR = path.join(ROOT, 'public/images/menu');
const TMP_DIR = '/tmp/piccerella_studio_drinks';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  Accept: 'application/json',
};

async function fetchJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Download HTTP ${res.status} for ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// Convert a pure studio white-background e-commerce packshot to a spotless 600x600 transparent PNG
function studioWhiteToTransparentPng(inputPath, outputPath, whiteThreshold = 236) {
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
    { maxBuffer: w * h * 4 + 1024 * 1024 }
  );
  const rgba = new Uint8Array(buf.buffer, buf.byteOffset, w * h * 4);

  // BFS border flood-fill on pure studio white (#FFFFFF / light grey studio shadow)
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);
  const q = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const isStudioWhite = (idx) => {
    const o = idx * 4;
    if (rgba[o + 3] < 20) return true;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= whiteThreshold && maxC - minC <= 18;
  };

  const seed = (idx) => {
    if (!visited[idx] && isStudioWhite(idx)) {
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

  for (let i = 0; i < w * h; i++) {
    if (isBg[i]) rgba[i * 4 + 3] = 0;
  }

  // Keep only the largest connected foreground component so any detached retail "33CL" corner badge is cleanly removed
  const compId = new Int32Array(w * h);
  let nextComp = 1;
  let bestComp = 0;
  let bestSize = 0;
  const cq = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (rgba[i * 4 + 3] <= 20 || compId[i] !== 0) continue;
    const id = nextComp++;
    let chHead = 0;
    let chTail = 0;
    cq[chTail++] = i;
    compId[i] = id;
    while (chHead < chTail) {
      const curr = cq[chHead++];
      const cx = curr % w;
      const cy = (curr - cx) / w;
      if (cx > 0 && rgba[(curr - 1) * 4 + 3] > 20 && !compId[curr - 1]) {
        compId[curr - 1] = id;
        cq[chTail++] = curr - 1;
      }
      if (cx < w - 1 && rgba[(curr + 1) * 4 + 3] > 20 && !compId[curr + 1]) {
        compId[curr + 1] = id;
        cq[chTail++] = curr + 1;
      }
      if (cy > 0 && rgba[(curr - w) * 4 + 3] > 20 && !compId[curr - w]) {
        compId[curr - w] = id;
        cq[chTail++] = curr - w;
      }
      if (cy < h - 1 && rgba[(curr + w) * 4 + 3] > 20 && !compId[curr + w]) {
        compId[curr + w] = id;
        cq[chTail++] = curr + w;
      }
    }
    if (chTail > bestSize) {
      bestSize = chTail;
      bestComp = id;
    }
  }
  if (bestComp > 0) {
    for (let i = 0; i < w * h; i++) {
      if (compId[i] !== bestComp) {
        rgba[i * 4 + 3] = 0;
        isBg[i] = 1;
      }
    }
  }

  // Smooth 1px edge anti-aliasing
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (isBg[idx]) continue;
      if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - w] || isBg[idx + w]) {
        const o = idx * 4;
        const minC = Math.min(rgba[o], rgba[o + 1], rgba[o + 2]);
        if (minC > whiteThreshold - 28) {
          rgba[o + 3] = Math.round(((255 - minC) / 48) * 255);
        }
      }
    }
  }

  // Auto-crop to bounding box & center cleanly on 600x600 transparent canvas
  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
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

async function collectAllMercadonaDrinks() {
  const root = await fetchJson('https://tienda.mercadona.es/api/categories/?lang=es&wh=bcn1');
  const drinkCats = [];
  for (const cat of root.results || []) {
    const name = (cat.name || '').toLowerCase();
    if (name.includes('agua') || name.includes('refresc') || name.includes('bodega') || name.includes('cerveza')) {
      for (const sub of cat.categories || []) {
        drinkCats.push({ id: sub.id, name: sub.name });
      }
    }
  }
  const products = [];
  for (const sub of drinkCats) {
    try {
      const data = await fetchJson(`https://tienda.mercadona.es/api/categories/${sub.id}/?lang=es&wh=bcn1`);
      for (const group of data.categories || []) {
        for (const p of group.products || []) {
          products.push({
            name: p.display_name || '',
            packaging: p.packaging || '',
            size: p.price_instructions?.unit_size || '',
            thumb: p.thumbnail || '',
          });
        }
      }
    } catch {
      // skip
    }
  }
  return products;
}

const targets = [
  {
    id: 'bebida-coca-cola',
    match: (p) =>
      p.name.toLowerCase().includes('coca-cola') &&
      !p.name.toLowerCase().includes('zero') &&
      !p.name.toLowerCase().includes('light') &&
      !p.name.toLowerCase().includes('cafeína') &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'bebida-coca-cola-zero',
    match: (p) =>
      p.name.toLowerCase().includes('coca-cola') &&
      p.name.toLowerCase().includes('zero') &&
      !p.name.toLowerCase().includes('cafeína') &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'bebida-fanta-naranja',
    match: (p) =>
      p.name.toLowerCase().includes('fanta') &&
      p.name.toLowerCase().includes('naranja') &&
      !p.name.toLowerCase().includes('zero') &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'bebida-aquarius-limon',
    match: (p) =>
      p.name.toLowerCase().includes('aquarius') &&
      p.name.toLowerCase().includes('limón') &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'bebida-sprite',
    match: (p) =>
      p.name.toLowerCase().includes('sprite') &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'bebida-fuze-tea',
    match: (p) =>
      (p.name.toLowerCase().includes('fuze tea') || p.name.toLowerCase().includes('nestea')) &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'bebida-agua-sin-gas',
    match: (p) =>
      p.name.toLowerCase().includes('agua mineral') &&
      !p.name.toLowerCase().includes('gas') &&
      p.packaging.toLowerCase().includes('botella') &&
      Number(p.size) <= 0.5,
  },
  {
    id: 'bebida-agua-con-gas',
    match: (p) =>
      (p.name.toLowerCase().includes('agua con gas') || p.name.toLowerCase().includes('vichy')) &&
      p.packaging.toLowerCase().includes('botella'),
  },
  {
    id: 'cerveza-estrella-lata',
    match: (p) =>
      p.name.toLowerCase().includes('estrella galicia') &&
      !p.name.toLowerCase().includes('0,0') &&
      !p.name.toLowerCase().includes('sin') &&
      !p.name.toLowerCase().includes('1906') &&
      p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'cerveza-estrella-sin-alcohol',
    match: (p) =>
      p.name.toLowerCase().includes('estrella galicia') &&
      (p.name.toLowerCase().includes('0,0') || p.name.toLowerCase().includes('sin alcohol')),
  },
  {
    id: 'cerveza-estrella-tirador',
    match: (p) =>
      p.name.toLowerCase().includes('estrella galicia') &&
      !p.name.toLowerCase().includes('0,0') &&
      !p.name.toLowerCase().includes('1906') &&
      !p.packaging.toLowerCase().includes('lata'),
  },
  {
    id: 'cerveza-1906-tirador',
    match: (p) => p.name.toLowerCase().includes('1906'),
  },
];

async function main() {
  console.log('Querying Spanish studio packshots from Mercadona Barcelona (bcn1)...');
  const products = await collectAllMercadonaDrinks();
  console.log(`Loaded ${products.length} catalog drink entries.`);

  for (const t of targets) {
    const found = products.find(t.match);
    if (!found || !found.thumb) {
      console.warn(`  [MISS] ${t.id}`);
      continue;
    }
    // Upgrade imgix thumbnail to high-res 600x600 studio packshot
    const hiResUrl = found.thumb.replace(/h=\d+&w=\d+/, 'h=600&w=600');
    const rawPath = path.join(TMP_DIR, `${t.id}.jpg`);
    await downloadFile(hiResUrl, rawPath);
    const outPath = path.join(OUT_DIR, `${t.id}.png`);
    studioWhiteToTransparentPng(rawPath, outPath, 238);
    console.log(`  [OK] ${t.id}.png <- ${found.name} (${found.packaging})`);
  }
}

main();
