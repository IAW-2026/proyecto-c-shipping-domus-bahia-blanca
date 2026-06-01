'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { EstadoTurno, EstadoTurnoComprador } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import {
  argentinaDayOfWeekFromInstant,
  argentinaDateTimeFromDateKey,
  argentinaTimeFromInstant,
  TURNOS_TIME_SLOTS,
} from '@/lib/turnos/horarios'

const ACTIVE_TURNO_STATES: EstadoTurno[] = ['PENDIENTE_AGENTE', 'PRE_ACEPTADO', 'CONFIRMADO']
const ESTADOS_TURNO: EstadoTurno[] = [
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]
const ESTADOS_COMPRADOR: EstadoTurnoComprador[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]
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

function estadoTurnoValue(formData: FormData) {
  const value = stringValue(formData, 'estado') as EstadoTurno

  if (!ESTADOS_TURNO.includes(value)) {
    throw new Error('Estado de turno invalido')
  }

  return value
}

function estadoCompradorValue(formData: FormData) {
  const value = stringValue(formData, 'estadoComprador') as EstadoTurnoComprador

  if (!ESTADOS_COMPRADOR.includes(value)) {
    throw new Error('Estado de comprador invalido')
  }

  return value
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

export async function crearTurno({
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
  fechaHora,
  observaciones,
}: {
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
  fechaHora: Date
  observaciones?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

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

  const propiedadId = stringValue(formData, 'propiedadId')
  const fechaHoraSolicitada = fechaHoraSolicitadaValue(formData)
  const estado = estadoTurnoValue(formData)

  const horarioOcupado = await propiedadHorarioOcupado({
    propiedadId,
    fechaHoraSolicitada,
  })

  if (horarioOcupado) {
    redirect(adminTurnosRedirectUrl(formData, { error: 'turno-duplicado' }))
  }

  await prisma.turno.create({
    data: {
      propiedadId,
      compradorId: stringValue(formData, 'compradorId'),
      vendedorId: stringValue(formData, 'vendedorId'),
      nombreComprador: nullableString(formData, 'nombreComprador'),
      agenteId: nullableString(formData, 'agenteId'),
      fechaHoraSolicitada,
      estado,
      estadoComprador: estadoCompradorValue(formData),
      observaciones: nullableString(formData, 'observaciones'),
    },
  })

  revalidateTurnosAdmin()
  redirect(adminTurnosRedirectUrl(formData, { success: 'turno-creado' }))
}

export async function actualizarTurnoAdmin(formData: FormData) {
  await requireAdmin()

  const id = stringValue(formData, 'id')
  const propiedadId = stringValue(formData, 'propiedadId')
  const fechaHoraSolicitada = fechaHoraSolicitadaValue(formData)
  const estado = estadoTurnoValue(formData)

  const horarioOcupado = await propiedadHorarioOcupado({
    propiedadId,
    fechaHoraSolicitada,
    excludeTurnoId: id,
  })

  if (horarioOcupado) {
    redirect(adminTurnosRedirectUrl(formData, { error: 'turno-duplicado' }))
  }

  await prisma.turno.update({
    where: { id },
    data: {
      propiedadId,
      compradorId: stringValue(formData, 'compradorId'),
      vendedorId: stringValue(formData, 'vendedorId'),
      nombreComprador: nullableString(formData, 'nombreComprador'),
      agenteId: nullableString(formData, 'agenteId'),
      fechaHoraSolicitada,
      estado,
      estadoComprador: estadoCompradorValue(formData),
      observaciones: nullableString(formData, 'observaciones'),
    },
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
