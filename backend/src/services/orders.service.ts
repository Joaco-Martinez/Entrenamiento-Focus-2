import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { PaymentProvider } from "@prisma/client";

type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export async function createOrder(
  userId: string,
  items: CreateOrderItemInput[],
  country?: string
) {
  if (!items || items.length === 0) {
    throw new ApiError(400, "Items are required");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const normalizedCountry = (country ?? user.country ?? "arg")
    .toString()
    .trim()
    .toLowerCase();

  const isArgentina = normalizedCountry === "arg" || normalizedCountry === "ar";

  const provider: PaymentProvider = isArgentina ? "MERCADOPAGO" : "PAYPAL";
  const currency = isArgentina ? "ARS" : "USD";

  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      isActive: true,
    },
  });

  if (products.length !== items.length) {
    throw new ApiError(400, "Some products not found or inactive");
  }

  const itemRows = items.map((i) => {
    const product = products.find((p) => p.id === i.productId);
    if (!product) {
      throw new ApiError(400, `Product not found: ${i.productId}`);
    }

    const quantity = Number(i.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, `Invalid quantity for product ${product.id}`);
    }

    const unitPrice = isArgentina ? Number(product.arPrice) : Number(product.usdPrice);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new ApiError(400, `Invalid price for product ${product.id}`);
    }

    return {
      productId: product.id,
      quantity,
      unitPrice,
    };
  });

  const totalAmount = itemRows.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new ApiError(400, "Invalid totalAmount");
  }

  const order = await prisma.order.create({
    data: {
      user: { connect: { id: userId } },
      provider,
      status: "PENDING",
      currency,
      totalAmount,
      items: {
        create: itemRows,
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  return order;
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

export async function adminList(status?: string) {
  return prisma.order.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true } },
      items: { include: { product: true } },
      payments: true,
    },
  });
}

export async function markPaid(orderId: string, externalId?: string, raw?: any) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new ApiError(404, "Order not found");
  }

  if (existingOrder.status === "PAID") {
    return existingOrder;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });

  if (externalId) {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        provider: order.provider,
        externalId,
      },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          orderId,
          provider: order.provider,
          status: "APPROVED",
          externalId,
          raw: raw ?? null,
        },
      });
    }
  } else {
    await prisma.payment.create({
      data: {
        orderId,
        provider: order.provider,
        status: "APPROVED",
        externalId: null,
        raw: raw ?? null,
      },
    });
  }

  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { product: true },
  });

  const grants = items
    .filter((i) => !i.product.isSubscription)
    .map((i) => ({
      userId: order.userId,
      productId: i.productId,
      orderId,
    }));

  for (const g of grants) {
    await prisma.accessGrant.upsert({
      where: {
        userId_productId: {
          userId: g.userId,
          productId: g.productId,
        },
      },
      create: g,
      update: {},
    });
  }

  return order;
}