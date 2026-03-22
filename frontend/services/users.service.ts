import { apiFetch } from "@/lib/api";

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string; // ahora obligatorio
};

export const usersService = {
  /**
   * Register a new user
   */
  async register({
    email,
    password,
    firstName,
    lastName,
    phone,
    country,
  }: RegisterPayload) {
    const payload = {
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      country: country.toUpperCase(), // 🔥 normalizado
    };

    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    return apiFetch("/users/me");
  },

  async getMyOrders() {
    return apiFetch("/users/me/orders");
  },

  async getMyPurchases() {
    return apiFetch("/users/me/purchases");
  },

  async getMySubscription() {
    return apiFetch("/users/me/subscription");
  },

  async adminListUsers(q?: string) {
    const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return apiFetch(`/users/admin/users${qs}`);
  },

  async adminGetUser(id: string) {
    return apiFetch(`/users/admin/users/${id}`);
  },

  async adminCancelSubscription(userId: string) {
    return apiFetch(`/subscriptions/admin/${userId}/cancel`, {
      method: "POST",
    });
  },
};