import { Router } from "express";
import { createManualSubscriptionController } from "../controllers/subscriptions.admin.controller";
import { authRequired } from "../common/middlewares/authRequired";
import { adminOnly } from "../common/middlewares/adminOnly";

const manualSuscriptionRoutes = Router();

manualSuscriptionRoutes.post(
  "/admin/manual",
  authRequired,
  adminOnly,
  createManualSubscriptionController
);

export default manualSuscriptionRoutes;