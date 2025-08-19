/*
  Warnings:

  - You are about to drop the column `userId` on the `Voucher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "VoucherUser" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "voucherId" UUID NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "VoucherUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoucherUser" ADD CONSTRAINT "VoucherUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUser" ADD CONSTRAINT "VoucherUser_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
