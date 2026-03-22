import { prisma } from "../prisma/client";
import { OrderStatus } from "@prisma/client";

async function main() {
  console.log("🧹 Buscando ventas pendientes...");

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pendingOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      createdAt: {
        lte: cutoff,
      },
    },
    select: { id: true },
  });

  if (pendingOrders.length === 0) {
    console.log("ℹ️ No hay ventas pendientes viejas para borrar.");
    return;
  }

  const orderIds = pendingOrders.map((order) => order.id);

  await prisma.$transaction(async (tx) => {
    await tx.accessGrant.deleteMany({
      where: {
        orderId: { in: orderIds },
      },
    });

    await tx.payment.deleteMany({
      where: {
        orderId: { in: orderIds },
      },
    });

    await tx.orderItem.deleteMany({
      where: {
        orderId: { in: orderIds },
      },
    });

    await tx.order.deleteMany({
      where: {
        id: { in: orderIds },
      },
    });
  });

  console.log(`✅ Se borraron ${orderIds.length} ventas pendientes viejas.`);
}

main()
  .catch((error) => {
    console.error("❌ Error al borrar ventas pendientes:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });