import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",

  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ?? "",
  MP_NOTIFICATION_URL: process.env.MP_NOTIFICATION_URL ?? "",
  MP_SUCCESS_URL: process.env.MP_SUCCESS_URL ?? "",
  MP_FAILURE_URL: process.env.MP_FAILURE_URL ?? "",
  MP_PENDING_URL: process.env.MP_PENDING_URL ?? "",

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ?? "",
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ?? "",
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ?? "",
  PAYPAL_BASE_URL:
    process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com",
  PAYPAL_RETURN_URL: process.env.PAYPAL_RETURN_URL ?? "",
  PAYPAL_CANCEL_URL: process.env.PAYPAL_CANCEL_URL ?? "",
  PAYPAL_WEBHOOK_URL: process.env.PAYPAL_WEBHOOK_URL ?? "",

  // Variables dedicadas para suscripciones PayPal.
  // Si no existen, el sistema usa fallback a las variables PAYPAL_* generales.
  PAYPAL_SUSCRIPTION_CLIENT_ID:
    process.env.PAYPAL_SUSCRIPTION_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID ?? "",
  PAYPAL_SUSCRIPTION_CLIENT_SECRET:
    process.env.PAYPAL_SUSCRIPTION_CLIENT_SECRET ?? process.env.PAYPAL_CLIENT_SECRET ?? "",
  PAYPAL_SUSCRIPTION_WEBHOOK_ID:
    process.env.PAYPAL_SUSCRIPTION_WEBHOOK_ID ?? process.env.PAYPAL_WEBHOOK_ID ?? "",
  PAYPAL_SUSCRIPTION_BASE_URL:
    process.env.PAYPAL_SUSCRIPTION_BASE_URL ??
    process.env.PAYPAL_BASE_URL ??
    "https://api-m.sandbox.paypal.com",
  PAYPAL_SUSCRIPTION_RETURN_URL:
    process.env.PAYPAL_SUSCRIPTION_RETURN_URL ?? process.env.PAYPAL_RETURN_URL ?? "",
  PAYPAL_SUSCRIPTION_CANCEL_URL:
    process.env.PAYPAL_SUSCRIPTION_CANCEL_URL ?? process.env.PAYPAL_CANCEL_URL ?? "",
  PAYPAL_SUSCRIPTION_WEBHOOK_URL:
    process.env.PAYPAL_SUSCRIPTION_WEBHOOK_URL ?? process.env.PAYPAL_WEBHOOK_URL ?? "",
};
