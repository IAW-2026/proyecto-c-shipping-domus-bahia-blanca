'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { agentePerfilSchema } from '@/lib/validation/agente'
import { getInmobiliarias } from '@/lib/agente/inmobiliarias'

export async function crearAgente(data: { telefono: string; vendedorId: string }) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const parsed = agentePerfilSchema.parse(data)

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses?.[0]?.emailAddress
  if (!email) throw new Error('Email no disponible')

  const inmobiliarias = await getInmobiliarias()
  const selected = inmobiliarias.find((item) => item.id === parsed.vendedorId)
  if (!selected) throw new Error('Inmobiliaria invalida')

  const nombreCompleto =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sin nombre'

  const agente = await prisma.agenteInmobiliario.upsert({
    where: { id: userId },
    update: {
      nombreCompleto,
      nombreInmobiliaria: selected.nombre,
      email,
      telefono: parsed.telefono,
      vendedorId: selected.id,
      estado: 'PENDIENTE',
    },
    create: {
      id: userId,
      nombreCompleto,
      nombreInmobiliaria: selected.nombre,
      email,
      telefono: parsed.telefono,
      vendedorId: selected.id,
      estado: 'PENDIENTE',
    },
  })

  // Asignar rol agente en Clerk
  const rolesActuales = (user.publicMetadata?.roles as string[]) ?? []
  const roles = Array.from(new Set([...rolesActuales, 'agente']))

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      roles,
    },
  })

  return agente
}