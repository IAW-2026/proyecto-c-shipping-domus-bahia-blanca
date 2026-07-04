-- CreateEnum
CREATE TYPE "EstadoTurnoComprador" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO');

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "estadoComprador" "EstadoTurnoComprador" NOT NULL DEFAULT 'PENDIENTE';
