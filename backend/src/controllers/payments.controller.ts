import { Request, Response } from "express";
import * as paymentsService from "../services/payments.service";

export async function mpPreference(req: Request, res: Response) {
  const r = await paymentsService.createMercadoPagoPreference(req.body.orderId);
  res.json({ ok: true, ...r });
}

export async function mpSubscription(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const r = await paymentsService.mercadoPagoCreateSubscription(
    userId,
    req.body.productId,
    req.body.returnUrl,
    req.body.cancelUrl
  );
  res.json({ ok: true, ...r });
}

export async function paypalCheckout(req: Request, res: Response) {
  const r = await paymentsService.paypalCreateCheckout(req.body.orderId, req.body.returnUrl, req.body.cancelUrl);
  res.json({ ok: true, ...r });
}

export async function paypalCapture(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const r = await paymentsService.paypalCaptureCheckout(userId, req.body.paypalOrderId);
  res.json({ ok: true, ...r });
}

export async function paypalSubscription(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const r = await paymentsService.paypalCreateSubscription(userId, req.body.productId, req.body.returnUrl, req.body.cancelUrl);
  res.json({ ok: true, ...r });
}