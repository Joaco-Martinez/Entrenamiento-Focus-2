import { Request, Response } from "express";

export const getSubscription = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS}`,
        },
      }
    );

    const data = await response.json();

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching subscription" });
  }
};