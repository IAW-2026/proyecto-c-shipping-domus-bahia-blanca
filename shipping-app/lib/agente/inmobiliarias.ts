export type InmobiliariaItem = {
  id: string
  nombre: string
}

type SellerInmobiliaria = {
  id: string
  fullName: string | null
  agencyName: string | null
  email: string | null
  contactPhone: string | null
  bio: string | null
}

type SellerInmobiliariasResponse =
  | {
      success: boolean
      data?: SellerInmobiliaria | SellerInmobiliaria[] | null
    }
  | {
      inmobiliarias: InmobiliariaItem[]
    }
  | InmobiliariaItem[]

function mapSellerInmobiliaria(item: SellerInmobiliaria): InmobiliariaItem {
  return {
    id: item.id,
    nombre: item.agencyName ?? item.fullName ?? item.email ?? 'Inmobiliaria sin nombre',
  }
}

function isSellerInmobiliaria(item: unknown): item is SellerInmobiliaria {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'agencyName' in item
  )
}

function normalizeInmobiliarias(payload: SellerInmobiliariasResponse): InmobiliariaItem[] {
  if (Array.isArray(payload)) return payload

  if ('inmobiliarias' in payload) return payload.inmobiliarias

  if (!payload.success || !payload.data) return []

  const data = Array.isArray(payload.data) ? payload.data : [payload.data]
  return data.filter(isSellerInmobiliaria).map(mapSellerInmobiliaria)
}

export async function getInmobiliarias() {
  const url = process.env.SELLER_INMOBILIARIAS_URL
  const apiKey = process.env.SELLER_APP_API_KEY

  if (!url || !apiKey) {
    throw new Error('Missing seller inmobiliarias configuration')
  }

  const response = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Seller inmobiliarias error: ${details}`)
  }

  const payload = (await response.json()) as SellerInmobiliariasResponse

  return normalizeInmobiliarias(payload)
}
    
