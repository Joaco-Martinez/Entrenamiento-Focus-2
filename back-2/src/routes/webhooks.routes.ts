import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import * as webhooksController from "../controllers/webhooks.controller";

export const webhooksRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: Webhooks
 *     description: Provider webhooks (MP/PayPal)
 */

/**
 * @openapi
 * /webhooks/mercadopago:
 *   post:
 *     summary: Mercado Pago webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 */
webhooksRoutes.post("/mercadopago", asyncHandler(webhooksController.mercadoPago));

/**
 * @openapi
 * /webhooks/paypal:
 *   post:
 *     summary: PayPal webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 */
webhooksRoutes.post("/paypal", asyncHandler(webhooksController.paypal));