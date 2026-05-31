import { z } from "zod";

// ==========================================
// 1. ESQUEMA PARA CREAR PRODUCTO (POST)
// ==========================================
export const createProductSchema = z.object({
  name: z
    .string({ required_error: "El nombre del producto es requerido" })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no puede superar los 100 caracteres" }),

  description: z
    .string()
    .max(500, { message: "La descripción no puede superar los 500 caracteres" })
    .optional()
    .nullable(),

  brand: z
    .string({ required_error: "La marca es requerida" })
    .min(1, { message: "La marca no puede estar vacía" })
    .max(50, { message: "La marca no puede superar los 50 caracteres" }),

  category: z
    .string({ required_error: "La categoría es requerida" })
    .min(1, { message: "Debe seleccionar una categoría" })
    .max(50, { message: "La categoría no puede superar los 50 caracteres" }),

  // Transformamos el string del FormData a número decimal y validamos
  price: z
    .string({ required_error: "El precio es requerido" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "El precio debe ser un número válido",
    })
    .transform((val) => parseFloat(val))
    .refine((num) => num > 0, { message: "El precio debe ser mayor a 0" }),

  // Transformamos el string del FormData a entero y validamos
  stock: z
    .string({ required_error: "El stock es requerido" })
    .refine((val) => !isNaN(parseInt(val, 10)), {
      message: "El stock debe ser un número entero",
    })
    .transform((val) => parseInt(val, 10))
    .refine((num) => num >= 0, { message: "El stock no puede ser negativo" }),
});

// ==========================================
// 2. ESQUEMA PARA ACTUALIZAR PRODUCTO (PUT)
// ==========================================
// Usamos .partial() para que todos los campos sean opcionales automáticamente,
// pero mantenemos las mismas reglas de validación interna si deciden mandarlos.
export const updateProductSchema = createProductSchema.partial().extend({
  // Permitimos cambiar el estado de activo/inactivo de forma opcional
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return val === "true"; // Maneja el string 'true'/'false' que manda el FormData
    })
    .optional(),
});
