// Herramienta de desarrollo: captura el formulario de predicción
// (cancha + banco) en viewport móvil, simulando una apuesta.
// Requiere el dev server corriendo. Uso: npx tsx scripts/screenshot-pitch.mjs
// Variables: PORT (default 3000)
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.env.PORT ?? '3000'
const DEBUG_PORT = 9223
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const ref = new URL(url).hostname.split('.')[0]
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: matches } = await admin
  .from('matches')
  .select('id, home_team_id, away_team_id')
  .eq('status', 'upcoming')
  .order('match_date', { ascending: true })
  .limit(20)
let matchId = null
for (const m of matches) {
  const { count: h } = await admin.from('players').select('id', { count: 'exact', head: true }).eq('team_id', m.home_team_id)
  const { count: a } = await admin.from('players').select('id', { count: 'exact', head: true }).eq('team_id', m.away_team_id)
  if (h > 0 && a > 0) { matchId = m.id; break }
}

const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { data: auth, error } = await anon.auth.signInWithPassword({ email: 'mauroadmin@mundial.app', password: 'admin2026' })
if (error) { console.error('login failed:', error.message); process.exit(1) }
const raw = 'base64-' + Buffer.from(JSON.stringify(auth.session)).toString('base64url')
const CHUNK = 3180
const cookieName = `sb-${ref}-auth-token`
const cookieList = raw.length <= CHUNK
  ? [[cookieName, raw]]
  : Array.from({ length: Math.ceil(raw.length / CHUNK) }, (_, i) => [`${cookieName}.${i}`, raw.slice(i * CHUNK, (i + 1) * CHUNK)])

const userDir = mkdtempSync(join(tmpdir(), 'edge-cdp-'))
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

await cdp('Network.enable')
for (const [name, value] of cookieList) await cdp('Network.setCookie', { name, value, url: `http://localhost:${PORT}/` })
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1800, deviceScaleFactor: 2, mobile: true })

await cdp('Page.navigate', { url: `http://localhost:${PORT}/predict/${matchId}` })
await new Promise(r => setTimeout(r, 8000))

const sim = await cdp('Runtime.evaluate', { expression: `(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  const inputs = [...document.querySelectorAll('input[type=number]')]
  if (inputs.length < 2) return 'no inputs'
  setter.call(inputs[0], '2'); inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
  setter.call(inputs[1], '1'); inputs[1].dispatchEvent(new Event('input', { bubbles: true }))
  await new Promise(r => setTimeout(r, 300))
  const chips = () => [...document.querySelectorAll('button.flex.flex-col.items-center')]
  const c = chips()
  if (c.length < 15) return 'pocos chips: ' + c.length
  c[9].click(); c[9].click()          // titular: 2 goles
  await new Promise(r => setTimeout(r, 200))
  chips()[13].click()                 // suplente: 1 gol
  await new Promise(r => setTimeout(r, 200))
  const tog = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Asistencias'))
  tog?.click()
  await new Promise(r => setTimeout(r, 200))
  chips()[12].click()                 // suplente: asistencia
  return 'ok, chips=' + c.length
})()`, awaitPromise: true, returnByValue: true })
console.log('sim:', sim.result?.result?.value ?? JSON.stringify(sim.result))
await new Promise(r => setTimeout(r, 500))

const rectRes = await cdp('Runtime.evaluate', { expression: `(() => {
  const card = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Goleadores'))?.closest('div.bg-surface-container-low')
  const r = card.getBoundingClientRect()
  return JSON.stringify({ x: r.x, y: r.y + window.scrollY, w: r.width, h: Math.min(r.height, 900) })
})()`, returnByValue: true })
const rect = JSON.parse(rectRes.result.result.value)
const zoom = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 2 } })
writeFileSync('scripts/shot-pitch-zoom.png', Buffer.from(zoom.result.data, 'base64'))
console.log('zoom → scripts/shot-pitch-zoom.png')

ws.close()
edge.kill()
process.exit(0)
