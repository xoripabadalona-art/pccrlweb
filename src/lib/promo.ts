/**
 * Pizzeta promotion: pay 5, take 6.
 *
 * Rules, as confirmed by the shop:
 *  - it applies to every pizzeta, however it was added to the order;
 *  - the six must be of the same price (six at 3 €, or six at 5 €) — the two
 *    price tiers are counted separately, never mixed;
 *  - it repeats: 12 of a tier means two free, and so on;
 *  - it is valid for orders sent by WhatsApp too.
 *
 * Pure functions on integer cents, so the basket, the WhatsApp message and the
 * tests all compute exactly the same figure.
 */

export const PIZZETA_PROMO = {
  /** Pizzetas you pay for in each group */
  pay: 5,
  /** Pizzetas you take home in each group */
  get: 6,
} as const;

export interface PromoLine {
  id: string;
  size?: string;
  qty: number;
  unitPriceCents: number;
}

export interface PizzetaPromo {
  /** Pizzetas in the order, all tiers together */
  pizzetaCount: number;
  /** Pizzetas that come free */
  freeCount: number;
  /** Amount taken off the order, in cents */
  discountCents: number;
  /**
   * The nearest free pizzeta still to be earned: how many more of which price.
   * Null when there are no pizzetas, or every tier sits exactly on a full group.
   */
  next: { missing: number; priceCents: number } | null;
}

/** A pizzeta is either an item of the pizzetas range or a whole pizza ordered in its pizzeta size */
export function isPizzetaLine(line: { id: string; size?: string }) {
  return line.id.startsWith('pizzeta-') || line.size === 'pizzeta';
}

export function computePizzetaPromo(lines: PromoLine[]): PizzetaPromo {
  const perTier = new Map<number, number>();
  for (const line of lines) {
    if (line.qty <= 0 || !isPizzetaLine(line)) continue;
    perTier.set(line.unitPriceCents, (perTier.get(line.unitPriceCents) ?? 0) + line.qty);
  }

  let pizzetaCount = 0;
  let freeCount = 0;
  let discountCents = 0;
  let next: PizzetaPromo['next'] = null;
  let bestProgress = 0;

  for (const [priceCents, qty] of perTier) {
    pizzetaCount += qty;
    const free = Math.floor(qty / PIZZETA_PROMO.get);
    freeCount += free;
    discountCents += free * priceCents;

    // Closest tier to its next free one wins; on a tie, the cheaper tier
    const progress = qty % PIZZETA_PROMO.get;
    if (
      progress > bestProgress ||
      (progress === bestProgress && progress > 0 && next !== null && priceCents < next.priceCents)
    ) {
      bestProgress = progress;
      next = { missing: PIZZETA_PROMO.get - progress, priceCents };
    }
  }

  return { pizzetaCount, freeCount, discountCents, next };
}
