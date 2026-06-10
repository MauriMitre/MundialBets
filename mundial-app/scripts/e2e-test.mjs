// E2E: smoke test de páginas + flujo completo de predicción en mobile.
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.env.PORT ?? '3000'
const DEBUG_PORT = 9224
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const ref = new URL(url).hostname.split('.')[0]
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { data: auth, error } = await anon.auth.signInWithPassword({ email: 'mauroadmin@mundial.app', password: 'admin2026' })
if (error) { console.error('login:', error.message); process.exit(1) }
const userId = auth.user.id
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

// ── 1. Smoke test de páginas ─────────────────────────────
for (const path of ['/dashboard', '/predict', '/history', '/leaderboard', '/rules', '/profile', '/admin']) {
  const res = await fetch(`http://localhost:${PORT}${path}`, { headers: { Cookie: cookieHeader }, redirect: 'manual' })
  const html = res.status === 200 ? await res.text() : ''
  check(`GET ${path}`, res.status === 200 && html.includes('href="/admin"'), `status ${res.status}`)
}

// ── 2. Flujo de predicción con browser ───────────────────
const { data: matches } = await admin.from('matches').select('id, home_team_id, away_team_id, betting_closes_at').eq('status', 'upcoming').order('match_date').limit(20)
let matchId = null
for (const m of matches) {
  if (new Date(m.betting_closes_at) < new Date()) continue
  const { count: h } = await admin.from('players').select('id', { count: 'exact', head: true }).eq('team_id', m.home_team_id)
  const { count: a } = await admin.from('players').select('id', { count: 'exact', head: true }).eq('team_id', m.away_team_id)
  if (h > 0 && a > 0) { matchId = m.id; break }
}
check('partido apto para apostar', !!matchId)

// limpiar predicción previa del admin en ese partido
await admin.from('predictions').delete().eq('user_id', userId).eq('match_id', matchId)

const userDir = mkdtempSync(join(tmpdir(), 'edge-e2e-'))
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${userDir}`, 'about:blank'], { stdio: 'ignore' })
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).ok) break } catch {}
  await new Promise(r => setTimeout(r, 200))
}
const tabs = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json()
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let msgId = 0
const pending = new Map()
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const cdp = (method, params = {}) => { const id = ++msgId; return new Promise(res => { pending.set(id, res); ws.send(JSON.stringify({ id, method, params })) }) }
const evalJs = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  return r.result?.result?.value
}

await cdp('Network.enable')
for (const [name, value] of cookieList) await cdp('Network.setCookie', { name, value, url: `http://localhost:${PORT}/` })
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1800, deviceScaleFactor: 2, mobile: true })
await cdp('Page.navigate', { url: `http://localhost:${PORT}/predict/${matchId}` })
await new Promise(r => setTimeout(r, 8000))

// 2a. Guardar SIN resultado → debe mostrar error (el bug reportado)
const errMsg = await evalJs(`(async () => {
  const submit = [...document.querySelectorAll('button[type=submit]')][0]
  if (!submit) return 'NO SUBMIT'
  submit.click()
  await new Promise(r => setTimeout(r, 400))
  return document.body.innerText.includes('Cargá el resultado exacto') ? 'ERROR VISIBLE' : 'SIN ERROR'
})()`)
check('guardar sin resultado muestra error', errMsg === 'ERROR VISIBLE', errMsg)

// 2b. Completar 2-1, elegir goleadores (titular + suplente) y asistente, guardar
const flow = await evalJs(`(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  const inputs = [...document.querySelectorAll('input[type=number]')]
  setter.call(inputs[0], '2'); inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
  setter.call(inputs[1], '1'); inputs[1].dispatchEvent(new Event('input', { bubbles: true }))
  await new Promise(r => setTimeout(r, 300))
  const chips = () => [...document.querySelectorAll('button.flex.flex-col.items-center')]
  chips()[9].click()                    // gol titular
  await new Promise(r => setTimeout(r, 150))
  chips()[13].click()                   // gol suplente
  await new Promise(r => setTimeout(r, 150));
  [...document.querySelectorAll('button')].find(b => b.textContent.includes('Asistencias'))?.click()
  await new Promise(r => setTimeout(r, 150))
  chips()[12].click()                   // asistencia suplente
  await new Promise(r => setTimeout(r, 150))
  document.querySelector('button[type=submit]').click()
  await new Promise(r => setTimeout(r, 2500))
  return document.body.innerText.includes('¡Apuesta guardada!') ? 'GUARDADA' : 'NO GUARDADA: ' + document.body.innerText.slice(0, 200)
})()`)
check('apuesta completa se guarda', flow === 'GUARDADA', flow)

// 2c. Verificar en BD: predicción + 2 goles + 1 asistencia
const { data: pred } = await admin.from('predictions')
  .select('id, predicted_winner, predicted_home_score, predicted_away_score, predictionPlayers:prediction_players(event_type)')
  .eq('user_id', userId).eq('match_id', matchId).maybeSingle()
check('predicción en BD con 2-1 y ganador home',
  pred?.predicted_home_score === 2 && pred?.predicted_away_score === 1 && pred?.predicted_winner === 'home')
const goals = pred?.predictionPlayers?.filter(p => p.event_type === 'goal').length ?? 0
const assists = pred?.predictionPlayers?.filter(p => p.event_type === 'assist').length ?? 0
check('goleadores y asistente en BD', goals === 2 && assists === 1, `goles=${goals} asist=${assists}`)

// limpiar
if (pred) await admin.from('predictions').delete().eq('id', pred.id)
console.log('(predicción de prueba borrada)')

ws.close()
edge.kill()
console.log(failures === 0 ? '\nTODO OK' : `\n${failures} FALLOS`)
process.exit(failures === 0 ? 0 : 1)
