// Mapea la BD contra los IDs de API-Football (Mundial 2026: league=1):
//   - teams.api_football_id    (1 request)
//   - matches.api_fixture_id   (1 request)
//   - players.api_football_id  (48 requests, una por plantel)
// Total ~50 requests del plan gratis (100/día). Idempotente: solo
// escribe lo que falta mapear. Re-ejecutar cuando se definan los
// cruces de eliminatorias (la API tiene los equipos TBD hasta que
// termine la fase de grupos).
//
//   node scripts/map-api-ids.mjs           → dry-run
//   node scripts/map-api-ids.mjs --apply   → escribe en la BD
//
// Requiere API_FOOTBALL_KEY en .env (gratis en dashboard.api-football.com)
// y la migración migration_auto_results.sql aplicada (columnas).
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const API = 'https://v3.football.api-sports.io'
const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) { console.error('Falta API_FOOTBALL_KEY en .env'); process.exit(1) }

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

let requests = 0
async function api(path) {
  requests++
  const res = await fetch(`${API}${path}`, { headers: { 'x-apisports-key': KEY } })
  const body = await res.json()
  const errs = body?.errors
  if (!res.ok || (errs && !Array.isArray(errs) && Object.keys(errs).length > 0)) {
    console.error(`API ${path}:`, JSON.stringify(errs ?? res.status))
    process.exit(1)
  }
  return body.response ?? []
}

// Nombres de la API (inglés) → código de la BD, para cuando el code
// de la API no coincida con el nuestro
const API_NAME_TO_CODE = {
  'Czech Republic': 'CZE', 'Mexico': 'MEX', 'South Africa': 'RSA',
  'South Korea': 'KOR', 'Korea Republic': 'KOR',
  'Bosnia and Herzegovina': 'BIH', 'Bosnia & Herzegovina': 'BIH',
  'Canada': 'CAN', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Haiti': 'HAI', 'Morocco': 'MAR', 'Scotland': 'SCO',
  'Australia': 'AUS', 'Paraguay': 'PAR', 'Turkey': 'TUR', 'Türkiye': 'TUR',
  'USA': 'USA', 'United States': 'USA',
  'Curacao': 'CUW', 'Curaçao': 'CUW', 'Ecuador': 'ECU', 'Germany': 'GER',
  'Ivory Coast': 'CIV', "Côte d'Ivoire": 'CIV',
  'Japan': 'JPN', 'Netherlands': 'NED', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL',
  'Cape Verde': 'CPV', 'Cape Verde Islands': 'CPV',
  'Saudi Arabia': 'KSA', 'Spain': 'ESP', 'Uruguay': 'URU',
  'France': 'FRA', 'Iraq': 'IRQ', 'Norway': 'NOR', 'Senegal': 'SEN',
  'Algeria': 'ALG', 'Argentina': 'ARG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Colombia': 'COL', 'DR Congo': 'COD', 'Congo DR': 'COD',
  'Portugal': 'POR', 'Uzbekistan': 'UZB',
  'Croatia': 'CRO', 'England': 'ENG', 'Ghana': 'GHA', 'Panama': 'PAN',
}

const TRANSLIT = { 'ı': 'i', 'ø': 'o', 'Ø': 'o', 'đ': 'd', 'Đ': 'd', 'ß': 'ss', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'ł': 'l', 'Ł': 'l', 'ð': 'd', 'þ': 'th' }
function norm(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[ıøØđĐßæÆœłŁðþ]/g, c => TRANSLIT[c] ?? c)
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}
function matchByName(apiName, candidates) {
  const t = norm(apiName)
  const tT = t.split(' ')
  const passes = [
    cn => cn === t,
    cn => { const cT = cn.split(' '); return tT.every(x => cT.includes(x)) || cT.every(x => tT.includes(x)) },
    cn => { if (tT.length < 2 || tT[0].length > 1) return false; const cT = cn.split(' '); return cT[0]?.startsWith(tT[0]) && tT.slice(1).every(x => cT.includes(x)) },
    cn => cn.split(' ').pop() === tT[tT.length - 1],
    cn => lev(cn, t) <= 2,
  ]
  for (const pass of passes) {
    const found = candidates.filter(c => pass(norm(c.name)))
    if (found.length === 1) return found[0]
  }
  return null
}

// ── 1. Equipos ────────────────────────────────────────────
const { data: dbTeams } = await s.from('teams').select('id, code, name, api_football_id')
const apiTeams = await api('/teams?league=1&season=2026')
const teamUpdates = []
const teamByApiId = new Map()
for (const { team } of apiTeams) {
  const byCode = dbTeams.find(t => t.code === team.code)
  const byName = API_NAME_TO_CODE[team.name]
    ? dbTeams.find(t => t.code === API_NAME_TO_CODE[team.name])
    : null
  const db = byCode ?? byName
  if (!db) { console.error(`⚠ equipo API sin match en BD: ${team.name} (${team.code})`); continue }
  teamByApiId.set(team.id, db)
  if (db.api_football_id !== team.id) teamUpdates.push({ id: db.id, api: team.id, name: db.name, apiName: team.name })
}
console.log(`Equipos: ${teamByApiId.size}/${dbTeams.length} mapeados, ${teamUpdates.length} para actualizar`)

// ── 2. Partidos ───────────────────────────────────────────
const { data: dbMatches } = await s.from('matches')
  .select('id, home_team_id, away_team_id, match_date, api_fixture_id')
const dbTeamApiId = new Map([...teamByApiId.entries()].map(([apiId, db]) => [db.id, apiId]))
const fixtures = await api('/fixtures?league=1&season=2026')
const matchUpdates = []
let unpairedFixtures = 0
for (const fx of fixtures) {
  const homeDb = teamByApiId.get(fx.teams?.home?.id)
  const awayDb = teamByApiId.get(fx.teams?.away?.id)
  if (!homeDb || !awayDb) { unpairedFixtures++; continue } // TBD (eliminatorias sin definir)
  const kickoff = new Date(fx.fixture.date).getTime()
  const db = dbMatches.find(m =>
    m.home_team_id === homeDb.id && m.away_team_id === awayDb.id &&
    Math.abs(new Date(m.match_date).getTime() - kickoff) < 24 * 3600_000
  )
  if (!db) { console.error(`⚠ fixture API sin partido en BD: ${fx.teams.home.name} vs ${fx.teams.away.name} ${fx.fixture.date}`); continue }
  if (db.api_fixture_id !== fx.fixture.id) matchUpdates.push({ id: db.id, api: fx.fixture.id, label: `${fx.teams.home.name} vs ${fx.teams.away.name}` })
}
console.log(`Partidos: ${matchUpdates.length} para actualizar · ${unpairedFixtures} fixtures TBD (normal antes de eliminatorias)`)

// ── 3. Jugadores (por equipo, match por dorsal y nombre) ──
const dbPlayers = []
for (let from = 0; ; from += 1000) {
  const { data: page, error } = await s.from('players')
    .select('id, name, team_id, shirt_number, is_active, api_football_id')
    .order('id').range(from, from + 999)
  if (error) { console.error(error.message); process.exit(1) }
  dbPlayers.push(...page)
  if (page.length < 1000) break
}
const playerUpdates = []
const playerMisses = []
for (const [apiTeamId, dbTeam] of teamByApiId) {
  const squads = await api(`/players/squads?team=${apiTeamId}`)
  const apiPlayers = squads[0]?.players ?? []
  const roster = dbPlayers.filter(p => p.team_id === dbTeam.id)
  const used = new Set()
  for (const ap of apiPlayers) {
    // 1º por dorsal (oficiales, sincronizados desde Wikipedia)
    let db = ap.number != null
      ? roster.find(p => p.is_active && p.shirt_number === ap.number && !used.has(p.id))
      : null
    // si el nombre no se parece en nada, no confiar solo en el dorsal
    if (db && !matchByName(ap.name, [db])) {
      const byName = matchByName(ap.name, roster.filter(p => !used.has(p.id)))
      if (byName) db = byName
    }
    if (!db) db = matchByName(ap.name, roster.filter(p => !used.has(p.id)))
    if (!db) { playerMisses.push(`[${dbTeam.code}] ${ap.name} #${ap.number ?? '?'}`); continue }
    used.add(db.id)
    if (db.api_football_id !== ap.id) playerUpdates.push({ id: db.id, api: ap.id, name: db.name })
  }
}
console.log(`Jugadores: ${playerUpdates.length} para actualizar · ${playerMisses.length} sin match`)
for (const m of playerMisses) console.log(`  ⚠ ${m}`)
console.log(`\nRequests usadas: ${requests}`)

if (!APPLY) {
  console.log('\nDRY-RUN: no se escribió nada. Ejecutar con --apply para aplicar.')
  process.exit(0)
}

for (const u of teamUpdates) {
  const { error } = await s.from('teams').update({ api_football_id: u.api }).eq('id', u.id)
  if (error) { console.error(`team ${u.name}: ${error.message}`); process.exit(1) }
}
for (const u of matchUpdates) {
  const { error } = await s.from('matches').update({ api_fixture_id: u.api }).eq('id', u.id)
  if (error) { console.error(`match ${u.label}: ${error.message}`); process.exit(1) }
}
for (const u of playerUpdates) {
  const { error } = await s.from('players').update({ api_football_id: u.api }).eq('id', u.id)
  if (error) { console.error(`player ${u.name}: ${error.message}`); process.exit(1) }
}
console.log(`\nAPLICADO: ${teamUpdates.length} equipos, ${matchUpdates.length} partidos, ${playerUpdates.length} jugadores.`)
