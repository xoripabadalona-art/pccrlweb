import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const OUT_DIR = path.join(ROOT, 'public/images/menu');
const ARTIFACT_DIR = '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4';

const CANVAS_W = 1280;
const CANVAS_H = 800;

// Read raw RGBA from WebP
function readRgba(filePath) {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', filePath, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], {
    maxBuffer: 20 * 1024 * 1024,
  });
  return new Uint8Array(buf);
}

// Bilinear scale of RGBA image
function scaleRgba(src, sw, sh, dw, dh) {
  const dst = new Uint8Array(dw * dh * 4);
  const xRatio = (sw - 1) / (dw - 1 || 1);
  const yRatio = (sh - 1) / (dh - 1 || 1);

  for (let dy = 0; dy < dh; dy++) {
    const sy = dy * yRatio;
    const sy0 = Math.floor(sy);
    const sy1 = Math.min(sy0 + 1, sh - 1);
    const yLerp = sy - sy0;

    for (let dx = 0; dx < dw; dx++) {
      const sx = dx * xRatio;
      const sx0 = Math.floor(sx);
      const sx1 = Math.min(sx0 + 1, sw - 1);
      const xLerp = sx - sx0;

      const dIdx = (dy * dw + dx) * 4;

      for (let c = 0; c < 4; c++) {
        const v00 = src[(sy0 * sw + sx0) * 4 + c];
        const v10 = src[(sy0 * sw + sx1) * 4 + c];
        const v01 = src[(sy1 * sw + sx0) * 4 + c];
        const v11 = src[(sy1 * sw + sx1) * 4 + c];

        const top = v00 + (v10 - v00) * xLerp;
        const bot = v01 + (v11 - v01) * xLerp;
        dst[dIdx + c] = Math.round(top + (bot - top) * yLerp);
      }
    }
  }
  return dst;
}

// Crop bounding box with clamping to transparent 0
function cropRgba(src, w, h, x0, y0, cw, ch) {
  const dst = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    const sy = y0 + y;
    if (sy < 0 || sy >= h) continue;
    for (let x = 0; x < cw; x++) {
      const sx = x0 + x;
      if (sx < 0 || sx >= w) continue;
      const sIdx = (sy * w + sx) * 4;
      const dIdx = (y * cw + x) * 4;
      dst[dIdx] = src[sIdx];
      dst[dIdx + 1] = src[sIdx + 1];
      dst[dIdx + 2] = src[sIdx + 2];
      dst[dIdx + 3] = src[sIdx + 3];
    }
  }
  return dst;
}

// Box blur on alpha with extra padded buffer so shadow fades naturally to 0
function createShadowFromAlpha(srcRgba, w, h, radius, opacity) {
  const shadow = new Uint8Array(w * h * 4);
  const alphaIn = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    alphaIn[i] = srcRgba[i * 4 + 3];
  }

  // Horizontal blur pass
  const temp = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let kx = -radius; kx <= radius; kx++) {
        const nx = x + kx;
        if (nx >= 0 && nx < w) {
          sum += alphaIn[y * w + nx];
        }
        count++;
      }
      temp[y * w + x] = sum / count;
    }
  }

  // Vertical blur pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        const ny = y + ky;
        if (ny >= 0 && ny < h) {
          sum += temp[ny * w + x];
        }
        count++;
      }
      const blurredAlpha = Math.round((sum / count) * opacity);
      if (blurredAlpha > 0) {
        const idx = (y * w + x) * 4;
        shadow[idx] = 16;     // warm deep brown shadow
        shadow[idx + 1] = 12;
        shadow[idx + 2] = 10;
        shadow[idx + 3] = Math.min(255, blurredAlpha);
      }
    }
  }
  return shadow;
}

// Standard Porter-Duff source-over blend onto canvas
function blendOntoCanvas(canvas, cw, ch, layer, lw, lh, destX, destY) {
  for (let ly = 0; ly < lh; ly++) {
    const cy = destY + ly;
    if (cy < 0 || cy >= ch) continue;

    for (let lx = 0; lx < lw; lx++) {
      const cx = destX + lx;
      if (cx < 0 || cx >= cw) continue;

      const lIdx = (ly * lw + lx) * 4;
      const lAlpha = layer[lIdx + 3] / 255;
      if (lAlpha <= 0) continue;

      const cIdx = (cy * cw + cx) * 4;
      const cAlpha = canvas[cIdx + 3] / 255;

      const outAlpha = lAlpha + cAlpha * (1 - lAlpha);
      if (outAlpha <= 0) continue;

      const lR = layer[lIdx];
      const lG = layer[lIdx + 1];
      const lB = layer[lIdx + 2];

      const cR = canvas[cIdx];
      const cG = canvas[cIdx + 1];
      const cB = canvas[cIdx + 2];

      canvas[cIdx] = Math.round((lR * lAlpha + cR * cAlpha * (1 - lAlpha)) / outAlpha);
      canvas[cIdx + 1] = Math.round((lG * lAlpha + cG * cAlpha * (1 - lAlpha)) / outAlpha);
      canvas[cIdx + 2] = Math.round((lB * lAlpha + cB * cAlpha * (1 - lAlpha)) / outAlpha);
      canvas[cIdx + 3] = Math.round(outAlpha * 255);
    }
  }
}

// Prepare cropped and scaled pizza with generous transparent padding so shadows never clip
function preparePizzaWithPadding(raw, origW, origH, cropBox, scale, pad = 80) {
  // crop with pad
  const paddedCropBox = {
    x: cropBox.x - pad,
    y: cropBox.y - pad,
    w: cropBox.w + pad * 2,
    h: cropBox.h + pad * 2,
  };
  const cropped = cropRgba(raw, origW, origH, paddedCropBox.x, paddedCropBox.y, paddedCropBox.w, paddedCropBox.h);
  const targetW = Math.round(paddedCropBox.w * scale);
  const targetH = Math.round(paddedCropBox.h * scale);
  const scaled = scaleRgba(cropped, paddedCropBox.w, paddedCropBox.h, targetW, targetH);
  return { data: scaled, w: targetW, h: targetH, pad: Math.round(pad * scale) };
}

async function main() {
  const pLeftRaw = readRgba(path.join(ROOT, 'public/images/pizzas-3d/pizza-prosciutto-funghi-v2.webp'));
  const pRightRaw = readRgba(path.join(ROOT, 'public/images/pizzas-3d/pizza-barbacoa-v2.webp'));
  const pCenterRaw = readRgba(path.join(ROOT, 'public/images/pizzas-3d/pizza-pepperoni-v2.webp'));

  // Tight crop box of the pizza disk itself inside the 1280x800 image
  const cropBox = { x: 184, y: 198, w: 912, h: 410 };

  // 1. Back-Left Pizza: Prosciutto e Funghi (scale 0.63)
  const pLeft = preparePizzaWithPadding(pLeftRaw, 1280, 800, cropBox, 0.63, 70);
  // 2. Back-Right Pizza: Barbacoa (scale 0.63)
  const pRight = preparePizzaWithPadding(pRightRaw, 1280, 800, cropBox, 0.63, 70);
  // 3. Front-Center Pizza: Pepperoni (scale 0.74)
  const pCenter = preparePizzaWithPadding(pCenterRaw, 1280, 800, cropBox, 0.74, 80);

  // Position on 1280x800 canvas
  // The pizza disk itself will be offset by -pad
  const posLeft = { x: 140 - pLeft.pad, y: 130 - pLeft.pad };
  const posRight = { x: 1280 - 140 - (pRight.w - pRight.pad), y: 130 - pRight.pad };
  const posCenter = { x: Math.round((1280 - pCenter.w) / 2), y: 280 - pCenter.pad };

  const canvas = new Uint8Array(CANVAS_W * CANVAS_H * 4);

  // Soft shadows for back pizzas
  const shadowL = createShadowFromAlpha(pLeft.data, pLeft.w, pLeft.h, 28, 0.38);
  blendOntoCanvas(canvas, CANVAS_W, CANVAS_H, shadowL, pLeft.w, pLeft.h, posLeft.x, posLeft.y + 24);

  const shadowR = createShadowFromAlpha(pRight.data, pRight.w, pRight.h, 28, 0.38);
  blendOntoCanvas(canvas, CANVAS_W, CANVAS_H, shadowR, pRight.w, pRight.h, posRight.x, posRight.y + 24);

  // Blend back pizzas
  blendOntoCanvas(canvas, CANVAS_W, CANVAS_H, pLeft.data, pLeft.w, pLeft.h, posLeft.x, posLeft.y);
  blendOntoCanvas(canvas, CANVAS_W, CANVAS_H, pRight.data, pRight.w, pRight.h, posRight.x, posRight.y);

  // Deep contact shadow under Front-Center Pepperoni pizza (casts onto the back pizzas and pedestal)
  const shadowC = createShadowFromAlpha(pCenter.data, pCenter.w, pCenter.h, 32, 0.55);
  blendOntoCanvas(canvas, CANVAS_W, CANVAS_H, shadowC, pCenter.w, pCenter.h, posCenter.x, posCenter.y + 26);

  // Blend front pizza
  blendOntoCanvas(canvas, CANVAS_W, CANVAS_H, pCenter.data, pCenter.w, pCenter.h, posCenter.x, posCenter.y);

  // Write output using ffmpeg to PNG then cwebp to high-quality WebP with transparent alpha
  const outPath = path.join(OUT_DIR, 'pack-3-pizzas.webp');
  const tmpRaw = `${outPath}.raw`;
  const tmpPng = `${outPath}.png`;
  fs.writeFileSync(tmpRaw, Buffer.from(canvas));
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${CANVAS_W}x${CANVAS_H}`,
    '-i',
    tmpRaw,
    '-frames:v',
    '1',
    '-update',
    '1',
    tmpPng,
  ]);
  execFileSync('cwebp', ['-q', '90', '-alpha_q', '95', tmpPng, '-o', outPath]);
  fs.unlinkSync(tmpRaw);
  fs.unlinkSync(tmpPng);

  console.log(`Generated: ${outPath} (${fs.statSync(outPath).size} bytes)`);

  // Also save preview to artifact dir for verification
  const previewPath = path.join(ARTIFACT_DIR, 'preview-pack-3-pizzas.jpg');
  const previewRaw = `${previewPath}.raw`;
  fs.writeFileSync(previewRaw, Buffer.from(canvas));
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${CANVAS_W}x${CANVAS_H}`,
    '-i',
    previewRaw,
    '-filter_complex',
    `color=c=#FAF5ED:s=${CANVAS_W}x${CANVAS_H}[bg];[bg][0]overlay=0:0`,
    '-frames:v',
    '1',
    '-update',
    '1',
    '-q:v',
    '2',
    previewPath,
  ]);
  fs.unlinkSync(previewRaw);
  console.log(`Saved preview: ${previewPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
