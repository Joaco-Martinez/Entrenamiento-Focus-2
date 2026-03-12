import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import * as ordersService from "../../services/orders.service";

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
  orderId: string;
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
  orderId: string;
  items: MpItemInput[];
  payer?: MpPayerInput;
};

export async function processPayment(data: ProcessPaymentInput) {
  const backendUrl = process.env.BACKEND_URL;

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
      external_reference: data.orderId,
      metadata: {
        orderId: data.orderId,
      },
      notification_url: backendUrl
        ? `${backendUrl}/mercadopago_checkout/webhook`
        : undefined,
    },
  });

  return response;
}

export async function createPreference(data: CreatePreferenceInput) {
  const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
  const backendUrl = process.env.BACKEND_URL;

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
      external_reference: data.orderId,
      metadata: {
        orderId: data.orderId,
      },
      notification_url: backendUrl
        ? `${backendUrl}/mercadopago_checkout/webhook`
        : undefined,
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

export async function processWebhook(body: any, query: any) {
  const topic = body?.type || body?.topic || query?.type || query?.topic;

  const paymentId = body?.data?.id || query?.["data.id"] || query?.id;

  if (!topic || !paymentId) {
    console.log("Webhook ignorado: faltan datos", { body, query });
    return;
  }

  if (String(topic) !== "payment") {
    console.log("Webhook ignorado: topic no soportado", topic);
    return;
  }

  const paymentData = await paymentClient.get({
    id: String(paymentId),
  });

  const status = paymentData.status;
  const orderId =
    paymentData.external_reference || paymentData.metadata?.orderId;

  if (!orderId) {
    console.log("Webhook sin orderId", paymentData.id);
    return;
  }

  if (status === "approved") {
    await ordersService.markPaid(orderId, String(paymentData.id), paymentData);
    console.log(`Orden ${orderId} marcada como PAID`);
    return;
  }

  console.log(`Pago ${paymentData.id} con estado ${status}`);
}