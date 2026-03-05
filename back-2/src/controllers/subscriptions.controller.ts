import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as subsService from "../services/subscriptions.service";

export async function me(req: AuthedRequest, res: Response) {
  const subscription = await subsService.getMe(req.user!.id);
  res.json({ ok: true, subscription });
}

export async function cancel(req: AuthedRequest, res: Response) {
  const subscription = await subsService.cancelByUser(req.user!.id, req.body.cancelAtPeriodEnd);
  res.json({ ok: true, subscription });
}

export async function adminCancel(req: AuthedRequest, res: Response) {
  const subscription = await subsService.adminCancel(req.params.userId);
  res.json({ ok: true, subscription });
}