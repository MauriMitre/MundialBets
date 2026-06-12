// Mapea la BD contra los IDs de la API no oficial de ESPN (gratis, sin
// key). Una sola request al scoreboard de todo el torneo:
//   - teams.api_football_id   ← id de equipo de ESPN (columna reutilizada)
//   - matches.api_fixture_id  ← id de evento de ESPN
// Los jugadores no necesitan mapeo: ESPN da nombres completos y el sync
// los matchea contra los planteles oficiales (src/lib/nameMatch.ts).
//
//   node scripts/map-api-ids.mjs           → dry-run
//   node scripts/map-api-ids.mjs --apply   → escribe en la BD
//
// Idempotente. Re-ejecutar cuando se definan los cruces de
// eliminatorias (ESPN tiene los equipos TBD hasta que terminen los
// grupos). Requiere migration_auto_results.sql aplicada (columnas).
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Abreviaturas de ESPN que no coinciden con los códigos de la BD
const ESPN_ABBR_TO_CODE = {
  'CZE': 'CZE', // Czechia
  // completar si el dry-run reporta no mapeadas
}

const res = await fetch(`${SCOREBOARD}?dates=20260611-20260719&limit=300`)
if (!res.ok) { console.error(`ESPN scoreboard: HTTP ${res.status}`); process.exit(1) }
const board = await res.json()
const events = board?.events ?? []
console.log(`Eventos de ESPN: ${events.length}`)

const { data: dbTeams } = await s.from('teams').select('id, code, name, api_football_id')
const { data: dbMatches } = await s.from('matches')
  .select('id, home_team_id, away_team_id, match_date, api_fixture_id')
const dbTeamById = new Map(dbTeams.map(t => [t.id, t]))

const teamUpdates = new Map()  // db team id → espn team id
const matchUpdates = []
const unmatchedAbbr = new Set()
let tbd = 0

for (const ev of events) {
  const comp = ev.competitions?.[0]
  if (!comp) continue
  const home = comp.competitors?.find(c => c.homeAway === 'home')
  const away = comp.competitors?.find(c => c.homeAway === 'away')
  const findDb = c => {
    const abbr = c?.team?.abbreviation
    if (!abbr || abbr === 'TBD') return null
    const code = ESPN_ABBR_TO_CODE[abbr] ?? abbr
    return dbTeams.find(t => t.code === code) ?? null
  }
  const homeDb = findDb(home)
  const awayDb = findDb(away)
  for (const [c, db] of [[home, homeDb], [away, awayDb]]) {
    const abbr = c?.team?.abbreviation
    if (!db && abbr && abbr !== 'TBD') unmatchedAbbr.add(abbr)
    if (db && c?.team?.id) teamUpdates.set(db.id, parseInt(c.team.id))
  }
  if (!homeDb || !awayDb) { tbd++; continue }

  const kickoff = new Date(ev.date).getTime()
  const dbMatch = dbMatches.find(m =>
    m.home_team_id === homeDb.id && m.away_team_id === awayDb.id &&
    Math.abs(new Date(m.match_date).getTime() - kickoff) < 24 * 3600_000
  )
  if (!dbMatch) {
    console.error(`⚠ evento ESPN sin partido en BD: ${homeDb.code} vs ${awayDb.code} ${ev.date}`)
    continue
  }
  if (dbMatch.api_fixture_id !== parseInt(ev.id)) {
    matchUpdates.push({ id: dbMatch.id, espn: parseInt(ev.id), label: `${homeDb.code} vs ${awayDb.code} ${ev.date}` })
  }
}

const teamWrites = [...teamUpdates].filter(([dbId, espnId]) => dbTeamById.get(dbId)?.api_football_id !== espnId)
console.log(`Equipos: ${teamUpdates.size} vistos, ${teamWrites.length} para actualizar`)
console.log(`Partidos: ${matchUpdates.length} para actualizar · ${tbd} con equipos TBD (normal antes de eliminatorias)`)
if (unmatchedAbbr.size > 0) {
  console.error(`⚠ Abreviaturas ESPN sin código en BD (agregar a ESPN_ABBR_TO_CODE): ${[...unmatchedAbbr].join(', ')}`)
}
for (const m of matchUpdates) console.log(`  ${m.label} → ${m.espn}`)

if (!APPLY) {
  console.log('\nDRY-RUN: no se escribió nada. Ejecutar con --apply para aplicar.')
  process.exit(0)
}

for (const [dbId, espnId] of teamWrites) {
  const { error } = await s.from('teams').update({ api_football_id: espnId }).eq('id', dbId)
  if (error) { console.error(`team ${dbTeamById.get(dbId)?.code}: ${error.message}`); process.exit(1) }
}
for (const m of matchUpdates) {
  const { error } = await s.from('matches').update({ api_fixture_id: m.espn }).eq('id', m.id)
  if (error) { console.error(`match ${m.label}: ${error.message}`); process.exit(1) }
}
console.log(`\nAPLICADO: ${teamWrites.length} equipos, ${matchUpdates.length} partidos.`)
