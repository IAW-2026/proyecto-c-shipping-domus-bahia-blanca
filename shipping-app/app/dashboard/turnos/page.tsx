import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import { Calendar, Check, MapPin, User2, X } from 'lucide-react'
import { aceptarTurno } from '@/lib/turnos/aceptarTurno'
import { tomarTurno } from '@/lib/actions/turno'

export default async function TurnosPage() {
  const { userId } = await auth()

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId! },
    select: { id: true, vendedorId: true },
  })

  //Agrego esto aunque en el layout obligue a que sea agente y eso 
  //quiere decir que tiene un vendedorId asociado, ya que sino no puedo buscar los turnos, termina siendo un parche.
  
  if (!agente?.vendedorId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        No tenés una inmobiliaria asignada.
      </div>
    )
  }

  const turnos = await prisma.turno.findMany({
    where: {
      vendedorId: agente.vendedorId, // ya no es null
      estado: { in: ['PENDIENTE_AGENTE']},
      agenteId: null,
    },
    orderBy: { fechaHoraSolicitada: 'asc' },
  })

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Turnos pendientes' }]} />
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[30px] font-medium leading-tight">
              Turnos pendientes
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              {turnos.length} solicitudes esperan tu confirmación.
            </p>
          </div>
        </header>

        <ul className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {turnos.map((turno) => (
            <li
              key={turno.id}
              className="group rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elev"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {turno.id.slice(0, 8).toUpperCase()}
                  </p>
                  <Link
                    href={`/dashboard/turnos/${turno.id}`}
                    className="mt-1 block font-display text-[19px] font-medium leading-snug text-foreground hover:text-primary transition-colors"
                  >
                    Propiedad {turno.propiedadId}
                  </Link>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {turno.vendedorId}
                  </p>
                </div>
                <StatusBadge status={turno.estado} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-secondary/60 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-card text-primary">
                    <User2 className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      Comprador
                    </p>
                    <p className="text-[13px] font-medium text-foreground">
                      {turno.compradorId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-card text-primary">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      Fecha y hora
                    </p>
                    <p className="text-[13px] font-medium text-foreground">
                      {turno.fechaHoraSolicitada
                        ? new Date(turno.fechaHoraSolicitada).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                          }) +
                          ' · ' +
                          new Date(turno.fechaHoraSolicitada).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Sin fecha'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <form action={tomarTurno.bind(null, turno.id)}>
                <button
                  type="submit"
                  className="h-9 rounded-lg bg-primary px-3.5 text-[12.5px] font-medium text-primary-foreground shadow-soft hover:bg-[oklch(0.36_0.03_150)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Check className="h-4 w-4" /> Aceptar
                </button>
              </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}