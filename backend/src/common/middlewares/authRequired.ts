// middlewares/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtUserPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
  email?: string;
  id?: string;
  [key: string]: any;
}

export type AuthedRequest = Request & {
  user?: JwtUserPayload;
};

export function authRequired(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;
  console.log("authRequired token:", token);

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtUserPayload;

    req.user = payload;
    console.log("authRequired user:", payload);

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}