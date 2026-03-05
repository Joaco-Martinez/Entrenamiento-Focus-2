// src/services/payments.service.ts
import { apiClient } from "./apiClient";

export type CreatePreferenceItem = { id: string; quantity: number };

export type PaypalItem = { id: string; quantity: number };

export const paymentsService = {
  createPreference: async (items: CreatePreferenceItem[]) => {
    return apiClient<{ init_point: string; orderId: string }>("/payments/create-preference", {
      method: "POST",
      body: params,
    });
  },

  createSubscription: async (productId: number) => {
    return apiClient<{ init_point: string }>("/payments/create-subscription", {
      method: "POST",
      body: { productId },
    });
  },

  subscriptionStatus: async () => {
    return apiClient<{
      id: string;
      email: string;
      isPremium: boolean;
      subscriptionId: string | null;
      subscriptionStartDate: string | null;
      subscriptionEndDate: string | null;
      hasActiveSubscription: boolean;
    }>("/payments/subscription-status", { method: "GET" });
  },

  cancelSubscription: async () => {
    return apiClient<{
      message: string;
      email: string;
      cancelledAt: string;
    }>("/payments/cancel-subscription", {
      method: "POST",
      body: {},
    });
  },

  // ===== PayPal (para NO-Argentina) =====
  paypalCreateOrder: async (params: { items: PaypalItem[]; returnUrl?: string; cancelUrl?: string }) => {
    return apiClient<{ paypalOrderId: string; approveUrl?: string; orderId: string }>(
      "/payments/paypal/create-order",
      {
        method: "POST",
        body: params,
      }
    );
  },

  paypalCaptureOrder: async (orderId: string) => {
    return apiClient<{ status: string; paypalOrderId: string }>(
      "/payments/paypal/capture-order",
      {
        method: "POST",
        body: { orderId },
      }
    );
  },

  paypalCreateSubscription: async (params: {
    productId: number;
    returnUrl?: string;
    cancelUrl?: string;
  }) => {
    return apiClient<{ subscriptionId: string; approveUrl?: string; status: string }>(
      "/payments/paypal/create-subscription",
      {
        method: "POST",
        body: params,
      }
    );
  },

  paypalCancelSubscription: async (reason?: string) => {
    return apiClient<{ message: string; cancelledAt: string }>(
      "/payments/paypal/cancel-subscription",
      {
        method: "POST",
        body: { reason },
      }
    );
  },

  paypalSubscriptionStatus: async () => {
    return apiClient<{
      id: string;
      email: string;
      isPremium: boolean;
      subscriptionId: string | null;
      subscriptionStartDate: string | null;
      subscriptionEndDate: string | null;
      hasActiveSubscription: boolean;
    }>("/payments/paypal/subscription-status", { method: "GET" });
  },
};
