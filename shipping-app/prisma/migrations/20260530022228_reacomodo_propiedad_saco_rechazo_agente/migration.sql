/*
  Warnings:

  - The values [RECHAZADO_VENDEDOR] on the enum `EstadoTurno` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTurno_new" AS ENUM ('PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO');
ALTER TABLE "Turno" ALTER COLUMN "estado" TYPE "EstadoTurno_new" USING ("estado"::text::"EstadoTurno_new");
ALTER TYPE "EstadoTurno" RENAME TO "EstadoTurno_old";
ALTER TYPE "EstadoTurno_new" RENAME TO "EstadoTurno";
DROP TYPE "public"."EstadoTurno_old";
COMMIT;
