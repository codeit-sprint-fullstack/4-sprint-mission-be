-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "productId" TEXT,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
