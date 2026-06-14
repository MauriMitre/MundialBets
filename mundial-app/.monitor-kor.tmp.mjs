// Chequeo puntual para el monitor del partido KOR-CZE (temporal, no commitear)
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: m, error } = await s.from('matches')
  .select('status, home_score, away_score, is_scored, match_date')
  .eq('api_fixture_id', 760414).single()
if (error) { console.log('ERROR consultando BD: ' + error.message); process.exit(0) }
const score = m.home_score !== null ? `${m.home_score}-${m.away_score}` : 'sin marcador'
if (m.is_scored) {
  const { count } = await s.from('match_events').select('id', { count: 'exact', head: true })
    .eq('match_id', (await s.from('matches').select('id').eq('api_fixture_id', 760414).single()).data.id)
  console.log(`SCORED: KOR-CZE finalizado ${score}, puntos calculados, ${count} eventos cargados`)
} else if (m.status === 'live') {
  console.log(`LIVE: KOR-CZE en vivo ${score}`)
} else if (m.status === 'finished') {
  console.log(`FINISHED-SIN-PUNTOS: KOR-CZE ${score} (status finished pero is_scored=false)`)
} else {
  const mins = Math.round((Date.now() - new Date(m.match_date).getTime()) / 60000)
  if (mins > 30) console.log(`ATENCION: arranco hace ${mins} min y sigue 'upcoming' — el cron no lo agarro`)
  else console.log(`PRE: upcoming (arranca ${-mins} min)`)
}
