'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function aceptarTurno(turnoId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('No autorizado')
  }

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
}