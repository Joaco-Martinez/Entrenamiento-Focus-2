// payments/MPCheckout/mpCheckout.service.ts
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
  const currency = items[0]?.currency_id || fallback || "ARS";
  return currency;
}

function calcTotal(items: CheckoutItem[]) {
  // OJO: esto suma en “unidad” de unit_price (si son pesos, suma pesos)
  // Si vos usás centavos, mantené coherencia en toda tu app.
  return items.reduce((acc, i) => acc + Number(i.unit_price) * Number(i.quantity), 0);
}

export async function createOrderAndPreference(opts: {
  userId: string;
  items: CheckoutItem[];
  currencyFallback?: string;
}) {
  const { userId, items, currencyFallback } = opts;
  assertItems(items);

  const currency = normalizeCurrency(items, currencyFallback || "ARS");
  const totalAmount = calcTotal(items);

  // 1) DB: Order + Items
  const order = await prisma.order.create({
    data: {
      userId,
      status: OrderStatus.PENDING,
      provider: PaymentProvider.MERCADOPAGO,
      totalAmount,
      currency,
      items: {
        create: items.map((i) => ({
          productId: String(i.id),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unit_price),
        })),
      },
    },
    include: { items: true },
  });

  // 2) MP: Preference
  const preference = new Preference(mpClient);
  const result = await preference.create({
    body: {
      items: items.map((i) => ({
        title: i.title,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        currency_id: i.currency_id || currency,
        description: i.description,
        id: i.id,
      })),
      purpose: "wallet_purchase",

      // CLAVE: enlaza MP ↔ tu Order
      external_reference: order.id,
      // opcional: metadata (MP la guarda)
      metadata: { orderId: order.id, userId },
    },
  });

  const preferenceId = result.id;

  // 3) DB: guardo preferenceId como providerRef
  await prisma.order.update({
    where: { id: order.id },
    data: { providerRef: preferenceId },
  });

  return { orderId: order.id, preferenceId };
}

export async function createPaymentAndSyncOrder(opts: {
  userId: string;
  body: any;
}) {
  const { userId, body } = opts;

  // 1) MP: crear payment
  const payment = new Payment(mpClient);
  const mpResult = await payment.create({ body });

  const mpPaymentId = String(mpResult.id ?? "");
  const mpStatus = String(mpResult.status ?? "");
  const statusDetail = String(mpResult.status_detail ?? "");
  const preferenceId = String((mpResult as any).order?.id ?? (body?.preference_id ?? body?.preferenceId ?? "")) || null;

  // 2) Encontrar order por external_reference (ideal) o por providerRef (fallback)
  const orderIdFromRef =
    String((mpResult as any).external_reference ?? body?.external_reference ?? body?.externalReference ?? "") || null;

  const order = await prisma.order.findFirst({
    where: {
      userId,
      OR: [
        orderIdFromRef ? { id: orderIdFromRef } : undefined,
        preferenceId ? { providerRef: preferenceId } : undefined,
      ].filter(Boolean) as any,
    },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    throw new Error("Order not found for this payment (external_reference/providerRef mismatch).");
  }

  // 3) DB: guardar Payment (evento)
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
      paymentMethod: String((mpResult as any).payment_method_id ?? ""),
      installments: Number((mpResult as any).installments ?? 0) || null,
      amount: Number((mpResult as any).transaction_amount ?? order.totalAmount) || null,
      currency: String((mpResult as any).currency_id ?? order.currency ?? "ARS"),
      raw: mpResult as any,
    },
  });

  // 4) Si approved: Order → PAID + AccessGrants
  if (mpStatus === "approved") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
      });

      // crear access grants SOLO para productos digitales que requieren premium
      const grantables = order.items.filter((it) => it.product.requiresPremium === true);

      for (const it of grantables) {
        // upsert para no chocar con @@unique([userId, productId])
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