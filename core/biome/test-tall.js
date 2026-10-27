// node core/biome/test-tall.js: tall trees (H6, biomes/hyperjungle/PLAN-LANDS.md section 11; README.md "Tall trees"):
// BIO.LOD.reach and an item's own reach (20-core-kit.js, bake), BIO.impostorItem's opt.reach and the impostor cell sizing
// (34-core-impostor.js, BIO.IMP.texel, BIO.IMP.cellFor). Each check with a negative. Unset, a page bakes the boxes it baked.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

function page(LOD) {
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/34-core-impostor.js'])
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, errs = [];
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m) });
  Object.assign(BIO.LOD, LOD || {});
  return { BIO, errs };
}
// a 480 m crown (a box from 0 to 480 m over its foot) put at its foot on 200 m hero sub-chunks, and a bark bucket beside it
function build(P, itemReach) {
  const { BIO } = P, mat = new THREE.MeshLambertMaterial(), g = new THREE.BoxGeometry(60, 480, 60); g.translate(0, 240, 0);
  BIO.def('crown', g, mat, { label: 'Crowns' }); if (itemReach != null) BIO.defs.crown.reach = itemReach;
  BIO.def('tuft', new THREE.PlaneGeometry(1, 1), mat, { label: 'Tufts' });
  BIO.bucket('bark', mat);
  BIO.range = 2000; BIO.minRange = 0; BIO.chunk = 200;
  for (const x of [40, 160]) for (const z of [40, 160]) {
    BIO.owner = [x, z]; BIO.put('crown', [x, 0, z], null, 1, 0x557744); BIO.put('tuft', [x + 5, 0, z], null, 1, 0x99bb55);
    BIO.tube('bark', [{ x, y: 0, z, r: 4 }, { x, y: 300, z, r: 2 }], 0x664422, { seg: 6 });
  }
  BIO.range = null; BIO.chunk = null; BIO.owner = null;
  BIO.bake(); return BIO.lodMeshes;
}
// a camera 500 m up, 300 m south of the chunk, looking level and north: the feet are below its frame, the crowns' tops in it
const cam = new THREE.PerspectiveCamera(30, 1.6, .5, 20000); cam.position.set(100, 500, -300); cam.lookAt(100, 500, 100); cam.updateMatrixWorld();
const of = (L, name) => L.find(e => e.mesh.name === 'biome:' + name);
const vis = (BIO, name) => { BIO.lodTick(cam); return of(BIO.lodMeshes, name).mesh.visible; };

// ---------------------------------------------------------------- unset: the boxes as before
const A = page(), LA = build(A);
const cA = of(LA, 'crown'), tA = of(LA, 'tuft'), bA = of(LA, 'bark');
ok(cA.y0 === 0 && cA.y1 === 0, 'unset: an instanced item\'s box is its feet, as before (y ' + cA.y0 + '..' + cA.y1 + ')');
ok(Math.abs(cA.sphere.radius - Math.hypot(160, 160, 60)) < 1e-9, 'unset: the cull sphere is the old one (' + cA.sphere.radius.toFixed(1) + ' m)');
ok(!vis(A.BIO, 'crown'), 'the gap, shown: unset, a 480 m crown on a 200 m chunk is culled when its feet are out of the frame');

// ---------------------------------------------------------------- BIO.LOD.reach: every instanced item
const B = page({ reach: 480 }), LB = build(B);
const cB = of(LB, 'crown'), tB = of(LB, 'tuft'), bB = of(LB, 'bark');
ok(cB.y1 === 480 && tB.y1 === 480, 'BIO.LOD.reach raises every instanced item\'s box top (crown and tuft to 480 m)');
ok(bB.y0 === bA.y0 && bB.y1 === bA.y1 && bB.sphere.radius === bA.sphere.radius, 'the negative: a bucket keeps its own box (bark ' + bB.y0 + '..' + bB.y1 + ' m, as unset)');
ok(vis(B.BIO, 'crown'), 'with reach the crown\'s chunk is drawn from that camera');
ok(cB.sphere.radius > cA.sphere.radius && cB.sphere.center.y === 240, 'the cull sphere covers the crown (centre y ' + cB.sphere.center.y + ', r ' + cB.sphere.radius.toFixed(1) + ')');

// ---------------------------------------------------------------- an item's own reach wins, and covers only that item
const C = page(), LC = build(C, 480);
ok(of(LC, 'crown').y1 === 480, 'an item\'s own reach (BIO.defs[name].reach) raises its box');
ok(of(LC, 'tuft').y1 === 0, 'the negative: the floor item beside it keeps its tight box');
ok(vis(C.BIO, 'crown') && !vis(A.BIO, 'crown'), 'the item\'s reach draws the crown where the page without it culls it');
const D = page({ reach: 900 }), LD = build(D, 480);
ok(of(LD, 'crown').y1 === 480 && of(LD, 'tuft').y1 === 900, 'the item\'s reach wins over the page\'s (crown 480, tuft the page\'s 900)');
const E = page({ reach: 'x' }), LE = build(E);
ok(of(LE, 'crown').y1 === 0 && !E.errs.length, 'the negative: a reach that is not a number is no reach');
const Z = page({ reach: 0 }), LZ = build(Z);
ok(of(LZ, 'crown').sphere.radius === cA.sphere.radius, 'reach 0 is the old sphere exactly');

// ---------------------------------------------------------------- the impostor item's reach
{ const P = page(), BIO = P.BIO, set = BIO.impostorSet('tall', { slots: 4 });
  const imp = BIO.impostor('mahogany', () => {}, { set }), imp2 = BIO.impostor('kapok', () => {}, { set });
  BIO.impostorItem('farTall', imp, { reach: 520 }); BIO.impostorItem('farShort', imp2);
  ok(BIO.defs.farTall.reach === 520, 'BIO.impostorItem(..., {reach}) sets the item\'s reach');
  ok(BIO.defs.farShort.reach === undefined, 'the negative: without it the item has none (the page\'s, or the old box)'); }

// ---------------------------------------------------------------- sizing an impostor cell (BIO.IMP.texel, cellFor)
{ const I = page().BIO.IMP, r305 = 215, r480 = 312;
  const t = I.texel(r305, 64, 700), pxM = 1080 / (2 * 700 * Math.tan(25 * Math.PI / 180));
  ok(Math.abs(t - 2 * r305 / 64 * pxM) < 1e-9, 'texel: the cell\'s metres times the screen\'s pixels a metre (' + t.toFixed(2) + ' px at 700 m)');
  ok(Math.abs(I.texel(r480, 64, 700) / t - r480 / r305) < 1e-9, 'a 480 m tree is ' + (r480 / r305).toFixed(2) + ' times softer at one cell');
  ok(I.texel(r305, 64, 1400) < t && I.texel(r305, 128, 700) < t, 'the negative: farther, or a bigger cell, is sharper');
  ok(I.texel(r305, 64, 700, { height: 2160 }) > t && I.texel(r305, 64, 700, { fov: 30 }) > t, 'a taller screen or a narrower lens shows the texel bigger');
  const c305 = I.cellFor(r305, 2500), c480 = I.cellFor(r480, 2500);
  ok(I.texel(r305, c305, 2500) <= 2 && (c305 === 16 || I.texel(r305, c305 / 2, 2500) > 2), 'cellFor: the smallest power of two within 2 px (' + c305 + ' px for 305 m at 2.5 km)');
  ok(c480 === 2 * c305, 'cellFor: the 480 m tree needs twice the cell there (' + c480 + ' px)');
  ok(I.cellFor(r480, 300) === 256 && I.cellFor(r480, 300, { max: 128 }) === 128, 'cellFor is capped at max (256 by default)');
  ok(I.cellFor(r480, 2500, { ratio: 8 }) < c480, 'the negative: a looser ratio takes a smaller cell');
  ok((c480 & (c480 - 1)) === 0 && c480 >= 16, 'cellFor returns a power of two'); }

console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
