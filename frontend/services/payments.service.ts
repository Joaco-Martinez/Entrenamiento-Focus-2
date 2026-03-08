import { apiFetch } from "@/lib/api"

export const paymentsService = {
  createPreference(items: Array<{ id: string; quantity: number }>) {
    return apiFetch("/payments/mercadopago/preference", {
      method: "POST",
      body: JSON.stringify({ items }),
    })
  },
  createSubscription(productId: number) {
    return apiFetch("/payments/mercadopago/subscription", {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
  },
  paypalCreateOrder(payload: any) {
    return apiFetch("/payments/paypal/order", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  paypalCreateSubscription(payload: any) {
    return apiFetch("/payments/paypal/subscription", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  subscriptionStatus() {
    return apiFetch("/payments/subscription-status")
  },
  paypalSubscriptionStatus() {
    return apiFetch("/payments/paypal/subscription-status")
  },
  cancelSubscription() {
    return apiFetch("/payments/subscription/cancel", { method: "POST" })
  },
  paypalCancelSubscription(reason?: string) {
    return apiFetch("/payments/paypal/subscription/cancel", {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  },
}
