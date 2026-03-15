import { Router } from "express";
import { createSubscription } from "./createSubscription";
import { cancelSubscription } from "./cancelSubscription";
import { getSubscription } from "./getSubscription";
import { mercadoPagoWebhook } from "./webhook";

const router = Router();

router.post("/create", createSubscription);
router.get("/:id", getSubscription);
router.put("/:id/cancel", cancelSubscription);

router.post("/webhook", mercadoPagoWebhook);

export default router;