type InmobiliariaItem = {
  id: string
  nombre: string
}

export async function getInmobiliarias() {
  const url = process.env.SELLER_INMOBILIARIAS_URL
  const apiKey = process.env.SELLER_CALLBACK_KEY

  if (!url || !apiKey) {
    throw new Error('Missing seller inmobiliarias configuration')
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Seller inmobiliarias error: ${details}`)
  }

  const payload = (await response.json()) as
    | { inmobiliarias: InmobiliariaItem[] }
    | InmobiliariaItem[]

  return Array.isArray(payload)
    ? payload
    : payload.inmobiliarias
}