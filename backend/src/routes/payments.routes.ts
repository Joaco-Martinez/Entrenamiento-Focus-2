import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import { authRequired } from "../common/middlewares/authRequired";
import { validateBody } from "../common/middlewares/validate";
import {
  mpPreferenceSchema,
  mpSubscriptionSchema,
  paypalCheckoutSchema,
  paypalSubscriptionSchema,
  paypalCaptureSchema
} from "../schemas/payments.schemas";
import * as paymentsController from "../controllers/payments.controller";

export const paymentsRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: Payments
 *     description: Start checkout (MP/PayPal)
 */

/**
 * @openapi
 * /payments/mercadopago/preference:
 *   post:
 *     summary: Create Mercado Pago preference for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
paymentsRoutes.post(
  "/mercadopago/preference",
  authRequired,
  validateBody(mpPreferenceSchema),
  asyncHandler(paymentsController.mpPreference)
);

/**
 * @openapi
 * /payments/mercadopago/subscription:
 *   post:
 *     summary: Create Mercado Pago subscription (AR only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string }
 *               returnUrl: { type: string, format: uri }
 *               cancelUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
paymentsRoutes.post(
  "/mercadopago/subscription",
  authRequired,
  validateBody(mpSubscriptionSchema),
  asyncHandler(paymentsController.mpSubscription)
);

/**
 * @openapi
 * /payments/paypal/checkout:
 *   post:
 *     summary: Create PayPal checkout order (one-time purchase)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, returnUrl, cancelUrl]
 *             properties:
 *               orderId: { type: string }
 *               returnUrl: { type: string, format: uri }
 *               cancelUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
paymentsRoutes.post(
  "/paypal/checkout",
  authRequired,
  validateBody(paypalCheckoutSchema),
  asyncHandler(paymentsController.paypalCheckout)
);

/**
 * @openapi
 * /payments/paypal/capture:
 *   post:
 *     summary: Capture PayPal checkout order after user approval
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paypalOrderId]
 *             properties:
 *               paypalOrderId: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
paymentsRoutes.post(
  "/paypal/capture",
  authRequired,
  validateBody(paypalCaptureSchema),
  asyncHandler(paymentsController.paypalCapture)
);

/**
 * @openapi
 * /payments/paypal/subscription:
 *   post:
 *     summary: Create PayPal subscription (membership)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, returnUrl, cancelUrl]
 *             properties:
 *               productId: { type: string }
 *               returnUrl: { type: string, format: uri }
 *               cancelUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 */
paymentsRoutes.post(
  "/paypal/subscription",
  authRequired,
  validateBody(paypalSubscriptionSchema),
  asyncHandler(paymentsController.paypalSubscription)
);