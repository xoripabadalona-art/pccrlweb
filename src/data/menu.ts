export type MenuCategoryId = 'pizzetas' | 'pizzas' | 'packs' | 'bebidas';

export interface MenuSizeOption {
  id: string;
  label: {
    es: string;
    ca: string;
  };
  priceCents: number;
}

export interface Pizza3dLayerCallout {
  title: { es: string; ca: string };
  subtitle: { es: string; ca: string };
  detail: { es: string; ca: string };
}

export interface Pizza3dConfig {
  slug: string;
  image3d: string;
  floatingToppings3d: string;
  sauceType: 'tomato' | 'white';
  /** Top-left callout (points to Layer 1 / Crown & Toppings) */
  calloutTopLeft: Pizza3dLayerCallout;
  /** Bottom-left callout (points to Layer 3 / Cheese & Base) */
  calloutBottomLeft: Pizza3dLayerCallout;
  /** Top-right callout (points to Layer 2 / Signature ingredients) */
  calloutTopRight: Pizza3dLayerCallout;
}

export interface MenuItem {
  id: string;
  category: MenuCategoryId;
  name: {
    es: string;
    ca: string;
  };
  ingredients: {
    es: string;
    ca: string;
  };
  /** Base price in euro cents (e.g. 950 = 9,50 €) */
  priceCents: number;
  sizes?: MenuSizeOption[];
  allergens: {
    es: string[];
    ca: string[];
  };
  vegetarian?: boolean;
  featured?: boolean;
  image: string;
  pizza3d?: Pizza3dConfig;
  /**
   * Flagged true when any part of the item (such as individual dish photography)
   * is still a placeholder awaiting client confirmation.
   */
  placeholder: boolean;
  placeholderNote?: string;
}

export interface MenuCategory {
  id: MenuCategoryId;
  label: {
    es: string;
    ca: string;
  };
  description: {
    es: string;
    ca: string;
  };
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'pizzetas',
    label: { es: 'Pizzetas', ca: 'Pizzetes' },
    description: {
      es: 'Individuales y hechas al momento, desde 3,00 €. Promo: paga 5 y llévate 6 del mismo precio.',
      ca: 'Individuals i fetes al moment, des de 3,00 €. Promo: paga’n 5 i emporta-te’n 6 del mateix preu.',
    },
  },
  {
    id: 'pizzas',
    label: { es: 'Pizzas', ca: 'Pizzes' },
    description: {
      es: 'Masa artesanal con 48 horas de fermentación lenta. Promo Stickers: por cada pizza grande te llevas 1 sticker y con 5 stickers tienes 1 pizza gratis.',
      ca: 'Massa artesanal amb 48 hores de fermentació lenta. Promo Stickers: per cada pizza gran et portes 1 sticker i amb 5 stickers tens 1 pizza gratis.',
    },
  },
  {
    id: 'packs',
    label: { es: 'Packs', ca: 'Packs' },
    description: {
      es: 'Para compartir: pizzas grandes a elección a precio cerrado.',
      ca: 'Per compartir: pizzes grans a triar a preu tancat.',
    },
  },
  {
    id: 'bebidas',
    label: { es: 'Bebidas y Cervezas', ca: 'Begudes i Cerveses' },
    description: {
      es: 'Refrescos, aguas y cerveza Estrella de Galicia de tirador o en lata.',
      ca: 'Refrescos, aigües i cervesa Estrella de Galicia de tirador o en llauna.',
    },
  },
];

export const menuItems: MenuItem[] = [
  // ─── PIZZAS (15 varieties with real photos from assets/ and 1:1 3D models) ─
  {
    id: 'pizza-pepperoni',
    category: 'pizzas',
    name: { es: 'Pepperoni', ca: 'Pepperoni' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella y pepperoni',
      ca: 'Salsa de tomàquet, mozzarella i pepperoni',
    },
    priceCents: 1200,
    sizes: [
      { id: 'grande', label: { es: 'Pizza entera', ca: 'Pizza sencera' }, priceCents: 1200 },
      { id: 'pizzeta', label: { es: 'Pizzeta individual', ca: 'Pizzeta individual' }, priceCents: 300 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    featured: true,
    image: '/images/menu/pizza-pepperoni.webp',
    pizza3d: {
      slug: 'pepperoni',
      image3d: '/images/pizzas-3d/pizza-pepperoni-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-pepperoni-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Pepperoni crujiente', ca: 'Pepperoni cruixent' },
        subtitle: { es: 'Rodajas curadas al horno', ca: 'Rodanxes curades al forn' },
        detail: { es: 'Dorado al momento con toque especiado', ca: 'Daurat al moment amb toc especiat' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella 100%', ca: 'Mozzarella 100%' },
        subtitle: { es: 'Fundida y elástica', ca: 'Fosa i elàstica' },
        detail: { es: 'Gratinado uniforme sobre salsa de tomate', ca: 'Gratinat uniforme sobre salsa de tomàquet' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Borde alveolado, ligero y digestivo', ca: 'Vora alveolada, lleugera i digestiva' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-margarita',
    category: 'pizzas',
    name: { es: 'Margarita', ca: 'Margarita' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella y aceite de oliva',
      ca: "Salsa de tomàquet, mozzarella i oli d'oliva",
    },
    priceCents: 950,
    sizes: [
      { id: 'grande', label: { es: 'Pizza entera', ca: 'Pizza sencera' }, priceCents: 950 },
      { id: 'pizzeta', label: { es: 'Porción / Pizzeta (1/4)', ca: 'Porció / Pizzeta (1/4)' }, priceCents: 300 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: true,
    featured: true,
    image: '/images/menu/pizza-margarita.webp',
    pizza3d: {
      slug: 'margarita',
      image3d: '/images/pizzas-3d/pizza-margarita-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-margarita-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Aceite de oliva', ca: "Oli d'oliva" },
        subtitle: { es: 'Virgen extra', ca: 'Verge extra' },
        detail: { es: 'Hilo aromático al salir del horno', ca: 'Fil aromàtic en sortir del forn' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella hilada', ca: 'Mozzarella filada' },
        subtitle: { es: 'Fundido cremoso', ca: 'Fos cremós' },
        detail: { es: 'Equilibrio clásico con tomate natural', ca: 'Equilibri clàssic amb tomàquet natural' },
      },
      calloutTopRight: {
        title: { es: 'Salsa de tomate', ca: 'Salsa de tomàquet' },
        subtitle: { es: 'Receta tradicional', ca: 'Recepta tradicional' },
        detail: { es: 'Extendida a cuchara sobre masa 48 h', ca: 'Estesa a cullera sobre massa 48 h' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-prosciutto-funghi',
    category: 'pizzas',
    name: { es: 'Prosciutto e Funghi', ca: 'Prosciutto e Funghi' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, jamón dulce y champiñones',
      ca: 'Salsa de tomàquet, mozzarella, pernil dolç i xampinyons',
    },
    priceCents: 1200,
    sizes: [
      { id: 'grande', label: { es: 'Pizza entera', ca: 'Pizza sencera' }, priceCents: 1200 },
      { id: 'pizzeta', label: { es: 'Pizzeta individual', ca: 'Pizzeta individual' }, priceCents: 500 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    featured: true,
    image: '/images/menu/pizza-prosciutto-funghi.webp',
    pizza3d: {
      slug: 'prosciutto-funghi',
      image3d: '/images/pizzas-3d/pizza-prosciutto-funghi-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-prosciutto-funghi-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Champiñón fresco', ca: 'Xampinyó fresc' },
        subtitle: { es: 'Laminado al horno', ca: 'Laminat al forn' },
        detail: { es: 'Jugoso y asado sobre la mozzarella', ca: 'Sucós i rostit sobre la mozzarella' },
      },
      calloutBottomLeft: {
        title: { es: 'Jamón dulce', ca: 'Pernil dolç' },
        subtitle: { es: 'Lonchas tiernas', ca: 'Llesques tendres' },
        detail: { es: 'Sabor suave que contrasta con el tomate', ca: 'Sabor suau que contrasta amb el tomàquet' },
      },
      calloutTopRight: {
        title: { es: 'Mozzarella y Tomate', ca: 'Mozzarella i Tomàquet' },
        subtitle: { es: 'Base artesanal 48 h', ca: 'Base artesanal 48 h' },
        detail: { es: 'Horneado crujiente de fácil digestión', ca: 'Enfornat cruixent de fàcil digestió' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-prosciutto',
    category: 'pizzas',
    name: { es: 'Prosciutto', ca: 'Prosciutto' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella y jamón dulce',
      ca: 'Salsa de tomàquet, mozzarella i pernil dolç',
    },
    priceCents: 1050,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-prosciutto.webp',
    pizza3d: {
      slug: 'prosciutto',
      image3d: '/images/pizzas-3d/pizza-prosciutto-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-prosciutto-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Jamón dulce', ca: 'Pernil dolç' },
        subtitle: { es: 'Seleccionado', ca: 'Seleccionat' },
        detail: { es: 'Pliegues tiernos sobre queso fundido', ca: 'Plecs tendres sobre formatge fos' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella fundida', ca: 'Mozzarella fosa' },
        subtitle: { es: 'Capa generosa', ca: 'Capa generosa' },
        detail: { es: 'Gratinada a alta temperatura', ca: 'Gratinada a alta temperatura' },
      },
      calloutTopRight: {
        title: { es: 'Tomate y Masa 48 h', ca: 'Tomàquet i Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Textura fina, ligera y crujiente', ca: 'Textura fina, lleugera i cruixent' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-carbonara',
    category: 'pizzas',
    name: { es: 'Carbonara', ca: 'Carbonara' },
    ingredients: {
      es: 'Base blanca, mozzarella, crema de leche, cebolla caramelizada, bacon y huevo',
      ca: 'Base blanca, mozzarella, crema de llet, ceba caramel·litzada, bacó i ou',
    },
    priceCents: 1300,
    allergens: {
      es: ['Gluten', 'Lácteos', 'Huevo'],
      ca: ['Gluten', 'Làctics', 'Ou'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-carbonara.webp',
    pizza3d: {
      slug: 'carbonara',
      image3d: '/images/pizzas-3d/pizza-carbonara-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-carbonara-v2.webp',
      sauceType: 'white',
      calloutTopLeft: {
        title: { es: 'Bacon y Huevo', ca: 'Bacó i Ou' },
        subtitle: { es: 'Cebolla caramelizada', ca: 'Ceba caramel·litzada' },
        detail: { es: 'Contraste dulce y ahumado al horno', ca: 'Contrast dolç i fumat al forn' },
      },
      calloutBottomLeft: {
        title: { es: 'Base blanca cremosa', ca: 'Base blanca cremosa' },
        subtitle: { es: 'Crema de leche y mozzarella', ca: 'Crema de llet i mozzarella' },
        detail: { es: 'Fundido suave y envolvente', ca: 'Fos suau i envoltant' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Crujiente por fuera', ca: 'Cruixent per fora' },
        detail: { es: 'Sostiene la crema sin perder ligereza', ca: 'Sosté la crema sense perdre lleugeresa' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-4-quesos',
    category: 'pizzas',
    name: { es: '4 Quesos', ca: '4 Formatges' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, queso de cabra, queso azul y parmesano',
      ca: 'Salsa de tomàquet, mozzarella, formatge de cabra, formatge blau i parmesà',
    },
    priceCents: 1300,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: true,
    image: '/images/menu/pizza-4-quesos.webp',
    pizza3d: {
      slug: '4-quesos',
      image3d: '/images/pizzas-3d/pizza-4-quesos-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-4-quesos-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Cabra y Queso Azul', ca: 'Cabra i Formatge Blau' },
        subtitle: { es: 'Carácter intenso', ca: 'Caràcter intens' },
        detail: { es: 'Cremosidad y matices intensos en cada corte', ca: 'Cremositat i matisos intensos a cada tall' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella y Parmesano', ca: 'Mozzarella i Parmesà' },
        subtitle: { es: 'Gratinado dorado', ca: 'Gratinat daurat' },
        detail: { es: 'Fusión de cuatro quesos seleccionados', ca: 'Fusió de quatre formatges seleccionats' },
      },
      calloutTopRight: {
        title: { es: 'Salsa de tomate', ca: 'Salsa de tomàquet' },
        subtitle: { es: 'Masa fermentada 48 h', ca: 'Massa fermentada 48 h' },
        detail: { es: 'Base fina que equilibra los 4 quesos', ca: 'Base fina que equilibra els 4 formatges' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-4-estaciones',
    category: 'pizzas',
    name: { es: '4 Estaciones', ca: '4 Estacions' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, jamón dulce, champiñones y olivas negras',
      ca: 'Salsa de tomàquet, mozzarella, pernil dolç, xampinyons i olives negres',
    },
    priceCents: 1300,
    sizes: [
      { id: 'grande', label: { es: 'Pizza entera', ca: 'Pizza sencera' }, priceCents: 1300 },
      { id: 'pizzeta', label: { es: 'Pizzeta individual', ca: 'Pizzeta individual' }, priceCents: 500 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-4-estaciones.webp',
    pizza3d: {
      slug: '4-estaciones',
      image3d: '/images/pizzas-3d/pizza-4-estaciones-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-4-estaciones-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Jamón y Champiñones', ca: 'Pernil i Xampinyons' },
        subtitle: { es: 'Olivas negras', ca: 'Olives negres' },
        detail: { es: 'Clásico mediterráneo lleno de sabor', ca: 'Clàssic mediterrani ple de sabor' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella fundida', ca: 'Mozzarella fosa' },
        subtitle: { es: 'Salsa de tomate', ca: 'Salsa de tomàquet' },
        detail: { es: 'Ingredientes frescos horneados al momento', ca: 'Ingredients frescos enfornats al moment' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Crujiente, ligera y de fácil digestión', ca: 'Cruixent, lleugera i de fàcil digestió' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-barbacoa',
    category: 'pizzas',
    name: { es: 'Barbacoa', ca: 'Barbacoa' },
    ingredients: {
      es: 'Base blanca, mozzarella, bacon, carne molida, pollo y salsa barbacoa',
      ca: 'Base blanca, mozzarella, bacó, carn picada, pollastre i salsa barbacoa',
    },
    priceCents: 1300,
    sizes: [
      { id: 'grande', label: { es: 'Pizza entera', ca: 'Pizza sencera' }, priceCents: 1300 },
      { id: 'pizzeta', label: { es: 'Pizzeta individual', ca: 'Pizzeta individual' }, priceCents: 500 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-barbacoa.webp',
    pizza3d: {
      slug: 'barbacoa',
      image3d: '/images/pizzas-3d/pizza-barbacoa-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-barbacoa-v2.webp',
      sauceType: 'white',
      calloutTopLeft: {
        title: { es: 'Carne, Pollo y Bacon', ca: 'Carn, Pollastre i Bacó' },
        subtitle: { es: 'Salsa Barbacoa', ca: 'Salsa Barbacoa' },
        detail: { es: 'Toque ahumado y caramelizado al horno', ca: 'Toc fumat i caramel·litzat al forn' },
      },
      calloutBottomLeft: {
        title: { es: 'Base blanca y Mozzarella', ca: 'Base blanca i Mozzarella' },
        subtitle: { es: 'Cremosidad intensa', ca: 'Cremositat intensa' },
        detail: { es: 'Fundido perfecto con la salsa BBQ', ca: 'Fos perfecte amb la salsa BBQ' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Obrador artesanal', ca: 'Obrador artesanal' },
        detail: { es: 'Base firme y borde aireado', ca: 'Base ferma i vora airejada' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-mexicana',
    category: 'pizzas',
    name: { es: 'Mexicana', ca: 'Mexicana' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, bacon, carne molida, pollo, maíz y salsa picante',
      ca: 'Salsa de tomàquet, mozzarella, bacó, carn picada, pollastre, blat de moro i salsa picant',
    },
    priceCents: 1300,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-mexicana.webp',
    pizza3d: {
      slug: 'mexicana',
      image3d: '/images/pizzas-3d/pizza-mexicana-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-mexicana-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Carne, Pollo y Bacon', ca: 'Carn, Pollastre i Bacó' },
        subtitle: { es: 'Maíz dulce y salsa picante', ca: 'Blat de moro i salsa picant' },
        detail: { es: 'Contraste sabroso con un punto picante', ca: 'Contrast saborós amb un punt picant' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella y Tomate', ca: 'Mozzarella i Tomàquet' },
        subtitle: { es: 'Fundido generoso', ca: 'Fos generós' },
        detail: { es: 'Une todos los ingredientes en cada porción', ca: 'Uneix tots els ingredients a cada porció' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Estirada a mano al momento', ca: 'Estirada a mà al moment' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-pollo',
    category: 'pizzas',
    name: { es: 'Pollo', ca: 'Pollastre' },
    ingredients: {
      es: 'Base blanca, mozzarella, pollo, crema de leche, cebolla caramelizada, setas y parmesano',
      ca: 'Base blanca, mozzarella, pollastre, crema de llet, ceba caramel·litzada, bolets i parmesà',
    },
    priceCents: 1300,
    sizes: [
      { id: 'grande', label: { es: 'Pizza entera', ca: 'Pizza sencera' }, priceCents: 1300 },
      { id: 'pizzeta', label: { es: 'Pizzeta individual', ca: 'Pizzeta individual' }, priceCents: 500 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-pollo.webp',
    pizza3d: {
      slug: 'pollo',
      image3d: '/images/pizzas-3d/pizza-pollo-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-pollo-v2.webp',
      sauceType: 'white',
      calloutTopLeft: {
        title: { es: 'Pollo, Setas y Parmesano', ca: 'Pollastre, Bolets i Parmesà' },
        subtitle: { es: 'Cebolla caramelizada', ca: 'Ceba caramel·litzada' },
        detail: { es: 'Lascas de parmesano y setas tiernas', ca: 'Llesques de parmesà i bolets tendres' },
      },
      calloutBottomLeft: {
        title: { es: 'Base blanca y Crema', ca: 'Base blanca i Crema' },
        subtitle: { es: 'Mozzarella fundida', ca: 'Mozzarella fosa' },
        detail: { es: 'Suave, aromática y gratinada al horno', ca: 'Suau, aromàtica i gratinada al forn' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Receta artesanal', ca: 'Recepta artesanal' },
        detail: { es: 'Ligera, crujiente y muy digestiva', ca: 'Lleugera, cruixent i molt digestiva' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-mallorquina',
    category: 'pizzas',
    name: { es: 'Mallorquina', ca: 'Mallorquina' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, sobrasada, queso Brie y miel',
      ca: 'Salsa de tomàquet, mozzarella, sobrassada, formatge Brie i mel',
    },
    priceCents: 1300,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-mallorquina.webp',
    pizza3d: {
      slug: 'mallorquina',
      image3d: '/images/pizzas-3d/pizza-mallorquina-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-mallorquina-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Sobrasada y Miel', ca: 'Sobrassada i Mel' },
        subtitle: { es: 'Queso Brie fundido', ca: 'Formatge Brie fos' },
        detail: { es: 'Equilibrio dulce-salado irresistible', ca: 'Equilibri dolç-salat irresistible' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella y Brie', ca: 'Mozzarella i Brie' },
        subtitle: { es: 'Doble cremosidad', ca: 'Doble cremositat' },
        detail: { es: 'Fundidos sobre salsa de tomate natural', ca: 'Fosos sobre salsa de tomàquet natural' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Borde dorado y base fina crujiente', ca: 'Vora daurada i base fina cruixent' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-bacon',
    category: 'pizzas',
    name: { es: 'Bacon', ca: 'Bacó' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella y bacon crujiente',
      ca: 'Salsa de tomàquet, mozzarella i bacó cruixent',
    },
    priceCents: 1100,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-bacon.webp',
    pizza3d: {
      slug: 'bacon',
      image3d: '/images/pizzas-3d/pizza-bacon-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-bacon-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Bacon crujiente', ca: 'Bacó cruixent' },
        subtitle: { es: 'Tiras ahumadas', ca: 'Tires fumades' },
        detail: { es: 'Dorado al horno con sabor intenso', ca: 'Daurat al forn amb sabor intens' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella fundida', ca: 'Mozzarella fosa' },
        subtitle: { es: 'Salsa de tomate', ca: 'Salsa de tomàquet' },
        detail: { es: 'Combinación clásica que nunca falla', ca: 'Combinació clàssica que mai falla' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Hecha a mano al momento', ca: 'Feta a mà al moment' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-atun',
    category: 'pizzas',
    name: { es: 'Atún', ca: 'Tonyina' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, atún, cebolla, pimiento y olivas negras',
      ca: 'Salsa de tomàquet, mozzarella, tonyina, ceba, pebrot i olives negres',
    },
    priceCents: 1200,
    allergens: {
      es: ['Gluten', 'Lácteos', 'Pescado'],
      ca: ['Gluten', 'Làctics', 'Peix'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-atun.webp',
    pizza3d: {
      slug: 'atun',
      image3d: '/images/pizzas-3d/pizza-atun-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-atun-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Atún y Olivas negras', ca: 'Tonyina i Olives negres' },
        subtitle: { es: 'Cebolla y pimiento', ca: 'Ceba i pebrot' },
        detail: { es: 'Sabores marineros y huerta mediterránea', ca: 'Sabors mariners i horta mediterrània' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella y Tomate', ca: 'Mozzarella i Tomàquet' },
        subtitle: { es: 'Fundido equilibrado', ca: 'Fos equilibrat' },
        detail: { es: 'Base jugosa y aromática', ca: 'Base sucosa i aromàtica' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Carrer de Mar, 127', ca: 'Carrer de Mar, 127' },
        detail: { es: 'Ligera, crujiente y recién horneada', ca: 'Lleugera, cruixent i acabada d’enfornar' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-vegetal',
    category: 'pizzas',
    name: { es: 'Vegetal', ca: 'Vegetal' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, tomates cherry, calabacín, cebolla y pimiento',
      ca: 'Salsa de tomàquet, mozzarella, tomàquets cherry, carbassó, ceba i pebrot',
    },
    priceCents: 1200,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: true,
    image: '/images/menu/pizza-vegetal.webp',
    pizza3d: {
      slug: 'vegetal',
      image3d: '/images/pizzas-3d/pizza-vegetal-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-vegetal-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Cherry y Calabacín', ca: 'Cherry i Carbassó' },
        subtitle: { es: 'Cebolla y pimiento', ca: 'Ceba i pebrot' },
        detail: { es: 'Verduras frescas laminadas y asadas al horno', ca: 'Verdures fresques laminades i rostides al forn' },
      },
      calloutBottomLeft: {
        title: { es: '100% Vegetariana', ca: '100% Vegetariana' },
        subtitle: { es: 'Mozzarella y tomate', ca: 'Mozzarella i tomàquet' },
        detail: { es: 'Frescura de la huerta en cada porción', ca: 'Frescor de l’horta a cada porció' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Fina, crujiente y muy ligera', ca: 'Fina, cruixent i molt lleugera' },
      },
    },
    placeholder: false,
  },
  {
    id: 'pizza-prosciutto-olivas',
    category: 'pizzas',
    name: { es: 'Prosciutto con Olivas Negras', ca: 'Prosciutto amb Olives Negres' },
    ingredients: {
      es: 'Salsa de tomate, mozzarella, jamón dulce y olivas negras',
      ca: 'Salsa de tomàquet, mozzarella, pernil dolç i olives negres',
    },
    priceCents: 1150,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pizza-prosciutto-olivas.webp',
    pizza3d: {
      slug: 'prosciutto-olivas',
      image3d: '/images/pizzas-3d/pizza-prosciutto-olivas-v2.webp',
      floatingToppings3d: '/images/pizzas-3d/toppings-prosciutto-olivas-v2.webp',
      sauceType: 'tomato',
      calloutTopLeft: {
        title: { es: 'Jamón y Olivas negras', ca: 'Pernil i Olives negres' },
        subtitle: { es: 'Contraste mediterráneo', ca: 'Contrast mediterrani' },
        detail: { es: 'Jamón dulce tierno con olivas negras', ca: 'Pernil dolç tendre amb olives negres' },
      },
      calloutBottomLeft: {
        title: { es: 'Mozzarella fundida', ca: 'Mozzarella fosa' },
        subtitle: { es: 'Salsa de tomate', ca: 'Salsa de tomàquet' },
        detail: { es: 'Gratinado artesanal al momento', ca: 'Gratinat artesanal al moment' },
      },
      calloutTopRight: {
        title: { es: 'Masa 48 h', ca: 'Massa 48 h' },
        subtitle: { es: 'Fermentación lenta', ca: 'Fermentació lenta' },
        detail: { es: 'Borde aireado y base fina crujiente', ca: 'Vora airejada i base fina cruixent' },
      },
    },
    placeholder: false,
  },

  // ─── PIZZETAS ─────────────────────────────────────────────────────────────
  // The same six flavours the whole pizzas offer in pizzeta size, at the same prices.
  {
    id: 'pizzeta-margarita',
    category: 'pizzetas',
    name: { es: 'Porción Margarita (Pizzeta)', ca: 'Porció Margarita (Pizzeta)' },
    ingredients: {
      es: '1/4 de pizza artesanal con salsa de tomate, mozzarella y aceite de oliva',
      ca: "1/4 de pizza artesanal amb salsa de tomàquet, mozzarella i oli d'oliva",
    },
    priceCents: 300,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: true,
    image: '/images/pizzas-3d/pizzeta-margarita-v2.webp',
    placeholder: false,
  },
  {
    id: 'pizzeta-pepperoni',
    category: 'pizzetas',
    name: { es: 'Pizzeta Pepperoni', ca: 'Pizzeta Pepperoni' },
    ingredients: {
      es: 'Pizzeta artesanal con salsa de tomate, mozzarella y pepperoni',
      ca: 'Pizzeta artesanal amb salsa de tomàquet, mozzarella i pepperoni',
    },
    priceCents: 300,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/pizzas-3d/pizzeta-pepperoni-v2.webp',
    placeholder: false,
  },
  {
    id: 'pizzeta-prosciutto-funghi',
    category: 'pizzetas',
    name: { es: 'Pizzeta Prosciutto e Funghi', ca: 'Pizzeta Prosciutto e Funghi' },
    ingredients: {
      es: 'Pizzeta artesanal con salsa de tomate, mozzarella, jamón dulce y champiñones',
      ca: 'Pizzeta artesanal amb salsa de tomàquet, mozzarella, pernil dolç i xampinyons',
    },
    priceCents: 500,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/pizzas-3d/pizzeta-prosciutto-funghi-v2.webp',
    placeholder: false,
  },
  {
    id: 'pizzeta-prosciutto',
    category: 'pizzetas',
    name: { es: 'Pizzeta Prosciutto', ca: 'Pizzeta Prosciutto' },
    ingredients: {
      es: 'Pizzeta artesanal con salsa de tomate, mozzarella y jamón dulce',
      ca: 'Pizzeta artesanal amb salsa de tomàquet, mozzarella i pernil dolç',
    },
    priceCents: 500,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/pizzas-3d/pizzeta-prosciutto-v2.webp',
    placeholder: false,
  },
  {
    id: 'pizzeta-barbacoa',
    category: 'pizzetas',
    name: { es: 'Pizzeta Barbacoa', ca: 'Pizzeta Barbacoa' },
    ingredients: {
      es: 'Pizzeta artesanal con base blanca, mozzarella, bacon, carne molida, pollo y salsa barbacoa',
      ca: 'Pizzeta artesanal amb base blanca, mozzarella, bacó, carn picada, pollastre i salsa barbacoa',
    },
    priceCents: 500,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/pizzas-3d/pizzeta-barbacoa-v2.webp',
    placeholder: false,
  },
  {
    id: 'pizzeta-mexicana',
    category: 'pizzetas',
    name: { es: 'Pizzeta Mexicana', ca: 'Pizzeta Mexicana' },
    ingredients: {
      es: 'Pizzeta artesanal con salsa de tomate, mozzarella, bacon, carne molida, pollo, maíz y salsa picante',
      ca: 'Pizzeta artesanal amb salsa de tomàquet, mozzarella, bacó, carn picada, pollastre, blat de moro i salsa picant',
    },
    priceCents: 500,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/pizzas-3d/pizzeta-mexicana-v2.webp',
    placeholder: false,
  },
  {
    id: 'pack-degustacion-familiar',
    category: 'packs',
    name: {
      es: 'Pack Degustación Familiar (3 Pizzas Grandes)',
      ca: 'Pack Degustació Familiar (3 Pizzes Grans)',
    },
    ingredients: {
      es: '3 pizzas grandes a elección con masa fina de fermentación lenta (48 h). Indica los 3 sabores en las notas del pedido.',
      ca: '3 pizzes grans a escollir amb massa fina de fermentació lenta (48 h). Indica els 3 sabors a les notes de la comanda.',
    },
    priceCents: 3499,
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/menu/pack-3-pizzas.webp',
    placeholder: false,
  },

  // ─── BEBIDAS Y CERVEZAS ───────────────────────────────────────────────────
  {
    id: 'bebida-coca-cola',
    category: 'bebidas',
    name: { es: 'Coca-Cola', ca: 'Coca-Cola' },
    ingredients: { es: 'Refresco de cola', ca: 'Refresc de cola' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-coca-cola.webp',
    placeholder: false,
  },
  {
    id: 'bebida-coca-cola-zero',
    category: 'bebidas',
    name: { es: 'Coca-Cola Zero', ca: 'Coca-Cola Zero' },
    ingredients: { es: 'Refresco de cola sin azúcar', ca: 'Refresc de cola sense sucre' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-coca-cola-zero.webp',
    placeholder: false,
  },
  {
    id: 'bebida-fanta-naranja',
    category: 'bebidas',
    name: { es: 'Fanta Naranja', ca: 'Fanta Taronja' },
    ingredients: { es: 'Refresco de naranja', ca: 'Refresc de taronja' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-fanta-naranja.webp',
    placeholder: false,
  },
  {
    id: 'bebida-aquarius-limon',
    category: 'bebidas',
    name: { es: 'Aquarius Limón', ca: 'Aquarius Llimona' },
    ingredients: { es: 'Bebida isotónica sabor limón', ca: 'Beguda isotònica gust llimona' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-aquarius-limon.webp',
    placeholder: false,
  },
  {
    id: 'bebida-sprite',
    category: 'bebidas',
    name: { es: 'Sprite', ca: 'Sprite' },
    ingredients: { es: 'Refresco de lima-limón', ca: 'Refresc de llima-llimona' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-sprite.webp',
    placeholder: false,
  },
  {
    id: 'bebida-fuze-tea',
    category: 'bebidas',
    name: { es: 'Fuze Tea', ca: 'Fuze Tea' },
    ingredients: { es: 'Té frío', ca: 'Te fred' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-fuze-tea.webp',
    placeholder: false,
  },
  {
    id: 'bebida-agua-sin-gas',
    category: 'bebidas',
    name: { es: 'Agua sin gas', ca: 'Aigua sense gas' },
    ingredients: { es: 'Agua mineral natural', ca: 'Aigua mineral natural' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-agua-sin-gas.webp',
    placeholder: false,
  },
  {
    id: 'bebida-agua-con-gas',
    category: 'bebidas',
    name: { es: 'Agua con gas', ca: 'Aigua amb gas' },
    ingredients: { es: 'Agua mineral con gas', ca: 'Aigua mineral amb gas' },
    priceCents: 200,
    allergens: { es: [], ca: [] },
    vegetarian: true,
    image: '/images/menu/bebida-agua-con-gas.webp',
    placeholder: false,
  },
  {
    id: 'cerveza-estrella-tirador',
    category: 'bebidas',
    name: {
      es: 'Estrella de Galicia de tirador (Copa 330 ml)',
      ca: 'Estrella de Galicia de tirador (Copa 330 ml)',
    },
    ingredients: {
      es: 'Cerveza de tirador servida en el local (330 ml)',
      ca: 'Cervesa de tirador servida al local (330 ml)',
    },
    priceCents: 250,
    allergens: { es: ['Gluten'], ca: ['Gluten'] },
    vegetarian: true,
    image: '/images/menu/cerveza-estrella-tirador.webp',
    placeholder: false,
  },
  {
    id: 'cerveza-1906-tirador',
    category: 'bebidas',
    name: { es: '1906 de tirador', ca: '1906 de tirador' },
    ingredients: { es: 'Cerveza Reserva Especial de tirador', ca: 'Cervesa Reserva Especial de tirador' },
    priceCents: 250,
    allergens: { es: ['Gluten'], ca: ['Gluten'] },
    vegetarian: true,
    image: '/images/menu/cerveza-1906-tirador.webp',
    placeholder: false,
  },
  {
    id: 'cerveza-estrella-lata',
    category: 'bebidas',
    name: { es: 'Estrella de Galicia (En lata)', ca: 'Estrella de Galicia (En llauna)' },
    ingredients: { es: 'Cerveza lager en lata', ca: 'Cervesa lager en llauna' },
    priceCents: 250,
    allergens: { es: ['Gluten'], ca: ['Gluten'] },
    vegetarian: true,
    image: '/images/menu/cerveza-estrella-lata.webp',
    placeholder: false,
  },
  {
    id: 'cerveza-estrella-sin-alcohol',
    category: 'bebidas',
    name: {
      es: 'Estrella de Galicia Sin Alcohol (En lata)',
      ca: 'Estrella de Galicia Sense Alcohol (En llauna)',
    },
    ingredients: { es: 'Cerveza 0,0 % en lata', ca: 'Cervesa 0,0 % en llauna' },
    priceCents: 250,
    allergens: { es: ['Gluten'], ca: ['Gluten'] },
    vegetarian: true,
    image: '/images/menu/cerveza-estrella-sin-alcohol.webp',
    placeholder: false,
  },
];

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}

export function getFeaturedMenuItems(): MenuItem[] {
  return menuItems.filter((item) => item.featured);
}

export function getInteractive3dPizzas(): (MenuItem & { pizza3d: Pizza3dConfig })[] {
  return menuItems.filter(
    (item): item is MenuItem & { pizza3d: Pizza3dConfig } => Boolean(item.pizza3d)
  );
}

const PIZZETA_3D_SLUGS: Record<string, string> = {
  'pizzeta-margarita': 'margarita',
  'pizzeta-pepperoni': 'pepperoni',
  'pizzeta-prosciutto-funghi': 'prosciutto-funghi',
  'pizzeta-prosciutto': 'prosciutto',
  'pizzeta-barbacoa': 'barbacoa',
  'pizzeta-mexicana': 'mexicana',
};

/**
 * Transparent 3D render for a menu item, when one exists. These are single
 * static images (no scroll animation), so the whole menu can use them cheaply.
 */
export function getMenuItem3dImage(item: MenuItem): string | undefined {
  if (PIZZETA_3D_SLUGS[item.id]) {
    return `/images/pizzas-3d/pizzeta-${PIZZETA_3D_SLUGS[item.id]}-v2.webp`;
  }
  const slug = item.pizza3d?.slug;
  return slug ? `/images/pizzas-3d/pizza-${slug}-v2.webp` : undefined;
}

/**
 * A real product photo, if the item has one. Generic storefront / interior
 * stand-ins are not product photos and are deliberately left out.
 */
export function getMenuItemPhoto(item: MenuItem): string | undefined {
  if (item.placeholder || item.image.startsWith('/images/real/')) return undefined;
  return item.image;
}

/**
 * The short selection shown on the home page — one taste of every part of the
 * menu. The complete, indexable menu lives on /carta only, so the two pages do
 * not repeat each other.
 */
export const HOME_HIGHLIGHT_IDS = [
  'pizza-pepperoni',
  'pizza-4-quesos',
  'pizza-barbacoa',
  'pizza-carbonara',
  'pizza-prosciutto-funghi',
  'pack-degustacion-familiar',
];

export function getHomeHighlights(): MenuItem[] {
  return HOME_HIGHLIGHT_IDS.map((id) => getMenuItemById(id)).filter(
    (item): item is MenuItem => Boolean(item)
  );
}

/** The pizzeta range, cheapest first */
export function getPizzetas(): MenuItem[] {
  return menuItems
    .filter((item) => item.category === 'pizzetas')
    .sort((a, b) => a.priceCents - b.priceCents);
}

/** The 15 large 32cm pizzas */
export function getLargePizzas(): MenuItem[] {
  return menuItems.filter((item) => item.category === 'pizzas');
}

/** Real photos of the dish (stills from the shop's own video), where one exists */
const REAL_PHOTOS: Record<string, string> = {};

export function getMenuItemRealPhoto(item: MenuItem): string | undefined {
  return REAL_PHOTOS[item.id];
}
