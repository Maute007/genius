import 'dotenv/config';
import express from 'express';
import { initializeDatabase } from './config/database';
import { apiKeyAuth, errorHandler, notFoundHandler } from './middlewares';
import apiRoutes from './routes';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', apiKeyAuth, apiRoutes);

app.use(notFoundHandler);
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
