type InmobiliariaItem = {
  id: string
  nombre: string
}
//Descomentar cuando tenga la url y apikey

export async function getInmobiliarias(): Promise<InmobiliariaItem[]> {
  return [
    { id: 'inm-1', nombre: 'Domus Centro' },
    { id: 'inm-2', nombre: 'Bahia Norte' },
    { id: 'inm-3', nombre: 'Costa Sur' },
    { id: 'inm-4', nombre: 'Domus Norte'},
    { id: 'inm-5', nombre: 'Costa Norte' },
    { id: 'inm-6', nombre: 'Bahia Sur' },
  ]
}
/*


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
    */