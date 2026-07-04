import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  actualizarAgenteAdmin,
} from '@/lib/agente/agente'
import { ArrowLeft } from 'lucide-react'
import { DeleteAgentForm } from './deleteAgentForm'
import type { EstadoAgente } from '@prisma/client'

export const metadata = {
  title: 'CRUD agentes - Domus',
  description: 'Administracion completa de agentes inmobiliarios del sistema.',
}

const estadosAgente: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO', 'RECHAZADO']

function TextField({
  name,
  label,
  defaultValue,
  required,
  readOnly,
}: {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
  readOnly?: boolean
}) {
  return (
    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        readOnly={readOnly}
        className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary read-only:text-muted-foreground"
      />
    </label>
  )
}

function EstadoField({ defaultValue }: { defaultValue?: EstadoAgente }) {
  return (
    <label className="grid gap-1.5 text-[12px] font-medium text-muted-foreground">
      Estado
      <select
        key={defaultValue ?? 'PENDIENTE'}
        name="estado"
        defaultValue={defaultValue ?? 'PENDIENTE'}
        className="h-9 rounded-lg border border-border/70 bg-[#FAF8F5] px-3 text-[13px] text-foreground outline-none focus:border-primary"
      >
        {estadosAgente.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>
    </label>
  )
}

export default async function AdminAgentesPage() {
  const agentes = await prisma.agenteInmobiliario.findMany({
    orderBy: { nombreCompleto: 'asc' },
    include: {
      _count: {
        select: { turnos: true },
      },
    },
  })

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
          <h1 className="font-display text-[32px] font-medium leading-tight">
            Agentes inmobiliarios
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Ver, editar y eliminar agentes. 
          </p>
        </header>

        <section className="rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="border-b border-border/60 px-6 py-5">
            <h2 className="font-display text-xl font-medium">Todos los agentes</h2>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {agentes.length} registros
            </p>
          </div>
          <div className="divide-y divide-border/60">
            {agentes.map((agente) => (
              <details key={agente.id} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-medium">{agente.nombreCompleto}</p>
                    <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">
                      {agente.id} · {agente.estado}
                    </p>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {agente._count.turnos} turnos asignados
                  </p>
                </summary>

                <div className="mt-4 rounded-xl border border-border/60 bg-[#FAF8F5] p-4">
                  <form action={actualizarAgenteAdmin} className="grid gap-3 md:grid-cols-3">
                    <TextField name="id" label="ID" defaultValue={agente.id} readOnly required />
                    <TextField
                      name="nombreCompleto"
                      label="Nombre completo"
                      defaultValue={agente.nombreCompleto}
                      required
                    />
                    <TextField name="email" label="Email" defaultValue={agente.email} required />
                    <TextField name="telefono" label="Telefono" defaultValue={agente.telefono} />
                    <TextField
                      name="nombreInmobiliaria"
                      label="Nombre inmobiliaria"
                      defaultValue={agente.nombreInmobiliaria}
                    />
                    <TextField
                      name="vendedorId"
                      label="Vendedor ID"
                      defaultValue={agente.vendedorId}
                    />
                    <EstadoField defaultValue={agente.estado} />
                    <div className="flex items-end">
                      <button className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[oklch(0.36_0.03_150)]">
                        Guardar
                      </button>
                    </div>
                  </form>

                  <DeleteAgentForm agenteId={agente.id} />
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
