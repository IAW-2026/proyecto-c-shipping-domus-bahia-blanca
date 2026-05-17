import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

//Formato de como me tiene que mandar la info clerk
type ClerkWebhookEvent = {
	type: string
	data: {
		id: string
		email_addresses?: { email_address: string }[]
		first_name?: string 
		last_name?: string 
	}
}

function getNombreCompleto(data: ClerkWebhookEvent['data']) {
	const first = data.first_name ?? ''
	const last = data.last_name ?? ''
	const full = `${first} ${last}`.trim()
	return full.length > 0 ? full : 'Sin nombre'
}


export async function POST(request: Request) {
	const secret = process.env.CLERK_WEBHOOK_SECRET
	if (!secret) {
		return NextResponse.json(
			{ error: 'Missing CLERK_WEBHOOK_SECRET' },
			{ status: 500 }
		)
	}
	const payload = await request.text()
	const headerList = await headers()
	const svixId = headerList.get('svix-id')
	const svixTimestamp = headerList.get('svix-timestamp')
	const svixSignature = headerList.get('svix-signature')

	if (!svixId || !svixTimestamp || !svixSignature) {
		return NextResponse.json(
			{ error: 'Missing webhook headers' },
			{ status: 400 }
		)
	}

	let event: ClerkWebhookEvent

	try {
		const webhook = new Webhook(secret)
		event = webhook.verify(payload, {
			'svix-id': svixId,
			'svix-timestamp': svixTimestamp,
			'svix-signature': svixSignature,
		}) as ClerkWebhookEvent
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
	}
    
	if (event.type === 'user.created' || event.type === 'user.updated') {
		const email = event.data.email_addresses?.[0]?.email_address
		if (!email) {
			return NextResponse.json({ error: 'Missing email' }, { status: 400 })
		}

		const nombreCompleto = getNombreCompleto(event.data)

		await prisma.agenteInmobiliario.upsert({
			where: { clerkUserId: event.data.id },
			update: {
				email,
				nombreCompleto,
			},
			create: {
				clerkUserId: event.data.id,
				nombreCompleto,
				nombreInmobiliaria: null,
				email,
				telefono: '',
				vendedorId: '',
				estado: 'COMPLETAR',
			},
		})

		if (event.type === 'user.created') {
			const client = await clerkClient()
			await client.users.updateUserMetadata(event.data.id, {
				publicMetadata: {
					roles: ['agente'],
				},
			})
		}
	}

	return NextResponse.json({ ok: true })
}
