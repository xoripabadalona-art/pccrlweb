import React from 'react';
import { getCopy, isValidLocale, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/sections/Footer';

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
      <main id="main-content" className="flex-1 pt-24">
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
          <h1 className="font-serif-heading text-4xl font-bold md:text-6xl">
            {copy.heroStory.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#CBBBA8]">
            {site.tagline[locale]} — {site.address}
          </p>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
