'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import type { Locale } from '@/data/copy';

export function AnalyticsAndConsent({ locale }: { locale: Locale }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;

  const [consent, setConsent] = useState<'granted' | 'denied' | 'pending'>('pending');

  useEffect(() => {
    if (!ga4Id || typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('la-piccerella-ga-consent');
      if (saved === 'granted' || saved === 'denied') {
        setConsent(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, [ga4Id]);

  const handleConsent = (choice: 'granted' | 'denied') => {
    setConsent(choice);
    try {
      window.localStorage.setItem('la-piccerella-ga-consent', choice);
    } catch {
      // ignore
    }
  };

  if (!plausibleDomain && !ga4Id) {
    return null;
  }

  return (
    <>
      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}

      {ga4Id && consent === 'granted' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {ga4Id && consent === 'pending' && (
        <div
          role="region"
          aria-label={locale === 'ca' ? 'Avís de galetes' : 'Aviso de cookies'}
          className="fixed right-4 bottom-20 z-50 max-w-sm rounded-2xl border border-[#F9F4EC]/20 bg-[#14110F] p-4 text-xs text-[#F9F4EC] shadow-2xl"
        >
          <p className="mb-3 leading-relaxed">
            {locale === 'ca'
              ? "Utilitzem analítica opcional per mesurar l'ús de la cistella. Acceptes activar Google Analytics?"
              : 'Utilizamos analítica opcional para medir el uso del carrito. ¿Aceptas activar Google Analytics?'}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleConsent('denied')}
              className="min-h-[38px] rounded-full border border-[#F9F4EC]/25 px-3.5 py-1 font-semibold text-[#CBBBA8] hover:text-[#F9F4EC] cursor-pointer"
            >
              {locale === 'ca' ? 'Rebutjar' : 'Rechazar'}
            </button>
            <button
              type="button"
              onClick={() => handleConsent('granted')}
              className="min-h-[38px] rounded-full bg-[#EE6A2B] px-4 py-1 font-bold text-[#14110F] cursor-pointer"
            >
              {locale === 'ca' ? 'Acceptar' : 'Aceptar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
