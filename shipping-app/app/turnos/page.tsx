import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { TurnoForm } from '@/app/turnos/turnoForm'
import { prisma } from '@/lib/prisma'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

// TODO: reemplazar con la URL real de la app externa
type PropiedadExterna = {
  id: string
  sellerId: string
  title: string
  address: string | null
  street: string | null
  streetNumber: string | null
  neighborhood: string | null
  city: string | null
  province: string | null
  country: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  multimedia: {
    id: string
    url: string
    alt?: string | null
    order?: number | null
  }[]
}

const MOCK_PROPIEDADES: PropiedadExterna[] = [
  {
    id: 'casa-cj',
    sellerId: 'inm-3',
    title: 'Casa CJ',
    address: 'Grove Street 12, Bahia Blanca',
    street: 'Grove Street',
    streetNumber: '12',
    neighborhood: 'Centro',
    city: 'Bahia Blanca',
    province: 'Buenos Aires',
    country: 'Argentina',
    postalCode: '8000',
    latitude: -38.7183,
    longitude: -62.2663,
    multimedia: [{ id: 'casa-cj-1', url: '/CasaCJ.webp', alt: 'Fachada de Casa CJ', order: 1 }],
  },
  {
    id: 'luke-house',
    sellerId: 'inm-3',
    title: 'Casa Luke',
    address: 'Tatooine 1977, Bahia Blanca',
    street: 'Tatooine',
    streetNumber: '1977',
    neighborhood: 'Palihue',
    city: 'Bahia Blanca',
    province: 'Buenos Aires',
    country: 'Argentina',
    postalCode: '8000',
    latitude: -38.6968,
    longitude: -62.2901,
    multimedia: [{ id: 'luke-house-1', url: '/luke_1.webp', alt: 'Fachada de Casa Luke', order: 1 }],
  },
  {
    id: 'casa-simpsons',
    sellerId: 'inm-3',
    title: 'Casa Simpsons',
    address: 'Av. Siempreviva 742, Bahia Blanca',
    street: 'Av. Siempreviva',
    streetNumber: '742',
    neighborhood: 'Universitario',
    city: 'Bahia Blanca',
    province: 'Buenos Aires',
    country: 'Argentina',
    postalCode: '8000',
    latitude: -38.7075,
    longitude: -62.2676,
    multimedia: [{ id: 'casa-simpsons-1', url: '/casaSimpsons.webp', alt: 'Fachada de Casa Simpsons', order: 1 }],
  },
]

function mapPropiedadExterna(propiedad: PropiedadExterna) {
  const image = [...propiedad.multimedia].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]

  return {
    id: propiedad.id,
    nombrePropiedad: propiedad.title,
    direccion: propiedad.address,
    latitud: propiedad.latitude,
    longitud: propiedad.longitude,
    vendedorId: propiedad.sellerId,
    nombreInmobiliaria: 'Domus Bahia Blanca',
    imageUrl: image?.url ?? null,
    imageAlt: image?.alt ?? propiedad.title,
  }
}
//TODO: Implementar el fetch bien cuando estemos en etapa 3
async function fetchPropiedad(propiedadId: string) {
  const propiedad = MOCK_PROPIEDADES.find((item) => item.id === propiedadId)
  if (!propiedad) return null

  return mapPropiedadExterna({
    ...propiedad,
    id: propiedadId,
  })
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

  if (!propiedad) notFound()

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
