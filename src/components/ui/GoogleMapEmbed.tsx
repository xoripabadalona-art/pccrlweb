import React from 'react';
import { site } from '@/data/site';
import type { Locale } from '@/data/copy';
import { getGoogleMapsUrl } from '@/components/seo/JsonLd';

export interface GoogleMapEmbedProps {
  locale: Locale;
  /** Height Tailwind classes for the iframe container */
  heightClass?: string;
  className?: string;
}

/**
 * Interactive Google Maps embed pinned directly to La Piccerella
 * (Carrer de Mar, 127, 08911 Badalona). Uses the free public embed endpoint
 * (no API key or billing required) with lazy loading for Core Web Vitals.
 */
export function GoogleMapEmbed({
  locale,
  heightClass = 'h-[320px] md:h-[380px]',
  className = '',
}: GoogleMapEmbedProps) {
  const ca = locale === 'ca';
  const query = encodeURIComponent(`${site.name}, ${site.address}`);
  const lat = site.geo.latitude ?? 41.4474134;
  const lng = site.geo.longitude ?? 2.2501806;
  const embedSrc = `https://maps.google.com/maps?q=${query}&ll=${lat},${lng}&z=17&hl=${locale}&output=embed`;

  return (
    <div
      className={`overflow-hidden rounded-[24px] border border-[#F9F4EC]/12 bg-[#1F1813] shadow-lg ${className}`.trim()}
    >
      <div className={`relative w-full ${heightClass}`}>
        <iframe
          title={
            ca
              ? `Mapa d'ubicació de ${site.name} — ${site.address}`
              : `Mapa de ubicación de ${site.name} — ${site.address}`
          }
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F9F4EC]/10 bg-[#14110F]/90 px-5 py-3.5 text-xs text-[#CBBBA8]">
        <span>
          📍 <strong className="text-[#F9F4EC]">{site.name}</strong> · {site.address}
        </span>
        <a
          href={getGoogleMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#F1B24A] underline underline-offset-4 hover:text-[#EE6A2B]"
        >
          {ca ? 'Obrir a Google Maps' : 'Abrir en Google Maps'} ↗
        </a>
      </div>
    </div>
  );
}
