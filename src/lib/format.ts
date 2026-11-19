/**
 * Formats integer euro cents into Spanish/Catalan currency string: e.g. 2400 -> "24,00 €"
 */
export function formatCents(cents: number): string {
  const safeCents = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  const euros = (safeCents / 100).toFixed(2).replace('.', ',');
  return `${euros} €`;
}
