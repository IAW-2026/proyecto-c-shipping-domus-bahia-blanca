/*
  Warnings:

  - You are about to drop the column `clerkUserId` on the `AgenteInmobiliario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AgenteInmobiliario_clerkUserId_key";

-- AlterTable
ALTER TABLE "AgenteInmobiliario" DROP COLUMN "clerkUserId";
