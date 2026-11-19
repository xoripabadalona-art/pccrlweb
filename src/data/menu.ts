export type MenuCategoryId = 'pizzas' | 'pizzetas' | 'empanadas' | 'bebidas';

export interface MenuSizeOption {
  id: string;
  label: {
    es: string;
    ca: string;
  };
  priceCents: number;
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
  /**
   * Flagged true when any part of the item (such as individual dish photography or
   * verified allergen chart) is still a placeholder awaiting client confirmation.
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
    id: 'pizzas',
    label: { es: 'Pizzas', ca: 'Pizzes' },
    description: {
      es: 'Masa artesanal con 48 horas de fermentación lenta, estirada al momento.',
      ca: 'Massa artesanal amb 48 hores de fermentació lenta, estirada al moment.',
    },
  },
  {
    id: 'pizzetas',
    label: { es: 'Pizzetas y Packs', ca: 'Pizzetes i Packs' },
    description: {
      es: 'Porciones individuales hechas al momento y pack degustación familiar.',
      ca: 'Porcions individuals fetes al moment i pack degustació familiar.',
    },
  },
  {
    id: 'empanadas',
    label: { es: 'Empanadas', ca: 'Empanades' },
    description: {
      es: 'Receta tradicional estilo argentino. 1 unidad 3,00 € · 6 uds 15,00 € · 12 uds 30,00 €.',
      ca: 'Recepta tradicional estil argentí. 1 unitat 3,00 € · 6 uts 15,00 € · 12 uts 30,00 €.',
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

/**
 * Menu items transcribed from the client's physical CARTA and storefront signage.
 * Note: Individual product photos (except Pepperoni) and official allergen cross-contamination
 * details are marked with `placeholder: true` so the build prints a verification report.
 */
export const menuItems: MenuItem[] = [
  // ─── PIZZAS ───────────────────────────────────────────────────────────────
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: replace shared pizza photo with dedicated Margarita photo & confirm allergens',
  },
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
    image: '/images/real/pizza-pepperoni-box.webp',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Prosciutto',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Prosciutto e Funghi',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Bacon',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza 4 Quesos',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Atún',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza 4 Estaciones',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Carbonara',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Mexicana',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Barbacoa',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Pollo',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Vegetal',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply real photo for Pizza Mallorquina',
  },

  // ─── PIZZETAS Y PACKS ─────────────────────────────────────────────────────
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply dedicated Pizzeta Margarita photo',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: false,
  },
  {
    id: 'pack-degustacion-familiar',
    category: 'pizzetas',
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
    image: '/images/real/pizza-pepperoni-box.webp',
    placeholder: false,
  },

  // ─── EMPANADAS ────────────────────────────────────────────────────────────
  {
    id: 'empanada-carne',
    category: 'empanadas',
    name: {
      es: 'Empanada de Carne cortada a cuchillo',
      ca: 'Empanada de Carn tallada a ganivet',
    },
    ingredients: {
      es: 'Ternera cortada a cuchillo, cebolla blanca, cebolla verde, huevo duro y especias',
      ca: 'Vedella tallada a ganivet, ceba blanca, ceba tendra, ou dur i espècies',
    },
    priceCents: 300,
    sizes: [
      { id: '1-ud', label: { es: '1 unidad', ca: '1 unitat' }, priceCents: 300 },
      { id: '6-uds', label: { es: 'Media docena (6 uds)', ca: 'Mitja dotzena (6 uts)' }, priceCents: 1500 },
      { id: '12-uds', label: { es: 'Docena (12 uds)', ca: 'Dotzena (12 uts)' }, priceCents: 3000 },
    ],
    allergens: {
      es: ['Gluten', 'Huevo'],
      ca: ['Gluten', 'Ou'],
    },
    vegetarian: false,
    featured: true,
    image: '/images/real/storefront-close.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply close-up photo of Empanada de Carne cortada a cuchillo',
  },
  {
    id: 'empanada-jamon-queso',
    category: 'empanadas',
    name: { es: 'Empanada de Jamón y Queso', ca: 'Empanada de Pernil i Formatge' },
    ingredients: {
      es: 'Jamón dulce y mozzarella italiana',
      ca: 'Pernil dolç i mozzarella italiana',
    },
    priceCents: 300,
    sizes: [
      { id: '1-ud', label: { es: '1 unidad', ca: '1 unitat' }, priceCents: 300 },
      { id: '6-uds', label: { es: 'Media docena (6 uds)', ca: 'Mitja dotzena (6 uts)' }, priceCents: 1500 },
      { id: '12-uds', label: { es: 'Docena (12 uds)', ca: 'Dotzena (12 uts)' }, priceCents: 3000 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: false,
    image: '/images/real/storefront-close.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply close-up photo of Empanada de Jamón y Queso',
  },
  {
    id: 'empanada-pollo',
    category: 'empanadas',
    name: { es: 'Empanada de Pollo', ca: 'Empanada de Pollastre' },
    ingredients: {
      es: 'Pollo, cebolla blanca, cebolla verde, huevo duro y especias',
      ca: 'Pollastre, ceba blanca, ceba tendra, ou dur i espècies',
    },
    priceCents: 300,
    sizes: [
      { id: '1-ud', label: { es: '1 unidad', ca: '1 unitat' }, priceCents: 300 },
      { id: '6-uds', label: { es: 'Media docena (6 uds)', ca: 'Mitja dotzena (6 uts)' }, priceCents: 1500 },
      { id: '12-uds', label: { es: 'Docena (12 uds)', ca: 'Dotzena (12 uts)' }, priceCents: 3000 },
    ],
    allergens: {
      es: ['Gluten', 'Huevo'],
      ca: ['Gluten', 'Ou'],
    },
    vegetarian: false,
    image: '/images/real/storefront-close.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply close-up photo of Empanada de Pollo',
  },
  {
    id: 'empanada-cuatro-quesos',
    category: 'empanadas',
    name: { es: 'Empanada Cuatro Quesos', ca: 'Empanada Quatre Formatges' },
    ingredients: {
      es: 'Queso de cabra, queso azul, mozzarella, emmental y nuez moscada',
      ca: 'Formatge de cabra, formatge blau, mozzarella, emmental i nou moscada',
    },
    priceCents: 300,
    sizes: [
      { id: '1-ud', label: { es: '1 unidad', ca: '1 unitat' }, priceCents: 300 },
      { id: '6-uds', label: { es: 'Media docena (6 uds)', ca: 'Mitja dotzena (6 uts)' }, priceCents: 1500 },
      { id: '12-uds', label: { es: 'Docena (12 uds)', ca: 'Dotzena (12 uts)' }, priceCents: 3000 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: true,
    image: '/images/real/storefront-close.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply close-up photo of Empanada Cuatro Quesos',
  },
  {
    id: 'empanada-queso-cebolla',
    category: 'empanadas',
    name: { es: 'Empanada de Queso y Cebolla', ca: 'Empanada de Formatge i Ceba' },
    ingredients: {
      es: 'Cebolla caramelizada, mozzarella italiana y especias',
      ca: 'Ceba caramel·litzada, mozzarella italiana i espècies',
    },
    priceCents: 300,
    sizes: [
      { id: '1-ud', label: { es: '1 unidad', ca: '1 unitat' }, priceCents: 300 },
      { id: '6-uds', label: { es: 'Media docena (6 uds)', ca: 'Mitja dotzena (6 uts)' }, priceCents: 1500 },
      { id: '12-uds', label: { es: 'Docena (12 uds)', ca: 'Dotzena (12 uts)' }, priceCents: 3000 },
    ],
    allergens: {
      es: ['Gluten', 'Lácteos'],
      ca: ['Gluten', 'Làctics'],
    },
    vegetarian: true,
    image: '/images/real/storefront-close.webp',
    placeholder: true,
    placeholderNote: 'TODO: supply close-up photo of Empanada de Queso y Cebolla',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
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
    image: '/images/real/interior-day.webp',
    placeholder: false,
  },
];

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}

export function getFeaturedMenuItems(): MenuItem[] {
  return menuItems.filter((item) => item.featured);
}
