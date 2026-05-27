import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function CuentaRechazadaLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId },
    select: { estado: true },
  })

  if (!agente) redirect('/onboarding')
  if (agente.estado === 'ACEPTADO') redirect('/dashboard')
  if (agente.estado === 'PENDIENTE') redirect('/cuenta-en-revision')

  return <>{children}</>
}