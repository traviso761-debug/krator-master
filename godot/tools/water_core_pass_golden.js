// core/water's core-pass pieces (2026-10-27) at fixed points, for krator/water_import.gd and krator/water.gd: a confluence's grid mesh (ext/55, from
// the export's group record), the breakup's twin (ext/56: WATER.breakup, open and flow numbers), a pan and an ice record (ext/54) with the ice's bake
// and its drift mesh. godot/tests/water/core_pass_test.gd checks the importer and KWater against them.
//   node godot/tools/water_core_pass_golden.js     (writes godot/tests/water/core_pass_golden.json; rerun after changing core/water/ext/54-56)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/rand/08-core-rand.js', 'core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js', 'core/water/22-core-water-flow.js', 'core/water/ext/54-core-water-kinds-ext.js', 'core/water/ext/55-core-water-confluence.js',
  'core/water/ext/56-core-water-breakup.js', 'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;global.EXPORT=EXPORT;global.KRAND=KRAND;');
const W = WATER, HW = 8, HT = 3.4, yR = z => 10 - z * .001;
// the scene: a river and a stream meeting (test-confluence.js's case), a fall, a salt pan, a frozen lake with a salt rim and drifts
const river = W.flow({ name: 'river', pts: Array.from({ length: 21 }, (_, k) => [0, -200 + 20 * k, yR(-200 + 20 * k)]), width: 21, speed: 1.2 });
const stream = W.flow({ name: 'stream', pts: [[140, 0, 10.6], [100, 0, 10.4], [60, 0, 10.15], [30, 0, 10.02], [HW, 0, yR(0) + .002]], width: 11.8, speed: 1.6 });
const smin = (a, b, k) => { const q = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - q * q * k * .25; };
const chan = (d, hw, y, dep) => d < hw ? y - dep * (1 - .55 * (d / hw) * (d / hw)) - .15 : y + .35 + (d - hw) * .22 + Math.max(0, d - hw - 5) * .9;
const ground = (x, z) => smin(chan(Math.abs(x), HW, yR(z), 1.1), chan(x < HW ? Math.hypot(x - HW, z) : Math.abs(z), HT, yR(0), .6), 6);
const C = W.confluence({ name: 'the mouth', flows: [river, stream], at: [HW, 0], r: 24, cell: 1.5, ground });
const F = W.fall({ name: 'fall', lip: [[300, 0, 40], [300, 12, 40]], dir: [1, 0], speed: 2, drop: 25 });
const P = W.pan({ name: 'pan', bounds: [400, -40, 460, 20], level: 5, wet: .6 });
const I = W.ice({ name: 'tarn', poly: W.circlePoly(600, 0, 70, 20), level: 30, rim: { salt: true }, drifts: { wind: 30 }, seed: 91 });
const sec = EXPORT.world({ sections: ['water'] }).water;
const rec = sec.groups.find(g => g.kind === 'confluence');
// the confluence's mesh from the record, as KWater.confluence_mesh builds it (the record's rounded values), and the page's own C.mesh()
const n = rec.n, idx = [], sum = [0, 0, 0];
for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { sum[0] += rec.x0 + i * rec.cell; sum[1] += rec.y[j * n + i]; sum[2] += rec.z0 + j * rec.cell; }
for (let j = 0; j + 1 < n; j++) for (let i = 0; i + 1 < n; i++) { const a = j * n + i, b = a + n, c = a + 1, d = b + 1;
  if (Math.max(rec.bank[a], rec.bank[b], rec.bank[c], rec.bank[d]) < -rec.margin || Math.max(rec.fade[a], rec.fade[b], rec.fade[c], rec.fade[d]) <= 0) continue; idx.push(a, b, c, c, b, d); }
const out = { source: 'core/water ext/54-56 + core/export (' + FR.join(', ') + ')', section: sec, confluence: { name: rec.name, triangles: idx.length / 3, sum, page_triangles: C.mesh().idx.length / 3, flows: rec.flows, at: rec.at, r: rec.r, feather: rec.feather },
  breakup: [], drifts: {}, bake: {}, ids: { river: 'water:' + river.id, stream: 'water:' + stream.id, fall: 'water:' + F.id, pan: 'water:' + P.id, ice: 'water:' + I.id } };
let seed = 13; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
for (let i = 0; i < 40; i++) { const x = -100 + 200 * rnd(), z = -100 + 200 * rnd(), t = 600 * rnd(), a = rnd() * 6.283, s = .3 * rnd(), l = Math.hypot(Math.cos(a) * s, 1, Math.sin(a) * s),
  nn = [Math.cos(a) * s / l, 1 / l, Math.sin(a) * s / l], flow = i % 2 === 1, v = flow ? [.8 * rnd() - .4, .8 * rnd()] : null, B = flow ? Object.assign({}, W.BREAKUP, W.BREAKUP_FLOW) : W.BREAKUP;
  out.breakup.push({ n: nn, x, z, t, flow, v, r: W.breakup(nn, x, z, t, B, v) }); }
const D = W.driftMesh(I, { res: 8, lift: .02 }), ds = [0, 0, 0]; for (let i = 0; i < D.pos.length; i++) ds[i % 3] += D.pos[i];
out.drifts = { count: D.count, triangles: D.idx.length / 3, sum: ds };
const M = I.bake(2); out.bake = { x0: M.x0, z0: M.z0, nx: M.nx, nz: M.nz, samples: [] };
for (let i = 0; i < 60; i++) { const k = Math.floor(rnd() * M.nx * M.nz); out.bake.samples.push([k, M.data[k * 4], M.data[k * 4 + 1]]); }
fs.writeFileSync(path.join(ROOT, 'godot', 'tests', 'water', 'core_pass_golden.json'), JSON.stringify(out));
console.log('core_pass_golden.json: confluence %d triangles (page %d), %d breakup samples, %d drifts (%d vertices), bake %d x %d, surfaces %s',
  out.confluence.triangles, out.confluence.page_triangles, out.breakup.length, I.drifts.length, D.count, M.nx, M.nz, sec.surfaces.map(s => s.kind).join(' '));
