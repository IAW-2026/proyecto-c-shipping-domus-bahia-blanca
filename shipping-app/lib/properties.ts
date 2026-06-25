import type { PropiedadTurno } from '@/app/components/turnos/types'
import { prisma } from '@/lib/prisma'

const DEFAULT_SELLER_APP_BASE_URL = 'https://proyecto-c-seller-domus-bahia-blanc.vercel.app'

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
  multimedia?: {
    id?: string | null
    propertyId?: string | null
    fileUrl?: string | null
    secureUrl?: string | null
    secure_url?: string | null
    url?: string | null
    fileType?: string | null
    sortOrder?: number | null
    createdAt?: string | null
  }[] | null
}

function sellerAppBaseUrl() {
  return (
    process.env.SELLER_APP_API_URL ??
    process.env.SELLERAPP_API_URL ??
    DEFAULT_SELLER_APP_BASE_URL
  ).replace(/\/+$/, '')
}

function propertiesApiBaseUrl() {
  return `${sellerAppBaseUrl()}/api/properties`
}

function normalizeSellerMediaUrl(fileUrl?: string | null) {
  const cleanUrl = fileUrl?.trim()
  if (!cleanUrl) return null

  try {
    return new URL(cleanUrl, `${sellerAppBaseUrl()}/`).toString()
  } catch {
    return null
  }
}

function normalizeMediaId(propiedadId: string, mediaId: string | null | undefined, index: number) {
  const cleanMediaId = mediaId?.trim()
  return cleanMediaId
    ? `${propiedadId}-${cleanMediaId}`
    : `${propiedadId}-media-${index}`
}

function mapExternalMultimedia(propiedad: ExternalProperty, propiedadId: string): PropiedadTurno['multimedia'] {
  const usedIds = new Set<string>()

  return (propiedad.multimedia ?? []).flatMap((item, index) => {
    const fileType = item.fileType?.toUpperCase()
    if (fileType && fileType !== 'IMAGE') return []

    const url = normalizeSellerMediaUrl(item.fileUrl ?? item.secureUrl ?? item.secure_url ?? item.url)
    if (!url) return []

    const id = normalizeMediaId(propiedadId, item.id, index)
    if (usedIds.has(id)) return []
    usedIds.add(id)

    return [{
      id,
      url,
      alt: propiedad.title ?? propiedad.address ?? 'Propiedad',
      order: item.sortOrder ?? index,
    }]
  })
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
    multimedia: mapExternalMultimedia(propiedad, propiedadId),
  }
}

async function fetchExternalProperty(propiedadId: string): Promise<PropiedadTurno | null> {
  const apiKey = process.env.SELLER_APP_API_KEY
  if (!apiKey) {
    console.error('Falta configurar SELLER_APP_API_KEY')
    return null
  }

  const response = await fetch(`${propertiesApiBaseUrl()}/${encodeURIComponent(propiedadId)}`, {
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

async function replacePropertyMultimedia(propiedad: PropiedadTurno): Promise<PropiedadTurno | null> {
  if (propiedad.multimedia.length === 0) return fetchLocalProperty(propiedad.id)

  await prisma.propiedad.update({
    where: { id: propiedad.id },
    data: {
      multimedia: {
        deleteMany: {},
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
  if (localProperty?.multimedia.length) return localProperty

  try {
    const externalProperty = await fetchExternalProperty(propiedadId)
    if (!externalProperty) return localProperty

    if (localProperty) {
      return replacePropertyMultimedia(externalProperty)
    }

    return saveExternalProperty(externalProperty)
  } catch (error) {
    console.error('No se pudo obtener la propiedad externa', error)
  }

  return localProperty
}

