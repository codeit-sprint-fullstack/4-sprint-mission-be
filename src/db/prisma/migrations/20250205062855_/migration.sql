/*
  Warnings:

  - Made the column `image` on table `Article` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;
