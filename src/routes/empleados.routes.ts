import { Router } from 'express';
import type { EmployeeController } from '../controllers/empleados.controllers.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createEmployeeSchema, updateEmployeeSchema, idParamSchema } from '../dto/employee.dto.js';

export const createEmployeeRoutes = (controller: EmployeeController): Router => {
  const router = Router();

  router.post('/employees', validate({ body: createEmployeeSchema }), controller.addEmpleado);
  router.get('/employees', controller.getEmpleados);
  router.get('/employees/:id', validate({ params: idParamSchema }), controller.getEmpleado);
  router.put(
    '/employees/:id',
    validate({ params: idParamSchema, body: updateEmployeeSchema }),
    controller.updateEmpleado,
  );
  router.delete('/employees/:id', validate({ params: idParamSchema }), controller.deleteEmpleado);

  return router;
};
