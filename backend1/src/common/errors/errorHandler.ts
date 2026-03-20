import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log("========== ERROR ==========");
  console.log("Fecha:", new Date().toISOString());
  console.log("Método:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("Headers:", {
    authorization: req.headers.authorization,
    contentType: req.headers["content-type"],
    origin: req.headers.origin,
  });
  console.log("Error completo:", err);
  console.log("Message:", err?.message);
  console.log("Status:", err?.status || err?.statusCode || 500);
  console.log("Stack:", err?.stack);
  console.log("===========================");

  const statusCode = err?.status || err?.statusCode || 500;

  return res.status(statusCode).json({
    ok: false,
    message: err?.message || "Internal server error",
  });
}