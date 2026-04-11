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
  // Log cookies for debugging – sacar en producción si querés
  console.log("req.headers.cookie:", req.headers.cookie);
  console.log("req.cookies:", req.cookies);

  let token: string | undefined = undefined;

  if (req.cookies && typeof req.cookies.token === "string") {
    token = req.cookies.token;
  } else if (typeof req.headers.authorization === "string") {
    const authHeader = req.headers.authorization.trim();
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

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
  } catch (error: any) {
    console.log("authRequired error verifying token:", error);

    // Si el token vino por cookie y es inválido/expiró/firma mala, la limpiamos
    if (req.cookies?.token) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false, // en producción con HTTPS debería ser true si así la creás
        sameSite: "lax",
      });
    }

    return res.status(401).json({
      message: "Token inválido",
    });
  }
}