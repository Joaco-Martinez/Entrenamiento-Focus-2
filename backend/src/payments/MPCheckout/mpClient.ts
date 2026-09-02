import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN_CHECKOUT_BRICKS;

if (!accessToken) {
  throw new Error("Falta MP_ACCESS_TOKEN_CHECKOUT_BRICKS en variables de entorno");
}

const client = new MercadoPagoConfig({
  accessToken,
});

// Cliente compartido: lo usan tanto el módulo de checkout/webhook (mercadoPago.service.ts)
// como la reconciliación desde orders.service.ts. Vive acá, en vez de en
// mercadoPago.service.ts, para que orders.service.ts pueda importarlo sin crear
// una dependencia circular (mercadoPago.service.ts ya importa orders.service.ts).
export const paymentClient = new Payment(client);
export const preferenceClient = new Preference(client);

export function unwrapMpResponse<T = any>(payload: any): T {
  return payload?.response ?? payload;
}
