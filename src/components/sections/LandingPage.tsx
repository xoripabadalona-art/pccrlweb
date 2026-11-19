import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { isValidLocale, locales, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import { getMenuItemById, type MenuItem } from '@/data/menu';
import {
  LANDING_IDS,
  findLandingId,
  getLanding,
  getLandingPath,
  getLandingSlug,
  getPizzaNames,
} from '@/data/landings';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/sections/Footer';
import { MenuItemCard } from '@/components/sections/Menu';
import { BasketDrawer } from '@/components/basket/BasketDrawer';
import { FloatingWhatsApp } from '@/components/basket/FloatingWhatsApp';
import { AnalyticsAndConsent } from '@/components/seo/AnalyticsAndConsent';
import {
  JsonLd,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildRestaurantJsonLd,
  getGoogleMapsUrl,
} from '@/components/seo/JsonLd';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

type Params = Promise<{ locale: string; landing: string }>;

/** Every (language, address) pair: each language has its own translated address */
export function landingStaticParams() {
  return locales.flatMap((locale) =>
    LANDING_IDS.map((id) => ({ locale, landing: getLandingSlug(id, locale) }))
  );
}

async function resolve(params: Params) {
  const { locale: rawLocale, landing: slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'es';
  const id = findLandingId(locale, slug) ?? LANDING_IDS[0]!;
  return { locale, id, content: getLanding(id, locale) };
}

export async function buildLandingMetadata(params: Params): Promise<Metadata> {
  const { locale, id, content } = await resolve(params);
  const url = `${siteUrl}${getLandingPath(id, locale)}`;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: {
      canonical: url,
      languages: {
        'es-ES': `${siteUrl}${getLandingPath(id, 'es')}`,
        'ca-ES': `${siteUrl}${getLandingPath(id, 'ca')}`,
        'x-default': `${siteUrl}${getLandingPath(id, 'es')}`,
      },
    },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
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
      title: content.metaTitle,
      description: content.metaDescription,
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export async function LandingPageView({ params }: { params: Params }) {
  const { locale, id, content } = await resolve(params);
  const url = `${siteUrl}${getLandingPath(id, locale)}`;
  const otherLocale: Locale = locale === 'es' ? 'ca' : 'es';
  const items = content.itemIds
    .map((itemId) => getMenuItemById(itemId))
    .filter((item): item is MenuItem => Boolean(item));
  const related = LANDING_IDS.filter((other) => other !== id).map((other) => ({
    id: other,
    content: getLanding(other, locale),
  }));
  const t = (es: string, ca: string) => (locale === 'ca' ? ca : es);

  return (
    <>
      <JsonLd id="jsonld-restaurant-landing" data={buildRestaurantJsonLd(locale)} />
      <JsonLd
        id="jsonld-breadcrumb-landing"
        data={buildBreadcrumbJsonLd(locale, [
          { name: site.name, url: `${siteUrl}/${locale}` },
          { name: content.h1, url },
        ])}
      />
      <JsonLd id="jsonld-items-landing" data={buildItemListJsonLd(locale, url, content.itemIds)} />

      <Navbar
        locale={locale}
        currentPath="carta"
        alternateHref={getLandingPath(id, otherLocale)}
      />

      <main id="main-content" className="flex-1 bg-[#F4EBDD] pt-24 text-[#1A1512]">
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#574B42]"
          >
            <Link href={`/${locale}`} className="underline hover:text-[#A8241B]">
              {site.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#1A1512]">
              {content.linkLabel}
            </span>
          </nav>

          <header className="border-b border-[#1A1512]/15 pb-10">
            <p className="mb-2 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
              {content.eyebrow}
            </p>
            <h1 className="font-serif-heading max-w-4xl text-3xl leading-tight font-bold text-balance md:text-5xl">
              {content.h1}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#574B42]">{content.lead}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#productos"
                className="btn-pill inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#EE6A2B] px-8 py-2.5 text-sm font-extrabold text-[#14110F] transition-transform hover:scale-105 hover:bg-[#F37D44] md:text-base"
              >
                {t('Empezar el pedido', 'Començar la comanda')}
              </a>
              <Link
                href={`/${locale}/carta`}
                className="btn-pill inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#1A1512]/25 bg-[#FAF5ED] px-7 py-2.5 text-sm font-bold text-[#1A1512] hover:bg-[#E5D7C3] md:text-base"
              >
                {t('Ver la carta completa', 'Veure la carta completa')}
              </Link>
            </div>
          </header>
        </div>

        {/* What you can order from this page */}
        <section
          id="productos"
          aria-labelledby="landing-items-heading"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 md:px-8"
        >
          <h2
            id="landing-items-heading"
            className="font-serif-heading mb-6 text-2xl font-bold md:text-3xl"
          >
            {content.itemsHeading}
          </h2>
          <ul
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
              items.length === 1 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
            }`}
          >
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} locale={locale} />
            ))}
          </ul>

          {content.showPizzaNames && (
            <div className="mt-8 rounded-2xl border border-[#1A1512]/12 bg-[#FAF5ED] p-6">
              <h3 className="font-serif-heading mb-3 text-xl font-bold">{content.showPizzaNames}</h3>
              <ul className="flex flex-wrap gap-2">
                {getPizzaNames(locale).map((pizza) => (
                  <li key={pizza.id}>
                    <Link
                      href={`/${locale}/carta#menu-item-${pizza.id}`}
                      className="inline-flex min-h-[40px] items-center rounded-full bg-[#E5D7C3] px-4 py-1.5 text-sm font-semibold text-[#1A1512] hover:bg-[#D5C3AA]"
                    >
                      {pizza.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* The detail, in plain words */}
        <div className="mx-auto max-w-7xl px-4 pb-14 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {content.sections.map((section) => {
              const ListTag = section.ordered ? 'ol' : 'ul';
              return (
                <section
                  key={section.heading}
                  className="rounded-[24px] border border-[#1A1512]/10 bg-[#FAF5ED] p-6 md:p-8"
                >
                  <h2 className="font-serif-heading mb-3 text-xl font-bold md:text-2xl">
                    {section.heading}
                  </h2>
                  {section.list && (
                    <ListTag
                      className={`mb-3 flex flex-col gap-2 pl-5 text-[15px] leading-relaxed text-[#3A312B] marker:font-bold marker:text-[#A8241B] ${
                        section.ordered ? 'list-decimal' : 'list-disc'
                      }`}
                    >
                      {section.list.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ListTag>
                  )}
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mb-3 text-[15px] leading-relaxed text-[#3A312B] last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.link && (
                    <a
                      href={section.link.href}
                      {...(section.link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#A8241B] underline underline-offset-4 hover:text-[#1A1512]"
                    >
                      {section.link.label}
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {/* Where, and the questions people ask */}
        <div className="bg-[#14110F] text-[#F9F4EC]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:px-8">
            <section aria-labelledby="landing-where-heading">
              <h2
                id="landing-where-heading"
                className="font-serif-heading mb-4 text-2xl font-bold md:text-3xl"
              >
                {t('Dónde recogerlo', 'On recollir-ho')}
              </h2>
              <p className="text-lg font-bold">{site.name}</p>
              <p className="mt-1 text-[#E5D7C3]">{site.address}</p>
              <p className="mt-2">
                <a
                  href={`tel:${site.phoneTel}`}
                  className="font-bold underline underline-offset-4 hover:text-[#EE6A2B]"
                >
                  {site.phone}
                </a>
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#EE6A2B] px-6 py-2.5 text-sm font-extrabold text-[#14110F] hover:bg-[#F37D44]"
                >
                  {t('Cómo llegar', 'Com arribar-hi')}
                  <span aria-hidden="true">↗</span>
                </a>
                <Link
                  href={`/${locale}#ubicacion`}
                  className="btn-pill inline-flex min-h-[46px] items-center rounded-full border border-[#F9F4EC]/30 px-6 py-2.5 text-sm font-bold hover:border-[#EE6A2B] hover:text-[#EE6A2B]"
                >
                  {t('Ver horario', 'Veure horari')}
                </Link>
              </div>
            </section>

            <section aria-labelledby="landing-faq-heading">
              <h2
                id="landing-faq-heading"
                className="font-serif-heading mb-4 text-2xl font-bold md:text-3xl"
              >
                {t('Preguntas frecuentes', 'Preguntes freqüents')}
              </h2>
              <dl className="flex flex-col gap-4">
                {content.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-[#F9F4EC]/15 bg-[#1F1813] p-5"
                  >
                    <dt className="font-serif-heading text-lg font-bold text-[#F9F4EC]">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-[#E5D7C3]">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        {/* Keep exploring */}
        <nav
          aria-label={t('También te puede interesar', 'També et pot interessar')}
          className="mx-auto max-w-7xl px-4 py-12 md:px-8"
        >
          <h2 className="font-serif-heading mb-5 text-xl font-bold md:text-2xl">
            {t('También te puede interesar', 'També et pot interessar')}
          </h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {related.map(({ id: otherId, content: other }) => (
              <li key={otherId}>
                <Link
                  href={getLandingPath(otherId, locale)}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-[#1A1512]/12 bg-[#FAF5ED] px-5 py-4 transition-shadow hover:shadow-md"
                >
                  <span>
                    <span className="font-serif-heading block text-lg font-bold">
                      {other.linkLabel}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#574B42]">{other.linkBlurb}</span>
                  </span>
                  <span aria-hidden="true" className="text-xl font-bold text-[#A8241B]">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${locale}/carta`}
                className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-[#1A1512]/12 bg-[#14110F] px-5 py-4 text-[#F9F4EC] transition-shadow hover:shadow-md"
              >
                <span>
                  <span className="font-serif-heading block text-lg font-bold">
                    {t('Carta completa', 'Carta completa')}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#CBBBA8]">
                    {t('Pizzas, pizzetas, empanadas y bebidas', 'Pizzes, pizzetes, empanades i begudes')}
                  </span>
                </span>
                <span aria-hidden="true" className="text-xl font-bold text-[#EE6A2B]">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </main>

      <Footer locale={locale} />
      <BasketDrawer locale={locale} />
      <FloatingWhatsApp locale={locale} />
      <AnalyticsAndConsent locale={locale} />
    </>
  );
}
