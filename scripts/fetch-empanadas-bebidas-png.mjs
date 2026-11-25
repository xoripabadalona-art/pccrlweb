import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const OUT_DIR = path.join(ROOT, 'public/images/menu');
const TMP_DIR = '/tmp/piccerella_menu_raw';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

const USER_AGENT = 'LaPiccerellaMenuAssetBuilder/1.0 (https://lapiccerella.es)';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Download HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return dest;
}

// Fetch product image directly by EAN-13 barcode from OpenFoodFacts v2 API (fast & reliable)
async function findProductByBarcodes(barcodes) {
  for (const code of barcodes) {
    try {
      const data = await fetchJson(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,image_front_url,image_url`
      );
      const p = data.product;
      const imgUrl = p?.image_front_url || p?.image_url;
      if (imgUrl) {
        return { url: imgUrl, name: `${p.product_name || code} (${code})` };
      }
    } catch {
      // try next barcode
    }
  }
  return null;
}

// Search Wikimedia Commons for a file and return its direct image URL
async function findWikimediaFileUrl(fileTitle) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json`;
  const data = await fetchJson(url);
  const pages = data.query?.pages || {};
  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (info?.thumburl || info?.url) {
      return info.thumburl || info.url;
    }
  }
  return null;
}

async function searchWikimediaImage(query) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6` +
    `&srsearch=${encodeURIComponent(query)}&srlimit=6&format=json`;
  const data = await fetchJson(url);
  const hits = data.query?.search || [];
  for (const h of hits) {
    if (/\.(jpg|jpeg|png|webp)$/i.test(h.title)) {
      const imgUrl = await findWikimediaFileUrl(h.title);
      if (imgUrl) return { url: imgUrl, name: h.title };
    }
  }
  return null;
}

function makeTransparentPng(inputPath, outputPath, options = {}) {
  const { forceOvalCutout = false, bgLumMin = 178, bgSatMax = 42 } = options;
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

  const exactBuf = execFileSync(
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
  const rgba = new Uint8Array(exactBuf.buffer, exactBuf.byteOffset, w * h * 4);

  if (forceOvalCutout) {
    const cx = w / 2;
    const cy = h / 2;
    const rx = w * 0.44;
    const ry = h * 0.44;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        const o = (y * w + x) * 4;
        if (d > 1.0) {
          rgba[o + 3] = 0;
        } else if (d > 0.9) {
          rgba[o + 3] = Math.round(((1.0 - d) / 0.1) * rgba[o + 3]);
        }
      }
    }
  } else {
    // Smart border flood-fill: remove any connected light/neutral studio background touching the image borders!
    const visited = new Uint8Array(w * h);
    const isBg = new Uint8Array(w * h);
    const q = new Int32Array(w * h);
    let head = 0;
    let tail = 0;

    const isLightNeutral = (idx) => {
      const o = idx * 4;
      if (rgba[o + 3] < 25) return true;
      const r = rgba[o];
      const g = rgba[o + 1];
      const b = rgba[o + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      return lum >= bgLumMin && maxC - minC <= bgSatMax;
    };

    const seed = (idx) => {
      if (!visited[idx] && isLightNeutral(idx)) {
        visited[idx] = 1;
        isBg[idx] = 1;
        q[tail++] = idx;
      }
    };

    // Trim top 3% dark shadow strip if any, and seed all 4 edges
    for (let x = 0; x < w; x++) {
      seed(x);
      seed(Math.min(h - 1, 8) * w + x);
      seed((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      seed(y * w);
      seed(y * w + Math.min(w - 1, 4));
      seed(y * w + (w - 1));
      seed(y * w + Math.max(0, w - 5));
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

    // Check how much background was removed; if > 8%, apply cleanly
    let bgCount = 0;
    for (let i = 0; i < w * h; i++) {
      if (isBg[i]) bgCount++;
    }
    if (bgCount > w * h * 0.08) {
      for (let i = 0; i < w * h; i++) {
        if (isBg[i]) {
          rgba[i * 4 + 3] = 0;
        }
      }
      // Soft 1px anti-alias edge feather
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (isBg[idx]) continue;
          if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - w] || isBg[idx + w]) {
            const o = idx * 4;
            const lum = 0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2];
            if (lum > bgLumMin - 24) {
              rgba[o + 3] = Math.min(rgba[o + 3], 130);
            }
          }
        }
      }
    }
  }

  // Auto-crop to non-transparent bounding box & center cleanly on 600x600 transparent canvas
  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 25) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX >= maxX || minY >= maxY) {
    minX = 0;
    maxX = w - 1;
    minY = 0;
    maxY = h - 1;
  }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
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

const drinksByBarcode = [
  { id: 'bebida-aquarius-limon', barcodes: ['5449000011510', '5449000029065', '5449000143204'], wikimediaFallback: 'Aquarius bebida' },
  { id: 'bebida-fuze-tea', barcodes: ['5449000237705', '5449000238795', '5449000249210'], wikimediaFallback: 'Fuze Tea' },
  { id: 'cerveza-estrella-sin-alcohol', barcodes: ['8410795003214', '8410795015217', '8410795100210'], wikimediaFallback: 'Estrella Galicia 0,0 botella' },
];

const empanadasSpec = [];

async function main() {
  // Re-cut our already-downloaded Estrella Galicia Especial lata into cerveza-estrella-lata.png with clean transparent background
  const estrellaLataRaw = path.join(TMP_DIR, 'cerveza-estrella-sin-alcohol.jpg');
  if (fs.existsSync(estrellaLataRaw)) {
    makeTransparentPng(estrellaLataRaw, path.join(OUT_DIR, 'cerveza-estrella-lata.png'), {
      bgLumMin: 180,
      bgSatMax: 42,
    });
    console.log('  [OK] cerveza-estrella-lata.png <- Estrella Galicia Especial lata');
  }
  console.log('Fetching remaining 4 drinks via Wikimedia Commons...');
  for (const d of drinksByBarcode) {
    try {
      let found = await findProductByBarcodes(d.barcodes);
      if (!found && d.wikimediaFallback) {
        found = await searchWikimediaImage(d.wikimediaFallback);
      }
      if (!found) {
        console.warn(`  [MISS] ${d.id}`);
        continue;
      }
      const rawPath = path.join(TMP_DIR, `${d.id}.jpg`);
      await downloadFile(found.url, rawPath);
      const outPath = path.join(OUT_DIR, `${d.id}.png`);
      makeTransparentPng(rawPath, outPath, { bgLumMin: 180, bgSatMax: 40 });
      console.log(`  [OK] ${d.id}.png <- ${found.name}`);
    } catch (err) {
      console.error(`  [ERR] ${d.id}:`, err.message);
    }
  }

  console.log('Fetching 5 authentic Argentine empanada photos from Wikimedia Commons...');
  for (const e of empanadasSpec) {
    try {
      let url = e.file ? await findWikimediaFileUrl(e.file) : null;
      let label = e.file || e.search;
      if (!url && e.search) {
        const hit = await searchWikimediaImage(e.search);
        if (hit) {
          url = hit.url;
          label = hit.name;
        }
      }
      if (!url) {
        console.warn(`  [MISS] ${e.id}`);
        continue;
      }
      const rawPath = path.join(TMP_DIR, `${e.id}.jpg`);
      await downloadFile(url, rawPath);
      const outPath = path.join(OUT_DIR, `${e.id}.png`);
      makeTransparentPng(rawPath, outPath, { forceOvalCutout: true });
      console.log(`  [OK] ${e.id}.png <- ${label}`);
    } catch (err) {
      console.error(`  [ERR] ${e.id}:`, err.message);
    }
  }
}

main();
