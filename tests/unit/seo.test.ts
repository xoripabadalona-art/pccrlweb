import { describe, expect, it } from 'vitest';
import { site } from '@/data/site';
import { copyEs } from '@/data/copy.es';
import { copyCa } from '@/data/copy.ca';
import { LANDING_IDS, getLanding, getLandingSlug } from '@/data/landings';
import { HOME_HIGHLIGHT_IDS, getHomeHighlights, menuItems } from '@/data/menu';
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildFaqJsonLd,
  buildMenuJsonLd,
  buildRestaurantJsonLd,
} from '@/components/seo/JsonLd';

describe('SEO & Structured Data (Section 8)', () => {
  it('enforces title (< 60 chars) and meta description (140-160 chars) for ES and CA', () => {
    for (const copy of [copyEs, copyCa]) {
      expect(copy.seo.homeTitle.length).toBeLessThan(60);
      expect(copy.seo.cartaTitle.length).toBeLessThan(60);

      expect(copy.seo.homeDescription.length).toBeGreaterThanOrEqual(140);
      expect(copy.seo.homeDescription.length).toBeLessThanOrEqual(160);

      expect(copy.seo.cartaDescription.length).toBeGreaterThanOrEqual(140);
      expect(copy.seo.cartaDescription.length).toBeLessThanOrEqual(160);
    }
  });

  it('generates valid Restaurant JSON-LD matching NAP and without self-served aggregateRating', () => {
    const jsonLd = buildRestaurantJsonLd('es');

    expect(jsonLd['@type']).toBe('Restaurant');
    expect(jsonLd.name).toBe(site.name);
    expect(jsonLd.telephone).toBe(site.phone);
    expect(
      (jsonLd.address as { streetAddress: string }).streetAddress
    ).toBe(site.addressStructured.streetAddress);
    expect(jsonLd.servesCuisine).toEqual(['Pizza', 'Italian', 'Argentinian']);
    expect(jsonLd.acceptsReservations).toBe(false);
    expect(jsonLd.hasMenu).toContain('/es/carta');

    // Hard Rule #2 & Section 8: never include self-served aggregateRating or Review markup
    expect(jsonLd).not.toHaveProperty('aggregateRating');
    expect(jsonLd).not.toHaveProperty('review');
    expect(jsonLd).not.toHaveProperty('reviews');

    // Never include unconfirmed TODO strings in sameAs URLs
    const sameAs = jsonLd.sameAs as string[];
    for (const url of sameAs) {
      expect(url.startsWith('http')).toBe(true);
      expect(url).not.toContain('TODO');
    }
  });

  it('describes the real premises: real photos, a map link and a pickup order action', () => {
    const jsonLd = buildRestaurantJsonLd('ca');

    const images = jsonLd.image as string[];
    expect(images.length).toBeGreaterThan(0);
    for (const url of images) expect(url).toContain('/images/real/');

    expect(String(jsonLd.hasMap)).toMatch(/^https:\/\//);

    const action = jsonLd.potentialAction as {
      '@type': string;
      target: { urlTemplate: string; inLanguage: string };
    };
    expect(action['@type']).toBe('OrderAction');
    expect(action.target.urlTemplate).toContain('/ca/carta');
    expect(action.target.inLanguage).toBe('ca-ES');
  });

  it('never attaches a stand-in photo to a menu item', () => {
    const menuLd = buildMenuJsonLd('es');
    const images = menuLd.hasMenuSection
      .flatMap((section) => section.hasMenuItem)
      .map((item) => item.image)
      .filter((image): image is string => Boolean(image));
    expect(images.length).toBeGreaterThan(0);
    for (const url of images) {
      expect(url).not.toContain('storefront');
      expect(url).not.toContain('interior-day');
    }
  });

  it('gives every focused page a unique address, a short title and a full description in both languages', () => {
    const slugs = new Set<string>();
    for (const id of LANDING_IDS) {
      for (const locale of ['es', 'ca'] as const) {
        const page = getLanding(id, locale);
        expect(page.slug).toBe(getLandingSlug(id, locale));
        slugs.add(`${locale}/${page.slug}`);

        expect(page.metaTitle.length).toBeLessThan(60);
        expect(page.metaDescription.length).toBeGreaterThanOrEqual(140);
        expect(page.metaDescription.length).toBeLessThanOrEqual(160);

        // every dish it sells exists in the menu
        expect(page.itemIds.length).toBeGreaterThan(0);
        for (const itemId of page.itemIds) {
          expect(menuItems.some((item) => item.id === itemId)).toBe(true);
        }
        const list = buildItemListJsonLd(locale, `https://example.test/${page.slug}`, page.itemIds);
        expect(list.itemListElement).toHaveLength(page.itemIds.length);
      }
    }
    expect(slugs.size).toBe(LANDING_IDS.length * 2);
  });

  it('shows a short selection on the home page, not the whole menu', () => {
    const highlights = getHomeHighlights();
    expect(highlights).toHaveLength(HOME_HIGHLIGHT_IDS.length);
    expect(highlights.length).toBeLessThan(menuItems.length / 2);
  });

  it('generates valid Menu, MenuSection, and MenuItem JSON-LD with EUR offers', () => {
    const menuLd = buildMenuJsonLd('es');
    expect(menuLd['@type']).toBe('Menu');
    expect(menuLd.hasMenuSection.length).toBeGreaterThan(0);

    const firstSection = menuLd.hasMenuSection[0]!;
    expect(firstSection['@type']).toBe('MenuSection');
    expect(firstSection.hasMenuItem.length).toBeGreaterThan(0);

    const firstItem = firstSection.hasMenuItem[0]!;
    expect(firstItem['@type']).toBe('MenuItem');
    expect(firstItem.offers['@type']).toBe('Offer');
    expect(firstItem.offers.priceCurrency).toBe('EUR');
    expect(firstItem.offers.price).toMatch(/^\d+\.\d{2}$/);
  });

  it('generates valid FAQPage and BreadcrumbList JSON-LD', () => {
    const faqLd = buildFaqJsonLd('es');
    expect(faqLd['@type']).toBe('FAQPage');
    expect(faqLd.mainEntity.length).toBeGreaterThanOrEqual(6);

    const breadcrumbLd = buildBreadcrumbJsonLd('es', [
      { name: 'La Piccerella', url: 'https://lapiccerella.es/es' },
      { name: 'Carta', url: 'https://lapiccerella.es/es/carta' },
    ]);
    expect(breadcrumbLd['@type']).toBe('BreadcrumbList');
    expect(breadcrumbLd.itemListElement).toHaveLength(2);
  });
});
