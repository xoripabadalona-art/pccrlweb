import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCopy, isValidLocale, locales, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import { Navbar } from '@/components/ui/Navbar';
import { Menu } from '@/components/sections/Menu';
import { Footer } from '@/components/sections/Footer';
import { BasketDrawer } from '@/components/basket/BasketDrawer';
import { FloatingWhatsApp } from '@/components/basket/FloatingWhatsApp';
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed';
import {
  buildBreadcrumbJsonLd,
  buildMenuJsonLd,
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
    title: copy.seo.cartaTitle,
    description: copy.seo.cartaDescription,
    alternates: {
      canonical: `${siteUrl}/${locale}/carta`,
      languages: {
        'es-ES': `${siteUrl}/es/carta`,
        'ca-ES': `${siteUrl}/ca/carta`,
        'x-default': `${siteUrl}/es/carta`,
      },
    },
    openGraph: {
      title: copy.seo.cartaTitle,
      description: copy.seo.cartaDescription,
      url: `${siteUrl}/${locale}/carta`,
      siteName: site.name,
      locale: locale === 'ca' ? 'ca_ES' : 'es_ES',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: `${site.name} — ${site.legalDescriptor}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.seo.cartaTitle,
      description: copy.seo.cartaDescription,
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export default async function CartaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'es';
  const copy = getCopy(locale);

  const restaurantJsonLd = buildRestaurantJsonLd(locale);
  const menuJsonLd = buildMenuJsonLd(locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: site.name, url: `${siteUrl}/${locale}` },
    { name: copy.nav.fullMenuPage, url: `${siteUrl}/${locale}/carta` },
  ]);

  return (
    <>
      <JsonLd id="jsonld-restaurant-carta" data={restaurantJsonLd} />
      <JsonLd id="jsonld-menu" data={menuJsonLd} />
      <JsonLd id="jsonld-breadcrumb" data={breadcrumbJsonLd} />

      <Navbar locale={locale} currentPath="carta" />

      <main id="main-content" className="flex-1 bg-[#F4EBDD] pt-24 text-[#1A1512]">
        {/* Breadcrumb navigation */}
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#574B42]"
          >
            <Link href={`/${locale}`} className="underline hover:text-[#C8372D]">
              {site.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#1A1512]">
              {copy.nav.fullMenuPage}
            </span>
          </nav>

          <header className="mb-4 border-b border-[#1A1512]/15 pb-8">
            <h1 className="font-serif-heading text-3xl font-bold text-[#1A1512] md:text-5xl">
              {locale === 'ca'
                ? 'Carta completa de La Piccerella a Badalona'
                : 'Carta completa de La Piccerella en Badalona'}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#574B42]">
              {site.tagline[locale]}. {site.address} ·{' '}
              <a
                href={`tel:${site.phoneTel}`}
                className="font-bold text-[#1A1512] underline"
              >
                {site.phone}
              </a>
            </p>
          </header>
        </div>

        {/* Full indexable HTML Menu */}
        <Menu locale={locale} showFullPageLink={false} />

        {/* Pickup Location Map at the bottom of the menu */}
        <section
          data-theme="dark"
          aria-labelledby="carta-map-heading"
          className="bg-[#14110F] py-14 text-[#F9F4EC]"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
                  {locale === 'ca' ? 'Recollida al local' : 'Recogida en el local'}
                </p>
                <h2
                  id="carta-map-heading"
                  className="font-serif-heading mt-1 text-2xl font-bold md:text-3xl"
                >
                  {locale === 'ca'
                    ? 'On recollir la teva comanda a Badalona'
                    : 'Dónde recoger tu pedido en Badalona'}
                </h2>
              </div>
              <p className="text-sm text-[#CBBBA8]">
                {site.address} ·{' '}
                <a
                  href={`tel:${site.phoneTel}`}
                  className="font-bold text-[#F1B24A] underline underline-offset-4"
                >
                  {site.phone}
                </a>
              </p>
            </div>
            <GoogleMapEmbed locale={locale} heightClass="h-[280px] md:h-[340px]" />
          </div>
        </section>
      </main>

      <Footer locale={locale} />
      <BasketDrawer locale={locale} />
      <FloatingWhatsApp locale={locale} />
      <AnalyticsAndConsent locale={locale} />
    </>
  );
}
