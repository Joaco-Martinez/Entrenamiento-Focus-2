import { Router } from "express";
import { randomBytes } from "crypto";
import multer from "multer";
import { prisma } from "../prisma/client";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";
import { asyncHandler } from "../common/utils/asyncHandler";
import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../common/errors/ApiError";

export const budgetsRoutes = Router();
// Presupuestos e información de clientes: sin indexación ni almacenamiento intermedio.
budgetsRoutes.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "private, no-store");
  next();
});
const admin = [authRequired, adminOnly] as const;
type Producer = "fran" | "mati";
// Los administradores acceden a ambas categorías; cada consulta conserva su sección.
function parseProducer(value: unknown): Producer {
  if (value === undefined) return "fran"; // compatibilidad con enlaces antiguos del panel
  if (value === "fran" || value === "mati") return value;
  throw new ApiError(400, "Sección de presupuestos inválida");
}
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) });

// La ruta cliente expone solamente presupuestos habilitados, mediante un token aleatorio.
budgetsRoutes.get("/share/:token", asyncHandler(async (req, res) => {
  const data = await prisma.budgetProposal.findUnique({ where: { shareToken: req.params.token } });
  if (!data?.shared) throw new ApiError(404, "Presupuesto no disponible");
  res.setHeader("Cache-Control", "private, no-store");
  res.json({ budget: { title: data.title, clientName: data.clientName, content: data.content, updatedAt: data.updatedAt } });
}));

budgetsRoutes.get("/admin", ...admin, asyncHandler(async (req, res) => {
  const producer = parseProducer(req.query.producer);
  const budgets = await prisma.budgetProposal.findMany({ where: { producer }, orderBy: { updatedAt: "desc" } });
  res.json({ budgets });
}));

budgetsRoutes.post("/admin", ...admin, asyncHandler(async (req, res) => {
  const { clientName, title, content } = req.body;
  const producer = parseProducer(req.body.producer);
  if (typeof clientName !== "string" || !clientName.trim() || typeof title !== "string" || !title.trim() || !content || typeof content !== "object" || Array.isArray(content)) {
    throw new ApiError(400, "Datos inválidos");
  }
  const budget = await prisma.budgetProposal.create({ data: { clientName: clientName.slice(0,160), title: title.slice(0,200), content, producer, shareToken: randomBytes(24).toString("hex") } });
  res.status(201).json({ budget });
}));

budgetsRoutes.put("/admin/:id", ...admin, asyncHandler(async (req, res) => {
  const { clientName, title, content, shared } = req.body;
  const producer = parseProducer(req.query.producer);
  if (typeof clientName !== "string" || !clientName.trim() || typeof title !== "string" || !title.trim() || !content || typeof content !== "object" || Array.isArray(content) || typeof shared !== "boolean") throw new ApiError(400, "Datos inválidos");
  const budget = await prisma.budgetProposal.update({ where: { id: req.params.id, producer }, data: { clientName: clientName.slice(0,160), title: title.slice(0,200), content, shared } });
  res.json({ budget });
}));

budgetsRoutes.delete("/admin/:id", ...admin, asyncHandler(async (req, res) => {
  const producer = parseProducer(req.query.producer);
  await prisma.budgetProposal.delete({ where: { id: req.params.id, producer } });
  res.json({ ok: true });
}));

budgetsRoutes.post("/admin/image", ...admin, upload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Subí una imagen JPG, PNG o WebP menor a 8 MB");
  const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "focus/budgets", resource_type: "image" }, (err, result) => err || !result ? reject(err ?? new Error("Upload failed")) : resolve(result as { secure_url: string }));
    stream.end(req.file!.buffer);
  });
  res.json({ url: uploaded.secure_url });
}));
