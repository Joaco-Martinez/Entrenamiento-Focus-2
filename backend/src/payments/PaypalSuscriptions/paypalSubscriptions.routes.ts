import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authRequired } from "../../common/middlewares/authRequired";
import { validateBody } from "../../common/middlewares/validate";
import {
  paypalSubscriptionSchema,
  paypalSubscriptionConfirmSchema,
} from "../../schemas/payments.schemas";
import * as paypalSubscriptionsController from "./paypalSubscriptions.controller";

export const paypalSubscriptionsRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: PayPal Suscription
 *     description: Endpoints dedicados para suscripciones de PayPal
 */

/**
 * @openapi
 * /paypal_suscription/create:
 *   post:
 *     summary: Crear una suscripción de PayPal
 *     tags: [PayPal Suscription]
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
 *               productId:
 *                 type: string
 *                 example: "prod_123"
 *               returnUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "http://localhost:3000/subscription/paypal/return"
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "http://localhost:3000/subscription/paypal/cancel"
 *     responses:
 *       200: { description: Suscripción creada correctamente }
 */
paypalSubscriptionsRoutes.post(
  "/create",
  authRequired,
  validateBody(paypalSubscriptionSchema),
  asyncHandler(paypalSubscriptionsController.createSubscription)
);

/**
 * @openapi
 * /paypal_suscription/confirm:
 *   post:
 *     summary: Confirmar y sincronizar una suscripción luego de aprobar en PayPal
 *     tags: [PayPal Suscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subscriptionId]
 *             properties:
 *               subscriptionId:
 *                 type: string
 *                 example: "I-ABCDEFG12345"
 *     responses:
 *       200: { description: Suscripción sincronizada }
 */
paypalSubscriptionsRoutes.post(
  "/confirm",
  authRequired,
  validateBody(paypalSubscriptionConfirmSchema),
  asyncHandler(paypalSubscriptionsController.confirmSubscription)
);

/**
 * @openapi
 * /paypal_suscription/{subscriptionId}:
 *   get:
 *     summary: Ver detalle de una suscripción en PayPal
 *     tags: [PayPal Suscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Detalle obtenido }
 */
paypalSubscriptionsRoutes.get(
  "/:subscriptionId",
  authRequired,
  asyncHandler(paypalSubscriptionsController.getSubscriptionDetail)
);

/**
 * @openapi
 * /paypal_suscription/webhook:
 *   post:
 *     summary: Webhook de PayPal para eventos de suscripción
 *     tags: [PayPal Suscription]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Evento procesado }
 */
paypalSubscriptionsRoutes.post(
  "/webhook",
  asyncHandler(paypalSubscriptionsController.webhook)
);
