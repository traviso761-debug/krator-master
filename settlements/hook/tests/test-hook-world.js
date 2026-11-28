/* settlements/hook/tests/test-hook-world.js: Hook's ground on the scale model, in node (no page, no GPU).

   The page's ground chain, read in place as build.py lists it: core/terrain/38-core-relief.js (KRELIEF), the cut round
   Hook's pin (settlements/hook/world, decoded by core/world/world_data.py exactly as the build does), core/world/
   41-world-fields.js (WORLD) and src/75d-hook-world.js, which runs WORLD.init and lays the Port kit's frame on the model.
   Checks: the frame is a rotation (unit, orthogonal axes; toLocal undoes toWorld), its origin stands at the 1:1 shoreline
   with the sea on the kit's +z and land on its -z, the coast's stations lie near the fitted line, PORT.natH is the
   model's ground, and the frame is the same on a second run. Each placement check has a negative: a frame turned the
   wrong way, and an origin moved 2 km out to sea, both fail; the chain's toe is read on a ring past every bench's reach.

   node settlements/hook/tests/test-hook-world.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const HOOK = path.join(__dirname, '..'), ROOT = path.join(HOOK, '..', '..');
const rd = p => fs.readFileSync(p, 'utf8');

/* the cut as the build inlines it: core/world/world_data.py's fragment (WORLD_DATA, WORLD_R, WORLD_KITS) */
function worldFragment() {
  const py = ['import importlib.util, sys',
    "s = importlib.util.spec_from_file_location('wd', sys.argv[1]); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)",
    "sys.stdout.write(m.fragment(sys.argv[2], 'var WORLD_KITS=[];\\n', 'test', 'test'))"].join('\n');
  for (const exe of ['python3', 'python']) {
    try { return cp.execFileSync(exe, ['-c', py, path.join(ROOT, 'core', 'world', 'world_data.py'), path.join(HOOK, 'world')],
      { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { /* the next name */ }
  }
  throw new Error('no python to run core/world/world_data.py');
}

let FRAG = null;
function load(bare) {   /* bare: without Hook's own landform records (the model's ground alone) */
  FRAG = FRAG || worldFragment();
  const src = [rd(path.join(ROOT, 'core', 'rand', '08-core-rand.js')), rd(path.join(ROOT, 'core', 'terrain', '38-core-relief.js')), FRAG,
    bare ? 'WORLD_DATA.meta.landforms = (WORLD_DATA.meta.landforms || []).filter(function (r) { return !/^lf_hook_/.test(r.id); });' : '',
    rd(path.join(ROOT, 'core', 'world', '41-world-fields.js')), rd(path.join(ROOT, 'core', 'world', '41l-world-landforms.js')),
    'var PORT = {};', rd(path.join(HOOK, 'src', '75d-hook-world.js')),
    'globalThis.__HW = HOOK_WORLD; globalThis.__PORT = PORT; globalThis.__WLAND = WLAND; globalThis.__WORLD = WORLD;'].join('\n;\n');
  const ctx = vm.createContext({ atob: s => Buffer.from(s, 'base64').toString('binary'), console, Math, Float32Array, Uint8Array, Int32Array,
    Uint16Array, Int8Array, Float64Array, Uint32Array, Array, Object, JSON, Number, String, Error, Map, Set, Infinity, NaN, isFinite, parseInt, parseFloat });
  vm.runInContext(src, ctx, { filename: 'hook-world' });
  return { W: ctx.__HW, PORT: ctx.__PORT, WLAND: ctx.__WLAND, WORLD: ctx.__WORLD };
}

const { W, PORT, WLAND, WORLD } = load();
const R = W.report;
console.log('frame: ' + JSON.stringify(R));

/* the frame is a rotation */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
T.ok('the kit\'s axes are unit and orthogonal', Math.abs(dot(W.ex, W.ex) - 1) < 1e-9 && Math.abs(dot(W.ez, W.ez) - 1) < 1e-9 && Math.abs(dot(W.ex, W.ez)) < 1e-9,
  'ex ' + W.ex + ', ez ' + W.ez);
let rt = 0;
for (const p of [[0, 0], [1200, -800], [-3000, 450], [77.5, 1999]]) { const w = W.toWorld(p[0], p[1]), q = W.toLocal(w[0], w[1]); rt = Math.max(rt, Math.hypot(q[0] - p[0], q[1] - p[1])); }
T.ok('toLocal undoes toWorld', rt < 1e-6, 'worst ' + rt + ' m');

/* the origin at the 1:1 shoreline, the sea on +z (the kit's sea side), land on -z (its land side) */
const atShore = natH => Math.abs(natH(0, 0)) <= 12;
const seaSide = natH => natH(0, 300) < 0 && natH(0, -300) > 0 && natH(0, 1000) < natH(0, -1000);
T.ok('the origin stands at the shoreline (the natural ground within 12 m of the sea)', atShore(W.natH), 'natH(0,0) = ' + W.natH(0, 0).toFixed(2));
T.ok('the sea lies on the kit\'s +z, the land on its -z', seaSide(W.natH),
  '300 m out ' + W.natH(0, 300).toFixed(1) + ', 300 m in ' + W.natH(0, -300).toFixed(1));
T.neg('a frame turned the wrong way (the sea on -z) fails the sea-side check', seaSide, (x, z) => W.natH(x, -z), W.natH);
T.neg('an origin 2 km out to sea fails the shoreline check', atShore, (x, z) => W.natH(x, z + 2000), W.natH);

/* the coast's stations lie near the fitted line (the frame's x axis through the origin) */
let off = 0;
for (const s of R.stations) { const q = W.toLocal(s[0], s[1]); off = Math.max(off, Math.abs(q[1])); }
T.ok('the coast\'s five stations lie within 250 m of the frame\'s shore line', R.stations.length >= 4 && off < 250, R.stations.length + ' stations, worst ' + off.toFixed(0) + ' m');

/* PORT.natH is the model's ground at 1:1, sea level 0 */
T.ok('PORT.natH is the frame\'s natural ground', PORT.natH === W.natH && Math.abs(W.natH(250, -400) - (W.modelH(250, -400) - W.SEA)) < 1e-9, 'SEA ' + W.SEA);
T.ok('the Ring Sea\'s level is the model\'s (below -1000 m)', W.SEA < -1000, 'SEA ' + W.SEA);

/* the spit (world/landforms.json through 41l): every bench stamped and passing 41l's own check (level inside, no face
   steeper than its batter, the toe inside its reach), and the waterfront on the peninsula, not on the plateau */
const want = JSON.parse(rd(path.join(HOOK, 'world', 'landforms.json'))).landforms.map(r => r.id);
const chk = WLAND.check().filter(c => want.includes(c.id));
T.ok('every one of Hook\'s landform records is stamped', chk.length === want.length && !WLAND.skipped.length, chk.map(c => c.id).join(', ') + '; skipped ' + JSON.stringify(WLAND.skipped));
/* 41l's check reads each bench against the ground with every bench off, so in a chain of overlapping benches a
   neighbour's fill counts as this one's toe out of reach (toeOut): the level and the batter are each bench's own */
T.ok('each bench is level inside and no face is steeper than its batter (41l\'s check)', chk.every(c => c.inside <= 1e-6 && c.batter.over === 0),
  JSON.stringify(chk.map(c => ({ id: c.id, inside: c.inside, batter: c.batter, toeOut: c.toeOut, fill: c.fill }))));
/* the chain's toe: on a ring 1.2 km outside the three rectangles' union, the ground is the model's (no bench reaches it) */
const BARE = load(true).WORLD;
/* the ring: points just past every bench's reach (41l's own distance, benchD: 0 inside the rectangle, Euclidean round its
   corners), on a circle round each bench, kept only where they lie beyond EVERY bench's reach, so nothing that reaches them
   is left out of the check by the sampling */
const BEN = WLAND.benches.filter(B => want.includes(B.id));
const bD = (B, x, z) => { const dx = x - B.x, dz = z - B.z, u = Math.abs(dx * B.c + dz * B.s) - B.a, v = Math.abs(-dx * B.s + dz * B.c) - B.b;
  return u <= 0 && v <= 0 ? 0 : Math.hypot(Math.max(u, 0), Math.max(v, 0)); };
const RING = [];
for (const B of BEN) for (let a = 0; a < 360; a += 4) { const t = a * Math.PI / 180, r = Math.hypot(B.a, B.b) + B.reach + 40, x = B.x + Math.cos(t) * r, z = B.z + Math.sin(t) * r;
  if (BEN.every(C => bD(C, x, z) >= C.reach + 20)) RING.push([x, z]); }
const ringMoved = w => RING.filter(p => Math.abs(w.H(p[0], p[1], 0) - BARE.H(p[0], p[1], 0)) > 1e-6).length;
const moved = ringMoved(WORLD);
T.neg('the ring check sees a bench that reaches it', w => ringMoved(w) === 0,
  { H: (x, z, m) => WORLD.H(x, z, m) + (x < -2000 ? 2 : 0) }, WORLD);
const ring = RING.length;
T.ok('outside the spit\'s reach the ground is the model\'s own', moved === 0 && ring >= 60, moved + ' of ' + ring + ' ring points moved');
const onSpit = w => { const B = WLAND.benchAt(w[0], w[1]); return !!B && B.id === 'lf_hook_spit' && WORLD.H(w[0], w[1], 0) - W.SEA > 3; };
T.ok('the waterfront stands on the peninsula (300 m inland of the origin is the spit\'s ground)', onSpit(W.toWorld(0, -300)), 'origin ' + JSON.stringify(R.origin_m));

/* the same frame on a second run (no draw order, no Math.random) */
const again = load().W.report;
T.ok('the frame is the same on a second run', JSON.stringify(again) === JSON.stringify(R), '');

T.done();
