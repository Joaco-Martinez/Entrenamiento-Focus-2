import axios from "axios";
import { prisma } from "../../prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../common/errors/ApiError";

type RawHeaders = Record<string, string | string[] | undefined>;

type PaypalSubscriptionDetails = {
  id?: string;
  status?: string | null;
  custom_id?: string | null;
  plan_id?: string | null;
  start_time?: string | null;
  subscriber?: {
    email_address?: string | null;
    payer_id?: string | null;
  } | null;
  billing_info?: {
    next_billing_time?: string | null;
    last_payment?: {
      time?: string | null;
    } | null;
    failed_payments_count?: number | null;
  } | null;
  links?: Array<{
    href?: string;
    rel?: string;
    method?: string;
  }> | null;
};

function getPaypalSuscriptionConfig() {
  return {
    clientId: env.PAYPAL_SUSCRIPTION_CLIENT_ID,
    clientSecret: env.PAYPAL_SUSCRIPTION_CLIENT_SECRET,
    webhookId: env.PAYPAL_SUSCRIPTION_WEBHOOK_ID,
    baseUrl: env.PAYPAL_SUSCRIPTION_BASE_URL,
    defaultReturnUrl:
      env.PAYPAL_SUSCRIPTION_RETURN_URL ||
      "https://www.entrenamientofocus.com.ar/paypal/succes",
    defaultCancelUrl:
      env.PAYPAL_SUSCRIPTION_CANCEL_URL ||
      "https://www.entrenamientofocus.com.ar/paypal/cancel",
  };
}

function requireUrl(name: string, value: string) {
  if (!value) throw new ApiError(400, `Missing ${name}`);
  if (!/^https?:\/\//i.test(value)) {
    throw new ApiError(400, `${name} must be a valid URL`);
  }
  return value;
}

function resolveUrl(valueFromBody: string | undefined, fallback: string, name: string) {
  return requireUrl(name, valueFromBody?.trim() || fallback);
}

function getHeader(headers: RawHeaders, key: string) {
  const value = headers[key] ?? headers[key.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function parseCustomId(customIdRaw?: string | null): { userId: string | null; productId: string | null } {
  const customId = String(customIdRaw ?? "").trim();

  if (!customId) {
    return { userId: null, productId: null };
  }

  if (customId.includes(":")) {
    const [userId, productId] = customId.split(":");
    return {
      userId: userId || null,
      productId: productId || null,
    };
  }

  return { userId: null, productId: null };
}

function mapDate(value?: string | null) {
  return value ? new Date(value) : null;
}

export function mapPaypalSubscriptionStatus(statusRaw?: string | null) {
  const normalized = String(statusRaw ?? "").toUpperCase();

  if (normalized === "ACTIVE") return "ACTIVE" as const;
  if (normalized === "CANCELLED") return "CANCELLED" as const;
  if (normalized === "SUSPENDED") return "SUSPENDED" as const;
  if (normalized === "EXPIRED") return "EXPIRED" as const;
  if (normalized === "APPROVAL_PENDING") return "PAST_DUE" as const;
  if (normalized === "APPROVED") return "PAST_DUE" as const;
  if (normalized === "CREATED") return "PAST_DUE" as const;

  return "PAST_DUE" as const;
}

export async function getPaypalAccessToken() {
  const config = getPaypalSuscriptionConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new ApiError(
      400,
      "Missing PayPal suscription credentials. Check PAYPAL_SUSCRIPTION_CLIENT_ID and PAYPAL_SUSCRIPTION_CLIENT_SECRET"
    );
  }

  if (!config.baseUrl) {
    throw new ApiError(400, "Missing PAYPAL_SUSCRIPTION_BASE_URL");
  }

  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const response = await axios.post(
    `${config.baseUrl}/v1/oauth2/token`,
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

async function grantAccessIfNeeded(userId: string, productId: string) {
  const existingGrant = await prisma.accessGrant.findFirst({
    where: {
      userId,
      productId,
    },
  });

  if (existingGrant) return existingGrant;

  return prisma.accessGrant.create({
    data: {
      userId,
      productId,
    },
  });
}

async function revokeAccessIfExists(userId: string, productId: string) {
  const existingGrant = await prisma.accessGrant.findFirst({
    where: {
      userId,
      productId,
    },
  });

  if (!existingGrant) return;

  await prisma.accessGrant.delete({
    where: {
      id: existingGrant.id,
    },
  });
}

async function persistPaypalSubscriptionForUser(params: {
  userId: string;
  productId?: string | null;
  paypalSubscription: PaypalSubscriptionDetails;
}) {
  const { userId, productId, paypalSubscription } = params;

  const mappedStatus = mapPaypalSubscriptionStatus(paypalSubscription?.status);

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      provider: "PAYPAL",
      status: mappedStatus,
      externalId: String(paypalSubscription.id),
      currentPeriodStart: mapDate(paypalSubscription?.billing_info?.last_payment?.time),
      currentPeriodEnd: mapDate(paypalSubscription?.billing_info?.next_billing_time),
      cancelAtPeriodEnd: false,
    },
    update: {
      provider: "PAYPAL",
      status: mappedStatus,
      externalId: String(paypalSubscription.id),
      currentPeriodStart: mapDate(paypalSubscription?.billing_info?.last_payment?.time),
      currentPeriodEnd: mapDate(paypalSubscription?.billing_info?.next_billing_time),
      cancelAtPeriodEnd: false,
    },
  });

  if (productId) {
    if (mappedStatus === "ACTIVE") {
      await grantAccessIfNeeded(userId, productId);
    } else if (mappedStatus === "CANCELLED" || mappedStatus === "EXPIRED") {
      await revokeAccessIfExists(userId, productId);
    }
  }

  return subscription;
}

async function resolveProductIdFromSubscription(
  paypalSubscription: PaypalSubscriptionDetails,
  fallbackExternalId?: string | null
) {
  const parsed = parseCustomId(paypalSubscription?.custom_id);
  if (parsed.productId) return parsed.productId;

  if (fallbackExternalId) {
    const productByExternalId = await prisma.product.findFirst({
      where: {
        paypalPlanId: fallbackExternalId,
      },
      select: { id: true },
    });

    if (productByExternalId?.id) return productByExternalId.id;
  }

  if (paypalSubscription?.plan_id) {
    const productByPlan = await prisma.product.findFirst({
      where: {
        paypalPlanId: String(paypalSubscription.plan_id),
      },
      select: { id: true },
    });

    if (productByPlan?.id) return productByPlan.id;
  }

  return null;
}

async function resolveUserIdFromSubscription(
  paypalSubscription: PaypalSubscriptionDetails,
  subscriptionId?: string | null
) {
  const parsed = parseCustomId(paypalSubscription?.custom_id);
  if (parsed.userId) return parsed.userId;

  if (paypalSubscription?.subscriber?.email_address) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: String(paypalSubscription.subscriber.email_address).toLowerCase().trim() },
      select: { id: true },
    });

    if (userByEmail?.id) return userByEmail.id;
  }

  if (subscriptionId) {
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        externalId: subscriptionId,
        provider: "PAYPAL",
      },
      select: { userId: true },
    });

    if (existingSubscription?.userId) return existingSubscription.userId;
  }

  return null;
}

export async function createPaypalSubscription(
  userId: string,
  productId: string,
  returnUrl?: string,
  cancelUrl?: string
) {
  const config = getPaypalSuscriptionConfig();

  const finalReturnUrl = resolveUrl(
    returnUrl,
    config.defaultReturnUrl,
    "PAYPAL_SUSCRIPTION_RETURN_URL"
  );

  const finalCancelUrl = resolveUrl(
    cancelUrl,
    config.defaultCancelUrl,
    "PAYPAL_SUSCRIPTION_CANCEL_URL"
  );

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      isSubscription: true,
      paypalPlanId: true,
    },
  });

  if (!product) throw new ApiError(404, "Product not found");
  if (!product.isSubscription) {
    throw new ApiError(400, "Product is not a subscription");
  }
  if (!product.paypalPlanId) {
    throw new ApiError(400, "Product missing paypalPlanId");
  }

  const token = await getPaypalAccessToken();

  const response = await axios.post(
    `${config.baseUrl}/v1/billing/subscriptions`,
    {
      plan_id: product.paypalPlanId,
      custom_id: `${userId}:${productId}`,
      application_context: {
        brand_name: "Entrenamiento Focus",
        locale: "es-AR",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: finalReturnUrl,
        cancel_url: finalCancelUrl,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const approveUrl =
    response.data.links?.find((l: { rel?: string; href?: string }) => l.rel === "approve")?.href ??
    null;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      provider: "PAYPAL",
      status: "PAST_DUE",
      externalId: String(response.data.id),
      cancelAtPeriodEnd: false,
    },
    update: {
      provider: "PAYPAL",
      status: "PAST_DUE",
      externalId: String(response.data.id),
      cancelAtPeriodEnd: false,
    },
  });

  return {
    id: String(response.data.id),
    status: String(response.data.status ?? "CREATED"),
    approveUrl,
    returnUrl: finalReturnUrl,
    cancelUrl: finalCancelUrl,
    productId,
    planId: product.paypalPlanId,
  };
}

export async function fetchPaypalSubscription(subscriptionId: string) {
  if (!subscriptionId) {
    throw new ApiError(400, "Missing subscriptionId");
  }

  const config = getPaypalSuscriptionConfig();
  const token = await getPaypalAccessToken();

  const response = await axios.get(`${config.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data as PaypalSubscriptionDetails;
}

export async function syncPaypalSubscriptionForUser(userId: string, subscriptionId: string) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!subscriptionId) {
    throw new ApiError(400, "Missing subscriptionId");
  }

  const paypalSubscription = await fetchPaypalSubscription(subscriptionId);

  const parsed = parseCustomId(paypalSubscription?.custom_id);

  if (parsed.userId && parsed.userId !== userId) {
    throw new ApiError(403, "This subscription does not belong to this user");
  }

  const productId =
    parsed.productId || (await resolveProductIdFromSubscription(paypalSubscription));

  const subscription = await persistPaypalSubscriptionForUser({
    userId,
    productId,
    paypalSubscription,
  });

  return {
    verified: subscription.status === "ACTIVE",
    subscription,
    raw: paypalSubscription,
  };
}

export async function verifyPaypalSuccessForUser(userId: string, subscriptionId: string) {
  const data = await syncPaypalSubscriptionForUser(userId, subscriptionId);

  return {
    ok: data.subscription.status === "ACTIVE",
    verified: data.subscription.status === "ACTIVE",
    status: data.subscription.status,
    subscriptionId,
    subscription: data.subscription,
    raw: data.raw,
  };
}

export async function cancelPaypalSubscriptionAtProvider(externalId: string, reason: string) {
  if (!externalId) {
    throw new ApiError(400, "Missing PayPal external subscription id");
  }

  const config = getPaypalSuscriptionConfig();
  const token = await getPaypalAccessToken();

  await axios.post(
    `${config.baseUrl}/v1/billing/subscriptions/${externalId}/cancel`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function verifyPaypalWebhook(headers: RawHeaders, body: unknown) {
  const config = getPaypalSuscriptionConfig();

  if (!config.webhookId) return true;

  const token = await getPaypalAccessToken();

  const verificationBody = {
    auth_algo: getHeader(headers, "paypal-auth-algo"),
    cert_url: getHeader(headers, "paypal-cert-url"),
    transmission_id: getHeader(headers, "paypal-transmission-id"),
    transmission_sig: getHeader(headers, "paypal-transmission-sig"),
    transmission_time: getHeader(headers, "paypal-transmission-time"),
    webhook_id: config.webhookId,
    webhook_event: body,
  };

  const response = await axios.post(
    `${config.baseUrl}/v1/notifications/verify-webhook-signature`,
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

export async function handlePaypalSubscriptionWebhook(
  body: unknown,
  headers: RawHeaders
) {
  console.log("📩 PAYPAL WEBHOOK RECIBIDO");
  console.log("👉 event_type:", (body as any)?.event_type);
  console.log("👉 resource:", JSON.stringify((body as any)?.resource, null, 2));

  const valid = await verifyPaypalWebhook(headers, body);

  console.log("🔐 Firma webhook válida:", valid);

  if (!valid) {
    console.error("❌ Firma inválida de PayPal");
    throw new ApiError(400, "Invalid PayPal webhook signature");
  }

  const eventType = String(
    (body as { event_type?: string } | null)?.event_type ?? ""
  );

  console.log("📌 Procesando eventType:", eventType);

  if (
    !eventType.startsWith("BILLING.SUBSCRIPTION") &&
    eventType !== "PAYMENT.SALE.COMPLETED"
  ) {
    console.log("⏭ Evento ignorado:", eventType);
    return { ok: true, ignored: true };
  }

  const resource = ((body as { resource?: Record<string, unknown> } | null)
    ?.resource ?? {}) as Record<string, unknown>;

  const subscriptionId = resource.id ? String(resource.id) : null;
  const billingAgreementId = resource.billing_agreement_id
    ? String(resource.billing_agreement_id)
    : null;

  const resolvedSubscriptionId = subscriptionId || billingAgreementId;

  console.log("🔎 subscriptionId:", subscriptionId);
  console.log("🔎 billingAgreementId:", billingAgreementId);
  console.log("🎯 resolvedSubscriptionId:", resolvedSubscriptionId);

  if (!resolvedSubscriptionId) {
    console.warn("⚠️ No se pudo obtener subscriptionId");
    return { ok: true, ignored: true };
  }

  console.log("📡 Consultando PayPal...");
  const paypalSubscription = await fetchPaypalSubscription(
    resolvedSubscriptionId
  );

  console.log(
    "📦 Subscription PayPal:",
    JSON.stringify(paypalSubscription, null, 2)
  );

  const resolvedUserId = await resolveUserIdFromSubscription(
    paypalSubscription,
    resolvedSubscriptionId
  );

  console.log("👤 userId resuelto:", resolvedUserId);

  if (!resolvedUserId) {
    console.warn("⚠️ No se pudo resolver userId");
    return {
      ok: true,
      ignored: true,
      reason: "user_not_resolved",
      subscriptionId: resolvedSubscriptionId,
    };
  }

  const resolvedProductId =
    await resolveProductIdFromSubscription(paypalSubscription);

  console.log("📦 productId resuelto:", resolvedProductId);

  const subscription = await persistPaypalSubscriptionForUser({
    userId: resolvedUserId,
    productId: resolvedProductId,
    paypalSubscription,
  });

  console.log("✅ Suscripción guardada en DB:");
  console.log("👉 status:", subscription.status);

  return {
    ok: true,
    eventType,
    subscriptionId: resolvedSubscriptionId,
    userId: resolvedUserId,
    productId: resolvedProductId,
    status: subscription.status,
  };
}
