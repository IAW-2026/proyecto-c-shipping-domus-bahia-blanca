import { NextResponse, type NextRequest } from 'next/server'
import { requireShippingApiKey } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'
import  { EstadoTurno } from '@prisma/client'

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
    const unauthorized = requireShippingApiKey(request)
    if (unauthorized) return unauthorized

    const { compradorId } = await context.params
    const estadoRaw = request.nextUrl.searchParams.get('estado')
    const estadoParam = estadoRaw && Object.values(EstadoTurno).includes(estadoRaw as EstadoTurno)
      ? (estadoRaw as EstadoTurno)
      : null
    if (estadoParam && !isEstadoComprador(estadoParam)) {
      return NextResponse.json(
        { error: 'estado invalido' },
        { status: 400 }
      )
    }

    const turnos = await prisma.turno.findMany({
      where: {
        compradorId,
        ...(estadoParam ? { estado: estadoParam } : {}),
      },
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        propiedadId: true,
        fechaHoraSolicitada: true,
        estado: true,
        estadoComprador: true,
        compradorId:true,
        vendedorId: true,
        observaciones: true,
        creadoEn: true,
        propiedad: {
          select: {
            nombrePropiedad: true,
            direccion: true,
          },
        },
        agente: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    })

    const turnosFormateados = turnos.map((turno) => ({
      id: turno.id,
      propiedadId: turno.propiedadId,
      fechaHoraSolicitada: turno.fechaHoraSolicitada,
      estado: turno.estado,
      estadoComprador: turno.estadoComprador,
      creadoEn: turno.creadoEn,
      tituloPropiedad: turno.propiedad.nombrePropiedad,
      direccion: turno.propiedad.direccion,
      vendedorId: turno.vendedorId,
      agenteNombre: turno.agente?.nombreCompleto ?? null,
      observaciones: turno.observaciones,
    }))

    const turnosPorPropiedad = new Map<string, typeof turnosFormateados[number]>()

    for (const turno of turnosFormateados) {
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
