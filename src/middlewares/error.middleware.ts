import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../errors/app.error.js';
import { ResponseWrapper } from '../utils/api-response.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  ResponseWrapper.error(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);
};

// Interceptor global: ninguna excepción cruda llega al cliente.
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    ResponseWrapper.error(res, err.message, err.statusCode, err.errors);
    return;
  }

  // JSON malformado detectado por express.json()
  if (err?.type === 'entity.parse.failed') {
    ResponseWrapper.error(res, 'El cuerpo de la petición no es un JSON válido', 400);
    return;
  }

  console.error('❌ [Error no controlado]:', err);
  ResponseWrapper.error(res, 'Error interno del servidor', 500);
};
