/*
  Warnings:

  - Added the required column `subscriptionCode` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "subscriptionCode" TEXT NOT NULL;
