import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as subsService from "../services/subscriptions.service";

export async function me(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }

  const subscription = await subsService.getMe(userId);
  return res.json({ ok: true, subscription });
}

export async function cancel(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }

  const subscription = await subsService.cancelByUser(
    userId,
    req.body.cancelAtPeriodEnd
  );

  return res.json({ ok: true, subscription });
}

export async function adminCancel(req: AuthedRequest, res: Response) {
  const subscription = await subsService.adminCancel(req.params.userId);
  return res.json({ ok: true, subscription });
}

export async function getAll(req: AuthedRequest, res: Response) {
  const subscriptions = await subsService.getAll();

  return res.json({
    ok: true,
    subscriptions,
  });
}