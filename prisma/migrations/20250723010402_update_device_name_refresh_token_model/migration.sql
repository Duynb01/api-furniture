/*
  Warnings:

  - You are about to drop the column `deviceAddress` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `deviceIp` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceName` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "deviceAddress",
ADD COLUMN     "deviceIp" TEXT NOT NULL,
ADD COLUMN     "deviceName" TEXT NOT NULL;
