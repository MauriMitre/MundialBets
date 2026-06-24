// Dev tool: captura la página /groups (tablas + cuadro de 16avos) en
// viewport desktop para ver ambas columnas del bracket.
// Requiere el dev server corriendo. Uso: npx tsx scripts/shot-groups.mjs
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
await cdp('Emulation.setDeviceMetricsOverride', { width: 1000, height: 7000, deviceScaleFactor: 2, mobile: false })

await cdp('Page.navigate', { url: `http://localhost:${PORT}/groups` })
await new Promise(r => setTimeout(r, 7000))

// Recorte: desde el encabezado "16avos de final" hacia abajo
const rectRes = await cdp('Runtime.evaluate', { expression: `(() => {
  const h = [...document.querySelectorAll('h2')].find(x => x.textContent.includes('16avos'))
  if (!h) return JSON.stringify({ none: true })
  const box = h.parentElement
  const r = box.getBoundingClientRect()
  return JSON.stringify({ x: Math.max(0, r.x - 8), y: r.y + window.scrollY - 8, w: r.width + 16, h: r.height + 24 })
})()`, returnByValue: true })
const rect = JSON.parse(rectRes.result.result.value)
if (rect.none) { console.error('No se encontró el cuadro de 16avos en la página'); ws.close(); edge.kill(); process.exit(1) }
const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 } })
writeFileSync('scripts/shot-groups-bracket.png', Buffer.from(shot.result.data, 'base64'))
console.log('bracket → scripts/shot-groups-bracket.png')

ws.close()
edge.kill()
process.exit(0)
