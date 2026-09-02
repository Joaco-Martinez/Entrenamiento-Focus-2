import axios from "axios";
import { prisma } from "../../prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../common/errors/ApiError";
import * as ordersService from "../../services/orders.service";
import { paypalAccessToken, capturePaypalOrder } from "./paypal.client";

function requireUrl(name: string, value: string) {
  if (!value) throw new ApiError(400, `Missing ${name}`);
  if (!/^https?:\/\//i.test(value)) {
    throw new ApiError(400, `${name} must be a valid URL`);
  }
  return value;
}

export async function createPaypalCheckout(
  orderId: string,
  returnUrl: string,
  cancelUrl: string
) {
  requireUrl("returnUrl", returnUrl);
  requireUrl("cancelUrl", cancelUrl);

  const order = await prisma.order.findUnique({
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

  if (!order) throw new ApiError(404, "Order not found");
  if (order.provider !== "PAYPAL") {
    throw new ApiError(400, "Order provider must be PAYPAL");
  }

  const token = await paypalAccessToken();

  const total = Number(order.totalAmount);
  if (!Number.isFinite(total) || total <= 0) {
    throw new ApiError(400, "Invalid totalAmount");
  }

  const items = order.items.map((item) => {
    const name = item.product?.title ?? item.videoClass?.title ?? "Item";
    const description = item.product?.description ?? undefined;
    const sku = item.product?.id ?? item.videoClass?.id ?? item.id;

    return {
      name,
      description,
      sku,
      quantity: String(item.quantity),
      unit_amount: {
        currency_code: order.currency,
        value: Number(item.unitPrice).toFixed(2),
      },
      category: "DIGITAL_GOODS",
    };
  });

  const response = await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          experience_context: {
            user_action: "PAY_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
      purchase_units: [
        {
          reference_id: order.id,
          invoice_id: order.id,
          amount: {
            currency_code: order.currency,
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: order.currency,
                value: total.toFixed(2),
              },
            },
          },
          items,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  await prisma.order.update({
    where: { id: order.id },
    data: {
      providerRef: String(response.data.id),
    },
  });

  const approveUrl =
    response.data.links?.find((l: any) => l.rel === "payer-action")?.href ??
    response.data.links?.find((l: any) => l.rel === "approve")?.href;

  return {
    orderId: String(response.data.id),
    approveUrl,
  };
}

export async function capturePaypalCheckout(
  userId: string,
  paypalOrderId: string
) {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      provider: "PAYPAL",
      providerRef: paypalOrderId,
    },
  });

  if (!order) throw new ApiError(404, "Order not found");

  if (order.status === "PAID") {
    return {
      ok: true,
      alreadyPaid: true,
    };
  }

  const data = await capturePaypalOrder(paypalOrderId);

  const captureId =
    data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;

  // El navegador solo nos dice qué orden capturar. La verdad sobre si el pago
  // se completó sale de la respuesta de PayPal a la captura en sí (server a
  // server, con el access token del servidor) — no de nada que el cliente
  // pueda manipular. Por eso es seguro otorgar acceso acá también para
  // clases: markPaid es idempotente, así que si después llega el webhook
  // PAYMENT.CAPTURE.COMPLETED, o esta ruta se llama dos veces, no duplica nada.
  if (data.status === "COMPLETED") {
    await ordersService.markPaid(order.id, String(captureId), data);
  }

  return {
    ok: true,
    status: data.status,
    raw: data,
  };
}

export async function createPaypalSubscription(
  userId: string,
  productId: string,
  returnUrl: string,
  cancelUrl: string
) {
  requireUrl("returnUrl", returnUrl);
  requireUrl("cancelUrl", cancelUrl);

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new ApiError(404, "Product not found");
  if (!product.isSubscription) {
    throw new ApiError(400, "Product is not a subscription");
  }
  if (!product.paypalPlanId) {
    throw new ApiError(400, "Product missing paypalPlanId");
  }

  const token = await paypalAccessToken();

  const response = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/billing/subscriptions`,
    {
      plan_id: product.paypalPlanId,
      custom_id: `${userId}:${productId}`,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const approveUrl =
    response.data.links?.find((l: any) => l.rel === "approve")?.href ?? null;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      provider: "PAYPAL",
      status: "PAST_DUE",
      externalId: String(response.data.id),
      cancelAtPeriodEnd: false,
    },
    update: {
      provider: "PAYPAL",
      externalId: String(response.data.id),
    },
  });

  return {
    id: String(response.data.id),
    approveUrl,
  };
}