'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getInteractive3dPizzas } from '@/data/menu';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { useBasketStore } from '@/store/basket';

export interface ExplodedPizzaProps {
  locale: Locale;
}

export function ExplodedPizza({ locale }: ExplodedPizzaProps) {
  const copy = getCopy(locale);
  const pizzas = getInteractive3dPizzas();
  const addItem = useBasketStore((s) => s.addItem);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const topHeaderRef = useRef<HTMLDivElement>(null);
  const liftedSliceRef = useRef<HTMLDivElement>(null);
  const layerCrownRef = useRef<HTMLDivElement>(null);
  const layerToppingsRef = useRef<HTMLDivElement>(null);
  const layerCheeseRef = useRef<HTMLDivElement>(null);
  const layerSauceRef = useRef<HTMLDivElement>(null);
  const layerDoughRef = useRef<HTMLDivElement>(null);
  const calloutsWrapRef = useRef<HTMLDivElement>(null);
  const mobileCalloutsRef = useRef<HTMLOListElement>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activePizza = pizzas[activeIndex] ?? pizzas[0]!;
  const p3d = activePizza.pizza3d;

  const goToPizza = useCallback(
    (nextIdx: number, direction: 'left' | 'right') => {
      const count = pizzas.length;
      if (count === 0) return;
      const wrapped = ((nextIdx % count) + count) % count;
      setSwipeDir(direction);
      setActiveIndex(wrapped);
      window.setTimeout(() => setSwipeDir(null), 320);
    },
    [pizzas.length]
  );

  const handlePrev = useCallback(() => {
    goToPizza(activeIndex - 1, 'left');
  }, [activeIndex, goToPizza]);

  const handleNext = useCallback(() => {
    goToPizza(activeIndex + 1, 'right');
  }, [activeIndex, goToPizza]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch || touchStartX.current === null || touchStartY.current === null) return;
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Horizontal swipe gesture (ignore vertical scroll gestures)
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // GSAP + ScrollTrigger timeline matching reference video frame_005 -> frame_012
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    if (mq.matches) {
      return;
    }

    let ctx: { revert: () => void } | undefined;
    let isMounted = true;

    (async () => {
      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');
      if (!isMounted || !sectionRef.current || !pinContainerRef.current) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const isMobile = window.innerWidth < 768;
        const yScale = isMobile ? 0.68 : 1;

        // Initial assembled state (matching frame_005.png: 3D pizza assembled in center, lifted cheese-pull slice visible, top header visible)
        gsap.set(topHeaderRef.current, { opacity: 1, y: 0 });
        gsap.set(liftedSliceRef.current, {
          opacity: 1,
          x: 18 * yScale,
          y: -34 * yScale,
          rotation: -6,
          scale: 1.02,
        });
        gsap.set(layerCrownRef.current, {
          y: -4 * yScale,
          rotation: -3,
          scale: 1,
        });
        gsap.set(layerToppingsRef.current, {
          opacity: 0.25,
          y: 0,
          scale: 0.92,
        });
        gsap.set(layerCheeseRef.current, {
          opacity: 0.15,
          y: 6 * yScale,
          scale: 0.92,
        });
        gsap.set(layerSauceRef.current, {
          opacity: 0.15,
          y: 12 * yScale,
          scale: 0.92,
        });
        gsap.set(layerDoughRef.current, {
          opacity: 0.85,
          y: 16 * yScale,
          scale: 0.98,
        });
        gsap.set(calloutsWrapRef.current, { opacity: 0, y: 12 });
        if (mobileCalloutsRef.current) {
          gsap.set(mobileCalloutsRef.current, { opacity: 0, y: 14 });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=230%',
            pin: pinContainerRef.current,
            scrub: 0.55,
          },
        });

        // Phase 1 (0 -> 0.22): Top header lifts away & lifted slice merges into the exploding crown (frame_005 -> frame_006)
        tl.to(
          topHeaderRef.current,
          {
            opacity: 0,
            y: -42,
            ease: 'power2.inOut',
            duration: 0.22,
          },
          0
        );

        tl.to(
          liftedSliceRef.current,
          {
            opacity: 0,
            x: 0,
            y: -155 * yScale,
            rotation: -7,
            duration: 0.25,
            ease: 'power2.inOut',
          },
          0.04
        );

        // Phase 2 (0.08 -> 0.58): 5-Layer 3D Vertical Explosion (frame_007 -> frame_010)
        tl.to(
          layerCrownRef.current,
          {
            y: -172 * yScale,
            rotation: -7,
            scale: 0.96,
            ease: 'power2.out',
            duration: 0.5,
          },
          0.08
        );

        tl.to(
          layerToppingsRef.current,
          {
            opacity: 1,
            y: -74 * yScale,
            rotation: 1.5,
            scale: 0.95,
            ease: 'power2.out',
            duration: 0.5,
          },
          0.08
        );

        tl.to(
          layerCheeseRef.current,
          {
            opacity: 1,
            y: 14 * yScale,
            rotation: -1,
            scale: 0.95,
            ease: 'power2.out',
            duration: 0.5,
          },
          0.08
        );

        tl.to(
          layerSauceRef.current,
          {
            opacity: 1,
            y: 96 * yScale,
            rotation: 1,
            scale: 0.94,
            ease: 'power2.out',
            duration: 0.5,
          },
          0.08
        );

        tl.to(
          layerDoughRef.current,
          {
            opacity: 1,
            y: 174 * yScale,
            rotation: 0,
            scale: 0.96,
            ease: 'power2.out',
            duration: 0.5,
          },
          0.08
        );

        // Callouts & L-shaped dotted leader lines + vintage circular stamps fade in (frame_008 -> frame_012)
        tl.to(
          calloutsWrapRef.current,
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            duration: 0.28,
          },
          0.32
        );

        if (mobileCalloutsRef.current) {
          tl.to(
            mobileCalloutsRef.current,
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              duration: 0.28,
            },
            0.32
          );
        }

        // Phase 3 (0.58 -> 1.0): Hold exploded state so user can swipe through all 15 pizzas and read ingredients (frame_009 -> frame_012)
        tl.to({}, { duration: 0.42 }, 0.58);
      }, sectionRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  const sauceImage =
    p3d.sauceType === 'white'
      ? '/images/layer-sauce-white.webp'
      : '/images/layer-sauce.webp';

  const handleOrderActivePizza = () => {
    addItem(activePizza.id, activePizza.sizes?.[0]?.id, 1);
    openDrawer();
  };

  return (
    <section
      id="exploded-pizza"
      ref={sectionRef}
      data-theme="dark"
      aria-labelledby="exploded-pizza-heading"
      className="relative bg-[#14110F] text-[#F9F4EC]"
    >
      {/* Visually hidden accessible text description */}
      <p className="sr-only">{copy.explodedPizza.srDescription}</p>

      {/* Main Pinned Dark 3D Stage (matching reference video frame_005 -> frame_012) */}
      <div
        ref={pinContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden rounded-b-[36px] border-b border-[#F9F4EC]/10 bg-[radial-gradient(ellipse_at_35%_25%,#2E231B_0%,#181411_55%,#0F0D0B_100%)] px-4 pt-14 pb-4 shadow-[0_24px_60px_rgba(0,0,0,0.85)] md:px-8 md:pt-16 md:pb-5"
      >
        {/* Ambient rising steam curls behind the 3D pizza (like frame_005 & frame_008) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <svg
            viewBox="0 0 600 600"
            className="animate-steam-drift h-[460px] w-[460px] opacity-25 blur-xl md:h-[620px] md:w-[620px]"
            fill="none"
          >
            <path
              d="M210 460 C150 370, 270 280, 195 170 C140 95, 235 45, 210 10"
              stroke="url(#steamGrad1)"
              strokeWidth="44"
              strokeLinecap="round"
            />
            <path
              d="M360 470 C430 375, 310 270, 395 165 C445 95, 355 40, 385 10"
              stroke="url(#steamGrad1)"
              strokeWidth="38"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="steamGrad1" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#F9F4EC" stopOpacity="0" />
                <stop offset="45%" stopColor="#F9F4EC" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#F9F4EC" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Left-edge vertical scroll indicator line + dots (matching reference video frame_005 - frame_012) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex"
        >
          <span className="h-14 w-[2px] bg-[#F9F4EC]/20" />
          <span className="h-8 w-[3px] rounded-full bg-[#F1B24A] shadow-[0_0_8px_#F1B24A]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F1B24A]" />
          <span className="h-2 w-2 rounded-full border border-[#F9F4EC]/40" />
          <span className="h-2 w-2 rounded-full border border-[#F9F4EC]/40" />
          <span className="h-2 w-2 rounded-full border border-[#F9F4EC]/40" />
        </div>

        {/* Top Header Block (Visible in frame_005, lifts upward as pizza explodes on scroll in frame_007) */}
        <div
          ref={topHeaderRef}
          className="relative z-30 mx-auto max-w-2xl text-center"
        >
          <p className="mb-1 text-xs font-bold tracking-widest text-[#F1B24A] uppercase">
            {copy.signatureHero.eyebrow} · {activeIndex + 1} / {pizzas.length}
          </p>
          <h2
            id="exploded-pizza-heading"
            className="font-serif-heading text-2xl font-extrabold tracking-tight text-[#F9F4EC] sm:text-4xl md:text-5xl"
          >
            Pizza {activePizza.name[locale]} · {formatCents(activePizza.priceCents)}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-[#CBBBA8] sm:text-sm">
            {activePizza.ingredients[locale]}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleOrderActivePizza}
              className="btn-pill inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#F1B24A] px-6 py-2 text-xs font-extrabold text-[#14110F] shadow-[0_8px_24px_rgba(241,178,74,0.35)] transition-transform hover:scale-105 hover:bg-[#F5C065] cursor-pointer sm:text-sm"
            >
              <span>{copy.signatureHero.ctaOrder}</span>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        {/* Center 3D Interactive Stage: Reduced-Motion Fallback OR 5-Layer 3D Exploding Pizza + 1:1 Swipe */}
        {reducedMotion ? (
          <div
            data-testid="exploded-pizza-reduced-motion"
            className="relative z-20 mx-auto my-6 grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-12"
          >
            <div className="flex flex-col items-center lg:col-span-6">
              <img
                src={p3d.image3d}
                alt={`Pizza ${activePizza.name[locale]} — ${activePizza.ingredients[locale]}`}
                width={640}
                height={400}
                className="aspect-[16/10] w-full max-w-[440px] object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.85)]"
              />
            </div>
            <ol className="flex flex-col gap-3 lg:col-span-6">
              {[p3d.calloutTopLeft, p3d.calloutBottomLeft, p3d.calloutTopRight].map(
                (c, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-[#F9F4EC]/15 bg-[#14110F]/90 p-4"
                  >
                    <p className="font-serif-heading text-base font-bold text-[#F1B24A]">
                      {c.title[locale]} · {c.subtitle[locale]}
                    </p>
                    <p className="mt-1 text-xs text-[#CBBBA8]">{c.detail[locale]}</p>
                  </li>
                )
              )}
            </ol>
          </div>
        ) : (
          <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center">
            {/* Prev / Next 1:1 Swipe Arrow Controls */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label={
                locale === 'ca' ? 'Pizza anterior (Swipe)' : 'Pizza anterior (Swipe)'
              }
              data-testid="pizza-3d-prev"
              className="absolute top-1/2 left-0 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F9F4EC]/20 bg-[#14110F]/75 text-[#F9F4EC] backdrop-blur-md transition-all hover:scale-110 hover:border-[#F1B24A] hover:text-[#F1B24A] cursor-pointer md:left-6 md:h-12 md:w-12"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label={
                locale === 'ca' ? 'Pizza següent (Swipe)' : 'Pizza siguiente (Swipe)'
              }
              data-testid="pizza-3d-next"
              className="absolute top-1/2 right-0 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F9F4EC]/20 bg-[#14110F]/75 text-[#F9F4EC] backdrop-blur-md transition-all hover:scale-110 hover:border-[#F1B24A] hover:text-[#F1B24A] cursor-pointer md:right-6 md:h-12 md:w-12"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* The 5-Layer 3D Exploding Stack + L-Shaped Dotted Leader Lines */}
            <div className="relative flex h-[290px] w-full items-center justify-center sm:h-[360px] md:h-[410px]">
              <div
                data-testid="exploded-pizza-layers"
                className={`relative h-full w-full max-w-[330px] transition-transform duration-300 sm:max-w-[460px] md:max-w-[560px] ${
                  swipeDir === 'right'
                    ? 'translate-x-3 scale-[0.98]'
                    : swipeDir === 'left'
                      ? '-translate-x-3 scale-[0.98]'
                      : 'translate-x-0 scale-100'
                }`}
              >
                {/* Realistic dark table floor shadow & semolina crumbs at the bottom */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-10 bottom-2 z-0 h-14 rounded-full bg-black/80 blur-2xl"
                />

                {/* LAYER 5 (Bottom, z-10): 3D 48h Fermented Artisan Dough Base */}
                <div
                  ref={layerDoughRef}
                  data-layer-id="crust"
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center will-change-transform"
                >
                  <img
                    src="/images/layer-crust.webp"
                    alt={
                      locale === 'ca'
                        ? 'Capa 5: Massa artesanal fermentada 48 hores'
                        : 'Capa 5: Masa artesanal fermentada 48 horas'
                    }
                    width={1280}
                    height={800}
                    className="aspect-[16/10] w-full object-contain drop-shadow-[0_26px_28px_rgba(0,0,0,0.92)]"
                  />
                </div>

                {/* LAYER 4 (z-20): 3D Sauce Layer (Glossy Red Tomato Sauce OR Creamy White Base) */}
                <div
                  ref={layerSauceRef}
                  data-layer-id="sauce"
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center will-change-transform"
                >
                  <img
                    src={sauceImage}
                    alt={
                      p3d.sauceType === 'white'
                        ? 'Capa 4: Base blanca cremosa'
                        : 'Capa 4: Salsa de tomate artesanal'
                    }
                    width={1280}
                    height={800}
                    className="aspect-[16/10] w-[88%] object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.8)]"
                  />
                </div>

                {/* LAYER 3 (z-30): 3D Melted Bubbling Mozzarella Sheet */}
                <div
                  ref={layerCheeseRef}
                  data-layer-id="cheese"
                  className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center will-change-transform"
                >
                  <img
                    src="/images/layer-cheese.webp"
                    alt="Capa 3: Mozzarella fundida"
                    width={1280}
                    height={800}
                    className="aspect-[16/10] w-[92%] object-contain drop-shadow-[0_20px_24px_rgba(0,0,0,0.82)]"
                  />
                </div>

                {/* LAYER 2 (z-40): 3D Mid-Air Floating Toppings of Active Pizza & Dripping Cheese Pulls */}
                <div
                  ref={layerToppingsRef}
                  data-layer-id="toppings"
                  className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center will-change-transform"
                >
                  {/* Stretchy 3D Melted Mozzarella Cheese Pulls (matching frame_008.png) */}
                  <svg
                    viewBox="0 0 600 360"
                    className="absolute inset-0 h-full w-full opacity-90 drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)]"
                    fill="none"
                    aria-hidden="true"
                  >
                    {/* Left cheese pull arch */}
                    <path
                      d="M175 110 C195 140, 198 185, 190 225 C188 238, 198 238, 202 222 C210 185, 222 165, 240 205 C246 218, 254 215, 252 195 C248 158, 265 130, 285 115 Z"
                      fill="url(#cheesePullGrad)"
                    />
                    {/* Right cheese pull arch */}
                    <path
                      d="M325 118 C342 152, 338 195, 335 230 C334 242, 344 242, 348 225 C356 188, 372 172, 382 215 C385 228, 394 225, 395 205 C396 165, 412 140, 430 122 Z"
                      fill="url(#cheesePullGrad)"
                    />
                    <defs>
                      <linearGradient id="cheesePullGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F5D798" />
                        <stop offset="50%" stopColor="#FCE9BE" />
                        <stop offset="100%" stopColor="#DFB368" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <img
                    src={p3d.floatingToppings3d}
                    alt={`Capa 2: Ingredientes de ${activePizza.name[locale]}`}
                    width={1280}
                    height={800}
                    className="relative z-10 aspect-[16/10] w-[95%] object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.85)]"
                  />
                </div>

                {/* LAYER 1 (Top Crown, z-50): Tilted 3D Volumetric Pizza of Active Variety + Fresh 3D Basil Leaves */}
                <div
                  ref={layerCrownRef}
                  data-layer-id="basil"
                  className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center will-change-transform"
                >
                  <img
                    src={p3d.image3d}
                    alt={`Pizza 3D ${activePizza.name[locale]}`}
                    width={1280}
                    height={800}
                    className="aspect-[16/10] w-full object-contain drop-shadow-[0_26px_32px_rgba(0,0,0,0.9)]"
                  />
                  {/* Fresh 3D Basil Leaves crowning the top layer */}
                  <img
                    src="/images/layer-basil.webp"
                    alt=""
                    aria-hidden="true"
                    width={1280}
                    height={800}
                    className="pointer-events-none absolute inset-0 -translate-y-4 scale-90 object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.75)]"
                  />
                </div>

                {/* Lifted 3D Cheese-Pull Slice (Visible in assembled frame_005 state, merges as scroll explodes) */}
                <div
                  ref={liftedSliceRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center will-change-transform"
                >
                  {/* Stretchy melted cheese strings connecting the lifted slice to the pizza below */}
                  <svg
                    viewBox="0 0 600 360"
                    className="absolute inset-0 h-full w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.65)]"
                    fill="none"
                  >
                    <path
                      d="M315 145 C320 172, 316 198, 312 215 C318 215, 326 185, 336 165 C342 185, 340 212, 345 218 C352 212, 355 182, 368 158 C375 178, 374 205, 380 212 C386 204, 392 174, 405 152 Z"
                      fill="#FCE7B8"
                      fillOpacity="0.92"
                    />
                  </svg>
                  {/* Upper-right wedge slice clipped from the active 3D pizza */}
                  <img
                    src={p3d.image3d}
                    alt=""
                    width={1280}
                    height={800}
                    style={{
                      clipPath: 'polygon(50% 49%, 64% 12%, 95% 24%, 88% 52%)',
                    }}
                    className="aspect-[16/10] w-full object-contain drop-shadow-[0_22px_22px_rgba(0,0,0,0.88)]"
                  />
                </div>
              </div>

              {/* Desktop Callouts with L-Shaped White Dotted SVG Leader Lines & 2 Vintage Circular Stamps (matching frame_008 - frame_012) */}
              <div
                ref={calloutsWrapRef}
                className="pointer-events-none absolute inset-0 z-30 hidden md:block"
              >
                {/* 1. TOP-LEFT CALLOUT + L-shaped dotted leader line */}
                <div className="absolute top-[12%] left-4 flex flex-col items-start lg:left-10">
                  <p className="font-serif-heading text-xl font-extrabold text-[#F9F4EC] lg:text-2xl">
                    {p3d.calloutTopLeft.title[locale]}
                  </p>
                  <p className="text-xs font-bold text-[#F1B24A]">
                    {p3d.calloutTopLeft.subtitle[locale]}
                  </p>
                  <p className="mt-0.5 max-w-[190px] text-[11px] leading-snug text-[#CBBBA8]">
                    {p3d.calloutTopLeft.detail[locale]}
                  </p>
                  {/* L-shaped white dotted leader line down then right */}
                  <svg
                    width="135"
                    height="58"
                    viewBox="0 0 135 58"
                    fill="none"
                    className="mt-1.5"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="6" r="3.5" fill="#F9F4EC" />
                    <path
                      d="M8 6 V38 H68 V50 H126"
                      stroke="#F9F4EC"
                      strokeWidth="1.6"
                      strokeDasharray="3 4"
                    />
                    <circle cx="126" cy="50" r="4" fill="#F9F4EC" />
                  </svg>
                </div>

                {/* 2. BOTTOM-LEFT CALLOUT + L-shaped dotted leader line */}
                <div className="absolute top-[48%] left-4 flex flex-col items-start lg:left-10">
                  <p className="font-serif-heading text-xl font-extrabold text-[#F9F4EC] lg:text-2xl">
                    {p3d.calloutBottomLeft.title[locale]}
                  </p>
                  <p className="text-xs font-bold text-[#F1B24A]">
                    {p3d.calloutBottomLeft.subtitle[locale]}
                  </p>
                  <p className="mt-0.5 max-w-[190px] text-[11px] leading-snug text-[#CBBBA8]">
                    {p3d.calloutBottomLeft.detail[locale]}
                  </p>
                  <svg
                    width="140"
                    height="56"
                    viewBox="0 0 140 56"
                    fill="none"
                    className="mt-1.5"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="6" r="3.5" fill="#F9F4EC" />
                    <path
                      d="M8 6 V48 H130"
                      stroke="#F9F4EC"
                      strokeWidth="1.6"
                      strokeDasharray="3 4"
                    />
                    <circle cx="130" cy="48" r="4" fill="#F9F4EC" />
                  </svg>
                </div>

                {/* 3. TOP-RIGHT CALLOUT + L-shaped dotted leader line */}
                <div className="absolute top-[18%] right-4 flex flex-col items-end text-right lg:right-10">
                  <p className="font-serif-heading text-xl font-extrabold text-[#F9F4EC] lg:text-2xl">
                    {p3d.calloutTopRight.title[locale]}
                  </p>
                  <p className="text-xs font-bold text-[#F1B24A]">
                    {p3d.calloutTopRight.subtitle[locale]}
                  </p>
                  <p className="mt-0.5 max-w-[190px] text-[11px] leading-snug text-[#CBBBA8]">
                    {p3d.calloutTopRight.detail[locale]}
                  </p>
                  <svg
                    width="145"
                    height="54"
                    viewBox="0 0 145 54"
                    fill="none"
                    className="mt-1.5"
                    aria-hidden="true"
                  >
                    <circle cx="136" cy="6" r="3.5" fill="#F9F4EC" />
                    <path
                      d="M136 6 V46 H10"
                      stroke="#F9F4EC"
                      strokeWidth="1.6"
                      strokeDasharray="3 4"
                    />
                    <circle cx="10" cy="46" r="4" fill="#F9F4EC" />
                  </svg>
                </div>

                {/* 4. BOTTOM-RIGHT TWO VINTAGE CIRCULAR STAMPS + Dotted Leader Lines (matching frame_008 - frame_012) */}
                <div className="absolute top-[52%] right-4 flex flex-col items-end gap-3 lg:right-10">
                  {/* Top connector from cheese layer into the stamp column */}
                  <svg
                    width="150"
                    height="46"
                    viewBox="0 0 150 46"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="4" fill="#F9F4EC" />
                    <path
                      d="M8 8 H114 V40"
                      stroke="#F9F4EC"
                      strokeWidth="1.6"
                      strokeDasharray="3 4"
                    />
                    <circle cx="114" cy="40" r="3" fill="#F9F4EC" />
                  </svg>

                  {/* Stamp 1: Authentic Artisan Recipe Stamp */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-18 w-18 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#F9F4EC]/75 bg-[#14110F]/80 p-1.5 text-center shadow-lg">
                      <span className="text-[8px] font-bold tracking-widest text-[#F1B24A] uppercase">
                        La Piccerella
                      </span>
                      <span className="font-serif-heading text-[11px] leading-tight font-extrabold text-[#F9F4EC]">
                        Receta
                        <br />
                        Artesanal
                      </span>
                      <span className="text-[7px] tracking-wider text-[#CBBBA8] uppercase">
                        Badalona
                      </span>
                    </div>
                  </div>

                  {/* Stamp 2: 48h Fermented Dough Stamp with horizontal dotted leader line pointing to dough layer */}
                  <div className="flex items-center gap-2">
                    <svg
                      width="88"
                      height="16"
                      viewBox="0 0 88 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="4" fill="#F9F4EC" />
                      <line
                        x1="8"
                        y1="8"
                        x2="84"
                        y2="8"
                        stroke="#F9F4EC"
                        strokeWidth="1.6"
                        strokeDasharray="3 4"
                      />
                    </svg>
                    <div className="flex h-18 w-18 flex-col items-center justify-center rounded-full border-2 border-[#F9F4EC]/75 bg-[#14110F]/80 p-1.5 text-center shadow-lg">
                      <span className="text-[8px] font-bold tracking-widest text-[#CBBBA8] uppercase">
                        Fermentación
                      </span>
                      <span className="font-serif-heading text-sm leading-tight font-extrabold text-[#F1B24A]">
                        48 H
                      </span>
                      <span className="text-[8px] font-semibold text-[#F9F4EC] uppercase">
                        Masa Fina
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Callouts List below the 3D pizza (< 768px) */}
            <ol
              ref={mobileCalloutsRef}
              data-testid="exploded-pizza-mobile-callouts"
              className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-3 md:hidden"
            >
              {[p3d.calloutTopLeft, p3d.calloutBottomLeft, p3d.calloutTopRight].map(
                (callout, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-[#F9F4EC]/15 bg-[#14110F]/85 px-3 py-2"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1B24A] text-[11px] font-extrabold text-[#14110F]">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-serif-heading text-xs font-bold text-[#F9F4EC]">
                        {callout.title[locale]}
                      </p>
                      <p className="truncate text-[11px] text-[#CBBBA8]">
                        {callout.detail[locale]}
                      </p>
                    </div>
                  </li>
                )
              )}
            </ol>
          </div>
        )}

        {/* Bottom 1:1 Pizza Carousel Selector Pills & Dash Indicators (matching frame_008 - frame_012) */}
        <div className="relative z-30 mx-auto mt-2 flex w-full max-w-5xl flex-col items-center gap-3">
          {/* Dash indicators matching the reference video */}
          <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
            {pizzas.map((p, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    goToPizza(idx, idx > activeIndex ? 'right' : 'left')
                  }
                  tabIndex={-1}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-8 bg-[#F1B24A] shadow-[0_0_8px_#F1B24A]'
                      : 'w-3 bg-[#F9F4EC]/25 hover:bg-[#F9F4EC]/50'
                  }`}
                />
              );
            })}
          </div>

          {/* 1:1 Scrollable Pizza Selector Pill Bar so the customer can tap or swipe any of the 15 pizzas */}
          <div
            role="tablist"
            aria-label={
              locale === 'ca'
                ? 'Selecciona qualsevol de les 15 pizzes per veure-la 1:1 en 3D'
                : 'Selecciona cualquiera de las 15 pizzas para verla 1:1 en 3D'
            }
            className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto px-2 py-1"
          >
            {pizzas.map((pizza, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={pizza.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-testid={`pizza-3d-pill-${pizza.id}`}
                  onClick={() =>
                    goToPizza(idx, idx > activeIndex ? 'right' : 'left')
                  }
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#F1B24A] bg-[#F1B24A] text-[#14110F] shadow-[0_0_14px_rgba(241,178,74,0.45)]'
                      : 'border-[#F9F4EC]/20 bg-[#14110F]/70 text-[#CBBBA8] hover:border-[#F9F4EC]/50 hover:text-[#F9F4EC]'
                  }`}
                >
                  {pizza.name[locale]} · {formatCents(pizza.priceCents)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Dark Summary Band below the rounded 3D stage (matching reference video frame_010 - frame_012) */}
      <div className="mx-auto max-w-5xl px-4 py-14 text-center md:px-8 md:py-18">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="hidden border-r border-[#F9F4EC]/15 pr-6 text-right md:col-span-3 md:block">
            <p className="font-serif-heading text-3xl font-extrabold text-[#F9F4EC]">
              48 <span className="text-lg font-normal text-[#CBBBA8]">h</span>
            </p>
            <p className="mt-1 text-xs text-[#CBBBA8]">
              {locale === 'ca' ? 'Fermentació lenta' : 'Fermentación lenta'}
            </p>
          </div>

          <div className="md:col-span-6">
            <h3 className="font-serif-heading text-2xl font-extrabold text-[#F9F4EC] sm:text-3xl">
              {locale === 'ca' ? 'Tradició, qualitat i sabor' : 'Tradición, calidad y sabor'}{' '}
              <span className="text-[#F1B24A]">La Piccerella</span>
            </h3>
          </div>

          <div className="hidden border-l border-[#F9F4EC]/15 pl-6 text-left md:col-span-3 md:block">
            <p className="font-serif-heading text-3xl font-extrabold text-[#F9F4EC]">
              100 <span className="text-lg font-normal text-[#CBBBA8]">%</span>
            </p>
            <p className="mt-1 text-xs text-[#CBBBA8]">
              {locale === 'ca' ? 'Obrador artesanal' : 'Obrador artesanal'}
            </p>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-[#CBBBA8] sm:text-sm">
          {copy.signatureHero.body}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleOrderActivePizza}
            data-testid="exploded-order-now-cta"
            className="btn-pill inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#EE6A2B] px-12 py-3.5 text-base font-extrabold text-[#14110F] shadow-[0_12px_36px_rgba(238,106,43,0.45)] transition-transform hover:scale-105 hover:bg-[#F37D44] cursor-pointer md:text-lg"
          >
            {locale === 'ca'
              ? `Demanar ${activePizza.name.ca} (${formatCents(activePizza.priceCents)})`
              : `Pedir ${activePizza.name.es} (${formatCents(activePizza.priceCents)})`}
          </button>
        </div>
      </div>
    </section>
  );
}
