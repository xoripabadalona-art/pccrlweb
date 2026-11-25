export interface LocaleCopy {
  locale: 'es' | 'ca';
  seo: {
    homeTitle: string;
    homeDescription: string;
    cartaTitle: string;
    cartaDescription: string;
  };
  nav: {
    menu: string;
    howToOrder: string;
    location: string;
    fullMenuPage: string;
    orderWhatsApp: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    openBasketLabel: string;
    languageLabel: string;
  };
  heroStory: {
    h1: string;
    subtitle: string;
    ctaMenu: string;
    ctaWhatsApp: string;
    slide1Label: string;
    slide2Label: string;
    scrollHint: string;
  };
  introCream: {
    eyebrow: string;
    heading: string;
    body: string;
    addButton: string;
    viewAllLink: string;
  };
  signatureHero: {
    eyebrow: string;
    heading: string;
    body: string;
    ctaOrder: string;
  };
  explodedPizza: {
    eyebrow: string;
    heading: string;
    subheading: string;
    srDescription: string;
    ctaAfterExplode: string;
    callouts: {
      id: string;
      badge: string;
      title: string;
      detail: string;
      layerIndex: number;
    }[];
  };
  menuSection: {
    eyebrow: string;
    heading: string;
    subheading: string;
    viewFullPageLink: string;
    allergensLabel: string;
    vegetarianBadge: string;
    sizeLabel: string;
    addToOrder: string;
    addedFeedback: string;
  };
  storySection: {
    eyebrow: string;
    heading: string;
    lead: string;
    bullets: string[];
    todoNotice: string;
  };
  reviewsSection: {
    eyebrow: string;
    heading: string;
    body: string;
    ctaReadGoogle: string;
    ctaWriteGoogle: string;
    ratingSuffix: string;
    noReviewsYet: string;
  };
  locationSection: {
    eyebrow: string;
    heading: string;
    addressLabel: string;
    phoneLabel: string;
    hoursLabel: string;
    hoursUnverifiedNote: string;
    directionsButton: string;
    deliveryUberEats: string;
    openNow: string;
    closedNow: string;
    opensAt: string;
    days: Record<string, string>;
  };
  faqSection: {
    eyebrow: string;
    heading: string;
    subheading: string;
  };
  basket: {
    drawerTitle: string;
    closeLabel: string;
    emptyTitle: string;
    emptyBody: string;
    browseMenuCta: string;
    closedBannerPrefix: string;
    closedBannerSuffix: string;
    totalLabel: string;
    clearBasket: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    modeLabel: string;
    modePickup: string;
    modeDelivery: string;
    deliveryUberNotice: string;
    addressLabel: string;
    addressPlaceholder: string;
    timeLabel: string;
    timeAsap: string;
    notesLabel: string;
    notesPlaceholder: string;
    notesTruncatedWarning: string;
    submitWhatsApp: string;
    missingNumberWarning: string;
    fallbackLinkText: string;
    copyMessageButton: string;
    copiedFeedback: string;
    greetingMessage: string;
    validation: {
      nameRequired: string;
      addressRequired: string;
      basketEmpty: string;
    };
  };
  footer: {
    tagline: string;
    navigationTitle: string;
    contactTitle: string;
    socialTitle: string;
    legalTitle: string;
    avisoLegal: string;
    privacidad: string;
    cookies: string;
    rights: string;
  };
}

export const copyEs: LocaleCopy = {
  locale: 'es',
  seo: {
    homeTitle: 'Pizzería en Badalona · Pizza para llevar | La Piccerella',
    homeDescription:
      'Pizza en Badalona recién horneada en Carrer de Mar, 127. Pizzetas desde 3 € (Promo 5+1), Pizzas Grandes (5 Stickers = 1 Gratis) y Pack 3 Pizzas 34,99 €.',
    cartaTitle: 'La Carta: Pizzas, Pizzetas 3€ y Precios | La Piccerella',
    cartaDescription:
      'Carta de La Piccerella en Badalona (Carrer de Mar, 127): 15 pizzas grandes (5 Stickers = 1 Gratis), pizzetas desde 3 € (Promo 5+1) y Pack 3 Pizzas 34,99 €.',
  },
  nav: {
    menu: 'Carta',
    howToOrder: 'Cómo pedir',
    location: 'Dónde estamos',
    fullMenuPage: 'Carta completa',
    orderWhatsApp: 'Pedir por WhatsApp',
    openMenuLabel: 'Abrir menú de navegación',
    closeMenuLabel: 'Cerrar menú de navegación',
    openBasketLabel: 'Abrir carrito de pedido',
    languageLabel: 'Cambiar idioma',
  },
  heroStory: {
    h1: 'La Piccerella, pizzería artesanal en Badalona',
    subtitle:
      'Pizzas y pizzetas artesanales con masa fermentada 48 horas hechas al momento en Carrer de Mar, 127.',
    ctaMenu: 'Ver la carta',
    ctaWhatsApp: 'Pedir por WhatsApp',
    slide1Label: 'Nuestra fachada en Carrer de Mar',
    slide2Label: 'Nuestro horno y barra interior',
    scrollHint: 'Desliza para entrar',
  },
  introCream: {
    eyebrow: 'Tradición, calidad y sabor en Badalona',
    heading: 'Masa fermentada 48 horas, pizzas hechas al momento',
    body: 'En nuestro obrador de Carrer de Mar estiramos cada masa a mano para lograr una base fina, ligera y crujiente. Desde una pizzeta Margarita recién salida del horno por 3 € hasta 15 variedades de pizzas grandes y nuestro pack familiar.',
    addButton: 'Añadir',
    viewAllLink: 'Ver toda la carta →',
  },
  signatureHero: {
    eyebrow: 'Recién salida de nuestro horno',
    heading: 'Ligera, crujiente y de fácil digestión',
    body: 'Dos días de reposo lento transforman la harina, el agua y la sal en una masa aireada por dentro y dorada por fuera, cubierta con ingredientes de primerísima calidad.',
    ctaOrder: 'Pedir ahora',
  },
  explodedPizza: {
    eyebrow: 'Anatomía de nuestra pizza',
    heading: 'Cada capa tiene su porqué',
    subheading:
      'Desliza para descubrir los ingredientes que componen nuestras pizzas artesanales.',
    srDescription:
      'Desglose de capas de nuestra pizza artesanal: masa con 48 horas de fermentación lenta, salsa de tomate seleccionada, mozzarella fundida, ingredientes frescos y toque final de albahaca y aceite de oliva.',
    ctaAfterExplode: 'Elegir mi pizza en la carta',
    callouts: [
      {
        id: 'callout-basil',
        badge: '01',
        title: 'Albahaca y aceite de oliva',
        detail: 'Aroma fresco de acabado justo al salir del horno.',
        layerIndex: 4,
      },
      {
        id: 'callout-toppings',
        badge: '02',
        title: 'Ingredientes seleccionados',
        detail: 'Pepperoni crujiente, champiñones, jamón dulce o verduras frescas.',
        layerIndex: 3,
      },
      {
        id: 'callout-cheese',
        badge: '03',
        title: 'Mozzarella fundida',
        detail: 'Mozzarella hilada al punto exacto de gratinado.',
        layerIndex: 2,
      },
      {
        id: 'callout-sauce',
        badge: '04',
        title: 'Salsa de tomate',
        detail: 'Base equilibrada de tomate extendida a cuchara sobre la masa.',
        layerIndex: 1,
      },
      {
        id: 'callout-crust',
        badge: '05',
        title: 'Masa fermentada 48 h',
        detail: 'Fermentación lenta de 48 horas: borde alveolado, base fina y digestión ligera.',
        layerIndex: 0,
      },
    ],
  },
  menuSection: {
    eyebrow: 'Nuestra carta',
    heading: 'Pizzas y pizzetas artesanales en Badalona',
    subheading:
      'Precios transparentes de nuestro local en Carrer de Mar, 127. Añade tu selección al pedido y envíalo directamente por WhatsApp.',
    viewFullPageLink: 'Abrir vista de carta completa (/carta)',
    allergensLabel: 'Alérgenos:',
    vegetarianBadge: 'Vegetariana',
    sizeLabel: 'Formato:',
    addToOrder: 'Añadir al pedido',
    addedFeedback: '¡Añadido!',
  },
  storySection: {
    eyebrow: 'Quiénes somos',
    heading: 'Un rincón de barrio cerca del mar en Badalona',
    lead: 'Gustavo te recibe frente al horno en Carrer de Mar, 127 con una propuesta honesta: buena masa, buen producto y trato cercano.',
    bullets: [
      'Masa artesanal con 48 horas de fermentación lenta, estirada y horneada al momento.',
      'Pizzetas individuales desde 3 € (promo paga 5 y llévate 6), 15 variedades de pizza grande (9,50 € – 13,00 €) y pack degustación familiar.',
      'Ingredientes seleccionados de primerísima calidad: mozzarella fior di latte, salsa de tomate extendida a cuchara y horneado al instante.',
    ],
    todoNotice:
      'TODO: Confirmar con Gustavo su cita personal y el año exacto de apertura para completar la historia.',
  },
  reviewsSection: {
    eyebrow: 'Opiniones reales',
    heading: 'Lo que dicen nuestros vecinos en Google',
    body: 'Opiniones de clientes reales, tal y como aparecen en nuestra ficha de Google. Si ya nos has visitado, cuéntanos qué te pareció.',
    ctaReadGoogle: 'Lee las opiniones de nuestros clientes en Google',
    ctaWriteGoogle: 'Escribir una reseña en Google',
    ratingSuffix: 'según Google, actualizado en',
    noReviewsYet:
      'Reseñas verificadas disponibles directamente en nuestro perfil oficial de Google.',
  },
  locationSection: {
    eyebrow: 'Dónde estamos y horario',
    heading: 'Te esperamos en Carrer de Mar, 127',
    addressLabel: 'Dirección',
    phoneLabel: 'Teléfono',
    hoursLabel: 'Horario de atención',
    hoursUnverifiedNote:
      'Nota: Horario orientativo pendiente de confirmación definitiva por el local.',
    directionsButton: 'Cómo llegar en Google Maps',
    deliveryUberEats: 'Pedir a domicilio en Uber Eats',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado ahora',
    opensAt: 'Abrimos a las',
    days: {
      Monday: 'Lunes',
      Tuesday: 'Martes',
      Wednesday: 'Miércoles',
      Thursday: 'Jueves',
      Friday: 'Viernes',
      Saturday: 'Sábado',
      Sunday: 'Domingo',
    },
  },
  faqSection: {
    eyebrow: 'Preguntas frecuentes',
    heading: 'Todo sobre tus pedidos en La Piccerella',
    subheading: 'Resolvemos las dudas habituales sobre nuestra masa de 48 h, recogida y alérgenos.',
  },
  basket: {
    drawerTitle: 'Tu pedido',
    closeLabel: 'Cerrar carrito',
    emptyTitle: 'Tu pedido está vacío',
    emptyBody: 'Elige tus pizzas, pizzetas o packs favoritos de la carta para preparar tu mensaje de WhatsApp.',
    browseMenuCta: 'Ir a la carta',
    closedBannerPrefix: 'Ahora estamos cerrados, abrimos a las ',
    closedBannerSuffix:
      '. Puedes dejar tu pedido y te responderemos al abrir.',
    totalLabel: 'Total estimado',
    clearBasket: 'Vaciar pedido',
    formTitle: 'Datos para el pedido',
    nameLabel: 'Tu nombre *',
    namePlaceholder: 'Ej. Ana',
    modeLabel: 'Modalidad de entrega',
    modePickup: 'Recogida en local (Carrer de Mar, 127)',
    modeDelivery: 'Entrega a domicilio',
    deliveryUberNotice:
      'Por WhatsApp preparamos pedidos para recoger en el local. ¿Prefieres envío a domicilio? Pide en nuestro Uber Eats.',
    addressLabel: 'Dirección de entrega *',
    addressPlaceholder: 'Calle, número, piso (Badalona)',
    timeLabel: 'Hora preferida',
    timeAsap: 'Lo antes posible',
    notesLabel: 'Notas o alérgenos (máx. 300 caracteres)',
    notesPlaceholder: 'Ej. sin cebolla, o los 3 sabores si pediste el Pack Familiar',
    notesTruncatedWarning:
      'Las notas se han limitado a 300 caracteres para asegurar que el enlace de WhatsApp funcione en todos los móviles.',
    submitWhatsApp: 'Enviar pedido por WhatsApp',
    missingNumberWarning:
      'El número de WhatsApp aún no está configurado (TODO: NEXT_PUBLIC_WHATSAPP_NUMBER). Puedes copiar el mensaje o llamar por teléfono.',
    fallbackLinkText: '¿No se abre la ventana? Pulsa aquí para abrir WhatsApp directamente',
    copyMessageButton: 'Copiar mensaje del pedido',
    copiedFeedback: '¡Mensaje copiado al portapapeles!',
    greetingMessage:
      'Hola La Piccerella! Quería hacer una consulta / pedido para recoger en Carrer de Mar, 127.',
    validation: {
      nameRequired: 'Por favor, escribe tu nombre para identificar el pedido.',
      addressRequired: 'La dirección es obligatoria para pedidos a domicilio.',
      basketEmpty: 'Añade al menos un producto antes de enviar el pedido.',
    },
  },
  footer: {
    tagline:
      'Pizzería artesanal en Badalona. Masa con 48 horas de fermentación lenta, pizzas grandes, pizzetas desde 3 € e ingredientes de primerísima calidad.',
    navigationTitle: 'Navegación',
    contactTitle: 'Contacto',
    socialTitle: 'Síguenos',
    legalTitle: 'Legal',
    avisoLegal: 'Aviso legal',
    privacidad: 'Política de privacidad',
    cookies: 'Política de cookies',
    rights: 'Todos los derechos reservados.',
  },
};
