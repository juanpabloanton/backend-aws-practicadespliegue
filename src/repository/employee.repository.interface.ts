import type { Employee, EmployeeInput } from '../models/employee.js';

// Contrato de persistencia: el resto de la app solo conoce esta interfaz.
export interface IEmployeeRepository {
  createEmployee(employeeData: EmployeeInput): Promise<Employee>;
  getAllEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | null>;
  updateEmployee(id: string, employeeData: Partial<EmployeeInput>): Promise<Employee | null>;
  deleteEmployee(id: string): Promise<void>;
}
