import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCopy, isValidLocale, locales, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import {
  LEGAL_DOC_IDS,
  formatLegalDate,
  getLegalDoc,
  type LegalDocId,
} from '@/data/legal';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/sections/Footer';
import { BasketDrawer } from '@/components/basket/BasketDrawer';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

export function legalStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function resolveLocale(raw: string): Locale {
  return isValidLocale(raw) ? raw : 'es';
}

export async function buildLegalMetadata(
  id: LegalDocId,
  params: Promise<{ locale: string }>
): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const doc = getLegalDoc(id, locale);
  return {
    title: `${doc.title} | ${site.name}`,
    description: doc.intro,
    // Useful to visitors, not as a search result
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/${id}`,
      languages: {
        'es-ES': `${siteUrl}/es/${id}`,
        'ca-ES': `${siteUrl}/ca/${id}`,
      },
    },
  };
}

export async function LegalPageView({
  id,
  params,
}: {
  id: LegalDocId;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const copy = getCopy(locale);
  const doc = getLegalDoc(id, locale);
  const others = LEGAL_DOC_IDS.filter((other) => other !== id).map((other) =>
    getLegalDoc(other, locale)
  );

  return (
    <>
      <Navbar
        locale={locale}
        currentPath="carta"
        alternateHref={`/${locale === 'es' ? 'ca' : 'es'}/${id}`}
      />

      <main id="main-content" className="flex-1 bg-[#F4EBDD] pt-24 text-[#1A1512]">
        <article className="mx-auto max-w-3xl px-4 pt-6 pb-20 md:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#574B42]"
          >
            <Link href={`/${locale}`} className="underline hover:text-[#A8241B]">
              {site.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#1A1512]">
              {doc.title}
            </span>
          </nav>

          <header className="mb-10 border-b border-[#1A1512]/15 pb-8">
            <h1 className="font-serif-heading text-3xl font-bold md:text-5xl">{doc.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-[#574B42]">{doc.intro}</p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-[#574B42] uppercase">
              {locale === 'ca' ? 'Última revisió' : 'Última revisión'}: {formatLegalDate(locale)}
            </p>
          </header>

          <div className="flex flex-col gap-10">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif-heading mb-3 text-xl font-bold md:text-2xl">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mb-3 text-[15px] leading-relaxed text-[#3A312B]">
                    {paragraph}
                  </p>
                ))}

                {section.rows && (
                  <dl className="mt-1 overflow-hidden rounded-2xl border border-[#1A1512]/12 bg-[#FAF5ED]">
                    {section.rows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-1 gap-1 border-b border-[#1A1512]/10 px-5 py-3.5 last:border-b-0 sm:grid-cols-[13rem_1fr] sm:gap-4"
                      >
                        <dt className="text-sm font-bold break-words text-[#1A1512]">{row.label}</dt>
                        <dd className="text-sm leading-relaxed break-words text-[#3A312B]">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.list && (
                  <ul className="mt-1 flex list-disc flex-col gap-2.5 pl-5 text-[15px] leading-relaxed text-[#3A312B] marker:text-[#A8241B]">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <footer className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#1A1512]/15 pt-6 text-sm">
            <span className="font-bold text-[#1A1512]">{copy.footer.legalTitle}:</span>
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/${locale}/${other.id}`}
                className="font-semibold text-[#A8241B] underline underline-offset-4 hover:text-[#1A1512]"
              >
                {other.title}
              </Link>
            ))}
          </footer>
        </article>
      </main>

      <Footer locale={locale} />
      <BasketDrawer locale={locale} />
    </>
  );
}
