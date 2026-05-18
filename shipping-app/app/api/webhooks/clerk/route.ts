import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

type ClerkWebhookEvent = {
  type: 'user.created' | 'user.updated'
  data: {
    id: string
    first_name?: string | null
    last_name?: string | null
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    primary_email_address_id?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET no configurado.')
      return NextResponse.json({ error: 'Misconfigured server' }, { status: 500 })
    }

    const headerPayload = await headers()
    const svixId = headerPayload.get('svix-id')
    const svixTimestamp = headerPayload.get('svix-timestamp')
    const svixSignature = headerPayload.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    const payload = await req.text()
    const wh = new Webhook(webhookSecret)

    let event: ClerkWebhookEvent

    try {
      event = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type !== 'user.created' && event.type !== 'user.updated') {
      return NextResponse.json({ received: true })
    }

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      primary_email_address_id,
    } = event.data

    const primaryEmail =
      email_addresses.find((email) => email.id === primary_email_address_id)
        ?.email_address ?? email_addresses[0]?.email_address

    if (!primaryEmail) {
      console.warn(`Usuario ${id} sin email primario.`)
      return NextResponse.json({ received: true })
    }

    const nombreCompleto =
      [first_name, last_name].filter(Boolean).join(' ') || 'Sin nombre'

    // Prisma en su propio try/catch
    try {
      const existentePorEmail = await prisma.agenteInmobiliario.findUnique({
        where: { email: primaryEmail },
        select: { clerkUserId: true },
      })

      //Si ya existe un agente con el mismo email, se actualiza ese registro y se vincula al clerkUserId nuevo,
      //si no, se hace el upsert normal.
      //Esto evita el P2002 por email duplicado.
      if (existentePorEmail && existentePorEmail.clerkUserId !== id) {
        await prisma.agenteInmobiliario.update({
          where: { email: primaryEmail },
          data: { clerkUserId: id, nombreCompleto },
        })
      } else {
        await prisma.agenteInmobiliario.upsert({
          where: { clerkUserId: id },
          update: { email: primaryEmail, nombreCompleto },
          create: {
            clerkUserId: id,
            nombreCompleto,
            nombreInmobiliaria: '',
            email: primaryEmail,
            telefono: '',
            vendedorId: '',
            estado: 'COMPLETAR',
          },
        })
      }
      console.log(`✅ Usuario sincronizado: ${nombreCompleto} (${id})`)
    } catch (err) {
      console.error(`❌ Falló upsert Prisma para ${id}:`, err)
      return NextResponse.json({ received: true, prismaError: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('WEBHOOK ERROR:', error)
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 })
  }
}