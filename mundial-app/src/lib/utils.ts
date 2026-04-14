import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date))    return `Hoy ${format(date, 'HH:mm')}`
  if (isTomorrow(date)) return `Mañana ${format(date, 'HH:mm')}`
  return format(date, "d MMM HH:mm", { locale: es })
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
