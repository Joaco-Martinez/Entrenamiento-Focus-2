import { z } from "zod";

export const mpPreferenceSchema = z.object({
  orderId: z.string().min(1)
});

export const mpSubscriptionSchema = z.object({
  productId: z.string().min(1),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

export const paypalCheckoutSchema = z.object({
  orderId: z.string().min(1),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export const paypalSubscriptionSchema = z.object({
  productId: z.string().min(1),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

export const paypalCaptureSchema = z.object({
  paypalOrderId: z.string().min(1)
});

export const paypalSubscriptionConfirmSchema = z.object({
  subscriptionId: z.string().min(1)
});
