export type BusinessArea = 'gargueria' | 'xbox' | 'papeleria';

export type PaymentMethod = 'efectivo' | 'transferencia';

export type TransferProvider = 'Nequi' | 'Daviplata' | 'Bancolombia' | 'Otro';

export type NavTab = 'dashboard' | 'xbox' | 'inventory' | 'transfers' | 'history' | 'settings';

export interface Product {
  id: string;
  name: string;
  area: 'gargueria' | 'papeleria';
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  presentation?: string; // e.g. "400 ml", "1.5 L", "Bolsa"
  isActive: boolean;
  trackStock: boolean;
}

export interface ConsoleRate {
  id: string;
  label: string; // e.g. "1 hora", "30 minutos", "20 minutos"
  minutes: number;
  price: number;
}

export interface ExtraControllerRate {
  id: string;
  name: string; // e.g. "Estándar 1h ($1.500)", "Tarifa Pro ($2.500)"
  price: number;
}

export interface XboxConsole {
  id: string;
  name: string; // "Consola 1", "Consola 2", etc.
  model: 'Xbox' | 'PlayStation 5' | 'PlayStation 4';
  description?: string;
  rates: ConsoleRate[];
}

export interface ActiveXboxSession {
  id: string;
  consoleId: string;
  consoleName: string;
  consoleModel: string;
  startTime: number; // timestamp in ms
  durationMinutes: number;
  endTime: number; // timestamp in ms
  rateLabel: string;
  basePrice: number;
  extraControllers: number;
  extraControllerRateId?: string;
  extraControllerRateName?: string;
  extraControllerPrice: number;
  totalPrice: number;
  notes?: string;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  transferProvider?: TransferProvider;
  transferReference?: string;
}

export interface SaleItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category?: string;
}

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number;
  area: BusinessArea;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  transferProvider?: TransferProvider;
  transferReference?: string;
  cashGiven?: number;
  change?: number;
  notes?: string;
  consoleSessionId?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number;
  concept: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CashWithdrawal {
  id: string;
  time: string;
  timestamp: number;
  amount: number;
  reason: string;
}

export interface CashClosure {
  id: string;
  date: string; // YYYY-MM-DD
  openedAt: number;
  closedAt: number;
  initialCash: number;
  cashSales: number;
  transferSales: number;
  totalSales: number;
  cashExpenses: number;
  transferExpenses: number;
  totalExpenses: number;
  cashWithdrawalsTotal: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  status: 'cuadrada' | 'faltante' | 'sobrante';
  notes?: string;
}

export interface CurrentCashRegister {
  id: string;
  date: string; // YYYY-MM-DD
  openedAt: number;
  initialCash: number;
  isOpen: boolean;
  withdrawals: CashWithdrawal[];
}

export interface InventoryEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  date: string;
  time: string;
  timestamp: number;
  notes?: string;
}
