import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import type { EstadoTurno } from '@prisma/client'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

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
  },
  RECHAZADO_VENDEDOR: {
    chip: 'bg-[oklch(0.62_0.11_40_/_0.12)] text-[oklch(0.5_0.13_35)] ring-1 ring-inset ring-[oklch(0.62_0.11_40_/_0.25)]',
  },
}

const hours = Array.from({ length: 17 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30
  const hour = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

function getWeekDays() {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      label: d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
      date: d,
    }
  })
}

export default async function AgendaPage() {
  const { userId } = await auth()

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId! },
    select: { id: true },
  })

  const weekDays = getWeekDays()
  const start = weekDays[0].date
  const end = weekDays[6].date
  end.setHours(23, 59, 59)

  const turnos = await prisma.turno.findMany({
    where: {
      agenteId: agente?.id,
      fechaHoraSolicitada: {
        gte: start,
        lte: end,
      },
      estado: {
        notIn: ['CANCELADO', 'RECHAZADO_VENDEDOR'],
      },
    },
  })


  const turnoMap = new Map<string, typeof turnos[number]>()
  for (const turno of turnos) {
    if (!turno.fechaHoraSolicitada) continue
    const d = new Date(turno.fechaHoraSolicitada)
    const dayIndex = weekDays.findIndex(
      (wd) => wd.date.toDateString() === d.toDateString()
    )
    if (dayIndex === -1) continue
    const horaArgentina = d.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const key = `${dayIndex}-${horaArgentina}`
    turnoMap.set(key, turno)
  }
  return (
    <>
  <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Agenda' }]} />
  <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
    
    {/* Header */}
    <header className="mb-7">
      <h1 className="font-display text-[30px] font-medium leading-tight">Agenda semanal</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Vista de tus visitas — semana del {weekDays[0].label} al {weekDays[6].label}.
      </p>
    </header>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">

      {/* Tabla calendario */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
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
        <div className="max-h-[28rem] overflow-y-auto">
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
                      <div className={`group relative rounded-lg p-2 text-left ${statusStyles[turno.estado].chip}`}>
                        <p className="text-[11px] font-medium">
                          {new Date(turno.fechaHoraSolicitada!).toLocaleTimeString('es-AR', {
                            timeZone: 'America/Argentina/Buenos_Aires',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 scale-95 rounded-xl border border-border/60 bg-card p-3 shadow-lg opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
                          <p className="text-[12px] font-medium text-foreground">
                            {turno.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
                          </p>
                          {turno.direccion && (
                            <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                              {turno.direccion}
                            </p>
                          )}
                        </div>
                      </div>
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
            {turnos.map((turno) => {
              const fecha = turno.fechaHoraSolicitada
                ? new Date(turno.fechaHoraSolicitada).toLocaleDateString('es-AR', {
                    timeZone: 'America/Argentina/Buenos_Aires',
                    weekday: 'short', day: 'numeric', month: 'short',
                  })
                : 'Sin fecha'
              const hora = turno.fechaHoraSolicitada
                ? new Date(turno.fechaHoraSolicitada).toLocaleTimeString('es-AR', {
                    timeZone: 'America/Argentina/Buenos_Aires',
                    hour: '2-digit', minute: '2-digit',
                  })
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
                        {turno.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
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
          </div>
        )}
      </div>

    </div>
  </div>
</>
  )
}