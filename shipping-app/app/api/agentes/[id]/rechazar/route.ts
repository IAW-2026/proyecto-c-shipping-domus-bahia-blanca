import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.SELLER_CALLBACK_KEY
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const { id } = await params
  
  if (!apiKey || token !== apiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { id: params.id },
    select: { id: true },
  })

  if (!agente) {
    return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
  }

  await prisma.agenteInmobiliario.update({
    where: { id: params.id },
    data: { estado: 'RECHAZADO' },
  })

  return NextResponse.json({ ok: true })
}