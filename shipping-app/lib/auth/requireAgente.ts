import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { metadataHasAdminRole, type RoleMetadata } from '@/lib/auth/requireAdmin'

export async function requireAgente() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const isAdmin = metadataHasAdminRole(user.publicMetadata as RoleMetadata)

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: userId },
    select: { id: true, estado: true, nombreCompleto: true, vendedorId: true },
  })

  if (isAdmin && !agente) {
    return {
      id: userId,
      estado: 'ACEPTADO' as const,
      nombreCompleto:
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.emailAddresses?.[0]?.emailAddress ||
        'Admin',
      vendedorId: null,
    }
  }

  if (isAdmin && agente) return agente

  if (!agente) redirect('/onboarding')
  if (agente.estado === 'RECHAZADO') redirect('/cuenta-rechazada')
  if (agente.estado === 'PENDIENTE') redirect('/cuenta-en-revision')

  return agente
}
