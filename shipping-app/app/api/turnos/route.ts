import { prisma } from '@/lib/prisma'
import { turnoCreateSchema } from '@/lib/validation/turno'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

const estadoValues = [
	'PENDIENTE_AGENTE',
	'PRE_ACEPTADO',
	'RECHAZADO_VENDEDOR',
	'CONFIRMADO',
	'CANCELADO',
	'COMPLETADO',
] as const

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const estado = searchParams.get('estado')

		if (estado && !estadoValues.includes(estado as (typeof estadoValues)[number])) {
			return NextResponse.json(
				{ error: 'Estado invalido' },
				{ status: 400 }
			)
		}

		const turnos = await prisma.turno.findMany({
			where: estado ? { estado: estado as (typeof estadoValues)[number] } : undefined,
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

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const data = turnoCreateSchema.parse(body)

		const turno = await prisma.turno.create({
			data: {
				...data,
				estado: 'PENDIENTE_AGENTE',
			},
		})

		return NextResponse.json(turno, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: 'Datos invalidos', details: error.flatten() },
				{ status: 400 }
			)
		}

		console.error(error)

		return NextResponse.json(
			{ error: 'Error creando turno' },
			{ status: 500 }
		)
	}
}
