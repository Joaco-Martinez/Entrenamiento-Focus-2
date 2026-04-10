import { Request, Response } from "express";
import * as webhooksService from "../services/webhooks.service";
import { processMercadoPagoLinkWebhook } from "../payments/MPLinkSubscriptions/service";
export async function mercadoPago(req: Request, res: Response) {
  try {
    const eventType =
      String(req.query?.type || req.body?.type || "").toLowerCase();

    // NUEVO FLUJO DE SUSCRIPCIONES CON LINK GENÉRICO
    if (
      eventType === "subscription_preapproval" ||
      eventType.includes("preapproval") ||
      eventType.includes("subscription")
    ) {
      const result = await processMercadoPagoLinkWebhook(req.body, req.query);

      return res.status(200).json({
        ok: true,
        source: "mp-link-subscription-flow",
        result,
      });
    }

    // Si no querés procesar payments acá, ignoralo sin romper
    if (eventType === "payment") {
      return res.status(200).json({
        ok: true,
        ignored: true,
        reason: "payment event ignored",
      });
    }

    // Si querés dejar otros eventos ignorados
    return res.status(200).json({
      ok: true,
      ignored: true,
      reason: `Unhandled event type: ${eventType}`,
    });

    // Si querés mantener lógica vieja para otros casos:
    // const result = await oldMercadoPagoWebhook(req.body, req.query);
    // return res.status(200).json(result);
  } catch (error: any) {
    console.error("Webhook /webhooks/mercadopago error:", error);

    return res.status(200).json({
      ok: false,
      message: error?.message || "Webhook processed with error",
    });
  }
}

export async function paypal(req: Request, res: Response) {
  const r = await webhooksService.paypalWebhook(req.body, req.headers);
  res.json(r);
}