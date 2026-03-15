import { Request, Response } from "express";
import { mpClient } from "./mercadoPagoClient";

export const createSubscription = async (req: Request, res: Response) => {
  try {

    const { email } = req.body;

    const response = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS}`,
        },
        body: JSON.stringify({
          reason: "Mentoría Focus",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 29,
            currency_id: "USD",
          },
          payer_email: email,
          back_url: `${process.env.FRONT_URL}/checkout/suscription/success`,
          status: "pending",
        }),
      }
    );

    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating subscription" });
  }
};