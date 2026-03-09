export type CheckoutItem = {
  id: string;              // productId
  title: string;
  quantity: number;
  unit_price: number;      // usar pesos o dólares según currency_id
  currency_id?: "ARS" | "USD";
  description?: string;
};

export type CreatePreferenceBody = {
  items: CheckoutItem[];
  currency?: "ARS" | "USD";
};

export type ProcessPaymentBody = any;