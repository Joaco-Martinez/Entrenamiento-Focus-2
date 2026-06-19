import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { validateBody } from "../common/middlewares/validate";
import { createOrderSchema } from "../schemas/orders.schemas";
import * as ordersController from "../controllers/orders.controller";
import * as ordersService from "../services/orders.service";

export const ordersRoutes = Router();

/**
 * USER
 */

ordersRoutes.post(
  "/",
  authRequired,
  validateBody(createOrderSchema),
  asyncHandler(ordersController.create)
);

ordersRoutes.get(
  "/me",
  authRequired,
  asyncHandler(ordersController.myOrders)
);

/**
 * ADMIN
 */

ordersRoutes.get(
  "/admin/orders",
  authRequired,
  adminOnly,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status ?? "");
    const orders = await ordersService.adminList(status || undefined);

    res.json({
      ok: true,
      orders,
    });
  })
);

ordersRoutes.patch(
  "/admin/orders/:orderId/mark-paid",
  authRequired,
  adminOnly,
  asyncHandler(ordersController.adminMarkPaid)
);

ordersRoutes.post(
  "/admin/access-grants",
  authRequired,
  adminOnly,
  asyncHandler(ordersController.adminGrantAccess)
);
