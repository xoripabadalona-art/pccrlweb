import React from 'react';
import { getCopy, isValidLocale, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import { Navbar } from '@/components/ui/Navbar';
import { Menu } from '@/components/sections/Menu';
import { Story } from '@/components/sections/Story';
import { Reviews } from '@/components/sections/Reviews';
import { Location } from '@/components/sections/Location';
import { Faq } from '@/components/sections/Faq';
import { Footer } from '@/components/sections/Footer';
import { BasketDrawer } from '@/components/basket/BasketDrawer';
import { FloatingWhatsApp } from '@/components/basket/FloatingWhatsApp';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'es';
  const copy = getCopy(locale);

  return (
    <>
      <Navbar locale={locale} currentPath="home" />
      <main id="main-content" className="flex-1">
        <section
          id="hero-story"
          data-theme="dark"
          className="mx-auto max-w-5xl px-4 pt-32 pb-16 md:px-8"
        >
          <h1 className="font-serif-heading text-4xl font-bold md:text-6xl">
            {copy.heroStory.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#CBBBA8]">
            {site.tagline[locale]} — {site.address}
          </p>
        </section>

        <Menu locale={locale} />
        <Story locale={locale} />
        <Reviews locale={locale} />
        <Location locale={locale} />
        <Faq locale={locale} />
      </main>
      <Footer locale={locale} />
      <BasketDrawer locale={locale} />
      <FloatingWhatsApp locale={locale} />
    </>
  );
}
