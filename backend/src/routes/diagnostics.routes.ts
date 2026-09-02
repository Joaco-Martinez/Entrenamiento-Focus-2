import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import * as diagnosticsController from "../controllers/diagnostics.controller";

export const diagnosticsRoutes = Router();

/**
 * @openapi
 * /admin/diagnostics/env:
 *   get:
 *     summary: Estado (presente/ausente) de variables de entorno sensibles en producción
 *     tags: [Diagnostics]
 *     responses:
 *       200: { description: OK }
 */
diagnosticsRoutes.get(
  "/diagnostics/env",
  authRequired,
  adminOnly,
  asyncHandler(diagnosticsController.envStatus)
);
