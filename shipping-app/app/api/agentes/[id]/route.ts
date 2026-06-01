import type { EstadoAgente } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const ESTADOS_ACTUALIZABLES: EstadoAgente[] = ['ACEPTADO', 'RECHAZADO']

function isEstadoAgente(value: unknown): value is EstadoAgente {
  return typeof value === 'string' && ESTADOS_ACTUALIZABLES.includes(value as EstadoAgente)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  /*
  const apiKey = process.env.SELLER_CALLBACK_KEY
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey || token !== apiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  */

  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { estado?: unknown } | null
  const estado = body?.estado

  if (!isEstadoAgente(estado)) {
    return NextResponse.json(
      { error: 'estado invalido. Use ACEPTADO o RECHAZADO' },
      { status: 400 }
    )
  }

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!agente) {
    return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
  }

  const updated = await prisma.agenteInmobiliario.update({
    where: { id },
    data: { estado },
    select: {
      id: true,
      estado: true,
    },
  })

  return NextResponse.json(updated)
}
