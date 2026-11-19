'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  menuCategories,
  menuItems,
  type MenuCategoryId,
  type MenuItem,
} from '@/data/menu';
import { getCopy, type Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { useBasketStore } from '@/store/basket';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

export interface MenuSectionProps {
  locale: Locale;
  showFullPageLink?: boolean;
}

function MenuItemCard({ item, locale }: { item: MenuItem; locale: Locale }) {
  const copy = getCopy(locale);
  const addItem = useBasketStore((s) => s.addItem);

  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(
    item.sizes?.[0]?.id
  );
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const activeSize = item.sizes?.find((s) => s.id === selectedSizeId) ?? item.sizes?.[0];
  const displayPriceCents = activeSize ? activeSize.priceCents : item.priceCents;

  const handleAdd = () => {
    addItem(item.id, activeSize?.id, qty);
    setJustAdded(true);
    setQty(1);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <li
      id={`menu-item-${item.id}`}
      data-testid={`menu-item-${item.id}`}
      className="card-surface flex flex-col justify-between rounded-[24px] border border-[#1A1512]/10 bg-[#FAF5ED] p-5 text-[#1A1512] shadow-sm transition-shadow hover:shadow-md"
    >
      <div>
        <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#E5D7C3]">
          <img
            src={item.image}
            alt={`${item.name[locale]} — ${item.ingredients[locale]}`}
            width={480}
            height={300}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {item.vegetarian && (
              <Badge variant="basil">{copy.menuSection.vegetarianBadge}</Badge>
            )}
          </div>
          <div className="absolute right-2.5 bottom-2.5 rounded-full bg-[#14110F]/90 px-3.5 py-1 text-sm font-bold text-[#F9F4EC]">
            {formatCents(displayPriceCents)}
          </div>
        </div>

        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-serif-heading text-xl font-bold text-[#1A1512]">
            {item.name[locale]}
          </h3>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-[#574B42]">
          {item.ingredients[locale]}
        </p>

        {item.allergens[locale].length > 0 && (
          <p className="mb-4 text-xs text-[#574B42]">
            <strong className="font-semibold text-[#1A1512]">
              {copy.menuSection.allergensLabel}
            </strong>{' '}
            {item.allergens[locale].join(', ')}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3 border-t border-[#1A1512]/10 pt-3.5">
        {/* Size / Format selector if available */}
        {item.sizes && item.sizes.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#1A1512]">
              {copy.menuSection.sizeLabel}
            </span>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={copy.menuSection.sizeLabel}>
              {item.sizes.map((sizeOpt) => {
                const isSelected = sizeOpt.id === activeSize?.id;
                return (
                  <button
                    key={sizeOpt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedSizeId(sizeOpt.id)}
                    className={`min-h-[38px] rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#14110F] bg-[#14110F] text-[#F9F4EC]'
                        : 'border-[#1A1512]/20 bg-[#F4EBDD] text-[#1A1512] hover:bg-[#E5D7C3]'
                    }`}
                  >
                    {sizeOpt.label[locale]} · {formatCents(sizeOpt.priceCents)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stepper + Add to order button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <QuantityStepper
            value={qty}
            min={1}
            max={20}
            onChange={setQty}
            itemName={item.name[locale]}
            locale={locale}
            variant="cream"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            className="flex-1"
            data-testid={`add-to-order-${item.id}`}
          >
            {justAdded ? copy.menuSection.addedFeedback : copy.menuSection.addToOrder}
          </Button>
        </div>
      </div>
    </li>
  );
}

export function Menu({ locale, showFullPageLink = true }: MenuSectionProps) {
  const copy = getCopy(locale);
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId | 'all'>('all');

  const visibleCategories =
    activeCategory === 'all'
      ? menuCategories
      : menuCategories.filter((cat) => cat.id === activeCategory);

  return (
    <section
      id="carta"
      data-theme="cream"
      aria-labelledby="menu-section-heading"
      className="bg-[#F4EBDD] py-20 text-[#1A1512] md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#C8372D] uppercase">
            {copy.menuSection.eyebrow}
          </p>
          <h2
            id="menu-section-heading"
            className="font-serif-heading mb-4 text-3xl font-bold md:text-5xl"
          >
            {copy.menuSection.heading}
          </h2>
          <p className="text-base leading-relaxed text-[#574B42]">
            {copy.menuSection.subheading}
          </p>
          {showFullPageLink && (
            <div className="mt-4">
              <Link
                href={`/${locale}/carta`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C8372D] underline underline-offset-4 hover:text-[#1A1512]"
              >
                {copy.menuSection.viewFullPageLink} →
              </Link>
            </div>
          )}
        </div>

        {/* Sticky Category Tabs */}
        <div className="sticky top-[68px] z-20 -mx-4 mb-12 bg-[#F4EBDD]/95 px-4 py-3 backdrop-blur-md md:mx-0 md:rounded-full md:border md:border-[#1A1512]/10 md:px-6">
          <div
            role="tablist"
            aria-label={copy.menuSection.eyebrow}
            className="flex items-center gap-2 overflow-x-auto pb-1 md:justify-center md:pb-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`min-h-[44px] shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#14110F] text-[#F9F4EC]'
                  : 'bg-[#E5D7C3] text-[#1A1512] hover:bg-[#D5C3AA]'
              }`}
            >
              {locale === 'ca' ? 'Tota la carta' : 'Toda la carta'}
            </button>
            {menuCategories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(cat.id)}
                  data-testid={`menu-tab-${cat.id}`}
                  className={`min-h-[44px] shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#14110F] text-[#F9F4EC]'
                      : 'bg-[#E5D7C3] text-[#1A1512] hover:bg-[#D5C3AA]'
                  }`}
                >
                  {cat.label[locale]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Lists rendered as real semantic HTML */}
        <div className="flex flex-col gap-16">
          {visibleCategories.map((category) => {
            const itemsInCategory = menuItems.filter(
              (item) => item.category === category.id
            );
            return (
              <div key={category.id} id={`categoria-${category.id}`}>
                <div className="mb-6 border-b border-[#1A1512]/15 pb-3">
                  <h3 className="font-serif-heading text-2xl font-bold text-[#1A1512] md:text-3xl">
                    {category.label[locale]}
                  </h3>
                  <p className="mt-1 text-sm text-[#574B42]">
                    {category.description[locale]}
                  </p>
                </div>

                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {itemsInCategory.map((item) => (
                    <MenuItemCard key={item.id} item={item} locale={locale} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
