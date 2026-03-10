import { Request, Response } from "express";
import { createOrderAndPreference } from "./mpCheckout.service";

export const createPreference = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
    }

    console.log("MP createPreference body:", req.body);

    const { items, currency } = req.body;

    const { orderId, preferenceId } = await createOrderAndPreference({
      userId,
      items,
      currencyFallback: currency,
    });

    return res.json({
      ok: true,
      orderId,
      preferenceId,
    });
  } catch (error: any) {
    const status =
      error?.status ||
      error?.statusCode ||
      error?.cause?.status ||
      error?.response?.status ||
      400;

    const errorBody =
      error?.response?.data ||
      error?.cause ||
      error?.body ||
      null;

    console.error("MP createPreference error FULL:", {
      message: error?.message,
      status,
      name: error?.name,
      cause: error?.cause,
      response: error?.response?.data,
      stack: error?.stack,
    });

    return res.status(status).json({
      ok: false,
      message: error?.message || "MP error",
      status,
      error: {
        name: error?.name || "Error",
        cause: error?.cause || null,
        details: errorBody,
        stack:
          process.env.NODE_ENV !== "production" ? error?.stack : undefined,
      },
    });
  }
};