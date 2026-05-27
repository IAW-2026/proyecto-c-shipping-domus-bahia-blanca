// app/sign-in/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function SignInLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) return <>{children}</>

  const agente = await prisma.agenteInmobiliario.findUnique({
     where: { id: userId },
     select: { estado: true },
   })
 

  if (!agente) redirect('/onboarding')
  if (agente.estado === 'PENDIENTE') redirect('/cuenta-en-revision')
  if (agente.estado === 'RECHAZADO') redirect('/cuenta-rechazada')
  if (agente.estado === 'ACEPTADO') redirect('/dashboard')

  return <>{children}</>
}