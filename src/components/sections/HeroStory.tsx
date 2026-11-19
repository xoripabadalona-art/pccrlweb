'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';

export interface HeroStoryProps {
  locale: Locale;
}

const HERO_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzFGMThBMyIvPjxyZWN0IHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSI1IiBmaWxsPSIjMTQxMTBGIi8+PC9zdmc+';

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
        gsap.set(interiorLayerRef.current, { opacity: 0, scale: 1.08 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=95%',
            pin: pinViewportRef.current,
            scrub: 0.5,
            onUpdate: (self) => {
              setManualSlide(null);
              setProgress(self.progress);
            },
          },
        });

        // Slight zoom into the storefront door as interior cross-fades in (like video frame_001 -> frame_003)
        if (storefrontLayerRef.current) {
          tl.to(
            storefrontLayerRef.current,
            {
              scale: 1.06,
              ease: 'power1.inOut',
              duration: 1,
            },
            0
          );
        }

        tl.to(
          interiorLayerRef.current,
          {
            opacity: 1,
            scale: 1,
            ease: 'power2.inOut',
            duration: 1,
          },
          0
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
      {/* Server-rendered H1 for SEO and screen readers while keeping the 3D storefront artwork unobstructed like the reference video */}
      <h1 className="sr-only">{copy.heroStory.h1}</h1>

      <div
        ref={pinViewportRef}
        className="relative h-[68vh] min-h-[440px] max-h-[760px] w-full overflow-hidden sm:h-[74vh] md:h-[80vh]"
      >
        {/* Slide 1: 3D Storefront of La Piccerella at dusk (with glowing LA PICCERELLA neon sign, oven window, OPEN neon & checkered interior) */}
        <div
          ref={storefrontLayerRef}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <Image
            src="/images/hero-storefront.webp"
            alt={`${site.name} — ${copy.heroStory.slide1Label}`}
            width={1920}
            height={1080}
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={HERO_BLUR_DATA_URL}
            sizes="100vw"
            className="h-full w-full object-cover object-center"
          />
          {/* Subtle top vignette only for navbar legibility — center of facade stays 100% clean */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#14110F]/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#14110F]/55 to-transparent" />
        </div>

        {/* Slide 2: 3D Warm Interior of La Piccerella (cross-fades with scale 1.08 -> 1 on scroll) */}
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
          <Image
            src="/images/hero-interior.webp"
            alt={`${site.name} — ${copy.heroStory.slide2Label}`}
            width={1920}
            height={1080}
            loading="eager"
            sizes="100vw"
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#14110F]/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#14110F]/55 to-transparent" />
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
