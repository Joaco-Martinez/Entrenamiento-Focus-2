-- AlterTable
ALTER TABLE "ForumComment" ADD COLUMN     "audioDuration" INTEGER,
ADD COLUMN     "audioUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
