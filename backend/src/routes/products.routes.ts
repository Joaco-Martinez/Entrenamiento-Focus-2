import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../common/utils/asyncHandler";
import { validateBody } from "../common/middlewares/validate";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { createProductSchema, updateProductSchema } from "../schemas/products.schemas";
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

/**
 * @openapi
 * /products/{id}/access:
 *   get:
 *     summary: Get protected resourceUrl if the user has access
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: No access }
 *       404: { description: Product/resource not found }
 */
productsRoutes.get(
  "/:id/access",
  authRequired,
  asyncHandler(async (req: any, res) => {
    const userId = req.user.sub; // 🔥 FIX CLAVE

    const data = await productsService.getAccess(userId, req.params.id);

    res.json({ ok: true, ...data });
  })
);

/**
 * ADMIN CRUD
 */

/**
 * @openapi
 * /products/admin/products:
 *   post:
 *     summary: Admin - create product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, arPrice, usdPrice]
 *             properties:
 *               title: { type: string, example: "Pack de Samples" }
 *               description: { type: string, example: "Desc..." }
 *               arPrice: { type: integer, example: 15000, description: "Precio en ARS (Argentina)" }
 *               usdPrice: { type: integer, example: 10, description: "Precio en USD (resto del mundo)" }
 *               isActive: { type: boolean, example: true }
 *               isSubscription: { type: boolean, example: false }
 *               requiresPremium: { type: boolean, example: false }
 *               resourceType: { type: string, enum: [LINK, FILE], example: "LINK" }
 *               resourceUrl: { type: string, example: "https://drive.google.com/..." }
 *               paypalPlanId: { type: string, nullable: true, example: null }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
productsRoutes.post(
  "/admin/products",
  authRequired,
  adminOnly,
  validateBody(createProductSchema),
  asyncHandler(productsController.create)
);

/**
 * @openapi
 * /products/admin/products/{id}:
 *   put:
 *     summary: Admin - update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
productsRoutes.put(
  "/admin/products/:id",
  authRequired,
  adminOnly,
  validateBody(updateProductSchema),
  asyncHandler(productsController.update)
);

/**
 * @openapi
 * /products/admin/products:
 *   get:
 *     summary: Admin - list all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
productsRoutes.get(
  "/admin/products",
  authRequired,
  adminOnly,
  asyncHandler(productsController.listAdmin)
);

/**
 * @openapi
 * /products/admin/products/{id}:
 *   delete:
 *     summary: Admin - delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
productsRoutes.delete(
  "/admin/products/:id",
  authRequired,
  adminOnly,
  asyncHandler(productsController.remove)
);

/**
 * @openapi
 * /products/admin/products/{id}/cover:
 *   post:
 *     summary: Admin - upload cover image (multipart/form-data)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: OK }
 *       400: { description: Missing image }
 *       401: { description: Missing/invalid token }
 *       403: { description: Admin only }
 */
productsRoutes.post(
  "/admin/products/:id/cover",
  authRequired,
  adminOnly,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file)
      return res.status(400).json({ ok: false, message: "Missing image" });

    const uploaded = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "focus/products" },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result as any);
          }
        );
        stream.end(req.file!.buffer);
      }
    );

    const product = await productsService.update(req.params.id, {
      coverImageUrl: uploaded.secure_url
    });
    res.json({ ok: true, product });
  })
);