import { z } from 'zod';

export const createEmployeeSchema = z.object(
  {
    nombre: z
      .string({ error: 'El nombre es obligatorio y debe ser texto' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar los 100 caracteres'),
    cargo: z
      .string({ error: 'El cargo es obligatorio y debe ser texto' })
      .trim()
      .min(3, 'El cargo debe tener al menos 3 caracteres')
      .max(100, 'El cargo no puede superar los 100 caracteres'),
    departamento: z
      .string({ error: 'El departamento es obligatorio y debe ser texto' })
      .trim()
      .min(2, 'El departamento debe tener al menos 2 caracteres')
      .max(100, 'El departamento no puede superar los 100 caracteres'),
    sueldo: z
      .number({ error: 'El sueldo es obligatorio y debe ser un número' })
      .positive('El sueldo debe ser mayor que cero'),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' },
);

// Actualización parcial: cualquier campo es opcional, pero debe venir al menos uno.
export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Debe enviar al menos un campo a actualizar',
  });

// Agnóstico al motor: solo exige un id no vacío. El formato real lo resuelve el repositorio.
export const idParamSchema = z.object({
  id: z.string({ error: 'El id es obligatorio' }).trim().min(1, 'El id es obligatorio'),
});
