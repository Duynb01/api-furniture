/*
  Warnings:

  - You are about to drop the column `sort` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sort",
ADD COLUMN     "connectId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "connectId" SERIAL NOT NULL;
