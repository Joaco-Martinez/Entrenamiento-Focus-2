import { Request, Response } from "express";
import { createPaymentAndSyncOrder } from "./mpCheckout.service";

export const processPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const result = await createPaymentAndSyncOrder({
      userId,
      body: req.body,
    });

    return res.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("MP processPayment error:", error?.message || error);
    return res.status(400).json({ ok: false, message: error?.message || "MP error" });
  }
};