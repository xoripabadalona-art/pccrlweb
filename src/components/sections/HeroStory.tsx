'use client';

import React, { useEffect, useRef, useState } from 'react';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';

export interface HeroStoryProps {
  locale: Locale;
}

/**
 * Cinematic hero: a full-bleed dusk storefront that the camera dollies into
 * as the visitor scrolls, pushing through the glass and settling inside the
 * dining room. Two static images + transforms only, so it stays cheap to render.
 */
export function HeroStory({ locale }: HeroStoryProps) {
  const copy = getCopy(locale);

  const sectionRef = useRef<HTMLElement>(null);
  const pinViewportRef = useRef<HTMLDivElement>(null);
  const storefrontRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<{ start: number; end: number } | null>(null);

  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ctx: { revert: () => void } | undefined;
    let isMounted = true;

    (async () => {
      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');
      if (!isMounted || !sectionRef.current) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Desktop frame shows the door (right of centre); the portrait crop only
        // has the dining-room window, so the camera pushes through that instead.
        const isPortrait = window.innerWidth < 768;
        const origin = isPortrait ? '74% 60%' : '72.5% 60%';

        gsap.set(storefrontRef.current, { scale: 1, transformOrigin: origin });
        gsap.set(interiorRef.current, { opacity: 0, scale: 1.3 });
        gsap.set(flashRef.current, { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=110%',
            pin: pinViewportRef.current,
            scrub: 0.6,
            onUpdate: (self) => {
              triggerRef.current = { start: self.start, end: self.end };
              setActiveSlide(self.progress > 0.55 ? 1 : 0);
            },
            onRefresh: (self) => {
              triggerRef.current = { start: self.start, end: self.end };
            },
          },
        });

        // 0 → 0.62: dolly towards the entrance
        tl.to(hintRef.current, { opacity: 0, y: 10, duration: 0.12 }, 0);
        tl.to(
          storefrontRef.current,
          { scale: isPortrait ? 3.4 : 4.2, ease: 'power2.in', duration: 0.62 },
          0
        );
        // 0.42 → 0.62: warm light swallows the frame as we cross the glass
        tl.to(flashRef.current, { opacity: 0.6, duration: 0.2 }, 0.42);
        tl.to(storefrontRef.current, { opacity: 0, duration: 0.14 }, 0.5);
        // 0.5 → 1: the dining room resolves and the camera settles
        tl.to(interiorRef.current, { opacity: 1, duration: 0.16 }, 0.5);
        tl.to(flashRef.current, { opacity: 0, duration: 0.24 }, 0.62);
        tl.to(
          interiorRef.current,
          { scale: 1, ease: 'power2.out', duration: 0.5 },
          0.5
        );
      }, sectionRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  const goToSlide = (slide: 0 | 1) => {
    const range = triggerRef.current;
    if (range) {
      window.scrollTo({
        top: slide === 0 ? range.start : range.end,
        behavior: 'smooth',
      });
    } else {
      // Reduced motion / no scroll timeline: plain cross-fade.
      setActiveSlide(slide);
    }
  };

  return (
    <section
      id="hero-story"
      ref={sectionRef}
      data-theme="dark"
      aria-label={copy.heroStory.h1}
      className="relative w-full bg-[#14110F] text-[#F9F4EC]"
    >
      <h1 className="sr-only">{copy.heroStory.h1}</h1>

      <div
        ref={pinViewportRef}
        className="relative h-[100svh] min-h-[480px] w-full overflow-hidden bg-[#14110F]"
      >
        {/* Scene 1 — storefront at dusk */}
        <div
          ref={storefrontRef}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/images/hero-storefront-mobile.webp"
            />
            <img
              src="/images/hero-storefront.webp"
              alt={`${site.name} — ${copy.heroStory.slide1Label}`}
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        </div>

        {/* Scene 2 — dining room */}
        <div
          ref={interiorRef}
          className={`absolute inset-0 z-10 transition-opacity duration-500 will-change-transform ${
            activeSlide === 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/images/hero-interior-mobile.webp"
            />
            <img
              src="/images/hero-interior.webp"
              alt={`${site.name} — ${copy.heroStory.slide2Label}`}
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        </div>

        {/* Warm light bloom while crossing the doorway */}
        <div
          ref={flashRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,_#FFD9A0_0%,_#E8964A_45%,_#5A2A12_100%)] opacity-0 mix-blend-screen"
        />

        {/* Legibility scrims for the navbar and the indicators */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#14110F]/75 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#14110F]/70 to-transparent"
        />

        {/* Scroll cue */}
        <div
          ref={hintRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex flex-col items-center gap-1.5 text-[#F9F4EC] md:bottom-12"
        >
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            {copy.heroStory.scrollHint}
          </span>
          <svg
            width="18"
            height="18"
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

        {/* Scene indicators */}
        <div
          className="absolute inset-x-0 bottom-3 z-30 flex items-center justify-center gap-2.5"
          role="group"
          aria-label={
            locale === 'ca'
              ? "Escenes de façana i interior"
              : 'Escenas de fachada e interior'
          }
        >
          {([0, 1] as const).map((slide) => (
            <button
              key={slide}
              type="button"
              onClick={() => goToSlide(slide)}
              aria-label={
                slide === 0 ? copy.heroStory.slide1Label : copy.heroStory.slide2Label
              }
              aria-pressed={activeSlide === slide}
              data-testid={`hero-slide-btn-${slide}`}
              className="group cursor-pointer py-2"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 ${
                  activeSlide === slide
                    ? 'w-9 bg-[#EE6A2B] shadow-[0_0_8px_#EE6A2B]'
                    : 'w-6 bg-[#F9F4EC]/45 group-hover:bg-[#F9F4EC]/80'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
