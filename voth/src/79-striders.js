/* ============================== SILT STRIDER CONVOYS (moving) ==============
   Route 1: the 8 owner-given waypoints, termini at the ends (turnaround
   points, nudged onto nearby dry/low ground — see STRIDER_R1_TERMINI's own
   comment — but not real stops), 6 real stations in between (66-striders.js,
   which built the physical platform/shelter at each one and registered it
   in LIFE_STRIDER_STATIONS).

   THE STAND-IN IS GONE. For several passes this file rendered its convoys
   as the merchant caravan's merged cart+draft-animal template
   (lifeCaravanMesh, 78-life.js) scaled 2.3x and retinted, because the
   draw-call budget was at 53/53 with zero headroom and a bespoke
   silhouette needs its own geometry, hence its own InstancedMesh, hence a
   new draw call. That compromise was documented here rather than hidden,
   and it is now PAID OFF: the owner raised the ceiling to 72, and the
   section "THE BESPOKE SILT STRIDER MODEL" below builds a real creature —
   tall arched carapace, segmented thorax, long segmented snout, six long
   spindly legs that actually WALK, and a howdah passenger pod — on two new
   InstancedMeshes of its own (body + animated leg segments). The 60
   borrowed slots on lifeCaravanMesh have been handed straight back
   (78-life.js's LIFE_CARAVAN_N is 90 again, real caravans only), and
   nothing in this file touches that mesh any more. Riders still reuse
   lifePersonGeo via lifePedMesh's own reserved tail
   (LIFE_STRIDER_RIDER_BASE..), the same geometry every other passenger
   population uses — they now sit in the howdah's real seats.

   State-machine and boarding pattern are directly copied from
   updateFerries/lifeFerryBoard (78-life.js) — docked/transit per convoy,
   1-3 alight and 1-3 board per stop, pedestrians handed to/from LIFE_PEDS
   exactly like a ferry stop. Routing reuses the same road-graph machinery
   (lifeRoadPath/RNODE/REDGE via striderBuildLeg, a wading-permitted twin of
   lifeCartBuildLeg just below) — the one deliberate difference from every
   other cart/caravan in the city: striders are explicitly allowed to cross
   water by wading, at 75% speed, per the owner's own instruction.

   ROUTE 2 (added later, same owner ask, same rules): a second, independent
   route with its own termini, its own 5 stations (66-striders.js, reusing
   any existing Route 1 station a vertex happens to land on via the shared
   registry -- checked live, none actually coincide here), and its own pool
   of convoys. Nothing below is hardcoded to "exactly one route" any more:
   STRIDER_ROUTES holds both routes' stops/legs/convoy-count, and every
   convoy carries a route reference instead of reading module-level
   STRIDER_R1_* globals directly; a convoy's slot is a GLOBAL index across
   BOTH routes' pooled convoys (0..11), because that is what addresses its
   cars/riders in the single shared slot pool (then: a reserved tail on
   lifeCaravanMesh/lifePedMesh; now: striderMesh's own 60 slots, plus
   lifePedMesh's rider tail) -- one pool, then sized for 12 convoys x 3
   cars instead of 6.

   ROUTE 3 (added later still, same ask, same rules, proof the Route 2
   generalization actually works): an 11-point route, the longest yet
   (~9070 straight-line units end to end, vs Route 1's ~7800 and Route 2's
   ~8700) and with the most interior stops (9, vs Route 1's 6 and Route 2's
   5). Genuinely nothing new to write here beyond DATA -- one more
   STRIDER_ROUTES entry, built from the exact same striderBuildStops()/
   striderBuildLegs() every other route already uses, with a proportionally
   bigger convoy pool (8, vs 6 for each of the other two -- Route 3's own
   full one-way trip, straight-line distance/speed plus its own 9 stops'
   dwell time, runs ~25-30% longer than either existing route's, so 6
   convoys would under-serve it). The shared slot pool grows again, from 12
   to 20 pooled convoys x 3 cars = the 60 creature slots the bespoke model
   below is sized for. */
reseed(790001);   /* fragment head seed — build.py enforces this. */

/* ============================== WADING — the one tuning block ==============
   Every number that decides how deep a silt strider will go, and how deep
   it LOOKS like it has gone, derived from the model's own dimensions
   rather than picked by eye. Hoisted to the top of the file because
   striderBuildLeg (immediately below) builds every route's legs at load
   time, long before the render section further down runs — a `var` only
   hoists the binding, not the value, so a constant the router reads
   cannot be declared next to the gait code that also reads it.

     hip sockets      12.6 above the foot plane (STRIDER_HIP_Y)
     leg reach        13.5 straight-line hip-to-foot
     underbelly       8.0  above the foot plane (thorax underside: the
                           r=3.7 keel cylinder centred at y=11.7)

   STRIDER_WADE_DEPTH is how far the BODY ORIGIN may sink below the lake
   surface: pinned at 5.0, the underbelly still rides 3.0 clear of the
   water, which is the silhouette a striding creature should have — legs
   in, hull out. STRIDER_FOOT_DROP is how much further a foot may hunt
   below that origin before it is clamped, so the deepest lakebed a foot
   can still physically reach is the sum of the two. That sum IS the
   routing limit: water deeper than it cannot be stood in, only swum, so
   the router treats it as an obstacle exactly the way it already treats
   hill country above HILL_MAX. (9.0 against a bay that runs 26-31 deep in
   places, so the open bay is still firmly out of bounds — a silt strider
   wades rivers, fords and shoals, it does not walk the sea floor.) */
var STRIDER_WADE_DEPTH = 5.0;
var STRIDER_FOOT_DROP = 4.0, STRIDER_FOOT_RISE = 3.0;
var STRIDER_WADE_MAX = STRIDER_WADE_DEPTH + STRIDER_FOOT_DROP;   /* 9.0 */
var STRIDER_HILL_MAX = 95;     /* wading a river is in character, climbing a ridge is not */
var STRIDER_WADE_SPEED = 0.75; /* the update loop's own wading speed factor, below */
var STRIDER_CLEAR = 12;        /* hull half-width 6.7, planted feet 9.9 — the radius a solid obstacle has to be clear by */
/* How much longer (in travel TIME, see striderLegCost) a road-following leg
   is allowed to be before the strider gives up on it and fords instead.
   Not a vibe — measured over all 23 legs of the three routes: the median
   road leg is 1.24x its own straight-line distance and half of them sit
   between 1.19 and 1.33, which is simply what a road costs to follow real
   ground and is worth paying (it keeps the creature on the street grid,
   out of the farmland and out of the building blocks the road graph
   guarantees and a direct line does not). Above that band the ratios jump
   straight to 1.58, 1.87, 2.0, 2.8, 4.05 and 5.3 — those are not roads
   bending, those are legs going to find a bridge. 1.40 sits in the empty
   gap between the two populations, and matches the owner's own line: a
   creature that can wade should not detour 40% to cross dry-shod. */
var STRIDER_ROAD_TOLERANCE = 1.40;

/* ---- solid obstacles a strider may NOT walk through, whatever the depth.
   Water is not one of them — that is the whole point — but a chinampa bed,
   a canton, a moored dhow or a real pier/quay deck is. Deliberately the
   same obstacle sources lifeNavBlocked (78-life.js) already classifies its
   grid with, MINUS its `terrainH > -1.5` land test, called rather than
   copied where a helper exists.

   Plus one source lifeNavBlocked does not need and this does: gridHit
   (60-land.js), the spatial hash over every claim()ed footprint in the
   city. A road-following leg never needed it — the road graph keeps a cart
   out of the built fabric by construction — but a direct cross-country leg
   has no such guarantee, and a strider walking through a warren block is
   worse than one taking a bridge. */
/* One bounding box over every LINEAR-SCAN obstacle source below (the four
   pier families, the bridge pylons, the moored ships) — the ones with no
   spatial hash of their own. They all live in the bay; the nav grid below
   covers +-4000, so without this early-out the great majority of its
   94,864 cells pay ~50 point-to-segment tests each to discover there is no
   pier in the wilderness. Measured: it is most of the grid's build cost.
   Exact, not an approximation — the box is padded by each source's own
   half-width plus STRIDER_CLEAR, so a point outside it genuinely cannot
   hit any of them. */
var STRIDER_LINEAR_BB = (function(){
  var bb = { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity };
  function add(x,z,pad){
    if(x-pad < bb.x0) bb.x0 = x-pad;
    if(x+pad > bb.x1) bb.x1 = x+pad;
    if(z-pad < bb.z0) bb.z0 = z-pad;
    if(z+pad > bb.z1) bb.z1 = z+pad;
  }
  [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS].forEach(function(a){
    a.forEach(function(p){ var pad = p.w*0.5+STRIDER_CLEAR; add(p.x0,p.z0,pad); add(p.x1,p.z1,pad); });
  });
  BRIDGE_SUPPORTS.forEach(function(b){ add(b.x,b.z,b.r+STRIDER_CLEAR); });
  if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined')
    LIFE_SHIP_STATIONARY_DOCKS.forEach(function(d){ add(d.x,d.z,26+STRIDER_CLEAR); });
  return bb;
})();
function striderSolidAt(x,z){
  if(gridHit(x,z,STRIDER_CLEAR)) return true;
  if(lifeNavCantonBlocked(x,z)) return true;
  if(chinHit(x,z,STRIDER_CLEAR)) return true;
  var bb = STRIDER_LINEAR_BB;
  if(x < bb.x0 || x > bb.x1 || z < bb.z0 || z > bb.z1) return false;
  var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS], ai, pi, a, p;
  for(ai=0; ai<arrs.length; ai++){
    a = arrs[ai];
    for(pi=0; pi<a.length; pi++){
      p = a[pi];
      if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5+STRIDER_CLEAR) return true;
    }
  }
  for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){
    var bs = BRIDGE_SUPPORTS[n2];
    if(Math.hypot(x-bs.x,z-bs.z) < bs.r+STRIDER_CLEAR) return true;
  }
  if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
    for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
      var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
      if(Math.hypot(x-sd.x, z-sd.z) < 26+STRIDER_CLEAR) return true;
    }
  }
  return false;
}
/* the depth-aware sibling lifePushToLowGround needed and did not have: that
   one only ever MINIMISES height, so handed a point in deep water it
   happily pushes further out to sea. This is the same 8-direction ring
   search, run the other way — find nearby ground that is shallow enough to
   stand in (>= -STRIDER_WADE_MAX) without being hill country. */
function striderPushToWadeable(x,z){
  var h = terrainH(x,z);
  if(h >= -STRIDER_WADE_MAX) return [x,z];
  var best=[x,z], bestH=h;
  for(var r=20; r<=400; r*=1.6){
    for(var a=0;a<8;a++){
      var ang = a/8*Math.PI*2, px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph > bestH && ph <= STRIDER_HILL_MAX){ bestH = ph; best = [px,pz]; }
    }
    if(bestH >= -STRIDER_WADE_MAX) break;
  }
  return best;
}
/* and the same idiom again for a point inside a solid obstacle: step out to
   the nearest ring sample that is clear AND wadeable AND not hill. */
function striderPushClear(x,z){
  for(var r=STRIDER_CLEAR*2; r<=500; r*=1.5){
    for(var a=0;a<12;a++){
      var ang = a/12*Math.PI*2, px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      /* striderNavPassable, not !striderSolidAt: a point hemmed in by
         chinampa beds has no "clear" neighbour by the strict test but
         usually has a street one, and returning the ORIGINAL point (which
         is what the strict test did when it found nothing) makes the
         refinement loop splice the bad point back into itself and spin
         until it runs out of rounds. */
      if(ph >= -STRIDER_WADE_MAX && ph <= STRIDER_HILL_MAX && striderNavPassable(px,pz)) return [px,pz];
    }
  }
  return [x,z];
}
/* is this sample standing on a real deck (causeway, canton span, river
   bridge)? Then it is neither a swim nor an obstacle, whatever terrainH
   says about the bed tens of units below it. */
function striderOnDeck(x,z){ return lifeCausewayY(x,z) != null || lifeBridgeY(x,z) != null; }

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

/* ========================= THE BESPOKE SILT STRIDER MODEL =================
   The stand-in is GONE. Every note above about "strider cars REUSE
   lifeCaravanMesh, scaled 2.3x and retinted" describes what this file used
   to do and is kept only as the record of the compromise; what actually
   renders below is a purpose-built creature on its own two InstancedMeshes,
   and the 60 borrowed slots on lifeCaravanMesh have been handed back (see
   78-life.js's own LIFE_CARAVAN_N, now 90 — real caravans only).

   TWO new draw calls, inside the 3 this pass was allowed:
     1. striderMesh     — one merged rigid body per creature (carapace,
                          thorax, segmented snout, howdah, driver).
     2. striderLegMesh  — every leg segment of every creature, one shared
                          unit bar, repositioned per frame. THE LEGS WALK.

   Built the way the life layer builds all its vehicles: a flat list of
   stock THREE primitives, each with its own baked colour, welded by
   lifeMergeGeoms() (78-life.js) into one vertex-coloured buffer. The
   static kit's BOX/FR6/CYL/CONE/DOME wrappers can NOT be used here — they
   push into BUCKET, which 75-terrain.js already drained long before this
   fragment runs — so these are the same primitive shapes SHAPES itself is
   made of (BoxGeometry / CylinderGeometry / ConeGeometry / half-
   SphereGeometry = the DOME shape / full SphereGeometry = the BLOB shape),
   called directly.

   LOCAL FRAME, and why ground clearance is now honest: +z is forward
   (lifeCaravanMesh's own convention, which yaw = atan2(dirX,dirZ)
   assumes), and y = 0 is the FOOT/GROUND CONTACT PLANE — the model is
   authored standing on y=0, at true world scale, with no uniform rescale
   applied at instancing time. The old code had to add
   `0.15*LIFE_STRIDER_SCALE + 1.6` because it was scaling a cart template
   2.3x about a pivot that wasn't at wheel-ground contact, so the gap grew
   with the scale. There is no such gap here: the strider's y offset is
   simply lifeGroundY() + STRIDER_GROUND_EPS (0.15, the same epsilon every
   other citizen in the city stands on), with one deliberate extra rule for
   water — see STRIDER_WADE_DEPTH. */

/* ---- dimensions (world units; a citizen is 2.94 tall, a station shelter
   ~14 to its roof peak, for scale) -----------------------------------------
     overall height   24.9  (carapace crest) / 26.8 (howdah canopy apex)
     overall length   40.7  (snout tip z=+26.1 back to abdomen tip z=-14.6;
                            the snout was trimmed at the owner's request)
     body width       13.4  across the shell, 19.8 across planted feet
     hip height       12.6, leg reach 13.5 straight-line hip-to-foot        */
var STRIDER_HIP_Y   = 12.6;                 /* hip sockets above the foot plane */
var STRIDER_HIP_X   = 4.7;                  /* hips, half-width                 */
var STRIDER_HIP_Z   = [6.0, 0.4, -5.6];     /* three pairs, front to back       */
var STRIDER_FOOT_X  = 9.9;                  /* planted feet splay wider than the hips */
var STRIDER_LEGS    = STRIDER_HIP_Z.length*2;   /* 6 */
var STRIDER_LEG_SEGS = 2;                   /* femur + tibia, one bent knee     */
var STRIDER_BARS_PER_BODY = STRIDER_LEGS*STRIDER_LEG_SEGS;   /* 12 */

/* baked colours are deliberately LIGHT: the per-instance pax/cargo tint
   below multiplies them (vertexColors material), so authoring the chitin at
   its final tone would come out muddy once tinted. */
var STRIDER_CHIT      = 0xd2b888;   /* carapace: warm bone                    */
var STRIDER_CHIT_MID  = 0xae9068;   /* thorax barrel, a shade under the shell */
var STRIDER_CHIT_DARK = 0x866848;   /* belly, hips, alternating snout rings   */
var STRIDER_CHIT_LITE = 0xf0dcb4;   /* ribs, crest, spikes — the highlights   */
var STRIDER_SHELL_IN  = 0x4a3a2c;   /* the shell hollow's own shadowed lining */
var STRIDER_WOOD      = 0xae7e52;
var STRIDER_WOOD_DARK = 0x785232;
var STRIDER_CANVAS    = 0xffffff;   /* pure white == carries the instance tint unmodified */
var STRIDER_EYE       = 0x2a2118;

var striderParts = [];
function striderPart(geo, col){ striderParts.push({ geo: geo, color: col }); }

/* --- thorax: a segmented tube lying along the travel axis --------------- */
striderPart(new THREE.CylinderGeometry(4.4,5.0,17,8).rotateX(Math.PI/2).translate(0,14.2,-3.0), STRIDER_CHIT_MID);
striderPart(new THREE.CylinderGeometry(3.3,3.7,15,8).rotateX(Math.PI/2).translate(0,11.7,-3.0), STRIDER_CHIT_DARK);   /* keeled underbelly */
/* five chitin ribs, slightly proud of the tube — the segmentation reads
   from a long way off, which a smooth barrel does not. */
[[5.2,4.6],[1.6,5.3],[-2.2,5.6],[-6.2,5.3],[-9.8,4.4]].forEach(function(r){
  striderPart(new THREE.CylinderGeometry(r[1],r[1],1.1,10).rotateX(Math.PI/2).translate(0,14.2,r[0]), STRIDER_CHIT_LITE);
});
/* abdomen, tapering to a point behind */
striderPart(new THREE.ConeGeometry(4.3,6.5,8).rotateX(-Math.PI/2).translate(0,14.0,-14.6), STRIDER_CHIT_MID);

/* --- the tall arched carapace ------------------------------------------ */
striderPart(new THREE.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI*0.5)
              .scale(5.9,9.4,8.6).translate(0,14.6,0.2), STRIDER_CHIT);
striderPart(new THREE.BoxGeometry(1.1,2.0,13.5).translate(0,23.6,0.2), STRIDER_CHIT_LITE);   /* crest spine */
[3.8,0.6,-2.6,-5.6].forEach(function(z){
  striderPart(new THREE.ConeGeometry(0.85,2.4,6).translate(0,25.4,z), STRIDER_CHIT_LITE);    /* ridge spikes */
});
/* the hollow carved into each flank of the shell — a dark recessed panel,
   the cue that this creature is something you ride INSIDE, not just on. */
[1,-1].forEach(function(s){
  striderPart(new THREE.BoxGeometry(0.7,4.0,6.4).translate(s*5.35,15.6,-0.6), STRIDER_SHELL_IN);
  striderPart(new THREE.BoxGeometry(1.0,0.7,7.2).translate(s*5.1,17.8,-0.6), STRIDER_CHIT_LITE);   /* its lintel */
});

/* --- head and the long segmented snout/proboscis ------------------------ */
striderPart(new THREE.SphereGeometry(1,10,6).scale(3.4,3.2,3.6).translate(0,14.6,7.8), STRIDER_CHIT);
[1,-1].forEach(function(s){
  striderPart(new THREE.SphereGeometry(1,6,4).scale(0.95,0.95,0.95).translate(s*2.2,16.3,9.4), STRIDER_EYE);
  /* antenna, sweeping up and forward */
  striderPart(new THREE.CylinderGeometry(0.11,0.30,6.4,5).rotateX(Math.PI/2-0.55).rotateY(s*0.22)
                .translate(s*1.9,17.4,11.4), STRIDER_CHIT_DARK);
});
/* seven pieces: four tapering tubes with a joint collar between each pair,
   marching forward and downward on one straight line from the head. */
(function(){
  /* owner: "make the strider proboscis a bit smaller" — was dz 4.0 / dy -1.30
     with radii [2.75 .. 0.45], giving a 16-unit reach and a tip at z=+28.9.
     Trimmed to ~17% shorter and ~15% slimmer. dy is scaled with dz so
     dy/dz stays -0.324 (was -0.325) and the nose-down pitch of every segment
     is unchanged — only the reach and the girth come down, so the joint
     collars still line up on the same straight line as before. */
  var z0 = 10.9, y0 = 13.9, dz = 3.3, dy = -1.07;   /* per step along the snout */
  var r  = [2.35, 1.92, 1.50, 1.02, 0.38];          /* radius at each joint     */
  for(var i=0;i<4;i++){
    var tilt = Math.atan2(-dy, dz);                 /* nose-down pitch of this segment */
    var cz = z0 + dz*(i+0.5), cy = y0 + dy*(i+0.5);
    var len = Math.hypot(dz,dy)*1.02;
    striderPart(new THREE.CylinderGeometry(r[i+1],r[i],len,8).rotateX(Math.PI/2+tilt).translate(0,cy,cz),
                (i%2) ? STRIDER_CHIT_MID : STRIDER_CHIT_DARK);
    if(i<3){
      var jz = z0 + dz*(i+1), jy = y0 + dy*(i+1);
      striderPart(new THREE.CylinderGeometry(r[i+1]*1.16,r[i+1]*1.16,0.9,8).rotateX(Math.PI/2+tilt).translate(0,jy,jz),
                  STRIDER_CHIT_LITE);
    }
  }
})();

/* --- hip sockets: a nub per leg, so the animated bars below emerge from
   something instead of floating out of a smooth flank. ------------------- */
STRIDER_HIP_Z.forEach(function(hz){
  [1,-1].forEach(function(s){
    striderPart(new THREE.SphereGeometry(1,7,5).scale(1.55,1.55,1.55).translate(s*STRIDER_HIP_X,STRIDER_HIP_Y,hz), STRIDER_CHIT_DARK);
  });
});

/* --- the howdah: passenger pod slung over the rear of the shell --------- */
var STRIDER_HOWDAH_Z = -7.8, STRIDER_HOWDAH_FLOOR = 20.2;
striderPart(new THREE.BoxGeometry(8.4,0.9,8.8).translate(0,STRIDER_HOWDAH_FLOOR-0.45,STRIDER_HOWDAH_Z), STRIDER_WOOD_DARK);
/* the cradle: a deep block strapped down INTO the shell (its underside
   reaches 16.6, well inside the thorax barrel whose top is 19.2 here), so
   the pod reads as seated in a hollow rather than perched on the back. */
striderPart(new THREE.BoxGeometry(6.6,3.8,7.0).translate(0,18.5,STRIDER_HOWDAH_Z), STRIDER_WOOD_DARK);
[3.2,-3.2].forEach(function(sx){   /* lashing straps over the shell */
  striderPart(new THREE.BoxGeometry(0.6,3.0,1.0).translate(sx,18.9,STRIDER_HOWDAH_Z+2.6), STRIDER_WOOD);
});
[[3.6,3.8],[3.6,-3.8],[-3.6,3.8],[-3.6,-3.8]].forEach(function(p){
  striderPart(new THREE.CylinderGeometry(0.34,0.34,4.4,6).translate(p[0],STRIDER_HOWDAH_FLOOR+2.2,STRIDER_HOWDAH_Z+p[1]), STRIDER_WOOD);
});
striderPart(new THREE.BoxGeometry(8.4,0.55,0.45).translate(0,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z+4.0), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(8.4,0.55,0.45).translate(0,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z-4.0), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(0.45,0.55,8.8).translate(3.8,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(0.45,0.55,8.8).translate(-3.8,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
/* the canopy is the loudest white surface on the model on purpose: it is
   what actually carries the jade(passenger)/grey(cargo) instance tint. */
striderPart(new THREE.ConeGeometry(6.8,3.2,6).translate(0,STRIDER_HOWDAH_FLOOR+5.0,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
striderPart(new THREE.CylinderGeometry(0.22,0.22,1.2,6).translate(0,STRIDER_HOWDAH_FLOOR+7.1,STRIDER_HOWDAH_Z), STRIDER_WOOD);

/* --- the handler, on a small deck at the base of the neck --------------- */
striderPart(new THREE.BoxGeometry(3.6,0.6,3.2).translate(0,20.4,7.2), STRIDER_WOOD_DARK);
striderPart(new THREE.CylinderGeometry(0.34,0.42,1.5,6).translate(0,21.5,7.2), 0x2b4a7a);
striderPart(new THREE.BoxGeometry(0.58,0.58,0.58).translate(0,22.5,7.2), LIFE_SKIN);
striderPart(new THREE.CylinderGeometry(0.72,0.72,0.14,8).translate(0,22.9,7.2), 0x1f3a63);

var striderBodyGeo = lifeMergeGeoms(striderParts);
var striderMesh = new THREE.InstancedMesh(striderBodyGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_STRIDER_CAR_SLOTS);
striderMesh.userData.life = true; striderMesh.userData.inspectLabel = 'Silt strider';
striderMesh.frustumCulled = false;
scene.add(striderMesh);

/* one shared unit bar for every leg segment of every strider — pivot at the
   base, tip at local y=1, exactly the trick 82-daynight.js's clock hands and
   65-facade.js's mill rotor already use, so a segment is placed by
   (start point, setFromUnitVectors(up, direction), scale(thickness, length,
   thickness)). Tapered and only 6-sided: spindly is the whole point. No
   instanceColor is ever touched on this mesh — chitin legs are one colour
   for both variants, which sidesteps the zero-initialised-buffer trap
   entirely for it (the body mesh below handles it properly instead). */
var striderLegGeo = new THREE.CylinderGeometry(0.42,0.62,1,6).translate(0,0.5,0);
var striderLegMesh = new THREE.InstancedMesh(striderLegGeo,
  new THREE.MeshLambertMaterial({ color: 0x4a3a28 }), LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY);
striderLegMesh.userData.life = true; striderLegMesh.userData.inspectLabel = 'Silt strider leg';
striderLegMesh.frustumCulled = false;
scene.add(striderLegMesh);

/* honest, live-readable cost of the bespoke model — no hand-counted numbers
   in the report: body template triangles x slots, plus leg bar triangles x
   every bar, plus the 2 draw calls the pair of meshes costs. */
window._striderModel = {
  drawCalls: 2,
  bodySlots: LIFE_STRIDER_CAR_SLOTS,
  bodyPartCount: striderParts.length,
  bodyTrisEach: striderBodyGeo.attributes.position.count/3,
  legBars: LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY,
  legTrisEach: striderLegGeo.index ? striderLegGeo.index.count/3 : striderLegGeo.attributes.position.count/3,
  instances: LIFE_STRIDER_CAR_SLOTS*(1+STRIDER_BARS_PER_BODY),
  height: 24.9, length: 40.7, hipY: STRIDER_HIP_Y, legs: STRIDER_LEGS
};
window._striderModel.triangles =
  window._striderModel.bodySlots*window._striderModel.bodyTrisEach +
  window._striderModel.legBars*window._striderModel.legTrisEach;
/* live positions of every creature currently on the map — diagnostic only
   (the render loop stamps car.wx/wy/wz/wyaw each frame), so an audit or a
   headless screenshot pass can aim a camera at a real strider instead of
   guessing a coordinate. */
/* where each route actually fords open water — lazy, so it costs nothing at
   load. striderBuildLeg() deliberately drops the water-avoidance branch
   every other cart in the city keeps, and updateStriders() drops to 75%
   speed wherever terrainH < 2; this answers "does any route really use
   that?" with sampled coordinates instead of an assumption. */
window._striders.waterCrossings = function(samples){
  samples = samples || 200;
  var out = [];
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      for(var i=0;i<=samples;i++){
        var t = i/samples, p = leg.getPointAt(t);
        if(terrainH(p.x,p.z) < 2) out.push({ route:ri, leg:li, t:t, x:p.x, z:p.z });
      }
    });
  });
  return out;
};
/* per-leg routing audit: straight-line distance vs the curve's real arc
   length (the detour ratio a road-following leg pays to find a bridge),
   alongside how much of the leg is actually over water and how much of
   THAT is a genuine swim rather than a bridge/causeway deck underfoot
   (lifeGroundY answers a deck; terrainH alone does not). This is the one
   number that says whether a strider is wading or queueing over a bridge,
   so it lives in the build rather than in a throwaway console paste. */
function striderSampleLeg(curve, straight, samples){
  var water=0, swim=0, ford=0, deepestWade=99, deepestAny=99;
  for(var i=0;i<=samples;i++){
    var p = curve.getPointAt(i/samples), h = terrainH(p.x,p.z);
    if(h < 2){
      water++;
      if(h < deepestAny) deepestAny = h;
      if(!striderOnDeck(p.x,p.z)){
        swim++;
        if(h < SEA) ford++;
        if(h < deepestWade) deepestWade = h;
      }
    }
  }
  var arc = curve.getLength();
  return { arc:+arc.toFixed(1), ratio:+(arc/straight).toFixed(3),
           water:water, swim:swim, ford:ford,
           deepestWade: swim? +deepestWade.toFixed(2) : null,
           deepestAny: water? +deepestAny.toFixed(2) : null };
}
/* the A* candidate for one leg, built ON DEMAND and memoised on that leg's
   own choice record. This is what keeps navValid/navBlocked/navArc/navFord
   working exactly as they did when the candidate was built at load — the
   caller just pays for the occupancy grid at the moment they ask. */
function striderNavCandidate(ch){
  if(ch.navDone) return ch;
  ch.navDone = true;
  var navCurve = striderRefineNav(ch.ax, ch.az, ch.bx, ch.bz);
  var navOK = !!navCurve && striderLegValid(navCurve, ch.ax,ch.az, ch.bx,ch.bz);
  ch.navCurve = navCurve;
  ch.navValid = navOK;
  ch.navBlocked = navCurve ? (navOK ? null : STRIDER_BAD_WHY) : ['no-nav-path',0,0,0];
  ch.navProf = navCurve ? striderLegProfile(navCurve) : null;
  ch.navArc = ch.navProf ? +ch.navProf.len.toFixed(1) : null;
  ch.navCost = ch.navProf ? +ch.navProf.cost.toFixed(1) : null;
  ch.navFord = ch.navProf ? +ch.navProf.fordFrac.toFixed(3) : null;
  return ch;
}
/* pass {nav:false} to skip the A* candidate and keep legStats cheap; by
   default it is evaluated, which builds the occupancy grid on first call. */
window._striders.legStats = function(samples, opt){
  samples = samples || 200;
  var wantNav = !(opt && opt.nav === false);
  var out = [];
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var A = r.stops[li], B = r.stops[li+1];
      var straight = Math.hypot(B.x-A.x, B.z-A.z);
      var ch = STRIDER_LEG_CHOICE[out.length] || {};
      if(wantNav && ch.ax !== undefined) striderNavCandidate(ch);
      var rec = striderSampleLeg(leg, straight, samples);
      rec.route = ri; rec.leg = li; rec.straight = +straight.toFixed(1);
      rec.samples = samples+1;
      rec.why = ch.why; rec.fordFrom = ch.fordFrom;
      rec.directValid = ch.directValid; rec.directBlocked = ch.directBlocked;
      rec.navValid = ch.navValid; rec.navBlocked = ch.navBlocked;
      rec.roadCost = ch.roadCost; rec.directCost = ch.directCost;
      rec.navCost = ch.navCost; rec.navArc = ch.navArc;
      rec.navFord = ch.navFord; rec.directFord = ch.directFord; rec.roadFord = ch.roadFord;
      /* the same measurement against the ROAD candidate — bit for bit the
         leg this file used to ship — so before/after is one run, not a
         remembered number from a previous build. */
      rec.before = ch.roadCurve ? striderSampleLeg(ch.roadCurve, straight, samples) : null;
      out.push(rec);
    });
  });
  return out;
};
/* THE PROOF that dropping the A* candidate from striderBuildLeg changed
   nothing. Per leg it rebuilds the A* candidate on demand, then runs the
   SAME striderChoose the router runs — once with that candidate offered
   and once without — and reports whether the two agree on which curve
   ships. `identical` false anywhere means the candidate was doing
   something real and it should go back into the router. Expensive by
   construction (it builds the occupancy grid and 23 A* routes); it is a
   diagnostic, not a load-path cost. */
window._striders.navAbTest = function(samples){
  samples = samples || 200;
  var out = [], allSame = true, gi = 0;
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var ch = STRIDER_LEG_CHOICE[gi++];
      var A = r.stops[li], B = r.stops[li+1];
      var straight = Math.hypot(B.x-A.x, B.z-A.z);
      striderNavCandidate(ch);
      var withoutNav = striderChoose(!!ch.roadCurve, ch.roadProf, ch.directValid, ch.directProf, false, null);
      var withNav    = striderChoose(!!ch.roadCurve, ch.roadProf, ch.directValid, ch.directProf, ch.navValid, ch.navProf);
      function pick(d){
        if(!d.useFord) return { src:'road', curve: ch.roadCurve };
        if(d.fordFrom === 'astar') return { src:'astar', curve: ch.navCurve };
        return { src:'straight', curve: ch.directCurve };
      }
      var a = pick(withoutNav), b = pick(withNav);
      var sa = a.curve ? striderSampleLeg(a.curve, straight, samples) : null;
      var sb = b.curve ? striderSampleLeg(b.curve, straight, samples) : null;
      var same = a.src === b.src && !!sa && !!sb &&
                 Math.abs(sa.arc - sb.arc) < 0.05 && sa.swim === sb.swim && sa.ford === sb.ford;
      if(!same) allSame = false;
      out.push({ leg:'R'+(ri+1)+'/L'+li, identical: same,
                 shipped: { src:a.src, why:withoutNav.why, arc:sa && sa.arc, swim:sa && sa.swim, ford:sa && sa.ford },
                 withAstar: { src:b.src, why:withNav.why, arc:sb && sb.arc, swim:sb && sb.swim, ford:sb && sb.ford },
                 navValid: ch.navValid, navArc: ch.navArc, navFord: ch.navFord, navBlocked: ch.navBlocked });
    });
  });
  return { allIdentical: allSame, legs: out.length,
           differing: out.filter(function(o){ return !o.identical; }).length, perLeg: out };
};
/* STRICT physical-overlap audit of the legs as shipped — no clearance
   margins, no road or deck exemption, no endpoint grace. striderBadSample
   answers "should the router have allowed this", which is a question about
   policy; this answers "is the creature inside something solid", which is
   a question about the world, and it is the one that decides whether a
   routing change was safe. Uses each obstacle's OWN extent: a claim()ed
   footprint's own rad, a chinampa bed at radius 0, a pier at its own half
   width, a canton at its own cap square, a bridge pylon at its own r. */
window._striders.clipAudit = function(samples, useRoad){
  samples = samples || 400;
  var out = [];
  function check(x,z,route,leg,t){
    if(gridHit(x,z,0)) out.push({ kind:'built', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    else if(chinHit(x,z,0)) out.push({ kind:'chinampa', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    else{
      var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS], names = ['pier','cpier','rpier','ferry-pier'];
      for(var ai=0; ai<arrs.length; ai++){
        for(var pi=0; pi<arrs[ai].length; pi++){
          var p = arrs[ai][pi];
          if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5){
            out.push({ kind:names[ai], route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return;
          }
        }
      }
      for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){
        var bs = BRIDGE_SUPPORTS[n2];
        if(Math.hypot(x-bs.x,z-bs.z) < bs.r){ out.push({ kind:'pylon', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return; }
      }
      if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
        for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
          var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
          if(Math.hypot(x-sd.x, z-sd.z) < 26){ out.push({ kind:'moored-ship', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return; }
        }
      }
      if(!striderOnDeck(x,z) && lifeNavCantonBlocked(x,z)) out.push({ kind:'canton', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    }
  }
  /* useRoad audits the ROAD candidate of every leg instead — the leg this
     file shipped before any of this work — so "does the new route clip
     anything the old one did not" is a difference of two measured numbers
     rather than an absolute whose baseline nobody knows. It is not an
     absolute test: gridHit uses claim()'s own PADDED radius, so a curve
     running correctly along a street beside a house scores a hit here.
     The baseline is what makes it mean something. */
  var gi = 0;
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var ch = STRIDER_LEG_CHOICE[gi++];
      var use = (useRoad && ch && ch.roadCurve) ? ch.roadCurve : leg;
      for(var i=0;i<=samples;i++){
        var t = i/samples, p = use.getPointAt(t);
        check(p.x, p.z, ri, li, t);
      }
    });
  });
  return out;
};
/* point-level "why is this blocked", so a stubborn refusal can be answered
   with a reading instead of a guess. */
window._striders.probePoint = function(x,z){
  return { terrainH:+terrainH(x,z).toFixed(2), onDeck:striderOnDeck(x,z), onRoad:striderOnRoad(x,z),
           navBlocked:striderNavBlocked(x,z), navPassable:striderNavPassable(x,z),
           gridHit:gridHit(x,z,STRIDER_CLEAR), gridHitRaw:gridHit(x,z,0),
           chin:chinHit(x,z,STRIDER_CLEAR), chinRaw:chinHit(x,z,0),
           canton:lifeNavCantonBlocked(x,z), solid:striderSolidAt(x,z),
           pushClear:striderPushClear(x,z) };
};
/* pass built:false to ask whether the occupancy grid has been built yet
   WITHOUT building it — the whole point of the laziness is that reading
   this does not silently cost 1.4s. Any other call builds it. */
window._striders.nav = function(opt){
  var base = { w:STRIDER_NAV_W, h:STRIDER_NAV_H, cell:STRIDER_NAV_CELL,
               cells:STRIDER_NAV_W*STRIDER_NAV_H, lazy:true,
               grid: STRIDER_NAV_GRID ? 'built' : 'not built yet',
               roadMs:+STRIDER_NAV_ROAD_MS.toFixed(1),
               buildMs:+STRIDER_NAV_BUILD_MS.toFixed(1) };
  if(opt && opt.built === false) return base;
  var g = striderNavGrid(), open=0, road=0;
  for(var i=0;i<g.length;i++){ if(!g[i]) open++; if(STRIDER_NAV_ROAD[i]) road++; }
  base.grid = 'built'; base.open = open; base.roadCells = road;
  base.buildMs = +STRIDER_NAV_BUILD_MS.toFixed(1);
  return base;
};
window._striders.navPath = function(ax,az,bx,bz){
  var p = striderNavAStar(ax,az,bx,bz);
  return p ? { raw:p.length, simplified:striderNavSimplify(p) } : null;
};
window._striders.live = function(){
  var out = [];
  LIFE_STRIDERS.forEach(function(cv){
    cv.cars.forEach(function(car, k){
      if(car.wx === undefined) return;
      out.push({ slot: cv.slot*LIFE_STRIDER_CARS_PER_CONVOY+k, car: k, variant: car.variant,
                 state: cv.state, onboard: car.onboard||0,
                 x: car.wx, y: car.wy, z: car.wz, yaw: car.wyaw,
                 h: terrainH(car.wx, car.wz) });
    });
  });
  return out;
};

/* ---- gait -------------------------------------------------------------
   Alternating tripod: the two sides of a pair are half a cycle apart, and
   consecutive pairs are a third of a cycle apart, so three feet are always
   planted. A foot's fore/aft position is cos(phase)*STRIDE and it lifts by
   sin(phase)*LIFT only on the forward half — i.e. it is on the ground for
   exactly the half-cycle it is travelling backwards relative to the body.
   The cycle RATE is derived from the convoy's own speed rather than picked
   by eye: over a stance half-cycle the mean backward foot speed is
   STRIDE*omega*2/pi, so omega = pi*speed/(2*STRIDE) makes planted feet
   track the ground at the creature's actual travel speed instead of
   skating. */
var STRIDER_STRIDE = 7.5, STRIDER_LIFT = 3.0;
var STRIDER_GAIT_PAIR = Math.PI*2/3;
var STRIDER_KNEE_OUT = 3.6, STRIDER_KNEE_UP = 3.9;
var STRIDER_FEMUR_W = 1.15, STRIDER_TIBIA_W = 0.78;
var STRIDER_BOB = 0.38, STRIDER_ROLL = 0.030;
/* STRIDER_FOOT_DROP / STRIDER_FOOT_RISE (how far a foot may hunt below and
   above the body's own ground plane before it is clamped — stops a foot
   disappearing down a canton edge or a riverbank while the body is still on
   the road above it) and STRIDER_WADE_DEPTH (how far the body origin may
   sink) are declared in the WADING block at the TOP of this file, because
   the router up there derives STRIDER_WADE_MAX from them and runs at load
   time, long before this line. */
var STRIDER_GROUND_EPS = 0.15;   /* the same epsilon every citizen stands on */

var STRIDER_LANTERN_Y = STRIDER_HOWDAH_FLOOR + 2.8;   /* on the howdah's front rail */
var STRIDER_SEAT_Y = STRIDER_HOWDAH_FLOOR + 1.5;      /* person geometry is centred, not footed */

/* ---- rendering scratch ---- */
var lifeStriderLeadPos = new THREE.Vector3();
var lifeStriderCarPos = new THREE.Vector3();
var lifeStriderCarDir = new THREE.Vector3();
var lifeStriderTmpDir = new THREE.Vector3();
var lifeStriderTmpPos = new THREE.Vector3();
var lifeStriderTmpQuat = new THREE.Quaternion();
var lifeStriderRollQuat = new THREE.Quaternion();
var lifeStriderFwd = new THREE.Vector3(0,0,1);
var lifeStriderTmpMat = new THREE.Matrix4();
var lifeStriderScale1 = new THREE.Vector3(1,1,1);
var lifeStriderScaleZero = new THREE.Vector3(0,0,0);
var striderLegP = new THREE.Vector3(), striderLegDir = new THREE.Vector3();
var striderLegQ = new THREE.Quaternion(), striderLegS = new THREE.Vector3();
var striderLegM = new THREE.Matrix4();
/* per-instance tints. setColorAt multiplies the baked vertex colour, so
   these are lifted well toward white: the canopy/rails (baked pure white)
   come out frankly jade or frankly grey, while the chitin underneath only
   takes a tinge instead of going muddy. PAL-sourced per this project's
   colour rule. */
function striderTint(hex, toWhite){
  var c = new THREE.Color(hex);
  c.r += (1-c.r)*toWhite; c.g += (1-c.g)*toWhite; c.b += (1-c.b)*toWhite;
  return c;
}
var lifeStriderPaxColor = striderTint(JADEC[2], 0.30);
var lifeStriderCargoColor = striderTint(GREYC[1], 0.30);
var LIFE_STRIDER_CAR_GAP = 50.0;   /* arc-length spacing between creatures in a convoy — the model is 40.7 long nose to tail after the snout trim, so this is a real gap, not an overlap */

/* park every slot hidden before the first real frame runs, so an unused
   3rd-creature/partial-rider slot never flashes a stray instance at the
   world origin.

   THE INSTANCE-COLOUR TRAP, still guarded: THREE allocates a mesh's
   instanceColor buffer lazily, ZERO-initialised (= black), on the first
   setColorAt() call anywhere on that mesh — which once turned every real
   merchant caravan black the moment strider tinting was added to the mesh
   they were sharing. striderMesh is no longer shared with anything, but the
   trap is identical in kind: any slot this file tints must have every OTHER
   slot on the same mesh explicitly white first, or a hidden slot that later
   becomes visible inherits black. So: white the whole mesh up front, once.
   lifeCaravanMesh is now touched by NOTHING in this file — no setColorAt,
   no setMatrixAt — so its instanceColor buffer is never allocated at all
   and the real caravans are back to their own plain baked colours. */
(function(){
  var k, white = new THREE.Color(0xffffff);
  for(k=0;k<LIFE_STRIDER_CAR_SLOTS;k++){
    striderMesh.setColorAt(k, white);
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    striderMesh.setMatrixAt(k, lifeStriderTmpMat);
  }
  for(k=0;k<LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY;k++){
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    striderLegMesh.setMatrixAt(k, lifeStriderTmpMat);
  }
  for(k=0;k<LIFE_STRIDER_RIDER_SLOTS;k++){
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    lifePedMesh.setMatrixAt(LIFE_STRIDER_RIDER_BASE+k, lifeStriderTmpMat);
  }
  striderMesh.instanceColor.needsUpdate = true;
  striderMesh.instanceMatrix.needsUpdate = true;
  striderLegMesh.instanceMatrix.needsUpdate = true;
  lifePedMesh.instanceMatrix.needsUpdate = true;
})();

/* place one leg segment: a unit bar stood from a to b. */
function striderBar(idx, ax,ay,az, bx,by,bz, w){
  var dx=bx-ax, dy=by-ay, dz=bz-az;
  var len = Math.sqrt(dx*dx+dy*dy+dz*dz) || 0.001;
  striderLegDir.set(dx/len, dy/len, dz/len);
  striderLegQ.setFromUnitVectors(LIFE_UP, striderLegDir);
  striderLegP.set(ax,ay,az);
  striderLegS.set(w, len, w);
  striderLegM.compose(striderLegP, striderLegQ, striderLegS);
  striderLegMesh.setMatrixAt(idx, striderLegM);
}

/* walk one creature's six legs. gIdx is its global creature slot (0..59);
   cx/cy/cz is its body origin (cy IS the foot/ground plane, see the model
   comment), yaw its heading, gait its own cycle phase. */
function striderPlaceLegs(gIdx, cx, cy, cz, yaw, gait){
  var cs = Math.cos(yaw), sn = Math.sin(yaw);
  var base = gIdx*STRIDER_BARS_PER_BODY;
  for(var i=0;i<STRIDER_LEGS;i++){
    var pair = i>>1, side = (i&1) ? -1 : 1;
    var hzl = STRIDER_HIP_Z[pair];
    /* local->world for a yaw-only frame: +z is forward, +x is to the right */
    var hx = cx + side*STRIDER_HIP_X*cs + hzl*sn;
    var hz = cz - side*STRIDER_HIP_X*sn + hzl*cs;
    var hy = cy + STRIDER_HIP_Y;
    var ph = gait + pair*STRIDER_GAIT_PAIR + (side<0 ? Math.PI : 0);
    var fzl = hzl + Math.cos(ph)*STRIDER_STRIDE;
    var fxl = side*STRIDER_FOOT_X;
    var fx = cx + fxl*cs + fzl*sn;
    var fz = cz - fxl*sn + fzl*cs;
    var fg = lifeGroundY(fx,fz);
    if(fg < cy-STRIDER_FOOT_DROP) fg = cy-STRIDER_FOOT_DROP;
    if(fg > cy+STRIDER_FOOT_RISE) fg = cy+STRIDER_FOOT_RISE;
    var fy = fg + Math.max(0, Math.sin(ph))*STRIDER_LIFT;
    /* knee: push the hip->foot midpoint up and outward, giving the high
       bent spider knee that makes a long leg read as jointed rather than
       as a stick. Segment lengths fall out of the geometry (each bar is
       scaled to whatever it actually spans), so nothing has to be solved. */
    var kx = (hx+fx)*0.5 + cs*side*STRIDER_KNEE_OUT;
    var ky = (hy+fy)*0.5 + STRIDER_KNEE_UP;
    var kz = (hz+fz)*0.5 - sn*side*STRIDER_KNEE_OUT;
    striderBar(base+i*2,   hx,hy,hz, kx,ky,kz, STRIDER_FEMUR_W);
    striderBar(base+i*2+1, kx,ky,kz, fx,fy,fz, STRIDER_TIBIA_W);
  }
}
function striderHideLegs(gIdx){
  var base = gIdx*STRIDER_BARS_PER_BODY;
  for(var i=0;i<STRIDER_BARS_PER_BODY;i++){
    striderLegM.compose(striderLegP.set(0,0,0), striderLegQ.identity(), lifeStriderScaleZero);
    striderLegMesh.setMatrixAt(base+i, striderLegM);
  }
}

/* boarding, at an interior stop's own station door — a direct copy of
   lifeFerryBoard's own logic (78-life.js), against a strider CAR instead
   of a ferry. Cargo cars never call this (no passenger seats). */
function striderBoard(car, stationDoor){
  car.onboard = car.onboard || 0;
  var alight = Math.min(car.onboard, ri(1,3));
  car.onboard -= alight;
  var reactivated = 0;
  for(var i=0; i<LIFE_PEDS.length && reactivated<alight; i++){
    var pp = LIFE_PEDS[i];
    if(!pp || pp.state !== 'boarded' || pp.ferryRef !== car) continue;
    var newDest = lifePedPickDestination(stationDoor.x, stationDoor.z, 'strider');
    if(newDest){
      newDest.active++;
      pp.curve = lifePedBuildLeg(stationDoor.x, stationDoor.z, newDest.x, newDest.z);
      pp.len = pp.curve.getLength(); pp.dur = Math.max(3, pp.len/pp.speed);
      pp.destDoor = newDest; pp.state = 'walk'; pp.stateT = 0; pp.ferryRef = null;
    }else{
      LIFE_PEDS[i] = lifePedSpawn();
    }
    reactivated++;
  }
  var room = Math.max(0, LIFE_STRIDER_RIDER_PER_CAR - car.onboard);
  var boarding = Math.min(3, stationDoor.queueCount||0, room);
  stationDoor.queueCount = (stationDoor.queueCount||0) - boarding;
  var boarded = 0;
  for(var j=0; j<LIFE_PEDS.length && boarded<boarding; j++){
    var pq = LIFE_PEDS[j];
    if(!pq || pq.state !== 'queued' || pq.destDoor !== stationDoor) continue;
    pq.state = 'boarded'; pq.ferryRef = car; boarded++;
  }
  car.onboard += boarded;
}

function updateStriders(dt){
  LIFE_STRIDERS.forEach(function(cv, ci){
    cv.stateT += dt;
    var pos, yaw, wasTransit = false, transitLeg = null, transitUc = 0, transitDir = 1;

    if(cv.state === 'docked'){
      var st = cv.route.stops[cv.idx];
      pos = st; yaw = st.ry || 0;
      if(cv.stateT >= cv.dwell){
        var nextIdx = cv.idx + cv.dir;
        cv.legIdx = Math.min(cv.idx, nextIdx);
        cv.curveDir = cv.dir;
        cv.curveT = 0;
        cv.curve = cv.route.legs[cv.legIdx];
        cv.legLen = cv.curve.getLength();
        cv.state = 'transit'; cv.stateT = 0;
      }
    }else{
      var leg = cv.curve;
      var u = (cv.curveDir>0) ? cv.curveT : (1-cv.curveT);
      var uc = Math.min(0.998, Math.max(0.002, u));
      leg.getPointAt(uc, lifeStriderLeadPos);
      leg.getTangentAt(uc, lifeStriderTmpDir);
      var h = terrainH(lifeStriderLeadPos.x, lifeStriderLeadPos.z);
      var factor = (h < 2) ? 0.75 : 1.0;   /* wade, at 75% speed, in water — everywhere else, full speed on the road */
      cv.curveT = Math.min(1, cv.curveT + (cv.speed*factor*dt)/cv.legLen);
      pos = lifeStriderLeadPos;
      var dirx = lifeStriderTmpDir.x*cv.curveDir, dirz = lifeStriderTmpDir.z*cv.curveDir;
      yaw = Math.atan2(dirx, dirz);
      /* NOT the creature's ground clearance — only pos.x/pos.z are read
         below; each creature's own y is derived from its OWN lagged
         position further down (see STRIDER_GROUND_EPS / STRIDER_WADE_DEPTH
         at the matrix compose). Kept so the lead sample is a complete
         point for anything that inspects it. */
      pos.y = Math.max(LIFE_Y, lifeGroundY(pos.x,pos.z)+0.15);
      wasTransit = true; transitLeg = leg; transitUc = uc; transitDir = cv.curveDir;
      if(cv.curveT >= 1){
        var nextIdx2 = cv.idx + cv.dir;
        if(nextIdx2 <= 0 || nextIdx2 >= cv.route.stops.length-1){
          /* reached a terminus: respawn fresh, same route, same slot, same
             direction — keeps that route's own half/half split invariant
             true forever. */
          LIFE_STRIDERS[ci] = striderSpawnConvoy(cv.route, cv.slot, cv.dir, 0);
          return;
        }
        cv.idx = nextIdx2;
        cv.state = 'docked'; cv.stateT = 0; cv.dwell = rr(14,26);
        var stationDoor = cv.route.stops[cv.idx].door;
        if(stationDoor){
          cv.cars.forEach(function(car){ if(car.variant==='pax') striderBoard(car, stationDoor); });
        }
      }
    }

    var riderBase0 = LIFE_STRIDER_RIDER_BASE + cv.slot*LIFE_STRIDER_CARS_PER_CONVOY*LIFE_STRIDER_RIDER_PER_CAR;

    for(var k=0;k<LIFE_STRIDER_CARS_PER_CONVOY;k++){
      var car = cv.cars[k];
      var riderBase = riderBase0 + k*LIFE_STRIDER_RIDER_PER_CAR;
      var gIdx = cv.slot*LIFE_STRIDER_CARS_PER_CONVOY + k;   /* global creature slot, 0..LIFE_STRIDER_CAR_SLOTS-1 */
      if(!car){
        lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
        striderMesh.setMatrixAt(gIdx, lifeStriderTmpMat);
        striderHideLegs(gIdx);
        for(var rs0=0; rs0<LIFE_STRIDER_RIDER_PER_CAR; rs0++) lifePedMesh.setMatrixAt(riderBase+rs0, lifeStriderTmpMat);
        if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_STRIDER_BASE + gIdx, 0,0,0, false);
        continue;
      }
      /* owner: "they shouldn't all turn as a unit... should delay a
         fraction of a second before turning to actually follow them" —
         a trailing car used to reuse the LEAD car's own instantaneous
         yaw, just offset in position by arc length; every car in the
         convoy span a turn identically, in lockstep. Each car now
         samples the SAME curve at its OWN lagged arc-position instead
         (a real "where the leader was a moment ago", not a flat spatial
         offset applied to the leader's current heading) — its position
         AND heading both come from that lagged sample, so a trailing
         car only starts turning once it actually reaches the bend the
         leader already turned at. */
      var lag = k*LIFE_STRIDER_CAR_GAP;
      var carPos = pos, carYaw = yaw;
      if(wasTransit && k>0 && transitLeg){
        var uLag = Math.min(0.998, Math.max(0.002, transitUc - (transitDir>0 ? lag/cv.legLen : -lag/cv.legLen)));
        transitLeg.getPointAt(uLag, lifeStriderCarPos);
        transitLeg.getTangentAt(uLag, lifeStriderCarDir);
        var cdx = lifeStriderCarDir.x*transitDir, cdz = lifeStriderCarDir.z*transitDir;
        carYaw = Math.atan2(cdx, cdz);
        carPos = lifeStriderCarPos;
      }
      var cx, cz;
      if(wasTransit && k>0){
        cx = carPos.x + (-Math.cos(carYaw))*cv.laneOffset;
        cz = carPos.z + ( Math.sin(carYaw))*cv.laneOffset;
      }else{
        /* docked (or the lead car): no curve to sample, park spread out
           along the shared heading same as before */
        cx = pos.x - Math.sin(yaw)*lag + (-Math.cos(yaw))*cv.laneOffset;
        cz = pos.z - Math.cos(yaw)*lag + ( Math.sin(yaw))*cv.laneOffset;
      }
      /* GROUND CLEARANCE, derived from the real model rather than tuned:
         the creature is authored with y = 0 at its own foot/ground contact
         plane (see the model section's frame comment) and is instanced at
         scale 1, so the body origin sits at exactly lifeGroundY() plus the
         same 0.15 epsilon every citizen in the city stands on. The old
         `0.15*LIFE_STRIDER_SCALE + 1.6` fudge existed only because a cart
         template was being blown up 2.3x about a pivot that was not at
         wheel-ground contact; there is no such pivot error to compensate
         for now, and no scale factor to multiply it by.

         The one deliberate exception is water. Plain terrain height under
         a river is the BED, tens of units down — a strider is meant to
         WADE, so it stands on the real bed until the bed falls more than
         STRIDER_WADE_DEPTH below the surface, at which point the foot
         plane pins there and the legs simply go deeper into the water
         while the underbelly stays clear of it. (The old code clamped to
         LIFE_Y, which floated a cart ON the surface — wrong shape of fix
         for a creature that walks on the bottom.) */
      var cy = Math.max(lifeGroundY(cx,cz) + STRIDER_GROUND_EPS, LIFE_Y - STRIDER_WADE_DEPTH);

      /* gait: advance only while actually travelling, at the rate that
         makes planted feet track the ground at the creature's own speed
         (see STRIDER_STRIDE's comment for the omega derivation). Docked
         creatures hold their phase, so they stand still instead of
         marching on the spot at a station. */
      if(wasTransit) car.gait += dt * (Math.PI*cv.speed) / (2*STRIDER_STRIDE);
      var bob = wasTransit ? Math.sin(car.gait*2)*STRIDER_BOB : 0;
      var roll = wasTransit ? Math.sin(car.gait)*STRIDER_ROLL : 0;

      lifeStriderTmpPos.set(cx, cy + bob, cz);
      lifeStriderTmpQuat.setFromAxisAngle(LIFE_UP, carYaw);
      if(roll) lifeStriderTmpQuat.multiply(lifeStriderRollQuat.setFromAxisAngle(lifeStriderFwd, roll));
      lifeStriderTmpMat.compose(lifeStriderTmpPos, lifeStriderTmpQuat, lifeStriderScale1);
      striderMesh.setMatrixAt(gIdx, lifeStriderTmpMat);
      striderMesh.setColorAt(gIdx, car.variant==='pax' ? lifeStriderPaxColor : lifeStriderCargoColor);
      striderPlaceLegs(gIdx, cx, cy, cz, carYaw, car.gait);
      car.wx = cx; car.wy = cy; car.wz = cz; car.wyaw = carYaw;   /* diagnostic only — window._striders.live() */

      /* owner: "...and silt striders have a lantern" — one per creature, on
         the same shared nlMesh (82-daynight.js) every other moving lantern
         uses, hung off the howdah's own front rail. */
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_STRIDER_BASE + gIdx, cx, cy+STRIDER_LANTERN_Y, cz);

      if(car.variant === 'pax'){
        /* riders sit IN the howdah, two abreast in four rows — real seats
           on the real pod, not a ring of figures floating over a cart. */
        var onboard = Math.min(LIFE_STRIDER_RIDER_PER_CAR, car.onboard||0);
        var rcs = Math.cos(carYaw), rsn = Math.sin(carYaw);
        for(var s=0;s<LIFE_STRIDER_RIDER_PER_CAR;s++){
          if(s < onboard){
            var sxl = ((s&1) ? -1 : 1)*2.0;
            var szl = STRIDER_HOWDAH_Z + 3.0 - (s>>1)*2.1;
            lifeStriderTmpPos.set(cx + sxl*rcs + szl*rsn,
                                  cy + bob + STRIDER_SEAT_Y,
                                  cz - sxl*rsn + szl*rcs);
            lifeStriderTmpMat.compose(lifeStriderTmpPos, lifeStriderTmpQuat, lifeStriderScale1);
          }else{
            lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat, lifeStriderScaleZero);
          }
          lifePedMesh.setMatrixAt(riderBase+s, lifeStriderTmpMat);
        }
      }else{
        for(var s2=0;s2<LIFE_STRIDER_RIDER_PER_CAR;s2++){
          lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat, lifeStriderScaleZero);
          lifePedMesh.setMatrixAt(riderBase+s2, lifeStriderTmpMat);
        }
      }
    }
  });
  striderMesh.instanceMatrix.needsUpdate = true;
  striderMesh.instanceColor.needsUpdate = true;
  striderLegMesh.instanceMatrix.needsUpdate = true;
  lifePedMesh.instanceMatrix.needsUpdate = true;
}
