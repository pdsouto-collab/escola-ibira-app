/*
  Warnings:

  - You are about to drop the `PortfolioEntry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teste` to the `PegadaInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PortfolioEntry" DROP CONSTRAINT "PortfolioEntry_studentId_fkey";

-- AlterTable
ALTER TABLE "PegadaInteraction" ADD COLUMN     "teste" TEXT NOT NULL;

-- DropTable
DROP TABLE "PortfolioEntry";
