import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type DashboardHeaderProps = {
  firstName: string
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
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
  )
}
