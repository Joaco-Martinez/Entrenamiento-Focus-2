import { apiFetch } from "@/lib/api";

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    role: "user" | "admin";
    firstName?: string | null;
    lastName?: string | null;
    country?: string | null;
  };
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return await apiFetch("/auth/logout", {
      method: "POST",
    });
  },
};