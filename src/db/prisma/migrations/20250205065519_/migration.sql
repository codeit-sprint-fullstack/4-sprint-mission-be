/*
  Warnings:

  - You are about to drop the column `favoriteCount` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteCount` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "favoriteCount",
ADD COLUMN     "isLiked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "favoriteCount",
ADD COLUMN     "isLiked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;
