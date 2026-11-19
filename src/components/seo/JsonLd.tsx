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
    site.uberEatsUrl,
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
    servesCuisine: ['Pizza', 'Italian', 'Argentinian'],
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
    areaServed: {
      '@type': 'City',
      name: site.addressStructured.addressLocality,
    },
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
