import cron from "node-cron";
import { prisma } from "../prisma/client";
import { OrderStatus } from "@prisma/client";

export function startDeletePendingOrdersJob() {
  cron.schedule("0 3 * * *", async () => {
    console.log("🕒 Ejecutando limpieza automática de ventas pendientes...");

    try {
      const pendingOrders = await prisma.order.findMany({
        where: { status: OrderStatus.PENDING },
        select: { id: true },
      });

      if (pendingOrders.length === 0) {
        console.log("ℹ️ No hay ventas pendientes para borrar.");
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

      console.log(`✅ Limpieza lista. Se borraron ${orderIds.length} ventas pendientes.`);
    } catch (error) {
      console.error("❌ Error en cron de ventas pendientes:", error);
    }
  });
}