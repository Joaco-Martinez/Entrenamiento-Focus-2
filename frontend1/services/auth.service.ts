import { apiFetch } from "@/lib/api";

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    role: "USER" | "ADMIN" | "user" | "admin";
    firstName?: string | null;
    lastName?: string | null;
    country?: string | null;
    isPremium?: boolean;
    subscriptionId?: string | null;
  };
};

export type MeResponse = {
  user: {
    id: string;
    email: string;
    role: "USER" | "ADMIN" | "user" | "admin";
    firstName?: string | null;
    lastName?: string | null;
    country?: string | null;
    isPremium?: boolean;
    subscriptionId?: string | null;
  };
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
  },

  async me(): Promise<MeResponse["user"]> {
    const data = await apiFetch("/auth/me", {
      method: "GET",
      credentials: "include",
    });

    return "user" in data ? data.user : data;
  },

  async logout() {
    return await apiFetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },
};