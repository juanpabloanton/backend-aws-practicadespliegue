import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { IEmployeeRepository } from './repository/employee.repository.interface.js';
import { EmployeeController } from './controllers/empleados.controllers.js';
import { createEmployeeRoutes } from './routes/empleados.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { slackNotifier } from './middlewares/slackNotifier.middleware.js';

export const createApp = (employeeRepository: IEmployeeRepository): Application => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(slackNotifier);

  app.set('nombreApp', 'Gestión de empleados');

  app.use('/api/v1', createEmployeeRoutes(new EmployeeController(employeeRepository)));

  // Siempre al final: rutas inexistentes y interceptor global de errores.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
