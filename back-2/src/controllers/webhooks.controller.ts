import { Request, Response } from "express";
import * as webhooksService from "../services/webhooks.service";

export async function mercadoPago(req: Request, res: Response) {
  const r = await webhooksService.mercadoPagoWebhook(req.body);
  res.json(r);
}

export async function paypal(req: Request, res: Response) {
  const r = await webhooksService.paypalWebhook(req.body);
  res.json(r);
}