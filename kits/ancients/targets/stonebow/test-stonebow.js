#!/usr/bin/env node
/* kits/ancients/targets/stonebow/test-stonebow.js
   Node test suite for Stonebow (8av0-stonebow-plan.js & 8av1-stonebow-interiors.js) on tools/ktest.js:
   - Determinism, stable unique record IDs, Soleri's canonical dimensions & population figures, Scale Model 5.1 px anchor
   - Canyon wall monotonicity, river channel clearance of park flora, seated ruin wrecks on groundAt
   - Coarse navigation reachability: intact reaches all nodes; refurbished keeps all inhabited zones connected while
     sealing deep delving vaults behind pylon bulkheads (plus negative tests proving bulkhead/ground fault detection)
   - Full kits/ancients-interiors & kits/interiors audit across all 7 zones (intact, ruined, refurb kept & refurb delve) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const HERE = __dirname;
const ROOT = path.resolve(HERE, '..', '..', '..', '..');
const AI_KIT = path.join(ROOT, 'kits', 'ancients-interiors');
const CACHE = path.join(AI_KIT, 'tools', '.cache');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

/* 1. Build/load furniture + interiors + ancients-interiors bundles into Node */
{
  let built = fs.existsSync(path.join(CACHE, 'fb.js')) && fs.existsSync(path.join(CACHE, 'ib.js'));
  if (!built) {
    for (const py of ['python3', 'python']) {
      try { cp.execFileSync(py, [path.join(AI_KIT, 'tools', 'bundles.py')], { stdio: 'ignore' }); built = true; break; } catch (e) { /* next */ }
    }
  }
  T.ok('furniture and interiors Node bundles are available', built, CACHE);
}

global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
global.document = {
  createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }), width: 0, height: 0 })
};

(0, eval)(
  fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8') + '\n' +
  fs.readFileSync(path.join(CACHE, 'fb.js'), 'utf8') + ';\n' +
  fs.readFileSync(path.join(CACHE, 'ib.js'), 'utf8') + ';\n' +
  'global.KF = KratorFurniture; global.IX = KratorInteriors;\n'
);

const aiCore = fs.readdirSync(path.join(AI_KIT, 'src')).filter(f => /^\d/.test(f) && f.endsWith('.js') && f < '50').sort();
(0, eval)(aiCore.map(f => fs.readFileSync(path.join(AI_KIT, 'src', f), 'utf8')).join('\n') + ';\nglobal.AI = KratorAncientsInteriors;\n');
AI.install(IX);
const cat = IX.runtimeAdapter(KF, KF.batch());

/* Load Stonebow [G data] fragments */
(0, eval)(
  fs.readFileSync(path.join(HERE, '8av0-stonebow-plan.js'), 'utf8') + ';\nglobal.STONEBOW = STONEBOW;\n' +
  fs.readFileSync(path.join(HERE, '8av1-stonebow-interiors.js'), 'utf8') + ';\nglobal.STONEBOW_INT = STONEBOW_INT;\n'
);

/* 2. Plan determinism, Soleri metrics, and Scale Model 5.1 site mapping */
const P1 = STONEBOW.plan({ seed: 12400 });
const P2 = STONEBOW.plan({ seed: 12400 });
const P3 = STONEBOW.plan({ seed: 12499 });
T.ok('STONEBOW.plan is bit-for-bit deterministic for a given seed', JSON.stringify(P1) === JSON.stringify(P2));
T.ok('STONEBOW.plan varies procedural garden/park placement with seed', JSON.stringify(P1.dress) !== JSON.stringify(P3.dress));

const px0 = STONEBOW.toPx(0, 0), pxE = STONEBOW.toPx(1000, -2000);
T.ok('STONEBOW.toPx anchors (0,0) at Ching-Ma Shut-In 5.1 px (1196, 179)',
  px0[0] === 1196 && px0[1] === 179 && Math.abs(pxE[0] - 1196.5) < 1e-9 && Math.abs(pxE[1] - 178) < 1e-9,
  JSON.stringify([px0, pxE]));

T.ok('Soleri canonical dimensions match (900 m span, 150 m above rim, 450 m total height, ~129 ha covered)',
  P1.stats.spanM === 900 && P1.stats.heightAboveRimM === 150 && P1.stats.totalHeightM === 450 &&
  Math.abs(P1.stats.coveredHa - 129) <= 2.0,
  JSON.stringify(P1.stats));

T.ok('Peak and refurbished populations match targets (~200k intact, ~18.5k refurbished)',
  P1.stats.intactPop >= 180000 && P1.stats.intactPop <= 220000 &&
  P1.stats.refurbPop >= 15000 && P1.stats.refurbPop <= 23000,
  JSON.stringify(P1.stats));

/* Check unique IDs across all placed structural & flora records */
{
  const all = [].concat(
    P1.pylons, P1.highways, P1.uloops, P1.trusses, P1.struts, P1.bowTiers, P1.wells,
    [P1.crown, P1.cityArch, P1.tourist, P1.park], P1.cantilevers, P1.vaults, P1.mechRoots,
    P1.wings, P1.bulkheads, P1.dress
  );
  const seen = new Set(), dup = [];
  for (const r of all) {
    if (!r || !r.id) dup.push('missing-id');
    else if (seen.has(r.id)) dup.push(r.id);
    else seen.add(r.id);
  }
  T.ok('every structural and flora record in STONEBOW.plan has a unique stable id', dup.length === 0, dup.join(', '));
}

/* 3. Canyon profile monotonicity, river clearance, and seated ruin wrecks */
{
  let wallBad = [];
  for (const s of [-1, 1]) {
    for (const z of [-600, -300, 0, 300, 600]) {
      let prev = s * STONEBOW.canyonWallX(s, z, 0);
      for (let y = 30; y <= 420; y += 30) {
        const cur = s * STONEBOW.canyonWallX(s, z, y);
        if (cur < prev - 2.0) wallBad.push('s=' + s + ' z=' + z + ' y=' + y);
        prev = cur;
      }
    }
  }
  T.ok('canyon walls step outward monotonically from river throat to plateau rim', wallBad.length === 0, wallBad.join('; '));

  const wetTrees = P1.dress.filter(d => d.zone === 'park' && Math.abs(d.at[0] - STONEBOW.riverX(d.at[2])) <= STONEBOW.riverW(d.at[2]) * 0.5 + 4);
  T.ok('canyon-floor park trees stand clear of the Ching-Ma river channel', wetTrees.length === 0, wetTrees.map(t => t.id).join(', '));

  const RU = STONEBOW.ruin(P1);
  const checkSeated = wrecks => wrecks.every(w => Math.abs(w.yFloor - STONEBOW.groundAt(w.x, w.z)) < 0.05 && w.yFloor < 40);
  T.ok('ruin wrecks rest on the canyon floor groundAt below the collapsed Tourist Center', checkSeated(RU.wrecks));
  T.neg('floating ruin wreck above canyon floor is rejected',
    checkSeated,
    [{ x: 90, z: 0, yFloor: 140 }],
    RU.wrecks);
}

/* 4. Coarse navigation graph & delving bulkhead isolation */
{
  const intactSet = STONEBOW.reach(P1, []);
  T.ok('intact Stonebow reaches all 23 navigation nodes from the Outland Gate Highway',
    intactSet.size === P1.nodes.length, intactSet.size + '/' + P1.nodes.length);

  const RF = STONEBOW.refurb(P1);
  const refurbBlocked = RF.sealedBulkheads.concat(RF.blockedNodes);
  const refurbSet = STONEBOW.reach(P1, refurbBlocked);
  const mustReach = ['crown', 'bow.w', 'bow.e', 'city.w', 'city.c', 'city.e', 'tourist.w', 'tourist.e', 'park', 'pylon.nw', 'pylon.sw', 'pylon.ne', 'pylon.se', 'wing.nw', 'wing.sw', 'wing.se'];
  const delveNodes = P1.nodes.filter(n => n.delve).map(n => n.id);
  T.ok('refurbished Stonebow reaches every inhabited zone from the highway approaches',
    mustReach.every(id => refurbSet.has(id)),
    mustReach.filter(id => !refurbSet.has(id)).join(', '));

  const isDelveSealed = blocked => {
    const reached = STONEBOW.reach(P1, blocked);
    return delveNodes.every(id => !reached.has(id)) && mustReach.every(id => reached.has(id));
  };
  T.ok('sealed pylon bulkheads isolate all 4 deep delving zones from the refurbished city', isDelveSealed(refurbBlocked));
  T.neg('unsealing a pylon bulkhead leaks delving vaults into the refurbished city',
    isDelveSealed,
    ['stonebow.bulkhead.w', 'wing.ne'],
    refurbBlocked);
}

/* 5. Full kits/ancients-interiors storey & furnishing audit across all 7 zones */
AI.KIT.stonebow = STONEBOW_INT.entryIntact(AI);
AI.KIT.stonebowRefurb = STONEBOW_INT.entryRefurbKept(AI);
AI.KIT.stonebowRefurbDelve = STONEBOW_INT.entryRefurbDelve(AI);

{
  const planIntact = AI.kitPlan('stonebow', 0, { place: '-2800,-2400' });
  const planRuined = AI.kitPlan('stonebow', 1, { place: '2800,-2400' });
  const planKept = AI.kitPlan('stonebowRefurb', 0, { place: '0,0' });
  const planDelve = AI.kitPlan('stonebowRefurbDelve', 1, { place: '0,0' });

  T.ok('intact Stonebow plan builds all 7 interior zones', planIntact.buildings.length === 7, String(planIntact.buildings.length));
  T.ok('refurbished Stonebow splits cleanly into 5 kept zones and 2 delving-ruin vault zones',
    planKept.buildings.length === 5 && planDelve.buildings.length === 2,
    planKept.buildings.length + ' kept, ' + planDelve.buildings.length + ' delve');

  /* Audit every storey of intact, ruined, refurb-kept, and refurb-delve with AI.storeyAudit */
  const storeyFails = [];
  for (const [label, pl] of [['intact', planIntact], ['ruined', planRuined], ['kept', planKept], ['delve', planDelve]]) {
    for (const B of pl.buildings) {
      for (const st of B.storeys) {
        const sf = AI.storeyAudit(st, B.inside ? (x, z) => B.inside(x, z, st.y) : null);
        if (sf.length) storeyFails.push(label + '/' + B.id + '/' + st.id + ': ' + sf[0]);
      }
    }
  }
  T.ok('AI.storeyAudit passes every storey across intact, ruined, refurb-kept, and refurb-delve',
    storeyFails.length === 0, storeyFails.slice(0, 6).join(' | '));

  /* Negative test on AI.storeyAudit: a room protruding outside B.inside is caught */
  const crownB = planKept.buildings.find(b => b.area === 'crown');
  const badStorey = {
    id: 'bad.st', y: 496, h: 6, outline: [[-120, -20], [120, -20], [120, 20], [-120, 20]],
    rooms: [{ id: 'bad.r', kind: 'hall', y: 496, h: 6, poly: [[90, -10], [115, -10], [115, 10], [90, 10]], doors: [] }],
    walls: []
  };
  T.neg('AI.storeyAudit rejects a room placed outside its building envelope',
    st => AI.storeyAudit(st, (x, z) => crownB.inside(x, z, st.y)).length === 0,
    badStorey,
    crownB.storeys[0]);

  /* Ruin partition check: ruined Stonebow AND both delving vault zones break real partitions */
  const hasBrokenWall = B => B.storeys.some(st => st.walls.some(w => w.broken));
  T.ok('ruined Stonebow and both refurbished delving-vault zones have broken partitions',
    planRuined.buildings.some(hasBrokenWall) && planDelve.buildings.every(hasBrokenWall));

  /* Furnish intact Stonebow and refurbished kept zones, and run IX.audit / AI.audit on every template */
  const furnIntact = AI.furnishPlan(planIntact, cat, { seed: 1 });
  const furnKept = AI.furnishPlan(planKept, cat, { seed: 1 });
  T.ok('intact and refurbished-kept plans furnish rooms with catalog pieces',
    furnIntact.pieces > 400 && furnKept.pieces > 300,
    'intact=' + furnIntact.pieces + ', kept=' + furnKept.pieces);

  const auditFails = [];
  for (const [label, F] of [['intact', furnIntact], ['kept', furnKept]]) {
    const seen = new Set();
    for (const r of F.rooms) {
      if (seen.has(r.template)) continue;
      seen.add(r.template);
      const a = r.recipe ? AI.audit(r.recipe, F.catalog) : IX.audit(r.room, r.plan, F.adapter);
      if (!a.ok) {
        auditFails.push(label + '/' + r.R.id + ' (' + r.R.kind + '): ' +
          a.fails.slice(0, 2).map(f => f.check ? f.check + ' ' + f.msg : 'recipe ' + f).join('; '));
      }
    }
  }
  T.ok('every furnished room and hall recipe passes IX.audit / AI.audit (inside, overlap, doors, reach, required)',
    auditFails.length === 0, auditFails.slice(0, 6).join(' | '));

  /* Verify culture-socket re-furnishing works cleanly for settlement occupation ('occupied' / 'post-apoc') */
  const furnOccupied = AI.furnishPlan(planKept, cat, { culture: 'post-apoc', all: true, seed: 2 });
  T.ok('refurbished centerpiece sockets cleanly to another culture via AI.furnishPlan',
    furnOccupied.pieces > 250, 'post-apoc pieces=' + furnOccupied.pieces);
}

T.done();
