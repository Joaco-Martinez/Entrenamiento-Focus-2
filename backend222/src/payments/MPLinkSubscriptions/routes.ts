import { Router } from "express";
import { authRequired } from "../../common/middlewares/authRequired";
import {
  createMercadoPagoLinkIntentController,
  mercadoPagoLinkWebhookController,
  getMyMercadoPagoLinkSubscriptionController,
} from "./controller";

const router = Router();

router.post("/intent", authRequired, createMercadoPagoLinkIntentController);
router.post("/webhook", mercadoPagoLinkWebhookController);
router.get("/me", authRequired, getMyMercadoPagoLinkSubscriptionController);

export default router;