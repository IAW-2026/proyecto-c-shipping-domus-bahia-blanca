import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const agente = await prisma.agenteInmobiliario.findUnique({
    where: { clerkUserId: userId },
    select: { estado: true },
  })

  return NextResponse.json({ estado: agente?.estado ?? 'COMPLETAR' })
}
