import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function requireAgente() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, estado: true, nombreCompleto: true, vendedorId: true },
  })

  if (!agente) redirect('/onboarding')
  if (agente.estado === 'RECHAZADO') redirect('/cuenta-rechazada')
  if (agente.estado === 'PENDIENTE') redirect('/cuenta-en-revision')

  return agente
}