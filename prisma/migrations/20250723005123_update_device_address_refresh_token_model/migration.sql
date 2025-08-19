/*
  Warnings:

  - You are about to drop the column `deviceAdress` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `deviceAddress` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "deviceAdress",
ADD COLUMN     "deviceAddress" TEXT NOT NULL;
