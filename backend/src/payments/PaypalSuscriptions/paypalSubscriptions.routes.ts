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
 */
paypalSubscriptionsRoutes.post(
  "/confirm",
  authRequired,
  validateBody(paypalSubscriptionConfirmSchema),
  asyncHandler(paypalSubscriptionsController.confirmSubscription)
);

/**
 * @openapi
 * /paypal_suscription/verify-success/{subscriptionId}:
 *   get:
 *     summary: Verifica desde la página success si la suscripción quedó activa
 *     tags: [PayPal Suscription]
 *     security:
 *       - bearerAuth: []
 */
paypalSubscriptionsRoutes.get(
  "/verify-success/:subscriptionId",
  authRequired,
  asyncHandler(paypalSubscriptionsController.verifySuccess)
);

/**
 * @openapi
 * /paypal_suscription/{subscriptionId}:
 *   get:
 *     summary: Ver detalle de una suscripción en PayPal
 *     tags: [PayPal Suscription]
 *     security:
 *       - bearerAuth: []
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
 */
paypalSubscriptionsRoutes.post(
  "/webhook",
  asyncHandler(paypalSubscriptionsController.webhook)
);
