'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookingNotes } from '@/app/components/turnos/bookingNotes'
import { BookingSummary } from '@/app/components/turnos/bookingSummary'
import { PropertyHero } from '@/app/components/turnos/propertyHero'
import { VisitCalendar } from '@/app/components/turnos/visitCalendar'
import type { CompradorTurno, PropiedadTurno } from '@/app/components/turnos/types'
import { crearTurno } from '@/lib/actions/turno'

type Props = {
  propiedad: PropiedadTurno
  comprador: CompradorTurno
  horariosOcupados: Record<string, string[]>
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '15:00', '15:30', '16:00', '16:30',
  '17:00',
]

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function buildMonthGrid(cursor: Date) {
  const first = startOfMonth(cursor)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []

  for (let i = 0; i < offset; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day))
  }
  while (cells.length < 42) cells.push(null)

  return cells
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDate(date: Date) {
  return `${DAY_LABELS[(date.getDay() + 6) % 7]} ${date.getDate()} ${MONTH_LABELS[date.getMonth()].slice(0, 3)}`
}

function buildFechaHora(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function TurnoForm({ propiedad, comprador, horariosOcupados }: Props) {
  const router = useRouter()
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const cells = useMemo(() => buildMonthGrid(cursor), [cursor])
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null
  const selectedDateLabel = selectedDate ? formatDate(selectedDate) : null
  const bookedTimesForSelectedDate = selectedDateKey ? horariosOcupados[selectedDateKey] ?? [] : []
  const isSelectedTimeBooked = selectedTime ? bookedTimesForSelectedDate.includes(selectedTime) : false
  const canSubmit = Boolean(selectedDate && selectedTime && !isSelectedTimeBooked)

  function handleSelectedDateChange(date: Date) {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  function handleSubmit() {
    if (!selectedDate || !selectedTime || isSelectedTimeBooked) return

    startTransition(async () => {
      setSubmitError(null)

      try {
        const turno = await crearTurno({
          propiedadId: propiedad.id,
          nombrePropiedad: propiedad.nombrePropiedad,
          direccion: propiedad.direccion,
          latitud: propiedad.latitud,
          longitud: propiedad.longitud,
          vendedorId: propiedad.vendedorId,
          nombreInmobiliaria: propiedad.nombreInmobiliaria,
          nombreComprador: comprador.nombre,
          fechaHora: buildFechaHora(selectedDate, selectedTime),
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
            timeSlots={TIME_SLOTS}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedTime={selectedTime}
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
          />
        </div>
      </div>
    </div>
  )
}
