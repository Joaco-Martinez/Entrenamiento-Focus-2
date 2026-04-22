import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { PaymentProvider, SubscriptionStatus } from "@prisma/client";

type AdminCreateManualSubscriptionInput = {
  userId: string;
  productId?: string | null;
  provider: PaymentProvider;
  status?: SubscriptionStatus;
  externalId?: string | null;
  providerStatus?: string | null;
  payerEmail?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  grantAccess?: boolean;
  notes?: string | null;
};

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Fecha inválida: ${value}`);
  }
  return parsed;
}

export async function adminCreateManualSubscription(
  input: AdminCreateManualSubscriptionInput
) {
  const {
    userId,
    productId = null,
    provider,
    status = "ACTIVE",
    externalId = null,
    providerStatus = null,
    payerEmail = null,
    cancelAtPeriodEnd = false,
    cancelledAt = null,
    currentPeriodStart = null,
    currentPeriodEnd = null,
    grantAccess = true,
    notes = null,
  } = input;

  if (!userId) {
    throw new ApiError(400, "userId requerido");
  }

  if (!provider) {
    throw new ApiError(400, "provider requerido");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  let product: { id: string; requiresPremium: boolean; isSubscription: boolean } | null = null;

  if (productId) {
    product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        requiresPremium: true,
        isSubscription: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Producto no encontrado");
    }
  }

  const parsedCancelledAt = parseOptionalDate(cancelledAt);
  const parsedCurrentPeriodStart = parseOptionalDate(currentPeriodStart);
  const parsedCurrentPeriodEnd = parseOptionalDate(currentPeriodEnd);

  const normalizedPayerEmail =
    payerEmail?.trim().toLowerCase() || user.email.trim().toLowerCase();

  const raw = {
    source: "admin_manual",
    notes: notes || null,
    assignedBy: "admin",
    createdAt: new Date().toISOString(),
  };

  const subscription = await prisma.subscription.upsert({
    where: {
      userId,
    },
    update: {
      productId,
      provider,
      status,
      externalId,
      providerStatus,
      payerEmail: normalizedPayerEmail,
      cancelAtPeriodEnd,
      cancelledAt: parsedCancelledAt,
      currentPeriodStart: parsedCurrentPeriodStart,
      currentPeriodEnd: parsedCurrentPeriodEnd,
      raw: JSON.parse(JSON.stringify(raw)),
    },
    create: {
      userId,
      productId,
      provider,
      status,
      externalId,
      providerStatus,
      payerEmail: normalizedPayerEmail,
      cancelAtPeriodEnd,
      cancelledAt: parsedCancelledAt,
      currentPeriodStart: parsedCurrentPeriodStart,
      currentPeriodEnd: parsedCurrentPeriodEnd,
      raw: JSON.parse(JSON.stringify(raw)),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          requiresPremium: true,
          isSubscription: true,
        },
      },
    },
  });

  let accessGrant = null;

  if (grantAccess && productId) {
    accessGrant = await prisma.accessGrant.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
    });
  }

  return {
    ok: true,
    message: "Suscripción manual creada/actualizada correctamente",
    subscription,
    accessGrant,
  };
}