import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { EmployeeController } from './empleados.controllers.js';
import type { IEmployeeRepository } from '../repository/employee.repository.interface.js';
import type { Employee, EmployeeInput } from '../models/employee.js';
import { NotFoundError } from '../errors/app.error.js';
    
// Ninguna línea de este archivo importa mongoose: el controlador se prueba solo contra la abstracción.
describe('🧪 Unit Test: EmployeeController (Mantenibilidad & Testabilidad)', () => {
  let controller: EmployeeController;
  let mockRepository: jest.Mocked<IEmployeeRepository>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  const fakeEmployee: Employee = {
    id: 'abc123',
    nombre: 'Andrés Mendoza',
    cargo: 'Arquitecto',
    departamento: 'TI',
    sueldo: 4000,
  };
  const input: EmployeeInput = { nombre: 'Andrés Mendoza', cargo: 'Arquitecto', departamento: 'TI', sueldo: 4000 };
  const dbError = new Error('MongoNetworkError: conexión perdida');

  const byId = (id: string) => ({ params: { id } }) as Request<{ id: string }>;
  const byIdWithBody = (id: string, body: Partial<EmployeeInput>) =>
    ({ params: { id }, body }) as Request<{ id: string }, unknown, Partial<EmployeeInput>>;
  const withBody = (body: EmployeeInput) => ({ body }) as Request<Record<string, never>, unknown, EmployeeInput>;

  beforeEach(() => {
    // 1. Doble de prueba 100% aislado de la interfaz (cero dependencia de Mongoose)
    mockRepository = {
      getAllEmployees: jest.fn<IEmployeeRepository['getAllEmployees']>(),
      getEmployeeById: jest.fn<IEmployeeRepository['getEmployeeById']>(),
      createEmployee: jest.fn<IEmployeeRepository['createEmployee']>(),
      updateEmployee: jest.fn<IEmployeeRepository['updateEmployee']>(),
      deleteEmployee: jest.fn<IEmployeeRepository['deleteEmployee']>(),
    };

    controller = new EmployeeController(mockRepository);

    // 2. Mock del objeto Response de Express: res.status(...).json(...)
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = { status: statusMock } as Partial<Response>;
  });

  describe('✅ Casos exitosos', () => {
    it('Debería retornar un estado 200 y la lista de empleados de la abstracción', async () => {
      mockRepository.getAllEmployees.mockResolvedValue([fakeEmployee]);

      await controller.getEmpleados({} as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Empleados obtenidos correctamente',
        data: [fakeEmployee],
        errors: null,
      });
      expect(mockRepository.getAllEmployees).toHaveBeenCalledTimes(1);
    });

    it('Debería retornar 200 con una lista vacía cuando no hay empleados', async () => {
      mockRepository.getAllEmployees.mockResolvedValue([]);

      await controller.getEmpleados({} as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [] }));
    });

    it('Debería retornar 200 y el empleado buscado por id', async () => {
      mockRepository.getEmployeeById.mockResolvedValue(fakeEmployee);

      await controller.getEmpleado(byId('abc123'), mockResponse as Response);

      expect(mockRepository.getEmployeeById).toHaveBeenCalledWith('abc123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: fakeEmployee }));
    });

    it('Debería retornar 201 y el empleado creado', async () => {
      mockRepository.createEmployee.mockResolvedValue(fakeEmployee);

      await controller.addEmpleado(withBody(input), mockResponse as Response);

      expect(mockRepository.createEmployee).toHaveBeenCalledWith(input);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: fakeEmployee }));
    });

    it('Debería retornar 200 y el empleado actualizado', async () => {
      const actualizado = { ...fakeEmployee, sueldo: 5000 };
      mockRepository.updateEmployee.mockResolvedValue(actualizado);

      await controller.updateEmpleado(byIdWithBody('abc123', { sueldo: 5000 }), mockResponse as Response);

      expect(mockRepository.updateEmployee).toHaveBeenCalledWith('abc123', { sueldo: 5000 });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ data: actualizado }));
    });

    it('Debería retornar 200 con data null al eliminar', async () => {
      mockRepository.deleteEmployee.mockResolvedValue();

      await controller.deleteEmpleado(byId('abc123'), mockResponse as Response);

      expect(mockRepository.deleteEmployee).toHaveBeenCalledWith('abc123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });
  });

  describe('❌ Casos fallidos', () => {
    it('Debería lanzar NotFoundError (404) cuando el empleado buscado no existe', async () => {
      mockRepository.getEmployeeById.mockResolvedValue(null);

      const promesa = controller.getEmpleado(byId('no-existe'), mockResponse as Response);

      await expect(promesa).rejects.toBeInstanceOf(NotFoundError);
      await expect(promesa).rejects.toMatchObject({ statusCode: 404, message: 'Empleado no encontrado' });
      expect(mockRepository.getEmployeeById).toHaveBeenCalledWith('no-existe');
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('Debería lanzar NotFoundError (404) al actualizar un empleado inexistente', async () => {
      mockRepository.updateEmployee.mockResolvedValue(null);

      const promesa = controller.updateEmpleado(byIdWithBody('no-existe', { sueldo: 5000 }), mockResponse as Response);

      await expect(promesa).rejects.toMatchObject({ statusCode: 404 });
      expect(statusMock).not.toHaveBeenCalled();
    });

    // Si la base de datos cae, el controlador no debe responder por su cuenta:
    // propaga el error para que Express 5 lo entregue al interceptor global (500).
    it('Debería propagar el error cuando la base de datos falla al listar', async () => {
      mockRepository.getAllEmployees.mockRejectedValue(dbError);

      await expect(controller.getEmpleados({} as Request, mockResponse as Response)).rejects.toThrow(dbError);
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('Debería propagar el error cuando la base de datos falla al crear', async () => {
      mockRepository.createEmployee.mockRejectedValue(dbError);

      await expect(controller.addEmpleado(withBody(input), mockResponse as Response)).rejects.toThrow(dbError);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('Debería propagar el error cuando la base de datos falla al buscar por id', async () => {
      mockRepository.getEmployeeById.mockRejectedValue(dbError);

      await expect(controller.getEmpleado(byId('abc123'), mockResponse as Response)).rejects.toThrow(dbError);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('Debería propagar el error cuando la base de datos falla al actualizar', async () => {
      mockRepository.updateEmployee.mockRejectedValue(dbError);

      await expect(
        controller.updateEmpleado(byIdWithBody('abc123', { sueldo: 1 }), mockResponse as Response),
      ).rejects.toThrow(dbError);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('Debería propagar el error cuando la base de datos falla al eliminar', async () => {
      mockRepository.deleteEmployee.mockRejectedValue(dbError);

      await expect(controller.deleteEmpleado(byId('abc123'), mockResponse as Response)).rejects.toThrow(dbError);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
