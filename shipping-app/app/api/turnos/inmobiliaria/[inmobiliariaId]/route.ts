import { prisma } from '@/lib/prisma'

import { NextResponse } from 'next/server'
import type { EstadoTurno } from '@prisma/client'

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

// Get para obtener los turnos de una inmobiliaria desde la app externa.
export async function GET(
  request: Request,
  context: { params: Promise<{ inmobiliariaId: string }> }
) {
  try {
    // Verificar API key
    /*
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey || apiKey !== process.env.SELLER_APP_API_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
*/
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
      },
    })

    return NextResponse.json(turnos)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error obteniendo turnos' },
      { status: 500 }
    )
  }
}
