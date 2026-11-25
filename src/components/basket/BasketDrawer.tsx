'use client';

import React, { useEffect, useState } from 'react';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { getOpenStatus, type OpenStatus } from '@/lib/hours';
import { getEnrichedBasket, useBasketStore } from '@/store/basket';
import { Drawer } from '@/components/ui/Drawer';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { CheckoutForm } from './CheckoutForm';
import { PromoMeter } from './PromoMeter';

export interface BasketDrawerProps {
  locale: Locale;
}

export function BasketDrawer({ locale }: BasketDrawerProps) {
  const copy = getCopy(locale);
  const items = useBasketStore((s) => s.items);
  const isOpen = useBasketStore((s) => s.isOpen);
  const closeDrawer = useBasketStore((s) => s.closeDrawer);
  const addItem = useBasketStore((s) => s.addItem);
  const setItemQty = useBasketStore((s) => s.setItemQty);
  const clearBasket = useBasketStore((s) => s.clearBasket);

  const [mounted, setMounted] = useState(false);
  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    setMounted(true);
    setOpenStatus(getOpenStatus(new Date()));
  }, [isOpen]);

  const { enrichedItems, subtotalCents, promo, totalCents } = getEnrichedBasket(
    mounted ? items : []
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      title={copy.basket.drawerTitle}
      closeLabel={copy.basket.closeLabel}
    >
      {/* Closed-state informational banner (Section 7) */}
      {openStatus && !openStatus.isOpen && (
        <div
          role="status"
          data-testid="closed-restaurant-banner"
          className="mb-4 rounded-2xl border border-[#EE6A2B]/40 bg-[#14110F] px-4 py-3 text-xs leading-relaxed text-[#F9F4EC]"
        >
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#EE6A2B]" />
          {copy.basket.closedBannerPrefix}
          <strong>{openStatus.nextOpening?.open ?? '18:00'}</strong>
          {copy.basket.closedBannerSuffix}
        </div>
      )}

      {enrichedItems.length === 0 ? (
        <div
          data-testid="basket-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="font-serif-heading mb-2 text-xl font-bold text-[#1A1512]">
            {copy.basket.emptyTitle}
          </p>
          <p className="mb-6 max-w-xs text-sm text-[#574B42]">
            {copy.basket.emptyBody}
          </p>
          <Button
            variant="primary"
            onClick={() => {
              closeDrawer();
              const cartaEl = document.getElementById('carta');
              cartaEl?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {copy.basket.browseMenuCta}
          </Button>
        </div>
      ) : (
        <div>
          {/* Basket line items */}
          <ul className="divide-y divide-[#1A1512]/12" data-testid="basket-line-items">
            {enrichedItems.map((line) => {
              return (
                <li
                  key={line.lineKey}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={line.image}
                      alt={line.name[locale]}
                      width={52}
                      height={52}
                      className="h-13 w-13 shrink-0 rounded-xl bg-[#E5D7C3] object-contain p-1"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#1A1512]">
                        {line.name[locale]}
                      </p>
                      {line.sizeLabel && (
                        <p className="text-xs leading-snug text-[#574B42]">
                          {line.sizeLabel[locale]}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-semibold text-[#A8241B]">
                        {formatCents(line.lineTotalCents)}
                      </p>
                    </div>
                  </div>

                  <QuantityStepper
                    value={line.qty}
                    onChange={(nextQty) =>
                      setItemQty(line.id, line.size, nextQty, line.lineKey)
                    }
                    itemName={line.name[locale]}
                    locale={locale}
                    variant="cream"
                  />
                </li>
              );
            })}
          </ul>

          {/* Pizzeta promo: progress, or the free ones already earned */}
          <PromoMeter locale={locale} promo={promo} className="mt-4" />

          {/* Live 5-Sticker Loyalty Meter in Basket */}
          {(() => {
            const stickersEarned = enrichedItems.reduce((sum, item) => {
              if (item.id === 'pack-degustacion-familiar') return sum + item.qty * 3;
              if (item.id.startsWith('pizza-')) return sum + item.qty;
              return sum;
            }, 0);
            if (stickersEarned <= 0) return null;
            const freePizzasFromStickers = Math.floor(stickersEarned / 5);
            const filledSlots = stickersEarned % 5 === 0 ? 5 : stickersEarned % 5;
            const missingForNext = 5 - (stickersEarned % 5);
            return (
              <div
                data-testid="basket-sticker-meter"
                className="mt-3 rounded-2xl border border-[#F1B24A]/45 bg-[#14110F] px-3.5 py-2.5 text-[#F9F4EC]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-[#F1B24A]">
                    {locale === 'ca'
                      ? `★ En aquesta comanda guanyes +${stickersEarned} ${
                          stickersEarned === 1 ? 'Sticker' : 'Stickers'
                        }`
                      : `★ En este pedido te llevas +${stickersEarned} ${
                          stickersEarned === 1 ? 'Sticker' : 'Stickers'
                        }`}
                  </p>
                  <div className="flex items-center gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((slot) => (
                      <span
                        key={slot}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                          slot <= filledSlots
                            ? 'bg-[#F1B24A] text-[#14110F]'
                            : 'border border-[#F9F4EC]/25 text-[#CBBBA8]'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-[#CBBBA8]">
                  {freePizzasFromStickers > 0
                    ? locale === 'ca'
                      ? `Completes ${freePizzasFromStickers * 5} Stickers = ${freePizzasFromStickers} Pizza Gran GRATIS!`
                      : `¡Completas ${freePizzasFromStickers * 5} Stickers = ${freePizzasFromStickers} Pizza Grande GRATIS!`
                    : locale === 'ca'
                      ? `Amb ${missingForNext} ${missingForNext === 1 ? 'Sticker més' : 'Stickers més'} a la teva targeta tens 1 Pizza Gran GRATIS.`
                      : `Con ${missingForNext} ${missingForNext === 1 ? 'Sticker más' : 'Stickers más'} en tu tarjeta tienes 1 Pizza Grande GRATIS.`}
                </p>
              </div>
            );
          })()}

          {/* 1-Click 6th Pizzeta Promo Completion */}
          {promo.next && promo.next.missing <= 2 && (
            <div
              data-testid="basket-promo-quick-add"
              className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#EE6A2B]/35 bg-[#FAF5ED] px-3 py-2"
            >
              <span className="text-[11px] font-bold text-[#1A1512]">
                {locale === 'ca' ? 'Afegeix 1 clic:' : 'Añade en 1 clic:'}
              </span>
              {(promo.next.priceCents === 300
                ? [
                    { id: 'pizzeta-margarita', label: '+ Margarita (3 €)' },
                    { id: 'pizzeta-pepperoni', label: '+ Pepperoni (3 €)' },
                  ]
                : [
                    { id: 'pizzeta-barbacoa', label: '+ Barbacoa (5 €)' },
                    { id: 'pizzeta-4-quesos', label: '+ 4 Quesos (5 €)' },
                  ]
              ).map((quick) => (
                <button
                  key={quick.id}
                  type="button"
                  onClick={() => addItem(quick.id, undefined, 1)}
                  className="rounded-full bg-[#EE6A2B] px-2.5 py-1 text-[11px] font-extrabold text-[#14110F] hover:bg-[#F37D44] cursor-pointer"
                >
                  {quick.label}
                </button>
              ))}
            </div>
          )}

          {/* 1-Click Cold Drink Cross-Sell when no drinks are in basket */}
          {!enrichedItems.some(
            (item) => item.id.startsWith('bebida-') || item.id.startsWith('cerveza-')
          ) && (
            <div
              data-testid="basket-drink-cross-sell"
              className="mt-3 rounded-2xl border border-[#1A1512]/12 bg-[#FAF5ED] p-3"
            >
              <p className="mb-2 text-xs font-extrabold text-[#1A1512]">
                {locale === 'ca'
                  ? '🧊 Acompanyem amb beguda ben freda?'
                  : '🧊 ¿Acompañamos con bebida bien fría?'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'bebida-coca-cola', label: '+ Coca-Cola (2,00 €)' },
                  { id: 'bebida-coca-cola-zero', label: '+ Coca-Cola Zero (2,00 €)' },
                  { id: 'cerveza-estrella-lata', label: '+ Estrella Galicia (2,00 €)' },
                  { id: 'bebida-agua-sin-gas', label: '+ Agua (1,50 €)' },
                ].map((drink) => (
                  <button
                    key={drink.id}
                    type="button"
                    onClick={() => addItem(drink.id, undefined, 1)}
                    className="rounded-full border border-[#1A1512]/15 bg-[#E5D7C3]/75 px-2.5 py-1 text-[11px] font-bold text-[#1A1512] transition-colors hover:border-[#EE6A2B] hover:bg-[#EE6A2B] hover:text-[#14110F] cursor-pointer"
                  >
                    {drink.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Total row & clear basket */}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#E5D7C3]/75 px-4 py-3.5">
            <div>
              {promo.discountCents > 0 && (
                <dl className="mb-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-xs text-[#574B42]">
                  <dt>Subtotal</dt>
                  <dd className="text-right font-semibold" data-testid="basket-subtotal">
                    {formatCents(subtotalCents)}
                  </dd>
                  <dt>{locale === 'ca' ? 'Promo pizzetes 5+1' : 'Promo pizzetas 5+1'}</dt>
                  <dd
                    className="text-right font-bold text-[#2F5A2B]"
                    data-testid="basket-discount"
                  >
                    −{formatCents(promo.discountCents)}
                  </dd>
                </dl>
              )}
              <p className="text-xs font-semibold tracking-wider text-[#574B42] uppercase">
                {copy.basket.totalLabel}
              </p>
              <p
                data-testid="basket-total"
                className="font-serif-heading text-2xl font-bold text-[#1A1512]"
              >
                {formatCents(totalCents)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearBasket}
              className="min-h-[44px] px-3 text-xs font-semibold text-[#A8241B] underline underline-offset-4 hover:text-[#1A1512] cursor-pointer"
            >
              {copy.basket.clearBasket}
            </button>
          </div>

          {/* Checkout form inside the drawer */}
          <CheckoutForm locale={locale} enrichedItems={enrichedItems} />
        </div>
      )}
    </Drawer>
  );
}
