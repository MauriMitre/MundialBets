// Verifica la sección "Las apuestas de todos" en /predict/[matchId]:
// crea un partido de prueba con apuestas YA cerradas (match_date en +25min
// ⇒ betting_closes_at hace 5min, sin adelantar el MIN(match_date) del
// torneo), predicciones de dos usuarios vía service role, y chequea el
// HTML servido. Limpia todo al final (delete del match cascadea).
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const PORT = process.env.PORT ?? '3000'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const ref = new URL(url).hostname.split('.')[0]
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })

const { data: auth, error: loginErr } = await anon.auth.signInWithPassword({ email: 'mauroadmin@mundial.app', password: 'admin2026' })
if (loginErr) { console.error('login:', loginErr.message); process.exit(1) }
const adminUserId = auth.user.id
const raw = 'base64-' + Buffer.from(JSON.stringify(auth.session)).toString('base64url')
const CHUNK = 3180
const cookieName = `sb-${ref}-auth-token`
const cookieList = raw.length <= CHUNK
  ? [[cookieName, raw]]
  : Array.from({ length: Math.ceil(raw.length / CHUNK) }, (_, i) => [`${cookieName}.${i}`, raw.slice(i * CHUNK, (i + 1) * CHUNK)])
const cookieHeader = cookieList.map(([n, v]) => `${n}=${v}`).join('; ')

let failures = 0
function check(label, ok, extra = '') {
  console.log(`${ok ? '✓' : '✗ FALLO'} ${label}${extra ? ' — ' + extra : ''}`)
  if (!ok) failures++
}

// ── Setup: dos equipos con jugadores, perfiles, partido cerrado ──
const { data: playerRows } = await admin.from('players').select('id, name, team_id').limit(1000)
const byTeam = new Map()
for (const p of playerRows) {
  if (!byTeam.has(p.team_id)) byTeam.set(p.team_id, [])
  byTeam.get(p.team_id).push(p)
}
const teamIds = [...byTeam.keys()].slice(0, 2)
if (teamIds.length < 2) { console.error('no hay dos equipos con jugadores'); process.exit(1) }
const [homeTeamId, awayTeamId] = teamIds

const { data: profiles } = await admin.from('profiles').select('id, username, display_name').limit(3)
const otherUser = profiles.find(p => p.id !== adminUserId)
const thirdUser = profiles.find(p => p.id !== adminUserId && p.id !== otherUser?.id)
if (!otherUser) { console.error('hace falta al menos un usuario además del admin'); process.exit(1) }

const { data: match, error: matchErr } = await admin.from('matches').insert({
  home_team_id: homeTeamId,
  away_team_id: awayTeamId,
  match_date: new Date(Date.now() + 25 * 60000).toISOString(),
  stage: 'group',
  group_name: 'A',
  venue: 'TEST reveal — borrar',
  status: 'upcoming',
}).select('id, betting_closes_at').single()
if (matchErr) { console.error('insert match:', matchErr.message); process.exit(1) }
check('partido de prueba con apuestas cerradas', new Date(match.betting_closes_at) < new Date())

let exitCode = 1
try {
  // Predicción del admin: 3-1 home
  const { error: e1 } = await admin.from('predictions').insert({
    user_id: adminUserId, match_id: match.id,
    predicted_winner: 'home', predicted_home_score: 3, predicted_away_score: 1,
  })
  check('predicción admin insertada', !e1, e1?.message)

  // Predicción del otro usuario: 1-1 con un goleador
  const { data: predOther, error: e2 } = await admin.from('predictions').insert({
    user_id: otherUser.id, match_id: match.id,
    predicted_winner: 'draw', predicted_home_score: 1, predicted_away_score: 1,
  }).select('id').single()
  check('predicción de otro usuario insertada', !e2, e2?.message)

  const scorer = byTeam.get(homeTeamId)[0]
  const { error: e3 } = await admin.from('prediction_players').insert({
    prediction_id: predOther.id, player_id: scorer.id, event_type: 'goal',
  })
  check('goleador del otro usuario insertado', !e3, e3?.message)

  // ── Página: debe revelar las apuestas de todos ──
  const res = await fetch(`http://localhost:${PORT}/predict/${match.id}`, { headers: { Cookie: cookieHeader } })
  // React intercala <!-- --> entre nodos de texto adyacentes en el SSR
  const html = res.status === 200 ? (await res.text()).replaceAll('<!-- -->', '') : ''
  check('GET /predict/[matchId]', res.status === 200, `status ${res.status}`)
  check('sección "Las apuestas de todos"', html.includes('Las apuestas de todos'))
  check('muestra la apuesta ajena (1 - 1)', html.includes('1 - 1'))
  check('muestra el nombre del otro usuario', html.includes(otherUser.display_name || otherUser.username))
  check('muestra el goleador apostado por otro', html.includes(scorer.name))
  check('marca "(vos)" en la fila propia', html.includes('(vos)'))
  if (thirdUser) {
    check('usuario sin apuesta aparece como "no apostó"', html.includes('no apostó') && html.includes(thirdUser.display_name || thirdUser.username))
  }

  // ── Contraprueba: con apuestas abiertas NO se revela nada ──
  const { data: openMatch } = await admin.from('matches')
    .select('id').eq('status', 'upcoming')
    .gt('betting_closes_at', new Date().toISOString())
    .order('match_date').limit(1).maybeSingle()
  if (openMatch) {
    const resOpen = await fetch(`http://localhost:${PORT}/predict/${openMatch.id}`, { headers: { Cookie: cookieHeader } })
    const htmlOpen = resOpen.status === 200 ? await resOpen.text() : ''
    check('con apuestas abiertas no aparece la sección', resOpen.status === 200 && !htmlOpen.includes('Las apuestas de todos'), `status ${resOpen.status}`)
  }

  exitCode = failures === 0 ? 0 : 1
} finally {
  // Cleanup: borrar el match cascadea predictions y prediction_players
  const { error: delErr } = await admin.from('matches').delete().eq('id', match.id)
  console.log(delErr ? `✗ CLEANUP FALLÓ: ${delErr.message} — borrar match ${match.id} a mano` : '(partido de prueba borrado)')
  if (delErr) exitCode = 1
}

console.log(exitCode === 0 ? '\nTODO OK' : `\n${failures} FALLOS`)
process.exit(exitCode)
