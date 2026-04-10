import { prisma } from "../prisma/client";

async function main() {
  console.log("🧹 Limpiando base de datos...");

  // ⚠️ Orden IMPORTANTE por relaciones

  // 1. AccessGrant (depende de User y Product)
  await prisma.accessGrant.deleteMany();
  console.log("✔ AccessGrant borrado");

  // 2. Payments (depende de Order)
  await prisma.payment.deleteMany();
  console.log("✔ Payment borrado");

  // 3. OrderItems (depende de Order y Product)
  await prisma.orderItem.deleteMany();
  console.log("✔ OrderItem borrado");

  // 4. Orders
  await prisma.order.deleteMany();
  console.log("✔ Order borrado");

  // 5. Subscriptions (depende de User y Product)
  await prisma.subscription.deleteMany();
  console.log("✔ Subscription borrado");

  console.log("✅ Base limpia (usuarios y productos intactos)");
}

main()
  .catch((e) => {
    console.error("❌ Error limpiando BD:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });