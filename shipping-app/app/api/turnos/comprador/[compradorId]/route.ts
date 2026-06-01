import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { EstadoTurno } from '@prisma/client'

const ESTADOS_COMPRADOR: EstadoTurno[] = [
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]

function isEstadoComprador(value: string): value is EstadoTurno {
  return ESTADOS_COMPRADOR.includes(value as EstadoTurno)
}

//Endpoint para obtener todos los turnos relacionados a un comprador, en su estado actual
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ compradorId: string }> }
) {
  try {
    const { compradorId } = await context.params
    const estadoParam = request.nextUrl.searchParams.get('estado')?.toUpperCase()

    if (estadoParam && !isEstadoComprador(estadoParam)) {
      return NextResponse.json(
        { error: 'estado invalido' },
        { status: 400 }
      )
    }

    const turnos = await prisma.turno.findMany({
      where: {
        compradorId,
        ...(estadoParam ? { EstadoTurno: estadoParam } : {}),
      },
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        propiedadId: true,
        estado: true,
        estadoComprador: true,
        creadoEn: true,
      },
    })

    const turnosPorPropiedad = new Map<string, typeof turnos[number]>()

    for (const turno of turnos) {
      if (!turnosPorPropiedad.has(turno.propiedadId)) {
        turnosPorPropiedad.set(turno.propiedadId, turno)
      }
    }

    return NextResponse.json([...turnosPorPropiedad.values()])
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error obteniendo turnos' },
      { status: 500 }
    )
  }
}
