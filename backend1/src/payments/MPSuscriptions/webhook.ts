import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS!,
});

const preApproval = new PreApproval(client);

const mapStatus = (status?: string) => {
  switch (status) {
    case "authorized":
      return "ACTIVE";
    case "paused":
      return "SUSPENDED";
    case "cancelled":
      return "CANCELLED";
    case "expired":
      return "EXPIRED";
    default:
      return "PAST_DUE";
  }
};

export const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    res.sendStatus(200);

    if (event?.type !== "preapproval" || !event?.data?.id) return;

    const subscriptionId = event.data.id;

    const mpSub = await preApproval.get({ id: subscriptionId });

    await prisma.subscription.updateMany({
      where: {
        externalId: subscriptionId,
      },
      data: {
        providerStatus: mpSub.status ?? null,
        status: mapStatus(mpSub.status) as any,
        payerEmail: mpSub.payer_email ?? null,
       raw: JSON.parse(JSON.stringify(mpSub)),
      },
    });
  } catch (error) {
    console.error(error);
  }
};