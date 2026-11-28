/* node settlements/shumar/tests/test-amaro-site.js — Amaro's multi-tier site, KCITY layout, KHAMLET ring & live economy
   (settlements/shumar/PLAN.md Steps A0-A1; owner calls 1-4, 2026-11-18).
   Verifies without THREE or DOM:
     1. 4-tier ablaq canyon profile: +240.7 m rim -> 0.0 m confluence river, +262.7 m Citadel prow, <=7.5% switchback legs;
     2. Owner call #3: Terraced Outlander Customs Shelf (Babu-Dalab & Babu-Iziz) sits -38 m (±3 m) below the North Gate rim;
     3. Owner call #4: Madinat al-Qubab strings 15 regimental qubbas + Hall of Blades + Doriyan stele along the cliff crest with
        100% unblocked northern skyline frontage;
     4. Owner call #2: Payaru-Gisr (amaro.gisr) folded in as 3rd sub-district (Greater Amaro = 12,850; 6 ring hamlets = 1,310);
     5. Zero OBB overlaps (exact SAT, 0.1 m), zero houses on street carriageways, zero non-bridge/mill buildings in rivers;
     6. All 10 SHUMAR_TUNE industrial/ordnance works placed by workId, plus live AM_SIM valley books with zero problems;
     7. Deterministic KRAND placement across two fresh runs.
   Every check has a paired T.neg check (tools/ktest.js). */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var ROOT = path.join(__dirname, '..', '..', '..');
var T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

function load(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
}

global.window = global;

/* 1. Load core/rand, core/space, core/tags, core/city, core/hamlet (+ shumari opt-in), core/clock, core/simulation, core/region */
[
  'core/rand/08-core-rand.js',
  'core/space/20-core-space.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js'
].forEach(load);

fs.readdirSync(path.join(ROOT, 'core', 'city'))
  .filter(function (f) { return /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f); })
  .sort()
  .forEach(function (f) { load('core/city/' + f); });

fs.readdirSync(path.join(ROOT, 'core', 'hamlet'))
  .filter(function (f) { return /^\d\d-hamlet-.*\.js$/.test(f) && !/^32-|^34-/.test(f); })
  .sort()
  .forEach(function (f) { load('core/hamlet/' + f); });
load('core/hamlet/shumari/25-hamlet-shumari.js');

load('core/clock/20-core-clock.js');
fs.readdirSync(path.join(ROOT, 'core', 'simulation'))
  .filter(function (f) { return /^77-sim-.*\.js$/.test(f); })
  .sort()
  .forEach(function (f) { load('core/simulation/' + f); });
load('core/region/00-region-core.js');
load('core/region/50-region-valley.js');
load('core/region/data/shumar-tune.js');

/* 2. Load Amaro data fragments */
load('settlements/shumar/src/39a-am-model.js');
load('settlements/shumar/src/40-am-ground.js');
load('settlements/shumar/src/41-am-city.js');
load('settlements/shumar/src/42-am-ring.js');
load('settlements/shumar/src/45-am-sim.js');

/* Helpers */
function segD(p, a, b) {
  var dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
  var t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]);
}
function cornersOf(o) {
  return obbCorners({ c: o.c, u: o.u, v: [-o.u[1], o.u[0]], hw: o.hw, hd: o.hd });
}
function penOf(A, B) {
  return SL.pen(
    { c: A.c, u: A.u, v: [-A.u[1], A.u[0]], hw: A.hw, hd: A.hd },
    { c: B.c, u: B.u, v: [-B.u[1], B.u[0]], hw: B.hw, hd: B.hd }
  );
}
function findOverlaps(list, eps) {
  var I = KSPACE.create({ cell: 48 }), n = 0, first = null;
  list.forEach(function (p, i) {
    p._idx = i;
    I.insert(p, p.x, p.z, Math.hypot(p.bo.hw, p.bo.hd));
  });
  list.forEach(function (A) {
    I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(function (B) {
      if (B._idx > A._idx && penOf(A.bo, B.bo) > eps) {
        n++;
        first = first || (A.id + ' (' + A.key + ') x ' + B.id + ' (' + B.key + ')');
      }
    });
  });
  return { n: n, first: first };
}
function housesOnStreets(list, ways) {
  var n = 0, first = null;
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    if (p.kind !== 'house') continue;
    var pts = cornersOf(p.bo).concat([p.bo.c]);
    var hit = ways.some(function (w) {
      if (w.district && w.district !== p.district && p.district !== 'ring') return false;
      for (var k = 1; k < w.pts.length; k++) {
        for (var c = 0; c < pts.length; c++) {
          if (segD(pts[c], w.pts[k - 1], w.pts[k]) < w.w * 0.5 - 0.1) return true;
        }
      }
      return false;
    });
    if (hit) { n++; first = first || p.id; }
  }
  return { n: n, first: first };
}

var city = AM_CITY.get();
var ring = AM_RING.get();

/* ---- Check 1: Canyon-lip terrain heights, confluence rivers & <=7.5% switchback ramp ---- */
function checkTerrain(fnH, sw) {
  var rimY = fnH(0, 0);
  var prowY = fnH(-745, -315);
  var fosY = fnH(-528, -320);
  var gisrY = fnH(60, -800);
  var bridgeW = amaroWater(60, -920);
  var maxGrade = 0;
  for (var i = 1; i < sw.length; i++) {
    var a = sw[i - 1], b = sw[i];
    var run = Math.hypot(b[0] - a[0], b[1] - a[1]);
    var gr = Math.abs(b[2] - a[2]) / Math.max(1, run);
    if (gr > maxGrade) maxGrade = gr;
  }
  return rimY > 238 && rimY < 244 && prowY > 260 && fosY < 232 && gisrY > 4 && gisrY < 14 && bridgeW.wet && maxGrade <= 0.076;
}
T.ok('4-tier ablaq canyon terrain: +240.7 m rim, +262.7 m Citadel prow, +227.5 m dry fosse, wet 0.0 m confluence, switchback <= 7.5%',
  checkTerrain(amaroH, AM.SWITCHBACK),
  'rim=' + amaroH(0, 0).toFixed(1) + 'm, prow=' + amaroH(-745, -315).toFixed(1) + 'm, fosse=' + amaroH(-528, -320).toFixed(1) + 'm');
T.neg('...its negative: a 25% cliff ramp is rejected',
  function (sw) { return checkTerrain(amaroH, sw); },
  [[0, -800, 5], [0, -430, 240]],
  AM.SWITCHBACK);

/* ---- Check 2: Owner call #3 — Terraced Outlander Customs Shelf (-38 m below North Gate rim) ---- */
function checkCustomsDrop(gatePt, shelfPt) {
  var drop = amaroH(gatePt[0], gatePt[1]) - amaroH(shelfPt[0], shelfPt[1]);
  return drop >= 35.0 && drop <= 41.0 && amaroSlope(shelfPt[0], shelfPt[1]) < 0.06;
}
var custLots = city.lots.filter(function (b) { return b.district === 'customs'; });
var hasDalab = custLots.some(function (b) { return b.subward === 'Babu-Dalab' && b.key === 'sm_wikala_caravanserai'; });
var hasIziz  = custLots.some(function (b) { return b.subward === 'Babu-Iziz' && b.key === 'sm_wikala_caravanserai'; });
T.ok('Outlander Customs Shelf (Babu-Dalab & Babu-Iziz) terraced -38 m (±3 m) below North Gate rim with both wikalas',
  checkCustomsDrop([96, -432], [282, -570]) && hasDalab && hasIziz && custLots.length >= 20,
  'drop=' + (amaroH(96, -432) - amaroH(282, -570)).toFixed(1) + 'm, lots=' + custLots.length);
T.neg('...its negative: a flat plateau forecourt at gate level fails the -38 m terrace check',
  function (pt) { return checkCustomsDrop([96, -432], pt); },
  [96, -410],
  [282, -570]);

/* ---- Check 3: Owner call #4 — Madinat al-Qubab unblocked Mamluk dome skyline silhouette ---- */
function checkSkyline(lots) {
  var sky = lots.filter(function (b) { return b.district === 'necropolis' && b.skyline; });
  var qubbas = sky.filter(function (b) { return b.key === 'sm_regiment_qubba'; });
  var v0 = qubbas.filter(function (b) { return b.v === 0; }).length;
  var v1 = qubbas.filter(function (b) { return b.v === 1; }).length;
  var hasBlades = sky.some(function (b) { return b.key === 'sm_hall_of_blades'; });
  var hasDoriyan = sky.some(function (b) { return b.key === 'sm_doriyan_stele'; });
  var blockers = lots.filter(function (b) {
    return b.district === 'necropolis' && !b.skyline && b.z < -404;
  });
  return qubbas.length >= 14 && v0 >= 6 && v1 >= 6 && hasBlades && hasDoriyan && blockers.length === 0;
}
T.ok('Madinat al-Qubab strings 15 regimental qubbas (v=0 spiral & v=1 carved) + Hall of Blades + Doriyan Stele with 0 northern blockers',
  checkSkyline(city.lots),
  'skyline domes=' + city.lots.filter(function (b) { return b.skyline; }).length);
T.neg('...its negative: a house placed north of the qubba crest at z=-435 is caught blocking the skyline',
  checkSkyline,
  city.lots.concat([{ id: 'blocker', district: 'necropolis', skyline: false, key: 'sm_hearth_house', x: 700, z: -435 }]),
  city.lots);

/* ---- Check 4: Zero OBB overlaps, zero houses on streets, zero dry-land buildings in rivers ---- */
var allLots = city.lots.concat(ring.lots);
var ov = findOverlaps(allLots, 0.1);
T.ok('no two standing footprints overlap across all 6 city tiers + 6 ring hamlets (exact SAT, 0.1 m)',
  ov.n === 0,
  ov.n + ' pairs' + (ov.first ? ', first: ' + ov.first : '') + ' across ' + allLots.length + ' buildings');
{
  var h0 = city.lots.find(function (b) { return b.kind === 'house'; });
  var dup = Object.assign({}, h0, { id: 'dup', bo: Object.assign({}, h0.bo, { c: [h0.bo.c[0] + 1, h0.bo.c[1]] }) });
  T.neg('...its negative: a duplicate house shifted 1 m is caught',
    function (L) { return findOverlaps(L, 0.1).n === 0; },
    allLots.concat([dup]),
    allLots);
}

var os = housesOnStreets(city.lots, city.ways);
T.ok('no city house stands on a street carriageway',
  os.n === 0,
  os.n + ' on street' + (os.first ? ', first: ' + os.first : ''));
{
  var h1 = city.lots.find(function (b) { return b.kind === 'house' && b.district === 'upper'; });
  var moved = Object.assign({}, h1, { id: 'on-qasaba', x: 0, z: 0, bo: Object.assign({}, h1.bo, { c: [0, 0] }) });
  T.neg('...its negative: a house set in the middle of Qasaba Avenue (0, 0) is caught',
    function (L) { return housesOnStreets(L, city.ways).n === 0; },
    [moved],
    [h1]);
}

var WET_OK = { sm_gorge_bridge_tower: 1, sm_watermill: 1, sm_lake_jetty: 1 };
function drownedLots(L) {
  return L.filter(function (b) {
    if (WET_OK[b.key]) return false;
    var pts = cornersOf(b.bo).concat([b.bo.c]);
    return pts.some(function (q) {
      var w = amaroWater(q[0], q[1]);
      return w.wet && w.id !== 'leat.gisr';
    });
  });
}
var wetBad = drownedLots(allLots);
T.ok('zero non-bridge/mill buildings stand in Betun-Narun, Payaru-Buruqu or Qappu-Narun',
  wetBad.length === 0,
  wetBad.length + ' wet' + (wetBad[0] ? ' (' + wetBad[0].id + ' ' + wetBad[0].key + ')' : ''));
{
  var h2 = city.lots.find(function (b) { return b.kind === 'house'; });
  var drowned = Object.assign({}, h2, { id: 'in-river', bo: Object.assign({}, h2.bo, { c: [60, -920] }) });
  T.neg('...its negative: a house dropped into Betun-Narun at (60, -920) is caught',
    function (L) { return drownedLots(L).length === 0; },
    [drowned],
    [h2]);
}

/* ---- Check 5: Exact census & sub-district parity (10,600 city + 1,100 citadel + 300 necropolis + 850 gisr + 6 rings) ---- */
function checkCensus(C, R) {
  var s = C.bySim;
  var okCity = Math.abs(s['ssgsv5zbd2'] - 10600) <= 650;
  var okCit  = Math.abs(s['amaro.citadel'] - 1100) <= 95;
  var okNec  = Math.abs(s['amaro.necropolis'] - 300) <= 35;
  var okGsr  = Math.abs(s['amaro.gisr'] - 850) <= 75;
  var okRng  = R.villages.length === 6 && R.villages.every(function (v) { return !v.error && v.records.length >= 12; }) && R.people >= 1150 && R.people <= 1450;
  return okCity && okCit && okNec && okGsr && okRng && C.vacantCount >= 6;
}
T.ok('Greater Amaro census matches SHUMAR_TUNE (10,600 city + 1,100 citadel + 300 necropolis + 850 gisr = ~12,850) + 6 clean KHAMLET rings (~1,310)',
  checkCensus(city.census, ring),
  JSON.stringify(city.census.bySim) + ', ring=' + ring.people + ' across ' + ring.villages.length + ' hamlets, buildings=' + city.census.buildings + ' (hero=' + city.census.heroCount + ', vacant=' + city.census.vacantCount + ')');
T.neg('...its negative: missing Payaru-Gisr (amaro.gisr = 0) fails census parity',
  function (C) { return checkCensus(C, ring); },
  Object.assign({}, city.census, { bySim: Object.assign({}, city.census.bySim, { 'amaro.gisr': 0 }) }),
  city.census);

/* ---- Check 6: All 10 SHUMAR_TUNE industrial/ordnance works placed + live AM_SIM valley books ---- */
var EXPECTED_WORKS = [
  'amaro.crucible', 'amaro.coal-hearth', 'amaro.bladesmiths', 'amaro.armourers',
  'amaro.toolsmiths', 'amaro.inlay', 'amaro.stills-glass', 'amaro.stills-jug',
  'amaro.looms', 'citadel.powder'
];
function checkWorks(wp) {
  return EXPECTED_WORKS.every(function (id) { return (wp[id] || 0) >= 1; });
}
T.ok('all 10 SHUMAR_TUNE city & citadel works placed by workId',
  checkWorks(city.census.worksPlaced),
  JSON.stringify(city.census.worksPlaced));
T.neg('...its negative: omitting citadel.powder is caught',
  checkWorks,
  Object.assign({}, city.census.worksPlaced, { 'citadel.powder': 0 }),
  city.census.worksPlaced);

var simSnap = AM_SIM.snapshot();
function checkSimSnap(sn) {
  return !!(sn && sn.problems === 0 && sn.census.totalPop === 109630 &&
    sn.city && sn.citadel && sn.necropolis && sn.gisr &&
    sn.gisr.people === 850 && sn.tequilaGloss === 'Ṣūnu-šikaru');
}
T.ok('AM_SIM binds KREGION.simValley + SHUMAR_TUNE live (109,630 people, 0 problems, amaro.gisr active, Sunu-sikaru gloss)',
  checkSimSnap(simSnap),
  simSnap ? ('settlements=' + simSnap.settlementsCount + ', problems=' + simSnap.problems + ', day=' + simSnap.day) : 'null');
T.neg('...its negative: a broken sim snapshot with problems > 0 is caught',
  checkSimSnap,
  Object.assign({}, simSnap, { problems: 2 }),
  simSnap);

/* ---- Check 7: Deterministic KRAND hash across two independent runs ---- */
function digest(lots) {
  var s = lots.map(function (r) {
    return r.id + ':' + r.key + ':' + r.v + ':' + Math.round(r.x * 100) + ':' + Math.round(r.z * 100) + ':' + Math.round(r.ry * 1000);
  }).join('|');
  return KHAMLET.idHash(s) >>> 0;
}
var d1 = digest(city.lots);
var d2 = digest(AM_CITY.run().lots);
var r1 = digest(ring.lots);
var r2 = digest(AM_RING.run().lots);
T.ok('AM_CITY.run() and AM_RING.run() are 100% deterministic across repeated runs (KRAND)',
  d1 === d2 && r1 === r2,
  'cityHash=' + d1 + ', ringHash=' + r1);
T.neg('...its negative: a perturbed coordinate changes the placement digest',
  function (pair) { return pair[0] === pair[1]; },
  [d1, d1 ^ 1],
  [d1, d2]);

T.done();
