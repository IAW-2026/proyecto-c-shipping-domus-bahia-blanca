/*
  Warnings:

  - You are about to drop the column `activo` on the `AgenteInmobiliario` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoAgente" AS ENUM ('COMPLETAR', 'PENDIENTE', 'ACEPTADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "AgenteInmobiliario" DROP COLUMN "activo",
ADD COLUMN     "estado" "EstadoAgente" NOT NULL DEFAULT 'COMPLETAR',
ADD COLUMN     "nombreInmobiliaria" TEXT;
