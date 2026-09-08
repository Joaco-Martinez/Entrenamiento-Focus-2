import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { asyncHandler } from "../common/utils/asyncHandler";
import { ApiError } from "../common/errors/ApiError";
import * as usersController from "../controllers/users.controller";

export const usersRoutes = Router();

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB: generoso para una foto de celular

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
      return cb(new ApiError(400, "Formato de imagen no soportado"));
    }
    cb(null, true);
  },
});

// Normaliza los errores de multer (ej. archivo demasiado pesado) a mensajes
// claros en vez del genérico "File too large" en inglés.
function handleAvatarUpload(req: Request, res: Response, next: NextFunction) {
  avatarUpload.single("avatar")(req, res, (err: any) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "La imagen es demasiado pesada (máximo 5MB)."));
    }
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(400, "No se pudo procesar la imagen."));
  });
}

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
 * /users/me/avatar:
 *   post:
 *     summary: Upload/replace the current user's profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: OK }
 *       400: { description: Missing/invalid image }
 *       401: { description: Missing/invalid token }
 */
usersRoutes.post(
  "/me/avatar",
  authRequired,
  handleAvatarUpload,
  asyncHandler(usersController.uploadAvatar)
);

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

/**
 * @openapi
 * /users/admin/users/{id}/impersonate:
 *   post:
 *     summary: Admin - impersonate a user
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
 *       200: { description: Impersonation started }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 *       404: { description: User not found }
 */
usersRoutes.post(
  "/admin/users/:id/impersonate",
  authRequired,
  adminOnly,
  asyncHandler(usersController.impersonateUser)
);