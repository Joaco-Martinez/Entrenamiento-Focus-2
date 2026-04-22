import { apiFetch } from "@/lib/api";

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
};

type ManualSubscriptionPayload = {
  userId: string;
  productId?: string | null;
  provider: "MERCADOPAGO" | "PAYPAL";
  status?: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
  externalId?: string | null;
  providerStatus?: string | null;
  payerEmail?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  grantAccess?: boolean;
  notes?: string | null;
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
      country: country.trim().toUpperCase(),
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

  async adminListUsers(query?: string) {
    const qs = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
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

  async adminCreateManualSubscription(payload: ManualSubscriptionPayload) {
    return apiFetch("/manual_subscriptions/admin/manual", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};