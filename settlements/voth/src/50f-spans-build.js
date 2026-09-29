/* ============================== 12. SPANS ============================== */

/* a pylon rising out of a canton to carry a bridge deck */
/* `foot` (optional, and passed by nothing but the Palace's own moved landing —
   see palaceLandingShift) overrides where the stair below comes down. The
   default puts it at RADIUS targetHw along the bearing, which is right on a
   cardinal approach and wrong on every other one, because these cantons are
   SQUARES: measured on the live scene, the Palace's Foreign stair ended 24.8
   units inside tier 1's solid flank and its Temple stair 46.0 inside. Rather
   than change that default under Temple, Ancestry, Granary and every plat
   canton at once, the one landing this pass moves hands in the real point on
   the flat face instead. */
function landing(c, ax, az, ry, w, foot){
  var spring = CANTON_TOPS[c.n].spring;
  FR8(ax, spring-3, az, w*1.85, DECK-spring+4, w*2.3, ry, shade(c.tone,0.02));
  BOX(ax, DECK+1.0, az, w*2.05, 2.8, w*2.6, ry, shade(c.tone,-0.18));
  [-1,1].forEach(function(s2){
    var p = loc(ax,az, 0, s2*w*1.15, ry);
    FR3(p[0], DECK+3.8, p[1], w*0.44, w*1.5, w*0.44, ry, shade(c.tone,0.04));
  });
  /* a stair from this landing's own cap platform to the canton's real
     walkable surface. Before this, the pylon was a solid frustum with a
     platform floating at DECK height and nothing whatsoever connecting it
     to anywhere walkable — "no smooth way for a pedestrian to get up
     there", exactly as flagged.
     Which surface: monoCanton()/templeCanton() (multi-tier Palace/Temple)
     record BOTH the true top (y/hw) and entryY/entryHw — tier 1's own
     base/radius, verified against the real tierWeights() numbers to be
     where DECK (54) actually lands (Palace: tier 1 starts at y=53.11,
     0.9 off DECK; checked by hand against CANTON_TOPS.y, not guessed).
     That's the level a bridge-borne pedestrian steps onto, not the
     summit — three earlier passes put the door at the top before this
     one actually checked the numbers. platCanton() cantons (Market,
     Arena, Port, ...) never set entryY/entryHw — they're single-deck, the
     ordinary top IS the entrance, so this falls back to y/hw for them. */
  var top = CANTON_TOPS[c.n];
  /* bridgeY/bridgeHw (ancestryCanton() only) is the stair's own preferred
     target, when it differs from the ground-height entryY/entryHw other
     readers (lifeGroundY, cantonEdgeY) rely on — see the comment by that
     assignment for why the two must not be the same field. */
  var targetY = (top.bridgeY !== undefined) ? top.bridgeY : (top.entryY !== undefined) ? top.entryY : top.y;
  var targetHw = (top.bridgeHw !== undefined) ? top.bridgeHw : (top.entryHw !== undefined) ? top.entryHw : top.hw;
  var toPx = ax-c.x, toPz = az-c.z, toPL = Math.hypot(toPx,toPz) || 1;
  var ex = c.x + toPx/toPL*targetHw, ez = c.z + toPz/toPL*targetHw;
  if(foot){ ex = foot[0]; ez = foot[1]; }
  linkStair(ax, az, DECK+2.4, ex, ez, targetY, w*0.85);
  window._landingStairs = window._landingStairs || [];
  window._landingStairs.push({canton:c.n, ax:ax,az:az,ay:DECK+2.4, ex:ex,ez:ez,ey:targetY});

  /* the owner's bridge rule. Where the stair above delivers someone onto a
     tier that is NOT the top, that tier's own wall already carries a door
     (monoCanton()/templeCanton() build one per approach face at exactly
     this entryY/entryHw — Palace at y=53.1 of 132.6, Temple at 57.8 of
     156.7, both tier 1 of 5/6, both correct as they stand). Where it
     delivers onto the TOP deck — every platCanton() canton, because those
     are single-deck and `targetY` falls back to CANTON_TOPS.y — there is
     no wall above, so the rule says staircase instead. Ancestry is the
     third case and neither: its bridges land mid-way up a continuous
     open garden ramp (bridgeY=53.3 of 150) whose only vertical surface
     within reach is a 1.6-unit parapet, with the solid core 27+ units
     inboard behind a 13-unit planted bed — there is no wall there to put
     a door in, so it deliberately gets neither. */
  var arr = cantonArrivalLevel(c.n, targetY + 1.5);
  if(arr && arr.top){
    var ang = Math.atan2(ax-c.x, az-c.z);
    var got = cantonTopDescent(c, ang, w);
    window._cantonBridgeDoors = window._cantonBridgeDoors || [];
    window._cantonBridgeDoors.push({canton:c.n, ang:got?got.ang:ang, placed:!!got,
                                     y:got?got.y:null, hw:got?got.hw:null});
  }
}

/* every bridge support pylon span() builds below (river bridges AND canton
   SPANS both call this one function) — the owner: "ferries still clip
   through bridge supports, please make sure they and all boats know to
   avoid them". Declared here, early (file order 50), rather than in
   78-life.js's own obstacle lists (order 78, and the life layer's own
   LIFE_EXTRA_PIERS doesn't exist yet until order 65 in any case) — span()
   itself gets called as early as 60-land.js, so this needs to exist
   before ANY of its callers run. 78-life.js's lifeNavBlocked reads it
   directly; it doesn't care when in file order the array got filled, only
   that it's full by the time the grid is actually built (late in the ship
   section, after every static pass has finished). */
var BRIDGE_SUPPORTS = [];
function span(ax,az,ay, bx,bz,by, w, col, arch, parapet){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 6) return;
  var ry = Math.atan2(dx,dz);
  var n = Math.max(6, Math.round(L/20));
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var x=ax+dx*t, z=az+dz*t;
    var y = mix(ay,by,t) + arch*Math.sin(Math.PI*t);
    BOX(x, y-2.8, z, w, 3.0, L/n*1.09, ry, col);
    if(parapet){
      var pl = loc(x,z,  w*0.5-0.8, 0, ry), pr = loc(x,z, -(w*0.5-0.8), 0, ry);
      BOX(pl[0], y+0.2, pl[1], 1.5, 2.4, L/n*1.09, ry, shade(col,-0.18));
      BOX(pr[0], y+0.2, pr[1], 1.5, 2.4, L/n*1.09, ry, shade(col,-0.18));
    }
  }
  var np = Math.max(1, Math.round(L/135));
  var supportT = [0];
  for(var k=1;k<=np;k++){
    var t2 = k/(np+1);
    var px = ax+dx*t2, pz = az+dz*t2;
    var yt = mix(ay,by,t2) + arch*Math.sin(Math.PI*t2) - 2.8;
    var bd = bedAt(px,pz);
    FR8(px, bd, pz, w*1.55, yt-bd, w*1.7, ry, shade(col,-0.22));
    BOX(px, yt-3.4, pz, w*1.85, 2.0, w*2.0, ry, shade(col,-0.30));
    /* r: was w*1.0 — measured directly against the real solid footprint
       just built above (FR8 half-extents ~w*0.775/w*0.85, the BOX
       ~w*0.925/w*1.0), whose true half-diagonal is closer to w*1.35;
       w*1.0 under-covered it enough that vehicles were still measured
       clipping the pylon after "avoiding" it by this radius's own logic. */
    BRIDGE_SUPPORTS.push({ x:px, z:pz, r: w*1.4 });
    supportT.push(t2);
  }
  supportT.push(1);
  /* banners centered between each pair of adjacent supports (the two deck
     abutments count as supports too — a pylon-flanked span reads exactly
     like the reference: hanging cloth over open water at the midpoint
     between two piers), hung off both parapets. 2nd pass, made genuinely
     big — the first attempt (dropH 2.2-3.4, width 2-3, tucked in tight to
     the parapet at side*(w*0.5-0.4)) read as too subtle to register as
     "banners" at all. Now a long drop clearly hanging below the deck edge,
     wide, and pushed out past the parapet's own 1.5-unit thickness so it
     hangs in open air/over the water rather than overlapping the parapet
     geometry. Still box|cloth, top edge anchored/bottom free per
     applyClothSway's own convention — zero new draw calls. */
  for(var bi=0; bi<supportT.length-1; bi++){
    var tm = (supportT[bi]+supportT[bi+1])*0.5;
    var xm = ax+dx*tm, zm = az+dz*tm;
    var ym = mix(ay,by,tm) + arch*Math.sin(Math.PI*tm);
    [-1,1].forEach(function(side){
      var ep = loc(xm,zm, side*(w*0.5+1.6), 0, ry);
      var mountY = ym + 0.6, dropH = rr(9,14);
      BOX(ep[0], mountY-dropH, ep[1], 0.16, dropH, rr(4.5,6.5), ry, pick(BANNERC), 'cloth');
      window._bridgeBanners = window._bridgeBanners || [];
      window._bridgeBanners.push([Math.round(ep[0]), Math.round(mountY), Math.round(ep[1])]);
    });
  }
}

/* a reclaimed-land causeway: an earthen mole raised just above the waterline,
   with a revetted edge, rather than a deck on piers */
function reclaimedCauseway(ax,az, bx,bz, w, tone){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 6) return;
  var ry = Math.atan2(dx,dz);
  var n = Math.max(6, Math.round(L/26));
  var segL = L/n*1.10;
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n, x=ax+dx*t, z=az+dz*t;
    var bed = bedAt(x,z);
    FR8(x, bed, z, w, RLAND-bed, segL, ry, shade(tone,-0.20));             /* the fill */
    BOX(x, RLAND-0.5, z, w*0.94, 1.2, segL*0.98, ry, shade(tone,-0.32));   /* the road surface */
    [-1,1].forEach(function(side){
      var p = loc(x,z, side*(w*0.5-1.1), 0, ry);
      BOX(p[0], RLAND+0.7, p[1], 2.2, 2.6, segL*0.98, ry, shade(tone,-0.10));  /* revetment lip */
    });
  }
}

/* ============================== 13. BUILD ============================== */

reseed(31337);
CANTONS.forEach(function(c){ if(c.kind==='mono') monoCanton(c); else if(c.n==='Ancestry') ancestryCanton(c); else platCanton(c); });

reseed(777);
SPANS.forEach(function(p){
  var A=CANTONS[p.a], B=CANTONS[p.b];
  var dx=B.x-A.x, dz=B.z-A.z, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L;
  var w = rr(12,17);
  /* land on the canton faces, and carry the deck on a pylon at each end */
  var ax = A.x+ux*A.r*0.94, az = A.z+uz*A.r*0.94;
  var bx = B.x+ -ux*B.r*0.94, bz = B.z+ -uz*B.r*0.94;
  /* the Palace's own arrival rule — see palaceBays(). Returns null for every
     other canton and for every Palace arrival that stays put, so `ry` and both
     landings are computed exactly as before unless something actually moved,
     and the rr() draws in this loop and in span() are untouched either way
     (checked: the moved span's deck length goes 314.5 -> 302.3 and span()'s
     own support count, round(L/135), stays at 2, so the banner draws — the
     only other randomness in here — are the same count in the same order). */
  var pa = palaceLandingShift(A, ax, az), pb = palaceLandingShift(B, bx, bz);
  if(pa){ ax = pa.x; az = pa.z; }
  if(pb){ bx = pb.x; bz = pb.z; }
  var ry = (pa || pb) ? Math.atan2(bx-ax, bz-az) : Math.atan2(dx,dz);
  landing(A, ax, az, ry, w, pa && pa.foot);
  landing(B, bx, bz, ry, w, pb && pb.foot);
  span(ax,az,DECK, bx,bz,DECK, w, TONES[0], Math.min(20, L*0.055), true);   /* was a local 0xb3a68a literal — reads from the gray-brown palette now */
});

/* causeways: every rim canton is tied to the shore by a low level roadway */
reseed(2468);
CAUSEWAYS.forEach(function(cw){
  var c = cw.c;
  /* owner: "Fortress causeway doesn't have to be that black colour, make it
     look like other causeways." Every causeway takes its fill/road/revetment
     colour from the canton it leaves (shade(c.tone,...) below and inside
     reclaimedCauseway()), which was fine while every canton was gray-brown —
     but the Fortress recolour moved that canton's tone to basalt 0x322f2b, so
     its mole came out near-black while the other seven read as ordinary
     gray-brown roadway. The causeway is a public road across the bay, not
     part of the fortress, so it now takes TONES[0] — the same gray-brown
     PAL.stone.common entry the BRIDGE causeways (span(), above) and the
     canton spans already use, i.e. literally the colour the other causeways
     are built from. Fortress-only: every other canton still passes its own
     tone, so no other causeway moves. The canton's own flank, tiers, doors
     and trim are untouched — only the roadway leaving it. */
  var cwTone = c.fortress ? TONES[0] : c.tone;
  /* diagnostic only: every causeway's own roadway tone against the canton
     tone it used to take, so "only the Fortress one moved" is checkable
     from outside instead of by eye. */
  window._causewayTone = window._causewayTone || {};
  window._causewayTone[c.n] = { tone: c.tone, cwTone: cwTone, solid: !!cw.solid };
  var land = shoreIn(cw.s, 26);
  var dx=land[0]-c.x, dz=land[1]-c.z, L=Math.hypot(dx,dz);
  if(L < c.r + 40) return;
  var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
  var top = CANTON_TOPS[c.n].y;
  var ry = Math.atan2(dx,dz);

  /* ---- the causeway door, 3rd pass ---------------------------------------
     Owner, this round: "a lot of the canton doors are up a tier and not on
     a wall... there should be doors on tiers both where there is a bridge
     (as long as it's not the top level) and where there is a causeway."

     Both previous passes put this door on a height derived from the canton
     rather than from the CAUSEWAY, and both were wrong in the same way.
     Pass 1 used (`top`, c.r*0.96) — the flank ramp's nominal end. Pass 2
     moved it to entryY/entryHw, which for a platCanton() canton is not
     tier 1 at all: those never set entryY, so it fell back to
     CANTON_TOPS.y/.hw, i.e. the TOP DECK at the top tier's own top face —
     a dark slab standing on an open platform with nothing above it. That
     is exactly "up a tier and not on a wall", and it was true of all eight
     causeway cantons (Arsenal/Market y=40.4, Guild 38.4, Foreign 36.4,
     Port 34.4, Granary 32.2, Arena 30.2, Fortress 44.4).

     What a causeway actually delivers, measured: a reclaimed-land mole
     (Arsenal, Guild, Foreign, Granary, Market, Arena, Fortress) is FLAT at
     RLAND the whole way, road surface top y=3.3; a bridge causeway
     (Ancestry, Port) rides level at CWAY=17. Neither ever reaches the
     canton top. The FR8 below is a solid abutment, not a walkable ramp —
     raycast down Port's causeway centreline: its face climbs from y=15 to
     y=35.4 in 11 units of run, a 61-degree wall. So the deck's own height
     is what decides, and cantonArrivalLevel() turns it into the highest
     terrace a walker can actually stand on: for every one of these that
     is the plinth apron at y=6 (the quay cap at 7.3 for Port), with
     tier 0's own wall rising straight off it to hold the door.

     Stepped sideways by bearingBeside(): that same abutment is rw*0.30
     half-wide and sits on the causeway's own bearing, and on a
     face-normal approach (Guild at ry=1.8) it covers the door position
     outright — the door radius there is 118.5 and the abutment reaches
     134.5. Off to one side it is still on the mole (half-width rw*0.47)
     and clear of the block. Where the deck arrives above its own door
     level (Port, Ancestry) a linkStair carries it down; that is the whole
     of the Ancestry fix — its causeway ended 11 units above the base
     plaza with no way off and its nearest door 242 units away. */
  var rw = cw.solid ? (c.port ? 60 : rr(40,52)) : 0;
  var w  = cw.solid ? 0 : (c.port ? 22 : rr(13,18));
  var deckY = cw.solid ? RLAND+0.7 : CWAY+0.8;      /* the road/deck surface a walker is actually on */
  var arr = cantonArrivalLevel(c.n, deckY);
  if(arr){
    var abut = cw.solid ? rw*0.30 : w*0.85;         /* the FR8 abutment's own half-width */
    var dAng = bearingBeside(ry, abut + 8, squareEdgeHw(arr.hw, ry));
    var dHw  = squareEdgeHw(arr.hw, dAng);
    var dTier = CANTON_FACES[c.n].tiers[arr.tier];
    plinthDoor(c.x, c.z, dAng, arr.y, dHw, c.tone,
               { maxH: dTier ? Math.min(8, dTier.th - 2.4) : 7,
                 lean: dTier ? faceLean(dTier, dAng) : 0 });
    inspectClaim(c.x + Math.sin(dAng)*dHw, c.z + Math.cos(dAng)*dHw, 7, 5, dAng,
                 'cantonDoor', 'Canton door');
    if(arr.y > deckY + 1.2){
      /* a reclaimed mole: the apron's outer lip is a 2.7-unit step up off
         the road surface. A short flight beside the abutment, on the
         door's own bearing so it is still on the mole (half-width
         rw*0.47) and still clear of the block. */
      var uRun = Math.max(6, (arr.y-deckY)*1.9), uR = squareEdgeHw(arr.outer, dAng);
      var uA = loc(c.x,c.z, 0, uR, dAng), uB = loc(c.x,c.z, 0, uR+uRun, dAng);
      linkStair(uA[0],uA[1], arr.y, uB[0],uB[1], deckY, Math.min(22, abut*1.1));
      inspectClaim((uA[0]+uB[0])*0.5, (uA[1]+uB[1])*0.5, Math.min(22,abut*1.1)*0.5, uRun*0.5, dAng,
                   'cantonStair', 'Causeway stair');
    }else if(deckY > arr.y + 1.2){
      /* a bridge causeway (Ancestry, Port): the deck ends in the air above
         the apron — 11.8 units above it at Ancestry, with nothing under it
         and the nearest door 242 units round the far side of the canton.
         This is the flight off the end of it. On the causeway's OWN bearing
         (that is where the deck is); inward across the apron when there is
         room for a sane pitch, outward over the quay when there is not
         (Port: only 11 units of apron inboard of the deck end, but a 177-
         unit-radius working quay outboard of it). */
      var rEnd = c.r*0.96, want = Math.max(10, (deckY-arr.y)*1.9);
      var inMax = rEnd - (dHw + 5);                          /* room inboard, before the wall */
      var outMax = squareEdgeHw(arr.outer, ry) - 3 - rEnd;   /* room outboard, before the lip */
      var sgn = 1, dRun = want;
      if(inMax >= want) sgn = -1;
      else if(outMax >= want) sgn = 1;
      else if(outMax >= inMax) dRun = Math.max(8, outMax);
      else { sgn = -1; dRun = Math.max(8, inMax); }
      var vA = loc(c.x,c.z, 0, rEnd, ry);
      var vB = loc(c.x,c.z, 0, rEnd + sgn*dRun, ry);
      linkStair(vA[0],vA[1], deckY, vB[0],vB[1], arr.y, Math.min(24, abut*1.2));
      inspectClaim((vA[0]+vB[0])*0.5, (vA[1]+vB[1])*0.5, Math.min(24,abut*1.2)*0.5, dRun*0.5, ry,
                   'cantonStair', 'Causeway stair');
    }
    window._cantonCausewayDoors = window._cantonCausewayDoors || [];
    window._cantonCausewayDoors.push({canton:c.n, y:arr.y, hw:dHw, ang:dAng, deckY:deckY, top:!!arr.top});
  }

  if(cw.solid){
    /* reclaimed land: the canton flank ramps straight down to just above the
       waterline, then an earthen mole with revetted edges runs to the shore */
    /* the flank ramp keeps c.tone on purpose: it rises the canton's FULL
       height (top-RLAND+3 = ~44 units at the Fortress) hard against the
       tier stack, so it reads as part of the canton's own silhouette, not
       as roadway — recolouring it would put a gray-brown wedge up the side
       of a basalt canton. Everything from the waterline outward (the mole
       itself) takes cwTone. */
    FR8(ax, RLAND-3, az, rw*0.60, top-RLAND+3, rw*0.84, ry, shade(c.tone,0.02));
    reclaimedCauseway(ax, az, land[0], land[1], rw, cwTone);
    reserve(land[0], land[1], 30, 30, 0);
    return;
  }

  /* a ramp down the canton flank to causeway level */
  FR8(ax, CWAY-2, az, w*1.7, top-CWAY+3, w*2.4, ry, shade(c.tone,0.02));
  var landY = Math.max(CWAY-6, terrainH(land[0],land[1])+2.5);
  if(cw.isle){
    /* the causeway steps across an islet: a paved platform with a shrine post */
    var I = cw.isle, iy = terrainH(I[0],I[1]);
    BOX(I[0], iy-1, I[1], 46, CWAY-iy+1, 46, ry, shade(c.tone,-0.12));
    BOX(I[0], CWAY-0.3, I[1], 50, 1.6, 50, ry, shade(c.tone,-0.26));
    FR3(I[0]+12, CWAY+1.3, I[1]+12, 4, 12, 4, ry, shade(c.tone,0.05));
    span(ax,az,CWAY, I[0],I[1],CWAY, w, TONES[0], 4, true);
    span(I[0],I[1],CWAY, land[0],land[1], landY, w, TONES[0], 4, true);
  }else{
    span(ax,az,CWAY, land[0],land[1], landY, w, TONES[0], 5, true);   /* was a local 0xada186 literal — gray-brown palette now */
  }
  reserve(land[0], land[1], 30, 30, 0);
});
