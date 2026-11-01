import { apiFetch } from "@/lib/api";

export type ClothingCategory = "TSHIRT" | "HOODIE" | "CHOMBA" | "OTHER";
export type ClothingSize = "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | "ONE_SIZE";
export type ClothingStatus =
  | "ORDER_RECEIVED"
  | "ORDERED_TO_SUPPLIER"
  | "FOLLOW_UP_SENT"
  | "DISPATCHED"
  | "FINISHED"
  | "RETURNING"
  | "WAITING_YURI"
  | "PAYMENT_RECEIVED"
  | "CANCELLED";

export type ClothingProduct = {
  id: string;
  name: string;
  category: ClothingCategory;
  trackStock: boolean;
  active: boolean;
  defaultUnitPrice: number;
  defaultUnitDtfCost: number;
  defaultUnitGarmentCost: number;
};

export type ClothingOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  category: ClothingCategory;
  size: ClothingSize | null;
  quantity: number;
  unitPrice: number;
  unitDtfCost: number;
  unitGarmentCost: number;
  trackStock: boolean;
};

export type ClothingOrder = {
  id: string;
  clientName: string;
  source: string;
  status: ClothingStatus;
  receivedAmount: number;
  extraExpenses: number;
  orderDate: string;
  expectedDate: string | null;
  deliveredAt: string | null;
  notes: string | null;
  items: ClothingOrderItem[];
};

export type ClothingStockRow = {
  category: ClothingCategory;
  size: ClothingSize;
  initialQty: number;
  restockedQty: number;
  sold: number;
  available: number;
  notes: string;
};

export type ClothingDashboard = {
  orders: ClothingOrder[];
  products: ClothingProduct[];
  stock: ClothingStockRow[];
  stats: {
    orders: number;
    units: number;
    totalSales: number;
    receivedAmount: number;
    totalCost: number;
    profit: number;
    pending: number;
  };
  productSales: { name: string; quantity: number }[];
  monthlyProfit: { month: string; profit: number }[];
};

export const clothingService = {
  access: () =>
    apiFetch("/clothing/access") as Promise<{ authorized: boolean }>,

  dashboard: () =>
    apiFetch("/clothing") as Promise<ClothingDashboard>,

  createOrder: (payload: Record<string, unknown>) =>
    apiFetch("/clothing/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateOrder: (id: string, payload: Record<string, unknown>) =>
    apiFetch("/clothing/orders/" + encodeURIComponent(id), {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateStock: (payload: Record<string, unknown>) =>
    apiFetch("/clothing/stock", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  createProduct: (payload: Record<string, unknown>) =>
    apiFetch("/clothing/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
