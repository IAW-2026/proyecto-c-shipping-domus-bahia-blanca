'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

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

  await prisma.historialTurno.create({
    data: {
      turnoId,
      estado: 'PRE_ACEPTADO',
      realizadoPor: userId,
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

  await prisma.turno.create({
    data: {
      compradorId: userId,
      nombreComprador,
      propiedadId,
      nombrePropiedad,
      direccion,
      latitud,
      longitud,
      vendedorId,
      nombreInmobiliaria,
      fechaHoraSolicitada: fechaHora,
      observaciones,
      estado: 'PENDIENTE_AGENTE',
    },
  })

  redirect('/turnos/confirmado')
}