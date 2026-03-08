// middlewares/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  console.log("authRequired token:", token); // Debug
  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = payload;
    console.log("authRequired user:", payload); // Debug
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}