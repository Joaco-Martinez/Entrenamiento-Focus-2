import axios from "axios";
import { prisma } from "../../prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../common/errors/ApiError";
import * as ordersService from "../../services/orders.service";

async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(400, "Missing PayPal credentials");
  }

  const basic = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token as string;
}

async function verifyPaypalWebhook(headers: any, body: any) {
  if (!env.PAYPAL_WEBHOOK_ID) return true;

  const token = await paypalAccessToken();

  const verificationBody = {
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: env.PAYPAL_WEBHOOK_ID,
    webhook_event: body,
  };

  const response = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    verificationBody,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data?.verification_status === "SUCCESS";
}

export async function handlePaypalWebhook(body: any, headers: any) {
  const valid = await verifyPaypalWebhook(headers, body);

  if (!valid) {
    throw new ApiError(400, "Invalid PayPal webhook signature");
  }

  const eventType = String(body?.event_type ?? "");
  const resource = body?.resource ?? {};

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const paypalOrderId =
      resource?.supplementary_data?.related_ids?.order_id ?? null;
    const captureId = String(resource?.id ?? paypalOrderId ?? "");

    if (!paypalOrderId) return { ok: true };

    const order = await prisma.order.findFirst({
      where: {
        provider: "PAYPAL",
        providerRef: String(paypalOrderId),
      },
    });

    if (!order) return { ok: true };

    await ordersService.markPaid(order.id, captureId, body);

    return { ok: true };
  }

  if (
    eventType === "PAYMENT.CAPTURE.DENIED" ||
    eventType === "PAYMENT.CAPTURE.DECLINED"
  ) {
    const paypalOrderId =
      resource?.supplementary_data?.related_ids?.order_id ?? null;

    if (!paypalOrderId) return { ok: true };

    const order = await prisma.order.findFirst({
      where: {
        provider: "PAYPAL",
        providerRef: String(paypalOrderId),
      },
    });

    if (!order) return { ok: true };

    await prisma.payment.upsert({
      where: {
        externalId: String(resource?.id ?? paypalOrderId),
      },
      create: {
        orderId: order.id,
        provider: "PAYPAL",
        status: "REJECTED",
        externalId: String(resource?.id ?? paypalOrderId),
        raw: body,
      },
      update: {
        status: "REJECTED",
        raw: body,
      },
    });

    return { ok: true };
  }

  if (eventType.startsWith("BILLING.SUBSCRIPTION")) {
    const subscriptionId = resource?.id ? String(resource.id) : null;
    const customId = resource?.custom_id ? String(resource.custom_id) : "";
    const userId = customId.includes(":") ? customId.split(":")[0] : null;

    if (!subscriptionId || !userId) return { ok: true };

    const statusRaw = String(resource?.status ?? "").toUpperCase();

    const mapped =
      statusRaw === "ACTIVE"
        ? "ACTIVE"
        : statusRaw === "CANCELLED"
        ? "CANCELLED"
        : statusRaw === "SUSPENDED"
        ? "SUSPENDED"
        : statusRaw === "EXPIRED"
        ? "EXPIRED"
        : "PAST_DUE";

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        provider: "PAYPAL",
        status: mapped as any,
        externalId: subscriptionId,
        currentPeriodStart: resource?.billing_info?.last_payment?.time
          ? new Date(resource.billing_info.last_payment.time)
          : null,
        currentPeriodEnd: resource?.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : null,
        cancelAtPeriodEnd: false,
      },
      update: {
        provider: "PAYPAL",
        status: mapped as any,
        externalId: subscriptionId,
        currentPeriodStart: resource?.billing_info?.last_payment?.time
          ? new Date(resource.billing_info.last_payment.time)
          : undefined,
        currentPeriodEnd: resource?.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : undefined,
      },
    });

    return { ok: true };
  }

  return { ok: true };
}