import { Router } from "express";
import { createPreference } from "./preference.controller";
import { processPayment } from "./payment.controller";
import { authRequired } from "../../common/middlewares/authRequired";

export const MPCheckoutRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Mercado Pago Checkout
 *   description: Checkout Bricks de Mercado Pago vinculado a órdenes y pagos
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     MPCheckoutItem:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - quantity
 *         - unit_price
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: d29c82f6-5cb5-459a-9ec3-060f5d4df484
 *           description: ID del producto
 *         title:
 *           type: string
 *           example: Ebook Premium
 *         quantity:
 *           type: integer
 *           example: 1
 *         unit_price:
 *           type: number
 *           example: 15000
 *           description: Precio unitario en la moneda indicada
 *         currency_id:
 *           type: string
 *           enum: [ARS, USD]
 *           example: ARS
 *         description:
 *           type: string
 *           example: Acceso al ebook premium
 *
 *     MPCheckoutCreatePreferenceRequest:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MPCheckoutItem'
 *         currency:
 *           type: string
 *           enum: [ARS, USD]
 *           example: ARS
 *
 *     MPCheckoutCreatePreferenceResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         orderId:
 *           type: string
 *           format: uuid
 *           example: 6f7f6e16-9f72-4bdb-a63d-6bdf1d14f6b9
 *         preferenceId:
 *           type: string
 *           example: 1234567890-abcd1234-efgh5678
 *
 *     MPCheckoutProcessPaymentRequest:
 *       type: object
 *       description: Payload enviado por Mercado Pago Bricks al confirmar el pago
 *       additionalProperties: true
 *       properties:
 *         transaction_amount:
 *           type: number
 *           example: 15000
 *         token:
 *           type: string
 *           example: CARD_TOKEN_FROM_BRICKS
 *         description:
 *           type: string
 *           example: Ebook Premium
 *         installments:
 *           type: integer
 *           example: 1
 *         payment_method_id:
 *           type: string
 *           example: visa
 *         payer:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: comprador@email.com
 *         external_reference:
 *           type: string
 *           format: uuid
 *           example: 6f7f6e16-9f72-4bdb-a63d-6bdf1d14f6b9
 *         preference_id:
 *           type: string
 *           example: 1234567890-abcd1234-efgh5678
 *
 *     MPCheckoutProcessPaymentResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         orderId:
 *           type: string
 *           format: uuid
 *           example: 6f7f6e16-9f72-4bdb-a63d-6bdf1d14f6b9
 *         paymentDbId:
 *           type: string
 *           format: uuid
 *           example: 3aa7a445-2759-41d5-a8e1-5d4eb5d2a7b3
 *         mpPaymentId:
 *           type: string
 *           example: 987654321
 *         status:
 *           type: string
 *           example: approved
 *         status_detail:
 *           type: string
 *           example: accredited
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Unauthorized
 */

MPCheckoutRoutes.use(authRequired);

/**
 * @swagger
 * /payments/mp/checkout/create_preference:
 *   post:
 *     summary: Crea una order local y una preference de Mercado Pago
 *     description: |
 *       Usa los items enviados desde el frontend para:
 *       1. Crear una orden local en estado PENDING
 *       2. Crear la preference en Mercado Pago
 *       3. Guardar el preferenceId en la orden
 *     tags: [Mercado Pago Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MPCheckoutCreatePreferenceRequest'
 *           examples:
 *             ejemploARS:
 *               summary: Checkout en pesos argentinos
 *               value:
 *                 items:
 *                   - id: d29c82f6-5cb5-459a-9ec3-060f5d4df484
 *                     title: Ebook Premium
 *                     quantity: 1
 *                     unit_price: 15000
 *                     currency_id: ARS
 *                     description: Acceso al ebook premium
 *                 currency: ARS
 *     responses:
 *       200:
 *         description: Preference creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MPCheckoutCreatePreferenceResponse'
 *       400:
 *         description: Error de validación o error de Mercado Pago
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
MPCheckoutRoutes.post("/create_preference", createPreference);

/**
 * @swagger
 * /payments/mp/checkout/process_payment:
 *   post:
 *     summary: Procesa un pago con Mercado Pago y sincroniza la orden
 *     description: |
 *       Recibe el payload del Brick de Mercado Pago, crea el pago en MP,
 *       guarda el evento de pago en la base de datos y, si el pago fue aprobado,
 *       marca la orden como PAID y crea los access grants para productos premium.
 *     tags: [Mercado Pago Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MPCheckoutProcessPaymentRequest'
 *           examples:
 *             ejemploBricks:
 *               summary: Payload básico de Bricks
 *               value:
 *                 transaction_amount: 15000
 *                 token: CARD_TOKEN_FROM_BRICKS
 *                 description: Ebook Premium
 *                 installments: 1
 *                 payment_method_id: visa
 *                 payer:
 *                   email: comprador@email.com
 *                 external_reference: 6f7f6e16-9f72-4bdb-a63d-6bdf1d14f6b9
 *                 preference_id: 1234567890-abcd1234-efgh5678
 *     responses:
 *       200:
 *         description: Pago procesado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MPCheckoutProcessPaymentResponse'
 *       400:
 *         description: Error de validación, orden no encontrada o error de Mercado Pago
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
MPCheckoutRoutes.post("/process_payment", processPayment);