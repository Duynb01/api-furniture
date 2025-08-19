/*
  Warnings:

  - Added the required column `deviceAdress` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "deviceAdress" TEXT NOT NULL;
