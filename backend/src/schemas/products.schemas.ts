import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),

  arPrice: z.number().int().min(0).default(0),
  usdPrice: z.number().int().min(0).default(0),

  isActive: z.boolean().optional(),
  isSubscription: z.boolean().optional(),
  requiresPremium: z.boolean().optional(),

  resourceType: z.enum(["LINK", "FILE"]).optional(),
  resourceUrl: z.string().optional(),

  paypalPlanId: z.string().nullable().optional(),
});
export const updateProductSchema = createProductSchema.partial();