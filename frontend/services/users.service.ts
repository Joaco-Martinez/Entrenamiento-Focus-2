import { apiFetch } from "@/lib/api";

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
};

export const usersService = {
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
      country: country.toUpperCase(),
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

  async adminUnlinkSubscription(userId: string) {
    return apiFetch(`/users/admin/users/${userId}/subscription`, {
      method: "DELETE",
    });
  },
};