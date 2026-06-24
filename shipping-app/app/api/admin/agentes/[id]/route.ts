import { auth } from '@clerk/nextjs/server'
import { Prisma, type EstadoAgente } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { metadataHasAdminRole, userHasAdminRole, type RoleMetadata } from '@/lib/auth/requireAdmin'
import { requireShippingApiKey } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'

const ESTADOS_AGENTE: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO', 'RECHAZADO']

function isEstadoAgente(value: string): value is EstadoAgente {
  return ESTADOS_AGENTE.includes(value as EstadoAgente)
}

async function requireAdminApiAccess(request: NextRequest) {
  const apiKeyUnauthorized = requireShippingApiKey(request)
  if (!apiKeyUnauthorized) return null

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (metadataHasAdminRole((sessionClaims?.metadata ?? {}) as RoleMetadata)) {
    return null
  }

  const hasAdminRole = await userHasAdminRole(userId)

  if (!hasAdminRole) {
    return NextResponse.json({ error: 'Requiere rol admin' }, { status: 403 })
  }

  return null
}

function isPrismaNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

function stringOrUndefined(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdminApiAccess(request)
    if (unauthorized) return unauthorized

    const { id } = await context.params
    const body = (await request.json().catch(() => null)) as {
      nombreCompleto?: unknown
      nombreInmobiliaria?: unknown
      email?: unknown
      telefono?: unknown
      vendedorId?: unknown
      estado?: unknown
    } | null

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'body invalido' },
        { status: 400 }
      )
    }

    const estado = typeof body.estado === 'string' ? body.estado.trim().toUpperCase() : undefined

    if (estado !== undefined && !isEstadoAgente(estado)) {
      return NextResponse.json(
        { error: 'estado invalido' },
        { status: 400 }
      )
    }

    const data = {
      ...(stringOrUndefined(body.nombreCompleto) ? { nombreCompleto: stringOrUndefined(body.nombreCompleto) } : {}),
      ...(stringOrUndefined(body.nombreInmobiliaria) ? { nombreInmobiliaria: stringOrUndefined(body.nombreInmobiliaria) } : {}),
      ...(stringOrUndefined(body.email) ? { email: stringOrUndefined(body.email) } : {}),
      ...(stringOrUndefined(body.telefono) ? { telefono: stringOrUndefined(body.telefono) } : {}),
      ...(stringOrUndefined(body.vendedorId) ? { vendedorId: stringOrUndefined(body.vendedorId) } : {}),
      ...(estado ? { estado } : {}),
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      )
    }

    const agente = await prisma.agenteInmobiliario.update({
      where: { id },
      data,
      select: {
        id: true,
        nombreCompleto: true,
        nombreInmobiliaria: true,
        email: true,
        telefono: true,
        vendedorId: true,
        estado: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: agente,
    })
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return NextResponse.json(
        { error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: 'Error actualizando agente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdminApiAccess(request)
    if (unauthorized) return unauthorized

    const { id } = await context.params

    await prisma.$transaction([
      prisma.turno.updateMany({
        where: { agenteId: id },
        data: { agenteId: null },
      }),
      prisma.agenteInmobiliario.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Agente eliminado correctamente',
    })
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return NextResponse.json(
        { error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: 'Error eliminando agente' },
      { status: 500 }
    )
  }
}
