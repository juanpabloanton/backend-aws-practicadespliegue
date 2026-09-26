export interface ErrorDetail {
  campo: string;
  mensaje: string;
}

// Error controlado: el middleware global sabe cómo traducirlo a una respuesta HTTP.
export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 500,
    readonly errors: ErrorDetail[] | null = null,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(errors: ErrorDetail[]) {
    super('Datos de entrada inválidos', 400, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}
