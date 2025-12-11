import { Response } from 'express';
import { ApiResponse } from '../types/api';

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode: number = 400): void {
  res.status(statusCode).json({
    success: false,
    error,
  });
}
