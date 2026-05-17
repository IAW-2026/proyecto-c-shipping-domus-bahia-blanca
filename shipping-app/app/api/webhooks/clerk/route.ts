import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

type ClerkWebhookEvent = {
  type: string
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

function verifyWebhook(payload: string, headers: Record<string, string>, secret: string): ClerkWebhookEvent {
  const wh = new Webhook(secret)
  return wh.verify(payload, headers) as ClerkWebhookEvent
}

function getPrimaryEmail(data: ClerkWebhookEvent['data']): string | null {
  return (
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)?.email_address ??
    data.email_addresses[0]?.email_address ??
    null
  )
}

function getNombreCompleto(data: ClerkWebhookEvent['data']): string {
  return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Sin nombre'
}

async function handleUserCreated(data: ClerkWebhookEvent['data']) {
  const email = getPrimaryEmail(data)
  if (!email) {
    console.warn(`user.created: Usuario ${data.id} sin email primario, omitido.`)
    return
  }

  const nombreCompleto = getNombreCompleto(data)

  // 1. Asignar rol agente en Clerk
  const client = await clerkClient()
  await client.users.updateUserMetadata(data.id, {
    publicMetadata: {
      roles: ['agente'],
    },
  })

  // 2. Crear agente en DB
  await prisma.agenteInmobiliario.create({
    data: {
      clerkUserId: data.id,
      nombreCompleto,
      nombreInmobiliaria: '',
      email,
      telefono: '',
      vendedorId: '',
      estado: 'COMPLETAR',
    },
  })

  console.log(`✅ Agente creado: ${nombreCompleto} (${data.id})`)
}

async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
  const email = getPrimaryEmail(data)
  if (!email) {
    console.warn(`user.updated: Usuario ${data.id} sin email primario, omitido.`)
    return
  }

  const nombreCompleto = getNombreCompleto(data)

  await prisma.agenteInmobiliario.update({
    where: { clerkUserId: data.id },
    data: { email, nombreCompleto },
  })

  console.log(`✅ Agente actualizado: ${nombreCompleto} (${data.id})`)
}

export async function POST(req: NextRequest) {
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

  let event: ClerkWebhookEvent
  try {
    event = verifyWebhook(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'user.created') {
      await handleUserCreated(event.data)
    } else if (event.type === 'user.updated') {
      await handleUserUpdated(event.data)
    }
  } catch (error) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}