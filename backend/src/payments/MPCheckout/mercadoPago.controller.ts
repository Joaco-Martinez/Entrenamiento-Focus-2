import { Request, Response } from "express";
import * as mercadoPagoService from "./mercadoPago.service";
import * as ordersService from "../../services/orders.service";

type RequestWithUser = Request & {
  user?: {
    sub?: string;
    id?: string;
    email?: string;
    country?: string | null;
    role?: string;
    iat?: number;
    exp?: number;
  };
};

export async function processPayment(req: RequestWithUser, res: Response) {
  try {
    const {
      token,
      payment_method_id,
      issuer_id,
      installments,
      payer,
      amount,
      items,
      description,
      orderId,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Falta orderId" });
    }

    if (!token) {
      return res.status(400).json({ message: "Falta token de pago" });
    }

    if (!payment_method_id) {
      return res.status(400).json({ message: "Falta payment_method_id" });
    }

    if (!payer?.email) {
      return res.status(400).json({ message: "Falta email del pagador" });
    }

    const normalizedItems = Array.isArray(items) ? items : [];

    const totalFromItems = normalizedItems.reduce(
      (acc: number, item: any) =>
        acc + Number(item.unit_price || 0) * Number(item.quantity || 0),
      0
    );

    const transactionAmount =
      totalFromItems > 0 ? totalFromItems : Number(amount || 0);

    if (
      !transactionAmount ||
      Number.isNaN(transactionAmount) ||
      transactionAmount <= 0
    ) {
      return res.status(400).json({
        message: "Monto inválido para procesar el pago",
      });
    }

    const parsedIssuerId =
      issuer_id === undefined ||
      issuer_id === null ||
      issuer_id === ""
        ? undefined
        : Number(issuer_id);

    const result = await mercadoPagoService.processPayment({
      orderId,
      transaction_amount: transactionAmount,
      token,
      description:
        description ||
        normalizedItems.map((item: any) => item.title).join(", ") ||
        "Compra en Focus",
      installments: Number(installments || 1),
      payment_method_id,
      issuer_id: parsedIssuerId,
      payer: {
        email: payer.email,
      },
    });

    const status = result.status;
    const statusDetail = result.status_detail;

    if (status === "approved") {
      await ordersService.markPaid(orderId, String(result.id), result);
    }

    if (
      status === "approved" ||
      status === "pending" ||
      status === "in_process"
    ) {
      return res.status(201).json({
        message: "Pago procesado correctamente",
        paymentId: result.id,
        status,
        statusDetail,
        raw: result,
      });
    }

    return res.status(400).json({
      message: "El pago fue rechazado",
      paymentId: result.id,
      status,
      statusDetail,
      raw: result,
    });
  } catch (error: any) {
    console.error("Error processPayment:", error);

    return res.status(500).json({
      message: "Error al procesar el pago con Mercado Pago",
      error: error?.message || "Unknown error",
      cause: error?.cause || null,
    });
  }
}

export async function createPreference(req: RequestWithUser, res: Response) {
  try {
    const { items, payer, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Falta orderId",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un item",
      });
    }

    const invalidItem = items.find(
      (item: any) =>
        !item?.id ||
        !item?.title ||
        !Number(item?.quantity) ||
        Number(item?.quantity) <= 0 ||
        !Number(item?.unit_price) ||
        Number(item?.unit_price) <= 0
    );

    if (invalidItem) {
      return res.status(400).json({
        message: "Hay items inválidos en la preferencia",
      });
    }

    const result = await mercadoPagoService.createPreference({
      orderId,
      items: items.map((item: any) => ({
        id: String(item.id),
        title: String(item.title),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
        description: item.description || "",
        picture_url: item.picture_url || "",
      })),
      payer: payer?.email
        ? {
            firstName: payer.firstName || "",
            lastName: payer.lastName || "",
            email: payer.email,
          }
        : undefined,
    });

    return res.status(201).json({
      message: "Preferencia creada correctamente",
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error: any) {
    console.error("Error createPreference:", error);

    return res.status(500).json({
      message: "Error al crear la preferencia de Mercado Pago",
      error: error?.message || "Unknown error",
      cause: error?.cause || null,
    });
  }
}

export async function webhook(req: Request, res: Response) {
  res.status(200).json({ ok: true });

  try {
    await mercadoPagoService.processWebhook(req.body, req.query);
  } catch (error) {
    console.error("Error webhook Mercado Pago:", error);
  }
}