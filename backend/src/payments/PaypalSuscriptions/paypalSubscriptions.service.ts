import axios from "axios";
import { prisma } from "../../prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../common/errors/ApiError";

type RawHeaders = Record<string, string | string[] | undefined>;

function getPaypalSuscriptionConfig() {
  return {
    clientId: env.PAYPAL_SUSCRIPTION_CLIENT_ID,
    clientSecret: env.PAYPAL_SUSCRIPTION_CLIENT_SECRET,
    webhookId: env.PAYPAL_SUSCRIPTION_WEBHOOK_ID,
    baseUrl: env.PAYPAL_SUSCRIPTION_BASE_URL,
    defaultReturnUrl: env.PAYPAL_SUSCRIPTION_RETURN_URL,
    defaultCancelUrl: env.PAYPAL_SUSCRIPTION_CANCEL_URL,
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

export async function getPaypalAccessToken() {
  const config = getPaypalSuscriptionConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new ApiError(
      400,
      "Missing PayPal suscription credentials. Check PAYPAL_SUSCRIPTION_CLIENT_ID and PAYPAL_SUSCRIPTION_CLIENT_SECRET"
    );
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

export function mapPaypalSubscriptionStatus(statusRaw?: string | null) {
  const normalized = String(statusRaw ?? "").toUpperCase();

  if (normalized === "APPROVAL_PENDING") return "PAST_DUE" as const;
  if (normalized === "APPROVED") return "PAST_DUE" as const;
  if (normalized === "ACTIVE") return "ACTIVE" as const;
  if (normalized === "CANCELLED") return "CANCELLED" as const;
  if (normalized === "SUSPENDED") return "SUSPENDED" as const;
  if (normalized === "EXPIRED") return "EXPIRED" as const;

  return "PAST_DUE" as const;
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

  const product = await prisma.product.findUnique({ where: { id: productId } });

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
        user_action: "SUBSCRIBE_NOW",
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
    approveUrl,
    returnUrl: finalReturnUrl,
    cancelUrl: finalCancelUrl,
  };
}

export async function fetchPaypalSubscription(subscriptionId: string) {
  const config = getPaypalSuscriptionConfig();
  const token = await getPaypalAccessToken();

  const response = await axios.get(
    `${config.baseUrl}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export async function syncPaypalSubscriptionForUser(
  userId: string,
  subscriptionId: string
) {
  const paypalSubscription = await fetchPaypalSubscription(subscriptionId);

  const customId = String(paypalSubscription?.custom_id ?? "");
  if (customId && customId.includes(":")) {
    const [ownerUserId] = customId.split(":");
    if (ownerUserId && ownerUserId !== userId) {
      throw new ApiError(403, "This subscription does not belong to this user");
    }
  }

  const mappedStatus = mapPaypalSubscriptionStatus(paypalSubscription?.status);

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      provider: "PAYPAL",
      status: mappedStatus,
      externalId: String(paypalSubscription.id),
      currentPeriodStart: paypalSubscription?.billing_info?.last_payment?.time
        ? new Date(paypalSubscription.billing_info.last_payment.time)
        : null,
      currentPeriodEnd: paypalSubscription?.billing_info?.next_billing_time
        ? new Date(paypalSubscription.billing_info.next_billing_time)
        : null,
      cancelAtPeriodEnd: false,
    },
    update: {
      provider: "PAYPAL",
      status: mappedStatus,
      externalId: String(paypalSubscription.id),
      currentPeriodStart: paypalSubscription?.billing_info?.last_payment?.time
        ? new Date(paypalSubscription.billing_info.last_payment.time)
        : null,
      currentPeriodEnd: paypalSubscription?.billing_info?.next_billing_time
        ? new Date(paypalSubscription.billing_info.next_billing_time)
        : null,
      cancelAtPeriodEnd: false,
    },
  });

  return {
    subscription,
    raw: paypalSubscription,
  };
}

export async function cancelPaypalSubscriptionAtProvider(
  externalId: string,
  reason: string
) {
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

export async function handlePaypalSubscriptionWebhook(body: unknown, headers: RawHeaders) {
  const valid = await verifyPaypalWebhook(headers, body);

  if (!valid) {
    throw new ApiError(400, "Invalid PayPal webhook signature");
  }

  const eventType = String((body as { event_type?: string } | null)?.event_type ?? "");
  if (!eventType.startsWith("BILLING.SUBSCRIPTION")) {
    return { ok: true, ignored: true };
  }

  const resource = ((body as { resource?: Record<string, unknown> } | null)?.resource ?? {}) as Record<string, unknown>;
  const subscriptionId = resource.id ? String(resource.id) : null;
  const customId = resource.custom_id ? String(resource.custom_id) : "";
  const userId = customId.includes(":") ? customId.split(":")[0] : null;

  if (!subscriptionId || !userId) {
    return { ok: true, ignored: true };
  }

  const billingInfo = (resource.billing_info ?? {}) as Record<string, unknown>;
  const lastPayment = (billingInfo.last_payment ?? {}) as Record<string, unknown>;
  const mappedStatus = mapPaypalSubscriptionStatus(
    typeof resource.status === "string" ? resource.status : null
  );

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      provider: "PAYPAL",
      status: mappedStatus,
      externalId: subscriptionId,
      currentPeriodStart:
        typeof lastPayment.time === "string" ? new Date(lastPayment.time) : null,
      currentPeriodEnd:
        typeof billingInfo.next_billing_time === "string"
          ? new Date(billingInfo.next_billing_time)
          : null,
      cancelAtPeriodEnd: false,
    },
    update: {
      provider: "PAYPAL",
      status: mappedStatus,
      externalId: subscriptionId,
      currentPeriodStart:
        typeof lastPayment.time === "string" ? new Date(lastPayment.time) : null,
      currentPeriodEnd:
        typeof billingInfo.next_billing_time === "string"
          ? new Date(billingInfo.next_billing_time)
          : null,
      cancelAtPeriodEnd: false,
    },
  });

  return { ok: true };
}
