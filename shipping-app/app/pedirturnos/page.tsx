import { auth, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { TurnoForm } from '@/app/pedirturnos/turnoForm'
import { prisma } from '@/lib/prisma'
import { fetchPropiedad } from '@/lib/properties'
import { domusBackHref, requestOriginFromHeaders } from '@/lib/turnos/domusBackHref'
import { argentinaDateKeyFromInstant, argentinaTimeFromInstant } from '@/lib/turnos/horarios'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

export const metadata = {
  title: 'Reservar turno - Domus',
  description: 'Formulario para reservar una visita a una propiedad publicada en Domus.',
}

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ propiedadId?: string; source?: string; returnTo?: string }>
}) {
  const { propiedadId, source, returnTo } = await searchParams
  const { userId } = await auth()
  const requestHeaders = await headers()
  const requestOrigin = requestOriginFromHeaders(requestHeaders)
  const backDestination = domusBackHref({
    returnTo,
    referer: requestHeaders.get('referer'),
    requestOrigin,
    propertyId: propiedadId,
  })

  if (!userId) {
    const params = new URLSearchParams()
    if (propiedadId) params.set('propiedadId', propiedadId)
    if (source) params.set('source', source)
    if (returnTo) params.set('returnTo', returnTo)

    const query = params.toString()
    const turnoUrl = query ? `/pedirturnos?${query}` : '/pedirturnos'

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
    const params = new URLSearchParams({
      turnoId: turnoExistente.id,
      returnTo: backDestination.href,
    })

    redirect(`/pedirturnos/gracias?${params.toString()}`)
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
        backHref={backDestination.href}
      />
    </main>
  )
}
