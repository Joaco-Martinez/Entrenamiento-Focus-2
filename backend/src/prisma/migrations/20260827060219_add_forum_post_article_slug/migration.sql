-- AlterTable
ALTER TABLE "ForumPost" ADD COLUMN     "articleSlug" TEXT;

-- CreateIndex
CREATE INDEX "ForumPost_articleSlug_idx" ON "ForumPost"("articleSlug");
