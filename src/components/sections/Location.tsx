import React from 'react';
import { site, type DayOfWeek } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import { OpenNowBadge } from '@/components/ui/OpenNowBadge';
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed';

export interface LocationProps {
  locale: Locale;
}

const ORDERED_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function Location({ locale }: LocationProps) {
  const copy = getCopy(locale);

  const mapsQueryUrl = site.googleMapsUrl.startsWith('http')
    ? site.googleMapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${site.name} ${site.address}`
      )}`;

  return (
    <section
      id="ubicacion"
      data-theme="dark"
      aria-labelledby="location-heading"
      className="bg-[#14110F] py-20 text-[#F9F4EC] md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
              {copy.locationSection.eyebrow}
            </p>
            <h2
              id="location-heading"
              className="font-serif-heading text-3xl font-bold md:text-5xl"
            >
              {copy.locationSection.heading}
            </h2>
          </div>
          <OpenNowBadge locale={locale} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left card: NAP details & opening hours */}
          <div className="flex flex-col justify-between rounded-[24px] border border-[#F9F4EC]/12 bg-[#1F1813] p-6 md:p-8 lg:col-span-6">
            <div className="flex flex-col gap-6">
              {/* Exact NAP block matching site.ts */}
              <div>
                <h3 className="mb-2 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
                  {copy.locationSection.addressLabel}
                </h3>
                <p
                  data-testid="location-nap-name"
                  className="font-serif-heading text-xl font-bold text-[#F9F4EC]"
                >
                  {site.name}
                </p>
                <p
                  data-testid="location-nap-address"
                  className="mt-1 text-base text-[#CBBBA8]"
                >
                  {site.address}
                </p>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
                  {copy.locationSection.phoneLabel}
                </h3>
                <a
                  href={`tel:${site.phoneTel}`}
                  data-testid="location-nap-phone"
                  className="text-lg font-bold text-[#F9F4EC] underline decoration-[#EE6A2B] underline-offset-4 hover:text-[#EE6A2B]"
                >
                  {site.phone}
                </a>
                <p className="mt-1.5 text-xs leading-relaxed text-[#CBBBA8]">
                  {locale === 'ca'
                    ? 'A 2 min de la Rambla i la Platja de Badalona · Metro L2 Badalona Pompeu Fabra'
                    : 'A 2 min de la Rambla y la Playa de Badalona · Metro L2 Badalona Pompeu Fabra'}
                </p>
              </div>

              {/* Structured Opening Hours */}
              <div>
                <h3 className="mb-3 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
                  {copy.locationSection.hoursLabel}
                </h3>
                <dl className="divide-y divide-[#F9F4EC]/10 text-sm">
                  {ORDERED_DAYS.map((day) => {
                    const dayIntervals = site.hours.filter((h) => h.day === day);
                    const formatted =
                      dayIntervals.length > 0
                        ? dayIntervals.map((i) => `${i.open}–${i.close}`).join(' · ')
                        : '—';
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between py-2"
                      >
                        <dt className="font-medium text-[#CBBBA8]">
                          {copy.locationSection.days[day] ?? day}
                        </dt>
                        <dd className="font-bold tabular-nums text-[#F9F4EC]">
                          {formatted}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 pt-4">
              <a
                href={mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#EE6A2B] px-6 py-3 text-sm font-bold text-[#14110F] hover:bg-[#F37D44]"
              >
                <span>{copy.locationSection.directionsButton}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* Right card: Real storefront image & Zero-Cookie Static Map Card with link to Google Maps */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#F9F4EC]/12 bg-[#1F1813] lg:col-span-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#14110F]">
              <img
                src="/images/real/storefront-close.webp"
                alt={`${site.name} — ${site.address}`}
                width={960}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1813] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-[#14110F]/90 p-4 backdrop-blur-md">
                <div>
                  <p className="text-xs font-bold tracking-wider text-[#EE6A2B] uppercase">
                    Badalona · Centre / Mar
                  </p>
                  <p className="text-sm font-bold text-[#F9F4EC]">{site.address}</p>
                </div>
                <a
                  href={mapsQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copy.locationSection.directionsButton}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#EE6A2B] px-4 py-2 text-xs font-bold text-[#14110F] hover:bg-[#F37D44]"
                >
                  Mapa ↗
                </a>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-sm leading-relaxed text-[#CBBBA8]">
                {locale === 'ca'
                  ? 'Situats al Carrer de Mar, 127, al cor de Badalona i molt a prop del passeig marítim. Pots recollir la teva comanda acabada de sortir del forn o gaudir-la al nostre local.'
                  : 'Situados en Carrer de Mar, 127, en pleno centro de Badalona y muy cerca del paseo marítimo. Puedes recoger tu pedido recién salido del horno o disfrutarlo en nuestro local.'}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Google Map pinned to Carrer de Mar, 127 */}
        <GoogleMapEmbed locale={locale} className="mt-8" />
      </div>
    </section>
  );
}
