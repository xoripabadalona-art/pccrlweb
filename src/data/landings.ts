import { site } from './site';
import { getMenuItemById, menuItems } from './menu';
import type { Locale } from './copy';

/**
 * Focused landing pages: one page per thing people actually search for
 * ("empanadas argentinas Badalona", "pizza para llevar Badalona", the family
 * pack). Every fact here comes from the menu data or from statements already
 * published elsewhere on the site — prices and counts are computed, not typed.
 */

export type LandingId = 'empanadas' | 'para-llevar' | 'pack';

export interface LandingSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Render as numbered steps instead of bullets */
  ordered?: boolean;
  link?: { label: string; href: string; external?: boolean };
}

export interface LandingContent {
  id: LandingId;
  slug: string;
  /** <title>, kept under 60 characters */
  metaTitle: string;
  /** Meta description, 140–160 characters */
  metaDescription: string;
  eyebrow: string;
  h1: string;
  lead: string;
  itemsHeading: string;
  itemIds: string[];
  /** Show the full list of pizza names (pack page: the flavours to choose from) */
  showPizzaNames?: string;
  sections: LandingSection[];
  faqs: { question: string; answer: string }[];
  /** Short label for links to this page from elsewhere */
  linkLabel: string;
  linkBlurb: string;
}

export const LANDING_IDS: LandingId[] = ['empanadas', 'para-llevar', 'pack'];

const SLUGS: Record<LandingId, Record<Locale, string>> = {
  empanadas: { es: 'empanadas-argentinas-badalona', ca: 'empanades-argentines-badalona' },
  'para-llevar': { es: 'pizza-para-llevar-badalona', ca: 'pizza-per-emportar-badalona' },
  pack: { es: 'pack-degustacion-pizzas', ca: 'pack-degustacio-pizzes' },
};

export function getLandingSlug(id: LandingId, locale: Locale) {
  return SLUGS[id][locale];
}

export function getLandingPath(id: LandingId, locale: Locale) {
  return `/${locale}/${SLUGS[id][locale]}`;
}

export function findLandingId(locale: Locale, slug: string): LandingId | undefined {
  return LANDING_IDS.find((id) => SLUGS[id][locale] === slug);
}

/** 1250 → "12,50 €" (same format as the menu, without importing client code) */
function euros(cents: number) {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}

const EMPANADA_IDS = menuItems.filter((i) => i.category === 'empanadas').map((i) => i.id);
const pizzas = menuItems.filter((i) => i.category === 'pizzas');
const pizzaPrices = pizzas.map((p) => p.priceCents);
const cheapestPizza = Math.min(...pizzaPrices);
const dearestPizza = Math.max(...pizzaPrices);

const empanada = getMenuItemById('empanada-carne');
const unitPrice = empanada?.sizes?.find((s) => s.id === '1-ud')?.priceCents ?? 300;
const halfDozen = empanada?.sizes?.find((s) => s.id === '6-uds')?.priceCents ?? 1500;
const dozen = empanada?.sizes?.find((s) => s.id === '12-uds')?.priceCents ?? 3000;
const packPrice = getMenuItemById('pack-degustacion-familiar')?.priceCents ?? 3499;
const sliceFrom = getMenuItemById('pizzeta-margarita')?.priceCents ?? 300;
const street = site.addressStructured.streetAddress;

function empanadas(locale: Locale): LandingContent {
  const base = {
    id: 'empanadas' as const,
    slug: SLUGS.empanadas[locale],
    itemIds: EMPANADA_IDS,
  };

  if (locale === 'ca') {
    return {
      ...base,
      metaTitle: 'Empanades argentines a Badalona | La Piccerella',
      metaDescription: `Empanades argentines a Badalona: carn tallada a ganivet, pollastre, pernil i formatge i dues de vegetarianes. Des de ${euros(unitPrice)}. Recull-les al ${street}.`,
      eyebrow: 'Recepta de tradició argentina',
      h1: 'Empanades argentines a Badalona',
      lead: `${EMPANADA_IDS.length} sabors fets al nostre obrador del ${street}. Emporta-te'n una per ${euros(unitPrice)}, mitja dotzena per ${euros(halfDozen)} o una dotzena per ${euros(dozen)}.`,
      itemsHeading: 'Les nostres empanades',
      sections: [
        {
          heading: `${EMPANADA_IDS.length} farcits per triar`,
          paragraphs: [
            "La de carn porta vedella tallada a ganivet, ceba blanca i tendra, ou dur i espècies, a l'estil tradicional argentí. La de pollastre segueix la mateixa base.",
            'Si prefereixes formatge, tens la de pernil dolç amb mozzarella, la de quatre formatges (cabra, blau, mozzarella i emmental amb nou moscada) i la de ceba caramel·litzada amb mozzarella.',
          ],
        },
        {
          heading: 'Per unitat, mitja dotzena o dotzena',
          list: [
            `1 unitat: ${euros(unitPrice)}`,
            `Mitja dotzena (6 unitats): ${euros(halfDozen)}`,
            `Dotzena (12 unitats): ${euros(dozen)}`,
          ],
          paragraphs: [
            `A partir de mitja dotzena, cada empanada surt a ${euros(Math.round(halfDozen / 6))}.`,
          ],
        },
        {
          heading: 'Vegetarianes i al·lèrgens',
          paragraphs: [
            "La de quatre formatges i la de formatge i ceba són vegetarianes. Totes porten gluten; les de carn i pollastre porten ou, i les de formatge, lactis. Si tens una al·lèrgia, indica-ho a les notes de la comanda.",
          ],
        },
      ],
      faqs: [
        {
          question: 'Quant costen les empanades?',
          answer: `${euros(unitPrice)} la unitat, ${euros(halfDozen)} la mitja dotzena i ${euros(dozen)} la dotzena.`,
        },
        {
          question: 'Teniu empanades vegetarianes?',
          answer: 'Sí, dues: la de quatre formatges i la de formatge i ceba caramel·litzada.',
        },
        {
          question: 'Com les demano?',
          answer: `Afegeix-les a la comanda, indica el teu nom i l'hora de recollida i envia el missatge per WhatsApp. Les reculls al ${street}, Badalona.`,
        },
      ],
      linkLabel: 'Empanades argentines',
      linkBlurb: `${EMPANADA_IDS.length} sabors des de ${euros(unitPrice)}`,
    };
  }

  return {
    ...base,
    metaTitle: 'Empanadas argentinas en Badalona | La Piccerella',
    metaDescription: `Empanadas argentinas en Badalona: carne cortada a cuchillo, pollo, jamón y queso y dos vegetarianas. Desde ${euros(unitPrice)}. Recógelas en ${street}.`,
    eyebrow: 'Receta de tradición argentina',
    h1: 'Empanadas argentinas en Badalona',
    lead: `${EMPANADA_IDS.length} sabores hechos en nuestro obrador de ${street}. Llévate una por ${euros(unitPrice)}, media docena por ${euros(halfDozen)} o una docena por ${euros(dozen)}.`,
    itemsHeading: 'Nuestras empanadas',
    sections: [
      {
        heading: `${EMPANADA_IDS.length} rellenos para elegir`,
        paragraphs: [
          'La de carne lleva ternera cortada a cuchillo, cebolla blanca y verde, huevo duro y especias, al estilo tradicional argentino. La de pollo sigue la misma base.',
          'Si prefieres queso, tienes la de jamón dulce con mozzarella, la de cuatro quesos (cabra, azul, mozzarella y emmental con nuez moscada) y la de cebolla caramelizada con mozzarella.',
        ],
      },
      {
        heading: 'Por unidad, media docena o docena',
        list: [
          `1 unidad: ${euros(unitPrice)}`,
          `Media docena (6 unidades): ${euros(halfDozen)}`,
          `Docena (12 unidades): ${euros(dozen)}`,
        ],
        paragraphs: [
          `A partir de media docena, cada empanada sale a ${euros(Math.round(halfDozen / 6))}.`,
        ],
      },
      {
        heading: 'Vegetarianas y alérgenos',
        paragraphs: [
          'La de cuatro quesos y la de queso y cebolla son vegetarianas. Todas llevan gluten; las de carne y pollo llevan huevo, y las de queso, lácteos. Si tienes una alergia, indícalo en las notas del pedido.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Cuánto cuestan las empanadas?',
        answer: `${euros(unitPrice)} la unidad, ${euros(halfDozen)} la media docena y ${euros(dozen)} la docena.`,
      },
      {
        question: '¿Tenéis empanadas vegetarianas?',
        answer: 'Sí, dos: la de cuatro quesos y la de queso y cebolla caramelizada.',
      },
      {
        question: '¿Cómo las pido?',
        answer: `Añádelas al pedido, indica tu nombre y la hora de recogida y envía el mensaje por WhatsApp. Las recoges en ${street}, Badalona.`,
      },
    ],
    linkLabel: 'Empanadas argentinas',
    linkBlurb: `${EMPANADA_IDS.length} sabores desde ${euros(unitPrice)}`,
  };
}

function paraLlevar(locale: Locale): LandingContent {
  const base = {
    id: 'para-llevar' as const,
    slug: SLUGS['para-llevar'][locale],
    itemIds: [
      'pizza-pepperoni',
      'pizza-margarita',
      'pizza-4-quesos',
      'pizza-barbacoa',
      'pizza-carbonara',
      'pizzeta-margarita',
    ],
  };

  if (locale === 'ca') {
    return {
      ...base,
      metaTitle: 'Pizza per emportar a Badalona | La Piccerella',
      metaDescription: `Pizza per emportar a Badalona: demana per WhatsApp i recull-la al ${street}. Massa fermentada 48 h, ${pizzas.length} pizzes senceres i porcions des de ${euros(sliceFrom)}.`,
      eyebrow: 'Recollida al local',
      h1: 'Pizza per emportar a Badalona',
      lead: `Tria la teva pizza, envia la comanda per WhatsApp i passa a recollir-la acabada de fer pel ${street}.`,
      itemsHeading: 'Per començar la comanda',
      sections: [
        {
          heading: 'Com funciona',
          ordered: true,
          list: [
            'Tria a la carta i afegeix a la comanda el que vulguis.',
            "Indica el teu nom i l'hora de recollida que prefereixis i envia el missatge per WhatsApp.",
            `Recull la comanda al ${street}. Normalment està a punt en uns 15–25 minuts, segons el volum del forn.`,
          ],
        },
        {
          heading: 'Pizza sencera o porció',
          paragraphs: [
            `A la carta hi ha ${pizzas.length} pizzes senceres, d'entre ${euros(cheapestPizza)} i ${euros(dearestPizza)}. Si vas amb pressa o vols tastar, la porció de Margarita surt per ${euros(sliceFrom)}.`,
          ],
        },
        {
          heading: 'Massa de 48 hores',
          paragraphs: [
            "La massa reposa 48 hores en fred abans d'estirar-la. Aquesta fermentació lenta li dona més sabor i una base fina, lleugera i cruixent. Cada pizza s'estira i es cou en el moment.",
          ],
        },
        {
          heading: "Prefereixes que te la portin a casa?",
          paragraphs: [
            'Per WhatsApp preparem comandes per recollir. El repartiment a domicili a Badalona es fa a través del nostre perfil a Uber Eats.',
          ],
          link: { label: 'Demanar a domicili a Uber Eats', href: site.uberEatsUrl, external: true },
        },
      ],
      faqs: [
        {
          question: 'Quant triga a estar a punt la comanda?',
          answer: `Normalment uns 15–25 minuts, segons el volum del forn. Cada pizza s'estira i es cou en el moment.`,
        },
        {
          question: 'Puc demanar per a una hora concreta?',
          answer: "Sí. En enviar la comanda pots triar l'hora de recollida que prefereixis o deixar «com més aviat millor».",
        },
        {
          question: 'Feu repartiment a domicili?',
          answer: 'Per WhatsApp gestionem comandes per recollir al local. Per rebre-la a casa, demana a través d’Uber Eats.',
        },
      ],
      linkLabel: 'Pizza per emportar',
      linkBlurb: 'Demana per WhatsApp i recull-la',
    };
  }

  return {
    ...base,
    metaTitle: 'Pizza para llevar en Badalona | La Piccerella',
    metaDescription: `Pizza para llevar en Badalona: pide por WhatsApp y recógela en ${street}. Masa fermentada 48 h, ${pizzas.length} pizzas enteras y porciones desde ${euros(sliceFrom)}.`,
    eyebrow: 'Recogida en el local',
    h1: 'Pizza para llevar en Badalona',
    lead: `Elige tu pizza, envía el pedido por WhatsApp y pasa a recogerla recién hecha por ${street}.`,
    itemsHeading: 'Para empezar tu pedido',
    sections: [
      {
        heading: 'Cómo funciona',
        ordered: true,
        list: [
          'Elige en la carta y añade al pedido lo que quieras.',
          'Indica tu nombre y la hora de recogida que prefieras y envía el mensaje por WhatsApp.',
          `Recoge el pedido en ${street}. Normalmente está listo en unos 15–25 minutos, según el volumen del horno.`,
        ],
      },
      {
        heading: 'Pizza entera o porción',
        paragraphs: [
          `En la carta hay ${pizzas.length} pizzas enteras, de entre ${euros(cheapestPizza)} y ${euros(dearestPizza)}. Si vas con prisa o quieres probar, la porción de Margarita sale por ${euros(sliceFrom)}.`,
        ],
      },
      {
        heading: 'Masa de 48 horas',
        paragraphs: [
          'La masa reposa 48 horas en frío antes de estirarla. Esa fermentación lenta le da más sabor y una base fina, ligera y crujiente. Cada pizza se estira y se hornea al momento.',
        ],
      },
      {
        heading: '¿Prefieres que te la lleven a casa?',
        paragraphs: [
          'Por WhatsApp preparamos pedidos para recoger. El reparto a domicilio en Badalona se hace a través de nuestro perfil en Uber Eats.',
        ],
        link: { label: 'Pedir a domicilio en Uber Eats', href: site.uberEatsUrl, external: true },
      },
    ],
    faqs: [
      {
        question: '¿Cuánto tarda en estar listo el pedido?',
        answer: 'Normalmente unos 15–25 minutos, según el volumen del horno. Cada pizza se estira y se hornea al momento.',
      },
      {
        question: '¿Puedo pedir para una hora concreta?',
        answer: 'Sí. Al enviar el pedido puedes elegir la hora de recogida que prefieras o dejar «lo antes posible».',
      },
      {
        question: '¿Hacéis reparto a domicilio?',
        answer: 'Por WhatsApp gestionamos pedidos para recoger en el local. Para recibirla en casa, pide a través de Uber Eats.',
      },
    ],
    linkLabel: 'Pizza para llevar',
    linkBlurb: 'Pide por WhatsApp y recógela',
  };
}

function pack(locale: Locale): LandingContent {
  const base = {
    id: 'pack' as const,
    slug: SLUGS.pack[locale],
    itemIds: ['pack-degustacion-familiar'],
  };
  const threeDearest = dearestPizza * 3;

  if (locale === 'ca') {
    return {
      ...base,
      metaTitle: `Pack degustació: 3 pizzes per ${euros(packPrice)} | La Piccerella`,
      metaDescription: `Pack Degustació Familiar a Badalona: 3 pizzes grans a triar per ${euros(packPrice)}, amb massa fermentada 48 h. Demana per WhatsApp i recull al ${street}.`,
      eyebrow: 'Per compartir a casa',
      h1: `Pack degustació familiar: 3 pizzes grans per ${euros(packPrice)}`,
      lead: `Tres pizzes senceres a triar entre les ${pizzas.length} de la carta, amb la nostra massa de 48 hores.`,
      itemsHeading: 'Afegeix el pack a la comanda',
      showPizzaNames: 'Sabors per triar',
      sections: [
        {
          heading: 'Què inclou',
          list: [
            'Tres pizzes grans, senceres, a la teva elecció.',
            'Massa fina de fermentació lenta (48 hores), estirada i cuita en el moment.',
            `Preu tancat: ${euros(packPrice)}.`,
          ],
        },
        {
          heading: 'Com indicar els sabors',
          paragraphs: [
            "Afegeix el pack a la comanda i escriu els tres sabors a les notes abans d'enviar el missatge per WhatsApp. El recolliràs al local.",
          ],
        },
        {
          heading: 'Què estalvies',
          paragraphs: [
            `Tres pizzes de ${euros(dearestPizza)} demanades per separat sumen ${euros(threeDearest)}; amb el pack en pagues ${euros(packPrice)}.`,
          ],
        },
      ],
      faqs: [
        {
          question: 'Puc triar les tres pizzes?',
          answer: 'Sí: són tres pizzes grans a la teva elecció. Indica els sabors a les notes de la comanda.',
        },
        {
          question: 'Com el demano?',
          answer: `Afegeix el pack a la comanda, escriu els tres sabors a les notes i envia el missatge per WhatsApp. El reculls al ${street}, Badalona.`,
        },
      ],
      linkLabel: 'Pack degustació',
      linkBlurb: `3 pizzes grans per ${euros(packPrice)}`,
    };
  }

  return {
    ...base,
    metaTitle: `Pack degustación: 3 pizzas por ${euros(packPrice)} | La Piccerella`,
    metaDescription: `Pack Degustación Familiar en Badalona: 3 pizzas grandes a elegir por ${euros(packPrice)}, con masa fermentada 48 h. Pide por WhatsApp y recoge en ${street}.`,
    eyebrow: 'Para compartir en casa',
    h1: `Pack degustación familiar: 3 pizzas grandes por ${euros(packPrice)}`,
    lead: `Tres pizzas enteras a elegir entre las ${pizzas.length} de la carta, con nuestra masa de 48 horas.`,
    itemsHeading: 'Añade el pack a tu pedido',
    showPizzaNames: 'Sabores para elegir',
    sections: [
      {
        heading: 'Qué incluye',
        list: [
          'Tres pizzas grandes, enteras, a tu elección.',
          'Masa fina de fermentación lenta (48 horas), estirada y horneada al momento.',
          `Precio cerrado: ${euros(packPrice)}.`,
        ],
      },
      {
        heading: 'Cómo indicar los sabores',
        paragraphs: [
          'Añade el pack al pedido y escribe los tres sabores en las notas antes de enviar el mensaje por WhatsApp. Lo recogerás en el local.',
        ],
      },
      {
        heading: 'Qué te ahorras',
        paragraphs: [
          `Tres pizzas de ${euros(dearestPizza)} pedidas por separado suman ${euros(threeDearest)}; con el pack pagas ${euros(packPrice)}.`,
        ],
      },
    ],
    faqs: [
      {
        question: '¿Puedo elegir las tres pizzas?',
        answer: 'Sí: son tres pizzas grandes a tu elección. Indica los sabores en las notas del pedido.',
      },
      {
        question: '¿Cómo lo pido?',
        answer: `Añade el pack al pedido, escribe los tres sabores en las notas y envía el mensaje por WhatsApp. Lo recoges en ${street}, Badalona.`,
      },
    ],
    linkLabel: 'Pack degustación',
    linkBlurb: `3 pizzas grandes por ${euros(packPrice)}`,
  };
}

export function getLanding(id: LandingId, locale: Locale): LandingContent {
  if (id === 'para-llevar') return paraLlevar(locale);
  if (id === 'pack') return pack(locale);
  return empanadas(locale);
}

/** Names of every whole pizza, for the pack page */
export function getPizzaNames(locale: Locale) {
  return pizzas.map((p) => ({ id: p.id, name: p.name[locale] }));
}
