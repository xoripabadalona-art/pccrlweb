'use client';

import React, { useState } from 'react';
import type { Locale } from '@/data/copy';
import { site } from '@/data/site';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { useBasketStore } from '@/store/basket';

export interface EventCalculatorProps {
  locale: Locale;
}

type EventType = 'cumpleanos' | 'empresa' | 'colegio' | 'amigos';
type EventFormat = 'mix' | 'pizzetas' | 'grandes';

const GUEST_PRESETS = [10, 15, 25, 40, 60] as const;

export function EventCalculator({ locale }: EventCalculatorProps) {
  const isCa = locale === 'ca';
  const t = (es: string, ca: string) => (isCa ? ca : es);

  const [guests, setGuests] = useState<number>(20);
  const [eventType, setEventType] = useState<EventType>('cumpleanos');
  const [format, setFormat] = useState<EventFormat>('mix');
  const [dateHint, setDateHint] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const addItem = useBasketStore((s) => s.addItem);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  // Recommended quantities calculation
  const recommendation = (() => {
    if (format === 'pizzetas') {
      const totalPizzetas = Math.max(6, Math.ceil((guests * 1.5) / 6) * 6);
      const freePizzetas = Math.floor(totalPizzetas / 6);
      return {
        pizzetas: totalPizzetas,
        freePizzetas,
        largePizzas: 0,
        stickers: 0,
        summary: isCa
          ? `${totalPizzetas} Pizzetes individuals de 16 cm (inclou ${freePizzetas} pizzetes GRATIS per la promo 5+1)`
          : `${totalPizzetas} Pizzetas individuales de 16 cm (incluye ${freePizzetas} pizzetas GRATIS por la promo 5+1)`,
      };
    }
    if (format === 'grandes') {
      const largePizzas = Math.max(3, Math.ceil(guests / 2.5));
      const stickers = largePizzas;
      const freeFromStickers = Math.floor(stickers / 5);
      return {
        pizzetas: 0,
        freePizzetas: 0,
        largePizzas,
        stickers,
        summary: isCa
          ? `${largePizzas} Pizzes Grans de 32 cm (${largePizzas * 8} talls · acumules ${stickers} stickers${
              freeFromStickers > 0 ? ` = ${freeFromStickers} pizza gratis!` : ''
            })`
          : `${largePizzas} Pizzas Grandes de 32 cm (${largePizzas * 8} porciones · acumulas ${stickers} stickers${
              freeFromStickers > 0 ? ` = ¡${freeFromStickers} pizza gratis!` : ''
            })`,
      };
    }
    // Mix format: 1 individual pizzeta per guest (rounded to multiple of 6) + 1 large pizza per 5 guests (min 3 for family pack)
    const pizzetas = Math.max(6, Math.ceil(guests / 6) * 6);
    const freePizzetas = Math.floor(pizzetas / 6);
    const largePizzas = Math.max(3, Math.ceil(guests / 5));
    const stickers = largePizzas;
    return {
      pizzetas,
      freePizzetas,
      largePizzas,
      stickers,
      summary: isCa
        ? `${pizzetas} Pizzetes individuals (${freePizzetas} GRATIS 5+1) + ${largePizzas} Pizzes Grans de 32 cm (+${stickers} stickers)`
        : `${pizzetas} Pizzetas individuales (${freePizzetas} GRATIS 5+1) + ${largePizzas} Pizzas Grandes de 32 cm (+${stickers} stickers)`,
    };
  })();

  const eventTypeLabels: Record<EventType, string> = {
    cumpleanos: t('🎂 Cumpleaños / Fiesta familiar', '🎂 Aniversari / Festa familiar'),
    empresa: t('💼 Empresa / Reunión de oficina', '💼 Empresa / Reunió d’oficina'),
    colegio: t('⚽ Colegio / Club deportivo', '⚽ Escola / Club esportiu'),
    amigos: t('🍻 Fiesta con amigos / Playa', '🍻 Festa amb amics / Platja'),
  };

  const formatLabels: Record<EventFormat, string> = {
    mix: t('🔥 Mix Pizzetas + Pizzas Grandes (Recomendado)', '🔥 Mix Pizzetes + Pizzes Grans (Recomanat)'),
    pizzetas: t('🍕 Solo Pizzetas individuales (16 cm)', '🍕 Només Pizzetes individuals (16 cm)'),
    grandes: t('🍽️ Solo Pizzas Grandes para compartir (32 cm)', '🍽️ Només Pizzes Grans per compartir (32 cm)'),
  };

  const message = isCa
    ? [
        `Hola ${site.name}! Voldria pressupost d'esdeveniment / majorista:`,
        `• Convidats: ${guests} persones`,
        `• Tipus d'esdeveniment: ${eventTypeLabels[eventType]}`,
        `• Format preferit: ${formatLabels[format]}`,
        `• Proposta calculada: ${recommendation.summary}`,
        dateHint.trim() ? `• Data i hora aprox.: ${dateHint.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    : [
        `Hola ${site.name}! Quiero presupuesto especial para evento / mayoreo:`,
        `• Invitados: ${guests} personas`,
        `• Tipo de evento: ${eventTypeLabels[eventType]}`,
        `• Formato preferido: ${formatLabels[format]}`,
        `• Propuesta calculada: ${recommendation.summary}`,
        dateHint.trim() ? `• Fecha y hora aprox.: ${dateHint.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

  const whatsappUrl = buildWhatsAppUrl(site.whatsappNumber, message);

  const handleLoadIntoBasket = () => {
    if (recommendation.pizzetas > 0) {
      const half = Math.ceil(recommendation.pizzetas / 2);
      const rest = recommendation.pizzetas - half;
      addItem('pizzeta-margarita', undefined, half);
      if (rest > 0) {
        addItem('pizzeta-pepperoni', undefined, rest);
      }
    }
    if (recommendation.largePizzas >= 3) {
      const packs = Math.floor(recommendation.largePizzas / 3);
      const extraPizzas = recommendation.largePizzas % 3;
      if (packs > 0) {
        addItem('pack-degustacion-familiar', undefined, packs, {
          packPizzas: ['pizza-margarita', 'pizza-pepperoni', 'pizza-prosciutto-funghi'],
        });
      }
      if (extraPizzas > 0) {
        addItem('pizza-margarita', undefined, extraPizzas);
      }
    }
    openDrawer();
  };

  return (
    <div
      data-testid="event-calculator"
      className="mb-10 rounded-[26px] border border-[#F1B24A]/45 bg-[#14110F] p-6 text-[#F9F4EC] shadow-xl md:p-8"
    >
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#F9F4EC]/12 pb-5 md:flex-row md:items-center">
        <div>
          <span className="inline-block rounded-full bg-[#F1B24A]/20 px-3 py-1 text-[11px] font-extrabold tracking-wider text-[#F1B24A] uppercase">
            {t('⚡ Calculadora Interactiva de Eventos y Mayoreo', '⚡ Calculadora Interactiva d’Esdeveniments i Festes')}
          </span>
          <h2 className="font-serif-heading mt-2 text-2xl font-extrabold text-[#F9F4EC] md:text-3xl">
            {t('Calcula tu evento en 30 segundos', 'Calcula el teu esdeveniment en 30 segons')}
          </h2>
          <p className="mt-1 text-sm text-[#CBBBA8]">
            {t(
              'Dinos cuántos sois y te calculamos al instante la combinación ideal con las promociones 5+1 en pizzetas y packs familiares.',
              'Digues-nos quants sou i et calculem a l’instant la combinació ideal amb les promocions 5+1 en pizzetes i packs familiars.'
            )}
          </p>
        </div>
        <a
          href={`tel:${site.phoneTel}`}
          className="btn-pill inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-[#F1B24A]/50 bg-[#1F1813] px-5 py-2 text-xs font-extrabold text-[#F1B24A] hover:bg-[#F1B24A] hover:text-[#14110F]"
        >
          <span>📞 {t('Atención directa:', 'Atenció directa:')} {site.phone}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Controls column */}
        <div className="space-y-5 lg:col-span-7">
          {/* Step 1: Number of guests */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="event-guests-range"
                className="text-xs font-extrabold tracking-wider text-[#E5D7C3] uppercase"
              >
                {t('1. ¿Cuántas personas sois?', '1. Quantes persones sou?')}
              </label>
              <span
                data-testid="event-guests-value"
                className="rounded-full bg-[#EE6A2B] px-3 py-0.5 text-sm font-extrabold text-[#14110F]"
              >
                {guests} {t('personas', 'persones')}
              </span>
            </div>
            <input
              id="event-guests-range"
              type="range"
              min={8}
              max={100}
              step={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full accent-[#EE6A2B] cursor-pointer"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GUEST_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGuests(preset)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    guests === preset
                      ? 'bg-[#F1B24A] text-[#14110F]'
                      : 'border border-[#F9F4EC]/20 bg-[#1F1813] text-[#E5D7C3] hover:border-[#F1B24A]'
                  }`}
                >
                  {preset} {t('pers.', 'pers.')}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Event type */}
          <div>
            <p className="mb-2 text-xs font-extrabold tracking-wider text-[#E5D7C3] uppercase">
              {t('2. Tipo de evento', '2. Tipus d’esdeveniment')}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer ${
                    eventType === type
                      ? 'border-[#EE6A2B] bg-[#EE6A2B]/20 text-[#F9F4EC]'
                      : 'border-[#F9F4EC]/15 bg-[#1F1813] text-[#CBBBA8] hover:border-[#F9F4EC]/35'
                  }`}
                >
                  {eventTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Format */}
          <div>
            <p className="mb-2 text-xs font-extrabold tracking-wider text-[#E5D7C3] uppercase">
              {t('3. Formato preferido', '3. Format preferit')}
            </p>
            <div className="flex flex-col gap-2">
              {(Object.keys(formatLabels) as EventFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer ${
                    format === fmt
                      ? 'border-[#F1B24A] bg-[#F1B24A]/20 text-[#F9F4EC]'
                      : 'border-[#F9F4EC]/15 bg-[#1F1813] text-[#CBBBA8] hover:border-[#F9F4EC]/35'
                  }`}
                >
                  {formatLabels[fmt]}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Optional date/time */}
          <div>
            <label
              htmlFor="event-date-input"
              className="mb-1.5 block text-xs font-extrabold tracking-wider text-[#E5D7C3] uppercase"
            >
              {t('4. Fecha y hora aproximada (opcional)', '4. Data i hora aproximada (opcional)')}
            </label>
            <input
              id="event-date-input"
              type="text"
              value={dateHint}
              onChange={(e) => setDateHint(e.target.value)}
              placeholder={t('Ej: Sábado 28 a las 20:30 h', 'Ex: Dissabte 28 a les 20:30 h')}
              className="w-full rounded-xl border border-[#F9F4EC]/20 bg-[#1F1813] px-3.5 py-2.5 text-sm text-[#F9F4EC] placeholder:text-[#CBBBA8]/50 focus:border-[#F1B24A] focus:outline-none"
            />
          </div>
        </div>

        {/* Result & CTA column */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#F1B24A]/35 bg-[#1F1813] p-5 lg:col-span-5">
          <div>
            <span className="inline-block rounded-full bg-[#2F5A2B] px-3 py-0.5 text-[11px] font-extrabold text-[#F9F4EC] uppercase">
              {t('Propuesta recomendada', 'Proposta recomanada')}
            </span>
            <h3
              data-testid="event-recommendation-summary"
              className="font-serif-heading mt-3 text-xl leading-snug font-extrabold text-[#F9F4EC]"
            >
              {recommendation.summary}
            </h3>

            <ul className="mt-4 space-y-2 border-t border-[#F9F4EC]/12 pt-4 text-xs text-[#E5D7C3]">
              {recommendation.freePizzetas > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#F1B24A]">★</span>
                  <span>
                    {t(
                      `Incluye ${recommendation.freePizzetas} pizzetas GRATIS aplicadas automáticamente (Promo 5+1).`,
                      `Inclou ${recommendation.freePizzetas} pizzetes GRATIS aplicades automàticament (Promo 5+1).`
                    )}
                  </span>
                </li>
              )}
              {recommendation.stickers > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#F1B24A]">★</span>
                  <span>
                    {t(
                      `Te llevas ${recommendation.stickers} Stickers de fidelidad (5 Stickers = 1 Pizza Grande Gratis).`,
                      `T'emportes ${recommendation.stickers} Stickers de fidelitat (5 Stickers = 1 Pizza Gran Gratis).`
                    )}
                  </span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="text-[#F1B24A]">★</span>
                <span>
                  {t(
                    `Horneado programado a la hora exacta en ${site.addressStructured.streetAddress} (Badalona).`,
                    `Fornejat programat a l’hora exacta a ${site.addressStructured.streetAddress} (Badalona).`
                  )}
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              data-testid="event-load-basket-btn"
              onClick={handleLoadIntoBasket}
              className="btn-pill inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#EE6A2B] px-5 py-3 text-sm font-extrabold text-[#14110F] transition-transform hover:scale-[1.01] hover:bg-[#F37D44] cursor-pointer"
            >
              {t('🛒 Cargar propuesta en mi pedido ahora', '🛒 Carregar proposta a la meva comanda ara')}
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-[#F1B24A] bg-[#F1B24A]/15 px-5 py-2.5 text-xs font-extrabold text-[#F1B24A] hover:bg-[#F1B24A] hover:text-[#14110F]"
              >
                {t('💬 Consultar tarifa especial por WhatsApp', '💬 Consultar tarifa especial per WhatsApp')}
              </a>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  } catch {
                    // ignore clipboard error
                  }
                }}
                className="btn-pill inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-[#F1B24A] bg-[#F1B24A]/15 px-5 py-2.5 text-xs font-extrabold text-[#F1B24A] hover:bg-[#F1B24A] hover:text-[#14110F] cursor-pointer"
              >
                {copied
                  ? t(`✓ Propuesta copiada · Llámanos al ${site.phone}`, `✓ Proposta copiada · Truca’ns al ${site.phone}`)
                  : t('📋 Copiar resumen del evento para presupuesto', '📋 Copiar resum de l’esdeveniment per a pressupost')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
