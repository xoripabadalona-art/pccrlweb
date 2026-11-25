'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getLargePizzas,
  getMenuItem3dImage,
  getMenuItemPhoto,
  getMenuItemRealPhoto,
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

export function MenuItemCard({ item, locale }: { item: MenuItem; locale: Locale }) {
  const copy = getCopy(locale);
  const ca = locale === 'ca';
  const addItem = useBasketStore((s) => s.addItem);

  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(
    item.sizes?.[0]?.id
  );
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // 3-Pizza selector for Pack Degustación Familiar
  const isFamilyPack = item.id === 'pack-degustacion-familiar';
  const largePizzas = useMemo(() => (isFamilyPack ? getLargePizzas() : []), [isFamilyPack]);
  const [packPizzas, setPackPizzas] = useState<[string, string, string]>([
    'pizza-pepperoni',
    'pizza-margarita',
    'pizza-barbacoa',
  ]);

  const activeSize = item.sizes?.find((s) => s.id === selectedSizeId) ?? item.sizes?.[0];
  const displayPriceCents = activeSize ? activeSize.priceCents : item.priceCents;

  const handleAdd = () => {
    addItem(item.id, activeSize?.id, qty, {
      ...(isFamilyPack ? { packPizzas } : {}),
    });
    setJustAdded(true);
    setQty(1);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  // A real photo of the dish wins over the 3D render, which wins over a product shot
  const realPhoto = getMenuItemRealPhoto(item);
  const image3d = realPhoto ? undefined : getMenuItem3dImage(item);
  const photo = realPhoto || image3d ? undefined : getMenuItemPhoto(item);
  const hasVisual = Boolean(realPhoto || image3d || photo);
  const altText = `${item.name[locale]} — ${item.ingredients[locale]}`;

  return (
    <li
      id={`menu-item-${item.id}`}
      data-testid={`menu-item-${item.id}`}
      className="pizza-card card-surface flex flex-col justify-between rounded-[24px] border border-[#1A1512]/10 bg-[#FAF5ED] p-5 text-[#1A1512] shadow-sm transition-shadow hover:shadow-md"
    >
      <div>
        {realPhoto && (
          <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#1F1813]">
            <img
              src={realPhoto}
              alt={altText}
              width={640}
              height={512}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
              {item.vegetarian && (
                <Badge variant="basil">{copy.menuSection.vegetarianBadge}</Badge>
              )}
            </div>
            <div className="absolute right-2.5 bottom-2.5 rounded-full bg-[#F9F4EC] px-3.5 py-1 text-sm font-bold text-[#14110F]">
              {formatCents(displayPriceCents)}
            </div>
          </div>
        )}

        {image3d && (
          <div className="pizza-card-visual relative mb-4 aspect-[16/10] w-full rounded-2xl bg-[radial-gradient(ellipse_at_50%_38%,#3A2A1F_0%,#1F1813_55%,#14110F_100%)]">
            {/* Soft pool of light + contact shadow under the floating pizza */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[16%] top-[10%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(241,178,74,0.22)_0%,transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[18%] bottom-[9%] h-[16%] rounded-[50%] bg-black/70 blur-lg"
            />
            <img
              src={image3d}
              alt={altText}
              width={640}
              height={400}
              loading="lazy"
              decoding="async"
              className="relative h-full w-full scale-[1.16] object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.55)]"
            />
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
              {item.vegetarian && (
                <Badge variant="basil">{copy.menuSection.vegetarianBadge}</Badge>
              )}
              {item.category === 'pizzas' && (
                <span className="rounded-full bg-[#F1B24A] px-2.5 py-0.5 text-[11px] font-extrabold text-[#14110F] shadow-xs">
                  ★ +1 Sticker
                </span>
              )}
            </div>
            <div className="absolute right-2.5 bottom-2.5 rounded-full bg-[#F9F4EC] px-3.5 py-1 text-sm font-bold text-[#14110F]">
              {formatCents(displayPriceCents)}
            </div>
          </div>
        )}

        {photo && (
          <div className="relative mb-4 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_50%,#FAF5ED_0%,#E9DFD1_100%)] p-3">
            <img
              src={photo}
              alt={altText}
              width={480}
              height={300}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute right-2.5 bottom-2.5 rounded-full bg-[#14110F]/90 px-3.5 py-1 text-sm font-bold text-[#F9F4EC] shadow-sm">
              {formatCents(displayPriceCents)}
            </div>
          </div>
        )}

        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-serif-heading text-xl font-bold text-[#1A1512]">
            {item.name[locale]}
          </h3>
          {!hasVisual && (
            <span className="shrink-0 rounded-full bg-[#14110F] px-3.5 py-1 text-sm font-bold text-[#F9F4EC]">
              {formatCents(displayPriceCents)}
            </span>
          )}
        </div>

        {!hasVisual && item.vegetarian && (
          <div className="mb-2">
            <Badge variant="basil">{copy.menuSection.vegetarianBadge}</Badge>
          </div>
        )}

        <p className="mb-3 text-sm leading-relaxed text-[#574B42]">
          {item.ingredients[locale]}
        </p>

        {item.allergens[locale].length > 0 && (
          <p className="mb-3 text-xs text-[#574B42]">
            <strong className="font-semibold text-[#1A1512]">
              {copy.menuSection.allergensLabel}
            </strong>{' '}
            {item.allergens[locale].join(', ')}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3 border-t border-[#1A1512]/10 pt-3.5">
        {/* Interactive 3-Pizza selector for Pack Degustación Familiar */}
        {isFamilyPack && largePizzas.length > 0 && (
          <div
            data-testid="family-pack-selector"
            className="rounded-2xl border border-[#1A1512]/12 bg-[#F4EBDD] p-3"
          >
            <p className="mb-2 text-xs font-extrabold tracking-wide text-[#A8241B] uppercase">
              {ca ? '🍕 Tria les teves 3 pizzes grans:' : '🍕 Elige tus 3 pizzas grandes:'}
            </p>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((slotIdx) => (
                <label
                  key={slotIdx}
                  className="flex items-center justify-between gap-2 text-xs font-bold text-[#1A1512]"
                >
                  <span className="shrink-0 rounded-full bg-[#14110F] px-2.5 py-1 text-[11px] font-extrabold text-[#F1B24A]">
                    Pizza {slotIdx + 1}
                  </span>
                  <select
                    value={packPizzas[slotIdx]}
                    aria-label={`Pizza ${slotIdx + 1}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPackPizzas((prev) => {
                        const next: [string, string, string] = [...prev] as [string, string, string];
                        next[slotIdx] = val;
                        return next;
                      });
                    }}
                    className="min-h-[36px] flex-1 cursor-pointer rounded-xl border border-[#1A1512]/20 bg-[#FAF5ED] px-2.5 py-1 text-xs font-bold text-[#1A1512] focus:border-[#EE6A2B] focus:outline-none"
                  >
                    {largePizzas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name[locale].replace(/^Pizza\s+/i, '')}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        )}

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

export function StickerLoyaltyBanner({ locale }: { locale: Locale }) {
  const ca = locale === 'ca';
  return (
    <div
      data-testid="sticker-loyalty-banner"
      className="mb-8 flex flex-col justify-between gap-4 rounded-[22px] border border-[#F1B24A]/35 bg-[#14110F] p-5 text-[#F9F4EC] shadow-md sm:flex-row sm:items-center md:px-7"
    >
      <div>
        <span className="inline-block rounded-full bg-[#F1B24A]/18 px-3 py-0.5 text-[11px] font-extrabold tracking-wider text-[#F1B24A] uppercase">
          {ca ? 'Targeta de Fidelitat · Pizzes Grans' : 'Tarjeta de Fidelidad · Pizzas Grandes'}
        </span>
        <h4 className="font-serif-heading mt-1.5 text-lg font-extrabold text-[#F9F4EC] md:text-xl">
          {ca
            ? '1 Pizza Gran = 1 Sticker · Amb 5 Stickers tens 1 Pizza Gratis!'
            : '1 Pizza Grande = 1 Sticker · ¡Con 5 Stickers tienes 1 Pizza Gratis!'}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-[#CBBBA8] md:text-sm">
          {ca
            ? 'Demana la teva targeta al nostre local del Carrer de Mar, 127 en recollir cada pizza gran.'
            : 'Pide tu tarjeta en nuestro local de Carrer de Mar, 127 al recoger cada pizza grande.'}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="flex shrink-0 items-center gap-1.5 self-start sm:self-center"
      >
        {[1, 2, 3, 4].map((num) => (
          <span
            key={num}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[#F1B24A]/60 bg-[#1F1813] text-xs font-extrabold text-[#F1B24A]"
          >
            ★ {num}
          </span>
        ))}
        <span className="flex h-10 items-center justify-center rounded-full bg-[#F1B24A] px-3.5 text-xs font-extrabold text-[#14110F] shadow-[0_4px_14px_rgba(241,178,74,0.4)]">
          5 = 🍕 GRATIS
        </span>
      </div>
    </div>
  );
}

export function Menu({ locale, showFullPageLink = true }: MenuSectionProps) {
  const copy = getCopy(locale);
  const ca = locale === 'ca';
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVegetarian, setOnlyVegetarian] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();

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
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
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
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#A8241B] underline underline-offset-4 hover:text-[#1A1512]"
              >
                {copy.menuSection.viewFullPageLink} →
              </Link>
            </div>
          )}
        </div>

        {/* Instant Search & Quick Dietary Filter Bar */}
        <div className="mx-auto mb-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                ca
                  ? 'Cerca pizza o ingredient (ex. pepperoni, cabra, barbacoa, xampinyons...)'
                  : 'Buscar pizza o ingrediente (ej. pepperoni, cabra, barbacoa, champiñones...)'
              }
              aria-label={
                ca ? 'Cerca pizza o ingredient' : 'Buscar pizza o ingrediente'
              }
              data-testid="menu-search-input"
              className="min-h-[46px] w-full rounded-full border border-[#1A1512]/15 bg-[#FAF5ED] px-5 py-2.5 text-sm font-medium text-[#1A1512] placeholder:text-[#574B42]/75 focus:border-[#EE6A2B] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={ca ? 'Esborrar cerca' : 'Limpiar búsqueda'}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer rounded-full bg-[#E5D7C3] px-2.5 py-0.5 text-xs font-bold text-[#1A1512]"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOnlyVegetarian((v) => !v)}
            aria-pressed={onlyVegetarian}
            data-testid="menu-filter-vegetarian"
            className={`min-h-[46px] shrink-0 cursor-pointer rounded-full border px-5 py-2.5 text-xs font-extrabold transition-colors ${
              onlyVegetarian
                ? 'border-[#2F5A2B] bg-[#2F5A2B] text-[#F9F4EC]'
                : 'border-[#1A1512]/15 bg-[#FAF5ED] text-[#1A1512] hover:bg-[#E5D7C3]'
            }`}
          >
            🌱 {ca ? 'Vegetarianes' : 'Vegetarianas'}
          </button>
        </div>

        {/* Sticky Category Tabs */}
        <div className="sticky top-[62px] z-20 -mx-4 mb-10 border-b border-[#1A1512]/10 bg-[#F4EBDD]/95 px-4 py-2.5 backdrop-blur-md md:top-[68px] md:mx-0 md:mb-12 md:rounded-full md:border md:px-6 md:py-3">
          <div
            role="tablist"
            aria-label={copy.menuSection.eyebrow}
            className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-0.5 md:justify-center md:pb-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={(e) => {
                setActiveCategory('all');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }}
              className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors cursor-pointer sm:px-5 ${
                activeCategory === 'all'
                  ? 'bg-[#14110F] text-[#F9F4EC]'
                  : 'bg-[#E5D7C3] text-[#1A1512] hover:bg-[#D5C3AA]'
              }`}
            >
              {ca ? 'Tota la carta' : 'Toda la carta'}
            </button>
            {menuCategories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    setActiveCategory(cat.id);
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                  data-testid={`menu-tab-${cat.id}`}
                  className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors cursor-pointer sm:px-5 ${
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
        <div className="flex flex-col gap-12 md:gap-16">
          {visibleCategories.map((category) => {
            const itemsInCategory = menuItems.filter((item) => {
              if (item.category !== category.id) return false;
              if (onlyVegetarian && !item.vegetarian) return false;
              if (normalizedQuery) {
                const hay = `${item.name[locale]} ${item.ingredients[locale]}`.toLowerCase();
                if (!hay.includes(normalizedQuery)) return false;
              }
              return true;
            });

            if (itemsInCategory.length === 0 && (normalizedQuery || onlyVegetarian)) {
              return null;
            }

            return (
              <div key={category.id} id={`categoria-${category.id}`} className="menu-category-block">
                <div className="mb-6 border-b border-[#1A1512]/15 pb-3">
                  <h3 className="font-serif-heading text-2xl font-bold text-[#1A1512] md:text-3xl">
                    {category.label[locale]}
                  </h3>
                  <p className="mt-1 text-sm text-[#574B42]">
                    {category.description[locale]}
                  </p>
                </div>

                {category.id === 'pizzas' && <StickerLoyaltyBanner locale={locale} />}

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
