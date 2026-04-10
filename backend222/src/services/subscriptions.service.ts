import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import axios from "axios";
import { env } from "../config/env";

async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(400, "PayPal env missing");
  }
  const basic = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const r = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return r.data.access_token as string;
}

async function cancelAtProvider(sub: { provider: any; externalId: string | null }, reason: string) {
  if (!sub.externalId) return;

  if (sub.provider === "PAYPAL") {
    const token = await paypalAccessToken();
    await axios.post(
      `${env.PAYPAL_BASE_URL}/v1/billing/subscriptions/${sub.externalId}/cancel`,
      { reason },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return;
  }

  if (sub.provider === "MERCADOPAGO") {
    if (!env.MP_ACCESS_TOKEN) throw new ApiError(400, "MP env missing");
    // MP: update preapproval status
    await axios.put(
      `https://api.mercadopago.com/preapproval/${sub.externalId}`,
      { status: "cancelled" },
      { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } }
    );
  }
}

export async function getMe(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function cancelByUser(userId: string, cancelAtPeriodEnd: boolean) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new ApiError(404, "No subscription");

  // Si el usuario quiere cancelar YA, cancelamos en el proveedor
  if (!cancelAtPeriodEnd) {
    await cancelAtProvider(sub, "User requested cancellation");
  }

  // Para cancelAtPeriodEnd (si tu plan soporta), dejamos el flag en DB.
  // Nota: PayPal soporta "cancel" inmediato. MP idem. Si querés "al final del período",
  // necesitás lógica de scheduler. Por ahora: flag + status ACTIVE.
  const updated = await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd, status: cancelAtPeriodEnd ? "ACTIVE" : "CANCELLED" }
  });

  return updated;
}

export async function adminCancel(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new ApiError(404, "No subscription");

  await cancelAtProvider(sub, "Admin cancellation");

  return prisma.subscription.update({
    where: { userId },
    data: { status: "CANCELLED", cancelAtPeriodEnd: false }
  });
}