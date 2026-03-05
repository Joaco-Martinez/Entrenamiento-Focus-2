import { prisma } from "../../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { PaymentProvider } from "@prisma/client";

export async function createOrder(userId: string, items: { productId: string; quantity: number }[], country?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const userCountry = country ?? user.country ?? "AR";
  const provider: PaymentProvider = userCountry === "AR" ? "MERCADOPAGO" : "PAYPAL";

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) }, isActive: true }
  });

  if (products.length !== items.length) throw new ApiError(400, "Some products not found or inactive");

  const currency = provider === "MERCADOPAGO" ? "ARS" : "USD";

  const itemRows = items.map(i => {
    const p = products.find(pp => pp.id === i.productId)!;
    return { productId: p.id, quantity: i.quantity, unitPrice: p.price };
  });

  const totalAmount = itemRows.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId,
      provider,
      status: "PENDING",
      currency,
      totalAmount,
      items: { create: itemRows }
    },
    include: { items: { include: { product: true } } }
  });

  return order;
}

export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, payments: true }
  });
}

export async function adminList(status?: string) {
  return prisma.order.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true } }, items: { include: { product: true } }, payments: true }
  });
}

export async function markPaid(orderId: string, externalId?: string, raw?: any) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" }
  });

  await prisma.payment.create({
    data: {
      orderId,
      provider: order.provider,
      status: "APPROVED",
      externalId: externalId ?? null,
      raw: raw ?? undefined
    }
  });

  // acceso permanente a productos NO-suscripción
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { product: true }
  });

  const grants = items
    .filter(i => !i.product.isSubscription)
    .map(i => ({ userId: order.userId, productId: i.productId, orderId }));

  for (const g of grants) {
    await prisma.accessGrant.upsert({
      where: { userId_productId: { userId: g.userId, productId: g.productId } },
      create: g,
      update: {}
    });
  }

  return order;
}