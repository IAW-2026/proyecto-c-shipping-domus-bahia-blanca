import { NextResponse, type NextRequest } from 'next/server'
import { requireShippingApiKey } from '@/lib/api-key'
import { getLastMonthAppointmentsByStatus } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const unauthorized = requireShippingApiKey(request)
  if (unauthorized) return unauthorized

  const data = await getLastMonthAppointmentsByStatus()

  return NextResponse.json({ success: true, data })
}
