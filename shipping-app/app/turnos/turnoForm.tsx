'use client'

import { useState, useMemo } from 'react'
import { useTransition } from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { crearTurno } from '@/lib/actions/turno'

// ─── Types ───────────────────────────────────────────────────────────────────

type Propiedad = {
  id: string
  nombrePropiedad: string | null
  direccion: string | null
  latitud: number | null
  longitud: number | null
  vendedorId: string
  nombreInmobiliaria: string | null
}

type Comprador = {
  id: string
  nombre: string
  email: string
}

type Props = {
  propiedad: Propiedad
  comprador: Comprador
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
]

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function buildMonthGrid(cursor: Date) {
  const first = startOfMonth(cursor)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDate(d: Date) {
  return `${DAY_LABELS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()].slice(0, 3)}`
}

function buildFechaHora(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TurnoForm({ propiedad, comprador }: Props) {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [isPending, startTransition] = useTransition()

  const cells = useMemo(() => buildMonthGrid(cursor), [cursor])
  const canSubmit = selectedDate && selectedTime

  function handleSubmit() {
    if (!canSubmit) return
    startTransition(async () => {
      await crearTurno({
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
      setConfirmed(true)
    })
  }

  if (confirmed) {
    return (
      <ConfirmationCard
        propiedad={propiedad}
        date={selectedDate ? formatDate(selectedDate) : ''}
        time={selectedTime ?? ''}
        comprador={comprador}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.22em] text-accent-warm">
          Nueva visita
        </p>
        <h1 className="mt-2 font-display text-[32px] font-medium leading-tight text-foreground">
          Reservá tu visita en pocos pasos
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Elegí el día y el horario que mejor te quede. Te confirmamos a la brevedad.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">

        {/* Calendario + slots */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">

          {/* Calendario */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[12.5px] font-medium text-muted-foreground">Elegí un día</p>
                <p className="mt-0.5 font-display text-[18px] text-foreground">
                  {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  className="h-9 w-9 rounded-lg border border-border/70 inline-flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  className="h-9 w-9 rounded-lg border border-border/70 inline-flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {DAY_LABELS.map((d) => (
                <div key={d} className="py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
              {cells.map((cell, i) => {
                if (!cell) return <div key={i} className="h-11 rounded-lg" />
                const disabled = cell < today || cell.getDay() === 0
                const isSelected = selectedDate && isSameDay(cell, selectedDate)
                const isToday = isSameDay(cell, today)
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => { setSelectedDate(cell); setSelectedTime(null) }}
                    className={cn(
                      'h-11 rounded-lg text-[13.5px] font-medium transition-all hover:bg-secondary',
                      disabled && 'text-muted-foreground/40 hover:bg-transparent cursor-not-allowed',
                      !disabled && !isSelected && 'text-foreground',
                      isToday && !isSelected && 'ring-1 ring-inset ring-border',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary shadow-soft',
                    )}
                  >
                    {cell.getDate()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slots */}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[12.5px] font-medium">Elegí un horario</p>
              {selectedDate && (
                <p className="text-[12px] text-muted-foreground">{formatDate(selectedDate)}</p>
              )}
            </div>
            {selectedDate ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      'h-10 rounded-lg border text-[13px] font-medium transition-all',
                      selectedTime === t
                        ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                        : 'border-border/70 bg-background text-foreground hover:border-primary/40 hover:bg-secondary',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border/70 bg-secondary/30 text-[13px] text-muted-foreground">
                Seleccioná un día para ver horarios disponibles
              </div>
            )}
          </div>
        </div>

        {/* Resumen + notas + submit */}
        <aside className="space-y-6">

          {/* Info comprador */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reservando como</p>
            <p className="mt-2 text-[15px] font-medium">{comprador.nombre}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{comprador.email}</p>
          </div>

          {/* Resumen */}
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
                label="Día"
                value={selectedDate ? formatDate(selectedDate) : '—'}
              />
              <SummaryRow
                icon={<Clock className="h-4 w-4" />}
                label="Horario"
                value={selectedTime ?? '—'}
              />
            </div>
          </div>

          {/* Notas + submit */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
            <div className="space-y-1.5">
              <p className="text-[12.5px] font-medium">Notas (opcional)</p>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="¿Algo que el agente deba saber antes de la visita?"
                className="w-full rounded-lg border border-border/80 bg-background px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="h-11 w-full rounded-lg bg-primary text-[14px] font-medium tracking-wide shadow-soft hover:bg-[oklch(0.36_0.03_150)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
            <p className="text-center text-[11.5px] text-muted-foreground">
              Recibirás la confirmación por mail y un recordatorio 24 hs antes.
            </p>
          </div>

        </aside>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">{icon} {label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function ConfirmationCard({
  propiedad,
  date,
  time,
  comprador,
}: {
  propiedad: Propiedad
  date: string
  time: string
  comprador: Comprador
}) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-[26px] font-medium">¡Visita reservada!</h2>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Un agente confirmará el turno a la brevedad. Te avisamos a <span className="font-medium text-foreground">{comprador.email}</span>.
        </p>
        <div className="mt-7 rounded-xl border border-border/60 bg-secondary/40 p-5 text-left">
          <p className="font-display text-[18px] font-medium">{propiedad.nombrePropiedad}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{propiedad.direccion}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-[13.5px]">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Día</p>
              <p className="mt-1 font-medium">{date}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Horario</p>
              <p className="mt-1 font-medium">{time}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}