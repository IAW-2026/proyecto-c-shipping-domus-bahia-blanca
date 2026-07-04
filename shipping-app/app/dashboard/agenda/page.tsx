import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import type { EstadoTurno } from '@prisma/client'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import {
  argentinaCalendarDate,
  argentinaDateKey,
  argentinaDateKeyFromInstant,
  argentinaEndOfDateKey,
  argentinaMonthDate,
  argentinaStartOfDateKey,
  argentinaTimeFromInstant,
  argentinaWeekdayDateFromInstant,
} from '@/lib/turnos/horarios'

export const metadata = {
  title: 'Agenda - Domus',
  description: 'Agenda semanal de visitas y turnos asignados al agente inmobiliario.',
}

const statusStyles: Record<EstadoTurno, { chip: string }> = {
  PENDIENTE_AGENTE: {
    chip: 'bg-[oklch(0.62_0.07_60_/_0.12)] text-[oklch(0.45_0.07_60)] ring-1 ring-inset ring-[oklch(0.62_0.07_60_/_0.2)]',
  },
  PRE_ACEPTADO: {
    chip: 'bg-[oklch(0.72_0.06_130_/_0.2)] text-[oklch(0.38_0.06_140)] ring-1 ring-inset ring-[oklch(0.72_0.06_130_/_0.3)]',
  },
  CONFIRMADO: {
    chip: 'bg-[oklch(0.42_0.03_150_/_0.12)] text-primary ring-1 ring-inset ring-[oklch(0.42_0.03_150_/_0.25)]',
  },
  COMPLETADO: {
    chip: 'bg-secondary text-muted-foreground ring-1 ring-inset ring-border',
  },
  CANCELADO: {
    chip: 'bg-[oklch(0.62_0.11_40_/_0.12)] text-[oklch(0.5_0.13_35)] ring-1 ring-inset ring-[oklch(0.62_0.11_40_/_0.25)]',
  }
}

const hours = Array.from({ length: 17 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30
  const hour = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

const PAGE_SIZE = 5

function getWeekDays() {
  const today = argentinaCalendarDate()

  return Array.from({ length: 7 }, (_, i) => {
    const d = argentinaMonthDate(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + i
    )
    return {
      label: argentinaWeekdayDateFromInstant(d),
      date: d,
      dateKey: argentinaDateKey(d),
    }
  })
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const requestedPage = Number.parseInt(page ?? '1', 10)
  const currentPage = Number.isNaN(requestedPage) ? 1 : Math.max(1, requestedPage)
  const { userId } = await auth()

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId! },
    select: { id: true },
  })

  const weekDays = getWeekDays()
  const start = argentinaStartOfDateKey(weekDays[0].dateKey)
  const end = argentinaEndOfDateKey(weekDays[6].dateKey)

  const turnos = await prisma.turno.findMany({
    where: {
      agenteId: agente?.id,
      estado: {
        notIn: ['CANCELADO', 'COMPLETADO'],
      },
    },
    orderBy: {
      fechaHoraSolicitada: 'asc',
    },
    include: {
      propiedad: true,
    },
  })

  const totalPages = Math.max(1, Math.ceil(turnos.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const turnosPagina = turnos.slice(pageStart, pageStart + PAGE_SIZE)

  const turnosSemana = turnos.filter((turno) => {
    if (!turno.fechaHoraSolicitada) return false

    return turno.fechaHoraSolicitada >= start && turno.fechaHoraSolicitada <= end
  })

  const turnoMap = new Map<string, typeof turnos[number]>()
  for (const turno of turnosSemana) {
    if (!turno.fechaHoraSolicitada) continue
    const dayIndex = weekDays.findIndex(
      (wd) => wd.dateKey === argentinaDateKeyFromInstant(turno.fechaHoraSolicitada!)
    )
    if (dayIndex === -1) continue
    const horaArgentina = argentinaTimeFromInstant(turno.fechaHoraSolicitada)
    const key = `${dayIndex}-${horaArgentina}`
    turnoMap.set(key, turno)
  }
  return (
    <>
  <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Agenda' }]} />
  <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
    
    {/* Header */}
    <header className="mb-7">
      <h1 className="font-display text-[30px] font-medium leading-tight">Agenda semanal</h1>
      <p className="mt-1 hidden text-[13.5px] text-muted-foreground lg:block">
        Vista de tus visitas — semana del {weekDays[0].label} al {weekDays[6].label}.
      </p>
    </header>

    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr]">

      {/* Tabla calendario */}
      <div className="hidden  self-start overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft lg:block">
        {/* Header días */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/60 bg-secondary/30 text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="px-3 py-3" />
          {weekDays.map((d) => (
            <div key={d.label} className="px-3 py-3 text-center">
              {d.label}
            </div>
          ))}
        </div>

        {/* Grid horas x días */}
        <div className="h-[487px] overflow-y-auto">
          {hours.map((h) => (
              <div
                key={h}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/40 last:border-0"
              >
                <div className="border-r border-border/40 px-3 py-4 text-[11.5px] text-muted-foreground">
                  {h}
                </div>
                {weekDays.map((d, di) => {
                  const turno = turnoMap.get(`${di}-${h}`)
                  if (!turno) {
                    return <div key={di} className="border-r border-border/40 last:border-0 min-h-16" />
                  }
                  return (
                    <div key={di} className="border-r border-border/40 last:border-0 p-1.5">
                      <Link
                        href={`/dashboard/turnos/${turno.id}`}
                        className={`group relative block rounded-lg p-2 text-left transition-transform hover:-translate-y-0.5 hover:shadow-soft ${statusStyles[turno.estado].chip}`}
                      >
                        <p className="text-[11px] font-medium">
                          {argentinaTimeFromInstant(turno.fechaHoraSolicitada!)}
                        </p>
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 scale-95 rounded-xl border border-border/60 bg-card p-3 shadow-lg opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
                          <p className="text-[12px] font-medium text-foreground">
                            {turno.propiedad.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
                          </p>
                          {turno.propiedad.direccion && (
                            <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                              {turno.propiedad.direccion}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
          ))}
        </div>
      </div>

      {/* Listado de turnos */}
      <div>
        <h2 className="font-display text-[30px] font-medium leading-tight mb-5">Turnos</h2>

        {turnos.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-[13.5px] text-muted-foreground shadow-soft">
            No tenés turnos asignados esta semana.
          </div>
        ) : (
          <div className="space-y-3">
            {turnosPagina.map((turno) => {
              const fecha = turno.fechaHoraSolicitada
                ? argentinaWeekdayDateFromInstant(turno.fechaHoraSolicitada)
                : 'Sin fecha'
              const hora = turno.fechaHoraSolicitada
                ? argentinaTimeFromInstant(turno.fechaHoraSolicitada)
                : '--'

              return (
                <Link
                  key={turno.id}
                  href={`/dashboard/turnos/${turno.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-soft hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium">
                        {turno.propiedad.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {fecha} · {hora} hs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[turno.estado].chip}`}>
                      {turno.estado.replace('_', ' ')}
                    </span>
                    <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft">
                <p className="text-[12px] text-muted-foreground">
                  Página {safePage} de {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/dashboard/agenda?page=${Math.max(1, safePage - 1)}`}
                    aria-disabled={safePage === 1}
                    className={`grid h-8 w-8 place-items-center rounded-lg border border-border/70 transition-colors ${
                      safePage === 1
                        ? 'pointer-events-none text-muted-foreground/40'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/agenda?page=${Math.min(totalPages, safePage + 1)}`}
                    aria-disabled={safePage === totalPages}
                    className={`grid h-8 w-8 place-items-center rounded-lg border border-border/70 transition-colors ${
                      safePage === totalPages
                        ? 'pointer-events-none text-muted-foreground/40'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  </main>
</>
  )
}
