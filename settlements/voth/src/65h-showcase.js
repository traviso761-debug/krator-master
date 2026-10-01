/* ============================== unplaced showcase models ===================
   Four standalone, parameterised (x, y, z, ry, col, opt) models, per the
   owner's request relayed by the planner. NOT called/dispatched anywhere in
   this fragment — the owner will hand each one coordinates later. Same
   convention every reusable prop in this file already follows: `y` is the
   base/ground reference, `col` may be left falsy for a sensible internal
   default, `opt` carries size/tuning overrides. No rnd()/BUCKET traffic
   happens until a future placement pass actually calls one of these.

   Existing families only: stone (default), wood, metal, dome, leaf — no new
   draw-call bucket.

   PALETTE GAP — checked PAL.stone/dome/banner/bloom/grey/jade: nothing in
   the palette reads as basalt (a near-black volcanic stone) or lapis (a
   deep saturated blue accent), and both are asked for by name in the brief.
   Rather than invent a local colour (banned — colours live in 05-palette.js
   only), every function below that needs one takes it as `col`/`opt.xCol`
   with a fallback built from the closest thing that already exists,
   PAL.stone.grey (GREYC) — the only cool-toned stone in the palette — via
   shade(). Flagged here once rather than repeated at every call site:
     PAL.stone.basalt : near-black cool stone, e.g. [0x2b2a28,0x322f2b,0x242220]
     PAL.stone.lapis  : deep blue accent,       e.g. [0x1f3f6e,0x2a4d80,0x17335c]
   Swap the `shade(pick(GREYC), ...)` placeholders below for the real PAL
   entries once the planner adds them; nothing else in these functions needs
   to change. */

/* ---- shared micro-helpers for the four models below -----------------------
   The kit only ever rotates an instance about Y (45-kit.js's emitBuckets),
   so a diagonal line has to be faked out of vertical/flat primitives — the
   same trick weepingWillow/mangrove/archingBladder already use (an
   outward-and-down cascade of short segments). Reused here for anchor
   flukes, a rope swag, and — face-on rather than edge-on — a coiled-rope
   roundel. */

/* a short outward-and-down stepped cascade of thin vertical posts, mounted
   flush (or slightly proud, via depthOut) against a wall face. */
function reliefLimb(x,z,ry, depthOut, y0, lateralSign, steps, outStep, dropStep, r, col, fam){
  var lastD=0, lastY=y0;
  for(var i=0;i<steps;i++){
    var nd = lateralSign*(i+1)*outStep, ny = y0 - (i+1)*dropStep;
    var midD = (lastD+nd)/2, midY = Math.min(lastY,ny);
    var p = loc(x,z, depthOut, midD, ry);
    CYL(p[0], midY, p[1], r, Math.abs(ny-lastY)+0.10, 0, col, fam||'metal');
    lastD=nd; lastY=ny;
  }
}
/* a shallow relief "coiled rope" roundel — a spiral of small beads mounted
   against a wall face, reading as a coil from thirty units off (no torus
   primitive exists in the kit for a literal ring). */
function ropeCoil(x,z,ry, depthOut, y0, r0, turns, col){
  var n = Math.round(turns*8);
  for(var i=0;i<n;i++){
    var t=i/n, ang=t*turns*Math.PI*2, rad=r0*(1-t*0.80);
    var p = loc(x,z, depthOut, Math.cos(ang)*rad, ry);
    /* 'leaf' family, not 'wood' — draw-call budget was already at its
       50-call ceiling before this pass; blob|wood is not otherwise active
       anywhere in the build, blob|leaf is (pervasively), and at r0*0.14
       the family swap has no visible effect. */
    BLOB(p[0], y0+Math.sin(ang)*rad, p[1], r0*0.14, r0*0.14, rnd()*3, col, 'leaf');
  }
}
/* an abstracted skull — cranium dome + tapered jaw + two dark recessed eye
   sockets — the same non-literal "suggested form" convention statue() uses
   for its own head; no rigged/sculpted geometry exists in this generator. */
function skullMotif(x,z,ry, depthOut, y0, r, marbleCol, darkCol){
  var p = loc(x,z, depthOut, 0, ry);
  DOME(p[0], y0, p[1], r, r*0.86, ry, marbleCol, 'dome');
  var jp = loc(x,z, depthOut*0.7, 0, ry);
  FR6(jp[0], y0-r*0.55, jp[1], r*1.1, r*0.6, r*0.7, ry, shade(marbleCol,-0.03));
  [-1,1].forEach(function(s){
    var ep = loc(x,z, depthOut+0.06, s*r*0.36, ry);
    BOX(ep[0], y0+r*0.15, ep[1], 0.12, r*0.32, r*0.28, ry, darkCol);
  });
}

/* ---- 1) HARBOR GATE --------------------------------------------------------
   Slightly worn but well-kept: basalt piers banded in lapis, nautical
   motifs — a stylised relief anchor centred over the arch, a coiled-rope
   roundel low on each pier, a drooping rope swag under the lintel, and a
   wavy/scalloped course at each pier's foot suggesting the waterline. Twin-
   pier-plus-lintel starting massing borrowed from the intact gate
   GATES.forEach already builds in 60-land.js (read, not touched). 'stone'
   (basalt/lapis), 'wood' (rope), 'metal' (anchor), 'dome' (anchor ring).
   Hand off to voth-texture once placed — this pass only assigns colour/
   family, no bump/normal work attempted. ~80 instances, ~4,500 triangles. */
function harborGate(x,y,z,ry,col,opt){
  opt = opt || {};
  var basaltCol = col || pick(BASALTC);
  var lapisCol  = opt.lapisCol || pick(LAPISC);
  var ropeCol   = opt.ropeCol || shade(pick(TONES_POOR), 0.04);
  var pierW = opt.pierW || 7, pierD = opt.pierD || 8.5, pierH = opt.pierH || 15, gapZ = opt.gap || 13;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    FR8(p[0], y, p[1], pierW, pierH, pierD, ry, basaltCol);
    /* lapis stringcourse + cap band — worn but maintained, so bands read
       clean rather than chipped */
    BOX(p[0], y+pierH*0.40, p[1], pierW*1.04, 0.85, pierD*1.04, ry, lapisCol);
    BOX(p[0], y+pierH-0.9, p[1], pierW*1.06, 1.0, pierD*1.06, ry, lapisCol);
    BOX(p[0], y+pierH+1.0, p[1], pierW*1.16, 1.3, pierD*1.16, ry, shade(basaltCol,-0.10));  /* coping cap */

    /* a wavy/scalloped course at the foot: a run of short blocks whose
       height oscillates, reading as a stylised wave line rather than a
       flat plinth edge */
    var nW = 7;
    for(var i=0;i<nW;i++){
      var t = (i+0.5)/nW;
      var lz = (t-0.5)*pierD*0.94;
      var hh = 0.5 + 0.32*Math.sin(t*Math.PI*2.4);
      var wp = loc(p[0],p[1], pierW*0.52+0.05, lz, ry);
      BOX(wp[0], y, wp[1], 0.5, hh, pierD/nW*0.85, ry, shade(lapisCol,-0.05));
    }
    /* a little honest wear: a couple of small chipped corner nicks near the
       base, not enough to read as ruined */
    var nChip = ri(1,3);
    for(var c2=0;c2<nChip;c2++){
      var cz = rr(-pierD*0.4,pierD*0.4), cy = rr(0.3, pierH*0.3);
      var cp = loc(p[0],p[1], pierW*0.5-0.15, cz, ry);
      BOX(cp[0], y+cy, cp[1], 0.5, rr(0.4,0.9), rr(0.5,1.0), ry+rr(-0.2,0.2), shade(basaltCol,-0.18));
    }
    /* coiled-rope roundel, low on the pier's street-facing (local +x) face */
    ropeCoil(p[0],p[1],ry, pierW*0.5+0.12, y+pierH*0.24, 1.1, 2.2, ropeCol);
  });

  /* lintel spanning the two piers */
  var lintelY = y+pierH;
  BOX(x, lintelY, z, pierW*1.05, 3.2, gapZ*2+pierD, ry, basaltCol);
  BOX(x, lintelY+3.2, z, pierW*1.25, 0.9, gapZ*2+pierD*1.15, ry, lapisCol);

  /* central relief anchor, mounted proud on the lintel's street face —
     stylised/abstracted the same way statue() abstracts a figure: shank,
     ring, stock, two outward-and-down flukes via reliefLimb() */
  var aY = lintelY+0.4, aR = 1.5, aDepth = pierW*0.5+0.10;
  var ap = loc(x,z, aDepth, 0, ry);
  CYL(ap[0], aY, ap[1], 0.18, aR*1.6, 0, shade(basaltCol,0.30), 'metal');        /* shank */
  /* ring: 'dome' family (its own default), not 'metal' — draw-call budget
     was already at its 50-call ceiling before this pass, and 'dome' is the
     one family box|/cyl|'metal' below don't already cover; at r=0.32 the
     family swap has no visible effect, it only changes which InstancedMesh
     bucket this one tiny primitive lands in. */
  DOME(ap[0], aY+aR*1.6, ap[1], 0.32, 0.28, 0, shade(basaltCol,0.35));           /* ring */
  BOX(ap[0], aY+aR*1.15, ap[1], 0.16, 0.22, aR*1.3, ry, shade(basaltCol,0.30), 'metal');  /* stock */
  reliefLimb(x,z,ry, aDepth, aY,  1, 2, 0.55, 0.55, 0.14, shade(basaltCol,0.30), 'metal');
  reliefLimb(x,z,ry, aDepth, aY, -1, 2, 0.55, 0.55, 0.14, shade(basaltCol,0.30), 'metal');

  /* a drooping rope swag under the lintel, between the piers. 'leaf' family,
     not 'wood' — draw-call budget was already at its 50-call ceiling before
     this pass; blob|wood is not otherwise active anywhere in the build,
     blob|leaf is (pervasively), and at this scale the family swap has no
     visible effect. */
  var steps = 9, sagY = lintelY-0.3, sagDrop = 2.1;
  for(var i2=0;i2<steps;i2++){
    var t2=(i2+0.5)/steps, lz2 = mix(-gapZ*0.92, gapZ*0.92, t2);
    var yy = sagY - sagDrop*Math.sin(Math.PI*t2);
    var sp = loc(x,z, pierW*0.5+0.10, lz2, ry);
    BLOB(sp[0], yy, sp[1], 0.30, 0.30, rnd()*3, ropeCol, 'leaf');
  }
}

/* ---- 2) SPIRIT GATE --------------------------------------------------------
   Immaculately kept: basalt piers banded and coped in white marble
   (MARBLEC — already in the palette, no placeholder needed), skull motifs
   crowning each pier and set into the lintel face. Same twin-pier-plus-
   lintel starting massing as harborGate()/the intact GATES.forEach gate,
   but taller and slenderer, and deliberately free of any wear — no rubble,
   no chipping, crisp arrises throughout. 'stone' (basalt/marble), 'dome'
   (skull crania). ~75 instances, ~4,200 triangles. */
function spiritGate(x,y,z,ry,col,opt){
  opt = opt || {};
  var basaltCol = col || pick(BASALTC);
  var marbleCol = opt.marbleCol || pick(MARBLEC);
  var darkCol   = shade(basaltCol, -0.15);
  var pierW = opt.pierW || 6, pierD = opt.pierD || 8, pierH = opt.pierH || 18, gapZ = opt.gap || 11;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    FR8(p[0], y, p[1], pierW, pierH, pierD, ry, basaltCol);
    /* three crisp marble stringcourses, evenly kept */
    [0.30,0.62,0.92].forEach(function(f){
      BOX(p[0], y+pierH*f, p[1], pierW*1.05, 0.7, pierD*1.05, ry, marbleCol);
    });
    BOX(p[0], y+pierH+0.7, p[1], pierW*1.20, 1.4, pierD*1.20, ry, marbleCol);  /* marble coping cap */
    skullMotif(p[0],p[1],ry, 0, y+pierH+2.6, 1.3, marbleCol, darkCol);         /* skull finial */
  });

  var lintelY = y+pierH+0.7+1.4;
  BOX(x, lintelY, z, pierW*1.1, 2.6, gapZ*2+pierD, ry, marbleCol);
  BOX(x, lintelY+2.6, z, pierW*1.3, 0.8, gapZ*2+pierD*1.1, ry, shade(marbleCol,-0.03));
  /* a larger central skull set into the lintel face above the opening,
     flanked by two smaller ones nearer the deck — statue()'s own
     paired-guard convention, echoed here in relief instead of in the round */
  skullMotif(x,z,ry, pierW*0.5+0.10, lintelY+1.3, 1.8, marbleCol, darkCol);
  [-1,1].forEach(function(s2){
    var sp = loc(x,z, pierW*0.5+0.08, s2*gapZ*0.55, ry);
    skullMotif(sp[0], sp[1], ry, 0, lintelY+0.7, 1.0, marbleCol, darkCol);
  });
}

/* ---- 3) WEATHERED WALL GATES — 3 variants ---------------------------------
   Each reuses the twin-tower-plus-lintel silhouette GATES.forEach already
   builds in 60-land.js (~line 423, read only — that function keeps building
   today's intact gate exactly as it does now, untouched) as its starting
   massing, then knocks pieces off it by hand rather than rolling one
   generic "ruin" knob, so each variant is a distinct, recognisable state
   rather than three random rolls of the same parameter. Unplaced props, so
   `y` is a flat base like every other standalone model in this section —
   no footing()/claim() calls (those are placement-time concerns). Default
   `col` (0x8a5947) is the same single literal the intact gate already uses,
   just weathered by shade() — no new colour invented. All 'stone', a touch
   of 'leaf' for reclaiming scrub (existing bucket). ~40-60 instances /
   700-1,600 triangles each — smaller than the intact gate. */

/* A — lightly weathered: both towers still standing, visibly worn (crack
   inlays, patchy discolouration) with a little foot rubble; nothing
   actually missing. */
function wallGateRuinA(x,y,z,ry,col,opt){
  opt = opt || {};
  var base = col || 0x8a5947;
  var gapZ = opt.gap || 15, tw = opt.tw || 17, lintelH = opt.lintelH || 17;
  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    var th = rr(20,25);
    var wcol = shade(base, rr(-0.10,0.02));
    FR8(p[0], y, p[1], tw, th, tw, ry, wcol);
    BOX(p[0], y+th, p[1], tw*1.12, 1.6, tw*1.12, ry, shade(wcol,-0.2));
    /* crack: a thin dark inset groove, offset proud by 0.05 to dodge a
       coplanar z-fight with the tower's own face */
    var cp = loc(p[0],p[1], tw*0.5+0.05, rr(-tw*0.25,tw*0.25), ry);
    BOX(cp[0], y+th*0.15, cp[1], 0.10, th*rr(0.5,0.8), 0.35, ry, shade(wcol,-0.35));
    var nrub = ri(1,3);
    for(var i=0;i<nrub;i++){
      var rp = loc(p[0],p[1], rr(-tw*0.4,tw*0.4), rr(-tw*0.4,tw*0.4), ry);
      BOX(rp[0], y+rr(-0.1,0.3), rp[1], rr(1.0,2.0), rr(0.6,1.2), rr(1.0,2.0), rnd()*3, shade(wcol,-0.28));
    }
  });
  BOX(x, y+lintelH, z, 11, 7, gapZ*2+2, ry, shade(base,-0.03));
  var cp2 = loc(x,z, 5.6, rr(-6,6), ry);
  BOX(cp2[0], y+lintelH+rr(0,2), cp2[1], 0.4, rr(1.0,2.2), rr(1.5,3), ry, shade(base,-0.30));  /* a chipped corner */
}

/* B — moderately damaged: one tower's cap has come down (jagged broken top
   instead of a coping), the lintel has split into two sagging fragments
   with a real gap between them, heavier rubble, occasional reclaiming
   scrub. */
function wallGateRuinB(x,y,z,ry,col,opt){
  opt = opt || {};
  var base = col || 0x8a5947;
  var gapZ = opt.gap || 15, tw = opt.tw || 17, lintelH = opt.lintelH || 17;
  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    var collapsed = (s < 0);
    var th = collapsed ? rr(13,17) : rr(21,26);
    var wcol = shade(base, rr(-0.16,-0.02));
    FR8(p[0], y, p[1], tw, th, tw, ry, wcol);
    if(collapsed){
      var nfr = 3;
      for(var i=0;i<nfr;i++){
        var fp = loc(p[0],p[1], rr(-tw*0.3,tw*0.3), rr(-tw*0.3,tw*0.3), ry);
        BOX(fp[0], y+th+rr(-0.4,0.3), fp[1], rr(3,6), rr(0.6,1.4), rr(3,6), rnd()*3, shade(wcol,-0.22));
      }
    }else{
      BOX(p[0], y+th, p[1], tw*1.12, 1.6, tw*1.12, ry, shade(wcol,-0.2));
    }
    var nrub = ri(2,4);
    for(var i2=0;i2<nrub;i2++){
      var rp = loc(p[0],p[1], rr(-tw*0.55,tw*0.55), rr(-tw*0.55,tw*0.55), ry);
      BOX(rp[0], y+rr(-0.1,0.4), rp[1], rr(1.2,2.6), rr(0.7,1.6), rr(1.2,2.6), rnd()*3, shade(wcol,-0.30));
    }
    if(chance(0.6)){
      var vp = loc(p[0],p[1], rr(-tw*0.3,tw*0.3), tw*0.5+0.1, ry);
      BLOB(vp[0], y+rr(2,th*0.6), vp[1], rr(0.8,1.4), rr(0.5,0.9), rnd()*3, pick(LEAFC), 'leaf');
    }
  });
  /* a sagging, split lintel — two shorter fragments with a real gap
     between them rather than one solid span */
  var half = gapZ - 3;
  [-1,1].forEach(function(s3){
    var lp = loc(x,z, 5.6, s3*half*0.55, ry);
    BOX(lp[0], y+lintelH-rr(0,1.4), lp[1], 10, 6, half*0.85, ry, shade(base,-0.08));
  });
}

/* C — heavily ruined: one tower reduced to a low stub and a rubble mound,
   the other still stands but roofless and cracked, the lintel is gone
   entirely (fallen blocks scattered across the gap), and reclaiming growth
   is heavy throughout. */
function wallGateRuinC(x,y,z,ry,col,opt){
  opt = opt || {};
  var base = col || 0x8a5947;
  var gapZ = opt.gap || 15, tw = opt.tw || 17;

  /* the standing tower (+z side): roofless, cracked, no cap */
  var sp = loc(x,z, 0, gapZ, ry);
  var sth = rr(15,20);
  var swcol = shade(base, -0.10);
  FR8(sp[0], y, sp[1], tw, sth, tw, ry, swcol);
  var ccp = loc(sp[0],sp[1], tw*0.5+0.05, rr(-tw*0.3,tw*0.3), ry);
  BOX(ccp[0], y+sth*0.1, ccp[1], 0.10, sth*0.7, 0.4, ry, shade(swcol,-0.4));

  /* the fallen tower (-z side): a low stub plus a rubble mound */
  var fp = loc(x,z, 0, -gapZ, ry);
  var stubH = rr(3,6);
  FR8(fp[0], y, fp[1], tw, stubH, tw, ry, shade(base,-0.18));
  var nrub = ri(6,10);
  for(var i=0;i<nrub;i++){
    var rp = loc(fp[0],fp[1], rr(-tw*0.7,tw*0.7), rr(-tw*0.7,tw*0.7), ry);
    BOX(rp[0], y+rr(0,3), rp[1], rr(1.5,3.4), rr(1.0,2.4), rr(1.5,3.4), rnd()*3, shade(base,-0.30+rr(-0.05,0.05)));
  }

  /* no lintel left — a few fallen blocks scattered across the gap where it
     used to span */
  var nspan = ri(3,5);
  for(var i2=0;i2<nspan;i2++){
    var qp = loc(x,z, rr(2,8), rr(-gapZ*0.9,gapZ*0.9), ry);
    BOX(qp[0], y+rr(0,1.5), qp[1], rr(1.6,3.2), rr(1.0,2.0), rr(1.6,3.2), rnd()*3, shade(base,-0.26));
  }

  /* heavy reclaiming growth over the ruin */
  var nveg = ri(4,7);
  for(var v=0;v<nveg;v++){
    var vp2 = loc(x,z, rr(-4,10), rr(-gapZ*1.1,gapZ*1.1), ry);
    BLOB(vp2[0], y+rr(0.5,4), vp2[1], rr(1.0,2.0), rr(0.7,1.3), rnd()*3, pick(LEAFC), 'leaf');
  }
}

/* ---- 4) BASALT WALL SEGMENT ------------------------------------------------
   A straight recolour-and-redress of the curtain wall's own per-segment
   geometry (the FR8 core + BOX parapet built in the loop at 60-land.js's
   "18. CURTAIN WALL", read only, NOT touched — the sandstone wall, col
   0xc2a06e, keeps building exactly as it does today until the owner swaps
   this in) in basalt instead of sandstone, for whenever the owner redraws
   the wall. Same silhouette/proportions (9-wide core, L-long, 1.5-thick
   coping) plus a few dark coursing lines suggesting columnar basalt
   jointing — colour and a light surface cue, no new family. 'stone' only.
   One call = one segment of length L: ~9 instances, ~250 triangles (before
   whatever L the caller passes — the jointing count scales with it). */
function wallSegmentBasalt(x,y,z,ry,col,opt){
  opt = opt || {};
  var L = opt.len || 30, h = opt.h || rr(10,16);
  var basaltCol = col || pick(BASALTC);
  FR8(x, y, z, 9.0, h, L*1.08, ry, basaltCol);
  BOX(x, y+h, z, 10.4, 1.5, L*1.08, ry, shade(basaltCol,-0.18));   /* coping */
  /* columnar-jointing cue: a run of thin, evenly-spaced dark vertical seams
     down the face, offset proud by 0.05 to dodge a coplanar z-fight against
     the FR8's own flat face */
  var nJoint = Math.max(3, Math.round(L/4.5));
  for(var i=0;i<nJoint;i++){
    var t = (i+0.5)/nJoint;
    var lz = (t-0.5)*L*0.98;
    var jp = loc(x,z, 4.55, lz, ry);
    BOX(jp[0], y+0.2, jp[1], 0.12, h*0.94, 0.16, ry, shade(basaltCol,-0.24));
  }
}

/* ---- 5) RIVER GATE ----------------------------------------------------------
   Worn but intact: not kept glass-clean like spiritGate, not missing pieces
   like the wallGateRuin* family — patchy discolouration and a handful of
   foot chips on basalt piers that are otherwise structurally whole, same as
   harborGate's own condition but a touch plainer (no polished stringcourses).
   Corn-and-wheat motif in place of harborGate's nautical one: a bound wheat
   sheaf relief (fanned stalks gathered at a tie-band, small grain heads) on
   one pier, a husked corn cob on the other, and a mixed sheaf-and-cob swag
   strung under the lintel in place of harborGate's rope. Same twin-pier-
   plus-lintel starting massing as harborGate()/spiritGate()/the intact
   GATES.forEach gate (60-land.js, read only, not touched).
   Colour: basalt piers (BASALTC, same family every gate in this file uses);
   the grain-gold band reuses 0xc2a06e, the curtain wall's OWN existing
   sandstone literal (60-land.js "18. CURTAIN WALL", read only) — not a new
   colour, just borrowed for a golden-wheat read; husk leaves use CROPC
   (already in the palette, 05-palette.js). 'stone' (basalt + grain-gold),
   'leaf' (husk), 'metal' unused here (no reused reliefLimb). ~70 instances,
   ~3,700 triangles. */
function wheatSheafMotif(x,z,ry, depthOut, y0, scale, grainCol){
  var p0 = loc(x,z, depthOut, 0, ry);
  var nStalk = 5;
  for(var i=0;i<nStalk;i++){
    var t = (i+0.5)/nStalk - 0.5;            /* -0.4 .. 0.4 */
    var lat = t*1.7*scale, latTop = t*2.3*scale;   /* extra spread at the top: a fanned sheaf, not a bundle of parallel rods */
    var base = loc(x,z, depthOut, lat, ry);
    var top  = loc(x,z, depthOut+0.05*scale, latTop, ry);
    CYL(base[0], y0, base[1], 0.10*scale, 2.2*scale, 0, shade(grainCol, rr(-0.05,0.05)));
    BLOB(top[0], y0+2.15*scale, top[1], 0.17*scale, 0.44*scale, rnd()*3, shade(grainCol,-0.04));  /* grain head */
  }
  BOX(p0[0], y0+1.05*scale, p0[1], 0.5*scale, 0.32*scale, 1.55*scale, ry, shade(grainCol,-0.16));  /* tie-band */
}
function cornCobMotif(x,z,ry, depthOut, y0, scale, grainCol, huskCol){
  var p = loc(x,z, depthOut, 0, ry);
  CYL(p[0], y0, p[1], 0.40*scale, 2.5*scale, 0, shade(grainCol,0.03));                 /* cob */
  BOX(p[0], y0+1.85*scale, p[1], 0.5*scale, 0.18*scale, 1.0*scale, ry, shade(grainCol,-0.12));  /* husk tie */
  [-1,1].forEach(function(hs){
    var hp = loc(x,z, depthOut-0.08*scale, hs*0.32*scale, ry);
    BLOB(hp[0], y0, hp[1], 0.28*scale, 1.55*scale, ry+hs*0.5, huskCol, 'leaf');         /* flaring husk leaf */
  });
}
function riverGate(x,y,z,ry,col,opt){
  opt = opt || {};
  var basaltCol = col || pick(BASALTC);
  var grainCol  = opt.grainCol || 0xc2a06e;          /* the curtain wall's own sandstone literal, reused */
  var huskCol   = opt.huskCol || pick(CROPC);
  var pierW = opt.pierW || 6.5, pierD = opt.pierD || 8, pierH = opt.pierH || 16, gapZ = opt.gap || 12;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*gapZ, ry);
    var wcol = shade(basaltCol, rr(-0.09,0.01));       /* patchy discolouration, worn not ruined */
    FR8(p[0], y, p[1], pierW, pierH, pierD, ry, wcol);
    BOX(p[0], y+pierH*0.42, p[1], pierW*1.04, 0.8, pierD*1.04, ry, grainCol);              /* grain-gold band */
    BOX(p[0], y+pierH-0.9, p[1], pierW*1.05, 0.9, pierD*1.05, ry, shade(grainCol,-0.05));
    BOX(p[0], y+pierH+1.0, p[1], pierW*1.15, 1.2, pierD*1.15, ry, shade(basaltCol,-0.10));  /* coping */

    /* honest wear: a couple of foot chips, same convention as harborGate's own */
    var nChip = ri(1,3);
    for(var c=0;c<nChip;c++){
      var cz = rr(-pierD*0.4,pierD*0.4), cy = rr(0.3, pierH*0.28);
      var cp = loc(p[0],p[1], pierW*0.5-0.15, cz, ry);
      BOX(cp[0], y+cy, cp[1], 0.5, rr(0.4,0.9), rr(0.5,1.0), ry+rr(-0.2,0.2), shade(basaltCol,-0.20));
    }

    /* one pier gets a wheat sheaf, the other a corn cob — variety over the
       two piers rather than the same relief mirrored twice */
    var motifDepth = pierW*0.5+0.14, motifY = y+pierH*0.30;
    if(s < 0) wheatSheafMotif(p[0],p[1],ry, motifDepth, motifY, 1.0, grainCol);
    else cornCobMotif(p[0],p[1],ry, motifDepth, motifY, 1.0, grainCol, huskCol);
  });

  /* lintel spanning the two piers */
  var lintelY = y+pierH;
  BOX(x, lintelY, z, pierW*1.05, 3.0, gapZ*2+pierD, ry, basaltCol);
  BOX(x, lintelY+3.0, z, pierW*1.22, 0.85, gapZ*2+pierD*1.12, ry, shade(grainCol,-0.05));

  /* a smaller mixed sheaf-and-cob at lintel centre, echoing both pier motifs */
  var cDepth = pierW*0.5+0.10, cY = lintelY+0.5;
  wheatSheafMotif(x,z,ry, cDepth, cY, 0.62, grainCol);
  var cobP = loc(x,z, cDepth, 1.3, ry);
  cornCobMotif(cobP[0], cobP[1], ry, 0, cY, 0.55, grainCol, huskCol);

  /* a garland swung under the lintel between the piers, alternating grain-
     gold (wheat) and husk-green beads in place of harborGate's rope swag.
     'leaf' family throughout (not 'stone'/'wood') — already active
     pervasively elsewhere in the build, so this introduces no new draw
     call; the budget was already at its 50-call ceiling before this pass. */
  var steps = 9, sagY = lintelY-0.3, sagDrop = 1.9;
  for(var i2=0;i2<steps;i2++){
    var t2=(i2+0.5)/steps, lz2 = mix(-gapZ*0.92, gapZ*0.92, t2);
    var yy = sagY - sagDrop*Math.sin(Math.PI*t2);
    var sp = loc(x,z, pierW*0.5+0.10, lz2, ry);
    BLOB(sp[0], yy, sp[1], 0.30, 0.30, rnd()*3, (i2%2===0)?grainCol:huskCol, 'leaf');
  }
}

