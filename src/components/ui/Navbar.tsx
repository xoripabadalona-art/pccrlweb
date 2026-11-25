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

    let rafPending = false;
    let lightSections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-theme="cream"]')
    );

    const updateNavbarState = () => {
      rafPending = false;
      const y = window.scrollY;
      setScrolled((prev) => {
        const next = y > 64;
        return prev === next ? prev : next;
      });

      if (lightSections.length === 0) {
        lightSections = Array.from(
          document.querySelectorAll<HTMLElement>('[data-theme="cream"]')
        );
      }

      let isOverCream = false;
      for (let i = 0; i < lightSections.length; i++) {
        const rect = lightSections[i]!.getBoundingClientRect();
        if (rect.top <= 72 && rect.bottom >= 72) {
          isOverCream = true;
          break;
        }
      }
      setOnLightSection((prev) => (prev === isOverCream ? prev : isOverCream));
    };

    const handleScroll = () => {
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(updateNavbarState);
      }
    };

    updateNavbarState();
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

  const isLightMode = scrolled && onLightSection && !mobileMenuOpen;

  // Desktop header background remains full-bleed; on mobile (< lg) the inner <nav> is a floating glass pill
  const desktopHeaderBgClass = scrolled
    ? onLightSection
      ? 'lg:bg-[#F4EBDD]/95 lg:text-[#1A1512] lg:shadow-md lg:backdrop-blur-md lg:border-b lg:border-[#1A1512]/10'
      : 'lg:bg-[#14110F]/95 lg:text-[#F9F4EC] lg:shadow-lg lg:backdrop-blur-md lg:border-b lg:border-[#F9F4EC]/10'
    : 'lg:bg-gradient-to-b lg:from-[#14110F]/85 lg:via-[#14110F]/45 lg:to-transparent lg:text-[#F9F4EC]';

  const mobileNavPillClass = isLightMode
    ? 'border-[#1A1512]/12 bg-[#FAF5ED]/92 text-[#1A1512] shadow-[0_10px_28px_rgba(26,21,18,0.12)]'
    : 'border-[#F9F4EC]/15 bg-[#14110F]/88 text-[#F9F4EC] shadow-[0_14px_34px_rgba(0,0,0,0.5)]';

  const linkHoverClass =
    scrolled && onLightSection
      ? 'hover:text-[#C8372D] text-[#1A1512]'
      : 'hover:text-[#EE6A2B] text-[#F9F4EC]';

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-40 transition-colors duration-300 ${desktopHeaderBgClass}`}
    >
      {/* Screen-reader live region for basket updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {mounted && lastAnnouncement ? `Añadido al pedido: ${lastAnnouncement}` : ''}
      </div>

      {/* Backdrop overlay when mobile dropdown is open */}
      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 top-0 -z-10 h-screen w-screen bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      <nav
        aria-label={locale === 'ca' ? 'Navegació principal' : 'Navegación principal'}
        className={`mx-3 mt-2.5 flex max-w-7xl items-center justify-between rounded-[22px] border px-3.5 py-2 backdrop-blur-xl transition-all duration-300 ${mobileNavPillClass} lg:mx-auto lg:mt-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-8 lg:py-3 lg:shadow-none lg:backdrop-blur-none`}
      >
        {/* Real Brand Logo + Wordmark */}
        <Link
          href={homePrefix}
          onClick={() => setMobileMenuOpen(false)}
          className="flex min-w-0 items-center gap-2.5 rounded-full py-0.5 pr-2 focus-visible:outline-offset-4 lg:gap-3 lg:py-1 lg:pr-3"
        >
          <img
            src={site.logo}
            alt={`${site.name} — ${site.legalDescriptor}`}
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 rounded-full bg-[#F4EBDD] object-contain p-0.5 shadow-sm ring-1 ring-[#F1B24A]/40 lg:h-12 lg:w-12 lg:p-0 lg:ring-0"
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-serif-heading truncate text-[1.05rem] leading-tight font-extrabold tracking-tight sm:text-lg lg:text-xl lg:font-bold">
              {site.name}
            </span>
            <span
              className={`text-[10px] font-bold tracking-[0.14em] uppercase lg:hidden ${
                isLightMode ? 'text-[#A8241B]' : 'text-[#F1B24A]'
              }`}
            >
              Badalona · 48h
            </span>
            <span className="hidden text-[11px] font-medium tracking-wider uppercase opacity-80 lg:block">
              Badalona
            </span>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <div className="hidden items-center gap-7 lg:flex">
          <Link
            href={`${homePrefix}/carta`}
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {locale === 'ca' ? 'La Carta' : 'La Carta'}
          </Link>
          <Link
            href={`${homePrefix}#pizzetas`}
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {locale === 'ca' ? 'Pizzetes 3 € (5+1)' : 'Pizzetas 3 € (5+1)'}
          </Link>
          <Link
            href={
              locale === 'ca'
                ? '/ca/pizzes-esdeveniments-festes-badalona'
                : '/es/pizzas-eventos-fiestas-mayoreo-badalona'
            }
            className={`text-sm font-semibold transition-colors ${linkHoverClass}`}
          >
            {locale === 'ca' ? 'Festes i Esdeveniments' : 'Eventos y Mayoreo'}
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

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {/* Language Switch ES / CA (Desktop & Tablet sm+; on mobile it lives inside the dropdown sheet) */}
          <Link
            href={alternateHref}
            aria-label={`${copy.nav.languageLabel}: ${alternateLocale.toUpperCase()}`}
            className={`hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 text-xs font-bold tracking-wider uppercase transition-colors sm:inline-flex ${
              isLightMode
                ? 'border-[#1A1512]/25 text-[#1A1512] hover:bg-[#1A1512]/10'
                : 'border-[#F9F4EC]/30 text-[#F9F4EC] hover:bg-[#F9F4EC]/15'
            }`}
          >
            {locale === 'es' ? 'ES · CA' : 'CA · ES'}
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={openDrawer}
            aria-label={`${copy.nav.orderWhatsApp} (${totalCount})`}
            data-testid="navbar-order-button"
            className="!min-h-[40px] !px-3.5 !py-1.5 !text-xs lg:!min-h-[44px] lg:!px-5 lg:!py-2.5 lg:!text-sm"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 lg:hidden"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="sm:hidden">{locale === 'ca' ? 'Demanar' : 'Pedir'}</span>
            <span className="hidden sm:inline">{copy.nav.orderWhatsApp}</span>
            {totalCount > 0 && (
              <span
                data-testid="navbar-basket-count"
                className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#14110F] px-1.5 text-[11px] font-bold text-[#F9F4EC] lg:h-6 lg:min-w-[1.5rem] lg:text-xs"
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
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer lg:hidden ${
              mobileMenuOpen
                ? 'border-[#F1B24A] bg-[#F1B24A] text-[#14110F] shadow-[0_0_16px_rgba(241,178,74,0.4)]'
                : isLightMode
                  ? 'border-[#1A1512]/20 bg-[#1A1512]/6 text-[#1A1512] hover:bg-[#1A1512]/12'
                  : 'border-[#F9F4EC]/25 bg-[#F9F4EC]/10 text-[#F9F4EC] hover:bg-[#F9F4EC]/18'
            }`}
          >
            {mobileMenuOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Editorial Mobile Dropdown Sheet (< lg only) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          ref={mobileMenuRef}
          className="mx-3 mt-2 overflow-hidden rounded-[26px] border border-[#F9F4EC]/15 bg-[linear-gradient(165deg,#231B15_0%,#14110F_100%)] p-4 text-[#F9F4EC] shadow-[0_28px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl lg:hidden"
        >
          {/* Top header bar inside dropdown: Artisan badge + Segmented Language Switcher */}
          <div className="mb-3.5 flex items-center justify-between border-b border-[#F9F4EC]/10 pb-3">
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#F1B24A] uppercase">
                {locale === 'ca' ? 'Obrador Artesanal' : 'Obrador Artesanal'}
              </p>
              <p className="text-xs text-[#CBBBA8]">
                {locale === 'ca' ? 'Massa fermentada 48 h' : 'Masa fermentada 48 h'}
              </p>
            </div>

            {/* Segmented Language Pill ES / CA */}
            <div
              role="group"
              aria-label={copy.nav.languageLabel}
              className="inline-flex items-center rounded-full border border-[#F9F4EC]/15 bg-[#14110F] p-1"
            >
              <Link
                href={locale === 'es' ? (currentPath === 'carta' ? '/es/carta' : '/es') : alternateHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase transition-colors ${
                  locale === 'es'
                    ? 'bg-[#F1B24A] text-[#14110F] shadow-xs'
                    : 'text-[#CBBBA8] hover:text-[#F9F4EC]'
                }`}
              >
                ES
              </Link>
              <Link
                href={locale === 'ca' ? (currentPath === 'carta' ? '/ca/carta' : '/ca') : alternateHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase transition-colors ${
                  locale === 'ca'
                    ? 'bg-[#F1B24A] text-[#14110F] shadow-xs'
                    : 'text-[#CBBBA8] hover:text-[#F9F4EC]'
                }`}
              >
                CA
              </Link>
            </div>
          </div>

          {/* Rich Tactile Navigation Cards */}
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href={`${homePrefix}/carta`}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#F1B24A]/35 bg-[linear-gradient(135deg,rgba(241,178,74,0.16)_0%,rgba(28,22,18,0.95)_100%)] px-3.5 py-3 transition-all hover:border-[#F1B24A]/65 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1B24A]/20 text-[#F1B24A]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      <path d="M8 7h6" />
                      <path d="M8 11h8" />
                    </svg>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-heading text-base leading-tight font-bold text-[#F9F4EC] group-hover:text-[#F1B24A]">
                        {locale === 'ca' ? 'La Carta' : 'La Carta'}
                      </span>
                      <span className="rounded-full bg-[#F1B24A] px-2 py-0.5 text-[10px] font-extrabold text-[#14110F]">
                        30+
                      </span>
                    </div>
                    <span className="mt-0.5 block text-xs text-[#CBBBA8]">
                      {locale === 'ca'
                        ? 'Totes les pizzes grans, pizzetes, packs i begudes'
                        : 'Todas las pizzas grandes, pizzetas, packs y bebidas'}
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="text-lg font-bold text-[#F1B24A] transition-transform group-hover:translate-x-0.5">
                  ›
                </span>
              </Link>
            </li>

            <li>
              <Link
                href={`${homePrefix}#pizzetas`}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#F9F4EC]/10 bg-[#1C1612]/90 px-3.5 py-3 transition-all hover:border-[#EE6A2B]/50 hover:bg-[#261D17] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EE6A2B]/15 text-[#EE6A2B]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 11h.01" />
                      <path d="M11 15h.01" />
                      <path d="M16 16h.01" />
                      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
                      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-serif-heading block text-base leading-tight font-bold text-[#F9F4EC] group-hover:text-[#F1B24A]">
                      {locale === 'ca' ? 'Pizzetes des de 3 € (Promo 5+1)' : 'Pizzetas desde 3 € (Promo 5+1)'}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#CBBBA8]">
                      {locale === 'ca'
                        ? 'Paga’n 5 i emporta-te’n 6 · Individuals al moment'
                        : 'Paga 5 y llévate 6 · Individuales hechas al momento'}
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="text-lg font-bold text-[#CBBBA8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F1B24A]">
                  ›
                </span>
              </Link>
            </li>

            <li>
              <Link
                href={
                  locale === 'ca'
                    ? '/ca/pizzes-esdeveniments-festes-badalona'
                    : '/es/pizzas-eventos-fiestas-mayoreo-badalona'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#F9F4EC]/10 bg-[#1C1612]/90 px-3.5 py-3 transition-all hover:border-[#EE6A2B]/50 hover:bg-[#261D17] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EE6A2B]/15 text-[#EE6A2B]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-serif-heading block text-base leading-tight font-bold text-[#F9F4EC] group-hover:text-[#F1B24A]">
                      {locale === 'ca' ? 'Festes, Esdeveniments i Mayoreo' : 'Fiestas, Eventos y Mayoreo'}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#CBBBA8]">
                      {locale === 'ca'
                        ? 'Aniversaris, empreses i tarifes per volum'
                        : 'Cumpleaños, empresas y tarifas por volumen'}
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="text-lg font-bold text-[#CBBBA8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F1B24A]">
                  ›
                </span>
              </Link>
            </li>

            <li>
              <Link
                href={`${homePrefix}#faq`}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#F9F4EC]/10 bg-[#1C1612]/90 px-3.5 py-3 transition-all hover:border-[#EE6A2B]/50 hover:bg-[#261D17] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-serif-heading block text-base leading-tight font-bold text-[#F9F4EC] group-hover:text-[#F1B24A]">
                      {copy.nav.howToOrder}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#CBBBA8]">
                      {locale === 'ca'
                        ? '5 stickers = 1 pizza gratis · Recollida ràpida'
                        : '5 stickers = 1 pizza gratis · Recogida rápida'}
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="text-lg font-bold text-[#CBBBA8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F1B24A]">
                  ›
                </span>
              </Link>
            </li>

            <li>
              <Link
                href={`${homePrefix}#ubicacion`}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#F9F4EC]/10 bg-[#1C1612]/90 px-3.5 py-3 transition-all hover:border-[#EE6A2B]/50 hover:bg-[#261D17] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F9F4EC]/10 text-[#F1B24A]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-serif-heading block text-base leading-tight font-bold text-[#F9F4EC] group-hover:text-[#F1B24A]">
                      {copy.nav.location}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#CBBBA8]">
                      {site.addressStructured.streetAddress} · {site.addressStructured.addressLocality}
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="text-lg font-bold text-[#CBBBA8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F1B24A]">
                  ›
                </span>
              </Link>
            </li>
          </ul>

          {/* Bottom CTA & Quick Store Contact inside Dropdown */}
          <div className="mt-4 border-t border-[#F9F4EC]/10 pt-3.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openDrawer();
              }}
              className="btn-pill flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#EE6A2B] px-6 py-3 text-sm font-extrabold text-[#14110F] shadow-[0_10px_24px_rgba(238,106,43,0.35)] transition-transform active:scale-98"
            >
              <span>{copy.nav.orderWhatsApp}</span>
              {totalCount > 0 && (
                <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#14110F] px-1.5 text-xs font-bold text-[#F9F4EC]">
                  {totalCount}
                </span>
              )}
            </button>

            <div className="mt-3 flex items-center justify-between px-1 text-xs text-[#CBBBA8]">
              <span>📍 {site.addressStructured.streetAddress}, Badalona</span>
              <a
                href={`tel:${site.phoneTel}`}
                className="font-bold text-[#F1B24A] underline underline-offset-2"
              >
                {site.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
