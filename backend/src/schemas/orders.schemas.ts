import { z } from "zod";

const orderItemSchema = z
  .object({
    productId: z.string().min(1).optional(),
    classId: z.string().min(1).optional(),
    quantity: z.number().int().min(1).default(1),
  })
  .refine((item) => Boolean(item.productId) !== Boolean(item.classId), {
    message: "Cada item debe tener productId o classId, no ambos ni ninguno",
  });

export const createOrderSchema = z.object({
  country: z.string().optional(),

  provider: z.enum(["MERCADOPAGO", "PAYPAL"]),

  items: z.array(orderItemSchema).min(1),
});