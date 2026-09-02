import { apiFetch } from "@/lib/api";

/**
 * Order-related helper types and service functions.
 */

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED"
  | "FAILED"
  | "SHIPPED"
  | "DELIVERED";

export type OrderItem = {
  title?: string;
  productId?: string | null;
  classId?: string | null;
  quantity: number;
  unitPrice?: number;

  product?: {
    slug: string | null;
    name?: string;
    id: string;
    title?: string;
    coverImageUrl?: string | null;
    usdPrice: number;
    arPrice?: number | null;
    isSubscription: boolean;
    requiresPremium: boolean;
    resourceType: "LINK" | "FILE";
  } | null;

  videoClass?: {
    id: string;
    slug: string;
    title: string;
    coverImageUrl?: string | null;
  } | null;
};

export type Order = {
  id: string;

  user?: {
    id: string;
    email: string;
  };

  userId?: string;

  totalAmount?: number;

  currency?: "USD" | "ARS";

  status: OrderStatus;

  createdAt: string;

  items: OrderItem[];
};

export const ordersService = {
  async create(payload: {
    country: string;
    provider: "MERCADOPAGO" | "PAYPAL";
    items: (
      | { productId: string; quantity: number }
      | { classId: string; quantity: number }
    )[];
  }): Promise<{ ok?: boolean; order: Order }> {
    return apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async myOrders(): Promise<{ ok?: boolean; orders: Order[] }> {
    return apiFetch("/orders/me");
  },

  async adminOrders(status?: OrderStatus): Promise<{ ok?: boolean; orders: Order[] }> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";

    return apiFetch(`/orders/admin/orders${qs}`);
  },

  async adminMarkPaid(
    orderId: string,
    body?: {
      externalId?: string;
      raw?: any;
    }
  ): Promise<{
    ok: boolean;
    message?: string;
    order?: Order;
  }> {
    return apiFetch(`/orders/admin/orders/${orderId}/mark-paid`, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });
  },

  async adminCancel(orderId: string): Promise<{
    ok: boolean;
    message?: string;
    order?: Order;
  }> {
    return apiFetch(`/orders/admin/orders/${orderId}/cancel`, {
      method: "PATCH",
    });
  },

  async adminGrantAccess(body: {
    userId?: string;
    email?: string;
    productId?: string;
    classId?: string;
    orderId?: string;
  }): Promise<{
    ok: boolean;
    message?: string;
    accessGrant?: any;
  }> {
    return apiFetch("/orders/admin/access-grants", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
