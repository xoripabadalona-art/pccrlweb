import React from 'react';
import Link from 'next/link';
import { getHomeHighlights, menuCategories, menuItems } from '@/data/menu';
import type { Locale } from '@/data/copy';
import { getLanding, getLandingPath } from '@/data/landings';
import { MenuItemCard, StickerLoyaltyBanner } from './Menu';

export interface MenuHighlightsProps {
  locale: Locale;
}

/**
 * Home-page menu block: a short selection you can order from straight away,
 * with the complete menu one tap away on /carta. Keeping the full list on its
 * own page makes the home page far shorter on phones and stops the two pages
 * from repeating the same content.
 */
export function MenuHighlights({ locale }: MenuHighlightsProps) {
  const items = getHomeHighlights();

  return (
    <section
      id="carta"
      data-theme="cream"
      aria-labelledby="menu-section-heading"
      className="bg-[#F4EBDD] py-20 text-[#1A1512] md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
            {locale === 'ca' ? 'Selecció destacada del forn' : 'Selección destacada del horno'}
          </p>
          <h2
            id="menu-section-heading"
            className="font-serif-heading mb-4 text-3xl font-bold md:text-5xl"
          >
            {locale === 'ca' ? 'Les Nostres Pizzes Favorites' : 'Nuestras Pizzas Favoritas'}
          </h2>
          <p className="text-base leading-relaxed text-[#574B42]">
            {locale === 'ca'
              ? `Un tast de les pizzes més demanades al nostre obrador del Carrer de Mar, 127. Explora les ${menuItems.length} opcions a la carta.`
              : `Una muestra de las pizzas más pedidas en nuestro obrador de Carrer de Mar, 127. Explora las ${menuItems.length} opciones en la carta.`}
          </p>
        </div>

        <StickerLoyaltyBanner locale={locale} />

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} locale={locale} />
          ))}
        </ul>

        {/* The whole menu, by section */}
        <div className="mt-12 rounded-[24px] border border-[#1A1512]/12 bg-[#FAF5ED] p-6 text-center md:p-10">
          <h3 className="font-serif-heading text-2xl font-bold md:text-3xl">
            {locale === 'ca'
              ? `Tota la carta: ${menuItems.length} productes`
              : `Toda la carta: ${menuItems.length} productos`}
          </h3>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {menuCategories.map((category) => {
              const count = menuItems.filter((i) => i.category === category.id).length;
              return (
                <li key={category.id}>
                  <Link
                    href={`/${locale}/carta#categoria-${category.id}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#E5D7C3] px-5 py-2 text-sm font-bold text-[#1A1512] transition-colors hover:bg-[#D5C3AA]"
                  >
                    {category.label[locale]}
                    <span className="rounded-full bg-[#14110F] px-2 py-0.5 text-[11px] text-[#F9F4EC]">
                      {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={`/${locale}/carta`}
            data-testid="home-full-menu-link"
            className="btn-pill mt-6 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#14110F] px-9 py-3 text-base font-extrabold text-[#F9F4EC] transition-transform hover:scale-[1.03] hover:bg-[#2C221B]"
          >
            {locale === 'ca' ? 'Veure tota la carta' : 'Ver toda la carta'}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Visual Events & Mayoreo Banner Card */}
        <div className="mt-8 overflow-hidden rounded-[24px] border border-[#F1B24A]/35 bg-[#14110F] p-6 text-[#F9F4EC] shadow-lg md:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-[#F1B24A]/20 px-3 py-0.5 text-[11px] font-extrabold tracking-wider text-[#F1B24A] uppercase">
                {locale === 'ca'
                  ? '★ Esdeveniments, Aniversaris i Festes a Badalona'
                  : '★ Eventos, Cumpleaños y Fiestas en Badalona'}
              </span>
              <h3 className="font-serif-heading mt-2 text-2xl font-bold text-[#F9F4EC] md:text-3xl">
                {getLanding('mayoreo', locale).linkLabel}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#CBBBA8]">
                {locale === 'ca'
                  ? 'Organitzes un aniversari, reunió d’empresa o festa d’escola? Calcula en 30 segons la combinació ideal de pizzetes (Promo 5+1) i pizzes grans.'
                  : '¿Organizas un cumpleaños, reunión de empresa o fiesta de colegio? Calcula en 30 segundos la combinación ideal de pizzetas (Promo 5+1) y pizzas grandes.'}
              </p>
            </div>
            <Link
              href={getLandingPath('mayoreo', locale)}
              className="btn-pill inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#EE6A2B] px-7 py-3 text-sm font-extrabold text-[#14110F] transition-transform hover:scale-105 hover:bg-[#F37D44]"
            >
              <span>
                {locale === 'ca' ? '⚡ Calcular el meu esdeveniment →' : '⚡ Calcular mi evento →'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
