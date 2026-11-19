import React from 'react';
import type { Metadata } from 'next';
import { getCopy, isValidLocale, locales, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import { Navbar } from '@/components/ui/Navbar';
import { ScrollProgressDots } from '@/components/ui/ScrollProgressDots';
import { IntroCream } from '@/components/sections/IntroCream';
import { ExplodedPizza } from '@/components/sections/ExplodedPizza';
import { Menu } from '@/components/sections/Menu';
import { Story } from '@/components/sections/Story';
import { Reviews } from '@/components/sections/Reviews';
import { Location } from '@/components/sections/Location';
import { Faq } from '@/components/sections/Faq';
import { Footer } from '@/components/sections/Footer';
import { BasketDrawer } from '@/components/basket/BasketDrawer';
import { FloatingWhatsApp } from '@/components/basket/FloatingWhatsApp';
import {
  buildFaqJsonLd,
  buildRestaurantJsonLd,
  JsonLd,
} from '@/components/seo/JsonLd';
import { AnalyticsAndConsent } from '@/components/seo/AnalyticsAndConsent';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'es';
  const copy = getCopy(locale);

  return {
    title: copy.seo.homeTitle,
    description: copy.seo.homeDescription,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'es-ES': `${siteUrl}/es`,
        'ca-ES': `${siteUrl}/ca`,
      },
    },
    openGraph: {
      title: copy.seo.homeTitle,
      description: copy.seo.homeDescription,
      url: `${siteUrl}/${locale}`,
      siteName: site.name,
      locale: locale === 'ca' ? 'ca_ES' : 'es_ES',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: `${site.name} — ${site.legalDescriptor} Badalona`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.seo.homeTitle,
      description: copy.seo.homeDescription,
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'es';

  const restaurantJsonLd = buildRestaurantJsonLd(locale);
  const faqJsonLd = buildFaqJsonLd(locale);

  return (
    <>
      <JsonLd id="jsonld-restaurant" data={restaurantJsonLd} />
      <JsonLd id="jsonld-faq" data={faqJsonLd} />

      <Navbar locale={locale} currentPath="home" />
      <ScrollProgressDots />

      <main id="main-content" className="flex-1">
        <ExplodedPizza locale={locale} />
        <IntroCream locale={locale} />
        <Menu locale={locale} />
        <Story locale={locale} />
        <Reviews locale={locale} />
        <Location locale={locale} />
        <Faq locale={locale} />
      </main>

      <Footer locale={locale} />
      <BasketDrawer locale={locale} />
      <FloatingWhatsApp locale={locale} />
      <AnalyticsAndConsent locale={locale} />
    </>
  );
}
