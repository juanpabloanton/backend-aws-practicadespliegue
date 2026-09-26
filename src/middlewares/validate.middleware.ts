import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../errors/app.error.js';
import type { ErrorDetail } from '../errors/app.error.js';

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
}

// Valida antes de llegar al controlador. Si pasa, reemplaza body/params por los datos ya
// limpios (sin campos desconocidos y con los textos recortados).
export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    const errors: ErrorDetail[] = [];

    const run = (source: 'params' | 'body', schema: ZodType | undefined): unknown => {
      if (!schema) return undefined;
      const result = schema.safeParse(req[source]);
      if (result.success) return result.data;
      for (const issue of result.error.issues) {
        errors.push({ campo: issue.path.join('.') || source, mensaje: issue.message });
      }
      return undefined;
    };

    const params = run('params', schemas.params);
    const body = run('body', schemas.body);

    if (errors.length > 0) {
      next(new ValidationError(errors));
      return;
    }

    if (schemas.params) req.params = params as typeof req.params;
    if (schemas.body) req.body = body;
    next();
  };
