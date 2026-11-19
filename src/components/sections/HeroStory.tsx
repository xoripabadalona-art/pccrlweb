'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import { useBasketStore } from '@/store/basket';
import { Button, getButtonClasses } from '@/components/ui/Button';

export interface HeroStoryProps {
  locale: Locale;
}

// Tiny warm dusk SVG blur data URL for zero-CLS blurred placeholder
const HERO_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzFS MThBMyIvPjxyZWN0IHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSI1IiBmaWxsPSIjMTQxMTBGIi8+PC9zdmc+';

export function HeroStory({ locale }: HeroStoryProps) {
  const copy = getCopy(locale);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  const sectionRef = useRef<HTMLElement>(null);
  const pinViewportRef = useRef<HTMLDivElement>(null);
  const interiorLayerRef = useRef<HTMLDivElement>(null);
  const storefrontSignRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manualSlide, setManualSlide] = useState<0 | 1>(0);

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
            end: '+=120%',
            pin: pinViewportRef.current,
            scrub: 0.6,
            onUpdate: (self) => {
              setProgress(self.progress);
            },
          },
        });

        // Cross-fade storefront -> interior with scale 1.08 -> 1
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

        if (storefrontSignRef.current) {
          tl.to(
            storefrontSignRef.current,
            {
              opacity: 0,
              scale: 0.94,
              ease: 'power2.out',
              duration: 0.55,
            },
            0
          );
        }
      }, sectionRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  const activeSlide = reducedMotion ? manualSlide : progress > 0.48 ? 1 : 0;

  return (
    <section
      id="hero-story"
      ref={sectionRef}
      data-theme="dark"
      aria-label={copy.heroStory.h1}
      className="relative w-full bg-[#14110F] text-[#F9F4EC]"
    >
      <div
        ref={pinViewportRef}
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden"
      >
        {/* Layer 1: Storefront at dusk (LCP priority image) */}
        <div className="absolute inset-0 z-0">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-[#14110F]/45 to-[#14110F]/65" />

          {/* HTML Real Logo & Glowing Neon-style Sign Overlay on the Storefront's blank signboard */}
          <div
            ref={storefrontSignRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-22 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#EE6A2B]/45 bg-[#14110F]/85 px-6 py-2.5 shadow-[0_0_32px_rgba(238,106,43,0.45)] backdrop-blur-xs md:flex"
          >
            <img
              src={site.logo}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full bg-[#F4EBDD] object-contain"
            />
            <div className="text-left">
              <p className="font-serif-heading text-lg font-bold tracking-wider text-[#F9F4EC] drop-shadow-[0_0_10px_rgba(238,106,43,0.8)]">
                LA PICCERELLA
              </p>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#EE6A2B] uppercase">
                Pizzería Artesanal · 48H
              </p>
            </div>
          </div>
        </div>

        {/* Layer 2: Warm Trattoria Interior (cross-fades with scale 1.08 -> 1 on scroll) */}
        <div
          ref={interiorLayerRef}
          className="absolute inset-0 z-10"
          style={{
            opacity: reducedMotion ? (manualSlide === 1 ? 1 : 0) : 0,
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-[#14110F]/55 to-[#14110F]/65" />
        </div>

        {/* Foreground Content: Server-rendered H1, value proposition, and primary CTAs */}
        <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-28 pb-12 text-center md:px-8">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#F9F4EC]/20 bg-[#14110F]/75 px-4 py-2 backdrop-blur-md">
            <img
              src={site.logo}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full bg-[#F4EBDD] object-contain"
            />
            <span className="text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
              {site.addressStructured.streetAddress} ·{' '}
              {site.addressStructured.addressLocality}
            </span>
          </div>

          <h1
            className="font-serif-heading max-w-4xl font-bold tracking-tight text-[#F9F4EC] drop-shadow-lg"
            style={{ fontSize: 'var(--text-display)', lineHeight: 1.08 }}
          >
            {copy.heroStory.h1}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#F4EBDD] drop-shadow md:text-xl">
            {copy.heroStory.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#carta"
              className={getButtonClasses('secondary', 'lg')}
              data-testid="hero-cta-menu"
            >
              {copy.heroStory.ctaMenu}
            </a>

            <Button
              variant="primary"
              size="lg"
              onClick={openDrawer}
              data-testid="hero-cta-whatsapp"
            >
              {copy.heroStory.ctaWhatsApp}
            </Button>
          </div>
        </div>

        {/* Bottom slide progress indicators (Hero A Storefront / Hero B Interior) */}
        <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 pb-8 sm:flex-row md:px-8">
          <div
            className="flex items-center gap-3 rounded-full border border-[#F9F4EC]/15 bg-[#14110F]/75 px-4 py-2 backdrop-blur-md"
            role="group"
            aria-label="Escenas de presentación"
          >
            <button
              type="button"
              onClick={() => setManualSlide(0)}
              aria-label={copy.heroStory.slide1Label}
              className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === 0 ? 'w-7 bg-[#EE6A2B]' : 'w-2 bg-[#F9F4EC]/40'
                }`}
              />
              <span className={activeSlide === 0 ? 'text-[#F9F4EC]' : 'text-[#CBBBA8]'}>
                01 · {locale === 'ca' ? 'Façana' : 'Fachada'}
              </span>
            </button>

            <span className="text-[#F9F4EC]/30" aria-hidden="true">
              /
            </span>

            <button
              type="button"
              onClick={() => setManualSlide(1)}
              aria-label={copy.heroStory.slide2Label}
              className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === 1 ? 'w-7 bg-[#EE6A2B]' : 'w-2 bg-[#F9F4EC]/40'
                }`}
              />
              <span className={activeSlide === 1 ? 'text-[#F9F4EC]' : 'text-[#CBBBA8]'}>
                02 · {locale === 'ca' ? 'Interior' : 'Interior'}
              </span>
            </button>
          </div>

          <p className="text-xs font-semibold tracking-widest text-[#CBBBA8] uppercase">
            {copy.heroStory.scrollHint} ↓
          </p>
        </div>
      </div>
    </section>
  );
}
