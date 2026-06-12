// Carga automática de resultados desde API-Football (api-sports.io).
// La llama el pg_cron de Supabase cada 10 min (ver
// supabase/migration_auto_results.sql). Flujo:
//
//   1. Busca partidos que arrancaron hace <8h (o quedaron 'live') y
//      todavía no tienen puntos calculados. Si no hay, sale sin
//      gastar requests de la API (plan gratis: 100/día).
//   2. Una sola request /fixtures?ids=... trae estado, marcador y
//      eventos de hasta 20 partidos.
//   3. En juego → status 'live' + marcador parcial.
//      Terminado → marcador de los 90' (la semántica de la BD),
//      penales, knockout_winner, eventos gol/asistencia mapeados a
//      players de la BD (por api_football_id, fallback por nombre) y
//      close_match() recalcula los puntos de todos.
//
// Idempotente: si el admin corrige después desde /admin/results, el
// recálculo ajusta por diferencia. Querystring: ?secret=... (obligatorio),
// ?dry=1 para ver qué haría sin escribir.
import { type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { matchPlayerName } from '@/lib/nameMatch'

const API_BASE = 'https://v3.football.api-sports.io'

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
const DONE_STATUSES = new Set(['FT', 'AET', 'PEN'])

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret') ?? request.headers.get('x-sync-secret')
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) {
    return Response.json({ error: 'API_FOOTBALL_KEY no configurada' }, { status: 500 })
  }
  const dry = request.nextUrl.searchParams.get('dry') === '1'
  const supabase = createAdminClient()

  // ── 1. Partidos en ventana ──────────────────────────────
  const now = Date.now()
  const { data: candidates, error: candErr } = await supabase
    .from('matches')
    .select('id, api_fixture_id, home_team_id, away_team_id, match_date, stage, status')
    .eq('is_scored', false)
    .neq('status', 'finished')
    .not('api_fixture_id', 'is', null)
    .lte('match_date', new Date(now).toISOString())
    .gte('match_date', new Date(now - 8 * 3600_000).toISOString())
  if (candErr) return Response.json({ error: candErr.message }, { status: 500 })
  if (!candidates || candidates.length === 0) {
    return Response.json({ checked: 0, message: 'sin partidos en ventana' })
  }

  // ── 2. Una request por tick: fixtures por ids ───────────
  const ids = candidates.map(m => m.api_fixture_id).join('-')
  const apiRes = await fetch(`${API_BASE}/fixtures?ids=${ids}&timezone=UTC`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  })
  const body = await apiRes.json()
  const apiErrors = body?.errors
  if (!apiRes.ok || (apiErrors && Object.keys(apiErrors).length > 0 && !Array.isArray(apiErrors))) {
    return Response.json({ error: 'API-Football', detail: apiErrors ?? apiRes.status }, { status: 502 })
  }
  const fixtures: any[] = body?.response ?? []
  const byFixtureId = new Map(candidates.map(m => [m.api_fixture_id, m]))

  const summary: any = { checked: candidates.length, live: [], finished: [], warnings: [], dry }

  for (const fx of fixtures) {
    const match = byFixtureId.get(fx.fixture?.id)
    if (!match) continue
    const st: string = fx.fixture?.status?.short ?? ''

    // ── En juego: status live + marcador parcial ──────────
    if (LIVE_STATUSES.has(st)) {
      summary.live.push({ match: match.id, status: st, score: `${fx.goals?.home ?? 0}-${fx.goals?.away ?? 0}` })
      if (!dry) {
        await supabase.from('matches').update({
          status: 'live',
          home_score: fx.goals?.home ?? null,
          away_score: fx.goals?.away ?? null,
        }).eq('id', match.id)
      }
      continue
    }

    if (!DONE_STATUSES.has(st)) continue

    // ── Terminado ─────────────────────────────────────────
    // Semántica de la BD: home/away_score = tiempo reglamentario;
    // empate + knockout_winner si se definió después (ET/penales)
    const ft = fx.score?.fulltime
    if (ft?.home === null || ft?.home === undefined) {
      summary.warnings.push({ match: match.id, warning: `sin marcador fulltime (status ${st})` })
      continue
    }
    const pen = fx.score?.penalty
    const homeWinner = fx.teams?.home?.winner
    const knockoutWinner =
      match.stage !== 'group' && ft.home === ft.away
        ? (homeWinner === true ? 'home' : homeWinner === false ? 'away' : null)
        : null

    // Eventos de gol: sin goles en contra (no son mérito del goleador)
    // y sin la tanda de penales
    const goalEvents = (fx.events ?? []).filter((e: any) =>
      e.type === 'Goal' &&
      e.detail !== 'Missed Penalty' &&
      e.detail !== 'Own Goal' &&
      e.comments !== 'Penalty Shootout'
    )

    // Plantel de ambos equipos para mapear jugadores
    const { data: roster } = await supabase
      .from('players')
      .select('id, name, team_id, api_football_id')
      .in('team_id', [match.home_team_id, match.away_team_id])
    const byApiId = new Map((roster ?? []).filter(p => p.api_football_id).map(p => [p.api_football_id, p]))
    const { data: teamRows } = await supabase
      .from('teams')
      .select('id, api_football_id')
      .in('id', [match.home_team_id, match.away_team_id])
    const teamIdByApi = new Map((teamRows ?? []).map(t => [t.api_football_id, t.id]))

    const resolvePlayer = (apiPlayer: any, apiTeamId: number) => {
      if (!apiPlayer?.name) return null
      const direct = apiPlayer.id ? byApiId.get(apiPlayer.id) : null
      if (direct) return direct
      const teamId = teamIdByApi.get(apiTeamId)
      const teamRoster = (roster ?? []).filter(p => !teamId || p.team_id === teamId)
      return matchPlayerName(apiPlayer.name, teamRoster)
    }

    const eventRows: { match_id: string; player_id: string; event_type: string; minute: number | null }[] = []
    const eventLabels: string[] = []
    for (const e of goalEvents) {
      const minute = e.time?.elapsed ?? null
      const scorer = resolvePlayer(e.player, e.team?.id)
      if (scorer) {
        eventRows.push({ match_id: match.id, player_id: scorer.id, event_type: 'goal', minute })
        eventLabels.push(`gol ${scorer.name} ${minute}'`)
      } else {
        summary.warnings.push({ match: match.id, warning: `goleador sin match en BD: "${e.player?.name}" ${minute}' — cargarlo a mano en /admin/results` })
      }
      if (e.assist?.name) {
        const assister = resolvePlayer(e.assist, e.team?.id)
        if (assister) {
          eventRows.push({ match_id: match.id, player_id: assister.id, event_type: 'assist', minute })
          eventLabels.push(`asist ${assister.name} ${minute}'`)
        } else {
          summary.warnings.push({ match: match.id, warning: `asistente sin match en BD: "${e.assist.name}" ${minute}' — cargarlo a mano en /admin/results` })
        }
      }
    }

    summary.finished.push({
      match: match.id,
      score: `${ft.home}-${ft.away}`,
      penalties: pen?.home !== null && pen?.home !== undefined ? `${pen.home}-${pen.away}` : null,
      knockoutWinner,
      events: eventLabels,
    })

    if (dry) continue

    // Aplicar: reemplazo idempotente de eventos + resultado + puntos
    const { error: delErr } = await supabase.from('match_events').delete().eq('match_id', match.id)
    if (delErr) { summary.warnings.push({ match: match.id, warning: `borrando eventos: ${delErr.message}` }); continue }

    const { error: updErr } = await supabase.from('matches').update({
      status: 'finished',
      home_score: ft.home,
      away_score: ft.away,
      penalty_home_score: pen?.home ?? null,
      penalty_away_score: pen?.away ?? null,
      knockout_winner: knockoutWinner,
    }).eq('id', match.id)
    if (updErr) { summary.warnings.push({ match: match.id, warning: `guardando resultado: ${updErr.message}` }); continue }

    if (eventRows.length > 0) {
      const { error: insErr } = await supabase.from('match_events').insert(eventRows)
      if (insErr) summary.warnings.push({ match: match.id, warning: `insertando eventos: ${insErr.message}` })
    }

    const { error: rpcErr } = await supabase.rpc('close_match', { match_id: match.id })
    if (rpcErr) summary.warnings.push({ match: match.id, warning: `close_match: ${rpcErr.message}` })
  }

  return Response.json(summary)
}
