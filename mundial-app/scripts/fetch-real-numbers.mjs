// Cruza los dorsales reales de Wikipedia (2026 FIFA World Cup squads)
// con los jugadores de la BD y genera supabase/migration_real_shirt_numbers.sql
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'

const TEAM_CODE = {
  'Czech Republic': 'CZE', 'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR',
  'Bosnia and Herzegovina': 'BIH', 'Canada': 'CAN', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Haiti': 'HAI', 'Morocco': 'MAR', 'Scotland': 'SCO',
  'Australia': 'AUS', 'Paraguay': 'PAR', 'Turkey': 'TUR', 'United States': 'USA',
  'Curaçao': 'CUW', 'Ecuador': 'ECU', 'Germany': 'GER', 'Ivory Coast': 'CIV',
  'Japan': 'JPN', 'Netherlands': 'NED', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL',
  'Cape Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Spain': 'ESP', 'Uruguay': 'URU',
  'France': 'FRA', 'Iraq': 'IRQ', 'Norway': 'NOR', 'Senegal': 'SEN',
  'Algeria': 'ALG', 'Argentina': 'ARG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Colombia': 'COL', 'DR Congo': 'COD', 'Portugal': 'POR', 'Uzbekistan': 'UZB',
  'Croatia': 'CRO', 'England': 'ENG', 'Ghana': 'GHA', 'Panama': 'PAN',
}

const TRANSLIT = { 'ı': 'i', 'ø': 'o', 'Ø': 'o', 'đ': 'd', 'Đ': 'd', 'ß': 'ss', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'ł': 'l', 'Ł': 'l', 'ð': 'd', 'þ': 'th' }

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[ıøØđĐßæÆœłŁðþ]/g, c => TRANSLIT[c] ?? c)
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// 1) Wikipedia
const res = await fetch('https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads?action=raw', {
  headers: { 'User-Agent': 'MundialBets/1.0 (squad numbers sync)' },
})
const wiki = await res.text()
const wikiTeams = {}
let current = null
for (const line of wiki.split('\n')) {
  const h = line.match(/^===\s*([^=]+?)\s*===$/)
  if (h) { current = h[1].replace(/\[\[|\]\]/g, ''); continue }
  const m = line.match(/\{\{nat fs g player\s*\|(.*)\}\}/i)
  if (m && current) {
    const params = {}
    for (const part of m[1].split('|')) {
      const [k, ...rest] = part.split('=')
      if (rest.length) params[k.trim()] = rest.join('=').trim()
    }
    let name = params.name ?? ''
    const link = name.match(/\[\[([^\]|]*)\|?([^\]]*)\]\]/)
    if (link) name = link[2] || link[1]
    const no = parseInt(params.no)
    if (name && !isNaN(no)) {
      wikiTeams[current] ??= []
      wikiTeams[current].push({ name, no, norm: norm(name) })
    }
  }
}

// 2) BD
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: dbTeams } = await s.from('teams').select('id, code, name')
// Paginar: Supabase devuelve máximo 1000 filas por request
const dbPlayers = []
for (let from = 0; ; from += 1000) {
  const { data: page, error } = await s.from('players')
    .select('id, name, team_id')
    .order('id')
    .range(from, from + 999)
  if (error) { console.error(error.message); process.exit(1) }
  dbPlayers.push(...page)
  if (page.length < 1000) break
}
const teamByCode = Object.fromEntries(dbTeams.map(t => [t.code, t]))

// 3) Matching por equipo
const assignments = []   // { id, no, dbName, wikiName, code }
const misses = []
let dupConflicts = 0

function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

// Pasadas de matching, de más estricta a más laxa. Resolver primero
// TODOS los exactos evita que un fallback laxo "robe" la entrada de
// otro jugador (ej.: en nombres coreanos el apellido va primero y el
// último token coincide entre jugadores distintos).
const PASSES = [
  (pn, w) => w.norm === pn,                                          // exacto
  (pn, w) => {                                                       // tokens contenidos
    const pT = pn.split(' '), wT = w.norm.split(' ')
    return pT.every(t => wT.includes(t)) || wT.every(t => pT.includes(t))
  },
  (pn, w) => w.norm.split(' ').pop() === pn.split(' ').pop(),        // último token
  (pn, w) => lev(pn, w.norm) <= 2,                                   // typos/romanización
]

for (const [wikiName, code] of Object.entries(TEAM_CODE)) {
  const team = teamByCode[code]
  const squad = wikiTeams[wikiName]
  if (!team || !squad) { console.error(`equipo sin mapear: ${wikiName} → ${code}`); continue }
  let remaining = dbPlayers.filter(p => p.team_id === team.id)
  const usedWiki = new Set()
  const usedNo = new Set()

  for (const pass of PASSES) {
    const next = []
    for (const p of remaining) {
      const pn = norm(p.name)
      const cand = squad.filter(w => !usedWiki.has(w) && pass(pn, w))
      if (cand.length === 1 && !usedNo.has(cand[0].no)) {
        usedWiki.add(cand[0]); usedNo.add(cand[0].no)
        assignments.push({ id: p.id, no: cand[0].no, dbName: p.name, wikiName: cand[0].name, code })
      } else {
        next.push(p)
      }
    }
    remaining = next
  }
  for (const p of remaining) misses.push({ code, db: p.name, motivo: 'sin match' })
}

console.log(`matcheados: ${assignments.length}/${dbPlayers.length}`)
console.log(`sin match: ${misses.length} · conflictos de dorsal: ${dupConflicts}`)
for (const m of misses) console.log(`  [${m.code}] ${m.db} — ${m.motivo}`)

// 4) Generar SQL
const values = assignments.map(a => `  ('${a.id}'::uuid, ${a.no})`).join(',\n')
const sql = `-- ============================================================
-- MIGRACIÓN: Dorsales reales del Mundial 2026
-- Generado por scripts/fetch-real-numbers.mjs
-- Fuente: en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads
-- Cobertura: ${assignments.length}/${dbPlayers.length} jugadores matcheados por nombre.
-- Los no matcheados quedan sin dorsal (la UI muestra la inicial).
-- ============================================================

BEGIN;

-- limpiar primero para evitar choques con el índice único por equipo
UPDATE players SET shirt_number = NULL;

UPDATE players p
SET shirt_number = v.no
FROM (VALUES
${values}
) AS v(id, no)
WHERE p.id = v.id;

COMMIT;

-- Verificación: duplicados por equipo (debe devolver 0 filas)
SELECT t.name, p.shirt_number, COUNT(*)
FROM players p JOIN teams t ON t.id = p.team_id
WHERE p.shirt_number IS NOT NULL
GROUP BY t.name, p.shirt_number
HAVING COUNT(*) > 1;
`
writeFileSync('supabase/migration_real_shirt_numbers.sql', sql)
console.log('\nSQL → supabase/migration_real_shirt_numbers.sql')

// Muestra Argentina para control visual
console.log('\nArgentina:')
for (const a of assignments.filter(a => a.code === 'ARG').sort((x, y) => x.no - y.no)) {
  console.log(`  ${String(a.no).padStart(2)} ${a.dbName}${a.dbName !== a.wikiName ? `  (wiki: ${a.wikiName})` : ''}`)
}
