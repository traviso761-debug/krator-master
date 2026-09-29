/* ============================== 21. LIFE LAYER ==============================
   src/78-life.js — the start of voth-life-layer-brief.md's tier-1 vehicles.
   Small canoes only, for now, per the owner's explicit ask: "let's start
   some parts of the life layer. first, we can have some small canoes."

   Contract (brief §7): owns this file plus exactly one call added to the
   frame loop (80-camera.js). Never touches BUCKET/emitBuckets() — these are
   plain THREE.InstancedMesh objects added straight to `scene`, updated every
   frame from a small CPU simulation (brief's own tier-1: ~30 entities,
   fixed/weighted routes, no runtime collision). The full street/water graph
   + pathfinder the brief's §0 lists as a hard dependency for tier 2/3 does
   not exist yet; a real one is out of scope for a first pass of 20 slow,
   small boats, so routes use a cheap water-seeking heuristic (pushToWater)
   instead — noted here rather than silently pretending it's the real thing.

   Real bug, found the hard way while writing this: every fragment shares
   ONE function scope (brief §7's own warning — "a file boundary will not
   stop cross-contamination"). A local `var seed = ...` in the canoe init
   loop below silently REUSED the PRNG's own global `seed` (10-core.js) —
   there is no per-function scoping to stop it — overwriting the numeric
   RNG state with a coordinate array. The very next rnd() call then did
   `[x,z] * 16807`, which JS coerces to NaN, and every rnd() call after
   that returned NaN forever, silently — no exception until something
   finally indexed an array with a NaN result several calls later. Every
   local variable in this file is prefixed `life`/`LIFE` specifically to
   never collide with a shared global again. */
reseed(780001);

/* ---- shared people palette: population is ~75% Dunmer per the owner's
   own note, so every figure in this file defaults to that look — ashen
   grey-purple skin, dark or white hair — rather than the flat brown used
   everywhere before. Applied via vertex colours (lifeMergeGeoms below),
   not per-instance tinting: a background prop's race isn't worth a
   second InstancedMesh or an instanceColor buffer just to vary it, so
   this is one fixed look per mesh, not a real 75/25 population mix —
   noted honestly rather than pretending it's more than it is. */
var LIFE_SKIN = 0x8c8394;
var LIFE_HAIR_DARK = 0x241f1c;
var LIFE_HAIR_WHITE = 0xe6ded0;

/* ---- destination pools, weighted lowest to highest per the owner's
   explicit priority order: stilt houses < island shrines < temple & palace
   < harbour/docklands/market/arena. --------------------------------- */
var LIFE_STILT  = (window._chinampaHuts || []).map(function(h){ return [h[0], h[1]]; });
var LIFE_SHRINE = ISLES.filter(function(i){ return i[4] === 'shrine'; }).map(function(i){ return [i[0], i[1]]; });
var LIFE_HUB    = ['Temple', 'Palace'].map(function(n){ return CIDX[n]; }).filter(Boolean);
var LIFE_MAJOR  = ['Port', 'Ancestry', 'Arena'].map(function(n){ return CIDX[n]; }).filter(Boolean);

var LIFE_TIERS = [
  { pool: 'point',  points: LIFE_STILT,  weight: 1 },
  { pool: 'point',  points: LIFE_SHRINE, weight: 2 },
  { pool: 'canton', cantons: LIFE_HUB,   weight: 4 },
  { pool: 'canton', cantons: LIFE_MAJOR, weight: 7 }
];
var LIFE_WSUM = LIFE_TIERS.reduce(function(s, t){ return s + t.weight; }, 0);

/* the point on a canton's own rim closest to an approaching canoe — not its
   centre, which is solid platform. Same idea as CPIERS' own clearance math
   (30-layout.js), and the SAME real bug found there applies here just as
   directly: canton platforms are square, not round, so a flat radius
   multiplier only clears a face — an approach from near a 45-degree
   diagonal lands the "clearance" point well inside the actual corner
   (confirmed by verify.py --sweep: leg 1 sampled 34 points inside a
   68-unit-tall box, canton scale, right at its destination end). Same fix:
   the true distance from centre to a square's own edge along a bearing is
   capHw/max(|cos|,|sin|) of that bearing, reducing to capHw on a face and
   growing to capHw*1.414 at a corner. */
function lifeCantonApproach(c, fromX, fromZ){
  var dx = c.x - fromX, dz = c.z - fromZ, d = Math.hypot(dx, dz) || 1;
  var ang = Math.atan2(dz, dx);
  /* capHw=c.r*1.07 (the base plinth cap's own half-width) plus a small
     flat margin cleared the plinth itself but not every canton's own
     extra add-ons past it — quay rings, market sheds, stairs — which
     vary canton to canton and aren't worth modelling exactly for a
     decorative first pass. Bigger multiplier + bigger flat margin trades
     a little precision (canoes stop somewhat short of the true edge) for
     robustness against all of them at once; confirmed against
     verify.py --sweep after widening. */
  var capHw = c.r*1.45;
  var clearR = capHw / Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 40;
  return [c.x - dx/d*clearR, c.z - dz/d*clearR];
}
function lifePickDestination(fromX, fromZ){
  var r = rnd()*LIFE_WSUM, acc = 0;
  for(var i=0; i<LIFE_TIERS.length; i++){
    acc += LIFE_TIERS[i].weight;
    if(r > acc) continue;
    var tier = LIFE_TIERS[i];
    if(tier.pool === 'point' && tier.points.length) return pick(tier.points);
    if(tier.pool === 'canton' && tier.cantons.length) return lifeCantonApproach(pick(tier.cantons), fromX, fromZ);
  }
  return LIFE_STILT.length ? pick(LIFE_STILT) : [fromX, fromZ];
}

/* is (x,z) inside a canton's own clearance zone — same square-aware
   formula as lifeCantonApproach, checked against EVERY canton, not just
   this leg's own destination. Real gap found via verify.py --sweep: a
   mid-route waypoint can pass close to a DIFFERENT canton than either
   endpoint while crossing open water between them (a canton platform
   floats over water, so terrainH under it doesn't read as land — the
   land-push below never touches it at all without this separate check). */
function lifeCantonBlocked(x, z){
  for(var i=0; i<CANTONS.length; i++){
    var c = CANTONS[i];
    var dx = x-c.x, dz = z-c.z, d = Math.hypot(dx,dz) || 1;
    var ang = Math.atan2(dz,dx);
    var clearR = c.r*1.45/Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 40;
    if(d < clearR) return [c, dx/d, dz/d, clearR];
  }
  return null;
}
/* nudges a point toward open water if it's sitting on or near land, or
   clear of any canton's own platform. sdGrad (15-shore.js) is a unit
   vector pointing INLAND, so stepping against it walks toward deeper
   water. Not a real pathfinder — see the file header — just enough that
   a mid-route waypoint over a peninsula or a canton deck gets pulled
   back into open water instead of cutting across either. */
function lifePushToWater(x, z){
  for(var i=0; i<8; i++){
    var blocked = lifeCantonBlocked(x,z);
    if(blocked){ x = blocked[0].x + blocked[1]*blocked[3]; z = blocked[0].z + blocked[2]*blocked[3]; continue; }
    if(terrainH(x,z) < -1.5) break;
    var g = sdGrad(x,z);
    x -= g[0]*4; z -= g[1]*4;
  }
  return [x, z];
}
function lifeMix(a, b, t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
var LIFE_Y = SEA - 0.15;
/* height for a point pinned to a canton's own edge/door — cantons are
   platforms standing over open water (see verify.py's cantons-afloat
   invariant), so terrainH() under one returns the sea floor, not the
   walkable deck. Guards ringing a canton or posted at its door need the
   deck height CANTON_TOPS already carries, not terrainH. */
function cantonEdgeY(name){
  var t = CANTON_TOPS[name]; if(!t) return null;
  return (t.entryY != null) ? t.entryY : (t.spring != null ? t.spring : t.y);
}
/* height of a canton's OWN deck at a specific (x,z), not just "the edge" —
   owner: "pedestrians are still sinking to the neck in canton platforms
   sometimes." Root cause: lifeGroundY() (below) used cantonEdgeY(), ONE
   flat height, for a citizen anywhere inside the canton's full radius —
   correct only for whichever single tier that flat value happened to
   come from. A stepped-pyramid canton (platCanton()/monoCanton(),
   50-cantons.js) is genuinely a different height at every tier: someone
   near the outer ring stands on tier 0, someone further in stands on a
   taller tier above it, and a flat value put the second citizen partway
   inside the tier they should have been ON TOP of — "sinking to the
   neck" is exactly what a few units of the wrong, too-low tier height
   looks like. CANTON_TOPS[name].tierRings (added alongside this fix) now
   records every tier's own real (radius, height) as it's actually built;
   this walks that list from the innermost (smallest radius, tallest)
   tier outward and returns the first one whose radius still reaches
   (x,z) — i.e. "which terrace is actually under this point." Falls back
   to the old flat cantonEdgeY() for single-deck cantons (Arena, Port,
   the fortress, market/garden decks) that never populate tierRings,
   since those genuinely have only one real height to begin with. */
function cantonHeightAt(name, x, z){
  var t = CANTON_TOPS[name];
  if(!t || !t.tierRings || !t.tierRings.length) return cantonEdgeY(name);
  var c = CIDX[name]; if(!c) return cantonEdgeY(name);
  var d = Math.hypot(x-c.x, z-c.z);
  var rings = t.tierRings;
  for(var i=rings.length-1; i>=0; i--){
    if(d <= rings[i].hw) return rings[i].y;
  }
  return rings[0].y;   /* past even the base tier's own radius (right at the outer edge) */
}
/* height of a causeway deck at (x,z) — same endpoint/height math
   50-cantons.js actually draws the causeway with (CWAY for a bridge
   deck, ramping down to RLAND for reclaimed-land moles), so a walker
   crossing one lands on the deck it drew instead of the water/seafloor
   terrainH reports underneath it. Returns null off every causeway. */
function lifeCausewayY(x, z){
  for(var i=0; i<CAUSEWAYS.length; i++){
    var cw = CAUSEWAYS[i], c = cw.c; if(!c) continue;
    var top = CANTON_TOPS[c.n] ? CANTON_TOPS[c.n].y : null; if(top == null) continue;
    var land = shoreIn(cw.s, 26);
    var dx = land[0]-c.x, dz = land[1]-c.z, L = Math.hypot(dx,dz);
    if(L < c.r + 40) continue;
    var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
    var ay = cw.solid ? top : CWAY;
    var by = cw.solid ? RLAND : Math.max(CWAY-6, terrainH(land[0],land[1])+2.5);
    var sx = land[0]-ax, sz = land[1]-az, segL2 = sx*sx+sz*sz;
    var t = segL2 > 0 ? ((x-ax)*sx+(z-az)*sz)/segL2 : 0;
    t = Math.max(0, Math.min(1, t));
    var px = ax+sx*t, pz = az+sz*t;
    if(Math.hypot(x-px, z-pz) < (c.port ? 66 : 58)) return ay + (by-ay)*t;
  }
  return null;
}
/* height of a BRIDGE deck at (x,z) — the third kind of structure terrainH
   knows nothing about, and the one that had no lifeCausewayY twin until the
   road graph learned about bridges at all (30-layout.js section 5g: the two
   river bridges and the canton-to-canton spans are now real edges, so carts
   and patrols actually route ACROSS them instead of failing to find any road
   route and rambling cross-country). Without this a cart crossing the river
   on a bridge would be drawn at the seafloor's own terrainH — i.e. wading
   through the river directly under the deck it is supposed to be on, which
   is the same "going for swims" the owner reported, just relocated.
   Both formulas are transcribed from the code that draws them, not guessed:
   canton spans ride at DECK with span()'s own arch = min(20, L*0.055)
   (50-cantons.js's SPANS loop), river bridges at
   max(terrainH(a)+2.2, terrainH(b)+2.2, 11.5) with arch 6 (60-land.js's
   RBRIDGES loop). Returns null off every bridge. */
function lifeBridgeY(x, z){
  var i, A, B, dx, dz, L2, t, px, pz;
  for(i=0; i<SPANS.length; i++){
    A = CANTONS[SPANS[i].a]; B = CANTONS[SPANS[i].b];
    var ux = B.x-A.x, uz = B.z-A.z, UL = Math.hypot(ux,uz) || 1;
    var ax = A.x+ux/UL*A.r*0.94, az = A.z+uz/UL*A.r*0.94;
    var bx = B.x-ux/UL*B.r*0.94, bz = B.z-uz/UL*B.r*0.94;
    dx = bx-ax; dz = bz-az; L2 = dx*dx+dz*dz;
    t = L2 ? ((x-ax)*dx+(z-az)*dz)/L2 : 0; t = Math.max(0, Math.min(1,t));
    px = ax+dx*t; pz = az+dz*t;
    if(Math.hypot(x-px, z-pz) < 11){   /* span widths are rr(12,17); half of the narrowest, plus a little */
      return DECK + Math.min(20, Math.sqrt(L2)*0.055) * Math.sin(Math.PI*t);
    }
  }
  for(i=0; i<RBRIDGES.length; i++){
    var b = RBRIDGES[i];
    dx = b.bx-b.ax; dz = b.bz-b.az; L2 = dx*dx+dz*dz;
    t = L2 ? ((x-b.ax)*dx+(z-b.az)*dz)/L2 : 0; t = Math.max(0, Math.min(1,t));
    px = b.ax+dx*t; pz = b.az+dz*t;
    if(Math.hypot(x-px, z-pz) < b.w*0.5+3){
      var deck = Math.max(terrainH(b.ax,b.az)+2.2, terrainH(b.bx,b.bz)+2.2, 11.5);
      return deck + 6*Math.sin(Math.PI*t);
    }
  }
  return null;
}
/* ground/deck height for a land walker at (x,z): a causeway deck if
   it's crossing one, a canton's own deck if it's standing on one
   (within its physical radius), otherwise plain terrainH. Drop-in
   replacement for every "terrainH(x,z) for a citizen" call — those were
   the source of the clipping into causeways and canton floors, exactly
   the same class of bug as the sea-level one above, just for the other
   two kinds of structure terrainH doesn't know are there. */
function lifeGroundY(x, z){
  var cwY = lifeCausewayY(x, z);
  if(cwY != null) return cwY;
  var brY = lifeBridgeY(x, z);
  if(brY != null) return brY;
  /* (window._deck below exposes both deck queries for diagnostics — a route
     sample that reads terrainH<2 is only a SWIM if neither answers.) */
  for(var i=0; i<CANTONS.length; i++){
    var c = CANTONS[i];
    if(Math.hypot(x-c.x, z-c.z) < c.r){
      var ey = cantonHeightAt(c.n, x, z);
      if(ey != null) return ey;
    }
  }
  /* owner, two bugs in a row at the same spot: "temple clergy hanging out
     in midair" then "pedestrians swimming while queueing" — both at a
     ferry-pier tip well past Temple's own canton radius. A pier deck is
     neither a causeway nor a canton floor nor bare terrain, so nothing
     above ever caught it — anyone standing at a pier tip fell straight
     through to open-water terrainH. Two real pier families, two real
     deck heights (both already fixed-point constants elsewhere in the
     codebase, not guessed here): CPIERS (the original 4-canton piers,
     50-cantons.js's cantonPiers() — pierY=6.2, its own comment explains
     why that specific number and not CWAY) and LIFE_EXTRA_PIERS (every
     OTHER canton's ferry pier, 65-facade.js's lifeBuildFerryPier() — deck
     box centred at SEA+1.0, height 1.1, so its walkable top is SEA+1.55).
     Same segment-distance technique lifeCausewayY above already uses for
     its own deck. */
  for(var pi=0; pi<CPIERS.length; pi++){
    var p = CPIERS[pi];
    if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < (p.w*0.5+3)) return 6.2;
  }
  for(var ei=0; ei<LIFE_EXTRA_PIERS.length; ei++){
    var ep = LIFE_EXTRA_PIERS[ei];
    if(lifeSegDist(x,z,ep.x0,ep.z0,ep.x1,ep.z1) < (ep.w*0.5+3)) return SEA+1.55;
  }
  return terrainH(x, z);
}

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

/* ============================== big ships =================================
   The owner: 6 dedicated quays big enough for a large ship (3 at the Port
   canton, 3 along the mainland harbour), 4 animated ships cycling through
   them — arrive, dwell 15s, depart, sail off-map, wait 1-3x the transit
   time, sail back to a new open quay, repeat. The existing STATIC ships
   portDeckV2 (65-facade.js) already bakes into the scene are untouched —
   this is a wholly separate, moving set, same split as the canoes above.

   Second pass, per the owner: the moving ships should look like the
   existing static tallShip() caravels (65-facade.js) — aftcastle,
   forecastle, bowsprit, two masted sails — not the flat oversized barge
   the first pass drew, and they should sail to/from the real north inlet
   (where the shore polyline's own two traced ends meet the open strait,
   15-shore.js) rather than each quay's own locally-guessed "out to sea"
   direction. That local-direction approach was ALSO the thing that kept
   crossing land no matter how the search was tuned (see the old fix
   history, since replaced) — heading everyone for one real, always-open
   gateway sidesteps the whole problem rather than patching it further.

   The quay decks/bollards themselves ARE genuinely static, unlike the
   ships, so they go through the normal box|wood/cyl|wood BUCKET combos —
   zero new draw calls for those (both combos already live). Only the 4
   moving ships cost new draw calls, 2 total (merged hull+deck+masts, and
   sails, each one InstancedMesh for all 4 ships) — tallied in
   BUDGET.drawCalls (05-palette.js) alongside the canoes' 2. ------------ */
var LIFE_QUAYS = [];
(function(){
  /* three along the mainland harbour shore (HARB_S0..HARB_S1, 30-layout.js) —
     a short pier out to a berth in real water, same box|wood/cyl|wood
     combo the canton piers (cantonPiers(), 50-cantons.js) already use.
     faceX/faceZ is DOCKING orientation only now (which way the hull
     points while tied up) — actual sailing routes all head for the one
     shared north inlet, below, not this direction. */
  for(var i=0;i<3;i++){
    var s = mix(HARB_S0, HARB_S1, (i+0.5)/3);
    var n = shoreNorm(s), p = shoreAt(s);
    var pierLen = 50;
    var berthX = p[0]-n[0]*pierLen, berthZ = p[1]-n[1]*pierLen;
    LIFE_QUAYS.push({ x: berthX, z: berthZ, faceX: -n[0], faceZ: -n[1], region: 'harbor', occupiedBy: null });
    var midX = p[0]-n[0]*pierLen*0.5, midZ = p[1]-n[1]*pierLen*0.5;
    var ryPier = Math.atan2(-n[1], n[0]);
    BOX(midX, SEA+1.2, midZ, 9, 1.4, pierLen*1.05, ryPier, 0x8a7659, 'wood');
    /* the owner: "the harbor and port canton piers aren't registering for
       collision detection, ships slide right through them" — true, this
       loop's own deck never went into any obstacle list the nav-grid (or
       ships' own lifeBuildLeg) checks. LIFE_EXTRA_PIERS (65-facade.js,
       already wired into lifeNavBlocked) is the same list the ferry-stop
       piers use; pushing here too, then building the grid AFTER this
       whole IIFE runs (see lifeNavBuildGrid's own call site below), gets
       these into it for free. */
    LIFE_EXTRA_PIERS.push({ x0: p[0], z0: p[1], x1: berthX, z1: berthZ, w: 9 });
    for(var k=6; k<pierLen; k+=13){
      [-1,1].forEach(function(sg){
        var px = p[0]-n[0]*k + (-n[1])*sg*4.6, pz = p[1]-n[1]*k + (n[0])*sg*4.6;
        var bh = bedAt(px,pz);
        CYL(px, bh, pz, 0.9, SEA+1.6-bh, 0, 0x6b5942, 'wood');
      });
    }
  }
  /* three at the Port canton's own shore-facing side — the one face
     portDeckV2's own random pier loop always skips (it keeps that side
     clear for the customs house), so this is genuinely open space, not a
     fight for room with the existing static piers on the other 3 faces. */
  var port = CIDX['Port'];
  if(port){
    var lp = shoreIn(port.s, 26), sl = Math.hypot(lp[0]-port.x, lp[1]-port.z) || 1;
    var sdx = (lp[0]-port.x)/sl, sdz = (lp[1]-port.z)/sl;
    var qy = 6.5;
    /* real, pre-existing bug the owner caught directly (visible as a
       docked ship sitting inside the Port canton) — this used to place
       the quay at a flat port.r*2.06/2+35 (~177 units from centre) for
       EVERY face, regardless of what's actually sitting at that bearing.
       Port carries its own static quay ring that extends physically
       past the canton's own base-platform edge (confirmed directly for
       the stationary-ship docks above: 32 units past lifeCantonEdge
       still landed ON that quay deck; +85 was what actually cleared it,
       verified by screenshot) — 177 units wasn't even past the bare
       canton edge (~147.7) by enough to clear that ring, let alone dock
       outside it, so a ship assigned this quay rendered clipped into
       the canton. Uses the same lifeCantonEdge()+85 formula already
       proven sufficient here instead of a separate, smaller guess. */
    for(var f=0; f<4; f++){
      var a = f*Math.PI/2, fx = Math.cos(a), fz = Math.sin(a);
      if(fx*sdx + fz*sdz > 0.5) continue;
      var edge = lifeCantonEdge(port, fx, fz);
      var bx = edge[0] + fx*85, bz = edge[1] + fz*85;
      LIFE_QUAYS.push({ x:bx, z:bz, faceX:fx, faceZ:fz, region:'port', occupiedBy: null });
      /* the owner: a galleon "phased into" this dock with "no texture" and
         "spawned in the middle" — the quay POSITION (above) was correct
         (verified: 232.7 units from Port's centre, matching the +85-past-
         edge formula), but unlike the 'harbor' quays above, this loop only
         ever built two bare mooring posts — no deck. A ship "docked" here
         was floating in open water beside two bollards, nothing to
         visually tie it to, which is what read as wrong/ghostly. Give it
         a real plank quay, same construction and datum (SEA+1.2) as the
         harbor piers, running from the canton edge out to the berth. */
      var qlen = 95;
      var qmidX = edge[0] + fx*qlen*0.5, qmidZ = edge[1] + fz*qlen*0.5;
      var ryQuay = Math.atan2(fx, fz);
      BOX(qmidX, SEA+1.2, qmidZ, 12, 1.4, qlen, ryQuay, 0x8a7659, 'wood');
      LIFE_EXTRA_PIERS.push({ x0: edge[0], z0: edge[1], x1: edge[0]+fx*qlen, z1: edge[1]+fz*qlen, w: 12 });
      [-1,1].forEach(function(sg){
        var px = bx + (-fz)*sg*9, pz = bz + (fx)*sg*9;
        CYL(px, qy, pz, 1.2, 3.6, 0, 0x5b4b38, 'wood');
      });
    }
  }
})();

/* the real north inlet — the shore polyline's own two traced ends
   (15-shore.js: "the coast is not a closed loop inside the map — it
   leaves through the strait at the north... s runs from the north-west
   map edge... round the bay, and back up to the north-east"). Their
   midpoint is the one place every ship can head for that is guaranteed
   open water leading off the map, so it doubles as both the waypoint to
   steer for and the disappear/reappear point — no separate "how far out
   is off-map" guess needed. */
var LIFE_NORTH_INLET = (function(){
  var a = shoreAt(0), b = shoreAt(SLEN);
  return [ (a[0]+b[0])/2, (a[1]+b[1])/2 ];
})();

/* ---- ship visuals, 4th attempt — a dark-elven JUNK, not a European
   galleon. The owner, explicitly: a galleon silhouette "doesn't really
   fit dark elves" — deleted that model (and its static tallShip() prop
   twin, 65-facade.js) entirely rather than re-skin it, and built this
   from junk-specific proportions instead: a boxy, flat-bottomed hull
   (junks are NOT keeled/tapered like a Western hull), a high, near-
   vertical squared-off transom stern with a stepped "pagoda" deckhouse
   (the single most junk-specific silhouette feature — nothing in
   tallShip() had an equivalent), and a sharp added bow wedge (the
   owner's own explicit ask, sharper than a real junk's usual blunt/
   spoon bow). 2 masts, each visibly RAKED (tilted fore/aft) — real junk
   masts are, and unlike the old kit-based tallShip() (limited to a
   single per-instance yaw), this geometry is hand-built so a genuine
   rotateZ tilt costs nothing extra. Sails are lavender battened
   lugsails: one flat panel plus a few darker horizontal batten strips,
   both baked as vertex colours into the SAME sail mesh (no extra draw
   call) the same way the crew figures' skin/hair already are. */
/* real bug fixed here, both reported by the owner directly:
   1) "the pointy bow is underwater" — the bow cone's Y-translate (-2.0)
      was a leftover guess, not derived from the hull box it's supposed
      to seamlessly extend from. SHAPES.box() is BASE-anchored (y=0 is
      the bottom, see threejs-pitfalls.md), so a box translated to y0
      with height H is actually CENTRED at y0+H/2, not at y0. The hull's
      own true vertical centre is LIFE_JUNK_HULL_Y + LIFE_JUNK_HULL_H/2
      — computed explicitly below and reused for the bow, instead of a
      second, independently-guessed number that silently drifted from
      the hull as its own numbers changed.
   2) "the ridges don't align on the sails" — same base-vs-centre
      confusion in lifeJunkSail() below, PLUS a sign error (the raked
      mast leans one way, the sail's translate offset used the other).
      The panel ended up floating about half its own height above where
      it should start; the battens (computed from a different, ad hoc
      formula) didn't share that error, so they no longer overlapped the
      panel they were supposed to be lines across. Replaced with one
      alongMast(h) helper both the panel and every batten call, so they
      are geometrically guaranteed to agree.
   Also: LIFE_SHIP_SCALE is new — the owner: "I'd like them to be a
   little bit bigger too" — one multiplier applied to every absolute
   (non length/beam-relative) constant in this section, so the hull,
   masts, sails and crew anchors all grow together instead of just LEN/
   BEAM (which would have made a longer, wider, but not taller ship). */
var LIFE_SHIP_SCALE = 1.18;
var LIFE_SHIP_LEN = 34*LIFE_SHIP_SCALE, LIFE_SHIP_BEAM = 11*LIFE_SHIP_SCALE;
/* the owner hand-marked two separate pools of berths (polygons, see
   LIFE_SHIP_STATIONARY_POLYS/LIFE_SHIP_MOBILE_POLYS below): 4 permanent
   "prop" ships that never move, plus a 5-ship mobile pool that cycles
   through 7 possible berths. Both pools share one hull/crew instance
   range — mobile ships occupy indices 0..4, stationary props 5..8 — so
   LIFE_SHIP_N (mesh capacity) is the total, not just the mobile count. */
var LIFE_SHIP_MOBILE_N = 5;
var LIFE_SHIP_STATIONARY_N = 4;
var LIFE_SHIP_N = LIFE_SHIP_MOBILE_N + LIFE_SHIP_STATIONARY_N;
var LIFE_JUNK_HULL_COL = 0x2c2116;     /* dark wood, the owner's own ask */
var LIFE_JUNK_SAIL_COL = 0xa494c9;     /* lavender */
var LIFE_JUNK_BATTEN_COL = 0x4d4058;   /* darker panel lines across each sail */
/* ---- the Fortress coast guard's ONE bespoke hull ------------------------
   owner: "make a custom [junk] for the coast guard - it's a junk, but
   black, with a sharply pointed bow sprit that sticks out of the water,
   and one green and one gold sail. it is crewed by ordinators", then "to
   avoid confusion, it is a junk, not a dhow" and "can use the junk model
   as a base". So: the junk above, re-coloured and re-rigged — NOT a new
   model, and deliberately NOT in lifeShipKind()'s random junk/galleon
   pool (this is one named vessel, not a fleet type).

   HOW IT COSTS ZERO DRAW CALLS. A black hull with one green and one gold
   sail cannot be an instanceColor tint: instanceColor multiplies the whole
   instance uniformly, and this ship needs THREE different colours moving
   in three different directions from the stock junk's. It also needs
   geometry the stock junk does not have (the bowsprit). Both would
   normally mean a second InstancedMesh — a draw call this session has
   three of left, with another agent spending from the same pool.
   Instead the shared junk geometry carries TWO extra vertex attributes:
     cgColor — the coast guard's colour for that vertex
     cgVis   — 0 both variants, 1 coast-guard only, 2 ordinary-junk only
   and the mesh carries one per-INSTANCE float, aCGuard (0/1). The vertex
   shader picks the colour with a mix() and collapses the wrong variant's
   vertices to the local origin (degenerate = rasterizes nothing). Same
   "one shared mesh serves every instance" principle the mill rig and the
   night-lantern mesh already use, just along the colour axis as well as
   the transform one. Cost: one extra instance on an existing mesh, plus
   ~120 triangles of bowsprit shared by all 10 slots.

   PALETTE: promoted to PAL.cguard — see that entry in 05-palette.js for why
   the green and the gold in particular had to stop being local scalars (both
   were already the same hex typed out in two files: the green is what
   ordinatorFortress() and this dock's own signal flag fly in 65-facade.js,
   the gold is lifeOrdHullParts' helm/shield). The vessel wears its crew's
   colours, so those two must not be free to drift apart. The names below are
   kept as the local handles this section reads. */
var LIFE_CG_HULL_COL     = PAL.cguard.hull;        /* black — a trace of brown so it reads as tarred timber, not a hole in the scene */
var LIFE_CG_TRIM_COL     = PAL.cguard.trim;        /* gold rubbing strake along the sheer */
var LIFE_CG_SAIL_GREEN   = PAL.cguard.sailGreen;   /* the order's banner green */
var LIFE_CG_SAIL_GOLD    = PAL.cguard.sailGold;    /* the ordinators' own gold */
var LIFE_CG_BATTEN_GREEN = PAL.cguard.battenGreen;
var LIFE_CG_BATTEN_GOLD  = PAL.cguard.battenGold;
var LIFE_JUNK_HULL_H = 4.2*LIFE_SHIP_SCALE, LIFE_JUNK_HULL_Y = -2.6*LIFE_SHIP_SCALE;
var LIFE_JUNK_MAST_BASE_Y = 0.4*LIFE_SHIP_SCALE;
var lifeShipHullParts = [
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM, LIFE_JUNK_HULL_H, LIFE_SHIP_LEN*0.80).translate(0, LIFE_JUNK_HULL_Y, -LIFE_SHIP_LEN*0.03), color: LIFE_JUNK_HULL_COL },  /* main hull — boxy, flat-bottomed, not tapered */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.94, 0.8*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.78).translate(0, 0.0, -LIFE_SHIP_LEN*0.03), color: LIFE_JUNK_HULL_COL },  /* deck plank */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.92, 5.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.08).translate(0, 0.2*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.42), color: LIFE_JUNK_HULL_COL },  /* high squared transom stern */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.70, 2.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.20).translate(0, 3.4*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.32), color: LIFE_JUNK_HULL_COL },  /* aft deckhouse, tier 1 */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.48, 1.9*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.13).translate(0, 5.6*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.33), color: LIFE_JUNK_HULL_COL },  /* aft deckhouse, tier 2 — the "pagoda" step */
];
/* sharp bow wedge — same 4-sided-cone trick as the previous hull, kept
   because it worked, made more pronounced (a real junk's bow is blunt;
   the owner explicitly asked for sharp here). Cross-section matched to
   the main hull box at the seam (z = LEN*0.37, hull's own front edge)
   AND at the hull's own true vertical centre (see comment above). */
var LIFE_JUNK_BOW_Y = LIFE_JUNK_HULL_Y + LIFE_JUNK_HULL_H/2;
lifeShipHullParts.push({
  geo: new THREE.ConeGeometry(1, LIFE_SHIP_LEN*0.16, 4).rotateX(Math.PI/2)
        .scale(LIFE_SHIP_BEAM*0.5, LIFE_JUNK_HULL_H/2, 1).translate(0, LIFE_JUNK_BOW_Y, LIFE_SHIP_LEN*0.37 + LIFE_SHIP_LEN*0.08),
  color: LIFE_JUNK_HULL_COL
});
/* masts: both raked (rotateZ — a real per-part tilt, not something the
   old kit-based ship could ever have done). Foremast rakes forward,
   mainmast (the taller of the two, set back toward centre) rakes aft —
   the classic junk-rig look. */
var LIFE_JUNK_FOREMAST_H = 13*LIFE_SHIP_SCALE, LIFE_JUNK_MAINMAST_H = 18*LIFE_SHIP_SCALE;
var LIFE_JUNK_FOREMAST_Z = LIFE_SHIP_LEN*0.20, LIFE_JUNK_MAINMAST_Z = -LIFE_SHIP_LEN*0.06;
var LIFE_JUNK_FOREMAST_RAKE = 0.10, LIFE_JUNK_MAINMAST_RAKE = -0.07;
lifeShipHullParts.push(
  { geo: SHAPES.cyl().scale(0.26*LIFE_SHIP_SCALE, LIFE_JUNK_FOREMAST_H, 0.26*LIFE_SHIP_SCALE).rotateZ(LIFE_JUNK_FOREMAST_RAKE).translate(0, LIFE_JUNK_MAST_BASE_Y, LIFE_JUNK_FOREMAST_Z), color: LIFE_JUNK_HULL_COL },
  { geo: SHAPES.cyl().scale(0.32*LIFE_SHIP_SCALE, LIFE_JUNK_MAINMAST_H, 0.32*LIFE_SHIP_SCALE).rotateZ(LIFE_JUNK_MAINMAST_RAKE).translate(0, LIFE_JUNK_MAST_BASE_Y, LIFE_JUNK_MAINMAST_Z), color: LIFE_JUNK_HULL_COL }
);
/* 3 cargo crates, roughly where tallShip()'s own opt.cargo||3 loop put
   them — generated ONCE (not re-randomised every frame). */
for(var lifeShipCargoI=0; lifeShipCargoI<3; lifeShipCargoI++){
  var lifeShipCx = rr(-2.6,2.6)*LIFE_SHIP_SCALE, lifeShipCz = LIFE_SHIP_LEN*rr(-0.20,0.10);
  lifeShipHullParts.push({
    geo: SHAPES.box().scale(rr(1.6,2.6)*LIFE_SHIP_SCALE, rr(1.3,2.2)*LIFE_SHIP_SCALE, rr(1.6,2.6)*LIFE_SHIP_SCALE).rotateY(rr(-0.3,0.3)).translate(lifeShipCx, LIFE_JUNK_MAST_BASE_Y, lifeShipCz),
    color: pick([0x5a4a38, 0x6a5642, 0x4f4030]),
    cg: 2   /* deck cargo: a trader carries it, a patrol vessel does not */
  });
}
/* ---- the coast guard's own geometry (cg:1 — collapsed away on the other
   nine junks). THE BOWSPRIT is the whole point of the silhouette: the
   owner wants it "sharply pointed" and "sticking out of the water", i.e.
   a spar that leaves the stem ABOVE the waterline and rakes up and
   forward clear of it, not another cutwater below it. Built as the same
   4-sided cone the bow wedge above uses (so its facets line up with the
   wedge's), scaled slender, raked up by LIFE_CG_SPRIT_RAKE and seated at
   the stem head.

   Every number is derived from the hull's own, never guessed — the
   pitfall this file already paid for twice ("the pointy bow is
   underwater"): SHAPES/ConeGeometry are CENTRE-anchored after the
   rotateX, so the spar is positioned by its own midpoint, computed from
   the root and tip it is supposed to run between. */
var LIFE_CG_SPRIT_LEN  = LIFE_SHIP_LEN*0.62;              /* ~24.9 — reads at distance, which is the ask */
var LIFE_CG_SPRIT_RAKE = 0.13;                            /* ~7.4 deg nose-up: the tip lifts clear of the water */
var LIFE_CG_SPRIT_Z0   = LIFE_SHIP_LEN*0.30;              /* root, just aft of the bow wedge's own seam */
var LIFE_CG_SPRIT_Y0   = LIFE_JUNK_MAST_BASE_Y + 1.0*LIFE_SHIP_SCALE;   /* stem head: above the deck, well above SEA */
var LIFE_CG_SPRIT_TIPZ = LIFE_CG_SPRIT_Z0 + LIFE_CG_SPRIT_LEN*Math.cos(LIFE_CG_SPRIT_RAKE);
var LIFE_CG_SPRIT_TIPY = LIFE_CG_SPRIT_Y0 + LIFE_CG_SPRIT_LEN*Math.sin(LIFE_CG_SPRIT_RAKE);
lifeShipHullParts.push(
  { geo: new THREE.ConeGeometry(1, LIFE_CG_SPRIT_LEN, 4).rotateX(Math.PI/2)
          .scale(0.44*LIFE_SHIP_SCALE, 0.44*LIFE_SHIP_SCALE, 1)
          .rotateX(-LIFE_CG_SPRIT_RAKE)
          .translate(0, (LIFE_CG_SPRIT_Y0+LIFE_CG_SPRIT_TIPY)*0.5, (LIFE_CG_SPRIT_Z0+LIFE_CG_SPRIT_TIPZ)*0.5),
    color: LIFE_CG_HULL_COL, color2: LIFE_CG_HULL_COL, cg: 1 },
  /* the knee that carries it off the stem — without this the spar reads as
     floating in front of the bow rather than growing out of it */
  { geo: SHAPES.box().scale(0.9*LIFE_SHIP_SCALE, 2.6*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.10)
          .translate(0, LIFE_JUNK_MAST_BASE_Y - 1.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.33),
    color: LIFE_CG_HULL_COL, color2: LIFE_CG_HULL_COL, cg: 1 },
  /* a gold band at the sprit's own root, and a gold rubbing strake down
     each side of the sheer: the state-vessel markings that keep a wholly
     black hull from reading as a silhouette with no detail in it */
  /* SHAPES.box() is BASE-anchored, so the band is seated by subtracting its
     own half-height from the spar's real centreline height at that z —
     the same base-vs-centre slip that put this ship's bow underwater once
     already. No rotateX on it: rotating a base-anchored box about the
     world origin moves it as well as tilting it, and 7 degrees on a collar
     this small is invisible anyway. */
  { geo: SHAPES.box().scale(1.05*LIFE_SHIP_SCALE, 1.05*LIFE_SHIP_SCALE, 0.9*LIFE_SHIP_SCALE)
          .translate(0, LIFE_CG_SPRIT_Y0 + 1.4*Math.tan(LIFE_CG_SPRIT_RAKE) - 0.525*LIFE_SHIP_SCALE,
                     LIFE_CG_SPRIT_Z0 + 1.4),
    color: LIFE_CG_TRIM_COL, color2: LIFE_CG_TRIM_COL, cg: 1 }
);
[-1,1].forEach(function(sg){
  lifeShipHullParts.push({
    geo: SHAPES.box().scale(0.30*LIFE_SHIP_SCALE, 0.55*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.72)
          .translate(sg*LIFE_SHIP_BEAM*0.50, LIFE_JUNK_MAST_BASE_Y - 0.55*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.03),
    color: LIFE_CG_TRIM_COL, color2: LIFE_CG_TRIM_COL, cg: 1
  });
});
/* everything above that did not name its own coast-guard colour is hull:
   black. One loop instead of a second colour argument on thirteen
   already-written part literals, so the stock junk's own numbers stay
   exactly as they were and this cannot silently drift from them. */
lifeShipHullParts.forEach(function(p){ if(p.color2 === undefined) p.color2 = LIFE_CG_HULL_COL; });
/* battened lugsails — a flat raked panel per mast plus 3 thin darker
   batten strips, baked into the SAME geometry via vertex colour, the
   full-length ribbed look a junk sail is known for that a Western
   yard-hung sail never has. alongMast(h) walks the mast's OWN raked
   axis from its real base (LIFE_JUNK_MAST_BASE_Y, matching the mast
   geometry above exactly) — both the panel and every batten call this
   same function, so panel and battens are geometrically guaranteed to
   agree on where the mast actually is at any given height. */
/* cgSail/cgBatten: the SAME panel, worn in the coast guard's colours on
   the one instance that flies them (see the cg-variant note above). The
   owner asked for "one green and one gold sail" and the junk rig has
   exactly two masts, so it is one colour per mast, no choice to make
   beyond which way round: green on the main (the bigger sail, and the
   order's own banner colour, which the dock beside it already flies) and
   gold on the fore. */
function lifeJunkSail(mastH, mastZ, rake, beam, cgSail, cgBatten){
  var sinR = Math.sin(rake), cosR = Math.cos(rake);
  function alongMast(h){ return [ -h*sinR, LIFE_JUNK_MAST_BASE_Y + h*cosR, mastZ ]; }
  var panelBase = 1.6*LIFE_SHIP_SCALE, panelH = mastH*0.62;
  var parts = [];
  var pb = alongMast(panelBase);
  parts.push({
    geo: SHAPES.box().scale(0.10*LIFE_SHIP_SCALE, panelH, beam*0.90).rotateZ(rake).translate(pb[0], pb[1], pb[2]),
    color: LIFE_JUNK_SAIL_COL, color2: cgSail
  });
  for(var bi=1; bi<=3; bi++){
    var bp = alongMast(panelBase + panelH*(bi/4));
    parts.push({
      geo: SHAPES.box().scale(0.13*LIFE_SHIP_SCALE, 0.18*LIFE_SHIP_SCALE, beam*0.92).rotateZ(rake).translate(bp[0], bp[1], bp[2]),
      color: LIFE_JUNK_BATTEN_COL, color2: cgBatten
    });
  }
  return parts;
}
var lifeShipSailParts = []
  .concat(lifeJunkSail(LIFE_JUNK_FOREMAST_H, LIFE_JUNK_FOREMAST_Z, LIFE_JUNK_FOREMAST_RAKE, LIFE_SHIP_BEAM, LIFE_CG_SAIL_GOLD,  LIFE_CG_BATTEN_GOLD))
  .concat(lifeJunkSail(LIFE_JUNK_MAINMAST_H, LIFE_JUNK_MAINMAST_Z, LIFE_JUNK_MAINMAST_RAKE, LIFE_SHIP_BEAM, LIFE_CG_SAIL_GREEN, LIFE_CG_BATTEN_GREEN));
/* hull+sails merged into ONE InstancedMesh (was 2 separate meshes/draw
   calls) — freed a draw call for the galleon hull below without
   raising the budget. Same vertex-colour trick, just more parts sharing
   it: hull is one flat colour, sails a different one, all baked in. */
var lifeShipAllParts = lifeShipHullParts.concat(lifeShipSailParts);
var lifeShipHullGeo = lifeMergeGeoms(lifeShipAllParts);
/* ---- the coast-guard variant attributes (see LIFE_CG_* above for why
   this is two attributes on a shared mesh rather than a second mesh).
   Walks the SAME parts array lifeMergeGeoms() just walked, counting
   vertices exactly the way it does (geometry.index when present, raw
   attribute order when not — the indexed-vs-flat trap that once drew
   every vehicle in this file as stray wedges), so the two attribute
   buffers are guaranteed to line up with the positions they annotate.

   .convertSRGBToLinear() on every coast-guard colour: emitBuckets()
   (45-kit.js) does it for the static bake, so the dock's own green signal
   flag ten metres away IS converted — a sail meant to match it that
   skipped the conversion would render visibly paler than the flag on the
   same structure. (The stock junk's own colours are left exactly as they
   were, unconverted: matching THEM is not the job, and changing them
   would restyle nine ships nobody asked about.) */
function lifeShipVariantAttrs(geo, parts){
  var n = geo.attributes.position.count;
  var c2 = new Float32Array(n*3), vis = new Float32Array(n), at = 0, tmp = new THREE.Color();
  parts.forEach(function(entry){
    var g = entry.isBufferGeometry ? entry : entry.geo;
    var cnt = g.index ? g.index.count : g.attributes.position.count;
    tmp.set(entry.color2 !== undefined ? entry.color2 : (entry.color !== undefined ? entry.color : 0xffffff));
    tmp.convertSRGBToLinear();
    var v = entry.cg || 0;
    for(var i=0;i<cnt;i++){
      c2[(at+i)*3] = tmp.r; c2[(at+i)*3+1] = tmp.g; c2[(at+i)*3+2] = tmp.b;
      vis[at+i] = v;
    }
    at += cnt;
  });
  geo.setAttribute('cgColor', new THREE.Float32BufferAttribute(c2, 3));
  geo.setAttribute('cgVis',   new THREE.Float32BufferAttribute(vis, 1));
  return at === n;   /* false would mean the two walks disagreed — reported, never guessed at */
}
var LIFE_CG_ATTRS_OK = lifeShipVariantAttrs(lifeShipHullGeo, lifeShipAllParts);
/* the owner: "we can put some waviness back in the sails of the sailing
   ships too" — the static kit's own cloth sway (CLOTH_TIME/
   applyClothSway, 45-kit.js) only ever hooks materials built through the
   static BUCKET/emit pipeline; these hull meshes are hand-built
   InstancedMeshes entirely outside that system, so they never got it.
   Reuses the same clock (CLOTH_TIME, already ticking every frame in
   80-camera.js) and the same onBeforeCompile trick, but gated by the
   merged mesh's own absolute local Y via smoothstep instead of
   applyClothSway's (1-position.y)^2 — there's no single 0..1-normalized
   space here the way one cloth BOX has, since hull and sails share one
   merged, unnormalized geometry. Below yLo (hull/deckhouse) stays rigid;
   above yHi (sail) gets full sway; the two thresholds are picked per
   hull below, tuned to each ship's own geometry (junk vs. galleon have
   very different mast heights). */
function applyShipSailSway(sh, yLo, yHi, amp){
  sh.uniforms.uWindTime = CLOTH_TIME;
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nuniform float uWindTime;');
  /* the owner: "the swaying of the sails seems to happen too fast... it
     was fine the way it was before (similar to the banners)" — this used
     custom amplitudes (0.6/0.25) nearly 4x applyClothSway's own (0.16/
     0.07, 45-kit.js) at the SAME frequencies (1.6/2.7), which reads as
     faster even though the timing is identical — bigger swings at a
     fixed frequency look more energetic/hurried to the eye. Reusing
     applyClothSway's exact amplitudes now, with `amp` only a small (1-2x)
     scale for the bigger sail rather than the ~3-5x it was. */
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  float _swayPhase = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898,78.233))) * 43758.5453) * 6.28318;\n' +
    '  float _swayMask = smoothstep(' + yLo.toFixed(2) + ', ' + yHi.toFixed(2) + ', position.y);\n' +
    '  float _sway = (sin(uWindTime * 1.6 + _swayPhase) * 0.16 + sin(uWindTime * 2.7 + _swayPhase * 1.3) * 0.07) * ' + amp.toFixed(2) + ';\n' +
    '  transformed.x += _sway * _swayMask;\n' +
    '  transformed.z += _sway * _swayMask;\n' +
    '#endif\n');
}
/* the coast-guard variant, in the shader. Two edits, both additive:
     1. after <color_vertex> (never INSIDE it — that chunk's contents differ
        between THREE releases and a string-replace of it is a trap), fade
        vColor to the coast guard's own colour for this instance;
     2. after the sway block, collapse whichever variant's vertices this
        instance is not. transformed *= 0.0 puts every vertex of those
        triangles on the same point, i.e. zero area, i.e. nothing drawn —
        and that point is the hull's own origin, buried inside it, so even
        a driver that rasterized it would show nothing.
   Applied AFTER applyShipSailSway so the collapse is the last word: the
   sway adds to transformed.x/z, and doing these the other way round would
   let it nudge a collapsed vertex back off the point.
   Junk material only — the galleon shares applyShipSailSway but not this,
   and its geometry has no cg attributes at all. */
function applyCGuardVariant(sh){
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nattribute vec3 cgColor;\nattribute float cgVis;\nattribute float aCGuard;');
  sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>',
    '#include <color_vertex>\n' +
    '#ifdef USE_COLOR\n  vColor.xyz = mix(vColor.xyz, cgColor, aCGuard);\n#endif\n');
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '  float _cgKeep = (cgVis < 0.5) ? 1.0 : ((cgVis < 1.5) ? aCGuard : (1.0 - aCGuard));\n' +
    '  transformed *= _cgKeep;\n');
}
var lifeShipHullMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
lifeShipHullMat.onBeforeCompile = function(sh){ applyShipSailSway(sh, 6.0, 10.0, 1.6); applyCGuardVariant(sh); };
lifeShipHullMat.customProgramCacheKey = function(){ return 'shipsway-junk-cg'; };
/* one extra slot on the existing mesh, for the one coast-guard hull. It is
   NOT a LIFE_SHIPS entry: nothing in lifeShipKind()/lifePickDeparture/
   updateShips may ever see it, because it is a named vessel with its own
   berth and its own patrol, not a member of the merchant pool. */
var LIFE_SHIP_CG_IDX = LIFE_SHIP_N;
var LIFE_SHIP_HULL_N = LIFE_SHIP_N + 1;
var lifeShipHullMesh = new THREE.InstancedMesh(lifeShipHullGeo, lifeShipHullMat, LIFE_SHIP_HULL_N);
lifeShipHullMesh.userData.life = true; lifeShipHullMesh.userData.inspectLabel = 'Ship hull';
lifeShipHullMesh.frustumCulled = false;
/* seeded HERE, at construction, not at first use: the shader program is
   compiled with or without an attribute's path at FIRST RENDER, and this
   file has already shipped a population that rendered pure white forever
   because its per-instance input only appeared at frame time. */
(function(){
  var a = new Float32Array(LIFE_SHIP_HULL_N);
  a[LIFE_SHIP_CG_IDX] = 1;
  lifeShipHullGeo.setAttribute('aCGuard', new THREE.InstancedBufferAttribute(a, 1));
})();
scene.add(lifeShipHullMesh);

/* ---- the galleon: the ORIGINAL harbour ship asset (60-land.js's own
   SHIPS.forEach, from the project's very first massing pass) imported
   into the life layer instead of re-designed — the owner: "it might be
   nice to have one or two be there and get the sailing behavior",
   "look at the original harbor dock asset and its dependencies". Every
   number below is transcribed from that block verbatim (segmented
   tapered hull via FR6, sheer curve, stern, bow post, 2-3 masts each
   with 3 yards/sails) — same reuse-the-actual-generator approach as the
   junk's own hull (SHAPES.fr6()/.box()/.cyl(), all base-anchored, so
   the original's absolute y-arguments transcribe directly as translate
   offsets with no re-derivation). Necessarily FIXED to one representative
   len/beam/mast-count (an InstancedMesh needs one shared geometry across
   every instance) rather than SHIPS.forEach's own per-instance rr()/ri()
   — picked at the middle of each original range. The original's 'cloth'
   sail family swayed in the wind (CLOTH_TIME, applyClothSway,
   45-kit.js) — that hook only exists for the static kit's own
   onBeforeCompile path; life-layer materials don't have it wired up, so
   these sails are static, matching the junk's own (also static) sails
   rather than adding a one-off shader hookup for just this mesh. */
var LIFE_GALLEON_LEN = 58, LIFE_GALLEON_BEAM = 14, LIFE_GALLEON_MASTS = 2;
/* the owner: "barges and galleons look distinctly pale grey compared to
   the junks. make them a similar brown hull color" — 0x5c4b38 is a real,
   valid mid-brown on paper, but reads washed-out/grey next to the junk's
   own much darker, more saturated 0x2c2116 (LIFE_JUNK_HULL_COL) under
   this scene's lighting. Matched to it directly rather than guessing at
   another mid-tone that might wash out the same way. */
var LIFE_GALLEON_HULL_COL = 0x2c2116;
var lifeGalleonHullParts = [];
(function(){
  var L = LIFE_GALLEON_LEN, B = LIFE_GALLEON_BEAM, col = LIFE_GALLEON_HULL_COL;
  var nseg = 9;
  for(var i=0;i<nseg;i++){
    var t = (i+0.5)/nseg, lz = L*(t-0.5);
    var taper = Math.sin(Math.PI*Math.pow(t,0.78));
    var bw = B*(0.30 + 0.70*taper);
    var sheer = 1.0 + 0.55*Math.pow(Math.abs(t-0.46)*2, 2.2);
    lifeGalleonHullParts.push(
      { geo: SHAPES.fr6().scale(bw*1.34, 8.6*sheer, L/nseg*1.1).translate(0, -4.4, lz), color: shade(col, (i%2)?0.04:0) },
      { geo: SHAPES.box().scale(bw*0.95, 1.0, L/nseg*1.05).translate(0, -4.4+8.6*sheer, lz), color: shade(col, -0.2) }
    );
  }
  lifeGalleonHullParts.push(
    { geo: SHAPES.box().scale(B*0.80, 6.5, L*0.20).translate(0, 5.2, -L*0.40), color: shade(col, 0.10) },   /* stern */
    { geo: SHAPES.cyl().scale(0.7, 9, 0.7).translate(0, 4.2, L*0.54), color: shade(col, 0.05) }              /* bow post */
  );
  for(var m=0; m<LIFE_GALLEON_MASTS; m++){
    var tm = (m+0.55)/(LIFE_GALLEON_MASTS+0.35);
    var mz = L*(0.36 - tm*0.76);
    var mh = 40 - m*6;
    lifeGalleonHullParts.push({ geo: SHAPES.cyl().scale(0.82, mh, 0.82).translate(0, 4.6, mz), color: 0x5b4b38 });
    /* pick(SAILC) — the legacy ship's own original pale canvas palette
       (0xcfc2a3..0xa89878), transcribed faithfully. Swapped out for a
       saturated custom ochre earlier this session chasing a reported
       "ghostly/colourless" galleon; the owner: "the galleons can have
       their color scheme back" — reverted, that wasn't (or wasn't fully)
       the actual fix for whatever they were seeing. */
    var sailCol = pick(SAILC), prevFrac = 0.05;
    [0.30, 0.55, 0.78].forEach(function(fr, k){
      var yw = B*(2.0-k*0.45);
      lifeGalleonHullParts.push({ geo: SHAPES.box().scale(yw, 0.7, 1.1).translate(0, 4.6+mh*fr, mz), color: 0x5b4b38 });
      var loY = 4.6+mh*prevFrac+0.6, hiY = 4.6+mh*fr-0.5, sailH = hiY-loY;
      /* was chance(0.78) per tier — the owner: "I think the galleon is
         missing a sail as well." Real reason: this geometry is built
         ONCE and shared by every galleon instance (one InstancedMesh,
         one merged template) — a chance() roll here isn't "some galleons
         sometimes go out light," it's "every single galleon in the scene
         is permanently missing the exact same yard," decided once at
         page load and baked in for good. Always render it. */
      if(sailH > 3){
        lifeGalleonHullParts.push({ geo: SHAPES.box().scale(yw*0.84, sailH, 0.35).translate(0, loY, mz), color: sailCol });
      }
      prevFrac = fr;
    });
  }
})();
var lifeGalleonHullGeo = lifeMergeGeoms(lifeGalleonHullParts);
var lifeGalleonHullMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
lifeGalleonHullMat.onBeforeCompile = function(sh){ applyShipSailSway(sh, 10.0, 16.0, 2.0); };
lifeGalleonHullMat.customProgramCacheKey = function(){ return 'shipsway-galleon'; };
var lifeGalleonHullMesh = new THREE.InstancedMesh(lifeGalleonHullGeo, lifeGalleonHullMat, LIFE_SHIP_N);
lifeGalleonHullMesh.userData.life = true; lifeGalleonHullMesh.userData.inspectLabel = 'Galleon hull';
lifeGalleonHullMesh.frustumCulled = false;
scene.add(lifeGalleonHullMesh);

/* ---- 5 drow crew per ship (the owner's own ask, both for these and
   for the old design), walking a small patrol loop on deck. Own
   InstancedMesh, own draw call (BUDGET.drawCalls raised 40->41 in
   05-palette.js, documented there). LIFE_SHIP_N now covers BOTH the
   active cycling ships and the stationary dockside ones (below) — one
   pool, one model, exactly the owner's ask that stationary ships "be
   the SAME MODEL... as the mobile ships". */
var LIFE_SHIP_CREW_PER = 5;
var lifeShipPeopleMesh = new THREE.InstancedMesh(lifePersonGeoWhite,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_SHIP_N*LIFE_SHIP_CREW_PER);
lifeShipPeopleMesh.userData.life = true; lifeShipPeopleMesh.userData.inspectLabel = 'Ship crew';
lifeShipPeopleMesh.frustumCulled = false;
scene.add(lifeShipPeopleMesh);
/* fixed patrol anchors: helm (aft), 2 amidships (working the masts), bow
   lookout, one more amidships — each wanders a small ellipse around its
   own anchor, phase-staggered so a ship's 5 crew don't walk in lockstep.
   A function of the hull's own length, not a fixed array, since the
   junk and galleon are very different lengths (and very different deck
   heights — see LIFE_SHIP_DECK_Y below) but share this same crew rig. */
function lifeShipCrewAnchors(len){
  return [
    [0, -len*0.30], [-2.6, -len*0.14], [2.6, len*0.02],
    [-2.2, len*0.20], [0, len*0.34]
  ];
}
var LIFE_SHIP_CREW_ANCHORS = { junk: lifeShipCrewAnchors(LIFE_SHIP_LEN), galleon: lifeShipCrewAnchors(LIFE_GALLEON_LEN) };
/* on-deck Y per kind — junk's deck sits at LIFE_JUNK_MAST_BASE_Y (~0.47);
   the galleon's own upper-deck BOX segments land around y=4.2 at
   midship (-4.4 + 8.6*sheer, sheer=~1 near the hull's own centre) —
   transcribed from the same numbers the hull segments above use, not a
   separate guess. */
var LIFE_SHIP_DECK_Y = { junk: LIFE_JUNK_MAST_BASE_Y, galleon: 4.2 };

/* ---- berths: the owner hand-marked these directly as polygons (one per
   berth, drawn alongside the real pier that berth sits next to) rather
   than have this file keep guessing at quay math — see the file's own
   history of ghost galleons and clipped hulls above for why that kept
   going wrong. Position is just the polygon's own centroid (guaranteed
   inside for a convex quad); orientation comes from the polygon's own
   LONGEST edge, which the owner drew running parallel to that pier — "long
   axis parallel to nearest pier" falls straight out of that, no separate
   pier lookup needed, and centering inside a polygon the owner already
   drew clear of the pier deck satisfies "not overlapping" the same way. */
function lifeShipPolyDock(poly){
  var cx=0, cz=0;
  poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  cx/=poly.length; cz/=poly.length;
  var bestLen=-1, bestDx=1, bestDz=0;
  for(var i=0;i<poly.length;i++){
    var a=poly[i], b=poly[(i+1)%poly.length];
    var dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz);
    if(len>bestLen){ bestLen=len; bestDx=dx/len; bestDz=dz/len; }
  }
  return { x: cx, z: cz, ry: Math.atan2(bestDx, bestDz) };
}
var LIFE_SHIP_STATIONARY_POLYS = [
  [[1218.3,-1487.1],[1218.9,-1577.1],[1248.7,-1577.0],[1242.4,-1484.5]],
  [[733.5,-513.7],[722.6,-477.2],[617.9,-499.2],[632.7,-535.9]],
  [[1345.8,-1361.9],[1346.7,-1401.1],[1457.8,-1394.5],[1457.2,-1360.7]],
  [[1351.9,-1246.4],[1347.5,-1217.8],[1431.8,-1217.9],[1430.5,-1245.6]]
];
var LIFE_SHIP_MOBILE_POLYS = [
  [[775.7,-1067.9],[854.4,-975.9],[821.9,-954.8],[739.7,-1034.0]],
  [[687.5,-980.5],[662.6,-922.6],[801.7,-865.8],[820.4,-906.6]],
  [[637.8,-804.5],[629.5,-747.8],[767.8,-727.7],[778.8,-777.7]],
  [[588.2,-736.2],[581.6,-685.2],[758.9,-665.6],[763.5,-710.1]],
  [[978.4,-1245.7],[866.3,-1244.0],[870.9,-1200.1],[979.3,-1202.0]],
  [[982.8,-1358.3],[881.1,-1354.9],[881.2,-1382.9],[977.1,-1378.3]],
  [[1109.1,-1597.1],[1107.9,-1482.9],[1063.8,-1485.3],[1064.2,-1598.1]]
];
var LIFE_SHIP_STATIONARY_DOCKS = LIFE_SHIP_STATIONARY_POLYS.map(lifeShipPolyDock);
var LIFE_SHIP_MOBILE_DOCKS = LIFE_SHIP_MOBILE_POLYS.map(function(poly){
  var d = lifeShipPolyDock(poly); d.occupiedBy = null; return d;
});
function lifeShipOpenMobileDock(){
  var open = [];
  LIFE_SHIP_MOBILE_DOCKS.forEach(function(d,i){ if(d.occupiedBy === null) open.push(i); });
  return open.length ? pick(open) : null;
}
/* a real docking/undocking manoeuvre instead of a straight line to/from
   the berth — the owner: "when ships depart, they float out and away
   from the dock until they are clear, then turn toward the inlet and
   make sail" (arrival is the mirror: a straight final "slide into
   position"). The pull-out point is perpendicular to the berth's own
   long axis.

   SIDE was picked purely by "farther from the bay's own centre"
   (LIFE_BAY_CENTER, 65-facade.js) — the owner's own report ("ferries...
   sometimes they do a 180 about face unrealistically instead of backing
   out to sea - this may relate to the lack of collision detection")
   points straight at this: that heuristic knows nothing about the real
   pier the ship is tied up alongside, so it could just as easily send
   the "clear point" straight through that pier's own deck, and whatever
   detour the route-builder then had to take around it is what likely
   read as an unrealistic spin. Now checks the real nav-grid obstacle
   data (lifeNavBlocked — includes cantons, land, AND every real pier,
   see that function) first: if one side is actually clear and the other
   isn't, take the clear one outright; only fall back to the bay-centre
   guess when the grid can't tell the two sides apart. */
function lifeShipClearPoint(dock, dist){
  var perp = dock.ry + Math.PI/2;
  var ox = Math.sin(perp), oz = Math.cos(perp);
  var p1x = dock.x+ox*dist, p1z = dock.z+oz*dist;
  var p2x = dock.x-ox*dist, p2z = dock.z-oz*dist;
  var b1 = lifeNavBlocked(p1x, p1z), b2 = lifeNavBlocked(p2x, p2z);
  if(b1 !== b2) return b1 ? [p2x,p2z] : [p1x,p1z];
  var d1 = Math.hypot(p1x-LIFE_BAY_CENTER.x, p1z-LIFE_BAY_CENTER.z);
  var d2 = Math.hypot(p2x-LIFE_BAY_CENTER.x, p2z-LIFE_BAY_CENTER.z);
  return d1 >= d2 ? [p1x,p1z] : [p2x,p2z];
}
/* the owner: "the harbor and port canton piers aren't registering for
   collision detection, the incoming and departing ships slide right
   through them" — true: the main leg of a ship's journey used
   lifeBuildLeg, which only ever checks CANTONS (lifeCantonBlocked), never
   a single pier. Switched to lifeNavBuildLeg (the real A*-over-a-grid
   router ferries already use, which DOES know about every pier — see
   lifeNavBlocked) for that main leg; it falls back to lifeBuildLeg itself
   if A* can't find a route at all, so this can only ever do as well or
   better, never worse. */
function lifeShipDepartCurve(dock, toX, toZ){
  var clear = lifeShipClearPoint(dock, 42);
  var main = lifeNavBuildLeg(clear[0], clear[1], toX, toZ);
  var pts = main.getPoints(24);
  var wp = [[dock.x,dock.z], clear];
  pts.forEach(function(p){ wp.push([p.x,p.z]); });
  return lifeCurveFromCentripetal(wp);
}
function lifeShipArriveCurve(fromX, fromZ, dock){
  var clear = lifeShipClearPoint(dock, 42);
  var main = lifeNavBuildLeg(fromX, fromZ, clear[0], clear[1]);
  var pts = main.getPoints(24);
  var wp = [];
  pts.forEach(function(p){ wp.push([p.x,p.z]); });
  wp.push(clear); wp.push([dock.x,dock.z]);
  return lifeCurveFromCentripetal(wp);
}
/* NOW build the nav grid (lifeNavBuildGrid, declared way up near
   lifeNavBlocked) — every obstacle source that function reads (LIFE_QUAYS'
   harbor/port pier decks, LIFE_SHIP_STATIONARY_DOCKS just above) exists by
   this point in file order; ships' own first route, built in the
   LIFE_SHIPS IIFE right below, needs the grid actually filled in before
   it runs lifeNavBuildLeg. */
lifeNavBuildGrid();
/* ---- schedule: the owner's own detailed relay spec, replacing the old
   independent-random-timer version ("less randomness... fine while we
   debug other systems"). 5 mobile ships: one sails in on screen at load
   (idx 0), one starts fully off-map (idx 1), three start pre-docked at
   distinct random open berths (idx 2-4, 50/50 junk/galleon each). Every
   ship gets `original:true`/`everDeparted:false` — lifePickDeparture
   below reads these to prefer an original ship that hasn't had its first
   voyage yet, before falling back to "least recent arrival" once all 4
   originals have gone out at least once. Ship 1 (the off-map one) is
   deliberately left with no dock/curve yet — it's spawned in for real by
   the halfway-point trigger in updateShips, the first time any ship
   departs. */
var LIFE_SHIPS = [];
var LIFE_SHIP_T = 0;                    /* the ships' own clock, advanced in updateShips */
var LIFE_SHIP_DEPART_AT = null;         /* sim time the next scheduled departure fires, or null = none pending */
var LIFE_SHIP_PENDING_DEPARTURE = null; /* which ship object that departure is for */
function lifeShipKind(){ return chance(0.5) ? 'junk' : 'galleon'; }
(function(){
  var idxs = LIFE_SHIP_MOBILE_DOCKS.map(function(_,i){ return i; });
  for(var s=idxs.length-1; s>0; s--){ var j = Math.floor(rnd()*(s+1)); var tmp=idxs[s]; idxs[s]=idxs[j]; idxs[j]=tmp; }
  /* ship 0: sailing in from the same verified-visible spawn point as
     before, to whichever open berth the shuffle gave it first. */
  var d0 = LIFE_SHIP_MOBILE_DOCKS[idxs[0]]; d0.occupiedBy = 0;
  var curve0 = lifeShipArriveCurve(227.0, -923.8, d0);
  LIFE_SHIPS.push({
    state: 'arriving', dockIdx: idxs[0], kind: lifeShipKind(), curve: curve0, len: curve0.getLength(),
    speed: rr(14,20), stateT: 0, original: true, everDeparted: false
  });
  LIFE_SHIPS[0].dur = Math.max(20, LIFE_SHIPS[0].len/LIFE_SHIPS[0].speed);
  /* ship 1: off-map, spawned for real once ship 0's first departure is
     halfway to the inlet (updateShips). kind is chosen then, not here. */
  LIFE_SHIPS.push({ state:'away', dockIdx:null, kind:null, speed: rr(14,20), stateT:0, original:true, everDeparted:false });
  /* ships 2-4: pre-docked at 3 more distinct open berths. */
  for(var m=0; m<3; m++){
    var di = idxs[2+m];
    var dock = LIFE_SHIP_MOBILE_DOCKS[di];
    dock.occupiedBy = 2+m;
    LIFE_SHIPS.push({
      state:'docked', dockIdx: di, kind: lifeShipKind(), x: dock.x, z: dock.z, ry: dock.ry,
      speed: rr(14,20), lastArrivalTime: rr(-1,1), stateT:0, original:true, everDeparted:false
    });
  }
  /* stationary props: fixed forever at their own hand-marked berths,
     never enter the mobile cycle — lifePickDeparture excludes
     sh.stationary outright, same as the earlier (now-replaced)
     auto-placed version did. */
  LIFE_SHIP_STATIONARY_DOCKS.forEach(function(dock){
    LIFE_SHIPS.push({ state:'docked', stationary:true, kind: lifeShipKind(), x: dock.x, z: dock.z, ry: dock.ry, stateT:0 });
  });
})();
window._ships = { count: LIFE_SHIPS.length, mobileN: LIFE_SHIP_MOBILE_N, stationaryN: LIFE_SHIP_STATIONARY_N, mobileDocks: LIFE_SHIP_MOBILE_DOCKS.length, inlet: LIFE_NORTH_INLET };
window._lifeShips = LIFE_SHIPS;   /* diagnostic: full state, incl. each ship's .curve */

/* departure selection — the owner's own two-phase rule: "any one of the
   original ships that haven't left yet" while any remain (random among
   them), THEN "the least recent arriving ship" forever after once all 4
   originals have had their first voyage. Stationary ships are excluded
   outright — nothing may ever pick them to depart. */
function lifePickDeparture(){
  var freshOriginals = LIFE_SHIPS.filter(function(sh){
    return sh.state === 'docked' && !sh.stationary && sh.original && !sh.everDeparted;
  });
  if(freshOriginals.length) return pick(freshOriginals);
  var best = null;
  LIFE_SHIPS.forEach(function(sh){
    if(sh.state !== 'docked' || sh.stationary) return;
    if(!best || sh.lastArrivalTime < best.lastArrivalTime) best = sh;
  });
  return best;
}
var LIFE_SHIP_UP = new THREE.Vector3(0,1,0);
var lifeShipTmpPos = new THREE.Vector3(), lifeShipTmpDir = new THREE.Vector3(), lifeShipTmpPos2 = new THREE.Vector3();
var lifeShipTmpQuat = new THREE.Quaternion(), lifeShipTmpMat = new THREE.Matrix4();
var lifeShipTmpScale1 = new THREE.Vector3(1,1,1), lifeShipTmpScale0 = new THREE.Vector3(0,0,0);
var lifeShipCrewTmpPos = new THREE.Vector3(), lifeShipCrewTmpMat = new THREE.Matrix4();
/* place/hide this ship's 5 crew: each wanders a small ellipse around its
   own fixed deck anchor (LIFE_SHIP_CREW_ANCHORS), phase-staggered by
   ship+slot index so nobody walks in lockstep, hidden entirely while the
   ship is 'away' (off the map — there is nothing to stand on). */
function lifeShipPlaceCrew(idx, visible, shipPos, shipQuat, kind){
  var baseIdx = idx*LIFE_SHIP_CREW_PER;
  var anchors = LIFE_SHIP_CREW_ANCHORS[kind];
  var deckY = LIFE_SHIP_DECK_Y[kind];
  for(var s=0; s<LIFE_SHIP_CREW_PER; s++){
    if(visible){
      var anchor = anchors[s];
      var ang = LIFE_SHIP_T*0.5 + idx*2.1 + s*1.7;
      var lx = anchor[0] + Math.sin(ang)*1.1;
      var lz = anchor[1] + Math.cos(ang*0.6)*0.7;
      lifeShipCrewTmpPos.set(lx, deckY, lz).applyQuaternion(shipQuat).add(shipPos);
      lifeShipCrewTmpMat.compose(lifeShipCrewTmpPos, shipQuat, lifeShipTmpScale1);
    }else{
      lifeShipCrewTmpMat.compose(lifeShipCrewTmpPos.set(0,0,0), shipQuat, lifeShipTmpScale0);
    }
    lifeShipPeopleMesh.setMatrixAt(baseIdx+s, lifeShipCrewTmpMat);
  }
}
/* two hull meshes now (junk, galleon) sharing one LIFE_SHIPS pool —
   every ship index must get a matrix written to BOTH meshes every
   frame: the one matching sh.kind gets the real transform, the other
   gets scaled to 0. An index never written defaults to that
   InstancedMesh's identity matrix (visible at the origin), not hidden —
   so the "other" mesh needs an explicit hide, not just a skip. */
function lifeShipHullMeshFor(kind){ return kind === 'galleon' ? lifeGalleonHullMesh : lifeShipHullMesh; }
function lifeShipHideBoth(idx){
  lifeShipTmpMat.compose(lifeShipTmpPos.set(0,0,0), lifeShipTmpQuat.identity(), lifeShipTmpScale0);
  lifeShipHullMesh.setMatrixAt(idx, lifeShipTmpMat);
  lifeGalleonHullMesh.setMatrixAt(idx, lifeShipTmpMat);
}
/* ships occupy the tail of the shared local-avoidance arrays (declared
   in the ferry section below, after LIFE_SHIP_N is known — same
   file-order reason canoes/ferries' own arrays live there). Priority 3,
   the highest of the three: the owner: "they have right of way over
   small ships - small ships should go out of their way to avoid them
   and less so vice versa" — see lifeAvoidNudge's own give-way weighting. */
function updateShips(dt){
  LIFE_SHIP_T += dt;
  LIFE_SHIPS.forEach(function(sh, idx){
    sh.stateT += dt;
    var avoidSlot = LIFE_AVOID_SHIP0 + idx;
    if(sh.state === 'docked'){
      lifeShipTmpPos.set(sh.x, SEA-0.3, sh.z);
      lifeShipTmpQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.ry);
      LIFE_AVOID_X[avoidSlot] = sh.x; LIFE_AVOID_Z[avoidSlot] = sh.z; LIFE_AVOID_R[avoidSlot] = LIFE_SHIP_AVOID_R;
    }else if(sh.state === 'away'){
      LIFE_AVOID_R[avoidSlot] = 0;   /* off the map — not an obstacle for anyone */
      lifeShipHideBoth(idx);
      lifeShipPlaceCrew(idx, false, lifeShipTmpPos, lifeShipTmpQuat, sh.kind);
      return;
    }else{
      /* 'departing' or 'arriving': move along sh.curve (built by
         lifeShipDepartCurve/lifeShipArriveCurve above — float straight
         out/in near the berth, routed the rest of the way). Anticipatory
         avoidance + turn-rate-limited heading, same fix as the ferries'
         own (see that comment) but slower to turn — a big hull doesn't
         snap onto a new heading — and sensed farther ahead, since it
         needs more warning to react at all. */
      var raw = Math.min(1, sh.stateT / sh.dur);
      var t = raw*raw*(3-2*raw);
      sh.curve.getPointAt(t, lifeShipTmpPos);
      var tTan = Math.min(0.995, Math.max(0.005, t));
      sh.curve.getTangentAt(tTan, lifeShipTmpDir);
      var tanYaw = Math.atan2(lifeShipTmpDir.x, lifeShipTmpDir.z);

      var sdelta = lifeAvoidNudge2(avoidSlot, lifeShipTmpPos.x, lifeShipTmpPos.z, lifeShipTmpDir.x, lifeShipTmpDir.z, LIFE_SHIP_AVOID_R, 12.0, LIFE_SHIP_LOOKAHEAD, 4.5, 3);
      lifeShipTmpPos.x += sdelta[0]; lifeShipTmpPos.z += sdelta[1];

      if(sh.facingYaw === undefined) sh.facingYaw = tanYaw;
      if(sh.lastX === undefined){ sh.lastX = lifeShipTmpPos.x; sh.lastZ = lifeShipTmpPos.z; }
      var mdx = lifeShipTmpPos.x-sh.lastX, mdz = lifeShipTmpPos.z-sh.lastZ;
      var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
      var dAng = moveYaw - sh.facingYaw;
      while(dAng > Math.PI) dAng -= Math.PI*2;
      while(dAng < -Math.PI) dAng += Math.PI*2;
      var maxStep = LIFE_SHIP_TURN_RATE*dt;
      sh.facingYaw += Math.max(-maxStep, Math.min(maxStep, dAng));
      lifeShipTmpQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.facingYaw);
      sh.lastX = lifeShipTmpPos.x; sh.lastZ = lifeShipTmpPos.z;

      LIFE_AVOID_X[avoidSlot] = lifeShipTmpPos.x; LIFE_AVOID_Z[avoidSlot] = lifeShipTmpPos.z; LIFE_AVOID_R[avoidSlot] = LIFE_SHIP_AVOID_R;

      /* the owner's relay: "when [the departing ship] reaches the
         halfway point to the inlet, the off map ship spawns at the
         inlet" — there is always exactly one ship in 'away' at a time
         by construction (one leaves 'away' here exactly when one enters
         it below, on departure-complete), so no queue is needed, just
         find it. */
      if(sh.state === 'departing' && !sh.halfwayTriggered && raw >= 0.5){
        sh.halfwayTriggered = true;
        var awayShip = null;
        LIFE_SHIPS.forEach(function(s){ if(s.state === 'away') awayShip = s; });
        if(awayShip){
          var di2 = lifeShipOpenMobileDock();
          if(di2 !== null){
            var dock2 = LIFE_SHIP_MOBILE_DOCKS[di2];
            dock2.occupiedBy = LIFE_SHIPS.indexOf(awayShip);
            awayShip.kind = lifeShipKind();
            awayShip.dockIdx = di2;
            awayShip.curve = lifeShipArriveCurve(LIFE_NORTH_INLET[0], LIFE_NORTH_INLET[1], dock2);
            awayShip.len = awayShip.curve.getLength();
            awayShip.dur = Math.max(20, awayShip.len/awayShip.speed);
            awayShip.state = 'arriving'; awayShip.stateT = 0;
          }
        }
      }

      if(raw >= 1){
        if(sh.state === 'arriving'){
          var dock3 = LIFE_SHIP_MOBILE_DOCKS[sh.dockIdx];
          sh.state = 'docked'; sh.x = dock3.x; sh.z = dock3.z; sh.ry = dock3.ry;
          sh.lastArrivalTime = LIFE_SHIP_T; sh.stateT = 0;
          /* "another ship departs 15 seconds later" — every arrival, not
             just the first, re-arms the loading timer. */
          var depPick = lifePickDeparture();
          if(depPick){ LIFE_SHIP_PENDING_DEPARTURE = depPick; LIFE_SHIP_DEPART_AT = LIFE_SHIP_T + 15; }
        }else{
          if(sh.dockIdx !== null) LIFE_SHIP_MOBILE_DOCKS[sh.dockIdx].occupiedBy = null;
          sh.dockIdx = null;
          sh.state = 'away'; sh.stateT = 0;
        }
      }
    }
    lifeShipTmpMat.compose(lifeShipTmpPos, lifeShipTmpQuat, lifeShipTmpScale1);
    lifeShipHullMeshFor(sh.kind).setMatrixAt(idx, lifeShipTmpMat);
    lifeShipPlaceCrew(idx, true, lifeShipTmpPos, lifeShipTmpQuat, sh.kind);
    lifeShipTmpMat.compose(lifeShipTmpPos2.set(0,0,0), lifeShipTmpQuat, lifeShipTmpScale0);
    lifeShipHullMeshFor(sh.kind === 'galleon' ? 'junk' : 'galleon').setMatrixAt(idx, lifeShipTmpMat);
  });
  if(LIFE_SHIP_DEPART_AT !== null && LIFE_SHIP_T >= LIFE_SHIP_DEPART_AT && LIFE_SHIP_PENDING_DEPARTURE){
    var dep = LIFE_SHIP_PENDING_DEPARTURE;
    if(dep.state === 'docked'){
      var dock = LIFE_SHIP_MOBILE_DOCKS[dep.dockIdx];
      dep.curve = lifeShipDepartCurve(dock, LIFE_NORTH_INLET[0], LIFE_NORTH_INLET[1]);
      dep.len = dep.curve.getLength();
      dep.dur = Math.max(20, dep.len/dep.speed);
      dep.everDeparted = true;
      dep.halfwayTriggered = false;
      dep.state = 'departing'; dep.stateT = 0;
    }
    LIFE_SHIP_DEPART_AT = null; LIFE_SHIP_PENDING_DEPARTURE = null;
  }
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
  lifeGalleonHullMesh.instanceMatrix.needsUpdate = true;
  lifeShipPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== the Fortress coast guard ==================
   One vessel, the black junk built as a variant of the shared junk
   geometry above (see LIFE_CG_* there for the colours and the bowsprit).
   This block is only its BEHAVIOUR: where it lies and where it goes.

   WHERE IT LIES. LIFE_CGUARD_BERTHS (65-facade.js) — the mooring records
   the Fortress canton's new north dock published for exactly this hull,
   the same builder-fills/consumer-reads hand-off LIFE_RBARGE_DOCKS uses.
   The berth is chosen by MEASURING the hull against each record's own
   len, not by assuming the first one fits:
     hull, transom to bow wedge tip   LIFE_SHIP_LEN*0.99  = 39.7
     north berth  len 44  ->  fits
     west  berth  len 36  ->  does not
   so it takes the north berth, lying along the berthing head's outboard
   face. Its BEAM is the one number that does not have slack: the hull is
   LIFE_SHIP_BEAM = 12.98 wide against a berth sized for 11, but the berth
   centreline is 6.5 from the head's fender strake and the hull's own
   half-beam is 6.49 — it lies against the fender with 0.01 to spare,
   which is what alongside means. The BOWSPRIT deliberately overhangs the
   berth (tip 36.7 forward of the hull's centre vs. the berthing head's
   own 23-unit half-length): it projects past the head's east end into
   open water at 3.5-4.9 above the waterline, clear of the deck, the
   bollards and the signal mast, which is exactly what a bowsprit does and
   is the silhouette the owner asked to be able to read at a distance.

   WHETHER IT PATROLS. It patrols, and the existing machinery makes that
   nearly free: lifeShipDepartCurve/lifeShipArriveCurve already do a real
   pull-out-then-turn undocking manoeuvre, and lifeNavBuildLeg is the same
   A*-over-the-obstacle-grid router the ferries use — it already knows
   every canton, pier, chinampa bed and bridge pylon in the bay
   (lifeNavBlocked), so the circuit cannot be routed through any of them.
   What it deliberately does NOT reuse is LIFE_SHIPS' own relay schedule:
   that pool cycles ships off-map through the north inlet at z=-5128, and
   a coast guard that spends most of its cycle 4,000 units off the top of
   the map is not guarding a coast. This vessel never leaves: it works a
   closed beat across the northern approach to the Fortress and comes
   home to the same berth.

   WHERE THE BEAT IS. An ellipse in the open water north of the dock
   (measured first, not chosen: the nav grid is clear from the dock head
   out past 520 units on every bearing except the 45-135 deg arc, which is
   the Fortress canton itself). Every sampled point is then re-checked
   against lifeNavBlocked/inRiver/depth and pushed radially away from the
   canton until it is clear, and any point that will not clear is dropped;
   under 5 survivors and the vessel simply stays moored rather than
   sailing a route nobody verified — the fallback rule this file learned
   the hard way when an obstacle-unaware straight line walked twenty
   ordinators across the bay. */
var LIFE_CG_CREW_N  = 5;      /* ordinators; folded into LIFE_ORD_N further down, so they cost no new mesh and get the reserved lantern slots for free */
var LIFE_CG_DWELL   = 90;     /* seconds alongside between patrols */
var LIFE_CG_SPEED   = 12;     /* cruise: under a merchantman's 14-20, a patrol keeps station rather than races */
var LIFE_CG_PATROL_A = 420, LIFE_CG_PATROL_B = 210;   /* the beat's semi-axes: long across the approach, shallow in depth */
var LIFE_CG_PATROL_OFF = 280;                          /* how far north of the berth its centre sits */
var LIFE_CG_PATROL_PTS = 12;
/* the hull's real extent, read off the geometry constants above rather
   than measured by eye — transom rear face to bow-wedge tip, then the
   same again including the bowsprit */
var LIFE_CG_HULL_AFT = -LIFE_SHIP_LEN*0.46;
var LIFE_CG_HULL_FWD =  LIFE_SHIP_LEN*0.53;
var LIFE_CG_HULL_LEN =  LIFE_CG_HULL_FWD - LIFE_CG_HULL_AFT;
var LIFE_CG_SPAN_LEN =  LIFE_CG_SPRIT_TIPZ - LIFE_CG_HULL_AFT;
var LIFE_CG_BERTH  = null;
var LIFE_CG_PATROL = null;
var LIFE_CG_SHIP   = null;
var LIFE_CG_T = 0;
var LIFE_CG_CREW_ANCHORS = [
  [0,   -LIFE_SHIP_LEN*0.16],   /* at the helm, forward of the deckhouse so nobody stands inside it */
  [-3.0,-LIFE_SHIP_LEN*0.04], [3.0, LIFE_SHIP_LEN*0.08],
  [-2.4, LIFE_SHIP_LEN*0.20],
  [0,    LIFE_SHIP_LEN*0.32]    /* bow lookout, at the root of the bowsprit */
];
var LIFE_CG_DIAG = { built:false, why:null };
(function(){
  if(typeof LIFE_CGUARD_BERTHS === 'undefined' || !LIFE_CGUARD_BERTHS.length){ LIFE_CG_DIAG.why = 'no coast-guard berths published'; return; }
  /* longest berth that actually fits the hull; if none does, the longest
     there is, and the diagnostic says so rather than quietly clipping */
  var cand = LIFE_CGUARD_BERTHS.slice().sort(function(a,b){ return b.len - a.len; });
  LIFE_CG_BERTH = cand.filter(function(b){ return b.len >= LIFE_CG_HULL_LEN; })[0] || cand[0];
  LIFE_CG_DIAG.berthFits = LIFE_CG_BERTH.len >= LIFE_CG_HULL_LEN;

  /* ---- the beat, validated point by point */
  var fc = CIDX['Fortress'];
  var cx = LIFE_CG_BERTH.x, cz = LIFE_CG_BERTH.z - LIFE_CG_PATROL_OFF;
  var pts = [], rejected = 0;
  for(var i=0;i<LIFE_CG_PATROL_PTS;i++){
    var th = i*Math.PI*2/LIFE_CG_PATROL_PTS;
    var px = cx + Math.cos(th)*LIFE_CG_PATROL_A, pz = cz + Math.sin(th)*LIFE_CG_PATROL_B;
    var ok = false;
    for(var k=0;k<6;k++){
      /* the hull is 40 long: test the rectangle it sweeps, not its centre
         — the centre-point-vs-extent mistake this project has paid for in
         three separate passes */
      var clear = !lifeNavBlocked(px,pz) && !inRiver(px,pz,80) && terrainH(px,pz) < SEA-4;
      for(var r=0; clear && r<4; r++){
        var ra = r*Math.PI/2;
        if(lifeNavBlocked(px+Math.cos(ra)*22, pz+Math.sin(ra)*22)) clear = false;
      }
      if(clear){ ok = true; break; }
      /* push away from the Fortress canton, never toward it — "outward
         along the ellipse" would steer the south of the beat straight
         into the thing the beat is guarding */
      var ax = px - (fc ? fc.x : cx), az = pz - (fc ? fc.z : cz), al = Math.hypot(ax,az)||1;
      px += ax/al*34; pz += az/al*34;
    }
    if(ok) pts.push([px,pz]); else rejected++;
  }
  LIFE_CG_DIAG.patrolPts = pts.length; LIFE_CG_DIAG.patrolRejected = rejected;
  if(pts.length >= 5){
    var wp = [];
    for(var a2=0; a2<pts.length; a2++){
      var A2 = pts[a2], B2 = pts[(a2+1)%pts.length];
      var leg = lifeNavBuildLeg(A2[0],A2[1],B2[0],B2[1]);
      var lp = leg.getPoints(8);
      for(var j=0;j<lp.length-1;j++){
        var last = wp[wp.length-1];
        if(last && Math.hypot(lp[j].x-last.x, lp[j].z-last.z) < 1.0) continue;   /* centripetal Catmull-Rom goes NaN on coincident control points */
        wp.push(new THREE.Vector3(lp[j].x, LIFE_Y, lp[j].z));
      }
    }
    if(wp.length >= 8) LIFE_CG_PATROL = new THREE.CatmullRomCurve3(wp, true, 'centripetal');
  }
  if(!LIFE_CG_PATROL) LIFE_CG_DIAG.why = 'patrol circuit could not be verified clear — vessel stays moored';

  LIFE_CG_SHIP = {
    name:'Coast-guard junk', state:'moored', stateT:0,
    homeX: LIFE_CG_BERTH.x, homeZ: LIFE_CG_BERTH.z, homeRy: LIFE_CG_BERTH.ry,
    px: LIFE_CG_BERTH.x, py: SEA-0.3, pz: LIFE_CG_BERTH.z, yaw: LIFE_CG_BERTH.ry,
    /* .x/.z/.y and .curve are what the path devtool reads (pathvizEntityPos/
       pathvizBuild, 87-pathviz.js): the live position for the glow, and the
       PATROL circuit — its designated path — for the line, not whichever
       leg it happens to be on this second. */
    x: LIFE_CG_BERTH.x, z: LIFE_CG_BERTH.z, y: SEA,
    curve: LIFE_CG_PATROL, leg: null, legLen: 0, legDur: 1, facingYaw: LIFE_CG_BERTH.ry
  };
  LIFE_CG_DIAG.built = true;
})();
/* park the hull slot NOW, before the first frame: an InstancedMesh slot
   nobody has written renders at the identity matrix (i.e. a full-size ship
   at the world origin), not hidden. */
(function(){
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  if(LIFE_CG_SHIP){
    q.setFromAxisAngle(LIFE_SHIP_UP, LIFE_CG_SHIP.homeRy);
    m.compose(p.set(LIFE_CG_SHIP.homeX, SEA-0.3, LIFE_CG_SHIP.homeZ), q, new THREE.Vector3(1,1,1));
  }else{
    m.compose(p.set(0,0,0), q, new THREE.Vector3(0,0,0));
  }
  lifeShipHullMesh.setMatrixAt(LIFE_SHIP_CG_IDX, m);
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
})();
window._cguardShip = { diag: LIFE_CG_DIAG, berth: LIFE_CG_BERTH,
  hullLen: +LIFE_CG_HULL_LEN.toFixed(2), hullBeam: +LIFE_SHIP_BEAM.toFixed(2),
  spanWithSprit: +LIFE_CG_SPAN_LEN.toFixed(2),
  spritTipY: +LIFE_CG_SPRIT_TIPY.toFixed(2), spritTipZ: +LIFE_CG_SPRIT_TIPZ.toFixed(2),
  attrsOK: LIFE_CG_ATTRS_OK,
  patrolLen: function(){ return LIFE_CG_PATROL ? Math.round(LIFE_CG_PATROL.getLength()) : 0; },
  ship: function(){ return LIFE_CG_SHIP && { state:LIFE_CG_SHIP.state, x:Math.round(LIFE_CG_SHIP.px), z:Math.round(LIFE_CG_SHIP.pz), t:+LIFE_CG_SHIP.stateT.toFixed(1) }; } };

function lifeCGBegin(state){
  var sh = LIFE_CG_SHIP; if(!sh) return;
  if(state !== 'moored' && !LIFE_CG_PATROL){ sh.state = 'moored'; sh.stateT = 0; return; }
  if(state === 'outbound'){
    var p0 = LIFE_CG_PATROL.getPointAt(0);
    sh.leg = lifeShipDepartCurve({x:sh.homeX, z:sh.homeZ, ry:sh.homeRy}, p0.x, p0.z);
  }else if(state === 'patrol'){
    sh.leg = LIFE_CG_PATROL;
  }else if(state === 'inbound'){
    var p1 = LIFE_CG_PATROL.getPointAt(0);
    sh.leg = lifeShipArriveCurve(p1.x, p1.z, {x:sh.homeX, z:sh.homeZ, ry:sh.homeRy});
  }
  sh.legLen = (state === 'moored') ? 0 : sh.leg.getLength();
  sh.legDur = Math.max(8, sh.legLen/LIFE_CG_SPEED);
  sh.state = state; sh.stateT = 0; sh.lastX = undefined;
}
var lifeCGPos = new THREE.Vector3(), lifeCGDir = new THREE.Vector3();
var lifeCGQuat = new THREE.Quaternion(), lifeCGMat = new THREE.Matrix4();
var lifeCGScale1 = new THREE.Vector3(1,1,1);
function updateCGuard(dt){
  var sh = LIFE_CG_SHIP; if(!sh) return;
  LIFE_CG_T += dt; sh.stateT += dt;
  var slot = LIFE_AVOID_SHIP0 + LIFE_SHIP_CG_IDX;
  if(sh.state === 'moored'){
    lifeCGPos.set(sh.homeX, SEA-0.3, sh.homeZ);
    sh.facingYaw = sh.homeRy;
    lifeCGQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.homeRy);
    LIFE_AVOID_X[slot] = sh.homeX; LIFE_AVOID_Z[slot] = sh.homeZ; LIFE_AVOID_R[slot] = LIFE_SHIP_AVOID_R;
    if(sh.stateT >= LIFE_CG_DWELL) lifeCGBegin('outbound');
  }else{
    var raw = Math.min(1, sh.stateT / sh.legDur);
    /* the lap runs at constant speed (a beat is walked, not eased); the
       two berth legs keep updateShips' own ease-in/ease-out so the hull
       slides off and onto the fender instead of snapping */
    var t = (sh.state === 'patrol') ? raw : raw*raw*(3-2*raw);
    sh.leg.getPointAt(Math.min(0.999999, t), lifeCGPos);
    lifeCGPos.y = SEA-0.3;
    sh.leg.getTangentAt(Math.min(0.995, Math.max(0.005, t)), lifeCGDir);
    var tanYaw = Math.atan2(lifeCGDir.x, lifeCGDir.z);
    var d2 = lifeAvoidNudge2(slot, lifeCGPos.x, lifeCGPos.z, lifeCGDir.x, lifeCGDir.z, LIFE_SHIP_AVOID_R, 12.0, LIFE_SHIP_LOOKAHEAD, 4.5, 3);
    lifeCGPos.x += d2[0]; lifeCGPos.z += d2[1];
    if(sh.facingYaw === undefined) sh.facingYaw = tanYaw;
    if(sh.lastX === undefined){ sh.lastX = lifeCGPos.x; sh.lastZ = lifeCGPos.z; }
    var mdx = lifeCGPos.x-sh.lastX, mdz = lifeCGPos.z-sh.lastZ;
    var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
    var dA = moveYaw - sh.facingYaw;
    while(dA >  Math.PI) dA -= Math.PI*2;
    while(dA < -Math.PI) dA += Math.PI*2;
    var step = LIFE_SHIP_TURN_RATE*dt;
    sh.facingYaw += Math.max(-step, Math.min(step, dA));
    sh.lastX = lifeCGPos.x; sh.lastZ = lifeCGPos.z;
    lifeCGQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.facingYaw);
    LIFE_AVOID_X[slot] = lifeCGPos.x; LIFE_AVOID_Z[slot] = lifeCGPos.z; LIFE_AVOID_R[slot] = LIFE_SHIP_AVOID_R;
    if(raw >= 1){
      if(sh.state === 'outbound')      lifeCGBegin('patrol');
      else if(sh.state === 'patrol')   lifeCGBegin('inbound');
      else { sh.state = 'moored'; sh.stateT = 0; }
    }
  }
  sh.px = lifeCGPos.x; sh.py = lifeCGPos.y; sh.pz = lifeCGPos.z; sh.yaw = sh.facingYaw;
  sh.x = lifeCGPos.x; sh.z = lifeCGPos.z; sh.y = SEA;
  lifeCGMat.compose(lifeCGPos, lifeCGQuat, lifeCGScale1);
  lifeShipHullMesh.setMatrixAt(LIFE_SHIP_CG_IDX, lifeCGMat);
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
}
/* the crew: ordinators, not the generic white-haired sailor the merchant
   junks carry. They are lifeOrdMesh instances (LIFE_CG_CREW_N of them,
   added to LIFE_ORD_N below), which is why they cost no draw call and
   pick up the reserved night-lantern slots automatically — exactly how
   the Fortress boundary patrol and the drill squads already work.
   Driven from updateOrdinators(), which runs AFTER updateShips()/
   updateCGuard() in updateLife's fixed order, so sh.px/pz/yaw are this
   frame's, never last frame's. */
var lifeCGCrewPos = new THREE.Vector3(), lifeCGCrewQuat = new THREE.Quaternion();
var lifeCGCrewQuat2 = new THREE.Quaternion(), lifeCGCrewMat = new THREE.Matrix4();
function updateCGuardCrew(base){
  var sh = LIFE_CG_SHIP;
  for(var s=0; s<LIFE_CG_CREW_N; s++){
    if(sh){
      var a = LIFE_CG_CREW_ANCHORS[s];
      var ang = LIFE_CG_T*0.45 + s*1.9;
      lifeCGCrewQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.yaw);
      lifeCGCrewPos.set(a[0] + Math.sin(ang)*0.9,
                        LIFE_SHIP_DECK_Y.junk + 0.14,   /* the ordinator torso is 0.28 taller than a sailor's; half of that puts their feet on the same plank */
                        a[1] + Math.cos(ang*0.6)*0.6)
        .applyQuaternion(lifeCGCrewQuat);
      lifeCGCrewPos.x += sh.px; lifeCGCrewPos.y += sh.py; lifeCGCrewPos.z += sh.pz;
      lifeCGCrewQuat2.setFromAxisAngle(LIFE_SHIP_UP, sh.yaw + Math.sin(ang*0.7)*0.5 + s*1.2);
      lifeCGCrewMat.compose(lifeCGCrewPos, lifeCGCrewQuat2, lifeOrdTmpScale1);
      lifeOrdMesh.setMatrixAt(base+s, lifeCGCrewMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+base+s, lifeCGCrewPos.x, lifeCGCrewPos.y+2.1, lifeCGCrewPos.z);
    }else{
      lifeCGCrewMat.compose(lifeCGCrewPos.set(0,0,0), lifeCGCrewQuat.identity(), lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(base+s, lifeCGCrewMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+base+s, 0, 0, 0, false);
    }
  }
}
/* owner: "add fishing boats (and all past and future life layer entities)
   to the pathing devtool" — one call, next to the population it describes,
   the pattern the fishing dhows above set. The line drawn is the patrol
   circuit itself; the posts are both published berths. */
if(typeof pathvizRegister === 'function') pathvizRegister({
  key:'cguard', label:'Coast guard (Fortress)', color:0x3fbf6a, seg:24, glow:8,
  entities: function(){ return LIFE_CG_SHIP ? [LIFE_CG_SHIP] : []; },
  posts: function(){ return (typeof LIFE_CGUARD_BERTHS !== 'undefined' ? LIFE_CGUARD_BERTHS : [])
                            .map(function(b){ return { x:b.x, y:SEA, z:b.z }; }); },
  postR: 7
});
/* a real identity under the inspector. userData.inspectLabel is per-MESH and
   this hull is instance LIFE_SHIP_CG_IDX of the same InstancedMesh that draws
   nine ordinary merchant junks, so the mesh-level label can only ever say
   "Ship hull" for all ten. inspectInstance() (86-inspect.js) is the hook for
   exactly that: one registration, keyed on (mesh, instance index), which is
   what the raycast hit already carries — no proximity guess against a moving
   hull's position, and no reaching into that file's own dispatch from here.
   `site` because this vessel genuinely belongs to the Fortress canton while
   floating 245 units off its centre against a 150 radius, so
   nearestNamedSite() cannot find it on its own. */
if(typeof inspectInstance === 'function') inspectInstance({
  key: 'cguard-junk',
  mesh: lifeShipHullMesh,
  index: LIFE_SHIP_CG_IDX,
  label: 'Coast-guard junk — Ordinator patrol',
  site: 'Fortress canton'
});

/* ============================== water taxis / ferries ======================
   The owner: a circular ferry route round the bay (10 ferries, 5 each
   direction) stopping at every canton pier — the 4 existing CPIERS plus a
   new one at every canton that doesn't have one yet, preferentially
   facing the bay's own centre — the mainland river docks, a new harbour
   pier by the customs house, and a new pier at the promontory point.
   Guild is the one exception: instead of its own inward pier it gets one
   near its causeway by Market F, "the west side's own local market"
   (30-layout.js's own words for it — the only district actually called
   that) — a siting choice, not a comment on what the canton itself is
   built as (Guild is its own four-craft-hall district with a small local
   market of its own, not the garden this note used to call it — see
   30-layout.js's CIDX['Guild'].guild). Two further
   dedicated ferries: customs<->promontory back-and-forth, and a
   temple<->island-shrines circuit (the shrines get their own new piers
   too). Reuses ferry() 's (65-facade.js) own proportions, minus its cargo
   crates per the owner's ask — a passenger cabin where the cargo was
   instead. One ferryman, 1-5 passengers, all popping in and out of
   existence at each stop for now — real boarding/alighting is explicitly
   future pedestrian-layer work per the owner's own note, not built here.

   LIFE_BAY_CENTER/LIFE_FERRY_STOPS/LIFE_SHRINE_STOPS/LIFE_SHRINE_ROUTE and
   the lifeCantonEdge/lifeBuildFerryPier helpers that build them are NOT
   defined in this file — real bug found post-hoc: this file's own header
   above says "Never touches BUCKET/emitBuckets()", but the pier geometry
   these built is real static BOX/CYL geometry, and 75-terrain.js's
   `var EMIT = emitBuckets();` (file order 75) runs BEFORE this file (78)
   — so those BOX/CYL calls were pushing into a BUCKET that had already
   been drained and turned into InstancedMeshes. The calls didn't error,
   the piers just never appeared. Moved the whole stop-building block
   (unchanged) to 65-facade.js, which runs at file order 65 — after
   CIDX/CPIERS/RPIERS/CAUSEWAYS/ISLES exist (all from 30-layout.js) but
   safely before 75's emitBuckets(). This file just reads the resulting
   globals, same as it already does with CPIERS/CIDX themselves. */

/* ---- ferry visuals: ferry()'s own proportions (65-facade.js) minus the
   cargo crates, a passenger cabin in their place — merged like every
   other moving thing in this file, one InstancedMesh for all 12 hulls
   (mast, sail and all — a single colour is a fair trade for one fewer
   draw call here, unlike the ships which keep sails separate for their
   own distinct colour). People (1 ferryman + up to 5 passengers per
   ferry, so 6 slots each) are a second shared InstancedMesh, unused slots
   scaled to 0 — same trick the ships/canoes use for a fluctuating count
   without a variable-length buffer. 2 draw calls total (hull, people) on
   top of the canoes' and ships' — tallied in BUDGET.drawCalls
   (05-palette.js). */
var LIFE_FERRY_LEN = 16, LIFE_FERRY_BEAM = 6;
var lifeFerryHullParts = [
  new THREE.BoxGeometry(LIFE_FERRY_BEAM, 2.6, LIFE_FERRY_LEN),
  new THREE.BoxGeometry(LIFE_FERRY_BEAM*0.92, 0.5, LIFE_FERRY_LEN*0.96).translate(0, 2.2, 0),
  new THREE.BoxGeometry(LIFE_FERRY_BEAM*0.6, 2.2, LIFE_FERRY_LEN*0.28).translate(0, 3.6, -LIFE_FERRY_LEN*0.22),
  new THREE.CylinderGeometry(0.18, 0.18, 7, 6).translate(0, 3.1, LIFE_FERRY_LEN*0.18),
  new THREE.BoxGeometry(0.06, 6, LIFE_FERRY_BEAM*0.55).translate(0, 4.1, LIFE_FERRY_LEN*0.18)
];
var lifeFerryHullGeo = lifeMergeGeoms(lifeFerryHullParts);
var LIFE_FERRY_N = 12;
var lifeFerryHullMesh = new THREE.InstancedMesh(lifeFerryHullGeo, new THREE.MeshLambertMaterial({ color: 0x5e4d3a }), LIFE_FERRY_N);
lifeFerryHullMesh.userData.life = true; lifeFerryHullMesh.userData.inspectLabel = 'Ferry hull';
lifeFerryHullMesh.frustumCulled = false;
scene.add(lifeFerryHullMesh);

/* local-avoidance arrays: declared much further down (right before
   updateBarges), not here — sizing them needs LIFE_RBARGE_N and the
   pleasure barge's own slot too, both from the barge section below, plus
   BRIDGE_SUPPORTS (50-cantons.js) for the static obstacle slots. Same
   file-order reasoning as everywhere else this pattern shows up: the
   functions that USE these arrays (lifeAvoidNudge, updateLife,
   updateFerries, updateShips, updateBarges) only run later, at animation
   time, so the arrays just need to exist by then — not here. */

var LIFE_FERRY_PEOPLE_PER = 6;   /* 1 ferryman + up to 5 passengers */
var lifeFerryPeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_FERRY_N*LIFE_FERRY_PEOPLE_PER);
lifeFerryPeopleMesh.userData.life = true; lifeFerryPeopleMesh.userData.inspectLabel = 'Ferry passenger';
lifeFerryPeopleMesh.frustumCulled = false;
scene.add(lifeFerryPeopleMesh);
/* fixed local seats on the deck, rotated by the ferry's own yaw each
   frame — slot 0 (the ferryman) at the tiller, aft; 1-5 scattered
   forward of the cabin. */
var LIFE_FERRY_SEATS = [
  [0, -LIFE_FERRY_LEN*0.42],
  [-1.4, -1.5], [1.4, -1.5], [-1.4, 2.5], [1.4, 2.5], [0, 5.6]
];

/* ---- the 12 ferries: 10 round the main circle (5 clockwise, 5 counter),
   staggered start positions so they don't all bunch at stop 0, plus the
   2 dedicated shuttles. */
var LIFE_FERRIES = [];
(function(){
  var n = LIFE_FERRY_STOPS.length;
  for(var i=0;i<5;i++){
    var startIdx = Math.floor(i*n/5);
    LIFE_FERRIES.push({ stops: LIFE_FERRY_STOPS, dir: 1, idx: startIdx,
      speed: rr(8,11), dwell: rr(9,16), stateT: rr(0,10), state:'docked', passengers: ri(1,5) });
  }
  for(var j=0;j<5;j++){
    var startIdx2 = Math.floor(j*n/5 + n/10);
    LIFE_FERRIES.push({ stops: LIFE_FERRY_STOPS, dir: -1, idx: startIdx2,
      speed: rr(8,11), dwell: rr(9,16), stateT: rr(0,10), state:'docked', passengers: ri(1,5) });
  }
  var custStop = LIFE_FERRY_STOPS.filter(function(s){ return s.name === 'Customs'; })[0];
  var promStop = LIFE_FERRY_STOPS.filter(function(s){ return s.name === 'Promontory'; })[0];
  LIFE_FERRIES.push({ stops: [custStop, promStop], dir: 1, idx: 0,
    speed: rr(8,10), dwell: rr(10,16), stateT: rr(0,8), state:'docked', passengers: ri(1,5) });
  LIFE_FERRIES.push({ stops: LIFE_SHRINE_ROUTE, dir: 1, idx: 0,
    speed: rr(7,9), dwell: rr(9,14), stateT: rr(0,8), state:'docked', passengers: ri(1,5) });
})();
window._ferries = { count: LIFE_FERRIES.length, stops: LIFE_FERRY_STOPS.length, shrineStops: LIFE_SHRINE_STOPS.length };
window._ferryStops = LIFE_FERRY_STOPS;   /* diagnostic: name/x/z/ry for every stop */
window._shrineStops = LIFE_SHRINE_STOPS;
window._legsFerry = LIFE_FERRIES.map(function(){ return null; });

var lifeFerryTmpPos = new THREE.Vector3(), lifeFerryTmpDir = new THREE.Vector3();
var lifeFerryTmpQuat = new THREE.Quaternion(), lifeFerryTmpMat = new THREE.Matrix4();
var lifeFerryTmpScale1 = new THREE.Vector3(1,1,1), lifeFerryTmpScale0 = new THREE.Vector3(0,0,0);
var lifeFerryTmpPos2 = new THREE.Vector3();
function updateFerries(dt){
  LIFE_FERRIES.forEach(function(f, fi){
    f.stateT += dt;
    var pos, yaw;
    if(f.state === 'docked'){
      var stop = f.stops[f.idx];
      pos = stop; yaw = stop.ry;
      if(f.stateT >= f.dwell){
        var nextIdx = (f.idx + f.dir + f.stops.length) % f.stops.length;
        var a = f.stops[f.idx], b = f.stops[nextIdx];
        /* the owner's own report ("ferries... are happily clipping
           through chinampas... and piers") — ferries now route on the
           real nav-grid (A* + line-of-sight simplification, above)
           instead of the seed-and-nudge heuristic every other vehicle
           still uses. First real usage of it: ferries visit the most
           stops closest to chinampa fields and piers of anything in the
           life layer, so they're where the difference actually shows. */
        f.curve = lifeNavBuildLeg(a.x, a.z, b.x, b.z);
        f.len = f.curve.getLength();
        f.dur = Math.max(6, f.len / f.speed);
        f.nextIdx = nextIdx;
        f.state = 'transit'; f.stateT = 0;
        /* anticipatory-turn state (see the transit branch below) — seeded
           from the stop it's leaving so the first frame's turn-rate clamp
           has a sane starting point instead of blending from undefined. */
        f.lastX = a.x; f.lastZ = a.z; f.facingYaw = a.ry;
        window._legsFerry[fi] = { curve: f.curve };
      }
    }else{
      var raw = Math.min(1, f.stateT / f.dur);
      var t = raw*raw*(3-2*raw);
      f.curve.getPointAt(t, lifeFerryTmpPos);
      pos = lifeFerryTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      f.curve.getTangentAt(tTan, lifeFerryTmpDir);
      var tanYaw = Math.atan2(lifeFerryTmpDir.x, lifeFerryTmpDir.z);
      if(raw >= 1){
        f.idx = f.nextIdx;
        f.state = 'docked'; f.stateT = 0; f.dwell = rr(9,16);
        /* the owner: "if they pick a ferry, they queue up, board the next
           ferry with room, and add 1 to the ferry passenger count. the
           ferry will always discharge 1-3 passengers and will always pick
           up 1-3 passengers (room allowing)." Real queue against the
           rambling-pedestrian pool (LIFE_PEDS, below) at whichever
           LIFE_DOORS 'dock' entry matches this stop, not the old flat
           ri(1,5) reroll. LIFE_DOOR_BY_STOPNAME only covers the main
           ferry circuit's own stops (not the shrine-route ferries, a
           separate pool with no queueing yet) — falls back to the old
           random behaviour for those so they're unaffected. */
        /* NOT the `stop` var from the 'docked' branch above — that's a
           `var` (function-scoped, not block-scoped) so it survives
           syntactically, but it's only ever ASSIGNED when this ferry's
           OWN 'docked' branch runs, which hasn't happened yet this frame
           (we're in the transit branch); it's stale or outright
           undefined here. f.idx was just updated 2 lines up — the stop
           actually being arrived at is f.stops[f.idx], fresh, right now. */
        var arrivedStop = f.stops[f.idx];
        var stopDoor = (arrivedStop && typeof LIFE_DOOR_BY_STOPNAME !== 'undefined') ? LIFE_DOOR_BY_STOPNAME[arrivedStop.name] : null;
        if(stopDoor){ lifeFerryBoard(f, stopDoor); }
        else{ f.passengers = ri(1,5); }
      }
      /* local avoidance — only while actually under way; a docked ferry
         sits exactly at its stop, not nudged off it (see file-level
         comment near updateLife: queueing at a busy stop is the
         follow-up piece, not built here).

         The owner: "they collide, then sort of both veer in opposite
         directions then back on course, not like a boat would move...
         can you get them to anticipate collision and turn." Two real
         causes fixed together:
         1) the push was sensed from where the ferry already IS, so
            nothing happened until hulls were already overlapping —
            sensed instead from a point out ahead along its own heading,
            so a ferry on a collision course starts correcting before
            the hulls actually touch.
         2) the push only ever moved the render POSITION sideways; the
            render YAW still came straight from the curve tangent, so a
            nudged ferry visibly slid sideways rather than turning —
            "crabbing", not steering. Facing now comes from the ferry's
            own actual frame-to-frame movement (which the nudge already
            bends), blended toward at a bounded turn rate so the turn
            reads as gradual steering, not a snap. */
      var favoidSlot = LIFE_AVOID_FERRY0 + fi;
      var fdelta = lifeAvoidNudge2(favoidSlot, pos.x, pos.z, lifeFerryTmpDir.x, lifeFerryTmpDir.z, LIFE_AVOID_R[favoidSlot], 8.0, LIFE_AVOID_LOOKAHEAD, 3.5, 2);
      pos.x += fdelta[0]; pos.z += fdelta[1];
      var mdx = pos.x-f.lastX, mdz = pos.z-f.lastZ;
      var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
      var dAng = moveYaw - f.facingYaw;
      while(dAng > Math.PI) dAng -= Math.PI*2;
      while(dAng < -Math.PI) dAng += Math.PI*2;
      var maxStep = LIFE_FERRY_TURN_RATE*dt;
      f.facingYaw += Math.max(-maxStep, Math.min(maxStep, dAng));
      yaw = f.facingYaw;
      f.lastX = pos.x; f.lastZ = pos.z;
    }
    LIFE_AVOID_X[LIFE_AVOID_FERRY0+fi] = pos.x; LIFE_AVOID_Z[LIFE_AVOID_FERRY0+fi] = pos.z;
    lifeFerryTmpPos2.set(pos.x, SEA-0.2, pos.z);
    lifeFerryTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeFerryTmpMat.compose(lifeFerryTmpPos2, lifeFerryTmpQuat, lifeFerryTmpScale1);
    lifeFerryHullMesh.setMatrixAt(fi, lifeFerryTmpMat);

    var baseIdx = fi*LIFE_FERRY_PEOPLE_PER;
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    for(var s=0; s<LIFE_FERRY_PEOPLE_PER; s++){
      var visible = (s === 0) || (s <= f.passengers);
      if(visible){
        var seat = LIFE_FERRY_SEATS[s];
        var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
        var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
        /* real bug: SEA+0.6 put people INSIDE the hull box (it's centred
           on the hull's own placement with no translate, so it spans
           SEA-1.5..SEA+1.1) — invisible, swallowed by solid hull geometry.
           The open deck plank sits at SEA+1.75..+2.25 (translate(0,2.2,0),
           h 0.5); stand people on top of it. */
        lifeFerryTmpPos2.set(wx, SEA+2.5, wz);   /* +0.2 vs. before: LIFE_PEOPLE_SCALE made the torso cylinder taller */
        lifeFerryTmpMat.compose(lifeFerryTmpPos2, lifeFerryTmpQuat, lifeFerryTmpScale1);
      }else{
        lifeFerryTmpMat.compose(lifeFerryTmpPos2.set(0,0,0), lifeFerryTmpQuat, lifeFerryTmpScale0);
      }
      lifeFerryPeopleMesh.setMatrixAt(baseIdx+s, lifeFerryTmpMat);
    }
  });
  lifeFerryHullMesh.instanceMatrix.needsUpdate = true;
  lifeFerryPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== water taxis ================================
   The owner: "an actual water taxi... unlike ferries, water taxis do not
   have set routes. they spawn in at a random ferry dock, pick up 4-8
   passengers, and they pick the furthest away, least visited dock as a
   destination - idea is they are seen to zip back and forth across the
   bay." Thai long-tail (hang yao) inspired hull — long, narrow, low
   freeboard, a dramatically upswept bow — but with dedicated oarsmen
   instead of the real thing's tail-shaft motor, per the owner's own
   correction. 8 boats, 1 captain + 6 oarsmen each, 4-8 passengers a trip.
   2 new draw calls (hull, people) — see BUDGET.drawCalls (05-palette.js)
   for why every boat population pays this same floor.

   Reuses LIFE_FERRY_STOPS as the dock network (the same piers ferries
   already call at) rather than inventing a second dock list, and
   lifeNavBuildLeg (ferries' own nav-grid router, just above) for the
   actual crossing, so taxis route round chinampas/piers exactly as
   correctly as ferries do — this is explicitly open water they're
   darting across, not a fixed line, so a correct route matters even more.

   Per-boat colour: the merged hull geometry bakes the hull itself in a
   muted, tint-receptive wood tone and the wreath/trim/canopy in white —
   multiplying by white lets a single per-instance setColorAt tint (8
   distinct hues, one per boat) drive the wreath/trim/canopy at full
   saturation while the SAME tint only lightly warms/cools the wood hull,
   so each boat reads as "the same natural hull, its own colour scheme,"
   not identical decorated boats or a fully-repainted hull. No 3rd draw
   call, no per-part independent colour — InstancedMesh only offers one
   colour multiply per instance; see the penitents' own comment (above,
   updateFerries' neighbourhood) for the same one-shared-geometry
   limitation hit and worked around before this. */
/* owner follow-up, twice: bigger hull (15 people was crowding a 1.9-beam
   boat) and a real long awning, not a token roof — "a long colored
   canopy/awning like in the picture that leaves just the front 1/4 of the
   boat exposed." Real bug behind "canopies not spawning properly or
   buried": the roof sat at hull-local y=1.85 (world SEA+1.70), but a
   standing passenger mounts at SEA+1.6 and its own merged geometry reaches
   to +2.576 above that (LIFE_PEOPLE_SCALE=2.8's own torso+head extent,
   checked directly against lifePersonGeo's bounding box the same way the
   pedestrian-height measurement for the temple pillars was) — i.e. a
   standing crew member's head reaches ~SEA+4.18, a full 2.5 units ABOVE
   where the old roof sat. It wasn't failing to spawn, it was spawning
   correctly and then reading as "buried" because the whole crowd stood up
   through it. Roof now well above that (local y=4.6, world ~SEA+4.45). */
var LIFE_TAXI_LEN = 20, LIFE_TAXI_BEAM = 3.0;
var lifeTaxiHullParts = [
  /* main hull */
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM, 1.1, LIFE_TAXI_LEN*0.80).translate(0, 0, -LIFE_TAXI_LEN*0.08), color: 0x8a7a68 },
  /* upswept long-tail bow, angled up and forward */
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM*0.68, 0.85, LIFE_TAXI_LEN*0.34).rotateX(-0.58).translate(0, 1.7, LIFE_TAXI_LEN*0.40), color: 0x8a7a68 },
  /* gunwale trim strips, both sides — tint-receptive white */
  { geo: new THREE.BoxGeometry(0.16, 0.38, LIFE_TAXI_LEN*0.78).translate(LIFE_TAXI_BEAM*0.5, 0.40, -LIFE_TAXI_LEN*0.08), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.16, 0.38, LIFE_TAXI_LEN*0.78).translate(-LIFE_TAXI_BEAM*0.5, 0.40, -LIFE_TAXI_LEN*0.08), color: 0xffffff },
  /* long awning: 3 pairs of posts (deck to well above head height) plus a
     roof spanning the rear 3/4 of the hull, leaving only the front 1/4
     (the bow) open — z from -0.5*LEN (stern) to +0.25*LEN, i.e. centred
     at -0.125*LEN with length 0.75*LEN, matching the reference photo. */
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.40), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.40), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.125), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.125), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, LIFE_TAXI_LEN*0.15), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, LIFE_TAXI_LEN*0.15), color: 0x6b5942 },
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM*1.18, 0.16, LIFE_TAXI_LEN*0.75).translate(0, 4.95, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  /* a shallow valance along both long edges of the roof, like the
     reference photo's awning skirt — same tint-receptive white. Owner:
     people mount at SEA+1.85 with a merged-geometry top at +2.576 above
     that (~SEA+4.43 absolute) — the roof (local y=4.95, world ~SEA+4.80)
     clears that with real margin this time, checked by the numbers, not
     eyeballed like the buried first attempt was. */
  { geo: new THREE.BoxGeometry(0.10, 0.60, LIFE_TAXI_LEN*0.75).translate(LIFE_TAXI_BEAM*0.59, 4.62, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.10, 0.60, LIFE_TAXI_LEN*0.75).translate(-LIFE_TAXI_BEAM*0.59, 4.62, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  /* bow wreath — a small garland ring at the bow tip, tint-receptive */
  { geo: new THREE.TorusGeometry(0.52, 0.13, 5, 10).rotateY(Math.PI/2).translate(0, 1.9, LIFE_TAXI_LEN*0.50), color: 0xffffff }
];
var lifeTaxiHullGeo = lifeMergeGeoms(lifeTaxiHullParts);
var LIFE_TAXI_N = 8;
var lifeTaxiHullMesh = new THREE.InstancedMesh(lifeTaxiHullGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_TAXI_N);
lifeTaxiHullMesh.userData.life = true; lifeTaxiHullMesh.userData.inspectLabel = 'Water taxi';
lifeTaxiHullMesh.frustumCulled = false;
scene.add(lifeTaxiHullMesh);

var LIFE_TAXI_CREW = 7, LIFE_TAXI_PAX_MAX = 8, LIFE_TAXI_SEATS_N = LIFE_TAXI_CREW + LIFE_TAXI_PAX_MAX;
var lifeTaxiPeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_TAXI_N*LIFE_TAXI_SEATS_N);
lifeTaxiPeopleMesh.userData.life = true; lifeTaxiPeopleMesh.userData.inspectLabel = 'Water taxi crew';
lifeTaxiPeopleMesh.frustumCulled = false;
scene.add(lifeTaxiPeopleMesh);
/* seat 0 = captain (stern, at the tiller); 1-6 = the 6 oarsmen, 3 a side;
   7-14 = up to 8 passengers amidships, under the canopy. Owner: "make
   water taxis bigger so people aren't as crowded" — spread out to match
   the bigger hull (LEN 15->20, BEAM 1.9->3.0), not just scaled the same
   cramped layout up proportionally. */
var LIFE_TAXI_SEATS = [
  [0, -LIFE_TAXI_LEN*0.42],
  [LIFE_TAXI_BEAM*0.48, 5.0], [LIFE_TAXI_BEAM*0.48, 0.5], [LIFE_TAXI_BEAM*0.48, -4.0],
  [-LIFE_TAXI_BEAM*0.48, 5.0], [-LIFE_TAXI_BEAM*0.48, 0.5], [-LIFE_TAXI_BEAM*0.48, -4.0],
  [0.9, 3.0], [-0.9, 3.0], [0.9, 1.2], [-0.9, 1.2],
  [0.9, -0.8], [-0.9, -0.8], [0.9, -2.6], [-0.9, -2.6]
];
/* 8 distinct accent hues, one per boat (PAL.taxi/TAXIC, 05-palette.js) —
   genuinely different combos across the fleet even though wreath/trim/
   canopy share one hue within a single boat (see the file-level comment
   above). */
(function(){
  var white = new THREE.Color(0xffffff);
  var m = new THREE.Matrix4();
  for(var i=0;i<LIFE_TAXI_N;i++){
    m.identity();
    lifeTaxiHullMesh.setMatrixAt(i, m);
    lifeTaxiHullMesh.setColorAt(i, new THREE.Color(TAXIC[i % TAXIC.length]));
  }
  lifeTaxiHullMesh.instanceColor.needsUpdate = true;
  for(var k=0;k<LIFE_TAXI_N*LIFE_TAXI_SEATS_N;k++) lifeTaxiPeopleMesh.setColorAt(k, white);
  lifeTaxiPeopleMesh.instanceColor.needsUpdate = true;
})();

/* least-visited-plus-furthest destination pick: score rewards distance and
   penalises a dock this fleet already calls at often, so the 8 boats
   naturally spread across the whole dock network instead of ping-ponging
   the same two stops. */
var LIFE_TAXI_VISITS = LIFE_FERRY_STOPS.map(function(){ return 0; });
/* owner: "water taxis don't seem to vary their destinations much... pick
   whatever ferry dock has the most people waiting at it" — the old
   distance/visit-decay score was dominated by raw distance (the visit
   penalty was only a 0.4-per-visit divisor), so it converged on
   whichever 1-2 docks were furthest apart and kept swinging between
   basically the same pair — technically "a new destination every stop"
   (a fresh index is picked on every arrival, this always did that), but
   not a VARIED one. Demand-driven instead: the real queueCount every
   dock's own LIFE_DOORS entry already tracks (LIFE_DOOR_BY_STOPNAME,
   the same field ferries/striders board against) — whichever stop has
   the most people actually waiting wins, which naturally varies pick to
   pick as queues build and drain around the bay. Falls back to a random
   other stop (not the old furthest-biased scoring) when nobody's
   waiting anywhere, so an empty-queue moment doesn't just repeat the
   same "furthest" answer either. */
function lifeTaxiPickDest(fromIdx){
  var best = -1, bestQ = 0;
  for(var i=0;i<LIFE_FERRY_STOPS.length;i++){
    if(i === fromIdx) continue;
    var door = (typeof LIFE_DOOR_BY_STOPNAME !== 'undefined') ? LIFE_DOOR_BY_STOPNAME[LIFE_FERRY_STOPS[i].name] : null;
    var q = door ? (door.queueCount||0) : 0;
    if(q > bestQ){ bestQ = q; best = i; }
  }
  if(best >= 0) return best;
  var others = [];
  for(var j=0;j<LIFE_FERRY_STOPS.length;j++) if(j!==fromIdx) others.push(j);
  return others.length ? pick(others) : (fromIdx+1) % LIFE_FERRY_STOPS.length;
}
var LIFE_TAXIS = [];
(function(){
  reseed(783351);
  var n = LIFE_FERRY_STOPS.length;
  for(var i=0;i<LIFE_TAXI_N;i++){
    var dockIdx = Math.floor(rnd()*n);
    LIFE_TAXIS.push({ dockIdx:dockIdx, state:'docked', stateT: rr(0,4), dwell: rr(3,6),
      speed: rr(16,22), passengers: ri(4,8), curve:null });
  }
})();
window._taxis = LIFE_TAXIS;   /* diagnostic: full state, incl. each taxi's .curve */

var lifeTaxiTmpPos = new THREE.Vector3(), lifeTaxiTmpDir = new THREE.Vector3();
var lifeTaxiTmpQuat = new THREE.Quaternion(), lifeTaxiTmpMat = new THREE.Matrix4();
var lifeTaxiTmpScale1 = new THREE.Vector3(1,1,1), lifeTaxiTmpScale0 = new THREE.Vector3(0,0,0);
var lifeTaxiTmpPos2 = new THREE.Vector3();
function updateWaterTaxis(dt){
  LIFE_TAXIS.forEach(function(tx, ti){
    tx.stateT += dt;
    var pos, yaw;
    if(tx.state === 'docked'){
      var stop = LIFE_FERRY_STOPS[tx.dockIdx];
      pos = stop; yaw = stop.ry;
      if(tx.stateT >= tx.dwell){
        var destIdx = lifeTaxiPickDest(tx.dockIdx);
        var a = LIFE_FERRY_STOPS[tx.dockIdx], b = LIFE_FERRY_STOPS[destIdx];
        tx.curve = lifeNavBuildLeg(a.x, a.z, b.x, b.z);
        tx.len = tx.curve.getLength();
        tx.dur = Math.max(5, tx.len/tx.speed);
        tx.destIdx = destIdx;
        tx.state = 'transit'; tx.stateT = 0;
      }
    }else{
      var raw = Math.min(1, tx.stateT/tx.dur);
      var t = raw*raw*(3-2*raw);
      tx.curve.getPointAt(t, lifeTaxiTmpPos);
      pos = lifeTaxiTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      tx.curve.getTangentAt(tTan, lifeTaxiTmpDir);
      yaw = Math.atan2(lifeTaxiTmpDir.x, lifeTaxiTmpDir.z);
      if(raw >= 1){
        tx.dockIdx = tx.destIdx;
        LIFE_TAXI_VISITS[tx.dockIdx]++;
        tx.state = 'docked'; tx.stateT = 0; tx.dwell = rr(3,6);
        tx.passengers = ri(4,8);   /* new fares board for the next crossing */
      }
    }
    lifeTaxiTmpPos2.set(pos.x, SEA-0.15, pos.z);
    lifeTaxiTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeTaxiTmpMat.compose(lifeTaxiTmpPos2, lifeTaxiTmpQuat, lifeTaxiTmpScale1);
    lifeTaxiHullMesh.setMatrixAt(ti, lifeTaxiTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_TAXI_BASE+ti, pos.x, SEA+2.6, pos.z);

    var baseIdx = ti*LIFE_TAXI_SEATS_N;
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    for(var s=0; s<LIFE_TAXI_SEATS_N; s++){
      var isCrew = s < LIFE_TAXI_CREW;
      var visible = isCrew || (s - LIFE_TAXI_CREW) < tx.passengers;
      if(visible){
        var seat = LIFE_TAXI_SEATS[s];
        var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
        var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
        lifeTaxiTmpPos2.set(wx, SEA+1.85, wz);
        lifeTaxiTmpMat.compose(lifeTaxiTmpPos2, lifeTaxiTmpQuat, lifeTaxiTmpScale1);
      }else{
        lifeTaxiTmpMat.compose(lifeTaxiTmpPos2.set(0,0,0), lifeTaxiTmpQuat, lifeTaxiTmpScale0);
      }
      lifeTaxiPeopleMesh.setMatrixAt(baseIdx+s, lifeTaxiTmpMat);
    }
  });
  lifeTaxiHullMesh.instanceMatrix.needsUpdate = true;
  lifeTaxiPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== barges =====================================
   The owner: keep the first pass's big barge-style hull (built for the
   ships, replaced there by a caravel per the owner's own correction) and
   reuse it for river barges — 2 of them, shuttling exclusively up and
   down the river, one docked-and-just-unloaded while the other arrives
   full, load-and-depart-upriver 15s after the disappearing one is truly
   gone, 3 crew who never leave. Plus one pleasure barge — gold hull,
   purple sails, 3 crew, 10-20 partiers, rambling the open bay and
   periodically returning to the harbour to fill up (won't leave again
   until it has at least 10 aboard). ------------------------------------ */

/* ---- river barges: follow the river's OWN polyline (riverAt/RIVER_CUM,
   30-layout.js), not the open-bay heuristic the ships/ferries use above —
   a channel this narrow needs to actually thread its real bends, not an
   approximation that could cut across a bank. This is also what
   guarantees both real bridges (RBRIDGES) get crossed UNDER, not around:
   riverAt() is the same function that placed them. */
function lifeRiverCurve(u0, u1){
  var uMax = RIVER_CUM[RIVER_CUM.length-1] - 1;
  /* 32, was 16 — a leg spanning the river's full length (u1-u0 up to
     ~1300+) left waypoints 80+ units apart, too coarse for the
     correction loop below to reliably have a nearby control point to
     nudge right where a bridge pylon actually sits. */
  var steps = 32, waypoints = [];
  for(var i=0;i<=steps;i++){
    var u = Math.max(0, Math.min(uMax, u0 + (u1-u0)*i/steps));
    var p = riverAt(u);
    waypoints.push([p.x, p.z]);
  }
  /* the owner, watching an actual barge do this: "I saw an outgoing barge
     start to swerve to avoid a bridge support, then swerve back to the
     original path and clip through it again." Root cause: this only ever
     followed the river's own CENTRELINE, which runs straight through a
     bridge's central support pylon (BRIDGE_SUPPORTS, 50-cantons.js) by
     construction — the real-time avoidance nudge (lifeAvoidNudge2, see
     its own comment) was fighting a curve that pulled the barge straight
     back onto the pylon every single frame, and didn't always win.
     Same detect-blocked-point/insert-a-waypoint/rebuild refinement
     lifeBuildLeg's whole family already uses (lifePierOrBridgeBlocked
     checks both piers AND bridge pylons, so this also can't cut through
     a river dock's own new quay deck). Checked along the actual curve at
     fine resolution, not just the raw waypoints, so a pylon that happens
     to fall between two of the 16 samples above still gets caught. */
  for(var round=0; round<14; round++){
    var curve2 = lifeCurveFrom(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<160; s++){
      var st = s/160, p2 = curve2.getPointAt(st);
      var fix = lifePierOrBridgeBlocked(p2.x, p2.z);
      if(fix){ worstT = st; worstFix = fix; break; }
    }
    if(worstT < 0) break;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w=1; w<waypoints.length-1; w++){
      var wt = w/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  var pts = waypoints.map(function(p){ return new THREE.Vector3(p[0], SEA-0.3, p[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
}
var LIFE_RIVER_FAR_U  = RIVER_CUM[RIVER_CUM.length-1] - 60;
/* the owner: "make the incoming river barge spawn in at [1993.1,1605.7]"
   — same fix as the ship's spawn point above, and for the same reason
   (the far end of the river, LIFE_RIVER_FAR_U, is well outside the
   default view). Converted from a world point to this river's own arc-
   length parameter via polyNear (10-core.js) — the same nearest-point
   projection riverHalf()/inRiver() already use against this exact
   polyline — rather than picking a u by guesswork. Only the ONE barge
   that starts already sailing on load (barge 1, below) uses this; every
   other river-barge arrival travels the real distance from
   LIFE_RIVER_FAR_U. */
var LIFE_RIVER_SPAWN_U = (function(){
  var rv = polyNear(1993.1, 1605.7, RIVER, RIVER_CUM);
  return rv.t * RIVER_CUM[RIVER_CUM.length-1];
})();
/* owner: "i'm not sure the river barges are always rendering at the moment".
   They always are — measured live: all 7 hulls present, visible, unculled and
   moving. The real fault is WHERE they are. The 7 barge docks span x=1274..2073,
   but 5 of the 7 barges sat at x=3700..5740 — up to 3,700 units past the
   furthest dock, far off the end of the visible map, on a leg roughly four
   times longer than the entire dock stretch they exist to serve. So at any
   moment most of the fleet is invisible, which reads exactly like "sometimes
   not rendering".
   The comment above already flagged this ("the far end of the river is well
   outside the default view") and the owner had already asked for a nearer
   spawn — but that fix was applied to exactly ONE barge, and every other
   arrival still ran the full distance from LIFE_RIVER_FAR_U. This turnaround
   applies the same intent to the whole fleet: far enough upstream to be a
   real journey out of the dock cluster, near enough to stay in sight.
   LIFE_RIVER_FAR_U itself is left alone — the ships that legitimately leave
   the map still use it. */
var LIFE_RIVER_TURN_U = Math.min(LIFE_RIVER_FAR_U, LIFE_RIVER_SPAWN_U + 700);

/* real height budget, checked against CROSS_CLEAR=11 (85-probe.js) before
   picking a number: hull is 6 tall, centred, sat at SEA-0.3, so its own
   top is ~2.7; the flagpole below tops out at 8.5 — over 2 units of
   margin under both real bridges, not a guess. No sail on the river
   barges at all (unlike the pleasure barge below) — a full mast would
   have to clear the same 11 units and there isn't room for one worth
   having, and barges reading as towed/poled cargo haulers rather than
   sailed vessels fits the "cargo barge" character anyway. Cargo crates
   are just always part of the merged hull (not toggled empty/full
   visually) — the owner's load/unload cycle is a real scheduling state
   (see updateBarges), simplified here to not need a second hull mesh
   (and second draw call) just to swap a few crates in and out. */
var LIFE_RBARGE_LEN = 50, LIFE_RBARGE_BEAM = 14;
var lifeRBargeHullParts = [
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM, 6, LIFE_RBARGE_LEN),
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM*0.75, 3.5, LIFE_RBARGE_LEN*0.19).translate(0, 4.75, -LIFE_RBARGE_LEN*0.36),
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM*0.65, 2.6, LIFE_RBARGE_LEN*0.14).translate(0, 4.3, LIFE_RBARGE_LEN*0.40),
  new THREE.CylinderGeometry(0.15, 0.15, 3, 5).translate(0, 7.0, -LIFE_RBARGE_LEN*0.10),
  new THREE.BoxGeometry(3.2, 2.6, 3.2).translate(-3.2, 4.3, 2),
  new THREE.BoxGeometry(3.6, 2.2, 3.0).translate(2.6, 4.1, 6),
  new THREE.BoxGeometry(3.0, 2.8, 3.4).translate(-1.0, 4.4, -8)
];
var lifeRBargeHullGeo = lifeMergeGeoms(lifeRBargeHullParts);
var LIFE_RBARGE_N = 7;   /* up from 2 — the owner: "these come in sooooo slooooowly... we could probably have a few more" */
/* real bug fixed above (lifeMergeGeoms indexed-geometry bug) is what
   actually made this look broken/pale before — the colour itself was
   already brown (0x59493a); darkened slightly per the owner's own "make
   them brown and wood textured" ask for a clearer wood-brown read. A
   real procedural wood grain (matching FAMMAT's own 'wood'/'trunk'
   texture) would need the same world-UV onBeforeCompile hookup the
   static kit's materials get (45-kit.js's applyWorldUV) — life-layer
   materials don't have that machinery today, and wiring it up is real,
   scoped work worth handing to voth-texture rather than bolting on here. */
/* the owner: "barges... look distinctly pale grey compared to the junks.
   make them a similar brown hull color" — matched to the junk's own
   LIFE_JUNK_HULL_COL (0x2c2116) directly, same reasoning as the galleon
   fix right above: 0x4a3a28 is a real brown, it just reads washed-out
   next to that much darker, more saturated tone under this lighting. */
var lifeRBargeHullMesh = new THREE.InstancedMesh(lifeRBargeHullGeo, new THREE.MeshLambertMaterial({ color: 0x2c2116 }), LIFE_RBARGE_N);
lifeRBargeHullMesh.userData.life = true; lifeRBargeHullMesh.userData.inspectLabel = 'River barge hull';
lifeRBargeHullMesh.frustumCulled = false;
scene.add(lifeRBargeHullMesh);

/* 7 river barges, one per LIFE_RBARGE_DOCKS entry (65-facade.js) — each
   cycles independently between its OWN dock and the shared far-upstream
   limit, "so we don't need the ships' own shared-quay contention logic
   (lifePickDeparture/lifeShipOpenMobileDock) at all: nothing competes for a dock,
   so there is nothing to schedule. Initial states staggered by hand to
   the owner's own exact spec — 1 fully docked, 1 almost docked, 2
   midstream coming, 1 midstream going, 1 almost off-map going, 1 almost
   off-map coming — "so they don't all arrive at once". Speed also raised
   (was 6-8, the owner: "sooooo slooooowly"). */
function lifeMakeRiverBarge(dock, state, fromU, toU, tFrac, speed){
  var b = { kind:'river', home: dock, speed: speed, stateT: 0 };
  if(state === 'docked'){
    b.state = 'docked'; b.x = dock.x; b.z = dock.z; b.ry = dock.ry; b.lastArrivalTime = -5;
    return b;
  }
  b.state = state;
  b.curve = lifeRiverCurve(fromU, toU);
  b.len = b.curve.getLength();
  b.dur = Math.max(20, b.len / b.speed);
  b.stateT = b.dur * tFrac;
  return b;
}
var LIFE_BARGES = [
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[0], 'docked',    0,                    0,                     0,    rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[1], 'arriving',  LIFE_RIVER_SPAWN_U,   LIFE_RBARGE_DOCKS[1].u, 0.92, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[2], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[2].u, 0.50, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[3], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[3].u, 0.40, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[4], 'departing', LIFE_RBARGE_DOCKS[4].u, LIFE_RIVER_TURN_U,     0.55, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[5], 'departing', LIFE_RBARGE_DOCKS[5].u, LIFE_RIVER_TURN_U,     0.88, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[6], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[6].u, 0.10, rr(9,12))
];
var LIFE_BARGE_T = 0;

/* ---- the pleasure barge: gold hull, purple sails (a second, differently
   coloured merged mesh, same reason the ships keep sails separate — this
   is the one boat in the whole life layer that actually needs a colour
   scheme nobody else uses). Rambles inside the owner's own hand-marked
   LIFE_PBARGE_ZONE polygon (defined further down, right where the barge
   itself is set up) rather than the generic open-bay heuristic the other
   vehicles use — see that polygon's own comment for why. */
function lifePolyCentroid(poly){
  var cx=0, cz=0;
  poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  return [cx/poly.length, cz/poly.length];
}
/* rejection-sample a point guaranteed inside poly — cheap and exact,
   unlike trying to derive one algebraically from a 60-vertex concave
   outline. 300 tries over the polygon's own bbox is comfortably enough
   even for a thin, winding shape like this one (checked: never exhausted
   in testing) and this only runs once per ramble departure, not per
   frame. */
function lifePolyRandomPoint(poly){
  var minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  poly.forEach(function(p){
    if(p[0]<minX)minX=p[0]; if(p[0]>maxX)maxX=p[0];
    if(p[1]<minZ)minZ=p[1]; if(p[1]>maxZ)maxZ=p[1];
  });
  for(var i=0;i<300;i++){
    var x=rr(minX,maxX), z=rr(minZ,maxZ);
    if(pointInPoly(x,z,poly)) return [x,z];
  }
  return lifePolyCentroid(poly);
}
/* lifeBuildLeg's own twin, with one extra failure mode checked each
   refinement round: a sampled point that has drifted OUTSIDE poly, fixed
   by pulling it most of the way back toward the polygon's centroid (a
   plain canton push has an exact clearR to aim for; a 60-vertex concave
   outline doesn't, so "mostly toward the middle" is the honest
   equivalent — good enough given both endpoints are already inside by
   construction and this only has to correct occasional drift). Also
   pre-clears the seed waypoints through the polygon test the same way,
   not just lifePushToWater's land/canton check.

   Real gap measured directly (sampled 60 ramble curves end to end):
   lifeBuildLeg's own 2-interior-waypoint layout (m1 at 0.33, m2 at 0.66)
   is tuned for a compact bay where any one leg crosses at most one
   canton. This polygon spans the whole lake plus a long fjord out past
   -4700 in z — a single random ramble leg can clip THREE separate
   concave notches along its length, and 2 movable points can't
   independently fix 3 unrelated problems: fixing the nearest one to
   whichever violation is "worst" this round can undo a previous round's
   fix to a different one, oscillating instead of converging. Use 5
   interior points instead of 2 so there is normally a free point near
   each real trouble spot. */
/* the owner: "make sure [the pleasure barge]... have FULL collision
   detection and avoidance" — lifeBuildLegInPoly's own refinement loop
   already re-checks a finished curve against cantons and land/the hand-
   drawn zone boundary, but never against a single real pier or bridge
   pylon; this plugs that same gap for it that lifeNavBlocked (78-life.js,
   above) already closed for ships/ferries. Returns a push-away point, or
   null if x,z is clear of every pier array (30-layout.js's PIERS/CPIERS/
   RPIERS, this file's own LIFE_EXTRA_PIERS) and every bridge pylon
   (BRIDGE_SUPPORTS, 50-cantons.js). */
function lifePierOrBridgeBlocked(x,z){
  var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS];
  for(var ai=0; ai<arrs.length; ai++){
    var arr = arrs[ai];
    for(var i=0;i<arr.length;i++){
      var p = arr[i], need = p.w*0.5+6;
      var d = lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1);
      if(d < need){
        var dx=p.x1-p.x0, dz=p.z1-p.z0, L=dx*dx+dz*dz;
        var t = L ? ((x-p.x0)*dx+(z-p.z0)*dz)/L : 0; t=Math.max(0,Math.min(1,t));
        var nx = x-(p.x0+t*dx), nz = z-(p.z0+t*dz), nd = Math.hypot(nx,nz)||1;
        return [x + (nx/nd)*(need-d+10), z + (nz/nd)*(need-d+10)];
      }
    }
  }
  for(var bi2=0; bi2<BRIDGE_SUPPORTS.length; bi2++){
    var bs = BRIDGE_SUPPORTS[bi2], needB = bs.r+6;
    var dxb = x-bs.x, dzb = z-bs.z, db = Math.hypot(dxb,dzb)||1;
    /* the owner, watching this exact spot fail: a fix that only clears
       the threshold by 3 units left enough residual curvature (the
       correction loop only ever moves ONE nearby waypoint per round, and
       Catmull-Rom's neighbours still pull the curve back in) that the
       barge could still pass within a few units of the pylon's own true
       centre — measured directly (a diagnostic sweep against the real
       BRIDGE_SUPPORTS positions): worst case 9 units from a 15-radius
       pylon, a real hit, not a near-miss. Pushed further past the
       threshold (+10, was +3) so one correction actually clears it with
       room to spare. */
    if(db < needB) return [x + (dxb/db)*(needB-db+10), z + (dzb/db)*(needB-db+10)];
  }
  return null;
}
function lifeBuildLegInPoly(ax,az,bx,bz,poly){
  var centroid = lifePolyCentroid(poly);
  function settle(x,z){
    var p = lifePushToWater(x,z); x=p[0]; z=p[1];
    for(var i=0; i<14 && (!pointInPoly(x,z,poly) || terrainH(x,z) > -1.5); i++){
      x += (centroid[0]-x)*0.35; z += (centroid[1]-z)*0.35;
      var p2 = lifePushToWater(x,z); x=p2[0]; z=p2[1];
    }
    return [x,z];
  }
  var LEGS_N = 11;   /* 9 interior control points + the 2 anchors */
  var waypoints = [[ax,az]];
  for(var wi=1; wi<LEGS_N-1; wi++){
    waypoints.push(settle.apply(null, lifeMix([ax,az],[bx,bz], wi/(LEGS_N-1))));
  }
  waypoints.push([bx,bz]);
  for(var round=0; round<40; round++){
    var curve = lifeCurveFromCentripetal(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<160; s++){
      var st = s/160, p3 = curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p3.x, p3.z);
      if(blocked){
        worstT = st;
        worstFix = [blocked[0].x + blocked[1]*blocked[3]*1.25, blocked[0].z + blocked[2]*blocked[3]*1.25];
        break;
      }
      var pierFix = lifePierOrBridgeBlocked(p3.x, p3.z);
      if(pierFix){
        worstT = st;
        worstFix = pierFix;
        break;
      }
      if(!pointInPoly(p3.x, p3.z, poly) || terrainH(p3.x, p3.z) > -1.5){
        /* the polygon is hand-traced water, but a stray sliver of shallow
           bank or a marsh edge inside it is still real dry-ish ground —
           checked separately from the containment test above, since
           satisfying one doesn't guarantee the other. Real gap measured
           directly (verify.py-style: sampled 60 ramble curves, checked
           every point): a flat "pull 40% toward the polygon's overall
           centroid" is the wrong fix for a point actually sitting on
           real land at a sharp concave notch — the centroid can be
           thousands of units away, in effectively a random direction
           relative to the nearby shoreline, occasionally landing the
           pushed point on MORE land. lifePushToWater already solves the
           local case correctly (real gradient descent off the nearest
           land, not a guess), so try that first and only fall back to
           the centroid pull if the point is technically outside the
           hand-drawn boundary despite already being clear of real land. */
        var fix = lifePushToWater(p3.x, p3.z);
        if(!pointInPoly(fix[0], fix[1], poly)){
          fix = [fix[0] + (centroid[0]-fix[0])*0.4, fix[1] + (centroid[1]-fix[1])*0.4];
        }
        worstT = st;
        worstFix = fix;
        break;
      }
    }
    if(worstT < 0) return curve;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt = w2/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w2; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFromCentripetal(waypoints);
}
var LIFE_PBARGE_LEN = 26, LIFE_PBARGE_BEAM = 10;
var lifePBargeHullParts = [
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM, 3.2, LIFE_PBARGE_LEN),
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.85, 0.6, LIFE_PBARGE_LEN*0.92).translate(0, 2.5, 0),
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.7, 2.6, LIFE_PBARGE_LEN*0.36).translate(0, 4.1, -LIFE_PBARGE_LEN*0.18),
  new THREE.CylinderGeometry(0.22, 0.22, 10, 6).translate(0, 8.0, LIFE_PBARGE_LEN*0.14)
];
var lifePBargeHullGeo = lifeMergeGeoms(lifePBargeHullParts);
var lifePBargeHullMesh = new THREE.InstancedMesh(lifePBargeHullGeo, new THREE.MeshLambertMaterial({ color: 0xc9a227 }), 1);
var lifePBargeSailGeo = new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.9, 7, 0.2).translate(0, 9.5, LIFE_PBARGE_LEN*0.14);
var lifePBargeSailMesh = new THREE.InstancedMesh(lifePBargeSailGeo, new THREE.MeshLambertMaterial({ color: 0x6a2f8a }), 1);
lifePBargeHullMesh.userData.inspectLabel = 'Palace barge hull'; lifePBargeSailMesh.userData.inspectLabel = 'Palace barge sail';
[lifePBargeHullMesh, lifePBargeSailMesh].forEach(function(m){ m.userData.life = true; m.frustumCulled = false; scene.add(m); });

/* real bug the owner caught: lifeBuildLeg's own land-avoidance
   (lifePushToWater) is a cheap gradient nudge, not a real solver — over
   the long, irregular hops the open-bay ramble picked (random points up
   to 900/700 units from LIFE_BAY_CENTER) it would happily leave a
   mid-curve control point sitting on dry ground, with nothing after the
   fact ever re-checking the finished curve against LAND at all (the
   refinement loop only ever re-checks CANTONS). The owner traced their
   own polygon of confirmed-safe water for this barge to ramble inside —
   first vertex is the dock tip itself — so use that directly instead of
   trying to harden the generic heuristic: every ramble destination is
   rejection-sampled to already be inside it, and the curve-refinement
   loop below additionally kicks out any sampled point that drifts
   outside it, the same way it already kicks out canton intrusions. */
var LIFE_PBARGE_ZONE = [[922.6,-1027.1],[878.9,-1010.1],[792.1,-1116.4],[662.5,-985.9],[511.1,-1145.6],[396.1,-1125.4],[334.8,-1015.0],[452.6,-863.5],[537.0,-760.3],[479.2,-523.4],[266.3,-510.9],[197.7,-155.2],[-25.5,-119.2],[-68.1,-60.6],[-68.9,329.6],[-157.2,430.7],[-555.8,433.0],[-585.1,476.9],[-579.8,648.1],[-925.7,647.9],[-899.3,299.4],[-442.4,65.8],[-262.2,-93.5],[-139.0,-375.7],[-31.3,-562.3],[-53.6,-993.8],[-1148.9,-853.3],[-1171.3,-1064.2],[-1031.3,-1218.6],[-1186.8,-1364.0],[-1322.4,-1238.6],[-1569.5,-1190.7],[-2608.7,-2131.5],[-2388.6,-3208.4],[-1413.9,-3957.5],[-177.5,-2347.5],[-414.8,-2110.5],[-268.4,-1917.3],[-67.6,-2085.5],[-73.6,-2238.7],[-1358.6,-3982.6],[292.2,-4766.0],[1136.5,-4586.7],[1978.4,-3134.7],[1761.1,-2777.5],[1412.0,-2530.9],[1474.5,-2375.2],[1648.9,-2469.4],[1867.0,-2727.0],[2003.6,-2872.7],[2293.0,-1966.8],[2132.4,-1573.7],[1708.7,-1240.6],[1219.8,-1709.2],[983.9,-1652.3],[748.4,-1768.4],[599.1,-1601.0],[736.6,-1488.8],[772.5,-1272.9],[906.5,-1162.8]];
var LIFE_PBARGE_DOCK = { x: LIFE_PBARGE_ZONE[0][0], z: LIFE_PBARGE_ZONE[0][1] };
(function(){
  var c = lifePolyCentroid(LIFE_PBARGE_ZONE);
  LIFE_PBARGE_DOCK.ry = Math.atan2(c[0]-LIFE_PBARGE_DOCK.x, c[1]-LIFE_PBARGE_DOCK.z);
})();
LIFE_BARGES.push({
  kind: 'pleasure', state: 'docked', x: LIFE_PBARGE_DOCK.x, z: LIFE_PBARGE_DOCK.z, ry: LIFE_PBARGE_DOCK.ry,
  speed: rr(7,9), stateT: 0, passengers: 0, target: ri(10,20)
});
window._barges = { count: LIFE_BARGES.length };
window._lifeBarges = LIFE_BARGES;         /* diagnostic: full state incl. .home/.curve */
window._rbargeDocks = LIFE_RBARGE_DOCKS;
window._pbarge = { zone: LIFE_PBARGE_ZONE, dock: LIFE_PBARGE_DOCK,
  randomPoint: lifePolyRandomPoint, buildLeg: lifeBuildLegInPoly };   /* diagnostic */

/* ---- shared people for every barge above: river-barge crew (3, always
   visible, never change) plus the pleasure barge's 3 crew + up to 20
   partiers. Same merged person geometry the ferries use (lifeMergeGeoms
   is reused, not the ferry InstancedMesh itself — that one's already
   built at a fixed size); own InstancedMesh so it can be sized for this
   group specifically without touching the ferries' own count. */
var LIFE_BARGE_PEOPLE_PER_RIVER = 3, LIFE_BARGE_PEOPLE_PER_PLEASURE = 23;   /* 3 crew + up to 20 partiers */
var LIFE_BARGE_PEOPLE_TOTAL = LIFE_RBARGE_N*LIFE_BARGE_PEOPLE_PER_RIVER + LIFE_BARGE_PEOPLE_PER_PLEASURE;
var lifeBargePeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_BARGE_PEOPLE_TOTAL);
lifeBargePeopleMesh.userData.life = true; lifeBargePeopleMesh.userData.inspectLabel = 'Barge crew';
lifeBargePeopleMesh.frustumCulled = false;
scene.add(lifeBargePeopleMesh);
/* river-barge crew seats: fixed, all 3 always shown. Pleasure-barge seats:
   3 crew (bow/stern/tiller) then up to 20 partiers scattered on deck —
   generated once, not hand-typed 20 times. */
var LIFE_RBARGE_SEATS = [ [0, -LIFE_RBARGE_LEN*0.30], [-2.5, 3], [2.5, 3] ];
var LIFE_PBARGE_SEATS = [ [0, -LIFE_PBARGE_LEN*0.40], [-2.6, -LIFE_PBARGE_LEN*0.05], [2.6, -LIFE_PBARGE_LEN*0.05] ];
for(var lp=0; lp<20; lp++){
  var lpa = (lp/20)*Math.PI*2;
  LIFE_PBARGE_SEATS.push([ Math.cos(lpa)*LIFE_PBARGE_BEAM*0.36, Math.sin(lpa)*LIFE_PBARGE_LEN*0.34 ]);
}

var lifeBargeTmpPos = new THREE.Vector3(), lifeBargeTmpPos2 = new THREE.Vector3(), lifeBargeTmpDir = new THREE.Vector3();
var lifeBargeTmpQuat = new THREE.Quaternion(), lifeBargeTmpMat = new THREE.Matrix4();
var lifeBargeTmpScale1 = new THREE.Vector3(1,1,1), lifeBargeTmpScale0 = new THREE.Vector3(0,0,0);
function lifePlaceBargePeople(baseIdx, seats, visibleCount, pos, yaw, deckY){
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  for(var s=0; s<seats.length; s++){
    if(s < visibleCount){
      var seat = seats[s];
      var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
      var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
      lifeBargeTmpPos2.set(wx, deckY, wz);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
    }else{
      lifeBargeTmpMat.compose(lifeBargeTmpPos2.set(0,0,0), lifeBargeTmpQuat, lifeBargeTmpScale0);
    }
    lifeBargePeopleMesh.setMatrixAt(baseIdx+s, lifeBargeTmpMat);
  }
}
/* local-avoidance arrays (lifeAvoidNudge is defined up near updateLife —
   see the file-level comment left where this block USED to sit, in the
   ferry section, for why the sizing happens down here instead). Every
   population that steers at runtime gets a slot range: canoes, ferries,
   ships, the pleasure barge, river barges. Priority tiers (see
   lifeAvoidGiveWay near lifeAvoidNudge): canoe 1 (yields most), ferry 2,
   ship/barge 3 — the owner: "make sure [the pleasure barge] and the
   river barges have FULL collision detection and avoidance... put them
   in the highest right of way like the sailing ships." Plus one more
   tier above all of them: BRIDGE_SUPPORTS (50-cantons.js, real bridge
   pylons standing in open water) get their own STATIC slots at priority
   5 — an immovable pylon should always win a give-way negotiation against
   literally everything, ships included, not just canoes/ferries. This
   is also the only avoidance ANY river barge gets against a bridge
   support: lifeRiverCurve (below) just follows the channel centreline
   with no obstacle-awareness of its own, and a bridge's single central
   pylon (span(), 50-cantons.js) sits almost exactly on that centreline —
   this real-time nudge is what actually keeps a barge off it, not the
   route. */
var LIFE_AVOID_CANOE0 = 0, LIFE_AVOID_FERRY0 = LIFE_N, LIFE_AVOID_SHIP0 = LIFE_N + LIFE_FERRY_N;
/* LIFE_SHIP_HULL_N, not LIFE_SHIP_N: the ship block is LIFE_SHIPS' own
   pool plus one trailing slot for the Fortress coast guard (LIFE_SHIP_CG_IDX),
   so it gets the same priority-3 right of way every other big hull has. */
var LIFE_AVOID_PBARGE0 = LIFE_AVOID_SHIP0 + LIFE_SHIP_HULL_N;
var LIFE_AVOID_RBARGE0 = LIFE_AVOID_PBARGE0 + 1;
var LIFE_AVOID_OBST0 = LIFE_AVOID_RBARGE0 + LIFE_RBARGE_N;
var LIFE_AVOID_N = LIFE_AVOID_OBST0 + BRIDGE_SUPPORTS.length;
var LIFE_AVOID_X = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_Z = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_R = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_PRIORITY = new Float32Array(LIFE_AVOID_N);
(function(){
  for(var i=0;i<LIFE_N;i++){ LIFE_AVOID_R[LIFE_AVOID_CANOE0+i] = 3.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_CANOE0+i] = 1; }
  for(var j=0;j<LIFE_FERRY_N;j++){ LIFE_AVOID_R[LIFE_AVOID_FERRY0+j] = 9.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_FERRY0+j] = 2; }
  for(var k=0;k<LIFE_SHIP_HULL_N;k++){ LIFE_AVOID_R[LIFE_AVOID_SHIP0+k] = 17.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_SHIP0+k] = 3; }
  LIFE_AVOID_PRIORITY[LIFE_AVOID_PBARGE0] = 3;   /* radius set per-frame in updateBarges (pleasure barge has no fixed LEN/BEAM consts) */
  for(var r=0;r<LIFE_RBARGE_N;r++){ LIFE_AVOID_R[LIFE_AVOID_RBARGE0+r] = 15.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_RBARGE0+r] = 3; }
  for(var o=0;o<BRIDGE_SUPPORTS.length;o++){
    var bs = BRIDGE_SUPPORTS[o];
    LIFE_AVOID_X[LIFE_AVOID_OBST0+o] = bs.x; LIFE_AVOID_Z[LIFE_AVOID_OBST0+o] = bs.z;
    LIFE_AVOID_R[LIFE_AVOID_OBST0+o] = bs.r; LIFE_AVOID_PRIORITY[LIFE_AVOID_OBST0+o] = 5;
  }
})();
window._avoidDebug = { X:LIFE_AVOID_X, Z:LIFE_AVOID_Z, R:LIFE_AVOID_R, P:LIFE_AVOID_PRIORITY,
  canoe0:LIFE_AVOID_CANOE0, ferry0:LIFE_AVOID_FERRY0, ship0:LIFE_AVOID_SHIP0,
  pbarge0:LIFE_AVOID_PBARGE0, rbarge0:LIFE_AVOID_RBARGE0, obst0:LIFE_AVOID_OBST0,
  obstN: BRIDGE_SUPPORTS.length, n: LIFE_AVOID_N };   /* diagnostic */
/* anticipatory-turn tuning for ferries (updateFerries) — see the comment
   at its avoidance block. Lookahead is roughly 1.5s of travel at a
   ferry's typical speed (8-11/s), and the turn rate is fast enough to
   read as a deliberate course correction within that window without
   snapping the hull instantly onto the new heading. */
var LIFE_AVOID_LOOKAHEAD = 16;
var LIFE_FERRY_TURN_RATE = 1.4;
/* same idea for ships — sensed farther ahead (bigger, needs more warning)
   and turning much slower (a loaded hull doesn't snap onto a heading). */
var LIFE_SHIP_AVOID_R = 17.0;
var LIFE_SHIP_LOOKAHEAD = 30;
var LIFE_SHIP_TURN_RATE = 0.6;
/* barges: river barges are ship-sized (LEN 50) but poled/towed, not
   sailed — slower, more ponderous turning than even the ships. The
   pleasure barge is smaller/nimbler (LEN 26). */
var LIFE_RBARGE_AVOID_R = 15.0;
var LIFE_RBARGE_LOOKAHEAD = 28;
var LIFE_RBARGE_TURN_RATE = 0.5;
var LIFE_PBARGE_AVOID_R = 9.0;
var LIFE_PBARGE_LOOKAHEAD = 18;
var LIFE_PBARGE_TURN_RATE = 0.9;
function updateBarges(dt){
  LIFE_BARGE_T += dt;
  var riverBargeSlot = 0;
  LIFE_BARGES.forEach(function(b, bi){
    b.stateT += dt;
    var pos, yaw;
    if(b.kind === 'river'){
      /* each barge owns one dock (b.home, LIFE_RBARGE_DOCKS) and cycles
         entirely on its own timer — no shared quay-contention logic
         needed since nothing else can ever want b.home. */
      var rAvoidSlot = LIFE_AVOID_RBARGE0 + riverBargeSlot;
      if(b.state === 'docked'){
        pos = b; yaw = b.ry;
        LIFE_AVOID_X[rAvoidSlot] = b.x; LIFE_AVOID_Z[rAvoidSlot] = b.z; LIFE_AVOID_R[rAvoidSlot] = LIFE_RBARGE_AVOID_R;
        if(b.dwell === undefined) b.dwell = rr(20, 45);
        if(b.stateT >= b.dwell){
          b.curve = lifeRiverCurve(b.home.u, LIFE_RIVER_TURN_U);
          b.len = b.curve.getLength(); b.dur = Math.max(20, b.len/b.speed);
          b.state = 'departing'; b.stateT = 0;
        }
      }else if(b.state === 'away'){
        LIFE_AVOID_R[rAvoidSlot] = 0;   /* off the map — not an obstacle */
        if(LIFE_BARGE_T >= b.awayUntil){
          b.curve = lifeRiverCurve(LIFE_RIVER_TURN_U, b.home.u);
          b.len = b.curve.getLength(); b.dur = Math.max(20, b.len/b.speed);
          b.state = 'arriving'; b.stateT = 0;
        }
        lifeBargeTmpMat.compose(lifeBargeTmpPos.set(0,0,0), lifeBargeTmpQuat.identity(), lifeBargeTmpScale0);
        lifeRBargeHullMesh.setMatrixAt(bi, lifeBargeTmpMat);
        lifePlaceBargePeople(riverBargeSlot*LIFE_BARGE_PEOPLE_PER_RIVER, LIFE_RBARGE_SEATS, 0, {x:0,z:0}, 0, 0);
        riverBargeSlot++;
        return;
      }else{
        /* the owner: "make sure [river barges] have FULL collision
           detection and avoidance... highest right of way like the
           sailing ships" — same anticipatory-lookahead + turn-rate-
           limited heading fix as ships/ferries (see updateShips' own
           comment for the two problems this solves together): sensed
           from ahead of the barge, not from where it already is, and the
           render yaw comes from actual movement rather than the raw
           curve tangent so a nudge reads as steering, not sliding. This
           is the ONLY obstacle-awareness a river barge has at all — its
           route (lifeRiverCurve) just follows the channel centreline
           blind, so this is what actually keeps it off a bridge pylon. */
        var raw = Math.min(1, b.stateT/b.dur);
        var t = raw*raw*(3-2*raw);
        b.curve.getPointAt(t, lifeBargeTmpPos);
        pos = lifeBargeTmpPos;
        var tTan = Math.min(0.995, Math.max(0.005, t));
        b.curve.getTangentAt(tTan, lifeBargeTmpDir);
        var tanYawR = Math.atan2(lifeBargeTmpDir.x, lifeBargeTmpDir.z);

        var rdelta = lifeAvoidNudge2(rAvoidSlot, pos.x, pos.z, lifeBargeTmpDir.x, lifeBargeTmpDir.z, LIFE_RBARGE_AVOID_R, 14.0, LIFE_RBARGE_LOOKAHEAD, 5.0, 3);
        pos.x += rdelta[0]; pos.z += rdelta[1];
        if(b.facingYaw === undefined) b.facingYaw = tanYawR;
        if(b.lastX === undefined){ b.lastX = pos.x; b.lastZ = pos.z; }
        var mdxr = pos.x-b.lastX, mdzr = pos.z-b.lastZ;
        var moveYawR = (mdxr*mdxr+mdzr*mdzr > 1e-6) ? Math.atan2(mdxr,mdzr) : tanYawR;
        var dAngR = moveYawR - b.facingYaw;
        while(dAngR > Math.PI) dAngR -= Math.PI*2;
        while(dAngR < -Math.PI) dAngR += Math.PI*2;
        var maxStepR = LIFE_RBARGE_TURN_RATE*dt;
        b.facingYaw += Math.max(-maxStepR, Math.min(maxStepR, dAngR));
        yaw = b.facingYaw;
        b.lastX = pos.x; b.lastZ = pos.z;
        LIFE_AVOID_X[rAvoidSlot] = pos.x; LIFE_AVOID_Z[rAvoidSlot] = pos.z; LIFE_AVOID_R[rAvoidSlot] = LIFE_RBARGE_AVOID_R;

        if(raw >= 1){
          if(b.state === 'arriving'){
            b.state = 'docked'; b.x = b.home.x; b.z = b.home.z; b.ry = b.home.ry;
            b.lastArrivalTime = LIFE_BARGE_T; b.stateT = 0; b.dwell = rr(20, 45);
          }else{
            b.state = 'away'; b.stateT = 0;
            b.awayUntil = LIFE_BARGE_T + b.dur*rr(1,2.2);
          }
        }
      }
      lifeBargeTmpPos2.set(pos.x, SEA-0.3, pos.z);
      lifeBargeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
      lifeRBargeHullMesh.setMatrixAt(bi, lifeBargeTmpMat);
      /* stand crew on the main hull box's own top (h6, world SEA-0.3+3);
         SEA+0.6 (the original number) was well inside that solid box. */
      lifePlaceBargePeople(riverBargeSlot*LIFE_BARGE_PEOPLE_PER_RIVER, LIFE_RBARGE_SEATS, 3, pos, yaw, SEA+3.0);
      riverBargeSlot++;
    }else{
      /* the pleasure barge — same treatment, one slot (LIFE_AVOID_PBARGE0,
         there's only ever one of these). */
      if(b.state === 'docked'){
        pos = b; yaw = b.ry;
        LIFE_AVOID_X[LIFE_AVOID_PBARGE0] = b.x; LIFE_AVOID_Z[LIFE_AVOID_PBARGE0] = b.z; LIFE_AVOID_R[LIFE_AVOID_PBARGE0] = LIFE_PBARGE_AVOID_R;
        if(b.passengers < b.target) b.passengers = Math.min(b.target, b.passengers + dt*0.6);
        if(b.passengers >= 10 && b.stateT >= 20){
          var away = lifePolyRandomPoint(LIFE_PBARGE_ZONE);
          b.curve = lifeBuildLegInPoly(b.x, b.z, away[0], away[1], LIFE_PBARGE_ZONE);
          b.len = b.curve.getLength(); b.dur = Math.max(15, b.len/b.speed);
          b.state = 'ramble'; b.stateT = 0;
        }
      }else if(b.state === 'ramble' || b.state === 'returning'){
        var raw2 = Math.min(1, b.stateT/b.dur);
        var t2 = raw2*raw2*(3-2*raw2);
        b.curve.getPointAt(t2, lifeBargeTmpPos);
        pos = lifeBargeTmpPos;
        var tTan2 = Math.min(0.995, Math.max(0.005, t2));
        b.curve.getTangentAt(tTan2, lifeBargeTmpDir);
        var tanYawP = Math.atan2(lifeBargeTmpDir.x, lifeBargeTmpDir.z);

        var pdelta = lifeAvoidNudge2(LIFE_AVOID_PBARGE0, pos.x, pos.z, lifeBargeTmpDir.x, lifeBargeTmpDir.z, LIFE_PBARGE_AVOID_R, 10.0, LIFE_PBARGE_LOOKAHEAD, 4.0, 3);
        pos.x += pdelta[0]; pos.z += pdelta[1];
        if(b.facingYaw === undefined) b.facingYaw = tanYawP;
        if(b.lastX === undefined){ b.lastX = pos.x; b.lastZ = pos.z; }
        var mdxp = pos.x-b.lastX, mdzp = pos.z-b.lastZ;
        var moveYawP = (mdxp*mdxp+mdzp*mdzp > 1e-6) ? Math.atan2(mdxp,mdzp) : tanYawP;
        var dAngP = moveYawP - b.facingYaw;
        while(dAngP > Math.PI) dAngP -= Math.PI*2;
        while(dAngP < -Math.PI) dAngP += Math.PI*2;
        var maxStepP = LIFE_PBARGE_TURN_RATE*dt;
        b.facingYaw += Math.max(-maxStepP, Math.min(maxStepP, dAngP));
        yaw = b.facingYaw;
        b.lastX = pos.x; b.lastZ = pos.z;
        LIFE_AVOID_X[LIFE_AVOID_PBARGE0] = pos.x; LIFE_AVOID_Z[LIFE_AVOID_PBARGE0] = pos.z; LIFE_AVOID_R[LIFE_AVOID_PBARGE0] = LIFE_PBARGE_AVOID_R;

        if(raw2 >= 1){
          if(b.state === 'ramble'){
            b.curve = lifeBuildLegInPoly(pos.x, pos.z, LIFE_PBARGE_DOCK.x, LIFE_PBARGE_DOCK.z, LIFE_PBARGE_ZONE);
            b.len = b.curve.getLength(); b.dur = Math.max(15, b.len/b.speed);
            b.state = 'returning'; b.stateT = 0;
          }else{
            b.state = 'docked'; b.x = LIFE_PBARGE_DOCK.x; b.z = LIFE_PBARGE_DOCK.z; b.ry = LIFE_PBARGE_DOCK.ry;
            b.stateT = 0; b.passengers = 0; b.target = ri(10,20);
          }
        }
      }
      lifeBargeTmpPos2.set(pos.x, SEA-0.25, pos.z);
      lifeBargeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
      lifePBargeHullMesh.setMatrixAt(0, lifeBargeTmpMat);
      lifePBargeSailMesh.setMatrixAt(0, lifeBargeTmpMat);
      var pBase = LIFE_RBARGE_N*LIFE_BARGE_PEOPLE_PER_RIVER;
      /* stand on the deck plank's own top (translate(0,2.5,0), h 0.6, so
         world SEA-0.25+2.8) — same class of bug as the river-barge crew. */
      lifePlaceBargePeople(pBase, LIFE_PBARGE_SEATS, 3 + Math.floor(b.passengers), pos, yaw, SEA+3.1);
    }
  });
  lifeRBargeHullMesh.instanceMatrix.needsUpdate = true;
  lifePBargeHullMesh.instanceMatrix.needsUpdate = true;
  lifePBargeSailMesh.instanceMatrix.needsUpdate = true;
  lifeBargePeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== fishing dhows ===============================
   Owner's ask: fishing boats that "look like dhows" (a lateen-rigged Arab dhow
   — single slanted triangular sail on a forward-raked mast, narrow curved
   hull), 3 crew each, 3 per pier, working LIFE_FISH_PIERS (65-facade.js — the
   piers packed into the 4 owner-marked cove polygons via claim()). Behaviour:
   depart the home pier, pick a random spot out in the bay (north-of-the-
   cantons biased — this world's own convention, confirmed live rather than
   assumed: 30-layout.js says outright "at the CITY side (north = smaller z)"
   and "12 = north" on the bay's own clock parametrisation), travel there,
   "drop nets" (idle in place) for 15s, haul up, sail home, repeat. Structurally
   identical to the pleasure barge's own docked -> ramble -> returning loop
   just above (leave port, go to a point, wait, come back) — same curve solver
   reused (lifeCurveFromCentripetal) and the same land/canton/pier pushback
   (lifePushToWater/lifeCantonBlocked/lifePierOrBridgeBlocked), just without
   the pleasure barge's own giant hand-traced safe-water polygon: that polygon
   exists because a barge ramble can run clear across the lake through several
   concave fjords in one hop, and a short local fishing hop never goes anywhere
   near that far, so the plain land/canton/pier pushback the ships/ferries
   already use is enough on its own — see lifeBuildLegOpenWater below.

   4 draw calls total (hull+mast+fish-bin merged, sail, crew, and — added the
   pass that made the nets visible — ONE shared gear mesh carrying every
   boat's nets, cork lines and catch) — the floor BUDGET.
   drawCalls (05-palette.js) already documents every boat population paying,
   same as canoes/taxis/ships/ferries/barges before it. Sail colour varies per
   boat via BANNERC (05-palette.js's own "cloth family" palette, already used
   for banners elsewhere) using the same one-shot setColorAt trick the water
   taxis use for their per-boat hue (updateWaterTaxis' own init, above) — no
   4th draw call, no per-part independent colour, just a per-instance tint.
   Crew reuses lifePersonGeo (this file's own shared person geometry — same
   one canoes/ferries/ships/barges all mount) on a dedicated InstancedMesh,
   same reasoning lifeBargePeopleMesh got its own mesh: no existing crew mesh
   has spare capacity to grow into for free.

   No real-time mutual collision avoidance between dhows (or against other
   traffic) — same honest limitation this file's own header already states
   for canoes ("tier-1: ~30 entities, fixed/weighted routes, no runtime
   collision"): dhows are the same small-boat tier, and wiring a new
   population into the shared LIFE_AVOID_* arrays (sized once, near the
   pleasure barge above, and read by several other systems) is real risk for
   a population this size isn't worth buying; the curve itself already steers
   clear of land, cantons and every pier. */
reseed(786217);
/* owner: "make the fishing boats a little bigger so you can see a little bin
   where they load up with fish". ONE scale constant drives the whole model
   (hull, beam, mast, sail — the sail geometry is derived from these same
   constants, so it follows for free), because everything that has to be
   re-tuned for a size change is downstream of it: the mooring slots along
   each pier (LIFE_FISH_BOATS below) and the net/bin gear rig. 1.35x is what
   the piers actually hold: the hull's real footprint is 1.18*LEN (stern at
   -0.51*LEN, prow tip at +0.67*LEN), and three boats moored in a row down
   one flank of a 38-unit pier only have ~13.7 units of slot spacing — which
   the OLD 12-long hull already overran (14.2 > 13.7, boats overlapping at
   their moorings before this pass touched anything). Fixed properly here by
   berthing the middle boat on the pier's other flank (LIFE_FISH_BOATS), the
   way the ShoalBank jetty already berths both its own sides, which takes
   same-flank spacing to 0.66*38 = 25.1 — comfortably clear of a 19.1-unit
   hull. Vertical scales with it too, so the boat grows as a boat rather than
   stretching into a plank; the deck line barely moves (both hull boxes are
   centred at -0.65*S with a height of ~1.28*S, so their tops stay within a
   few hundredths of local y=0) and the crew mount height is unchanged. */
var LIFE_DHOW_SCALE = 1.35;
var LIFE_DHOW_LEN = 12*LIFE_DHOW_SCALE, LIFE_DHOW_BEAM = 3.0*LIFE_DHOW_SCALE;
var LIFE_DHOW_HULL_COL = 0x8a6b45;
var LIFE_DHOW_MAST_H = 7.0*LIFE_DHOW_SCALE, LIFE_DHOW_MAST_Z = LIFE_DHOW_LEN*0.16;
var LIFE_DHOW_MAST_RAKE = 0.26;           /* forward rake — rotateX tilts the mast's TOP toward +Z (the bow), a genuine fore-aft lean, not the sideways rotateZ tilt the junk's own masts use (78-life.js's junk section rotates around Z, which leans a mast in the BEAM direction — fine for that hull's own silhouette, but a lateen rig's rake is specifically fore-and-aft, so this uses the axis that actually produces that). */
var LIFE_DHOW_MAST_BASE_Y = 0.65*LIFE_DHOW_SCALE;
/* the fish bin — "a little bin where they load up with fish for the trip
   back, and unload at the docks". The BIN ITSELF is static relative to the
   hull, so it merges straight into lifeDhowHullGeo and costs nothing but
   triangles; only its CONTENTS move, and those ride the shared gear mesh
   below with the nets. Sited hard against the STARBOARD rail, not amidships,
   for two reasons that are both geometric rather than stylistic: the lateen
   sail is a zero-thickness plane at local x=0 whose foot sweeps the deck
   from z=+LEN*0.16+1 back to z=-LEN*0.42 at y~1.0, so anything centred on
   the deck taller than about 0.9 renders through the sail; and a boat moored
   alongside always has the pier off its local +X (local +X maps to world
   -perp, and every mooring slot below sits at +perp from its pier), so a
   starboard bin is the side the unloading crewman actually faces. */
/* bin centre: set so the OUTER wall lands exactly on the starboard gunwale's
   own inner face (BEAM*0.50 - half the 0.12*S trim), i.e. the bin is built
   against the rail rather than floating in the middle of the deck */
var LIFE_DHOW_BIN_X = (3.0*0.50 - 0.12*0.5 - 1.20*0.5)*LIFE_DHOW_SCALE;
var LIFE_DHOW_BIN_W = 1.20*LIFE_DHOW_SCALE;   /* across the boat, outer wall to outer wall */
var LIFE_DHOW_BIN_L = LIFE_DHOW_LEN*0.32;     /* fore-and-aft */
var LIFE_DHOW_BIN_Z = -LIFE_DHOW_LEN*0.20;
var LIFE_DHOW_BIN_H = 0.78*LIFE_DHOW_SCALE;   /* wall height above the deck */
var LIFE_DHOW_BIN_T = 0.11*LIFE_DHOW_SCALE;   /* plank thickness */
var LIFE_DHOW_BIN_COL = shade(LIFE_DHOW_HULL_COL,-0.26);
var lifeDhowHullParts = [
  /* narrow hull, two segments (not one uniform box) so the beam actually
     tapers toward both ends instead of reading as a plank */
  { geo: SHAPES.box().scale(LIFE_DHOW_BEAM*0.82, 1.25*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.46).translate(0,-0.65*LIFE_DHOW_SCALE,-LIFE_DHOW_LEN*0.28), color: LIFE_DHOW_HULL_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BEAM, 1.32*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.50).translate(0,-0.65*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.11), color: LIFE_DHOW_HULL_COL },
  /* curved, upswept prow — the single most dhow-like silhouette cue along
     with the sail; same 4-sided-cone wedge trick the junk's own sharp bow
     uses (its own section, above), seamed to THIS hull's own front edge */
  { geo: new THREE.ConeGeometry(1, LIFE_DHOW_LEN*0.32, 4).rotateX(Math.PI/2)
          .scale(LIFE_DHOW_BEAM*0.40, 1.15*LIFE_DHOW_SCALE, 1).translate(0, 0.25*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.36+LIFE_DHOW_LEN*0.15),
    color: LIFE_DHOW_HULL_COL },
  /* thin gunwale trim, both sides */
  { geo: SHAPES.box().scale(0.12*LIFE_DHOW_SCALE, 0.30*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.70).translate( LIFE_DHOW_BEAM*0.50, 0.10*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.04), color: shade(LIFE_DHOW_HULL_COL,-0.18) },
  { geo: SHAPES.box().scale(0.12*LIFE_DHOW_SCALE, 0.30*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.70).translate(-LIFE_DHOW_BEAM*0.50, 0.10*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.04), color: shade(LIFE_DHOW_HULL_COL,-0.18) },
  /* the single forward-raked mast */
  { geo: SHAPES.cyl().scale(0.13*LIFE_DHOW_SCALE, LIFE_DHOW_MAST_H, 0.13*LIFE_DHOW_SCALE).rotateX(LIFE_DHOW_MAST_RAKE).translate(0, LIFE_DHOW_MAST_BASE_Y, LIFE_DHOW_MAST_Z), color: shade(LIFE_DHOW_HULL_COL,-0.30) },
  /* the fish bin: floor + four walls, open-topped, so the catch inside it
     (shared gear mesh, below) is genuinely visible over the rim */
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X-LIFE_DHOW_BIN_W*0.5+LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X+LIFE_DHOW_BIN_W*0.5-LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_T).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z+LIFE_DHOW_BIN_L*0.5-LIFE_DHOW_BIN_T*0.5), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_T).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z-LIFE_DHOW_BIN_L*0.5+LIFE_DHOW_BIN_T*0.5), color: LIFE_DHOW_BIN_COL }
];
var lifeDhowHullGeo = lifeMergeGeoms(lifeDhowHullParts);
var LIFE_DHOW_N = LIFE_FISH_PIERS.length * 3;   /* "3 boats per pier", however many piers actually fit */
var lifeDhowHullMesh = new THREE.InstancedMesh(lifeDhowHullGeo, new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), Math.max(1,LIFE_DHOW_N));
lifeDhowHullMesh.userData.life = true; lifeDhowHullMesh.userData.inspectLabel = 'Fishing dhow hull';
lifeDhowHullMesh.frustumCulled = false; scene.add(lifeDhowHullMesh);
/* the lateen sail: one real triangle (not a rectangle like the junk's own
   battened lugsail) — a single slanted panel hung aft of the raked mast, the
   owner's own explicit reference. Both faces wound (front+back) so it reads
   correctly from either side without relying on a material-side flag. Baked
   pure white so a per-instance setColorAt (below) drives the actual colour —
   the same one-shot tint trick the water taxis already use for their own
   per-boat hue, just simpler here (the sail is the ENTIRE geometry, so no
   part needs to stay a fixed colour the way the taxi's wood hull does). */
function lifeDhowSailGeo(){
  var mastTopY = LIFE_DHOW_MAST_BASE_Y + LIFE_DHOW_MAST_H*Math.cos(LIFE_DHOW_MAST_RAKE);
  var mastTopZ = LIFE_DHOW_MAST_Z + LIFE_DHOW_MAST_H*Math.sin(LIFE_DHOW_MAST_RAKE);
  var peak = [0, mastTopY*0.93, mastTopZ - LIFE_DHOW_LEN*0.30];   /* the yard's own peak — aft and high, exactly how a lateen yard crosses its mast */
  var tack = [0, LIFE_DHOW_MAST_BASE_Y+0.25, LIFE_DHOW_MAST_Z + 1.0];
  var clew = [0, LIFE_DHOW_MAST_BASE_Y+0.45, LIFE_DHOW_MAST_Z - LIFE_DHOW_LEN*0.58];
  var pos = [ peak[0],peak[1],peak[2], tack[0],tack[1],tack[2], clew[0],clew[1],clew[2],
              peak[0],peak[1],peak[2], clew[0],clew[1],clew[2], tack[0],tack[1],tack[2] ];
  var uv = [0,1, 0,0, 1,0,  0,1, 1,0, 0,0];
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}
var lifeDhowSailGeoObj = lifeDhowSailGeo();
var lifeDhowSailMesh = new THREE.InstancedMesh(lifeDhowSailGeoObj, new THREE.MeshLambertMaterial({ color:0xffffff, side:THREE.DoubleSide }), Math.max(1,LIFE_DHOW_N));
lifeDhowSailMesh.userData.life = true; lifeDhowSailMesh.userData.inspectLabel = 'Fishing dhow sail';
lifeDhowSailMesh.frustumCulled = false; scene.add(lifeDhowSailMesh);
/* crew: 3 per boat, always shown (never toggled off) — own InstancedMesh,
   same reasoning as lifeBargePeopleMesh (no existing crew mesh has spare
   capacity to grow into). Seats: one forward lookout, one amidships at the
   nets, one aft at the steering oar.
   Both after-seats moved to PORT (local -x) this pass: the fish bin now
   occupies the starboard side of the after deck, and the old aft seat
   ([0.5, -LEN*0.34]) sat inside it. */
var LIFE_DHOW_SEATS = [ [0, LIFE_DHOW_LEN*0.30], [-0.55*LIFE_DHOW_SCALE, -0.15], [-0.52*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.34] ];
var lifeDhowCrewMesh = new THREE.InstancedMesh(lifePersonGeo, new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), Math.max(1,LIFE_DHOW_N*3));
lifeDhowCrewMesh.userData.life = true; lifeDhowCrewMesh.userData.inspectLabel = 'Dhow crew';
lifeDhowCrewMesh.frustumCulled = false; scene.add(lifeDhowCrewMesh);

/* ---------------------------- the working gear ----------------------------
   Owner: "does the fishing dhow have a net animation? when it gets to its
   fishing spot i don't see much change" — it did not; the state machine was
   real but nothing on the boat moved. Everything that now moves rides ONE
   shared InstancedMesh over ONE unit box, which is the mill-rotor rig's own
   pattern (65-facade.js MILL_CLUSTERS: a single unit bar drives every sail
   and water wheel in the city for one draw call) rather than a fourth
   pattern invented here. Five slots per boat, 5*45 = 225 instances, +1 draw
   call total for the whole fleet:
     0,2  net panel, port and starboard  — a dark skirt that lies rolled on
          the rail when stowed and swings out and down into the water when
          shot, driven by one 0..1 deploy parameter that lerps its x offset,
          its top and bottom edges, its thickness and its length at once.
     1,3  cork/float line, port and starboard — a pale bar that is a coil on
          the rail when stowed and a long line lying ON the water surface,
          outboard of the net, when shot. This is the part that actually
          reads at distance: two bright lines on the water either side of a
          hull is the unmistakable silhouette of a net being worked, where a
          dark panel against dark water is not.
     4    the catch in the fish bin — a box that grows out of the bin as the
          nets come up and shrinks to nothing as the boat unloads.
   Why the net has to stay ABOVE the waterline: the water (75-terrain.js) is
   a transparent ShaderMaterial whose alpha runs 0.72 shallow to 0.96 deep,
   and renderOrder 2 puts it after these opaque meshes — so anything hung
   more than a few tenths below SEA at a real fishing spot (terrainH <= -2.5
   by lifeFishingSpot's own test, usually 15-20 deep) is drawn and then
   painted over at 96% opacity, i.e. invisible. The net therefore hangs from
   a spar above the rail down to just under the surface, and the visible
   cue is the part a viewer on the shore would actually see anyway. */
var LIFE_DHOW_GEAR_PER = 5;
var lifeDhowGearGeo = new THREE.BoxGeometry(1,1,1);
var lifeDhowGearMesh = new THREE.InstancedMesh(lifeDhowGearGeo, new THREE.MeshLambertMaterial({ color:0xffffff }), Math.max(1,LIFE_DHOW_N*LIFE_DHOW_GEAR_PER));
lifeDhowGearMesh.userData.life = true; lifeDhowGearMesh.userData.inspectLabel = 'Dhow nets and catch';
lifeDhowGearMesh.frustumCulled = false; scene.add(lifeDhowGearMesh);
/* .convertSRGBToLinear() on every one of these: the static bake does it in
   emitBuckets() (45-kit.js) and this layer does not, so a raw palette hex
   here renders visibly washed out next to the same colour on a building —
   SUBAGENT.md's own third instance-colour trap. */
var LIFE_DHOW_NET_COL   = 0x39453b;   /* wet, weed-stained netting */
var LIFE_DHOW_FLOAT_COL = 0xd9c7a0;   /* cork floats, bleached rope */
var LIFE_DHOW_CATCH_COL = 0xa9bcbe;   /* a heap of wet silver fish */

/* short local leg — lifeBuildLegInPoly's own twin (see this section's header
   comment for why the polygon test is dropped): same waypoint layout, same
   refinement loop against cantons/land/piers, just without a containment
   test against a hand-traced zone. */
function lifeBuildLegOpenWater(ax,az,bx,bz){
  function settle(x,z){
    var p = lifePushToWater(x,z); x=p[0]; z=p[1];
    for(var i=0;i<6;i++){
      var pb = lifePierOrBridgeBlocked(x,z);
      if(!pb) break;
      x=pb[0]; z=pb[1];
      var p2 = lifePushToWater(x,z); x=p2[0]; z=p2[1];
    }
    return [x,z];
  }
  var LEGS_N = 7;
  var waypoints = [[ax,az]];
  for(var wi=1; wi<LEGS_N-1; wi++) waypoints.push(settle.apply(null, lifeMix([ax,az],[bx,bz], wi/(LEGS_N-1))));
  waypoints.push([bx,bz]);
  var curve = lifeCurveFromCentripetal(waypoints);
  for(var round=0; round<20; round++){
    var worstT=-1, worstFix=null;
    for(var s=1;s<80;s++){
      var st=s/80, p3=curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p3.x,p3.z);
      if(blocked){ worstT=st; worstFix=[blocked[0].x+blocked[1]*blocked[3]*1.25, blocked[0].z+blocked[2]*blocked[3]*1.25]; break; }
      var pierFix = lifePierOrBridgeBlocked(p3.x,p3.z);
      if(pierFix){ worstT=st; worstFix=pierFix; break; }
      if(terrainH(p3.x,p3.z) > -1.5){ worstT=st; worstFix=lifePushToWater(p3.x,p3.z); break; }
    }
    if(worstT<0) return curve;
    var nearestIdx=1, nearestD=Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt=w2/(waypoints.length-1), dT=Math.abs(wt-worstT);
      if(dT<nearestD){ nearestD=dT; nearestIdx=w2; }
    }
    waypoints[nearestIdx]=worstFix;
    curve = lifeCurveFromCentripetal(waypoints);
  }
  return curve;
}
/* a random bay spot to fish at, biased north (smaller z, this world's own
   "north" — see this section's header comment) by blending each candidate
   bearing toward the fixed north vector (0,-1) before sampling a distance
   along it; the northmost of several tries is kept for a real, checkable
   bias rather than a token nudge. Rejects canton platforms and anything not
   comfortably real open water (terrainH), same tests the pleasure barge's
   own ramble destination and every canoe leg already apply. */
function lifeFishingSpot(homeX, homeZ){
  var best=null, bestZ=Infinity;
  for(var tries=0; tries<6; tries++){
    var ang = rr(0, Math.PI*2);
    var dx = Math.cos(ang), dz = Math.sin(ang);
    var northBias = 0.62;
    dx = mix(dx, 0, northBias); dz = mix(dz, -1, northBias);
    var L = Math.hypot(dx,dz) || 1; dx/=L; dz/=L;
    var dist = rr(160, 420);
    var cx = homeX + dx*dist, cz = homeZ + dz*dist;
    var p = lifePushToWater(cx,cz);
    /* the endpoint itself needs the SAME pier/bridge clearance the curve's
       own mid-route points already get in lifeBuildLegOpenWater — a real
       bug caught by screenshot: without this, a chosen fishing spot could
       land right under an existing harbour/ferry pier deck (60-land.js
       PIERS, 65-facade.js's own ferry stops), which the route-refinement
       loop only ever samples up to t~0.9875, never the literal endpoint. */
    for(var pb=0; pb<5; pb++){
      var fix = lifePierOrBridgeBlocked(p[0],p[1]);
      if(!fix) break;
      p = lifePushToWater(fix[0], fix[1]);
    }
    if(lifeCantonBlocked(p[0],p[1])) continue;
    if(lifePierOrBridgeBlocked(p[0],p[1])) continue;
    if(terrainH(p[0],p[1]) > -2.5) continue;
    if(p[1] < bestZ){ bestZ = p[1]; best = p; }
  }
  return best || lifePushToWater(homeX, homeZ - 220);
}

var LIFE_FISH_BOATS = [];
(function(){
  /* 3 mooring slots per pier. Re-tuned for the 1.35x hull (LIFE_DHOW_SCALE):
     the old [0.20,0.56,0.92] down ONE flank gave 0.36*38 = 13.7 units of
     spacing for a hull whose real footprint was already 14.2 — the boats
     overlapped at their moorings before this pass, and at 19.1 they would
     have overlapped badly. The middle boat now berths on the pier's other
     flank (slotSide below), exactly as the ShoalBank jetty already berths
     both of its own sides, which takes SAME-flank spacing to 0.66*38 = 25.1
     against a 19.1 hull — a real 6-unit gap — while fore-and-aft neighbours
     never share a side at all. Lateral room for the second flank is
     measured, not assumed: the nearest other pier centreline to a point 8
     units off any pier's beam is 25.6 (ShoalBank) to 64 (CoveFortress), and
     a moored dhow's outboard edge sits 10.0 from its own pier's centreline.
     Slot 0 stays at 0.25 rather than creeping further landward because a
     stern reaches 0.51*LEN behind its slot, and 0.25*38 - 9.9 = -0.4 already
     puts it level with the start of the pier's always-wet seaward 38. */
  var slotT = [0.25, 0.58, 0.91];
  var slotSide = [1, -1, 1];
  LIFE_FISH_PIERS.forEach(function(pier){
    var perpX = -pier.dirZ, perpZ = pier.dirX;
    var lateral = pier.w*0.5 + LIFE_DHOW_BEAM*0.5 + 1.2;
    var ry = Math.atan2(pier.dirX, pier.dirZ);          /* facing straight out, same heading as departure */
    slotT.forEach(function(t, si){
      var side = slotSide[si];
      /* slots are measured back from the SEAWARD end, not forward from the
         root: a shore pier is now rooted as far landward as it needs to be
         to actually reach dry ground (65-facade.js), so measuring forward
         from the root would walk the mooring slots up onto the beach. The
         seaward LIFE_FISHDOCK_LEN of every pier is the part that is always
         in real water, which is the part a dhow can tie to. */
      var pierLen = pier.len || LIFE_FISHDOCK_LEN;
      var alongLen = (pierLen - LIFE_FISHDOCK_LEN) + LIFE_FISHDOCK_LEN * t;
      /* That claim — the seaward LIFE_FISHDOCK_LEN is always real water — is
         now TRUE in all four zones, and is checkable: window._fishDocks
         .moorReport() samples every hull footprint here against terrainH and
         reports 0 of 45 over beach (it was 13 of 45: CoveWest 12, CoveEast
         1). It was not true when the 1.35x hull landed, because the CoveWest
         chord and CoveEast's first pier are hand-marked INLAND of the real
         waterline — measured, 4 to 32 units up the beach, not the 10-15 an
         earlier probe read off the centreline alone.
         Fixed where a pier root can actually move, in buildFishDockZone()
         (65-facade.js): it now walks a root SEAWARD to the first place whose
         whole berth band is water before doing its old landward walk for the
         deck. NOT fixed here by walking each SLOT seaward — that was tried,
         and it is the wrong level: these shorelines run oblique to the
         chords, so a laterally-offset stern is still on land well after the
         centreline is wet, the walk ran to its cap and same-flank spacing
         collapsed from 25.1 to 7.1, i.e. a real hull collision traded for a
         cosmetic one. Because the fix moves the DATUM (pier.len -
         LIFE_FISHDOCK_LEN) rather than the slots, this layout is untouched
         by it: same-flank spacing is still a measured 25.1 against a 19.12
         hull span in every zone, before and after. */
      var rx = pier.x0 + pier.dirX*alongLen + perpX*lateral*side;
      var rz = pier.z0 + pier.dirZ*alongLen + perpZ*lateral*side;
      LIFE_FISH_BOATS.push({
        home: { x:rx, z:rz, ry:ry }, pier: pier, moorSide: side,
        state:'docked', x:rx, z:rz, ry:ry, stateT: rr(0,14), dwell: rr(6,20),
        speed: rr(5.5,7.5), sailCol: pick(BANNERC),
        net: 0, catch: 0, unloadFrom: 0   /* 0..1 net deploy and bin fill, driven by updateFishBoats */
      });
    });
  });
  LIFE_DHOW_N = LIFE_FISH_BOATS.length;   /* == LIFE_FISH_PIERS.length*3 always, recorded here for clarity */
  /* gear colours are seeded HERE, at build time, on EVERY slot — both of the
     first two instance-colour traps in SUBAGENT.md §6 in one go: a mesh that
     first tints at frame time gets a shader program compiled without the
     instance-colour path and renders pure white forever, and the first
     setColorAt on a lazily-allocated zero-filled buffer blackens every slot
     that was never explicitly tinted. Nothing here is tinted later, so this
     one pass is also the last word on these colours. */
  var gearCol = new THREE.Color();
  var gearM = new THREE.Matrix4(), gearP = new THREE.Vector3(), gearQ = new THREE.Quaternion(), gearS = new THREE.Vector3();
  for(var i=0;i<LIFE_FISH_BOATS.length;i++){
    lifeDhowHullMesh.setColorAt(i, new THREE.Color(0xffffff));
    lifeDhowSailMesh.setColorAt(i, new THREE.Color(LIFE_FISH_BOATS[i].sailCol));
    for(var g=0; g<LIFE_DHOW_GEAR_PER; g++){
      var hex = (g===4) ? LIFE_DHOW_CATCH_COL : (g&1) ? LIFE_DHOW_FLOAT_COL : LIFE_DHOW_NET_COL;
      lifeDhowGearMesh.setColorAt(i*LIFE_DHOW_GEAR_PER+g, gearCol.set(hex).convertSRGBToLinear());
      /* and seed the MATRIX too: an InstancedMesh's matrices default to the
         identity, which would park 225 unit cubes on the world origin for
         however many frames pass before updateLife's first tick. A
         vanishing scale at the boat's own mooring is invisible either way. */
      gearP.set(LIFE_FISH_BOATS[i].x, SEA, LIFE_FISH_BOATS[i].z);
      gearS.set(1e-4,1e-4,1e-4);
      gearM.compose(gearP, gearQ.identity(), gearS);
      lifeDhowGearMesh.setMatrixAt(i*LIFE_DHOW_GEAR_PER+g, gearM);
    }
  }
  lifeDhowGearMesh.instanceMatrix.needsUpdate = true;
  if(lifeDhowHullMesh.instanceColor) lifeDhowHullMesh.instanceColor.needsUpdate = true;
  if(lifeDhowSailMesh.instanceColor) lifeDhowSailMesh.instanceColor.needsUpdate = true;
  if(lifeDhowGearMesh.instanceColor) lifeDhowGearMesh.instanceColor.needsUpdate = true;
})();
window._fishBoats = { n: LIFE_FISH_BOATS.length, piers: LIFE_FISH_PIERS.length, boats: LIFE_FISH_BOATS,
  /* diagnostic: everything a later pass (or a headless probe) needs to check
     the size/mooring re-tune without re-deriving it from the geometry */
  scale: LIFE_DHOW_SCALE, len: LIFE_DHOW_LEN, beam: LIFE_DHOW_BEAM,
  hullSpan: LIFE_DHOW_LEN*1.18,          /* stern -0.51*LEN to prow tip +0.67*LEN */
  slotT: [0.25,0.58,0.91], slotSide: [1,-1,1],
  gearInstances: LIFE_FISH_BOATS.length*LIFE_DHOW_GEAR_PER,
  /* live animation state, for a probe that wants one number per phase */
  phase: function(){ var o={docked:0,transitOut:0,fishing:0,transitIn:0,netsDown:0,laden:0};
    LIFE_FISH_BOATS.forEach(function(b){ o[b.state]++; if(b.net>0.5) o.netsDown++; if(b.catch>0.5) o.laden++; });
    return o; } };
/* owner: "add fishing boats (and all past and future life layer entities)
   to the pathing devtool". pathvizRegister() (87-pathviz.js) is a hoisted
   function declaration with a lazily-created registry, so a population can
   register itself HERE, where it is defined, instead of that file having to
   grow a hand-written case per population — which is exactly how the dhows
   came to be missing from it in the first place. This is the pattern every
   new life-layer population should copy: one call, next to its own
   window._* diagnostic. The pier each dhow works from is drawn as a post,
   so a dhow sitting at its mooring is still locatable when its route is
   momentarily empty. */
if(typeof pathvizRegister === 'function') pathvizRegister({
  key:'fish', label:'Fishing dhow', color:0x46c8e6, seg:16, glow:5,
  entities: function(){ return LIFE_FISH_BOATS; },
  posts: function(){ return LIFE_FISH_PIERS.map(function(p){ return { x:p.tipX, y:SEA, z:p.tipZ }; }); },
  postR: 5
});

var lifeDhowTmpPos = new THREE.Vector3(), lifeDhowTmpDir = new THREE.Vector3();
var lifeDhowTmpQuat = new THREE.Quaternion(), lifeDhowTmpMat = new THREE.Matrix4();
var lifeDhowTmpScale1 = new THREE.Vector3(1,1,1);
var lifeDhowTmpScaleS = new THREE.Vector3(1,1,1);     /* the sail's own scale — furls independently of the hull */
var lifeDhowGearPos = new THREE.Vector3(), lifeDhowGearScale = new THREE.Vector3();
var lifeDhowGearMat = new THREE.Matrix4(), lifeDhowGearQuat = new THREE.Quaternion();
var lifeDhowRollQuat = new THREE.Quaternion(), LIFE_DHOW_FWD = new THREE.Vector3(0,0,1);
var lifeDhowCrewPos = new THREE.Vector3();
function lifeDhowEase(u){ u = u<0?0:(u>1?1:u); return u*u*(3-2*u); }
function lifeDhowMix(a,b,t){ return a + (b-a)*t; }

/* crew, now aware of what the boat is doing: the amidships hand works the
   rail while the nets are over the side, and the after hand crosses to the
   fish bin while the boat is unloading, both with a small vertical bob so
   they read as HAULING rather than as two statues that teleported. Seats are
   otherwise exactly where they were. */
function lifePlaceDhowCrew(baseIdx, pos, yaw, deckY, b, clock){
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  var working = b.net > 0.02;
  var unloading = b.state === 'docked' && b.catch > 0.004;
  for(var s=0; s<LIFE_DHOW_SEATS.length; s++){
    var seat = LIFE_DHOW_SEATS[s];
    var lx = seat[0], lz = seat[1], dy = 0;
    if(s === 1 && working){
      lx = lifeDhowMix(seat[0], -LIFE_DHOW_BEAM*0.34, b.net);
      dy = Math.sin(clock*3.6 + baseIdx)*0.26*b.net;
    }else if(s === 2 && unloading){
      lx = lifeDhowMix(seat[0], LIFE_DHOW_BIN_X, b.catch);
      lz = lifeDhowMix(seat[1], LIFE_DHOW_BIN_Z - LIFE_DHOW_BIN_L*0.62, b.catch);
      dy = Math.sin(clock*3.0 + baseIdx)*0.30*b.catch;
    }
    var wx = pos.x + lx*cosY + lz*sinY;
    var wz = pos.z - lx*sinY + lz*cosY;
    lifeDhowCrewPos.set(wx, deckY+dy, wz);
    lifeDhowTmpMat.compose(lifeDhowCrewPos, lifeDhowGearQuat.setFromAxisAngle(LIFE_UP, yaw), lifeDhowTmpScale1);
    lifeDhowCrewMesh.setMatrixAt(baseIdx+s, lifeDhowTmpMat);
  }
}

/* one boat's five gear instances, all from the same unit box. `n` is the net
   deploy parameter (0 stowed, 1 shot), `cat` the bin fill. Every number below
   is boat-local: x across (+ starboard), y up from the hull's own origin
   (world SEA-0.15), z along (+ bow) — the same frame the hull parts and the
   seats are authored in, rotated into the world by the boat's yaw. */
var LIFE_DHOW_GEAR_Y0 = SEA - 0.15;   /* must track the hull's own mount height below */
function lifePlaceDhowGear(bi, pos, yaw, n, cat){
  var base = bi*LIFE_DHOW_GEAR_PER, S = LIFE_DHOW_SCALE;
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  /* `roll` tilts a part about the boat's own fore-and-aft axis (applied on
     the RIGHT of the yaw, so it is a local roll, not a world one). Only the
     net panels use it, and only while they are out: an upright box against
     the rail reads as a bulwark, the same box leaned top-inboard reads as a
     net hanging off a line, which is the whole point of the animation. */
  function put(slot, lx, ly, lz, sx, sy, sz, roll){
    lifeDhowGearPos.set(pos.x + lx*cosY + lz*sinY, LIFE_DHOW_GEAR_Y0 + ly, pos.z - lx*sinY + lz*cosY);
    lifeDhowGearScale.set(sx, sy, sz);
    lifeDhowGearQuat.setFromAxisAngle(LIFE_UP, yaw);
    if(roll) lifeDhowGearQuat.multiply(lifeDhowRollQuat.setFromAxisAngle(LIFE_DHOW_FWD, roll));
    lifeDhowGearMat.compose(lifeDhowGearPos, lifeDhowGearQuat, lifeDhowGearScale);
    lifeDhowGearMesh.setMatrixAt(base+slot, lifeDhowGearMat);
  }
  for(var k=0; k<2; k++){
    var sg = k ? 1 : -1;
    /* the net panel: a roll lying on the gunwale at n=0, a skirt swung out
       over the side and down through the surface at n=1. The deployed offset
       is deliberately barely clear of the rail (inner face 0.24 outboard of
       the gunwale's own outer face) — screenshot-driven: hung further out it
       stops reading as part of the boat and becomes a wall standing in the
       water beside it. Most of the visible height is ABOVE the rail, not
       below it, because the hull's freeboard is only ~0.19 above SEA: there
       is no room to show a net between the gunwale and the waterline, so
       what a viewer sees is the part still on the hauling line. */
    var px   = lifeDhowMix(LIFE_DHOW_BEAM*0.5 + 0.20*S, LIFE_DHOW_BEAM*0.5 + 0.35*S, n) * sg;
    var top  = lifeDhowMix(0.58*S,  1.30*S, n);
    var bot  = lifeDhowMix(0.14*S, -0.90*S, n);
    put(k*2, px, (top+bot)*0.5, -LIFE_DHOW_LEN*0.04,
        lifeDhowMix(0.55*S, 0.22*S, n), top-bot, lifeDhowMix(0.52, 0.64, n)*LIFE_DHOW_LEN,
        sg*0.24*n);
    /* the cork line: a small coil on the rail forward of the net at n=0, a
       pale line lying IN the water surface outboard of it at n=1. Sitting
       proud of SEA rather than centred on it, because the water is 96%
       opaque over a real fishing ground and a line centred on the surface
       shows only its top millimetres. */
    put(k*2+1, lifeDhowMix(LIFE_DHOW_BEAM*0.5 + 0.20*S, LIFE_DHOW_BEAM*0.5 + 1.75*S, n) * sg,
        lifeDhowMix(0.72*S, 0.25*S, n),
        lifeDhowMix(LIFE_DHOW_LEN*0.28, -LIFE_DHOW_LEN*0.02, n),
        lifeDhowMix(0.45*S, 0.34*S, n), lifeDhowMix(0.45*S, 0.34*S, n),
        lifeDhowMix(0.14, 0.80, n)*LIFE_DHOW_LEN);
  }
  /* the catch, heaped in the bin and proud of its rim when full */
  var h = Math.max(1e-4, cat*LIFE_DHOW_BIN_H*1.22);
  put(4, LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_T + h*0.5, LIFE_DHOW_BIN_Z,
      LIFE_DHOW_BIN_W - LIFE_DHOW_BIN_T*2.4, h, LIFE_DHOW_BIN_L - LIFE_DHOW_BIN_T*2.4);
}

var LIFE_DHOW_DECK_Y = SEA + 0.70;
/* the fishing dwell is still the owner's own 15 seconds, unchanged — the net
   now simply spends the first and last few of those going over the side and
   coming back aboard, so the dwell is visibly bracketed rather than silent. */
var LIFE_DHOW_FISH_DWELL = 15;
var LIFE_DHOW_NET_DROP = 3.2;    /* shooting the net, at the start of the dwell */
var LIFE_DHOW_NET_HAUL = 4.0;    /* hauling it back in, at the end of it — the catch comes up with it */
var LIFE_DHOW_UNLOAD   = 6.0;    /* emptying the bin onto the pier, at the start of the next dock */
function updateFishBoats(dt){
  var clock = performance.now()*0.001;
  LIFE_FISH_BOATS.forEach(function(b, bi){
    b.stateT += dt;
    var pos, yaw;
    if(b.state === 'docked'){
      pos = b; yaw = b.ry;
      b.net = 0;
      /* unloading: whatever the boat came home with, handed ashore over the
         first LIFE_DHOW_UNLOAD seconds of the dock. unloadFrom is latched on
         arrival so an interrupted or re-entered dock can't refill the bin. */
      b.catch = b.unloadFrom * (1 - lifeDhowEase(b.stateT/LIFE_DHOW_UNLOAD));
      if(b.stateT >= b.dwell){
        var spot = lifeFishingSpot(b.home.x, b.home.z);
        b.fishX = spot[0]; b.fishZ = spot[1];
        b.curve = lifeBuildLegOpenWater(b.x, b.z, b.fishX, b.fishZ);
        b.len = b.curve.getLength(); b.dur = Math.max(10, b.len/b.speed);
        b.state = 'transitOut'; b.stateT = 0;
        b.catch = 0; b.unloadFrom = 0;
      }
    }else if(b.state === 'fishing'){
      pos = b; yaw = b.ry;
      var ft = b.stateT, haulFrom = LIFE_DHOW_FISH_DWELL - LIFE_DHOW_NET_HAUL;
      if(ft < LIFE_DHOW_NET_DROP)      b.net = lifeDhowEase(ft/LIFE_DHOW_NET_DROP);
      else if(ft < haulFrom)           b.net = 1;
      else                             b.net = 1 - lifeDhowEase((ft-haulFrom)/LIFE_DHOW_NET_HAUL);
      b.catch = ft < haulFrom ? 0 : lifeDhowEase((ft-haulFrom)/LIFE_DHOW_NET_HAUL);
      if(b.stateT >= LIFE_DHOW_FISH_DWELL){   /* "after 15 seconds, they haul their nets up" — the owner's own exact number */
        b.net = 0; b.catch = 1;
        b.curve = lifeBuildLegOpenWater(b.fishX, b.fishZ, b.home.x, b.home.z);
        b.len = b.curve.getLength(); b.dur = Math.max(10, b.len/b.speed);
        b.state = 'transitIn'; b.stateT = 0;
      }
    }else{
      b.net = 0;
      if(b.state === 'transitOut') b.catch = 0;
      var raw = Math.min(1, b.stateT/b.dur);
      var t = raw*raw*(3-2*raw);
      b.curve.getPointAt(t, lifeDhowTmpPos);
      pos = lifeDhowTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      b.curve.getTangentAt(tTan, lifeDhowTmpDir);
      yaw = Math.atan2(lifeDhowTmpDir.x, lifeDhowTmpDir.z);
      b.x = pos.x; b.z = pos.z; b.ry = yaw;
      if(raw >= 1){
        if(b.state === 'transitOut'){
          b.x = b.fishX; b.z = b.fishZ;
          b.state = 'fishing'; b.stateT = 0;
        }else{
          b.x = b.home.x; b.z = b.home.z; b.ry = b.home.ry;
          b.state = 'docked'; b.stateT = 0; b.dwell = rr(10, 26);
          b.unloadFrom = b.catch;   /* full hold, handed ashore over the next LIFE_DHOW_UNLOAD seconds */
        }
      }
    }
    /* pos may BE lifeDhowTmpPos (the curve sample, in the transit branch), so
       this rewrites y in place rather than allocating a fresh Vector3 per
       boat per frame the way this line used to; x and z are read out as
       arguments before the set lands, and neither changes. */
    lifeDhowTmpPos.set(pos.x, SEA-0.15, pos.z);
    lifeDhowTmpMat.compose(lifeDhowTmpPos, lifeDhowTmpQuat.setFromAxisAngle(LIFE_UP, yaw), lifeDhowTmpScale1);
    lifeDhowHullMesh.setMatrixAt(bi, lifeDhowTmpMat);
    /* the sail drops with the nets. Free (the sail already has its own mesh
       and its own matrix) and the single most legible cue at any distance:
       a working boat is the one with its yard down. Scaling y about the
       hull's own origin collapses the lateen triangle into a bundle at the
       mast foot, which is exactly what a lowered yard looks like. */
    lifeDhowTmpScaleS.set(1, 1 - 0.86*b.net, 1);
    lifeDhowTmpMat.compose(lifeDhowTmpPos, lifeDhowTmpQuat, lifeDhowTmpScaleS);
    lifeDhowSailMesh.setMatrixAt(bi, lifeDhowTmpMat);
    lifePlaceDhowCrew(bi*3, pos, yaw, LIFE_DHOW_DECK_Y, b, clock);
    lifePlaceDhowGear(bi, pos, yaw, b.net, b.catch);
  });
  lifeDhowHullMesh.instanceMatrix.needsUpdate = true;
  lifeDhowSailMesh.instanceMatrix.needsUpdate = true;
  lifeDhowCrewMesh.instanceMatrix.needsUpdate = true;
  lifeDhowGearMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== citizens: rambling pedestrians =============
   The owner's big brief, item 1 of 4 planned populations (ordinators,
   priests, merchant caravans are NOT built yet — this is the foundation
   the rest hang off, plus one working population on top of it). Shared
   scaffold first, all explicitly requested up front:
     - LIFE_HOUR_BEHAVIOR: a 24-slot array (one per hour), every slot null
       for now — the hook day/night spawn/despawn-rate behaviour is meant
       to hang off later, once day/night actually exists. Nothing reads
       it yet; it exists so that work has somewhere to go.
     - every citizen gets: a unique, ever-increasing id (LIFE_CITIZEN_ID,
       "track how many have been spawned over time"); a race flag
       ('dunmer'/'human', "flag human and dark elven to allow for
       separate behaviours" — no behaviour actually forks on it yet);
       a socialClass field, left null ("leave a variable open... so we
       can designate nobles, etc" later).
     - every LIFE_DOORS entry gets an entryCount, incremented on every
       arrival — "a counter to buildings for how many people have
       entered... help us debug things and implement a more coherent
       simulation later."

   LIFE_DOORS is the shared destination/origin registry every population
   will eventually draw from (not just pedestrians) — one entry per real
   door-like point in the city, classified into the categories the owner
   named, each with the owner's own per-location cap:
     compound (12), slum (2), manor (6), shop (3, "other buildings"),
     market/arena/temple/park (canton buildings, cap 3 each — no separate
     "other" cap was given for these, reusing "other buildings"'),
     shrine, dock (ferry/pleasure-barge stops).
   The owner's own "100 per residential canton" cap (Port/Arsenal/
   Foreign/Granary/Market — the CANTONS list minus Arena/Guild/Ancestry/
   Fortress/Temple/Palace) is NOT separately enforced here — the per-door
   cap of 3 across however many doors a canton has, plus the hard total
   LIFE_PED_N ceiling below, already keeps any one canton well under 100
   in practice; a real per-canton counter is a clean follow-up, not done
   here for time. Palace and Fortress get NO doors at all — restricted,
   not a place rambling pedestrians wander into. */
var LIFE_CITIZEN_ID = 0;
var LIFE_HOUR_BEHAVIOR = new Array(24).fill(null);   /* reserved for day/night — do not read yet */
function lifeCitizenRace(){ return chance(0.88) ? 'dunmer' : 'human'; }

var LIFE_DOORS = [];
(function(){
  /* mainland doors: one per PLACED town/compound footprint (60-land.js),
     approximated at the claimed footprint's own local +fx face — the
     same face compound()'s gate and townBuilding()'s street-shift both
     already treat as "the front" (see compound()'s own comment). */
  PLACED.forEach(function(o){
    if(o.tag !== 'town' && o.tag !== 'compound') return;
    var dp = loc(o.x, o.z, o.fx, 0, o.ry);
    var cat, cap;
    if(o.tag === 'compound'){ cat = 'compound'; cap = 12; }
    else if(o.poor){ cat = 'slum'; cap = 2; }
    else if(zoneAt(o.x,o.z) === 'manor'){ cat = 'manor'; cap = 6; }
    else{ cat = 'shop'; cap = 3; }
    LIFE_DOORS.push({ x:dp[0], z:dp[1], ry:o.ry, cat:cat, cap:cap, active:0, entryCount:0 });
  });
  /* canton doors (50-cantons.js's own plinthDoors, window-exported since
     that file runs long before any diagnostic export convention existed
     here) — classified by nearest canton name. Palace/Fortress(Lighthouse)
     deliberately get no entry: restricted, not a rambling destination.
     Guild was 'park' here from its old garden-canton days — reset to
     'shop' along with the rest of its reversion (30-layout.js's
     CIDX['Guild'].guild): its plinth doors now open onto four working
     craft-guild halls, the same kind of destination Port/Arsenal/Foreign/
     Granary's own doors already are, not a park bench. */
  var CANTON_CAT = { Market:'market', Arena:'arena', Temple:'temple', Ancestry:'park', Guild:'shop',
                      Port:'shop', Arsenal:'shop', Foreign:'shop', Granary:'shop' };
  (window._plinthDoors || []).forEach(function(pd){
    var best = null, bd = 1e18;
    CANTONS.forEach(function(c){ var d = Math.hypot(pd.x-c.x, pd.z-c.z); if(d<bd){ bd=d; best=c; } });
    if(!best) return;
    var cat = CANTON_CAT[best.n];
    if(!cat) return;
    LIFE_DOORS.push({ x:pd.x, z:pd.z, ry:pd.angle||0, cat:cat, cap:3, active:0, entryCount:0, canton:best.n });
  });
  /* markets/parks as OPEN-AREA hang-out points (DISTRICTS, 30-layout.js)
     — separate from the Market/Ancestry/Guild CANTON doors above, since
     several market/park districts sit out on the mainland, not inside a
     canton at all. */
  DISTRICTS.forEach(function(d){
    if(d.type !== 'market' && d.type !== 'park') return;
    var c = lifePolyCentroid(d.poly);
    LIFE_DOORS.push({ x:c[0], z:c[1], ry:0, cat:d.type, cap:14, active:0, entryCount:0 });
  });
  /* shrines — hang-out category, separate from the ferry/dock category
     just below even though the shrine ferry-route also stops at these
     same points; no boarding integration for that route yet (see
     lifeFerryBoard's own comment). */
  LIFE_SHRINE_STOPS.forEach(function(s){
    LIFE_DOORS.push({ x:s.x, z:s.z, ry:s.ry, cat:'shrine', cap:8, active:0, entryCount:0 });
  });
  /* THIRD PASS: the Guild canton's merchant annex (GUILD_MARKET_DOOR,
     50-cantons.js's guildHallsDeck() — same cross-file hand-off idiom as
     GUILD_WORK_POSTS/LIFE_SHRINE_STOPS above) — its own category, not
     folded into 'shop' (the cat every other Guild plinth door gets via
     CANTON_CAT above), so it can carry real priority in
     LIFE_PED_CAT_ORDER below instead of queuing behind everything else.
     Generous cap (6, between the DISTRICTS market's 14 and a plain shop's
     3) since "very high priority... people visit" implies a real crowd,
     not one or two browsers. */
  if(GUILD_MARKET_DOOR){
    LIFE_DOORS.push({ x:GUILD_MARKET_DOOR.x, z:GUILD_MARKET_DOOR.z, ry:GUILD_MARKET_DOOR.ry||0,
      cat:'guildmarket', cap:6, active:0, entryCount:0, canton:'Guild' });
  }
  /* FOURTH PASS (owner: "place the carpenter and merchant guild and
     make... weaver's, clockmaker's/artificer's... navigator's guild") —
     GUILD_HALL_DOORS (50-cantons.js's own header comment) holds one entry
     per new hall's own front door, on the Guild canton AND the Port
     canton (the Navigator's Guild, built inside portDeckV2(),
     65-facade.js — same array, different canton per entry). Own
     'guildhall' category, same idiom as 'guildmarket' just above, so
     these register as real visitable destinations instead of falling
     into the generic per-canton 'shop' plinth-door bucket. Cap 4: real
     footfall for a hall, but smaller than guildmarket/tavern's open-air 6. */
  (typeof GUILD_HALL_DOORS !== 'undefined' ? GUILD_HALL_DOORS : []).forEach(function(d){
    LIFE_DOORS.push({ x:d.x, z:d.z, ry:d.ry||0, cat:'guildhall', cap:4, active:0, entryCount:0, canton:d.canton });
  });
})();
/* the main ferry circuit's own stops, kept in a name-keyed lookup
   (LIFE_FERRY_STOPS entries are unique by .name) so lifeFerryBoard
   (below) can find "the queue waiting at the stop this ferry just
   docked at" in O(1) instead of a linear scan every arrival. */
var LIFE_DOOR_BY_STOPNAME = {};
LIFE_FERRY_STOPS.forEach(function(s){
  var d = { x:s.x, z:s.z, ry:s.ry, cat:'dock', cap:99, active:0, entryCount:0, queueCount:0 };
  LIFE_DOORS.push(d);
  LIFE_DOOR_BY_STOPNAME[s.name] = d;
});
/* silt strider stations (66-striders.js, which loads before this file) —
   the station records THEMSELVES are pushed straight into LIFE_DOORS
   (same object, not a copy) so lifePedPickDestination/the 'queued' state
   machine below treat a station exactly like a ferry dock, and
   79-striders.js's own boarding code reads the SAME .queueCount a rambling
   pedestrian just incremented. */
if(typeof LIFE_STRIDER_STATIONS !== 'undefined'){
  LIFE_STRIDER_STATIONS.forEach(function(s){ LIFE_DOORS.push(s); });
}
/* taverns (69-district-content.js's TAVERNS_PLACED, which loads before this
   file so the array is already real here) — owner: "pedestrian visit
   priority equal to the arena", so 'tavern' sits immediately beside 'arena'
   in LIFE_PED_CAT_ORDER below rather than folded into the generic 'shop'
   cat every other plinth door gets. Cap matches guildmarket's (6) — a
   taproom + beer garden implies a real evening crowd, not 1-2 browsers. */
if(typeof TAVERNS_PLACED !== 'undefined'){
  TAVERNS_PLACED.forEach(function(t){
    LIFE_DOORS.push({ x:t.doorX, z:t.doorZ, ry:t.ry, cat:'tavern', cap:6, active:0, entryCount:0 });
  });
}
window._doors = LIFE_DOORS;   /* diagnostic */

/* the owner's own preference order, tried strictly in this sequence —
   the first category with ANY door under its cap wins; within it, a
   candidate inside ~25% of the map's own span is preferred, but a
   distant one is still used rather than skipping the whole category
   ("if they pick a destination category with more than one potential
   target... they should pick a building that is not super far away"
   only bites when there IS a closer option). */
/* THIRD PASS: 'guildmarket' (the Guild canton's own merchant annex, just
   above) inserted right after 'market' — "a very high priority market
   tend... give the merchant guild's own door category real priority,
   similar to how market/arena already sit near the top" (the owner's own
   phrasing). Not tied with 'market' itself: the dedicated Market canton
   is still the city's real bazaar and keeps first pick; guildmarket is
   the next-strongest draw, well ahead of the plain 'shop' category the
   other 3 guild-hall doors fall into.
   FOURTH PASS: 'guildhall' (the Carpenter/Merchant/Weaver/Artificer/
   Navigator halls' own doors, GUILD_HALL_DOORS above) inserted right
   after 'guildmarket' — real dedicated halls now, so they get real
   priority too, just behind the bazaar-scale destinations. */
var LIFE_PED_CAT_ORDER = ['market','guildmarket','guildhall','arena','tavern','temple','park','shrine','dock','strider','shop','compound','slum'];
var LIFE_PED_NEAR_DIST = (CITY_LIM || 2280) * 2 * 0.25;
/* "can a WALKER actually get from here to there" — the pedestrian twin of
   lifeRoadReachable (carts), and the same principle: a destination with no
   walkable approach must be REJECTED, not handed to a leg builder that will
   invent a line across the bay for it. lifePedBuildLeg's refinement can
   genuinely step a route around a canal or a shore notch, which is what it
   was built for; what it cannot do is cross 500 units of open bay, and a
   pedestrian sent to a door on a canton with no land route just swims the
   whole way. Measured, live: 487 of 834 live pedestrians had at least one
   underwater sample on their current curve, in long unbroken runs.
   The predicate is lifeGroundY, NOT terrainH — a pier deck, a causeway, a
   bridge and a canton floor are all real ground for a walker even though
   terrainH reports open water underneath every one of them (that is what
   lifeGroundY exists for), so this accepts a ferry dock at a pier tip or a
   canton door reached along its causeway and only rejects a genuine swim.
   Cheap: one straight-line sample walk, ~1 lifeGroundY call per 55 units. */
var LIFE_PED_MAX_WADE = 3;   /* consecutive wet samples tolerated — ~165 units, a canal or a shore notch, not a bay */

/* ===================== the door-transit rule ==============================
   Owner: "any non vehicle/pedestrian can come in one door of a building and
   out another if it needs to, in order to path (exclude palace and temple
   from this for rambling pedestrians, they are commoners and can't just
   waltz in)."

   HALF OF THIS THE WALKER PATH ALREADY KEEPS, and keeps on purpose. The three
   routing systems in this file are deliberately different about obstacles:
   lifeCartBuildLeg is road-constrained (Dijkstra over the real road graph, so
   a cart can only ever be where a road is); lifeNavAStar rasterises piers,
   hulls, chinampas and canton caps into a 26-unit grid (water traffic only —
   every caller is a ferry or a taxi); and the pedestrian pair, lifePedWalkable
   + lifePedBuildLeg, checks water and hill gradient and NOTHING else. Neither
   of them has ever consulted a footprint. That is exactly the affordance the
   owner is describing, and it is stated here rather than left as an accident
   of what those two predicates happen not to check: for foot traffic a built
   footprint on the line is PASSABLE — a building with doors is a room to cross,
   not a wall. Every footprint in the LIFE_DOORS registry carries at least one
   door by construction (see its PLACED pass above: one door per town/compound
   footprint), and tavern() (65-facade.js) is the worked example with two — a
   double door on the entrance face and a garden door straight out of the back
   wall — so a pedestrian crossing a tavern genuinely does go in one door and
   out another. window._pedTransit.audit() below measures how many live
   pedestrians are doing it at any moment, and through what.

   THE OTHER HALF IS NEW: the exception the owner named. Palace and Temple are
   CLOSED PRECINCTS for a rambling pedestrian. This follows the grain already
   in this file rather than adding a parallel permission system:

     - it is scoped by CALL SITE, not by a per-citizen permission flag.
       lifePedWalkable is reached from exactly one place, lifePedPickDestination,
       and that is reached only from the four rambling-pedestrian retarget
       points (lifePedSpawn, lifeFerryBoard's alighting passengers, the hangout
       retarget below, and the strider station's twin of it in 79-striders.js).
       Every population with legitimate business inside — the clergy and the
       high priest at the Temple, the ordinator ring and its posts — is driven
       by its own posted-spot state machine and calls lifePedBuildLeg DIRECTLY,
       never through lifePedPickDestination. So they cannot be caught by this,
       and lifePedBuildLeg itself is deliberately left untouched, exactly as
       every other population already relies on it.
     - it is the same shape as the decision already documented at LIFE_DOORS:
       "Palace and Fortress get NO doors at all — restricted, not a place
       rambling pedestrians wander into." This extends that from "you may not
       go there" to "you may not go THROUGH there", which is what the new rule
       required and what a door registry alone could never express.
     - and it REJECTS rather than fudges, the way claim() and lifeRoadReachable
       already do: a destination whose approach crosses a closed precinct is
       refused and another is tried, instead of a route being emitted that
       walks a commoner through the Palace.

   The Temple stays a real rambling DESTINATION ('temple' keeps its place in
   LIFE_PED_CAT_ORDER, and CANTON_CAT still classifies its plinth doors) —
   walking up to the temple door is a visit, and both its own doors stand
   inside its own precinct. Only pass-THROUGH traffic is refused, which is why
   the exemption below is keyed to the precinct the walker starts in and the
   precinct their destination door stands in. */
var LIFE_PED_CLOSED = [];
['Palace','Temple'].forEach(function(n){
  var c = (typeof CIDX !== 'undefined') ? CIDX[n] : null;
  /* c.r, the same radius lifeGroundY uses to decide "this walker is standing
     on this canton" — so "inside the precinct" and "on the platform" are one
     and the same test, not two numbers that can drift apart. */
  if(c) LIFE_PED_CLOSED.push({ n:n, x:c.x, z:c.z, r:c.r });
});
function lifePedClosedAt(x, z){
  for(var i=0; i<LIFE_PED_CLOSED.length; i++){
    var p = LIFE_PED_CLOSED[i], dx = x-p.x, dz = z-p.z;
    if(dx*dx + dz*dz < p.r*p.r) return p;
  }
  return null;
}
/* the precincts this particular leg is allowed to be inside: the one the
   walker is standing in, and the one their destination door stands in.
   Returns null when neither endpoint is in one at all — the common case, and
   the one that costs nothing below. */
function lifePedClosedExempt(ox, oz, dx, dz){
  if(!LIFE_PED_CLOSED.length) return null;
  var a = lifePedClosedAt(ox, oz), b = lifePedClosedAt(dx, dz);
  return (a || b) ? [a, b] : null;
}
function lifePedClosedHit(x, z, exempt){
  var p = lifePedClosedAt(x, z);
  if(!p) return null;
  if(exempt && (exempt[0] === p || exempt[1] === p)) return null;
  return p;
}
var LIFE_PED_CLOSED_REJECTS = 0;    /* finished ROUTES refused by the curve audit below */
var LIFE_PED_CLOSED_ACCEPTS = 0;    /* rambling legs accepted after that audit */
var LIFE_PED_CLOSED_REFUSALS = 0;   /* candidate DESTINATIONS refused here, at pick time — the rule's real bite */

function lifePedWalkable(ox, oz, dx, dz){
  var len = Math.hypot(dx-ox, dz-oz);
  var steps = Math.max(2, Math.min(60, Math.ceil(len/55)));
  var run = 0;
  var exempt = lifePedClosedExempt(ox, oz, dx, dz);
  for(var i=0; i<=steps; i++){
    var t = i/steps, px = ox+(dx-ox)*t, pz = oz+(dz-oz)*t;
    /* the door-transit rule's one exception: an ordinary building on the line
       is a room to walk through, but the Palace and the Temple are not. */
    if(LIFE_PED_CLOSED.length && lifePedClosedHit(px, pz, exempt)){ LIFE_PED_CLOSED_REFUSALS++; return false; }
    /* terrainH first, lifeGroundY only where it says water: lifeGroundY is
       the authoritative walker predicate but it walks every causeway (each
       one a shoreIn() evaluation), span, canton and pier list on every call,
       and this runs ~5x per pedestrian retarget for ~800 pedestrians. Dry
       ground is dry ground under both, so the expensive query is only ever
       asked about the samples that could actually be a deck. */
    if(terrainH(px, pz) >= 2){ run = 0; continue; }
    if(lifeGroundY(px, pz) < 2){
      if(++run > LIFE_PED_MAX_WADE) return false;
    }else run = 0;
  }
  return true;
}
function lifePedPickDestination(ox, oz, excludeCat){
  var firstSeen = null;
  for(var ci=0; ci<LIFE_PED_CAT_ORDER.length; ci++){
    var cat = LIFE_PED_CAT_ORDER[ci];
    if(cat === excludeCat) continue;
    var pool = LIFE_DOORS.filter(function(d){ return d.cat===cat && d.active<d.cap; });
    if(!pool.length) continue;
    var near = pool.filter(function(d){ return Math.hypot(d.x-ox,d.z-oz) < LIFE_PED_NEAR_DIST; });
    var from = near.length ? near : pool;
    /* claim()-style rejection: try a few candidates in this category, then
       move on to the NEXT category rather than committing to a swim. */
    for(var tries=0; tries<5; tries++){
      var cand = pick(from);
      if(!firstSeen) firstSeen = cand;
      if(lifePedWalkable(ox, oz, cand.x, cand.z)) return cand;
    }
  }
  /* honest last resort — nothing in any category was walkable from here
     (a citizen who has somehow ended up somewhere genuinely stranded).
     Returning null would freeze them in place forever, so the unchecked
     pick still stands; this is a documented fallback, not a silent one. */
  return firstSeen;
}
/* land-side twin of lifeBuildLeg (water) — pushes seed/refinement points
   toward LAND instead of water, and does NOT treat cantons as obstacles
   (a pedestrian's destination is routinely ON one). Simple outward-ring
   gradient search, same spirit as lifePushToWater's own local nudge. */
function lifePushToLand(x, z){
  var h = terrainH(x,z);
  if(h >= 3) return [x,z];
  var best = [x,z], bestH = h;
  for(var r=6; r<=60; r*=1.6){
    for(var a=0; a<8; a++){
      var ang = a/8*Math.PI*2;
      var px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph > bestH){ bestH = ph; best = [px,pz]; }
    }
    if(bestH >= 3) break;
  }
  return best;
}
/* symmetric to lifePushToLand above, but for the opposite problem: a point
   sitting too HIGH (open hill country) rather than underwater. Neither
   lifePedBuildLeg's own refinement nor lifePushToLand ever check for
   this — they only ever look for terrainH<2, so a route that happens to
   cross dry, high ground was never corrected by anything. Searches for
   nearby LOWER ground the same ring-sample way lifePushToLand searches
   for higher ground. */
function lifePushToLowGround(x, z, maxH){
  var h = terrainH(x,z);
  if(h <= maxH) return [x,z];
  var best = [x,z], bestH = h;
  for(var r=20; r<=300; r*=1.6){
    for(var a=0; a<8; a++){
      var ang = a/8*Math.PI*2;
      var px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph < bestH){ bestH = ph; best = [px,pz]; }
    }
    if(bestH <= maxH) break;
  }
  return best;
}
function lifePedBuildLeg(ax, az, bx, bz){
  /* owner: "ordinators... try to go for swims" (also caravans) — real bug,
     not a fluke. This function's refinement loop only ever had 2 interior
     waypoints to replace (m1/m2) and checked a fixed 80 samples over 8
     rounds — tuned for a short building-to-building pedestrian hop, where
     the route crosses water at most once or twice. The ordinator ring
     patrol and off-map caravan legs are FAR longer (the ring circles a
     real stretch of the city; caravan legs run 3500-5300 units per their
     own speed comment) and can cross water in 3+ separate places — with
     only 2 replaceable slots, a 3rd crossing could never be fixed no
     matter how many rounds ran, regardless of sample density. All three
     knobs now scale with the leg's own straight-line length, so a short
     pedestrian hop behaves EXACTLY as before (waypointN floors at 2,
     sampleN at 80, rounds at 8 — unchanged, which is why "rambling
     pedestrians" were already fine) while a long ordinator/caravan route
     gets real capacity instead of silently running out of fixes.

     Second owner follow-up: "carts still have tendency to path over the
     western hills" — this is THIS function's fallback path (lifeRoadPath,
     78-life.js, fails to find any connected road route for some remote
     spawn points, e.g. an isolated warren stub) and it never checked
     elevation at all, only terrainH<2 (water) — a route that stays dry
     but climbs to h=180+ sailed straight through unfixed. HILL_MAX mirrors
     lifeCartBuildLeg's own connector-segment fix; harmless for ordinary
     short pedestrian hops, which never reach anywhere near this high. */
  var HILL_MAX = 95;
  var totalLen = Math.hypot(bx-ax, bz-az);
  /* owner (again): "caravans still occasionally trying to swim and trying
     to climb the hill, though with less success" — this is the fallback
     path (lifeRoadPath found no connected road route, e.g. the spawn
     point or a harbor/dock destination sits off the graph entirely), and
     for a genuinely long leg through real ridge country (RIDGES entries
     run 700+ units across) the OLD cap of 10 waypoints over a 5000-unit
     leg was too sparse to constrain a detour around a whole hill mass —
     bumped, plus every curve build here now uses the CENTRIPETAL
     parameterisation (lifeCurveFromLandCentripetal, defined above) instead
     of plain/uniform Catmull-Rom: the file's own longstanding comment on
     that function already documents uniform Catmull-Rom overshooting
     between irregularly-spaced control points (exactly what pushing
     individual waypoints to dodge water/hills produces round over round)
     as the standard failure mode centripetal exists to fix. */
  var waypointN = Math.max(2, Math.min(22, Math.ceil(totalLen/300)));
  var sampleN = Math.max(80, Math.min(500, Math.round(totalLen/15)));
  var rounds = Math.max(8, Math.min(40, waypointN*3));
  var waypoints = [[ax,az]];
  for(var wi=1; wi<=waypointN; wi++){
    var seed = lifeMix([ax,az],[bx,bz], wi/(waypointN+1));
    seed = lifePushToLand.apply(null, seed);
    if(terrainH(seed[0],seed[1]) > HILL_MAX) seed = lifePushToLowGround(seed[0],seed[1], HILL_MAX);
    waypoints.push(seed);
  }
  waypoints.push([bx,bz]);
  for(var round=0; round<rounds; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<sampleN; s++){
      var st = s/sampleN, p = curve.getPointAt(st);
      var ph = terrainH(p.x, p.z);
      if(ph < 2){ worstT = st; worstFix = lifePushToLand(p.x, p.z); break; }
      if(ph > HILL_MAX){ worstT = st; worstFix = lifePushToLowGround(p.x, p.z, HILL_MAX); break; }
    }
    if(worstT < 0) return curve;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w=1; w<waypoints.length-1; w++){
      var wt = w/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

/* ---- the door-transit rule, second gate: audit the FINISHED curve ---------
   lifePedWalkable above rejects a destination whose straight line crosses a
   closed precinct, but the curve lifePedBuildLeg actually returns is not that
   straight line — its refinement pushes waypoints sideways to dodge water and
   high ground, and a pushed waypoint can land somewhere the straight line
   never went. The principle this file already paid for once (lifeNavBuildLeg's
   obstacle-unaware straight-line fallback, the bug that walked ordinators
   across the bay) is: never emit a plausible-but-wrong route — reject the
   destination instead. So the route a rambling pedestrian is about to start
   walking is checked, not the line it was chosen by.

   lifePedBuildLeg itself is deliberately NOT given precinct avoidance: it is
   shared with the clergy, the high priest, the ordinators, the monks, the
   shopkeepers, the quarry and compound workers and the caravans, every one of
   whom either has business inside a precinct or never goes near one. Adding an
   avoidance nudge there would change all of their routes to fix a rule that
   applies to none of them. */
var lifePedAuditTmp = new THREE.Vector3();
function lifePedCurveClosedHit(curve, ox, oz, dx, dz){
  if(!LIFE_PED_CLOSED.length) return null;
  var exempt = lifePedClosedExempt(ox, oz, dx, dz);
  for(var i=0; i<=40; i++){
    curve.getPointAt(i/40, lifePedAuditTmp);
    var hit = lifePedClosedHit(lifePedAuditTmp.x, lifePedAuditTmp.z, exempt);
    if(hit) return hit;
  }
  return null;
}
/* one rambling pedestrian's next leg: pick a destination, build the route,
   audit it, and try another destination if the route would waltz through a
   closed precinct. Returns {dest, curve} or null — null meaning "nowhere this
   citizen may legitimately go from here right now", which every caller already
   handles (lifePedSpawn's own null contract: leave the instance hidden for a
   tick and retry next frame). The destination's own .active is NOT reserved
   here; the caller does that on the leg it actually accepts, exactly as
   before, so a rejected candidate never leaks a reservation. */
function lifePedRambleTarget(ox, oz, excludeCat){
  for(var attempt=0; attempt<4; attempt++){
    var dest = lifePedPickDestination(ox, oz, excludeCat);
    if(!dest) return null;
    var curve = lifePedBuildLeg(ox, oz, dest.x, dest.z);
    if(!lifePedCurveClosedHit(curve, ox, oz, dest.x, dest.z)){
      LIFE_PED_CLOSED_ACCEPTS++;
      return { dest: dest, curve: curve };
    }
    LIFE_PED_CLOSED_REJECTS++;
  }
  return null;
}
/* diagnostic: the door-transit rule made inspectable from outside.
   .audit() answers "how many live rambling pedestrians are mid-route THROUGH a
   building right now, and through what" by sampling each citizen's own curve
   against placedTagAt (86-inspect.js — PLACED plus the canton-top inspect
   registry). That is thousands of footprint tests per sample, far too slow for
   the per-frame path, which is exactly why it lives here as a probe-time query
   and not as a counter inside updatePedestrians. */
window._pedTransit = {
  closed: LIFE_PED_CLOSED,
  closedAt: lifePedClosedAt,
  walkable: lifePedWalkable,
  stats: function(){ return { accepts: LIFE_PED_CLOSED_ACCEPTS, routeRejects: LIFE_PED_CLOSED_REJECTS,
                              destRefusals: LIFE_PED_CLOSED_REFUSALS }; },
  audit: function(samples){
    var N = samples || 24, p = new THREE.Vector3();
    var out = { peds:0, inBuilding:0, transiting:0, closedBreaches:0, tags:{} };
    LIFE_PEDS.forEach(function(cz){
      if(!cz || !cz.curve || cz.state !== 'walk' || cz.shopkeeper || cz.quarryLaborer || cz.compoundWorker || cz.monk) return;
      out.peds++;
      var hits = {}, n = 0, breach = false;
      var exempt = lifePedClosedExempt(cz.curve.getPointAt(0).x, cz.curve.getPointAt(0).z, cz.destDoor.x, cz.destDoor.z);
      for(var i=0; i<=N; i++){
        cz.curve.getPointAt(i/N, p);
        if(lifePedClosedHit(p.x, p.z, exempt)) breach = true;
        var t = placedTagAt(p.x, p.z);
        if(t){ hits[t.tag] = (hits[t.tag]||0)+1; n++; }
      }
      if(breach) out.closedBreaches++;
      if(n){ out.inBuilding++; if(n >= 2) out.transiting++; }
      for(var k in hits) out.tags[k] = (out.tags[k]||0) + 1;
    });
    return out;
  }
};
/* Paths tool: the door-transit rule needs a picture, and the built-in 'ped'
   type deliberately draws the ROAD GRAPH ("the pedestrian's designated path")
   while `covers`-claiming LIFE_PEDS so nothing draws 1200 live citizen curves
   at once — see 87-pathviz.js's own comment. A rule about individual routes
   threading buildings is invisible in that picture, so this registers a
   SECOND, separate type through that file's documented extension point
   (pathvizRegister, hoisted for exactly this) drawing a readable sample of
   live rambling legs. It does not touch or replace the 'ped' entry. Costs
   nothing: the whole tool is one hidden LineSegments, and `entities` is read
   only when the panel is open. */
if(typeof pathvizRegister === 'function'){
  pathvizRegister({ key:'pedleg', label:'Pedestrian (live legs)', color:0x9fd8e8, seg:16,
    entities: function(){
      var out = [];
      for(var i=0; i<LIFE_PEDS.length && out.length<30; i++){
        var cz = LIFE_PEDS[i];
        if(cz && cz.curve && cz.state === 'walk' && !cz.shopkeeper && !cz.quarryLaborer
           && !cz.compoundWorker && !cz.monk) out.push(cz);
      }
      return out;
    } });
}

/* the owner: "one shopkeeper per 2 market stalls" — reserved as EXTRA
   capacity on this same pool (indices >= 540), not a new InstancedMesh:
   the draw-call budget is at its hard ceiling (53/53, zero headroom)
   while the instance budget still has real headroom, so growing this
   one mesh's instance count is the only way to add a new kind of person
   this session. MARKET_STALLS is 69-district-content.js's own global
   (that fragment loads before this one, so it's already full here). */
var LIFE_SHOPKEEPER_N = (typeof MARKET_STALLS !== 'undefined') ? Math.floor(MARKET_STALLS.length/2) : 0;
/* +480 reserved, trailing, for silt strider riders (79-striders.js): up to
   20 convoys (6 on Route 1, 6 on Route 2, 8 on Route 3) x 3 cars x 8 seats,
   same "grow an existing InstancedMesh's instance count" technique as the
   shopkeeper pool just above (same mesh, lifePersonGeo — already used for
   every other rider/passenger population in the city, ferries and barges
   included), not a new draw call. Indexed car-slot-major
   (LIFE_STRIDER_RIDER_BASE + carSlot*8 + seat) so a car's own 8 seats are a
   contiguous, fixed block — carSlot itself is a GLOBAL slot number spanning
   all three routes (79-striders.js's own STRIDER_ROUTES/LIFE_STRIDERS), not
   per-route, so this literal 60 here MUST match LIFE_STRIDER_CAR_SLOTS below
   exactly (that constant isn't assigned yet at this point in the file, hence
   the duplicated literal rather than a reference to it). */
var LIFE_STRIDER_RIDER_PER_CAR = 8;
var LIFE_STRIDER_RIDER_BASE = 540 + LIFE_SHOPKEEPER_N;
var LIFE_STRIDER_RIDER_SLOTS = 60 * LIFE_STRIDER_RIDER_PER_CAR;
var LIFE_PED_N = 540 + LIFE_SHOPKEEPER_N + LIFE_STRIDER_RIDER_SLOTS;   /* x3 per the owner's "city feels empty" follow-up */
/* owner: quarry laborers ("each has 4 quarrymen... go to work at the
   quarry at sunrise and return to these houses at sunset") — same "grow
   this one shared InstancedMesh's instance count" technique as the
   shopkeeper pool and the strider-rider block directly above (same mesh,
   lifePersonGeo; the draw-call budget has no headroom, the instance
   budget does), appended AFTER the strider-rider range rather than
   inserted into it so LIFE_STRIDER_RIDER_BASE/SLOTS above — and every
   absolute index 79-striders.js computes off them — are completely
   unchanged. QUARRY_LABORER_HOUSES is 71-industry.js's own global (that
   fragment loads before this one): one entry per placed laborer house,
   4 assigned quarrymen per house per the owner's own count. */
var LIFE_QUARRY_LABORER_N = (typeof QUARRY_LABORER_HOUSES !== 'undefined') ? QUARRY_LABORER_HOUSES.length * 4 : 0;
var LIFE_QUARRY_LABORER_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_QUARRY_LABORER_N;
/* owner: "inside the compounds, if there is a garden, have 3 workers come
   out of one building, tend it during the day, and go back at night" —
   3 per clan compound. Appended AFTER the quarry-laborer range by exactly
   the same discipline that range itself documents above: never inserted
   into an existing range, because LIFE_STRIDER_RIDER_BASE/SLOTS and the
   absolute indices 79-striders.js computes off them must not move.
   COMPOUNDS is 60-land.js's own global; every compound draws a garden slab
   unconditionally (the record's own x/z IS that garden's centre, not the
   compound's), so "if there is a garden" is true for all of them. */
var LIFE_COMPOUND_WORKER_PER = 3;
var LIFE_COMPOUND_WORKER_N = (typeof COMPOUNDS !== 'undefined') ? COMPOUNDS.length * LIFE_COMPOUND_WORKER_PER : 0;
var LIFE_COMPOUND_WORKER_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_COMPOUND_WORKER_N;
/* owner: "add monks (dressed in grey robes) who go out to monastery fields
   during the day, stop at chapel in the evening, and go to dorms to sleep
   at night... 5 per field, 2 per chicken coop." Appended after the compound
   workers, same rule again. MONASTERY_SITES is 61-monastery.js's own global
   (fields / coops / chapelDoor / dorms, all in world coordinates, filled in
   by monasteryCompound() at build time). */
var LIFE_MONK_PER_FIELD = 5, LIFE_MONK_PER_COOP = 2;
var LIFE_MONK_N = (typeof MONASTERY_SITES !== 'undefined')
  ? MONASTERY_SITES.fields.length*LIFE_MONK_PER_FIELD + MONASTERY_SITES.coops.length*LIFE_MONK_PER_COOP : 0;
var LIFE_MONK_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_MONK_N;
var LIFE_PED_T = 0;
var lifePedMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_PED_N);
lifePedMesh.userData.life = true; lifePedMesh.userData.inspectLabel = 'Pedestrian';
lifePedMesh.frustumCulled = false;
scene.add(lifePedMesh);
var lifePedTmpPos = new THREE.Vector3(), lifePedTmpDir = new THREE.Vector3();
var lifePedTmpQuat = new THREE.Quaternion(), lifePedTmpMat = new THREE.Matrix4();
var lifePedTmpScale1 = new THREE.Vector3(1,1,1), lifePedTmpScale0 = new THREE.Vector3(0,0,0);

/* a fresh citizen: "For now, rambling pedestrians will spawn in any door
   at random" — ANY door, any category, no cap check on the ORIGIN (they
   are leaving it, not occupying it; only the DESTINATION reserves a
   slot). Returns null on the rare frame where literally every door in
   the city is at its own cap (destination pool exhausted) — the caller
   just leaves that instance hidden for one tick and retries next frame. */
function lifePedSpawn(){
  if(!LIFE_DOORS.length) return null;
  var origin = pick(LIFE_DOORS);
  /* door-transit rule: pick + build + audit together, so a citizen is never
     started on a route that walks them through the Palace or the Temple. */
  var leg = lifePedRambleTarget(origin.x, origin.z, null);
  if(!leg) return null;
  var dest = leg.dest, curve = leg.curve;
  dest.active++;
  return {
    id: LIFE_CITIZEN_ID++, race: lifeCitizenRace(), socialClass: null, timeOfDayBehavior: null,
    destDoor: dest, curve: curve, len: curve.getLength(),
    speed: rr(2.2,3.4), dur: 0, stateT: 0, state: 'walk', hangUntil: 0, ferryRef: null
  };
}

/* real ferry boarding, against the LIFE_PEDS pool below (defined after
   this since it's only ever called from updateFerries, at runtime, long
   after every fragment has loaded — same hoisting reasoning as every
   other forward-reference in this file). "the ferry will always
   discharge 1-3 passengers and will always pick up 1-3 passengers (room
   allowing)". f.onboard is a real running count now, not a per-arrival
   reroll; f.passengers is kept in sync only as the existing 0..5 VISIBLE
   seat count updateFerries' own render loop already reads — capped
   separately so a big onboard count doesn't try to seat more citizens
   than LIFE_FERRY_SEATS has room for. */
function lifeFerryBoard(f, stopDoor){
  f.onboard = f.onboard || 0;
  var alight = Math.min(f.onboard, ri(1,3));
  f.onboard -= alight;
  var reactivated = 0;
  for(var i=0; i<LIFE_PEDS.length && reactivated<alight; i++){
    var pp = LIFE_PEDS[i];
    if(!pp || pp.state !== 'boarded' || pp.ferryRef !== f) continue;
    var newLeg = lifePedRambleTarget(stopDoor.x, stopDoor.z, 'dock');   /* door-transit rule — see lifePedRambleTarget */
    if(newLeg){
      var newDest = newLeg.dest;
      newDest.active++;
      pp.curve = newLeg.curve;
      pp.len = pp.curve.getLength(); pp.dur = Math.max(3, pp.len/pp.speed);
      pp.destDoor = newDest; pp.state = 'walk'; pp.stateT = 0; pp.ferryRef = null;
    }else{
      LIFE_PEDS[i] = lifePedSpawn();   /* nowhere to go — recycle the slot */
    }
    reactivated++;
  }
  var room = Math.max(0, LIFE_FERRY_PEOPLE_PER - 1 - f.onboard);
  var boarding = Math.min(3, stopDoor.queueCount, room);
  stopDoor.queueCount -= boarding;
  var boarded = 0;
  for(var j=0; j<LIFE_PEDS.length && boarded<boarding; j++){
    var pq = LIFE_PEDS[j];
    if(!pq || pq.state !== 'queued' || pq.destDoor !== stopDoor) continue;
    pq.state = 'boarded'; pq.ferryRef = f; boarded++;
  }
  f.onboard += boarded;
  f.passengers = Math.max(1, Math.min(5, f.onboard));
}

var LIFE_PEDS = [];
/* only the real pedestrian/shopkeeper range gets a LIFE_PEDS entry — the
   144 trailing slots reserved for strider riders (LIFE_STRIDER_RIDER_BASE
   and up) are driven directly by 79-striders.js via lifePedMesh.setMatrixAt,
   never through this array. */
(function(){ for(var i=0;i<LIFE_STRIDER_RIDER_BASE;i++) LIFE_PEDS.push(lifePedSpawn()); })();

/* shopkeepers: overwrite the reserved [540, 540+N) range lifePedSpawn()
   just filled with generic ramblers. The owner: "one shopkeeper per 2
   market stalls, who comes out of a random house within 500 units at
   sunrise, hangs out by his stall during the day, then goes back to that
   house at sunset." A dedicated 2-endpoint commute (home <-> stall),
   the LIFE_HIGHPRIEST idea (82-daynight.js's dayNightHour(), read from a
   per-frame update function, not this file's own top level — the usual
   cross-fragment hoisting rule) applied to an ordinary citizen instead of
   the high priest. 'shop'/'slum'/'manor'/'compound' are LIFE_DOORS'
   actual house-door categories (the canton/market/park/shrine/dock
   entries above are civic destinations, not homes). */
var SHOPKEEPER_SUNRISE = 6, SHOPKEEPER_SUNSET = 18;
(function(){
  if(!LIFE_SHOPKEEPER_N) return;
  var houseCats = { shop:1, slum:1, manor:1, compound:1 };
  var houseDoors = LIFE_DOORS.filter(function(d){ return houseCats[d.cat]; });
  if(!houseDoors.length) return;
  var h0 = dayNightHour();
  var atStall = (h0 >= SHOPKEEPER_SUNRISE && h0 < SHOPKEEPER_SUNSET);
  for(var i=0;i<LIFE_SHOPKEEPER_N;i++){
    var stall = MARKET_STALLS[i*2];
    var near = houseDoors.filter(function(hd){ return Math.hypot(hd.x-stall.x,hd.z-stall.z) <= 500; });
    var home = near.length ? pick(near) : pick(houseDoors);
    LIFE_PEDS[540+i] = {
      shopkeeper: true, stall: stall, home: home,
      state: atStall ? 'atStall' : 'atHome', stateT: 0,
      curve: null, len: 0, dur: 0, speed: rr(2.0,2.8)
    };
  }
})();
window._peds = LIFE_PEDS;   /* diagnostic: full state, incl. each citizen's .curve */
window._shopkeepers = { n: LIFE_SHOPKEEPER_N, sunrise: SHOPKEEPER_SUNRISE, sunset: SHOPKEEPER_SUNSET };

/* ============================== quarry laborers ==============================
   Owner: "add 4 plaster buildings for quarry laborers per quarry. each has
   4 quarrymen. they go to work at the quarry at sunrise and return to
   these houses at sunset." Mirrors the shopkeeper block directly above
   verbatim — same dedicated 2-endpoint home<->work-site commute, same
   sunrise/sunset hours (6/18, SHOPKEEPER_SUNRISE/SUNSET's own values —
   this world's one established "sunrise/sunset" convention, not a new
   pair invented for this) — just home<->quarry instead of home<->stall,
   and reserved on the NEWLY appended LIFE_QUARRY_LABORER_BASE range
   above instead of overwriting [540,540+N). QUARRY_LABORER_HOUSES
   (71-industry.js) already carries each house's own doorX/doorZ (the
   same loc(o.x,o.z,o.fx,0,o.ry) front-door point LIFE_DOORS itself uses)
   and which quarry (quarryX/quarryZ) it belongs to — 4 laborer entries
   per house, all sharing that one home door and that one quarry site. */
var QUARRY_SUNRISE = SHOPKEEPER_SUNRISE, QUARRY_SUNSET = SHOPKEEPER_SUNSET;
(function(){
  if(!LIFE_QUARRY_LABORER_N) return;
  var h0 = dayNightHour();
  var atQuarry = (h0 >= QUARRY_SUNRISE && h0 < QUARRY_SUNSET);
  var slot = 0;
  QUARRY_LABORER_HOUSES.forEach(function(house){
    for(var k=0;k<4;k++){
      LIFE_PEDS[LIFE_QUARRY_LABORER_BASE + slot] = {
        quarryLaborer: true,
        home: { x: house.doorX, z: house.doorZ, ry: house.ry },
        work: { x: house.quarryX, z: house.quarryZ },
        state: atQuarry ? 'atWork' : 'atHome', stateT: 0,
        curve: null, len: 0, dur: 0, speed: rr(2.0,2.8)
      };
      slot++;
    }
  });
  window._quarryLaborerLife = { n: LIFE_QUARRY_LABORER_N, base: LIFE_QUARRY_LABORER_BASE,
                                 sunrise: QUARRY_SUNRISE, sunset: QUARRY_SUNSET };
})();

/* ============================== compound garden workers =====================
   Owner: "inside the compounds, if there is a garden, have 3 workers come out
   of one building, tend it during the day, and go back at night." Modelled
   on updateQuarryLaborer/updateShopkeeper verbatim — the same 4-state
   home <-> work-point commute on the same sunrise/sunset pair (6/18, this
   world's one established convention, not a new pair invented here); the
   only difference is that "work" is a point INSIDE the compound's own
   garden rather than a quarry or a stall, and each of the 3 gets its own
   spot in that garden so they read as three people tending a bed rather
   than three copies standing on one tile.

   "come out of ONE building": COMPOUNDS.doorX/doorZ (added in 60-land.js
   this same pass) is the front step of the extra back-wall building added
   there, so all 3 of a compound's workers share one home door — which is
   what the owner asked for and also why the door had to be recorded at
   build time: the COMPOUNDS record's own x/z is the GARDEN's centre, and
   carries no building position at all. */
var COMPOUND_WORKER_SUNRISE = SHOPKEEPER_SUNRISE, COMPOUND_WORKER_SUNSET = SHOPKEEPER_SUNSET;
(function(){
  if(!LIFE_COMPOUND_WORKER_N) return;
  var h0 = dayNightHour();
  var atWork = (h0 >= COMPOUND_WORKER_SUNRISE && h0 < COMPOUND_WORKER_SUNSET);
  var slot = 0, gardens = 0;
  COMPOUNDS.forEach(function(c){
    if(!c.doorX && c.doorX !== 0) return;   /* no recorded building door: skip rather than guess */
    gardens++;
    for(var k=0;k<LIFE_COMPOUND_WORKER_PER;k++){
      /* three beds spread along the garden's own long (local z) axis,
         a little back from its centre line — loc()'s own local frame,
         same convention every other placement in this world uses. */
      var wp = loc(c.x, c.z, (k-1)*c.fx*0.34, (k===1 ? 0 : (k===0 ? -1 : 1))*c.fz*0.42, c.ry);
      LIFE_PEDS[LIFE_COMPOUND_WORKER_BASE + slot] = {
        compoundWorker: true,
        home: { x: c.doorX, z: c.doorZ, ry: c.ry },
        work: { x: wp[0], z: wp[1] },
        /* the compound's own plinth top, +0.30 for the garden slab that sits
           on it (60-land.js draws it at yb-0.05, 0.35 tall). lifeGroundY()
           below knows nothing about compound plinths � it falls through to
           bare terrainH for anything that isn't a causeway, bridge, canton
           deck or pier � so a worker placed by ground height alone stands
           BELOW the garden he is meant to be tending wherever the plinth
           lifted the compound off a dip. Caught by screenshot, not assumed. */
        floorY: c.y + 0.30,
        state: atWork ? 'atWork' : 'atHome', stateT: 0,
        curve: null, len: 0, dur: 0, speed: rr(1.8,2.6)
      };
      slot++;
    }
  });
  window._compoundWorkers = { n: slot, gardens: gardens, per: LIFE_COMPOUND_WORKER_PER,
                              base: LIFE_COMPOUND_WORKER_BASE,
                              sunrise: COMPOUND_WORKER_SUNRISE, sunset: COMPOUND_WORKER_SUNSET };
})();

/* ============================== monks ======================================
   Owner: "add monks (dressed in grey robes) who go out to monastery fields
   during the day, stop at chapel in the evening, and go to dorms to sleep at
   night. 5 per field, 2 per chicken coop."

   A genuine THREE-phase day, so not the shopkeeper/quarry two-state commute:
   this is the penitents' idea (walk to a stop, idle-wander there, move on to
   the next stop) driven by the CLOCK instead of by a dwell timer, which is
   the one thing the penitents do that the two-state commuters cannot. Phase
   boundaries all come from dayNightHour() (82-daynight.js's shared clock —
   the same source the shopkeepers, quarry laborers and high priest read), not
   a private timer, so dragging the time-of-day slider moves the monks:

     06:00 -> 18:00   'work'    out at their own field / chicken coop
     18:00 -> 22:00   'chapel'  gathered at the chapel door (evening office)
     22:00 -> 06:00   'dorm'    inside a dormitory, hidden (asleep)

   18:00 is SHOPKEEPER_SUNSET, i.e. this world's own sunset, so the evening
   office starts exactly when the rest of the city knocks off; 22:00 is a
   plausible compline, comfortably inside night without being midnight.

   A limitation worth stating rather than hiding: the world clock runs at 5
   real seconds per hour (DAYNIGHT_SEC_PER_HOUR, 82-daynight.js), so a whole
   day is two minutes and the evening office is 20 real seconds long, while
   an unhurried walk across the compound takes longer than that. Monks are
   therefore given the fastest speed in the citizen range (they are crossing
   one precinct, not the city, and are late for the office), and the evening
   window is 4 hours rather than the 2-3 a compline would really run, to make
   the chapel phase genuinely reachable. This is the same characteristic the
   shopkeeper and quarry-laborer commutes already have � over 500+ units they
   cannot finish a leg inside a 60-second half-day either � and the intended
   way to inspect any of it is the time-of-day slider, which pins an hour and
   lets the population converge on it.

   Grey robes: the shared lifePersonGeo/lifePedMesh, retinted per instance
   with setColorAt (GREYC, the same stone-grey family LIFE_PEN_ROBE picks the
   penitents' robes from) — NOT a new humanoid mesh, which would cost a draw
   call this build has no reason to spend. One real caveat, stated rather
   than hidden: the tint is a MULTIPLY over the geometry's baked vertex
   colours, so a monk's head and hands go grey along with the robe. The
   alternative (the penitents' own trick of baking the robe colour into a
   dedicated geometry) is exactly the extra mesh + draw call being avoided. */
var MONK_WORK_START = 6, MONK_CHAPEL_START = 18, MONK_DORM_START = 22;
function lifeMonkPhase(hr){
  if(hr >= MONK_CHAPEL_START && hr < MONK_DORM_START) return 'chapel';
  if(hr >= MONK_WORK_START && hr < MONK_CHAPEL_START) return 'work';
  return 'dorm';
}
(function(){
  if(!LIFE_MONK_N) return;
  var phase0 = lifeMonkPhase(dayNightHour());
  var slot = 0, dorms = MONASTERY_SITES.dorms;
  var chapel = MONASTERY_SITES.chapelDoor;
  if(!chapel || !dorms.length) return;
  function addMonk(work){
    var d = dorms[slot % dorms.length];
    LIFE_PEDS[LIFE_MONK_BASE + slot] = {
      monk: true,
      work: work, dorm: { x:d.x, z:d.z, ry:d.ry },
      /* each monk's own standing spot at the chapel: a shallow arc in front
         of the door rather than one shared point, so the evening office
         reads as a congregation */
      chapelSpot: { x: chapel.x + Math.cos(slot*0.7)*(3 + (slot%5)*1.6),
                    z: chapel.z + Math.sin(slot*0.7)*(3 + (slot%5)*1.6), ry: chapel.ry },
      /* same plinth problem as the compound workers above: the abbey is
         built on one flat yb across a footprint whose real terrain spans
         ~12 units, and its field slabs sit 0.30 above that. */
      floorY: MONASTERY_SITES.y + 0.30,
      state: phase0, stateT: 0,
      curve: null, len: 0, dur: 0, speed: rr(3.0,4.0)
    };
    slot++;
  }
  /* 5 per field, laid out across the plot's own rectangle (its recorded
     half-extents and the compound's ry), so a field really does read as
     five monks working it rather than five stacked on its centre. */
  MONASTERY_SITES.fields.forEach(function(f){
    for(var k=0;k<LIFE_MONK_PER_FIELD;k++){
      var u = (k - (LIFE_MONK_PER_FIELD-1)/2) / Math.max(1, LIFE_MONK_PER_FIELD-1) * 1.5;
      var v = (k%2 ? 0.45 : -0.45);
      var p = loc(f.x, f.z, u*f.hw, v*f.hz, f.ry);
      addMonk({ x:p[0], z:p[1] });
    }
  });
  /* 2 per chicken coop, either side of the run's own tending corner */
  MONASTERY_SITES.coops.forEach(function(c){
    for(var k=0;k<LIFE_MONK_PER_COOP;k++){
      var p = loc(c.x, c.z, (k?1.8:-1.8), (k?1.2:-1.2), c.ry);
      addMonk({ x:p[0], z:p[1] });
    }
  });
  window._monks = { n: slot, base: LIFE_MONK_BASE,
                    fields: MONASTERY_SITES.fields.length, perField: LIFE_MONK_PER_FIELD,
                    coops: MONASTERY_SITES.coops.length, perCoop: LIFE_MONK_PER_COOP,
                    dorms: dorms.length,
                    hours: { work: MONK_WORK_START, chapel: MONK_CHAPEL_START, dorm: MONK_DORM_START } };
})();

/* per-instance colour on the shared pedestrian mesh. setColorAt allocates
   instanceColor ZERO-filled the first time it is called (checked directly in
   this build's own three.min.js, not assumed), so every ordinary pedestrian —
   and the trailing strider-rider slots 79-striders.js drives directly — must
   be set to white first or they would all render black. Done once, at init,
   before the first frame, so the material still compiles with
   USE_INSTANCING_COLOR present. No new mesh, no new draw call. */
(function(){
  if(!LIFE_MONK_N) return;
  var white = new THREE.Color(0xffffff), robe = new THREE.Color(GREYC[2]);
  for(var i=0;i<LIFE_PED_N;i++) lifePedMesh.setColorAt(i, white);
  for(var m=0;m<LIFE_MONK_N;m++) lifePedMesh.setColorAt(LIFE_MONK_BASE+m, robe);
  if(lifePedMesh.instanceColor) lifePedMesh.instanceColor.needsUpdate = true;
  if(window._monks){ window._monks.robe = '#'+robe.getHexString();
                     window._monks.tinted = !!lifePedMesh.instanceColor; }
})();

/* a shopkeeper's own 4-state commute — separate from the rambling-
   pedestrian branch below since it's keyed to the clock, not a
   destination-pool pick. 'atHome': idle indoors (hidden, scale0 — same
   convention 'boarded' below uses for "not on scene"). 'atStall':
   idle-wander right behind the counter, same small-radius idea as the
   clergy/penitent idle posts. 'toStall'/'toHome': the ordinary
   lifePedBuildLeg walk, identical mechanic to 'walk' below. */
function updateShopkeeper(cz, idx){
  var hr = dayNightHour();
  var wantStall = (hr >= SHOPKEEPER_SUNRISE && hr < SHOPKEEPER_SUNSET);
  if(cz.state === 'atHome'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(wantStall){
      cz.curve = lifePedBuildLeg(cz.home.x, cz.home.z, cz.stall.x, cz.stall.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toStall'; cz.stateT = 0;
    }
    return;
  }
  if(cz.state === 'atStall'){
    var wander = idx*1.3 + cz.stateT*0.5;
    var hx = cz.stall.x + Math.sin(wander)*1.0, hz = cz.stall.z + Math.cos(wander*0.7)*1.0;
    lifePedTmpPos.set(hx, Math.max(LIFE_Y, lifeGroundY(hx,hz)+0.15), hz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, cz.stall.ry||0);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(!wantStall){
      cz.curve = lifePedBuildLeg(cz.stall.x, cz.stall.z, cz.home.x, cz.home.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toHome'; cz.stateT = 0;
    }
    return;
  }
  /* 'toStall' / 'toHome' */
  if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
  var raw = Math.min(1, cz.stateT/cz.dur);
  var t = raw*raw*(3-2*raw);
  cz.curve.getPointAt(t, lifePedTmpPos);
  lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
  var tTan = Math.min(0.995, Math.max(0.005, t));
  cz.curve.getTangentAt(tTan, lifePedTmpDir);
  var yaw = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
  lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
  lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
  lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
  if(raw >= 1){ cz.state = (cz.state === 'toStall') ? 'atStall' : 'atHome'; cz.stateT = 0; cz.dur = 0; }
}
/* a quarry laborer's own 4-state commute — verbatim the same shape as
   updateShopkeeper() just above (home <-> work site instead of
   home <-> stall), not a new mechanism: 'atHome' idle indoors,
   'atWork' idle-wander at the quarry site itself (same small-radius
   idea), 'toWork'/'toHome' the ordinary lifePedBuildLeg walk. */
function updateQuarryLaborer(cz, idx){
  var hr = dayNightHour();
  var wantWork = (hr >= QUARRY_SUNRISE && hr < QUARRY_SUNSET);
  if(cz.state === 'atHome'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(wantWork){
      cz.curve = lifePedBuildLeg(cz.home.x, cz.home.z, cz.work.x, cz.work.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toWork'; cz.stateT = 0;
    }
    return;
  }
  if(cz.state === 'atWork'){
    var wander = idx*1.3 + cz.stateT*0.5;
    var hx = cz.work.x + Math.sin(wander)*2.2, hz = cz.work.z + Math.cos(wander*0.7)*2.2;
    lifePedTmpPos.set(hx, Math.max(LIFE_Y, lifeGroundY(hx,hz)+0.15), hz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(!wantWork){
      cz.curve = lifePedBuildLeg(cz.work.x, cz.work.z, cz.home.x, cz.home.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toHome'; cz.stateT = 0;
    }
    return;
  }
  /* 'toWork' / 'toHome' */
  if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
  var raw2 = Math.min(1, cz.stateT/cz.dur);
  var t2 = raw2*raw2*(3-2*raw2);
  cz.curve.getPointAt(t2, lifePedTmpPos);
  lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
  var tTan2 = Math.min(0.995, Math.max(0.005, t2));
  cz.curve.getTangentAt(tTan2, lifePedTmpDir);
  var yaw2 = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
  lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw2);
  lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
  lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
  if(raw2 >= 1){ cz.state = (cz.state === 'toWork') ? 'atWork' : 'atHome'; cz.stateT = 0; cz.dur = 0; }
}
/* a compound garden worker: literally updateQuarryLaborer's own shape with
   'atHome' pointed at the compound building's front step and 'atWork' at
   that worker's own spot in the garden. Kept as its own function rather than
   a flag on the quarry one only because the two populations' hour pairs are
   independent constants — the behaviour is deliberately identical. */
function updateCompoundWorker(cz, idx){
  var hr = dayNightHour();
  var wantWork = (hr >= COMPOUND_WORKER_SUNRISE && hr < COMPOUND_WORKER_SUNSET);
  if(cz.state === 'atHome'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(wantWork){
      cz.curve = lifePedBuildLeg(cz.home.x, cz.home.z, cz.work.x, cz.work.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toWork'; cz.stateT = 0;
    }
    return;
  }
  if(cz.state === 'atWork'){
    /* tending: a tight stoop-and-shuffle round the bed, a much smaller
       radius than the quarry's, since a garden bed is a small thing */
    var wander = idx*1.3 + cz.stateT*0.45;
    var gx = cz.work.x + Math.sin(wander)*1.1, gz = cz.work.z + Math.cos(wander*0.7)*1.1;
    lifePedTmpPos.set(gx, lifePedFloorY(cz, gx, gz), gz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(!wantWork){
      cz.curve = lifePedBuildLeg(cz.work.x, cz.work.z, cz.home.x, cz.home.z);
      cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
      cz.state = 'toHome'; cz.stateT = 0;
    }
    return;
  }
  lifePedWalkLeg(cz, idx, (cz.state === 'toWork') ? 'atWork' : 'atHome');
}

/* the shared "advance along cz.curve, face the tangent, arrive" body the
   walking half of every clock-driven commuter above runs. Factored out here
   (rather than copied a fourth time) when the monks needed a THREE-way
   arrival — 'toField'/'toChapel'/'toDorm' cannot be expressed by the
   two-way ternary the shopkeeper/quarry versions end with. */
/* ground height for a figure standing on a built precinct's own floor:
   lifeGroundY() handles causeways, bridges, canton decks and piers, but a
   walled compound's plinth is none of those, so anyone inside one needs the
   plinth level as a floor under the terrain answer. cz.floorY is set only by
   the two populations that live inside such a precinct; everyone else is
   unaffected. */
function lifePedFloorY(cz, x, z){
  var g = lifeGroundY(x, z) + 0.15;
  return Math.max(LIFE_Y, cz.floorY ? Math.max(g, cz.floorY) : g);
}
function lifePedWalkLeg(cz, idx, arriveState){
  if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
  var raw = Math.min(1, cz.stateT/cz.dur);
  var t = raw*raw*(3-2*raw);
  cz.curve.getPointAt(t, lifePedTmpPos);
  lifePedTmpPos.y = lifePedFloorY(cz, lifePedTmpPos.x, lifePedTmpPos.z);
  var tTan = Math.min(0.995, Math.max(0.005, t));
  cz.curve.getTangentAt(tTan, lifePedTmpDir);
  lifePedTmpQuat.setFromAxisAngle(LIFE_UP, Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z));
  lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
  lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
  if(raw >= 1){ cz.state = arriveState; cz.stateT = 0; cz.dur = 0; }
}

/* a monk's own day: three CLOCK-driven posts (field or coop / chapel door /
   dormitory) with a walk between each, rather than the two-state commute
   the shopkeepers and quarry laborers run. The posted states are the
   penitents' own idle-wander primitive; the transitions are driven by
   lifeMonkPhase(dayNightHour()) so the time-of-day slider moves them.
   'dorm' hides the instance (scale0), the same "not on scene" convention
   'atHome'/'boarded' already use — monks are asleep indoors at night. */
function lifeMonkPost(cz){
  return cz.state === 'chapel' ? cz.chapelSpot : (cz.state === 'work' ? cz.work : cz.dorm);
}
function updateMonk(cz, idx){
  var want = lifeMonkPhase(dayNightHour());
  if(cz.state === 'work' || cz.state === 'chapel'){
    var post = lifeMonkPost(cz);
    /* at the chapel they stand near-still on a fixed heading derived from
       the chapel's own ry (the same shorthand updateShopkeeper's 'atStall'
       uses � loc()'s ry and the walk's atan2(dir.x,dir.z) yaw are different
       conventions, so this is a consistent crowd facing, not a door-accurate
       one); in the fields they work a small patch, so only the field post
       actually wanders. */
    var atChapel = (cz.state === 'chapel');
    var wander = idx*1.3 + cz.stateT*(atChapel ? 0.12 : 0.5);
    var r = atChapel ? 0.35 : 1.5;
    var mx = post.x + Math.sin(wander)*r, mz = post.z + Math.cos(wander*0.7)*r;
    lifePedTmpPos.set(mx, lifePedFloorY(cz, mx, mz), mz);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, atChapel ? (post.ry||0) + Math.PI : wander);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(want !== cz.state) lifeMonkDepart(cz, post, want);
    return;
  }
  if(cz.state === 'dorm'){
    lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(want !== 'dorm') lifeMonkDepart(cz, cz.dorm, want);
    return;
  }
  /* 'toWork' / 'toChapel' / 'toDorm' */
  lifePedWalkLeg(cz, idx, cz.state === 'toWork' ? 'work' : (cz.state === 'toChapel' ? 'chapel' : 'dorm'));
}
function lifeMonkDepart(cz, from, want){
  var to = want === 'chapel' ? cz.chapelSpot : (want === 'work' ? cz.work : cz.dorm);
  cz.curve = lifePedBuildLeg(from.x, from.z, to.x, to.z);
  cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
  cz.state = want === 'chapel' ? 'toChapel' : (want === 'work' ? 'toWork' : 'toDorm');
  cz.stateT = 0;
}
function updatePedestrians(dt){
  LIFE_PED_T += dt;
  LIFE_PEDS.forEach(function(cz, idx){
    if(!cz){ LIFE_PEDS[idx] = lifePedSpawn(); return; }
    cz.stateT += dt;
    if(cz.shopkeeper){ updateShopkeeper(cz, idx); return; }
    if(cz.quarryLaborer){ updateQuarryLaborer(cz, idx); return; }
    if(cz.compoundWorker){ updateCompoundWorker(cz, idx); return; }
    if(cz.monk){ updateMonk(cz, idx); return; }
    if(cz.state === 'boarded'){
      lifePedTmpMat.compose(lifePedTmpPos.set(0,0,0), lifePedTmpQuat.identity(), lifePedTmpScale0);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      return;
    }
    if(cz.state === 'queued'){
      /* stand and wait at the dock — visible, not moving; lifeFerryBoard
         (above) is what promotes this to 'boarded' when a ferry actually
         has room. */
      lifePedTmpPos.set(cz.destDoor.x, Math.max(LIFE_Y, lifeGroundY(cz.destDoor.x, cz.destDoor.z) + 0.15), cz.destDoor.z);
      lifePedTmpQuat.setFromAxisAngle(LIFE_UP, cz.destDoor.ry || 0);
      lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      return;
    }
    if(cz.state === 'hangout'){
      var wander = cz.stateT*0.6 + idx*1.7;
      var hoX = cz.destDoor.x + Math.sin(wander)*2.2, hoZ = cz.destDoor.z + Math.cos(wander*0.7)*2.2;
      lifePedTmpPos.set(hoX, Math.max(LIFE_Y, lifeGroundY(hoX, hoZ) + 0.15), hoZ);
      lifePedTmpQuat.setFromAxisAngle(LIFE_UP, wander);
      lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
      lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
      if(LIFE_PED_T >= cz.hangUntil){
        var wasCat = cz.destDoor.cat;
        cz.destDoor.active--;
        var nextLeg = lifePedRambleTarget(cz.destDoor.x, cz.destDoor.z, wasCat);   /* door-transit rule — see lifePedRambleTarget */
        if(nextLeg){
          var next = nextLeg.dest;
          next.active++;
          cz.curve = nextLeg.curve;
          cz.len = cz.curve.getLength(); cz.dur = Math.max(3, cz.len/cz.speed);
          cz.destDoor = next; cz.state = 'walk'; cz.stateT = 0;
        }else{
          LIFE_PEDS[idx] = lifePedSpawn();
        }
      }
      return;
    }
    /* 'walk' */
    if(cz.dur === 0) cz.dur = Math.max(3, cz.len/cz.speed);
    var raw = Math.min(1, cz.stateT/cz.dur);
    var t = raw*raw*(3-2*raw);
    cz.curve.getPointAt(t, lifePedTmpPos);
    lifePedTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifePedTmpPos.x, lifePedTmpPos.z) + 0.15);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cz.curve.getTangentAt(tTan, lifePedTmpDir);
    var yaw = Math.atan2(lifePedTmpDir.x, lifePedTmpDir.z);
    lifePedTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifePedTmpMat.compose(lifePedTmpPos, lifePedTmpQuat, lifePedTmpScale1);
    lifePedMesh.setMatrixAt(idx, lifePedTmpMat);
    if(raw >= 1){
      var dest = cz.destDoor;
      dest.entryCount++;
      if(dest.cat === 'market' || dest.cat === 'park' || dest.cat === 'shrine'){
        cz.state = 'hangout'; cz.stateT = 0; cz.hangUntil = LIFE_PED_T + rr(8,20);
      }else if(dest.cat === 'dock' || dest.cat === 'strider'){
        dest.queueCount = (dest.queueCount||0) + 1;
        cz.state = 'queued'; cz.stateT = 0;
      }else{
        dest.active--;
        LIFE_PEDS[idx] = lifePedSpawn();
      }
    }
  });
  lifePedMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== citizens: penitents =========================
   5 groups of 3 — a flagellant, a banner-bearer, one reading a book of
   scripture — walking a CLOSED loop between the Temple and every shrine
   (the two original island ones plus the 3 new standalone ones just added
   to LIFE_SHRINE_STOPS in 65-facade.js) and nowhere else: never a market,
   park, dock or shop like the rambling pedestrians above. Grey robes.
   Reuses lifePedBuildLeg (land height + canton/causeway-aware ground,
   already correct) for the walk, and a walk/pray state machine that's the
   clergy's own idle-post idea (LIFE_CLERGY_POSTS/updateClergy above)
   applied to a MOVING post instead of a fixed one: walk to a stop, stand
   and idle-wander there a while ("pray"), pick a new stop, repeat.

   Group, not individuals: all 3 members of a group share ONE curve/timing
   and just carry a fixed lateral offset (loc()'s own local x/z convention,
   same as everywhere else in this file), so they read as a small
   procession rather than 3 unrelated wanderers who happen to overlap.

   ONE shared InstancedMesh/draw call for all 15 — a real Three.js
   constraint, not an oversight: an InstancedMesh's geometry is ONE buffer
   shared by every instance, so only the per-instance 4x4 transform (and,
   via setColorAt below, a per-instance colour multiply — the exact
   mechanism 45-kit.js's own emitBuckets() already uses for the entire
   static bake) can vary per instance; the SHAPE cannot. Three fully
   distinct silhouettes would need three separate meshes/draw calls, which
   this session's already-tight BUDGET.drawCalls (05-palette.js) can't
   absorb for a 15-strong population. Splits the difference: the held
   item is baked pure white on the shared geometry, then setColorAt tints
   it MARBLEC[2] (the same pale marble alias the funerary temple uses) for
   the banner role only, so that role gets a real, distinct pale banner;
   the flagellant and book-reader keep the plain white item and read
   identically to each other. Documented simplification, not a miss — the
   same trade already made twice in this file (the ordinator officer's
   plume, the clergy priest/templar split), both real geometry, no spare
   draw call to tell every role apart. `role` is still real per-instance
   DATA either way, same "data now" pattern as those two. */
var LIFE_PEN_ROBE = pick(GREYC);
var lifePenitentHullParts = [
  { geo: new THREE.CylinderGeometry(0.28*LIFE_PEOPLE_SCALE, 0.44*LIFE_PEOPLE_SCALE, 1.2*LIFE_PEOPLE_SCALE, 7), color: LIFE_PEN_ROBE },
  { geo: new THREE.BoxGeometry(0.38*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE).translate(0, 0.80*LIFE_PEOPLE_SCALE, 0), color: LIFE_SKIN },
  { geo: new THREE.ConeGeometry(0.24*LIFE_PEOPLE_SCALE, 0.30*LIFE_PEOPLE_SCALE, 6).translate(0, 1.00*LIFE_PEOPLE_SCALE, 0), color: shade(LIFE_PEN_ROBE,-0.22) },
  /* the held item — book / furled banner / flail, all baked white so the
     per-instance colour above can turn just the banner role's copy pale */
  { geo: new THREE.BoxGeometry(0.05*LIFE_PEOPLE_SCALE, 0.5*LIFE_PEOPLE_SCALE, 0.34*LIFE_PEOPLE_SCALE).translate(0.30*LIFE_PEOPLE_SCALE, 0.62*LIFE_PEOPLE_SCALE, 0), color: 0xffffff }
];
var lifePenitentGeo = lifeMergeGeoms(lifePenitentHullParts);
var LIFE_PEN_GROUPS = 5, LIFE_PEN_PER = 3, LIFE_PEN_N = LIFE_PEN_GROUPS*LIFE_PEN_PER;
var LIFE_PEN_ROLES = ['flagellant','banner','book'];
var LIFE_PEN_SIDE = [-1.15, 0, 1.15];   /* flagellant left, banner centre, book right of the group's own line of travel */
var lifePenitentMesh = new THREE.InstancedMesh(lifePenitentGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_PEN_N);
lifePenitentMesh.userData.life = true; lifePenitentMesh.userData.inspectLabel = 'Penitent pilgrim';
lifePenitentMesh.frustumCulled = false;
scene.add(lifePenitentMesh);

/* the closed stop pool: the Temple canton's own door(s) (LIFE_DOORS' own
   'temple' category, built above from window._plinthDoors) plus every
   shrine, old and new — LIFE_SHRINE_STOPS already carries all 5 by this
   point in file order (65-facade.js runs before this file, and the 3
   standalone ones are appended there before this file ever reads the
   array). Falls back to the high priest's own Temple rest point
   (LIFE_HIGHPRIEST_REST is defined just above, in the clergy section) if
   LIFE_DOORS somehow has no 'temple' entry, so this can never end up with
   too few stops to form a loop. Falls back to the Temple canton's own
   CPIERS entry directly (NOT LIFE_HIGHPRIEST_REST — that's defined further
   down, in the clergy section below this one, so referencing it here would
   be a forward reference to an undefined var at this point in file order;
   CPIERS is real layout data from 30-layout.js, long since loaded). */
var LIFE_PEN_STOPS = LIFE_DOORS.filter(function(d){ return d.cat === 'temple'; })
  .map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; })
  .concat(LIFE_SHRINE_STOPS.map(function(s){ return { x:s.x, z:s.z, ry:s.ry }; }));
if(!LIFE_PEN_STOPS.length){
  var lifePenTempleFallback = CPIERS.filter(function(p){ return p.canton === 'Temple'; })[0];
  if(lifePenTempleFallback) LIFE_PEN_STOPS.push({ x:lifePenTempleFallback.x1, z:lifePenTempleFallback.z1, ry:lifePenTempleFallback.ry });
}
function lifePenPickStop(exclude){
  var pool = LIFE_PEN_STOPS.filter(function(s){ return s !== exclude; });
  return pick(pool.length ? pool : LIFE_PEN_STOPS);
}

var LIFE_PEN_GROUPS_ARR = [];
(function(){
  for(var g=0; g<LIFE_PEN_GROUPS; g++){
    var origin = pick(LIFE_PEN_STOPS);
    var dest = lifePenPickStop(origin);
    var curve = lifePedBuildLeg(origin.x, origin.z, dest.x, dest.z);
    var grp = {
      curve: curve, len: curve.getLength(), dur: 0,
      speed: rr(1.7, 2.3), state: 'walk', stateT: 0,
      destStop: dest, prayFor: rr(8, 16)
    };
    grp.dur = Math.max(4, grp.len/grp.speed);
    grp.stateT = rr(0, grp.dur);   /* stagger the 5 groups so they don't all set off together */
    LIFE_PEN_GROUPS_ARR.push(grp);
  }
})();
window._penitents = { groups: LIFE_PEN_GROUPS_ARR.length, total: LIFE_PEN_N, stops: LIFE_PEN_STOPS.length };   /* diagnostic */

/* per-instance colour: identity (white) for flagellant/book, MARBLEC[2]
   (pale marble) for the banner role — set once at init, same setColorAt
   mechanism 45-kit.js's own emitBuckets() already exercises for the whole
   static bake, so it's proven to combine correctly with vertexColors. */
(function(){
  var white = new THREE.Color(0xffffff), pale = new THREE.Color(MARBLEC[2]);
  for(var g=0; g<LIFE_PEN_GROUPS; g++){
    for(var r=0; r<LIFE_PEN_PER; r++){
      lifePenitentMesh.setColorAt(g*LIFE_PEN_PER+r, LIFE_PEN_ROLES[r]==='banner' ? pale : white);
    }
  }
  if(lifePenitentMesh.instanceColor) lifePenitentMesh.instanceColor.needsUpdate = true;
})();

var lifePenTmpPos = new THREE.Vector3(), lifePenTmpDir = new THREE.Vector3();
var lifePenTmpQuat = new THREE.Quaternion(), lifePenTmpMat = new THREE.Matrix4();
var lifePenTmpScale1 = new THREE.Vector3(1,1,1), lifePenTmpPos2 = new THREE.Vector3();
function updatePenitents(dt){
  LIFE_PEN_GROUPS_ARR.forEach(function(grp, gi){
    grp.stateT += dt;
    var px, pz, yaw;
    if(grp.state === 'pray'){
      /* idle-wander in place — the same primitive the rambling
         pedestrians' own 'hangout' state and the clergy's own posted
         idle-wander both already use, just centred on this group's
         current stop instead of a fixed post. */
      var wander = grp.stateT*0.5 + gi*2.1;
      px = grp.destStop.x + Math.sin(wander)*1.4;
      pz = grp.destStop.z + Math.cos(wander*0.7)*1.4;
      yaw = wander;
      if(grp.stateT >= grp.prayFor){
        var next = lifePenPickStop(grp.destStop);
        grp.curve = lifePedBuildLeg(grp.destStop.x, grp.destStop.z, next.x, next.z);
        grp.len = grp.curve.getLength(); grp.dur = Math.max(4, grp.len/grp.speed);
        grp.destStop = next; grp.state = 'walk'; grp.stateT = 0;
      }
    }else{
      if(grp.dur === 0) grp.dur = Math.max(4, grp.len/grp.speed);
      var raw = Math.min(1, grp.stateT/grp.dur);
      var t = raw*raw*(3-2*raw);
      grp.curve.getPointAt(t, lifePenTmpPos);
      px = lifePenTmpPos.x; pz = lifePenTmpPos.z;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      grp.curve.getTangentAt(tTan, lifePenTmpDir);
      yaw = Math.atan2(lifePenTmpDir.x, lifePenTmpDir.z);
      if(raw >= 1){ grp.state = 'pray'; grp.stateT = 0; grp.prayFor = rr(8,16); }
    }
    for(var r=0; r<LIFE_PEN_PER; r++){
      var off = loc(px, pz, LIFE_PEN_SIDE[r], 0, yaw);
      var gy = Math.max(LIFE_Y, lifeGroundY(off[0], off[1]) + 0.15);
      lifePenTmpPos2.set(off[0], gy, off[1]);
      lifePenTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifePenTmpMat.compose(lifePenTmpPos2, lifePenTmpQuat, lifePenTmpScale1);
      lifePenitentMesh.setMatrixAt(gi*LIFE_PEN_PER+r, lifePenTmpMat);
    }
  });
  lifePenitentMesh.instanceMatrix.needsUpdate = true;
}

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

/* ============================== citizens: guild workers ======================
   The Guild canton's own working population — smiths at the forge,
   warriors sparring in their yard, the alchemist tending the annex
   rooftop garden. GUILD_WORK_POSTS (50-cantons.js's guildHallsDeck(),
   which runs at file order 50, well before this file) already carries
   every post's world position/role/facing — same cross-file hand-off as
   LIFE_SHRINE_STOPS/TEMPLE_ALTAR above.

   ONE new InstancedMesh/draw call for the whole population (BUDGET.
   drawCalls bumped 52->53, 05-palette.js — see that file's own comment
   for why, matching the water-taxi precedent from earlier this session).
   The cheaper option — folding these posts into an EXISTING population's
   mesh (LIFE_ORD_POSTS/lifeOrdMesh or LIFE_CLERGY_POSTS/lifeClergyMesh,
   both already the exact "array of fixed posts + one shared instanced
   geometry" shape this needs, and both would cost zero extra draw
   calls) was ruled out on purpose: an ordinator carries a drawn sword
   and shield, a clergy figure a robe and mitre, and reusing either for
   "a smith hammering" or "an alchemist tending herbs" would be a worse
   visual mismatch than the existing role-reuses in this file allow (the
   goat repurposing clergy geometry, the penitent banner-role retint) —
   those reuse ONE population for a variant of the SAME population's own
   identity (another clergy figure, another temple animal); a smith is
   not a soldier or a priest. It would also mislabel the inspector
   (userData.inspectLabel) for every guild worker as "Ordinator" or
   "Temple clergy". One shared, neutral, undecorated body (no armour, no
   robe) that colour alone turns into smith/warrior/tender is the same
   "one shape, many roles via colour" trade this file already makes
   repeatedly, just given its own honestly-labelled population instead of
   grafted onto an unrelated one — and one new draw call for a dozen
   working NPCs across all 4 guild halls combined is far cheaper than the
   one-per-hall alternative the brief flagged as the real risk. */
var lifeGuildHullParts = [
  /* torso + head + held tool, all baked pure white so setColorAt (below)
     gives each instance its own clean, fully-controlled role tint —
     smith soot-dark, warrior crimson/gold, tender jade — rather than
     multiplying against mixed baked-in hues the way the "everyone normal
     except one variant" populations above do. */
  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: 0xffffff },
  /* the held tool: hammer / practice blade / trowel, all abstracted as
     one raised-arm block — geometry can't vary per instance in a shared
     InstancedMesh (only the transform and colour can), so "which tool"
     is left to context (forge/yard/rooftop) and colour, same trade the
     penitent's own held item (78-life.js, above) already makes. */
  { geo: new THREE.BoxGeometry(0.10*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0.10*LIFE_PEOPLE_SCALE).translate(0.28*LIFE_PEOPLE_SCALE, 0.95*LIFE_PEOPLE_SCALE, 0), color: 0xffffff }
];
var lifeGuildGeo = lifeMergeGeoms(lifeGuildHullParts);
var LIFE_GUILD_N = GUILD_WORK_POSTS.length;
var lifeGuildMesh = new THREE.InstancedMesh(lifeGuildGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), Math.max(1, LIFE_GUILD_N));
lifeGuildMesh.userData.life = true; lifeGuildMesh.userData.inspectLabel = 'Guild worker';
lifeGuildMesh.frustumCulled = false;
scene.add(lifeGuildMesh);
(function(){
  /* THIRD PASS: role->colour as an explicit map rather than a growing
     ternary chain, now that carpenter/merchant join smith/tender/warrior —
     carpenter a plain workaday wood-brown (TRUNKC, matches its own sawn
     timber), merchant a rich gold (BANNERC's own warm gold, reused —
     "showpiece stall" reads better in gold than in plain cloth-banner
     crimson/gold picked at random the warrior's own plaques use). */
  var ROLE_COL = {
    smith: new THREE.Color(0x4a3b32),
    tender: new THREE.Color(pick(JADEC)),
    carpenter: new THREE.Color(shade(TRUNKC[0], -0.05)),
    merchant: new THREE.Color(BANNERC[4])
  };
  GUILD_WORK_POSTS.forEach(function(p, idx){
    var col = ROLE_COL[p.role] || new THREE.Color(pick([BANNERC[0],BANNERC[1]]));   /* warrior, and any future role */
    lifeGuildMesh.setColorAt(idx, col);
  });
  if(lifeGuildMesh.instanceColor) lifeGuildMesh.instanceColor.needsUpdate = true;
})();
window._guildWorkers = { total: LIFE_GUILD_N, roles: (function(){
  var r={}; GUILD_WORK_POSTS.forEach(function(p){ r[p.role]=(r[p.role]||0)+1; }); return r;
})() };   /* diagnostic */

var LIFE_GUILD_T = 0;
var lifeGuildTmpPos = new THREE.Vector3(), lifeGuildTmpQuat = new THREE.Quaternion();
var lifeGuildTmpMat = new THREE.Matrix4(), lifeGuildTmpScale1 = new THREE.Vector3(1,1,1);
function updateGuildWorkers(dt){
  LIFE_GUILD_T += dt;
  var t = LIFE_GUILD_T;
  GUILD_WORK_POSTS.forEach(function(p, idx){
    var px, pz, py, yaw;
    if(p.role === 'smith'){
      /* hammering in place: a fast vertical bob timed like an arm/hammer
         swing, over a tight idle-wander drift — a visibly different
         motion primitive from the slow generic posts below, on purpose:
         "working," not "standing." */
      var swing = Math.sin(t*5.5 + idx*1.7);
      px = p.x + Math.sin(t*0.6+idx)*p.radius*0.3;
      pz = p.z + Math.cos(t*0.4+idx)*p.radius*0.3;
      py = p.y + Math.max(0, swing)*0.5;
      yaw = (p.ry||0) + swing*0.35;
    }else if(p.role === 'warrior'){
      /* sparring: lunge toward the partner and pull back along the
         pair's own shared line (pairDx/pairDz, set when the post was
         built in guildHallsDeck()), phase-locked per pair via the post's
         own pairId (NOT the post's global array index — with smiths and
         the tender sharing this same array ahead of the warriors, index
         parity doesn't line up with actual pair membership) so partners
         close and pull back together instead of drifting independently —
         reads as a real paired bout, not two people idling near
         each other. */
      var lunge = Math.sin(t*2.2 + (p.pairId||0)*10)*0.5 + 0.5;
      px = p.x + p.pairDx*lunge*1.6;
      pz = p.z + p.pairDz*lunge*1.6;
      py = p.y;
      yaw = Math.atan2(p.pairDx, p.pairDz) + Math.sin(t*4+idx)*0.2;
    }else if(p.role === 'carpenter'){
      /* THIRD PASS: sawing — the exact same paired-pull-along-a-shared-
         line mechanic the warrior sparring pairs use just above
         (pairDx/pairDz, pairId, set in guildHallsDeck()'s new carpenter
         yard), just slower and steadier: a real two-person pit saw drawn
         back and forth, not a lunging bout. Faces along the log (its own
         ry, set when the post was built) rather than always facing the
         partner, since a sawyer doesn't turn to track the other end. */
      var stroke = Math.sin(t*2.6 + (p.pairId||0)*10);
      px = p.x + p.pairDx*stroke*0.55;
      pz = p.z + p.pairDz*stroke*0.55;
      py = p.y + Math.max(0, Math.sin(t*2.6*2 + (p.pairId||0)*10))*0.10;   /* a small dip on the down-stroke */
      yaw = p.ry||0;
    }else if(p.role === 'merchant'){
      /* THIRD PASS: presenting the goods — a slow half-turn sweep between
         "facing the stall" and "facing outward toward a passer-by," plus
         the same gentle reach-bob the tender's own idle-wander below
         already uses (that primitive already reads as "tending something
         at counter height," which fits a merchant showing off wares just
         as well as it fits pruning an herb trough), so this stays its own
         branch mainly for the distinct facing sweep rather than a wholly
         new motion primitive. */
      var sweep = Math.sin(t*0.5 + idx*1.9);
      px = p.x + Math.sin(t*0.3+idx)*p.radius*0.25;
      pz = p.z + Math.cos(t*0.3+idx)*p.radius*0.25;
      py = p.y + Math.max(0, Math.sin(t*1.2+idx))*0.30;
      yaw = (p.ry||0) + sweep*0.9;
    }else{
      /* tender: the generic posted idle-wander primitive every other
         fixed-post population in this file already uses (ordinators/
         clergy above), plus a slow bend-and-reach bob over the planter
         row for "tending," not just "standing on the roof." */
      var ang = t*0.35 + idx*1.3;
      px = p.x + Math.sin(ang)*p.radius*0.5;
      pz = p.z + Math.cos(ang*0.6)*p.radius*0.5;
      py = p.y + Math.max(0, Math.sin(t*1.4+idx))*0.35;
      yaw = (p.ry||0) + Math.sin(ang*0.4)*0.4;
    }
    lifeGuildTmpPos.set(px, py, pz);
    lifeGuildTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeGuildTmpMat.compose(lifeGuildTmpPos, lifeGuildTmpQuat, lifeGuildTmpScale1);
    lifeGuildMesh.setMatrixAt(idx, lifeGuildTmpMat);
  });
  lifeGuildMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== citizens: merchant caravans =================
   Item 4 of 4 planned populations — the last one. Carts drawn by an ox,
   lizard, or beetle (one species per caravan, "each caravan uses the
   same draft animal"), heading to a harbor dock (PIERS, mainland),
   river dock (LIFE_RBARGE_DOCKS), market (LIFE_DOORS, reused directly —
   pedestrians already classified every market door), or the new
   warehouse district (DIST_WAREHOUSE, 69-district-content.js, a bare
   global since that file runs at order 69, well before this one).
   Unload, then either head back off-map or straight to a DIFFERENT one
   of those four categories — never immediately back to the one just
   left.

   Real, documented simplification for time: a caravan's 1-3 carts, its
   driver (blue, broad hat), 2 guards (grey mail), and its draft animal
   are ALL one rigid merged template — nothing here shows a visibly
   longer convoy for a 3-cart caravan, only `cartCount` as data (the
   same "data now, visual later" call made for ordinator officers and
   pedestrian race). "1-2 hangers-on drawn from the rambling pedestrian
   asset pool" isn't wired up either — pulling real LIFE_PEDS instances
   to visually tag along with a specific moving caravan is real, separate
   work, not attempted here. One more draw call for the combined model —
   see BUDGET.drawCalls, 05-palette.js (currently right at the new
   ceiling, no further room after this).

   The "caravans of 2+ carts must avoid going north of the river" rule
   (avoid the traffic-jam risk of a wide convoy squeezing over one of
   only two river bridges) is implemented directly: the warehouse
   district sits on the river's OPPOSITE bank from everything else this
   system reaches (by construction — see its own DISTRICTS entry,
   30-layout.js), so it's simply excluded as a destination whenever
   cartCount >= 2. */
var lifeCaravanParts = [
  { geo: new THREE.BoxGeometry(3.2,1.6,4.5).translate(0,1.0,-2.5), color: 0x6b4a2e },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(1.6,0.9,-1.3), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(-1.6,0.9,-1.3), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(1.6,0.9,-3.7), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(-1.6,0.9,-3.7), color: 0x3a2a1a },
  { geo: new THREE.BoxGeometry(1.2,1.0,1.2).translate(0.8,2.3,-2.0), color: 0x5a4a38 },
  { geo: new THREE.BoxGeometry(1.0,0.9,1.0).translate(-0.7,2.2,-3.0), color: 0x6a5642 },
  /* the draft animal — one generic quadruped silhouette for all three
     species; ox/lizard/beetle is a data field (sh.animal), not a visual
     variant (see file comment above). */
  { geo: new THREE.CylinderGeometry(0.9,1.1,2.6,8).rotateX(Math.PI/2).translate(0,1.4,2.5), color: 0x7a5c3a },
  { geo: new THREE.BoxGeometry(0.9,0.9,1.1).translate(0,1.8,4.0), color: 0x7a5c3a },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(0.5,0.65,1.6), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(-0.5,0.65,1.6), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(0.5,0.65,3.3), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(-0.5,0.65,3.3), color: 0x5a4028 },
  /* the merchant driver — blue, on the cart's own seat, with a broad hat */
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(0,2.4,-1.0), color: 0x2b4a7a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(0,3.0,-1.0), color: LIFE_SKIN },
  { geo: new THREE.CylinderGeometry(0.5,0.5,0.12,8).translate(0,3.25,-1.0), color: 0x1f3a63 },
  /* 2 guards, plain grey mail, flanking on foot */
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(2.4,1.0,-2.5), color: 0x6a6a6a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(2.4,1.6,-2.5), color: LIFE_SKIN },
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(-2.4,1.0,-2.5), color: 0x6a6a6a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(-2.4,1.6,-2.5), color: LIFE_SKIN }
];
var lifeCaravanGeo = lifeMergeGeoms(lifeCaravanParts);
/* THE 60 BORROWED SLOTS ARE GONE — this mesh is real merchant caravans
   again, nothing else. For several passes it carried a trailing reservation
   of 60 extra instances that 79-striders.js drove as silt strider "cars"
   (the caravan's cart+draft-animal template, scaled 2.3x and retinted),
   because the draw-call budget sat at its hard ceiling and a bespoke
   creature needs its own InstancedMesh. The owner has since raised that
   ceiling, 79-striders.js now builds and drives a real silt strider on two
   meshes of its own, and this reservation has been handed back:
   LIFE_CARAVAN_N drops 150 -> 90, and NOTHING outside this file writes a
   matrix or a colour into lifeCaravanMesh any more.

   That also retires the instanceColor hazard this mesh was the original
   victim of: the strider tinting used to be the first setColorAt() call
   ever made on it, and THREE allocates instanceColor lazily and
   ZERO-initialised, so every real caravan (never explicitly coloured) went
   black the moment that buffer appeared. With no tinting left on this mesh
   the buffer is never allocated at all, and the caravans render from their
   own baked vertex colours exactly as they always did.

   The two constants below are KEPT (unchanged values) because other
   fragments read them and their meanings are still exactly right:
   LIFE_STRIDER_CAR_SLOTS (60) is the strider creature-slot pool — up to 20
   convoys (6 on Route 1, 6 on Route 2, 8 on Route 3) x up to 3 creatures —
   now sized against 79-striders.js's own striderMesh and against
   82-daynight.js's LANTERN_STRIDER_BASE block; LIFE_STRIDER_CAR_BASE (90)
   is the real caravan count, which is what 82-daynight.js's
   LANTERN_CARAVAN_BASE block and the spawn loop below have always actually
   used it for. */
var LIFE_STRIDER_CAR_SLOTS = 60;
var LIFE_STRIDER_CAR_BASE = 90;
var LIFE_CARAVAN_N = LIFE_STRIDER_CAR_BASE;   /* x3 per the owner's "city feels empty" follow-up */
var lifeCaravanMesh = new THREE.InstancedMesh(lifeCaravanGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_CARAVAN_N);
lifeCaravanMesh.userData.life = true; lifeCaravanMesh.userData.inspectLabel = 'Caravan';
lifeCaravanMesh.frustumCulled = false;
scene.add(lifeCaravanMesh);

/* off-map spawn: the SW/West highway's own far end (30-layout.js) —
   already the map's own "off the edge" point for a real road, not a
   made-up coordinate. */
var LIFE_CARAVAN_SPAWN = { x: -3340, z: 1590 };
/* owner: "caravans still occasionally trying to swim" — real bug found by
   direct instrumentation (traced a live caravan's full curve: half its
   route was a smooth, continuous swim straight across the open bay, not
   a jittery spline artifact). PIERS entries (30-layout.js) are x0/z0 =
   the shore ROOT, x1/z1 = the water-side TIP (where a ship actually
   docks) — this was sending land carts to the TIP, i.e. straight out
   into open water by construction; no amount of path refinement can fix
   a destination that's genuinely offshore. x0/z0 (the root, where cargo
   would actually be loaded off a cart) is correct for a cart. */
var LIFE_CARAVAN_HARBOR = PIERS.map(function(p){ return { x:p.x0, z:p.z0, ry: Math.atan2(p.x1-p.x0, p.z1-p.z0) }; });
var LIFE_CARAVAN_RIVER = LIFE_RBARGE_DOCKS.map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; });
var LIFE_CARAVAN_MARKET = LIFE_DOORS.filter(function(d){ return d.cat === 'market'; }).map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; });
var LIFE_CARAVAN_WAREHOUSE = DIST_WAREHOUSE.map(function(d){
  var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; }); cx/=d.poly.length; cz/=d.poly.length;
  return { x:cx, z:cz, ry:0 };
});
/* ---- the four TRADE-SITE categories (owner: "fishing docks, mines,
   quarries and taverns should be caravan destinations") ---------------------
   Every one of them is a list some BUILDER fragment already publishes, read
   wholesale here the way LIFE_RBARGE_DOCKS/GUILD_WORK_POSTS/
   LIFE_STRIDER_STATIONS are — no coordinate is written down twice:
     fishdock  LIFE_FISH_CART_STOPS (65-facade.js) — the LANDWARD point per
               dock, not the pier: a cart cannot drive onto a 9.5-wide deck
               over open water, and the 5 ShoalBank piers hang off a trestle
               with no landward shore at all, so that jetty contributes its
               single canton-side anchor (already deduped in that file).
     mine      MINE_CART_STOPS (71-industry.js) — the foot of each mine's own
               ore-cart rails.
     quarry    QUARRY_CART_STOPS (71-industry.js) — the toe of each pit's haul
               ramp, the point the quarry connector road was built to meet.
     tavern    LIFE_DOORS, cat 'tavern' — already classified above, exactly
               the way 'market' is; no new list needed for these at all.
   NO economy is invented here: there is no notion of origin vs destination,
   goods, or weight anywhere in this system (a caravan picks a category
   uniformly, then a point in it, and the ONLY rule is the existing
   river-crossing one), so these four join as four more equal categories
   rather than as sources and sinks. A tavern therefore sees as much traffic
   as a quarry; that is the honest description of what this code does.

   ROAD-REACHABILITY IS TESTED HERE, ONCE, rather than left to the per-pick
   retry loop: these sites sit out in wilderness where the road graph is
   thinnest, and a pool full of unreachable points would burn all 10 retries
   in lifeCaravanPickDest and fall through to its last-resort unchecked pick —
   i.e. exactly the cross-country route lifeRoadReachable exists to prevent.
   Same claim()-style reject: a site with no road to it is simply not a
   destination, and window._caravanDests records how many were dropped. */
function lifeCaravanRoadPool(list){
  return (list||[]).filter(function(p){
    return lifeRoadReachable(LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z, p.x, p.z);
  }).map(function(p){ return { x:p.x, z:p.z, ry:p.ry||0 }; });
}
var LIFE_CARAVAN_FISHDOCK = lifeCaravanRoadPool(typeof LIFE_FISH_CART_STOPS !== 'undefined' ? LIFE_FISH_CART_STOPS : []);
var LIFE_CARAVAN_MINE     = lifeCaravanRoadPool(typeof MINE_CART_STOPS !== 'undefined' ? MINE_CART_STOPS : []);
var LIFE_CARAVAN_QUARRY   = lifeCaravanRoadPool(typeof QUARRY_CART_STOPS !== 'undefined' ? QUARRY_CART_STOPS : []);
var LIFE_CARAVAN_TAVERN   = lifeCaravanRoadPool(LIFE_DOORS.filter(function(d){ return d.cat === 'tavern'; }));
function lifeCaravanPool(cat){
  if(cat === 'harbor') return LIFE_CARAVAN_HARBOR;
  if(cat === 'river') return LIFE_CARAVAN_RIVER;
  if(cat === 'market') return LIFE_CARAVAN_MARKET;
  if(cat === 'fishdock') return LIFE_CARAVAN_FISHDOCK;
  if(cat === 'mine') return LIFE_CARAVAN_MINE;
  if(cat === 'quarry') return LIFE_CARAVAN_QUARRY;
  if(cat === 'tavern') return LIFE_CARAVAN_TAVERN;
  return LIFE_CARAVAN_WAREHOUSE;
}
var LIFE_CARAVAN_CATS = ['harbor','river','market','warehouse','fishdock','mine','quarry','tavern'];
/* diagnostic: what each pool ended up holding, and what the reachability
   filter above actually rejected — the honest record of which sites a cart
   can and cannot get to. */
window._caravanDests = {
  cats: LIFE_CARAVAN_CATS,
  pools: { harbor: LIFE_CARAVAN_HARBOR.length, river: LIFE_CARAVAN_RIVER.length,
           market: LIFE_CARAVAN_MARKET.length, warehouse: LIFE_CARAVAN_WAREHOUSE.length,
           fishdock: LIFE_CARAVAN_FISHDOCK.length, mine: LIFE_CARAVAN_MINE.length,
           quarry: LIFE_CARAVAN_QUARRY.length, tavern: LIFE_CARAVAN_TAVERN.length },
  offered: { fishdock: (typeof LIFE_FISH_CART_STOPS !== 'undefined' ? LIFE_FISH_CART_STOPS.length : 0),
             mine: (typeof MINE_CART_STOPS !== 'undefined' ? MINE_CART_STOPS.length : 0),
             quarry: (typeof QUARRY_CART_STOPS !== 'undefined' ? QUARRY_CART_STOPS.length : 0),
             tavern: LIFE_DOORS.filter(function(d){ return d.cat === 'tavern'; }).length },
  points: { fishdock: LIFE_CARAVAN_FISHDOCK, mine: LIFE_CARAVAN_MINE, quarry: LIFE_CARAVAN_QUARRY }
};
/* owner: "continue tweaking the cart pathfinding, they still try climbing
   the hill and going for swims". The rest of that fix is upstream (a road
   graph that is actually connected — 30-layout.js section 5g), but the last
   piece belongs here: a destination with NO road route from where the cart
   is standing must be REJECTED and another picked, exactly the way claim()
   rejection works everywhere else in this codebase, rather than handed to
   lifeCartBuildLeg to invent a cross-country line for. `fromX/fromZ` is the
   cart's actual current position, so this is a real per-cart test, not a
   global one. Bounded retries with an honest last resort: if nothing in any
   pool is reachable (it always is, in practice — the main component now
   holds 95%+ of the graph) the original unchecked pick still comes back, so
   a caravan can never end up with no destination at all and freeze. */
function lifeCaravanPickDest(excludeCat, cartCount, fromX, fromZ){
  var cats = LIFE_CARAVAN_CATS.filter(function(c){
    if(c === excludeCat) return false;
    if(c === 'warehouse' && cartCount >= 2) return false;   /* the river-crossing rule */
    return lifeCaravanPool(c).length > 0;
  });
  if(!cats.length) return null;
  var first = null;
  for(var tries=0; tries<10; tries++){
    var cat = pick(cats);
    var cand = { cat:cat, pt: pick(lifeCaravanPool(cat)) };
    if(!first) first = cand;
    if(fromX === undefined) return cand;
    if(lifeRoadReachable(fromX, fromZ, cand.pt.x, cand.pt.z)) return cand;
  }
  return first;
}
function lifeCaravanSpawn(){
  var cartCount = ri(1,3);
  var picked = lifeCaravanPickDest(null, cartCount, LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z);
  if(!picked) return null;
  var curve = lifeCartBuildLeg(LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z, picked.pt.x, picked.pt.z);
  return {
    id: LIFE_CITIZEN_ID++, animal: pick(['ox','lizard','beetle']), cartCount: cartCount,
    /* real gap measured directly: off-map routes run 3500-5300 units at
       the originally-picked rr(4,6) — 750-1125s (12-19 min) per leg, so
       every caravan sat "arriving" for the caravan system's ENTIRE
       verification window (240s) without a single one ever completing a
       leg. The owner wants them "come in from off the map regularly" —
       bumped to a game-paced trot instead of a literal walking speed,
       landing most legs in the 2-4 minute range. */
    state: 'arriving', stateT: 0, speed: rr(20,28),
    curve: curve, len: curve.getLength(), dur: 0,
    destCat: picked.cat, destPt: picked.pt, facingYaw: undefined,
    /* owner: "space the carts out a little more so they don't clip each
       other" — a persistent per-caravan lateral offset (perpendicular to
       whatever direction it's currently travelling), re-rolled each new
       leg so it isn't the exact same convoy re-clipping every trip. Cheap
       real fix for the common case (several caravans sharing the same
       road at once, now riding side by side instead of stacked); it
       doesn't solve two routes genuinely crossing at an angle, but that's
       a rare instant overlap, not a standing clip. */
    laneOffset: rr(-4.0, 4.0)
  };
}
var LIFE_CARAVANS = [];
(function(){
  /* LIFE_CARAVAN_N == LIFE_STRIDER_CAR_BASE == 90 now: the strider
     reservation that used to sit past this loop has been handed back (see
     the constants' own comment above), so every slot on this mesh gets a
     real caravan and nothing else writes to it. */
  for(var i=0;i<LIFE_STRIDER_CAR_BASE;i++){
    var cv = lifeCaravanSpawn();
    /* stagger the initial population along its own route (a fresh
       load-time head start only — respawns after this naturally spread
       out over time as each one completes its own leg independently) so
       they don't all sit clumped at the map edge for the first several
       minutes after the page loads. */
    if(cv){ cv.dur = Math.max(6, cv.len/cv.speed); cv.stateT = rr(0, cv.dur); }
    LIFE_CARAVANS.push(cv);
  }
})();
window._caravans = LIFE_CARAVANS;   /* diagnostic */

var lifeCaravanTmpPos = new THREE.Vector3(), lifeCaravanTmpDir = new THREE.Vector3();
var lifeCaravanTmpQuat = new THREE.Quaternion(), lifeCaravanTmpMat = new THREE.Matrix4();
var lifeCaravanTmpScale1 = new THREE.Vector3(1,1,1);
function updateCaravans(dt){
  LIFE_CARAVANS.forEach(function(cv, idx){
    if(!cv){ LIFE_CARAVANS[idx] = lifeCaravanSpawn(); return; }
    cv.stateT += dt;
    if(cv.state === 'unloading'){
      lifeCaravanTmpPos.set(cv.destPt.x, Math.max(LIFE_Y, lifeGroundY(cv.destPt.x, cv.destPt.z) + 0.15), cv.destPt.z);
      lifeCaravanTmpQuat.setFromAxisAngle(LIFE_UP, cv.destPt.ry || 0);
      lifeCaravanTmpMat.compose(lifeCaravanTmpPos, lifeCaravanTmpQuat, lifeCaravanTmpScale1);
      lifeCaravanMesh.setMatrixAt(idx, lifeCaravanTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_CARAVAN_BASE+idx, lifeCaravanTmpPos.x, lifeCaravanTmpPos.y+2.4, lifeCaravanTmpPos.z);
      if(cv.stateT >= cv.unloadFor){
        var next = lifeCaravanPickDest(cv.destCat, cv.cartCount, cv.destPt.x, cv.destPt.z);
        cv.laneOffset = rr(-4.0, 4.0);   /* re-rolled per leg — see lifeCaravanSpawn's own comment */
        if(next && chance(0.5)){
          cv.curve = lifeCartBuildLeg(cv.destPt.x, cv.destPt.z, next.pt.x, next.pt.z);
          cv.len = cv.curve.getLength(); cv.dur = Math.max(6, cv.len/cv.speed);
          cv.destCat = next.cat; cv.destPt = next.pt; cv.state = 'arriving'; cv.stateT = 0;
        }else{
          cv.curve = lifeCartBuildLeg(cv.destPt.x, cv.destPt.z, LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z);
          cv.len = cv.curve.getLength(); cv.dur = Math.max(6, cv.len/cv.speed);
          cv.state = 'departing'; cv.stateT = 0;
        }
      }
      return;
    }
    /* 'arriving' or 'departing' */
    if(cv.dur === 0) cv.dur = Math.max(6, cv.len/cv.speed);
    var raw = Math.min(1, cv.stateT/cv.dur);
    var t = raw*raw*(3-2*raw);
    cv.curve.getPointAt(t, lifeCaravanTmpPos);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cv.curve.getTangentAt(tTan, lifeCaravanTmpDir);
    var yaw = Math.atan2(lifeCaravanTmpDir.x, lifeCaravanTmpDir.z);
    /* owner: "space the carts out a little more so they don't clip each
       other" — offset perpendicular to the direction of travel, applied
       AFTER yaw is computed from the unmodified tangent so facing stays
       correct; only the on-road position shifts sideways. */
    var dlen = Math.hypot(lifeCaravanTmpDir.x, lifeCaravanTmpDir.z) || 1;
    lifeCaravanTmpPos.x += (-lifeCaravanTmpDir.z/dlen) * cv.laneOffset;
    lifeCaravanTmpPos.z += (lifeCaravanTmpDir.x/dlen) * cv.laneOffset;
    lifeCaravanTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifeCaravanTmpPos.x, lifeCaravanTmpPos.z) + 0.15);
    lifeCaravanTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeCaravanTmpMat.compose(lifeCaravanTmpPos, lifeCaravanTmpQuat, lifeCaravanTmpScale1);
    lifeCaravanMesh.setMatrixAt(idx, lifeCaravanTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_CARAVAN_BASE+idx, lifeCaravanTmpPos.x, lifeCaravanTmpPos.y+2.4, lifeCaravanTmpPos.z);
    if(raw >= 1){
      if(cv.state === 'arriving'){
        cv.state = 'unloading'; cv.stateT = 0; cv.unloadFor = rr(10,20);
      }else{
        LIFE_CARAVANS[idx] = lifeCaravanSpawn();
      }
    }
  });
  lifeCaravanMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== ARENA GLADIATOR COMBAT =====================
   The moving half of the arena system. The built half — the raised
   spectator benches, the barred pit entrance let into the north arena
   wall, and the VIP box on its roof — is arenaCombatDeck() in
   65-facade.js, which publishes the ARENA_SITE record this section reads
   (same cross-file hand-off as GUILD_WORK_POSTS/LIFE_SHRINE_STOPS above:
   file order 65 runs long before 78, so the record is already there).

   WHEN. Fights run noon to sundown, off the city's own day/night clock —
   dayNightHour() (82-daynight.js), never a private timer. ARENA_HOUR_OPEN
   is 12 on purpose: that is the exact instant TEMPLE_BRAZIER_LIT flips
   true in that same file's tick loop, so the first pairing walks out of
   the pit as the temple braziers catch. ARENA_HOUR_CLOSE is 18, the
   sunset hour the shopkeeper and quarry-laborer cycles in this file
   already use. Outside that window every fighter, beast, attendant and
   corpse is parked at zero scale — the same hide-an-instance trick
   updateClergy()'s goat already uses — so the arena is visibly empty all
   morning and all night.

   WHAT. Gladiator vs gladiator AND gladiator vs beast, "bloody and not
   necessarily fair" as asked: the match roster (ARENA_CARDS) is
   deliberately lopsided. Exactly one of its eight cards is an even duel;
   the rest are two-on-one, three-on-two, an unarmed condemned man against
   a tiger, one blade against two beasts. Unfairness is not just flavour
   text — every combatant carries a `str` and the kill roll is weighted
   str^1.6, so the side that was set up to lose usually does.

   HOW IT MOVES. Four new InstancedMeshes, four new draw calls, nothing
   else — the fourth is the spectator crowd, moved wholesale out of
   65-facade.js's static bake by a later pass (see "the crowd", below):
   humans (fighters, attendants and corpses all share one body),
   quadruped beasts (tiger/lizard, one silhouette, told apart by
   per-instance colour and scale — the same honest compromise the merchant
   caravans' own ox/lizard/beetle draft animal already makes), and beetles
   (a genuinely different silhouette — carapace domes and six legs — which
   an InstancedMesh cannot share with the quadruped, since its geometry is
   one buffer for every instance). Everything static the arena needed was
   built from already-spent buckets; see 65-facade.js.

   POSES. There is no skinned animation anywhere in this project, so a
   fighting pose is per-instance transform only — but a lot more than the
   yaw-and-drift every posted NPC above uses. Each combatant composes
   THREE rotations: yaw at its opponent, a PITCH about its own local x
   (leaning into the blow and rocking back on the recoil), and a ROLL
   about its own local z (which swings the baked-in raised blade across
   its body). On top of that the whole pairing orbits its station, so the
   two sides circle each other, and each strike carries a real forward
   lunge plus a small hop. That is the warrior-sparring-pair primitive in
   updateGuildWorkers() above taken several steps further — the same
   "close along the pair's shared line, then pull back" idea, extended
   with the two extra rotation axes that make it read as fighting rather
   than as two people bumping into each other.

   DEATH LOOP. A kill roll fires every 9-18 fighting seconds. The loser
   falls (a 1.4s rotation onto its back, and for a human a re-tint to
   blood-dark via setColorAt), and the bout keeps going until one side has
   nobody left standing. Then two attendants come out of the pit gate,
   walk to a corpse, and drag it back through the gate — one corpse at a
   time, so a three-body card really does take three trips — while the
   survivors take a beat of victory pose and then walk out themselves.
   When the sand is clear the card is re-rolled and the next pairing comes
   out of the pit.

   NO BUILD-TIME PRNG. Every rnd() in this section runs inside
   updateArena(), i.e. at frame time, long after the whole city has been
   generated — exactly like lifeCaravanSpawn()'s own re-rolls. The
   top-level code below (meshes, slot maps, bout stations) is fully
   deterministic, so adding this section cannot shift one tree, farm or
   citizen generated by any later fragment. That is also why it carries no
   reseed() of its own. --------------------------------------------------- */

/* One-off named colours, in the same spirit as PALACE_SILVER
   (50-cantons.js) and LIFE_SKIN/LIFE_HAIR_DARK at the head of this file:
   single scalars for one population's own identity, not a palette family.
   Kept as scalars rather than an array on purpose — build.py rejects a
   colour ARRAY outside 05-palette.js, and rightly so. */
var ARENA_COL_BLOOD   = 0x8e2a2b;   /* a fresh corpse - bloodied, and light enough to still read as a BODY against the dark field paving rather than as a shadow */
var ARENA_COL_ATTEND  = 0x3b342c;   /* pit attendants: dark, unmemorable */
var ARENA_COL_CONDEMN = 0xa39a86;   /* the unarmed: undyed sackcloth */
var ARENA_COL_TIGER   = 0xbe7530;
var ARENA_COL_LIZARD  = 0x6d8a4b;
var ARENA_COL_BEETLE  = 0x4b4034;

var ARENA_HOUR_OPEN  = 12;   /* == the hour TEMPLE_BRAZIER_LIT turns on (82-daynight.js) */
var ARENA_HOUR_CLOSE = 18;   /* sundown, same constant the shopkeeper/quarry cycles use */

var ARENA_BOUT_N = 3;                 /* three pairings on the sand at once */
var ARENA_HUM_PER_BOUT = 7;           /* up to 5 combatants + 2 attendants */
var ARENA_HUMAN_N  = ARENA_BOUT_N * ARENA_HUM_PER_BOUT;
var ARENA_QUAD_N   = ARENA_BOUT_N * 2;
var ARENA_BEETLE_N = ARENA_BOUT_N * 2;

/* ---- geometry ------------------------------------------------------------
   Humans are built with their ORIGIN AT THE FEET (the shared lifePersonGeo
   above puts it at mid-torso instead and every caller silently compensates);
   that matters here because a corpse has to be rotated flat about its own
   base and dragged along the sand, which is far easier to reason about from
   the feet. Overall height is deliberately identical to lifePersonGeo's
   (1.05+0.40 body units at LIFE_PEOPLE_SCALE, ~4.05 world units) so a
   gladiator is the same size as everyone else in the city.

   The body is baked white so setColorAt owns the whole figure — the same
   trade updateGuildWorkers() makes and for the same reason (one shared
   shape, many roles). Head and weapons are baked a light neutral rather
   than pure white so the tint reads as a helmet and a steel blade rather
   than as a monochrome silhouette. */
var APS = LIFE_PEOPLE_SCALE;
/* THE FIGURE. The first version of this model was the same two-part torso +
   head abstraction lifePersonGeo uses, plus a slab blade and a slab shield:
   4 parts, 60 triangles. At bench distance that is fine — it is what every
   other citizen in the city is — but the owner looked at a close-up and read
   them, correctly, as slabs. There is no skinning anywhere in this project,
   so a pose is still per-instance transform only; what a richer model buys is
   a SILHOUETTE that survives the close-up, and limbs the existing pitch/roll
   already move convincingly (rolling a figure with a visible sword arm and a
   braced leg reads as a swing; rolling a cylinder reads as a leaning
   cylinder).

   Built the way 79-striders.js builds the silt strider: many small primitives
   merged once with lifeMergeGeoms(), per-part vertex colour, one buffer, one
   draw call, ~500 triangles a fighter at 21 slots.

   THE FRAME IS UNCHANGED, on purpose, because the animation depends on it:
     - ORIGIN AT THE FEET (not mid-torso like lifePersonGeo). The corpse code
       rotates a body 90 degrees about its own base and ARENA_LIE_Y lifts it
       back out of the sand by its own half-thickness — the bug the comment
       on that constant documents. Torso half-thickness is still ~0.30*APS,
       so ARENA_LIE_Y still holds.
     - TOTAL HEIGHT still exactly 1.445*APS to the top of the helmet crest,
       so a gladiator is still the same size as everyone else in the city.
     - FORWARD IS +z (yaw = atan2(dir.x, dir.z) maps local +z onto the
       heading), the sword is in the RIGHT hand (+x) and raised, and the
       shield is on the LEFT — the roll-about-local-z in arenaPlace() swings
       that sword arm across the body, which is the whole strike read.
     - The body is baked WHITE so setColorAt owns it; helmet, steel and
       shield are baked lighter neutrals so the tint reads as a man in
       coloured harness rather than a monochrome silhouette (the same trade
       updateGuildWorkers() makes). The same mesh carries attendants and
       corpses, and an "unarmed" condemned man still carries the baked sword
       — the one honest compromise of a shared instanced geometry, unchanged
       from the first version. */
var lifeGladParts = [
  /* legs: staggered stance, right foot back under the sword arm */
  { geo: new THREE.BoxGeometry(0.19*APS, 0.09*APS, 0.40*APS).translate( 0.17*APS, 0.045*APS, -0.06*APS), color: 0x6f6659 },
  { geo: new THREE.BoxGeometry(0.19*APS, 0.09*APS, 0.40*APS).translate(-0.17*APS, 0.045*APS,  0.16*APS), color: 0x6f6659 },
  { geo: new THREE.CylinderGeometry(0.110*APS, 0.085*APS, 0.38*APS, 6).translate( 0.17*APS, 0.22*APS, -0.04*APS), color: 0xa39a8b },
  { geo: new THREE.CylinderGeometry(0.110*APS, 0.085*APS, 0.38*APS, 6).translate(-0.17*APS, 0.22*APS,  0.12*APS), color: 0xa39a8b },
  { geo: new THREE.CylinderGeometry(0.140*APS, 0.115*APS, 0.34*APS, 6).translate( 0.16*APS, 0.55*APS, -0.02*APS), color: 0xa39a8b },
  { geo: new THREE.CylinderGeometry(0.140*APS, 0.115*APS, 0.34*APS, 6).translate(-0.16*APS, 0.55*APS,  0.07*APS), color: 0xa39a8b },
  /* a flared kilt and a belt: the join between legs and torso, and the one
     detail that stops the waist reading as a hinge between two cylinders.
     Short and narrow on purpose — the first pass hung a wide one to
     mid-thigh and it swallowed the legs from every camera above eye level,
     which is what made the figure read squat in the first screenshot. */
  { geo: new THREE.CylinderGeometry(0.27*APS, 0.33*APS, 0.20*APS, 8).translate(0, 0.72*APS, 0.02*APS), color: 0xd6cec2 },
  { geo: new THREE.CylinderGeometry(0.27*APS, 0.27*APS, 0.07*APS, 8).translate(0, 0.825*APS, 0.02*APS), color: 0x8e8578 },
  /* torso, shoulder yoke, neck */
  { geo: new THREE.CylinderGeometry(0.31*APS, 0.25*APS, 0.32*APS, 8).translate(0, 0.98*APS, 0.01*APS), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.76*APS, 0.17*APS, 0.34*APS).translate(0, 1.105*APS, 0.01*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.10*APS, 0.11*APS, 0.08*APS, 6).translate(0, 1.185*APS, 0.01*APS), color: 0xcfcac2 },
  /* helmet and crest — the crest is what tells a head from a box at fifty
     units, and it tops out at exactly 1.445*APS (see the frame note above) */
  { geo: new THREE.BoxGeometry(0.32*APS, 0.24*APS, 0.34*APS).translate(0, 1.28*APS, 0.01*APS), color: 0xcfcac2 },
  { geo: new THREE.BoxGeometry(0.06*APS, 0.065*APS, 0.26*APS).translate(0, 1.4125*APS, 0.00*APS), color: 0xb7442f },
  /* arms. Upper arms hang from the yoke; the right forearm carries the sword
     up and a little forward, the left brings the shield across the body. */
  { geo: new THREE.CylinderGeometry(0.095*APS, 0.085*APS, 0.32*APS, 6).rotateZ(-0.30).translate( 0.40*APS, 0.99*APS, 0.02*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.095*APS, 0.085*APS, 0.32*APS, 6).rotateZ( 0.30).translate(-0.40*APS, 0.99*APS, 0.02*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.085*APS, 0.080*APS, 0.30*APS, 6).rotateX(-0.50).rotateZ(-0.14).translate( 0.47*APS, 0.94*APS, 0.11*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.085*APS, 0.080*APS, 0.28*APS, 6).rotateX(-1.15).translate(-0.42*APS, 0.88*APS, 0.13*APS), color: 0xffffff },
  /* the round shield, face-on to +z with a raised boss */
  { geo: new THREE.CylinderGeometry(0.30*APS, 0.30*APS, 0.06*APS, 10).rotateX(Math.PI/2).translate(-0.43*APS, 0.92*APS, 0.27*APS), color: 0x8a8378 },
  { geo: new THREE.SphereGeometry(0.11*APS, 8, 4, 0, Math.PI*2, 0, Math.PI*0.5).rotateX(Math.PI/2).translate(-0.43*APS, 0.92*APS, 0.30*APS), color: 0xd4d8de },
  /* the sword: grip, crossguard, and a four-sided blade flattened on z and
     tapered to a real point, so it reads as a weapon and not as a post */
  { geo: new THREE.CylinderGeometry(0.045*APS, 0.045*APS, 0.22*APS, 6).translate(0.50*APS, 1.08*APS, 0.16*APS), color: 0x6b5a45 },
  { geo: new THREE.BoxGeometry(0.30*APS, 0.055*APS, 0.09*APS).translate(0.50*APS, 1.205*APS, 0.16*APS), color: 0xd0d5dc },
  { geo: new THREE.CylinderGeometry(0.018*APS, 0.085*APS, 0.95*APS, 4).rotateY(Math.PI/4).scale(1,1,0.40).translate(0.50*APS, 1.71*APS, 0.16*APS), color: 0xd0d5dc }
];
var lifeGladGeo = lifeMergeGeoms(lifeGladParts);
var lifeGladMesh = new THREE.InstancedMesh(lifeGladGeo,
  new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_HUMAN_N);
lifeGladMesh.userData.life = true; lifeGladMesh.userData.inspectLabel = 'Gladiator';
lifeGladMesh.frustumCulled = false;
scene.add(lifeGladMesh);

/* quadruped pit beast — tiger or pit lizard. One silhouette, two identities
   via per-instance colour AND per-instance scale (a tiger really is the
   bigger animal), which is one step beyond the caravans' colour-only
   compromise without buying a fourth draw call. ~7 long, ~2.4 at the
   shoulder: about 1.7x a citizen's height in length, which is the right
   relationship next to a 4-unit fighter. */
var lifeABeastParts = [
  { geo: new THREE.CylinderGeometry(0.75, 0.90, 3.60, 8).rotateX(Math.PI/2).translate(0, 1.50, 0.20), color: 0xffffff },
  { geo: new THREE.BoxGeometry(1.10, 1.00, 1.20).translate(0, 1.75, 2.20), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.80, 0.50, 0.80).translate(0, 1.45, 2.85), color: 0xe8e0d2 },   /* snout/jaw, paler */
  { geo: new THREE.CylinderGeometry(0.12, 0.28, 2.00, 6).rotateX(Math.PI/2).translate(0, 1.60, -2.60), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate( 0.62, 0.75,  1.20), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate(-0.62, 0.75,  1.20), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate( 0.62, 0.75, -1.20), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate(-0.62, 0.75, -1.20), color: 0xffffff },
  /* cheap additions from the same pass that rebuilt the fighters: shoulder
     and haunch masses over the leg joints, paws under them, and two ears.
     Purely additive — every original part above keeps its exact offset, so
     the pounce/rear pose code is untouched — and it is the haunches that
     stop the body reading as a pipe with four pegs under it. */
  { geo: new THREE.SphereGeometry(0.62, 8, 5).scale(0.95, 0.90, 1.15).translate( 0.58, 1.38,  1.20), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.62, 8, 5).scale(0.95, 0.90, 1.15).translate(-0.58, 1.38,  1.20), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.70, 8, 5).scale(0.95, 0.92, 1.15).translate( 0.58, 1.32, -1.20), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.70, 8, 5).scale(0.95, 0.92, 1.15).translate(-0.58, 1.32, -1.20), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate( 0.62, 0.12,  1.28), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate(-0.62, 0.12,  1.28), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate( 0.62, 0.12, -1.12), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate(-0.62, 0.12, -1.12), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.26, 0.34, 0.12).translate( 0.36, 2.34,  2.00), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.26, 0.34, 0.12).translate(-0.36, 2.34,  2.00), color: 0xe8e0d2 }
];
var lifeABeastGeo = lifeMergeGeoms(lifeABeastParts);
var lifeABeastMesh = new THREE.InstancedMesh(lifeABeastGeo,
  new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_QUAD_N);
lifeABeastMesh.userData.life = true; lifeABeastMesh.userData.inspectLabel = 'Arena beast';
lifeABeastMesh.frustumCulled = false;
scene.add(lifeABeastMesh);

/* the giant beetle. Proportions lifted directly from beetleModel()
   (65-facade.js, the beetle ranch's own static animal) so the thing
   fighting in the pit is recognisably the same creature the ranch out on
   the mainland raises — abdomen/thorax/head hemispheres over six stub
   legs. Rebuilt here as merged BufferGeometry rather than reused, because
   beetleModel() pushes into the immutable static BUCKET and nothing in
   that bake can move. */
var ABEETLE_LEGH = 1.42;
var lifeABeetleParts = [
  { geo: new THREE.SphereGeometry(1.50, 12, 6, 0, Math.PI*2, 0, Math.PI*0.5).scale(1, 0.88, 1).translate(0, ABEETLE_LEGH, -1.38), color: 0xffffff },
  { geo: new THREE.SphereGeometry(1.00, 10, 5, 0, Math.PI*2, 0, Math.PI*0.5).scale(1, 0.94, 1).translate(0, ABEETLE_LEGH, 0.28), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.55,  8, 4, 0, Math.PI*2, 0, Math.PI*0.5).scale(1, 0.86, 1).translate(0, ABEETLE_LEGH+0.15, 1.84), color: 0xe6e6e6 },
  { geo: new THREE.BoxGeometry(0.09, 0.09, 1.10).rotateY( 0.40).translate( 0.38, ABEETLE_LEGH+0.70, 2.30), color: 0xdddddd },
  { geo: new THREE.BoxGeometry(0.09, 0.09, 1.10).rotateY(-0.40).translate(-0.38, ABEETLE_LEGH+0.70, 2.30), color: 0xdddddd },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate( 0.85, ABEETLE_LEGH*0.5,  0.28), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate(-0.85, ABEETLE_LEGH*0.5,  0.28), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate( 1.20, ABEETLE_LEGH*0.5, -0.92), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate(-1.20, ABEETLE_LEGH*0.5, -0.92), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate( 0.83, ABEETLE_LEGH*0.5, -2.02), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate(-0.83, ABEETLE_LEGH*0.5, -2.02), color: 0xcccccc }
];
var lifeABeetleGeo = lifeMergeGeoms(lifeABeetleParts);
var lifeABeetleMesh = new THREE.InstancedMesh(lifeABeetleGeo,
  new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_BEETLE_N);
lifeABeetleMesh.userData.life = true; lifeABeetleMesh.userData.inspectLabel = 'Arena beetle';
lifeABeetleMesh.frustumCulled = false;
scene.add(lifeABeetleMesh);

/* ---- the crowd ----------------------------------------------------------
   The 258 people on the benches and the 6 in the VIP box used to be 528
   instances baked into the static kit by arenaSpectator() (65-facade.js) —
   frozen solid, and sitting there at three in the morning. The static bake is
   merged and immutable, so "a little more animated" is structurally a
   decision about how many figures to move OUT of it and onto a live mesh.
   The answer here is ALL of them: 264 figures, ONE new InstancedMesh, one new
   draw call (BUDGET.drawCalls 68 -> 69, 05-palette.js), and 528 instances
   handed BACK to the static bake's own budget in the trade.

   Which rig: the closest precedent in the project is the arena's own three
   dynamic meshes, immediately above — same file, same section, same hour
   gate, driven by the same updateArena(dt). So the crowd is a fourth mesh
   here rather than a fifth registration rig in 65-facade.js.

   HOW IT MOVES — stateless, exactly like the smoke rig (65-facade.js): there
   is no per-spectator state to integrate and nothing to step. A figure's
   whole pose is a pure function of the clock and a handful of constants
   hashed off its own seat position through arenaHash2() (the same positional
   hash the static build uses instead of rnd()), so the crowd costs no
   bookkeeping, is exactly restartable, and never accumulates drift:

     - a slow personal SWAY, LEAN and TURN, each on its own hashed phase and
       rate: everyone shifting their weight, leaning in, glancing aside. This
       is the idle bed, and it is what makes the stands read as a crowd of
       people rather than as a row of posts;
     - a ROLL OF NOISE round the bowl: one travelling wave, phase-delayed by
       each seat's angle about the arena centre, so a reaction ripples round
       the stands instead of the whole house pulsing as one body. At rest it
       is a low swell; when the crowd is roused it lifts people half out of
       their seats;
     - AROUSAL, one global scalar. arenaCrowdRoar() bumps it when a pairing
       walks out of the pit and hard when somebody dies, and it decays over
       ~2s. The crowd is therefore reacting to the actual fight below — the
       kill roll in updateArena() is the only thing that touches it;
     - ATTENDANCE: the house fills over the two game-hours before noon and
       empties over the hour after sundown, each seat taken at its own hashed
       moment, so people arrive and leave in ones and twos instead of the
       crowd popping into existence. Outside that window the whole rig is a
       single early-out — no crowd at 3am, and no per-frame cost either.

   INSTANCE COLOUR (SUBAGENT.md s6), all three traps: every slot is given its
   tunic colour at construction, i.e. BEFORE the mesh's first render (so the
   program compiles WITH the instance-colour path, and no slot is ever left
   in the lazily-allocated zero-filled state), and each colour goes through
   convertSRGBToLinear() because emitBuckets() does — these are the very hexes
   the bake was converting until this pass moved them here.

   The head is baked ARENA_SKIN and the body white, so the per-instance tunic
   colour multiplies both: the tunic lands exactly as it did in the bake, and
   the head comes out as a darker, tunic-tinged version of it, which reads as
   hair and hood in shadow. That multiplication is unavoidable on a shared
   instanced geometry (lifeGladMesh makes the same trade), and this is the
   direction of it that flatters a crowd. */
var ARENA_CROWD_SEATS = (typeof ARENA_SEATS !== 'undefined' && ARENA_SEATS) ? ARENA_SEATS : [];
var ARENA_CROWD_N = ARENA_CROWD_SEATS.length;
/* the seated figure: torso, shoulders, head, knees and two arms. The
   silhouette and overall height (2.15 world units, origin at the seat) are
   the baked pair's, so the stands read from the far side of the field exactly
   as they did — what is new is the knees and arms, which are what tell a
   seated person from a bollard once the figure starts leaning. */
var lifeCrowdParts = [
  { geo: new THREE.CylinderGeometry(0.52, 0.62, 1.30, 6).translate(0, 0.65, 0), color: 0xffffff },
  { geo: new THREE.BoxGeometry(1.06, 0.26, 0.64).translate(0, 1.38, 0), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.62, 0.60, 0.62).translate(0, 1.83, 0), color: ARENA_SKIN },
  { geo: new THREE.BoxGeometry(0.86, 0.34, 0.56).translate(0, 0.20, 0.46), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.18, 0.88, 0.26).translate( 0.60, 0.74, 0.10), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.18, 0.88, 0.26).translate(-0.60, 0.74, 0.10), color: 0xffffff }
];
var lifeCrowdGeo = ARENA_CROWD_N ? lifeMergeGeoms(lifeCrowdParts) : null;
var lifeCrowdMesh = null;
/* per-seat constants, hashed off the seat's own world position — no rnd(),
   for the same reason the static build has none (65-facade.js's header). */
var CR_PH=null, CR_P2=null, CR_P3=null, CR_RT=null, CR_ANG=null, CR_ARR=null;
if(ARENA_CROWD_N){
  lifeCrowdMesh = new THREE.InstancedMesh(lifeCrowdGeo,
    new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_CROWD_N);
  lifeCrowdMesh.userData.life = true; lifeCrowdMesh.userData.inspectLabel = 'Arena spectator';
  lifeCrowdMesh.frustumCulled = false;
  CR_PH = new Float32Array(ARENA_CROWD_N); CR_P2 = new Float32Array(ARENA_CROWD_N);
  CR_P3 = new Float32Array(ARENA_CROWD_N); CR_RT = new Float32Array(ARENA_CROWD_N);
  CR_ANG= new Float32Array(ARENA_CROWD_N); CR_ARR= new Float32Array(ARENA_CROWD_N);
  var _crC = new THREE.Color(), _crM = new THREE.Matrix4();
  var _crCx = (typeof ARENA_SITE !== 'undefined' && ARENA_SITE) ? ARENA_SITE.x : 0;
  var _crCz = (typeof ARENA_SITE !== 'undefined' && ARENA_SITE) ? ARENA_SITE.z : 0;
  _crM.compose(new THREE.Vector3(0,-500,0), new THREE.Quaternion(), new THREE.Vector3(0,0,0));
  for(var ci2=0; ci2<ARENA_CROWD_N; ci2++){
    var st = ARENA_CROWD_SEATS[ci2];
    CR_PH[ci2]  = arenaHash2(st.x*0.31, st.z*0.27 + 3.1) * Math.PI*2;
    CR_P2[ci2]  = arenaHash2(st.x*0.19 + 7.7, st.z*0.43) * Math.PI*2;
    CR_P3[ci2]  = arenaHash2(st.x*0.53 + 17.3, st.z*0.11 + 5.9) * Math.PI*2;
    CR_RT[ci2]  = 0.55 + arenaHash2(st.z*0.37 + 23.1, st.x*0.29) * 0.75;
    CR_ANG[ci2] = Math.atan2(st.z - _crCz, st.x - _crCx);
    CR_ARR[ci2] = arenaHash2(st.x*0.13 + 31.7, st.z*0.17 + 11.3);
    lifeCrowdMesh.setMatrixAt(ci2, _crM);                       /* parked until the house opens */
    lifeCrowdMesh.setColorAt(ci2, _crC.set(st.col).convertSRGBToLinear());
  }
  lifeCrowdMesh.instanceMatrix.needsUpdate = true;
  if(lifeCrowdMesh.instanceColor) lifeCrowdMesh.instanceColor.needsUpdate = true;
  scene.add(lifeCrowdMesh);
}
/* measured off the real buffers, never estimated (API.md s8) */
window._arenaCrowd = {
  seats: ARENA_CROWD_N,
  drawCalls: lifeCrowdMesh ? 1 : 0,
  trisEach: lifeCrowdGeo ? lifeCrowdGeo.attributes.position.count/3 : 0,
  triangles: lifeCrowdGeo ? ARENA_CROWD_N*lifeCrowdGeo.attributes.position.count/3 : 0,
  gladTrisEach: lifeGladGeo.attributes.position.count/3,
  gladParts: lifeGladParts.length,
  beastTrisEach: lifeABeastGeo.attributes.position.count/3,
  staticInstancesFreed: ARENA_CROWD_N*2      /* the cylinder + head block each one used to bake */
};

/* ---- the roster ---------------------------------------------------------
   "Bloody and not necessarily fair." One card in eight is an even duel;
   every other card is a mismatch of some kind, and `w` weights the draw so
   the mismatches dominate. `str` (below) is what turns that from a label
   into an outcome: the kill roll is weighted by side strength raised to
   1.6, so a condemned man with no blade against a tiger loses about nine
   times in ten — but not always, which is the point of putting him out
   there. */
var ARENA_CARDS = [
  { key:'duel',    w:3, note:'matched pair, blade and shield',       a:[['h','armed']],                            b:[['h','armed']] },
  { key:'twoOne',  w:4, note:'two on one',                           a:[['h','armed'],['h','armed']],              b:[['h','armed']] },
  { key:'threeTwo',w:2, note:'three on two, one of them unarmed',    a:[['h','armed'],['h','armed'],['h','armed']],b:[['h','armed'],['h','unarmed']] },
  { key:'noxii',   w:3, note:'condemned man, no blade, against a tiger', a:[['h','unarmed']],                      b:[['b','tiger']] },
  { key:'hunt',    w:3, note:'two hunters against a pit lizard',     a:[['h','armed'],['h','armed']],              b:[['b','lizard']] },
  { key:'shell',   w:2, note:'one blade against a shell',            a:[['h','armed']],                            b:[['b','beetle']] },
  { key:'swarm',   w:2, note:'one man, two beasts',                  a:[['h','armed']],                            b:[['b','beetle'],['b','lizard']] },
  { key:'mixed',   w:2, note:'an armed man and a condemned one, against a tiger', a:[['h','armed'],['h','unarmed']], b:[['b','tiger']] }
];
var ARENA_STR = { armed:1.00, unarmed:0.42, tiger:1.80, lizard:1.20, beetle:1.45 };
var ARENA_CARD_WSUM = 0;
ARENA_CARDS.forEach(function(c){ ARENA_CARD_WSUM += c.w; });

/* ---- bouts --------------------------------------------------------------
   Three fixed stations on the sand, clear of the pit gate's own apron
   (which sits on the north edge) so nobody fights in the doorway. Laid out
   deterministically off ARENA_SITE, not rolled. */
var ARENA_BOUTS = [];
(function(){
  if(typeof ARENA_SITE === 'undefined' || !ARENA_SITE) return;
  var S = ARENA_SITE, R = S.fieldHalf * 0.52;
  for(var i=0;i<ARENA_BOUT_N;i++){
    var a = Math.PI*0.5 + i*(Math.PI*2/ARENA_BOUT_N);
    ARENA_BOUTS.push({
      i: i,
      sx: S.x + Math.cos(a)*R, sz: S.z + Math.sin(a)*R,
      state: 'idle', t: 0, idleFor: 2 + i*3,
      card: null, side: [[],[]], corpses: [], attend: [],
      orbAng: i*1.1, orbSpin: (i%2 ? 0.26 : -0.22),
      killAt: 0, exitT: 0, clearIdx: 0, clearPhase: 'fetch', clearT: 0,
      humBase: i*ARENA_HUM_PER_BOUT, humUsed: 0,
      quadBase: i*2, quadUsed: 0, beetleBase: i*2, beetleUsed: 0,
      kills: 0
    });
  }
})();

window._arena = {
  site: (typeof ARENA_SITE !== 'undefined' && ARENA_SITE) ? ARENA_SITE : null,
  bouts: ARENA_BOUTS, open: ARENA_HOUR_OPEN, close: ARENA_HOUR_CLOSE,
  cards: ARENA_CARDS.map(function(c){ return c.key + ' (' + c.note + ')'; }),
  crowd: function(){ return { seats: ARENA_CROWD_N,
                              fill: +arenaCrowdFill(dayNightHour()).toFixed(2),
                              arousal: +ARENA_CROWD_EXC.toFixed(2) }; },
  running: function(){ var h = dayNightHour(); return h >= ARENA_HOUR_OPEN && h < ARENA_HOUR_CLOSE; },
  /* the brazier tie-in, exposed so it can be checked rather than taken on
     trust: ARENA_HOUR_OPEN is the same hour 82-daynight.js lights the
     temple braziers, so brazierLit() is true for every second the games
     are running (it stays true past sundown, on to the next sunrise -
     the braziers burn all night, the games do not). */
  brazierLit: function(){ return (window._dayNight && window._dayNight.brazierLit()) || false; },
  state: function(){ return ARENA_BOUTS.map(function(b){
    return { state:b.state, card:b.card?b.card.key:null, kills:b.kills,
             alive:[b.side[0].filter(function(f){return f.alive;}).length,
                    b.side[1].filter(function(f){return f.alive;}).length],
             corpses:b.corpses.length }; }); }
};   /* diagnostic — deliberately carries no `curve`, so 87-pathviz.js's
        auto-discovery (which registers anything holding a real THREE curve)
        correctly leaves this population alone: gladiators do not travel the
        road graph. */

/* ---- per-frame ----------------------------------------------------------- */
var ARENA_T = 0;
var arenaTmpPos = new THREE.Vector3(), arenaTmpQ = new THREE.Quaternion();
var arenaTmpQ2 = new THREE.Quaternion(), arenaTmpQ3 = new THREE.Quaternion();
var arenaTmpMat = new THREE.Matrix4();
var arenaScale1 = new THREE.Vector3(1,1,1), arenaScale0 = new THREE.Vector3(0,0,0);
var arenaScaleV = new THREE.Vector3(1,1,1);
var arenaAxisX = new THREE.Vector3(1,0,0), arenaAxisZ = new THREE.Vector3(0,0,1);
/* REAL BUG, caught on a screenshot of the corpse drag: a fallen fighter was
   composed at the field's own surface height, the same y a STANDING one
   uses -- but these figures are modelled with their origin at the FEET, so
   once the body is pitched 90 degrees the origin is no longer the bottom of
   the silhouette, it is the middle of a now-horizontal torso. Half of every
   corpse was therefore below the sand: all that showed on the field was the
   tip of a blade sticking out of the paving. A body lying down has to be
   lifted by roughly its own half-thickness. */
var ARENA_LIE_Y = 0.30*LIFE_PEOPLE_SCALE;      /* half the torso's own radius-ish: a human on his back */
var ARENA_LIE_Y_BEAST = 0.95;                   /* the quadruped/beetle body, rolled onto its flank */
var arenaTmpCol = new THREE.Color();
var ARENA_MESH_DIRTY = { h:false, q:false, t:false };

function arenaMeshFor(f){
  return f.mesh === 'h' ? lifeGladMesh : (f.mesh === 'q' ? lifeABeastMesh : lifeABeetleMesh);
}
function arenaHide(f){
  arenaTmpMat.compose(arenaTmpPos.set(0,-500,0), arenaTmpQ.identity(), arenaScale0);
  arenaMeshFor(f).setMatrixAt(f.slot, arenaTmpMat);
  ARENA_MESH_DIRTY[f.mesh] = true;
}
/* compose one combatant: yaw at the target, pitch about its own local x
   (lean), roll about its own local z (weapon swing). q = yaw * pitch * roll
   applies each rotation in the figure's OWN frame, which is what makes the
   lean read as leaning forward along its heading rather than tipping
   sideways in world space. */
function arenaPlace(f, x, y, z, yaw, pitch, roll, sc){
  arenaTmpQ.setFromAxisAngle(LIFE_UP, yaw);
  if(pitch){ arenaTmpQ2.setFromAxisAngle(arenaAxisX, pitch); arenaTmpQ.multiply(arenaTmpQ2); }
  if(roll){ arenaTmpQ3.setFromAxisAngle(arenaAxisZ, roll); arenaTmpQ.multiply(arenaTmpQ3); }
  arenaScaleV.set(sc, sc, sc);
  arenaTmpMat.compose(arenaTmpPos.set(x,y,z), arenaTmpQ, arenaScaleV);
  arenaMeshFor(f).setMatrixAt(f.slot, arenaTmpMat);
  ARENA_MESH_DIRTY[f.mesh] = true;
}
/* .convertSRGBToLinear() matters: the static bake does it (emitBuckets(),
   45-kit.js, converts every instance colour), so a hex that was chosen
   against a stone wall only lands on the same tone if the arena does it
   too. Without it the first screenshot pass rendered the crimson
   gladiators as pale salmon and the beetle as cream -- every colour here
   read roughly one stop too light because the renderer was treating an
   sRGB number as if it were already linear. */
function arenaTint(f, hex){
  var m = arenaMeshFor(f);
  m.setColorAt(f.slot, arenaTmpCol.set(hex).convertSRGBToLinear());
  if(m.instanceColor) m.instanceColor.needsUpdate = true;
}
/* A FIGHTER'S LIVERY, not a coat of paint. The instance colour multiplies
   EVERY baked vertex colour on the shared body — helmet, steel and shield
   included — so a full-strength banner hex turns the whole man, sword and
   all, into one flat saturated silhouette. That was tolerable when the model
   was four slabs and the crowd never got closer than the benches; at the
   close range the rebuilt figure is meant for, it threw away every part
   distinction the model had just bought. Halving the banner hex toward a
   bone/steel neutral keeps the four house colours apart at a glance while
   leaving enough headroom for the baked lights and darks — greaves, kilt,
   helmet, blade — to read through the tint. */
var arenaLiveryTmp = new THREE.Color(), arenaLiveryBase = new THREE.Color(0xc2bcae);
function arenaLivery(hex){ return arenaLiveryTmp.set(hex).lerp(arenaLiveryBase, 0.55).getHex(); }

function arenaPickCard(){
  var r = rnd()*ARENA_CARD_WSUM, acc = 0;
  for(var i=0;i<ARENA_CARDS.length;i++){ acc += ARENA_CARDS[i].w; if(r < acc) return ARENA_CARDS[i]; }
  return ARENA_CARDS[0];
}
function arenaRoll(b){
  var S = ARENA_SITE;
  b.card = arenaPickCard();
  b.side = [[],[]];
  b.corpses = []; b.attend = [];
  b.humUsed = 0; b.quadUsed = 0; b.beetleUsed = 0;
  b.kills = 0; b.exitT = 0; b.clearIdx = 0; b.clearPhase = 'fetch'; b.clearT = 0;
  [b.card.a, b.card.b].forEach(function(list, sideIdx){
    list.forEach(function(entry){
      var f;
      if(entry[0] === 'h'){
        f = { mesh:'h', slot: b.humBase + b.humUsed++, role: entry[1], side: sideIdx,
              str: ARENA_STR[entry[1]], alive:true, dieT:0, sc:1,
              rate: rr(1.8, 2.8), phase: arenaPhaseFor(sideIdx), x:S.gateX, z:S.gateZ, yaw:0 };
        arenaTint(f, entry[1] === 'unarmed' ? ARENA_COL_CONDEMN
                                            : arenaLivery(BANNERC[Math.floor(rnd()*4)]));
      }else if(entry[1] === 'beetle'){
        f = { mesh:'t', slot: b.beetleBase + b.beetleUsed++, role:'beetle', side: sideIdx,
              str: ARENA_STR.beetle, alive:true, dieT:0, sc:1.15,
              rate: rr(1.1, 1.6), phase: arenaPhaseFor(sideIdx), x:S.gateX, z:S.gateZ, yaw:0 };
        arenaTint(f, ARENA_COL_BEETLE);
      }else{
        f = { mesh:'q', slot: b.quadBase + b.quadUsed++, role: entry[1], side: sideIdx,
              str: ARENA_STR[entry[1]], alive:true, dieT:0,
              sc: entry[1] === 'tiger' ? 1.15 : 0.92,
              rate: rr(1.3, 1.9), phase: arenaPhaseFor(sideIdx), x:S.gateX, z:S.gateZ, yaw:0 };
        arenaTint(f, entry[1] === 'tiger' ? ARENA_COL_TIGER : ARENA_COL_LIZARD);
      }
      f.reach = f.mesh === 'h' ? rr(2.6,3.4) : rr(3.6,4.8);
      /* fan them out sideways in the gate mouth so a five-fighter card does
         not walk out of the pit as one stacked column */
      f.gateOff = (b.side[0].length + b.side[1].length + sideIdx*0.5 - 1.5) * 1.5;
      b.side[sideIdx].push(f);
    });
  });
  /* the two pit attendants: allocated now, kept hidden until there is a
     body to drag. They ride the same human mesh — an attendant with a
     drag-hook and a fighter with a blade are the same silhouette at arena
     distance, and a second humanoid draw call for two NPCs would be a poor
     trade (the exact call updateGuildWorkers() documents making the other
     way, for a population of fifteen). */
  for(var k=0;k<2;k++){
    var at = { mesh:'h', slot: b.humBase + ARENA_HUM_PER_BOUT - 2 + k, role:'attendant',
               alive:true, sc:1, x:S.gateX, z:S.gateZ, yaw:0, side:-1 };
    arenaTint(at, ARENA_COL_ATTEND);
    b.attend.push(at);
  }
  b.state = 'enter'; b.t = 0;
  arenaCrowdRoar(0.35);              /* a stir as the next pairing comes out of the pit */
  /* TIMINGS. The whole noon-to-sundown window is 6 game hours, and
     DAYNIGHT_SEC_PER_HOUR is 5 (82-daynight.js) — so the games last THIRTY
     REAL SECONDS per day. Every duration below is sized against that hard
     number rather than against what feels right in isolation: a bout runs
     ~18-22s end to end (walk out, fight, fall, drag, clear), so each of the
     three stations gets through one or two full cards per afternoon and the
     sand is never idle for long while the braziers are lit. */
  b.enterFor = rr(3.2, 4.4);
  b.killAt = rr(5, 10);
}

/* strike phases are NOT independent per fighter. Rolling each one at
   random produced the thing the brief warned against: everybody lunging
   and recoiling on their own clock, which averages out to a milling
   crowd. Phases are anchored half a cycle apart BY SIDE (with a little
   jitter so a three-man side is not a chorus line), so at any instant one
   side is committing and the other is giving ground - which is what reads
   as a fight in a still frame as well as in motion. */
function arenaPhaseFor(sideIdx){ return sideIdx*Math.PI + rr(-0.45, 0.45); }

function arenaSideStr(b, s){
  var t = 0;
  b.side[s].forEach(function(f){ if(f.alive) t += f.str; });
  return t;
}
function arenaFightBase(b, f, out){
  var mates = b.side[f.side], n = mates.length, m = mates.indexOf(f);
  var R = 5.8 + (f.mesh === 'h' ? 0 : 1.6);
  var ang = b.orbAng + f.side*Math.PI + (m - (n-1)*0.5)*0.58;
  out[0] = b.sx + Math.cos(ang)*R;
  out[1] = b.sz + Math.sin(ang)*R;
}
var arenaBaseTmp = [0,0], arenaFoeTmp = [0,0];
function arenaFoeCentre(b, side, out){
  var foes = b.side[1-side], n = 0, sx = 0, sz = 0;
  foes.forEach(function(g){ if(g.alive){ sx += g.x; sz += g.z; n++; } });
  if(!n){ out[0] = b.sx; out[1] = b.sz; return; }
  out[0] = sx/n; out[1] = sz/n;
}

/* ---- the crowd, per frame -----------------------------------------------
   Stateless: nothing below is integrated, every term is a pure function of
   ARENA_T, the hour, the one global arousal scalar and the per-seat constants
   hashed at build. See the rig's own comment above for the design. */
var ARENA_CROWD_EXC = 0;          /* arousal, 0..1.35, decaying */
var ARENA_CROWD_LEAD = 2;         /* game-hours the house takes to fill, before ARENA_HOUR_OPEN */
var ARENA_CROWD_TAIL = 1;         /* and to empty, after ARENA_HOUR_CLOSE */
var arenaCrowdParked = false;
var crowdTmpQ = new THREE.Quaternion(), crowdTmpQ2 = new THREE.Quaternion();
var crowdTmpPos = new THREE.Vector3(), crowdTmpSc = new THREE.Vector3();
var crowdTmpMat = new THREE.Matrix4();

/* the only thing that drives the crowd's excitement is the fight itself */
function arenaCrowdRoar(amount){
  ARENA_CROWD_EXC = Math.min(1.35, ARENA_CROWD_EXC + amount);
}
function arenaCrowdFill(hour){
  if(hour <= ARENA_HOUR_OPEN - ARENA_CROWD_LEAD) return 0;
  if(hour <  ARENA_HOUR_OPEN)  return (hour - (ARENA_HOUR_OPEN - ARENA_CROWD_LEAD)) / ARENA_CROWD_LEAD;
  if(hour <= ARENA_HOUR_CLOSE) return 1;
  if(hour <  ARENA_HOUR_CLOSE + ARENA_CROWD_TAIL) return 1 - (hour - ARENA_HOUR_CLOSE)/ARENA_CROWD_TAIL;
  return 0;
}
function arenaCrowdUpdate(dt, hour){
  if(!lifeCrowdMesh) return;
  ARENA_CROWD_EXC = Math.max(0, ARENA_CROWD_EXC - dt*0.55);
  var fill = arenaCrowdFill(hour);
  if(fill <= 0){
    /* the house is shut. Park every figure ONCE and then do nothing at all —
       this is the whole no-crowd-at-3am case, and it costs one branch. */
    if(!arenaCrowdParked){
      crowdTmpMat.compose(crowdTmpPos.set(0,-500,0), crowdTmpQ.identity(), crowdTmpSc.set(0,0,0));
      for(var p=0;p<ARENA_CROWD_N;p++) lifeCrowdMesh.setMatrixAt(p, crowdTmpMat);
      lifeCrowdMesh.instanceMatrix.needsUpdate = true;
      arenaCrowdParked = true;
    }
    return;
  }
  arenaCrowdParked = false;
  var t = ARENA_T, exc = ARENA_CROWD_EXC;
  for(var i=0;i<ARENA_CROWD_N;i++){
    var s = ARENA_CROWD_SEATS[i];
    /* arrival: this seat is taken once the house is CR_ARR full, and the
       figure eases in over the next sixth of the ramp rather than popping */
    var vis = (fill - CR_ARR[i]) * 6;
    if(vis <= 0){
      crowdTmpMat.compose(crowdTmpPos.set(s.x, s.y, s.z), crowdTmpQ.identity(), crowdTmpSc.set(0,0,0));
      lifeCrowdMesh.setMatrixAt(i, crowdTmpMat);
      continue;
    }
    var sc = vis >= 1 ? 1 : vis*vis*(3-2*vis);
    var r = CR_RT[i];
    var sway = Math.sin(t*r + CR_PH[i]);                 /* weight shifting side to side */
    var lean = Math.sin(t*r*0.61 + CR_P2[i]);            /* forward/back on the bench      */
    var turn = Math.sin(t*r*0.37 + CR_P3[i]);            /* glancing along the row         */
    /* the wave: one crest travelling round the bowl, squared so it is a
       passing surge rather than a sine the whole crowd sits inside */
    var wv = Math.sin(CR_ANG[i]*1.7 - t*1.15 + CR_P2[i]*0.22);
    var w  = wv > 0 ? wv*wv : 0;
    var rise  = (0.16 + 1.05*exc) * w;                   /* half out of the seat on a kill */
    var pitch = 0.13*lean + 0.34*rise;                   /* leaning into the fight         */
    var yaw   = s.ry + 0.20*turn + 0.12*sway*exc;
    crowdTmpQ.setFromAxisAngle(LIFE_UP, yaw);
    crowdTmpQ2.setFromAxisAngle(arenaAxisX, pitch);
    crowdTmpQ.multiply(crowdTmpQ2);
    crowdTmpPos.set(s.x, s.y + 0.09*sway + 0.85*rise, s.z);
    crowdTmpSc.set(sc, sc, sc);
    crowdTmpMat.compose(crowdTmpPos, crowdTmpQ, crowdTmpSc);
    lifeCrowdMesh.setMatrixAt(i, crowdTmpMat);
  }
  lifeCrowdMesh.instanceMatrix.needsUpdate = true;
}

function updateArena(dt){
  if(typeof ARENA_SITE === 'undefined' || !ARENA_SITE || !ARENA_BOUTS.length) return;
  ARENA_T += dt;
  var S = ARENA_SITE, FY = S.fieldY;
  var hour = (typeof dayNightHour === 'function') ? dayNightHour() : 12;
  var openNow = (hour >= ARENA_HOUR_OPEN && hour < ARENA_HOUR_CLOSE);
  ARENA_MESH_DIRTY.h = ARENA_MESH_DIRTY.q = ARENA_MESH_DIRTY.t = false;
  arenaCrowdUpdate(dt, hour);      /* the stands — see the rig above */

  ARENA_BOUTS.forEach(function(b){
    b.t += dt;
    b.orbAng += dt * b.orbSpin;

    /* closing time: the sand clears whatever was happening on it. */
    if(!openNow && b.state !== 'idle'){
      b.side[0].concat(b.side[1]).forEach(arenaHide);
      b.attend.forEach(arenaHide);
      b.state = 'idle'; b.t = 0; b.idleFor = 1;
      b.side = [[],[]]; b.corpses = []; b.attend = [];
      return;
    }
    if(b.state === 'idle'){
      if(openNow && b.t >= b.idleFor) arenaRoll(b);
      return;
    }

    /* ---- entering: out of the pit gate and onto the sand ---------------- */
    if(b.state === 'enter'){
      var u = Math.min(1, b.t / b.enterFor), us = u*u*(3-2*u);
      b.side[0].concat(b.side[1]).forEach(function(f){
        arenaFightBase(b, f, arenaBaseTmp);
        var g0x = S.gateX + f.gateOff, g0z = S.gateZ;
        var x = g0x + (arenaBaseTmp[0]-g0x)*us;
        var z = g0z + (arenaBaseTmp[1]-g0z)*us;
        f.x = x; f.z = z;
        var yaw = Math.atan2(arenaBaseTmp[0]-g0x, arenaBaseTmp[1]-g0z);
        f.yaw = yaw;
        /* a walking bob, and the blade carried low (roll the other way) */
        var bob = Math.abs(Math.sin(b.t*5.2 + f.phase))*0.28;
        arenaPlace(f, x, FY + bob, z, yaw, 0, -0.20, f.sc);
      });
      b.attend.forEach(arenaHide);
      if(u >= 1){ b.state = 'fight'; b.t = 0; }
      return;
    }

    /* ---- fighting -------------------------------------------------------- */
    if(b.state === 'fight'){
      [0,1].forEach(function(s){
        arenaFoeCentre(b, s, arenaFoeTmp);
        b.side[s].forEach(function(f){
          if(!f.alive){
            /* falling, then lying where it fell — the corpse stays on the
               sand until an attendant comes for it. */
            f.dieT = Math.min(1.4, f.dieT + dt);
            var k = f.dieT/1.4, ks = k*k*(3-2*k);
            if(f.mesh === 'h'){
              arenaPlace(f, f.x, FY + ks*ARENA_LIE_Y, f.z, f.yaw, ks*Math.PI*0.5, ks*0.22, f.sc);
            }else{
              arenaPlace(f, f.x, FY + ks*ARENA_LIE_Y_BEAST*f.sc, f.z, f.yaw, 0, ks*Math.PI*0.5, f.sc);
            }
            return;
          }
          arenaFightBase(b, f, arenaBaseTmp);
          var tx = arenaFoeTmp[0] - arenaBaseTmp[0], tz = arenaFoeTmp[1] - arenaBaseTmp[1];
          var L = Math.hypot(tx,tz) || 1; tx /= L; tz /= L;
          /* the strike cycle. Positive half = lunge in and swing; negative
             half = pull back out of measure. Squared on both sides so the
             motion snaps rather than sliding sinusoidally. */
          var ph = Math.sin(ARENA_T*f.rate + f.phase);
          var adv = ph > 0 ? ph*ph*f.reach : -(ph*ph)*1.1;
          var x = arenaBaseTmp[0] + tx*adv, z = arenaBaseTmp[1] + tz*adv;
          f.x = x; f.z = z;
          f.yaw = Math.atan2(tx, tz);
          var pitch = ph > 0 ?  ph*ph*0.38 : -(ph*ph)*0.18;
          var roll  = f.mesh === 'h' ? (ph > 0 ? -ph*ph*0.26 : ph*ph*0.11) : 0;
          /* the strike hop. Was 0.40 when the fighter was a legless cylinder,
             where nothing showed a hop from a lift. With real legs and feet
             under him, a pitch of 0.38 rad already swings the back heel clear
             of the sand all by itself, and 0.40 on top of that read as the
             man levitating out of his lunge — 0.14 keeps the weight-shift
             without taking his front foot off the ground. Beasts, which have
             no feet to plant, keep the bigger pounce. */
          var hop   = ph > 0 ? ph*ph*(f.mesh === 'h' ? 0.14 : 0.40) : 0;
          if(f.mesh !== 'h'){ pitch = ph > 0 ? ph*ph*0.34 : -(ph*ph)*0.30; }   /* beasts pounce and rear */
          arenaPlace(f, x, FY + hop, z, f.yaw, pitch, roll, f.sc);
        });
      });
      b.attend.forEach(arenaHide);

      /* the kill roll. Weighted by side strength^1.6, so the card's own
         mismatch decides the outcome most of the time but not always. */
      if(b.t >= b.killAt){
        var sA = Math.pow(arenaSideStr(b,0), 1.6), sB = Math.pow(arenaSideStr(b,1), 1.6);
        var loseSide = (rnd() < sB/(sA+sB+1e-6)) ? 0 : 1;
        var pool = b.side[loseSide].filter(function(f){ return f.alive; });
        if(pool.length){
          var v = pool[Math.floor(rnd()*pool.length)];
          v.alive = false; v.dieT = 0; b.kills++;
          b.corpses.push(v);
          if(v.mesh === 'h') arenaTint(v, ARENA_COL_BLOOD);
          arenaCrowdRoar(0.85);      /* the stands come up out of their seats */
        }
        b.killAt = b.t + rr(5, 10);
        if(!arenaSideStr(b,0) || !arenaSideStr(b,1)){
          b.state = 'clear'; b.t = 0; b.exitT = 0;
          b.clearIdx = 0; b.clearPhase = 'fetch'; b.clearT = 0;
        }
      }
      return;
    }

    /* ---- clearing the sand ----------------------------------------------
       Two things run at once: the survivors take a beat of victory pose and
       then walk out of the gate, and the attendants come in through it and
       drag the bodies back out one at a time. */
    if(b.state === 'clear'){
      b.exitT += dt;
      b.side[0].concat(b.side[1]).forEach(function(f){
        if(!f.alive) return;
        if(b.exitT < 2.0){
          /* blade up, turning slowly to the stands */
          var sw = Math.sin(ARENA_T*1.4 + f.phase);
          arenaPlace(f, f.x, FY, f.z, f.yaw + sw*0.9, -0.16, f.mesh==='h' ? -0.34 : 0, f.sc);
        }else{
          var u2 = Math.min(1, (b.exitT-2.0)/3.6), us2 = u2*u2*(3-2*u2);
          if(u2 >= 1){ arenaHide(f); return; }
          var ex = f.x + (S.gateX-f.x)*us2, ez = f.z + (S.gateZ-f.z)*us2;
          var eyaw = Math.atan2(S.gateX-f.x, S.gateZ-f.z);
          arenaPlace(f, ex, FY + Math.abs(Math.sin(b.exitT*5.0+f.phase))*0.26, ez,
                     eyaw, 0, f.mesh==='h' ? -0.20 : 0, f.sc);
        }
      });

      /* every body still waiting its turn lies where it fell — redrawn each
         frame because a fighter killed on the very frame the bout ended was
         last composed STANDING, and would otherwise stay upright on the sand
         until an attendant reached it. */
      for(var ci=b.clearIdx; ci<b.corpses.length; ci++){
        var cb = b.corpses[ci];
        if(cb.mesh === 'h') arenaPlace(cb, cb.x, FY+ARENA_LIE_Y, cb.z, cb.yaw, Math.PI*0.5, 0.22, cb.sc);
        else                arenaPlace(cb, cb.x, FY+ARENA_LIE_Y_BEAST*cb.sc, cb.z, cb.yaw, 0, Math.PI*0.5, cb.sc);
      }

      var body = b.corpses[b.clearIdx];
      if(!body){
        b.attend.forEach(arenaHide);
        if(b.exitT > 5.7){
          b.side[0].concat(b.side[1]).forEach(arenaHide);
          b.state = 'idle'; b.t = 0; b.idleFor = rr(1.5,3.5);
          b.side = [[],[]]; b.corpses = []; b.attend = [];
        }
        return;
      }
      b.clearT += dt;
      if(b.clearPhase === 'fetch'){
        var uf = Math.min(1, b.clearT/2.2), ufs = uf*uf*(3-2*uf);
        var ayaw = Math.atan2(body.x-S.gateX, body.z-S.gateZ);
        b.attend.forEach(function(at, k){
          var lat = (k ? 1 : -1) * 1.6;
          var ax = S.gateX + (body.x-S.gateX)*ufs + Math.cos(ayaw)*lat;
          var az = S.gateZ + (body.z-S.gateZ)*ufs - Math.sin(ayaw)*lat;
          at.x = ax; at.z = az; at.yaw = ayaw;
          arenaPlace(at, ax, FY + Math.abs(Math.sin(b.clearT*5.4+k))*0.26, az,
                     ayaw, 0, -0.26, 1);
        });
        /* the body just lies there while they come for it */
        if(body.mesh === 'h') arenaPlace(body, body.x, FY+ARENA_LIE_Y, body.z, body.yaw, Math.PI*0.5, 0.22, body.sc);
        else                  arenaPlace(body, body.x, FY+ARENA_LIE_Y_BEAST*body.sc, body.z, body.yaw, 0, Math.PI*0.5, body.sc);
        if(uf >= 1){ b.clearPhase = 'drag'; b.clearT = 0; b.dragFromX = body.x; b.dragFromZ = body.z; }
        return;
      }
      /* dragging: attendants haul the body back through the gate, the body
         trailing a little behind them, head first. */
      var ud = Math.min(1, b.clearT/4.2), uds = ud*ud*(3-2*ud);
      var dyaw = Math.atan2(S.gateX-b.dragFromX, S.gateZ-b.dragFromZ);
      var hx = b.dragFromX + (S.gateX-b.dragFromX)*uds;
      var hz = b.dragFromZ + (S.gateZ-b.dragFromZ)*uds;
      b.attend.forEach(function(at, k){
        var lat = (k ? 1 : -1) * 1.5;
        at.x = hx + Math.cos(dyaw)*lat; at.z = hz - Math.sin(dyaw)*lat; at.yaw = dyaw;
        arenaPlace(at, at.x, FY + Math.abs(Math.sin(b.clearT*4.4+k))*0.22,
                   at.z, dyaw, 0.22, -0.24, 1);
      });
      var trail = body.mesh === 'h' ? 4.6 : 6.6;   /* a body-length clear of the attendants' heels: a corpse lying ON them just reads as a shadow at their feet */
      var bx = hx - Math.sin(dyaw)*trail, bz = hz - Math.cos(dyaw)*trail;
      body.x = bx; body.z = bz; body.yaw = dyaw;
      if(body.mesh === 'h') arenaPlace(body, bx, FY+ARENA_LIE_Y, bz, dyaw, Math.PI*0.5, 0.22, body.sc);
      else                  arenaPlace(body, bx, FY+ARENA_LIE_Y_BEAST*body.sc, bz, dyaw, 0, Math.PI*0.5, body.sc);
      if(ud >= 1){
        arenaHide(body);
        b.clearIdx++; b.clearPhase = 'fetch'; b.clearT = 0;
        if(!b.corpses[b.clearIdx]) b.exitT = Math.max(b.exitT, 5.8);
      }
      return;
    }
  });

  if(ARENA_MESH_DIRTY.h) lifeGladMesh.instanceMatrix.needsUpdate = true;
  if(ARENA_MESH_DIRTY.q) lifeABeastMesh.instanceMatrix.needsUpdate = true;
  if(ARENA_MESH_DIRTY.t) lifeABeetleMesh.instanceMatrix.needsUpdate = true;
}

/* every slot starts parked off-stage: the page opens at hour 10, two game
   hours before the first pairing, and an InstancedMesh's untouched slots
   would otherwise all sit stacked at the world origin. */
(function(){
  var white = new THREE.Color(0xffffff);
  [[lifeGladMesh, ARENA_HUMAN_N], [lifeABeastMesh, ARENA_QUAD_N], [lifeABeetleMesh, ARENA_BEETLE_N]].forEach(function(e){
    var m = e[0], n = e[1], mm = new THREE.Matrix4();
    mm.compose(new THREE.Vector3(0,-500,0), new THREE.Quaternion(), new THREE.Vector3(0,0,0));
    for(var i=0;i<n;i++){
      m.setMatrixAt(i, mm);
      /* REAL BUG, caught on a screenshot: every arena combatant rendered
         pure white, ignoring its setColorAt() tint. An InstancedMesh's
         instanceColor attribute does not exist until the first
         setColorAt(), and the material's shader program is compiled with
         or without the instance-colour path baked in at FIRST RENDER --
         so a population whose colours are only assigned later (here: when
         a match is rolled, i.e. at frame time) compiles a program that has
         no instance-colour input and never picks one up. Every other
         setColorAt() population in this file happens to tint at build
         time, before the first frame, which is why none of them hit this.
         Seeding the attribute here, before the first render, is the fix. */
      m.setColorAt(i, white);
    }
    m.instanceMatrix.needsUpdate = true;
    if(m.instanceColor) m.instanceColor.needsUpdate = true;
  });
})();
