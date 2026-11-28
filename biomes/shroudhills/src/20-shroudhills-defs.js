// ================================================================= SHROUDHILLS — pure data & ecological physics [G data]
// Region id: rmwetizlzivnz (renamed from "Scoured hills" on Scale Model 5.1; Yonni-Zag: Shruda-Khiltae).
// 80-85% temperate-subtropical cloud rainforest overloaded at 0.75 g and 1.35-1.59 atm (0.28-0.33 atm O2) with the
// locked A + B + E + C super-epiphyte & cat-sized eusocial Shroud-Ant (Khroma-Mira) regional hazard synthesis.
// Engine-neutral [G data]: zero THREE, zero DOM, zero canvas; runs in Node (tests/test-shroudhills.js) and Godot.
var SHROUDHILLS = (function(){
 'use strict';
 var root = typeof globalThis !== 'undefined' ? globalThis : this;
 var clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
 var lerp = function(a, b, t){ return a + (b - a) * t; };
 var smooth = function(a, b, x){
  var t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
 };

 var S = {
  id: 'shroudhills',
  regionId: 'rmwetizlzivnz',
  endonym: 'Shruda-Khiltae',
  antEndonym: 'Khroma-Mira',
  polity: 'Sfira-Kandetae (Twin-Born Spear-Queens of Yonni)',
  PLANET: {
   g: 7.4,
   earthG: 9.81,
   gRatio: 7.4 / 9.81,
   epiphyteLoadMult: 3.4,
   o2Fraction: 0.2095
  },
  TAGS: {
   climate: 'subtropic..temperate',
   aridity: 'humid',
   abyssal: false,
   riparian: 'both',
   koppen: 'Cfa',
   setting: 'outdoor'
  }
 };

 // ---- Scale Model 5.1 station survey records (sky px = 5.1 px minus [272, 330])
 S.SITES = {
  cove: {
   key: 'cove',
   name: 'Shroudhills - Cove of the Sister-Cups',
   px51: [497, 302],
   sky: { px: 497 - 272, py: 302 - 330 },
   elevM: 50,
   atm: 1.59,
   pO2: +(1.59 * 0.2095).toFixed(3),
   rainMm: 2698,
   koppen: 'Am',
   zone: 'shroud_cove'
  },
  canopy: {
   key: 'canopy',
   name: 'Shroudhills - Grafted Canopy Glen and Shroud-Ant Ravine',
   px51: [531, 252],
   sky: { px: 531 - 272, py: 252 - 330 },
   elevM: 686,
   atm: 1.47,
   pO2: +(1.47 * 0.2095).toFixed(3),
   rainMm: 1710,
   koppen: 'Cfa',
   zone: 'canopy_sea'
  },
  cloaktor: {
   key: 'cloaktor',
   name: 'Shroudhills - Storm-Washed Cloak-Tor and Yonni Watch-Plinth',
   px51: [505, 302],
   sky: { px: 505 - 272, py: 302 - 330 },
   elevM: 1284,
   atm: 1.36,
   pO2: +(1.36 * 0.2095).toFixed(3),
   rainMm: 3561,
   koppen: 'Cfa',
   zone: 'cloak_tor'
  }
 };

 // ---- Zones (PLAN.md section 4)
 S.ZONES = {
  shroud_cove: { key: 'shroud_cove', elev: [0, 250], atm: [1.60, 1.55], koppen: 'Am', what: 'Drowned coastal coves, black-cobble mouths and resin-conifer bluffs with Sister-Cup sky-ponds' },
  canopy_sea: { key: 'canopy_sea', elev: [200, 1150], atm: [1.56, 1.39], koppen: 'Cfa', what: 'Two-storey cloud forest over ironstone and coal ravines with Root-Hammock sky-turf, Drum-Galls and Shroud-Ants' },
  cloak_tor: { key: 'cloak_tor', elev: [950, 2200], atm: [1.41, 1.21], koppen: 'Cfa', what: 'Wind-washed pale granite ridge-crowns draped in scarlet and saffron Lithophyte Cloaks and Yonni watch-drums' },
  mist_divide: { key: 'mist_divide', elev: [2200, 5200], atm: [1.21, 0.83], koppen: 'Dfc', what: 'High SE cordillera spine seen on KFAR horizon, mossy cloud-krummholz and wet snowfields' }
 };

 S.zoneWeights = function(elevM, graniteK, coastK){
  var e = elevM == null ? 400 : elevM;
  var gr = clamp(graniteK == null ? 0 : graniteK, 0, 1);
  var co = clamp(coastK == null ? 0 : coastK, 0, 1);
  var wDiv = smooth(2050, 2600, e);
  var wTor = clamp(Math.max(gr * smooth(750, 1080, e), gr * 0.65 * co, smooth(1220, 1650, e) * (0.4 + 0.6 * gr)) * (1 - wDiv), 0, 1);
  var wCove = clamp(co * smooth(280, 40, e) * (1 - gr * 0.75) * (1 - wDiv), 0, 1);
  var wCan = clamp((1 - wDiv) * (1 - wTor * 0.92) * (1 - wCove * 0.65), 0, 1);
  var sum = wCove + wCan + wTor + wDiv;
  if (sum <= 1e-6) return { shroud_cove: 0, canopy_sea: 1, cloak_tor: 0, mist_divide: 0 };
  return {
   shroud_cove: wCove / sum,
   canopy_sea: wCan / sum,
   cloak_tor: wTor / sum,
   mist_divide: wDiv / sum
  };
 };

 // Species, palettes and HV harvest records live in 21-shroudhills-species.js ([G data], scanned by tools/check_botany.py).

 // ---- Twist A: Paired Sister-Cup Cistern Sky-Pond spec (KRAND seeded)
 S.sisterCupSpec = function(seed){
  var st = KRAND.stream(seed >>> 0);
  var totalD = lerp(1.8, 3.2, st.next());
  var cupR = totalD * lerp(0.24, 0.28, st.next());
  var sep = cupR * lerp(2.05, 2.28, st.next());
  var lipH = cupR * lerp(0.72, 0.96, st.next());
  var depthM = lipH * lerp(0.58, 0.74, st.next());
  var twoCupVolM3 = 2 * Math.PI * (cupR * 0.78) * (cupR * 0.78) * depthM * 0.62;
  var litres = clamp(Math.round(twoCupVolM3 * 1000), 90, 320);
  var wetMassKg = +(litres * 1.18).toFixed(1);
  return {
   totalD: +totalD.toFixed(3),
   cupR: +cupR.toFixed(3),
   sep: +sep.toFixed(3),
   lipH: +lipH.toFixed(3),
   weirH: +(lipH * 0.76).toFixed(3),
   waterOffset: +(lipH * 0.68).toFixed(3),
   litres: litres,
   wetMassKg: wetMassKg,
   effectiveEarthEqKg: +(wetMassKg * S.PLANET.gRatio).toFixed(1),
   yaw: st.next() * Math.PI * 2
  };
 };

 // ---- Twist B: Catenary Root-Hammock & 50 cm Suspended Canopy Turf solver
 S.catenarySpan = function(a, b, opt){
  opt = opt || {};
  var dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  var chordH = Math.hypot(dx, dz);
  var sagRatio = opt.sagRatio == null ? 0.115 * S.PLANET.gRatio : opt.sagRatio;
  var sag = Math.max(0.45, chordH * sagRatio);
  var steps = opt.steps == null ? 8 : opt.steps;
  var turfThick = opt.turfThick == null ? 0.52 : opt.turfThick;
  var width = opt.width == null ? clamp(chordH * 0.22, 1.4, 2.9) : opt.width;
  var pts = [];
  for (var i = 0; i <= steps; i++) {
   var t = i / steps;
   var parabola = 4 * t * (1 - t);
   pts.push({
    t: t,
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t) - sag * parabola,
    z: lerp(a.z, b.z, t),
    w: width * (0.62 + 0.38 * parabola),
    thick: turfThick * (0.55 + 0.45 * parabola)
   });
  }
  return {
   a: a,
   b: b,
   spanM: +chordH.toFixed(3),
   sagM: +sag.toFixed(3),
   widthM: +width.toFixed(3),
   turfThickM: +turfThick.toFixed(3),
   mid: pts[steps >> 1],
   pts: pts
  };
 };

 // Deterministic KSPACE neighbor-bridging solver for Grafted Root-Hammocks
 S.pairHammocks = function(anchors, space, opt){
  opt = opt || {};
  var minSpan = opt.minSpan == null ? 6.0 : opt.minSpan;
  var maxSpan = opt.maxSpan == null ? 15.5 : opt.maxSpan;
  var maxDy = opt.maxDy == null ? 6.5 : opt.maxDy;
  var maxDeg = opt.maxDegree == null ? 3 : opt.maxDegree;
  var seed = opt.seed == null ? 9103 : opt.seed;
  var deg = {};
  var seen = {};
  var candidates = [];

  for (var i = 0; i < anchors.length; i++) {
   var A = anchors[i];
   var hits = [];
   if (space && typeof space.query === 'function') {
    space.query(A.x, A.z, maxSpan, hits);
   } else {
    for (var j = 0; j < anchors.length; j++) hits.push(anchors[j]);
   }
   for (var k = 0; k < hits.length; k++) {
    var B = hits[k];
    if (!B || B.treeId === A.treeId) continue;
    var lo = A.id < B.id ? A.id : B.id;
    var hi = A.id < B.id ? B.id : A.id;
    var pk = lo + ':' + hi;
    if (seen[pk]) continue;
    var d = Math.hypot(B.x - A.x, B.z - A.z);
    var dy = Math.abs(B.y - A.y);
    if (d < minSpan || d > maxSpan || dy > maxDy) continue;
    seen[pk] = 1;
    var pA = A.id < B.id ? A : B;
    var pB = A.id < B.id ? B : A;
    var h = KRAND.hash(seed, pA.id, pB.id);
    candidates.push({ a: pA, b: pB, d: d, dy: dy, score: d + dy * 0.6 + (h >>> 0) / 4294967296 * 1.5, seed: h });
   }
  }

  candidates.sort(function(u, v){ return u.score - v.score; });
  var spans = [];
  for (var c = 0; c < candidates.length; c++) {
   var cand = candidates[c];
   var da = deg[cand.a.treeId] || 0;
   var db = deg[cand.b.treeId] || 0;
   if (da >= maxDeg || db >= maxDeg) continue;
   deg[cand.a.treeId] = da + 1;
   deg[cand.b.treeId] = db + 1;
   var st = KRAND.stream(cand.seed);
   var thick = lerp(0.45, 0.68, st.next());
   var sp = S.catenarySpan(cand.a, cand.b, {
    turfThick: thick,
    width: lerp(1.6, 2.7, st.next()),
    steps: 8
   });
   sp.seed = cand.seed;
   spans.push(sp);
  }
  return spans;
 };

 // ---- Twist C: Myrmecophyte Drum-Gall & Cat-Sized Shroud-Ant (Khroma-Mira) Colony Spec & Behavior
 S.antColonySpec = function(seed, atm){
  var st = KRAND.stream(seed >>> 0);
  var pAtm = atm == null ? 1.47 : atm;
  var pO2 = pAtm * S.PLANET.o2Fraction;
  var o2Scale = clamp((pO2 - 0.21) / 0.12, 0.4, 1.15);
  var gallD = lerp(1.3, 2.6, st.next());
  var workerCm = lerp(28, 34, st.next() * 0.7 + o2Scale * 0.3);
  var soldierCm = lerp(38, 42, st.next() * 0.65 + o2Scale * 0.35);
  var territoryR = lerp(9.5, 14.5, (gallD - 1.3) / 1.3);
  var sentries = 4 + Math.floor(st.next() * 4);
  return {
   gallD: +gallD.toFixed(3),
   gallH: +(gallD * lerp(1.08, 1.34, st.next())).toFixed(3),
   workerCm: +workerCm.toFixed(1),
   soldierCm: +soldierCm.toFixed(1),
   rattleHz: 6.0,
   audibleM: 500,
   territoryR: +territoryR.toFixed(2),
   sentries: sentries,
   saltpeterKg: +(gallD * gallD * 4.2).toFixed(1)
  };
 };

 S.antResponse = function(distM, opt){
  opt = opt || {};
  var r = opt.territoryR == null ? 12 : opt.territoryR;
  if (distM > r * 1.35) return { state: 'peaceful', danger: 0, hz: 0 };
  if (opt.struckTree) return { state: 'phalanx', danger: 0.95, hz: 6.0 };
  if (opt.smudged && !opt.fireSmoke) return { state: 'peaceful', danger: 0, hz: 0 };
  if (opt.onHammock || opt.fireSmoke) {
   if (distM <= r * 0.75) return { state: 'phalanx', danger: 0.85, hz: 6.0 };
   return { state: 'drum-rattle', danger: 0.45, hz: 6.0 };
  }
  if (distM <= r * 0.35 && !opt.onStonePath) return { state: 'drum-rattle', danger: 0.35, hz: 6.0 };
  return { state: 'peaceful', danger: 0, hz: 0 };
 };

 // ---- CROPS profile (Matron's Coast / Yonni Spear-Queen littoral & cloud forest) + littoral strand palm gating
 S.CROPS = {
  atm: 2,
  staples: ['coconut', 'pandan'],
  zones: {
   shroud_cove: { warmth: [3, 4], arid: [3, 4], wet: true, salt: true, atm: 2 },
   canopy_sea: { warmth: [2, 3], arid: [3, 4], atm: 2 },
   cloak_tor: { warmth: [1, 2], arid: [3, 4], atm: 2 }
  }
 };

 S.registerCrops = function(C){
  var K = C || (typeof CROPS !== 'undefined' ? CROPS : null);
  if (!K) return null;
  if (K.BIOMES) K.BIOMES.shroudhills = S.CROPS;
  return K.forBiome ? K.forBiome('shroudhills') : S.CROPS;
 };

 S.coveStrandPalmOk = function(o){
  o = o || {};
  var coast = o.coast == null ? 0 : o.coast;
  var elevASL = o.elevASL == null ? 999 : o.elevASL;
  var y = o.y == null ? 0 : o.y;
  var sea = o.seaLevel == null ? 0 : o.seaLevel;
  var tor = o.tor == null ? 0 : o.tor;
  var granite = o.granite == null ? 0 : o.granite;
  var path = o.path == null ? 0 : o.path;
  var slope = o.slope == null ? 0 : o.slope;
  return coast >= 0.72 && elevASL <= 108 && y > sea + 1.25 && tor <= 0.25 && granite <= 0.48 && path <= 0.22 && slope <= 0.56;
 };

 root.SHROUDHILLS = S;
 return S;
})();
