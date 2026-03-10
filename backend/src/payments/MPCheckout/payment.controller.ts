import { Request, Response } from "express";
import { createPaymentAndSyncOrder } from "./mpCheckout.service";
import { handleControllerError } from "../../common/utils/handleControllerError";

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
    return handleControllerError(res, error, "MP error");
  }
};