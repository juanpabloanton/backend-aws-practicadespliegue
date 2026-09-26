import { Schema, model, isValidObjectId } from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import type { IEmployeeRepository } from './employee.repository.interface.js';
import type { Employee, EmployeeInput } from '../models/employee.js';

// Único archivo de la aplicación que conoce Mongoose.
const employeeSchema = new Schema<EmployeeInput>(
  {
    nombre: { type: String, required: true },
    cargo: { type: String, required: true },
    departamento: { type: String, required: true },
    sueldo: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

const EmployeeModel = model<EmployeeInput>('Empleado', employeeSchema);

// Traduce el documento de Mongoose al modelo de dominio (sin _id ni métodos del ODM).
const toEmployee = (doc: HydratedDocument<EmployeeInput>): Employee => ({
  id: doc.id,
  nombre: doc.nombre,
  cargo: doc.cargo,
  departamento: doc.departamento,
  sueldo: doc.sueldo,
});

export class MongoEmployeeRepository implements IEmployeeRepository {
  async createEmployee(employeeData: EmployeeInput): Promise<Employee> {
    const created = await new EmployeeModel(employeeData).save();
    return toEmployee(created);
  }

  async getAllEmployees(): Promise<Employee[]> {
    const employees = await EmployeeModel.find();
    return employees.map(toEmployee);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    if (!isValidObjectId(id)) return null;
    const employee = await EmployeeModel.findById(id);
    return employee ? toEmployee(employee) : null;
  }

  async updateEmployee(id: string, employeeData: Partial<EmployeeInput>): Promise<Employee | null> {
    if (!isValidObjectId(id)) return null;
    const updated = await EmployeeModel.findByIdAndUpdate(id, employeeData, { new: true });
    return updated ? toEmployee(updated) : null;
  }

  async deleteEmployee(id: string): Promise<void> {
    if (!isValidObjectId(id)) return;
    await EmployeeModel.findByIdAndDelete(id);
  }
}
