import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import { tomarTurno, cancelarTurno, completarTurno } from '@/lib/turnos/turno'
import { PropertyMap } from '@/app/components/dashboard/propertyMapWrapper'
import { DelayButton } from '@/app/components/dashboard/delayButton'


import {
  ArrowLeft,
  Bath,
  Calendar,
  Check,
  CircleCheck,
  DoorOpen,
  Ruler,
  BedDouble,
  MapPin,
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

export const metadata = {
  title: 'Detalle del turno - Domus',
  description: 'Detalle del turno, propiedad, comprador y acciones disponibles para el agente.',
}

function formatMoney(value: unknown, moneda: string) {
  if (value === null || value === undefined) return '-'

  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return '-'

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(numberValue)
}

function formatValue(value: unknown, suffix = '') {
  if (value === null || value === undefined || value === '') return '-'

  return `${value}${suffix}`
}


export const dynamic = 'force-dynamic'

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
        propiedad: {
          include: {
            multimedia: {
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    }),
    prisma.agenteInmobiliario.findUnique({
      where: { id: userId! },
      select: { id: true, vendedorId: true },
    }),
  ])

  if (!turno) notFound()
    //Para que un agente que no le pertence el turno pueda acceder
  if ((!agente || agente.vendedorId !== turno.vendedorId || (turno.agenteId!=null && userId != turno.agenteId))) {
    redirect('/unauthorized')
  }
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
  const imagenPrincipal = turno.propiedad.multimedia[0]
  const puedeCompletarTurno =
    turno.estado === 'CONFIRMADO' &&
    turno.agenteId === userId &&
    Boolean(turno.fechaHoraSolicitada && turno.fechaHoraSolicitada <= new Date())
  const puedeCancelarTurno = Boolean(turno.agenteId && turno.estado !== 'COMPLETADO')
  const destacados = [
    {
      label: 'Cubiertos',
      value: formatValue(turno.propiedad.metrosCubiertos, ' m²'),
      icon: Ruler,
    },
    {
      label: 'Ambientes',
      value: formatValue(turno.propiedad.ambientes),
      icon: DoorOpen,
    },
    {
      label: 'Dormitorios',
      value: formatValue(turno.propiedad.dormitorios),
      icon: BedDouble,
    },
    {
      label: 'Baños',
      value: formatValue(turno.propiedad.banios),
      icon: Bath,
    },
  ]
  const detalles = [
    { label: 'Dirección', value: formatValue(turno.propiedad.direccion) },
    { label: 'Barrio', value: formatValue(turno.propiedad.barrio) },
    { label: 'Ciudad', value: formatValue(turno.propiedad.ciudad) },
    { label: 'Provincia', value: formatValue(turno.propiedad.provincia) },
    { label: 'País', value: formatValue(turno.propiedad.pais) },
    { label: 'Precio', value: formatMoney(turno.propiedad.precio, turno.propiedad.moneda) },
    { label: 'Expensas', value: formatMoney(turno.propiedad.expensas, turno.propiedad.moneda) },
    { label: 'Metros totales', value: formatValue(turno.propiedad.metrosTotales, ' m²') },
    { label: 'Antigüedad', value: formatValue(turno.propiedad.antiguedad) },
    { label: 'Condición', value: formatValue(turno.propiedad.condicion) },
  ]

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Turnos' }, { label: turno.id.slice(0, 8).toUpperCase() }]} />
        <main className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">

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
            <h1 className="mt-2 font-display text-[32px] font-medium leading-tight text-primary">
              {turno.propiedad.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {turno.propiedad.direccion ?? turno.propiedad.vendedorId}
            </p>
          </div>
          <StatusBadge status={turno.estado} />
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">

          {/* Columna principal */}
          <div className="space-y-6">

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/40 shadow-soft">
              {imagenPrincipal ? (
                <Image
                  src={imagenPrincipal.url}
                  alt={imagenPrincipal.alt ?? turno.propiedad.nombrePropiedad ?? 'Propiedad'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                  quality={72}
                />
              ) : (
                <div className="grid h-full place-items-center text-[13px] text-muted-foreground">
                  Imagen no disponible
                </div>
              )}
            </div>

            <section className="space-y-9">
              <div className="rounded-2xl border border-border/60 bg-card px-5 py-5 shadow-soft">
                <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {destacados.map((item) => (
                    <div key={item.label}>
                      <dt className="sr-only">{item.label}</dt>
                      <dd className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0 text-primary/70" />
                        <span className="min-w-0 leading-tight">
                          <span className="block font-display text-[18px] font-semibold text-foreground">
                          {item.value}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-muted-foreground">{item.label}</span>
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {turno.propiedad.descripcion && (
                <div>
                  <h2 className="font-display text-[22px] font-semibold leading-tight text-primary">
                    Acerca de la propiedad
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-foreground">
                    {turno.propiedad.descripcion}
                  </p>
                </div>
              )}

              <div>
                <h2 className="font-display text-[22px] font-semibold leading-tight text-primary">
                  Detalles adicionales
                </h2>
                <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 text-[13.5px] sm:grid-cols-2">
                  {detalles.map((detalle) => (
                    <div key={detalle.label} className="flex items-center gap-2">
                      <dt className="flex items-center gap-2 text-muted-foreground">
                        <CircleCheck className="h-4 w-4 shrink-0 text-primary/60" />
                        {detalle.label}:
                      </dt>
                      <dd className="min-w-0 truncate font-medium text-foreground">{detalle.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Mapa */}
            {turno.propiedad.latitud && turno.propiedad.longitud && (
              <div className="w-full">
                <PropertyMap
                  latitud={turno.propiedad.latitud}
                  longitud={turno.propiedad.longitud}
                  direccion={turno.propiedad.direccion}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            
            {/* Línea de estados */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-base font-medium">Turno</h2>
              <ol className="mt-6 space-y-5">
                {timeline.map((t, i) => {
                  const reached = i <= currentIdx
                  const active = i === currentIdx
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
                        {/*TODO: Agregar horario de cada cambio de estado 
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {i === 0
                            ? new Date(turno.creadoEn).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                              }) + ' · ' + new Date(turno.creadoEn).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </p>
                        */}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* Detalle de la visita */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-base font-medium">Detalle de la visita</h2>
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
                  <dd className="mt-1 text-foreground">{turno.propiedad.nombreInmobiliaria ?? turno.propiedad.vendedorId}</dd>
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

            {/* Acciones */}
            
              <div className="mt-3 grid gap-2">
                {!turno.agenteId && (
                  <>
                  <DelayButton
                     action={tomarTurno.bind(null, turno.id)}
                        className="h-10 w-full justify-center rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[oklch(0.36_0.03_150)] inline-flex items-center gap-2 transition-colors"
                      >
                        <Check className="h-4 w-4" /> Tomar turno
                    </DelayButton>
                  </>
                )}
                {puedeCompletarTurno && (
                  <DelayButton
                    action={completarTurno.bind(null, turno.id)}
                    className="h-10 w-full justify-center rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[oklch(0.36_0.03_150)] inline-flex items-center gap-2 transition-colors"
                  >
                    <Check className="h-4 w-4" /> Visita completada
                  </DelayButton>
                )}
                {puedeCancelarTurno && (
               
                  <DelayButton
                  action={cancelarTurno.bind(null, turno.id)}
                  className="h-10 w-full justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-[13px] font-medium text-red-500 hover:bg-red-500/20 inline-flex items-center gap-2 transition-colors"
                >
                  <X className="h-4 w-4" /> Cancelar turno
                </DelayButton>
                )}
              </div>
            

          </aside>
        </div>
      </main>
    </>
  )
}
