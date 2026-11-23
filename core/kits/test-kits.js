#!/usr/bin/env node
'use strict';
/* Automated test suite for core/kits/10-core-kits.js + kits/kits-manifest.json + multi-kit KCITY layout (Rulings #99-101). */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const KK = require(path.join(__dirname, '10-core-kits.js'));
const manifestPath = path.join(ROOT, 'kits', 'kits-manifest.json');
assert(fs.existsSync(manifestPath), 'kits/kits-manifest.json must exist');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
KK.loadManifest(manifest);

let passed = 0;
function check(name, cond) {
  assert(cond, 'FAIL: ' + name);
  passed++;
}

/* 1. Manifest completeness across all 5 kit-engine lineages */
const kitIds = KK.listKits();
check('at least 25 cultural building kits indexed', kitIds.length >= 25);
const lineages = new Set(kitIds.map(id => KK.manifest().kits[id].lineage));
for (const lin of ['core_engine', 'vernacular', 'xanadu', 'yuni', 'catalog']) {
  check('lineage present: ' + lin, lineages.has(lin));
}

let totalPieces = 0;
for (const id of kitIds) {
  const K = KK.manifest().kits[id];
  const keys = Object.keys(K.pieces);
  check(id + ' has pieces', keys.length > 0);
  totalPieces += keys.length;
  for (const k of keys) {
    const d = KK.dims(id + ':' + k, 0);
    assert(d && d.w > 0 && d.d > 0 && d.h > 0, id + ':' + k + ' must have positive w, d, h');
    assert.strictEqual(d.kit, id);
    assert.strictEqual(d.rawKey, k);
    assert.strictEqual(d.qkey, id + ':' + k);
  }
}
check('over 1,200 building pieces indexed across kits', totalPieces >= 1200);

/* 2. Qualified vs unqualified key resolution & KCITY kitAdapter */
const islFirst = KK.manifest().kits['islanders'].order[0];
const adap = KK.kitAdapter('islanders');
const dUnqual = adap.dims(islFirst, 1);
const dQual = adap.dims('xanadu:xa_poor_a', 0);
check('defaultKit resolves unqualified key', dUnqual && dUnqual.kit === 'islanders' && dUnqual.v === 1);
check('qualified key overrides defaultKit', dQual && dQual.kit === 'xanadu' && dQual.rawKey === 'xa_poor_a');

/* 3. Ruling #99 — Migrating Knowledgeable Tradesmen (living vernacular tradition & apprentice continuity) */
const st = KK.createStyleState('islanders');
check('founding kit permanently active at tier 3', KK.kitStatus(st, 'islanders').effectiveTier === 3);
check('foreign kit initially inactive', !KK.kitStatus(st, 'xanadu').active);

/* 1 migrating Xanadu mason arrives -> unlocks tier 1-2 (housing/trades), not tier 3 civic/palace */
KK.updateTradesmen(st, 'xanadu', { masters: 1, apprentices: 0, wardId: 'artisan_ward', wardCount: 1 });
let xSt = KK.kitStatus(st, 'xanadu');
check('1 master unlocks living tier 2', xSt.active && xSt.effectiveTier === 2 && !xSt.standingOnly);
check('tier 1 Xanadu dwelling unlocked by 1 master', KK.pieceUnlocked(st, 'xanadu', 'xa_poor_a', KK.manifest().kits['xanadu'].pieces['xa_poor_a']));

/* Master trains a local apprentice, then master dies -> apprentice keeps tradition alive! */
KK.updateTradesmen(st, 'xanadu', { masters: 0, apprentices: 1 });
xSt = KK.kitStatus(st, 'xanadu');
check('trained local apprentice keeps tradition active', xSt.active && xSt.effectiveTier === 2);

/* Last practitioner leaves without training replacement -> standing buildings stay, new construction stops */
KK.updateTradesmen(st, 'xanadu', { masters: 0, apprentices: 0, wardId: 'artisan_ward', wardCount: 0 });
xSt = KK.kitStatus(st, 'xanadu');
check('0 practitioners flips non-blueprint kit to standingOnly', !xSt.active && xSt.standingOnly === true);

/* 4. Ruling #100 — Purchased Blueprints / Ancient Schematics (permanent codification) */
const repKeys = KK.manifest().kits['highlands-republican'].order;
const sampleRepCivic = repKeys.find(k => KK.manifest().kits['highlands-republican'].pieces[k].tier === 3) || repKeys[0];
KK.unlockBlueprint(st, { kitId: 'highlands-republican', keys: [sampleRepCivic], id: 'folio:rep:' + sampleRepCivic });
const repSt = KK.kitStatus(st, 'highlands-republican');
check('single piece blueprint activates kit with 0 tradesmen', repSt.active && repSt.practitioners === 0);
check('named blueprint piece permanently unlocked', KK.pieceUnlocked(st, 'highlands-republican', sampleRepCivic, KK.manifest().kits['highlands-republican'].pieces[sampleRepCivic]));

KK.unlockBlueprint(st, { kitId: 'dilihan', tier: 2, id: 'schematic:dilihan:monsoon-brick' });
check('tier-2 folio unlocks Dilihan permanently with 0 tradesmen', KK.kitStatus(st, 'dilihan').effectiveTier === 2);

/* 5. Ruling #101 — Ward Style Policy, Per-Lot Commission Pinning & Giant Door Clearance */
KK.updateTradesmen(st, 'hykkousoi', { masters: 2, apprentices: 1, wardId: 'harbour', wardCount: 3 });
KK.setWardPolicy(st, 'harbour', { allowedKits: ['islanders', 'hykkousoi'] });
const harbCands = KK.candidates(st, { wardId: 'harbour', cls: 'poor' });
check('harbour ward policy restricts to islanders + hykkousoi',
  harbCands.length > 0 && harbCands.every(c => c.kit === 'islanders' || c.kit === 'hykkousoi'));

KK.pinLot(st, 'lot_civic_1', 'highlands-republican:' + sampleRepCivic);
const pinnedCands = KK.candidates(st, { lotId: 'lot_civic_1', wardId: 'harbour' });
check('per-lot blueprint pin overrides ward filter when piece is unlocked',
  pinnedCands.length === 1 && pinnedCands[0].qkey === 'highlands-republican:' + sampleRepCivic);

/* Giant clearance filter (doorH >= 3.0 m keeps yeti/beast-riders, filters standard 2.2-2.5 m kits) */
KK.updateTradesmen(st, 'yeti', { masters: 2, apprentices: 0 });
KK.setWardPolicy(st, 'giant_quarter', { minDoorH: 3.0 });
const giantCands = KK.candidates(st, { wardId: 'giant_quarter' });
check('Giant ward minDoorH >= 3.0 m filters out low-door kits and keeps Yeti (3.2 m)',
  giantCands.length > 0 && giantCands.every(c => c.doorH >= 3.0 && c.kit === 'yeti'));

/* 6. End-to-End Integration with core/city (KCITY) — 5 kits on one town plan, zero edits to core/city */
const cityFiles = [
  'core/rand/08-core-rand.js',
  'core/space/20-core-space.js',
  'core/tags/50-core-tags.js',
  'core/city/10-city-core.js',
  'core/city/12-city-index.js',
  'core/city/15-city-ground.js',
  'core/city/20-city-plan.js',
  'core/city/25-city-site.js',
  'core/city/31-city-steps-b.js',
  'core/city/32-city-steps-c.js',
  'core/city/33-city-strategies.js',
  'core/city/40-city-kcity.js'
];
const ctx = { Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Map, Set, Float32Array, Float64Array, Int32Array, Uint32Array, Uint8Array, console };
ctx.globalThis = ctx; ctx.window = ctx;
vm.createContext(ctx);
for (const f of cityFiles) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });

const multiTune = {
  cell: 2.5, rasterHalf: 260, maxSlope: 0.35, exact: true,
  width: { avenue: 12, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4.5 },
  lot: { side: 1.6, setback: 1.4, rear: 3, inset: 1.0, step: 3 },
  fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'poor', tavern: 'shop', industrial: 'poor', poor: null },
  plazaArt: { rich: ['fountain'], middle: ['fountain'], poor: ['fountain'], commerce: ['fountain'] },
  classes: {
    poor: [['islanders:' + KK.manifest().kits['islanders'].order[10], 0], ['iziz-vernacular:vern_house_poor_a', 0], ['dilihan:dil_house_poor_dogtrot', 0]],
    middle: [['xanadu:xa_poor_a', 0], ['highlands-republican:hl_rep_house_poor_a', 0], ['yuni:mid_bluewash_townhouse', 0]],
    rich: [['xanadu:xa_poor_a', 0], ['talia:tal_cube_house', 0]],
    manor: [['locus:civic_geomancer_chapterhouse', 0]],
    shop: [['iziz-vernacular:vern_house_poor_a', 0], ['dilihan:dil_house_poor_dogtrot', 0]],
    tavern: [['yuni:mid_bluewash_townhouse', 0]],
    industrial: [['locus:ind_pumpjack', 0]]
  }
};

const C = ctx.KCITY.create({
  name: 'multikit-proof',
  seed: 42,
  rand: 'krand',
  tune: multiTune,
  ground: { h: () => 4 },
  kit: KK.kitAdapter('islanders'),
  steps: [
    { name: 'ways', run: () => {
      ctx.KCITY.bind(C);
      ctx.SL.R = new ctx.Raster(-260, -260, 260, 260, 2);
      const w1 = ctx.SL.addWay('avenue', [[-180, 0], [180, 0]], 1);
      const w2 = ctx.SL.addWay('main', [[0, -180], [0, 180]], 2);
      ctx.SL.lineLots(w1, 1, ctx.SL.choosers.avenue, 3);
      ctx.SL.lineLots(w1, -1, ctx.SL.choosers.avenue, 3);
      ctx.SL.lineLots(w2, 1, ctx.SL.choosers.main, 4);
      ctx.SL.lineLots(w2, -1, ctx.SL.choosers.main, 4);
    } }
  ]
});
const plan = C.run();
const standing = plan.lots.filter(L => L.died == null);
const usedKits = KK.kitsUsedByLots(standing, 'islanders');
check('KCITY placed multi-kit standing lots cleanly', standing.length >= 12);
check('at least 4 distinct cultural kits coexist in one KCITY plan', usedKits.length >= 4);

console.log('PASS core/kits/test-kits.js (' + passed + ' checks, ' + kitIds.length + ' kits, ' + totalPieces + ' pieces, active KCITY kits: ' + usedKits.join(', ') + ')');
