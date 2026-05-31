import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  actualizarTurnoAdmin,
  crearTurnoAdmin,
  eliminarTurnoAdmin,
} from '@/lib/turnos/turno'
import {
  argentinaCalendarDate,
  argentinaDateKey,
  argentinaDateKeyFromInstant,
  argentinaTimeFromInstant,
  TURNOS_TIME_SLOTS,
} from '@/lib/turnos/horarios'
import { ArrowLeft, CalendarDays, Trash2 } from 'lucide-react'
import type { EstadoTurno, EstadoTurnoComprador, Prisma } from '@prisma/client'

export const metadata = {
  title: 'CRUD turnos - Domus',
  description: 'Administracion completa de turnos del sistema.',
}

const estadosTurno: EstadoTurno[] = [
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]

const estadosComprador: EstadoTurnoComprador[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]

const PAGE_SIZE = 6

function dateTimeInputValue(value: Date | null) {
  if (!value) return ''

  return value.toISOString().slice(0, 16)
}

function TextField({
  name,
  label,
  defaultValue,
  required,
}: {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
}) {
  return (
    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
      />
    </label>
  )
}

function DateField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue?: Date | null
}) {
  return (
    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
      {label}
      <input
        type="datetime-local"
        name={name}
        defaultValue={dateTimeInputValue(defaultValue ?? null)}
        className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
      />
    </label>
  )
}

function TurnoDateTimeField({
  defaultValue,
  defaultToToday,
}: {
  defaultValue?: Date | null
  defaultToToday?: boolean
}) {
  const dateValue = defaultValue
    ? argentinaDateKeyFromInstant(defaultValue)
    : defaultToToday
      ? argentinaDateKey(argentinaCalendarDate())
      : ''
  const timeValue = defaultValue
    ? argentinaTimeFromInstant(defaultValue)
    : defaultToToday
      ? TURNOS_TIME_SLOTS[0]
      : ''

  return (
    <>
      <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
        Fecha solicitada
        <input
          type="date"
          name="fechaSolicitada"
          defaultValue={dateValue}
          className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
        />
      </label>
      <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
        Horario
        <select
          name="horaSolicitada"
          defaultValue={timeValue}
          className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
        >
          {!defaultToToday && <option value="">Sin horario</option>}
          {TURNOS_TIME_SLOTS.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}

function formatTurnoDateTime(value: Date | null) {
  if (!value) return 'Sin fecha'

  return `${argentinaDateKeyFromInstant(value)} ${argentinaTimeFromInstant(value)} hs`
}

function isEstadoTurno(value: string | undefined): value is EstadoTurno {
  return estadosTurno.includes(value as EstadoTurno)
}

export default async function AdminTurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; inmobiliaria?: string; page?: string }>
}) {
  const { estado, inmobiliaria, page } = await searchParams
  const estadoFiltro = isEstadoTurno(estado) ? estado : ''
  const inmobiliariaFiltro = inmobiliaria?.trim() ?? ''
  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  const skip = (currentPage - 1) * PAGE_SIZE
  const where: Prisma.TurnoWhereInput = {
    ...(estadoFiltro ? { estado: estadoFiltro } : {}),
    ...(inmobiliariaFiltro ? { vendedorId: inmobiliariaFiltro } : {}),
  }

  const [turnos, propiedades, agentes, inmobiliarias, totalTurnos, filteredTurnos] =
    await Promise.all([
      prisma.turno.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { creadoEn: 'desc' },
        include: {
          propiedad: { select: { id: true, nombrePropiedad: true, vendedorId: true } },
          agente: { select: { id: true, nombreCompleto: true } },
        },
      }),
      prisma.propiedad.findMany({
        orderBy: { nombrePropiedad: 'asc' },
        select: { id: true, nombrePropiedad: true, vendedorId: true },
      }),
      prisma.agenteInmobiliario.findMany({
        orderBy: { nombreCompleto: 'asc' },
        select: { id: true, nombreCompleto: true },
      }),
      prisma.propiedad.findMany({
        distinct: ['vendedorId'],
        orderBy: { vendedorId: 'asc' },
        select: { vendedorId: true, nombreInmobiliaria: true },
      }),
      prisma.turno.count(),
      prisma.turno.count({ where }),
    ])

  const hasFilters = Boolean(estadoFiltro || inmobiliariaFiltro)
  const totalPages = Math.max(1, Math.ceil(filteredTurnos / PAGE_SIZE))
  const pageParams = new URLSearchParams()
  if (estadoFiltro) pageParams.set('estado', estadoFiltro)
  if (inmobiliariaFiltro) pageParams.set('inmobiliaria', inmobiliariaFiltro)
  const paginationHref = (targetPage: number) => {
    const params = new URLSearchParams(pageParams)
    params.set('page', targetPage.toString())

    return `/admin/entidades/turnos?${params.toString()}`
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-8 text-foreground lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Link
          href="/admin/entidades"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 py-2 text-[12.5px] font-medium shadow-soft transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <header>
          <h1 className="font-display text-[32px] font-medium leading-tight">Turnos</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Ver, crear, editar y eliminar cualquier turno.
          </p>
        </header>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-medium">Crear turno</h2>
          </div>
          <form action={crearTurnoAdmin} className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
              Propiedad
              <select
                name="propiedadId"
                required
                className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
              >
                <option value="">Seleccionar</option>
                {propiedades.map((propiedad) => (
                  <option key={propiedad.id} value={propiedad.id}>
                    {propiedad.nombrePropiedad ?? propiedad.id}
                  </option>
                ))}
              </select>
            </label>
            <TextField name="compradorId" label="Comprador ID" required />
            <TextField name="vendedorId" label="Vendedor ID" required />
            <TextField name="nombreComprador" label="Nombre comprador" />
            <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
              Agente
              <select
                name="agenteId"
                className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
              >
                <option value="">Sin agente</option>
                {agentes.map((agente) => (
                  <option key={agente.id} value={agente.id}>
                    {agente.nombreCompleto}
                  </option>
                ))}
              </select>
            </label>
            <TurnoDateTimeField defaultToToday />
            <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
              Estado
              <select
                name="estado"
                defaultValue="PENDIENTE_AGENTE"
                className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
              >
                {estadosTurno.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
              Estado comprador
              <select
                name="estadoComprador"
                defaultValue="PENDIENTE"
                className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
              >
                {estadosComprador.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </label>
            <TextField name="observaciones" label="Observaciones" />
            <DateField name="respuestaAgenteEn" label="Respuesta agente" />
            <DateField name="respuestaVendedorEn" label="Respuesta vendedor" />
            <div className="flex items-end">
              <button className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[oklch(0.36_0.03_150)]">
                Crear turno
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="border-b border-border/60 px-6 py-5">
            <h2 className="font-display text-xl font-medium">Todos los turnos</h2>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {filteredTurnos} de {totalTurnos} registros
            </p>
          </div>
          <form
            key={`${estadoFiltro}-${inmobiliariaFiltro}`}
            className="grid gap-3 border-b border-border/60 px-6 py-4 md:grid-cols-[1fr_1fr_auto_auto]"
          >
            <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
              Estado
              <select
                name="estado"
                defaultValue={estadoFiltro}
                className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
              >
                <option value="">Todos los estados</option>
                {estadosTurno.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
              Inmobiliaria
              <select
                name="inmobiliaria"
                defaultValue={inmobiliariaFiltro}
                className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
              >
                <option value="">Todas las inmobiliarias</option>
                {inmobiliarias.map((item) => (
                  <option key={item.vendedorId} value={item.vendedorId}>
                    {item.nombreInmobiliaria
                      ? `${item.nombreInmobiliaria} (${item.vendedorId})`
                      : item.vendedorId}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[oklch(0.36_0.03_150)]">
                Filtrar
              </button>
            </div>
            <div className="flex items-end">
              <Link
                href="/admin/entidades/turnos"
                className={`inline-flex h-9 items-center rounded-lg border border-border/70 px-4 text-[13px] font-medium transition-colors ${
                  hasFilters
                    ? 'bg-card text-foreground hover:bg-secondary'
                    : 'pointer-events-none bg-secondary/60 text-muted-foreground'
                }`}
              >
                Limpiar
              </Link>
            </div>
          </form>
          <div className="divide-y divide-border/60">
            {turnos.map((turno) => (
              <details key={turno.id} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-medium">
                      {turno.propiedad.nombrePropiedad ?? turno.propiedadId}
                    </p>
                    <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">
                      {turno.id} · {turno.estado}
                    </p>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {formatTurnoDateTime(turno.fechaHoraSolicitada)}
                  </p>
                </summary>

                <div className="mt-4 rounded-xl border border-border/60 bg-[#FAF8F5] p-4">
                  <form action={actualizarTurnoAdmin} className="grid gap-3 md:grid-cols-3">
                    <input type="hidden" name="id" value={turno.id} />
                    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
                      Propiedad
                      <select
                        name="propiedadId"
                        defaultValue={turno.propiedadId}
                        required
                        className="h-9 rounded-lg border border-border/70 bg-card px-3 text-[13px] text-foreground outline-none focus:border-primary"
                      >
                        {propiedades.map((propiedad) => (
                          <option key={propiedad.id} value={propiedad.id}>
                            {propiedad.nombrePropiedad ?? propiedad.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <TextField name="compradorId" label="Comprador ID" defaultValue={turno.compradorId} required />
                    <TextField name="vendedorId" label="Vendedor ID" defaultValue={turno.vendedorId} required />
                    <TextField name="nombreComprador" label="Nombre comprador" defaultValue={turno.nombreComprador} />
                    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
                      Agente
                      <select
                        name="agenteId"
                        defaultValue={turno.agenteId ?? ''}
                        className="h-9 rounded-lg border border-border/70 bg-card px-3 text-[13px] text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Sin agente</option>
                        {agentes.map((agente) => (
                          <option key={agente.id} value={agente.id}>
                            {agente.nombreCompleto}
                          </option>
                        ))}
                      </select>
                    </label>
                    <TurnoDateTimeField defaultValue={turno.fechaHoraSolicitada} />
                    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
                      Estado
                      <select
                        name="estado"
                        defaultValue={turno.estado}
                        className="h-9 rounded-lg border border-border/70 bg-card px-3 text-[13px] text-foreground outline-none focus:border-primary"
                      >
                        {estadosTurno.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
                      Estado comprador
                      <select
                        name="estadoComprador"
                        defaultValue={turno.estadoComprador}
                        className="h-9 rounded-lg border border-border/70 bg-card px-3 text-[13px] text-foreground outline-none focus:border-primary"
                      >
                        {estadosComprador.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </label>
                    <TextField name="observaciones" label="Observaciones" defaultValue={turno.observaciones} />
                    <DateField name="respuestaAgenteEn" label="Respuesta agente" defaultValue={turno.respuestaAgenteEn} />
                    <DateField name="respuestaVendedorEn" label="Respuesta vendedor" defaultValue={turno.respuestaVendedorEn} />
                    <div className="flex items-end gap-2">
                      <button className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[oklch(0.36_0.03_150)]">
                        Guardar
                      </button>
                    </div>
                  </form>
                  <form action={eliminarTurnoAdmin} className="mt-3">
                    <input type="hidden" name="id" value={turno.id} />
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                      Eliminar turno
                    </button>
                  </form>
                </div>
              </details>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
            <p className="text-[12px] text-muted-foreground">
              Pagina {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={paginationHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`inline-flex h-9 items-center rounded-lg border border-border/70 px-4 text-[13px] font-medium transition-colors ${
                  currentPage === 1
                    ? 'pointer-events-none bg-secondary/60 text-muted-foreground'
                    : 'bg-card text-foreground hover:bg-secondary'
                }`}
              >
                Anterior
              </Link>
              <Link
                href={paginationHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={`inline-flex h-9 items-center rounded-lg border border-border/70 px-4 text-[13px] font-medium transition-colors ${
                  currentPage >= totalPages
                    ? 'pointer-events-none bg-secondary/60 text-muted-foreground'
                    : 'bg-card text-foreground hover:bg-secondary'
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
