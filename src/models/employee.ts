// Modelo de dominio: no depende de Mongoose ni de ningún motor de base de datos.
export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
}

export type EmployeeInput = Omit<Employee, 'id'>;
