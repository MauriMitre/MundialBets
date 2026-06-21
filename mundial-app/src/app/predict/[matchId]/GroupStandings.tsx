// Tabla del grupo y resultados ya jugados, para la previa de la apuesta.
// Todo sale de nuestra DB (no ESPN): los partidos de fase de grupos con
// su group_name y, si están 'finished', su marcador. La tabla de
// posiciones se calcula al vuelo (3 pts victoria, 1 empate). Solo se
// muestra en partidos de fase de grupos; en eliminatorias no aplica.
import { createClient } from '@/lib/supabase/server'
import { flagUrl } from '@/lib/flags'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TeamRef { id: string; name: string; code: string }

interface Props {
  groupName: string
  homeTeamId: string
  awayTeamId: string
}

interface Row {
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

export default async function GroupStandings({ groupName, homeTeamId, awayTeamId }: Props) {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, home_team_id, away_team_id, home_score, away_score, status, match_date,
      homeTeam:home_team_id ( id, name, code ),
      awayTeam:away_team_id ( id, name, code )
    `)
    .eq('stage', 'group')
    .eq('group_name', groupName)
    .order('match_date')

  if (!matches || matches.length === 0) return null

  // ── Tabla de posiciones, calculada con los partidos finalizados ──
  const table = new Map<string, Row>()
  const ensure = (t: TeamRef): Row => {
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

    const home = ensure(m.homeTeam)
    const away = ensure(m.awayTeam)
    home.pj++; away.pj++
    home.gf += m.home_score; home.gc += m.away_score
    away.gf += m.away_score; away.gc += m.home_score
    if (m.home_score > m.away_score) { home.g++; away.p++; home.pts += 3 }
    else if (m.home_score < m.away_score) { away.g++; home.p++; away.pts += 3 }
    else { home.e++; away.e++; home.pts++; away.pts++ }
  }

  const rows = [...table.values()].sort((a, b) =>
    b.pts - a.pts ||
    (b.gf - b.gc) - (a.gf - a.gc) ||
    b.gf - a.gf ||
    a.name.localeCompare(b.name)
  )

  // ── Resultados ya jugados ──
  const played = (matches as any[]).filter(
    m => m.status === 'finished' && m.home_score !== null && m.away_score !== null
  )

  const isInMatch = (teamId: string) => teamId === homeTeamId || teamId === awayTeamId

  return (
    <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
      <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm mb-1">
        🏆 Grupo {groupName}
      </h3>
      <p className="font-body text-xs text-on-surface-variant/60 mb-4">
        Cómo viene el grupo y los resultados de los partidos ya jugados
      </p>

      {/* Tabla de posiciones */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[20rem] text-xs">
          <thead>
            <tr className="text-on-surface-variant/40 font-label uppercase tracking-wider text-[9px]">
              <th className="text-left font-medium py-1 pl-1 w-4">#</th>
              <th className="text-left font-medium py-1">Equipo</th>
              <th className="text-center font-medium py-1 w-7">PJ</th>
              <th className="text-center font-medium py-1 w-7">G</th>
              <th className="text-center font-medium py-1 w-7">E</th>
              <th className="text-center font-medium py-1 w-7">P</th>
              <th className="text-center font-medium py-1 w-9">DG</th>
              <th className="text-center font-medium py-1 pr-1 w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const dg = r.gf - r.gc
              const mine = isInMatch(r.teamId)
              return (
                <tr
                  key={r.teamId}
                  className={`border-t border-white/5 ${mine ? 'bg-primary/10' : ''}`}
                >
                  <td className={`py-1.5 pl-1 ${i < 2 ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                    {i + 1}
                  </td>
                  <td className="py-1.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      {flagUrl(r.code) && (
                        <img src={flagUrl(r.code, 40)} alt={r.code} className="w-4 h-4 rounded-full object-cover shrink-0" />
                      )}
                      <span className={`truncate ${mine ? 'text-on-surface font-bold' : 'text-on-surface-variant/80'}`}>
                        {r.code}
                      </span>
                    </span>
                  </td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.pj}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.g}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.e}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{r.p}</td>
                  <td className="text-center text-on-surface-variant/60 py-1.5">{dg > 0 ? `+${dg}` : dg}</td>
                  <td className="text-center font-bold text-on-surface py-1.5 pr-1">{r.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Resultados jugados */}
      {played.length > 0 && (
        <div className="mt-4">
          <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-2">
            Resultados
          </p>
          <div className="space-y-1">
            {played.map(m => {
              const highlight = isInMatch(m.home_team_id) || isInMatch(m.away_team_id)
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-center gap-2 text-xs ${highlight ? 'text-on-surface' : 'text-on-surface-variant/60'}`}
                >
                  <span className="w-20 text-right truncate">{m.homeTeam?.code}</span>
                  <span className="font-bold tabular-nums">{m.home_score} - {m.away_score}</span>
                  <span className="w-20 text-left truncate">{m.awayTeam?.code}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
