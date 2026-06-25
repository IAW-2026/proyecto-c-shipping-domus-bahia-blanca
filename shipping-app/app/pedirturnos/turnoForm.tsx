'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookingNotes } from '@/app/components/turnos/bookingNotes'
import { BookingSummary } from '@/app/components/turnos/bookingSummary'
import { PropertyHero } from '@/app/components/turnos/propertyHero'
import { VisitCalendar } from '@/app/components/turnos/visitCalendar'
import type { CompradorTurno, PropiedadTurno } from '@/app/components/turnos/types'
import { crearTurno } from '@/lib/turnos/turno'
import {
  argentinaCalendarDate,
  argentinaDateKey,
  argentinaDateTime,
  argentinaMonthDate,
  TURNOS_TIME_SLOTS,
} from '@/lib/turnos/horarios'

type Props = {
  propiedad: PropiedadTurno
  comprador: CompradorTurno
  horariosOcupados: Record<string, string[]>
}

type TurnoWeather = {
  temperature: number
  feelsLike: number
  description: string
  precipitationProbability: number
  iconUrl: string
  forecastTime: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function startOfMonth(date: Date) {
  return argentinaMonthDate(date.getUTCFullYear(), date.getUTCMonth())
}

function buildMonthGrid(cursor: Date) {
  const first = startOfMonth(cursor)
  const offset = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(
    Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0, 12)
  ).getUTCDate()
  const cells: (Date | null)[] = []

  for (let i = 0; i < offset; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(argentinaMonthDate(cursor.getUTCFullYear(), cursor.getUTCMonth(), day))
  }
  while (cells.length < 42) cells.push(null)

  return cells
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

function formatDate(date: Date) {
  return `${DAY_LABELS[(date.getUTCDay() + 6) % 7]} ${date.getUTCDate()} ${MONTH_LABELS[date.getUTCMonth()].slice(0, 3)}`
}

export function TurnoForm({ propiedad, comprador, horariosOcupados }: Props) {
  const router = useRouter()
  const today = useMemo(() => argentinaCalendarDate(), [])
  
  const [now, setNow] = useState(() => new Date())
  const [cursor, setCursor] = useState(() => startOfMonth(argentinaCalendarDate()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [weather, setWeather] = useState<TurnoWeather | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const cells = useMemo(() => buildMonthGrid(cursor), [cursor])
  const selectedDateKey = selectedDate ? argentinaDateKey(selectedDate) : null
  const weatherRequestEnabled = Boolean(
    selectedDateKey && propiedad.latitud !== null && propiedad.longitud !== null
  )
  const selectedDateLabel = selectedDate ? formatDate(selectedDate) : null
  const bookedTimesForSelectedDate = useMemo(
  () => (selectedDateKey ? horariosOcupados[selectedDateKey] ?? [] : []),
  [horariosOcupados, selectedDateKey]
)
//Agrego esta funcion para calcular los turnos que ya pasaron y deshabilitarlos
  const pastTimesForSelectedDate = useMemo(
    () =>
      selectedDate
        ? TURNOS_TIME_SLOTS.filter((time) => argentinaDateTime(selectedDate, time) <= now)
        : [],
    [now, selectedDate]
  )

  const isSelectedTimeBooked = selectedTime ? bookedTimesForSelectedDate.includes(selectedTime) : false
  const isSelectedTimePast = selectedTime ? pastTimesForSelectedDate.includes(selectedTime) : false
  const canSubmit = Boolean(selectedDate && selectedTime && !isSelectedTimeBooked && !isSelectedTimePast)
    function handleSelectedDateChange(date: Date) {
      setSelectedDate(date)
      setSelectedTime(null)
    }

  useEffect(() => {
  const interval = window.setInterval(() => {
    setNow(new Date())
  }, 30_000)

  return () => window.clearInterval(interval)
}, [])

  useEffect(() => {
    if (!selectedDateKey || propiedad.latitud === null || propiedad.longitud === null) return

    const controller = new AbortController()
    const params = new URLSearchParams({
      lat: propiedad.latitud.toString(),
      lon: propiedad.longitud.toString(),
      date: selectedDateKey,
    })
    if (selectedTime) params.set('time', selectedTime)

    async function loadWeather() {
      await Promise.resolve()
      if (controller.signal.aborted) return

      setWeatherLoading(true)
      setWeatherError(null)

      try {
        const response = await fetch(`/api/weather?${params}`, { signal: controller.signal })
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? 'Pronostico no disponible')
        }

        const nextWeather = (await response.json()) as TurnoWeather
        setWeather(nextWeather)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setWeather(null)
        setWeatherError(error instanceof Error ? error.message : 'Pronostico no disponible')
      } finally {
        if (!controller.signal.aborted) setWeatherLoading(false)
      }
    }

    loadWeather()

    return () => controller.abort()
  }, [propiedad.latitud, propiedad.longitud, selectedDateKey, selectedTime])

  function handleSubmit() {
    if (!selectedDate || !selectedTime || isSelectedTimeBooked || isSelectedTimePast) return

    startTransition(async () => {
      setSubmitError(null)

      try {
        const turno = await crearTurno({
          propiedadId: propiedad.id,
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
          multimedia: propiedad.multimedia,
          nombreComprador: comprador.nombre,
          fechaSolicitada: argentinaDateKey(selectedDate),
          horaSolicitada: selectedTime,
          observaciones: observaciones || undefined,
        })
        router.push(`/turnos/gracias?turnoId=${turno.id}`)
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'No se pudo crear el turno')
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.22em] text-accent-warm">
          Nueva visita
        </p>
        <h1 className="mt-2 font-display text-[32px] font-medium leading-tight text-foreground">
          Reserva tu visita en pocos pasos
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Elegi el dia y el horario que mejor te quede. Te confirmamos a la brevedad.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.82fr]">
        <PropertyHero propiedad={propiedad} />

        <div className="contents">
          <VisitCalendar
            cursor={cursor}
            today={today}
            cells={cells}
            dayLabels={DAY_LABELS}
            monthLabels={MONTH_LABELS}
            timeSlots={TURNOS_TIME_SLOTS}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedTime={selectedTime}
            pastTimesForSelectedDate={pastTimesForSelectedDate}
            bookedTimesForSelectedDate={bookedTimesForSelectedDate}
            onCursorChange={setCursor}
            onSelectedDateChange={handleSelectedDateChange}
            onSelectedTimeChange={setSelectedTime}
            isSameDay={isSameDay}
          />

          <BookingNotes
            observaciones={observaciones}
            submitError={submitError}
            isPending={isPending}
            canSubmit={canSubmit}
            onObservacionesChange={setObservaciones}
            onSubmit={handleSubmit}
          />

          <BookingSummary
            comprador={comprador}
            propiedad={propiedad}
            selectedDateLabel={selectedDateLabel ?? '-'}
            selectedTime={selectedTime}
            weather={weatherRequestEnabled ? weather : null}
            weatherLoading={weatherRequestEnabled ? weatherLoading : false}
            weatherError={weatherRequestEnabled ? weatherError : null}
          />
        </div>
      </div>
    </div>
  )
}
