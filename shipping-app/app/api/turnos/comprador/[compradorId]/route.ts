import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'


//Endpoint para obtener todos los turnos relacionados a un comprador, en su estado actual
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ compradorId: string }> }
) {
  try {
    const { compradorId } = await context.params

    const turnos = await prisma.turno.findMany({
      where: {
        compradorId,
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