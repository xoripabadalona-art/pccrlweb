import React from 'react';
import Link from 'next/link';
import { getHomeHighlights, menuCategories, menuItems } from '@/data/menu';
import { getCopy, type Locale } from '@/data/copy';
import { LANDING_IDS, getLanding, getLandingPath } from '@/data/landings';
import { MenuItemCard } from './Menu';

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
  const copy = getCopy(locale);
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
            {copy.menuSection.eyebrow}
          </p>
          <h2
            id="menu-section-heading"
            className="font-serif-heading mb-4 text-3xl font-bold md:text-5xl"
          >
            {copy.menuSection.heading}
          </h2>
          <p className="text-base leading-relaxed text-[#574B42]">
            {copy.menuSection.subheading}
          </p>
        </div>

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
            {locale === 'ca' ? 'Veure la carta completa' : 'Ver la carta completa'}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Focused pages */}
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {LANDING_IDS.map((id) => {
            const landing = getLanding(id, locale);
            return (
              <li key={id}>
                <Link
                  href={getLandingPath(id, locale)}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-[#1A1512]/12 bg-[#FAF5ED] px-5 py-4 transition-shadow hover:shadow-md"
                >
                  <span>
                    <span className="font-serif-heading block text-lg font-bold text-[#1A1512]">
                      {landing.linkLabel}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#574B42]">
                      {landing.linkBlurb}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xl font-bold text-[#A8241B] transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
