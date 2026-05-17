import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const apiKey = process.env.SELLER_CALLBACK_KEY
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey || token !== apiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const agentes = await prisma.agenteInmobiliario.findMany({
    where: { estado: 'PENDIENTE' },
    select: {
      clerkUserId: true,
      nombreCompleto: true,
      nombreInmobiliaria: true,
      email: true,
      telefono: true,
      vendedorId: true,
      estado: true,
    },
    orderBy: { nombreCompleto: 'asc' },
  })

  return NextResponse.json({ agentes })
}
