import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Input } from '@/app/components/dashboard/ui/input'

export const metadata = {
  title: 'Administración — Domus',
  description: 'Panel administrativo de visitas y agentes.',
}

const PAGE_SIZE = 10

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1'))
  const skip = (currentPage - 1) * PAGE_SIZE

  const [turnos, total] = await Promise.all([
    prisma.turno.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { creadoEn: 'desc' },
      include: {
        agente: { select: { nombreCompleto: true } },
        propiedad: true,
      },
    }),
    prisma.turno.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Administración' }]} />
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[30px] font-medium leading-tight">
              Panel de administración
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Gestiona todas las visitas y agentes de DBB.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground hover:bg-secondary transition-colors">
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
          </div>
        </header>

        <section className="mt-7 rounded-2xl border border-border/60 bg-card shadow-soft">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, propiedad, comprador..."
                  className="h-9 w-72 rounded-lg border-border/70 bg-secondary/40 pl-9 text-[13px]"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-[12.5px] text-foreground hover:bg-secondary transition-colors">
                <Filter className="h-3.5 w-3.5" /> Estado
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-[12.5px] text-foreground hover:bg-secondary transition-colors">
                <Filter className="h-3.5 w-3.5" /> Agente
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-[12.5px] text-foreground hover:bg-secondary transition-colors">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Más filtros
              </button>
            </div>
            <p className="text-[12px] text-muted-foreground">{total} resultados</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/30 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Turno</th>
                  <th className="px-3 py-3 font-medium">Propiedad</th>
                  <th className="px-3 py-3 font-medium">Comprador</th>
                  <th className="px-3 py-3 font-medium">Agente</th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {turnos.map((turno) => (
                  <tr
                    key={turno.id}
                    className="border-b border-border/40 last:border-0 hover:bg-secondary/40 transition-colors"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                      <Link
                        href={`/dashboard/turnos/${turno.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {turno.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-foreground">
                        {turno.propiedad.nombrePropiedad ?? turno.propiedadId}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{turno.vendedorId}</p>
                    </td>
                    <td className="px-3 py-4 text-foreground">{turno.compradorId}</td>
                    <td className="px-3 py-4">
                      {turno.agente ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/10 text-[10.5px] font-medium text-accent-warm">
                            {turno.agente.nombreCompleto
                              .split(' ')
                              .map((p) => p[0])
                              .join('')}
                          </span>
                          <span className="text-foreground">{turno.agente.nombreCompleto}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Sin asignar</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-muted-foreground">
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
                        : '—'}
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={turno.estado} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5">
            <p className="text-[12px] text-muted-foreground">
              Mostrando {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} de {total} turnos
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={`?page=${Math.max(1, currentPage - 1)}`}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border/70 text-muted-foreground hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`?page=${p}`}
                  className={`h-8 min-w-8 rounded-lg px-2.5 text-[12.5px] transition-colors inline-flex items-center justify-center ${
                    p === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {p}
                </Link>
              ))}
              <Link
                href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border/70 text-muted-foreground hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
