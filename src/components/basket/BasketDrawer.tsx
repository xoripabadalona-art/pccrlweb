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

export interface BasketDrawerProps {
  locale: Locale;
}

export function BasketDrawer({ locale }: BasketDrawerProps) {
  const copy = getCopy(locale);
  const items = useBasketStore((s) => s.items);
  const isOpen = useBasketStore((s) => s.isOpen);
  const closeDrawer = useBasketStore((s) => s.closeDrawer);
  const setItemQty = useBasketStore((s) => s.setItemQty);
  const clearBasket = useBasketStore((s) => s.clearBasket);

  const [mounted, setMounted] = useState(false);
  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    setMounted(true);
    setOpenStatus(getOpenStatus(new Date()));
  }, [isOpen]);

  const { enrichedItems, totalCents } = mounted
    ? getEnrichedBasket(items)
    : { enrichedItems: [], totalCents: 0 };

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
              const key = `${line.id}__${line.size ?? 'default'}`;
              return (
                <li
                  key={key}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={line.image}
                      alt={line.name[locale]}
                      width={52}
                      height={52}
                      className="h-13 w-13 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#1A1512]">
                        {line.name[locale]}
                      </p>
                      {line.sizeLabel && (
                        <p className="text-xs text-[#574B42]">
                          {line.sizeLabel[locale]}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-semibold text-[#C8372D]">
                        {formatCents(line.lineTotalCents)}
                      </p>
                    </div>
                  </div>

                  <QuantityStepper
                    value={line.qty}
                    onChange={(nextQty) => setItemQty(line.id, line.size, nextQty)}
                    itemName={line.name[locale]}
                    locale={locale}
                    variant="cream"
                  />
                </li>
              );
            })}
          </ul>

          {/* Total row & clear basket */}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#E5D7C3]/75 px-4 py-3.5">
            <div>
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
              className="min-h-[44px] px-3 text-xs font-semibold text-[#C8372D] underline underline-offset-4 hover:text-[#1A1512] cursor-pointer"
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
