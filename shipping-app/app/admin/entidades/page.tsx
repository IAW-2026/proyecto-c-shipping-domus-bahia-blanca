import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Activity, ArrowLeft, ArrowUpRight, CalendarDays, UsersRound } from 'lucide-react'

export const metadata = {
  title: 'Consultar entidades - Domus',
  description: 'Resumen administrativo de turnos, agentes y propiedades del sistema.',
}

export default async function AdminEntidadesPage() {
  const [
    turnosCount,
    agentesCount,
  ] = await Promise.all([
    prisma.turno.count(),
    prisma.agenteInmobiliario.count(),
  ])

  const entities = [
    {
      name: 'Turnos',
      description: 'Solicitudes, estados y asignaciones.',
      count: turnosCount,
      href: '/admin/entidades/turnos',
      icon: CalendarDays,
    },
    {
      name: 'Agentes',
      description: 'Perfiles inmobiliarios y estados de aprobacion.',
      count: agentesCount,
      href: '/admin/entidades/agentes',
      icon: UsersRound,
    },
  ]

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-8 text-foreground lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href="/admin"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 py-2 text-[12.5px] font-medium shadow-soft transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <header>
          <h1 className="font-display text-[32px] font-medium leading-tight">
            Consultar entidades
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
            Modelos principales y estado general del sistema.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <p className="text-[12.5px] font-medium text-muted-foreground">Turnos totales</p>
            <p className="mt-4 font-display text-[34px] font-medium leading-none">
              {turnosCount}
            </p>
          </article>
          <article className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <p className="text-[12.5px] font-medium text-muted-foreground">Agentes</p>
            <p className="mt-4 font-display text-[34px] font-medium leading-none">
              {agentesCount}
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
            <div>
              <h2 className="font-display text-xl font-medium">Entidades</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Resumen de modelos principales.
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
              <Activity className="h-5 w-5" />
            </span>
          </div>

          <div className="grid gap-3 p-4">
            {entities.map((entity) => (
              <Link
                key={entity.name}
                href={entity.href}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-[#FAF8F5] p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-soft">
                    <entity.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium">{entity.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {entity.description}
                    </p>
                   
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-display text-[26px] font-medium leading-none">
                    {entity.count}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
