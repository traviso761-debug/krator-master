/* ============================== TAVERN + BEER GARDEN ==============================
   A new building kind, distinct from structure()'s hlaalu/velothi/domed/hovel
   and from the monastery/temple bespoke buildings: a two-storey public hall
   (tall ground-floor taproom, guest rooms above, stepped back per side per
   hlaalu's own cornice idiom) with an attached fenced beer garden trailing
   off its rear (local -x) wall. NOT PLACED HERE — per the brief this file
   only defines tavern() and its two small helpers; nothing below calls them
   into the world. A caller elsewhere reserves the returned footprint via
   claim() and wires the returned garden centre into the pedestrian-
   destination system.

   Signals "tavern" specifically (per the brief): a hanging bracket sign at
   the entrance, an exterior stair to the upper floor, a stack of casks in
   the garden's corner, and a chimney smoking on the shared smoke-particle
   rig at the top of this file (registerSmokeEmitter — zero extra draw
   calls, it shares the forge's one mesh).
   Doors/windows face local +x (world direction ry), same convention as
   funeraryTemple/monasteryChapel/structure() above. Existing (shape,family)
   buckets only: box|stone, box|wood, box|plaster is unused here, cyl|stone,
   cyl|wood, cyl|metal, fr8|roof, blob|leaf, dome (via monasteryWindow's own
   arch cap) — all already live elsewhere in this file, zero new draw calls. */
reseed(657001);   /* unique fragment seed for this new section, per the brief. */

/* a small wood cask: body + hoop bands — cyl|wood / cyl|metal, both already
   live buckets (ferries, monasteryWell, brazierOrnate). Returns its own
   height so a caller can stack a second, smaller cask on top. */
function tavernBarrel(x,y,z,col){
  var r = rr(0.5,0.68), h = rr(1.2,1.6);
  CYL(x, y, z, r, h, 0, col, 'wood');
  [0.12,0.5,0.86].forEach(function(t){
    CYL(x, y+h*t-0.07, z, r*1.04, 0.16, 0, shade(col,-0.32), 'metal');
  });
  return h;
}

/* a garden table: plank top on 4 short legs — box|wood only, already live.
   No equivalent prop exists elsewhere in src/ (checked), so this is not a
   parallel reimplementation of anything; benchPlain/benchOrnate (above,
   this same file) are reused as-is for seating rather than duplicated. */
function tavernTable(x,y,z,ry,col){
  var w = 2.2, d = 1.3, legH = 0.75;
  BOX(x, y+legH, z, w, 0.14, d, ry, col, 'wood');
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){
    var p = loc(x,z, c[0]*w*0.42, c[1]*d*0.38, ry);
    BOX(p[0], y, p[1], 0.16, legH, 0.16, ry, shade(col,-0.2), 'wood');
  });
}

/* tavern(x, y, z, ry, col, opt) — x,y,z is the taproom hall's own centre
   (y the ground/base reference, same convention as funeraryTemple/
   monasteryChapel), ry the entrance facing (local +x, world direction ry).
   col is the wall stone tone (falls back to pick(TONES) if falsy). opt may
   override hallW/hallD/h1/h2/gardenDepth/gardenW/roofCol.

   Returns { x, z, ry, fx, fz, gardenCx, gardenCz, doorX, doorZ } — fx/fz
   are half-extents of a rectangle CENTRED AT (x,z) that safely contains the
   whole building + beer garden (it over-claims a little on the entrance
   side, since the garden trails off asymmetrically behind the hall, rather
   than returning an off-centre claim rectangle a caller would have to
   reason about separately); doorX/doorZ is the front-door threshold, for a
   caller wiring up a pedestrian approach point; gardenCx/gardenCz is the
   beer garden's own centre, for registering it as a pedestrian destination
   — same shape of contract as monasteryAssemblyHall's own
   {x,z,ry,courtCx,courtCz,courtSpan} return, above. */
function tavern(x, y, z, ry, col, opt){
  opt = opt || {};
  var hallW = opt.hallW || 20, hallD = opt.hallD || 30;
  var h1 = opt.h1 || 9.5, h2 = opt.h2 || 6.5;
  var wallCol = col || pick(TONES);
  /* owner: "give taverns a specific blue colored roof so I can easily
     identify them" -- a fixed signature colour instead of pick(ROOFS)
     (which is all terracotta/olive/ochre tones, no blue at all in that
     palette, so this reads as unmistakably distinct from every other
     roof in the city at a glance). Same 'roof' family/bucket as every
     other roof colour -- just a fixed hex, zero new draw calls. */
  var TAVERN_ROOF_BLUE = 0x2f5a86;
  var roofCol = opt.roofCol || shade(TAVERN_ROOF_BLUE, -0.06);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.18);
  var doorCol = pick(TRUNKC);

  var y1 = y, y2 = y1+h1;
  var upperW = hallW*0.86, upperD = hallD;   /* recessed in x only — the +/-z
     walls stay flush floor to floor, so the exterior stair (below) can dock
     against a continuous wall instead of a stepped one. */

  /* --- ground floor: the taproom hall --- */
  BOX(x, y1, z, hallW, h1, hallD, ry, wallCol);
  BOX(x, y1+h1-0.55, z, hallW*1.04, 1.0, hallD*1.04, ry, shade(wallCol,-0.13));   /* cornice */

  /* --- upper floor: guest rooms, stepped in slightly on the front/back --- */
  BOX(x, y2, z, upperW, h2, upperD, ry, shade(wallCol,0.03));
  var eaveY = y2+h2;
  BOX(x, eaveY, z, upperW*1.05, 0.9, upperD*1.05, ry, shade(wallCol,-0.16));      /* eave/parapet */

  /* --- roof: a steep hip, taller in proportion than an ordinary house's or
     a monastery dorm's, so the hall reads as a grand public room even from
     a distance --- */
  var roofH = h1*0.75;
  FR8(x, eaveY+0.9, z, upperW*1.02, roofH, upperD*1.02, ry, roofCol, 'roof');

  /* --- chimney, off-centre, with a couple of soft grey puffs above it so
     it reads as a working hearth rather than decoration --- */
  var chimP = loc(x,z, -hallW*0.22, hallD*0.28, ry);
  var chimBaseY = eaveY-1.5, chimTopY = eaveY+0.9+roofH*0.55;
  CYL(chimP[0], chimBaseY, chimP[1], 0.85, chimTopY-chimBaseY, 0, shade(wallCol,-0.22));
  CYL(chimP[0], chimTopY, chimP[1], 1.05, 0.5, 0, shade(wallCol,-0.30));          /* cap */
  /* the hearth plume — real particles on the shared citywide rig
     (registerSmokeEmitter, top of this file), replacing the 3 static BLOBs
     that used to sit here. A taproom hearth is bigger than a house chimney
     but nothing like a forge: a 6-puff pool, a soft pale plume.
     DETERMINISM: the retired loop's 12 draws (2 rr + 1 rnd + 1 pick per
     puff, 3 puffs) are made here in the same order over the same ranges,
     four of them genuinely used, so this fragment's stream is unchanged. */
  var tvJx=0, tvJz=0, tvPh=0, tvCol=0;
  for(var pf=0; pf<3; pf++){
    var jx = rr(-0.5,0.5)*pf, jz = rr(-0.5,0.5)*pf, sp = rnd()*3, gc = pick(GREYC);
    if(pf === 1){ tvJx = jx; tvJz = jz; tvPh = sp*2; tvCol = shade(gc, 0.10); }
  }
  registerSmokeEmitter(chimP[0]+tvJx*0.5, chimTopY+0.6, chimP[1]+tvJz*0.5, {
    kind:'tavern', n:8, life:6.0, rise:9.5, r0:0.40, r1:1.95,
    spread:0.34, sway:0.50, swirl:0.70, lean:0.60, phase:tvPh, col:tvCol
  });

  /* --- hanging tavern sign: post + bracket arm + suspended board, on the
     entrance (+x) face --- */
  var signZ = hallD*0.30;
  var postP = loc(x,z, hallW*0.5, signZ, ry);
  CYL(postP[0], y1, postP[1], 0.18, h1*0.62, 0, shade(doorCol,-0.2), 'wood');
  var armY = y1+h1*0.60;
  var armP = loc(x,z, hallW*0.5+0.8, signZ, ry);
  BOX(armP[0], armY, armP[1], 1.6, 0.14, 0.14, ry, shade(doorCol,-0.15), 'wood');
  var hangP = loc(x,z, hallW*0.5+1.55, signZ, ry);
  CYL(hangP[0], armY-1.1, hangP[1], 0.05, 1.1, 0, shade(doorCol,-0.3), 'metal');
  BOX(hangP[0], armY-1.7, hangP[1], 0.12, 1.1, 1.5, ry, shade(pick(ROOFS),-0.05), 'wood');

  /* --- exterior stair to the upper floor, along the +z flank, ending at a
     balcony door on the upper storey --- */
  var stairSteps = 7, stepDepth = 1.3;
  var stairX0 = -hallW*0.06, stairX1 = hallW*0.30;
  for(var si=0; si<stairSteps; si++){
    var st = (si+0.5)/stairSteps;
    var sx = stairX0 + (stairX1-stairX0)*st;
    var stepH = Math.max(0.5, h1*st);
    var sz = hallD*0.5 + stepDepth*0.5 + 0.15;
    var sp2 = loc(x,z, sx, sz, ry);
    BOX(sp2[0], y1, sp2[1], (stairX1-stairX0)/stairSteps*1.25, stepH, stepDepth, ry, shade(wallCol,-0.08), 'wood');
  }
  var doorUpP = loc(x,z, stairX1, hallD*0.5+0.05, ry);
  BOX(doorUpP[0], y1+h1*0.90, doorUpP[1], 1.4, 2.4, 0.4, ry, doorCol, 'wood');

  /* --- doors: a grand double door at the entrance, a second door on the
     rear (-x) wall straight into the beer garden --- */
  var dw = 1.5, dh = 3.4;
  [-1,1].forEach(function(s){
    var dp = loc(x,z, hallW*0.5+0.05, s*dw*0.52, ry);
    BOX(dp[0], y1, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  });
  var lintelP = loc(x,z, hallW*0.5+0.08, 0, ry);
  BOX(lintelP[0], y1+dh, lintelP[1], 0.5, 0.5, dw*2.2, ry, frameCol);
  var gardenDoorP = loc(x,z, -hallW*0.5-0.05, 0, ry);
  BOX(gardenDoorP[0], y1, gardenDoorP[1], 0.5, 3.0, 1.8, ry, doorCol, 'wood');

  /* --- windows: generous, both floors, every face (this session's own
     standard — see monasteryOpenings/monasteryDorm above) --- */
  var winY1 = y1+h1*0.30;
  [-1,1].forEach(function(s){
    var wp = loc(x,z, hallW*0.5+0.05, s*hallD*0.30, ry);
    monasteryWindow(wp[0], wp[1], winY1, ry, 1.5, 2.4, true, frameCol, paneCol);
  });
  [-1,1].forEach(function(s){
    [-0.30, 0.12].forEach(function(t3){
      var wp2 = loc(x,z, hallW*t3, s*(hallD*0.5+0.05), ry);
      monasteryWindow(wp2[0], wp2[1], winY1, ry, 1.3, 2.1, false, frameCol, paneCol);
    });
  });
  var winY2 = y2+h2*0.30, nUpFront = 3;
  for(var i2=0;i2<nUpFront;i2++){
    var t4 = (i2-(nUpFront-1)/2)*(upperD*0.28);
    var wp3 = loc(x,z, upperW*0.5+0.05, t4, ry);
    monasteryWindow(wp3[0], wp3[1], winY2, ry, 1.2, 1.9, true, frameCol, paneCol);
  }
  [-1,1].forEach(function(s){
    var wp4 = loc(x,z, 0, s*(upperD*0.5+0.05), ry);
    monasteryWindow(wp4[0], wp4[1], winY2, ry, 1.2, 1.8, false, frameCol, paneCol);
  });

  /* ==================== attached beer garden (local -x, behind the hall) ===
     Fenced on 3 sides, open on the 4th where it meets the hall's own rear
     door — tables + benches (reusing benchPlain, above, not a parallel
     prop), a post-and-beam trellis with FRUITC vines, a stack of casks in
     the far corner, and a few potted shrubs along the fence. */
  var gardenDepth = opt.gardenDepth || 17, gardenW = opt.gardenW || hallD*1.05;
  var gcp = loc(x,z, -hallW*0.5-gardenDepth*0.5, 0, ry);
  var gardenCx = gcp[0], gardenCz = gcp[1];
  var half = gardenDepth*0.5;
  var fenceH = 1.1, fenceCol = shade(doorCol,-0.1);

  [-1,1].forEach(function(s){
    var p = loc(gardenCx,gardenCz, 0, s*gardenW*0.5, ry);
    BOX(p[0], y1, p[1], gardenDepth, fenceH, 0.25, ry, fenceCol, 'wood');
  });
  var farP = loc(gardenCx,gardenCz, -half, 0, ry);
  BOX(farP[0], y1, farP[1], 0.25, fenceH, gardenW, ry, fenceCol, 'wood');

  /* trellis: trellisN post-and-beam frames straddling the garden's depth,
     spread across its width, with a few hanging FRUITC vine blobs */
  var trellisN = 4, postH = 2.6, beamY = y1+postH;
  for(var tp2=0; tp2<trellisN; tp2++){
    var tz = (tp2-(trellisN-1)/2)*(gardenW*0.20);
    [-1,1].forEach(function(sgn){
      var pp2 = loc(gardenCx,gardenCz, sgn*gardenDepth*0.28, tz, ry);
      CYL(pp2[0], y1, pp2[1], 0.16, postH, 0, fenceCol, 'wood');
    });
    var bp2 = loc(gardenCx,gardenCz, 0, tz, ry);
    BOX(bp2[0], beamY, bp2[1], gardenDepth*0.62, 0.14, 0.14, ry, fenceCol, 'wood');
  }
  for(var v=0; v<8; v++){
    var vx = gardenCx + rr(-gardenDepth*0.30, gardenDepth*0.30);
    var vz = gardenCz + rr(-gardenW*0.42, gardenW*0.42);
    BLOB(vx, beamY-0.3, vz, rr(0.4,0.8), rr(0.3,0.5), rnd()*3, pick(FRUITC), 'leaf');
  }

  /* tables + benches under the trellis */
  var nTables = 3;
  for(var tt=0; tt<nTables; tt++){
    var ttz = (tt-(nTables-1)/2)*(gardenW*0.26);
    var ttp = loc(gardenCx,gardenCz, 0, ttz, ry);
    tavernTable(ttp[0], y1, ttp[1], ry, shade(doorCol,-0.05));
    [-1,1].forEach(function(s){
      var bpP = loc(gardenCx,gardenCz, 0, ttz + s*1.1, ry);
      benchPlain(bpP[0], y1, bpP[1], ry, shade(doorCol,-0.1), {w:2.0});
    });
  }

  /* casks stacked in the garden's far corner — the clearest "tavern" signal
     outside the hanging sign itself */
  var barrelCol = shade(TRUNKC[0], -0.05);
  var bc1 = loc(gardenCx,gardenCz, -gardenDepth*0.36, gardenW*0.40, ry);
  var h0 = tavernBarrel(bc1[0], y1, bc1[1], barrelCol);
  tavernBarrel(bc1[0], y1+h0*0.92, bc1[1], barrelCol);
  var bc2 = loc(gardenCx,gardenCz, -gardenDepth*0.28, gardenW*0.32, ry);
  tavernBarrel(bc2[0], y1, bc2[1], barrelCol);

  /* potted shrubs along the near (hall-facing) fence line */
  for(var pl=0; pl<4; pl++){
    var plz = (pl-1.5)*(gardenW*0.22);
    var plP = loc(gardenCx,gardenCz, gardenDepth*0.46, plz, ry);
    BLOB(plP[0], y1+0.2, plP[1], rr(0.7,1.1), rr(0.7,1.0), rnd()*3, pick(FRUITC), 'leaf');
  }

  var doorThreshold = loc(x,z, hallW*0.5+0.3, 0, ry);
  return {
    x:x, z:z, ry:ry,
    fx: hallW*0.5+gardenDepth+1, fz: Math.max(hallD,gardenW)*0.5+2,
    gardenCx:gardenCx, gardenCz:gardenCz,
    doorX:doorThreshold[0], doorZ:doorThreshold[1]
  };
}

/* ============================== HOUSE OF HEALING ==============================
   The owner: "This looks like a canton but is about 1/4 the footprint. There
   is a square inner atrium looking out on an inner garden; the atrium is
   lined with cloisters. Has entrances on all 4 sides." Read monoCanton() /
   platCanton() / templeCanton() (50-cantons.js, this same file) first — the
   vocabulary borrowed here is theirs: an FR8 battered foundation skirt, a
   tiered stack with cornice bands, corner turret-and-cap finials, doors set
   at the real entrance level. The smallest real plat canton (Granary,
   30-layout.js: r:122) is the footprint reference — "about 1/4 the
   footprint" is 1/4 the AREA, i.e. half the linear radius: this building's
   own outerHW default (56) is Granary's r halved (61) rounded down a touch
   for a tidier number, giving a (112/244)^2 = 0.21 footprint ratio, "about
   1/4". It is NOT a solid tapering block like a real canton, though — the
   centre has to stay open sky above the garden, so the canton silhouette is
   built as a hollow SQUARE RING per tier (four wall segments meeting at
   corners, not one solid FR8 body), with a separate cloister arcade ring
   (the exact pier/arch idiom from this session's own monasteryAssemblyHall,
   61-monastery.js — open bays, box piers, dome arch caps) one layer further
   in, bordering the open garden at the very centre.

   The real bug monasteryAssemblyHall found and fixed (a single full-square
   roof slab silently roofing over the garden underneath it) is guarded
   against the same way here: the ambulatory roof between the outer wall and
   the cloister pier line is built as 4 separate per-side slabs that stop
   well short of the garden's own half-width, never one slab spanning the
   whole footprint. Confirmed by a straight-down screenshot (see the report),
   not assumed.

   Entrances are REAL walk-through gaps (jambs flank a genuine opening, the
   idiom used everywhere else this session — monasteryCompound's gates,
   tavern()'s own doors above) on all 4 sides, unlike monoCanton's own
   plinthDoor() (a decorative inset on a solid wall, fine for a canton
   nobody actually walks into, wrong for a building whose whole point is a
   walkable atrium).

   Existing (shape,family) buckets only: box|stone(default), fr8|stone
   (default), fr8|roof, dome|dome, blob|leaf — all already live elsewhere in
   this file (monoCanton/templeCanton/monasteryAssemblyHall). Zero new draw
   calls. */
reseed(658001);   /* unique fragment seed for this new section, per the brief. */

/* houseOfHealing(x, y, z, ry, col, opt) — x,y,z is the WHOLE building's own
   centre (the atrium/garden's centre too — unlike tavern()'s off-centre
   garden, this one is the structure's middle), y the ground/base reference.
   ry is the facing used for side indexing only (the building is square with
   an entrance on every side, so no one face is more "the front" than
   another) — kept for contract consistency with every other builder in this
   file. col is the wall stone tone (falls back to pick(TONES)).

   Returns { x, z, ry, fx, fz, gardenCx, gardenCz } — fx/fz are half-extents
   of a square centred at (x,z) that contains the whole building (for
   claim()); gardenCx/gardenCz is the atrium garden's own centre, which here
   is just (x,z) again, returned explicitly for contract parity with
   tavern()'s gardenCx/gardenCz and monasteryAssemblyHall's courtCx/courtCz. */
function houseOfHealing(x, y, z, ry, col, opt){
  opt = opt || {};
  var outerHW = opt.hw || 56;           /* ~1/4 the footprint of the smallest real plat canton */
  var wallT = opt.wallT || 4.2;
  var wallCol = col || pick(TONES);
  /* owner: "fix 2nd floor house of healing so its floor uses a dark stone
     tile rather than the current green" — this ring, the ambulatory roof
     between the outer wall and the cloister pier line, is what reads from
     above as the upper storey's floor. pick(ROOFS) was drawing it from the
     ordinary roof palette, whose olive entry (0x6b7a4a) is what came up
     here and made the whole ring read as lawn — actively confusing next to
     the real lawn in the courtyard below it. Pinned to a dark stone tone
     instead, so the garden is the only green in the building. */
  var roofCol = opt.roofCol || shade(GREYC[1], -0.18);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(roofCol, 0.15);
  var plinthTop = opt.plinthTop || 6, tier0H = opt.tier0H || 13, tier1H = opt.tier1H || 9.5;
  var gateGapFrac = opt.gateGapFrac || 0.30;

  var cloisterHW = outerHW*0.62;            /* the arcade pier line — bounds the atrium */
  var gardenHW = cloisterHW*0.66;           /* the open lawn inside the pier line */

  /* --- foundation: a solid battered skirt under the WHOLE footprint, same
     as every canton's own bed/plinthTop — safe to be solid because it sits
     entirely below y1 (the real ground/atrium floor), not near the roofline
     where the assembly-hall bug actually lived. */
  FR8(x, y, z, outerHW*2*1.06, plinthTop, outerHW*2*1.06, ry, shade(wallCol,-0.24));
  BOX(x, y+plinthTop-1.2, z, outerHW*2*1.11, 2.2, outerHW*2*1.11, ry, shade(wallCol,-0.34));

  var y1 = y + plinthTop;                   /* atrium/garden/door floor level */
  var sideLen = outerHW*2;
  var gap = sideLen*gateGapFrac, segL = (sideLen-gap)*0.5, segCenterT = gap*0.5 + segL*0.5;

  /* --- outer ring, tier 0: 4 sides, each two battered wall segments
     flanking a real gated entrance, a pilaster pair, a small arch cap on
     the cornice, and a short entry stair. Uses its own per-side rotation
     (ry + f*90deg) so every side is built with the same loc()-relative code
     the rest of this file uses — not a fixed world-axis scheme like
     monoCanton's own (cantons never rotate; this building can). */
  for(var f=0; f<4; f++){
    var sideRy = ry + f*Math.PI/2;
    [-1,1].forEach(function(s){
      var o = loc(x,z, outerHW, s*segCenterT, sideRy);
      FR8(o[0], y1, o[1], wallT, tier0H, segL, sideRy, wallCol);
    });
    /* cornice band, doubling as the lintel bridging the gate opening below it */
    var cb = loc(x,z, outerHW, 0, sideRy);
    BOX(cb[0], y1+tier0H-0.6, cb[1], wallT*1.3, 1.3, sideLen*1.02, sideRy, shade(wallCol,-0.16));
    /* small arch flourish over the gate, on top of the cornice/lintel */
    var gp = loc(x,z, outerHW, 0, sideRy);
    DOME(gp[0], y1+tier0H+0.7, gp[1], gap*0.28, gap*0.15, sideRy, shade(wallCol,-0.08));
    /* pilasters flanking the real opening */
    [-1,1].forEach(function(s){
      var pp = loc(x,z, outerHW+0.4, s*(gap*0.5+1.0), sideRy);
      BOX(pp[0], y1, pp[1], wallT*0.5, tier0H*0.80, 1.6, sideRy, shade(wallCol,0.06));
    });
    /* a short entry stair, stacked boxes of increasing height nearest the
       door — same idiom as tavern()'s own exterior stair, above */
    var nSteps = 3;
    for(var si=0; si<nSteps; si++){
      var t = (si+1)/nSteps;
      var stepOut = outerHW + (nSteps-si)*1.4;
      var sp = loc(x,z, stepOut, 0, sideRy);
      BOX(sp[0], y, sp[1], 1.4, Math.max(0.5,plinthTop*t), gap*0.62, sideRy, shade(wallCol,-0.05));
    }

    /* --- tier 1: one continuous recessed wall per side (no gate needed up
       here), windows looking both outward (street) and inward (the atrium/
       garden — "the atrium looking out on an inner garden" reads both ways:
       the gallery above the cloister looks down into it too), a cornice,
       and a corner turret-and-dome finial. */
    var y2 = y1 + tier0H + 1.0;
    var tier1HW = outerHW*0.94;
    var t1p = loc(x,z, tier1HW, 0, sideRy);
    FR8(t1p[0], y2, t1p[1], wallT*0.9, tier1H, sideLen*0.96, sideRy, shade(wallCol,0.03));
    var nWin = 4;
    for(var wi=0; wi<nWin; wi++){
      var wt_ = (wi-(nWin-1)/2)*(sideLen*0.19);
      var wpOut = loc(x,z, tier1HW+0.05, wt_, sideRy);
      monasteryWindow(wpOut[0], wpOut[1], y2+tier1H*0.30, sideRy, 1.3, 2.0, true, frameCol, paneCol);
      var wpIn = loc(x,z, tier1HW-wallT*0.9-0.05, wt_, sideRy);
      monasteryWindow(wpIn[0], wpIn[1], y2+tier1H*0.30, sideRy, 1.2, 1.9, true, frameCol, paneCol);
    }
    var y3 = y2 + tier1H;
    var cb2 = loc(x,z, tier1HW, 0, sideRy);
    BOX(cb2[0], y3-0.5, cb2[1], wallT*1.3, 1.0, sideLen*0.98, sideRy, shade(wallCol,-0.18));

    /* --- ambulatory roof, ONE PER SIDE, stopping short of the pier line —
       never a single slab spanning the whole footprint (that is exactly
       the bug monasteryAssemblyHall's own comment warns against: it would
       silently roof over the garden underneath). */
    var roofInner = cloisterHW + wallT*0.6, roofOuter = outerHW - wallT*0.5;
    var roofSpan = roofOuter - roofInner;
    if(roofSpan > 1){
      var roofMidT = (roofInner+roofOuter)*0.5;
      var rp = loc(x,z, roofMidT, 0, sideRy);
      FR8(rp[0], y1+tier0H-0.2, rp[1], roofSpan+1.0, 1.3, sideLen*0.96, sideRy, roofCol, 'roof');
    }
  }

  /* corner turret-and-dome finials, above tier 1's own roofline, well clear
     of the garden at the centre */
  for(var cf=0; cf<4; cf++){
    var cAng = ry + cf*Math.PI/2;
    var cp = loc(x,z, outerHW-1, outerHW-1, cAng);
    FR8(cp[0], y1+tier0H+1.0, cp[1], 5.0, tier1H+3.0, 5.0, cAng, shade(wallCol,0.05));
    DOME(cp[0], y1+tier0H+1.0+tier1H+3.0, cp[1], 3.2, 2.6, cAng, pick(DOMEC), 'dome');
  }

  /* --- the cloister arcade: the exact pier/open-bay/arch idiom from
     monasteryAssemblyHall's own courtyard (61-monastery.js), one ring,
     centred here rather than offset. Real open gaps between piers — a
     genuine walk-through colonnade — each bay capped with a shallow arch. */
  var courtSpan = cloisterHW*2;
  var archW = courtSpan/5, pierW = archW*0.22, archH = tier0H*0.82;
  var cloisterCol = shade(wallCol,0.02);
  [ {lx:0, lz:-courtSpan*0.5, along:'x'}, {lx:0, lz:courtSpan*0.5, along:'x'},
    {lx:-courtSpan*0.5, lz:0, along:'z'}, {lx:courtSpan*0.5, lz:0, along:'z'} ].forEach(function(side){
    var nBay = 5;
    for(var b=0;b<nBay;b++){
      var bt = (b-(nBay-1)/2) * archW;
      var pp = side.along==='x' ? loc(x,z, bt-archW*0.5+pierW*0.5, side.lz, ry)
                                 : loc(x,z, side.lx, bt-archW*0.5+pierW*0.5, ry);
      var pierRy = side.along==='x' ? ry : ry+Math.PI/2;
      BOX(pp[0], y1, pp[1], pierW, archH, wallT*0.75, pierRy, cloisterCol);
      var archP = side.along==='x' ? loc(x,z, bt, side.lz, ry) : loc(x,z, side.lx, bt, ry);
      DOME(archP[0], y1+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, cloisterCol);
    }
  });

  /* --- the inner garden: open to the sky (verified by screenshot, not
     assumed) — a lawn patch, a scatter of herb/shrub plantings (FRUITC,
     this session's own "planting helper" per the tavern brief), a central
     well reused outright from monasteryWell() (61-monastery.js) rather than
     a parallel fountain prop, and a couple of benches. */
  var gardenCx = x, gardenCz = z;
  /* owner: "the house of healing surfaces seem switched, put the garden in
     the center and paved surface on the outer cloisters, not vice versa."
     Real bug: the only floor finish in here was one green slab covering
     just gardenHW (0.66 of the cloister radius), with NOTHING paving the
     ambulatory ring — so the bare foundation skirt's own dark stone read
     through everywhere the green didn't reach, and from above the green
     band looked like it belonged to the outer ring while the middle read
     as paving. Fixed both ways round: the lawn now covers the FULL atrium
     interior out to the pier line, and the ambulatory between the pier
     line and the outer wall gets real paving of its own. Paving is laid
     as 4 per-side slabs, never one footprint-spanning slab — same
     discipline the ambulatory roof above already follows, so nothing can
     accidentally cover the garden.
     Second real bug, found by instance probe after the first attempt still
     looked wrong: the plinth cornice band on line ~3786 is a FULL-footprint
     box (outerHW*2*1.11 wide, 2.2 tall) based at y1-1.2, so its top face
     lands at y1+1.0 — ABOVE both floor finishes, which were sitting at
     y1-0.05 with 0.30 of height (top y1+0.25). That dark cap, not the
     lawn, was what actually read as "the courtyard floor" from above, and
     it buried the garden slab entirely. Everything at floor level is now
     referenced off floorY (just clear of that cap) instead of y1. */
  var floorY = y1 + 1.05;
  var paveInner = cloisterHW + wallT*0.35, paveOuter = outerHW - wallT*0.5;
  var paveSpan = paveOuter - paveInner;
  if(paveSpan > 1){
    var paveCol = shade(wallCol,-0.10);
    for(var pv=0; pv<4; pv++){
      var pvRy = ry + pv*Math.PI/2;
      var pvp = loc(x,z, (paveInner+paveOuter)*0.5, 0, pvRy);
      BOX(pvp[0], floorY-0.30, pvp[1], paveSpan, 0.30, paveOuter*2*0.99, pvRy, paveCol);
    }
  }
  /* brighter than the 0x4f6b3a first used here: the atrium is enclosed by
     a 13-unit wall ring and a full arcade, so it sits in its own shadow
     most of the day and the darker green read as near-black paving from
     above — measured, not guessed (a live instance probe confirmed the
     slab was centred and correctly sized, so colour was the only thing
     left that could make it read wrong). */
  BOX(gardenCx, floorY-0.28, gardenCz, cloisterHW*2*0.99, 0.30, cloisterHW*2*0.99, ry, 0x7da24e, 'plaster');
  for(var g=0; g<12; g++){
    var ga = g*(Math.PI*2/12), gr = cloisterHW*0.74;   /* spread over the full lawn, not the old smaller patch */
    var gpp = loc(gardenCx,gardenCz, Math.cos(ga)*gr, Math.sin(ga)*gr, ry);
    BLOB(gpp[0], floorY+0.10, gpp[1], rr(0.8,1.3), rr(0.8,1.2), rnd()*3, pick(FRUITC), 'leaf');
  }
  monasteryWell(gardenCx, floorY, gardenCz, Math.min(2.4, gardenHW*0.12), ry);
  [-1,1].forEach(function(s){
    var bp = loc(gardenCx,gardenCz, 0, s*gardenHW*0.42, ry+Math.PI/2);
    benchPlain(bp[0], floorY+0.02, bp[1], ry+Math.PI/2, shade(wallCol,-0.1), {});
  });

  return { x:x, z:z, ry:ry, fx:outerHW+4, fz:outerHW+4, gardenCx:gardenCx, gardenCz:gardenCz };
}

