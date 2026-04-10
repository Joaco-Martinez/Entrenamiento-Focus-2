import axios from "axios";
import { prisma } from "../prisma/client";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_SUSCRIPTION_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SUSCRIPTION_CLIENT_SECRET!;
const PAYPAL_BASE_URL = process.env.PAYPAL_SUSCRIPTION_BASE_URL!;

// Opcionales para guardar en tu DB
const LOCAL_PRODUCT_ID = process.env.LOCAL_PRODUCT_ID || "";

// Datos del producto/plan en PayPal
const PAYPAL_PRODUCT_NAME = process.env.PAYPAL_PRODUCT_NAME || "Entrenamiento Focus";
const PAYPAL_PRODUCT_DESCRIPTION =
  process.env.PAYPAL_PRODUCT_DESCRIPTION || "Suscripción mensual de Entrenamiento Focus";
const PAYPAL_PRODUCT_TYPE = process.env.PAYPAL_PRODUCT_TYPE || "SERVICE";
const PAYPAL_PRODUCT_CATEGORY = process.env.PAYPAL_PRODUCT_CATEGORY || "SOFTWARE";

const PAYPAL_PLAN_NAME = process.env.PAYPAL_PLAN_NAME || "Plan mensual";
const PAYPAL_PLAN_DESCRIPTION =
  process.env.PAYPAL_PLAN_DESCRIPTION || "Acceso mensual a Entrenamiento Focus";

const PAYPAL_PLAN_CURRENCY = process.env.PAYPAL_PLAN_CURRENCY || "USD";
const PAYPAL_PLAN_AMOUNT = process.env.PAYPAL_PLAN_AMOUNT || "1";

const PAYPAL_INTERVAL_UNIT = process.env.PAYPAL_INTERVAL_UNIT || "MONTH";
const PAYPAL_INTERVAL_COUNT = Number(process.env.PAYPAL_INTERVAL_COUNT || "1");

// 0 = infinito / recurrente sin fin
const PAYPAL_TOTAL_CYCLES = Number(process.env.PAYPAL_TOTAL_CYCLES || "0");

function assertEnv() {
  if (!PAYPAL_CLIENT_ID) {
    throw new Error("Falta PAYPAL_SUSCRIPTION_CLIENT_ID");
  }
  if (!PAYPAL_CLIENT_SECRET) {
    throw new Error("Falta PAYPAL_SUSCRIPTION_CLIENT_SECRET");
  }
  if (!PAYPAL_BASE_URL) {
    throw new Error("Falta PAYPAL_SUSCRIPTION_BASE_URL");
  }
}

async function getPaypalAccessToken() {
  const basic = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token as string;
}

async function createPaypalProduct(accessToken: string) {
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/catalogs/products`,
    {
      name: PAYPAL_PRODUCT_NAME,
      description: PAYPAL_PRODUCT_DESCRIPTION,
      type: PAYPAL_PRODUCT_TYPE,
      category: PAYPAL_PRODUCT_CATEGORY,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

async function createPaypalPlan(accessToken: string, paypalProductId: string) {
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/billing/plans`,
    {
      product_id: paypalProductId,
      name: PAYPAL_PLAN_NAME,
      description: PAYPAL_PLAN_DESCRIPTION,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: PAYPAL_INTERVAL_UNIT,
            interval_count: PAYPAL_INTERVAL_COUNT,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: PAYPAL_TOTAL_CYCLES,
          pricing_scheme: {
            fixed_price: {
              value: PAYPAL_PLAN_AMOUNT,
              currency_code: PAYPAL_PLAN_CURRENCY,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

async function savePlanIdInLocalProduct(paypalPlanId: string) {
  if (!LOCAL_PRODUCT_ID) {
    console.log("ℹ️ No se pasó LOCAL_PRODUCT_ID, no se actualiza ningún producto local.");
    return;
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: LOCAL_PRODUCT_ID },
    select: { id: true, title: true },
  });

  if (!existingProduct) {
    throw new Error(`No existe el producto local con id ${LOCAL_PRODUCT_ID}`);
  }

  await prisma.product.update({
    where: { id: LOCAL_PRODUCT_ID },
    data: {
      paypalPlanId,
      isSubscription: true,
    },
  });

  console.log(`✅ Producto local actualizado: ${existingProduct.title}`);
  console.log(`   paypalPlanId: ${paypalPlanId}`);
}

async function main() {
  assertEnv();

  console.log("🚀 Obteniendo access token de PayPal...");
  const accessToken = await getPaypalAccessToken();

  console.log("📦 Creando producto en PayPal...");
  const paypalProduct = await createPaypalProduct(accessToken);

  console.log("✅ Producto PayPal creado");
  console.log(`   Product ID: ${paypalProduct.id}`);

  console.log("💳 Creando plan en PayPal...");
  const paypalPlan = await createPaypalPlan(accessToken, paypalProduct.id);

  console.log("✅ Plan PayPal creado");
  console.log(`   Plan ID: ${paypalPlan.id}`);
  console.log(`   Nombre: ${paypalPlan.name}`);
  console.log(`   Precio: ${PAYPAL_PLAN_AMOUNT} ${PAYPAL_PLAN_CURRENCY}`);

  await savePlanIdInLocalProduct(paypalPlan.id);

  console.log("\n🎉 Todo listo.");
  console.log("Guardate estos datos:");
  console.log(`PAYPAL PRODUCT ID: ${paypalProduct.id}`);
  console.log(`PAYPAL PLAN ID: ${paypalPlan.id}`);
}

main()
  .catch((error) => {
    console.error("❌ Error creando producto/plan PayPal");

    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Data:", JSON.stringify(error.response?.data, null, 2));
    } else {
      console.error(error);
    }

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });