import { Request, Response } from "express";
import * as paypalSubscriptionsService from "./paypalSubscriptions.service";

export async function createSubscription(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { productId, returnUrl, cancelUrl } = req.body;

  const data = await paypalSubscriptionsService.createPaypalSubscription(
    userId,
    productId,
    returnUrl,
    cancelUrl
  );

  return res.json({ ok: true, ...data });
}

export async function confirmSubscription(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { subscriptionId } = req.body;

  const data = await paypalSubscriptionsService.syncPaypalSubscriptionForUser(
    userId,
    subscriptionId
  );

  return res.json({ ok: true, ...data });
}

export async function verifySuccess(req: Request, res: Response) {
  const userId = req.user!.sub;
  const subscriptionId = String(
    req.params.subscriptionId || req.query.subscription_id || req.query.subscriptionId || ""
  );

  const data = await paypalSubscriptionsService.verifyPaypalSuccessForUser(
    userId,
    subscriptionId
  );

  return res.json(data);
}

export async function getSubscriptionDetail(req: Request, res: Response) {
  const data = await paypalSubscriptionsService.fetchPaypalSubscription(
    req.params.subscriptionId
  );

  return res.json({ ok: true, subscription: data });
}

export async function webhook(req: Request, res: Response) {
  const data = await paypalSubscriptionsService.handlePaypalSubscriptionWebhook(
    req.body,
    req.headers
  );

  return res.json(data);
}
