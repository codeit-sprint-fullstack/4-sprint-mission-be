/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "likeCount",
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0;
