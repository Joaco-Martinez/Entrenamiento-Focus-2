import axios from "axios";
import { prisma } from "../prisma/client";
import { env } from "../config/env";
import { ApiError } from "../common/errors/ApiError";

function requireHttpsUrl(name: string, value: string) {
  if (!value) throw new ApiError(400, `Missing env: ${name}`);
  if (!/^https?:\/\//i.test(value)) throw new ApiError(400, `${name} must be a valid URL`);
  return value;
}

function optionalUrl(name: string, value?: string | null) {
  if (!value) return undefined;
  return requireHttpsUrl(name, value);
}

type MercadoPagoPreapprovalResponse = {
  id?: string;
  init_point?: string;
  message?: string;
};

async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(400, "PayPal env missing");
  }
  if (!env.PAYPAL_BASE_URL) throw new ApiError(400, "PayPal base url missing");

  const basic = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return r.data.access_token as string;
}

/**
 * Mercado Pago: crea Preference para una Order.
 * Tus precios (arPrice/usdPrice) están en moneda entera (ej 15000 ARS, 10 USD).
 * MP espera unit_price en moneda (float). NO centavos.
 */
export async function createMercadoPagoPreference(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.provider !== "MERCADOPAGO") throw new ApiError(400, "Order provider must be MERCADOPAGO");
  if (!env.MP_ACCESS_TOKEN) throw new ApiError(400, "MP env missing");

  const notification_url = env.MP_NOTIFICATION_URL
    ? requireHttpsUrl("MP_NOTIFICATION_URL", env.MP_NOTIFICATION_URL)
    : undefined;

  const back_urls = {
    success: optionalUrl("MP_SUCCESS_URL", env.MP_SUCCESS_URL),
    failure: optionalUrl("MP_FAILURE_URL", env.MP_FAILURE_URL),
    pending: optionalUrl("MP_PENDING_URL", env.MP_PENDING_URL),
  };

  const items = order.items.map((i) => ({
    title: i.product.title,
    quantity: i.quantity,
    unit_price: Number(i.unitPrice),
  }));

  for (const it of items) {
    if (!Number.isFinite(it.unit_price) || it.unit_price <= 0) {
      throw new ApiError(400, "Invalid unit_price in order items");
    }
  }

  const r = await axios.post(
    "https://api.mercadopago.com/checkout/preferences",
    {
      items,
      external_reference: order.id,
      notification_url,
      back_urls,
      auto_return: back_urls.success ? "approved" : undefined,
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
    },
    { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } }
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { providerRef: String(r.data.id) },
  });

  return { init_point: r.data.init_point, preferenceId: String(r.data.id) };
}

/**
 * Mercado Pago subscription (Preapproval) para AR.
 * Usa Product.arPrice (ARS).
 */
export async function mercadoPagoCreateSubscription(userId: string, productId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) throw new ApiError(400, "User email missing");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, "Product not found");

  const payload = {
    reason: product.title,
    payer_email: user.email,
    back_url: "https://www.shineupvgb.com.ar/success",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 15000,
      currency_id: "ARS",
    },
  };

  const res = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as MercadoPagoPreapprovalResponse;

  if (!res.ok) {
    throw new ApiError(res.status, data.message || "MP preapproval failed");
  }

  return {
    init_point: data.init_point,
    preapproval_id: data.id,
  };
}

export async function paypalCreateCheckout(orderId: string, returnUrl: string, cancelUrl: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.provider !== "PAYPAL") throw new ApiError(400, "Order provider must be PAYPAL");

  requireHttpsUrl("PAYPAL_RETURN_URL", returnUrl);
  requireHttpsUrl("PAYPAL_CANCEL_URL", cancelUrl);

  const token = await paypalAccessToken();

  const total = Number(order.totalAmount);
  if (!Number.isFinite(total) || total <= 0) throw new ApiError(400, "Invalid order totalAmount");

  const purchase_units = [
    {
      reference_id: order.id,
      invoice_id: order.id,
      amount: {
        currency_code: order.currency,
        value: total.toFixed(2),
      },
    },
  ];

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units,
      application_context: { return_url: returnUrl, cancel_url: cancelUrl },
    },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  const approve = r.data.links?.find((l: any) => l.rel === "approve")?.href;

  await prisma.order.update({
    where: { id: orderId },
    data: { providerRef: String(r.data.id) },
  });

  return { id: r.data.id, approveUrl: approve };
}

export async function paypalCaptureCheckout(userId: string, paypalOrderId: string) {
  const order = await prisma.order.findFirst({
    where: { provider: "PAYPAL", providerRef: paypalOrderId, userId },
  });

  if (!order) throw new ApiError(404, "Order not found for this user");

  const token = await paypalAccessToken();

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  if (order.status !== "PAID") {
    const captureId = r.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;
    const { markPaid } = await import("./orders.service");
    await markPaid(order.id, String(captureId), r.data);
  }

  return { status: r.data.status, raw: r.data };
}

export async function paypalCreateSubscription(userId: string, productId: string, returnUrl: string, cancelUrl: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, "Product not found");
  if (!product.isSubscription) throw new ApiError(400, "Product is not subscription");
  if (!product.paypalPlanId) throw new ApiError(400, "Missing paypalPlanId in product");

  requireHttpsUrl("PAYPAL_RETURN_URL", returnUrl);
  requireHttpsUrl("PAYPAL_CANCEL_URL", cancelUrl);

  const token = await paypalAccessToken();

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/billing/subscriptions`,
    {
      plan_id: product.paypalPlanId,
      custom_id: `${userId}:${productId}`,
      application_context: { return_url: returnUrl, cancel_url: cancelUrl },
    },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  const approve = r.data.links?.find((l: any) => l.rel === "approve")?.href;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      provider: "PAYPAL",
      status: "PAST_DUE",
      externalId: String(r.data.id),
      cancelAtPeriodEnd: false,
    },
    update: {
      provider: "PAYPAL",
      externalId: String(r.data.id),
    },
  });

  return { id: r.data.id, approveUrl: approve };
}