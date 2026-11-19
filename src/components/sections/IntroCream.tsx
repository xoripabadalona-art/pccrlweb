'use client';

import React, { useEffect, useRef } from 'react';
import { getMenuItemById } from '@/data/menu';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { useBasketStore } from '@/store/basket';

export interface IntroCreamProps {
  locale: Locale;
}

export function IntroCream({ locale }: IntroCreamProps) {
  const copy = getCopy(locale);
  const addItem = useBasketStore((s) => s.addItem);
  const openDrawer = useBasketStore((s) => s.openDrawer);
  const sectionRef = useRef<HTMLElement>(null);

  // Match the 3-card layout from the reference video (frame_001 - frame_003):
  // Left wide card: action shot of freshly baked pizza slice / cutting
  // Middle & Right square cards: top-down pizzas on wooden board (Margarita & Pepperoni)
  const itemPepperoni = getMenuItemById('pizza-pepperoni');
  const itemMargarita = getMenuItemById('pizza-margarita');
  const itemProsciuttoFunghi = getMenuItemById('pizza-prosciutto-funghi');

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
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
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
      className="relative z-20 bg-[#EAE2D3] py-12 text-[#1A1512] md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Centered Bold Uppercase Heading & Short Paragraph (matching frame_001 & frame_002 of the reference video) */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-1.5 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
            {copy.introCream.eyebrow}
          </p>
          <h2
            id="intro-cream-heading"
            className="font-serif-heading mb-3 text-2xl font-extrabold tracking-wide text-[#1A1512] uppercase sm:text-3xl md:text-4xl"
          >
            {locale === 'ca'
              ? 'LA PICCERELLA · MASSA FERMENTADA 48 H'
              : 'LA PICCERELLA · MASA FERMENTADA 48 H'}
          </h2>
          <p className="text-sm leading-relaxed text-[#4A3F37] sm:text-base">
            {copy.introCream.body}
          </p>
        </div>

        {/* 3-Card Row matching reference video frame_001 & frame_002: 1 wide photo card on left (6 cols) + 2 square pizza cards on right (3 cols each) */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-12">
          {/* Card 1 (Wide left, 6 cols): Action shot of freshly baked pizza with overlay CTA */}
          {itemPepperoni && (
            <article className="featured-card group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[22px] bg-[#14110F] p-5 text-[#F9F4EC] shadow-lg md:col-span-6">
              <img
                src="/images/menu/action-slicing-pizza.webp"
                alt={`${itemPepperoni.name[locale]} — ${itemPepperoni.ingredients[locale]}`}
                width={840}
                height={704}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110F]/90 via-[#14110F]/30 to-transparent" />

              <div className="relative z-10 flex items-end justify-between gap-4">
                <div>
                  <span className="mb-1 inline-block rounded-full bg-[#EE6A2B] px-3 py-0.5 text-[11px] font-bold text-[#14110F] uppercase">
                    {locale === 'ca' ? 'Feta al moment' : 'Hecha al momento'}
                  </span>
                  <h3 className="font-serif-heading text-xl font-bold text-[#F9F4EC] md:text-2xl">
                    Pizza {itemPepperoni.name[locale]} ·{' '}
                    {formatCents(itemPepperoni.priceCents)}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#E5D7C3]">
                    {itemPepperoni.ingredients[locale]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addItem(itemPepperoni.id, itemPepperoni.sizes?.[0]?.id, 1);
                    openDrawer();
                  }}
                  data-testid={`featured-add-${itemPepperoni.id}`}
                  className="btn-pill shrink-0 rounded-full bg-[#F1B24A] px-5 py-2.5 text-xs font-extrabold text-[#14110F] shadow-md transition-transform hover:scale-105 hover:bg-[#F5C065] cursor-pointer"
                >
                  {locale === 'ca' ? 'Demanar ara' : 'Pedir ahora'}
                </button>
              </div>
            </article>
          )}

          {/* Card 2 (Middle square, 3 cols): Margarita on wooden board + golden pill button */}
          {itemMargarita && (
            <article className="featured-card flex flex-col justify-between md:col-span-3">
              <div>
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-[22px] bg-[#1F1813] shadow-md">
                  <img
                    src={itemMargarita.image}
                    alt={`${itemMargarita.name[locale]} — ${itemMargarita.ingredients[locale]}`}
                    width={540}
                    height={540}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute right-2.5 bottom-2.5 rounded-full bg-[#14110F]/90 px-3 py-0.5 text-xs font-bold text-[#F9F4EC]">
                    {formatCents(itemMargarita.priceCents)}
                  </span>
                </div>
                <h3 className="font-serif-heading text-base font-extrabold text-[#1A1512]">
                  Pizza {itemMargarita.name[locale]}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4A3F37]">
                  {itemMargarita.ingredients[locale]}.{' '}
                  {locale === 'ca' ? 'Porció des de 3,00 €.' : 'Porción desde 3,00 €.'}
                </p>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    addItem(itemMargarita.id, itemMargarita.sizes?.[0]?.id, 1);
                    openDrawer();
                  }}
                  data-testid={`featured-add-${itemMargarita.id}`}
                  className="btn-pill inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#F1B24A] px-5 py-2 text-xs font-extrabold text-[#14110F] shadow-xs transition-colors hover:bg-[#F5C065] cursor-pointer"
                >
                  {locale === 'ca' ? 'Demanar ara' : 'Pedir ahora'}
                </button>
              </div>
            </article>
          )}

          {/* Card 3 (Right square, 3 cols): Prosciutto e Funghi on wooden board + dark charcoal pill button */}
          {itemProsciuttoFunghi && (
            <article className="featured-card flex flex-col justify-between md:col-span-3">
              <div>
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-[22px] bg-[#1F1813] shadow-md">
                  <img
                    src={itemProsciuttoFunghi.image}
                    alt={`${itemProsciuttoFunghi.name[locale]} — ${itemProsciuttoFunghi.ingredients[locale]}`}
                    width={540}
                    height={540}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute right-2.5 bottom-2.5 rounded-full bg-[#14110F]/90 px-3 py-0.5 text-xs font-bold text-[#F9F4EC]">
                    {formatCents(itemProsciuttoFunghi.priceCents)}
                  </span>
                </div>
                <h3 className="font-serif-heading text-base font-extrabold text-[#1A1512]">
                  {itemProsciuttoFunghi.name[locale]}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4A3F37]">
                  {itemProsciuttoFunghi.ingredients[locale]}
                </p>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    addItem(
                      itemProsciuttoFunghi.id,
                      itemProsciuttoFunghi.sizes?.[0]?.id,
                      1
                    );
                    openDrawer();
                  }}
                  data-testid={`featured-add-${itemProsciuttoFunghi.id}`}
                  className="btn-pill inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#1A1512] px-5 py-2 text-xs font-extrabold text-[#F9F4EC] shadow-xs transition-colors hover:bg-[#2C221B] cursor-pointer"
                >
                  {locale === 'ca' ? 'Demanar ara' : 'Pedir ahora'}
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
