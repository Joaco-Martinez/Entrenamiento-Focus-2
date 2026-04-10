import { Response } from "express";

export function handleControllerError(
  res: Response,
  error: any,
  fallbackMessage = "Unexpected error"
) {
  const status =
    error?.status ||
    error?.statusCode ||
    error?.cause?.status ||
    error?.response?.status ||
    400;

  const details =
    error?.response?.data ||
    error?.cause ||
    error?.body ||
    null;

  console.error("Controller error FULL:", {
    message: error?.message,
    status,
    name: error?.name,
    cause: error?.cause,
    response: error?.response?.data,
    stack: error?.stack,
  });

  return res.status(status).json({
    ok: false,
    message: error?.message || fallbackMessage,
    status,
    error: {
      name: error?.name || "Error",
      cause: error?.cause || null,
      details,
      stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    },
  });
}