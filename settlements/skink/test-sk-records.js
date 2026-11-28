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
const SK_REC = require(path.join(__dirname, 'src/80-sk-records.js'));

const chk = LZ_TUNE.checkTown(SK_REC);
T.ok('SK_REC holds to LZ_TUNE: 1,500 by caste, shares 1.0, salt 300 t, grain 300 t, produce 125 t, meat_hide 75 t',
  chk.ok, chk.problems.join('; ') || 'ok');

const missingCrops = SK_REC.crops.filter(c => !CROPS.BY_ID[c.id]).map(c => c.id);
T.ok('every crop Skink grows exists in kits/crops',
  missingCrops.length === 0 && SK_REC.crops.length === 3,
  missingCrops.length ? 'missing: ' + missingCrops.join(', ') : SK_REC.crops.map(c => c.id).join(', '));

const badCaste = Object.assign({}, SK_REC, {
  castes: SK_REC.castes.map(c => c.caste === 2 ? Object.assign({}, c, { people: 440 }) : c)
});
T.neg('LZ_TUNE.checkTown refuses SK_REC when Makers drift from 390 to 440',
  r => LZ_TUNE.checkTown(r).ok, badCaste, SK_REC);

const badSalt = Object.assign({}, SK_REC, {
  works: SK_REC.works.map(w => w.good === 'salt' ? Object.assign({}, w, { yearT: 220 }) : w)
});
T.neg('LZ_TUNE.checkTown refuses SK_REC when salt output drifts from 300 t to 220 t',
  r => LZ_TUNE.checkTown(r).ok, badSalt, SK_REC);

T.done();
