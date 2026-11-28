#!/usr/bin/env node
/* Plain-Node [G data] test for Ardent & the Free Clans (settlements/ardent/src/28..34):
   Verifies Scale Model 5.1 pin (830, 553; +2,801.9 m ASL), KDRAWN near & regional grids,
   Ardent Burn monotonic hydrology, 5x-scale KCITY Walled Capital (>=420 total records),
   Rustic-only branch rule, seamless curtain-wall / watchtower / bastion / gatehouse sockets,
   quaint narrow-cobbled wynds (3.5-7.4 m) & all 17 Baronial-Caucasus defs, Nine Clans koshki
   crown + Thing-Stead + Darbazi Law-Hall + Envoy Lodge + Tolbooth, RES_ORE copper/tin <= 400 m
   from mines, no-electric-light canon, two-season martial franchise, Silk-Trail MC-06 -> BF-04
   Broken-Kin reiver transitions (including 0 edge cases), KTAGS vocabulary audit, and determinism. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

function loadInto(ctx, relPath) {
  const full = path.join(ROOT, relPath);
  const code = fs.readFileSync(full, 'utf8');
  vm.runInContext(code, ctx, { filename: relPath });
}

const ctx = vm.createContext({
  console: console,
  Math: Math,
  Date: Date,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp,
  Error: Error,
  Map: Map,
  Set: Set,
  Float32Array: Float32Array,
  Float64Array: Float64Array,
  Int32Array: Int32Array,
  Uint8Array: Uint8Array,
  Uint16Array: Uint16Array,
  Uint32Array: Uint32Array,
  isFinite: isFinite,
  isNaN: isNaN,
  parseFloat: parseFloat,
  parseInt: parseInt,
  Infinity: Infinity,
  NaN: NaN
});
ctx.globalThis = ctx;
ctx.window = ctx;

/* 1. Load core [G data] modules in build order */
[
  'core/rand/08-core-rand.js',
  'core/drawn/10-core-drawn.js',
  'core/space/20-core-space.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'kits/resources/src/42r-res-ore.js',
  'kits/resources/src/42s-res-ore-mined.js',
  'core/camp/10-camp-cultures.js',
  'core/camp/20-camp-census.js',
  'core/camp/30-camp-pitch.js'
].forEach(f => loadInto(ctx, f));

/* Seal core/city + core/hamlet as build.py kcity_bundle() does */
const cityFiles = [
  'core/city/10-city-core.js', 'core/city/12-city-index.js', 'core/city/15-city-ground.js',
  'core/city/20-city-plan.js', 'core/city/25-city-site.js', 'core/city/31-city-steps-b.js',
  'core/city/32-city-steps-c.js', 'core/city/33-city-strategies.js', 'core/city/37-city-grid.js',
  'core/city/40-city-kcity.js'
];
const hamletFiles = [
  'core/hamlet/10-hamlet-wood.js', 'core/hamlet/12-hamlet-gather.js', 'core/hamlet/14-hamlet-farmland.js',
  'core/hamlet/16-hamlet-names.js', 'core/hamlet/18-hamlet-names.js', 'core/hamlet/20-hamlet-cultures.js',
  'core/hamlet/30-hamlet-village.js'
];
let cityBundle = 'var AR_CITY_CORE = (function(window){\nvar KSPACE = window.KSPACE;\n';
for (const f of cityFiles.concat(hamletFiles)) {
  cityBundle += fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n';
}
cityBundle += 'KCITY.lib = { SL: SL, plan: function(){return PLAN;}, tune: function(){return TUNE;}, KSPACE: KSPACE, ' +
  'Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, ' +
  'resample: resample, clamp: clamp, inPoly: inPoly, cg: function(){return CG;} };\n' +
  'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n' +
  'var KCITY = AR_CITY_CORE.KCITY, KHAMLET = AR_CITY_CORE.KHAMLET;\n';
vm.runInContext(cityBundle, ctx, { filename: '24-ar-kcity-bundle.js' });

/* 2. Load Ardent [G data] fragments */
[
  'settlements/ardent/src/28-ar-model.js',
  'settlements/ardent/src/30-ar-ground.js',
  'settlements/ardent/src/32-ar-layout.js',
  'settlements/ardent/src/34-ar-rules.js'
].forEach(f => loadInto(ctx, f));

const M = ctx.AR_MODEL;
const G = ctx.AR_GROUND;
const ARL = ctx.AR_LAYOUT;
const ARR = ctx.AR_RULES;
const L = ARL.plan;

function clonePlan(p) { return JSON.parse(JSON.stringify(p)); }

/* ---- Test 1: Scale Model 5.1 Pin (830, 553), KDRAWN Grids & Monotonic Ardent Burn ---- */
T.ok('pin sn6y4sx8tr sits at (830, 553) at +2,801.9 m ASL with 1.127 atm pressure',
  M.id === 'sn6y4sx8tr' && M.px === 830 && M.py === 553 && Math.abs(M.datum - 2801.9) < 0.5 && M.pressureAtm === 1.127,
  'datum=' + M.datum + ', cragAsl=' + M.cragAsl);

const drawn0 = ctx.KDRAWN.h(0, 0);
const drawnFar = ctx.KDRAWN.h(12000, -14000);
T.ok('KDRAWN registers both 8 m near grid and 400 m 52-km regional skirt',
  Number.isFinite(drawn0) && Math.abs(drawn0 - G.h(0, 0)) < 0.15 && Number.isFinite(drawnFar),
  'center=' + drawn0 + ', far=' + drawnFar);

let burnMono = true;
for (let i = 0; i + 1 < L.burn.pts.length; i++) {
  if (L.burn.pts[i + 1][2] > L.burn.pts[i][2]) burnMono = false;
}
T.ok('Ardent Burn flows monotonically E -> W beneath all 3 humpback brigs',
  burnMono && G.burnWaterY(700) > G.burnWaterY(-700),
  'eastY=' + G.burnWaterY(700).toFixed(2) + ', westY=' + G.burnWaterY(-700).toFixed(2));

/* ---- Test 2: Rustic-Only Branch & 5x Capital Scale Rule ---- */
const rc = ARR.rusticOnlyCheck(L);
T.ok('rustic-only branch and 5x capital scale rule holds across >=420 structures and walls', rc.pass, rc.detail);

const badRep = clonePlan(L);
badRep.structures[0].key = 'hl_rep_hall';
badRep.structures[0].branch = 'republican';
T.neg('injecting a Republican building fails rusticOnlyCheck', p => ARR.rusticOnlyCheck(p).pass, badRep, L);

/* ---- Test 3: Walled Capital Fortification & Seamless Curtain-Wall Sockets ---- */
const wc = ARR.walledCapitalCheck(L);
T.ok('Ardent capital is enclosed by 4 twin-koshki gates, 4 corner bastions, watchtowers & 0-gap curtain walls',
  wc.pass && wc.violations.length === 0, wc.detail);

const badWallGap = clonePlan(L);
const firstSeg = badWallGap.walls.find(w => w.key === 'hl_rus_burgh_wall' && w.segIdx === 0);
if (firstSeg) {
  const nA = badWallGap.walls.find(w => w.id === firstSeg.nodeA);
  const dx = firstSeg.x - nA.x, dz = firstSeg.z - nA.z, dL = Math.hypot(dx, dz) || 1;
  const pullBack = 1.2;
  firstSeg.w -= pullBack;
  firstSeg.x += (dx / dL) * (pullBack * 0.5);
  firstSeg.z += (dz / dL) * (pullBack * 0.5);
}
T.neg('pulling a curtain-wall span back by 1.2 m triggers walledCapitalCheck socket violation',
  p => ARR.walledCapitalCheck(p).pass, badWallGap, L);

/* ---- Test 4: Quaint Narrow-Cobbled Wynds (3.0-5.8 m) & All 26 Baronial-Caucasus & Economy Defs ---- */
const nc = ARR.narrowCobblesAndMixCheck(L);
T.ok('narrow cobbled wynds (3.0-5.8 m) and all 26 Baronial-Caucasus & economy defs placed', nc.pass, nc.detail);

const badWide = clonePlan(L);
badWide.ways[0].w = 16.0;
T.neg('widening High Wynd into a 16 m avenue fails narrowCobblesAndMixCheck',
  p => ARR.narrowCobblesAndMixCheck(p).pass, badWide, L);

/* ---- Test 5: Nine Clans Koshki Crown, Thing-Stead, Darbazi Law-Hall & Envoy Lodge ---- */
const ncl = ARR.nineClansCheck(L);
T.ok('all Nine Clans koshki keeps, Nine-Stones Thing-Stead, Darbazi Law-Hall, Envoy Lodge and Tolbooth present',
  ncl.pass, ncl.detail);

const badClans = clonePlan(L);
badClans.clans.pop();
T.neg('dropping one of the Nine Clans fails nineClansCheck', p => ARR.nineClansCheck(p).pass, badClans, L);

/* ---- Test 5B: Capital Quadruple-Pagoda Distillery + 3 Clan-Seat Distilleries, ~80% Compact Area & Polygon Scope ---- */
const dp = ARR.clanDistilleryAndPolityCheck(L);
T.ok('Capital Quadruple-Pagoda Distillery + 3 Clan-Seat Distilleries, ~80% compact walled area & 42,668 km2 scope valid',
  dp.pass, dp.detail);

const badDist = clonePlan(L);
badDist.structures = badDist.structures.filter(s => s.id !== 'ar.capital_distillery');
T.neg('dropping the Capital Quadruple-Pagoda Scotch Distillery fails clanDistilleryAndPolityCheck',
  p => ARR.clanDistilleryAndPolityCheck(p).pass, badDist, L);

/* ---- Test 6: Copper + Tin RES_ORE <= 400 m & Reverberatory Bronze Foundries ---- */
const bo = ARR.bronzeOreCheck(L);
T.ok('copper_ore and tin_ore RES_ORE nodes stand within 400 m of mines feeding 3 reverberatory bronze foundries',
  bo.pass, bo.detail);

const badOre = clonePlan(L);
badOre.oreNodes[0].mineDistM = 510;
T.neg('ore node >400 m from nearest mine fails bronzeOreCheck', p => ARR.bronzeOreCheck(p).pass, badOre, L);

/* ---- Test 7: No-Electric-Light Canon ---- */
const nl = ARR.noElectricLightCheck(L);
T.ok('zero electrically lit structures anywhere in the Free Clans', nl.pass, nl.detail);

const badLit = clonePlan(L);
badLit.structures[2].lit = true;
T.neg('electrically lighting a structure fails noElectricLightCheck', p => ARR.noElectricLightCheck(p).pass, badLit, L);

/* ---- Test 8: Martial Two-Season Franchise & Silk-Trail MC-06 <-> BF-04 State ---- */
const sm = ARR.silkTrailMercenaryCheck(L);
T.ok('two-season foreign-service franchise and 3 KCAMP Silk-Trail free-company camps valid', sm.pass, sm.detail);

const zeroPaid = ARR.evaluateBandState({ unpaidDays: 0, silkCaravanIndex: 0.80, harvestIndex: 0.75 });
const arrearsReiver = ARR.evaluateBandState({ unpaidDays: 15, silkCaravanIndex: 0.80, harvestIndex: 0.75 });
const zeroCollapse = ARR.evaluateBandState({ unpaidDays: 0, silkCaravanIndex: 0, harvestIndex: 0 });
T.ok('evaluateBandState preserves numeric 0 and transitions MC-06 -> BF-04 on >14d arrears or Silk-Trail + harvest collapse',
  zeroPaid.code === 'MC-06' && !zeroPaid.discTurned &&
  arrearsReiver.code === 'BF-04' && arrearsReiver.discTurned &&
  zeroCollapse.code === 'BF-04' && zeroCollapse.discTurned,
  zeroPaid.code + ' -> ' + arrearsReiver.code + ' / ' + zeroCollapse.code);

const badCit = clonePlan(L);
badCit.citizens[0].foreignSeasonsRidden = 0;
badCit.citizens[0].thingVoteEligible = true;
T.neg('granting Clanthing vote with 0 foreign seasons fails silkTrailMercenaryCheck',
  p => ARR.silkTrailMercenaryCheck(p).pass, badCit, L);

/* ---- Test 9: Pre-Draw KTAGS Vocabulary Audit & Determinism ---- */
const tags = ctx.KTAGS.create({ build: 'ardent' });
const regCount = ARR.registerTags(L, tags);
const audit = tags.audit();
T.ok('every structure, wall, Thing-Stone, ore node, camp and citizen registers cleanly in KTAGS with 0 unknown tags',
  regCount >= L.structures.length + L.walls.length + 9 + L.oreNodes.length + L.camps.length + L.citizens.length &&
  audit.unknown === 0 && audit.missingCulture === 0,
  'registered=' + regCount + ', unknown=' + audit.unknown + ', missingCulture=' + audit.missingCulture);

const L2 = ARL.make();
T.ok('AR_LAYOUT.make() is 100% deterministic across repeated calls',
  JSON.stringify(L) === JSON.stringify(L2),
  'buildings=' + L.structures.length + ', walls=' + L.walls.length + ', total=' + (L.structures.length + L.walls.length));

T.done();
