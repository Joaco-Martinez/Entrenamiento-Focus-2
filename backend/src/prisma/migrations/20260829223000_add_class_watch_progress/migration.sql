-- CreateTable
CREATE TABLE "ClassWatchProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassWatchProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassWatchProgress_classId_idx" ON "ClassWatchProgress"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassWatchProgress_userId_classId_key" ON "ClassWatchProgress"("userId", "classId");

-- AddForeignKey
ALTER TABLE "ClassWatchProgress" ADD CONSTRAINT "ClassWatchProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassWatchProgress" ADD CONSTRAINT "ClassWatchProgress_classId_fkey" FOREIGN KEY ("classId") REFERENCES "VideoClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
