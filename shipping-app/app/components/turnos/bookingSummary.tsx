import type { ReactNode } from 'react'
import Image from 'next/image'
import { CalendarDays, Clock, CloudSun, Droplets, MapPin } from 'lucide-react'
import type { CompradorTurno, PropiedadTurno } from '@/app/components/turnos/types'

type TurnoWeather = {
  temperature: number
  feelsLike: number
  description: string
  precipitationProbability: number
  iconUrl: string
  forecastTime: string
}

type Props = {
  comprador: CompradorTurno
  propiedad: PropiedadTurno
  selectedDateLabel: string
  selectedTime: string | null
  weather?: TurnoWeather | null
  weatherLoading?: boolean
  weatherError?: string | null
}

export function BookingSummary({
  comprador,
  propiedad,
  selectedDateLabel,
  selectedTime,
  weather,
  weatherLoading = false,
  weatherError,
}: Props) {
  return (
    <aside className="order-2 self-start space-y-4 lg:col-start-1 lg:row-start-1 lg:mt-[calc(75%+1.5rem)]">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reservando como</p>
        <p className="mt-2 text-[15px] font-medium">{comprador.nombre}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{comprador.email}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <p className="text-[11px] uppercase tracking-[0.18em] text-accent-warm">Resumen</p>
        <h3 className="mt-2 font-display text-[20px] font-medium leading-snug">
          {propiedad.nombrePropiedad}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {propiedad.direccion}
        </p>
        <div className="mt-5 space-y-3 border-t border-border/60 pt-4 text-[13.5px]">
          <SummaryRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Dia"
            value={selectedDateLabel}
          />
          <SummaryRow
            icon={<Clock className="h-4 w-4" />}
            label="Horario"
            value={selectedTime ?? '-'}
          />
        </div>
        <div className="mt-5 rounded-xl border border-border/60 bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <CloudSun className="h-4 w-4" />
            Clima estimado
          </div>

          {weatherLoading ? (
            <p className="mt-3 text-[13px] text-muted-foreground">Consultando pronostico...</p>
          ) : weather ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[24px] font-medium leading-none">{weather.temperature}°C</p>
                <p className="mt-1 capitalize text-[13px] text-muted-foreground">
                  {weather.description}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Droplets className="h-3.5 w-3.5" />
                  {weather.precipitationProbability}% lluvia
                </p>
              </div>
              <Image
                src={weather.iconUrl}
                alt={weather.description}
                width={56}
                height={56}
                className="h-14 w-14"
              />
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">
              {weatherError ?? 'Selecciona una fecha para ver el pronostico.'}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">{icon} {label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
