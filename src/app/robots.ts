import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

export default function robots(): MetadataRoute.Robots {
  const isPreview =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_NOINDEX === 'true';

  if (isPreview) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
