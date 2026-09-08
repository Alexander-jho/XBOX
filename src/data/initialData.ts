import { Product, XboxConsole, ExtraControllerRate } from '../types';

export const INITIAL_CONSOLES: XboxConsole[] = [
  {
    id: 'c1',
    name: 'Consola 1',
    model: 'Xbox',
    description: 'Xbox 360 / One',
    rates: [
      { id: 'c1-r1', label: '1 hora con luz', minutes: 60, price: 3000 },
      { id: 'c1-r2', label: '30 minutos', minutes: 30, price: 2000 },
    ],
  },
  {
    id: 'c2',
    name: 'Consola 2',
    model: 'Xbox',
    description: 'Xbox 360 / One',
    rates: [
      { id: 'c2-r1', label: '1 hora con luz', minutes: 60, price: 3000 },
      { id: 'c2-r2', label: '30 minutos', minutes: 30, price: 2000 },
    ],
  },
  {
    id: 'c3',
    name: 'Consola 3',
    model: 'Xbox',
    description: 'Xbox 360 / One',
    rates: [
      { id: 'c3-r1', label: '1 hora con luz', minutes: 60, price: 3000 },
      { id: 'c3-r2', label: '30 minutos', minutes: 30, price: 2000 },
    ],
  },
  {
    id: 'c4',
    name: 'Consola 4',
    model: 'PlayStation 5',
    description: 'PS5 Next-Gen',
    rates: [
      { id: 'c4-r1', label: '20 minutos', minutes: 20, price: 3500 },
      { id: 'c4-r2', label: '30 minutos', minutes: 30, price: 4000 },
      { id: 'c4-r3', label: '1 hora', minutes: 60, price: 5000 },
    ],
  },
  {
    id: 'c5',
    name: 'Consola 5',
    model: 'PlayStation 5',
    description: 'PS5 Next-Gen',
    rates: [
      { id: 'c5-r1', label: '20 minutos', minutes: 20, price: 3500 },
      { id: 'c5-r2', label: '30 minutos', minutes: 30, price: 4000 },
      { id: 'c5-r3', label: '1 hora', minutes: 60, price: 5000 },
    ],
  },
  {
    id: 'c6',
    name: 'Consola 6',
    model: 'PlayStation 4',
    description: 'PS4 Slim',
    rates: [
      { id: 'c6-r1', label: '20 minutos', minutes: 20, price: 2500 },
      { id: 'c6-r2', label: '30 minutos', minutes: 30, price: 3000 },
      { id: 'c6-r3', label: '1 hora', minutes: 60, price: 4000 },
    ],
  },
];

export const INITIAL_EXTRA_CONTROLLER_RATES: ExtraControllerRate[] = [
  { id: 'ec-1', name: 'Tarifa Estándar ($1.500)', price: 1500 },
  { id: 'ec-2', name: 'Tarifa Especial / 1h ($2.500)', price: 2500 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- GARGUERÍA: Paquetes y Snacks ---
  { id: 'g-doritos', name: 'Doritos', area: 'gargueria', category: 'Paquetes', price: 2500, cost: 1800, stock: 15, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-chitos', name: 'Chitos', area: 'gargueria', category: 'Paquetes', price: 2000, cost: 1500, stock: 18, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-papas', name: 'Papas Margarita', area: 'gargueria', category: 'Paquetes', price: 2500, cost: 1900, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-chistys', name: 'Chistys', area: 'gargueria', category: 'Paquetes', price: 1800, cost: 1300, stock: 12, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-tosti', name: 'Tosti', area: 'gargueria', category: 'Paquetes', price: 2000, cost: 1400, stock: 14, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-chocito', name: 'Chocito', area: 'gargueria', category: 'Paquetes', price: 1500, cost: 1000, stock: 16, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-casarito', name: 'Casarito', area: 'gargueria', category: 'Paquetes', price: 2000, cost: 1400, stock: 10, minStock: 3, isActive: true, trackStock: true },
  { id: 'g-natachys', name: 'Natachys Platino', area: 'gargueria', category: 'Paquetes', price: 2200, cost: 1600, stock: 12, minStock: 4, isActive: true, trackStock: true },

  // --- GARGUERÍA: Panadería & Ponqués ---
  { id: 'g-chocorramo', name: 'Chocorramo', area: 'gargueria', category: 'Ponqués y Galletas', price: 3000, cost: 2200, stock: 14, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-gancito', name: 'Gansito', area: 'gargueria', category: 'Ponqués y Galletas', price: 2500, cost: 1800, stock: 10, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-brownie', name: 'Brownie', area: 'gargueria', category: 'Ponqués y Galletas', price: 2500, cost: 1700, stock: 12, minStock: 3, isActive: true, trackStock: true },
  { id: 'g-gula', name: 'Gula', area: 'gargueria', category: 'Ponqués y Galletas', price: 1800, cost: 1200, stock: 8, minStock: 3, isActive: true, trackStock: true },
  { id: 'g-festival', name: 'Galletas Festival', area: 'gargueria', category: 'Ponqués y Galletas', price: 1500, cost: 1000, stock: 24, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-clubsocial', name: 'Club Social', area: 'gargueria', category: 'Ponqués y Galletas', price: 1500, cost: 1000, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-oreo', name: 'Galletas Oreo', area: 'gargueria', category: 'Ponqués y Galletas', price: 2000, cost: 1400, stock: 16, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-cocosette', name: 'Cocosette', area: 'gargueria', category: 'Ponqués y Galletas', price: 2500, cost: 1700, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-cocosette-w', name: 'Cocosette Wafer', area: 'gargueria', category: 'Ponqués y Galletas', price: 1800, cost: 1200, stock: 12, minStock: 3, isActive: true, trackStock: true },
  { id: 'g-milo', name: 'Galleta Milo', area: 'gargueria', category: 'Ponqués y Galletas', price: 1500, cost: 1000, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-chokis', name: 'Chokis', area: 'gargueria', category: 'Ponqués y Galletas', price: 2000, cost: 1400, stock: 14, minStock: 4, isActive: true, trackStock: true },

  // --- GARGUERÍA: Chocolates & Golosinas ---
  { id: 'g-chocolatina', name: 'Chocolatina Jet', area: 'gargueria', category: 'Chocolates y Dulces', price: 1000, cost: 700, stock: 30, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-gol', name: 'Gol', area: 'gargueria', category: 'Chocolates y Dulces', price: 1800, cost: 1200, stock: 16, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-picola', name: 'Picola', area: 'gargueria', category: 'Chocolates y Dulces', price: 1200, cost: 800, stock: 18, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-bianchi', name: 'Bianchi', area: 'gargueria', category: 'Chocolates y Dulces', price: 600, cost: 400, stock: 40, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-mucita', name: 'Mucita', area: 'gargueria', category: 'Chocolates y Dulces', price: 800, cost: 500, stock: 25, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-punto-rojo', name: 'Punto Rojo', area: 'gargueria', category: 'Chocolates y Dulces', price: 1000, cost: 650, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-boligordo', name: 'Boligordo', area: 'gargueria', category: 'Chocolates y Dulces', price: 500, cost: 300, stock: 35, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-bombon', name: 'Bombón Bon Bon Bum', area: 'gargueria', category: 'Chocolates y Dulces', price: 700, cost: 450, stock: 45, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-bombon-sabor', name: 'Bombón Sabor', area: 'gargueria', category: 'Chocolates y Dulces', price: 800, cost: 500, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-golatina', name: 'Golatina', area: 'gargueria', category: 'Chocolates y Dulces', price: 600, cost: 350, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-chicle-ojo', name: 'Chicle Ojo', area: 'gargueria', category: 'Chocolates y Dulces', price: 500, cost: 300, stock: 40, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-cangu', name: 'Cangú', area: 'gargueria', category: 'Chocolates y Dulces', price: 600, cost: 350, stock: 25, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-halls', name: 'Halls Barra', area: 'gargueria', category: 'Chocolates y Dulces', price: 1500, cost: 1000, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-mashmelo', name: 'Mashmelo', area: 'gargueria', category: 'Chocolates y Dulces', price: 500, cost: 300, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-quipito', name: 'Quipito', area: 'gargueria', category: 'Chocolates y Dulces', price: 1000, cost: 650, stock: 25, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-cintas', name: 'Cintas Ácidas', area: 'gargueria', category: 'Chocolates y Dulces', price: 800, cost: 500, stock: 25, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-tumix', name: 'Tumix', area: 'gargueria', category: 'Chocolates y Dulces', price: 300, cost: 150, stock: 50, minStock: 15, isActive: true, trackStock: true },
  { id: 'g-mentals', name: 'Mentals', area: 'gargueria', category: 'Chocolates y Dulces', price: 500, cost: 250, stock: 30, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-walo', name: 'Walo', area: 'gargueria', category: 'Chocolates y Dulces', price: 500, cost: 300, stock: 25, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-mambo', name: 'Mambo', area: 'gargueria', category: 'Chocolates y Dulces', price: 600, cost: 350, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-poleta', name: 'Poleta', area: 'gargueria', category: 'Chocolates y Dulces', price: 800, cost: 500, stock: 22, minStock: 5, isActive: true, trackStock: true },

  // --- GARGUERÍA: Bebidas (NO Coca-Cola lata per user specifications) ---
  { id: 'b-coca-250', name: 'Coca-Cola', presentation: '250 ml', area: 'gargueria', category: 'Bebidas', price: 2000, cost: 1400, stock: 15, minStock: 5, isActive: true, trackStock: true },
  { id: 'b-coca-400', name: 'Coca-Cola', presentation: '400 ml', area: 'gargueria', category: 'Bebidas', price: 3000, cost: 2200, stock: 5, minStock: 5, isActive: true, trackStock: true },
  { id: 'b-coca-1000', name: 'Coca-Cola', presentation: '1 Litro', area: 'gargueria', category: 'Bebidas', price: 4500, cost: 3400, stock: 8, minStock: 3, isActive: true, trackStock: true },
  { id: 'b-coca-1500', name: 'Coca-Cola', presentation: '1.5 Litros', area: 'gargueria', category: 'Bebidas', price: 6000, cost: 4600, stock: 6, minStock: 2, isActive: true, trackStock: true },
  { id: 'b-coca-2500', name: 'Coca-Cola', presentation: '2.5 Litros', area: 'gargueria', category: 'Bebidas', price: 8500, cost: 6800, stock: 4, minStock: 2, isActive: true, trackStock: true },
  { id: 'b-agua-bot', name: 'Agua Cristal en Botella', presentation: '600 ml', area: 'gargueria', category: 'Bebidas', price: 2000, cost: 1100, stock: 18, minStock: 5, isActive: true, trackStock: true },
  { id: 'b-agua-bolsa', name: 'Agua en Bolsa', presentation: '350 ml', area: 'gargueria', category: 'Bebidas', price: 800, cost: 400, stock: 25, minStock: 8, isActive: true, trackStock: true },
  { id: 'b-bretana', name: 'Bretaña', presentation: '300 ml', area: 'gargueria', category: 'Bebidas', price: 2500, cost: 1700, stock: 10, minStock: 3, isActive: true, trackStock: true },
  { id: 'b-jugo-hit', name: 'Jugo Hit', presentation: '500 ml', area: 'gargueria', category: 'Bebidas', price: 2800, cost: 2000, stock: 12, minStock: 4, isActive: true, trackStock: true },

  // --- PAPELERÍA: Fotocopias e Impresiones ---
  { id: 'p-foto-bn', name: 'Fotocopia Blanco y Negro', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 200, cost: 50, stock: 500, minStock: 50, isActive: true, trackStock: false },
  { id: 'p-foto-color', name: 'Fotocopia a Color', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 800, cost: 250, stock: 500, minStock: 50, isActive: true, trackStock: false },
  { id: 'p-imp-bn', name: 'Impresión Blanco y Negro', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 500, cost: 100, stock: 500, minStock: 50, isActive: true, trackStock: false },
  { id: 'p-imp-color', name: 'Impresión a Color', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 1200, cost: 400, stock: 500, minStock: 50, isActive: true, trackStock: false },

  // --- PAPELERÍA: Papeles, Cuadernos & Carpetas ---
  { id: 'p-hoja-carta', name: 'Hoja de Block Carta', area: 'papeleria', category: 'Papeles y Cuadernos', price: 100, cost: 30, stock: 200, minStock: 50, isActive: true, trackStock: true },
  { id: 'p-hoja-oficio', name: 'Hoja de Block Oficio', area: 'papeleria', category: 'Papeles y Cuadernos', price: 150, cost: 40, stock: 150, minStock: 40, isActive: true, trackStock: true },
  { id: 'p-cuaderno-100', name: 'Cuaderno 100 Hojas', area: 'papeleria', category: 'Papeles y Cuadernos', price: 4500, cost: 3200, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'p-cuaderno-50', name: 'Cuaderno 50 Hojas', area: 'papeleria', category: 'Papeles y Cuadernos', price: 3000, cost: 2100, stock: 12, minStock: 3, isActive: true, trackStock: true },
  { id: 'p-carpeta-cartulina', name: 'Carpeta Cartulina Oficio', area: 'papeleria', category: 'Carpetas y Sobres', price: 1200, cost: 700, stock: 25, minStock: 5, isActive: true, trackStock: true },
  { id: 'p-carpeta-plastica', name: 'Carpeta Plástica con Gancho', area: 'papeleria', category: 'Carpetas y Sobres', price: 2000, cost: 1200, stock: 18, minStock: 4, isActive: true, trackStock: true },
  { id: 'p-sobre-carta', name: 'Sobre de Manila Carta', area: 'papeleria', category: 'Carpetas y Sobres', price: 500, cost: 250, stock: 30, minStock: 10, isActive: true, trackStock: true },
  { id: 'p-sobre-oficio', name: 'Sobre de Manila Oficio', area: 'papeleria', category: 'Carpetas y Sobres', price: 700, cost: 350, stock: 30, minStock: 10, isActive: true, trackStock: true },

  // --- PAPELERÍA: Escritura & Útiles ---
  { id: 'p-lapicero-negro', name: 'Lapicero Negro Kilométrico', area: 'papeleria', category: 'Escritura y Útiles', price: 1500, cost: 900, stock: 24, minStock: 6, isActive: true, trackStock: true },
  { id: 'p-lapicero-azul', name: 'Lapicero Azul Kilométrico', area: 'papeleria', category: 'Escritura y Útiles', price: 1500, cost: 900, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'p-lapicero-rojo', name: 'Lapicero Rojo Kilométrico', area: 'papeleria', category: 'Escritura y Útiles', price: 1500, cost: 900, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'p-lapiz-mirado', name: 'Lápiz Mirado No. 2', area: 'papeleria', category: 'Escritura y Útiles', price: 1200, cost: 700, stock: 25, minStock: 6, isActive: true, trackStock: true },
  { id: 'p-marcador-perm', name: 'Marcador Permanente', area: 'papeleria', category: 'Escritura y Útiles', price: 3000, cost: 1900, stock: 12, minStock: 3, isActive: true, trackStock: true },
  { id: 'p-marcador-borr', name: 'Marcador Borrable', area: 'papeleria', category: 'Escritura y Útiles', price: 3200, cost: 2100, stock: 10, minStock: 3, isActive: true, trackStock: true },
  { id: 'p-borrador', name: 'Borrador de Nata', area: 'papeleria', category: 'Escritura y Útiles', price: 800, cost: 400, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'p-sacapuntas', name: 'Sacapuntas Metálico', area: 'papeleria', category: 'Escritura y Útiles', price: 1000, cost: 550, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'p-pegante', name: 'Pegante en Barra', area: 'papeleria', category: 'Escritura y Útiles', price: 2500, cost: 1500, stock: 10, minStock: 3, isActive: true, trackStock: true },
];
