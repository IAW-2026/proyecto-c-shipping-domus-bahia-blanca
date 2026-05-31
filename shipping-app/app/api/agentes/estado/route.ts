import type { EstadoAgente } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const ESTADOS_PERMITIDOS: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO']
const ESTADOS_ALIASES: Record<string, EstadoAgente> = {
  PENDIENTE: 'PENDIENTE',
  PENDIENTES: 'PENDIENTE',
  ACEPTADO: 'ACEPTADO',
  ACEPTADOS: 'ACEPTADO',
}

function parseEstados(request: NextRequest) {
  const estadoParams = request.nextUrl.searchParams
    .getAll('estado')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)

  if (estadoParams.length === 0) return ESTADOS_PERMITIDOS

  const estados = estadoParams.map((estado) => ESTADOS_ALIASES[estado])

  if (estados.some((estado) => !estado)) return null

  return [...new Set(estados)].filter((estado) => ESTADOS_PERMITIDOS.includes(estado))
}

function parseInmobiliariaId(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get('inmobiliariaId') ??
    request.nextUrl.searchParams.get('idInmobiliaria') ??
    request.nextUrl.searchParams.get('idinmobiliaria') ??
    request.nextUrl.searchParams.get('vendedorId')
  )?.trim()
}

export async function GET(request: NextRequest) {
  /*
  const apiKey = process.env.SELLER_CALLBACK_KEY
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey || token !== apiKey) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  */

  const estados = parseEstados(request)
  const inmobiliariaId = parseInmobiliariaId(request)

  if (!estados || estados.length === 0) {
    return NextResponse.json(
      { error: 'Estado invalido. Use PENDIENTE, PENDIENTES, ACEPTADO o ACEPTADOS' },
      { status: 400 }
    )
  }

  if (!inmobiliariaId) {
    return NextResponse.json(
      { error: 'inmobiliariaId es requerido' },
      { status: 400 }
    )
  }

  const agentes = await prisma.agenteInmobiliario.findMany({
    where: {
      vendedorId: inmobiliariaId,
      estado: { in: estados },
    },
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

  return NextResponse.json(agentes)
}
