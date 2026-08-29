-- VideoClass: pasar de un unico price+currency a arPrice/usdPrice duales,
-- igual que Product, para poder cobrar por MercadoPago (ARS) y PayPal (USD).
ALTER TABLE "VideoClass" ADD COLUMN "arPrice" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "VideoClass" ADD COLUMN "usdPrice" INTEGER NOT NULL DEFAULT 0;

UPDATE "VideoClass" SET "usdPrice" = "price" WHERE "currency" = 'USD';
UPDATE "VideoClass" SET "arPrice" = "price" WHERE "currency" = 'ARS';

ALTER TABLE "VideoClass" DROP COLUMN "currency";
ALTER TABLE "VideoClass" DROP COLUMN "price";

-- OrderItem y AccessGrant pasan a ser polimorficos: un item/grant es de un
-- Product O de una VideoClass, nunca los dos. La FK a Product se vuelve
-- opcional y se agrega la FK opcional a VideoClass.
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD COLUMN "classId" TEXT;

ALTER TABLE "AccessGrant" DROP CONSTRAINT "AccessGrant_productId_fkey";
ALTER TABLE "AccessGrant" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "AccessGrant" ADD COLUMN "classId" TEXT;

CREATE INDEX "OrderItem_classId_idx" ON "OrderItem"("classId");
CREATE INDEX "AccessGrant_classId_idx" ON "AccessGrant"("classId");
CREATE UNIQUE INDEX "AccessGrant_userId_classId_key" ON "AccessGrant"("userId", "classId");

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_classId_fkey" FOREIGN KEY ("classId") REFERENCES "VideoClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AccessGrant" ADD CONSTRAINT "AccessGrant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessGrant" ADD CONSTRAINT "AccessGrant_classId_fkey" FOREIGN KEY ("classId") REFERENCES "VideoClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Refuerzo a nivel DB (ademas de la validacion en la app) de que cada fila
-- referencia exactamente uno de los dos: Product o VideoClass.
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_or_class_check"
  CHECK (("productId" IS NOT NULL)::int + ("classId" IS NOT NULL)::int = 1);

ALTER TABLE "AccessGrant" ADD CONSTRAINT "AccessGrant_product_or_class_check"
  CHECK (("productId" IS NOT NULL)::int + ("classId" IS NOT NULL)::int = 1);
