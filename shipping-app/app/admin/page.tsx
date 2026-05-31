import Link from 'next/link'
import { Activity, ArrowUpRight, FlaskConical, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Administracion - Domus',
  description: 'Panel administrativo para probar APIs y gestionar entidades del sistema.',
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-8 text-foreground lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-8">
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-[12px] font-medium text-primary shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </div>
          <h1 className="mt-5 font-display text-[40px] font-medium leading-tight text-foreground">
            Bienvenido al panel de administracion.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            Desde aca podes probar integraciones externas o consultar las entidades principales
            del sistema.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/apis"
            className="group rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-colors hover:bg-secondary"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary group-hover:bg-card">
                <FlaskConical className="h-6 w-6" />
              </span>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-medium">Probar APIs</h2>
            <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
              Revisar endpoints, metodos y credenciales necesarias para integraciones.
            </p>
          </Link>

          <Link
            href="/admin/entidades"
            className="group rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-colors hover:bg-secondary"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary group-hover:bg-card">
                <Activity className="h-6 w-6" />
              </span>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-medium">Consultar entidades</h2>
            <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
              Ver resumenes de turnos, agentes y propiedades sincronizadas.
            </p>
          </Link>
        </section>

        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/70 bg-card px-4 py-2.5 text-[13px] font-medium shadow-soft transition-colors hover:bg-secondary"
        >
          Volver al dashboard
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  )
}
