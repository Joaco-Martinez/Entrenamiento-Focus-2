// payments/MPCheckout/mpCheckout.routes.ts
import { Router } from "express";
import { createPreference } from "./preference.controller";
import { processPayment } from "./payment.controller";
import { authRequired } from "../../common/middlewares/authRequired"; // tu middleware

export const MPCheckoutRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Mercado Pago Checkout
 *     description: Checkout Bricks (preference + process payment) vinculado a Orders/Payments
 */

MPCheckoutRoutes.use(authRequired)

/**
 * @swagger
 * /payments/mp/checkout/create_preference:
 *   post:
 *     summary: Crea Preference en Mercado Pago y crea una Order local (PENDING)
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
 *             example:
 *               value:
 *                 items:
 *                   - id: "a3c4f56d-0b3a-4c74-8a3d-9cfaa0f2a1aa"
 *                     title: "Ebook Premium"
 *                     quantity: 1
 *                     unit_price: 15000
 *                     currency_id: "ARS"
 *                     description: "Acceso al ebook"
 *                 currency: "ARS"
 *     responses:
 *       200:
 *         description: Preference creada + Order creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MPCheckoutCreatePreferenceResponse'
 *       400:
 *         description: Bad Request (items inválidos, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
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
 *     summary: Procesa un pago (Bricks) en Mercado Pago y sincroniza Order/AccessGrants
 *     description: Crea el pago en MP, guarda Payment en DB, y si queda approved marca Order como PAID y crea AccessGrants para productos premium.
 *     tags: [Mercado Pago Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload de Mercado Pago Bricks (se envía tal cual a payment.create)
 *             additionalProperties: true
 *           examples:
 *             bricks:
 *               value:
 *                 transaction_amount: 15000
 *                 token: "CARD_TOKEN_FROM_BRICKS"
 *                 description: "Ebook Premium"
 *                 installments: 1
 *                 payment_method_id: "visa"
 *                 payer:
 *                   email: "buyer@email.com"
 *                 external_reference: "ORDER_ID_UUID_OPTIONAL"
 *                 preference_id: "PREFERENCE_ID_OPTIONAL"
 *     responses:
 *       200:
 *         description: Pago procesado y orden sincronizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MPCheckoutProcessPaymentResponse'
 *       400:
 *         description: Bad Request (Order no encontrada, error MP, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
MPCheckoutRoutes.post("/process_payment", processPayment);

