import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { TurnoForm } from '@/app/turnos/turnoForm'
import { prisma } from '@/lib/prisma'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']

export const metadata = {
  title: 'Reservar turno - Domus',
}

// TODO: reemplazar con la URL real de la app externa
type PropiedadExterna = {
  id: string
  sellerId: string
  title: string
  address: string | null
  description: string | null
  neighborhood: string | null
  city: string | null
  province: string | null
  country: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  price: string | number | null
  expenses: string | number | null
  currency: string
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  totalSqMeters: number | null
  coveredSqMeters: number | null
  antiquity: string | null
  condition: string | null
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
    description: 'Casa familiar con patio y ambientes luminosos.',
    address: 'Grove Street 12, Bahia Blanca',
    neighborhood: 'Centro',
    city: 'Bahia Blanca',
    province: 'Buenos Aires',
    country: 'Argentina',
    postalCode: '8000',
    latitude: -38.7183,
    longitude: -62.2663,
    price: '120000',
    expenses: null,
    currency: 'USD',
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    totalSqMeters: 180,
    coveredSqMeters: 135,
    antiquity: 'Entre 10 y 20 años',
    condition: 'BUENA',
    multimedia: [{ id: 'casa-cj-1', url: '/CasaCJ.webp', alt: 'Fachada de Casa CJ', order: 1 }],
  },
  {
    id: 'luke-house',
    sellerId: 'inm-3',
    title: 'Casa Luke',
    description: 'Propiedad tranquila en zona residencial.',
    address: 'Tatooine 1977, Bahia Blanca',
    neighborhood: 'Palihue',
    city: 'Bahia Blanca',
    province: 'Buenos Aires',
    country: 'Argentina',
    postalCode: '8000',
    latitude: -38.6968,
    longitude: -62.2901,
    price: '98000',
    expenses: null,
    currency: 'USD',
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    totalSqMeters: 140,
    coveredSqMeters: 95,
    antiquity: 'Entre 40 y 50 años',
    condition: 'MUY_BUENA',
    multimedia: [{ id: 'luke-house-1', url: '/luke_1.webp', alt: 'Fachada de Casa Luke', order: 1 }],
  },
  {
    id: 'casa-simpsons',
    sellerId: 'inm-3',
    title: 'Casa Simpsons',
    description: 'Casa amplia con jardin y ubicacion urbana.',
    address: 'Av. Siempreviva 742, Bahia Blanca',
    neighborhood: 'Universitario',
    city: 'Bahia Blanca',
    province: 'Buenos Aires',
    country: 'Argentina',
    postalCode: '8000',
    latitude: -38.7075,
    longitude: -62.2676,
    price: '150000',
    expenses: '12000',
    currency: 'USD',
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    totalSqMeters: 220,
    coveredSqMeters: 160,
    antiquity: 'Entre 40 y 50 años',
    condition: 'BUENA',
    multimedia: [{ id: 'casa-simpsons-1', url: '/casaSimpsons.webp', alt: 'Fachada de Casa Simpsons', order: 1 }],
  },
]

function mapPropiedadExterna(propiedad: PropiedadExterna) {
  return {
    id: propiedad.id,
    nombrePropiedad: propiedad.title,
    descripcion: propiedad.description,
    direccion: propiedad.address,
    barrio: propiedad.neighborhood,
    ciudad: propiedad.city,
    provincia: propiedad.province,
    pais: propiedad.country,
    codigoPostal: propiedad.postalCode,
    latitud: propiedad.latitude,
    longitud: propiedad.longitude,
    precio: propiedad.price,
    expensas: propiedad.expenses,
    moneda: propiedad.currency,
    ambientes: propiedad.rooms,
    dormitorios: propiedad.bedrooms,
    banios: propiedad.bathrooms,
    metrosTotales: propiedad.totalSqMeters,
    metrosCubiertos: propiedad.coveredSqMeters,
    antiguedad: propiedad.antiquity,
    condicion: propiedad.condition,
    vendedorId: propiedad.sellerId,
    nombreInmobiliaria: 'Domus Bahia Blanca',
    multimedia: propiedad.multimedia,
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
