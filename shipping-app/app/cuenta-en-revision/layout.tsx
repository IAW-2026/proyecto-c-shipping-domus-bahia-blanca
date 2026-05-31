import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { userHasAdminRole } from '@/lib/auth/requireAdmin'

export default async function CuentaEnRevisionLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')
  if (await userHasAdminRole(userId)) return <>{children}</>

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId },
    select: { estado: true },
  })

  if (!agente) redirect('/onboarding')
  if (agente.estado === 'ACEPTADO') redirect('/dashboard')
  if (agente.estado === 'RECHAZADO') redirect('/cuenta-rechazada')

  return <>{children}</>
}
