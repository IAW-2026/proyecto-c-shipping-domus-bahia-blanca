import { auth, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CalendarDays, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { BackButton } from '@/app/components/turnos/BackButton'
import { prisma } from '@/lib/prisma'
import { domusBackHref, requestOriginFromHeaders } from '@/lib/turnos/domusBackHref'
import { argentinaLongDateFromInstant, argentinaTimeFromInstant } from '@/lib/turnos/horarios'

export const metadata = {
  title: 'Turno reservado - Domus',
  description: 'Confirmacion de solicitud de turno y resumen de la reserva realizada.',
}

function formatDate(date: Date) {
  return argentinaLongDateFromInstant(date)
}

function formatTime(date: Date) {
  return argentinaTimeFromInstant(date)
}

export default async function GraciasTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ turnoId?: string; returnTo?: string }>
}) {
  const { turnoId, returnTo } = await searchParams
  const { userId } = await auth()
  const requestHeaders = await headers()

  if (!userId) {
    const params = new URLSearchParams()
    if (turnoId) params.set('turnoId', turnoId)
    if (returnTo) params.set('returnTo', returnTo)
    const redirectUrl = params.size ? `/turnos/gracias?${params.toString()}` : '/turnos/gracias'

    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`)
  }

  const [turno, user] = await Promise.all([
    turnoId
      ? prisma.turno.findFirst({
          where: {
            id: turnoId,
            compradorId: userId,
          },
          select: {
            fechaHoraSolicitada: true,
            propiedadId: true,
            propiedad: {
              select: {
                nombrePropiedad: true,
                direccion: true,
              },
            },
          },
        })
      : null,
    currentUser(),
  ])

  const backHref = domusBackHref({
    returnTo,
    referer: requestHeaders.get('referer'),
    requestOrigin: requestOriginFromHeaders(requestHeaders),
    propertyId: turno?.propiedadId,
  })

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <p className="mt-5 text-[12px] uppercase tracking-[0.22em] text-accent-warm">
          Solicitud recibida
        </p>
        <h1 className="mt-2 font-display text-[30px] font-medium leading-tight text-foreground">
          Gracias por reservar tu turno
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Un agente va a revisar la solicitud y te vamos a avisar a{' '}
          <span className="font-medium text-foreground">
            {user?.emailAddresses[0]?.emailAddress ?? 'tu email'}
          </span>
          .
        </p>

        {turno && (
          <div className="mt-7 rounded-xl border border-border/60 bg-secondary/40 p-5 text-left">
            <p className="font-display text-[18px] font-medium">{turno.propiedad.nombrePropiedad}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {turno.propiedad.direccion}
            </p>

            {turno.fechaHoraSolicitada && (
              <div className="mt-5 grid gap-3 border-t border-border/60 pt-4 text-[13.5px] sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatDate(turno.fechaHoraSolicitada)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatTime(turno.fechaHoraSolicitada)}</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-7 flex justify-center">
          <BackButton href={backHref} label="Volver" />
        </div>
      </section>
    </main>
  )
}
