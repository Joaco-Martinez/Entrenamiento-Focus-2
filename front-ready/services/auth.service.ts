// src/services/auth.service.ts
import { apiClient } from "./apiClient";

export type LoginResponse = {
  access_token: string;
  user: {
    email: string;
    role: "user" | "admin";
    isPremium: boolean;
    subscriptionId: string | null;
  };
};

export const authService = {
  login: async (email: string, password: string) => {
    const data = await apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    // guardamos token
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  forgotPassword: async (email: string) => {
    return apiClient<{ success: true }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiClient<{ success: true }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },
};
