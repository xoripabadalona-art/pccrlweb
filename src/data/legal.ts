import { site } from './site';
import type { Locale } from './copy';

/**
 * Legal texts (aviso legal, privacidad, cookies) in Spanish and Catalan.
 *
 * They describe what this website really does: it is a static site with no
 * accounts, no online payment and no server-side forms; an order is a message
 * the visitor sends from their own WhatsApp. Sections about analytics and
 * Google reviews are only included when those features are switched on.
 *
 * Standard template wording — the owner should have it reviewed before launch.
 */

export type LegalDocId = 'aviso-legal' | 'privacidad' | 'cookies';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  /** Label/value rows (identity block, storage inventory) */
  rows?: { label: string; value: string }[];
  list?: string[];
}

export interface LegalDoc {
  id: LegalDocId;
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_DOC_IDS: LegalDocId[] = ['aviso-legal', 'privacidad', 'cookies'];

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lapiccerella.es').replace(
  /\/$/,
  ''
);
const domain = siteUrl.replace(/^https?:\/\//, '');

const hasPlausible = Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);
const hasGa4 = Boolean(process.env.NEXT_PUBLIC_GA4_ID);
const hasGoogleReviews = Boolean(site.googleReviews.apiKey && site.googleReviews.placeId);

/** True while the owner's identity is incomplete — the pages say so plainly. */
export const legalIdentityComplete = Boolean(
  site.legal.ownerName && site.legal.taxId && site.legal.email
);

function or(value: string, locale: Locale) {
  if (value) return value;
  return locale === 'ca' ? 'Pendent de publicar pel titular' : 'Pendiente de publicar por el titular';
}

export function formatLegalDate(locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(new Date(`${site.legal.lastUpdated}T12:00:00Z`));
}

// ─────────────────────────────────────────────────────────────────────────────
// Aviso legal
// ─────────────────────────────────────────────────────────────────────────────

function avisoLegal(locale: Locale): LegalDoc {
  const owner = or(site.legal.ownerName, locale);
  const taxId = or(site.legal.taxId, locale);
  const email = or(site.legal.email, locale);

  if (locale === 'ca') {
    return {
      id: 'aviso-legal',
      title: 'Avís legal',
      intro: `Informació general del lloc web ${domain}, en compliment de la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE).`,
      sections: [
        {
          heading: '1. Dades identificatives',
          rows: [
            { label: 'Titular', value: owner },
            { label: 'NIF / CIF', value: taxId },
            { label: 'Nom comercial', value: `${site.name} (${site.legalDescriptor})` },
            { label: 'Establiment', value: site.address },
            { label: 'Telèfon', value: site.phone },
            { label: 'Correu electrònic', value: email },
            { label: 'Lloc web', value: siteUrl },
          ],
        },
        {
          heading: '2. Objecte del lloc web',
          paragraphs: [
            `Aquest lloc web presenta la carta, els preus, l'horari i la ubicació de ${site.name}, i permet preparar una comanda per recollir al local.`,
            "La comanda no es tramita des del lloc web: l'usuari la revisa i l'envia ell mateix des de la seva aplicació de WhatsApp. No hi ha registre d'usuaris ni pagament en línia.",
          ],
        },
        {
          heading: "3. Condicions d'ús",
          paragraphs: [
            "L'accés al lloc web és lliure i gratuït. Qui el visita es compromet a fer-ne un ús lícit, sense danyar el lloc ni impedir-ne el funcionament normal, i sense utilitzar-ne els continguts amb finalitats il·lícites.",
          ],
        },
        {
          heading: '4. Comandes, preus i al·lèrgens',
          list: [
            "Una comanda queda confirmada quan el local respon al missatge de WhatsApp i n'accepta la preparació.",
            "Els preus i la disponibilitat que es mostren són informatius i poden canviar sense avís previ; el preu vàlid és el que confirma el local en acceptar la comanda.",
            'A través d’aquest lloc web no es fa cap pagament.',
            "La informació sobre al·lèrgens és orientativa. En treballar en un obrador amb farina de blat i altres ingredients, hi pot haver traces. Si tens una al·lèrgia o intolerància, indica-ho a la comanda i consulta-ho amb el personal abans de consumir.",
          ],
        },
        {
          heading: '5. Propietat intel·lectual i industrial',
          paragraphs: [
            `Els textos, les imatges, el logotip, el disseny i el codi d'aquest lloc web pertanyen al titular o s'utilitzen amb autorització. No se'n permet la reproducció, distribució o transformació amb finalitats comercials sense permís previ i per escrit.`,
          ],
        },
        {
          heading: '6. Enllaços a serveis de tercers',
          paragraphs: [
            "El lloc web enllaça amb serveis de tercers com WhatsApp, Instagram, TikTok, Google Maps i Uber Eats. Cada un d'aquests serveis té les seves pròpies condicions i polítiques de privacitat, i el titular no en controla el contingut ni el funcionament.",
          ],
        },
        {
          heading: '7. Responsabilitat',
          paragraphs: [
            "El titular procura que la informació sigui correcta i estigui actualitzada, però no pot garantir l'absència d'errors ni la disponibilitat ininterrompuda del lloc web. No es fa responsable dels danys derivats d'un ús indegut del lloc o de fallades tècniques alienes al seu control.",
          ],
        },
        {
          heading: '8. Legislació aplicable',
          paragraphs: [
            "Aquest avís legal es regeix per la legislació espanyola. Si ets consumidor, qualsevol controvèrsia es resoldrà davant els jutjats i tribunals del teu domicili.",
          ],
        },
      ],
    };
  }

  return {
    id: 'aviso-legal',
    title: 'Aviso legal',
    intro: `Información general del sitio web ${domain}, en cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).`,
    sections: [
      {
        heading: '1. Datos identificativos',
        rows: [
          { label: 'Titular', value: owner },
          { label: 'NIF / CIF', value: taxId },
          { label: 'Nombre comercial', value: `${site.name} (${site.legalDescriptor})` },
          { label: 'Establecimiento', value: site.address },
          { label: 'Teléfono', value: site.phone },
          { label: 'Correo electrónico', value: email },
          { label: 'Sitio web', value: siteUrl },
        ],
      },
      {
        heading: '2. Objeto del sitio web',
        paragraphs: [
          `Este sitio web presenta la carta, los precios, el horario y la ubicación de ${site.name}, y permite preparar un pedido para recoger en el local.`,
          'El pedido no se tramita desde el sitio web: el usuario lo revisa y lo envía él mismo desde su aplicación de WhatsApp. No hay registro de usuarios ni pago en línea.',
        ],
      },
      {
        heading: '3. Condiciones de uso',
        paragraphs: [
          'El acceso al sitio web es libre y gratuito. Quien lo visita se compromete a hacer un uso lícito, sin dañar el sitio ni impedir su funcionamiento normal, y sin utilizar sus contenidos con fines ilícitos.',
        ],
      },
      {
        heading: '4. Pedidos, precios y alérgenos',
        list: [
          'Un pedido queda confirmado cuando el local responde al mensaje de WhatsApp y acepta su preparación.',
          'Los precios y la disponibilidad que se muestran son informativos y pueden cambiar sin previo aviso; el precio válido es el que confirma el local al aceptar el pedido.',
          'A través de este sitio web no se realiza ningún pago.',
          'La información sobre alérgenos es orientativa. Al trabajar en un obrador con harina de trigo y otros ingredientes, puede haber trazas. Si tienes una alergia o intolerancia, indícalo en el pedido y consúltalo con el personal antes de consumir.',
        ],
      },
      {
        heading: '5. Propiedad intelectual e industrial',
        paragraphs: [
          'Los textos, las imágenes, el logotipo, el diseño y el código de este sitio web pertenecen al titular o se utilizan con autorización. No se permite su reproducción, distribución o transformación con fines comerciales sin permiso previo y por escrito.',
        ],
      },
      {
        heading: '6. Enlaces a servicios de terceros',
        paragraphs: [
          'El sitio web enlaza con servicios de terceros como WhatsApp, Instagram, TikTok, Google Maps y Uber Eats. Cada uno de estos servicios tiene sus propias condiciones y políticas de privacidad, y el titular no controla su contenido ni su funcionamiento.',
        ],
      },
      {
        heading: '7. Responsabilidad',
        paragraphs: [
          'El titular procura que la información sea correcta y esté actualizada, pero no puede garantizar la ausencia de errores ni la disponibilidad ininterrumpida del sitio web. No se hace responsable de los daños derivados de un uso indebido del sitio o de fallos técnicos ajenos a su control.',
        ],
      },
      {
        heading: '8. Legislación aplicable',
        paragraphs: [
          'Este aviso legal se rige por la legislación española. Si eres consumidor, cualquier controversia se resolverá ante los juzgados y tribunales de tu domicilio.',
        ],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Política de privacidad
// ─────────────────────────────────────────────────────────────────────────────

function privacidad(locale: Locale): LegalDoc {
  const owner = or(site.legal.ownerName, locale);
  const taxId = or(site.legal.taxId, locale);
  const email = or(site.legal.email, locale);

  if (locale === 'ca') {
    const recipients = [
      "WhatsApp (Meta Platforms Ireland Ltd.): és el servei de missatgeria amb què envies la comanda. El seu ús es regeix per la política de privacitat de WhatsApp.",
      "El proveïdor d'allotjament del lloc web, que pot registrar dades tècniques de connexió (com l'adreça IP) per servir les pàgines i mantenir-ne la seguretat.",
    ];
    if (hasGoogleReviews) {
      recipients.push(
        "Google Ireland Ltd. (Google Maps Platform): les ressenyes de la pàgina d'inici es carreguen directament des de Google quan t'acostes a aquesta secció. En fer-ho, Google rep la teva adreça IP i dades tècniques del navegador."
      );
    }
    if (hasGa4) {
      recipients.push(
        "Google Ireland Ltd. (Google Analytics 4): només si acceptes l'analítica al bàner de consentiment."
      );
    }
    if (hasPlausible) {
      recipients.push(
        'Plausible Analytics: estadístiques de visites agregades, sense galetes ni dades que t’identifiquin.'
      );
    }

    return {
      id: 'privacidad',
      title: 'Política de privacitat',
      intro: `Com es tracten les teves dades personals quan visites ${domain} o fas una comanda a ${site.name}, d'acord amb el Reglament (UE) 2016/679 (RGPD) i la Llei orgànica 3/2018 (LOPDGDD).`,
      sections: [
        {
          heading: '1. Responsable del tractament',
          rows: [
            { label: 'Responsable', value: owner },
            { label: 'NIF / CIF', value: taxId },
            { label: 'Adreça', value: site.address },
            { label: 'Telèfon', value: site.phone },
            { label: 'Correu electrònic', value: email },
          ],
        },
        {
          heading: '2. Quines dades es tracten i com arriben',
          list: [
            "Comandes per WhatsApp: el nom, l'hora de recollida i les notes que escrius al formulari de comanda. El lloc web no envia aquestes dades a cap servidor: només redacta un missatge que tu mateix envies des del teu WhatsApp. En enviar-lo, el local rep el teu número de telèfon, el teu nom de perfil i el contingut del missatge.",
            'Trucades telefòniques: el teu número i el que ens expliquis per atendre la consulta o la comanda.',
            'Dades tècniques de navegació: les que el servidor necessita per mostrar-te les pàgines.',
            "Emmagatzematge al teu dispositiu: la comanda que estàs preparant es desa només al teu navegador (vegeu la política de galetes).",
          ],
        },
        {
          heading: '3. Finalitat i base jurídica',
          list: [
            'Preparar i lliurar la teva comanda: execució d’un contracte o aplicació de mesures precontractuals a petició teva (art. 6.1.b RGPD).',
            "Atendre consultes i reclamacions: interès legítim a respondre a qui es posa en contacte amb el local (art. 6.1.f RGPD).",
            'Complir obligacions legals, com les fiscals o de consum (art. 6.1.c RGPD).',
            'Estadístiques de visites, si estan activades: el teu consentiment (art. 6.1.a RGPD), que pots retirar en qualsevol moment.',
          ],
        },
        {
          heading: '4. Conservació',
          paragraphs: [
            "Les dades de la comanda es conserven el temps necessari per preparar-la i lliurar-la i, després, durant els terminis que exigeixin les obligacions legals aplicables. No s'utilitzen per enviar publicitat.",
          ],
        },
        {
          heading: '5. Destinataris',
          paragraphs: [
            "Les teves dades no es venen ni se cedeixen a tercers, tret d'obligació legal. Hi intervenen aquests serveis:",
          ],
          list: recipients,
        },
        {
          heading: '6. Transferències internacionals',
          paragraphs: [
            "Alguns d'aquests proveïdors poden tractar dades fora de l'Espai Econòmic Europeu. En aquest cas ho fan amb les garanties previstes al RGPD, com el Marc de Privacitat de Dades UE-EUA o les clàusules contractuals tipus.",
          ],
        },
        {
          heading: '7. Els teus drets',
          paragraphs: [
            `Pots exercir els drets d'accés, rectificació, supressió, oposició, limitació del tractament i portabilitat escrivint a ${email} o adreçant-te al local. Indica quin dret vols exercir; et podem demanar que acreditis la teva identitat.`,
            "Si consideres que no s'han atès correctament, pots presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (www.aepd.es).",
          ],
        },
        {
          heading: '8. Canvis en aquesta política',
          paragraphs: [
            "Aquesta política es pot actualitzar si canvia el funcionament del lloc web o la normativa. La data de l'última revisió apareix a l'inici de la pàgina.",
          ],
        },
      ],
    };
  }

  const recipients = [
    'WhatsApp (Meta Platforms Ireland Ltd.): es el servicio de mensajería con el que envías el pedido. Su uso se rige por la política de privacidad de WhatsApp.',
    'El proveedor de alojamiento del sitio web, que puede registrar datos técnicos de conexión (como la dirección IP) para servir las páginas y mantener su seguridad.',
  ];
  if (hasGoogleReviews) {
    recipients.push(
      'Google Ireland Ltd. (Google Maps Platform): las reseñas de la página de inicio se cargan directamente desde Google cuando te acercas a esa sección. Al hacerlo, Google recibe tu dirección IP y datos técnicos del navegador.'
    );
  }
  if (hasGa4) {
    recipients.push(
      'Google Ireland Ltd. (Google Analytics 4): solo si aceptas la analítica en el aviso de consentimiento.'
    );
  }
  if (hasPlausible) {
    recipients.push(
      'Plausible Analytics: estadísticas de visitas agregadas, sin cookies ni datos que te identifiquen.'
    );
  }

  return {
    id: 'privacidad',
    title: 'Política de privacidad',
    intro: `Cómo se tratan tus datos personales cuando visitas ${domain} o haces un pedido a ${site.name}, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).`,
    sections: [
      {
        heading: '1. Responsable del tratamiento',
        rows: [
          { label: 'Responsable', value: owner },
          { label: 'NIF / CIF', value: taxId },
          { label: 'Dirección', value: site.address },
          { label: 'Teléfono', value: site.phone },
          { label: 'Correo electrónico', value: email },
        ],
      },
      {
        heading: '2. Qué datos se tratan y cómo llegan',
        list: [
          'Pedidos por WhatsApp: el nombre, la hora de recogida y las notas que escribes en el formulario de pedido. El sitio web no envía esos datos a ningún servidor: solo redacta un mensaje que tú mismo envías desde tu WhatsApp. Al enviarlo, el local recibe tu número de teléfono, tu nombre de perfil y el contenido del mensaje.',
          'Llamadas telefónicas: tu número y lo que nos cuentes para atender la consulta o el pedido.',
          'Datos técnicos de navegación: los que el servidor necesita para mostrarte las páginas.',
          'Almacenamiento en tu dispositivo: el pedido que estás preparando se guarda solo en tu navegador (véase la política de cookies).',
        ],
      },
      {
        heading: '3. Finalidad y base jurídica',
        list: [
          'Preparar y entregar tu pedido: ejecución de un contrato o aplicación de medidas precontractuales a petición tuya (art. 6.1.b RGPD).',
          'Atender consultas y reclamaciones: interés legítimo en responder a quien contacta con el local (art. 6.1.f RGPD).',
          'Cumplir obligaciones legales, como las fiscales o de consumo (art. 6.1.c RGPD).',
          'Estadísticas de visitas, si están activadas: tu consentimiento (art. 6.1.a RGPD), que puedes retirar en cualquier momento.',
        ],
      },
      {
        heading: '4. Conservación',
        paragraphs: [
          'Los datos del pedido se conservan el tiempo necesario para prepararlo y entregarlo y, después, durante los plazos que exijan las obligaciones legales aplicables. No se utilizan para enviar publicidad.',
        ],
      },
      {
        heading: '5. Destinatarios',
        paragraphs: [
          'Tus datos no se venden ni se ceden a terceros, salvo obligación legal. Intervienen estos servicios:',
        ],
        list: recipients,
      },
      {
        heading: '6. Transferencias internacionales',
        paragraphs: [
          'Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso lo hacen con las garantías previstas en el RGPD, como el Marco de Privacidad de Datos UE-EE. UU. o las cláusulas contractuales tipo.',
        ],
      },
      {
        heading: '7. Tus derechos',
        paragraphs: [
          `Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${email} o dirigiéndote al local. Indica qué derecho quieres ejercer; podemos pedirte que acredites tu identidad.`,
          'Si consideras que no se han atendido correctamente, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ],
      },
      {
        heading: '8. Cambios en esta política',
        paragraphs: [
          'Esta política puede actualizarse si cambia el funcionamiento del sitio web o la normativa. La fecha de la última revisión aparece al inicio de la página.',
        ],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Política de cookies
// ─────────────────────────────────────────────────────────────────────────────

function cookies(locale: Locale): LegalDoc {
  if (locale === 'ca') {
    const storage = [
      {
        label: 'la-piccerella-basket-v1',
        value:
          "Emmagatzematge local. Desa la comanda que estàs preparant perquè no es perdi si recarregues la pàgina. Es manté fins que buides la comanda o esborres les dades del lloc.",
      },
    ];
    if (hasGa4) {
      storage.push({
        label: 'la-piccerella-ga-consent',
        value:
          "Emmagatzematge local. Recorda si has acceptat o rebutjat l'analítica, per no tornar-t'ho a preguntar.",
      });
    }

    const analytics: string[] = [];
    if (hasGa4) {
      analytics.push(
        "Google Analytics 4 només es carrega si acceptes l'analítica. En aquest cas Google instal·la les galetes _ga i _ga_<ID>, que duren fins a 2 anys i serveixen per comptar visites de forma agregada. Si la rebutges, no es carrega res."
      );
    }
    if (hasPlausible) {
      analytics.push(
        'Plausible Analytics mesura les visites de forma agregada sense instal·lar galetes ni recollir dades personals.'
      );
    }
    if (analytics.length === 0) {
      analytics.push("Actualment aquest lloc web no utilitza cap eina d'analítica.");
    }

    const thirdParty = [
      "Quan cliques un enllaç a WhatsApp, Instagram, TikTok, Google Maps o Uber Eats surts d'aquest lloc web, i aquests serveis poden utilitzar les seves pròpies galetes segons les seves polítiques.",
    ];
    if (hasGoogleReviews) {
      thirdParty.unshift(
        "Les ressenyes de Google es carreguen des dels servidors de Google (Google Maps Platform) quan t'acostes a aquesta secció. Google rep la teva adreça IP i dades tècniques del navegador i pot utilitzar emmagatzematge propi per prestar el servei."
      );
    }

    return {
      id: 'cookies',
      title: 'Política de galetes',
      intro: `Quines galetes i tecnologies similars utilitza ${domain}, d'acord amb l'article 22.2 de la LSSI-CE.`,
      sections: [
        {
          heading: '1. Què són',
          paragraphs: [
            "Una galeta és un petit fitxer que un lloc web desa al teu dispositiu. L'emmagatzematge local del navegador funciona de manera semblant. Algunes són imprescindibles perquè el lloc funcioni; d'altres serveixen per mesurar visites o mostrar publicitat i necessiten el teu consentiment.",
          ],
        },
        {
          heading: '2. Què utilitza aquest lloc web',
          paragraphs: [
            "Aquest lloc web no utilitza galetes publicitàries ni de seguiment pròpies. Només fa servir emmagatzematge tècnic, necessari per al servei que demanes i exempt de consentiment:",
          ],
          rows: storage,
        },
        { heading: '3. Analítica', paragraphs: analytics },
        { heading: '4. Contingut i enllaços de tercers', paragraphs: thirdParty },
        {
          heading: '5. Com gestionar-les',
          paragraphs: [
            "Pots esborrar o bloquejar les galetes i l'emmagatzematge local des de la configuració del teu navegador (apartat de privacitat o dades de llocs web). Si esborres les dades d'aquest lloc, es buidarà la comanda que tinguessis a mitges i se't tornarà a preguntar per l'analítica, si està activada.",
          ],
        },
      ],
    };
  }

  const storage = [
    {
      label: 'la-piccerella-basket-v1',
      value:
        'Almacenamiento local. Guarda el pedido que estás preparando para que no se pierda si recargas la página. Se mantiene hasta que vacías el pedido o borras los datos del sitio.',
    },
  ];
  if (hasGa4) {
    storage.push({
      label: 'la-piccerella-ga-consent',
      value:
        'Almacenamiento local. Recuerda si has aceptado o rechazado la analítica, para no volver a preguntártelo.',
    });
  }

  const analytics: string[] = [];
  if (hasGa4) {
    analytics.push(
      'Google Analytics 4 solo se carga si aceptas la analítica. En ese caso Google instala las cookies _ga y _ga_<ID>, que duran hasta 2 años y sirven para contar visitas de forma agregada. Si la rechazas, no se carga nada.'
    );
  }
  if (hasPlausible) {
    analytics.push(
      'Plausible Analytics mide las visitas de forma agregada sin instalar cookies ni recoger datos personales.'
    );
  }
  if (analytics.length === 0) {
    analytics.push('Actualmente este sitio web no utiliza ninguna herramienta de analítica.');
  }

  const thirdParty = [
    'Cuando pulsas un enlace a WhatsApp, Instagram, TikTok, Google Maps o Uber Eats sales de este sitio web, y esos servicios pueden utilizar sus propias cookies según sus políticas.',
  ];
  if (hasGoogleReviews) {
    thirdParty.unshift(
      'Las reseñas de Google se cargan desde los servidores de Google (Google Maps Platform) cuando te acercas a esa sección. Google recibe tu dirección IP y datos técnicos del navegador y puede utilizar almacenamiento propio para prestar el servicio.'
    );
  }

  return {
    id: 'cookies',
    title: 'Política de cookies',
    intro: `Qué cookies y tecnologías similares utiliza ${domain}, conforme al artículo 22.2 de la LSSI-CE.`,
    sections: [
      {
        heading: '1. Qué son',
        paragraphs: [
          'Una cookie es un pequeño archivo que un sitio web guarda en tu dispositivo. El almacenamiento local del navegador funciona de forma parecida. Algunas son imprescindibles para que el sitio funcione; otras sirven para medir visitas o mostrar publicidad y necesitan tu consentimiento.',
        ],
      },
      {
        heading: '2. Qué utiliza este sitio web',
        paragraphs: [
          'Este sitio web no utiliza cookies publicitarias ni de seguimiento propias. Solo emplea almacenamiento técnico, necesario para el servicio que solicitas y exento de consentimiento:',
        ],
        rows: storage,
      },
      { heading: '3. Analítica', paragraphs: analytics },
      { heading: '4. Contenido y enlaces de terceros', paragraphs: thirdParty },
      {
        heading: '5. Cómo gestionarlas',
        paragraphs: [
          'Puedes borrar o bloquear las cookies y el almacenamiento local desde la configuración de tu navegador (apartado de privacidad o datos de sitios web). Si borras los datos de este sitio, se vaciará el pedido que tuvieras a medias y se te volverá a preguntar por la analítica, si está activada.',
        ],
      },
    ],
  };
}

export function getLegalDoc(id: LegalDocId, locale: Locale): LegalDoc {
  if (id === 'privacidad') return privacidad(locale);
  if (id === 'cookies') return cookies(locale);
  return avisoLegal(locale);
}
