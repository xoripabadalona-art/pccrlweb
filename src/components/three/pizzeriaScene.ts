/**
 * Real-time 3D diorama of the La Piccerella storefront (Carrer de Mar, 127),
 * modelled after the client's photos: white fascia with the round logo, black
 * metal frame, serving window with the "Porció Margarita" banner on the left,
 * open doorway onto the lime-green dining room on the right — finished as a
 * toy-like cube with a terracotta roof. Gustavo stands at the window, waving.
 *
 * Plain three.js, no React: the hero component owns the canvas and drives
 * `setProgress` from scroll.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface PizzeriaSceneOptions {
  /** false → render a single still frame (prefers-reduced-motion) */
  animate: boolean;
  onReady?: () => void;
  /** Called every rendered frame with the CSS-pixel position just above Gustavo's head */
  onAnchor?: (x: number, y: number) => void;
}

export interface PizzeriaSceneHandle {
  /** 0 = whole diorama, 1 = close-up on Gustavo at the window */
  setProgress: (p: number) => void;
  /** Pointer position, each axis in [-0.5, 0.5] */
  setPointer: (x: number, y: number) => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

// ── Building dimensions (metres-ish). x → right, y → up, z → towards viewer ──
const W = 6.4;
const H = 3.9;
const D = 5.2;
const T = 0.2;
const FRONT = D / 2;
const OPEN_TOP = 2.61;
const COUNTER_Y = 1.09;
const GUSTAVO_X = -1.37;

const C = {
  stone: 0xc9b9a2,
  stoneDark: 0x9f9282,
  fascia: 0xf7f3ea,
  frame: 0x1f1f23,
  green: 0x9ab433,
  wood: 0xb8834f,
  woodDark: 0x8a5a33,
  steel: 0xc9ced4,
  terracotta: 0xc8643c,
  terracottaDark: 0x9c4a2c,
  skin: 0xecb690,
  skinWarm: 0xe2a184,
  shirt: 0x252c40,
  hair: 0xd3cec6,
  leaf: 0x4f7d3b,
};

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function canvasTexture(w: number, h: number, draw: Draw): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function redraw(tex: THREE.CanvasTexture, draw: Draw) {
  const canvas = tex.image as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  tex.needsUpdate = true;
}

function std(color: number, opts: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...opts });
}

function shadowed<T extends THREE.Object3D>(obj: T, cast = true, receive = true): T {
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
  return obj;
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material | THREE.Material[],
  x: number,
  y: number,
  z: number,
  radius = 0.03
): THREE.Mesh {
  const r = Math.min(radius, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const geo =
    r > 0.004 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Capsule limb between two points */
function limb(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len, 6, 16), material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function ball(radius: number, material: THREE.Material, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material);
  mesh.scale.set(sx, sy, sz);
  return mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// Textures drawn in code (crisp at any size, no extra downloads)
// ─────────────────────────────────────────────────────────────────────────────

const SERIF = 'Georgia, "Times New Roman", serif';

function drawLogoDisc(logo?: HTMLImageElement): Draw {
  return (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    if (logo) {
      ctx.drawImage(logo, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#f7f3ea';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

function drawBanner(logo?: HTMLImageElement): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = '#fbf8f1';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 5;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, w - 52, h - 52);

    const logoSize = h - 96;
    if (logo) ctx.drawImage(logo, 54, 48, logoSize, logoSize);

    const cx = 54 + logoSize + (w - 54 - logoSize - 40) / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#b3261e';
    ctx.font = `600 24px ${SERIF}`;
    ctx.fillText('P I Z Z E R I A   A R T E S A N A L', cx, 78);

    ctx.fillStyle = '#1c1c1c';
    ctx.font = `700 54px ${SERIF}`;
    ctx.fillText('PORCIÓ MARGARITA', cx, 138);

    ctx.fillStyle = '#b3261e';
    ctx.font = `700 86px ${SERIF}`;
    ctx.fillText('3 €', cx - 70, 224);
    ctx.fillStyle = '#3a3a3a';
    ctx.font = `italic 26px ${SERIF}`;
    ctx.fillText('1/4 de pizza', cx + 110, 208);

    ctx.fillStyle = '#1c1c1c';
    ctx.font = `600 34px ${SERIF}`;
    ctx.fillText('Més de 15 sabors', cx, 274);

    ctx.fillStyle = '#b3261e';
    ctx.font = `600 24px ${SERIF}`;
    ctx.fillText('Margarita sencera 9,50 €', cx, 310);

    ctx.fillStyle = '#5a5046';
    ctx.font = `italic 25px ${SERIF}`;
    ctx.fillText('Tradició, qualitat i sabor', cx, 352);
  };
}

function drawPizza(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = '#d9a35c';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9b23f';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.84, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b3261e';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const rr = i % 2 ? r * 0.5 : r * 0.28;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
}

const drawAFrame: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#fbf8f1';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1f1f23';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1c1c';
  ctx.font = `700 50px ${SERIF}`;
  ctx.fillText('PIZZETA', w / 2, 86);
  ctx.fillStyle = '#b3261e';
  ctx.font = `700 110px ${SERIF}`;
  ctx.fillText('3€', w / 2 - 44, 250);
  drawPizza(ctx, w / 2 + 62, 290, 56);
  ctx.fillStyle = '#5a5046';
  ctx.font = `italic 24px ${SERIF}`;
  ctx.fillText('Al moment', w / 2, h - 36);
};

const drawTv: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(0, 0, w, h);
  drawPizza(ctx, w * 0.68, h * 0.52, h * 0.36);
  ctx.fillStyle = '#1c1c1c';
  ctx.textAlign = 'left';
  ctx.font = `700 40px ${SERIF}`;
  ctx.fillText('Pizzes', 30, 90);
  ctx.fillStyle = '#b3261e';
  ctx.font = `600 26px ${SERIF}`;
  ctx.fillText('artesanals', 30, 128);
  ctx.fillStyle = '#8a8076';
  for (let i = 0; i < 4; i++) ctx.fillRect(30, 160 + i * 26, 130 - i * 14, 8);
};

const drawWood: Draw = (ctx, w, h) => {
  const plank = w / 8;
  for (let i = 0; i < 8; i++) {
    const shade = 150 + Math.round(Math.sin(i * 12.9898) * 12);
    ctx.fillStyle = `rgb(${shade + 34}, ${shade - 22}, ${shade - 72})`;
    ctx.fillRect(i * plank, 0, plank, h);
    ctx.fillStyle = 'rgba(70, 40, 20, 0.35)';
    ctx.fillRect(i * plank, 0, 2, h);
    const joint = ((i * 197) % 400) + 40;
    ctx.fillRect(i * plank, joint, plank, 2);
  }
};

const drawGreenBrick: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#93ab30';
  ctx.fillRect(0, 0, w, h);
  const bh = h / 12;
  const bw = w / 5;
  for (let row = 0; row < 12; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let col = -1; col < 6; col++) {
      const tint = 6 * Math.sin(row * 7.1 + col * 3.7);
      ctx.fillStyle = `rgb(${169 + tint}, ${193 + tint}, ${60 + tint})`;
      ctx.fillRect(col * bw + off + 2, row * bh + 2, bw - 4, bh - 4);
    }
  }
};

const drawPaving: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#77736d';
  ctx.fillRect(0, 0, w, h);
  const s = w / 4;
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? s / 2 : 0;
    for (let col = -1; col < 5; col++) {
      const tint = 7 * Math.sin(row * 5.3 + col * 9.1);
      ctx.fillStyle = `rgb(${150 + tint}, ${146 + tint}, ${140 + tint})`;
      ctx.fillRect(col * s + off + 3, row * s + 3, s - 6, s - 6);
    }
  }
};

const drawPuff: Draw = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const drawShadowBlob: Draw = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.6)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

// ─────────────────────────────────────────────────────────────────────────────
// Gustavo
// ─────────────────────────────────────────────────────────────────────────────

interface GustavoRig {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  eyes: THREE.Group;
  waveShoulder: THREE.Group;
  waveElbow: THREE.Group;
  waveHand: THREE.Group;
  peelArm: THREE.Group;
}

function createGustavo(): GustavoRig {
  const skin = std(C.skin, { roughness: 0.55 });
  const skinWarm = std(C.skinWarm, { roughness: 0.55 });
  const shirt = std(C.shirt, { roughness: 0.9 });
  const hair = std(C.hair, { roughness: 0.95 });
  const dark = std(0x3a2418, { roughness: 0.4 });
  const white = std(0xffffff, { roughness: 0.25 });

  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  // Torso + shoulders: one soft rounded mass in a navy t-shirt
  const torso = ball(1, shirt, 0.41, 0.56, 0.32);
  torso.position.y = 1.3;
  body.add(torso);
  const shoulders = limb(
    new THREE.Vector3(-0.27, 1.63, 0),
    new THREE.Vector3(0.27, 1.63, 0),
    0.16,
    shirt
  );
  body.add(shoulders);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 20), skin);
  neck.position.y = 1.8;
  body.add(neck);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.032, 10, 28), shirt);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.75;
  body.add(collar);

  // ── Head ──
  const head = new THREE.Group();
  head.position.set(0, 2.1, 0.03);
  body.add(head);

  head.add(ball(0.34, skin, 1, 1.05, 1));
  const jaw = ball(0.3, skin, 1.07, 0.8, 0.98);
  jaw.position.set(0, -0.11, 0.02);
  head.add(jaw);

  for (const side of [-1, 1]) {
    const ear = ball(0.09, skinWarm, 0.45, 1, 0.75);
    ear.position.set(side * 0.335, -0.02, 0);
    head.add(ear);

    const cheek = ball(0.075, skinWarm, 1, 0.72, 0.5);
    cheek.position.set(side * 0.2, -0.09, 0.235);
    head.add(cheek);

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.021, 0.1, 4, 10), hair);
    brow.position.set(side * 0.128, 0.185, 0.3);
    brow.rotation.z = Math.PI / 2 - side * 0.22;
    head.add(brow);
  }

  const eyes = new THREE.Group();
  eyes.position.set(0, 0.055, 0);
  head.add(eyes);
  for (const side of [-1, 1]) {
    const eyeWhite = ball(0.074, white, 1, 1.12, 0.6);
    eyeWhite.position.set(side * 0.122, 0, 0.292);
    eyes.add(eyeWhite);
    const pupil = ball(0.04, dark, 1, 1, 0.6);
    pupil.position.set(side * 0.116, -0.006, 0.325);
    eyes.add(pupil);
    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    glint.position.set(side * 0.116 + 0.015, 0.012, 0.35);
    eyes.add(glint);
  }

  const nose = ball(0.066, skinWarm, 1.05, 0.9, 1);
  nose.position.set(0, -0.045, 0.335);
  head.add(nose);

  // Smile: lower arc of a torus, hugging the face
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.108, 0.017, 10, 28, Math.PI * 0.64),
    std(0x6b2f27, { roughness: 0.5 })
  );
  smile.rotation.set(0.12, 0, Math.PI * 1.18);
  smile.position.set(0, -0.1, 0.292);
  head.add(smile);

  // Short grey hair around the back and sides (bald on top)
  const fringe = new THREE.Mesh(
    new THREE.TorusGeometry(0.325, 0.055, 10, 36, Math.PI * 1.3),
    hair
  );
  fringe.rotation.set(Math.PI / 2, 0, Math.PI * 0.85);
  fringe.position.y = -0.04;
  head.add(fringe);

  // ── Waving arm (his left, viewer's right) ──
  const waveShoulder = new THREE.Group();
  waveShoulder.position.set(0.4, 1.66, 0);
  waveShoulder.rotation.z = -1.0;
  body.add(waveShoulder);
  const sleeveL = new THREE.Mesh(new THREE.CapsuleGeometry(0.118, 0.14, 6, 16), shirt);
  sleeveL.position.y = 0.1;
  waveShoulder.add(sleeveL);
  const upperL = new THREE.Mesh(new THREE.CapsuleGeometry(0.086, 0.24, 6, 16), skin);
  upperL.position.y = 0.28;
  waveShoulder.add(upperL);

  const waveElbow = new THREE.Group();
  waveElbow.position.y = 0.44;
  waveElbow.rotation.z = 0.9;
  waveShoulder.add(waveElbow);
  const foreL = new THREE.Mesh(new THREE.CapsuleGeometry(0.073, 0.26, 6, 16), skin);
  foreL.position.y = 0.17;
  waveElbow.add(foreL);

  const waveHand = new THREE.Group();
  waveHand.position.y = 0.4;
  waveElbow.add(waveHand);
  waveHand.add(ball(1, skin, 0.105, 0.115, 0.05));
  for (let i = 0; i < 4; i++) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.075, 4, 10), skin);
    const spread = (i - 1.5) * 0.19;
    finger.position.set(Math.sin(spread) * 0.16 + (i - 1.5) * 0.012, 0.135 - Math.abs(i - 1.5) * 0.012, 0);
    finger.rotation.z = -spread;
    waveHand.add(finger);
  }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.06, 4, 10), skin);
  thumb.position.set(-0.115, 0.02, 0);
  thumb.rotation.z = 0.95;
  waveHand.add(thumb);

  // ── Peel arm (his right, viewer's left) ──
  const peelArm = new THREE.Group();
  body.add(peelArm);
  const S = new THREE.Vector3(-0.4, 1.64, 0);
  const E = new THREE.Vector3(-0.68, 1.3, 0.06);
  const Hd = new THREE.Vector3(-0.72, 1.57, 0.24);
  const sleeveEnd = S.clone().lerp(E, 0.42);
  peelArm.add(limb(S, sleeveEnd, 0.118, shirt));
  peelArm.add(limb(sleeveEnd, E, 0.086, skin));
  peelArm.add(limb(E, Hd, 0.073, skin));
  const grip = ball(0.088, skin, 1, 0.9, 1);
  grip.position.copy(Hd);
  peelArm.add(grip);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 1.1, 14),
    std(0xc99a62, { roughness: 0.6 })
  );
  handle.position.set(Hd.x, 1.47, Hd.z + 0.02);
  peelArm.add(handle);
  const bladeShape = new THREE.Shape();
  const bw = 0.21;
  const bh = 0.26;
  const br = 0.09;
  bladeShape.moveTo(-bw, -bh);
  bladeShape.lineTo(bw, -bh);
  bladeShape.lineTo(bw, bh - br);
  bladeShape.quadraticCurveTo(bw, bh, bw - br, bh);
  bladeShape.lineTo(-bw + br, bh);
  bladeShape.quadraticCurveTo(-bw, bh, -bw, bh - br);
  bladeShape.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 2,
    }),
    std(0xcfd5db, { roughness: 0.38, metalness: 0.8 })
  );
  blade.position.set(Hd.x, 2.24, Hd.z + 0.011);
  peelArm.add(blade);
  const bladeNeck = box(0.09, 0.1, 0.03, std(0xdfe3e7, { roughness: 0.32, metalness: 0.75 }), Hd.x, 1.98, Hd.z + 0.02, 0.01);
  peelArm.add(bladeNeck);

  shadowed(group);
  return { group, body, head, eyes, waveShoulder, waveElbow, waveHand, peelArm };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────────────────────────────────────

export function createPizzeriaScene(
  canvas: HTMLCanvasElement,
  options: PizzeriaSceneOptions
): PizzeriaSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.42;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 120);

  const disposables: { dispose: () => void }[] = [envTarget, pmrem];
  const tex = <T extends THREE.Texture>(t: T) => {
    disposables.push(t);
    return t;
  };

  // ── Lights ──
  scene.add(new THREE.HemisphereLight(0xd6e4ff, 0x8a6b4f, 0.5));

  const sun = new THREE.DirectionalLight(0xffe0bd, 2.0);
  sun.position.set(-5.5, 7.5, 11);
  sun.target.position.set(0, 1.5, 0);
  sun.castShadow = true;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -4;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 5;
  scene.add(sun, sun.target);

  const rim = new THREE.DirectionalLight(0x9fb8ff, 0.7);
  rim.position.set(8, 6, -6);
  scene.add(rim);

  // Warm interior glow
  const kitchenLight = new THREE.PointLight(0xffd2a0, 7, 9, 2);
  kitchenLight.position.set(-1.5, 2.55, 1.2);
  const diningLight = new THREE.PointLight(0xffc98a, 8, 10, 2);
  diningLight.position.set(1.5, 2.5, 0.2);
  scene.add(kitchenLight, diningLight);

  // Soft key on Gustavo so his face always reads
  const faceLight = new THREE.SpotLight(0xfff1e0, 9, 8, 0.5, 0.8, 1.6);
  faceLight.position.set(GUSTAVO_X + 0.6, 2.9, FRONT + 2.6);
  faceLight.target.position.set(GUSTAVO_X, 1.9, FRONT - 0.6);
  scene.add(faceLight, faceLight.target);

  // ── Materials ──
  const mStone = std(C.stone, { roughness: 0.95 });
  const mStoneDark = std(C.stoneDark, { roughness: 0.95 });
  const mFascia = std(C.fascia, { roughness: 0.7 });
  const mFrame = std(C.frame, { roughness: 0.45, metalness: 0.35 });
  const mGreen = std(C.green, { roughness: 0.9 });
  const mSteel = std(C.steel, { roughness: 0.28, metalness: 0.85 });
  const mWhite = std(0xf2efe8, { roughness: 0.6 });
  const mWood = std(C.wood, { roughness: 0.7 });
  const mWoodDark = std(C.woodDark, { roughness: 0.7 });

  const woodTex = tex(canvasTexture(512, 512, drawWood));
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
  woodTex.repeat.set(3, 3);
  const mFloor = std(0xffffff, { map: woodTex, roughness: 0.55 });

  const brickTex = tex(canvasTexture(512, 512, drawGreenBrick));
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  brickTex.repeat.set(3, 2);
  const mGreenBrick = std(0xffffff, { map: brickTex, roughness: 0.9 });

  const pavingTex = tex(canvasTexture(512, 512, drawPaving));
  pavingTex.wrapS = pavingTex.wrapT = THREE.RepeatWrapping;
  pavingTex.repeat.set(5.5, 4.8);
  const mPaving = std(0xffffff, { map: pavingTex, roughness: 0.92 });
  const mEarth = std(0x2c221c, { roughness: 0.95 });

  const logoTex = tex(canvasTexture(512, 512, drawLogoDisc()));
  const bannerTex = tex(canvasTexture(1024, 400, drawBanner()));
  const aFrameTex = tex(canvasTexture(320, 420, drawAFrame));
  const tvTex = tex(canvasTexture(512, 300, drawTv));

  const logoImg = new Image();
  logoImg.decoding = 'async';
  logoImg.onload = () => {
    redraw(logoTex, drawLogoDisc(logoImg));
    redraw(bannerTex, drawBanner(logoImg));
    if (!options.animate) renderFrame();
  };
  logoImg.src = '/brand/logo.png';

  const world = new THREE.Group();
  scene.add(world);

  // ── Diorama base ──
  const base = box(
    8.8,
    0.5,
    7.7,
    [mEarth, mEarth, mPaving, mEarth, mEarth, mEarth],
    0,
    -0.25,
    0.5,
    0.1
  );
  world.add(base);

  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 12),
    new THREE.MeshBasicMaterial({
      map: tex(canvasTexture(256, 256, drawShadowBlob)),
      transparent: true,
      depthWrite: false,
    })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(0, -0.56, 0.55);
  world.add(blob);

  // ── Shell: floor, walls, ceiling ──
  world.add(box(W - 0.2, 0.12, D - 0.2, mFloor, 0, 0.06, 0, 0));
  world.add(
    box(W, H, T, [mStone, mStone, mStone, mStone, mGreen, mStone], 0, H / 2, -FRONT + T / 2, 0.02)
  );
  world.add(
    box(T, H, D, [mGreen, mStone, mStone, mStone, mStone, mStone], -W / 2 + T / 2, H / 2, 0, 0.02)
  );
  world.add(
    box(T, H, D, [mStone, mGreenBrick, mStone, mStone, mStone, mStone], W / 2 - T / 2, H / 2, 0, 0.02)
  );
  world.add(box(W - 0.3, 0.12, D - 0.3, mWhite, 0, 2.98, 0, 0));
  // Plinth band around the building
  world.add(box(0.07, 0.34, D + 0.08, mStoneDark, -W / 2 - 0.02, 0.17, 0, 0.02));
  world.add(box(0.07, 0.34, D + 0.08, mStoneDark, W / 2 + 0.02, 0.17, 0, 0.02));
  world.add(box(W + 0.08, 0.34, 0.07, mStoneDark, 0, 0.17, -FRONT - 0.02, 0.02));

  // ── Front facade ──
  const zF = FRONT - T / 2;
  world.add(box(0.47, H, T + 0.06, mStone, -W / 2 + 0.235, H / 2, zF, 0.04));
  world.add(box(0.47, H, T + 0.06, mStone, W / 2 - 0.235, H / 2, zF, 0.04));
  world.add(box(W - 0.9, H - 2.72, T, mStone, 0, (H + 2.72) / 2, zF, 0.02));

  // White fascia with the round logo, exactly like the real shopfront
  const fasciaZ = FRONT + 0.1;
  world.add(box(5.72, 0.82, 0.24, mFascia, 0, 3.13, fasciaZ, 0.05));
  const logoDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.36, 48),
    new THREE.MeshStandardMaterial({ map: logoTex, transparent: true, roughness: 0.6 })
  );
  logoDisc.position.set(0, 3.13, fasciaZ + 0.123);
  world.add(logoDisc);

  // Black metal frame
  const frameZ = FRONT - 0.06;
  world.add(box(5.5, 0.14, 0.28, mFrame, 0, OPEN_TOP + 0.07, frameZ, 0.02));
  world.add(box(0.14, OPEN_TOP + 0.14, 0.28, mFrame, -2.68, (OPEN_TOP + 0.14) / 2, frameZ, 0.02));
  world.add(box(0.14, OPEN_TOP + 0.14, 0.28, mFrame, 2.68, (OPEN_TOP + 0.14) / 2, frameZ, 0.02));
  world.add(box(0.16, OPEN_TOP, 0.28, mFrame, -0.06, OPEN_TOP / 2, frameZ, 0.02));

  // Folded security shutters at both sides
  for (const side of [-1, 1]) {
    const shutter = box(0.07, 2.5, 0.55, mFrame, side * 2.83, 1.3, FRONT + 0.3, 0.01);
    shutter.rotation.y = side * -0.22;
    world.add(shutter);
  }

  // Serving window: banner panel + white counter
  world.add(box(2.5, 0.95, 0.16, mFrame, GUSTAVO_X, 0.57, frameZ + 0.02, 0.02));
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.8),
    new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.7 })
  );
  banner.position.set(GUSTAVO_X, 0.57, frameZ + 0.105);
  banner.receiveShadow = true;
  world.add(banner);
  world.add(box(2.62, 0.09, 0.66, mWhite, GUSTAVO_X, COUNTER_Y, FRONT + 0.04, 0.035));

  // A couple of pizza boxes on the counter
  const mBox = std(0xf4efe6, { roughness: 0.8 });
  for (let i = 0; i < 3; i++) {
    const pb = box(0.52, 0.055, 0.52, mBox, -2.2 + (i % 2) * 0.012, COUNTER_Y + 0.075 + i * 0.058, FRONT + 0.02, 0.012);
    pb.rotation.y = (i - 1) * 0.06;
    world.add(pb);
  }

  // Doorstep, mat and the glass leaf
  world.add(box(5.5, 0.12, 0.62, mStoneDark, 0, 0.06, FRONT + 0.25, 0.03));
  world.add(box(1.25, 0.025, 0.5, std(0x2b2b2e, { roughness: 1 }), 0.95, 0.13, FRONT + 0.22, 0.01));
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.08, 2.42, 0.03),
    new THREE.MeshStandardMaterial({
      color: 0xd6eef0,
      transparent: true,
      opacity: 0.16,
      roughness: 0.04,
      metalness: 0.1,
      envMapIntensity: 2.2,
      depthWrite: false,
    })
  );
  glass.position.set(2.04, 1.36, frameZ);
  world.add(glass);
  world.add(box(0.04, 2.42, 0.05, mFrame, 1.5, 1.36, frameZ, 0));

  // ── Interior ──
  // Kitchen run along the left wall, oven, hood
  world.add(box(0.85, 0.98, 3.4, mSteel, -2.6, 0.61, -0.3, 0.03));
  const oven = box(0.8, 0.72, 1.05, std(0x3a3d42, { roughness: 0.4, metalness: 0.7 }), -2.6, 1.47, -1.25, 0.04);
  world.add(oven);
  const ovenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.36),
    new THREE.MeshStandardMaterial({ color: 0x1a0d06, emissive: 0xff7a1f, emissiveIntensity: 1.9 })
  );
  ovenGlow.rotation.y = Math.PI / 2;
  ovenGlow.position.set(-2.195, 1.45, -1.25);
  world.add(ovenGlow);
  const mKraft = std(0xcaa878, { roughness: 0.85 });
  for (let i = 0; i < 9; i++) {
    const pb = box(0.5, 0.05, 0.5, i % 3 === 2 ? mBox : mKraft, -2.6, 1.13 + i * 0.053, 0.35, 0.01);
    pb.rotation.y = Math.sin(i * 2.3) * 0.08;
    world.add(pb);
  }

  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 1.0, 0.5, 4, 1), mSteel);
  hood.rotation.y = Math.PI / 4;
  hood.scale.set(0.95, 1, 1.7);
  hood.position.set(-2.2, 2.42, -0.5);
  shadowed(hood);
  world.add(hood);
  world.add(box(1.36, 0.12, 2.42, mSteel, -2.2, 2.13, -0.5, 0.02));
  const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 20), mSteel);
  duct.position.set(-2.2, 2.82, -0.5);
  world.add(duct);

  // Back wall: door + menu screen
  world.add(box(0.92, 2.05, 0.06, mWhite, 1.55, 1.15, -FRONT + T + 0.03, 0.02));
  world.add(box(1.3, 0.78, 0.07, mFrame, -0.55, 2.0, -FRONT + T + 0.035, 0.02));
  const tv = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.68),
    new THREE.MeshStandardMaterial({ map: tvTex, emissive: 0xffffff, emissiveMap: tvTex, emissiveIntensity: 0.55 })
  );
  tv.position.set(-0.55, 2.0, -FRONT + T + 0.075);
  world.add(tv);

  // Bar with slatted wood front, white top, beer tap and stools
  world.add(box(0.5, 1.02, 2.9, mWoodDark, 0.3, 0.63, -0.55, 0.03));
  for (let i = 0; i < 12; i++) {
    world.add(box(0.03, 0.9, 0.16, mWood, 0.565, 0.63, -1.87 + i * 0.24, 0.01));
  }
  world.add(box(0.68, 0.07, 3.05, mWhite, 0.32, 1.17, -0.55, 0.03));
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.46, 18), mSteel);
  tap.position.set(0.3, 1.44, 0.55);
  world.add(tap);
  world.add(box(0.2, 0.09, 0.12, mSteel, 0.3, 1.7, 0.55, 0.03));

  for (const z of [-0.1, -1.05]) {
    const stool = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.07, 24), mWood);
    seat.position.y = 0.82;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12), mFrame);
    post.position.y = 0.47;
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 24), mFrame);
    foot.position.y = 0.135;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 24), mFrame);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.42;
    stool.add(seat, post, foot, ring);
    stool.position.set(1.12, 0, z);
    world.add(shadowed(stool));
  }

  // Right wall: framed prints and the red neon ring
  for (let i = 0; i < 3; i++) {
    world.add(box(0.04, 0.42, 0.32, mFrame, W / 2 - T - 0.02, 1.75, -0.2 - i * 0.48, 0.01));
    world.add(box(0.045, 0.34, 0.24, mWhite, W / 2 - T - 0.022, 1.75, -0.2 - i * 0.48, 0));
  }
  const neon = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.022, 10, 40),
    new THREE.MeshStandardMaterial({ color: 0xff3b2f, emissive: 0xff2a1a, emissiveIntensity: 3 })
  );
  neon.rotation.y = Math.PI / 2;
  neon.position.set(W / 2 - T - 0.04, 2.0, 0.85);
  world.add(neon);

  // Pendant lamps over the bar
  const mShade = std(0x26211d, { roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide });
  const mBulb = new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffc77a, emissiveIntensity: 3.2 });
  for (const z of [0.55, -0.55, -1.65]) {
    const lamp = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 6), mFrame);
    cord.position.y = 0.38;
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 0.2, 28, 1, true), mShade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 12), mBulb);
    bulb.position.y = -0.07;
    lamp.add(cord, shade, bulb);
    lamp.position.set(0.9, 2.3, z);
    world.add(lamp);
  }
  // Recessed ceiling spots
  for (const [x, z] of [
    [-1.9, 1.5],
    [-0.9, 1.5],
    [-1.9, 0.2],
    [1.6, 1.2],
    [2.3, -0.4],
  ] as const) {
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), mBulb);
    spot.rotation.x = Math.PI / 2;
    spot.position.set(x, 2.915, z);
    world.add(spot);
  }

  // ── Gustavo ──
  const gustavo = createGustavo();
  gustavo.group.scale.setScalar(0.94);
  gustavo.group.position.set(GUSTAVO_X, 0.12, FRONT - 0.62);
  world.add(gustavo.group);

  // ── Roof ──
  const pitch = Math.atan(0.5);
  const overhang = 0.45;
  const halfSpan = FRONT + overhang;
  const slopeLen = halfSpan / Math.cos(pitch);
  const ridgeY = H + 0.5 * FRONT;
  const roofW = W + 0.9;

  const mRoofSlab = std(C.terracottaDark, { roughness: 0.9 });
  const mTile = std(0xffffff, { roughness: 0.75, side: THREE.DoubleSide });

  const tileGeo = new THREE.CylinderGeometry(0.14, 0.118, 0.66, 9, 1, true, 0, Math.PI);
  tileGeo.rotateZ(Math.PI / 2);
  tileGeo.rotateY(Math.PI / 2);
  disposables.push(tileGeo);

  const cols = Math.floor(roofW / 0.27);
  const rows = Math.ceil(slopeLen / 0.56);
  const tileColor = new THREE.Color();
  const tileMatrix = new THREE.Object3D();

  for (const side of [0, 1]) {
    const pivot = new THREE.Group();
    pivot.rotation.y = side * Math.PI;
    const slope = new THREE.Group();
    slope.position.set(0, ridgeY - 0.5 * (halfSpan / 2) + 0.07, halfSpan / 2);
    slope.rotation.x = pitch;
    pivot.add(slope);
    world.add(pivot);

    slope.add(box(roofW, 0.14, slopeLen + 0.06, mRoofSlab, 0, 0, 0, 0.03));

    const tiles = new THREE.InstancedMesh(tileGeo, mTile, cols * rows);
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tileMatrix.position.set(
          -roofW / 2 + 0.16 + c * ((roofW - 0.32) / (cols - 1)),
          0.085 + (r % 2) * 0.004,
          -slopeLen / 2 + 0.34 + r * ((slopeLen - 0.66) / (rows - 1))
        );
        tileMatrix.rotation.set(-0.045, 0, 0);
        tileMatrix.updateMatrix();
        tiles.setMatrixAt(n, tileMatrix.matrix);
        const v = Math.sin(c * 12.9898 + r * 78.233 + side * 37.7) * 43758.5453;
        const rnd = v - Math.floor(v);
        tileColor.setHex(C.terracotta).offsetHSL((rnd - 0.5) * 0.025, 0, (rnd - 0.5) * 0.11);
        tiles.setColorAt(n, tileColor);
        n++;
      }
    }
    tiles.instanceMatrix.needsUpdate = true;
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    tiles.castShadow = true;
    tiles.receiveShadow = true;
    slope.add(tiles);
  }

  const ridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, roofW + 0.04, 16),
    std(C.terracottaDark, { roughness: 0.8 })
  );
  ridge.rotation.z = Math.PI / 2;
  ridge.position.y = ridgeY + 0.13;
  shadowed(ridge);
  world.add(ridge);

  // Gable ends
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-FRONT, 0);
  gableShape.lineTo(FRONT, 0);
  gableShape.lineTo(0, 0.5 * FRONT);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: T, bevelEnabled: false });
  disposables.push(gableGeo);
  for (const side of [-1, 1]) {
    const gable = new THREE.Mesh(gableGeo, mStone);
    gable.rotation.y = Math.PI / 2;
    gable.position.set(side * (W / 2 - T / 2) - T / 2, H - 0.01, 0);
    shadowed(gable);
    world.add(gable);
  }

  // Chimney with drifting smoke puffs
  world.add(box(0.52, 1.0, 0.52, std(0xb5533a, { roughness: 0.9 }), 1.9, ridgeY - 0.25, -1.3, 0.03));
  world.add(box(0.66, 0.1, 0.66, mStoneDark, 1.9, ridgeY + 0.29, -1.3, 0.03));
  const puffTex = tex(canvasTexture(128, 128, drawPuff));
  const puffs: THREE.Sprite[] = [];
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: puffTex, color: 0xf3ece2, transparent: true, opacity: 0, depthWrite: false })
    );
    puffs.push(puff);
    world.add(puff);
  }

  // ── Outside dressing ──
  // Side window with a flower box (seen in the 3/4 view)
  world.add(box(0.07, 1.2, 1.1, mFrame, W / 2 + 0.02, 2.0, -0.6, 0.02));
  const sideGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 1.06),
    new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffc46b, emissiveIntensity: 1.1, roughness: 0.3 })
  );
  sideGlass.rotation.y = Math.PI / 2;
  sideGlass.position.set(W / 2 + 0.06, 2.0, -0.6);
  world.add(sideGlass);
  world.add(box(0.05, 1.06, 0.05, mFrame, W / 2 + 0.07, 2.0, -0.6, 0));
  world.add(box(0.05, 0.05, 0.96, mFrame, W / 2 + 0.07, 2.0, -0.6, 0));
  world.add(box(0.26, 0.2, 1.2, mWoodDark, W / 2 + 0.16, 1.32, -0.6, 0.03));
  const mLeaf = std(C.leaf, { roughness: 0.9 });
  const mFlower = std(0xe8503a, { roughness: 0.7 });
  for (let i = 0; i < 7; i++) {
    const tuft = ball(0.12, i % 3 === 1 ? mFlower : mLeaf);
    tuft.position.set(W / 2 + 0.17, 1.47 + (i % 2) * 0.03, -1.1 + i * 0.17);
    world.add(shadowed(tuft));
  }

  // Hanging round sign at the corner
  world.add(box(0.5, 0.04, 0.04, mFrame, W / 2 + 0.25, 3.25, FRONT - 0.1, 0));
  const signDisc = new THREE.Group();
  const signRim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 40), mFrame);
  signRim.rotation.x = Math.PI / 2;
  signDisc.add(signRim);
  const mSignFace = new THREE.MeshStandardMaterial({ map: logoTex, roughness: 0.6 });
  for (const side of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.32, 40), mSignFace);
    face.position.z = side * 0.027;
    if (side === -1) face.rotation.y = Math.PI;
    signDisc.add(face);
  }
  signDisc.position.set(W / 2 + 0.36, 2.86, FRONT - 0.1);
  shadowed(signDisc);
  world.add(signDisc);

  // Topiary pots flanking the shopfront
  const mPot = std(0xb8623c, { roughness: 0.85 });
  for (const side of [-1, 1]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.2, 0.42, 24), mPot);
    pot.position.set(side * 3.02, 0.21, FRONT + 0.78);
    const bush = ball(0.34, mLeaf);
    bush.position.set(side * 3.02, 0.68, FRONT + 0.78);
    const bushTop = ball(0.23, mLeaf);
    bushTop.position.set(side * 3.02, 1.08, FRONT + 0.78);
    world.add(shadowed(pot), shadowed(bush), shadowed(bushTop));
  }

  // "Pizzeta 3€" A-frame, as in the doorway photo
  const aFrame = new THREE.Group();
  const mBoard = new THREE.MeshStandardMaterial({ map: aFrameTex, roughness: 0.7 });
  for (const side of [-1, 1]) {
    const board = box(0.62, 0.86, 0.035, [mFrame, mFrame, mFrame, mFrame, mBoard, mBoard], 0, 0.46, side * 0.15, 0.008);
    board.rotation.x = side * 0.3;
    if (side === -1) board.rotation.y = Math.PI;
    aFrame.add(board);
  }
  aFrame.position.set(2.05, 0, FRONT + 1.05);
  aFrame.rotation.y = -0.28;
  world.add(aFrame);

  // ─────────────────────────────────────────────────────────────────────────
  // Camera rig + loop
  // ─────────────────────────────────────────────────────────────────────────
  let progress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let running = false;
  let rafId = 0;
  let ready = false;
  let disposed = false;
  const clock = new THREE.Clock();

  const wideTarget = new THREE.Vector3(0, 2.3, 0.3);
  const closeTarget = new THREE.Vector3(GUSTAVO_X + 0.05, 1.52, FRONT - 0.3);
  const target = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let viewW = 1;
  let viewH = 1;

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    viewW = Math.max(1, parent.clientWidth);
    viewH = Math.max(1, parent.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, viewW < 700 ? 1.6 : 2));
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
    if (!running && ready) renderFrame();
  }

  function updateCamera(t: number) {
    const aspect = viewW / viewH;
    const portrait = aspect < 0.85;
    const p = progress * progress * (3 - 2 * progress);

    // Distance needed to frame a box of (w × h) world units
    const fit = (w: number, h: number) =>
      Math.max(h / (2 * tanHalf), w / (2 * tanHalf * aspect));

    // Wide desktop: headline on the left, diorama on the right 60% of the frame
    const sideBySide = viewW >= 1024 && aspect >= 1.25;
    const stage = sideBySide ? 0.6 : 1;
    // World-space box the opening shot must contain: [width, height]
    const [boxW, boxH] = portrait ? [9.5, 7.4] : sideBySide ? [11.9, 9.9] : [11, 12.6];
    const wideR = Math.max(
      boxH / (2 * tanHalf),
      boxW / (2 * tanHalf * aspect * stage)
    );
    const closeR = fit(3.7, 3.9);

    const sway = options.animate ? Math.sin(t * 0.35) * 0.035 : 0;
    const yaw =
      THREE.MathUtils.lerp(portrait ? 0.32 : 0.44, 0.07, p) +
      (smoothX * 0.16 + sway) * (1 - p * 0.6);
    const tilt = THREE.MathUtils.lerp(0.22, 0.05, p) - smoothY * 0.07 * (1 - p * 0.6);
    const radius = THREE.MathUtils.lerp(wideR, closeR, p);

    target.lerpVectors(wideTarget, closeTarget, p);
    // Phones frame by width, so drop the close-up a little to fill the tall screen
    if (portrait) target.y -= 0.35 * p;
    camera.position.set(
      target.x + radius * Math.sin(yaw) * Math.cos(tilt),
      target.y + radius * Math.sin(tilt),
      target.z + radius * Math.cos(yaw) * Math.cos(tilt)
    );
    camera.lookAt(target);

    // Lift the diorama a little so the headline has room underneath
    const lift = (sideBySide ? -0.015 : portrait ? 0.11 : 0.15) * (1 - p);
    const shift = (sideBySide ? 0.19 : 0) * (1 - p);
    camera.setViewOffset(viewW, viewH, -viewW * shift, viewH * lift, viewW, viewH);
  }

  function animate(t: number) {
    const g = gustavo;
    // Gentle wave from the elbow, hand trailing slightly behind
    const wave = Math.sin(t * 3.4);
    g.waveShoulder.rotation.z = -1.0 + Math.sin(t * 1.7) * 0.05;
    g.waveElbow.rotation.z = 0.92 + wave * 0.3;
    g.waveHand.rotation.z = Math.sin(t * 3.4 - 0.7) * 0.22;

    // Breathing, a small head tilt, and an occasional blink
    const breathe = Math.sin(t * 1.5);
    g.body.position.y = breathe * 0.008;
    g.body.rotation.z = Math.sin(t * 0.8) * 0.012;
    g.head.rotation.z = Math.sin(t * 0.9) * 0.045;
    g.head.rotation.y = 0.2 * (1 - progress) + smoothX * 0.35 + Math.sin(t * 0.6) * 0.05;
    g.head.rotation.x = -smoothY * 0.15;
    const blinkPhase = t % 4.2;
    g.eyes.scale.y = blinkPhase < 0.13 ? 0.12 : 1;
    g.peelArm.rotation.z = Math.sin(t * 1.2) * 0.02;

    // Chimney smoke
    puffs.forEach((puff, i) => {
      const life = (t * 0.22 + i / puffs.length) % 1;
      puff.position.set(
        1.9 + Math.sin(life * 3 + i) * 0.18 + life * 0.35,
        ridgeY + 0.45 + life * 1.5,
        -1.3
      );
      puff.scale.setScalar(0.35 + life * 0.75);
      puff.material.opacity = Math.sin(life * Math.PI) * 0.42;
    });

    // Living light: the oven and the neon breathe a little
    (ovenGlow.material as THREE.MeshStandardMaterial).emissiveIntensity =
      1.7 + Math.sin(t * 7) * 0.2 + Math.sin(t * 13) * 0.12;
    (neon.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.8 + Math.sin(t * 2) * 0.35;
  }

  function renderFrame() {
    if (disposed) return;
    const t = options.animate ? clock.getElapsedTime() : 0.6;
    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;
    animate(t);
    updateCamera(t);
    renderer.render(scene, camera);
    if (options.onAnchor) {
      gustavo.head.getWorldPosition(anchor);
      anchor.y += 0.46;
      anchor.project(camera);
      options.onAnchor((anchor.x * 0.5 + 0.5) * viewW, (-anchor.y * 0.5 + 0.5) * viewH);
    }
    if (!ready) {
      ready = true;
      options.onReady?.();
    }
  }

  function loop() {
    if (!running) return;
    renderFrame();
    rafId = window.requestAnimationFrame(loop);
  }

  const resizeObserver = new ResizeObserver(resize);
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
  resize();
  renderFrame();

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      if (!running) renderFrame();
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    start() {
      if (running || disposed || !options.animate) return;
      running = true;
      clock.start();
      loop();
    },
    stop() {
      running = false;
      window.cancelAnimationFrame(rafId);
    },
    dispose() {
      disposed = true;
      running = false;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      logoImg.onload = null;
      puffs.forEach((puff) => puff.material.dispose());
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
