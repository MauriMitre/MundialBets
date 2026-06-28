// Crea las filas de partidos de una ronda eliminatoria desde la API no
// oficial de ESPN (gratis, sin key). A diferencia de map-api-ids.mjs y
// del cron de sync-results —que solo ACTUALIZAN filas existentes— este
// script las CREA. Necesario porque la BD arranca solo con los 72
// partidos de grupos; las eliminatorias no existían como filas.
//
//   node scripts/load-knockout-espn.mjs                  → dry-run, round-of-32
//   node scripts/load-knockout-espn.mjs --apply          → crea los 16avos
//   node scripts/load-knockout-espn.mjs round-of-16 --apply
//
// Mapea equipos por teams.api_football_id (= id de equipo ESPN, ya
// seteado por map-api-ids.mjs en la fase de grupos). Salta cruces con
// equipos TBD (octavos+ hasta que terminen los 16avos). Idempotente:
// no duplica si ya existe una fila con ese api_fixture_id.
//
// El trigger set_betting_closes_at calcula betting_closes_at solo, así
// que no lo seteamos acá. Requiere migration_round_of_32.sql aplicada.
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

// ESPN season.slug → valor de matches.stage (CHECK constraint)
const SLUG_TO_STAGE = {
  'round-of-32': 'round_of_32',
  'round-of-16': 'round_of_16',
  'quarterfinals': 'quarter',
  'semifinals': 'semi',
  '3rd-place-match': 'third_place',
  'final': 'final',
}

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const slug = args.find(a => a !== '--apply') ?? 'round-of-32'
const stage = SLUG_TO_STAGE[slug]
if (!stage) {
  console.error(`slug desconocido: "${slug}". Opciones: ${Object.keys(SLUG_TO_STAGE).join(', ')}`)
  process.exit(1)
}

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: teams, error: teamErr } = await s.from('teams').select('id, code, name, api_football_id')
if (teamErr) { console.error(teamErr.message); process.exit(1) }
const byEspn = new Map(teams.filter(t => t.api_football_id).map(t => [String(t.api_football_id), t]))
const byCode = new Map(teams.map(t => [t.code, t]))

const { data: existing, error: exErr } = await s.from('matches').select('api_fixture_id')
if (exErr) { console.error(exErr.message); process.exit(1) }
const haveFixture = new Set(existing.map(m => m.api_fixture_id).filter(Boolean))

const res = await fetch(`${SCOREBOARD}?dates=20260611-20260719&limit=300`)
if (!res.ok) { console.error(`ESPN scoreboard: HTTP ${res.status}`); process.exit(1) }
const board = await res.json()
const events = (board?.events ?? []).filter(ev => ev.season?.slug === slug)
console.log(`Ronda "${slug}" → stage "${stage}": ${events.length} eventos en ESPN\n`)

const rows = []
let skippedTbd = 0, skippedExists = 0
for (const ev of events) {
  const comp = ev.competitions?.[0]
  if (!comp) continue
  const espnId = parseInt(ev.id)
  if (haveFixture.has(espnId)) { skippedExists++; continue }

  const h = comp.competitors?.find(c => c.homeAway === 'home')
  const a = comp.competitors?.find(c => c.homeAway === 'away')
  const resolve = c => byEspn.get(String(c?.team?.id)) ?? byCode.get(c?.team?.abbreviation) ?? null
  const hdb = resolve(h)
  const adb = resolve(a)
  if (!hdb || !adb) {
    skippedTbd++
    console.log(`  ⏭  TBD: ${h?.team?.abbreviation ?? '??'} vs ${a?.team?.abbreviation ?? '??'} (${ev.date})`)
    continue
  }

  rows.push({
    home_team_id: hdb.id,
    away_team_id: adb.id,
    match_date: new Date(ev.date).toISOString(),
    stage,
    group_name: null,
    venue: comp.venue?.fullName ?? null,
    status: 'upcoming',
    api_fixture_id: espnId,
  })
  console.log(`  ✓  ${hdb.code} vs ${adb.code}  ${ev.date}  @ ${comp.venue?.fullName ?? '(sin venue)'}  [${espnId}]`)
}

console.log(`\nA crear: ${rows.length} · ya existían: ${skippedExists} · TBD salteados: ${skippedTbd}`)

if (!APPLY) {
  console.log('\nDRY-RUN: no se escribió nada. Ejecutar con --apply para crear las filas.')
  process.exit(0)
}
if (rows.length === 0) { console.log('Nada para insertar.'); process.exit(0) }

const { error: insErr } = await s.from('matches').insert(rows)
if (insErr) { console.error(`INSERT falló: ${insErr.message}`); process.exit(1) }
console.log(`\n✅ APLICADO: ${rows.length} partidos creados. El cron de sync-results los levantará en vivo.`)
