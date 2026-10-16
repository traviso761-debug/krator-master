/* ============================== 15. LAND PLACEMENT ============================== */
reseed(600001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */


var GRIDC = 48, GRID = {};
function gkey(i,j){ return i+','+j; }
function gridPut(o){
  var i0=Math.floor((o.x-o.rad)/GRIDC), i1=Math.floor((o.x+o.rad)/GRIDC);
  var j0=Math.floor((o.z-o.rad)/GRIDC), j1=Math.floor((o.z+o.rad)/GRIDC);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
    var k=gkey(i,j); (GRID[k]||(GRID[k]=[])).push(o);
  }
}
function gridHit(x,z,rad){
  var i0=Math.floor((x-rad)/GRIDC), i1=Math.floor((x+rad)/GRIDC);
  var j0=Math.floor((z-rad)/GRIDC), j1=Math.floor((z+rad)/GRIDC);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
    var a=GRID[gkey(i,j)]; if(!a) continue;
    for(var n=0;n<a.length;n++){
      var o=a[n], dx=x-o.x, dz=z-o.z, rr2=rad+o.rad;
      if(dx*dx+dz*dz < rr2*rr2) return true;
    }
  }
  return false;
}
/* removes a record claim() previously returned, from both PLACED and every
   GRID bucket gridPut() filed it under (same bounding box, so the same
   bucket range recovers it) — the wall/gate/tower redo's own fix for the
   OBST self-collision bug documented at its reserve() call site
   (30-layout.js): a wall node's cheap early margin reservation must be
   evicted right before that SAME node's own real, precise claim() runs, or
   the real claim always collides with itself. Not used for anything else
   today — a targeted tool for a targeted problem, not a general PLACED
   "unclaim" API. */
function gridRemove(o){
  var i0=Math.floor((o.x-o.rad)/GRIDC), i1=Math.floor((o.x+o.rad)/GRIDC);
  var j0=Math.floor((o.z-o.rad)/GRIDC), j1=Math.floor((o.z+o.rad)/GRIDC);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
    var a=GRID[gkey(i,j)]; if(!a) continue;
    var idx=a.indexOf(o); if(idx>=0) a.splice(idx,1);
  }
  var pi=PLACED.indexOf(o); if(pi>=0) PLACED.splice(pi,1);
}
var PLACED = [];
/* returns the claimed record (truthy) so a caller can attach facade-relevant
   facts to it afterward — h, kind, col, yb, on 'town' entries; every existing
   call site only ever tested this for truthiness, so this is safe */
function claim(x,z,fx,fz,ry,tag){
  /* real bug, found by the owner's overlap-check request: max(fx,fz) is
     only the half-length of a rectangle's LONGER SIDE, not its true
     circumscribing radius — a corner sits hypot(fx,fz) from centre, which
     for a non-square footprint (compounds: fz = fx*rr(0.74,1.22), often
     visibly off-square) is meaningfully bigger. gridHit()'s circle-circle
     test was therefore sometimes smaller than the actual rectangle,
     letting two footprints overlap corner-to-corner without either claim()
     call ever detecting it — confirmed empirically: an OBB/SAT check over
     every core/estate town+compound found 52 real overlapping pairs before
     this fix, all between a compound and a nearby town building or another
     compound (the two shapes most often built at rectangular, non-square
     proportions). This is shared machinery every claim() caller relies on,
     not specific to any one placement pass. */
  var rad = Math.hypot(fx,fz)*1.02;
  if(gridHit(x,z,rad)) return false;
  var o = { x:x, z:z, fx:fx, fz:fz, ry:ry, rad:rad, tag:tag };
  gridPut(o); PLACED.push(o); return o;
}
OBST.forEach(function(o){
  var rec = claim(o.x,o.z,o.fx,o.fz,o.ry,'fixed');
  if(o.wallNode) o.wallNode._preClaim = rec;   /* see gridRemove()'s own comment above */
});

function footing(x,z,fx,fz,ry){
  var lo=1e9, hi=-1e9;
  for(var sx=-1;sx<=1;sx++) for(var sz=-1;sz<=1;sz++){
    var p = loc(x,z, sx*fx, sz*fz, ry);
    var h = terrainH(p[0],p[1]);
    if(h<lo) lo=h; if(h>hi) hi=h;
  }
  return { lo:lo, hi:hi };
}
function plinth(x,z,fx,fz,ry,col){
  var f = footing(x,z,fx,fz,ry);
  var drop = Math.min(f.hi - f.lo, 16);
  if(drop > 0.6) BOX(x, f.hi-drop-1.0, z, fx*2*1.04, drop+1.2, fz*2*1.04, ry, shade(col,-0.24));
  return f.hi;
}
/* street-facing alignment pass: markets/parks outrank major roads, which
   outrank minor roads/alleys. Precomputed once (not per-call) since
   DISTRICTS never changes after load. */
var FACE_DISTRICTS = DISTRICTS.filter(function(d){ return d.type==='market' || d.type==='park'; });
var MAJOR_CLS = { quay:1, boulevard:1, ring:1, highway:1 };
function nearestDistrictFrontage(x,z){
  var best=null, bd=1e18;
  for(var i=0;i<FACE_DISTRICTS.length;i++){
    var poly = FACE_DISTRICTS[i].poly;
    for(var a=0,b=poly.length-1; a<poly.length; b=a++){
      var ax=poly[a][0], az=poly[a][1], bx=poly[b][0], bz=poly[b][1];
      var dx=bx-ax, dz=bz-az, L2=dx*dx+dz*dz;
      var t = L2 ? clamp(((x-ax)*dx+(z-az)*dz)/L2, 0, 1) : 0;
      var px=ax+dx*t, pz=az+dz*t, d=Math.hypot(x-px,z-pz);
      if(d<bd){ bd=d; best=[px,pz]; }
    }
  }
  return best ? {dist:bd, point:best} : null;
}
function faceStreet(x,z,fx,fz){
  /* the real tangent from the road graph (30-layout.js), not openAt()'s
     raster shadow of it — face the perpendicular that points from (x,z)
     toward the nearest point ON the street/frontage, not along it.
     loc()'s convention makes local +x world-facing (cos(ry),-sin(ry)), so
     aligning that with the direction-to-target solves to atan2(-dz,dx).

     Priority, per the owner's street-facing pass: 1) a nearby market/park
     district's own edge, 2) the nearest MAJOR road (quay/boulevard/ring/
     highway) if reasonably close — searched with a wider radius than #3
     since we actively prefer a major road over a slightly-closer alley,
     3) the nearest road of any class (the original behaviour), 4) the
     original openAt() probe if nothing in the road graph is close enough.
     Farms and manors don't call this function (their own placement is
     untouched) and chinampas aren't buildings, so neither needed
     excluding here.

     Returns {ry, dist} — dist is the straight-line distance to whichever
     target was matched (0 for the openAt() fallback, which has no real
     target point), used by the door-touch relocation pass below to know
     how far a building's front face currently sits from its frontage.
     District frontage counts exactly like a street for that purpose, per
     the owner ("markets/parks can be treated as street for this
     purpose") — it's already the same unified return either way. */
  var nd = nearestDistrictFrontage(x,z);
  if(nd && nd.dist < Math.max(fx,fz) + 90){
    var ddx = nd.point[0]-x, ddz = nd.point[1]-z, dd = Math.hypot(ddx,ddz);
    if(dd > 0.5) return { ry: Math.atan2(-ddz, ddx), dist: dd };
  }
  var nsMajor = nearestStreet(x,z, MAJOR_CLS);
  if(nsMajor && nsMajor.dist < Math.max(fx,fz) + 110){
    var dxm = nsMajor.point[0]-x, dzm = nsMajor.point[1]-z, dm = Math.hypot(dxm,dzm);
    if(dm > 0.5) return { ry: Math.atan2(-dzm, dxm), dist: dm };
  }
  var ns = nearestStreet(x,z);
  if(ns && ns.dist < Math.max(fx,fz) + 60){
    var dx = ns.point[0]-x, dz = ns.point[1]-z, d = Math.hypot(dx,dz);
    if(d > 0.5) return { ry: Math.atan2(-dz, dx), dist: d };
  }
  /* fallback: nothing in the road graph within frontage range */
  var best=0, bs=-1;
  for(var q=0;q<4;q++){
    var a=q*Math.PI/2, s=0;
    for(var d2=1;d2<=3;d2++){
      if(!openAt(x + Math.cos(a)*(fx + d2*9), z + Math.sin(a)*(fz + d2*9))) s += (4-d2);
    }
    if(s>bs){ bs=s; best=a; }
  }
  return { ry: -best, dist: 0 };
}

/* ============================== 15a. HOUSE OF HEALING SITE ==============================
   Owner: "place here: [[-742.8,2070.6],[-676.3,1925.3],[-510.6,1995.7],[-554.8,2155.0]],
   move other things out of way to do so, make sure it aligns to street grid." houseOfHealing()
   (65-facade.js) is a hollow-square canton-vocabulary building with a real gated entrance on
   EVERY side (its own docstring: "no one face is more front than another", ry kept only for
   side-indexing consistency with every other builder) -- so faceStreet()'s single answer here
   is exactly as good a "front" as any other quarter-turn of it, the same street-facing
   convention townBuilding() itself uses just below.

   The centroid of the owner's 4-point polygon is the building's own centre (not the polygon's
   own irregular edges -- those 4 points were hand-clicked to bracket the site, not traced to
   the building's true square footprint).

   "Move other things out of way": houseOfHealing() does not self-claim (same contract as
   tavern()/monasteryAssemblyHall() -- the caller must claim() first, using the function's own
   known default footprint: fx=fz=outerHW+4=60 for the default outerHW=56). This is a
   procedural generator, not a scene editor -- nothing already pushed into a draw bucket can be
   un-drawn -- so "moving things out of the way" can only mean an EXCLUSION ZONE: reserve this
   exact footprint in claim()/PLACED here, BEFORE a single candidate for this area is ever
   considered by the town-building grid scan (reseed 44100, below), the wayside-shrine pass
   (reseed 9912, below) or 68-props.js's own scatter passes (a later fragment) -- every one of
   those is claim()-gated already, so reserving the circle first, right after claim() itself
   becomes available, is a real, load-order-safe exclusion, the same idiom OBST.forEach's early
   reservation above already relies on. A live probe against the unmodified build's own
   window._api.PLACED found exactly 3 things that would otherwise land inside this footprint --
   one 'town' building, one wayside 'shrine', one small 'prop' -- all silently excluded by this
   reservation claiming the circle first now.

   The real houseOfHealing() call (69-district-content.js, once 65-facade.js has defined the
   builder) reuses this exact record's x/z/ry/fx/fz rather than claim()-ing a second time --
   same "claim() before calling, use the function's own known fx/fz" contract as every other
   standalone builder placed this session. No rnd() draws here (faceStreet()/claim() are both
   deterministic), so no reseed() of its own is needed -- the surrounding fragment's head seed
   (600001) is untouched. */
var HOH_POLY = [[-742.8,2070.6],[-676.3,1925.3],[-510.6,1995.7],[-554.8,2155.0]];
var HOH_CX = HOH_POLY.reduce(function(s,p){ return s+p[0]; },0) / HOH_POLY.length;
var HOH_CZ = HOH_POLY.reduce(function(s,p){ return s+p[1]; },0) / HOH_POLY.length;
var HOH_HW = 60;   /* houseOfHealing()'s own default fx=fz = outerHW(56)+4, read off its return */
var HOH_RY = faceStreet(HOH_CX, HOH_CZ, HOH_HW, HOH_HW).ry;
var HOH_SITE = claim(HOH_CX, HOH_CZ, HOH_HW, HOH_HW, HOH_RY, 'houseOfHealing');
window._hohSite = HOH_SITE ? { x:HOH_SITE.x, z:HOH_SITE.z, ry:HOH_SITE.ry, fx:HOH_SITE.fx, fz:HOH_SITE.fz } : null;

/* ============================== 16. CLAN COMPOUNDS ============================== */

var COMPOUNDS = [];
function wallSeg(x,z, lx,lz, w,d, ry, yb, wh, col){
  var o = loc(x,z, lx, lz, ry);
  return [o[0], yb, o[1], w, wh, d, ry, col];
}
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } }

function compound(x, z, fx, fz, ry){
  var col = pick(TONES);
  var yb = plinth(x,z,fx,fz,ry,col) + 0.2;
  var wh = rr(10,15), wt = 2.6, gapf = 0.26;

  /* each wall segment gets its OWN coping strip, sized to that segment —
     not one box spanning the whole fx*2 x fz*2 footprint. That single box
     was a de facto roof slab over the entire compound at wall height,
     courtyard included: it is why compounds still read as solid blocks from
     directly above AND from any oblique angle no matter how the buildings
     inside were arranged — the second attempt at this (moving buildings to
     the back third) could never have been visible underneath a literal lid.
     This is the actual bug; fix it here, not by rearranging buildings again. */
  BOX.apply(null, wallSeg(x,z, -(fx-wt*0.5), 0, wt, fz*2, ry, yb, wh, col));
  BOX.apply(null, wallSeg(x,z, -(fx-wt*0.5), 0, wt*1.3, fz*2*1.01, ry, yb+wh, 1.2, shade(col,-0.24)));
  BOX.apply(null, wallSeg(x,z, 0, -(fz-wt*0.5), fx*2, wt, ry, yb, wh, col));
  BOX.apply(null, wallSeg(x,z, 0, -(fz-wt*0.5), fx*2*1.01, wt*1.3, ry, yb+wh, 1.2, shade(col,-0.24)));
  BOX.apply(null, wallSeg(x,z, 0,  (fz-wt*0.5), fx*2, wt, ry, yb, wh, col));
  BOX.apply(null, wallSeg(x,z, 0,  (fz-wt*0.5), fx*2*1.01, wt*1.3, ry, yb+wh, 1.2, shade(col,-0.24)));
  [-1,1].forEach(function(s){
    var segL = fz*(1-gapf);
    var o = loc(x,z, fx-wt*0.5, s*(fz - segL*0.5), ry);
    BOX(o[0], yb, o[1], wt, wh, segL, ry, col);
    BOX(o[0], yb+wh, o[1], wt*1.3, 1.2, segL, ry, shade(col,-0.24));
  });
  var gp = loc(x,z, fx-wt*0.5, 0, ry);
  BOX(gp[0], yb, gp[1], wt*2.4, wh*1.5, fz*gapf*2*0.92, ry, shade(col,0.05));
  BOX(gp[0], yb+wh*1.5, gp[1], wt*2.9, 1.6, fz*gapf*2*1.05, ry, shade(col,-0.16));
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c2){
    var p = loc(x,z, c2[0]*(fx-1.6), c2[1]*(fz-1.6), ry);
    FR8(p[0], yb, p[1], 7.0, wh*1.35, 7.0, ry, shade(col,-0.05));
    BOX(p[0], yb+wh*1.35, p[1], 8.2, 1.4, 8.2, ry, shade(col,-0.2));
  });

  /* buildings are confined to the back third of the compound, against the
     wall opposite the gate — this is what "carves out" the rest as a clear
     interior courtyard rather than leaving it to chance which slot gets
     picked. Old slots reached a near-centre position and, at their largest,
     the "front" ones too; both could eat into the courtyard. */
  var nb = ri(2,3);
  var slots = [[-0.62,-0.52],[-0.62,0.52],[-0.38,-0.58],[-0.38,0.58]];
  shuffle(slots);
  for(var i=0;i<nb;i++){
    var s2 = slots[i];
    var p2 = loc(x,z, s2[0]*fx, s2[1]*fz, ry);
    var kind = chance(0.22) ? 'velothi' : (chance(0.09) ? 'domed' : 'hlaalu');
    structure(p2[0], yb, p2[1], fx*rr(0.24,0.32), fz*rr(0.22,0.30),
              kind==='velothi'?rr(22,40):rr(12,26), ry + (chance(0.5)?0:Math.PI/2), kind, col);
  }
  /* the courtyard: the building slots above reach no further forward than
     local x = -0.38*fx + 0.32*fx = -0.06*fx at their largest, so centring
     this at +0.42*fx with a 0.38*fx half-extent (local x 0.04 .. 0.80)
     leaves a clear margin behind it and stops well short of the gate and
     corner towers (~0.95*fx) ahead of it — this is the garden a facade
     pass dresses */
  /* owner: "add 1 more building to each clan compound if possible." A FIFTH
     slot rather than simply raising nb above: the 4 slots in the table
     above sit in two tight pairs (local x -0.62 and -0.38 at nearly the
     same z), so with a building up to 0.32*fx wide they already interpenetrate
     whenever two of a pair are drawn — raising nb would just deepen that
     pile-up, not add a building that "fits". This slot is on the back wall's
     own centre line (local x -0.62, z 0): its z span (+-0.15*fz at the
     largest) cannot reach either pair's z (+-0.52*fz and +-0.58*fz), so it
     never clashes with any of them however the shuffle falls, and at
     -0.62*fx + 0.16*fx = -0.46*fx it stays well behind the -0.06*fx line the
     comment above identifies as the courtyard's own edge — the back-third
     rule that keeps the courtyard clear is respected, not bent.

     Drawn from an ISOLATED PRNG sub-stream: `seed` is one global stream, so
     the rr()/chance()/pick() calls inside structure() would otherwise shift
     every compound candidate generated after this one (and every farm,
     waterfront and orchard later in this same fragment) — 16 compounds would
     move because one building was added. Saving and restoring `seed` around
     it, with the sub-stream seeded off this compound's own coordinates, keeps
     the extra building deterministic and leaves the rest of the world
     byte-identical. Same reason build.py polices reseed() at fragment heads,
     applied one level down. */
  var extraSeed = seed;
  reseed(1 + (Math.abs(Math.round(x*7919 + z*104729)) % 2147483645));
  var exW = fx*rr(0.24,0.32), exD = fz*rr(0.20,0.26);
  var exKind = chance(0.20) ? 'velothi' : (chance(0.10) ? 'domed' : 'hlaalu');
  var exP = loc(x,z, -0.62*fx, 0, ry);
  structure(exP[0], yb, exP[1], exW, exD,
            exKind==='velothi'?rr(22,38):rr(12,24), ry, exKind, col);
  reseed(extraSeed);
  /* the front (courtyard-facing, local +x) face of that building: where the
     garden workers below come out of, and go back into. */
  var exDoor = loc(x,z, -0.62*fx + exW*0.5 + 1.0, 0, ry);

  var gpp = loc(x,z, fx*0.42, 0, ry);
  BOX(gpp[0], yb-0.05, gpp[1], fx*0.76, 0.35, fz*1.36, ry, 0x6a7549, 'plaster');
  /* the gate is always on the local +fx face, i.e. world direction ry */
  /* NOTE for anyone reading x/z here: they are the GARDEN's centre (gpp),
     not the compound's — the compound centre is (x,z) in this function's own
     arguments, 0.42*fx behind it. doorX/doorZ below is the extra building's
     front step, added this pass for 78-life.js's compound garden workers. */
  COMPOUNDS.push({ x:gpp[0], z:gpp[1], fx:fx*0.38, fz:fz*0.68, ry:ry, y:yb,
                   wallFx:fx, wallFz:fz, wallH:wh, wallCol:col,
                   doorX:exDoor[0], doorZ:exDoor[1] });
}

var RJ={cand:0,dist:0,wall:0,mask:0,low:0,thin:0,slope:0,clash:0,district:0,ring:0};
reseed(20250914);
(function(){
  var step = 76;
  for(var gx2=-CITY_LIM; gx2<CITY_LIM; gx2+=step){
    for(var gz2=-CITY_LIM; gz2<CITY_LIM; gz2+=step){
      var x = gx2 + rr(-30,30), z = gz2 + rr(-30,30);
      RJ.cand++;
      /* market/park/funerary districts override the default build — checked
         directly here rather than via the ground mask (see the planner's
         note by DISTRICTS in 30-layout.js for why) */
      if(districtAt(x,z)){ RJ.district++; continue; }
      var L = landDist(x,z);
      if(L < 42 || L > 620){ RJ.dist++; continue; }
      if(!openAt(x,z)){ RJ.mask++; continue; }
      var zn = zoneAt(x,z);
      if(zn !== 'core' && zn !== 'estate'){ RJ.wall++; continue; }
      if(zn === 'core' && wallDepth(x,z) < 28){ RJ.wall++; continue; }
      if(terrainH(x,z) < 5){ RJ.low++; continue; }
      var estate = (zn === 'estate');
      if(!chance(estate ? 0.74 : 0.94 - 0.50*smooth(80,600,L))){ RJ.thin++; continue; }
      var fx = estate ? rr(44,72) : rr(34,58), fz = fx*rr(0.74,1.22);
      var fs = faceStreet(x,z,fx,fz);
      var ry = fs.ry + rr(-0.13,0.13);
      /* door-to-street relocation (compounds are always core/estate, i.e.
         always "wealthy" — no flag needed here, unlike townBuilding()):
         same shift-then-fallback shape as there, see its own comment for
         why claim() only ever runs once per accepted position. The gate
         sits on the local +fx face (compound()'s own comment, a few lines
         up), which is exactly the direction this shift moves along. */
      var ox=x, oz=z;
      if(fs.dist > 0){
        var shiftAmt = fs.dist - fx - 2.0;
        if(shiftAmt > 0.3 && shiftAmt < fx*2.5){
          var nx = ox + shiftAmt*Math.cos(ry), nz = oz - shiftAmt*Math.sin(ry);
          if(openAt(nx,nz)){ x = nx; z = nz; }
        }
      }
      /* the owner: "several clan compounds overlap it" (the ring road) —
         real gap, not a rare edge case: this loop checked claim() against
         every other PLACED footprint, but never once against ROADS. The
         only road-awareness a compound ever had was faceStreet() SHIFTING
         toward its nearest street for the gate/door — nothing here ever
         REJECTED a position for landing too close to a wide, major ring
         road afterward. Checked against the ring class specifically
         (nearestStreet's own clsFilter) rather than any street, since
         compounds are meant to sit near ordinary streets by design. This
         cheap pre-filter is a CIRCULAR bound (Math.max(fx,fz)*0.75 in
         every direction) so it under-rejects whenever a road happens to
         meet the rectangle closer to a corner than a face — see the exact
         per-candidate nudge below, added for exactly that gap. */
      var rhNear = nearestStreet(x, z, {ring:true, highway:true});
      if(rhNear && rhNear.dist < rhNear.width*0.5 + Math.max(fx,fz)*0.75){ RJ.ring++; continue; }
      /* precise correction for the circular pre-filter's own blind spot: a
         later citywide ring/highway obstruction audit found seven
         compounds that passed the check above yet still had real wall
         geometry sitting in the corridor — always a road meeting the
         rectangle closer to a corner than either face (e.g. fx=35.5,
         fz=40.1 against an actual nearest-ring distance of 44, comfortably
         past the circular margin of 37.5, but the TRUE rotated-rectangle
         gap at that specific point was under the road's own half-width).
         nudgeClearOfRoad() computes that exact gap (not a circular
         approximation) and pushes (x,z) directly away from the offending
         point by only the deficit, so the rare true violation gets fixed
         with a minimal, precise displacement instead of the cheap filter
         above rejecting a much wider band of merely-close-but-fine
         candidates outright (confirmed: doing the rejection with
         Math.hypot(fx,fz) instead dropped built compounds from 20 to 6 —
         a citywide fix belongs at the one geometry that's actually wrong,
         not at every candidate that merely passes near a ring road). */
      var nudged = nudgeClearOfRoad(x, z, fx, fz, ry);
      x = nudged[0]; z = nudged[1];
      var f = footing(x,z,fx,fz,ry);
      if(f.hi - f.lo > 34){ RJ.slope++; continue; }
      var gotClaim = claim(x,z,fx+5,fz+5,ry,'compound');
      if(!gotClaim && (x!==ox || z!==oz)){
        x=ox; z=oz;
        rhNear = nearestStreet(x, z, {ring:true, highway:true});
        if(rhNear && rhNear.dist < rhNear.width*0.5 + Math.max(fx,fz)*0.75){ RJ.ring++; continue; }
        var nudged2 = nudgeClearOfRoad(x, z, fx, fz, ry);
        x = nudged2[0]; z = nudged2[1];
        f = footing(x,z,fx,fz,ry);
        if(f.hi - f.lo > 34){ RJ.slope++; continue; }
        gotClaim = claim(x,z,fx+5,fz+5,ry,'compound');
      }
      if(!gotClaim){ RJ.clash++; continue; }
      compound(x,z,fx,fz,ry);
    }
  }
})();
window._compounds = PLACED.filter(function(o){return o.tag==='compound';}).length;
window._rejCompound = RJ;

/* ============================== 17. THE WATERFRONT ============================== */

reseed(60613);
(function(){
  /* a stone revetment the length of the inhabited coast */
  var revChinSkips = 0;
  for(var s=CITY_S0-150; s<CITY_S1+150; s+=26){
    var p0 = shoreIn(s, 2), p1 = shoreIn(s+26, 2);
    var mq=[(p0[0]+p1[0])/2, (p0[1]+p1[1])/2];
    var L = Math.hypot(p1[0]-p0[0], p1[1]-p0[1]);
    var ry = Math.atan2(p1[0]-p0[0], p1[1]-p0[1]);
    if(inRiver(mq[0],mq[1], 34)) continue;                   /* the river mouth stays open */
    var harb = (s > HARB_S0-110 && s < HARB_S1+110);
    /* real overlap, found by the owner's overlap-check request: 55-chinampa.js
       runs before this fragment and has no idea this quay exists, so wherever
       the shore's own curvature let a row-0 bed sit unusually close to the
       true waterline, this revetment (which hugs shoreIn(s,2) +- half its own
       width — up to 12.5 in the harbour stretch) laid stone right through the
       bed's mud platform. chinHit() is already built and exposed by
       55-chinampa.js for exactly this kind of "does a bed already occupy
       this ground" query (68-props.js's canoe placement uses it the same
       way) — radius is the revetment's own half-width (harbour's wider 12.5)
       plus the bed-footprint radius chinPut() stores (9) plus a little slop. */
    if(typeof chinHit === 'function' && chinHit(mq[0], mq[1], (harb?12.5:8.5)+9+2)){ revChinSkips++; continue; }
    var top = harb ? 4.4 : 4.0 + 1.3*Math.sin(s*0.02);
    FR8(mq[0], -9, mq[1], harb ? 23 : 15, top+9, L*1.14, ry, harb ? 0x9a8e74 : 0x8c826e);
    BOX(mq[0], top-0.7, mq[1], harb ? 25 : 17, 1.5, L*1.14, ry, 0x7e7460);
    if(harb && chance(0.34)) CYL(mq[0], top, mq[1], 1.0, 2.0, 0, 0x6c6353);
  }
  window._revetChinSkips = revChinSkips;
  /* cargo on the apron */
  for(var i3=0;i3<80;i3++){
    var ss = rr(HARB_S0-60, HARB_S1+60);
    var pp = shoreIn(ss, rr(16, 56));
    var s3 = rr(2.4,4.6), yb3 = terrainH(pp[0],pp[1]), stack = ri(1,3);
    for(var k3=0;k3<stack;k3++)
      BOX(pp[0]+rr(-1,1)*k3, yb3+k3*s3*0.9, pp[1]+rr(-1,1)*k3, s3*rr(0.8,1.3), s3*0.9,
          s3*rr(0.8,1.3), shoreRY(ss)+k3*0.2, pick([0x7a6a4e,0x877558,0x6d5e45,0x917f67]), 'wood');
  }

  /* piers */
  PIERS.forEach(function(p){
    var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz), ry=Math.atan2(dx,dz);
    var n=Math.round(L/16);
    for(var i=0;i<n;i++){
      var t=(i+0.5)/n, x=p.x0+dx*t, z=p.z0+dz*t;
      BOX(x, 3.0, z, p.w, 1.7, L/n*1.06, ry, 0x8a7659, 'wood');
      var bed=Math.min(-1, terrainH(x,z));
      [-1,1].forEach(function(s){
        var o=loc(x,z, s*(p.w*0.5-1.2), 0, ry);
        CYL(o[0], bed, o[1], 1.05, 3.0-bed, 0, 0x6b5942, 'wood');
      });
    }
    var hx=p.x0+dx*0.9, hz=p.z0+dz*0.9;
    if(chance(0.6)){
      var ch=rr(12,18);
      CYL(hx, 4.6, hz, 1.5, ch, 0, 0x6b5942, 'wood');
      BOX(hx, 4.6+ch-1, hz, 2.0, 1.6, 14, ry+0.4, 0x6b5942, 'wood');
    }
  });

  /* sheds at the pier roots, between the piers */
  for(var pi=0; pi<PIERS.length-1; pi++){
    var sm = (PIERS[pi].s + PIERS[pi+1].s)/2;
    var pq = shoreIn(sm, rr(20,34)), rq = shoreRY(sm);
    if(!claim(pq[0],pq[1], 12, 8, rq, 'shed')) continue;
    shed(pq[0], terrainH(pq[0],pq[1]), pq[1], 18, 11, rr(6,9), rq+Math.PI/2, pick(TONES_POOR));
  }
  /* warehouses along the apron */
  for(var i2=0;i2<15;i2++){
    var s4 = mix(HARB_S0-80, HARB_S1+80, (i2+0.5)/15);
    var p2 = shoreIn(s4, rr(66,112));
    var ry2 = shoreRY(s4);
    var w = rr(28,48), d = rr(16,26);
    /* this loop only ever checked claim() against other PLACED footprints,
       never ROADS — a citywide ring/highway obstruction audit found six of
       these fifteen sitting in the ring boulevard that runs along the
       harbour-facing side of the core (the same class of gap nudgeClearOfRoad
       (below) already fixes for compounds; reused here rather than
       duplicated). Nudge before claim() so the reservation and the drawn
       geometry (below, at p2) always agree. */
    p2 = nudgeClearOfRoad(p2[0], p2[1], w*0.5, d*0.5, ry2);
    if(!claim(p2[0],p2[1], w*0.5+5, d*0.5+5, ry2, 'warehouse')) continue;
    var col = pick(TONES_POOR);
    var yb = plinth(p2[0],p2[1], w*0.5, d*0.5, ry2, col);
    shed(p2[0], yb, p2[1], d, w, rr(11,16), ry2+Math.PI/2, col);
  }

  /* the ships — this static galleon geometry is gone (the owner: "this
     european galleon type vessel doesn't really fit dark elves"), but
     the SHIPS array itself (30-layout.js, x/z/ry/len/beam/masts for
     these same 4 harbour berths) is deliberately NOT removed: every
     number in this block was transcribed verbatim into the life layer's
     new galleon model (src/78-life.js — search LIFE_GALLEON), and the
     owner plans to hand-pick which docks (including, potentially, these
     4 original ones) get a permanently-stationary ship vs. stay open
     for the mobile pool. SHIPS' own x/z/ry are still there, ready for
     that, once assigned rather than auto-rendered here. */
})();

/* ============================== 18. CURTAIN WALL ============================== */
/* Legacy shore-offset wall + its GATES.forEach intact gate are gone, per the
   owner ("remove all gates and walls placed by legacy wall system"). The
   replacement is the point-designated wall built in 30-layout.js
   (WNODES: 17 towers + named/generic gates wherever that line actually
   crosses a real road; WSEGS: the wall body between each consecutive
   pair, damage-stated by the floor-of-average rule). It is built HERE, in
   the exact fragment slot the legacy wall held — strictly before
   "19. THE BUILT-UP CITY" below — because that ordering is what actually
   prevents overlap: every claim() this pass makes lands in PLACED before
   any town/compound candidate is ever scanned, so a building can't land
   inside a tower/gate/standing wall segment in the first place. (The
   owner's own overlap-audit request is still honoured — see the
   verification pass at the very end of 65-facade.js — but by this point
   it's a check that the count is zero, not a rescue operation.)

   watchtower()/wallSegRender()/the gate builders/facadeFindGateSite() are
   all defined in 65-facade.js; callable from here regardless, because the
   whole build is one concatenated script and function DECLARATIONS hoist
   across the fragment boundary (same trick this codebase already relies
   on for facadeFindGateSite() itself). window._newGates is initialised
   here (not in 65-facade.js) for the same reason — this is the first
   place anything writes to it. */

reseed(1180);
window._newGates = [];
window._newTowers = [];
(function(){
  /* PASS 1 — site search: find each node's real, precise position. Evict
     that node's own early margin reservation (its `_preClaim`, pushed onto
     OBST in 30-layout.js) FIRST — otherwise the real claim() below always
     collides with itself and the node drifts off the wall line for no
     real reason (see gridRemove()'s own comment near its definition above:
     this was the actual root cause of the reported "wonky" connections —
     empirically, EVERY wall node was being forced out to at least ring 2
     of facadeFindGateSite's spiral, ~30+ units off its ideal line, purely
     by colliding with its own margin reservation, never anything else). A
     destroyed gate never runs a site search: it is deleted outright, per
     the owner, so it keeps its ideal (pre-search) position purely as a
     connectivity placeholder for PASS 2 (the gap it leaves still needs two
     real ends to converge toward). */
  WNODES.forEach(function(n){
    if(n.kind === 'tower'){
      if(n._preClaim) gridRemove(n._preClaim);
      var site = facadeFindGateSite(n.x, n.z, { fx:10, fz:10, maxSlope:20, ry:n.ry, tag:'tower' });
      if(site){ n.builtX = site.x; n.builtZ = site.z; } else n.skip = true;
    }else{
      if(n.health <= 0){ n.deleted = true; return; }   /* destroyed gate: deleted outright, per the owner */
      if(n._preClaim) gridRemove(n._preClaim);
      var siteG = facadeFindGateSite(n.x, n.z, { fx: n.named?11:10, fz: n.named?19:17, maxSlope:16, ry:n.ry, tag:'gate' });
      if(siteG){ n.builtX = siteG.x; n.builtZ = siteG.z; } else n.skip = true;
    }
  });

  /* PASS 2 — rebuild connectivity as a REAL nearest-neighbor graph over
     final positions (the site search's own result where one ran, else the
     node's ideal line position — a destroyed/deleted gate, or the rare
     node whose site search found nothing at all in 28 rings), per the
     owner: "for every tower AND every gate... find its closest 2 other
     nodes by actual straight-line distance, and draw exactly one straight
     wall segment to each... treat them the same." Tried literally first —
     the UNION of every node's own top-2-nearest picks, trimming the
     longest edge at any node left with degree>2 — and checked against
     this wall's ACTUAL built coordinates rather than assumed clean, per
     the owner's own instruction to verify rather than assume: it does
     NOT reduce to one chain here. It fragments into 4 disconnected
     pieces — a 16-node run, an isolated 3-node triangle right around
     SpiritGate (3 nodes so mutually close that each picked the OTHER TWO
     as its own top-2, an outcome no amount of "drop the longest edge"
     trimming un-does, since all 3 of a triangle's edges are needed to
     keep every one of its corners at its already-correct degree 2), one
     completely isolated tower, and a separate 6-node run around
     RiverGate. A real wall cannot be 4 disjoint pieces, so the symmetric-
     top-2-per-node reading of the owner's instruction is abandoned in
     favour of the same nearest-neighbor PRINCIPLE applied as a single
     connected walk instead: starting from one genuine end of the chain
     (live[0] — WNODES is already key-sorted before the site-search filter
     above, so this is the polyline's own first surviving node, a real
     physical end of the wall, not an arbitrary pick), repeatedly extend
     the path to whichever remaining node is closest to the current end.
     This still connects every node to (very nearly always exactly) its 2
     closest actual neighbors — its predecessor and successor on the walk
     — but, unlike the symmetric version, is a single connected chain by
     construction: every step consumes one previously-unvisited node, so
     it can neither fork, nor loop, nor strand anything. */
  var live = WNODES.filter(function(n){ return !n.deleted && !n.skip; });
  live.forEach(function(n,i){
    n._idx = i;
    n.gx = (n.builtX!==undefined) ? n.builtX : n.x;
    n.gz = (n.builtZ!==undefined) ? n.builtZ : n.z;
    n.nbrs = [];
  });
  var edges = [];
  if(live.length){
    var used = live.map(function(){ return false; });
    var order = [live[0]]; used[0] = true;
    for(var step=1; step<live.length; step++){
      var cur = order[order.length-1], best=null, bestD=1e18;
      live.forEach(function(m){
        if(used[m._idx]) return;
        var dd = Math.hypot(m.gx-cur.gx, m.gz-cur.gz);
        if(dd<bestD){ bestD=dd; best=m; }
      });
      used[best._idx] = true; order.push(best);
      edges.push({ a:cur._idx, b:best._idx, len:bestD });
      cur.nbrs.push(best); best.nbrs.push(cur);
    }
  }

  /* diagnostic: confirm this really is one clean connected open chain
     (a greedy nearest-neighbor WALK guarantees it by construction, per the
     comment above, but this checks the actual result rather than trusting
     the construction blindly) — exactly 2 nodes of degree 1 (the wall's
     own two true ends), everything else degree 2, edge count equal to
     node count minus 1, and every node actually reachable from the first. */
  var deg1=0; live.forEach(function(n){ if(n.nbrs.length===1) deg1++; });
  var shapeOK = (deg1===2 || live.length<2) && (edges.length===Math.max(0,live.length-1)) &&
    live.every(function(n){ return n.nbrs.length===1 || n.nbrs.length===2 || live.length<2; });
  var visited = live.map(function(){ return false; });
  var visitedCount = 0;
  if(live.length){
    var stack=[live[0]]; visited[0]=true; visitedCount=1;
    while(stack.length){
      var curv=stack.pop();
      curv.nbrs.forEach(function(nb){ if(!visited[nb._idx]){ visited[nb._idx]=true; visitedCount++; stack.push(nb); } });
    }
  }
  var chainClean = shapeOK && (visitedCount===live.length);

  /* final ry: same atan2(dx,dz) wall-tangent formula for every node, tower
     or gate alike — see 30-layout.js's own comment on why one formula now
     serves both. 2 neighbors -> tangent through them (skips the node's own
     position, same as a mid-chain point always has); 1 neighbor (a true
     end) -> direction straight to it. */
  live.forEach(function(n){
    if(n.nbrs.length>=2) n.ry = Math.atan2(n.nbrs[1].gx-n.nbrs[0].gx, n.nbrs[1].gz-n.nbrs[0].gz);
    else if(n.nbrs.length===1) n.ry = Math.atan2(n.nbrs[0].gx-n.gx, n.nbrs[0].gz-n.gz);
  });

  /* PASS 3 — draw each tower/gate at its final position and FINAL ry (not
     the provisional, pre-graph estimate) — this is what actually keeps a
     model's own orientation flush with the wall it now measurably connects
     to, instead of a value computed before that connection was known.
     Generic gates now take pick(BASALTC) (gcol) instead of the old
     hardcoded 0x8a5947 literal — the owner's "same colour/texture family
     as the towers" request; the 3 named gates already used pick(BASALTC)
     and are untouched. */
  live.forEach(function(n){
    if(n.kind === 'tower'){
      var f = footing(n.gx, n.gz, 9, 9, n.ry);
      /* watchtower() returns {perch:{y,hw,side}} for an INTACT tower (the
         only state that builds a sentry perch — a ruined or destroyed one
         returns nothing), so the perch's real deck height travels with the
         tower record instead of being re-guessed downstream: 78-life.js
         stations its ordinator sentry at exactly this y, 72-lanterns.js
         hangs the tower lantern on the same parapet. */
      var twr = watchtower(n.gx, f.lo, n.gz, n.ry, n.health, pick(BASALTC));
      window._newTowers.push({ x:n.gx, z:n.gz, y:f.lo, ry:n.ry, health:n.health,
                               perch:(twr && twr.perch) || null });
    }else{
      var fg = footing(n.gx, n.gz, 10, 10, n.ry);
      if(fg.hi-fg.lo > 16) fg.lo = fg.hi-16;
      var gcol = pick(BASALTC);
      if(n.name === 'HarborGate') harborGate(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else if(n.name === 'SpiritGate') spiritGate(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else if(n.name === 'RiverGate') riverGate(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else if(n.health === 2) wallGateRuinA(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else (chance(0.5) ? wallGateRuinB : wallGateRuinC)(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      window._newGates.push({ name:n.name||'Gate', x:n.gx, z:n.gz, ry:n.ry, health:n.health });
    }
  });

  /* PASS 4 — the wall body: one straight segment per final graph edge,
     health = floor of the average of its two ACTUAL endpoint healths (the
     owner's own worked rule, recomputed from whichever two nodes the edge
     really connects now — that can differ from the provisional polyline
     pairing if the graph diverged from it). Colour matched to the SAME
     basalt family the towers use (pick(BASALTC), not the old sandstone
     literal) — the owner's "same colour/texture family" request applied
     to the plain wall body too. A destroyed segment (health<=0) draws
     nothing AND is never pushed to WSEGS, so it claims no footprint at
     all — "wall segments have highest priority to stay put... unless
     destroyed, in which case that segment is deleted": every surviving
     WSEGS entry already got its permanent protection pre-emptively, from
     30-layout.js's own early margin reserve() (never evicted for
     segments, only for nodes — see that section's comment), which sits in
     PLACED long before section 19 (BUILT-UP CITY) ever scans a candidate,
     so an ordinary building can never claim a live segment's ground; a
     destroyed segment was excluded from that margin reservation too
     (health check there mirrors this one), so its ground is open. */
  edges.forEach(function(e){
    var A=live[e.a], B=live[e.b];
    var health = Math.floor((A.health+B.health)/2);
    if(health <= 0) return;
    var dx=B.gx-A.gx, dz=B.gz-A.gz, L=Math.hypot(dx,dz);
    if(L < 2) return;
    var ux=dx/L, uz=dz/L;
    var insetA = (A.kind==='gate' ? 18 : 6), insetB = (B.kind==='gate' ? 18 : 6);
    var ax2 = A.gx + ux*Math.min(insetA, L*0.4), az2 = A.gz + uz*Math.min(insetA, L*0.4);
    var bx2 = B.gx - ux*Math.min(insetB, L*0.4), bz2 = B.gz - uz*Math.min(insetB, L*0.4);
    if(Math.hypot(bx2-ax2, bz2-az2) < 4) return;
    wallSegRender(ax2, az2, bx2, bz2, health, pick(BASALTC));
    WSEGS.push({ ax:A.gx, az:A.gz, bx:B.gx, bz:B.gz, health:health, insetA:insetA, insetB:insetB });
  });

  /* GATES: rebuilt here (declared empty in 30-layout.js) now that final
     positions are settled — same shape/order/count every existing
     consumer (68-props.js, 80-camera.js) already expects (one entry per
     WNODES gate, destroyed ones included with their ideal position and
     health 0, exactly as before), just with corrected final x/z/ry for
     every LIVE gate instead of the stale pre-search ideal position the
     original code accidentally left in place there too. */
  WNODES.forEach(function(n){
    if(n.kind !== 'gate') return;
    var gx = (n.gx!==undefined) ? n.gx : n.x, gz = (n.gz!==undefined) ? n.gz : n.z;
    GATES.push({ x:gx, z:gz, s:shoreS(gx,gz), ry:n.ry, name:n.name||null, health:n.health });
  });

  window._newWall = {
    towers: WNODES.filter(function(n){ return n.kind==='tower'; }).length,
    gates: GATES.length,
    namedGates: NAMED_GATES.map(function(g){ return g.name; }),
    genericGates: GENERIC_GATES.length,
    segs: WSEGS.length,
    segHealthCounts: (function(){ var c={0:0,1:0,2:0}; WSEGS.forEach(function(s){ c[s.health]++; }); return c; })(),
    /* tower health census + how many actually built a sentry perch (intact
       only) — the number of tower sentries the life layer posts is exactly
       towerPerches, so this is the one line that proves the two agree. */
    towerHealthCounts: (function(){ var c={0:0,1:0,2:0};
      window._newTowers.forEach(function(t){ c[t.health]++; }); return c; })(),
    towerPerches: window._newTowers.filter(function(t){ return !!t.perch; }).length,
    chainClean: chainClean, endpointCount: deg1, nodesLive: live.length, edgesFinal: edges.length,
    siteDrift: (function(){
      var sum=0, n=0, max=0;
      live.forEach(function(nd){
        if(nd.builtX===undefined) return;
        var dd=Math.hypot(nd.builtX-nd.x, nd.builtZ-nd.z);
        sum+=dd; n++; if(dd>max) max=dd;
      });
      return { mean:(n?sum/n:0), max:max, n:n };
    })()
  };
})();

/* ============================== 19. THE BUILT-UP CITY ============================== */

var BUILT = 0, TJ={cand:0,dist:0,mask:0,wall:0,thin:0,slope:0,clash:0,district:0};
function townBuilding(x,z,inside,wealthy){
  var poor = !inside;
  var fx = poor ? rr(4.5,8.5) : rr(6.5,13.5);
  var fz = fx*rr(0.62,1.40);
  var fs = faceStreet(x,z,fx,fz);
  var ry = fs.ry + rr(-0.22,0.22);
  /* door-to-street relocation, wealthier districts only (core/estate — the
     caller marks wealthy=true only for those): slide the building forward
     along its own facing direction so the door-side face ends up right at
     its frontage (street or, per the owner, a market/park edge — already
     unified in fs.dist) instead of wherever the grid-scan jitter happened
     to land it. Tried at the shifted spot FIRST, before either footing()
     or claim() ever runs at the original spot, so there's only ever one
     real claim() — if the shift would poke into the street mask (caught
     by openAt()) or clash with a neighbour (caught by claim() itself
     failing), it falls back to the original point exactly as if no shift
     had been attempted, never a partial/undone claim. */
  var ox=x, oz=z;
  if(wealthy && fs.dist > 0){
    var shiftAmt = fs.dist - fx - 1.4;
    if(shiftAmt > 0.3 && shiftAmt < fx*2.5){
      var nx = ox + shiftAmt*Math.cos(ry), nz = oz - shiftAmt*Math.sin(ry);
      if(openAt(nx,nz)){ x = nx; z = nz; }
    }
  }
  var f = footing(x,z,fx,fz,ry);
  if(f.hi-f.lo > (poor?13:11)){ TJ.slope++; return false; }
  var placed = claim(x,z,fx+2.2,fz+2.2,ry,'town');
  if(!placed && (x!==ox || z!==oz)){
    x=ox; z=oz;
    f = footing(x,z,fx,fz,ry);
    if(f.hi-f.lo > (poor?13:11)){ TJ.slope++; return false; }
    placed = claim(x,z,fx+2.2,fz+2.2,ry,'town');
  }
  if(!placed){ TJ.clash++; return false; }
  var col = poor ? pick(TONES_POOR) : pick(TONES);
  var yb = plinth(x,z,fx,fz,ry,col);
  var kind, h;
  if(poor){ kind = chance(0.78) ? 'hovel' : 'hlaalu'; h = rr(4.5,11); }
  else{
    var r2 = rnd();
    kind = r2<0.10 ? 'velothi' : (r2<0.145 ? 'domed' : 'hlaalu');
    h = kind==='velothi' ? rr(20,42) : rr(9,26);
  }
  structure(x, yb, z, fx*2, fz*2, h, ry, kind, col, poor ? {poor:true} : undefined);
  /* facade-relevant facts, for a later detailing pass: the true (unpadded)
     footprint, base, height, kind and colour of the structure() this claim
     stands for */
  placed.fx0 = fx; placed.fz0 = fz; placed.yb = yb; placed.h = h;
  placed.kind = kind; placed.col = col; placed.poor = poor;
  BUILT++;
  return true;
}

reseed(44100);
/* owner: "the easternmost [silt strider] stop will be the nucleus of a
   manor village... relocate nearest 5 manor buildings nearby." Geometry is
   baked into BUCKET at the moment structure()/townBuilding() calls it —
   75-terrain.js's emitBuckets() drains BUCKET into InstancedMeshes long
   before any post-hoc "move this building" would be possible (there is no
   API to edit an already-emitted instance's transform after the fact) — so
   the only real way to relocate a building is to redirect it BEFORE it is
   ever drawn: the first 5 manor-zone scatter candidates that clear every
   check below are diverted to the new station's nucleus (66-striders.js,
   which builds the real station+shrine there) instead of being built here.
   This is the only manor-zone cluster in the whole city (zoneAt()'s own
   comment: "past five o'clock: great semi-rural estates"), so these ARE
   "the nearest manor buildings" to the new eastern stop — there are no
   others anywhere else on the map. */
var STRIDER_MANOR_RELOCATE_N = 0, STRIDER_MANOR_RELOCATE_MAX = 5;
(function(){
  for(var gx3=-CITY_LIM; gx3<CITY_LIM; gx3+=26){
    for(var gz3=-CITY_LIM; gz3<CITY_LIM; gz3+=26){
      var x=gx3+rr(-11,11), z=gz3+rr(-11,11);
      TJ.cand++;
      if(districtAt(x,z)){ TJ.district++; continue; }
      var L=landDist(x,z);
      if(L<26 || terrainH(x,z)<4){ TJ.dist++; continue; }
      if(!openAt(x,z)){ TJ.mask++; continue; }
      var zn = zoneAt(x,z);
      if(zn === 'core'){
        if(wallDepth(x,z) < 22){ TJ.wall++; continue; }
        if(!chance(0.96 - 0.30*smooth(60,660,L))){ TJ.thin++; continue; }
        townBuilding(x,z,true,true);
      }else if(zn === 'estate'){
        if(!chance(0.44 * (1 - smooth(150,380,L)) + 0.14)){ TJ.thin++; continue; }
        townBuilding(x,z,true,true);
      }else if(zn === 'manor'){
        if(!chance(0.09)){ TJ.thin++; continue; }
        if(STRIDER_MANOR_RELOCATE_N < STRIDER_MANOR_RELOCATE_MAX){
          STRIDER_MANOR_RELOCATE_N++; continue;               /* diverted — see block above */
        }
        townBuilding(x,z, chance(0.5));                      /* small velothi dwellings, the odd hovel */
      }else if(zn === 'shorehut'){
        if(!chance(0.62 * (1 - smooth(60,150,L)) + 0.12)){ TJ.thin++; continue; }
        townBuilding(x,z,false);
      }else{ TJ.wall++; }
    }
  }
  for(var gx4=-CITY_LIM; gx4<CITY_LIM; gx4+=19){
    for(var gz4=-CITY_LIM; gz4<CITY_LIM; gz4+=19){
      var x2=gx4+rr(-8,8), z2=gz4+rr(-8,8);
      TJ.cand++;
      if(districtAt(x2,z2)){ TJ.district++; continue; }
      var L2=landDist(x2,z2);
      if(L2<22 || terrainH(x2,z2)<4){ TJ.dist++; continue; }
      if(!openAt(x2,z2)){ TJ.mask++; continue; }
      if(zoneAt(x2,z2) !== 'warren'){ TJ.wall++; continue; }
      /* inside the wall's own arc-length range, fade with depth past the
         wall as before; the river-bank extension has no such arc length, so
         it fades with distance from the river bank it hugs instead */
      var wd2 = wallDepth(x2,z2);
      var out = (wd2 > -900) ? -wd2 : (polyNear(x2,z2,RIVER,RIVER_CUM).d - 80);
      if(!chance(0.96 * (1 - smooth(90,700,out)))) continue;
      townBuilding(x2,z2,false);
    }
  }
})();
/* the 5 diverted manor buildings, rebuilt for real just outside the new
   station/shrine footprint (already reserved in 30-layout.js, well before
   this runs) — same townBuilding() call, same visual vocabulary (small
   velothi dwellings, the odd hovel), just a different (x,z). claim()
   inside townBuilding() keeps them off each other, the station, the
   shrine, and the one farmstead that already sits near this point (see
   the ring-search probe that found it), same as every other overlap check
   in this file. */
reseed(29491);
(function(){
  var nucX = 2949.4, nucZ = 1710.7;   /* Route-1 station 6 (easternmost) — same point 66-striders.js builds on */
  for(var k=0; k<STRIDER_MANOR_RELOCATE_N; k++){
    for(var attempt=0; attempt<12; attempt++){
      var a = rnd()*Math.PI*2, d = rr(48,110);
      var px = nucX+Math.cos(a)*d, pz = nucZ+Math.sin(a)*d;
      if(landDist(px,pz) < 20 || !openAt(px,pz) || districtAt(px,pz)) continue;
      if(townBuilding(px,pz, chance(0.5))) break;
    }
  }
})();
window._buildings = BUILT;
window._striderManorRelocated = STRIDER_MANOR_RELOCATE_N;
window._rejTown = TJ;

/* ============================== 19a. THE GREAT ESTATES ============================== */
reseed(9911);
MANORS.forEach(function(m){
  if(districtAt(m.x,m.z)) return;   /* MANORS[0] lands inside Park D — the park wins */
  var fx = rr(62,84), fz = fx*rr(0.8,1.15);
  if(!claim(m.x,m.z, fx+8, fz+8, m.ry, 'manor')) return;
  compound(m.x, m.z, fx, fz, m.ry);
  /* outbuildings scattered round the walls: barns, a granary, a threshing yard */
  for(var k=0;k<ri(3,5);k++){
    var a = rnd()*Math.PI*2, d = Math.max(fx,fz)*1.35 + rr(20,90);
    var px = m.x+Math.cos(a)*d, pz = m.z+Math.sin(a)*d;
    if(landDist(px,pz) < 30 || !openAt(px,pz)) continue;
    var w = rr(18,30), dd = rr(10,15);
    if(!claim(px,pz, w*0.5+3, dd*0.5+3, a, 'barn')) continue;
    shed(px, plinth(px,pz,w*0.5,dd*0.5,a,0x8b8069), pz, w, dd, rr(6,9), a, pick(TONES_POOR));
  }
  /* the clan's own shrine, on a plinth by the water */
  var sp = shoreIn(m.s + rr(-90,90), rr(40,70));
  if(claim(sp[0],sp[1], 9, 9, 0, 'shrine')){
    var sy = terrainH(sp[0],sp[1]);
    BOX(sp[0], sy-0.5, sp[1], 16, 2.6, 16, 0.3, 0xa89c82);
    FR3(sp[0], sy+2.1, sp[1], 6, rr(12,18), 6, 0.3, 0xb3a68a);
    DOME(sp[0]+5, sy+2.1, sp[1]-5, 2.4, 2.0, 0, pick(DOMEC), 'dome');
  }
});
/* nudges (x,z) directly away from the nearest ring/highway edge until the
   TRUE rotated footprint (half-extents fx,fz at rotation ry, same local
   frame loc()/claim() use) clears it, rather than the circular
   Math.max(fx,fz)*0.75 bound the main compound scatter's own ring check
   above uses as a cheap pre-filter — that circular bound still lets a
   road that meets the rectangle closer to a corner than a face through
   (see that check's own comment), so this does the exact rotated-rect-
   to-point gap instead and only moves what's actually still short.
   Shared with the main scatter loop above; also used here because that
   loop's own ring/highway awareness never covered these two hand-seeded
   arrays — their claim() calls only ever check other PLACED footprints,
   never ROADS. Pure translation, no new rnd() draws, so the seed
   sequence below (the satellite Velothi houses) is untouched.

   Iterates (cheaply — nearestStreet is a spatial-hash lookup, not a full
   scan) rather than pushing once: nearestStreet(x,z) finds the point
   nearest the rectangle's CENTRE, which for a large rectangle is not
   always the point that minimises the true rotated-rect gap, especially
   once the first push has moved the centre. One compound (found only
   after the main-loop fix above, by re-checking every built compound's
   true gap rather than trusting the mesh-AABB cross-check that had
   cleared it) still landed with a 2.85 gap against a 6.5 half-width
   after a single push; re-deriving the nearest point from the NEW
   position each pass converges it in 2 iterations. Bails out after 4 —
   if it hasn't converged by then something else is wrong and pushing
   further blind is worse than stopping. */
function nudgeClearOfRoad(x, z, fx, fz, ry){
  var c = Math.cos(ry), s = Math.sin(ry);
  for(var iter=0; iter<4; iter++){
    var near = nearestStreet(x, z, {ring:true, highway:true});
    if(!near) break;
    var px = near.point[0], pz = near.point[1];
    var dx = px-x, dz = pz-z;
    var lx = dx*c - dz*s, lz = dx*s + dz*c;         /* point in the footprint's local frame */
    var gdx = Math.max(Math.abs(lx)-fx, 0), gdz = Math.max(Math.abs(lz)-fz, 0);
    var gap = Math.hypot(gdx, gdz);                 /* true distance from rect boundary to the point (0 = inside) */
    var need = near.width*0.5 + 2 - gap;
    if(need <= 0) break;
    var pdx = x-px, pdz = z-pz, pl = Math.hypot(pdx,pdz) || 1;
    x += pdx/pl*need; z += pdz/pl*need;
  }
  return [x, z];
}

/* ============================== 19a2. LESSER CLAN COMPOUNDS (south-west) === */
reseed(9913);
SWCOMPOUNDS.forEach(function(sc){
  var fx = rr(38,54), fz = fx*rr(0.78,1.18);
  var cp = nudgeClearOfRoad(sc.x, sc.z, fx, fz, sc.ry), cx = cp[0], cz = cp[1];
  if(!claim(cx,cz, fx+8, fz+8, sc.ry, 'compound')) return;
  compound(cx, cz, fx, fz, sc.ry);
  /* a few smaller Velothi houses round it, then farmland takes over */
  var nb = ri(3,5);
  for(var k=0;k<nb;k++){
    var a = rnd()*Math.PI*2, d = Math.max(fx,fz)*1.30 + rr(30,110);
    var px = cx+Math.cos(a)*d, pz = cz+Math.sin(a)*d;
    if(landDist(px,pz) < 30 || !openAt(px,pz)) continue;
    var w = rr(9,15), dd = w*rr(0.7,1.1);
    if(!claim(px,pz, w*0.5+2.5, dd*0.5+2.5, a, 'velothi-out')) continue;
    var col3 = pick(TONES);
    structure(px, plinth(px,pz,w*0.5,dd*0.5,a,col3), pz, w, dd, rr(16,30), a, 'velothi', col3);
  }
});

reseed(9914);
SECOMPOUNDS.forEach(function(sc){
  var fx = rr(40,58), fz = fx*rr(0.78,1.18);
  var cp = nudgeClearOfRoad(sc.x, sc.z, fx, fz, sc.ry), cx = cp[0], cz = cp[1];
  if(!claim(cx,cz, fx+8, fz+8, sc.ry, 'compound')) return;
  compound(cx, cz, fx, fz, sc.ry);
  var nb = ri(3,5);
  for(var k=0;k<nb;k++){
    var a = rnd()*Math.PI*2, d = Math.max(fx,fz)*1.30 + rr(30,110);
    var px = cx+Math.cos(a)*d, pz = cz+Math.sin(a)*d;
    if(landDist(px,pz) < 30 || !openAt(px,pz)) continue;
    var w = rr(9,15), dd = w*rr(0.7,1.1);
    if(!claim(px,pz, w*0.5+2.5, dd*0.5+2.5, a, 'velothi-out')) continue;
    var col5 = pick(TONES);
    structure(px, plinth(px,pz,w*0.5,dd*0.5,a,col5), pz, w, dd, rr(16,30), a, 'velothi', col5);
  }
});

/* wayside shrines through the estates and orchards */
reseed(9912);
(function(){
  for(var i=0;i<14;i++){
    var s = rr(S_10+100, S_5-100), p = shoreIn(s, rr(60, 300));
    if(districtAt(p[0],p[1])) continue;
    if(!openAt(p[0],p[1]) || !claim(p[0],p[1], 6, 6, 0, 'shrine')) continue;
    var sy = terrainH(p[0],p[1]);
    BOX(p[0], sy-0.4, p[1], 8, 1.6, 8, rnd()*3, 0x9d9278);
    FR3(p[0], sy+1.2, p[1], 3.4, rr(6,11), 3.4, rnd()*3, 0xb3a68a);
  }
})();

/* ============================== 19b. FARMSTEADS ============================== */
reseed(7171);
FARMS.forEach(function(f){
  var fx = rr(16,26), fz = fx*rr(0.8,1.2);
  if(!claim(f.x,f.z, fx+4, fz+4, f.ry, 'farm')) return;
  var col = pick(TONES_POOR);
  var yb = plinth(f.x,f.z,fx,fz,f.ry,col) + 0.2;
  var wh = rr(5,8), wt = 1.8;
  [[-(fx-wt/2),0,wt,fz*2],[fx-wt/2,0,wt,fz*2],[0,-(fz-wt/2),fx*2,wt],[0,fz-wt/2,fx*1.2,wt]].forEach(function(w){
    var o = loc(f.x,f.z, w[0], w[1], f.ry);
    BOX(o[0], yb, o[1], w[2], wh, w[3], f.ry, shade(col,-0.05));
  });
  var h1 = loc(f.x,f.z, -fx*0.35, -fz*0.3, f.ry), h2 = loc(f.x,f.z, fx*0.4, fz*0.35, f.ry);
  structure(h1[0], yb, h1[1], fx*0.9, fz*0.7, rr(8,13), f.ry, 'hlaalu', col, {poor:true});
  shed(h2[0], yb, h2[1], fx*0.8, fz*0.55, rr(6,9), f.ry+Math.PI/2, shade(col,-0.08));
  /* low earth banks round each field. Was one terrainH() sample at the
     field's own centre, reused for all 4 edge banks — fine on flat ground,
     but on a slope (owner: "farm boundaries need z adjustment when they're
     on a hillside like by the river") the far edge of anything but a tiny
     field sits at a real different height than the centre, so the far
     bank either floats above the ground or buries itself in it. Each bank
     now samples terrainH() at its OWN position instead of inheriting the
     centre's.

     Owner: "farms in this region overlap more often than not... the farm
     plot does not have a tag in the inspector dev tool so may be hiding
     in old legacy system somewhere" — exactly right: FARMS' own field
     list (30-layout.js) is generated with NO overlap check at all,
     neither against a neighbouring farmstead's fields nor even against
     its OWN other 1-3 fields (random angle+distance from the farmstead,
     nothing more) — claim() couldn't run there anyway (that fragment
     loads before 60-land.js, where claim()/PLACED actually exist; a var
     from a later fragment read from an earlier one's own top-level code
     is the same hoisting trap this session has hit before). This is the
     first point in load order fields CAN be claim()-checked — filtered
     here, tagged 'farm' same as the farmstead building itself just
     above, so the inspector now finds it. A field that loses the claim
     (overlapping a neighbour's field, a neighbour's farmstead, or its
     own farmstead's earlier-claimed field) is dropped rather than drawn
     — real fields it wins are unaffected, so most farms look identical;
     the region the owner flagged was simply unlucky with collisions. */
  var liveFields = [];
  f.fields.forEach(function(q){
    if(!claim(q.x, q.z, q.w*0.5, q.h*0.5, q.ry, 'field')) return;
    liveFields.push(q);
  });
  f.fields = liveFields;
  liveFields.forEach(function(q){
    [[0,q.h/2],[0,-q.h/2]].forEach(function(e){
      var o=loc(q.x,q.z,e[0],e[1],q.ry);
      BOX(o[0], terrainH(o[0],o[1])-0.4, o[1], q.w, 1.3, 1.4, q.ry, 0x7a6d55, 'plaster');
    });
    [[q.w/2,0],[-q.w/2,0]].forEach(function(e){
      var o=loc(q.x,q.z,e[0],e[1],q.ry);
      BOX(o[0], terrainH(o[0],o[1])-0.4, o[1], 1.4, 1.3, q.h, q.ry, 0x7a6d55, 'plaster');
    });
  });
});
window._farms = FARMS.length;
window._farmFields = FARMS.reduce(function(s,f){ return s+f.fields.length; }, 0);

/* ============================== 19c. THE RIVER ============================== */
reseed(3131);
RBRIDGES.forEach(function(b){
  /* deck floor bumped 8.5->11.5 (plus the span's own +6 mid-arch already on
     top of that) per the owner's "a tad more height for barge and wading
     elephant bug passage" — a barge's tallest point (cabin roof) sits
     ~5 units above the waterline, so this keeps a real margin rather than
     the ~3.5 units the old minimum left. */
  var ya = terrainH(b.ax,b.az)+2.2, yb2 = terrainH(b.bx,b.bz)+2.2, deck = Math.max(ya,yb2,11.5);
  var ry = Math.atan2(b.bx-b.ax, b.bz-b.az);
  [[b.ax,b.az,ya],[b.bx,b.bz,yb2]].forEach(function(e){
    FR8(e[0], e[2]-3, e[1], b.w*1.9, deck-e[2]+3.2, b.w*1.6, ry, 0x9a8f76);
    FR3(e[0], deck+0.2, e[1], 3.2, 7, 3.2, ry, 0xa89d84);
  });
  span(b.ax,b.az,deck, b.bx,b.bz,deck, b.w, 0xa89d84, 6, true);
});
/* river docklands: short quays on the north bank, sheds behind, barges alongside */
RPIERS.forEach(function(p){
  var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz), rp=Math.atan2(dx,dz);
  var n=Math.max(2,Math.round(L/12));
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n, x=p.x0+dx*t, z=p.z0+dz*t;
    BOX(x, 2.6, z, p.w, 1.5, L/n*1.08, rp, 0x85735a, 'wood');
    [-1,1].forEach(function(s){ var o=loc(x,z, s*(p.w*0.5-1), 0, rp); var bd=Math.min(-1,terrainH(o[0],o[1]));
      CYL(o[0], bd, o[1], 0.9, 2.6-bd, 0, 0x6b5942, 'wood'); });
  }
  /* nudged clear of a ring/highway corridor the same way the compound loops
     above are — RPIERS itself is read-only layout, but the shed built at
     its base point is not; a citywide audit found one of these four
     sitting 1.85 units into a ring road nearby. */
  var rshedP = nudgeClearOfRoad(p.bx, p.bz, 15, 10, p.ry);
  var yb3 = terrainH(rshedP[0],rshedP[1]);
  if(claim(rshedP[0],rshedP[1], 15, 10, p.ry, 'rshed')) shed(rshedP[0], yb3, rshedP[1], 24, 13, rr(7,10), p.ry, pick(TONES_POOR));
});
BARGES.forEach(function(g){
  var col = 0x5e4d3a;
  BOX(g.x, -1.6, g.z, g.beam, 3.4, g.len, g.ry, col, 'wood');
  BOX(g.x, 1.8, g.z, g.beam*0.9, 0.6, g.len*0.96, g.ry, shade(col,-0.2), 'wood');
  var c = loc(g.x,g.z, 0, -g.len*0.28, g.ry);
  BOX(c[0], 2.4, c[1], g.beam*0.7, 2.6, g.len*0.26, g.ry, shade(col,0.08), 'wood');
  for(var k=0;k<3;k++){ var q=loc(g.x,g.z, rr(-1,1), g.len*(0.05+k*0.12), g.ry);
    BOX(q[0], 2.4, q[1], rr(2,3), rr(1.5,2.4), rr(2,3), g.ry+rr(-0.3,0.3), pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood'); }
});

/* ============================== 20. ISLETS ============================== */

reseed(8080);
ISLES.forEach(function(I){
  var x=I[0], z=I[1], y=terrainH(x,z);
  if(I[4]==='step') return;
  if(I[4]==='rock'){
    for(var k=0;k<4;k++){
      var a=rnd()*6.28, r2=rr(0,I[3]*0.5);
      FR6(x+Math.cos(a)*r2, y-3, z+Math.sin(a)*r2, rr(7,15), rr(6,16), rr(7,15), rnd()*3, 0x7a7162);
    }
    return;
  }
  var col=0xb4a88e;
  BOX(x, y-1.4, z, I[3]*0.86, 3.2, I[3]*0.86, rr(0,1.2), shade(col,-0.16));
  if(I[4]==='light'){
    FR6(x, y+1.8, z, 20, 42, 20, 0, col);
    CYL(x, y+43.8, z, 5.4, 7, 0, shade(col,0.06));
    DOME(x, y+50.8, z, 5.0, 4.4, 0, 0xd8caa0, 'dome');
    CONE(x, y+55.2, z, 1.6, 5, 0, 0x6c5e4a);
  }else{
    BOX(x, y+1.8, z, I[3]*0.52, 5, I[3]*0.52, 0.4, col);
    DOME(x, y+6.8, z, I[3]*0.24, I[3]*0.20, 0, pick(DOMEC), 'dome');
    for(var s=0;s<4;s++){
      var sa=Math.PI/4+s*Math.PI/2;
      FR3(x+Math.cos(sa)*I[3]*0.36, y+1.8, z+Math.sin(sa)*I[3]*0.36, 3.4, rr(11,17), 3.4, sa, col);
    }
  }
});

