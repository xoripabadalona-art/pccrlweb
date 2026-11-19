'use client';

import React, { useEffect, useRef } from 'react';
import { getFeaturedMenuItems } from '@/data/menu';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { useBasketStore } from '@/store/basket';
import { Button } from '@/components/ui/Button';

export interface IntroCreamProps {
  locale: Locale;
}

export function IntroCream({ locale }: IntroCreamProps) {
  const copy = getCopy(locale);
  const addItem = useBasketStore((s) => s.addItem);
  const openDrawer = useBasketStore((s) => s.openDrawer);
  const sectionRef = useRef<HTMLElement>(null);

  const featuredItems = getFeaturedMenuItems().slice(0, 3);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

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
        const cards = sectionRef.current?.querySelectorAll('.featured-card');
        if (!cards || cards.length === 0) return;

        gsap.fromTo(
          cards,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.14,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 78%',
              once: true,
            },
          }
        );
      }, sectionRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="especialidades"
      ref={sectionRef}
      data-theme="cream"
      aria-labelledby="intro-cream-heading"
      className="relative z-10 rounded-t-[32px] bg-[#F4EBDD] py-20 text-[#1A1512] shadow-2xl md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Centered Serif Heading & Short Paragraph (Section 2.3 & 6.2) */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
            {copy.introCream.eyebrow}
          </p>
          <h2
            id="intro-cream-heading"
            className="font-serif-heading mb-5 font-bold text-[#1A1512]"
            style={{ fontSize: 'var(--text-h2)', lineHeight: 1.15 }}
          >
            {copy.introCream.heading}
          </h2>
          <p className="text-base leading-relaxed text-[#574B42] md:text-lg">
            {copy.introCream.body}
          </p>
        </div>

        {/* Row of three product cards: one wide (lg:col-span-6), two small (lg:col-span-3 each) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {featuredItems.map((item, idx) => {
            const isWide = idx === 0;
            const colSpanClass = isWide ? 'lg:col-span-6' : 'lg:col-span-3';

            return (
              <article
                key={item.id}
                className={`featured-card card-surface flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#1A1512]/10 bg-[#FAF5ED] p-5 shadow-[var(--shadow-cream)] ${colSpanClass}`}
              >
                <div>
                  <div
                    className={`relative mb-4 w-full overflow-hidden rounded-2xl bg-[#E5D7C3] ${
                      isWide ? 'aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={`${item.name[locale]} — ${item.ingredients[locale]}`}
                      width={640}
                      height={400}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute right-3 bottom-3 rounded-full bg-[#14110F]/90 px-3.5 py-1 text-sm font-bold text-[#F9F4EC]">
                      {formatCents(item.priceCents)}
                    </span>
                  </div>

                  <h3 className="font-serif-heading mb-1.5 text-xl font-bold text-[#1A1512] md:text-2xl">
                    {item.name[locale]}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-[#574B42]">
                    {item.ingredients[locale]}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#1A1512]/10 pt-3.5">
                  <span className="font-serif-heading text-lg font-bold text-[#A8241B]">
                    {formatCents(item.priceCents)}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      addItem(item.id, item.sizes?.[0]?.id, 1);
                      openDrawer();
                    }}
                    data-testid={`featured-add-${item.id}`}
                  >
                    + {copy.introCream.addButton}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#carta"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#A8241B] underline underline-offset-4 hover:text-[#1A1512]"
          >
            {copy.introCream.viewAllLink}
          </a>
        </div>
      </div>
    </section>
  );
}
