import { Request, Response } from "express";
import * as articlesService from "../services/articles.service";
import { ApiError } from "../common/errors/ApiError";
import { cloudinary } from "../config/cloudinary";

export async function list(req: Request, res: Response) {
  const articles = await articlesService.listPublic();
  res.json({ ok: true, articles });
}

export async function getBySlug(req: Request, res: Response) {
  const article = await articlesService.getBySlug(req.params.slug);
  if (!article) throw new ApiError(404, "Article not found");
  res.json({ ok: true, article });
}

export async function listAdmin(req: Request, res: Response) {
  const articles = await articlesService.listAdmin();
  res.json({ ok: true, articles });
}

export async function create(req: Request, res: Response) {
  const article = await articlesService.create(req.body);
  res.status(201).json({ ok: true, article });
}

export async function update(req: Request, res: Response) {
  const article = await articlesService.update(req.params.id, req.body);
  res.json({ ok: true, article });
}

export async function remove(req: Request, res: Response) {
  await articlesService.remove(req.params.id);
  res.json({ ok: true });
}

export async function uploadCover(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "Missing image",
    });
  }

  const uploaded = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "focus/articles" },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result as any);
        }
      );

      stream.end(req.file!.buffer);
    }
  );

  const article = await articlesService.update(req.params.id, {
    coverImageUrl: uploaded.secure_url,
  });

  return res.json({
    ok: true,
    article,
  });
}
