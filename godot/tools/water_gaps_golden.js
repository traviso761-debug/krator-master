// core/water's gap options (2026-10-21) at fixed points, for krator/water.gd (KWater): a flow with its own rapids band, a fall with the chute's foot
// fitted, a still pool with a centre-to-rim gradient, an open surface with a tint field, and shore grids on edge seeds. The surfaces go through
// core/export's water adapter, so the test reads the very record a page exports.   godot/tests/water/gaps_test.gd checks KWater against them.
//   node godot/tools/water_gaps_golden.js     (writes godot/tests/water/gaps_golden.json; rerun after changing core/water or the water adapter)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js', 'core/water/22-core-water-flow.js', 'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;global.EXPORT=EXPORT;');
const W = WATER;

const rp = []; for (let i = 0; i <= 24; i++) rp.push([i * 18, 40 * Math.sin(i / 4), 60 - i * 1.2 - (i > 10 && i < 14 ? (i - 10) * 3 : i >= 14 ? 9 : 0)]);
const TORRENT = W.flow({ name: 'torrent', pts: rp, width: [[0, 6], [200, 14], [432, 8]], speed: 2.5, rapids: [.12, .4], densify: 9 });
const BROOK = W.flow({ name: 'brook', pts: rp, width: 6, speed: 1 });
const CHUTE = W.flow({ name: 'chute', pts: [[0, 0, 40], [10, 0, 40], [14, 0, 20], [22, 0, 20]], width: 6, speed: 1 });
const FALL = W.fall(Object.assign({}, W.fallsOf(CHUTE, { steep: .5, minDrop: 3, fit: true })[0], { name: 'chute fall' }));
const POOL = W.still({ name: 'gradient pool', level: 4, poly: [[100, 100], [140, 100], [140, 120], [100, 120]], gradient: { centre: 0xaa8844, rim: 0x223322, power: 1.6 } });
const TINTED = W.open({ name: 'tinted', swell: [], field: 0, level: 0, bounds: [-100, -80, 100, 80],
  tint: { box: [-100, -80, 100, 80], cell: 10, at: (x, z) => x > 0 ? { c: 0x336699, a: Math.min(1, x / 80) } : (z > 50 ? 0xaa2222 : null) } });
const sec = EXPORT.world({ sections: ['water'] }).water;
const idOf = S => 'water:' + S.id;

let seed = 4242; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
const out = { source: 'core/water + core/export 09 (' + FR.join(', ') + ')', section: sec, flow: {}, fall: {}, pool: {}, tint: {}, edge: [] };
// the flow: its width profile came through densify (the points carry it), its own band reads in the normal, the foam and the shader uniform
const T = [0, 3.7, 421.3, 98765.4321];
out.flow = { id: idOf(TORRENT), brook: idOf(BROOK), rapids: TORRENT.rapids, npts: TORRENT.pts.length, widths: TORRENT.pts.map(p => p.w), samples: [] };
for (let i = 0; i < 40; i++) {
  const x = 500 * rnd(), z = -50 + 100 * rnd(), vx = 4 * rnd() - 1, vz = 2 * rnd() - 1, slope = [0, .05, .15, .3, .6][i % 5], t = T[i % T.length], bank = [-1, .4, 5][i % 3];
  out.flow.samples.push({ x, z, vx, vz, slope, t, bank, n: W.flowNormal(x, z, vx, vz, slope, t, TORRENT.rapids), foam: W.flowFoam(slope, bank, TORRENT.rapids),
    nPreset: W.flowNormal(x, z, vx, vz, slope, t), foamPreset: W.flowFoam(slope, bank), nBrook: W.flowNormal(x, z, vx, vz, slope, t, null) });
}
// the fall: foot and run in the record, the curtain lands on the foot
const ft = FALL.curtainAt(.5, 1);
out.fall = { id: idOf(FALL), foot: FALL.foot, run: FALL.run, speed: FALL.speed, tFall: FALL.tFall, landing: ft };
// the pool's gradient
out.pool = { id: idOf(POOL), gradient: POOL.gradient, samples: [] };
for (let i = 0; i < 24; i++) { const x = 95 + 50 * rnd(), z = 95 + 30 * rnd(); out.pool.samples.push({ x, z, t: POOL.gradientT(x, z) }); }
// the tint field
out.tint = { id: idOf(TINTED), samples: [] };
for (let i = 0; i < 40; i++) { const x = -120 + 240 * rnd(), z = -100 + 200 * rnd(); out.tint.samples.push({ x, z, v: TINTED.tintAt(x, z) }); }
// edge seeds: a sea in the west, a shelf, land, an inland hollow the sea cannot reach
const ground = (x, z) => x < -200 ? -30 : x < 0 ? -30 + (x + 200) * .14 : x < 150 ? -2 + x * .05 + Math.abs(z) * .01 : (Math.hypot(x - 260, z - 60) < 40 ? -4 : 30);
const box = [-600, -300, 400, 300], cell = 8, nx = Math.ceil(1000 / cell), nz = Math.ceil(600 / cell), gnd = [];
for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) gnd.push(ground(box[0] + (i + .5) * cell, box[1] + (j + .5) * cell));
for (const seeds of ['edge', { edge: true, depth: 40 }, { edge: true, sides: 'w' }, { edge: true, depth: 40, points: [[-500, 0]] }, { edge: true, sides: 'e' }]) {
  const G = W.shoreGrid({ ground, level: 0, box, cell, seeds, band: 60 });
  out.edge.push({ seeds, nx, nz, x0: box[0], z0: box[1], cell, level: 0, band: 60, ground: gnd, wetCells: G.wetCells, bytes: Buffer.from(G.data).toString('base64') });
}
fs.writeFileSync(path.join(ROOT, 'godot', 'tests', 'water', 'gaps_golden.json'), JSON.stringify(out));
console.log('gaps_golden.json: flow %d points, %d samples; %d edge grids', out.flow.npts, out.flow.samples.length, out.edge.length);
