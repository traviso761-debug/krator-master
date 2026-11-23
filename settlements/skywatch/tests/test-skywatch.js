#!/usr/bin/env node
/* Plain-Node [G data] test for Skywatch (settlements/skywatch/src/28..34):
   Verifies Scale Model 5.1 pin & ground, KDRAWN registration, all 5 architectural tiers,
   KCITY roads/lots/walls, KHAMLET regional villages, KCAMP convoy & Sasquatch camps,
   RES_ORE copper/zinc skarn linkage, step-cistern hydrology, Silent Moot 13-monolith
   equinox circle, JJ_SOLSTICE & 360-deg horizon sightlines, KTAGS vocabulary audit,
   and determinism across runs — each paired with a T.neg negative control. */
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
let cityBundle = 'var SW_CITY_CORE = (function(window){\nvar KSPACE = window.KSPACE;\n';
for (const f of cityFiles.concat(hamletFiles)) {
  cityBundle += fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n';
}
cityBundle += 'KCITY.lib = { SL: SL, plan: function(){return PLAN;}, tune: function(){return TUNE;}, KSPACE: KSPACE, ' +
  'Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, ' +
  'resample: resample, clamp: clamp, inPoly: inPoly, cg: function(){return CG;} };\n' +
  'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n' +
  'var KCITY = SW_CITY_CORE.KCITY, KHAMLET = SW_CITY_CORE.KHAMLET;\n';
vm.runInContext(cityBundle, ctx, { filename: '24-sw-kcity-bundle.js' });

/* 2. Load Skywatch [G data] fragments */
[
  'settlements/skywatch/src/28-sw-model.js',
  'settlements/skywatch/src/30-sw-ground.js',
  'settlements/skywatch/src/32-sw-layout.js',
  'settlements/skywatch/src/34-sw-rules.js'
].forEach(f => loadInto(ctx, f));

const M = ctx.SW_MODEL;
const G = ctx.SW_GROUND;
const SWL = ctx.SW_LAYOUT;
const SWR = ctx.SW_RULES;
const L = SWL.plan;

function clonePlan(p) { return JSON.parse(JSON.stringify(p)); }

/* ---- Test 1: Scale Model 5.1 Pin, Datum & KDRAWN Ground ---- */
T.ok('pin s8921htcjy at (776, 470) sits at +3,745.5 m ASL beside +3,817.3 m WNW dome',
  SWR.pinCheck(L).pass, SWR.pinCheck(L).detail);

const drawnCenter = ctx.KDRAWN.h(0, 0);
const drawnFar = ctx.KDRAWN.h(12000, -16000);
T.ok('KDRAWN holds both 10 m near grid and 400 m regional 56-km skirt',
  Number.isFinite(drawnCenter) && Math.abs(drawnCenter - G.h(0, 0)) < 0.25 && Number.isFinite(drawnFar),
  'center=' + drawnCenter + ', far=' + drawnFar);

const badPin = clonePlan(L);
badPin.pin.datum = 1200;
T.neg('corrupted pin datum fails pinCheck', p => SWR.pinCheck(p).pass, badPin, L);

/* ---- Test 2: All Five Architectural Tiers, KCITY Roads/Walls, KHAMLET & Census ---- */
const tc = SWR.tiersCheck(L);
T.ok('all 5 tiers, curtain wall, switchback streets, hamlets and ~1,600 census populated', tc.pass, tc.detail);

const jjShare = L.census.townJjShare;
T.ok('Tier II walled town mixes Jimjam brick (~35%) and Highlands rustic (~65%)',
  jjShare >= 0.22 && jjShare <= 0.48,
  'jj=' + L.census.townJjBuildings + ', hl=' + L.census.townHlBuildings + ', share=' + jjShare);

const badTiers = clonePlan(L);
badTiers.tiers[4] = [];
T.neg('emptying Tier IV fails tiersCheck', p => SWR.tiersCheck(p).pass, badTiers, L);

/* ---- Test 3: Zero Building-Footprint Overlaps (KSPACE + exact OBB) ---- */
const oc = SWR.overlapsCheck(L);
T.ok('zero building footprint overlaps across all 5 tiers', oc.pass, oc.detail);

const badOverlap = clonePlan(L);
badOverlap.structures[1].x = badOverlap.structures[0].x;
badOverlap.structures[1].z = badOverlap.structures[0].z;
T.neg('colliding two structures fails overlapsCheck', p => SWR.overlapsCheck(p).pass, badOverlap, L);

/* ---- Test 3b: Curtain Wall-to-Tower, Bastion & Gatehouse Joins (0.35-0.75 m embed + vertical overlap) ---- */
const wj = SWR.wallTowerJoins(L);
T.ok('wallTowerJoins has 0 violations across all curtain-wall runs, guard towers, bastions and gatehouses',
  wj.pass && wj.violations.length === 0, wj.detail);

const badWallGap = clonePlan(L);
const seg0 = badWallGap.walls.find(w => w.id === 'sw.wall.seg.0.3');
const tw1 = badWallGap.walls.find(w => w.id === 'sw.wall.tower.1');
/* Pull the east end of sw.wall.seg.0.3 back so a 0.5 m planar gap opens outside guard tower sw.wall.tower.1 */
{
  const segPrev = badWallGap.walls.find(w => w.id === 'sw.wall.seg.0.2');
  const ux = (tw1.x - segPrev.x) / Math.hypot(tw1.x - segPrev.x, tw1.z - segPrev.z);
  const uz = (tw1.z - segPrev.z) / Math.hypot(tw1.x - segPrev.x, tw1.z - segPrev.z);
  /* Tower drum chord at |z|=2.5 m is ~3.60 m from center; shifting end from 3.00 m out to 4.10 m creates an exact 0.50 m gap */
  const pullBack = 1.10;
  seg0.w -= pullBack;
  seg0.x -= ux * (pullBack * 0.5);
  seg0.z -= uz * (pullBack * 0.5);
}
T.neg('0.5 m wall-to-tower air gap triggers wallTowerJoins violation',
  p => SWR.wallTowerJoins(p).pass && SWR.wallTowerJoins(p).violations.length === 0, badWallGap, L);

const badWallVert = clonePlan(L);
badWallVert.walls.find(w => w.id === 'sw.wall.seg.0.0').y += 3.0;
T.neg('excessive vertical step at wall-to-tower join triggers wallTowerJoins violation',
  p => SWR.wallTowerJoins(p).pass && SWR.wallTowerJoins(p).violations.length === 0, badWallVert, L);

/* ---- Test 4: Rock-Cut Vaulted Step-Cisterns ---- */
const cc = SWR.cisternCheck(L);
T.ok('both vaulted step-cisterns hold water cleanly below rim pads and above excavated floors', cc.pass, cc.detail);

const badCistern = clonePlan(L);
badCistern.cisterns[0].waterY = badCistern.cisterns[0].rimY + 0.5;
T.neg('flooding cistern water above rim fails cisternCheck', p => SWR.cisternCheck(p).pass, badCistern, L);

/* ---- Test 5: Tier V Silent Moot 13-Monolith Circle & Zero-Totem Rule ---- */
const mc = SWR.mootCheck(L);
T.ok('The Silent Moot has 13 basalt monoliths on R=14 m sighting Az 90.00 deg with zero totems', mc.pass, mc.detail);

const badMoot = clonePlan(L);
badMoot.moot.monoliths[0].culture = 'painted';
T.neg('Painted-Men totem culture on Silent Moot fails mootCheck', p => SWR.mootCheck(p).pass, badMoot, L);

/* ---- Test 6: JJ_SOLSTICE Sanctuary Arch & Horizon Sightline ---- */
const sc = SWR.solsticeCheck(L);
T.ok('JJ_SOLSTICE sunset ray (Az 242.17 deg, Alt +3.00 deg) threads Sanctuary arch and clears horizon',
  sc.pass, sc.detail);

const badSol = clonePlan(L);
badSol.solstice.archCenter[0] += 18;
T.neg('shifting Sanctuary arch off-axis fails solsticeCheck', p => SWR.solsticeCheck(p).pass, badSol, L);

/* ---- Test 7: 360-Degree Observatory Horizon & 300-km NNE Outer-Wall Window ---- */
const hc = SWR.horizonCheck(L);
T.ok('360-deg horizon <= +0.45 deg, NNE Outer-Wall window >= 300 km, and Gas Giant clear', hc.pass, hc.detail);

const origHz = M.horizonAlt[22];
M.horizonAlt[22] = 4.5;
const faultyHz = SWR.horizonCheck(L).pass;
M.horizonAlt[22] = origHz;
T.neg('mountain blocking horizon above +0.45 deg fails horizonCheck',
  flag => flag === true, faultyHz, SWR.horizonCheck(L).pass);

/* ---- Test 8: Copper-Zinc Skarn Nodes & Wind-Furnace Brass Works ---- */
const skc = SWR.skarnCheck(L);
T.ok('copper=120 and zinc=96 skarn adits link via resSource to katabatic wind-furnaces', skc.pass, skc.detail);

const badSkarn = clonePlan(L);
badSkarn.tiers[4].forEach(r => { r.source = null; });
T.neg('unlinked skarn mine adits fail skarnCheck', p => SWR.skarnCheck(p).pass, badSkarn, L);

/* ---- Test 9: KCAMP Convoy Laagers & 1.35x Sasquatch Equinox Bands ---- */
const cmc = SWR.campsCheck(L);
T.ok('2 armed convoy laagers and 3 Sasquatch 1.35x equinox bands pitched via KCAMP', cmc.pass, cmc.detail);

const badCamps = clonePlan(L);
badCamps.camps[3].scaleRig = 1.0;
T.neg('wrong Sasquatch rig scale fails campsCheck', p => SWR.campsCheck(p).pass, badCamps, L);

/* ---- Test 10: KTAGS Registration & Vocabulary Audit + Determinism ---- */
const tags = ctx.KTAGS.create({ build: 'skywatch' });
const regCount = SWR.registerTags(L, tags);
const audit = tags.audit();
T.ok('every placed structure, wall, cistern, monolith and ore node registers cleanly in KTAGS',
  regCount >= L.structures.length + L.walls.length + L.oreNodes.length &&
  audit.unknown === 0 && audit.missingCulture === 0,
  'registered=' + regCount + ', unknown=' + audit.unknown + ', missingCulture=' + audit.missingCulture);

const L2 = SWL.make();
T.ok('SW_LAYOUT.make() is 100% deterministic across repeated calls',
  JSON.stringify(L) === JSON.stringify(L2),
  'structures=' + L.structures.length + ', pop=' + L.census.permanent);

T.done();
