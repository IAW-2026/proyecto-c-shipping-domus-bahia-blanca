import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { TurnoForm } from '@/app/pedirturnos/turnoForm'
import { prisma } from '@/lib/prisma'
import { fetchPropiedad } from '@/lib/properties'
import { argentinaDateKeyFromInstant, argentinaTimeFromInstant } from '@/lib/turnos/horarios'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

export const metadata = {
  title: 'Reservar turno - Domus',
  description: 'Formulario para reservar una visita a una propiedad publicada en Domus.',
}

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ propiedadId?: string; source?: string }>
}) {
  const { propiedadId, source } = await searchParams
  const { userId } = await auth()

  if (!userId) {
    const params = new URLSearchParams()
    if (propiedadId) params.set('propiedadId', propiedadId)
    if (source) params.set('source', source)

    const query = params.toString()
    const turnoUrl = query ? `/turnos?${query}` : '/turnos'

    redirect(`/sign-in?redirect_url=${encodeURIComponent(turnoUrl)}`)
  }

  if (!propiedadId) redirect('/')

  const [turnoExistente, turnosOcupados, propiedad, user] = await Promise.all([
    prisma.turno.findFirst({
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
    }),
    prisma.turno.findMany({
      where: {
        propiedadId,
        estado: {
          in: ACTIVE_TURNO_STATES,
        },
        fechaHoraSolicitada: {
          not: null,
        },
      },
      select: {
        fechaHoraSolicitada: true,
      },
    }),
    fetchPropiedad(propiedadId),
    currentUser(),
  ])

  if (turnoExistente) {
    redirect(`/turnos/gracias?turnoId=${turnoExistente.id}`)
  }

  const horariosOcupados = turnosOcupados.reduce<Record<string, string[]>>((acc, turno) => {
    if (!turno.fechaHoraSolicitada) return acc

    const dateKey = argentinaDateKeyFromInstant(turno.fechaHoraSolicitada)
    acc[dateKey] = [...(acc[dateKey] ?? []), argentinaTimeFromInstant(turno.fechaHoraSolicitada)]

    return acc
  }, {})

  if (!propiedad) notFound()

  return (
    <main>
      <TurnoForm
        propiedad={{
          ...propiedad,
          id: propiedadId,
        }}
        comprador={{
          id: userId,
          nombre: user?.fullName ?? '',
          email: user?.emailAddresses[0].emailAddress ?? '',
        }}
        horariosOcupados={horariosOcupados}
      />
    </main>
  )
}
