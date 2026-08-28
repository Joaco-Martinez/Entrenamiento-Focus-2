import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { asyncHandler } from "../common/utils/asyncHandler";
import { validateBody } from "../common/middlewares/validate";
import { authRequired } from "../common/middlewares/authRequired";
import { ApiError } from "../common/errors/ApiError";
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
} from "../schemas/forum.schemas";
import * as forumController from "../controllers/forum.controller";

export const forumRoutes = Router();

const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // ~8MB, generoso para 2 minutos de voz comprimida

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/mpeg",
  "audio/mp3",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/3gpp",
  "video/mp4", // Safari a veces reporta la nota de voz grabada como video/mp4
]);

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AUDIO_MIME_TYPES.has(file.mimetype)) {
      return cb(new ApiError(400, "Formato de audio no soportado"));
    }
    cb(null, true);
  },
});

// Normaliza los errores de multer (ej. archivo demasiado pesado) a mensajes claros
// en vez del genérico "File too large" en inglés.
function handleAudioUpload(req: Request, res: Response, next: NextFunction) {
  audioUpload.single("audio")(req, res, (err: any) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(400, "El audio es demasiado pesado (máximo ~8MB, unos 2 minutos).")
      );
    }
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(400, "No se pudo procesar el archivo de audio."));
  });
}

forumRoutes.get("/posts", asyncHandler(forumController.list));

forumRoutes.get("/search", asyncHandler(forumController.search));

forumRoutes.get("/by-article/:slug", asyncHandler(forumController.getByArticleSlug));

forumRoutes.post(
  "/by-article/:slug/comments",
  authRequired,
  handleAudioUpload,
  validateBody(createCommentSchema),
  asyncHandler(forumController.createArticleComment)
);

forumRoutes.get("/posts/:id", asyncHandler(forumController.get));

forumRoutes.get("/posts/:id/comments", asyncHandler(forumController.getComments));

forumRoutes.post(
  "/posts",
  authRequired,
  validateBody(createPostSchema),
  asyncHandler(forumController.create)
);

forumRoutes.post(
  "/posts/:id/comments",
  authRequired,
  handleAudioUpload,
  validateBody(createCommentSchema),
  asyncHandler(forumController.createComment)
);

forumRoutes.put(
  "/posts/:id",
  authRequired,
  validateBody(updatePostSchema),
  asyncHandler(forumController.update)
);

forumRoutes.delete(
  "/posts/:id",
  authRequired,
  asyncHandler(forumController.remove)
);

forumRoutes.delete(
  "/comments/:id",
  authRequired,
  asyncHandler(forumController.removeComment)
);
