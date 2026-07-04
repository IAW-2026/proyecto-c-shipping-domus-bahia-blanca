import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { StatusBadge } from '@/app/components/dashboard/statusBadge'
import { Calendar, Check, MapPin, User2 } from 'lucide-react'
import { tomarTurno } from '@/lib/turnos/turno'
import { argentinaShortDateFromInstant, argentinaTimeFromInstant } from '@/lib/turnos/horarios'

export const metadata = {
  title: 'Turnos pendientes - Domus',
  description: 'Listado de turnos pendientes de aceptar para la inmobiliaria.',
}

export const dynamic = 'force-dynamic'
export default async function TurnosPage() {
  const { userId } = await auth()

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId! },
    select: { id: true, vendedorId: true },
  })

  //Agrego esto aunque en el layout obligue a que sea agente y eso 
  //quiere decir que tiene un vendedorId asociado, ya que sino no puedo buscar los turnos, termina siendo un parche.
  
  if (!agente?.vendedorId) {
    return (
      <main className="flex h-full items-center justify-center text-muted-foreground text-sm">
        No tenés una inmobiliaria asignada.
      </main>
    )
  }

  const turnos = await prisma.turno.findMany({
    where: {
      vendedorId: agente.vendedorId,
      estado: { in: ['PENDIENTE_AGENTE']},
      agenteId: null,
      fechaHoraSolicitada: {
        gt: new Date(),
      },
    },
    orderBy: { fechaHoraSolicitada: 'asc' },
    include: {
      propiedad: {
        include: {
          multimedia: {
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
  })

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Turnos pendientes' }]} />
      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[30px] font-medium leading-tight">
              Turnos pendientes
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              {turnos.length} solicitudes esperan tu confirmación.
            </p>
          </div>
        </header>

        <ul className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {turnos.map((turno) => (
            <li
              key={turno.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elev"
            >
              <Link
                href={`/dashboard/turnos/${turno.id}`}
                className="absolute inset-0 z-20"
                aria-label={`Ver turno de ${turno.propiedad.nombrePropiedad ?? 'propiedad'}`}
              />

              <div className="relative z-0 aspect-[16/9] max-h-[220px] w-full overflow-hidden bg-secondary/40">
                {turno.propiedad.multimedia[0] ? (
                  <Image
                    src={turno.propiedad.multimedia[0].url}
                    alt={turno.propiedad.multimedia[0].alt ?? turno.propiedad.nombrePropiedad ?? 'Propiedad'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    quality={72}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
                    Imagen no disponible
                  </div>
                )}
               
              </div>

              <div className="relative z-0 p-4">
                <div className="min-w-0">
                  <p className="block font-display text-[17px] font-medium leading-snug text-foreground">
                    {turno.propiedad.nombrePropiedad ?? `Propiedad ${turno.propiedadId}`}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {turno.propiedad.direccion ?? turno.propiedad.vendedorId}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl bg-secondary/60 p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-card text-primary">
                      <User2 className="h-3.5 w-3.5" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Comprador
                      </p>
                      <p className="text-[12.5px] font-medium text-foreground">
                        {turno.nombreComprador}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-card text-primary">
                      <Calendar className="h-3.5 w-3.5" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Fecha y hora
                      </p>
                      <p className="text-[12.5px] font-medium text-foreground">
                        {turno.fechaHoraSolicitada
                          ? argentinaShortDateFromInstant(turno.fechaHoraSolicitada) +
                            ' · ' +
                            argentinaTimeFromInstant(turno.fechaHoraSolicitada)
                          : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
