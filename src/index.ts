import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database.js';
import { apiKeyAuth, errorHandler, notFoundHandler } from './middlewares/index.js';
import apiRoutes from './routes/index.js';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../server/routers.js';
import { createContext } from '../server/_core/context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || (isProduction ? '5000' : '3001'), 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC API routes
app.use('/api/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
}));

app.use('/api/v1', apiKeyAuth, apiRoutes);

if (isProduction) {
  const clientDist = path.join(__dirname, 'public');
  app.use(express.static(clientDist));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use(notFoundHandler);
}

app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
      console.log(`[Server] API base URL: http://localhost:${PORT}/api/v1`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

startServer();
