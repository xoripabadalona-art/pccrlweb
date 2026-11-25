'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getMenuItemById, getPizzetas } from '@/data/menu';
import { PIZZETA_PROMO } from '@/lib/promo';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { useBasketStore } from '@/store/basket';
import {
  PEPPERONI_ATLAS,
  PEPPERONI_FRAME,
  PEPPERONI_SPRITES,
} from '@/data/pepperoniSprites';

export interface ExplodedPizzaProps {
  locale: Locale;
}

/** The one pizza that gets the full scroll-driven 3D treatment on the homepage. */
const HERO_PIZZA_ID = 'pizza-pepperoni';

type LayerId = 'toppings' | 'cheese' | 'sauce' | 'crust';

interface LayerSpec {
  id: LayerId;
  src: string;
  /** Rendered width relative to the stack box */
  widthClass: string;
  zClass: string;
  /** Final vertical offset when exploded, in % of the stack box height */
  explodeY: number;
  /** Final roll in degrees — a little disorder makes it read as floating */
  explodeRot: number;
  /** Parallax depth factor (1 = closest to the camera) */
  depth: number;
  bobDelay: string;
  /**
   * Turntable spin for flat layers. The render is a disc seen at an angle, so
   * un-squashing it, rotating and squashing it back turns it around its own
   * vertical axis. `k` is the disc's height/width ratio on screen.
   */
  turn?: { k: number; scrollDeg: number; whipDeg: number; idleDeg: number };
}

// Top → bottom. Only what is actually on a Pepperoni: no basil, no extras.
const LAYERS: LayerSpec[] = [
  {
    id: 'toppings',
    src: '/images/pizzas-3d/toppings-pepperoni-v2.webp',
    widthClass: 'w-[92%]',
    zClass: 'z-40',
    explodeY: -57,
    explodeRot: -2.5,
    depth: 1,
    bobDelay: '0s',
  },
  {
    id: 'cheese',
    src: '/images/layer-cheese-v2.webp',
    widthClass: 'w-[90%]',
    zClass: 'z-30',
    explodeY: -19,
    explodeRot: 1.6,
    depth: 0.7,
    bobDelay: '-1.4s',
    // The melted sheet is irregular: beyond ~40° the trick starts to show
    turn: { k: 0.48, scrollDeg: -16, whipDeg: -26, idleDeg: 4 },
  },
  {
    id: 'sauce',
    src: '/images/layer-sauce-v2.webp',
    widthClass: 'w-[86%]',
    zClass: 'z-20',
    explodeY: 19,
    explodeRot: -1.2,
    depth: 0.45,
    bobDelay: '-2.8s',
    turn: { k: 0.42, scrollDeg: 46, whipDeg: 84, idleDeg: 7 },
  },
  {
    id: 'crust',
    src: '/images/layer-crust-v2.webp',
    widthClass: 'w-full',
    zClass: 'z-10',
    explodeY: 57,
    explodeRot: 0,
    depth: 0.25,
    bobDelay: '-4.2s',
  },
];

/** Centre and squash of the pizza plane inside the 16:10 layer frame */
const PLANE = { cx: 0.5, cy: 0.506, k: 0.42 };

/** Deterministic pseudo-random in [0, 1) so server and client agree */
function seeded(i: number, salt: number) {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/** Phones pull the layers further apart; the value lives in CSS as --spread */
function spreadOf(el: HTMLElement | null) {
  if (!el) return 1;
  return parseFloat(getComputedStyle(el).getPropertyValue('--spread')) || 1;
}

/** Per-slice motion for the pepperoni cloud */
const SLICES = PEPPERONI_SPRITES.map((sprite, i) => ({
  sprite,
  // plane coordinates of the slice centre (frame px), un-squashed
  px: sprite.x + sprite.w / 2 - PLANE.cx * PEPPERONI_FRAME.w,
  pz: (sprite.y + sprite.h / 2 - PLANE.cy * PEPPERONI_FRAME.h) / PLANE.k,
  // how far it lifts off the plane when exploded (fraction of frame height)
  lift: (seeded(i, 1) - 0.42) * 0.46,
  burst: 0.06 + seeded(i, 2) * 0.2,
  bobAmp: 3 + seeded(i, 3) * 5,
  bobSpeed: 0.7 + seeded(i, 4) * 0.9,
  phase: seeded(i, 5) * Math.PI * 2,
  tumble: 5 + seeded(i, 6) * 13,
}));

// ── The lifted slice (opening pose), in % of the baked-pizza frame ──
// A wedge on the far-right side: its three outer points sit beyond the rim, so
// the image's own transparency trims the crust edge.
const WEDGE = 'polygon(50.1% 48%, 97.4% 40.4%, 88.2% 32.3%, 73.4% 26.4%)';
// Same wedge with its far edge dropped by the dough's thickness: painting the
// dark gap with this leaves a strip of crumb showing along the far cut face.
const WEDGE_FLOOR = 'polygon(50.1% 49.5%, 97.4% 40.4%, 88.2% 32.3%, 73.4% 27.9%)';
const SLICE_RISE = 19; // % of frame height
/** Melted-cheese strings: [x %, y % of their foot on the pizza, width %] */
const STRANDS: [number, number, number][] = [
  [52.9, 46.8, 2.6],
  [57.4, 46.2, 1.7],
  [62.3, 45.5, 3.0],
  [67.6, 44.7, 1.9],
  [72.6, 43.8, 2.5],
  [54.4, 44.2, 1.8],
  [57.3, 41.2, 2.8],
  [60.2, 38.2, 1.7],
  [63.0, 35.2, 2.3],
];

/** Steam wisps rising behind the pizza: [left %, width %, duration s, delay s, drift %, peak opacity] */
const WISPS: [number, number, number, number, number, number][] = [
  [14, 30, 8.5, 0, -10, 0.5],
  [32, 34, 10, -3.6, 8, 0.6],
  [50, 30, 9, -6.2, -7, 0.55],
  [62, 28, 8, -1.8, 11, 0.45],
  [40, 24, 11, -8.4, 4, 0.4],
];

export function ExplodedPizza({ locale }: ExplodedPizzaProps) {
  const copy = getCopy(locale);
  const pizza = getMenuItemById(HERO_PIZZA_ID);
  const addItem = useBasketStore((s) => s.addItem);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  const [reducedMotion, setReducedMotion] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const assembledRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const steamRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    if (mq.matches) return;

    let ctx: { revert: () => void } | undefined;
    let removePointer: (() => void) | undefined;
    let liftTl: { pause: () => unknown; resume: () => unknown; kill: () => void } | undefined;
    let stopTicker: (() => void) | undefined;
    let visibility: IntersectionObserver | undefined;
    let isMounted = true;

    // Scroll writes these; the ticker below turns them into slice positions and spins
    const motion = { explode: 0, spin: 0, turn: 0, whip: 0 };

    (async () => {
      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');
      if (!isMounted || !sectionRef.current || !pinRef.current) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context((self) => {
        const q = self.selector!;
        const layerEls = LAYERS.map(
          (l) => q(`[data-layer-id="${l.id}"]`)[0] as HTMLElement
        );
        const calloutEls = q('[data-callout]') as HTMLElement[];
        // Tall (phone) viewports have room to pull the layers further apart.
        const spread = spreadOf(stackRef.current);

        // ── Opening pose: one whole pizza, tilted, hovering under the headline
        // Responsive scale and vertical offset so the floating slice never clips on mobile/tablet
        gsap.set(stackRef.current, {
          y: () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (w < 640) return h * 0.165;
            if (w < 1024) return h * 0.18;
            return h * 0.2;
          },
          scale: () => {
            const w = window.innerWidth;
            if (w < 380) return 1.06;
            if (w < 640) return 1.14;
            if (w < 1024) return 1.24;
            return 1.38;
          },
          rotation: -6,
        });
        gsap.set(layerEls, { opacity: 0, yPercent: (i) => (i - 1.5) * 2 });
        gsap.set(calloutEls, { autoAlpha: 0 });
        gsap.set(stampRef.current, { autoAlpha: 0, scale: 0.7 });
        gsap.set(outroRef.current, { autoAlpha: 0, y: 28 });
        gsap.set(progressRef.current, { scaleY: 0, transformOrigin: 'top' });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=280%',
            pin: pinRef.current,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.to(progressRef.current, { scaleY: 1, duration: 1 }, 0);
        tl.to(hintRef.current, { autoAlpha: 0, duration: 0.05 }, 0.01);

        const baked = q('[data-baked]')[0] as HTMLElement;

        // ── Phase 1 (0.00 → 0.15): Smooth slice descent & pizza levels out center-stage
        tl.to(
          baked,
          { '--lift-s': 0, ease: 'power2.inOut', duration: 0.14 },
          0.00
        );
        tl.to(introRef.current, { autoAlpha: 0, y: -34, duration: 0.11, ease: 'power2.in' }, 0.02);
        tl.to(
          stackRef.current,
          { y: 0, scale: 1, rotation: 0, ease: 'power2.inOut', duration: 0.16 },
          0.00
        );

        // ── Phase 2 (0.16 → 0.22): Seamless cross-fade from assembled pizza to separate layers
        tl.to(layerEls, { opacity: 1, duration: 0.04, ease: 'power1.out' }, 0.16);
        tl.to(assembledRef.current, { opacity: 0, duration: 0.04, ease: 'power1.in' }, 0.17);

        // ── Phase 3 (0.18 → 0.42): Smooth, elegant explosion of layers
        const BURST = 0.18;
        const BURST_DUR = 0.24;
        LAYERS.forEach((layer, i) => {
          tl.to(
            layerEls[i]!,
            {
              yPercent: layer.explodeY * spread,
              rotation: layer.explodeRot,
              ease: 'power2.out',
              duration: BURST_DUR,
            },
            BURST + i * 0.005
          );
        });
        tl.to(motion, { explode: 1, ease: 'power2.out', duration: BURST_DUR }, BURST);
        tl.to(motion, { spin: 1.15, turn: 0.6, ease: 'power2.out', duration: BURST_DUR }, BURST);
        tl.to(
          shadowRef.current,
          { yPercent: 140 * spread, scaleX: 0.82, opacity: 0.55, ease: 'power2.out', duration: BURST_DUR },
          BURST
        );
        tl.to(steamRef.current, { opacity: 0.5, duration: 0.12 }, BURST);

        // ── Phase 4 (0.36 → 0.54): Words & annotations glide in ONCE (no duplication!)
        calloutEls.forEach((el, i) => {
          const fromLeft = el.dataset.callout === 'left';
          const line = el.querySelector('[data-callout-line]');
          tl.fromTo(
            el,
            { autoAlpha: 0, x: fromLeft ? -26 : 26 },
            { autoAlpha: 1, x: 0, ease: 'power2.out', duration: 0.08 },
            0.36 + i * 0.04
          );
          if (line) {
            tl.fromTo(
              line,
              { scaleX: 0 },
              { scaleX: 1, ease: 'power2.out', duration: 0.08 },
              0.38 + i * 0.04
            );
          }
        });
        tl.to(
          stampRef.current,
          { autoAlpha: 1, scale: 1, ease: 'back.out(1.5)', duration: 0.07 },
          0.48
        );

        // Slow continuous 3D rotation while floating
        tl.to(motion, { spin: 2.1, turn: 1.4, ease: 'none', duration: 0.22 }, 0.40);

        // ── Phase 5 (0.58 → 0.82): Ingredients come back together! Reassembly into whole pizza!
        const annotations = [...calloutEls, stampRef.current];
        tl.to(annotations, { autoAlpha: 0, duration: 0.05, ease: 'power2.in' }, 0.58);

        // Layers collapse back together into one unified stack
        const REJOIN = 0.62;
        const REJOIN_DUR = 0.18;
        LAYERS.forEach((layer, i) => {
          tl.to(
            layerEls[i]!,
            {
              yPercent: 0,
              rotation: 0,
              ease: 'power2.inOut',
              duration: REJOIN_DUR,
            },
            REJOIN
          );
        });
        tl.to(motion, { explode: 0, ease: 'power2.inOut', duration: REJOIN_DUR }, REJOIN);
        tl.to(motion, { spin: 2.8, turn: 2.0, ease: 'power2.inOut', duration: REJOIN_DUR }, REJOIN);
        tl.to(
          shadowRef.current,
          { yPercent: 0, scaleX: 1, opacity: 0.85, ease: 'power2.inOut', duration: REJOIN_DUR },
          REJOIN
        );

        // Seamlessly cross-fade back to the whole baked pizza
        tl.to(assembledRef.current, { opacity: 1, duration: 0.05, ease: 'power1.out' }, REJOIN + REJOIN_DUR - 0.04);
        tl.to(layerEls, { opacity: 0, duration: 0.05, ease: 'power1.in' }, REJOIN + REJOIN_DUR - 0.03);

        // ── Phase 6 (0.84 → 1.00): Outro CTA appears, ready to scroll into next section
        tl.to(
          stackRef.current,
          {
            y: () => -window.innerHeight * 0.065,
            scale: 0.94,
            ease: 'power2.out',
            duration: 0.10,
          },
          0.84
        );
        tl.to(
          outroRef.current,
          { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.09 },
          0.86
        );
        tl.to({}, { duration: 0.05 }, 0.95);
      }, sectionRef);

      // ── Per-frame motion: pepperoni cloud + turntable layers ──
      const cloud = cloudRef.current;
      const sliceEls = cloud
        ? Array.from(cloud.querySelectorAll<HTMLElement>('[data-slice]'))
        : [];
      const turners = LAYERS.filter((l) => l.turn).map((l) => ({
        cfg: l.turn!,
        set: gsap.quickSetter(
          pinRef.current!.querySelector(`[data-turn="${l.id}"]`),
          'rotation',
          'deg'
        ) as (v: number) => void,
      }));
      const lastZ: number[] = [];
      const t0 = performance.now();
      let frameSpread = spreadOf(stackRef.current);
      const onResize = () => {
        frameSpread = spreadOf(stackRef.current);
      };
      window.addEventListener('resize', onResize, { passive: true });

      let slicesAtRest = false;

      const frame = () => {
        const e = motion.explode;
        // Short-circuit when the pizza is assembled and separate layers are hidden (opacity 0)
        if (e < 0.001) {
          if (!slicesAtRest) {
            slicesAtRest = true;
            for (let i = 0; i < sliceEls.length; i++) {
              sliceEls[i]!.style.transform = 'translate3d(0px, 0px, 0) rotate(0deg)';
            }
          }
          return;
        }
        slicesAtRest = false;

        const t = (performance.now() - t0) / 1000;
        turners.forEach(({ cfg, set }, i) => {
          set(
            motion.turn * cfg.scrollDeg +
              motion.whip * cfg.whipDeg +
              Math.sin(t * 0.45 + i * 2.1) * cfg.idleDeg
          );
        });

        if (!cloud || sliceEls.length === 0) return;
        const scale = cloud.clientWidth / PEPPERONI_FRAME.w;
        if (!scale) return;
        const spread = frameSpread;
        const angle = motion.spin + t * 0.07;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        for (let i = 0; i < sliceEls.length; i++) {
          const s = SLICES[i]!;
          const reach = 1 + e * s.burst;
          const x = (s.px * cos - s.pz * sin) * reach;
          const z = (s.px * sin + s.pz * cos) * reach;
          const bob = Math.sin(t * s.bobSpeed + s.phase);
          const dx = (x - s.px) * scale;
          const dy =
            ((z - s.pz) * PLANE.k - e * s.lift * PEPPERONI_FRAME.h * spread) * scale +
            e * bob * s.bobAmp;
          const roll = e * Math.sin(t * s.bobSpeed * 0.8 + s.phase * 1.7) * s.tumble;
          const el = sliceEls[i]!;
          el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${roll.toFixed(1)}deg)`;
          // nearer slices paint over farther ones
          const zi = 200 + Math.round(z / 6);
          if (lastZ[i] !== zi) {
            lastZ[i] = zi;
            el.style.zIndex = String(zi);
          }
        }
      };
      frame();

      // Run only while the hero is on screen; idle CSS loops pause with it
      let ticking = false;
      const setActive = (active: boolean) => {
        sectionRef.current?.setAttribute('data-idle', active ? 'running' : 'paused');
        if (active && !ticking) gsap.ticker.add(frame);
        if (!active && ticking) gsap.ticker.remove(frame);
        ticking = active;
        if (active) liftTl?.resume();
        else liftTl?.pause();
      };
      stopTicker = () => {
        setActive(false);
        window.removeEventListener('resize', onResize);
      };
      visibility = new IntersectionObserver(
        ([entry]) => setActive(Boolean(entry?.isIntersecting)),
        { threshold: 0.01 }
      );
      visibility.observe(pinRef.current);

      // ── Opening pose: pizza starts immediately with the slice in the air ──
      const baked = pinRef.current.querySelector<HTMLElement>('[data-baked]');
      if (baked) {
        gsap.set(baked, { autoAlpha: 1 });
        const lift = gsap.timeline({ repeat: -1, yoyo: true });
        lift.to(baked, {
          '--lift-a': 0.82,
          duration: 2.5,
          ease: 'sine.inOut',
        });
        liftTl = lift;
        lift.play();
      }

      // Pointer parallax: nearer layers travel further, which sells the depth.
      if (window.matchMedia('(pointer: fine)').matches && pinRef.current) {
        const pinEl = pinRef.current;
        const movers = Array.from(
          pinEl.querySelectorAll<HTMLElement>('[data-parallax]')
        ).map((el) => ({
          depth: Number(el.dataset.parallax),
          x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' }),
        }));

        const onMove = (e: PointerEvent) => {
          const rect = pinEl.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          movers.forEach((m) => {
            m.x(nx * 34 * m.depth);
            m.y(ny * 18 * m.depth);
          });
        };
        pinEl.addEventListener('pointermove', onMove, { passive: true });
        removePointer = () => pinEl.removeEventListener('pointermove', onMove);
      }
    })();

    return () => {
      isMounted = false;
      removePointer?.();
      visibility?.disconnect();
      stopTicker?.();
      liftTl?.kill();
      ctx?.revert();
    };
  }, []);

  if (!pizza) return null;

  const crustCopy = copy.explodedPizza.callouts.find((c) => c.id === 'callout-crust');
  const sauceCopy = copy.explodedPizza.callouts.find((c) => c.id === 'callout-sauce');
  const cheeseCopy = copy.explodedPizza.callouts.find((c) => c.id === 'callout-cheese');
  const toppingCopy = pizza.pizza3d?.calloutTopLeft;

  const callouts: {
    layer: LayerId;
    side: 'left' | 'right';
    title: string;
    detail: string;
  }[] = [
    {
      layer: 'toppings',
      side: 'left',
      title: toppingCopy?.title[locale] ?? pizza.name[locale],
      detail: toppingCopy?.detail[locale] ?? '',
    },
    {
      layer: 'cheese',
      side: 'right',
      title: cheeseCopy?.title ?? 'Mozzarella',
      detail: cheeseCopy?.detail ?? '',
    },
    {
      layer: 'sauce',
      side: 'left',
      title: sauceCopy?.title ?? '',
      detail: sauceCopy?.detail ?? '',
    },
    {
      layer: 'crust',
      side: 'right',
      title: crustCopy?.title ?? '',
      detail: crustCopy?.detail ?? '',
    },
  ];

  const layerAlt: Record<LayerId, string> = {
    toppings: toppingCopy?.title[locale] ?? pizza.name[locale],
    cheese: cheeseCopy?.title ?? 'Mozzarella',
    sauce: sauceCopy?.title ?? '',
    crust: crustCopy?.title ?? '',
  };

  const assembledImage = '/images/pizzas-3d/pizza-pepperoni-v2.webp';
  const pizzetaFrom = Math.min(...getPizzetas().map((p) => p.priceCents));
  const promoChip =
    locale === 'ca'
      ? `Pizzetes des de ${formatCents(pizzetaFrom)} · paga’n ${PIZZETA_PROMO.pay}, emporta-te’n ${PIZZETA_PROMO.get}`
      : `Pizzetas desde ${formatCents(pizzetaFrom)} · paga ${PIZZETA_PROMO.pay}, llévate ${PIZZETA_PROMO.get}`;
  const pizzaLabel = `Pizza ${pizza.name[locale]}`;
  const price = formatCents(pizza.priceCents);

  const handleOrder = () => {
    addItem(pizza.id, pizza.sizes?.[0]?.id, 1);
    openDrawer();
  };

  const orderLabel =
    locale === 'ca'
      ? `Demanar ${pizza.name.ca} (${price})`
      : `Pedir ${pizza.name.es} (${price})`;

  // ── Reduced motion: a calm, fully static version of the same content ──────
  if (reducedMotion) {
    return (
      <section
        id="exploded-pizza"
        data-theme="dark"
        aria-labelledby="exploded-pizza-heading"
        className="relative bg-[#14110F] px-4 pt-32 pb-20 text-[#F9F4EC] md:px-8"
      >
        <div
          data-testid="exploded-pizza-reduced-motion"
          className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          <div className="text-center lg:text-left">
            <p className="mb-2 text-xs font-bold tracking-widest text-[#F1B24A] uppercase">
              {copy.signatureHero.eyebrow}
            </p>
            <h1
              id="exploded-pizza-heading"
              className="font-serif-heading text-3xl font-extrabold md:text-4xl"
            >
              {copy.heroStory.h1}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#CBBBA8]">
              {copy.heroStory.subtitle}
            </p>
            <a
              href="#carta"
              className="btn-pill mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F1B24A] px-8 py-2.5 text-sm font-extrabold text-[#14110F]"
            >
              {copy.heroStory.ctaMenu}
            </a>
            <img
              src={assembledImage}
              alt={`${pizzaLabel} — ${pizza.ingredients[locale]}`}
              width={1280}
              height={800}
              fetchPriority="high"
              className="mx-auto mt-6 aspect-[16/10] w-full max-w-[460px] object-contain"
            />
          </div>
          <div>
            <ol className="flex flex-col gap-3">
              {callouts.map((c, i) => (
                <li
                  key={c.layer}
                  className="rounded-2xl border border-[#F9F4EC]/15 bg-[#1F1813] p-4"
                >
                  <p className="font-serif-heading text-base font-bold text-[#F1B24A]">
                    0{i + 1} · {c.title}
                  </p>
                  <p className="mt-1 text-sm text-[#CBBBA8]">{c.detail}</p>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={handleOrder}
              data-testid="exploded-order-now-cta"
              className="btn-pill mt-6 inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-full bg-[#EE6A2B] px-10 py-3 text-base font-extrabold text-[#14110F]"
            >
              {orderLabel}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="exploded-pizza"
      ref={sectionRef}
      data-theme="dark"
      aria-labelledby="exploded-pizza-heading"
      className="relative bg-[#0F0D0B] text-[#F9F4EC]"
    >
      <p className="sr-only">{copy.explodedPizza.srDescription}</p>

      <div
        ref={pinRef}
        className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#30231A_0%,#1A1512_46%,#0F0D0B_100%)]"
      >
        {/* Warm spotlight behind everything */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-[70svh] w-[min(820px,110vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(241,178,74,0.13)_0%,rgba(238,106,43,0.05)_45%,transparent_70%)]"
        />
        {/* Scroll progress rail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-5 z-30 hidden h-40 w-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-[#F9F4EC]/15 md:block"
        >
          <span
            ref={progressRef}
            className="block h-full w-full bg-[#F1B24A] shadow-[0_0_8px_#F1B24A]"
          />
        </div>

        {/* Headline block (leaves as the pizza takes over) */}
        <div
          ref={introRef}
          className="absolute inset-x-0 top-[calc(68px+3.5svh)] z-30 mx-auto max-w-2xl px-5 text-center"
        >
          <a
            href="#pizzetas"
            data-testid="hero-pizzeta-promo"
            className="mb-3 inline-flex min-h-[32px] items-center gap-2 rounded-full border border-[#F1B24A]/50 bg-[#F1B24A]/12 px-3.5 py-1 text-xs font-bold text-[#F1B24A] transition-colors hover:bg-[#F1B24A]/22 sm:text-[13px]"
          >
            <span>{promoChip}</span>
            <span aria-hidden="true">→</span>
          </a>
          <h1
            id="exploded-pizza-heading"
            className="font-serif-heading text-[1.75rem] leading-[1.1] font-extrabold tracking-tight text-balance text-[#F9F4EC] sm:text-4xl md:text-[2.9rem]"
          >
            {copy.heroStory.h1}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#CBBBA8] md:text-base">
            {copy.heroStory.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`/${locale}/carta`}
              className="btn-pill inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#F1B24A] px-8 py-2.5 text-sm font-extrabold text-[#14110F] shadow-[0_8px_24px_rgba(241,178,74,0.35)] transition-transform hover:scale-105 hover:bg-[#F5C065]"
            >
              {copy.heroStory.ctaMenu}
            </a>
            <button
              type="button"
              onClick={handleOrder}
              className="btn-pill hidden min-h-[46px] cursor-pointer items-center gap-2 rounded-full border border-[#F9F4EC]/30 bg-[#14110F]/40 px-6 py-2.5 text-sm font-bold text-[#F9F4EC] backdrop-blur-sm transition-colors hover:border-[#F1B24A] hover:text-[#F1B24A] sm:inline-flex"
            >
              <span>
                {pizzaLabel} · {price}
              </span>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          ref={hintRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-5 z-30 hidden flex-col items-center gap-1 text-[#CBBBA8] sm:flex"
        >
          <span className="text-[10px] font-bold tracking-[0.24em] uppercase">
            {locale === 'ca' ? 'Llisca' : 'Desliza'}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-scroll-cue"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* The pizza */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            ref={stackRef}
            data-testid="exploded-pizza-layers"
            className="relative aspect-[16/10] w-[min(560px,84vw,54svh)] [--spread:1.38] will-change-transform sm:w-[min(540px,70vw,56svh)] md:w-[min(480px,54vw,56svh)] md:[--spread:1] lg:w-[min(580px,50vw,60svh)]"
          >
            {/* Contact shadow */}
            <div
              ref={shadowRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[14%] bottom-[6%] z-0 h-[22%] rounded-[50%] bg-black/85 blur-xl md:blur-2xl"
            />

            {/* Steam curling up from behind the pizza */}
            <div
              ref={steamRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-[42%] z-0 h-[150%]"
            >
              {WISPS.map(([left, width, duration, delay, drift, peak], i) => (
                <svg
                  key={i}
                  viewBox="0 0 100 300"
                  preserveAspectRatio="none"
                  fill="none"
                  className={`steam-wisp absolute bottom-0 h-full ${i >= 2 ? 'hidden md:block' : ''}`}
                  style={
                    {
                      left: `${left}%`,
                      width: `${width}%`,
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay}s`,
                      '--wisp-drift': `${drift}%`,
                      '--wisp-peak': peak,
                    } as React.CSSProperties
                  }
                >
                  <path
                    d={
                      i % 2
                        ? 'M52 300 C -10 250, 104 214, 40 168 C -8 132, 96 104, 60 62 C 34 34, 70 16, 44 0'
                        : 'M48 300 C 112 252, -6 212, 62 166 C 110 130, 2 100, 42 60 C 70 32, 28 14, 58 0'
                    }
                    stroke="url(#heroSteam)"
                    strokeWidth="13"
                    strokeLinecap="round"
                  />
                  <path
                    d={
                      i % 2
                        ? 'M40 300 C 80 262, 6 222, 58 180 C 96 148, 20 118, 50 84'
                        : 'M60 300 C 18 260, 96 224, 44 182 C 4 150, 82 120, 52 86'
                    }
                    stroke="url(#heroSteam)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </svg>
              ))}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="heroSteam" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#F9F4EC" stopOpacity="0" />
                    <stop offset="35%" stopColor="#F9F4EC" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#F9F4EC" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Baked pizza (opening state) */}
            <div
              ref={assembledRef}
              data-layer-id="assembled"
              className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center will-change-[transform,opacity]"
            >
              <div
                data-parallax="0.6"
                data-baked
                className="h-full w-full opacity-100"
                style={
                  {
                    '--lift-a': 1,
                    '--lift-s': 1,
                    '--lift': 'calc(var(--lift-a) * var(--lift-s))',
                  } as React.CSSProperties
                }
              >
                <div className="pizza-layer-bob relative h-full w-full">
                  <img
                    src={assembledImage}
                    alt={`${pizzaLabel} — ${pizza.ingredients[locale]}`}
                    width={1280}
                    height={800}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.75)]"
                  />

                  {/* The gap the slice leaves behind (only while it is lifted) */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(to_bottom,#c9925a_0%,#b98350_45%,#8c5c31_100%)]"
                    style={{
                      clipPath: WEDGE,
                      WebkitMaskImage: `url(${assembledImage})`,
                      maskImage: `url(${assembledImage})`,
                      WebkitMaskSize: '100% 100%',
                      maskSize: '100% 100%',
                      opacity: 'clamp(0, calc(var(--lift) * 9), 1)',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_40%,#3a1c10_0%,#1c120d_55%,#120d0a_100%)]"
                      style={{ clipPath: WEDGE_FLOOR }}
                    />
                  </div>

                  {/* Melted cheese stretching between the pizza and the slice */}
                  {STRANDS.map(([x, y, w], i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="cheese-strand absolute block"
                      style={{
                        left: `${x - w / 2}%`,
                        bottom: `${100 - y}%`,
                        width: `${w}%`,
                        height: `${SLICE_RISE}%`,
                        transform: 'scaleY(var(--lift))',
                        opacity: 'clamp(0, calc(var(--lift) * 7 - 0.35), 1)',
                      }}
                    />
                  ))}

                  {/* The slice itself: the same render, clipped to the wedge */}
                  <div
                    aria-hidden="true"
                    className="pizza-slice-lifted absolute inset-0"
                    style={{
                      // gone the instant it is back in place, so no cut line shows on the whole pizza
                      opacity: 'clamp(0, calc(var(--lift) * 40), 1)',
                      transform: `translate3d(0, calc(var(--lift) * -${SLICE_RISE}%), 0)`,
                    }}
                  >
                    <img
                      src={assembledImage}
                      alt=""
                      width={1280}
                      height={800}
                      decoding="async"
                      className="h-full w-full object-contain"
                      style={{ clipPath: WEDGE }}
                    />
                  </div>
                </div>
              </div>
            </div>



            {/* Separate ingredient layers */}
            {LAYERS.map((layer) => (
              <div
                key={layer.id}
                data-layer-id={layer.id}
                className={`pointer-events-none absolute inset-0 ${layer.zClass} flex items-center justify-center opacity-0 will-change-[transform,opacity]`}
              >
                <div
                  data-parallax={layer.depth}
                  className={`relative ${layer.widthClass} aspect-[16/10]`}
                >
                  {layer.id === 'toppings' ? (
                    // Every pepperoni slice is its own sprite, positioned each frame
                    <div
                      ref={cloudRef}
                      role="img"
                      aria-label={layerAlt[layer.id]}
                      className="relative h-full w-full"
                    >
                      {SLICES.map(({ sprite }, i) => (
                        <span
                          key={i}
                          data-slice
                          className="absolute block will-change-transform"
                          style={{
                            left: `${(sprite.x / PEPPERONI_FRAME.w) * 100}%`,
                            top: `${(sprite.y / PEPPERONI_FRAME.h) * 100}%`,
                            width: `${(sprite.w / PEPPERONI_FRAME.w) * 100}%`,
                            height: `${(sprite.h / PEPPERONI_FRAME.h) * 100}%`,
                            backgroundImage: `url(${PEPPERONI_ATLAS.src})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: `${(PEPPERONI_ATLAS.w / sprite.w) * 100}% ${(PEPPERONI_ATLAS.h / sprite.h) * 100}%`,
                            backgroundPosition: `${(sprite.ax / Math.max(1, PEPPERONI_ATLAS.w - sprite.w)) * 100}% ${(sprite.ay / Math.max(1, PEPPERONI_ATLAS.h - sprite.h)) * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  ) : layer.turn ? (
                    <div
                      className="pizza-layer-bob relative h-full w-full"
                      style={{ animationDelay: layer.bobDelay }}
                    >
                      {/* Soft shadow that does not need re-rendering while the disc spins */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-[20%] top-[58%] h-[22%] rounded-[50%] bg-black/55 blur-xl"
                      />
                      {/* squash ∘ rotate ∘ un-squash = turntable spin of a tilted disc */}
                      <div
                        className="h-full w-full"
                        style={{
                          transform: `scaleY(${layer.turn.k})`,
                          transformOrigin: `${PLANE.cx * 100}% ${PLANE.cy * 100}%`,
                        }}
                      >
                        <div
                          data-turn={layer.id}
                          className="h-full w-full will-change-transform"
                          style={{
                            transformOrigin: `${PLANE.cx * 100}% ${PLANE.cy * 100}%`,
                          }}
                        >
                          <img
                            src={layer.src}
                            alt={layerAlt[layer.id]}
                            width={1280}
                            height={800}
                            fetchPriority="low"
                            decoding="async"
                            className="h-full w-full object-contain"
                            style={{
                              transform: `scaleY(${1 / layer.turn.k})`,
                              transformOrigin: `${PLANE.cx * 100}% ${PLANE.cy * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={layer.src}
                      alt={layerAlt[layer.id]}
                      width={1280}
                      height={800}
                      fetchPriority="low"
                      decoding="async"
                      style={{ animationDelay: layer.bobDelay }}
                      className="pizza-layer-bob h-full w-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.65)] md:drop-shadow-[0_18px_20px_rgba(0,0,0,0.7)]"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Annotations, each pinned to its layer's resting height */}
            {callouts.map((c, i) => {
              const layer = LAYERS.find((l) => l.id === c.layer)!;
              const isLeft = c.side === 'left';
              return (
                <div
                  key={c.layer}
                  className={`absolute z-50 -translate-y-1/2 ${
                    isLeft
                      ? 'left-0 sm:left-auto sm:right-[76%] md:right-[88%]'
                      : 'right-0 sm:right-auto sm:left-[76%] md:left-[88%]'
                  }`}
                  style={{ top: `calc(50% + ${layer.explodeY}% * var(--spread))` }}
                >
                  <div
                    data-callout={c.side}
                    className={`invisible flex items-center gap-2.5 ${
                      isLeft ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-[104px] rounded-xl border border-[#F9F4EC]/15 bg-[#14110F]/85 px-2.5 py-1.5 backdrop-blur-xs sm:w-[126px] sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none md:w-[172px] lg:w-[220px] ${
                        isLeft ? 'text-left sm:text-right' : 'text-right sm:text-left'
                      }`}
                    >
                      <p className="font-serif-heading text-base leading-none font-extrabold text-[#F1B24A] sm:text-lg md:text-2xl">
                        0{i + 1}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight font-bold text-[#F9F4EC] [text-shadow:0_1px_8px_rgba(0,0,0,0.9)] sm:mt-1 md:text-base">
                        {c.title}
                      </p>
                      <p className="mt-1 hidden text-xs leading-snug text-[#CBBBA8] md:block">
                        {c.detail}
                      </p>
                    </div>
                    <div
                      aria-hidden="true"
                      className={`hidden items-center md:flex ${
                        isLeft ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <span
                        data-callout-line
                        className={`block w-12 border-t border-dashed border-[#F9F4EC]/70 lg:w-24 ${
                          isLeft ? 'origin-left' : 'origin-right'
                        }`}
                      />
                      <span className="block h-2 w-2 rounded-full bg-[#F9F4EC] shadow-[0_0_8px_rgba(249,244,236,0.8)]" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Rotating house stamp */}
            <div
              ref={stampRef}
              aria-hidden="true"
              className="invisible absolute top-[86%] right-[97%] z-50 hidden h-24 w-24 lg:block"
            >
              <svg viewBox="0 0 100 100" className="animate-stamp-spin h-full w-full">
                <defs>
                  <path
                    id="explodedStampRing"
                    d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                  />
                </defs>
                <circle cx="50" cy="50" r="48" fill="#14110F" fillOpacity="0.75" stroke="#F9F4EC" strokeOpacity="0.55" strokeWidth="1" />
                <circle cx="50" cy="50" r="27" fill="none" stroke="#F9F4EC" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
                <text fill="#F9F4EC" fontSize="8.4" fontWeight="700" letterSpacing="2.1">
                  <textPath href="#explodedStampRing">
                    LA PICCERELLA · BADALONA · RECETA ARTESANAL ·
                  </textPath>
                </text>
              </svg>
              <span className="font-serif-heading absolute inset-0 flex items-center justify-center text-lg font-extrabold text-[#F1B24A]">
                48 h
              </span>
            </div>
          </div>
        </div>

        {/* Closing block: house numbers + order button */}
        <div
          ref={outroRef}
          className="invisible absolute inset-x-0 bottom-[max(18px,3svh)] z-30 mx-auto flex max-w-3xl flex-col items-center px-5 text-center"
        >
          <div className="flex items-center justify-center gap-5 md:gap-8">
            <p className="text-right">
              <span className="font-serif-heading block text-2xl leading-none font-extrabold whitespace-nowrap md:text-3xl">
                48 <span className="text-sm font-normal text-[#CBBBA8]">h</span>
              </span>
              <span className="mt-1 block text-[11px] text-[#CBBBA8]">
                {locale === 'ca' ? 'Fermentació lenta' : 'Fermentación lenta'}
              </span>
            </p>
            <h3 className="font-serif-heading max-w-[13rem] text-base leading-tight font-extrabold sm:max-w-xs sm:text-xl md:text-2xl">
              {locale === 'ca' ? 'Tradició, qualitat i sabor' : 'Tradición, calidad y sabor'}{' '}
              <span className="text-[#F1B24A]">La Piccerella</span>
            </h3>
            <p className="text-left">
              <span className="font-serif-heading block text-2xl leading-none font-extrabold whitespace-nowrap md:text-3xl">
                100 <span className="text-sm font-normal text-[#CBBBA8]">%</span>
              </span>
              <span className="mt-1 block text-[11px] text-[#CBBBA8]">
                {locale === 'ca' ? 'Obrador artesanal' : 'Obrador artesanal'}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleOrder}
            data-testid="exploded-order-now-cta"
            className="btn-pill mt-4 inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-full bg-[#EE6A2B] px-10 py-3 text-base font-extrabold text-[#14110F] shadow-[0_12px_36px_rgba(238,106,43,0.45)] transition-transform hover:scale-105 hover:bg-[#F37D44] md:px-12 md:text-lg"
          >
            {orderLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
