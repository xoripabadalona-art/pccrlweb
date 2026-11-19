import React from 'react';
import Link from 'next/link';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';

export interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const copy = getCopy(locale);
  const homePrefix = `/${locale}`;

  return (
    <footer
      data-theme="dark"
      className="border-t border-[#F9F4EC]/12 bg-[#14110F] text-[#F9F4EC]"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & NAP summary */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={site.logo}
                alt={`${site.name} — ${site.legalDescriptor}`}
                width={56}
                height={56}
                loading="lazy"
                className="h-14 w-14 rounded-full bg-[#F4EBDD] object-contain"
              />
              <div>
                <p className="font-serif-heading text-xl font-bold">{site.name}</p>
                <p className="text-xs font-medium tracking-wider text-[#CBBBA8] uppercase">
                  {site.legalDescriptor}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#CBBBA8]">
              {copy.footer.tagline}
            </p>
          </div>

          {/* Col 2: Exact NAP matching Google Business Profile character for character */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
              {copy.footer.contactTitle}
            </h2>
            <address className="not-italic flex flex-col gap-2.5 text-sm text-[#F9F4EC]">
              <p className="font-bold" data-testid="footer-nap-name">
                {site.name}
              </p>
              <p data-testid="footer-nap-address">{site.address}</p>
              <p>
                <a
                  href={`tel:${site.phoneTel}`}
                  data-testid="footer-nap-phone"
                  className="underline decoration-[#EE6A2B] underline-offset-4 hover:text-[#EE6A2B]"
                >
                  {site.phone}
                </a>
              </p>
              <p className="text-xs text-[#CBBBA8]">{site.phoneTodo}</p>
            </address>
          </div>

          {/* Col 3: Internal Navigation & Language Switch */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
              {copy.footer.navigationTitle}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href={`${homePrefix}#carta`} className="hover:text-[#EE6A2B]">
                  {copy.nav.menu}
                </Link>
              </li>
              <li>
                <Link href={`${homePrefix}/carta`} className="hover:text-[#EE6A2B]">
                  {copy.nav.fullMenuPage} (/carta)
                </Link>
              </li>
              <li>
                <Link href={`${homePrefix}#ubicacion`} className="hover:text-[#EE6A2B]">
                  {copy.nav.location}
                </Link>
              </li>
              <li>
                <Link href={`${homePrefix}#faq`} className="hover:text-[#EE6A2B]">
                  {copy.faqSection.eyebrow}
                </Link>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#F9F4EC]/20 px-3 py-1 text-xs">
                  <Link
                    href="/es"
                    className={
                      locale === 'es'
                        ? 'font-bold text-[#EE6A2B]'
                        : 'text-[#CBBBA8] hover:text-[#F9F4EC]'
                    }
                  >
                    Español
                  </Link>
                  <span aria-hidden="true">·</span>
                  <Link
                    href="/ca"
                    className={
                      locale === 'ca'
                        ? 'font-bold text-[#EE6A2B]'
                        : 'text-[#CBBBA8] hover:text-[#F9F4EC]'
                    }
                  >
                    Català
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Social links (rel="me noopener") & legal pages */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
              {copy.footer.socialTitle}
            </h2>
            <ul className="mb-6 flex flex-col gap-2.5 text-sm">
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#EE6A2B]"
                >
                  <span>Instagram (@lapiccerella)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={site.tiktok}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#EE6A2B]"
                >
                  <span>TikTok (@lapiccerella)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={site.uberEatsUrl}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#EE6A2B]"
                >
                  <span>Uber Eats</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li className="text-xs text-[#CBBBA8]">
                Facebook: {site.facebook}
              </li>
            </ul>

            <h2 className="mb-2 text-xs font-bold tracking-widest text-[#CBBBA8] uppercase">
              {copy.footer.legalTitle}
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#CBBBA8]">
              <li>
                <Link
                  href={`/${locale}/aviso-legal`}
                  className="underline underline-offset-2 hover:text-[#EE6A2B]"
                >
                  {copy.footer.avisoLegal}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacidad`}
                  className="underline underline-offset-2 hover:text-[#EE6A2B]"
                >
                  {copy.footer.privacidad}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cookies`}
                  className="underline underline-offset-2 hover:text-[#EE6A2B]"
                >
                  {copy.footer.cookies}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#F9F4EC]/10 pt-6 flex flex-col items-center justify-between gap-3 text-xs text-[#CBBBA8] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name} ({site.legalDescriptor}).{' '}
            {copy.footer.rights}
          </p>
          <p>{site.address}</p>
        </div>
      </div>
    </footer>
  );
}
