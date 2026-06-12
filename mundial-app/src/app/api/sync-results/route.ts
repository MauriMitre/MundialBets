// Carga automática de resultados desde la API no oficial de ESPN
// (gratis, sin key). La llama el pg_cron de Supabase cada 10 min (ver
// supabase/migration_auto_results.sql). Flujo:
//
//   1. Busca partidos que arrancaron hace <8h (o quedaron 'live') y
//      todavía no tienen puntos calculados. Si no hay, sale sin pegar
//      a ESPN.
//   2. Por cada candidato pide el summary del evento (mapeado por
//      scripts/map-api-ids.mjs en matches.api_fixture_id).
//   3. En juego → status 'live' + marcador parcial.
//      Terminado → marcador de los 90' (semántica de la BD: períodos
//      1-2), penales de la tanda, knockout_winner, eventos gol/
//      asistencia (participants de ESPN, matcheados contra el plantel
//      por nombre completo) y close_match() recalcula los puntos.
//
// Idempotente: si el admin corrige después desde /admin/results, el
// recálculo ajusta por diferencia. Querystring: ?secret=... (obligatorio),
// ?dry=1 para ver qué haría sin escribir.
import { type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { matchPlayerName } from '@/lib/nameMatch'

const SUMMARY = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary'

/* eslint-disable @typescript-eslint/no-explicit-any */

function statusKind(name: string): 'pre' | 'live' | 'done' {
  if (name === 'STATUS_SCHEDULED' || name === 'STATUS_POSTPONED' || name === 'STATUS_CANCELED') return 'pre'
  if (name === 'STATUS_FULL_TIME' || name.includes('FINAL')) return 'done'
  return 'live'
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret') ?? request.headers.get('x-sync-secret')
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
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

  const summary: any = { checked: candidates.length, live: [], finished: [], warnings: [], dry }

  for (const match of candidates) {
    const res = await fetch(`${SUMMARY}?event=${match.api_fixture_id}`, { cache: 'no-store' })
    if (!res.ok) {
      summary.warnings.push({ match: match.id, warning: `ESPN summary HTTP ${res.status}` })
      continue
    }
    const data = await res.json()
    const comp = data?.header?.competitions?.[0]
    if (!comp) {
      summary.warnings.push({ match: match.id, warning: 'summary sin header.competitions' })
      continue
    }
    const kind = statusKind(comp.status?.type?.name ?? '')
    if (kind === 'pre') continue

    const homeC = comp.competitors?.find((c: any) => c.homeAway === 'home')
    const awayC = comp.competitors?.find((c: any) => c.homeAway === 'away')
    const homeTotal = parseInt(homeC?.score ?? '')
    const awayTotal = parseInt(awayC?.score ?? '')

    // ── En juego: status live + marcador parcial ──────────
    if (kind === 'live') {
      summary.live.push({ match: match.id, status: comp.status?.type?.name, score: `${homeTotal || 0}-${awayTotal || 0}` })
      if (!dry) {
        await supabase.from('matches').update({
          status: 'live',
          home_score: isNaN(homeTotal) ? null : homeTotal,
          away_score: isNaN(awayTotal) ? null : awayTotal,
        }).eq('id', match.id)
      }
      continue
    }

    // ── Terminado ─────────────────────────────────────────
    if (isNaN(homeTotal) || isNaN(awayTotal)) {
      summary.warnings.push({ match: match.id, warning: 'final sin marcador' })
      continue
    }

    // Goles reales: scoringPlay sin tanda de penales
    const goals = (data?.keyEvents ?? []).filter((k: any) => k.scoringPlay && !k.shootout)

    // Semántica de la BD: home/away_score = tiempo reglamentario.
    // Si hubo alargue (períodos 3-4), restar esos goles del total.
    const homeEspnId = homeC?.team?.id
    let homeScore = homeTotal
    let awayScore = awayTotal
    for (const g of goals) {
      if ((g.period?.number ?? 1) >= 3) {
        if (g.team?.id === homeEspnId) homeScore--
        else awayScore--
      }
    }

    const penHome = homeC?.shootoutScore ?? null
    const penAway = awayC?.shootoutScore ?? null
    const knockoutWinner =
      match.stage !== 'group' && homeScore === awayScore
        ? (homeC?.winner === true ? 'home' : awayC?.winner === true ? 'away' : null)
        : null

    // Plantel de ambos equipos para mapear nombres
    const { data: roster } = await supabase
      .from('players')
      .select('id, name, team_id')
      .in('team_id', [match.home_team_id, match.away_team_id])
    const { data: teamRows } = await supabase
      .from('teams')
      .select('id, api_football_id')
      .in('id', [match.home_team_id, match.away_team_id])
    const teamIdByEspn = new Map((teamRows ?? []).map(t => [String(t.api_football_id), t.id]))

    const resolvePlayer = (name: string | undefined, espnTeamId: string | undefined) => {
      if (!name) return null
      const teamId = espnTeamId ? teamIdByEspn.get(String(espnTeamId)) : null
      const scoped = teamId ? (roster ?? []).filter(p => p.team_id === teamId) : (roster ?? [])
      return matchPlayerName(name, scoped) ?? matchPlayerName(name, roster ?? [])
    }

    const eventRows: { match_id: string; player_id: string; event_type: string; minute: number | null }[] = []
    const eventLabels: string[] = []
    for (const g of goals) {
      const minute = g.clock?.value ? Math.ceil(g.clock.value / 60) : null
      const isOwnGoal = (g.type?.type ?? '').includes('own')
      const scorerName = g.participants?.[0]?.athlete?.displayName
      if (isOwnGoal) {
        summary.warnings.push({ match: match.id, warning: `gol en contra (${scorerName ?? '?'} ${minute}'): no se acredita goleador` })
        continue
      }
      const scorer = resolvePlayer(scorerName, g.team?.id)
      if (scorer) {
        eventRows.push({ match_id: match.id, player_id: scorer.id, event_type: 'goal', minute })
        eventLabels.push(`gol ${scorer.name} ${minute}'`)
      } else {
        summary.warnings.push({ match: match.id, warning: `goleador sin match en BD: "${scorerName}" ${minute}' — cargarlo a mano en /admin/results` })
      }
      // participants[1] = asistente (cuando el texto dice "Assisted by")
      const assistName = g.participants?.[1]?.athlete?.displayName
      if (assistName && /assisted by/i.test(g.text ?? '')) {
        const assister = resolvePlayer(assistName, g.team?.id)
        if (assister) {
          eventRows.push({ match_id: match.id, player_id: assister.id, event_type: 'assist', minute })
          eventLabels.push(`asist ${assister.name} ${minute}'`)
        } else {
          summary.warnings.push({ match: match.id, warning: `asistente sin match en BD: "${assistName}" ${minute}' — cargarlo a mano en /admin/results` })
        }
      }
    }

    summary.finished.push({
      match: match.id,
      score: `${homeScore}-${awayScore}`,
      penalties: penHome !== null ? `${penHome}-${penAway}` : null,
      knockoutWinner,
      events: eventLabels,
    })

    if (dry) continue

    // Aplicar: reemplazo idempotente de eventos + resultado + puntos
    const { error: delErr } = await supabase.from('match_events').delete().eq('match_id', match.id)
    if (delErr) { summary.warnings.push({ match: match.id, warning: `borrando eventos: ${delErr.message}` }); continue }

    const { error: updErr } = await supabase.from('matches').update({
      status: 'finished',
      home_score: homeScore,
      away_score: awayScore,
      penalty_home_score: penHome,
      penalty_away_score: penAway,
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
