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
    id: 'faq-horarios',
    question: {
      es: '¿Cuál es el horario de apertura de La Piccerella?',
      ca: "Quin és l'horari d'obertura de La Piccerella?",
    },
    answer: {
      es: 'De lunes a jueves abrimos por la tarde de 18:00 a 22:00. Los viernes, sábados y domingos abrimos al mediodía de 13:00 a 15:00 y por la tarde de 18:00 a 22:00 (horario pendiente de confirmación definitiva; consulta siempre el indicador "Abierto ahora" de la web).',
      ca: "De dilluns a dijous obrim a la tarda de 18:00 a 22:00. Els divendres, dissabtes i diumenges obrim al migdia de 13:00 a 15:00 i a la tarda de 18:00 a 22:00 (horari pendent de confirmació definitiva; consulta sempre l'indicador \"Obert ara\" del web).",
    },
  },
  {
    id: 'faq-como-pedir',
    question: {
      es: '¿Cómo funciona el pedido por WhatsApp?',
      ca: 'Com funciona la comanda per WhatsApp?',
    },
    answer: {
      es: 'Añade tus pizzas, pizzetas, empanadas o bebidas al carrito desde la carta, indica tu nombre y la hora de recogida preferida, y pulsa "Enviar pedido por WhatsApp". Se abrirá tu chat con el mensaje ya redactado para que lo envíes en un clic.',
      ca: 'Afegeix les teves pizzes, pizzetes, empanades o begudes a la cistella des de la carta, indica el teu nom i l’hora de recollida preferida, i prem "Enviar comanda per WhatsApp". S’obrirà el teu xat amb el missatge ja redactat perquè l’enviïs en un clic.',
    },
  },
  {
    id: 'faq-tiempo-recogida',
    question: {
      es: '¿Cuánto tarda en estar listo un pedido para recoger?',
      ca: 'Quant triga a estar llesta una comanda per recollir?',
    },
    answer: {
      es: 'Estiramos y horneamos cada pizza al momento. Normalmente tu pedido está listo para recoger en nuestro local de Carrer de Mar, 127 en unos 15–25 minutos, según el volumen del horno.',
      ca: 'Estirem i enfornem cada pizza al moment. Normalment la teva comanda està llesta per recollir al nostre local del Carrer de Mar, 127 en uns 15–25 minuts, segons el volum del forn.',
    },
  },
  {
    id: 'faq-domicilio',
    question: {
      es: '¿Hacéis reparto a domicilio en Badalona?',
      ca: 'Feu repartiment a domicili a Badalona?',
    },
    answer: {
      es: 'Por WhatsApp gestionamos pedidos para recoger en el local sin esperas. Si prefieres entrega a domicilio en Badalona, puedes pedir directamente a través de nuestro perfil oficial en Uber Eats.',
      ca: 'Per WhatsApp gestionem comandes per recollir al local sense esperes. Si prefereixes lliurament a domicili a Badalona, pots demanar directament a través del nostre perfil oficial a Uber Eats.',
    },
  },
  {
    id: 'faq-vegetarianas',
    question: {
      es: '¿Tenéis opciones vegetarianas?',
      ca: 'Teniu opcions vegetarianes?',
    },
    answer: {
      es: 'Sí. Contamos con pizzas como la Margarita, 4 Quesos o Vegetal (con tomates cherry, calabacín, cebolla y pimiento), además de las empanadas Cuatro Quesos y Queso y Cebolla.',
      ca: 'Sí. Comptem amb pizzes com la Margarita, 4 Formatges o Vegetal (amb tomàquets cherry, carbassó, ceba i pebrot), a més de les empanades Quatre Formatges i Formatge i Ceba.',
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
