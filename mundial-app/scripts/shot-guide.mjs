// Dev tool descartable: captura la guía pre-apuesta en /predict/[matchId].
// Requiere el dev server corriendo. Uso: node scripts/shot-guide.mjs
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.env.PORT ?? '3000'
const DEBUG_PORT = 9224
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const ref = new URL(url).hostname.split('.')[0]
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Partido upcoming con fixture de ESPN mapeado (para que haya racha)
const { data: matches } = await admin
  .from('matches')
  .select('id, betting_closes_at')
  .eq('status', 'upcoming')
  .not('api_fixture_id', 'is', null)
  .order('match_date', { ascending: true })
  .limit(5)
const open = matches.find(m => new Date(m.betting_closes_at) > new Date())
if (!open) { console.error('sin partidos con apuestas abiertas'); process.exit(1) }
const matchId = open.id
console.log('match:', matchId)

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
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1600, deviceScaleFactor: 2, mobile: true })

await cdp('Page.navigate', { url: `http://localhost:${PORT}/predict/${matchId}` })
await new Promise(r => setTimeout(r, 12000))

const rectRes = await cdp('Runtime.evaluate', { expression: `(() => {
  const card = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Guía'))?.closest('div.bg-surface-container-low')
  if (!card) return 'no card'
  const r = card.getBoundingClientRect()
  return JSON.stringify({ x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height })
})()`, returnByValue: true })
const val = rectRes.result.result.value
if (val === 'no card') { console.error('la guía no se renderizó'); ws.close(); edge.kill(); process.exit(1) }
const rect = JSON.parse(val)
const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 2 } })
writeFileSync('scripts/shot-guide.png', Buffer.from(shot.result.data, 'base64'))
console.log('→ scripts/shot-guide.png')

ws.close()
edge.kill()
process.exit(0)
