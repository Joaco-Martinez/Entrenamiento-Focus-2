import { Router } from "express";
export const healthRoutes = Router();

/**
 * @openapi
 * tags:
 *   - name: Health
 *     description: Health check
 */

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 */
healthRoutes.get("/", (_req, res) => res.json({ ok: true }));