/*
  Warnings:

  - Added the required column `email_token` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "email_token" TEXT NOT NULL;
