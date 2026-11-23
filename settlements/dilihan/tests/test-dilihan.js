#!/usr/bin/env node
/* Plain-Node [G data] test suite for Dilihan (settlements/dilihan/src/28..34):
   Verifies Scale Model 5.1 pin (744, 663) & Cut bowl geometry, KDRAWN near + 30 km grids,
   1:4 colonia-to-Vernacular built area ratio ([3.2, 4.8]), <= 0.50 m wall-street cornice match,
   zero OBB footprint overlaps, jj_temple_sun summer-solstice ray alignment at -31.50 deg S
   (+4.00 deg clearing +3.58..+3.61 deg SW Cut rim & unshifted refPx trap detection),
   govpalace 7-chhatri + gold-onion-dome + undercroft/floors programme, KHAMLET handu allotments +
   CROPS Cut basket + KCONS sites + RES_ORE tin/iron skarn links, KTAGS vocabulary audit,
   and 100% determinism across runs — each paired with a T.neg negative control. */
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
  'core/mask/25-core-mask.js',
  'core/mask/26-core-mask-xform.js',
  'core/mask/27-core-mask-distance.js',
  'core/coast/30-core-coast.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'biomes/cut/src/41-cut-field.js',
  'kits/resources/src/42r-res-ore.js',
  'kits/resources/src/42s-res-ore-mined.js',
  'kits/crops/src/10-crop-core.js',
  'kits/crops/src/20-crop-records.js',
  'kits/crops/src/22-crop-material.js',
  'kits/crops/src/40-crop-query.js'
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
  'core/hamlet/21-hamlet-iziz.js', 'core/hamlet/30-hamlet-village.js'
];
let cityBundle = 'var DL_CITY_CORE = (function(window){\nvar KSPACE = window.KSPACE;\n';
for (const f of cityFiles.concat(hamletFiles)) {
  cityBundle += fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n';
}
cityBundle += 'KCITY.lib = { SL: SL, plan: function(){return PLAN;}, tune: function(){return TUNE;}, KSPACE: KSPACE, ' +
  'Raster: Raster, OCC: OCC, V: V, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, ' +
  'resample: resample, clamp: clamp, inPoly: inPoly, ryFacing: ryFacing, cg: function(){return CG;} };\n' +
  'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n' +
  'var KCITY = DL_CITY_CORE.KCITY, KHAMLET = DL_CITY_CORE.KHAMLET;\n';
vm.runInContext(cityBundle, ctx, { filename: '24-dl-kcity-bundle.js' });

/* 2. Load Dilihan [G data] fragments */
[
  'settlements/dilihan/src/28-dl-model.js',
  'settlements/dilihan/src/30-dl-ground.js',
  'settlements/dilihan/src/32-dl-layout.js',
  'settlements/dilihan/src/34-dl-rules.js'
].forEach(f => loadInto(ctx, f));

const G = ctx.DL_GROUND;
const DLL = ctx.DL_LAYOUT;
const DLR = ctx.DL_RULES;
const L = DLL.plan;

function clonePlan(p) { return JSON.parse(JSON.stringify(p)); }

/* ---- Test 1: Scale Model 5.1 Pin (744, 663), Cut Bowl & KDRAWN Ground ---- */
const pc = DLR.pinCheck(L);
T.ok('pin solqo7hz7s at (744, 663) sits at -888.6 m ASL with -892 m colonia spur, -878 m palace & -1,608 m N salt lake',
  pc.pass, pc.detail);

const drawnColonia = ctx.KDRAWN.h(0, -60);
const drawnLake = ctx.KDRAWN.h(0, -9000);
T.ok('KDRAWN holds both 10 m near grid and 30 km regional Cut bowl + salt-lake skirt',
  Number.isFinite(drawnColonia) && Math.abs(drawnColonia - G.h(0, -60)) < 0.25 && Number.isFinite(drawnLake),
  'colonia=' + drawnColonia + ', lake=' + drawnLake);

const badPin = clonePlan(L);
badPin.pin.datum = 450.0;
T.neg('corrupted pin datum fails pinCheck', p => DLR.pinCheck(p).pass, badPin, L);

/* ---- Test 2: Settled 1:4 Colonia-to-Vernacular Built Area Ratio, ~65% dil_* Vassal Mix & 10% Merchant Mix ---- */
const arc = DLR.areaRatioCheck(L);
T.ok('Zone 3 Vernacular districts take ~4.0x the Colonia built area ([3.2, 4.8]) with ~65% dil_* brick vassal architecture & ~10% Jimjam mix',
  arc.pass, arc.detail);

const badRatio = clonePlan(L);
badRatio.areas.vernacularBuiltM2 = badRatio.areas.coloniaBuiltM2 * 1.4;
T.neg('shrunk 1.4:1 district area fails areaRatioCheck', p => DLR.areaRatioCheck(p).pass, badRatio, L);

const badDilMix = clonePlan(L);
badDilMix.census.dilihanVassalShare = 0.15;
T.neg('omitting dil_* vassal buildings (15% share) fails areaRatioCheck', p => DLR.areaRatioCheck(p).pass, badDilMix, L);

/* ---- Test 3: Wall-Street Cornice Match (<= 0.50 m via o.scale) ---- */
const cnc = DLR.corniceCheck(L);
T.ok('every paired Wall-Street Jimjam/Vernacular facade matches cornice height within <= 0.50 m via o.scale',
  cnc.pass, cnc.detail);

const badCornice = clonePlan(L);
badCornice.wallStreetPairs[2].jjCornice = 10.65;   /* unscaled jj_house_mid_c (10.65 vs 6.65 -> 4.00 m mismatch) */
T.neg('unscaled jj_house_mid_c (4.00 m cornice jump) fails corniceCheck', p => DLR.corniceCheck(p).pass, badCornice, L);

/* ---- Test 4: Zero OBB Building-Footprint Overlaps across All 5 Zones ---- */
const ovc = DLR.overlapsCheck(L);
T.ok('zero OBB building footprint overlaps across all 5 urban and hinterland zones', ovc.pass, ovc.detail);

const badOverlap = clonePlan(L);
badOverlap.structures[3].x = badOverlap.structures[2].x;
badOverlap.structures[3].z = badOverlap.structures[2].z;
T.neg('colliding two structures fails overlapsCheck', p => DLR.overlapsCheck(p).pass, badOverlap, L);

/* ---- Test 5: Re-Aimed jj_temple_sun Summer-Solstice Ray (-31.50 deg S, +4.00 deg, Az 245.39 deg) ---- */
const slc = DLR.solsticeCheck(L);
T.ok('summer-solstice sunset ray at -31.50 deg S (day 350, hr 18.6572, +4.00 deg, Az 245.39 deg) threads jj_temple_sun portal & clears +3.58 deg SW Cut rim',
  slc.pass, slc.detail);

/* Verify the PLAN.md §2.2 unshifted (744, 663) 4.x refPx trap (-39.36 deg S) fails solsticeCheck! */
const trapSol = clonePlan(L);
trapSol.solstice.ephemeris = L.solstice.unshiftedTrap;
T.neg('unshifted ATMOS.siteAt(744, 663) latitude (-39.36 deg S) fails solsticeCheck',
  p => DLR.solsticeCheck(p).pass, trapSol, L);

const blockedSol = clonePlan(L);
blockedSol.solstice.archBaseWorld[0] += 14.0;
T.neg('shifting temple arch 14 m off-axis fails solsticeCheck', p => DLR.solsticeCheck(p).pass, blockedSol, L);

/* ---- Test 6: Governor's Palace (govpalace) 7-Pavilion, Onion-Dome & Undercroft Programme ---- */
const plc = DLR.palaceCheck(L);
T.ok('govpalace has 70x56m grounds, 7 chhatri pavilions, gold onion dome, undercroft & Iziz-orange discipline',
  plc.pass, plc.detail);

const badPalace = clonePlan(L);
badPalace.palace.pavilions.pop();
T.neg('dropping the round kitchen pavilion fails palaceCheck', p => DLR.palaceCheck(p).pass, badPalace, L);

/* ---- Test 7: Five Zones, 8 Handu Allotments, CROPS Basket, KCONS Sites & RES_ORE Skarn Links ---- */
const zhc = DLR.zonesAndHanduCheck(L);
T.ok('all 5 zones, 8 handu veteran hamlets, CROPS Cut basket, KCONS sites, 16,000 census & RES_ORE skarn links valid',
  zhc.pass, zhc.detail);

const badSkarn = clonePlan(L);
badSkarn.structures.forEach(r => { r.source = null; });
T.neg('severing RES_ORE tin/iron skarn resSource links fails zonesAndHanduCheck',
  p => DLR.zonesAndHanduCheck(p).pass, badSkarn, L);

/* ---- Test 7b: Full Inner + Outer Fortified Circuit Walls, Concentric Solstice Sanctuary Plaza & Urban Density ---- */
const wpc = DLR.wallAndPlazaCheck(L);
T.ok('continuous inner Colonia + outer Dilihan circuit walls, concentric 86x110m Solstice Esplanade & dense urban fabric',
  wpc.pass, wpc.detail);

const offCenterPlaza = clonePlan(L);
offCenterPlaza.structures.forEach(r => {
  if (r.key === 'dl_solstice_plaza') r.x += 10.0;
});
T.neg('shifting dl_solstice_plaza 10 m off-center from jj_temple_sun fails wallAndPlazaCheck',
  p => DLR.wallAndPlazaCheck(p).pass, offCenterPlaza, L);

const unWalled = clonePlan(L);
unWalled.walls = unWalled.walls.filter(w => w.key.indexOf('dil_wall_') !== 0);
T.neg('removing outer dil_wall_* circuit wall fails wallAndPlazaCheck',
  p => DLR.wallAndPlazaCheck(p).pass, unWalled, L);

/* ---- Test 8: KTAGS Registration & Vocabulary Audit + Determinism ---- */
const tags = ctx.KTAGS.create({ build: 'dilihan' });
const regCount = DLR.registerTags(L, tags);
const audit = tags.audit();
T.ok('every placed structure, wall, ore node and citizen registers cleanly in KTAGS with 0 unknown & 0 missingCulture',
  regCount >= L.structures.length + L.walls.length + L.oreNodes.length + L.citizens.length &&
  audit.unknown === 0 && audit.missingCulture === 0,
  'registered=' + regCount + ', unknown=' + audit.unknown + ', missingCulture=' + audit.missingCulture);

const L2 = DLL.make();
T.ok('DL_LAYOUT.make() is 100% deterministic across repeated calls',
  JSON.stringify(L) === JSON.stringify(L2),
  'structures=' + L.structures.length + ', walls=' + L.walls.length + ', ratio=' + L.areas.builtRatio);

T.done();
