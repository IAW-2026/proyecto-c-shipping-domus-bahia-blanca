import { NextResponse, type NextRequest } from 'next/server'
import { getTurnoWeather } from '@/lib/weather/openweather'

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lon = Number(request.nextUrl.searchParams.get('lon'))
  const date = request.nextUrl.searchParams.get('date')
  const time = request.nextUrl.searchParams.get('time')
 
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !date) {
    return NextResponse.json(
      { error: 'lat, lon y date son requeridos' },
      { status: 400 }
    )
  }

  const result = await getTurnoWeather({ lat, lon, date, time })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    )
  }

  return NextResponse.json(result.weather)
}
