/*
  Warnings:

  - Made the column `tweetId` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `commentId` on table `Reply` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_tweetId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "tweetId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reply" ALTER COLUMN "commentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
