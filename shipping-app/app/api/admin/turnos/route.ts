import { auth } from '@clerk/nextjs/server'
import type { EstadoTurno, Prisma } from '@prisma/client'
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

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAccess(request)
    if (unauthorized) return unauthorized

    const estadoParam = request.nextUrl.searchParams.get('estado')?.trim().toUpperCase()
    const inmobiliariaId = request.nextUrl.searchParams.get('inmobiliariaId')?.trim()
    const propiedadId = request.nextUrl.searchParams.get('propiedadId')?.trim()
    let estado: EstadoTurno | undefined

    if (estadoParam) {
      if (!isEstadoTurno(estadoParam)) {
        return NextResponse.json(
          { error: 'estado invalido' },
          { status: 400 }
        )
      }

      estado = estadoParam
    }

    const where: Prisma.TurnoWhereInput = {
      ...(estado ? { estado } : {}),
      ...(inmobiliariaId ? { vendedorId: inmobiliariaId } : {}),
      ...(propiedadId ? { propiedadId } : {}),
    }

    const turnos = await prisma.turno.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        propiedadId: true,
        compradorId: true,
        vendedorId: true,
        nombreComprador: true,
        agenteId: true,
        fechaHoraSolicitada: true,
        estado: true,
        observaciones: true,
        estadoComprador: true,
        creadoEn: true,
        propiedad: {
          select: {
            id: true,
            nombrePropiedad: true,
            descripcion: true,
            direccion: true,
            barrio: true,
            ciudad: true,
            provincia: true,
            pais: true,
            codigoPostal: true,
            latitud: true,
            longitud: true,
            precio: true,
            expensas: true,
            moneda: true,
            vendedorId: true,
            nombreInmobiliaria: true,
          },
        },
        agente: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: turnos.map((turno) => ({
        ...turno,
        agenteNombre: turno.agente?.nombreCompleto ?? null,
        tituloPropiedad: turno.propiedad.nombrePropiedad,
        direccion: turno.propiedad.direccion,
      })),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error obteniendo turnos' },
      { status: 500 }
    )
  }
}
