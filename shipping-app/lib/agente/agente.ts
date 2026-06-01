'use server'

import { revalidatePath } from 'next/cache'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { agentePerfilSchema } from '@/lib/validation/agente'
import { getInmobiliarias } from '@/lib/agente/inmobiliarias'
import { metadataHasAdminRole, requireAdmin, type RoleMetadata } from '@/lib/auth/requireAdmin'
import type { EstadoAgente } from '@prisma/client'

const ESTADOS_AGENTE: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO', 'RECHAZADO']

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

  revalidatePath('/onboarding')
  revalidatePath('/cuenta-en-revision')
  revalidatePath('/dashboard')

  return agente
}



function stringValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === 'string' ? value.trim() : ''
}

function nullableString(formData: FormData, key: string) {
  const value = stringValue(formData, key)

  return value === '' ? null : value
}

function estadoAgenteValue(formData: FormData) {
  const value = stringValue(formData, 'estado') as EstadoAgente

  if (!ESTADOS_AGENTE.includes(value)) {
    throw new Error('Estado de agente invalido')
  }

  return value
}

function revalidateAgentesAdmin() {
  revalidatePath('/admin/entidades')
  revalidatePath('/admin/entidades/agentes')
  revalidatePath('/dashboard')
}

function revalidateTurnosPorAgenteAdmin() {
  revalidatePath('/admin/entidades')
  revalidatePath('/admin/entidades/turnos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/turnos')
}

async function quitarRolAgente(userId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  if (metadataHasAdminRole(user.publicMetadata as RoleMetadata)) {
    throw new Error('No es posible quitar el rol de agente porque este usuario es admin.')
  }

  const rolesActuales = Array.isArray(user.publicMetadata?.roles)
    ? user.publicMetadata.roles
    : []
  const roles = rolesActuales.filter((role) => role !== 'agente')

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      roles,
    },
  })
}

export async function crearAgenteAdmin(formData: FormData) {
  await requireAdmin()

  await prisma.agenteInmobiliario.create({
    data: {
      id: stringValue(formData, 'id'),
      nombreCompleto: stringValue(formData, 'nombreCompleto'),
      nombreInmobiliaria: nullableString(formData, 'nombreInmobiliaria'),
      email: stringValue(formData, 'email'),
      telefono: nullableString(formData, 'telefono'),
      vendedorId: nullableString(formData, 'vendedorId'),
      estado: estadoAgenteValue(formData),
    },
  })

  revalidateAgentesAdmin()
}

export async function actualizarAgenteAdmin(formData: FormData) {
  await requireAdmin()

  const id = stringValue(formData, 'id')

  await prisma.agenteInmobiliario.update({
    where: { id },
    data: {
      nombreCompleto: stringValue(formData, 'nombreCompleto'),
      nombreInmobiliaria: nullableString(formData, 'nombreInmobiliaria'),
      email: stringValue(formData, 'email'),
      telefono: nullableString(formData, 'telefono'),
      vendedorId: nullableString(formData, 'vendedorId'),
      estado: estadoAgenteValue(formData),
    },
  })

  revalidateAgentesAdmin()
}

export async function eliminarAgenteAdmin(formData: FormData) {
  await requireAdmin()

  const id = stringValue(formData, 'id')

  await quitarRolAgente(id)

  await prisma.$transaction([
    prisma.turno.updateMany({
      where: { agenteId: id },
      data: { agenteId: null },
    }),
    prisma.agenteInmobiliario.delete({ where: { id } }),
  ])

  revalidateAgentesAdmin()
  revalidateTurnosPorAgenteAdmin()
}

export async function eliminarAgenteAdminConEstado(
  _prevState: { error: string | null },
  formData: FormData
) {
  try {
    await eliminarAgenteAdmin(formData)

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'No se pudo eliminar el agente',
    }
  }
}
