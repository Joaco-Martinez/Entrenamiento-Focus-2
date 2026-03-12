import { Request, Response } from "express";
import * as paypalService from "./paypal.service";
import * as paypalWebhookService from "./paypal.webhook.service";

export async function createCheckout(req: Request, res: Response) {
  const { orderId, returnUrl, cancelUrl } = req.body;

  const data = await paypalService.createPaypalCheckout(
    orderId,
    returnUrl,
    cancelUrl
  );

  return res.json({ ok: true, ...data });
}

export async function captureCheckout(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { paypalOrderId } = req.body;

  const data = await paypalService.capturePaypalCheckout(
    userId,
    paypalOrderId
  );

  return res.json(data);
}

export async function createSubscription(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { productId, returnUrl, cancelUrl } = req.body;

  const data = await paypalService.createPaypalSubscription(
    userId,
    productId,
    returnUrl,
    cancelUrl
  );

  return res.json({ ok: true, ...data });
}

export async function webhook(req: Request, res: Response) {
  const data = await paypalWebhookService.handlePaypalWebhook(
    req.body,
    req.headers
  );

  return res.json(data);
}