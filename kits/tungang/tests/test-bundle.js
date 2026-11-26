// node kits/tungang/tests/test-bundle.js: the sealed bundle (tungang_bundle.py, TG) as a world loads it, without a browser.
// three.js r128 (kits/catalog/three.min.js) and the bundle (tex off) in plain node; core/hamlet's fellgang row lays the two
// riftrim villages (the Fowlers' and the Ice-cutters' specs, their stations' numbers), and TG.fg.draw draws them on a sloped
// ground as the stations will. Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const KIT = path.join(__dirname, '..'), ROOT = path.join(KIT, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('kits/catalog/three.min.js');
const py = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, "."); import tungang_bundle; sys.stdout.write(tungang_bundle.bundle(tex=False))'], { cwd: KIT, encoding: 'utf8', maxBuffer: 64 << 20 });
vm.runInThisContext(js, { filename: 'tungang_bundle.js' });
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/city/33-city-strategies.js', 'core/hamlet/10-hamlet-wood.js', 'core/hamlet/20-hamlet-cultures.js',
  'core/hamlet/fellgang/22-hamlet-fellgang.js', 'core/hamlet/30-hamlet-village.js'].forEach(load);
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
ok('the bundle loads with no error and seals its names (TG only)', typeof TG === 'object' && TG.errors.length === 0 && typeof MAT === 'undefined' && typeof REG === 'undefined',
  typeof KHAMLET === 'object', TG.errors.join('; '));
const ground = (x, z) => .06 * x + .03 * z, scene = new THREE.Group();
const spec = (id, world, focus, workers, popMax) => ({ id, world, culture: 'fellgang', focus, site: { x: 0, z: 0 }, link: { x: 30, z: -200 }, resource: { x: 0, z: 300, workers }, popMax, dims: TG.fg.dims });
const fow = KHAMLET.village(spec('fowlers', 8310, 'fowling', 44, 150)), ice = KHAMLET.village(spec('icecut', 8410, 'ice', 40, 120));
const D1 = TG.fg.draw(fow, { scene, ground, seed: 8312, label: 'The Fowlers' }), D2 = TG.fg.draw(ice, { scene, ground, seed: 8412, label: 'The Ice-cutters' });
ok('TG.fg.draw draws every record of both villages (' + D1.recs.length + ' and ' + D2.recs.length + ' buildings, ' + D1.tris + ' and ' + D2.tris + ' triangles)',
  D1.recs.length === fow.records.length && D2.recs.length === ice.records.length && !Object.keys(D1.missing).length && D1.length > 3 && scene.children.length === 2 && TG.errors.length === 0,
  Object.keys(TG.fg.draw({ records: [{ key: 'fg-nonesuch', x: 0, z: 0, ry: 0 }] }, { ground }).missing).length === 1, TG.errors.join('; '));
const all = D1.recs.concat(D2.recs), pl = TG.fg.check.plinth(all, ground);
ok('on the slope every floor sits at its footprint\'s highest corner and every plinth reaches its lowest (falls to ' + pl.fall.toFixed(2) + ' m)', pl.ok && pl.fall > .5,
  !TG.fg.check.plinth(all, (x, z) => ground(x, z) - 2).ok, pl.bad.slice(0, 3).join('; '));
const halls = all.filter(r => r.key === 'fg-meethall');
ok('the Fowlers\' hall has the rope wall (a peg a household), the Ice-cutters\' the tally board (from the village\'s focus)',
  halls.length === 2 && halls[0].fg.variant === 'fowlers' && halls[0].fg.pegs === Math.max(6, Math.round(fow.census.pop / 5)) && halls[1].fg.variant === 'icecut' && halls[1].fg.slats > 0,
  !(halls[1].fg.variant === 'fowlers'), halls.map(r => r.fg.variant + ' ' + (r.fg.pegs || r.fg.slats)).join(', '));
const protos = Object.keys(TG.fg.BOX).map(k => TG.fg.proto(k, { v: 1 }).recs[0]), bx = TG.fg.check.box(protos);
ok('each of the 14 buildings, built alone, keeps its stand-in box within 0.5 m', bx.ok && protos.length === 14, !TG.fg.check.box([Object.assign({}, protos[0], { key: 'fg-pens' })]).ok, bx.bad.join('; '));
const many = []; for (const k of Object.keys(TG.fg.BOX)) for (let v = 0; v < 8; v++) for (const character of [null, 'stony', 'low']) { const p = TG.fg.proto(k, { v, character }); many.push(p.recs[0]); p.forEach(m => m.geometry.dispose()); }
const mb = TG.fg.check.box(many), fams = new Set(many.filter(r => r.fg && r.fg.family).map(r => r.key + ':' + r.fg.family));
ok('every key, 8 seeds in three characters (' + many.length + ' builds, ' + fams.size + ' key-family pairs), within 0.5 m of its box and filling 65 % of w, d and 75 % of h',
  mb.ok && fams.size >= 30, !TG.fg.check.box([Object.assign({}, many[0], { key: 'fg-meethall' })]).ok && !TG.fg.check.box([Object.assign({}, many.find(r => r.key === 'fg-meethall'), { key: 'fg-hut' })]).ok, mb.bad.slice(0, 4).join('; '));
const LOWF = new Set(['black', 'croft', 'halfhip', 'twin', 'hip', 'container', 'lean']), lowShare = D => { const f = D.recs.filter(r => r.fg && r.fg.family); return f.filter(r => LOWF.has(r.fg.family)).length / Math.max(1, f.length); };
ok('a village has a character: the Ice-cutters\' takes more of the low families than the Fowlers\' (' + lowShare(D2).toFixed(2) + ' against ' + lowShare(D1).toFixed(2) + ')',
  lowShare(D2) > lowShare(D1) + .1, !(lowShare(D1) > lowShare(D1) + .1));
const rope = { id: 'r0', family: 3, pts: [], y0: 0, top: 0 };for (let k = 0; k < 30; k++) rope.pts.push([.1 * Math.sin(k), k * 2.4, -k * 1.5]);rope.top = rope.pts[29][1];
const RD = TG.fg.ropes([rope], {}), rc = TG.fg.check.rope([rope], RD);
ok('a fixed line follows its record (' + rc.verts + ' vertices, farthest ' + rc.far + ' m)', rc.ok && RD.recs[0].fg.pegs >= 2 && RD.recs[0].fg.rungs > 30,
  !TG.fg.check.rope([Object.assign({}, rope, { pts: rope.pts.map(p => [p[0], p[1] + 2, p[2]]) })], RD).ok);
const P = TG.fg.pieces([{ key: 'fg-lantern-post', x: 5, z: 5 }, { key: 'fg-halt', x: 20, z: 5 }, { key: 'fg-wagon', x: 30, z: 5, ry: 1 }], { ground });
ok('the road pieces draw where they are put, on the ground', P.recs.length === 3 && P.recs.every(r => Math.abs(r.y - ground(r.x, r.z)) < 1e-6), P.recs.length !== 4);
/* THE GLAZIERS (gz): every def's void plan inside its box, every def at 8 seeds in three states within its box; a small scarp laid as
   a world lays one (a KCAVERN mass, carved from the plans by TG.gz.carve, then drawn by TG.gz.draw): the rock open in the rooms
   and solid behind them, the lamps lit kept and dark abandoned */
const gp = TG.gz.check.plans();
ok('every Glazier void plan (' + gp.voids + ' voids over 8 seeds of ' + Object.keys(TG.gz.PLANS).length + ' defs) inside its box, its rooms kept apart by rock', gp.ok, !TG.gz.check.plans(4).ok, gp.bad.slice(0, 4).join('; '));
const gmany = []; for (const k of Object.keys(TG.gz.BOX)) for (let v = 0; v < 8; v++) for (const state of ['kept', 'worn', 'abandoned']) { const p = TG.gz.proto(k, { v, state }); gmany.push(p.recs[0]); p.forEach(m => m.geometry.dispose()); }
const gmb = TG.gz.check.box(gmany);
ok('every Glazier key, 8 seeds in three states (' + gmany.length + ' builds), within its box and filling its share', gmb.ok && gmany.length === 13 * 24,
  !TG.gz.check.box([Object.assign({}, gmany.find(r => r.key === 'gz-tea-hall'), { key: 'gz-cell' })]).ok, [...new Set(gmb.bad.map(b => b.replace(/#[0-9]+/, '')))].slice(0, 12).join('; '));
if (typeof KRAND === 'undefined') load('core/rand/08-core-rand.js');
load('core/terrain/39-core-cavern.js');
const gsites = [{ id: 'a', key: 'gz-cell', x: -12, y: 0, z: 0, v: 1 }, { id: 'b', key: 'gz-front', x: 0, y: 0, z: 0, v: 0 }, { id: 'c', key: 'gz-register-room', x: 12, y: 0, z: 0, v: 2 },
  { id: 'd', key: 'gz-house', x: 2, y: 9, z: -8, v: 3, ry: 0 }];
const GC = KCAVERN.create({ ground: () => -.5, cell: .5, chunk: 16, seed: 9400, walk: null, minRock: .6 });
GC.mass({ id: 'lo', poly: [[-20, -30], [20, -30], [20, 0], [-20, 0]], y0: -.5, y1: 9 });GC.mass({ id: 'hi', poly: [[-20, -30], [20, -30], [20, -8], [-20, -8]], y0: 8.8, y1: 28 });
const gprims = TG.gz.carve(GC, gsites);GC.build();
const gcv = TG.gz.check.carved(GC, gsites);
ok('a scarp carved from the plans (' + gprims.length + ' primitives): open in each first room, rock behind its back wall', gcv.ok && gcv.n === 4,
  !TG.gz.check.carved(GC, gsites.map(q => Object.assign({}, q, { x: q.x + 500 }))).ok, gcv.bad.join('; '));
const GK = TG.gz.draw(gsites, { seed: 9410 }), GA = TG.gz.draw(gsites, { seed: 9410, state: 'abandoned' }), GN = TG.gz.draw([{ key: 'gz-nonesuch', x: 0, z: 0 }], {});
ok('TG.gz.draw lays the scarp\'s sites (' + GK.recs.length + ' drawn, ' + GK.tris + ' triangles): ' + GK.lights.length + ' lamps lit kept, ' + GA.lights.length + ' abandoned',
  GK.recs.length === 4 && GK.lights.length > 10 && GA.lights.length === 0 && TG.errors.length === 0, Object.keys(GN.missing).length === 1, TG.errors.join('; '));
/* the bundle with the catalog sealed in: a world's draw comes furnished (the default bundle places nothing) */
const nofurn = D1.group.userData.furniture | 0;
vm.runInThisContext(cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, "."); import tungang_bundle; sys.stdout.write(tungang_bundle.bundle(tex=False, furniture=True))'], { cwd: KIT, encoding: 'utf8', maxBuffer: 64 << 20 }), { filename: 'tungang_bundle_furniture.js' });
const F1 = TG.fg.draw(fow, { ground, seed: 8312 });
ok('bundle(furniture=True) furnishes a world\'s draw (' + (F1.group.userData.furniture | 0) + ' catalog pieces in the Fowlers\' village)', (F1.group.userData.furniture | 0) > 50 && TG.errors.length === 0,
  nofurn === 0, TG.errors.join('; '));
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
