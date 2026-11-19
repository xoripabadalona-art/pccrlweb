import { ImageResponse } from 'next/og';
import { site } from '@/data/site';
import { getCopy, isValidLocale, locales, type Locale } from '@/data/copy';

export const dynamic = 'force-static';
export const alt = 'La Piccerella — Pizzería artesanal en Badalona';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'es';
  const copy = getCopy(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#14110F',
          color: '#F9F4EC',
          padding: '64px',
          border: '12px solid #1F1813',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: '#EE6A2B',
              color: '#14110F',
              padding: '10px 24px',
              borderRadius: '9999px',
              fontSize: 22,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {site.legalDescriptor} · Badalona
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#CBBBA8',
              fontWeight: 600,
            }}
          >
            {site.addressStructured.streetAddress}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#F4EBDD',
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.3,
              color: '#CBBBA8',
              maxWidth: '920px',
            }}
          >
            {site.tagline[locale]}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(244,235,221,0.18)',
            paddingTop: '28px',
            fontSize: 24,
            color: '#F4EBDD',
          }}
        >
          <div>{site.address}</div>
          <div
            style={{
              color: '#25D366',
              fontWeight: 700,
            }}
          >
            {copy.nav.orderWhatsApp}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
