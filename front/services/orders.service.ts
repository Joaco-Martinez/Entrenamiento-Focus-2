// src/services/orders.service.ts
import { apiClient } from "./apiClient";

export const ordersService = {
  getStatus: async (orderId: string) => {
    return apiClient<{
      orderId: string;
      status: string; // approved, pending, etc
      totalAmount: number;
    }>(`/orders/${orderId}/status`, { method: "GET" });
  },
};
