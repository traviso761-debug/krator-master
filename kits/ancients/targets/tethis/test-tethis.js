/* node kits/ancients/targets/tethis/test-tethis.js — Tethis's [G data] layout and rules in node (no browser). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../../tools/ktest.js')(__filename);

const ROOT = path.join(__dirname, '..', '..', '..', '..');
const ctx = { Math: Math, Set: Set, Object: Object, Array: Array, JSON: JSON, console: console };
vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'kits/ancients/targets/tethis/8az0-tethis-plan.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n;this.TETHIS=typeof TETHIS!=="undefined"?TETHIS:this.TETHIS;', ctx, { filename: f });
}

const N = ctx.TETHIS;
const P = N.plan();
const S = P.stats;
const clone = x => JSON.parse(JSON.stringify(x));

console.log(JSON.stringify({
  span: S.spanX + ' x ' + S.spanZ + ' m',
  height: S.maxHeight + ' m',
  submerged: S.minSubmergedY + ' m',
  totalFloorHa: (S.totalFloor / 1e4).toFixed(1),
  liveFloorHa: (S.liveFloor / 1e4).toFixed(1),
  workFloorHa: (S.workFloor / 1e4).toFixed(1),
  recFloorHa: (S.recFloor / 1e4).toFixed(1),
  civicFloorHa: (S.civicFloor / 1e4).toFixed(1),
  gardenHa: (S.gardenArea / 1e4).toFixed(1),
  lagoonHa: (S.lagoonArea / 1e4).toFixed(1),
  peakPop: S.peakPop,
  modernPop: S.modernPop,
  platforms: S.platformCount,
  satellites: S.satelliteCount,
  towers: S.towerCount,
  submergedPods: S.submergedCount,
  bridges: S.bridgeCount,
  pylons: S.pylonCount
}));

T.ok('plan is deterministic across repeated calls', JSON.stringify(P) === JSON.stringify(N.plan()));
T.ok('plan responds deterministically to seed override', JSON.stringify(N.plan({ seed: 0 })) === JSON.stringify(N.plan({ seed: 0 })));
T.ok('seed 0 is honoured as a distinct seed (no || fallback)', JSON.stringify(N.plan({ seed: 0 })) !== JSON.stringify(P));
T.ok('9 geometrically aligned main platforms, 4 satellite saucers, 10 towers, 4 submerged pods',
  S.platformCount === 9 && S.satelliteCount === 4 && S.towerCount === 10 && S.submergedCount === 4);
T.ok('hexagonal ring platforms P1..P6 stand at exact HEX radius round P0',
  ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].every(id => {
    const p = P.platforms.find(q => q.id === id);
    return Math.abs(Math.hypot(p.x, p.z) - P.dim.HEX) < 0.05;
  }));

T.neg('uniqueIds catches duplicate record ids', N.RULES.uniqueIds,
  (() => { const bad = clone(P); bad.satellites[0].id = 'P0'; return bad; })(), P);

T.neg('noSaucerOverlap catches colliding saucer discs on the same band', N.RULES.noSaucerOverlap,
  (() => { const bad = clone(P); bad.platforms[1].x = 120; bad.platforms[1].z = 0; return bad; })(), P);

T.neg('pylonsSeatedOnSeabed catches floating pylons above the seabed', N.RULES.pylonsSeatedOnSeabed,
  (() => { const bad = clone(P); bad.pylons[0].y0 = -2.0; return bad; })(), P);

T.neg('submergedBelowWaterlineAndClearOfBed catches a pod breaching sea level', N.RULES.submergedBelowWaterlineAndClearOfBed,
  (() => { const bad = clone(P); bad.submerged[0].y1 = -1.0; return bad; })(), P);

T.neg('bridgesSeatedOnRims catches a skybridge detached from its saucer rim', N.RULES.bridgesSeatedOnRims,
  (() => { const bad = clone(P); bad.bridges[0].pts[0] = [0, 0]; return bad; })(), P);

T.neg('intactFullReach catches a severed platform in the original state', N.RULES.intactFullReach,
  (() => { const bad = clone(P); bad.bridges = bad.bridges.filter(b => b.to !== 'P8' && b.from !== 'P8'); return bad; })(), P);

T.neg('modernSelectiveReach catches P8 remaining dry-connected or U0 dry-accessible', N.RULES.modernSelectiveReach,
  (() => { const bad = clone(P); bad.bridges.find(b => b.id === 'B_6_8').modernState = 'intact_kept'; return bad; })(), P);

T.neg('scaleAndPopulationInTarget enforces 1.2-1.55 km span and 35k-50k peak population', N.RULES.scaleAndPopulationInTarget,
  (() => { const bad = clone(P); bad.stats.peakPop = 12000; return bad; })(), P);

T.neg('daylightHousingLaw forbids housing in unlit submerged pods or beyond lit saucer rims', N.RULES.daylightHousingLaw,
  (() => { const bad = clone(P); bad.submerged[0].litLiveFloor = 500; return bad; })(), P);

T.neg('hullMatchesConcreteEnvelope verifies span, H, toe(x), plinth rAt(y), canal opening, tideline and docks',
  N.RULES.hullMatchesConcreteEnvelope,
  Object.assign({}, P, { hull: Object.assign({}, P.hull, { rAt: () => 999 }) }),
  P);

T.ok('TETHIS.HULL exposes exact soffitY <-> saucerRAt round-trip, canalHalfAng, pylon radii and finite sweep', (() => {
  const H = N.HULL;
  const p0 = P.platforms[0];
  const yMidSoff = H.soffitY(p0, 142.0);
  const rBack = H.saucerRAt('P0', yMidSoff, 0.4);
  const py0 = P.pylons[0];
  for (let x = -800; x <= 800; x += 40) {
    if (!Number.isFinite(H.toe(x, 1)) || !Number.isFinite(H.toe(x, -1))) return false;
  }
  for (let y = -25; y <= 225; y += 2.5) {
    for (const th of [null, 0, Math.PI / 2, Math.PI]) {
      const r = H.rAt(y, th);
      if (!Number.isFinite(r) || r < 0) return false;
    }
  }
  return Math.abs(rBack - 142.0) < 0.15 &&
         H.canalHalfAng(P.platforms.find(q => q.id === 'P5')) > 0.1 &&
         H.pylonRAt(py0, py0.y0 + 0.5) > H.pylonRAt(py0, 0) &&
         H.pylonRAt(py0, 7.5) > H.pylonRAt(py0, 2.0) &&
         H.toe(195, 1) > 455 && H.toe(195, -1) < -460;
})());

const drawSrc = fs.readFileSync(path.join(__dirname, '8az4-tethis-draw.js'), 'utf8');
const drawCodeOnly = drawSrc.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
T.ok('8az4-tethis-draw.js isolates synthetic reef ROCK PRNG stream and gates meshMerged(ROCK, ...) on !noTerrain',
  drawCodeOnly.includes('opts && opts.noTerrain') &&
  drawCodeOnly.includes('meshMerged(ROCK, MAT.rock, G)') &&
  !/\brng\s*\(/.test(drawCodeOnly));

const areasMd = fs.readFileSync(path.join(__dirname, 'plan', 'AREAS.md'), 'utf8');
T.ok('AREAS.md agrees with 8az0-tethis-plan.js peak population and floor totals',
  areasMd.includes('**' + S.peakPop + '**') &&
  areasMd.includes('**' + (S.totalFloor / 1e4).toFixed(1) + ' ha**') &&
  areasMd.includes('**' + S.spanX + ' x ' + S.spanZ + ' m**'));

if (!T.done()) process.exit(1);
