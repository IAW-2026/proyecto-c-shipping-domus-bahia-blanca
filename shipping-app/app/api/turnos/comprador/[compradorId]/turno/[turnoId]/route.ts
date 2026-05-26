import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ compradorId: string; turnoId: string }> }
) {
  try {
    const { compradorId, turnoId } = await context.params

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      select: { compradorId: true },
    })

    if (!turno) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    if (turno.compradorId !== compradorId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: 'CANCELADO' },
    })

    return NextResponse.json({ message: 'Turno cancelado correctamente' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error cancelando turno' },
      { status: 500 }
    )
  }
}