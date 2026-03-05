import { z } from "zod";

export const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true)
});