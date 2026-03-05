import { Router } from "express";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { asyncHandler } from "../common/utils/asyncHandler";
import { prisma } from "../../prisma/client";
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
usersRoutes.get("/me/orders", authRequired, asyncHandler(usersController.myOrders));

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
usersRoutes.get("/me/purchases", authRequired, asyncHandler(usersController.myPurchases));

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
 * ADMIN
 */

/**
 * @openapi
 * /users/admin/users:
 *   get:
 *     summary: Admin - list users (optional search)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         required: false
 *         description: Search by email/firstName/lastName
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
usersRoutes.get(
  "/admin/users",
  authRequired,
  adminOnly,
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "");
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } }
            ]
          }
        : {},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        country: true,
        createdAt: true
      }
    });
    res.json({ ok: true, users });
  })
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
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
usersRoutes.get(
  "/admin/users/:id",
  authRequired,
  adminOnly,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        accessGrants: { include: { product: true } },
        orders: {
          include: { items: { include: { product: true } }, payments: true }
        }
      }
    });
    res.json({ ok: true, user });
  })
);