import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Google Apps Script Proxy Handler
  // Solves browser CORS and follows Google 302 redirects seamlessly
  app.all('/api/gas', async (req: Request, res: Response) => {
    try {
      let targetUrl = '';
      let action = '';
      let payload = null;

      if (req.method === 'GET') {
        targetUrl = (req.query.url as string) || '';
        action = (req.query.action as string) || 'PING';
        if (targetUrl.includes('?')) {
          targetUrl += `&action=${encodeURIComponent(action)}`;
        } else {
          targetUrl += `?action=${encodeURIComponent(action)}`;
        }
      } else {
        const body = req.body || {};
        targetUrl = body.gasUrl || (req.query.url as string) || '';
        action = body.action || '';
        payload = body.payload || body;
      }

      if (!targetUrl) {
        return res.status(400).json({ status: 'error', message: 'Missing Google Apps Script URL' });
      }

      const fetchOptions: RequestInit = {
        method: req.method === 'GET' ? 'GET' : 'POST',
        headers: {
          'Accept': 'application/json',
          ...(req.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(req.method === 'POST' ? { body: JSON.stringify({ action, payload }) } : {}),
        redirect: 'follow',
      };

      const gasResponse = await fetch(targetUrl, fetchOptions);
      const text = await gasResponse.text();

      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (parseErr) {
        return res.json({ status: 'success', raw: text });
      }
    } catch (err: any) {
      console.error('[Server] GAS Proxy Error:', err.message);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // Vite middleware for dev / static files for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true as const },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DailyPlate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
