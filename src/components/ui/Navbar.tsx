'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import { getEnrichedBasket, useBasketStore } from '@/store/basket';
import { Button } from './Button';

export interface NavbarProps {
  locale: Locale;
  currentPath?: 'home' | 'carta';
  /** Address of this same page in the other language (defaults to the home or the menu) */
  alternateHref?: string;
}

export function Navbar({ locale, currentPath = 'home', alternateHref: alternateOverride }: NavbarProps) {
  const copy = getCopy(locale);
  const items = useBasketStore((s) => s.items);
  const openDrawer = useBasketStore((s) => s.openDrawer);
  const lastAnnouncement = useBasketStore((s) => s.lastAnnouncement);

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onLightSection, setOnLightSection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 64);

      // Detect if navbar sits above a cream/light section
      const lightSections = document.querySelectorAll<HTMLElement>('[data-theme="cream"]');
      let isOverCream = false;
      for (const sec of lightSections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 72 && rect.bottom >= 72) {
          isOverCream = true;
          break;
        }
      }
      setOnLightSection(isOverCream);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Accessible focus trap and Escape handling for mobile hamburger menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusable = Array.from(
          mobileMenuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const { totalCount } = mounted ? getEnrichedBasket(items) : { totalCount: 0 };

  const homePrefix = `/${locale}`;
  const alternateLocale: Locale = locale === 'es' ? 'ca' : 'es';
  const alternateHref =
    alternateOverride ??
    (currentPath === 'carta' ? `/${alternateLocale}/carta` : `/${alternateLocale}`);

  const navBgClass = scrolled
    ? onLightSection
      ? 'bg-[#F4EBDD]/95 text-[#1A1512] shadow-md backdrop-blur-md border-b border-[#1A1512]/10'
      : 'bg-[#14110F]/95 text-[#F9F4EC] shadow-lg backdrop-blur-md border-b border-[#F9F4EC]/10'
    : 'bg-gradient-to-b from-[#14110F]/85 via-[#14110F]/45 to-transparent text-[#F9F4EC]';

  const linkHoverClass =
    scrolled && onLightSection
      ? 'hover:text-[#C8372D] text-[#1A1512]'
      : 'hover:text-[#EE6A2B] text-[#F9F4EC]';

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-40 transition-colors duration-300 ${navBgClass}`}
    >
      {/* Screen-reader live region for basket updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {mounted && lastAnnouncement ? `Añadido al pedido: ${lastAnnouncement}` : ''}
      </div>

      <nav
        aria-label={locale === 'ca' ? 'Navegació principal' : 'Navegación principal'}
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8"
      >
        {/* Real Brand Logo + Wordmark */}
        <Link
          href={homePrefix}
          className="flex items-center gap-3 rounded-full py-1 pr-3 focus-visible:outline-offset-4"
        >
          <img
            src={site.logo}
            alt={`${site.name} — ${site.legalDescriptor}`}
            width={48}
            height={48}
            className="h-11 w-11 rounded-full bg-[#F4EBDD] object-contain shadow-sm md:h-12 md:w-12"
          />
          <div className="flex flex-col">
            <span className="font-serif-heading text-lg leading-tight font-bold tracking-tight md:text-xl">
              {site.name}
            </span>
            <span className="text-[11px] font-medium tracking-wider uppercase opacity-80">
              Badalona
            </span>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <div className="hidden items-center gap-7 lg:flex">
          <Link
            href={`${homePrefix}#carta`}
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {copy.nav.menu}
          </Link>
          <Link
            href={`${homePrefix}/carta`}
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {copy.nav.fullMenuPage}
          </Link>
          <Link
            href={`${homePrefix}#faq`}
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {copy.nav.howToOrder}
          </Link>
          <Link
            href={`${homePrefix}#ubicacion`}
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {copy.nav.location}
          </Link>
        </div>

        {/* Right actions: Language switcher, Carta ghost button, WhatsApp / Basket pill */}
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Language Switch ES / CA */}
          <Link
            href={alternateHref}
            aria-label={`${copy.nav.languageLabel}: ${alternateLocale.toUpperCase()}`}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 text-xs font-bold tracking-wider uppercase transition-colors ${
              scrolled && onLightSection
                ? 'border-[#1A1512]/25 text-[#1A1512] hover:bg-[#1A1512]/10'
                : 'border-[#F9F4EC]/30 text-[#F9F4EC] hover:bg-[#F9F4EC]/15'
            }`}
          >
            {locale === 'es' ? 'ES · CA' : 'CA · ES'}
          </Link>

          <Link
            href={`${homePrefix}#carta`}
            className={`hidden min-h-[44px] items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors sm:inline-flex ${
              scrolled && onLightSection
                ? 'border-[#1A1512]/30 text-[#1A1512] hover:bg-[#1A1512]/10'
                : 'border-[#F9F4EC]/35 text-[#F9F4EC] hover:bg-[#F9F4EC]/10'
            }`}
          >
            {copy.nav.menu}
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={openDrawer}
            aria-label={`${copy.nav.orderWhatsApp} (${totalCount})`}
            data-testid="navbar-order-button"
          >
            <span>{copy.nav.orderWhatsApp}</span>
            {totalCount > 0 && (
              <span
                data-testid="navbar-basket-count"
                className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#14110F] px-1.5 text-xs font-bold text-[#F9F4EC]"
              >
                {totalCount}
              </span>
            )}
          </Button>

          {/* Accessible mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileMenuOpen ? copy.nav.closeMenuLabel : copy.nav.openMenuLabel
            }
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border lg:hidden cursor-pointer ${
              scrolled && onLightSection
                ? 'border-[#1A1512]/25 text-[#1A1512]'
                : 'border-[#F9F4EC]/30 text-[#F9F4EC]'
            }`}
          >
            {mobileMenuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          ref={mobileMenuRef}
          className="border-t border-[#F9F4EC]/15 bg-[#14110F] px-6 py-6 text-[#F9F4EC] shadow-2xl lg:hidden"
        >
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href={`${homePrefix}#carta`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center text-lg font-semibold hover:text-[#EE6A2B]"
              >
                {copy.nav.menu}
              </Link>
            </li>
            <li>
              <Link
                href={`${homePrefix}/carta`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center text-lg font-semibold hover:text-[#EE6A2B]"
              >
                {copy.nav.fullMenuPage}
              </Link>
            </li>
            <li>
              <Link
                href={`${homePrefix}#faq`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center text-lg font-semibold hover:text-[#EE6A2B]"
              >
                {copy.nav.howToOrder}
              </Link>
            </li>
            <li>
              <Link
                href={`${homePrefix}#ubicacion`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center text-lg font-semibold hover:text-[#EE6A2B]"
              >
                {copy.nav.location}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
