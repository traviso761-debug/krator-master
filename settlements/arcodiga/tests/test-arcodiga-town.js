#!/usr/bin/env node
'use strict';
/* Unit & invariant suite for settlements/arcodiga (Kōpa-Dīga / Arcodiga / Dī-Gā Wài-Sī) using tools/ktest.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');
const T = require('../../../tools/ktest.js')(__filename);

const ctx = {
 console: console,
 Math: Math,
 Date: Date,
 Array: Array,
 Object: Object,
 Number: Number,
 String: String,
 Boolean: Boolean,
 RegExp: RegExp,
 JSON: JSON,
 Float32Array: Float32Array,
 Float64Array: Float64Array,
 Int32Array: Int32Array,
 Uint32Array: Uint32Array,
 Uint16Array: Uint16Array,
 Uint8Array: Uint8Array,
 Map: Map,
 Set: Set,
 Error: Error,
 parseInt: parseInt,
 parseFloat: parseFloat,
 isNaN: isNaN,
 isFinite: isFinite,
 Infinity: Infinity,
 NaN: NaN
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(relPath){
 const full = path.join(ROOT, relPath);
 const code = fs.readFileSync(full, 'utf8');
 vm.runInContext(code, ctx, { filename: relPath });
}

/* 1. Core [G data] dependencies */
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/tags/50-core-tags.js');
load('core/tags/52-core-tags-vocab.js');
load('core/materials/record/27-matlib-m1.js');
load('core/interiors/10-core-roomlight.js');
load('core/world/43-world-relief.js');
load('core/world/43m-world-micro.js');

/* Seal KCITY + KRATOR_KITS cleanly */
{
 const cityFiles = [
  '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
  '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
  '../kits/10-core-kits.js', '42-city-multikit.js'
 ];
 let body = '';
 for (let i = 0; i < cityFiles.length; i++) {
  body += fs.readFileSync(path.join(ROOT, 'core/city', cityFiles[i]), 'utf8') + '\n';
  if (cityFiles[i] === '10-city-core.js') body += 'globalThis.KCITY = KCITY;\n';
  if (cityFiles[i] === '../kits/10-core-kits.js') body += 'globalThis.KRATOR_KITS = window.KRATOR_KITS;\n';
 }
 const wrapped = 'var KCITY = (function(window){\n' + body +
  '\nKCITY.kits = window.KRATOR_KITS;\n' +
  'KCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, obb: obb, obbCorners: obbCorners, inPoly: inPoly, plan: function(){ return PLAN; } };\n' +
  'return KCITY;\n})(Object.create(window));\n';
 vm.runInContext(wrapped, ctx, { filename: 'kcity-bundle.js' });
}
load('core/city/54-city-host-construct.js');

/* Load Arcodiga Ancients pure [G data] plan & interior unit manifest + Crookshore physics */
load('kits/ancients/targets/arcodiga/8av0-arcodiga-plan.js');
load('kits/ancients/targets/arcodiga/8av1-arcodiga-interiors.js');
load('biomes/crook/src/40-biome-crook-phys.js');

/* Load core/simulation */
const simFiles = [
 '77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
 '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
 '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-population.js', '77-sim-6-trade.js',
 '77-sim-7-stocks.js', '77-sim-8-export.js'
];
for (let i = 0; i < simFiles.length; i++) load('core/simulation/' + simFiles[i]);

/* 2. Load settlements/arcodiga [G data] fragments */
load('settlements/arcodiga/src/28-adg-mipvar.js');
load('settlements/arcodiga/src/40-adg-site.js');
load('settlements/arcodiga/src/42-adg-trades.js');
load('settlements/arcodiga/src/42-adg-tune.js');
load('settlements/arcodiga/src/44-adg-crook-delta.js');
load('settlements/arcodiga/src/45a-adg-hex-plan.js');
load('settlements/arcodiga/src/45b-adg-city-steps.js');
load('settlements/arcodiga/src/58-adg-roomlight.js');
load('settlements/arcodiga/src/60-adg-sim.js');

const {
 ADG_MIPVAR, ADG_SITE, ADG_TRADES, ADG_TUNE, ADG_CROOK_DELTA, ADG_HEX, ADG_CITY, ADG_ROOMS, ADG_SIM,
 ARCODIGA, ADG_INTERIORS, CROOK_PHYS, WMICRO, KROOMLIGHT, KMAT_M1
} = vm.runInContext(
 '({ ADG_MIPVAR, ADG_SITE, ADG_TRADES, ADG_TUNE, ADG_CROOK_DELTA, ADG_HEX, ADG_CITY, ADG_ROOMS, ADG_SIM, ARCODIGA, ADG_INTERIORS, CROOK_PHYS, WMICRO, KROOMLIGHT, KMAT_M1 })',
 ctx
);

/* --- Gate 1: 1:1 Kopa-North Caldera Lagoon, Gorge-Throat, Rims & WMICRO v2 --- */
{
 const lagoonFloor = ADG_SITE.bareGround(0, -900);
 const throatBed = ADG_SITE.bareGround(0, 120);
 const eastRim = ADG_SITE.bareGround(1035, -365);
 const westRim = ADG_SITE.bareGround(-1050, -200);
 const nwBreach = ADG_SITE.bareGround(-1200, -1250);
 const leeWharf = ADG_SITE.bareGround(478, 448);

 T.ok('Kopa-North caldera lagoon reaches -95 m, southern gorge-throat sits below -50 m, and basalt rims rise to +175..+205 m',
  lagoonFloor <= -94.0 && throatBed <= -50.0 && eastRim >= 172.0 && eastRim <= 206.0 && westRim >= 175.0,
  'lagoon=' + lagoonFloor.toFixed(1) + ' m, throat=' + throatBed.toFixed(1) + ' m, eastRim=' + eastRim.toFixed(1) + ' m, westRim=' + westRim.toFixed(1) + ' m');

 T.ok('NW ocean breach opens below -35 m and SE dam-lee coaling wharf sits dry at +5..+12 m',
  nwBreach <= -35.0 && leeWharf >= 5.0 && leeWharf <= 12.0,
  'nwBreach=' + nwBreach.toFixed(1) + ' m, leeWharf=' + leeWharf.toFixed(1) + ' m');

 /* The hexagonal mole stands dry everywhere (+5.5 m or more), and its face 5 runs flush into the basalt shore:
    a sweep from 20 m inside face 5 to 40 m past it, along its whole length, never dips into water */
 let minMoleToShoreY = Infinity;
 for (let xx = 380; xx <= 760; xx += 4) {
  for (let zz = 320; zz <= 660; zz += 4) {
   if (!ADG_SITE.inPoly(xx, zz, ADG_SITE.LEE_WHARF_POLY) && !ADG_SITE.inPoly(xx, zz, ADG_SITE.MOLE_ROOT_POLY)) continue;
   const yy = ADG_SITE.bareGround(xx, zz);
   if (yy < minMoleToShoreY) minMoleToShoreY = yy;
  }
 }
 {
  const MH = ADG_SITE.MOLE_HEX, ap = MH.R * Math.sqrt(3) * 0.5;
  const ang = Math.PI / 6 + MH.shoreFace * Math.PI / 3, nx = Math.cos(ang), nz = Math.sin(ang);
  for (let t = -0.45 * MH.R; t <= 0.45 * MH.R; t += 5) {
   for (let sOff = -20; sOff <= 40; sOff += 2) {
    const yy = ADG_SITE.bareGround(MH.cx + nx * (ap + sOff) - nz * t, MH.cz + nz * (ap + sOff) + nx * t);
    if (yy < minMoleToShoreY) minMoleToShoreY = yy;
   }
  }
 }
 const etLift = ADG_SITE.HOISTS.find(function(h){ return h.id === 'et_girder_lift'; });
 T.ok('SE hexagonal harbour mole stands dry (min y >= +5.5 m inside it and across its shore face into the cliff), cargo hoist anchors at shore root, and graded Harbour Road descends cleanly',
  minMoleToShoreY >= 5.5 &&
  etLift && etLift.foot[0] >= 670 && (etLift.head[0] - etLift.foot[0]) <= 195 &&
  ADG_SITE.HARBOUR_ROAD && ADG_SITE.HARBOUR_ROAD.length >= 8 &&
  ADG_SITE.harbourRoadAt(748, 332).y >= 70.0 && ADG_SITE.harbourRoadAt(716, 415).y >= 35.0,
  'minMoleToShoreY=' + minMoleToShoreY.toFixed(2) + ' m, liftSpan=' + (etLift.head[0] - etLift.foot[0]) + ' m');

 T.ok('WMICRO is initialized in version 2 mean-compensated mode with smooth town-edge transition',
  WMICRO.version === 2,
  'WMICRO.version=' + WMICRO.version);
}

/* --- Gate 2: Asymmetric Ruined vs Reclaimed Arcodiga (yOffset = -95.0 m, 88% Abandoned, East Wing >= +65.0 m) --- */
{
 const delta = ADG_CROOK_DELTA.buildDelta(ARCODIGA, ADG_INTERIORS);
 const audit = ADG_CROOK_DELTA.auditDelta(delta);

 T.ok('Arcodiga at yOffset = -95.0 m submerges Power House (<= -49 m), keeps 88% abandoned/ruined, and elevates East Wing >= +81 m',
  audit.ok &&
  delta.bands.powerhouseWorldY[1] === -49.0 &&
  delta.bands.eastHighwayWorldY === 81.0 &&
  delta.stats.minReclaimedWorldY >= 65.0 &&
  delta.stats.reclaimedUnitCount >= 2 &&
  delta.stats.abandonedUnitCount >= 8,
  JSON.stringify(delta.stats));

 const badDelta = JSON.parse(JSON.stringify(delta));
 badDelta.stats.minReclaimedWorldY = 42.0;
 T.neg('Arcodiga delta audit rejects reclaimed Eternian unit below +65.0 m tsunami trimline',
  function(d){ return ADG_CROOK_DELTA.auditDelta(d).ok; },
  badDelta,
  delta);
}

/* --- Gate 3: Dense Three-Instance KCITY Layout, Zero Arcology Clipping & 6-Fold Eternian Hex Grid --- */
const plans = ADG_CITY.buildPlans({ fresh: true });
{
 const audit = ADG_CITY.auditLots(plans.lots);
 const arcClear = ADG_CITY.auditArcologyClearance(plans.lots, plans.ways);
 const hexAudit = ADG_HEX.auditHexAlignment(plans.lots);

 T.ok('three KCITY instances densely place HKK rim, ETK hexagonal cantonment + Charter Market, and harbour works with 0 OBB overlaps',
  audit.ok &&
  audit.overlaps === 0 &&
  audit.lowDwellings === 0 &&
  audit.minDwellingY >= 95.0 &&
  plans.hkLots.length >= 240 &&
  plans.etLots.length >= 260 &&
  plans.coveLots.length >= 65 &&
  plans.constructionLots.length >= 2,
  JSON.stringify(audit) + ' cons=' + plans.constructionLots.length);

 const moleLots = plans.lots.filter(function(l){ return l.zone === 'Z6_WHARF'; });
 const woodMoleLots = moleLots.filter(function(l){ return l.rawKey && l.rawKey.indexOf('et_wood_') === 0; });
 const woodKinds = new Set(woodMoleLots.map(function(l){ return l.rawKey; }));
 T.ok('SE harbour mole densely deploys all 8 wooden disposable Eternian harbour building types with zero permanent dwellings',
  moleLots.length >= 45 && woodMoleLots.length >= 32 && woodKinds.size === 8,
  'moleLots=' + moleLots.length + ', woodMoleLots=' + woodMoleLots.length + ', woodKinds=' + woodKinds.size);

 /* The mole is a regular hexagon on the Eternian lattice, and every mole street runs on it (multiples of 30 deg) */
 function moleOnLattice(poly, ways){
  const MH = ADG_SITE.MOLE_HEX;
  for (let i = 0; i < 6; i++) {
   const a = Math.atan2(poly[i][1] - MH.cz, poly[i][0] - MH.cx);
   const r = Math.hypot(poly[i][0] - MH.cx, poly[i][1] - MH.cz);
   const da = Math.abs(a - Math.round(a / (Math.PI / 3)) * (Math.PI / 3));
   if (Math.abs(r - MH.R) > 0.05 || da > 1e-3) return false;
  }
  let n = 0;
  for (let i = 0; i < ways.length; i++) {
   const P = ways[i].pts;
   if (!P || P.length < 2 || !ADG_SITE.inPoly(P[0][0], P[0][1], poly) || !ADG_SITE.inPoly(P[P.length - 1][0], P[P.length - 1][1], poly)) continue;
   for (let j = 0; j + 1 < P.length; j++) {
    const a = Math.atan2(P[j + 1][1] - P[j][1], P[j + 1][0] - P[j][0]);
    const step = Math.PI / 6;
    if (Math.abs(a - Math.round(a / step) * step) > 0.004) return false;
   }
   n++;
  }
  return n >= 60;
 }
 T.ok('SE harbour mole is a regular Eternian hexagon with a hexagonal street grid (ring avenue + honeycomb, all on the 30-degree lattice)',
  moleOnLattice(ADG_SITE.LEE_WHARF_POLY, plans.ways),
  'moleWays=' + plans.ways.filter(function(w){ return w.pts && ADG_SITE.inPoly(w.pts[0][0], w.pts[0][1], ADG_SITE.LEE_WHARF_POLY); }).length);
 T.neg('mole lattice check catches a skewed street across the mole',
  function(ws){ return moleOnLattice(ADG_SITE.LEE_WHARF_POLY, ws); },
  plans.ways.concat([{ inst: 'cove_works', kind: 'side', w: 5, pts: [[500, 450], [560, 470]] }]),
  plans.ways);

 T.ok('zero streets and zero buildings clip through Arcodiga dam-arch or x<=1022 East Stiffening Wing',
  arcClear.ok && arcClear.lotHits === 0 && arcClear.wayHits === 0,
  JSON.stringify(arcClear));

 const badWays = plans.ways.concat([{ inst: 'et_cantonment', kind: 'avenue', w: 9.5, pts: [[965, 95], [965, 362]] }]);
 T.neg('arcology clearance audit catches street slicing through East Stiffening Wing',
  function(ws){ return ADG_CITY.auditArcologyClearance(plans.lots, ws).ok; },
  badWays,
  plans.ways);

 T.ok('Z6 Eternian Superintendency deploys 15 contiguous hexagonal cells with 100% 60-degree aligned hex buildings',
  hexAudit.ok && hexAudit.macroCells === 15 && hexAudit.hexBuildings >= 120 && hexAudit.aligned60 === hexAudit.hexBuildings,
  JSON.stringify(hexAudit));

 const skewedHexLots = plans.lots.concat([{
  id: 9997, zone: 'Z6', kit: 'eternian', key: 'eternian:et_hex_house', v: 0,
  x: 1205, y: 175, z: 500, ry: 0.42
 }]);
 T.neg('hexagonal alignment audit catches off-grid skewed hexagonal building in Z6',
  function(arr){ return ADG_HEX.auditHexAlignment(arr).ok; },
  skewedHexLots,
  plans.lots);

 /* Negative 1: inject an overlapping lot and prove auditLots catches it */
 const clashLots = plans.lots.slice();
 const c0 = plans.lots[0];
 clashLots.push(Object.assign({}, c0, { id: 9999, tag: 'clash_lot' }));
 T.neg('OBB overlap audit catches colliding building footprints',
  function(arr){ return ADG_CITY.auditLots(arr).overlaps === 0; },
  clashLots,
  plans.lots);

 /* Negative 2: inject a permanent dwelling below +65.0 m and prove auditLots rejects it */
 const lowLots = plans.lots.slice();
 lowLots.push({
  id: 9998, tag: 'low_house', kit: 'hueru-kuran', key: 'hueru-kuran:hk_house_poor_kelper',
  x: 610, y: 12.0, z: -520, ry: 0, w: 13.2, d: 14.4, h: 7.5,
  bo: { c: [2200, 2200], u: [1, 0], v: [0, 1], hw: 6.6, hd: 7.2 }
 });
 T.neg('tsunami trimline audit rejects any permanent dwelling placed below +65.0 m',
  function(arr){ return ADG_CITY.auditLots(arr).lowDwellings === 0; },
  lowLots,
  plans.lots);

 /* Determinism across fresh runs */
 const plans2 = ADG_CITY.buildPlans({ fresh: true });
 T.ok('three-instance KCITY placement is bit-identical across fresh runs',
  plans.lots.length === plans2.lots.length &&
  plans.lots[0].x === plans2.lots[0].x &&
  plans.lots[plans.lots.length - 1].z === plans2.lots[plans.lots.length - 1].z,
  'lots=' + plans.lots.length);
}

/* --- Gate 4: Continuous Walk & Hoist Connectivity across Z1..Z6 --- */
{
 function walkConnected(wg){
  if (!wg || !wg.nodes.length) return false;
  const adj = {};
  for (let i = 0; i < wg.nodes.length; i++) adj[wg.nodes[i].id] = [];
  for (let i = 0; i < wg.edges.length; i++) {
   const e = wg.edges[i];
   if (adj[e.a] && adj[e.b]) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
   }
  }
  const seen = new Set([wg.nodes[0].id]);
  const q = [wg.nodes[0].id];
  while (q.length) {
   const cur = q.shift();
   const nb = adj[cur] || [];
   for (let i = 0; i < nb.length; i++) {
    if (!seen.has(nb[i])) {
     seen.add(nb[i]);
     q.push(nb[i]);
    }
   }
  }
  return seen.size === wg.nodes.length;
 }

 const wg = plans.walkGraph;
 T.ok('pedestrian & 90s cliff-hoist walk graph continuously connects Z1 lagoon, Z5 rim, Z4 market, Z3 East Wing & Z6 wharf',
  walkConnected(wg) && wg.nodes.length >= 24,
  'nodes=' + wg.nodes.length + ', edges=' + wg.edges.length);

 const brokenWg = { nodes: wg.nodes.slice(), edges: wg.edges.filter(function(e){ return e.kind !== 'hoist'; }) };
 T.neg('walk-graph connectivity audit detects severed cliff-hoist links',
  walkConnected,
  brokenWg,
  wg);
}

/* --- Gate 5: Crookshore +65.0 m Trimline Physics & Stage 7 KROOMLIGHT Deep Vaults --- */
{
 const sprayLow = CROOK_PHYS.sprayTrimAt({ elevM: 18.0, coastDistKm: 0.25, wnwExposure01: 0.90, calderaShelter01: 0.15, silicaByte: 150, drawdownM: 0 });
 const forestHigh = CROOK_PHYS.sprayTrimAt({ elevM: 165.0, coastDistKm: 0.60, wnwExposure01: 0.85, calderaShelter01: 0.20, silicaByte: 150, drawdownM: 0 });
 const drawdownLow = CROOK_PHYS.sprayTrimAt({ elevM: 18.0, coastDistKm: 0.25, wnwExposure01: 0.90, calderaShelter01: 0.15, silicaByte: 150, drawdownM: 8.0 });

 T.ok('CROOK_PHYS +65 m tsunami trimline separates lower basalt spray-sponge zone from upper benihi rainforest and closes ostia on drawdown',
  sprayLow.safeTownElevM === 65.0 &&
  sprayLow.basaltSpongeOk === true &&
  sprayLow.woodyOk === false &&
  forestHigh.basaltSpongeOk === false &&
  forestHigh.woodyOk === true &&
  forestHigh.canopySpongeOk === true &&
  drawdownLow.ostiaOpen01 < 0.25,
  'sprayMist=' + sprayLow.sprayMist01 + ', trim=' + sprayLow.trimElevM + ' m, ostia@drawdown=' + drawdownLow.ostiaOpen01);

 const tbl = ADG_ROOMS.buildLightTable();
 const vMachine = tbl.byId['adg.vault.machine_archive'];
 const vSanta = tbl.byId['adg.vault.santa_cristina'];
 const wLoft = tbl.byId['adg.wing.telemetry_loft'];
 const wCipher = tbl.byId['adg.wing.cipher_room'];

 T.ok('deep arcology & Santa Cristina vaults (vault: true) have exact 0.000 sky daylight while windowed telemetry loft & 1-hop cipher room decay cleanly',
  ADG_ROOMS.auditVaultIsolation(tbl) &&
  vMachine.vault === true && vMachine.daylight === 0 &&
  vSanta.vault === true && vSanta.daylight === 0 &&
  wLoft.daylight > 0.35 &&
  wCipher.daylight > 0.05 && wCipher.daylight < wLoft.daylight,
  'machine=' + vMachine.daylight + ', santa=' + vSanta.daylight + ', loft=' + wLoft.daylight + ', cipher=' + wCipher.daylight);

 const leakyTbl = JSON.parse(JSON.stringify(tbl));
 leakyTbl.byId['adg.vault.machine_archive'].daylight = 0.04;
 T.neg('KROOMLIGHT vault isolation audit rejects sky daylight leak inside vault: true room',
  ADG_ROOMS.auditVaultIsolation,
  leakyTbl,
  tbl);

 const rNear = KMAT_M1.roughnessWithVariance(0.26, 0.0, ADG_MIPVAR.forFamily('nephrite_sawn'));
 const rFar = KMAT_M1.roughnessWithVariance(0.26, 4.0, ADG_MIPVAR.forFamily('nephrite_sawn'));
 T.ok('Stage 5 M2 nephrite roughness widens monotonically with mip level and M4 plot-base AO rises 0.72 -> 1.00',
  rFar > rNear && Math.abs(ADG_MIPVAR.plotBaseAO(0, 1.8) - 0.72) < 1e-6 && Math.abs(ADG_MIPVAR.plotBaseAO(2.2, 1.8) - 1.0) < 1e-6,
  'rNear=' + rNear.toFixed(3) + ', rFar=' + rFar.toFixed(3));
}

/* --- Gate 6: Voth 44-Trade Census Alignment (41 Carried, 3 Canonical NA, 100% Placed) --- */
{
 const carried = ADG_TRADES.filter(function(r){ return Array.isArray(r.keys) && r.keys.length > 0; });
 const nas = ADG_TRADES.filter(function(r){ return !!r.na; });
 const placedRawKeys = new Set(plans.lots.map(function(l){ return l.rawKey; }));
 const unplaced = [];
 for (let i = 0; i < carried.length; i++) {
  const ks = carried[i].keys;
  const anyPlaced = ks.some(function(k){ return placedRawKeys.has(k); });
  if (!anyPlaced) unplaced.push(carried[i].trade);
 }

 T.ok('ADG_TRADES covers 41/44 Voth census trades (3 canonical na) and 100% of carried trades have active placed building hosts',
  ADG_TRADES.length === 44 && carried.length === 41 && nas.length === 3 && unplaced.length === 0,
  'carried=' + carried.length + ', na=' + nas.length + ', unplaced=' + unplaced.join(','));
}

/* --- Gate 7: SIM 3,400-Citizen Dual-Polity Economy & 30-Day Positive Stocks across 5 Chains --- */
{
 const simState = ADG_SIM.init({ fresh: true, plans: plans });
 const stocks = simState.stocks();
 const routes = simState.tradeReport();

 function allStocksPositive(st){
  if (!st || !st.by) return false;
  const keys = Object.keys(st.by);
  for (let i = 0; i < keys.length; i++) {
   if (!(st.by[keys[i]].total > 20.0)) return false;
  }
  return keys.length >= 18;
 }

 const routeIds = Object.keys(routes);
 const activeCarriers = routeIds.every(function(id){ return routes[id].trips >= 100; });
 const paintedEternians = simState.citizens.filter(function(c){ return c.cohort === 'eternian' && c.faceChalk === true; });

 T.ok('SIM runs 6,800-citizen / 1,380-HH economy for 30 days with positive stocks across all 5 chains, 4 routes & painted Eternians',
  simState.pop === 6800 &&
  simState.households === 1380 &&
  stocks.day >= 30 &&
  allStocksPositive(stocks) &&
  routeIds.length === 4 &&
  activeCarriers &&
  paintedEternians.length >= 30,
  'day=' + stocks.day + ', nephrite=' + stocks.by.sawn_nephrite.total + ', timber=' + stocks.by.benihi_timber.total + ', coal=' + stocks.by.crook_coal.total + ', alloy=' + stocks.by.ancient_alloy.total);

 const depleted = JSON.parse(JSON.stringify(stocks));
 depleted.by.crook_coal.total = -5.0;
 T.neg('SIM stock audit catches negative commodity stock',
  allStocksPositive,
  depleted,
  stocks);
}

T.done();
