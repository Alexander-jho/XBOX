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

  saveProduct: (product: Product) => void;
  deleteOrDeactivateProduct: (productId: string) => void;
  saveConsoleRates: (consoleId: string, rates: XboxConsole['rates']) => void;
  saveExtraControllerRates: (rates: ExtraControllerRate[]) => void;
  resetToDefaults: () => void;
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
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();

  // 1. Users & Current User
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
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
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
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

  const todayExpensesTotal = useMemo(() => todayExpenses.reduce((sum, e) => sum + e.amount, 0), [todayExpenses]);
  const todayCashExpenses = useMemo(() => todayExpenses.filter(e => e.paymentMethod === 'efectivo').reduce((sum, e) => sum + e.amount, 0), [todayExpenses]);
  const todayTransferExpenses = useMemo(() => todayExpenses.filter(e => e.paymentMethod === 'transferencia').reduce((sum, e) => sum + e.amount, 0), [todayExpenses]);

  const todayWithdrawalsTotal = useMemo(() => currentCash.withdrawals.reduce((sum, w) => sum + w.amount, 0), [currentCash.withdrawals]);

  const todayExpectedCash = useMemo(() => {
    const base = currentCash.isOpen ? currentCash.initialCash : 0;
    return base + todayCashSales - todayCashExpenses - todayWithdrawalsTotal;
  }, [currentCash.initialCash, currentCash.isOpen, todayCashSales, todayCashExpenses, todayWithdrawalsTotal]);

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
  }): Sale => {
    const now = new Date();
    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      timestamp: now.getTime(),
      ...saleData,
    };

    // 1. Deduct inventory for tracked items (Garguería and Bebidas only; Papelería is not tracked)
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
        todayExpensesTotal,
        todayCashExpenses,
        todayTransferExpenses,
        todayWithdrawalsTotal,
        todayExpectedCash,
        areaSales,
        todayConsoleSessionsCount,
        todayProductsSoldCount,
        lowStockProducts,
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
        saveProduct,
        deleteOrDeactivateProduct,
        saveConsoleRates,
        saveExtraControllerRates,
        resetToDefaults,
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
