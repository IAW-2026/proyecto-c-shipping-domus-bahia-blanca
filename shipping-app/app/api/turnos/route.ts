import { prisma } from '@/lib/prisma'
import { turnoCreateSchema } from '@/lib/validation/turno'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'


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
