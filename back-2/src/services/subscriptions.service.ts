import { prisma } from "../../prisma/client";
import { ApiError } from "../common/errors/ApiError";

export async function getMe(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function cancelByUser(userId: string, cancelAtPeriodEnd: boolean) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new ApiError(404, "No subscription");

  // para MVP: marcamos cancelAtPeriodEnd
  const updated = await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd, status: cancelAtPeriodEnd ? "ACTIVE" : "CANCELLED" }
  });

  return updated;
}

export async function adminCancel(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new ApiError(404, "No subscription");

  return prisma.subscription.update({
    where: { userId },
    data: { status: "CANCELLED", cancelAtPeriodEnd: false }
  });
}