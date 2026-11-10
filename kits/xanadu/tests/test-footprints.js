#!/usr/bin/env node
/* kits/xanadu/tests/test-footprints.js: every Xanadu def stays on its lot (the owner, 2026-11-10: "Xanadu's garden pieces still
   have the problem where their hedges or other parts stick out way over what their footprint is supposed to be").

   The footprint is the def's w x d: the lot the kit sheet spaces sites by, Erewhon's garden grid and blocks place by (8 m and
   16 m tiles side by side), and XAK.dims() hands another world (kits/xanadu/README.md, "Footprints"; settlements/xanadu/API.md,
   "Registry"). fw x fd is only the slope footing under it. The kit is sealed as XAK (kit_bundle.py) and run here headless: every
   def, every variant up to five, built alone at the origin (XAK.proto), and every baked instance's box (its kit item's geometry
   through its instance matrix) measured in x and z against +-w/2, +-d/2. Foliage counts: without the Vale biome the kit draws
   its own crowns, fitted to the lot like the biome's (xaRoom, 72-xa-helpers.js; xaPlant, 86b-xa-plants.js). Townsfolk
   (figB, figH) do not: people walk off a lot.

     - a garden or water piece (family Garden tiles, Water, Water - slopes, and the public gardens and baths, GARDENS below)
       must stay within TOL of its lot;
     - any other def over TOL must be in KNOWN (kits/xanadu/KNOWN_ISSUES.md, "Defs past their lot") with its overhang as
       measured, and must not grow past it by more than TOL; one back inside is reported, to be taken off the list;
     - a def that throws in XAK is reported (BUILD_FAILS lists the known ones) and not measured.

     node kits/xanadu/tests/test-footprints.js [--all] [--only key1,key2]     (--all prints every def's box)
   Needs python3 (or python) to seal the bundle (kit_bundle.bundle()). */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const KIT = path.join(__dirname, '..'), ROOT = path.join(KIT, '..', '..');
const ALL = process.argv.includes('--all');
const oi = process.argv.indexOf('--only'), ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const TOL = 0.25;          // metres past the lot line a box may reach (a kerb's lip, a boulder's facet)
const FIGURES = new Set(['figB', 'figH']);
const GARDEN_FAMILY = /^(Garden tiles|Water|Water — slopes)$/;
const GARDENS = new Set(['xa_garden', 'xa_bath', 'xa_grand_bath', 'xa_teahouse']);
/* the other defs past their lot, measured 2026-11-10 (metres past the line at the worst variant, townsfolk left out): Housing,
   Trade, Farms and the rest. Each is recorded in KNOWN_ISSUES.md with what reaches over. The citadel (the palace, both Pleasure
   Domes, the vizier's, the palace gate) is held for the owner's references: its builders are other sessions' work */
const KNOWN = {
  xa_poor_a: 0.68, xa_mid_a: 0.36, xa_mid_b: 6.30, xa_mid_c: 0.75,
  xa_rich_a: 2.90, xa_rich_c: 3.10, xa_shops: 12.32, xa_smithy: 2.02,
  xa_farmhouse: 2.63, xa_windmill: 1.57, xa_dairy: 0.76, xa_watermill: 5.00,
  xa_temple: 3.82, xa_monastery: 1.69, xa_grand_temple: 2.11, xa_guild_mine: 1.32,
  xa_guild_alch: 1.70, xa_guild_mason: 3.03, xa_generator: 1.70, xa_barracks: 4.30,
  xa_wall: 0.52, xa_gate: 1.50, xa_arena: 2.80, xa_amphitheatre: 6.00,
  xa_hillside: 16.00, xa_temple_ortakoy: 18.00, xa_house_turk_a: 0.79, xa_shop_turk_b: 0.28,
  xa_barge: 7.80, xa_quay: 1.53, xa_prison: 3.00, xa_ice_cave: 1.37,
  xa_pleasure_dome_bay: 6.27, xa_poor_a_palopo: 0.68, xa_mid_a_palopo: 0.36, xa_mid_b_palopo: 6.30,
  xa_mid_c_palopo: 0.75, xa_rich_a_palopo: 2.90, xa_rich_c_palopo: 3.10, xa_shops_palopo: 12.32,
  xa_temple_palopo: 3.82, xa_house_turk_a_palopo: 0.79, xa_shop_turk_b_palopo: 0.28
};
const BUILD_FAILS = {
  xa_lighthouse: 'FRAME_HOOKS is a page global (the sheet and Erewhon have it), not in XAK: the lamp\'s turn hook',
};

let fails = 0;
const fail = m => { fails++; console.log('FAIL ' + m); };

/* the bundle: kit_bundle.bundle() (python3, else python), evaluated with three.js and a canvas stub (no pixels are read) */
let js = null;
for (const py of ['python3', 'python']) {
  try {
    js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import kit_bundle; sys.stdout.write(kit_bundle.bundle()[0])', KIT],
      { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL no python to seal the bundle (kits/xanadu/kit_bundle.py)'); process.exit(1); }
global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
const ctx = () => new Proxy({}, { get: (t, k) => (k === 'createImageData' || k === 'getImageData')
  ? ((w, h) => ({ data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)), width: w, height: h }))
  : (k === 'canvas' ? { width: 1, height: 1 } : () => ({ addColorStop() {} })) });
global.document = { createElement: () => ({ getContext: ctx, width: 0, height: 0, style: {} }), getElementById: () => null, body: { appendChild() {} } };
global.addEventListener = () => {};
global.requestAnimationFrame = () => {};
(0, eval)(js + ';global.XAK=XAK;');

const dims = XAK.dims(), m = new THREE.Matrix4(), b = new THREE.Box3(), p = new THREE.Vector3();
/* an instance's box: through its vertices for a small geometry (a boulder, a leaf ball, a cone: exact, where its rotated
   bounding box would reach half again past it), else its bounding box's corners */
function instBox(geo, M) {
  const P = geo.attributes && geo.attributes.position;
  if (!P || P.count > 256) return b.copy(geo.boundingBox).applyMatrix4(M);
  b.makeEmpty();
  for (let i = 0; i < P.count; i++) b.expandByPoint(p.fromBufferAttribute(P, i).applyMatrix4(M));
  return b;
}
/* one def at one variant: the box of all it drew (x, z), and by kit item how far past the lot each reaches */
function measure(key, v, D) {
  const e0 = XAK.errors.length, ce = console.error;
  console.error = () => {};   // the kit reports a throw through console.error as well as XAK.errors
  let G;
  try { G = XAK.proto(key, v); } finally { console.error = ce; }
  if (XAK.errors.length > e0) return { err: XAK.errors.slice(e0).join(' | ').slice(0, 300) };
  if (!G) return { err: 'XAK.proto returned null' };
  G.updateMatrixWorld(true);
  const box = [Infinity, Infinity, -Infinity, -Infinity], by = {};
  G.traverse(o => {
    if (!o.geometry) return;
    const name = (o.userData && o.userData.kdef) || o.name || 'mesh';
    if (FIGURES.has(name)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const n = o.isInstancedMesh ? o.count : 1;
    for (let i = 0; i < n; i++) {
      if (o.isInstancedMesh) { o.getMatrixAt(i, m); m.premultiply(o.matrixWorld); } else m.copy(o.matrixWorld);
      instBox(o.geometry, m);
      if (!isFinite(b.min.x) || !isFinite(b.max.x)) continue;
      box[0] = Math.min(box[0], b.min.x); box[1] = Math.min(box[1], b.min.z); box[2] = Math.max(box[2], b.max.x); box[3] = Math.max(box[3], b.max.z);
      const over = Math.max(b.max.x - D.w / 2, -D.w / 2 - b.min.x, b.max.z - D.d / 2, -D.d / 2 - b.min.z);
      if (over > (by[name] || 0)) by[name] = over;
    }
  });
  const over = Math.max(box[2] - D.w / 2, -D.w / 2 - box[0], box[3] - D.d / 2, -D.d / 2 - box[1]);
  return { box, over, by };
}
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const boxs = B => 'x ' + f2(B[0]) + '..' + f2(B[2]) + ', z ' + f2(B[1]) + '..' + f2(B[3]);

let n = 0, nGarden = 0;
const past = [];
for (const key of Object.keys(dims)) {
  if (ONLY && !ONLY.includes(key)) continue;
  const D = dims[key], garden = GARDEN_FAMILY.test(D.family) || GARDENS.has(key);
  const nv = Math.min(D.variants || 2, 5);
  let worst = null, err = null;
  for (let v = 0; v < nv; v++) {
    const r = measure(key, v, D);
    if (r.err) { err = r.err; break; }
    if (!worst || r.over > worst.over) worst = Object.assign({ v }, r);
  }
  n++;
  if (garden) nGarden++;
  if (err) {
    if (BUILD_FAILS[key]) console.log('skip ' + key + ': throws in XAK (known: ' + BUILD_FAILS[key] + ')');
    else fail(key + ' throws in XAK: ' + err);
    continue;
  }
  const top = Object.entries(worst.by).filter(e => e[1] > TOL).sort((a, c) => c[1] - a[1]).slice(0, 4).map(e => e[0] + ' ' + f2(e[1])).join(', ');
  const line = key + ' (' + D.family + ', lot ' + D.w + ' x ' + D.d + '): ' + boxs(worst.box) + ' at v' + worst.v + ', ' + f2(worst.over) + ' m past' + (top ? ' [' + top + ']' : '');
  if (ALL) console.log('  ' + line);
  if (worst.over <= TOL) {
    if (KNOWN[key] != null) console.log('note ' + key + ' is back inside its lot (' + f2(worst.over) + ' m): take it off KNOWN and KNOWN_ISSUES.md');
    continue;
  }
  past.push(line);
  if (garden) fail('garden piece past its lot: ' + line);
  else if (KNOWN[key] == null) fail('past its lot (not in KNOWN): ' + line);
  else if (worst.over > KNOWN[key] + TOL) fail('further past its lot than recorded (' + f2(KNOWN[key]) + ' m): ' + line);
}
if (past.length && !ALL) { console.log(past.length + ' defs past their lot:'); for (const l of past) console.log('  ' + l); }
if (BUILD_FAILS && !ONLY) for (const k of Object.keys(BUILD_FAILS)) if (!dims[k]) fail('BUILD_FAILS names ' + k + ', which the kit no longer has');
console.log((fails ? 'FAIL' : 'ok') + ': ' + n + ' defs measured (' + nGarden + ' garden and water pieces), tolerance ' + TOL + ' m, ' + past.length + ' past their lot, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
