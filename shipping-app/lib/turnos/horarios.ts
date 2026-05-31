export const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires'

export const TURNOS_TIME_SLOTS = Array.from({ length: 17 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

type ArgentinaDateParts = {
  year: number
  month: number
  day: number
}

function argentinaDateParts(date = new Date()): ArgentinaDateParts {
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

export function argentinaCalendarDate(date = new Date()) {
  const { year, month, day } = argentinaDateParts(date)

  return new Date(Date.UTC(year, month - 1, day, 12))
}

export function argentinaMonthDate(year: number, monthIndex: number, day = 1) {
  return new Date(Date.UTC(year, monthIndex, day, 12))
}

export function argentinaDateKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function argentinaDateKeyFromInstant(date: Date) {
  const { year, month, day } = argentinaDateParts(date)

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function argentinaTimeFromInstant(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: ARGENTINA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function argentinaDayOfWeekFromInstant(date: Date) {
  const key = argentinaDateKeyFromInstant(date)

  return new Date(`${key}T12:00:00Z`).getUTCDay()
}

export function argentinaDateTime(date: Date, time: string) {
  return new Date(`${argentinaDateKey(date)}T${time}:00-03:00`)
}

export function argentinaDateTimeFromDateKey(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00-03:00`)
}
