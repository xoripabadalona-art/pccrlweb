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
import { MenuItemCard, StickerLoyaltyBanner } from '@/components/sections/Menu';
import { EventCalculator } from '@/components/sections/EventCalculator';
import { BasketDrawer } from '@/components/basket/BasketDrawer';
import { FloatingWhatsApp } from '@/components/basket/FloatingWhatsApp';
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed';
import { AnalyticsAndConsent } from '@/components/seo/AnalyticsAndConsent';
import {
  JsonLd,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildLandingFaqJsonLd,
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
  const t = (es: string, ca: string) => (locale === 'ca' ? ca : es);

  const eventCards = [
    {
      icon: '🎂',
      tag: t('Sin cortar · Listas para servir', 'Sense tallar · A punt per servir'),
      title: t('Cumpleaños y Fiestas Infantiles', 'Aniversaris i Festes Infantils'),
      desc: t(
        'Pizzetas individuales de 16 cm desde 3 € (Promo 5+1 gratis): cada invitado tiene su propia pizza recién horneada.',
        'Pizzetes individuals de 16 cm des de 3 € (Promo 5+1 gratis): cada convidat té la seva pròpia pizza acabada de fer.'
      ),
    },
    {
      icon: '💼',
      tag: t('Puntualidad garantizada', 'Puntualitat garantida'),
      title: t('Empresas, Oficinas y Reuniones', 'Empreses, Oficines i Reunions'),
      desc: t(
        'Combina Packs de 3 Pizzas Grandes (32 cm) y cajas de pizzetas variadas programadas a la hora exacta de tu evento.',
        'Combina Packs de 3 Pizzes Grans (32 cm) i caixes de pizzetes variades programades a l’hora exacta del teu esdeveniment.'
      ),
    },
    {
      icon: '⚽',
      tag: t('Tarifas por volumen', 'Tarifes per volum'),
      title: t('Colegios, AFA y Clubs Deportivos', 'Escoles, AFA i Clubs Esportius'),
      desc: t(
        'Pedidos grandes por mayoreo para finales de partido, torneos y fiestas escolares en Badalona con presupuesto a medida.',
        'Comandes grans per a finals de partit, tornejos i festes escolars a Badalona amb pressupost especial a mida.'
      ),
    },
    {
      icon: '🏖️',
      tag: t('A 2 min de la playa', 'A 2 min de la platja'),
      title: t('Planes en la Playa y Amigos', 'Plans a la Platja i Amics'),
      desc: t(
        `Recoge tu pedido recién salido del horno en ${site.addressStructured.streetAddress}, entre el centro y el paseo marítimo.`,
        `Recull la teva comanda acabada de sortir del forn a ${site.addressStructured.streetAddress}, entre el centre i el passeig marítim.`
      ),
    },
  ];

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
      <JsonLd id="jsonld-faq-landing" data={buildLandingFaqJsonLd(url, content.faqs)} />

      <Navbar
        locale={locale}
        currentPath="carta"
        alternateHref={getLandingPath(id, otherLocale)}
      />

      <main id="main-content" className="flex-1 bg-[#F4EBDD] text-[#1A1512]">
        {/* Dark Visual Hero Split — Zero Wall of Text */}
        <section
          data-theme="dark"
          className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#3A2116_0%,#1A130F_55%,#14110F_100%)] pt-28 pb-14 text-[#F9F4EC] md:pt-32 md:pb-20"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#CBBBA8]"
            >
              <Link href={`/${locale}`} className="underline hover:text-[#F1B24A]">
                {site.name}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-[#F1B24A]">
                {content.linkLabel}
              </span>
            </nav>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              {/* Left Hero Copy & Direct CTAs */}
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F1B24A]/40 bg-[#F1B24A]/15 px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#F1B24A] uppercase">
                  ★ {content.eyebrow}
                </span>
                <h1 className="font-serif-heading mt-3 text-3xl leading-tight font-extrabold text-balance sm:text-4xl md:text-5xl">
                  {content.h1}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#E5D7C3] md:text-lg">
                  {content.lead}
                </p>

                {/* 3 Quick Visual Pill Highlights */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#1F1813] px-3.5 py-1.5 text-xs font-bold text-[#F1B24A] ring-1 ring-[#F1B24A]/30">
                    🍕 {t('Pizzetas 16 cm: Paga 5 y llévate 6', 'Pizzetes 16 cm: Paga’n 5 i emporta-te’n 6')}
                  </span>
                  <span className="rounded-full bg-[#1F1813] px-3.5 py-1.5 text-xs font-bold text-[#F9F4EC] ring-1 ring-[#F9F4EC]/20">
                    🎉 {t('Pack 3 Pizzas Grandes: 34,99 €', 'Pack 3 Pizzes Grans: 34,99 €')}
                  </span>
                  <span className="rounded-full bg-[#1F1813] px-3.5 py-1.5 text-xs font-bold text-[#EE6A2B] ring-1 ring-[#EE6A2B]/35">
                    ★ {t('5 Stickers = 1 Pizza Grande Gratis', '5 Stickers = 1 Pizza Gran Gratis')}
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#calculadora-evento"
                    className="btn-pill inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#EE6A2B] px-7 py-3 text-sm font-extrabold text-[#14110F] shadow-[0_12px_28px_rgba(238,106,43,0.35)] transition-transform hover:scale-105 hover:bg-[#F37D44] md:text-base"
                  >
                    <span>⚡ {t('Calcular mi evento en 30 s', 'Calcular el meu esdeveniment en 30 s')}</span>
                  </a>
                  <a
                    href={`tel:${site.phoneTel}`}
                    className="btn-pill inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[#F1B24A]/50 bg-[#1F1813] px-6 py-3 text-sm font-extrabold text-[#F1B24A] hover:bg-[#F1B24A] hover:text-[#14110F] md:text-base"
                  >
                    <span>📞 {site.phone}</span>
                  </a>
                </div>
              </div>

              {/* Right Visual Showcase Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md overflow-hidden rounded-[28px] border border-[#F1B24A]/35 bg-[radial-gradient(circle_at_50%_40%,#3B261A_0%,#1A130F_70%)] p-5 shadow-2xl">
                  <div className="relative aspect-[16/10] w-full">
                    <img
                      src="/images/menu/pack-3-pizzas.webp"
                      alt={t(
                        'Pack Degustación de 3 Pizzas Grandes artesanales para eventos en Badalona',
                        'Pack Degustació de 3 Pizzes Grans artesanals per a esdeveniments a Badalona'
                      )}
                      width={800}
                      height={500}
                      className="h-full w-full scale-105 object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.65)]"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-[#14110F]/90 p-2.5 ring-1 ring-[#F9F4EC]/10">
                      <p className="font-serif-heading text-lg font-extrabold text-[#F1B24A]">3,00 €</p>
                      <p className="text-[10px] font-bold text-[#CBBBA8] uppercase">
                        {t('Pizzetas 16 cm', 'Pizzetes 16 cm')}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#14110F]/90 p-2.5 ring-1 ring-[#F1B24A]/35">
                      <p className="font-serif-heading text-lg font-extrabold text-[#EE6A2B]">5+1</p>
                      <p className="text-[10px] font-bold text-[#CBBBA8] uppercase">
                        {t('6ª Gratis', '6a Gratis')}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#14110F]/90 p-2.5 ring-1 ring-[#F9F4EC]/10">
                      <p className="font-serif-heading text-lg font-extrabold text-[#F1B24A]">34,99 €</p>
                      <p className="text-[10px] font-bold text-[#CBBBA8] uppercase">
                        {t('Pack 3 Grandes', 'Pack 3 Grans')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Visual Event Cards Grid */}
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {eventCards.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col justify-between rounded-[22px] border border-[#F9F4EC]/12 bg-[#1F1813]/90 p-5 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xl" aria-hidden="true">
                        {card.icon}
                      </span>
                      <span className="rounded-full bg-[#F1B24A]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#F1B24A] uppercase">
                        {card.tag}
                      </span>
                    </div>
                    <h2 className="font-serif-heading mt-3 text-lg font-bold text-[#F9F4EC]">
                      {card.title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#CBBBA8]">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Calculator & Direct Order Cards */}
        <section
          id="calculadora-evento"
          aria-labelledby="landing-items-heading"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 md:px-8"
        >
          <EventCalculator locale={locale} />

          <StickerLoyaltyBanner locale={locale} />

          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold tracking-widest text-[#A8241B] uppercase">
                {t('Añade packs o unidades sueltas', 'Afegeix packs o unitats soltes')}
              </p>
              <h2
                id="landing-items-heading"
                className="font-serif-heading mt-1 text-2xl font-bold md:text-3xl"
              >
                {content.itemsHeading}
              </h2>
            </div>
            <Link
              href={`/${locale}/carta`}
              className="text-sm font-extrabold text-[#A8241B] underline underline-offset-4 hover:text-[#1A1512]"
            >
              {t('Ver las 34 opciones en La Carta →', 'Veure les 34 opcions a La Carta →')}
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} locale={locale} />
            ))}
          </ul>

          {content.showPizzaNames && (
            <div className="mt-8 rounded-2xl border border-[#1A1512]/12 bg-[#FAF5ED] p-6">
              <h3 className="font-serif-heading mb-3 text-lg font-bold">{content.showPizzaNames}</h3>
              <ul className="flex flex-wrap gap-2">
                {getPizzaNames(locale).map((pizza) => (
                  <li key={pizza.id}>
                    <Link
                      href={`/${locale}/carta#menu-item-${pizza.id}`}
                      className="inline-flex min-h-[38px] items-center rounded-full bg-[#E5D7C3] px-3.5 py-1 text-xs font-bold text-[#1A1512] hover:bg-[#D5C3AA]"
                    >
                      {pizza.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Compact Collapsible FAQ & Pickup Location Bar */}
        <section className="bg-[#14110F] py-14 text-[#F9F4EC]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 md:grid-cols-12 md:px-8">
            <div className="md:col-span-5">
              <span className="text-xs font-extrabold tracking-widest text-[#F1B24A] uppercase">
                {t('Recogida puntual sin esperas', 'Recollida puntual sense esperes')}
              </span>
              <h2 className="font-serif-heading mt-1.5 text-2xl font-bold md:text-3xl">
                {site.name} · Badalona
              </h2>
              <p className="mt-2 text-sm text-[#E5D7C3]">{site.address}</p>
              <p className="mt-1 text-xs text-[#CBBBA8]">
                {t(
                  'A 2 minutos a pie de la Rambla y la Playa de Badalona · Metro L2 Pompeu Fabra',
                  'A 2 minuts a peu de la Rambla i la Platja de Badalona · Metro L2 Pompeu Fabra'
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#EE6A2B] px-5 py-2 text-xs font-extrabold text-[#14110F] hover:bg-[#F37D44]"
                >
                  {t('Cómo llegar en Google Maps', 'Com arribar-hi a Google Maps')} ↗
                </a>
                <a
                  href={`tel:${site.phoneTel}`}
                  className="btn-pill inline-flex min-h-[44px] items-center rounded-full border border-[#F9F4EC]/25 px-5 py-2 text-xs font-bold hover:border-[#F1B24A] hover:text-[#F1B24A]"
                >
                  📞 {site.phone}
                </a>
              </div>
              <GoogleMapEmbed
                locale={locale}
                heightClass="h-[220px] md:h-[240px]"
                className="mt-6"
              />
            </div>

            <div className="md:col-span-7">
              <h2 className="font-serif-heading mb-4 text-xl font-bold md:text-2xl">
                {t('Dudas rápidas sobre pedidos para eventos', 'Dubtes ràpids sobre comandes per a esdeveniments')}
              </h2>
              <div className="flex flex-col gap-3">
                {content.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-2xl border border-[#F9F4EC]/15 bg-[#1F1813] p-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-serif-heading text-base font-bold text-[#F9F4EC]">
                      <span>{faq.question}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14110F] text-sm font-bold text-[#F1B24A] transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 border-t border-[#F9F4EC]/10 pt-3 text-sm leading-relaxed text-[#E5D7C3]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
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
