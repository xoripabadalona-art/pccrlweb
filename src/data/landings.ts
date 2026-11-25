import { site } from './site';
import { getMenuItemById, getPizzetas, menuItems } from './menu';
import { PIZZETA_PROMO } from '../lib/promo';
import type { Locale } from './copy';

/**
 * Focused landing pages: one page per thing people actually search for
 * ("pizzetas Badalona", "pizza para llevar Badalona", the family
 * pack). Every fact here comes from the menu data or from statements already
 * published elsewhere on the site — prices and counts are computed, not typed.
 */

export type LandingId = 'pizzetas' | 'para-llevar' | 'pack' | 'mayoreo' | 'centro-playa';

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

export const LANDING_IDS: LandingId[] = [
  'pizzetas',
  'para-llevar',
  'pack',
  'mayoreo',
  'centro-playa',
];

const SLUGS: Record<LandingId, Record<Locale, string>> = {
  pizzetas: { es: 'pizzetas-badalona', ca: 'pizzetes-badalona' },
  'para-llevar': { es: 'pizza-para-llevar-badalona', ca: 'pizza-per-emportar-badalona' },
  pack: { es: 'pack-degustacion-pizzas', ca: 'pack-degustacio-pizzes' },
  mayoreo: {
    es: 'pizzas-eventos-fiestas-mayoreo-badalona',
    ca: 'pizzes-esdeveniments-festes-badalona',
  },
  'centro-playa': {
    es: 'pizzeria-carrer-de-mar-playa-badalona',
    ca: 'pizzeria-carrer-de-mar-platja-badalona',
  },
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

const pizzas = menuItems.filter((i) => i.category === 'pizzas');
const pizzaPrices = pizzas.map((p) => p.priceCents);
const cheapestPizza = Math.min(...pizzaPrices);
const dearestPizza = Math.max(...pizzaPrices);

const packPrice = getMenuItemById('pack-degustacion-familiar')?.priceCents ?? 3499;
const sliceFrom = getMenuItemById('pizzeta-margarita')?.priceCents ?? 300;
const street = site.addressStructured.streetAddress;

function pizzetas(locale: Locale): LandingContent {
  const range = getPizzetas();
  const tiers = [...new Set(range.map((p) => p.priceCents))].sort((a, b) => a - b);
  const from = tiers[0] ?? 300;
  const tierList = tiers.map((t) => euros(t));
  const names = (cents: number) =>
    range
      .filter((p) => p.priceCents === cents)
      .map((p) =>
        p.name[locale]
          .replace(/^Pizzeta\s+/i, '')
          .replace(/^Porci[oó]n?\s+/i, '')
          .replace(/\s*\(Pizzeta\)\s*$/i, '')
      )
      .join(', ');
  const base = {
    id: 'pizzetas' as const,
    slug: SLUGS.pizzetas[locale],
    itemIds: range.map((p) => p.id),
  };
  const { pay, get } = PIZZETA_PROMO;

  if (locale === 'ca') {
    return {
      ...base,
      metaTitle: `Pizzetes a Badalona des de ${euros(from)} | La Piccerella`,
      metaDescription: `Pizzetes artesanals a Badalona des de ${euros(from)}. Promo: paga'n ${pay} i emporta-te'n ${get}. Massa fermentada 48 h, fetes al moment. Recull-les al ${street}.`,
      eyebrow: 'Les més demanades',
      h1: `Pizzetes a Badalona des de ${euros(from)}`,
      lead: `Individuals i fetes al moment amb la nostra massa de 48 hores. Paga'n ${pay} i emporta-te'n ${get}.`,
      itemsHeading: 'Tria les teves pizzetes',
      sections: [
        {
          heading: `Promo: paga'n ${pay} i emporta-te'n ${get}`,
          list: [
            `Per cada ${get} pizzetes del mateix preu, una et surt gratis.`,
            'Pots combinar sabors, sempre que siguin del mateix preu.',
            `Es repeteix: amb ${get * 2} pizzetes del mateix preu, dues són gratis.`,
            'També val per a les comandes per WhatsApp: el descompte surt calculat al missatge.',
          ],
        },
        {
          heading: 'Sabors i preus',
          list: tiers.map((t) => `${euros(t)}: ${names(t)}`),
        },
        {
          heading: 'Fetes al moment',
          paragraphs: [
            "La massa reposa 48 hores en fred abans d'estirar-la. Cada pizzeta s'estira i es cou en el moment, amb una base fina, lleugera i cruixent.",
          ],
        },
        {
          heading: 'Com demanar-les',
          ordered: true,
          list: [
            'Afegeix les pizzetes que vulguis a la comanda.',
            "Indica el teu nom i l'hora de recollida i envia el missatge per WhatsApp.",
            `Recull-les al ${street}, Badalona.`,
          ],
        },
      ],
      faqs: [
        {
          question: 'Quant costen les pizzetes?',
          answer: `Depèn del sabor: ${tierList.join(' o ')}.`,
        },
        {
          question: 'Com funciona la promo?',
          answer: `Paga'n ${pay} i emporta-te'n ${get}: per cada ${get} pizzetes del mateix preu, una és gratis. Es pot repetir i val també per WhatsApp.`,
        },
        {
          question: 'Puc barrejar sabors a la promo?',
          answer: 'Sí, mentre siguin pizzetes del mateix preu.',
        },
      ],
      linkLabel: 'Pizzetes',
      linkBlurb: `Des de ${euros(from)} · paga'n ${pay}, emporta-te'n ${get}`,
    };
  }

  return {
    ...base,
    metaTitle: `Pizzetas en Badalona desde ${euros(from)} | La Piccerella`,
    metaDescription: `Pizzetas artesanales en Badalona desde ${euros(from)}. Promo: paga ${pay} y llévate ${get}. Masa fermentada 48 h, hechas al momento. Recógelas en ${street}.`,
    eyebrow: 'Las más pedidas',
    h1: `Pizzetas en Badalona desde ${euros(from)}`,
    lead: `Individuales y hechas al momento con nuestra masa de 48 horas. Paga ${pay} y llévate ${get}.`,
    itemsHeading: 'Elige tus pizzetas',
    sections: [
      {
        heading: `Promo: paga ${pay} y llévate ${get}`,
        list: [
          `Por cada ${get} pizzetas del mismo precio, una te sale gratis.`,
          'Puedes combinar sabores, siempre que sean del mismo precio.',
          `Se repite: con ${get * 2} pizzetas del mismo precio, dos son gratis.`,
          'También vale para los pedidos por WhatsApp: el descuento sale calculado en el mensaje.',
        ],
      },
      {
        heading: 'Sabores y precios',
        list: tiers.map((t) => `${euros(t)}: ${names(t)}`),
      },
      {
        heading: 'Hechas al momento',
        paragraphs: [
          'La masa reposa 48 horas en frío antes de estirarla. Cada pizzeta se estira y se hornea al momento, con una base fina, ligera y crujiente.',
        ],
      },
      {
        heading: 'Cómo pedirlas',
        ordered: true,
        list: [
          'Añade al pedido las pizzetas que quieras.',
          'Indica tu nombre y la hora de recogida y envía el mensaje por WhatsApp.',
          `Recógelas en ${street}, Badalona.`,
        ],
      },
    ],
    faqs: [
      {
        question: '¿Cuánto cuestan las pizzetas?',
        answer: `Depende del sabor: ${tierList.join(' o ')}.`,
      },
      {
        question: '¿Cómo funciona la promo?',
        answer: `Paga ${pay} y llévate ${get}: por cada ${get} pizzetas del mismo precio, una es gratis. Se puede repetir y vale también por WhatsApp.`,
      },
      {
        question: '¿Puedo mezclar sabores en la promo?',
        answer: 'Sí, mientras sean pizzetas del mismo precio.',
      },
    ],
    linkLabel: 'Pizzetas',
    linkBlurb: `Desde ${euros(from)} · paga ${pay}, llévate ${get}`,
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
          heading: 'Targeta de Fidelitat: 5 Stickers = 1 Pizza Gratis',
          list: [
            'Per cada pizza gran (32 cm) que recullis al local et portes 1 sticker.',
            'En reunir 5 stickers, tens 1 pizza gran totalment gratis.',
            'Demanant directament per WhatsApp i recollint al local gaudeixes dels preus reals de carta sense recàrrecs d’apps externes.',
          ],
        },
      ],
      faqs: [
        {
          question: 'Quant triga a estar a punt la comanda?',
          answer: `Normalment uns 15–25 minuts, segons el volum del forn. Cada pizza s'estira i es cou en el moment.`,
        },
        {
          question: 'Com funcionen els stickers per aconseguir una pizza gratis?',
          answer: 'Per cada pizza gran que demanis al local et donem 1 sticker. Quan ajuntes 5 stickers, et regalem 1 pizza gran gratis.',
        },
        {
          question: 'Puc demanar per a una hora concreta?',
          answer: "Sí. En enviar la comanda pots triar l'hora de recollida que prefereixis o deixar «com més aviat millor».",
        },
      ],
      linkLabel: 'Pizza per emportar',
      linkBlurb: '5 stickers = 1 pizza gratis',
    };
  }

  return {
    ...base,
    metaTitle: 'Pizza para llevar en Badalona | La Piccerella',
    metaDescription: `Pizza para llevar en Badalona: pide por WhatsApp y recógela en ${street}. Masa fermentada 48 h, ${pizzas.length} pizzas enteras y porciones desde ${euros(sliceFrom)}.`,
    eyebrow: 'Recogida en el local · 5 Stickers = 1 Pizza Gratis',
    h1: 'Pizza para llevar en Badalona',
    lead: `Elige tu pizza, envía el pedido por WhatsApp y pasa a recogerla recién hecha por ${street}. Por cada pizza grande suma 1 sticker y llévate 1 pizza gratis al juntar 5.`,
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
        heading: 'Tarjeta de Fidelidad: 5 Stickers = 1 Pizza Gratis',
        list: [
          'Por cada pizza grande (32 cm) que recojas en el local te llevas 1 sticker.',
          'Al juntar 5 stickers, te llevas 1 pizza grande totalmente gratis.',
          'Pidiendo directamente por WhatsApp para recoger disfrutas de precios de carta sin comisiones de apps de reparto y de la pizza recién salida del horno.',
        ],
      },
      {
        heading: 'Pizza entera o pizzeta individual',
        paragraphs: [
          `En la carta hay ${pizzas.length} pizzas enteras, de entre ${euros(cheapestPizza)} y ${euros(dearestPizza)}. Si vas con prisa o quieres probar, tienes nuestras pizzetas individuales desde ${euros(sliceFrom)} (con promo paga 5 y llévate 6).`,
        ],
      },
      {
        heading: 'Masa de 48 horas',
        paragraphs: [
          'La masa reposa 48 horas en frío antes de estirarla. Esa fermentación lenta le da más sabor y una base fina, ligera y crujiente. Cada pizza se estira y se hornea al momento.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Cuánto tarda en estar listo el pedido?',
        answer: 'Normalmente unos 15–25 minutos, según el volumen del horno. Cada pizza se estira y se hornea al momento.',
      },
      {
        question: '¿Cómo funcionan los stickers para tener una pizza gratis?',
        answer: 'Por cada pizza grande que compres te entregamos 1 sticker. Al reunir 5 stickers, te llevas 1 pizza grande gratis.',
      },
      {
        question: '¿Puedo pedir para una hora concreta?',
        answer: 'Sí. Al enviar el pedido puedes elegir la hora de recogida que prefieras o dejar «lo antes posible».',
      },
    ],
    linkLabel: 'Pizza para llevar',
    linkBlurb: '5 stickers = 1 pizza gratis',
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

function mayoreo(locale: Locale): LandingContent {
  const base = {
    id: 'mayoreo' as const,
    slug: SLUGS.mayoreo[locale],
    itemIds: [
      'pack-degustacion-familiar',
      'pizzeta-margarita',
      'pizzeta-pepperoni',
      'pizzeta-prosciutto-funghi',
      'pizza-pepperoni',
      'pizza-4-quesos',
    ],
  };

  if (locale === 'ca') {
    return {
      ...base,
      metaTitle: 'Pizzes per a Esdeveniments i Festes | La Piccerella',
      metaDescription: `Pizzes i pizzetes a l’engròs per a festes, aniversaris i esdeveniments a Badalona. Massa fermentada 48 h i preus especials per volum al ${street}.`,
      eyebrow: 'Aniversaris, empreses, escoles i grups',
      h1: 'Pizzes i pizzetes a l’engròs per a festes i esdeveniments a Badalona',
      lead: `Organitza el teu aniversari, reunió d’empresa, festa escolar o celebració a Badalona amb les nostres pizzetes individuals i pizzes grans de massa fermentada 48 hores. Pressupost a mida per volum.`,
      itemsHeading: 'Formats estrella per a festes i grups',
      showPizzaNames: '15 varietats de pizza per combinar',
      sections: [
        {
          heading: 'Per què les nostres pizzetes i pizzes triomfen a les festes?',
          list: [
            'Pizzetes individuals (~16 cm) fetes al moment: format ideal per a càtering i aniversaris sense necessitat de plats ni coberts.',
            `6 sabors de pizzeta (Margarita, Pepperoni, Prosciutto, Prosciutto e Funghi, Barbacoa i Mexicana) i ${pizzas.length} varietats de pizza gran (32 cm).`,
            'Massa artesanal amb 48 hores de fermentació lenta: lleugera, esponjosa i boníssima fins i tot per a grups grans.',
          ],
        },
        {
          heading: 'Tarifes especials per volum (Mayoreo) amb en Gustavo',
          paragraphs: [
            `Per a comandes petites ja comptes amb la promo Paga’n 5 i emporta-te’n 6 en pizzetes (des de ${euros(sliceFrom)}) i el Pack Familiar de 3 Pizzes Grans per ${euros(packPrice)}.`,
            'Per a comandes grans d’esdeveniments, festes infantils, clubs esportius, escoles o oficines, preparem un preu especial per volum ajustat a la quantitat que necessitis.',
          ],
        },
        {
          heading: 'Com demanar pressupost per al teu esdeveniment',
          ordered: true,
          list: [
            `Escriu-nos per WhatsApp o truca’ns al ${site.phone} indicant la data de la festa i el nombre aproximat de persones.`,
            'En Gustavo t’assessorarà sobre la combinació ideal de pizzetes i pizzes grans i et tancarà un pressupost a mida.',
            `El dia de l’esdeveniment ho enfornem tot al moment perquè ho recullis calent i puntual al ${street}, Badalona.`,
          ],
        },
      ],
      faqs: [
        {
          question: 'Feu preus especials per volum per a festes i esdeveniments?',
          answer: 'Sí. Per a aniversaris, empreses, escoles o grups grans a Badalona fem pressupostos personalitzats segons la quantitat de pizzetes o pizzes grans.',
        },
        {
          question: 'Amb quanta antelació cal reservar una comanda gran?',
          answer: 'Recomanem avisar amb almenys 24–48 hores d’antelació per preparar totes les boles de massa amb la nostra fermentació lenta de 48 hores.',
        },
        {
          question: 'Quanta quantitat recomaneu per persona?',
          answer: 'Per a pica-pica o aniversaris es calculen unes 2 pizzetes individuals per persona, o 1 pizza gran (32 cm) per cada 2–3 persones.',
        },
      ],
      linkLabel: 'Festes i esdeveniments',
      linkBlurb: 'Comandes grans i preus per volum',
    };
  }

  return {
    ...base,
    metaTitle: 'Pizzas para Eventos, Fiestas y Mayoreo | La Piccerella',
    metaDescription: `Pizzas y pizzetas por mayoreo para fiestas, cumpleaños y eventos en Badalona. Masa fermentada 48 h y precios especiales por volumen en ${street}.`,
    eyebrow: 'Cumpleaños, empresas, colegios y grupos',
    h1: 'Pizzas y pizzetas por mayoreo para fiestas y eventos en Badalona',
    lead: 'Organiza tu cumpleaños, evento de empresa, fiesta escolar o celebración en Badalona con nuestras pizzetas individuales y pizzas grandes de masa fermentada 48 horas. Presupuesto a medida por volumen.',
    itemsHeading: 'Formatos estrella para fiestas y grupos',
    showPizzaNames: '15 variedades de pizza para combinar',
    sections: [
      {
        heading: '¿Por qué nuestras pizzetas y pizzas triunfan en fiestas y eventos?',
        list: [
          'Pizzetas individuales (~16 cm) recién horneadas: el formato perfecto para cumpleaños, eventos y picoteos sin necesidad de platos ni cubiertos.',
          `6 sabores de pizzeta (Margarita, Pepperoni, Prosciutto, Prosciutto e Funghi, Barbacoa y Mexicana) y ${pizzas.length} variedades de pizza grande (32 cm).`,
          'Masa artesanal con 48 horas de fermentación lenta: ligera, tierna y de fácil digestión para niños y adultos.',
        ],
      },
      {
        heading: 'Precios especiales por volumen (Mayoreo) con Gustavo',
        paragraphs: [
          `Para reuniones pequeñas ya cuentas con la promo Paga 5 y llévate 6 en pizzetas (desde ${euros(sliceFrom)}) y el Pack Familiar de 3 Pizzas Grandes por ${euros(packPrice)}.`,
          'Para pedidos grandes de mayoreo (cumpleaños, fiestas privadas, colegios, clubes deportivos, rodajes o empresas), acordamos contigo una tarifa especial por volumen según la cantidad.',
        ],
      },
      {
        heading: 'Cómo pedir presupuesto para tu evento en Badalona',
        ordered: true,
        list: [
          `Escríbenos por WhatsApp o llámanos al ${site.phone} indicando la fecha del evento y el número aproximado de personas.`,
          'Gustavo te ayudará a calcular la combinación ideal de pizzetas y pizzas grandes y te dará un presupuesto cerrado a medida.',
          `El día de la celebración horneamos todo a la hora acordada para que lo recojas recién salido del horno en ${street}, Badalona.`,
        ],
      },
    ],
    faqs: [
      {
        question: '¿Hacéis precios especiales de mayoreo para fiestas y eventos?',
        answer: 'Sí. Para cumpleaños, empresas, colegios o grupos grandes en Badalona preparamos presupuestos personalizados por volumen según la cantidad de pizzetas o pizzas grandes.',
      },
      {
        question: '¿Con cuánta antelación debo encargar un pedido grande?',
        answer: 'Recomendamos reservar con al menos 24–48 horas de antelación para preparar todas las bolas de masa con nuestra fermentación lenta de 48 horas.',
      },
      {
        question: '¿Qué cantidad recomendáis por persona en una fiesta?',
        answer: 'Para picoteo o cumpleaños suelen calcularse 2 pizzetas individuales por persona, o 1 pizza grande (32 cm) por cada 2–3 personas.',
      },
    ],
    linkLabel: 'Fiestas, eventos y mayoreo',
    linkBlurb: 'Cumpleaños, empresas y pedidos por volumen',
  };
}

function centroPlaya(locale: Locale): LandingContent {
  const base = {
    id: 'centro-playa' as const,
    slug: SLUGS['centro-playa'][locale],
    itemIds: [
      'pizzeta-margarita',
      'pizzeta-pepperoni',
      'pizza-pepperoni',
      'pizza-margarita',
      'pizza-prosciutto-funghi',
      'pack-degustacion-familiar',
    ],
  };

  if (locale === 'ca') {
    return {
      ...base,
      metaTitle: 'Pizzeria al Carrer de Mar i Platja Badalona | La Piccerella',
      metaDescription: `Pizzeria artesanal al ${street} (Badalona Centre), a 2 min de la Rambla i la platja. Pizzes 48 h, pizzetes des de 3 € i 5 stickers = 1 pizza gratis.`,
      eyebrow: 'Badalona Centre · Carrer de Mar, 127',
      h1: 'Pizzeria artesanal al Carrer de Mar i a prop de la platja de Badalona',
      lead: `Al bell mig del passeig de vianants del ${street}, a 2 minuts de la Rambla de Badalona, la Platja dels Pescadors i el metro L2 Badalona Pompeu Fabra.`,
      itemsHeading: 'Les més demanades al centre de Badalona',
      sections: [
        {
          heading: 'A dos passos de la Rambla i la platja de Badalona',
          paragraphs: [
            `El nostre obrador és al ${street} (08911 Badalona), al cor comercial del barri del Centre i a tocar de Casagemes, Dalt de la Vila i el Pont del Petroli.`,
            'Tant si passeges pel Carrer de Mar com si puges de la platja, pots endur-te una pizzeta individual acabada de fer des de 3,00 € o encarregar les teves pizzes grans per WhatsApp.',
          ],
        },
        {
          heading: '5 Stickers = 1 Pizza Gran Gratis i Promo 5+1 en Pizzetes',
          list: [
            'Pizzetes individuals des de 3,00 €: paga’n 5 i emporta-te’n 6 del mateix preu.',
            'Targeta de Stickers en pizzes grans: 1 sticker per cada pizza gran i 1 pizza gratis en ajuntar-ne 5.',
            `Pack Degustació Familiar: 3 pizzes grans a escollir per ${euros(packPrice)}.`,
          ],
        },
      ],
      faqs: [
        {
          question: 'On sou exactament a Badalona?',
          answer: `Som al ${street}, 08911 Badalona, a 2 minuts a peu de la Rambla i la platja i a 3 minuts de la parada de Metro L2 Badalona Pompeu Fabra.`,
        },
        {
          question: 'Es pot demanar per endur a la platja o a casa?',
          answer: 'Sí! Tant les pizzetes individuals com les pizzes grans es lliuren en caixa calenta, ideals per gaudir a la platja, a la Rambla o a casa.',
        },
      ],
      linkLabel: 'Carrer de Mar i Platja',
      linkBlurb: 'Al centre de Badalona, a 2 min del mar',
    };
  }

  return {
    ...base,
    metaTitle: 'Pizzería en Carrer de Mar y Playa Badalona | La Piccerella',
    metaDescription: `Pizzería artesanal en ${street} (Badalona Centro), a 2 min de la Rambla y la playa. Pizzas 48 h, pizzetas desde 3 € y 5 stickers = 1 pizza gratis.`,
    eyebrow: 'Badalona Centro · Carrer de Mar, 127',
    h1: 'Pizzería artesanal en Carrer de Mar y cerca de la playa de Badalona',
    lead: `En pleno paseo peatonal de ${street}, a 2 minutos de la Rambla de Badalona, la Platja dels Pescadors y el metro L2 Badalona Pompeu Fabra.`,
    itemsHeading: 'Las más pedidas en el centro de Badalona',
    sections: [
      {
        heading: 'A dos pasos de la Rambla y la playa de Badalona',
        paragraphs: [
          `Nuestro obrador está en ${street} (08911 Badalona), en el corazón peatonal del barrio del Centro y muy cerca de Casagemes, Dalt de la Vila y el Pont del Petroli.`,
          'Tanto si paseas por Carrer de Mar como si subes de la playa, puedes llevarte una pizzeta individual recién horneada desde 3,00 € o encargar tus pizzas grandes por WhatsApp sin esperas.',
        ],
      },
      {
        heading: '5 Stickers = 1 Pizza Grande Gratis y Promo 5+1 en Pizzetas',
        list: [
          'Pizzetas individuales desde 3,00 €: paga 5 y llévate 6 del mismo precio.',
          'Tarjeta de Stickers en pizzas grandes: 1 sticker por cada pizza grande y 1 pizza gratis al juntar 5.',
          `Pack Degustación Familiar: 3 pizzas grandes a elegir por ${euros(packPrice)}.`,
        ],
      },
    ],
    faqs: [
      {
        question: '¿Dónde estáis exactamente en Badalona?',
        answer: `Estamos en ${street}, 08911 Badalona, a 2 minutos a pie de la Rambla y la playa y a 3 minutos de la parada de Metro L2 Badalona Pompeu Fabra.`,
      },
      {
        question: '¿Se puede pedir para llevar a la playa o a casa?',
        answer: '¡Sí! Tanto las pizzetas individuales como las pizzas grandes se entregan recién salidas del horno, ideales para disfrutar en el paseo marítimo, la playa o en casa.',
      },
    ],
    linkLabel: 'Carrer de Mar y Playa',
    linkBlurb: 'En el centro de Badalona, a 2 min del mar',
  };
}

export function getLanding(id: LandingId, locale: Locale): LandingContent {
  if (id === 'pizzetas') return pizzetas(locale);
  if (id === 'para-llevar') return paraLlevar(locale);
  if (id === 'mayoreo') return mayoreo(locale);
  if (id === 'centro-playa') return centroPlaya(locale);
  return pack(locale);
}

/** Names of every whole pizza, for the pack page */
export function getPizzaNames(locale: Locale) {
  return pizzas.map((p) => ({ id: p.id, name: p.name[locale] }));
}
