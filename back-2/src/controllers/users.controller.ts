import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as usersService from "../services/users.service";

export async function me(req: AuthedRequest, res: Response) {
  const user = await usersService.getMe(req.user!.id);
  res.json({ ok: true, user });
}

export async function myOrders(req: AuthedRequest, res: Response) {
  const orders = await usersService.getMyOrders(req.user!.id);
  res.json({ ok: true, orders });
}

export async function myPurchases(req: AuthedRequest, res: Response) {
  const purchases = await usersService.getMyPurchases(req.user!.id);
  res.json({ ok: true, purchases });
}

export async function mySubscription(req: AuthedRequest, res: Response) {
  const subscription = await usersService.getMySubscription(req.user!.id);
  res.json({ ok: true, subscription });
}