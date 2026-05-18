import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { agentePerfilSchema } from '@/lib/validation/agente'
import { getInmobiliarias } from '@/lib/agente/inmobiliarias'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = agentePerfilSchema.parse(body)
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses?.[0]?.emailAddress

    if (!email) {
      return NextResponse.json(
        { error: 'Email no disponible' },
        { status: 400 }
      )
    }

    const inmobiliarias = await getInmobiliarias()
    const selected = inmobiliarias.find(
      (item) => item.id === data.vendedorId
    )

    if (!selected) {
      return NextResponse.json(
        { error: 'Inmobiliaria invalida' },
        { status: 400 }
      )
    }

    const agente = await prisma.agenteInmobiliario.upsert({
      where: { clerkUserId: userId },
      update: {
        nombreCompleto: data.nombreCompleto,
        nombreInmobiliaria: selected.nombre,
        email,
        telefono: data.telefono,
        vendedorId: selected.id,
        estado: 'PENDIENTE',
      },
      create: {
        clerkUserId: userId,
        nombreCompleto: data.nombreCompleto,
        nombreInmobiliaria: selected.nombre,
        email,
        telefono: data.telefono,
        vendedorId: selected.id,
        estado: 'PENDIENTE',
      },
    })

    const rolesActuales = (user.publicMetadata?.roles as string[]) ?? []
    const roles = Array.from(new Set([...rolesActuales, 'agente']))

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        roles,
        Inmobiliaria: selected.nombre,
      },
    })

    return NextResponse.json({ ok: true, agente })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: 'Error procesando perfil' },
      { status: 500 }
    )
  }
}
