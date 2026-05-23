import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import {
  ArrowUpRight,
  CalendarCheck2,
  Clock3,
  CheckCircle2,
  TrendingUp,
  MapPin,
} from 'lucide-react'

const metrics = [
  {
    label: 'Visitas pendientes',
    value: '14',
    delta: '+3 esta semana',
    icon: Clock3,
    accent: 'bg-[oklch(0.62_0.07_60_/_0.12)] text-[oklch(0.45_0.07_60)]',
  },
  {
    label: 'Visitas confirmadas',
    value: '28',
    delta: '+12% vs. semana pasada',
    icon: CalendarCheck2,
    accent: 'bg-[oklch(0.42_0.03_150_/_0.12)] text-primary',
  },
  {
    label: 'Visitas completadas',
    value: '63',
    delta: 'Mes en curso',
    icon: CheckCircle2,
    accent: 'bg-[oklch(0.72_0.06_130_/_0.18)] text-[oklch(0.38_0.06_140)]',
  },
  {
    label: 'Tasa de conversión',
    value: '31%',
    delta: 'Visita → oferta',
    icon: TrendingUp,
    accent: 'bg-[oklch(0.62_0.11_40_/_0.12)] text-accent-warm',
  },
]

const week = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const weekData = [4, 7, 5, 9, 6, 11, 3]

export default async function DashboardPage() {
  const { userId } = await auth()

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { clerkUserId: userId! },
    select: { id: true, nombreCompleto: true },
  })

  const upcoming = await prisma.turno.findMany({
    where: { agenteId: agente?.id },
    orderBy: { fechaHoraSolicitada: 'asc' },
    take: 4,
  })

  const firstName = agente?.nombreCompleto?.split(' ')[0] ?? 'Agente'

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Dashboard' }]} />
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-accent-warm">
              Hola, {firstName}
            </p>
            <h1 className="mt-2 font-display text-[32px] font-medium leading-tight text-foreground">
              Tu agenda de hoy.
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <Link
            href="/dashboard/turnos"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground shadow-soft transition-colors hover:bg-[oklch(0.36_0.03_150)]"
          >
            Ver turnos pendientes
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        {/* Metrics */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <article
              key={m.label}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:shadow-elev"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-muted-foreground">
                  {m.label}
                </span>
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${m.accent}`}>
                  <m.icon className="h-[18px] w-[18px]" />
                </span>
              </div>
              <p className="mt-5 font-display text-[34px] font-medium leading-none text-foreground">
                {m.value}
              </p>
              <p className="mt-2 text-[12px] text-muted-foreground">{m.delta}</p>
            </article>
          ))}
        </section>

        {/* Calendar + upcoming */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-medium">Resumen semanal</h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Distribución de visitas — semana del 12 al 18 de mayo
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Confirmadas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary-soft" /> Pendientes
                </span>
              </div>
            </div>
            <div className="mt-8 flex h-56 items-end gap-3">
              {weekData.map((v, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 flex-col justify-end gap-1">
                    <div
                      className="w-full rounded-t-md bg-primary-soft/70 transition-all group-hover:bg-primary-soft"
                      style={{ height: `${(v / 11) * 50}%` }}
                    />
                    <div
                      className="w-full rounded-t-md bg-primary transition-all"
                      style={{ height: `${(v / 11) * 50 + 10}%` }}
                    />
                  </div>
                  <span className="text-[11.5px] text-muted-foreground">{week[i]}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border/60 bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-medium">Próximas visitas</h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Próximas 48 horas
                </p>
              </div>
              <Link
                href="/dashboard/agenda"
                className="text-[12.5px] font-medium text-primary hover:underline"
              >
                Ver agenda
              </Link>
            </div>
            <ul className="divide-y divide-border/60">
              {upcoming.map((turno) => (
                <li key={turno.id} className="flex items-start gap-4 px-6 py-4">
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
                      {turno.propiedadId}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {turno.compradorId}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={turno.estado} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </>
  )
}