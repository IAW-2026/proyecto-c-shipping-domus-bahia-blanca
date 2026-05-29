-- CreateTable
CREATE TABLE "Propiedad" (
    "id" TEXT NOT NULL,
    "nombrePropiedad" TEXT,
    "direccion" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "vendedorId" TEXT NOT NULL,
    "nombreInmobiliaria" TEXT,

    CONSTRAINT "Propiedad_pkey" PRIMARY KEY ("id")
);

-- Backfill property data from existing appointments before removing duplicated columns.
INSERT INTO "Propiedad" (
    "id",
    "nombrePropiedad",
    "direccion",
    "latitud",
    "longitud",
    "vendedorId",
    "nombreInmobiliaria"
)
SELECT DISTINCT ON ("propiedadId")
    "propiedadId",
    "nombrePropiedad",
    "direccion",
    "latitud",
    "longitud",
    "vendedorId",
    "nombreInmobiliaria"
FROM "Turno"
ORDER BY "propiedadId", "creadoEn" DESC
ON CONFLICT ("id") DO NOTHING;

-- CreateIndex
CREATE INDEX "Propiedad_vendedorId_idx" ON "Propiedad"("vendedorId");

-- DropForeignKey
ALTER TABLE IF EXISTS "HistorialTurno" DROP CONSTRAINT IF EXISTS "HistorialTurno_turnoId_fkey";

-- DropTable
DROP TABLE IF EXISTS "HistorialTurno";

-- AlterTable
ALTER TABLE "Turno"
DROP COLUMN "direccion",
DROP COLUMN "latitud",
DROP COLUMN "longitud",
DROP COLUMN "nombreInmobiliaria",
DROP COLUMN "nombrePropiedad",
DROP COLUMN "vendedorId";

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
