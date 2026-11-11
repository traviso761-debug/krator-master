#!/usr/bin/env node
/* kits/ancients-interiors/tests/test-reception.js: the reception recipe (src/38-ai-reception.js, in the core since 2026-11-08)
   on the real catalog. The kit's core (src/10-49) is loaded, and the fragment once more to check it registers once; then at
   shallow and deep sizes, in both dresses and two seeds:
     - AI.audit passes (every key in the catalog, every piece inside, no overlaps, the doorway and reserved floor clear,
       the minimum counts: a counter, a chair, two divans), and nothing was skipped at the sizes the recipe is for;
     - the counter faces the door, off the back wall, with a chair behind it;
     - the approach is clear: nothing solid below 2 m between the counter's front and the doorway, across the doorway's width;
     - every waiting group is whole: each low table has a divan on each side, facing it;
     - every piece but a carpet stands at least 3 cm off every wall (the audit allows the wall line itself).
     node kits/ancients-interiors/tests/test-reception.js [--map]     (--map prints each layout as a plan in text)
   Needs the node harness bundles (tools/bundles.py writes tools/.cache/fb.js and ib.js; this test runs it). */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const KIT = path.join(__dirname, '..'), ROOT = path.join(KIT, '..', '..'), CACHE = path.join(KIT, 'tools', '.cache');
const MAP = process.argv.includes('--map');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL ' + m); } return c; };

/* the harness bundles: the catalog's furniture and kits/interiors, written by tools/bundles.py (python3, else python) */
{
  let done = false;
  for (const py of ['python3', 'python']) {
    try { cp.execFileSync(py, [path.join(KIT, 'tools', 'bundles.py')], { stdio: 'ignore' }); done = true; break; } catch (e) { /* the next name */ }
  }
  if (!done && !fs.existsSync(path.join(CACHE, 'fb.js'))) { console.log('FAIL no python to write tools/.cache (python3 tools/bundles.py)'); process.exit(1); }
}
global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
global.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }), width: 0, height: 0 }) };
(0, eval)(fs.readFileSync(path.join(CACHE, 'fb.js'), 'utf8') + ';\n' + fs.readFileSync(path.join(CACHE, 'ib.js'), 'utf8') + ';global.KF=KratorFurniture;global.IX=KratorInteriors;');
const core = fs.readdirSync(path.join(KIT, 'src')).filter(f => /^\d/.test(f) && f.endsWith('.js') && f < '50').sort();
(0, eval)(core.map(f => fs.readFileSync(path.join(KIT, 'src', f), 'utf8')).join('\n') + ';global.AI=KratorAncientsInteriors;');
ok(core.indexOf('38-ai-reception.js') >= 0 && AI.RECIPES.reception, 'the core holds the reception recipe');
const nBefore = Object.keys(AI.RECIPES).length, ancientBefore = JSON.stringify(AI.DRESS.ancient);
(0, eval)(fs.readFileSync(path.join(KIT, 'src', '38-ai-reception.js'), 'utf8'));
ok(Object.keys(AI.RECIPES).length === nBefore && JSON.stringify(AI.DRESS.ancient) === ancientBefore, 'the fragment registers the reception recipe once (a second load changes nothing)');
ok(AI.DRESS.ancient.board === 'ancients_board' && AI.DRESS.occupied.board === 'post-apoc_common_board', 'it adds the board role to both dresses');
AI.install(IX);
const cat = IX.runtimeAdapter(KF, KF.batch()), G = AI._geo;

function plan(res) {
  const S = 4, W = Math.round(res.w * S), D = Math.round(res.d * S), g = [];
  for (let j = 0; j < D; j++) g.push(new Array(W).fill('.'));
  const ch = { counter: 'K', chair: 'c', divan: 'V', lowTable: 't', rug: '~', bed: 'P', lampStem: 'l', statue: 'S', banner: 'b', board: 'N', bookcase: 'A', books: null, ceilingLamp: null };
  for (const p of res.placements) {
    const m = ch[p.role] === undefined ? '?' : ch[p.role];
    if (!m) continue;
    const dm = cat.dims(p.key, p.v), q = G.corners(p.x, p.z, dm.w, dm.d, p.ry);
    for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) {
      const x = (i + 0.5) / S - res.w / 2, z = (j + 0.5) / S - res.d / 2;
      if (G.overlap(q, G.rectQuad(x - 0.01, x + 0.01, z - 0.01, z + 0.01), 0) && (p.flat ? g[j][i] === '.' : true)) g[j][i] = m;
    }
  }
  const dc = Math.round(res.w * S / 2);
  g.push(new Array(W).fill(' ').map((s, i) => Math.abs(i - dc) < 0.8 * S ? 'D' : '='));
  return g.map(r => '   ' + r.join('')).join('\n');
}

const SIZES = [[15.5, 4.7, 7.2], [12, 9, 4], [12, 4.5, 3.4], [14, 5, 3.4], [18, 5.5, 3.6], [20, 6, 3.4], [16, 8, 3.6], [20, 12, 4], [16, 6, 3.4]];
for (const [w, d, h] of SIZES) for (const dress of ['ancient', 'occupied']) for (const seed of [1, 2]) {
  const res = AI.recipe('reception', { w, d, h, dress, seed }, cat), A = AI.audit(res, cat), tag = w + ' x ' + d + ' x ' + h + ' ' + dress + ' seed ' + seed;
  ok(A.ok, tag + ': audit: ' + A.fails.slice(0, 4).join('; '));
  ok(!res.skipped.length, tag + ': skipped ' + JSON.stringify(res.skipped));
  const P = res.placements, K = P.filter(p => p.role === 'counter');
  ok(K.length && K.every(p => p.ry === 0 && p.z < 0), tag + ': the counter faces the door, off the back wall');
  ok(K.every(k => P.some(p => p.role === 'chair' && Math.abs(p.x - k.x) < 1.4 && p.z < k.z && p.ry === 0)), tag + ': a chair behind each counter');
  const kf = Math.max(...K.map(k => k.z + cat.dims(k.key, k.v).d / 2)), lane = G.rectQuad(-1.0, 1.0, kf + 0.05, d / 2);
  for (const p of P) {
    if (p.flat || p.y >= 2) continue;
    const dm = cat.dims(p.key, p.v), q = G.corners(p.x, p.z, dm.w, dm.d, p.ry);
    if (p.on == null) ok(!G.overlap(q, lane, 0.01), tag + ': ' + p.role + ' in the approach');
  }
  for (const p of P) if (p.role !== 'rug') {
    const dm = cat.dims(p.key, p.v), q = G.corners(p.x, p.z, dm.w, dm.d, p.ry);
    ok(q.every(c => Math.abs(c[0]) <= w / 2 - 0.03 && Math.abs(c[1]) <= d / 2 - 0.03), tag + ': ' + p.role + ' within 3 cm of a wall');
  }
  for (const t of P.filter(p => p.role === 'lowTable')) {
    const near = P.filter(p => p.role === 'divan' && Math.abs(p.x - t.x) < 0.05 && Math.abs(Math.abs(p.z - t.z) - 1.15) < 0.4);
    ok(near.length === 2 && near.some(p => p.z < t.z && p.ry === 0) && near.some(p => p.z > t.z && Math.abs(p.ry - Math.PI) < 1e-3), tag + ': a waiting group at ' + t.x + ', ' + t.z + ' is whole');
  }
  if (seed === 1) console.log((A.ok ? 'ok   ' : 'FAIL ') + tag + ': ' + P.length + ' pieces ' + JSON.stringify(res.counts) + (res.skipped.length ? ' skipped ' + res.skipped.length : ''));
  if (MAP && seed === 1 && dress === 'ancient') console.log(plan(res));
}
/* through the socket, as a host furnishes it: a bar room 18 x 5.5 m (the metropolis's Ledger), its door mid-way along
   a long side, laid out by AI.furnishPlan in its inscribed rectangle */
{
  const R = { id: 'test.reception', kind: 'hall', y: 0, h: 7.2, level: 0, furnish: true, recipe: 'reception',
    poly: [[-9, -2.75], [9, -2.75], [9, 2.75], [-9, 2.75]], doors: [{ at: [0, 2.75], w: 1.6, to: 'corridor' }], windows: [] };
  const F = AI.furnishPlan({ type: 'test', buildings: [{ id: 'b', storeys: [{ id: 's', rooms: [R], walls: [] }] }] }, cat, { culture: 'ancient' });
  const r = F.rooms[0], A = r && r.recipe ? AI.audit(r.recipe, F.catalog) : { ok: false, fails: ['no recipe room'] };
  ok(A.ok && r.recipe.name === 'Reception', 'furnishPlan: the 18 x 5.5 m room as a reception: ' + A.fails.slice(0, 3).join('; '));
  if (r) console.log((A.ok ? 'ok   ' : 'FAIL ') + 'furnishPlan 18 x 5.5 m room -> recipe ' + r.recipe.w.toFixed(2) + ' x ' + r.recipe.d.toFixed(2) + ': ' + r.placements.length + ' pieces');
}
console.log(fails ? fails + ' FAILED' : 'reception: every check passed');
process.exit(fails ? 1 : 0);
