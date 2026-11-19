import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${siteUrl}/es`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          'es-ES': `${siteUrl}/es`,
          'ca-ES': `${siteUrl}/ca`,
        },
      },
    },
    {
      url: `${siteUrl}/ca`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'es-ES': `${siteUrl}/es`,
          'ca-ES': `${siteUrl}/ca`,
        },
      },
    },
    {
      url: `${siteUrl}/es/carta`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'es-ES': `${siteUrl}/es/carta`,
          'ca-ES': `${siteUrl}/ca/carta`,
        },
      },
    },
    {
      url: `${siteUrl}/ca/carta`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: {
        languages: {
          'es-ES': `${siteUrl}/es/carta`,
          'ca-ES': `${siteUrl}/ca/carta`,
        },
      },
    },
  ];
}
