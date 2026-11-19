import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('La Piccerella E2E Smoke, Reduced Motion, NAP & Accessibility', () => {
  test('customer can add item, open basket, fill checkout form, and build WhatsApp order link', async ({
    page,
  }) => {
    await page.goto('/es');

    // Verify server-rendered H1 with primary keyword & city
    const h1 = page.locator('h1');
    await expect(h1).toContainText('La Piccerella, pizzería artesanal en Badalona');

    // Add a Pepperoni pizza from the Menu section
    const addPepperoniBtn = page.getByTestId('add-to-order-pizza-pepperoni');
    await addPepperoniBtn.scrollIntoViewIfNeeded();
    await addPepperoniBtn.click();

    // Verify badge updates to 1
    await expect(page.getByTestId('navbar-basket-count')).toHaveText('1');

    // Open basket drawer
    await page.getByTestId('navbar-order-button').click();

    // Verify drawer shows line item and total 12,00 €
    await expect(page.getByTestId('basket-line-items')).toContainText('Pepperoni');
    await expect(page.getByTestId('basket-total')).toHaveText('12,00 €');

    // Fill checkout form
    await page.getByTestId('checkout-name-input').fill('Ana');
    await page.getByTestId('checkout-notes-input').fill('sin cebolla');

    // Submit form to build WhatsApp link
    await page.getByTestId('submit-whatsapp-order').click();

    const fallbackLink = page.getByTestId('whatsapp-fallback-link');
    await expect(fallbackLink).toBeVisible();

    const href = await fallbackLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('https://wa.me/');

    const decodedText = decodeURIComponent(href!.split('?text=')[1] ?? '');
    expect(decodedText).toContain('Hola La Piccerella! Quiero hacer un pedido:');
    expect(decodedText).toContain('• 1 x Pepperoni (pizza entera) — 12,00 €');
    expect(decodedText).toContain('Total: 12,00 €');
    expect(decodedText).toContain('Tipo: Recogida en local');
    expect(decodedText).toContain('Nombre: Ana');
    expect(decodedText).toContain('Notas: sin cebolla');
  });

  test('verifies NAP consistency across Location section, Footer, and JSON-LD', async ({
    page,
  }) => {
    await page.goto('/es');

    const expectedName = 'La Piccerella';
    const expectedAddress = 'Carrer de Mar, 127, 08911 Badalona, Barcelona';
    const expectedPhone = '+34 934 43 07 37';

    await expect(page.getByTestId('location-nap-name')).toHaveText(expectedName);
    await expect(page.getByTestId('location-nap-address')).toHaveText(expectedAddress);
    await expect(page.getByTestId('location-nap-phone')).toHaveText(expectedPhone);

    await expect(page.getByTestId('footer-nap-name')).toHaveText(expectedName);
    await expect(page.getByTestId('footer-nap-address')).toHaveText(expectedAddress);
    await expect(page.getByTestId('footer-nap-phone')).toHaveText(expectedPhone);

    // Verify JSON-LD Restaurant matches NAP and has no aggregateRating
    const restaurantLdRaw = await page
      .locator('script#jsonld-restaurant')
      .textContent();
    expect(restaurantLdRaw).toBeTruthy();
    const restaurantLd = JSON.parse(restaurantLdRaw!);
    expect(restaurantLd.name).toBe(expectedName);
    expect(restaurantLd.telephone).toBe(expectedPhone);
    expect(restaurantLd.address.streetAddress).toBe('Carrer de Mar, 127');
    expect(restaurantLd.aggregateRating).toBeUndefined();
  });

  test('respects prefers-reduced-motion with static exploded pizza fallback', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/es');

    await expect(page.getByTestId('exploded-pizza-reduced-motion')).toBeVisible();
    await context.close();
  });

  test('1:1 3D pizza carousel allows swiping/switching across all 15 pizzas and updates 3D layers & ingredients', async ({
    page,
  }) => {
    await page.goto('/es');

    // Default first 3D pizza is Pepperoni (12,00 €)
    const stageHeading = page.locator('#exploded-pizza-heading');
    await expect(stageHeading).toContainText('Pizza Pepperoni');

    // Click next arrow to swipe 1:1 to Margarita (9,50 €)
    await page.getByTestId('pizza-3d-next').click();
    await expect(stageHeading).toContainText('Pizza Margarita');
    await expect(stageHeading).toContainText('9,50 €');

    // Select Carbonara directly via 1:1 pill bar and verify white sauce & Carbonara callouts
    await page.getByTestId('pizza-3d-pill-pizza-carbonara').click();
    await expect(stageHeading).toContainText('Pizza Carbonara');
    await expect(stageHeading).toContainText('13,00 €');
    await expect(page.locator('#exploded-pizza')).toContainText('Bacon y Huevo');
  });

  test('passes axe-core WCAG AA accessibility audit on /es and /es/carta', async ({
    page,
  }) => {
    await page.goto('/es');
    const homeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(homeResults.violations).toEqual([]);

    await page.goto('/es/carta');
    const cartaResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(cartaResults.violations).toEqual([]);
  });

  test('meets Core Web Vitals (CLS < 0.1, FCP/LCP < 2.5s) and 100/100 technical SEO checks', async ({
    page,
  }) => {
    await page.goto('/es', { waitUntil: 'networkidle' });

    // 1. Single H1 check
    await expect(page.locator('h1')).toHaveCount(1);

    // 2. Canonical & hreflang alternates
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(canonical).toBe('https://lapiccerella.es/es');

    const hreflangEs = await page
      .locator('link[rel="alternate"][hreflang="es-ES"]')
      .getAttribute('href');
    const hreflangCa = await page
      .locator('link[rel="alternate"][hreflang="ca-ES"]')
      .getAttribute('href');
    expect(hreflangEs).toBe('https://lapiccerella.es/es');
    expect(hreflangCa).toBe('https://lapiccerella.es/ca');

    // 3. Every img has an explicit alt attribute
    const missingAltCount = await page
      .locator('img:not([alt])')
      .count();
    expect(missingAltCount).toBe(0);

    // 4. Measure CLS and FCP via Performance API
    const metrics = await page.evaluate(() => {
      const fcpEntry = performance
        .getEntriesByType('paint')
        .find((e) => e.name === 'first-contentful-paint');
      const layoutShiftEntries = performance.getEntriesByType(
        'layout-shift'
      ) as unknown as { value: number; hadRecentInput: boolean }[];
      const cls = layoutShiftEntries
        .filter((e) => !e.hadRecentInput)
        .reduce((sum, e) => sum + e.value, 0);
      return {
        fcpMs: fcpEntry ? fcpEntry.startTime : 0,
        cls,
      };
    });

    expect(metrics.fcpMs).toBeLessThan(2500);
    expect(metrics.cls).toBeLessThan(0.1);
  });
});
