/* ============================== ferry stop piers ============================
   Moved here (unmodified) from src/78-life.js — see that file's own note
   at the top of its "water taxis / ferries" section for why: these calls
   are real static BOX/CYL pier geometry, and 78-life.js's contract says
   it must never touch BUCKET/emitBuckets(), but more concretely, that
   file runs at file order 78 — AFTER 75-terrain.js's `emitBuckets()` has
   already drained BUCKET into InstancedMeshes — so any BOX/CYL called
   from there is silently a no-op. This file (65) runs before 75, with
   CIDX/CPIERS/RPIERS/CAUSEWAYS/ISLES already populated by 30-layout.js,
   so it is the right place for this to actually emit geometry.
   78-life.js reads the LIFE_BAY_CENTER/LIFE_FERRY_STOPS/LIFE_SHRINE_STOPS/
   LIFE_SHRINE_ROUTE globals this block leaves behind, same as it already
   reads CPIERS/CIDX themselves. */
var LIFE_BAY_CENTER = {
  x: (CIDX['Palace'].x + CIDX['Temple'].x + CIDX['Ancestry'].x) / 3,
  z: (CIDX['Palace'].z + CIDX['Temple'].z + CIDX['Ancestry'].z) / 3
};
/* the true distance from a square canton's own centre to its cap's edge
   along a bearing — same real-bug fix as CPIERS' own (30-layout.js) and
   the canoes' lifeCantonApproach (78-life.js) above: a flat radius only
   clears a face, not a corner. */
function lifeCantonEdge(c, dirX, dirZ){
  var capHw = c.r*1.07;
  var ang = Math.atan2(dirZ, dirX);
  var clearR = capHw / Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang)));
  return [c.x + dirX*clearR, c.z + dirZ*clearR];
}
/* every pier this file builds beyond the original layout's own PIERS/
   CPIERS/RPIERS (30-layout.js) — the ferry stops below, plus the Port
   quay decks 78-life.js builds itself. 78-life.js's nav grid only ever
   checked against the 30-layout.js lists, so a ferry rerouting live could
   cut straight through one of these newer decks; it never knew they were
   there. Read by lifeNavBlocked (78-life.js, runs after this file). */
var LIFE_EXTRA_PIERS = [];
/* a small ferry pier: deck + piling pairs, box|wood/cyl|wood (already
   live everywhere), returns the outer tip (where the ferry actually
   docks) and the facing angle back toward the root. */
function lifeBuildFerryPier(rootX, rootZ, dirX, dirZ, len){
  var midX = rootX+dirX*len*0.5, midZ = rootZ+dirZ*len*0.5;
  var ry = Math.atan2(dirX, dirZ);
  BOX(midX, SEA+1.0, midZ, 5.5, 1.1, len*1.05, ry, 0x8a7659, 'wood');
  for(var k=5; k<len; k+=11){
    [-1,1].forEach(function(sg){
      var px = rootX+dirX*k + (-dirZ)*sg*2.9, pz = rootZ+dirZ*k + (dirX)*sg*2.9;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, 0.6, SEA+1.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  var tipX = rootX+dirX*len, tipZ = rootZ+dirZ*len;
  LIFE_EXTRA_PIERS.push({ x0: rootX, z0: rootZ, x1: tipX, z1: tipZ, w: 5.5 });
  return { x: tipX, z: tipZ, ry: Math.atan2(-dirX, -dirZ) };
}

var LIFE_FERRY_STOPS = [];
var LIFE_SHRINE_STOPS = [];
(function(){
  /* the 4 cantons that already have a ferry pier (CPIERS, 30-layout.js) */
  ['Palace','Temple','Ancestry','Arena'].forEach(function(nm){
    var p = CPIERS.filter(function(pp){ return pp.canton === nm; })[0];
    if(p) LIFE_FERRY_STOPS.push({ x:p.x1, z:p.z1, ry:p.ry, name:nm });
  });
  /* a new pier at every OTHER canton, facing the bay's own centre —
     except Port (handled separately below, it has room of its own) and
     Guild (its own exception, handled below too, for siting reasons
     unrelated to what the canton is built as — see that block's own
     comment). 'Fortress'
     was 'Lighthouse' in an earlier session (30-layout.js: `{ n:
     'Lighthouse', ..., fortress:true }` — only the RENDERED building had
     swapped to ordinatorFortress(), the canton itself was never renamed
     until the owner caught it and asked for the real rename + the beacon
     moved to Port) — real gap found the same way the western-market one
     was reported: it simply wasn't in this list, so it never got a stop
     at all, on the circuit or off it. */
  ['Arsenal','Foreign','Granary','Market','Fortress'].forEach(function(nm){
    var c = CIDX[nm]; if(!c) return;
    var dx = LIFE_BAY_CENTER.x-c.x, dz = LIFE_BAY_CENTER.z-c.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    var edge = lifeCantonEdge(c, dx, dz);
    var pier = lifeBuildFerryPier(edge[0], edge[1], dx, dz, 40);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:nm });
  });
  /* Port: the owner: "port canton ferry pier does not stick out into the
     water all the way and is causing some pathing issues" — the 34-unit
     length here was a deliberate guess that Port's own quay ring
     (LIFE_QUAYS, 78-life.js) would cover the rest, but that ring itself
     was later measured (fixing the ships' own dock-in-canton bug) to need
     a full 85 units past the bare canton edge before it's actually clear
     of Port's real structure — 34 just falls well short of open water,
     so a ferry routing to this stop's tip could still be fouled by
     whatever's sitting between there and true clearance. Same 85 used
     there, applied here too rather than a fresh guess. */
  (function(){
    var c = CIDX['Port']; if(!c) return;
    var dx = LIFE_BAY_CENTER.x-c.x, dz = LIFE_BAY_CENTER.z-c.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    var edge = lifeCantonEdge(c, dx, dz);
    var pier = lifeBuildFerryPier(edge[0], edge[1], dx, dz, 85);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Port' });
  })();
  /* Guild exception: a pier by its OWN causeway's mainland landing, near
     Market F, instead of an inward pier on the canton itself — a siting
     choice, unrelated to what the canton is built as (Guild is its own
     four-craft-hall district now, not the garden this comment used to
     call it; see 30-layout.js's CIDX['Guild'].guild). */
  (function(){
    var cw = CAUSEWAYS.filter(function(c){ return c.c.n === 'Guild'; })[0];
    if(!cw) return;
    /* real bug found via screenshot: built at cw.s exactly, this pier
       ran almost perfectly parallel to, and overlapping, the causeway
       itself (both anchored to the same shore point, both oriented off
       the same shoreNorm) — not missing, just visually fused into the
       wider causeway deck and unreadable as its own structure. Offset
       35 units of shore arc-length to the side so it lands near, not on
       top of, the causeway. */
    var pierS = cw.s + 35;
    var landing = shoreIn(pierS, 26), n = shoreNorm(pierS);
    var pier = lifeBuildFerryPier(landing[0]-n[0]*4, landing[1]-n[1]*4, -n[0], -n[1], 36);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Guild-causeway' });
  })();
  /* river docks: reuse an existing RPIERS entry (30-layout.js) outright —
     no new geometry needed, it is already a real dock. */
  (function(){
    var rp = RPIERS[1];
    if(rp) LIFE_FERRY_STOPS.push({ x:rp.x1, z:rp.z1, ry:rp.ry, name:'RiverDocks' });
  })();
  /* the main harbour: a new pier by the mainland customs office (this
     file's own standalone placement just above — see its own comment
     for the exact siting). */
  (function(){
    var cx = 951.58, cz = -939.26;
    var s = shoreS(cx,cz), p = shoreAt(s), n = shoreNorm(s);
    var pier = lifeBuildFerryPier(p[0]-n[0]*4, p[1]-n[1]*4, -n[0], -n[1], 38);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Customs' });
  })();
  /* the promontory point (same shoreS(-545,-317) anchor the camera preset
     and prop placement already use). */
  (function(){
    var s = shoreS(-545,-317), p = shoreAt(s), n = shoreNorm(s);
    var pier = lifeBuildFerryPier(p[0]-n[0]*4, p[1]-n[1]*4, -n[0], -n[1], 38);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Promontory' });
  })();
  /* island shrines — their own small piers, not on the main circular
     route (the dedicated temple<->shrines ferry below uses these). */
  var templeC = CIDX['Temple'];
  ISLES.filter(function(i){ return i[4] === 'shrine'; }).forEach(function(isle, si){
    var sx = isle[0], sz = isle[1], srad = isle[3];
    var dx = sx-templeC.x, dz = sz-templeC.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    /* the owner: the southernmost shrine's (si===0, isle at [60,1800] —
       the only one south of Temple, per its own +z) pier "is on the
       south side, would work better on north side." South-side is what
       the plain "away from Temple" formula below gives every shrine —
       reasonable for the other one (north of Temple, so "away" already
       means further north, the open-water side), wrong for this one
       specifically because its own south side faces open lake while its
       north side faces back toward Temple/the mainland, the direction
       ferries and foot traffic actually arrive from. Flip only this one
       rather than the shared formula, so the other shrine (unreported,
       presumably fine) is untouched. */
    if(si === 0){ dx = -dx; dz = -dz; }
    var rootX = sx+dx*srad*0.9, rootZ = sz+dz*srad*0.9;
    var pier = lifeBuildFerryPier(rootX, rootZ, dx, dz, 22);
    LIFE_SHRINE_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Shrine'+si });
  });
  /* the owner also asked for "a small footbridge on the south side to
     the mainland" for that same southernmost shrine — measured first,
     not guessed: the island's own true south edge (its centre + its own
     radius, straight +z) sits only ~10 units from the nearest shore
     point (shoreS/shoreAt), an easy hand-built footbridge, unlike the
     OTHER shrine's south side (~364 units of open water — nowhere near
     "small", not attempted). Narrower than lifeBuildFerryPier's own
     5.5-unit ferry deck (3.0) since this is foot traffic only. */
  (function(){
    var isle0 = ISLES.filter(function(i){ return i[4] === 'shrine'; })[0];
    if(!isle0) return;
    var sx = isle0[0], sz = isle0[1], srad = isle0[3];
    var southX = sx, southZ = sz+srad;
    var s = shoreS(southX, southZ);
    var shorePt = shoreAt(s);
    var ddx = shorePt[0]-southX, ddz = shorePt[1]-southZ, dd = Math.hypot(ddx,ddz) || 1;
    ddx/=dd; ddz/=dd;
    var len = dd + 4;   /* a few units past the shoreline, onto solid ground */
    var bry = Math.atan2(ddx, ddz);
    var midX = southX+ddx*len*0.5, midZ = southZ+ddz*len*0.5;
    BOX(midX, SEA+0.9, midZ, 3.0, 0.7, len*1.03, bry, 0x8a7659, 'wood');
    for(var k=4; k<len; k+=8){
      [-1,1].forEach(function(sg){
        var px = southX+ddx*k + (-ddz)*sg*1.5, pz = southZ+ddz*k + (ddx)*sg*1.5;
        var bh = bedAt(px,pz);
        CYL(px, bh, pz, 0.35, SEA+1.1-bh, 0, 0x6b5942, 'wood');
      });
    }
  })();
})();
/* order the main circle by angle round the bay centre — a pragmatic
   stand-in for real water-channel routing (same honest caveat as the
   canoes' own heuristic in 78-life.js): geographically reasonable
   without needing to model the actual channels between every stop. */
LIFE_FERRY_STOPS.forEach(function(s){ s.angle = Math.atan2(s.z-LIFE_BAY_CENTER.z, s.x-LIFE_BAY_CENTER.x); });
LIFE_FERRY_STOPS.sort(function(a,b){ return a.angle-b.angle; });
/* the shrine circuit: Temple plus its 4 shrines, ordered by angle round
   Temple itself (there's no separate "centre" for a 5-stop circuit). */
var LIFE_SHRINE_ROUTE = [{ x: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].x1,
                            z: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].z1,
                            ry: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].ry, name:'Temple' }]
  .concat(LIFE_SHRINE_STOPS);
(function(){
  var hubX = LIFE_SHRINE_ROUTE[0].x, hubZ = LIFE_SHRINE_ROUTE[0].z;
  LIFE_SHRINE_ROUTE.forEach(function(s){ s.angle = Math.atan2(s.z-hubZ, s.x-hubX); });
  var head = LIFE_SHRINE_ROUTE[0];
  var rest = LIFE_SHRINE_ROUTE.slice(1).sort(function(a,b){ return a.angle-b.angle; });
  LIFE_SHRINE_ROUTE = [head].concat(rest);
})();

/* ============================== fisherman's docks (new) ======================
   Owner's ask: dedicated small piers for fishing dhows in 4 hand-marked cove
   polygons, packed with "as many docks as will fit" via claim() (30-layout.js) —
   real collision, not a guessed count — and sized "intermediate" between the
   harbour's own long finger piers (60-land.js PIERS: deck w 11-17 i.e. ~14, deck
   h 1.7, piling r 1.05) and the small ferry-stop piers just above
   (lifeBuildFerryPier: deck w 5.5, deck h 1.1, piling r 0.6). Width/height/piling
   radius below are the true numeric midpoint of those two pairs. LENGTH is NOT
   interpolated the same way — every existing pier constructor in this codebase
   already varies its length by what its own site can hold (ferry piers alone
   span 22-85 depending on call site), and these 4 cove polygons cap out around
   130-160 units deep from the shore chord to the polygon's far edge, nowhere
   near a harbour pier's 120-215 — so length lands near the top of the ferry
   piers' own range instead, the same site-driven choice this file always makes.

   Shore attachment, checked live against window._api.shoreS/terrainH, not
   assumed: 3 of the 4 polygons have their first two vertices sitting within
   ~30 units of the real procedural shoreline (15-shore.js) and in that exact
   order, so that first edge is the shore chord every pier in the zone roots
   along, normal-out toward the polygon's own centroid.

   The 4th polygon ([985.7,-1424.4]…, 'ShoalBank') has no shore chord, and an
   earlier pass here left its 3 piers standing in open water as a freestanding
   pile platform, on a measurement ("400-530 units from any real shore on every
   vertex") that turns out to be an artifact of the tool used, not the terrain:
   landDist()/shoreS() answer against the MAIN traced shoreline only, and both
   nearer things in this bay are invisible to them — terrainH() puts real land
   (the ISLES 'rock' islet at 760,-1620, r 52) 110-260 units off the polygon,
   and the Port canton is nearer still. Cantons are platforms standing over
   open water, so terrainH under one reads as sea floor and landDist can't see
   one at all; measured against the canton's own cap square instead
   (c.r*1.07, the same constant lifeCantonEdge uses), Port's south cap edge is
   just 29.7 units from this polygon's own [1033.7,-1476.5] corner, and the
   polygon's whole east lobe sits directly under that edge. So the honest
   answer for this zone is not a freestanding platform and not a 200-unit
   causeway to a bare rock: it is a jetty off the Port canton — the harbour
   canton, ~30 units away — with the piers hanging off that, which is what
   buildFishDockJetty() below builds. Water here is a flat 16-18 deep, so the
   trestle's own pilings are ordinary; the Port canton already runs 95-unit
   quay decks over the same depth on its other three faces (78-life.js,
   LIFE_QUAYS), which is the precedent this follows. */
var LIFE_FISHDOCK_W = 9.5;        /* deck full width — mid(11-17 harbour, 5.5 ferry) */
var LIFE_FISHDOCK_H = 1.4;        /* deck thickness  — mid(1.7 harbour, 1.1 ferry) */
var LIFE_FISHDOCK_PILE_R = 0.8;   /* piling radius   — mid(1.05 harbour, 0.6 ferry) */
var LIFE_FISHDOCK_LEN = 38;       /* into the water  — capped by these small coves, see note above */
/* how wide a berthed dhow's own footprint is, measured off the pier's
   centreline: 78-life.js moors each boat at pier.w*0.5 + BEAM*0.5 + 1.2 to one
   side, and the hull is BEAM wide, so its outboard edge sits
   LIFE_FISHDOCK_W*0.5 + BEAM + 1.2 = 4.75 + 4.05 + 1.2 = 10.0 out. Written as
   a literal rather than read from LIFE_DHOW_BEAM because that constant is
   declared later in this same BUILD() scope (78-life.js) — hoisted, so the
   name exists here, but still undefined when this file runs. 78-life.js's own
   dhow section carries the matching note; if the hull is rescaled again, both
   move together. */
var LIFE_FISHDOCK_MOOR_HALF = LIFE_FISHDOCK_W*0.5 + 4.05 + 1.2;
/* is the water at this point on a pier's axis good enough to berth against —
   not just under the deck's own centreline, but across the whole band the
   three moored dhows occupy, and 2 units aft of it (a slot-0 hull's sternmost
   point lands 0.25*38 - 0.51*16.2 = +1.2 SEAWARD of the datum, so 2 units of
   aft margin covers it with slack). This is the test the "13 of 45 mooring
   slots sit over beach" defect actually needed: a chord marked inland has its
   centreline sample go wet several units before a laterally-offset stern
   does, because these shorelines run oblique to the marked chords. */
function fishDockBerthWet(x, z, nx, nz){
  var px = -nz, pz = nx, a, L;
  for(a = -2; a <= 0.001; a += 2){
    for(L = -LIFE_FISHDOCK_MOOR_HALF; L <= LIFE_FISHDOCK_MOOR_HALF+0.001; L += LIFE_FISHDOCK_MOOR_HALF*0.5){
      if(terrainH(x + nx*a + px*L, z + nz*a + pz*L) > SEA) return false;
    }
  }
  return true;
}
var LIFE_FISH_PIERS = [];
function buildFishDockPier(rootX, rootZ, dirX, dirZ, len){
  var midX = rootX+dirX*len*0.5, midZ = rootZ+dirZ*len*0.5;
  var ry = Math.atan2(dirX, dirZ);
  /* real claim() collision, same shared machinery (30-layout.js) every other
     footprint in the city is packed against — this is what actually limits
     how many piers a zone gets, not a hand-picked count. */
  var rec = claim(midX, midZ, LIFE_FISHDOCK_W*0.5+1.2, len*0.5+1.2, ry, 'fishdock');
  if(!rec) return null;
  BOX(midX, SEA+LIFE_FISHDOCK_H*0.7, midZ, LIFE_FISHDOCK_W, LIFE_FISHDOCK_H, len*1.05, ry, 0x8a7659, 'wood');
  for(var k=5; k<len; k+=10){
    [-1,1].forEach(function(sg){
      var px = rootX+dirX*k + (-dirZ)*sg*(LIFE_FISHDOCK_W*0.5-1.1), pz = rootZ+dirZ*k + (dirX)*sg*(LIFE_FISHDOCK_W*0.5-1.1);
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, LIFE_FISHDOCK_PILE_R, SEA+LIFE_FISHDOCK_H+0.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  var tipX = rootX+dirX*len, tipZ = rootZ+dirZ*len;
  /* registered in LIFE_EXTRA_PIERS too, same as every other pier this file
     builds beyond 30-layout.js's own PIERS/CPIERS/RPIERS — so ferries/ships/
     the pleasure barge (lifeNavBlocked/lifePierOrBridgeBlocked) and the
     fishing dhows themselves (78-life.js) all route around these decks. */
  LIFE_EXTRA_PIERS.push({ x0:rootX, z0:rootZ, x1:tipX, z1:tipZ, w:LIFE_FISHDOCK_W });
  /* `len` is the pier's REAL length: it is no longer always LIFE_FISHDOCK_LEN
     (a shore pier grows landward to reach dry ground, see buildFishDockZone),
     and 78-life.js measures each dhow's mooring slot along it. */
  return { x0:rootX, z0:rootZ, x1:tipX, z1:tipZ, w:LIFE_FISHDOCK_W, len:len,
           dirX:dirX, dirZ:dirZ, tipX:tipX, tipZ:tipZ };
}
/* one dock zone: roots piers along poly[i0]->poly[i1] (the shore chord, or the
   longest edge for the one zone with no real shore), normal-out toward the
   polygon's own centroid, scanning every 4 units and letting claim() reject
   whatever doesn't fit — "as many as will fit", not a fixed count per zone. */
function buildFishDockZone(zoneName, poly, i0, i1){
  var A = poly[i0], B = poly[i1];
  var tx = B[0]-A[0], tz = B[1]-A[1], spineLen = Math.hypot(tx,tz) || 1;
  tx /= spineLen; tz /= spineLen;
  var nx = -tz, nz = tx;
  var cx=0, cz=0;
  poly.forEach(function(p){ cx += p[0]; cz += p[1]; });
  cx /= poly.length; cz /= poly.length;
  var midX = (A[0]+B[0])*0.5, midZ = (A[1]+B[1])*0.5;
  if((cx-midX)*nx + (cz-midZ)*nz < 0){ nx = -nx; nz = -nz; }   /* normal must point INTO the polygon */
  var margin = LIFE_FISHDOCK_W*0.5 + 2, step = 4;
  for(var u = margin; u <= spineLen-margin; u += step){
    var markX = A[0]+tx*u, markZ = A[1]+tz*u;
    /* The owner's chord is hand-marked, so it runs OFF the real waterline in
       both directions, and the two errors need opposite corrections:

       (a) marked OFFSHORE — the original case here: 3 of CoveFortress's piers
           rooted ~10 units short of dry land, a pier beginning in open water.
       (b) marked INLAND — CoveWest's whole chord and CoveEast's first pier.
           Probed live against terrainH, those roots sit 4 to 32 units up the
           beach (CoveWest: 16/24/26/28/32), so the seaward LIFE_FISHDOCK_LEN
           that 78-life.js measures its mooring slots along was partly dry
           ground, and 13 of the 45 dhow slots had a hull footprint over sand.
           The previous pass tried to fix that in 78-life.js by walking each
           SLOT seaward; that failed because these shorelines run oblique to
           the chords (a laterally-offset stern is still on land well after
           the centreline is wet) and it crushed same-flank slot spacing from
           25.1 to 7.1. It is fixed here instead, where a root can move.

       So the pier is sited in two steps rather than one:

       1. THE MOORING DATUM. Walk SEAWARD from the marked point to the first
          place whose whole berth band is genuinely water (fishDockBerthWet:
          the full 10-unit half-width a moored dhow occupies, plus 2 units of
          stern margin — not just the centreline, which goes wet first on an
          oblique shore). A chord already marked offshore is berth-wet at
          step 0 and does not move at all, so case (a) behaves exactly as
          before. Cap 40 units: past that the chord is not a shore chord in
          any useful sense, so the pier stays where it was marked and the
          audit reports its beached slots loudly instead of this growing a
          freak 200-unit pier — the same fail-loud rule the landward walk
          below already follows.
       2. THE DECK. From that datum, walk LANDWARD to the first sample above
          the waterline (cap 24) and lengthen the deck by exactly that much,
          so the deck still physically lands on the beach while the datum —
          which is what 78-life.js measures the mooring slots back from, via
          (pier.len - LIFE_FISHDOCK_LEN) — stays on the waterline. That is
          why the slot layout [0.25,0.58,0.91]/[1,-1,1] survives this change
          untouched: every slot is positioned relative to the datum, and the
          datum is now the waterline in all four zones instead of in two. */
    var out = 0;
    while(out < 40 && !fishDockBerthWet(markX + nx*out, markZ + nz*out, nx, nz)) out += 2;
    if(out >= 40) out = 0;                                   /* no berthable water within 40: leave it marked, fail loud */
    var rootX = markX + nx*out, rootZ = markZ + nz*out;
    var back = 0, len = LIFE_FISHDOCK_LEN;
    while(back < 24 && terrainH(rootX - nx*back, rootZ - nz*back) <= SEA) back += 2;
    if(back > 0 && back < 24){ rootX -= nx*back; rootZ -= nz*back; len += back; }
    var pier = buildFishDockPier(rootX, rootZ, nx, nz, len);
    if(pier){ pier.zone = zoneName; pier.slot = LIFE_FISH_PIERS.length; pier.attach = 'shore';
              pier.seaward = out; pier.onshore = (len - LIFE_FISHDOCK_LEN);   /* diagnostics: how far the two walks moved it */
              LIFE_FISH_PIERS.push(pier); }
  }
}
/* the trestle walkway itself: a narrower deck than a pier (this is the thing
   fishermen WALK, not the thing a dhow ties to), same box|wood + cyl|wood
   combos already live, so zero new draw calls. Deliberately NOT claim()ed —
   claim()'s collision test is circle-vs-circle on each footprint's
   circumscribing radius, so a 115-long deck claims a ~58-unit circle and
   would reject every pier that tries to root ON it, which is the whole point
   of a jetty. That matches what every other water deck in this codebase
   already does: lifeBuildFerryPier and the Port/harbour quays (78-life.js)
   don't claim() either, they only register in LIFE_EXTRA_PIERS so the nav
   layer routes boats around them. */
var LIFE_FISHDOCK_WALK_W = 6.0;
function buildFishDockWalk(ax, az, bx, bz){
  var dx = bx-ax, dz = bz-az, L = Math.hypot(dx,dz) || 1;
  dx /= L; dz /= L;
  var ry = Math.atan2(dx, dz);
  BOX(ax+dx*L*0.5, SEA+LIFE_FISHDOCK_H*0.7, az+dz*L*0.5, LIFE_FISHDOCK_WALK_W, LIFE_FISHDOCK_H, L*1.02, ry, 0x8a7659, 'wood');
  for(var k=4; k<L; k+=11){
    [-1,1].forEach(function(sg){
      var px = ax+dx*k + (-dz)*sg*(LIFE_FISHDOCK_WALK_W*0.5-0.9);
      var pz = az+dz*k + ( dx)*sg*(LIFE_FISHDOCK_WALK_W*0.5-0.9);
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, LIFE_FISHDOCK_PILE_R, SEA+LIFE_FISHDOCK_H+0.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  LIFE_EXTRA_PIERS.push({ x0:ax, z0:az, x1:bx, z1:bz, w:LIFE_FISHDOCK_WALK_W });
  return { x0:ax, z0:az, x1:bx, z1:bz, dirX:dx, dirZ:dz, len:L, w:LIFE_FISHDOCK_WALK_W };
}
/* a zone with no shore chord but a canton within reach: run one trestle from
   that canton's own cap edge out along the polygon's long axis, and hang the
   piers off BOTH sides of it (a jetty has berths either side — and it is what
   lets 3 piers fit in a lobe too small for 3 shore-rooted ones). Same
   claim()-decides-the-count rule as buildFishDockZone; roots sit on the
   walkway's own edge, pointing away, so no pier ever overlaps the deck it
   grows out of. */
function buildFishDockJetty(zoneName, poly, cantonName, spineLen){
  var c = CIDX[cantonName]; if(!c) return;
  var cx=0, cz=0;
  poly.forEach(function(p){ cx += p[0]; cz += p[1]; });
  cx /= poly.length; cz /= poly.length;
  /* anchor: the point on the canton's own cap square nearest the polygon's
     centroid, clamped 10 units in from the corner so the trestle meets a
     face, not a corner point. capHw is lifeCantonEdge()'s own constant. */
  var capHw = c.r*1.07;
  var ax, az;
  if(Math.abs(cx-c.x) > Math.abs(cz-c.z)){
    ax = c.x + (cx<c.x ? -capHw : capHw);
    az = Math.max(c.z-capHw+10, Math.min(c.z+capHw-10, cz));
  }else{
    az = c.z + (cz<c.z ? -capHw : capHw);
    ax = Math.max(c.x-capHw+10, Math.min(c.x+capHw-10, cx));
  }
  var tx = cx-ax, tz = cz-az, tL = Math.hypot(tx,tz) || 1;
  tx /= tL; tz /= tL;
  var bx = ax+tx*spineLen, bz = az+tz*spineLen;
  var walk = buildFishDockWalk(ax, az, bx, bz);
  var nx = -tz, nz = tx;
  var margin = LIFE_FISHDOCK_W*0.5 + 4, step = 4;
  var side = 1;
  for(var u = margin; u <= spineLen-margin; u += step){
    var sx = ax+tx*u, sz = az+tz*u;
    var dirX = nx*side, dirZ = nz*side;
    var rootX = sx + dirX*(LIFE_FISHDOCK_WALK_W*0.5), rootZ = sz + dirZ*(LIFE_FISHDOCK_WALK_W*0.5);
    var pier = buildFishDockPier(rootX, rootZ, dirX, dirZ, LIFE_FISHDOCK_LEN);
    if(pier){
      /* claim() alone is not enough HERE, and the audit caught it: its test
         is circle-vs-circle, and two 38-long piers rooted on OPPOSITE sides
         of the trestle a few units apart along it have centres ~38 apart —
         just inside two 21.5 radii, so claim() passes them, while their
         9.5-wide decks really do overlap back-to-back across the walkway.
         Stepping the spine on by a full deck width after each success is the
         real constraint (opposite-side neighbours end up ~13 units apart
         along the trestle, a ~4-unit gap between deck edges). */
      u += LIFE_FISHDOCK_W + 4 - step;
      pier.zone = zoneName; pier.slot = LIFE_FISH_PIERS.length;
      pier.attach = 'canton:'+cantonName; pier.walk = walk;
      LIFE_FISH_PIERS.push(pier);
      side = -side;   /* next one off the other side, so the jetty berths both flanks */
    }
  }
}
var LIFE_FISH_ZONES = [
  { name:'CoveEast',     poly:[[742.1,-466.2],[720.3,-395.8],[597.5,-431.8],[611.0,-497.2]],           i0:0, i1:1 },
  { name:'CoveFortress', poly:[[2011.9,-1209.6],[2139.5,-1324.8],[2018.2,-1416.3],[1910.6,-1337.3]],   i0:0, i1:1 },
  { name:'CoveWest',     poly:[[-1510.1,-926.5],[-1699.2,-1053.7],[-1627.2,-1177.6],[-1416.1,-1059.3]],i0:0, i1:1 },
  { name:'ShoalBank',    poly:[[985.7,-1424.4],[898.0,-1425.9],[896.1,-1537.3],[999.2,-1526.0],[1029.4,-1519.9],[1033.7,-1476.5],[1001.8,-1462.9]], canton:'Port', spine:112 }
];
LIFE_FISH_ZONES.forEach(function(z){
  if(z.canton) buildFishDockJetty(z.name, z.poly, z.canton, z.spine);
  else buildFishDockZone(z.name, z.poly, z.i0, z.i1);
});
window._fishDocks = { piers: LIFE_FISH_PIERS.length, list: LIFE_FISH_PIERS,
  perZone: LIFE_FISH_ZONES.map(function(z){ return { name:z.name, n: LIFE_FISH_PIERS.filter(function(p){ return p.zone===z.name; }).length }; }) };   /* diagnostic */

/* ---- cart landings: where a MERCHANT CARAVAN actually collects the catch ----
   Owner: "fishing docks ... should be caravan destinations." A cart cannot
   drive onto a pier deck (9.5 wide, over open water, reached by a walkway),
   so the pier itself is the wrong point to hand 78-life.js — exactly the bug
   LIFE_CARAVAN_HARBOR already documents for PIERS (it used to route carts to
   the water-side TIP and they swam). One LANDWARD point per dock instead,
   filled here (where the pier's own root/axis/attachment are known) and
   consumed wholesale by 78-life.js's caravan pools — the same cross-file
   hand-off shape as LIFE_RBARGE_DOCKS/LIFE_STRIDER_STATIONS.

   Two real cases, because this file builds two kinds of fish dock:
   - a SHORE pier roots on the waterline, so the landing walks back up its own
     axis (-dir) in 4-unit steps to the first genuinely dry sample, capped at
     40 — the same walk-the-root-back-to-dry-ground idiom buildFishDockZone
     already uses when it roots the pier in the first place.
   - a JETTY pier (ShoalBank) hangs off a trestle out in 17 units of water;
     there is no landward shore at all, and its only dry end is the Port
     canton the trestle is anchored to. All the piers on one trestle share
     that single anchor, so they register ONE landing between them (deduped
     on the walkway) rather than five copies of the same point, which would
     otherwise make ShoalBank five times likelier to be picked than a cove.
     That landing is NOT the anchor itself: the anchor sits on the canton's
     CAP square (half-width c.r*1.07) but outside its radius c.r, and both
     78-life.js's lifeGroundY and the road graph stop at c.r — measured, a
     cart parked on the anchor reads its height as open water (-15.7) and
     its nearest road node is 293 units off, past that file's own 260-unit
     snap limit, so it would be rejected outright. The landing therefore
     walks in along the trestle's own bearing to the first point genuinely
     INSIDE the canton (0.80*c.r, on the deck by construction) — the quay
     the jetty lands on, which is where a cart would load anyway.
   ry follows LIFE_CARAVAN_HARBOR's own convention (atan2 of the seaward
   direction) so a parked cart faces its pier, not away from it. */
var LIFE_FISH_CART_STOPS = [];
(function(){
  var seenWalk = [];
  LIFE_FISH_PIERS.forEach(function(p){
    var sx, sz;
    if(p.walk){
      if(seenWalk.indexOf(p.walk) >= 0) return;
      seenWalk.push(p.walk);
      var cn = (p.attach||'').indexOf('canton:') === 0 ? CIDX[p.attach.slice(7)] : null;
      if(!cn) return;   /* a trestle with no canton has no landward end at all */
      var dxc = cn.x - p.walk.x0, dzc = cn.z - p.walk.z0, Lc = Math.hypot(dxc,dzc) || 1;
      var inward = Math.max(0, Lc - cn.r*0.80);
      sx = p.walk.x0 + dxc/Lc*inward; sz = p.walk.z0 + dzc/Lc*inward;
      LIFE_FISH_CART_STOPS.push({ x:sx, z:sz, ry: Math.atan2(p.walk.dirX, p.walk.dirZ),
                                  zone:p.zone, attach:p.attach, inward:Math.round(inward) });
      return;
    }
    var back = 0;
    while(back < 40 && terrainH(p.x0 - p.dirX*back, p.z0 - p.dirZ*back) <= SEA+2.5) back += 4;
    sx = p.x0 - p.dirX*back; sz = p.z0 - p.dirZ*back;
    /* no dry ground within 40 units behind the root: register nothing rather
       than hand 78-life.js a point in the water (claim()-style reject) */
    if(terrainH(sx,sz) <= SEA+2.5) return;
    LIFE_FISH_CART_STOPS.push({ x:sx, z:sz, ry: Math.atan2(p.dirX, p.dirZ),
                                zone:p.zone, attach:p.attach, setback:back });
  });
})();
window._fishCartStops = LIFE_FISH_CART_STOPS;   /* diagnostic */

/* live audit, the owner's own two questions ("attached to shore or nearby
   canton" / "not overlapping anything") asked of the built world rather than
   of the source: a closure so it can read the things that never escape
   BUILD()'s scope (PLACED, chinHit, LIFE_EXTRA_PIERS, CANTON_TOPS, CAUSEWAYS).
   Debug-only, called from a headless probe — nothing in the build calls it,
   it allocates nothing at build time and costs no draw calls. Every fix in
   this section was driven by its output, so it stays here as the check that
   can be re-run after any later edit moves a shoreline or a canton. */
/* signed distance to the nearest canton BASE platform square (<0 = on it).
   The half-width here is c.r*1.07 — the plinth cap, the same constant
   lifeCantonEdge() uses and the one every pier in this file already roots
   against. Deliberately NOT CANTON_TOPS[n].hw: that records the TOPMOST
   TIER's half-width (50-cantons.js writes it at the end of the tier loop),
   which for Port is ~66 against a base cap of 147.7 — using it made this
   audit read a jetty rooted exactly on the canton's own edge as "82 units
   off the canton", a measurement bug in the check, not in the dock. */
function fishDockCantonEdge(x, z){
  var bn=null, bd=1e9;
  for(var i=0;i<CANTONS.length;i++){
    var c = CANTONS[i];
    var hw = c.r*1.07;
    var dx = Math.abs(x-c.x)-hw, dz = Math.abs(z-c.z)-hw;
    var d = (dx>0 || dz>0) ? Math.hypot(Math.max(dx,0), Math.max(dz,0)) : Math.max(dx,dz);
    if(d < bd){ bd = d; bn = c.n; }
  }
  return { canton:bn, d:bd };
}
window._fishDocks.audit = function(){
  function segD(px,pz,ax,az,bx,bz){
    var dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz;
    var t = L ? ((px-ax)*dx+(pz-az)*dz)/L : 0; t = Math.max(0,Math.min(1,t));
    return Math.hypot(px-ax-t*dx, pz-az-t*dz);
  }
  function segSegD(a,b,c,d){
    var m = 1e9, i, t, x, z;
    for(i=0;i<=24;i++){ t=i/24; x=a[0]+(b[0]-a[0])*t; z=a[1]+(b[1]-a[1])*t; m=Math.min(m, segD(x,z,c[0],c[1],d[0],d[1])); }
    for(i=0;i<=24;i++){ t=i/24; x=c[0]+(d[0]-c[0])*t; z=c[1]+(d[1]-c[1])*t; m=Math.min(m, segD(x,z,a[0],a[1],b[0],b[1])); }
    return m;
  }
  var others = [];
  PIERS.forEach(function(p,i){ others.push({ tag:'PIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||14) }); });
  CPIERS.forEach(function(p,i){ others.push({ tag:'CPIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||8) }); });
  RPIERS.forEach(function(p,i){ others.push({ tag:'RPIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||10) }); });
  LIFE_EXTRA_PIERS.forEach(function(p,i){ others.push({ tag:'EXTRA['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||6) }); });
  return LIFE_FISH_PIERS.map(function(p, idx){
    var r = { i:idx, zone:p.zone, root:[Math.round(p.x0), Math.round(p.z0)], tip:[Math.round(p.tipX), Math.round(p.tipZ)] };
    /* attachment: walk the pier's OWN axis landward from the root */
    var land = null, d;
    for(d=0; d>=-260; d-=2){
      if(terrainH(p.x0+p.dirX*d, p.z0+p.dirZ*d) > SEA){ land = -d; break; }
    }
    r.landBehind = land;
    var ce = fishDockCantonEdge(p.x0, p.z0);
    r.canton = ce.canton; r.cantonD = Math.round(ce.d*10)/10;
    if(p.walk){
      /* a jetty pier: its own axis heads out to open water by design — what
         has to reach land is the WALKWAY it stands on. Measured, not assumed:
         the walkway's landward end against the canton's own cap square. */
      var we = fishDockCantonEdge(p.walk.x0, p.walk.z0);
      r.walkRootCantonD = Math.round(we.d*10)/10;
      r.attach = (we.d <= 2) ? ('jetty->canton:'+we.canton)
               : ('JETTY ROOT '+Math.round(we.d)+' OFF '+we.canton);
    }else{
      r.attach = (land !== null && land <= 8) ? 'shore'
               : (ce.d <= 10) ? ('canton:'+ce.canton)
               : (land !== null && land <= 40) ? ('shore+'+Math.round(land))
               : 'NOT ATTACHED';
    }
    /* overlaps */
    var hits = [];
    others.forEach(function(o){
      if(Math.hypot(o.a[0]-p.x0, o.a[1]-p.z0) < 0.01 && Math.hypot(o.b[0]-p.tipX, o.b[1]-p.tipZ) < 0.01) return;  /* itself */
      /* the walkway this pier deliberately grows out of: a root sitting on the
         trestle's own edge is the attachment, not a collision */
      if(p.walk && Math.hypot(o.a[0]-p.walk.x0, o.a[1]-p.walk.z0) < 0.01 && Math.hypot(o.b[0]-p.walk.x1, o.b[1]-p.walk.z1) < 0.01) return;
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], o.a, o.b);
      if(dd < p.w*0.5 + o.w*0.5) hits.push(o.tag+' '+(Math.round(dd*10)/10));
    });
    LIFE_RBARGE_DOCKS.forEach(function(dk,di){
      var dd = segD(dk.x, dk.z, p.x0,p.z0, p.tipX,p.tipZ);
      if(dd < p.w*0.5 + 14) hits.push('rbargeDock'+di+' '+(Math.round(dd*10)/10));
    });
    PLACED.forEach(function(o){
      if(o.tag === 'fishdock') return;
      var dd = segD(o.x, o.z, p.x0,p.z0, p.tipX,p.tipZ);
      if(dd < o.rad + p.w*0.5) hits.push('PLACED:'+o.tag+' '+(Math.round(dd*10)/10));
    });
    var t2, x2, z2;
    for(t2=0; t2<=1.0001; t2+=0.04){
      x2 = p.x0+(p.tipX-p.x0)*t2; z2 = p.z0+(p.tipZ-p.z0)*t2;
      if(typeof chinHit !== 'undefined' && chinHit(x2,z2, p.w*0.5+2)){ hits.push('chinampa'); break; }
    }
    for(t2=0; t2<=1.0001; t2+=0.04){
      x2 = p.x0+(p.tipX-p.x0)*t2; z2 = p.z0+(p.tipZ-p.z0)*t2;
      if(inRiver(x2,z2, 12)){ hits.push('river-channel'); break; }
    }
    CAUSEWAYS.forEach(function(cw,ci){
      var lp = shoreIn(cw.s, 26);
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], [cw.c.x,cw.c.z], [lp[0],lp[1]]);
      if(dd < p.w*0.5 + CWAY*0.5 + 4) hits.push('causeway'+ci+' '+(Math.round(dd*10)/10));
    });
    SPANS.forEach(function(sp,si){
      var A2 = CANTONS[sp.a], B2 = CANTONS[sp.b];
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], [A2.x,A2.z], [B2.x,B2.z]);
      if(dd < p.w*0.5 + DECK*0.5 + 4) hits.push('span'+si+' '+(Math.round(dd*10)/10));
    });
    r.overlaps = hits;
    /* ---- the mooring slots themselves ----------------------------------
       The thing the shore-mooring pass is actually judged on, checkable
       afterwards instead of taken on trust: for each dhow berthed on this
       pier (78-life.js's LIFE_FISH_BOATS — a var in this same BUILD() scope,
       so hoisted and populated by the time anything calls this), sample the
       hull's REAL footprint (stern -0.51*LEN to prow tip +0.67*LEN, beam
       full width) against terrainH and report whether any of it is over
       beach. `dry` on a boat means exactly the defect: a hull sitting on
       sand rather than floating. */
    if(typeof LIFE_FISH_BOATS !== 'undefined' && LIFE_FISH_BOATS.length){
      r.moor = [];
      LIFE_FISH_BOATS.forEach(function(b){
        if(b.pier !== p) return;
        var fx = Math.sin(b.home.ry), fz = Math.cos(b.home.ry);
        var sx2 = fz, sz2 = -fx, landN = 0, tot = 0, maxH = -1e9, a, c, hh;
        for(a = -0.51; a <= 0.671; a += 0.1174){
          for(c = -0.5; c <= 0.501; c += 0.25){
            hh = terrainH(b.home.x + fx*a*LIFE_DHOW_LEN + sx2*c*LIFE_DHOW_BEAM,
                          b.home.z + fz*a*LIFE_DHOW_LEN + sz2*c*LIFE_DHOW_BEAM);
            tot++; if(hh > SEA) landN++;
            if(hh > maxH) maxH = hh;
          }
        }
        r.moor.push({ side:b.moorSide, x:Math.round(b.home.x), z:Math.round(b.home.z),
                      land:landN, of:tot, maxH:Math.round(maxH*100)/100, dry:landN>0 });
      });
      r.moorDry = r.moor.filter(function(m){ return m.dry; }).length;
    }
    return r;
  });
};
/* the headline the mooring pass reports: how many of the fleet's berths have
   a hull footprint over beach, and where. Re-runnable after any later pass
   that moves a shoreline, a pier or the hull's own scale. */
window._fishDocks.moorReport = function(){
  var rows = window._fishDocks.audit(), dry = 0, total = 0, perZone = {};
  rows.forEach(function(r){
    (r.moor||[]).forEach(function(m){
      total++;
      perZone[r.zone] = perZone[r.zone] || { slots:0, dry:0 };
      perZone[r.zone].slots++;
      if(m.dry){ dry++; perZone[r.zone].dry++; }
    });
  });
  return { dry:dry, total:total, perZone:perZone,
           beached: rows.filter(function(r){ return r.moorDry; })
                        .map(function(r){ return { pier:r.i, zone:r.zone, dry:r.moorDry,
                                                   worst:Math.max.apply(null, r.moor.map(function(m){ return m.land; })) }; }) };
};

