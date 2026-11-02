// node core/biome/test-cards.js: a library card on its geometry's axes (20-core-kit.js, "A LIBRARY CARD ON ITS GEOMETRY'S
// AXES"; 30-core-foliage.js's frond, ribbon, hang and clump declare the edge that holds their plant). Each check with a
// negative: a slot with no "base" draws every geometry exactly as before.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (m, c, x) => { console.log((c ? 'ok   ' : 'FAIL ') + m + (c || x === undefined ? '' : '  (' + JSON.stringify(x) + ')')); if (!c) fails++; };

// one page: the biome core and a pack whose slots are given; MAT {slot: material with a DataTexture card}
function page(pack) {
  const ctx = { console, Math, THREE };
  ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/32-core-variants.js'])
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, errs = [];
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m) });
  ctx.KMAT = { mode: 'lib', packed: (kit, slot) => pack[slot] || null, textures: () => ({ map: new THREE.Texture() }) };
  const card = () => new THREE.MeshLambertMaterial({ map: new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat) });
  return { BIO, errs, card };
}
const uvs = g => Array.from(g.attributes.uv.array).map(v => Math.round(v * 1e4) / 1e4);
const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-6);

// 1. the frond: a library fern standing in its image (base at the bottom) runs from the stem (v 0 of the strip) to the tip,
//    once down the whole frond, the image's bottom at the stem
{
  const { BIO, card } = page({ fern: { lib: 'card.fern', cell: [.1, .05, .9, .99], base: 'bottom' }, plain: { lib: 'card.fern' } });
  const M = { fern: card(), plain: card() };
  BIO.libSwap('k', M);
  ok('libSwap records a slot\'s base on its material', M.fern.userData.libCard && M.fern.userData.libCard.base === 'bottom' && !M.plain.userData.libCard.base);
  const raw = BIO.geo.frond(4), before = uvs(raw);
  BIO.def('fern', raw, M.fern); BIO.def('plain', BIO.geo.frond(4), M.plain);
  const P = BIO.defs.fern.geo.attributes.position.array, U = BIO.defs.fern.geo.attributes.uv.array;
  // the stem is the vertices at x 0; the tip at x 1. Image v (unflipped, 0 at its top): the stem must read the image's bottom
  let stemV = [], tipV = [];
  for (let i = 0; i < P.length / 3; i++) { if (P[3 * i] < 1e-6) stemV.push(U[2 * i + 1]); if (P[3 * i] > 1 - 1e-6) tipV.push(U[2 * i + 1]); }
  ok('the frond\'s stem reads the image\'s base edge (v 1) and its tip the far edge (v 0)', stemV.every(v => Math.abs(v - 1) < 1e-6) && tipV.every(v => Math.abs(v) < 1e-6), [stemV, tipV]);
  const vs = new Set(Array.from(U).filter((v, i) => i % 2 === 1).map(v => Math.round(v * 1e4)));
  ok('...once down its length: five distinct v on a four-segment frond, not a copy a segment', vs.size === 5, [...vs]);
  ok('...on a clone: the geometry passed in is untouched', same(uvs(raw), before));
  ok('negative: a slot with no base draws the frond as before (the texture once a segment)', same(uvs(BIO.defs.plain.geo), uvs(BIO.geo.frond(4))));
}
// 2. the ribbon and hang: a hanging vine (base top) spans a ribbon once; a top base on the hang changes nothing (it already does)
{
  const { BIO, card } = page({ vine: { lib: 'card.vine.hanging.0', cell: [.18, .01, .82, .95], base: 'top' } });
  const M = { vine: card() };
  BIO.libSwap('k', M);
  BIO.def('rib', BIO.geo.ribbon(4, .55, .18), M.vine); BIO.def('hang', BIO.geo.hang(), M.vine);
  const P = BIO.defs.rib.geo.attributes.position.array, U = BIO.defs.rib.geo.attributes.uv.array;
  let good = true;
  for (let i = 0; i < P.length / 3; i++) if (Math.abs(U[2 * i + 1] - (-P[3 * i + 1])) > 1e-6) good = false;   /* v = the depth hung, 0 .. 1 */
  ok('a ribbon spans a top-based vine once: v is the depth below the hung end', good);
  ok('a hang (already once, base top) is unchanged by a top base', same(uvs(BIO.defs.hang.geo), uvs(BIO.geo.hang())));
}
// 3. the clump shows its image upside down: a plant whose base is the bottom edge is turned upright; a spray seen from above
//    (base centre) and a sheet cut by geometry cells are not turned
{
  const { BIO, card } = page({ bush: { lib: 'card.jungle.clump.0', base: 'bottom' }, spray: { lib: 'card.moss', base: 'centre' }, sheet: { lib: 'card.spruce', base: 'bottom' } });
  const M = { bush: card(), spray: card(), sheet: card() };
  BIO.libSwap('k', M);
  BIO.def('bush', BIO.geo.clump(), M.bush); BIO.def('spray', BIO.geo.clump(), M.spray); BIO.def('sheet', BIO.geo.cells(BIO.geo.clump(), { n: 3 }), M.sheet);
  const P = BIO.defs.bush.geo.attributes.position.array, U = BIO.defs.bush.geo.attributes.uv.array;
  let good = true;   /* in each quad, the lower corners read the image's bottom (v 1) */
  for (let q = 0; q < 3; q++) { let lo = 1e9; for (let v = 0; v < 6; v++) lo = Math.min(lo, P[(q * 6 + v) * 3 + 1]);
    for (let v = 0; v < 6; v++) { const i = q * 6 + v; if (Math.abs(P[i * 3 + 1] - lo) < 1e-6 && Math.abs(U[i * 2 + 1] - 1) > 1e-6) good = false; } }
  ok('a clump turns a bottom-based plant upright (each quad\'s low edge reads the image\'s bottom)', good);
  ok('negative: a centre base leaves the clump as it was', same(uvs(BIO.defs.spray.geo), uvs(BIO.geo.clump())));
  ok('negative: a clump cut into a sheet\'s cells is never turned', same(uvs(BIO.defs.sheet.geo), uvs(BIO.geo.cells(BIO.geo.clump(), { n: 3 }))));
}
// 4. an item defined before the swap takes its base at the swap; a variant pool's items fit their own material
{
  const { BIO, card } = page({ a: { lib: 'card.fern', base: 'bottom' }, b: { lib: 'card.vine.hanging.8', base: 'top' } });
  const M = { a: card(), b: card() };
  BIO.def('early', BIO.geo.frond(3), M.a);
  const was = uvs(BIO.defs.early.geo);
  BIO.libSwap('k', M);
  ok('a frond defined before libSwap is fitted by it', !same(uvs(BIO.defs.early.geo), was) && BIO.defs.early.fit === true);
  ok('BIO.cardTurn: frond top meets a bottom base in two quarter turns; left to bottom in three; centre none',
    BIO.cardTurn('top', 'bottom') === 2 && BIO.cardTurn('left', 'bottom') === 3 && BIO.cardTurn('top', 'centre') === 0 && BIO.cardTurn('top', 'top') === 0);
  const N = card();
  BIO.def('rib', BIO.geo.ribbon(4), N);
  {
    const names = BIO.variantPool('rib', [M.b], 7);
    ok('a variant of an unfitted ribbon is fitted to its own (top-based) material', names.length === 2 && BIO.defs.rib1.fit === true && BIO.defs.rib.fit === false, names);
  }
}
// 5. a crown's sprigs held by their stems: each card starts at the clump's origin with its sprig's stem and runs out along
//    the stem-tip axis; its uv stay inside the sprig's cell; a sheet cut by cells can still take stems
{
  const S = [{ cell: [0, 0, .33, .33], stem: [.05, .3], tip: [.3, .05], w: [-.06, .06] }];
  const { BIO, card } = page({ crown: { lib: 'card.pine', stems: S }, cells: { lib: 'card.pine', stems: S } });
  const M = { crown: card(), cells: card() };
  BIO.libSwap('k', M);
  ok('libSwap records a slot\'s stems on its material, with no texture cell', M.crown.userData.libCard.stems.length === 1 && M.crown.map.repeat.x === 1);
  BIO.def('crown', BIO.geo.clump(), M.crown); BIO.def('cells', BIO.geo.cells(BIO.geo.clump(), { n: 3 }), M.cells);
  const g = BIO.defs.crown.geo, P = g.attributes.position.array, U = g.attributes.uv.array;
  let atStem = 0, inCell = true, out = true;
  for (let i = 0; i < P.length / 3; i++) {
    const u = U[2 * i], v = U[2 * i + 1], r = Math.hypot(P[3 * i], P[3 * i + 1], P[3 * i + 2]);
    if (u < -1e-6 || u > .33 + 1e-6 || v < -1e-6 || v > .33 + 1e-6) inCell = false;
    const ds = Math.hypot(u - .05, v - .3); if (ds < .062 && r < .25) atStem++;
    if (Math.hypot(u - .3, v - .05) < .03 && r < .6) out = false;   /* the tip end lies far out from the twig */
  }
  ok('each card holds its sprig\'s stem at the clump\'s origin (the twig)', atStem >= 3, atStem);
  ok('...its tip far out along the axis, its uv inside the sprig\'s cell', out && inCell);
  ok('a clump cut into cells takes the stems too', BIO.defs.cells.fit === true);
  ok('negative: a plain clump with no stems is the tripod as before', same(uvs(BIO.geo.clump()), uvs((() => { const q = page({}); q.BIO.def('c', q.BIO.geo.clump(), q.card()); return q.BIO.defs.c.geo; })())));
}
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
