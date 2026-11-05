CREATE TYPE "ClothingCategory" AS ENUM ('TSHIRT', 'HOODIE', 'CHOMBA', 'OTHER');
CREATE TYPE "ClothingSize" AS ENUM ('S', 'M', 'L', 'XL', '2XL', '3XL', 'ONE_SIZE');
CREATE TYPE "ClothingOrderStatus" AS ENUM ('ORDER_RECEIVED', 'ORDERED_TO_SUPPLIER', 'FOLLOW_UP_SENT', 'DISPATCHED', 'FINISHED', 'RETURNING', 'WAITING_YURI', 'PAYMENT_RECEIVED', 'CANCELLED');

CREATE TABLE "ClothingProduct" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "ClothingCategory" NOT NULL,
  "trackStock" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "defaultUnitPrice" INTEGER NOT NULL DEFAULT 0,
  "defaultUnitDtfCost" INTEGER NOT NULL DEFAULT 0,
  "defaultUnitGarmentCost" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClothingProduct_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClothingProduct_name_key" ON "ClothingProduct"("name");
CREATE INDEX "ClothingProduct_active_category_idx" ON "ClothingProduct"("active", "category");

CREATE TABLE "ClothingOrder" (
  "id" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT '',
  "status" "ClothingOrderStatus" NOT NULL DEFAULT 'ORDER_RECEIVED',
  "receivedAmount" INTEGER NOT NULL DEFAULT 0,
  "extraExpenses" INTEGER NOT NULL DEFAULT 0,
  "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedDate" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClothingOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ClothingOrder_orderDate_idx" ON "ClothingOrder"("orderDate");
CREATE INDEX "ClothingOrder_status_idx" ON "ClothingOrder"("status");
CREATE INDEX "ClothingOrder_clientName_idx" ON "ClothingOrder"("clientName");

CREATE TABLE "ClothingOrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "productName" TEXT NOT NULL,
  "category" "ClothingCategory" NOT NULL,
  "size" "ClothingSize",
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" INTEGER NOT NULL DEFAULT 0,
  "unitDtfCost" INTEGER NOT NULL DEFAULT 0,
  "unitGarmentCost" INTEGER NOT NULL DEFAULT 0,
  "trackStock" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClothingOrderItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ClothingOrderItem_orderId_idx" ON "ClothingOrderItem"("orderId");
CREATE INDEX "ClothingOrderItem_productId_idx" ON "ClothingOrderItem"("productId");
CREATE INDEX "ClothingOrderItem_category_size_idx" ON "ClothingOrderItem"("category", "size");
ALTER TABLE "ClothingOrderItem" ADD CONSTRAINT "ClothingOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ClothingOrder"("id");
ALTER TABLE "ClothingOrderItem" ADD CONSTRAINT "ClothingOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ClothingProduct"("id");

CREATE TABLE "ClothingStock" (
  "id" TEXT NOT NULL,
  "category" "ClothingCategory" NOT NULL,
  "size" "ClothingSize" NOT NULL,
  "initialQty" INTEGER NOT NULL DEFAULT 0,
  "restockedQty" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClothingStock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClothingStock_category_size_key" ON "ClothingStock"("category", "size");
