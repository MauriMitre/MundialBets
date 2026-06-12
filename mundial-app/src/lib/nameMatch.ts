// Matching difuso de nombres de jugadores: los eventos de API-Football
// vienen con nombres abreviados ("R. Jiménez") o romanizaciones que no
// coinciden exactas con los nombres oficiales sincronizados en la BD.

const TRANSLIT: Record<string, string> = {
  'ı': 'i', 'ø': 'o', 'Ø': 'o', 'đ': 'd', 'Đ': 'd', 'ß': 'ss',
  'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'ł': 'l', 'Ł': 'l', 'ð': 'd', 'þ': 'th',
}

export function normName(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[ıøØđĐßæÆœłŁðþ]/g, c => TRANSLIT[c] ?? c)
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

export interface NamedRow {
  id: string
  name: string
}

/**
 * Busca un jugador por nombre dentro de los candidatos (el plantel del
 * equipo del evento). Pasadas de estricta a laxa; solo devuelve match
 * si es inequívoco dentro de la pasada.
 */
export function matchPlayerName<T extends NamedRow>(apiName: string, candidates: T[]): T | null {
  const target = normName(apiName)
  if (!target) return null
  const targetTokens = target.split(' ')

  const passes: ((cn: string) => boolean)[] = [
    // exacto
    cn => cn === target,
    // tokens contenidos en cualquier dirección ("Jiménez" ⊆ "Raúl Jiménez")
    cn => {
      const cT = cn.split(' ')
      return targetTokens.every(t => cT.includes(t)) || cT.every(t => targetTokens.includes(t))
    },
    // inicial + apellido ("r jimenez" → inicial "r", resto "jimenez")
    cn => {
      if (targetTokens.length < 2 || targetTokens[0].length > 1) return false
      const [initial, ...rest] = targetTokens
      const cT = cn.split(' ')
      return cT[0]?.startsWith(initial) && rest.every(t => cT.includes(t))
    },
    // último token (apellido) igual
    cn => cn.split(' ').pop() === targetTokens[targetTokens.length - 1],
    // typos / romanización
    cn => lev(cn, target) <= 2,
  ]

  for (const pass of passes) {
    const found = candidates.filter(c => pass(normName(c.name)))
    if (found.length === 1) return found[0]
  }
  return null
}
