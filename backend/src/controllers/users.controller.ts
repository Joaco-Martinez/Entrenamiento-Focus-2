import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as usersService from "../services/users.service";

export async function me(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }

  const user = await usersService.getMe(userId);
  return res.json({ ok: true, user });
}

export async function myOrders(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }

  const orders = await usersService.getMyOrders(userId);
  return res.json({ ok: true, orders });
}

export async function myPurchases(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }

  const purchases = await usersService.getMyPurchases(userId);
  return res.json({ ok: true, purchases });
}

export async function mySubscription(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }

  const subscription = await usersService.getMySubscription(userId);
  return res.json({ ok: true, subscription });
}

/* =========================
   ADMIN
========================= */

export async function adminUsers(req: AuthedRequest, res: Response) {
  const q = String(req.query.q ?? "").trim();
  const users = await usersService.getAdminUsers(q);
  return res.json({ ok: true, users });
}

export async function adminUserDetail(req: AuthedRequest, res: Response) {
  const id = req.params.id;
  const user = await usersService.getAdminUserDetail(id);
  return res.json({ ok: true, user });
}

export async function unlinkUserSubscription(req: AuthedRequest, res: Response) {
  const id = req.params.id;
  const result = await usersService.unlinkUserSubscriptionByAdmin(id);

  return res.json({
    ok: true,
    message: "Suscripción desvinculada correctamente",
    ...result,
  });
}