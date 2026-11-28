// ================================================================= MARR CITY — 93-city-ui.js
// Dev tools, Paths overlay, world hour slider, weather UI, city budgets, and MARR_SIM economy API.
// Tagged [web] in PORT.md.
BUDGET.showcase = { tris: 28000000, calls: 1200 };
BUDGET.cls.city = 28000000;
for (const k in TSTAT.by) { BUDGET.type[k.split('/')[0]] = 'city'; }

const PATHS = { on: false, tex: null };
window._masks = () => ({ mask: KMASK.hash(mv), klass: KMASK.hash(kv), ops: KMASK.ops(mv).length + KMASK.ops(kv).length });

function pathsTexture() {
 if (PATHS.tex) return PATHS.tex;
 const c = document.createElement('canvas'); c.width = c.height = CS; const g = c.getContext('2d');
 const COL = { 0: '#26221e', 1: '#c8a860', 2: '#2e7a3a', 3: '#e8e0d0', 4: '#c8c0b0', 5: '#b8a890', 6: '#a89878', 7: '#6a6a3a', 8: '#1a4a5a', 9: '#a08868', 10: '#4a2a2a', 11: '#3a3430', 12: '#6a5a2a' };
 const img = g.createImageData(CS, CS); const d = img.data;
 for (let i = 0; i < CS * CS; i++) {
  const k = kData[i * 4];
  const col = COL[k] || '#000000';
  d[i * 4] = parseInt(col.slice(1, 3), 16);
  d[i * 4 + 1] = parseInt(col.slice(3, 5), 16);
  d[i * 4 + 2] = parseInt(col.slice(5, 7), 16);
  d[i * 4 + 3] = 255;
 }
 g.putImageData(img, 0, 0);
 const t = new THREE.CanvasTexture(c);
 t.encoding = THREE.sRGBEncoding;
 PATHS.tex = t;
 return t;
}

uiButton('Paths', false, () => {
 PATHS.on = !PATHS.on;
 groundM.material.map = PATHS.on ? pathsTexture() : window._terrainTex;
 groundM.material.needsUpdate = true;
 return PATHS.on;
});

uiButton('Flora', true, () => {
 if (!BIO.baked || !BIO.baked.length) return false;
 const v = !BIO.baked[0].visible;
 for (const m of BIO.baked) m.visible = v;
 return v;
});

{
 const wrap = document.createElement('span');
 wrap.style.cssText = 'display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#ffe2b0';
 const lab = document.createElement('span');
 lab.textContent = 'hour ' + CITYSKY.hour.toFixed(1);
 const sl = document.createElement('input');
 sl.type = 'range'; sl.min = 0; sl.max = 24; sl.step = 0.1; sl.value = CITYSKY.hour; sl.style.width = '120px';
 sl.oninput = () => { CITYSKY.hour = parseFloat(sl.value); lab.textContent = 'hour ' + CITYSKY.hour.toFixed(1); };
 wrap.appendChild(lab);
 wrap.appendChild(sl);
 const rt = document.createElement('button');
 rt.id = 'cityRunTime';
 rt.title = 'Run world time: one day is 72 minutes';
 const rtSync = () => { rt.textContent = CITY_CLOCK.running ? 'Hold time' : 'Run time'; };
 rt.onclick = () => { CITY_CLOCK.run(); rtSync(); };
 rtSync();
 wrap.appendChild(rt);
 FRAME_HOOKS.push(() => {
  if (Math.abs(parseFloat(sl.value) - CITYSKY.hour) < 0.05) return;
  sl.value = CITYSKY.hour;
  lab.textContent = 'hour ' + CITYSKY.hour.toFixed(1);
 });
 ATMOS.weatherUI(wrap);
 ui.appendChild(wrap);
 ui.style.maxWidth = 'calc(100vw - 24px)';
}

{
 const q = new URLSearchParams((location.hash || '').replace(/^#/, ''));
 if (q.get('time') === 'run') {
  CITY_CLOCK.run(true);
  const b = document.getElementById('cityRunTime');
  if (b) b.textContent = 'Hold time';
 }
 const h = parseFloat(q.get('hour'));
 if (isFinite(h)) {
  CITYSKY.hour = h;
  const sl = ui.querySelector('input[type=range]');
  if (sl) { sl.value = h; sl.oninput(); }
 }
 const w = q.get('weather');
 if (w && ATMOS.W && ATMOS.W.MODES.includes(w)) {
  ATMOS.W.mode = w;
  const sel = document.getElementById('atmosWeather');
  if (sel) sel.value = w;
 }
}

window._api.city = {
 CITY,
 ROADS: () => ROADS.length,
 occ: () => OCC.list.length,
 setHour: h => { CITYSKY.hour = h; },
 clock: () => CITY_CLOCK.state(),
 runTime: on => CITY_CLOCK.run(on).running,
 quota: QUOTA,
 vern: () => { const by = {}; for (const v of VERN_PLACED) by[v.key] = (by[v.key] || 0) + 1; return by; },
 biome: () => window._biome,
 atmos: () => window._atmos,
 sim: () => typeof MARR_SIM !== 'undefined' ? MARR_SIM : null,
 summary: () => ({
  placed: VERN_PLACED.length,
  landmarks: REG.filter(r => r.tags && r.tags.landmark).length,
  gates: MAR_GATES.length,
  parks: PARKS.length,
  markets: MARKETS.length,
  wallSegs: MAR_WALL_CHAINS.reduce((s, c) => s + c.length - 1, 0),
  glowLights: typeof CITY_ATM !== 'undefined' ? CITY_ATM.cityGlows : 0
 }),
 lifeDests: () => ({
  market: LIFE_DESTS.market.length,
  markets: REG.filter(r => r.tags && r.tags.destination === 'market').map(r => ({ name: r.name, x: r.x | 0, z: r.z | 0, stalls: r.tags.stalls, canopies: r.tags.canopies }))
 })
};
window.LIFE_DESTS = LIFE_DESTS;
