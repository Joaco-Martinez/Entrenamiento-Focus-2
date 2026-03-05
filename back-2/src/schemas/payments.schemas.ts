import { z } from "zod";

export const mpPreferenceSchema = z.object({
  orderId: z.string().min(1)
});

export const paypalCheckoutSchema = z.object({
  orderId: z.string().min(1),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export const paypalSubscriptionSchema = z.object({
  productId: z.string().min(1), // producto isSubscription=true con paypalPlanId
  returnUrl: z.string().url(),
  cancelUrl: z.string().url()
});