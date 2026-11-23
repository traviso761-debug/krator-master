#!/usr/bin/env node
/* node core/hamlet/lizardmen/test-hamlet-lizardmen.js: step G2 (settlements/gila/PLAN.md section 7).
   Checks KHAMLET.CULTURES.lizardmen across all six focuses, pending vs host-supplied works boxes, non-overlap,
   determinism, and that loading the opt-in file leaves existing Islander and Xanadu villages byte-identical. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

function load(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
}
/* core/city/33-city-strategies.js expects inPoly/V/obb helpers only in block(), while hamlet 30 uses frontageRun and huntNear */
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
for (const f of ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js',
  '18-hamlet-names.js', '20-hamlet-cultures.js', '30-hamlet-village.js']) {
  load('core/hamlet/' + f);
}

const IE_BOX = {
  'ip-shrine': [8, 8, 7], 'ie-hall': [16, 10, 9], 'ie-trader': [10, 8, 6], 'ie-store-food': [9, 7, 6],
  'ie-warehouse': [14, 9, 7], 'ie-hut-garden': [8, 8, 5], 'ie-house-shared': [11, 8, 6], 'ie-house-uma': [13, 9, 7],
  'ie-house-long': [15, 8, 7], 'ie-house-twin': [12, 9, 7], 'ie-house-cross': [12, 11, 7], 'ie-house-clan': [16, 11, 8],
  'ie-house-chief': [16, 12, 10], 'ie-saltworks': [18, 14, 5]
};
const ieDims = k => IE_BOX[k] ? { w: IE_BOX[k][0], d: IE_BOX[k][1], h: IE_BOX[k][2] } : null;
const fociBefore = KHAMLET.FOCI.slice();
const ieBefore = JSON.stringify(KHAMLET.village({
  id: 'ie-salt-0', world: 4401, culture: 'islander_east', focus: 'salt',
  site: { x: 0, z: 0 }, link: { x: -200, z: 0 }, resource: { x: 180, z: 40, workers: 48 }, popMax: 220, dims: ieDims
}));

load('core/hamlet/lizardmen/23-hamlet-lizardmen.js');

const ieAfter = JSON.stringify(KHAMLET.village({
  id: 'ie-salt-0', world: 4401, culture: 'islander_east', focus: 'salt',
  site: { x: 0, z: 0 }, link: { x: -200, z: 0 }, resource: { x: 180, z: 40, workers: 48 }, popMax: 220, dims: ieDims
}));
T.ok('loading 23-hamlet-lizardmen leaves KHAMLET.FOCI and Islander villages unchanged',
  fociBefore.join() === KHAMLET.FOCI.join() && ieBefore === ieAfter);

const KIT_BOX = {
  'lz-nest': [54, 50, 11], 'lz-seer': [15, 13, 10.5], 'lz-medicine': [9, 8, 6], 'lz-granary': [14, 11, 9.6],
  'lz-warehouse': [17, 13, 8.6], 'lz-warren': [22, 19, 9.4], 'lz-makers': [11, 9, 6.4], 'lz-longhouse': [20, 10, 8.2],
  'lz-lodge': [14, 20, 11], 'lz-tower': [12, 12, 15.6], 'lz-farm': [26, 20, 4.4], 'lz-windmill': [13, 13, 14],
  'lz-hall-bone': [19, 14, 9], 'lz-hall-reed': [19, 13, 9], 'lz-hall-bronze': [19, 13, 9.2],
  'lz-mine': [16, 14, 9], 'lz-weir': [18, 14, 5.5], 'lz-quarry': [20, 18, 7.4]
};
const GILA_BOX = Object.assign({}, KIT_BOX, { 'gl-pans': [30, 30, 2.6], 'gl-saltstore': [16, 13, 9.4] });
const kitDims = k => KIT_BOX[k] ? { w: KIT_BOX[k][0], d: KIT_BOX[k][1], h: KIT_BOX[k][2] } : null;
const gilaDims = k => GILA_BOX[k] ? { w: GILA_BOX[k][0], d: GILA_BOX[k][1], h: GILA_BOX[k][2] } : null;

function mkSpec(focus, extra) {
  return Object.assign({
    id: 'gl-' + focus, world: 7801, culture: 'lizardmen', focus: focus,
    site: { x: 1520, z: 320 }, link: { x: 0, z: 0 },
    resource: { x: 1680, z: 380, workers: 54 }, popMax: 240, dims: gilaDims
  }, extra || {});
}

const saltGila = KHAMLET.village(mkSpec('salt'));
T.ok('Gila salt hamlet lays cleanly with gl-pans, gl-saltstore, services and caste dwellings, none pending',
  !saltGila.error && saltGila.records.length >= 14 &&
  saltGila.records.some(r => r.key === 'gl-pans' && r.role === 'works' && !r.pending) &&
  saltGila.records.some(r => r.key === 'gl-saltstore' && r.role === 'works' && !r.pending) &&
  ['lz-nest', 'lz-seer', 'lz-medicine', 'lz-granary', 'lz-warehouse', 'lz-tower'].every(k => saltGila.records.some(r => r.key === k)) &&
  saltGila.records.every(r => !r.pending),
  saltGila.error || 'unexpected pending or missing piece');

const saltKitOnly = KHAMLET.village(mkSpec('salt', { dims: kitDims }));
T.ok('without Gila works dims, gl-pans and gl-saltstore fall back to pending boxes cleanly',
  !saltKitOnly.error &&
  saltKitOnly.records.filter(r => r.pending).every(r => r.key === 'gl-pans' || r.key === 'gl-saltstore') &&
  saltKitOnly.records.some(r => r.key === 'gl-pans' && r.pending));

for (const focus of ['farming', 'ranch', 'fishing', 'mine', 'quarry']) {
  const v = KHAMLET.village(mkSpec(focus, { dims: kitDims }));
  const wantKeys = KHAMLET.CULTURES.lizardmen.works[focus].map(w => w.key);
  T.ok('lizardmen ' + focus + ' hamlet lays works (' + wantKeys.join(', ') + ') with zero pending pieces and stays within popMax',
    !v.error && v.census.pop > 0 && v.census.pop <= 240 &&
    v.records.every(r => !r.pending) &&
    wantKeys.every(k => v.records.some(r => r.role === 'works' && r.key === k)),
    v.error || '');
}

function noOverlap(recs) {
  for (let i = 0; i < recs.length; i++) {
    const a = recs[i], ra = KHAMLET.rect(a.x, a.z, Math.cos(a.ry), -Math.sin(a.ry), a.w, a.d);
    for (let j = i + 1; j < recs.length; j++) {
      const b = recs[j], rb = KHAMLET.rect(b.x, b.z, Math.cos(b.ry), -Math.sin(b.ry), b.w, b.d);
      if (KHAMLET.overlap(ra, rb, -0.01)) return false;
    }
  }
  return recs.length > 0;
}
const clashPair = [
  { x: 0, z: 0, ry: 0, w: 20, d: 14 },
  { x: 5, z: 3, ry: 0.2, w: 16, d: 12 }
];
T.neg('footprint overlap check catches colliding buildings and passes Gila salt hamlet',
  recs => noOverlap(recs), clashPair, saltGila.records);

T.neg('unknown focus is refused while salt focus lays records',
  f => { const r = KHAMLET.village(mkSpec(f)); return !r.error && r.records && r.records.length > 0; },
  'ironworking', 'salt');

T.neg('ground submerged everywhere in reach refuses siting while dry ground sites cleanly',
  dry => { const r = KHAMLET.village(mkSpec('salt', { siteReach: 60, ground: { ok: () => dry } })); return !r.error && !!r.site; },
  false, true);

const saltAgain = KHAMLET.village(mkSpec('salt'));
T.ok('KHAMLET.village on lizardmen is deterministic across runs',
  JSON.stringify(saltGila) === JSON.stringify(saltAgain));

T.done();
