-- AlterTable
ALTER TABLE "ForumComment" ADD COLUMN     "audioPeaks" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
