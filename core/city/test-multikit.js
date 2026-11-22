// node core/city/test-multikit.js — Phase 2 KCITY.multikit verification (Rulings #99-101, MULTI-KIT-SCOPE.md).
// Tests ward-level multi-kit zoning, Giant door-height enforcement, per-lot blueprint commissioning with exact OBB
// collision checks, core/tags sync, and progressive street growth across tradesman arrival, departure (standingOnly)
// and permanent blueprint unlocks.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;

[
  'core/rand/08-core-rand.js',
  'core/space/20-core-space.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'core/kits/10-core-kits.js'
].forEach(load);

const CITY_FILES = fs.readdirSync(__dirname).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort();
CITY_FILES.forEach(f => load('core/city/' + f));

const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'kits-manifest.json'), 'utf8'));
KRATOR_KITS.loadManifest(MANIFEST);

function flatGround() { return 4.0; }

function baseTune() {
  return {
    cell: 2.5, rasterHalf: 240, maxSlope: 0.4, exact: true,
    width: { avenue: 11, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4.5 },
    lot: { side: 1.5, setback: 1.2, rear: 2.8, inset: 0.9, step: 3 },
    classes: {},
    fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'poor', tavern: 'shop', industrial: 'poor', poor: null },
    civic: [], civicSpacing: 130,
    voidMax: 42, voidIters: 10, voidBatch: 8, sideSpacing: 46, sideMax: 180, alleyFrac: 0.2,
    blindMax: 85, interiorDepth: 9, interiorRounds: 2,
    avenueSnap: 80, ringGap: 8, verge: 6,
    plazaArt: { rich: ['statue'], middle: ['fountain'], poor: ['fountain'], commerce: ['fountain'] },
    mapHalf: 240
  };
}

function siteSteps(zone, avenues) {
  return [
    {
      name: 'site',
      run() {
        const R = SL.R = new Raster(TUNE.rasterHalf, TUNE.cell);
        R.occ.fill(OCC.OUT);
        PLAN.site = [{ id: 0, name: 'Build zone', role: 'zone', poly: zone }];
        PLAN.zone = zone;
        KCITY.site.zoneRaster(R, zone, { dry: 0.5, maxSlope: TUNE.maxSlope });
        SL.minSpacing = KCITY.site.minSpacing();
      }
    },
    { name: 'landmarks', run() {} },
    { name: 'districts', run() {} },
    {
      name: 'avenues',
      run() { KCITY.site.avenues(avenues, 3, { snap: TUNE.avenueSnap }); }
    },
    { name: 'highways', run() {} },
    { name: 'walls', run() {} }
  ];
}

function countOverlaps(plan, eps) {
  const S = plan.lots.filter(L => L && L.died == null && L.bo);
  const idx = KSPACE.create({ cell: 40 });
  let n = 0;
  S.forEach(L => idx.insert(L, L.x, L.z, Math.hypot(L.bo.hw, L.bo.hd)));
  S.forEach(A => idx.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(B => {
    if (B.id > A.id && SL.pen(A.bo, B.bo) > eps) n++;
  }));
  return n;
}

// ---------------------------------------------------------------- 1. Ward-zoned 5-kit cosmopolitan city
const ZONE = [[-210, -210], [210, -210], [210, 210], [-210, 210]];
const AVES = [
  { name: 'harbour-way', pts: [[-195, -120], [0, -120], [195, -120]] },
  { name: 'artisan-way', pts: [[-195, 0], [0, 0], [195, 0]] },
  { name: 'giant-way', pts: [[-195, 125], [0, 125], [195, 125]] },
  { name: 'spine', pts: [[0, -195], [0, 0], [0, 195]] }
];
const wardAt = p => p[1] < -55 ? 'harbour' : (p[1] > 65 ? 'giant' : 'artisan');

const st = KRATOR_KITS.createStyleState('islanders');
KRATOR_KITS.updateTradesmen(st, 'hykkousoi', { masters: 2, wardId: 'harbour', wardCount: 4 });
KRATOR_KITS.updateTradesmen(st, 'iziz-vernacular', { masters: 2, wardId: 'artisan', wardCount: 3 });
KRATOR_KITS.unlockBlueprint(st, { kitId: 'xanadu', tier: 3, id: 'folio:xanadu:imperial' });
KRATOR_KITS.updateTradesmen(st, 'yeti', { masters: 2, wardId: 'giant', wardCount: 3 });

KRATOR_KITS.setWardPolicy(st, 'harbour', { allowedKits: ['islanders', 'hykkousoi'], weights: { islanders: 1, hykkousoi: 1.5 } });
KRATOR_KITS.setWardPolicy(st, 'artisan', { allowedKits: ['islanders', 'iziz-vernacular', 'xanadu'], weights: { 'iziz-vernacular': 1.5, xanadu: 1.5, islanders: 0.6 } });
KRATOR_KITS.setWardPolicy(st, 'giant', { allowedKits: ['islanders', 'yeti'], minDoorH: 3.2 });

const mk = KCITY.multikit({ foundingKit: 'islanders', styleState: st, wardAt });
const C1 = KCITY.create({
  name: 'cosmopolis',
  tune: baseTune(),
  seed: 29,
  rand: 'krand',
  tags: 'test-multikit',
  ground: { h: flatGround },
  kit: mk.kit,
  rules: mk.rules,
  steps: siteSteps(ZONE, AVES).concat(KCITY.defaultSteps().slice(6)),
  finish: [mk.finish]
});
const P1 = C1.run();
const sum1 = mk.summary(C1);
const standing1 = P1.lots.filter(L => L.died == null);

T.ok('5-kit cosmopolitan city places 80+ standing buildings with zero OBB overlaps',
  standing1.length >= 80 && countOverlaps(P1, 0.1) === 0 && sum1.kitsUsed.length >= 4,
  standing1.length + ' lots across [' + sum1.kitsUsed.join(', ') + ']');

T.neg('an overlapping multi-kit footprint is caught by the OBB overlap audit',
  plan => countOverlaps(plan, 0.1) === 0,
  { lots: [standing1[0], Object.assign({}, standing1[0], { id: 99999 })] },
  P1);

const badCls = standing1.filter(L => typeof L.cls !== 'string' || L.cls.indexOf('@') >= 0 || !L.kit || L.key.indexOf(':') < 0);
T.ok('every standing lot carries qualified <kitId>:<pieceKey>, parsed L.kit, and canonical stripped L.cls',
  badCls.length === 0,
  badCls.length ? badCls[0].cls : 'all clean');

const harbourKits = Object.keys(sum1.byWard.harbour || {});
const harbourValid = harbourKits.length > 0 && harbourKits.every(k => k === 'islanders' || k === 'hykkousoi') && !!sum1.byWard.harbour.hykkousoi;
T.ok('harbour ward places only permitted islanders & hykkousoi kits',
  harbourValid,
  JSON.stringify(sum1.byWard.harbour));

const giantLots = standing1.filter(L => L.ward === 'giant');
const giantValid = giantLots.length > 0 && giantLots.every(L => L.kit === 'yeti' && L.doorH >= 3.2);
T.ok('giant ward enforces minDoorH >= 3.2 m, filtering out low-door islanders pieces and placing yeti dwellings',
  giantValid,
  giantLots.length + ' giant-ward lots, kits=' + JSON.stringify(sum1.byWard.giant));

const artisanKits = Object.keys(sum1.byWard.artisan || {});
T.ok('cosmopolitan artisan ward mixes multiple unlocked traditions',
  artisanKits.length >= 2 && (artisanKits.includes('xanadu') || artisanKits.includes('iziz-vernacular')),
  JSON.stringify(sum1.byWard.artisan));

// ---------------------------------------------------------------- 2. Per-lot blueprint commissioning (Ruling #101)
const KM = KRATOR_KITS.manifest().kits;
const smallXan = Object.values(KM.xanadu.pieces)
  .filter(p => p.w <= 10 && p.d <= 10)
  .sort((a, b) => a.w * a.d - b.w * b.d)[0];
const hugeXan = Object.values(KM.xanadu.pieces)
  .sort((a, b) => b.w * b.d - a.w * a.d)[0];
const targetArtisanLot = standing1.find(L => L.ward === 'artisan' && L.w >= smallXan.w && L.d >= smallXan.d && L.kit !== 'xanadu');

const commLocked = mk.commissionLot(C1, { lotId: targetArtisanLot.id, qkey: 'locus:' + KM.locus.order[0] });
const commOk = mk.commissionLot(C1, { lotId: targetArtisanLot.id, qkey: smallXan.qkey });

T.neg('commissioning rejects a locked cultural kit and accepts an unlocked fitting blueprint',
  res => res.ok === true,
  commLocked,
  commOk);

const tagRec = C1.tags.get(targetArtisanLot.tag);
T.ok('commissioned lot updates L.key, L.kit, spatial index and core/tags record',
  commOk.ok && targetArtisanLot.kit === 'xanadu' && targetArtisanLot.key === smallXan.qkey && tagRec && tagRec.key === targetArtisanLot.key && countOverlaps(P1, 0.1) === 0,
  targetArtisanLot.key + ' tag=' + (tagRec && tagRec.id));

const lowDoorPiece = KM.islanders.order[0];
const targetGiantLot = giantLots[0];
const commLowDoor = mk.commissionLot(C1, { lotId: targetGiantLot.id, qkey: 'islanders:' + lowDoorPiece });
T.neg('commissioning rejects a 2.2 m door blueprint inside a 3.2 m Giant ward',
  res => res.ok === true,
  commLowDoor,
  commOk);

// Find a tight pair of neighbours where swapping to the largest Xanadu piece causes a footprint or street clash
let clashRes = null;
for (const cand of standing1) {
  if (cand.ward !== 'artisan' || cand.id === targetArtisanLot.id) continue;
  const r = mk.commissionLot(C1, { lotId: cand.id, qkey: hugeXan.qkey });
  if (!r.ok && (r.why === 'footprint-clash' || r.why === 'street-clash')) { clashRes = r; break; }
}
T.neg('commissioning an oversized palace onto a cramped street lot is rejected for footprint/street clash',
  res => res && res.ok === true,
  clashRes,
  commOk);

// ---------------------------------------------------------------- 3. Progressive growth: Ruling #99 (standingOnly) & Ruling #100
const ZONE2 = [[-220, -220], [220, -220], [220, 220], [-220, 220]];
const CORE_AVES = [{ name: 'founding-main', pts: [[-120, -90], [0, -90], [120, -90]] }];
const st2 = KRATOR_KITS.createStyleState('islanders');
const mk2 = KCITY.multikit({ foundingKit: 'islanders', styleState: st2 });
const C2 = KCITY.create({
  name: 'frontier-town',
  tune: baseTune(),
  seed: 41,
  rand: 'krand',
  ground: { h: flatGround },
  kit: mk2.kit,
  rules: mk2.rules,
  steps: siteSteps(ZONE2, CORE_AVES).concat(KCITY.defaultSteps().slice(6, 9)), // civic + avenue + main lots only so north remains open for spurs
  finish: [mk2.finish]
});
const P2 = C2.run();
const initLots = P2.lots.filter(L => L.died == null);
T.ok('frontier settlement starts with 100% foundingKit (islanders) buildings',
  initLots.length > 0 && initLots.every(L => L.kit === 'islanders'),
  initLots.length + ' initial islanders lots');

// Dilihan master masons arrive -> boost weight in open default ward and lay out step 13 street
KRATOR_KITS.updateTradesmen(st2, 'dilihan', { masters: 3 });
KRATOR_KITS.setWardPolicy(st2, 'default', { weights: { dilihan: 8, islanders: 0.2 } });
const g13 = mk2.growWays(C2, {
  step: 13,
  ways: [{ cls: 'main', pts: [[-150, 30], [0, 30], [150, 30]] }]
});
const step13Dilihan = P2.lots.filter(L => L.died == null && L.born === 13 && L.kit === 'dilihan');
T.ok('migrating Dilihan tradesmen unlock Dilihan vernacular on new step-13 street growth',
  g13.lots > 0 && step13Dilihan.length > 0,
  step13Dilihan.length + ' dilihan lots built on step 13');

// Dilihan masters leave without local apprentices -> standingOnly: true; step-13 buildings stay, step-14 uses newly bought Republic folio
KRATOR_KITS.updateTradesmen(st2, 'dilihan', { masters: 0, apprentices: 0 });
const dilStatus = KRATOR_KITS.kitStatus(st2, 'dilihan');
KRATOR_KITS.unlockBlueprint(st2, { kitId: 'highlands-republican', tier: 2, id: 'folio:republic:guild' });
KRATOR_KITS.setWardPolicy(st2, 'default', { weights: { 'highlands-republican': 8, islanders: 0.2 } });

const g14 = mk2.growWays(C2, {
  step: 14,
  ways: [{ cls: 'main', pts: [[-150, 135], [0, 135], [150, 135]] }]
});
const step13StillStanding = P2.lots.filter(L => L.died == null && L.born === 13 && L.kit === 'dilihan');
const step14Dilihan = P2.lots.filter(L => L.died == null && L.born === 14 && L.kit === 'dilihan');
const step14Rep = P2.lots.filter(L => L.died == null && L.born === 14 && L.kit === 'highlands-republican');

T.ok('Ruling #99 & #100: departed un-apprenticed Dilihan masters flip to standingOnly (step-13 homes stay, 0 new on step-14), while Republic folio builds step-14',
  dilStatus.standingOnly === true &&
  step13StillStanding.length === step13Dilihan.length &&
  step14Dilihan.length === 0 &&
  step14Rep.length > 0 &&
  countOverlaps(P2, 0.1) === 0,
  'step13 dilihan standing=' + step13StillStanding.length + ', step14 dilihan=' + step14Dilihan.length + ', step14 republic=' + step14Rep.length);

T.done();
