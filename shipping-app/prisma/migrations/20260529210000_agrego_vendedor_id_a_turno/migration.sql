-- Add vendedorId back to Turno so seller apps can query appointments directly.
ALTER TABLE "Turno" ADD COLUMN "vendedorId" TEXT;

UPDATE "Turno" AS t
SET "vendedorId" = p."vendedorId"
FROM "Propiedad" AS p
WHERE t."propiedadId" = p."id";

ALTER TABLE "Turno" ALTER COLUMN "vendedorId" SET NOT NULL;

CREATE INDEX "Turno_vendedorId_idx" ON "Turno"("vendedorId");
