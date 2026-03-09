import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { notFound } from "./common/errors/notFound";
import { errorHandler } from "./common/errors/errorHandler";
import { MPCheckoutRoutes } from "./payments/MPCheckout/mpCheckout.routes";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";
import { usersRoutes } from "./routes/users.routes";
import { productsRoutes } from "./routes/products.routes";
import { ordersRoutes } from "./routes/orders.routes";
import { paymentsRoutes } from "./routes/payments.routes";
import { subscriptionsRoutes } from "./routes/subscriptions.routes";
import { webhooksRoutes } from "./routes/webhooks.routes";

export const app = express();

const corsOptions = {
  origin: ["https://www.entrenamientofocus.com.ar", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ ok: true, name: "back-2" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/mp_checkout", MPCheckoutRoutes);
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/payments", paymentsRoutes);
app.use("/subscriptions", subscriptionsRoutes);
app.use("/webhooks", webhooksRoutes);

app.use(notFound);
app.use(errorHandler);