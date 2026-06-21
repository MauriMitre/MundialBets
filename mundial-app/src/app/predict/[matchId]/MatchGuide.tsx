// Guía pre-apuesta: racha reciente de cada equipo (ESPN, cacheado 10 min),
// alineación confirmada cuando ESPN ya la publicó (~1h antes), y
// goleadores/asistentes del torneo según nuestros match_events.
// Si ESPN falla o no hay datos, el panel se achica o no se muestra:
// nunca bloquea la predicción.
import { createClient } from '@/lib/supabase/server'

const SUMMARY = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TeamRef { id: string; name: string; code: string }

interface Props {
  match: {
    api_fixture_id: string | number | null
    home_team_id: string
    away_team_id: string
    homeTeam: TeamRef
    awayTeam: TeamRef
  }
}

interface FormGame {
  result: 'W' | 'D' | 'L'
  opponent: string
  score: string
}

interface LineupPlayer {
  name: string
  shirt: number | null
  pos: string
}

interface Lineup {
  formation: string | null
  starters: LineupPlayer[]
}

interface PlayerLine {
  name: string
  shirt: number | null
  count: number
}

interface TeamStats {
  scorers: PlayerLine[]
  assisters: PlayerLine[]
}

interface EspnSummary {
  form: Record<string, FormGame[]> | null
  lineups: Record<string, Lineup> | null
}

async function fetchEspnSummary(
  fixtureId: string | number,
  espnToTeamId: Map<string, string>,
): Promise<EspnSummary> {
  try {
    const res = await fetch(`${SUMMARY}?event=${fixtureId}`, { next: { revalidate: 600 } })
    if (!res.ok) return { form: null, lineups: null }
    const data = await res.json()

    // Racha reciente
    const byTeam: Record<string, FormGame[]> = {}
    for (const f of data?.boxscore?.form ?? []) {
      const teamId = espnToTeamId.get(String(f.team?.id))
      if (!teamId) continue
      byTeam[teamId] = (f.events ?? []).slice(0, 5).map((e: any) => ({
        result: e.gameResult,
        opponent: e.opponent?.displayName ?? '',
        score: `${e.homeTeamScore}-${e.awayTeamScore}`,
      }))
    }

    // Alineación: ESPN publica formation + titulares ~1h antes del
    // arranque. Antes de eso roster viene vacío y formation null.
    const lineupByTeam: Record<string, Lineup> = {}
    for (const t of data?.rosters ?? []) {
      const teamId = espnToTeamId.get(String(t.team?.id))
      if (!teamId) continue
      const starters: LineupPlayer[] = (t.roster ?? [])
        .filter((p: any) => p.starter)
        .map((p: any) => ({
          name: p.athlete?.displayName ?? '',
          shirt: p.jersey ? parseInt(p.jersey, 10) : null,
          pos: p.position?.abbreviation ?? '',
        }))
      lineupByTeam[teamId] = { formation: t.formation ?? null, starters }
    }

    return {
      form: Object.keys(byTeam).length > 0 ? byTeam : null,
      lineups: Object.keys(lineupByTeam).length > 0 ? lineupByTeam : null,
    }
  } catch {
    return { form: null, lineups: null }
  }
}

export default async function MatchGuide({ match }: Props) {
  const supabase = await createClient()

  // teams.api_football_id guarda el id de ESPN (ver sync-results)
  const [{ data: teamRows }, { data: events }] = await Promise.all([
    supabase
      .from('teams')
      .select('id, api_football_id')
      .in('id', [match.home_team_id, match.away_team_id]),
    supabase
      .from('match_events')
      .select('event_type, player:player_id!inner ( id, name, shirt_number, team_id )')
      .in('event_type', ['goal', 'assist'])
      .in('player.team_id', [match.home_team_id, match.away_team_id]),
  ])

  const espnToTeamId = new Map(
    (teamRows ?? [])
      .filter(t => t.api_football_id !== null)
      .map(t => [String(t.api_football_id), t.id as string])
  )

  const { form: formByTeam, lineups: lineupByTeam } = match.api_fixture_id
    ? await fetchEspnSummary(match.api_fixture_id, espnToTeamId)
    : { form: null, lineups: null }

  // Goles y asistencias del torneo, agregados por jugador
  const statsByTeam: Record<string, TeamStats> = {
    [match.home_team_id]: { scorers: [], assisters: [] },
    [match.away_team_id]: { scorers: [], assisters: [] },
  }
  const counters = new Map<string, { player: any; goals: number; assists: number }>()
  for (const ev of (events ?? []) as any[]) {
    const player = ev.player
    if (!player) continue
    const entry = counters.get(player.id) ?? { player, goals: 0, assists: 0 }
    if (ev.event_type === 'goal') entry.goals++
    else entry.assists++
    counters.set(player.id, entry)
  }
  for (const { player, goals, assists } of counters.values()) {
    const stats = statsByTeam[player.team_id]
    if (!stats) continue
    if (goals > 0) stats.scorers.push({ name: player.name, shirt: player.shirt_number, count: goals })
    if (assists > 0) stats.assisters.push({ name: player.name, shirt: player.shirt_number, count: assists })
  }
  for (const stats of Object.values(statsByTeam)) {
    stats.scorers.sort((a, b) => b.count - a.count)
    stats.assisters.sort((a, b) => b.count - a.count)
  }

  const hasStats = Object.values(statsByTeam).some(s => s.scorers.length > 0 || s.assisters.length > 0)
  if (!formByTeam && !hasStats && !lineupByTeam) return null

  return (
    <div className="bg-surface-container-low rounded-xl p-4 sm:p-6">
      <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm mb-1">
        📊 Guía para tu apuesta
      </h3>
      <p className="font-body text-xs text-on-surface-variant/60 mb-4">
        Alineación confirmada, racha reciente y los jugadores con más goles y asistencias en el torneo
      </p>

      <div className="grid grid-cols-2 gap-4">
        <TeamGuide
          team={match.homeTeam}
          form={formByTeam?.[match.home_team_id]}
          lineup={lineupByTeam?.[match.home_team_id]}
          stats={statsByTeam[match.home_team_id]}
        />
        <TeamGuide
          team={match.awayTeam}
          form={formByTeam?.[match.away_team_id]}
          lineup={lineupByTeam?.[match.away_team_id]}
          stats={statsByTeam[match.away_team_id]}
        />
      </div>
    </div>
  )
}

const RESULT_STYLE: Record<FormGame['result'], { label: string; className: string }> = {
  W: { label: 'G', className: 'bg-primary/20 text-primary' },
  D: { label: 'E', className: 'bg-white/10 text-on-surface-variant' },
  L: { label: 'P', className: 'bg-error/20 text-error' },
}

function TeamGuide({ team, form, lineup, stats }: { team: TeamRef; form?: FormGame[]; lineup?: Lineup; stats: TeamStats }) {
  const tally = form
    ? `${form.filter(g => g.result === 'W').length}G · ${form.filter(g => g.result === 'D').length}E · ${form.filter(g => g.result === 'L').length}P`
    : null

  return (
    <div className="min-w-0">
      <p className="font-headline font-bold text-xs uppercase tracking-wide text-on-surface mb-2 truncate">
        {team.name}
      </p>

      {lineup && <LineupBlock lineup={lineup} />}

      {form && form.length > 0 && (
        <div className="mb-3">
          <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-1">
            Últimos {form.length} · {tally}
          </p>
          <div className="flex gap-1">
            {form.map((g, i) => {
              const style = RESULT_STYLE[g.result] ?? RESULT_STYLE.D
              return (
                <span
                  key={i}
                  title={`${g.score} vs ${g.opponent}`}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${style.className}`}
                >
                  {style.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <PlayerList icon="⚽" label="Goleadores" players={stats.scorers} />
      <PlayerList icon="🎯" label="Asistencias" players={stats.assisters} />

      {stats.scorers.length === 0 && stats.assisters.length === 0 && (
        <p className="font-body text-[10px] text-on-surface-variant/40">
          Sin goles ni asistencias en el torneo todavía
        </p>
      )}
    </div>
  )
}

function LineupBlock({ lineup }: { lineup: Lineup }) {
  // ESPN aún no publicó el 11 (típicamente desde ~1h antes del partido)
  if (lineup.starters.length === 0) {
    return (
      <div className="mb-3">
        <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-1">
          👕 Alineación
        </p>
        <p className="font-body text-[10px] text-on-surface-variant/40">
          Todavía no confirmada
        </p>
      </div>
    )
  }

  return (
    <div className="mb-3">
      <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-1">
        👕 Alineación{lineup.formation ? ` · ${lineup.formation}` : ''}
      </p>
      {lineup.starters.map((p, i) => (
        <p key={i} className="font-label text-xs text-on-surface-variant/80 truncate">
          {p.shirt ? `#${p.shirt} ` : ''}{p.name}
          {p.pos ? <span className="text-on-surface-variant/40"> {p.pos}</span> : null}
        </p>
      ))}
    </div>
  )
}

function PlayerList({ icon, label, players }: { icon: string; label: string; players: PlayerLine[] }) {
  if (players.length === 0) return null
  return (
    <div className="mb-2">
      <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-1">
        {icon} {label}
      </p>
      {players.slice(0, 3).map((p, i) => (
        <p key={i} className="font-label text-xs text-on-surface-variant/80 truncate">
          {p.shirt ? `#${p.shirt} ` : ''}{p.name}
          <span className="text-primary font-bold"> ×{p.count}</span>
        </p>
      ))}
    </div>
  )
}
