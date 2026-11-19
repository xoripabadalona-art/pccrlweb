'use client';

import React, { useEffect, useRef, useState } from 'react';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import { LaPiccerella3DCubeHero } from './LaPiccerella3DCubeHero';

export interface HeroStoryProps {
  locale: Locale;
}

export function HeroStory({ locale }: HeroStoryProps) {
  const copy = getCopy(locale);

  const sectionRef = useRef<HTMLElement>(null);
  const pinViewportRef = useRef<HTMLDivElement>(null);
  const interiorLayerRef = useRef<HTMLDivElement>(null);
  const storefrontLayerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manualSlide, setManualSlide] = useState<0 | 1 | null>(null);

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
      if (!isMounted || !sectionRef.current || !interiorLayerRef.current) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.set(storefrontLayerRef.current, {
          scale: 1,
          transformOrigin: '60% 66%',
        });
        gsap.set(interiorLayerRef.current, {
          opacity: 0,
          scale: 1.22,
          transformOrigin: '50% 50%',
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=105%',
            pin: pinViewportRef.current,
            scrub: 0.5,
            onUpdate: (self) => {
              setManualSlide(null);
              setProgress(self.progress);
            },
          },
        });

        // Camera zooms through the front glass door of the 3D exterior pizzeria (matching video f_006 -> f_010 -> f_014)
        tl.to(
          storefrontLayerRef.current,
          {
            scale: 2.15,
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        );

        tl.to(
          interiorLayerRef.current,
          {
            opacity: 1,
            scale: 1,
            ease: 'power2.inOut',
            duration: 0.78,
          },
          0.22
        );
      }, sectionRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  const activeSlide =
    manualSlide !== null ? manualSlide : progress > 0.45 ? 1 : 0;

  return (
    <section
      id="hero-story"
      ref={sectionRef}
      data-theme="dark"
      aria-label={copy.heroStory.h1}
      className="relative w-full bg-[#14110F] text-[#F9F4EC]"
    >
      {/* Server-rendered H1 for SEO and screen readers */}
      <h1 className="sr-only">{copy.heroStory.h1}</h1>

      <div
        ref={pinViewportRef}
        className="relative h-[68vh] min-h-[440px] max-h-[760px] w-full overflow-hidden sm:h-[74vh] md:h-[80vh]"
      >
        {/* Slide 1: 3D Disney/Pixar Clay Miniature Cube Storefront of La Piccerella with giant rooftop pizza slice & animated Gustavo */}
        <div
          ref={storefrontLayerRef}
          className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_46%,_#3E2822_0%,_#221816_58%,_#14110F_100%)] pt-14 pb-8 px-3 sm:pt-16 sm:pb-10 will-change-transform"
        >
          {/* Warm soft Pixar studio rim glow behind the 3D clay cube building */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 h-[78%] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,176,94,0.22)_0%,_rgba(238,106,43,0.08)_46%,_transparent_74%)] blur-2xl"
          />
          <div className="relative z-10 flex h-full w-full max-w-[820px] items-center justify-center">
            <LaPiccerella3DCubeHero />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#14110F]/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#14110F]/45 to-transparent" />
        </div>

        {/* Slide 2: Stylized Warm Interior of La Piccerella (camera flies through the open doorway into the dining room) */}
        <div
          ref={interiorLayerRef}
          className="absolute inset-0 z-10 will-change-transform"
          style={{
            opacity:
              manualSlide !== null
                ? manualSlide === 1
                  ? 1
                  : 0
                : reducedMotion
                  ? 0
                  : undefined,
            transition: manualSlide !== null ? 'opacity 0.45s ease' : undefined,
          }}
        >
          <img
            src="/images/hero-interior-cube-v3.webp"
            alt={`${site.name} — ${copy.heroStory.slide2Label}`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#14110F]/65 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#14110F]/55 to-transparent" />
        </div>

        {/* Minimal horizontal dash slide indicators at bottom center (matching video frame_001 & frame_003) */}
        <div
          className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2.5"
          role="group"
          aria-label="Escenas de fachada e interior"
        >
          <button
            type="button"
            onClick={() => setManualSlide(0)}
            aria-label={copy.heroStory.slide1Label}
            data-testid="hero-slide-btn-0"
            className="group py-2 cursor-pointer"
          >
            <span
              className={`block h-1 rounded-full transition-all duration-300 ${
                activeSlide === 0
                  ? 'w-9 bg-[#EE6A2B] shadow-[0_0_8px_#EE6A2B]'
                  : 'w-6 bg-[#F9F4EC]/45 group-hover:bg-[#F9F4EC]/80'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setManualSlide(1)}
            aria-label={copy.heroStory.slide2Label}
            data-testid="hero-slide-btn-1"
            className="group py-2 cursor-pointer"
          >
            <span
              className={`block h-1 rounded-full transition-all duration-300 ${
                activeSlide === 1
                  ? 'w-9 bg-[#EE6A2B] shadow-[0_0_8px_#EE6A2B]'
                  : 'w-6 bg-[#F9F4EC]/45 group-hover:bg-[#F9F4EC]/80'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
