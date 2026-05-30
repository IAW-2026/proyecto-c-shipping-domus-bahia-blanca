import Link from 'next/link'
import { ArrowLeft, CalendarCheck2, MapPin, UserRound } from 'lucide-react'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import { prisma } from '@/lib/prisma'
import { requireAgente } from '@/lib/auth/requireAgente'

type OrdenFecha = 'asc' | 'desc'

function formatDate(date: Date) {
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function TurnosCompletadosPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string }>
}) {
  const { orden } = await searchParams
  const ordenFecha: OrdenFecha = orden === 'asc' ? 'asc' : 'desc'
  const agente = await requireAgente()

  const turnos = await prisma.turno.findMany({
    where: {
      agenteId: agente.id,
      estado: 'COMPLETADO',
    },
    orderBy: {
      fechaHoraSolicitada: ordenFecha,
    },
    include: {
      propiedad: true,
    },
  })

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Turnos completados' }]} />
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[30px] font-medium leading-tight">
              Turnos completados
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              {turnos.length} visitas finalizadas por vos.
            </p>
          </div>
          <Link
            href="/dashboard/agenda"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <CalendarCheck2 className="h-4 w-4" /> Ver agenda
          </Link>
        </header>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted-foreground">
            Ordenados por fecha {ordenFecha === 'asc' ? 'ascendente' : 'descendente'}.
          </p>
          <div className="inline-flex rounded-lg border border-border/70 bg-card p-1 shadow-soft">
            <Link
              href="/dashboard/completados?orden=desc"
              className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                ordenFecha === 'desc'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Más recientes
            </Link>
            <Link
              href="/dashboard/completados?orden=asc"
              className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                ordenFecha === 'asc'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Más antiguos
            </Link>
          </div>
        </div>

        {turnos.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-[13.5px] text-muted-foreground shadow-soft">
            Todavia no tenes turnos completados.
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
            <div className="grid grid-cols-[1.1fr_0.9fr_0.8fr_150px_44px] border-b border-border/60 bg-secondary/30 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <span>Propiedad</span>
              <span>Comprador</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span />
            </div>

            <ul className="divide-y divide-border/60">
              {turnos.map((turno) => {
                const fecha = turno.fechaHoraSolicitada
                  ? `${formatDate(turno.fechaHoraSolicitada)} · ${formatTime(turno.fechaHoraSolicitada)} hs`
                  : 'Sin fecha'

                return (
                  <li key={turno.id}>
                    <Link
                      href={`/dashboard/turnos/${turno.id}`}
                      className="grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 md:grid-cols-[1.1fr_0.9fr_0.8fr_150px_44px] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-foreground">
                          {turno.propiedad.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {turno.propiedad.direccion ?? turno.vendedorId}
                        </p>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 text-[13px] text-foreground">
                        <UserRound className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{turno.nombreComprador ?? turno.compradorId}</span>
                      </div>

                      <p className="text-[12.5px] text-muted-foreground">{fecha}</p>

                      <StatusBadge status={turno.estado} />

                      <ArrowLeft className="hidden h-4 w-4 rotate-180 justify-self-end text-muted-foreground md:block" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
