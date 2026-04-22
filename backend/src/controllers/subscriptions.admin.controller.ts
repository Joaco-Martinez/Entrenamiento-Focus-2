import { Request, Response, NextFunction } from "express";
import { adminCreateManualSubscription } from "../services/subscriptions.admin.service";

export async function createManualSubscriptionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await adminCreateManualSubscription(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}