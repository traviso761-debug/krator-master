// core/water's planned-biome water (ext/54, 2026-10-26) at fixed points, for krator/water.gd (KWater's static twins): a look's ramp, the polygon
// cells, a salt pan, an ice with a salt rim and drifts, a blood fall's rust, a weed blade's sway. The pan's and the ice's records are the export's.
// godot/tests/water/kinds_ext_test.gd checks KWater against them.
//   node godot/tools/water_kinds_ext_golden.js     (writes godot/tests/water/kinds_ext_golden.json; rerun after changing core/water/ext/54)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/rand/08-core-rand.js', 'core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js', 'core/water/22-core-water-flow.js', 'core/water/ext/54-core-water-kinds-ext.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;');
const W = WATER;
let seed = 99; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const P = W.pan({ name: 'golden pan', bounds: [0, 0, 60, 60], level: 2241 });
const I = W.ice({ name: 'golden tarn', poly: W.circlePoly(0, 0, 90, 20), level: 4100, rim: { salt: true }, drifts: { wind: 30 }, seed: 91 });
const B = W.underIceFall({ name: 'golden bloodfall', mouth: [0, 0, 100], dir: [0, 1], width: 4, drop: 24, foot: [0, 14, 76], seed: 7 });
const X = W.export(), rec = name => X.surfaces.find(s => s.name === name);
const out = { source: 'core/water/ext/54 (' + FR.join(', ') + ')', looks: {}, cells: [], pan: { rec: rec('golden pan'), samples: [] }, ice: { rec: rec('golden tarn'), samples: [] },
  blood: { fresh: W.rgbOf(W.LOOKS.blood.fresh), red: W.rampAt('blood', .8), age0: B.age0, tau: B.tau, tFall: B.fall.tFall, samples: [] }, sway: { period: W.period(), samples: [] } };
for (const k of Object.keys(W.LOOKS)) out.looks[k] = { stops: W.LOOKS[k].stops, samples: [0, .1, .35, .5, .62, .8, .86, 1, 1.2].map(t => ({ t, c: W.rampAt(k, t) })) };
for (let i = 0; i < 60; i++) { const x = -40 + 80 * rnd(), z = -40 + 80 * rnd(), cell = [3, 22][i % 2], jit = [.85, .8][i % 2]; out.cells.push({ x, z, cell, jit, c: W.cellsAt(x, z, cell, jit), crack: W.crackOf(W.cellsAt(x, z, cell, jit), .07) }); }
for (let i = 0; i < 80; i++) { const x = 60 * rnd(), z = 60 * rnd(), wet = [0, .2, .6, 1][i % 4], a = W.panAt(P, x, z, wet); out.pan.samples.push({ x, z, wet, v: a.colour.concat([a.film, a.crack, a.low]) }); }
for (const d of I.drifts.slice(0, 10)) out.ice.samples.push({ x: d.x, z: d.z, drift: I.driftAt(d.x, d.z), rim: I.rimAt(d.x, d.z), c: I.colourAt(d.x, d.z) });
for (let i = 0; i < 50; i++) { const a = rnd() * 6.283, r = 90 * Math.sqrt(rnd()), x = r * Math.cos(a), z = r * Math.sin(a); out.ice.samples.push({ x, z, drift: I.driftAt(x, z), rim: I.rimAt(x, z), c: I.colourAt(x, z) }); }
for (const f of [0, .1, .33, .5, .77, 1]) out.blood.samples.push({ f, rust: B.rustF(f), c: B.colourAt(f) });
for (let i = 0; i < 20; i++) { const x = 200 * rnd(), z = 20 * rnd(), t = 600 * rnd(), u = rnd(); out.sway.samples.push({ x, z, t, u, sway: .12, v: W.weedSway(x, z, t, u, .12) }); }
fs.writeFileSync(path.join(ROOT, 'godot', 'tests', 'water', 'kinds_ext_golden.json'), JSON.stringify(out));
console.log('kinds_ext_golden.json: %d looks, %d cells, %d pan, %d ice (%d drifts), %d blood, %d sway', Object.keys(out.looks).length, out.cells.length, out.pan.samples.length, out.ice.samples.length, I.drifts.length, out.blood.samples.length, out.sway.samples.length);
