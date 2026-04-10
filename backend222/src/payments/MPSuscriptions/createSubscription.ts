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

    if (!process.env.MP_PLAN_ID) {
      return res.status(500).json({
        message: "Falta configurar MP_PLAN_ID",
      });
    }

    const product = productId
      ? await prisma.product.findUnique({
          where: { id: productId },
        })
      : null;

    const body = {
      reason: product?.title || "Suscripción Entrenamiento Focus",
      external_reference: userId,
      payer_email: email,
      back_url: "https://www.entrenamientofocus.com.ar/mentoria/pagada",
      status: "pending",
      preapproval_plan_id: process.env.MP_PLAN_ID,
      notification_url: `${process.env.BACK_URL}/mercadopago_suscription/webhook`,
    };

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
  } catch (error: any) {
    console.error("Error creando suscripción MP:", error);

    return res.status(500).json({
      message:
        error?.message || "Error creando suscripción",
    });
  }
};