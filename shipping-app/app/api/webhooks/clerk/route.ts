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
    email_addresses: Array<{ email_address: string; id: string }>
    primary_email_address_id?: string
    public_metadata?: {
      roles?: string[]
    }
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET no configurado.')
    return NextResponse.json({ error: 'Misconfigured server' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.text()
  const wh = new Webhook(webhookSecret)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'user.created' && event.type !== 'user.updated') {
    return NextResponse.json({ received: true })
  }

  const { id, first_name, last_name, email_addresses, primary_email_address_id } = event.data

  const primaryEmail =
    email_addresses.find((e) => e.id === primary_email_address_id)?.email_address ??
    email_addresses[0]?.email_address

  if (!primaryEmail) {
    console.warn(`Usuario ${id} sin email primario — omitido.`)
    return NextResponse.json({ received: true })
  }

  const nombreCompleto = [first_name, last_name].filter(Boolean).join(' ') || 'Sin nombre'

  if (event.type === 'user.created') {
    const client = await clerkClient()

    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        roles: ['agente'],
      },
    })

    await prisma.agenteInmobiliario.create({
      data: {
        clerkUserId: id,
        nombreCompleto,
        nombreInmobiliaria: '',
        email: primaryEmail,
        telefono: '',
        vendedorId: '',
        estado: 'COMPLETAR',
      },
    })

    console.log(`✅ Agente creado: ${nombreCompleto} (${id})`)
  }

  if (event.type === 'user.updated') {
    await prisma.agenteInmobiliario.update({
      where: { clerkUserId: id },
      data: {
        email: primaryEmail,
        nombreCompleto,
      },
    })

    console.log(`✅ Agente actualizado: ${nombreCompleto} (${id})`)
  }

  return NextResponse.json({ received: true })
}