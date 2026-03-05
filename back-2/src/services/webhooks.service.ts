import axios from "axios";
import { prisma } from "../../prisma/client";
import { env } from "../config/env";
import { ApiError } from "../common/errors/ApiError";
import * as ordersService from "./orders.service";

export async function mercadoPagoWebhook(body: any) {
  // MP manda diferentes formatos. Normalizamos:
  const paymentId = body?.data?.id ?? body?.id ?? body?.resource?.split("/")?.pop();
  if (!paymentId) return { ok: true };

  if (!env.MP_ACCESS_TOKEN) throw new ApiError(400, "MP env missing");

  const r = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
  });

  const mpPayment = r.data;
  const status = mpPayment.status; // approved / rejected / etc
  const preferenceId = mpPayment?.order?.id ?? mpPayment?.metadata?.orderId ?? null;

  // Si guardaste providerRef como preferenceId, podés buscar por providerRef
  const order = await prisma.order.findFirst({
    where: { provider: "MERCADOPAGO", providerRef: String(mpPayment?.order?.id ?? mpPayment?.metadata?.preferenceId ?? "") }
  });

  // Si no lo encontrás por providerRef, probá por metadata.orderId
  const order2 = !order && mpPayment?.metadata?.orderId
    ? await prisma.order.findUnique({ where: { id: String(mpPayment.metadata.orderId) } })
    : null;

  const target = order ?? order2;
  if (!target) return { ok: true };

  // guardamos payment raw siempre
  await prisma.payment.upsert({
    where: { externalId: String(paymentId) },
    create: { orderId: target.id, provider: "MERCADOPAGO", status: "INITIATED", externalId: String(paymentId), raw: mpPayment },
    update: { raw: mpPayment }
  });

  if (status === "approved") {
    await ordersService.markPaid(target.id, String(paymentId), mpPayment);
  }

  return { ok: true };
}

export async function paypalWebhook(body: any) {
  const eventType = body?.event_type;
  const resource = body?.resource;

  // Guardamos log mínimo:
  // (si querés, podés crear tabla EventLog. Por ahora lo metemos en Payment.raw cuando aplica)

  // 1) Checkout order captured => PAID
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id;
    if (!paypalOrderId) return { ok: true };

    const order = await prisma.order.findFirst({ where: { provider: "PAYPAL", providerRef: String(paypalOrderId) } });
    if (!order) return { ok: true };

    await prisma.payment.upsert({
      where: { externalId: String(resource?.id ?? paypalOrderId) },
      create: { orderId: order.id, provider: "PAYPAL", status: "APPROVED", externalId: String(resource?.id ?? paypalOrderId), raw: body },
      update: { status: "APPROVED", raw: body }
    });

    await ordersService.markPaid(order.id, String(resource?.id ?? paypalOrderId), body);
    return { ok: true };
  }

  // 2) Subscriptions events
  // Estos eventos pueden variar. Guardamos estado usando resource.status cuando existe.
  const subId = resource?.id;
  const userId = resource?.custom_id; // si vos lo seteás al crear la subscription (recomendado)
  if (subId && (eventType?.includes("BILLING.SUBSCRIPTION") || eventType?.includes("BILLING.SUBSCRIPTION"))) {
    // sin custom_id no sabemos a qué user. Para producción: guardar mapping subId->userId al crearla.
    // Por ahora solo retornamos ok.
    return { ok: true };
  }

  return { ok: true };
}