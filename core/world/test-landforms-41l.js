// node core/world/test-landforms-41l.js: the bench kind of 41l-world-landforms.js (a level terrace cut into a slope, the
// request in settlements/viridian/PLAN.md section 12b) on a small made-up region: a sea in the west, land rising east at
// about 12 % (a west-facing slope, as the Mist Garden's), an islet and a page water in the sea. Each check has a negative.
// Every world is sampled into plain arrays before the next is loaded (loading a world replaces WORLD and WLAND).
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const T = require('../../tools/ktest.js')(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;

// ---------------------------------------------------------------- the region: 21 x 21 px (2 km), the frame's origin at px 10
const N = 21, C = 10;
function region(landforms) {
  const elev = new Float32Array(N * N), wlev = new Float32Array(N * N), whas = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = j * N + i, land = i >= 6;
    elev[k] = land ? 20 + (i - 6) * 240 : -60; whas[k] = land ? 0 : 1; wlev[k] = land ? -60 : 0; }
  const map = v => new Uint8Array(N * N).fill(v), f32 = () => new Float32Array(N * N);
  const R = { elev, wlev, whas, wflag: map(0), clim: map(0), rain: map(120), temp: map(115), biome: map(0), mask: map(255), scarpL: f32(), scarpU: f32(), scarpW: f32() };
  const meta = { heights: { grid: [N, N], origin_cell: [0, 0], su: 1, sv: 1, lo: -2000, hi: 4000 },
    frame: { origin_px: [C, C], box_px: [0, 0, N - 1, N - 1], size_px: [N, N] },
    biomes: [{ name: 'Test', colour: '#557733' }], classes: [{ code: 'Cfb', group: 'C', color: '#00aa00' }],
    rain: { scale_mm: 4000 / 255 }, temp: { offset: -90 }, pressure: { atm0: 1, scale_m: 8000 },
    drainage: { min_accum: 1000, lines: [] }, rivers: [], landforms };
  return { meta, R };
}
function world(landforms) {
  const { meta, R } = region(landforms);
  global.WORLD_DATA = { meta, towns: { format: 'krator-openworld-towns', version: 1, towns: [] } };
  global.WORLD_KITS = [];
  load('core/rand/08-core-rand.js'); load('core/terrain/38-core-relief.js');
  load('core/world/41-world-fields.js'); load('core/world/41l-world-landforms.js');
  const W = vm.runInThisContext('WORLD'); W.init(R);
  return { W, WL: vm.runInThisContext('WLAND') };
}

// the kinds already there: an islet and a page water in the sea (x < -8 km)
const OLD = [{ id: 'lf_t_islet', kind: 'islet', x: -14000, z: -6000, r_m: 300, crest_m: 30, water_m: 0 },
  { id: 'lf_t_page', kind: 'water', form: 'page', px: 4, py: 14, water_m: 0, smin_m: 210,
    parts: [{ shape: 'circle', px: [4, 14], r_m: 500 }, { shape: 'capsule', px: [4, 14], px_to: [4.4, 14], r_m: 180 }] }];
// the bench: on the slope at x 4 km, 208 m across by 216 m long, its long side east-west (down the fall line)
const BX = 4000, BZ = 0, BW = 208, BL = 216;
const bench = o => Object.assign({ id: 'lf_t_bench', kind: 'bench', x: BX, z: BZ, w_m: BW, l_m: BL, rotation: 0, batter_deg: 30, skirt_m: 30 }, o);

// ---------------------------------------------------------------- the natural ground, and the level the bench takes
let w = world(OLD.slice());
const level = Math.round(w.W.Hbare(BX, BZ));
// the samples every check reads, from one world
function sample(wd, B) {
  const H = (x, z) => wd.W.Hbare(x, z), sl = (x, z) => Math.hypot(H(x + 1, z) - H(x - 1, z), H(x, z + 1) - H(x, z - 1)) / 2;
  const S = { inside: [], faces: [], far: [], old: [] };
  for (let u = -BL / 2; u <= BL / 2; u += 6) for (let v = -BW / 2; v <= BW / 2; v += 6) S.inside.push(H(BX + u, BZ + v));
  // the faces: a ring 2-80 m off the bench's edge, every 4 m
  for (let u = -BL / 2 - 80; u <= BL / 2 + 80; u += 4) for (let v = -BW / 2 - 80; v <= BW / 2 + 80; v += 4) {
    if (Math.abs(u) <= BL / 2 + 2 && Math.abs(v) <= BW / 2 + 2) continue;
    S.faces.push({ x: BX + u, z: BZ + v, h: H(BX + u, BZ + v), s: sl(BX + u, BZ + v) }); }
  // far: a ring 450-900 m off the centre (past the reach: 30 + 1.5 x 216 = 354 m off the edge, 504 m off the centre at most)
  for (let a = 0; a < 360; a += 15) for (const r of [550, 700, 900]) { const x = BX + r * Math.cos(a * Math.PI / 180), z = BZ + r * Math.sin(a * Math.PI / 180); S.far.push(H(x, z)); }
  // the old kinds' ground: round the islet and the page water, every 50 m
  for (const [cx, cz, R] of [[-14000, -6000, 700], [-12000, 8000, 1400]]) for (let x = cx - R; x <= cx + R; x += 50) for (let z = cz - R; z <= cz + R; z += 50) S.old.push(H(x, z));
  S.check = JSON.stringify(wd.WL.check().filter(c => c.kind !== 'bench'));
  S.bench = wd.WL.check().find(c => c.kind === 'bench') || null;
  S.skipped = wd.WL.skipped.slice();
  return S;
}
const S0 = sample(w);                                         // no bench
w = world(OLD.concat([bench({ level_m: level })]));
const S1 = sample(w);                                         // the bench, batter 30 degrees
const natFaces = S0.faces;
w = world(OLD.concat([bench({ level_m: level, batter_deg: 60 })]));
const S60 = sample(w);                                        // a bench with a 60 degree batter
w = world(OLD.concat([bench({ level_m: 50, x: -14000, z: -6000 })]));
const Sover = sample(w);                                      // a bench laid over the islet
w = world(OLD.concat([bench({ level_m: level, rotation: 90, w_m: 60, l_m: 300 })]));
const rotIn = [], rotOut = [];
for (let u = -150; u <= 150; u += 10) for (let v = -30; v <= 30; v += 10) { rotIn.push(w.W.Hbare(BX + v, BZ + u)); rotOut.push(w.W.Hbare(BX + u, BZ + v)); }
w = world(OLD.concat([{ id: 'lf_t_bad', kind: 'bench', x: BX, z: BZ, w_m: 100 }]));
const Sbad = { skipped: w.WL.skipped.slice(), benches: w.WL.benches.length };

// ---------------------------------------------------------------- 1. level inside
const levelInside = S => S.inside.every(h => h === level);
T.neg('the bench is level inside: every point of the rectangle at level_m exactly', levelInside, S0, S1);
T.neg('...turned by rotation: a 300 x 60 m bench at 90 degrees is level along z, not along x', a => a.every(h => h === level), rotOut, rotIn);

// ---------------------------------------------------------------- 2. the batter
const tan30 = Math.tan(30 * Math.PI / 180);
// on every face (the ground moved), the slope no steeper than the batter asked, or the natural ground's own where that is
// steeper (a face only follows it there); the faces must exist (the stamp cut and filled)
const batterOk = tan => S => { let moved = 0;
  for (let i = 0; i < S.faces.length; i++) { const f = S.faces[i], n = natFaces[i]; if (Math.abs(f.h - n.h) <= .01) continue; moved++;
    if (f.s > Math.max(tan, n.s) * 1.02 + .01) return false; }
  return moved > 50; };
T.neg('the batter is no steeper than asked (30 degrees; a 60 degree stamp judged against 30 fails)', batterOk(tan30), S60, S1);
const B1 = S1.bench;
T.ok('WLAND.check: the bench is ok (level inside, no face over its batter, the toe inside its reach)', !!B1 && B1.ok, JSON.stringify(B1));
T.neg('...and its own check catches the steep stamp when asked for 30 (the 60 degree record against a 30 degree check)',
  S => { const B = S.bench; return !!B && B.batter.steepest <= 30 * 1.02 + .6; }, S60, S1);
// the earthworks: cut on the uphill (east) side, fill on the downhill (west), both reported
const cutFill = S => { let cutE = 0, fillW = 0, wrong = 0;
  for (let i = 0; i < S.faces.length; i++) { const f = S.faces[i], d = natFaces[i].h - f.h; if (Math.abs(d) <= .01) continue;
    if (d > 0 && f.x > BX + BL / 2) cutE++; else if (d < 0 && f.x < BX - BL / 2) fillW++; else if ((d > 0 && f.x < BX - BL / 2) || (d < 0 && f.x > BX + BL / 2)) wrong++; }
  return cutE > 20 && fillW > 20 && wrong === 0 && S.bench.cut.max > 0 && S.bench.fill.max > 0 && S.bench.cut.mean > 0 && S.bench.fill.mean > 0; };
T.neg('cut on the uphill side, fill on the downhill side, the check reporting both (max and mean)', cutFill, Sover, S1);
console.log('      bench at ' + level + ' m: cut max ' + B1.cut.max + ' mean ' + B1.cut.mean + ' m over ' + B1.cut.area_m2 + ' m2, fill max ' + B1.fill.max
  + ' mean ' + B1.fill.mean + ' m over ' + B1.fill.area_m2 + ' m2, steepest face ' + B1.batter.steepest + ' deg (asked ' + B1.batter.asked + ')');

// ---------------------------------------------------------------- 3. far ground untouched
// the faces moved (the check can see a stamp); past the reach the ground is the natural ground bit for bit
const same = (a, b) => a.length === b.length && a.every((h, i) => h === b[i]);
T.neg('far ground is untouched: past the reach the same heights bit for bit (the faces, inside it, moved)',
  S => same(S.a, S.b), { a: S1.faces.map(f => f.h), b: S0.faces.map(f => f.h) }, { a: S1.far, b: S0.far });

// ---------------------------------------------------------------- 4. the kinds already there
T.neg('the islet and the page water answer byte-identically with a bench in the records (one laid over the islet moves them)',
  S => same(S.old, S0.old) && S.check === S0.check, Sover, S1);
T.ok('...and nothing is skipped', S1.skipped.length === 0 && S0.skipped.length === 0, JSON.stringify(S1.skipped));
T.neg('a bench without l_m or level_m is skipped by name, not stamped', S => S.benches === 0 && S.skipped.length === 1 && /bench/.test(S.skipped[0].kind),
  { benches: 1, skipped: [] }, Sbad);
T.done();
