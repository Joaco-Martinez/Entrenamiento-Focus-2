import { Router } from "express";
import * as mercadoPagoController from "./mercadoPago.controller";
import { requireArgentinaForMercadoPago } from "./requireArgentinaForMercadoPago";
import { authRequired } from "../../common/middlewares/authRequired";

export const MpRoutes = Router();

MpRoutes.post(
  "/process-payment",
  authRequired,
  requireArgentinaForMercadoPago,
  mercadoPagoController.processPayment
);

MpRoutes.post(
  "/create-preference",
  authRequired,
  requireArgentinaForMercadoPago,
  mercadoPagoController.createPreference
);

MpRoutes.post("/webhook", mercadoPagoController.webhook);