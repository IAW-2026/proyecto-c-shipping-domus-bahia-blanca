'use server'

import { revalidatePath } from 'next/cache'
import type { EstadoTurno } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

export async function tomarTurno(turnoId: string) {
  const { userId } = await auth()
  
    if (!userId) throw new Error('No autorizado')
  
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { estado: true },
    })
  
    if (!turno) throw new Error('Turno no encontrado')
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
  direccion,
  latitud,
  longitud,
  vendedorId,
  nombreInmobiliaria,
  nombreComprador,
  fechaHora,
  observaciones,
}: {
  propiedadId: string
  nombrePropiedad?: string | null
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  vendedorId: string
  nombreInmobiliaria?: string | null
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

  const turno = await prisma.turno.create({
    data: {
      compradorId: userId,
      nombreComprador,
      fechaHoraSolicitada: fechaHora,
      observaciones,
      estado: 'PENDIENTE_AGENTE',
      propiedad: {
        connectOrCreate: {
          where: { id: propiedadId },
          create: {
            id: propiedadId,
            nombrePropiedad,
            direccion,
            latitud,
            longitud,
            vendedorId,
            nombreInmobiliaria,
          },
        },
      },
    },
    select: {
      id: true,
    },
  })

  revalidatePath('/dashboard/turnos')
  revalidatePath('/turnos')

  return turno
}
