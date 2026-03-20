import { Router } from "express";
import * as mercadoPagoController from "./mercadoPago.controller";
import { requireArgentinaForMercadoPago } from "./requireArgentinaForMercadoPago";

export const MpRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: MercadoPago
 *     description: Integración de pagos con Mercado Pago
 */

/**
 * @swagger
 * /mercadopago_checkout/mercadopago/process-payment:
 *   post:
 *     summary: Procesar un pago directo
 *     tags: [MercadoPago]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transaction_amount
 *               - token
 *               - description
 *               - installments
 *               - payment_method_id
 *               - payer
 *             properties:
 *               transaction_amount:
 *                 type: number
 *                 example: 15000
 *               token:
 *                 type: string
 *                 example: "123456abcdef"
 *               description:
 *                 type: string
 *                 example: "Compra Agronline"
 *               installments:
 *                 type: number
 *                 example: 1
 *               payment_method_id:
 *                 type: string
 *                 example: "visa"
 *               payer:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "cliente@email.com"
 *     responses:
 *       200:
 *         description: Pago aprobado
 *       400:
 *         description: Error en datos
 *       500:
 *         description: Error servidor
 */
MpRoutes.post(
  "/process-payment",
  requireArgentinaForMercadoPago,
  mercadoPagoController.processPayment
);

/**
 * @swagger
 * /mercadopago_checkout/mercadopago/create-preference:
 *   post:
 *     summary: Crear preferencia de pago (Checkout Pro)
 *     tags: [MercadoPago]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - quantity
 *                     - unit_price
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Producto Agronline"
 *                     quantity:
 *                       type: number
 *                       example: 1
 *                     unit_price:
 *                       type: number
 *                       example: 25000
 *               payer:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "cliente@email.com"
 *               back_urls:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: string
 *                   failure:
 *                     type: string
 *                   pending:
 *                     type: string
 *     responses:
 *       200:
 *         description: Preferencia creada
 *       500:
 *         description: Error servidor
 */
MpRoutes.post(
  "/create-preference",
  requireArgentinaForMercadoPago,
  mercadoPagoController.createPreference
);

/**
 * @swagger
 * /mercadopago_checkout/mercadopago/webhook:
 *   post:
 *     summary: Webhook de Mercado Pago
 *     tags: [MercadoPago]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         example: payment
 *       - in: query
 *         name: data.id
 *         schema:
 *           type: string
 *         example: "123456789"
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Error webhook
 */
MpRoutes.post(
  "/webhook",
  mercadoPagoController.webhook
);