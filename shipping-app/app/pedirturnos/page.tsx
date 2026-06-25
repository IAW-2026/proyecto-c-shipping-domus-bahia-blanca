import { auth, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { TurnoForm } from '@/app/pedirturnos/turnoForm'
import { prisma } from '@/lib/prisma'
import { fetchPropiedad } from '@/lib/properties'
import { argentinaDateKeyFromInstant, argentinaTimeFromInstant } from '@/lib/turnos/horarios'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']
const DEFAULT_DOMUS_BACK_URL = 'https://domus-buyer-app.vercel.app/'

export const metadata = {
  title: 'Reservar turno - Domus',
  description: 'Formulario para reservar una visita a una propiedad publicada en Domus.',
}

function normalizeOrigin(value: string | undefined) {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function isAllowedDomusReturnUrl(value: string, requestOrigin: string | null) {
  try {
    const url = requestOrigin ? new URL(value, requestOrigin) : new URL(value)
    const sellerOrigin = normalizeOrigin(process.env.SELLER_INMOBILIARIAS_URL) ?? DEFAULT_DOMUS_BACK_URL.slice(0, -1)
    const allowedOrigins = new Set([sellerOrigin])

    if (requestOrigin) allowedOrigins.add(requestOrigin)

    return allowedOrigins.has(url.origin)
  } catch {
    return false
  }
}

function domusBackHref({
  returnTo,
  referer,
  requestOrigin,
}: {
  returnTo?: string
  referer?: string | null
  requestOrigin: string | null
}) {
  if (returnTo && isAllowedDomusReturnUrl(returnTo, requestOrigin)) {
    return requestOrigin ? new URL(returnTo, requestOrigin).toString() : returnTo
  }
  if (referer && isAllowedDomusReturnUrl(referer, requestOrigin)) return referer

  return process.env.SELLER_INMOBILIARIAS_URL ?? DEFAULT_DOMUS_BACK_URL
}

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ propiedadId?: string; source?: string; returnTo?: string }>
}) {
  const { propiedadId, source, returnTo } = await searchParams
  const { userId } = await auth()
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https'
  const requestOrigin = normalizeOrigin(
    requestHeaders.get('origin') ?? (host ? `${protocol}://${host}` : undefined)
  )
  const backHref = domusBackHref({
    returnTo,
    referer: requestHeaders.get('referer'),
    requestOrigin,
  })

  if (!userId) {
    const params = new URLSearchParams()
    if (propiedadId) params.set('propiedadId', propiedadId)
    if (source) params.set('source', source)
    if (returnTo) params.set('returnTo', returnTo)

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
        backHref={backHref}
      />
    </main>
  )
}
