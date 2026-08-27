import { Router } from "express";
import { asyncHandler } from "../common/utils/asyncHandler";
import { validateBody } from "../common/middlewares/validate";
import { authRequired } from "../common/middlewares/authRequired";
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
} from "../schemas/forum.schemas";
import * as forumController from "../controllers/forum.controller";

export const forumRoutes = Router();

forumRoutes.get("/posts", asyncHandler(forumController.list));

forumRoutes.get("/search", asyncHandler(forumController.search));

forumRoutes.get("/by-article/:slug", asyncHandler(forumController.getByArticleSlug));

forumRoutes.post(
  "/by-article/:slug/comments",
  authRequired,
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
