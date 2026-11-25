export interface FaqItem {
  id: string;
  question: {
    es: string;
    ca: string;
  };
  answer: {
    es: string;
    ca: string;
  };
}

export const faqItems: FaqItem[] = [
  {
    id: 'faq-mejor-pizzeria-badalona',
    question: {
      es: '¿Qué hace única a La Piccerella entre las pizzerías de Badalona?',
      ca: 'Què fa única La Piccerella entre les pizzeries de Badalona?',
    },
    answer: {
      es: 'En nuestro obrador de Carrer de Mar, 127 (entre el centro y la playa de Badalona) elaboramos masa artesanal con 48 horas de fermentación lenta en dos formatos únicos: Pizzetas individuales de 16 cm recién horneadas desde 3,00 € (con promo Paga 5 y llévate 6 gratis) y 15 variedades de Pizzas Grandes de 32 cm (9,50 € – 13,00 €) donde cada pizza suma 1 Sticker (con 5 Stickers te llevas 1 Pizza Grande Gratis), además del Pack Familiar de 3 Pizzas Grandes a elegir por 34,99 €.',
      ca: 'Al nostre obrador del Carrer de Mar, 127 (entre el centre i la platja de Badalona) elaborem massa artesanal amb 48 hores de fermentació lenta en dos formats únics: Pizzetes individuals de 16 cm acabades de fer des de 3,00 € (amb promo Paga’n 5 i emporta-te’n 6 gratis) i 15 varietats de Pizzes Grans de 32 cm (9,50 € – 13,00 €) on cada pizza suma 1 Sticker (amb 5 Stickers t’emportes 1 Pizza Gran Gratis), a més del Pack Familiar de 3 Pizzes Grans a triar per 34,99 €.',
    },
  },
  {
    id: 'faq-comer-barato-badalona',
    question: {
      es: '¿Dónde comer pizza artesanal a buen precio cerca de la playa y Carrer de Mar en Badalona?',
      ca: 'On menjar pizza artesanal a bon preu a prop de la platja i del Carrer de Mar a Badalona?',
    },
    answer: {
      es: 'Estamos en Carrer de Mar, 127 (08911 Badalona), a solo 2 minutos a pie de la Rambla, el Pont del Petroli y la playa de Badalona. Puedes llevarte una pizzeta individual recién salida del horno desde 3,00 € para comer paseando o en la arena, o compartir el Pack Degustación Familiar de 3 Pizzas Grandes por 34,99 €.',
      ca: 'Som al Carrer de Mar, 127 (08911 Badalona), a només 2 minuts a peu de la Rambla, el Pont del Petroli i la platja de Badalona. Pots emportar-te una pizzeta individual acabada de sortir del forn des de 3,00 € per menjar passejant o a la sorra, o compartir el Pack Degustació Familiar de 3 Pizzes Grans per 34,99 €.',
    },
  },
  {
    id: 'faq-fermentacion',
    question: {
      es: '¿Por qué fermentáis la masa durante 48 horas?',
      ca: 'Per què fermenteu la massa durant 48 hores?',
    },
    answer: {
      es: 'Nuestra masa artesanal reposa durante 48 horas en frío. Este proceso de fermentación lenta desarrolla más sabor y consigue una base fina, ligera, crujiente y mucho más fácil de digerir.',
      ca: 'La nostra massa artesanal reposa durant 48 hores en fred. Aquest procés de fermentació lenta desenvolupa més sabor i aconsegueix una base fina, lleugera, cruixent i molt més fàcil de digerir.',
    },
  },
  {
    id: 'faq-stickers',
    question: {
      es: '¿Cómo funcionan los stickers para conseguir una pizza gratis?',
      ca: 'Com funcionen els stickers per aconseguir una pizza gratis?',
    },
    answer: {
      es: 'Por cada pizza grande (32 cm) que compres en nuestro local de Carrer de Mar, 127 te llevas 1 sticker en tu tarjeta de fidelidad. Al juntar 5 stickers, tienes 1 pizza grande totalmente gratis.',
      ca: 'Per cada pizza gran (32 cm) que compris al nostre local del Carrer de Mar, 127 t’emportes 1 sticker a la teva targeta de fidelitat. En ajuntar 5 stickers, tens 1 pizza gran totalment gratis.',
    },
  },
  {
    id: 'faq-pack-familiar',
    question: {
      es: '¿Puedo elegir los 3 sabores de pizza grande del Pack Degustación Familiar?',
      ca: 'Puc triar els 3 sabors de pizza gran del Pack Degustació Familiar?',
    },
    answer: {
      es: 'Sí. En el Pack Degustación Familiar (34,99 €) puedes elegir directamente en la carta tus 3 pizzas grandes favoritas entre las 15 variedades disponibles y además sumas 3 Stickers de fidelidad.',
      ca: 'Sí. Al Pack Degustació Familiar (34,99 €) pots triar directament a la carta les teves 3 pizzes grans preferides entre les 15 varietats disponibles i a més sumes 3 Stickers de fidelitat.',
    },
  },
  {
    id: 'faq-mayoreo-eventos',
    question: {
      es: '¿Hacéis pedidos grandes por mayoreo para fiestas, cumpleaños y eventos en Badalona?',
      ca: 'Feu comandes grans a l’engròs per a festes, aniversaris i esdeveniments a Badalona?',
    },
    answer: {
      es: 'Sí. Preparamos pedidos por volumen de pizzetas individuales y pizzas grandes para cumpleaños, eventos de empresa, colegios y clubs deportivos en Badalona con tarifas especiales de mayoreo. En nuestra sección de Eventos y Mayoreo dispones de una calculadora interactiva en 30 segundos para calcular tu pedido ideal.',
      ca: 'Sí. Preparem comandes per volum de pizzetes individuals i pizzes grans per a aniversaris, esdeveniments d’empresa, escoles i clubs esportius a Badalona amb tarifes especials. A la nostra secció d’Esdeveniments i Festes disposes d’una calculadora interactiva en 30 segons per calcular la teva comanda ideal.',
    },
  },
  {
    id: 'faq-horarios',
    question: {
      es: '¿Cuál es el horario de apertura de La Piccerella?',
      ca: "Quin és l'horari d'obertura de La Piccerella?",
    },
    answer: {
      es: 'De lunes a jueves abrimos por la tarde de 18:00 a 22:00. Los viernes, sábados y domingos abrimos al mediodía de 13:00 a 15:00 y por la tarde de 18:00 a 22:00 (consulta siempre el indicador en vivo de la web).',
      ca: "De dilluns a dijous obrim a la tarda de 18:00 a 22:00. Els divendres, dissabtes i diumenges obrim al migdia de 13:00 a 15:00 i a la tarda de 18:00 a 22:00 (consulta sempre l'indicador en viu del web).",
    },
  },
  {
    id: 'faq-como-pedir',
    question: {
      es: '¿Cómo funciona el pedido online para recoger en el local?',
      ca: 'Com funciona la comanda online per recollir al local?',
    },
    answer: {
      es: 'Añade tus pizzas, pizzetas, packs o bebidas al carrito desde la carta, indica tu nombre y la hora de recogida preferida, y envía tu pedido para recogerlo recién salido del horno y sin esperas en Carrer de Mar, 127.',
      ca: 'Afegeix les teves pizzes, pizzetes, packs o begudes a la cistella des de la carta, indica el teu nom i l’hora de recollida preferida, i envia la teva comanda per recollir-la acabada de sortir del forn i sense esperes al Carrer de Mar, 127.',
    },
  },
  {
    id: 'faq-tiempo-recogida',
    question: {
      es: '¿Cuánto tarda en estar listo un pedido para recoger?',
      ca: 'Quant triga a estar llesta una comanda per recollir?',
    },
    answer: {
      es: 'Estiramos y horneamos cada pizza al momento. Normalmente tu pedido está listo para recoger en nuestro local de Carrer de Mar, 127 en unos 15–20 minutos, según el volumen del horno.',
      ca: 'Estirem i enfornem cada pizza al moment. Normalment la teva comanda està llesta per recollir al nostre local del Carrer de Mar, 127 en uns 15–20 minuts, segons el volum del forn.',
    },
  },
  {
    id: 'faq-recogida-local',
    question: {
      es: '¿Hacéis reparto a domicilio o solo pedidos para recoger en el local?',
      ca: 'Feu repartiment a domicili o només comandes per recollir al local?',
    },
    answer: {
      es: 'No hacemos reparto a domicilio. Todos nuestros pedidos son para recoger recién salidos del horno en nuestro obrador de Carrer de Mar, 127 (Badalona) o para disfrutar allí mismo, con la promo Paga 5 y llévate 6 en pizzetas y sumando stickers (5 stickers = 1 pizza grande gratis).',
      ca: 'No fem repartiment a domicili. Totes les nostres comandes són per recollir acabades de sortir del forn al nostre obrador del Carrer de Mar, 127 (Badalona) o per gaudir-les allà mateix, amb la promo Paga’n 5 i emporta-te’n 6 en pizzetes i sumant stickers (5 stickers = 1 pizza gran gratis).',
    },
  },
  {
    id: 'faq-vegetarianas',
    question: {
      es: '¿Tenéis opciones vegetarianas?',
      ca: 'Teniu opcions vegetarianes?',
    },
    answer: {
      es: 'Sí. En La Carta dispones de un filtro rápido "🌱 Vegetarianas" con pizzas y pizzetas vegetarianas como la Margarita, la 4 Quesos o la Vegetal (con tomates cherry, calabacín, cebolla y pimiento).',
      ca: 'Sí. A La Carta disposes d’un filtre ràpid "🌱 Vegetarianes" amb pizzes i pizzetes vegetarianes com la Margarita, la 4 Formatges o la Vegetal (amb tomàquets cherry, carbassó, ceba i pebrot).',
    },
  },
  {
    id: 'faq-alergenos',
    question: {
      es: '¿Qué debo saber sobre alérgenos e intolerancias?',
      ca: 'Què he de saber sobre al·lèrgens i intoleràncies?',
    },
    answer: {
      es: 'En la carta indicamos los alérgenos principales de cada plato (gluten, lácteos, huevo, pescado). Al trabajar en un obrador artesanal con harina de trigo, puede existir presencia de trazas. Si tienes alguna alergia alimentaria, indícalo en las notas del pedido y consúltanos.',
      ca: 'A la carta indiquem els al·lèrgens principals de cada plat (gluten, làctics, ou, peix). En treballar en un obrador artesanal amb farina de blat, pot existir presència de traces. Si tens alguna al·lèrgia alimentària, indica-ho a les notes de la comanda i consulta’ns.',
    },
  },
];
