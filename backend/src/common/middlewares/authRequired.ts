import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

export interface JwtUserPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
  email?: string;
  id?: string;
}

export type AuthedRequest = Request & {
  user?: JwtUserPayload;
};

export function authRequired(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  // 1. Obtener token
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (typeof req.headers.authorization === "string") {
    const authHeader = req.headers.authorization.trim();
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    // 2. Verificar token
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtUserPayload;

    req.user = payload;
    return next();
  } catch (error) {
    // 🔥 3. SI FALLA → BORRAR COOKIE

    if (req.cookies?.token) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        ...(isProd ? { domain: ".entrenamientofocus.com.ar" } : {}),
        path: "/",
      });
    }

    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
}