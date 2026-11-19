import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/Volumes/Imac HD/la piccerella website';
const IMG_DIR = path.join(ROOT, 'public/images');
const UPLOAD_DIR =
  '/Users/volturia/.gemini/antigravity/brain/53f70d61-0e78-4d79-bac7-e745213ebbd4/.user_uploaded';

const PHOTO_WIDE = path.join(UPLOAD_DIR, 'media_1795088356092_eef0ab8f.jpg'); // 960x784 (wide unobstructed left kitchen window + top white awning + lower banner)
const PHOTO_CLEAN_RIGHT = path.join(UPLOAD_DIR, 'media_1795081338436_b9656805.jpg'); // 975x976 (clean right glass without umbrellas + open doorway)
const PHOTO_GUSTAVO = path.join(UPLOAD_DIR, 'media_1795088386286_ef5a2d6f.jpg'); // 473x1024 (Gustavo waving with peel + PIZZETA 3€ A-frame sign)

const W = 1920;
const H = 1080;

function loadRgba(filePath, w, h, vfExtra = '') {
  const vf = vfExtra
    ? `${vfExtra},scale=${w}:${h}:flags=lanczos`
    : `scale=${w}:${h}:flags=lanczos`;
  const buf = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', filePath, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
    { maxBuffer: w * h * 4 + 2 * 1024 * 1024 }
  );
  return new Uint8Array(buf.buffer, buf.byteOffset, w * h * 4);
}

function saveWebp(rgba, w, h, outputPath, quality = 88) {
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
  execFileSync('cwebp', ['-q', String(quality), '-alpha_q', '95', tmpPng, '-o', outputPath]);
  fs.unlinkSync(tmpRaw);
}

function clamp(v, lo = 0, hi = 255) {
  return v < lo ? lo : v > hi ? hi : Math.round(v);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function blendPixel(buf, w, h, x, y, r, g, b, a = 1) {
  if (x < 0 || x >= w || y < 0 || y >= h || a <= 0) return;
  const o = (y * w + x) * 4;
  const inv = 1 - a;
  buf[o] = clamp(buf[o] * inv + r * a);
  buf[o + 1] = clamp(buf[o + 1] * inv + g * a);
  buf[o + 2] = clamp(buf[o + 2] * inv + b * a);
  buf[o + 3] = 255;
}

// Fast edge-preserving bilateral stylization filter to give photos a warm, cohesive 3D Disney/Pixar illustrative finish
function stylizePixar(src, w, h, radius = 3, sigmaColor = 32, satBoost = 1.22, warmBoost = 1.06) {
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cIdx = (y * w + x) * 4;
      const cr = src[cIdx];
      const cg = src[cIdx + 1];
      const cb = src[cIdx + 2];

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumW = 0;

      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(h - 1, y + radius);
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);

      for (let ny = y0; ny <= y1; ny++) {
        for (let nx = x0; nx <= x1; nx++) {
          const nIdx = (ny * w + nx) * 4;
          const nr = src[nIdx];
          const ng = src[nIdx + 1];
          const nb = src[nIdx + 2];
          const dr = nr - cr;
          const dg = ng - cg;
          const db = nb - cb;
          const colorDist2 = dr * dr + dg * dg + db * db;
          const wgt = Math.exp(-colorDist2 / (2 * sigmaColor * sigmaColor));
          sumR += nr * wgt;
          sumG += ng * wgt;
          sumB += nb * wgt;
          sumW += wgt;
        }
      }

      let r = sumR / sumW;
      let g = sumG / sumW;
      let b = sumB / sumW;

      // Boost saturation and warm golden Pixar lighting
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = (lum + (r - lum) * satBoost) * warmBoost;
      g = (lum + (g - lum) * satBoost) * (1 + (warmBoost - 1) * 0.45);
      b = (lum + (b - lum) * satBoost) * 0.96;

      // Subtle S-curve contrast for 3D render pop
      const normR = r / 255;
      const normG = g / 255;
      const normB = b / 255;
      const sCurve = (v) => clamp((v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2) * 255 * 0.32 + v * 255 * 0.68);

      out[cIdx] = sCurve(Math.min(1, Math.max(0, normR)));
      out[cIdx + 1] = sCurve(Math.min(1, Math.max(0, normG)));
      out[cIdx + 2] = sCurve(Math.min(1, Math.max(0, normB)));
      out[cIdx + 3] = 255;
    }
  }
  return out;
}

// 1. Load the main wide storefront photo (media_1795088356092_eef0ab8f.jpg, 960x784)
// In our 1920x1080 diorama stage, the front face of the 3D Cube Storefront occupies:
// X: 420..1500 (width = 1080), Y: 215..885 (height = 670)
const FACE_X = 420;
const FACE_Y = 215;
const FACE_W = 1080;
const FACE_H = 670;

// Crop out the tiny pavement strip at the bottom of media_1795088356092_eef0ab8f.jpg (keep y: 0..735 of 784)
// so FACE_Y..FACE_Y+FACE_H maps cleanly from the top of the white awning to the bottom of the black storefront step!
const rawWideFace = loadRgba(PHOTO_WIDE, FACE_W, FACE_H, 'crop=960:732:0:0');

// Also load the clean right glass pane from media_1795081338436_b9656805.jpg (without the 2 grey folded umbrellas!)
// In media_1795081338436_b9656805.jpg (975x976), the storefront from top of white awning to bottom of step is y: 0..815
const rawCleanRightFace = loadRgba(PHOTO_CLEAN_RIGHT, FACE_W, FACE_H, 'crop=975:812:0:12');

// Merge the two photos cleanly along the vertical glass door edge (x = 760 of FACE_W):
// - Left and center (x: 0..760, and top awning y: 0..145): use rawWideFace (wide unobstructed left kitchen window + top awning + lower banner)
// - Right glass panel (x: 760..1040, y: 150..645): use rawCleanRightFace (no folded umbrellas, clean Pack Familiar poster + dining room)
const mergedFace = new Uint8Array(rawWideFace);
for (let y = 148; y < 648; y++) {
  for (let x = 754; x < 1042; x++) {
    const wx = x < 770 ? (x - 754) / 16 : x > 1022 ? (1042 - x) / 20 : 1;
    const wy = y < 164 ? (y - 148) / 16 : y > 630 ? (648 - y) / 18 : 1;
    const t = Math.max(0, Math.min(1, wx * wy));
    const o = (y * FACE_W + x) * 4;
    mergedFace[o] = clamp(lerp(rawWideFace[o], rawCleanRightFace[o], t));
    mergedFace[o + 1] = clamp(lerp(rawWideFace[o + 1], rawCleanRightFace[o + 1], t));
    mergedFace[o + 2] = clamp(lerp(rawWideFace[o + 2], rawCleanRightFace[o + 2], t));
  }
}

// Clean out the small dark worker in the left kitchen window (x: 305..392, y: 305..385 of FACE_W x FACE_H)
// by sampling the warm bright kitchen wall cleanly from the left/top
for (let y = 304; y < 388; y++) {
  for (let x = 306; x < 394; x++) {
    const o = (y * FACE_W + x) * 4;
    const wx = x < 322 ? (x - 306) / 16 : x > 378 ? (394 - x) / 16 : 1;
    const wy = y < 318 ? (y - 304) / 14 : 1;
    const t = Math.max(0, Math.min(1, wx * wy));
    // Warm sunlit kitchen wall backdrop behind Gustavo
    const bgR = 198 - (y - 304) * 0.35;
    const bgG = 178 - (y - 304) * 0.3;
    const bgB = 142 - (y - 304) * 0.25;
    mergedFace[o] = clamp(lerp(mergedFace[o], bgR, t));
    mergedFace[o + 1] = clamp(lerp(mergedFace[o + 1], bgG, t));
    mergedFace[o + 2] = clamp(lerp(mergedFace[o + 2], bgB, t));
  }
}

// Stylize the merged storefront face with our warm 3D Disney/Pixar illustrative shader
const stylizedFace = stylizePixar(mergedFace, FACE_W, FACE_H, 3, 28, 1.24, 1.07);

// 2. Build the 1920x1080 3D Cube Building Diorama Canvas ("stile cubo con un tetto")
const canvas = new Uint8Array(W * H * 4);

// 2a. Warm Mediterranean Dusk Sky & Atmospheric Glow behind the 3D Cube Pizzeria
for (let y = 0; y < H; y++) {
  const ty = y / H;
  for (let x = 0; x < W; x++) {
    const tx = (x - W / 2) / (W / 2);
    const distCenter = Math.hypot(tx * 0.85, (y - 520) / 520);
    const glow = Math.max(0, 1 - distCenter * 0.92);

    // Rich deep evening blue-charcoal sky transitioning to warm amber horizon glow behind the cube
    const r = clamp(lerp(18, 44, ty) + glow * glow * 52);
    const g = clamp(lerp(20, 34, ty) + glow * glow * 34);
    const b = clamp(lerp(34, 38, ty) + glow * 16);

    const o = (y * W + x) * 4;
    canvas[o] = r;
    canvas[o + 1] = g;
    canvas[o + 2] = b;
    canvas[o + 3] = 255;
  }
}

// Subtle warm stars & distant warm Badalona street bokeh lights on the far left and right
const bokehLights = [
  { x: 140, y: 610, r: 58, col: [255, 190, 110], a: 0.22 },
  { x: 225, y: 650, r: 42, col: [255, 165, 90], a: 0.18 },
  { x: 1770, y: 615, r: 62, col: [255, 190, 110], a: 0.22 },
  { x: 1690, y: 655, r: 44, col: [255, 165, 90], a: 0.18 },
  { x: 260, y: 180, r: 3, col: [255, 245, 220], a: 0.55 },
  { x: 1640, y: 150, r: 3, col: [255, 245, 220], a: 0.5 },
  { x: 180, y: 310, r: 2, col: [255, 240, 210], a: 0.4 },
  { x: 1790, y: 270, r: 2, col: [255, 240, 210], a: 0.45 },
];
for (const bl of bokehLights) {
  for (let y = Math.max(0, bl.y - bl.r); y <= Math.min(H - 1, bl.y + bl.r); y++) {
    for (let x = Math.max(0, bl.x - bl.r); x <= Math.min(W - 1, bl.x + bl.r); x++) {
      const d = Math.hypot(x - bl.x, y - bl.y) / bl.r;
      if (d <= 1) {
        const wgt = Math.pow(1 - d, 2) * bl.a;
        blendPixel(canvas, W, H, x, y, bl.col[0], bl.col[1], bl.col[2], wgt);
      }
    }
  }
}

// 2b. 3D Cube Building Volume ("stile cubo con un tetto"):
// Front stucco cube walls extend the storefront left (x: 345..420) and right (x: 1500..1575),
// plus 3D perspective side walls receding inward (left side wall x: 295..345, right side wall x: 1575..1625)
const CUBE_LEFT = 345;
const CUBE_RIGHT = 1575;
const CUBE_SIDE_L = 295;
const CUBE_SIDE_R = 1625;
const CUBE_TOP = 205;
const CUBE_BOT = 890;

// Procedural Mediterranean sandstone stucco noise helper
function stuccoNoise(x, y) {
  const n1 = Math.sin(x * 0.37 + y * 0.23) * Math.cos(x * 0.19 - y * 0.41);
  const n2 = Math.sin(x * 1.13 - y * 0.89) * 0.5;
  return (n1 + n2) * 5;
}

// Draw 3D Receding Left & Right Side Faces of the Cube (gives true 3D cube depth!)
for (let y = CUBE_TOP + 12; y <= CUBE_BOT; y++) {
  const ty = (y - CUBE_TOP) / (CUBE_BOT - CUBE_TOP);
  // Left receding side face (x: CUBE_SIDE_L .. CUBE_LEFT)
  for (let x = CUBE_SIDE_L; x < CUBE_LEFT; x++) {
    const tx = (x - CUBE_SIDE_L) / (CUBE_LEFT - CUBE_SIDE_L);
    const perspTop = CUBE_TOP + Math.round((1 - tx) * 26);
    const perspBot = CUBE_BOT - Math.round((1 - tx) * 18);
    if (y < perspTop || y > perspBot) continue;
    const n = stuccoNoise(x, y);
    const shade = lerp(0.62, 0.82, tx) * (1 - ty * 0.12);
    // Quoins (3D stone corner blocks every 68px)
    const isQuoin = ((y - CUBE_TOP) % 68) < 58 && tx > 0.35;
    const baseR = isQuoin ? 208 : 194;
    const baseG = isQuoin ? 190 : 176;
    const baseB = isQuoin ? 164 : 150;
    blendPixel(
      canvas,
      W,
      H,
      x,
      y,
      clamp((baseR + n) * shade),
      clamp((baseG + n) * shade),
      clamp((baseB + n) * shade),
      1
    );
  }
  // Right receding side face (x: CUBE_RIGHT .. CUBE_SIDE_R)
  for (let x = CUBE_RIGHT; x <= CUBE_SIDE_R; x++) {
    const tx = (x - CUBE_RIGHT) / (CUBE_SIDE_R - CUBE_RIGHT);
    const perspTop = CUBE_TOP + Math.round(tx * 26);
    const perspBot = CUBE_BOT - Math.round(tx * 18);
    if (y < perspTop || y > perspBot) continue;
    const n = stuccoNoise(x, y);
    const shade = lerp(0.78, 0.56, tx) * (1 - ty * 0.12);
    const isQuoin = ((y - CUBE_TOP) % 68) < 58 && tx < 0.65;
    const baseR = isQuoin ? 204 : 190;
    const baseG = isQuoin ? 186 : 172;
    const baseB = isQuoin ? 160 : 146;
    blendPixel(
      canvas,
      W,
      H,
      x,
      y,
      clamp((baseR + n) * shade),
      clamp((baseG + n) * shade),
      clamp((baseB + n) * shade),
      1
    );
  }
}

// Draw Front Stucco Pillars of the Cube (x: CUBE_LEFT..FACE_X+22 and x: FACE_X+FACE_W-22..CUBE_RIGHT)
for (let y = CUBE_TOP; y <= CUBE_BOT; y++) {
  const ty = (y - CUBE_TOP) / (CUBE_BOT - CUBE_TOP);
  for (let x = CUBE_LEFT; x <= CUBE_RIGHT; x++) {
    if (x > FACE_X + 18 && x < FACE_X + FACE_W - 18 && y > FACE_Y + 8 && y < FACE_Y + FACE_H - 8) {
      continue;
    }
    const n = stuccoNoise(x, y);
    // Corner quoin stones on outer edges of the front cube pillars
    const distOuter = Math.min(x - CUBE_LEFT, CUBE_RIGHT - x);
    const isQuoinBlock = distOuter < 38 && ((y - CUBE_TOP) % 68) < 58;
    const isQuoinGroove = distOuter < 38 && ((y - CUBE_TOP) % 68) >= 58;
    let r = (isQuoinBlock ? 226 : isQuoinGroove ? 175 : 214) + n;
    let g = (isQuoinBlock ? 210 : isQuoinGroove ? 160 : 198) + n;
    let b = (isQuoinBlock ? 186 : isQuoinGroove ? 138 : 174) + n;

    // Warm sconce light cone on left pillar (center x=382, y=455) and right pillar (center x=1538, y=455)
    for (const sx of [382, 1538]) {
      const dx = x - sx;
      const dy = y - 430;
      if (dy > -25 && dy < 320) {
        const coneWidth = 18 + Math.max(0, dy) * 0.35;
        const dCone = Math.abs(dx) / coneWidth;
        if (dCone < 1) {
          const glow = Math.pow(1 - dCone, 1.8) * Math.max(0, 1 - dy / 320) * 0.65;
          r += glow * 85;
          g += glow * 55;
          b += glow * 18;
        }
      }
    }

    const vShade = 1 - ty * 0.08;
    blendPixel(canvas, W, H, x, y, r * vShade, g * vShade, b * vShade, 1);
  }
}

// 2c. Composite the Stylized Real Storefront Face into the center of the 3D Cube
for (let y = 0; y < FACE_H; y++) {
  for (let x = 0; x < FACE_W; x++) {
    const o = (y * FACE_W + x) * 4;
    // Feather outer 14px on left and right into the 3D cube stucco pillars
    const fx = x < 14 ? x / 14 : x > FACE_W - 14 ? (FACE_W - x) / 14 : 1;
    blendPixel(
      canvas,
      W,
      H,
      FACE_X + x,
      FACE_Y + y,
      stylizedFace[o],
      stylizedFace[o + 1],
      stylizedFace[o + 2],
      fx
    );
  }
}

// 2d. Add the real "PIZZETA 3€" A-frame stand sign from PHOTO_GUSTAVO right inside the entrance doorway next to the center black pillar!
// In PHOTO_GUSTAVO (473x1024), the A-frame sign is at x: 332..422, y: 432..648 (90x216)
const AFRAME_W = 86;
const AFRAME_H = 192;
const rawAframe = loadRgba(PHOTO_GUSTAVO, AFRAME_W, AFRAME_H, 'crop=88:212:334:434');
const stylizedAframe = stylizePixar(rawAframe, AFRAME_W, AFRAME_H, 2, 26, 1.25, 1.06);
const AF_X = FACE_X + 558; // right next to the center black pillar inside the open entrance
const AF_Y = FACE_Y + 412;
for (let y = 0; y < AFRAME_H; y++) {
  for (let x = 0; x < AFRAME_W; x++) {
    // The A-frame tilts slightly; mask out outer corners accurately
    const o = (y * AFRAME_W + x) * 4;
    const fx = x < 4 ? x / 4 : x > AFRAME_W - 4 ? (AFRAME_W - x) / 4 : 1;
    const fy = y < 4 ? y / 4 : y > AFRAME_H - 4 ? (AFRAME_H - y) / 4 : 1;
    blendPixel(
      canvas,
      W,
      H,
      AF_X + x,
      AF_Y + y,
      stylizedAframe[o],
      stylizedAframe[o + 1],
      stylizedAframe[o + 2],
      fx * fy
    );
  }
}

// 2e. Build the 3D Architectural Roof on top of the Cube ("stile cubo con un tetto")!
// Roof spans x: 265..1655, y: 78..228
// First: 3D Chimney Stack on the left roof slope (x: 485..560, y: 42..135) with warm wood-fired oven smoke wisps
for (let y = 48; y <= 135; y++) {
  for (let x = 488; x <= 558; x++) {
    const tx = (x - 488) / 70;
    const isSide = tx < 0.22;
    const isCap = y < 60;
    const brickRow = Math.floor((y - 48) / 11);
    const brickCol = Math.floor((x + (brickRow % 2) * 12) / 24);
    const isMortar = (y - 48) % 11 === 0 || (x + (brickRow % 2) * 12) % 24 === 0;
    let r = isCap ? 210 : isMortar ? 155 : 178 + ((brickRow * 7 + brickCol * 13) % 18);
    let g = isCap ? 192 : isMortar ? 140 : 92 + ((brickRow * 5 + brickCol * 11) % 14);
    let b = isCap ? 168 : isMortar ? 124 : 74 + ((brickRow * 3 + brickCol * 7) % 10);
    if (isSide) {
      r *= 0.72;
      g *= 0.72;
      b *= 0.72;
    }
    blendPixel(canvas, W, H, x, y, r, g, b, 1);
  }
}

// Soft warm smoke puffs rising from the chimney (x: 525, y: 12..46)
for (let y = 8; y < 52; y++) {
  for (let x = 495; x < 590; x++) {
    const dy = (48 - y) / 40;
    const cx = 526 + Math.sin(y * 0.18) * 10 + (1 - dy) * 12;
    const rx = 16 + dy * 22;
    const d = Math.abs(x - cx) / rx;
    if (d < 1) {
      const a = Math.pow(1 - d, 2) * (1 - dy * 0.75) * 0.22;
      blendPixel(canvas, W, H, x, y, 245, 228, 210, a);
    }
  }
}

// Second: 3D Hipped Mediterranean Terracotta Tile Roof (y: 88..204)
const ROOF_TOP_Y = 88;
const ROOF_EAVE_Y = 204;
const ROOF_TOP_L = 415;
const ROOF_TOP_R = 1505;
const ROOF_BOT_L = 268;
const ROOF_BOT_R = 1652;

for (let y = ROOF_TOP_Y; y <= ROOF_EAVE_Y; y++) {
  const ty = (y - ROOF_TOP_Y) / (ROOF_EAVE_Y - ROOF_TOP_Y);
  const leftEdge = Math.round(lerp(ROOF_TOP_L, ROOF_BOT_L, ty));
  const rightEdge = Math.round(lerp(ROOF_TOP_R, ROOF_BOT_R, ty));

  // Decorative terracotta ridge cap at top of roof (y: 88..100)
  if (y < ROOF_TOP_Y + 12) {
    for (let x = leftEdge; x <= rightEdge; x++) {
      const ridgeWave = Math.sin((x - leftEdge) * 0.18) * 0.5 + 0.5;
      const r = clamp(212 + ridgeWave * 24);
      const g = clamp(114 + ridgeWave * 18);
      const b = clamp(78 + ridgeWave * 12);
      blendPixel(canvas, W, H, x, y, r, g, b, 1);
    }
    continue;
  }

  // 5 overlapping tiers of 3D curved barrel roof tiles (coppi / tejas)
  const courseIdx = Math.floor(ty * 5.2);
  const courseFrac = (ty * 5.2) - courseIdx;

  for (let x = leftEdge; x <= rightEdge; x++) {
    // 3D perspective radial fan of roof tiles from center X=960
    const relX = (x - 960) / (1 + ty * 0.22);
    const tilePeriod = 34;
    const phase = ((relX % tilePeriod) + tilePeriod) % tilePeriod / tilePeriod; // 0..1 across each barrel tile
    // Cylindrical 3D normal across the barrel tile
    const arch = Math.sin(phase * Math.PI); // 0 at tile valleys, 1 at tile crown

    // Left and right hip bevel shading
    const hipL = leftEdge + 55;
    const hipR = rightEdge - 55;
    const hipFactor = x < hipL ? 0.78 : x > hipR ? 0.72 : 1.0;

    // Course overlap shadow at bottom of each tile row
    const stepShadow = courseFrac > 0.84 ? 0.66 : courseFrac < 0.12 ? 0.84 : 1.0;

    // Alternating warm terracotta hues per tile for handcrafted Pixar look
    const tileId = Math.floor((relX + 2000) / tilePeriod) + courseIdx * 7;
    const hueShift = ((tileId * 17) % 19) - 9;

    const baseR = (176 + hueShift + arch * 48) * hipFactor * stepShadow;
    const baseG = (86 + hueShift * 0.5 + arch * 30) * hipFactor * stepShadow;
    const baseB = (58 + hueShift * 0.3 + arch * 18) * hipFactor * stepShadow;

    blendPixel(canvas, W, H, x, y, baseR, baseG, baseB, 1);
  }
}

// Front semicircular eave tile openings along y = ROOF_EAVE_Y (classic Mediterranean barrel tile eaves!)
for (let x = ROOF_BOT_L + 12; x <= ROOF_BOT_R - 12; x++) {
  const relX = (x - 960) / 1.22;
  const tilePeriod = 34;
  const phase = ((relX % tilePeriod) + tilePeriod) % tilePeriod / tilePeriod;
  const archH = Math.round(Math.sin(phase * Math.PI) * 9);
  for (let dy = -archH; dy <= 3; dy++) {
    const py = ROOF_EAVE_Y + dy;
    if (dy < -archH + 3) {
      // Bright terracotta rim of the barrel tile
      blendPixel(canvas, W, H, x, py, 228, 134, 92, 1);
    } else {
      // Dark shadowed hollow under each barrel tile
      blendPixel(canvas, W, H, x, py, 58, 32, 24, 1);
    }
  }
}

// Third: 3D Architectural Cornice Beam & Fascia Moldings (y: 205..232, x: 274..1646)
for (let y = 205; y <= 232; y++) {
  const indent = y < 214 ? 0 : y < 222 ? 12 : 22;
  for (let x = ROOF_BOT_L + 6 + indent; x <= ROOF_BOT_R - 6 - indent; x++) {
    const isSideL = x < CUBE_LEFT;
    const isSideR = x > CUBE_RIGHT;
    const profile = y < 211 ? 1.05 : y < 215 ? 0.72 : y < 225 ? 0.94 : 0.65;
    const sideShade = isSideL ? 0.75 : isSideR ? 0.7 : 1.0;
    const r = 74 * profile * sideShade;
    const g = 62 * profile * sideShade;
    const b = 54 * profile * sideShade;
    blendPixel(canvas, W, H, x, y, r, g, b, 1);
  }
}

// Warm Architectural Downlights mounted under the 3D Roof Cornice illuminating the white "LA PICCERELLA" top awning!
const downlightXs = [510, 690, 870, 1050, 1230, 1410];
for (const lx of downlightXs) {
  // Small glowing lamp fixture at y = 228
  for (let y = 225; y <= 232; y++) {
    for (let x = lx - 14; x <= lx + 14; x++) {
      const d = Math.abs(x - lx) / 14;
      blendPixel(canvas, W, H, x, y, 255, 242, 195, 1 - d * 0.5);
    }
  }
  // Soft warm golden light scallop cast onto the top white awning (y: 230..335)
  for (let y = 230; y <= 335; y++) {
    const dy = (y - 230) / 105;
    const halfW = 24 + dy * 75;
    for (let x = Math.round(lx - halfW); x <= Math.round(lx + halfW); x++) {
      const dx = Math.abs(x - lx) / halfW;
      const a = Math.pow(1 - dx, 2) * Math.pow(1 - dy, 1.4) * 0.22;
      blendPixel(canvas, W, H, x, y, 255, 224, 150, a);
    }
  }
}

// 2f. 3D Wall Lantern Sconces on the Left & Right Stucco Cube Pillars (x=382, y=418 and x=1538, y=418)
for (const lx of [382, 1538]) {
  // Black iron bracket & lantern cap
  for (let y = 396; y <= 442; y++) {
    for (let x = lx - 14; x <= lx + 14; x++) {
      const dx = Math.abs(x - lx);
      if (y < 406 && dx <= (y - 395) * 1.4) {
        blendPixel(canvas, W, H, x, y, 36, 32, 30, 1);
      } else if (y >= 406 && y <= 434 && dx <= 11) {
        // Warm glowing glass lantern pane
        const isFrame = dx >= 9 || y === 406 || y === 434;
        if (isFrame) {
          blendPixel(canvas, W, H, x, y, 38, 34, 32, 1);
        } else {
          blendPixel(canvas, W, H, x, y, 255, 232, 165, 0.95);
        }
      } else if (y > 434 && dx <= (443 - y) * 1.1) {
        blendPixel(canvas, W, H, x, y, 36, 32, 30, 1);
      }
    }
  }
}

// 2g. 3D Sidewalk Platform & Cobblestone Curb at the bottom of the Cube (y: 872..1080)
for (let y = 872; y < H; y++) {
  const ty = (y - 872) / (H - 872);
  for (let x = 0; x < W; x++) {
    const n = stuccoNoise(x * 0.8, y * 1.2);
    // Perspective sidewalk tile grid lines converging slightly toward X=960
    const perspX = (x - 960) / (0.85 + ty * 0.55);
    const isRowGroove = Math.abs(Math.pow(ty, 0.78) * 7 - Math.round(Math.pow(ty, 0.78) * 7)) < 0.045;
    const isColGroove = Math.abs(((perspX % 95) + 95) % 95) < 3.2;
    const isCurbEdge = y >= 995 && y <= 1014;
    const isStreet = y > 1014;

    let r = isStreet ? 42 : isCurbEdge ? 142 : 118;
    let g = isStreet ? 40 : isCurbEdge ? 136 : 114;
    let b = isStreet ? 44 : isCurbEdge ? 130 : 110;

    if (!isStreet && !isCurbEdge && (isRowGroove || isColGroove)) {
      r *= 0.74;
      g *= 0.74;
      b *= 0.74;
    }

    r += n;
    g += n;
    b += n;

    // Warm golden light spill on the sidewalk from the open right entrance (x: 990..1460) and left kitchen window (x: 470..930)
    const doorDist = Math.abs(x - 1210) / 280;
    if (doorDist < 1 && !isStreet) {
      const spill = Math.pow(1 - doorDist, 1.6) * Math.max(0, 1 - ty * 1.15) * 0.52;
      r += spill * 115;
      g += spill * 78;
      b += spill * 28;
    }
    const winDist = Math.abs(x - 700) / 260;
    if (winDist < 1 && !isStreet) {
      const spill = Math.pow(1 - winDist, 1.6) * Math.max(0, 1 - ty * 1.3) * 0.28;
      r += spill * 85;
      g += spill * 58;
      b += spill * 22;
    }

    // Soft contact shadow right along the base of the cube (y: 872..888)
    if (y < 890 && x >= CUBE_SIDE_L && x <= CUBE_SIDE_R) {
      const sh = (y - 872) / 18;
      r *= 0.55 + 0.45 * sh;
      g *= 0.55 + 0.45 * sh;
      b *= 0.55 + 0.45 * sh;
    }

    blendPixel(canvas, W, H, x, y, r, g, b, 1);
  }
}

// 2h. 3D Terracotta Planter Boxes with Mediterranean Olive/Basil Foliage flanking the left and right cube pillars
// Left planter: x: 285..405, y: 745..884; Right planter: x: 1515..1635, y: 745..884
for (const pxCenter of [348, 1572]) {
  // Foliage bush cluster (y: 725..810)
  const leafSpheres = [
    { dx: 0, dy: -28, r: 36, c: [68, 118, 52] },
    { dx: -26, dy: -14, r: 30, c: [56, 102, 44] },
    { dx: 26, dy: -12, r: 30, c: [76, 128, 58] },
    { dx: -14, dy: -38, r: 26, c: [82, 136, 62] },
    { dx: 16, dy: -36, r: 25, c: [64, 112, 48] },
  ];
  const baseFoliageY = 805;
  for (const sp of leafSpheres) {
    const cx = pxCenter + sp.dx;
    const cy = baseFoliageY + sp.dy;
    for (let y = cy - sp.r; y <= cy + sp.r; y++) {
      for (let x = cx - sp.r; x <= cx + sp.r; x++) {
        const d = Math.hypot(x - cx, y - cy) / sp.r;
        if (d <= 1) {
          // 3D sphere normal shading (warm light from upper inner storefront)
          const nx = (x - cx) / sp.r;
          const ny = (y - cy) / sp.r;
          const lightDirX = pxCenter < 960 ? 0.45 : -0.45;
          const light = Math.max(0.42, 0.78 + nx * lightDirX - ny * 0.45);
          const n = stuccoNoise(x * 2, y * 2) * 1.4;
          blendPixel(
            canvas,
            W,
            H,
            x,
            y,
            (sp.c[0] + n) * light,
            (sp.c[1] + n) * light,
            (sp.c[2] + n) * light,
            d > 0.88 ? (1 - d) / 0.12 : 1
          );
        }
      }
    }
  }

  // 3D Terracotta Planter Pot (y: 802..884)
  for (let y = 802; y <= 884; y++) {
    const ty = (y - 802) / 82;
    const halfW = y < 816 ? 50 : Math.round(lerp(46, 38, ty));
    for (let x = pxCenter - halfW; x <= pxCenter + halfW; x++) {
      const nx = (x - pxCenter) / halfW;
      const cylShade = 0.72 + 0.34 * Math.cos(nx * 1.3);
      const rimShadow = y >= 816 && y <= 821 ? 0.68 : 1.0;
      const r = 184 * cylShade * rimShadow;
      const g = 96 * cylShade * rimShadow;
      const b = 64 * cylShade * rimShadow;
      blendPixel(canvas, W, H, x, y, r, g, b, 1);
    }
  }
}

// Save the clean 3D Cube Storefront image (Gustavo is rendered as an articulated 3D Disney/Pixar character right inside the left kitchen window in HeroStory.tsx!)
saveWebp(canvas, W, H, path.join(IMG_DIR, 'hero-storefront-cube-v3.webp'), 90);
saveWebp(canvas, W, H, path.join(IMG_DIR, 'hero-storefront-3d-v2.webp'), 90);

// 4. Also create a matching stylized 3D interior zoom target (hero-interior-cube-v3.webp)
// that zooms cleanly into the real warm lime-green brick & wooden bar entrance of La Piccerella!
const rawInteriorZoom = loadRgba(PHOTO_CLEAN_RIGHT, W, H, 'crop=540:304:410:255');
const stylizedInterior = stylizePixar(rawInteriorZoom, W, H, 3, 28, 1.24, 1.08);
saveWebp(stylizedInterior, W, H, path.join(IMG_DIR, 'hero-interior-cube-v3.webp'), 88);

console.log('Successfully generated hero-storefront-cube-v3.webp and hero-interior-cube-v3.webp!');
