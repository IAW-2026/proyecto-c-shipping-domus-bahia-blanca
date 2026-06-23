import type { PropiedadTurno } from '@/app/components/turnos/types'
import { prisma } from '@/lib/prisma'

const SELLER_APP_BASE_URL = 'https://proyecto-c-seller-domus-bahia-blanc.vercel.app'
const PROPERTIES_API_BASE_URL = `${SELLER_APP_BASE_URL}/api/properties`

type ExternalPropertyResponse = {
  success: boolean
  data?: ExternalProperty | null
}

type ExternalProperty = {
  id: string
  title: string | null
  description: string | null
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
  price: number | null
  currency: string | null
  expenses: number | null
  propertyType: string | null
  commercialStatus: string | null
  operationType: string | null
  status: string | null
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  totalSqMeters: number | null
  coveredSqMeters: number | null
  antiquity: string | null
  condition: string | null
  features: Record<string, boolean> | null
  priorityOrder: number | null
  createdAt: string
  updatedAt: string
  seller: {
    id: string
    fullName: string | null
    agencyName: string | null
    email: string | null
    contactPhone: string | null
    bio: string | null
  } | null
  multimedia: {
    id: string
    propertyId: string
    fileUrl: string
    fileType: string
    sortOrder: number | null
    createdAt: string
  }[]
}

function normalizeSellerMediaUrl(fileUrl: string) {
  return new URL(fileUrl, SELLER_APP_BASE_URL).toString()
}

function mapExternalProperty(propiedad: ExternalProperty, propiedadId: string): PropiedadTurno | null {
  const vendedorId = propiedad.seller?.id
  if (!vendedorId) return null

  return {
    id: propiedadId,
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
    moneda: propiedad.currency ?? 'ARS',
    ambientes: propiedad.rooms,
    dormitorios: propiedad.bedrooms,
    banios: propiedad.bathrooms,
    metrosTotales: propiedad.totalSqMeters,
    metrosCubiertos: propiedad.coveredSqMeters,
    antiguedad: propiedad.antiquity,
    condicion: propiedad.condition,
    vendedorId,
    nombreInmobiliaria: propiedad.seller?.agencyName ?? null,
    multimedia: propiedad.multimedia.map((item) => ({
      id: item.id,
      url: normalizeSellerMediaUrl(item.fileUrl),
      alt: propiedad.title,
      order: item.sortOrder,
    })),
  }
}

async function fetchExternalProperty(propiedadId: string): Promise<PropiedadTurno | null> {
  const apiKey = process.env.SELLER_APP_API_KEY
  if (!apiKey) {
    console.error('Falta configurar SELLER_APP_API_KEY')
    return null
  }

  const response = await fetch(`${PROPERTIES_API_BASE_URL}/${encodeURIComponent(propiedadId)}`, {
    cache: 'no-store',
    headers: {
      'x-api-key': apiKey,
    },
  })

  if (!response.ok) return null

  const payload = (await response.json()) as ExternalPropertyResponse
  if (!payload.success || !payload.data) return null

  return mapExternalProperty(payload.data, propiedadId)
}

async function saveExternalProperty(propiedad: PropiedadTurno): Promise<PropiedadTurno | null> {
  await prisma.propiedad.create({
    data: {
      id: propiedad.id,
      nombrePropiedad: propiedad.nombrePropiedad,
      descripcion: propiedad.descripcion,
      direccion: propiedad.direccion,
      barrio: propiedad.barrio,
      ciudad: propiedad.ciudad,
      provincia: propiedad.provincia,
      pais: propiedad.pais,
      codigoPostal: propiedad.codigoPostal,
      latitud: propiedad.latitud,
      longitud: propiedad.longitud,
      precio: propiedad.precio,
      expensas: propiedad.expensas,
      moneda: propiedad.moneda,
      ambientes: propiedad.ambientes,
      dormitorios: propiedad.dormitorios,
      banios: propiedad.banios,
      metrosTotales: propiedad.metrosTotales,
      metrosCubiertos: propiedad.metrosCubiertos,
      antiguedad: propiedad.antiguedad,
      condicion: propiedad.condicion,
      vendedorId: propiedad.vendedorId,
      nombreInmobiliaria: propiedad.nombreInmobiliaria,
      multimedia: {
        create: propiedad.multimedia.map((item) => ({
          id: item.id,
          url: item.url,
          alt: item.alt,
          orden: item.order,
        })),
      },
    },
  })

  return fetchLocalProperty(propiedad.id)
}

async function fetchLocalProperty(propiedadId: string): Promise<PropiedadTurno | null> {
  const propiedadLocal = await prisma.propiedad.findUnique({
    where: { id: propiedadId },
    include: {
      multimedia: {
        orderBy: { orden: 'asc' },
      },
    },
  })

  if (!propiedadLocal) return null

  return {
    id: propiedadLocal.id,
    nombrePropiedad: propiedadLocal.nombrePropiedad,
    descripcion: propiedadLocal.descripcion,
    direccion: propiedadLocal.direccion,
    barrio: propiedadLocal.barrio,
    ciudad: propiedadLocal.ciudad,
    provincia: propiedadLocal.provincia,
    pais: propiedadLocal.pais,
    codigoPostal: propiedadLocal.codigoPostal,
    latitud: propiedadLocal.latitud,
    longitud: propiedadLocal.longitud,
    precio: propiedadLocal.precio?.toString() ?? null,
    expensas: propiedadLocal.expensas?.toString() ?? null,
    moneda: propiedadLocal.moneda,
    ambientes: propiedadLocal.ambientes,
    dormitorios: propiedadLocal.dormitorios,
    banios: propiedadLocal.banios,
    metrosTotales: propiedadLocal.metrosTotales,
    metrosCubiertos: propiedadLocal.metrosCubiertos,
    antiguedad: propiedadLocal.antiguedad,
    condicion: propiedadLocal.condicion,
    vendedorId: propiedadLocal.vendedorId,
    nombreInmobiliaria: propiedadLocal.nombreInmobiliaria,
    multimedia: propiedadLocal.multimedia.map((item) => ({
      id: item.id,
      url: item.url,
      alt: item.alt,
      order: item.orden,
    })),
  }
}

export async function fetchPropiedad(propiedadId: string): Promise<PropiedadTurno | null> {
  const localProperty = await fetchLocalProperty(propiedadId)
  if (localProperty) return localProperty

  try {
    const externalProperty = await fetchExternalProperty(propiedadId)
    if (externalProperty) return saveExternalProperty(externalProperty)
  } catch (error) {
    console.error('No se pudo obtener la propiedad externa', error)
  }

  return null
}
