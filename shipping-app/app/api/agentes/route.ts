import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const agentes = await prisma.agenteInmobiliario.findMany()

    return NextResponse.json(agentes)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error obteniendo agentes' },
      { status: 500 }
    )
  }
}