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

// ─────────────────────────────────────────────────────────────────────────
//  Cuadro COMPLETO con resultados reales (16avos → octavos → cuartos → …)
//
//  A diferencia de resolveBracket() —que proyecta los cruces de 16avos desde
//  las posiciones de grupos— esto arma el árbol entero a partir de los
//  partidos eliminatorios YA CREADOS en la BD, mostrando marcadores y qué
//  equipo avanzó. El ganador de cada llave se resuelve por quién aparece en
//  la ronda siguiente (así los definidos por PENALES quedan bien, aunque el
//  marcador de 90' sea empate). El árbol es el fijo de FIFA: los pares
//  consecutivos del array R32 (por lado) alimentan la ronda siguiente.
// ─────────────────────────────────────────────────────────────────────────

export interface KoRow {
  stage: string
  homeCode: string | null
  awayCode: string | null
  homeScore: number | null
  awayScore: number | null
  status: string
}

export interface BracketTeam {
  code: string | null
  label: string | null
  score: number | null
  won: boolean
}

export interface BracketCell {
  home: BracketTeam
  away: BracketTeam
  played: boolean // partido finalizado
  live: boolean // en juego
}

interface SideBracket {
  r32: BracketCell[]
  r16: BracketCell[]
  qf: BracketCell[]
  sf: BracketCell[]
}

export interface FullBracket {
  left: SideBracket
  right: SideBracket
  final: BracketCell
  champion: BracketTeam | null
}

const NEXT_STAGE: Record<string, string> = {
  round_of_32: 'round_of_16',
  round_of_16: 'quarter',
  quarter: 'semi',
  semi: 'final',
}

export function resolveFullBracket(
  standingsByGroup: Map<string, StandingRow[]>,
  ko: KoRow[],
): FullBracket {
  // Etiqueta de origen de cada equipo: código → "1E" | "2A" | "3C" …
  const labelByCode = new Map<string, string>()
  for (const [g, rows] of standingsByGroup) {
    rows.forEach((r, i) => { if (r.code) labelByCode.set(r.code, `${i + 1}${g}`) })
  }
  const lab = (code: string | null) => (code ? labelByCode.get(code) ?? null : null)

  // Código real del slot de local de cada llave de 16avos (siempre 1X/2X:
  // determinista y único → sirve de ancla para encontrar el partido real).
  const homeSlotCode = (slot: Slot): string | null => {
    if (slot.kind === 'winner') return standingsByGroup.get(slot.group)?.[0]?.code ?? null
    if (slot.kind === 'runner') return standingsByGroup.get(slot.group)?.[1]?.code ?? null
    return null
  }

  // Índice de partidos por ronda.
  const byStage = new Map<string, KoRow[]>()
  for (const m of ko) {
    const arr = byStage.get(m.stage) ?? []
    arr.push(m)
    byStage.set(m.stage, arr)
  }
  const participantsOf = (stage: string) => {
    const set = new Set<string>()
    for (const m of byStage.get(stage) ?? []) {
      if (m.homeCode) set.add(m.homeCode)
      if (m.awayCode) set.add(m.awayCode)
    }
    return set
  }
  const nextParticipants = new Map<string, Set<string>>()
  for (const st of Object.keys(NEXT_STAGE)) nextParticipants.set(st, participantsOf(NEXT_STAGE[st]))

  const findByCode = (stage: string, code: string | null): KoRow | null => {
    if (!code) return null
    return (byStage.get(stage) ?? []).find(m => m.homeCode === code || m.awayCode === code) ?? null
  }
  const findByPair = (stage: string, a: string | null, b: string | null): KoRow | null => {
    if (!a && !b) return null
    return (byStage.get(stage) ?? []).find(
      m => (m.homeCode === a && m.awayCode === b) || (m.homeCode === b && m.awayCode === a),
    ) ?? null
  }

  const isFinished = (m: KoRow) => m.status === 'finished' && m.homeScore != null && m.awayScore != null
  const winnerOf = (stage: string, m: KoRow | null): string | null => {
    if (!m || !isFinished(m)) return null
    const nxt = nextParticipants.get(stage)
    if (nxt) {
      if (m.homeCode && nxt.has(m.homeCode)) return m.homeCode
      if (m.awayCode && nxt.has(m.awayCode)) return m.awayCode
    }
    if (m.homeScore! > m.awayScore!) return m.homeCode
    if (m.awayScore! > m.homeScore!) return m.awayCode
    return null // empate sin dato de la ronda siguiente (definición pendiente)
  }

  // Arma una llave con orientación local/visitante dada por nuestros códigos.
  const cellFrom = (
    stage: string,
    homeCode: string | null,
    awayCode: string | null,
    real: KoRow | null,
    win: string | null,
  ): BracketCell => {
    const scoreOf = (code: string | null): number | null => {
      if (!real || !code) return null
      if (real.homeCode === code) return real.homeScore
      if (real.awayCode === code) return real.awayScore
      return null
    }
    return {
      home: { code: homeCode, label: lab(homeCode), score: scoreOf(homeCode), won: win != null && win === homeCode },
      away: { code: awayCode, label: lab(awayCode), score: scoreOf(awayCode), won: win != null && win === awayCode },
      played: !!real && real.status === 'finished',
      live: !!real && real.status === 'live',
    }
  }

  type Node = { side: 'left' | 'right'; cell: BracketCell; winner: string | null }

  // 16avos: cada llave anclada por su equipo local (1X/2X). El rival y el
  // marcador salen del partido REAL (así no dependemos de qué tercero cae
  // dónde, que puede diferir de la proyección).
  const r32nodes: Node[] = R32.map(node => {
    const homeCode = homeSlotCode(node.home)
    const real = findByCode('round_of_32', homeCode)
    const awayCode = real
      ? (real.homeCode === homeCode ? real.awayCode : real.homeCode)
      : null
    const win = winnerOf('round_of_32', real)
    return { side: node.side, cell: cellFrom('round_of_32', homeCode, awayCode, real, win), winner: win }
  })

  // Ronda interna: empareja llaves consecutivas; los participantes son los
  // ganadores de cada par y se buscan en el partido real de esa ronda.
  const buildRound = (feeders: Node[], stage: string): Node[] => {
    const out: Node[] = []
    for (let i = 0; i < feeders.length; i += 2) {
      const hCode = feeders[i]?.winner ?? null
      const aCode = feeders[i + 1]?.winner ?? null
      const real = findByPair(stage, hCode, aCode) ?? findByCode(stage, hCode) ?? findByCode(stage, aCode)
      const win = winnerOf(stage, real)
      out.push({ side: feeders[i]?.side ?? 'left', cell: cellFrom(stage, hCode, aCode, real, win), winner: win })
    }
    return out
  }

  const buildSide = (side: 'left' | 'right'): { side: SideBracket; sf: Node } => {
    const r32 = r32nodes.filter(n => n.side === side)
    const r16 = buildRound(r32, 'round_of_16')
    const qf = buildRound(r16, 'quarter')
    const sf = buildRound(qf, 'semi')
    return {
      side: { r32: r32.map(n => n.cell), r16: r16.map(n => n.cell), qf: qf.map(n => n.cell), sf: sf.map(n => n.cell) },
      sf: sf[0],
    }
  }

  const l = buildSide('left')
  const r = buildSide('right')

  const fHome = l.sf?.winner ?? null
  const fAway = r.sf?.winner ?? null
  const fReal = findByPair('final', fHome, fAway) ?? findByCode('final', fHome) ?? findByCode('final', fAway)
  const fWin = winnerOf('final', fReal)
  const finalCell = cellFrom('final', fHome, fAway, fReal, fWin)
  const champion: BracketTeam | null = fWin
    ? { code: fWin, label: lab(fWin), score: null, won: true }
    : null

  return { left: l.side, right: r.side, final: finalCell, champion }
}
