import { z } from "zod";

export const createOrderSchema = z.object({
  country: z.string().optional(),

  provider: z.enum(["MERCADOPAGO", "PAYPAL"]),

  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .min(1),
});