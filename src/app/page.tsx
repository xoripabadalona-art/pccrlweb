import React from 'react';
import type { Metadata } from 'next';
import LocaleHomePage from './[locale]/page';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

// "/" shows the Spanish home page. Tell search engines the original lives at
// /es so the two addresses are not treated as duplicate pages.
export const metadata: Metadata = {
  alternates: {
    canonical: `${siteUrl}/es`,
    languages: {
      'es-ES': `${siteUrl}/es`,
      'ca-ES': `${siteUrl}/ca`,
      'x-default': `${siteUrl}/es`,
    },
  },
};

export default function RootPage() {
  return <LocaleHomePage params={Promise.resolve({ locale: 'es' })} />;
}
