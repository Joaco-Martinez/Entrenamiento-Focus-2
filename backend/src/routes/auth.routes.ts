import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import { authLimiter } from "../common/middlewares/rateLimit";
import { validateBody } from "../common/middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schemas";
import * as authController from "../controllers/auth.controller";
import { authRequired } from "../common/middlewares/authRequired";

export const authRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@mail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               firstName:
 *                 type: string
 *                 example: "Joaco"
 *               lastName:
 *                 type: string
 *                 example: "Martinez"
 *               country:
 *                 type: string
 *                 example: "AR"
 *     responses:
 *       201:
 *         description: Created
 *       409:
 *         description: Email already in use
 */
authRoutes.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@mail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Invalid credentials
 */
authRoutes.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Send reset password code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@mail.com"
 *     responses:
 *       200:
 *         description: Recovery code sent if the account exists
 */
authRoutes.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with email and code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@mail.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "NuevaPassword123"
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid code or expired code
 */
authRoutes.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
authRoutes.get("/me", authRequired, asyncHandler(authController.me));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRoutes.post("/logout", asyncHandler(authController.logout));