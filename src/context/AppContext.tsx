import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  XboxConsole,
  ExtraControllerRate,
  ActiveXboxSession,
  ClosedConsoleSession,
  SessionProductItem,
  Sale,
  Expense,
  CurrentCashRegister,
  CashClosure,
  InventoryEntry,
  BusinessArea,
  PaymentMethod,
  TransferProvider,
  LightMode,
  User,
  UserRole,
  CreditAccount,
  CreditPayment,
} from '../types';
import {
  INITIAL_CONSOLES,
  INITIAL_EXTRA_CONTROLLER_RATES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from '../data/initialData';
import { getTodayDateString, getCurrentTimeString, playAlertSound } from '../utils/formatters';

interface AppContextType {
  // Authentication & Users
  users: User[];
  currentUser: User;
  loginUser: (username: string, password?: string) => { success: boolean; message?: string };
  switchUser: (username: string) => void;
  logoutUser: () => void;
  saveUser: (user: User) => void;

  // Catalogs and Configuration
  products: Product[];
  consoles: XboxConsole[];
  extraControllerRates: ExtraControllerRate[];

  // Operational Data
  activeSessions: ActiveXboxSession[];
  closedSessions: ClosedConsoleSession[];
  sales: Sale[];
  expenses: Expense[];
  currentCash: CurrentCashRegister;
  cashClosures: CashClosure[];
  inventoryEntries: InventoryEntry[];

  // Daily Calculated Stats
  todayDate: string;
  todaySalesTotal: number;
  todayCashSales: number;
  todayTransferSales: number;
  todayCreditSalesTotal: number;
  todayExpensesTotal: number;
  todayCashExpenses: number;
  todayTransferExpenses: number;
  todayWithdrawalsTotal: number;
  todayExpectedCash: number;
  areaSales: {
    gargueria: number;
    xbox: number;
    papeleria: number;
  };
  todayConsoleSessionsCount: number;
  todayProductsSoldCount: number;
  lowStockProducts: Product[];

  // Credits / Fiados
  credits: CreditAccount[];
  addCreditSale: (data: {
    customerName: string;
    customerPhone?: string;
    area: BusinessArea;
    itemsSummary: string;
    total: number;
    notes?: string;
    dueDate?: string;
    saleId?: string;
  }) => CreditAccount;
  registerCreditPayment: (
    creditId: string,
    payment: {
      amount: number;
      paymentMethod: 'efectivo' | 'transferencia';
      transferProvider?: TransferProvider;
      transferReference?: string;
      notes?: string;
      date?: string;
      time?: string;
    }
  ) => void;
  deleteCredit: (creditId: string) => void;
  pendingCreditsCount: number;
  totalPendingCreditsAmount: number;
  todayCreditPayments: CreditPayment[];
  todayCashCreditPayments: number;
  todayTransferCreditPayments: number;
  todayCreditPaymentsTotal: number;

  // Password Management
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  adminUpdateUserPassword: (userId: string, newPassword: string) => { success: boolean; message: string };

  // Operations
  registerSale: (saleData: {
    area: BusinessArea;
    items: {
      productId?: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      category?: string;
    }[];
    total: number;
    paymentMethod: PaymentMethod;
    transferProvider?: TransferProvider;
    transferReference?: string;
    cashGiven?: number;
    change?: number;
    notes?: string;
    consoleSessionId?: string;
    date?: string;
    time?: string;
    timestamp?: number;
    isExtemporaneous?: boolean;
    customerName?: string;
    customerPhone?: string;
  }) => Sale;

  // Xbox Open Account Operations
  startXboxSession: (params: {
    consoleId: string;
    durationMinutes: number;
    lightMode: LightMode;
    rateLabel: string;
    basePrice: number;
    extraControllers: number;
    extraControllerPrice: number;
    notes?: string;
  }) => ActiveXboxSession;

  addTimeToSession: (
    sessionId: string,
    additionalMinutes: number,
    additionalPrice: number
  ) => void;

  addProductToSession: (
    sessionId: string,
    product: Product,
    quantity: number
  ) => void;

  removeProductFromSession: (sessionId: string, itemIndex: number) => void;

  addExtraControllersToSession: (
    sessionId: string,
    count: number,
    pricePerUnit: number
  ) => void;

  finalizeXboxSessionAndPay: (
    sessionId: string,
    paymentMethod: PaymentMethod,
    transferProvider?: TransferProvider,
    transferReference?: string
  ) => void;

  cancelXboxSession: (sessionId: string) => void;

  // Expenses, Cash & Inventory
  addExpense: (data: {
    concept: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transferProvider?: TransferProvider;
    transferReference?: string;
    notes?: string;
  }) => void;

  openCashRegister: (initialCash: number) => void;
  addCashWithdrawal: (amount: number, reason: string) => void;
  closeCashRegister: (countedCash: number, notes?: string) => CashClosure;

  addInventoryEntry: (data: {
    productId: string;
    quantity: number;
    unitCost: number;
    supplier: string;
    notes?: string;
  }) => void;

  isAdmin: boolean;
  saveProduct: (product: Product) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  deleteOrDeactivateProduct: (productId: string) => void;
  saveConsoleRates: (consoleId: string, rates: XboxConsole['rates']) => void;
  updateConsoleRates: (consoleId: string, rates: XboxConsole['rates']) => void;
  saveExtraControllerRates: (rates: ExtraControllerRate[]) => void;
  updateExtraControllerRates: (rates: ExtraControllerRate[]) => void;
  resetToDefaults: () => void;
  resetToInitialDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'pos_control_users_v2',
  CURRENT_USER: 'pos_control_current_user_v2',
  PRODUCTS: 'pos_control_products_v2',
  CONSOLES: 'pos_control_consoles_v2',
  EXTRA_CONTROLLERS: 'pos_control_extra_ctrl_v2',
  SESSIONS: 'pos_control_sessions_v2',
  CLOSED_SESSIONS: 'pos_control_closed_sessions_v2',
  SALES: 'pos_control_sales_v2',
  EXPENSES: 'pos_control_expenses_v2',
  CASH: 'pos_control_cash_v2',
  CLOSURES: 'pos_control_closures_v2',
  INVENTORY_ENTRIES: 'pos_control_inventory_entries_v2',
  ACCOUNT_SEQ: 'pos_control_acc_seq_v2',
  CREDITS: 'pos_control_credits_v2',
};

const INITIAL_CREDITS: CreditAccount[] = [
  {
    id: 'cred-sample-1',
    customerName: 'Carlos Rodríguez',
    customerPhone: '3124567890',
    saleTotal: 15000,
    currentBalance: 7000,
    paidAmount: 8000,
    area: 'papeleria',
    itemsSummary: '2x Cuaderno Cuadriculado, 1x Resaltador Pelikan',
    status: 'pendiente',
    createdAt: Date.now() - 86400000 * 2,
    createdDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    createdTime: '15:30',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    payments: [
      {
        id: 'cp-sample-1',
        creditId: 'cred-sample-1',
        amount: 8000,
        paymentMethod: 'efectivo',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '16:00',
        timestamp: Date.now() - 86400000,
        receivedBy: 'Operador de Turno',
        notes: 'Abono inicial en efectivo',
      },
    ],
    notes: 'Vecino del frente, abona los viernes',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();

  // 1. Users & Current User
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (!parsed.some(u => u.username === 'operador')) {
            parsed.push({
              id: 'u-operador',
              username: 'operador',
              name: 'Operador de Turno',
              role: 'operador',
              password: 'operador',
            });
          }
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_USERS[0]; // Default to Admin for immediate exploration
  });

  // 2. Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        // Ensure papeleria items have trackStock enabled and positive minStock if 0
        if (Array.isArray(parsed)) {
          return parsed.map(p => {
            if (p.area === 'papeleria' && !p.trackStock) {
              return { ...p, trackStock: true, stock: p.stock > 0 ? p.stock : 25, minStock: p.minStock || 5 };
            }
            return p;
          });
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_PRODUCTS;
  });

  // 3. Consoles
  const [consoles, setConsoles] = useState<XboxConsole[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONSOLES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CONSOLES;
  });

  // 4. Extra Controller Rates
  const [extraControllerRates, setExtraControllerRates] = useState<ExtraControllerRate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXTRA_CONTROLLERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EXTRA_CONTROLLER_RATES;
  });

  // 5. Active Xbox Sessions (Open Accounts)
  const [activeSessions, setActiveSessions] = useState<ActiveXboxSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 6. Closed Console Sessions History
  const [closedSessions, setClosedSessions] = useState<ClosedConsoleSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOSED_SESSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 7. Sales
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 8. Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 9. Current Cash Register
  const [currentCash, setCurrentCash] = useState<CurrentCashRegister>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) { console.error(e); }
    }
    return {
      id: `cash-${todayStr}`,
      date: todayStr,
      openedAt: Date.now(),
      initialCash: 50000, // Default base inicial $50.000 COP
      isOpen: true,
      withdrawals: [],
    };
  });

  // 10. Cash Closures History
  const [cashClosures, setCashClosures] = useState<CashClosure[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOSURES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 11. Inventory Entries
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY_ENTRIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 12. Account Sequence Number
  const [accountSeq, setAccountSeq] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNT_SEQ);
    return saved ? parseInt(saved, 10) : 1;
  });

  // 13. Credits / Fiados
  const [credits, setCredits] = useState<CreditAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREDITS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CREDITS;
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONSOLES, JSON.stringify(consoles)); }, [consoles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXTRA_CONTROLLERS, JSON.stringify(extraControllerRates)); }, [extraControllerRates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(activeSessions)); }, [activeSessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLOSED_SESSIONS, JSON.stringify(closedSessions)); }, [closedSessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(currentCash)); }, [currentCash]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(cashClosures)); }, [cashClosures]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVENTORY_ENTRIES, JSON.stringify(inventoryEntries)); }, [inventoryEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACCOUNT_SEQ, accountSeq.toString()); }, [accountSeq]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits)); }, [credits]);

  // Periodic alarm checks for active Xbox sessions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeSessions.forEach(session => {
        const remaining = session.endTime - now;
        if (remaining > 115000 && remaining < 185000) {
          playAlertSound('warning');
        }
        if (remaining <= 0 && remaining > -5000) {
          playAlertSound('finish');
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [activeSessions]);

  // Auth Operations
  const loginUser = (username: string, password?: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }
    if (user.password && user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta' };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const switchUser = (username: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
    }
  };

  const logoutUser = () => {
    // Default fallback to cajero or first user
    const cajeroUser = users.find(u => u.role === 'cajero') || users[0];
    setCurrentUser(cajeroUser);
  };

  const saveUser = (user: User) => {
    setUsers(prev => {
      const index = prev.findIndex(u => u.id === user.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = user;
        return updated;
      }
      return [...prev, user];
    });
  };

  // Calculate Today's Stats
  const todaySales = useMemo(() => sales.filter(s => s.date === todayStr), [sales, todayStr]);
  const todayExpenses = useMemo(() => expenses.filter(e => e.date === todayStr), [expenses, todayStr]);

  const todaySalesTotal = useMemo(() => todaySales.reduce((sum, s) => sum + s.total, 0), [todaySales]);
  const todayCashSales = useMemo(() => todaySales.filter(s => s.paymentMethod === 'efectivo').reduce((sum, s) => sum + s.total, 0), [todaySales]);
  const todayTransferSales = useMemo(() => todaySales.filter(s => s.paymentMethod === 'transferencia').reduce((sum, s) => sum + s.total, 0), [todaySales]);
  const todayCreditSalesTotal = useMemo(() => todaySales.filter(s => s.paymentMethod === 'credito').reduce((sum, s) => sum + s.total, 0), [todaySales]);

  const todayExpensesTotal = useMemo(() => todayExpenses.reduce((sum, e) => sum + e.amount, 0), [todayExpenses]);
  const todayCashExpenses = useMemo(() => todayExpenses.filter(e => e.paymentMethod === 'efectivo').reduce((sum, e) => sum + e.amount, 0), [todayExpenses]);
  const todayTransferExpenses = useMemo(() => todayExpenses.filter(e => e.paymentMethod === 'transferencia').reduce((sum, e) => sum + e.amount, 0), [todayExpenses]);

  const todayWithdrawalsTotal = useMemo(() => currentCash.withdrawals.reduce((sum, w) => sum + w.amount, 0), [currentCash.withdrawals]);

  // Credits statistics & payments today
  const pendingCredits = useMemo(() => credits.filter(c => c.status === 'pendiente'), [credits]);
  const pendingCreditsCount = useMemo(() => pendingCredits.length, [pendingCredits]);
  const totalPendingCreditsAmount = useMemo(() => pendingCredits.reduce((sum, c) => sum + c.currentBalance, 0), [pendingCredits]);

  const todayCreditPayments = useMemo(() => {
    return credits
      .flatMap(c => c.payments || [])
      .filter(p => p.date === todayStr);
  }, [credits, todayStr]);

  const todayCashCreditPayments = useMemo(() => {
    return todayCreditPayments
      .filter(p => p.paymentMethod === 'efectivo')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [todayCreditPayments]);

  const todayTransferCreditPayments = useMemo(() => {
    return todayCreditPayments
      .filter(p => p.paymentMethod === 'transferencia')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [todayCreditPayments]);

  const todayCreditPaymentsTotal = useMemo(() => {
    return todayCashCreditPayments + todayTransferCreditPayments;
  }, [todayCashCreditPayments, todayTransferCreditPayments]);

  // Expected Cash = Base inicial + Ventas en efectivo + Abonos a créditos en efectivo - Gastos en efectivo - Retiros
  const todayExpectedCash = useMemo(() => {
    const base = currentCash.isOpen ? currentCash.initialCash : 0;
    return base + todayCashSales + todayCashCreditPayments - todayCashExpenses - todayWithdrawalsTotal;
  }, [currentCash.initialCash, currentCash.isOpen, todayCashSales, todayCashCreditPayments, todayCashExpenses, todayWithdrawalsTotal]);

  const areaSales = useMemo(() => {
    const breakdown = { gargueria: 0, xbox: 0, papeleria: 0 };
    todaySales.forEach(s => {
      if (breakdown[s.area] !== undefined) {
        breakdown[s.area] += s.total;
      }
    });
    return breakdown;
  }, [todaySales]);

  const todayConsoleSessionsCount = useMemo(() => {
    return closedSessions.filter(cs => {
      const d = new Date(cs.closedAt).toISOString().split('T')[0];
      return d === todayStr;
    }).length;
  }, [closedSessions, todayStr]);

  const todayProductsSoldCount = useMemo(() => {
    return todaySales.reduce((sum, s) => {
      const itemsCount = s.items.reduce((acc, i) => acc + (i.category !== 'Consolas' ? i.quantity : 0), 0);
      return sum + itemsCount;
    }, 0);
  }, [todaySales]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.isActive && p.trackStock && p.stock <= p.minStock);
  }, [products]);

  // Credits operations
  const addCreditSale = (data: {
    customerName: string;
    customerPhone?: string;
    area: BusinessArea;
    itemsSummary: string;
    total: number;
    notes?: string;
    dueDate?: string;
    saleId?: string;
  }): CreditAccount => {
    const now = new Date();
    const newCredit: CreditAccount = {
      id: `cred-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customerName: data.customerName.trim() || 'Cliente Fiado',
      customerPhone: data.customerPhone?.trim(),
      saleId: data.saleId,
      saleTotal: data.total,
      currentBalance: data.total,
      paidAmount: 0,
      area: data.area,
      itemsSummary: data.itemsSummary || 'Venta a crédito',
      status: 'pendiente',
      createdAt: now.getTime(),
      createdDate: getTodayDateString(),
      createdTime: getCurrentTimeString(),
      dueDate: data.dueDate,
      payments: [],
      notes: data.notes,
    };
    setCredits(prev => [newCredit, ...prev]);
    return newCredit;
  };

  const registerCreditPayment = (
    creditId: string,
    paymentData: {
      amount: number;
      paymentMethod: 'efectivo' | 'transferencia';
      transferProvider?: TransferProvider;
      transferReference?: string;
      notes?: string;
      date?: string;
      time?: string;
    }
  ) => {
    const payDate = paymentData.date || getTodayDateString();
    const payTime = paymentData.time || getCurrentTimeString();
    const newPayment: CreditPayment = {
      id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      creditId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transferProvider: paymentData.transferProvider,
      transferReference: paymentData.transferReference,
      date: payDate,
      time: payTime,
      timestamp: Date.now(),
      receivedBy: currentUser.name || currentUser.username,
      notes: paymentData.notes,
    };

    setCredits(prev =>
      prev.map(c => {
        if (c.id !== creditId) return c;
        const newPaid = c.paidAmount + paymentData.amount;
        const newBalance = Math.max(0, c.saleTotal - newPaid);
        return {
          ...c,
          paidAmount: newPaid,
          currentBalance: newBalance,
          status: newBalance <= 0 ? 'pagado' : 'pendiente',
          payments: [newPayment, ...(c.payments || [])],
        };
      })
    );
  };

  const deleteCredit = (creditId: string) => {
    setCredits(prev => prev.filter(c => c.id !== creditId));
  };

  // Password Management
  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!currentUser.password || currentUser.password === oldPassword) {
      const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
      const updatedCurrent = { ...currentUser, password: newPassword };
      setUsers(updatedUsers);
      setCurrentUser(updatedCurrent);
      return { success: true, message: 'Contraseña actualizada exitosamente' };
    }
    return { success: false, message: 'La contraseña actual no coincide' };
  };

  const adminUpdateUserPassword = (userId: string, newPassword: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Solo el Administrador puede modificar contraseñas de otros usuarios' };
    }
    const updatedUsers = users.map(u => u.id === userId ? { ...u, password: newPassword } : u);
    setUsers(updatedUsers);
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, password: newPassword });
    }
    return { success: true, message: 'Contraseña actualizada exitosamente' };
  };

  // Operations
  const registerSale = (saleData: {
    area: BusinessArea;
    items: {
      productId?: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      category?: string;
    }[];
    total: number;
    paymentMethod: PaymentMethod;
    transferProvider?: TransferProvider;
    transferReference?: string;
    cashGiven?: number;
    change?: number;
    notes?: string;
    consoleSessionId?: string;
    date?: string;
    time?: string;
    timestamp?: number;
    isExtemporaneous?: boolean;
    customerName?: string;
    customerPhone?: string;
  }): Sale => {
    const now = new Date();
    const saleDate = saleData.date || getTodayDateString();
    const saleTime = saleData.time || getCurrentTimeString();
    const isPastDate = saleDate !== getTodayDateString();
    const saleTimestamp =
      saleData.timestamp ||
      (saleData.date
        ? new Date(`${saleDate}T${saleTime.length === 5 ? saleTime + ':00' : saleTime}`).getTime()
        : now.getTime());

    let newCreditId: string | undefined = undefined;

    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: saleDate,
      time: saleTime,
      timestamp: isNaN(saleTimestamp) ? now.getTime() : saleTimestamp,
      isExtemporaneous: saleData.isExtemporaneous ?? isPastDate,
      recordedBy: currentUser.name || currentUser.username,
      ...saleData,
    };

    // If sale is on credit (Fiado), register the CreditAccount automatically
    if (saleData.paymentMethod === 'credito') {
      newCreditId = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const custName = saleData.customerName?.trim() || 'Cliente Fiado';
      const itemsSummary = saleData.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

      const newCredit: CreditAccount = {
        id: newCreditId,
        customerName: custName,
        customerPhone: saleData.customerPhone?.trim(),
        saleId: newSale.id,
        saleTotal: saleData.total,
        currentBalance: saleData.total,
        paidAmount: 0,
        area: saleData.area,
        itemsSummary: itemsSummary || 'Venta a crédito',
        status: 'pendiente',
        createdAt: newSale.timestamp,
        createdDate: saleDate,
        createdTime: saleTime,
        payments: [],
        notes: saleData.notes,
      };

      setCredits(prev => [newCredit, ...prev]);
      newSale.creditId = newCreditId;
    }

    // 1. Deduct inventory for tracked items (Garguería, Bebidas, Papelería con control de stock)
    setProducts(prevProducts => {
      const updated = [...prevProducts];
      saleData.items.forEach(item => {
        if (item.productId) {
          const index = updated.findIndex(p => p.id === item.productId);
          if (index !== -1 && updated[index].trackStock) {
            updated[index] = {
              ...updated[index],
              stock: Math.max(0, updated[index].stock - item.quantity),
            };
          }
        }
      });
      return updated;
    });

    // 2. Add to sales
    setSales(prev => [newSale, ...prev]);

    return newSale;
  };

  // Open Account for Consoles
  const startXboxSession = (params: {
    consoleId: string;
    durationMinutes: number;
    lightMode: LightMode;
    rateLabel: string;
    basePrice: number;
    extraControllers: number;
    extraControllerPrice: number;
    notes?: string;
  }): ActiveXboxSession => {
    const targetConsole = consoles.find(c => c.id === params.consoleId);
    const now = Date.now();
    const durationMs = params.durationMinutes * 60 * 1000;
    const totalPrice = params.basePrice + params.extraControllerPrice;

    const formattedAccount = `CUENTA #${String(accountSeq).padStart(3, '0')}`;
    setAccountSeq(prev => prev + 1);

    const newSession: ActiveXboxSession = {
      id: `session-${now}`,
      accountNumber: formattedAccount,
      consoleId: params.consoleId,
      consoleName: targetConsole?.name || `Consola ${params.consoleId}`,
      consoleModel: targetConsole?.model || 'Xbox',
      lightMode: params.lightMode,
      startTime: now,
      durationMinutes: params.durationMinutes,
      endTime: now + durationMs,
      initialMinutes: params.durationMinutes,
      initialRateLabel: params.rateLabel,
      initialPrice: params.basePrice,
      addedTimeMinutes: 0,
      addedTimePrice: 0,
      extraControllers: params.extraControllers,
      extraControllerPrice: params.extraControllerPrice,
      products: [],
      totalPrice,
      notes: params.notes,
      isPaid: false,
    };

    setActiveSessions(prev => {
      const filtered = prev.filter(s => s.consoleId !== params.consoleId);
      return [...filtered, newSession];
    });

    return newSession;
  };

  // Add more time to an open account (Rule: DO NOT create a new account)
  const addTimeToSession = (sessionId: string, additionalMinutes: number, additionalPrice: number) => {
    setActiveSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const newEndTime = s.endTime + additionalMinutes * 60 * 1000;
          return {
            ...s,
            durationMinutes: s.durationMinutes + additionalMinutes,
            endTime: newEndTime,
            addedTimeMinutes: s.addedTimeMinutes + additionalMinutes,
            addedTimePrice: s.addedTimePrice + additionalPrice,
            totalPrice: s.totalPrice + additionalPrice,
          };
        }
        return s;
      })
    );
  };

  // Add products (Chocorramo, Coca-Cola, etc.) to an open account
  const addProductToSession = (sessionId: string, product: Product, quantity: number) => {
    setActiveSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const existingItemIndex = s.products.findIndex(p => p.productId === product.id);
          let updatedProducts: SessionProductItem[];

          if (existingItemIndex !== -1) {
            updatedProducts = [...s.products];
            const existing = updatedProducts[existingItemIndex];
            const newQty = existing.quantity + quantity;
            updatedProducts[existingItemIndex] = {
              ...existing,
              quantity: newQty,
              subtotal: newQty * existing.unitPrice,
            };
          } else {
            const newItem: SessionProductItem = {
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: product.id,
              name: product.presentation ? `${product.name} (${product.presentation})` : product.name,
              quantity,
              unitPrice: product.price,
              subtotal: product.price * quantity,
              category: product.category,
            };
            updatedProducts = [...s.products, newItem];
          }

          const addedCost = product.price * quantity;
          return {
            ...s,
            products: updatedProducts,
            totalPrice: s.totalPrice + addedCost,
          };
        }
        return s;
      })
    );
  };

  // Remove a product from an open account
  const removeProductFromSession = (sessionId: string, itemIndex: number) => {
    setActiveSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId && s.products[itemIndex]) {
          const item = s.products[itemIndex];
          const updatedProducts = s.products.filter((_, idx) => idx !== itemIndex);
          return {
            ...s,
            products: updatedProducts,
            totalPrice: s.totalPrice - item.subtotal,
          };
        }
        return s;
      })
    );
  };

  // Add extra controllers to an open account
  const addExtraControllersToSession = (sessionId: string, count: number, pricePerUnit: number) => {
    setActiveSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const addedPrice = count * pricePerUnit;
          return {
            ...s,
            extraControllers: s.extraControllers + count,
            extraControllerPrice: s.extraControllerPrice + addedPrice,
            totalPrice: s.totalPrice + addedPrice,
          };
        }
        return s;
      })
    );
  };

  // Finalize account: summarizes, registers sale, decrements product stock, frees console
  const finalizeXboxSessionAndPay = (
    sessionId: string,
    paymentMethod: PaymentMethod,
    transferProvider?: TransferProvider,
    transferReference?: string
  ) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    const consoleTimePrice = session.initialPrice + session.addedTimePrice;
    const lightText = session.lightMode === 'con_luz' ? 'Con luz' : 'Sin luz';
    const timeSummary = `${session.durationMinutes} min (${lightText})`;

    const saleItems: {
      productId?: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      category?: string;
    }[] = [
      // 1. Console Time
      {
        name: `${session.consoleName} (${session.consoleModel}) — ${timeSummary}`,
        quantity: 1,
        unitPrice: consoleTimePrice,
        subtotal: consoleTimePrice,
        category: 'Consolas',
      },
    ];

    // 2. Extra controllers if any
    if (session.extraControllers > 0) {
      saleItems.push({
        name: `Control(es) adicional(es) x${session.extraControllers}`,
        quantity: session.extraControllers,
        unitPrice: session.extraControllerPrice / session.extraControllers,
        subtotal: session.extraControllerPrice,
        category: 'Controles',
      });
    }

    // 3. Products added to the account
    session.products.forEach(p => {
      saleItems.push({
        productId: p.productId,
        name: p.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        subtotal: p.subtotal,
        category: p.category || 'Garguería/Bebidas',
      });
    });

    // Register official sale
    const sale = registerSale({
      area: 'xbox',
      items: saleItems,
      total: session.totalPrice,
      paymentMethod,
      transferProvider,
      transferReference,
      consoleSessionId: session.id,
      notes: `${session.accountNumber} - ${session.consoleName}`,
    });

    // Store in closed sessions history
    const closedRecord: ClosedConsoleSession = {
      id: `closed-${Date.now()}`,
      accountNumber: session.accountNumber,
      consoleId: session.consoleId,
      consoleName: session.consoleName,
      consoleModel: session.consoleModel,
      lightMode: session.lightMode,
      startTime: session.startTime,
      endTime: Date.now(),
      initialMinutes: session.initialMinutes,
      addedMinutes: session.addedTimeMinutes,
      totalMinutes: session.durationMinutes,
      extraControllers: session.extraControllers,
      extraControllerPrice: session.extraControllerPrice,
      products: session.products,
      totalConsoleTimePrice: consoleTimePrice,
      totalProductsPrice: session.products.reduce((acc, p) => acc + p.subtotal, 0),
      totalPrice: session.totalPrice,
      paymentMethod,
      transferProvider,
      transferReference,
      closedAt: Date.now(),
      saleId: sale.id,
    };

    setClosedSessions(prev => [closedRecord, ...prev]);

    // Free console by removing active session
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const cancelXboxSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const addExpense = (data: {
    concept: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transferProvider?: TransferProvider;
    transferReference?: string;
    notes?: string;
  }) => {
    const now = new Date();
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      timestamp: now.getTime(),
      ...data,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const openCashRegister = (initialCash: number) => {
    setCurrentCash({
      id: `cash-${getTodayDateString()}`,
      date: getTodayDateString(),
      openedAt: Date.now(),
      initialCash,
      isOpen: true,
      withdrawals: [],
    });
  };

  const addCashWithdrawal = (amount: number, reason: string) => {
    const newWithdrawal = {
      id: `wth-${Date.now()}`,
      time: getCurrentTimeString(),
      timestamp: Date.now(),
      amount,
      reason,
    };
    setCurrentCash(prev => ({
      ...prev,
      withdrawals: [newWithdrawal, ...prev.withdrawals],
    }));
  };

  const closeCashRegister = (countedCash: number, notes?: string): CashClosure => {
    const expected = todayExpectedCash;
    const diff = countedCash - expected;
    let status: 'cuadrada' | 'faltante' | 'sobrante' = 'cuadrada';
    if (diff < -50) status = 'faltante';
    else if (diff > 50) status = 'sobrante';

    const closure: CashClosure = {
      id: `close-${Date.now()}`,
      date: currentCash.date,
      openedAt: currentCash.openedAt,
      closedAt: Date.now(),
      initialCash: currentCash.initialCash,
      cashSales: todayCashSales,
      transferSales: todayTransferSales,
      totalSales: todaySalesTotal,
      creditSalesTotal: todayCreditSalesTotal,
      creditPaymentsCash: todayCashCreditPayments,
      creditPaymentsTransfer: todayTransferCreditPayments,
      creditPaymentsTotal: todayCreditPaymentsTotal,
      cashExpenses: todayCashExpenses,
      transferExpenses: todayTransferExpenses,
      totalExpenses: todayExpensesTotal,
      cashWithdrawalsTotal: todayWithdrawalsTotal,
      expectedCash: expected,
      countedCash,
      difference: diff,
      status,
      gargueriaSales: areaSales.gargueria,
      xboxSales: areaSales.xbox,
      papeleriaSales: areaSales.papeleria,
      consoleSessionsCount: todayConsoleSessionsCount,
      productsSoldCount: todayProductsSoldCount,
      notes,
    };

    setCashClosures(prev => [closure, ...prev]);
    setCurrentCash(prev => ({
      ...prev,
      isOpen: false,
    }));

    return closure;
  };

  const addInventoryEntry = (data: {
    productId: string;
    quantity: number;
    unitCost: number;
    supplier: string;
    notes?: string;
  }) => {
    const targetProduct = products.find(p => p.id === data.productId);
    const entry: InventoryEntry = {
      id: `entry-${Date.now()}`,
      productId: data.productId,
      productName: targetProduct?.name || 'Producto',
      quantity: data.quantity,
      unitCost: data.unitCost,
      supplier: data.supplier,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      timestamp: Date.now(),
      notes: data.notes,
    };

    setInventoryEntries(prev => [entry, ...prev]);

    // Update product stock and optionally unit cost
    setProducts(prev =>
      prev.map(p => {
        if (p.id === data.productId) {
          return {
            ...p,
            stock: p.stock + data.quantity,
            cost: data.unitCost > 0 ? data.unitCost : p.cost,
          };
        }
        return p;
      })
    );
  };

  const saveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.map(p => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const deleteOrDeactivateProduct = (productId: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, isActive: false } : p))
    );
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price: Math.max(0, newPrice) } : p))
    );
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: Math.max(0, newStock), trackStock: true } : p))
    );
  };

  const saveConsoleRates = (consoleId: string, rates: XboxConsole['rates']) => {
    setConsoles(prev =>
      prev.map(c => (c.id === consoleId ? { ...c, rates } : c))
    );
  };

  const saveExtraControllerRates = (rates: ExtraControllerRate[]) => {
    setExtraControllerRates(rates);
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setConsoles(INITIAL_CONSOLES);
    setExtraControllerRates(INITIAL_EXTRA_CONTROLLER_RATES);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveSessions([]);
    setClosedSessions([]);
    setSales([]);
    setExpenses([]);
    setInventoryEntries([]);
    setCredits(INITIAL_CREDITS);
    setAccountSeq(1);
    setCurrentCash({
      id: `cash-${getTodayDateString()}`,
      date: getTodayDateString(),
      openedAt: Date.now(),
      initialCash: 50000,
      isOpen: true,
      withdrawals: [],
    });
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        loginUser,
        switchUser,
        logoutUser,
        saveUser,
        changePassword,
        adminUpdateUserPassword,
        products,
        consoles,
        extraControllerRates,
        activeSessions,
        closedSessions,
        sales,
        expenses,
        currentCash,
        cashClosures,
        inventoryEntries,
        todayDate: todayStr,
        todaySalesTotal,
        todayCashSales,
        todayTransferSales,
        todayCreditSalesTotal,
        todayExpensesTotal,
        todayCashExpenses,
        todayTransferExpenses,
        todayWithdrawalsTotal,
        todayExpectedCash,
        areaSales,
        todayConsoleSessionsCount,
        todayProductsSoldCount,
        lowStockProducts,
        credits,
        addCreditSale,
        registerCreditPayment,
        deleteCredit,
        pendingCreditsCount,
        totalPendingCreditsAmount,
        todayCreditPayments,
        todayCashCreditPayments,
        todayTransferCreditPayments,
        todayCreditPaymentsTotal,
        registerSale,
        startXboxSession,
        addTimeToSession,
        addProductToSession,
        removeProductFromSession,
        addExtraControllersToSession,
        finalizeXboxSessionAndPay,
        cancelXboxSession,
        addExpense,
        openCashRegister,
        addCashWithdrawal,
        closeCashRegister,
        addInventoryEntry,
        isAdmin: currentUser.role === 'admin',
        saveProduct,
        updateProductPrice,
        updateProductStock,
        deleteOrDeactivateProduct,
        saveConsoleRates,
        updateConsoleRates: saveConsoleRates,
        saveExtraControllerRates,
        updateExtraControllerRates: saveExtraControllerRates,
        resetToDefaults,
        resetToInitialDefaults: resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
