export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface OpeningInterval {
  day: DayOfWeek;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  dayIndex: number;
  open: string; // HH:MM (24h)
  close: string; // HH:MM (24h)
}

export interface SiteConfig {
  name: string;
  legalDescriptor: string;
  tagline: {
    es: string;
    ca: string;
  };
  city: string;
  address: string;
  addressStructured: {
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  phone: string;
  phoneTel: string;
  phoneTodo: string;
  whatsappNumber: string;
  whatsappTodo: string;
  hours: OpeningInterval[];
  hoursVerified: boolean;
  hoursTodo: string;
  priceRange: string;
  priceRangeNote: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  googleMapsUrl: string;
  googleReviewsUrl: string;
  uberEatsUrl: string;
  logo: string;
  logoPng: string;
  serviceOptions: {
    outdoorSeating: boolean;
    vegetarianOptions: boolean;
    takeaway: boolean;
    deliveryEnabled: boolean;
  };
  geo: {
    latitude: number | null;
    longitude: number | null;
    todo: string;
  };
  googleRating: {
    ratingValue: number | null;
    reviewCount: number | null;
    updatedAt: string | null;
    todo: string;
  };
  founder: {
    name: string;
    photo: string;
    todo: string;
  };
  /**
   * Identity of the business owner, required by Spanish law (LSSI-CE art. 10,
   * RGPD art. 13) on the legal pages. Leave a field empty until the client
   * confirms it: the pages then say the detail is pending instead of guessing.
   */
  legal: {
    /** Full name or company name of the owner (titular) */
    ownerName: string;
    /** NIF / CIF */
    taxId: string;
    /** Contact e-mail for legal and data-protection requests */
    email: string;
    /** ISO date the legal texts were last revised */
    lastUpdated: string;
  };
  /** Live Google reviews (Maps JavaScript API, Places library) */
  googleReviews: {
    apiKey: string;
    placeId: string;
  };
}

export const site: SiteConfig = {
  name: 'La Piccerella',
  legalDescriptor: 'Pizzería artesanal',
  tagline: {
    es: 'Pizzas y pizzetas artesanales con masa fermentada 48 horas',
    ca: 'Pizzes i pizzetes artesanals amb massa fermentada 48 hores',
  },
  city: 'Badalona (Barcelona), Spain',
  address: 'Carrer de Mar, 127, 08911 Badalona, Barcelona',
  addressStructured: {
    streetAddress: 'Carrer de Mar, 127',
    postalCode: '08911',
    addressLocality: 'Badalona',
    addressRegion: 'Barcelona',
    addressCountry: 'ES',
  },
  phone: '+34 652 18 95 05',
  phoneTel: '+34652189505',
  phoneTodo: '',
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').trim(),
  whatsappTodo:
    'TODO: confirm WhatsApp number (652 18 95 05 is phone-only, not WhatsApp)',
  hours: [
    { day: 'Monday', dayIndex: 1, open: '18:00', close: '22:00' },
    { day: 'Tuesday', dayIndex: 2, open: '18:00', close: '22:00' },
    { day: 'Wednesday', dayIndex: 3, open: '18:00', close: '22:00' },
    { day: 'Thursday', dayIndex: 4, open: '18:00', close: '22:00' },
    { day: 'Friday', dayIndex: 5, open: '13:00', close: '15:00' },
    { day: 'Friday', dayIndex: 5, open: '18:00', close: '22:00' },
    { day: 'Saturday', dayIndex: 6, open: '13:00', close: '15:00' },
    { day: 'Saturday', dayIndex: 6, open: '18:00', close: '22:00' },
    { day: 'Sunday', dayIndex: 0, open: '13:00', close: '15:00' },
    { day: 'Sunday', dayIndex: 0, open: '18:00', close: '22:00' },
  ],
  hoursVerified: true,
  hoursTodo: '',
  priceRange: '€',
  priceRangeNote: '€ (menu items roughly 3 € to 13 €)',
  instagram: 'https://www.instagram.com/lapiccerella/',
  tiktok: 'https://www.tiktok.com/@lapiccerella',
  facebook: 'https://www.facebook.com/p/La-Piccerella-61589755973899/',
  googleMapsUrl: 'https://maps.app.goo.gl/PJh888twWznGGoMK8',
  googleReviewsUrl:
    'https://www.google.com/maps/place/La+Piccerella/@41.4474134,2.2476003,17z/data=!4m8!3m7!1s0x12a4bbbf7512d5ab:0xf24e2254c45b2a3c!8m2!3d41.4474134!4d2.2501806!9m1!1b1!16s%2Fg%2F11vzly3gd7',
  uberEatsUrl:
    'https://www.ubereats.com/es/store/pizzeria-la-piccerella/riXHQ3fdSB-9hv5_KcdIfw',
  logo: '/brand/logo.webp',
  logoPng: '/brand/logo.png',
  serviceOptions: {
    outdoorSeating: true,
    vegetarianOptions: true,
    takeaway: true,
    deliveryEnabled: process.env.NEXT_PUBLIC_DELIVERY_ENABLED === 'true',
  },
  geo: {
    latitude: 41.4474134,
    longitude: 2.2501806,
    todo: 'Verified Google Maps pin coordinates for Carrer de Mar, 127, 08911 Badalona',
  },
  googleRating: {
    ratingValue: 5.0,
    reviewCount: 859,
    updatedAt: 'Nov 2026',
    todo: '',
  },
  founder: {
    name: 'Gustavo',
    photo: '/images/real/founder-gustavo.webp',
    todo: 'TODO: confirm founder bio quote and exact opening year with Gustavo',
  },
  legal: {
    ownerName: 'TODO AL PASO S.L.',
    taxId: 'B70943469',
    email: 'todoalpasoslu@gmail.com',
    lastUpdated: '2026-11-25',
  },
  googleReviews: {
    apiKey: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '').trim(),
    placeId: (process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID ?? '').trim(),
  },
};
