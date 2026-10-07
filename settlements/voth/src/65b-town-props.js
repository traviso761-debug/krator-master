/* ============================== town buildings ============================== */
function townFacade(p){
  var x=p.x, z=p.z, ry=p.ry, fx0=p.fx0, fz0=p.fz0, yb=p.yb, h=p.h, kind=p.kind, col=p.col, poor=p.poor;
  var doorCol = shade(pick(ROOFS), rr(-0.06,0.06));
  var winCol  = shade(col, -0.55);

  /* --- door, always, centred on the street-facing (local +x) face --- */
  var dw = poor ? rr(1.5,2.0) : rr(1.8,2.4);
  var dh = poor ? rr(2.6,3.2) : rr(3.0,3.9);
  dw = Math.min(dw, fz0*0.9); dh = Math.min(dh, h*0.55);
  var dp = loc(x,z, fx0+0.05, 0, ry);
  BOX(dp[0], yb, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  FJ.town++;

  if(poor){
    PLASTER_STAT.buildings++;
    /* owner: "ALL of them get at least 4 windows and 1 chimney" — plaster
       town buildings (poor === true; the stone/wealthy branch below is
       untouched). Unconditional, not chance()-gated, and sized by formula
       (not wallWindow's own clamp-and-maybe-fail) so all 4 are a real
       guarantee down to the smallest hovel footprint: 2 on the front face
       flanking the door, sized as a fraction of the space actually left
       past the door so they mathematically cannot fail to fit, and 2 on
       the blank rear (local -x) face, which never has a door to dodge. */
    var winYp = yb + rr(1.3,2.1);
    var avail = Math.max(0.6, fz0 - dw*0.5);        /* clear space beside the door, one side */
    var fww = Math.min(0.8, avail*0.55);             /* front window width — always < avail */
    var flat = dw*0.5 + fww*0.5 + Math.min(0.3, avail*0.2);
    [-1,1].forEach(function(s){
      var fp = loc(x,z, fx0+0.05, s*flat, ry);
      WINBOX(fp[0], winYp, fp[1], 0.4, rr(0.8,1.15), fww, ry, winCol);
      FJ.town++;
    });
    var winYr = yb + rr(1.3,2.1);
    var rww = Math.min(0.75, fz0*0.45);
    var rlat = fz0 - rww*0.5 - Math.min(0.25, fz0*0.15);
    [-1,1].forEach(function(s){
      var rp = loc(x,z, -fx0-0.05, s*rlat, ry);
      WINBOX(rp[0], winYr, rp[1], 0.4, rr(0.75,1.1), rww, ry, winCol);
      FJ.town++;
    });

    /* 1-in-10: a genuine 2nd storey, stepped in slightly (echoes the
       hlaalu step-back), with its own 4 windows (same front+rear pattern,
       no door to dodge up here so both pairs always fit). Computed before
       the chimney below so the chimney can sit on the true roofline when
       one is added. */
    var topY = yb + h, topFx = fx0, topFz = fz0, floorH = h, floorBaseY = yb;
    if(plasterHash(x,z,9.13) < FACADE.plasterSecondStoreyChance){
      PLASTER_STAT.secondStorey++;
      var h2 = rr(3.2,5.5);
      var fx2 = fx0*rr(0.82,0.94), fz2 = fz0*rr(0.82,0.94);
      var y2 = yb + h;
      BOX(x, y2, z, fx2*2, h2, fz2*2, ry, shade(col,-0.04), 'plaster');
      BOX(x, y2+h2-0.6, z, fx2*2*1.05, 1.4, fz2*2*1.05, ry, shade(col,-0.15), 'plaster');
      FJ.town += 2;
      /* its own 4 windows, guaranteed-fit by formula (no door up here to
         dodge, so front and rear are the same placement) — mirrors the
         base storey's own guarantee above */
      var winY2 = y2 + rr(1.1,1.8);
      var ww2 = Math.min(0.75, fz2*0.45);
      var lat2 = fz2 - ww2*0.5 - Math.min(0.25, fz2*0.15);
      [1,-1].forEach(function(fx2sign){
        [-1,1].forEach(function(s){
          var wp2 = loc(x,z, fx2sign*(fx2+0.05), s*lat2, ry);
          WINBOX(wp2[0], winY2, wp2[1], 0.4, 0.8, ww2, ry, winCol);
          FJ.town++;
        });
      });
      topY = y2 + h2 + 1.4; topFx = fx2; topFz = fz2; floorH = h2; floorBaseY = y2;
    }

    /* the chimney — fr3|stone, an already-spent bucket (see the blacksmith
       forge in 50-cantons.js) and, at 12 triangles against a 10-segment
       cylinder's 40, the cheap option: 677 plaster buildings each getting
       one unconditionally is real money against this build's own triangle
       ceiling. Set back toward a rear corner so it clears the door/window
       front. ~25% smoke: these are now REAL particles on the shared smoke
       rig at the top of this file — the same one the blacksmith's forge
       uses — not the single static BLOB that used to sit here. Sharing one
       InstancedMesh is what makes converting the whole town affordable:
       160 chimneys x 5 puffs is 800 more instances on a mesh that was
       already being drawn for the forge, so the town's smoke costs zero
       extra draw calls. Selection is still the position hash (not
       chance()) per the brief's own "at any one time" — the same ~25%
       smoke on every rebuild rather than reshuffling whenever an unrelated
       rnd() draw shifts elsewhere in the build. */
    var chimSide = chance(0.5) ? 1 : -1;
    var cp = loc(x,z, -topFx*0.55, topFz*0.55*chimSide, ry);
    var chimW = Math.max(0.7, fx0*0.13), chimH = rr(2.2,3.8);
    FR3(cp[0], topY, cp[1], chimW, chimH, chimW, ry, shade(col,-0.32));
    FJ.town++;
    if(plasterHash(x,z,17.61) < FACADE.plasterSmokeChance){
      PLASTER_STAT.smoking++;
      /* real particles now (registerSmokeEmitter, above) instead of the one
         static BLOB that used to sit here — all ~160 smoking chimneys share
         the forge's single citywide InstancedMesh, so converting the town
         costs no draw call on top of the forge's one. A domestic hearth is
         the quiet end of the range: a 4-puff pool, a short climb and a pale
         warm grey, against the forge's 15 puffs of near-black soot.
         The 7 rr() draws the retired BLOB line made are made here in the
         same order and over the same ranges — but genuinely USED now, as
         this chimney's own variation — so this pass leaves the fragment's
         PRNG stream, and everything townFacade() emits after it,
         bit-identical. */
      var smJx = rr(-0.3,0.3), smLift = rr(1.4,2.6), smJz = rr(-0.3,0.3);
      var smR0 = rr(1.5,2.1), smR1 = rr(1.9,2.7), smPh = rr(0,Math.PI*2), smPale = rr(0.35,0.55);
      registerSmokeEmitter(cp[0]+smJx, topY + chimH + 0.35, cp[1]+smJz, {
        kind:'chimney', n:5, life:5.0 + smLift*0.9, rise:6.0 + smLift*1.3,
        r0:smR0*0.30, r1:smR1*0.86, spread:0.34, sway:0.40, swirl:0.75,
        /* a touch darker than the retired blob's own tone: these read
           against dark warren roofs and packed brown ground, and a pale
           puff there popped as white rather than as smoke */
        lean:0.55, phase:smPh, col:shade(PAL.smoke.hearth.body, smPale*0.30 - 0.12)
      });
    }

    /* owner: "the building-top canopies are misaligned... rotated 90
       degrees... you made umbrella canopies. i wanted more a middle
       eastern style square cloth shade... they should look pretty
       similar to the market stalls." Real redesign, not just an axis
       fix: the old shape was a vertical BOX hung flush against the wall
       (fixed top edge, swaying free edge, like a flag/banner) — that's
       what read as a stiff panel sticking up off the roofline ("umbrella"
       reads as: thin flat panel at a jaunty angle, not a flat horizontal
       shade). Replaced with the exact marketDeck() stall-canopy idiom
       (50-cantons.js: a shallow FR8 sitting flat on top of the stall,
       wider than the stall itself) — here sitting flat on top of the
       building's own roofline instead, wide enough to overhang all 4
       walls a little, same 'cloth'/BANNERC bucket (already spent by the
       market stalls/banners elsewhere), zero new draw calls. Also now
       skips domed buildings per the owner's follow-up ("exclude buildings
       with domes from having roof canopies") — a flat square cloth
       sitting on a dome would clip straight through the curve.

       owner's 2nd follow-up: "in most cases the new canopy shade is
       flush with the roof. They should be about 1.5 citizens high - make
       poles to hold them up if not there already." Real bug: topY+0.15
       sat the cloth almost directly on the roofline, reading as flush
       rather than a raised shade structure, and there were no poles at
       all (the market-stall version doesn't need poles because the
       stall's own BOX body IS the support; a building's flat roof has
       nothing playing that role). A standing citizen's own merged
       geometry is 2.576 world units tall (LIFE_PEOPLE_SCALE=2.8's real
       measured extent — see lifePersonGeo's own bounding-box comment,
       78-life.js, around the boat-canopy clearance bug) — "1.5 citizens"
       is therefore a real clearance of ~3.86 units between the roofline
       and the underside of the cloth, not a guess. 4 corner poles
       (cyl|wood, already a spent bucket) now actually lift it there.
       Also widened the cloth itself: topFx*1.9/topFz*1.9 as FULL FR8
       width/depth args against topFx/topFz being HALF-extents worked out
       to a canopy slightly NARROWER than the building itself (topFx*1.9
       < topFx*2) — backwards from "wider than the stall, real overhang".
       Fixed to topFx*2*1.15/topFz*2*1.15 (a real ~15% overhang past the
       walls on every side, full-extent-correct this time).
       Chance raised 50% -> 66% per the owner's "make 66% of non-domed
       plaster buildings have one" (FACADE.plasterCanopyChance, below). */
    if(kind !== 'domed' && plasterHash(x,z,3.77) < FACADE.plasterCanopyChance){
      PLASTER_STAT.canopy++;
      var poleClear = 2.576*1.5;
      var canopyY = topY + poleClear;
      var poleInX = topFx*0.80, poleInZ = topFz*0.80;
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cs){
        var pp = loc(x,z, cs[0]*poleInX, cs[1]*poleInZ, ry);
        CYL(pp[0], topY, pp[1], 0.14, poleClear, 0, shade(pick(BANNERC),-0.35), 'wood');
        FJ.town++;
      });
      FR8(x, canopyY, z, topFx*2*1.15, 0.7, topFz*2*1.15, ry, vothPatCol('kilim', pick(BANNERC)), 'kilim');
      FJ.town++;
    }

    if(chance(FACADE.slumAdditionChance)) slumAddition(p);
    return;
  }

  /* --- non-poor: two flanking windows on the front face --- */
  var winY = yb + Math.min(h*0.32, rr(2.4,3.4));
  [-1,1].forEach(function(s){
    if(wallWindow(x,z,ry,fx0,fz0,winY,dw*0.5,winCol, s, 1.1,1.7, 1.3,1.9)) FJ.town++;
  });

  /* second-row window, centred above the door — domed only: hlaalu and
     velothi step/taper each level with an unrecoverable random jog, so
     fx0/fz0 is only exact at ground level for them; domed keeps its
     footprint all the way to the roofline. */
  if(kind === 'domed' && h > 10 && chance(FACADE.winChanceUpper)){
    var up = loc(x,z, fx0+0.05, 0, ry);
    WINBOX(up[0], yb+Math.min(h*0.6, rr(6,9)), up[1], 0.4, rr(1.1,1.5), Math.min(rr(1.3,1.9),fz0*0.7), ry, winCol);
    FJ.town++;
  }

  /* a window round the side, on buildings deep enough to have one */
  if(fx0 > 8 && chance(FACADE.winChanceSide)){
    var side = chance(0.5) ? 1 : -1;
    var sp = loc(x,z, rr(-0.3,0.3)*fx0, side*(fz0+0.05), ry);
    WINBOX(sp[0], winY, sp[1], Math.min(rr(1.1,1.6), fx0*0.5), rr(1.2,1.8), 0.4, ry, winCol);
    FJ.town++;
  }

  /* chimney / roof clutter — kept off domed roofs, and placed near the
     footprint rather than trusting the (unrecoverable) upper-level offsets */
  if(kind !== 'domed' && chance(FACADE.chimneyChance)){
    var cx = x + rr(-fx0*0.35,fx0*0.35), cz = z + rr(-fz0*0.35,fz0*0.35);
    CYL(cx, yb+h*0.82, cz, rr(0.5,0.9), rr(2.5,5), 0, shade(col,-0.22));
    FJ.town++;
  }

  /* a proper sloped canopy-awning over the door on the grander houses */
  var grand = kind==='domed' || kind==='velothi' || h > FACADE.grandHeight;
  if(grand && chance(FACADE.awningChance)) doorAwning(x,z,ry,fx0,dw,dh,yb,doorCol);
}

PLACED.forEach(function(p){
  if(p.tag === 'town') townFacade(p);
});
window._plasterFacade = PLASTER_STAT;

/* ============================== other footprints ==============================
   Everything shed()-built (shed/warehouse/barn/rshed) already carries its own
   loading door. Only the small velothi outbuildings round the lesser
   compounds have none, so that is the only other tag worth a facade here. */
PLACED.forEach(function(p){
  if(p.tag !== 'velothi-out') return;
  var halfX = Math.max(1.5, p.fx - 2.5), halfZ = Math.max(1.5, p.fz - 2.5);
  var yb = terrainH(p.x, p.z);
  var dw = Math.min(rr(1.3,1.8), halfZ*0.9), dh = rr(2.4,3.0);
  var dp = loc(p.x, p.z, halfX+0.05, 0, p.ry);
  BOX(dp[0], yb, dp[1], 0.4, dh, dw, p.ry, shade(pick(ROOFS),-0.05), 'wood');
  FJ.other++;
});

/* ============================== compounds ============================== */
function compoundFacade(c){
  var ry=c.ry, wallFx=c.wallFx, wallFz=c.wallFz, wallH=c.wallH, wallCol=c.wallCol;

  /* the true wall centre O sits gateOffFrac*wallFx behind the COMPOUNDS
     record (c is the garden patch, already offset toward the gate); the
     gate itself sits roughly (1-gateOffFrac)*wallFx ahead of c */
  var O = loc(c.x, c.z, -FACADE.gateOffFrac*wallFx, 0, ry);
  var gateLX = wallFx*(1-FACADE.gateOffFrac);

  /* gate awning: the same stepped, sloping canopy as the town doors, sized
     up, straddling the gate opening on posts */
  var steps=3, outStep=wallFz*0.10, drop=0.9, wLoss=wallFz*0.16;
  var outBase = gateLX - 0.4, topY = c.y + wallH*1.5 + 2.0, wBase = wallFz*0.78;
  var lastOutX=outBase, lastY=topY, lastW=wBase;
  for(var i=0;i<steps;i++){
    var outX = outBase + i*outStep, yy = topY - i*drop, ww = Math.max(wallFz*0.18, wBase - i*wLoss);
    var gp2 = loc(c.x,c.z, outX, 0, ry);
    FR8(gp2[0], yy, gp2[1], outStep+0.6, 0.9, ww, ry, pick(ROOFS), 'roof');
    lastOutX=outX; lastY=yy; lastW=ww;
    FJ.compound++;
  }
  [-1,1].forEach(function(s){
    var pp = loc(c.x,c.z, lastOutX+0.8, s*lastW*0.46, ry);
    CYL(pp[0], c.y, pp[1], 0.28, lastY - c.y, 0, shade(wallCol,-0.1), 'wood');
    FJ.compound++;
  });

  /* corner finials on the four wall towers */
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
    var p = loc(O[0], O[1], cc[0]*(wallFx-1.6), cc[1]*(wallFz-1.6), ry);
    CONE(p[0], c.y+wallH*1.35+1.45, p[1], 1.5, rr(3,5), 0, shade(wallCol,-0.15));
    FJ.compound++;
  });

  /* a pair of lantern posts, tucked in just behind the gate — offset well
     clear of the gate arch's own solid box (compound() builds it ~4.4 units
     deep on the inner side of gateLX; anything closer than that sits
     embedded inside it and never renders) */
  [-1,1].forEach(function(s){
    var lp = loc(c.x,c.z, gateLX-6.0, s*wallFz*0.40, ry);
    CYL(lp[0], c.y, lp[1], 0.20, rr(2.4,3.2), 0, shade(wallCol,-0.2), 'wood');
    FJ.compound++;
  });

  /* clan banners: pole + hanging cloth panel, flanking the gate opening.
     Long — reaching almost to the ground from a mount point high on the
     pole — and wide, each banner picking its own BANNERC colour so the two
     flanking a gate can differ and different compounds read as different
     clans. 'cloth' family per API.md's convention: the BOX's y argument
     (base) is the free edge that sways, its height reaches up to the
     mount point (fixed, anchored) — no extra work needed for the sway.
     Offset well clear of the gate arch's own solid box on the outer side
     (~1.8 units past gateLX) so a panel reaching down to the ground doesn't
     end up embedded inside it and invisible. */
  [-1,1].forEach(function(s){
    var bp = loc(c.x,c.z, gateLX+4.0, s*wallFz*0.34, ry);
    var poleH = wallH*1.9;
    CYL(bp[0], c.y, bp[1], 0.14, poleH, 0, shade(wallCol,-0.3), 'wood');
    var mountY = c.y + poleH*0.86;                 /* fixed edge: near the pole top */
    var baseY  = c.y + rr(0.3,0.8);                /* free edge: almost touching the ground */
    var panelH = Math.max(2.5, mountY - baseY);
    var panelW = rr(2.0,2.8);
    BOX(bp[0], baseY, bp[1], 0.16, panelH, panelW, ry, vothPatCol('tapestry', pick(BANNERC)), 'tapestry');
    FJ.compound += 2;
  });

  /* --- the interior garden: now a genuinely clear rectangle (c.x,c.z is
     its own centre, c.fx/c.fz its own half-extents) — dressed as a proper
     garden: a walk in from the gate side, a small paved patio, a well, and
     considerably more planting than a courtyard that might still hold a
     building would have allowed */
  /* stone paving (not plaster) so it reads as a distinct hard surface against
     the plaster lawn patch compound() already laid down underneath it */
  var pLen = c.fx*1.1, pMidLX = c.fx*0.85 - pLen*0.5;
  var pMid = loc(c.x,c.z, pMidLX, 0, ry);
  BOX(pMid[0], c.y+0.05, pMid[1], pLen, 0.12, Math.max(1.6,c.fz*0.14), ry, shade(wallCol,0.10));
  FJ.compound++;

  var patioSign = chance(0.5)?1:-1;
  var patioSize = Math.min(c.fx*0.9, c.fz*0.5)*rr(0.75,1.0);
  var patioP = loc(c.x,c.z, rr(-0.15,0.15)*c.fx, patioSign*c.fz*0.55, ry);
  BOX(patioP[0], c.y+0.05, patioP[1], patioSize, 0.14, patioSize, ry+rr(-0.1,0.1), shade(wallCol,0.16));
  FJ.compound++;

  var wx = c.x + rr(-c.fx*0.55, -c.fx*0.15), wz = c.z + rr(-c.fz*0.5, c.fz*0.5);
  if(claim(wx, wz, 1.6, 1.6, 0, 'facade-well')){
    CYL(wx, c.y, wz, 1.3, 1.1, 0, shade(wallCol,-0.05));
    DOME(wx, c.y+1.1, wz, 0.9, 0.7, 0, shade(wallCol,0.1), 'dome');
    FJ.compound += 2;
  }
  var nPlant = ri(6,10);
  for(var i=0;i<nPlant;i++){
    var px = c.x + rr(-c.fx*0.85, c.fx*0.85), pz = c.z + rr(-c.fz*0.85, c.fz*0.85);
    if(chance(0.40)){
      var th = rr(2.6,4.4);
      STK(px, c.y, pz, rr(0.3,0.5), th, 0, 0x5a4b3a, 'trunk');
      BLOB(px, c.y+th*0.75, pz, rr(1.6,2.6), rr(1.8,2.8), rnd()*3, pick(WILLOWC), 'leaf');
      FJ.compound += 2;
    }else{
      var br = rr(1.0,2.0);
      BLOB(px, c.y-0.2, pz, br, br*0.8, rnd()*3, pick(LEAFC), 'leaf');
      FJ.compound++;
    }
  }
}

COMPOUNDS.forEach(compoundFacade);

window._facade = { instances: bucketTotal() - _facadeStart, town:FJ.town, other:FJ.other, compound:FJ.compound };

/* ============================== reusable props ==============================
   For a LATER placement pass — the planner calls these, this fragment does
   not. Plain function declarations, so they cost nothing here: no rnd() runs
   and no instances are pushed until something actually calls one. Each
   follows structure()/shed()'s own convention — (x, y, z, ry, col, opt) with
   y the base/ground reference — so they drop into a future loop the same way
   structure() and shed() already do. `opt` carries size overrides with
   sensible defaults; `col` may be left falsy to let the function pick its
   own tone. Existing families only (stone default, plus wood/roof/dome/
   metal/cloth as named) — metal and cloth are both otherwise-idle or
   lightly-used buckets, and using them here does not spend anything until
   a future round actually places one of these. ============================== */

/* a small wayside shrine to the Three: a triptych of niches on a shared
   plinth, the centre one taller, rather than one generic box-and-spire */
function shrineTriptych(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 8, d = opt.d || 3.2;
  var c = col || 0x9d9278;
  BOX(x, y, z, w, 0.7, d, ry, shade(c,-0.1));
  var y0 = y+0.7;
  [-1,0,1].forEach(function(n){
    var p = loc(x,z, n*w*0.30, 0, ry);
    var tall = (n===0);
    var nh = tall ? rr(3.4,4.2) : rr(2.3,3.0);
    BOX(p[0], y0, p[1], w*0.24, nh, d*0.7, ry, shade(c, tall?0.06:-0.02));
    FR3(p[0], y0+nh, p[1], w*0.18, tall?rr(2.6,3.6):rr(1.6,2.4), d*0.55, ry, shade(c,0.1));
  });
}

/* an abstract/stylised statue: pedestal plus a suggested robed, heroic
   silhouette — no rigged figures exist in this generator, so the form is
   built from tapered frustums rather than anything articulated */
function statue(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || 5.5, w = opt.w || 1.8;
  var c = col || pick(TONES);
  BOX(x, y, z, w*1.6, 0.9, w*1.6, ry, shade(c,-0.2));
  BOX(x, y+0.9, z, w*1.1, 0.5, w*1.1, ry, shade(c,-0.1));
  var by = y+1.4;
  FR6(x, by, z, w*0.85, h*0.62, w*0.85, ry, shade(c,0.04));             /* robed body */
  CYL(x, by+h*0.62, z, w*0.30, h*0.14, 0, shade(c,0.08));                /* neck block */
  DOME(x, by+h*0.62+h*0.14, z, w*0.22, w*0.26, 0, shade(c,0.12), 'dome');/* abstracted head */
  [-1,1].forEach(function(s){                                            /* suggested arms */
    var p = loc(x,z, s*w*0.42, 0, ry);
    FR8(p[0], by+h*0.20, p[1], w*0.22, h*0.34, w*0.22, ry, shade(c,-0.02));
  });
}

/* a tall tapering obelisk on a plinth — simpler and smaller than the
   Lighthouse canton's tower */
function obelisk(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 4, h = opt.h || 16;
  var c = col || pick(TONES);
  BOX(x, y, z, w*1.3, 1.0, w*1.3, ry, shade(c,-0.15));
  BOX(x, y+1.0, z, w, 0.8, w, ry, shade(c,-0.05));
  FR3(x, y+1.8, z, w*0.62, h, w*0.62, ry, c);
  CONE(x, y+1.8+h, z, w*0.12, w*0.4, ry, shade(c,0.1));
}

/* a street bench — plain and ornate variants */
function benchPlain(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 3.2, d = opt.d || 0.9, h = opt.h || 0.9;
  var c = col || shade(pick(TONES),-0.1);
  BOX(x, y+h*0.45, z, w, h*0.55, d, ry, c, 'wood');
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*w*0.42, 0, ry);
    BOX(p[0], y, p[1], 0.25, h*0.45, d*0.9, ry, shade(c,-0.25));
  });
}
function benchOrnate(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 3.4, d = opt.d || 1.0, h = opt.h || 1.0;
  var c = col || pick(TONES);
  BOX(x, y+h*0.4, z, w, h*0.5, d, ry, c);
  BOX(x, y+h*0.9, z, w*1.04, 0.18, d*1.1, ry, shade(c,0.12));
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*w*0.46, 0, ry);
    BOX(p[0], y, p[1], 0.32, h*0.45, d*1.05, ry, shade(c,-0.22));
    FR3(p[0], y+h*0.9, p[1], 0.5, 0.7, 0.5, ry, shade(c,0.05));
  });
  var backP = loc(x,z, 0, -d*0.42, ry);
  BOX(backP[0], y+h*0.9, backP[1], w*0.96, 1.1, 0.18, ry, shade(c,-0.05));
}

/* a street-lighting brazier — plain and ornate variants; no particle/light
   system exists, so the flame is geometry (a warm-toned cone + blob) on a
   metal-family bowl/stand */
function brazierPlain(x,y,z,ry,col,opt){
  opt = opt || {};
  var r = opt.r || 0.55, h = opt.h || 1.0;
  var mCol = col || 0x6b6258;
  CYL(x, y, z, r*0.22, h*0.8, 0, shade(mCol,-0.2), 'wood');
  CYL(x, y+h*0.8, z, r, h*0.35, 0, mCol, 'metal');
  CONE(x, y+h*0.8+0.1, z, r*0.7, r*1.3, rnd()*3, 0xd9762c);
  BLOB(x, y+h*0.8+r*0.5, z, r*0.5, r*0.7, rnd()*3, 0xe89a3c);
  /* the owner's "streetlights": 68-props.js scatters these along the road
     graph and 69-district-content.js drops more into the districts, and
     NONE of them are in 82-daynight.js's NIGHT_LIGHTS (that list is built
     from layout arrays, not from prop placements). Registering the light
     pool HERE, in the object itself rather than at any call site, is what
     makes every brazier ever placed by anyone light its own stretch of
     street. Radius/amplitude scale with the bowl's own r/h, so the ornate
     variant below genuinely pools wider. */
  nlLampAdd(x, y+h*0.8+r*0.5, z, 0.85*(r/0.55), 15*Math.sqrt(r/0.55));
}
function brazierOrnate(x,y,z,ry,col,opt){
  opt = opt || {};
  var r = opt.r || 0.65, h = opt.h || 1.3;
  var mCol = col || 0x7a6f5c;
  CYL(x, y, z, r*0.20, h*0.85, 0, shade(mCol,-0.25), 'metal');
  CYL(x, y+h*0.3, z, r*0.55, 0.15, 0, shade(mCol,0.1), 'metal');
  CYL(x, y+h*0.85, z, r*1.05, h*0.3, 0, mCol, 'metal');
  FR3(x, y+h*0.85+h*0.3, z, r*1.3, r*0.6, r*1.3, rnd()*3, shade(mCol,-0.1));
  CONE(x, y+h*0.85+0.1, z, r*0.8, r*1.5, rnd()*3, 0xd9762c);
  BLOB(x, y+h*0.85+r*0.6, z, r*0.6, r*0.8, rnd()*3, 0xe89a3c);
  nlLampAdd(x, y+h*0.85+r*0.6, z, 1.15*(r/0.65), 18*Math.sqrt(r/0.65));   /* see brazierPlain above */
}

/* a silt strider boarding station: a raised platform on posts, a stepped
   approach, low rails and a small roofed shelter — meant to read as transit
   infrastructure, not a generic shed */
function siltStriderStation(x,y,z,ry,col,opt){
  opt = opt || {};
  var pw = opt.w || 16, pd = opt.d || 22, ph = opt.h || 3.4;
  var deckCol = col || pick(TONES_POOR);
  var postCol = shade(deckCol,-0.3);
  [[-0.8,-0.8],[-0.8,0.8],[0.8,-0.8],[0.8,0.8],[0,-0.8],[0,0.8]].forEach(function(c2){
    var p = loc(x,z, c2[0]*pw*0.5, c2[1]*pd*0.5, ry);
    CYL(p[0], y-ph, p[1], 0.5, ph, 0, postCol, 'wood');
  });
  BOX(x, y-0.3, z, pw, 0.6, pd, ry, deckCol, 'wood');
  var railH = 1.1;
  [-1,1].forEach(function(s2){
    var p2 = loc(x,z, 0, s2*(pd*0.5-0.15), ry);
    BOX(p2[0], y, p2[1], pw*0.94, railH, 0.3, ry, postCol, 'wood');
  });
  var railP = loc(x,z, pw*0.5-0.15, 0, ry);
  BOX(railP[0], y, railP[1], 0.3, railH, pd*0.94, ry, postCol, 'wood');
  /* a short stepped approach on the open (-x) side, echoing seaStair() */
  var nSteps = 4, rampLen = opt.rampLen || 9, stepLen = rampLen/nSteps;
  for(var i=0;i<nSteps;i++){
    var t = (i+0.5)/nSteps;
    var sx = -pw*0.5 - rampLen*t;
    var sp = loc(x,z, sx, 0, ry);
    BOX(sp[0], y-ph, sp[1], stepLen*1.3, ph*(1-t)+0.4, pw*0.5, ry, deckCol, 'wood');
  }
  /* a small roofed shelter over the back half of the platform */
  var shC = loc(x,z, pw*0.18, 0, ry);
  FR8(shC[0], y+railH+2.4, shC[1], pw*0.68, 1.5, pd*0.68, ry, pick(ROOFS), 'roof');
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c3){
    var p3 = loc(x,z, pw*0.18+c3[0]*pw*0.27, c3[1]*pd*0.27, ry);
    CYL(p3[0], y+railH, p3[1], 0.22, 2.4, 0, postCol, 'wood');
  });
}

/* a small canoe, optionally with a little cloth sail */
function canoe(x,y,z,ry,col,opt){
  opt = opt || {};
  var len = opt.len || 5.5, beam = opt.beam || 1.3;
  var hullCol = col || 0x6b5942;
  var nseg = 4;
  for(var i=0;i<nseg;i++){
    var t = (i+0.5)/nseg, lz = len*(t-0.5);
    var taper = Math.sin(Math.PI*Math.pow(t,0.8));
    var bw = beam*(0.25+0.75*taper);
    var p = loc(x,z, 0, lz, ry);
    FR6(p[0], y, p[1], bw, 0.6, len/nseg*1.15, ry, hullCol, 'wood');
  }
  if(opt.sail){
    var mp = loc(x,z, 0, 0, ry);
    var sailH = opt.sailH || 2.6;
    CYL(mp[0], y+0.5, mp[1], 0.08, sailH, 0, shade(hullCol,-0.2), 'wood');
    BOX(mp[0], y+0.6, mp[1], 0.05, sailH-0.6, beam*0.7, ry, pick(SAILC), 'cloth');
  }
}

/* a ferry: mid-size, flat-bottomed, more substantial than the canoe —
   BARGES in 60-land.js is the scale reference this follows */
function ferry(x,y,z,ry,col,opt){
  opt = opt || {};
  var len = opt.len || 16, beam = opt.beam || 6;
  var hullCol = col || 0x5e4d3a;
  BOX(x, y-1.6, z, beam, 2.6, len, ry, hullCol, 'wood');
  BOX(x, y+0.6, z, beam*0.92, 0.5, len*0.96, ry, shade(hullCol,-0.15), 'wood');
  var cab = loc(x,z, 0, -len*0.22, ry);
  BOX(cab[0], y+1.1, cab[1], beam*0.6, 2.2, len*0.28, ry, shade(hullCol,0.08), 'wood');
  if(opt.mast !== false){
    var mp = loc(x,z, 0, len*0.18, ry);
    var mastH = opt.mastH || 7;
    CYL(mp[0], y+1.1, mp[1], 0.18, mastH, 0, shade(hullCol,-0.2), 'wood');
    BOX(mp[0], y+1.6, mp[1], 0.06, mastH-1, beam*0.55, ry, pick(SAILC), 'cloth');
  }
  for(var k=0;k<(opt.cargo||2);k++){
    var q = loc(x,z, rr(-1,1), len*(0.30+k*0.14), ry);
    BOX(q[0], y+1.1, q[1], rr(1.6,2.4), rr(1.2,2.0), rr(1.6,2.4), ry+rr(-0.3,0.3), pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
  }
}

/* tallShip() — the old European-galleon-silhouette static prop — removed
   per the owner's own request ("this european galleon type vessel
   doesn't really fit dark elves"). Its replacement, a dark-elven junk
   (dark wood hull, sharp bow, lavender battened sails), lives entirely
   in the life layer now (src/78-life.js) — both the ships that sail and
   the ones that just sit at dock use that one model, so there is no
   static prop version to keep in parallel. */

/* ============================== more reusable props: trees & funerary ======
   Round 4 — same deal as the props above: parameterised (x, y, z, ry, col,
   opt) functions, NOT called anywhere in this fragment. No rnd() and no
   BUCKET pushes happen until a future placement pass calls one of these, so
   this section costs nothing this round. Existing families only.

   Two of the seven — cherryBlossom's bloom and funeraryTemple's marble —
   need a colour this palette does not have yet (checked PAL.leaf and every
   neighbouring array, and PAL.stone/PAL.dome, per the brief). Rather than
   approximate with something that doesn't really fit, both take `col` as a
   REQUIRED argument (no internal default) and are documented below with the
   exact PAL addition being asked for. Everything else picks sensible
   defaults from the existing palette exactly like the round-3 props did. */

/* ---- trees, each deliberately NOT a reskin of 70-veg.js's tiered
   STK+CONE ashland tree or its BLOB scrub — read that file first for the
   contrast this is meant to strike. -------------------------------------- */

/* baobab — the opposite silhouette of the generic tree: a hugely swollen,
   tapering trunk carries almost the whole height, with only a small, sparse
   crown of a few thin, spreading branches right at the top. */
function baobab(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(14,22);
  var trunkR = opt.trunkR || h*rr(0.16,0.22);
  var trunkCol = col || pick(TRUNKC);
  /* the swollen mass: a fat squat base tapering into a narrower upper
     trunk — trunk-dominant, not canopy-dominant */
  FR6(x, y, z, trunkR*2.3, h*0.50, trunkR*2.3, ry, trunkCol, 'trunk');
  FR6(x, y+h*0.50, z, trunkR*1.35, h*0.32, trunkR*1.35, ry, shade(trunkCol,0.04), 'trunk');
  var topY = y + h*0.82;
  CYL(x, topY, z, trunkR*0.62, h*0.06, 0, shade(trunkCol,-0.05), 'trunk');
  topY += h*0.06;
  /* a handful of thin, spreading branches with a modest tuft each — never
     a full canopy */
  var nb = opt.branches || ri(4,6);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.3,0.3);
    var reach = trunkR*rr(1.4,2.2);
    var bx = x+Math.cos(a)*reach, bz = z+Math.sin(a)*reach;
    var blen = h*rr(0.10,0.16);
    STK(bx, topY, bz, trunkR*0.12, blen, 0, shade(trunkCol,-0.08), 'trunk');
    BLOB(bx, topY+blen*0.85, bz, rr(1.3,2.1), rr(1.0,1.6), rnd()*3, pick(LEAFC), 'leaf');
  }
}

/* dragon tree (Dracaena-style) — a single trunk forks partway up into
   several upward branches, each capped with a dense, flat-topped rosette:
   tiered and architectural rather than one rounded crown. */
function dragonTree(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(9,15);
  var trunkR = opt.trunkR || rr(0.55,0.85);
  var trunkCol = col || pick(TRUNKC);
  var forkY = y + h*rr(0.42,0.55);
  CYL(x, y, z, trunkR, forkY-y, 0, trunkCol, 'trunk');
  var nb = opt.branches || ri(3,5);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.25,0.25);
    var reach = trunkR*rr(1.3,2.0);
    var bx = x+Math.cos(a)*reach, bz = z+Math.sin(a)*reach;
    var blen = h*rr(0.30,0.46);
    var br = trunkR*rr(0.45,0.65);
    CYL(bx, forkY, bz, br, blen, 0, shade(trunkCol,-0.04), 'trunk');
    var topY = forkY+blen;
    var r1 = rr(2.6,4.2);
    /* a dense, flat-topped rosette — a squashed mound, not a rounded tuft */
    BLOB(bx, topY-0.30, bz, r1, r1*0.32, rnd()*3, pick(LEAFC), 'leaf');
    BLOB(bx, topY+r1*0.10, bz, r1*0.78, r1*0.24, rnd()*3, shade(pick(LEAFC),0.05), 'leaf');
  }
}

/* cherry blossom — slender trunk, wide airy canopy of many small soft
   blobs. NEEDS A NEW PALETTE COLOUR: nothing in PAL reads as blossom pink
   or white (PAL.leaf/fruit/willow are all greens; PAL.banner's pastels are
   yellow/purple/green/blue/brown/orange, no pink). `col` is REQUIRED — pass
   a tone from the requested PAL addition once it exists, e.g.:
     PAL.bloom = [0xf3d6de, 0xecc3cf, 0xf7e6ea, 0xe8b3c2];  // soft pink range
     var BLOOMC = PAL.bloom;
   (proposed in the round-4 report; not added here — palette is read-only). */
function cherryBlossom(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(8,13);
  var trunkR = opt.trunkR || rr(0.28,0.42);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  STK(x, y, z, trunkR, h*0.62, 0, trunkCol, 'trunk');
  var canopyY = y + h*0.55, canopyR = opt.canopyR || h*rr(0.62,0.85);
  var nb = opt.blobs || ri(10,16);
  for(var i=0;i<nb;i++){
    var a = rnd()*Math.PI*2, rdist = Math.sqrt(rnd())*canopyR;
    var bx = x+Math.cos(a)*rdist, bz = z+Math.sin(a)*rdist;
    var by = canopyY + rr(-0.10,0.10)*h + (1-rdist/canopyR)*h*0.12;
    var br = rr(1.1,2.0);
    BLOB(bx, by, bz, br, br*rr(0.55,0.85), rnd()*3, col, 'leaf');
  }
}

/* emperor mushroom — a landmark fungus, not the small decorative mushrooms
   70-veg.js scatters (those top out around an 11-unit stalk and a ~7-13
   unit cap even at the widest far-terrain scale factor). This is roughly
   double that in every dimension, with a distinct gilled underside rim and
   an optional brood of ordinary-scale mushrooms at its foot for contrast. */
function emperorMushroom(x,y,z,ry,col,opt){
  opt = opt || {};
  var stalkH = opt.h || rr(24,36);
  var stalkR = opt.r || rr(2.4,3.8);
  var stalkCol = col || pick(STALKC);
  var capCol = opt.capCol || pick(FUNGC);
  FR6(x, y, z, stalkR*2, stalkH, stalkR*1.5, ry, stalkCol, 'fungus');
  var capR = opt.capR || rr(14,20);
  var capH = capR*rr(0.34,0.46);
  BLOB(x, y+stalkH-capH*0.35, z, capR, capH, rnd()*3, capCol, 'fungus');
  CYL(x, y+stalkH-capH*0.55, z, capR*0.82, capH*0.16, 0, shade(capCol,-0.18), 'fungus');    /* gilled rim */
  if(opt.brood !== false){
    var n = ri(2,4);
    for(var i=0;i<n;i++){
      var a = rnd()*Math.PI*2, dist = stalkR*rr(2.2,4.0);
      var bx = x+Math.cos(a)*dist, bz = z+Math.sin(a)*dist;
      var sh = rr(2.5,4.5), sr = rr(0.4,0.7);
      STK(bx, y, bz, sr, sh, 0, stalkCol, 'fungus');
      var cr = sr*rr(2.6,3.6);
      BLOB(bx, y+sh-0.4, bz, cr, cr*0.55, rnd()*3, capCol, 'fungus');
    }
  }
}

