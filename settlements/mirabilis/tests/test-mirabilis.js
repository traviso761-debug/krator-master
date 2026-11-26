#!/usr/bin/env node
'use strict';
/* Comprehensive Node verification for Mirabilis (settlements/mirabilis, px 350, 726) [G data] stages P1 & P2:
   verifies Scale Model 5.1 geomorphology, Yut-Ma river monotonicity, KRATOR_KITS + KCITY.multikit 6-ward layout,
   47/47 Hayrant piece coverage, 41/41 Voth-census trades, <= 0.50 m mixed-avenue cornice law, zero OBB overlaps,
   KHAMLET H1/H2 villages, KCAMP.halt C1 caravan laager, RES_ORE bindings, single-component KWALK graph, and SIM conservation. */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..', '..');
function rd(rel) {
  return fs.readFileSync(path.join(ROOT, ...rel.split('/')), 'utf8');
}

/* Collect real DEFS footprints from kits/hayrant/src + kits/eternian/src */
function extractDefs() {
  const defs = {};
  const scanDirs = [
    ['kits/hayrant/src', ['50-hy-dwell.js', '54-hy-state.js', '58-hy-faith-def.js', '62-hy-works.js', '66-hy-trades-land.js', '70-hy-street.js']],
    ['kits/eternian/src', ['50-et-dwell.js', '51-et-dwell-mid.js', '52-et-dwell-rich.js', '53-et-court.js', '60-et-state.js', '61-et-defence.js', '64-et-trade-kit.js', '65-et-works.js', '66-et-trades.js']]
  ];
  const rx = /defBuilding\(\{([\s\S]*?)\bbuild\s*\(/g;
  for (const [dir, files] of scanDirs) {
    for (const f of files) {
      const txt = rd(dir + '/' + f);
      let m;
      while ((m = rx.exec(txt)) !== null) {
        const head = m[1];
        const km = head.match(/\bkey\s*:\s*['"]([^'"]+)['"]/);
        const wm = head.match(/\bw\s*:\s*([\d.]+)/);
        const dm = head.match(/\bd\s*:\s*([\d.]+)/);
        const hm = head.match(/\bh\s*:\s*([\d.]+)/);
        const nm = head.match(/\bname\s*:\s*['"]([^'"]+)['"]/);
        const tm = head.match(/\btypes\s*:\s*\[([^\]]*)\]/);
        if (km) {
          const types = tm ? (tm[1].match(/['"]([^'"]+)['"]/g) || []).map(s => s.slice(1, -1)) : ['residential'];
          defs[km[1]] = {
            key: km[1],
            name: nm ? nm[1] : km[1],
            w: wm ? +wm[1] : 10,
            d: dm ? +dm[1] : 10,
            h: hm ? +hm[1] : 7,
            tags: { types }
          };
        }
      }
    }
  }
  return defs;
}

const DEFS = extractDefs();
const ctx = {
  console, Math, Object, Array, Number, String, Boolean, JSON, Map, Set, RegExp, Error,
  Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,
  DEFS
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

const CORE_FILES = [
  'core/rand/08-core-rand.js',
  'core/mask/25-core-mask.js',
  'core/space/20-core-space.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'core/city/10-city-core.js',
  'core/city/12-city-index.js',
  'core/city/15-city-ground.js',
  'core/city/20-city-plan.js',
  'core/city/25-city-site.js',
  'core/city/31-city-steps-b.js',
  'core/city/32-city-steps-c.js',
  'core/city/33-city-strategies.js',
  'core/city/36-city-covered.js',
  'core/city/37-city-grid.js',
  'core/city/40-city-kcity.js',
  'core/kits/10-core-kits.js',
  'core/city/42-city-multikit.js',
  'core/hamlet/10-hamlet-wood.js',
  'core/hamlet/12-hamlet-gather.js',
  'core/hamlet/14-hamlet-farmland.js',
  'core/hamlet/16-hamlet-names.js',
  'core/hamlet/18-hamlet-names.js',
  'core/hamlet/20-hamlet-cultures.js',
  'core/hamlet/30-hamlet-village.js',
  'core/camp/10-camp-cultures.js',
  'core/camp/20-camp-census.js',
  'core/camp/30-camp-pitch.js',
  'core/camp/50-camp-tents.js',
  'kits/crops/src/10-crop-core.js',
  'kits/crops/src/20-crop-records.js',
  'kits/crops/src/22-crop-material.js',
  'kits/crops/src/24-crop-vale-wild.js',
  'kits/crops/src/40-crop-query.js',
  'kits/resources/src/42r-res-ore.js',
  'kits/hayrant/src/34-hy-trades.js',
  'biomes/wouterwall/src/46-biome-wow-layout.js'
];

for (const f of CORE_FILES) {
  vm.runInContext(rd(f).replace(/^(const|let)\s+/gm, 'var '), ctx, { filename: f });
}
vm.runInContext(
  'KCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly, cg: function () { return CG; } };',
  ctx
);

const MB_FILES = [
  'settlements/mirabilis/src/39e-mb-model.js',
  'settlements/mirabilis/src/40-mb-ground.js',
  'settlements/mirabilis/src/41-mb-hydraulics.js',
  'settlements/mirabilis/src/42-mb-city.js'
];
for (const f of MB_FILES) {
  vm.runInContext(rd(f), ctx, { filename: f });
}

let passed = 0;
function check(name, cond, detail) {
  if (!cond) {
    throw new Error('FAIL [' + name + ']: ' + (detail || 'assertion failed'));
  }
  passed++;
  console.log('  PASS  ' + name + (detail ? '  (' + detail + ')' : ''));
}

/* 1. Geomorphology & Stratigraphy checks (P1) */
const G = ctx.MB_GROUND;
const H = ctx.MB_HYD;
const yYuan = G.h(0, 260);
const yRiver = G.riverWaterY(0);
const gorgeDepth = yYuan - yRiver;
check('South Yuan plateau at +3125 m ASL', yYuan > 3124 && yYuan < 3130, 'y=' + yYuan.toFixed(2) + 'm');
check('Yut-Ma canyon ~202 m below South Yuan', gorgeDepth > 195 && gorgeDepth < 212, 'depth=' + gorgeDepth.toFixed(1) + 'm');
check('Moon-Bridge deck 164.5 m above Yut-Ma cascade', (G.MOON_BRIDGE.deckY - yRiver) > 160, 'clear=' + (G.MOON_BRIDGE.deckY - yRiver).toFixed(1) + 'm');

const fBench = G.fieldsAt(-260, -2);
check('North-facing W4 yaodong canyon wall is sunny (40 deg S)', fBench.sunny > 0.15, 'sunny=' + fBench.sunny.toFixed(2));
const fSiru = G.fieldsAt(338, -72);
check('Siru-Spring amphitheatre sits on spring band', fSiru.spring > 0.5, 'spring=' + fSiru.spring.toFixed(2));
const dropEast = G.h(720, 260) - G.h(900, 260);
check('Eastern Fulcrum escarpment drops >210 m', dropEast > 210, 'drop=' + dropEast.toFixed(1) + 'm');

/* 2. Hydraulics, Kinematics & SIM Ledger checks */
check('Yut-Ma upper reach strictly monotonic downstream', H.flowMonotonic(H.YUT_UPPER_PTS), H.YUT_UPPER_PTS.length + ' pts');
check('Yut-Ma lower reach strictly monotonic downstream', H.flowMonotonic(H.YUT_LOWER_PTS), H.YUT_LOWER_PTS.length + ' pts');
check('W5 mill-leat strictly monotonic downstream', H.flowMonotonic(H.MILL_LEAT_PTS), H.MILL_LEAT_PTS.length + ' pts');

const hs0 = H.hoistState(8), hsMid = H.hoistState(48), hsBot = H.hoistState(88);
check('Escarpment hoist counterbalanced cars oppose smoothly',
  Math.abs((hsMid.uA + hsMid.uB) - 1.0) < 1e-6 && hs0.carA.y > hsBot.carA.y + 215,
  'topY=' + hs0.carA.y + ' -> botY=' + hsBot.carA.y);

const ledger = H.auditLedger();
check('Circuit E6 SIM material ledger 100% conserved', ledger.ok, ledger.books + ' goods, err=' + ledger.maxImbalance);

/* 3. Multi-Kit City Layout, Census, Cornice & Walk Graph checks (P2) */
const plan = ctx.MB_CITY.make({ seed: 350726 });
const C = plan.census;
console.log('  INFO  census:', JSON.stringify({
  totalLots: C.totalLots, byWard: C.byWard, byKit: C.byKit,
  hayrantShare: C.hayrantShare, w1HayrantShare: C.w1HayrantShare,
  hyUnique: C.hyUniquePlaced + '/' + C.hyRequiredTotal,
  trades: C.staffedTrades + '/' + C.activeTradesTotal
}));

check('City places substantial multi-ward urban fabric (>= 260 lots)', C.totalLots >= 260, 'lots=' + C.totalLots);
check('All 47/47 standalone Hayrant pieces placed', C.missingHyKeys.length === 0,
  C.missingHyKeys.length ? 'missing: ' + C.missingHyKeys.join(', ') : '47/47 hy_* keys');
check('All 41/41 active Voth-census trades staffed', C.unstaffedTrades.length === 0,
  C.unstaffedTrades.length ? 'unstaffed: ' + C.unstaffedTrades.join(', ') : C.staffedTrades + '/' + C.activeTradesTotal);
check('Mixed suzerain-vassal avenue pairs obey <= 0.50 m cornice delta',
  plan.avenuePairs.length === 10 && plan.maxCorniceDelta <= 0.50,
  plan.avenuePairs.length + ' pairs, maxDelta=' + plan.maxCorniceDelta + 'm');
check('Hayrant majority overall (~70-88%) with Eternian suzerain peers',
  C.hayrantShare >= 0.68 && C.hayrantShare <= 0.88 && C.byKit.eternian >= 35,
  'hy=' + C.byKit.hayrant + ', et=' + C.byKit.eternian + ' (' + (C.hayrantShare * 100).toFixed(1) + '% hy)');
check('W4 hillside cliff-benches 100% Hayrant',
  C.byWard.W4 >= 20 && plan.lots.filter(l => l.ward === 'W4' && l.kit !== 'hayrant').length === 0,
  'W4 lots=' + C.byWard.W4);

let obbHits = 0, gorgeHits = 0;
for (let i = 0; i < plan.lots.length; i++) {
  const a = plan.lots[i];
  if (G.inCanyonVoid(a.x, a.z, 0.5)) gorgeHits++;
  for (let j = i + 1; j < plan.lots.length; j++) {
    if (plan.obbOverlap(a.obb, plan.lots[j].obb)) obbHits++;
  }
}
check('Zero OBB building-to-building overlaps', obbHits === 0, 'overlaps=' + obbHits);
check('Zero lots intruding into Yut-Ma river or mill-leat', gorgeHits === 0, 'gorgeHits=' + gorgeHits);
check('5 active KCONS rising construction lots in W6', C.constructingLots === 5, 'constructing=' + C.constructingLots);
check('H1 & H2 KHAMLET villages populated', C.byWard.H1 >= 6 && C.byWard.H2 >= 5, 'H1=' + C.byWard.H1 + ', H2=' + C.byWard.H2);
check('RES_ORE mines & saltpeter works bound via resSource', plan.oreBindings.length >= 3, 'bound=' + plan.oreBindings.length);
check('C1 Ukor-Tera caravan laager pitched via KCAMP.halt', C.campRecords >= 6, 'tents/wagons=' + C.campRecords);
check('Single-component KWALK graph across Moon-Bridge, all 6 wards & hamlets',
  plan.walk.connected, plan.walk.reachable + '/' + plan.walk.total + ' nodes');

/* Determinism proof: second run from same seed produces byte-identical lot list */
const plan2 = ctx.MB_CITY.make({ seed: 350726 });
check('Deterministic city layout (identical lot count & coordinates)',
  plan2.lots.length === plan.lots.length &&
  plan2.lots.every((l, idx) => l.key === plan.lots[idx].key && l.x === plan.lots[idx].x && l.z === plan.lots[idx].z),
  plan2.lots.length + ' identical lots');

console.log('\nOK: ' + passed + '/' + passed + ' Mirabilis [G data] checks passed.');
