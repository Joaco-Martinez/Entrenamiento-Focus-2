-- Preserve numeric legacy sizes present in the source spreadsheet.
ALTER TYPE "ClothingSize" ADD VALUE IF NOT EXISTS '1';
ALTER TYPE "ClothingSize" ADD VALUE IF NOT EXISTS '2';

-- Store money with cents; the source spreadsheet contains decimal amounts.
ALTER TABLE "ClothingProduct"
  ALTER COLUMN "defaultUnitPrice" TYPE DECIMAL(14,2) USING "defaultUnitPrice"::DECIMAL(14,2),
  ALTER COLUMN "defaultUnitDtfCost" TYPE DECIMAL(14,2) USING "defaultUnitDtfCost"::DECIMAL(14,2),
  ALTER COLUMN "defaultUnitGarmentCost" TYPE DECIMAL(14,2) USING "defaultUnitGarmentCost"::DECIMAL(14,2);
ALTER TABLE "ClothingProduct"
  ALTER COLUMN "defaultUnitPrice" SET DEFAULT 0.00,
  ALTER COLUMN "defaultUnitDtfCost" SET DEFAULT 0.00,
  ALTER COLUMN "defaultUnitGarmentCost" SET DEFAULT 0.00;

ALTER TABLE "ClothingOrder"
  ALTER COLUMN "receivedAmount" TYPE DECIMAL(14,2) USING "receivedAmount"::DECIMAL(14,2),
  ALTER COLUMN "extraExpenses" TYPE DECIMAL(14,2) USING "extraExpenses"::DECIMAL(14,2);
ALTER TABLE "ClothingOrder"
  ALTER COLUMN "receivedAmount" SET DEFAULT 0.00,
  ALTER COLUMN "extraExpenses" SET DEFAULT 0.00;

ALTER TABLE "ClothingOrderItem"
  ALTER COLUMN "unitPrice" TYPE DECIMAL(14,2) USING "unitPrice"::DECIMAL(14,2),
  ALTER COLUMN "unitDtfCost" TYPE DECIMAL(14,2) USING "unitDtfCost"::DECIMAL(14,2),
  ALTER COLUMN "unitGarmentCost" TYPE DECIMAL(14,2) USING "unitGarmentCost"::DECIMAL(14,2);
ALTER TABLE "ClothingOrderItem"
  ALTER COLUMN "unitPrice" SET DEFAULT 0.00,
  ALTER COLUMN "unitDtfCost" SET DEFAULT 0.00,
  ALTER COLUMN "unitGarmentCost" SET DEFAULT 0.00;

CREATE TYPE "ClothingStockMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');
CREATE TABLE "ClothingStockMovement" (
  "id" TEXT NOT NULL,
  "category" "ClothingCategory" NOT NULL,
  "size" "ClothingSize" NOT NULL,
  "type" "ClothingStockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClothingStockMovement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ClothingStockMovement_category_size_createdAt_idx"
  ON "ClothingStockMovement"("category", "size", "createdAt");
