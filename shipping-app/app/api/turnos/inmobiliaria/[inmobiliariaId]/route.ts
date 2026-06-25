import { prisma } from '@/lib/prisma'

import { NextResponse } from 'next/server'
import type { EstadoTurno } from '@prisma/client'
import { requireShippingApiKey } from '@/lib/api-key'
import { argentinaDateTimeFields } from '@/lib/turnos/horarios'

const ESTADOS_TURNO: EstadoTurno[] = [
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]
const ESTADOS_RESOLUCION_PRE_ACEPTADO: EstadoTurno[] = ['PENDIENTE_AGENTE', 'CONFIRMADO']

function isEstadoTurno(value: string): value is EstadoTurno {
  return ESTADOS_TURNO.includes(value as EstadoTurno)
}

// Get para obtener los turnos de una inmobiliaria desde la app externa.
export async function GET(
  request: Request,
  context: { params: Promise<{ inmobiliariaId: string }> }
) {
  try {
    const unauthorized = requireShippingApiKey(request)
    if (unauthorized) return unauthorized

    const { inmobiliariaId } = await context.params
    const { searchParams } = new URL(request.url)
    const estadoParam = searchParams.get('estado')
    let estado: EstadoTurno | undefined
    const vendedorId = inmobiliariaId

    if (!vendedorId) {
      return NextResponse.json(
        { error: 'inmobiliariaId es requerido' },
        { status: 400 }
      )
    }

    if (estadoParam) {
      if (!isEstadoTurno(estadoParam)) {
        return NextResponse.json(
          { error: 'estado invalido' },
          { status: 400 }
        )
      }

      estado = estadoParam
    }

    const turnos = await prisma.turno.findMany({
      where: {
        vendedorId,
        ...(estado ? { estado } : {}),
      },
      orderBy: { fechaHoraSolicitada: 'asc' },
      include: {
        propiedad: true,
        agente: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    })

    const turnosConAgenteNombre = turnos.map((turno) => ({
      ...turno,
      ...argentinaDateTimeFields(turno.fechaHoraSolicitada),
      agenteNombre: turno.agente?.nombreCompleto ?? null,
    }))

    return NextResponse.json(turnosConAgenteNombre)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error obteniendo turnos' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ inmobiliariaId: string }> }
) {
  try {
    const unauthorized = requireShippingApiKey(request)
    if (unauthorized) return unauthorized

    const { inmobiliariaId } = await context.params
    const body = (await request.json().catch(() => null)) as {
      turnoId?: unknown
      estado?: unknown
    } | null

    const turnoId = typeof body?.turnoId === 'string' ? body.turnoId.trim() : ''
    const estado = typeof body?.estado === 'string' ? body.estado.trim().toUpperCase() : ''

    if (!turnoId) {
      return NextResponse.json(
        { error: 'turnoId es requerido' },
        { status: 400 }
      )
    }

    if (!isEstadoTurno(estado) || !ESTADOS_RESOLUCION_PRE_ACEPTADO.includes(estado)) {
      return NextResponse.json(
        { error: 'estado invalido. Use PENDIENTE_AGENTE o CONFIRMADO' },
        { status: 400 }
      )
    }

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: {
        id: true,
        vendedorId: true,
        estado: true,
      },
    })

    if (!turno) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    if (turno.vendedorId !== inmobiliariaId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    if (turno.estado !== 'PRE_ACEPTADO') {
      return NextResponse.json(
        { error: 'Solo se pueden actualizar turnos en estado PRE_ACEPTADO' },
        { status: 400 }
      )
    }

    const updated = await prisma.turno.update({
      where: { id: turnoId },
      data: { estado },
      include: {
        propiedad: true,
      },
    })

    return NextResponse.json({
      ...updated,
      ...argentinaDateTimeFields(updated.fechaHoraSolicitada),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error actualizando turno' },
      { status: 500 }
    )
  }
}
