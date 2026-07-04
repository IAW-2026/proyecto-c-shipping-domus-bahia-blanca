ALTER TABLE "Propiedad"
ADD COLUMN "descripcion" TEXT,
ADD COLUMN "barrio" TEXT,
ADD COLUMN "ciudad" TEXT,
ADD COLUMN "provincia" TEXT,
ADD COLUMN "pais" TEXT,
ADD COLUMN "codigoPostal" TEXT,
ADD COLUMN "precio" DECIMAL(14, 2),
ADD COLUMN "expensas" DECIMAL(14, 2),
ADD COLUMN "moneda" TEXT NOT NULL DEFAULT 'ARS',
ADD COLUMN "ambientes" INTEGER,
ADD COLUMN "dormitorios" INTEGER,
ADD COLUMN "banios" INTEGER,
ADD COLUMN "metrosTotales" INTEGER,
ADD COLUMN "metrosCubiertos" INTEGER,
ADD COLUMN "antiguedad" TEXT,
ADD COLUMN "condicion" TEXT;

CREATE TABLE "PropertyMultimedia" (
  "id" TEXT NOT NULL,
  "propiedadId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "orden" INTEGER,

  CONSTRAINT "PropertyMultimedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyMultimedia_propiedadId_idx" ON "PropertyMultimedia"("propiedadId");

ALTER TABLE "PropertyMultimedia"
ADD CONSTRAINT "PropertyMultimedia_propiedadId_fkey"
FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
