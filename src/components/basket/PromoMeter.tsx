import React from 'react';
import type { Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { PIZZETA_PROMO, type PizzetaPromo } from '@/lib/promo';

export interface PromoMeterProps {
  locale: Locale;
  promo: PizzetaPromo;
  /** Colours for a light (basket) or a dark/red (home section) background */
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * Progress towards the next free pizzeta: six pips, the sixth one being the
 * free one. Says in words what is missing, or what has already been won.
 */
export function PromoMeter({ locale, promo, tone = 'light', className = '' }: PromoMeterProps) {
  if (promo.pizzetaCount === 0) return null;

  const ca = locale === 'ca';
  const filled = promo.next ? PIZZETA_PROMO.get - promo.next.missing : PIZZETA_PROMO.get;
  const dark = tone === 'dark';

  let message: string;
  if (promo.next) {
    const price = formatCents(promo.next.priceCents);
    if (promo.next.missing === 1) {
      message = ca
        ? `Afegeix 1 pizzeta de ${price} més: et surt gratis.`
        : `Añade 1 pizzeta de ${price} más: te sale gratis.`;
    } else {
      message = ca
        ? `Et falten ${promo.next.missing} pizzetes de ${price} perquè una et surti gratis.`
        : `Te faltan ${promo.next.missing} pizzetas de ${price} para que una te salga gratis.`;
    }
  } else {
    message = ca ? 'Promo completa.' : 'Promo completa.';
  }

  const won =
    promo.freeCount > 0
      ? ca
        ? `${promo.freeCount} ${promo.freeCount === 1 ? 'pizzeta gratis' : 'pizzetes gratis'}: −${formatCents(promo.discountCents)}`
        : `${promo.freeCount} ${promo.freeCount === 1 ? 'pizzeta gratis' : 'pizzetas gratis'}: −${formatCents(promo.discountCents)}`
      : null;

  return (
    <div
      role="status"
      data-testid="pizzeta-promo-meter"
      className={`rounded-2xl px-4 py-3 ${
        dark
          ? 'bg-[#14110F]/35 text-[#F9F4EC]'
          : 'border border-[#A8241B]/25 bg-[#FAF5ED] text-[#1A1512]'
      } ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold tracking-wider uppercase">
          {ca ? 'Promo pizzetes · paga’n 5, emporta-te’n 6' : 'Promo pizzetas · paga 5, llévate 6'}
        </p>
        <ol aria-hidden="true" className="flex shrink-0 items-center gap-1">
          {Array.from({ length: PIZZETA_PROMO.get }, (_, i) => {
            const isFree = i === PIZZETA_PROMO.get - 1;
            const on = i < filled;
            return (
              <li
                key={i}
                className={`h-2.5 rounded-full transition-colors ${isFree ? 'w-5' : 'w-2.5'} ${
                  on
                    ? isFree
                      ? 'bg-[#3F6B3A]'
                      : dark
                        ? 'bg-[#F1B24A]'
                        : 'bg-[#A8241B]'
                    : dark
                      ? 'bg-[#F9F4EC]/25'
                      : 'bg-[#1A1512]/15'
                }`}
              />
            );
          })}
        </ol>
      </div>
      {won && (
        <p
          data-testid="pizzeta-promo-won"
          className={`mt-1.5 text-sm font-extrabold ${dark ? 'text-[#F1B24A]' : 'text-[#2F5A2B]'}`}
        >
          {won}
        </p>
      )}
      <p className={`mt-1 text-sm ${dark ? 'text-[#F9F4EC]' : 'text-[#3A312B]'}`}>{message}</p>
    </div>
  );
}
