// Test de la apuesta de torneo: constraints en BD + flujo UI completo.
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.env.PORT ?? '3000'
const DEBUG_PORT = 9225
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const ref = new URL(url).hostname.split('.')[0]
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const { data: auth, error } = await anon.auth.signInWithPassword({ email: 'mauroadmin@mundial.app', password: 'admin2026' })
if (error) { console.error(error.message); process.exit(1) }
const userId = auth.user.id

let failures = 0
const check = (label, ok, extra = '') => {
  console.log(`${ok ? '✓' : '✗ FALLO'} ${label}${extra ? ' — ' + extra : ''}`)
  if (!ok) failures++
}

const { data: arg } = await admin.from('teams').select('id').eq('code', 'ARG').single()
const { data: fra } = await admin.from('teams').select('id').eq('code', 'FRA').single()
const { data: messi } = await admin.from('players').select('id').eq('name', 'Lionel Messi').single()

// limpiar apuesta previa del admin
await admin.from('tournament_predictions').delete().eq('user_id', userId)

// ── 1. Constraints en BD ─────────────────────────────────
const r1 = await anon.from('tournament_predictions').insert({
  user_id: userId, champion_team_id: arg.id, runner_up_team_id: arg.id, top_scorer_player_id: messi.id,
})
check('campeón = subcampeón rechazado', !!r1.error)

const r2 = await anon.from('tournament_predictions').insert({
  user_id: userId, champion_team_id: arg.id, runner_up_team_id: fra.id, top_scorer_player_id: messi.id,
})
check('apuesta válida aceptada (deadline abierto)', !r2.error, r2.error?.message)
await admin.from('tournament_predictions').delete().eq('user_id', userId)

// ── 2. Flujo UI ──────────────────────────────────────────
const userDir = mkdtempSync(join(tmpdir(), 'edge-tour-'))
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${userDir}`, 'about:blank'], { stdio: 'ignore' })
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).ok) break } catch {}
  await new Promise(r => setTimeout(r, 200))
}
const raw = 'base64-' + Buffer.from(JSON.stringify(auth.session)).toString('base64url')
const CHUNK = 3180
const cookieName = `sb-${ref}-auth-token`
const cookieList = raw.length <= CHUNK
  ? [[cookieName, raw]]
  : Array.from({ length: Math.ceil(raw.length / CHUNK) }, (_, i) => [`${cookieName}.${i}`, raw.slice(i * CHUNK, (i + 1) * CHUNK)])

const tabs = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json()
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let msgId = 0
const pending = new Map()
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const cdp = (method, params = {}) => { const id = ++msgId; return new Promise(res => { pending.set(id, res); ws.send(JSON.stringify({ id, method, params })) }) }
const evalJs = async (expr) => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value

await cdp('Network.enable')
for (const [name, value] of cookieList) await cdp('Network.setCookie', { name, value, url: `http://localhost:${PORT}/` })
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1400, deviceScaleFactor: 2, mobile: true })
await cdp('Page.navigate', { url: `http://localhost:${PORT}/tournament` })
await new Promise(r => setTimeout(r, 8000))

const uiResult = await evalJs(`(async () => {
  const setVal = (sel, val) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
    setter.call(sel, val)
    sel.dispatchEvent(new Event('change', { bubbles: true }))
  }
  const selects = () => [...document.querySelectorAll('select')]
  if (selects().length < 3) return 'faltan selects: ' + selects().length
  setVal(selects()[0], '${arg.id}')      // campeón
  setVal(selects()[1], '${fra.id}')      // subcampeón
  setVal(selects()[2], '${arg.id}')      // equipo del goleador
  await new Promise(r => setTimeout(r, 2500))  // carga de jugadores
  if (selects().length < 4) return 'no apareció el select de jugador'
  setVal(selects()[3], '${messi.id}')    // Messi
  await new Promise(r => setTimeout(r, 200))
  return 'FORM OK'
})()`)
check('formulario completable', uiResult === 'FORM OK', uiResult)

// captura antes de guardar
const shot = await cdp('Page.captureScreenshot', { format: 'png' })
writeFileSync('scripts/shot-tournament.png', Buffer.from(shot.result.data, 'base64'))

const saveResult = await evalJs(`(async () => {
  document.querySelector('button[type=submit]').click()
  await new Promise(r => setTimeout(r, 2500))
  return document.body.innerText.includes('¡Apuesta de torneo guardada!') ? 'GUARDADA' : 'NO: ' + document.body.innerText.slice(0, 150)
})()`)
check('guardado desde la UI', saveResult === 'GUARDADA', saveResult)

const { data: saved } = await admin.from('tournament_predictions').select('*').eq('user_id', userId).maybeSingle()
check('fila en BD correcta',
  saved?.champion_team_id === arg.id && saved?.runner_up_team_id === fra.id && saved?.top_scorer_player_id === messi.id)

// dashboard muestra el banner en modo "Editar"
const dash = await fetch(`http://localhost:${PORT}/dashboard`, { headers: { Cookie: cookieList.map(([n, v]) => `${n}=${v}`).join('; ') } })
const dashHtml = await dash.text()
check('banner en dashboard', dashHtml.includes('Apuesta de Torneo'))

await admin.from('tournament_predictions').delete().eq('user_id', userId)
console.log('(apuesta de prueba borrada)')

ws.close()
edge.kill()
console.log(failures === 0 ? '\nTODO OK' : `\n${failures} FALLOS`)
process.exit(failures === 0 ? 0 : 1)
