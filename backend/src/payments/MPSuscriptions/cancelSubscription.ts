import { Request, Response } from "express";

export const cancelSubscription = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      }
    );

    const data = await response.json();

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Error cancelling subscription" });
  }
};