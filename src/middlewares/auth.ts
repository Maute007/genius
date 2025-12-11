import { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.API_KEY || 'genius-api-key-2024';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Missing API key. Please provide X-API-Key header.',
    });
    return;
  }

  if (apiKey !== API_KEY) {
    res.status(403).json({
      success: false,
      error: 'Invalid API key.',
    });
    return;
  }

  next();
}
