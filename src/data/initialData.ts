import { Product, XboxConsole, ExtraControllerRate, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    name: 'Administrador Principal',
    role: 'admin',
    password: 'admin',
  },
  {
    id: 'u-cajero',
    username: 'cajero',
    name: 'Cajero / Operador de Turno',
    role: 'cajero',
    password: 'cajero',
  },
];

export const INITIAL_CONSOLES: XboxConsole[] = [
  {
    id: 'c1',
    name: 'Consola 1',
    model: 'Xbox',
    description: 'Xbox 360 / One',
    rates: [
      { id: 'c1-r1', label: '30 minutos', minutes: 30, priceConLuz: 2000, priceSinLuz: 2500 },
      { id: 'c1-r2', label: '1 hora', minutes: 60, priceConLuz: 3000, priceSinLuz: 3500 },
    ],
  },
  {
    id: 'c2',
    name: 'Consola 2',
    model: 'Xbox',
    description: 'Xbox 360 / One',
    rates: [
      { id: 'c2-r1', label: '30 minutos', minutes: 30, priceConLuz: 2000, priceSinLuz: 2500 },
      { id: 'c2-r2', label: '1 hora', minutes: 60, priceConLuz: 3000, priceSinLuz: 3500 },
    ],
  },
  {
    id: 'c3',
    name: 'Consola 3',
    model: 'Xbox',
    description: 'Xbox 360 / One',
    rates: [
      { id: 'c3-r1', label: '30 minutos', minutes: 30, priceConLuz: 2000, priceSinLuz: 2500 },
      { id: 'c3-r2', label: '1 hora', minutes: 60, priceConLuz: 3000, priceSinLuz: 3500 },
    ],
  },
  {
    id: 'c4',
    name: 'Consola 4',
    model: 'PlayStation 5',
    description: 'PS5 Next-Gen',
    rates: [
      { id: 'c4-r1', label: '20 minutos', minutes: 20, priceConLuz: 3500, priceSinLuz: 4000 },
      { id: 'c4-r2', label: '30 minutos', minutes: 30, priceConLuz: 4000, priceSinLuz: 5000 },
      { id: 'c4-r3', label: '1 hora', minutes: 60, priceConLuz: 5000, priceSinLuz: 6000 },
    ],
  },
  {
    id: 'c5',
    name: 'Consola 5',
    model: 'PlayStation 5',
    description: 'PS5 Next-Gen',
    rates: [
      { id: 'c5-r1', label: '20 minutos', minutes: 20, priceConLuz: 3500, priceSinLuz: 4000 },
      { id: 'c5-r2', label: '30 minutos', minutes: 30, priceConLuz: 4000, priceSinLuz: 5000 },
      { id: 'c5-r3', label: '1 hora', minutes: 60, priceConLuz: 5000, priceSinLuz: 6000 },
    ],
  },
  {
    id: 'c6',
    name: 'Consola 6',
    model: 'PlayStation 4',
    description: 'PS4 Slim',
    rates: [
      { id: 'c6-r1', label: '20 minutos', minutes: 20, priceConLuz: 2500, priceSinLuz: 3000 },
      { id: 'c6-r2', label: '30 minutos', minutes: 30, priceConLuz: 3000, priceSinLuz: 3500 },
      { id: 'c6-r3', label: '1 hora', minutes: 60, priceConLuz: 4000, priceSinLuz: 5000 },
    ],
  },
];

export const INITIAL_EXTRA_CONTROLLER_RATES: ExtraControllerRate[] = [
  { id: 'ec-1', name: 'Control Extra (por hora)', priceConLuz: 1500, priceSinLuz: 2500 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // ==========================================
  // 14. GARGUERÍA: Los 50 productos requeridos
  // ==========================================
  { id: 'g-choclito', name: 'Choclito', area: 'gargueria', category: 'Paquetes', price: 2400, cost: 1700, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-boliqueso', name: 'Boliqueso', area: 'gargueria', category: 'Paquetes', price: 2400, cost: 1700, stock: 18, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-cheesetris', name: 'Cheese Tris', area: 'gargueria', category: 'Paquetes', price: 2400, cost: 1700, stock: 15, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-doritos', name: 'Doritos', area: 'gargueria', category: 'Paquetes', price: 3000, cost: 2100, stock: 25, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-chitos', name: 'Chitos', area: 'gargueria', category: 'Paquetes', price: 2000, cost: 1400, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-papas', name: 'Papas', area: 'gargueria', category: 'Paquetes', price: 2500, cost: 1800, stock: 24, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-tosti', name: 'Tosti', area: 'gargueria', category: 'Paquetes', price: 1800, cost: 1250, stock: 16, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-gelatina', name: 'Gelatina', area: 'gargueria', category: 'Dulces y Golosinas', price: 500, cost: 250, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-chicle-ojo', name: 'Chicle Ojo', area: 'gargueria', category: 'Dulces y Golosinas', price: 200, cost: 100, stock: 50, minStock: 15, isActive: true, trackStock: true },
  { id: 'g-candy', name: 'Candy', area: 'gargueria', category: 'Dulces y Golosinas', price: 500, cost: 250, stock: 35, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-bombom', name: 'Bombom', area: 'gargueria', category: 'Dulces y Golosinas', price: 600, cost: 350, stock: 40, minStock: 12, isActive: true, trackStock: true },
  { id: 'g-halls-barra', name: 'Halls Barra', area: 'gargueria', category: 'Dulces y Golosinas', price: 2000, cost: 1350, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-bianchi', name: 'Bianchi', area: 'gargueria', category: 'Dulces y Golosinas', price: 200, cost: 100, stock: 50, minStock: 15, isActive: true, trackStock: true },
  { id: 'g-gusanito', name: 'Gusanito', area: 'gargueria', category: 'Dulces y Golosinas', price: 200, cost: 100, stock: 50, minStock: 15, isActive: true, trackStock: true },
  { id: 'g-masmelo', name: 'Masmelo', area: 'gargueria', category: 'Dulces y Golosinas', price: 300, cost: 150, stock: 40, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-quipito', name: 'Quipito', area: 'gargueria', category: 'Dulces y Golosinas', price: 800, cost: 450, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-cintas', name: 'Cintas', area: 'gargueria', category: 'Dulces y Golosinas', price: 400, cost: 200, stock: 35, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-chocolatina', name: 'Chocolatina', area: 'gargueria', category: 'Chocolates', price: 1200, cost: 800, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-tumix', name: 'Tumix', area: 'gargueria', category: 'Dulces y Golosinas', price: 100, cost: 50, stock: 60, minStock: 20, isActive: true, trackStock: true },
  { id: 'g-bombom-tajin', name: 'Bombom sobre Tajín', area: 'gargueria', category: 'Dulces y Golosinas', price: 1800, cost: 1100, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-mentas', name: 'Mentas', area: 'gargueria', category: 'Dulces y Golosinas', price: 200, cost: 100, stock: 50, minStock: 15, isActive: true, trackStock: true },
  { id: 'g-bubbaloo', name: 'Bubbaloo', area: 'gargueria', category: 'Dulces y Golosinas', price: 300, cost: 150, stock: 50, minStock: 15, isActive: true, trackStock: true },
  { id: 'g-nucita', name: 'Nucita', area: 'gargueria', category: 'Dulces y Golosinas', price: 1200, cost: 750, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-punto', name: 'Punto', area: 'gargueria', category: 'Dulces y Golosinas', price: 200, cost: 100, stock: 40, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-chocorramo', name: 'Chocorramo', area: 'gargueria', category: 'Ponqués y Galletas', price: 3000, cost: 2100, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-gancito', name: 'Gancito', area: 'gargueria', category: 'Ponqués y Galletas', price: 2500, cost: 1750, stock: 15, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-brownie', name: 'Brownie', area: 'gargueria', category: 'Ponqués y Galletas', price: 3500, cost: 2400, stock: 12, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-gala', name: 'Gala', area: 'gargueria', category: 'Ponqués y Galletas', price: 2500, cost: 1750, stock: 14, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-festival-galleta', name: 'Festival Galleta', area: 'gargueria', category: 'Ponqués y Galletas', price: 1200, cost: 800, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-club-social', name: 'Club Social', area: 'gargueria', category: 'Ponqués y Galletas', price: 1200, cost: 800, stock: 25, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-detodito', name: 'Detodito', area: 'gargueria', category: 'Paquetes', price: 3000, cost: 2100, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-minichips', name: 'Minichips', area: 'gargueria', category: 'Ponqués y Galletas', price: 1800, cost: 1200, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-gol', name: 'Gol', area: 'gargueria', category: 'Chocolates', price: 2000, cost: 1350, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-piazza', name: 'Piazza', area: 'gargueria', category: 'Ponqués y Galletas', price: 600, cost: 350, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-milo', name: 'Milo', area: 'gargueria', category: 'Ponqués y Galletas', price: 1400, cost: 950, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-oreo', name: 'Oreo', area: 'gargueria', category: 'Ponqués y Galletas', price: 1500, cost: 1000, stock: 24, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-cocosette', name: 'Cocosette', area: 'gargueria', category: 'Ponqués y Galletas', price: 1400, cost: 950, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-cocosette-barra', name: 'Cocosette Barra', area: 'gargueria', category: 'Ponqués y Galletas', price: 2400, cost: 1650, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-mamut', name: 'Mamut', area: 'gargueria', category: 'Ponqués y Galletas', price: 600, cost: 350, stock: 25, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-chokis', name: 'Chokis', area: 'gargueria', category: 'Ponqués y Galletas', price: 2000, cost: 1400, stock: 18, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-natuchis', name: 'Natuchis', area: 'gargueria', category: 'Paquetes', price: 3000, cost: 2100, stock: 15, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-popeta', name: 'Popeta', area: 'gargueria', category: 'Paquetes', price: 2700, cost: 1900, stock: 14, minStock: 4, isActive: true, trackStock: true },
  { id: 'g-bombazo', name: 'Bombazo', area: 'gargueria', category: 'Dulces y Golosinas', price: 300, cost: 150, stock: 35, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-yupi-pequeno', name: 'Yupi Pequeño', area: 'gargueria', category: 'Paquetes', price: 800, cost: 450, stock: 25, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-bocadillo-hoja', name: 'Bocadillo Hoja', area: 'gargueria', category: 'Dulces y Golosinas', price: 700, cost: 400, stock: 25, minStock: 6, isActive: true, trackStock: true },
  { id: 'g-bocadillo', name: 'Bocadillo', area: 'gargueria', category: 'Dulces y Golosinas', price: 600, cost: 350, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-big-ben', name: 'Big Ben', area: 'gargueria', category: 'Dulces y Golosinas', price: 300, cost: 150, stock: 40, minStock: 10, isActive: true, trackStock: true },
  { id: 'g-piramide', name: 'Pirámide', area: 'gargueria', category: 'Dulces y Golosinas', price: 600, cost: 350, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'g-manicero', name: 'Manicero', area: 'gargueria', category: 'Snacks y Maní', price: 1400, cost: 950, stock: 20, minStock: 5, isActive: true, trackStock: true },
  { id: 'g-manimoto', name: 'Manimoto', area: 'gargueria', category: 'Snacks y Maní', price: 2300, cost: 1600, stock: 20, minStock: 5, isActive: true, trackStock: true },

  // ==========================================
  // 16. BEBIDAS (Con presentación integrada, sin lata)
  // ==========================================
  { id: 'b-coca-250', name: 'Coca-Cola', brand: 'Coca-Cola', presentation: '250 ml', area: 'gargueria', category: 'Bebidas', price: 2000, cost: 1400, stock: 18, minStock: 5, isActive: true, trackStock: true },
  { id: 'b-coca-400', name: 'Coca-Cola', brand: 'Coca-Cola', presentation: '400 ml', area: 'gargueria', category: 'Bebidas', price: 3000, cost: 2200, stock: 15, minStock: 5, isActive: true, trackStock: true },
  { id: 'b-coca-1000', name: 'Coca-Cola', brand: 'Coca-Cola', presentation: '1 Litro', area: 'gargueria', category: 'Bebidas', price: 4500, cost: 3400, stock: 10, minStock: 3, isActive: true, trackStock: true },
  { id: 'b-coca-1500', name: 'Coca-Cola', brand: 'Coca-Cola', presentation: '1.5 Litros', area: 'gargueria', category: 'Bebidas', price: 6000, cost: 4600, stock: 8, minStock: 3, isActive: true, trackStock: true },
  { id: 'b-agua-bot', name: 'Agua en botella', brand: 'Cristal', presentation: '600 ml', area: 'gargueria', category: 'Bebidas', price: 2000, cost: 1100, stock: 20, minStock: 6, isActive: true, trackStock: true },
  { id: 'b-agua-bolsa', name: 'Agua en bolsa', brand: 'Cristal', presentation: '350 ml', area: 'gargueria', category: 'Bebidas', price: 800, cost: 400, stock: 30, minStock: 8, isActive: true, trackStock: true },
  { id: 'b-bretana', name: 'Bretaña', brand: 'Postobón', presentation: '300 ml', area: 'gargueria', category: 'Bebidas', price: 2500, cost: 1700, stock: 12, minStock: 4, isActive: true, trackStock: true },
  { id: 'b-milo', name: 'Milo', brand: 'Nestlé', presentation: '200 ml', area: 'gargueria', category: 'Bebidas', price: 2500, cost: 1800, stock: 14, minStock: 4, isActive: true, trackStock: true },

  // ==========================================
  // 17. PAPELERÍA (Sin control de stock)
  // ==========================================
  { id: 'p-foto-bn', name: 'Fotocopia Blanco y Negro', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 200, cost: 50, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-foto-color', name: 'Fotocopia a Color', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 800, cost: 200, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-imp-bn', name: 'Impresión Blanco y Negro', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 500, cost: 100, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-imp-color', name: 'Impresión a Color', area: 'papeleria', category: 'Fotocopias e Impresiones', price: 1200, cost: 350, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-lapicero-negro', name: 'Lapicero Negro', area: 'papeleria', category: 'Escritura y Útiles', price: 1500, cost: 800, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-lapicero-azul', name: 'Lapicero Azul', area: 'papeleria', category: 'Escritura y Útiles', price: 1500, cost: 800, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-lapicero-rojo', name: 'Lapicero Rojo', area: 'papeleria', category: 'Escritura y Útiles', price: 1500, cost: 800, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-lapiz', name: 'Lápiz Mirado No. 2', area: 'papeleria', category: 'Escritura y Útiles', price: 1200, cost: 600, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-cuaderno-100', name: 'Cuaderno 100 Hojas', area: 'papeleria', category: 'Papeles y Cuadernos', price: 4500, cost: 3000, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-cuaderno-50', name: 'Cuaderno 50 Hojas', area: 'papeleria', category: 'Papeles y Cuadernos', price: 3000, cost: 2000, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-carpeta-cartulina', name: 'Carpeta Cartulina', area: 'papeleria', category: 'Carpetas y Sobres', price: 1200, cost: 600, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-carpeta-plastica', name: 'Carpeta Plástica', area: 'papeleria', category: 'Carpetas y Sobres', price: 2000, cost: 1100, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-sobre-carta', name: 'Sobre de Manila Carta', area: 'papeleria', category: 'Carpetas y Sobres', price: 500, cost: 200, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-sobre-oficio', name: 'Sobre de Manila Oficio', area: 'papeleria', category: 'Carpetas y Sobres', price: 700, cost: 300, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-borrador', name: 'Borrador de Nata', area: 'papeleria', category: 'Escritura y Útiles', price: 800, cost: 350, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-sacapuntas', name: 'Sacapuntas Metálico', area: 'papeleria', category: 'Escritura y Útiles', price: 1000, cost: 450, stock: 0, minStock: 0, isActive: true, trackStock: false },
  { id: 'p-pegante', name: 'Pegante en Barra', area: 'papeleria', category: 'Escritura y Útiles', price: 2500, cost: 1400, stock: 0, minStock: 0, isActive: true, trackStock: false },
];
