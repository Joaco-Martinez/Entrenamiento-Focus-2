-- CreateEnum
CREATE TYPE "VideoClassStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "VideoClass" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "coverImagePublicId" TEXT,
    "bunnyVideoId" TEXT,
    "durationSeconds" INTEGER,
    "price" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "status" "VideoClassStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoClass_slug_key" ON "VideoClass"("slug");

-- CreateIndex
CREATE INDEX "VideoClass_status_idx" ON "VideoClass"("status");

-- CreateIndex
CREATE INDEX "VideoClass_createdById_idx" ON "VideoClass"("createdById");

-- AddForeignKey
ALTER TABLE "VideoClass" ADD CONSTRAINT "VideoClass_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
