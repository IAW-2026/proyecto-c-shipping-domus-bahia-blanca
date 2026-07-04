import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF8F5] px-6 py-16 text-foreground">
      <section className="w-full max-w-xl rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
        <p className="font-display text-[72px] font-medium leading-none text-primary">404</p>
        <h1 className="mt-5 font-display text-[32px] font-medium leading-tight">
          Pagina no encontrada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-muted-foreground">
          La pagina que estas buscando no existe o ya no esta disponible.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-soft transition-colors hover:bg-[oklch(0.36_0.03_150)]"
          >
            <Home className="h-4 w-4" />
            Ir al dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border/70 bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
