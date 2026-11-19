import React from 'react';
import { notFound } from 'next/navigation';
import { isValidLocale, locales, type Locale } from '@/data/copy';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale: Locale = locale;

  return (
    <SmoothScrollProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(validLocale)};`,
        }}
      />
      <div lang={validLocale} className="flex min-h-screen flex-col">
        {children}
      </div>
    </SmoothScrollProvider>
  );
}
