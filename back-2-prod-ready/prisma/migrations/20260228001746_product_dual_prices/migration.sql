/*
  Warnings:

  - You are about to drop the column `currency` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "currency",
DROP COLUMN "price",
ADD COLUMN     "arPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usdPrice" INTEGER NOT NULL DEFAULT 0;
