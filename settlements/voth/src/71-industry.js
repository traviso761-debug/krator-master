/* ============================== 18b. WILDERNESS INDUSTRY ==============================
   Three hand-sited "wilderness industry" set-pieces, requested by the owner:
   a mine entrance clipped into a real hillside, an open stepped quarry pit,
   and a cultivated mushroom farm. Built entirely from families already live
   elsewhere in the build (stone, plaster, roof, wood, fungus, metal) — no
   new draw-call buckets. Each function is reusable (x,z,ry,opt) but this
   fragment calls each exactly once, at a site chosen by querying terrainH()/
   zoneAt()/PLACED directly (see the siting notes on each call below), not a
   guessed coordinate. */
reseed(710001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */

var INDUSTRY = { mine:0, quarry:0, mushroomFarm:0 };

/* ---- caravan delivery points, filled by the two builders below ------------
   Owner: "fishing docks, mines, quarries and taverns should be caravan
   destinations." A merchant caravan is ROAD-BOUND (78-life.js's
   lifeCartBuildLeg routes over the real road graph and lifeCaravanPickDest
   REJECTS anything the graph cannot reach), and neither a mine mouth nor a
   pit floor is a place a cart can stand: the mouth is a portal cut into a
   slope and the pit floor is five benches down. Each builder therefore
   registers the point where a cart is actually loaded — the foot of the ore
   rails, the toe of the haul ramp — instead of the structure's own centre.
   Same builder-fills / 78-life.js-consumes hand-off as GUILD_WORK_POSTS,
   LIFE_RBARGE_DOCKS and LIFE_STRIDER_STATIONS; {x,z,ry} only, no geometry —
   nothing is drawn at these points. ry follows the caravan convention
   (atan2 of the direction the cart should face, so it faces its site). */
var MINE_CART_STOPS = [];
var QUARRY_CART_STOPS = [];

/* ---- shared helper: measure the real local slope/gradient at a point, the
   same finite-difference recipe groundTone() (40-ground.js) already uses for
   its own rock/slope blend, reused here rather than reinvented. Returns the
   *uphill* unit vector and a 0..1-ish slope magnitude. ------------------- */
function siteSlope(x,z){
  var h = terrainH(x,z), st = 9;
  var h1 = terrainH(x+st,z), h2 = terrainH(x,z+st);
  var gx = (h1-h)/st, gz = (h2-h)/st;
  var glen = Math.hypot(gx,gz) || 1e-6;
  return { h:h, gx:gx, gz:gz, upX:gx/glen, upZ:gz/glen, rate:glen, slope:Math.min(1, glen*2.6) };
}


/* ============================== MINE ENTRANCE ==============================
   A timber portal driven into a hillside. Sited by measuring a real slope
   with siteSlope() (same recipe as groundTone()'s own slope term) rather
   than assumed — checked at build time via a headless probe of
   window._api.terrainH before this coordinate was chosen: at (-1830,-90) the
   ground rises monotonically from h=79.3 at the mouth to h=87.9 thirty
   units further along the uphill gradient, a clean real slope (~0.77 by
   groundTone()'s own 0..1 scale), not a noise bump. The tunnel void is
   pushed back along that SAME measured gradient far enough that the rising
   terrain genuinely overtakes its top face — the hill swallows the back
   half by construction, not by eye. */
function mineEntrance(mx, mz, opt){
  opt = opt || {};
  var S = siteSlope(mx,mz);
  var h = S.h;
  /* structure faces downhill — the natural approach to a portal cut into a
     slope — using the same atan2(-dz,dx) convention faceStreet() uses to
     turn a world direction into a ry. */
  var downX = -S.upX, downZ = -S.upZ;
  var ry = opt.ry !== undefined ? opt.ry : Math.atan2(-downZ, downX);

  var portalW = 9.5, portalH = 6.6, frameT = 1.2;
  var footFx = 16, footFz = 13;
  var rec = claim(mx, mz, footFx, footFz, ry, 'industry');
  if(!rec) return null;

  var timberCol = shade(TRUNKC[0], -0.08);
  var stoneCol  = pick(TONES);
  var voidCol   = shade(BASALTC[0], -0.05);

  /* tunnel void: a plain dark recess, driven back (local -x, i.e. uphill)
     far enough that the rise measured by S.rate over that depth exceeds the
     void's own height — the terrain mesh itself then occludes its rear
     portion, which is what "cut into the hill" actually requires. */
  var voidDepth = clamp((portalH*1.35) / Math.max(S.rate, 0.05), 16, 34);
  var voidC = loc(mx,mz, -voidDepth*0.5, 0, ry);
  BOX(voidC[0], h+0.05, voidC[1], voidDepth, portalH*0.94, portalW*0.86, ry, voidCol);

  /* timber portal frame: two posts + a lintel, flush with the void's front
     face (local x=0, the claimed point itself) */
  [-1,1].forEach(function(s){
    var p = loc(mx,mz, frameT*0.5, s*portalW*0.5, ry);
    BOX(p[0], h, p[1], frameT, portalH, frameT, ry, timberCol, 'wood');
  });
  var lp = loc(mx,mz, frameT*0.5, 0, ry);
  BOX(lp[0], h+portalH, lp[1], frameT*1.3, 1.1, portalW+frameT*2, ry, shade(timberCol,-0.12), 'wood');
  BOX(lp[0], h+portalH+1.1, lp[1], frameT*1.7, 1.0, portalW+frameT*3.4, ry, shade(stoneCol,-0.10));  /* stone reinforcing cap */

  /* two raking support posts flanking the mouth, set back and slightly
     shorter — the kit only ever rotates about Y (no true diagonal timber),
     so this reads as bracing by position rather than by tilt */
  [-1,1].forEach(function(s){
    var p2 = loc(mx,mz, -2.4, s*(portalW*0.5+1.5), ry);
    CYL(p2[0], terrainH(p2[0],p2[1]), p2[1], 0.55, portalH*0.80, 0, shade(timberCol,-0.15), 'wood');
  });

  /* ore-cart rails running downhill (local +x) from the mouth, with sleepers */
  var railLen = 20, gauge = 2.0;
  [-1,1].forEach(function(s){
    var rp = loc(mx,mz, railLen*0.5, s*gauge*0.5, ry);
    BOX(rp[0], h+0.05, rp[1], railLen, 0.16, 0.22, ry, 0x565049, 'metal');
  });
  for(var i=0;i<9;i++){
    var t = (i+0.5)/9*railLen;
    var sp = loc(mx,mz, t, 0, ry);
    var sy = terrainH(sp[0],sp[1]);
    BOX(sp[0], sy, sp[1], 0.9, 0.16, gauge+0.8, ry, shade(timberCol,-0.2), 'wood');
  }

  /* a small ore cart, partway down the rails */
  var cp = loc(mx,mz, railLen*0.60, 0, ry);
  var cy = terrainH(cp[0],cp[1]);
  BOX(cp[0], cy+0.55, cp[1], 1.9, 1.0, 1.5, ry, 0x5a544c, 'metal');
  [[-0.8,-0.65],[-0.8,0.65],[0.8,-0.65],[0.8,0.65]].forEach(function(w){
    var wp = loc(cp[0], cp[1], w[0], w[1], ry);
    CYL(wp[0], cy+0.24, wp[1], 0.28, 0.30, 0, 0x2c2a28, 'metal');
  });

  /* winch / pulley beside the mouth — same mast+arm silhouette the mason
     guild's jib crane already uses (50-cantons.js), reused verbatim */
  var wb = loc(mx,mz, 1.6, portalW*0.5+3.6, ry);
  var wy = terrainH(wb[0],wb[1]);
  var winchH = portalH*1.30, armLen = winchH*0.55;
  CYL(wb[0], wy, wb[1], 0.5, winchH, 0, shade(timberCol,-0.2), 'wood');
  var armMid = loc(wb[0], wb[1], -armLen*0.5, 0, ry);
  BOX(armMid[0], wy+winchH*0.90, armMid[1], armLen, 0.42, 0.42, ry, shade(timberCol,-0.2), 'wood');
  CYL(wb[0], wy+winchH*0.55, wb[1], 0.45, 0.7, 0, 0x3a3630, 'metal');   /* winding drum */

  /* spoil heap of loose rubble, opposite the winch */
  var heapC = loc(mx,mz, 3.4, -(portalW*0.5+5.5), ry);
  for(var k=0;k<10;k++){
    var op = loc(heapC[0], heapC[1], rr(-4.5,4.5), rr(-4.5,4.5), ry);
    var bs = rr(1.0,2.5);
    BOX(op[0], terrainH(op[0],op[1]), op[1], bs, bs*rr(0.5,0.9), bs*rr(0.7,1.15), rr(0,Math.PI*2), shade(stoneCol,-0.18));
  }

  /* the cart stop: just past the downhill end of the ore-cart rails, which
     is where a wagon would back up to be loaded off them (the rails run
     local +x for railLen from the mouth). Facing back up at the portal. */
  var stop = loc(mx,mz, railLen+4, 0, ry);
  MINE_CART_STOPS.push({ x:stop[0], z:stop[1], ry: Math.atan2(S.upX, S.upZ), mouthX:mx, mouthZ:mz });

  INDUSTRY.mine++;
  return rec;
}

/* ============================== QUARRY ==============================
   An open-pit quarry: concentric benches terraced down to a working floor,
   a haul ramp spiralling from the floor up and out over the rim, spoil
   banks stepping back down outside it, and the cranes / cut-stone cache /
   rubble staged on the rim and on the floor.

   THE ONE HARD CONSTRAINT, re-recorded because it dictates the whole
   design and because it is what defeated the previous version of this
   function: the terrain is a static heightfield this pass cannot carve.
   terrainH() (10-core.js) is pure procedure, and 75-terrain.js samples it
   once onto a single 400x400 warped grid — measured out at this quarry
   belt that is ~47 world units per cell, so even adding a depression to
   the field could not be resolved at quarry scale. Anything drawn BELOW
   terrainH(x,z) at its own (x,z) is inside an opaque mesh: invisible. A
   literal hole in the ground is impossible here. Two earlier attempts are
   already recorded in this file's history — grounding every tier off one
   shared centre sample (everything but the outer lip buried), and sampling
   terrainH() locally per tier but hanging the bench floor BELOW that
   sample (still a lid, just a locally-measured one). The old fix was to
   drop the floor entirely and ship four stepped retaining walls down the
   fall line: honest, but it reads as a cut in a bank, which is what the
   owner saw ("a little less spectacular than i expected, i was expecting
   more of an open-pit kind of thing").

   What IS possible, and is what this builds: every piece is anchored at
   terrainH(p) + a POSITIVE constant standing height measured at that
   piece's own centre, so no piece can ever be buried (the offset is
   positive by construction; the worst-case corner of a piece is only
   band/2 and half a chord away from its own sample — a few units of
   terrain change against a minimum ~7.8-unit offset). Bench i stands
   i*riser above its own local ground, and the terraces still step
   monotonically UP going outward as long as riser/band beats the local
   ground gradient: 0.78 here against a measured 0.079 / 0.261 / 0.285 at
   the owner's three sites and ~0.22 at the shipped one.

   So the depth of the pit IS the rim's standing height, plus whatever the
   hill itself contributes: the floor is untouched ground at the centre and
   the rim stands ~39 above its own grade, which on the uphill side of a
   0.26 slope puts the rim ~56 above the floor and on the downhill side
   ~22 — an asymmetric amphitheatre, exactly what a hillside pit looks
   like. Because the rim is genuinely raised ground, the haul road cannot
   just walk in at grade: the ramp therefore continues OUT over the rim and
   spirals back down the outside of the spoil bank (three apron terraces
   stepping from the rim back to grade) to a toe the connector road meets.

   Sizing is capped by the owner's own coordinates, not by taste: the three
   new sites are 199.9 / 212.6 / 245.6 units apart, so the whole landform
   has to stay inside ~103 units of radius or two pits merge. Rim radius 66
   (a 132-wide pit, ~186 across including the spoil aprons), floor radius
   15.5, five 10.1-unit benches on 7.9-unit risers. The shipped quarry at
   (-1800,-390) has 217 units of clearance and takes rim 88.

   Draw calls: box|stone, fr6|stone, box|wood, cyl|wood and cyl|metal only
   — every one of those buckets was already spent long before this pass, so
   the redesign costs ZERO new draw calls (the project sits at 59/60). */
function quarryPit(qx, qz, opt){
  opt = opt || {};
  var S = siteSlope(qx,qz);
  var downX = -S.upX, downZ = -S.upZ;
  var ry = opt.ry !== undefined ? opt.ry : Math.atan2(-downZ, downX);

  var R      = opt.rim   || 66;                 /* outer rim radius         */
  var tiers  = opt.tiers || 5;                  /* benches, floor -> rim    */
  var floorR = R*0.235;                         /* working floor radius     */
  var band   = (R - floorR)/tiers;              /* radial width of a bench  */
  var riser  = band*0.78;                       /* step between benches     */
  var rimSt  = tiers*riser;                     /* rim stands this far up   */
  var aprN   = 3, aband = band*0.95;            /* spoil terraces outside   */
  var Rtoe   = R + aprN*aband + band*1.2;       /* where the ramp meets grade */

  /* claim() takes rectangle half-extents and squares them into a
     circumscribing radius (hypot(fx,fz)*1.02), so a genuinely circular
     footprint of radius R is claimed as fx=fz=R/sqrt(2). Only the pit
     proper is claimed — the spoil aprons outside it are loose ground-
     hugging rubble that a neighbour can sit beside quite happily. */
  var rec = claim(qx, qz, R/Math.SQRT2, R/Math.SQRT2, ry, 'industry');
  if(!rec) return null;

  /* the haul ramp's TOE points at the connector road's own gate for this
     site (30-layout.js's quarry road; each call below passes its gate), or
     downhill if there is no road. The rim crossing is that bearing plus
     the outer spiral's own sweep, so the toe lands where it is wanted. */
  var outSweep = 2.0, inSweep = 5.2;
  var toeA  = opt.toeA !== undefined ? opt.toeA : Math.atan2(downZ, downX);
  var rampA = toeA + outSweep;

  var rockCol = pick(TONES);
  function ptAt(r,a){ return [qx + r*Math.cos(a), qz + r*Math.sin(a)]; }
  function angDiff(a,b){ var d=(a-b)%(Math.PI*2); if(d>Math.PI)d-=Math.PI*2; if(d<-Math.PI)d+=Math.PI*2; return d; }
  /* the ramp's angle and standing height at a given radius — one
     continuous profile, spiralling in past the rim and out past it */
  function rampAngleAt(r){
    return r <= R ? rampA + inSweep*(R-r)/(R-floorR)
                  : rampA - outSweep*(r-R)/(Rtoe-R);
  }
  function rampStandAt(r){
    return r <= R ? (r-floorR)/band*riser
                  : rimSt*(1 - (r-R)/(Rtoe-R));
  }

  /* ---- one terrace ring: an annulus of boxes whose tops all stand the
     same amount above their own local ground, cut open where the ramp
     crosses it ------------------------------------------------------- */
  /* a bench top follows the hill, but not the hill's HIGH-FREQUENCY noise:
     terrainH carries a few units of 0.004-frequency wobble out here, and
     sampling it once per segment made each ledge read as a row of
     independently-jostled blocks rather than a cut ledge (seen in the first
     screenshot pass). Five samples over the segment's own footprint average
     that out while keeping the real slope. The average can sit a couple of
     units below the true centre sample, which is why every stand is at
     least one riser (7.9) — the piece still cannot be buried. */
  function smoothH(x,z,r){
    return (terrainH(x,z) + terrainH(x+r,z) + terrainH(x-r,z)
                          + terrainH(x,z+r) + terrainH(x,z-r))/5;
  }
  var talus = [];
  function terrace(ri, ro, stand, col, spallStand, rough){
    var rm = (ri+ro)/2, w = ro-ri;
    var nseg = Math.max(10, Math.round(2*Math.PI*rm/16));
    var chord = 2*Math.PI*rm/nseg;
    var aR = rampAngleAt(rm), half = (w*0.62 + chord*0.5)/rm;
    for(var s=0;s<nseg;s++){
      var a = (s+0.5)/nseg*Math.PI*2;
      if(Math.abs(angDiff(a,aR)) < half) continue;          /* the ramp's own cut */
      /* the spoil aprons OUTSIDE the rim are heaped waste rather than cut
         rock, so they carry a LITTLE irregularity — but only a little.
         A first attempt jittered their height +-38%, their reach, their
         width and their rotation; screenshot review killed it outright:
         at this scale each apron piece is a 10-20 unit block, and jitter
         that size reads as collapsed masonry, not as gravel. The
         difference from the cut benches is carried by tone and by the
         loose rock tipped over them further down instead. */
      var st = rough ? stand*rr(0.92,1.08) : stand;
      var rd = rough ? rm + rr(-w*0.07, w*0.07) : rm;
      var p = ptAt(rd,a), ty = smoothH(p[0],p[1], w*0.5) + st;
      var h = st + w*0.9 + 3;
      BOX(p[0], ty-h, p[1], w*1.03, h, chord*1.10, -a, shade(col, rr(-0.035,0.035)));
      if(s % 3 === 1 && spallStand >= 0){                   /* spall at the riser's foot */
        var q = ptAt(ri - w*0.34, a + rr(-0.06,0.06));
        talus.push([q[0], q[1], rr(1.3,3.1), col, spallStand]);
      }
    }
  }

  /* five benches stepping down into the pit */
  for(var i=tiers;i>=1;i--)
    terrace(floorR+(i-1)*band, floorR+i*band, i*riser, shade(rockCol,-0.04-i*0.035), (i-1)*riser, false);
  /* three spoil terraces stepping back down outside the rim */
  for(var j=1;j<=aprN;j++)
    terrace(R+(j-1)*aband, R+j*aband, rimSt*(1 - j/(aprN+0.55)), shade(rockCol,-0.10-j*0.045), -1, true);
  talus.forEach(function(t){
    BOX(t[0], terrainH(t[0],t[1])+t[4], t[1], t[2], t[2]*rr(0.45,0.85), t[2]*rr(0.7,1.2),
        rnd()*6.283, shade(t[3],-0.14));
  });

  /* ---- the haul ramp itself: a continuous spiral roadbed from the floor
     up through every bench, over the rim and back down the spoil aprons
     to grade. Its own top matches the CONTINUOUS version of the same
     bench profile, so it meets each terrace it crosses at grade. ------ */
  var RN = 34, prevP = null, prevY = 0;
  for(var k=0;k<=RN;k++){
    var rr_ = floorR + (Rtoe-floorR)*k/RN;
    var ar = rampAngleAt(rr_);
    var pr = ptAt(rr_, ar);
    var yr = smoothH(pr[0],pr[1], band*0.5) + rampStandAt(rr_);
    if(prevP){
      var mx_=(pr[0]+prevP[0])/2, mz_=(pr[1]+prevP[1])/2;
      var L = Math.hypot(pr[0]-prevP[0], pr[1]-prevP[1]);
      var segRy = Math.atan2(-(pr[1]-prevP[1]), pr[0]-prevP[0]);
      var yt = (yr+prevY)/2;
      var hh = Math.max(2.5, yt - terrainH(mx_,mz_) + 4);
      BOX(mx_, yt-hh, mz_, L*1.14, hh, band*1.15, segRy, shade(rockCol,-0.01));
      if(k % 2 === 0){                                      /* kerb of spoil, open side */
        var ke = [mx_ + Math.cos(ar)*band*0.68, mz_ + Math.sin(ar)*band*0.68];
        BOX(ke[0], yt, ke[1], L*0.92, rr(1.0,2.0), 1.7, segRy, shade(rockCol,-0.24));
      }
    }
    prevP = pr; prevY = yr;
  }

  /* ---- the working floor: real, untouched ground, dressed with cut pads,
     blast rubble and two unquarried blocks left standing for scale ---- */
  for(var f=0;f<4;f++){
    var fa = f/4*Math.PI*2 + 0.4, fp = ptAt(floorR*0.55, fa);
    BOX(fp[0], terrainH(fp[0],fp[1])-0.3, fp[1], floorR*0.85, 0.5, floorR*0.85, -fa, shade(rockCol,0.05));
  }
  for(var rb=0;rb<12;rb++){
    var ra_ = rnd()*Math.PI*2, rp = ptAt(rr(2, floorR*0.95), ra_), rs = rr(0.9,2.4);
    BOX(rp[0], terrainH(rp[0],rp[1]), rp[1], rs, rs*rr(0.5,0.95), rs*rr(0.7,1.2),
        rnd()*6.283, shade(rockCol,-0.16));
  }
  [[0.58,1.9],[0.64,4.4]].forEach(function(b){
    var bp = ptAt(floorR*b[0], b[1]), by = terrainH(bp[0],bp[1]);
    FR6(bp[0], by, bp[1], 7.0, riser*1.45, 6.2, b[1], shade(rockCol,-0.06));
    BOX(bp[0], by+riser*1.40, bp[1], 5.8, 1.3, 5.0, b[1], shade(rockCol,-0.12));
  });

  /* loose rock tipped over the spoil aprons, so the outside of the rim
     reads as waste ground rather than as more masonry */
  for(var sw=0;sw<22;sw++){
    var sa2 = rnd()*Math.PI*2;
    if(Math.abs(angDiff(sa2, rampA - outSweep*0.5)) < 0.4) continue;
    var sp2 = ptAt(R + rr(2, aprN*aband), sa2), ss = rr(1.6,4.2);
    BOX(sp2[0], smoothH(sp2[0],sp2[1],aband*0.5) + rimSt*rr(0.10,0.55), sp2[1],
        ss, ss*rr(0.45,0.85), ss*rr(0.7,1.2), rnd()*6.283, shade(rockCol,-0.24));
  }

  /* ---- waste tips further out, downhill of the pit ------------------- */
  for(var tp=0;tp<3;tp++){
    var ta = Math.atan2(downZ,downX) + (tp-1)*0.66;
    var tpp = ptAt(Rtoe + rr(12,30), ta);
    /* deliberately low and broad: at rr(24,36) wide by rr(10,17) tall these
       read as sheared monoliths dropped on the grass rather than as tipped
       waste (screenshot review) — a spoil heap is a wide, shallow cone */
    FR6(tpp[0], terrainH(tpp[0],tpp[1])-2.5, tpp[1], rr(38,56), rr(6,11), rr(32,48), -ta, shade(rockCol,-0.13));
    for(var tq=0;tq<3;tq++){
      var tqq = ptAt(Rtoe + rr(4,40), ta + rr(-0.3,0.3)), ts = rr(2.2,4.8);
      BOX(tqq[0], terrainH(tqq[0],tqq[1]), tqq[1], ts, ts*rr(0.5,0.9), ts*rr(0.7,1.2),
          rnd()*6.283, shade(rockCol,-0.2));
    }
  }

  /* ---- rim and floor works: jib cranes (the same mast+arm silhouette the
     mason guild's crane and the mine's winch already use), the cut-stone
     cache, a cart, a timber stack ------------------------------------- */
  function jib(px,pz,baseY,faceRy,craneH){
    CYL(px, baseY, pz, 0.85, craneH, 0, shade(TRUNKC[0],-0.2), 'wood');
    var am = [px + Math.cos(faceRy)*craneH*0.42, pz - Math.sin(faceRy)*craneH*0.42];
    BOX(am[0], baseY+craneH*0.92, am[1], craneH*0.85, 0.55, 0.55, faceRy, shade(TRUNKC[0],-0.2), 'wood');
    CYL(px, baseY+craneH*0.52, pz, 0.5, 0.8, 0, 0x3a3630, 'metal');
  }
  var rimR = R - band*0.5;                       /* centre of the rim bench */
  [0.42,-0.46].forEach(function(off,ci){
    var cp = ptAt(rimR, rampA + off);
    jib(cp[0], cp[1], terrainH(cp[0],cp[1])+rimSt, -(rampA+off+Math.PI), ci?16:19);
  });
  var bp0 = ptAt(rimR, rampA + 0.86), b0y = terrainH(bp0[0],bp0[1]) + rimSt;
  for(var r2=0;r2<3;r2++) for(var c2=0;c2<4;c2++){
    var ob = [bp0[0] + Math.cos(rampA)*(r2*3.0-3.0) + Math.cos(rampA+1.5708)*(c2*2.7-4.0),
              bp0[1] + Math.sin(rampA)*(r2*3.0-3.0) + Math.sin(rampA+1.5708)*(c2*2.7-4.0)];
    BOX(ob[0], b0y, ob[1], 2.6, 1.9, 2.2, -rampA, pick(STALKC));
  }
  var kp = ptAt(rimR, rampA - 0.90), ky = terrainH(kp[0],kp[1]) + rimSt;
  BOX(kp[0], ky+0.7, kp[1], 3.4, 1.4, 2.2, -rampA, 0x5a544c, 'metal');
  [[-1.3,-0.95],[-1.3,0.95],[1.3,-0.95],[1.3,0.95]].forEach(function(w){
    var wp = [kp[0] + Math.cos(rampA)*w[0] + Math.cos(rampA+1.5708)*w[1],
              kp[1] + Math.sin(rampA)*w[0] + Math.sin(rampA+1.5708)*w[1]];
    CYL(wp[0], ky+0.3, wp[1], 0.42, 0.34, 0, 0x2c2a28, 'metal');
  });
  var footA = rampAngleAt(floorR), fp2 = ptAt(floorR*0.78, footA);
  jib(fp2[0], fp2[1], terrainH(fp2[0],fp2[1]), -(footA+Math.PI), 13);
  for(var tk=0;tk<5;tk++){
    var tkp = ptAt(floorR*0.70, footA + 0.55 + tk*0.11);
    BOX(tkp[0], terrainH(tkp[0],tkp[1])+(tk%2)*0.55, tkp[1], 6.5, 0.5, 0.5, -footA,
        shade(TRUNKC[0],-0.14), 'wood');
  }

  /* the cart stop: the haul ramp's own TOE, where the ramp finally meets
     grade (Rtoe, at the toe bearing the caller aimed at its road gate) —
     i.e. the exact point the connector road was built to reach, pushed 8
     units further out so the cart stands clear of the ramp's last slab.
     Facing back in at the pit. */
  var toeP = ptAt(Rtoe + 8, toeA);
  QUARRY_CART_STOPS.push({ x:toeP[0], z:toeP[1],
                           ry: Math.atan2(-Math.cos(toeA), -Math.sin(toeA)), pitX:qx, pitZ:qz });

  INDUSTRY.quarry++;
  return rec;
}

/* ============================== MUSHROOM FARM ==============================
   A cultivated plot of mid-size fungus specimens in rows, leaning on the
   existing giant-fungus vocabulary (STK+BLOB, 'fungus' family) 70-veg.js's
   own plant() and 65-facade.js's emperorMushroom() already use, scaled
   between those two (bigger and more uniform than wild scatter, well short
   of "landmark") so the rows read as tended rather than wild growth.
   Sited at (1230,1800): zoneAt === 'farm', slope ~0.10, 90 units clear of
   the nearest real farmstead (visible companion, not overlapping it), 471
   units from the river's own polyline — damp bottomland, not a hilltop. */
function mushroomFarm(fx0, fz0, ry, opt){
  opt = opt || {};
  var y = terrainH(fx0,fz0);
  var rows = 4, cols = 5, spacing = 5.4;
  var plotFx = (cols-1)*spacing*0.5 + 3.5, plotFz = (rows-1)*spacing*0.5 + 3.5;

  var rec = claim(fx0, fz0, plotFx+9, plotFz+9, ry, 'industry');
  if(!rec) return null;

  var stalkCol = pick(STALKC), fenceCol = shade(TRUNKC[0], -0.1);

  /* rows of cultivated specimens */
  var n = 0;
  for(var r=0;r<rows;r++){
    for(var c=0;c<cols;c++){
      var lx = -plotFx+3.5 + c*spacing + rr(-0.7,0.7);
      var lz = -plotFz+3.5 + r*spacing + rr(-0.7,0.7);
      var p = loc(fx0,fz0, lx, lz, ry);
      var py = terrainH(p[0],p[1]);
      var sh = rr(2.8,4.8), sr = rr(0.34,0.52);
      STK(p[0], py, p[1], sr, sh, 0, stalkCol, 'fungus');
      var cr = sr*rr(2.6,3.4);
      BLOB(p[0], py+sh-0.4, p[1], cr, cr*rr(0.52,0.76), rnd()*3, pick(FUNGC), 'fungus');
      n++;
    }
  }

  /* three drying racks along the near edge: two posts + a crossbeam,
     the same post+beam vocabulary the mason guild's scaffold uses */
  for(var k=0;k<3;k++){
    var rz = -plotFz + 5 + k*7.5;
    var pA = loc(fx0,fz0, plotFx+2.2, rz-1.6, ry), pB = loc(fx0,fz0, plotFx+2.2, rz+1.6, ry);
    var ry_ = terrainH(pA[0],pA[1]);
    CYL(pA[0], ry_, pA[1], 0.22, 2.6, 0, fenceCol, 'wood');
    CYL(pB[0], ry_, pB[1], 0.22, 2.6, 0, fenceCol, 'wood');
    BOX((pA[0]+pB[0])/2, ry_+2.5, (pA[1]+pB[1])/2, 0.5, 0.22, 3.6, ry, fenceCol, 'wood');
  }

  /* tender's hut, facing back onto the plot */
  var hp = loc(fx0,fz0, plotFx+8.5, 0, ry);
  var hy = terrainH(hp[0],hp[1]);
  structure(hp[0], hy, hp[1], 3.0, 2.6, 4.0, ry+Math.PI, 'hovel', pick(TONES_POOR), {poor:true});
  var dp = loc(hp[0], hp[1], -3.0, 0, ry+Math.PI);
  BOX(dp[0], hy, dp[1], 0.3, 2.2, 1.3, ry+Math.PI, shade(fenceCol,-0.3), 'wood');

  /* low perimeter fence: 8 posts + straight rails between consecutive posts */
  var corners = [
    [-plotFx,-plotFz],[0,-plotFz],[plotFx,-plotFz],
    [plotFx,0],[plotFx,plotFz],[0,plotFz],[-plotFx,plotFz],[-plotFx,0]
  ];
  var wp = corners.map(function(o){ return loc(fx0,fz0, o[0], o[1], ry); });
  for(var i=0;i<wp.length;i++){
    var py2 = terrainH(wp[i][0], wp[i][1]);
    CYL(wp[i][0], py2, wp[i][1], 0.16, 1.5, 0, fenceCol, 'wood');
    var j = (i+1) % wp.length;
    var mx2 = (wp[i][0]+wp[j][0])/2, mz2 = (wp[i][1]+wp[j][1])/2;
    var segLen = Math.hypot(wp[j][0]-wp[i][0], wp[j][1]-wp[i][1]);
    var segRy = Math.atan2(-(wp[j][1]-wp[i][1]), wp[j][0]-wp[i][0]);
    var my2 = terrainH(mx2,mz2);
    BOX(mx2, my2+1.1, mz2, segLen*0.98, 0.16, 0.16, segRy, fenceCol, 'wood');
  }

  INDUSTRY.mushroomFarm = n;
  return rec;
}

/* ---- placements: one instance of each, at the real sites noted above ---- */
mineEntrance(-1830, -90, {});
/* owner: "remove quarry at [[-2025.6,-396.1],[-1719.1,-205.1],
   [-1529.1,-472.5],[-1813.7,-686.2]]" — the original shipped quarry stood at
   (-1800,-390), the only one of the four inside that polygon (checked by
   point-in-polygon against all four sites; the owner's own three, at
   x=2547..2758, are well outside and untouched). Removed rather than moved:
   the request was to remove it, and the three sites the owner sited himself
   now carry the city's stone supply.
   quarryPit() itself is untouched and still called for those three — this
   was the last user of its larger `rim:88` variant, which stays supported
   for any future site with the 217 units of clearance this one had. */
/* farm faces the real farmstead 90 units away (see siting note above) so the
   plot reads as tended ground beside a working farm, not an isolated patch */
mushroomFarm(1230, 1800, Math.atan2(-(1756.96-1800), 1150.45-1230), {});

/* owner: "fill some of the empty space here with the mushroom farm
   model... populate empty space in this area with a mix of stone and
   plaster town buildings" — INFILL_D (the polygon) and
   scatterTownBuildings() are both 69-district-content.js's own (that
   fragment loads before this one, so both are already fully assigned/
   declared here — safe either way, since scatterTownBuildings is a
   hoisted function declaration and INFILL_D's own var assignment has
   already run by this point in real load order). The farm goes down
   FIRST (claim()-gated, same as mineEntrance/quarryPit above) so the
   building scatter right after it never lands on top of the plot. */
(function(){
  var bD = polyBounds(INFILL_D);
  var ns = nearestStreet(bD.cx, bD.cz);
  var mry = ns ? Math.atan2(ns.tangent[0], ns.tangent[1]) : 0;
  var farm = mushroomFarm(bD.cx, bD.cz, mry, {});
  var built = scatterTownBuildings(INFILL_D, 9, 0.5);
  window._infillD = { farmPlaced: !!farm, buildings: built };
})();

/* owner: "put about 70% density of mushroom farms here. do anti-overlap
   pass." — same fill-fraction-over-a-real-grid convention as graves/
   chinampas/farm fields elsewhere this session (API.md §9 territory):
   a real grid of candidate slots, pitched a bit wider than
   mushroomFarm()'s own true footprint (~44x42, claim()-gated inside the
   function itself), each rolled at the owner's own 70% — claim() is the
   actual anti-overlap guarantee (a slot that collides with an already-
   placed farm, or anything else, is silently skipped, never forced). */
var INFILL_G = [[2112.0,-1206.4],[2303.3,-1199.1],[2276.4,-904.1],[2103.7,-602.4],
  [2048.1,-174.6],[1867.9,-143.9],[1827.7,-374.2],[1809.0,-653.4],[1982.8,-804.0]];
(function(){
  var bG = polyBounds(INFILL_G);
  var pitch = 48, placed = 0, tried = 0;
  for(var gx=bG.x0; gx<bG.x1; gx+=pitch){
    for(var gz=bG.z0; gz<bG.z1; gz+=pitch){
      var x = gx+rr(0,pitch*0.4), z = gz+rr(0,pitch*0.4);
      if(!pointInPoly(x,z,INFILL_G)) continue;
      if(districtAt(x,z)) continue;
      if(terrainH(x,z) < 4) continue;
      tried++;
      if(!chance(0.70)) continue;
      var nsG = nearestStreet(x,z);
      var ryG = nsG ? Math.atan2(nsG.tangent[0], nsG.tangent[1]) : rnd()*Math.PI*2;
      if(mushroomFarm(x, z, ryG, {})) placed++;
    }
  }
  window._infillG = { placed: placed, tried: tried };
})();

/* owner: "deploy 4 mine entrances in an arc around here [polygon]... make
   sure entrance is properly sticking out of the hillside." mineEntrance()
   already self-sites its own facing (downhill, via siteSlope() inside
   the function) and only ever rotates about Y (so the door stays
   upright/parallel to the XZ plane by construction — nothing in this
   kit can pitch or roll it) — the owner's own tolerance note is already
   satisfied by the existing function, nothing extra needed there.
   Picked live off the polygon's own centroid (2411.76,-1536.55): a real
   ring-scan (terrainH + the same finite-difference slope siteSlope()
   itself uses) found a genuinely sloped ~150-degree arc at r=220 on the
   polygon's own east side (angles 315-90, i.e. wrapping through 0),
   heights 62-168, slope rate 0.47-0.86 — not flat ground, not a cliff.
   4 evenly-spaced points off that arc, ~168 units apart (comfortably
   clear of a mine mouth's own ~16x13 footprint, checked via
   mineEntrance()'s own claim() call too). */
/* the 0-degree/east point was originally r=220 (2632,-1537) — its own
   winch/rail/spoil-heap detail pushed a few instances past
   verify.py's built-inside-limit threshold (CITY_LIM+300=2580 on
   max(|x|,|z|); 2632 alone already cleared it before any detail
   offset). Pulled to r=130 on the same bearing (2542,-1537) instead —
   still a real, checked slope there (interpolating the same live probe:
   rate~0.8 between the r=100 and r=160 samples), comfortably under the
   limit including its own detail spread. */
/* owner: "remove these mines [[2422.2,-1399.5],[2588.0,-1423.4],
   [2756.2,-1223.3],[2417.8,-1242.3],[2387.1,-1339.4]]" — checked which of
   the arc mines actually fall inside that polygon (real point-in-polygon
   test, not eyeballed): (2567,-1381), (2412,-1317), and (2433.5,-1373.3)
   are inside it; the rest of both arcs are not. Those 3 are simply
   dropped from the two lists below rather than left in and hidden. */
[[2567,-1692],[2542,-1537]].forEach(function(p){
  mineEntrance(p[0], p[1], {});
});

[[2453.5,-1708.3],[2396.3,-1556.2],[2385.0,-1442.0]].forEach(function(p){
  mineEntrance(p[0], p[1], {});
});

/* owner: "fill with mushroom farms to 70% density here, then do overlap
   check" (x3 polygons) — same grid+chance()+claim() convention as
   INFILL_G above, factored into a reusable helper this time since it's
   now used 3 more times. claim() (inside mushroomFarm() itself) IS the
   overlap check — a colliding candidate is silently skipped, never
   forced; window._mushroomFill's placed/tried counts are the honest
   record of how many actually cleared it. */
function mushroomDensityFill(poly, density){
  var b = polyBounds(poly);
  var pitch = 48, placed = 0, tried = 0;
  for(var gx=b.x0; gx<b.x1; gx+=pitch){
    for(var gz=b.z0; gz<b.z1; gz+=pitch){
      var x = gx+rr(0,pitch*0.4), z = gz+rr(0,pitch*0.4);
      if(!pointInPoly(x,z,poly)) continue;
      if(districtAt(x,z)) continue;
      if(terrainH(x,z) < 4) continue;
      tried++;
      if(!chance(density)) continue;
      var ns = nearestStreet(x,z);
      var ry = ns ? Math.atan2(ns.tangent[0], ns.tangent[1]) : rnd()*Math.PI*2;
      if(mushroomFarm(x, z, ry, {})) placed++;
    }
  }
  return { placed: placed, tried: tried };
}
var MUSH_POLY_H = [[2111.2,-1082.8],[2189.6,-978.4],[2090.9,-779.5],[2014.2,-737.7],[1960.2,-688.4],
  [1927.7,-608.6],[1898.9,-501.2],[1909.8,-396.0],[1925.2,-304.3],[1939.7,-194.0],[1850.3,-200.6],
  [1857.2,-321.6],[1829.9,-385.3],[1813.1,-474.9],[1804.0,-554.1],[1792.2,-583.0],[1894.5,-736.0],[1980.2,-839.7]];
var MUSH_POLY_I = [[1931.0,1429.4],[2262.5,1398.7],[2528.8,1413.8],[2653.6,1628.0],[2599.6,1652.2],
  [2291.0,1610.4],[2127.0,1560.2]];
var MUSH_POLY_J = [[1917.8,1701.3],[1854.8,1787.0],[1698.9,1690.8],[1516.3,1534.8],[1528.3,1481.2]];
window._mushroomFillH = mushroomDensityFill(MUSH_POLY_H, 0.70);
window._mushroomFillI = mushroomDensityFill(MUSH_POLY_I, 0.70);
window._mushroomFillJ = mushroomDensityFill(MUSH_POLY_J, 0.70);

/* owner: "also add a few in the abbey compound" — the compound's own
   centre/half-extents/facing (61-monastery.js's final call, unchanged
   this session: x=-1289.5,z=-429.7,fx=145,fz=120, ry=faceToward the
   Temple canton). A handful of interior local-offset candidates, well
   clear of the known building cluster (chapel/dorms/well/warehouse/hall
   all sit at specific local offsets there) — claim() is what actually
   keeps these off the existing buildings/fields either way, so a
   near-miss here just silently fails rather than overlapping anything. */
(function(){
  var acx=-1289.5, acz=-429.7, ary=-0.3804488853624944;
  /* first attempt (60,-90 / 100,70 / -60,95 / 30,105) landed 0/4 — the
     compound's own 10 field slots plus the building cluster already
     fill most of the interior fairly tightly; these 3 are deliberately
     picked in the real gaps BETWEEN adjacent field slots instead
     (checked against every field/building's own known local position),
     not a blind retry. */
  var spots = [[-120,-50],[110,-20],[70,108]];
  var placed = 0;
  spots.forEach(function(s){
    var p = loc(acx,acz, s[0], s[1], ary);
    var ns = nearestStreet(p[0],p[1]);
    var ry2 = ns ? Math.atan2(ns.tangent[0], ns.tangent[1]) : ary;
    if(mushroomFarm(p[0], p[1], ry2, {})) placed++;
  });
  window._mushroomFillAbbey = { placed: placed, tried: spots.length };
})();

/* ============================== QUARRY LABORER SETTLEMENTS ==============================
   Owner, originally: "place quarries at these coordinates [...], check that
   the interface/clip into hill ok, build roads connecting them and the
   nearest major highway, then add 4 plaster buildings for quarry laborers
   per quarry. each has 4 quarrymen. they go to work at the quarry at
   sunrise and return to these houses at sunset. make sure they have an
   APPROPRIATE number of windows and doors."

   Owner, this pass: "can you move them to [[2758.5,-715.3],[2547.4,-840.9],
   [2728.4,-925.8]]?" — a real relocation right across the map (the previous
   three sat at POSITIVE z, 766..1195; these are all at negative z). These
   are the literal coordinates the owner asked for and they are used as
   given. An earlier pass pulled an earlier set of coordinates inward
   because two of them broke verify.py's built-inside-limit invariant
   (max(|x|,|z|) > CITY_LIM+300 = 2580); 2758.5 and 2728.4 break it the
   same way and 2547.4 does not. They are NOT nudged this time — the owner
   has now re-specified where they want them, so the invariant is taught
   about them instead, exactly the way the far-flung silhouette shrine
   (69-district-content.js, SILHOUETTE_SHRINES) already is: every quarry
   pit and every laborer house records an exemption disc in QUARRY_EXEMPT
   below, 85-probe.js hands that to window._api, and verify.py's invariant
   #7 carries one more line alongside its FARMS/MANORS/SILHOUETTE_SHRINES
   checks. Each disc carries its OWN radius rather than one shared constant,
   so a pit (rim 66 + spoil aprons + waste tips, measured — 150) and a
   laborer house (38) are each exempted at their real size instead of
   blanketing the hillside at the larger of the two.

   Checked live at all three before building (window._api, real probes):
   zoneAt 'none' at every one, terrainH 152.0 / 155.2 / 127.1, siteSlope
   rates 0.261 / 0.079 / 0.285, all dry (landDist 851 / 613 / 528, inRiver
   false), nearest already-PLACED footprint 471 / 306 / 478 units off. They
   are 199.9 / 212.6 / 245.6 units apart from each other, which is what caps
   quarryPit()'s own rim radius at 66 here (see its sizing note).

   The connector road (30-layout.js, in ROADS and before that file's section
   5g, exactly where the old quarry road was) threads the nearest MAJOR road
   — a 'highway', found live by real point-on-segment distance, not
   vertex-only — through the corridors between the three pits. Each site's
   own gate vertex on that road is repeated here so the haul ramp's toe can
   be aimed at it; the two files' numbers have to agree, so they are stated
   once in each with this note. */
reseed(710501);
var QUARRY_SITES = [
  /* gx/gz: this site's own gate vertex on the quarry road (30-layout.js) */
  { x:2758.5, z:-715.3, gx:2743.5, gz:-820.6 },
  { x:2547.4, z:-840.9, gx:2654.8, gz:-829.7 },
  { x:2728.4, z:-925.8, gx:2743.5, gz:-820.6 }
];
/* discs verify.py's built-inside-limit invariant is allowed to forgive,
   each [x, z, radius] — one per pit, one per laborer house (pushed below
   as each house actually lands). Exported by 85-probe.js. */
var QUARRY_EXEMPT = [];
var QUARRY_LABORER_HOUSES = [];   /* consumed by 78-life.js's quarry-laborer commute section */
QUARRY_SITES.forEach(function(site){
  /* the haul ramp's toe is aimed at this site's own road gate, so the
     cart road arrives at the foot of the ramp instead of at a blank
     spoil bank (quarryPit() spirals the rim crossing back from it) */
  var rec = quarryPit(site.x, site.z, { toeA: Math.atan2(site.gz-site.z, site.gx-site.x) });
  site.built = !!rec;
  QUARRY_EXEMPT.push([site.x, site.z, 150]);   /* pit + spoil aprons + waste tips, measured */

  /* 4 plaster laborer houses per quarry: a short walk out from the pit's
     own footprint (quarryPit's own claim() radius is rim*1.02 = 67 at
     these params, with loose spoil out to ~107) but close enough to read
     as this quarry's own settlement —
     same annulus-scatter convention scatterNear() (69-district-content.js)
     uses, done inline here so each placed record's own front-door position
     can be captured for the commute wiring below (scatterNear/townBuilding
     only ever return a boolean, never the record). wealthy=false
     throughout — poor/plaster construction, per the owner ("4 plaster
     buildings"); townFacade()'s existing plaster pass (65-facade.js)
     already guarantees every such building real windows/doors/a chimney,
     checked visually below rather than assumed.

     Radius band 130-270, and the openAt() gate that the previous (positive-z)
     version of this block used is deliberately NOT applied here. openAt()
     is maskAt()>200, and 40-ground.js paints the mask BLACK for every
     point with |x|>CITY_LIM or |z|>CITY_LIM (2280) — so out at x=2547..2758
     openAt() is false by construction, everywhere, at every radius. Probed
     live to be sure before changing anything: 0 of 72 ring samples open at
     r=160/200/240/280/320 around sites 1 and 3, and 7-13 of 72 around site
     2 (only the sliver that reaches back across x=2280). Keeping openAt()
     here would place zero houses, not four. What it was standing in for out
     in open wilderness is covered by the checks that remain — districtAt(),
     dry land, the river, and townBuilding()'s own footing()-slope reject
     plus claim() — and a live sweep of those over the same rings returns
     essentially the whole circle (72/72 at r=140..300 on all three sites),
     so the band is set by what reads as a settlement rather than by what
     is merely available: outside the pit's claim (rim*1.02 = 67) and its
     spoil aprons, close enough to still be this quarry's own village. */
  var houses = [], tries = 0, maxTries = 4*220;
  while(houses.length < 4 && tries < maxTries){
    tries++;
    var a = rnd()*Math.PI*2, r = rr(130, 270);
    var hx = site.x + Math.cos(a)*r, hz = site.z + Math.sin(a)*r;
    if(districtAt(hx,hz)) continue;
    if(terrainH(hx,hz) < 4) continue;
    if(inRiver(hx,hz,14)) continue;
    /* real bug, caught by a second live run: the three sites are only
       199.9-245.6 apart and the houses reach 270 out, so a house scattered
       around quarry 1 can land squarely on quarry 3's own (not yet built)
       site — and since claim() is first-come, the HOUSE wins and the PIT
       fails to build. Keep every candidate clear of every quarry centre,
       not just its own. 115 = the pit's claim radius (67) plus a house's
       own (~12) plus room for the spoil aprons. */
    if(QUARRY_SITES.some(function(q){ return Math.hypot(hx-q.x, hz-q.z) < 115; })) continue;
    if(!townBuilding(hx, hz, false, false)) continue;
    var hrec = PLACED[PLACED.length-1];
    /* townFacade() (65-facade.js) is what actually gives every OTHER town
       building its doors/windows/chimney — but it only ever runs once, as
       a PLACED.forEach() pass at 65-facade.js's own load time, which is
       BEFORE this fragment (71) exists — so a building claimed here would
       never pass through it and would stand as a blank-walled box (the
       exact already-documented failure mode addDoor()/addWindows() exist
       to patch for the OTHER late/direct callers in that same file).
       townFacade() itself is a plain function of the PLACED record (reads
       p.x/z/ry/fx0/fz0/yb/h/kind/col/poor plus that file's own
       FACADE/FJ/PLASTER_STAT globals, all already initialised by now) —
       calling it here, once per new house, reuses the exact SAME facade
       logic (including the plaster pass's guaranteed windows+chimney and
       its own canopy roll — that logic itself is untouched, just invoked)
       rather than re-deriving any of it. */
    townFacade(hrec);
    /* front-door point: same loc(o.x,o.z,o.fx,0,o.ry) formula LIFE_DOORS
       itself uses (78-life.js) for every other town building's own door,
       so this laborer's commute walks to/from exactly where the building's
       real front face is, not an approximation of it. */
    var dp = loc(hrec.x, hrec.z, hrec.fx, 0, hrec.ry);
    houses.push({ x:hrec.x, z:hrec.z, doorX:dp[0], doorZ:dp[1], ry:hrec.ry,
                  quarryX:site.x, quarryZ:site.z });
    QUARRY_EXEMPT.push([hrec.x, hrec.z, 38]);   /* house + its own facade spread */
  }
  site.housesPlaced = houses.length;
  houses.forEach(function(h){ QUARRY_LABORER_HOUSES.push(h); });
});
window._quarryLaborers = {
  sites: QUARRY_SITES.map(function(s){ return {x:s.x,z:s.z,built:s.built,housesPlaced:s.housesPlaced}; }),
  totalHouses: QUARRY_LABORER_HOUSES.length,
  exemptDiscs: QUARRY_EXEMPT.length
};
window._quarryExempt = QUARRY_EXEMPT;

/* diagnostic: the caravan delivery points this fragment publishes for
   78-life.js (see MINE_CART_STOPS/QUARRY_CART_STOPS at the top of the file) */
window._industryCartStops = { mine: MINE_CART_STOPS, quarry: QUARRY_CART_STOPS };

window._industry = INDUSTRY;
