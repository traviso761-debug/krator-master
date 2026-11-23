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
    onecut: { lib: 'card.broadleaf', plants: 1, anchor: 'center', sheet: 'geometry' }, /* ONE spray cut into nine cells: refused (ehighlands' beech) */
    onecells: { lib: 'card.broadleaf', plants: 1, anchor: 'center' },               /* ...the same cut by BIO.geo.cells in the code: refused */
    old: { lib: 'card.fern' }                                                        /* a pack before the guard: never refused, but reported */
  });
  const M = {}; for (const k of ['fern', 'fernok', 'sheet', 'sheetcut', 'crown', 'crowncells', 'moss', 'onecut', 'onecells', 'old']) M[k] = card();
  BIO.libSwap('k', M);
  BIO.def('fern', BIO.geo.frond(4), M.fern); BIO.def('fernok', BIO.geo.frond(4), M.fernok);
  BIO.def('sheet', new THREE.PlaneGeometry(1, 1), M.sheet); BIO.def('sheetcut', new THREE.PlaneGeometry(1, 1), M.sheetcut);
  BIO.def('crown', BIO.geo.clump(), M.crown); BIO.def('crowncells', BIO.geo.cells(BIO.geo.clump(), { n: 3 }), M.crowncells);
  BIO.def('moss', BIO.geo.clump(), M.moss); BIO.def('old', BIO.geo.frond(4), M.old);
  BIO.def('onecut', BIO.geo.clump(), M.onecut); BIO.def('onecells', BIO.geo.cells(BIO.geo.clump(), { n: 3, scale: .75 }), M.onecells);
  const refused = new Set(BIO.cardFaults.map(f => f.item));
  ok('a library fern on a frond with no base is refused, through the error panel', refused.has('fern') && errs.some(e => /card fern/.test(e)), [...refused]);
  ok('a sheet drawn whole is refused; a crown sheet with no stems is refused', refused.has('sheet') && refused.has('crown'));
  ok('a ONE-plant card cut into cells is refused, by "sheet": "geometry" or by BIO.geo.cells', refused.has('onecut') && refused.has('onecells'), [...refused]);
  ok('negative: a cut, a base, cells on a sheet, a whole centre spray and a pack that says nothing all pass', !refused.has('fernok') && !refused.has('sheetcut') && !refused.has('crowncells') && !refused.has('moss') && !refused.has('old'), [...refused]);
  ok('each slot is refused once', BIO.cardFaults.length === 5, BIO.cardFaults.length);
  ok('a slot whose pack says nothing of its image is listed as mute (and only it)', BIO.cardMute.length === 1 && BIO.cardMute[0] === 'old', BIO.cardMute);
  const gc = BIO.guardChecks({}), gn = BIO.guardNegatives({});
  ok('guardChecks reports the faults and the mute slot; its negatives (a fern with no base, one plant in cells) fail as they must',
    gc[0].ok === false && gc[1].ok === false && /old/.test(gc[1].detail) && gn[0].failed === true && gn[1].failed === true, [gc[1], gn[1]]);
}

// 1b. point to segment, and the inside-out probe
{
  const { BIO } = page();
  const a = { x: 0, y: 0, z: 0 }, b = { x: 4, y: 0, z: 0 };
  ok('segDist: the middle of a segment, past its end, and on it', Math.abs(BIO.segDist(2, 1, 0, a, b) - 1) < 1e-9 && Math.abs(BIO.segDist(7, 0, 4, a, b) - 5) < 1e-9 && BIO.segDist(1, 0, 0, a, b) === 0);
  const ground = () => 0, mk = (flip) => { const g = new THREE.PlaneGeometry(4, 4); g.rotateX(flip ? Math.PI / 2 : -Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial()); m.position.set(0, 2, 0); return m; };
  const roof = mk(true); roof.position.y = -3;   /* faces down, but under the ground: a cave's roof, not counted */
  const io = BIO.insideOut({ ground, meshes: [mk(true), mk(false), roof] });
  ok('insideOut: a disc 2 m up wound toward the ground is found; one wound up, and a down-facing roof under the ground, are not', io.length === 1 && io[0].share === 1, io);
  const dbl = mk(true); dbl.material.side = THREE.DoubleSide;
  ok('negative: a double-sided disc is never inside out', BIO.insideOut({ ground, meshes: [dbl] }).length === 0);
}

// a small forest: rods and leaf cards, one tree owned and keyed, one with leaves off its branch
const SPRIGS = [{ cell: [0, 0, .33, .33], stem: [.02, .03], tip: [.3, .32], w: [-.1, .1] }];
function forest(o) {
  const { BIO, card } = page(o.twig != null ? { twig: { lib: 'card.spruce', plants: 9, anchor: 'center', stems: SPRIGS } } : null);
  if (o.ownBox) BIO.LOD.ownBox = true;
  const leaf = BIO.leafMat(new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat), 'leaf', {});
  BIO.def('rod', new THREE.CylinderGeometry(.5, .5, 1, 6), new THREE.MeshLambertMaterial());
  BIO.def('clump', BIO.geo.clump(), leaf);
  BIO.def('raft', BIO.geo.clump(), leaf, { free: true });
  /* a crown held by its stems (o.twig: the clump's origin, its stems, o.twig m above the bough's axis at x 11, a metre from the 2 m points
     the audit sampled rods at before 2026-11-15) */
  if (o.twig != null) { const tm = BIO.leafMat(new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat), 'twig', {}); BIO.libSwap('k', { twig: tm }); BIO.def('twig', BIO.geo.clump(), tm); }
  const Q = new THREE.Quaternion();
  // tree A at (10, 10): a bole from 0 to 8 m and a bough out to (14, 8, 10); cards at the bough's tip and on the bole
  BIO.owner = [10, 10]; BIO.range = o.rodRange || 300;
  BIO.beam('rod', [10, 0, 10], [10, 8, 10], .4, .3, 0x553311); BIO.beam('rod', [10, 8, 10], [14, 8, 10], .2, .1, 0x553311);
  BIO.range = o.leafRange || 300;
  BIO.put('clump', [14, 8.2, 10], Q, [1.5, 1.5, 1.5], 0x336622); BIO.put('clump', [10, 8.3, 10], Q, [1.5, 1.5, 1.5], 0x336622);
  if (o.unowned) { BIO.owner = null; BIO.put('clump', [10.2, 7.5, 10], Q, [1.5, 1.5, 1.5], 0x336622); BIO.owner = [10, 10]; }
  // a card hung 6 m beside the bough, held by nothing
  if (o.floating) BIO.put('clump', [14, 8, 16], Q, [1.5, 1.5, 1.5], 0x336622);
  if (o.twig != null) BIO.put('twig', [11, 8 + o.twig, 10], Q, [1.5, 1.5, 1.5], 0x336622);
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
  ok('guardChecks fails the floating card; its negatives (lifted, four times the range, the inside-out disc) fail as they must',
    gc.find(c => /attach audit/.test(c.name)).ok === false && gn.filter(n => /lifted|four times|inside|cells/.test(n.name)).every(n => n.failed) && gn.length === 5, gn);
  ok('guardChecks on a page with nothing inside out passes that check', gc.find(c => /inside out/.test(c.name)).ok === true);
}

// 4. a crown held by its stems: the stem on its twig, measured point to segment
{
  const H = forest({ twig: .1 }).attachAudit({ ground });
  ok('a stem-held clump 0.1 m off the bough\'s axis, between two of the old sample points, is held', H.stemmed === 1 && H.stemFloat === 0, H);
  const L = forest({ twig: .5 }).attachAudit({ ground });
  ok('negative: the same clump 0.5 m off its twig misses (the old tolerance, .25 x 1.5 + .5 = 0.875 m, held it)', L.stemmed === 1 && L.stemFloat === 1, L);
  const B = forest({ twig: .1 }), gn = B.guardNegatives({ ground });
  const n = gn.find(x => /stem-held/.test(x.name));
  ok('guardNegatives lifts every stem-held clump 0.4 m: it fails as it must', n && n.failed, gn);
  ok('guardChecks lists the stem check and it passes on the held clump', B.guardChecks({ ground }).some(c => /stems sit on their twigs/.test(c.name) && c.ok));
}
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
