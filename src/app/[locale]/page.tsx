import React from 'react';
import { isValidLocale, type Locale } from '@/data/copy';
import { Navbar } from '@/components/ui/Navbar';
import { ScrollProgressDots } from '@/components/ui/ScrollProgressDots';
import { HeroStory } from '@/components/sections/HeroStory';
import { IntroCream } from '@/components/sections/IntroCream';
import { SignatureHero } from '@/components/sections/SignatureHero';
import { ExplodedPizza } from '@/components/sections/ExplodedPizza';
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

  return (
    <>
      <Navbar locale={locale} currentPath="home" />
      <ScrollProgressDots />

      <main id="main-content" className="flex-1">
        <HeroStory locale={locale} />
        <IntroCream locale={locale} />
        <SignatureHero locale={locale} />
        <ExplodedPizza locale={locale} />
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
