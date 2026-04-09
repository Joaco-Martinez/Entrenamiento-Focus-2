import axios from "axios";
import { prisma } from "../prisma/client";
import { env } from "../config/env";
import { ApiError } from "../common/errors/ApiError";
import * as ordersService from "./orders.service";

export async function mercadoPagoWebhook(body: any) {
  // MP manda diferentes formatos. Normalizamos:
  // - payment: body.data.id
  // - merchant_order: body.resource...
  const resource = body?.type ?? body?.topic ?? body?.action ?? "";
  const idFromBody = body?.data?.id ?? body?.id ?? body?.resource?.split("/")?.pop();
  if (!idFromBody) return { ok: true };

  if (!env.MP_ACCESS_TOKEN) throw new ApiError(400, "MP env missing");

  // 1) Subscriptions (preapproval)
  if (String(resource).toLowerCase().includes("preapproval")) {
    const preapprovalId = String(idFromBody);
    const r = await axios.get(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
    });

    const pre = r.data;
const payerEmail = pre.payer_email;

if (!payerEmail) return { ok: true };

const user = await prisma.user.findUnique({
  where: { email: payerEmail }
});

if (!user) return { ok: true };

const userId = user.id;

    const statusMp = String(pre.status ?? "").toLowerCase();
    const mapped =
      statusMp === "authorized" ? "ACTIVE" :
      statusMp === "cancelled" ? "CANCELLED" :
      statusMp === "paused" ? "SUSPENDED" :
      statusMp === "pending" ? "PAST_DUE" :
      statusMp === "expired" ? "EXPIRED" : "PAST_DUE";

    await prisma.subscription.upsert({
      where: { userId: String(userId) },
      create: {
        userId: String(userId),
        provider: "MERCADOPAGO",
        status: mapped as any,
        externalId: preapprovalId,
        currentPeriodStart: pre.auto_recurring?.start_date ? new Date(pre.auto_recurring.start_date) : null,
        currentPeriodEnd: pre.auto_recurring?.end_date ? new Date(pre.auto_recurring.end_date) : null,
        cancelAtPeriodEnd: false
      },
      update: {
        provider: "MERCADOPAGO",
        status: mapped as any,
        externalId: preapprovalId,
        currentPeriodStart: pre.auto_recurring?.start_date ? new Date(pre.auto_recurring.start_date) : undefined,
        currentPeriodEnd: pre.auto_recurring?.end_date ? new Date(pre.auto_recurring.end_date) : undefined
      }
    });

    // Si tu suscripción da acceso premium global, ya está (Product.requiresPremium se valida con sub ACTIVE)
    return { ok: true };
  }

  // 2) One-time payments
  const paymentId = String(idFromBody);
  const r = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
  });

  const mpPayment = r.data;
  const status = String(mpPayment.status ?? "");
  const orderIdFromMeta = mpPayment?.metadata?.orderId ? String(mpPayment.metadata.orderId) : null;

  const target = orderIdFromMeta
    ? await prisma.order.findUnique({ where: { id: orderIdFromMeta } })
    : await prisma.order.findFirst({ where: { provider: "MERCADOPAGO", providerRef: String(mpPayment?.order?.id ?? "") } });

  if (!target) return { ok: true };

  await prisma.payment.upsert({
    where: { externalId: paymentId },
    create: { orderId: target.id, provider: "MERCADOPAGO", status: "INITIATED", externalId: paymentId, raw: mpPayment },
    update: { raw: mpPayment }
  });

  if (status === "approved") {
    await ordersService.markPaid(target.id, paymentId, mpPayment);
  }

  return { ok: true };
}

async function paypalVerifyWebhook(headers: any, body: any) {
  if (!env.PAYPAL_WEBHOOK_ID) return true; // si no está, no bloqueamos en dev
  const token = await paypalAccessToken();

  const verificationBody = {
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: env.PAYPAL_WEBHOOK_ID,
    webhook_event: body
  };

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    verificationBody,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  return r.data?.verification_status === "SUCCESS";
}

// Reutilizamos el token helper del payments.service
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

export async function paypalWebhook(body: any, headers: any) {
  const ok = await paypalVerifyWebhook(headers, body);
  if (!ok) throw new ApiError(400, "Invalid PayPal webhook signature");

  const eventType = body?.event_type;
  const resource = body?.resource;

  // Guardamos log mínimo:
  // (si querés, podés crear tabla EventLog. Por ahora lo metemos en Payment.raw cuando aplica)

  // 1) Checkout order captured => PAID
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id;
    if (!paypalOrderId) return { ok: true };

    const order = await prisma.order.findFirst({ where: { provider: "PAYPAL", providerRef: String(paypalOrderId) } });
    if (!order) return { ok: true };

    await prisma.payment.upsert({
      where: { externalId: String(resource?.id ?? paypalOrderId) },
      create: { orderId: order.id, provider: "PAYPAL", status: "APPROVED", externalId: String(resource?.id ?? paypalOrderId), raw: body },
      update: { status: "APPROVED", raw: body }
    });

    await ordersService.markPaid(order.id, String(resource?.id ?? paypalOrderId), body);
    return { ok: true };
  }

  // 2) Subscriptions events
  const subId = resource?.id ? String(resource.id) : null;
  // lo seteamos como "userId:productId" al crear
  const custom = resource?.custom_id ? String(resource.custom_id) : "";
  const userId = custom.includes(":") ? custom.split(":")[0] : custom || null;

  if (subId && String(eventType).startsWith("BILLING.SUBSCRIPTION")) {
    if (!userId) return { ok: true };

    const statusRaw = String(resource?.status ?? "").toUpperCase();
    const mapped =
      statusRaw === "ACTIVE" ? "ACTIVE" :
      statusRaw === "CANCELLED" ? "CANCELLED" :
      statusRaw === "SUSPENDED" ? "SUSPENDED" :
      statusRaw === "EXPIRED" ? "EXPIRED" : "PAST_DUE";

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        provider: "PAYPAL",
        status: mapped as any,
        externalId: subId,
        currentPeriodStart: resource?.billing_info?.last_payment?.time ? new Date(resource.billing_info.last_payment.time) : null,
        currentPeriodEnd: resource?.billing_info?.next_billing_time ? new Date(resource.billing_info.next_billing_time) : null,
        cancelAtPeriodEnd: false
      },
      update: {
        provider: "PAYPAL",
        status: mapped as any,
        externalId: subId,
        currentPeriodEnd: resource?.billing_info?.next_billing_time ? new Date(resource.billing_info.next_billing_time) : undefined
      }
    });

    return { ok: true };
  }

  return { ok: true };
}