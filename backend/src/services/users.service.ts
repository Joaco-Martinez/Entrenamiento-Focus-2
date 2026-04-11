import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { Prisma } from "@prisma/client";

export async function getMe(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      country: true,
      createdAt: true,
    },
  });

  if (!u) throw new ApiError(404, "User not found");
  return u;
}

export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
      payments: true,
    },
  });
}

export async function getMyPurchases(userId: string) {
  const grants = await prisma.accessGrant.findMany({
    where: { userId },
    include: { product: true },
  });

  return grants.map((g) => ({
    productId: g.productId,
    title: g.product.title,
    coverImageUrl: g.product.coverImageUrl,
    createdAt: g.createdAt,
  }));
}

export async function getMySubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    include: {
      product: true,
    },
  });
}

/* =========================
   ADMIN
========================= */

export async function getAdminUsers(q?: string) {
  const query = String(q ?? "").trim();

  const where: Prisma.UserWhereInput | undefined = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      country: true,
      createdAt: true,
      subscription: {
        select: {
          id: true,
          provider: true,
          status: true,
          providerStatus: true,
          externalId: true,
          payerEmail: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          cancelledAt: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              coverImageUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          product: true,
        },
      },
      accessGrants: {
        include: {
          product: true,
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

export async function unlinkUserSubscriptionByAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      subscription: {
        select: {
          id: true,
          provider: true,
          status: true,
          externalId: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.subscription) {
    throw new ApiError(404, "El usuario no tiene suscripción vinculada");
  }

  await prisma.subscription.delete({
    where: { userId },
  });

  return {
    success: true,
    userId: user.id,
    email: user.email,
    removedSubscriptionId: user.subscription.id,
  };
}