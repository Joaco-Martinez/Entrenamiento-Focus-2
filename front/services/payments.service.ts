// src/services/payments.service.ts
import { apiClient } from "./apiClient";

export type CreatePreferenceItem = { id: string; quantity: number };

export const paymentsService = {
  createPreference: async (items: CreatePreferenceItem[]) => {
    return apiClient<{ init_point: string; orderId: string }>("/payments/create-preference", {
      method: "POST",
      body: { items },
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
};
