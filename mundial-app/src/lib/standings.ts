// Cálculo de tabla de posiciones de fase de grupos a partir de los
// partidos de nuestra DB. 3 pts victoria, 1 empate. Solo cuenta los
// finalizados; los equipos sin jugar igual aparecen en cero.
// Lo usan la previa de apuesta (GroupStandings) y la página /groups.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface StandingRow {
  teamId: string
  name: string
  code: string
  pj: number
  g: number
  e: number
  p: number
  gf: number
  gc: number
  pts: number
}

interface MatchLike {
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  status: string
  homeTeam?: { id: string; name: string; code: string } | null
  awayTeam?: { id: string; name: string; code: string } | null
}

export function computeStandings(matches: MatchLike[]): StandingRow[] {
  const table = new Map<string, StandingRow>()
  const ensure = (t: { id: string; name: string; code: string }): StandingRow => {
    let row = table.get(t.id)
    if (!row) {
      row = { teamId: t.id, name: t.name, code: t.code, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }
      table.set(t.id, row)
    }
    return row
  }

  for (const m of matches as any[]) {
    // Asegurar que todo equipo del grupo aparezca aunque no haya jugado
    if (m.homeTeam) ensure(m.homeTeam)
    if (m.awayTeam) ensure(m.awayTeam)
    if (m.status !== 'finished' || m.home_score === null || m.away_score === null) continue
    if (!m.homeTeam || !m.awayTeam) continue

    const home = ensure(m.homeTeam)
    const away = ensure(m.awayTeam)
    home.pj++; away.pj++
    home.gf += m.home_score; home.gc += m.away_score
    away.gf += m.away_score; away.gc += m.home_score
    if (m.home_score > m.away_score) { home.g++; away.p++; home.pts += 3 }
    else if (m.home_score < m.away_score) { away.g++; home.p++; away.pts += 3 }
    else { home.e++; away.e++; home.pts++; away.pts++ }
  }

  return [...table.values()].sort((a, b) =>
    b.pts - a.pts ||
    (b.gf - b.gc) - (a.gf - a.gc) ||
    b.gf - a.gf ||
    a.name.localeCompare(b.name)
  )
}
