import { z } from "zod";

export const addItemSchema = z.object({
  id_product: z
    .number({ required_error: "El ID del producto es requerido" })
    .int(),
  quantity: z
    .number({ required_error: "La cantidad es requerida" })
    .int()
    .positive({ message: "La cantidad debe ser mayor a 0" }),
});

export const updateItemSchema = z.object({
  quantity: z
    .number({ required_error: "La cantidad es requerida" })
    .int()
    .positive({ message: "La cantidad debe ser mayor a 0" }),
});
