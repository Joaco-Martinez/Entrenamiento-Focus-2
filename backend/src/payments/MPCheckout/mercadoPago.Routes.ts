import { Router } from "express";
import * as mercadoPagoController from "./mercadoPago.controller";
import { requireArgentinaForMercadoPago } from "./requireArgentinaForMercadoPago";

export const MpRoutes = Router();

MpRoutes.post(
  "/process-payment",
  requireArgentinaForMercadoPago,
  mercadoPagoController.processPayment
);

MpRoutes.post(
  "/create-preference",
  requireArgentinaForMercadoPago,
  mercadoPagoController.createPreference
);

