/*
  Warnings:

  - You are about to drop the column `Date` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `date` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "Date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
