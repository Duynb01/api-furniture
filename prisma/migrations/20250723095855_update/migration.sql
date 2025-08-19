/*
  Warnings:

  - You are about to drop the column `createAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `deviceIp` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `ipAddress` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "createAt",
DROP COLUMN "deviceIp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ipAddress" TEXT NOT NULL;
