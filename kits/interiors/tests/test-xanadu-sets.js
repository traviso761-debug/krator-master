/* kits/interiors/tests/test-xanadu-sets.js: the Xanadu kit's opt-in rooms moved into sets/ (Stage 8 B9, 2026-11-24; T7, T13).
   1. sets/xanadu.js carries the caravanserai (xa_caravanserai, 88c; until then kits/xanadu/extra/69dz's set 'xanadu-extra'),
      its five battered ranges planned INSET, each with one door on its court face;
   2. sets/xanadu-lake.js is the set 'xanadu-lake' (until then kits/xanadu/src/87k1-xa-lake-rooms.js): the serai's four ranges,
      the tea factory's floor, the latex house's sealing room, the fermentary and the fish racks skipped;
   3. every door of those items stands on its body's outline (the inset rule moves a builder's door onto the footprint);
   4. NEGATIVES: a door 2 m off its body's outline, a range's door on its outer face, are caught.
   The core is kits/interiors/kit_bundle.py's bundle (read from src/, sets/: no build needed).
     node kits/interiors/tests/test-xanadu-sets.js */
'use strict';
const path = require('path'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const HERE = path.join(__dirname, '..');

let js = null;
for (const py of ['python3', 'python']) {
  try {
    js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import kit_bundle; sys.stdout.buffer.write(kit_bundle.bundle(["xanadu", "xanadu-lake"]).encode("utf-8"))', HERE],
      { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL no python to seal the interiors bundle (kits/interiors/kit_bundle.py)'); process.exit(1); }
(0, eval)(js + ';global.KratorInteriors=KratorInteriors;');
const IX = global.KratorInteriors, S = IX.sets;

/* a door's distance off its body's outline (an axis-aligned rect poly: the inset bodies) */
function offOutline(b, d) {
  const xs = b.poly.map(p => p[0]), zs = b.poly.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs), x = d.at[0], z = d.at[1];
  const inX = x >= x0 - 1e-6 && x <= x1 + 1e-6, inZ = z >= z0 - 1e-6 && z <= z1 + 1e-6;
  const ex = Math.min(Math.abs(x - x0), Math.abs(x - x1)), ez = Math.min(Math.abs(z - z0), Math.abs(z - z1));
  return inX && inZ ? Math.min(ex, ez) : inZ ? ex : inX ? ez : Math.hypot(ex, ez);
}
const doorsOnOutline = it => (it.bodies || []).every(b => (b.doors || []).every(d => offOutline(b, d) < 0.01));
/* a court range's door faces the court's middle (the plot's origin): its door is on the side of its centre nearer the origin */
const courtFacing = b => (b.doors || []).every(d => {
  const xs = b.poly.map(p => p[0]), zs = b.poly.map(p => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  return Math.hypot(d.at[0], d.at[1]) < Math.hypot(cx, cz);
});

/* 1. the caravanserai in the kit's own set */
const X = S.byName.xanadu, cv = X && X.byKey.xa_caravanserai;
T.ok('sets/xanadu.js has the caravanserai (xa_caravanserai, from extra/69dz)', !!cv);
T.ok('no set xanadu-extra is left (69dz folded into xanadu)', !S.byName['xanadu-extra']);
if (cv) {
  T.ok('the caravanserai: five ranges, every one INSET, two storeys on the 0.6 m plinth',
    cv.bodies.length === 5 && cv.bodies.every(b => b.inset && b.levels.length === 2 && b.y === 0.6),
    cv.bodies.map(b => b.id).join(','));
  T.ok('the caravanserai: its culture, lot and kinds', cv.culture === 'xanadu' && cv.lot[0] === 54 && cv.lot[1] === 56 && cv.types.indexOf('tavern/inn') >= 0);
  T.ok('the caravanserai: each range\'s door on its outline, facing the court', cv.bodies.every(b => doorsOnOutline({ bodies: [b] }) && courtFacing(b)));
  /* the back range as 69dz planned it (checked equal to 69dz's item, 2026-11-24): 34 x 7 battered twice (k 0.92 a storey)
     about (0, -20.5), so 28.778 x 5.925 */
  const back = cv.bodies[0], bz = back.poly.map(p => p[1]);
  T.ok('the back range\'s footprint as 69dz planned it (z -23.4625..-17.5375, door at z -17.538)',
    back.id === 'back' && Math.abs(Math.min(...bz) + 23.4625) < 1e-6 && Math.abs(Math.max(...bz) + 17.5375) < 1e-6 && Math.abs(back.doors[0].at[1] + 17.538) < 1e-6,
    JSON.stringify(back.poly) + ' ' + JSON.stringify(back.doors));
}

/* 2. the lake's trades' set */
const L = S.byName['xanadu-lake'];
T.ok('sets/xanadu-lake.js registers the set xanadu-lake (from src/87k1)', !!L);
if (L) {
  T.ok('xanadu-lake: the serai (four ranges), the tea factory, the latex house planned; the fermentary and the fish racks skipped',
    L.byKey.xa_serai && L.byKey.xa_serai.bodies.length === 4 && L.byKey.xa_tea_factory && L.byKey.xa_latex_house &&
    L.byKey.xa_fermentary && L.byKey.xa_fermentary.skip && L.byKey.xa_fish_racks && L.byKey.xa_fish_racks.skip,
    Object.keys(L.byKey).join(','));
  T.ok('xanadu-lake: every door on its body\'s outline', ['xa_serai', 'xa_tea_factory', 'xa_latex_house'].every(k => doorsOnOutline(L.byKey[k])));
  T.ok('xanadu-lake: no key it holds is in the kit\'s own set (S.find would answer the other)', Object.keys(L.byKey).every(k => !X || !X.byKey[k]));
}

/* 3. negatives */
const rg = cv ? cv.bodies[1] : { id: 'east', poly: [[17.7, -13.6], [23.3, -13.6], [23.3, 13.6], [17.7, 13.6]], doors: [{ at: [17.7, 0], w: 1.4 }] };
T.neg('a door 2 m off its body\'s outline is caught', it => doorsOnOutline(it),
  { bodies: [Object.assign({}, rg, { doors: [{ at: [rg.doors[0].at[0] + 2, rg.doors[0].at[1]], w: 1.4 }] })] }, { bodies: [rg] });
const xs = rg.poly.map(p => p[0]), outer = Math.max(...xs.map(Math.abs)) * Math.sign(rg.doors[0].at[0] || 1);
T.neg('a range\'s door on its outer face is caught', b => courtFacing(b),
  Object.assign({}, rg, { doors: [{ at: [outer, rg.doors[0].at[1]], w: 1.4 }] }), rg);
T.done();
