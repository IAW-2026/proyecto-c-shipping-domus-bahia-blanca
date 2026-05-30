'use server'

import { revalidatePath } from 'next/cache'
import type { EstadoTurno } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

export async function tomarTurno(turnoId: string) {
  const { userId } = await auth()

  if (!userId) throw new Error('No autorizado')

  const [turno, agente] = await Promise.all([
    prisma.turno.findUnique({
      where: { id: turnoId },
      select: { estado: true, vendedorId: true },
    }),
    prisma.agenteInmobiliario.findUnique({
      where: { id: userId },
      select: { vendedorId: true },
    }),
  ])

  if (!turno) throw new Error('Turno no encontrado')
  if (!agente?.vendedorId || agente.vendedorId !== turno.vendedorId) {
    throw new Error('No autorizado')
  }
  if (turno.estado !== 'PENDIENTE_AGENTE') throw new Error('El turno no puede ser aceptado')

  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: 'PRE_ACEPTADO',
      agenteId: userId,
    },
  })

  revalidatePath('/dashboard/turnos')
}

export async function cancelarTurno(turnoId: string) {
  const { userId } = await auth()

  if (!userId) throw new Error('No autorizado')

  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: { agenteId: true, estado: true },
  })

  if (!turno) throw new Error('Turno no encontrado')
  if (turno.agenteId !== userId) throw new Error('No autorizado')
  if (turno.estado === 'PENDIENTE_AGENTE') throw new Error('El turno ya está pendiente')

  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: 'PENDIENTE_AGENTE',
      agenteId: null,
    },
  })

  revalidatePath(`/dashboard/turnos/${turnoId}`)
}

export async function crearTurno({
  propiedadId,
  nombrePropiedad,
  descripcion,
  direccion,
  barrio,
  ciudad,
  provincia,
  pais,
  codigoPostal,
  latitud,
  longitud,
  precio,
  expensas,
  moneda,
  ambientes,
  dormitorios,
  banios,
  metrosTotales,
  metrosCubiertos,
  antiguedad,
  condicion,
  vendedorId,
  nombreInmobiliaria,
  multimedia,
  nombreComprador,
  fechaHora,
  observaciones,
}: {
  propiedadId: string
  nombrePropiedad?: string | null
  descripcion?: string | null
  direccion?: string | null
  barrio?: string | null
  ciudad?: string | null
  provincia?: string | null
  pais?: string | null
  codigoPostal?: string | null
  latitud?: number | null
  longitud?: number | null
  precio?: string | number | null
  expensas?: string | number | null
  moneda?: string
  ambientes?: number | null
  dormitorios?: number | null
  banios?: number | null
  metrosTotales?: number | null
  metrosCubiertos?: number | null
  antiguedad?: string | null
  condicion?: string | null
  vendedorId: string
  nombreInmobiliaria?: string | null
  multimedia?: {
    id: string
    url: string
    alt?: string | null
    order?: number | null
  }[]
  nombreComprador?: string
  fechaHora: Date
  observaciones?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const turnoExistenteComprador = await prisma.turno.findFirst({
    where: {
      compradorId: userId,
      propiedadId,
      estado: {
        in: ACTIVE_TURNO_STATES,
      },
    },
    select: {
      id: true,
    },
  })

  if (turnoExistenteComprador) {
    throw new Error('Ya tenes una reserva activa para esta propiedad')
  }

  const turnoExistenteHorario = await prisma.turno.findFirst({
    where: {
      propiedadId,
      fechaHoraSolicitada: fechaHora,
      estado: {
        in: ACTIVE_TURNO_STATES,
      },
    },
    select: {
      id: true,
    },
  })

  if (turnoExistenteHorario) {
    throw new Error('Ese horario ya no esta disponible')
  }

  const propiedadData = {
    nombrePropiedad,
    descripcion,
    direccion,
    barrio,
    ciudad,
    provincia,
    pais,
    codigoPostal,
    latitud,
    longitud,
    precio,
    expensas,
    moneda,
    ambientes,
    dormitorios,
    banios,
    metrosTotales,
    metrosCubiertos,
    antiguedad,
    condicion,
    vendedorId,
    nombreInmobiliaria,
  }
  const multimediaData = (multimedia ?? []).map((item, index) => ({
    id: item.id,
    url: item.url,
    alt: item.alt,
    orden: item.order ?? index,
  }))

  const propiedad = await prisma.propiedad.upsert({
    where: { id: propiedadId },
    update: {
      ...propiedadData,
      multimedia: {
        deleteMany: {},
        create: multimediaData,
      },
    },
    create: {
      id: propiedadId,
      ...propiedadData,
      multimedia: {
        create: multimediaData,
      },
    },
    select: {
      vendedorId: true,
    },
  })

  const turno = await prisma.turno.create({
    data: {
      compradorId: userId,
      vendedorId: propiedad.vendedorId,
      nombreComprador,
      fechaHoraSolicitada: fechaHora,
      observaciones,
      estado: 'PENDIENTE_AGENTE',
      propiedadId,
    },
    select: {
      id: true,
    },
  })

  revalidatePath('/dashboard/turnos')
  revalidatePath('/turnos')

  return turno
}
