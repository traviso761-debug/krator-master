/* ============================== NEW CURTAIN WALL (point-designated) =======
   Legacy WALL/GATES (sampled off shoreIn(s, wallOffset(s)), removed above)
   are replaced by the owner's explicit 17-vertex tower chain, walked in
   order; a gate goes in only where that line actually crosses a real road
   (major class only: quay/boulevard/ring/highway — not minor/warren alleys
   or farm tracks). Needs the FULL road graph, so it lives here, after
   buildRoadGraph()'s final call and nearestStreet's own declaration above,
   not up by the old WALL's spot.

   Gate orientation: the twin-pier gate builders (65-facade.js) spread their
   piers along local +z (loc()'s lateral axis — see facadeFindGateSite's own
   siting comment) with local +x as the facing/passage axis. The owner wants
   the piers' own axis (long axis) PERPENDICULAR to the crossing road, i.e.
   the facing axis must run PARALLEL to the road tangent: local +x =
   (cos ry,-sin ry) ‖ (tx,tz)  =>  ry = atan2(-tz,tx) — the same
   atan2(-dz,dx) "align along a heading" form documented for faceToward() in
   69-district-content.js, not a "face toward a point" call. */

var WALLPTS = [[1449.6,-1025.6],[1495.6,-920.8],[1487.0,-785.4],[1473.9,-643.6],
  [1456.6,-486.6],[1489.5,-348.2],[1516.0,-202.3],[1539.7,-34.7],[1467.2,195.2],
  [1471.2,365.8],[1466.3,505.2],[1465.0,616.8],[1480.6,753.6],[1374.3,873.7],
  [1295.4,916.3],[1193.4,969.2],[1149.0,1052.7]];

/* the owner's 3 named gates — each quad bounds roughly where the wall
   crosses that specific road; the true site is wherever the wall segment
   and a real major-road edge inside the quad actually intersect. */
var NAMED_GATE_QUADS = [
  { name:'HarborGate', quad:[[1371.3,-1055.9],[1376.0,-900.2],[1517.6,-901.9],[1499.8,-1055.2]] },
  { name:'SpiritGate',  quad:[[1432.2,542.4],[1433.6,602.4],[1487.1,604.2],[1485.1,544.5]] },
  { name:'RiverGate',   quad:[[1073.9,1029.8],[1119.5,925.9],[1208.5,964.5],[1139.5,1084.8]] }
];

var WALL_MAJOR_CLS = { quay:1, boulevard:1, ring:1, highway:1 };

function wallQuadBounds(q, pad){
  var x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  q.forEach(function(p){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<z0)z0=p[1]; if(p[1]>z1)z1=p[1]; });
  return { x0:x0-pad, x1:x1+pad, z0:z0-pad, z1:z1+pad };
}
function wallInBounds(x,z,b){ return x>=b.x0 && x<=b.x1 && z>=b.z0 && z<=b.z1; }
/* segment/segment intersection: AB (a wall segment) x CD (a road edge) */
function wallSegXseg(ax,az,bx,bz,cx,cz,dx,dz){
  var r0x=bx-ax, r0z=bz-az, r1x=dx-cx, r1z=dz-cz;
  var denom = r0x*r1z - r0z*r1x;
  if(Math.abs(denom) < 1e-9) return null;
  var t = ((cx-ax)*r1z - (cz-az)*r1x)/denom;
  var u = ((cx-ax)*r0z - (cz-az)*r0x)/denom;
  if(t<0||t>1||u<0||u>1) return null;
  return { x:ax+r0x*t, z:az+r0z*t, t:t, tx:r1x, tz:r1z };
}

/* every wall-segment x major-road-edge crossing, against the FINAL road
   graph (RNODE/REDGE, built above) */
var WALL_CROSSINGS = [];
(function(){
  for(var si=0; si<WALLPTS.length-1; si++){
    var ax=WALLPTS[si][0], az=WALLPTS[si][1], bx=WALLPTS[si+1][0], bz=WALLPTS[si+1][1];
    for(var ei=0; ei<REDGE.length; ei++){
      var e = REDGE[ei];
      if(!WALL_MAJOR_CLS[e.cls]) continue;
      var A=RNODE[e.a], B=RNODE[e.b];
      var hit = wallSegXseg(ax,az,bx,bz, A.x,A.z,B.x,B.z);
      if(!hit) continue;
      var tl = Math.hypot(hit.tx,hit.tz) || 1;
      WALL_CROSSINGS.push({ segIdx:si, segT:hit.t, x:hit.x, z:hit.z,
                             tx:hit.tx/tl, tz:hit.tz/tl, cls:e.cls });
    }
  }
})();

/* the 3 named gates: closest crossing to each quad's own centroid,
   restricted to points that actually fall inside that quad */
var NAMED_GATES = [];
NAMED_GATE_QUADS.forEach(function(ng){
  var b = wallQuadBounds(ng.quad, 6);
  var cx = (ng.quad[0][0]+ng.quad[1][0]+ng.quad[2][0]+ng.quad[3][0])/4;
  var cz = (ng.quad[0][1]+ng.quad[1][1]+ng.quad[2][1]+ng.quad[3][1])/4;
  var best=null, bd=1e18;
  WALL_CROSSINGS.forEach(function(c){
    if(!wallInBounds(c.x,c.z,b)) return;
    var d = Math.hypot(c.x-cx, c.z-cz);
    if(d<bd){ bd=d; best=c; }
  });
  if(best) NAMED_GATES.push({ name:ng.name, x:best.x, z:best.z, tx:best.tx, tz:best.tz, segIdx:best.segIdx, segT:best.segT });
});

/* every other major-road crossing becomes a generic gate — cluster
   crossings within 40 units into one site (a junction can leave two REDGE
   edges of the same physical road each crossing the line a hair apart on
   either side of a node), and drop anything already claimed by a named
   gate above. */
var GENERIC_GATES = [];
(function(){
  var ordered = WALL_CROSSINGS.slice().sort(function(a,b){ return (a.segIdx+a.segT) - (b.segIdx+b.segT); });
  var clusters = [];
  ordered.forEach(function(c){
    var nearNamed = NAMED_GATES.some(function(g){ return Math.hypot(g.x-c.x, g.z-c.z) < 70; });
    if(nearNamed) return;
    var nearCluster = clusters.some(function(cl){ return Math.hypot(cl.x-c.x, cl.z-c.z) < 40; });
    if(nearCluster) return;
    clusters.push(c);
  });
  clusters.forEach(function(c){
    GENERIC_GATES.push({ x:c.x, z:c.z, tx:c.tx, tz:c.tz, segIdx:c.segIdx, segT:c.segT });
  });
})();

/* the ordered wall-node sequence: towers at integer keys (their own vertex
   index), gates at fractional keys (segIdx+segT, always strictly between
   the two towers flanking that segment) — sorting by key interleaves them
   correctly without any special-casing. THIS ORDER IS PROVISIONAL ONLY: it
   seeds a reasonable starting ry (for the site-search footprint below) and
   a cheap early reservation margin. The REAL connectivity — an actual
   nearest-neighbor graph over every node's final, post-site-search
   position — is rebuilt in 60-land.js's "18. CURTAIN WALL" once those
   positions are known (see that section's own comment for the full
   reasoning: this polyline order usually but is not guaranteed to match
   the nearest-neighbor result, and must not be assumed). */
var WNODES = [];
WALLPTS.forEach(function(p, i){ WNODES.push({ kind:'tower', x:p[0], z:p[1], key:i }); });
NAMED_GATES.forEach(function(g){
  WNODES.push({ kind:'gate', name:g.name, named:true, x:g.x, z:g.z, tx:g.tx, tz:g.tz, key:g.segIdx+g.segT });
});
GENERIC_GATES.forEach(function(g){
  WNODES.push({ kind:'gate', named:false, x:g.x, z:g.z, tx:g.tx, tz:g.tz, key:g.segIdx+g.segT });
});
WNODES.sort(function(a,b){ return a.key-b.key; });

/* damage state: destroyed=0, ruined=1, intact=2 ("health", per the owner's
   own worked examples). Named gates are always intact — real, functioning
   entries the life layer may route against, not ambient scenery. Every
   other tower/generic-gate rolls a weighted state.

   Provisional ry: every node (tower OR gate alike — no more kind-specific
   formula) takes the wall-tangent atan2(dx,dz) between its polyline-order
   neighbors, exactly the convention wallSegRender()/wallSegmentBasalt()
   already use for a segment's own long axis (confirmed against loc()'s own
   rotation math: the lz/local-z axis — a gate's long axis, its lateral
   pier spread per wallGateRuinA/B/C's own gapZ-vs-tw proportions — maps to
   world direction (sin ry, cos ry), so ry=atan2(dx,dz) puts local z flush
   with (dx,dz), i.e. flush with the wall run. One formula now serves
   towers, named gates and generic gates identically, per the owner's own
   "treat them the same" instruction — the old gate-only case that aligned
   to the crossing ROAD's tangent instead (tx,tz) was the ORIGINAL brief,
   explicitly superseded by the owner's own later correction.) 60-land.js
   overwrites this with the real graph-tangent ry once built; this is only
   the estimate the site search's own footprint orientation uses. */
reseed(300500);
function wallPickHealth(){
  var r = rnd();
  if(r < 0.45) return 2;        /* intact  ~45% */
  if(r < 0.80) return 1;        /* ruined  ~35% */
  return 0;                     /* destroyed ~20% */
}
WNODES.forEach(function(n, i){
  var prev = WNODES[Math.max(0,i-1)], next = WNODES[Math.min(WNODES.length-1,i+1)];
  n.ry = Math.atan2(next.x-prev.x, next.z-prev.z);
  n.health = n.named ? 2 : wallPickHealth();
});

/* WALL/GATES kept as the same shape every existing consumer already reads
   (68-props.js, 80-camera.js) — x/z/s/ry, indexable — so nothing downstream
   needs touching just because the source geometry changed. GATES itself is
   rebuilt (emptied here, filled in 60-land.js) once real positions/
   orientations are final — every consumer runs later in the concatenated
   build, after 60-land.js, so a stale provisional snapshot here would only
   go wrong the moment the site search or the graph rebuild moves anything,
   which per the fix below it usually still does not, but must not be
   assumed. */
var WALL = WALLPTS;
var GATES = [];

/* WSEGS: the final wall-body segment list (health-stated node-index pairs).
   Declared here empty, purely so 65-facade.js's overlap audit (which runs
   after 60-land.js in the concatenated build) can read it by the name it
   already does; 60-land.js's "18. CURTAIN WALL" populates it once the real
   nearest-neighbor graph is built from actual post-site-search positions. */
var WSEGS = [];

/* approximate footprints, reserved now so town/compound placement in
   60-land.js already avoids them from its very first candidate scan — belt
   to the real claim() calls the wall-building pass itself makes when it
   actually draws (60-land.js "18. CURTAIN WALL", which runs BEFORE any
   town/compound placement, so those claim()s are the real, exact
   prevention; this is just cheap extra margin ahead of that).

   Each wall-NODE reservation carries a `wallNode` backreference so
   60-land.js can evict exactly that one reservation right before running
   the node's own real, precise claim(). This eviction is the actual fix
   for the reported "wonky" connections: without it, this approximate
   margin reservation sits in PLACED FIRST (claimed at the top of
   60-land.js, well before the wall's own precise site search runs later in
   the same file), so the real claim() at the SAME point always collided
   with itself — confirmed empirically before this fix, every tower/gate
   was being forced off its ideal line by the site search's spiral (never
   landing at ring 0, its own exact anchor), while the wall segments
   between them still drew to the untouched ideal line, producing exactly
   the visible kinks the owner described. Segment reservations below need
   no such backreference/eviction: wallSegRender() never calls claim() for
   itself (no self-collision is possible there), so the approximate margin
   reservation IS the real, permanent protection for a segment's footprint
   — which is also exactly the "wall segments have highest priority to
   stay put" rule the owner asked for, satisfied by construction as long as
   a destroyed segment (see the health check below) is excluded from it. */
WNODES.forEach(function(n){
  if(n.kind==='tower') OBST.push({x:n.x,z:n.z,fx:10,fz:10,ry:n.ry,fixed:true,wallNode:n});
  else if(n.health > 0) OBST.push({x:n.x,z:n.z,fx:12,fz:20,ry:n.ry,fixed:true,wallNode:n});
});
for(var wm=0; wm<WNODES.length-1; wm++){
  var Am=WNODES[wm], Bm=WNODES[wm+1];
  if(Math.floor((Am.health+Bm.health)/2) <= 0) continue;   /* provisionally-destroyed: no margin, per the owner */
  var dxm=Bm.x-Am.x, dzm=Bm.z-Am.z, Lm=Math.hypot(dxm,dzm);
  if(Lm < 1) continue;
  reserve((Am.x+Bm.x)/2, (Am.z+Bm.z)/2, 6, Lm/2, Math.atan2(dxm,dzm));
}

/* ============================== elephant bug stations (Route 1) ===========
   Pre-reserved here, well before any procedural scatter (60-land.js) runs,
   so manor buildings/farmsteads/compounds can never grow through a future
   station footprint — same "reserve early, build for real later" pattern
   already used just above for wall towers/gates. The real platform/
   shelter/ramp geometry is built in 66-striders.js (loads after 60-land's
   own scatter, safely before 75-terrain.js's emitBuckets() drains BUCKET);
   the moving convoys themselves are 79-striders.js (after 78-life.js, for
   the road-graph machinery). Interior stops only — the route's two termini
   (turnaround points, not real stops, per the owner's own distinction) get
   no reservation. Same footprint half-extents (18 along the road, 9
   across) as 66-striders.js actually builds, so this reservation doubles
   as the final, real footprint — no second, more-precise claim() needed
   (unlike the wall's own gridRemove/re-claim trick, which only exists
   because the wall's site search moves the point after this early pass). */
[
  { x:-1806.4, z:2278.8, tx:-0.8320502943378437, tz:-0.5547001962252291 },
  { x:107.0,   z:2065.2, tx:0.217518812610881,   tz:0.9760561285911545 },
  { x:791.3,   z:1489.4, tx:0.9019646069836713,  tz:-0.4318099671716614 },
  { x:1181.1,  z:1453.2, tx:0.8893017314745645,  tz:-0.4573209271357934 },
  { x:1938.9,  z:1701.5, tx:0.8642872019638728,  tz:0.5029986406755586 },
  { x:2949.4,  z:1710.7, tx:0.980823374416306,   tz:0.19489871266535125 }
].forEach(function(p,pi){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
  if(pi===5){   /* easternmost stop: also reserve its shrine, offset sideways
                   so it doesn't collide with the platform itself */
    var sp = loc(p.x, p.z, 4, 34, ry);
    reserve(sp[0], sp[1], 7, 4, ry+Math.PI/2);
  }
});

/* ============================== elephant bug stations (Route 2) ===========
   Same early-reservation pattern as Route 1's own block just above — see
   that block's comment for the full reasoning, not repeated here. Route 2's
   5 interior points (66-striders.js/79-striders.js — the route's own first
   and last points are termini, no station, no reservation, same as Route
   1's). None of these 5 points land on/near an existing Route 1 station
   (checked live via the shared position-keyed registry's own snap radius —
   66-striders.js's striderFindStation()/striderRegisterStation() — before
   writing this list; the two routes run through entirely different parts
   of the map, z>~1450 for Route 1's stops vs z<~-300 for Route 2's), so
   all 5 reserve fresh footprints here exactly like Route 1's did. If a
   future route's vertex ever DOES coincide with one of these, the registry
   in 66-striders.js is what skips the duplicate BUILD — this early
   reservation pass doesn't need its own coincidence check, since reserving
   the same footprint twice is harmless (just redundant), unlike building
   the geometry twice. */
[
  { x:2275.3,  z:-1364.7, tx:1,                    tz:0 },
  { x:1413.8,  z:-957.1,  tx:-0.20317289800387703, tz:0.9791428769677621 },
  { x:759.2,   z:-411.3,  tx:0.19082757228688982,  tz:-0.9816235722796656 },
  { x:-790.5,  z:-307.4,  tx:0.6686019937136221,   tz:0.7436204502312789 },
  { x:-1751.4, z:-1036.0, tx:-0.7682761317017722,  tz:-0.6401185714048304 }
].forEach(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
});

/* ============================== elephant bug stations (Route 3) ===========
   Same early-reservation pattern as Routes 1 and 2 just above. Route 3's
   11-point list (owner-given) has 9 interior stops, but a LIVE check against
   the shared position-keyed registry (66-striders.js's striderFindStation(),
   snap tolerance 25 units) found that 6 of those 9 land on an already-built
   Route 1 or Route 2 station: (2280.8,-1356.9)->R2 stop1, (1416.3,-957.1)->
   R2 stop2, (764.6,-410.6)->R2 stop3, (1187.7,1453.9)->R1 stop4,
   (795.1,1487.9)->R1 stop3, (111.5,2065.2)->R1 stop2 — all within ~10 units,
   clearly the owner's own intended reuse per the standing "if a vertex is on
   an existing station, incorporate it into the route" plan. Only the 3
   genuinely NEW stops get a fresh footprint reserved here; the other 6 keep
   the footprint Route 1/2's own blocks above already reserved (reserving the
   same footprint twice is harmless per that block's own comment, but skipped
   here since it's simple to know which ones are new).

   The 3rd of these (owner's raw point 9: 212.2,2820.0) sits at d=2820 on
   verify.py's own max(|x|,|z|) built-inside-limit measure -- past
   CITY_LIM+300(=2580), the same "built fabric must stay inside the city"
   invariant Route 1's own eastern-nucleus stop happens to clear only by
   sitting within 130 of a real farm field (checked live, coincidental).
   No farm/manor/shrine sits within reach of the raw point here (checked
   live against window._api.FARMS/MANORS/SILHOUETTE_SHRINES -- nearest
   farm is 213 away, over the 130 exemption radius), so this stop is
   nudged along its own road (nearestStreet, live) toward the city instead,
   same category of move as the terminus dry-ground/hill nudges just below
   in 79-striders.js: z 2820 -> 2500 clears the limit with a safe margin
   (d=2500, ~80 under the 2580 ceiling, well past the platform's own
   ~20-25 unit extent). */
[
  { x:878.7,  z:182.0,  tx:0.9559034445674892, tz:-0.2936811275244105 },
  { x:1212.6, z:995.4,  tx:0.537715394629288,  tz:-0.8431264166058784 },
  { x:212.2,  z:2500.0, tx:-0.07124704998790961, tz:0.997458699830735 }
].forEach(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
});

window._layout = { cantons:CANTONS.length, spans:SPANS.length, roads:ROADS.length,
                   wall:WALL.length, farms:FARMS.length, rpiers:RPIERS.length };

