import React from 'react';
import type { Locale } from '@/data/copy';

export interface WhyPiccerellaProps {
  locale: Locale;
}

/**
 * Clean 4 Numerical Pillars strip (inspired by Can Pizza's 4 pillars),
 * highlighting La Piccerella's 4 unbeatable differentiators in Badalona
 * with zero text bloat.
 */
export function WhyPiccerella({ locale }: WhyPiccerellaProps) {
  const isCa = locale === 'ca';
  const t = (es: string, ca: string) => (isCa ? ca : es);

  const pillars = [
    {
      stat: '48H',
      label: t('MASA FERMENTADA', 'MASSA FERMENTADA'),
      detail: t(
        'Fermentación lenta en frío durante 48 horas para lograr una base fina, ligera, crujiente y muy digestiva.',
        'Fermentació lenta en fred durant 48 hores per aconseguir una base fina, lleugera, cruixent i molt digestiva.'
      ),
    },
    {
      stat: '3,00 €',
      label: t('PIZZETAS · PROMO 5+1', 'PIZZETES · PROMO 5+1'),
      detail: t(
        'Formato individual de 16 cm recién horneado al momento. Por cada 5 pizzetas, la 6ª te sale totalmente gratis.',
        'Format individual de 16 cm acabat de fer al moment. Per cada 5 pizzetes, la 6a et surt totalment gratis.'
      ),
    },
    {
      stat: '5 = 1',
      label: t('STICKERS PIZZA GRATIS', 'STICKERS PIZZA GRATIS'),
      detail: t(
        'Por cada Pizza Grande (32 cm) sumas 1 Sticker en tu tarjeta física. Al juntar 5 Stickers tienes 1 Pizza Grande Gratis.',
        'Per cada Pizza Gran (32 cm) sumes 1 Sticker a la teva targeta física. En ajuntar 5 Stickers tens 1 Pizza Gran Gratis.'
      ),
    },
    {
      stat: '34,99 €',
      label: t('PACK 3 PIZZAS GRANDES', 'PACK 3 PIZZES GRANS'),
      detail: t(
        'Elige libremente tus 3 Pizzas Grandes favoritas entre las 15 recetas de la carta para compartir en casa o en la playa.',
        'Tria lliurement les teves 3 Pizzes Grans preferides entre les 15 receptes de la carta per compartir a casa o a la platja.'
      ),
    },
  ];

  return (
    <section
      id="pilares-piccerella"
      data-theme="cream"
      aria-label={t('Los 4 pilares de La Piccerella', 'Els 4 pilars de La Piccerella')}
      className="border-y border-[#1A1512]/10 bg-[#FAF5ED] py-10 text-[#1A1512] md:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className="flex flex-col rounded-[22px] border border-[#1A1512]/10 bg-[#F4EBDD] p-5 text-center shadow-xs"
            >
              <p className="font-serif-heading text-3xl font-extrabold text-[#A8241B] md:text-4xl">
                {pillar.stat}
              </p>
              <h3 className="mt-1 text-xs font-extrabold tracking-wider text-[#1A1512] uppercase">
                {pillar.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#4A3F37] md:text-sm">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
