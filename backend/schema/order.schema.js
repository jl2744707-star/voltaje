import { z } from "zod";

export const createOrderSchema = z.object({
  id_address: z
    .number({ required_error: "Debe seleccionar una dirección de envío" })
    .int(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["Pendiente", "Pagado", "Enviado", "Entregado", "Cancelado"], {
    required_error: "El estado de la orden no es válido",
  }),
});
