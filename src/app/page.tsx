import React from 'react';
import type { Metadata } from 'next';
import { copyEs } from '@/data/copy.es';
import { site } from '@/data/site';
import LocaleHomePage from './[locale]/page';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

// "/" shows the Spanish home page. Tell search engines the original lives at
// /es so the two addresses are not treated as duplicate pages.
export const metadata: Metadata = {
  title: copyEs.seo.homeTitle,
  description: copyEs.seo.homeDescription,
  alternates: {
    canonical: `${siteUrl}/es`,
    languages: {
      'es-ES': `${siteUrl}/es`,
      'ca-ES': `${siteUrl}/ca`,
      'x-default': `${siteUrl}/es`,
    },
  },
  openGraph: {
    title: copyEs.seo.homeTitle,
    description: copyEs.seo.homeDescription,
    url: `${siteUrl}/es`,
    siteName: site.name,
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.legalDescriptor} Badalona`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: copyEs.seo.homeTitle,
    description: copyEs.seo.homeDescription,
    images: [`${siteUrl}/images/og-default.jpg`],
  },
};

export default function RootPage() {
  return <LocaleHomePage params={Promise.resolve({ locale: 'es' })} />;
}
