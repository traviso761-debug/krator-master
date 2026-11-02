// node core/biome/test-attach.js: the residual floaters' classes (2026-11-02), read back through BIO.attachAudit: the audit measures to
// the drawn surface (triangles, an instanced item's radius), BIO.triDist, BIO.holdTo for a card whose boughs a far tier drops, BIO.snapSeg
// for a decoration jittered off its twig, and {onLeaf:true} for a flower in a bush. Each with a negative.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (m, c, x) => { console.log((c ? 'ok   ' : 'FAIL ') + m + (c || x === undefined ? '' : '  (' + JSON.stringify(x) + ')')); if (!c) fails++; };

function page() {
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js'])
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, scene = new THREE.Scene();
  BIO.init({ THREE, scene, seed: 3, err: () => {} });
  const leaf = BIO.leafMat(new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat), 'leaf', {});
  BIO.def('clump', BIO.geo.clump(), leaf);
  BIO.def('bloom', BIO.geo.clump(), leaf, { onLeaf: true });
  BIO.def('stiff', BIO.geo.clump(), leaf);
  BIO.def('rod', new THREE.CylinderGeometry(.5, .5, 1, 6), new THREE.MeshLambertMaterial());
  return { BIO, scene };
}
const ground = () => 0, Q = new THREE.Quaternion(), G = 0x336622;

// 1. the distance: BIO.triDist
{
  const { BIO } = page(), a = { x: 0, y: 0, z: 0 }, b = { x: 10, y: 0, z: 0 }, c = { x: 0, y: 0, z: 10 }, near = (p, d) => Math.abs(BIO.triDist(p[0], p[1], p[2], a, b, c) - d) < 1e-9;
  ok('over the face: the height above it', near([2, 3, 2], 3));
  ok('past an edge, past a corner', near([5, 0, -4], 4) && near([-3, 0, -4], 5) && near([14, 3, 0], 5));
  ok('past the long edge', near([10, 0, 10], Math.SQRT2 * 5));
}
// 2. a bark quad far wider than a card: a card lying on its middle is held, though every edge is metres away
{
  const quad = (off) => {
    const { BIO, scene } = page(), g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-20, 20, 0, 20, 20, 0, 0, 20, 40], 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial()));
    BIO.put('clump', [0, 20 + off, 15], Q, [1, 1, 1], G); BIO.bake();
    return BIO.attachAudit({ ground });
  };
  const A = quad(.5), F = quad(3);
  ok('a card on the middle of a 40 m triangle is held', A.audited === 1 && A.floating === 0, A);
  ok('negative: the same card 3 m off the surface floats', F.floating === 1, F);
}
// 3. an instanced item's radius reaches a card past the point's own square
{
  const flank = (x) => {
    const { BIO } = page();
    BIO.put('rod', [0, 0, 0], Q, [12, 20, 12], 0x553311);    /* a thick item: radius 6 */
    BIO.put('clump', [x, 10, 0], Q, [1, 1, 1], G); BIO.bake();
    return BIO.attachAudit({ ground });
  };
  ok('a card on the flank of a thick trunk, 6 m from its axis, is held', flank(6.2).floating === 0, flank(6.2));
  ok('negative: 3 m off the flank it floats', flank(9).floating === 1, flank(9));
}
// 4. a far tier that drops the boughs: the clump held to the trunk by BIO.holdTo
{
  const tree = (hold) => {
    const { BIO } = page();
    BIO.put('rod', [0, 8, 0], Q, [.4, 16, .4], 0x553311);
    for (let i = 0; i < 8; i++) { const a = i * 2.4, p = [Math.cos(a) * 7, 15, Math.sin(a) * 7], s = 4; BIO.put('clump', hold ? BIO.holdTo([0, 15, 0], p, s * .55) : p, Q, [s, s, s], G); }
    BIO.bake(); return BIO.attachAudit({ ground });
  };
  const F = tree(false), H = tree(true);
  ok('a crown out where the bough was, and no bough: all float', F.floating === 8, F);
  ok('...held to the trunk within their leaves\' reach: none', H.floating === 0, H);
  const { BIO } = page(), p = BIO.holdTo([0, 0, 0], [3, 4, 0], 10), m = BIO.holdTo([0, 0, 0], [3, 4, 0], 2.5);
  ok('BIO.holdTo leaves a point in reach alone, and brings one past it to the reach, on its own line', p[0] === 3 && p[1] === 4 && Math.abs(m[0] - 1.5) < 1e-9 && Math.abs(m[1] - 2) < 1e-9, [p, m]);
}
// 5. a decoration jittered off its twig
{
  const twig = (snap) => {
    const { BIO } = page(); let L;
    BIO.tree(0, 0, () => { BIO.beam('rod', [0, 10, 0], [8, 12, 0], .1, .05, 0x553311); L = BIO.segs; });
    for (let i = 0; i < 12; i++) { const p = [4 + (i % 4 - 1.5) * 1.5, 11 + 2.2 * (i % 2 ? 1 : -1), 2.5 * (i % 3 - 1)], q = snap ? BIO.snapSeg(L, p).p : p; BIO.put('stiff', q, Q, [.5, .5, .5], G); }
    BIO.bake(); return BIO.attachAudit({ ground });
  };
  ok('flowers jittered 2 m off the twig float', twig(false).floating > 6, twig(false));
  ok('...the same draws snapped to the span do not', twig(true).floating === 0, twig(true));
}
// 6. a flower in a bush: {onLeaf:true}, the card's body and no further
{
  const bush = (item, x, y) => {
    const { BIO } = page();
    BIO.put('rod', [0, 3, 0], Q, [.2, 6, .2], 0x553311);        /* what holds the bush */
    BIO.put('clump', [0, 5, 0], Q, [4, 3, 4], G);               /* the bush: a card 4 m wide, centred */
    BIO.put(item, [x, y, 0], Q, [.3, .3, .3], G); BIO.bake();
    return BIO.attachAudit({ ground });
  };
  ok('a flower in the card\'s body is held', bush('bloom', 1.6, 5.5).floating === 0, bush('bloom', 1.6, 5.5));
  ok('negative: the same place, an item not onLeaf, floats', bush('stiff', 1.6, 5.5).floating === 1, bush('stiff', 1.6, 5.5));
  ok('negative: past the card\'s width it floats', bush('bloom', 2.6, 5.5).floating === 1, bush('bloom', 2.6, 5.5));
  ok('negative: over its top it floats', bush('bloom', 1.6, 7).floating === 1, bush('bloom', 1.6, 7));
  const { BIO } = page();
  BIO.put('rod', [0, 3, 0], Q, [.2, 6, .2], 0x553311); BIO.put('clump', [0, 5, 0], Q, [4, 3, 4], G); BIO.put('bloom', [1.6, 5.5, 0], Q, [.3, .3, .3], G); BIO.bake();
  const S = BIO.attachAudit({ ground, offset: [0, 6, 0] });
  ok('negative control: lifted 6 m with the rest, it floats too', S.byItem['biome:bloom'].floating === 1, S.byItem);
  const { BIO: B2 } = page();
  B2.put('bloom', [0, 8, 0], Q, [.3, .3, .3], G); B2.put('bloom', [.1, 8, 0], Q, [3, 3, 3], G); B2.bake();
  ok('negative: an onLeaf card holds no other', B2.attachAudit({ ground }).floating === 2);
}
// 7. a tree drawn twice at one spot, near and far: a card answers to its own tier
{
  const tiers = (nearRod) => {
    const { BIO } = page();
    BIO.owner = [10, 10];
    BIO.range = 300; BIO.minRange = 0;
    if (nearRod) BIO.beam('rod', [10.4, 0, 10], [10.4, 10, 10], .3, .3, 0x553311);
    BIO.put('clump', [10.5, 8, 10], Q, [2, 2, 2], G);
    BIO.range = 1e9; BIO.minRange = 300;
    BIO.beam('rod', [10.5, 0, 10], [10.5, 10, 10], .3, .3, 0x553311);    /* the far tier's, a shade nearer the card */
    BIO.owner = null; BIO.range = null; BIO.minRange = 0;
    BIO.bake(); return BIO.attachAudit({ ground });
  };
  const A = tiers(true), B = tiers(false);
  ok('held by its own tier, with the far bark closer: no split', A.floating === 0 && A.split === 0, A);
  ok('negative: only the far tier holds it: a split', B.split === 1, B);
}
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
