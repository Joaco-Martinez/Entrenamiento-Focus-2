import axios from "axios";
import { prisma } from "../../prisma/client";
import { env } from "../config/env";
import { ApiError } from "../common/errors/ApiError";

async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(400, "PayPal env missing");
  }
  const basic = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return r.data.access_token as string;
}

export async function createMercadoPagoPreference(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order) throw new ApiError(404, "Order not found");
  if (!env.MP_ACCESS_TOKEN) throw new ApiError(400, "MP env missing");

  const items = order.items.map(i => ({
    title: i.product.title,
    quantity: i.quantity,
    unit_price: i.unitPrice / 100 // MP espera float en moneda
  }));

  const r = await axios.post(
    "https://api.mercadopago.com/checkout/preferences",
    { items },
    { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } }
  );

  await prisma.order.update({ where: { id: orderId }, data: { providerRef: String(r.data.id) } });
  return { init_point: r.data.init_point, preferenceId: String(r.data.id) };
}

export async function paypalCreateCheckout(orderId: string, returnUrl: string, cancelUrl: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order) throw new ApiError(404, "Order not found");

  const token = await paypalAccessToken();

  const purchase_units = [{
    amount: {
      currency_code: order.currency,
      value: (order.totalAmount / 100).toFixed(2)
    }
  }];

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units,
      application_context: { return_url: returnUrl, cancel_url: cancelUrl }
    },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  const approve = r.data.links?.find((l: any) => l.rel === "approve")?.href;
  await prisma.order.update({ where: { id: orderId }, data: { providerRef: String(r.data.id) } });

  return { id: r.data.id, approveUrl: approve };
}

export async function paypalCreateSubscription(productId: string, returnUrl: string, cancelUrl: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, "Product not found");
  if (!product.isSubscription) throw new ApiError(400, "Product is not subscription");
  if (!product.paypalPlanId) throw new ApiError(400, "Missing paypalPlanId in product");

  const token = await paypalAccessToken();

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/billing/subscriptions`,
    {
      plan_id: product.paypalPlanId,
      application_context: { return_url: returnUrl, cancel_url: cancelUrl }
    },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  const approve = r.data.links?.find((l: any) => l.rel === "approve")?.href;

  return { id: r.data.id, approveUrl: approve };
}