import { prisma } from "../../prisma/client";
import { Preference, Payment } from "mercadopago";
import { mpClient } from "./mercadopago";

import { PaymentProvider, PaymentStatus, OrderStatus } from "@prisma/client";
import type { CheckoutItem } from "./mpCheckout.types";

function assertItems(items: any): asserts items is CheckoutItem[] {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items are required and should be a non-empty array.");
  }
}

function normalizeCurrency(items: CheckoutItem[], fallback: string) {
  return items[0]?.currency_id || fallback || "ARS";
}



function normalizeItems(items: CheckoutItem[]) {
  return items.map((i) => {
    const quantity = Number(i.quantity);
    const unitPrice = Number(i.unit_price);

    if (!i.id) {
      throw new Error(`Invalid item id: ${JSON.stringify(i)}`);
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      throw new Error(`Invalid item quantity: ${JSON.stringify(i)}`);
    }

    if (Number.isNaN(unitPrice) || unitPrice <= 0) {
      throw new Error(`Invalid item unit_price: ${JSON.stringify(i)}`);
    }

    return {
      id: String(i.id),
      title: String(i.title || ""),
      quantity,
      unit_price: unitPrice,
      currency_id: i.currency_id,
      description: i.description,
    };
  });
}

function calcTotal(items: CheckoutItem[]) {
  const normalized = normalizeItems(items);

  return normalized.reduce((acc, i) => {
    return acc + i.unit_price * i.quantity;
  }, 0);
}

function buildDebugError(prefix: string, error: any) {
  const enriched = new Error(error?.message || `${prefix} failed`);

  (enriched as any).status =
    error?.status ||
    error?.statusCode ||
    error?.cause?.status ||
    error?.response?.status ||
    400;

  (enriched as any).name = error?.name || "MercadoPagoError";
  (enriched as any).cause = error?.cause || null;
  (enriched as any).response = error?.response || null;
  (enriched as any).details =
    error?.response?.data ||
    error?.cause ||
    error?.body ||
    error ||
    null;

  console.error(`${prefix} FULL ERROR:`, {
    message: error?.message,
    name: error?.name,
    status:
      error?.status ||
      error?.statusCode ||
      error?.cause?.status ||
      error?.response?.status,
    cause: error?.cause,
    response: error?.response,
    responseData: error?.response?.data,
    body: error?.body,
    stack: error?.stack,
    raw: error,
  });

  return enriched;
}

export async function createOrderAndPreference(opts: {
  userId: string;
  items: CheckoutItem[];
  currencyFallback?: string;
}) {
  const { userId, items, currencyFallback } = opts;

  assertItems(items);

  const normalizedItems = normalizeItems(items);
  const currency = normalizeCurrency(normalizedItems, currencyFallback || "ARS");
  const totalAmount = calcTotal(normalizedItems);

  if (Number.isNaN(totalAmount) || totalAmount <= 0) {
    throw new Error("Invalid totalAmount");
  }

  const order = await prisma.order.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      status: OrderStatus.PENDING,
      provider: PaymentProvider.MERCADOPAGO,
      totalAmount,
      currency,
      items: {
        create: normalizedItems.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.unit_price,
        })),
      },
    },
    include: { items: true },
  });

  try {
    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: normalizedItems.map((i) => ({
          title: i.title,
          quantity: i.quantity,
          unit_price: i.unit_price,
          currency_id: i.currency_id || currency,
          description: i.description,
          id: i.id,
        })),
        purpose: "wallet_purchase",
        external_reference: order.id,
        metadata: { orderId: order.id, userId },
      },
    });

    const preferenceId = result.id;

    await prisma.order.update({
      where: { id: order.id },
      data: { providerRef: preferenceId },
    });

    return { orderId: order.id, preferenceId };
  } catch (error: any) {
    throw buildDebugError("MP create preference", error);
  }
}

export async function createPaymentAndSyncOrder(opts: {
  userId: string;
  body: any;
}) {
  const { userId, body } = opts;

  let mpResult: any;

  try {
    const payment = new Payment(mpClient);
    mpResult = await payment.create({ body });
  } catch (error: any) {
    throw buildDebugError("MP create payment", error);
  }

  const mpPaymentId = String(mpResult.id ?? "");
  const mpStatus = String(mpResult.status ?? "");
  const statusDetail = String(mpResult.status_detail ?? "");
  const preferenceId =
    String(
      mpResult?.order?.id ??
        body?.preference_id ??
        body?.preferenceId ??
        ""
    ) || null;

  const orderIdFromRef =
    String(
      mpResult?.external_reference ??
        body?.external_reference ??
        body?.externalReference ??
        ""
    ) || null;

  const order = await prisma.order.findFirst({
    where: {
      userId,
      OR: [
        ...(orderIdFromRef ? [{ id: orderIdFromRef }] : []),
        ...(preferenceId ? [{ providerRef: preferenceId }] : []),
      ],
    },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    const debug = new Error(
      "Order not found for this payment (external_reference/providerRef mismatch)."
    );

    (debug as any).details = {
      userId,
      orderIdFromRef,
      preferenceId,
      mpPaymentId,
      mpStatus,
      body,
      mpResult,
    };

    throw debug;
  }

  const saved = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PaymentProvider.MERCADOPAGO,
      status:
        mpStatus === "approved"
          ? PaymentStatus.APPROVED
          : mpStatus === "rejected"
          ? PaymentStatus.REJECTED
          : PaymentStatus.INITIATED,
      externalId: mpPaymentId || null,
      preferenceId: preferenceId || order.providerRef || null,
      statusDetail,
      paymentMethod: String(mpResult?.payment_method_id ?? ""),
      installments: Number(mpResult?.installments ?? 0) || null,
      amount: Number(mpResult?.transaction_amount ?? order.totalAmount) || null,
      currency: String(mpResult?.currency_id ?? order.currency ?? "ARS"),
      raw: mpResult as any,
    },
  });

  if (mpStatus === "approved") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
      });

      const grantables = order.items.filter(
        (it) => it.product.requiresPremium === true
      );

      for (const it of grantables) {
        await tx.accessGrant.upsert({
          where: { userId_productId: { userId, productId: it.productId } },
          update: { orderId: order.id },
          create: { userId, productId: it.productId, orderId: order.id },
        });
      }
    });
  }

  return {
    orderId: order.id,
    paymentDbId: saved.id,
    mpPaymentId,
    status: mpStatus,
    status_detail: statusDetail,
  };
}