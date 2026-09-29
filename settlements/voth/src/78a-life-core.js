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

