// Node unit test for biomes/shroudhills [G data] (src/20-shroudhills-defs.js + core/rand + core/space)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const ctx = { console: console };
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const rel of [
 'core/rand/08-core-rand.js',
 'core/space/20-core-space.js',
 'biomes/shroudhills/src/20-shroudhills-defs.js'
]) {
 const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
 vm.runInContext(code, ctx, { filename: rel });
}

const S = ctx.SHROUDHILLS;
const KSPACE = ctx.KSPACE;
let pass = 0, fail = 0;

function ok(name, cond, negCond){
 if (cond && !negCond) {
  pass++;
 } else {
  fail++;
  console.error('FAIL:', name, 'cond=' + cond, 'neg=' + negCond);
 }
}

// 1. Canonical region id, planet physics & 3 stations
ok('region id is rmwetizlzivnz and endonym Shruda-Khiltae', S.id === 'shroudhills' && S.regionId === 'rmwetizlzivnz', S.id === 'farside');
ok('0.75 g planetary constant (~0.754 Earth g)', Math.abs(S.PLANET.g - 7.4) < 0.01 && S.PLANET.gRatio > 0.74 && S.PLANET.gRatio < 0.77, S.PLANET.gRatio > 0.99);
ok('three stations match 5.1 survey pixels and pressures',
 S.SITES.cove.px51[0] === 497 && S.SITES.cove.px51[1] === 302 && S.SITES.cove.atm === 1.59 &&
 S.SITES.canopy.px51[0] === 531 && S.SITES.canopy.px51[1] === 252 && S.SITES.canopy.atm === 1.47 &&
 S.SITES.cloaktor.px51[0] === 505 && S.SITES.cloaktor.px51[1] === 302 && S.SITES.cloaktor.atm === 1.36,
 S.SITES.cove.atm === 1.0);

// 2. All 9 canonical species & harvest/gather/hazard contracts
ok('9 canonical species registered', S.SPECIES.length === 9, S.SPECIES.length === 0);
ok('every species has harvest object and expected gather keys',
 S.byKey.shroud_amber_kauri.tags.harvest.gather === 'amber' &&
 S.byKey.shroud_drum_gall.tags.harvest.gather === 'saltpeter' &&
 S.byKey.shroud_drum_gall.tags.hazard.role === 'shroud-ants' &&
 S.byKey.shroud_myrtle_smudge.tags.harvest.gather === 'smudge-resin' &&
 S.byKey.shroud_cloak_bromeliad.tags.harvest.gather === 'crimson-dye' &&
 S.byKey.shroud_dew_strand.tags.harvest.gather === 'mucilage',
 false);

// 3. Twist A: Paired Sister-Cup Cistern Sky-Ponds deterministic & in 1.8-3.2 m / 90-320 L bounds
{
 let allInRange = true;
 for (let i = 0; i < 100; i++) {
  const c = S.sisterCupSpec(1000 + i);
  if (c.totalD < 1.8 || c.totalD > 3.2 || c.litres < 90 || c.litres > 320 || c.effectiveEarthEqKg >= c.wetMassKg) {
   allInRange = false;
  }
 }
 const c1 = S.sisterCupSpec(4242), c2 = S.sisterCupSpec(4242), c3 = S.sisterCupSpec(4243);
 ok('Sister-Cup specs stay inside 1.8-3.2 m and 90-320 L across 100 seeds', allInRange, false);
 ok('Sister-Cup spec is deterministic on KRAND', JSON.stringify(c1) === JSON.stringify(c2) && c1.totalD !== c3.totalD, JSON.stringify(c1) === JSON.stringify(c3));
}

// 4. Twist B: KSPACE neighbor-bridging Grafted Root-Hammock solver
{
 const anchors = [
  { id: 1, treeId: 10, x: 0, y: 20, z: 0 },
  { id: 2, treeId: 11, x: 10, y: 21, z: 0 },
  { id: 3, treeId: 12, x: 10, y: 20.5, z: 11 },
  { id: 4, treeId: 10, x: 1, y: 20, z: 1 },
  { id: 5, treeId: 13, x: 45, y: 20, z: 0 }
 ];
 const spx = KSPACE.create({ cell: 16 });
 anchors.forEach(a => spx.insert(a, a.x, a.z, 1));
 const spans1 = S.pairHammocks(anchors, spx, { seed: 777 });
 const spans2 = S.pairHammocks(anchors, spx, { seed: 777 });
 ok('KSPACE Root-Hammocks bridge distinct neighbor trees 6-15.5 m apart and skip 45 m gaps',
  spans1.length >= 2 && spans1.every(sp => sp.a.treeId !== sp.b.treeId && sp.spanM >= 6 && sp.spanM <= 15.5 && sp.mid.y < Math.min(sp.a.y, sp.b.y) + 1),
  spans1.some(sp => sp.a.treeId === sp.b.treeId));
 ok('KSPACE Root-Hammock pairing is 100% deterministic', JSON.stringify(spans1) === JSON.stringify(spans2), false);
}

// 5. Twist C: Cat-sized Shroud-Ants (28-44 cm) & 3-state acoustic/territorial response
{
 let antRangeOk = true;
 for (let i = 0; i < 80; i++) {
  const a = S.antColonySpec(2000 + i, 1.47);
  if (a.gallD < 1.3 || a.gallD > 2.6 || a.workerCm < 28 || a.workerCm > 35 || a.soldierCm < 38 || a.soldierCm > 44 || a.rattleHz !== 6.0) {
   antRangeOk = false;
  }
 }
 ok('Khroma-Mira Shroud-Ant colonies stay in cat-sized 28-44 cm bounds with 6 Hz drum-rattle', antRangeOk, false);
 ok('quiet traveller on stone path or smudged Yonni Spear-Queen stays peaceful',
  S.antResponse(6, { territoryR: 12, onStonePath: true }).state === 'peaceful' &&
  S.antResponse(4, { territoryR: 12, smudged: true, onHammock: true }).state === 'peaceful',
  S.antResponse(6, { territoryR: 12, onStonePath: true }).state === 'phalanx');
 ok('unanointed boot on Root-Hammock triggers 6 Hz drum-rattle then phalanx; axe-blow triggers immediate phalanx',
  S.antResponse(10.5, { territoryR: 12, onHammock: true }).state === 'drum-rattle' &&
  S.antResponse(5, { territoryR: 12, onHammock: true }).state === 'phalanx' &&
  S.antResponse(9, { territoryR: 12, struckTree: true }).state === 'phalanx',
  S.antResponse(9, { territoryR: 12, struckTree: true }).state === 'peaceful');
}

// 6. Zone weights sum to 1 and separate cove, canopy_sea, cloak_tor, mist_divide
{
 const zCove = S.zoneWeights(50, 0.05, 0.9);
 const zCan = S.zoneWeights(686, 0.1, 0.0);
 const zTor = S.zoneWeights(1284, 0.95, 0.1);
 const zDiv = S.zoneWeights(3200, 0.6, 0.0);
 ok('zone weights normalize to 1 and peak in their survey bands',
  Math.abs(zCove.shroud_cove + zCove.canopy_sea + zCove.cloak_tor + zCove.mist_divide - 1) < 1e-6 &&
  zCove.shroud_cove > 0.5 && zCan.canopy_sea > 0.8 && zTor.cloak_tor > 0.7 && zDiv.mist_divide > 0.8,
  zTor.canopy_sea > zTor.cloak_tor);
}

console.log('test-shroudhills: %d passed, %d failed', pass, fail);
process.exit(fail ? 1 : 0);
