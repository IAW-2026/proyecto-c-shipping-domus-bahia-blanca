import { prisma } from '@/lib/prisma'

import { NextResponse } from 'next/server'

//Get para obtener los turnos que tienen un estado preaceptado de vendedor
export async function GET(request: Request) {
  try {
    // Verificar API key
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey || apiKey !== process.env.SELLER_APP_API_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const vendedorId = searchParams.get('inmobiliariaId')

    if (!vendedorId) {
      return NextResponse.json(
        { error: 'inmobiliariaId es requerido' },
        { status: 400 }
      )
    }

    const turnos = await prisma.turno.findMany({
      where: {
        vendedorId,
        estado: 'PRE_ACEPTADO',
      },
    })

    return NextResponse.json(turnos)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error obteniendo turnos' },
      { status: 500 }
    )
  }
}