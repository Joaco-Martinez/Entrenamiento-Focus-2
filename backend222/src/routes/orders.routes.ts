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
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Purchases / orders
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create order (PENDING)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [productId]
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Missing/invalid token }
 */
ordersRoutes.post(
  "/",
  authRequired,
  validateBody(createOrderSchema),
  asyncHandler(ordersController.create)
);

/**
 * @openapi
 * /orders/me:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
ordersRoutes.get("/me", authRequired, asyncHandler(ordersController.myOrders));

/**
 * @openapi
 * /orders/admin/orders:
 *   get:
 *     summary: Admin - list orders (optional status filter)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, CANCELLED, REFUNDED]
 *         required: false
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
ordersRoutes.get(
  "/admin/orders",
  authRequired,
  adminOnly,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status ?? "");
    const orders = await ordersService.adminList(status || undefined);
    res.json({ ok: true, orders });
  })
);