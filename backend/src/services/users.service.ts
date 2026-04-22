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

import { signToken } from "../common/utils/jwt";
import { env } from "../config/env";

export async function impersonateUserByAdmin(adminId: string, targetUserId: string) {
  if (!adminId) {
    throw new ApiError(401, "Admin no autenticado");
  }

  if (adminId === targetUserId) {
    throw new ApiError(400, "No podés impersonarte a vos mismo");
  }

  const [admin, targetUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
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
    }),
  ]);

  if (!admin) {
    throw new ApiError(401, "Admin no encontrado");
  }

  if (admin.role !== "ADMIN") {
    throw new ApiError(403, "Solo un admin puede impersonar usuarios");
  }

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const token = signToken({
    sub: targetUser.id,
    email: targetUser.email,
    role: targetUser.role,
    impersonation: true,
    impersonatedBy: admin.id,
  });

  return {
    token,
    user: targetUser,
    cookieOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
      domain:
        env.NODE_ENV === "production"
          ? ".entrenamientofocus.com.ar"
          : undefined,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  };
}