// core/water's CPU twins at fixed (x, z, t), for krator/water.gd (KWater). Three open surfaces cover what a surface can
// be: the Ring Sea's four trochoids with half the shared wave field and a bed (its level the sea's, null in the record),
// a calm pond (three ripples, no field, no bed), and a bay with the whole field and its chop displaced. The surfaces go
// through core/export's water adapter (09-core-export-adapters.js), so the test reads the very record a page exports.
// godot/tests/water/water_test.gd checks KWater against them. Phases 2 to 4 add a tarn on a shore grid (with a lower hollow
// the flood must not reach), a river, a fall and a still pool with a fountain, each with its mesh and twins sampled.   node godot/tools/water_golden.js
// (writes godot/tests/water/golden.json; rerun after changing core/water, core/atmos's waves or the water adapter)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js', 'core/water/22-core-water-flow.js', 'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;global.EXPORT=EXPORT;');
const A = ATMOS, W = WATER;

const SEA = W.open({ name: 'sea', swell: 'ringsea', field: .5, bounds: [-400, -300, 400, 300],
  bed: (x, z) => -14 + 0.032 * x + 3.5 * Math.sin(z / 37), bedCell: 8 });
const POND = W.open({ name: 'pond', level: 2.5, swell: [[.06, 20, 35, 0, .03], [.035, 12, -50, 1.3, .03], [.015, 6, 80, 2.2, .02]], field: 0,
  bounds: [500, 500, 700, 700] });
const BAY = W.open({ name: 'bay', level: -1, swell: [[.2, 30, 10, 0, .2]], field: 1, chop: .5, bounds: [-1000, -1000, -600, -600] });
// Phases 2 to 4: a tarn on a shore grid (a bowl at (2000, 0) with a LOWER hollow beside it the flood must not reach), a
// river with a riffle and a bend, a fall, an L-shaped pool with a fountain
const OX = 2000, ground = (x, z) => { const a = Math.hypot(x - OX, z), b = Math.hypot(x - OX - 150, z); return Math.min(4 + a * a / 900, 16, 2 + b * b / 400); };
const TARN = W.open({ name: 'tarn', level: 10, swell: [[.12, 24, 20, 0, .12], [.07, 15, -40, 1.1, .08]], field: .5, bounds: [OX - 120, -90, OX + 220, 90],
  bed: ground, bedBox: [OX - 120, -90, OX + 220, 90], bedCell: 4, shore: { seeds: [[OX, 0]], band: 40 } });
const rp = []; for (let i = 0; i <= 24; i++) { const x = -3000 + i * 18, z = 500 + 40 * Math.sin(i / 4); rp.push([x, z, 30 - i * .25 - (i > 10 && i < 14 ? (i - 10) * .9 : i >= 14 ? 2.7 : 0)]); }
const RIVER = W.flow({ name: 'river', pts: rp, width: 14, speed: [1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 2, 2.2, 2.4, 2.6, 2.4, 2.2, 2, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1, .9, .8] });
RIVER.ribbonOpt = { step: 5, across: 6, margin: 1.5 };
const FALL = W.fall({ name: 'fall', lip: [[-2560, 520, 20], [-2560, 540, 20]], dir: [1, 0], speed: 3.5, drop: 60 });
FALL.curtainOpt = { rows: 20, cols: 5 };
const POOL = W.still({ name: 'pool', level: 3.25, poly: [[3000, 0], [3020, 0], [3020, 8], [3008, 8], [3008, 20], [3000, 20]], fountain: [3004, 4] });
const sec = EXPORT.world({ sections: ['water'] }).water;

let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const T = [0, 3.7, 421.3, 1234.5, 98765.4321];
const out = { source: 'core/water/20-core-water.js through core/export/09-core-export-adapters.js (' + FR.join(', ') + ')', waves: A.PRESETS.waves,
  section: sec, samples: [] };
for (const S of [SEA, POND, BAY]) {
  const id = 'water:' + S.id, b = S.bounds;
  for (let i = 0; i < 24; i++) {
    const x = b[0] + (b[2] - b[0]) * rnd(), z = b[1] + (b[3] - b[1]) * rnd(), t = T[i % T.length], sp = [0, .7, 3.1][i % 3];
    const p3 = S.rest(x, z, t, 3);
    out.samples.push({ id, x, z, t, sp,
      h: S.heightAt(x, z, t),                                  // 5 Newton steps (the CPU twin)
      h3: S.surfaceAt(p3[0], p3[1], t, 0)[1],                  // 3 (the shader's wtr_height)
      surface: S.surfaceAt(x, z, t, sp),                       // the vertex at rest point (x, z) for spacing sp
      normal: S.normalAt(x, z, t, 60, .05),
      nj: W.troNJ(S, x, z, t, .05),
      foam: W.foamAt(S, x, z, t, .05),
      depth: S.bed ? S.depthAt(x, z, t) : null });
  }
}
// the shore: the twin at points over the tarn and its hollow; the grid's own inputs (the ground at the cell centres), so
// GDScript rebuilds the flood, the distance and the bytes itself
const G = TARN.bed, gh = [];
for (let j = 0; j < G.nz; j++) for (let i = 0; i < G.nx; i++) gh.push(ground(G.x0 + (i + .5) * G.cell, G.z0 + (j + .5) * G.cell));
out.shore = { id: 'water:' + TARN.id, grid: { x0: G.x0, z0: G.z0, cell: G.cell, nx: G.nx, nz: G.nz, level: G.level, band: G.band, seeds: [[OX, 0]], ground: gh,
  bytes: Buffer.from(G.data).toString('base64'), wetCells: G.wetCells }, samples: [] };
for (let i = 0; i < 40; i++) {
  const x = OX - 115 + 330 * rnd(), z = -85 + 170 * rnd(), t = T[i % T.length], p3 = TARN.rest(x, z, t, 3), gy = ground(x, z);
  out.shore.samples.push({ x, z, t, gy, h: TARN.heightAt(x, z, t), h3: TARN.surfaceAt(p3[0], p3[1], t, 0)[1], surface: TARN.surfaceAt(x, z, t, .7),
    normal: TARN.normalAt(x, z, t, 60, .05), dist: TARN.shoreDist(x, z), wet: TARN.wetAt(x, z), contains: TARN.contains(x, z), surf: TARN.surfAt(x, z, t),
    surfFoam: TARN.surfFoamAt(x, z, t), wetGround: TARN.wetGroundAt(x, z, gy, t), depth: TARN.depthAt(x, z, t) });
}
out.shore.hollow = { x: OX + 150, z: 0, ground: ground(OX + 150, 0), wet: TARN.wetAt(OX + 150, 0), lake: TARN.wetAt(OX, 0) };
// the flow: its ribbon (whole), its height and current at points, the advected normal and foam
const RB = W.ribbon(RIVER, RIVER.ribbonOpt);
out.flow = { id: 'water:' + RIVER.id, ribbon: { count: RB.count, rows: RB.rows, pos: RB.pos, flow: RB.flow, slope: RB.slope, bank: RB.bank, idx: RB.idx }, samples: [] };
for (let i = 0; i < 30; i++) {
  const k = Math.floor(rnd() * (rp.length - 1)), u = rnd(), a = rp[k], b = rp[k + 1], x = a[0] + (b[0] - a[0]) * u + (rnd() - .5) * 10, z = a[1] + (b[1] - a[1]) * u + (rnd() - .5) * 10, t = T[i % T.length];
  const fl = RIVER.flowAt(x, z), vx = (rnd() - .5) * 4, vz = (rnd() - .5) * 4, sl = rnd() * .12, bk = (rnd() - .3) * 8;
  out.flow.samples.push({ x, z, t, h: RIVER.heightAt(x, z), flow: fl, contains: RIVER.contains(x, z), v: [vx, vz], slope: sl, bank: bk,
    normal: W.flowNormal(x, z, vx, vz, sl, t), normal0: W.flowNormal(x, z, 0, 0, sl, t), foam: W.flowFoam(sl, bk) });
}
// the fall: its curtain (whole), the streaks, the foam, the plunge pool
const CM = W.curtain(FALL, FALL.curtainOpt), PL = W.plunge(FALL);
out.fall = { id: 'water:' + FALL.id, curtain: { count: CM.count, pos: CM.pos, nrm: CM.nrm, idx: CM.idx }, plunge: [PL.x, PL.y, PL.z, PL.r], samples: [] };
for (let i = 0; i < 30; i++) {
  const u = rnd(), fl = rnd(), t = T[i % T.length], st = W.fallStreak(u, fl, t, FALL), x = PL.x + (rnd() - .5) * 40, z = PL.z + (rnd() - .5) * 40;
  out.fall.samples.push({ u, f: fl, t, streak: st, foam: W.fallFoam(fl, st), x, z, plunge: W.plungeAt(FALL, x, z, t) });
}
// the pool: its normal (ripple and fountain), containment; the rain's share
out.still = { id: 'water:' + POOL.id, samples: [] };
for (let i = 0; i < 24; i++) { const x = 2998 + 24 * rnd(), z = -2 + 24 * rnd(), t = T[i % T.length];
  out.still.samples.push({ x, z, t, normal: POOL.normalAt(x, z, t), contains: POOL.contains(x, z) }); }
out.wet = [[1, 1], [.6, .5], [.8, .2], [0, 1]].map(([w, ny]) => [w, ny, W.wetGroundRain(w, ny)]);
const f = path.join(ROOT, 'godot', 'tests', 'water', 'golden.json');
fs.mkdirSync(path.dirname(f), { recursive: true });
fs.writeFileSync(f, JSON.stringify(out));
console.log('wrote ' + path.relative(ROOT, f) + ': ' + sec.surfaces.length + ' surfaces, ' + out.samples.length + ' open samples, ' + out.shore.samples.length + ' shore, ' +
  out.flow.samples.length + ' flow, ' + out.fall.samples.length + ' fall, ' + out.still.samples.length + ' still, ' + sec.probes.length + ' probes');
