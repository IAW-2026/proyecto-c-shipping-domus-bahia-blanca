import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'





export async function GET(
  request: Request,
  { params }: { params: { compradorId: string } }
) {
  try {
    const { compradorId } = params

    const turnos = await prisma.turno.findMany({
      where: {
        compradorId,
        estado: 'PENDIENTE_AGENTE',
      },
      orderBy: { creadoEn: 'desc' },
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