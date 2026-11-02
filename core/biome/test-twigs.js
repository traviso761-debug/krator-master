// node core/biome/test-twigs.js: a tree's structure and a crown held by it (20-core-kit.js, 2026-11-01): the BIO.tree scope, the
// log BIO.beam and BIO.tube write in it, BIO.twigEnds, BIO.snapSeg and BIO.clumpOn, read back through the attachment audit. Each
// check with a negative. Opt-in: with no scope nothing is logged.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (m, c, x) => { console.log((c ? 'ok   ' : 'FAIL ') + m + (c || x === undefined ? '' : '  (' + JSON.stringify(x) + ')')); if (!c) fails++; };

function page() {
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/31b-core-leafset.js'])
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO;
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => { throw new Error(m); } });
  BIO.def('rod', new THREE.CylinderGeometry(.5, .5, 1, 6), new THREE.MeshLambertMaterial());
  BIO.def('clump', BIO.geo.clump(), BIO.leafMat(new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat), 'leaf', {}));
  return BIO;
}
const BROWN = 0x553311, GREEN = 0x336622;
// a bole, a bough, and three twigs at the bough's end (the bough's own tip carries them on)
function grow(BIO) {
  BIO.beam('rod', [10, 0, 10], [10, 8, 10], .4, .3, BROWN); BIO.beam('rod', [10, 8, 10], [16, 9, 10], .2, .1, BROWN);
  BIO.beam('rod', [16, 9, 10], [19, 11, 12], .08, .04, BROWN); BIO.beam('rod', [16, 9, 10], [19, 10, 8], .08, .04, BROWN); BIO.beam('rod', [16, 9, 10], [18, 12, 10], .08, .04, BROWN);
}
const posOf = (BIO, name) => { const m = BIO.items[name].m; const a = []; for (let i = 0; i < BIO.items[name].count; i++) a.push([m.a[i * 16 + 12], m.a[i * 16 + 13], m.a[i * 16 + 14]]); return a; };

// 1. the scope
{
  const BIO = page();
  BIO.range = 500; BIO.owner = [1, 2];
  grow(BIO); ok('outside a scope nothing is logged (a kit that never opens one is unchanged)', BIO.segs === null);
  let seen = null;
  const L = BIO.tree(10, 10, segs => { seen = [BIO.owner, BIO.range, BIO.chunk, BIO.segs === segs]; grow(BIO); }, { range: 300, chunk: 200 });
  ok('inside: owner the tree\'s foot, the scope\'s range and chunk, the log live', seen[0][0] === 10 && seen[1] === 300 && seen[2] === 200 && seen[3], seen);
  ok('every beam is logged', L.length === 5, L.length);
  ok('after: owner, range, chunk and the log put back', BIO.owner[0] === 1 && BIO.range === 500 && BIO.chunk == null && BIO.segs === null);
  let threw = false; try { BIO.tree(3, 3, () => { throw new Error('x'); }); } catch (e) { threw = true; }
  ok('...also on a throw', threw && BIO.owner[0] === 1 && BIO.segs === null);
  const outer = BIO.tree(0, 0, () => { BIO.beam('rod', [0, 0, 0], [0, 1, 0], .1, .1, BROWN); BIO.tree(5, 5, () => BIO.beam('rod', [5, 0, 5], [5, 1, 5], .1, .1, BROWN)); BIO.beam('rod', [0, 1, 0], [0, 2, 0], .1, .1, BROWN); });
  ok('a scope inside a scope keeps its own log, and the outer one carries on', outer.length === 2, outer.length);
}

// 2. a tube logs its spans; twigEnds finds the free ends
{
  const BIO = page(); BIO.bucket('barkT');
  const L = BIO.tree(0, 0, () => {
    BIO.tube('barkT', [{ x: 0, y: 0, z: 0, r: .4 }, { x: 0, y: 4, z: 0, r: .3 }, { x: 1, y: 8, z: 0, r: .1 }], BROWN, { seg: 3 });
    BIO.tube('barkT', [{ x: 1, y: 8, z: 0, r: .1 }, { x: 3, y: 9, z: 0, r: .05 }], BROWN, { seg: 3 });
  });
  ok('a tube logs one span a pair of rings, with their radii, and marks its last', L.length === 3 && L[1].r1 === .1 && !L[0].end && L[1].end && L[2].end, L);
  const E = BIO.twigEnds(L);
  ok('a tube carried on by another is not an end; the one that stops is', E.length === 1 && E[0].b[0] === 3, E);
  ok('negative: rMax under the tip\'s radius leaves none', BIO.twigEnds(L, { rMax: .01 }).length === 0);
}
{
  const BIO = page(), L = BIO.tree(10, 10, () => grow(BIO));
  ok('of a bole, a bough and three twigs, the twigs are the ends', BIO.twigEnds(L).length === 3 && BIO.twigEnds(L).every(s => s.a[0] === 16), BIO.twigEnds(L).length);
  const S = BIO.snapSeg(L, [19.5, 11.5, 12.5]);
  ok('snapSeg lands past a twig\'s tip on the tip', S.t === 1 && S.p[0] === 19 && S.p[2] === 12 && S.d > .5, S);
  const M = BIO.snapSeg(L, [10.5, 4, 10]);
  ok('...and beside a bole on its axis', M.seg === L[0] && Math.abs(M.p[1] - 4) < 1e-9 && Math.abs(M.d - .5) < 1e-9, M);
  ok('negative: no spans, no answer', BIO.snapSeg([], [0, 0, 0]) === null);
}

// 3. clumpOn: on the twigs, its own draws
{
  const BIO = page(); let L;
  BIO.tree(10, 10, () => { grow(BIO); L = BIO.segs; BIO.clumpOn('clump', L, { n: 30, size: [1, 2], flat: .7, col: GREEN }); });
  const P = posOf(BIO, 'clump'), E = BIO.twigEnds(L);
  ok('every card has its origin on a twig end', P.length === 30 && P.every(p => BIO.snapSeg(E, p).d < 1e-5), P.length);
  const seen = new Set(P.map(p => BIO.snapSeg(E, p).seg)); ok('...and every twig has its share', seen.size === 3, seen.size);
  ok('...in the outer part of the twig (t .6 to 1)', P.every(p => BIO.snapSeg(E, p).t >= .6 - 1e-6));
  const twice = () => { const B = page(); B.fn.reseed(5); for (let i = 0; i < 4; i++) B.fn.rng(); const a = B.fn.rng(); B.fn.reseed(5); for (let i = 0; i < 4; i++) B.fn.rng();
    B.tree(10, 10, () => { grow(B); B.clumpOn('clump', B.segs, { n: 20, size: 1, col: GREEN }); }); return [a, B.fn.rng(), posOf(B, 'clump')]; };
  const A = twice(), B2 = twice();
  ok('it takes nothing from the page\'s stream', A[0] === A[1], A.slice(0, 2));
  ok('...and draws the same crown again', JSON.stringify(A[2]) === JSON.stringify(B2[2]));
  const B3 = page(); B3.tree(10, 10, () => { grow(B3); B3.clumpOn('clump', B3.segs, { n: 20, size: 1, col: GREEN, salt: 9 }); });
  ok('negative: another salt draws another crown', JSON.stringify(posOf(B3, 'clump')) !== JSON.stringify(A[2]));
  const B4 = page(); let c; B4.tree(10, 10, () => { grow(B4); c = B4.clumpOn('clump', B4.segs, { n: 12, col: GREEN, accept: p => p[1] < 10.5 }); });
  ok('accept skips, and the count says so', c < 12 && c === B4.items.clump.count, c);
  const B5 = page(); B5.tree(10, 10, () => { grow(B5); B5.clumpOn('clump', B5.segs, { per: 2, all: true, rMax: .1, t0: 0, col: GREEN }); });
  ok('per and all: twigs and the bough\'s thin end, two a span', B5.items.clump.count === 8, B5.items.clump.count);
  const B6 = page(); B6.tree(10, 10, () => { grow(B6); B6.clumpOn('clump', B6.segs, { n: 3, col: GREEN, leaf: { angle: .8 } }); });
  ok('leaf: a card held by its stem, turned by BIO.leafOn', B6.items.clump.count === 3);
}

// 4. through the attachment audit, as the guards read a page
const ground = () => 0;
function crownOf(how) {
  const BIO = page(), Q = new THREE.Quaternion(); BIO.def('tuft', BIO.geo.leafCard(), BIO.defs.clump.mat);
  BIO.tree(10, 10, () => { grow(BIO);
    if (how === 'on') BIO.clumpOn('tuft', BIO.segs, { n: 60, size: 2, col: GREEN, leaf: {} });
    else if (how === 'snap') for (let i = 0; i < 60; i++) { const a = i * 2.4, r = BIO.snapSeg(BIO.twigEnds(BIO.segs), [18 + Math.cos(a) * 5, 11 + Math.sin(i) * 3, 10 + Math.sin(a) * 5]); BIO.put('tuft', r.p, Q, 2, GREEN); }
    else for (let i = 0; i < 60; i++) { const a = i * 2.4; BIO.put('tuft', [18 + Math.cos(a) * 5, 11 + Math.sin(i) * 3, 10 + Math.sin(a) * 5], Q, 2, GREEN); }
  }, { range: 300 });
  BIO.bake(); return BIO.attachAudit({ ground });
}
{
  const V = crownOf('volume'), W = crownOf('on'), S = crownOf('snap');
  ok('negative: a crown at points in its volume floats, as necanyons\' did', V.audited === 60 && V.share > .3, V.share);
  ok('the same crown by clumpOn: none float', W.audited === 60 && W.floating === 0, W.floating);
  ok('...and it keeps its tree\'s chunk and range', W.split === 0 && W.outrange === 0, W);
  ok('a pass\'s own loop, each card moved by snapSeg: none float', S.audited === 60 && S.floating === 0, S.floating);
}

console.log(fails ? fails + ' FAILED' : 'all ok');
process.exit(fails ? 1 : 0);
