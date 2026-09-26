import type { Request, Response } from 'express';
import type { IEmployeeRepository } from '../repository/employee.repository.interface.js';
import type { EmployeeInput } from '../models/employee.js';
import { NotFoundError } from '../errors/app.error.js';
import { ResponseWrapper } from '../utils/api-response.js';

// El controlador solo habla HTTP; la persistencia llega inyectada como abstracción.
// La validación ocurre antes (middleware) y los errores los formatea el interceptor global.
export class EmployeeController {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  getEmpleados = async (_req: Request, res: Response): Promise<void> => {
    const empleados = await this.employeeRepository.getAllEmployees();
    ResponseWrapper.success(res, empleados, 'Empleados obtenidos correctamente');
  };

  getEmpleado = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const empleado = await this.employeeRepository.getEmployeeById(req.params.id);
    if (!empleado) throw new NotFoundError('Empleado no encontrado');
    ResponseWrapper.success(res, empleado, 'Empleado obtenido correctamente');
  };

  addEmpleado = async (
    req: Request<Record<string, never>, unknown, EmployeeInput>,
    res: Response,
  ): Promise<void> => {
    const empleado = await this.employeeRepository.createEmployee(req.body);
    ResponseWrapper.success(res, empleado, 'Empleado guardado', 201);
  };

  updateEmpleado = async (
    req: Request<{ id: string }, unknown, Partial<EmployeeInput>>,
    res: Response,
  ): Promise<void> => {
    const empleado = await this.employeeRepository.updateEmployee(req.params.id, req.body);
    if (!empleado) throw new NotFoundError('Empleado no encontrado');
    ResponseWrapper.success(res, empleado, 'Empleado actualizado');
  };

  deleteEmpleado = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    await this.employeeRepository.deleteEmployee(req.params.id);
    ResponseWrapper.success(res, null, 'Empleado eliminado');
  };
}
