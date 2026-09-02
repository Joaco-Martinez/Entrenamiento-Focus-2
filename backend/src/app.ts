import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import MPsuscription  from "./payments/MPSuscriptions/routes";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { notFound } from "./common/errors/notFound";
import { errorHandler } from "./common/errors/errorHandler";
import { MpRoutes } from "./payments/MPCheckout/mercadoPago.Routes";
import { healthRoutes } from "./routes/health.routes";
import mpLinkSubscriptionsRoutes from "./payments/MPLinkSubscriptions/routes";
import { authRoutes } from "./routes/auth.routes";
import { usersRoutes } from "./routes/users.routes";
import { productsRoutes } from "./routes/products.routes";
import { forumRoutes } from "./routes/forum.routes";
import { articlesRoutes } from "./routes/articles.routes";
import { classesRoutes } from "./routes/classes.routes";
import { ordersRoutes } from "./routes/orders.routes";
import  manualSuscriptionRoutes  from "./routes/subscriptions.admin.routes";
import { subscriptionsRoutes } from "./routes/subscriptions.routes";
import { webhooksRoutes } from "./routes/webhooks.routes";
import { diagnosticsRoutes } from "./routes/diagnostics.routes";
import { paypalRoutes } from "./payments/PaypalCheckout/paypal.routes";
import { paypalSubscriptionsRoutes } from "./payments/PaypalSuscriptions/paypalSubscriptions.routes";

export const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin: [
    "https://www.entrenamientofocus.com.ar",
    "https://entrenamientofocus.com.ar",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use((req, _res, next) => {
  console.log("========== REQUEST ==========");
  console.log("Fecha:", new Date().toISOString());
  console.log("Método:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("=============================");
  next();
});
app.get("/", (_req, res) => res.json({ ok: true, name: "back-2" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/mercadopago_checkout", MpRoutes);
app.use("/manual_subscriptions", manualSuscriptionRoutes);
app.use("/paypal_checkout", paypalRoutes);
app.use("/paypal_suscription", paypalSubscriptionsRoutes);
app.use("/mercadopago_suscription", MPsuscription);
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/mp-link-subscriptions", mpLinkSubscriptionsRoutes);
app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/forum", forumRoutes);
app.use("/articles", articlesRoutes);
app.use("/clases", classesRoutes);
app.use("/orders", ordersRoutes);

app.use("/subscriptions", subscriptionsRoutes);
app.use("/webhooks", webhooksRoutes);
app.use("/admin", diagnosticsRoutes);

app.use(notFound);
app.use(errorHandler);