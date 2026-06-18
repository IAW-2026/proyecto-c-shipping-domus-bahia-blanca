import type { EstadoAgente } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { requireShippingApiKey } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'

const ESTADOS_ACTUALIZABLES: EstadoAgente[] = ['ACEPTADO', 'RECHAZADO']

function isEstadoAgente(value: unknown): value is EstadoAgente {
  return typeof value === 'string' && ESTADOS_ACTUALIZABLES.includes(value as EstadoAgente)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireShippingApiKey(request)
  if (unauthorized) return unauthorized

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
