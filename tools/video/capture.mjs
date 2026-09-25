// usage: node capture.mjs <outdir> [t1,t2,...]   (no times = every frame at 30fps)
import { writeFileSync, mkdirSync } from 'node:fs';
const [outDir, times] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
let id = 0; const pending = {};
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending[d.id]) { pending[d.id](d.result); delete pending[d.id]; } };
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) => new Promise((r) => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.value;
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: new URL('video.html', import.meta.url).href });
await new Promise((r) => setTimeout(r, 1500));
await ev('document.fonts.ready.then(() => true)');
const duration = await ev('window.DURATION');
const ts = times ? times.split(',').map(Number) : Array.from({ length: Math.ceil(duration * 30) }, (_, i) => i / 30);
let n = 0;
for (const t of ts) {
  await ev(`render(${t})`);
  const s = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${outDir}/${String(n++).padStart(5, '0')}.png`, Buffer.from(s.data, 'base64'));
}
console.log(`duration ${duration.toFixed(2)}s, ${n} frames`);
ws.close();
