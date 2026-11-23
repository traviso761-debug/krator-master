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
const KM_REC = require(path.join(__dirname, 'src/80-km-records.js'));

const chk = LZ_TUNE.checkTown(KM_REC);
T.ok('KM_REC holds to LZ_TUNE: 3,000 by caste, shares 1.0, grain 600 t, produce 250 t, fish 240 t, meat_hide 90 t, tin 8 t',
  chk.ok, chk.problems.join('; ') || 'ok');

const missingCrops = KM_REC.crops.filter(c => !CROPS.BY_ID[c.id]).map(c => c.id);
T.ok('every crop Komodo grows exists in kits/crops',
  missingCrops.length === 0 && KM_REC.crops.length === 3,
  missingCrops.length ? 'missing: ' + missingCrops.join(', ') : KM_REC.crops.map(c => c.id).join(', '));

const badCaste = Object.assign({}, KM_REC, {
  castes: KM_REC.castes.map(c => c.caste === 1 ? Object.assign({}, c, { people: 820 }) : c)
});
T.neg('LZ_TUNE.checkTown refuses KM_REC when Tenders drift from 750 to 820',
  r => LZ_TUNE.checkTown(r).ok, badCaste, KM_REC);

const badTin = Object.assign({}, KM_REC, {
  works: KM_REC.works.map(w => w.good === 'tin' ? Object.assign({}, w, { yearT: 12 }) : w)
});
T.neg('LZ_TUNE.checkTown refuses KM_REC when tin output drifts from 8 t to 12 t',
  r => LZ_TUNE.checkTown(r).ok, badTin, KM_REC);

T.done();
