import dotenv from "dotenv";
dotenv.config();

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",

  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ?? "",
  // Webhook público (https) al que Mercado Pago enviará notificaciones
  MP_NOTIFICATION_URL: process.env.MP_NOTIFICATION_URL ?? "",
  // URLs de retorno (front) para mostrar success/failure/pending
  MP_SUCCESS_URL: process.env.MP_SUCCESS_URL ?? "",
  MP_FAILURE_URL: process.env.MP_FAILURE_URL ?? "",
  MP_PENDING_URL: process.env.MP_PENDING_URL ?? "",

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ?? "",
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ?? "",
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ?? "",
  PAYPAL_BASE_URL: process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com",
  PAYPAL_RETURN_URL: process.env.PAYPAL_RETURN_URL ?? "",
  PAYPAL_CANCEL_URL: process.env.PAYPAL_CANCEL_URL ?? "",
  // Webhook público (https) al que PayPal enviará eventos
  PAYPAL_WEBHOOK_URL: process.env.PAYPAL_WEBHOOK_URL ?? ""
};