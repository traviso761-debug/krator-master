#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

for (const f of ['core/rand/08-core-rand.js', 'kits/crops/src/10-crop-core.js', 'kits/crops/src/20-crop-records.js',
  'kits/crops/src/22-crop-material.js', 'kits/crops/src/40-crop-query.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
}
const LZ_TUNE = require(path.join(ROOT, 'core/region/data/lz-tune.js'));
const BS_REC = require(path.join(__dirname, 'src/80-bs-records.js'));
const PLAN = JSON.parse(fs.readFileSync(path.join(__dirname, 'basilisk_plan.json'), 'utf8'));

const chk = LZ_TUNE.checkTown(BS_REC);
T.ok('BS_REC holds to LZ_TUNE: 30,000 by caste (25/25/20/15/5/10 %), grain 2,800 t, produce 2,550 t, fish 1,200 t, meat_hide 900 t, salt 85 t, bone 96 t',
  chk.ok, chk.problems.join('; ') || 'ok');

const missingCrops = BS_REC.crops.filter(c => !CROPS.BY_ID[c.id]).map(c => c.id);
T.ok('every crop Basilisk grows exists in kits/crops',
  missingCrops.length === 0 && BS_REC.crops.length === 4,
  missingCrops.length ? 'missing: ' + missingCrops.join(', ') : BS_REC.crops.map(c => c.id).join(', '));

const barges = PLAN.placed.filter(r => r.key === 'lz-barge');
T.ok('basilisk_plan.json houses >= 30,000 residents and tags all reed barges as cls vessel',
  PLAN.census.total_housed >= 30000 && barges.length >= 6 && barges.every(b => b.cls === 'vessel' && b.tags && b.tags.propulsion === 'paddles'),
  'housed ' + PLAN.census.total_housed + ', barges ' + barges.length);

const badCaste = Object.assign({}, BS_REC, {
  castes: BS_REC.castes.map(c => c.caste === 5 ? Object.assign({}, c, { people: 1900 }) : c)
});
T.neg('LZ_TUNE.checkTown refuses BS_REC when Interpreters drift from 1,500 to 1,900',
  r => LZ_TUNE.checkTown(r).ok, badCaste, BS_REC);

const badSalt = Object.assign({}, BS_REC, {
  works: BS_REC.works.map(w => w.good === 'salt' ? Object.assign({}, w, { yearT: 115 }) : w)
});
T.neg('LZ_TUNE.checkTown refuses BS_REC when salt output drifts from scaled-back 55 t back to 115 t',
  r => LZ_TUNE.checkTown(r).ok, badSalt, BS_REC);

T.done();
