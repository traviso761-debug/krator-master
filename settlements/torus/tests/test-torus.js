#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ', name, detail ? '(' + detail + ')' : ''); }
  else { fail++; console.error('FAIL ', name, detail ? '(' + detail + ')' : ''); }
}

const sandbox = {
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Map, Set,
  Float32Array, Int32Array, Uint32Array, Uint16Array, Uint8Array,
  isFinite, isNaN, parseInt, parseFloat,
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);

function load(rel) {
  const full = path.join(ROOT, rel);
  vm.runInContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: rel });
}

// Load core data modules
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/tags/50-core-tags.js');
load('core/tags/52-core-tags-vocab.js');
load('core/door/10-core-door.js');
load('core/door/20-core-glass.js');
load('core/walk/20-core-walk.js');
load('core/biome/37-core-traps.js');
load('core/hazard/20-core-hazard.js');
load('core/export/07-core-export.js');
for (const f of ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js']) {
  load('kits/crops/src/' + f);
}
for (const f of [
  '40-tr-records.js', '41-tr-path.js', '41b-tr-network.js', '42-tr-highway.js',
  '43-tr-rail.js', '43b-tr-subway.js', '44-tr-dress.js', '44b-tr-war.js', '44c-tr-quake.js',
]) load('kits/ancient-transit/src/' + f);
for (const f of [
  '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
  '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js',
  '34-city-radial.js', '40-city-kcity.js',
]) load('core/city/' + f);
vm.runInContext('KCITY.lib = { SL, OCC, Raster, V, obb, obbCorners, inPoly, resample, plLen, plFrame, segDist, ryFacing, plan: () => PLAN };', sandbox);
const simDir = path.join(ROOT, 'core', 'simulation');
for (const f of fs.readdirSync(simDir).filter(x => x.startsWith('77-sim-') && x.endsWith('.js')).sort()) {
  load('core/simulation/' + f);
}

// Load Torus [G data] fragments
for (const f of [
  '30-torus-arcology.js', '31-torus-kits-data.js', '32-torus-city-plan.js',
  '32b-torus-hinterland.js', '33-torus-rules.js', '34-torus-stage4-arcology.js',
  '35-torus-stage4-landmarks.js', '36-torus-city-kcity.js', '78-torus-sim.js',
  '88d-torus-trades.js',
]) load('settlements/torus/src/' + f);

const TORUS = sandbox.TORUS;
const plan = TORUS.buildCityPlan(20261118);
const plan2 = TORUS.buildCityPlan(20261118);
ok('KRAND determinism: same seed yields identical building count and positions',
  plan.buildings.length === plan2.buildings.length && plan.buildings[0].x === plan2.buildings[0].x,
  plan.buildings.length + ' buildings');

// Verify sky-fruitvine registered in kits/crops
const sfv = (sandbox.CROPS.get && sandbox.CROPS.get('sky-fruitvine')) || (sandbox.CROPS.BY_KEY && sandbox.CROPS.BY_KEY['sky-fruitvine']) || (sandbox.CROPS.LIST || []).find(c => c.key === 'sky-fruitvine' || c.id === 'sky-fruitvine');
ok('sky-fruitvine registered in CROPS kit', !!sfv, sfv ? sfv.name : 'missing');

// All 12 layout rules in 33-torus-rules.js
for (const [key, fn] of Object.entries(TORUS.RULES)) {
  const res = fn(plan);
  ok('rule ' + key, !!res.pass, res.detail);
}

// Negative control on governance
const badGov = JSON.parse(JSON.stringify(plan));
badGov.site.governance.localRule = 'direct_military_governor';
const govRes = TORUS.RULES.populationAndGovernance(badGov);
ok('negative: replacing Torus elected Chairman & Board with military governor fails', !govRes.pass, govRes.detail);

// Negative control on feral dome quarantine
const badFeral = JSON.parse(JSON.stringify(plan));
badFeral.feralDomes[0].quarantined = false;
const qRes = TORUS.RULES.specimensAndFeralQuarantine(badFeral);
ok('negative: unquarantined feral ag-dome is caught', !qRes.pass, qRes.detail);

// Stage 6 KCITY
const kc = TORUS.buildKCity(plan);
const kcPlan = kc && (kc.plan || (typeof kc.export === 'function' ? kc.export() : null));
ok('Stage 6 KCITY populated cleanly', kcPlan && kcPlan.lots && kcPlan.lots.length >= 1700 && kcPlan.ways && kcPlan.ways.length >= 20,
  'lots=' + (kcPlan && kcPlan.lots ? kcPlan.lots.length : 0) + ', ways=' + (kcPlan && kcPlan.ways ? kcPlan.ways.length : 0));

// Stage 5 SIM
const sim = TORUS.initSim(plan);
const simCheck = sandbox.SIM.check();
const simProblems = Array.isArray(simCheck) ? simCheck : (simCheck && simCheck.problems) || [];
ok('Stage 5 SIM.check() clean across 8,500 residents', sim && sim.totalResidents === 8500 && simProblems.length === 0,
  'residents=' + (sim && sim.totalResidents) + ', problems=' + simProblems.length);

// Stage 6 SIM export checks
const expDoc = TORUS.simExport();
const expChecks = TORUS.simExportChecks(expDoc);
for (const ec of expChecks) {
  ok('simExport: ' + ec.name, !!(ec.ok != null ? ec.ok : ec.pass), ec.detail);
}

// Built dist/torus.html exists
const distHtml = path.join(HERE, 'dist', 'torus.html');
ok('dist/torus.html built', fs.existsSync(distHtml) && fs.statSync(distHtml).size > 500000,
  fs.existsSync(distHtml) ? Math.round(fs.statSync(distHtml).size / 1024) + ' KB' : 'missing');

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail ? 1 : 0);
