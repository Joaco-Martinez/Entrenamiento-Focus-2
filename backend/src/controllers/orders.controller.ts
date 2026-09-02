import { Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as ordersService from "../services/orders.service";
import { PaymentProvider } from "@prisma/client";

export async function create(req: AuthedRequest, res: Response) {
  const userId = req.user?.id || req.user?.sub;

  if (!userId) {
    return res.status(401).json({
      ok: false,
      message: "Usuario no autenticado",
    });
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
    return res.status(401).json({
      ok: false,
      message: "Usuario no autenticado",
    });
  }

  const orders = await ordersService.getMyOrders(userId);

  return res.json({ ok: true, orders });
}

export async function adminMarkPaid(req: AuthedRequest, res: Response) {
  const { orderId } = req.params;
  const { externalId, raw } = req.body ?? {};

  const order = await ordersService.markPaid(orderId, externalId, {
    ...(raw ?? {}),
    manualAdminApproval: true,
  });

  return res.json({
    ok: true,
    message: "Orden marcada como pagada y accesos otorgados",
    order,
  });
}

export async function adminCancel(req: AuthedRequest, res: Response) {
  const { orderId } = req.params;

  const order = await ordersService.cancelOrder(orderId);

  return res.json({
    ok: true,
    message: "Orden cancelada",
    order,
  });
}

export async function adminGrantAccess(req: AuthedRequest, res: Response) {
  const accessGrant = await ordersService.grantAccessManual({
    userId: req.body.userId,
    email: req.body.email,
    productId: req.body.productId,
    classId: req.body.classId,
    orderId: req.body.orderId,
  });

  return res.status(201).json({
    ok: true,
    message: "Acceso otorgado correctamente",
    accessGrant,
  });
}
