import { prisma } from "../prisma/client";

async function main() {
  console.log("🧨 Borrando toda la base de datos...");

  await prisma.$transaction(async (tx) => {
    await tx.accessGrant.deleteMany();
    await tx.payment.deleteMany();
    await tx.orderItem.deleteMany();
    await tx.subscription.deleteMany();
    await tx.order.deleteMany();
    await tx.product.deleteMany();
    await tx.user.deleteMany();
  });

  console.log("✅ Base de datos vaciada por completo.");
}

main()
  .catch((error) => {
    console.error("❌ Error al borrar la base:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });