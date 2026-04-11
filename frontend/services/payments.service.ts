import { apiFetch } from "@/lib/api"

export const paymentsService = {
  /**
   * Create a Mercado Pago preference. Accepts a payload containing orderId,
   * items and optional payer information. See backend documentation.
   */
  createPreference(payload: any) {
    return apiFetch("/mercadopago_checkout/create-preference", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  /**
   * Create a Mercado Pago subscription. This endpoint requires a more complex
   * payload (userId, payerEmail, reason, externalReference, etc.). The
   * productId parameter is left for compatibility, but the caller should build
   * the correct payload.
   */

  async verifyPaypalSubscriptionSuccess(subscriptionId: string) {
    return apiFetch(`/paypal_suscription/verify-success/${subscriptionId}`, {
      method: "GET",
    });
  },

  createSubscription(payload: any) {
    return apiFetch("/mercadopago_suscription/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  /**
   * Create a PayPal checkout for an order.
   */
  paypalCreateOrder(payload: any) {
    return apiFetch("/paypal_checkout/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  /**
   * Create a PayPal subscription for a product.
   */
  paypalCreateSubscription(payload: any) {
    return apiFetch("/paypal_checkout/subscription", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  /**
   * Get current subscription status (generic, independent of provider).
   * Returns a normalized object with subscriptionId, start/end dates and active flag.
   */
  async subscriptionStatus() {
    const data: any = await apiFetch("/subscriptions/me");
    const sub = data?.subscription;
    if (!sub) {
      return {
        subscriptionId: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        hasActiveSubscription: false,
      };
    }
    const status = String(sub.status || "").toLowerCase();
    return {
      subscriptionId: sub.id ?? null,
      subscriptionStartDate: sub.startDate ?? null,
      subscriptionEndDate: sub.endDate ?? null,
      hasActiveSubscription: status === "active" || status === "approved",
    };
  },
  /**
   * Alias for subscriptionStatus; PayPal uses the same unified endpoint and format.
   */
  async paypalSubscriptionStatus() {
    return this.subscriptionStatus();
  },
  /**
   * Cancel the current subscription. By default cancels at period end.
   */
  cancelSubscription(cancelAtPeriodEnd: boolean = true) {
    return apiFetch("/subscriptions/cancel", {
      method: "POST",
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });
  },
  /**
   * Alias for cancelSubscription; PayPal uses the same endpoint.
   */
  paypalCancelSubscription(reason?: string) {
    return apiFetch("/subscriptions/cancel", {
      method: "POST",
      body: JSON.stringify({ cancelAtPeriodEnd: true }),
    });
  },
};
