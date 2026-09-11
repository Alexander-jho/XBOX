import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = req.url || '';

  if (url.includes('/api/ping') || url.includes('/api/security-check')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, timestamp: Date.now(), status: 'authorized' }));
    return;
  }

  // Default fallback for /api on Vercel
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    message: 'API activa en Vercel',
    version: 1,
    timestamp: Date.now()
  }));
}
