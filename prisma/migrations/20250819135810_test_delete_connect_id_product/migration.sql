/*
  Warnings:

  - You are about to drop the column `connectId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `connectId` on the `ProductImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "connectId";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "connectId";
