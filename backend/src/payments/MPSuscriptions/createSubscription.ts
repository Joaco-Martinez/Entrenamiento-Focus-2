import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN_SUSCRIPTIONS!,
});

const preApproval = new PreApproval(client);

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { userId, productId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        message: "userId y email son requeridos",
      });
    }

    const product = productId
      ? await prisma.product.findUnique({
          where: { id: productId },
        })
      : null;

    const body: any = {
      reason: product?.title || "Suscripción",
      external_reference: userId,
      payer_email: email,
      back_url: `https://www.entrenamientofocus.com.ar/mentoria/pagada`,
      status: "pending",
    };

    if (process.env.MP_PLAN_ID) {
      body.preapproval_plan_id = process.env.MP_PLAN_ID;
    } else {
      body.auto_recurring = {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 15,
        currency_id: "USD",
      };
    }

    body.notification_url = `${process.env.BACK_URL}/mercadopago_suscription/webhook`;

    const response = await preApproval.create({ body });

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        externalId: response.id,
        provider: "MERCADOPAGO",
        providerStatus: response.status ?? null,
        payerEmail: email,
        productId: productId ?? null,
        raw: JSON.parse(JSON.stringify(response)),
      },
      create: {
        userId,
        provider: "MERCADOPAGO",
        status: "PAST_DUE",
        externalId: response.id,
        providerStatus: response.status ?? null,
        payerEmail: email,
        productId: productId ?? null,
        raw: JSON.parse(JSON.stringify(response)),
      },
    });

    return res.json({
      initPoint: response.init_point,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creando suscripción",
    });
  }
};