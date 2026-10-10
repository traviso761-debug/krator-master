/* ============================== ELEPHANT BUG STATIONS (static) =============
   Route 1's 6 interior stops each get a real building — a stone platform, 4
   wood posts holding a peaked shelter roof, and a short stepped ramp up
   from ground level — instead of a bare marker. Built entirely from
   already-live (shape,family) pairs (BOX/CYL default 'stone', CYL 'wood'
   — already used elsewhere, e.g. benchPlain in 65-facade.js — CONE default
   'roof'), so this is zero new draw calls.

   The route's two termini (turnaround points, not real stops, per the
   owner's own distinction) get no structure here — see 79-striders.js for
   where they're used and why they only need to be "on dry, reasonable
   ground," not a building.

   Loads after 60-land.js's own procedural scatter and 65-facade.js (for
   structure()/shrineTriptych()/plinth()/shade()/loc(), and the manor-
   relocation pass that already ran in 60-land.js), safely before
   75-terrain.js's emitBuckets() drains BUCKET — this file pushes real
   static BOX/CYL/CONE geometry, so it MUST run before that drain (see
   78-life.js's own file-header comment for the bug this exact mistake
   caused once already this project).

   Footprints (all 6 stations, plus the eastern stop's shrine) are already
   reserved in 30-layout.js via reserve()/OBST, well before 60-land.js's
   procedural scatter ran — so nothing built earlier could have grown
   through where these stand. No claim() call is needed here for the same
   reason the wall's own segment margins don't re-claim: the early
   reservation already IS the real, permanent footprint (30-layout.js's own
   comment on this). */
reseed(660001);   /* fragment head seed — build.py enforces this. */

/* Route 1's 6 interior stops — exact coordinates, plus the local road
   tangent at each (already sampled once, live, via nearestStreet(), so the
   platform's long axis lines up with the road it serves). Kept in the same
   order as the owner's route: point 2 through point 7 of the 8-point list
   in the task brief (points 1 and 8 are the termini). */
var STRIDER_R1_STATIONS_RAW = [
  { x:-1806.4, z:2278.8, tx:-0.8320502943378437, tz:-0.5547001962252291, label:'Route 1 Stop 1' },
  { x:107.0,   z:2065.2, tx:0.217518812610881,   tz:0.9760561285911545,  label:'Route 1 Stop 2' },
  { x:791.3,   z:1489.4, tx:0.9019646069836713,  tz:-0.4318099671716614, label:'Route 1 Stop 3' },
  { x:1181.1,  z:1453.2, tx:0.8893017314745645,  tz:-0.4573209271357934, label:'Route 1 Stop 4' },
  { x:1938.9,  z:1701.5, tx:0.8642872019638728,  tz:0.5029986406755586,  label:'Route 1 Stop 5' },
  { x:2949.4,  z:1710.7, tx:0.980823374416306,   tz:0.19489871266535125, label:'Route 1 Stop 6 (Eastern Nucleus)' }
];

/* shared station registry, position-keyed rather than route-keyed: the
   owner's own stated plan is "when placing additional routes, if a vertex
   is on an existing station, incorporate it into the route" — a future
   route reusing one of these exact coordinates finds this same record via
   striderFindStation() instead of a second building growing on top of the
   first one. */
var LIFE_STRIDER_STATIONS = [];
function striderFindStation(x,z,tol){
  tol = tol || 25;
  for(var i=0;i<LIFE_STRIDER_STATIONS.length;i++){
    var s = LIFE_STRIDER_STATIONS[i];
    if(Math.hypot(s.x-x,s.z-z) < tol) return s;
  }
  return null;
}
function striderRegisterStation(x,z,ry,label){
  var existing = striderFindStation(x,z);
  if(existing) return existing;
  /* cat/cap/active/entryCount/queueCount mirror LIFE_DOORS' own 'dock'
     entries exactly (78-life.js) — rambling pedestrians can pick a
     station as a destination and queue there the same way they already
     queue at a ferry dock; see that file's own lifePedPickDestination/
     lifeFerryBoard for the pattern this reuses. */
  var st = { x:x, z:z, ry:ry, label:label, cat:'strider', cap:99, active:0, entryCount:0, queueCount:0 };
  LIFE_STRIDER_STATIONS.push(st);
  return st;
}

/* one waiting shelter: stone platform deck, 4 wood corner posts, a peaked
   roof, and a 3-step stone ramp up from ground level on the road-facing
   (local -x) side. */
function striderStationBuild(st){
  var x=st.x, z=st.z, ry=st.ry;
  var halfLen=18, halfWid=9;
  var col = shade(pick(TONES), -0.04);
  var yb = plinth(x,z,halfLen,halfWid,ry,col);
  BOX(x, yb, z, halfLen*2, 1.1, halfWid*2, ry, col);
  BOX(x, yb+1.1, z, halfLen*2*1.02, 0.4, halfWid*2*1.02, ry, shade(col,-0.12));   /* deck lip */
  var postH = 7.4;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(s){
    var p = loc(x,z, s[0]*(halfLen-1.8), s[1]*(halfWid-1.8), ry);
    CYL(p[0], yb+1.1, p[1], 0.55, postH, 0, 0x5a4028, 'wood');
  });
  /* peaked shelter roof, centred over the platform */
  CONE(x, yb+1.1+postH, z, Math.max(halfLen,halfWid)*0.80, 5.4, ry, pick(ROOFS));
  /* a plain crossbeam under the roof, tying the 4 posts together */
  BOX(x, yb+1.1+postH-0.3, z, halfLen*1.7, 0.5, halfWid*1.7, ry, 0x4a3520, 'wood');
  /* 3-step stone ramp up from ground level, road-facing side */
  var deckTopY = yb+1.5;
  for(var i=0;i<3;i++){
    var stepY = deckTopY - 2.4 + i*0.8;
    var off = -halfLen - 1.6 - (2-i)*2.1;
    var p2 = loc(x,z, off, 0, ry);
    BOX(p2[0], stepY-0.8, p2[1], 3.4, 0.9, 2.1, ry, shade(col,-0.10));
  }
  /* a small waiting bench under the shelter */
  var benchP = loc(x,z,0,-halfWid*0.55,ry);
  benchPlain(benchP[0], yb+1.5, benchP[1], ry+Math.PI/2, shade(col,-0.15));
}

/* ordered (route order, not registration order) result array, so
   79-striders.js can build Route 1's stop list without having to assume
   registration order in the shared, position-keyed LIFE_STRIDER_STATIONS
   ever matches route order (true today, but only by construction — this
   makes it true by API instead). */
var STRIDER_R1_STATIONS = STRIDER_R1_STATIONS_RAW.map(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  var st = striderRegisterStation(p.x, p.z, ry, p.label);
  striderStationBuild(st);
  return st;
});

/* ============================== eastern nucleus: shrine ====================
   owner: "the easternmost stop will be the nucleus of a manor village.
   place a shrine." The 5 relocated manor buildings themselves are handled
   in 60-land.js (geometry has to be diverted before it's ever drawn — see
   that file's own comment on why "relocate" can't mean "move after the
   fact" here); this is just the shrine, offset sideways from the platform
   (matching the footprint 30-layout.js already reserved for it) so it
   doesn't collide with the station itself. */
(function(){
  var nuc = STRIDER_R1_STATIONS_RAW[5];
  var ry = Math.atan2(nuc.tx, nuc.tz);
  var sp = loc(nuc.x, nuc.z, 4, 34, ry);
  var sy = terrainH(sp[0], sp[1]);
  shrineTriptych(sp[0], sy, sp[1], ry+Math.PI/2, shade(pick(TONES), 0.08), {w:11, d:4});
})();

/* ============================== ELEPHANT BUG STATIONS (Route 2) ===========
   Second route, same station template, same shared registry. Route 2's
   5 interior points — coordinates and road tangents (nearestStreet(),
   sampled live) exactly like Route 1's own list above. Footprints already
   reserved in 30-layout.js's own Route 2 block, same pattern as Route 1's.
   The route's two termini (a big westward nudge for the first one, none
   needed for the second — see 79-striders.js's own STRIDER_R2_TERMINI
   comment for the live terrainH check) get no structure here, same
   distinction as Route 1's termini. */
var STRIDER_R2_STATIONS_RAW = [
  { x:2275.3,  z:-1364.7, tx:1,                    tz:0,                    label:'Route 2 Stop 1' },
  { x:1413.8,  z:-957.1,  tx:-0.20317289800387703, tz:0.9791428769677621,   label:'Route 2 Stop 2' },
  { x:759.2,   z:-411.3,  tx:0.19082757228688982,  tz:-0.9816235722796656,  label:'Route 2 Stop 3' },
  { x:-790.5,  z:-307.4,  tx:0.6686019937136221,   tz:0.7436204502312789,   label:'Route 2 Stop 4' },
  { x:-1751.4, z:-1036.0, tx:-0.7682761317017722,  tz:-0.6401185714048304,  label:'Route 2 Stop 5' }
];

/* every one of these 5 checked live against striderFindStation() before
   building — the whole reason the registry is position-keyed rather than
   route-keyed (its own comment, above): "when placing additional routes,
   if a vertex is on an existing station, incorporate it into the route".
   None of Route 2's 5 points actually land within the registry's snap
   radius of a Route 1 station (Route 1 runs z>~1450, Route 2 runs
   z<~-300 — checked live, not assumed), so in practice every one of these
   registers and builds fresh; the reuse branch below exists so a FUTURE
   route sharing a vertex with either of these two hits it automatically,
   without ever double-building a platform. */
var STRIDER_R2_STATIONS = STRIDER_R2_STATIONS_RAW.map(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  var existing = striderFindStation(p.x, p.z);
  var st = striderRegisterStation(p.x, p.z, ry, p.label);
  if(!existing) striderStationBuild(st);
  return st;
});

/* ============================== ELEPHANT BUG STATIONS (Route 3) ===========
   Third route, same station template, same shared registry — this is the
   whole point of the Route 2 generalization: adding Route 3 is just new
   data plus a call into the same builders. Route 3's 11-point list (owner-
   given) has 9 interior stops; checked live against striderFindStation()
   before writing this list (same discipline Route 2's own comment
   describes), 6 of the 9 land within the registry's snap radius (25 units)
   of an existing Route 1 or Route 2 station — a real, not coincidental,
   vertex-sharing the owner's own stated plan anticipates. The reuse branch
   below (identical to Route 2's) skips rebuilding those 6; only the 3 new
   ones actually construct a platform.

   Stop 9's coordinate is nudged from the owner's raw (212.2,2820.0) to
   (212.2,2500.0) -- the raw point sits past verify.py's built-inside-limit
   ceiling with no farm/manor/shrine nearby to exempt it (checked live);
   see 30-layout.js's own Route 3 reservation block for the full
   reasoning, and 79-striders.js's STRIDER_R3_TERMINI comment for the
   terminus nudges this exact same category of fix already applies to. */
var STRIDER_R3_STATIONS_RAW = [
  { x:2280.8, z:-1356.9, tx:1,                     tz:0,                     label:'Route 3 Stop 1 (shared w/ Route 2 Stop 1)' },
  { x:1416.3, z:-957.1,  tx:-0.20317289800387703,  tz:0.9791428769677621,    label:'Route 3 Stop 2 (shared w/ Route 2 Stop 2)' },
  { x:764.6,  z:-410.6,  tx:0.19082757228688982,   tz:-0.9816235722796656,   label:'Route 3 Stop 3 (shared w/ Route 2 Stop 3)' },
  { x:878.7,  z:182.0,   tx:0.9559034445674892,    tz:-0.2936811275244105,   label:'Route 3 Stop 4' },
  { x:1212.6, z:995.4,   tx:0.537715394629288,     tz:-0.8431264166058784,   label:'Route 3 Stop 5' },
  { x:1187.7, z:1453.9,  tx:0.959769663622615,     tz:0.28078851969005536,   label:'Route 3 Stop 6 (shared w/ Route 1 Stop 4)' },
  { x:795.1,  z:1487.9,  tx:0.9019646069836713,    tz:-0.4318099671716614,   label:'Route 3 Stop 7 (shared w/ Route 1 Stop 3)' },
  { x:111.5,  z:2065.2,  tx:0.217518812610881,     tz:0.9760561285911545,    label:'Route 3 Stop 8 (shared w/ Route 1 Stop 2)' },
  { x:212.2,  z:2500.0,  tx:-0.07124704998790961,  tz:0.997458699830735,     label:'Route 3 Stop 9 (nudged inside CITY_LIM, see comment above)' }
];
var STRIDER_R3_STATIONS = STRIDER_R3_STATIONS_RAW.map(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  var existing = striderFindStation(p.x, p.z);
  var st = striderRegisterStation(p.x, p.z, ry, p.label);
  if(!existing) striderStationBuild(st);
  return st;
});

window._striderStations = LIFE_STRIDER_STATIONS.map(function(s){ return {x:s.x,z:s.z,label:s.label}; });
