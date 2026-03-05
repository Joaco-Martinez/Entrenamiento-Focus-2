import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).default(1)
  })).min(1)
});