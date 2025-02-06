/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "likeCount",
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0;
