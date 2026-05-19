import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

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

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('WEBHOOK ERROR:', error)
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 })
  }
}