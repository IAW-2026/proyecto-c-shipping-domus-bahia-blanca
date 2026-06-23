import { auth } from '@clerk/nextjs/server'
import { Prisma, type EstadoTurno } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { metadataHasAdminRole, userHasAdminRole, type RoleMetadata } from '@/lib/auth/requireAdmin'
import { requireShippingApiKey } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'

const ESTADOS_TURNO: EstadoTurno[] = [
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]

function isEstadoTurno(value: string): value is EstadoTurno {
  return ESTADOS_TURNO.includes(value as EstadoTurno)
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

function turnoInclude() {
  return {
    propiedad: true,
    agente: {
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
      },
    },
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ turnoId: string }> }
) {
  try {
    const unauthorized = await requireAdminApiAccess(request)
    if (unauthorized) return unauthorized

    const { turnoId } = await context.params
    const body = (await request.json().catch(() => null)) as { estado?: unknown } | null
    const estado = typeof body?.estado === 'string' ? body.estado.trim().toUpperCase() : ''

    if (!isEstadoTurno(estado)) {
      return NextResponse.json(
        { error: 'estado invalido' },
        { status: 400 }
      )
    }

    const turno = await prisma.turno.update({
      where: { id: turnoId },
      data: {
        estado,
        ...(estado === 'PENDIENTE_AGENTE' ? { agenteId: null } : {}),
      },
      include: turnoInclude(),
    })

    return NextResponse.json({
      success: true,
      data: {
        ...turno,
        agenteNombre: turno.agente?.nombreCompleto ?? null,
      },
    })
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: 'Error actualizando turno' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ turnoId: string }> }
) {
  try {
    const unauthorized = await requireAdminApiAccess(request)
    if (unauthorized) return unauthorized

    const { turnoId } = await context.params

    await prisma.turno.delete({
      where: { id: turnoId },
    })

    return NextResponse.json({
      success: true,
      message: 'Turno eliminado correctamente',
    })
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: 'Error eliminando turno' },
      { status: 500 }
    )
  }
}
