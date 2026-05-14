/*
  Warnings:

  - You are about to drop the `HistorialTurno` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `telefono` on table `AgenteInmobiliario` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "HistorialTurno" DROP CONSTRAINT "HistorialTurno_turnoId_fkey";

-- DropForeignKey
ALTER TABLE "Turno" DROP CONSTRAINT "Turno_agenteId_fkey";

-- AlterTable
ALTER TABLE "AgenteInmobiliario" ALTER COLUMN "telefono" SET NOT NULL;

-- AlterTable
ALTER TABLE "Turno" ALTER COLUMN "agenteId" DROP NOT NULL;

-- DropTable
DROP TABLE "HistorialTurno";

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "AgenteInmobiliario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
