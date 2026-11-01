import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma/client";
import { ApiError } from "../errors/ApiError";

export function clothingOwnerOnly(req: Request, _res: Response, next: NextFunction) {
  const allowedEmail = process.env.CLOTHING_OWNER_EMAIL?.trim().toLowerCase();
  const userId = (req as any).user?.sub || (req as any).user?.id;

  if (!allowedEmail) return next(new ApiError(503, "El acceso privado de ropa todavía no está configurado."));
  if (!userId) return next(new ApiError(401, "No autenticado."));

  prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    .then((user) => {
      const email = user?.email?.trim().toLowerCase();
      if (!email || email !== allowedEmail) return next(new ApiError(403, "No tenés autorización para acceder a este módulo."));
      return next();
    })
    .catch(next);
}
