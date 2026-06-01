import Link from 'next/link'
import { ArrowLeft, FlaskConical } from 'lucide-react'

export const metadata = {
  title: 'Probar APIs - Domus',
  description: 'Listado de APIs disponibles para probar integraciones administrativas.',
}

const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/agentes/estado?inmobiliariaId=[id]&estado=PENDIENTE,ACEPTADO',
    name: 'Consulta por agentes',
  },
  {
    method: 'PATCH',
    path: '/api/agentes/[id]/confirmar',
    name: 'Confirmar agente',
  },
  {
    method: 'PATCH',
    path: '/api/agentes/[id]/rechazar',
    name: 'Rechazar agente',
  },
  {
    method: 'GET',
    path: '/api/turnos/inmobiliaria/[inmobiliariaId]',
    name: 'Turnos por inmobiliaria',
  },
  {
    method: 'GET',
    path: '/api/turnos/comprador/[compradorId]',
    name: 'Turnos por comprador',
  },
]

export default function AdminApisPage() {
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
          <h1 className="font-display text-[32px] font-medium leading-tight text-primary">Probar APIs</h1>
          <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
            Endpoints activos para integraciones externas e internas.
          </p>
        </header>

        <section className="rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
            <div>
              <h2 className="font-display text-xl font-medium">Endpoints</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Metodos, rutas y autenticacion esperada.
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
              <FlaskConical className="h-5 w-5" />
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {apiEndpoints.map((endpoint) => (
              <div key={`${endpoint.method}-${endpoint.path}`} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-medium">{endpoint.name}</p>
                    <p className="mt-1 font-mono text-[12px] text-muted-foreground">
                      {endpoint.path}
                    </p>
                  </div>
                  <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-[11px] font-medium text-primary">
                    {endpoint.method}
                  </span>
                </div>
                
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
