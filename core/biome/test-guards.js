// node core/biome/test-guards.js: the biome core's guards (20-core-kit.js, 2026-10-27): the card guard (BIO.def refuses a
// library card it cannot draw right), one box a chunk (a tree's parts switch at one distance) and the attachment audit
// (cards held by their structure, in their structure's chunk and range). Each check with a negative.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (m, c, x) => { console.log((c ? 'ok   ' : 'FAIL ') + m + (c || x === undefined ? '' : '  (' + JSON.stringify(x) + ')')); if (!c) fails++; };

function page(pack) {
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js'])
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, errs = [];
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m) });
  ctx.KMAT = { mode: 'lib', packed: (kit, slot) => (pack || {})[slot] || null, textures: () => ({ map: new THREE.Texture() }) };
  const card = () => new THREE.MeshLambertMaterial({ map: new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat) });
  return { BIO, errs, card };
}

// 1. the card guard
{
  const { BIO, errs, card } = page({
    fern: { lib: 'card.fern', plants: 1, anchor: 'bottom' },                         /* no base on a frond: refused */
    fernok: { lib: 'card.fern', plants: 1, anchor: 'bottom', base: 'bottom', cell: [.1, .05, .9, .99] },
    sheet: { lib: 'card.reed', plants: 9 },                                          /* a sheet, no cell: refused */
    sheetcut: { lib: 'card.reed', plants: 9, cell: [.34, .34, .66, .66] },
    crown: { lib: 'card.pine', plants: 9 },                                          /* a crown sheet, no stems: refused */
    crowncells: { lib: 'card.pine', plants: 9 },                                     /* ...unless cut by BIO.geo.cells */
    moss: { lib: 'card.moss', plants: 1, anchor: 'center' },                         /* a spray seen from above: fine */
    old: { lib: 'card.fern' }                                                        /* a pack before the guard: never refused */
  });
  const M = {}; for (const k of ['fern', 'fernok', 'sheet', 'sheetcut', 'crown', 'crowncells', 'moss', 'old']) M[k] = card();
  BIO.libSwap('k', M);
  BIO.def('fern', BIO.geo.frond(4), M.fern); BIO.def('fernok', BIO.geo.frond(4), M.fernok);
  BIO.def('sheet', new THREE.PlaneGeometry(1, 1), M.sheet); BIO.def('sheetcut', new THREE.PlaneGeometry(1, 1), M.sheetcut);
  BIO.def('crown', BIO.geo.clump(), M.crown); BIO.def('crowncells', BIO.geo.cells(BIO.geo.clump(), { n: 3 }), M.crowncells);
  BIO.def('moss', BIO.geo.clump(), M.moss); BIO.def('old', BIO.geo.frond(4), M.old);
  const refused = new Set(BIO.cardFaults.map(f => f.item));
  ok('a library fern on a frond with no base is refused, through the error panel', refused.has('fern') && errs.some(e => /card fern/.test(e)), [...refused]);
  ok('a sheet drawn whole is refused; a crown sheet with no stems is refused', refused.has('sheet') && refused.has('crown'));
  ok('negative: a cut, a base, cells, a centre spray and a pack that says nothing all pass', !refused.has('fernok') && !refused.has('sheetcut') && !refused.has('crowncells') && !refused.has('moss') && !refused.has('old'), [...refused]);
  ok('each slot is refused once', BIO.cardFaults.length === 3, BIO.cardFaults.length);
  const gc = BIO.guardChecks({}), gn = BIO.guardNegatives({});
  ok('guardChecks reports the faults; its negative (a made-up fern with no base) fails as it must', gc[0].ok === false && gn[0].failed === true);
}

// a small forest: rods and leaf cards, one tree owned and keyed, one with leaves off its branch
function forest(o) {
  const { BIO, card } = page();
  if (o.ownBox) BIO.LOD.ownBox = true;
  const leaf = BIO.leafMat(new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat), 'leaf', {});
  BIO.def('rod', new THREE.CylinderGeometry(.5, .5, 1, 6), new THREE.MeshLambertMaterial());
  BIO.def('clump', BIO.geo.clump(), leaf);
  BIO.def('raft', BIO.geo.clump(), leaf, { free: true });
  const Q = new THREE.Quaternion();
  // tree A at (10, 10): a bole from 0 to 8 m and a bough out to (14, 8, 10); cards at the bough's tip and on the bole
  BIO.owner = [10, 10]; BIO.range = o.rodRange || 300;
  BIO.beam('rod', [10, 0, 10], [10, 8, 10], .4, .3, 0x553311); BIO.beam('rod', [10, 8, 10], [14, 8, 10], .2, .1, 0x553311);
  BIO.range = o.leafRange || 300;
  BIO.put('clump', [14, 8.2, 10], Q, [1.5, 1.5, 1.5], 0x336622); BIO.put('clump', [10, 8.3, 10], Q, [1.5, 1.5, 1.5], 0x336622);
  if (o.unowned) { BIO.owner = null; BIO.put('clump', [10.2, 7.5, 10], Q, [1.5, 1.5, 1.5], 0x336622); BIO.owner = [10, 10]; }
  // a card hung 6 m beside the bough, held by nothing
  if (o.floating) BIO.put('clump', [14, 8, 16], Q, [1.5, 1.5, 1.5], 0x336622);
  BIO.put('raft', [30, 3, 30], Q, [1, 1, 1], 0x336622);   /* free: never audited */
  BIO.owner = null; BIO.range = null;
  BIO.bake();
  return BIO;
}
const ground = () => 0;

// 2. one box a chunk
{
  const BIO = forest({});
  const E = BIO.lodMeshes, y = E.map(e => [e.y0, e.y1].join(','));
  ok('every chunk mesh of the tree shares one height range (bark and cards switch at one distance)', E.length >= 2 && new Set(y).size === 1, y);
  ok('...the widest of them: from the bole\'s foot to the highest card', E[0].y0 <= 4 && E[0].y1 >= 8.3, [E[0].y0, E[0].y1]);
  const O = forest({ ownBox: true }).lodMeshes, oy = O.map(e => [e.y0, e.y1].join(','));
  ok('negative: with BIO.LOD.ownBox each mesh keeps its own box (they differ)', new Set(oy).size > 1, oy);
}

// 3. the attachment audit
{
  const A = forest({}).attachAudit({ ground });
  ok('cards on the bough and the bole are held: none float', A.audited === 2 && A.floating === 0, A);
  ok('...in their structure\'s chunk and range (one LOD key per tree)', A.paired === 2 && A.split === 0 && A.outrange === 0, A);
  const F = forest({ floating: true }).attachAudit({ ground });
  ok('a card 6 m off the bough floats, and is named with where it is', F.floating === 1 && F.worst[0].item === 'biome:clump' && F.worst[0].at[2] === 16, F.worst);
  const R = forest({ rodRange: 200, leafRange: 600 }).attachAudit({ ground });
  ok('cards keyed to reach past their branches are caught', R.outrange === 2, R);
  const U = forest({ unowned: true }).attachAudit({ ground });
  ok('negative: a card keyed by its own position next to its tree\'s chunk still shares it here (one chunk)', U.split === 0, U);
  const S = forest({}).attachAudit({ ground, offset: [0, 6, 0] });
  ok('negative control: every card lifted 6 m floats', S.floating === S.audited && S.audited === 2, S);
  const N = forest({}).attachAudit({});
  ok('with no ground function it audits nothing and says so', N.audited === 0 && /ground/.test(N.note), N.note);
  const B = forest({ floating: true });
  const gc = B.guardChecks({ ground }), gn = B.guardNegatives({ ground });
  ok('guardChecks fails the floating card; its negatives (lifted, four times the range) fail as they must',
    gc.find(c => /attach audit/.test(c.name)).ok === false && gn.filter(n => /lifted|four times/.test(n.name)).every(n => n.failed) && gn.length === 3, gn);
}
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
