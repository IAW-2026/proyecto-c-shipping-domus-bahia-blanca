import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function requireOnboarding() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { clerkUserId: userId },
    select: { estado: true },
  })

  if (!agente) return // sin perfil, puede hacer onboarding

  // ya tiene perfil, redirigir según estado
  if (agente.estado === 'PENDIENTE') redirect('/cuenta-en-revision')
  if (agente.estado === 'RECHAZADO') redirect('/cuenta-rechazada')
  if (agente.estado === 'ACEPTADO') redirect('/dashboard')
}