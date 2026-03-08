import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as ordersService from "../services/orders.service";
import { getMyOrders } from "../services/orders.service";


export async function create(req: AuthedRequest, res: Response) {
  const order = await ordersService.createOrder(req.user!.id, req.body.items);
  res.status(201).json({ ok: true, order });
}

export async function myOrders(req: AuthedRequest, res: Response) {
  const orders = await ordersService.getMyOrders(req.user!.id);
  res.json({ ok: true, orders });
}