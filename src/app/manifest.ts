import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.legalDescriptor} Badalona`,
    short_name: site.name,
    description: site.tagline.es,
    start_url: '/es',
    display: 'standalone',
    background_color: '#14110F',
    theme_color: '#14110F',
    icons: [
      {
        src: '/brand/logo.png',
        sizes: '280x280',
        type: 'image/png',
      },
    ],
  };
}
