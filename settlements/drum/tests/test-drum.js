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
load('core/export/07-core-export.js');
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

// Load Drum [G data] fragments
for (const f of [
  '30-drum-arcology.js', '31-drum-kits-data.js', '32-drum-city-plan.js',
  '33-drum-rules.js', '34-drum-stage4-arcology.js', '35-drum-stage4-landmarks.js',
  '36-drum-city-kcity.js', '78-drum-sim.js', '88d-drum-trades.js',
]) load('settlements/drum/src/' + f);

const DRUM = sandbox.DRUM;
const plan = DRUM.buildCityPlan(20261118);
const plan2 = DRUM.buildCityPlan(20261118);
ok('KRAND determinism: same seed yields identical building count and positions',
  plan.buildings.length === plan2.buildings.length && plan.buildings[0].x === plan2.buildings[0].x,
  plan.buildings.length + ' buildings');

// All layout rules in 33-drum-rules.js
const checks = DRUM.checks(plan);
for (const c of checks) {
  ok('rule ' + c.id, !!c.pass, c.detail);
}

// Negative control on population split
const badPop = JSON.parse(JSON.stringify(plan));
badPop.pop.total = 9999;
const popRes = DRUM.RULES.populationSplit(badPop);
ok('negative: broken population total is caught', !popRes.pass, popRes.detail);

// Negative control on duplicate IDs
const badId = JSON.parse(JSON.stringify(plan));
badId.buildings[1].id = badId.buildings[0].id;
const idRes = DRUM.RULES.uniqueIds(badId);
ok('negative: duplicate building ID is caught', !idRes.pass, idRes.detail);

// Stage 6 KCITY
const kc = DRUM.buildKCity(plan);
const kcPlan = kc && (kc.plan || (typeof kc.export === 'function' ? kc.export() : null));
ok('Stage 6 KCITY populated cleanly', kcPlan && kcPlan.lots && kcPlan.lots.length >= 2000 && kcPlan.ways && kcPlan.ways.length >= 20,
  'lots=' + (kcPlan && kcPlan.lots ? kcPlan.lots.length : 0) + ', ways=' + (kcPlan && kcPlan.ways ? kcPlan.ways.length : 0));

// Stage 5 SIM
const sim = DRUM.initSim(plan);
const simCheck = sandbox.SIM.check();
const simProblems = Array.isArray(simCheck) ? simCheck : (simCheck && simCheck.problems) || [];
ok('Stage 5 SIM.check() clean across 13,500 residents', sim && sim.residents === 13500 && simProblems.length === 0,
  'residents=' + (sim && sim.residents) + ', problems=' + simProblems.length);

// Stage 6 SIM export checks
const expDoc = DRUM.simExport();
const expChecks = DRUM.simExportChecks(expDoc);
for (const ec of expChecks) {
  ok('simExport: ' + ec.name, !!(ec.ok != null ? ec.ok : ec.pass), ec.detail);
}

// Built dist/drum.html exists
const distHtml = path.join(HERE, 'dist', 'drum.html');
ok('dist/drum.html built', fs.existsSync(distHtml) && fs.statSync(distHtml).size > 500000,
  fs.existsSync(distHtml) ? Math.round(fs.statSync(distHtml).size / 1024) + ' KB' : 'missing');

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail ? 1 : 0);
