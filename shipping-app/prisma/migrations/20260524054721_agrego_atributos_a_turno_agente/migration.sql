/*
  Warnings:

  - You are about to drop the column `fechaHoraConfirmada` on the `Turno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "fechaHoraConfirmada",
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "nombreInmobiliaria" TEXT;
