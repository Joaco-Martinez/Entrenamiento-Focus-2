import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../common/utils/asyncHandler";
import { validateBody } from "../common/middlewares/validate";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import {
  createClassSchema,
  updateClassSchema,
} from "../schemas/classes.schemas";
import * as classesController from "../controllers/classes.controller";

export const classesRoutes = Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * PUBLIC / FIXED ROUTES
 */

classesRoutes.get("/", asyncHandler(classesController.list));

/**
 * ADMIN CRUD
 * Siempre antes de las rutas dinámicas públicas.
 */

classesRoutes.get(
  "/admin/clases",
  authRequired,
  adminOnly,
  asyncHandler(classesController.listAdmin)
);

classesRoutes.post(
  "/admin/clases",
  authRequired,
  adminOnly,
  validateBody(createClassSchema),
  asyncHandler(classesController.create)
);

classesRoutes.get(
  "/admin/clases/:id",
  authRequired,
  adminOnly,
  asyncHandler(classesController.getAdmin)
);

classesRoutes.put(
  "/admin/clases/:id",
  authRequired,
  adminOnly,
  validateBody(updateClassSchema),
  asyncHandler(classesController.update)
);

classesRoutes.delete(
  "/admin/clases/:id",
  authRequired,
  adminOnly,
  asyncHandler(classesController.remove)
);

classesRoutes.post(
  "/admin/clases/:id/cover",
  authRequired,
  adminOnly,
  upload.single("image"),
  asyncHandler(classesController.uploadCover)
);

classesRoutes.post(
  "/admin/clases/:id/video/init",
  authRequired,
  adminOnly,
  asyncHandler(classesController.initVideoUpload)
);

classesRoutes.get(
  "/admin/clases/:id/video/status",
  authRequired,
  adminOnly,
  asyncHandler(classesController.getVideoStatus)
);

/**
 * DYNAMIC PUBLIC ROUTES
 * Siempre al final
 */

classesRoutes.get(
  "/:slug/access",
  authRequired,
  asyncHandler(classesController.getAccess)
);

classesRoutes.get("/:slug", asyncHandler(classesController.getBySlug));
