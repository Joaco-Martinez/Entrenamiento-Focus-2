import { Request, Response } from "express";
import * as webhooksService from "../services/webhooks.service";
import { processMercadoPagoLinkWebhook } from "../payments/MPLinkSubscriptions/service";
import { processWebhook as processMercadoPagoCheckoutWebhook } from "../payments/MPCheckout/mercadoPago.service";

/**
 * Ruta histórica de webhook de MP. Mercado Pago puede tener guardada esta URL
 * (por MP_NOTIFICATION_URL mal configurada, o por notification_url de
 * preferencias viejas) en vez de /mercadopago_checkout/webhook, que es la que
 * usa el flujo activo de checkout/clases. Para no depender de que esa
 * variable esté bien seteada en producción, cualquier evento de pago que
 * llegue acá se procesa con el MISMO manejador que la ruta nueva
 * (mercadoPago.service.processWebhook), así el resultado es idéntico sin
 * importar a cuál de las dos URLs le pegue Mercado Pago.
 */
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

    // Pagos únicos (compras de productos/clases): delegamos al mismo
    // manejador que usa /mercadopago_checkout/webhook. processWebhook ya
    // valida la firma y es un no-op silencioso si el evento no es "payment",
    // así que es seguro reenviar acá cualquier cosa que no sea suscripción.
    await processMercadoPagoCheckoutWebhook(req.body, req.query, req.headers);

    return res.status(200).json({
      ok: true,
      source: "mp-checkout-webhook-via-legacy-route",
    });
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