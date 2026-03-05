import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  price: z.number().int().min(0),     // centavos
  currency: z.string().min(3).default("ARS"),
  isActive: z.boolean().optional(),
  isSubscription: z.boolean().optional(),
  requiresPremium: z.boolean().optional(),
  resourceType: z.enum(["LINK", "FILE"]).optional(),
  resourceUrl: z.string().optional(),
  paypalPlanId: z.string().nullable().optional()
});

export const updateProductSchema = createProductSchema.partial();