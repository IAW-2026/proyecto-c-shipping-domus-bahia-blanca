import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { TurnoForm } from '@/app/turnos/turnoForm'
import { prisma } from '@/lib/prisma'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

// TODO: reemplazar con la URL real de la app externa
async function fetchPropiedad(propiedadId: string) {
  // Mock mientras no esté disponible el endpoint
  return {
    id: propiedadId,
    nombrePropiedad: 'Casa en Av. Alem 1200',
    direccion: 'Av. Alem 1200, Bahía Blanca',
    latitud: -38.7183,
    longitud: -62.2663,
    vendedorId: 'inm-3',
    nombreInmobiliaria: 'Domus Bahía Blanca',
  }

  // Cuando esté listo:
  // const res = await fetch(`https://otra-app.com/api/propiedades/${propiedadId}`)
  // if (!res.ok) return null
  // return res.json()
}

function formatSlotDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatSlotTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
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

  const turnoExistente = await prisma.turno.findFirst({
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

  if (turnoExistente) {
    redirect(`/turnos/gracias?turnoId=${turnoExistente.id}`)
  }

  const turnosOcupados = await prisma.turno.findMany({
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
  })

  const horariosOcupados = turnosOcupados.reduce<Record<string, string[]>>((acc, turno) => {
    if (!turno.fechaHoraSolicitada) return acc

    const dateKey = formatSlotDate(turno.fechaHoraSolicitada)
    acc[dateKey] = [...(acc[dateKey] ?? []), formatSlotTime(turno.fechaHoraSolicitada)]

    return acc
  }, {})

  const [propiedad, user] = await Promise.all([
    fetchPropiedad(propiedadId),
    currentUser(),
  ])

  if (!propiedad) redirect('/')

  return (
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
  )
}
