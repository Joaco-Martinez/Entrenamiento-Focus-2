import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof ApiError ? err.status : 500;

  if (status === 500) console.error("❌", err);

  res.status(status).json({
    ok: false,
    message: err?.message ?? "Internal server error",
    details: err instanceof ApiError ? err.details : undefined
  });
}