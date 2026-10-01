/* ============================== citizens: ordinators ========================
   Item 2 of 4 planned populations (priests, merchant caravans still not
   built). Guards/soldiers — green-and-gold armour, sword and shield.
   Officers are flagged (.officer) but NOT visually distinct yet: a
   plume needs either a second geometry variant (a second draw call this
   budget doesn't have — see BUDGET.drawCalls, 05-palette.js) or a real
   per-instance-color layer neither is worth building for one helmet
   accent under this session's time pressure. Documented simplification,
   not an oversight; easy to add once there's a spare draw call.

   ~180 total, following the owner's own itemized breakdown exactly
   (fortress/palace 50, 5 per market, 12 patrol squads of 5, 2 ring-road
   squads of 10, 2 each at the customs house and every causeway landing)
   — a bit over the "about 120-150" headline figure, but the owner gave
   explicit per-location counts right alongside that "about"; honouring
   the itemized list seemed more faithful than arbitrarily trimming it
   to land on the rounder number.

   Movement, for time: every ordinator except the ring-road squads holds
   a fixed post and idle-wanders a small loop around it (the same
   primitive the ship crew already use) — real posted guards, not full
   patrol ROUTES between posts ("12 squads that patrol the city" is
   simplified to "12 squads posted around the city," a real, named
   simplification). The ring-road squads are the one population that
   actually travels — a real back-and-forth route between the Fortress
   (CIDX['Fortress'] — properly renamed from 'Lighthouse' per the owner;
   see 30-layout.js) and the customs house, since that's the one patrol
   explicitly described as "back and forth" rather than "around." Reuses
   lifeCartBuildLeg (below) — a real patrol route should stick to the
   streets, not ramble like a pedestrian; see that function's own comment. */

/* owner: "carts should basically never go off the visible streets/
   highways, bridges, causeways" (originally about caravans, but the
   ordinator ring patrol is the exact same class of long, road-bound
   route) — lifePedBuildLeg (land-avoidance only, no road constraint —
   right for a rambling pedestrian cutting across a lawn) let both cut
   cross-country. Real road-graph pathfinding instead: an adjacency list
   off RNODE/REDGE (30-layout.js — fragment 30 runs before this one, so
   buildRoadGraph()'s own final call has already populated both by the
   time this runs), plain Dijkstra (uniform edge weight = real distance;
   no heap, an O(V^2) array scan — fine for an occasional retarget over
   ~2460 nodes, not a per-frame cost), snapped from/to the nearest road
   node, then handed to lifeCurveFromLand the same way every other leg-
   builder here already finishes a route — bridges and causeways are
   already ordinary edges in this same graph (buildRoadGraph() processes
   every ROADS entry, ROADS includes both), so routing through the graph
   at all keeps things on them automatically. Placed here, ahead of BOTH
   consumers (ordinators just below, caravans further down) — the
   ordinator ring curve is built by an IIFE that runs immediately at this
   point in top-to-bottom execution, not deferred to a later tick, so
   LIFE_ROAD_ADJ has to already be assigned here, not just declared
   later in the file (a `var` only hoists the BINDING, not the value —
   real bug, caught before shipping: this lived down by the caravans
   first, which is AFTER the ordinator ring curve already needed it). */
var LIFE_ROAD_ADJ = RNODE.map(function(){ return []; });
REDGE.forEach(function(e){
  var A = RNODE[e.a], B = RNODE[e.b], d = Math.hypot(B.x-A.x, B.z-A.z);
  LIFE_ROAD_ADJ[e.a].push({ to:e.b, d:d });
  LIFE_ROAD_ADJ[e.b].push({ to:e.a, d:d });
});
window._debugRoadGraph = { RNODE: RNODE, adj: LIFE_ROAD_ADJ };   /* diagnostic: raw node list + this file's own adjacency, for probing lifeRoadPath failures */
function lifeNearestRoadNode(x,z){
  var best=-1, bestD=Infinity;
  for(var i=0;i<RNODE.length;i++){
    var n=RNODE[i], dx=x-n.x, dz=z-n.z, d=dx*dx+dz*dz;
    if(d<bestD){ bestD=d; best=i; }
  }
  return best;
}
function lifeRoadPath(ax,az,bx,bz){
  var startN = lifeNearestRoadNode(ax,az), goalN = lifeNearestRoadNode(bx,bz);
  if(startN<0 || goalN<0 || startN===goalN) return null;
  var n = RNODE.length;
  var dist = new Float64Array(n).fill(Infinity);
  var prev = new Int32Array(n).fill(-1);
  var visited = new Uint8Array(n);
  dist[startN] = 0;
  for(var iter=0; iter<n; iter++){
    var u=-1, best=Infinity;
    for(var i=0;i<n;i++){ if(!visited[i] && dist[i]<best){ best=dist[i]; u=i; } }
    if(u<0 || u===goalN) break;
    visited[u]=1;
    var neigh = LIFE_ROAD_ADJ[u];
    for(var k=0;k<neigh.length;k++){
      var v=neigh[k].to;
      if(visited[v]) continue;
      var nd = dist[u]+neigh[k].d;
      if(nd < dist[v]){ dist[v]=nd; prev[v]=u; }
    }
  }
  if(dist[goalN] === Infinity) return null;
  var path=[goalN], cur=goalN;
  while(cur!==startN){ cur=prev[cur]; if(cur<0) return null; path.push(cur); }
  path.reverse();
  return path;
}
window._debugRoadGraph.lifeRoadPath = lifeRoadPath;
window._debugRoadGraph.lifeNearestRoadNode = lifeNearestRoadNode;

/* ---- reachability, so "unreachable" can be REJECTED instead of faked -----
   The whole point of the connectivity work in 30-layout.js (section 5g) is
   that a cart's fallback to raw cross-country land avoidance is a LIE: it
   draws a line through water and over hills because no road route exists,
   and the owner sees exactly that ("they still try climbing the hill and
   going for swims"). The graph is now 95%+ one component, but a handful of
   genuinely stranded fragments remain (a hilltop stub, a shore spur with
   nothing walkable in reach), and inventing a route to one of those is
   still the wrong answer. This is the cheap test that lets a caller do what
   the rest of this codebase already does with claim() — reject the
   destination and pick another — instead of routing into the sea.
   One union-find pass over the adjacency built above; O(1) per query after. */
var LIFE_ROAD_COMP = (function(){
  var p = new Int32Array(RNODE.length);
  for(var i=0;i<p.length;i++) p[i]=i;
  function find(a){ while(p[a]!==a){ p[a]=p[p[a]]; a=p[a]; } return a; }
  LIFE_ROAD_ADJ.forEach(function(list, a){
    for(var k=0;k<list.length;k++){ var x=find(a), y=find(list[k].to); if(x!==y) p[y]=x; }
  });
  var out = new Int32Array(RNODE.length);
  for(var j=0;j<p.length;j++) out[j] = find(j);
  return out;
})();
/* true when a road route genuinely exists between the two points' nearest
   road nodes (same component), AND neither end is so far off the graph that
   the straight connector to it would be a cross-country leg in disguise. */
var LIFE_ROAD_SNAP_MAX = 260;
function lifeRoadReachable(ax,az,bx,bz){
  var s = lifeNearestRoadNode(ax,az), g = lifeNearestRoadNode(bx,bz);
  if(s<0 || g<0) return false;
  if(LIFE_ROAD_COMP[s] !== LIFE_ROAD_COMP[g]) return false;
  if(Math.hypot(RNODE[s].x-ax, RNODE[s].z-az) > LIFE_ROAD_SNAP_MAX) return false;
  if(Math.hypot(RNODE[g].x-bx, RNODE[g].z-bz) > LIFE_ROAD_SNAP_MAX) return false;
  return true;
}
window._debugRoadGraph.reachable = lifeRoadReachable;
window._debugRoadGraph.comp = LIFE_ROAD_COMP;
/* road-constrained replacement for lifePedBuildLeg where the owner wants
   real street-following — falls back to the land-avoidance builder only
   if no road path exists at all (e.g. a point too far from the nearest
   road node, or a real gap in the road network — the owner's own follow-
   up: "there are a few spots where the road network is a little jank,
   they can grudgingly path onto the turf until we fix them"), so nothing
   ever just freezes/vanishes for want of a connected road.

   Owner, again: "carts still have tendency to path over the western
   hills." Real bug, found by direct instrumentation (sampled every live
   caravan's own curve for its highest terrainH point — several converged
   on the exact same ~(-1750,720)/(-1310,1210) hilltops regardless of
   destination, which only makes sense if a single SHARED stretch near
   their common spawn was the culprit, not each route independently
   choosing a bad path). The middle of the route already follows real
   road nodes, which never cross extreme hills — but the two CONNECTOR
   segments (raw spawn/destination point to the nearest road node) were
   never checked by anything: lifePedBuildLeg's own refinement only ever
   tests terrainH<2 (water), never HIGH terrain, so a remote spawn point
   far from the road graph got a straight, uncorrected line clean over
   open hill country. HILL_MAX sits comfortably above ordinary built
   terrain (city ground stays under ~90; hills push 150-200+ per
   terrainH's own RIDGES amplitude).

   Owner, again: "caravans still occasionally trying to swim and trying
   to climb the hill, though with less success" — the connector-only
   refinement above was real but incomplete. Direct instrumentation
   (sampling every live caravan's curve at 4% steps) found the actual
   majority of bad points sitting in the "real road stretch — trust it"
   middle this loop used to skip outright, in long, continuous runs (up
   to ~17 consecutive bad samples on one route) swinging between hilltop
   and open-water heights a few percent of t apart — a spline-overshoot
   signature (see lifeCurveFromLandCentripetal above), not a bad
   waypoint: the actual road-graph nodes were all on real ground, the
   UNIFORM Catmull-Rom curve through them was cutting a corner between
   two irregularly-spaced ones. Switching to that centripetal curve is
   the real fix; this loop now also checks the WHOLE route instead of
   trusting the middle (belt and braces — cheap, and still needed for the
   two genuine connector stretches), with a bridge/causeway exemption so
   a legitimately low-water sample on a real span isn't "fixed" into the
   bank. */
function lifeCartBuildLeg(ax,az,bx,bz){
  var path = lifeRoadPath(ax,az,bx,bz);
  if(!path) return lifePedBuildLeg(ax,az,bx,bz);
  var waypoints = [[ax,az]];
  path.forEach(function(ni){ var n=RNODE[ni]; waypoints.push([n.x,n.z]); });
  waypoints.push([bx,bz]);
  var HILL_MAX = 95;
  /* sample density and round count scale with the route's real length, the
     same way lifePedBuildLeg's already do and for the same measured reason:
     a fixed 80 samples over a 5000-unit caravan leg is one sample every 63
     units, which steps straight over a short dip into the river channel
     between two river-road nodes. Measured after the connectivity fix: 30
     genuinely-open-water samples left across 90 live caravans, all of them
     clustered on the river corridor east of the city. */
  var cartLen = 0;
  for(var wl=1; wl<waypoints.length; wl++)
    cartLen += Math.hypot(waypoints[wl][0]-waypoints[wl-1][0], waypoints[wl][1]-waypoints[wl-1][1]);
  var SAMPLES = Math.max(80, Math.min(260, Math.round(cartLen/28)));
  var ROUNDS  = Math.max(16, Math.min(34, Math.round(cartLen/220)));
  for(var round=0; round<ROUNDS; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var bad = null, badFix = null, badSeg = 0;
    for(var s=1; s<SAMPLES; s++){
      var st = s/SAMPLES;
      var p = curve.getPointAt(st);
      var h = terrainH(p.x,p.z);
      if(h > HILL_MAX){
        bad=st; badFix=lifePushToLowGround(p.x,p.z,HILL_MAX);
      }else if(h < 2){
        /* a real deck, not a swim. This used to ask nearestStreet() for a
           {bridge:true,causeway:true} edge — but NO edge in the road graph
           had either class until 30-layout.js section 5g added the deck
           network, so the exemption could never fire and every legitimate
           bridge/causeway crossing was "corrected" into the bank. Asking the
           deck-height functions directly (lifeCausewayY/lifeBridgeY above)
           is both authoritative and independent of the graph: they are the
           same formulas 50-cantons.js/60-land.js draw the decks with. */
        if(lifeCausewayY(p.x,p.z) != null || lifeBridgeY(p.x,p.z) != null) continue;
        bad=st; badFix=lifePushToLand(p.x,p.z);
      }
      if(bad!==null){
        badSeg = Math.max(1, Math.min(waypoints.length-1, Math.round(st*(waypoints.length-1))));
        break;
      }
    }
    if(bad===null) break;
    waypoints.splice(badSeg, 0, badFix);
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

var LIFE_ORD_T = 0;
var lifeOrdHullParts = [
  { geo: new THREE.CylinderGeometry(0.34*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 1.15*LIFE_PEOPLE_SCALE, 6), color: 0x2d5c3a },
  { geo: new THREE.BoxGeometry(0.42*LIFE_PEOPLE_SCALE, 0.42*LIFE_PEOPLE_SCALE, 0.42*LIFE_PEOPLE_SCALE).translate(0, 0.76*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 },
  /* shield, held at the left */
  { geo: new THREE.BoxGeometry(0.06*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(-0.32*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 },
  { geo: new THREE.BoxGeometry(0.04*LIFE_PEOPLE_SCALE, 0.42*LIFE_PEOPLE_SCALE, 0.28*LIFE_PEOPLE_SCALE).translate(-0.33*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0), color: 0x2d5c3a },
  /* sword, sheathed at the right hip */
  { geo: new THREE.CylinderGeometry(0.035*LIFE_PEOPLE_SCALE, 0.035*LIFE_PEOPLE_SCALE, 0.6*LIFE_PEOPLE_SCALE, 5).translate(0.28*LIFE_PEOPLE_SCALE, 0.35*LIFE_PEOPLE_SCALE, 0), color: 0xb8b8b0 },
  { geo: new THREE.CylinderGeometry(0.05*LIFE_PEOPLE_SCALE, 0.05*LIFE_PEOPLE_SCALE, 0.10*LIFE_PEOPLE_SCALE, 5).translate(0.28*LIFE_PEOPLE_SCALE, 0.62*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 }
];
var lifeOrdGeo = lifeMergeGeoms(lifeOrdHullParts);

/* the real walkable terrace a square canton has under (x,z), read from
   CANTON_FACES (50-cantons.js) — the record every canton builder writes
   while its own numbers are still in hand, and the one thing nothing
   overwrites. It answers what CANTON_TOPS cannot for the Fortress:
   ordinatorFortress() (65-facade.js) rewrites that canton's CANTON_TOPS
   record wholesale on its way past, tierRings included, so cantonHeightAt()
   there degrades to ONE flat top-of-stack height for every point on the
   canton, however far out it is.
   levels[] runs outermost/lowest first and each entry carries its own outer
   lip, so the terrace under a point is the HIGHEST level whose lip still
   reaches it — walked from the top down, the same shape cantonHeightAt()'s
   tierRings walk already has. SQUARE, not round: these platforms are
   squares, and a circular radius test is wrong by up to a factor of sqrt(2)
   on the diagonals. Returns null past the plinth apron's own lip, i.e.
   genuinely off the canton. */
function lifeCantonTerrace(name, x, z){
  var f = CANTON_FACES[name]; if(!f || !f.levels || !f.levels.length) return null;
  var c = CIDX[name]; if(!c) return null;
  var q = Math.max(Math.abs(x-c.x), Math.abs(z-c.z));
  for(var i=f.levels.length-1; i>=0; i--) if(q <= f.levels[i].outer) return f.levels[i];
  return null;
}
var LIFE_ORD_POSTS = [];   /* {x,z,ry,radius,officer} — fixed-post ordinators */
(function(){
  /* fortress + palace: 50 sentries, split evenly, ringed round each
     canton's own physical edge.

     owner: "the ordinators form a circle floating in space around it — make
     them actually stand on the canton." Real bug, measured against the built
     scene rather than reasoned about: the 25 posts sat on a CIRCLE of radius
     1.05*c.r (157.5 at the Fortress) at a single height of 44.36, while a
     downward raycast puts the real surface out there at 6.0 (the plinth
     apron) — 38.5 units of open air under every post on the four axes. The
     canton is a SQUARE, so the four diagonal posts happened to be over the
     top deck's own corner (the cornice reaches 161 on the diagonal, 114 on
     the axes) and did land on stone at 44.36, which is exactly why the ring
     read as a circle of figures half standing, half hovering.
     Two causes, both fixed here: the ring is now a SQUARE ring (via
     squareEdgeHw, 50-cantons.js — the same correction CPIERS and the canton
     doors already carry), so every post sits on the same terrace band all
     the way round; and each post's height comes from lifeCantonTerrace()
     above, i.e. the terrace really under it, instead of a flat
     cantonHeightAt() that the Fortress's overwritten CANTON_TOPS record can
     only answer with the top of the stack. The Palace ring was floating the
     same way and for the same two reasons (measured: y 53.26, real surface
     -38 open water at 215 out) and is carried along by the same fix. */
  ['Fortress','Palace'].forEach(function(nm){
    var c = CIDX[nm]; if(!c) return;
    var lv0 = (CANTON_FACES[nm] && CANTON_FACES[nm].levels) ? CANTON_FACES[nm].levels[0] : null;
    /* the apron walk: a few units in from its own outer lip, which is where
       a sentry ringing a canton's physical edge actually stands. */
    var walkHw = lv0 ? (lv0.outer - 4.0) : c.r*1.05;
    for(var i=0;i<25;i++){
      var a = (i/25)*Math.PI*2;
      var rr2 = squareEdgeHw(walkHw, a);
      var ex = c.x + Math.cos(a)*rr2, ez = c.z + Math.sin(a)*rr2;
      var tr = lifeCantonTerrace(nm, ex, ez);
      LIFE_ORD_POSTS.push({ x:ex, z:ez, ry:a+Math.PI, radius:5, officer: (i%5===0),
                            y: tr ? tr.y : cantonHeightAt(nm, ex, ez) });
    }
  });
  /* markets: 5 per mainland market DISTRICT plus 5 at the Market CANTON
     itself — both are real "markets" in this city, not just the canton. */
  var marketCenters = [];
  DISTRICTS.forEach(function(d){ if(d.type==='market') marketCenters.push({pt:lifePolyCentroid(d.poly), y:null}); });
  var marketCanton = CIDX['Market'];
  if(marketCanton) marketCenters.push({pt:[marketCanton.x, marketCanton.z], y:cantonEdgeY('Market')});
  marketCenters.forEach(function(mc){
    for(var i=0;i<5;i++){
      var a2 = (i/5)*Math.PI*2;
      LIFE_ORD_POSTS.push({ x:mc.pt[0]+Math.cos(a2)*14, z:mc.pt[1]+Math.sin(a2)*14, ry:a2, radius:9, officer:(i===0), y:mc.y });
    }
  });
  /* 12 patrol squads of 5, each clustered near its own random open
     mainland point — "patrol the city" simplified to "posted around
     the city" (see file comment above). */
  for(var s=0;s<12;s++){
    var sx=0, sz=0, tries=0, ok=false;
    while(tries<40 && !ok){
      sx = rr(-CITY_LIM*0.85, CITY_LIM*0.85); sz = rr(-CITY_LIM*0.85, CITY_LIM*0.85);
      ok = terrainH(sx,sz) >= 4 && !inRiver(sx,sz,20);
      tries++;
    }
    for(var m=0;m<5;m++){
      var a3 = (m/5)*Math.PI*2;
      LIFE_ORD_POSTS.push({ x:sx+Math.cos(a3)*6, z:sz+Math.sin(a3)*6, ry:a3, radius:18, officer:(m===0) });
    }
  }
  /* standing guards: the customs house (65-facade.js's own standalone
     siting, cx/cz transcribed directly) plus every causeway's mainland
     landing (CAUSEWAYS, 30-layout.js) — 2 flanking each. */
  var guardSpots = [[951.58,-939.26]];
  CAUSEWAYS.forEach(function(cw){ guardSpots.push(shoreAt(cw.s)); });
  guardSpots.forEach(function(gp){
    [-1,1].forEach(function(side){
      LIFE_ORD_POSTS.push({ x:gp[0]+side*3, z:gp[1]+side*1.5, ry:0, radius:2, officer:false });
    });
  });
  /* WALL-TOWER SENTRIES (owner: "...plus one ordinator sentry stationed on
     it"). One posted ordinator on every INTACT curtain-wall tower's sentry
     perch. window._newTowers (60-land.js) carries a `perch` record —
     {y, hw, side} straight off watchtower()'s own geometry — for exactly
     the towers that actually built one; a ruined or destroyed tower has no
     perch and therefore gets no sentry, so "the intact ones" is enforced by
     the geometry itself rather than by re-testing health here.

     Deliberately a POST, not a new population: posts reuse this file's
     existing lifeOrdMesh and its reserved lantern slot, and both
     LIFE_ORD_N (below) and LANTERN_ORD_BASE (82-daynight.js) are derived
     from LIFE_ORD_POSTS.length, so the counts grow by themselves — no new
     draw call and no hand-maintained constant to keep in step.

     y is the perch deck's REAL surface, not lifeGroundY(): a sentry 36
     units up a tower has no business asking the terrain how high it is.
     Position is the outward parapet (perch.side is the face away from the
     ladder, which watchtower() puts on the city-facing side), and the yaw
     ry + side*PI/2 turns local +x*side — i.e. straight out over that
     parapet — into the direction the figure faces. */
  (window._newTowers||[]).forEach(function(t){
    if(!t.perch) return;
    var sp = loc(t.x, t.z, t.perch.side*(t.perch.hw-2.1), 0, t.ry);
    LIFE_ORD_POSTS.push({ x:sp[0], z:sp[1], ry: t.ry + t.perch.side*Math.PI/2,
                          radius:1.6, officer:false, y:t.perch.y, towerSentry:true });
  });
})();

/* the ring-road squads: real back-and-forth movement, Fortress <->
   customs house. One shared route, each of the 20 members phase-offset
   along it so they read as a loose marching column, not one soldier
   duplicated twenty times. */
var LIFE_ORD_RING_N = 20;
/* owner: "make the patrol split up into 4 groups of 5 who walk together
   instead of stringing them all along individually." 4 squads, evenly
   spaced around the curve's full out-and-back cycle; LIFE_ORD_SQUAD_LAT
   is each member's offset perpendicular to the direction of march, so a
   squad reads as a rank abreast on the road rather than five figures
   stacked on one point. Deliberately asymmetric/uneven so it looks like
   a patrol, not a parade formation. */
var LIFE_ORD_RING_GROUPS = 4, LIFE_ORD_RING_PER_GROUP = LIFE_ORD_RING_N/4;
var LIFE_ORD_SQUAD_LAT = [-2.2, -0.9, 0.4, 1.7, 2.9];
var LIFE_ORD_RING_CURVE = (function(){
  var fort = CIDX['Fortress']; if(!fort) return null;
  /* THE owner's report 1, in one line: "a line of ordinators keeps trying to
     path across the bay and walk thru the water". Twenty ordinators share
     this ONE curve, which is why it reads as a line of them — and it used to
     start at a made-up "gate edge", a point on the fortress's own rim chosen
     by bearing toward the customs house. Measured live: that point is
     (-84,-801), terrain h = -19 (open bay, like every canton's surroundings),
     its nearest ROAD node was 870 units away across the water on the far
     bank, and lifeRoadPath() consequently failed outright — so the entire
     patrol leg fell through to raw cross-country land avoidance and swam.
     There is exactly one real way off the Fortress on foot, the causeway
     50-cantons.js actually builds, so the patrol now forms up where that
     causeway meets the canton (the same ax/az lifeCausewayY computes for
     its own deck) and marches down it. With the causeway in the road graph
     (30-layout.js section 5g) lifeRoadPath now returns a real ~250-node
     all-road route for this leg. */
  var cw = null;
  for(var i=0;i<CAUSEWAYS.length;i++) if(CAUSEWAYS[i].c === fort){ cw = CAUSEWAYS[i]; break; }
  var gx, gz;
  if(cw){
    var land = shoreIn(cw.s, 26);
    var dx = land[0]-fort.x, dz = land[1]-fort.z, L = Math.hypot(dx,dz) || 1;
    gx = fort.x + dx/L*fort.r*0.96; gz = fort.z + dz/L*fort.r*0.96;
  }else{
    var a0 = Math.atan2(-939.26 - fort.z, 951.58 - fort.x);
    gx = fort.x + Math.cos(a0)*fort.r*1.05; gz = fort.z + Math.sin(a0)*fort.r*1.05;
  }
  return lifeCartBuildLeg(gx, gz, 951.58, -939.26);
})();
var LIFE_ORD_RING_LEN = LIFE_ORD_RING_CURVE ? LIFE_ORD_RING_CURVE.getLength() : 0;
var LIFE_ORD_RING_DUR = Math.max(20, LIFE_ORD_RING_LEN/3.0);

/* ---- the Fortress garrison: boundary patrol + daytime training drills ----
   owner: "sentries patrol the boundary, and during the day there are a
   couple of groups doing training drills."

   Both reuse the ordinator machinery wholesale — lifeOrdMesh's geometry and
   material, LIFE_ORD_N's derived instance count, and therefore the reserved
   lantern block (LANTERN_ORD_BASE, 82-daynight.js, sized from LIFE_ORD_N)
   — so neither costs a draw call and neither needs a hand-maintained
   constant anywhere else.

   WHERE. Both stand on terraces read out of CANTON_FACES via
   lifeCantonTerrace() above, never on a guessed height:
     - the patrol walks the rampart terrace on top of tier 0 (surface
       y=24.9), not the plinth apron the standing posts ring. Measured, not
       chosen by taste: tier 0's cornice is 1.06x its own BASE half-width
       and therefore cantilevers 29 units out over the apron, so of the
       apron's 144.4..160.5 band only the 154.2..160.5 strip is actually
       open to the sky — the standing posts fit in it (they sit at 156.5),
       a four-abreast marching lane does not, and a first pass at 148.5
       measured 18.7 units of solid cornice directly overhead for the whole
       lap. The lap is a SQUARE circuit, not a circle, because the boundary
       it is patrolling is square — same reason the post ring above is.
     - the drills use the broad terrace on top of tier 0 (surface y=24.9,
       band 125.1..154.2, ~29 units deep — the widest open floor the canton
       has; the top deck is almost entirely taken up by the keep's own
       footprint, 90.6 of its 114.1).

   WHEN. Drills run 7..18 off dayNightHour() (82-daynight.js's shared clock,
   never a private timer — the same gate updateArena()/the shopkeepers use),
   and outside that window every drill figure is parked at zero scale, the
   hide-an-instance trick this file already uses for the arena and the
   clergy goat. The boundary patrol runs around the clock, as a watch does,
   and carries its lantern at night like every other ordinator.

   HOW THEY MOVE. The drill groups are the warrior-sparring-pair primitive
   from updateGuildWorkers() (the pairDx/pairDz/pairId "close along the
   pair's own shared line, then pull back" idiom), extended rather than
   reinvented: group 0 is three such bouts, and group 1 applies the same
   shared-line lunge to a whole RANK at once — five figures phase-locked on
   one pairId so they step and recover together, which is what turns a bout
   into a drill — with an instructor pacing the front of the rank. */
var LIFE_FORT_SQ = [[1,-1],[1,1],[-1,1],[-1,-1]];   /* the square circuit's corners, in march order */
var LIFE_FORT_PATROL_SQUADS = 2, LIFE_FORT_PATROL_PER = 4;
var LIFE_FORT_PATROL_N = LIFE_FORT_PATROL_SQUADS * LIFE_FORT_PATROL_PER;
var LIFE_FORT_PATROL_LAT = [-3.1, -1.0, 1.0, 3.2];  /* abreast across the lane, deliberately uneven */
var LIFE_FORT_PATROL_SPEED = 4.2;                   /* world units/second along the boundary */
var LIFE_FORT_DRILL_GROUPS = 2, LIFE_FORT_DRILL_PER = 6;
var LIFE_FORT_DRILL_N = LIFE_FORT_DRILL_GROUPS * LIFE_FORT_DRILL_PER;
var LIFE_FORT_HOUR_OPEN = 7, LIFE_FORT_HOUR_CLOSE = 18;   /* daylight, same sunrise/sunset hours the shopkeeper + quarry cycles in this file use */
/* {hw, y, cx, cz} — the patrol's own square lap, or null if there is no
   Fortress canton to walk round. */
var LIFE_FORT_BOUNDARY = (function(){
  var c = CIDX['Fortress']; if(!c) return null;
  var f = CANTON_FACES['Fortress']; if(!f || !f.levels || f.levels.length < 2) return null;
  var lv = f.levels[1];                    /* the rampart terrace on top of tier 0 */
  return { cx:c.x, cz:c.z, hw: lv.outer - 6.5, y: lv.y };   /* a lane just inboard of the terrace lip */
})();
var LIFE_FORT_DRILLS = [];
(function(){
  var c = CIDX['Fortress']; if(!c) return;
  var f = CANTON_FACES['Fortress']; if(!f || !f.levels || f.levels.length < 2) return;
  var lv = f.levels[1];                       /* the terrace on top of tier 0 */
  var rMid = (lv.hw + lv.outer) * 0.5;        /* mid of the walkable band: wall foot -> outer lip */
  /* two groups on two different faces, so both read from the usual
     approaches instead of hiding behind the keep: +x (bay side) and +z. */
  [[1,0],[0,1]].forEach(function(face, g){
    var nx = face[0], nz = face[1];           /* outward face normal */
    var tx = -nz, tz = nx;                    /* along the face */
    var cx = c.x + nx*rMid, cz = c.z + nz*rMid;
    var outAng = Math.atan2(nx, nz);
    if(g === 0){
      /* three sparring bouts, partners facing each other ACROSS the band
         (in/out), spaced along the face. */
      for(var p=0;p<3;p++){
        var ox = (p-1)*9.0;
        for(var s=-1; s<=1; s+=2){
          LIFE_FORT_DRILLS.push({
            x: cx + tx*ox + nx*s*2.4, z: cz + tz*ox + nz*s*2.4,
            y: lv.y, kind:'spar', pairId: p,
            pairDx: -nx*s, pairDz: -nz*s,     /* the shared line: straight at the partner */
            ry: outAng + (s>0 ? Math.PI : 0)
          });
        }
      }
    }else{
      /* a rank of five plus an instructor out front facing them. The rank
         all share pairId 9 so they lunge and recover as one body. */
      for(var k=0;k<5;k++){
        LIFE_FORT_DRILLS.push({
          x: cx + tx*(k-2)*3.6 - nx*2.0, z: cz + tz*(k-2)*3.6 - nz*2.0,
          y: lv.y, kind:'rank', pairId: 9, rank: k,
          pairDx: nx, pairDz: nz, ry: outAng
        });
      }
      LIFE_FORT_DRILLS.push({
        x: cx + nx*7.0, z: cz + nz*7.0, y: lv.y, kind:'instructor', pairId: 9, rank: 0,
        pairDx: -nx, pairDz: -nz, tx: tx, tz: tz, ry: outAng + Math.PI
      });
    }
  });
})();

/* + LIFE_CG_CREW_N: the Fortress coast guard's crew are ordinators, not a
   new humanoid (the owner: "it is crewed by ordinators"), so they are just
   five more instances on this mesh — and because LANTERN_ORD_BASE
   (82-daynight.js) is itself sized from LIFE_ORD_N, their night lanterns
   come with them and nothing there has to be edited either. */
var LIFE_ORD_N = LIFE_ORD_POSTS.length + LIFE_ORD_RING_N + LIFE_FORT_PATROL_N + LIFE_FORT_DRILL_N + LIFE_CG_CREW_N;
var lifeOrdMesh = new THREE.InstancedMesh(lifeOrdGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_ORD_N);
lifeOrdMesh.userData.life = true; lifeOrdMesh.userData.inspectLabel = 'Ordinator';
lifeOrdMesh.frustumCulled = false;
scene.add(lifeOrdMesh);
window._ordinators = { posts: LIFE_ORD_POSTS.length, ring: LIFE_ORD_RING_N, total: LIFE_ORD_N,
  towerSentries: LIFE_ORD_POSTS.filter(function(p){ return p.towerSentry; }).length,
  ringCurve: LIFE_ORD_RING_CURVE, ringLen: Math.round(LIFE_ORD_RING_LEN),
  /* the Fortress garrison, so its placement can be sampled from outside the
     same way the ring curve already can */
  fortPatrol: LIFE_FORT_PATROL_N, fortDrills: LIFE_FORT_DRILL_N, cgCrew: LIFE_CG_CREW_N,
  fortBoundary: LIFE_FORT_BOUNDARY, fortDrillPosts: LIFE_FORT_DRILLS,
  fortPatrolBase: LIFE_ORD_POSTS.length + LIFE_ORD_RING_N,
  drillsOn: function(){ var h = dayNightHour(); return h >= LIFE_FORT_HOUR_OPEN && h < LIFE_FORT_HOUR_CLOSE; } };   /* diagnostic: the shared patrol curve, so its route can be sampled from outside */

var lifeOrdTmpPos = new THREE.Vector3(), lifeOrdTmpDir = new THREE.Vector3();
var lifeOrdTmpQuat = new THREE.Quaternion(), lifeOrdTmpMat = new THREE.Matrix4();
var lifeOrdTmpScale1 = new THREE.Vector3(1,1,1);
var lifeOrdTmpScale0 = new THREE.Vector3(0,0,0);   /* the hide-an-instance scale the arena/clergy already use */
function updateOrdinators(dt){
  LIFE_ORD_T += dt;
  LIFE_ORD_POSTS.forEach(function(p, idx){
    var ang = LIFE_ORD_T*0.35 + idx*2.3;
    var opX = p.x + Math.sin(ang)*p.radius*0.3, opZ = p.z + Math.cos(ang*0.6)*p.radius*0.3;
    var opBaseY = (p.y != null) ? p.y : lifeGroundY(opX, opZ);
    lifeOrdTmpPos.set(opX, Math.max(LIFE_Y, opBaseY + 0.15), opZ);
    lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, p.ry + Math.sin(ang*0.4)*0.3);
    lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
    lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
    /* owner: "ordinators also carry lanterns" — 82-daynight.js's own
       nlMesh, one reserved slot per ordinator (LANTERN_ORD_BASE..). */
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
  });
  var ringBase = LIFE_ORD_POSTS.length;
  if(LIFE_ORD_RING_CURVE){
    for(var i=0;i<LIFE_ORD_RING_N;i++){
      /* owner: "make the patrol split up into 4 groups of 5 who walk
         together instead of stringing them all along individually."
         Was one phase per walker ((i%10)*0.035), which spread all 20
         evenly down the curve — fine when the ring was a short hop, but
         once the route became a real ~9.7km land circuit around the bay
         it read as 20 lone figures scattered over 3km of road. Now the
         phase is per GROUP (4 groups, evenly spaced around the full
         out-and-back cycle) with only a hair of spacing between members
         of the same group, plus a lateral offset below so the five walk
         abreast in a loose squad rather than single file. */
      var g = Math.floor(i/LIFE_ORD_RING_PER_GROUP), m = i%LIFE_ORD_RING_PER_GROUP;
      /* the intra-squad offset must be derived from the curve's REAL length,
         not a flat parameter constant: measured live, a flat 0.0035 per
         member held squads ~2.5 units apart near the turnarounds (where
         the smoothstep's slope is ~0) but blew them out to 90-130 units
         at mid-route (slope 1.5x) — two of the four squads were not
         squads at all. 3 world units per member, converted through the
         curve length, keeps every squad tight wherever it is on the run. */
      /* groups spread over ONE traverse (1/N), not the whole out-and-back
         cycle (2/N): with 2/N, squad g and squad g+N/2 land on the same
         point of the curve travelling in opposite directions — measured,
         groups 1 and 3 both sat at (127,2026). Over one traverse all four
         sit at distinct points and march the same way, which is what a
         patrol rota actually looks like. */
      var phase = g*(1/LIFE_ORD_RING_GROUPS) + m*(3.0/Math.max(1, LIFE_ORD_RING_LEN));
      var cyc = ((LIFE_ORD_T/LIFE_ORD_RING_DUR) + phase) % 2;
      var forward = cyc <= 1;
      var tt = forward ? cyc : 2-cyc;
      var t = Math.max(0.005, Math.min(0.995, tt*tt*(3-2*tt)));
      LIFE_ORD_RING_CURVE.getPointAt(t, lifeOrdTmpPos);
      /* lateral spread within the squad: perpendicular to the direction
         of travel in xz, so the group forms a rank on the road instead of
         all five occupying the same metre of curve. Tangent is sampled
         BEFORE the ground-height query below, since offsetting x/z has to
         happen first for that height to be the right one. */
      LIFE_ORD_RING_CURVE.getTangentAt(t, lifeOrdTmpDir);
      var perpL = Math.hypot(lifeOrdTmpDir.x, lifeOrdTmpDir.z) || 1;
      var lat = LIFE_ORD_SQUAD_LAT[m];
      lifeOrdTmpPos.x += (-lifeOrdTmpDir.z/perpL)*lat;
      lifeOrdTmpPos.z += ( lifeOrdTmpDir.x/perpL)*lat;
      /* re-sampled live, not just baked into the curve at build time: the
         curve only has a handful of control points, so Catmull-Rom
         smooths its height linearly between them — sagging below deck
         level anywhere a causeway or canton lies between two waypoints
         instead of under one. Recomputing the true ground/deck height at
         the walker's actual x,z every frame fixes that regardless of how
         coarse the curve's own baked heights are. */
      lifeOrdTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifeOrdTmpPos.x, lifeOrdTmpPos.z) + 0.15);
      var yaw = Math.atan2(lifeOrdTmpDir.x*(forward?1:-1), lifeOrdTmpDir.z*(forward?1:-1));
      lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
      lifeOrdMesh.setMatrixAt(ringBase+i, lifeOrdTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+ringBase+i, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
    }
  }
  updateFortGarrison(ringBase + LIFE_ORD_RING_N);
  updateCGuardCrew(ringBase + LIFE_ORD_RING_N + LIFE_FORT_PATROL_N + LIFE_FORT_DRILL_N);
  lifeOrdMesh.instanceMatrix.needsUpdate = true;
}

/* the Fortress boundary patrol + the two daytime drill groups — see
   LIFE_FORT_BOUNDARY/LIFE_FORT_DRILLS above for what they are and why they
   live inside the ordinator population rather than beside it. `base` is the
   first lifeOrdMesh instance index this owns; everything below it is the
   posts and the ring-road squads, untouched. */
function updateFortGarrison(base){
  var t = LIFE_ORD_T, idx = base, B = LIFE_FORT_BOUNDARY, i, m;
  /* ---- the boundary patrol: two squads, four abreast, marching the
     canton's own square perimeter. Position is worked out on the square
     itself (side + fraction) rather than by sampling a curve, because the
     boundary IS four straight runs and a walker should turn the corner
     rather than cut it. */
  if(B){
    var per = 2*B.hw;                                  /* length of one side */
    var u = (t*LIFE_FORT_PATROL_SPEED/per) % 4;        /* laps measured in sides */
    for(var g=0; g<LIFE_FORT_PATROL_SQUADS; g++){
      var ug = (u + g*(4/LIFE_FORT_PATROL_SQUADS)) % 4;
      var s = Math.floor(ug), f = ug - s;
      var A = LIFE_FORT_SQ[s], C = LIFE_FORT_SQ[(s+1)%4];
      var ax = B.cx + A[0]*B.hw, az = B.cz + A[1]*B.hw;
      var cx = B.cx + C[0]*B.hw, cz = B.cz + C[1]*B.hw;
      var dx = cx-ax, dz = cz-az, L = Math.hypot(dx,dz) || 1;
      dx /= L; dz /= L;
      var px = -dz, pz = dx;                            /* one of the two normals... */
      var mx = ax + (cx-ax)*0.5, mz = az + (cz-az)*0.5;
      if((B.cx-mx)*px + (B.cz-mz)*pz < 0){ px = -px; pz = -pz; }   /* ...the one pointing inboard */
      var yaw = Math.atan2(dx, dz);
      for(m=0; m<LIFE_FORT_PATROL_PER; m++){
        /* a hair of along-track stagger as well as the lateral spread, so
           the rank reads as a squad on the march rather than a drawn line */
        var along = f*L - m*0.5;
        lifeOrdTmpPos.set(ax + dx*along + px*LIFE_FORT_PATROL_LAT[m],
                          B.y + 0.15,
                          az + dz*along + pz*LIFE_FORT_PATROL_LAT[m]);
        lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, yaw + Math.sin(t*1.7 + m)*0.06);
        lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
        lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
        if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
        idx++;
      }
    }
  }else{
    for(i=0;i<LIFE_FORT_PATROL_N;i++){
      lifeOrdTmpMat.compose(lifeOrdTmpPos.set(0,0,0), lifeOrdTmpQuat, lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, 0, 0, 0, false);
      idx++;
    }
  }
  /* ---- the drills, daylight only. Off the shared clock, not a private
     timer; parked at zero scale outside the window (and their lantern slot
     parked with them) so the terrace is visibly empty at night. */
  var on = (typeof dayNightHour === 'function');
  if(on){ var hr = dayNightHour(); on = (hr >= LIFE_FORT_HOUR_OPEN && hr < LIFE_FORT_HOUR_CLOSE); }
  for(i=0;i<LIFE_FORT_DRILL_N;i++){
    var d = LIFE_FORT_DRILLS[i];
    if(!on || !d){
      lifeOrdTmpMat.compose(lifeOrdTmpPos.set(0,0,0), lifeOrdTmpQuat, lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, 0, 0, 0, false);
      idx++; continue;
    }
    var dxp = 0, dzp = 0, dyp = 0, dyaw = d.ry;
    if(d.kind === 'spar'){
      /* updateGuildWorkers()' warrior bout, verbatim in shape: close along
         the pair's own shared line, then pull back, phase-locked per pair. */
      var lunge = Math.sin(t*2.2 + d.pairId*10)*0.5 + 0.5;
      dxp = d.pairDx*lunge*1.6; dzp = d.pairDz*lunge*1.6;
      dyaw = Math.atan2(d.pairDx, d.pairDz) + Math.sin(t*4 + i)*0.2;
    }else if(d.kind === 'rank'){
      /* the same primitive applied to five figures on ONE pairId: they
         advance and recover as one body, which is what makes it read as a
         drill rather than five people fidgeting. Slower than a bout, with a
         step-hop on the advance. */
      var beat = Math.sin(t*1.4 + d.pairId*10)*0.5 + 0.5;
      dxp = d.pairDx*beat*2.2; dzp = d.pairDz*beat*2.2;
      dyp = Math.max(0, Math.sin(t*2.8 + d.pairId*10))*0.22;
      dyaw = d.ry + Math.sin(t*0.45)*0.5;               /* the whole rank turns together */
    }else{
      /* the instructor: paces the front of the rank, facing it. */
      var pace = Math.sin(t*0.55);
      dxp = (d.tx||0)*pace*4.0; dzp = (d.tz||0)*pace*4.0;
      dyaw = d.ry + Math.sin(t*0.9)*0.25;
    }
    lifeOrdTmpPos.set(d.x + dxp, d.y + 0.15 + dyp, d.z + dzp);
    lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, dyaw);
    lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
    lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
    idx++;
  }
}

/* ============================== citizens: priests & templars ===============
   Item 3 of 4 planned populations (merchant caravans still not built).
   Small, deliberately: 2 shrine priests (purple robe), 1 high priest
   (meant to read crimson-cloak-and-gold-miter — approximated by the
   SAME shared geometry/colouring as everyone else in this population,
   not a distinct model; see the file comment on ordinators for the same
   per-role-visual-variant-costs-a-draw-call tradeoff, same call made
   here) and 8 templars guarding shrine/temple doors. One more draw call
   (see BUDGET.drawCalls, 05-palette.js) for a population this small is
   a stretch, but priests and guards are core to "make the temple/shrine
   area feel alive" in a way an empty draw-call budget shouldn't block.

   The high priest is the one citizen in this whole session with real
   scripted behaviour beyond idle-wander-at-a-post: it cycles between a
   resting spot at the Temple canton's own main entrance (CPIERS) and
   TEMPLE_ALTAR (65-facade.js's new platform, this file runs after it so
   the export is already populated) — "comes out and does a sacrifice
   every so often." This is a straight-line RISE, not a staircase walk —
   canton-interior circulation (stairs between tiers) isn't modelled
   anywhere in this life layer yet, for any population, so a smooth
   3D lerp between the two known points is the honest simplification
   here, not a shortcut unique to this feature. */
var LIFE_CLERGY_T = 0;
var lifeClergyHullParts = [
  { geo: new THREE.CylinderGeometry(0.26*LIFE_PEOPLE_SCALE, 0.46*LIFE_PEOPLE_SCALE, 1.3*LIFE_PEOPLE_SCALE, 7), color: 0x6b1f3a },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.85*LIFE_PEOPLE_SCALE, 0), color: LIFE_SKIN },
  { geo: new THREE.ConeGeometry(0.30*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE, 6).translate(0, 1.16*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 }
];
var lifeClergyGeo = lifeMergeGeoms(lifeClergyHullParts);

var LIFE_CLERGY_POSTS = [];   /* shrine priests + templars — fixed posts, idle-wander */
LIFE_SHRINE_STOPS.forEach(function(s){
  LIFE_CLERGY_POSTS.push({ x:s.x, z:s.z, ry:s.ry, radius:4, role:'priest' });
  [-1,1].forEach(function(side){
    LIFE_CLERGY_POSTS.push({ x:s.x+side*3, z:s.z, ry:s.ry, radius:2, role:'templar' });
  });
});
(function(){
  /* owner: "temple clergy hanging out in midair around [442.0,406.8]", then
     "pedestrians swimming while queueing" at the same spot — real bugs,
     same root cause. That point is ~330 units from Temple's own centre
     (210,170) — well past its canton radius (188) — which only makes
     sense as a ferry-pier TIP (piers legitimately project out over open
     water past a canton's edge; CPIERS' own x1/z1 is exactly that far-end
     point). The post below was given cantonEdgeY('Temple') — a flat
     height for the CANTON's own deck — for a position nowhere near that
     deck; lifeGroundY() itself had no pier-height coverage at all (only
     causeways/cantons/terrain), which is also why pedestrians queueing at
     this same dock sank to open-water height. Fixed lifeGroundY() itself
     (this file, above) to know about both CPIERS and the ferry-built
     LIFE_EXTRA_PIERS — omitting `y` here now and letting that shared,
     position-aware fallback resolve it is the more robust fix (self-
     corrects if the pier geometry ever changes) rather than re-hardcoding
     another flat literal at this one call site. */
  var tp = CPIERS.filter(function(p){ return p.canton==='Temple'; })[0];
  if(tp){
    [-1,1].forEach(function(side){
      LIFE_CLERGY_POSTS.push({ x:tp.x1+side*3, z:tp.z1, ry:tp.ry, radius:2, role:'templar' });
    });
  }
  if(TEMPLE_ALTAR){
    /* this post DOES stand on the canton's own deck (TEMPLE_ALTAR sits
       centrally under the raised dome, well inside the canton radius) —
       but cantonEdgeY('Temple') is still the wrong tool: Temple is a
       6-tier canton and that flat lookup doesn't know which tier a given
       (x,z) actually stands on (the whole reason cantonHeightAt()/
       tierRings exist — see 78-life.js's own header comment on
       lifeGroundY). The altar/staircase sit on the TOPMOST tier
       specifically, whose real height is CANTON_TOPS['Temple'].y —
       exactly what TEMPLE_ALTAR's own y was already built from. */
    var templeTop = CANTON_TOPS['Temple'];
    var templarY = templeTop ? templeTop.y : TEMPLE_ALTAR.y;
    [-1,1].forEach(function(side){
      LIFE_CLERGY_POSTS.push({ x:TEMPLE_ALTAR.doorX+side*3, z:TEMPLE_ALTAR.doorZ, ry:TEMPLE_ALTAR.ry, radius:2, role:'templar', y:templarY });
    });
  }
})();
/* +1 for the high priest, +1 for the noon sacrifice's own animal — no
   budget for a real goat asset (a distinct shape would need its own
   draw call, and the budget sits at zero headroom), so this reuses the
   shared clergy person-geometry instance, squashed low and wide and
   tinted a plain wool-cream via setColorAt, at the altar only while
   hp.state==='sacrifice' — an honest abstraction of "an animal is here,"
   not a literal goat model. */
var LIFE_CLERGY_N = LIFE_CLERGY_POSTS.length + 2;
var LIFE_GOAT_IDX = LIFE_CLERGY_POSTS.length + 1;
var lifeClergyMesh = new THREE.InstancedMesh(lifeClergyGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_CLERGY_N);
lifeClergyMesh.userData.life = true; lifeClergyMesh.userData.inspectLabel = 'Temple clergy';
lifeClergyMesh.frustumCulled = false;
scene.add(lifeClergyMesh);
(function(){
  var white = new THREE.Color(0xffffff), wool = new THREE.Color(0xd8cfae);
  for(var i=0;i<LIFE_CLERGY_N;i++) lifeClergyMesh.setColorAt(i, i===LIFE_GOAT_IDX ? wool : white);
  lifeClergyMesh.instanceColor.needsUpdate = true;
})();
window._clergy = { posts: LIFE_CLERGY_POSTS.length, total: LIFE_CLERGY_N, altar: TEMPLE_ALTAR, goatIdx: LIFE_GOAT_IDX };   /* diagnostic */

var lifeClergyTmpPos = new THREE.Vector3(), lifeClergyTmpQuat = new THREE.Quaternion();
var lifeClergyTmpMat = new THREE.Matrix4(), lifeClergyTmpScale1 = new THREE.Vector3(1,1,1);
var lifeClergyTmpScale0 = new THREE.Vector3(0,0,0), lifeClergyTmpPos2Goat = new THREE.Vector3();
var lifeGoatScale = new THREE.Vector3(0.55, 0.32, 0.85);   /* low, wide, long — an abstracted small animal */
/* the high priest's resting spot: the Temple canton's own front door
   (CPIERS), same point templars above are posted near — falls back to
   the altar's own door point if CPIERS somehow has no Temple entry. */
var LIFE_HIGHPRIEST_REST = (function(){
  var templeY = cantonEdgeY('Temple');
  var tp = CPIERS.filter(function(p){ return p.canton==='Temple'; })[0];
  if(tp) return { x:tp.x1, z:tp.z1, y:Math.max(LIFE_Y, (templeY!=null?templeY:terrainH(tp.x1,tp.z1))+0.15), ry:tp.ry };
  if(TEMPLE_ALTAR) return { x:TEMPLE_ALTAR.doorX, z:TEMPLE_ALTAR.doorZ, y:Math.max(LIFE_Y, (templeY!=null?templeY:terrainH(TEMPLE_ALTAR.doorX,TEMPLE_ALTAR.doorZ))+0.15), ry:TEMPLE_ALTAR.ry };
  return { x:0, z:0, y:Math.max(LIFE_Y, terrainH(0,0)+0.15), ry:0 };
})();
var LIFE_HIGHPRIEST = { state:'resting', stateT:0, riseFor: 6, sacrificedToday: false };
window._highpriest = LIFE_HIGHPRIEST;   /* diagnostic */

function updateClergy(dt){
  LIFE_CLERGY_T += dt;
  LIFE_CLERGY_POSTS.forEach(function(p, idx){
    var ang = LIFE_CLERGY_T*0.3 + idx*1.9;
    var cpX = p.x + Math.sin(ang)*p.radius*0.3, cpZ = p.z + Math.cos(ang*0.6)*p.radius*0.3;
    var cpBaseY = (p.y != null) ? p.y : lifeGroundY(cpX, cpZ);
    lifeClergyTmpPos.set(cpX, Math.max(LIFE_Y, cpBaseY + 0.15), cpZ);
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, p.ry + Math.sin(ang*0.4)*0.25);
    lifeClergyTmpMat.compose(lifeClergyTmpPos, lifeClergyTmpQuat, lifeClergyTmpScale1);
    lifeClergyMesh.setMatrixAt(idx, lifeClergyTmpMat);
  });
  /* the high priest, last slot */
  var hp = LIFE_HIGHPRIEST;
  hp.stateT += dt;
  var hpIdx = LIFE_CLERGY_POSTS.length;
  if(hp.state === 'resting'){
    lifeClergyTmpPos.set(LIFE_HIGHPRIEST_REST.x, LIFE_HIGHPRIEST_REST.y, LIFE_HIGHPRIEST_REST.z);
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, LIFE_HIGHPRIEST_REST.ry);
    /* owner: "at high noon every day, he will do an animal sacrifice" —
       was a random ~20-40s idle timer; now a real once-a-day trigger at
       hour 12, tracked with a sacrificedToday flag (cleared well before
       noon each day, at hour 6, so it can't accidentally re-arm itself
       mid-window) rather than the old free-running restFor countdown.
       This is also the same hour the 4 corner braziers ignite
       (82-daynight.js's TEMPLE_BRAZIER_LIT check, hour>=12) — the two
       fire independently but key off the same clock, so the sacrifice
       and the braziers lighting always land on the same moment. */
    var hpHour = dayNightHour();
    if(hpHour < 6) hp.sacrificedToday = false;
    if(hpHour >= 12 && !hp.sacrificedToday && TEMPLE_ALTAR){
      hp.sacrificedToday = true;
      hp.state = 'rising'; hp.stateT = 0;
    }
  }else if(hp.state === 'rising' || hp.state === 'descending'){
    var raw = Math.min(1, hp.stateT/hp.riseFor);
    var t = raw*raw*(3-2*raw);
    var tt = (hp.state === 'rising') ? t : (1-t);
    lifeClergyTmpPos.set(
      LIFE_HIGHPRIEST_REST.x + (TEMPLE_ALTAR.x-LIFE_HIGHPRIEST_REST.x)*tt,
      LIFE_HIGHPRIEST_REST.y + (TEMPLE_ALTAR.y-LIFE_HIGHPRIEST_REST.y)*tt,
      LIFE_HIGHPRIEST_REST.z + (TEMPLE_ALTAR.z-LIFE_HIGHPRIEST_REST.z)*tt
    );
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, TEMPLE_ALTAR.ry);
    if(raw >= 1){
      if(hp.state === 'rising'){ hp.state = 'sacrifice'; hp.stateT = 0; hp.sacrificeFor = rr(10,18); }
      else{ hp.state = 'resting'; hp.stateT = 0; }
    }
  }else if(hp.state === 'sacrifice'){
    lifeClergyTmpPos.set(TEMPLE_ALTAR.x, TEMPLE_ALTAR.y, TEMPLE_ALTAR.z);
    var bob = Math.sin(hp.stateT*2.2)*0.15;
    lifeClergyTmpPos.y += bob;
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, TEMPLE_ALTAR.ry + Math.sin(hp.stateT*0.8)*0.3);
    if(hp.stateT >= hp.sacrificeFor){ hp.state = 'descending'; hp.stateT = 0; }
  }
  lifeClergyTmpMat.compose(lifeClergyTmpPos, lifeClergyTmpQuat, lifeClergyTmpScale1);
  lifeClergyMesh.setMatrixAt(hpIdx, lifeClergyTmpMat);

  /* the sacrifice's own animal — visible only while hp is actually at the
     altar, right beside the priest, squashed low/wide/long on the shared
     person geometry (see LIFE_GOAT_IDX's own comment above). */
  if(hp.state === 'sacrifice'){
    lifeClergyTmpPos2Goat.set(TEMPLE_ALTAR.x + Math.cos(TEMPLE_ALTAR.ry+Math.PI/2)*1.4,
      TEMPLE_ALTAR.y - 0.9, TEMPLE_ALTAR.z + Math.sin(TEMPLE_ALTAR.ry+Math.PI/2)*1.4);
    lifeClergyTmpMat.compose(lifeClergyTmpPos2Goat, lifeClergyTmpQuat, lifeGoatScale);
  }else{
    lifeClergyTmpMat.compose(lifeClergyTmpPos2Goat.set(0,0,0), lifeClergyTmpQuat, lifeClergyTmpScale0);
  }
  lifeClergyMesh.setMatrixAt(LIFE_GOAT_IDX, lifeClergyTmpMat);
  lifeClergyMesh.instanceMatrix.needsUpdate = true;
}

