'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { EstadoTurno } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import {
  argentinaDayOfWeekFromInstant,
  argentinaDateTimeFromDateKey,
  argentinaTimeFromInstant,
  TURNOS_TIME_SLOTS,
} from '@/lib/turnos/horarios'
import { turnoAdminSchema, turnoCreateSchema } from '@/lib/validation/turno'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']
const ADMIN_TURNOS_PATH = '/admin/entidades/turnos'

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === 'string' ? value.trim() : ''
}

function nullableString(formData: FormData, key: string) {
  const value = stringValue(formData, key)

  return value === '' ? null : value
}

function nullableDate(formData: FormData, key: string) {
  const value = stringValue(formData, key)

  return value === '' ? null : new Date(value)
}

function fechaHoraSolicitadaValue(formData: FormData) {
  const fecha = stringValue(formData, 'fechaSolicitada')
  const hora = stringValue(formData, 'horaSolicitada')

  if (!fecha && !hora) return nullableDate(formData, 'fechaHoraSolicitada')
  if (!fecha || !hora) throw new Error('Fecha y horario son requeridos')

  if (!TURNOS_TIME_SLOTS.includes(hora)) {
    throw new Error('El horario esta fuera del rango disponible')
  }

  return argentinaDateTimeFromDateKey(fecha, hora)
}

function revalidateTurnosAdmin() {
  revalidatePath('/admin/entidades')
  revalidatePath('/admin/entidades/turnos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/turnos')
}

function adminTurnosRedirectUrl(formData: FormData, params: Record<string, string>) {
  const returnTo = stringValue(formData, 'returnTo')
  const base = returnTo.startsWith(ADMIN_TURNOS_PATH) ? returnTo : ADMIN_TURNOS_PATH
  const url = new URL(base, 'http://localhost')

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  return `${url.pathname}${url.search}`
}

function turnoAdminData(formData: FormData) {
  const parsed = turnoAdminSchema.safeParse({
    propiedadId: stringValue(formData, 'propiedadId'),
    compradorId: stringValue(formData, 'compradorId'),
    vendedorId: stringValue(formData, 'vendedorId'),
    nombreComprador: nullableString(formData, 'nombreComprador'),
    agenteId: nullableString(formData, 'agenteId'),
    fechaHoraSolicitada: fechaHoraSolicitadaValue(formData),
    estado: stringValue(formData, 'estado'),
    estadoComprador: stringValue(formData, 'estadoComprador'),
    observaciones: nullableString(formData, 'observaciones'),
  })

  if (!parsed.success) {
    redirect(adminTurnosRedirectUrl(formData, { error: 'datos-invalidos' }))
  }

  return parsed.data
}

async function propiedadHorarioOcupado({
  propiedadId,
  fechaHoraSolicitada,
  excludeTurnoId,
}: {
  propiedadId: string
  fechaHoraSolicitada: Date | null
  excludeTurnoId?: string
}) {
  if (!fechaHoraSolicitada) return false

  const turnoExistente = await prisma.turno.findFirst({
    where: {
      propiedadId,
      fechaHoraSolicitada,
      ...(excludeTurnoId ? { id: { not: excludeTurnoId } } : {}),
    },
    select: {
      id: true,
    },
  })

  return Boolean(turnoExistente)
}

export async function tomarTurno(turnoId: string) {
  const { userId } = await auth()

  if (!userId) throw new Error('No autorizado')

  const [turno, agente] = await Promise.all([
    prisma.turno.findUnique({
      where: { id: turnoId },
      select: { estado: true, vendedorId: true },
    }),
    prisma.agenteInmobiliario.findUnique({
      where: { id: userId },
      select: { vendedorId: true },
    }),
  ])

  if (!turno) throw new Error('Turno no encontrado')
  if (!agente?.vendedorId || agente.vendedorId !== turno.vendedorId) {
    throw new Error('No autorizado')
  }
  if (turno.estado !== 'PENDIENTE_AGENTE') throw new Error('El turno no puede ser aceptado')

  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: 'PRE_ACEPTADO',
      agenteId: userId,
    },
  })

  revalidatePath('/dashboard/turnos')
}

export async function cancelarTurno(turnoId: string) {
  const { userId } = await auth()

  if (!userId) throw new Error('No autorizado')

  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: { agenteId: true, estado: true },
  })

  if (!turno) throw new Error('Turno no encontrado')
  if (turno.agenteId !== userId) throw new Error('No autorizado')
  if (turno.estado === 'PENDIENTE_AGENTE') throw new Error('El turno ya está pendiente')
  if (turno.estado === 'COMPLETADO') throw new Error('No se puede cancelar un turno completado')

  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: 'PENDIENTE_AGENTE',
      agenteId: null,
    },
  })

  revalidatePath(`/dashboard/turnos/${turnoId}`)
}

export async function completarTurno(turnoId: string) {
  const { userId } = await auth()

  if (!userId) throw new Error('No autorizado')

  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: {
      agenteId: true,
      estado: true,
      fechaHoraSolicitada: true,
    },
  })

  if (!turno) throw new Error('Turno no encontrado')
  if (turno.agenteId !== userId) throw new Error('No autorizado')
  if (turno.estado !== 'CONFIRMADO') throw new Error('Solo se pueden completar turnos confirmados')
  if (!turno.fechaHoraSolicitada) throw new Error('El turno no tiene fecha asignada')
  if (turno.fechaHoraSolicitada > new Date()) {
    throw new Error('El turno todavia no se realizo')
  }

  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: 'COMPLETADO',
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/completados')
  revalidatePath(`/dashboard/turnos/${turnoId}`)
}

type CrearTurnoInput = {
  propiedadId: string
  nombrePropiedad?: string | null
  descripcion?: string | null
  direccion?: string | null
  barrio?: string | null
  ciudad?: string | null
  provincia?: string | null
  pais?: string | null
  codigoPostal?: string | null
  latitud?: number | null
  longitud?: number | null
  precio?: string | number | null
  expensas?: string | number | null
  moneda?: string
  ambientes?: number | null
  dormitorios?: number | null
  banios?: number | null
  metrosTotales?: number | null
  metrosCubiertos?: number | null
  antiguedad?: string | null
  condicion?: string | null
  vendedorId: string
  nombreInmobiliaria?: string | null
  multimedia?: {
    id: string
    url: string
    alt?: string | null
    order?: number | null
  }[]
  nombreComprador?: string
  fechaHora?: Date
  fechaSolicitada?: string
  horaSolicitada?: string
  observaciones?: string
}

export async function crearTurno(input: CrearTurnoInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const {
    propiedadId,
    nombrePropiedad,
    descripcion,
    direccion,
    barrio,
    ciudad,
    provincia,
    pais,
    codigoPostal,
    latitud,
    longitud,
    precio,
    expensas,
    moneda,
    ambientes,
    dormitorios,
    banios,
    metrosTotales,
    metrosCubiertos,
    antiguedad,
    condicion,
    vendedorId,
    nombreInmobiliaria,
    multimedia,
    nombreComprador,
    fechaHora: fechaHoraInput,
    fechaSolicitada,
    horaSolicitada,
    observaciones,
  } = turnoCreateSchema.parse(input)
  const fechaHora = fechaSolicitada && horaSolicitada
    ? argentinaDateTimeFromDateKey(fechaSolicitada, horaSolicitada)
    : fechaHoraInput

  if (!fechaHora) {
    throw new Error('Fecha y horario son requeridos')
  }

  const horaArgentina = argentinaTimeFromInstant(fechaHora)

  if (!TURNOS_TIME_SLOTS.includes(horaArgentina)) {
    throw new Error('El horario esta fuera del rango disponible')
  }

  if (argentinaDayOfWeekFromInstant(fechaHora) === 0) {
    throw new Error('No se pueden reservar turnos los domingos')
  }

  if (fechaHora <= new Date()) {
    throw new Error('No se pueden reservar turnos en el pasado')
  }

  const turnoExistenteComprador = await prisma.turno.findFirst({
    where: {
      compradorId: userId,
      propiedadId,
      estado: {
        in: ACTIVE_TURNO_STATES,
      },
    },
    select: {
      id: true,
    },
  })

  if (turnoExistenteComprador) {
    throw new Error('Ya tenes una reserva activa para esta propiedad')
  }

  const turnoExistenteHorario = await prisma.turno.findFirst({
    where: {
      propiedadId,
      fechaHoraSolicitada: fechaHora,
      estado: {
        in: ACTIVE_TURNO_STATES,
      },
    },
    select: {
      id: true,
    },
  })

  if (turnoExistenteHorario) {
    throw new Error('Ese horario ya no esta disponible')
  }


  const propiedadData = {
    nombrePropiedad,
    descripcion,
    direccion,
    barrio,
    ciudad,
    provincia,
    pais,
    codigoPostal,
    latitud,
    longitud,
    precio,
    expensas,
    moneda,
    ambientes,
    dormitorios,
    banios,
    metrosTotales,
    metrosCubiertos,
    antiguedad,
    condicion,
    vendedorId,
    nombreInmobiliaria,
  }
  const multimediaData = (multimedia ?? []).map((item, index) => ({
    id: item.id,
    url: item.url,
    alt: item.alt,
    orden: item.order ?? index,
  }))

  const propiedad = await prisma.propiedad.upsert({
    where: { id: propiedadId },
    update: {
      ...propiedadData,
      multimedia: {
        deleteMany: {},
        create: multimediaData,
      },
    },
    create: {
      id: propiedadId,
      ...propiedadData,
      multimedia: {
        create: multimediaData,
      },
    },
    select: {
      vendedorId: true,
    },
  })

  const turno = await prisma.turno.create({
    data: {
      compradorId: userId,
      vendedorId: propiedad.vendedorId,
      nombreComprador,
      fechaHoraSolicitada: fechaHora,
      observaciones,
      estado: 'PENDIENTE_AGENTE',
      propiedadId,
    },
    select: {
      id: true,
    },
  })

  revalidatePath('/dashboard/turnos')
  revalidatePath('/turnos')

  return turno
}

export async function crearTurnoAdmin(formData: FormData) {
  await requireAdmin()

  const data = turnoAdminData(formData)

  const horarioOcupado = await propiedadHorarioOcupado({
    propiedadId: data.propiedadId,
    fechaHoraSolicitada: data.fechaHoraSolicitada,
  })

  if (horarioOcupado) {
    redirect(adminTurnosRedirectUrl(formData, { error: 'turno-duplicado' }))
  }

  await prisma.turno.create({
    data,
  })

  revalidateTurnosAdmin()
  redirect(adminTurnosRedirectUrl(formData, { success: 'turno-creado' }))
}

export async function actualizarTurnoAdmin(formData: FormData) {
  await requireAdmin()

  const id = stringValue(formData, 'id')
  const data = turnoAdminData(formData)

  const horarioOcupado = await propiedadHorarioOcupado({
    propiedadId: data.propiedadId,
    fechaHoraSolicitada: data.fechaHoraSolicitada,
    excludeTurnoId: id,
  })

  if (horarioOcupado) {
    redirect(adminTurnosRedirectUrl(formData, { error: 'turno-duplicado' }))
  }

  await prisma.turno.update({
    where: { id },
    data,
  })

  revalidateTurnosAdmin()
  revalidatePath(`/dashboard/turnos/${id}`)
  redirect(adminTurnosRedirectUrl(formData, { success: 'turno-actualizado' }))
}

export async function eliminarTurnoAdmin(formData: FormData) {
  await requireAdmin()

  const id = stringValue(formData, 'id')

  await prisma.turno.delete({ where: { id } })

  revalidateTurnosAdmin()
}
