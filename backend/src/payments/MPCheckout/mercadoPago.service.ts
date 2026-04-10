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

function unwrapMpResponse<T = any>(payload: any): T {
  return payload?.response ?? payload;
}

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
      external_reference: data.orderId,
      metadata: {
        orderId: data.orderId,
      },
    },
  });

  return unwrapMpResponse(response);
}

export async function createPreference(data: CreatePreferenceInput) {
  const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
  const notificationUrl =
    process.env.MP_NOTIFICATION_URL ||
    "https://www.api.entrenamientofocus.com.ar/mercadopago_checkout/webhook";

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
      notification_url: notificationUrl,
      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },
      auto_return: "approved",
    },
  });

  return unwrapMpResponse(response);
}

import crypto from "crypto";

export async function confirmPayment(input: {
  paymentId?: string;
  externalReference?: string;
}) {
  const paymentId = String(input.paymentId || "").trim();
  const externalReference = String(input.externalReference || "").trim();

  if (!paymentId && !externalReference) {
    throw new Error("Falta paymentId o externalReference");
  }

  let paymentData: any = null;

  if (paymentId) {
    const payment = await paymentClient.get({
      id: paymentId,
    });

    paymentData = unwrapMpResponse(payment);
  }

  const resolvedOrderId =
    paymentData?.external_reference ||
    paymentData?.metadata?.orderId ||
    externalReference;

  if (!resolvedOrderId) {
    throw new Error("No se pudo resolver el orderId");
  }

  const status = String(paymentData?.status || "").toLowerCase();

  return {
    ok: true,
    orderId: resolvedOrderId,
    paymentId: paymentData?.id ? String(paymentData.id) : paymentId || null,
    status,
    statusDetail: paymentData?.status_detail || null,
    raw: paymentData || null,
  };
}

export async function processWebhook(
  body: any,
  query: any,
  headers: any
) {
  try {
    const secret = process.env.MP_WEBHOOK_KEY_CHECKOUT_BRICKS;

    if (!secret) {
      console.error("MP_WEBHOOK_KEY_CHECKOUT_BRICKS no configurado");
      return;
    }

    const signature = headers["x-signature"];
    const requestId = headers["x-request-id"];

    if (!signature || !requestId) {
      console.log("Webhook sin firma, ignorado");
      return;
    }

    const dataId =
      body?.data?.id ||
      query?.["data.id"] ||
      query?.id;

    if (!dataId) {
      console.log("Webhook sin data.id");
      return;
    }

    const manifest = `id:${dataId};request-id:${requestId};`;

    const hmac = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    const receivedHash = signature.split(",")[0].split("=")[1];

    if (hmac !== receivedHash) {
      console.log("Firma webhook inválida");
      return;
    }

    console.log("Webhook firma válida");

    const topic =
      body?.type ||
      body?.topic ||
      query?.type ||
      query?.topic;

    if (String(topic) !== "payment") {
      console.log("Webhook ignorado: no es payment");
      return;
    }

    const paymentId = dataId;

    const payment = await paymentClient.get({
      id: String(paymentId),
    });

    const paymentData = unwrapMpResponse(payment);

    const orderId =
      paymentData?.external_reference ||
      paymentData?.metadata?.orderId;

    if (!orderId) {
      console.log("Webhook sin orderId");
      return;
    }

    const status = paymentData?.status;

    if (status === "approved") {
      await ordersService.markPaid(
        orderId,
        String(paymentData.id),
        paymentData
      );

      console.log("Orden marcada como PAID:", orderId);
      return;
    }

    console.log(
      `Webhook recibido para order ${orderId}, payment ${paymentData?.id}, status ${status}`
    );

  } catch (error) {
    console.error("Error procesando webhook:", error);
  }
}