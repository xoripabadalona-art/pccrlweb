'use client';

import React, { useEffect, useRef, useState } from 'react';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import { getEnrichedBasket, useBasketStore } from '@/store/basket';

export interface FloatingWhatsAppProps {
  locale: Locale;
}

export function FloatingWhatsApp({ locale }: FloatingWhatsAppProps) {
  const copy = getCopy(locale);
  const items = useBasketStore((s) => s.items);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  const [mounted, setMounted] = useState(false);
  const [hiddenOnMobileScroll, setHiddenOnMobileScroll] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);

    let rafPending = false;
    const updateVisibility = () => {
      rafPending = false;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      // Hide on scroll down, show on scroll up on mobile viewports (< 768px)
      if (window.innerWidth < 768) {
        if (delta > 10 && currentY > 180) {
          setHiddenOnMobileScroll(true);
        } else if (delta < -6 || currentY <= 120) {
          setHiddenOnMobileScroll(false);
        }
      } else {
        setHiddenOnMobileScroll(false);
      }
      lastScrollY.current = currentY;
    };

    const handleScroll = () => {
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(updateVisibility);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { totalCount } = mounted ? getEnrichedBasket(items) : { totalCount: 0 };

  const handleClick = () => {
    if (totalCount > 0) {
      openDrawer();
      return;
    }

    // If basket is empty, open plain chat with a greeting message if number is configured,
    // and also open the drawer so the customer can build an order or copy the greeting.
    const greetingUrl = buildWhatsAppUrl(
      site.whatsappNumber,
      copy.basket.greetingMessage
    );
    if (greetingUrl && typeof window !== 'undefined') {
      trackEvent('whatsapp_order_click', { totalCents: 0, itemCount: 0 });
      window.open(greetingUrl, '_blank', 'noopener,noreferrer');
    } else {
      openDrawer();
    }
  };

  return (
    <div
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-40 transition-transform duration-300 md:bottom-6 md:left-6 ${
        hiddenOnMobileScroll ? 'translate-y-28 md:translate-y-0' : 'translate-y-0'
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        data-testid="floating-whatsapp-button"
        aria-label={`${copy.nav.orderWhatsApp}${
          totalCount > 0 ? ` (${totalCount})` : ''
        }`}
        className="btn-pill inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-[#14110F] shadow-[0_10px_28px_rgba(37,211,102,0.38)] transition-transform hover:scale-[1.02] hover:bg-[#2FE072] active:scale-95 cursor-pointer"
      >
        {/* WhatsApp Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 12.99 14.33C12.74 14.21 11.94 13.94 11 13.1C10.26 12.44 9.77 11.63 9.62 11.38C9.48 11.13 9.6 11 9.73 10.87C9.84 10.76 9.98 10.58 10.1 10.44C10.22 10.3 10.27 10.19 10.35 10.03C10.43 9.86 10.39 9.72 10.33 9.6C10.27 9.47 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.34 9.01 7.33C8.86 7.33 8.7 7.33 8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.92 7.9 12.1 8.02 12.26C8.15 12.43 9.77 14.92 12.25 15.99C12.84 16.25 13.3 16.4 13.66 16.52C14.25 16.71 14.79 16.68 15.22 16.62C15.7 16.55 16.68 16.02 16.89 15.45C17.1 14.87 17.1 14.38 17.03 14.27C16.97 14.16 16.81 14.11 16.56 13.99Z" />
        </svg>

        <span>{copy.nav.orderWhatsApp}</span>

        {totalCount > 0 && (
          <span
            data-testid="floating-whatsapp-badge"
            className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#14110F] px-1.5 text-xs font-bold text-[#F9F4EC]"
          >
            {totalCount}
          </span>
        )}
      </button>
    </div>
  );
}
