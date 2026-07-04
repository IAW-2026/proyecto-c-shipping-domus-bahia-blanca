import { auth } from '@clerk/nextjs/server'
import { type EstadoAgente } from '@prisma/client'
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

function parseEstado(request: NextRequest) {
  const estado = request.nextUrl.searchParams.get('estado')?.trim().toUpperCase()
  if (!estado) return null

  return isEstadoAgente(estado) ? estado : undefined
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAccess(request)
    if (unauthorized) return unauthorized

    const estado = parseEstado(request)
    const inmobiliariaId = request.nextUrl.searchParams.get('inmobiliariaId')?.trim()

    if (estado === undefined) {
      return NextResponse.json(
        { error: 'estado invalido' },
        { status: 400 }
      )
    }

    const agentes = await prisma.agenteInmobiliario.findMany({
      where: {
        ...(inmobiliariaId ? { vendedorId: inmobiliariaId } : {}),
        ...(estado ? { estado } : {}),
      },
      orderBy: { nombreCompleto: 'asc' },
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
      data: agentes,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error obteniendo agentes' },
      { status: 500 }
    )
  }
}
