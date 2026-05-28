import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const ESTADOS_PERMITIDOS = ['PENDIENTE', 'ACEPTADO'] as const

export async function GET(request: NextRequest) {
  const apiKey = process.env.SELLER_CALLBACK_KEY
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey || token !== apiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const estadoParam = request.nextUrl.searchParams.get('estado')?.toUpperCase() ?? 'PENDIENTE'

  if (!ESTADOS_PERMITIDOS.includes(estadoParam as (typeof ESTADOS_PERMITIDOS)[number])) {
    return NextResponse.json(
      { error: 'Estado invalido. Use PENDIENTE o ACEPTADO' },
      { status: 400 }
    )
  }

  const agentes = await prisma.agenteInmobiliario.findMany({
    where: { estado: estadoParam as (typeof ESTADOS_PERMITIDOS)[number] },
    select: {
      id: true,
      nombreCompleto: true,
      nombreInmobiliaria: true,
      email: true,
      telefono: true,
      vendedorId: true,
      estado: true,
    },
    orderBy: { nombreCompleto: 'asc' },
  })

  return NextResponse.json( agentes )
}
