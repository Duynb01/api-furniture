/*
  Warnings:

  - You are about to drop the column `categoryId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_categoryId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "categoryId";
