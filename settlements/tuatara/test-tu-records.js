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
const TU_REC = require(path.join(__dirname, 'src/80-tu-records.js'));

const chk = LZ_TUNE.checkTown(TU_REC);
T.ok('TU_REC holds to LZ_TUNE: 3,000 by caste, shares 1.0, grain 1,000 t, produce 250 t, meat_hide 210 t, copper 98 t',
  chk.ok, chk.problems.join('; ') || 'ok');

const missingCrops = TU_REC.crops.filter(c => !CROPS.BY_ID[c.id]).map(c => c.id);
T.ok('every crop Tuatara grows exists in kits/crops',
  missingCrops.length === 0 && TU_REC.crops.length === 4,
  missingCrops.length ? 'missing: ' + missingCrops.join(', ') : TU_REC.crops.map(c => c.id).join(', '));

const badCaste = Object.assign({}, TU_REC, {
  castes: TU_REC.castes.map(c => c.caste === 3 ? Object.assign({}, c, { people: 900 }) : c)
});
T.neg('LZ_TUNE.checkTown refuses TU_REC when Drovers drift from 840 to 900',
  r => LZ_TUNE.checkTown(r).ok, badCaste, TU_REC);

const badCopper = Object.assign({}, TU_REC, {
  works: TU_REC.works.map(w => w.good === 'copper' ? Object.assign({}, w, { yearT: 55 }) : w)
});
T.neg('LZ_TUNE.checkTown refuses TU_REC when copper output drifts from 70 t to 55 t',
  r => LZ_TUNE.checkTown(r).ok, badCopper, TU_REC);

T.done();
