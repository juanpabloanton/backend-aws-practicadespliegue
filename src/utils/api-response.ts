import type { Response } from 'express';
import type { ErrorDetail } from '../errors/app.error.js';

// Forma única de toda respuesta de la API, exitosa o fallida.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ErrorDetail[] | null;
}

export const ResponseWrapper = {
  success<T>(res: Response, data: T, message: string = 'Operación exitosa', statusCode: number = 200): void {
    const body: ApiResponse<T> = { success: true, message, data, errors: null };
    res.status(statusCode).json(body);
  },

  error(res: Response, message: string, statusCode: number, errors: ErrorDetail[] | null = null): void {
    const body: ApiResponse<null> = { success: false, message, data: null, errors };
    res.status(statusCode).json(body);
  },
};
