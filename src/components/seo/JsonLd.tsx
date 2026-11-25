import React from 'react';
import { site } from '@/data/site';
import {
  getMenuItem3dImage,
  getMenuItemPhoto,
  menuCategories,
  menuItems,
  type MenuItem,
} from '@/data/menu';
import { faqItems } from '@/data/faq';
import type { Locale } from '@/data/copy';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

/** Link to the business on Google Maps: the client's own link once confirmed, a place search until then */
export function getGoogleMapsUrl() {
  if (site.googleMapsUrl.startsWith('http')) return site.googleMapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.name} ${site.address}`
  )}`;
}

/** Real photos of the premises and the food — never illustrations */
const REAL_PHOTOS = [
  '/images/real/storefront-close.webp',
  '/images/real/interior-day.webp',
  '/images/real/pizza-pepperoni-box.webp',
  '/images/real/founder-gustavo.webp',
];

/** An image that actually shows the dish, or none at all */
function menuItemImage(item: MenuItem): string | undefined {
  const src = getMenuItem3dImage(item) ?? getMenuItemPhoto(item);
  return src ? `${siteUrl}${src}` : undefined;
}

export function buildRestaurantJsonLd(locale: Locale) {
  const sameAs = [
    site.instagram,
    site.tiktok,
    site.facebook,
    site.googleMapsUrl,
  ].filter((url) => url.startsWith('http'));

  const openingHoursSpecification = site.hours.map((interval) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${interval.day}`,
    opens: interval.open,
    closes: interval.close,
  }));

  const restaurant: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteUrl}/#restaurant`,
    additionalType: 'http://www.productontology.org/id/Pizzeria',
    name: site.name,
    description: site.tagline[locale],
    url: `${siteUrl}/${locale}`,
    telephone: site.phone,
    priceRange: site.priceRange,
    servesCuisine: ['Pizza', 'Italian'],
    acceptsReservations: false,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.addressStructured.streetAddress,
      postalCode: site.addressStructured.postalCode,
      addressLocality: site.addressStructured.addressLocality,
      addressRegion: site.addressStructured.addressRegion,
      addressCountry: site.addressStructured.addressCountry,
    },
    image: REAL_PHOTOS.map((src) => `${siteUrl}${src}`),
    logo: `${siteUrl}${site.logoPng}`,
    sameAs,
    hasMap: getGoogleMapsUrl(),
    hasMenu: `${siteUrl}/${locale}/carta`,
    areaServed: [
      {
        '@type': 'City',
        name: site.addressStructured.addressLocality,
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Centre, Badalona',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Casagemes, Badalona',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Dalt de la Vila, Badalona',
      },
    ],
    keywords:
      locale === 'ca'
        ? 'pizzeria a Badalona, pizza a Badalona, pizza per emportar Badalona, pizzetes Badalona, pizzeria Carrer de Mar Badalona, pizzes esdeveniments Badalona'
        : 'pizzería en Badalona, pizza en Badalona, pizza para llevar Badalona, pizzetas Badalona, pizzería Carrer de Mar Badalona, pizzas eventos y mayoreo Badalona',
    openingHoursSpecification,
    // Ordering starts on the menu page: pick the items there, send them by WhatsApp, collect in store
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/${locale}/carta`,
        inLanguage: locale === 'ca' ? 'ca-ES' : 'es-ES',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModePickUp'],
    },
  };

  if (site.geo.latitude !== null && site.geo.longitude !== null) {
    restaurant.geo = {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    };
  }

  return restaurant;
}

export function buildMenuJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${siteUrl}/${locale}/carta#menu`,
    name:
      locale === 'ca'
        ? `Carta de ${site.name}`
        : `Carta de ${site.name}`,
    url: `${siteUrl}/${locale}/carta`,
    inLanguage: locale === 'ca' ? 'ca-ES' : 'es-ES',
    hasMenuSection: menuCategories.map((category) => {
      const items = menuItems.filter((item) => item.category === category.id);
      return {
        '@type': 'MenuSection',
        name: category.label[locale],
        description: category.description[locale],
        hasMenuItem: items.map((item) => ({
          '@type': 'MenuItem',
          '@id': `${siteUrl}/${locale}/carta#menu-item-${item.id}`,
          name: item.name[locale],
          description: item.ingredients[locale],
          image: menuItemImage(item),
          suitableForDiet: item.vegetarian
            ? 'https://schema.org/VegetarianDiet'
            : undefined,
          offers: {
            '@type': 'Offer',
            price: (item.priceCents / 100).toFixed(2),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
        })),
      };
    }),
  };
}

export function buildFaqJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/${locale}#faq-schema`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer[locale],
      },
    })),
  };
}

export function buildLandingFaqJsonLd(
  pageUrl: string,
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq-schema`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** Offers for a hand-picked set of dishes, for the focused landing pages */
export function buildItemListJsonLd(locale: Locale, pageUrl: string, itemIds: string[]) {
  const items = itemIds
    .map((id) => menuItems.find((item) => item.id === id))
    .filter((item): item is MenuItem => Boolean(item));
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#items`,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'MenuItem',
        '@id': `${siteUrl}/${locale}/carta#menu-item-${item.id}`,
        name: item.name[locale],
        description: item.ingredients[locale],
        image: menuItemImage(item),
        offers: {
          '@type': 'Offer',
          price: (item.priceCents / 100).toFixed(2),
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
}

export function buildVideoListJsonLd(locale: Locale) {
  const isCa = locale === 'ca';
  const videos = [
    {
      id: 'video-pizzetas-gustavo',
      name: isCa
        ? 'Pizzetes artesanals a Badalona des de 3 € (Promo 5+1) — La Piccerella Carrer de Mar'
        : 'Pizzetas artesanales en Badalona desde 3 € (Promo 5+1) — La Piccerella Carrer de Mar',
      description: isCa
        ? 'En Gustavo prepara i enforna al moment les pizzetes individuals de 16 cm amb massa fermentada 48 hores a La Piccerella (Carrer de Mar, 127, Badalona).'
        : 'Gustavo prepara y hornea al momento las pizzetas individuales de 16 cm con masa fermentada 48 horas en La Piccerella (Carrer de Mar, 127, Badalona).',
      thumbnailUrl: `${siteUrl}/videos/pizzetas-gustavo-poster.webp`,
      contentUrl: `${siteUrl}/videos/pizzetas-gustavo.mp4`,
      duration: 'PT12S',
    },
    {
      id: 'video-horno-piccerella',
      name: isCa
        ? 'Pizza artesanal per emportar a Badalona acabada de sortir del forn — La Piccerella'
        : 'Pizza artesanal para llevar en Badalona recién salida del horno — La Piccerella',
      description: isCa
        ? 'Elaboració de pizza artesanal amb massa de 48 hores de fermentació lenta al nostre obrador del Carrer de Mar, 127, a 2 minuts de la platja de Badalona.'
        : 'Elaboración de pizza artesanal con masa de 48 horas de fermentación lenta en nuestro obrador de Carrer de Mar, 127, a 2 minutos de la playa de Badalona.',
      thumbnailUrl: `${siteUrl}/videos/proceso-3-horno-poster.webp`,
      contentUrl: `${siteUrl}/videos/proceso-3-horno.mp4`,
      duration: 'PT6S',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/${locale}#videos-schema`,
    itemListElement: videos.map((v, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'VideoObject',
        '@id': `${siteUrl}/${locale}#${v.id}`,
        name: v.name,
        description: v.description,
        thumbnailUrl: [v.thumbnailUrl],
        contentUrl: v.contentUrl,
        uploadDate: '2026-11-01T12:00:00+01:00',
        duration: v.duration,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  locale: Locale,
  items: { name: string; url: string }[]
) {
  const pageUrl = items[items.length - 1]?.url ?? `${siteUrl}/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
