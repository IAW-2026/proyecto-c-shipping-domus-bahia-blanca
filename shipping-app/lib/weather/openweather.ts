type OpenWeatherForecastItem = {
  dt: number
  dt_txt: string
  main: {
    temp: number
    feels_like: number
  }
  weather: {
    description: string
    icon: string
  }[]
  pop?: number
}

type OpenWeatherForecastResponse = {
  list?: OpenWeatherForecastItem[]
  message?: string
}

export type TurnoWeather = {
  temperature: number
  feelsLike: number
  description: string
  precipitationProbability: number
  iconUrl: string
  forecastTime: string
}

type WeatherResult =
  | { ok: true; weather: TurnoWeather }
  | { ok: false; status: number; error: string }

function targetHourFromTime(time?: string | null) {
  if (!time) return 12

  const hour = Number(time.split(':')[0])
  return Number.isFinite(hour) ? hour : 12
}

function findClosestForecast(
  items: OpenWeatherForecastItem[],
  date: string,
  time?: string | null
) {
  const dayItems = items.filter((item) => item.dt_txt.startsWith(date))
  const candidates = dayItems.length > 0 ? dayItems : items
  const targetHour = targetHourFromTime(time)

  return candidates.reduce<OpenWeatherForecastItem | null>((closest, item) => {
    if (!closest) return item

    const itemHour = Number(item.dt_txt.slice(11, 13))
    const closestHour = Number(closest.dt_txt.slice(11, 13))

    return Math.abs(itemHour - targetHour) < Math.abs(closestHour - targetHour)
      ? item
      : closest
  }, null)
}

export async function getTurnoWeather({
  lat,
  lon,
  date,
  time,
}: {
  lat: number
  lon: number
  date: string
  time?: string | null
}): Promise<WeatherResult> {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim()

  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY no esta configurada.')
    return { ok: false, status: 503, error: 'OPENWEATHER_API_KEY no esta configurada' }
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    appid: apiKey,
    units: 'metric',
    lang: 'es',
  })

  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as OpenWeatherForecastResponse | null

    return {
      ok: false,
      status: response.status,
      error: payload?.message ?? 'OpenWeather no devolvio un pronostico valido',
    }
  }

  const payload = (await response.json()) as OpenWeatherForecastResponse
  const forecast = findClosestForecast(payload.list ?? [], date, time)
  const weather = forecast?.weather[0]

  if (!forecast || !weather) {
    return {
      ok: false,
      status: 404,
      error: 'Pronostico no disponible para esa fecha',
    }
  }

  return {
    ok: true,
    weather: {
      temperature: Math.round(forecast.main.temp),
      feelsLike: Math.round(forecast.main.feels_like),
      description: weather.description,
      precipitationProbability: Math.round((forecast.pop ?? 0) * 100),
      iconUrl: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
      forecastTime: forecast.dt_txt,
    },
  }
}
