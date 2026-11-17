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
const IG_REC = require(path.join(__dirname, 'src/80-ig-records.js'));

const chk = LZ_TUNE.checkTown(IG_REC);
T.ok('IG_REC holds to LZ_TUNE: 3,000 by caste (Drovers 40 %), grain 2,600 t, produce 250 t, meat_hide 210 t, relics 1.5 t',
  chk.ok, chk.problems.join('; ') || 'ok');

const missingCrops = IG_REC.crops.filter(c => !CROPS.BY_ID[c.id]).map(c => c.id);
T.ok('every crop Iguana grows exists in kits/crops (rice, helix-bean, sweet-potato, ashroot)',
  missingCrops.length === 0 && IG_REC.crops.length === 4,
  missingCrops.length ? 'missing: ' + missingCrops.join(', ') : IG_REC.crops.map(c => c.id).join(', '));

const badCaste = Object.assign({}, IG_REC, {
  castes: IG_REC.castes.map(c => c.caste === 3 ? Object.assign({}, c, { people: 1000 }) : c)
});
T.neg('LZ_TUNE.checkTown refuses IG_REC when Drovers drift from 1,200 to 1,000',
  r => LZ_TUNE.checkTown(r).ok, badCaste, IG_REC);

const badRelics = Object.assign({}, IG_REC, {
  works: IG_REC.works.map(w => w.good === 'relics' ? Object.assign({}, w, { yearT: 3.0 }) : w)
});
T.neg('LZ_TUNE.checkTown refuses IG_REC when gleaned relics drift from 1.5 t to 3.0 t',
  r => LZ_TUNE.checkTown(r).ok, badRelics, IG_REC);

T.done();
