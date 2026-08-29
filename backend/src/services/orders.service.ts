import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { PaymentProvider } from "@prisma/client";

type CreateOrderItemInput = {
  productId?: string;
  classId?: string;
  quantity: number;
};

export async function createOrder(
  userId: string,
  items: CreateOrderItemInput[],
  provider: PaymentProvider,
  country?: string
) {
  if (!items || items.length === 0) {
    throw new ApiError(400, "Items are required");
  }

  if (!provider || !["MERCADOPAGO", "PAYPAL"].includes(provider)) {
    throw new ApiError(400, "Invalid payment provider");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const normalizedCountry = (country ?? user.country ?? "arg")
    .toString()
    .trim()
    .toLowerCase();

  const isArgentina = normalizedCountry === "arg" || normalizedCountry === "ar";

  if (!isArgentina && provider !== "PAYPAL") {
    throw new ApiError(400, "For this country, only PayPal is available");
  }

  const currency = provider === "MERCADOPAGO" ? "ARS" : "USD";

  const productItems = items.filter((i) => i.productId);
  const classItems = items.filter((i) => i.classId);

  const products = productItems.length
    ? await prisma.product.findMany({
        where: {
          id: { in: productItems.map((i) => i.productId!) },
          isActive: true,
        },
      })
    : [];

  if (products.length !== productItems.length) {
    throw new ApiError(400, "Some products not found or inactive");
  }

  const classes = classItems.length
    ? await prisma.videoClass.findMany({
        where: {
          id: { in: classItems.map((i) => i.classId!) },
          status: "PUBLISHED",
        },
      })
    : [];

  if (classes.length !== classItems.length) {
    throw new ApiError(400, "Some classes not found or not published");
  }

  const productRows = productItems.map((i) => {
    const product = products.find((p) => p.id === i.productId)!;

    const quantity = Number(i.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, `Invalid quantity for product ${product.id}`);
    }

    const unitPrice =
      provider === "MERCADOPAGO"
        ? Number(product.arPrice)
        : Number(product.usdPrice);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new ApiError(400, `Invalid price for product ${product.id}`);
    }

    return { productId: product.id, quantity, unitPrice };
  });

  const classRows = classItems.map((i) => {
    const videoClass = classes.find((c) => c.id === i.classId)!;

    const quantity = Number(i.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, `Invalid quantity for class ${videoClass.id}`);
    }

    const unitPrice =
      provider === "MERCADOPAGO"
        ? Number(videoClass.arPrice)
        : Number(videoClass.usdPrice);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new ApiError(400, `Invalid price for class ${videoClass.id}`);
    }

    return { classId: videoClass.id, quantity, unitPrice };
  });

  const itemRows = [...productRows, ...classRows];

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
      items: { include: { product: true, videoClass: true } },
    },
  });

  return order;
}

export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true, videoClass: true } },
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
      items: { include: { product: true, videoClass: true } },
      payments: true,
    },
  });
}

/**
 * Usado por los controllers de MP/PayPal para decidir si el paso disparado
 * por el navegador (confirm-payment / capture) puede otorgar acceso o no.
 * Para clases el acceso SOLO lo otorga el webhook (ver markPaid): el
 * redirect puede ejecutar el cobro (PayPal) o mostrar el estado, pero nunca
 * llama a markPaid cuando la orden tiene items de clases.
 */
export async function orderHasClassItems(orderId: string) {
  const count = await prisma.orderItem.count({
    where: { orderId, classId: { not: null } },
  });
  return count > 0;
}

export async function markPaid(orderId: string, externalId?: string, raw?: any) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          videoClass: true,
        },
      },
    },
  });

  if (!existingOrder) {
    throw new ApiError(404, "Order not found");
  }

  if (existingOrder.status === "PAID") {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true } },
        items: { include: { product: true, videoClass: true } },
        payments: true,
      },
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    if (externalId) {
      const existingPayment = await tx.payment.findFirst({
        where: {
          provider: order.provider,
          externalId,
        },
      });

      if (!existingPayment) {
        await tx.payment.create({
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
      await tx.payment.create({
        data: {
          orderId,
          provider: order.provider,
          status: "APPROVED",
          externalId: null,
          raw: raw ?? null,
        },
      });
    }

    const items = await tx.orderItem.findMany({
      where: { orderId },
      include: { product: true, videoClass: true },
    });

    const productGrants = items
      .filter((i) => i.productId && !i.product?.isSubscription)
      .map((i) => ({ userId: order.userId, productId: i.productId!, orderId }));

    const classGrants = items
      .filter((i) => i.classId)
      .map((i) => ({ userId: order.userId, classId: i.classId!, orderId }));

    for (const g of productGrants) {
      await tx.accessGrant.upsert({
        where: {
          userId_productId: { userId: g.userId, productId: g.productId },
        },
        create: g,
        update: { orderId: g.orderId },
      });
    }

    for (const g of classGrants) {
      await tx.accessGrant.upsert({
        where: {
          userId_classId: { userId: g.userId, classId: g.classId },
        },
        create: g,
        update: { orderId: g.orderId },
      });
    }

    return tx.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true } },
        items: { include: { product: true, videoClass: true } },
        payments: true,
      },
    });
  });

  return result;
}

export async function grantAccessManual(input: {
  userId?: string;
  email?: string;
  productId: string;
  orderId?: string;
}) {
  const productId = input.productId?.trim();

  if (!productId) {
    throw new ApiError(400, "productId is required");
  }

  if (!input.userId && !input.email) {
    throw new ApiError(400, "userId or email is required");
  }

  const user = input.userId
    ? await prisma.user.findUnique({
        where: { id: input.userId },
      })
    : await prisma.user.findUnique({
        where: { email: input.email!.trim().toLowerCase() },
      });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.isSubscription) {
    throw new ApiError(
      400,
      "This product is a subscription. Use the subscriptions flow."
    );
  }

  let finalOrderId = input.orderId;

  if (finalOrderId) {
    const order = await prisma.order.findUnique({
      where: { id: finalOrderId },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.userId !== user.id) {
      throw new ApiError(400, "Order does not belong to this user");
    }
  } else {
    const unitPrice = Number(product.arPrice ?? 0);

    const manualOrder = await prisma.order.create({
      data: {
        userId: user.id,
        provider: "MERCADOPAGO",
        status: "PAID",
        currency: "ARS",
        totalAmount: Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPrice: Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0,
          },
        },
        payments: {
          create: {
            provider: "MERCADOPAGO",
            status: "APPROVED",
            externalId: null,
            raw: {
              manualGrant: true,
              reason: "Granted manually by admin",
            },
          },
        },
      },
    });

    finalOrderId = manualOrder.id;
  }

 const accessGrant = await prisma.accessGrant.upsert({
  where: {
    userId_productId: {
      userId: user.id,
      productId: product.id,
    },
  },
  create: {
    userId: user.id,
    productId: product.id,
    orderId: finalOrderId,
  },
  update: {
    orderId: finalOrderId,
  },
  include: {
    user: { select: { id: true, email: true } },
    product: true,
  },
});

  return accessGrant;
}
