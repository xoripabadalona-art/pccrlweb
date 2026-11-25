import { describe, expect, it } from 'vitest';
import { computePizzetaPromo, isPizzetaLine } from '@/lib/promo';
import { getEnrichedBasket } from '@/store/basket';
import { buildWhatsAppOrderMessage } from '@/lib/whatsapp';

const p3 = (qty: number, id = 'pizzeta-pepperoni') => ({ id, qty, unitPriceCents: 300 });
const p5 = (qty: number, id = 'pizzeta-barbacoa') => ({ id, qty, unitPriceCents: 500 });

describe('Pizzeta promo: pay 5, take 6', () => {
  it('recognises pizzetas however they were added', () => {
    expect(isPizzetaLine({ id: 'pizzeta-margarita' })).toBe(true);
    expect(isPizzetaLine({ id: 'pizza-pepperoni', size: 'pizzeta' })).toBe(true);
    expect(isPizzetaLine({ id: 'pizza-pepperoni', size: 'grande' })).toBe(false);
    expect(isPizzetaLine({ id: 'bebida-coca-cola' })).toBe(false);
  });

  it('gives nothing below six, and says how many are missing', () => {
    const promo = computePizzetaPromo([p3(4)]);
    expect(promo.freeCount).toBe(0);
    expect(promo.discountCents).toBe(0);
    expect(promo.next).toEqual({ missing: 2, priceCents: 300 });
  });

  it('makes the sixth one free', () => {
    expect(computePizzetaPromo([p3(5)]).next).toEqual({ missing: 1, priceCents: 300 });

    const promo = computePizzetaPromo([p3(6)]);
    expect(promo.freeCount).toBe(1);
    expect(promo.discountCents).toBe(300);
    expect(promo.next).toBeNull();
  });

  it('adds up different flavours of the same price', () => {
    const promo = computePizzetaPromo([
      p3(3, 'pizzeta-pepperoni'),
      p3(2, 'pizzeta-margarita'),
      { id: 'pizza-pepperoni', size: 'pizzeta', qty: 1, unitPriceCents: 300 },
    ]);
    expect(promo.pizzetaCount).toBe(6);
    expect(promo.freeCount).toBe(1);
    expect(promo.discountCents).toBe(300);
  });

  it('repeats: twelve means two free, thirteen starts a new group', () => {
    expect(computePizzetaPromo([p3(12)]).discountCents).toBe(600);
    const promo = computePizzetaPromo([p3(13)]);
    expect(promo.freeCount).toBe(2);
    expect(promo.next).toEqual({ missing: 5, priceCents: 300 });
  });

  it('never mixes the 3 € and 5 € tiers', () => {
    // 3 + 3 = six pizzetas in total, but no tier reaches six
    const mixed = computePizzetaPromo([p3(3), p5(3)]);
    expect(mixed.pizzetaCount).toBe(6);
    expect(mixed.freeCount).toBe(0);
    expect(mixed.discountCents).toBe(0);

    const both = computePizzetaPromo([p3(6), p5(6)]);
    expect(both.freeCount).toBe(2);
    expect(both.discountCents).toBe(800);

    // points at the tier closest to its free one
    expect(computePizzetaPromo([p3(2), p5(5)]).next).toEqual({ missing: 1, priceCents: 500 });
  });

  it('ignores everything that is not a pizzeta', () => {
    const promo = computePizzetaPromo([
      { id: 'pizza-pepperoni', size: 'grande', qty: 6, unitPriceCents: 1200 },
      { id: 'bebida-coca-cola', qty: 6, unitPriceCents: 200 },
    ]);
    expect(promo.pizzetaCount).toBe(0);
    expect(promo.discountCents).toBe(0);
    expect(promo.next).toBeNull();
  });

  it('is applied to the basket total', () => {
    const basket = getEnrichedBasket([
      { id: 'pizzeta-pepperoni', qty: 6 },
      { id: 'pizza-margarita', size: 'grande', qty: 1 },
    ]);
    expect(basket.subtotalCents).toBe(6 * 300 + 950);
    expect(basket.promo.discountCents).toBe(300);
    expect(basket.totalCents).toBe(5 * 300 + 950);
    expect(basket.totalCount).toBe(7);
  });

  it('is written into the WhatsApp order so the shop sees the same total', () => {
    const result = buildWhatsAppOrderMessage({
      items: [{ id: 'pizzeta-pepperoni', name: 'Pizzeta Pepperoni', qty: 6, unitPriceCents: 300 }],
      discount: { label: 'Promo pizzetas 5+1 (1 gratis)', cents: 300 },
      customerName: 'Ana',
      deliveryMode: 'pickup',
      preferredTime: '20:30',
      locale: 'es',
    });
    expect(result.totalCents).toBe(1500);
    expect(result.message).toContain('• 6 x Pizzeta Pepperoni — 18,00 €');
    expect(result.message).toContain('• Promo pizzetas 5+1 (1 gratis) — -3,00 €');
    expect(result.message).toContain('Total: 15,00 €');
  });
});
