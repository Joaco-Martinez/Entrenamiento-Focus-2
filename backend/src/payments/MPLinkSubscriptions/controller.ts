import { Request, Response } from "express";
import { AuthedRequest } from "../../common/middlewares/authRequired";
import * as service from "./service";

export async function createMercadoPagoLinkIntentController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const userId = req.user?.id || req.user?.sub;
    const email = req.user?.email || req.body?.email;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "No autenticado",
      });
    }

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "No se pudo resolver el email del usuario",
      });
    }

    const result = await service.createMercadoPagoLinkIntent({
      userId,
      email,
      productId: req.body?.productId ?? null,
      checkoutUrl: req.body?.checkoutUrl,
      planId: req.body?.planId,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({
      ok: false,
      message: error?.message || "Error creando intent",
    });
  }
}

export async function mercadoPagoLinkWebhookController(
  req: Request,
  res: Response
) {
  try {
    const result = await service.processMercadoPagoLinkWebhook(
      req.body,
      req.query
    );

    return res.status(200).json({
      ok: true,
      result,
    });
  } catch (error: any) {
    console.error("MP link webhook error:", error);

    return res.status(200).json({
      ok: false,
      message: error?.message || "Webhook procesado con error",
    });
  }
}

export async function getMyMercadoPagoLinkSubscriptionController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "No autenticado",
      });
    }

    const data = await service.getMyMercadoPagoLinkSubscription(userId);

    return res.json({
      ok: true,
      ...data,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message || "Error obteniendo estado de suscripción",
    });
  }
}