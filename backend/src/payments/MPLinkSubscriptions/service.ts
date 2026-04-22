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

type MercadoPagoSearchResponse = {
  results?: MercadoPagoPreapproval[];
  paging?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
};

function mapSubscriptionStatus(mpStatus?: string) {
  const s = String(mpStatus || "").toLowerCase();

  switch (s) {
    case "authorized":
    case "active":
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
 * Consulta una suscripción existente en MP por id
 */
export async function getPreapprovalById(
  preapprovalId: string
): Promise<MercadoPagoPreapproval> {
  return mpFetch<MercadoPagoPreapproval>(`/preapproval/${preapprovalId}`);
}

/**
 * Busca suscripciones en MP por payer_email + planId
 */
async function searchPreapprovalsByEmailAndPlan(
  payerEmail: string,
  planId: string
): Promise<MercadoPagoPreapproval[]> {
  const safeEmail = String(payerEmail || "").trim().toLowerCase();
  const safePlanId = String(planId || "").trim();

  if (!safeEmail || !safePlanId) return [];

  const query = new URLSearchParams({
    payer_email: safeEmail,
    preapproval_plan_id: safePlanId,
    limit: "100",
    offset: "0",
  });

  const data = await mpFetch<MercadoPagoSearchResponse>(
    `/preapproval/search?${query.toString()}`
  );

  return Array.isArray(data?.results) ? data.results : [];
}

function pickBestPreapproval(
  results: MercadoPagoPreapproval[]
): MercadoPagoPreapproval | null {
  if (!results.length) return null;

  const active =
    results.find((s) => {
      const status = String(s.status || "").toLowerCase();
      return status === "authorized" || status === "active";
    }) || null;

  if (active) return active;

  const paused =
    results.find((s) => String(s.status || "").toLowerCase() === "paused") ||
    null;

  if (paused) return paused;

  return results[0] || null;
}

async function upsertSubscriptionFromPreapproval(params: {
  matchedIntent: {
    id: string;
    userId: string;
    productId?: string | null;
  };
  mpPreapproval: MercadoPagoPreapproval;
}) {
  const { matchedIntent, mpPreapproval } = params;

  const preapprovalId = String(mpPreapproval.id || "").trim();
  const payerEmail = String(mpPreapproval.payer_email || "")
    .trim()
    .toLowerCase();
  const mpStatus = String(mpPreapproval.status || "").trim().toLowerCase();
  const mappedStatus = mapSubscriptionStatus(mpStatus);
  const now = new Date();

  const currentPeriodStart = mpPreapproval.auto_recurring?.start_date
    ? new Date(mpPreapproval.auto_recurring.start_date)
    : null;

  const currentPeriodEnd = mpPreapproval.next_payment_date
    ? new Date(mpPreapproval.next_payment_date)
    : null;

  const serializedRaw = JSON.parse(JSON.stringify(mpPreapproval));

  const subscription = await prisma.subscription.upsert({
    where: {
      userId: matchedIntent.userId,
    },
    update: {
      provider: "MERCADOPAGO",
      status: mappedStatus as any,
      externalId: preapprovalId || null,
      providerStatus: mpStatus || null,
      payerEmail: payerEmail || null,
      productId: matchedIntent.productId ?? null,
      raw: serializedRaw,
      currentPeriodStart,
      currentPeriodEnd,
      cancelledAt: mpStatus === "cancelled" ? now : null,
    },
    create: {
      userId: matchedIntent.userId,
      provider: "MERCADOPAGO",
      status: mappedStatus as any,
      externalId: preapprovalId || null,
      providerStatus: mpStatus || null,
      payerEmail: payerEmail || null,
      productId: matchedIntent.productId ?? null,
      raw: serializedRaw,
      currentPeriodStart,
      currentPeriodEnd,
      cancelledAt: mpStatus === "cancelled" ? now : null,
    },
  });

  const updatedIntent = await prisma.subscriptionLinkIntent.update({
    where: { id: matchedIntent.id },
    data: {
      status: mappedStatus === "ACTIVE" ? "ACTIVATED" : "MATCHED",
      payerEmail: payerEmail || null,
      mpPreapprovalId: preapprovalId || null,
      mpStatus: mpStatus || null,
      matchedAt: now,
      activatedAt: mappedStatus === "ACTIVE" ? now : null,
      lastWebhookAt: now,
      raw: serializedRaw,
    },
  });

  return {
    subscription,
    updatedIntent,
    mappedStatus,
    mpStatus,
    preapprovalId,
    payerEmail,
  };
}

export async function createMercadoPagoLinkIntent(input: CreateIntentInput) {
  const { userId, email, productId = null, checkoutUrl } = input;

  if (!userId) throw new ApiError(400, "userId requerido");
  if (!email) throw new ApiError(400, "email requerido");
  if (!checkoutUrl) throw new ApiError(400, "checkoutUrl requerido");

  const normalizedEmail = email.toLowerCase().trim();

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
      provider: "MERCADOPAGO",
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
      email: normalizedEmail,
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
  console.log("========== MP LINK WEBHOOK ==========");
  console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
  console.log("QUERY:", JSON.stringify(query, null, 2));

  const eventType =
    payload?.type ||
    payload?.topic ||
    query?.type ||
    query?.topic ||
    null;

  const resourceId =
    payload?.data?.id ||
    payload?.id ||
    query?.["data.id"] ||
    query?.id ||
    null;

  const typeLower = String(eventType || "").toLowerCase();

  console.log("eventType:", eventType);
  console.log("resourceId:", resourceId);

  if (!resourceId) {
    console.log("IGNORED: sin resourceId");
    return { ignored: true, reason: "Sin resourceId" };
  }

  if (!typeLower) {
    console.log("IGNORED: sin eventType");
    return { ignored: true, reason: "Sin eventType" };
  }

  // Evento de cobro de suscripción: no activa directamente
  if (typeLower.includes("authorized_payment")) {
    console.log(
      "IGNORED: subscription_authorized_payment no activa la suscripción directamente:",
      resourceId
    );

    return {
      ignored: true,
      reason: "Evento de cobro de suscripción ignorado",
      eventType,
      resourceId: String(resourceId),
    };
  }

  if (
    !typeLower.includes("preapproval") &&
    !typeLower.includes("subscription")
  ) {
    console.log("IGNORED: evento no válido para suscripción:", eventType);
    return { ignored: true, reason: `Evento ignorado: ${eventType}` };
  }

  const preapprovalId = String(resourceId);
  const mpPreapproval = await getPreapprovalById(preapprovalId);

  console.log("mpPreapproval:", JSON.stringify(mpPreapproval, null, 2));

  const payerEmail = String(mpPreapproval.payer_email || "")
    .trim()
    .toLowerCase();

  const planId = String(mpPreapproval.preapproval_plan_id || "").trim();
  const mpStatus = String(mpPreapproval.status || "").trim().toLowerCase();

  console.log("payerEmail:", payerEmail);
  console.log("planId:", planId);
  console.log("mpStatus:", mpStatus);

  if (!planId) {
    console.log("IGNORED: falta preapproval_plan_id");
    return {
      ignored: true,
      reason: "La suscripción no tiene preapproval_plan_id",
      preapprovalId,
      payerEmail,
      planId,
    };
  }

  const now = new Date();

  const existingByExternalId = await prisma.subscription.findFirst({
    where: {
      externalId: preapprovalId,
    },
  });

  console.log("existingByExternalId:", existingByExternalId?.id ?? null);

  let matchedIntent = null as Awaited<
    ReturnType<typeof prisma.subscriptionLinkIntent.findFirst>
  > | null;

  // 1) Buscar por email + plan SOLO si hay email
  if (payerEmail) {
    matchedIntent = await prisma.subscriptionLinkIntent.findFirst({
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

    console.log(
      "matchedIntent by pending+email+plan:",
      matchedIntent?.id ?? null
    );
  } else {
    console.log("matchedIntent by pending+email+plan: skipped, payerEmail vacío");
  }

  // 2) Si ya existe una suscripción con ese externalId, usar ese userId
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

    console.log(
      "matchedIntent by existing subscription userId + planId:",
      matchedIntent?.id ?? null
    );
  }

  // 3) Fallback fuerte: último intent vigente para ese plan
  if (!matchedIntent) {
    matchedIntent = await prisma.subscriptionLinkIntent.findFirst({
      where: {
        provider: "MERCADOPAGO",
        planId,
        status: {
          in: ["PENDING", "MATCHED"],
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      "matchedIntent by latest pending/matched planId:",
      matchedIntent?.id ?? null
    );
  }

  // 4) Buscar por cualquier estado con email + plan SOLO si hay email
  if (!matchedIntent && payerEmail) {
    matchedIntent = await prisma.subscriptionLinkIntent.findFirst({
      where: {
        provider: "MERCADOPAGO",
        planId,
        email: payerEmail,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      "matchedIntent by any status email + plan:",
      matchedIntent?.id ?? null
    );
  }

  // 5) Buscar user por email SOLO si hay email
  if (!matchedIntent && payerEmail) {
    const user = await prisma.user.findUnique({
      where: { email: payerEmail },
      select: { id: true, email: true },
    });

    console.log("user by payerEmail:", user?.id ?? null);

    if (user) {
      matchedIntent = await prisma.subscriptionLinkIntent.findFirst({
        where: {
          userId: user.id,
          planId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(
        "matchedIntent by userId + planId:",
        matchedIntent?.id ?? null
      );
    }
  }

  if (!matchedIntent) {
    console.log("IGNORED: no se encontró intent");
    return {
      ignored: true,
      reason: "No se encontró intent para esa suscripción",
      payerEmail,
      planId,
      preapprovalId,
    };
  }

  const result = await upsertSubscriptionFromPreapproval({
    matchedIntent: {
      id: matchedIntent.id,
      userId: matchedIntent.userId,
      productId: matchedIntent.productId ?? null,
    },
    mpPreapproval,
  });

  console.log("subscription upserted:", {
    id: result.subscription.id,
    userId: result.subscription.userId,
    status: result.subscription.status,
    externalId: result.subscription.externalId,
  });

  console.log("intent updated:", {
    id: result.updatedIntent.id,
    status: result.updatedIntent.status,
    mpPreapprovalId: result.updatedIntent.mpPreapprovalId,
  });

  console.log("========== MP LINK WEBHOOK OK ==========");

  return {
    ok: true,
    matchedIntentId: matchedIntent.id,
    userId: matchedIntent.userId,
    preapprovalId: result.preapprovalId,
    payerEmail: result.payerEmail,
    planId,
    mpStatus: result.mpStatus,
    mappedStatus: result.mappedStatus,
  };
}

async function tryActivateFromLatestIntent(userId: string) {
  const latestIntent = await prisma.subscriptionLinkIntent.findFirst({
    where: {
      userId,
      provider: "MERCADOPAGO",
      status: {
        in: ["PENDING", "MATCHED"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("tryActivateFromLatestIntent.latestIntent:", latestIntent?.id);

  if (!latestIntent) {
    return {
      activated: false,
      reason: "No hay intent pendiente",
    };
  }

  const payerEmail = String(latestIntent.email || "").trim().toLowerCase();
  const planId = String(latestIntent.planId || "").trim();

  console.log("tryActivateFromLatestIntent.payerEmail:", payerEmail);
  console.log("tryActivateFromLatestIntent.planId:", planId);

  if (!payerEmail || !planId) {
    return {
      activated: false,
      reason: "Intent sin email o planId",
    };
  }

  const results = await searchPreapprovalsByEmailAndPlan(payerEmail, planId);

  console.log(
    "tryActivateFromLatestIntent.search results:",
    results.map((r) => ({
      id: r.id,
      status: r.status,
      payer_email: r.payer_email,
      preapproval_plan_id: r.preapproval_plan_id,
    }))
  );

  const candidate = pickBestPreapproval(results);

  if (!candidate?.id) {
    return {
      activated: false,
      reason: "No se encontró preapproval en MP",
      payerEmail,
      planId,
    };
  }

  const mpPreapproval = await getPreapprovalById(String(candidate.id));

  console.log(
    "tryActivateFromLatestIntent.selectedPreapproval:",
    JSON.stringify(mpPreapproval, null, 2)
  );

  const result = await upsertSubscriptionFromPreapproval({
    matchedIntent: {
      id: latestIntent.id,
      userId: latestIntent.userId,
      productId: latestIntent.productId ?? null,
    },
    mpPreapproval,
  });

  return {
    activated: result.mappedStatus === "ACTIVE",
    reason:
      result.mappedStatus === "ACTIVE"
        ? "Suscripción activada desde fallback /me"
        : "Suscripción encontrada pero no activa",
    subscription: result.subscription,
    latestIntent: result.updatedIntent,
    mappedStatus: result.mappedStatus,
    mpStatus: result.mpStatus,
    preapprovalId: result.preapprovalId,
  };
}

export async function getMyMercadoPagoLinkSubscription(userId: string) {
  let [subscription, latestIntent] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId },
    }),
    prisma.subscriptionLinkIntent.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  console.log("getMyMercadoPagoLinkSubscription.initial:", {
    subscriptionId: subscription?.id ?? null,
    subscriptionStatus: subscription?.status ?? null,
    latestIntentId: latestIntent?.id ?? null,
    latestIntentStatus: latestIntent?.status ?? null,
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    try {
      const recovered = await tryActivateFromLatestIntent(userId);

      console.log("getMyMercadoPagoLinkSubscription.recovered:", recovered);

      if (recovered.activated) {
        [subscription, latestIntent] = await Promise.all([
          prisma.subscription.findUnique({
            where: { userId },
          }),
          prisma.subscriptionLinkIntent.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        console.log("✅ Suscripción recuperada desde /me", {
          userId,
          subscriptionId: subscription?.id ?? null,
          externalId: subscription?.externalId ?? null,
          status: subscription?.status ?? null,
        });
      }
    } catch (error) {
      console.error("❌ Error recuperando suscripción desde /me:", error);
    }
  }

  return {
    subscription,
    latestIntent,
    isPremium: subscription?.status === "ACTIVE",
  };
}