import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authRequired } from "../../common/middlewares/authRequired";
import { validateBody } from "../../common/middlewares/validate";
import {
  paypalCheckoutSchema,
  paypalCaptureSchema,
  paypalSubscriptionSchema,
} from "../../schemas/payments.schemas";
import * as paypalController from "./paypal.controller";

export const paypalRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: PayPal
 *     description: PayPal checkout, capture, subscriptions and webhook
 */

/**
 * @openapi
 * /payments/paypal/checkout:
 *   post:
 *     summary: Crear checkout de PayPal para una orden
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - returnUrl
 *               - cancelUrl
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "8b7d6a5c-1234-4fd1-9d10-abc123456789"
 *               returnUrl:
 *                 type: string
 *                 example: "http://localhost:3001/checkout/paypal/return"
 *               cancelUrl:
 *                 type: string
 *                 example: "http://localhost:3001/checkout/paypal/cancel"
 *     responses:
 *       200:
 *         description: Checkout creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 orderId:
 *                   type: string
 *                   example: "5O190127TN364715T"
 *                 approveUrl:
 *                   type: string
 *                   example: "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Orden no encontrada
 */
paypalRoutes.post(
  "/checkout",
  authRequired,
  validateBody(paypalCheckoutSchema),
  asyncHandler(paypalController.createCheckout)
);

/**
 * @openapi
 * /payments/paypal/capture:
 *   post:
 *     summary: Capturar una orden aprobada de PayPal
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paypalOrderId
 *             properties:
 *               paypalOrderId:
 *                 type: string
 *                 example: "5O190127TN364715T"
 *     responses:
 *       200:
 *         description: Pago capturado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: "COMPLETED"
 *                 alreadyPaid:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Orden no encontrada
 */
paypalRoutes.post(
  "/capture",
  authRequired,
  validateBody(paypalCaptureSchema),
  asyncHandler(paypalController.captureCheckout)
);

/**
 * @openapi
 * /payments/paypal/subscription:
 *   post:
 *     summary: Crear suscripción de PayPal para un producto
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - returnUrl
 *               - cancelUrl
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "prod_123456"
 *               returnUrl:
 *                 type: string
 *                 example: "http://localhost:3001/subscription/paypal/return"
 *               cancelUrl:
 *                 type: string
 *                 example: "http://localhost:3001/subscription/paypal/cancel"
 *     responses:
 *       200:
 *         description: Suscripción creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "I-BW452GLLEP1G"
 *                 approveUrl:
 *                   type: string
 *                   example: "https://www.sandbox.paypal.com/webapps/billing/subscriptions?ba_token=BA-123"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Producto no encontrado
 */
paypalRoutes.post(
  "/subscription",
  authRequired,
  validateBody(paypalSubscriptionSchema),
  asyncHandler(paypalController.createSubscription)
);

/**
 * @openapi
 * /payments/paypal/webhook:
 *   post:
 *     summary: Webhook de PayPal
 *     tags: [PayPal]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook procesado correctamente
 *       400:
 *         description: Firma inválida o payload inválido
 */
paypalRoutes.post("/webhook", asyncHandler(paypalController.webhook));