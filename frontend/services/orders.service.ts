import { apiFetch } from "@/lib/api";

/**
 * Order-related helper types and service functions.
 */

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

export type OrderItem = {
  title: string;
  productId: string;
  quantity: number;
  // When requesting orders we include product details
  product?: {
    slug: null;
    name: string;
    id: string;
    title: string;
    coverImageUrl?: string | null;
    usdPrice: number;
    arPrice?: number | null;
    isSubscription: boolean;
    requiresPremium: boolean;
    resourceType: "LINK" | "FILE";
  };
};

export type Order = {
  id: string;
  /**
   * Optional user associated with the order. In admin endpoints the order
   * object includes the user with at least `id` and `email` fields. For
   * regular endpoints this may be undefined.
   */
  user?: { id: string; email: string };
  /**
   * Optional userId for orders fetched via `/orders/me`. For admin endpoints
   * this will be included inside `user` instead.
   */
  userId?: string;
  /**
   * Total amount charged for the order (sum of unit prices * quantities).
   */
  totalAmount?: number;
  /**
   * Currency of the order. USD for PayPal orders, ARS for Mercado Pago orders.
   */
  currency?: "USD" | "ARS";
  status: OrderStatus;
  createdAt: string;
  /**
   * List of order items, each including the purchased product and quantity.
   */
  items: OrderItem[];
};

export const ordersService = {
  /**
   * Create a new order. The payload should include the user's country,
   * the payment provider (MERCADOPAGO or PAYPAL) and the cart items.
   */
  async create(payload: {
    country: string;
    provider: "MERCADOPAGO" | "PAYPAL";
    items: { productId: string; quantity: number }[];
  }): Promise<{ order: Order }> {
    return apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch the current user's orders. Returns an object with `orders` property.
   */
  async myOrders(): Promise<{ orders: Order[] }> {
    return apiFetch("/orders/me");
  },

  async adminMarkPaid(
  orderId: string,
  body?: {
    externalId?: string;
    raw?: any;
  }
) {
  const res = await api.patch(
    `/orders/admin/orders/${orderId}/mark-paid`,
    body ?? {}
  );

  return res.data;
},

async adminGrantAccess(body: {
  userId?: string;
  email?: string;
  productId: string;
  orderId?: string;
}) {
  const res = await api.post("/orders/admin/access-grants", body);

  return res.data;
},
  
  /**
   * Admin: list orders. An optional status filter can be provided.
   */
  async adminOrders(status?: OrderStatus): Promise<{ orders: Order[] }> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiFetch(`/orders/admin/orders${qs}`);
  },
};
