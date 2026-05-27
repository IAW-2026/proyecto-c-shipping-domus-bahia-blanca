import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import type { EstadoTurno } from '@prisma/client'

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

const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

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
    },
  })

  // Indexar turnos por día y hora para acceso O(1) en el grid
  const turnoMap = new Map<string, typeof turnos[number]>()
  for (const turno of turnos) {
    if (!turno.fechaHoraSolicitada) continue
    const d = new Date(turno.fechaHoraSolicitada)
    const key = `${d.getDay()}-${d.getHours()}`
    turnoMap.set(key, turno)
  }

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Agenda' }]} />
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <header className="mb-7">
          <h1 className="font-display text-[30px] font-medium leading-tight">Agenda semanal</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Vista de tus visitas — semana del {weekDays[0].label} al {weekDays[6].label}.
          </p>
        </header>

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
          {hours.map((h) => {
            const hour = parseInt(h.split(':')[0])
            return (
              <div
                key={h}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/40 last:border-0"
              >
                <div className="border-r border-border/40 px-3 py-4 text-[11.5px] text-muted-foreground">
                  {h}
                </div>
                {weekDays.map((d, di) => {
                  const jsDay = (di + 1) % 7 // lunes=1...domingo=0
                  const turno = turnoMap.get(`${jsDay}-${hour}`)
                  if (!turno) {
                    return (
                      <div
                        key={di}
                        className="border-r border-border/40 last:border-0 min-h-16"
                      />
                    )
                  }
                  return (
                    <div key={di} className="border-r border-border/40 last:border-0 p-1.5">
                      <div className={`rounded-lg p-2 text-left ${statusStyles[turno.estado].chip}`}>
                        <p className="text-[11px] font-medium">
                          {new Date(turno.fechaHoraSolicitada!).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] opacity-80">
                          {turno.propiedadId}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}