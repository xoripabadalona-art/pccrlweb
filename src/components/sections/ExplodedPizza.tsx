'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getMenuItemById } from '@/data/menu';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { useBasketStore } from '@/store/basket';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    if (mq.matches) return;

    let ctx: { revert: () => void } | undefined;
    let removePointer: (() => void) | undefined;
    let isMounted = true;

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
        const spread =
          parseFloat(
            getComputedStyle(stackRef.current!).getPropertyValue('--spread')
          ) || 1;

        // ── Opening pose: one whole pizza, tilted, hovering under the headline
        gsap.set(stackRef.current, {
          y: () => window.innerHeight * 0.17,
          scale: 1.42,
          rotation: -7,
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
            end: '+=230%',
            pin: pinRef.current,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.to(progressRef.current, { scaleY: 1, duration: 1 }, 0);

        // 0 → 0.2: headline leaves, the pizza levels out and takes centre stage
        tl.to(introRef.current, { autoAlpha: 0, y: -36, duration: 0.1 }, 0.02);
        tl.to(
          stackRef.current,
          { y: 0, scale: 1, rotation: 0, ease: 'power2.inOut', duration: 0.2 },
          0
        );

        // 0.14 → 0.2: swap the baked pizza for its separate layers (still stacked)
        tl.to(layerEls, { opacity: 1, duration: 0.04 }, 0.14);
        tl.to(assembledRef.current, { opacity: 0, duration: 0.06 }, 0.16);

        // 0.17 → 0.56: the layers lift apart, top first
        LAYERS.forEach((layer, i) => {
          tl.to(
            layerEls[i]!,
            {
              yPercent: layer.explodeY * spread,
              rotation: layer.explodeRot,
              ease: 'power3.out',
              duration: 0.36,
            },
            0.17 + i * 0.012
          );
        });
        tl.to(
          shadowRef.current,
          { yPercent: 150 * spread, scaleX: 0.82, opacity: 0.55, ease: 'power3.out', duration: 0.36 },
          0.17
        );

        // 0.36 → 0.62: annotations draw in one by one
        calloutEls.forEach((el, i) => {
          const fromLeft = el.dataset.callout === 'left';
          const line = el.querySelector('[data-callout-line]');
          tl.fromTo(
            el,
            { autoAlpha: 0, x: fromLeft ? -26 : 26 },
            { autoAlpha: 1, x: 0, ease: 'power2.out', duration: 0.09 },
            0.36 + i * 0.055
          );
          if (line) {
            tl.fromTo(
              line,
              { scaleX: 0 },
              { scaleX: 1, ease: 'power2.out', duration: 0.09 },
              0.39 + i * 0.055
            );
          }
        });
        tl.to(
          stampRef.current,
          { autoAlpha: 1, scale: 1, ease: 'back.out(1.6)', duration: 0.08 },
          0.56
        );

        // 0.8 → 1: everything eases up to make room for the order call-to-action
        tl.to(
          stackRef.current,
          {
            y: () => -window.innerHeight * 0.075,
            scale: 0.9,
            ease: 'power2.inOut',
            duration: 0.14,
          },
          0.8
        );
        tl.to(
          outroRef.current,
          { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.12 },
          0.84
        );
        tl.to({}, { duration: 0.04 }, 0.96);
      }, sectionRef);

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
        className="relative bg-[#14110F] px-4 py-20 text-[#F9F4EC] md:px-8"
      >
        <div
          data-testid="exploded-pizza-reduced-motion"
          className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          <div className="text-center lg:text-left">
            <p className="mb-2 text-xs font-bold tracking-widest text-[#F1B24A] uppercase">
              {copy.signatureHero.eyebrow}
            </p>
            <h2
              id="exploded-pizza-heading"
              className="font-serif-heading text-3xl font-extrabold md:text-4xl"
            >
              {copy.signatureHero.heading}
            </h2>
            <p className="mt-2 text-sm text-[#CBBBA8]">
              {pizzaLabel} · {price} — {pizza.ingredients[locale]}
            </p>
            <img
              src={assembledImage}
              alt={`${pizzaLabel} — ${pizza.ingredients[locale]}`}
              width={1280}
              height={800}
              loading="lazy"
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
        {/* Warm spotlight + steam, behind everything */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-[70svh] w-[min(820px,110vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(241,178,74,0.13)_0%,rgba(238,106,43,0.05)_45%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 600 600"
            fill="none"
            className="animate-steam-drift h-[78svh] w-[78svh] opacity-25 blur-2xl"
          >
            <path
              d="M210 520 C150 410, 270 300, 195 180 C140 95, 235 45, 210 0"
              stroke="url(#explodedSteam)"
              strokeWidth="46"
              strokeLinecap="round"
            />
            <path
              d="M380 530 C450 415, 320 290, 400 175 C450 95, 355 40, 390 0"
              stroke="url(#explodedSteam)"
              strokeWidth="38"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="explodedSteam" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#F9F4EC" stopOpacity="0" />
                <stop offset="45%" stopColor="#F9F4EC" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F9F4EC" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

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
          <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-[#F1B24A] uppercase sm:text-xs">
            {copy.signatureHero.eyebrow}
          </p>
          <h2
            id="exploded-pizza-heading"
            className="font-serif-heading text-[1.7rem] leading-tight font-extrabold tracking-tight text-[#F9F4EC] sm:text-4xl md:text-[2.75rem]"
          >
            {copy.signatureHero.heading}
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[#CBBBA8]">
            {pizzaLabel} · {price}
            <span className="hidden sm:inline"> — {pizza.ingredients[locale]}</span>
          </p>
          <button
            type="button"
            onClick={handleOrder}
            className="btn-pill mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[#F1B24A] px-7 py-2.5 text-sm font-extrabold text-[#14110F] shadow-[0_8px_24px_rgba(241,178,74,0.35)] transition-transform hover:scale-105 hover:bg-[#F5C065]"
          >
            <span>{copy.signatureHero.ctaOrder}</span>
            <span aria-hidden="true">›</span>
          </button>
        </div>

        {/* The pizza */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            ref={stackRef}
            data-testid="exploded-pizza-layers"
            className="relative aspect-[16/10] w-[min(580px,88vw,60svh)] [--spread:1.45] will-change-transform md:[--spread:1]"
          >
            {/* Contact shadow */}
            <div
              ref={shadowRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[14%] bottom-[6%] z-0 h-[22%] rounded-[50%] bg-black/85 blur-2xl"
            />

            {/* Baked pizza (opening state) */}
            <div
              ref={assembledRef}
              data-layer-id="assembled"
              className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center will-change-[transform,opacity]"
            >
              <div data-parallax="0.6" className="h-full w-full">
                <img
                  src={assembledImage}
                  alt={`${pizzaLabel} — ${pizza.ingredients[locale]}`}
                  width={1280}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="pizza-layer-bob h-full w-full object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.75)]"
                />
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
                  className={`${layer.widthClass} aspect-[16/10]`}
                >
                  <img
                    src={layer.src}
                    alt={layerAlt[layer.id]}
                    width={1280}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    style={{ animationDelay: layer.bobDelay }}
                    className="pizza-layer-bob h-full w-full object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.7)]"
                  />
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
                    isLeft ? 'right-[81%] md:right-[90%]' : 'left-[81%] md:left-[90%]'
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
                      className={`w-[84px] sm:w-[120px] md:w-[176px] lg:w-[220px] ${
                        isLeft ? 'text-right' : 'text-left'
                      }`}
                    >
                      <p className="font-serif-heading text-lg leading-none font-extrabold text-[#F1B24A] md:text-2xl">
                        0{i + 1}
                      </p>
                      <p className="mt-1 text-[11px] leading-tight font-bold text-[#F9F4EC] [text-shadow:0_1px_8px_rgba(0,0,0,0.9)] md:text-base">
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
                        className={`block w-14 border-t border-dashed border-[#F9F4EC]/70 lg:w-24 ${
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
