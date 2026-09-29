/* ============================== global nav-grid + A* =======================
   The owner asked how feasible real pathfinding was (vs. the heuristic
   above — seed a couple of waypoints, sample the built curve, nudge
   whichever point is worst, repeat), specifically wanting routes that go
   AROUND a dense obstacle field instead of needing correction after the
   fact, as a base for real dodge/queue behaviour later. This is that:
   a coarse grid over the bay/city area, each cell classified blocked/open
   ONCE at load using the exact same obstacle queries already proven
   above (lifeCantonBlocked, terrainH) plus chinHit (55-chinampa.js, the
   real per-bed spatial hash, not a zone-level approximation) and a
   point-to-segment check against every real pier/quay segment (PIERS/
   CPIERS/RPIERS, 30-layout.js) — then plain A* over that grid, smoothed
   into a curve. This is the GLOBAL half only (routes around fixed
   obstacles); local steering/collision avoidance between moving vehicles
   is a separate, later piece — see the note at the bottom of this
   section. */
var LIFE_NAV_CELL = 26;    /* close to the chinampas' own rowSpacing (24) so a grid cell can actually resolve a canal from a bed row */
var LIFE_NAV_MINX = -2850, LIFE_NAV_MAXX = 2850, LIFE_NAV_MINZ = -2850, LIFE_NAV_MAXZ = 2850;   /* covers every canton/chinampa/pier this session ever touched, well past CITY_LIM (2280) */
var LIFE_NAV_W = Math.ceil((LIFE_NAV_MAXX-LIFE_NAV_MINX)/LIFE_NAV_CELL);
var LIFE_NAV_H = Math.ceil((LIFE_NAV_MAXZ-LIFE_NAV_MINZ)/LIFE_NAV_CELL);
function lifeNavCellCenter(cx, cz){ return [LIFE_NAV_MINX+(cx+0.5)*LIFE_NAV_CELL, LIFE_NAV_MINZ+(cz+0.5)*LIFE_NAV_CELL]; }
function lifeNavWorldToCell(x, z){ return [Math.floor((x-LIFE_NAV_MINX)/LIFE_NAV_CELL), Math.floor((z-LIFE_NAV_MINZ)/LIFE_NAV_CELL)]; }
/* point-to-segment distance — the same formula verify.py's own segD
   uses, just not previously needed in the game source itself. */
function lifeSegDist(px, pz, ax, az, bx, bz){
  var dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz;
  var t = L ? ((px-ax)*dx+(pz-az)*dz)/L : 0; t = Math.max(0, Math.min(1,t));
  return Math.hypot(px-ax-t*dx, pz-az-t*dz);
}
/* NOT lifeCantonBlocked() — real bug measured directly (A* returning
   null for every single test route): that function's clearR
   (c.r*1.45/max(|cos|,|sin|) + 40) is a generous MID-ROUTE steering
   margin, tuned to keep a curve well clear of a canton while sailing
   past it in open water. A ferry/canton dock sits essentially AT the
   canton's own edge by design (the pier extends just past it) — using
   the open-water margin to classify grid cells marked EVERY dock itself
   as blocked, along with a 300-500+ unit halo around every canton, and
   lifeNavNearestOpen's own search radius (10 cells = 260 units) often
   couldn't escape it. This uses the canton's real physical cap
   half-width (lifeCantonEdge's own capHw, 65-facade.js) plus a small
   hull-clearance margin instead — "is this cell physically obstructed",
   not "should a route stay well clear of this on the open bay". */
function lifeNavCantonBlocked(x, z){
  for(var i=0; i<CANTONS.length; i++){
    var c = CANTONS[i];
    var dx=x-c.x, dz=z-c.z, d=Math.hypot(dx,dz)||1;
    var ang = Math.atan2(dz,dx);
    var capHw = c.r*1.07/Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 10;
    if(d < capHw) return true;
  }
  return false;
}
function lifeNavBlocked(x, z){
  if(terrainH(x,z) > -1.5) return true;
  if(lifeNavCantonBlocked(x,z)) return true;
  if(chinHit(x,z,7)) return true;
  for(var i=0;i<PIERS.length;i++){ var p=PIERS[i]; if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5+6) return true; }
  for(var j=0;j<CPIERS.length;j++){ var c=CPIERS[j]; if(lifeSegDist(x,z,c.x0,c.z0,c.x1,c.z1) < c.w*0.5+6) return true; }
  for(var k=0;k<RPIERS.length;k++){ var r=RPIERS[k]; if(lifeSegDist(x,z,r.x0,r.z0,r.x1,r.z1) < r.w*0.5+6) return true; }
  /* the owner: "ferries clip through piers still" — LIFE_EXTRA_PIERS
     (65-facade.js) is every ferry-stop pier this session's life layer
     itself built (lifeBuildFerryPier); this grid previously only knew
     about the 3 arrays above, all from 30-layout.js, so a route past a
     ferry's OWN stop (or anyone else's) could cut straight through its
     deck. 65-facade.js runs before this file, so the array is already
     full by the time the grid below is built. */
  for(var m=0;m<LIFE_EXTRA_PIERS.length;m++){ var e=LIFE_EXTRA_PIERS[m]; if(lifeSegDist(x,z,e.x0,e.z0,e.x1,e.z1) < e.w*0.5+6) return true; }
  /* bridge support pylons (BRIDGE_SUPPORTS, span(), 50-cantons.js) — the
     owner: "ferries still clip through bridge supports". Real solid piers
     standing mid-channel that nothing in this grid knew about before. */
  for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){ var bs=BRIDGE_SUPPORTS[n2]; if(Math.hypot(x-bs.x,z-bs.z) < bs.r+6) return true; }
  /* the 4 permanently-docked stationary ships (LIFE_SHIP_STATIONARY_DOCKS,
     ship section below) — big, fixed, real obstacles for anyone else
     routing nearby ("ferries are also clipping through... the stationary
     ships"). A circle is a rough stand-in for a ~30-60 long hull, but
     good enough to make A* actually route around it rather than through
     its centre. Guarded because this function is also called (indirectly,
     via lifeNavCellCenter loops elsewhere) before that array exists in
     file order — empty array just means the loop below is a no-op then. */
  if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
    for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
      var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
      if(Math.hypot(x-sd.x, z-sd.z) < 26) return true;
    }
  }
  return false;
}
/* ~230x230 cells, each one query-bundle, well under a second. Uint8Array
   so the whole grid is ~53KB, trivial to keep resident. A FUNCTION, not
   an immediate IIFE, now — real gap found via the owner's own report
   ("piers aren't registering for collision detection"): this used to run
   immediately, right here in file order, which is BEFORE LIFE_QUAYS (the
   harbor/port pier decks) and LIFE_SHIP_STATIONARY_DOCKS (the stationary
   ships) even exist yet, so the grid baked in "nothing there" for both
   and never saw them. Called explicitly further down, after every
   obstacle source that feeds lifeNavBlocked above is actually built. */
var LIFE_NAV_GRID = new Uint8Array(LIFE_NAV_W*LIFE_NAV_H);
function lifeNavBuildGrid(){
  for(var cz=0; cz<LIFE_NAV_H; cz++){
    for(var cx=0; cx<LIFE_NAV_W; cx++){
      var p = lifeNavCellCenter(cx,cz);
      LIFE_NAV_GRID[cz*LIFE_NAV_W+cx] = lifeNavBlocked(p[0],p[1]) ? 1 : 0;
    }
  }
}
/* a start/goal cell that's itself inside an obstacle (a dock sits right
   at a canton's own clearance edge, say) has no open neighbours to grow
   from — spiral outward to the nearest genuinely open cell first. */
function lifeNavNearestOpen(cx, cz){
  if(cx>=0 && cz>=0 && cx<LIFE_NAV_W && cz<LIFE_NAV_H && !LIFE_NAV_GRID[cz*LIFE_NAV_W+cx]) return [cx,cz];
  for(var r=1; r<10; r++){
    for(var dz=-r; dz<=r; dz++){
      for(var dx=-r; dx<=r; dx++){
        if(Math.max(Math.abs(dx),Math.abs(dz)) !== r) continue;
        var ncx=cx+dx, ncz=cz+dz;
        if(ncx<0||ncz<0||ncx>=LIFE_NAV_W||ncz>=LIFE_NAV_H) continue;
        if(!LIFE_NAV_GRID[ncz*LIFE_NAV_W+ncx]) return [ncx,ncz];
      }
    }
  }
  return [cx,cz];
}
var LIFE_NAV_NEI = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.41421],[1,-1,1.41421],[-1,1,1.41421],[-1,-1,1.41421]];
/* real performance bug, found live: a flat-array/linear-scan open set
   (the honest trade-off originally written in here — "fine at the path
   lengths this world actually needs... would need a real priority queue
   before trusting it at a much bigger scale") made verify.py's own
   screenshot step hang for 30s+ once this was wired into ferries, which
   rebuild a route every time a dwell ends, not just once at load — a
   route that has to explore a large fraction of a 48000-cell grid before
   reaching a far/hard-to-reach goal made every single A* call slow, not
   just a rare one. A real binary min-heap, keyed on fScore. Allows
   duplicate entries for a node whose score improves after it's already
   queued (cheaper than a real decrease-key) — stale entries are just
   skipped by their own now-outdated fScore on pop. */
function LifeNavHeap(){ this.a = []; }
LifeNavHeap.prototype.push = function(node, score){
  var a = this.a, i = a.length;
  a.push([node, score]);
  while(i > 0){
    var p = (i-1) >> 1;
    if(a[p][1] <= a[i][1]) break;
    var t = a[p]; a[p] = a[i]; a[i] = t;
    i = p;
  }
};
LifeNavHeap.prototype.pop = function(){
  var a = this.a, top = a[0], last = a.pop();
  if(a.length){
    a[0] = last;
    var i = 0, n = a.length;
    while(true){
      var l = 2*i+1, r = 2*i+2, sm = i;
      if(l < n && a[l][1] < a[sm][1]) sm = l;
      if(r < n && a[r][1] < a[sm][1]) sm = r;
      if(sm === i) break;
      var t = a[sm]; a[sm] = a[i]; a[i] = t;
      i = sm;
    }
  }
  return top;
};
/* 8-connected A*, Euclidean heuristic. Returns null if genuinely
   unreachable (e.g. across the north inlet gap this grid doesn't cover). */
function lifeNavAStar(ax, az, bx, bz){
  var W = LIFE_NAV_W, H = LIFE_NAV_H;
  var s0 = lifeNavWorldToCell(ax,az), g0 = lifeNavWorldToCell(bx,bz);
  s0 = [Math.max(0,Math.min(W-1,s0[0])), Math.max(0,Math.min(H-1,s0[1]))];
  g0 = [Math.max(0,Math.min(W-1,g0[0])), Math.max(0,Math.min(H-1,g0[1]))];
  var start = lifeNavNearestOpen(s0[0], s0[1]);
  var goal = lifeNavNearestOpen(g0[0], g0[1]);
  function idx(cx,cz){ return cz*W+cx; }
  var startI = idx(start[0],start[1]), goalI = idx(goal[0],goal[1]);
  if(startI === goalI) return [[ax,az],[bx,bz]];
  var n = W*H;
  var gScore = new Float32Array(n).fill(Infinity);
  var cameFrom = new Int32Array(n).fill(-1);
  var closed = new Uint8Array(n);
  gScore[startI] = 0;
  var heap = new LifeNavHeap();
  heap.push(startI, Math.hypot(goal[0]-start[0], goal[1]-start[1]));
  var iter = 0, iterCap = 60000;
  while(heap.a.length && iter++ < iterCap){
    var popped = heap.pop();
    var current = popped[0];
    if(closed[current]) continue;   /* stale duplicate — this node was already finalized with a better score */
    if(current === goalI) break;
    closed[current] = 1;
    var ccx = current % W, ccz = (current-ccx)/W;
    for(var ni2=0; ni2<8; ni2++){
      var ncx = ccx+LIFE_NAV_NEI[ni2][0], ncz = ccz+LIFE_NAV_NEI[ni2][1];
      if(ncx<0||ncz<0||ncx>=W||ncz>=H) continue;
      var nIdx = idx(ncx,ncz);
      if(closed[nIdx] || LIFE_NAV_GRID[nIdx]) continue;
      var tentG = gScore[current] + LIFE_NAV_NEI[ni2][2];
      if(tentG < gScore[nIdx]){
        cameFrom[nIdx] = current;
        gScore[nIdx] = tentG;
        heap.push(nIdx, tentG + Math.hypot(goal[0]-ncx, goal[1]-ncz));
      }
    }
  }
  if(cameFrom[goalI] === -1 && goalI !== startI) return null;
  var path = [], cur = goalI;
  while(true){
    var cx = cur % W, cz = (cur-cx)/W;
    path.push(lifeNavCellCenter(cx,cz));
    if(cur === startI) break;
    cur = cameFrom[cur];
  }
  path.reverse();
  path.unshift([ax,az]);
  path.push([bx,bz]);
  return path;
}
/* real bug measured (not assumed) on the first pass: thinning the raw
   cell-by-cell path by keeping "every 3rd point" before curving through
   it sounds like harmless jitter-reduction, but on a grid this blocked
   (~67% of cells) the open corridors are often only 1-2 cells wide —
   dropping 2 of every 3 waypoints routinely let the smoothing curve
   arc straight through the blocked material between the kept points.
   Measured: 19-37 of 39 samples along the "safe" route landed on a
   blocked cell. Replaced with real greedy line-of-sight simplification
   (the standard any-angle post-process for a grid path): from each kept
   point, walk forward to the FARTHEST path point that has a genuinely
   clear straight line (lifeNavLOSClear, sampled at half a grid cell)
   before keeping it — every consecutive pair in the result is a
   verified-safe straight segment, not a guess. */
function lifeNavLOSClear(ax, az, bx, bz){
  var d = Math.hypot(bx-ax, bz-az);
  var steps = Math.max(1, Math.ceil(d / (LIFE_NAV_CELL*0.5)));
  for(var i=0; i<=steps; i++){
    var t = i/steps;
    if(lifeNavBlocked(ax+(bx-ax)*t, az+(bz-az)*t)) return false;
  }
  return true;
}
/* real performance bug found live (not in the 4 isolated test routes —
   verify.py's own screenshot step hung for 30s+ on the running page):
   searching backward from the END of the whole remaining path for every
   "i" is worst-case O(n^2) LOS checks, and each LOS check's own cost
   scales with the segment length it's raymarching — for a long ferry
   route (the full bay circuit, not just one hop) that compounds into
   millions of lifeNavBlocked() calls for a single route build, and this
   runs every time a ferry finishes a dwell, not just once at load.
   Capped the maximum single-segment skip distance (MAXSKIP) instead —
   bounds both how many candidates get tried per step AND the length
   (so the cost) of each candidate's own LOS check, at the price of a
   very long line-of-sight not collapsing to one segment. Open water
   doesn't need that anyway; only useful to shorten many-cell paths. */
function lifeNavSimplify(path){
  var MAXSKIP = 700;
  var out = [path[0]];
  var i = 0;
  while(i < path.length-1){
    var farthest = i+1;
    for(var k=i+1; k<path.length; k++){
      var d = Math.hypot(path[k][0]-path[i][0], path[k][1]-path[i][1]);
      if(d > MAXSKIP) break;
      if(lifeNavLOSClear(path[i][0],path[i][1], path[k][0],path[k][1])) farthest = k;
    }
    out.push(path[farthest]);
    i = farthest;
  }
  return out;
}
/* Falls back to the plain heuristic (lifeBuildLeg, defined below) if A*
   found no path at all — this grid is deliberately scoped to the bay/
   city area, not the open sea a ship crosses to reach LIFE_NORTH_INLET. */
var LIFE_NAV_STATS = { calls:0, fallbacks:0, lastFallbacks:[] };
function lifeNavBuildLeg(ax, az, bx, bz){
  LIFE_NAV_STATS.calls++;
  var path = lifeNavAStar(ax, az, bx, bz);
  if(!path || path.length < 2){
    /* instrumented rather than silent, so "how often does this actually
       happen, and where" is a measured number instead of a guess (it was
       suspected of being the ordinators' bug; it is not — every caller of
       this function is WATER traffic: ferries, water taxis, and the
       ship/ferry blocker reroute. Land traffic goes through
       lifeCartBuildLeg/lifePedBuildLeg instead). A flood fill over
       LIFE_NAV_GRID puts 17335 of its 17361 open cells in ONE component,
       the other 22 being 1-3 cell puddles, so a genuine A* failure inside
       the grid is vanishingly rare; what remains is the legitimate case
       this fallback was written for and must keep — a ship crossing open
       sea to LIFE_NORTH_INLET, outside the bay/city area the grid covers
       at all. Left as the heuristic for exactly that reason. */
    LIFE_NAV_STATS.fallbacks++;
    if(LIFE_NAV_STATS.lastFallbacks.length < 24)
      LIFE_NAV_STATS.lastFallbacks.push([Math.round(ax),Math.round(az),Math.round(bx),Math.round(bz)]);
    return lifeBuildLeg(ax, az, bx, bz);
  }
  var simplified = lifeNavSimplify(path);
  return lifeCurveFromCentripetal(simplified);
}
window._nav = { w: LIFE_NAV_W, h: LIFE_NAV_H, cell: LIFE_NAV_CELL,
  minx: LIFE_NAV_MINX, minz: LIFE_NAV_MINZ,
  /* was a static number computed right here — now a function, since the
     grid itself isn't filled until lifeNavBuildGrid() runs much later
     (see that function's own comment for why). `grid` below is still the
     live typed array, so it reflects the real contents once built either
     way; this one just can't be a plain number anymore. */
  blocked: function(){ var c=0; for(var i=0;i<LIFE_NAV_GRID.length;i++) if(LIFE_NAV_GRID[i]) c++; return c; },
  total: LIFE_NAV_GRID.length,
  buildLeg: lifeNavBuildLeg, aStar: lifeNavAStar, blockedAt: lifeNavBlocked,   /* diagnostic */
  stats: LIFE_NAV_STATS,   /* diagnostic: real A*-failure rate + the routes that failed */
  grid: LIFE_NAV_GRID };
/* NOT built yet, deliberately: local steering/collision avoidance
   (sensing nearby vehicles at runtime, steering around them, queueing at
   a busy dock) is a separate system layered on top of this one, next. */
function lifeCurveFrom(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], LIFE_Y, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.25);
}
/* land version of lifeCurveFrom: walkers (pedestrians, ordinators,
   caravans) are not on the water, so their waypoints need the actual
   ground height, not LIFE_Y (= sea level). Using LIFE_Y for land traffic
   was the bug that made every citizen invisible — they were walking a
   path buried below every canton plaza and street, since those all sit
   well above sea level. */
function lifeCurveFromLand(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], lifeGroundY(w[0],w[1]) + 0.15, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.25);
}
/* same as lifeCurveFromLand (proper per-point lifeGroundY height, not the
   flat LIFE_Y lifeCurveFromCentripetal below uses — that one's for open-
   water barges, wrong for anything that needs to follow real ground/
   causeway height) but CENTRIPETAL parameterisation — lifeCartBuildLeg's
   own waypoint list. A real road-graph Dijkstra path's node spacing is
   wildly irregular (a few short hops through a dense warren block, then
   one long highway hop), which is exactly the case the file's own
   comment just above already documents as plain Catmull-Rom's overshoot
   trigger. Confirmed, not guessed: instrumented every live caravan's
   curve and found the wild swings (deep water AND hilltop-height samples
   a few percent of t apart) landed almost entirely BETWEEN real road-
   graph waypoints, not on them — the waypoints/route choice were fine,
   the SPLINE cutting a bulging corner between them was not. */
function lifeCurveFromLandCentripetal(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], lifeGroundY(w[0],w[1]) + 0.15, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}
/* same, but 'centripetal' parameterisation instead of uniform 'catmullrom'
   — used only by lifeBuildLegInPoly. Centripetal is the standard fix for
   a plain Catmull-Rom curve overshooting/looping near a sharp corner when
   control points end up irregularly spaced, which repeated per-round
   waypoint replacement produces routinely; the pinch points in
   LIFE_PBARGE_ZONE's own concave notches are exactly where that showed
   up as a real, measured residual land-hit rate that more control points
   alone didn't fully clear. */
function lifeCurveFromCentripetal(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], LIFE_Y, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}
/* Tried a straight-line-geometry detour pre-pass here (find where the raw
   A->B line passes closest to each canton and drop an explicit waypoint
   there before building any curve). Measured, not assumed, and it made
   things WORSE: 20 canoes/20 tall hits with the plain version below,
   100 canoes/280 tall hits with the detour pre-pass, 100 canoes/168 tall
   hits with it stripped back out again (verify.py --sweep, same build
   otherwise). Best guess why: a "detour point" sits exactly on a
   canton's clearance boundary by construction, which is the worst place
   to add a spline control point — Catmull-Rom's tangent through a point
   right at the edge of a keep-out zone tends to swing the curve BACK
   toward it on either side, rather than away, unless the neighbouring
   points are already positioned to counteract that, which the plain
   sample-and-replace loop already does more reliably by construction
   (it only ever replaces a point that would fail, never proposes new
   ones that might). Left as measurement, not as code, since the honest
   answer is the simpler version won and the detour idea didn't. */
function lifeBuildLeg(ax,az,bx,bz){
  var m1 = lifePushToWater.apply(null, lifeMix([ax,az],[bx,bz], 0.33));
  var m2 = lifePushToWater.apply(null, lifeMix([ax,az],[bx,bz], 0.66));
  var waypoints = [[ax,az], m1, m2, [bx,bz]];

  for(var round=0; round<10; round++){
    var curve = lifeCurveFrom(waypoints);
    var worst = null, worstT = 0, worstFix = null;
    for(var s=1; s<80; s++){
      var st = s/80, p = curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p.x, p.z);
      if(blocked){
        worst = blocked; worstT = st;
        worstFix = [blocked[0].x + blocked[1]*blocked[3]*1.25, blocked[0].z + blocked[2]*blocked[3]*1.25];
        break;
      }
      /* real gap found via the owner's own report ("ferries and canoes
         are happily clipping through... piers... and each other"):
         this loop only ever re-checked CANTONS after the first round —
         the seed waypoints (m1/m2 above) get pushed off land once, but
         nothing downstream ever re-verifies the FINISHED curve is still
         clear of it, so a curve that bows even slightly off the direct
         line between two already-clear points can still cut across a
         spit of land (and whatever pier or building sits on it) that
         neither endpoint was anywhere near. Reuses lifePushToWater's own
         land test (terrainH) here — the exact same threshold already
         proven for the seed points — rather than inventing a second one.

         Real bug found immediately via verify.py --sweep (hits jumped
         from ~170 to 8749 the first time this landed): almost every
         canoe leg legitimately STARTS or ENDS right at a shore-adjacent
         point — a stilt hut, a dock, a shrine landing — which reads as
         "land" by this exact threshold. Checking all the way out to
         s=1/s=79 caught that every single time, on a piece of the route
         (the immediate approach to a canton dock, etc.) this loop can
         never actually fix anyway (it only ever moves the two INTERIOR
         waypoints, never the endpoints themselves) — 10 wasted rounds
         reshuffling m1 for nothing, every single leg. Excluded a margin
         around both ends (st in [0.08, 0.92]) so this only ever fires
         for a genuine MID-route land crossing, which is the actual bug
         being fixed. */
      if(st > 0.08 && st < 0.92 && terrainH(p.x, p.z) > -1.5){
        var pushed = lifePushToWater(p.x, p.z);
        worst = true; worstT = st;
        worstFix = pushed;
        break;
      }
    }
    if(!worst) return curve;
    /* replace, never insert, here — confirmed earlier that repeated
       insertion clusters control points close enough together to kink
       the spline through a DIFFERENT obstacle instead of smoothly
       detouring around the flagged one. Push to 1.25x clearR (canton
       case), not exactly clearR: landing a control point precisely ON
       the boundary left it prone to the curve swinging straight back
       across it next round — real oscillation, confirmed on one
       particular leg that kept failing at the same spot no matter how
       many rounds it got. */
    var nearestIdx = 1, nearestD = Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt = w2/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w2; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFrom(waypoints);
}

/* ---- visuals: plain THREE meshes, NOT the BUCKET/emit-kit static bake —
   these move every frame, the static geometry never does, so they cost
   their own draw calls on top of the static budget (BUDGET.drawCalls,
   05-palette.js, raised accordingly — see the comment there). Hull+torso+
   head don't need independent per-part animation (they're rigid on the
   canoe), so they're pre-translated into ONE merged BufferGeometry and
   drawn as a single InstancedMesh; only the paddle needs its own
   additional stroke rotation each frame, so it stays a second mesh. Two
   draw calls total for all 100 canoes+paddlers, not two hundred. Lambert
   so they still read correctly under the scene's existing sun/ambient
   lighting without a bespoke shader. */
var LIFE_N = 100;   /* the owner: "quite small... could have 100 of these and not look overcrowded" */
/* three.min.js here doesn't actually export BufferGeometryUtils (only the
   core is bundled, not the examples/jsm addons) — merge the 3 parts by
   hand instead. All source geometries (stock THREE primitives, and
   45-kit.js's own SHAPES.*() generators) share the same attribute set
   (position/normal/uv).

   Each entry may be a plain THREE.BufferGeometry (old behaviour: no
   colour baked in, the mesh's own flat material.color applies to the
   whole thing, unchanged for every existing caller) OR a {geo,color}
   object — if ANY entry in the array is the latter, every entry gets a
   baked per-vertex colour (plain entries default to white, i.e. "let the
   material's colour show", so mix the two only when every plain entry
   is meant to read as pure white, which in practice means: always pass
   {geo,color} for every part once any part needs one, per the actual
   call sites below). This is what lets a single merged mesh (canoe
   hull+rider, or a crew figure's own skin+hair) show more than one
   colour without a second draw call — the mesh's material sets
   `vertexColors:true, color:0xffffff` to let the baked colours through
   unmultiplied. */
function lifeMergeGeoms(geoms){
  var pos = [], nrm = [], uv = [], col = [];
  var anyColor = geoms.some(function(g){ return g && g.color !== undefined; });
  geoms.forEach(function(entry){
    var g = entry.isBufferGeometry ? entry : entry.geo;
    var c = anyColor ? new THREE.Color(entry.color !== undefined ? entry.color : 0xffffff) : null;
    var p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    /* real, serious bug found the hard way (screenshot showed every
       vehicle in this file as a jumble of stray triangular wedges, not
       clean boxes): stock THREE.BoxGeometry/CylinderGeometry are
       INDEXED — p.count is the UNIQUE vertex count (24 for a box, verts
       shared where normals allow), and the real triangles come from
       geometry.index, not from reading attributes in raw order. Walking
       0..p.count-1 as if every 3 consecutive vertices were one triangle
       silently reassembled the WRONG vertices into each triangle —
       nothing errored, it just drew garbage connectivity. 45-kit.js's
       own rectFrus() (SHAPES.fr8() etc) happens to build its position
       array already flat/unindexed with no index buffer at all, which
       is exactly why the ship's FR8 hull looked fine while everything
       built from boxes/cylinders around it didn't. Walk geometry.index
       when present (expanding to the real triangle list) and fall back
       to raw attribute order only when there truly is no index. */
    var idx = g.index;
    var vcount = idx ? idx.count : p.count;
    for(var i=0;i<vcount;i++){
      var vi = idx ? idx.getX(i) : i;
      pos.push(p.getX(vi), p.getY(vi), p.getZ(vi));
      nrm.push(n.getX(vi), n.getY(vi), n.getZ(vi));
      uv.push(u.getX(vi), u.getY(vi));
      if(anyColor) col.push(c.r, c.g, c.b);
    }
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if(anyColor) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}
/* standalone rider/crew/passenger figure — torso (skin) + head (hair),
   shared by every mesh below that needs a free-standing person (ferries,
   barges, ships). Canoes weld their own copy straight into the hull
   mesh instead (below) since a canoe always carries exactly one rider,
   with no need for the on/off-scaling trick the others use.
   LIFE_PEOPLE_SCALE 1.4x the original size — the owner: "the people are
   all-around kind of small and hard to see even at maximum zoom". Doubled
   again here (1.4 -> 2.8) per a later owner pass: "buildings often seem
   unnaturally scaled... suggestive of absurdly high ceilings" — citizens
   this small next to multi-story buildings read as the building being
   built for someone far bigger than a person, even where the building
   geometry itself is fine; doubling the one shared scale every humanoid
   figure (pedestrians/ordinators/clergy/ship-crew/ferry/barge people all
   read this same constant) fixes that relationship in one place. Ships/
   barges are NOT scaled here — real ships already dwarf a person standing
   on deck by far more than 2x, so leaving hull sizes alone keeps that
   relationship believable; doubling them too would make them enormous
   next to the cantons they dock at, which isn't what was asked for. */
var LIFE_PEOPLE_SCALE = 2.8;
var lifePersonGeo = lifeMergeGeoms([
  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: LIFE_SKIN },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: LIFE_HAIR_DARK }
]);
/* same figure, white hair — a cheap way to put a little visible variety
   into the population without a second draw call or per-instance
   tinting: ship crew (below) get this geometry, everyone else above
   gets the dark-haired one. */
var lifePersonGeoWhite = lifeMergeGeoms([
  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: LIFE_SKIN },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: LIFE_HAIR_WHITE }
]);
/* doubled alongside LIFE_PEOPLE_SCALE (see that constant's own comment) —
   the paddler figure below already reads LIFE_CANOE_SCALE, but the hull
   itself was a fixed size (1.2 x 0.5 x 5.2) independent of it, so scaling
   only the paddler would have put an oversized person in a boat that
   didn't grow with them. Hull now scales with the same constant. */
var LIFE_CANOE_SCALE = 2.4;
var lifeHullGeo = new THREE.BoxGeometry(1.2*LIFE_CANOE_SCALE, 0.5*LIFE_CANOE_SCALE, 5.2*LIFE_CANOE_SCALE);
var lifeTorsoGeo = new THREE.CylinderGeometry(0.32*LIFE_CANOE_SCALE, 0.38*LIFE_CANOE_SCALE, 1.1*LIFE_CANOE_SCALE, 6).translate(0, 0.75*LIFE_CANOE_SCALE, 0);
var lifeHeadGeo = new THREE.BoxGeometry(0.42*LIFE_CANOE_SCALE, 0.42*LIFE_CANOE_SCALE, 0.42*LIFE_CANOE_SCALE).translate(0, 1.55*LIFE_CANOE_SCALE, 0);
var lifeBodyGeo = lifeMergeGeoms([
  { geo: lifeHullGeo, color: 0x6b5942 },
  { geo: lifeTorsoGeo, color: LIFE_SKIN },
  { geo: lifeHeadGeo, color: LIFE_HAIR_DARK }
]);
var lifeBodyMesh = new THREE.InstancedMesh(lifeBodyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_N);
var lifePaddleGeo = new THREE.BoxGeometry(0.10*LIFE_CANOE_SCALE, 1.6*LIFE_CANOE_SCALE, 0.34*LIFE_CANOE_SCALE);
var lifePaddleMesh = new THREE.InstancedMesh(lifePaddleGeo, new THREE.MeshLambertMaterial({ color: 0x5a4732 }), LIFE_N);
[lifeBodyMesh, lifePaddleMesh].forEach(function(m){ m.userData.life = true; m.userData.inspectLabel = 'Canoe paddler'; m.frustumCulled = false; scene.add(m); });

/* ---- the LIFE_N canoes: init position + first leg ---------------------- */
var LIFE_CANOES = [];
window._deck = { causewayY: lifeCausewayY, bridgeY: lifeBridgeY, groundY: lifeGroundY,
  on: function(x,z){ return lifeCausewayY(x,z) != null || lifeBridgeY(x,z) != null; } };   /* diagnostic */
window._legs = [];
for(var li=0; li<LIFE_N; li++){
  var spawn = LIFE_STILT.length ? pick(LIFE_STILT) : (LIFE_SHRINE.length ? pick(LIFE_SHRINE) : [0,0]);
  var lifeStart = lifePushToWater(spawn[0], spawn[1]);
  var lifeDest = lifePickDestination(lifeStart[0], lifeStart[1]);
  var lifeCurve = lifeBuildLeg(lifeStart[0], lifeStart[1], lifeDest[0], lifeDest[1]);
  var cv = {
    ax: lifeStart[0], az: lifeStart[1], bx: lifeDest[0], bz: lifeDest[1],
    curve: lifeCurve, len: lifeCurve.getLength(),
    speed: rr(3.2, 5.5), state: 'go', stateT: rr(0, 30), dwellFor: rr(3, 8),
    paddlePhase: rnd()*6.28
  };
  cv.dur = Math.max(2, cv.len / cv.speed);
  LIFE_CANOES.push(cv);
  window._legs.push({ curve: cv.curve });
}
window._life = { canoes: LIFE_N };

/* ---- per-frame update, called once from 80-camera.js's frame loop ----- */
var LIFE_UP = new THREE.Vector3(0,1,0);
var lifeTmpPos = new THREE.Vector3(), lifeTmpDir = new THREE.Vector3();
var lifeTmpQuat = new THREE.Quaternion(), lifeTmpQuat2 = new THREE.Quaternion();
var lifeTmpMat = new THREE.Matrix4(), lifeTmpScale = new THREE.Vector3(1,1,1);
var lifeTmpPos2 = new THREE.Vector3();
/* ============================== local avoidance (first piece) =============
   The owner's own example of what real pathfinding should eventually
   enable: "ships dodge around and queue up behind each other when
   needed". The nav-grid above is the GLOBAL half (routes around fixed
   obstacles); this is the start of the LOCAL half — vehicles sensing
   and steering around each OTHER at runtime, which a route built once
   and never revisited can never do. Scoped to canoes + ferries for now
   (by far the two largest, most tightly-packed populations — 100 canoes
   in a bay, 12 ferries sharing 14 stops) rather than every vehicle type,
   to keep this a real, verified piece of work rather than a half-built
   pass over everything. Queueing at a dock (holding back rather than
   just nudging sideways when a stop is already occupied) is the natural
   next piece on top of this, not yet built.

   One flat position/radius array, fixed slot per vehicle, persisting
   across frames (not cleared) so a vehicle updated early in a frame
   still sees where everyone else was as of THEIR last update — at most
   one frame stale, standard for this kind of separation steering and
   imperceptible at real framerates. A vehicle reads everyone else's
   slot, then overwrites its OWN slot with its final (already-nudged)
   position for the next reader, same frame or next.

   The actual arrays (LIFE_AVOID_X/Z/R, LIFE_AVOID_N etc.) are declared
   further down, right after LIFE_FERRY_N is assigned (the ferry
   section) — real bug caught before it shipped: this comment block sits
   BEFORE the ferry section in file order, and LIFE_FERRY_N wouldn't be
   assigned yet if the arrays were sized here (top-level code runs in
   file order even though function declarations like lifeAvoidNudge
   below are hoisted and safe to define anywhere). updateLife() itself
   only ever CALLS lifeAvoidNudge at runtime, long after every fragment
   has finished loading, so the function being defined here is fine —
   only the array SIZING had to move. */
/* pure separation steering: sum a weighted push-away vector from every
   OTHER active vehicle whose clearance circle this one is currently
   inside, clamp the total offset to maxNudge. Applied as a one-shot
   position offset each frame (not integrated velocity) — simple, cheap,
   and enough to visibly part two vehicles headed for the same point;
   real "queue up and wait your turn" behaviour is the next piece, not
   this one. */
/* the owner: ships "have right of way over small ships - small ships
   should go out of their way to avoid them and less so vice versa" —
   an asymmetric give-way weight keyed off each vehicle's own priority
   tier (LIFE_AVOID_PRIORITY: canoe 1, ferry 2, ship 3, set where each
   population's avoid-array slots are sized). Reacting to something
   HIGHER priority than you gets amplified; reacting to something LOWER
   barely moves you at all. Equal tiers (two ships, two ferries, two
   canoes) negotiate at the old, symmetric weight. */
function lifeAvoidGiveWay(mine, other){
  if(other > mine) return 1.4;
  if(other === mine) return 1.0;
  return 0.22;
}
function lifeAvoidNudge(myIdx, x, z, r, maxNudge, myPriority){
  myPriority = myPriority || 1;
  var px = 0, pz = 0;
  for(var i=0; i<LIFE_AVOID_N; i++){
    if(i === myIdx) continue;
    var oR = LIFE_AVOID_R[i];
    if(oR <= 0) continue;
    var dx = x-LIFE_AVOID_X[i], dz = z-LIFE_AVOID_Z[i];
    var d = Math.hypot(dx,dz) || 0.01;
    var minD = r + oR;
    if(d < minD){
      var w = (minD-d)/minD * lifeAvoidGiveWay(myPriority, LIFE_AVOID_PRIORITY[i]);
      px += (dx/d)*w; pz += (dz/d)*w;
    }
  }
  var mag = Math.hypot(px,pz);
  if(mag < 1e-4) return [x,z];
  var k = Math.min(maxNudge, mag*maxNudge)/mag;
  return [x+px*k, z+pz*k];
}
/* the owner, watching an actual barge do this: "I saw an outgoing barge
   start to swerve to avoid a bridge support, then swerve back to the
   original path and clip through it again." Real gap in every transit
   vehicle's avoidance (ships, ferries, river barges, the pleasure barge
   all had this): the ONLY point ever checked was one out ahead along the
   heading (LIFE_*_LOOKAHEAD), never the vehicle's own actual current
   position. That point sweeps forward every frame — once the vehicle
   gets closer to an obstacle than its own lookahead distance, the ahead-
   point can already be PAST it and reading clear, so the push vanishes
   and the vehicle drifts back onto the very obstacle it just swerved
   for, with nothing left checking the position it is actually sitting
   in. Fixed once, here, for everything that calls it: check the REAL
   current position FIRST (this is what actually guarantees no clip,
   since it's evaluated exactly where the vehicle physically is, every
   frame, not swept ahead of it) with its own larger, more urgent clamp;
   only fall back to the softer anticipatory lookahead push (the "start
   turning before you're already touching it" behaviour) when nothing is
   actually close right now. Returns a DELTA (dx,dz), not a new point —
   every call site just does pos.x += d[0]; pos.z += d[1]. */
function lifeAvoidNudge2(myIdx, x, z, dirX, dirZ, r, maxNudgeNow, lookahead, maxNudgeAhead, priority){
  var now = lifeAvoidNudge(myIdx, x, z, r, maxNudgeNow, priority);
  var ndx = now[0]-x, ndz = now[1]-z;
  if(ndx*ndx + ndz*ndz > 1e-6) return [ndx, ndz];
  var laX = x+dirX*lookahead, laZ = z+dirZ*lookahead;
  var ahead = lifeAvoidNudge(myIdx, laX, laZ, r, maxNudgeAhead, priority);
  return [ahead[0]-laX, ahead[1]-laZ];
}
function updateLife(dt){
  LIFE_CANOES.forEach(function(cv, idx){
    cv.stateT += dt;
    var t;
    if(cv.state === 'dwell'){
      t = 0.999;
      if(cv.stateT >= cv.dwellFor){
        var nx = cv.bx, nz = cv.bz;
        var dest = lifePickDestination(nx, nz);
        cv.ax = nx; cv.az = nz; cv.bx = dest[0]; cv.bz = dest[1];
        cv.curve = lifeBuildLeg(cv.ax, cv.az, cv.bx, cv.bz);
        cv.len = cv.curve.getLength();
        cv.dur = Math.max(2, cv.len / cv.speed);
        cv.state = 'go'; cv.stateT = 0;
        window._legs[idx] = { curve: cv.curve };
      }
    }else{
      var raw = Math.min(1, cv.stateT / cv.dur);
      t = raw*raw*(3 - 2*raw);           /* smoothstep ease in/out */
      if(raw >= 1){ cv.state = 'dwell'; cv.stateT = 0; cv.dwellFor = rr(3, 8); }
    }
    cv.curve.getPointAt(t, lifeTmpPos);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cv.curve.getTangentAt(tTan, lifeTmpDir);
    var yaw = Math.atan2(lifeTmpDir.x, lifeTmpDir.z);
    lifeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);

    /* local avoidance: nudge away from any other canoe/ferry currently
       too close, heading unchanged (a lateral drift, not a turn) — see
       the file-level comment above updateLife for what this is and
       isn't yet. */
    var avoidSlot = LIFE_AVOID_CANOE0 + idx;
    var nudged = lifeAvoidNudge(avoidSlot, lifeTmpPos.x, lifeTmpPos.z, LIFE_AVOID_R[avoidSlot], 2.2, 1);
    lifeTmpPos.x = nudged[0]; lifeTmpPos.z = nudged[1];
    LIFE_AVOID_X[avoidSlot] = lifeTmpPos.x; LIFE_AVOID_Z[avoidSlot] = lifeTmpPos.z;

    lifeTmpMat.compose(lifeTmpPos, lifeTmpQuat, lifeTmpScale);
    lifeBodyMesh.setMatrixAt(idx, lifeTmpMat);

    var stroke = Math.sin(cv.paddlePhase + performance.now()*0.003);
    lifeTmpQuat2.setFromAxisAngle(new THREE.Vector3(0,0,1), stroke*0.5);
    lifeTmpQuat2.premultiply(lifeTmpQuat);
    lifeTmpPos2.copy(lifeTmpPos);
    lifeTmpPos2.x += Math.sin(yaw)*0.75; lifeTmpPos2.z += Math.cos(yaw)*0.75;
    lifeTmpPos2.y += 1.0;
    lifeTmpMat.compose(lifeTmpPos2, lifeTmpQuat2, lifeTmpScale);
    lifePaddleMesh.setMatrixAt(idx, lifeTmpMat);
  });
  lifeBodyMesh.instanceMatrix.needsUpdate = true;
  lifePaddleMesh.instanceMatrix.needsUpdate = true;
  updateShips(dt);
  updateCGuard(dt);    /* the Fortress coast guard — its own tiny machine, deliberately outside LIFE_SHIPS' relay (see that section) */
  updateFerries(dt);
  updateWaterTaxis(dt);
  updateBarges(dt);
  updateFishBoats(dt);
  updatePedestrians(dt);
  updatePenitents(dt);
  updateOrdinators(dt);
  updateClergy(dt);
  updateGuildWorkers(dt);
  updateCaravans(dt);
  updateArena(dt);     /* arena gladiator combat — this file's own last section */
  /* 79-striders.js — silt strider convoys. Guarded (not a bare call) since
     that fragment loads after this one; function hoisting makes the call
     itself safe either way (see this project's own hoisting-trap notes),
     but the guard keeps this file honest about being the earlier one. */
  if(typeof updateStriders === 'function') updateStriders(dt);
}
window._lifeTick = updateLife;   /* diagnostic: fast-forward the sim from outside the real rAF loop (headless test probes can't wait out a real dt=0.06-capped clock for something like a ship's ~80s transit) */

