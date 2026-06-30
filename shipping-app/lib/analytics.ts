import 'server-only'

import type { EstadoAgente, EstadoTurno, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ARGENTINA_TIME_ZONE, argentinaStartOfDateKey, argentinaTimeFromInstant } from '@/lib/turnos/horarios'

export type HourlyDemandDatum = {
  hour: string
  count: number
}

export type WeekdayDemandDatum = {
  day: string
  count: number
}

export type AgentRankingDatum = {
  agentName: string
  count: number
}

export type AppointmentStatusDatum = {
  status: EstadoTurno
  label: string
  count: number
}

export type TopVisitedPropertyDatum = {
  propertyId: string
  title: string
  address: string | null
  visits: number
}

const ACTIVE_AGENT_STATES: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO']

const ESTADOS_TURNO: EstadoTurno[] = [
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'CANCELADO',
  'COMPLETADO',
]

const ESTADO_LABELS: Record<EstadoTurno, string> = {
  PENDIENTE_AGENTE: 'Pendiente',
  PRE_ACEPTADO: 'Pre aceptado',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  COMPLETADO: 'Completado',
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

function argentinaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARGENTINA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  }
}

function argentinaStartOfMonth(date = new Date()) {
  const { year, month } = argentinaDateParts(date)

  return argentinaStartOfDateKey(`${year}-${String(month).padStart(2, '0')}-01`)
}

function argentinaEndOfMonth(date = new Date()) {
  const nextMonth = new Date(date)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return argentinaStartOfMonth(nextMonth)
}

function argentinaStartOfYear(date = new Date()) {
  const { year } = argentinaDateParts(date)

  return argentinaStartOfDateKey(`${year}-01-01`)
}

function parseHourFromArgentinaTime(value: string) {
  const hour = Number(value.slice(0, 2))
  return Number.isFinite(hour) ? hour : null
}

export async function getAgentCount(): Promise<number> {
  return prisma.agenteInmobiliario.count({
    where: {
      estado: {
        in: ACTIVE_AGENT_STATES,
      },
    },
  })
}

export async function getHourlyDemand(): Promise<HourlyDemandDatum[]> {
  const turnos = await prisma.turno.findMany({
    where: {
      fechaHoraSolicitada: {
        not: null,
      },
    },
    select: {
      fechaHoraSolicitada: true,
    },
  })

  const counts = new Map<number, number>()

  for (const turno of turnos) {
    if (!turno.fechaHoraSolicitada) continue

    const hour = parseHourFromArgentinaTime(argentinaTimeFromInstant(turno.fechaHoraSolicitada))
    if (hour === null) continue

    counts.set(hour, (counts.get(hour) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort(([leftHour], [rightHour]) => leftHour - rightHour)
    .map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      count,
    }))
}

export async function getWeekdayDemand(): Promise<WeekdayDemandDatum[]> {
  const turnos = await prisma.turno.findMany({
    where: {
      fechaHoraSolicitada: {
        not: null,
      },
    },
    select: {
      fechaHoraSolicitada: true,
    },
  })

  const counts = new Map<number, number>()

  for (const turno of turnos) {
    if (!turno.fechaHoraSolicitada) continue

    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: ARGENTINA_TIME_ZONE,
      weekday: 'short',
    }).formatToParts(turno.fechaHoraSolicitada).find((part) => part.type === 'weekday')?.value

    const weekdayIndex = weekday
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday)
      : -1

    if (weekdayIndex < 0) continue

    counts.set(weekdayIndex, (counts.get(weekdayIndex) ?? 0) + 1)
  }

  return [1, 2, 3, 4, 5, 6, 0].map((weekday) => ({
    day: WEEKDAY_LABELS[weekday],
    count: counts.get(weekday) ?? 0,
  }))
}

export async function getLastMonthAppointmentsByStatus(): Promise<AppointmentStatusDatum[]> {
  const now = new Date()
  const lastMonth = new Date(now)
  lastMonth.setMonth(now.getMonth() - 1)

  const counts = new Map<EstadoTurno, number>()

  const turnos = await prisma.turno.findMany({
    where: {
      fechaHoraSolicitada: {
        gte: lastMonth,
        lte: now,
      },
    },
    select: {
      estado: true,
    },
  })

  for (const turno of turnos) {
    counts.set(turno.estado, (counts.get(turno.estado) ?? 0) + 1)
  }

  return ESTADOS_TURNO.map((status) => ({
    status,
    label: ESTADO_LABELS[status],
    count: counts.get(status) ?? 0,
  }))
}

export async function getTopVisitedProperties(): Promise<TopVisitedPropertyDatum[]> {
  const grouped = await prisma.turno.groupBy({
    by: ['propiedadId'],
    where: {
      fechaHoraSolicitada: {
        not: null,
      },
    },
    _count: {
      propiedadId: true,
    },
    orderBy: {
      _count: {
        propiedadId: 'desc',
      },
    },
    take: 5,
  })

  const propertyIds = grouped.map((item) => item.propiedadId)
  const properties = await prisma.propiedad.findMany({
    where: {
      id: {
        in: propertyIds,
      },
    },
    select: {
      id: true,
      nombrePropiedad: true,
      direccion: true,
    },
  })

  const propertyMap = new Map(
    properties.map((property) => [property.id, property])
  )

  return grouped.map((item) => {
    const property = propertyMap.get(item.propiedadId)

    return {
      propertyId: item.propiedadId,
      title: property?.nombrePropiedad ?? item.propiedadId,
      address: property?.direccion ?? null,
      visits: item._count.propiedadId,
    }
  })
}

function getTopCompletedVisitsByAgent(
  turnos: Array<{ agenteId: string | null; fechaHoraSolicitada: Date | null }>,
  agentNames: Map<string, string>,
  period: 'month' | 'year',
): AgentRankingDatum[] {
  const now = new Date()
  const counts = new Map<string, number>()

  for (const turno of turnos) {
    if (!turno.agenteId || !turno.fechaHoraSolicitada) continue

    const sameYear = turno.fechaHoraSolicitada.getFullYear() === now.getFullYear()
    const sameMonth = turno.fechaHoraSolicitada.getMonth() === now.getMonth()

    if (!sameYear || (period === 'month' && !sameMonth)) continue

    counts.set(turno.agenteId, (counts.get(turno.agenteId) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([agentId, count]) => ({
      agentName: agentNames.get(agentId) ?? 'Agente sin asignar',
      count,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
}

export async function getCompletedVisitsRanking() {
  const [turnos, agentes] = await Promise.all([
    prisma.turno.findMany({
      where: {
        estado: 'COMPLETADO',
        fechaHoraSolicitada: {
          not: null,
        },
      },
      select: {
        agenteId: true,
        fechaHoraSolicitada: true,
      },
    }),
    prisma.agenteInmobiliario.findMany({
      where: {
        estado: {
          in: ACTIVE_AGENT_STATES,
        },
      },
      select: {
        id: true,
        nombreCompleto: true,
      },
    }),
  ])

  const agentNames = new Map(agentes.map((agente) => [agente.id, agente.nombreCompleto]))

  return {
    month: getTopCompletedVisitsByAgent(turnos, agentNames, 'month'),
    year: getTopCompletedVisitsByAgent(turnos, agentNames, 'year'),
  }
}
