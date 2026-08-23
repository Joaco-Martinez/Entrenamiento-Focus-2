import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../common/utils/asyncHandler";
import { validateBody } from "../common/middlewares/validate";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../schemas/articles.schemas";
import * as articlesController from "../controllers/articles.controller";

export const articlesRoutes = Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * PUBLIC ROUTES
 */

articlesRoutes.get("/", asyncHandler(articlesController.list));

/**
 * ADMIN CRUD
 */

articlesRoutes.get(
  "/admin/articles",
  authRequired,
  adminOnly,
  asyncHandler(articlesController.listAdmin)
);

articlesRoutes.post(
  "/admin/articles",
  authRequired,
  adminOnly,
  validateBody(createArticleSchema),
  asyncHandler(articlesController.create)
);

articlesRoutes.put(
  "/admin/articles/:id",
  authRequired,
  adminOnly,
  validateBody(updateArticleSchema),
  asyncHandler(articlesController.update)
);

articlesRoutes.delete(
  "/admin/articles/:id",
  authRequired,
  adminOnly,
  asyncHandler(articlesController.remove)
);

articlesRoutes.post(
  "/admin/articles/:id/cover",
  authRequired,
  adminOnly,
  upload.single("image"),
  asyncHandler(articlesController.uploadCover)
);

/**
 * DYNAMIC PUBLIC ROUTES
 * Siempre al final
 */

articlesRoutes.get("/:slug", asyncHandler(articlesController.getBySlug));
