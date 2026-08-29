import { Request, Response } from "express";
import * as classesService from "../services/classes.service";
import { cloudinary } from "../config/cloudinary";

export async function list(req: Request, res: Response) {
  const classes = await classesService.listPublic();
  res.json({ ok: true, classes });
}

export async function getBySlug(req: Request, res: Response) {
  const videoClass = await classesService.getPublicBySlug(req.params.slug);
  res.json({ ok: true, class: videoClass });
}

export async function getAccess(req: any, res: Response) {
  const userId = req.user.sub;
  const data = await classesService.getAccess(userId, req.params.slug);
  res.json({ ok: true, ...data });
}

export async function listAdmin(req: Request, res: Response) {
  const classes = await classesService.listAdmin();
  res.json({ ok: true, classes });
}

export async function getAdmin(req: Request, res: Response) {
  const videoClass = await classesService.getAdminById(req.params.id);
  res.json({ ok: true, class: videoClass });
}

export async function create(req: any, res: Response) {
  const videoClass = await classesService.create(req.body, req.user.sub);
  res.status(201).json({ ok: true, class: videoClass });
}

export async function update(req: Request, res: Response) {
  const videoClass = await classesService.update(req.params.id, req.body);
  res.json({ ok: true, class: videoClass });
}

export async function remove(req: Request, res: Response) {
  await classesService.remove(req.params.id);
  res.json({ ok: true });
}

export async function uploadCover(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Falta la imagen" });
  }

  const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "focus/clases" },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result as any);
        }
      );

      stream.end(req.file!.buffer);
    }
  );

  const videoClass = await classesService.setCover(
    req.params.id,
    uploaded.secure_url,
    uploaded.public_id
  );

  res.json({ ok: true, class: videoClass });
}

export async function initVideoUpload(req: Request, res: Response) {
  const upload = await classesService.initVideoUpload(req.params.id);
  res.json({ ok: true, upload });
}

export async function getVideoStatus(req: Request, res: Response) {
  const status = await classesService.getVideoStatus(req.params.id);
  res.json({ ok: true, ...status });
}
