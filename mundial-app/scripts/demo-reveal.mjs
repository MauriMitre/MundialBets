// Demo visual de "Las apuestas de todos" en localhost.
// Crea un partido de prueba con apuestas YA cerradas (match_date en +25min,
// no adelanta el MIN(match_date) del torneo) y predicciones variadas para
// varios usuarios. NO calcula puntos ni toca datos reales.
//
//   node scripts/demo-reveal.mjs          → crea la demo e imprime la URL
//   node scripts/demo-reveal.mjs cleanup  → borra todos los partidos de demo
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const VENUE_MARKER = 'DEMO reveal — borrar'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

if (process.argv[2] === 'cleanup') {
  const { data: demos, error } = await admin.from('matches').delete().eq('venue', VENUE_MARKER).select('id')
  if (error) { console.error('cleanup:', error.message); process.exit(1) }
  console.log(`${demos.length} partido(s) de demo borrado(s) (predicciones cascadean)`)
  process.exit(0)
}

// Dos equipos con jugadores (goleadores reales para que se vea lindo)
const { data: playerRows } = await admin.from('players').select('id, name, team_id, position').limit(1000)
const byTeam = new Map()
for (const p of playerRows) {
  if (!byTeam.has(p.team_id)) byTeam.set(p.team_id, [])
  byTeam.get(p.team_id).push(p)
}
const teamIds = [...byTeam.keys()].slice(0, 2)
const [homeTeamId, awayTeamId] = teamIds
const forwards = teamId => {
  const ps = byTeam.get(teamId)
  const fwd = ps.filter(p => p.position === 'FWD')
  return fwd.length > 0 ? fwd : ps
}

const { data: profiles } = await admin.from('profiles').select('id, username').limit(4)

const { data: match, error: matchErr } = await admin.from('matches').insert({
  home_team_id: homeTeamId,
  away_team_id: awayTeamId,
  match_date: new Date(Date.now() + 25 * 60000).toISOString(),
  stage: 'group',
  group_name: 'A',
  venue: VENUE_MARKER,
  status: 'upcoming',
}).select('id').single()
if (matchErr) { console.error('insert match:', matchErr.message); process.exit(1) }

// Apuestas variadas: 2-1, 1-1, 3-0; el último usuario queda sin apostar
const variants = [
  { winner: 'home', home: 2, away: 1, goals: 2, assists: 1 },
  { winner: 'draw', home: 1, away: 1, goals: 1, assists: 1 },
  { winner: 'home', home: 3, away: 0, goals: 3, assists: 0 },
]
const bettors = profiles.slice(0, Math.min(3, Math.max(1, profiles.length - 1)))

for (let i = 0; i < bettors.length; i++) {
  const v = variants[i % variants.length]
  const { data: pred, error: predErr } = await admin.from('predictions').insert({
    user_id: bettors[i].id, match_id: match.id,
    predicted_winner: v.winner, predicted_home_score: v.home, predicted_away_score: v.away,
  }).select('id').single()
  if (predErr) { console.error(`predicción de ${bettors[i].username}:`, predErr.message); continue }

  const homeFwd = forwards(homeTeamId)
  const awayFwd = forwards(awayTeamId)
  const rows = []
  for (let g = 0; g < v.goals; g++) {
    const pool = g < v.home ? homeFwd : awayFwd
    rows.push({ prediction_id: pred.id, player_id: pool[(i + g) % pool.length].id, event_type: 'goal' })
  }
  for (let a = 0; a < v.assists; a++) {
    rows.push({ prediction_id: pred.id, player_id: homeFwd[(i + a + 1) % homeFwd.length].id, event_type: 'assist' })
  }
  if (rows.length > 0) {
    const { error: ppErr } = await admin.from('prediction_players').insert(rows)
    if (ppErr) console.error(`goleadores de ${bettors[i].username}:`, ppErr.message)
  }
  console.log(`✓ ${bettors[i].username}: ${v.home}-${v.away}, ${v.goals} gol(es), ${v.assists} asist.`)
}

console.log(`\nDemo lista → http://localhost:3000/predict/${match.id}`)
console.log('Para borrarla: node scripts/demo-reveal.mjs cleanup')
