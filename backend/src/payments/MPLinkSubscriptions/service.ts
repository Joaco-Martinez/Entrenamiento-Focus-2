import { prisma } from "../../prisma/client";
import { ApiError } from "../../common/errors/ApiError";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS;
const MP_DEFAULT_PLAN_ID = process.env.MP_PLAN_ID;

type CreateIntentInput = {
  userId: string;
  email: string;
  productId?: string | null;
  checkoutUrl: string;
  planId?: string;
};

type MercadoPagoPreapproval = {
  id?: string;
  status?: string;
  payer_email?: string;
  preapproval_plan_id?: string;
  next_payment_date?: string | null;
  auto_recurring?: {
    start_date?: string | null;
    frequency?: number;
    frequency_type?: string;
    transaction_amount?: number;
    currency_id?: string;
  } | null;
};

function mapSubscriptionStatus(mpStatus?: string) {
  switch (mpStatus) {
    case "authorized":
      return "ACTIVE";
    case "paused":
      return "SUSPENDED";
    case "cancelled":
      return "CANCELLED";
    case "expired":
      return "EXPIRED";
    default:
      return "PAST_DUE";
  }
}

function extractPlanIdFromCheckoutUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("preapproval_plan_id") || undefined;
  } catch {
    return undefined;
  }
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!MP_ACCESS_TOKEN) {
    throw new ApiError(500, "Falta MP_ACCESS_TOKEN_SUSCRIPTIONS");
  }

  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, `Mercado Pago error: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * OJO:
 * Esto NO crea nada en MP.
 * Solo consulta una suscripción ya creada desde el link genérico.
 */
export async function getPreapprovalById(
  preapprovalId: string
): Promise<MercadoPagoPreapproval> {
  return mpFetch<MercadoPagoPreapproval>(`/preapproval/${preapprovalId}`);
}

export async function createMercadoPagoLinkIntent(input: CreateIntentInput) {
  const { userId, email, productId = null, checkoutUrl } = input;

  if (!userId) throw new ApiError(400, "userId requerido");
  if (!email) throw new ApiError(400, "email requerido");
  if (!checkoutUrl) throw new ApiError(400, "checkoutUrl requerido");

  const planId =
    input.planId ||
    extractPlanIdFromCheckoutUrl(checkoutUrl) ||
    MP_DEFAULT_PLAN_ID;

  if (!planId) {
    throw new ApiError(
      400,
      "No se pudo resolver el planId desde el checkoutUrl ni desde MP_PLAN_ID"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new ApiError(404, "Producto no encontrado");
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 6);

  await prisma.subscriptionLinkIntent.updateMany({
    where: {
      userId,
      status: "PENDING",
    },
    data: {
      status: "EXPIRED",
    },
  });

  const intent = await prisma.subscriptionLinkIntent.create({
    data: {
      userId,
      productId,
      provider: "MERCADOPAGO",
      planId,
      checkoutUrl,
      email: email.toLowerCase().trim(),
      status: "PENDING",
      openedAt: now,
      expiresAt,
    },
  });

  return {
    ok: true,
    intentId: intent.id,
    checkoutUrl,
    planId,
    expiresAt,
  };
}

export async function processMercadoPagoLinkWebhook(payload: any, query: any) {
  const eventType =
    payload?.type ||
    payload?.topic ||
    query?.type ||
    query?.topic ||
    null;

  const preapprovalId =
    payload?.data?.id ||
    payload?.id ||
    query?.["data.id"] ||
    query?.id ||
    null;

  if (!preapprovalId) {
    return { ignored: true, reason: "Sin preapprovalId" };
  }

  if (
    eventType &&
    !String(eventType).toLowerCase().includes("preapproval") &&
    !String(eventType).toLowerCase().includes("subscription")
  ) {
    return { ignored: true, reason: `Evento ignorado: ${eventType}` };
  }

  // CONSULTA SOLAMENTE. NO CREA NADA EN MP.
  const mpPreapproval = await getPreapprovalById(String(preapprovalId));

  const payerEmail = String(mpPreapproval.payer_email || "")
    .trim()
    .toLowerCase();

  const planId = String(mpPreapproval.preapproval_plan_id || "").trim();
  const mpStatus = String(mpPreapproval.status || "").trim();

  if (!payerEmail || !planId) {
    return {
      ignored: true,
      reason: "La suscripción no tiene payer_email o preapproval_plan_id",
      preapprovalId,
    };
  }

  const now = new Date();

  const existingByExternalId = await prisma.subscription.findFirst({
    where: {
      externalId: String(preapprovalId),
    },
  });

  let matchedIntent = await prisma.subscriptionLinkIntent.findFirst({
    where: {
      provider: "MERCADOPAGO",
      planId,
      email: payerEmail,
      status: "PENDING",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!matchedIntent && existingByExternalId?.userId) {
    matchedIntent = await prisma.subscriptionLinkIntent.findFirst({
      where: {
        userId: existingByExternalId.userId,
        planId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (!matchedIntent) {
    return {
      ignored: true,
      reason: "No se encontró intent pendiente para ese email + plan",
      payerEmail,
      planId,
      preapprovalId,
    };
  }

  const mappedStatus = mapSubscriptionStatus(mpStatus);

  await prisma.subscription.upsert({
    where: {
      userId: matchedIntent.userId,
    },
    update: {
      provider: "MERCADOPAGO",
      status: mappedStatus as any,
      externalId: String(preapprovalId),
      providerStatus: mpStatus || null,
      payerEmail,
      productId: matchedIntent.productId ?? null,
      raw: JSON.parse(JSON.stringify(mpPreapproval)),
      currentPeriodStart: mpPreapproval.auto_recurring?.start_date
        ? new Date(mpPreapproval.auto_recurring.start_date)
        : null,
      currentPeriodEnd: mpPreapproval.next_payment_date
        ? new Date(mpPreapproval.next_payment_date)
        : null,
      cancelledAt: mpStatus === "cancelled" ? now : null,
    },
    create: {
      userId: matchedIntent.userId,
      provider: "MERCADOPAGO",
      status: mappedStatus as any,
      externalId: String(preapprovalId),
      providerStatus: mpStatus || null,
      payerEmail,
      productId: matchedIntent.productId ?? null,
      raw: JSON.parse(JSON.stringify(mpPreapproval)),
      currentPeriodStart: mpPreapproval.auto_recurring?.start_date
        ? new Date(mpPreapproval.auto_recurring.start_date)
        : null,
      currentPeriodEnd: mpPreapproval.next_payment_date
        ? new Date(mpPreapproval.next_payment_date)
        : null,
      cancelledAt: mpStatus === "cancelled" ? now : null,
    },
  });

  await prisma.subscriptionLinkIntent.update({
    where: { id: matchedIntent.id },
    data: {
      status: mappedStatus === "ACTIVE" ? "ACTIVATED" : "MATCHED",
      payerEmail,
      mpPreapprovalId: String(preapprovalId),
      mpStatus,
      matchedAt: now,
      activatedAt: mappedStatus === "ACTIVE" ? now : null,
      lastWebhookAt: now,
      raw: JSON.parse(JSON.stringify(mpPreapproval)),
    },
  });

  return {
    ok: true,
    matchedIntentId: matchedIntent.id,
    userId: matchedIntent.userId,
    preapprovalId: String(preapprovalId),
    payerEmail,
    planId,
    mpStatus,
    mappedStatus,
  };
}

export async function getMyMercadoPagoLinkSubscription(userId: string) {
  const [subscription, latestIntent] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId },
    }),
    prisma.subscriptionLinkIntent.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    subscription,
    latestIntent,
    isPremium: subscription?.status === "ACTIVE",
  };
}