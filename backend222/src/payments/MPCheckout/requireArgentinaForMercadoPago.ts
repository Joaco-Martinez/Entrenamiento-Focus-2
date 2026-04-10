import { Request, Response, NextFunction } from "express";

type RequestWithUser = Request & {
  user?: {
    sub?: string;
    id?: string;
    email?: string;
    country?: string | null;
    role?: string;
    iat?: number;
    exp?: number;
  };
};

export function requireArgentinaForMercadoPago(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const country = String(req.user?.country || "arg").toLowerCase();

  if (country !== "arg") {
    return res.status(403).json({
      message: "Mercado Pago solo está disponible para usuarios de Argentina",
    });
  }

  next();
}