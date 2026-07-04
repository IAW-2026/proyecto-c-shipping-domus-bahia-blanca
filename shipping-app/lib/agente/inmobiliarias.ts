const SELLER_INMOBILIARIAS_PATH = '/api/sellers'

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

function buildSellerInmobiliariasUrl(baseUrl: string) {
  return new URL(SELLER_INMOBILIARIAS_PATH, baseUrl).toString()
}

function normalizeInmobiliarias(payload: SellerInmobiliariasResponse): InmobiliariaItem[] {
  if (Array.isArray(payload)) return payload

  if ('inmobiliarias' in payload) return payload.inmobiliarias

  if (!payload.success || !payload.data) return []

  const data = Array.isArray(payload.data) ? payload.data : [payload.data]
  return data.filter(isSellerInmobiliaria).map(mapSellerInmobiliaria)
}

export async function getInmobiliarias() {
  const baseUrl = process.env.SELLER_INMOBILIARIAS_URL
  const apiKey = process.env.SELLER_APP_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('Missing seller inmobiliarias configuration')
  }

  const url = buildSellerInmobiliariasUrl(baseUrl)

  const response = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Seller inmobiliarias error ${response.status}: ${text.slice(0, 200)}`)
  }

  try {
    const payload = JSON.parse(text) as SellerInmobiliariasResponse
    return normalizeInmobiliarias(payload)
  } catch {
    const contentType = response.headers.get('content-type') ?? 'sin content-type'
    throw new Error(
      `Seller inmobiliarias no devolvio JSON. Status: ${response.status}. Content-Type: ${contentType}. Respuesta: ${text.slice(0, 200)}`
    )
  }
}