// payments/MPCheckout/mpCheckout.types.ts
export type CheckoutItem = {
  id: string;              // productId
  title: string;
  quantity: number;
  unit_price: number;      // en la misma unidad que uses (recomendado: pesos, no centavos)
  currency_id?: string;    // "ARS" | "USD"
  description?: string;
};

export type CreatePreferenceBody = {
  items: CheckoutItem[];
  currency?: "ARS" | "USD";
};

export type ProcessPaymentBody = any; // el body que pide MP Bricks