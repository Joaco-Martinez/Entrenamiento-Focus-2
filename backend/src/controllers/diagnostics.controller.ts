import { Request, Response } from "express";

/**
 * Variables de entorno relevantes para pagos/video que no viven en config/env.ts
 * (algunas se leen directo de process.env en su propio módulo, ver
 * payments/MPCheckout/mpClient.ts y services/bunny.service.ts) y que son fáciles
 * de dejar mal configuradas al desplegar sin que nadie lo note hasta que un
 * pago o una reproducción falla en silencio.
 */
const CHECKED_ENV_KEYS = [
  "MP_WEBHOOK_KEY_CHECKOUT_BRICKS",
  "MP_NOTIFICATION_URL",
  "MP_ACCESS_TOKEN_CHECKOUT_BRICKS",
  "BUNNY_STREAM_LIBRARY_ID",
  "BUNNY_STREAM_API_KEY",
  "BUNNY_STREAM_CDN_HOSTNAME",
  "BUNNY_TOKEN_AUTH_KEY",
] as const;

/**
 * Solo devuelve presencia (true/false), nunca el valor. Pensado para que un
 * admin sin acceso al panel de Railway pueda confirmar qué está configurado
 * en producción sin exponer secretos por HTTP.
 */
export async function envStatus(_req: Request, res: Response) {
  const env: Record<string, boolean> = {};

  for (const key of CHECKED_ENV_KEYS) {
    env[key] = Boolean(process.env[key]?.trim());
  }

  res.json({ ok: true, env });
}
