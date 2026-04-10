import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS!,
});

const preApproval = new PreApproval(client);

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await preApproval.update({
      id,
      body: { status: "cancelled" },
    });

    await prisma.subscription.updateMany({
      where: { externalId: id },
      data: {
        status: "CANCELLED",
        providerStatus: response.status,
        cancelledAt: new Date(),
      },
    });

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: "Error cancelling subscription" });
  }
};