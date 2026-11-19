'use client';

import React, { useEffect, useRef, useState } from 'react';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import type { PizzeriaSceneHandle } from '@/components/three/pizzeriaScene';

export interface HeroStoryProps {
  locale: Locale;
}

/**
 * Hero: a live 3D diorama of the real shopfront with Gustavo waving from the
 * serving window. Scrolling flies the camera from the whole building down to
 * a close-up of him at the counter. three.js is loaded on demand and the
 * render loop only runs while the hero is on screen.
 */
export function HeroStory({ locale }: HeroStoryProps) {
  const copy = getCopy(locale);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const bubbleAnchorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [sceneReady, setSceneReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let isMounted = true;
    let scene: PizzeriaSceneHandle | undefined;
    let ctx: { revert: () => void } | undefined;
    let visibility: IntersectionObserver | undefined;
    let removePointer: (() => void) | undefined;

    (async () => {
      try {
        const { createPizzeriaScene } = await import('@/components/three/pizzeriaScene');
        if (!isMounted) return;
        scene = createPizzeriaScene(canvas, {
          animate: !reducedMotion,
          onReady: () => {
            if (isMounted) setSceneReady(true);
          },
          // Keep the speech bubble glued just above Gustavo's head
          onAnchor: (x, y) => {
            const el = bubbleAnchorRef.current;
            if (el) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          },
        });
      } catch {
        if (isMounted) setWebglFailed(true);
        return;
      }

      if (reducedMotion) return;

      // Only burn GPU while the hero is actually visible
      visibility = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) scene?.start();
          else scene?.stop();
        },
        { threshold: 0.02 }
      );
      visibility.observe(section);

      if (window.matchMedia('(pointer: fine)').matches) {
        const onMove = (e: PointerEvent) => {
          scene?.setPointer(
            e.clientX / window.innerWidth - 0.5,
            e.clientY / window.innerHeight - 0.5
          );
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        removePointer = () => window.removeEventListener('pointermove', onMove);
      }

      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');
      if (!isMounted) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=110%',
            pin: pinRef.current,
            scrub: 0.6,
            onUpdate: (self) => scene?.setProgress(self.progress),
          },
        });
        tl.to(textRef.current, { autoAlpha: 0, y: 24, duration: 0.3 }, 0);
        tl.to(scrimRef.current, { opacity: 0, duration: 0.3 }, 0);
        tl.fromTo(
          bubbleRef.current,
          { autoAlpha: 0, scale: 0.6, y: 14 },
          { autoAlpha: 1, scale: 1, y: 0, ease: 'back.out(1.8)', duration: 0.14 },
          0.78
        );
        tl.to({}, { duration: 0.08 }, 0.92);
      }, section);
    })();

    return () => {
      isMounted = false;
      visibility?.disconnect();
      removePointer?.();
      ctx?.revert();
      scene?.dispose();
    };
  }, []);

  const sceneLabel =
    locale === 'ca'
      ? `Maqueta 3D de la pizzeria ${site.name} al Carrer de Mar, amb en Gustavo saludant des de la finestra`
      : `Maqueta 3D de la pizzería ${site.name} en Carrer de Mar, con Gustavo saludando desde la ventana`;

  return (
    <section
      id="hero-story"
      ref={sectionRef}
      data-theme="dark"
      aria-label={copy.heroStory.h1}
      className="relative w-full bg-[#14110F] text-[#F9F4EC]"
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] min-h-[540px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_44%,#4A3327_0%,#2A1E18_42%,#14110F_100%)]"
      >
        {/* Warm stage light behind the diorama */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[42%] left-1/2 h-[70svh] w-[min(1100px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,190,120,0.22)_0%,rgba(238,106,43,0.07)_45%,transparent_70%)]"
        />

        {webglFailed ? (
          <img
            src="/images/real/storefront-close.webp"
            alt={`${site.name} — ${copy.heroStory.slide1Label}`}
            width={960}
            height={960}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={sceneLabel}
            data-testid="hero-3d-canvas"
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
              sceneReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Gustavo's greeting, shown once the camera reaches him */}
        <div
          ref={bubbleAnchorRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-10 will-change-transform"
        >
          <div
            ref={bubbleRef}
            className="invisible absolute bottom-0 left-0 w-max -translate-x-1/2 rounded-2xl bg-[#F9F4EC] px-4 py-2.5 text-center text-[#14110F] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
          >
            <p className="font-serif-heading text-base leading-tight font-extrabold md:text-lg">
              {locale === 'ca' ? 'Hola! Soc en Gustavo' : '¡Hola! Soy Gustavo'}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-[#574B42] md:text-xs">
              {locale === 'ca' ? "T'espero al Carrer de Mar" : 'Te espero en Carrer de Mar'}
            </p>
            <span className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-[#F9F4EC]" />
          </div>
        </div>

        {/* Scrims: navbar legibility on top, headline legibility below */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#14110F]/70 to-transparent"
        />
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-[#14110F] via-[#14110F]/75 to-transparent wide:inset-y-0 wide:right-auto wide:h-auto wide:w-[46%] wide:bg-gradient-to-r wide:via-[#14110F]/45"
        />

        {/* Headline + calls to action */}
        <div
          ref={textRef}
          className="absolute inset-x-0 bottom-24 z-10 mx-auto squat:bottom-6 flex max-w-3xl flex-col items-center px-5 text-center wide:inset-x-auto wide:top-1/2 wide:bottom-auto wide:left-[max(32px,6vw)] wide:mx-0 wide:w-[min(36vw,30rem)] wide:-translate-y-1/2 wide:items-start wide:px-0 wide:text-left"
        >
          <p className="mb-2.5 hidden text-xs font-bold tracking-[0.22em] text-[#F1B24A] uppercase wide:block">
            {site.addressStructured.streetAddress} · {site.addressStructured.addressLocality}
          </p>
          <h1 className="font-serif-heading text-[1.75rem] leading-[1.12] font-extrabold tracking-tight text-balance sm:text-4xl squat:text-[1.75rem] wide:text-[clamp(2.5rem,3.6vw,3.6rem)] wide:leading-[1.06]">
            {copy.heroStory.h1}
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#E5D7C3] squat:hidden wide:mt-4 wide:text-base">
            {copy.heroStory.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 wide:mt-6 wide:justify-start">
            <a
              href="#carta"
              className="btn-pill inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#EE6A2B] px-8 py-2.5 text-sm font-extrabold text-[#14110F] shadow-[0_10px_30px_rgba(238,106,43,0.4)] transition-transform hover:scale-105 hover:bg-[#F37D44] md:text-base"
            >
              {copy.heroStory.ctaMenu}
            </a>
            <span
              aria-hidden="true"
              className="hidden items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-[#CBBBA8] uppercase sm:inline-flex"
            >
              {copy.heroStory.scrollHint}
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
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
