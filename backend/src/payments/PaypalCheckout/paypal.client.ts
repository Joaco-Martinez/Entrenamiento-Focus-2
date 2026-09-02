import axios from "axios";
import { env } from "../../config/env";
import { ApiError } from "../../common/errors/ApiError";

// Cliente de bajo nivel para la API de PayPal, sin dependencia de
// orders.service.ts. Vive acá (y no en paypal.service.ts) para que
// orders.service.ts pueda importarlo sin crear una dependencia circular
// (paypal.service.ts ya importa orders.service.ts para llamar a markPaid).
export async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new ApiError(400, "Missing PayPal credentials");
  }

  const basic = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token as string;
}

export async function getPaypalOrder(paypalOrderId: string) {
  const token = await paypalAccessToken();

  const response = await axios.get(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const token = await paypalAccessToken();

  const response = await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
