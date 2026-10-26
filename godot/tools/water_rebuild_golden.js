// core/water's final-rebuild items (2026-10-26) at fixed points, for krator/water.gd (KWater): a fall that follows a sloped face (its drops through
// core/export's water section), a curtain with a margin and its side fade, spray scaled to the drop, rain rings, a hollow record and its puddles, the
// wet look. godot/tests/water/rebuild_test.gd checks KWater against them.
//   node godot/tools/water_rebuild_golden.js     (writes godot/tests/water/rebuild_golden.json; rerun after changing core/water or the water adapter)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FR = ['core/atmos/89-atmos-0-core.js', 'core/atmos/89-atmos-0p-presets.js', 'core/atmos/89-atmos-a-waves.js', 'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js', 'core/water/22-core-water-flow.js', 'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js'];
global.window = global;
eval(FR.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;global.WATER=WATER;global.EXPORT=EXPORT;');
const W = WATER;

const lip = [[2092, -13, 90], [2092, 13, 90]], foot = [2000, 0, 20], gr = (x, z) => 20 + 70 * Math.pow((x - 2000) / 92, 2) + .8 * Math.sin(z * .3);
const FACE = W.fall({ name: 'face fall', lip, dir: [-1, 0], drop: 70, foot, fit: true, face: gr, faceLift: .4, spread: 6 });
const ARC = W.fall({ name: 'arc fall', lip: [[0, 0, 30], [0, 12, 30]], dir: [1, 0], speed: 2, drop: 20 });
const sec = EXPORT.world({ sections: ['water'] }).water;
const idOf = S => 'water:' + S.id;
const out = { source: 'core/water + core/export 09 (' + FR.join(', ') + ')', section: sec, face: {}, margin: {}, spray: {}, ripple: [], hollow: {}, wet: [] };
// the face: positions and normals down the curtain
out.face = { id: idOf(FACE), arc: idOf(ARC), samples: [] };
for (const u of [0, .3, .5, 1]) for (const f of [0, .07, .33, .5, .81, 1]) out.face.samples.push({ u, f, p: FACE.curtainAt(u, f), n: FACE.curtainNormal(f) });
// the margin: the curtain's arrays and the side fade
const C = W.curtain(ARC, { margin: 1.5, rows: 10, cols: 6 });
out.margin = { id: idOf(ARC), opt: { margin: 1.5, rows: 10, cols: 6 }, count: C.count, uv: C.uv, pos: C.pos, side: [] };
for (const u of [-.125, -.05, 0, .04, .1, .5, 1.05]) out.margin.side.push({ u, lw: 12, margin: 1.5, edge: 2, v: W.curtainSide(u, 12, 1.5, 2) });
// spray scaled to the drop: the face fall's (70 m) and the arc's (20 m)
out.spray = { face: W.fallSpray(FACE), arc: W.fallSpray(ARC), faceMax6: W.fallSpray(FACE, { max: 6 }) };
// rain rings
let seed = 777; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
for (let i = 0; i < 40; i++) { const x = -50 + 100 * rnd(), z = -50 + 100 * rnd(), t = [0, 3.3, 211.7, 1e5 + .41][i % 4], rain = [0, .2, .6, 1][(i >> 2) % 4];
  out.ripple.push({ x, z, t, rain, g: W.rainRipple(x, z, t, rain) }); }
// a hollow record and its puddles
const h = (x, z) => .002 * x + .3 * Math.sin(x * .05) * Math.cos(z * .04) - (Math.hypot(x - 60, z + 40) < 14 ? .6 * (1 - Math.hypot(x - 60, z + 40) / 14) : 0);
const M = W.hollows({ h, box: [-100, -100, 200, 100], cell: 4, blur: 20, depth: .4 });
out.hollow = { rec: { x0: M.x0, z0: M.z0, cell: M.cell, nx: M.nx, nz: M.nz, depth: M.depth, fill: M.fill, soft: M.soft, bytes: Buffer.from(M.data).toString('base64') }, samples: [] };
for (const [x, z, wet] of [[60, -40, 1], [58, -38, .8], [62, -42, .6], [55, -40, 1]]) out.hollow.samples.push({ x, z, wet, m: W.hollowAt(M, x, z), p: W.puddleAt(M, x, z, wet) });
for (let i = 0; i < 40; i++) { const x = -110 + 320 * rnd(), z = -110 + 220 * rnd(), wet = [0, .3, .7, 1][i % 4]; out.hollow.samples.push({ x, z, wet, m: W.hollowAt(M, x, z), p: W.puddleAt(M, x, z, wet) }); }
// the wet look
for (const [r, w, pd, por, film] of [[.9, 0, 0, .7, 0], [.9, 1, 0, .7, 0], [.6, .5, .3, .4, 0], [.8, 1, 1, 1, 0], [.7, .2, 0, .7, .6]]) out.wet.push({ r, w, pd, por, film, v: W.wetLook(r, w, pd, por, film) });
fs.writeFileSync(path.join(ROOT, 'godot', 'tests', 'water', 'rebuild_golden.json'), JSON.stringify(out));
console.log('rebuild_golden.json: face %d samples, spray %d + %d, ripple %d, hollow %d x %d (%d samples)', out.face.samples.length, out.spray.face.length, out.spray.arc.length, out.ripple.length, M.nx, M.nz, out.hollow.samples.length);
