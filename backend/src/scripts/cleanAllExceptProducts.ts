import { prisma } from "../prisma/client";

async function cleanAllExceptProducts() {
  console.log("🧹 Borrando todo menos productos...");

  await prisma.$transaction(async (tx) => {
    // 1) Tablas más dependientes primero
    await tx.accessGrant.deleteMany();
    await tx.payment.deleteMany();
    await tx.orderItem.deleteMany();

    // 2) Tablas que dependen de User y/o Product
    await tx.subscription.deleteMany();
    await tx.subscriptionLinkIntent.deleteMany();

    // 3) Órdenes
    await tx.order.deleteMany();

    // 4) Usuarios al final
    await tx.user.deleteMany();
  });

  console.log("✅ Limpieza terminada. Los productos quedaron intactos.");
}

cleanAllExceptProducts()
  .catch((error) => {
    console.error("❌ Error al limpiar la base:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });