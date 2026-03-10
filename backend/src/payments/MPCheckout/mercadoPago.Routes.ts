import { Router } from "express";
import * as mercadoPagoController from "./mercadoPago.controller";
import { requireArgentinaForMercadoPago } from "./requireArgentinaForMercadoPago";

const router = Router();

router.post(
  "/process-payment",
  requireArgentinaForMercadoPago,
  mercadoPagoController.processPayment
);

router.post(
  "/create-preference",
  requireArgentinaForMercadoPago,
  mercadoPagoController.createPreference
);

export default router;