// Genera los íconos PWA (public/icon-*.png) renderizando un diseño
// HTML con Edge headless. Uso: npx tsx scripts/gen-icons.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DEBUG_PORT = 9226
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

// Trofeo dorado sobre gradiente verde cancha; el emoji ocupa ~55% para
// respetar la zona segura de los íconos maskable
const html = `<!doctype html><html><body style="margin:0">
<div style="width:100vw;height:100vh;background:radial-gradient(circle at 50% 35%,#1a5226 0%,#0d2e16 55%,#131313 100%);display:flex;align-items:center;justify-content:center">
  <span style="font-size:55vw;line-height:1;font-family:'Segoe UI Emoji'">🏆</span>
</div></body></html>`
const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html)

const userDir = mkdtempSync(join(tmpdir(), 'edge-icons-'))
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

for (const size of [512, 192, 180]) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: dataUrl })
  await new Promise(r => setTimeout(r, 800))
  const shot = await cdp('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`public/icon-${size}.png`, Buffer.from(shot.result.data, 'base64'))
  console.log(`public/icon-${size}.png`)
}

ws.close()
edge.kill()
process.exit(0)
