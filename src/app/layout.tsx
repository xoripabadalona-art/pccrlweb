import React from 'react';
import localFont from 'next/font/local';
import type { Metadata, Viewport } from 'next';
import { site } from '@/data/site';
import { copyEs } from '@/data/copy.es';
import './globals.css';

const fraunces = localFont({
  src: '../fonts/Fraunces-Latin.woff2',
  variable: '--font-serif',
  display: 'swap',
  weight: '400 800',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const inter = localFont({
  src: '../fonts/Inter-Latin.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '400 700',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);
const gscVerification = (process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '').trim();

export const viewport: Viewport = {
  themeColor: '#14110F',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: copyEs.seo.homeTitle,
  description: copyEs.seo.homeDescription,
  applicationName: site.name,
  ...(gscVerification ? { verification: { google: gscVerification } } : {}),
  icons: {
    icon: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-[#14110F] text-[#F9F4EC] antialiased">
        {children}
      </body>
    </html>
  );
}
