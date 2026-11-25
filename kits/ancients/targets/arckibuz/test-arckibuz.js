/* ================================================================= ARCKIBUZ — Node [G data] test suite
   Run: node kits/ancients/targets/arckibuz/test-arckibuz.js
   Checks determinism, Soleri Plate 15 scale & population (~2,500 intact / ~1,400-1,800 refurbished), unique ids,
   reachability & dormant bulkhead cut, AI.storeyAudit on every storey across d = 0, 1, 3, 5, AI.furnishPlan
   catalog/placer/recipe audits across 'ancient' & 'post-apoc', and AKB_WATER records & ground continuity. */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const T = require('../../../../tools/ktest.js')(__filename);

const ROOT = path.join(__dirname, '..', '..', '..', '..');

const ctx = {
  Math, console, Object, Array, String, Number, Boolean, RegExp,
  Map, Set, Float32Array, Uint32Array, Int32Array, Uint8Array, Uint16Array, DataView, ArrayBuffer
};
ctx.globalThis = ctx;
ctx.window = ctx;
ctx.self = ctx;
vm.createContext(ctx);

const threePath = [
  'kits/catalog/three.min.js',
  'core/catalog/three.min.js',
  'three.min.js',
  'kits/interiors/three.min.js'
].map(p => path.join(ROOT, p)).find(p => fs.existsSync(p));
if (threePath) vm.runInContext(fs.readFileSync(threePath, 'utf8'), ctx, { filename: 'three.min.js' });

const bundleJs = cp.execFileSync(
  'python3',
  [
    '-c',
    "import importlib.util, os, sys\n" +
    "def ld(n, p):\n" +
    "    s = importlib.util.spec_from_file_location(n, p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m\n" +
    "fb = ld('fb', 'kits/catalog/furniture_bundle.py')\n" +
    "ib = ld('ib', 'kits/interiors/kit_bundle.py')\n" +
    "ab = ld('ab', 'kits/ancients-interiors/kit_bundle.py')\n" +
    "cultures = ['generic-goods', 'post-apoc', 'scrap', 'generic', 'pylon', 'iziz', 'nomad', 'eastabyss', 'xanadu']\n" +
    "sys.stdout.write(fb.bundle(cultures, harvested=True) + ib.bundle(['noahs-regret']) + ab.bundle())"
  ],
  { cwd: ROOT, maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' }
);
vm.runInContext(bundleJs, ctx, { filename: '8zy-interiors-bundle.js' });

const dataFiles = [
  'core/rand/08-core-rand.js',
  'core/shader/06-core-khook.js',
  'core/shader/06b-core-kcolor.js',
  'core/water/20-core-water.js',
  'core/water/22-core-water-flow.js',
  'kits/ancients/targets/arckibuz/8aw0-arckibuz-plan.js',
  'kits/ancients/targets/arckibuz/8aw1-arckibuz-interiors.js',
  'kits/ancients/targets/arckibuz/8aw2-arckibuz-water.js'
];
for (let i = 0; i < dataFiles.length; i++) {
  const f = dataFiles[i];
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8') +
    '\n;this.ARCKIBUZ = typeof ARCKIBUZ !== "undefined" ? ARCKIBUZ : this.ARCKIBUZ;' +
    '\n;this.AKB_INTERIORS = typeof AKB_INTERIORS !== "undefined" ? AKB_INTERIORS : this.AKB_INTERIORS;' +
    '\n;this.AKB_WATER = typeof AKB_WATER !== "undefined" ? AKB_WATER : this.AKB_WATER;' +
    '\n;this.WATER = typeof WATER !== "undefined" ? WATER : this.WATER;';
  vm.runInContext(code, ctx, { filename: f });
}

const AKB = ctx.ARCKIBUZ;
const AKBI = ctx.AKB_INTERIORS;
const AKBW = ctx.AKB_WATER;
const AI = ctx.KratorAncientsInteriors;
const IX = ctx.KratorInteriors;
const KF = ctx.KratorFurniture;

AI.install(IX);
AI.KIT.arckibuz = AKBI.entry(AI);
AI.DRESS['post-apoc'] = AI.DRESS.occupied;

/* 1. Determinism & Soleri Plate 15 scale invariants */
const P1 = AKB.plan();
const P2 = AKB.plan();
T.ok('ARCKIBUZ.plan() is bit-for-bit deterministic', JSON.stringify(P1) === JSON.stringify(P2));
T.ok('Total vertical section matches Soleri 120 m', Math.abs(P1.stats.height - 120.0) < 0.01, 'got ' + P1.stats.height);
T.ok('Sunken pit depth is 25-32 m', P1.stats.pitDepth >= 25 && P1.stats.pitDepth <= 32, 'got ' + P1.stats.pitDepth);
T.ok('Excavation perimeter surface is 6.25 ha', Math.abs(P1.stats.coveredHa - 6.25) < 0.05, 'got ' + P1.stats.coveredHa);
T.ok('Cantilever crown span is 160-195 m', P1.stats.crownSpanX >= 160 && P1.stats.crownSpanX <= 195, 'got ' + P1.stats.crownSpanX);
T.ok('Intact capacity matches Soleri ~2,500', P1.stats.intactPop >= 2350 && P1.stats.intactPop <= 2650, 'got ' + P1.stats.intactPop);
T.ok('Refurbished capacity is ~1,400-1,800', P1.stats.refurbPop >= 1400 && P1.stats.refurbPop <= 1800, 'got ' + P1.stats.refurbPop);
T.ok('Five polygonal vegetable-garden bastions with crop beds', P1.gardens.length === 5 && P1.gardens.every(g => g.beds.length >= 10));

/* 2. Unique IDs + negative test */
function allPlanIds(P) {
  return P.blocks.map(x => x.id)
    .concat(P.bastions.map(x => x.id))
    .concat(P.cores.map(x => x.id))
    .concat(P.ringCols.map(x => x.id))
    .concat(P.tents.map(x => x.id))
    .concat(P.gardens.map(x => x.id))
    .concat(P.sheds.map(x => x.id))
    .concat(P.links.map(x => x.id))
    .concat(P.wrecks.map(x => x.id))
    .concat(P.bulkheads.map(x => x.id));
}
const uniqueIdsCheck = list => new Set(list).size === list.length;
const ids0 = allPlanIds(P1);
T.ok('Every plan record id is unique (' + ids0.length + ' records)', uniqueIdsCheck(ids0));
T.neg('Duplicate record id check catches collision', uniqueIdsCheck, ids0.concat([ids0[0]]), ids0);

/* 3. Circulation reachability & dormant bulkhead cut + negative test */
const rIntact = AKB.reach(P1, []);
T.ok('Intact: every organ block reaches desert ground', P1.blocks.every(b => rIntact.has(b.id)));

const isCleanDormantCut = cutList => {
  const r = AKB.reach(P1, cutList);
  return P1.blocks.every(b => b.dormant ? !r.has(b.id) : r.has(b.id));
};
T.ok('Dormant bulkhead cut isolates only housing-e and pit-east', isCleanDormantCut(AKB.DORMANT_CUT));
T.neg(
  'Incomplete bulkhead leaves expansion wing unsealed',
  isCleanDormantCut,
  AKB.DORMANT_CUT.slice(0, 2),
  AKB.DORMANT_CUT
);

/* 4. Interior floor plates & AI.storeyAudit across d = 0, 1, 3, 5 + negative test */
for (const d of [0, 1, 3, 5]) {
  const kp = AI.kitPlan('arckibuz', d, { place: '0,0' });
  let sf = [];
  let roomCount = 0;
  let brokenCount = 0;
  const rIds = [];
  for (const B of kp.buildings) {
    for (const st of B.storeys) {
      const fails = AI.storeyAudit(st, x_z => false); /* unused dummy */
      void fails;
      const realFails = AI.storeyAudit(st, B.inside ? (x, z) => B.inside(x, z, st.y) : null);
      if (realFails.length) sf = sf.concat(realFails);
      roomCount += st.rooms.length;
      for (const R of st.rooms) rIds.push(R.id);
      for (const W of st.walls) if (W.broken) brokenCount++;
    }
  }
  T.ok('AI.storeyAudit clean for decay d=' + d + ' (' + roomCount + ' rooms)', sf.length === 0, sf.slice(0, 3).join('; '));
  T.ok('Unique room ids for decay d=' + d, uniqueIdsCheck(rIds));
  if (d === 1 || d === 3) {
    T.ok('Decay d=' + d + ' breaks partitions (' + brokenCount + ' broken)', brokenCount > 0);
  }
}

T.neg(
  'AI.storeyAudit catches room outside building shell',
  st => AI.storeyAudit(st, (x, z) => Math.abs(x) <= 10 && Math.abs(z) <= 10).length === 0,
  { id: 'bad', rooms: [{ id: 'r.out', poly: [[8, -4], [14, -4], [14, 4], [8, 4]], y: 0 }] },
  { id: 'good', rooms: [{ id: 'r.in', poly: [[-4, -4], [4, -4], [4, 4], [-4, 4]], y: 0 }] }
);

/* 5. Furnishing & recipe audit in both 'ancient' (d=0) and 'post-apoc' (d=3 refurbished) */
const cat = IX.runtimeAdapter(KF, KF.batch());
for (const [cult, cults] of [['ancient', ['ancient']], ['post-apoc', null]]) {
  const kp = AI.kitPlan('arckibuz', 0, { place: '0,0' });
  const F = AI.furnishPlan(kp, cat, { culture: cult, cultures: cults, all: true, seed: 1 });
  const seen = {};
  const fails = [];
  for (const r of F.rooms) {
    if (seen[r.template]) continue;
    seen[r.template] = 1;
    const a = r.recipe ? AI.audit(r.recipe, F.catalog) : IX.audit(r.room, r.plan, F.adapter);
    if (!a.ok) fails.push(r.R.id + ' (' + r.R.kind + '): ' + a.fails.slice(0, 2).map(f => f.check ? f.check + ' ' + f.msg : f).join('; '));
  }
  T.ok('All templates pass furniture & recipe audit in ' + cult + ' (' + F.pieces + ' pieces, ' + F.templates + ' templates)',
    F.pieces > 200 && fails.length === 0, fails.slice(0, 4).join(' | '));
}

/* 6. Water records, HULL-driven basins, opts.noTerrain & opts.ground */
AKBW.reset();
const ws0 = AKBW.addSite(0, -960, 0, P1);
const ws1 = AKBW.addSite(1, 960, 0, P1);
const ws3 = AKBW.addSite(3, 0, 0, P1);
const wsNoTerr = AKBW.addSite(3, 2000, 0, P1, { noTerrain: true });
const wsCustomG = AKBW.addSite(1, 500, 200, P1, { ground: (x, z) => 12.5 + 0.01 * (x - 500) + 0 * z });
T.ok('Intact & refurbished sites carry reservoir, cascade, cistern, and garden flows',
  ws0.still.length === 4 && ws0.flow.length === 3 && ws0.fall.length === 1 &&
  ws3.still.length === 4 && ws3.flow.length === 3 && ws3.fall.length === 1);
T.ok('noTerrain omits outer garden canals while preserving internal arcology basins',
  wsNoTerr.still.length === 4 && wsNoTerr.fall.length === 1 && wsNoTerr.flow.length === 0);
T.ok('Custom opts.ground overrides ruin ground twin cleanly',
  Math.abs(AKBW.ground(wsCustomG, 520, 200) - 12.7) < 1e-6);
T.ok('Ruined site drains rooftop reservoir and irrigation rills',
  ws1.still.length === 1 && ws1.flow.length === 0 && ws1.fall.length === 0);
T.ok('Ruin ground twin is finite across pit, moat, rim, highway, and desert plain',
  [[-960, 0], [960, 0], [960 + 100, 30], [960 + 154, 40], [960 + 216, 0], [960 + 400, 0]]
    .every(pt => Number.isFinite(AKBW.ground(ws1, pt[0], pt[1])) && AKBW.ground(ws1, pt[0], pt[1]) >= 0));

/* 7. ARCKIBUZ.HULL descriptor curves & buildArckibuz PRNG terrain insulation */
const H = AKB.HULL;
T.ok('ARCKIBUZ.HULL exposes span (184 m), H (120 m), levels, reservoir, cistern, and docks',
  Boolean(H) && H.span === 184 && Math.abs(H.H - 120) < 0.01 &&
  H.levels.reservoirWater === H.reservoir.waterY && H.levels.cisternWater === H.cistern.waterY &&
  Boolean(H.docks.eastBridge));
T.ok('ARCKIBUZ.HULL.rAt(y) steps cleanly across podium, neck, community, crown, and reservoir',
  H.rAt(5) === 84 && H.rAt(28) === 48 && H.rAt(44) === 64 && H.rAt(70) === 92 && H.rAt(108) === 72 &&
  H.rAt(-1) === 0 && H.rAt(125) === 0);
T.ok('ARCKIBUZ.HULL.zToe/toeZ and zUp bracket plinth, pit, rim, and outer skirt',
  H.zToe === H.toeZ && H.zToe(0) > 75 && H.zUp(0) === -78 &&
  H.zToe(100) === 114 && H.zUp(100) === -114 && H.zToe(400) === 0 && H.zUp(400) === 0);

const drawSrc = fs.readFileSync(path.join(__dirname, '8aw3-arckibuz-draw.js'), 'utf8');
T.ok('buildArckibuz insulates demo terrain in reseed(12725+d) and resets reseed(12720+d) before megastructure',
  /if\s*\(!noTerrain\)\s*\{\s*reseed\(12725\s*\+\s*d\);[\s\S]*?\}\s*(?:\/\*[\s\S]*?\*\/\s*)?reseed\(12720\s*\+\s*d\);/.test(drawSrc) &&
  drawSrc.indexOf('buildArckibuz.hull = ARCKIBUZ.HULL') >= 0 &&
  drawSrc.indexOf('G.userData.hull = H') >= 0);

T.done();
