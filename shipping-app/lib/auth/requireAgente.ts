import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { metadataHasAdminRole, type RoleMetadata } from '@/lib/auth/requireAdmin'

export async function requireAgente() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const [user, agente] = await Promise.all([
    clerkClient().then((client) => client.users.getUser(userId)),
    prisma.agenteInmobiliario.findUnique({
      where: { id: userId },
      select: { id: true, estado: true, nombreCompleto: true, vendedorId: true },
    }),
  ])
  const isAdmin = metadataHasAdminRole(user.publicMetadata as RoleMetadata)

  if (isAdmin && !agente) {
    return {
      id: userId,
      estado: 'ACEPTADO' as const,
      nombreCompleto:
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.emailAddresses?.[0]?.emailAddress ||
        'Admin',
      vendedorId: null,
      isAdmin,
    }
  }

  if (isAdmin && agente) return { ...agente, isAdmin }

  if (!agente) redirect('/onboarding')
  if (agente.estado === 'RECHAZADO') redirect('/cuenta-rechazada')
  if (agente.estado === 'PENDIENTE') redirect('/cuenta-en-revision')

  return { ...agente, isAdmin }
}
