import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react';
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
    itemsSummary?: string;
    itemSummary?: string;
    total?: number;
    saleTotal?: number;
    notes?: string;
    dueDate?: string;
    saleId?: string;
    date?: string;
    customDate?: string;
    time?: string;
    customTime?: string;
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
    dueDate?: string;
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

  openCashRegister: (initialCash?: number, initialCashGeneral?: number, initialCashTragamonedas?: number) => void;
  updateInitialCash: (total: number, general?: number, tragamonedas?: number) => void;
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
  persistInventoryChanges: () => { success: boolean; count: number };
  saveConsoleRates: (consoleId: string, rates: XboxConsole['rates']) => void;
  updateConsoleRates: (consoleId: string, rates: XboxConsole['rates']) => void;
  saveExtraControllerRates: (rates: ExtraControllerRate[]) => void;
  updateExtraControllerRates: (rates: ExtraControllerRate[]) => void;
  resetToDefaults: () => void;
  resetToInitialDefaults: () => void;
  isOnlineSyncActive: boolean;
  cloudSyncStatus: 'connected' | 'connecting' | 'error';
  cloudVersion: number;
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
  LAST_SYNC: 'pos_control_last_sync_v2',
};

const keyToTableMap: Record<string, string> = {
  [STORAGE_KEYS.USERS]: 'users',
  [STORAGE_KEYS.PRODUCTS]: 'products',
  [STORAGE_KEYS.CONSOLES]: 'consoles',
  [STORAGE_KEYS.EXTRA_CONTROLLERS]: 'extraControllerRates',
  [STORAGE_KEYS.SESSIONS]: 'sessions',
  [STORAGE_KEYS.CLOSED_SESSIONS]: 'closedSessions',
  [STORAGE_KEYS.SALES]: 'sales',
  [STORAGE_KEYS.EXPENSES]: 'expenses',
  [STORAGE_KEYS.CASH]: 'cash',
  [STORAGE_KEYS.CLOSURES]: 'cashClosures',
  [STORAGE_KEYS.INVENTORY_ENTRIES]: 'inventoryEntries',
  [STORAGE_KEYS.ACCOUNT_SEQ]: 'accountSeq',
  [STORAGE_KEYS.CREDITS]: 'credits',
};

const tableToKeyMap: Record<string, string> = {
  users: STORAGE_KEYS.USERS,
  products: STORAGE_KEYS.PRODUCTS,
  consoles: STORAGE_KEYS.CONSOLES,
  extraControllerRates: STORAGE_KEYS.EXTRA_CONTROLLERS,
  sessions: STORAGE_KEYS.SESSIONS,
  closedSessions: STORAGE_KEYS.CLOSED_SESSIONS,
  sales: STORAGE_KEYS.SALES,
  expenses: STORAGE_KEYS.EXPENSES,
  cash: STORAGE_KEYS.CASH,
  cashClosures: STORAGE_KEYS.CLOSURES,
  inventoryEntries: STORAGE_KEYS.INVENTORY_ENTRIES,
  accountSeq: STORAGE_KEYS.ACCOUNT_SEQ,
  credits: STORAGE_KEYS.CREDITS,
};

// Zero mock data: initial credits strictly empty and $0
export const INITIAL_CREDITS: CreditAccount[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();

  // Tab instance ID for cross-screen synchronization
  const tabInstanceId = useMemo(
    () => 'tab-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
    []
  );
  const isReceivingRemoteSync = useRef(false);
  const lastProcessedSyncTimeRef = useRef<number>(Date.now());

  // Cloud Synchronization State
  const [isOnlineSyncActive, setIsOnlineSyncActive] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [cloudVersion, setCloudVersion] = useState<number>(1);

  // 1. Users & Current User (Per-tab session support so Admin, Operador, and Cajero can run on different screens simultaneously)
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
    const sessionSaved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) : null;
    if (sessionSaved) {
      try { return JSON.parse(sessionSaved); } catch (e) { console.error(e); }
    }
    const localSaved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (localSaved) {
      try { return JSON.parse(localSaved); } catch (e) { console.error(e); }
    }
    return INITIAL_USERS[0];
  });

  // 2. Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
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

  // 7. Sales (Purge any mock/sample test sales)
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      try {
        const parsed: Sale[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            s => s && s.creditId !== 'cred-sample-1' && s.customerName !== 'Carlos Rodríguez'
          );
        }
      } catch (e) { console.error(e); }
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
        if (!parsed.initialCashGeneral || !parsed.initialCashTragamonedas || parsed.initialCash === 50000) {
          parsed.initialCash = 155000;
          parsed.initialCashGeneral = 100000;
          parsed.initialCashTragamonedas = 55000;
        }
        return parsed;
      } catch (e) { console.error(e); }
    }
    return {
      id: `cash-${todayStr}`,
      date: todayStr,
      openedAt: Date.now(),
      initialCash: 155000,
      initialCashGeneral: 100000,
      initialCashTragamonedas: 55000,
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

  // 13. Credits / Fiados (Zero mock data - strictly empty default & clean local state)
  const [credits, setCredits] = useState<CreditAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREDITS);
    if (saved) {
      try {
        const parsed: CreditAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly purge any sample or test credit
          const clean = parsed.filter(
            c => c && c.id && !c.id.includes('sample') && c.customerName !== 'Carlos Rodríguez'
          );
          if (clean.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(clean));
          }
          return clean;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Broadcast function to notify all screens/tabs/windows and central cloud server instantly
  const broadcastChange = useCallback((key: string, data: any) => {
    try {
      const now = Date.now();
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
      lastProcessedSyncTimeRef.current = now;

      // 1. BroadcastChannel (fastest cross-tab/window/iframe communication)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('pos_shared_realtime_db');
        channel.postMessage({
          type: 'DB_SYNC',
          key,
          data,
          senderId: tabInstanceId,
          timestamp: now,
        });
        channel.close();
      }

      // 2. Window CustomEvent (instant dispatch for current window)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('pos_universal_sync', {
            detail: { key, data, senderId: tabInstanceId, timestamp: now },
          })
        );
      }

      // 3. Central Cloud Server Multi-Device Synchronization
      const table = keyToTableMap[key];
      if (table && typeof fetch !== 'undefined') {
        fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table,
            data,
            updatedBy: currentUser?.username || 'sistema',
            senderId: tabInstanceId,
          }),
        })
          .then(r => r.json())
          .then(res => {
            if (res && res.version) {
              setCloudVersion(res.version);
              setCloudSyncStatus('connected');
              setIsOnlineSyncActive(true);
            }
          })
          .catch(err => {
            console.warn('Central server sync offline/delayed:', err);
          });
      }
    } catch (err) {
      console.error('broadcastChange error for key', key, err);
    }
  }, [tabInstanceId, currentUser?.username]);

  // Apply updates coming from another screen/tab or cloud server
  const applySyncUpdate = useCallback((key: string, data: any) => {
    if (!key || data === undefined) return;
    isReceivingRemoteSync.current = true;
    try {
      switch (key) {
        case STORAGE_KEYS.PRODUCTS:
          setProducts(data);
          break;
        case STORAGE_KEYS.SALES:
          setSales(data);
          break;
        case STORAGE_KEYS.CREDITS: {
          const clean = Array.isArray(data)
            ? data.filter((c: any) => c && c.id && !c.id.includes('sample') && c.customerName !== 'Carlos Rodríguez')
            : [];
          setCredits(clean);
          break;
        }
        case STORAGE_KEYS.EXPENSES:
          setExpenses(data);
          break;
        case STORAGE_KEYS.CASH:
          setCurrentCash(data);
          break;
        case STORAGE_KEYS.CLOSURES:
          setCashClosures(data);
          break;
        case STORAGE_KEYS.INVENTORY_ENTRIES:
          setInventoryEntries(data);
          break;
        case STORAGE_KEYS.SESSIONS:
          setActiveSessions(data);
          break;
        case STORAGE_KEYS.CLOSED_SESSIONS:
          setClosedSessions(data);
          break;
        case STORAGE_KEYS.CONSOLES:
          setConsoles(data);
          break;
        case STORAGE_KEYS.EXTRA_CONTROLLERS:
          setExtraControllerRates(data);
          break;
        case STORAGE_KEYS.USERS:
          setUsers(data);
          break;
        case STORAGE_KEYS.ACCOUNT_SEQ:
          setAccountSeq(Number(data) || 1);
          break;
      }
    } catch (e) {
      console.error('applySyncUpdate error for key', key, e);
    } finally {
      setTimeout(() => {
        isReceivingRemoteSync.current = false;
      }, 80);
    }
  }, []);

  // Multi-tier listener: Cloud SSE + BroadcastChannel + StorageEvent + CustomEvent + Integrity Poller
  useEffect(() => {
    let isSubscribed = true;

    // A. Initial Hydration from Central Cloud Database
    if (typeof fetch !== 'undefined') {
      fetch('/api/db')
        .then(res => res.json())
        .then(json => {
          if (!isSubscribed || !json.success || !json.db) return;
          const db = json.db;
          setCloudVersion(db.version || 1);
          setCloudSyncStatus('connected');
          setIsOnlineSyncActive(true);

          isReceivingRemoteSync.current = true;
          if (Array.isArray(db.products) && db.products.length > 0) setProducts(db.products);
          if (Array.isArray(db.consoles) && db.consoles.length > 0) setConsoles(db.consoles);
          if (Array.isArray(db.extraControllerRates) && db.extraControllerRates.length > 0) setExtraControllerRates(db.extraControllerRates);
          if (Array.isArray(db.users) && db.users.length > 0) setUsers(db.users);
          if (Array.isArray(db.sales)) setSales(db.sales);
          if (Array.isArray(db.expenses)) setExpenses(db.expenses);
          if (Array.isArray(db.sessions)) setActiveSessions(db.sessions);
          if (Array.isArray(db.closedSessions)) setClosedSessions(db.closedSessions);
          if (Array.isArray(db.inventoryEntries)) setInventoryEntries(db.inventoryEntries);
          if (Array.isArray(db.cashClosures)) setCashClosures(db.cashClosures);
          if (db.cash) setCurrentCash(db.cash);
          if (db.accountSeq) setAccountSeq(db.accountSeq);
          if (Array.isArray(db.credits)) {
            const clean = db.credits.filter((c: any) => !c.id?.includes('sample') && c.customerName !== 'Carlos Rodríguez');
            setCredits(clean);
          } else {
            setCredits([]);
          }

          setTimeout(() => {
            isReceivingRemoteSync.current = false;
          }, 150);
        })
        .catch(err => {
          console.warn('Could not hydrate from /api/db on start:', err);
        });
    }

    // B. Real-Time Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          if (!isSubscribed) return;
          setCloudSyncStatus('connected');
          setIsOnlineSyncActive(true);
        };

        eventSource.onmessage = (event) => {
          if (!isSubscribed || !event.data) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'PING') return;

            if (payload.version) {
              setCloudVersion(payload.version);
            }

            if (payload.type === 'CONNECTED') {
              setCloudSyncStatus('connected');
              setIsOnlineSyncActive(true);
              return;
            }

            if (payload.type === 'TABLE_UPDATE') {
              const { table, data } = payload;
              const storageKey = tableToKeyMap[table];
              if (storageKey) {
                applySyncUpdate(storageKey, data);
              }
            } else if (payload.type === 'INVENTORY_SAVED') {
              if (payload.products) {
                applySyncUpdate(STORAGE_KEYS.PRODUCTS, payload.products);
              }
              if (payload.inventoryEntries) {
                applySyncUpdate(STORAGE_KEYS.INVENTORY_ENTRIES, payload.inventoryEntries);
              }
            } else if (payload.type === 'RESET' && payload.db) {
              isReceivingRemoteSync.current = true;
              const db = payload.db;
              setProducts(db.products);
              setConsoles(db.consoles);
              setExtraControllerRates(db.extraControllerRates);
              setUsers(db.users);
              setActiveSessions([]);
              setClosedSessions([]);
              setSales([]);
              setExpenses([]);
              setInventoryEntries([]);
              setCredits([]);
              setCurrentCash(db.cash);
              setAccountSeq(1);
              setTimeout(() => {
                isReceivingRemoteSync.current = false;
              }, 100);
            }
          } catch (e) {
            console.error('Error processing cloud SSE event:', e);
          }
        };

        eventSource.onerror = () => {
          if (!isSubscribed) return;
          setCloudSyncStatus('connecting');
        };
      } catch (e) {
        console.warn('SSE initialization warning:', e);
      }
    }

    // C. BroadcastChannel Listener (Instant same-browser cross-tab sync)
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('pos_shared_realtime_db');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || msg.senderId === tabInstanceId) return;
        if (msg.timestamp) {
          lastProcessedSyncTimeRef.current = Math.max(lastProcessedSyncTimeRef.current, msg.timestamp);
        }
        applySyncUpdate(msg.key, msg.data);
      };
    }

    // D. Native StorageEvent Listener (fallback)
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (Object.values(STORAGE_KEYS).includes(e.key)) {
          applySyncUpdate(e.key, JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };
    window.addEventListener('storage', handleStorage);

    // E. Same-window CustomEvent Listener
    const handleCustomSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.senderId === tabInstanceId) return;
      applySyncUpdate(detail.key, detail.data);
    };
    window.addEventListener('pos_universal_sync', handleCustomSync);

    // F. Background integrity poller
    const pollerInterval = setInterval(() => {
      try {
        const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        const lastSyncNum = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
        if (lastSyncNum > lastProcessedSyncTimeRef.current) {
          lastProcessedSyncTimeRef.current = lastSyncNum;
          const sSales = localStorage.getItem(STORAGE_KEYS.SALES);
          if (sSales) setSales(JSON.parse(sSales));

          const sCredits = localStorage.getItem(STORAGE_KEYS.CREDITS);
          if (sCredits) {
            const parsed = JSON.parse(sCredits);
            setCredits(Array.isArray(parsed) ? parsed.filter((c: any) => !c.id?.includes('sample') && c.customerName !== 'Carlos Rodríguez') : []);
          }

          const sProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
          if (sProducts) setProducts(JSON.parse(sProducts));

          const sExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
          if (sExpenses) setExpenses(JSON.parse(sExpenses));

          const sCash = localStorage.getItem(STORAGE_KEYS.CASH);
          if (sCash) setCurrentCash(JSON.parse(sCash));

          const sClosures = localStorage.getItem(STORAGE_KEYS.CLOSURES);
          if (sClosures) setCashClosures(JSON.parse(sClosures));

          const sSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
          if (sSessions) setActiveSessions(JSON.parse(sSessions));

          const sClosed = localStorage.getItem(STORAGE_KEYS.CLOSED_SESSIONS);
          if (sClosed) setClosedSessions(JSON.parse(sClosed));

          const sEntries = localStorage.getItem(STORAGE_KEYS.INVENTORY_ENTRIES);
          if (sEntries) setInventoryEntries(JSON.parse(sEntries));
        }
      } catch (err) {
        console.error('Poller error:', err);
      }
    }, 1200);

    return () => {
      isSubscribed = false;
      if (eventSource) eventSource.close();
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pos_universal_sync', handleCustomSync);
      clearInterval(pollerInterval);
    };
  }, [tabInstanceId, applySyncUpdate]);

  // Persistence Effects with cross-screen broadcast
  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.USERS, users);
  }, [users, broadcastChange]);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.PRODUCTS, products);
  }, [products, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.CONSOLES, consoles);
  }, [consoles, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.EXTRA_CONTROLLERS, extraControllerRates);
  }, [extraControllerRates, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.SESSIONS, activeSessions);
  }, [activeSessions, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.CLOSED_SESSIONS, closedSessions);
  }, [closedSessions, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.SALES, sales);
  }, [sales, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.EXPENSES, expenses);
  }, [expenses, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.CASH, currentCash);
  }, [currentCash, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.CLOSURES, cashClosures);
  }, [cashClosures, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.INVENTORY_ENTRIES, inventoryEntries);
  }, [inventoryEntries, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    broadcastChange(STORAGE_KEYS.ACCOUNT_SEQ, accountSeq);
  }, [accountSeq, broadcastChange]);

  useEffect(() => {
    if (isReceivingRemoteSync.current) return;
    const cleanCredits = credits.filter(c => !c.id?.includes('sample') && c.customerName !== 'Carlos Rodríguez');
    broadcastChange(STORAGE_KEYS.CREDITS, cleanCredits);
  }, [credits, broadcastChange]);

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
    itemsSummary?: string;
    itemSummary?: string;
    total?: number;
    saleTotal?: number;
    notes?: string;
    dueDate?: string;
    saleId?: string;
    date?: string;
    customDate?: string;
    time?: string;
    customTime?: string;
  }): CreditAccount => {
    const now = new Date();
    const effectiveTotal = data.total ?? data.saleTotal ?? 0;
    const effectiveSummary = data.itemsSummary || data.itemSummary || 'Venta a crédito';
    const effectiveDate = data.date || data.customDate || getTodayDateString();
    const effectiveTime = data.time || data.customTime || getCurrentTimeString();
    const isPastDate = effectiveDate !== getTodayDateString();

    const creditId = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let linkedSaleId = data.saleId;

    // If no existing sale linked, automatically generate corresponding credit sale
    if (!linkedSaleId) {
      linkedSaleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newSale: Sale = {
        id: linkedSaleId,
        area: data.area,
        items: [
          {
            name: effectiveSummary,
            quantity: 1,
            unitPrice: effectiveTotal,
            subtotal: effectiveTotal,
            category: data.area === 'papeleria' ? 'Papelería' : data.area === 'xbox' ? 'Consolas' : 'Garguería',
          },
        ],
        total: effectiveTotal,
        paymentMethod: 'credito',
        notes: data.notes,
        date: effectiveDate,
        time: effectiveTime,
        timestamp: now.getTime(),
        isExtemporaneous: isPastDate,
        customerName: data.customerName.trim() || 'Cliente Fiado',
        customerPhone: data.customerPhone?.trim(),
        creditId,
        recordedBy: currentUser.name || currentUser.username,
      };

      setSales(prev => {
        const updated = [newSale, ...prev];
        broadcastChange(STORAGE_KEYS.SALES, updated);
        return updated;
      });
    }

    const newCredit: CreditAccount = {
      id: creditId,
      customerName: data.customerName.trim() || 'Cliente Fiado',
      customerPhone: data.customerPhone?.trim(),
      saleId: linkedSaleId,
      saleTotal: effectiveTotal,
      currentBalance: effectiveTotal,
      paidAmount: 0,
      area: data.area,
      itemsSummary: effectiveSummary,
      status: 'pendiente',
      createdAt: now.getTime(),
      createdDate: effectiveDate,
      createdTime: effectiveTime,
      dueDate: data.dueDate,
      payments: [],
      notes: data.notes,
    };

    setCredits(prev => {
      const updated = [newCredit, ...prev.filter(c => !c.id?.includes('sample') && c.customerName !== 'Carlos Rodríguez')];
      broadcastChange(STORAGE_KEYS.CREDITS, updated);
      return updated;
    });

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

    setCredits(prev => {
      const updated = prev.map(c => {
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
      });
      broadcastChange(STORAGE_KEYS.CREDITS, updated);
      return updated;
    });
  };

  const deleteCredit = (creditId: string) => {
    setCredits(prev => {
      const updated = prev.filter(c => c.id !== creditId);
      broadcastChange(STORAGE_KEYS.CREDITS, updated);
      return updated;
    });
  };

  // Password Management
  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!currentUser.password || currentUser.password === oldPassword) {
      const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
      const updatedCurrent = { ...currentUser, password: newPassword };
      setUsers(updatedUsers);
      setCurrentUser(updatedCurrent);
      broadcastChange(STORAGE_KEYS.USERS, updatedUsers);
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
    broadcastChange(STORAGE_KEYS.USERS, updatedUsers);
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
    dueDate?: string;
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
        dueDate: saleData.dueDate,
        payments: [],
        notes: saleData.notes,
      };

      setCredits(prev => {
        const updated = [newCredit, ...prev.filter(c => !c.id?.includes('sample') && c.customerName !== 'Carlos Rodríguez')];
        broadcastChange(STORAGE_KEYS.CREDITS, updated);
        return updated;
      });
      newSale.creditId = newCreditId;
    }

    // 1. Deduct inventory for tracked items (Garguería, Bebidas, Papelería con control de stock)
    setProducts(prevProducts => {
      const updated = [...prevProducts];
      let hasChanges = false;
      saleData.items.forEach(item => {
        if (item.productId) {
          const index = updated.findIndex(p => p.id === item.productId);
          if (index !== -1 && updated[index].trackStock) {
            updated[index] = {
              ...updated[index],
              stock: Math.max(0, updated[index].stock - item.quantity),
            };
            hasChanges = true;
          }
        }
      });
      if (hasChanges) {
        broadcastChange(STORAGE_KEYS.PRODUCTS, updated);
      }
      return updated;
    });

    // 2. Add to sales and broadcast
    setSales(prev => {
      const updated = [newSale, ...prev];
      broadcastChange(STORAGE_KEYS.SALES, updated);
      return updated;
    });

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

  const openCashRegister = (
    initialCash: number = 155000,
    initialCashGeneral: number = 100000,
    initialCashTragamonedas: number = 55000
  ) => {
    const updated: CurrentCashRegister = {
      id: `cash-${getTodayDateString()}`,
      date: getTodayDateString(),
      openedAt: Date.now(),
      initialCash,
      initialCashGeneral,
      initialCashTragamonedas,
      isOpen: true,
      withdrawals: [],
    };
    setCurrentCash(updated);
    localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(updated));
  };

  const updateInitialCash = (
    total: number,
    general: number = 100000,
    tragamonedas: number = 55000
  ) => {
    setCurrentCash(prev => {
      const updated: CurrentCashRegister = {
        ...prev,
        initialCash: total,
        initialCashGeneral: general,
        initialCashTragamonedas: tragamonedas,
      };
      localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(updated));
      return updated;
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
      initialCashGeneral: currentCash.initialCashGeneral || 100000,
      initialCashTragamonedas: currentCash.initialCashTragamonedas || 55000,
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

    setInventoryEntries(prev => {
      const updated = [entry, ...prev];
      broadcastChange(STORAGE_KEYS.INVENTORY_ENTRIES, updated);
      return updated;
    });

    // Update product stock and optionally unit cost immediately
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === data.productId) {
          return {
            ...p,
            stock: p.stock + data.quantity,
            cost: data.unitCost > 0 ? data.unitCost : p.cost,
          };
        }
        return p;
      });
      broadcastChange(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
  };

  const saveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      const updated = exists ? prev.map(p => (p.id === product.id ? product : p)) : [product, ...prev];
      broadcastChange(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
  };

  const deleteOrDeactivateProduct = (productId: string) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId ? { ...p, isActive: false } : p));
      broadcastChange(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId ? { ...p, price: Math.max(0, newPrice) } : p));
      broadcastChange(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId ? { ...p, stock: Math.max(0, newStock), trackStock: true } : p));
      broadcastChange(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
  };

  const persistInventoryChanges = () => {
    broadcastChange(STORAGE_KEYS.PRODUCTS, products);
    broadcastChange(STORAGE_KEYS.INVENTORY_ENTRIES, inventoryEntries);
    if (typeof fetch !== 'undefined') {
      fetch('/api/db/save-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          inventoryEntries,
          updatedBy: currentUser?.username || 'sistema',
        }),
      })
        .then(r => r.json())
        .then(res => {
          if (res?.version) {
            setCloudVersion(res.version);
            setCloudSyncStatus('connected');
            setIsOnlineSyncActive(true);
          }
        })
        .catch(err => {
          console.warn('Direct cloud inventory save warning:', err);
        });
    }
    return { success: true, count: products.length };
  };

  const saveConsoleRates = (consoleId: string, rates: XboxConsole['rates']) => {
    setConsoles(prev => {
      const updated = prev.map(c => (c.id === consoleId ? { ...c, rates } : c));
      broadcastChange(STORAGE_KEYS.CONSOLES, updated);
      return updated;
    });
  };

  const saveExtraControllerRates = (rates: ExtraControllerRate[]) => {
    setExtraControllerRates(rates);
    broadcastChange(STORAGE_KEYS.EXTRA_CONTROLLERS, rates);
  };

  const resetToDefaults = () => {
    const cleanCash: CurrentCashRegister = {
      id: `cash-${getTodayDateString()}`,
      date: getTodayDateString(),
      openedAt: Date.now(),
      initialCash: 155000,
      initialCashGeneral: 100000,
      initialCashTragamonedas: 55000,
      isOpen: true,
      withdrawals: [],
    };

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
    setCredits([]);
    setAccountSeq(1);
    setCurrentCash(cleanCash);

    localStorage.clear();

    // Broadcast clean database to all views immediately
    broadcastChange(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    broadcastChange(STORAGE_KEYS.CONSOLES, INITIAL_CONSOLES);
    broadcastChange(STORAGE_KEYS.EXTRA_CONTROLLERS, INITIAL_EXTRA_CONTROLLER_RATES);
    broadcastChange(STORAGE_KEYS.USERS, INITIAL_USERS);
    broadcastChange(STORAGE_KEYS.SESSIONS, []);
    broadcastChange(STORAGE_KEYS.CLOSED_SESSIONS, []);
    broadcastChange(STORAGE_KEYS.SALES, []);
    broadcastChange(STORAGE_KEYS.EXPENSES, []);
    broadcastChange(STORAGE_KEYS.INVENTORY_ENTRIES, []);
    broadcastChange(STORAGE_KEYS.CREDITS, []);
    broadcastChange(STORAGE_KEYS.CASH, cleanCash);
    broadcastChange(STORAGE_KEYS.ACCOUNT_SEQ, 1);

    if (typeof fetch !== 'undefined') {
      fetch('/api/db/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      }).catch(err => console.warn('Cloud reset warning:', err));
    }
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
        updateInitialCash,
        addCashWithdrawal,
        closeCashRegister,
        addInventoryEntry,
        isAdmin: currentUser.role === 'admin',
        saveProduct,
        updateProductPrice,
        updateProductStock,
        deleteOrDeactivateProduct,
        persistInventoryChanges,
        saveConsoleRates,
        updateConsoleRates: saveConsoleRates,
        saveExtraControllerRates,
        updateExtraControllerRates: saveExtraControllerRates,
        resetToDefaults,
        resetToInitialDefaults: resetToDefaults,
        isOnlineSyncActive,
        cloudSyncStatus,
        cloudVersion,
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
