// core/water's confluence (ext/55, 2026-10-27) at fixed points, for krator/water.gd (KWater.confluence_at, confluence_ribbon_fade): the export's
// group record of a river and a stream meeting at a right angle (test-confluence.js's case), and C.at / 1 - C.fadeAt at points over its disc.
// godot/tests/water/confluence_test.gd checks KWater against them.
//   node godot/tools/water_confluence_golden.js     (writes godot/tests/water/confluence_golden.json; rerun after changing core/water/ext/55)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js', 'core/water/22-core-water-flow.js', 'core/water/ext/55-core-water-confluence.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;');
const W = WATER, HW = 8, HT = 3.4, yR = z => 10 - z * .001;
const river = W.flow({ name: 'river', pts: Array.from({ length: 21 }, (_, k) => [0, -200 + 20 * k, yR(-200 + 20 * k)]), width: 21, speed: 1.2 });
const stream = W.flow({ name: 'stream', pts: [[140, 0, 10.6], [100, 0, 10.4], [60, 0, 10.15], [30, 0, 10.02], [HW, 0, yR(0) + .002]], width: 11.8, speed: 1.6 });
const smin = (a, b, k) => { const q = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - q * q * k * .25; };
const chan = (d, hw, y, dep) => d < hw ? y - dep * (1 - .55 * (d / hw) * (d / hw)) - .15 : y + .35 + (d - hw) * .22 + Math.max(0, d - hw - 5) * .9;
const ground = (x, z) => smin(chan(Math.abs(x), HW, yR(z), 1.1), chan(x < HW ? Math.hypot(x - HW, z) : Math.abs(z), HT, yR(0), .6), 6);
const C = W.confluence({ name: 'golden mouth', flows: [river, stream], at: [HW, 0], r: 24, cell: 1.5, ground });
const rec = W.export().groups.find(g => g.kind === 'confluence');
// the samples from the record's own (rounded) values, as a port reads them: the same interpolation over the exported arrays
const tri = (A, x, z) => { const n = rec.n, fx = Math.min(Math.max((x - rec.x0) / rec.cell, 0), n - 1 - 1e-9), fz = Math.min(Math.max((z - rec.z0) / rec.cell, 0), n - 1 - 1e-9), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j,
  a = A[j * n + i], b = A[(j + 1) * n + i], c = A[j * n + i + 1], d = A[(j + 1) * n + i + 1]; return u + v <= 1 ? a + (c - a) * u + (b - a) * v : d + (b - d) * (1 - u) + (c - d) * (1 - v); };
let seed = 5; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const out = { source: 'core/water/ext/55 (' + FR.join(', ') + ')', rec, samples: [] };
for (let i = 0; i < 80; i++) { const x = HW - 26 + 52 * rnd(), z = -26 + 52 * rnd(), s = { x, z, rib: 1 - C.fadeAt(x, z), twin: C.at(x, z) };
  for (const k of ['y', 'vx', 'vz', 'slope', 'bank', 'fade', 'meetV']) s[k] = tri(rec[k], x, z); out.samples.push(s); }
fs.writeFileSync(path.join(ROOT, 'godot', 'tests', 'water', 'confluence_golden.json'), JSON.stringify(out));
console.log('confluence_golden.json: %d x %d grid, %d samples', rec.n, rec.n, out.samples.length);
