'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCopy, type Locale } from '@/data/copy';
import { getButtonClasses } from '@/components/ui/Button';

export interface ExplodedPizzaProps {
  locale: Locale;
  /** Option B flag: defaults to NEXT_PUBLIC_USE_FRAME_SEQUENCE === 'true' */
  useFrameSequence?: boolean;
}

interface LayerSpec {
  id: string;
  src: string;
  alt: { es: string; ca: string };
  /** Target Y separation in px when exploded (0 -> 0.5 scroll progress) */
  explodeY: number;
  /** Subtle rotation in degrees when separated */
  explodeRotate: number;
  /** Scale adjustment when separated */
  explodeScale: number;
  zIndex: number;
}

const PIZZA_LAYERS: LayerSpec[] = [
  {
    id: 'crust',
    src: '/images/layer-crust.webp',
    alt: {
      es: 'Capa 5: Masa artesanal con 48 horas de fermentación',
      ca: 'Capa 5: Massa artesanal amb 48 hores de fermentació',
    },
    explodeY: 165,
    explodeRotate: -1.5,
    explodeScale: 0.98,
    zIndex: 10,
  },
  {
    id: 'sauce',
    src: '/images/layer-sauce.webp',
    alt: {
      es: 'Capa 4: Salsa de tomate seleccionada',
      ca: 'Capa 4: Salsa de tomàquet seleccionada',
    },
    explodeY: 82,
    explodeRotate: 1.2,
    explodeScale: 0.96,
    zIndex: 20,
  },
  {
    id: 'cheese',
    src: '/images/layer-cheese.webp',
    alt: {
      es: 'Capa 3: Mozzarella fundida',
      ca: 'Capa 3: Mozzarella fosa',
    },
    explodeY: 0,
    explodeRotate: -0.8,
    explodeScale: 0.96,
    zIndex: 30,
  },
  {
    id: 'toppings',
    src: '/images/layer-toppings.webp',
    alt: {
      es: 'Capa 2: Ingredientes frescos seleccionados',
      ca: 'Capa 2: Ingredients frescos seleccionats',
    },
    explodeY: -84,
    explodeRotate: 1.8,
    explodeScale: 0.95,
    zIndex: 40,
  },
  {
    id: 'basil',
    src: '/images/layer-basil.webp',
    alt: {
      es: 'Capa 1: Albahaca fresca y aceite de oliva',
      ca: "Capa 1: Alfàbrega fresca i oli d'oliva",
    },
    explodeY: -165,
    explodeRotate: -2.2,
    explodeScale: 0.94,
    zIndex: 50,
  },
];

// Desktop callout positions (alternating left / right around the exploded stack)
const CALLOUT_DESKTOP_POSITIONS: {
  side: 'left' | 'right';
  topPercent: number;
  layerYPercent: number;
}[] = [
  { side: 'left', topPercent: 14, layerYPercent: 20 }, // 01 Basil (top layer)
  { side: 'right', topPercent: 28, layerYPercent: 34 }, // 02 Toppings
  { side: 'left', topPercent: 48, layerYPercent: 50 }, // 03 Mozzarella
  { side: 'right', topPercent: 66, layerYPercent: 66 }, // 04 Tomato sauce
  { side: 'left', topPercent: 82, layerYPercent: 80 }, // 05 48h fermented dough (bottom layer)
];

export function ExplodedPizza({ locale, useFrameSequence }: ExplodedPizzaProps) {
  const copy = getCopy(locale);

  const optionBEnabled =
    useFrameSequence ??
    process.env.NEXT_PUBLIC_USE_FRAME_SEQUENCE === 'true';

  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [frameSequenceFailed, setFrameSequenceFailed] = useState(false);

  // Option B: Progressive frame-sequence canvas scrubbing (when flag is enabled)
  useEffect(() => {
    if (!optionBEnabled || reducedMotion || frameSequenceFailed) return;
    if (typeof window === 'undefined') return;

    const totalFrames = 90;
    const images: HTMLImageElement[] = [];
    let firstFrameLoaded = false;

    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      const img = images[index];
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return;
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    const frame1 = new Image();
    frame1.src = '/frames/f_001.webp';
    frame1.onload = () => {
      firstFrameLoaded = true;
      drawFrame(0);
      for (let i = 2; i <= totalFrames; i++) {
        const img = new Image();
        img.src = `/frames/f_${String(i).padStart(3, '0')}.webp`;
        images[i - 1] = img;
      }
    };
    frame1.onerror = () => {
      if (!firstFrameLoaded) {
        setFrameSequenceFailed(true);
      }
    };
    images[0] = frame1;
  }, [optionBEnabled, reducedMotion, frameSequenceFailed]);

  // Option A (default): GSAP + ScrollTrigger 5-layer explosion (0 -> 0.5 explode, 0.5 -> 0.85 hold, 0.85 -> 1 reassemble)
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
        const yMultiplier = isMobile ? 0.55 : 1;

        // Initial compact stacked state
        PIZZA_LAYERS.forEach((_, idx) => {
          const el = layerRefs.current[idx];
          if (el) {
            gsap.set(el, {
              y: (2 - idx) * 6,
              rotation: 0,
              scale: 1,
            });
          }
        });

        calloutRefs.current.forEach((el) => {
          if (el) {
            gsap.set(el, { opacity: 0, y: 12 });
          }
        });

        if (ctaRef.current) {
          gsap.set(ctaRef.current, { opacity: 0.35, y: 12 });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=200%',
            pin: pinContainerRef.current,
            scrub: 0.6,
          },
        });

        // Phase 1 (0 -> 0.5): Layers separate vertically + callouts fade in
        PIZZA_LAYERS.forEach((layer, idx) => {
          const el = layerRefs.current[idx];
          if (!el) return;
          tl.to(
            el,
            {
              y: layer.explodeY * yMultiplier,
              rotation: layer.explodeRotate,
              scale: layer.explodeScale,
              ease: 'power2.out',
              duration: 0.5,
            },
            0
          );
        });

        calloutRefs.current.forEach((el, idx) => {
          if (!el) return;
          tl.to(
            el,
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              duration: 0.25,
            },
            0.15 + idx * 0.05
          );
        });

        // Phase 2 (0.5 -> 0.85): Hold separated so customer can read ingredient callouts
        tl.to({}, { duration: 0.35 }, 0.5);

        // Phase 3 (0.85 -> 1.0): Layers drift back together and reveal the final CTA
        PIZZA_LAYERS.forEach((_, idx) => {
          const el = layerRefs.current[idx];
          if (!el) return;
          tl.to(
            el,
            {
              y: (2 - idx) * 5,
              rotation: 0,
              scale: 1,
              ease: 'power2.inOut',
              duration: 0.15,
            },
            0.85
          );
        });

        if (ctaRef.current) {
          tl.to(
            ctaRef.current,
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              duration: 0.15,
            },
            0.85
          );
        }
      }, sectionRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="exploded-pizza"
      ref={sectionRef}
      data-theme="dark"
      aria-labelledby="exploded-pizza-heading"
      className="relative bg-[#1F1813] text-[#F9F4EC]"
    >
      {/* Visually hidden accessible text description of the pinned scroll animation (Section 6.4) */}
      <p className="sr-only">{copy.explodedPizza.srDescription}</p>

      <div
        ref={pinContainerRef}
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-4 py-16 md:px-8 md:py-20"
      >
        {/* Top Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
            {copy.explodedPizza.eyebrow}
          </p>
          <h2
            id="exploded-pizza-heading"
            className="font-serif-heading mb-3 text-3xl font-bold md:text-5xl"
          >
            {copy.explodedPizza.heading}
          </h2>
          <p className="text-sm text-[#CBBBA8] md:text-base">
            {copy.explodedPizza.subheading}
          </p>
        </div>

        {/* Center Stage: Reduced-motion static fallback OR Pinned 5-layer Exploded Pizza */}
        {reducedMotion ? (
          <div
            data-testid="exploded-pizza-reduced-motion"
            className="my-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12"
          >
            <div className="flex justify-center lg:col-span-6">
              <img
                src="/images/pizza-hero.webp"
                alt={copy.explodedPizza.srDescription}
                width={520}
                height={520}
                loading="lazy"
                className="aspect-square w-full max-w-[380px] object-contain"
              />
            </div>
            <ol className="flex flex-col gap-4 lg:col-span-6">
              {copy.explodedPizza.callouts.map((callout) => (
                <li
                  key={callout.id}
                  className="flex items-start gap-4 rounded-2xl border border-[#F9F4EC]/15 bg-[#14110F] p-4"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EE6A2B] bg-[#EE6A2B]/15 text-xs font-bold text-[#EE6A2B]">
                    {callout.badge}
                  </span>
                  <div>
                    <h3 className="font-serif-heading text-lg font-bold text-[#F9F4EC]">
                      {callout.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-[#CBBBA8]">{callout.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="relative my-4 flex flex-1 flex-col items-center justify-center">
            {/* Desktop Exploded Stage with SVG dotted leader lines and circular badges */}
            <div className="relative flex h-[340px] w-full max-w-5xl items-center justify-center sm:h-[440px] md:h-[520px]">
              {optionBEnabled && !frameSequenceFailed ? (
                <canvas
                  ref={canvasRef}
                  width={1440}
                  height={900}
                  className="h-full w-full max-w-2xl object-contain"
                />
              ) : (
                <div
                  data-testid="exploded-pizza-layers"
                  className="relative h-full w-full max-w-[340px] sm:max-w-[460px] md:max-w-[560px]"
                >
                  {PIZZA_LAYERS.map((layer, idx) => (
                    <div
                      key={layer.id}
                      ref={(el) => {
                        layerRefs.current[idx] = el;
                      }}
                      data-layer-id={layer.id}
                      style={{ zIndex: layer.zIndex }}
                      className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform"
                    >
                      <img
                        src={layer.src}
                        alt={layer.alt[locale]}
                        width={1600}
                        height={1000}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.75)]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Desktop Callouts with dotted SVG leader lines (hidden on mobile < 768px) */}
              <div className="pointer-events-none absolute inset-0 hidden md:block">
                {copy.explodedPizza.callouts.map((callout, idx) => {
                  const pos = CALLOUT_DESKTOP_POSITIONS[idx] ?? {
                    side: 'left',
                    topPercent: 50,
                    layerYPercent: 50,
                  };
                  const isLeft = pos.side === 'left';

                  return (
                    <div
                      key={callout.id}
                      ref={(el) => {
                        calloutRefs.current[idx] = el;
                      }}
                      style={{ top: `${pos.topPercent}%` }}
                      className={`absolute flex w-[270px] items-center gap-3 ${
                        isLeft ? 'left-0 flex-row' : 'right-0 flex-row-reverse text-right'
                      }`}
                    >
                      <div className="flex-1 rounded-2xl border border-[#F9F4EC]/15 bg-[#14110F]/90 px-4 py-2.5 shadow-lg backdrop-blur-xs">
                        <div
                          className={`flex items-center gap-2 ${
                            isLeft ? '' : 'flex-row-reverse'
                          }`}
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EE6A2B] text-[11px] font-bold text-[#14110F]">
                            {callout.badge}
                          </span>
                          <p className="font-serif-heading text-sm font-bold text-[#F9F4EC]">
                            {callout.title}
                          </p>
                        </div>
                        <p className="mt-1 text-xs leading-snug text-[#CBBBA8]">
                          {callout.detail}
                        </p>
                      </div>

                      {/* Dotted SVG leader line connecting callout card to pizza layer */}
                      <svg
                        width="56"
                        height="16"
                        viewBox="0 0 56 16"
                        fill="none"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <line
                          x1={isLeft ? '2' : '54'}
                          y1="8"
                          x2={isLeft ? '50' : '6'}
                          y2="8"
                          stroke="#EE6A2B"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={isLeft ? '50' : '6'}
                          cy="8"
                          r="3.5"
                          fill="#EE6A2B"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Callouts List below the pizza (< 768px, Section 6.4 requirement) */}
            <ol
              data-testid="exploded-pizza-mobile-callouts"
              className="mt-4 grid w-full grid-cols-1 gap-2.5 md:hidden"
            >
              {copy.explodedPizza.callouts.map((callout) => (
                <li
                  key={callout.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#F9F4EC]/12 bg-[#14110F]/90 px-3.5 py-2.5"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EE6A2B] text-xs font-bold text-[#14110F]">
                    {callout.badge}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif-heading text-sm font-bold text-[#F9F4EC]">
                      {callout.title}
                    </p>
                    <p className="text-xs text-[#CBBBA8]">{callout.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Bottom CTA revealed as layers reassemble */}
        <div ref={ctaRef} className="mt-4 text-center">
          <a href="#carta" className={getButtonClasses('primary', 'lg')}>
            {copy.explodedPizza.ctaAfterExplode}
          </a>
        </div>
      </div>
    </section>
  );
}
