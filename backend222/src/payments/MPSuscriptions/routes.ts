import { Router } from "express";
import { createSubscription } from "./createSubscription";
import { mercadoPagoWebhook } from "./webhook";
import { cancelSubscription } from "./cancelSubscription";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Subscriptions
 *     description: Gestión de suscripciones con Mercado Pago
 */

/**
 * @swagger
 * /mercadopago_suscription/subscriptions/create:
 *   post:
 *     summary: Crear una suscripción de Mercado Pago
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - payerEmail
 *               - reason
 *               - externalReference
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "clx123abc456"
 *               payerEmail:
 *                 type: string
 *                 example: "cliente@email.com"
 *               reason:
 *                 type: string
 *                 example: "Suscripción Premium Mensual"
 *               externalReference:
 *                 type: string
 *                 example: "user_clx123abc456_plan_premium"
 *               cardTokenId:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               preapprovalPlanId:
 *                 type: string
 *                 nullable: true
 *                 example: "2c938084726fca480172750000000000"
 *               autoRecurring:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   frequency:
 *                     type: integer
 *                     example: 1
 *                   frequency_type:
 *                     type: string
 *                     example: "months"
 *                   transaction_amount:
 *                     type: number
 *                     example: 29.99
 *                   currency_id:
 *                     type: string
 *                     example: "ARS"
 *               backUrl:
 *                 type: string
 *                 example: "https://tu-frontend.com/subscription/success"
 *     responses:
 *       200:
 *         description: Suscripción creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Suscripción creada correctamente"
 *                 content:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "sub_123456"
 *                     externalId:
 *                       type: string
 *                       example: "2c938084726fca480172750000000000"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     initPoint:
 *                       type: string
 *                       nullable: true
 *                       example: "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=..."
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /mercadopago_suscription/subscriptions/webhook:
 *   post:
 *     summary: Webhook de Mercado Pago para suscripciones
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         example: "preapproval"
 *       - in: query
 *         name: data.id
 *         schema:
 *           type: string
 *         required: false
 *         example: "2c938084726fca480172750000000000"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Webhook recibido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Error procesando el webhook
 */

/**
 * @swagger
 * /mercadopago_suscription/subscriptions/{id}/cancel:
 *   put:
 *     summary: Cancelar una suscripción
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID interno de la suscripción
 *         schema:
 *           type: string
 *           example: "clxsub123456"
 *     responses:
 *       200:
 *         description: Suscripción cancelada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Suscripción cancelada correctamente"
 *       404:
 *         description: Suscripción no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post("/create", createSubscription);
router.post("/webhook", mercadoPagoWebhook);
router.put("/:id/cancel", cancelSubscription);

export default router;