/*
  Warnings:

  - The values [COMPLETAR] on the enum `EstadoAgente` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoAgente_new" AS ENUM ('PENDIENTE', 'ACEPTADO', 'RECHAZADO');
ALTER TABLE "public"."AgenteInmobiliario" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "AgenteInmobiliario" ALTER COLUMN "estado" TYPE "EstadoAgente_new" USING ("estado"::text::"EstadoAgente_new");
ALTER TYPE "EstadoAgente" RENAME TO "EstadoAgente_old";
ALTER TYPE "EstadoAgente_new" RENAME TO "EstadoAgente";
DROP TYPE "public"."EstadoAgente_old";
ALTER TABLE "AgenteInmobiliario" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;

-- AlterTable
ALTER TABLE "AgenteInmobiliario" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';

-- CreateTable
CREATE TABLE "HistorialTurno" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "estado" "EstadoTurno" NOT NULL,
    "detalle" TEXT,
    "realizadoPor" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialTurno_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistorialTurno" ADD CONSTRAINT "HistorialTurno_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
