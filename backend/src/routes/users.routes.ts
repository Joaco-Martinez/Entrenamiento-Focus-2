import { Router } from "express";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { asyncHandler } from "../common/utils/asyncHandler";
import * as usersController from "../controllers/users.controller";

export const usersRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User dashboard & admin users
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
usersRoutes.get("/me", authRequired, asyncHandler(usersController.me));

/**
 * @openapi
 * /users/me/orders:
 *   get:
 *     summary: Get my orders history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
usersRoutes.get(
  "/me/orders",
  authRequired,
  asyncHandler(usersController.myOrders)
);

/**
 * @openapi
 * /users/me/purchases:
 *   get:
 *     summary: Get my purchased products (access grants)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
usersRoutes.get(
  "/me/purchases",
  authRequired,
  asyncHandler(usersController.myPurchases)
);

/**
 * @openapi
 * /users/me/subscription:
 *   get:
 *     summary: Get my subscription status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
usersRoutes.get(
  "/me/subscription",
  authRequired,
  asyncHandler(usersController.mySubscription)
);

/**
 * @openapi
 * /users/admin/users:
 *   get:
 *     summary: Admin - list users with subscription
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by email, firstName or lastName
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
usersRoutes.get(
  "/admin/users",
  authRequired,
  adminOnly,
  asyncHandler(usersController.adminUsers)
);

/**
 * @openapi
 * /users/admin/users/{id}:
 *   get:
 *     summary: Admin - user detail (orders + purchases + subscription)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 *       404: { description: User not found }
 */
usersRoutes.get(
  "/admin/users/:id",
  authRequired,
  adminOnly,
  asyncHandler(usersController.adminUserDetail)
);

/**
 * @openapi
 * /users/admin/users/{id}/subscription:
 *   delete:
 *     summary: Admin - unlink a user's subscription from the account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Subscription unlinked }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 *       404: { description: User or subscription not found }
 */
usersRoutes.delete(
  "/admin/users/:id/subscription",
  authRequired,
  adminOnly,
  asyncHandler(usersController.unlinkUserSubscription)
);