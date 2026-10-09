/* ============================== ELEPHANT BUG CONVOYS (moving) ==============
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
   section "THE BESPOKE ELEPHANT BUG MODEL" below builds a real creature —
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
   Every number that decides how deep an elephant bug will go, and how deep
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
   places, so the open bay is still firmly out of bounds — an elephant bug
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

