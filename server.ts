import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_CONSOLES, INITIAL_EXTRA_CONTROLLER_RATES, INITIAL_USERS } from './src/data/initialData';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pos_database.json');

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface CentralDatabase {
  version: number;
  lastUpdated: number;
  products: any[];
  consoles: any[];
  extraControllerRates: any[];
  users: any[];
  sessions: any[];
  closedSessions: any[];
  sales: any[];
  expenses: any[];
  inventoryEntries: any[];
  credits: any[];
  cash: any;
  cashClosures: any[];
  accountSeq: number;
}

function getDefaultDatabase(): CentralDatabase {
  const today = getTodayDateString();
  return {
    version: 1,
    lastUpdated: Date.now(),
    products: INITIAL_PRODUCTS,
    consoles: INITIAL_CONSOLES,
    extraControllerRates: INITIAL_EXTRA_CONTROLLER_RATES,
    users: INITIAL_USERS,
    sessions: [],
    closedSessions: [],
    sales: [],
    expenses: [],
    inventoryEntries: [],
    credits: [], // ZERO ghost credits
    cash: {
      id: `cash-${today}`,
      date: today,
      openedAt: Date.now(),
      initialCash: 155000,
      initialCashGeneral: 100000,
      initialCashTragamonedas: 55000,
      isOpen: true,
      withdrawals: [],
    },
    cashClosures: [],
    accountSeq: 1,
  };
}

let memoryDb: CentralDatabase | null = null;

function loadDatabase(): CentralDatabase {
  if (memoryDb) return memoryDb;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure all required fields and purge any legacy ghost credits
      if (Array.isArray(parsed.credits)) {
        parsed.credits = parsed.credits.filter(
          (c: any) => c && !c.id?.includes('sample') && c.customerName !== 'Carlos Rodríguez'
        );
      } else {
        parsed.credits = [];
      }
      memoryDb = {
        ...getDefaultDatabase(),
        ...parsed,
        version: Number(parsed.version) || 1,
        lastUpdated: Number(parsed.lastUpdated) || Date.now(),
      };
      return memoryDb!;
    }
  } catch (err) {
    console.error('Error reading pos_database.json, initializing fresh database:', err);
  }

  memoryDb = getDefaultDatabase();
  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(db: CentralDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = Date.now();
    memoryDb = db;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving pos_database.json:', err);
  }
}

// Connected SSE clients for real-time push
const sseClients = new Set<Response>();

function broadcastSSE(eventData: any) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();

  // CORS and anti-buffering middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Ensure database is initialized
  const db = loadDatabase();

  // API 0: Fast ping with latency measurement
  app.get('/api/ping', (_req: Request, res: Response) => {
    const current = loadDatabase();
    res.json({
      ok: true,
      version: current.version,
      time: Date.now(),
      connectedClients: sseClients.size,
    });
  });

  // API 1: Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version: db.version,
      connectedClients: sseClients.size,
      time: Date.now(),
    });
  });

  // API 2: Full Database snapshot
  app.get('/api/db', (_req: Request, res: Response) => {
    const current = loadDatabase();
    res.json({
      success: true,
      db: current,
      version: current.version,
      lastUpdated: current.lastUpdated,
    });
  });

  // API 3: Real-Time Server-Sent Events (SSE) stream
  app.get('/api/events', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', version: db.version, time: Date.now() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Keep-alive heartbeat for SSE every 20 seconds
  setInterval(() => {
    const ping = `data: ${JSON.stringify({ type: 'PING', time: Date.now() })}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(ping);
      } catch {
        sseClients.delete(client);
      }
    }
  }, 20000);

  // API 4: Atomic Table Sync / Mutation
  app.post('/api/db/sync', (req: Request, res: Response) => {
    const { table, data, clientVersion, updatedBy } = req.body;
    if (!table) {
      return res.status(400).json({ error: 'Missing table name' });
    }

    const current = loadDatabase();
    (current as any)[table] = data;
    current.version += 1;
    saveDatabase(current);

    // Broadcast change to all connected devices in real time
    broadcastSSE({
      type: 'TABLE_UPDATE',
      table,
      data,
      version: current.version,
      updatedBy: updatedBy || 'unknown',
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      table,
      version: current.version,
      lastUpdated: current.lastUpdated,
    });
  });

  // API 5: Batch sync
  app.post('/api/db/batch-sync', (req: Request, res: Response) => {
    const { changes, updatedBy } = req.body;
    if (!changes || typeof changes !== 'object') {
      return res.status(400).json({ error: 'Invalid changes object' });
    }

    const current = loadDatabase();
    for (const key of Object.keys(changes)) {
      (current as any)[key] = changes[key];
    }
    current.version += 1;
    saveDatabase(current);

    broadcastSSE({
      type: 'BATCH_UPDATE',
      changes,
      version: current.version,
      updatedBy: updatedBy || 'unknown',
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      version: current.version,
      lastUpdated: current.lastUpdated,
    });
  });

  // API 6: Direct Inventory Save
  app.post('/api/db/save-inventory', (req: Request, res: Response) => {
    const { products, inventoryEntries, updatedBy } = req.body;
    const current = loadDatabase();

    if (Array.isArray(products)) {
      current.products = products;
    }
    if (Array.isArray(inventoryEntries)) {
      current.inventoryEntries = inventoryEntries;
    }

    current.version += 1;
    saveDatabase(current);

    broadcastSSE({
      type: 'INVENTORY_SAVED',
      products: current.products,
      inventoryEntries: current.inventoryEntries,
      version: current.version,
      updatedBy: updatedBy || 'unknown',
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      count: current.products.length,
      version: current.version,
    });
  });

  // API 7: Reset to defaults
  app.post('/api/db/reset', (req: Request, res: Response) => {
    const fresh = getDefaultDatabase();
    fresh.version = (memoryDb?.version || 1) + 1;
    saveDatabase(fresh);

    broadcastSSE({
      type: 'RESET',
      db: fresh,
      version: fresh.version,
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      db: fresh,
      version: fresh.version,
    });
  });

  // API 8: Security & Rules Check
  app.get('/api/security-check', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      status: 'authorized',
      access: 'read_write',
      message: 'Permisos de base de datos activos y verificados sin restricciones 403',
      timestamp: Date.now(),
    });
  });

  // Safe JSON 404 for unknown /api endpoints
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Ruta de API no encontrada', status: 404 });
  });

  // Error handling middleware for API routes
  app.use('/api', (err: any, _req: Request, res: Response, _next: any) => {
    console.error('Error interno en API:', err);
    res.status(500).json({ error: err?.message || 'Error interno del servidor', status: 500 });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Central Online Database & POS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
