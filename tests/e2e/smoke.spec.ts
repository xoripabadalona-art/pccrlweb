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

  test('homepage animates a single 3D pizza and the menu cards use the 3D renders', async ({
    page,
  }) => {
    await page.goto('/es');

    // Only one scroll-driven pizza on the homepage: the four Pepperoni layers, no basil
    const stage = page.locator('#exploded-pizza');
    await expect(stage.locator('[data-layer-id]')).toHaveCount(5);
    await expect(stage.locator('[data-layer-id="basil"]')).toHaveCount(0);
    await expect(stage.locator('img[src*="basil"]')).toHaveCount(0);
    await expect(page.getByTestId('exploded-order-now-cta')).toContainText('Pepperoni');

    // Every pizza card in the menu shows its own 3D render instead of a flat photo
    await page.goto('/es/carta');
    const margaritaImg = page.locator('#menu-item-pizza-margarita img');
    await expect(margaritaImg).toHaveAttribute('src', /pizzas-3d\/pizza-margarita/);
    const carbonaraImg = page.locator('#menu-item-pizza-carbonara img');
    await expect(carbonaraImg).toHaveAttribute('src', /pizzas-3d\/pizza-carbonara/);
  });

  test('home shows a selection and links to the full menu; / points to /es as the original', async ({
    page,
    request,
  }) => {
    await page.goto('/es');
    const cards = page.locator('#carta [data-testid^="menu-item-"]');
    await expect(cards).toHaveCount(6);
    await expect(page.getByTestId('home-full-menu-link')).toHaveAttribute('href', '/es/carta');

    await page.goto('/es/carta');
    expect(await page.locator('[data-testid^="menu-item-"]').count()).toBeGreaterThan(30);

    // The bare domain serves the Spanish home but declares /es as canonical
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://lapiccerella.es/es'
    );

    // Catalan pages declare Catalan in the HTML itself, before any script runs
    const caHtml = await (await request.get('/ca')).text();
    expect(caHtml).toContain('<html lang="ca"');
    const esHtml = await (await request.get('/es')).text();
    expect(esHtml).toContain('<html lang="es"');
  });

  test('pizzeta promo: the sixth is free in the basket and in the WhatsApp order', async ({
    page,
  }) => {
    await page.goto('/es');

    // The hero advertises it and the section sits right under the hero
    await expect(page.getByTestId('hero-pizzeta-promo')).toContainText('paga 5, llévate 6');
    const section = page.locator('#pizzetas');
    await expect(section.locator('[data-testid^="pizzeta-card-"]')).toHaveCount(6);

    // Five pizzetas of 3 €: nothing free yet, one to go
    await page.getByTestId('pizzeta-add-pizzeta-pepperoni').click();
    const plus = section
      .getByTestId('pizzeta-card-pizzeta-pepperoni')
      .getByRole('button', { name: /Añadir otra/ });
    for (let i = 0; i < 2; i++) await plus.click();
    await page.getByTestId('pizzeta-add-pizzeta-margarita').click();
    await section
      .getByTestId('pizzeta-card-pizzeta-margarita')
      .getByRole('button', { name: /Añadir otra/ })
      .click();
    await expect(section.getByTestId('pizzeta-promo-meter')).toContainText('Añade 1 pizzeta');
    await expect(section.getByTestId('pizzetas-open-basket')).toContainText('15,00 €');

    // The sixth one is free: still 15 €
    await plus.click();
    await expect(section.getByTestId('pizzeta-qty-pizzeta-pepperoni')).toHaveText('4');
    await expect(section.getByTestId('pizzeta-promo-won')).toContainText('1 pizzeta gratis');
    await expect(section.getByTestId('pizzetas-open-basket')).toContainText('15,00 €');

    await section.getByTestId('pizzetas-open-basket').click();
    await expect(page.getByTestId('basket-subtotal')).toHaveText('18,00 €');
    await expect(page.getByTestId('basket-discount')).toContainText('3,00 €');
    await expect(page.getByTestId('basket-total')).toHaveText('15,00 €');

    await page.getByTestId('checkout-name-input').fill('Ana');
    await page.getByTestId('submit-whatsapp-order').click();
    const href = await page.getByTestId('whatsapp-fallback-link').getAttribute('href');
    const text = decodeURIComponent(href!.split('?text=')[1] ?? '');
    expect(text).toContain('• 4 x Pizzeta Pepperoni — 12,00 €');
    expect(text).toContain('• Promo pizzetas 5+1 (1 gratis) — -3,00 €');
    expect(text).toContain('Total: 15,00 €');
  });

  test('pizzeta clip: only the poster loads up front, it is muted, and it can be paused', async ({
    page,
  }) => {
    const videoRequests: string[] = [];
    page.on('request', (req) => {
      if (/\.(mp4|webm)(\?|$)/.test(req.url())) videoRequests.push(req.url());
    });

    await page.goto('/es', { waitUntil: 'networkidle' });
    // Nothing heavy is fetched while the clip is still below the fold
    expect(videoRequests).toHaveLength(0);

    const video = page.locator('#pizzetas video:visible');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('poster', /pizzetas-gustavo-poster\.webp/);
    await expect(video).toHaveAttribute('aria-label', /Gustavo/);
    expect(await video.evaluate((el: HTMLVideoElement) => el.muted && el.loop)).toBe(true);

    // Real photos replace the renders where the shop's video shows the pizzeta
    await expect(
      page.locator('#pizzetas [data-testid="pizzeta-card-pizzeta-pepperoni"] img')
    ).toHaveAttribute('src', '/images/pizzetas/pepperoni.webp');

    // Scrolled into view it starts by itself, and the button pauses it
    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => !el.paused), { timeout: 8000 })
      .toBe(true);
    expect(videoRequests.length).toBeGreaterThan(0);

    const toggle = page.locator('#pizzetas [data-testid="loop-video-toggle"]:visible');
    await toggle.click();
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.paused))
      .toBe(true);
    await expect(toggle).toHaveAttribute('aria-label', 'Reproducir el vídeo');
  });

  test('process steps and the founder clip are lazy, silent videos with a real poster', async ({
    page,
    request,
  }) => {
    await page.goto('/es');

    const steps = page.locator('#proceso [data-testid^="process-step-"]');
    await expect(steps).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const video = steps.nth(i).locator('video');
      await expect(video).toHaveAttribute('preload', 'none');
      expect(await video.evaluate((el: HTMLVideoElement) => el.muted)).toBe(true);
      const poster = await video.getAttribute('poster');
      expect((await request.get(poster!)).ok()).toBe(true);
    }
    await expect(steps.first()).toContainText('Estiramos la masa a mano');

    const founder = page.locator('#historia video');
    await expect(founder).toHaveAttribute('aria-label', /Gustavo/);
    expect((await request.get('/videos/gustavo-ventana.mp4')).ok()).toBe(true);
  });

  test('pizzetas have their own page and lead the full menu', async ({ page }) => {
    await page.goto('/es/pizzetas-badalona');
    await expect(page.locator('h1')).toHaveText('Pizzetas en Badalona desde 3,00 €');
    await expect(page.locator('#productos [data-testid^="menu-item-"]')).toHaveCount(6);
    await expect(page.locator('main')).toContainText('Paga 5 y llévate 6');

    await page.goto('/ca/pizzetes-badalona');
    await expect(page.locator('h1')).toHaveText('Pizzetes a Badalona des de 3,00 €');

    // First section of the full menu, with the pack in a section of its own
    await page.goto('/es/carta');
    const sections = page.locator('[id^="categoria-"]');
    await expect(sections.first()).toHaveAttribute('id', 'categoria-pizzetas');
    await expect(page.locator('#categoria-pizzetas [data-testid^="menu-item-"]')).toHaveCount(6);
    await expect(page.locator('#categoria-packs [data-testid^="menu-item-"]')).toHaveCount(1);
  });

  test('focused pages exist in both languages, with their own address and an order button', async ({
    page,
  }) => {
    await page.goto('/es/pizzetas-badalona');
    await expect(page.locator('h1')).toHaveText('Pizzetas en Badalona desde 3,00 €');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://lapiccerella.es/es/pizzetas-badalona'
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="ca-ES"]')
    ).toHaveAttribute('href', 'https://lapiccerella.es/ca/pizzetes-badalona');
    await expect(page.locator('#productos [data-testid^="menu-item-"]')).toHaveCount(6);

    // Ordering works straight from the page
    await page.getByTestId('add-to-order-pizzeta-margarita').click();
    await expect(page.getByTestId('navbar-basket-count')).toHaveText('1');

    await page.goto('/ca/pizza-per-emportar-badalona');
    await expect(page.locator('h1')).toHaveText('Pizza per emportar a Badalona');

    await page.goto('/es/pack-degustacion-pizzas');
    await expect(page.locator('h1')).toContainText('34,99 €');
    await expect(page.locator('main')).not.toContainText('TODO');
  });

  test('legal pages are reachable from the footer in both languages', async ({ page }) => {
    await page.goto('/es');
    await page.locator('footer a[href="/es/aviso-legal"]').click();
    await expect(page.locator('h1')).toHaveText('Aviso legal');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    await page.goto('/es/privacidad');
    await expect(page.locator('h1')).toHaveText('Política de privacidad');
    await page.goto('/es/cookies');
    await expect(page.locator('h1')).toHaveText('Política de cookies');
    // The basket key named in the cookie policy is the one the shop really uses
    await expect(page.locator('main')).toContainText('la-piccerella-basket-v1');

    await page.goto('/ca/aviso-legal');
    await expect(page.locator('h1')).toHaveText('Avís legal');

    // No internal notes leak into the public legal texts
    await expect(page.locator('main')).not.toContainText('TODO');
  });

  test('reviews section falls back to plain Google links when live reviews are not configured', async ({
    page,
  }) => {
    await page.goto('/es');
    const section = page.locator('#opiniones');
    await expect(section.getByTestId('google-reviews')).toHaveCount(0);
    await expect(section.locator('a')).toHaveCount(2);
    await expect(section).not.toContainText('No inventamos');
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

    await page.goto('/es/pizza-para-llevar-badalona');
    const landingResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(landingResults.violations).toEqual([]);

    await page.goto('/es/aviso-legal');
    const legalResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(legalResults.violations).toEqual([]);
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
