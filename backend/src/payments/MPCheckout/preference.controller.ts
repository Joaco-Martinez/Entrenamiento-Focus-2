import { Request, Response } from "express";
import { createOrderAndPreference } from "./mpCheckout.service";

export const createPreference = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    console.log("MP createPreference body:", req.body);

    const { items, currency } = req.body;

    const { orderId, preferenceId } = await createOrderAndPreference({
      userId,
      items,
      currencyFallback: currency,
    });

    return res.json({ ok: true, orderId, preferenceId });
  } catch (error: any) {
    console.error("MP createPreference error:", error?.message || error);
    return res.status(400).json({
      ok: false,
      message: error?.message || "MP error",
    });
  }
};