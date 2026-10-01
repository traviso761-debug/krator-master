/* ============================== the strider's own nav grid + A* ============
   WHY THIS EXISTS. The first pass at water routing offered the router one
   alternative to the road: the straight line A->B, refined by splicing a
   correction point wherever a sample went wrong. That recovers a leg whose
   straight line is already nearly clean, and nothing else — a single
   spliced waypoint cannot get a curve around a building that sits near an
   otherwise perfectly wadeable shoreline. Measured: of the 18 legs that
   kept their road, 15 were refused with directBlocked = 'built', at
   detours up to 2.82x. Those are the fords this grid is here to recover.

   WHY IT IS NOT lifeNavBuildGrid's. Two reasons, both hard:
     1. The passability rules are inverted. lifeNavBlocked's FIRST line is
        `terrainH > -1.5 -> blocked`: it is a grid for boats, on which all
        land is wall. A strider needs the opposite — land open, water open
        down to STRIDER_WADE_MAX, only water DEEPER than that closed.
     2. It does not reach. LIFE_NAV_MINX/MAXX are +-2850; Route 1's eastern
        terminus is at x 3712 and Route 2's western one at x -3755, both
        well outside it.
   And lifeNavAStar/lifeNavLOSClear/lifeNavSimplify (78-life.js) read
   LIFE_NAV_GRID / LIFE_NAV_W / lifeNavBlocked as module globals — there is
   no grid parameter to pass, so they cannot be pointed at a different
   occupancy without editing that file, which belongs to another agent.
   Reported rather than forked blindly: what IS reused by direct call is
   LifeNavHeap (the binary min-heap, and the reason ferry routing stopped
   hanging) and LIFE_NAV_NEI (the 8-neighbour table). The ~20-line search
   loop below is the part that genuinely has to be local. */
var STRIDER_NAV_CELL = 26;      /* same as LIFE_NAV_CELL: about one canal width, and the strider needs a 24-wide gap anyway */
var STRIDER_NAV_MINX = -4000, STRIDER_NAV_MAXX = 4000;
var STRIDER_NAV_MINZ = -4000, STRIDER_NAV_MAXZ = 4000;   /* covers every stop and terminus of all three routes, with ~250 to spare */
var STRIDER_NAV_W = Math.ceil((STRIDER_NAV_MAXX-STRIDER_NAV_MINX)/STRIDER_NAV_CELL);
var STRIDER_NAV_H = Math.ceil((STRIDER_NAV_MAXZ-STRIDER_NAV_MINZ)/STRIDER_NAV_CELL);
function striderNavCellCenter(cx,cz){ return [STRIDER_NAV_MINX+(cx+0.5)*STRIDER_NAV_CELL, STRIDER_NAV_MINZ+(cz+0.5)*STRIDER_NAV_CELL]; }
function striderNavWorldToCell(x,z){ return [Math.floor((x-STRIDER_NAV_MINX)/STRIDER_NAV_CELL), Math.floor((z-STRIDER_NAV_MINZ)/STRIDER_NAV_CELL)]; }
/* the whole passability rule in one place, so the grid, the line-of-sight
   test and the final validity check cannot drift apart. Ordered cheapest
   first: terrainH settles the great majority of the 94,000 cells (open
   hill country and deep bay) before any spatial hash or segment loop runs. */
function striderNavBlocked(x,z){
  var h = terrainH(x,z);
  if(h > STRIDER_HILL_MAX) return true;
  if(striderOnDeck(x,z)) return false;      /* a real deck is passable whatever is under it */
  if(h < -STRIDER_WADE_MAX) return true;    /* too deep to stand in — the ONLY water that blocks */
  return striderSolidAt(x,z);               /* gridHit, cantons, chinampas, piers, pylons, moored ships */
}
/* THE OCCUPANCY GRID IS LAZY, and the split below is the whole reason it
   can be. Building it costs ~1.4s, essentially all of it terrainH over
   217,000 sample points, and it bought no route the straight-line
   candidate did not already find (see the A/B in window._striders.navAbTest
   — 23 of 23 legs identical with the A* candidate in the chooser and
   without it). So striderBuildLeg no longer consults it, and nothing on
   the load path touches it: it is built on FIRST USE, by the diagnostics
   that actually need it (nav(), navPath(), legStats()'s nav fields). Until
   someone asks, nav().buildMs reads 0 and the array does not exist.
   The ROAD MASK is the exception and stays eager, because it is consulted
   by striderBadSample on every leg the router builds — and it is nearly
   free: one walk along 2,616 graph edges with no terrainH in it at all. */
var STRIDER_NAV_GRID = null;
var STRIDER_NAV_BUILD_MS = 0;       /* obstacle grid, 0 until first use */
var STRIDER_NAV_ROAD_MS = 0;        /* road mask, paid at load */
/* THE STREETS ARE PASSABLE, and this mask is why the grid works at all.
   First build of it did not have one, and 12 of 23 legs came back
   'no-nav-path' — A* could not find ANY route, which looked like a bug and
   was not. gridHit blocks every cell within STRIDER_CLEAR of a claim()ed
   footprint, and a warren block's buildings stand ~20-30 apart, so the
   whole built fabric rasterises as one solid wall and a station inside the
   city becomes an island with no open cell connected to anything. The road
   graph is exactly the structure that gets through that wall — the same
   RNODE/REDGE lifeRoadPath walks — so it is rasterised into the grid as
   guaranteed-open, and a street is then forgiven by the obstacle test the
   same way a bridge deck already is. Cheap: one walk along 2,616 edges,
   not a per-cell query. */
var STRIDER_NAV_ROAD = new Uint8Array(STRIDER_NAV_W*STRIDER_NAV_H);
(function(){
  var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
  function paint(x,z){
    var c = striderNavWorldToCell(x,z);
    if(c[0]<0 || c[1]<0 || c[0]>=STRIDER_NAV_W || c[1]>=STRIDER_NAV_H) return;
    STRIDER_NAV_ROAD[c[1]*STRIDER_NAV_W+c[0]] = 1;
  }
  REDGE.forEach(function(e){
    var A = RNODE[e.a], B = RNODE[e.b];
    var L = Math.hypot(B.x-A.x, B.z-A.z), steps = Math.max(1, Math.ceil(L/(STRIDER_NAV_CELL*0.5)));
    for(var s=0; s<=steps; s++){ var t=s/steps; paint(A.x+(B.x-A.x)*t, A.z+(B.z-A.z)*t); }
  });
  STRIDER_NAV_ROAD_MS = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : 0) - t0;
})();
function striderOnRoad(x,z){
  var c = striderNavWorldToCell(x,z);
  if(c[0]<0 || c[1]<0 || c[0]>=STRIDER_NAV_W || c[1]>=STRIDER_NAV_H) return false;
  return !!STRIDER_NAV_ROAD[c[1]*STRIDER_NAV_W+c[0]];
}
/* passable = a real street, or ground that no obstacle rule objects to. */
function striderNavPassable(x,z){ return striderOnRoad(x,z) || !striderNavBlocked(x,z); }
/* A cell is open only if its CENTRE AND ITS FOUR EDGE MIDPOINTS are all
   passable. Sampling the centre alone is not enough here and the failure
   is specific, not theoretical: the cell is 26 across and the strider's
   own clearance is 12, so an obstacle can sit squarely in the 26-unit gap
   between two adjacent open cell centres and be invisible to both. That is
   exactly what happened on R3/L5 — A* ran a corridor straight down x=1239
   through cells at z=1213 and z=1239, and the finished curve was rejected
   at (1239,1227), a point 12 from a chinampa bed, forever, with no way for
   the refinement to fix it. An edge midpoint IS the midpoint between two
   4-adjacent centres, so testing the four of them closes every gap the
   search can actually step through. (lifeNavBlocked gets away with centres
   alone because its clearance is 6 against the same 26-unit cell.) */
function striderNavGrid(){
  if(STRIDER_NAV_GRID) return STRIDER_NAV_GRID;
  var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
  var g = new Uint8Array(STRIDER_NAV_W*STRIDER_NAV_H);
  var cx, cz, i, HC = STRIDER_NAV_CELL*0.5;
  for(cz=0; cz<STRIDER_NAV_H; cz++){
    for(cx=0; cx<STRIDER_NAV_W; cx++){
      var p = striderNavCellCenter(cx,cz);
      var blocked = striderNavBlocked(p[0],p[1]) ||
                    striderNavBlocked(p[0]+HC,p[1]) || striderNavBlocked(p[0]-HC,p[1]) ||
                    striderNavBlocked(p[0],p[1]+HC) || striderNavBlocked(p[0],p[1]-HC);
      g[cz*STRIDER_NAV_W+cx] = blocked ? 1 : 0;
    }
  }
  for(i=0;i<g.length;i++) if(STRIDER_NAV_ROAD[i]) g[i] = 0;
  STRIDER_NAV_BUILD_MS = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : 0) - t0;
  STRIDER_NAV_GRID = g;
  return g;
}
/* a stop sits inside its own reserved footprint, so its cell is blocked by
   construction — spiral out to the nearest open one, same as
   lifeNavNearestOpen does for a dock on a canton edge. */
function striderNavNearestOpen(g, cx,cz){
  if(cx>=0 && cz>=0 && cx<STRIDER_NAV_W && cz<STRIDER_NAV_H && !g[cz*STRIDER_NAV_W+cx]) return [cx,cz];
  for(var r=1; r<12; r++){
    for(var dz=-r; dz<=r; dz++){
      for(var dx=-r; dx<=r; dx++){
        if(Math.max(Math.abs(dx),Math.abs(dz)) !== r) continue;
        var ncx=cx+dx, ncz=cz+dz;
        if(ncx<0||ncz<0||ncx>=STRIDER_NAV_W||ncz>=STRIDER_NAV_H) continue;
        if(!g[ncz*STRIDER_NAV_W+ncx]) return [ncx,ncz];
      }
    }
  }
  return null;
}
/* 8-connected A*, Euclidean heuristic, LifeNavHeap for the open set.
   Edge cost is plain DISTANCE, deliberately: the first version charged
   water at 1/0.75 to mirror striderLegProfile, and the search promptly
   started hugging the bank to dodge the very ford it exists to find —
   R1/L5 lost 78 of its 129 wet samples to a longer, drier line that was
   marginally quicker. Finding the natural line and judging what it costs
   are two different jobs: A* finds it, striderLegProfile prices it, and
   STRIDER_ROAD_TOLERANCE decides whether the road still wins. */
function striderNavAStar(ax,az,bx,bz){
  var G = striderNavGrid();          /* builds the occupancy grid on first use */
  var W = STRIDER_NAV_W, H = STRIDER_NAV_H;
  var s0 = striderNavWorldToCell(ax,az), g0 = striderNavWorldToCell(bx,bz);
  s0 = [Math.max(0,Math.min(W-1,s0[0])), Math.max(0,Math.min(H-1,s0[1]))];
  g0 = [Math.max(0,Math.min(W-1,g0[0])), Math.max(0,Math.min(H-1,g0[1]))];
  var start = striderNavNearestOpen(G, s0[0],s0[1]), goal = striderNavNearestOpen(G, g0[0],g0[1]);
  if(!start || !goal) return null;
  var startI = start[1]*W+start[0], goalI = goal[1]*W+goal[0];
  if(startI === goalI) return [[ax,az],[bx,bz]];
  var n = W*H;
  var gScore = new Float32Array(n).fill(Infinity);
  var cameFrom = new Int32Array(n).fill(-1);
  var closed = new Uint8Array(n);
  gScore[startI] = 0;
  var heap = new LifeNavHeap();
  heap.push(startI, Math.hypot(goal[0]-start[0], goal[1]-start[1]));
  var iter = 0, iterCap = 90000;
  while(heap.a.length && iter++ < iterCap){
    var current = heap.pop()[0];
    if(closed[current]) continue;
    if(current === goalI) break;
    closed[current] = 1;
    var ccx = current % W, ccz = (current-ccx)/W;
    for(var ni=0; ni<8; ni++){
      var ncx = ccx+LIFE_NAV_NEI[ni][0], ncz = ccz+LIFE_NAV_NEI[ni][1];
      if(ncx<0||ncz<0||ncx>=W||ncz>=H) continue;
      var nIdx = ncz*W+ncx;
      if(closed[nIdx] || G[nIdx]) continue;
      var tentG = gScore[current] + LIFE_NAV_NEI[ni][2];
      if(tentG < gScore[nIdx]){
        cameFrom[nIdx] = current;
        gScore[nIdx] = tentG;
        heap.push(nIdx, tentG + Math.hypot(goal[0]-ncx, goal[1]-ncz));
      }
    }
  }
  if(cameFrom[goalI] === -1) return null;
  var path = [], cur = goalI;
  while(true){
    var cx = cur % W, cz = (cur-cx)/W;
    path.push(striderNavCellCenter(cx,cz));
    if(cur === startI) break;
    cur = cameFrom[cur];
    if(cur < 0) return null;
  }
  path.reverse();
  path.unshift([ax,az]);
  path.push([bx,bz]);
  return path;
}
/* greedy line-of-sight simplification, sampled at half a cell — the same
   any-angle post-process lifeNavSimplify uses, and for the same measured
   reason: keeping "every Nth cell" lets the smoothing curve arc straight
   through the blocked material between the kept points. MAXSKIP is kept
   deliberately SHORTER than lifeNavSimplify's 700 because a long
   collapsed segment leaves the Catmull-Rom free to bulge between two
   distant control points, which is exactly what the final validity check
   then rejects; more, closer waypoints cost nothing at load and keep the
   curve near the verified line. */
function striderNavLOSClear(ax,az,bx,bz){
  var d = Math.hypot(bx-ax, bz-az);
  /* quarter of a cell, not half: at half-cell (13 units) a chinampa bed
     edge can sit between two consecutive samples and a segment passes a
     line-of-sight test it should have failed, which then shows up as an
     invalid finished curve with no obvious cause. */
  var steps = Math.max(1, Math.ceil(d/(STRIDER_NAV_CELL*0.25)));
  for(var i=0;i<=steps;i++){
    var t = i/steps;
    if(!striderNavPassable(ax+(bx-ax)*t, az+(bz-az)*t)) return false;
  }
  return true;
}
/* longest control-point gap the smoothing curve is trusted over. 140 was
   not tight enough: R3/L5's A* route (522 units against the road's 1,293,
   21% of it genuinely wading — the best single ford left in the city) came
   back invalid because the Catmull-Rom bowed a few units off its own
   verified polyline and caught a chinampa bed edge. 60 is under half a
   grid cell, so the curve is pinned to within a fraction of the clearance
   the obstacle tests already demand, and costs nothing but load-time
   arithmetic. */
var STRIDER_NAV_DENSE = 60;
function striderNavSimplify(path){
  var MAXSKIP = 320;
  var out = [path[0]], i = 0;
  while(i < path.length-1){
    var farthest = i+1;
    for(var k=i+1; k<path.length; k++){
      if(Math.hypot(path[k][0]-path[i][0], path[k][1]-path[i][1]) > MAXSKIP) break;
      if(striderNavLOSClear(path[i][0],path[i][1], path[k][0],path[k][1])) farthest = k;
    }
    out.push(path[farthest]);
    i = farthest;
  }
  /* re-densify: split any surviving segment longer than STRIDER_NAV_DENSE
     at its own midpoint. The segment is already line-of-sight verified, so
     its midpoint is passable by construction — this adds no risk and costs
     nothing at load, and it is what stops the Catmull-Rom from bowing out
     of the verified corridor between two distant control points. Collinear
     control points give a curve that is very nearly the straight line they
     lie on; the bulge was what failed the final validity check on six legs
     whose A* route was itself perfectly good. */
  var dense = [out[0]];
  for(var j=1; j<out.length; j++){
    var a = out[j-1], b = out[j];
    var L = Math.hypot(b[0]-a[0], b[1]-a[1]);
    var n = Math.floor(L/STRIDER_NAV_DENSE);
    for(var k=1; k<=n; k++){
      var t = k/(n+1);
      dense.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]);
    }
    dense.push(b);
  }
  return dense;
}

/* ---- routing.
   What this used to be: `lifeRoadPath` first, and the whole leg built from
   road-graph nodes whenever it returned anything — with the water-avoidance
   branch dropped from the refinement loop as the "striders may wade"
   concession. That concession achieved nothing measurable, because the road
   graph is land-only (plus bridge/causeway edges), so road-following ALREADY
   guaranteed a dry route and the dropped branch never had anything to drop.
   Measured over all 23 legs, 4,623 samples: 3.1% genuine swim, deepest real
   wade about a metre, and detour ratios up to 5.3x arc-vs-straight where a
   leg went hunting for a bridge.

   What it is now: BOTH candidates get built — the road-following one and a
   direct, water-permitting one — and the cheaper one wins, where "cheaper"
   is real travel TIME, not raw length: arc length with the wet fraction
   charged at the 1/0.75 the update loop below actually slows to in water.
   So a bridge detour is taken exactly when it is genuinely faster than
   fording (a short hop across a deep, narrow channel), and refused when it
   is not (a 40%+ swing to find a crossing a creature with 13.5-unit legs
   could simply have walked through). The direct candidate is refined
   against hills, against water deeper than STRIDER_WADE_MAX, and against
   every solid obstacle above; if it cannot be made valid it is discarded
   and the road path stands. */
function striderRefineRoad(waypoints){
  for(var round=0; round<16; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var bad=null, badFix=null, badSeg=0;
    for(var s=1; s<80; s++){
      var st = s/80, p = curve.getPointAt(st), h = terrainH(p.x,p.z);
      if(h > STRIDER_HILL_MAX){ bad=st; badFix=lifePushToLowGround(p.x,p.z,STRIDER_HILL_MAX); }
      if(bad!==null){ badSeg = Math.max(1, Math.min(waypoints.length-1, Math.round(st*(waypoints.length-1)))); break; }
    }
    if(bad===null) break;
    waypoints.splice(badSeg, 0, badFix);
  }
  return lifeCurveFromLandCentripetal(waypoints);
}
/* sample density and round count scale with the leg's real length, the same
   way lifeCartBuildLeg's already do and for the same measured reason — a
   fixed 80 samples over a 2,000-unit leg steps clean over a channel. */
/* a stop stands in the middle of its own reserved footprint, and an
   interior station's platform is itself a claim()ed record in the same
   grid — so the last stride into a stop necessarily "hits" something. The
   solid test is therefore suspended within this radius of either end of a
   leg; the depth and hill tests are not. */
var STRIDER_ENDPOINT_FREE = 90;
var STRIDER_BAD_WHY = null;   /* why the last striderBadSample rejected — diagnostic only */
function striderBadSample(p, ax,az, bx,bz){
  var h = terrainH(p.x,p.z);
  if(Math.hypot(p.x-ax,p.z-az) < STRIDER_ENDPOINT_FREE) return null;
  if(Math.hypot(p.x-bx,p.z-bz) < STRIDER_ENDPOINT_FREE) return null;
  if(h > STRIDER_HILL_MAX){ STRIDER_BAD_WHY = ['hill',p.x|0,p.z|0,+h.toFixed(1)]; return lifePushToLowGround(p.x,p.z,STRIDER_HILL_MAX); }
  if(striderOnDeck(p.x,p.z)) return null;
  if(h < -STRIDER_WADE_MAX){ STRIDER_BAD_WHY = ['deep',p.x|0,p.z|0,+h.toFixed(1)]; return striderPushToWadeable(p.x,p.z); }
  /* a real street is passable, for the same reason a bridge deck is: the
     obstacle rules below cannot tell a 26-unit lane between two houses from
     the houses themselves, and every cart in the city uses that lane. */
  if(striderOnRoad(p.x,p.z)) return null;
  if(gridHit(p.x,p.z,STRIDER_CLEAR)){ STRIDER_BAD_WHY = ['built',p.x|0,p.z|0,0]; return striderPushClear(p.x,p.z); }
  if(striderSolidAt(p.x,p.z)){ STRIDER_BAD_WHY = ['solid',p.x|0,p.z|0,0]; return striderPushClear(p.x,p.z); }
  return null;
}
/* where to splice a correction point. This used to be
   round(t * (waypoints.length-1)) — arc-fraction mapped onto waypoint
   index, which is only right when the waypoints are evenly spaced, i.e.
   when there are exactly two of them. Feed it an A* path of fifteen
   irregular waypoints and it drops the fix in a segment nowhere near the
   problem, and the refinement loop thrashes until it runs out of rounds
   and the leg is thrown away as invalid. Asking which SEGMENT the bad
   point actually lies against costs one lifeSegDist per waypoint and is
   simply correct. */
function striderInsertAt(waypoints, px, pz){
  var best = 1, bestD = Infinity;
  for(var i=0; i<waypoints.length-1; i++){
    var d = lifeSegDist(px,pz, waypoints[i][0],waypoints[i][1], waypoints[i+1][0],waypoints[i+1][1]);
    if(d < bestD){ bestD = d; best = i+1; }
  }
  return Math.max(1, Math.min(waypoints.length-1, best));
}
function striderRefine(waypoints, ax,az,bx,bz){
  var legLen = Math.hypot(bx-ax, bz-az);
  var SAMPLES = Math.max(80, Math.min(260, Math.round(legLen/28)));
  var ROUNDS  = Math.max(16, Math.min(34, Math.round(legLen/220)));
  for(var round=0; round<ROUNDS; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var bad=null, badFix=null, badSeg=0, lastBadX=0, lastBadZ=0;
    for(var s=1; s<SAMPLES; s++){
      var st = s/SAMPLES, p = curve.getPointAt(st);
      badFix = striderBadSample(p, ax,az, bx,bz);
      if(badFix){ bad=st; lastBadX=p.x; lastBadZ=p.z; badSeg = striderInsertAt(waypoints, p.x, p.z); break; }
    }
    if(bad===null) break;
    /* a "fix" that is the bad point itself is what every push helper
       returns when its ring search finds nothing — splicing it in makes
       the next round find the same sample again and the loop burns its
       remaining rounds achieving nothing. Stop instead, and let
       striderLegValid reject the candidate honestly. */
    if(Math.hypot(badFix[0]-lastBadX, badFix[1]-lastBadZ) < 0.5) break;
    waypoints.splice(badSeg, 0, badFix);
  }
  return lifeCurveFromLandCentripetal(waypoints);
}
/* candidate 2: the straight line, nudged. Optimal when it works (ratio
   1.00) and useless when a footprint sits on the line — which is exactly
   what candidate 3 is for. */
function striderRefineDirect(ax,az,bx,bz){
  return striderRefine([[ax,az],[bx,bz]], ax,az,bx,bz);
}
/* candidate 3: a real route over the strider's own passability grid.
   Returns null when A* finds nothing at all, so the caller can report
   'no-nav-path' instead of shipping something it invented. */
function striderRefineNav(ax,az,bx,bz){
  var path = striderNavAStar(ax,az,bx,bz);
  if(!path || path.length < 2) return null;
  return striderRefine(striderNavSimplify(path), ax,az,bx,bz);
}
/* does this curve actually respect the rules? A refinement loop that runs
   out of rounds must not be allowed to ship a plausible-but-wrong route —
   the same reason lifeNavBuildLeg's silent straight-line fallback had to
   go. */
function striderLegValid(curve, ax,az, bx,bz){
  STRIDER_BAD_WHY = null;
  for(var i=0;i<=160;i++){
    if(striderBadSample(curve.getPointAt(i/160), ax,az, bx,bz)) return false;
  }
  STRIDER_BAD_WHY = null;
  return true;
}
/* what a candidate actually costs, and how wet it actually is.
     cost — travel TIME in arc-length units: the slow fraction is charged at
            1/0.75 of its own length, because that is exactly what
            updateStriders below charges for it (terrainH < 2).
     slow — that same terrainH < 2 fraction. NOTE it is a shoreline test,
            not a water test: SEA is 0, so a sample at terrainH 1.9 is dry
            beach. Kept because it is what the speed rule uses.
     ford — the fraction genuinely BELOW the waterline with no deck under
            it. This is the one that means "the creature is in the water",
            and it is what the choice rule below requires before it will
            abandon a road. */
function striderLegProfile(curve){
  var len = curve.getLength(), slow = 0, ford = 0, N = 80;
  for(var i=0;i<=N;i++){
    var p = curve.getPointAt(i/N), h = terrainH(p.x,p.z);
    if(h < 2 && !striderOnDeck(p.x,p.z)){ slow++; if(h < SEA) ford++; }
  }
  return { len: len, slowFrac: slow/(N+1), fordFrac: ford/(N+1),
           cost: len * (1 + (slow/(N+1))*(1/STRIDER_WADE_SPEED - 1)) };
}
/* the direct candidate has to be a genuine FORD before it is allowed to
   displace a road. Without this clause the same machinery would also start
   cutting dry corners across farmland wherever a road happened to bend more
   than the tolerance — a second, larger behaviour change nobody asked for,
   and one the road graph exists precisely to prevent. Two samples out of
   81, so a curve that merely clips a waterline on a bend does not qualify. */
var STRIDER_MIN_FORD = 2/81;
/* THE DECISION RULE, in one function so it can be replayed. Given the road
   candidate and up to two ford candidates it answers which leg ships and
   why. Factored out precisely so window._striders.navAbTest can run it
   twice per leg — once with the A* candidate offered and once without —
   and prove the shipped route is the same either way, instead of that
   being an argument. */
function striderChoose(hasRoad, roadProf, directOK, directProf, navOK, navProf){
  var fordProf = null, fordFrom = null;
  if(directOK){ fordProf = directProf; fordFrom = 'straight'; }
  if(navOK && (!fordProf || navProf.cost < fordProf.cost)){ fordProf = navProf; fordFrom = 'astar'; }
  var roadCost = hasRoad ? roadProf.cost : Infinity;
  var why;
  if(!fordProf) why = 'road-only-valid';
  else if(fordProf.fordFrac < STRIDER_MIN_FORD) why = 'road-no-ford-to-gain';
  else if(roadCost > fordProf.cost*STRIDER_ROAD_TOLERANCE) why = 'ford-' + fordFrom;
  else why = 'road-within-tolerance';
  var useFord = (why.indexOf('ford-') === 0) || !hasRoad;
  if(!hasRoad && why.indexOf('ford-') !== 0) why = 'no-road-path';
  return { why: why, fordFrom: useFord ? fordFrom : null, useFord: useFord };
}
var STRIDER_LEG_CHOICE = [];   /* per-leg audit, read by window._striders.legStats */
/* Two candidates on the load path, not three. The A* candidate
   (striderRefineNav) is deliberately NOT built here: it costs ~1.4s of
   occupancy grid and, measured across all 23 legs, changed the shipped
   route on none of them — 13 of the 16 legs where it produced a valid
   route had fordFrac 0.000, i.e. once you get round the building the
   shorter line is simply dry. It stays available on demand through
   window._striders.navPath / legStats / navAbTest, where whoever is
   diagnosing a moved station or a new route can pay for it knowingly.
   navAbTest re-runs striderChoose both ways and is the standing proof
   that dropping it from here changes nothing. */
function striderBuildLeg(ax,az,bx,bz){
  var path = lifeRoadPath(ax,az,bx,bz);
  var roadCurve = null, roadProf = null;
  if(path){
    var waypoints = [[ax,az]];
    path.forEach(function(ni){ var n=RNODE[ni]; waypoints.push([n.x,n.z]); });
    waypoints.push([bx,bz]);
    roadCurve = striderRefineRoad(waypoints);
    roadProf = striderLegProfile(roadCurve);
  }
  var directCurve = striderRefineDirect(ax,az,bx,bz);
  var directOK = striderLegValid(directCurve, ax,az, bx,bz);
  var directBad = directOK ? null : STRIDER_BAD_WHY;
  var directProf = striderLegProfile(directCurve);

  var d = striderChoose(!!roadCurve, roadProf, directOK, directProf, false, null);
  var chosen = d.useFord ? directCurve : roadCurve;
  STRIDER_LEG_CHOICE.push({ why: d.why, fordFrom: d.fordFrom,
    ax: ax, az: az, bx: bx, bz: bz,       /* so the A* candidate can be rebuilt on demand */
    roadCost: roadProf ? +roadProf.cost.toFixed(1) : null,
    directCost: +directProf.cost.toFixed(1),
    directFord: +directProf.fordFrac.toFixed(3),
    roadFord: roadProf ? +roadProf.fordFrac.toFixed(3) : null,
    directValid: directOK, directBlocked: directBad,
    roadArc: roadCurve ? +roadCurve.getLength().toFixed(1) : null,
    directArc: +directProf.len.toFixed(1),
    roadProf: roadProf, directProf: directProf, directCurve: directCurve,
    /* kept for window._striders.legStats: striderRefineRoad IS, line for
       line, the leg builder this file shipped before — so the road
       candidate is an exact A/B against the old behaviour, measurable in
       the same run rather than from a remembered number. */
    roadCurve: roadCurve });
  return chosen;
}

/* ---- generic stop-list / leg-list builders, shared by every route: a
   route's stops are [terminus, its own stations (in route order, with a
   .door back-reference for boarding), terminus]; its legs are one
   striderBuildLeg() per consecutive pair. Route-agnostic by construction --
   this is exactly what the old single-route STRIDER_R1_STOPS/LEGS IIFEs
   below used to do inline, factored out so Route 2 can call the same two
   functions instead of duplicating them. */
function striderBuildStops(terminusA, terminusB, stations){
  var stops = [{ x:terminusA.x, z:terminusA.z }];
  stations.forEach(function(s){ stops.push({ x:s.x, z:s.z, ry:s.ry, door:s }); });
  stops.push({ x:terminusB.x, z:terminusB.z });
  return stops;
}
function striderBuildLegs(stops){
  var legs = [];
  for(var i=0;i<stops.length-1;i++){
    var A = stops[i], B = stops[i+1];
    legs.push(striderBuildLeg(A.x,A.z,B.x,B.z));
  }
  return legs;
}

/* ---- Route 1's stop list: [terminus, 6 stations, terminus] ---- */
var STRIDER_R1_TERMINI = [
  /* owner's raw point: (-3730.6,1584.0), terrainH there = 107.2 — just over
     the HILL_MAX(95) every road-following leg in this file already treats
     as impassable hill country. Nudged to the nearest lower dry ground
     found by an 8-direction ring search (same method lifePushToLowGround
     uses internally): terrainH 92.9 here, ~100 units away. Checked live
     via window._api before writing this constant, not guessed. */
  { x:-3629, z:1584 },
  /* owner's raw point: (3712.3,2199.0), terrainH there = -5.5 — underwater,
     and RESTORED as given. It used to be nudged ~100 units north onto dry
     ground at terrainH 5.1, on the same reflex as the hill nudges above;
     that was wrong. -5.5 is well inside STRIDER_WADE_MAX (9.0, derived from
     the model's own leg reach at the top of this file), so the creature can
     genuinely stand there: it is a shoal, not the bay. The nudge was also
     expensive — the leg into the nudged point detoured 5.07x its own
     straight-line distance (4,334 arc units for an 855-unit hop) hunting
     for dry ground to approach it by. Hill nudges stay: wading a shoal is
     in character, climbing a ridge is not. */
  { x:3712.3, z:2199.0 }
];
var STRIDER_R1_STOPS = striderBuildStops(STRIDER_R1_TERMINI[0], STRIDER_R1_TERMINI[1], STRIDER_R1_STATIONS);
var STRIDER_R1_LEGS = striderBuildLegs(STRIDER_R1_STOPS);

/* ---- Route 2's stop list: [terminus, 5 stations, terminus] ---- */
var STRIDER_R2_TERMINI = [
  /* owner's raw point 1: (3806.6,-1616.9), terrainH there = 137.9 -- deep
     in real hill country (terrainH's own RIDGES amplitude puts ordinary
     ground under ~90 and hills at 150-200+ -- see 78-life.js's own
     lifeCartBuildLeg comment), not a borderline case like Route 1's own
     nudge above. An 8-direction ring search (the same method
     lifePushToLowGround uses) never clears HILL_MAX within a few hundred
     units here -- checked live -- so this used a wider live grid sweep
     instead: nearest dry point under HILL_MAX(95) is ~610 units away, at
     terrainH 94.8, in the general direction of the route's own next stop
     (this nudge is x-negative/z-positive, i.e. toward point 2, not off to
     an unrelated side of the map). Checked live via window._api, not
     guessed. */
  { x:3486.6, z:-1096.9 },
  /* owner's raw point 7: (-3754.8,-2660.3), terrainH there = 94.8 -- already
     dry and already under HILL_MAX(95) as given (neighbourhood sampled
     live too: 91-99 across a 40-unit ring, consistent, not a knife-edge
     fluke). No nudge needed, same as Route 1's analogous "already fine"
     case would have been. */
  { x:-3754.8, z:-2660.3 }
];
var STRIDER_R2_STOPS = striderBuildStops(STRIDER_R2_TERMINI[0], STRIDER_R2_TERMINI[1], STRIDER_R2_STATIONS);
var STRIDER_R2_LEGS = striderBuildLegs(STRIDER_R2_STOPS);

/* ---- Route 3's stop list: [terminus, 9 stations, terminus] ---- */
var STRIDER_R3_TERMINI = [
  /* owner's raw point: (2046.6,-3707.8), terrainH there = 10.3 -- already
     dry and already well under HILL_MAX(95), no nudge needed (same as
     Route 2's own second terminus, checked live via window._api, not
     guessed). */
  { x:2046.6, z:-3707.8 },
  /* owner's raw point: (94.5,3724.4), terrainH there = 100.8 -- just over
     HILL_MAX(95), same borderline-hill situation as Route 1's own first
     terminus. An 8-direction ring search (lifePushToLowGround's own
     method, 78-life.js) around the ORIGINAL point clears it at r=51.2,
     due south: terrainH 93.6 here, ~51 units away. Checked live via
     window._api, not guessed. */
  { x:94.5, z:3673.2 }
];
var STRIDER_R3_STOPS = striderBuildStops(STRIDER_R3_TERMINI[0], STRIDER_R3_TERMINI[1], STRIDER_R3_STATIONS);
var STRIDER_R3_LEGS = striderBuildLegs(STRIDER_R3_STOPS);

/* every route this city has, in one place -- `n` is that route's own pool
   size (see LIFE_STRIDERS below). Route 2 is slightly longer than Route 1
   end-to-end (~8700 vs ~7800 straight-line units between consecutive
   stops) but close enough that the same density Route 1 established (6
   convoys) carries over directly rather than inventing a fractional
   count. Route 3 is longer again (~9070) AND has far more stops (9, vs 5
   and 6) -- its own full one-way trip (straight-line distance/speed, plus
   9 stops' worth of dwell time) runs roughly 25-30% longer than either
   Route 1's or Route 2's own trip, so its pool is bumped to 8 (a clean
   4-westbound/4-eastbound split) rather than just copying 6 again. */
var STRIDER_ROUTES = [
  { stops: STRIDER_R1_STOPS, legs: STRIDER_R1_LEGS, n: 6 },
  { stops: STRIDER_R2_STOPS, legs: STRIDER_R2_LEGS, n: 6 },
  { stops: STRIDER_R3_STOPS, legs: STRIDER_R3_LEGS, n: 8 }
];

/* ---- convoys: each route runs its own fixed pool (STRIDER_ROUTES[i].n),
   half westbound/half eastbound always within that route (a convoy that
   reaches either of ITS OWN termini is immediately replaced by a fresh one
   starting again from that SAME terminus, in the SAME direction — this is
   what keeps each route's own split invariant true forever, not a flip).
   Car slots are statically partitioned (3 per convoy,
   LIFE_STRIDER_CARS_PER_CONVOY) rather than dynamically allocated across a
   GLOBAL slot number spanning every route's convoys — sum of every route's
   n, x3, is exactly LIFE_STRIDER_CAR_SLOTS (78-life.js: 6+6+8 routes x 3 =
   60), so there is never a free-list to manage; a convoy simply leaves its
   unused slot(s) scaled to 0. */
var LIFE_STRIDER_CARS_PER_CONVOY = 3;

/* "always one passenger and cargo variant, with at least one of each per
   convoy" — read literally that is impossible for a convoy of exactly 1
   (only one variant can be its only car), so a 1-car convoy is a single car
   of either variant, and a 2-car convoy always has one of each.

   owner: "i think too many silt striders are spawning in now, so make them
   spawn as 66% chance of 1 strider and 33% chance of 2." Was 18/45/37 across
   1/2/3 cars — a mean of 2.19 creatures per convoy, and with the bespoke
   model now being a 24.9-unit-tall animal rather than the old cart stand-in,
   a 3-abreast convoy reads as a herd. Now a strict 2-way roll, mean 1.34:
   across the 20 pooled convoys that is roughly 27 creatures instead of 44.
   3-car convoys no longer occur at all.
   LIFE_STRIDER_CAR_SLOTS is deliberately NOT reduced to match — it stays
   sized at 3/convoy. The surplus slots simply go unused (convoys already
   ran short before this change, so that path is well-worn), and shrinking
   it would move LIFE_STRIDER_RIDER_BASE and the lantern bases in
   82-daynight.js that derive from it, for no gain. */
function striderRollCars(){
  var n = chance(0.66) ? 1 : 2;
  var cars;
  if(n === 1){
    cars = [ { variant: pick(['pax','cargo']) } ];
  }else{
    cars = [ { variant:'pax' }, { variant:'cargo' } ];
    for(var i=2;i<n;i++) cars.push({ variant: pick(['pax','cargo']) });
  }
  /* each creature keeps its OWN gait phase, rolled at random, so a convoy
     of three doesn't march in lockstep like a single rigid object. */
  cars.forEach(function(c){ c.onboard = 0; c.gait = rnd()*Math.PI*2; });
  return cars;
}

/* slotGlobal addresses this convoy's 3-car block in the single shared
   reserved tail on lifeCaravanMesh/lifePedMesh (78-life.js) — a GLOBAL
   index across every route's pooled convoys, not per-route, so two
   different routes' convoys never write the same instance slot. */
function striderSpawnConvoy(route, slotGlobal, dir, startT){
  var stops = route.stops, legs = route.legs;
  var idx = (dir===1) ? 0 : (stops.length-1);
  var legIdx = (dir===1) ? 0 : (stops.length-2);
  var cv = {
    route: route, slot: slotGlobal, dir: dir, idx: idx, legIdx: legIdx, curveDir: dir,
    curveT: (startT!==undefined ? startT : 0), state:'transit', stateT:0,
    dwell: 0, speed: rr(24,32), laneOffset: rr(-2.6,2.6),   /* "slightly faster" than caravans' rr(20,28) */
    cars: striderRollCars()
  };
  cv.curve = legs[legIdx];
  cv.legLen = cv.curve.getLength();
  return cv;
}
var LIFE_STRIDERS = [];
(function(){
  var slotGlobal = 0;
  STRIDER_ROUTES.forEach(function(route){
    for(var i=0;i<route.n;i++){
      var dir = (i < route.n/2) ? 1 : -1;
      var cv = striderSpawnConvoy(route, slotGlobal, dir, 0);
      cv.curveT = rr(0,1);   /* stagger initial population along its own leg — same load-time head start every other population gets */
      LIFE_STRIDERS.push(cv);
      slotGlobal++;
    }
  });
})();
window._striders = { count: LIFE_STRIDERS.length,
  routes: STRIDER_ROUTES.map(function(r){ return { n:r.n, stops:r.stops.length, legs:r.legs.length }; }),
  stations: LIFE_STRIDER_STATIONS.map(function(s){ return {x:s.x,z:s.z}; }) };

