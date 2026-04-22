import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../common/utils/asyncHandler";
import { validateBody } from "../common/middlewares/validate";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/products.schemas";
import * as productsController from "../controllers/products.controller";
import * as productsService from "../services/products.service";
import { cloudinary } from "../config/cloudinary";

export const productsRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Public products + protected access + admin CRUD
 */

/**
 * @openapi
 * /products/subscriptions/options:
 *   get:
 *     summary: Get subscription product options for admin selects
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
productsRoutes.get(
  "/subscriptions/options",
  authRequired,
  adminOnly,
  asyncHandler(productsController.listSubscriptionOptions)
);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List public products (resourceUrl is hidden)
 *     tags: [Products]
 *     responses:
 *       200: { description: OK }
 */
productsRoutes.get("/", asyncHandler(productsController.list));

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get public product by id (resourceUrl is hidden)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Product not found }
 */
productsRoutes.get("/:id", asyncHandler(productsController.get));

productsRoutes.get(
  "/:id/access",
  authRequired,
  asyncHandler(async (req: any, res) => {
    const userId = req.user.sub;

    const data = await productsService.getAccess(userId, req.params.id);

    res.json({ ok: true, ...data });
  })
);

// ... el resto igual