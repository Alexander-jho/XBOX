import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  XboxConsole,
  ExtraControllerRate,
  ActiveXboxSession,
  Sale,
  Expense,
  CurrentCashRegister,
  CashClosure,
  InventoryEntry,
  BusinessArea,
  PaymentMethod,
  TransferProvider,
} from '../types';
import {
  INITIAL_CONSOLES,
  INITIAL_EXTRA_CONTROLLER_RATES,
  INITIAL_PRODUCTS,
} from '../data/initialData';
import { getTodayDateString, getCurrentTimeString, playAlertSound } from '../utils/formatters';

interface AppContextType {
  // Catalogs and Configuration
  products: Product[];
  consoles: XboxConsole[];
  extraControllerRates: ExtraControllerRate[];
  
  // Operational Data
  activeSessions: ActiveXboxSession[];
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

  startXboxSession: (params: {
    consoleId: string;
    durationMinutes: number;
    rateLabel: string;
    basePrice: number;
    extraControllers: number;
    extraControllerRate?: ExtraControllerRate;
    notes?: string;
  }) => ActiveXboxSession;

  finalizeXboxSessionAndPay: (
    sessionId: string,
    paymentMethod: PaymentMethod,
    transferProvider?: TransferProvider,
    transferReference?: string
  ) => void;

  cancelXboxSession: (sessionId: string) => void;
  extendXboxSession: (sessionId: string, additionalMinutes: number, additionalPrice: number) => void;

  addExpense: (data: {
    concept: string;
    amount: number;
    paymentMethod: PaymentMethod;
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
  PRODUCTS: 'pos_control_products_v1',
  CONSOLES: 'pos_control_consoles_v1',
  EXTRA_CONTROLLERS: 'pos_control_extra_ctrl_v1',
  SESSIONS: 'pos_control_sessions_v1',
  SALES: 'pos_control_sales_v1',
  EXPENSES: 'pos_control_expenses_v1',
  CASH: 'pos_control_cash_v1',
  CLOSURES: 'pos_control_closures_v1',
  INVENTORY_ENTRIES: 'pos_control_inventory_entries_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();

  // 1. Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PRODUCTS;
  });

  // 2. Consoles
  const [consoles, setConsoles] = useState<XboxConsole[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONSOLES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CONSOLES;
  });

  // 3. Extra Controller Rates
  const [extraControllerRates, setExtraControllerRates] = useState<ExtraControllerRate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXTRA_CONTROLLERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EXTRA_CONTROLLER_RATES;
  });

  // 4. Active Xbox Sessions
  const [activeSessions, setActiveSessions] = useState<ActiveXboxSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 5. Sales
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 6. Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 7. Current Cash Register
  const [currentCash, setCurrentCash] = useState<CurrentCashRegister>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If from a previous day and still open, we keep it or can let user close it
        return parsed;
      } catch (e) { console.error(e); }
    }
    return {
      id: `cash-${todayStr}`,
      date: todayStr,
      openedAt: Date.now(),
      initialCash: 50000, // Default base inicial $50.000 for realistic convenience
      isOpen: true,
      withdrawals: [],
    };
  });

  // 8. Cash Closures History
  const [cashClosures, setCashClosures] = useState<CashClosure[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOSURES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 9. Inventory Entries
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY_ENTRIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONSOLES, JSON.stringify(consoles)); }, [consoles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXTRA_CONTROLLERS, JSON.stringify(extraControllerRates)); }, [extraControllerRates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(activeSessions)); }, [activeSessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(currentCash)); }, [currentCash]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(cashClosures)); }, [cashClosures]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVENTORY_ENTRIES, JSON.stringify(inventoryEntries)); }, [inventoryEntries]);

  // Periodic check for Xbox active session alarms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeSessions.forEach(session => {
        const remaining = session.endTime - now;
        // Warning when 2.5 to 3 minutes left
        if (remaining > 115000 && remaining < 185000) {
          // Subtle audio alert if active in window
          playAlertSound('warning');
        }
        // Completed sound
        if (remaining <= 0 && remaining > -5000) {
          playAlertSound('finish');
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [activeSessions]);

  // Calculate Today's Stats
  const todaySales = useMemo(() => {
    return sales.filter(s => s.date === todayStr);
  }, [sales, todayStr]);

  const todayExpenses = useMemo(() => {
    return expenses.filter(e => e.date === todayStr);
  }, [expenses, todayStr]);

  const todaySalesTotal = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  const todayCashSales = useMemo(() => {
    return todaySales.filter(s => s.paymentMethod === 'efectivo').reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  const todayTransferSales = useMemo(() => {
    return todaySales.filter(s => s.paymentMethod === 'transferencia').reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  const todayExpensesTotal = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  const todayCashExpenses = useMemo(() => {
    return todayExpenses.filter(e => e.paymentMethod === 'efectivo').reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  const todayTransferExpenses = useMemo(() => {
    return todayExpenses.filter(e => e.paymentMethod === 'transferencia').reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  const todayWithdrawalsTotal = useMemo(() => {
    return currentCash.withdrawals.reduce((sum, w) => sum + w.amount, 0);
  }, [currentCash.withdrawals]);

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

    // 1. Deduct inventory for tracked items
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

    // 3. If tied to active console session, clear active session
    if (saleData.consoleSessionId) {
      setActiveSessions(prev => prev.filter(s => s.id !== saleData.consoleSessionId));
    }

    return newSale;
  };

  const startXboxSession = (params: {
    consoleId: string;
    durationMinutes: number;
    rateLabel: string;
    basePrice: number;
    extraControllers: number;
    extraControllerRate?: ExtraControllerRate;
    notes?: string;
  }): ActiveXboxSession => {
    const targetConsole = consoles.find(c => c.id === params.consoleId);
    const now = Date.now();
    const durationMs = params.durationMinutes * 60 * 1000;
    const extraCtrlPrice = params.extraControllers > 0 && params.extraControllerRate
      ? params.extraControllers * params.extraControllerRate.price
      : 0;
    const totalPrice = params.basePrice + extraCtrlPrice;

    const newSession: ActiveXboxSession = {
      id: `session-${now}`,
      consoleId: params.consoleId,
      consoleName: targetConsole?.name || `Consola ${params.consoleId}`,
      consoleModel: targetConsole?.model || 'Xbox',
      startTime: now,
      durationMinutes: params.durationMinutes,
      endTime: now + durationMs,
      rateLabel: params.rateLabel,
      basePrice: params.basePrice,
      extraControllers: params.extraControllers,
      extraControllerRateId: params.extraControllerRate?.id,
      extraControllerRateName: params.extraControllerRate?.name,
      extraControllerPrice: extraCtrlPrice,
      totalPrice,
      notes: params.notes,
      isPaid: false,
    };

    setActiveSessions(prev => {
      // Remove any prior active session for this console just in case
      const filtered = prev.filter(s => s.consoleId !== params.consoleId);
      return [...filtered, newSession];
    });

    return newSession;
  };

  const finalizeXboxSessionAndPay = (
    sessionId: string,
    paymentMethod: PaymentMethod,
    transferProvider?: TransferProvider,
    transferReference?: string
  ) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    let concept = `${session.consoleName} (${session.consoleModel}) — ${session.rateLabel}`;
    if (session.extraControllers > 0) {
      concept += ` + ${session.extraControllers} control(es) extra`;
    }

    registerSale({
      area: 'xbox',
      items: [
        {
          name: concept,
          quantity: 1,
          unitPrice: session.totalPrice,
          subtotal: session.totalPrice,
          category: 'Consolas',
        },
      ],
      total: session.totalPrice,
      paymentMethod,
      transferProvider,
      transferReference,
      consoleSessionId: session.id,
      notes: session.notes,
    });
  };

  const cancelXboxSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const extendXboxSession = (sessionId: string, additionalMinutes: number, additionalPrice: number) => {
    setActiveSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const newEndTime = s.endTime + additionalMinutes * 60 * 1000;
          return {
            ...s,
            durationMinutes: s.durationMinutes + additionalMinutes,
            endTime: newEndTime,
            totalPrice: s.totalPrice + additionalPrice,
            rateLabel: `${s.rateLabel} + ${additionalMinutes}m`,
          };
        }
        return s;
      })
    );
  };

  const addExpense = (data: {
    concept: string;
    amount: number;
    paymentMethod: PaymentMethod;
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

    // Update product stock and optionally cost
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
    // As explicitly requested in prompt: "No eliminar físicamente productos que ya tengan ventas históricas. Desactivar producto."
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
    setActiveSessions([]);
    setSales([]);
    setExpenses([]);
    setInventoryEntries([]);
    setCurrentCash({
      id: `cash-${getTodayDateString()}`,
      date: getTodayDateString(),
      openedAt: Date.now(),
      initialCash: 50000,
      isOpen: true,
      withdrawals: [],
    });
  };

  return (
    <AppContext.Provider
      value={{
        products,
        consoles,
        extraControllerRates,
        activeSessions,
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
        lowStockProducts,
        registerSale,
        startXboxSession,
        finalizeXboxSessionAndPay,
        cancelXboxSession,
        extendXboxSession,
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
