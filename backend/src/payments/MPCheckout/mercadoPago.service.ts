import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN_CHECKOUT_BRICKS;

if (!accessToken) {
  throw new Error("Falta MP_ACCESS_TOKEN_CHECKOUT_BRICKS en variables de entorno");
}

const client = new MercadoPagoConfig({
  accessToken,
});

const paymentClient = new Payment(client);
const preferenceClient = new Preference(client);

export type MpItemInput = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: "ARS";
  description?: string;
  picture_url?: string;
};

export type MpPayerInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type ProcessPaymentInput = {
  transaction_amount: number;
  token: string;
  description?: string;
  installments?: number;
  payment_method_id: string;
  issuer_id?: number;
  payer: {
    email: string;
  };
};

export type CreatePreferenceInput = {
  items: MpItemInput[];
  payer?: MpPayerInput;
  externalReference?: string;
};

export async function processPayment(data: ProcessPaymentInput) {
  const response = await paymentClient.create({
    body: {
      transaction_amount: Number(data.transaction_amount),
      token: data.token,
      description: data.description || "Compra en Focus",
      installments: Number(data.installments || 1),
      payment_method_id: data.payment_method_id,
      issuer_id: data.issuer_id,
      payer: {
        email: data.payer.email,
      },
    },
  });

  return response;
}

export async function createPreference(data: CreatePreferenceInput) {
  const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";

  const response = await preferenceClient.create({
    body: {
      items: data.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
        description: item.description,
        picture_url: item.picture_url,
      })),
      payer: data.payer?.email
        ? {
            name: data.payer.firstName || undefined,
            surname: data.payer.lastName || undefined,
            email: data.payer.email,
          }
        : undefined,
      external_reference: data.externalReference,
      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },
      auto_return: "approved",
    },
  });

  return response;
}