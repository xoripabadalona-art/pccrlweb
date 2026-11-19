import { describe, expect, it } from 'vitest';
import { site } from '@/data/site';
import { copyEs } from '@/data/copy.es';
import { copyCa } from '@/data/copy.ca';
import {
  buildBreadcrumbJsonLd,
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
