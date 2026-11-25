import type { MetadataRoute } from 'next';
import { locales } from '@/data/copy';
import { LANDING_IDS, getLandingPath } from '@/data/landings';

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
          'x-default': `${siteUrl}/es`,
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
          'x-default': `${siteUrl}/es`,
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
          'x-default': `${siteUrl}/es/carta`,
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
          'x-default': `${siteUrl}/es/carta`,
        },
      },
    },
    // Focused pages, each with its own translated address
    ...LANDING_IDS.flatMap((id) =>
      locales.map((locale) => ({
        url: `${siteUrl}${getLandingPath(id, locale)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            'es-ES': `${siteUrl}${getLandingPath(id, 'es')}`,
            'ca-ES': `${siteUrl}${getLandingPath(id, 'ca')}`,
            'x-default': `${siteUrl}${getLandingPath(id, 'es')}`,
          },
        },
      }))
    ),
  ];
}
