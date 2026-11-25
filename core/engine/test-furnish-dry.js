// node core/engine/test-furnish-dry.js: a DRY draw's furniture (91f-furnish.js svfDryBegin, svfDryFlush; S2-C24). A host
// that draws a kit's buildings itself (settlements/isle-demo/bundles.py ISK.proto) places them dry, and FURNISH placed
// nothing there. Here the engine (10-core, 27-mat, 30-geo, 36-def, 91f) runs on the pinned three.js r128 with core/furnish
// and the real catalog (kits/catalog/furniture_bundle.py: the generic pieces), and a building with a room is drawn twice:
// by the kit's own page (buildWorld: placed, registered, the page's batch) and by a host, dry, with the queue open. The
// host's pieces must be the page's (keys, places within 1 mm, seeds, the drawn triangles), every time it draws.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));

/* the catalog as the pages seal it (furniture_bundle.py), made once */
const CULTURES = ['generic', 'generic-goods'];
const CATALOG = (() => {
  const code = 'import sys; sys.path.insert(0, sys.argv[1]); import furniture_bundle as f; sys.stdout.write(f.bundle(sys.argv[2].split(",")))';
  for (const py of [process.env.PYTHON, 'python3', 'python'].filter(Boolean)) {
    try { return cp.execFileSync(py, ['-c', code, path.join(ROOT, 'kits', 'catalog'), CULTURES.join(',')], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] }); }
    catch (e) { /* the next name */ }
  }
  throw new Error('test-furnish-dry: no python to run kits/catalog/furniture_bundle.py');
})();

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
/* one page's engine in a fresh context: the kit's shell stood in (its KIT and tables, no document, vertex-colour mode) */
function engine() {
  const el = { style: {}, textContent: '' };
  const con = { log: console.log, warn: () => {}, error: () => {} };
  const ctx = { THREE, Math, console: con, performance: { now: () => 0 }, location: { search: '', hash: '' },
    document: { getElementById: () => el }, Float32Array, Uint8Array, Uint16Array, Uint32Array };
  ctx.globalThis = ctx; ctx.window = ctx; ctx.addEventListener = () => {}; vm.createContext(ctx);
  const run = (src, name) => vm.runInContext(src, ctx, { filename: name });
  for (const f of ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js']) run(read(f), f);
  run(CATALOG, 'furniture_bundle.py');
  for (const f of ['core/furnish/50-core-furnish.js', 'core/furnish/52-core-furnish-draw.js', 'core/furnish/53-core-furnish-host.js']) run(read(f), f);
  /* the page's shell (90-scene.js, 92-world.js and the kit's 26k-kit.js, stood in) */
  run(`var KMAT = { mode: 'vc' }; const KIT = { id: 'test', culture: 'generic', pack: 'test', furnDetail: .6, frag: 'test' };
    const SV_LIB = {}, KIT_FALLBACK = [], SV_TILE0 = {}, SV_CLOTH = {}, SV_CUT = {};
    var WORLD = null, AT = { x: 0, z: 0, ry: 0 }; var buildWorld = function () { place('t-room', AT.x, AT.z, AT.ry, { y: 0 }); return WORLD; };`, 'shell');
  /* the old engine (no dry queue) runs here too and fails the checks, not the run */
  run(`var DRYFLUSH = G => typeof svfDryFlush === 'function' ? svfDryFlush(G) : { placed: 0, tris: 0, missing: {}, records: [], group: null };`, 'old');
  for (const f of ['core/engine/10-core.js', 'core/engine/27-mat.js', 'core/engine/30-geo.js', 'core/engine/36-def.js', 'core/engine/91f-furnish.js']) run(read(f), f);
  /* a house with a room: its floor, four pieces on the floor (a lamp: a halo), one hung, one the catalog lacks */
  run(`defBuilding({ key: 't-room', name: 'Test room', w: 6, d: 5, h: 3, seed: 41, tags: { wealth: 'rich' }, build(o) {
      box('plain', 0, 0, 0, 6, .2, 5, 0xc8b090);
      FURNISH('generic_chest', -2, .2, -1.5, 0);
      FURNISH('generic_poor_lamp', 2, .2, -1.5, Math.PI / 2);
      FURNISH('generic_barrel', 2, .2, 1.5, .3, { v: 1 });
      FURNISH('generic_crate', -2.2, .2, 1.6, -.4, { setting: 'outdoor' });
      FURNISH_HANG('generic_hanging_larder', 0, 2.8, 0, 0);
      FURNISH('no_such_piece', 0, .2, 0, 0); } });`, 'def');
  return { run, ctx };
}
const AT = '{ x: 12.5, z: -7.25, ry: .6 }';

/* the kit's own page: buildWorld places it, registers it, furnishes it from the page's batch */
const P = engine();
P.run(`AT = ${AT}; WORLD = new THREE.Group(); buildWorld();`);
const page = P.run(`({ recs: SVF.placed.map(r => ({ key: r.key, x: r.x, y: r.y, z: r.z, ry: r.ry, seed: r.seed, variant: r.variant, setting: r.setting })),
  tris: Math.round(SVF.batch.tris), halos: HALOS.map(h => [h.x, h.y, h.z, h.big]), missing: Object.assign({}, SVF.missing), tid: REG[0].tid,
  meshes: SVF.group.children.map(m => ({ name: m.name, n: m.geometry.attributes.position.count, p: Array.from(m.geometry.attributes.position.array) })) })`);

/* a host's draw (ISK.proto's shape): the buckets its own, the clock pinned, place() dry; open the queue first or not */
const hostDraw = (H, queue) => H.run(`(() => { GB = {}; GTARGET = GB; resetCM(); halosReset(); const G = new THREE.Group();
  ${queue ? 'if (typeof svfDryBegin === "function") svfDryBegin();' : ''} const d = PLACE_DRY; PLACE_DRY = 1; let rec = null; try { rec = place('t-room', ${AT}.x, ${AT}.z, ${AT}.ry, { y: 0 }); } finally { PLACE_DRY = d; }
  flushBuckets(GB, G, false); const F = DRYFLUSH(G);
  return { placed: F.placed, tris: F.tris, missing: F.missing, registered: REG.length, tid: rec.tid, open: typeof SVF_DRY !== 'undefined' && SVF_DRY !== null,
    recs: F.records.map(r => ({ key: r.key, x: r.x, y: r.y, z: r.z, ry: r.ry, seed: r.seed, variant: r.variant, setting: r.setting })),
    halos: HALOS.map(h => [h.x, h.y, h.z, h.big]), pageBatch: SVF.batch ? SVF.batch.placements.length + '/' + SVF.placed.length : 'none',
    meshes: F.group ? F.group.children.map(m => ({ name: m.name, n: m.geometry.attributes.position.count, p: Array.from(m.geometry.attributes.position.array) })) : [] }; })()`);

/* the host's pieces are the page's: keys, places within 1 mm, turns, seeds, variants, settings, and the drawn vertices */
const near = (a, b) => Math.abs(a - b) < 1e-3;
function sameAsPage(h) {
  if (!h || h.recs.length !== page.recs.length || h.placed !== page.recs.length) return false;
  for (let i = 0; i < page.recs.length; i++) { const a = page.recs[i], b = h.recs[i];
    if (a.key !== b.key || !near(a.x, b.x) || !near(a.y, b.y) || !near(a.z, b.z) || !near(a.ry, b.ry) || a.seed !== b.seed || a.variant !== b.variant || a.setting !== b.setting) return false; }
  if (h.tris !== page.tris || h.meshes.length !== page.meshes.length) return false;
  for (let i = 0; i < page.meshes.length; i++) { const a = page.meshes[i], b = h.meshes[i];
    if (a.name !== b.name || a.n !== b.n) return false;
    for (let k = 0; k < a.p.length; k++) if (!near(a.p[k], b.p[k])) return false; }
  return true;
}

T.ok('the page furnishes its room: five pieces from the catalog, the missing one counted', page.recs.length === 5 && page.missing.no_such_piece === 1 && page.tris > 100 && page.tid != null,
  page.recs.length + ' ' + JSON.stringify(page.missing));
T.ok('the page\'s pieces turn with the building and take their seeds from it', page.recs.every(r => r.seed > 0) && near(page.recs[0].ry, .6) && page.recs[3].setting === 'outdoor' && page.recs[0].setting === 'indoor');

const H = engine();
const first = hostDraw(H, true);
T.ok('a dry host draw with the queue open is furnished as the page is (keys, places within 1 mm, seeds, triangles, vertices)', sameAsPage(first),
  first.placed + ' pieces, ' + first.tris + ' tris (page ' + page.recs.length + ', ' + page.tris + ')');
T.ok('it registers nothing (no building record, no tags id) and counts the missing piece on its queue', first.registered === 0 && first.tid === null && first.missing.no_such_piece === 1 &&
  H.run('Object.keys(SVF.missing).length === 0 && SVF.placed.length === 0'));
T.ok('its lamp is a halo, as on the page', JSON.stringify(first.halos.map(q => q.map(v => typeof v === 'number' ? +v.toFixed(3) : v))) === JSON.stringify(page.halos.map(q => q.map(v => typeof v === 'number' ? +v.toFixed(3) : v))) && first.halos.length > 0);
const onPage = hostDraw(P, true);
T.ok('the flush closes the queue; on a page that also draws dry, the page\'s own batch and records are left alone', !first.open && first.pageBatch === 'none' && sameAsPage(onPage) && onPage.pageBatch === '5/5', onPage.pageBatch);
T.neg('the stub (no queue open: a dry FURNISH places nothing) leaves the room bare', sameAsPage, hostDraw(engine(), false), first);

const second = hostDraw(H, true);
T.ok('a second draw is furnished the same and does not double the pieces', sameAsPage(second) && second.placed === first.placed);
T.ok('the pieces of both draws share one material per family', H.run('typeof SVF_DRYMATS === "undefined" ? -1 : Object.keys(SVF_DRYMATS).length') === first.meshes.length);
/* a queue left open over two draws would carry the first draw's pieces into the second: the check sees it */
const doubled = H.run(`(() => { GB = {}; GTARGET = GB; resetCM(); halosReset(); const G = new THREE.Group(); if (typeof svfDryBegin === "function") svfDryBegin(); PLACE_DRY = 1;
  try { place('t-room', ${AT}.x, ${AT}.z, ${AT}.ry, { y: 0 }); place('t-room', ${AT}.x, ${AT}.z, ${AT}.ry, { y: 0 }); } finally { PLACE_DRY = 0; }
  const F = DRYFLUSH(G); return { placed: F.placed, tris: F.tris, recs: F.records.map(r => ({ key: r.key, x: r.x, y: r.y, z: r.z, ry: r.ry, seed: r.seed, variant: r.variant, setting: r.setting })), meshes: [] }; })()`);
T.neg('two draws into one open queue double the pieces, and the check sees it', h => h.placed === page.recs.length && h.recs.length === page.recs.length, doubled, second);
const after = hostDraw(H, false);
T.ok('after a flush a dry draw with no queue open places nothing, as before', after.placed === 0 && after.meshes.length === 0 && !after.open);
T.done();
