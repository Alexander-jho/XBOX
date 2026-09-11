export type BusinessArea = 'gargueria' | 'xbox' | 'papeleria';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'credito';

export type TransferProvider = 'Nequi' | 'Daviplata' | 'Bancolombia' | 'Otro';

export type LightMode = 'con_luz' | 'sin_luz';

export type UserRole = 'admin' | 'operador' | 'cajero';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
}

export type NavTab =
  | 'dashboard'
  | 'xbox'
  | 'inventory'
  | 'transfers'
  | 'history'
  | 'reports'
  | 'credits'
  | 'settings';

export interface Product {
  id: string;
  name: string;
  area: 'gargueria' | 'papeleria';
  category: string;
  brand?: string;
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
  priceConLuz: number;
  priceSinLuz: number;
}

export interface ExtraControllerRate {
  id: string;
  name: string;
  priceConLuz: number; // e.g. 1500
  priceSinLuz: number; // e.g. 2500
}

export interface XboxConsole {
  id: string;
  name: string; // "Consola 1", "Consola 2", etc.
  model: 'Xbox' | 'PlayStation 5' | 'PlayStation 4';
  description?: string;
  rates: ConsoleRate[];
}

export interface SessionProductItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category?: string;
}

export interface ActiveXboxSession {
  id: string;
  accountNumber: string; // e.g. "CUENTA #001"
  consoleId: string;
  consoleName: string;
  consoleModel: 'Xbox' | 'PlayStation 5' | 'PlayStation 4';
  lightMode: LightMode;
  startTime: number; // timestamp in ms
  durationMinutes: number; // total minutes
  endTime: number; // timestamp in ms
  initialMinutes: number;
  initialRateLabel: string;
  initialPrice: number;
  addedTimeMinutes: number;
  addedTimePrice: number;
  extraControllers: number;
  extraControllerPrice: number;
  products: SessionProductItem[];
  totalPrice: number;
  notes?: string;
  isPaid?: boolean;
  paymentMethod?: PaymentMethod;
  transferProvider?: TransferProvider;
  transferReference?: string;
}

export interface ClosedConsoleSession {
  id: string;
  accountNumber: string;
  consoleId: string;
  consoleName: string;
  consoleModel: string;
  lightMode: LightMode;
  startTime: number;
  endTime: number;
  initialMinutes: number;
  addedMinutes: number;
  totalMinutes: number;
  extraControllers: number;
  extraControllerPrice: number;
  products: SessionProductItem[];
  totalConsoleTimePrice: number;
  totalProductsPrice: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  transferProvider?: TransferProvider;
  transferReference?: string;
  closedAt: number;
  saleId: string;
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
  isExtemporaneous?: boolean;
  recordedBy?: string;
  customerName?: string;
  customerPhone?: string;
  creditId?: string;
  editedAt?: number;
  editedBy?: string;
  originalTotal?: number;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number;
  concept: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transferProvider?: TransferProvider;
  transferReference?: string;
  notes?: string;
}

export interface CashWithdrawal {
  id: string;
  time: string;
  timestamp: number;
  amount: number;
  reason: string;
}

export interface CreditPayment {
  id: string;
  creditId: string;
  amount: number;
  paymentMethod: 'efectivo' | 'transferencia';
  transferProvider?: TransferProvider;
  transferReference?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number;
  receivedBy?: string;
  notes?: string;
}

export interface CreditAccount {
  id: string;
  customerName: string;
  customerPhone?: string;
  saleId?: string;
  saleTotal: number;
  currentBalance: number; // remaining debt
  paidAmount: number; // total paid so far
  area: BusinessArea;
  itemsSummary: string;
  status: 'pendiente' | 'pagado';
  createdAt: number;
  createdDate: string; // YYYY-MM-DD
  createdTime: string; // HH:MM
  dueDate?: string;
  payments: CreditPayment[];
  notes?: string;
}

export interface CashClosure {
  id: string;
  date: string; // YYYY-MM-DD
  openedAt: number;
  closedAt: number;
  initialCash: number;
  initialCashGeneral?: number;
  initialCashTragamonedas?: number;
  cashSales: number;
  transferSales: number;
  totalSales: number;
  creditSalesTotal?: number;
  creditPaymentsCash?: number;
  creditPaymentsTransfer?: number;
  creditPaymentsTotal?: number;
  cashExpenses: number;
  transferExpenses: number;
  totalExpenses: number;
  cashWithdrawalsTotal: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  status: 'cuadrada' | 'faltante' | 'sobrante';
  gargueriaSales: number;
  xboxSales: number;
  papeleriaSales: number;
  consoleSessionsCount: number;
  productsSoldCount: number;
  notes?: string;
}

export interface CurrentCashRegister {
  id: string;
  date: string; // YYYY-MM-DD
  openedAt: number;
  initialCash: number;
  initialCashGeneral?: number;
  initialCashTragamonedas?: number;
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

export type CloudSyncStatus = 'online' | 'offline' | 'connecting' | 'reconnecting';

export interface SyncDiagnosticInfo {
  status: CloudSyncStatus;
  statusLabel: string;
  isOnline: boolean;
  version: number;
  latencyMs: number | null;
  lastSyncTimestamp: number | null;
  pendingQueueCount: number;
  lastSyncTimeFormatted: string;
  isFallbackActive: boolean;
  errorMessage?: string;
}

