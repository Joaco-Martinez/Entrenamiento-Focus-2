import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as ordersService from "../services/orders.service";
import { PaymentProvider } from "@prisma/client";
export async function create(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
  }

  const order = await ordersService.createOrder(
    userId,
    req.body.items,
    req.body.provider as PaymentProvider,
    req.body.country
  );

  return res.status(201).json({ ok: true, order });
}

export async function myOrders(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
  }

  const orders = await ordersService.getMyOrders(userId);
  return res.json({ ok: true, orders });
}