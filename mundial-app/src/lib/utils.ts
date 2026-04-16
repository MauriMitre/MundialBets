import { isPast } from 'date-fns'

const TZ = 'America/Argentina/Buenos_Aires'

function argParts(date: Date) {
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
    day: parseInt(get('day')),
    month: new Intl.DateTimeFormat('es-AR', { timeZone: TZ, month: 'short' }).format(date),
  }
}

export function formatMatchDate(dateStr: string): string {
  const date     = new Date(dateStr)
  const now      = new Date()
  const tomorrow = new Date(now.getTime() + 86400000)

  const match    = argParts(date)
  const today    = argParts(now)
  const tom      = argParts(tomorrow)

  if (match.dateKey === today.dateKey)   return `Hoy ${match.time}`
  if (match.dateKey === tom.dateKey)     return `Mañana ${match.time}`
  return `${match.day} ${match.month} ${match.time}`
}

/** Convierte un valor de input datetime-local (ingresado en hora Argentina) a ISO UTC */
export function argentinaInputToUTC(dtLocal: string): string {
  return new Date(`${dtLocal}-03:00`).toISOString()
}

/** Convierte una fecha ISO UTC al formato que espera un input datetime-local, en hora Argentina */
export function toDatetimeLocalArg(iso: string): string {
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export function isBettingOpen(closesAt: string | null): boolean {
  if (!closesAt) return false
  return !isPast(new Date(closesAt))
}

export function formatRelativeTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'Cerrado'
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0)    return `Cierra en ${days}d ${hours % 24}h`
  if (hours > 0)   return `Cierra en ${hours}h ${minutes % 60}m`
  return `Cierra en ${minutes}m`
}
