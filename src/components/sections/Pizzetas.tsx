'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMenuItem3dImage, getMenuItemRealPhoto, getPizzetas, type MenuItem } from '@/data/menu';
import type { Locale } from '@/data/copy';
import { formatCents } from '@/lib/format';
import { PIZZETA_PROMO } from '@/lib/promo';
import { getEnrichedBasket, useBasketStore } from '@/store/basket';
import { PromoMeter } from '@/components/basket/PromoMeter';
import { LoopVideo } from '@/components/ui/LoopVideo';

export interface PizzetasProps {
  locale: Locale;
}

/** "Pizzeta Pepperoni" → "Pepperoni": the section title already says what they are */
function shortName(name: string) {
  return name
    .replace(/^Pizzeta\s+/i, '')
    .replace(/^Porci[oó]n?\s+/i, '')
    .replace(/\s*\(Pizzeta\)\s*$/i, '');
}

function PizzetaCard({ item, locale, qty }: { item: MenuItem; locale: Locale; qty: number }) {
  const addItem = useBasketStore((s) => s.addItem);
  const setItemQty = useBasketStore((s) => s.setItemQty);
  const ca = locale === 'ca';
  const name = shortName(item.name[locale]);
  const photo = getMenuItemRealPhoto(item);
  const image = photo ?? getMenuItem3dImage(item);

  return (
    <li
      data-testid={`pizzeta-card-${item.id}`}
      className="pizza-card flex w-[46vw] max-w-[190px] shrink-0 snap-start flex-col rounded-[22px] bg-[#FAF5ED] p-3 text-[#1A1512] shadow-[0_10px_26px_rgba(0,0,0,0.28)] lg:w-auto lg:max-w-none"
    >
      <div className="pizza-card-visual relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_40%,#3A2A1F_0%,#1F1813_55%,#14110F_100%)]">
        {image && (
          <img
            src={image}
            alt={`${item.name[locale]} — ${item.ingredients[locale]}`}
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            className={
              photo
                ? 'h-full w-full object-cover'
                : 'h-full w-full scale-[1.25] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.55)]'
            }
          />
        )}
        <span className="absolute top-2 right-2 rounded-full bg-[#F1B24A] px-2.5 py-0.5 text-sm font-extrabold text-[#14110F]">
          {formatCents(item.priceCents)}
        </span>
      </div>

      <h3 className="font-serif-heading mt-2.5 text-base leading-tight font-bold">{name}</h3>

      <div className="mt-auto pt-2.5">
        {qty === 0 ? (
          <button
            type="button"
            onClick={() => addItem(item.id, undefined, 1)}
            data-testid={`pizzeta-add-${item.id}`}
            aria-label={
              ca ? `Afegir ${item.name.ca} a la comanda` : `Añadir ${item.name.es} al pedido`
            }
            className="btn-pill inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#EE6A2B] px-3 text-sm font-extrabold text-[#14110F] transition-colors hover:bg-[#F37D44]"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            {ca ? 'Afegir' : 'Añadir'}
          </button>
        ) : (
          <div className="flex min-h-[44px] items-center justify-between rounded-full bg-[#14110F] px-1.5 text-[#F9F4EC]">
            <button
              type="button"
              onClick={() => setItemQty(item.id, undefined, qty - 1)}
              aria-label={ca ? `Treure una ${item.name.ca}` : `Quitar una ${item.name.es}`}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg font-bold hover:bg-[#F9F4EC]/15"
            >
              −
            </button>
            <span
              data-testid={`pizzeta-qty-${item.id}`}
              aria-live="polite"
              className="text-sm font-extrabold"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => addItem(item.id, undefined, 1)}
              aria-label={ca ? `Afegir una altra ${item.name.ca}` : `Añadir otra ${item.name.es}`}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EE6A2B] text-lg font-bold text-[#14110F] hover:bg-[#F37D44]"
            >
              +
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Home-page pizzeta strip: the 3 € best seller and its pay-5-take-6 promo,
 * one tap from the basket. On phones the cards scroll sideways.
 */
export function Pizzetas({ locale }: PizzetasProps) {
  const ca = locale === 'ca';
  const pizzetas = getPizzetas();
  const basketItems = useBasketStore((s) => s.items);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  // The basket lives in the browser: only read it after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { promo, totalCents, totalCount } = getEnrichedBasket(mounted ? basketItems : []);
  const qtyOf = (id: string) =>
    mounted ? basketItems.filter((i) => i.id === id).reduce((n, i) => n + i.qty, 0) : 0;

  const video = {
    poster: '/videos/pizzetas-gustavo-poster.webp',
    webm: '/videos/pizzetas-gustavo.webm',
    mp4: '/videos/pizzetas-gustavo.mp4',
    label: ca
      ? 'Vídeo: en Gustavo prepara les pizzetes, les enforna i en tasta una a La Piccerella'
      : 'Vídeo: Gustavo prepara las pizzetas, las hornea y prueba una en La Piccerella',
    playLabel: ca ? 'Reproduir el vídeo' : 'Reproducir el vídeo',
    pauseLabel: ca ? 'Pausar el vídeo' : 'Pausar el vídeo',
    fit: 'object-[62%_40%]',
  };

  if (pizzetas.length === 0) return null;
  const fromPrice = formatCents(Math.min(...pizzetas.map((p) => p.priceCents)));

  return (
    <section
      id="pizzetas"
      data-theme="dark"
      aria-labelledby="pizzetas-heading"
      className="relative overflow-hidden bg-[linear-gradient(160deg,#8E1F17_0%,#A8241B_50%,#7A1A13_100%)] py-14 text-[#F9F4EC] md:py-20"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center">
        {/* Gustavo and his pizzetas: a moving photo beside the range (large screens) */}
        <LoopVideo
          {...video}
          className="hidden aspect-[9/16] w-full rounded-[28px] shadow-[0_18px_44px_rgba(0,0,0,0.4)] ring-1 ring-[#F9F4EC]/20 lg:block"
        />

        <div className="min-w-0">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#F7C873] uppercase">
                {ca ? 'Les més demanades' : 'Las más pedidas'}
              </p>
              <h2
                id="pizzetas-heading"
                className="font-serif-heading text-3xl leading-tight font-extrabold md:text-5xl"
              >
                {ca ? `Pizzetes des de ${fromPrice}` : `Pizzetas desde ${fromPrice}`}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#FBE9DD]">
                {ca
                  ? 'Individuals i fetes al moment amb la nostra massa de 48 hores.'
                  : 'Individuales y hechas al momento con nuestra masa de 48 horas.'}
              </p>
            </div>

            {/* The promo, impossible to miss */}
            <div className="flex shrink-0 items-center gap-4 self-start rounded-[22px] bg-[#14110F] px-5 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.35)] md:self-auto">
              <p className="font-serif-heading text-5xl leading-none font-extrabold text-[#F1B24A]">
                {PIZZETA_PROMO.pay}+{PIZZETA_PROMO.get - PIZZETA_PROMO.pay}
              </p>
              <p className="text-sm leading-snug">
                <strong className="block text-base font-extrabold">
                  {ca ? 'Paga’n 5 i emporta-te’n 6' : 'Paga 5 y llévate 6'}
                </strong>
                <span className="text-[#CBBBA8]">
                  {ca
                    ? 'Del mateix preu · també per WhatsApp'
                    : 'Del mismo precio · también por WhatsApp'}
                </span>
              </p>
            </div>
          </div>

          <ul
            aria-label={ca ? 'Pizzetes' : 'Pizzetas'}
            className="scrollbar-none -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {/* On phones and tablets the clip is the first card of the row */}
            <li className="w-[38vw] max-w-[170px] shrink-0 snap-start lg:hidden">
              <LoopVideo
                {...video}
                className="h-full min-h-[236px] w-full rounded-[22px] shadow-[0_10px_26px_rgba(0,0,0,0.28)]"
              />
            </li>
            {pizzetas.map((item) => (
              <PizzetaCard key={item.id} item={item} locale={locale} qty={qtyOf(item.id)} />
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 md:max-w-xl md:flex-1">
              {promo.pizzetaCount > 0 ? (
                <PromoMeter locale={locale} promo={promo} tone="dark" />
              ) : (
                <Link
                  href={`/${locale}/carta#categoria-pizzetas`}
                  className="text-sm font-bold text-[#FBE9DD] underline underline-offset-4 hover:text-[#F1B24A]"
                >
                  {ca
                    ? 'Veure totes les pizzetes a La Carta →'
                    : 'Ver todas las pizzetas en La Carta →'}
                </Link>
              )}
            </div>

            {totalCount > 0 && (
              <button
                type="button"
                onClick={openDrawer}
                data-testid="pizzetas-open-basket"
                className="btn-pill inline-flex min-h-[50px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F9F4EC] px-8 text-base font-extrabold text-[#14110F] transition-transform hover:scale-[1.03]"
              >
                {ca ? 'Veure la comanda' : 'Ver pedido'} · {formatCents(totalCents)}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
