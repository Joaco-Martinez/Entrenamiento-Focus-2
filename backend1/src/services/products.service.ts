import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";

const publicSelect = {
  id: true,
  title: true,
  description: true,
  usdPrice: true,
  arPrice: true,
  isActive: true,
  isSubscription: true,
  requiresPremium: true,
  coverImageUrl: true,
  resourceType: true,
  createdAt: true,
} as const;

export async function listPublic() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: publicSelect,
  });
}

export async function getPublic(id: string) {
  const p = await prisma.product.findUnique({
    where: { id },
    select: publicSelect,
  });

  if (!p) throw new ApiError(404, "Product not found");
  return p;
}

export async function create(data: any) {
  return prisma.product.create({ data });
}

export async function update(id: string, data: any) {
  return prisma.product.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.product.delete({ where: { id } });
}

/**
 * Acceso protegido: devuelve resourceUrl SOLO si:
 * - Compró (AccessGrant), o
 * - Tiene Subscription ACTIVE y el producto requiresPremium
 */
export async function getAccess(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, "Product not found");

  if (!product.resourceUrl) throw new ApiError(404, "Resource not available");

  const grant = await prisma.accessGrant.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (grant) return { resourceUrl: product.resourceUrl };

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const hasPremium = sub?.status === "ACTIVE";

  if (hasPremium && product.requiresPremium) {
    return { resourceUrl: product.resourceUrl };
  }

  throw new ApiError(403, "No access");
}