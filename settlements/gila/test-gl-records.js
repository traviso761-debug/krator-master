#!/usr/bin/env node
/* node settlements/gila/test-gl-records.js: step G4 (PLAN.md sections 5 and 7).
   Proves GL_REC balances made + allottedIn === need + allottedOut for every good, caste shares sum to 3,000,
   Coil Rounds obey outward/inward seasons and intermediate stops, and every named crop exists in kits/crops. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

for (const f of ['core/rand/08-core-rand.js', 'kits/crops/src/10-crop-core.js', 'kits/crops/src/20-crop-records.js',
  'kits/crops/src/22-crop-material.js', 'kits/crops/src/40-crop-query.js', 'settlements/gila/src/88-gl-records.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
}

const rep = GL_REC.balance();
T.ok('GL_REC books balance across all ten goods and 3,000 residents by caste',
  rep.balanced && rep.people === 3000 && rep.byGood.salt.made === 300 && rep.byGood.salt.allottedOut === 275 &&
  rep.byGood.bronze.allottedIn === 6 && rep.byGood.grain.allottedIn === 100 && rep.byGood.bone.allottedOut === 12,
  rep.problems.join('; '));

T.ok('every crop Gila grows or skims exists in kits/crops (frillpod, ballmelon, bell-date and lakecake native to rift)',
  GL_REC.crops.every(c => !!CROPS.BY_ID[c.id]) &&
  ['frillpod', 'ballmelon', 'bell-date', 'lakecake'].every(id => CROPS.BY_ID[id].home.includes('rift')));

const brokenBooks = {
  castes: GL_REC.castes,
  goods: Object.assign({}, GL_REC.goods, { salt: { made: { wet1: 35, wet2: 45, dry1: 115, dry2: 105 }, need: { wet1: 6, wet2: 6, dry1: 7, dry2: 6 } } }),
  allotments: GL_REC.allotments.filter(a => a.id !== 'allot.gila.salt.out.wet1')
};
T.neg('balance() catches a missing 30 t salt allotment and passes GL_REC',
  r => GL_REC.balance(r).balanced, brokenBooks, GL_REC);

const straightJump = {
  castes: GL_REC.castes,
  goods: GL_REC.goods,
  allotments: GL_REC.allotments.map(a => a.id === 'allot.gila.bronze.out.wet1' ? Object.assign({}, a, { via: ['basilisk', 'gila'] }) : a)
};
T.neg('balance() catches a straight Basilisk->Gila jump skipping Iguana on the Coil',
  r => GL_REC.balance(r).balanced, straightJump, GL_REC);

T.done();
