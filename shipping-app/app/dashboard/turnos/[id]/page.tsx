import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import { tomarTurno } from '@/lib/actions/turno'
import { PropertyMap } from '@/app/components/dashboard/propertyMapWrapper'
import {
  ArrowLeft,
  Calendar,
  Check,
  MapPin,
  MessageSquare,
  User2,
  X,
} from 'lucide-react'
import type { EstadoTurno } from '@prisma/client'

const timeline: { key: EstadoTurno; label: string }[] = [
  { key: 'PENDIENTE_AGENTE', label: 'Pendiente' },
  { key: 'PRE_ACEPTADO', label: 'Pre-aceptado' },
  { key: 'CONFIRMADO', label: 'Confirmado' },
  { key: 'COMPLETADO', label: 'Completado' },
]



export default async function TurnoDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  const { userId } = await auth()

  const [turno, agente] = await Promise.all([
    prisma.turno.findUnique({
      where: { id },
      include: {
        agente: { select: { nombreCompleto: true } },
        historial: { orderBy: { creadoEn: 'asc' } },
      },
    }),
    prisma.agenteInmobiliario.findUnique({
      where: { clerkUserId: userId! },
      select: { id: true },
    }),
  ])

  if (!turno) notFound()

  const currentIdx = timeline.findIndex((t) => t.key === turno.estado)

  const fechaFormateada = turno.fechaHoraSolicitada
    ? new Date(turno.fechaHoraSolicitada).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin fecha'

  const horaFormateada = turno.fechaHoraSolicitada
    ? new Date(turno.fechaHoraSolicitada).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--'

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Turnos' }, { label: turno.id.slice(0, 8).toUpperCase() }]} />
      <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">

        <Link
          href="/dashboard/turnos"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a turnos pendientes
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {turno.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="mt-2 font-display text-[32px] font-medium leading-tight">
              {turno.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {turno.direccion ?? turno.vendedorId}
            </p>
          </div>
          <StatusBadge status={turno.estado} />
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">

          {/* Columna principal */}
          <div className="space-y-6">

            {/* Mapa */}
            {turno.latitud && turno.longitud && (
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-medium mb-4">Ubicación</h2>
                <PropertyMap
                  latitud={turno.latitud}
                  longitud={turno.longitud}
                  direccion={turno.direccion}
                />
                {turno.direccion && (
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {turno.direccion}
                  </p>
                )}
              </section>
            )}

            {/* Línea de estados */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-medium">Línea de estados</h2>
              <ol className="mt-6 space-y-5">
                {timeline.map((t, i) => {
                  const reached = i <= currentIdx
                  const active = i === currentIdx
                  const historialEntry = turno.historial.find(
                    (h) => h.estado === (
                      i === 0 ? 'PENDIENTE_AGENTE' :
                      i === 1 ? 'PRE_ACEPTADO' :
                      i === 2 ? 'CONFIRMADO' :
                      'COMPLETADO'
                    )
                  )
                  return (
                    <li key={t.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-medium transition-colors
                          ${reached ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}
                          ${active ? 'ring-4 ring-[oklch(0.42_0.03_150_/_0.15)]' : ''}`}
                        >
                          {reached ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        {i < timeline.length - 1 && (
                          <span className={`mt-1 h-10 w-px ${i < currentIdx ? 'bg-primary/50' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <p className={`text-[13.5px] font-medium ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t.label}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {historialEntry
                            ? new Date(historialEntry.creadoEn).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                              }) + ' · ' + new Date(historialEntry.creadoEn).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* Detalle de la visita */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-medium">Detalle de la visita</h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 text-[13px]">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Fecha</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" /> {fechaFormateada}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Hora</dt>
                  <dd className="mt-1 text-foreground">{horaFormateada} hs</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Comprador</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                    <User2 className="h-4 w-4 text-primary" /> {turno.nombreComprador ?? turno.compradorId}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Inmobiliaria</dt>
                  <dd className="mt-1 text-foreground">{turno.nombreInmobiliaria ?? turno.vendedorId}</dd>
                </div>
                {turno.observaciones && (
                  <div className="col-span-2">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Notas del comprador
                    </dt>
                    <dd className="mt-2 rounded-xl bg-secondary/60 p-4 text-[13px] leading-relaxed text-foreground">
                      {turno.observaciones}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Comprador */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="font-display text-base font-medium">Comprador</h3>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <User2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-medium">{turno.nombreComprador ?? turno.compradorId}</p>
                  <p className="text-[12px] text-muted-foreground">Cliente</p>
                </div>
              </div>
            </section>

            {/* Agente asignado */}
            {turno.agente && (
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
                <h3 className="font-display text-base font-medium">Agente asignado</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent-warm font-medium">
                    {turno.agente.nombreCompleto.split(' ').map((p) => p[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">{turno.agente.nombreCompleto}</p>
                    <p className="text-[12px] text-muted-foreground">Domus · Bahía Blanca</p>
                  </div>
                </div>
              </section>
            )}

            {/* Acciones */}
            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <p className="text-[12px] text-muted-foreground">Acciones</p>
              <div className="mt-3 grid gap-2">
                <form action={tomarTurno.bind(null, turno.id, agente!.id)}>
                  <button
                    type="submit"
                    className="h-10 w-full justify-center rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[oklch(0.36_0.03_150)] inline-flex items-center gap-2 transition-colors"
                  >
                    <Check className="h-4 w-4" /> Tomar turno
                  </button>
                </form>
                <button className="h-10 w-full justify-center rounded-lg border border-border/70 text-[13px] text-foreground hover:bg-secondary inline-flex items-center gap-2 transition-colors">
                  <MessageSquare className="h-4 w-4" /> Mensaje al comprador
                </button>
                <button className="h-10 w-full justify-center rounded-lg text-[13px] text-muted-foreground hover:bg-[oklch(0.62_0.11_40_/_0.08)] hover:text-accent-warm inline-flex items-center gap-2 transition-colors">
                  <X className="h-4 w-4" /> Cancelar turno
                </button>
              </div>
            </section>

          </aside>
        </div>
      </div>
    </>
  )
}