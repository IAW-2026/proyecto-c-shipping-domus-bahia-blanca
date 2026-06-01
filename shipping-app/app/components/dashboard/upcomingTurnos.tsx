import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { MapPin, UserRound } from 'lucide-react'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'

type UpcomingTurno = Prisma.TurnoGetPayload<{
  include: {
    propiedad: true
  }
}>

type UpcomingTurnosProps = {
  turnos: UpcomingTurno[]
}

export function UpcomingTurnos({ turnos }: UpcomingTurnosProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-medium">Proximos turnos</h2>
          
        </div>
        <Link
          href="/dashboard/agenda"
          className="text-[12.5px] font-medium text-primary hover:underline"
        >
          Ver agenda
        </Link>
      </div>
      <ul className="max-h-[336px] divide-y divide-border/60 overflow-y-auto overscroll-contain">
        {turnos.length === 0 ? (
          <li className="px-6 py-8 text-center text-[13px] text-muted-foreground">
            No tenes visitas proximas
          </li>
        ) : (
          turnos.map((turno) => (
            <li key={turno.id}>
              <Link
                href={`/dashboard/turnos/${turno.id}`}
                className="flex h-28 items-start gap-4 px-6 py-4 transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-center leading-tight">
                  <div>
                    <p className="font-display text-[15px] font-medium text-primary">
                      {turno.fechaHoraSolicitada
                        ? new Date(turno.fechaHoraSolicitada).getHours().toString().padStart(2, '0')
                        : '--'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {turno.fechaHoraSolicitada
                        ? new Date(turno.fechaHoraSolicitada).getMinutes().toString().padStart(2, '0')
                        : '--'}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-foreground">
                    {turno.propiedad.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {turno.propiedad.direccion}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                    <UserRound className="h-3 w-3" /> {turno.nombreComprador}
                  </p>

                  <div className="mt-2">
                    <StatusBadge status={turno.estado} />
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
      <div className="h-5 border-t border-border/60 bg-card" />
    </article>
  )
}
