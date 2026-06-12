// Sincroniza los planteles de la BD con los oficiales de Wikipedia
// (2026 FIFA World Cup squads, 26 jugadores por selección):
//
//   - RENOMBRA jugadores que están con otra romanización/apodo
//     (mismo id → las apuestas existentes siguen apuntando bien).
//   - INSERTA los jugadores del plantel oficial que faltan en la BD
//     (con posición y dorsal reales).
//   - DESACTIVA (is_active=false) los jugadores de la BD que no están
//     en el plantel oficial. NO se borran: las apuestas existentes
//     sobre ellos quedan (nunca sumarán puntos porque no tendrán
//     eventos) y el historial no se toca.
//   - REACTIVA jugadores inactivos que sí están en el plantel.
//
//   node scripts/sync-squads.mjs            → dry-run (solo muestra el diff)
//   node scripts/sync-squads.mjs --apply    → aplica los cambios
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

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

const POS_MAP = { GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'FWD' }

const TRANSLIT = { 'ı': 'i', 'ø': 'o', 'Ø': 'o', 'đ': 'd', 'Đ': 'd', 'ß': 'ss', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'ł': 'l', 'Ł': 'l', 'ð': 'd', 'þ': 'th' }

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
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

// Mismo jugador con romanización/apodo distinto entre la BD y Wikipedia:
// se RENOMBRA (conserva el id → las apuestas existentes siguen válidas)
// en vez de baja+alta. Clave: código de equipo + nombre normalizado BD,
// valor: nombre normalizado wiki.
const ALIAS = {
  'BRA:vinicius jr': 'vinicius junior',
  'HAI:carl fred sainthe': 'carl sainte',
  'MAR:munir el kajoui': 'munir mohamedi',
  'PAR:alejandro romero': 'kaku',
  'IRN:hossein kanaani': 'hossein kanaanizadegan',
  'COD:elia meshack': 'meschak elia',
  'JPN:ito suzuki': 'yuito suzuki',
  'QAT:hashmi hussein': 'al hashmi al hussain',
  'QAT:homam al amin': 'homam ahmed',
  'QAT:youssef abdulrazzaq': 'yusuf abdurisag',
  'QAT:ayoub alawi': 'ayoub al oui',
  'QAT:ahmed alaa': 'ahmed alaaeldin',
}

// Mismas pasadas que fetch-real-numbers.mjs: de estricta a laxa
const PASSES = [
  (pn, w) => w.norm === pn,
  (pn, w) => {
    const pT = pn.split(' '), wT = w.norm.split(' ')
    return pT.every(t => wT.includes(t)) || wT.every(t => pT.includes(t))
  },
  (pn, w) => w.norm.split(' ').pop() === pn.split(' ').pop(),
  (pn, w) => lev(pn, w.norm) <= 2,
]

// ── 1. Wikipedia ─────────────────────────────────────────
const res = await fetch('https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads?action=raw', {
  headers: { 'User-Agent': 'MundialBets/1.0 (squad sync)' },
})
const wiki = await res.text()
const wikiTeams = {}
let current = null
for (const line of wiki.split('\n')) {
  const h = line.match(/^===\s*([^=]+?)\s*===$/)
  if (h) { current = h[1].replace(/\[\[|\]\]/g, ''); continue }
  const m = line.match(/\{\{nat fs g player\s*\|(.*)\}\}/i)
  if (m && current) {
    // Colapsar wikilinks con pipe ([[Página|Texto]] → [[Texto]]) ANTES
    // de separar los parámetros del template por |, si no el link se
    // parte en dos y el nombre queda como "[[Página (desambiguación)"
    const raw = m[1].replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '[[$2]]')
    const params = {}
    for (const part of raw.split('|')) {
      const [k, ...rest] = part.split('=')
      if (rest.length) params[k.trim()] = rest.join('=').trim()
    }
    let name = params.name ?? ''
    const link = name.match(/\[\[([^\]|]*)\|?([^\]]*)\]\]/)
    if (link) name = link[2] || link[1]
    const no = parseInt(params.no)
    const pos = POS_MAP[(params.pos ?? '').toUpperCase()] ?? null
    if (name) {
      wikiTeams[current] ??= []
      wikiTeams[current].push({ name, no: isNaN(no) ? null : no, pos, norm: norm(name) })
    }
  }
}

// ── 2. BD ────────────────────────────────────────────────
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: dbTeams } = await s.from('teams').select('id, code, name')
const dbPlayers = []
for (let from = 0; ; from += 1000) {
  const { data: page, error } = await s.from('players')
    .select('id, name, team_id, position, shirt_number, is_active')
    .order('id')
    .range(from, from + 999)
  if (error) { console.error(error.message); process.exit(1) }
  dbPlayers.push(...page)
  if (page.length < 1000) break
}
const teamByCode = Object.fromEntries(dbTeams.map(t => [t.code, t]))

// ── 3. Diff por equipo ───────────────────────────────────
const toInsert = []      // jugadores de wiki sin fila en BD
const toDeactivate = []  // jugadores de BD fuera del plantel oficial
const toReactivate = []  // inactivos que sí están en el plantel
const toRename = []      // mismo jugador con otro nombre (alias)

for (const [wikiName, code] of Object.entries(TEAM_CODE)) {
  const team = teamByCode[code]
  const squad = wikiTeams[wikiName]
  if (!team) { console.error(`⚠ equipo no está en BD: ${wikiName} (${code})`); continue }
  if (!squad || squad.length < 20) {
    console.error(`⚠ plantel wiki incompleto para ${wikiName} (${squad?.length ?? 0} jugadores) — equipo salteado`)
    continue
  }

  let remaining = dbPlayers.filter(p => p.team_id === team.id)
  const usedWiki = new Set()

  // Alias manuales PRIMERO: si quedan para el final, una pasada laxa
  // puede robarle la entrada wiki al jugador aliasado (p. ej. otro
  // homónimo de apellido se lleva el match por "último token")
  {
    const next = []
    for (const p of remaining) {
      const target = ALIAS[`${code}:${norm(p.name)}`]
      const w = target ? squad.find(w => !usedWiki.has(w) && w.norm === target) : null
      if (w) {
        usedWiki.add(w)
        toRename.push({ id: p.id, code, oldName: p.name, name: w.name, position: w.pos, shirt_number: w.no, wasActive: p.is_active })
      } else {
        next.push(p)
      }
    }
    remaining = next
  }

  for (const [passIdx, pass] of PASSES.entries()) {
    const next = []
    for (const p of remaining) {
      const pn = norm(p.name)
      const cand = squad.filter(w => !usedWiki.has(w) && pass(pn, w))
      // Con match EXACTO los homónimos son intercambiables (los dos
      // Danilo/Éderson de Brasil): tomar el primero. En pasadas laxas
      // varios candidatos = ambigüedad real (Zion/Junnosuke Suzuki
      // comparten apellido): no matchear.
      if (cand.length === 1 || (cand.length > 1 && passIdx === 0)) {
        usedWiki.add(cand[0])
        if (!p.is_active) toReactivate.push({ ...p, code })
      } else {
        next.push(p)
      }
    }
    remaining = next
  }

  // BD sin match en plantel oficial → desactivar
  for (const p of remaining) {
    if (p.is_active) toDeactivate.push({ ...p, code })
  }
  // Wiki sin match en BD → insertar
  for (const w of squad) {
    if (!usedWiki.has(w)) {
      toInsert.push({
        name: w.name, team_id: team.id, position: w.pos,
        shirt_number: w.no, code,
      })
    }
  }
}

// ── 4. Impacto en apuestas existentes ────────────────────
const deactivateIds = toDeactivate.map(p => p.id)
let affectedBets = []
if (deactivateIds.length > 0) {
  const { data: pp } = await s.from('prediction_players')
    .select('player_id, prediction:prediction_id ( user:user_id ( username ) )')
    .in('player_id', deactivateIds)
  affectedBets = pp ?? []
}
let affectedTournament = []
if (deactivateIds.length > 0) {
  const { data: tp } = await s.from('tournament_predictions')
    .select('top_scorer_player_id, user:user_id ( username )')
    .in('top_scorer_player_id', deactivateIds)
  affectedTournament = tp ?? []
}

// ── 5. Reporte ───────────────────────────────────────────
console.log(`\n══ ALTAS (en plantel oficial, faltan en BD): ${toInsert.length} ══`)
const byCode = (arr) => arr.reduce((m, x) => { (m[x.code] ??= []).push(x); return m }, {})
for (const [code, list] of Object.entries(byCode(toInsert))) {
  console.log(`  [${code}] ${list.map(p => `${p.name}${p.shirt_number ? ` #${p.shirt_number}` : ''}${p.position ? ` (${p.position})` : ''}`).join(', ')}`)
}
console.log(`\n══ RENOMBRES (mismo jugador, conserva apuestas): ${toRename.length} ══`)
for (const [code, list] of Object.entries(byCode(toRename))) {
  console.log(`  [${code}] ${list.map(p => `${p.oldName} → ${p.name}`).join(', ')}`)
}
console.log(`\n══ BAJAS (en BD, fuera del plantel → is_active=false): ${toDeactivate.length} ══`)
for (const [code, list] of Object.entries(byCode(toDeactivate))) {
  console.log(`  [${code}] ${list.map(p => p.name).join(', ')}`)
}
if (toReactivate.length > 0) {
  console.log(`\n══ REACTIVAR (inactivos que sí están en el plantel): ${toReactivate.length} ══`)
  for (const [code, list] of Object.entries(byCode(toReactivate))) {
    console.log(`  [${code}] ${list.map(p => p.name).join(', ')}`)
  }
}

const nameById = Object.fromEntries(toDeactivate.map(p => [p.id, p.name]))
if (affectedBets.length > 0) {
  console.log(`\n══ Apuestas existentes sobre jugadores a desactivar: ${affectedBets.length} ══`)
  for (const b of affectedBets) {
    console.log(`  ${b.prediction?.user?.username ?? '?'} → ${nameById[b.player_id]}`)
  }
  console.log('  (se conservan: no suman puntos porque el jugador no tendrá eventos)')
}
if (affectedTournament.length > 0) {
  console.log(`\n══ Botín de Oro apostado a jugadores a desactivar: ${affectedTournament.length} ══`)
  for (const t of affectedTournament) {
    console.log(`  ${t.user?.username ?? '?'} → ${nameById[t.top_scorer_player_id]}`)
  }
}

// ── 6. Aplicar ───────────────────────────────────────────
if (!APPLY) {
  console.log('\nDRY-RUN: no se cambió nada. Ejecutar con --apply para aplicar.')
  process.exit(0)
}

if (toDeactivate.length > 0) {
  const { error } = await s.from('players').update({ is_active: false }).in('id', deactivateIds)
  if (error) { console.error('desactivar:', error.message); process.exit(1) }
}
if (toReactivate.length > 0) {
  const { error } = await s.from('players').update({ is_active: true }).in('id', toReactivate.map(p => p.id))
  if (error) { console.error('reactivar:', error.message); process.exit(1) }
}

// Evitar choque de dorsal con filas existentes del mismo equipo
// (p. ej. un desactivado que conserva el número): liberar primero
const teamIdByPlayerId = Object.fromEntries(dbPlayers.map(p => [p.id, p.team_id]))
const taken = new Map()
for (const p of dbPlayers) {
  if (p.shirt_number !== null) taken.set(`${p.team_id}:${p.shirt_number}`, p)
}
async function freeNumber(teamId, no, selfId, forName) {
  const holder = no !== null ? taken.get(`${teamId}:${no}`) : null
  if (holder && holder.id !== selfId) {
    const { error } = await s.from('players').update({ shirt_number: null }).eq('id', holder.id)
    if (error) { console.error(`liberar dorsal de ${holder.name}:`, error.message); process.exit(1) }
    taken.delete(`${teamId}:${no}`)
    console.log(`  (dorsal #${no} liberado de ${holder.name} para ${forName})`)
  }
}

for (const r of toRename) {
  await freeNumber(teamIdByPlayerId[r.id], r.shirt_number, r.id, r.name)
  const { error } = await s.from('players').update({
    name: r.name,
    position: r.position ?? undefined,
    shirt_number: r.shirt_number,
    is_active: true,
  }).eq('id', r.id)
  if (error) { console.error(`renombrar ${r.oldName}:`, error.message); process.exit(1) }
}

if (toInsert.length > 0) {
  for (const ins of toInsert) {
    await freeNumber(ins.team_id, ins.shirt_number, null, ins.name)
  }
  const rows = toInsert.map(({ name, team_id, position, shirt_number }) =>
    ({ name, team_id, position, shirt_number, is_active: true }))
  const { error } = await s.from('players').insert(rows)
  if (error) { console.error('insertar:', error.message); process.exit(1) }
}
console.log(`\nAPLICADO: +${toInsert.length} altas, ${toRename.length} renombres, ${toDeactivate.length} bajas, ${toReactivate.length} reactivados.`)
