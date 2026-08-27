import { Request, Response } from "express";
import { AuthedRequest } from "../common/middlewares/authRequired";
import * as forumService from "../services/forum.service";

export async function list(req: Request, res: Response) {
  const posts = await forumService.listPosts();
  res.json({ ok: true, posts });
}

export async function get(req: Request, res: Response) {
  const post = await forumService.getPost(req.params.id);
  res.json({ ok: true, post });
}

export async function search(req: Request, res: Response) {
  const q = String(req.query.q ?? "");
  const posts = await forumService.search(q);
  res.json({ ok: true, posts });
}

export async function create(req: AuthedRequest, res: Response) {
  const authorId = req.user!.sub;
  const post = await forumService.createPost(authorId, req.body);
  res.status(201).json({ ok: true, post });
}

export async function createComment(req: AuthedRequest, res: Response) {
  const authorId = req.user!.sub;
  const comment = await forumService.createComment(req.params.id, authorId, req.body);
  res.status(201).json({ ok: true, comment });
}

export async function update(req: AuthedRequest, res: Response) {
  const userId = req.user!.sub;
  const isAdmin = req.user!.role === "ADMIN";
  const post = await forumService.updatePost(req.params.id, userId, isAdmin, req.body);
  res.json({ ok: true, post });
}

export async function remove(req: AuthedRequest, res: Response) {
  const userId = req.user!.sub;
  const isAdmin = req.user!.role === "ADMIN";
  await forumService.deletePost(req.params.id, userId, isAdmin);
  res.json({ ok: true });
}

export async function removeComment(req: AuthedRequest, res: Response) {
  const userId = req.user!.sub;
  const isAdmin = req.user!.role === "ADMIN";
  await forumService.deleteComment(req.params.id, userId, isAdmin);
  res.json({ ok: true });
}
