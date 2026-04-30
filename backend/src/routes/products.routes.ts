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
 * PUBLIC / FIXED ROUTES
 */

productsRoutes.get("/", asyncHandler(productsController.list));

productsRoutes.get(
  "/subscriptions/options",
  authRequired,
  adminOnly,
  asyncHandler(productsController.listSubscriptionOptions)
);

/**
 * ADMIN CRUD
 */

productsRoutes.post(
  "/admin/products",
  authRequired,
  adminOnly,
  validateBody(createProductSchema),
  asyncHandler(productsController.create)
);

productsRoutes.get(
  "/admin/products",
  authRequired,
  adminOnly,
  asyncHandler(productsController.listAdmin)
);

productsRoutes.put(
  "/admin/products/:id",
  authRequired,
  adminOnly,
  validateBody(updateProductSchema),
  asyncHandler(productsController.update)
);

productsRoutes.delete(
  "/admin/products/:id",
  authRequired,
  adminOnly,
  asyncHandler(productsController.remove)
);

productsRoutes.post(
  "/admin/products/:id/cover",
  authRequired,
  adminOnly,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Missing image",
      });
    }

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
      coverImageUrl: uploaded.secure_url,
    });

    return res.json({
      ok: true,
      product,
    });
  })
);

/**
 * DYNAMIC PUBLIC ROUTES
 * Siempre al final
 */

productsRoutes.get(
  "/:id/access",
  authRequired,
  asyncHandler(async (req: any, res) => {
    const userId = req.user.sub;

    const data = await productsService.getAccess(userId, req.params.id);

    return res.json({
      ok: true,
      ...data,
    });
  })
);

productsRoutes.get("/:id", asyncHandler(productsController.get));