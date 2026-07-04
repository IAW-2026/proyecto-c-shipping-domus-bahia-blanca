-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'RECHAZADO_VENDEDOR', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO');

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "compradorId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "fechaHoraSolicitada" TIMESTAMP(3) NOT NULL,
    "fechaHoraConfirmada" TIMESTAMP(3),
    "estado" "EstadoTurno" NOT NULL,
    "observaciones" TEXT,
    "respuestaAgenteEn" TIMESTAMP(3),
    "respuestaVendedorEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgenteInmobiliario" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "vendedorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AgenteInmobiliario_pkey" PRIMARY KEY ("id")
);

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


-- CreateIndex
CREATE UNIQUE INDEX "AgenteInmobiliario_clerkUserId_key" ON "AgenteInmobiliario"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AgenteInmobiliario_email_key" ON "AgenteInmobiliario"("email");

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "AgenteInmobiliario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialTurno" ADD CONSTRAINT "HistorialTurno_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;