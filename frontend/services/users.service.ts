import { apiFetch } from "@/lib/api"

export const usersService = {
  /**
   * Register a new user. The backend exposes this under /auth/register.
   * The phone field from the frontend is ignored; instead we send a default
   * country code (AR) as required by the backend.
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    // phone is not used by the backend; it expects country instead
    const payload = {
      email,
      password,
      firstName,
      lastName,
      country: "AR",
    };
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get the current user's orders.
   */
  async getMyOrders() {
    return apiFetch("/users/me/orders");
  },

  /**
   * Get the current user's purchases (access grants).
   */
  async getMyPurchases() {
    return apiFetch("/users/me/purchases");
  },

  /**
   * Get the current user's subscription details.
   */
  async getMySubscription() {
    return apiFetch("/users/me/subscription");
  },

  /**
   * Admin: list users. Optionally filter by query string.
   */
  async adminListUsers(q?: string) {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    return apiFetch(`/users/admin/users${qs}`);
  },

  /**
   * Admin: get details about a user, including orders, purchases and subscription.
   */
  async adminGetUser(id: string) {
    return apiFetch(`/users/admin/users/${id}`);
  },

  /**
   * Admin: cancel a user's subscription immediately.
   */
  async adminCancelSubscription(userId: string) {
    return apiFetch(`/subscriptions/admin/${userId}/cancel`, {
      method: "POST",
    });
  },
};
