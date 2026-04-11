-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordCode" TEXT,
ADD COLUMN     "resetPasswordCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordRequestedAt" TIMESTAMP(3);
