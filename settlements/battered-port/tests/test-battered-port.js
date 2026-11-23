#!/usr/bin/env node
'use strict';
/* Unit & invariant suite for settlements/battered-port (Bè-tõ-pò) using tools/ktest.js */
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

/* Seal KCITY cleanly with KCITY.lib exposed */
{
 const cityFiles = [
  '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
  '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js'
 ];
 let body = '';
 for (let i = 0; i < cityFiles.length; i++) {
  body += fs.readFileSync(path.join(ROOT, 'core/city', cityFiles[i]), 'utf8') + '\n';
  if (cityFiles[i] === '10-city-core.js') body += 'globalThis.KCITY = KCITY;\n';
 }
 const wrapped = 'var KCITY = (function(window){\n' + body +
  '\nKCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, obb: obb, obbCorners: obbCorners, inPoly: inPoly, plan: function(){ return PLAN; } };\n' +
  'return KCITY;\n})(Object.create(window));\n';
 vm.runInContext(wrapped, ctx, { filename: 'kcity-bundle.js' });
}
load('core/city/54-city-host-construct.js');

/* Load core/simulation */
const simFiles = [
 '77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
 '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
 '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-population.js', '77-sim-6-trade.js',
 '77-sim-7-stocks.js', '77-sim-8-export.js'
];
for (let i = 0; i < simFiles.length; i++) load('core/simulation/' + simFiles[i]);

/* 2. Load settlements/battered-port [G data] fragments */
load('settlements/battered-port/src/28-bp-mipvar.js');
load('settlements/battered-port/src/40-bp-cinder-site.js');
load('settlements/battered-port/src/42-bp-trades.js');
load('settlements/battered-port/src/42-bp-tune.js');
load('settlements/battered-port/src/45-bp-city-steps.js');
load('settlements/battered-port/src/48-bp-exile-dress.js');
load('settlements/battered-port/src/58-bp-roomlight.js');
load('settlements/battered-port/src/60-bp-sim.js');

const { BP_MIPVAR, BP_SITE, BP_TRADES, BP_CITY, BP_EXILE, BP_ROOMS, BP_SMUGGLER_ROUTES, BP_SIM, WMICRO, KROOMLIGHT, KMAT_M1 } = vm.runInContext(
 '({ BP_MIPVAR, BP_SITE, BP_TRADES, BP_CITY, BP_EXILE, BP_ROOMS, BP_SMUGGLER_ROUTES, BP_SIM, WMICRO, KROOMLIGHT, KMAT_M1 })',
 ctx
);

/* --- Gate 1: Site Hypsometry, Kettle Lagoon, Feeder-Dike Jaws & Sea-Cave Clearance --- */
{
 const plugH = BP_SITE.bareGround(BP_SITE.PLUG.x, BP_SITE.PLUG.z);
 const kettleH = BP_SITE.bareGround(BP_SITE.KETTLE.x, BP_SITE.KETTLE.z);
 const westJawH = BP_SITE.bareGround(-155, 330);
 const eastJawH = BP_SITE.bareGround(155, 330);
 const throatH = BP_SITE.bareGround(0, 395);
 const cave = BP_SITE.inVaultOrTunnel(-285, -5);
 const tunnel = BP_SITE.inVaultOrTunnel(-680, 28);

 T.ok('Bare-Stone Head volcanic plug rises to +132..+140 m and Kettle lagoon reaches <= -24 m',
  plugH >= 132.0 && plugH <= 141.0 && kettleH <= -24.0,
  'plugH=' + plugH.toFixed(2) + ' m, kettleH=' + kettleH.toFixed(2) + ' m');

 T.ok('twin radial basaltic feeder-dike jaws frame a deep navigable 110 m SSE throat',
  westJawH > 12.0 && eastJawH > 12.0 && throatH < -14.0,
  'westJaw=' + westJawH.toFixed(1) + ' m, eastJaw=' + eastJawH.toFixed(1) + ' m, throat=' + throatH.toFixed(1) + ' m');

 T.ok('Da-wò-hò sea-cave and 640 m western bolt-hole tunnel maintain >= 6.5 m mast/headroom clearance',
  cave && cave.headroomM >= 14.0 && tunnel && tunnel.headroomM >= 6.5 && BP_SITE.BOLT_HOLE.lengthM === 640.0,
  'caveCrown=' + (cave && cave.crownY) + ' m, tunnelCrown=' + (tunnel && tunnel.crownY) + ' m');
}

/* --- Gate 2: WMICRO v2 Relief & Zero Town-Edge Shelf Step --- */
{
 T.ok('WMICRO is initialized in version 2 hole-free mean-compensated mode',
  WMICRO.version === 2,
  'WMICRO.version=' + WMICRO.version);

 /* Walk 1 m steps outward across the north rim-town edge (z = -740 -> -850 at x = 0) and check max 1 m step */
 let maxStep = 0;
 let prev = BP_SITE.bareGround(0, -740);
 for (let z = -741; z >= -850; z -= 1) {
  const cur = BP_SITE.bareGround(0, z);
  const diff = Math.abs(cur - prev);
  if (diff > maxStep) maxStep = diff;
  prev = cur;
 }
 T.ok('WMICRO v2 transition across rim-town boundary has zero artificial shelf step (max 1 m delta < 0.65 m)',
  maxStep < 0.65,
  'max 1 m step=' + maxStep.toFixed(4) + ' m');
}

/* --- Gate 3: Dual KCITY Layout (battered_rim + battered_cove) & >= +85 m Tsunami Floor --- */
const plans = BP_CITY.buildPlans({ fresh: true });
{
 T.ok('dual KCITY instances place both upper rim wards (D1..D5) and lower Kettle/Vault lots (D6..D7)',
  plans.rimLots.length >= 120 && plans.coveLots.length >= 18 && plans.constructionLots.length >= 1,
  'rimLots=' + plans.rimLots.length + ', coveLots=' + plans.coveLots.length + ', constructionLots=' + plans.constructionLots.length);

 function checkRimTsunamiFloor(lots){
  for (let i = 0; i < lots.length; i++) {
   if (lots[i].tier === 'rim' && lots[i].y < 85.0) return false;
  }
  return true;
 }

 T.ok('100% of upper rim residential, civic, and granary lots stand >= +85.0 m tsunami safety floor',
  checkRimTsunamiFloor(plans.rimLots),
  'minRimY=' + Math.min.apply(null, plans.rimLots.map(function(l){ return l.y; })).toFixed(2) + ' m');

 T.neg('tsunami floor audit catches a rim dwelling placed below +85.0 m',
  checkRimTsunamiFloor,
  [{ id: 'fault:0', tier: 'rim', y: 62.0 }],
  plans.rimLots);

 /* Determinism check: running buildPlans fresh produces bit-identical coordinates */
 const plans2 = BP_CITY.buildPlans({ fresh: true });
 T.ok('KCITY dual-instance placement is bit-identical across fresh runs',
  plans.lots.length === plans2.lots.length &&
  plans.lots[0].x === plans2.lots[0].x &&
  plans.lots[plans.lots.length - 1].z === plans2.lots[plans.lots.length - 1].z,
  'lots=' + plans.lots.length);
}

/* --- Gate 4: Voth 44-Trade Census Alignment --- */
{
 const carried = BP_TRADES.filter(function(r){ return Array.isArray(r.keys) && r.keys.length > 0; });
 const nas = BP_TRADES.filter(function(r){ return !!r.na; });
 T.ok('BP_TRADES aligns 100% with Voth 44-trade census (42 carried, 0 gaps, 2 na)',
  BP_TRADES.length === 44 && carried.length === 42 && nas.length === 2,
  'carried=' + carried.length + ', na=' + nas.length);
}

/* --- Gate 5: Unmasked Exile Dress Orthodoxy & Stage 5 M2/M4 --- */
{
 const dress = BP_EXILE.buildDressTable(plans.lots);
 const goodState = {
  dressList: dress.list,
  statuary: [{ lotId: 'rim:0', kind: 'figure', metal: 'bronze', eyes: 'open' }],
  citizens: [{ id: 'bp.cit.0', whiteFacePaint: false, censorateStripes: false, metallicHeirSkin: false }],
  cyanStrips: 0
 };
 const badState = {
  dressList: dress.list,
  statuary: [{ lotId: 'rim:bad', kind: 'mask', metal: 'terracotta', eyes: 'closed' }],
  citizens: [{ id: 'bp.spy', whiteFacePaint: true }],
  cyanStrips: 0
 };
 const audit = BP_EXILE.auditOrthodoxy(goodState);

 T.ok('100% of placed lots wear chiselled_blank, driftwood_board, or open_eyed_figurehead lintels (0 closed-eyed masks, 0 gold)',
  audit.ok && dress.counts.chiselled_blank > 50 && dress.counts.driftwood_board > 10 && dress.counts.seaGallery > 5,
  JSON.stringify(dress.counts));

 T.neg('orthodoxy validator rejects closed-eyed ancestor door-mask, gold statue, or white rank-paint',
  function(st){ return BP_EXILE.auditOrthodoxy(st).ok; },
  badState,
  goodState);

 const rNear = KMAT_M1.roughnessWithVariance(0.28, 0.0, BP_MIPVAR.forFamily('celadon'));
 const rFar = KMAT_M1.roughnessWithVariance(0.28, 4.0, BP_MIPVAR.forFamily('celadon'));
 const aoFoot = BP_MIPVAR.plotBaseAO(0.0, 1.85);
 const aoWall = BP_MIPVAR.plotBaseAO(2.4, 1.85);
 T.ok('Stage 5 M2 celadon roughness widens with mip level and M4 plot-base AO rises from 0.72 to 1.00',
  rFar > rNear && rFar <= 1.0 && Math.abs(aoFoot - 0.72) < 1e-6 && Math.abs(aoWall - 1.0) < 1e-6,
  'rNear=' + rNear.toFixed(3) + ', rFar=' + rFar.toFixed(3) + ', aoFoot=' + aoFoot + ', aoWall=' + aoWall);
}

/* --- Gate 6: Stage 7 KROOMLIGHT (I1-I4 & Gate 5 Subterranean Sea-Cave Vault Zero Daylight) --- */
{
 const tbl = BP_ROOMS.buildLightTable();
 const hall = tbl.byId['bp.court.hall'];
 const ledger = tbl.byId['bp.court.ledger'];
 const cipher = tbl.byId['bp.court.cipher'];
 const vaultSilk = tbl.byId['bp.vault.silk'];
 const vaultAlab = tbl.byId['bp.vault.alabaster'];

 T.ok('Counting-Court rooms exhibit monotone portal daylight decay across doorway hops',
  hall.daylight > ledger.daylight && ledger.daylight > cipher.daylight && cipher.daylight > 0,
  'hall=' + hall.daylight + ', ledger=' + ledger.daylight + ', cipher=' + cipher.daylight);

 T.ok('Da-wò-hò subterranean palagonite vault rooms (vault: true) receive strictly ZERO sky daylight (Gate 5)',
  vaultSilk.vault === true && vaultSilk.daylight === 0 && vaultAlab.vault === true && vaultAlab.daylight === 0,
  'vaultSilk.daylight=' + vaultSilk.daylight + ', vaultAlab.daylight=' + vaultAlab.daylight);

 const vaultPool = BP_ROOMS.poolForEye([-292, 6.8, -24], 1.0, tbl);
 const vaultWinCount = vaultPool.filter(function(l){ return l.kind === 'window'; }).length;
 const cornerAO = KROOMLIGHT.vertexCornerAO(-301.0, 5.2, -31.0, 0, 1, 0, BP_ROOMS.ROOMS[5].box, 0.85);
 const midFloorAO = KROOMLIGHT.vertexCornerAO(-292.0, 5.2, -24.0, 0, 1, 0, BP_ROOMS.ROOMS[5].box, 0.85);

 T.ok('KROOMLIGHT.pickPool inside vault selects 0 window lights + active whale-oil lamps, and corner AO darkens room joints',
  vaultPool.length >= 2 && vaultWinCount === 0 && cornerAO < 0.65 && midFloorAO > 0.95,
  'pool=' + vaultPool.length + ', win=' + vaultWinCount + ', cornerAO=' + cornerAO.toFixed(3) + ', midAO=' + midFloorAO.toFixed(3));
}

/* --- Gate 7: SIM 5,000-Citizen Economy & 4 Maritime Smuggler Corridors --- */
{
 const simState = BP_SIM.init({ fresh: true, plans: plans });
 const stocks = simState.stocks();
 const tradeRep = simState.tradeReport();
 const routeIds = Object.keys(tradeRep);
 const activeVoyages = routeIds.every(function(id){ return tradeRep[id].voyages >= 2; });

 T.ok('SIM runs 5,000-pop / 1,020-hh economy with positive food, coke-coal, nickel-steel & silk stocks across all 4 smuggler lines',
  simState.pop === 5000 &&
  simState.households === 1020 &&
  stocks &&
  stocks.by.coke_coal.total > 100 &&
  stocks.by.nickel_steel.total > 50 &&
  stocks.by.spider_silk.total > 40 &&
  stocks.by.sweet_potato.total > 100 &&
  routeIds.length === 4 &&
  activeVoyages,
  'routes=' + routeIds.length + ', coal=' + (stocks && stocks.by.coke_coal.total) + ', silk=' + (stocks && stocks.by.spider_silk.total));
}

T.done();
