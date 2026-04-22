import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { validateBody } from "../common/middlewares/validate";
import { cancelSubscriptionSchema } from "../schemas/subscriptions.schemas";
import * as subsController from "../controllers/subscriptions.controller";

export const subscriptionsRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: Subscriptions
 *     description: Membership management
 */

/**
 * @openapi
 * /subscriptions/me:
 *   get:
 *     summary: Get my subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
subscriptionsRoutes.get("/me", authRequired, asyncHandler(subsController.me));

/**
 * @openapi
 * /subscriptions/cancel:
 *   post:
 *     summary: Cancel my subscription (cancelAtPeriodEnd)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelAtPeriodEnd: { type: boolean, example: true }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
subscriptionsRoutes.post(
  "/cancel",
  authRequired,
  validateBody(cancelSubscriptionSchema),
  asyncHandler(subsController.cancel)
);

/**
 * @openapi
 * /subscriptions/admin/{userId}/cancel:
 *   post:
 *     summary: Admin - cancel a user subscription immediately
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
subscriptionsRoutes.post(
  "/admin/:userId/cancel",
  authRequired,
  adminOnly,
  asyncHandler(subsController.adminCancel)
);

/**
 * @openapi
 * /subscriptions/admin:
 *   get:
 *     summary: Get all subscriptions (admin)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
subscriptionsRoutes.get(
  "/admin",
  authRequired,
  adminOnly,
  asyncHandler(subsController.getAll)
);

