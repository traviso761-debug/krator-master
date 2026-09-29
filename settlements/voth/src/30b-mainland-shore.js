/* ============================== 6. THE MAINLAND SHORE ====================== */

/* the curtain wall encloses only the core, north of the river */
function wallOffset(s){
  var u = (s - WALL_S0) / (CITY_S1 - WALL_S0);
  return 470 + 78*Math.sin(u*9.1 + 0.6) + 44*Math.sin(u*17.3 - 1.2);
}
function wallDepth(x,z){                     /* >0 between waterfront and wall */
  var s = shoreS(x,z);
  if(s < WALL_S0 || s > CITY_S1) return -999;
  return wallOffset(s) - landDist(x,z);
}
function insideWall(x,z){ return wallDepth(x,z) > 0; }

/* --- zones along the coast ---------------------------------------------
   core   : inside the wall           warren : outside the wall, same stretch
   estate : south of the river, hugging the shore
   farm   : the floodplain beyond the estates and up the river valley       */
function zoneAt(x,z){
  var L = landDist(x,z);
  if(L < 20) return 'none';
  var s = shoreS(x,z);
  if(s >= WALL_S0 && s <= CITY_S1){
    var wd = wallOffset(s) - L;
    if(wd > 0) return 'core';
    if(wd > -520) return 'warren';
  }
  /* the warren also spills east and south-east of the wall's river corner,
     hugging the river's north bank — same crowded poor district, just not
     reachable by the wall's own arc-length addressing. How densely it builds
     there is a river-distance fade in 60-land.js, not this hard box. */
  if(x > 1400 && x < 2300 && z > 400 && z < 1400) return 'warren';
  /* past five o'clock: great semi-rural estates, then farmland to the south-west */
  if(s >= S_7 && s < S_5){
    if(L < 400) return 'manor';
    if(L < 900) return 'farm';
  }
  if(s >= S_5 && s < WALL_S0){
    if(L < 330) return 'estate';
    if(L < 1050) return 'farm';
  }
  /* past seven o'clock the hills come down to the water: huts on the strand,
     terraced orchards above */
  if(s >= S_10 && s < S_7){
    if(L < 150) return 'shorehut';
    if(L < 520) return 'orchard';
  }
  /* the river valley, east of the mouth */
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  if(rv.d < 760 && rv.t < 0.62 && x > 900) return 'farm';
  return 'none';
}
/* how hard the farmland thins with distance from the city */
function farmFade(x,z){
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  var byRiver = (1 - smooth(0.18, 0.62, rv.t));
  var s = shoreS(x,z);
  var bySW = (s < S_5 && s > S_7) ? (1 - smooth(0.30, 1.0, (S_5 - s)/(S_5 - S_7))) : 0;
  return Math.max(byRiver, bySW) * (1 - smooth(600, 1050, landDist(x,z))*0.5);
}

/* WALL and GATES used to be sampled here off the shore-offset curve
   (shoreIn(s, wallOffset(s))). The owner replaced that with an explicit
   point-designated wall: 17 tower vertices given directly in world (x,z),
   gates only where that line actually crosses a real road. Finding those
   crossings needs the FULL road graph (RNODE/REDGE), which does not exist
   yet at this point in the file — see "NEW CURTAIN WALL" near the end of
   this fragment, after buildRoadGraph()'s final call, where WALL and GATES
   are actually built. wallOffset/wallDepth/insideWall/zoneAt above are
   UNCHANGED and still define the core/warren zoning by arc length — that
   abstract boundary is a separate concept from the physical wall rebuilt
   below and was not part of the owner's request. */

/* --- roads: every polyline is clipped against the river corridor ----------- */
var ROADS = [];
function road(pts, w, cls){
  var run = [];
  for(var i=0;i<pts.length;i++){
    var p = pts[i];
    if(inRiver(p[0],p[1], 30)){ if(run.length > 1) ROADS.push({pts:run, w:w, cls:cls||'minor'}); run = []; }
    else run.push(p);
  }
  if(run.length > 1) ROADS.push({ pts:run, w:w, cls:cls||'minor' });
}
function shoreRoad(s0, s1, off, w, cls, wob, step){
  var p=[];
  for(var s=s0; s<=s1; s+=(step||30)) p.push(shoreIn(s, off + (wob||0)*Math.sin(s*0.0042)));
  road(p, w, cls);
}
/* --- organic wander: replaces a single lateral offset applied across a
   whole road (which is why radial families used to swap order and braid)
   with a small, short-wavelength deviation per resampled node. Amplitude
   this small relative to a 30-unit wavelength cannot flip two roads'
   relative order — "reads organic, cannot swap order" is the whole point. */
function resamplePath(pts, step){
  var out=[pts[0]], acc=0;
  for(var i=1;i<pts.length;i++){
    var ax=pts[i-1][0], az=pts[i-1][1], bx=pts[i][0], bz=pts[i][1];
    var segLen=Math.hypot(bx-ax,bz-az), pos=0;
    while(segLen-pos > step-acc){
      pos += step-acc;
      var t=pos/segLen;
      out.push([ax+(bx-ax)*t, az+(bz-az)*t]);
      acc=0;
    }
    acc += segLen-pos;
  }
  out.push(pts[pts.length-1]);
  return out;
}
function wanderPath(pts, amp, seed){
  var rs = resamplePath(pts, 20);
  var out = [];
  for(var i=0;i<rs.length;i++){
    var pa=rs[Math.max(0,i-1)], pb=rs[Math.min(rs.length-1,i+1)];
    var tx=pb[0]-pa[0], tz=pb[1]-pa[1], tl=Math.hypot(tx,tz)||1;
    var nx=-tz/tl, nz=tx/tl;
    var t = i*20;
    var off = amp * sig(t*0.033 + seed, seed*2.1 - t*0.011, 1);
    out.push([rs[i][0]+nx*off, rs[i][1]+nz*off]);
  }
  return out;
}

reseed(4242);
/* the quay road runs the whole inhabited coast, estates included */
shoreRoad(CITY_S0-120, CITY_S1+90, 32, 21, 'quay');
/* the walled core: streets parallel to the shore, boulevards, cross lanes */
[[96,15],[214,14],[342,14],[0,16]].forEach(function(cfg,i){
  var p=[];
  for(var s=WALL_S0+20; s<=CITY_S1-20; s+=34){
    var off = cfg[0] || (wallOffset(s)-76);
    p.push(shoreIn(s, off + 18*Math.sin(s*0.0042 + i*2.1)));
  }
  road(p, cfg[1], 'ring');
});
/* radial boulevards through the core, reaching out toward the wall — used
   to be one per old shore-derived gate; that array is gone (see "NEW
   CURTAIN WALL" below), but the boulevards themselves are still good
   network infrastructure regardless of where a gate ends up standing, so
   they're kept, now seeded off the same arc-length fractions directly
   rather than through a GATES object. Real wall gates (named or generic)
   are sited later wherever THIS network actually crosses the wall line —
   no separate wiring needed, exactly like the highways' own comment above. */
[0.10,0.27,0.44,0.60,0.76,0.91].forEach(function(u){
  var gs = mix(WALL_S0, CITY_S1, u);
  var gp = shoreIn(gs, wallOffset(gs));
  road([ shoreIn(gs + rr(-24,24), 38), shoreIn(gs + rr(-20,20), 214),
         shoreIn(gs + rr(-14,14), 342), gp,
         shoreIn(gs + rr(-60,60), wallOffset(gs) + 380) ], 19, 'boulevard');
});
(function(){
  /* core cross-lanes: a family of radials off the same shore stretch must
     not cross — each one's OUTER target is assigned first, the targets are
     sorted to match the seed order, and only then are the inner nodes
     interpolated between seed and target. That makes non-crossing a
     property of construction, not a hope; the old version picked one
     lateral drift (up to +-34*2.7 ~= +-92, versus a 62-unit minimum seed
     gap) that let adjacent radials swap order and braid. */
  var seeds = [];
  for(var s=WALL_S0+30; s<CITY_S1-30; s+=rr(62,118)) seeds.push(s);
  var targets = seeds.map(function(s0){ return s0 + rr(-40,40); });
  targets.sort(function(a,b){ return a-b; });
  seeds.forEach(function(s0, idx){
    var starget = targets[idx];
    var pts = [];
    for(var k=0;k<=5;k++){
      var t = k/5, sMid = mix(s0, starget, t);
      pts.push(shoreIn(sMid, mix(34, wallOffset(sMid)-76, t)));
    }
    road(wanderPath(pts, 6, s0*0.13), rr(8.5,12.5), 'minor');
  });
  /* the warren: concentric rings only. The old formal radial fan here (an
     s3 loop with +-80 lateral drift against a 48-unit minimum seed gap) is
     exactly the family that braided worst — deleted, not tuned. Warren
     radials are carved from blocks instead, after the graph exists: see
     "WARREN: BLOCK CARVING" below. */
  [140, 300, 450].forEach(function(extra,i){
    var p=[];
    for(var s2=WALL_S0+50; s2<=CITY_S1-50; s2+=38)
      p.push(shoreIn(s2, wallOffset(s2) + extra));
    road(wanderPath(p, 11, extra*0.7 + i), 10, 'minor');
  });
})();
/* the estates: a shore road, a back lane, and tracks between them */
shoreRoad(CITY_S0-140, WALL_S0, 150, 13, 'ring', 14);
shoreRoad(CITY_S0-100, WALL_S0, 330, 11, 'minor', 22);
(function(){
  var s = CITY_S0 - 60;
  while(s < WALL_S0 - 40){
    road([ shoreIn(s, 34), shoreIn(s+rr(-20,20), 150), shoreIn(s+rr(-40,40), 330),
           shoreIn(s+rr(-70,70), rr(520,760)) ], rr(7,10), 'minor');
    s += rr(90, 170);
  }
})();

reseed(4243);
/* the west road: past the manors, orchard terraces and the promontory shore
   — ground the estates' own network never reached, up to the Lighthouse
   causeway's landing near S_10 */
shoreRoad(S_10-180, CITY_S0-140, 130, 11, 'ring', 20, 34);
shoreRoad(S_10-180, CITY_S0-140, 320, 9, 'minor', 28, 40);
(function(){
  var s = S_10-140;
  while(s < CITY_S0-160){
    var w = rr(-30,30);
    road([ shoreIn(s,34), shoreIn(s+w,130), shoreIn(s+w*1.6,320),
           shoreIn(s+w*2.0, rr(420,600)) ], rr(6.5,9.5), 'minor');
    s += rr(90, 170);
  }
})();

/* the river road, both banks, out along the valley */
(function(){
  [1,-1].forEach(function(side){
    var p=[];
    for(var u=RIVER_HEAD-30; u<2600; u+=110){
      var q = riverAt(u), off = (riverHalf(q.x,q.z) + 48)*side;
      p.push([q.x + q.nx*off, q.z + q.nz*off]);
    }
    road(p, 12, 'minor');
  });
})();

/* ---- highways: long-haul roads reaching off the map, feeding the same
   road graph as every city street (buildRoadGraph() below processes ALL of
   ROADS together, so these get real intersections wherever they happen to
   cross existing roads near the city — no separate wiring needed) but
   deliberately NOT given their own side-street/block-carving treatment out
   in the wilderness, per the owner: "connect the roads into the road graph
   for the sake of the life layer later, but no need to extend side streets
   off these except maybe right next to the city." Nothing below adds a
   grid off of them; only the existing city network can meet them.

   Six, per the brief: NE hugs the lake shore (reusing shoreIn() exactly
   like the estate/west-road shore roads above, so it traces the real
   coastline at a fixed inset; "the low spot between hills" the owner asked
   for it to route through falls out of that for free, since every RIDGES
   entry sits set back from the shoreline, never on it); one runs south,
   one southwest, and one follows the river's own corridor east/southeast
   rather than striking out past it — checked by sampling terrainH first: a
   naive straight extension past the river's own last point climbs from
   h=-5 to h=213 in under 700 units (the hills that begin inland of the
   city, per terrainH()'s own comment, are right there), while 10-core.js
   keeps the river's floodplain deliberately flat, so hugging the river
   corridor instead of leaving it is what actually stays low. The last two,
   NW and NW: Abbey Close, replace the old shoreRoad(0,S_10-180,...) shore
   hug entirely — the owner gave two explicit point lists for "the
   northwest highway" across two follow-up messages and asked for the
   lowest-elevation path THROUGH them, not the old coast-hugging arc, so
   the compass label stays but the geography underneath it is new. See the
   comments on each road() call below for exactly how each was routed and
   why they're two separate calls rather than one polyline: the two point
   lists sit on opposite sides of the city (list 1 near the port/quay on
   the east shore, list 2 out at Abbey Close on the west shore) with no
   through-line the brief asks for ("no need to extend side streets off
   these except maybe right next to the city" — a cross-city bridge between
   them would be exactly that kind of unwanted extension), so each stretch
   just gets its own tie-in to the city grid instead, same as every other
   highway here. */
reseed(424242);
/* NE and SW/West: actually pathfound now, not hand-picked waypoints —
   the previous pass (shore-inset tweak, then a manually-drawn detour
   around one ridge) still wasn't good enough per the owner's follow-up.
   Built a proper lowest-elevation search instead: fetched a terrain-
   height grid (NE: parametrized by shore arc-length x inland offset,
   staying in a "hug the coast" corridor; SW: a plain x/z grid over the
   open country west of the city, no corridor assumption) via a one-shot
   probe against window._api.terrainH/landDist, then ran Dijkstra over it
   (multi-source from the city-adjacent edge, multi-sink at the far edge,
   underwater cells excluded, cost = average height of each hop) in a
   scratch Python script — not eyeballed, not guessed. Worst point on the
   whole NE route: h=14 (was spiking to 185 two passes ago). Worst point
   on the whole SW route within the kept range: h=65 (was 181). */
road([[1958,-1142],[2312,-1504],[2475,-1981],[2401,-2483],[2238,-2954],[2140,-3444],[1953,-3913],[1637,-4308],[1246,-4615],[1252,-5067]], 14, 'highway'); /* NE */
road([[300,1900],[250,2600],[150,3400],[60,3900]], 14, 'highway');   /* S */
/* the owner: "the west road does not connect to the street grid" — real
   gap, confirmed directly (not guessed): queried nearestStreet() from
   [-1180,2310] against every real city class (core/warren/boulevard/
   minor/ring/estate/manor, i.e. everything BUT this highway itself) on
   a live build and got 117.7 units to the nearest actual street — this
   segment's own city-end point just never crossed anything. Can't call
   nearestStreet() here to fix it live: the road graph (NSGRID/REDGE,
   built from the complete ROADS array) doesn't exist yet at this point
   in the file — the highways are laid down before the network they'd
   need to query is built. Same one-shot-probe methodology as the
   NE/SW pathfinding above (measured on the real build, not eyeballed):
   that nearest point was [-1129.3, 2203.8], a 'minor' warren street —
   prepended so this segment actually crosses into the grid instead of
   stopping short of it. */
road([[-1129.3,2203.8],[-1180,2310],[-1540,2310],[-1810,2310],[-2080,2130],[-2440,1770],[-2800,1590],[-3070,1590],[-3340,1590]], 14, 'highway'); /* SW/West */
(function(){                                                          /* E/SE, the river's south bank */
  var pts = [];
  for(var u=2600; u<=RIVER_CUM[RIVER_CUM.length-1]; u+=120){
    var q = riverAt(u), off = riverHalf(q.x,q.z) + 130;
    pts.push([ q.x - q.nx*off, q.z - q.nz*off ]);
  }
  road(pts, 14, 'highway');
})();
/* NW: the owner's own point list ("place a new northwest highway along
   these points going off map... follow the lowest elevation path between
   points"), pathfound the same way as NE/SW above — a plain x/z terrain-
   height grid per consecutive pair (no corridor assumption; this stretch
   runs inland through the RIDGES hills north-east of the port, nowhere
   near the shore) via the one-shot window._api.terrainH/landDist probe,
   Dijkstra'd (cost = average height of each hop, underwater cells
   excluded), then simplified. Checked against a plain straight line
   between each of the owner's own waypoints too: this terrain is
   genuinely hilly and dense with RIDGES entries the whole way (unlike the
   NE/SW passes, there was no nearby valley to detour into), so the gain
   over a straight line is real but modest — worst point on the whole
   route: h=237 (a straight line between the same waypoints: h=241).
   The owner's own last point, [1823.9,-1067.1], is the city-adjacent end
   — checked live the same way the SW/West gap above was: nearestStreet()
   from there found a 'quay' road only 69.7 units off at [1763.7,-1032.0],
   not an actual crossing, so that point is prepended to make sure this
   one actually ties into the grid instead of dead-ending near it. */
road([[1763.7,-1032.0],[1823.9,-1067.1],[2010,-1165.6],[2220,-1410.6],[2325,-1410.6],[2640,-1095.6],[2731.6,-1106.7],[2921.6,-951.7],[3361.6,-959],[3571.6,-1169],[3627,-1249.8],[3627,-1424.8],[3907,-1739.8],[3894.1,-2300.1],[3946.6,-2339.3],[3959.8,-3581.8]], 14, 'highway'); /* NW */
/* NW: Abbey Close — the owner's follow-up: "reroute northwest highway
   over the abbey close similarly per these points." This stretch sits on
   the opposite (west) shore from the NW route above, right where the old
   shoreRoad(0,S_10-180,...) used to run — that arc is what "similarly"
   refers back to and what this replaces for this stretch; see the
   district-paint fix in 40-ground.js for why it "is not currently
   visible" (the owner's own words) even though a highway has been running
   through here all along. Same probe+Dijkstra methodology as NW above,
   but the whole area is close to the lake and nearly flat (h~2-4
   everywhere sampled), so there wasn't a meaningfully lower path to find
   — worst point on the whole route: h=4.2, right at the owner's own first
   point. Both ends checked live against nearestStreet() (excluding the
   highway class itself, since that's the old arc being replaced): real
   gaps of 136 and 357 units to the nearest 'minor'/'ring' streets — this
   stretch is genuinely off on its own out at the Close, nothing else
   nearby to butt up against — so both nearestStreet() points are
   prepended/appended the same way, rather than leaving either end
   dead-ending in the park. */
road([[-1319.4,-525.3],[-1367.9,-652.7],[-1247.9,-652.7],[-1187.9,-622.7],[-1161.3,-589.5],[-1071.3,-544.5],[-1048.7,-513.1],[-913.7,-453.1],[-842.4,-373.8],[-1183.0,-267.8]], 14, 'highway'); /* NW: Abbey Close */
/* NW: Abbey Close extension — the owner's follow-up: "extend NW highway
   from [-1367.5,-649.6] to the edge of the map following lowest
   elevation, but leaving house sized buffer between highway and lake."
   [-1367.5,-649.6] matches this same segment's own 2nd point above
   (-1367.9,-652.7, rounding) — the "loose" end that never continued
   anywhere past the Close itself. Same probe methodology as the other
   highways (window._api.terrainH/landDist, sampled live against the real
   build): fanned out headings 200-260 degrees from that point checking
   both worst elevation AND landDist staying above a 25-unit buffer the
   whole way (a real house footprint, not a guessed margin) — most
   headings past ~222 degrees cut the buffer at some point along the way
   (curve back toward the shore) or climb into much higher hill country;
   200-220 degrees all cleared the buffer everywhere, and 220 was the
   lowest of those (worst point h=157, vs. h=184-197 for 200-215). A
   straight run, not a curve — the whole corridor at this heading is
   already close to monotonically low, nothing to route around. Stops at
   r=3600 along that heading, (-4125.3,-2963.6): total distance from world
   centre ~5079, safely inside HW (WORLD/2=5400) without crowding the
   actual edge. */
road([[-1367.5,-649.6],[-1827.1,-1035.3],[-2133.5,-1292.4],[-2746.4,-1806.6],[-3206.0,-2192.3],[-3665.6,-2578.0],[-4125.3,-2963.6]], 14, 'highway'); /* NW: Abbey Close extension */

