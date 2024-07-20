/*
  Warnings:

  - The `subscriptionActive` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `amount` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextPaymentDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `next_payment_date` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "next_payment_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "subscriptionActive",
ADD COLUMN     "subscriptionActive" "Status" NOT NULL DEFAULT 'Inactive';
