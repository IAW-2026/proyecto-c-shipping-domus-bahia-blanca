'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function tomarTurno(turnoId: string, agenteId: string) {
  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      agenteId,
      estado: 'PRE_ACEPTADO',
    },
  })

  await prisma.historialTurno.create({
    data: {
      turnoId,
      estado: 'PRE_ACEPTADO',
      realizadoPor: agenteId,
    },
  })

  revalidatePath('/dashboard/turnos')
}