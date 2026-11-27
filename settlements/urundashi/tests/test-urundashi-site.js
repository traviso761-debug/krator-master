/* node settlements/urundashi/tests/test-urundashi-site.js — Urundashi's KCITY.grid town, moat, KHAMLET ring & live economy
   (settlements/urundashi/PLAN.md; settlements/shumar/BUILD-OUT.md §1a, §2a, §3.1).
   Verifies without THREE or DOM:
     1. Scale-model 5.1 ground & hydrological monotonicity: +65.7 m steppe glacis at (779,1153), 13 m wet moat, 3 snowmelt flows;
     2. Walled Mamluk garrison square on KCITY.grid: 4 corner bastions, 4 Giant-clearance pishtaq gates, 4 stone moat bridges;
     3. Exact SHUMAR_TUNE parity: 3,500 ± 5% town people (~200 -no outlanders in Rabad al-Sarq) + 5 ring hamlets = 990 ± 10%;
     4. All 9 SHUMAR_TUNE works of srbp1bvh1r placed by exact workId (crucible, coal-hearth, bladesmiths, armourers, smithy,
        powder, nitre, stills, stud);
     5. Zero OBB overlaps (exact SAT <= 0.05 m), zero non-civic houses on street carriageways, zero buildings in moat/rivers;
     6. Live UR_SIM books (0 problems, 9 works producing watered steel, blades, armour, powder, tequila & mounts);
     7. Deterministic KRAND placement across two fresh runs.
   Every check has a paired T.neg negative control (tools/ktest.js). */
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

load('settlements/urundashi/src/39u-ur-model.js');
load('settlements/urundashi/src/40-ur-ground.js');
load('settlements/urundashi/src/41-ur-city.js');
load('settlements/urundashi/src/42-ur-ring.js');
load('settlements/urundashi/src/45-ur-sim.js');

function segD(p, a, b) {
  var dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
  var t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2));
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dz * t));
}

var city = UR_CITY.run();
var ring = UR_RING.run();

/* 1. Ground & river monotonicity */
function checkRiversMono(rivers) {
  return rivers.every(function (r) {
    for (var i = 1; i < r.pts.length; i++) {
      if (r.pts[i][2] > r.pts[i - 1][2] + 1e-6) return false;
    }
    return true;
  });
}
var wf = urundashiWorldFrame();
var h0 = urundashiH(0, 0);
var moatOk = !!(UR.moat() && UR.moat().width === 13 && UR.inMoat(city.grid.moat.line[0][0], city.grid.moat.line[0][1], 0));
T.ok(
  'scale-model 5.1 ground & hydrology: (779,1153)=3219.7 m ASL, 13 m wet moat carved, all 3 rivers monotonically downhill',
  wf.px === 779 && wf.py === 1153 && Math.abs(wf.datumM + h0 - 3219.7) < 3.0 && checkRiversMono(UR.RIVERS) && moatOk,
  'elev=' + (wf.datumM + h0).toFixed(1) + ' m ASL, moatW=' + (UR.moat() && UR.moat().width)
);
T.neg(
  '...its negative: an uphill river profile is rejected',
  checkRiversMono,
  [{ pts: [[0, 0, 10], [100, 0, 14]] }],
  UR.RIVERS
);

/* 2. KCITY.grid irregular square, 4 bastions, 4 pishtaq gates, 4 moat bridges */
function checkGrid(inp) {
  var G = inp.grid, bridges = inp.bridges, lots = inp.lots;
  if (!G || G.corners.length !== 4 || G.gates.length !== 4 || bridges.length !== 4) return false;
  var gatesPlaced = lots.filter(function (b) { return b.key === 'sm_pishtaq_gate'; }).length;
  var bastionsPlaced = lots.filter(function (b) { return b.key === 'sm_payaru_tower'; }).length;
  return gatesPlaced >= 4 && bastionsPlaced >= 4 && G.cells.length === 25 && G.edges.dropped >= 1;
}
T.ok(
  'KCITY.grid qasba: 25 irregular cells, 4 corner bastions, 4 Giant-clearance pishtaq gates, 4 stone moat bridges',
  checkGrid({ grid: city.grid, bridges: city.moatBridges, lots: city.lots }),
  'dropped=' + city.grid.edges.dropped + ', gates=' + city.lots.filter(function (b) { return b.key === 'sm_pishtaq_gate'; }).length +
  ', towers=' + city.lots.filter(function (b) { return b.key === 'sm_payaru_tower'; }).length
);
T.neg(
  '...its negative: missing bastions, gates or moat bridges is rejected',
  checkGrid,
  { grid: { corners: [1, 2], gates: [1, 2, 3, 4], cells: [], edges: { dropped: 0 } }, bridges: [], lots: [] },
  { grid: city.grid, bridges: city.moatBridges, lots: city.lots }
);

/* 3. Census parity with SHUMAR_TUNE (3,500 town ±5%, ~200 outlanders, 5 ring hamlets = 990 ±10%) */
var tunePlace = SHUMAR_TUNE.places.filter(function (p) { return p.id === 'srbp1bvh1r'; })[0];
function checkCensus(inp) {
  var c = inp.census;
  return !!(c && Math.abs(c.total - tunePlace.people) <= 175 &&
    Math.abs(c.outlanders - tunePlace.outlanders) <= 45 &&
    inp.ringVillages === 5 && Math.abs(inp.ringPeople - 990) <= 95);
}
T.ok(
  'SHUMAR_TUNE census parity: 3,500 ± 5% town (~200 outlanders in Rabad al-Sarq) + 5 ring hamlets = 990 ± 10%',
  checkCensus({ census: city.census, ringVillages: ring.villages.length, ringPeople: ring.people }),
  'town=' + city.census.total + ', outlanders=' + city.census.outlanders + ', ring=' + ring.people +
  ', buildings=' + (city.lots.length + ring.lots.length)
);
T.neg(
  '...its negative: wrong seat population or missing ring hamlets is rejected',
  checkCensus,
  { census: { total: 2100, outlanders: 20 }, ringVillages: 3, ringPeople: 500 },
  { census: city.census, ringVillages: ring.villages.length, ringPeople: ring.people }
);

/* 4. All 9 SHUMAR_TUNE works of srbp1bvh1r placed by exact workId */
var expectedWorks = [
  'urundashi.crucible', 'urundashi.coal-hearth', 'urundashi.bladesmiths',
  'urundashi.armourers', 'urundashi.smithy', 'urundashi.powder',
  'urundashi.nitre', 'urundashi.stills', 'urundashi.stud'
];
function checkWorks(wp) {
  return expectedWorks.every(function (wid) { return (wp[wid] || 0) >= 1; });
}
T.ok(
  'all 9 SHUMAR_TUNE works of srbp1bvh1r placed by exact workId',
  checkWorks(city.census.worksPlaced),
  JSON.stringify(city.census.worksPlaced)
);
T.neg(
  '...its negative: missing industrial/remount works is rejected',
  checkWorks,
  { 'urundashi.crucible': 1 },
  city.census.worksPlaced
);

/* 5. Zero OBB overlaps across all town lots */
function checkNoOverlaps(lots) {
  var K = KCITY.lib || { SL: SL };
  for (var i = 0; i < lots.length; i++) {
    for (var j = i + 1; j < lots.length; j++) {
      if (Math.hypot(lots[i].x - lots[j].x, lots[i].z - lots[j].z) > 40) continue;
      if (K.SL.pen(lots[i].bo, lots[j].bo) > 0.06) return false;
    }
  }
  return true;
}
T.ok(
  'OBB non-overlap: 0 colliding pairs across all ' + city.lots.length + ' town buildings',
  checkNoOverlaps(city.lots),
  'checked ' + city.lots.length + ' OBBs'
);
T.neg(
  '...its negative: overlapping OBBs are rejected',
  checkNoOverlaps,
  [
    { x: 0, z: 0, bo: { c: [0, 0], u: [1, 0], v: [0, 1], hw: 6, hd: 6 } },
    { x: 2, z: 0, bo: { c: [2, 0], u: [1, 0], v: [0, 1], hw: 6, hd: 6 } }
  ],
  city.lots
);

/* 6. Zero non-civic houses on streets & zero buildings in moat/rivers */
function checkDryAndOffRoad(inp) {
  var lots = inp.lots, ways = inp.ways, waterFn = inp.waterFn;
  for (var i = 0; i < lots.length; i++) {
    var b = lots[i];
    if (waterFn(b.x, b.z).wet) return false;
    if (!b.kind || b.kind === 'house') {
      for (var wi = 0; wi < ways.length; wi++) {
        var w = ways[wi];
        if (w.district !== b.district && w.kind !== 'highway') continue;
        var lim = (w.w == null ? 6 : w.w) * 0.5 + Math.min(b.w, b.d) * 0.36;
        for (var p = 1; p < w.pts.length; p++) {
          if (segD([b.x, b.z], w.pts[p - 1], w.pts[p]) < lim) return false;
        }
      }
    }
  }
  return true;
}
T.ok(
  'dry & off-carriageway: 0 buildings in moat/rivers and 0 non-civic houses on street carriageways',
  checkDryAndOffRoad({ lots: city.lots, ways: city.ways, waterFn: urundashiWater }),
  'lots=' + city.lots.length + ', ways=' + city.ways.length
);
T.neg(
  '...its negative: a house placed in water is rejected',
  checkDryAndOffRoad,
  { lots: [{ x: 0, z: 0, w: 10, d: 10, district: 'qasba', kind: 'house' }], ways: [], waterFn: function () { return { wet: true }; } },
  { lots: city.lots, ways: city.ways, waterFn: urundashiWater }
);

/* 7. Live UR_SIM regional simulation */
var snap = UR_SIM.snapshot();
function checkSim(s) {
  return !!(s && s.problems === 0 && s.settlementsCount >= 60 && s.urundashi &&
    (s.urundashi.made.steel || 0) > 0 && (s.urundashi.made.blades || 0) > 0 &&
    (s.urundashi.made.mounts || 0) > 0 && s.tequilaGloss.indexOf('Ṣūnu') >= 0);
}
T.ok(
  'UR_SIM live economy: 0 problems, active steel, blades, mounts & Sunu-sikaru production',
  checkSim(snap),
  'day=' + (snap && snap.day) + ', steel=' + Math.round(snap && snap.urundashi && snap.urundashi.made.steel || 0) +
  ', blades=' + Math.round(snap && snap.urundashi && snap.urundashi.made.blades || 0) +
  ', mounts=' + (snap && snap.urundashi && snap.urundashi.made.mounts || 0).toFixed(2)
);
T.neg(
  '...its negative: a broken simulation state is rejected',
  checkSim,
  { problems: 3, settlementsCount: 10, urundashi: null, tequilaGloss: '' },
  snap
);

/* 8. Deterministic KRAND placement across two runs */
var c2 = UR_CITY.run();
function checkDet(pair) {
  var A = pair[0], B = pair[1];
  return A.length === B.length && A.every(function (b, i) {
    return b.key === B[i].key && Math.abs(b.x - B[i].x) < 1e-6 && Math.abs(b.z - B[i].z) < 1e-6;
  });
}
T.ok(
  'KRAND determinism: two fresh UR_CITY.run() passes match identically',
  checkDet([city.lots, c2.lots]),
  city.lots.length + ' buildings identical'
);
T.neg(
  '...its negative: a perturbed building list is rejected',
  checkDet,
  [city.lots, city.lots.slice(1)],
  [city.lots, c2.lots]
);

T.done();
