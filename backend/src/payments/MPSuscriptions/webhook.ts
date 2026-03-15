import { Request, Response } from "express";

type MercadoPagoSubscription = {
  id: string;
  status: "authorized" | "pending" | "paused" | "cancelled";
  payer_email?: string;
};

export const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {

    const event = req.body;

    console.log("MP WEBHOOK:", event);

    if (event?.type === "preapproval" && event?.data?.id) {

      const id = event.data.id;

      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        console.error("MercadoPago API error:", await response.text());
        return res.sendStatus(500);
      }

      const subscription = await response.json() as MercadoPagoSubscription;

      console.log("SUBSCRIPTION STATUS:", subscription.status);

      /*
        authorized
        pending
        cancelled
        paused
      */

      // actualizar DB acá

    }

    return res.sendStatus(200);

  } catch (error) {
    console.error("MercadoPago webhook error:", error);
    return res.sendStatus(500);
  }
};