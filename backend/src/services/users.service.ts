import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";

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
  });
}