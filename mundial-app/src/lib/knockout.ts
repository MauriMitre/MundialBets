// Bracket de 16avos de final (Round of 32) del Mundial 2026.
//
// 12 grupos (A–L). Clasifican los 2 primeros de cada grupo (24) + los 8
// mejores terceros = 32 equipos. La estructura de cruces es FIJA por
// posición de grupo (definida por FIFA); acá la resolvemos con las
// posiciones ACTUALES de la fase de grupos para mostrar "cómo irían
// quedando" los cruces. Es provisional: cambia con cada resultado.
//
// Definición de slots y árbol del bracket: 2026 FIFA World Cup knockout
// stage (Wikipedia / FIFA). Mitades del cuadro:
//   Izquierda (mitad superior): M89,M90 → M97 ; M93,M94 → M98
//   Derecha   (mitad inferior): M91,M92 → M99 ; M95,M96 → M100

import { StandingRow } from './standings'

type Slot =
  | { kind: 'winner'; group: string }
  | { kind: 'runner'; group: string }
  | { kind: 'third'; groups: string[] }

interface BracketMatch {
  match: number
  side: 'left' | 'right'
  home: Slot
  away: Slot
}

// Orden de arriba hacia abajo dentro de cada columna, siguiendo el árbol
// del cuadro (octavos M89→M94 a la izquierda, M91→M96 a la derecha).
const R32: BracketMatch[] = [
  // ── Izquierda (mitad superior) ───────────────────────────────
  { match: 74, side: 'left', home: { kind: 'winner', group: 'E' }, away: { kind: 'third', groups: ['A', 'B', 'C', 'D', 'F'] } },
  { match: 77, side: 'left', home: { kind: 'winner', group: 'I' }, away: { kind: 'third', groups: ['C', 'D', 'F', 'G', 'H'] } },
  { match: 73, side: 'left', home: { kind: 'runner', group: 'A' }, away: { kind: 'runner', group: 'B' } },
  { match: 75, side: 'left', home: { kind: 'winner', group: 'F' }, away: { kind: 'runner', group: 'C' } },
  { match: 83, side: 'left', home: { kind: 'runner', group: 'K' }, away: { kind: 'runner', group: 'L' } },
  { match: 84, side: 'left', home: { kind: 'winner', group: 'H' }, away: { kind: 'runner', group: 'J' } },
  { match: 81, side: 'left', home: { kind: 'winner', group: 'D' }, away: { kind: 'third', groups: ['B', 'E', 'F', 'I', 'J'] } },
  { match: 82, side: 'left', home: { kind: 'winner', group: 'G' }, away: { kind: 'third', groups: ['A', 'E', 'H', 'I', 'J'] } },
  // ── Derecha (mitad inferior) ─────────────────────────────────
  { match: 76, side: 'right', home: { kind: 'winner', group: 'C' }, away: { kind: 'runner', group: 'F' } },
  { match: 78, side: 'right', home: { kind: 'runner', group: 'E' }, away: { kind: 'runner', group: 'I' } },
  { match: 79, side: 'right', home: { kind: 'winner', group: 'A' }, away: { kind: 'third', groups: ['C', 'E', 'F', 'H', 'I'] } },
  { match: 80, side: 'right', home: { kind: 'winner', group: 'L' }, away: { kind: 'third', groups: ['E', 'H', 'I', 'J', 'K'] } },
  { match: 86, side: 'right', home: { kind: 'winner', group: 'J' }, away: { kind: 'runner', group: 'H' } },
  { match: 88, side: 'right', home: { kind: 'runner', group: 'D' }, away: { kind: 'runner', group: 'G' } },
  { match: 85, side: 'right', home: { kind: 'winner', group: 'B' }, away: { kind: 'third', groups: ['E', 'F', 'G', 'I', 'J'] } },
  { match: 87, side: 'right', home: { kind: 'winner', group: 'K' }, away: { kind: 'third', groups: ['D', 'E', 'I', 'J', 'L'] } },
]

export interface ResolvedSlot {
  label: string // "1E" | "2A" | "3C" | "3°"
  code: string | null
  name: string | null
}

export interface ResolvedMatch {
  match: number
  side: 'left' | 'right'
  home: ResolvedSlot
  away: ResolvedSlot
}

/**
 * Asigna los grupos de los terceros clasificados a los 8 cruces que
 * reciben un tercero, respetando la elegibilidad de cada cruce.
 * Emparejamiento bipartito (algoritmo de Kuhn) → garantiza una
 * asignación válida (cada tercero cae en un cruce permitido).
 * Devuelve: nº de partido → letra de grupo del tercero asignado.
 */
function assignThirds(
  slots: { match: number; groups: string[] }[],
  qualified: string[],
): Map<number, string> {
  const cands = slots.map(s => s.groups.filter(g => qualified.includes(g)))
  const groupToSlot = new Map<string, number>() // grupo → índice de slot

  const tryKuhn = (u: number, visited: Set<string>): boolean => {
    for (const g of cands[u]) {
      if (visited.has(g)) continue
      visited.add(g)
      const owner = groupToSlot.get(g)
      if (owner === undefined || tryKuhn(owner, visited)) {
        groupToSlot.set(g, u)
        return true
      }
    }
    return false
  }

  for (let u = 0; u < slots.length; u++) tryKuhn(u, new Set())

  const res = new Map<number, string>()
  for (const [g, u] of groupToSlot) res.set(slots[u].match, g)
  return res
}

/**
 * Resuelve el cuadro de 16avos con las posiciones actuales de cada grupo.
 * @param standingsByGroup  letra de grupo → tabla ordenada (1°,2°,3°,4°)
 */
export function resolveBracket(
  standingsByGroup: Map<string, StandingRow[]>,
): ResolvedMatch[] {
  // 1) Terceros de cada grupo, rankeados como FIFA: pts, DG, GF.
  const thirds: { group: string; row: StandingRow }[] = []
  for (const [g, rows] of standingsByGroup) {
    if (rows[2]) thirds.push({ group: g, row: rows[2] })
  }
  thirds.sort(
    (a, b) =>
      b.row.pts - a.row.pts ||
      (b.row.gf - b.row.gc) - (a.row.gf - a.row.gc) ||
      b.row.gf - a.row.gf ||
      a.group.localeCompare(b.group),
  )
  const qualifiedThirds = thirds.slice(0, 8)
  const qualifiedGroups = qualifiedThirds.map(t => t.group)
  const thirdRowByGroup = new Map(qualifiedThirds.map(t => [t.group, t.row]))

  // 2) Repartir esos terceros a los 8 cruces que los reciben.
  const thirdSlots = R32.filter(m => m.away.kind === 'third').map(m => ({
    match: m.match,
    groups: (m.away as { kind: 'third'; groups: string[] }).groups,
  }))
  const thirdAssign = assignThirds(thirdSlots, qualifiedGroups)

  // 3) Resolver cada slot a un equipo concreto (o placeholder).
  const resolveSlot = (matchNo: number, slot: Slot): ResolvedSlot => {
    if (slot.kind === 'winner') {
      const r = standingsByGroup.get(slot.group)?.[0]
      return { label: `1${slot.group}`, code: r?.code ?? null, name: r?.name ?? null }
    }
    if (slot.kind === 'runner') {
      const r = standingsByGroup.get(slot.group)?.[1]
      return { label: `2${slot.group}`, code: r?.code ?? null, name: r?.name ?? null }
    }
    // tercero
    const group = thirdAssign.get(matchNo)
    if (!group) return { label: '3°', code: null, name: null }
    const r = thirdRowByGroup.get(group)
    return { label: `3${group}`, code: r?.code ?? null, name: r?.name ?? null }
  }

  return R32.map(m => ({
    match: m.match,
    side: m.side,
    home: resolveSlot(m.match, m.home),
    away: resolveSlot(m.match, m.away),
  }))
}
