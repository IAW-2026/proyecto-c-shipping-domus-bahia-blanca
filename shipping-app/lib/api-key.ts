import { NextResponse } from 'next/server'

function getBearerToken(request: Request) {
  const authHeader = request.headers.get('authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
}

export function requireShippingApiKey(request: Request) {
  const expectedApiKey = process.env.SHIPPING_API_KEY
  const receivedApiKey = request.headers.get('x-api-key') ?? getBearerToken(request)

  if (!expectedApiKey || receivedApiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  return null
}
