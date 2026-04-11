import axios from "axios";
import { prisma } from "../prisma/client";
import { env } from "../config/env";
import { ApiError } from "../common/errors/ApiError";
import * as ordersService from "./orders.service";
import { handlePaypalSubscriptionWebhook } from "../payments/PaypalSuscriptions/paypalSubscriptions.service";

export async function mercadoPagoWebhook(body: any) {
  console.log("========== MP WEBHOOK IN ==========");
  console.log("BODY:", JSON.stringify(body, null, 2));

  // MP manda diferentes formatos. Normalizamos:
  // - payment: body.data.id
  // - merchant_order: body.resource...
  const resource = body?.type ?? body?.topic ?? body?.action ?? "";
  const idFromBody =
    body?.data?.id ?? body?.id ?? body?.resource?.split("/")?.pop();

  console.log("RESOURCE RAW:", resource);
  console.log("ID FROM BODY:", idFromBody);

  if (!idFromBody) {
    console.log("No idFromBody, salimos ok:true");
    return { ok: true };
  }

  if (!env.MP_ACCESS_TOKEN) {
    throw new ApiError(400, "MP env missing");
  }

  // =========================
  // 1) SUBSCRIPTIONS / PREAPPROVAL
  // =========================
  if (String(resource).toLowerCase().includes("preapproval")) {
    const preapprovalId = String(idFromBody);

    console.log("Procesando preapproval:", preapprovalId);

    const r = await axios.get(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      {
        headers: {
          Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const pre = r.data;

    console.log("PREAPPROVAL FULL:", JSON.stringify(pre, null, 2));

    const payerEmail = pre?.payer_email ? String(pre.payer_email).toLowerCase().trim() : null;
    const statusMp = String(pre?.status ?? "").toLowerCase();
    const externalReference = pre?.external_reference
      ? String(pre.external_reference)
      : null;
    const planId = pre?.preapproval_plan_id
      ? String(pre.preapproval_plan_id)
      : null;

    console.log("PREAPPROVAL ID:", preapprovalId);
    console.log("PAYER EMAIL:", payerEmail);
    console.log("STATUS MP:", statusMp);
    console.log("EXTERNAL REFERENCE:", externalReference);
    console.log("PLAN ID:", planId);

    let userId: string | null = null;
    let productId: string | null = null;

    // 1. Intentamos por external_reference si existe
    if (externalReference && externalReference.includes(":")) {
      const [parsedUserId, parsedProductId] = externalReference.split(":");
      userId = parsedUserId || null;
      productId = parsedProductId || null;

      console.log("MATCH por external_reference:", {
        userId,
        productId,
      });
    }

    // 2. Fallback por email del payer
    if (!userId && payerEmail) {
      const user = await prisma.user.findUnique({
        where: { email: payerEmail },
      });

      console.log("USER FOUND BY EMAIL:", user?.id ?? null);

      if (user) {
        userId = user.id;
      }
    }

    // 3. Fallback por latest intent usando planId + user email
    let latestIntent: any = null;

    if (!userId && payerEmail && planId) {
      latestIntent = await prisma.subscriptionLinkIntent.findFirst({
        where: {
          planId,
          user: {
            email: payerEmail,
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(
        "INTENT FOUND BY planId + payerEmail:",
        latestIntent?.id ?? null
      );

      if (latestIntent?.userId) {
        userId = latestIntent.userId;
        productId = latestIntent.productId ?? null;
      }
    }

    // 4. Fallback por planId solo
    if (!userId && planId) {
      latestIntent = await prisma.subscriptionLinkIntent.findFirst({
        where: {
          planId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log("INTENT FOUND BY planId ONLY:", latestIntent?.id ?? null);

      if (latestIntent?.userId) {
        userId = latestIntent.userId;
        productId = latestIntent.productId ?? null;
      }
    }

    if (!userId) {
      console.log(
        "No pudimos resolver userId para esta suscripción. Salimos ok:true"
      );
      return { ok: true };
    }

    console.log("FINAL USER ID:", userId);
    console.log("FINAL PRODUCT ID:", productId);

    const mapped =
      statusMp === "authorized" || statusMp === "active"
        ? "ACTIVE"
        : statusMp === "cancelled"
        ? "CANCELLED"
        : statusMp === "paused"
        ? "SUSPENDED"
        : statusMp === "expired"
        ? "EXPIRED"
        : "PAST_DUE";

    console.log("MAPPED STATUS:", mapped);

    const currentPeriodStart = pre?.auto_recurring?.start_date
      ? new Date(pre.auto_recurring.start_date)
      : null;

    const currentPeriodEnd = pre?.auto_recurring?.end_date
      ? new Date(pre.auto_recurring.end_date)
      : null;

    const subscription = await prisma.subscription.upsert({
      where: { userId: String(userId) },
      create: {
        userId: String(userId),
        provider: "MERCADOPAGO",
        status: mapped as any,
        externalId: preapprovalId,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
      update: {
        provider: "MERCADOPAGO",
        status: mapped as any,
        externalId: preapprovalId,
        currentPeriodStart: currentPeriodStart ?? undefined,
        currentPeriodEnd: currentPeriodEnd ?? undefined,
      },
    });

    console.log("SUBSCRIPTION UPSERT OK:", {
      id: subscription.id,
      userId: subscription.userId,
      status: subscription.status,
      externalId: subscription.externalId,
    });

    // Intentamos actualizar intent relacionado
    if (!latestIntent && planId) {
      latestIntent = await prisma.subscriptionLinkIntent.findFirst({
        where: {
          userId: String(userId),
          planId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    if (latestIntent) {
      const nextIntentStatus =
        mapped === "ACTIVE"
          ? "ACTIVATED"
          : mapped === "CANCELLED" || mapped === "EXPIRED"
          ? "FAILED"
          : "MATCHED";

      await prisma.subscriptionLinkIntent.update({
        where: { id: latestIntent.id },
        data: {
          status: nextIntentStatus as any,
          mpPreapprovalId: preapprovalId,
        },
      });

      console.log("INTENT UPDATED:", {
        id: latestIntent.id,
        status: nextIntentStatus,
        mpPreapprovalId: preapprovalId,
      });
    } else {
      console.log("No intent found to update");
    }

    console.log("========== MP WEBHOOK SUB OK ==========");
    return { ok: true };
  }

  // =========================
  // 2) ONE-TIME PAYMENTS
  // =========================
  const paymentId = String(idFromBody);
  console.log("Procesando payment:", paymentId);

  const r = await axios.get(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      },
    }
  );

  const mpPayment = r.data;
  const status = String(mpPayment?.status ?? "").toLowerCase();
  const orderIdFromMeta = mpPayment?.metadata?.orderId
    ? String(mpPayment.metadata.orderId)
    : null;

  console.log("MP PAYMENT FULL:", JSON.stringify(mpPayment, null, 2));
  console.log("PAYMENT STATUS:", status);
  console.log("ORDER ID FROM META:", orderIdFromMeta);

  const target = orderIdFromMeta
    ? await prisma.order.findUnique({ where: { id: orderIdFromMeta } })
    : await prisma.order.findFirst({
        where: {
          provider: "MERCADOPAGO",
          providerRef: String(mpPayment?.order?.id ?? ""),
        },
      });

  console.log("TARGET ORDER:", target?.id ?? null);

  if (!target) {
    console.log("No target order found. Salimos ok:true");
    return { ok: true };
  }

  await prisma.payment.upsert({
    where: { externalId: paymentId },
    create: {
      orderId: target.id,
      provider: "MERCADOPAGO",
      status: "INITIATED",
      externalId: paymentId,
      raw: mpPayment,
    },
    update: {
      raw: mpPayment,
    },
  });

  console.log("PAYMENT UPSERT OK:", paymentId);

  if (status === "approved") {
    console.log("Payment approved, markPaid...");
    await ordersService.markPaid(target.id, paymentId, mpPayment);
    console.log("markPaid OK");
  } else {
    console.log("Payment no aprobado todavía:", status);
  }

  console.log("========== MP WEBHOOK PAYMENT OK ==========");
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
    webhook_event: body,
  };

  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    verificationBody,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return r.data?.verification_status === "SUCCESS";
}

// Reutilizamos el token helper del payments.service
async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(400, "PayPal env missing");
  }

  const basic = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

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

export async function paypalWebhook(body: any, headers: any) {
  const ok = await paypalVerifyWebhook(headers, body);
  if (!ok) throw new ApiError(400, "Invalid PayPal webhook signature");

  const eventType = body?.event_type;
  const resource = body?.resource;

  console.log("========== PAYPAL WEBHOOK IN ==========");
  console.log("EVENT TYPE:", eventType);
  console.log("BODY:", JSON.stringify(body, null, 2));

  // 1) Checkout order captured => PAID
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id;
    if (!paypalOrderId) return { ok: true };

    const order = await prisma.order.findFirst({
      where: { provider: "PAYPAL", providerRef: String(paypalOrderId) },
    });

    console.log("PAYPAL ORDER FOUND:", order?.id ?? null);

    if (!order) return { ok: true };

    await prisma.payment.upsert({
      where: { externalId: String(resource?.id ?? paypalOrderId) },
      create: {
        orderId: order.id,
        provider: "PAYPAL",
        status: "APPROVED",
        externalId: String(resource?.id ?? paypalOrderId),
        raw: body,
      },
      update: {
        status: "APPROVED",
        raw: body,
      },
    });

    await ordersService.markPaid(order.id, String(resource?.id ?? paypalOrderId), body);
    console.log("========== PAYPAL PAYMENT OK ==========");
    return { ok: true };
  }

  // 2) Subscriptions events
  if (String(eventType).startsWith("BILLING.SUBSCRIPTION") || eventType === "PAYMENT.SALE.COMPLETED") {
    const result = await handlePaypalSubscriptionWebhook(body, headers);
    console.log("========== PAYPAL SUB OK ==========");
    return result;
  }

  return { ok: true };
}