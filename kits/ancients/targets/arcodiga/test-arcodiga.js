/* node kits/ancients/targets/arcodiga/test-arcodiga.js — [G data] unit & negative tests for Soleri's Arcodiga
   Tests: determinism, Soleri 1:10,000 proportions & ~280 000 peak / ~15 000-28 000 refurbished population,
   unique record ids, intact reachability, refurbished bulkhead isolation of the 12 dormant ribs, ruin cascade & debris,
   and full kits/ancients-interiors + kits/interiors furnishing & room audits across both Ancient and settlement cultures. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const T = require('../../../../tools/ktest.js')(__filename);

global.window = global;
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });

load('core/rand/08-core-rand.js');
load('kits/ancients/targets/arcodiga/8av0-arcodiga-plan.js');
load('kits/interiors/dist/interiors-core.js');
load('kits/ancients-interiors/src/10-ai-core.js');
load('kits/ancients-interiors/src/20-ai-dress.js');
load('kits/ancients-interiors/src/30-ai-recipes.js');
load('kits/ancients-interiors/src/35-ai-plates.js');
load('kits/ancients-interiors/src/37-ai-kit.js');
load('kits/ancients-interiors/src/38-ai-reception.js');
load('kits/ancients-interiors/src/40-ai-audit.js');
load('kits/ancients/targets/arcodiga/8av1-arcodiga-interiors.js');

const IX = global.KratorInteriors, AI = global.KratorAncientsInteriors;
AI.IX = IX;
AI.install(IX);

/* ---- 1. Plan, Proportions, Population, Circulation & State Deltas ---- */
const P = ARCODIGA.plan({ seed: 12700 }), S = P.stats;
console.log('Arcodiga plan:', JSON.stringify({
  height: S.height, vtolTop: S.vtolTop, archSpan: S.archSpan, wingSpan: S.wingSpan,
  floorHa: (S.floor / 1e4).toFixed(1), refurbFloorHa: (S.refurbFloor / 1e4).toFixed(1),
  peakPop: S.peakPop, refurbPop: S.refurbPop, activeRibs: S.activeRibs, dormantRibs: S.dormantRibs
}));

T.ok('plan is deterministic across runs', JSON.stringify(P) === JSON.stringify(ARCODIGA.plan({ seed: 12700 })));
T.ok('Soleri 1:10,000 proportions (~360 m crest, ~432 m VTOL, ~1460 m arch, ~2040 m stiffening wing)',
  S.height === 360 && S.vtolTop > 420 && S.archSpan > 1400 && S.wingSpan > 2000);
T.ok('peak intact population matches Soleri ~280 000 (' + S.peakPop + ')', S.peakPop >= 250000 && S.peakPop <= 310000);
T.neg('negative: out-of-range peak population fails', x => x >= 250000 && x <= 310000, 95000, S.peakPop);

T.ok('refurbished centerpiece population in 10k-30k target band (' + S.refurbPop + ')', S.refurbPop >= 12000 && S.refurbPop <= 28000);
T.neg('negative: out-of-range refurbished population fails', x => x >= 12000 && x <= 28000, 4200, S.refurbPop);

const checkUniqueIds = plan => {
  const all = []
    .concat(plan.organs.map(r => r.id), plan.prows.map(r => r.id), plan.ribs.map(r => r.id),
      plan.oculi.map(r => r.id), plan.siltBeds.map(r => r.id), plan.cores.map(r => r.id), plan.links.map(r => r.id));
  return new Set(all).size === all.length;
};
T.ok('every plan record carries a unique stable id', checkUniqueIds(P));
{
  const broken = ARCODIGA.plan({ seed: 12700 });
  broken.ribs[3].id = broken.ribs[0].id;
  T.neg('negative: duplicate record id is caught', checkUniqueIds, broken, ARCODIGA.plan({ seed: 12700 }));
}

/* Circulation reachability: intact reaches every organ, prow and rib from ground */
const allNodes = plan => []
  .concat(plan.organs.map(r => r.id), plan.prows.map(r => r.id), plan.ribs.map(r => r.id));
const checkIntactReach = plan => {
  const reached = ARCODIGA.reach(plan, []);
  return allNodes(plan).every(id => reached.has(id));
};
T.ok('intact circulation reaches every organ, prow and rib from ground', checkIntactReach(P));
{
  const broken = ARCODIGA.plan({ seed: 12700 });
  broken.links = broken.links.filter(L => L.a !== 'arcodiga.vtol' && L.b !== 'arcodiga.vtol');
  T.neg('negative: unlinked organ fails reachability', checkIntactReach, broken, ARCODIGA.plan({ seed: 12700 }));
}

/* Refurbished state: closing the bulkhead links isolates the 12 dormant outer ribs while keeping every refurbished organ reachable */
const ref = ARCODIGA.refurb(P);
const checkRefurbBulkheads = plan => {
  const r = ARCODIGA.refurb(plan);
  const reached = ARCODIGA.reach(plan, r.bulkheads);
  const activeOk = plan.organs.filter(o => o.refurbished).every(o => reached.has(o.id))
    && plan.prows.every(p => reached.has(p.id))
    && plan.ribs.filter(rb => rb.refurbished).every(rb => reached.has(rb.id));
  const dormantSealed = plan.ribs.filter(rb => rb.dormant).every(rb => !reached.has(rb.id));
  return activeOk && dormantSealed && r.sealedRibs.length === 12 && r.activeRibs.length === 4;
};
T.ok('refurbished bulkheads seal all 12 dormant outer ribs while keeping all active organs connected', checkRefurbBulkheads(P));
{
  const broken = ARCODIGA.plan({ seed: 12700 });
  broken.links.push({ id: 'leak', a: 'ground', b: broken.ribs.find(r => r.dormant).id, kind: 'arcade' });
  T.neg('negative: unsealed dormant rib fails bulkhead isolation', checkRefurbBulkheads, broken, ARCODIGA.plan({ seed: 12700 }));
}

/* Ruin state: notch, severed west wing, debris records */
const ru = ARCODIGA.ruin(P);
T.ok('ruin lowers reservoir to notch sill + 1 m and generates deterministic debris',
  ru.wl === P.dim.NOTCH.sill + 1 && ru.debris.length >= 50 && JSON.stringify(ru) === JSON.stringify(ARCODIGA.ruin(P)));

/* ---- 2. Interiors Across All 5 Soleri Organs ---- */
const units = ADG_INTERIORS.units();
const B = ADG_INTERIORS.buildings(AI);
const segD = (p, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, l = l2 > 0 ? l2 : 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz);
};
const edgeD = (p, poly) => {
  let d = 1e9;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) d = Math.min(d, segD(p, poly[j], poly[i]));
  return d;
};
const inPoly = (p, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};

const areas = new Set(B.map(b => b.area));
T.ok('interiors cover all 6 organ groups (wing, spine, crest, ribs, dormant, works)',
  ['wing', 'spine', 'crest', 'ribs', 'dormant', 'works'].every(a => areas.has(a)));

const byId = {};
for (const u of units) byId[u.id] = u;

const checkInsideUnit = list => {
  let bad = 0;
  for (const b of list) {
    const O = ADG_INTERIORS.outline(byId[b.id]);
    for (const st of b.storeys) {
      for (const R of st.rooms) {
        if (!R.poly) continue;
        if (R.poly.some(p => !inPoly(p, O) && edgeD(p, O) > 0.35)) bad++;
      }
    }
  }
  return bad === 0;
};
T.ok('every room polygon stands strictly inside its architectural unit outline', checkInsideUnit(B));
{
  const broken = ADG_INTERIORS.buildings(AI);
  broken[0].storeys[0].rooms[0].poly = broken[0].storeys[0].rooms[0].poly.map(p => [p[0] + 250, p[1]]);
  T.neg('negative: room protruding outside its unit outline is caught', checkInsideUnit, broken, ADG_INTERIORS.buildings(AI));
}

const checkDoors = list => {
  let bad = 0;
  for (const b of list) {
    for (const st of b.storeys) {
      for (const R of st.rooms) {
        if (R.kind !== 'corridor' && R.kind !== 'core' && !(R.doors && R.doors.length)) bad++;
      }
    }
  }
  return bad === 0;
};
T.ok('every non-corridor room has a doorway', checkDoors(B));
{
  const broken = ADG_INTERIORS.buildings(AI);
  broken[1].storeys[0].rooms.find(r => r.kind !== 'corridor' && r.kind !== 'core').doors = [];
  T.neg('negative: sealed room without doorway is caught', checkDoors, broken, ADG_INTERIORS.buildings(AI));
}

/* AI.storeyAudit across every storey of every organ */
{
  let fails = 0, first = '';
  for (const b of B) {
    for (const st of b.storeys) {
      const f = AI.storeyAudit(st, (x, z) => b.inside(x, z, st.y));
      if (f.length) { fails++; if (!first) first = b.id + ' ' + st.id + ': ' + f[0]; }
    }
  }
  T.ok('every storey passes AI.storeyAudit (' + fails + ' failures' + (first ? ': ' + first : '') + ')', fails === 0, first);
}

/* Verify that every sub-site has partition walls so ruinStorey breaks walls in d=1..4 */
{
  AI.KIT.arcodiga = ADG_INTERIORS.entry(AI);
  const ruinPlan = AI.kitPlan('arcodiga', 1, { place: '2600,0' });
  const subAreas = ['wing', 'spine', 'crest', 'ribs', 'dormant', 'works'];
  const allBroken = subAreas.every(a =>
    ruinPlan.buildings.filter(b => b.area === a).some(b => b.storeys.some(st => st.walls.some(w => w.broken)))
  );
  T.ok('every organ sub-site breaks partitions cleanly in ruined state', allBroken);
}

const totalRooms = B.reduce((n, b) => n + b.storeys.reduce((m, st) => m + st.rooms.length, 0), 0);
console.log('Arcodiga interiors: ' + B.length + ' units, ' + B.reduce((n, b) => n + b.storeys.length, 0) + ' storeys, ' + totalRooms + ' rooms');
T.ok('substantial interior room count planned (' + totalRooms + ' rooms)', totalRooms >= 250);

/* Hull descriptor contract & water snapping */
{
  const H = ARCODIGA.HULL;
  T.ok('ARCODIGA.HULL exposes span, H, toe/toeZ(x), zUp(x), zDs(x,y), rAt(y), vtol.rAt(y) and waterline(d)',
    H && H.span === 1460 && H.H === 360
    && H.zUp(0) === -260 && H.toe(0) === -100 && H.toeZ(0) === -100
    && Math.abs(H.toe(730)) < 1e-6 + 160.1 && H.toe(730) === 160
    && H.vtol.rAt(200) === 38 && H.vtol.rAt(420) === 68
    && H.rAt(20) > H.rAt(200) && H.rAt(360) === 33
    && H.waterline(0) === 328 && H.waterline(3) === 324 && H.waterline(1) === 213);

  /* Verify 8av2-arcodiga-water.js snaps directly to ARCODIGA.HULL */
  const waterCode = fs.readFileSync(path.join(__dirname, '8av2-arcodiga-water.js'), 'utf8');
  const WATER = {
    still: r => Object.assign({ kind: 'still' }, r),
    flow: r => Object.assign({ kind: 'flow' }, r),
    fall: r => Object.assign({ kind: 'fall' }, r)
  };
  const runWater = new Function('ARCODIGA', 'WATER', waterCode + '; return ADG_WATER;');
  const AW = runWater(ARCODIGA, WATER);
  const s3 = AW.dam(3, { gx: 0, gz: 0, bedY: () => 12, floorY: () => 2 });
  const tb = s3.still.find(s => s.name === 'Powerhouse tailrace basin');
  T.ok('ADG_WATER snaps reservoir & tailrace quay directly to ARCODIGA.HULL',
    tb && tb.level === H.tailraceQuay.y && tb.poly[0][1] === H.tailraceQuay.z);

  /* Verify 8av2b-arcodiga-parts.js & 8av3-arcodiga-draw.js isolate rock PRNG and gate meshMerged(ROCK, ...) on !opts?.noTerrain */
  const partsSrc = fs.readFileSync(path.join(__dirname, '8av2b-arcodiga-parts.js'), 'utf8');
  const drawSrc = fs.readFileSync(path.join(__dirname, '8av3-arcodiga-draw.js'), 'utf8');
  T.ok('adgLand isolates terrain PRNG in reseed(12790 + d) and gates meshMerged(ROCK, ...) in if (!opts?.noTerrain)',
    /reseed\(12790\s*\+\s*d\)/.test(partsSrc)
    && /if\s*\(\s*!opts\?\.noTerrain\s*\)/.test(partsSrc)
    && /meshMerged\(ROCK,\s*MAT\.rock,\s*G_SITE\)/.test(partsSrc)
    && /buildArcodiga\.hull\s*=\s*ARCODIGA\.HULL/.test(drawSrc));
}

T.done();
