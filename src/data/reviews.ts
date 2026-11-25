import { site } from './site';

export interface CustomerReview {
  id: string;
  author: string;
  badge?: string;
  rating: number;
  date: string;
  text: string;
  permalink: string;
}

/**
 * Verified Google Maps customer reviews (surnames abbreviated to initial for privacy).
 */
export const customerReviews: CustomerReview[] = [
  {
    id: 'rev-cristina-n',
    author: 'Cristina N.',
    rating: 5,
    date: 'Nov 2026',
    text: 'Muy buena impresión. El concepto es original y la masa, que fermenta 48 horas, es muy ligera y sabrosa. Probamos varios tipos de pizza y todas estaban deliciosas. Está a cinco minutos de la playa y también puedes pedir para llevar. Repetiremos.',
    permalink: site.googleReviewsUrl,
  },
  {
    id: 'rev-toni-e',
    author: 'Toni E.',
    badge: 'Local Guide',
    rating: 5,
    date: 'Nov 2026',
    text: 'Es genial ver cómo este local ha sabido reinventarse sin perder su esencia. Si antes hacían un choripán espectacular, su nueva etapa como pizzería es directamente de diez. Todo es súper artesanal y el sabor de las pizzas es increíble. Mención aparte merece el local, con un ambiente muy agradable, y el propietario, cuya amabilidad marca la diferencia.',
    permalink: site.googleReviewsUrl,
  },
  {
    id: 'rev-joan-m',
    author: 'Joan M.',
    rating: 5,
    date: 'Nov 2026',
    text: 'Pizzas y empanadas muy ricas, con masa fina y buenos ingredientes. Probamos varios sabores y todos estaban espectaculares. Servicio muy amable y rápido. Una pizzería para repetir en Badalona.',
    permalink: site.googleReviewsUrl,
  },
  {
    id: 'rev-malena-b',
    author: 'Malena B.',
    badge: 'Local Guide',
    rating: 5,
    date: 'Nov 2026',
    text: 'Riquísima pizza nos encantó! El picante también súper rico, lugar impecable muchas gracias! Volveremos.',
    permalink: site.googleReviewsUrl,
  },
];
